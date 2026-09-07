import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const helper = fileURLToPath(new URL('../editorial/check.py', import.meta.url));
const TIMEOUT_MS = 10000;
const MAX_OUTPUT = 256 * 1024;

function runHelper(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.env.ARCHIFY_PYTHON || 'python3', ['-I', '-B', helper, ...args], {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false,
      // Ignore Python path/user-site injection. ARCHIFY_PYTHON is a trusted executable override.
    });
    let stdout = '', bytes = 0, stopped = false, failure;
    const stop = (error) => {
      if (stopped) return;
      stopped = true;
      failure = error;
      child.kill('SIGKILL');
    };
    const timer = setTimeout(() => stop(new Error('Editorial helper exceeded its 10-second limit.')), TIMEOUT_MS);
    for (const stream of [child.stdout, child.stderr]) {
      stream.on('data', (chunk) => {
        bytes += chunk.length;
        if (bytes > MAX_OUTPUT) stop(new Error('Editorial helper output exceeded its bound.'));
        else if (stream === child.stdout) stdout += chunk.toString('utf8');
      });
    }
    child.on('error', (error) => {
      clearTimeout(timer);
      reject(new Error(`Editorial helper could not start: ${error.code || 'unknown error'}`));
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (failure) return reject(failure);
      let receipt;
      try { receipt = JSON.parse(stdout); } catch {
        return reject(new Error('Editorial helper did not emit a valid JSON receipt.'));
      }
      if (receipt?.evidenceKind !== 'static-editorial-check' || typeof receipt.ok !== 'boolean'
          || (code === 0) !== receipt.ok || ![0, 1].includes(code)) {
        return reject(new Error('Editorial helper exit status and evidence disagree.'));
      }
      resolve({ receipt, code });
    });
  });
}

/** Static-only editorial branch. Does not call the typed renderer/checker. */
export async function runEditorial(args) {
  const json = args.includes('--json');
  let receipt, code = 2;
  try {
    const rest = args.filter((arg) => arg !== '--json');
    if (args.filter((arg) => arg === '--json').length > 1
        || rest.some((arg) => arg.startsWith('--'))
        || !['check', 'deliver'].includes(rest[0])
        || rest.length !== (rest[0] === 'check' ? 2 : 3)) {
      throw new Error('Usage: archify editorial check <candidate.html> [--json] | archify editorial deliver <candidate.html> <NEW-output.html> [--json]');
    }
    // Resolve user paths before passing argv; never use shell interpolation.
    const helperArgs = [rest[0], ...rest.slice(1).map((name) => path.resolve(name))];
    ({ receipt, code } = await runHelper(helperArgs));
  } catch (error) {
    receipt = {
      schemaVersion: 1, ok: false, evidenceKind: 'static-editorial-check',
      browserReview: 'untested', visualReview: 'untested', error: error.message,
    };
  }
  // JSON is the exact-byte receipt. The text form retains identities and limits.
  if (json) console.log(JSON.stringify(receipt, null, 2));
  else {
    console.log(`${receipt.ok ? 'ok' : 'failed'} static-editorial-check${receipt.error ? `: ${receipt.error}` : ''}`);
    for (const key of ['input', 'artifact']) {
      if (receipt[key]) console.log(`${key}: ${receipt[key].path} (${receipt[key].bytes} bytes; SHA-256 ${receipt[key].sha256})`);
    }
    console.log('Browser review: untested. Visual review: untested. Not a sanitizer or typed validation.');
  }
  process.exitCode = code;
  return code;
}
