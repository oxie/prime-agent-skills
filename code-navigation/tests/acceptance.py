#!/usr/bin/env python3
"""Native adapter acceptance. Synthetic Git fixtures only; no model calls."""
import argparse, ctypes, errno, fcntl, hashlib, json, os, select, signal, socket, stat, struct, subprocess, sys, tempfile, time
from pathlib import Path

p=argparse.ArgumentParser()
p.add_argument('--launcher', type=Path, default=Path(__file__).resolve().parents[1]/'scripts/code_nav.py')
p.add_argument('--evidence', type=Path, required=True)
a=p.parse_args(); a.launcher=a.launcher.resolve(); a.evidence.mkdir(parents=True,exist_ok=True)
work=Path(tempfile.mkdtemp(prefix='prime-code-nav-accept-',dir='/tmp')); repo=work/'repo'; repo.mkdir(); cache_root=work/'cache'
records=[]; calls=[]
GIT_ENV={**os.environ,'GIT_CONFIG_NOSYSTEM':'1','GIT_CONFIG_GLOBAL':'/dev/null','GIT_CONFIG_COUNT':'4',
 'GIT_CONFIG_KEY_0':'core.hooksPath','GIT_CONFIG_VALUE_0':'/dev/null','GIT_CONFIG_KEY_1':'core.fsmonitor','GIT_CONFIG_VALUE_1':'false',
 'GIT_CONFIG_KEY_2':'commit.gpgsign','GIT_CONFIG_VALUE_2':'false','GIT_CONFIG_KEY_3':'tag.gpgsign','GIT_CONFIG_VALUE_3':'false'}
def git(*args, root=repo):
 r=subprocess.run(['/usr/bin/git','-C',str(root),*args],env=GIT_ENV,capture_output=True,text=True,timeout=15)
 assert r.returncode==0,(args,r.stderr)
 return r.stdout.strip()
def save(name,text):
 target=repo/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_text(text)
def snapshot(root):
 found={}
 for base,dirs,files in os.walk(root,followlinks=False):
  dirs[:]=[d for d in dirs if d!='.git']
  for name in files:
   path=Path(base)/name; rel=str(path.relative_to(root)); s=path.lstat()
   try: data=os.readlink(path) if path.is_symlink() else hashlib.sha256(path.read_bytes()).hexdigest()
   except PermissionError: data='unreadable'
   found[rel]={'mode':s.st_mode,'mtime':s.st_mtime_ns,'data':data}
 return found
def nav(command,*args,root=repo,expected=0,extra_env=None):
 before=snapshot(root) if root.exists() and root.is_dir() and root!=Path.home() else None
 argv=[sys.executable,'-I',str(a.launcher),command,'--repo',str(root),'--cache-root',str(cache_root),*map(str,args)]
 started=time.monotonic();r=subprocess.run(argv,capture_output=True,text=True,env={**os.environ,**(extra_env or {})},timeout=130)
 elapsed=time.monotonic()-started
 assert r.returncode==expected,(argv,r.returncode,r.stdout,r.stderr)
 assert not r.stderr,(argv,r.stderr)
 data=json.loads(r.stdout);assert data['ok']==(expected==0),data
 if before is not None: assert snapshot(root)==before,'source repository changed during '+command
 calls.append({'command':command,'args':list(map(str,args)),'repo':str(root),'exit':r.returncode,'elapsed_s':elapsed,'bytes':len(r.stdout.encode()),'output':data})
 return data
def case(name, fn):
 started=time.monotonic()
 try: fn()
 except Exception as e:
  records.append({'name':name,'passed':False,'error':repr(e),'seconds':time.monotonic()-started});print('FAIL',name,repr(e),flush=True);return
 records.append({'name':name,'passed':True,'seconds':time.monotonic()-started});print('PASS',name,flush=True)
def require(condition, detail=None):
 assert condition,detail
def ids(data):return [x['id'] for x in data['result']['items']]
def call_ids(data):
 assert len(data['result']['items'])==1,data
 return {x['id'] for x in data['result']['items'][0]['items'] if x['relation']=='calls'}
fixtures={
 'src/core.ts':'export function parseToken(value: string): string { return value.trim(); }\nexport function otherToken(value: string): string { return value.toUpperCase(); }\n',
 'src/service.ts':'import { parseToken, otherToken } from "./core";\nexport function authenticate(value: string): string { return parseToken(value); }\n',
 'src/unrelated.ts':'export function parseToken(value: string): number { return value.length; }\nexport function isolated(value: string): number { return parseToken(value); }\n',
 'py/helpers.py':'def normalize(value):\n    return value.strip()\n',
 'py/worker.py':'from helpers import normalize\n\ndef process(value):\n    return normalize(value)\n',
 'config/settings.yaml':'not-a-code-file: normal-grep-needed\n',
 '.gitignore':'ignored/\n','.ignore':'# unchanged\n','AGENTS.md':'# Fixture\nNever rewrite this file.\n'}
# Strings above are source fixtures, never executed.
for name,text in fixtures.items():save(name,text)
git('init','-q');git('add','.');git('-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','-qm','fixture')
host_paths=[Path.home()/x for x in ['AGENTS.md','.gitignore','.ignore','.claude/settings.json','.claude.json','.codex/config.toml']]
def host_snapshot():
 return {str(x):None if not x.exists() else {'sha256':hashlib.sha256(x.read_bytes()).hexdigest(),'mode':x.stat().st_mode,'mtime':x.stat().st_mtime_ns} for x in host_paths}
host_before=host_snapshot(); state={}
try:
 def index():
  v=nav('index');assert v['result']['files']==5,v
  assert v['health']['current'] is True;state['cache']=Path(v['health']['cache']);state['identity']=v['health']['identity']
 case('index-real-ts-python-fixture',index)
 case('map-files',lambda: (lambda v: require(v['result']['totals']['files']==5,v))(nav('map')))
 def outline():
  v=nav('outline','--file','src/core.ts');assert [n['name'] for n in v['result']['items']]==['parseToken','otherToken'],v
 case('outline-exact-definition-order',outline)
 def duplicate():
  v=nav('find','--symbol','parseToken');assert ids(v)==['src/core.ts#parseToken','src/unrelated.ts#parseToken'],v
 case('duplicate-name-identities',duplicate)
 def incoming():
  v=nav('trace','--symbol','parseToken','--file','src/core.ts');assert call_ids(v)=={'src/service.ts#authenticate'},v
  edges=[e for h in v['result']['items'][0]['items'] for e in h['edges'] if e['relation']=='calls']
  assert edges and all(e['target']=='src/core.ts#parseToken' and e['confidence'] in ['extracted','inferred'] for e in edges)
 case('incoming-exact-imported-caller-not-same-name-neighbor',incoming)
 case('outgoing-exact-callee',lambda: (lambda v: require(call_ids(v)=={'src/core.ts#parseToken'},v))(nav('trace','--symbol','authenticate','--direction','out')))
 case('python-import-call',lambda: (lambda v: require(call_ids(v)=={'py/helpers.py#normalize'},v))(nav('trace','--symbol','process','--direction','out')))
 def findquery():
  v=nav('find','--query','authenticate token');assert any(x['path']=='src/service.ts' for x in v['result']['items']),v
  assert not any('tokens saved' in str(x).lower() for x in v['result']['items'])
 case('lexical-query-native-ranking',findquery)
 case('unknown-symbol-explicit-empty',lambda: (lambda v: require(v['result']['items']==[] and v['result']['total']==0,v))(nav('find','--symbol','definitelyAbsentXYZZY')))
 def cap():
  v=nav('find','--symbol','parseToken','--limit',1);assert v['result']['truncated'] and v['result']['omitted']==1 and ids(v)==['src/core.ts#parseToken'],v
 case('bounded-results-truncation-and-order',cap)
 def reuse():
  v=nav('check');assert v['result']['parsed']==0 and v['result']['reused']==5,v
 case('unchanged-content-parse-reuse',reuse)
 def same_stat():
  f=repo/'src/service.ts';old=f.stat();text=f.read_text();new=text.replace('return parseToken(value)','return otherToken(value)');assert len(new)==len(text)
  f.write_text(new);os.utime(f,ns=(old.st_atime_ns,old.st_mtime_ns));assert f.stat().st_size==old.st_size and f.stat().st_mtime_ns==old.st_mtime_ns
  v=nav('trace','--symbol','authenticate','--direction','out');assert call_ids(v)=={'src/core.ts#otherToken'},v
 case('same-size-same-mtime-edit-refreshes-real-edge',same_stat)
 def removal():
  (repo/'py/worker.py').unlink();v=nav('find','--symbol','process');assert ids(v)==[],v
  (repo/'src/unrelated.ts').rename(repo/'src/renamed.ts');v=nav('find','--symbol','parseToken');assert ids(v)==['src/core.ts#parseToken','src/renamed.ts#parseToken'],v
 case('delete-and-rename-removes-old-identities',removal)
 def worktree():
  wt=work/'worktree';git('worktree','add','--detach',str(wt),'HEAD');v=nav('trace','--symbol','authenticate','--direction','out',root=wt)
  assert call_ids(v)=={'src/core.ts#parseToken'} and v['health']['identity']!=state['identity'];state['worktree']=wt;state['worktree_cache']=Path(v['health']['cache'])
 case('linked-worktree-isolated-content-and-cache',worktree)
 def ignored():
  save('ignored/secret.ts','export function ignoredSecret() {}\n');v=nav('find','--symbol','ignoredSecret');assert ids(v)==[],v
 case('gitignored-file-excluded',ignored)
 def corrupt():
  graph=state['cache']/'context/.graph/wiring.json';graph.write_text('{bad');v=nav('trace','--symbol','authenticate','--direction','out');assert call_ids(v)=={'src/core.ts#otherToken'} and v['health']['recovery'],v
 case('corrupt-cache-rebuilds-real-results',corrupt)
 def control_shape():
  for malformed in [[],None,'scalar',7,True]:
   (state['cache']/'ready.json').write_text(json.dumps(malformed))
   v=nav('check');assert v['health']['recovery']=='corrupt cache rebuilt' and v['result']['parsed']==4,v
 case('valid-json-wrong-control-shapes-recover-with-json',control_shape)
 def contamination():
  cache=state['cache'];graph=cache/'context/.graph/wiring.json';g=json.loads(graph.read_text());n=next(n for n in g['nodes'] if n['kind']!='file');n.update(summary='old summary',crux={'code':'OBSOLETE','span':n['span']},summary_state='stale');graph.write_text(json.dumps(g))
  ready=cache/'ready.json';r=json.loads(ready.read_text());r['files']['.graph/wiring.json']=hashlib.sha256(graph.read_bytes()).hexdigest();ready.write_text(json.dumps(r))
  v=nav('map',expected=1);assert 'contamination' in v['error'],v;assert not ready.exists()
  v=nav('check');assert v['ok'] and v['health']['recovery']=='unfinished cache rebuilt'
 case('checksummed-stale-deep-cache-refused-and-recovered',contamination)
 def malformed_control():
  save('.graft/config.json',json.dumps({'followNestedRepos':True}));v=nav('index',expected=1);assert 'widens scope' in v['error'],v
  (repo/'.graft/config.json').unlink();(repo/'.graft').rmdir();nav('check')
 case('scope-expanding-repository-options-refused',malformed_control)
 def source_denial():
  f=repo/'src/core.ts';f.chmod(0)
  try:v=nav('check',expected=1);assert v['health']['current'] is False
  finally:f.chmod(0o644)
  nav('check')
 case('unreadable-source-cannot-publish-current',source_denial)
 def lock():
  lock=state['cache'].parent/(state['identity']+'.lock')
  with lock.open('r+') as f:
   fcntl.flock(f,fcntl.LOCK_EX)
   v=nav('map','--lock-timeout-seconds',0,expected=1);assert 'lock busy' in v['error'];assert (state['cache']/'ready.json').exists()
 case('busy-lock-no-stale-success-no-owner-deletion',lock)
 def scope():
  nav('index',root=Path.home(),expected=1)
  nav('outline','--file','../outside',expected=1)
  link=work/'symlink-cache';link.symlink_to(cache_root,target_is_directory=True)
  v=nav('map','--cache-root',str(link),expected=1);assert 'symlinked' in v['error']
  link.unlink()
 case('home-traversal-symlink-cache-refused',scope)
 def preload():
  flag=work/'preload-ran';hook=work/'preload.cjs';hook.write_text("require('node:fs').writeFileSync("+json.dumps(str(flag))+",'BAD')")
  nav('map',extra_env={'NODE_OPTIONS':'--require '+str(hook),'OPENAI_API_KEY':'fixture-not-a-secret','GRAFT_API_KEY':'fixture-not-a-secret','GRAFT_PROVIDER':'invalid-provider','GRAFT_DIR':str(work/'unwanted')})
  assert not flag.exists() and not (work/'unwanted').exists()
 case('node-preload-provider-and-directory-env-ignored',preload)
 def output_bound():
  v=nav('map','--max-output-bytes',1024,expected=1);assert 'output' in v['error'],v
  assert not (state['cache']/'ready.json').exists();nav('check')
 case('actual-small-output-cap-refuses-partial-answer',output_bound)
 def network():
  # Positive control proves the host could create the exact socket we then deny.
  socket.socket(socket.AF_INET,socket.SOCK_STREAM).close()
  code="import importlib.util, socket, errno; s=importlib.util.spec_from_file_location('nav',"+repr(str(a.launcher))+"); m=importlib.util.module_from_spec(s); s.loader.exec_module(m); m.restrict_network();\ntry:\n socket.socket(socket.AF_INET,socket.SOCK_STREAM)\nexcept OSError as e:\n assert e.errno==errno.EPERM; print('NETWORK_DENIED')\nelse:\n raise AssertionError('network socket allowed')\n"
  r=subprocess.run([sys.executable,'-I','-c',code],capture_output=True,text=True,timeout=5);assert r.returncode==0 and r.stdout.strip()=='NETWORK_DENIED',(r.stdout,r.stderr)
 case('real-network-syscall-positive-and-negative-control',network)
 def interrupt():
  cache=state['cache'];assert (cache/'ready.json').exists()
  libc=ctypes.CDLL(None,use_errno=True);fd=libc.inotify_init1(os.O_NONBLOCK|os.O_CLOEXEC);assert fd>=0
  assert libc.inotify_add_watch(fd,str(cache).encode(),0x200)>=0
  proc=subprocess.Popen([sys.executable,'-I',str(a.launcher),'index','--repo',str(repo),'--cache-root',str(cache_root)],stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
  try:
   assert select.select([fd],[],[],10)[0],'no build invalidation event'
   raw=os.read(fd,65536);offset=0;names=[]
   while offset+16<=len(raw):
    wd,mask,cookie,n=struct.unpack_from('iIII',raw,offset);names.append(raw[offset+16:offset+16+n].split(b'\0')[0]);offset+=16+n
   assert b'ready.json' in names,names
   proc.send_signal(signal.SIGTERM);out,err=proc.communicate(timeout=10);assert proc.returncode!=0,(out,err)
   assert not (cache/'ready.json').exists();nav('check')
  finally:
   os.close(fd)
   if proc.poll() is None:proc.kill();proc.wait()
 case('interrupt-after-invalidation-no-ready-publication',interrupt)
 def forgetting():
  main=state['cache'];wt=state['worktree'];other=state['worktree_cache'];assert main.exists() and other.exists()
  v=nav('forget',root=wt);assert v['result']['removed'] and not other.exists() and main.exists()
  v=nav('forget');assert v['result']['removed'] and not main.exists();v=nav('forget');assert v['result']['removed'] is False
  nav('index')
 case('forget-exact-cache-idempotent-and-reindex',forgetting)
 case('host-configuration-unchanged',lambda: (lambda actual: require(actual==host_before,actual))(host_snapshot()))
 result={'ok':all(x['passed'] for x in records),'work':str(work),'records':records,'calls':calls,'host_unchanged':host_snapshot()==host_before}
 print('CODE_NAV_ACCEPTANCE_OK' if result['ok'] else 'CODE_NAV_ACCEPTANCE_FAILED',len(records),flush=True)
except BaseException as e:
 result={'ok':False,'work':str(work),'error':repr(e),'records':records,'calls':calls}
 raise
finally:
 (a.evidence/'acceptance.json').write_text(json.dumps(result,indent=2))
sys.exit(0 if result['ok'] else 1)
