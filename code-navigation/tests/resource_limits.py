#!/usr/bin/env python3
# Exercise production child limits without allocating gigabytes of resident RAM.
import argparse,json,subprocess,sys,tempfile
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--evidence',type=Path,required=True);a=p.parse_args();a.evidence.mkdir(parents=True,exist_ok=True)
launcher=Path(__file__).resolve().parents[1]/'scripts/code_nav.py'
js=r'''
const fs=require('node:fs'),assert=require('node:assert/strict');
const guarded=process.argv[1]==='guarded';
assert.equal(new ArrayBuffer(16*1024*1024).byteLength,16*1024*1024);
let denied=false;
try { const b=new ArrayBuffer(5*1024**3); assert.equal(b.byteLength,5*1024**3); }
catch(e){if(!(e instanceof RangeError))throw e;denied=true;}
assert.equal(denied,guarded,'actual address-space exhaustion vs positive control');
const limits=fs.readFileSync('/proc/self/limits','utf8');
if(guarded){
 assert.match(limits,/Max address space\s+4294967296\s+4294967296/);
 assert.match(limits,/Max file size\s+268435456\s+268435456/);
 assert.match(limits,/Max open files\s+128\s+128/);
 assert.match(limits,/Max cpu time\s+120\s+120/);
 const fds=[];let exhausted=false;
 try{for(let i=0;i<150;i++)fds.push(fs.openSync('/dev/null','r'));}
 catch(e){assert.equal(e.code,'EMFILE');exhausted=true;}
 finally{for(const fd of fds)fs.closeSync(fd);}
 assert.ok(exhausted);
 const fd=fs.openSync(process.argv[2],'w');
 try {assert.throws(()=>fs.writeSync(fd,Buffer.from('x'),0,1,268435456),{code:'EFBIG'});}
 finally{fs.closeSync(fd);}
}
console.log(JSON.stringify({guarded,address_space_denied:denied,limits,rss_bytes:process.memoryUsage().rss}));
'''
records=[]
with tempfile.TemporaryDirectory(prefix='code-nav-limits-',dir='/tmp') as temp:
 for mode in ['positive','guarded']:
  argv=['/usr/bin/node','--max-old-space-size=512','--disable-wasm-trap-handler','-e',js,mode,str(Path(temp)/'sparse-limit')]
  if mode=='guarded':
   code="import importlib.util,os,signal; s=importlib.util.spec_from_file_location('nav',"+repr(str(launcher))+");m=importlib.util.module_from_spec(s);s.loader.exec_module(m);m.restrict_network();m.child_limits();signal.signal(signal.SIGXFSZ,signal.SIG_IGN);os.execve('/usr/bin/node',"+repr(argv)+",m.sanitized_env("+repr(temp)+"))"
   argv=[sys.executable,'-I','-B','-c',code]
  r=subprocess.run(argv,capture_output=True,text=True,timeout=10)
  records.append({'mode':mode,'exit':r.returncode,'stdout':r.stdout,'stderr':r.stderr})
  print(mode,r.returncode,flush=True)
(a.evidence/'resource-limits.json').write_text(json.dumps({'ok':all(x['exit']==0 for x in records),'records':records},indent=2))
assert all(x['exit']==0 for x in records),records
print('CODE_NAV_RESOURCE_LIMITS_OK')
