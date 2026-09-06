#!/usr/bin/env node
// Hallmark/Variate pilot. Node 22 builtins only; no installed driver.
// node dev/pilot.mjs --variate ../variate --artifacts /absolute/evidence/directory
// Optional: CHROMIUM_BIN=/path/to/chromium. The browser sandbox stays enabled.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
const here=path.dirname(fileURLToPath(import.meta.url));
const vArg=process.argv.indexOf("--variate");
const variate=path.resolve(vArg<0 ? path.join(here,"../../variate") : process.argv[vArg+1]);
const {startSidecar}=await import(pathToFileURL(path.join(variate,"src/sidecar.mjs")));
const execute=promisify(execFile);
const project=fs.mkdtempSync(path.join(os.tmpdir(),"hallmark-pilot-project-"));
async function cli(...args){const r=await execute(process.execPath,[path.join(variate,"variate.mjs"),...args,"--root",project],{timeout:10000});return r.stdout;}
const pageEvents=[];
let documentLoads=0;


const arg = process.argv.indexOf("--artifacts");
const artifacts = path.resolve(arg < 0 ? fs.mkdtempSync(path.join(os.tmpdir(), "hallmark-pilot-evidence-")) : process.argv[arg + 1]);
fs.mkdirSync(artifacts, { recursive: true });
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "hallmark-pilot-browser-"));
const profile = path.join(scratch, "browser-profile");
fs.mkdirSync(profile);
const evidence = { browser: process.env.CHROMIUM_BIN || "chromium", node: process.version, startedAt: new Date().toISOString(), checks: [], screenshots: [] };
const check = (name, details = {}) => { evidence.checks.push({ name, ...details }); console.log(`PASS ${name}`); };
let browser, cdp, sidecar, browserLog = "", browserExit = null;
const activeSockets = new Set();
let phase = "browser startup";
const deadline = setTimeout(() => { console.error("FAIL overall 90-second deadline"); process.exitCode = 1; cleanup().finally(() => process.exit(1)); }, 90_000);

async function until(label, fn, timeout = 12_000) {
  const end = Date.now() + timeout;
  let last;
  while (Date.now() < end) {
    try { const value = await fn(); if (value) return value; } catch (error) { last = error; }
    if (browserExit !== null) throw new Error(`browser exited ${JSON.stringify(browserExit)}: ${browserLog.slice(-2000)}`);
    await delay(80);
  }
  throw new Error(`timed out: ${label}${last ? ` (${last.message})` : ""}`);
}

async function connect(url) {
  const socket = new WebSocket(url);
  await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
  let seq = 0;
  const pending = new Map();
  socket.addEventListener("message", ({ data }) => {
    const msg = JSON.parse(data);
    if (!msg.id) { if (msg.method === "Runtime.exceptionThrown") pageEvents.push(msg); if(msg.method === "Page.loadEventFired") documentLoads++; return; }
    const p = pending.get(msg.id);
    if (!p) return;
    pending.delete(msg.id); clearTimeout(p.timer);
    msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result);
  });
  socket.addEventListener("close", () => {
    for (const p of pending.values()) { clearTimeout(p.timer); p.reject(new Error("CDP socket closed")); }
    pending.clear();
  });
  return {
    close: () => socket.close(),
    send: (method, params = {}) => new Promise((resolve, reject) => {
      const id = ++seq;
      const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 5000);
      pending.set(id, { resolve, reject, timer });
      socket.send(JSON.stringify({ id, method, params }));
    }),
  };
}

async function evaluate(expression) {
  const out = await cdp.send("Runtime.evaluate", { expression, returnByValue: true });
  if (out.exceptionDetails) throw new Error(out.exceptionDetails.text);
  return out.result.value;
}
const shadow = 'document.querySelector("variate-dock")?.shadowRoot';
async function click(selector) {
  // CDP mouse input exercises hit testing, unlike element.click(). Re-query on
  // every wait: switching can replace the complete document and shadow root.
  const point = await until(`usable button ${selector}`, () => evaluate(`(() => {
    const root = ${shadow}; const e = root?.querySelector(${JSON.stringify(selector)});
    if (!e || e.disabled) return false;
    const r = e.getBoundingClientRect(); const x = r.x+r.width/2, y = r.y+r.height/2;
    if (r.width < 16 || r.height < 16 || x < 0 || x >= innerWidth || y < 0 || y >= innerHeight) return false;
    const hit = root.elementFromPoint(x,y);
    return hit && (hit === e || e.contains(hit)) ? {x,y} : false;
  })()`));
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", ...point });
  await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", button: "left", clickCount: 1, ...point });
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", button: "left", clickCount: 1, ...point });
}
async function viewport(width, height) {
  await cdp.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
}
async function screenshot(name) {
  const result = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  const file = path.join(artifacts, name);
  fs.writeFileSync(file, Buffer.from(result.data, "base64"));
  evidence.screenshots.push(file);
}
async function displayed(n) {
  return until(`page and card display position ${n}`, async()=>{
    const data=await evaluate(`({heading:document.querySelector("h1")?.textContent,query:location.search,ready:document.readyState,card:!!${shadow}?.querySelector('[role="toolbar"]'),pos:${shadow}?.querySelector('[aria-current="true"]')?.textContent})`);
    return data?.heading?.trim()==="Repair what you love." && data.ready==="complete" && (n===1 || data.query===`?variant=${n}`) && data.card && sidecar.state().sets[0]?.at===n ? data : false;
  });
}
function ratio(a,b){
  const lum=c=>{const rgb=c.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
  const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
async function closeSidecar() {
  if (!sidecar) return;
  await sidecar.close();
  for (const socket of activeSockets) socket.destroy();
  activeSockets.clear();
  sidecar = null;
}
async function cleanup() {
  cdp?.close(); cdp = null;
  await closeSidecar();
  if (browser && browserExit === null) {
    // Only this test's detached process group. Never name-match other browsers.
    try { process.kill(-browser.pid, "SIGTERM"); } catch (e) { if (e.code !== "ESRCH") throw e; }
    await Promise.race([new Promise(resolve => browser.once("exit", resolve)), delay(1000)]);
    if (browserExit === null) { try { process.kill(-browser.pid, "SIGKILL"); } catch (e) { if (e.code !== "ESRCH") throw e; } }
  }
  fs.writeFileSync(path.join(artifacts, "chromium.log"), browserLog);
  fs.rmSync(scratch, { recursive: true, force: true });
  fs.rmSync(project, {recursive:true,force:true});
}

try {
  browser = spawn(evidence.browser, ["--headless", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--remote-debugging-address=127.0.0.1", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"], { detached: true, stdio: ["ignore", "pipe", "pipe"] });
  browser.stdout.on("data", b => { browserLog += b; });
  browser.stderr.on("data", b => { browserLog += b; });
  browser.on("exit", (code, signal) => { browserExit = { code, signal }; });
  browser.on("error", error => { browserExit = { error: error.message }; });
  const debugPort = await until("DevTools port", () => {
    const file = path.join(profile, "DevToolsActivePort");
    return fs.existsSync(file) && Number(fs.readFileSync(file, "utf8").split("\n")[0]);
  });
  const targets = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json();
  const target = targets.find(t => t.type === "page");
  assert.ok(target?.webSocketDebuggerUrl, "browser page CDP endpoint");
  cdp = await connect(target.webSocketDebuggerUrl);
  await cdp.send("Page.enable"); await cdp.send("Runtime.enable");
  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  evidence.browserVersion = await cdp.send("Browser.getVersion");
  check("real Chromium CDP connected");
  phase = "browser regressions";

  const fixture=path.join(here,"fixtures/existing-system");
  for(const file of ["index.html","tokens.css"])fs.copyFileSync(path.join(fixture,file),path.join(project,file));
  const original=fs.readFileSync(path.join(project,"index.html"));
  const tokens=fs.readFileSync(path.join(project,"tokens.css"));
  await cli("add","index.html","--n","3");
  const set="index",dir=path.join(project,".variate/index"),targetFile=path.join(project,"index.html");
  for(const n of [2,3])fs.copyFileSync(path.join(fixture,`${n}.html`),path.join(dir,`${n}.html`));
  fs.writeFileSync(path.join(dir,"plan.json"),JSON.stringify({question:"Which structure helps a visitor decide?",positions:[{name:"existing"},{name:"information-first"},{name:"action-led"}]}));
  assert.deepEqual(fs.readFileSync(targetFile),original);assert.deepEqual(fs.readFileSync(path.join(dir,"1.html")),original);
  assert.deepEqual(fs.readFileSync(path.join(project,"tokens.css")),tokens);
  check("drafts leave live file baseline and shared tokens unchanged");
  sidecar=await startSidecar({root:project,port:0,serve:true});
  await viewport(1280,900);
  await cdp.send("Page.navigate",{url:`http://127.0.0.1:${sidecar.port}/`});await displayed(1);
  const texts=["Repair Circle","Find a repair session near your neighbourhood","Repair what you love.","Bring one broken household item. Work alongside a volunteer to explore a repair.","Booking information","Contact your local organiser for dates and access needs. This prototype does not submit bookings."];
  const designFingerprints=[];
  for(const n of [2,3]){
    await click('[aria-label="next"]');
    // Explicit reload gives deterministic rendering for CSS-only full-file changes.
    // Variate's automatic reload fallback is covered by its own browser regression.
    await cdp.send("Page.navigate",{url:`http://127.0.0.1:${sidecar.port}/?variant=${n}`});await displayed(n);
    assert.deepEqual(fs.readFileSync(targetFile),fs.readFileSync(path.join(dir,`${n}.html`)));
    check(`real card arrow switches to Hallmark draft ${n}`);
    for(const width of [1280,768,414,375,320]){
      await viewport(width,900);
      const layout=await until("laid out at width",()=>evaluate(`(()=>{
        if(innerWidth!==${width})return false;const root=document.documentElement,body=document.body;
        const main=document.querySelector('main'),h=document.querySelector('h1'),nav=document.querySelector('nav');
        return {width:innerWidth,scroll:Math.max(root.scrollWidth,body.scrollWidth),rootOverflow:getComputedStyle(root).overflowX,bodyOverflow:getComputedStyle(body).overflowX,
        text:body.innerText,font:getComputedStyle(body).fontFamily,brand:getComputedStyle(root).getPropertyValue('--brand').trim(),
        composition:{intro:main.querySelector('.introduction').getBoundingClientRect().toJSON(),action:main.querySelector('a[href="#booking"]').getBoundingClientRect().toJSON(),booking:main.querySelector('#booking').getBoundingClientRect().toJSON(),information:!!main.querySelector('.information-grid'),actionGrid:!!main.querySelector('.action-grid')},
        nav:[...nav.querySelectorAll('a')].map(a=>[a.textContent.trim(),a.getAttribute('href')]),h:h.getBoundingClientRect().toJSON(),main:main.getBoundingClientRect().toJSON(),
        ink:getComputedStyle(body).color,paper:getComputedStyle(body).backgroundColor,
        action:(()=>{const a=main.querySelector('a[href="#booking"]'),s=getComputedStyle(a);let parent=a,bg='rgba(0, 0, 0, 0)';while(parent&&bg==='rgba(0, 0, 0, 0)'){bg=getComputedStyle(parent).backgroundColor;parent=parent.parentElement;}return {ink:s.color,paper:bg};})()};})()`));
      assert.ok(layout.scroll<=width+1,`draft ${n} overflow at ${width}: ${layout.scroll}`);
      assert.ok(!["clip","hidden"].includes(layout.rootOverflow));assert.ok(!["clip","hidden"].includes(layout.bodyOverflow));
      for(const text of texts)assert.ok(layout.text.replace(/\s+/g," ").includes(text),`missing supplied text: ${text}`);
      assert.deepEqual(layout.nav,[["Repair Circle","#services"],[texts[1],"#booking"]]);
      assert.match(layout.font,/Georgia/);assert.equal(layout.brand,"#6546b2");
      assert.ok(ratio(layout.ink,layout.paper)>=4.5);assert.ok(ratio(layout.action.ink,layout.action.paper)>=4.5);
      check(`draft ${n}: ${width}px reflow, intact copy/nav, existing font-family configuration/palette and measured body/action contrast`,{bodyContrast:ratio(layout.ink,layout.paper),actionContrast:ratio(layout.action.ink,layout.action.paper)});
      if(width===1280 || width===320)await screenshot(`draft-${n}-${width}.png`);
      if(width===1280)designFingerprints.push({n,...layout.composition});
    }
    await viewport(375,900);
    const enlarged=await evaluate(`(()=>{document.documentElement.style.fontSize='200%';return {width:innerWidth,scroll:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)};})()`);
    assert.ok(enlarged.scroll<=enlarged.width+1,`draft ${n}: 200% root text scaling overflows ${JSON.stringify(enlarged)}`);
    await evaluate("document.documentElement.style.removeProperty('font-size')");
    check(`draft ${n}: 200% root text scaling at 375px without horizontal overflow`);
    await cdp.send("Runtime.evaluate",{expression:"document.activeElement?.blur(); window.scrollTo(0,0);"});
    const priorLoads=documentLoads;await cdp.send("Page.reload",{ignoreCache:true});
    await until("fresh keyboard test document",()=>documentLoads>priorLoads);await displayed(n);
    await cdp.send("Input.dispatchKeyEvent",{type:"keyDown",key:"Tab",code:"Tab",windowsVirtualKeyCode:9});
    await cdp.send("Input.dispatchKeyEvent",{type:"keyUp",key:"Tab",code:"Tab",windowsVirtualKeyCode:9});
    const focus=await evaluate(`(()=>{const a=document.activeElement,s=getComputedStyle(a);return {tag:a.tagName,href:a.getAttribute('href'),visible:a.matches(':focus-visible'),outline:s.outlineStyle,width:parseFloat(s.outlineWidth),colour:s.outlineColor,paper:getComputedStyle(document.body).backgroundColor};})()`);
    assert.equal(focus.tag,"A");assert.equal(focus.href,"#services");assert.equal(focus.visible,true);assert.notEqual(focus.outline,"none");assert.ok(focus.width>=2);assert.ok(ratio(focus.colour,focus.paper)>=3);
    await cdp.send("Input.dispatchKeyEvent",{type:"keyDown",key:"Enter",code:"Enter",windowsVirtualKeyCode:13});
    await cdp.send("Input.dispatchKeyEvent",{type:"keyUp",key:"Enter",code:"Enter",windowsVirtualKeyCode:13});
    await until("keyboard activation",()=>evaluate('location.hash==="#services"'));
    check(`draft ${n}: real Tab focus and Enter activation; measured focus contrast`,{contrast:ratio(focus.colour,focus.paper)});
    const motion=await evaluate(`({reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,active:document.getAnimations().filter(a=>!a.effect?.target?.closest?.('variate-dock')).length})`);
    assert.equal(motion.reduced,true);assert.equal(motion.active,0);
    check(`draft ${n}: reduced-motion preference exercised with no page animation`);
  }
  const [information,action]=designFingerprints;
  assert.equal(information.information,true);assert.equal(action.actionGrid,true);
  assert.ok(information.booking.x>=information.intro.right,"information-first booking sits beside explanation");
  assert.ok(Math.abs(information.booking.y-information.intro.y)<40,"information-first context shares its explanation row");
  assert.ok(action.booking.y>Math.max(action.intro.bottom,action.action.bottom)+16,"action-led booking is below the hero/action row");
  assert.ok(action.booking.width>action.intro.width+action.action.width,"action-led booking spans the full support band");
  assert.equal(pageEvents.length,0,JSON.stringify(pageEvents));
  check("distinct rendered compositions and no page JavaScript exceptions");
  await viewport(1280,900);await evaluate('window.scrollTo(0,0)');
  await click('[aria-label="keep this one"]');
  const pending=await until("keep persisted",()=>{const files=fs.readdirSync(path.join(project,".variate/requests")).filter(f=>f.endsWith('.json'));return files.length===1&&JSON.parse(fs.readFileSync(path.join(project,".variate/requests",files[0])));});
  assert.equal(pending.type,"done");assert.equal(pending.params.set,"index");assert.equal(pending.params.n,3);
  const selected=fs.readFileSync(path.join(dir,"3.html"),"utf8");const hash=createHash("sha256").update(selected).digest("hex");
  assert.equal(pending.params.liveHash,hash);assert.equal(pending.params.selectedHash,hash);
  await cli("drain","--consumer","hallmark-pilot");
  await cli("end","--request",pending.id,"--consumer","hallmark-pilot");
  assert.equal(fs.existsSync(path.join(project,".variate")),false);
  assert.equal(fs.readFileSync(targetFile,"utf8"),selected.replace(/\sdata-variate-section="index"/g,""));
  assert.deepEqual(fs.readFileSync(path.join(project,"tokens.css")),tokens);
  assert.equal(fs.existsSync(path.join(project,".hallmark")),false);
  assert.deepEqual(fs.readdirSync(project).sort(),["index.html","tokens.css"]);
  check("keep uses trusted snapshot, claim and full end; shared tokens intact and no extra project files");
  evidence.status = "passed";
} catch (error) {
  evidence.status = "failed"; evidence.phase = phase; evidence.error = error.stack;
  console.error(`FAIL ${phase}: ${error.message}`); process.exitCode = 1;
} finally {
  clearTimeout(deadline);
  await cleanup();
  evidence.browserExit = browserExit;
  evidence.finishedAt = new Date().toISOString();
  evidence.fixturesRemoved = !fs.existsSync(scratch) && !fs.existsSync(project);
  const out = path.join(artifacts, "pilot-result.json");
  fs.writeFileSync(`${out}.tmp`, JSON.stringify(evidence, null, 2) + "\n");
  fs.renameSync(`${out}.tmp`, out);
  console.log(`Evidence: ${out}`);
}
