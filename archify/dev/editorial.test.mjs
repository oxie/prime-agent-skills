import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const moduleURL = new URL('../bin/editorial.mjs', import.meta.url).href;
const helper = path.join(root, 'editorial/check.py');
const runCode = `import {runEditorial} from ${JSON.stringify(moduleURL)}; const code=await runEditorial(process.argv.slice(1)); if(!Number.isInteger(code)) throw Error('numeric exit code required');`;
const CSP = "default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src 'none'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";
const meta = `<meta http-equiv="Content-Security-Policy" content="${CSP}">`;
const valid = "<!doctype html>\n<html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>Quarterly release process</title><style>\n:root { --ink: #17324d; --gap: 18px; }\nbody { margin: 0; color: var(--ink); font-family: system-ui, sans-serif; }\nmain { max-width: 960px; margin: 0 auto; padding: var(--gap); }\nsvg { width: 100%; height: auto; }\n.box { fill: #e8f1fa; stroke: #17324d; }\n@media (max-width: 640px) { main { padding: 12px; } }\n@media print { body { background: white; } }\n</style></head><body><main><h1>Quarterly release process</h1><p>Illustrative plan, not operational facts.</p>\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 320\" role=\"img\" aria-labelledby=\"diagram-title diagram-desc\">\n<title id=\"diagram-title\">Quarterly release process</title><desc id=\"diagram-desc\">A review leads to approval before the release ships.</desc>\n<defs><marker id=\"arrow\" markerWidth=\"8\" markerHeight=\"8\" refX=\"6\" refY=\"4\" orient=\"auto\"><path d=\"M0 0 L8 4 L0 8 Z\" fill=\"#17324d\"/></marker><linearGradient id=\"shade\"><stop offset=\"0%\" stop-color=\"#eee\"/><stop offset=\"100%\" stop-color=\"#fff\"/></linearGradient><clipPath id=\"bounds\"><rect x=\"0\" y=\"0\" width=\"640\" height=\"320\"/></clipPath><g id=\"symbol\"><circle cx=\"4\" cy=\"4\" r=\"3\"/></g></defs>\n<g clip-path=\"url(#bounds)\"><rect class=\"box\" x=\"40\" y=\"90\" width=\"200\" height=\"80\" rx=\"8\"/><rect x=\"400\" y=\"90\" width=\"200\" height=\"80\" fill=\"url(#shade)\"/>\n<path d=\"M240 130 L400 130\" fill=\"none\" stroke=\"#17324d\" stroke-width=\"2\" marker-end=\"url(#arrow)\"/>\n<text x=\"80\" y=\"135\" font-size=\"18\">Review scope</text><text x=\"440\" y=\"135\" font-size=\"18\">Ship release</text><use href=\"#symbol\" x=\"320\" y=\"200\"/></g>\n</svg><footer><p>Source: illustrative workflow.</p></footer></main></body></html>\n";
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
function workspace(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'archify-editorial-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}
function run(args, env = {}) {
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', runCode, ...args, '--json'], {
    encoding: 'utf8', timeout: 15000, maxBuffer: 512 * 1024, env: { ...process.env, ...env },
  });
  assert.ifError(result.error);
  assert.equal(result.stderr, '');
  return { code: result.status, receipt: JSON.parse(result.stdout) };
}
function check(t, source) {
  const dir = workspace(t);
  const input = path.join(dir, 'candidate.html');
  fs.writeFileSync(input, source);
  return run(['check', input]);
}

test('valid static authored document with CSS variables, print/media, gradients and marker refs passes', (t) => {
  const result = check(t, valid);
  assert.equal(result.code, 0, JSON.stringify(result.receipt));
  assert.equal(result.receipt.ok, true);
  assert.equal(result.receipt.managedCsp, false);
  assert.equal(result.receipt.evidenceKind, 'static-editorial-check');
  assert.equal(result.receipt.browserReview, 'untested');
  assert.equal(result.receipt.visualReview, 'untested');
  assert.equal(result.receipt.input.sha256, sha(valid));
  assert.equal(result.receipt.input.bytes, Buffer.byteLength(valid));
  assert.ok(result.receipt.limitations.some((s) => s.includes('not a sanitizer')));
});

const cases = [
  ['script', (s) => s.replace('<main>', '<main><script>alert(1)</script>')],
  ['foreignObject', (s) => s.replace('<defs>', '<foreignObject><div>bad</div></foreignObject><defs>')],
  ['iframe', (s) => s.replace('<main>', '<main><iframe src="about:blank"></iframe>')],
  ['object', (s) => s.replace('<main>', '<main><object data="x"></object>')],
  ['embed', (s) => s.replace('<main>', '<main><embed src="x">')],
  ['base', (s) => s.replace('<head>', '<head><base href="https://example.invalid/">')],
  ['link', (s) => s.replace('<head>', '<head><link rel="stylesheet" href="x.css">')],
  ['media', (s) => s.replace('<main>', '<main><video src="x.mp4"></video>')],
  ['form', (s) => s.replace('<main>', '<main><form action="x"><input name="x"></form>')],
  ['refresh', (s) => s.replace('<head>', '<head><meta http-equiv="refresh" content="0;url=https://example.invalid">')],
  ['event attribute', (s) => s.replace('<svg ', '<svg onload="alert(1)" ')],
  ['case event attribute', (s) => s.replace('<svg ', '<svg ONLOAD="alert(1)" ')],
  ['external use', (s) => s.replace('href="#symbol"', 'href="https://example.invalid/a.svg#symbol"')],
  ['relative use', (s) => s.replace('href="#symbol"', 'href="a.svg#symbol"')],
  ['data use', (s) => s.replace('href="#symbol"', 'href="data:image/svg+xml,bad"')],
  ['javascript use', (s) => s.replace('href="#symbol"', 'href="javascript:alert(1)"')],
  ['encoded href', (s) => s.replace('href="#symbol"', 'href="&#106;avascript:alert(1)"')],
  ['external marker', (s) => s.replace('url(#arrow)', 'url(https://example.invalid/a.svg#arrow)')],
  ['XML entity declaration', (s) => s.replace('<!doctype html>', '<!DOCTYPE html [<!ENTITY x SYSTEM "file:///etc/passwd">]>')],
  ['processing instruction', (s) => s.replace('<head>', '<head><?xml x?>')],
  ['CDATA', (s) => s.replace('<main>', '<main><![CDATA[x]]>')],
  ['CSS import', (s) => s.replace(':root {', '@import "https://example.invalid/x.css"; :root {')],
  ['CSS font-face', (s) => s.replace(':root {', '@font-face { font-family: test; src: url(x); } :root {')],
  ['CSS escapes', (s) => s.replace('margin: 0;', 'background: u\\72l(x);')],
  ['CSS comment obfuscation', (s) => s.replace('margin: 0;', 'background: u/**/rl(x);')],
  ['CSS external URL', (s) => s.replace('margin: 0;', 'background: url(https://example.invalid/x);')],
  ['CSS relative URL', (s) => s.replace('margin: 0;', 'background: url(../x);')],
  ['CSS image-set', (s) => s.replace('margin: 0;', 'background: image-set("x" 1x);')],
  ['CSS expression', (s) => s.replace('margin: 0;', 'width: expression(alert(1));')],
  ['CSS behavior', (s) => s.replace('margin: 0;', 'behavior: url(x);')],
  ['CSS binding', (s) => s.replace('margin: 0;', '-moz-binding: url(x);')],
  ['CSS custom property resource', (s) => s.replace('--gap: 18px;', '--gap: url(x);')],
  ['CSS nested unsupported rule', (s) => s.replace('padding: 12px;', '@supports (x:y) {body { color:red; }}')],
  ['CSS unclosed block', (s) => s.replace(':root {', ':root {{')],
  ['style attribute external resource', (s) => s.replace('<main>', '<main style="background:url(x)">')],
  ['style attribute encoded resource', (s) => s.replace('<main>', '<main style="background:&#117;rl(x)">')],
  ['duplicate attribute', (s) => s.replace('role="img"', 'role="img" role="img"')],
  ['unquoted attribute', (s) => s.replace('lang="en"', 'lang=en')],
  ['missing attribute whitespace', (s) => s.replace('viewBox="0 0 640 320" role', 'viewBox="0 0 640 320"role')],
  ['misnested HTML', (s) => s.replace('</footer></main>', '</main></footer>')],
  ['implicit p repair', (s) => s.replace('<main>', '<main><p><div>bad</div></p>')],
  ['implicit table repair', (s) => s.replace('<main>', '<main><table><tr><td>bad</td></tr></table>')],
  ['selfclosing nonvoid', (s) => s.replace('<main>', '<main><div/>')],
  ['unclosed comment', (s) => s.replace('</html>', '</html><!--')],
  ['unclosed tag', (s) => s.replace('</html>', '</html><broken')],
  ['unknown entity', (s) => s.replace('Review scope', 'Review &unknown; scope')],
  ['ambiguous entity', (s) => s.replace('Review scope', 'Review &amp scope')],
  ['unknown attr entity', (s) => s.replace('lang="en"', 'lang="&mystery;"')],
  ['duplicate IDs', (s) => s.replace('id="shade"', 'id="arrow"')],
  ['missing IDs', (s) => s.replace('href="#symbol"', 'href="#missing"')],
  ['ARIA missing IDs', (s) => s.replace('diagram-title diagram-desc', 'diagram-title absent')],
  ['fragment outside SVG', (s) => s.replace('<h1>', '<h1 id="outside">').replace('href="#symbol"', 'href="#outside"')],
  ['recursive use', (s) => s.replace('<circle cx="4" cy="4" r="3"/>', '<use href="#symbol"/>')],
  ['placeholder title', (s) => s.replaceAll('Quarterly release process', 'Your title here')],
  ['placeholder description', (s) => s.replace('A review leads to approval before the release ships.', 'Replace description here')],
  ['placeholder label', (s) => s.replace('Review scope', 'TODO review')],
  ['no authored text', (s) => s.replace(/<text[^>]*>[^<]*<\/text>/g, '')],
  ['hidden display', (s) => s.replace('margin: 0;', 'display:none;')],
  ['hidden visibility', (s) => s.replace('margin: 0;', 'visibility:hidden;')],
  ['hidden opacity', (s) => s.replace('margin: 0;', 'opacity:0;')],
  ['zero font', (s) => s.replaceAll('font-size="18"', 'font-size="0"')],
  ['transparent paint', (s) => s.replace('color: var(--ink);', 'color:transparent;')],
  ['missing viewBox', (s) => s.replace('viewBox="0 0 640 320"', '')],
  ['zero viewBox', (s) => s.replace('0 0 640 320', '0 0 0 320')],
  ['negative viewBox', (s) => s.replace('0 0 640 320', '0 0 -640 320')],
  ['infinite viewBox', (s) => s.replace('0 0 640 320', '0 0 Infinity 320')],
  ['NaN geometry', (s) => s.replace('cx="4"', 'cx="NaN"')],
  ['huge geometry', (s) => s.replace('cx="4"', 'cx="1e308"')],
  ['negative size', (s) => s.replace('width="200"', 'width="-1"')],
  ['scalar misuse', (s) => s.replace('r="3"', 'r="3 4"')],
  ['bad path', (s) => s.replace('M240 130 L400 130', 'M240 130 L400')],
  ['bad arc', (s) => s.replace('M240 130 L400 130', 'M240 130 A20 20 0 2 0 400 130')],
  ['bad transform', (s) => s.replace('<g clip-path', '<g transform="matrix(1 2)" clip-path')],
  ['second SVG', (s) => s.replace('</svg>', '</svg><svg viewBox="0 0 10 10"></svg>')],
  ['nested SVG', (s) => s.replace('<defs>', '<svg viewBox="0 0 10 10"></svg><defs>')],
  ['wrong SVG namespace', (s) => s.replace('http://www.w3.org/2000/svg', 'https://example.invalid/svg')],
  ['NUL', (s) => s.replace('Review scope', 'Review\u0000scope')],
  ['source custom CSP', (s) => s.replace('<head>', '<head><meta http-equiv="Content-Security-Policy" content="default-src *">')],
  ['duplicate managed CSP', (s) => s.replace('<head>', `<head>${meta}${meta}`)],
  ['late managed CSP', (s) => s.replace('<title>Quarterly', `${meta}<title>Quarterly`)],
];
for (const [name, mutate] of cases) {
  test(`reject ${name}`, (t) => {
    const result = check(t, mutate(valid));
    assert.equal(result.code, 1, JSON.stringify(result.receipt));
    assert.equal(result.receipt.ok, false);
    assert.equal(result.receipt.browserReview, 'untested');
  });
}

test('bounded input, invalid UTF-8, and non-regular input fail without output', (t) => {
  const dir = workspace(t);
  for (const bytes of [Buffer.alloc(1024 * 1024 + 1, 65), Buffer.alloc(0), Buffer.from([0xff, 0xfe])]) {
    fs.writeFileSync(path.join(dir, 'bad.html'), bytes);
    assert.equal(run(['check', path.join(dir, 'bad.html')]).code, 1);
  }
  assert.equal(run(['check', dir]).code, 1);
});

test('delivery checks exact bytes, inserts CSP first, rechecks, creates only HTML and refuses replacement', (t) => {
  const dir = workspace(t);
  const input = path.join(dir, 'source.html');
  const output = path.join(dir, 'delivered.html');
  fs.writeFileSync(input, valid);
  const result = run(['deliver', input, output]);
  assert.equal(result.code, 0, JSON.stringify(result.receipt));
  const artifact = fs.readFileSync(output);
  assert.equal(artifact.toString(), valid.replace('<head>', `<head>${meta}`));
  assert.equal(result.receipt.input.sha256, sha(fs.readFileSync(input)));
  assert.equal(result.receipt.artifact.sha256, sha(artifact));
  assert.equal(result.receipt.artifact.bytes, artifact.length);
  assert.equal(result.receipt.managedCsp, true);
  assert.deepEqual(fs.readdirSync(dir).sort(), ['delivered.html', 'source.html']);
  const recheck = run(['check', output]);
  assert.equal(recheck.code, 0);
  assert.equal(recheck.receipt.managedCsp, true);
  const direct = spawnSync(process.env.ARCHIFY_PYTHON || 'python3', ['-I', helper, output, '--json'], {encoding:'utf8',timeout:10000});
  assert.equal(direct.status, 0, direct.stderr + direct.stdout);
  assert.equal(JSON.parse(direct.stdout).managedCsp, true);
  assert.equal(run(['deliver', input, output]).code, 1);
  assert.deepEqual(fs.readFileSync(output), artifact);
  assert.equal(run(['deliver', output, path.join(dir, 'second.html')]).code, 1, 'source CSP is rejected by deliver');
  assert.equal(fs.existsSync(path.join(dir, 'second.html')), false);
});

test('failed source leaves no artifact; invalid output suffix, aliases and symlinks rejected', (t) => {
  const dir = workspace(t), source = path.join(dir,'source.html'), output = path.join(dir,'out.html');
  fs.writeFileSync(source, valid.replace('Review scope', 'TODO'));
  assert.equal(run(['deliver', source, output]).code, 1);
  assert.equal(fs.existsSync(output), false);
  fs.writeFileSync(source, valid);
  assert.equal(run(['deliver', source, path.join(dir,'out.svg')]).code, 1);
  assert.equal(run(['deliver', source, source]).code, 1);
  fs.linkSync(source, output);
  assert.equal(run(['deliver', source, output]).code, 1);
  fs.unlinkSync(output);
  fs.symlinkSync(source, output);
  assert.equal(run(['deliver', source, output]).code, 1);
  assert.equal(run(['check', output]).code, 1);
  fs.unlinkSync(output);
  fs.symlinkSync(path.join(dir,'absent'), output);
  assert.equal(run(['deliver', source, output]).code, 1);
  fs.mkdirSync(path.join(dir,'real'));
  fs.symlinkSync(path.join(dir,'real'), path.join(dir,'alias'));
  assert.equal(run(['deliver', source, path.join(dir,'alias','out.html')]).code, 1);
  assert.equal(fs.readFileSync(source, 'utf8'), valid);
  assert.ok(!fs.readdirSync(dir).some((name) => name.startsWith('.archify-editorial-')));
});

test('CRLF document offsets, quoted entities and safe complete comments stay exact', (t) => {
  const dir=workspace(t), source=path.join(dir,'source.html'), output=path.join(dir,'out.html');
  const content=valid.replaceAll('\n', '\r\n').replace('<body>', '<body><!-- authored static diagram -->').replace('Review scope','Review &amp; approve');
  fs.writeFileSync(source,content);
  const result=run(['deliver',source,output]);
  assert.equal(result.code,0,JSON.stringify(result.receipt));
  assert.equal(fs.readFileSync(output,'utf8'),content.replace('<head>',`<head>${meta}`));
});

test('two concurrent deliverers publish one complete winner and leave no scratch', async (t) => {
  const dir=workspace(t), source=path.join(dir,'source.html'), output=path.join(dir,'out.html');
  fs.writeFileSync(source,valid);
  const launch=()=>new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,['--input-type=module','-e',runCode,'deliver',source,output,'--json']);
    let stdout=''; child.stdout.on('data',(chunk)=>stdout+=chunk);
    child.on('error',reject); child.on('close',(code)=>resolve({code,receipt:JSON.parse(stdout)}));
  });
  const results=await Promise.all([launch(),launch()]);
  assert.deepEqual(results.map((r)=>r.code).sort(),[0,1]);
  assert.equal(fs.readFileSync(output,'utf8'),valid.replace('<head>',`<head>${meta}`));
  assert.deepEqual(fs.readdirSync(dir).sort(),['out.html','source.html']);
});

test('helper start errors and unknown flags fail closed with machine receipts', (t) => {
  const dir=workspace(t), source=path.join(dir,'source.html'); fs.writeFileSync(source,valid);
  assert.equal(run(['check',source],{ARCHIFY_PYTHON:path.join(dir,'missing-python')}).code,2);
  assert.equal(run(['check',source,'--open']).code,2);
  assert.equal(run(['deliver',source]).code,2);
  assert.equal(run(['check',source,'--json']).code,2);
});

test('node count and nesting bounds reject oversized trees', (t) => {
  assert.equal(check(t, valid.replace('<main>', '<main>' + '<span></span>'.repeat(12001))).code, 1);
  assert.equal(check(t, valid.replace('<main>', '<main>' + '<div>'.repeat(100)).replace('</main>', '</div>'.repeat(100) + '</main>')).code, 1);
});

test('managed CSP cannot be hidden in a comment to claim delivery evidence', (t) => {
  const result = check(t, valid.replace('<head>', `<head><!-- ${meta} -->`));
  assert.equal(result.code, 1);
});

test('attribute entities and explicit signed decimal path numbers pass', (t) => {
  const result = check(t, valid.replace('<h1>', '<h1 aria-label="Review &amp; approve">').replace('M240 130 L400 130', 'M240.5 130.0 L+400 1.3e2'));
  assert.equal(result.code, 0, JSON.stringify(result.receipt));
});

test('helper malformed output and bounded output are fail-closed process errors', (t) => {
  const dir=workspace(t), source=path.join(dir,'source.html'); fs.writeFileSync(source,valid);
  for (const body of ['process.stdout.write("not JSON");', 'process.stdout.write("x".repeat(300000));']) {
    const executable=path.join(dir,'override');
    fs.writeFileSync(executable,`#!${process.execPath}\n${body}\n`,{mode:0o700});
    const result=run(['check',source],{ARCHIFY_PYTHON:executable});
    assert.equal(result.code,2);
    assert.equal(result.receipt.ok,false);
  }
});

test('helper timeout stops a stuck executable and emits a machine error', (t) => {
  const dir=workspace(t), source=path.join(dir,'source.html'), executable=path.join(dir,'override');
  fs.writeFileSync(source,valid);
  fs.writeFileSync(executable,`#!${process.execPath}\nsetInterval(()=>{},1000);\n`,{mode:0o700});
  const result=run(['check',source],{ARCHIFY_PYTHON:executable});
  assert.equal(result.code,2);
  assert.match(result.receipt.error,/10-second limit/);
});

for (const [name, mutate] of [
  ['malformed comment delimiter', (s)=>s.replace('<body>','<body><!-- note --!>')],
  ['malformed path exponent', (s)=>s.replace('M240 130 L400 130','M240e 130 L400 130')],
  ['invalid numeric attribute entity', (s)=>s.replace('lang="en"','lang="&#xD800;"')],
  ['zero-percent opacity', (s)=>s.replace('margin: 0;','opacity:0%;')],
  ['negative opacity', (s)=>s.replace('margin: 0;','opacity:-1;')],
]) {
  test(`reject ${name}`, (t)=>assert.equal(check(t,mutate(valid)).code,1));
}


test('static scroll-region keyboard access permits only tabindex=0', (t) => {
  const region = valid.replace('<main>', '<main><div class="figure-scroll" role="region" tabindex="0">').replace('</main>', '</div></main>');
  const passed = check(t, region);
  assert.equal(passed.code, 0, JSON.stringify(passed.receipt));
  for (const value of ['-1','1','0;alert(1)','']) {
    assert.equal(check(t, region.replace('tabindex="0"', `tabindex="${value}"`)).code, 1);
  }
});


test('bounded editorial SVG marker and color-scheme are inert supported metadata', (t) => {
  const source=valid.replace('<svg ', '<svg data-archify-editorial="wardley" ').replace('margin: 0;', 'color-scheme: light dark; margin: 0;');
  assert.equal(check(t,source).code,0);
  for (const value of ['','https://example.invalid','a'.repeat(65),'wardley onclick=alert(1)']) {
    assert.equal(check(t,source.replace('data-archify-editorial="wardley"',`data-archify-editorial="${value}"`)).code,1);
  }
  assert.equal(check(t,valid.replace('<svg ', '<svg data-other="value" ')).code,1);
  assert.equal(check(t,valid.replace('<main>', '<main data-archify-editorial="wardley">')).code,1);
  assert.equal(check(t,valid.replace('<svg ', '<svg tabindex="0" ')).code,1);
  assert.equal(check(t,source.replace('color-scheme: light dark;', 'color-scheme: url(https://example.invalid);')).code,1);
});


test('acyclic exponential use fanout is rejected without browser execution', (t) => {
  let groups='<g id="n0"><rect width="10" height="10"/></g>';
  for (let n=1;n<=32;n++) groups+=`<g id="n${n}"><use href="#n${n-1}"/><use href="#n${n-1}"/></g>`;
  const source=valid.replace('<defs>',`<defs>${groups}`).replace('href="#symbol"','href="#n32"');
  const result=check(t,source);
  assert.equal(result.code,1);
  assert.match(result.receipt.error,/may not contain further use/);
});

test('wide direct SVG cloning is bounded by nodes and estimated bytes', (t) => {
  const shapes='<rect width="10" height="10"/>'.repeat(1000);
  const nodeHeavy=valid.replace('<g id="symbol"><circle cx="4" cy="4" r="3"/></g>',`<g id="symbol">${shapes}</g>`).replace('<use href="#symbol" x="320" y="200"/>','<use href="#symbol"/>'.repeat(30));
  const nodeResult=check(t,nodeHeavy);
  assert.equal(nodeResult.code,1);
  assert.match(nodeResult.receipt.error,/expansion exceeds/);
  const byteHeavy=valid.replace('<g id="symbol"><circle cx="4" cy="4" r="3"/></g>',`<g id="symbol"><text x="0" y="20">${'A'.repeat(50000)}</text></g>`).replace('<use href="#symbol" x="320" y="200"/>','<use href="#symbol"/>'.repeat(200));
  const byteResult=check(t,byteHeavy);
  assert.equal(byteResult.code,1);
  assert.match(byteResult.receipt.error,/expansion exceeds/);
});

test('FIFO source is rejected before any blocking read or delivery', (t) => {
  const dir=workspace(t), fifo=path.join(dir,'pipe.html'), output=path.join(dir,'out.html');
  const made=spawnSync(process.env.ARCHIFY_PYTHON || 'python3',['-I','-B','-c','import os,sys;os.mkfifo(sys.argv[1])',fifo],{encoding:'utf8',timeout:2000});
  assert.equal(made.status,0,made.stderr);
  const start=Date.now();
  assert.equal(run(['check',fifo]).code,1);
  assert.equal(run(['deliver',fifo,output]).code,1);
  assert.ok(Date.now()-start<5000,'FIFO was refused without opening a writer');
  assert.equal(fs.existsSync(output),false);
});
