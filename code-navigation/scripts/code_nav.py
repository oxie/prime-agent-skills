#!/usr/bin/env python3
"""Bounded, local structural code navigation. No target-project code is run."""
import argparse
import ctypes
import errno
import fcntl
import hashlib
import json
import os
from pathlib import Path
import resource
import selectors
import shutil
import signal
import stat
import subprocess
import sys
import time

VERSION = '2'
CACHE_ROOT_VERSION = '1'
COMMIT = '3a85a2f40e283ac0c9b617d9a4bead18d73c3c70'
RUNTIME = Path('/home/prime-agent/.local/share/prime-agent/graft-tools/upstream')
PATCH = Path(__file__).resolve().parents[1] / 'patches/named-import-calls.patch'
MAX_CACHE_BYTES = 256 * 1024 * 1024


class Refusal(Exception):
    pass


def digest(data):
    return hashlib.sha256(data).hexdigest()


def no_symlinks(path):
    path = Path(path)
    if not path.is_absolute() or '..' in path.parts:
        raise Refusal('path must be absolute and contain no traversal')
    for part in [*reversed(path.parents), path]:
        if part.is_symlink():
            raise Refusal(f'symlinked control path: {part}')
    return path


def private(path, directory=True):
    no_symlinks(path)
    s = path.stat()
    if s.st_uid != os.getuid() or stat.S_IMODE(s.st_mode) & 0o077:
        raise Refusal(f'cache must be owned by this user and private: {path}')
    if directory != stat.S_ISDIR(s.st_mode) or (not directory and not stat.S_ISREG(s.st_mode)):
        raise Refusal(f'unexpected cache file type: {path}')
    if not directory and s.st_nlink != 1:
        raise Refusal(f'hard-linked control file: {path}')


def read_json(path):
    if path.stat().st_size > MAX_CACHE_BYTES:
        raise Refusal('JSON file exceeds size bound')
    value = json.loads(path.read_text(encoding='utf-8'))
    if not isinstance(value, dict):
        raise Refusal(f'JSON control must contain an object: {path}')
    return value


def atomic_json(path, value):
    tmp = path.with_name(path.name + f'.{os.getpid()}.tmp')
    with tmp.open('x', encoding='utf-8') as stream:
        json.dump(value, stream, sort_keys=True)
        stream.flush()
        os.fsync(stream.fileno())
    tmp.replace(path)


def restrict_network():
    """Inherited syscall denial, not a filesystem or hostile-input sandbox."""
    try:
        lib = ctypes.CDLL('libseccomp.so.2', use_errno=True)
        libc = ctypes.CDLL(None, use_errno=True)
        lib.seccomp_init.argtypes = [ctypes.c_uint32]
        lib.seccomp_init.restype = ctypes.c_void_p
        lib.seccomp_syscall_resolve_name.argtypes = [ctypes.c_char_p]
        lib.seccomp_syscall_resolve_name.restype = ctypes.c_int
        lib.seccomp_rule_add.argtypes = [ctypes.c_void_p, ctypes.c_uint32, ctypes.c_int, ctypes.c_uint]
        lib.seccomp_rule_add.restype = ctypes.c_int
        lib.seccomp_load.argtypes = [ctypes.c_void_p]
        lib.seccomp_load.restype = ctypes.c_int
        lib.seccomp_release.argtypes = [ctypes.c_void_p]
        # PR_SET_NO_NEW_PRIVS is irreversible and inherited by all descendants.
        if libc.prctl(38, 1, 0, 0, 0) != 0:
            raise Refusal('no_new_privs failed')
        ctx = lib.seccomp_init(0x7fff0000)  # SCMP_ACT_ALLOW
        if not ctx:
            raise Refusal('seccomp_init failed')
        try:
            for name in ('socket', 'connect', 'bind', 'listen', 'accept',
                         'accept4', 'sendto', 'sendmsg', 'sendmmsg', 'recvfrom',
                         'recvmsg', 'recvmmsg', 'shutdown', 'io_uring_setup',
                         'io_uring_enter', 'io_uring_register'):
                number = lib.seccomp_syscall_resolve_name(name.encode())
                if number < 0 or lib.seccomp_rule_add(ctx, 0x50000 | errno.EPERM, number, 0) != 0:
                    raise Refusal(f'cannot restrict syscall: {name}')
            # libuv uses AF_UNIX socketpairs as anonymous subprocess stdio.
            # Permit only those local pairs; named Unix/network sockets remain denied.
            class Comparison(ctypes.Structure):
                _fields_ = [('arg', ctypes.c_uint), ('op', ctypes.c_int),
                            ('datum_a', ctypes.c_uint64), ('datum_b', ctypes.c_uint64)]
            lib.seccomp_rule_add_array.argtypes = [ctypes.c_void_p, ctypes.c_uint32,
                                                   ctypes.c_int, ctypes.c_uint, ctypes.POINTER(Comparison)]
            lib.seccomp_rule_add_array.restype = ctypes.c_int
            pair = lib.seccomp_syscall_resolve_name(b'socketpair')
            condition = Comparison(0, 1, 1, 0)  # arg 0 != AF_UNIX, SCMP_CMP_NE
            if pair < 0 or lib.seccomp_rule_add_array(ctx, 0x50000 | errno.EPERM, pair, 1, ctypes.byref(condition)) != 0:
                raise Refusal('cannot restrict socketpair domain')
            if lib.seccomp_load(ctx) != 0:
                raise Refusal('seccomp_load failed')
        finally:
            lib.seccomp_release(ctx)
    except OSError as exc:
        raise Refusal(f'network restriction unavailable: {exc}') from exc


def child_limits():
    resource.setrlimit(resource.RLIMIT_CORE, (0, 0))
    resource.setrlimit(resource.RLIMIT_AS, (4 * 1024**3, 4 * 1024**3))
    resource.setrlimit(resource.RLIMIT_CPU, (120, 120))
    resource.setrlimit(resource.RLIMIT_FSIZE, (MAX_CACHE_BYTES, MAX_CACHE_BYTES))
    resource.setrlimit(resource.RLIMIT_NOFILE, (128, 128))


def run_bounded(argv, env, cwd, deadline, max_bytes):
    """Read both pipes incrementally; kill the whole owned group on any failure."""
    proc = subprocess.Popen(argv, cwd=cwd, env=env, stdin=subprocess.DEVNULL,
                            stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                            start_new_session=True, preexec_fn=child_limits)
    buffers = {'stdout': bytearray(), 'stderr': bytearray()}
    try:
        with selectors.DefaultSelector() as selector:
            selector.register(proc.stdout, selectors.EVENT_READ, 'stdout')
            selector.register(proc.stderr, selectors.EVENT_READ, 'stderr')
            while selector.get_map():
                remaining = deadline - time.monotonic()
                if remaining <= 0:
                    raise Refusal('wall-time limit exceeded')
                for key, _ in selector.select(min(remaining, 0.1)):
                    data = os.read(key.fileobj.fileno(), 65536)
                    if not data:
                        selector.unregister(key.fileobj)
                    else:
                        buffers[key.data].extend(data)
                        if sum(map(len, buffers.values())) > max_bytes:
                            raise Refusal('process output limit exceeded; no partial answer returned')
            code = proc.wait(timeout=max(0.001, deadline - time.monotonic()))
        if code != 0:
            detail = bytes(buffers['stderr'] or buffers['stdout']).decode('utf-8', 'replace')[:2000]
            raise Refusal(f'child exit {code}: {detail}')
        if buffers['stderr']:
            raise Refusal('unexpected child diagnostics: ' + buffers['stderr'].decode('utf-8', 'replace')[:2000])
        return bytes(buffers['stdout'])
    finally:
        # Also terminate a stray descendant if the immediate child has exited.
        try:
            os.killpg(proc.pid, signal.SIGKILL)
        except ProcessLookupError:
            pass
        proc.wait()
        proc.stdout.close()
        proc.stderr.close()


def git_controls(repo):
    """Inspect only Git control paths needed by local read-only enumeration."""
    dot = no_symlinks(repo / '.git')
    if dot.is_file():
        value = dot.read_text(encoding='utf-8').strip()
        if not value.startswith('gitdir: '):
            raise Refusal('invalid worktree .git file')
        gitdir = Path(os.path.abspath(repo / value[8:]))
    elif dot.is_dir():
        gitdir = dot
    else:
        raise Refusal('an explicit Git working-tree root is required')
    no_symlinks(gitdir)
    common = gitdir
    if (gitdir / 'commondir').exists():
        p = no_symlinks(gitdir / 'commondir')
        common = Path(os.path.abspath(gitdir / p.read_text(encoding='utf-8').strip()))
        no_symlinks(common)
    for folder in {gitdir, common}:
        for name in ('config', 'config.worktree', 'index', 'HEAD', 'info/exclude', 'info/attributes'):
            control = no_symlinks(folder / name)
            if control.exists() and not control.is_file():
                raise Refusal(f'non-file Git control: {control}')
            if control.exists() and name.startswith('config'):
                if control.stat().st_size > 1024 * 1024:
                    raise Refusal('Git config exceeds size bound')
                # Includes can read host files even when all hooks are disabled.
                import re
                if re.search(r'^\s*\[\s*include(?:if)?(?:\s|\])', control.read_text(), re.I | re.M):
                    raise Refusal('Git config includes are outside the supported scope')


def sanitized_env(home):
    env = {'PATH': '/usr/bin:/bin', 'HOME': str(home), 'LANG': 'C.UTF-8',
           'LC_ALL': 'C.UTF-8', 'GRAFT_NO_SEED': '1', 'GIT_CONFIG_NOSYSTEM': '1',
           'GIT_CONFIG_SYSTEM': '/dev/null', 'GIT_CONFIG_GLOBAL': '/dev/null',
           'GIT_TERMINAL_PROMPT': '0', 'GIT_OPTIONAL_LOCKS': '0',
           'GIT_CONFIG_COUNT': '4'}
    for i, (key, value) in enumerate((('core.fsmonitor', 'false'), ('core.hooksPath', '/dev/null'),
                                    ('core.excludesFile', '/dev/null'), ('core.attributesFile', '/dev/null'))):
        env[f'GIT_CONFIG_KEY_{i}'] = key
        env[f'GIT_CONFIG_VALUE_{i}'] = value
    return env


def runtime_info():
    no_symlinks(RUNTIME)
    manifest_path = no_symlinks(RUNTIME.parent / 'runtime.json')
    manifest = read_json(manifest_path)
    for field in ('source_integrity', 'reviewed_patch', 'modules', 'native_modules', 'toolchain'):
        if not isinstance(manifest.get(field), dict):
            raise Refusal(f'runtime manifest {field} must be an object')
    integrity = manifest['source_integrity']
    reviewed_patch = manifest['reviewed_patch']
    commands = manifest.get('commands')
    if (not isinstance(commands, list) or not commands
            or any(not isinstance(c, dict) or type(c.get('exit_code')) is not int for c in commands)):
        raise Refusal('runtime manifest commands must be records with integer exit codes')
    for field in ('base_hashes', 'hashes'):
        if not isinstance(integrity.get(field), dict):
            raise Refusal(f'runtime source_integrity {field} must be an object')
    changed_files = integrity.get('changed_files')
    if not isinstance(changed_files, list) or any(not isinstance(rel, str) for rel in changed_files):
        raise Refusal('runtime changed_files must be a list of paths')
    hash_groups = {'modules': manifest['modules'], 'native_modules': manifest['native_modules'],
                   'base_hashes': integrity['base_hashes'], 'hashes': integrity['hashes']}
    for field, entries in hash_groups.items():
        if not entries or any(not isinstance(rel, str) or not isinstance(expected, str)
                              or len(expected) != 64 or any(c not in '0123456789abcdef' for c in expected)
                              for rel, expected in entries.items()):
            raise Refusal(f'runtime {field} must map paths to SHA256 hashes')
    if not isinstance(manifest['toolchain'].get('node_path'), str):
        raise Refusal('runtime node_path must be a path string')
    if (manifest.get('schema_version') != 2 or manifest.get('ready') is not True
            or manifest.get('source_commit') != COMMIT
            or integrity.get('unchanged') is not False
            or reviewed_patch.get('id') != 'named-import-calls-v1'
            or any(c['exit_code'] != 0 for c in commands)):
        raise Refusal('runtime manifest is not verified/ready at the pinned commit and reviewed patch')
    no_symlinks(PATCH)
    if reviewed_patch.get('sha256') != digest(PATCH.read_bytes()):
        raise Refusal('reviewed runtime patch checksum mismatch')
    base_hashes = integrity.get('base_hashes', {})
    current_hashes = integrity.get('hashes', {})
    changed = {rel for rel in set(base_hashes) | set(current_hashes)
               if base_hashes.get(rel) != current_hashes.get(rel)}
    if not base_hashes or not changed or changed != set(changed_files):
        raise Refusal('runtime patch source provenance mismatch')
    modules = manifest.get('modules', {})
    required = ['graph/build', 'graph/map', 'graph/traverse', 'ask/ask', 'graph/source-files',
                'ingest/fs', 'graph/generic', 'graph/container', 'util/source']
    for name in required:
        if f'dist/{name}.js' not in modules:
            raise Refusal(f'runtime manifest missing module: {name}')
    native = manifest.get('native_modules', {})
    source = manifest.get('source_integrity', {}).get('hashes', {})
    if not native or not source:
        raise Refusal('runtime manifest missing native/source integrity hashes')
    for group, entries in (('module', modules), ('native', native), ('source', source)):
        for rel, expected in entries.items():
            path = no_symlinks(RUNTIME / rel)
            if (not path.is_relative_to(RUNTIME) or Path(rel).is_absolute()
                    or (group == 'module' and not rel.startswith('dist/'))
                    or (group == 'native' and not rel.startswith('node_modules/'))):
                raise Refusal('invalid runtime asset path')
            if digest(path.read_bytes()) != expected:
                raise Refusal(f'runtime {group} changed: {rel}')
    node = Path(manifest['toolchain']['node_path'])
    if not node.is_absolute() or not node.is_file():
        raise Refusal('runtime manifest has no valid Node executable')
    return node, digest(manifest_path.read_bytes())


def owned_root(root):
    no_symlinks(root)
    marker = root / 'owner.json'
    expected = {'owner': 'prime-code-navigation', 'version': CACHE_ROOT_VERSION, 'uid': os.getuid()}
    if not root.exists():
        root.mkdir(mode=0o700, parents=True)
        atomic_json(marker, expected)
    private(root)
    private(marker, False)
    if read_json(marker) != expected:
        raise Refusal('cache-root ownership mismatch')


def cache_hashes(context):
    hashes = {}
    total = 0
    if not context.exists():
        raise Refusal('cache context missing')
    for folder, dirs, files in os.walk(context, followlinks=False):
        private(Path(folder))
        for name in dirs:
            private(Path(folder) / name)
        for name in files:
            path = Path(folder) / name
            private(path, False)
            total += path.stat().st_size
            if total > MAX_CACHE_BYTES or len(hashes) > 100:
                raise Refusal('cache size/file-count bound exceeded')
            hashes[str(path.relative_to(context))] = digest(path.read_bytes())
    return hashes


class JsonArgumentParser(argparse.ArgumentParser):
    def error(self, message):
        print(json.dumps({'ok': False, 'command': None, 'repo': None,
                          'health': {'state': 'unavailable', 'current': False}, 'error': message}))
        self.exit(2)


def parser():
    p = JsonArgumentParser(description=__doc__)
    p.add_argument('command', choices=['index', 'map', 'find', 'outline', 'trace', 'check', 'forget'])
    p.add_argument('--repo', required=True, help='absolute Git working-tree root; never home or /')
    p.add_argument('--query', help='lexical find query (structural intent is also supported)')
    p.add_argument('--file', help='exact repository-relative file for outline, or trace narrowing')
    p.add_argument('--symbol', help='exact/qualified symbol for find or trace; duplicates are retained')
    p.add_argument('--direction', choices=['in', 'out'], default='in', help='trace edge direction')
    p.add_argument('--depth', type=int, default=1, help='trace depth, 1..5')
    p.add_argument('--limit', type=int, default=30, help='result item limit, 1..200; omissions are explicit')
    p.add_argument('--cache-root', help='absolute private owned cache root, outside the repository')
    p.add_argument('--timeout-seconds', type=float, default=60, help='whole-operation wall limit, 1..120')
    p.add_argument('--lock-timeout-seconds', type=float, default=2, help='lock wait limit, 0..10')
    p.add_argument('--max-output-bytes', type=int, default=1024 * 1024, help='JSON/process output limit, 1024..2097152')
    return p


def main():
    args = parser().parse_args()
    repo = None
    ready = None
    lock = None
    old_handlers = {}
    try:
        os.umask(0o077)
        if not 1 <= args.depth <= 5 or not 1 <= args.limit <= 200:
            raise Refusal('depth/limit outside bounds')
        if not 1 <= args.timeout_seconds <= 120 or not 0 <= args.lock_timeout_seconds <= 10:
            raise Refusal('time limit outside bounds')
        if not 1024 <= args.max_output_bytes <= 2 * 1024 * 1024:
            raise Refusal('output bound outside supported range')
        deadline = time.monotonic() + args.timeout_seconds
        lock_phase = False
        def interrupted(signum, frame):
            if signum == signal.SIGALRM:
                raise Refusal('repository cache lock busy' if lock_phase else 'whole-operation wall-time limit exceeded')
            raise Refusal('interrupted')
        for sig in (signal.SIGTERM, signal.SIGINT, signal.SIGALRM):
            old_handlers[sig] = signal.signal(sig, interrupted)
        signal.setitimer(signal.ITIMER_REAL, args.timeout_seconds)
        given = Path(args.repo)
        if not given.is_absolute() or '..' in given.parts:
            raise Refusal('repo must be an absolute path without traversal')
        repo = given.resolve(strict=True)
        if not repo.is_dir() or repo in (Path('/'), Path.home().resolve()):
            raise Refusal('filesystem/home root is not an authorized repository scope')
        if args.file and (Path(args.file).is_absolute() or any(x in ('..', '.', '') for x in args.file.split('/')) or '\\' in args.file):
            raise Refusal('--file must be an exact relative path without traversal')
        if args.file and not (repo / args.file).resolve().is_relative_to(repo):
            raise Refusal('--file escapes repository')
        if args.command == 'outline' and not args.file:
            raise Refusal('outline requires --file')
        if args.command == 'trace' and not args.symbol:
            raise Refusal('trace requires --symbol')
        if args.command == 'find' and bool(args.query) == bool(args.symbol):
            raise Refusal('find requires exactly one of --query or --symbol')
        if any(len(x) > 4096 for x in (args.query or '', args.file or '', args.symbol or '')):
            raise Refusal('query argument exceeds length bound')
        cache_root = Path(args.cache_root) if args.cache_root else Path.home() / '.cache/prime-agent/code-navigation'
        no_symlinks(cache_root)
        if cache_root == Path('/') or cache_root == Path.home() or cache_root.is_relative_to(repo) or repo.is_relative_to(cache_root):
            raise Refusal('cache root must be outside and distinct from source scope')
        owned_root(cache_root)
        patch_hash = digest(no_symlinks(PATCH).read_bytes())
        identity = digest((str(repo) + '\0structural\0' + VERSION + '\0' + COMMIT + '\0' + patch_hash).encode())
        cache = cache_root / identity
        owner = {'owner': 'prime-code-navigation', 'version': VERSION, 'repo': str(repo),
                 'identity': identity, 'commit': COMMIT, 'patch_sha256': patch_hash}
        lock_path = cache_root / (identity + '.lock')
        no_symlinks(lock_path)
        lock = os.open(lock_path, os.O_CREAT | os.O_RDWR | os.O_NOFOLLOW, 0o600)
        private(lock_path, False)
        lock_deadline = min(deadline, time.monotonic() + args.lock_timeout_seconds)
        # flock wait uses an alarm, not repeated polling or stale PID ownership.
        lock_phase = True
        try:
            if args.lock_timeout_seconds == 0:
                fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
            else:
                signal.setitimer(signal.ITIMER_REAL, max(0.001, lock_deadline - time.monotonic()))
                fcntl.flock(lock, fcntl.LOCK_EX)
        except BlockingIOError as exc:
            raise Refusal('repository cache lock busy') from exc
        finally:
            lock_phase = False
            signal.setitimer(signal.ITIMER_REAL, max(0.001, deadline - time.monotonic()))
        if not cache.exists():
            if args.command == 'forget':
                result = {'removed': False, 'cache': str(cache), 'lock_retained': str(lock_path)}
                print(json.dumps({'ok': True, 'command': args.command, 'repo': str(repo), 'health': {'state': 'absent'}, 'result': result}))
                return 0
            cache.mkdir(mode=0o700)
            atomic_json(cache / 'owner.json', owner)
        private(cache)
        private(cache / 'owner.json', False)
        if read_json(cache / 'owner.json') != owner:
            raise Refusal('cache identity mismatch; refusing reuse or deletion')
        # From here, any failure invalidates ready even if a control is corrupt.
        ready = cache / 'ready.json'
        # Validate controls before touching or deleting any derived files.
        count = total_bytes = 0
        for folder, dirs, files in os.walk(cache, followlinks=False):
            private(Path(folder))
            count += len(dirs) + len(files)
            if count > 120:
                raise Refusal('cache file-count bound exceeded')
            for name in dirs:
                private(Path(folder) / name)
            for name in files:
                control = Path(folder) / name
                private(control, False)
                total_bytes += control.stat().st_size
                if total_bytes > MAX_CACHE_BYTES:
                    raise Refusal('cache size bound exceeded')
        if args.command == 'forget':
            shutil.rmtree(cache)
            result = {'removed': True, 'cache': str(cache), 'lock_retained': str(lock_path)}
            print(json.dumps({'ok': True, 'command': args.command, 'repo': str(repo), 'health': {'state': 'forgotten'}, 'result': result}))
            return 0
        context = cache / 'context'
        ready_path = cache / 'ready.json'
        node, runtime_hash = runtime_info()
        reused_cache = False
        recovery = 'new cache'
        if ready_path.exists():
            try:
                previous = read_json(ready_path)
                reused_cache = (previous.get('owner') == owner and previous.get('runtime') == runtime_hash
                                and previous.get('files') == cache_hashes(context))
                recovery = None if reused_cache else 'invalid cache rebuilt'
            except (ValueError, OSError, Refusal):
                recovery = 'corrupt cache rebuilt'
        elif context.exists():
            recovery = 'unfinished cache rebuilt'
        # Invalidating ready before the build prevents interrupted publication.
        ready = ready_path
        ready.unlink(missing_ok=True)
        if not reused_cache and context.exists():
            shutil.rmtree(context)
        context.mkdir(mode=0o700, exist_ok=True)
        git_controls(repo)
        restrict_network()
        env = sanitized_env(cache)
        actual = run_bounded(['/usr/bin/git', 'rev-parse', '--show-toplevel'], env, repo, deadline, 16384).decode().strip()
        if Path(actual).resolve() != repo:
            raise Refusal('--repo must be the Git working-tree root')
        request = {'command': args.command, 'repo': str(repo), 'context': str(context),
                   'runtime': str(RUNTIME), 'query': args.query, 'file': args.file,
                   'symbol': args.symbol, 'direction': args.direction, 'depth': args.depth,
                   'limit': args.limit, 'maxOutputBytes': args.max_output_bytes}
        raw = run_bounded([str(node), '--max-old-space-size=512', '--disable-wasm-trap-handler',
                           str(Path(__file__).resolve().with_name('engine.mjs')), json.dumps(request)],
                          env, RUNTIME, deadline, args.max_output_bytes)
        answer = json.loads(raw)
        if answer.get('ok') is not True:
            raise Refusal('engine did not report success')
        files = cache_hashes(context)
        answer['health'].update({'cache': str(cache), 'identity': identity, 'recovery': recovery,
                                 'network': 'inherited seccomp syscall denial; not a filesystem sandbox',
                                 'runtime_commit': COMMIT, 'runtime_patch': 'named-import-calls-v1',
                                 'patch_sha256': patch_hash, 'adapter_version': VERSION})
        encoded = json.dumps(answer, ensure_ascii=True)
        if len(encoded.encode()) + 1 > args.max_output_bytes:
            raise Refusal('output size limit exceeded; no partial answer returned')
        atomic_json(ready, {'owner': owner, 'runtime': runtime_hash, 'files': files,
                            'source': answer['health']['source_hash']})
        print(encoded)
        ready = None
        return 0
    except (Refusal, OSError, ValueError, KeyError, subprocess.TimeoutExpired) as exc:
        if ready is not None:
            ready.unlink(missing_ok=True)
        print(json.dumps({'ok': False, 'command': args.command, 'repo': str(repo) if repo else args.repo,
                          'health': {'state': 'unavailable', 'current': False}, 'error': str(exc)[:2500]}))
        return 1
    finally:
        signal.setitimer(signal.ITIMER_REAL, 0)
        if lock is not None:
            os.close(lock)
        for sig, handler in old_handlers.items():
            signal.signal(sig, handler)


if __name__ == '__main__':
    sys.exit(main())
