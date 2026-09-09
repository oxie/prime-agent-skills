#!/usr/bin/env python3
# Fault injection into real guarded Node engine. No production code is copied.
import argparse, json, os, subprocess, sys, tempfile
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--evidence',type=Path,required=True);a=p.parse_args();a.evidence.mkdir(parents=True,exist_ok=True)
launcher=Path(__file__).resolve().parents[1]/'scripts/code_nav.py';engine=launcher.with_name('engine.mjs')
base=Path(tempfile.mkdtemp(prefix='code-nav-faults-',dir='/tmp'));records=[]
for mode in ['source-race','extraction-read-error','missing-rust-grammar']:
 root=base/mode;repo=root/'repo';context=root/'context';repo.mkdir(parents=True);context.mkdir(mode=0o700)
 target=repo/('sample.rs' if mode=='missing-rust-grammar' else 'sample.ts')
 target.write_text('pub fn rust_leaf() -> i32 { 1 }\n' if mode=='missing-rust-grammar' else 'export function leaf() { return 1; }\n')
 subprocess.run(['/usr/bin/git','init','-q',str(repo)],check=True,env={'PATH':'/usr/bin:/bin','GIT_CONFIG_NOSYSTEM':'1','GIT_CONFIG_GLOBAL':'/dev/null'})
 marker=root/'injected';hook=root/'fault.cjs'
 hook.write_text("const fs=require('node:fs');const {syncBuiltinESMExports}=require('node:module');"+
  'const mode='+json.dumps(mode)+', target='+json.dumps(str(target))+', marker='+json.dumps(str(marker))+';'+r'''
const read=fs.readFileSync,write=fs.writeFileSync;let fired=false;
function mark(){fired=true;write(marker,'injected')}
fs.writeFileSync=function(p,...args){
 const r=write.call(this,p,...args);
 if(mode==='source-race'&&!fired&&String(p).includes('/.graph/wiring.json')){
  mark();write(target,read(target,'utf8')+'\n// Changed after extraction\n');
 }
 return r;
};
fs.readFileSync=function(p,...args){
 if(mode==='extraction-read-error'&&String(p)===target&&new Error().stack.includes('/dist/graph/build.js:')){
  mark();throw Object.assign(new Error('Injected extraction read failure'),{code:'EIO'});
 }
 if(mode==='missing-rust-grammar'&&String(p).includes('rust')&&String(p).endsWith('.wasm')){
  mark();throw Object.assign(new Error('Injected missing Rust grammar'),{code:'ENOENT'});
 }
 return read.call(this,p,...args);
};
syncBuiltinESMExports();
''')
 req={'command':'check','repo':str(repo),'context':str(context),'runtime':'/home/prime-agent/.local/share/prime-agent/graft-tools/upstream','query':None,'file':None,'symbol':None,'direction':'in','depth':1,'limit':20,'maxOutputBytes':1048576}
 argv=['/usr/bin/node','--max-old-space-size=512','--disable-wasm-trap-handler','--require',str(hook),str(engine),json.dumps(req)]
 code="import importlib.util,os; s=importlib.util.spec_from_file_location('nav',"+repr(str(launcher))+");m=importlib.util.module_from_spec(s);s.loader.exec_module(m);m.restrict_network();m.child_limits();os.execve('/usr/bin/node',"+repr(argv)+",m.sanitized_env("+repr(str(root))+"))"
 r=subprocess.run([sys.executable,'-I','-c',code],capture_output=True,text=True,timeout=20)
 try:
  output=json.loads(r.stdout)
  assert marker.exists(),'fault did not reach actual runtime operation'
  assert r.returncode!=0 and output['ok'] is False and output['health']['current'] is False,output
  if mode=='source-race':assert 'source changed' in output['error'],output
  elif mode=='missing-rust-grammar':assert 'grammar unavailable' in output['error'],output
  else:assert 'partial graph' in output['error'] or 'build failed' in output['error'],output
  records.append({'mode':mode,'passed':True,'exit':r.returncode,'output':output,'stderr':r.stderr});print('PASS',mode,flush=True)
 except Exception as e:records.append({'mode':mode,'passed':False,'exit':r.returncode,'stdout':r.stdout,'stderr':r.stderr,'error':repr(e)});print('FAIL',mode,repr(e),flush=True)
(a.evidence/'faults.json').write_text(json.dumps({'ok':all(r['passed'] for r in records),'work':str(base),'records':records},indent=2))
print('CODE_NAV_FAULTS_OK' if all(r['passed'] for r in records) else 'CODE_NAV_FAULTS_FAILED')
sys.exit(0 if all(r['passed'] for r in records) else 1)
