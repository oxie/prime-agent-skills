import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { ChromeVisualBrowser, runVisualCheck } from '../bin/visual-check.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dev/evidence/browser');
fs.mkdirSync(out, { recursive: true });
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'archify-prime-browser-'));
const chrome = process.env.ARCHIFY_CHROME || '/snap/chromium/current/usr/lib/chromium-browser/chrome';
const report = { status: 'running', assertions: [], requests: [], exceptions: [], dialogs: [], cspViolations: [], commands: [], profiles: [], limits: ['No video, clipboard, or full export matrix.', 'CDP page requests observed with HTTP(S) blocking defense; not OS-wide network tracing.', 'DOM-dispatched clicks test handlers; CDP Escape tests keyboard input.', 'One small architecture plus hostile text; not exhaustive topology/viewport coverage.'] };
const browsers = [];
let timer;
function check(name, actual, expected = true) {
  assert.deepEqual(actual, expected, name);
  report.assertions.push(name);
}
function deliver(input, output, name) {
  const args = [path.join(root, 'bin/archify.mjs'), 'deliver', 'architecture', input, output, '--quality', 'standard', '--json'];
  const result = spawnSync(process.execPath, args, { cwd: temporary, encoding: 'utf8', timeout: 30000, maxBuffer: 4 * 1024 * 1024 });
  fs.writeFileSync(path.join(out, `${name}.deliver.stdout.json`), result.stdout || '');
  fs.writeFileSync(path.join(out, `${name}.deliver.stderr.txt`), result.stderr || '');
  report.commands.push({ name, status: result.status, signal: result.signal, error: result.error?.message });
  check(`${name}: deliver exit 0`, result.status, 0);
  check(`${name}: delivered artifact exists`, fs.existsSync(output));
}
async function browser() {
  const instance = new ChromeVisualBrowser(chrome);
  browsers.push(instance);
  report.profiles.push(instance.profileRoot);
  let buffer = '';
  instance.child.stdio[4].on('data', chunk => {
    buffer += chunk;
    let boundary;
    while ((boundary = buffer.indexOf('\0')) >= 0) {
      const raw = buffer.slice(0, boundary); buffer = buffer.slice(boundary + 1);
      if (!raw) continue;
      const event = JSON.parse(raw);
      if (event.method === 'Network.requestWillBeSent') report.requests.push(event.params.request.url);
      if (event.method === 'Runtime.exceptionThrown') report.exceptions.push(event.params.exceptionDetails);
      if (event.method === 'Page.javascriptDialogOpening') {
        report.dialogs.push(event.params);
        instance.cdp.send('Page.handleJavaScriptDialog', { accept: false }, event.sessionId).catch(() => {});
      }
    }
  });
  const sid = await instance.sessionPromise;
  await instance.cdp.send('Network.enable', {}, sid);
  await instance.cdp.send('Network.setBlockedURLs', { urls: ['http://*', 'https://*'] }, sid);
  await instance.cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: `window.__primeCsp=[];document.addEventListener('securitypolicyviolation',e=>window.__primeCsp.push({directive:e.violatedDirective,blocked:e.blockedURI}));` }, sid);
  return instance;
}
async function evaluate(instance, expression) {
  const answer = await instance.cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, await instance.sessionPromise, 15000);
  if (answer.exceptionDetails) throw new Error(JSON.stringify(answer.exceptionDetails));
  return answer.result?.value;
}
async function escapeKey(instance) {
  for (const type of ['keyDown', 'keyUp']) await instance.cdp.send('Input.dispatchKeyEvent', { type, key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 }, await instance.sessionPromise);
}
async function screenshot(instance, name) {
  const capture = await instance.cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }, await instance.sessionPromise);
  fs.writeFileSync(path.join(out, `${name}.png`), Buffer.from(capture.data, 'base64'));
}
async function main() {
  check('nonroot sandbox user', process.getuid() !== 0);
  check('no sandbox optout', process.env.ARCHIFY_CHROME_NO_SANDBOX !== '1');
  const input = path.join(root, 'examples/web-app.architecture.json');
  const canonical = path.join(temporary, 'canonical.html');
  const spec = JSON.parse(fs.readFileSync(input, 'utf8'));
  deliver(input, canonical, 'canonical');
  const visual = await runVisualCheck({ artifactPath: canonical, chromePath: chrome, browserFactory: browser });
  fs.writeFileSync(path.join(out, 'canonical.visual-check.json'), JSON.stringify(visual, null, 2));
  check('canonical visual-check exit 0', visual.exitCode, 0);
  check('visual review remains pending', visual.receipt.visualReview, 'pending');
  for (const entry of fs.readdirSync(temporary)) {
    if (entry.startsWith('canonical.visual-check.') && /\.(png|html)$/.test(entry)) fs.copyFileSync(path.join(temporary, entry), path.join(out, entry));
  }
  const b = await browser();
  await b.inspect({ artifactPath: canonical, width: 1440, height: 900, theme: 'light' });
  const state = await evaluate(b, `(() => { const svg=document.querySelector('.diagram-container svg');return { count:svg.querySelectorAll('[data-node-id]').length, edges:new Set([...svg.querySelectorAll('[data-edge-id]')].map(e=>e.dataset.edgeId)).size, labels:[...svg.querySelectorAll('text[data-node-label]')].map(e=>e.textContent), vb:[svg.viewBox.baseVal.width,svg.viewBox.baseVal.height], runtime:!!(Archify.finder && Archify.focus && Archify.exportMenu), theme:document.documentElement.dataset.theme, scripts:document.scripts.length, handlerAttrs: [...document.querySelectorAll('*')].flatMap(e=>[...e.attributes].filter(a=>/^on/i.test(a.name)).map(a=>a.name)) }; })()`);
  check('canonical exact node count', state.count, spec.components.length);
  check('canonical exact edge ID count', state.edges, spec.connections.length);
  check('canonical exact node labels', state.labels, spec.components.map(n => n.label));
  check('finite positive viewBox', state.vb.every(n => Number.isFinite(n) && n > 0));
  check('finder/focus/export runtime initialized', state.runtime);
  check('requested light theme resolved', state.theme, 'light');
  check('no inline event attributes', state.handlerAttrs, []);
  check('theme button toggles state', await evaluate(b, `document.getElementById('btn-theme').click();document.documentElement.dataset.theme`), 'dark');
  check('node click selects users', await evaluate(b, `document.getElementById('node-users').dispatchEvent(new MouseEvent('click',{bubbles:true}));Archify.focus.active()`), 'users');
  await screenshot(b, 'canonical-focused-dark');
  await escapeKey(b);
  check('Escape clears node focus', await evaluate(b, 'Archify.focus.active()'), null);
  check('finder trigger opens panel', await evaluate(b, `document.getElementById('btn-node-finder').click();Archify.finder.isOpen()`));
  check('finder query returns exact API node', await evaluate(b, `(() => {const i=document.getElementById('node-finder-input');i.value='API Server';i.dispatchEvent(new Event('input',{bubbles:true}));return [...document.querySelectorAll('#node-finder-results .node-finder-result')].map(e=>e.dataset.nodeId)})()`), ['api']);
  check('finder result click focuses API and closes panel', await evaluate(b, `document.querySelector('#node-finder-results .node-finder-result').click();[Archify.focus.active(),Archify.finder.isOpen()]`), ['api', false]);
  await screenshot(b, 'canonical-finder-selection');
  const png = await evaluate(b, `(async()=>{const blob=await Archify.exportMenu.shareCard();const buffer=await blob.arrayBuffer();const bytes=new Uint8Array(buffer);const image=await createImageBitmap(blob);const result={type:blob.type,bytes:blob.size,width:image.width,height:image.height,head:[...bytes.slice(0,8)],base64:await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result.split(',')[1]);r.onerror=reject;r.readAsDataURL(blob);})};image.close();return result;})()`);
  check('share card PNG MIME', png.type, 'image/png');
  check('share card PNG bytes', png.bytes > 1000);
  check('share card 1200x630', [png.width, png.height], [1200, 630]);
  check('PNG byte signature', png.head, [137,80,78,71,13,10,26,10]);
  fs.writeFileSync(path.join(out, 'canonical-share-card.png'), Buffer.from(png.base64, 'base64'));
  report.cspViolations.push(...await evaluate(b, 'window.__primeCsp'));

  const hostile = `</text><script>alert(1)</script>`;
  const title = `</title><script>window.__primeInjected=1</script> & " '`;
  const view = `</script><script>alert(1)</script>`;
  const card = `<img src=x onerror=alert(1)> & " '`;
  const fixture = { schema_version:1, diagram_type:'architecture', meta:{title,viewBox:[1000,460],views:[{id:'hostile-view',label:view,focus:['hostile']}]}, components:[{id:'hostile',type:'backend',label:hostile,pos:[100,150],size:[800,70]}], connections:[],cards:[{dot:'cyan',title:card,items:[card]}] };
  const hostileInput=path.join(temporary,'hostile.json');
  const hostileOutput=path.join(temporary,'hostile.html');
  fs.writeFileSync(hostileInput,JSON.stringify(fixture));
  deliver(hostileInput,hostileOutput,'hostile');
  await b.inspect({artifactPath:hostileOutput,width:1440,height:900,theme:'light'});
  const escaped=await evaluate(b,`({title:document.querySelector('h1').textContent,label:document.querySelector('.diagram-container svg text[data-node-label]').textContent,card:document.querySelector('.card h3').textContent,item:document.querySelector('.card li').textContent,view:JSON.parse(document.getElementById('archify-guided-views-data').textContent)[0].label,scripts:document.scripts.length,injected:window.__primeInjected||null,svgScripts:document.querySelectorAll('svg script').length,images:document.querySelectorAll('img[src="x"]').length,handlers:[...document.querySelectorAll('*')].flatMap(e=>[...e.attributes].filter(a=>/^on/i.test(a.name)).map(a=>a.name))})`);
  check('hostile title exact text',escaped.title,title);
  check('hostile node exact text',escaped.label,hostile);
  check('hostile card title exact text',escaped.card,card);
  check('hostile card item preserves text',escaped.item, '• '+card);
  check('guided JSON closing-script text preserved',escaped.view,view);
  check('hostile input adds no script elements',escaped.scripts,state.scripts);
  check('hostile marker not executed',escaped.injected,null);
  check('no injected SVG scripts',escaped.svgScripts,0);
  check('no injected image',escaped.images,0);
  check('no injected handler attributes',escaped.handlers,[]);
  check('hostile node focus works',await evaluate(b,`document.getElementById('node-hostile').dispatchEvent(new MouseEvent('click',{bubbles:true}));Archify.focus.active()`),'hostile');
  check('hostile finder text remains literal',await evaluate(b,`document.getElementById('btn-node-finder').click();document.querySelector('#node-finder-results strong').textContent`),hostile);
  await screenshot(b,'hostile-literal-finder');
  report.cspViolations.push(...await evaluate(b,'window.__primeCsp'));
  await b.close();

  for (const [name, html] of [['missing-svg','<!doctype html><html><body>empty</body></html>'],['missing-runtime','<!doctype html><html><body><div class="diagram-container"><svg viewBox="0 0 100 100"><text x="1" y="20">label</text></svg></div></body></html>']]) {
    const artifact=path.join(temporary,`${name}.html`);fs.writeFileSync(artifact,html);
    const rejected=await runVisualCheck({artifactPath:artifact,chromePath:chrome,browserFactory:browser});
    fs.writeFileSync(path.join(out,`${name}.json`),JSON.stringify(rejected,null,2));
    check(`${name}: visual-check rejects`,rejected.exitCode,1);
    check(`${name}: specific runtime/diagram failure`,/Missing rendered SVG, labels, or initialized Archify reader runtime/.test(rejected.receipt.error));
  }
  check('zero HTTP(S) page requests',report.requests.filter(url=>/^https?:/i.test(url)),[]);
  check('zero uncaught runtime exceptions',report.exceptions,[]);
  check('zero injected dialogs',report.dialogs,[]);
  check('offline CSP permits viewer and PNG export',report.cspViolations,[]);
}
try {
  const deadline = new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Browser acceptance exceeded 120 seconds')),120000);});
  await Promise.race([main(),deadline]);
  report.status='pass';
} catch(error) {
  report.status='fail';report.error=error.stack || String(error);process.exitCode=1;
} finally {
  clearTimeout(timer);
  for (const b of browsers) {try{await b.close();}catch(error){report.cleanupError=String(error);process.exitCode=1;report.status='fail';}}
  fs.rmSync(temporary,{recursive:true,force:true});
  report.cleanup={temporaryRemoved:!fs.existsSync(temporary),profilesRemoved:report.profiles.every(p=>!fs.existsSync(p)),processesExited:browsers.every(b=>b.child.exitCode!==null||b.child.signalCode!==null)};
  if (!Object.values(report.cleanup).every(Boolean)) {report.status='fail';process.exitCode=1;}
  report.assertionCount=report.assertions.length;
  report.exitCode=process.exitCode || 0;
  const target=path.join(out,'result.json');fs.writeFileSync(`${target}.tmp`,JSON.stringify(report,null,2)+'\n');fs.renameSync(`${target}.tmp`,target);
  console.log(JSON.stringify({status:report.status,assertions:report.assertionCount,exitCode:report.exitCode,error:report.error,cleanup:report.cleanup,result:target},null,2));
}
