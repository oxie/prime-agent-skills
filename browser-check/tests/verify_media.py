#!/usr/bin/env python3
"""Native BrowserSession checks. Only synthetic loopback fixtures; no Agent/LLM.
Run with the adjacent dedicated venv. Outputs are per-run, including failed runs.
This is browser-level request restriction, NOT OS egress isolation.
"""
import argparse, asyncio, base64, hashlib, json, logging, mimetypes, os
from pathlib import Path
import pwd, shutil, signal, socket, tempfile, threading, time, traceback, importlib.util, ctypes
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit, unquote
SHARED=Path(__file__).resolve().parents[1]/'scripts'
_launcher_source=SHARED/'chrome_launch.py'
_launcher_spec=importlib.util.spec_from_file_location('chrome_launch',_launcher_source)
chrome_launch=importlib.util.module_from_spec(_launcher_spec);_launcher_spec.loader.exec_module(chrome_launch)
_owned_source=SHARED/'owned_chrome.py'
_owned_spec=importlib.util.spec_from_file_location('owned_chrome',_owned_source)
owned_chrome=importlib.util.module_from_spec(_owned_spec);_owned_spec.loader.exec_module(owned_chrome)
_optional_source=SHARED/'optional_optout.py'
_optional_spec=importlib.util.spec_from_file_location('optional_optout',_optional_source)
optional_optout=importlib.util.module_from_spec(_optional_spec);_optional_spec.loader.exec_module(optional_optout)

SITE=Path('/home/prime-agent/.local/share/prime-agent/capabilities/interactive-media')
OUT=Path('/home/prime-agent/.local/share/prime-agent/browser-use-tools/checks')

def atomic(path, text):
    tmp=path.with_suffix(path.suffix+'.tmp'); tmp.write_text(text); tmp.replace(path)

def identity(pid):
    return (Path('/proc')/str(pid)/'stat').read_text().rsplit(')',1)[1].split()[19]

def proc_snapshot(group, helpers=None):
    found=[]; helpers=helpers or {}
    for p in Path('/proc').iterdir():
        if not p.name.isdigit(): continue
        try:
            pid=int(p.name)
            if os.getpgid(pid)!=group and not (pid in helpers and identity(pid)==helpers[pid]): continue
            # Read command lines only after group/exact-helper ownership is known.
            cmd=(p/'cmdline').read_bytes().replace(b'\0',b' ').decode(errors='replace')
            status=(p/'status').read_text()
            found.append({'pid':pid,'start_ticks':identity(pid),'cmd':cmd,
                          'status':{line.split(':')[0]:line.split(':',1)[1].strip() for line in status.splitlines() if line.split(':')[0] in ['State','NoNewPrivs','Seccomp','Seccomp_filters','NSpid','VmRSS','CapEff','CapPrm']}})
        except (OSError,ProcessLookupError): pass
    return found

async def run(args, work, out):
    # Environment was cleared before this import; this uses the project's venv.
    from browser_use import BrowserSession
    import importlib.metadata
    record={'version':importlib.metadata.version('browser-use'),'mode':args.mode,'checks':[], 'errors':[], 'requests':[], 'cleanup':{}}
    def check(name, ok, data=None):
        item={'name':name,'pass':bool(ok),'data':data}; record['checks'].append(item)
        print(json.dumps(item),flush=True)
        atomic(out/'evidence.json',json.dumps(record,indent=2))
    record['optional_listener_policy']=optional_optout.disable_optional_watchdogs()
    record['shared_helper_sha256']={str(p):hashlib.sha256(p.read_bytes()).hexdigest() for p in (_launcher_source,_owned_source,_optional_source)}
    files={}
    for p in SITE.rglob('*'):
        if p.is_symlink(): raise RuntimeError('Symlink refused in fixture tree')
        if p.is_file() and p.suffix in ('.html','.css','.mjs','.svg'):
            files['/'+p.relative_to(SITE).as_posix()]=(p.read_bytes(), 'text/javascript' if p.suffix=='.mjs' else mimetypes.guess_type(p.name)[0])
    files['/']=files['/index.html']
    record['site_sha256']={k:hashlib.sha256(v[0]).hexdigest() for k,v in files.items()}
    faults=set()
    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):
            path=unquote(urlsplit(self.path).path)
            status=404 if path in faults or path not in files else 200
            record['requests'].append({'path':path,'status':status,'time':time.monotonic()})
            self.send_response(status); self.send_header('Cache-Control','no-store')
            self.send_header('Content-Type',files.get(path,(b'', 'text/plain'))[1] or 'application/octet-stream'); self.end_headers()
            try: self.wfile.write(files[path][0] if status==200 else b'Controlled missing fixture')
            except (BrokenPipeError,ConnectionResetError): pass
        def log_message(self,*a): pass
    server=None; thread=None; cross_server=None; cross_thread=None; proxy=None; chrome=None; browser=None; logfile=None; cross_hits=[]
    try:
        server=ThreadingHTTPServer(('127.0.0.1',0),Handler); server.daemon_threads=True
        thread=threading.Thread(target=server.serve_forever,daemon=True); thread.start()
        url=f'http://127.0.0.1:{server.server_port}'
        # Bound but not listening: fail-closed local proxy for non-loopback traffic.
        proxy=socket.socket(); proxy.bind(('127.0.0.1',0)); proxyport=proxy.getsockname()[1]
        class CrossHandler(BaseHTTPRequestHandler):
            def do_GET(self):
                cross_hits.append(self.path);self.send_response(200);self.end_headers()
                try: self.wfile.write(b'owned-cross-port-control')
                except (BrokenPipeError,ConnectionResetError): pass
            def log_message(self,*a): pass
        cross_server=ThreadingHTTPServer(('127.0.0.1',0),CrossHandler);cross_server.daemon_threads=True
        cross_thread=threading.Thread(target=cross_server.serve_forever,daemon=True);cross_thread.start()
        # Native Python control confirms the other owned listener is genuinely live.
        cross_reader,cross_writer=await asyncio.open_connection('127.0.0.1',cross_server.server_port)
        cross_writer.write(b'GET /positive-control HTTP/1.0\r\nHost: 127.0.0.1\r\n\r\n');await cross_writer.drain()
        control_bytes=await asyncio.wait_for(cross_reader.read(),3)
        cross_writer.close();await cross_writer.wait_closed()
        check('cross_port_listener_live',b'owned-cross-port-control' in control_bytes and cross_hits==['/positive-control'])
        profile=work/'browser-use-user-data-dir-fresh'; profile.mkdir(mode=0o700)
        command=chrome_launch.launch_argv(profile,proxyport,server.server_port)
        record['runtime_identity']={'chrome_sha256':chrome_launch.CHROME_SHA256,'manifest_sha256':chrome_launch.MANIFEST_SHA256,'version':chrome_launch.VERSION,'resource_hashes_checked_by_launcher':True}
        record['command']=command; record['server']={'address':url,'thread_owned':True}
        logfile=(out/'chromium.log').open('wb')
        async with asyncio.timeout(args.deadline):
            chrome=owned_chrome.OwnedChrome()
            chrome.start(command,logfile)
            record['browser_pid']=chrome.process.pid
            async with asyncio.timeout(15):
                while not (profile/'DevToolsActivePort').exists():
                    if chrome.exited(): raise RuntimeError('Chrome exited before CDP')
                    await asyncio.sleep(.05)
            port=int((profile/'DevToolsActivePort').read_text().splitlines()[0])
            browser=BrowserSession(cdp_url=f'http://127.0.0.1:{port}',is_local=False,use_cloud=False,headless=True,chromium_sandbox=True,disable_security=False,keep_alive=False,enable_default_extensions=False,captcha_solver=False,auto_download_pdfs=False,accept_downloads=False,permissions=[],user_data_dir=profile,downloads_path=work/'downloads',device_scale_factor=1)
            check('attach_not_local_or_cloud',not browser.browser_profile.is_local and not browser.browser_profile.use_cloud)
            await browser.start()
            async def unexpected_dialog(event, session):
                record['errors'].append({'error':'Unexpected JavaScript dialog','type':event.get('type')})
                try:
                    await browser.cdp_client.send.Page.handleJavaScriptDialog(params={'accept':False},session_id=session)
                except Exception as exc:
                    record['errors'].append({'error':'Dialog dismissal failed','detail':repr(exc)})
            browser.cdp_client.register.Page._registry.register('Page.javascriptDialogOpening',unexpected_dialog)
            native_version=await browser.cdp_client.send.Browser.getVersion()
            record['native_browser_version']=native_version
            check('authenticated_native_browser_version',native_version.get('product')=='Chrome/'+chrome_launch.VERSION,native_version)
            native_exe=Path('/proc')/str(chrome.process.pid)/'exe'
            label=(Path('/proc')/str(chrome.process.pid)/'attr/current').read_text().strip()
            record['native_browser_profile']={'exe':str(native_exe.resolve()),'label':label}
            check('only_actual_chrome_under_named_profile',native_exe.resolve()==chrome_launch.CHROME and label=='chrome (unconfined)',record['native_browser_profile'])
            await browser.cdp_client.send.Browser.setDownloadBehavior(params={'behavior':'deny','eventsEnabled':True})
            record['downloads']='Explicit Browser.setDownloadBehavior deny AFTER BrowserSession startup; no OS download isolation'
            page=await browser.new_page(); sid=await page.session_id; cdp=browser.cdp_client
            await cdp.send.Page.addScriptToEvaluateOnNewDocument(params={'source':"window.__mediaEvents=[];window.__testMedia=matchMedia('(prefers-reduced-motion: reduce)');__testMedia.addEventListener('change',e=>__mediaEvents.push({matches:e.matches,time:performance.now(),visibility:document.visibilityState}));window.__testErrors=[];addEventListener('error',e=>__testErrors.push(String(e.message)));addEventListener('unhandledrejection',e=>__testErrors.push(String(e.reason)));"},session_id=sid)
            async def ev(code): return json.loads(await page.evaluate(code))
            async def wait(expr, timeout=6000):
                return await ev('() => new Promise((resolve,reject)=>{const end=performance.now()+'+str(timeout)+';function test(){try{if('+expr+'){resolve({ok:true});return}}catch(e){}if(performance.now()>end){reject(new Error("readiness timeout: "+'+json.dumps(expr)+'));return}setTimeout(test,40)}test()})')
            async def shot(name):
                data=base64.b64decode(await page.screenshot(format='png')); assert data.startswith(b'\x89PNG\r\n\x1a\n'); (out/(name+'.png')).write_bytes(data)
            async def snap():
                return await ev('() => ({diagnostics:window.mediaDiagnostics||null,players:[...document.querySelectorAll(".stage")].map(e=>({id:e.id,state:e.dataset.state,frame:e.dataset.frame,displayed:e.dataset.displayedFrame,canvasVisible:getComputedStyle(e.querySelector("canvas")).visibility,pixels:[...e.querySelector("canvas").getContext("2d").getImageData(360,270,1,1).data]})),visibility:document.visibilityState,mediaEvents:window.__mediaEvents||[],width:innerWidth,height:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth,scrollY})')
            async def settle(): await wait('window.mediaDiagnostics && mediaDiagnostics.scroll.pending===0 && mediaDiagnostics.spin.pending===0')
            # Page.goto only sends navigation. The old document can still be ready
            # at the same URL. Wait for the new loader's native load event instead.
            lifecycle=[]
            lifecycle_changed=asyncio.Event()
            page_registry=cdp.register.Page._registry
            previous_lifecycle=page_registry._handlers.get('Page.lifecycleEvent')
            async def lifecycle_observer(event, session):
                if previous_lifecycle:
                    import inspect
                    value=previous_lifecycle(event,session)
                    if inspect.isawaitable(value): await value
                if session==sid:
                    lifecycle.append(event)
                    lifecycle_changed.set()
            page_registry.register('Page.lifecycleEvent',lifecycle_observer)
            await cdp.send.Page.enable(session_id=sid)
            await cdp.send.Page.setLifecycleEventsEnabled(params={'enabled':True},session_id=sid)
            async def navigate(require_app=True):
                await cdp.send.Page.bringToFront(session_id=sid)
                navigation=await cdp.send.Page.navigate(params={'url':url+'/'},session_id=sid)
                if navigation.get('errorText'): raise RuntimeError(navigation['errorText'])
                loader=navigation.get('loaderId')
                if not loader: raise RuntimeError('Expected a new document loader')
                async with asyncio.timeout(10):
                    while True:
                        lifecycle_changed.clear()
                        if any(e.get('loaderId')==loader and e.get('name')=='load' for e in lifecycle): break
                        await lifecycle_changed.wait()
                record.setdefault('navigation_loaders',[]).append(loader)
                await wait('location.href==='+json.dumps(url+'/')+' && document.readyState==="complete"'+(' && !!window.mediaDiagnostics' if require_app else ''))
                if require_app: await settle()
            async def click(selector):
                await ev('() => {document.querySelector('+json.dumps(selector)+').scrollIntoView({block:"center"});return {ok:true}}')
                pos=await ev('() => {const r=document.querySelector('+json.dumps(selector)+').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}}')
                await (await page.mouse).click(pos['x'],pos['y'])
            await page.goto('chrome://sandbox/')
            await wait('document.body?.innerText.includes("Seccomp-BPF")')
            sandbox=await ev('() => ({text:document.body.innerText,html:document.documentElement.outerHTML,url:location.href,rows:[...document.querySelectorAll("#sandbox-status tr")].map(r=>[...r.cells].map(c=>c.textContent.trim())),evaluation:document.querySelector("#evaluation")?.textContent.trim()})')
            record['sandbox']=sandbox; (out/'sandbox.html').write_text(sandbox['html']); await shot('sandbox')
            check('sandbox_diagnostics_loaded','Seccomp-BPF' in sandbox['text'],sandbox['text'])
            rows=dict(sandbox['rows'])
            check('native_sandbox_namespaces_seccomp_adequacy',sandbox['url']=='chrome://sandbox/' and
                  sandbox['evaluation']=='You are adequately sandboxed.' and
                  all(rows.get(key)=='Yes' for key in ['PID namespaces','Network namespaces','Seccomp-BPF sandbox','Seccomp-BPF sandbox supports TSYNC']) and
                  rows.get('Layer 1 Sandbox') not in (None,'None','No','Disabled'),sandbox)
            check('no_browser_sandbox_disabling_flags',not any(flag in ' '.join(command) for flag in
                  ['--no-sandbox','--disable-setuid-sandbox','--disable-namespace-sandbox','--disable-seccomp-filter-sandbox','--disable-web-security']))
            record['owned_processes_during']=chrome.observe()
            renderers=[p for p in record['owned_processes_during'] if p['renderer']]
            check('renderer_seccomp_observed',bool(renderers) and all(p['status'].get('Seccomp')=='2' and p['status'].get('NoNewPrivs')=='1' for p in renderers),renderers)
            check('renderer_no_effective_or_permitted_caps',bool(renderers) and all(int(p['status'].get('CapEff','-1'),16)==0 and int(p['status'].get('CapPrm','-1'),16)==0 for p in renderers),renderers)
            await page.set_viewport_size(1440,1000); await navigate()
            request_urls={}; failed_requests=[]
            # Chain existing watchdog callbacks: CDP registry has one handler per event.
            registry=cdp.register.Network._registry
            for method in ['Network.requestWillBeSent','Network.loadingFailed']:
                previous=registry._handlers.get(method)
                async def observer(event, session, method=method, previous=previous):
                    if previous:
                        import inspect
                        result=previous(event,session)
                        if inspect.isawaitable(result): await result
                    if session != sid: return
                    if method.endswith('requestWillBeSent'):
                        request_urls[event['requestId']]=event['request']['url']
                    else:
                        failed_requests.append({'requestId':event['requestId'],'url':request_urls.get(event['requestId']),'errorText':event['errorText']})
                registry.register(method,observer)
            await cdp.send.Network.enable(session_id=sid)
            network=await ev('() => Promise.all([fetch("/index.html").then(r=>({local:r.ok})),fetch("http://reserved-egress-test.invalid/probe",{mode:"no-cors"}).then(()=>({externalBlocked:false}),e=>({externalBlocked:true,error:String(e)}))]).then(results=>({results}))')
            await asyncio.sleep(.1)
            record['failed_requests']=failed_requests
            proxy_evidence=[r for r in failed_requests if r['url']=='http://reserved-egress-test.invalid/probe']
            check('positive_loopback_negative_reserved_external',network['results'][0]['local'] and network['results'][1]['externalBlocked'] and any(r['errorText']=='net::ERR_PROXY_CONNECTION_FAILED' for r in proxy_evidence),{'fetch':network,'failure_events':proxy_evidence})
            cross_url=f'http://127.0.0.1:{cross_server.server_port}/browser-cross-port'
            cross_fetch=await ev('() => fetch('+json.dumps(cross_url)+',{mode:"no-cors"}).then(()=>({blocked:false}),e=>({blocked:true,error:String(e)}))')
            # CDP event delivery is asynchronous; wait for its exact request failure.
            async with asyncio.timeout(3):
                while not any(r['url']==cross_url for r in failed_requests): await asyncio.sleep(.02)
            cross_evidence=[r for r in failed_requests if r['url']==cross_url]
            check('cross_port_blocked_same_port_allowed',network['results'][0]['local'] and cross_fetch['blocked'] and
                  any(r['errorText']=='net::ERR_PROXY_CONNECTION_FAILED' for r in cross_evidence) and
                  cross_hits==['/positive-control'],{'fetch':cross_fetch,'events':cross_evidence,'listener_hits':cross_hits.copy()})
            record['direct_svg_decode_probe']=await ev('() => fetch("/assets/spin-00.svg").then(r=>r.blob()).then(b=>createImageBitmap(b)).then(i=>{const d={ok:true,width:i.width,height:i.height};i.close();return d},e=>({ok:false,error:String(e)}))')
            initial=await snap(); record['initial']=initial; await shot('desktop-initial')
            check('actual_initial_decode',all(p['state']=='ready' and p['displayed']==p['frame'] and p['canvasVisible']=='visible' and p['pixels'][3]>0 for p in initial['players']),initial)
            if args.mode=='full':
                await full_tests(page,cdp,sid,ev,wait,shot,snap,settle,navigate,click,check,record,faults)
    except Exception as e:
        if browser and 'snap' in locals():
            try:
                async with asyncio.timeout(3): record['failure_snapshot']=await snap()
            except Exception: pass
        record['errors'].append({'error':repr(e),'traceback':traceback.format_exc()}); print(traceback.format_exc(),flush=True)
    finally:
        if browser:
            try:
                async with asyncio.timeout(12): await browser.kill()
                record['cleanup']['browser_session_disconnected']=True
            except Exception as e: record['cleanup']['browser_session_error']=repr(e)
        if chrome:
            try:
                receipt=chrome.close()
                record['cleanup']['owned_chrome']=receipt
                record['cleanup']['no_live_owned_processes']=receipt['no_owned_children']
                record['cleanup']['browser_returncode']=receipt['browser_exit']
            except Exception as e: record['cleanup']['owned_chrome_error']=repr(e)
        for name,owned_server,owned_thread in [('server',server,thread),('cross_port_server',cross_server,cross_thread)]:
            try:
                if owned_server:
                    if owned_thread and owned_thread.is_alive(): owned_server.shutdown()
                    owned_server.server_close()
                if owned_thread: owned_thread.join(timeout=2)
                record['cleanup'][name+'_thread_stopped']=not owned_thread or not owned_thread.is_alive()
            except Exception as e: record['cleanup'][name+'_error']=repr(e)
        for name,stream in [('proxy',proxy),('log',logfile)]:
            try:
                if stream: stream.close()
                record['cleanup'][name+'_closed']=True
            except Exception as e: record['cleanup'][name+'_error']=repr(e)
        try:
            if chrome is None or record['cleanup'].get('no_live_owned_processes',False):
                shutil.rmtree(work); record['cleanup']['private_work_removed']=not work.exists()
            else:
                record['cleanup']['private_work_removed']=False
                record['cleanup']['preserved_private_work']=str(work)
        except Exception as e: record['cleanup']['private_work_error']=repr(e)
    record['pass']=not record['errors'] and all(x['pass'] for x in record['checks']) and record['cleanup'].get('no_live_owned_processes',False) and record['cleanup'].get('server_thread_stopped',False) and record['cleanup'].get('cross_port_server_thread_stopped',False) and record['cleanup'].get('private_work_removed',False) and record['cleanup'].get('proxy_closed',False) and record['cleanup'].get('browser_session_disconnected',False) and not any('error' in k for k in record['cleanup'])
    atomic(out/'evidence.json',json.dumps(record,indent=2)); print('RESULT '+str(out/'evidence.json')+' PASS='+str(record['pass']),flush=True)
    return 0 if record['pass'] else 1

async def full_tests(page,cdp,sid,ev,wait,shot,snap,settle,navigate,click,check,record,faults):
    async def signature(kind):
        return await ev('() => {const a=document.querySelector("#'+kind+'-player canvas").getContext("2d").getImageData(0,0,720,540).data;let h=2166136261;for(let i=0;i<a.length;i+=4){h=Math.imul(h^a[i],16777619);h=Math.imul(h^a[i+1],16777619);h=Math.imul(h^a[i+2],16777619)}return {hash:h>>>0,alpha:a[3]}}')
    async def current(name):
        await settle(); s=await snap(); record[name]=s
        errors=await ev('() => ({errors:window.__testErrors||[]})'); check(name+'_no_js_errors',not errors['errors'],errors)
        for kind in ['scroll','spin']:
            d=s['diagnostics'][kind]
            check(name+'_'+kind+'_bounds',d['cached']<=3 and d['pending']<=2 and d['peakCache']<=3 and d['peakPending']<=2,d)
        return s
    async def ready(kind, frame):
        await wait('mediaDiagnostics.'+kind+'.frame==='+str(frame))
        await settle()
        s=await snap(); p=next(p for p in s['players'] if p['id']==kind+'-player')
        check(kind+'_rendered_'+str(frame),p['state']=='ready' and p['displayed']==str(frame) and p['canvasVisible']=='visible' and p['pixels'][3]>0,p)
        return await signature(kind)
    # Viewport checks are real layout metrics, not touch-device emulation claims.
    for w,h in [(1440,1000),(390,844),(320,844)]:
        await page.set_viewport_size(w,h); await ev('() => {scrollTo(0,0);return {ok:true}}'); await settle()
        s=await snap(); check('layout_'+str(w),not s['overflow'] and s['width']==w and s['height']==h,s)
        await shot('layout-'+str(w))
        await ev('() => {document.querySelector("#spin-player").scrollIntoView({block:"center"});return {ok:true}}')
        await shot('spin-'+str(w))
    # Text-only 200% test: double every element's computed font size in one batch.
    # Unlike page-scale zoom this actually forces text reflow, including px fonts.
    textzoom=await ev('() => {const els=[...document.querySelectorAll("body,body *")];const sizes=els.map(e=>parseFloat(getComputedStyle(e).fontSize));els.forEach((e,i)=>{e.dataset.testStyle=e.getAttribute("style")||"";e.style.fontSize=(2*sizes[i])+"px"});return {count:els.length,ratio:parseFloat(getComputedStyle(document.querySelector("p")).fontSize)/sizes[els.indexOf(document.querySelector("p"))]}}')
    s=await snap(); record['text_zoom_overflow_elements']=await ev('() => ({elements:[...document.querySelectorAll("body *")].map(e=>({tag:e.tagName,id:e.id,cls:e.getAttribute("class"),text:e.textContent.slice(0,80),right:e.getBoundingClientRect().right,left:e.getBoundingClientRect().left})).filter(e=>e.right>innerWidth+.5||e.left<-.5),documentWidth:document.documentElement.scrollWidth})'); check('text_200_percent_320',not s['overflow'] and textzoom['ratio']==2,{'layout':s,'enlargement':textzoom}); await shot('text-200-320'); await ev('() => {document.querySelector(".colophon").scrollIntoView({block:"center"});return {ok:true}}'); await shot('text-200-320-colophon')
    await ev('() => {document.querySelectorAll("[data-test-style]").forEach(e=>{e.setAttribute("style",e.dataset.testStyle);delete e.dataset.testStyle});return {ok:true}}')
    await page.set_viewport_size(1440,1000)
    # Scroll via native CDP wheel event, then observe the production scroll listener.
    async def scroll_to(y):
        before=(await snap())['scrollY']
        await cdp.send.Input.dispatchMouseEvent(params={'type':'mouseWheel','x':700,'y':500,'deltaX':0,'deltaY':y-before},session_id=sid)
        await wait('Math.abs(scrollY-'+str(y)+')<3')
        record.setdefault('scroll_positions',[]).append(await ev('() => {const r=document.querySelector("#assembly").getBoundingClientRect();return {scrollY,top:r.top,height:r.height,viewport:innerHeight}}'))
    geometry=await ev('() => {const r=document.querySelector("#assembly").getBoundingClientRect();return {start:r.top+scrollY,end:r.top+scrollY+r.height-innerHeight}}')
    scroll_hashes=[]
    for progress,expected in [(0,0),(1,23),(12/23,12),(0,0)]:
        await scroll_to(geometry['start']+(geometry['end']-geometry['start'])*progress)
        scroll_hashes.append((await ready('scroll',expected))['hash'])
    check('scroll_endpoints_reverse_pixels',scroll_hashes[0]==scroll_hashes[3] and len(set(scroll_hashes))==3,scroll_hashes)
    await click('#spin-player'); await page.press('Home'); first=await ready('spin',0)
    await page.press('End'); last=await ready('spin',23)
    await page.press('ArrowRight'); wrap=await ready('spin',0)
    await page.press('ArrowLeft'); await ready('spin',23)
    check('spin_home_end_wrap_pixels',first['hash']==wrap['hash'] and first['hash']!=last['hash'],[first,last,wrap])
    await page.press('Home'); await ready('spin',0)
    pos=await ev('() => {const r=document.querySelector("#spin-player").getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}}')
    for typ,x,button,buttons in [('mousePressed',pos['x'],'left',1),('mouseMoved',pos['x']+80,'left',1),('mouseReleased',pos['x']+80,'left',0)]:
        await cdp.send.Input.dispatchMouseEvent(params={'type':typ,'x':x,'y':pos['y'],'button':button,'buttons':buttons,'clickCount':1},session_id=sid)
    await ready('spin',5)
    check('drag_release',not (await snap())['diagnostics']['dragging'])
    await cdp.send.Emulation.setTouchEmulationEnabled(params={'enabled':True,'maxTouchPoints':1},session_id=sid)
    await cdp.send.Input.dispatchTouchEvent(params={'type':'touchStart','touchPoints':[{'x':pos['x'],'y':pos['y'],'id':0}]},session_id=sid)
    active=(await snap())['diagnostics']['dragging']
    await cdp.send.Input.dispatchTouchEvent(params={'type':'touchCancel','touchPoints':[]},session_id=sid)
    await wait('!mediaDiagnostics.dragging')
    check('native_pointercancel',active and not (await snap())['diagnostics']['dragging'])
    await cdp.send.Emulation.setTouchEmulationEnabled(params={'enabled':False},session_id=sid)
    # Actual range keyboard event, plus actual previous/next buttons.
    await click('#spin-range'); await page.press('Home'); await page.press('ArrowRight'); await ready('spin',1)
    await click('#next-frame'); await ready('spin',2)
    await click('#previous-frame'); await ready('spin',1)
    await current('after_controls')
    # Controlled missing local asset. Keep a rendered view when frame 12 fails.
    faults.add('/assets/spin-12.svg')
    await click('#spin-player'); await page.press('Home'); await ready('spin',0)
    for i in range(11): await page.press('ArrowRight')
    before=await ready('spin',11)
    await page.press('ArrowRight'); await wait('mediaDiagnostics.spin.frame===12'); await settle()
    s=await snap(); broken=next(p for p in s['players'] if p['id']=='spin-player')
    after=await signature('spin')
    check('broken_frame_preserves_render',broken['state']=='error' and broken['displayed']=='11' and before==after,{'player':broken,'before':before,'after':after})
    await shot('broken-frame')
    faults.clear(); await page.press('Home'); await ready('spin',0)
    for i in range(12): await page.press('ArrowRight')
    await ready('spin',12)
    await current('after_recovery')
    # Static click must release cache and cease requests after pending work settles.
    await click('#static-mode'); await wait('mediaDiagnostics.static'); await settle()
    n=len([r for r in record['requests'] if r['path'].startswith('/assets/')])
    await click('#spin-player'); await page.press('End')
    await cdp.send.Input.dispatchMouseEvent(params={'type':'mouseWheel','x':700,'y':500,'deltaX':0,'deltaY':400},session_id=sid)
    await asyncio.sleep(.3)
    s=await snap(); n2=len([r for r in record['requests'] if r['path'].startswith('/assets/')])
    check('static_toggle_clears_and_stops',n==n2 and all(s['diagnostics'][k]['cached']==0 and s['diagnostics'][k]['pending']==0 for k in ['scroll','spin']),s)
    await shot('static-toggle')
    await click('#static-mode'); await wait('!mediaDiagnostics.static'); await settle()
    await cdp.send.Page.bringToFront(session_id=sid)
    record['before_reduced_toggle']=await snap()
    await cdp.send.Emulation.setEmulatedMedia(params={'features':[{'name':'prefers-reduced-motion','value':'reduce'}]},session_id=sid)
    await ev('() => new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve({rendered:true}))))')
    await wait('mediaDiagnostics.static && mediaDiagnostics.reducedMotion'); await settle()
    s=await snap(); check('reduced_motion_toggle_stops',all(s['diagnostics'][k]['cached']==0 and s['diagnostics'][k]['pending']==0 for k in ['scroll','spin']),s)
    n=len([r for r in record['requests'] if r['path'].startswith('/assets/')]); await navigate()
    s=await snap(); n2=len([r for r in record['requests'] if r['path'].startswith('/assets/')])
    check('reduced_motion_before_load_zero_frames',s['diagnostics']['static'] and n==n2,s); await shot('reduced-before-load')
    await cdp.send.Emulation.setEmulatedMedia(params={'features':[{'name':'prefers-reduced-motion','value':'no-preference'}]},session_id=sid)
    await ev('() => new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve({rendered:true}))))')
    await wait('!mediaDiagnostics.static'); await settle(); await current('final_bounds')
    # RSS is a separate coarse process measurement, not the theoretical decoded budget.
    record['memory']={'decoded_estimate_bytes_per_bitmap':720*540*4,'decoded_cache_estimate_bytes_two_players':2*3*720*540*4,'inflight_decode_allowance_estimate_bytes_two_players':2*2*720*540*4,'svg_fallback_total_conservative_pixel_estimate_bytes':20*720*540*4,'qualification':'RGBA estimates exclude encoded data/GPU/canvas/overhead; in-flight estimate is conservative, not measured allocation','owned_process_rss_snapshot':proc_snapshot(record['browser_pid'])}
    # No-JS load: runtime evaluation remains a diagnostic CDP operation.
    await cdp.send.Emulation.setScriptExecutionDisabled(params={'value':True},session_id=sid)
    n=len([r for r in record['requests'] if r['path'].startswith('/assets/')]); await navigate(require_app=False)
    await wait('document.readyState==="complete" && !!document.querySelector("noscript") && !window.mediaDiagnostics')
    nojs=await ev('() => ({static:document.body.classList.contains("is-static"),noscript:getComputedStyle(document.querySelector("noscript")).display,posters:[...document.querySelectorAll(".poster")].map(e=>({width:e.getBoundingClientRect().width,visible:getComputedStyle(e).visibility})),disabled:document.querySelector("#static-mode").disabled,overflow:document.documentElement.scrollWidth>innerWidth})')
    n2=len([r for r in record['requests'] if r['path'].startswith('/assets/')])
    check('javascript_disabled_static',nojs['static'] and nojs['disabled'] and nojs['noscript']!='none' and all(p['visible']=='visible' and p['width']>0 for p in nojs['posters']) and n==n2,nojs); await shot('javascript-disabled')
    await cdp.send.Emulation.setScriptExecutionDisabled(params={'value':False},session_id=sid)

def main():
    parser=argparse.ArgumentParser(); parser.add_argument('--mode',choices=['smoke','full'],default='full'); parser.add_argument('--deadline',type=int,default=160); args=parser.parse_args()
    assert pwd.getpwuid(os.getuid()).pw_name=='prime-agent'
    if ctypes.CDLL(None,use_errno=True).prctl(36,1,0,0,0)!=0: raise OSError(ctypes.get_errno(),'subreaper')
    work=Path(tempfile.mkdtemp(prefix='bu-',dir='/tmp')); os.chmod(work,0o700)
    for name in ['home','config','cache','tmp','downloads','cwd']: (work/name).mkdir()
    # Deliberately preserve neither credentials nor proxy variables.
    os.environ.clear(); os.environ.update({'PATH':'/usr/bin:/bin','HOME':str(work/'home'),'TMPDIR':str(work/'tmp'),'XDG_CONFIG_HOME':str(work/'config'),'XDG_CACHE_HOME':str(work/'cache'),'BROWSER_USE_CONFIG_DIR':str(work/'config'),'PYTHON_DOTENV_DISABLED':'1','ANONYMIZED_TELEMETRY':'false','BROWSER_USE_CLOUD_SYNC':'false','BROWSER_USE_SETUP_LOGGING':'false','BROWSER_USE_DISABLE_EXTENSIONS':'1','BROWSER_USE_VERSION_CHECK':'false','BROWSER_USE_LOGGING_LEVEL':'error','LMNR_LOGGING_LEVEL':'warning','NO_PROXY':'127.0.0.1,localhost,::1','no_proxy':'127.0.0.1,localhost,::1'})
    tempfile.tempdir=None  # Re-read sanitized TMPDIR after the initial mkdtemp cache.
    os.chdir(work/'cwd'); logging.basicConfig(level=logging.ERROR)
    out=OUT/(time.strftime('run-%Y%m%dT%H%M%S')+'-'+str(os.getpid())); out.mkdir()
    try: return asyncio.run(run(args,work,out))
    finally:
        if work.exists():
            # This fresh subreaper owns all children. Include nonleader threads.
            try:
                owned_children=set()
                for task in Path('/proc/self/task').iterdir():
                    try: owned_children.update((task/'children').read_text().split())
                    except FileNotFoundError: continue
                if owned_children:
                    print('PRESERVED_PRIVATE_WORK '+str(work)+' owned children remain',flush=True)
                else:
                    shutil.rmtree(work)
            except Exception as exc:
                print('PRESERVED_PRIVATE_WORK '+str(work)+' cleanup uncertain: '+repr(exc),flush=True)
if __name__=='__main__': raise SystemExit(main())
