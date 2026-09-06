#!/usr/bin/env node
// Isolated real-browser regression. Node 22 builtins only; no installed driver.
// node dev/test-browser-prime.mjs --artifacts /absolute/evidence/directory
// Optional: CHROMIUM_BIN=/path/to/chromium. The browser sandbox stays enabled.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { startSidecar } from "../src/sidecar.mjs";

const arg = process.argv.indexOf("--artifacts");
const artifacts = path.resolve(arg < 0 ? fs.mkdtempSync(path.join(os.tmpdir(), "variate-browser-evidence-")) : process.argv[arg + 1]);
fs.mkdirSync(artifacts, { recursive: true });
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "variate-browser-test-"));
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
    if (!msg.id) return;
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
function page(n, set) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Browser regression position ${n}</title><style>body{margin:0;background:#f5f3ee;color:#181818;font:20px system-ui}main{margin:8vw;max-width:680px}h1{font-size:clamp(28px,6vw,56px)}p{line-height:1.5}</style></head><body><main data-variate-section="${set}"><h1 id="actual-design">Actual design ${n}</h1><p>This is position ${n} in a disposable static project.</p></main><script>window.fixtureDocument = crypto.randomUUID();</script></body></html>`;
}
async function displayed(n, previousDocument = null) {
  return until(`real page displays position ${n}`, async () => {
    const state = await evaluate(`({text:document.querySelector("#actual-design")?.textContent, document:window.fixtureDocument, card:!!${shadow}?.querySelector('[role="toolbar"]')})`);
    return state?.text === `Actual design ${n}` && state.card && (!previousDocument || state.document !== previousDocument) ? state : false;
  });
}
async function closeSidecar() {
  if (!sidecar) return;
  sidecar.close();
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

  for (let count = 1; count <= 4; count++) {
    const project = path.join(scratch, `project-${count}`), set = `test-${count}`;
    const dir = path.join(project, ".variate", set), targetFile = path.join(project, "index.html");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "target"), "index.html\n");
    fs.writeFileSync(path.join(dir, "plan.json"), JSON.stringify({ question: "Which position?", positions: Array.from({length:count}, (_, i) => ({ name: `direction ${i+1}` })) }));
    for (let n = 1; n <= count; n++) fs.writeFileSync(path.join(dir, `${n}.html`), page(n, set));
    fs.copyFileSync(path.join(dir, "1.html"), targetFile);
    sidecar = await startSidecar({ root: project, port: 0, serve: true });
    sidecar.server.on("connection", socket => { activeSockets.add(socket); socket.once("close", () => activeSockets.delete(socket)); });
    await viewport(1280, 800);
    await cdp.send("Page.navigate", { url: `http://127.0.0.1:${sidecar.port}/` });
    let documentState = await displayed(1);
    await until("card fully entered", () => evaluate(`!!${shadow}?.querySelector('.dock:not([data-enter])')`));
    check(`card mounted with ${count} variant(s)`);
    const order = count > 1 ? [...Array.from({length:count-1}, (_,i) => i+2), count-1, count] : [];
    let current = 1;
    for (const n of order) {
      await click(`[aria-label="${n > current ? "next" : "previous"}"]`);
      documentState = await displayed(n, documentState.document);
      assert.equal(fs.readFileSync(targetFile, "utf8"), fs.readFileSync(path.join(dir, `${n}.html`), "utf8"), "real target bytes must match selected variant");
      assert.equal(sidecar.state().sets[0].at, n);
      current = n;
      check(`${count} variants: arrow to ${n} updates target and fresh rendered document`);
    }
    if (count === 4) {
      await until("desktop card entered", () => evaluate(`!!${shadow}?.querySelector('.dock:not([data-enter])')`));
      await screenshot("desktop-1280.png");
      await viewport(390, 844);
      const bounds = await until("390px card fits viewport", () => evaluate(`(() => {
        const e = ${shadow}?.querySelector('.dock'); if(!e)return false; const r=e.getBoundingClientRect();
        return r.x>=0 && r.right<=innerWidth && r.y>=0 && r.bottom<=innerHeight ? {x:r.x,y:r.y,width:r.width,height:r.height,viewport:innerWidth} : false;
      })()`));
      await click('[aria-label="previous"]');
      documentState = await displayed(3, documentState.document); current = 3;
      assert.equal(fs.readFileSync(targetFile, "utf8"), page(3, set));
      await until("mobile card entered", () => evaluate(`!!${shadow}?.querySelector('.dock:not([data-enter])')`));
      await screenshot("mobile-390.png");
      check("390px card fits and real hit-tested arrow switches page", bounds);
    }
    await click('[aria-label="keep this one"]');
    const request = await until("keep persisted on disk", () => {
      const requests = path.join(project, ".variate", "requests");
      const files = fs.readdirSync(requests).filter(f => f.endsWith(".json"));
      return files.length && { files, body: JSON.parse(fs.readFileSync(path.join(requests, files[0]), "utf8")) };
    });
    assert.equal(request.files.length, 1, "exactly one queued keep");
    assert.equal(request.body.type, "done");
    const selectedHash = createHash("sha256").update(page(current, set)).digest("hex");
    assert.deepEqual(request.body.params, { set, n: current, label: `direction ${current}`, liveHash: selectedHash, selectedHash });
    assert.equal(fs.readFileSync(targetFile, "utf8"), page(current, set), "keep must not change selected file");
    check(`${count} variants: keep queues exact set and position`, { request: request.body });
    await cdp.send("Page.navigate", { url: "about:blank" });
    await closeSidecar();
    fs.rmSync(project, { recursive: true, force: true });
  }
  evidence.status = "passed";
} catch (error) {
  evidence.status = "failed"; evidence.phase = phase; evidence.error = error.stack;
  console.error(`FAIL ${phase}: ${error.message}`); process.exitCode = 1;
} finally {
  clearTimeout(deadline);
  await cleanup();
  evidence.browserExit = browserExit;
  evidence.finishedAt = new Date().toISOString();
  evidence.fixturesRemoved = !fs.existsSync(scratch);
  const out = path.join(artifacts, "browser-result.json");
  fs.writeFileSync(`${out}.tmp`, JSON.stringify(evidence, null, 2) + "\n");
  fs.renameSync(`${out}.tmp`, out);
  console.log(`Evidence: ${out}`);
}
