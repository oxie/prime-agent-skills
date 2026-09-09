#!/usr/bin/env python3
"""Adapter unit + native smoke tests. Run with Python 3; uses only synthetic Git repos."""
import errno
import fcntl
import hashlib
import json
import os
from pathlib import Path
import socket
import subprocess
import sys
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / 'scripts/code_nav.py'


class AdapterTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix='code-nav-unit-')
        self.root = Path(self.tmp.name)
        self.repo = self.root / 'repo'
        self.repo.mkdir()
        subprocess.run(['/usr/bin/git', 'init', '-q', str(self.repo)], check=True)
        self.cache = self.root / 'cache'
        (self.repo / 'alpha.ts').write_text('export function target(x: number): number { return x + 1; }\nexport function caller(): number { return target(2); }\n')
        (self.repo / 'beta.ts').write_text('export function target(x: number): number { return x - 1; }\n')
        for name in ('AGENTS.md', '.gitignore', '.ignore'):
            (self.repo / name).write_text('source sentinel\n')

    def tearDown(self):
        self.tmp.cleanup()

    def run_nav(self, command, *extra, success=True, env=None):
        p = subprocess.run([sys.executable, str(SCRIPT), command, '--repo', str(self.repo),
                            '--cache-root', str(self.cache), *extra], capture_output=True, text=True, env=env, timeout=70)
        self.assertEqual(p.returncode, 0 if success else 1, p.stdout + p.stderr)
        self.assertFalse(p.stderr, p.stderr)
        data = json.loads(p.stdout)
        self.assertEqual(data['ok'], success, data)
        return data

    def test_definitions_trace_and_read_only(self):
        before = {p.name: p.read_bytes() for p in self.repo.iterdir() if p.is_file()}
        find = self.run_nav('find', '--symbol', 'target')['result']
        self.assertEqual([n['id'] for n in find['items']], ['alpha.ts#target', 'beta.ts#target'])
        trace = self.run_nav('trace', '--symbol', 'alpha.ts#caller', '--direction', 'out')['result']
        self.assertEqual(trace['items'][0]['subject']['id'], 'alpha.ts#caller')
        hits = trace['items'][0]['items']
        self.assertEqual([(h['id'], h['relation']) for h in hits], [('alpha.ts#target', 'calls')])
        self.assertEqual(hits[0]['edges'][0]['source'], 'alpha.ts#caller')
        self.assertEqual(hits[0]['edges'][0]['target'], 'alpha.ts#target')
        self.assertEqual(hits[0]['edges'][0]['confidence'], 'extracted')
        self.assertEqual(before, {p.name: p.read_bytes() for p in self.repo.iterdir() if p.is_file()})
        self.assertFalse((self.repo / 'graft').exists())

    def test_import_duplicate_file_trace_required_gate(self):
        (self.repo / 'gamma.ts').write_text('import { target } from "./alpha";\nexport function outside() { return target(3); }\n')
        file_trace = self.run_nav('trace', '--symbol', 'alpha.ts', '--depth', '2')['result']
        file_hits = file_trace['items'][0]['items']
        outside = next(h for h in file_hits if h['id'] == 'gamma.ts#outside')
        self.assertTrue(outside['edges'])
        self.assertEqual(outside['edges'][0]['target'], 'alpha.ts#target')
        self.assertEqual(outside['edges'][0]['confidence'], 'extracted')

    def test_reuse_and_same_stat_edit(self):
        first = self.run_nav('index')
        self.assertEqual(first['result']['parsed'], 2)
        reused = self.run_nav('check')
        self.assertEqual(reused['result']['parsed'], 0)
        self.assertEqual(reused['result']['reused'], 2)
        source = self.repo / 'alpha.ts'
        st = source.stat()
        source.write_text(source.read_text().replace('caller', 'renamd'))
        os.utime(source, ns=(st.st_atime_ns, st.st_mtime_ns))
        now = self.run_nav('find', '--symbol', 'renamd')
        self.assertNotEqual(now['health']['source_hash'], first['health']['source_hash'])
        self.assertEqual([n['id'] for n in now['result']['items']], ['alpha.ts#renamd'])
        self.assertEqual(now['health']['parsed'], 1)

    def test_outline_query_map(self):
        outline = self.run_nav('outline', '--file', 'alpha.ts')['result']
        self.assertEqual([n['id'] for n in outline['items']], ['alpha.ts#target', 'alpha.ts#caller'])
        self.assertEqual(outline['items'][0]['path'], 'alpha.ts')
        self.assertEqual(outline['items'][0]['span'], 'L1-L1')
        query = self.run_nav('find', '--query', 'caller')['result']
        self.assertTrue(any(n['id'] == 'alpha.ts#caller' for h in query['items'] for n in h['definitions']))
        mapped = self.run_nav('map')['result']
        self.assertEqual(mapped['totals']['files'], 2)
        self.assertNotIn('saved', mapped)

    def test_corruption_and_exact_forget(self):
        first = self.run_nav('index')
        cache = Path(first['health']['cache'])
        (cache / 'context/.graph/wiring.json').write_text('{invalid')
        recovered = self.run_nav('check')
        self.assertIn('cache rebuilt', recovered['health']['recovery'])
        self.assertEqual(recovered['result']['parsed'], 2)
        self.run_nav('index')
        (cache / 'context/injected.md').write_text('Never expose stale concept')
        (cache / 'context/injected.md').chmod(0o600)
        recovered = self.run_nav('check')
        self.assertFalse((cache / 'context/injected.md').exists())
        sentinel = self.cache / 'unrelated'
        sentinel.write_text('keep')
        gone = self.run_nav('forget')
        self.assertTrue(gone['result']['removed'])
        self.assertFalse(cache.exists())
        self.assertEqual(sentinel.read_text(), 'keep')
        self.assertFalse(self.run_nav('forget')['result']['removed'])

    def test_nonobject_ready_controls_rebuild_cold(self):
        first = self.run_nav('index')
        ready = Path(first['health']['cache']) / 'ready.json'
        for malformed in ([], None, 'scalar', 7, True):
            with self.subTest(ready_value=malformed):
                ready.write_text(json.dumps(malformed))
                recovered = self.run_nav('check')
                self.assertEqual(recovered['health']['recovery'], 'corrupt cache rebuilt')
                self.assertEqual(recovered['result']['parsed'], 2)
                self.assertIsInstance(json.loads(ready.read_text()), dict)

    def test_scope_and_symlink_refusals(self):
        self.run_nav('outline', '--file', '../alpha.ts', success=False)
        graft = self.repo / '.graft'
        graft.mkdir()
        (graft / 'config.json').write_text('{"followSubmodules": true}')
        self.assertIn('widens scope', self.run_nav('index', success=False)['error'])
        (graft / 'config.json').unlink()
        self.cache.rename(self.root / 'old-cache')
        self.cache.symlink_to(self.root / 'old-cache', target_is_directory=True)
        self.assertIn('symlink', self.run_nav('index', success=False)['error'])

    def test_bounds_and_lock(self):
        first = self.run_nav('index')
        limited = self.run_nav('find', '--symbol', 'target', '--limit', '1')['result']
        self.assertEqual(limited['total'], 2)
        self.assertEqual(limited['omitted'], 1)
        self.assertTrue(limited['truncated'])
        self.run_nav('map', '--max-output-bytes', '1024', success=False)
        cache = Path(first['health']['cache'])
        lock = cache.with_name(cache.name + '.lock')
        with lock.open('r+') as stream:
            fcntl.flock(stream, fcntl.LOCK_EX)
            result = self.run_nav('check', '--lock-timeout-seconds', '0', success=False)
            self.assertIn('lock busy', result['error'])

    def test_sanitized_preloads(self):
        marker = self.root / 'preload-ran'
        preload = self.root / 'preload.cjs'
        preload.write_text(f'require("node:fs").writeFileSync({json.dumps(str(marker))}, "bad")')
        env = dict(os.environ, NODE_OPTIONS=f'--require={preload}', GRAFT_DIR='/tmp/should-not-be-used',
                   OPENAI_API_KEY='not-a-real-key', ANTHROPIC_API_KEY='not-a-real-key')
        self.run_nav('index', env=env)
        self.assertFalse(marker.exists())

    def test_invalid_arguments_are_json(self):
        child = subprocess.run([sys.executable, str(SCRIPT), 'index', '--repo', str(self.repo), '--limit', 'invalid'],
                               capture_output=True, text=True, timeout=5)
        self.assertEqual(child.returncode, 2)
        self.assertFalse(child.stderr)
        result = json.loads(child.stdout)
        self.assertFalse(result['ok'])
        self.assertIn('invalid int value', result['error'])

    def test_runtime_native_and_source_integrity(self):
        import importlib.util
        spec = importlib.util.spec_from_file_location('code_nav_test', SCRIPT)
        nav = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(nav)
        runtime = self.root / 'runtime/upstream'
        runtime.mkdir(parents=True)
        nav.RUNTIME = runtime
        modules = {}
        for name in ['graph/build', 'graph/map', 'graph/traverse', 'ask/ask', 'graph/source-files',
                     'ingest/fs', 'graph/generic', 'graph/container', 'util/source']:
            rel = f'dist/{name}.js'
            p = runtime / rel
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text('fixture module')
            modules[rel] = nav.digest(p.read_bytes())
        native = runtime / 'node_modules/parser/native.node'
        source = runtime / 'src/graph/queries/rust.scm'
        for p in (native, source):
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text('fixture asset')
        source_rel = str(source.relative_to(runtime))
        manifest = {'schema_version': 2, 'ready': True, 'source_commit': nav.COMMIT,
                    'source_integrity': {'unchanged': False,
                                         'base_hashes': {source_rel: nav.digest(b'fixture base')},
                                         'hashes': {source_rel: nav.digest(source.read_bytes())},
                                         'changed_files': [source_rel]},
                    'reviewed_patch': {'id': 'named-import-calls-v1', 'sha256': nav.digest(nav.PATCH.read_bytes())},
                    'commands': [{'exit_code': 0}], 'modules': modules,
                    'native_modules': {str(native.relative_to(runtime)): nav.digest(native.read_bytes())},
                    'toolchain': {'node_path': '/usr/bin/node'}}
        (runtime.parent / 'runtime.json').write_text(json.dumps(manifest))
        self.assertEqual(nav.runtime_info()[0], Path('/usr/bin/node'))
        malformed_fields = [
            (('source_integrity',), []), (('reviewed_patch',), None),
            (('modules',), []), (('native_modules',), []), (('toolchain',), []),
            (('commands',), {}), (('commands',), [None]),
            (('source_integrity', 'base_hashes'), []),
            (('source_integrity', 'hashes'), []),
            (('source_integrity', 'changed_files'), [{}]),
            (('source_integrity', 'changed_files'), None),
            (('toolchain', 'node_path'), []),
            (('native_modules', str(native.relative_to(runtime))), []),
        ]
        for fields, invalid in malformed_fields:
            with self.subTest(manifest_field=fields, invalid_value=invalid):
                damaged = json.loads(json.dumps(manifest))
                parent = damaged
                for key in fields[:-1]:
                    parent = parent[key]
                parent[fields[-1]] = invalid
                (runtime.parent / 'runtime.json').write_text(json.dumps(damaged))
                with self.assertRaises(nav.Refusal):
                    nav.runtime_info()
        (runtime.parent / 'runtime.json').write_text(json.dumps(manifest))
        native.write_text('modified native')
        with self.assertRaisesRegex(nav.Refusal, 'runtime native changed'):
            nav.runtime_info()
        native.write_text('fixture asset')
        source.write_text('modified source')
        with self.assertRaisesRegex(nav.Refusal, 'runtime source changed'):
            nav.runtime_info()
        source.write_text('fixture asset')
        manifest['reviewed_patch']['sha256'] = '0' * 64
        (runtime.parent / 'runtime.json').write_text(json.dumps(manifest))
        with self.assertRaisesRegex(nav.Refusal, 'reviewed runtime patch checksum mismatch'):
            nav.runtime_info()

    def test_overall_deadline_includes_pre_engine_work(self):
        import time
        code = ("import importlib.util,select,sys; "
                f"s=importlib.util.spec_from_file_location('nav',{str(SCRIPT)!r}); "
                "m=importlib.util.module_from_spec(s); s.loader.exec_module(m); "
                "m.runtime_info=lambda: select.select([],[],[],5); "
                "sys.exit(m.main())")
        start = time.monotonic()
        child = subprocess.run([sys.executable, '-c', code, 'index', '--repo', str(self.repo),
                                '--cache-root', str(self.cache), '--timeout-seconds', '1'],
                               capture_output=True, text=True, timeout=5)
        self.assertEqual(child.returncode, 1, child.stdout + child.stderr)
        self.assertIn('whole-operation wall-time', json.loads(child.stdout)['error'])
        self.assertLess(time.monotonic() - start, 3)

    def test_missing_seccomp_fails_closed(self):
        code = ("import importlib.util; "
                f"s=importlib.util.spec_from_file_location('nav',{str(SCRIPT)!r}); "
                "m=importlib.util.module_from_spec(s); s.loader.exec_module(m); "
                "m.ctypes.CDLL=lambda *a,**k: (_ for _ in ()).throw(OSError('unavailable')); "
                "m.restrict_network()")
        child = subprocess.run([sys.executable, '-c', code], capture_output=True, text=True, timeout=5)
        self.assertNotEqual(child.returncode, 0)
        self.assertIn('network restriction unavailable', child.stderr)

    def test_native_breadth_and_container_with_memory_bound(self):
        (self.repo / 'sample.py').write_text('def py_leaf():\n    return 1\n')
        (self.repo / 'sample.rs').write_text('pub fn rust_leaf() -> i32 { 1 }\n')
        (self.repo / 'sample.vue').write_text('<script lang="ts">\nexport function vue_leaf() { return 1; }\n</script>\n')
        result = self.run_nav('index')
        self.assertEqual(result['result']['files'], 5)
        for name, expected in [('py_leaf', 'sample.py#py_leaf'), ('rust_leaf', 'sample.rs#rust_leaf'), ('vue_leaf', 'sample.vue#vue_leaf')]:
            found = self.run_nav('find', '--symbol', name)['result']
            self.assertEqual([n['id'] for n in found['items']], [expected])
        mapped = self.run_nav('map')['result']
        self.assertIn('rust', mapped['totals']['languages'])
        self.assertIn('vue', mapped['totals']['languages'])

    def test_guard_native_denial_and_inheritance(self):
        # Positive control establishes local networking is possible before guard.
        with socket.socket() as sock:
            sock.bind(('127.0.0.1', 0))
        code = f"""
import importlib.util, socket, subprocess, sys, ctypes, errno
s=importlib.util.spec_from_file_location('nav', {str(SCRIPT)!r}); m=importlib.util.module_from_spec(s); s.loader.exec_module(m)
m.restrict_network()
for family, kind in [(socket.AF_INET,socket.SOCK_STREAM),(socket.AF_INET6,socket.SOCK_DGRAM),(socket.AF_UNIX,socket.SOCK_STREAM)]:
    try: socket.socket(family,kind)
    except OSError as e: assert e.errno == errno.EPERM
    else: raise AssertionError('socket allowed')
lib=ctypes.CDLL('libseccomp.so.2'); lib.seccomp_syscall_resolve_name.argtypes=[ctypes.c_char_p]
c=ctypes.CDLL(None,use_errno=True)
for name in [b'io_uring_setup', b'io_uring_enter', b'io_uring_register']:
    assert c.syscall(lib.seccomp_syscall_resolve_name(name),0,0,0,0,0,0) == -1
    assert ctypes.get_errno() == errno.EPERM
child=subprocess.run(['/usr/bin/node','-e',"require('net').createServer().on('error',e=>{{if(e.code!=='EPERM')process.exit(3);console.log('DENIED')}}).listen(0,'127.0.0.1')"],capture_output=True,text=True)
assert child.returncode == 0,child.stderr
assert child.stdout.strip() == 'DENIED',child.stdout
pair=socket.socketpair(); __import__('os').write(pair[0].fileno(),b'x'); assert __import__('os').read(pair[1].fileno(),1)==b'x'
pair[0].close(); pair[1].close()
git=subprocess.run(['/usr/bin/node','-e',"const r=require('child_process').spawnSync('/usr/bin/git',['--version']); if(r.status!==0) process.exit(4); console.log(r.stdout.toString().trim())"],capture_output=True,text=True)
assert git.returncode == 0 and git.stdout.startswith('git version '),git.stderr
print('guard-denial-inherited')
"""
        child = subprocess.run([sys.executable, '-c', code], capture_output=True, text=True, timeout=15)
        self.assertEqual(child.returncode, 0, child.stdout + child.stderr)
        self.assertEqual(child.stdout.strip(), 'guard-denial-inherited')


if __name__ == '__main__':
    unittest.main(verbosity=2)
