#!/usr/bin/env python3
'''Bounded fixture-only checks. Use the documented reviewed browser-use venv.'''
import argparse
import asyncio
import base64
import hashlib
import io
from PIL import Image, ImageChops
import importlib.util
import json
import logging
import os
from pathlib import Path
import shutil
import ctypes
import socket
import sys
import tempfile
import time
import threading
import traceback
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

FIXTURE = Path(__file__).resolve().parents[1] / 'assets'
SHARED = Path(__file__).resolve().parents[2] / 'browser-check/scripts'


def atomic(path, value):
    temporary = path.with_suffix(path.suffix + '.tmp')
    temporary.write_text(value)
    temporary.replace(path)


async def run(args, work):
    sys.dont_write_bytecode = True
    from browser_use import BrowserSession
    modules = {}
    shared_paths = [SHARED / (name + '.py') for name in ('chrome_launch', 'owned_chrome', 'optional_optout')]
    for path in shared_paths:
        spec = importlib.util.spec_from_file_location(path.stem, path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        modules[path.stem] = module
    launch, owner, optional = (modules[name] for name in ('chrome_launch', 'owned_chrome', 'optional_optout'))
    optional_policy = optional.disable_optional_watchdogs()
    out = args.output
    source_paths = [Path(__file__).resolve(), *shared_paths, *sorted(p for p in FIXTURE.rglob('*') if p.is_file())]
    source_hashes = {str(p): hashlib.sha256(p.read_bytes()).hexdigest() for p in source_paths}
    record = {'checks': [], 'errors': [], 'requests': [], 'cleanup': {},
              'scope': 'Original fixture only; no WCAG certification or frame-performance benchmark.'}
    def check(name, ok, data=None):
        item = {'name': name, 'pass': bool(ok), 'data': data}
        record['checks'].append(item)
        print(json.dumps(item), flush=True)
        atomic(out / 'evidence.json', json.dumps(record, indent=2))
        if not ok:
            raise AssertionError(name)
    record['source_hashes_start'] = source_hashes
    record['optional_listener_policy'] = optional_policy
    files = {}
    for path in sorted(FIXTURE.rglob('*')):
        if path.is_symlink():
            raise RuntimeError('Fixture symlink refused')
        if path.is_file():
            mime = {'.html':'text/html','.css':'text/css','.mjs':'text/javascript','.js':'text/javascript'}.get(path.suffix)
            if not mime:
                raise RuntimeError('Unreviewed asset type: ' + str(path))
            files['/' + path.relative_to(FIXTURE).as_posix()] = (path.read_bytes(), mime)
    files['/'] = files['/demo/index.html']
    # Same reviewed HTML, distinct document URL for actual history navigation.
    files['/demo/history.html'] = files['/demo/index.html']
    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):
            item = files.get(self.path)
            record['requests'].append({'path': self.path, 'status': 200 if item else 404})
            self.send_response(200 if item else 404)
            self.send_header('Content-Type', item[1] if item else 'text/plain')
            self.send_header('Cache-Control', 'no-store')
            self.end_headers()
            self.wfile.write(item[0] if item else b'Not found')
        def log_message(self, *args):
            pass
    chrome = browser = server = thread = proxy = logfile = None
    try:
        server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        server.daemon_threads = True
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        origin = f'http://127.0.0.1:{server.server_port}'
        proxy = socket.socket()
        proxy.bind(('127.0.0.1', 0))  # Bound, not listening: fail-closed proxy.
        profile = work / 'profile'
        profile.mkdir(mode=0o700)
        command = launch.launch_argv(profile, proxy.getsockname()[1], server.server_port)
        record['command'] = command
        record['origin'] = origin
        logfile = (out / 'chromium.log').open('wb')
        async with asyncio.timeout(args.deadline):
            chrome = owner.OwnedChrome()
            chrome.start(command, logfile)
            record['browser_pid'] = chrome.process.pid
            async with asyncio.timeout(15):
                while not (profile / 'DevToolsActivePort').exists():
                    if chrome.exited():
                        raise RuntimeError('Chrome exited before CDP')
                    await asyncio.sleep(.05)
            port = int((profile / 'DevToolsActivePort').read_text().splitlines()[0])
            websocket = f'http://127.0.0.1:{port}'
            browser = BrowserSession(cdp_url=websocket, is_local=False, use_cloud=False,
                headless=True, chromium_sandbox=True, disable_security=False, keep_alive=False,
                enable_default_extensions=False, captcha_solver=False, auto_download_pdfs=False,
                accept_downloads=False, permissions=[], user_data_dir=profile,
                downloads_path=work / 'downloads', device_scale_factor=1)
            await browser.start()
            cdp = browser.cdp_client
            record['native_version'] = await cdp.send.Browser.getVersion()
            check('maintained_native_chrome', record['native_version'].get('product') == 'Chrome/' + launch.VERSION, record['native_version'])
            async def unexpected_dialog(event, session):
                record['errors'].append('Unexpected JavaScript dialog: ' + str(event.get('type')))
                try:
                    await cdp.send.Page.handleJavaScriptDialog(params={'accept': False}, session_id=session)
                except Exception as exc:
                    record['errors'].append('Dialog dismissal failed: ' + repr(exc))
            cdp.register.Page._registry.register('Page.javascriptDialogOpening', unexpected_dialog)
            await cdp.send.Browser.setDownloadBehavior(params={'behavior': 'deny', 'eventsEnabled': True})
            page = await browser.new_page()
            sid = await page.session_id
            async def press(key):
                # browser-use press omits Enter text; native button activation needs
                # the character-producing event, unlike an anchor keydown default.
                if key not in ('Enter', 'Space'):
                    return await page.press(key)
                text = '\r' if key == 'Enter' else ' '
                params = {'key': 'Enter' if key == 'Enter' else ' ', 'code': key,
                          'windowsVirtualKeyCode': 13 if key == 'Enter' else 32}
                await cdp.send.Input.dispatchKeyEvent(params={**params, 'type': 'keyDown', 'text': text, 'unmodifiedText': text}, session_id=sid)
                await cdp.send.Input.dispatchKeyEvent(params={**params, 'type': 'keyUp'}, session_id=sid)
            async def ev(source):
                return json.loads(await page.evaluate('() => Promise.resolve((' + source + ')()).then(value=>({value}))'))['value']
            async def wait(expression, timeout=4000):
                return await ev('() => new Promise((resolve,reject)=>{const end=performance.now()+' + str(timeout) + ';function tick(){if(' + expression + '){resolve(true);return}if(performance.now()>end){reject(new Error("condition deadline"));return}setTimeout(tick,25)}tick()})')
            async def sample_delay(ms=150):
                return await ev('() => new Promise(resolve=>setTimeout(()=>resolve(true),' + str(ms) + '))')
            async def shot(name):
                result = await cdp.send.Page.captureScreenshot(params={'format':'png','captureBeyondViewport':False}, session_id=sid)
                data = base64.b64decode(result['data'])
                if not data.startswith(b'\x89PNG'.decode('unicode_escape').encode('latin1')):
                    raise RuntimeError('Invalid screenshot')
                temp = out / (name + '.png.tmp')
                temp.write_bytes(data)
                temp.replace(out / (name + '.png'))
            await cdp.send.Page.addScriptToEvaluateOnNewDocument(params={'source': 'window.__persisted=false;addEventListener("pageshow",e=>window.__persisted=e.persisted);window.__errors=[];addEventListener("error",e=>__errors.push(String(e.message)));addEventListener("unhandledrejection",e=>__errors.push(String(e.reason)));'}, session_id=sid)
            lifecycle = []
            changed = asyncio.Event()
            registry = cdp.register.Page._registry
            previous = registry._handlers.get('Page.lifecycleEvent')
            async def lifecycle_event(event, session):
                if previous:
                    import inspect
                    result = previous(event, session)
                    if inspect.isawaitable(result):
                        await result
                if session == sid:
                    lifecycle.append(event)
                    changed.set()
            registry.register('Page.lifecycleEvent', lifecycle_event)
            await cdp.send.Page.enable(session_id=sid)
            await cdp.send.Page.setLifecycleEventsEnabled(params={'enabled': True}, session_id=sid)
            async def navigate(url=origin + '/demo/index.html'):
                await cdp.send.Page.bringToFront(session_id=sid)
                result = await cdp.send.Page.navigate(params={'url': url}, session_id=sid)
                if result.get('errorText'):
                    raise RuntimeError(result['errorText'])
                loader = result['loaderId']
                async with asyncio.timeout(10):
                    while True:
                        changed.clear()
                        if any(e.get('loaderId') == loader and e.get('name') == 'load' for e in lifecycle):
                            break
                        await changed.wait()
                await wait('document.readyState === "complete"')
            await cdp.send.Page.addScriptToEvaluateOnNewDocument(params={'source': "window.__trusted=[];for(const type of ['click','pointerdown','keydown'])addEventListener(type,e=>__trusted.push({type:e.type,trusted:e.isTrusted,target:e.target.tagName}));window.__resources=(()=>{\nconst raf=requestAnimationFrame,caf=cancelAnimationFrame,add=EventTarget.prototype.addEventListener,remove=EventTarget.prototype.removeEventListener;\nconst pending=new Set(),listeners=[],observers=new Set();let ticks=0;\nwindow.requestAnimationFrame=function(fn){let id=raf.call(window,t=>{pending.delete(id);ticks++;fn(t)});pending.add(id);return id};\nwindow.cancelAnimationFrame=function(id){pending.delete(id);return caf.call(window,id)};\nconst capture=o=>typeof o==='boolean'?o:!!o?.capture;\nEventTarget.prototype.addEventListener=function(type,fn,opt){if(fn&&!listeners.some(x=>x.target===this&&x.type===type&&x.fn===fn&&x.capture===capture(opt)))listeners.push({target:this,type,fn,capture:capture(opt)});return add.call(this,type,fn,opt)};\nEventTarget.prototype.removeEventListener=function(type,fn,opt){let i=listeners.findIndex(x=>x.target===this&&x.type===type&&x.fn===fn&&x.capture===capture(opt));if(i>=0)listeners.splice(i,1);return remove.call(this,type,fn,opt)};\nfor(const name of ['ResizeObserver','IntersectionObserver']){const Native=window[name];if(Native)window[name]=class extends Native{observe(...args){observers.add(this);return super.observe(...args)}disconnect(){observers.delete(this);return super.disconnect()}}}\nreturn {snapshot:()=>({raf:pending.size,listeners:listeners.length,observers:observers.size,ticks})};\n})();"}, session_id=sid)
            await cdp.send.Page.addScriptToEvaluateOnNewDocument(params={'source': "window.__draws=new WeakMap();window.__drawCount=c=>__draws.get(c)||0;for(const [proto,method] of [[CanvasRenderingContext2D.prototype,'fillRect'],[WebGL2RenderingContext.prototype,'drawArrays']]){const native=proto[method];proto[method]=function(...args){__draws.set(this.canvas,(__draws.get(this.canvas)||0)+1);return native.apply(this,args)}}"}, session_id=sid)
            await navigate('chrome://sandbox/')
            sandbox = await ev('() => document.body.innerText')
            record['sandbox'] = sandbox
            processes = chrome.observe()
            renderers = [p for p in processes if p['renderer']]
            check('sandbox', 'Seccomp-BPF' in sandbox and bool(renderers) and all(p['status'].get('Seccomp') == '2' and p['status'].get('NoNewPrivs') == '1' for p in renderers), processes)
            native_sandbox = await ev('() => ({url:location.href,rows:[...document.querySelectorAll("#sandbox-status tr")].map(r=>[...r.cells].map(c=>c.textContent.trim())),adequacy:document.querySelector("#evaluation")?.textContent.trim()})')
            rows = dict(native_sandbox['rows'])
            check('native_sandbox_adequate', native_sandbox['url'] == 'chrome://sandbox/' and native_sandbox['adequacy'] == 'You are adequately sandboxed.' and all(rows.get(key) == 'Yes' for key in ('PID namespaces', 'Network namespaces', 'Seccomp-BPF sandbox', 'Seccomp-BPF sandbox supports TSYNC')), native_sandbox)
            requests = []
            errors = []
            for domain, method, sink in [('Network', 'Network.requestWillBeSent', requests), ('Runtime', 'Runtime.exceptionThrown', errors), ('Runtime', 'Runtime.consoleAPICalled', errors)]:
                reg = getattr(cdp.register, domain)._registry
                old = reg._handlers.get(method)
                async def observe(event, session, old=old, sink=sink):
                    if old:
                        import inspect
                        value = old(event, session)
                        if inspect.isawaitable(value):
                            await value
                    if session == sid and (sink is not errors or 'type' not in event or event['type'] == 'error'):
                        sink.append(event)
                reg.register(method, observe)
            await cdp.send.Network.enable(session_id=sid)
            await cdp.send.Runtime.enable(session_id=sid)
            modes = ('ripples','particles','glyph','warp')
            def sel(mode, suffix=''):
                return '[data-effect="' + mode + '"] ' + suffix
            async def state(mode):
                return await ev('() => window.canvasEffectsDemo.instances['+json.dumps(mode)+'].getState()')
            async def center(selector, x=.5, y=.5):
                return await ev('() => {const r=document.querySelector('+json.dumps(selector)+').getBoundingClientRect();return {x:r.left+r.width*'+str(x)+',y:r.top+r.height*'+str(y)+'}}')
            async def visible(mode):
                await ev('() => {document.querySelector('+json.dumps(sel(mode))+').scrollIntoView({block:"center"});return true}')
                await sample_delay(100)
            async def click(selector):
                p=await center(selector)
                for typ in ('mousePressed','mouseReleased'):
                    await cdp.send.Input.dispatchMouseEvent(params={'type':typ,**p,'button':'left','clickCount':1},session_id=sid)
            async def pixels(mode, name=None):
                # Read actual browser-rendered backing pixels without changing layout.
                # CDP captureBeyondViewport can temporarily remove the scrollbar,
                # trigger ResizeObserver and alter the very canvas being sampled.
                data=await ev('() => document.querySelector('+json.dumps(sel(mode,'canvas'))+').toDataURL("image/png")')
                raw=base64.b64decode(data.split(',',1)[1])
                if name:
                    (out/(name+'.png')).write_bytes(raw)
                return Image.open(io.BytesIO(raw)).convert('RGB')
            def difference(a,b):
                if a.size != b.size: return 1.0
                diff=ImageChops.difference(a,b)
                return sum(1 for p in diff.getdata() if max(p)>3)/(a.width*a.height)
            async def stopped(mode, name):
                await sample_delay(80)
                a=await pixels(mode)
                await sample_delay(180)
                b=await pixels(mode)
                s=await state(mode)
                check(name, difference(a,b)==0 and not s['running'], {'pixel_fraction':difference(a,b),'state':s})
            async def play(mode):
                await visible(mode)
                await click(sel(mode,'button[data-action="play"]'))
                await wait('window.canvasEffectsDemo.instances['+json.dumps(mode)+'].getState().running')
            async def layout(name):
                data=await ev("() => ({width:innerWidth,client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,panels:document.querySelectorAll('[data-effect]').length,clipped:[...document.querySelectorAll('h1,h2,p,button,output')].filter(e=>!e.hidden).map(e=>({text:e.innerText,r:e.getBoundingClientRect()})).filter(o=>o.r.width>0&&(o.r.left<-.5||o.r.right>document.documentElement.clientWidth+.5)).map(o=>o.text)})")
                data['text_overflow']=await ev('() => {const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),bad=[];let n;while(n=w.nextNode()){if(!n.textContent.trim()||["SCRIPT","STYLE"].includes(n.parentElement.tagName))continue;let r=document.createRange();r.selectNodeContents(n);for(const b of r.getClientRects())if(b.width&&(b.left<-.5||b.right>document.documentElement.clientWidth+.5))bad.push({text:n.textContent.slice(0,100),left:b.left,right:b.right})}return bad}')
                await shot(name)
                check(name,data['scroll']<=data['client'] and not data['clipped'] and not data['text_overflow'] and data['panels']==4,data)
            await page.set_viewport_size(1100,900)
            await navigate()
            await wait('window.canvasEffectsDemo && Object.keys(window.canvasEffectsDemo.instances).length===4')
            await layout('desktop')
            signatures=[]
            for mode in modes:
                await visible(mode)
                a=await pixels(mode,mode+'-static')
                extrema=a.getextrema()
                s=await state(mode)
                check(mode+'_nonuniform_static',len(a.getcolors(a.width*a.height) or [])>8 and not s['running'], {'extrema':extrema,'state':s})
                signatures.append(hashlib.sha256(a.tobytes()).hexdigest())
                await sample_delay(150)
                b=await pixels(mode,mode+'-static-second')
                check(mode+'_initial_pixels_stable',difference(a,b)==0,{'difference':difference(a,b),'before_size':a.size,'after_size':b.size,'state':await state(mode)})
                await play(mode)
                await sample_delay(280)
                b=await pixels(mode,mode+'-running')
                check(mode+'_native_play_changes_pixels',difference(a,b)>.001,{'pixel_fraction':difference(a,b)})
                await click(sel(mode,'button[data-action="stop"]'))
                await stopped(mode,mode+'_native_stop_freezes_pixels')
            check('four_distinct_render_modes',len(set(signatures))==4,signatures)
            check('warp_real_webgl2_backend',(await state('warp'))['backend']=='webgl2')
            # Reach first Play by real Tab; Enter/Space are native character-producing CDP events.
            await navigate()
            await visible('ripples')
            for _ in range(24):
                await press('Tab')
                if await ev('() => document.activeElement.matches(\'[data-effect="ripples"] button[data-action="play"]\')'): break
            check('native_keyboard_reaches_play',await ev('() => document.activeElement.matches(\'[data-effect="ripples"] button[data-action="play"]\')'))
            await press('Enter')
            await wait('canvasEffectsDemo.instances.ripples.getState().running')
            await press('Tab')
            check('native_keyboard_reaches_stop',await ev('() => document.activeElement.matches(\'[data-effect="ripples"] button[data-action="stop"]\')'))
            await press('Space')
            await stopped('ripples','native_space_stop')
            # Native pointer coordinates after two distinct layouts and document scrolling.
            for width,x,y in ((1100,.23,.71),(320,.76,.29)):
                await page.set_viewport_size(width,800)
                await play('ripples')
                p=await center(sel('ripples','canvas'),x,y)
                await cdp.send.Input.dispatchMouseEvent(params={'type':'mouseMoved',**p},session_id=sid)
                await cdp.send.Input.dispatchMouseEvent(params={'type':'mousePressed',**p,'button':'left','clickCount':1},session_id=sid)
                await cdp.send.Input.dispatchMouseEvent(params={'type':'mouseReleased',**p,'button':'left','clickCount':1},session_id=sid)
                s=await state('ripples')
                check('pointer_coordinates_'+str(width),abs(s['pointer']['x']/s['width']-x)<.025 and abs(s['pointer']['y']/s['height']-y)<.025,s)
                # Local annulus: a fresh ripple must alter pixels around the physical input.
                a=await pixels('ripples')
                # Contract says input places the next ring, not synchronous painting.
                # One bounded half-second sample spans its scheduled emission.
                await sample_delay(500)
                b=await pixels('ripples','pointer-'+str(width))
                px,py=int(a.width*x),int(a.height*y)
                region=(max(0,px-45),max(0,py-45),min(a.width,px+45),min(a.height,py+45))
                check('pointer_local_pixel_response_'+str(width),difference(a.crop(region),b.crop(region))>.01,{'pixel_fraction':difference(a.crop(region),b.crop(region)),'region':region,'sample_ms':500})
                await click(sel('ripples','button[data-action="stop"]'))
            await cdp.send.Emulation.setTouchEmulationEnabled(params={'enabled':True,'maxTouchPoints':1},session_id=sid)
            await visible('particles')
            p=await center(sel('particles','button[data-action="play"]'))
            await cdp.send.Input.dispatchTouchEvent(params={'type':'touchStart','touchPoints':[p]},session_id=sid)
            await cdp.send.Input.dispatchTouchEvent(params={'type':'touchEnd','touchPoints':[]},session_id=sid)
            await wait('canvasEffectsDemo.instances.particles.getState().running')
            check('native_touch_play',True)
            trusted=await ev('() => __trusted')
            check('inputs_are_browser_trusted',all(e['trusted'] for e in trusted) and any(e['type']=='keydown' for e in trusted) and any(e['type']=='pointerdown' for e in trusted),trusted)
            await click(sel('particles','button[data-action="stop"]'))
            await cdp.send.Emulation.setTouchEmulationEnabled(params={'enabled':False},session_id=sid)
            await layout('narrow-320')
            ratio=await ev('() => {const es=[...document.querySelectorAll("body,body *")],sizes=es.map(e=>parseFloat(getComputedStyle(e).fontSize));es.forEach((e,i)=>e.style.fontSize=sizes[i]*2+"px");return parseFloat(getComputedStyle(document.querySelector("p")).fontSize)/sizes[es.indexOf(document.querySelector("p"))]}')
            check('text_enlargement_is_200_percent',ratio==2,ratio)
            for mode in modes:
                await visible(mode)
                await layout('text-200-'+mode)
            await navigate()
            await page.set_viewport_size(1100,900)
            await play('ripples')
            await ev('() => {const spacer=document.createElement("div");spacer.id="test-spacer";spacer.style.height="200vh";document.body.append(spacer);spacer.scrollIntoView();return true}')
            await wait('!canvasEffectsDemo.instances.ripples.getState().running')
            check('actual_offscreen_stops',await ev('() => document.querySelector(\'[data-effect="ripples"] canvas\').getBoundingClientRect().bottom<0'))
            await visible('ripples')
            await stopped('ripples','onscreen_no_surprise_resume')
            await play('ripples')
            other=await browser.new_page()
            other_sid=await other.session_id
            await cdp.send.Page.bringToFront(session_id=other_sid)
            await wait('document.hidden && !canvasEffectsDemo.instances.ripples.getState().running')
            check('actual_tab_hidden_stops',await ev('() => document.hidden'))
            await cdp.send.Page.bringToFront(session_id=sid)
            await wait('!document.hidden')
            await stopped('ripples','foreground_no_surprise_resume')
            info=await other.get_target_info()
            await cdp.send.Target.closeTarget(params={'targetId':info['targetId']})
            async def reduced(value):
                await cdp.send.Emulation.setEmulatedMedia(params={'features':[{'name':'prefers-reduced-motion','value':value}]},session_id=sid)
            await play('ripples')
            await reduced('reduce')
            await wait('!canvasEffectsDemo.instances.ripples.getState().running')
            await stopped('ripples','live_reduced_stops_pixels')
            await reduced('no-preference')
            await stopped('ripples','preference_restore_no_resume')
            await reduced('reduce')
            await navigate()
            for mode in modes:
                await visible(mode)
                await click(sel(mode,'button[data-action="play"]'))
                await stopped(mode,mode+'_initial_reduced_no_motion')
            await shot('initial-reduced')
            await reduced('no-preference')
            await navigate()
            await visible('glyph')
            initial_glyph=await pixels('glyph')
            started=time.monotonic()
            await play('glyph')
            await wait('!canvasEffectsDemo.instances.glyph.getState().running',10500)
            elapsed=time.monotonic()-started
            check('finite_eight_second_run_observed',7.5<=elapsed<=10.5,{'elapsed_seconds':elapsed})
            await stopped('glyph','finite_run_ends_within_contract')
            finished_glyph=await pixels('glyph','glyph-finished')
            check('glyph_finished_differs_from_initial',difference(initial_glyph,finished_glyph)>.01,{'pixel_fraction':difference(initial_glyph,finished_glyph)})
            await shot('glyph-finished-panel')
            # Backing-store budget measured, not merely claimed by renderer diagnostics.
            await cdp.send.Emulation.setDeviceMetricsOverride(params={'width':1800,'height':1000,'deviceScaleFactor':4,'mobile':False},session_id=sid)
            await sample_delay(180)
            sizes=await ev('() => [...document.querySelectorAll("canvas")].map(c=>({w:c.width,h:c.height,css:c.getBoundingClientRect().width}))')
            check('bounded_backing_store',all(p['w']*p['h']<=1000000 and p['w']<=p['css']*2+2 for p in sizes),sizes)
            await page.set_viewport_size(1100,900)
            await navigate()
            await play('warp')
            lost=await ev('() => {const c=document.querySelector(\'[data-effect="warp"] canvas\'),g=c.getContext("webgl2"),ext=g.getExtension("WEBGL_lose_context");if(!ext)return false;ext.loseContext();return true}')
            check('real_context_loss_extension',lost)
            await wait('!canvasEffectsDemo.instances.warp.getState().running')
            fallback=await ev('() => ({text:document.querySelector(\'[data-effect="warp"] output\').innerText,disabled:document.querySelector(\'[data-effect="warp"] button[data-action="play"]\').disabled})')
            check('context_loss_readable_fallback',bool(fallback['text'].strip()) and fallback['disabled'],fallback)
            await shot('context-loss')
            for name,source in [('missing-context','HTMLCanvasElement.prototype.getContext=()=>null'),('throwing-context','HTMLCanvasElement.prototype.getContext=()=>{throw new Error("controlled context failure")}'),('missing-matchMedia','window.matchMedia=undefined'),('throwing-matchMedia','window.matchMedia=()=>{throw new Error("controlled media failure")}')]:
                script=await cdp.send.Page.addScriptToEvaluateOnNewDocument(params={'source':source},session_id=sid)
                await navigate()
                data=await ev('() => [...document.querySelectorAll("[data-effect]")].map(p=>({text:p.querySelector("output").innerText,disabled:p.querySelector(\'button[data-action="play"]\').disabled,heading:p.querySelector("h2").innerText}))')
                check(name+'_readable_fallback',len(data)==4 and all(x['text'].strip() and x['disabled'] and x['heading'] for x in data),data)
                check(name+'_no_raf',await ev('() => __resources.snapshot().raf===0'))
                await shot(name)
                await cdp.send.Page.removeScriptToEvaluateOnNewDocument(params={'identifier':script['identifier']},session_id=sid)
            await cdp.send.Emulation.setScriptExecutionDisabled(params={'value':True},session_id=sid)
            await navigate()
            # CDP initialization scripts can execute with production JS disabled.
            data=await ev('() => ({enhanced:!!window.canvasEffectsDemo,panels:[...document.querySelectorAll("[data-effect]")].map(p=>({text:p.innerText,disabled:p.querySelector(\'button[data-action="play"]\').disabled,hidden:p.querySelector(\'button[data-action="play"]\').hidden}))})')
            check('no_js_readable_static',not data['enhanced'] and len(data['panels'])==4 and all(x['text'].strip() and (x['disabled'] or x['hidden']) for x in data['panels']),data)
            await page.set_viewport_size(320,800)
            await layout('no-javascript-320')
            await cdp.send.Emulation.setScriptExecutionDisabled(params={'value':False},session_id=sid)
            await navigate()
            await visible('ripples')
            await ev('() => {canvasEffectsDemo.destroy();canvasEffectsDemo.destroy();return true}')
            baseline=await ev('() => __resources.snapshot()')
            check('demo_destroy_no_raf_or_observers',baseline['raf']==0 and baseline['observers']==0,baseline)
            repeats=await ev('async () => {const {mountEffect}=await import(\'/effects.mjs\');const records=[];for(let n=0;n<3;n++){for(const mode of [\'ripples\',\'particles\',\'glyph\',\'warp\']){const p=document.querySelector(\'[data-effect="\'+mode+\'"]\');p.scrollIntoView({block:\'center\'});let i=mountEffect(p,mode);await new Promise(r=>setTimeout(r,40));i.play();await new Promise(r=>setTimeout(r,40));i.destroy();i.destroy();records.push({mode,state:i.getState(),resources:__resources.snapshot()})}}return records}')
            after=await ev('() => __resources.snapshot()')
            check('repeated_mount_destroy_releases_resources',all(x['resources']['raf']==0 and x['resources']['listeners']==baseline['listeners'] and x['resources']['observers']==0 for x in repeats),{'baseline':baseline,'runs':repeats,'after':after})
            await sample_delay(180)
            check('no_late_raf_after_destroy',await ev('() => __resources.snapshot().ticks==='+str(after['ticks'])))
            await navigate()
            await page.set_viewport_size(1100,900)
            await visible('ripples')
            draws=await ev('() => __drawCount(document.querySelector(\'[data-effect="ripples"] canvas\'))')
            await ev('() => {document.querySelector(\'[data-effect="ripples"] canvas\').style.display="none";return true}')
            await sample_delay(180)
            zero=await ev('() => ({draws:__drawCount(document.querySelector(\'[data-effect="ripples"] canvas\')),raf:__resources.snapshot().raf})')
            check('zero_size_no_draw',zero['draws']==draws and zero['raf']==0,{'before':draws,'after':zero})
            await ev('() => {document.querySelector(\'[data-effect="ripples"] canvas\').style.display="";return true}')
            await visible('ripples')
            await stopped('ripples','zero_size_restore_no_resume')
            # Real document navigation/back. persisted is recorded, never fabricated.
            await play('ripples')
            await ev('() => {function receipt(){removeEventListener("pagehide",receipt);sessionStorage.setItem("canvas-test-pagehide",JSON.stringify({states:Object.values(canvasEffectsDemo.instances).map(i=>i.getState()),resources:__resources.snapshot()}))}addEventListener("pagehide",receipt);return true}')
            await navigate(origin+'/demo/history.html')
            pagehide=await ev('() => JSON.parse(sessionStorage.getItem("canvas-test-pagehide"))')
            check('actual_pagehide_releases_resources',pagehide and all(s['destroyed'] and not s['running'] for s in pagehide['states']) and pagehide['resources']['raf']==0 and pagehide['resources']['observers']==0,pagehide)
            await page.go_back()
            await wait('location.pathname==="/demo/index.html" && document.readyState==="complete" && window.canvasEffectsDemo')
            await visible('ripples')
            history=await ev('() => ({persisted:window.__persisted,states:Object.values(canvasEffectsDemo.instances).map(i=>i.getState()),controls:[...document.querySelectorAll(\'button[data-action="play"]\')].map(b=>({disabled:b.disabled,hidden:b.hidden})),status:[...document.querySelectorAll("output")].map(o=>o.textContent),resources:__resources.snapshot()})')
            check('actual_history_no_auto_resume',all(not s['running'] for s in history['states']) and history['resources']['raf']==0,history)
            if history['controls'][0]['disabled'] or history['controls'][0]['hidden']:
                check('actual_history_truthful_static',all('reload' in t.lower() for t in history['status']),history)
            else:
                a=await pixels('ripples')
                await play('ripples')
                await sample_delay(200)
                check('actual_history_usable_play_pixels',difference(a,await pixels('ripples'))>.001,history)
                await click(sel('ripples','button[data-action="stop"]'))
            await shot('actual-history-restored')
            await navigate()
            await play('ripples')
            await ev('() => {dispatchEvent(new PageTransitionEvent("pagehide",{persisted:true}));return true}')
            gone=await ev('() => ({states:Object.values(canvasEffectsDemo.instances).map(i=>i.getState()),resources:__resources.snapshot(),buttons:[...document.querySelectorAll("button")].map(b=>({disabled:b.disabled,hidden:b.hidden}))})')
            check('synthetic_pagehide_releases_resources',all(s['destroyed'] and not s['running'] for s in gone['states']) and gone['resources']['raf']==0 and gone['resources']['observers']==0 and all(b['disabled'] or b['hidden'] for b in gone['buttons']),gone)
            await ev('() => {dispatchEvent(new PageTransitionEvent("pageshow",{persisted:true}));return true}')
            restored=await ev('() => ({states:Object.values(canvasEffectsDemo.instances).map(i=>i.getState()),status:[...document.querySelectorAll("output")].map(o=>o.textContent),disabled:[...document.querySelectorAll(\'button[data-action="play"]\')].map(b=>b.disabled||b.hidden),resources:__resources.snapshot()})')
            check('synthetic_persisted_restore_no_auto_resume',all(not s['running'] for s in restored['states']) and restored['resources']['raf']==0,restored)
            if all(restored['disabled']):
                check('synthetic_persisted_truthful_reload',all('reload' in t.lower() for t in restored['status']),restored)
            else:
                a=await pixels('ripples')
                await play('ripples')
                await sample_delay(200)
                check('synthetic_persisted_usable_play_pixels',difference(a,await pixels('ripples'))>.001,restored)
            await shot('synthetic-persisted')
            check('no_runtime_errors',not errors and await ev('() => __errors.length===0'),errors)
            urls=[r['request']['url'] for r in requests]
            record['network_urls']=urls
            check('only_fixture_requests',all(u.startswith(origin+'/') or u=='data:,' for u in urls) and all(r['status']==200 for r in record['requests']),urls)
    except Exception:
        record['errors'].append(traceback.format_exc())
        print(traceback.format_exc(), flush=True)
    finally:
        if browser:
            try:
                async with asyncio.timeout(10): await browser.kill()
                record['cleanup']['browser_disconnected'] = True
            except Exception as exc: record['cleanup']['disconnect_error'] = repr(exc)
        if chrome:
            try:
                receipt = chrome.close()
                record['cleanup']['owned_chrome'] = receipt
                record['cleanup']['no_live_owned_processes'] = receipt['no_owned_children']
                record['cleanup']['browser_returncode'] = receipt['browser_exit']
            except Exception as exc: record['cleanup']['owned_chrome_error'] = repr(exc)
        try:
            if server and thread and thread.is_alive(): server.shutdown()
        except Exception as exc: record['cleanup']['server_shutdown_error'] = repr(exc)
        try:
            if server: server.server_close()
            if thread: thread.join(timeout=2)
            record['cleanup']['server_stopped'] = not thread or not thread.is_alive()
        except Exception as exc: record['cleanup']['server_close_error'] = repr(exc)
        for name, resource in [('proxy', proxy), ('log', logfile)]:
            try:
                if resource: resource.close()
                record['cleanup'][name + '_closed'] = True
            except Exception as exc: record['cleanup'][name + '_error'] = repr(exc)
        try:
            if chrome is None or record['cleanup'].get('no_live_owned_processes', False):
                shutil.rmtree(work)
                record['cleanup']['private_work_removed'] = not work.exists()
            else:
                record['cleanup']['preserved_private_work'] = str(work)
                record['cleanup']['private_work_removed'] = False
        except Exception as exc: record['cleanup']['private_work_error'] = repr(exc)
    record['source_hashes_end'] = {str(p): hashlib.sha256(p.read_bytes()).hexdigest() for p in source_paths}
    record['checks'].append({'name': 'sources_unchanged', 'pass': record['source_hashes_end'] == source_hashes})
    record['pass'] = not record['errors'] and bool(record['checks']) and all(c['pass'] for c in record['checks']) and all(record['cleanup'].get(k) for k in ('browser_disconnected', 'no_live_owned_processes', 'server_stopped', 'private_work_removed', 'proxy_closed', 'log_closed')) and not any('error' in key for key in record['cleanup'])
    atomic(out / 'evidence.json', json.dumps(record, indent=2))
    print('RESULT', record['pass'], str(out / 'evidence.json'), flush=True)
    return 0 if record['pass'] else 1


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True, help='New empty evidence directory (never a fixture directory)')
    parser.add_argument('--deadline', type=int, default=120)
    args = parser.parse_args()
    if not 30 <= args.deadline <= 180:
        parser.error('deadline must be 30..180 seconds')
    args.output = args.output.resolve()
    if args.output.is_relative_to(FIXTURE.parents[1]):
        parser.error('evidence must be outside the skill package')
    if os.geteuid() == 0:
        parser.error('run as the unprivileged prime-agent user, never root')
    if ctypes.CDLL(None, use_errno=True).prctl(36, 1, 0, 0, 0) != 0:
        raise OSError(ctypes.get_errno(), 'subreaper')
    args.output.mkdir(parents=True, exist_ok=False)
    work = Path(tempfile.mkdtemp(prefix='canvas-effects-', dir='/tmp'))
    os.chmod(work, 0o700)
    for name in ('home', 'config', 'cache', 'tmp', 'downloads', 'cwd'):
        (work / name).mkdir()
    os.environ.clear()
    os.environ.update({'PATH': '/usr/bin:/bin', 'HOME': str(work/'home'), 'TMPDIR': str(work/'tmp'),
        'XDG_CONFIG_HOME': str(work/'config'), 'XDG_CACHE_HOME': str(work/'cache'),
        'BROWSER_USE_CONFIG_DIR': str(work/'config'), 'PYTHON_DOTENV_DISABLED': '1',
        'ANONYMIZED_TELEMETRY': 'false', 'BROWSER_USE_CLOUD_SYNC': 'false',
        'BROWSER_USE_SETUP_LOGGING': 'false', 'BROWSER_USE_DISABLE_EXTENSIONS': '1',
        'BROWSER_USE_VERSION_CHECK': 'false', 'BROWSER_USE_LOGGING_LEVEL': 'error',
        'LMNR_LOGGING_LEVEL': 'warning', 'NO_PROXY': '127.0.0.1,localhost,::1'})
    tempfile.tempdir = None  # Keep library-created scratch inside the new TMPDIR.
    os.chdir(work/'cwd')
    logging.basicConfig(level=logging.ERROR)
    try:
        return asyncio.run(run(args, work))
    finally:
        if work.exists():
            try:
                children = set()
                for task in Path('/proc/self/task').iterdir():
                    try: children.update((task / 'children').read_text().split())
                    except FileNotFoundError: continue
                if children:
                    print('PRESERVED_PRIVATE_WORK ' + str(work) + ' owned children remain', flush=True)
                else:
                    shutil.rmtree(work)
            except Exception as exc:
                print('PRESERVED_PRIVATE_WORK ' + str(work) + ' cleanup uncertain: ' + repr(exc), flush=True)


if __name__ == '__main__':
    raise SystemExit(main())
