import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ChromeVisualBrowser, findChrome } from './visual-check.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MAX_INPUT = 4 * 1024 * 1024;
const MAX_PIXELS = 16_000_000;
const TIMEOUT = 15000;
export const EDITORIAL_VIEWPORTS = Object.freeze([
  Object.freeze({ width: 390, height: 844 }),
  Object.freeze({ width: 1440, height: 1000 }),
]);
const LIMITATIONS = 'Conservative static lint, not a sanitizer. Browser checks measure structure and horizontal containment, not aesthetics or accessibility certification. Local horizontal diagram scrolling is reported separately from page containment; equivalent-text presence is not semantic-equivalence proof. System fonts are host-dependent; glyph fidelity is not guaranteed.';
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');

export function parseEditorialBrowserArgs(args) {
  const [command, ...rest] = args;
  if (!['visual-check', 'export'].includes(command)) throw new Error('Expected editorial visual-check or export.');
  const positional = [];
  let json = false;
  let scale = 1;
  let hasScale = false;
  let captureDirectory = null;
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (arg === '--json' && !json) json = true;
    else if (arg === '--capture-dir' && command === 'visual-check' && captureDirectory === null) {
      const value = rest[++i];
      if (!value || value.startsWith('-')) throw new Error('--capture-dir requires a NEW directory path.');
      captureDirectory = path.resolve(value);
    }
    else if (arg === '--scale' && command === 'export' && !hasScale) {
      const value = rest[++i];
      if (!value || !/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(value)) throw new Error('--scale must be a finite number from 0.25 through 4.');
      scale = Number(value);
      hasScale = true;
      if (!Number.isFinite(scale) || scale < 0.25 || scale > 4) throw new Error('--scale must be a finite number from 0.25 through 4.');
    } else if (arg.startsWith('-')) throw new Error(`Unsupported or duplicate option: ${arg}`);
    else positional.push(arg);
  }
  if (positional.length !== (command === 'export' ? 2 : 1)) throw new Error('Expected input.html and, for export, a NEW.png or NEW.svg output path.');
  const input = path.resolve(positional[0]);
  if (!/\.html?$/i.test(input)) throw new Error('Input must be an HTML file.');
  const output = command === 'export' ? path.resolve(positional[1]) : null;
  if (output && !/\.(png|svg)$/i.test(output)) throw new Error('Output extension must be .png or .svg.');
  if (output && /\.svg$/i.test(output) && hasScale) throw new Error('--scale applies only to PNG exports.');
  return { command, input, output, scale, json, captureDirectory };
}

function readSnapshot(input) {
  const fd = fs.openSync(input, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK);
  try {
    const stat = fs.fstatSync(fd);
    if (!stat.isFile() || stat.size < 1 || stat.size > MAX_INPUT) throw new Error(`Input must be a regular file of 1..${MAX_INPUT} bytes.`);
    const bytes = Buffer.alloc(stat.size + 1);
    let used = 0;
    while (used < bytes.length) {
      const count = fs.readSync(fd, bytes, used, bytes.length - used, null);
      if (!count) break;
      used += count;
    }
    if (used !== stat.size) throw new Error('Input size changed while reading.');
    return bytes.subarray(0, used);
  } finally { fs.closeSync(fd); }
}

export function assertNewOutput(output) {
  if (!output) return;
  try {
    fs.lstatSync(output);
    throw new Error('Output already exists; exports never overwrite files or symlinks.');
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  let directory = path.dirname(output);
  for (;;) {
    const stat = fs.lstatSync(directory);
    if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error('Output parent must be an existing directory without symlink ancestors.');
    const parent = path.dirname(directory);
    if (parent === directory) break;
    directory = parent;
  }
}

export function publishExclusive(output, bytes) {
  assertNewOutput(output);
  const temporary = path.join(path.dirname(output), `.archify-export-${randomUUID()}.tmp`);
  try {
    fs.writeFileSync(temporary, bytes, { flag: 'wx', mode: 0o600 });
    // A hard link atomically publishes the complete file and fails if output appeared.
    fs.linkSync(temporary, output);
  } finally { fs.rmSync(temporary, { force: true }); }
}

function staticGate(snapshot) {
  return new Promise((resolve, reject) => {
    execFile(process.env.ARCHIFY_PYTHON || 'python3', ['-I', '-B', path.join(ROOT, 'editorial', 'check.py'), snapshot, '--json'], {
      timeout: TIMEOUT, killSignal: 'SIGKILL', maxBuffer: 1024 * 1024,
      windowsHide: true, encoding: 'utf8',
    }, (error, stdout, stderr) => {
      let receipt;
      try { receipt = JSON.parse(stdout); } catch { reject(new Error(`Static editorial gate did not return JSON${error ? `: ${error.message}` : ''}.`)); return; }
      if (error || receipt.ok !== true) {
        const failure = new Error(`Static editorial gate rejected input${stderr.trim() ? `: ${stderr.trim().slice(0, 500)}` : ''}.`);
        failure.gate = receipt;
        reject(failure);
        return;
      }
      resolve(receipt);
    });
  });
}

// Bounded event tap: PipeCdp remains the command/response owner.
function networkEvidence(browser, sessionId) {
  let pending = '';
  let total = 0;
  const attempts = [];
  const listener = (chunk) => {
    pending += chunk;
    let index;
    while ((index = pending.indexOf('\0')) !== -1) {
      const raw = pending.slice(0, index);
      pending = pending.slice(index + 1);
      let event;
      try { event = JSON.parse(raw); } catch { continue; }
      if (event.sessionId !== sessionId || event.method !== 'Network.requestWillBeSent') continue;
      const url = event.params?.request?.url || '';
      if (/^https?:/i.test(url)) {
        total++;
        if (attempts.length < 32) attempts.push({ url: url.slice(0, 1000), method: event.params.request.method });
      }
    }
    if (pending.length > 32 * 1024 * 1024) pending = '';
  };
  browser.cdp.readPipe.on('data', listener);
  return { attempts, count: () => total, stop: () => browser.cdp.readPipe.off('data', listener) };
}

const PRIMARY = `function primary() {
  var candidates = Array.from(document.querySelectorAll('svg')).filter(function (svg) {
    return !svg.parentElement.closest('svg') && svg.getAttribute('aria-hidden') !== 'true' && svg.getAttribute('role') !== 'presentation';
  });
  if (candidates.length !== 1) throw new Error('Expected exactly one nondecorative primary SVG.');
  return candidates[0];
}`;

const MEASURE = `(function () {
  ${PRIMARY}
  var svg = primary();
  var box = svg.getBoundingClientRect();
  var title = svg.querySelector(':scope > title');
  var desc = svg.querySelector(':scope > desc');
  var equivalent = svg.closest('figure')?.querySelector('figcaption');
  var equivalentBox = equivalent?.getBoundingClientRect();
  var containers = [];
  for (var node = svg.parentElement; node; node = node.parentElement) {
    var style = getComputedStyle(node);
    var rect = node.getBoundingClientRect();
    if (node.scrollWidth > node.clientWidth + 1 && ['auto', 'scroll', 'hidden', 'clip'].includes(style.overflowX)) {
      containers.push({ tag: node.localName, overflowX: style.overflowX, clientWidth: node.clientWidth, scrollWidth: node.scrollWidth,
        keyboardFocusable: node.tabIndex >= 0, box: { x: rect.x, width: rect.width } });
    }
  }
  return {
    title: title ? title.textContent.trim() : '', description: desc ? desc.textContent.trim() : '',
    fonts: { status: document.fonts.status, configuredFamilies: Array.from(new Set(Array.from(svg.querySelectorAll('text')).map(function (node) { return getComputedStyle(node).fontFamily; }))) },
    localHorizontalScroll: containers.filter(function (item) { return ['auto', 'scroll'].includes(item.overflowX); }),
    hiddenHorizontalClipping: containers.some(function (item) { return ['hidden', 'clip'].includes(item.overflowX); }),
    svgFitsViewport: box.left >= -1 && box.right <= innerWidth + 1,
    equivalentContent: { selector: 'figure > figcaption', present: Boolean(equivalent?.textContent.trim()), characters: equivalent?.textContent.trim().length || 0, positiveBox: Boolean(equivalentBox?.width > 0 && equivalentBox?.height > 0) },
    box: { x: box.x + scrollX, y: box.y + scrollY, width: box.width, height: box.height },
    innerWidth: innerWidth, innerHeight: innerHeight,
    scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
    scrollHeight: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
  };
})()`;

// Materialize only SVG paint/text/layout properties, not unrelated browser defaults.
const SERIALIZE = `(function () {
  ${PRIMARY}
  var source = primary();
  if (getComputedStyle(source).transform !== 'none') throw new Error('Standalone SVG export does not support a transformed root SVG; remove its root transform before delivery.');
  var clone = source.cloneNode(true);
  var sources = [source].concat(Array.from(source.querySelectorAll('*')));
  var clones = [clone].concat(Array.from(clone.querySelectorAll('*')));
  var properties = ('x y cx cy r rx ry width height d box-sizing background-color background-image background-position background-size background-repeat background-origin background-clip background-attachment border-top-color border-right-color border-bottom-color border-left-color border-top-width border-right-width border-bottom-width border-left-width border-top-style border-right-style border-bottom-style border-left-style border-radius box-shadow color fill fill-opacity fill-rule stroke stroke-width stroke-opacity stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit opacity display visibility font-family font-size font-style font-weight font-stretch font-variant letter-spacing word-spacing text-anchor dominant-baseline alignment-baseline baseline-shift text-decoration text-transform white-space direction writing-mode overflow paint-order vector-effect shape-rendering text-rendering color-interpolation color-interpolation-filters clip-path clip-rule mask filter marker-start marker-mid marker-end stop-color stop-opacity flood-color flood-opacity lighting-color transform transform-origin transform-box').split(' ');
  var ids = new Set(Array.from(clone.querySelectorAll('[id]')).map(function (node) { return node.id; }));
  if (clone.id) ids.add(clone.id);
  function localReference(value) {
    if (value[0] === '#') {
      if (!ids.has(value.slice(1))) throw new Error('Unresolved internal SVG reference: ' + value);
      return value;
    }
    var url = new URL(value, document.baseURI);
    var current = new URL(document.URL);
    if (url.origin !== current.origin || url.pathname !== current.pathname || url.search !== current.search || !url.hash) throw new Error('External SVG reference refused.');
    if (!ids.has(decodeURIComponent(url.hash.slice(1)))) throw new Error('Unresolved internal SVG reference.');
    return url.hash;
  }
  function resolveUrls(value) {
    return value.replace(/url\\(\\s*(['"]?)(.*?)\\1\\s*\\)/g, function (_, quote, target) { return 'url(' + JSON.stringify(localReference(target)) + ')'; });
  }
  sources.forEach(function (node, index) {
    var copy = clones[index];
    if (node.namespaceURI !== 'http://www.w3.org/2000/svg' || /^(script|foreignObject|image|animate|animateMotion|animateTransform|set|style)$/i.test(node.localName)) throw new Error('Unsupported element in standalone SVG export: ' + node.localName);
    Array.from(copy.attributes).forEach(function (attr) {
      if (/^on/i.test(attr.name)) throw new Error('Event attributes refused.');
      if (['aria-labelledby', 'aria-describedby'].includes(attr.name)) {
        var references = attr.value.split(/\\s+/).filter(function (id) { return ids.has(id); });
        if (references.length) copy.setAttribute(attr.name, references.join(' '));
        else copy.removeAttribute(attr.name);
      }
      else if (attr.localName === 'href') copy.setAttributeNS(attr.namespaceURI, attr.name, localReference(attr.value));
      else if (attr.name !== 'style' && /url\\(/i.test(attr.value)) copy.setAttribute(attr.name, resolveUrls(attr.value));
    });
    copy.removeAttribute('style');
    var computed = getComputedStyle(node);
    Array.from(copy.attributes).forEach(function (attr) {
      if (attr.value.toLowerCase().includes('var(')) {
        var value = computed.getPropertyValue(attr.localName);
        if (!value || value.toLowerCase().includes('var(')) throw new Error('Unresolved SVG presentation variable: ' + attr.name);
        copy.setAttribute(attr.name, resolveUrls(value));
      }
    });
    properties.forEach(function (property) {
      var value = computed.getPropertyValue(property);
      if (value) copy.style.setProperty(property, resolveUrls(value));
    });
  });
  var box = source.getBoundingClientRect();
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', String(box.width));
  clone.setAttribute('height', String(box.height));
  clone.style.setProperty('width', box.width + 'px');
  clone.style.setProperty('height', box.height + 'px');
  clone.style.setProperty('max-width', 'none');
  return new XMLSerializer().serializeToString(clone);
})()`;

async function evaluate(browser, sessionId, expression, awaitPromise = false) {
  const response = await browser.cdp.send('Runtime.evaluate', {
    expression, returnByValue: true, awaitPromise, timeout: TIMEOUT,
  }, sessionId, TIMEOUT + 1000);
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text || 'Browser evaluation failed.');
  return response.result?.value;
}

function observation(viewport, metrics) {
  const box = metrics?.box;
  const positiveBox = box && ['x', 'y', 'width', 'height'].every((key) => Number.isFinite(box[key])) && box.width > 0 && box.height > 0;
  const horizontalOverflow = !Number.isFinite(metrics?.scrollWidth) || metrics.scrollWidth > viewport.width + 1;
  return { ...viewport, ...metrics, positiveBox: Boolean(positiveBox), horizontalOverflow,
    verticalScrolling: metrics?.scrollHeight > viewport.height,
    status: positiveBox && metrics.title && metrics.description && !horizontalOverflow && !metrics.hiddenHorizontalClipping ? 'pass' : 'fail' };
}

export function pngDimensions(bytes) {
  if (bytes.length < 33 || !bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) || bytes.toString('ascii', 12, 16) !== 'IHDR') throw new Error('Browser did not produce a PNG.');
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

// Ask Chromium to finish child-process writes before deleting its owned profile.
export async function closeEditorialBrowser(browser) {
  if (browser.child.exitCode === null && browser.child.signalCode === null) {
    const exited = new Promise((resolve) => {
      const done = () => { clearTimeout(timer); resolve(); };
      const timer = setTimeout(() => { browser.child.off('exit', done); resolve(); }, 3000);
      browser.child.once('exit', done);
    });
    try { await browser.cdp.send('Browser.close', {}, undefined, 2000); } catch { /* bounded forced-close fallback below */ }
    await exited;
  }
  await browser.close();
  fs.rmSync(browser.profileRoot, { recursive: true, force: true });
}

export async function runEditorialBrowser(args) {
  let options;
  let workspace;
  let browser;
  let network;
  let httpBlockingEnabled = false;
  const receipt = { evidenceKind: 'browser-editorial-check', status: 'fail', viewports: [], limitations: LIMITATIONS };
  try {
    options = parseEditorialBrowserArgs(args);
    receipt.command = options.command;
    receipt.input = options.input;
    if (options.command === 'export') receipt.evidenceKind = 'browser-editorial-export';
    assertNewOutput(options.output);
    assertNewOutput(options.captureDirectory);
    const bytes = readSnapshot(options.input);
    receipt.sourceSha256 = hash(bytes);
    workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'archify-editorial-'));
    const snapshot = path.join(workspace, 'input.html');
    fs.writeFileSync(snapshot, bytes, { flag: 'wx', mode: 0o400 });
    receipt.staticGate = await staticGate(snapshot);
    if (receipt.staticGate.managedCsp !== true) throw new Error('Browser commands require managed CSP. Run archify editorial deliver <source.html> <NEW.html> first, then use the delivered HTML.');
    if (receipt.staticGate.evidenceKind !== 'static-editorial-check' || receipt.staticGate.input?.sha256 !== receipt.sourceSha256 || receipt.staticGate.input?.bytes !== bytes.length) throw new Error('Static gate receipt does not match the validated snapshot.');
    if (hash(fs.readFileSync(snapshot)) !== receipt.sourceSha256) throw new Error('Snapshot changed during static validation.');
    // Preflight before the shared constructor creates a profile (constructor rejects root).
    if ((typeof process.getuid === 'function' && process.getuid() === 0) || process.env.ARCHIFY_CHROME_NO_SANDBOX === '1') throw new Error('Editorial browser commands require a non-root user and the Chromium sandbox.');
    const chrome = findChrome();
    if (!chrome) throw new Error('No installed Chrome/Chromium found. Set ARCHIFY_CHROME to an existing sandbox-capable browser.');
    receipt.browser = { executable: chrome, sandboxEnabled: true, documentScriptsDisabled: true, media: 'screen', colorScheme: 'light', reducedMotion: 'reduce', deviceScaleFactor: 1 };
    browser = new ChromeVisualBrowser(chrome);
    receipt.browser.profilePath = browser.profileRoot;
    receipt.browser.pid = browser.child.pid;
    const sessionId = await browser.sessionPromise;
    network = networkEvidence(browser, sessionId);
    await browser.cdp.send('Emulation.setScriptExecutionDisabled', { value: true }, sessionId);
    await browser.cdp.send('Network.enable', {}, sessionId);
    await browser.cdp.send('Network.setBlockedURLs', { urls: ['http://*', 'https://*', 'ftp://*', 'ws://*', 'wss://*'] }, sessionId);
    httpBlockingEnabled = true;
    await browser.cdp.send('Network.setCacheDisabled', { cacheDisabled: true }, sessionId);
    await browser.cdp.send('Emulation.setEmulatedMedia', { media: 'screen', features: [{ name: 'prefers-color-scheme', value: 'light' }, { name: 'prefers-reduced-motion', value: 'reduce' }] }, sessionId);
    const viewports = options.command === 'visual-check' ? EDITORIAL_VIEWPORTS : [EDITORIAL_VIEWPORTS[1]];
    for (const viewport of viewports) {
      await browser.cdp.send('Emulation.setDeviceMetricsOverride', { ...viewport, deviceScaleFactor: 1, mobile: false }, sessionId);
      const loaded = browser.cdp.waitFor('Page.loadEventFired', sessionId, TIMEOUT);
      // Attach a rejection handler immediately if navigation fails before load.
      loaded.catch(() => {});
      const navigation = await browser.cdp.send('Page.navigate', { url: pathToFileURL(snapshot).href }, sessionId);
      if (navigation.errorText) throw new Error(`Browser navigation failed: ${navigation.errorText}`);
      await loaded;
      receipt.viewports.push(observation(viewport, await evaluate(browser, sessionId, MEASURE)));
      if (options.captureDirectory) {
        if (!receipt.captureDirectory) {
          fs.mkdirSync(options.captureDirectory, { mode: 0o700 });
          receipt.captureDirectory = options.captureDirectory;
          receipt.captures = [];
        }
        const capture = await browser.cdp.send('Page.captureScreenshot', {
          format: 'png', fromSurface: true, captureBeyondViewport: false,
        }, sessionId, 20000);
        const image = Buffer.from(capture.data || '', 'base64');
        const dimensions = pngDimensions(image);
        if (dimensions.width !== viewport.width || dimensions.height !== viewport.height) throw new Error('Viewport screenshot dimensions do not match emulated viewport.');
        const output = path.join(options.captureDirectory, `${viewport.width}x${viewport.height}.png`);
        publishExclusive(output, image);
        receipt.captures.push({ path: output, sha256: hash(image), bytes: image.length, ...dimensions });
      }
    }
    if (receipt.viewports.some((item) => item.status !== 'pass')) throw new Error('Primary SVG structure or horizontal containment check failed.');
    if (network.count()) throw new Error('HTTP(S) request attempts detected and blocked.');
    if (options.command === 'export') {
      let exported;
      const box = receipt.viewports[0].box;
      receipt.renderedBox = box;
      receipt.scale = /\.png$/i.test(options.output) ? options.scale : null;
      if (/\.png$/i.test(options.output)) {
        const width = Math.round(box.width * options.scale);
        const height = Math.round(box.height * options.scale);
        if (width < 1 || height < 1 || width * height > MAX_PIXELS || width > 16384 || height > 16384 || box.x < 0 || box.y < 0) throw new Error('PNG export exceeds bounded dimensions (16M pixels, 16384px per side) or has an invalid clip.');
        // Visibility preserves layout while removing page chrome and ancestor backgrounds.
        await evaluate(browser, sessionId, `(function () { ${PRIMARY} var svg = primary(); Array.from(document.querySelectorAll('*')).forEach(function (node) { if (node !== svg && !svg.contains(node)) node.style.setProperty('visibility', 'hidden', 'important'); }); svg.style.setProperty('visibility', 'visible', 'important'); for (var parent = svg.parentElement; parent; parent = parent.parentElement) parent.style.setProperty('overflow', 'visible', 'important'); return true; })()`);
        await browser.cdp.send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } }, sessionId);
        const capture = await browser.cdp.send('Page.captureScreenshot', {
          format: 'png', fromSurface: true, captureBeyondViewport: true,
          clip: { x: box.x, y: box.y, width: width / options.scale, height: height / options.scale, scale: options.scale },
        }, sessionId, 20000);
        exported = Buffer.from(capture.data || '', 'base64');
        receipt.dimensions = pngDimensions(exported);
        if (receipt.dimensions.width !== width || receipt.dimensions.height !== height) {
          // Chromium quantizes fractional CSS clips before raster scaling on some versions.
          // Normalize only this bounded rounding difference; never accept a wrong output size.
          const nativeDimensions = receipt.dimensions;
          if (Math.abs(nativeDimensions.width - width) > Math.ceil(options.scale) || Math.abs(nativeDimensions.height - height) > Math.ceil(options.scale) || exported.length > 32 * 1024 * 1024) throw new Error('Unexpected native PNG dimensions or byte size.');
          const normalized = await evaluate(browser, sessionId, `(async function () {
            var bytes = Uint8Array.from(atob(${JSON.stringify(exported.toString('base64'))}), function (c) { return c.charCodeAt(0); });
            var bitmap = await createImageBitmap(new Blob([bytes], { type: 'image/png' }));
            try {
              var canvas = document.createElement('canvas'); canvas.width = ${width}; canvas.height = ${height};
              var context = canvas.getContext('2d');
              if (!context) throw new Error('PNG normalization canvas unavailable.');
              context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
              return canvas.toDataURL('image/png').split(',')[1];
            } finally { bitmap.close(); }
          })()`, true);
          if (typeof normalized !== 'string') throw new Error('PNG normalization failed.');
          exported = Buffer.from(normalized, 'base64');
          receipt.rasterNormalization = { method: 'canvas-resample-rounding-only', nativeDimensions };
          receipt.dimensions = pngDimensions(exported);
        }
        if (receipt.dimensions.width !== width || receipt.dimensions.height !== height) throw new Error(`PNG dimensions differ from the measured rendered box: expected ${width}x${height}, got ${receipt.dimensions.width}x${receipt.dimensions.height}.`);
      } else {
        const serialized = await evaluate(browser, sessionId, SERIALIZE);
        if (typeof serialized !== 'string' || serialized.length > 16 * 1024 * 1024) throw new Error('Standalone SVG is missing or too large.');
        exported = Buffer.from(serialized, 'utf8');
      }
      if (network.count()) throw new Error('HTTP(S) request attempts detected and blocked.');
      publishExclusive(options.output, exported);
      receipt.output = options.output;
      receipt.outputSha256 = hash(exported);
      receipt.outputBytes = exported.length;
    }
    receipt.status = 'pass';
  } catch (error) {
    receipt.error = error.message;
    if (error.gate) receipt.staticGate = error.gate;
  } finally {
    receipt.network = { httpBlockingEnabled, attempts: network?.attempts || [], attemptCount: network?.count() || 0 };
    network?.stop();
    const cleanupErrors = [];
    if (browser) {
      try { await closeEditorialBrowser(browser); } catch (error) { cleanupErrors.push(`Browser cleanup: ${error.message}`); }
      // The shared adapter tolerates profile deletion errors; editorial receipts must not.
      try { fs.rmSync(browser.profileRoot, { recursive: true, force: true }); } catch (error) { cleanupErrors.push(`Browser profile cleanup: ${error.message}`); }
    }
    if (workspace) {
      try { fs.rmSync(workspace, { recursive: true, force: true }); } catch (error) { cleanupErrors.push(`Snapshot cleanup: ${error.message}`); }
    }
    const processExited = !browser || browser.child.exitCode !== null || browser.child.signalCode !== null;
    const profileRemoved = !browser || !fs.existsSync(browser.profileRoot);
    const snapshotRemoved = !workspace || !fs.existsSync(workspace);
    if (!processExited || !profileRemoved || !snapshotRemoved) cleanupErrors.push('Owned browser process/profile/snapshot remains.');
    receipt.cleanup = { processExited, profileRemoved, snapshotRemoved, complete: cleanupErrors.length === 0 };
    if (cleanupErrors.length) {
      receipt.status = 'fail';
      receipt.cleanupErrors = cleanupErrors;
      receipt.error = [receipt.error, 'Cleanup was incomplete. Any output listed in this receipt was already published and was not rolled back.'].filter(Boolean).join(' ');
    }
  }
  if (receipt.captureDirectory) receipt.captureStatus = receipt.status === 'pass' ? 'complete' : 'incomplete';
  return { exitCode: receipt.status === 'pass' ? 0 : 1, receipt };
}
