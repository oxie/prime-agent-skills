#!/usr/bin/python3
"""On-demand local browser observations. No provider, user session or package setup."""
import argparse
import asyncio
import base64
import ctypes
import hashlib
import importlib.util
import inspect
import json
import os
from pathlib import Path
import selectors
import resource
import re
import shutil
import signal
import socket
import stat
import subprocess
import sys
import tempfile
import time
from urllib.parse import urlsplit

HERE = Path(__file__).resolve().parent
# Fixed for this installation, independent of the clean HOME supplied to the browser.
RUNTIME = Path("/home/prime-agent/.local/share/prime-agent/browser-use-tools")
VENV = RUNTIME/".venv"
MIB = 1024*1024

def module(name):
    spec=importlib.util.spec_from_file_location(name,HERE/(name+".py"))
    value=importlib.util.module_from_spec(spec);sys.modules[name]=value;spec.loader.exec_module(value)
    return value

policy=module("policy")
require=policy.require

def clean_environment(home="/nonexistent"):
    return {"PATH":"/usr/bin:/bin", "LANG":"C.UTF-8", "HOME":str(home),
        "PYTHON_DOTENV_DISABLED":"1", "ANONYMIZED_TELEMETRY":"false",
        "BROWSER_USE_CLOUD_SYNC":"false", "BROWSER_USE_SETUP_LOGGING":"false",
        "BROWSER_USE_DISABLE_EXTENSIONS":"1", "BROWSER_USE_VERSION_CHECK":"false",
        "BROWSER_USE_LOGGING_LEVEL":"error", "LMNR_LOGGING_LEVEL":"error",
        "BROWSER_CHECK_CLEAN":"1"}

def owned_read(path, limit):
    fd=os.open(path,os.O_RDONLY|os.O_NOFOLLOW|os.O_NONBLOCK)
    try:
        info=os.fstat(fd)
        require(stat.S_ISREG(info.st_mode) and info.st_size<=limit,"Expected bounded regular input")
        with os.fdopen(os.dup(fd),"rb") as stream:raw=stream.read(limit+1)
        require(len(raw)<=limit,"Input exceeded bound")
        return raw
    finally:os.close(fd)

def atomic(path, value):
    raw=json.dumps(value,indent=2,ensure_ascii=True).encode()+b"\n"
    require(len(raw)<=2*MIB,"Report exceeds2MiB")
    temp=path.with_name(path.name+".partial")
    with temp.open("xb") as out:out.write(raw)
    temp.replace(path)

def safe_url(value):
    p=urlsplit(value)
    return p._replace(query="redacted" if p.query else "",fragment="").geturl()

OwnedChrome=module("owned_chrome").OwnedChrome

async def chain(cdp, domain, event, callback):
    registry=getattr(cdp.register,domain)._registry
    previous=registry._handlers.get(event)
    async def observe(params,session):
        if previous:
            value=previous(params,session)
            if inspect.isawaitable(value):await value
        await callback(params,session)
    registry.register(event,observe)

DOM_SCRIPT="""() => ({url:location.href.slice(0,4096),title:document.title.slice(0,256),
 viewport:{width:innerWidth,height:innerHeight},scroll:{x:scrollX,y:scrollY},
 horizontalOverflow:document.documentElement.scrollWidth>innerWidth,
 text:(document.body?.innerText||'').slice(0,16000),
 textTruncated:(document.body?.innerText||'').length>16000,
 controls:[...document.querySelectorAll('button,a,input,select,textarea,[role]')].slice(0,100).map(e=>({
  tag:e.tagName.toLowerCase(),role:(e.getAttribute('role')||'').slice(0,80),type:(e.getAttribute('type')||'').slice(0,64),
  name:(e.getAttribute('aria-label')||e.innerText||'').slice(0,160),disabled:!!e.disabled})),
 active:{tag:document.activeElement?.tagName,id:(document.activeElement?.id||'').slice(0,128)},
 reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches})"""

async def inspect_page(args, work, out, record):
    origin,port=policy.local_url(args.url)
    chrome=None;browser=None;proxy=None;log=None;dialog_tasks=[]
    loop=asyncio.get_running_loop();task=asyncio.current_task()
    for sig in (signal.SIGTERM,signal.SIGINT):loop.add_signal_handler(sig,task.cancel)
    try:
        from browser_use import BrowserSession
        launcher=module("chrome_launch")
        optout=module("optional_optout")
        record["optional_watchdog_policy"]=optout.disable_optional_watchdogs()
        proxy=socket.socket();proxy.bind(("127.0.0.1",0))
        profile=work/"profile";profile.mkdir(mode=0o700)
        log=(out/"browser.log").open("xb")
        command=launcher.launch_argv(profile,proxy.getsockname()[1],port)
        chrome=OwnedChrome();chrome.start(command,log)
        record["browser_pid"]=chrome.process.pid
        async with asyncio.timeout(60):
            async with asyncio.timeout(15):
                while not (profile/"DevToolsActivePort").exists():
                    require(not chrome.exited(),"Chrome exited before CDP startup")
                    await asyncio.sleep(.05)
            endpoint=owned_read(profile/"DevToolsActivePort",4096).decode().splitlines()
            cdp_port=int(endpoint[0]);require(1<=cdp_port<=65535 and cdp_port not in (port,proxy.getsockname()[1]),"Invalid or colliding owned CDP port")
            browser=BrowserSession(cdp_url=f"http://127.0.0.1:{cdp_port}",is_local=False,use_cloud=False,
                headless=True,chromium_sandbox=True,disable_security=False,keep_alive=False,
                enable_default_extensions=False,captcha_solver=False,auto_download_pdfs=False,
                accept_downloads=False,permissions=[],user_data_dir=profile,
                downloads_path=work/"downloads",device_scale_factor=1)
            await browser.start();cdp=browser.cdp_client
            async def on_download(event,session):
                if len(record["downloads"])<32:
                    record["downloads"].append({"state":event.get("state","began"),
                        "received_bytes":event.get("receivedBytes",0),"total_bytes":event.get("totalBytes",0)})
                else:record["downloads_truncated"]=True
            await chain(cdp,"Browser","Browser.downloadWillBegin",on_download)
            await chain(cdp,"Browser","Browser.downloadProgress",on_download)
            await cdp.send.Browser.setDownloadBehavior(params={"behavior":"deny","eventsEnabled":True})
            record["browser_version"]=await cdp.send.Browser.getVersion()
            require(record["browser_version"]["product"].endswith("/153.0.8010.36"),"Unexpected browser version")
            page=await browser.new_page();sid=await page.session_id
            await page.set_viewport_size(args.width,args.height)
            await cdp.send.Emulation.setEmulatedMedia(params={"features":[{"name":"prefers-reduced-motion","value":"reduce" if args.reduced_motion else "no-preference"}]},session_id=sid)
            lifecycle=[];changed=asyncio.Event()
            async def on_lifecycle(event,session):
                if session==sid:
                    lifecycle.append(event);del lifecycle[:-64];changed.set()
            await chain(cdp,"Page","Page.lifecycleEvent",on_lifecycle)
            await cdp.send.Page.enable(session_id=sid)
            await cdp.send.Page.setLifecycleEventsEnabled(params={"enabled":True},session_id=sid)
            async def navigate(url):
                result=await cdp.send.Page.navigate(params={"url":url},session_id=sid)
                require(not result.get("errorText"),"Navigation failed")
                loader=result.get("loaderId");require(loader,"Expected document loader")
                async with asyncio.timeout(10):
                    while True:
                        changed.clear()
                        if any(e.get("loaderId")==loader and e.get("name")=="load" for e in lifecycle):break
                        await changed.wait()
            await navigate("chrome://sandbox/")
            sandbox=json.loads(await page.evaluate("() => ({text:document.body.innerText})"))["text"]
            record["sandbox_text"]=sandbox[:12000]
            require("You are adequately sandboxed" in sandbox,"Native Chrome sandbox not confirmed")
            for name in ("PID namespaces","Network namespaces","Seccomp-BPF sandbox"):
                require(name in sandbox and re.search(re.escape(name)+r"\s+Yes",sandbox),"Missing native sandbox protection: "+name)
            process_rows=chrome.observe();record["owned_processes"]=process_rows
            renderers=[r for r in process_rows if r["renderer"]]
            require(renderers and all(r["status"].get("NoNewPrivs")=="1" and r["status"].get("Seccomp")=="2" for r in renderers),"Renderer sandbox status missing")
            async def on_exception(event,session):
                if session==sid:
                    if len(record["page_errors"])<32:
                        details=event.get("exceptionDetails",{})
                        record["page_errors"].append(str(details.get("text","JavaScript exception"))[:512])
                    else:record["page_errors_truncated"]=True
            await chain(cdp,"Runtime","Runtime.exceptionThrown",on_exception)
            await cdp.send.Runtime.enable(session_id=sid)
            async def dismiss_dialog(entry):
                try:
                    async with asyncio.timeout(2):
                        await cdp.send.Page.handleJavaScriptDialog(params={"accept":False},session_id=sid)
                    entry["canceled"]=True
                except Exception as exc:
                    record["errors"].append({"type":"DialogCancellation","message":type(exc).__name__})
            async def on_dialog(event,session):
                # CDP receives responses on this same event loop. Never await a
                # CDP command inside its serial receive callback. Other attached
                # sessions can repeat the same event; this page session owns it.
                if session!=sid or any(not task.done() for task in dialog_tasks):return
                entry={"type":"UnexpectedDialog","message":"Unexpected JavaScript dialog",
                    "dialog_type":str(event.get("type","unknown"))[:32],"canceled":False}
                if len(dialog_tasks)<32:
                    record["errors"].append(entry)
                    dialog_tasks.append(asyncio.create_task(dismiss_dialog(entry)))
            await chain(cdp,"Page","Page.javascriptDialogOpening",on_dialog)
            initial_targets=await cdp.send.Target.getTargets()
            allowed_targets={t["targetId"] for t in initial_targets["targetInfos"] if t["type"]=="page"}
            async def on_target(event,session):
                info=event.get("targetInfo",{})
                if info.get("type")=="page" and info.get("targetId") not in allowed_targets:
                    if not any(e["type"]=="UnexpectedPage" for e in record["errors"]):
                        record["errors"].append({"type":"UnexpectedPage","message":"New page outside the explicit single-page scope"})
            await chain(cdp,"Target","Target.targetCreated",on_target)
            await cdp.send.Target.setDiscoverTargets(params={"discover":True})
            await navigate(args.url)
            async def origin_check():
                if dialog_tasks:await asyncio.gather(*dialog_tasks)
                require(not record["errors"],"Browser guard reported an incomplete operation")
                require(policy.same_origin(await page.get_url(),origin),"Page left the authorized origin")
                targets=await cdp.send.Target.getTargets()
                require(all(t["targetId"] in allowed_targets for t in targets["targetInfos"] if t["type"]=="page"),"Unexpected page outside single-page scope")
            async def screenshot(name):
                await origin_check()
                encoded=await page.screenshot(format="png")
                require(len(encoded)<=12*MIB,"Screenshot response exceeds bound")
                raw=base64.b64decode(encoded,validate=True)
                require(raw.startswith(b"\x89PNG\r\n\x1a\n") and len(raw)<=8*MIB,"Invalid or oversized PNG")
                require(sum(s["bytes"] for s in record["screenshots"])+len(raw)<=64*MIB,"Total screenshots exceed64MiB")
                with (out/name).open("xb") as stream:stream.write(raw)
                record["screenshots"].append({"file":name,"bytes":len(raw),"sha256":hashlib.sha256(raw).hexdigest()})
            await screenshot("initial.png")
            for index,action in enumerate(args.actions):
                await origin_check();kind=action["action"]
                if kind=="wait-for":
                    await page.evaluate("(selector) => new Promise((resolve,reject)=>{const end=performance.now()+5000;function test(){if(document.querySelector(selector))return resolve({found:true});if(performance.now()>end)return reject(new Error('Selector timeout'));setTimeout(test,50)}test()})",action["selector"])
                elif kind in ("click","fill"):
                    elements=await page.get_elements_by_css_selector(action["selector"])
                    require(len(elements)==1,"Action requires exactly one matched element")
                    element=elements[0]
                    if kind=="fill":
                        require(policy.fill_allowed(await element.get_attribute("type"),await element.get_attribute("autocomplete")),"Sensitive/file/hidden field refused")
                        await element.fill(action["value"],clear=True)
                    else:await element.click()
                elif kind=="press":await page.press(action["key"])
                elif kind=="scroll":
                    await cdp.send.Input.dispatchMouseEvent(params={"type":"mouseWheel","x":args.width/2,"y":args.height/2,"deltaX":action["x"],"deltaY":action["y"]},session_id=sid)
                elif kind=="screenshot":await screenshot(f"step-{index+1:02d}.png")
                await origin_check()
                record["actions_completed"].append({"index":index+1,"action":kind})
            await screenshot("final.png")
            dom=json.loads(await page.evaluate(DOM_SCRIPT));dom["url"]=safe_url(dom["url"])
            atomic(out/"dom.json",dom);record["dom"]="dom.json"
            record["status"]="complete"
    except (Exception,asyncio.CancelledError) as exc:
        record["errors"].append({"type":type(exc).__name__,"message":str(exc)[:512]})
    finally:
        # A second cancellation must not interrupt bounded owned cleanup.
        for sig in (signal.SIGTERM,signal.SIGINT):loop.add_signal_handler(sig,lambda: None)
        if dialog_tasks:await asyncio.gather(*dialog_tasks,return_exceptions=True)
        record["download_files_before_cleanup"]=sum(
            1 for directory in (work/"downloads",work/"home"/"Downloads")
            if directory.exists() for path in directory.rglob("*") if path.is_file())
        if record["download_files_before_cleanup"] or any(d["state"]=="completed" for d in record["downloads"]):
            record["errors"].append({"type":"UnexpectedDownload","message":"Download denial did not hold"})
        if browser:
            try:
                async with asyncio.timeout(5):await browser.kill()
                record["cleanup"]["session_disconnected"]=True
            except Exception as exc:record["errors"].append({"type":"SessionCleanup","message":type(exc).__name__})
        if chrome:
            try:record["cleanup"].update(chrome.close())
            except Exception as exc:record["errors"].append({"type":"ChromeCleanup","message":str(exc)[:512]})
        if proxy:proxy.close()
        if log:log.close()
        if not chrome or record["cleanup"].get("no_owned_children"):
            shutil.rmtree(work);record["cleanup"]["private_profile_removed"]=True
        else:record["cleanup"]["preserved_work"]=str(work)


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url",required=True)
    parser.add_argument("--output",required=True,type=Path)
    parser.add_argument("--actions",type=Path)
    parser.add_argument("--width",type=int,default=1440)
    parser.add_argument("--height",type=int,default=900)
    parser.add_argument("--reduced-motion",action="store_true")
    args=parser.parse_args();policy.local_url(args.url)
    require(320<=args.width<=3840 and 240<=args.height<=2160,"Viewport outside bounds")
    actions_raw=owned_read(args.actions,65536) if args.actions else b"[]"
    args.actions=policy.actions(actions_raw)
    require(args.output.is_absolute() and args.output.parent.resolve()==args.output.parent,"Use canonical absolute output parent")
    require(not args.output.exists() and not args.output.is_symlink(),"Output must be new")
    if Path(sys.prefix).resolve()!=VENV.resolve() or os.environ.get("BROWSER_CHECK_CLEAN")!="1":
        require((VENV/"bin/python").is_file(),"Verified browser-use runtime missing; no automatic setup")
        os.execve(VENV/"bin/python",[str(VENV/"bin/python"),"-I","-B",str(Path(__file__).resolve()),*sys.argv[1:]],clean_environment())
    resource.setrlimit(resource.RLIMIT_CORE,(0,0))
    resource.setrlimit(resource.RLIMIT_FSIZE,(16*MIB,16*MIB))
    resource.setrlimit(resource.RLIMIT_NOFILE,(512,512))
    resource.setrlimit(resource.RLIMIT_CPU,(30,30))
    os.umask(0o077);args.output.mkdir(mode=0o700)
    require(not Path(f"/proc/self/task/{os.getpid()}/children").read_text().strip(),"Fresh CLI requires no existing children")
    libc=ctypes.CDLL(None,use_errno=True);require(libc.prctl(36,1,0,0,0)==0,"Subreaper setup failed")
    work=Path(tempfile.mkdtemp(prefix="browser-check-"));os.chdir(work)
    for name in ("home","config","cache","downloads"):(work/name).mkdir(mode=0o700)
    os.environ.clear();os.environ.update(clean_environment(work/"home"))
    os.environ.update(TMPDIR=str(work),XDG_CONFIG_HOME=str(work/"config"),XDG_CACHE_HOME=str(work/"cache"),BROWSER_USE_CONFIG_DIR=str(work/"config"))
    # mkdtemp cached the incoming temp root. Library defaults must stay inside work.
    tempfile.tempdir=None
    record={"status":"incomplete","url":safe_url(args.url),"viewport":{"width":args.width,"height":args.height},
        "scope":"browser-assisted local observation; not Impeccable rendered detectors or OS egress/filesystem isolation",
        "actions_sha256":hashlib.sha256(actions_raw).hexdigest(),
        "downloads":[],"page_errors":[],"errors":[],"actions_completed":[],"screenshots":[],"cleanup":{}}
    asyncio.run(inspect_page(args,work,args.output,record))
    if record["errors"] or not record["cleanup"].get("private_profile_removed"):record["status"]="incomplete"
    atomic(args.output/"report.json",record)
    print(json.dumps({"status":record["status"],"report":str(args.output/"report.json"),"screenshots":len(record["screenshots"])}))
    return 0 if record["status"]=="complete" else 1

if __name__=="__main__":
    try:sys.exit(main())
    except (ValueError,OSError) as exc:
        print(json.dumps({"status":"refused","error":str(exc)[:512]}),file=sys.stderr);sys.exit(1)
