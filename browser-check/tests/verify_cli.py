#!/usr/bin/env python3
"""Independent local-only actual browser-check CLI fixtures. Root approval required.
Run in browser-use-tools native venv. Does not install, patch or import CLI internals.
"""
import argparse, asyncio, ctypes, hashlib, http.server, json, os, selectors
from pathlib import Path
import signal, socket, stat, struct, subprocess, threading, time, urllib.parse, zlib, re, tempfile

SKILL_ROOT=Path(__file__).resolve().parents[1]
CLI=SKILL_ROOT/'scripts/check.py'
PYTHON=Path('/home/prime-agent/.local/share/prime-agent/browser-use-tools/.venv/bin/python')
TOKEN='synthetic-input-canary'
CANARY=b'owned-local-download-canary\n'


def require(ok,message):
    if not ok:raise AssertionError(message)

def atomic(path,data):
    temp=path.with_suffix('.partial');temp.write_text(json.dumps(data,indent=2));temp.replace(path)

def children():
    result=set()
    for task in Path('/proc/self/task').iterdir():
        try:result.update(map(int,(task/'children').read_text().split()))
        except FileNotFoundError:pass
    return result

def ticks(pid):
    return Path(f'/proc/{pid}/stat').read_text().rsplit(') ',1)[1].split()[19]

def cleanup_adopted():
    """Emergency cleanup ONLY own direct children; never broad/numeric group kills."""
    killed=[];deadline=time.monotonic()+8
    while children():
        require(time.monotonic()<deadline,'Harness emergency cleanup deadline')
        for pid in children():
            fd=os.pidfd_open(pid)
            try:
                row=Path(f'/proc/{pid}/stat').read_text().rsplit(') ',1)[1].split()
                require(int(row[1])==os.getpid(),'Emergency cleanup refused unrelated PID')
                try:signal.pidfd_send_signal(fd,signal.SIGKILL)
                except ProcessLookupError:pass
                with selectors.DefaultSelector() as poll:
                    poll.register(fd,selectors.EVENT_READ)
                    require(poll.select(max(0,deadline-time.monotonic())),'Owned adopted child did not exit')
                got,status=os.waitpid(pid,os.WNOHANG);require(got==pid,'Owned adopted child not reaped')
                killed.append({'pid':pid,'start_ticks':row[19],'wait_status':status})
            finally:os.close(fd)
    return killed

PAGE=r"""<!doctype html><html><head><meta charset="utf-8"><title>Owned CLI fixture</title>
<style>html{font-family:sans-serif}body{margin:0;min-height:2600px;background:linear-gradient(#d9e9ff,#f6dfc4)}
main{max-width:800px;margin:16px;padding:16px;background:white}button,input{font:inherit;padding:10px;margin:5px}
#motion{width:30px;height:30px;background:#123;animation:move 8s linear infinite}
@keyframes move{to{transform:translateX(50px)}}@media(prefers-reduced-motion:reduce){#motion{animation:none}}
#scrolled{position:fixed;bottom:10px;left:10px;background:#fff;padding:10px}</style></head>
<body><main><h1>LOCAL_FIXTURE</h1><p id="layout"></p><p id="motion-state"></p><div id="motion"></div>
<input id="text" autocomplete="off"><button id="apply">Apply</button><p id="input-state"></p><p id="key-state"></p><p id="click-state"></p>
<input id="password" type="password"><input id="file" type="file"><input id="otp" autocomplete="one-time-code">
<button class="ambiguous">one</button><button class="ambiguous">two</button>
<a id="download" href="/attachment/__CASE__">Download owned canary</a>
<a id="download-target" target="_blank" href="/attachment/__CASE__">New-target download</a>
<button id="confirm">Unexpected confirm</button><button id="cancel">Cancellation checkpoint</button>
<div id="probe-state"></div><div id="download-state"></div></main>
<script>
const CASE=__CASE_JSON__,OTHER=__OTHER_JSON__,TOKEN='synthetic-input-canary';
const post=(kind,data)=>fetch('/event/'+CASE+'/'+kind,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}).catch(()=>{});
const text=document.querySelector('#text');
text.addEventListener('input',e=>{if(e.isTrusted&&text.value===TOKEN){document.querySelector('#input-state').textContent='INPUT_OK';post('input',{trusted:true,matched:true})}});
addEventListener('keydown',e=>{if(e.isTrusted&&e.key==='Enter'){document.querySelector('#key-state').textContent='KEYBOARD_OK';post('key',{trusted:true,key:'Enter'})}});
document.querySelector('#apply').onclick=e=>{if(e.isTrusted&&text.value===TOKEN){document.querySelector('#click-state').textContent='CLICK_OK';post('click',{trusted:true,matched:true})}};
addEventListener('wheel',e=>{if(e.isTrusted)post('wheel',{trusted:true})},{passive:true});
addEventListener('scroll',()=>{if(scrollY>100&&!document.querySelector('#scrolled')){let p=document.createElement('p');p.id='scrolled';p.textContent='SCROLL_OK';document.body.append(p)}});
document.querySelector('#layout').textContent=innerWidth<500?'NARROW_LAYOUT':'WIDE_LAYOUT';
document.querySelector('#motion-state').textContent=getComputedStyle(document.querySelector('#motion')).animationName==='none'?'ANIMATION_OFF':'ANIMATION_ON';
document.querySelector('#confirm').onclick=async()=>{await post('confirm-opened',{});let accepted=confirm('Synthetic confirmation; do not accept');await post(accepted?'confirm-accepted':'confirm-canceled',{});};
document.querySelector('#cancel').onclick=()=>post('cancel-ready',{});
document.querySelector('#download').onclick=()=>{setTimeout(async()=>{await fetch('/checkpoint/'+CASE);document.querySelector('#download-state').id='download-done'},800)};
if(CASE==='cross-port'){
 const image=new Promise(resolve=>{let x=new Image();x.onload=x.onerror=resolve;x.src=OTHER+'/blocked-image';document.body.append(x)});
 const frame=new Promise(resolve=>{let x=document.createElement('iframe');x.onload=x.onerror=resolve;x.src=OTHER+'/blocked-frame';document.body.append(x)});
 const request=fetch(OTHER+'/blocked-fetch').then(()=>{},()=>{});
 const ws=new Promise(resolve=>{let x=new WebSocket(OTHER.replace('http:','ws:')+'/blocked-websocket');x.onopen=()=>{x.close();resolve()};x.onerror=resolve});
 Promise.all([image,frame,request,ws]).then(()=>{document.querySelector('#probe-state').id='probes-done';post('probes-settled',{})});
}
let ready=document.createElement('p');ready.id='ready';ready.textContent='READY';document.body.append(ready);
</script></body></html>"""

class State:
    def __init__(self,loop):
        self.loop=loop;self.lock=threading.Lock();self.hits={};self.events={};self.waiters={};self.checkpoints={};self.active={}
    def hit(self,path):
        with self.lock:self.hits[path]=self.hits.get(path,0)+1
    def event(self,case,kind,value):
        with self.lock:
            key=case+'/'+kind;self.events.setdefault(key,[]).append(value)
            require(len(self.events[key])<=128,'Fixture event bound')
        event=self.waiters.get(key)
        if event:self.loop.call_soon_threadsafe(event.set)
    def snapshot(self):
        with self.lock:return {'hits':dict(self.hits),'events':dict(self.events),'checkpoints':dict(self.checkpoints)}

class Server(http.server.ThreadingHTTPServer):
    daemon_threads=True

class Handler(http.server.BaseHTTPRequestHandler):
    protocol_version='HTTP/1.1'
    def log_message(self,*args):pass
    def respond(self,body=b'',status=200,headers=None):
        self.send_response(status);self.send_header('Content-Length',str(len(body)));self.send_header('Connection','close')
        if 'Content-Type' not in (headers or {}):self.send_header('Content-Type','text/html; charset=utf-8')
        for key,value in (headers or {}).items():self.send_header(key,value)
        self.end_headers()
        try:self.wfile.write(body)
        except (BrokenPipeError,ConnectionResetError):pass
    def do_GET(self):
        path=urllib.parse.urlsplit(self.path).path;state=self.server.state;state.hit(path)
        if self.server.sentinel:self.respond(b'sentinel positive control');return
        if path.startswith('/page/'):
            case=path.removeprefix('/page/')
            require(case in CASE_NAMES,'Unknown fixture case')
            page=PAGE.replace('__CASE__',case).replace('__CASE_JSON__',json.dumps(case)).replace('__OTHER_JSON__',json.dumps(self.server.other))
            self.respond(page.encode());return
        if path=='/redirect':self.respond(status=302,headers={'Location':self.server.other+'/blocked-redirect'});return
        if path.startswith('/attachment/'):
            self.respond(CANARY,headers={'Content-Disposition':'attachment; filename="cli-policy-canary.txt"','Content-Type':'application/octet-stream'});return
        if path.startswith('/checkpoint/'):
            case=path.removeprefix('/checkpoint/');active=state.active[case]
            try:
                require(ticks(active['pid'])==active['start_ticks'],'Live checkpoint CLI identity changed')
                work=Path(f"/proc/{active['pid']}/cwd").resolve(strict=True)
                require(work.parent==state.temp_root/case and work.name.startswith('browser-check-'),'CLI work escaped exact owned short temp case')
                files=list(work.rglob('*'));require(len(files)<=8192,'Live work inventory bound')
                found=[str(p.relative_to(work)) for p in files if 'cli-policy-canary' in p.name or p.suffix=='.crdownload']
                state.checkpoints[case]={'work':str(work),'forbidden_files':found,'files_seen':len(files)}
                self.respond(b'checkpoint');return
            except Exception as exc:
                state.checkpoints[case]={'error':type(exc).__name__+': '+str(exc)};self.respond(status=500);return
        self.respond(status=404)
    def do_POST(self):
        path=urllib.parse.urlsplit(self.path).path;self.server.state.hit(path)
        size=int(self.headers.get('Content-Length','0'));require(0<=size<=4096,'Fixture payload bound')
        body=json.loads(self.rfile.read(size) or b'{}')
        parts=path.split('/');require(len(parts)==4 and parts[1]=='event','Unexpected fixture event')
        self.server.state.event(parts[2],parts[3],body);self.respond(b'OK')

POS_ACTIONS=[{'action':'wait-for','selector':'#ready'},{'action':'fill','selector':'#text','value':TOKEN},
 {'action':'press','key':'Enter'},{'action':'click','selector':'#apply'},
 {'action':'scroll','x':0,'y':650},{'action':'wait-for','selector':'#scrolled'},{'action':'screenshot'}]
BROWSER_CASES=[
 ('wide',POS_ACTIONS,False),('narrow-reduced',POS_ACTIONS,False),
 ('cross-port',[{'action':'wait-for','selector':'#probes-done'}],False),
 ('redirect',[],True),
 ('download',[{'action':'click','selector':'#download'},{'action':'wait-for','selector':'#download-done'}],False),
 ('download-new-target',[{'action':'click','selector':'#download-target'}],True),
 ('confirm',[{'action':'click','selector':'#confirm'}],True),
 ('password',[{'action':'fill','selector':'#password','value':TOKEN}],True),
 ('file',[{'action':'fill','selector':'#file','value':TOKEN}],True),
 ('otp',[{'action':'fill','selector':'#otp','value':TOKEN}],True),
 ('ambiguous',[{'action':'click','selector':'.ambiguous'}],True),
 ('missing',[{'action':'click','selector':'#not-present'}],True),
 ('cancel',[{'action':'click','selector':'#cancel'},{'action':'wait-for','selector':'#never'}],True)]
CASE_NAMES={row[0] for row in BROWSER_CASES}|{'preflight'}

def environment(home,tmp):
    return {'PATH':'/usr/bin:/bin','LANG':'C.UTF-8','HOME':str(home),'TMPDIR':str(tmp),
      'PYTHON_DOTENV_DISABLED':'1','ANONYMIZED_TELEMETRY':'false','BROWSER_USE_CLOUD_SYNC':'false',
      'BROWSER_USE_SETUP_LOGGING':'false','BROWSER_USE_DISABLE_EXTENSIONS':'1','BROWSER_USE_VERSION_CHECK':'false',
      'BROWSER_USE_LOGGING_LEVEL':'error','LMNR_LOGGING_LEVEL':'error','BROWSER_CHECK_CLEAN':'1'}

async def invoke(state,name,url,actions,extra=(),cancel=False,preflight=False,raw=None,existing=False,relative=False):
    base=state.run_root/name;base.mkdir(mode=0o700)
    tmp=state.temp_root/name;tmp.mkdir(mode=0o700);home=base/'home';home.mkdir(mode=0o700)
    output=base/'output';action_file=base/'actions.json'
    action_file.write_bytes(raw if raw is not None else json.dumps(actions).encode())
    if existing:output.mkdir(mode=0o700);(output/'keep.txt').write_text('unchanged')
    argv=[str(PYTHON),'-I','-B',str(CLI),'--url',url,'--output',str(output) if not relative else 'relative-output','--actions',str(action_file),*extra]
    receipt={'name':name,'argv':argv,'preflight':preflight,'cancel':cancel}
    with (base/'stdout.txt').open('xb') as stdout,(base/'stderr.txt').open('xb') as stderr:
        process=subprocess.Popen(argv,cwd=base,env=environment(home,tmp),stdout=stdout,stderr=stderr,stdin=subprocess.DEVNULL,close_fds=True)
        # Popen hasn't been polled/reaped. Pin the child before creating its wait thread.
        pidfd=os.pidfd_open(process.pid);state.active[name]={'pid':process.pid,'start_ticks':ticks(process.pid)}
        waiter=asyncio.create_task(asyncio.to_thread(process.wait));started=time.monotonic()
        try:
            if cancel:
                event=state.waiters[name+'/cancel-ready']
                checkpoint=asyncio.create_task(event.wait())
                try:await asyncio.wait({checkpoint,waiter},timeout=30,return_when=asyncio.FIRST_COMPLETED)
                finally:
                    if not checkpoint.done():checkpoint.cancel()
                    await asyncio.gather(checkpoint,return_exceptions=True)
                require(event.is_set(),'Cancellation fixture never reached owned action checkpoint')
                signal.pidfd_send_signal(pidfd,signal.SIGTERM);receipt['sigterm_sent']=True
            receipt['exit_code']=await asyncio.wait_for(asyncio.shield(waiter),45 if not cancel else 15)
        except BaseException as exc:
            receipt['harness_error']=type(exc).__name__+': '+str(exc)
            try:signal.pidfd_send_signal(pidfd,signal.SIGTERM)
            except ProcessLookupError:pass
            try:receipt['exit_code']=await asyncio.wait_for(asyncio.shield(waiter),12)
            except asyncio.TimeoutError:
                try:signal.pidfd_send_signal(pidfd,signal.SIGKILL)
                except ProcessLookupError:pass
                receipt['exit_code']=await asyncio.wait_for(asyncio.shield(waiter),3)
            if isinstance(exc,asyncio.CancelledError):raise
        finally:os.close(pidfd)
    receipt['seconds']=time.monotonic()-started
    report=output/'report.json'
    receipt['report']=json.loads(report.read_text()) if report.is_file() else None
    receipt['leftover_children']=sorted(children())
    receipt['emergency_cleanup']=cleanup_adopted() if children() else []
    receipt['private_tmp_entries']=[p.name for p in tmp.iterdir()]
    receipt['private_tmp_path']=str(tmp)
    if not receipt['private_tmp_entries'] and not children():tmp.rmdir()
    receipt['output_mode']=stat.S_IMODE(output.stat().st_mode) if output.exists() else None
    receipt['existing_marker_intact']=(output/'keep.txt').read_text()=='unchanged' if existing else None
    atomic(base/'receipt.json',receipt)
    return receipt,output

def verify_png(data,width,height):
    require(data[:8]==b'\x89PNG\r\n\x1a\n','Not actual PNG')
    at=8;compressed=[];header=None;ended=False
    while at<len(data):
        require(at+12<=len(data),'Truncated PNG chunk')
        length=struct.unpack('>I',data[at:at+4])[0];kind=data[at+4:at+8]
        require(at+12+length<=len(data),'PNG chunk exceeds file')
        payload=data[at+8:at+8+length]
        require(zlib.crc32(kind+payload)&0xffffffff==struct.unpack('>I',data[at+8+length:at+12+length])[0],'PNG CRC mismatch')
        if kind==b'IHDR':header=struct.unpack('>IIBBBBB',payload)
        if kind==b'IDAT':compressed.append(payload)
        at+=12+length
        if kind==b'IEND':ended=True;break
    require(ended and at==len(data) and header is not None,'Incomplete PNG structure')
    w,h,depth,color,compression,filtering,interlace=header
    require((w,h)==(width,height),'Actual PNG dimensions differ')
    require(depth==8 and color in (2,6) and compression==filtering==interlace==0,'Unexpected Chrome PNG format')
    stride=w*(3 if color==2 else 4)+1;size=stride*h
    inflater=zlib.decompressobj();raster=inflater.decompress(b''.join(compressed),size+1)
    require(len(raster)==size and inflater.eof,'Invalid/bounded PNG raster')
    require(all(raster[row*stride]<=4 for row in range(h)),'Invalid PNG row filter')

def assert_browser(state,receipt,output,expected_failure):
    require('harness_error' not in receipt,'Harness deadline/error: '+str(receipt.get('harness_error')))
    require(receipt['exit_code']==(1 if expected_failure else 0),'Unexpected actual CLI exit')
    record=receipt['report'];require(isinstance(record,dict),'No actual CLI report')
    require(record['status']==('incomplete' if expected_failure else 'complete'),'Incorrect completion status')
    require(bool(record['errors'])==expected_failure,'Missing/extra operational errors')
    require(record['cleanup'].get('no_owned_children') is True,'No explicit browser child cleanup proof')
    require(record['cleanup'].get('private_profile_removed') is True,'Private profile removal not confirmed')
    require(record['cleanup'].get('session_disconnected') is True,'Session disconnect not confirmed')
    require(not receipt['leftover_children'] and not receipt['emergency_cleanup'],'CLI left adopted browser descendants')
    require(not receipt['private_tmp_entries'],'Private browser work remains')
    require(receipt['output_mode']==0o700,'Output not private0700')
    require(record.get('browser_pid'),'Browser launch never reached')
    require(record.get('browser_version',{}).get('product','').endswith('/153.0.8010.36'),'Maintained browser version not proved')
    sandbox=record.get('sandbox_text','')
    require('You are adequately sandboxed' in sandbox,'Actual native sandbox verdict missing')
    for feature in ('PID namespaces','Network namespaces','Seccomp-BPF sandbox'):
        require(re.search(re.escape(feature)+r'\s+Yes',sandbox),'Native sandbox feature missing: '+feature)
    renderers=[row for row in record.get('owned_processes',[]) if row.get('renderer')]
    require(renderers and all(row['status'].get('NoNewPrivs')=='1' and row['status'].get('Seccomp')=='2' for row in renderers),'Actual renderer protections missing')
    require(not Path('/proc/'+str(record['browser_pid'])).exists(),'Owned browser PID still exists')
    for row in record.get('owned_processes',[]):
        try:current=ticks(row['pid'])
        except FileNotFoundError:continue
        require(current!=row['start_ticks'],'Recorded owned process still exists')
    optional=record.get('optional_watchdog_policy',{})
    require(optional.get('disabled_watchdogs')==['DownloadsWatchdog','PopupsWatchdog'],'Both optional watchers not explicitly disabled')
    require(record.get('actions_sha256')==hashlib.sha256((output.parent/'actions.json').read_bytes()).hexdigest(),'Action-input digest mismatch')
    for filename in ('report.json','dom.json'):
        if (output/filename).exists():require(TOKEN not in (output/filename).read_text(),'Input value leaked into diagnostics')
    for image in record['screenshots']:
        data=(output/image['file']).read_bytes();require(data[:8]==b'\x89PNG\r\n\x1a\n','Not actual PNG')
        require(len(data)==image['bytes'] and hashlib.sha256(data).hexdigest()==image['sha256'],'Screenshot receipt mismatch')
        verify_png(data,record['viewport']['width'],record['viewport']['height'])
    return record

async def run(args):
    os.umask(0o077);root=args.output.resolve()
    require(args.output.is_absolute() and args.output.parent.resolve()==args.output.parent,'Use a canonical absolute output parent')
    require(not args.output.exists() and not args.output.is_symlink(),'Output must be new')
    require(not root.is_relative_to(SKILL_ROOT),'Test output must stay outside the skill')
    root.mkdir(mode=0o700)
    task=asyncio.current_task();loop=asyncio.get_running_loop()
    for sig in (signal.SIGTERM,signal.SIGINT):loop.add_signal_handler(sig,task.cancel)
    require(not children(),'Harness requires fresh child-free native process')
    libc=ctypes.CDLL(None,use_errno=True);require(libc.prctl(36,1,0,0,0)==0,'Harness subreaper unavailable')
    state=State(asyncio.get_running_loop());state.run_root=root
    state.temp_root=Path(tempfile.mkdtemp(prefix='bct-',dir='/tmp'))
    require(stat.S_IMODE(state.temp_root.stat().st_mode)==0o700,'Test temp root not private')
    sentinel=Server(('127.0.0.1',0),Handler);primary=Server(('127.0.0.1',0),Handler)
    for server,is_sentinel in ((sentinel,True),(primary,False)):
        server.state=state;server.sentinel=is_sentinel;server.other=f'http://127.0.0.1:{sentinel.server_port}'
    threads=[threading.Thread(target=s.serve_forever,kwargs={'poll_interval':.05},daemon=True) for s in (primary,sentinel)]
    for thread in threads:thread.start()
    source_hashes={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in CLI.parent.glob('*.py')}
    result={'status':'incomplete','source_sha256':source_hashes,'harness_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'cases':[],
      'servers':{'approved':primary.server_port,'sentinel':sentinel.server_port},'scope':'Owned local fixtures only; no hostile-native-code or OS isolation claim'}
    origin=f'http://127.0.0.1:{primary.server_port}'
    try:
        # Real positive sentinel reachability, without environment proxies or any other host.
        with socket.create_connection(('127.0.0.1',sentinel.server_port),timeout=2) as conn:
            conn.sendall(b'GET /positive-control HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n')
            require(b'200' in conn.recv(1024),'Sentinel positive control failed')
        require(state.hits.get('/positive-control')==1,'No positive server control receipt')
        for name,actions,failure in BROWSER_CASES:
            if args.case and name!=args.case:continue
            case={'name':name,'pass':False};result['cases'].append(case)
            try:
                if name=='cancel':state.waiters[name+'/cancel-ready']=asyncio.Event()
                extra=['--width','390','--height','700','--reduced-motion'] if name=='narrow-reduced' else ['--width','1024','--height','768']
                receipt,output=await invoke(state,name,origin+('/redirect' if name=='redirect' else '/page/'+name),actions,extra,cancel=name=='cancel')
                record=assert_browser(state,receipt,output,failure)
                if name in ('wide','narrow-reduced'):
                    dom=json.loads((output/'dom.json').read_text())
                    for marker in ('INPUT_OK','KEYBOARD_OK','CLICK_OK','SCROLL_OK'):require(marker in dom['text'],'Missing genuine input outcome '+marker)
                    require(dom['scroll']['y']>100,'Native wheel did not scroll document')
                    require(dom['reducedMotion']==(name=='narrow-reduced'),'Reduced motion state mismatch')
                    require(('NARROW_LAYOUT' if name=='narrow-reduced' else 'WIDE_LAYOUT') in dom['text'],'Responsive layout outcome missing')
                    require(('ANIMATION_OFF' if name=='narrow-reduced' else 'ANIMATION_ON') in dom['text'],'CSS motion state not applied')
                    require(not dom['horizontalOverflow'],'Fixture unexpectedly overflows')
                    for event in ('input','key','click','wheel'):
                        require(any(v.get('trusted') is True for v in state.events.get(name+'/'+event,[])),'No real trusted '+event+' event')
                    require(record['screenshots'][0]['sha256']!=record['screenshots'][-1]['sha256'],'Initial/final images unexpectedly identical')
                if name in ('cross-port','redirect'):
                    require(not any(path.startswith('/blocked-') for path in state.hits),'Unapproved live port received a browser request')
                if name=='cross-port':require(state.events.get(name+'/probes-settled'),'Not all negative subresource attempts settled')
                if name=='download':
                    require(state.hits.get('/attachment/download',0)>=1,'Actual attachment endpoint not exercised')
                    require(state.checkpoints.get(name) and not state.checkpoints[name].get('error'),'No live download checkpoint')
                    require(state.checkpoints[name]['forbidden_files']==[],'A download file was written')
                    states=[row.get('state') for row in record.get('downloads',[]) if isinstance(row,dict)]
                    require('canceled' in states and 'completed' not in states,'No actual browser download cancellation evidence')
                    require(record.get('download_files_before_cleanup')==0,'Precleanup download file count not zero')
                if name=='download-new-target':
                    require(any('Target' in row.get('type','') or 'page' in row.get('message','').lower() for row in record['errors']),'Failure did not identify undeclared target')
                if name=='confirm':
                    require(state.events.get(name+'/confirm-opened'),'Confirm fixture not reached')
                    require(not state.events.get(name+'/confirm-accepted'),'Unexpected confirm accepted')
                    require(state.events.get(name+'/confirm-canceled'),'No positive fixture proof that confirm returned false')
                    require(any(row.get('type')=='UnexpectedDialog' and row.get('dialog_type')=='confirm' and row.get('canceled') is True for row in record['errors']),'No acknowledged actual confirm cancellation')
                    require(not any(row.get('type')=='DialogCancellation' for row in record['errors']),'Dialog cancellation failed')
                if name in ('password','file','otp'):require('Sensitive/file/hidden field refused' in json.dumps(record['errors']),'Wrong sensitive-field failure')
                if name in ('ambiguous','missing'):require('exactly one' in json.dumps(record['errors']),'Wrong selector failure family')
                if name=='cancel':require(receipt.get('sigterm_sent') and any(row['type']=='CancelledError' for row in record['errors']),'SIGTERM did not cancel actual task')
                case['pass']=True;case['seconds']=receipt['seconds']
            except Exception as exc:case['error']=type(exc).__name__+': '+str(exc)
            atomic(root/'result.json',result)
        if not args.case:
            preflights=[('bad-width',{'extra':['--width','319']}),('too-many-actions',{'actions':[{'action':'screenshot'}]*17}),
              ('oversize-actions',{'raw':b' '*65537+b'[]'}),('duplicate-json',{'raw':b'[{"action":"press","action":"press","key":"Enter"}]'}),
              ('unknown-action',{'actions':[{'action':'evaluate','script':'1'}]}),('existing-output',{'existing':True}),
              ('relative-output',{'relative':True}),('url-space',{'url':' '+origin+'/page/preflight'}),
              ('url-alias',{'url':origin.replace('127.0.0.1','localhost')+'/page/preflight'})]
            for name,options in preflights:
                case={'name':name,'pass':False};result['cases'].append(case)
                try:
                    before=state.hits.get('/page/preflight',0)
                    receipt,output=await invoke(state,name,options.pop('url',origin+'/page/preflight'),options.pop('actions',[]),preflight=True,**options)
                    require(receipt['exit_code']!=0 and receipt['report'] is None,'Bad input was not refused before browser work')
                    require(state.hits.get('/page/preflight',0)==before,'Refused input reached project server')
                    require(not receipt['leftover_children'] and not receipt['private_tmp_entries'],'Refusal left owned work/processes')
                    if name=='existing-output':require(receipt['existing_marker_intact'],'Existing output was changed')
                    elif name!='relative-output':require(not output.exists(),'Refusal created output directory')
                    else:require(not (output.parent/'relative-output').exists(),'Relative output created')
                    case['pass']=True
                except Exception as exc:case['error']=type(exc).__name__+': '+str(exc)
                atomic(root/'result.json',result)
        result['status']='passed' if result['cases'] and all(row['pass'] for row in result['cases']) else 'failed'
    finally:
        for sig in (signal.SIGTERM,signal.SIGINT):loop.add_signal_handler(sig,lambda:None)
        result['source_sha256_after']={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in CLI.parent.glob('*.py')}
        if result['source_sha256_after']!=source_hashes:result['status']='failed';result['source_changed']=True
        result['fixture']=state.snapshot()
        result['emergency_final_cleanup']=cleanup_adopted() if children() else []
        for server in (primary,sentinel):server.shutdown();server.server_close()
        for thread in threads:thread.join(timeout=2)
        result['servers_closed']=all(not thread.is_alive() for thread in threads)
        result['no_owned_children']=not children()
        result['short_temp_root']=str(state.temp_root)
        if not list(state.temp_root.iterdir()) and result['no_owned_children']:
            state.temp_root.rmdir();result['short_temp_root_removed']=True
        else:
            result['short_temp_root_removed']=False;result['status']='failed'
        if result['emergency_final_cleanup'] or not result['servers_closed'] or not result['no_owned_children']:result['status']='failed'
        atomic(root/'result.json',result)
    print(json.dumps({'status':result['status'],'passed':sum(row['pass'] for row in result['cases']),'total':len(result['cases']),'result':str(root/'result.json')}))
    return 0 if result['status']=='passed' else 1

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--output',type=Path,required=True)
    parser.add_argument('--case',choices=sorted(CASE_NAMES-{'preflight'}));args=parser.parse_args()
    raise SystemExit(asyncio.run(run(args)))
