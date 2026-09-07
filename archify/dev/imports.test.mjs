import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync, execFile } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, readdirSync, statSync, existsSync, symlinkSync, linkSync, mkdirSync, truncateSync, chmodSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { deflateRawSync } from 'node:zlib';

const root = fileURLToPath(new URL('../', import.meta.url));
const work = mkdtempSync(join(tmpdir(), 'archify-imports-test-'));
const moduleURL = pathToFileURL(join(root, 'bin/import-diagram.mjs')).href;
const runner = join(work, 'seam.mjs');
writeFileSync(runner, `import { runImport } from ${JSON.stringify(moduleURL)};\nconst a=process.argv.slice(2);\nif(a.shift()!=='import') process.exitCode=2; else process.exitCode=await runImport(a);\n`);
const realCLI = process.env.ARCHIFY_TEST_CLI || join(root, 'bin/archify.mjs');
const command = existsSync(realCLI) ? realCLI : runner;
const modes = [...new Set([runner, command])];
const xml = '<mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/><mxCell id="a" value="Start &amp; ready" vertex="1" parent="1"><mxGeometry x="10" y="20" width="80" height="30"/></mxCell><mxCell id="b" value="End" vertex="1" parent="1"/><mxCell id="e" edge="1" source="a" target="b" value="go" parent="1"/></root></mxGraphModel>';
let serial = 0;
function fixture(text, suffix='.mmd') { const p=join(work, `${serial++}${suffix}`); writeFileSync(p,text); return p; }
function run(args, extra={}) {
  const { cli=command, env={}, ...rest } = extra;
  const result=spawnSync(process.execPath,[cli,'import',...args],{encoding:'utf8',timeout:15000,maxBuffer:20*1024*1024,env:{...process.env,...env},...rest});
  assert.ifError(result.error);
  assert.equal(result.signal,null);
  return result;
}
function ok(result) { assert.equal(result.status,0,result.stderr); assert.equal(result.stderr,''); return JSON.parse(result.stdout); }
function bad(result, code=2, error) { assert.equal(result.status,code,result.stdout+result.stderr); assert.equal(result.stdout,''); const receipt=JSON.parse(result.stderr); assert.equal(receipt.ok,false); if(error) assert.equal(receipt.error,error); return receipt; }

test.after(()=>rmSync(work,{recursive:true,force:true}));
test('root CLI import dispatch seam and direct module preserve flowchart IR',()=>{
  const input=fixture('flowchart LR\nsubgraph box[Boundary]\nA[Client] -->|request| B{Ready?}\nend\n');
  for (const cli of modes) {
    const ir=ok(run(['mermaid',input],{cli}));
    assert.equal(ir.source,input); assert.equal(ir.diagrams_total,1);
    const d=ir.diagrams[0]; assert.equal(d.kind,'flowchart'); assert.equal(d.direction,'LR');
    assert.deepEqual(d.edges.map(e=>[e.source,e.target,e.label]),[['A','B','request']]);
    assert.equal(d.nodes.find(n=>n.id==='B').shape,'rhombus');
    assert.equal(d.nodes.find(n=>n.id==='A').parent,'box');
  }
});
test('sequence grammar retains actor, message order, fragment and notes',()=>{
  const d=ok(run(['mermaid',fixture('sequenceDiagram\nactor A as Alice\nparticipant B as Backend\nalt allowed\nA->>B: request\nelse denied\nB-->>A: response\nend\nNote over A: offline\n')])).diagrams[0];
  assert.equal(d.kind,'sequenceDiagram'); assert.equal(d.nodes[0].shape,'actor');
  assert.deepEqual(d.edges.map(e=>[e.source,e.target,e.order,e.style]),[['A','B',1,'solid'],['B','A',2,'dashed']]);
  assert.deepEqual(d.fragments[0].regions,['denied']); assert.deepEqual(d.notes,['offline']);
});
test('state grammar retains start/end and transitions',()=>{
  const d=ok(run(['mermaid',fixture('stateDiagram-v2\n[*] --> Idle\nIdle --> Busy: work\nBusy --> [*]\n')])).diagrams[0];
  assert.equal(d.kind,'stateDiagram-v2'); assert.equal(d.edges[1].label,'work');
  assert.equal(d.nodes.filter(n=>n.shape==='start').length,1); assert.equal(d.nodes.filter(n=>n.shape==='end').length,1);
});
test('ER grammar retains fields and cardinality text',()=>{
  const d=ok(run(['mermaid',fixture('erDiagram\nUSER {\n string id PK\n}\nUSER ||--o{ ORDER : places\n')])).diagrams[0];
  assert.equal(d.kind,'erDiagram'); assert.deepEqual(d.nodes[0].fields,['string id PK']);
  assert.equal(d.edges[0].label,'|| -- o{ · places'); assert.equal(d.edges[0].arrowhead,'cardinality');
});
test('Markdown selectors preserve block count and reject unavailable index',()=>{
  const input=fixture('Text\n```mermaid\nflowchart TD\nA-->B\n```\n```mermaid\nstateDiagram-v2\nA --> B\n```\n','.md');
  assert.equal(ok(run(['mermaid',input])).diagrams.length,1);
  assert.equal(ok(run(['mermaid',input,'--diagram','all'])).diagrams.length,2);
  assert.equal(ok(run(['mermaid',input,'--diagram','1'])).diagrams[0].index,1);
  bad(run(['mermaid',input,'--diagram','2']));
});
test('unsupported, malformed, invalid UTF8 and unfinished fences fail',()=>{
  for(const text of ['pie\n"A": 1','flowchart TD\nA -->','flowchart TD\nA["unterminated','gantt\ndateFormat YYYY']) bad(run(['mermaid',fixture(text)]));
  bad(run(['mermaid',fixture(Buffer.from([255]),'.mmd')]));
  bad(run(['mermaid',fixture('```mermaid\nflowchart TD\nA-->B','.md')]));
});
test('adversarial labels and click/style/directive payloads remain inert',()=>{
  const sentinel=join(work,'NEVER-CREATED');
  const input=fixture(`%%{init: {"securityLevel":"loose"}}%%\nflowchart TD\nA["&lt;script&gt;alert(1)&lt;/script&gt;"] --> B["$(touch ${sentinel})"]\nclick A "javascript:alert(1)"\nstyle A fill:url(https://invalid.example/never)\n`);
  const d=ok(run(['mermaid',input])).diagrams[0];
  assert.equal(d.nodes[0].label,'<script>alert(1)</script>');
  assert.deepEqual(d.discarded,{style_directives:1,click_handlers:1});
  assert.equal(existsSync(sentinel),false);
  assert.ok(!JSON.stringify(d).includes('javascript:')); assert.ok(!JSON.stringify(d).includes('invalid.example'));
});
test('Mermaid source, node and edge caps reject oversized inputs',()=>{
  bad(run(['mermaid',fixture('x'.repeat(4*1024*1024+1))]));
  bad(run(['mermaid',fixture('flowchart TD\n'+Array.from({length:2001},(_,i)=>`N${i}`).join('\n'))]));
  bad(run(['mermaid',fixture('flowchart TD\n'+'A-->B\n'.repeat(5001))]));
});
test('draw.io raw and compressed sources preserve nodes/edges',()=>{
  const packed=deflateRawSync(Buffer.from(encodeURIComponent(xml))).toString('base64');
  for(const text of [xml,packed,`<mxfile><diagram id="p" name="Test">${packed}</diagram></mxfile>`]) {
    const ir=ok(run(['drawio',fixture(text,'.drawio')]));
    assert.equal(ir.pages[0].nodes[0].label,'Start & ready');
    assert.deepEqual(ir.pages[0].edges.map(e=>[e.source,e.target,e.label]),[['a','b','go']]);
  }
});
test('draw.io page selection and inert UserObject link',()=>{
  const linked=xml.replace('<mxCell id="b" value="End" vertex="1" parent="1"/>','<UserObject id="b" label="End" link="javascript:alert(1)"><mxCell vertex="1" parent="1"/></UserObject>');
  const input=fixture(`<mxfile><diagram name="one">${xml}</diagram><diagram name="two">${linked}</diagram></mxfile>`,'.drawio');
  assert.equal(ok(run(['drawio',input])).pages.length,1);
  assert.equal(ok(run(['drawio',input,'--page','all'])).pages.length,2);
  assert.equal(ok(run(['drawio',input,'--page','two'])).pages[0].nodes[1].link,'javascript:alert(1)');
  bad(run(['drawio',input,'--page','missing']));
});
test('draw.io rejects XML declarations, malformed XML and missing embedded data',()=>{
  for(const text of ['<!DOCTYPE mxGraphModel [<!ENTITY x SYSTEM "file:///etc/passwd">]>'+xml, xml.replace('ready','&unknown;'), '<mxGraphModel>','<svg/>']) bad(run(['drawio',fixture(text,'.drawio')]));
  const packed=deflateRawSync(Buffer.from('<!DOCTYPE mxGraphModel>'+xml)).toString('base64');
  bad(run(['drawio',fixture(`<mxfile><diagram>${packed}</diagram></mxfile>`,'.drawio')]));
});
test('draw.io actual 32MiB source and 64MiB decompression caps',()=>{
  const input=fixture('', '.drawio'); truncateSync(input,32*1024*1024+1);
  bad(run(['drawio',input]));
  const bomb=deflateRawSync(Buffer.alloc(64*1024*1024+1,65)).toString('base64');
  const result=bad(run(['drawio',fixture(`<mxfile><diagram>${bomb}</diagram></mxfile>`,'.drawio')]));
  assert.match(result.detail,/64 MiB limit/);
});
test('new JSON output is exact IR and default creates no sidecar',()=>{
  const input=fixture('flowchart TD\nA-->B'); const output=join(work,'new.json');
  const baseline=run(['mermaid',input]); ok(baseline);
  assert.equal(existsSync(input+'.json'),false);
  const result=run(['mermaid',input,'--out',output]); assert.equal(result.status,0,result.stderr); assert.equal(result.stdout,'');
  assert.equal(readFileSync(output,'utf8'),baseline.stdout);
});
test('output rejects overwrite, aliases, symlinks, parents, directory and wrong suffix',()=>{
  const input=fixture(xml,'.json'); const before=readFileSync(input);
  bad(run(['drawio',input,'--out',input]));
  const existing=fixture('user data','.json'); bad(run(['drawio',input,'--out',existing])); assert.equal(readFileSync(existing,'utf8'),'user data');
  const linked=join(work,'link.json'); symlinkSync(existing,linked); bad(run(['drawio',input,'--out',linked]));
  const dangling=join(work,'dangling.json'); symlinkSync(join(work,'absent'),dangling); bad(run(['drawio',input,'--out',dangling]));
  const hard=join(work,'hard.json'); linkSync(input,hard); bad(run(['drawio',input,'--out',hard]));
  const directory=join(work,'directory.json'); mkdirSync(directory); bad(run(['drawio',input,'--out',directory]));
  const parent=join(work,'parent'); symlinkSync(work,parent); bad(run(['drawio',input,'--out',join(parent,'absent.json')]));
  bad(run(['drawio',input,'--out',join(work,'new.txt')]));
  assert.deepEqual(readFileSync(input),before);
});
test('input rejects symlink, directory, FIFO-like non-regular and missing paths',()=>{
  const input=fixture('flowchart TD\nA-->B'); const link=join(work,'input-link.mmd'); symlinkSync(input,link);
  for(const path of [link,work,join(work,'missing.mmd'),'/dev/null']) bad(run(['mermaid',path]));
});
test('help and strict documented options',()=>{
  for(const args of [['--help'],['mermaid','--help'],['drawio','--help']]) {
    const result=run(args); assert.equal(result.status,0); assert.match(result.stdout,/NOT Archify typed JSON/);
  }
  const input=fixture('flowchart TD\nA-->B');
  for(const options of [['--oops'],['--out'],['--json'],['--page','all'],['--diagram','bad'],['--timeout-ms','0'],['--timeout-ms','30001'],['--timeout-ms','1e3'],['--diagram','0','--diagram','0']]) bad(run(['mermaid',input,...options]));
  bad(run(['unknown',input])); bad(run([]));
});
test('missing Python, extractor failure, timeout and output-limit receipts preserve files',()=>{
  const input=fixture('flowchart TD\nA-->B'); const output=join(work,'blocked.json');
  bad(run(['mermaid',input,'--out',output],{env:{ARCHIFY_PYTHON:join(work,'missing-python')}}),3,'python-blocked');
  bad(run(['mermaid',input],{env:{ARCHIFY_PYTHON:process.execPath}}),2,'extractor-failed');
  bad(run(['mermaid',input,'--timeout-ms','1','--out',output]),124,'timeout');
  const noisy=join(work,'noisy-python'); writeFileSync(noisy,'#!/usr/bin/env python3\nimport sys\nsys.stdout.write("x" * (17 * 1024 * 1024))\n'); chmodSync(noisy,0o700);
  bad(run(['mermaid',input,'--out',output],{env:{ARCHIFY_PYTHON:noisy}}),2,'output-limit');
  const invalid=join(work,'invalid-python'); writeFileSync(invalid,'#!/usr/bin/env python3\nprint("not JSON")\n'); chmodSync(invalid,0o700);
  bad(run(['mermaid',input,'--out',output],{env:{ARCHIFY_PYTHON:invalid}}),2,'invalid-ir');
  assert.equal(existsSync(output),false);
});

function pngText(value) {
  const body=Buffer.concat([Buffer.from('mxfile\0'),value]);
  const size=Buffer.alloc(4); size.writeUInt32BE(body.length);
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),size,Buffer.from('tEXt'),body,Buffer.alloc(4)]);
}
test('draw.io PNG/SVG embedded metadata imports without rendering',()=>{
  const escaped=xml.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  for(const [value,suffix] of [[pngText(Buffer.from(encodeURIComponent(xml))),'.png'],[`<svg content="${escaped}"/>`,'.svg']]) {
    assert.equal(ok(run(['drawio',fixture(value,suffix)])).pages[0].nodes[0].label,'Start & ready');
  }
});
test('draw.io rejects raw, deflated, percent-encoded and embedded invalid UTF8 without output',()=>{
  const invalid=Buffer.concat([Buffer.from(xml.replace('Start &amp; ready','LABEL').split('LABEL')[0]),Buffer.from([255]),Buffer.from(xml.replace('Start &amp; ready','LABEL').split('LABEL')[1])]);
  const deflated=deflateRawSync(invalid).toString('base64');
  const percent=deflateRawSync(Buffer.from(encodeURIComponent(xml).replace('Start','%FF'))).toString('base64');
  const output=join(work,'invalid-encoding.json');
  for(const value of [invalid,deflated,`<mxfile><diagram>${deflated}</diagram></mxfile>`,percent,pngText(invalid),pngText(Buffer.from(encodeURIComponent(xml).replace('Start','%FF')))]) {
    const receipt=bad(run(['drawio',fixture(value,'.drawio'),'--out',output]));
    assert.match(receipt.detail,/invalid UTF-8/);
    assert.equal(existsSync(output),false);
  }
});

function runAsync(args) {
  return new Promise((done,reject)=>{
    execFile(process.execPath,[command,'import',...args],{encoding:'utf8',timeout:15000,maxBuffer:20*1024*1024,env:process.env},(error,stdout,stderr)=>{
      if(error && (error.killed || typeof error.code!=='number')) { reject(error); return; }
      done({status:error?.code ?? 0,signal:null,stdout,stderr});
    });
  });
}
function scratchFiles() { return readdirSync(work).filter(name=>name.startsWith('.archify-import-')); }
function faultRunner(patch) {
  const p=join(work,`fault-${serial++}.mjs`);
  writeFileSync(p,`import fs from 'node:fs';\nimport { syncBuiltinESMExports } from 'node:module';\n${patch}\nsyncBuiltinESMExports();\nconst {runImport}=await import(${JSON.stringify(moduleURL)});\nprocess.exitCode=await runImport(process.argv.slice(3));\n`);
  return p;
}
test('concurrent publishers never clobber and remove owned scratch files',async()=>{
  const a=fixture('flowchart TD\nA[Alpha]-->B');
  const b=fixture('flowchart TD\nA[Beta]-->B');
  const output=join(work,'concurrent.json');
  const results=await Promise.all([runAsync(['mermaid',a,'--out',output]),runAsync(['mermaid',b,'--out',output])]);
  assert.deepEqual(results.map(r=>r.status).sort(),[0,2]);
  const winner=results.findIndex(r=>r.status===0);
  bad(results[1-winner]);
  assert.equal(JSON.parse(readFileSync(output,'utf8')).source,[a,b][winner]);
  assert.equal(statSync(output).mode & 0o777,0o600);
  assert.deepEqual(scratchFiles(),[]);
});
test('failed fsync never publishes partial JSON and cleans scratch',()=>{
  const input=fixture('flowchart TD\nA-->B'); const output=join(work,'fsync-failed.json');
  const cli=faultRunner(`const originalOpen=fs.promises.open; fs.promises.open=async (...args)=>{const file=await originalOpen(...args); file.sync=async()=>{throw new Error('synthetic fsync failure');}; return file;};`);
  const receipt=bad(run(['mermaid',input,'--out',output],{cli}),2,'output');
  assert.match(receipt.detail,/synthetic fsync failure/);
  assert.equal(existsSync(output),false); assert.deepEqual(scratchFiles(),[]);
});
test('exclusive publication preserves a competing destination created after preflight',()=>{
  const input=fixture('flowchart TD\nA-->B'); const output=join(work,'raced.json');
  const cli=faultRunner(`const originalLink=fs.promises.link; fs.promises.link=async (source,destination)=>{JSON.parse(await fs.promises.readFile(source,'utf8')); await fs.promises.writeFile(destination,'competing user data',{flag:'wx'}); return originalLink(source,destination);};`);
  bad(run(['mermaid',input,'--out',output],{cli}),2,'output');
  assert.equal(readFileSync(output,'utf8'),'competing user data'); assert.deepEqual(scratchFiles(),[]);
});
test('cleanup failure reports truth after successful publication, never removes destination',()=>{
  const input=fixture('flowchart TD\nA-->B'); const output=join(work,'cleanup-failed.json');
  const cli=faultRunner(`fs.promises.unlink=async()=>{throw new Error('synthetic cleanup failure');};`);
  const receipt=bad(run(['mermaid',input,'--out',output],{cli}),2,'output-cleanup');
  assert.match(receipt.detail,/complete output WAS published/);
  assert.match(receipt.detail,/synthetic cleanup failure/);
  assert.equal(JSON.parse(readFileSync(output,'utf8')).source,input);
  const remaining=scratchFiles(); assert.equal(remaining.length,1);
  assert.equal(statSync(join(work,remaining[0])).ino,statSync(output).ino);
  rmSync(join(work,remaining[0]));
});
