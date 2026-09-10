#!/usr/bin/env python3
'''Bounded fixture-only checks. Use the documented reviewed browser-use venv.'''
import argparse
import asyncio
import base64
import hashlib
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
import threading
import traceback
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

FIXTURE = Path(__file__).resolve().parents[1] / 'assets/demo'
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
    source_paths = [Path(__file__).resolve(), *shared_paths, *(FIXTURE / n for n in ('index.html', 'style.css', 'scene.js'))]
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
    for name, mime in [('index.html', 'text/html'), ('style.css', 'text/css'), ('scene.js', 'text/javascript')]:
        path = FIXTURE / name
        if path.is_symlink():
            raise RuntimeError('Fixture symlink refused')
        files['/' + name] = (path.read_bytes(), mime)
    files['/'] = files['/index.html']
    record['fixture_sha256'] = {k: hashlib.sha256(v[0]).hexdigest() for k, v in files.items()}
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
                data = base64.b64decode(await page.screenshot(format='png'))
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
            async def navigate(url=origin + '/'):
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
            async def layout(name):
                data = await ev('''() => ({width:innerWidth,clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,clipping:[...document.querySelectorAll('h1,h2,h3,p,a,button,li')].filter(e=>!e.hidden&&!e.closest('svg')&&!e.classList.contains('skip')).map(e=>({tag:e.tagName,text:e.textContent.slice(0,50),r:e.getBoundingClientRect(),style:getComputedStyle(e)})).filter(o=>o.r.width>0&&(o.r.left<-.5||o.r.right>document.documentElement.clientWidth+.5||o.style.visibility==='hidden'||o.style.opacity==='0')).map(o=>({tag:o.tag,text:o.text,left:o.r.left,right:o.r.right})),headings:[...document.querySelectorAll('h1,h2')].map(e=>e.innerText),animations:document.getAnimations().length})''')
                check(name, data['scrollWidth'] <= data['clientWidth'] and not data['clipping'] and len(data['headings']) == 3, data)
                await shot(name)
            await page.set_viewport_size(1440, 1000)
            await navigate()
            await layout('desktop-1440')
            await ev('() => {document.querySelector("#field-notes").scrollIntoView();return true}')
            await shot('desktop-notes')
            await ev('() => {document.querySelector("#study").scrollIntoView();return true}')
            await shot('desktop-study')
            await ev('() => {scrollTo(0,0);return true}')
            check('static_first', await ev('() => document.getAnimations().length===0'))
            for width in (390, 320):
                await page.set_viewport_size(width, 844)
                await layout('narrow-' + str(width))
                subtitle = await ev('() => document.querySelector(".title-row p").innerText')
                check('subtitle_word_spacing_' + str(width), 'guide to' in subtitle, subtitle)
                await ev('() => {document.querySelector("#field-notes").scrollIntoView();return true}')
                await shot('notes-' + str(width))
                await ev('() => {scrollTo(0,0);return true}')
            ratio = await ev('''() => {const es=[...document.querySelectorAll('body,body *:not(svg):not(svg *)')], sizes=es.map(e=>parseFloat(getComputedStyle(e).fontSize));es.forEach((e,i)=>e.style.fontSize=(sizes[i]*2)+'px');return parseFloat(getComputedStyle(document.querySelector('p')).fontSize)/sizes[es.indexOf(document.querySelector('p'))]}''')
            check('text_resize_actual_ratio', ratio == 2, ratio)
            await layout('text-200-320')
            await ev('() => {document.querySelector("#field-notes").scrollIntoView();return true}')
            await shot('text-200-notes')
            await ev('() => {document.querySelector("#study").scrollIntoView();return true}')
            await shot('text-200-study')
            await navigate()
            await page.set_viewport_size(1440, 1000)
            await press('Tab')
            focused = await ev('() => ({text:document.activeElement.textContent,top:document.activeElement.getBoundingClientRect().top,outline:getComputedStyle(document.activeElement).outlineWidth})')
            check('skip_link_visible_keyboard_focus', focused['text'] == 'Skip to field journal' and focused['top'] >= 0 and focused['outline'] == '3px', focused)
            await press('Enter')
            check('skip_link_targets_main', await ev('() => document.activeElement.id==="main" && location.hash==="#main"'))
            for _ in range(12):
                if await ev('() => document.activeElement.id==="motion-toggle"'):
                    break
                await press('Tab')
            check('motion_reachable_by_keyboard', await ev('() => document.activeElement.id==="motion-toggle"'))
            await sample_delay()
            record['before_play'] = await ev('() => ({hidden:document.hidden,state:document.querySelector("#motion-status").textContent,rect:document.querySelector("#scene").getBoundingClientRect().toJSON(),active:document.activeElement.id})')
            await ev('() => {window.__clicks=[];document.querySelector("#motion-toggle").addEventListener("click",e=>__clicks.push({trusted:e.isTrusted}));return true}')
            await press('Enter')
            record['after_play'] = await ev('() => ({clicks:__clicks,hidden:document.hidden,status:document.querySelector("#motion-status").textContent,disabled:document.querySelector("#motion-toggle").disabled,errors:__errors,anims:document.getAnimations().length,io:typeof IntersectionObserver})')
            await wait('document.getAnimations().length===1')
            await sample_delay()
            a = await ev('() => ({time:document.getAnimations()[0].currentTime,state:document.getAnimations()[0].playState,duration:document.getAnimations()[0].effect.getTiming().duration,iterations:document.getAnimations()[0].effect.getTiming().iterations})')
            transform_before_pause = await ev('() => getComputedStyle(document.querySelector(".light")).transform')
            await press('Space')
            await ev('() => document.getAnimations()[0].ready.then(()=>true)')
            paused = await ev('() => document.getAnimations()[0].currentTime')
            await sample_delay()
            record['pause_state'] = await ev('() => ({state:document.getAnimations()[0].playState,time:document.getAnimations()[0].currentTime,clicks:__clicks,status:document.querySelector("#motion-status").textContent})')
            check('pause_real_timeline', await ev('() => document.getAnimations()[0].playState==="paused" && document.getAnimations()[0].currentTime===' + str(paused)), a)
            await press('Enter')
            await sample_delay()
            await shot('motion-resumed')
            transform_after_resume = await ev('() => getComputedStyle(document.querySelector(".light")).transform')
            check('motion_changes_computed_transform', transform_before_pause != transform_after_resume, {'before': transform_before_pause, 'after': transform_after_resume})
            check('resume_real_timeline', await ev('() => document.getAnimations()[0].playState==="running" && document.getAnimations()[0].currentTime>' + str(paused)))
            check('one_finite_seven_second_effect', a['duration'] == 7000 and a['iterations'] == 1, a)
            await wait('document.getAnimations().length===0', 8000)
            check('finite_completion', await ev('() => document.querySelector("#motion-status").textContent==="Light study complete."'))
            await press('Enter')
            await ev('() => {document.querySelector("#study").scrollIntoView();return true}')
            await wait('document.getAnimations()[0]?.playState==="paused"')
            check('offscreen_pauses', True)
            await ev('() => {document.querySelector("#scene").scrollIntoView();return true}')
            await sample_delay()
            check('no_offscreen_auto_resume', await ev('() => document.getAnimations()[0].playState==="paused"'))
            await ev('() => {document.querySelector("#motion-toggle").click();return true}')
            other = await browser.new_page()
            other_sid = await other.session_id
            await cdp.send.Page.bringToFront(session_id=other_sid)
            await wait('document.hidden && document.getAnimations()[0]?.playState==="paused"')
            check('actual_background_tab_pauses', True)
            await cdp.send.Page.bringToFront(session_id=sid)
            await wait('!document.hidden')
            check('foreground_does_not_auto_resume', await ev('() => document.getAnimations()[0].playState==="paused"'))
            other_info = await other.get_target_info()
            await cdp.send.Target.closeTarget(params={'targetId': other_info['targetId']})
            async def reduced(value):
                await cdp.send.Emulation.setEmulatedMedia(params={'features': [{'name': 'prefers-reduced-motion', 'value': value}]}, session_id=sid)
            await reduced('reduce')
            await wait('document.querySelector("#motion-toggle").disabled')
            check('live_reduced_cancels', await ev('() => document.getAnimations().length===0 && getComputedStyle(document.querySelector(".light")).display==="none"'))
            await ev('() => {document.querySelector("#motion-toggle").click();return true}')
            check('reduced_cannot_resume', await ev('() => document.getAnimations().length===0'))
            await navigate()
            await layout('reduced-initial')
            await reduced('no-preference')
            await wait('!document.querySelector("#motion-toggle").disabled')
            check('preference_restore_stays_static', await ev('() => document.getAnimations().length===0'))
            for name, source in [('missing-api', 'Element.prototype.animate=undefined'), ('throwing-api', 'Element.prototype.animate=()=>{throw new Error("controlled API failure")}')]:
                script = await cdp.send.Page.addScriptToEvaluateOnNewDocument(params={'source': source}, session_id=sid)
                await navigate()
                if name == 'throwing-api':
                    await ev('() => {document.querySelector("#scene").scrollIntoView();return true}')
                    await sample_delay()
                    await ev('() => {document.querySelector("#motion-toggle").click();return true}')
                check(name + '_static_fallback', await ev('() => document.querySelector("#motion-toggle").hidden && document.getAnimations().length===0 && window.__errors.length===0'))
                await layout(name)
                await cdp.send.Page.removeScriptToEvaluateOnNewDocument(params={'identifier': script['identifier']}, session_id=sid)
            await navigate()
            contrast = await ev(r'''() => {const rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number);const lum=c=>c.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4}).reduce((a,x,i)=>a+x*[.2126,.7152,.0722][i],0);return ['body','figcaption','.study','#motion-toggle','.period'].map(s=>{let e=document.querySelector(s),c=getComputedStyle(e),bg=c.backgroundColor;while(bg==='rgba(0, 0, 0, 0)'&&e.parentElement){e=e.parentElement;bg=getComputedStyle(e).backgroundColor}const a=lum(rgb(c.color)),b=lum(rgb(bg));return {selector:s,foreground:c.color,background:bg,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)}})}''')
            check('fixture_solid_text_contrast', all(p['ratio'] >= 4.5 for p in contrast), contrast)
            await ev('() => {document.querySelector("#main").focus();return true}')
            for _ in range(12):
                await press('Tab')
                if await ev('() => document.activeElement.classList.contains("chapter-link")'):
                    break
            await press('Enter')
            check('chapter_anchor_keyboard', await ev('() => location.hash==="#field-notes" && document.activeElement.id==="field-notes"'))
            await navigate()
            for _ in range(4):
                await press('Tab')
            check('study_nav_reached', await ev('() => document.activeElement.getAttribute("href")==="#study"'))
            await press('Enter')
            focus = await ev('() => ({id:document.activeElement.id,color:getComputedStyle(document.activeElement).outlineColor,width:getComputedStyle(document.activeElement).outlineWidth,background:getComputedStyle(document.activeElement).backgroundColor})')
            check('study_anchor_focus', focus['id'] == 'study' and focus['color'] == 'rgb(237, 190, 132)' and focus['width'] == '3px', focus)
            await shot('study-keyboard-focus')
            await navigate()
            await navigate(origin + '/index.html')
            await page.go_back()
            await wait('location.pathname==="/" && document.readyState==="complete"')
            await ev('() => {document.querySelector("#scene").scrollIntoView();return true}')
            await sample_delay()
            restored = await ev('() => ({persisted:window.__persisted,hidden:document.querySelector("#motion-toggle").hidden,status:document.querySelector("#motion-status").textContent})')
            if restored['hidden']:
                check('actual_history_truthful_static', 'Reload' in restored['status'], restored)
            else:
                await ev('() => {document.querySelector("#motion-toggle").click();return true}')
                await wait('document.getAnimations().length===1')
                check('actual_history_live_control', True, restored)
            record['history'] = restored
            await navigate()
            await cdp.send.Emulation.setScriptExecutionDisabled(params={'value': True}, session_id=sid)
            await page.set_viewport_size(320, 844)
            await navigate()
            # CDP init scripts still run; assert absent production enhancement,
            # not absence of out-of-band test instrumentation.
            check('no_js_static_useful', await ev('() => document.querySelector("#motion-status").textContent==="Static light study." && document.querySelector("#motion-toggle").hidden && document.getAnimations().length===0 && document.querySelectorAll(".observations li").length===3'))
            await layout('no-javascript-320')
            await press('Tab')
            await press('Enter')
            check('no_js_skip_link', await ev('() => location.hash==="#main" && document.activeElement.id==="main"'))
            await cdp.send.Emulation.setScriptExecutionDisabled(params={'value': False}, session_id=sid)
            await navigate()
            await ev('() => {document.querySelector("#scene").scrollIntoView();return true}')
            await sample_delay()
            await ev('() => {document.querySelector("#motion-toggle").click();return true}')
            await wait('document.getAnimations().length===1')
            await ev('() => {dispatchEvent(new PageTransitionEvent("pagehide"));return true}')
            check('teardown_cancels', await ev('() => document.getAnimations().length===0 && document.querySelector("#motion-toggle").hidden && document.querySelector("#motion-status").textContent.includes("Reload")'))
            check('no_runtime_errors', not errors and await ev('() => window.__errors.length===0'), errors)
            urls = [r['request']['url'] for r in requests]
            record['network_urls'] = urls
            check('only_fixture_requests', all(u.startswith(origin + '/') or u == 'data:,' for u in urls) and all(r['status'] == 200 for r in record['requests']), urls)
            check('fixture_transfer_bound', sum(len(v[0]) for k,v in files.items() if k != '/') < 20000, {'bytes': sum(len(v[0]) for k,v in files.items() if k != '/'), 'meaning': 'source payload only, not heap/GPU/performance'})
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
    work = Path(tempfile.mkdtemp(prefix='salt-', dir='/tmp'))
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
