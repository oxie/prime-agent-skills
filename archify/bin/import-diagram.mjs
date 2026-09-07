#!/usr/bin/env node
// Offline extractor boundary. Returned JSON is upstream IR, not Archify render input.
import { spawn } from 'node:child_process';
import { lstat, open, link, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { resolve, dirname, extname, parse } from 'node:path';
import { fileURLToPath } from 'node:url';

const IMPORTS = fileURLToPath(new URL('../imports/', import.meta.url));
const MAX_OUTPUT = 16 * 1024 * 1024;
const HELP = `Usage: archify import mermaid|drawio <input> [--out <new.json>]
  --diagram N|all   Mermaid block selector (default: first)
  --page N|NAME|all draw.io page selector (default: first)
  --timeout-ms N    1..30000 milliseconds (default: 10000)
  --help           Show this help

Mermaid: flowchart/graph, sequenceDiagram, stateDiagram-v2, erDiagram.
Draw.io: raw XML, compressed payload, embedded PNG/SVG metadata.
Output is extractor IR, NOT Archify typed JSON. No automatic conversion.
Partial grammar; inspect references/imports.md for the fidelity ledger.
Python 3.10+ is required. ARCHIFY_PYTHON selects one executable (not a command).
No installs, network, rendering, or execution of diagram content.
`;

function fail(code, error, detail) {
  process.stderr.write(JSON.stringify({ command: 'import', ok: false, error, detail }) + '\n');
  return code;
}

async function newOutput(path) {
  if (extname(path) !== '.json') throw new Error('--out must end in .json');
  // Reject symlink ancestors as well as symlink/existing leaf targets.
  let parent = dirname(path);
  for (;;) {
    const st = await lstat(parent);
    if (st.isSymbolicLink() || !st.isDirectory()) throw new Error('output parent must be a real directory, not a symlink');
    if (parent === parse(parent).root) break;
    parent = dirname(parent);
  }
  try { await lstat(path); }
  catch (error) { if (error.code === 'ENOENT') return; throw error; }
  throw new Error('--out must be NEW; existing files and symlinks are never overwritten');
}

function extract(python, argv, timeout) {
  return new Promise((done) => {
    let child;
    try { child = spawn(python, argv, { shell: false, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true }); }
    catch (error) { done({ error: 'python-blocked', detail: error.message }); return; }
    const stdout = [], stderr = [];
    let bytes = 0, limitError, spawnError;
    const timer = setTimeout(() => { limitError = 'timeout'; child.kill('SIGKILL'); }, timeout);
    const collect = (target) => (chunk) => {
      bytes += chunk.length;
      if (bytes > MAX_OUTPUT) { limitError ??= 'output-limit'; child.kill('SIGKILL'); return; }
      target.push(chunk);
    };
    child.stdout.on('data', collect(stdout));
    child.stderr.on('data', collect(stderr));
    child.on('error', (error) => { spawnError = error.message; });
    child.on('close', (code, signal) => {
      clearTimeout(timer);
      done({ code, signal, error: limitError || (spawnError ? 'python-blocked' : undefined),
        detail: spawnError, stdout: Buffer.concat(stdout).toString('utf8'),
        stderr: Buffer.concat(stderr).toString('utf8') });
    });
  });
}

export async function runImport(args) {
  if (!Array.isArray(args) || args.some((arg) => typeof arg !== 'string')) return fail(2, 'arguments', 'expected a string argument array');
  if (args.length === 1 && ['--help', '-h'].includes(args[0]) ||
      args.length === 2 && ['mermaid', 'drawio'].includes(args[0]) && ['--help', '-h'].includes(args[1])) {
    process.stdout.write(HELP); return 0;
  }
  const [kind, inputArg, ...options] = args;
  if (!['mermaid', 'drawio'].includes(kind) || !inputArg || inputArg.startsWith('-')) return fail(2, 'arguments', 'expected mermaid|drawio <input>; use --help (prefix dash-leading paths with ./)');
  let out, selector, timeout = 10000;
  const seen = new Set();
  const allowed = new Set(['--out', '--timeout-ms', kind === 'mermaid' ? '--diagram' : '--page']);
  for (let i = 0; i < options.length; i += 2) {
    const flag = options[i], value = options[i + 1];
    if (!allowed.has(flag) || seen.has(flag) || !value || value.startsWith('--')) return fail(2, 'arguments', `unknown, duplicate, or incomplete option: ${flag}`);
    seen.add(flag);
    if (flag === '--out') out = resolve(value);
    else if (flag === '--timeout-ms') {
      if (!/^\d+$/.test(value) || +value < 1 || +value > 30000) return fail(2, 'arguments', '--timeout-ms must be 1..30000');
      timeout = +value;
    } else {
      if (kind === 'mermaid' && !/^(\d+|all)$/.test(value)) return fail(2, 'arguments', '--diagram must be an index or all');
      selector = [flag, value];
    }
  }
  const input = resolve(inputArg);
  try {
    const st = await lstat(input);
    if (!st.isFile() || st.isSymbolicLink()) throw new Error('input must be a regular, non-symlink file');
    const max = (kind === 'mermaid' ? 4 : 32) * 1024 * 1024;
    if (st.size > max) throw new Error(`source exceeds ${max} byte limit`);
    if (out) { if (out === input) throw new Error('--out aliases input'); await newOutput(out); }
  } catch (error) { return fail(2, 'path', error.message); }
  const python = process.env.ARCHIFY_PYTHON ?? 'python3';
  if (!python || python.includes('\0')) return fail(3, 'python-blocked', 'ARCHIFY_PYTHON must name one executable; install/setup is manual');
  const result = await extract(python, ['-I', '-B', resolve(IMPORTS, `${kind}_extract.py`), input, '--json', ...(selector || [])], timeout);
  if (result.error) return fail(result.error === 'timeout' ? 124 : result.error === 'python-blocked' ? 3 : 2, result.error,
    result.detail || (result.error === 'timeout' ? `extractor exceeded ${timeout} ms` : `extractor exceeded ${MAX_OUTPUT} output bytes`));
  if (result.code !== 0) return fail(2, 'extractor-failed', (result.stderr || `exit ${result.code}; signal ${result.signal}`).slice(0, 8192));
  try { JSON.parse(result.stdout); }
  catch { return fail(2, 'invalid-ir', 'extractor did not emit valid JSON'); }
  if (!out) { process.stdout.write(result.stdout); return 0; }
  // Publish only complete, fsynced JSON. link() fails rather than replacing an
  // existing destination, including one created after our preflight check.
  const scratch = resolve(dirname(out), `.archify-import-${randomUUID()}.tmp`);
  let file, created, published = false, operationError, cleanupError;
  try {
    await newOutput(out);
    file = await open(scratch, 'wx', 0o600);
    created = await file.stat();
    if (!created.isFile()) throw new Error('scratch output is not a regular file');
    await file.writeFile(result.stdout, 'utf8');
    await file.sync();
    await file.close(); file = undefined;
    await link(scratch, out);
    published = true;
  } catch (error) {
    operationError = error;
  } finally {
    if (file) {
      try { await file.close(); } catch (error) { cleanupError = error; }
    }
    if (created) {
      try {
        const current = await lstat(scratch);
        if (current.ino !== created.ino || current.dev !== created.dev || !current.isFile()) {
          throw new Error('scratch ownership changed; replacement was not removed');
        }
        await unlink(scratch);
      } catch (error) {
        if (error.code !== 'ENOENT') cleanupError = error;
      }
    }
  }
  if (cleanupError) return fail(2, 'output-cleanup',
    `${published ? 'complete output WAS published' : 'output was NOT published'}; scratch cleanup failed: ${cleanupError.message}; scratch: ${scratch}${operationError ? `; operation: ${operationError.message}` : ''}`);
  if (operationError) return fail(2, 'output', operationError.message);
  return 0;
}
