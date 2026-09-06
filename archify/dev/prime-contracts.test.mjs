import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Installed-skill contract: Node built-ins and shipped examples only.
// Every process is bounded. Network attempts fail and leave a checked sentinel.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(root, 'bin/archify.mjs');
const examples = {
  architecture: ['web-app.architecture.json', 'components'],
  workflow: ['agent-tool-call.workflow.json', 'nodes'],
  sequence: ['cache-miss-request.sequence.json', 'participants'],
  dataflow: ['product-analytics.dataflow.json', 'nodes'],
  lifecycle: ['agent-run.lifecycle.json', 'states'],
};
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const marker = 'PRIME: preserve these exact bytes\n';

function workspace(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'archify-prime-contracts-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const home = path.join(dir, 'home');
  const cwd = path.join(dir, 'work');
  fs.mkdirSync(home); fs.mkdirSync(cwd);
  const networkLog = path.join(dir, 'network-attempt');
  const guard = path.join(dir, 'deny-network.mjs');
  fs.writeFileSync(guard, `
import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import tls from 'node:tls';
import dns from 'node:dns';
import dnsPromises from 'node:dns/promises';
import { syncBuiltinESMExports } from 'node:module';
function denied() {
  fs.appendFileSync(process.env.PRIME_NETWORK_LOG, 'attempt\\n');
  throw new Error('Prime regression prohibits network access');
}
for (const module of [http, https]) {
  module.request = denied; module.get = denied; module.createServer = denied;
}
net.connect = denied; net.createConnection = denied; net.createServer = denied;
net.Socket.prototype.connect = denied;
tls.connect = denied;
for (const module of [dns, dnsPromises]) {
  for (const key of Object.keys(module)) {
    if (key === 'lookup' || key === 'lookupService' || key.startsWith('resolve')) module[key] = denied;
  }
}
globalThis.fetch = denied;
syncBuiltinESMExports();
`);
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => (
    !key.startsWith('ARCHIFY_') && !key.startsWith('GIT_') && key !== 'NODE_OPTIONS'
  )));
  Object.assign(env, {
    HOME: home, XDG_CACHE_HOME: path.join(home, 'cache'),
    XDG_CONFIG_HOME: path.join(home, 'config'),
    PRIME_NETWORK_LOG: networkLog,
    ARCHIFY_DIAGNOSTIC_FORMAT: 'json',
    GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_TERMINAL_PROMPT: '0', GIT_NO_LAZY_FETCH: '1', GIT_ALLOW_PROTOCOL: 'file',
  });
  function runNode(args, extraEnv = {}) {
    const result = spawnSync(process.execPath, ['--import', guard, ...args], {
      cwd, env: { ...env, ...extraEnv }, encoding: 'utf8', timeout: 15000,
      maxBuffer: 4 * 1024 * 1024,
    });
    assert.ifError(result.error);
    assert.equal(result.signal, null, result.stderr);
    assert.equal(fs.existsSync(networkLog), false, 'runtime attempted network or a server');
    return result;
  }
  const run = (args, extraEnv) => runNode([cli, ...args], extraEnv);
  function input(type = 'workflow', mutate = () => {}) {
    const document = JSON.parse(fs.readFileSync(path.join(root, 'examples', examples[type][0]), 'utf8'));
    delete document.meta.output;
    mutate(document);
    const filename = path.join(cwd, `${type}.json`);
    fs.writeFileSync(filename, JSON.stringify(document));
    return filename;
  }
  return { dir, cwd, home, env, run, runNode, input };
}
function success(result) {
  assert.equal(result.status, 0, result.stdout + result.stderr);
  return JSON.parse(result.stdout);
}
function failure(result, code) {
  assert.equal(result.status, 1, result.stdout + result.stderr);
  const receipt = JSON.parse(result.stdout || result.stderr);
  assert.equal(receipt.ok, false);
  assert.ok(receipt.diagnostics.some((entry) => entry.code === code), JSON.stringify(receipt));
  return receipt;
}

for (const [type, [, collection]] of Object.entries(examples)) {
  test(`${type}: validate and deliver produce checked, hash-bound artifacts offline`, (t) => {
    const w = workspace(t);
    const input = w.input(type);
    const output = path.join(w.cwd, 'result.html');
    const validated = success(w.run(['validate', type, input, '--json']));
    assert.equal(validated.command, 'validate');
    assert.ok(validated.checks.length > 0 && validated.checks.every((check) => check.ok));
    assert.equal(fs.existsSync(output), false);
    const delivered = success(w.run(['deliver', type, input, output, '--json']));
    assert.equal(delivered.command, 'deliver');
    assert.equal(delivered.output, output);
    const artifact = fs.readFileSync(output);
    assert.equal(delivered.artifact.sha256, digest(artifact));
    assert.equal(delivered.artifact.bytes, artifact.length);
    assert.equal(delivered.specification.sha256, digest(fs.readFileSync(input)));
    assert.equal(delivered.validation.checksPassed, delivered.validation.checkCount);
    assert.ok(delivered.validation.checkCount > 0);
    assert.equal(delivered.open, undefined);
    assert.deepEqual(fs.readdirSync(w.cwd).sort(), [`${type}.json`, 'result.html'].sort());
  });
  test(`${type}: remote brand objects fail before networking despite legacy bypass`, (t) => {
    const w = workspace(t);
    const input = w.input(type, (document) => {
      document[collection][0].brand = { url: 'http://127.0.0.1/private', sha256: '0'.repeat(64) };
    });
    failure(w.run(['validate', type, input, '--json'], {
      ARCHIFY_BRAND_ALLOW_PRIVATE: '1',
    }), 'brand/remote-disabled');
    assert.deepEqual(fs.readdirSync(w.cwd), [`${type}.json`]);
  });
}

test('embedded IDs and known-domain aliases resolve without network; capture is disabled', (t) => {
  const w = workspace(t);
  const listed = success(w.run(['brands', '--json']));
  const mark = listed.marks.find((entry) => entry.domains?.length);
  assert.ok(mark, 'bundled catalog must provide a known-domain fixture');
  const moduleUrl = pathToFileURL(path.join(root, 'renderers/shared/brand-marks.mjs')).href;
  const source = `
    import assert from 'node:assert/strict';
    const m = await import(${JSON.stringify(moduleUrl)});
    for (const brand of ${JSON.stringify([mark.id, `https://${mark.domains[0]}/`])}) {
      const node = {id:'n', label:'Node', brand};
      await m.prepareDiagramBrandMarks('architecture', {components:[node]});
      assert.equal(m.brandMarkFor(node).id, ${JSON.stringify(mark.id)});
      assert.equal(m.brandMarkFor(node).status, 'preset');
    }
    await assert.rejects(m.captureBrandReference('https://example.invalid'), /disabled in Prime/);
  `;
  assert.equal(w.runNode(['--input-type=module', '-e', source]).status, 0);
  const result = w.run(['brands', 'capture', 'https://example.invalid', '--json']);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /disabled in Prime/);
});

test('preview rejects both CLI and imported invocation without output or server', (t) => {
  const w = workspace(t);
  const input = w.input();
  const output = path.join(w.cwd, 'preview.html');
  const result = w.run(['preview', 'workflow', input, output, '--no-open']);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /disabled/);
  const moduleUrl = pathToFileURL(path.join(root, 'bin/preview.mjs')).href;
  const imported = w.runNode(['--input-type=module', '-e', `
    import assert from 'node:assert/strict';
    const m = await import(${JSON.stringify(moduleUrl)});
    await assert.rejects(m.runPreview({}), /disabled/);
  `]);
  assert.equal(imported.status, 0, imported.stderr);
  assert.deepEqual(fs.readdirSync(w.cwd), ['workflow.json']);
});

test('update check is a stateless disabled receipt even when explicitly enabled', (t) => {
  const w = workspace(t);
  const result = w.runNode([path.join(root, 'scripts/check-update.mjs')], {
    ARCHIFY_UPDATE_CHECK: '1', ARCHIFY_UPDATE_CHANNEL: 'stable',
  });
  const receipt = success(result);
  assert.equal(receipt.disabled, true);
  assert.equal(receipt.status, 'silent');
  assert.deepEqual(fs.readdirSync(w.home), []);
  assert.deepEqual(fs.readdirSync(w.cwd), []);
});

for (const mode of ['default', 'explicit', 'meta', 'direct-default']) {
  test(`${mode} render refuses a non-HTML symlink target and preserves exact bytes`, (t) => {
    const w = workspace(t);
    const output = path.join(w.cwd, 'workflow.html');
    const target = path.join(w.cwd, 'valuable.env');
    fs.writeFileSync(target, marker);
    fs.symlinkSync(target, output);
    const input = w.input('workflow', (document) => {
      if (mode === 'meta') document.meta.output = 'workflow.html';
    });
    const inputBytes = fs.readFileSync(input);
    const result = mode === 'direct-default'
      ? w.runNode([path.join(root, 'renderers/workflow/render-workflow.mjs'), input])
      : w.run(['render', 'workflow', input, ...(mode === 'explicit' ? [output] : [])]);
    failure(result, mode === 'meta' ? 'output/meta-resolved-extension' : 'output/cli-resolved-extension');
    assert.equal(fs.readFileSync(target, 'utf8'), marker);
    assert.deepEqual(fs.readFileSync(input), inputBytes);
    assert.ok(fs.lstatSync(output).isSymbolicLink());
  });
}

for (const kind of ['direct', 'symlink', 'hardlink']) {
  for (const command of ['render', 'deliver']) {
    test(`${command} refuses ${kind} input aliases without modifying source bytes`, (t) => {
      const w = workspace(t);
      const input = w.input();
      const before = fs.readFileSync(input);
      let output = input;
      if (kind !== 'direct') {
        output = path.join(w.cwd, 'alias.html');
        if (kind === 'symlink') fs.symlinkSync(input, output);
        else fs.linkSync(input, output);
      }
      failure(w.run([command, 'workflow', input, output, ...(command === 'deliver' ? ['--json'] : [])]),
        'output/input-alias');
      assert.deepEqual(fs.readFileSync(input), before);
      assert.deepEqual(fs.readFileSync(output), before);
    });
  }
}

for (const kind of ['absolute', 'parent', 'directory-symlink']) {
  test(`meta.output rejects ${kind} escapes without modifying outside bytes`, (t) => {
    const w = workspace(t);
    const target = path.join(w.dir, 'outside.html');
    fs.writeFileSync(target, marker);
    if (kind === 'directory-symlink') fs.symlinkSync(w.dir, path.join(w.cwd, 'escape'));
    const input = w.input('workflow', (document) => {
      document.meta.output = kind === 'absolute' ? target
        : kind === 'parent' ? '../outside.html' : 'escape/outside.html';
    });
    failure(w.run(['render', 'workflow', input]),
      kind === 'absolute' ? 'output/meta-absolute' : 'output/meta-outside-cwd');
    assert.equal(fs.readFileSync(target, 'utf8'), marker);
  });
}

test('failed deliver preserves the previous artifact and removes staging candidates', (t) => {
  const w = workspace(t);
  const input = w.input('workflow', (document) => { document.unsupported = 'invalid'; });
  const output = path.join(w.cwd, 'trusted.html');
  fs.writeFileSync(output, marker);
  failure(w.run(['deliver', 'workflow', input, output, '--json']), 'schema/additionalProperties');
  assert.equal(fs.readFileSync(output, 'utf8'), marker);
  assert.deepEqual(fs.readdirSync(w.cwd).sort(), ['trusted.html', 'workflow.json']);
});

test('local Git evidence validates pinned source lines and fails closed on invalid evidence', (t) => {
  const w = workspace(t);
  const repo = path.join(w.dir, 'repository');
  fs.mkdirSync(repo);
  function git(args) {
    const result = spawnSync('git', ['-C', repo, '-c', 'core.hooksPath=/dev/null',
      '-c', 'commit.gpgSign=false', ...args], {
      env: w.env, encoding: 'utf8', timeout: 10000, maxBuffer: 1024 * 1024,
    });
    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
  }
  git(['init']);
  git(['config', 'user.name', 'Prime contract fixture']);
  git(['config', 'user.email', 'prime-contract@example.invalid']);
  git(['remote', 'add', 'origin', 'https://github.com/example/prime-contract-fixture']);
  fs.writeFileSync(path.join(repo, 'source.js'), 'export const value = 1;\n// evidence marker\n');
  git(['add', '--', 'source.js']);
  git(['commit', '-m', 'local evidence fixture']);
  const revision = git(['rev-parse', 'HEAD']);
  function evidence(mutate = () => {}) {
    return w.input('architecture', (document) => {
      document.meta.repository = { url: 'https://github.com/example/prime-contract-fixture', revision };
      document.components[0].sources = [{ path: 'source.js', line: 1, end_line: 2 }];
      mutate(document);
    });
  }
  const input = evidence();
  const output = path.join(w.cwd, 'evidence.html');
  const receipt = success(w.run(['deliver', 'architecture', input, output, '--repo-root', repo, '--json']));
  assert.equal(receipt.evidence.verified, true);
  assert.equal(receipt.evidence.revision, revision);
  assert.equal(receipt.evidence.references, 1);
  assert.equal(receipt.artifact.sha256, digest(fs.readFileSync(output)));
  const html = fs.readFileSync(output, 'utf8');
  assert.ok(html.includes(`/blob/${revision}/source.js#L1-L2`));
  assert.ok(!html.includes('// evidence marker'), 'raw source bytes must not be embedded');
  failure(w.run(['validate', 'architecture', input, '--json']), 'repository-evidence/root-required');
  const cases = [
    ['repository-evidence/origin-mismatch', (d) => { d.meta.repository.url = 'https://github.com/example/other'; }],
    ['repository-evidence/revision-unavailable', (d) => { d.meta.repository.revision = '0'.repeat(40); }],
    ['repository-evidence/file-missing', (d) => { d.components[0].sources[0].path = 'missing.js'; }],
    ['repository-evidence/line-out-of-range', (d) => { d.components[0].sources[0].end_line = 99; }],
    ['repository-evidence/path-escape', (d) => { d.components[0].sources[0].path = '../source.js'; }],
  ];
  for (const [code, mutate] of cases) {
    const invalid = evidence(mutate);
    failure(w.run(['validate', 'architecture', invalid, '--repo-root', repo, '--json']), code);
  }
});
