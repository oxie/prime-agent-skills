import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const cli=path.join(root,'bin/archify.mjs');
function run(args){return spawnSync(process.execPath,[cli,...args],{encoding:'utf8',timeout:20000,maxBuffer:4*1024*1024});}
test('one CLI distinguishes typed renderers from 39 editorial layouts',()=>{
 const r=run(['catalogue','--json']);assert.equal(r.status,0,r.stderr);const c=JSON.parse(r.stdout);
 assert.deepEqual(c.typedRenderers,['architecture','workflow','sequence','dataflow','lifecycle']);
 const entries=Array.isArray(c.editorial)?c.editorial:c.editorial.types || c.editorial.entries;
 assert.ok(Array.isArray(entries),'catalogue must expose entries');assert.equal(entries.length,39);
 assert.equal(new Set(entries.map(e=>e.id)).size,39);
 for(const e of entries){assert.ok(/^[a-z][a-z0-9-]+$/.test(e.id));const p=path.resolve(root,e.reference);
  assert.ok(p.startsWith(root+path.sep));assert.ok(fs.statSync(p).size>100,e.id);}
 assert.match(c.note,/not additional typed renderers/);
});
test('unified CLI help exposes all branches without spawning a browser',()=>{
 const r=run(['--help']);assert.equal(r.status,0);for(const s of ['catalogue','import mermaid|drawio','editorial check','editorial deliver','editorial visual-check','editorial export'])assert.ok(r.stdout.includes(s),s);
});
test('three complete editorial examples check and deliver without overwrite',t=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'archify-unified-'));t.after(()=>fs.rmSync(temp,{recursive:true,force:true}));
 for(const name of ['wardley','journey','bar']){
  const source=path.join(root,'editorial/examples',name+'.html');const original=fs.readFileSync(source);
  const checked=run(['editorial','check',source,'--json']);assert.equal(checked.status,0,checked.stdout+checked.stderr);assert.equal(JSON.parse(checked.stdout).ok,true);
  const output=path.join(temp,name+'.html');const delivered=run(['editorial','deliver',source,output,'--json']);
  assert.equal(delivered.status,0,delivered.stdout+delivered.stderr);assert.ok(fs.existsSync(output));
  const bytes=fs.readFileSync(output);assert.match(bytes.toString(),/Content-Security-Policy/);
  const again=run(['editorial','deliver',source,output,'--json']);assert.notEqual(again.status,0);assert.deepEqual(fs.readFileSync(output),bytes);assert.deepEqual(fs.readFileSync(source),original);
  const trusted=run(['editorial','check',output,'--json']);assert.equal(trusted.status,0,trusted.stdout+trusted.stderr);
 }
});
test('only one skill entry point exists within expanded package',()=>{
 const hits=[];function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(e.isDirectory())walk(path.join(dir,e.name));else if(e.name==='SKILL.md')hits.push(path.relative(root,path.join(dir,e.name)));}}walk(root);
 assert.deepEqual(hits,['SKILL.md']);
});

test('doctor separates unavailable Python from missing files',()=>{
 const r=spawnSync(process.execPath,[cli,'doctor'],{encoding:'utf8',timeout:20000,env:{...process.env,ARCHIFY_PYTHON:path.join(root,'not-a-python-executable')}});
 assert.notEqual(r.status,0);assert.match(r.stdout+r.stderr,/Python >=3\.10/);
 assert.doesNotMatch(r.stdout+r.stderr,/required files missing/);
 assert.match(r.stdout+r.stderr,/1 runtime check failed/);
});
