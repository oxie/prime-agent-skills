import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { parseEditorialBrowserArgs, assertNewOutput, publishExclusive, pngDimensions, runEditorialBrowser } from '../bin/editorial-browser.mjs';

test('strict editorial argument bounds and output extensions', () => {
  assert.equal(parseEditorialBrowserArgs(['visual-check', 'a.html', '--json']).json, true);
  assert.equal(parseEditorialBrowserArgs(['visual-check', 'a.html', '--capture-dir', 'new']).captureDirectory, path.resolve('new'));
  assert.throws(() => parseEditorialBrowserArgs(['visual-check', 'a.html', '--capture-dir']));
  assert.throws(() => parseEditorialBrowserArgs(['export', 'a.html', 'a.png', '--capture-dir', 'new']));
  assert.throws(() => parseEditorialBrowserArgs(['visual-check', 'a.html', '--capture-dir', 'one', '--capture-dir', 'two']));
  for (const scale of ['0.25', '.5', '1', '1.5', '4']) assert.equal(parseEditorialBrowserArgs(['export', 'a.html', 'b.png', '--scale', scale]).scale, Number(scale));
  for (const scale of ['0', '-1', '0.24', '4.01', 'NaN', 'Infinity', '1e2', '', '--json']) assert.throws(() => parseEditorialBrowserArgs(['export', 'a.html', 'b.png', '--scale', scale]));
  for (const args of [[], ['oops'], ['visual-check'], ['visual-check', 'a.svg'], ['visual-check', 'a.html', 'extra'], ['visual-check', 'a.html', '--scale', '1'], ['visual-check', 'a.html', '--json', '--json'], ['export', 'a.html', 'b.jpeg'], ['export', 'a.html', 'b.svg', '--scale', '1'], ['export', 'a.html', 'b.png', '--scale', '1', '--scale', '2']]) assert.throws(() => parseEditorialBrowserArgs(args));
});

test('exclusive publication preserves files, symlinks and race winners', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'archify-output-test-'));
  try {
    const output = path.join(root, 'new.png');
    assertNewOutput(output);
    publishExclusive(output, Buffer.from('first'));
    assert.equal(fs.readFileSync(output, 'utf8'), 'first');
    assert.throws(() => publishExclusive(output, Buffer.from('second')));
    assert.equal(fs.readFileSync(output, 'utf8'), 'first');
    const link = path.join(root, 'link.png');
    fs.symlinkSync(output, link);
    assert.throws(() => publishExclusive(link, Buffer.from('replacement')));
    assert.equal(fs.lstatSync(link).isSymbolicLink(), true);
    const dangling = path.join(root, 'dangling.png');
    fs.symlinkSync(path.join(root, 'missing'), dangling);
    assert.throws(() => assertNewOutput(dangling));
    const dirlink = path.join(root, 'dirlink');
    fs.symlinkSync(root, dirlink);
    assert.throws(() => assertNewOutput(path.join(dirlink, 'another.png')));
    assert.deepEqual(fs.readdirSync(root).sort(), ['dangling.png', 'dirlink', 'link.png', 'new.png']);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('PNG header dimension check rejects non-PNG bytes', () => {
  assert.throws(() => pngDimensions(Buffer.from('not PNG')));
  const bytes = Buffer.alloc(33);
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(bytes);
  bytes.write('IHDR', 12);
  bytes.writeUInt32BE(234, 16); bytes.writeUInt32BE(567, 20);
  assert.deepEqual(pngDimensions(bytes), { width: 234, height: 567 });
});

test('invalid arguments and existing output fail before gate/browser', async () => {
  const result = await runEditorialBrowser(['export', 'missing.html', 'bad.jpg']);
  assert.equal(result.exitCode, 1);
  assert.match(result.receipt.error, /extension/);
  assert.equal(result.receipt.network.httpBlockingEnabled, false);
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'archify-preflight-test-'));
  try {
    const output = path.join(root, 'kept.png');
    fs.writeFileSync(output, 'kept');
    const blocked = await runEditorialBrowser(['export', 'missing.html', output]);
    assert.match(blocked.receipt.error, /already exists/);
    assert.equal(blocked.receipt.sourceSha256, undefined);
    assert.equal(fs.readFileSync(output, 'utf8'), 'kept');
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});


test('input byte bounds and symlinks fail before static gate or browser', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'archify-input-test-'));
  try {
    for (const [name, size] of [['empty.html', 0], ['large.html', 4 * 1024 * 1024 + 1]]) {
      const input = path.join(root, name);
      fs.writeFileSync(input, Buffer.alloc(size));
      const result = await runEditorialBrowser(['visual-check', input]);
      assert.equal(result.exitCode, 1);
      assert.match(result.receipt.error, /regular file/);
      assert.equal(result.receipt.staticGate, undefined);
      assert.equal(result.receipt.network.httpBlockingEnabled, false);
    }
    const source = path.join(root, 'source.html');
    const link = path.join(root, 'linked.html');
    fs.writeFileSync(source, '<html></html>'); fs.symlinkSync(source, link);
    const result = await runEditorialBrowser(['visual-check', link]);
    assert.equal(result.exitCode, 1);
    assert.equal(result.receipt.staticGate, undefined);
    assert.equal(fs.lstatSync(link).isSymbolicLink(), true);
    assert.equal(fs.readFileSync(source, 'utf8'), '<html></html>');
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});


test('FIFO input is rejected without blocking before gate/browser', { skip: process.platform === 'win32' }, async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'archify-fifo-test-'));
  try {
    const input = path.join(root, 'pipe.html');
    execFileSync('mkfifo', [input], { timeout: 3000 });
    const result = await runEditorialBrowser(['visual-check', input]);
    assert.equal(result.exitCode, 1);
    assert.match(result.receipt.error, /regular file/);
    assert.equal(result.receipt.staticGate, undefined);
    assert.equal(result.receipt.network.httpBlockingEnabled, false);
    assert.equal(fs.lstatSync(input).isFIFO(), true);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});


test('unmanaged benign HTML is refused after an exact gate check, before browser', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'archify-managed-test-'));
  try {
    const input = path.join(root, 'reviewed.html');
    const source = fs.readFileSync(new URL('../editorial/examples/bar.html', import.meta.url));
    fs.writeFileSync(input, source);
    const result = await runEditorialBrowser(['visual-check', input]);
    assert.equal(result.exitCode, 1);
    assert.equal(result.receipt.staticGate.ok, true);
    assert.equal(result.receipt.staticGate.managedCsp, false);
    assert.equal(result.receipt.staticGate.input.sha256, result.receipt.sourceSha256);
    assert.match(result.receipt.error, /require managed CSP/);
    assert.equal(result.receipt.network.httpBlockingEnabled, false);
    assert.equal(result.receipt.browser, undefined);
    assert.deepEqual(result.receipt.cleanup, { processExited: true, profileRemoved: true, snapshotRemoved: true, complete: true });
    assert.deepEqual(fs.readFileSync(input), source);
    assert.deepEqual(fs.readdirSync(root), ['reviewed.html']);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
