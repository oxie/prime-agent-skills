#!/usr/bin/env python3
"""Explicit pinned Impeccable detector. No install, update, config or forwarded flags."""
import argparse
import hashlib
from html.parser import HTMLParser
import importlib.util
import json
import os
from pathlib import Path, PurePosixPath
import selectors
import signal
import stat
import subprocess
import sys
import tempfile
import time
from urllib.parse import urlsplit

sys.dont_write_bytecode=True
HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('impeccable_confinement',HERE/'confinement.py')
policy=importlib.util.module_from_spec(spec);spec.loader.exec_module(policy)
PIN='cd12f8660e2dde57b9615c8a6b8ea674101f9cfc'
ENGINE_SHA='ad8c8e6033b1ae4ff24b77278e8600b287eba5486001273b46fffe1a2fb95194'
DEFAULT_RUNTIME=Path.home()/'.local/share/prime-agent/impeccable-tools'
EXTS={'.css','.scss','.sass','.less','.js','.jsx','.ts','.tsx','.mjs','.cjs','.vue','.svelte','.astro','.html','.htm'}
MAX_FILE=256*1024
MAX_TOTAL=2*1024*1024
MAX_OUTPUT=4*1024*1024

class Failure(Exception):pass
class Parser(argparse.ArgumentParser):
    def error(self,message):
        print(json.dumps({'schema':1,'status':'error','errors':[message],'findings':[],
                          'coverage':{'attempted':[],'executed':[],'skipped':[]}}))
        raise SystemExit(1)

def digest(data):return hashlib.sha256(data).hexdigest()
def file_digest(path):
    h=hashlib.sha256()
    with path.open('rb') as f:
        while chunk:=f.read(1024*1024):h.update(chunk)
    return h.hexdigest()

def relative(raw):
    p=PurePosixPath(raw)
    if not raw or p.is_absolute() or str(p)!=raw or any(x.startswith('.') for x in p.parts) or '\\' in raw or '\x00' in raw:
        raise Failure('select explicit nonhidden canonical relative files; no traversal')
    if p.suffix.lower() not in EXTS:raise Failure('unsupported source extension')
    return p

def read_selected(root,raw):
    p=relative(raw)
    fd=os.open(root,os.O_PATH|os.O_DIRECTORY|os.O_NOFOLLOW)
    try:
        for part in p.parts[:-1]:
            nextfd=os.open(part,os.O_PATH|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=fd)
            os.close(fd);fd=nextfd
        source=os.open(p.name,os.O_RDONLY|os.O_NOFOLLOW|os.O_NONBLOCK,dir_fd=fd)
        try:
            info=os.fstat(source)
            if not stat.S_ISREG(info.st_mode) or info.st_nlink!=1 or not info.st_mode&0o444:raise Failure('target is not a readable unlinked regular file')
            if info.st_size>MAX_FILE:raise Failure('file exceeds 256 KiB')
            with os.fdopen(os.dup(source),'rb') as f:data=f.read(MAX_FILE+1)
            if len(data)>MAX_FILE:raise Failure('growing file exceeds bound')
            data.decode('utf-8','strict')
            if b'\0' in data:raise Failure('NUL/binary source unsupported')
            return data
        finally:os.close(source)
    finally:os.close(fd)

class Links(HTMLParser):
    def __init__(self):super().__init__();self.hrefs=[];self.document_tags=set()
    def handle_starttag(self,tag,attrs):
        if tag in {'html','head','body'}:self.document_tags.add(tag)
        pairs=dict(attrs)
        if 'data-impeccable-ignore' in pairs:raise Failure('scoped DOM waivers unsupported; no page waiver authority')
        if tag=='base':raise Failure('base URL unsupported in static mode')
        if tag=='link' and 'stylesheet' in (pairs.get('rel') or '').lower():
            href=pairs.get('href')
            if not href:raise Failure('empty stylesheet href')
            self.hrefs.append(href)

def validate_links(selected):
    context_skips=[]
    for name,data in selected.items():
        if Path(name).suffix.lower() not in {'.html','.htm'}:continue
        parser=Links();parser.feed(data.decode('utf-8'));parser.close()
        missing=[tag for tag in ('html','head','body') if tag not in parser.document_tags]
        if missing:
            context_skips.append({'target':name,'engine':'static-html',
                'reason':'missing explicit document-wrapper context','missing_tags':missing,
                'detail':'Upstream removes implied wrappers; wrapper-dependent CSS/rules may not apply. This is not a browser-complete cascade; source is not auto-wrapped.'})
        for href in parser.hrefs:
            u=urlsplit(href)
            if u.scheme or u.netloc or '%' in u.path or '\\' in u.path or u.path.startswith('/'):
                raise Failure('external/absolute/encoded stylesheet links unsupported')
            p=PurePosixPath(name).parent/PurePosixPath(u.path)
            if '..' in p.parts or str(p) not in selected or p.suffix.lower()!='.css':
                raise Failure('linked stylesheet must be an explicitly selected contained CSS file')
    # Static engine does not resolve @import. Refuse rather than quietly incomplete.
    for name,data in selected.items():
        if b'@import' in data.lower():raise Failure('CSS @import unsupported: source mode requires self-contained CSS; rendered mode is unavailable')
    return context_skips

def cleanup_children():
    # This CLI is a fresh subreaper and starts no unrelated children.
    childfile=Path(f'/proc/self/task/{os.getpid()}/children')
    children=childfile.read_text().split()
    for pid in children:
        try:os.killpg(int(pid),signal.SIGKILL)
        except ProcessLookupError:pass
        try:os.kill(int(pid),signal.SIGKILL)
        except ProcessLookupError:pass
    for pid in children:
        try:os.waitpid(int(pid),0)
        except ChildProcessError:pass
    if childfile.read_text().strip():raise Failure('owned child cleanup incomplete')

def invoke(runtime,run,mode,target,deadline):
    engine=runtime/'impeccable-engine'
    if engine.is_symlink() or file_digest(engine)!=ENGINE_SHA:raise Failure('engine unavailable or pinned hash mismatch')
    reads=[str(run/'input'),'/usr/lib','/lib','/lib64','/etc/ld.so.cache']
    executes=[str(engine),str(Path('/lib64/ld-linux-x86-64.so.2').resolve())]
    reads=[p for p in reads if Path(p).exists()]
    env={'PATH':'/usr/bin:/bin','HOME':'.','TMPDIR':'.','LANG':'C.UTF-8'}
    # Explicitly neither CI nor dangerous sandbox flags, credential/proxy/update vars.
    policy.checked(policy.libc.prctl(36,1,0,0,0)) # CHILD_SUBREAPER
    def restrict():policy.confine(reads,executes,str(run/'scratch'))
    process=None
    outputs={}
    selector=selectors.DefaultSelector()
    try:
        process=subprocess.Popen([str(engine),mode,target],cwd=run/'scratch',env=env,
            stdin=subprocess.DEVNULL,stdout=subprocess.PIPE,stderr=subprocess.PIPE,
            close_fds=True,start_new_session=True,preexec_fn=restrict)
        outputs={process.stdout:bytearray(),process.stderr:bytearray()}
        for stream in outputs:selector.register(stream,selectors.EVENT_READ)
        while selector.get_map():
            remaining=deadline-time.monotonic()
            if remaining<=0:raise Failure('engine wall timeout')
            for key,_ in selector.select(remaining):
                data=os.read(key.fileobj.fileno(),65536)
                if not data:selector.unregister(key.fileobj);continue
                outputs[key.fileobj].extend(data)
                if sum(len(x) for x in outputs.values())>MAX_OUTPUT:raise Failure('engine output limit exceeded')
        code=process.wait(timeout=max(.001,deadline-time.monotonic()))
        out=outputs[process.stdout].decode('utf-8','strict')
        err=outputs[process.stderr].decode('utf-8','replace')
        try:value=json.loads(out)
        except ValueError:raise Failure('engine returned invalid JSON: '+err[-2000:])
        if code!=0 or 'error' in value:raise Failure('engine failure: '+str(value.get('error',code))+' '+err[-2000:])
        if value.get('warnings') or any(x in err for x in ('INCOMPLETE_RESOURCE','BROKER_ERROR')):
            raise Failure('incomplete scan: '+str(value.get('warnings',''))+' '+err[-2000:])
        return value,{'exit_code':code,'stderr':err[-4000:],'output_bytes':len(out)+len(err)}
    finally:
        selector.close()
        if process is not None:
            try:os.killpg(process.pid,signal.SIGKILL)
            except ProcessLookupError:pass
            process.wait(timeout=3)
        for stream in outputs:stream.close()
        cleanup_children()

def main():
    parser=Parser(description=__doc__)
    parser.add_argument('mode',choices=['source','rendered'])
    parser.add_argument('--runtime',type=Path,default=DEFAULT_RUNTIME,help='root-approved fixed engine directory; hash is compiled into this adapter')
    parser.add_argument('--root',type=Path)
    parser.add_argument('--file',action='append',default=[])
    parser.add_argument('--url')
    parser.add_argument('--allow-resource',action='append',default=[])
    parser.add_argument('--trusted-local',action='store_true',help='reserved: rendered mode is unavailable and refuses before network access')
    parser.add_argument('--timeout',type=float,default=15)
    args=parser.parse_args()
    report={'schema':1,'pin':PIN,'engine_sha256':ENGINE_SHA,'mode':args.mode,'status':'error','findings':[],
            'coverage':{'attempted':[],'executed':[],'skipped':[]},'errors':[]}
    started=time.monotonic();selected={};root=None
    try:
        if not .001<=args.timeout<=90:raise Failure('timeout must be between .001 and 90 seconds')
        deadline=started+args.timeout
        def expired(signum,frame):raise Failure('whole-command wall timeout')
        signal.signal(signal.SIGALRM,expired)
        signal.setitimer(signal.ITIMER_REAL,args.timeout)
        if args.mode=='rendered':raise Failure('rendered mode is unavailable: host cannot provide Chromium namespace sandbox under NO_NEW_PRIVS; no network request was made')
        runtime=args.runtime.resolve(strict=True)
        if args.mode=='source':
            if args.url or args.allow_resource or args.trusted_local:raise Failure('rendered arguments in source mode')
            if not args.root or args.root!=args.root.resolve(strict=True):raise Failure('explicit absolute canonical Git root required')
            root=args.root
            if not (root/'.git').is_dir() or (root/'.git').is_symlink():raise Failure('ordinary Git root (.git directory) required; linked worktrees unsupported')
            if not 1<=len(args.file)<=16 or len(set(args.file))!=len(args.file):raise Failure('select 1–16 distinct files')
            selected={name:read_selected(root,name) for name in args.file}
            if sum(map(len,selected.values()))>MAX_TOTAL:raise Failure('selected source exceeds 2 MiB')
            context_skips=validate_links(selected)
            report['source_hashes']={name:digest(data) for name,data in selected.items()}
        # Temp cwd is not the security boundary. Landlock + seccomp apply before exec.
        # Transfer temporary-directory ownership and clean it without asynchronous
        # interruption. Pending alarms are delivered inside the owned context or
        # after cleanup; all actual scan work remains interruptible.
        previous_mask=signal.pthread_sigmask(signal.SIG_BLOCK,{signal.SIGALRM})
        try:
            with tempfile.TemporaryDirectory(prefix='scan-',dir=runtime) as temporary:
                try:
                    signal.pthread_sigmask(signal.SIG_SETMASK,previous_mask)
                    run=Path(temporary);(run/'scratch').mkdir();(run/'input').mkdir()
                    if args.mode=='source':
                        for name,data in selected.items():
                            path=run/'input'/name;path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(data)
                        targets=[str(run/'input'/name) for name in args.file]
                        report['coverage']['skipped']=['rendered layout/visual/JavaScript','design-system comparisons (disabled)','syntax validation (upstream parsers recover malformed markup)','CSS imports (refused, not resolved)']+context_skips
                    report['runs']=[]
                    for target in targets:
                        engine='static-html' if Path(target).suffix.lower() in {'.html','.htm'} else 'regex'
                        label=str(Path(target).relative_to(run/'input'))
                        report['coverage']['attempted'].append({'target':label,'engine':engine})
                        value,receipt=invoke(runtime,run,args.mode,target,deadline)
                        events={}
                        for event in value.get('profile',[]):
                            key=(event['engine'],event['phase'],event['ruleId'])
                            row=events.setdefault(key,{'engine':key[0],'phase':key[1],'upstream_event':key[2],'calls':0,'finding_ids':[]})
                            row['calls']+=1
                            row['finding_ids']=sorted(set(row['finding_ids'])|set(event.get('findingIds',[])))
                        report['coverage']['executed'].append({'target':label,'engine':engine,'events':list(events.values()),
                            'granularity':'upstream event groups, not proof every registered rule applied'})
                        report['runs'].append(receipt)
                        for finding in value['findings']:
                            if args.mode=='source':finding['file']=label
                            finding['upstream_severity']=finding['severity']
                            if finding.get('category')=='slop':
                                finding['severity']='advisory';finding['advisory']=True
                            finding['review_class']='style/context' if finding.get('category')=='slop' else 'quality heuristic'
                            finding['interpretation']='heuristic observation; verify against product context, not an objective defect or authorship verdict'
                            report['findings'].append(finding)
                    if root:
                        if any(read_selected(root,name)!=data for name,data in selected.items()):raise Failure('source changed during scan')
                        report['source_unchanged']=True
                finally:
                    signal.pthread_sigmask(signal.SIG_BLOCK,{signal.SIGALRM})
        finally:
            signal.pthread_sigmask(signal.SIG_SETMASK,previous_mask)
        report['status']='complete'
        signal.setitimer(signal.ITIMER_REAL,0)
    except (Failure,OSError,UnicodeError,ValueError,subprocess.SubprocessError) as exc:
        report['errors'].append(str(exc))
    signal.setitimer(signal.ITIMER_REAL,0)
    report['duration_seconds']=round(time.monotonic()-started,3)
    report['counts']={'primary':sum(f.get('severity')!='advisory' for f in report['findings']),'advisory':sum(f.get('severity')=='advisory' for f in report['findings'])}
    print(json.dumps(report,ensure_ascii=False,indent=2))
    return 1 if report['errors'] else (2 if report['counts']['primary'] else 0)

if __name__=='__main__':sys.exit(main())
