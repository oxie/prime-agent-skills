// Manual browser pilot. Requires an already-delivered, static-gate-approved input.
// node dev/editorial-browser-pilot.mjs input.html NEW-evidence-directory
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ChromeVisualBrowser, findChrome } from '../bin/visual-check.mjs';
import { runEditorialBrowser, closeEditorialBrowser } from '../bin/editorial-browser.mjs';
const [inputArg, directoryArg, fixtureFlag] = process.argv.slice(2);
if (!inputArg || !directoryArg || (fixtureFlag !== undefined && fixtureFlag !== '--fixtures') || process.argv.length > 5) throw new Error('Usage: node dev/editorial-browser-pilot.mjs input.html NEW-evidence-directory [--fixtures]');
const input = path.resolve(inputArg);
const directory = path.resolve(directoryArg);
fs.mkdirSync(directory, { mode: 0o700 });
const source = fs.readFileSync(input);
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const before = fs.readdirSync(path.dirname(input)).sort();
const results = [];
async function run(args, expected = 0) {
  const result = await runEditorialBrowser(args);
  results.push(result.receipt);
  assert.equal(result.receipt.cleanup.complete, true, JSON.stringify(result.receipt));
  assert.equal(result.receipt.network.attemptCount, 0);
  assert.equal(result.exitCode, expected, JSON.stringify(result.receipt));
  return result.receipt;
}
try {
  const visual = await run(['visual-check', input]);
  assert.equal(visual.evidenceKind, 'browser-editorial-check');
  assert.deepEqual(visual.viewports.map((item) => item.width), [390, 1440]);
  assert.equal(visual.network.attemptCount, 0);
  assert.deepEqual(fs.readdirSync(path.dirname(input)).sort(), before, 'visual-check must create no sidecars');
  const captured = await run(['visual-check', input, '--capture-dir', path.join(directory, 'viewports')]);
  assert.equal(captured.captureStatus, 'complete');
  assert.equal(captured.captures.length, 2);
  for (const capture of captured.captures) assert.equal(digest(fs.readFileSync(capture.path)), capture.sha256);
  const collisionDirectory = await run(['visual-check', input, '--capture-dir', path.join(directory, 'viewports')], 1);
  assert.match(collisionDirectory.error, /already exists/);
  for (const scale of [0.25, 0.5, 1, 1.5]) {
    const output = path.join(directory, `primary-${scale}.png`);
    const exported = await run(['export', input, output, '--scale', String(scale)]);
    assert.equal(exported.dimensions.width, Math.round(exported.renderedBox.width * scale));
    assert.equal(exported.dimensions.height, Math.round(exported.renderedBox.height * scale));
    assert.equal(digest(fs.readFileSync(output)), exported.outputSha256);
  }
  const svgPath = path.join(directory, 'primary.svg');
  await run(['export', input, svgPath]);
  const svg = fs.readFileSync(svgPath, 'utf8');
  assert.match(svg, /^<svg\b/);
  assert.match(svg, /<title\b/);
  assert.match(svg, /<desc\b/);
  assert.match(svg, /style="/);
  assert.doesNotMatch(svg, /var\(--/);
  assert.doesNotMatch(svg.replaceAll('http://www.w3.org/2000/svg', ''), /(?:https?:|file:)\/\//);
  const kept = fs.readFileSync(svgPath);
  const collision = await run(['export', input, svgPath], 1);
  assert.match(collision.error, /already exists/);
  assert.deepEqual(fs.readFileSync(svgPath), kept);
  assert.deepEqual(fs.readFileSync(input), source, 'source bytes unchanged');
  if (fixtureFlag === '--fixtures') {
    const fixture = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Benign export fidelity fixture</title><style>
body { margin: 0; font-family: sans-serif; } figure { margin: 16px; } svg { display: block; width: 300.5px; height: 180.5px; background: #102030; background-image: linear-gradient(90deg, #102030, #304050); color: #ffffff; } .shape { width: 160px; height: 70px; fill: url(#paint); } text { fill: currentColor; font-size: 16px; }
</style></head><body><h1 id="outside-title">Synthetic export fidelity</h1><figure><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 180" role="img" aria-labelledby="figure-title outside-title" aria-describedby="figure-desc outside-desc"><title id="figure-title">Benign CSS geometry and gradient</title><desc id="figure-desc">A red to blue rectangle on a dark background with white text.</desc><defs><linearGradient id="paint"><stop offset="0" stop-color="#ff0000"></stop><stop offset="1" stop-color="#0000ff"></stop></linearGradient></defs><rect class="shape" x="20" y="20" width="10" height="10"></rect><text x="20" y="130">Synthetic gradient</text></svg><figcaption id="outside-desc">Synthetic rectangle: width 160 and height 70 SVG units.</figcaption></figure></body></html>`;
    const cli = fileURLToPath(new URL('../bin/archify.mjs', import.meta.url));
    function deliverFixture(name, html) {
      const draft = path.join(directory, name + '-source.html');
      const delivered = path.join(directory, name + '.html');
      fs.writeFileSync(draft, html, { flag: 'wx' });
      const receipt = JSON.parse(execFileSync(process.execPath, [cli, 'editorial', 'deliver', draft, delivered, '--json'], { encoding: 'utf8', timeout: 10000 }));
      assert.equal(receipt.ok, true);
      fs.writeFileSync(path.join(directory, name + '-delivery.json'), JSON.stringify(receipt, null, 2), { flag: 'wx' });
      return delivered;
    }
    const delivered = deliverFixture('fidelity', fixture);
    await run(['visual-check', delivered, '--capture-dir', path.join(directory, 'fidelity-viewports')]);
    const svgOutput = path.join(directory, 'fidelity.svg');
    await run(['export', delivered, svgOutput]);
    const serialized = fs.readFileSync(svgOutput, 'utf8');
    assert.match(serialized, /aria-labelledby="figure-title"/);
    assert.match(serialized, /aria-describedby="figure-desc"/);
    assert.doesNotMatch(serialized, /outside-title|outside-desc/);
    assert.match(serialized, /width: 160px; height: 70px/);
    assert.match(serialized, /rgb\(16, 32, 48\)/);
    assert.match(serialized, /url\(&quot;#paint&quot;\)/);
    assert.match(serialized, /<linearGradient id="paint"/);
    // Only reopen the just-exported, reviewed SVG. Never navigate a rejected HTML fixture.
    const roundtrip = { evidenceKind: 'trusted-svg-roundtrip', status: 'fail', input: svgOutput, network: { httpBlockingEnabled: false, attemptCount: 0, attempts: [] } };
    const standalone = new ChromeVisualBrowser(findChrome());
    roundtrip.profilePath = standalone.profileRoot;
    let tap;
    try {
      const sid = await standalone.sessionPromise;
      let pending = '';
      tap = (chunk) => {
        pending += chunk;
        let end;
        while ((end = pending.indexOf('\0')) !== -1) {
          const message = pending.slice(0, end); pending = pending.slice(end + 1);
          let event; try { event = JSON.parse(message); } catch { continue; }
          if (event.sessionId === sid && event.method === 'Network.requestWillBeSent' && /^https?:/i.test(event.params?.request?.url || '')) {
            roundtrip.network.attemptCount++;
            if (roundtrip.network.attempts.length < 32) roundtrip.network.attempts.push(event.params.request.url);
          }
        }
        assert.ok(pending.length < 32 * 1024 * 1024);
      };
      standalone.cdp.readPipe.on('data', tap);
      await standalone.cdp.send('Emulation.setScriptExecutionDisabled', { value: true }, sid);
      await standalone.cdp.send('Network.enable', {}, sid);
      await standalone.cdp.send('Network.setBlockedURLs', { urls: ['http://*', 'https://*', 'ftp://*', 'ws://*', 'wss://*'] }, sid);
      roundtrip.network.httpBlockingEnabled = true;
      await standalone.cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false }, sid);
      const loaded = standalone.cdp.waitFor('Page.loadEventFired', sid, 15000); loaded.catch(() => {});
      const navigation = await standalone.cdp.send('Page.navigate', { url: pathToFileURL(svgOutput).href }, sid);
      assert.equal(navigation.errorText, undefined); await loaded;
      const evaluated = await standalone.cdp.send('Runtime.evaluate', { returnByValue: true, expression: `(function () {
        var svg = document.documentElement, rect = svg.querySelector('rect'), style = getComputedStyle(svg), shape = getComputedStyle(rect), box = svg.getBoundingClientRect();
        return { tag: svg.localName, title: svg.querySelector('title').textContent, description: svg.querySelector('desc').textContent,
          backgroundColor: style.backgroundColor, backgroundImage: style.backgroundImage,
          shapeWidth: shape.width, shapeHeight: shape.height, fill: shape.fill,
          labelledby: svg.getAttribute('aria-labelledby'), describedby: svg.getAttribute('aria-describedby'),
          box: { x: box.x, y: box.y, width: box.width, height: box.height } };
      })()` }, sid);
      assert.equal(evaluated.exceptionDetails, undefined);
      const metrics = evaluated.result.value; roundtrip.metrics = metrics;
      assert.equal(metrics.tag, 'svg'); assert.equal(metrics.shapeWidth, '160px'); assert.equal(metrics.shapeHeight, '70px');
      assert.equal(metrics.backgroundColor, 'rgb(16, 32, 48)'); assert.match(metrics.backgroundImage, /^linear-gradient\(/);
      assert.match(metrics.fill, /#paint/); assert.equal(metrics.labelledby, 'figure-title'); assert.equal(metrics.describedby, 'figure-desc');
      assert.equal(metrics.box.width, 300.5); assert.equal(metrics.box.height, 180.5);
      const image = await standalone.cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: true,
        clip: { x: metrics.box.x, y: metrics.box.y, width: Math.ceil(metrics.box.width), height: Math.ceil(metrics.box.height), scale: 1 } }, sid, 20000);
      const capturePath = path.join(directory, 'fidelity-roundtrip.png');
      const bytes = Buffer.from(image.data, 'base64'); fs.writeFileSync(capturePath, bytes, { flag: 'wx' });
      roundtrip.capture = { path: capturePath, sha256: digest(bytes), bytes: bytes.length };
      assert.equal(roundtrip.network.attemptCount, 0);
      roundtrip.status = 'pass';
    } finally {
      if (tap) standalone.cdp.readPipe.off('data', tap);
      await closeEditorialBrowser(standalone);
      roundtrip.cleanup = { processExited: standalone.child.exitCode !== null || standalone.child.signalCode !== null, profileRemoved: !fs.existsSync(standalone.profileRoot), snapshotRemoved: true };
      roundtrip.cleanup.complete = roundtrip.cleanup.processExited && roundtrip.cleanup.profileRemoved;
      if (!roundtrip.cleanup.complete) roundtrip.status = 'fail';
      results.push(roundtrip);
      assert.equal(roundtrip.cleanup.complete, true);
    }
    for (const scale of [0.25, 0.5, 1, 1.5]) {
      const receipt = await run(['export', delivered, path.join(directory, `fidelity-${scale}.png`), '--scale', String(scale)]);
      assert.equal(receipt.dimensions.width, Math.round(300.5 * scale));
      assert.equal(receipt.dimensions.height, Math.round(180.5 * scale));
    }
    const transformed = deliverFixture('transformed', fixture.replace('svg { display:', 'svg { transform: scale(0.9); transform-origin: 0 0; display:'));
    const refusedOutput = path.join(directory, 'transformed.svg');
    const refused = await run(['export', transformed, refusedOutput], 1);
    assert.match(refused.error, /transformed root SVG/);
    assert.equal(fs.existsSync(refusedOutput), false);
  }
  console.log(JSON.stringify({ ok: true, cases: results.length, directory, results }, null, 2));
} finally {
  fs.writeFileSync(path.join(directory, 'receipts.json'), JSON.stringify(results, null, 2), { flag: 'wx' });
}
