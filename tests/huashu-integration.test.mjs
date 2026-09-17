import {beforeHiggsfieldFile} from './helpers/higgsfield-snapshot.mjs';
import {beforeExplainerFile} from './helpers/explainer-snapshot.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('Video removes unsupported Hyperframes entrypoint and universal guarantees',()=>{
 for(const p of ['marketingskills/skills/video/SKILL.md','marketingskills/tools/integrations/hyperframes.md']){
  const s=read(p);assert.doesNotMatch(s,/import \{ render \} from ["']hyperframes/);
  assert.doesNotMatch(s,/AI models generate better HTML|Same input always produces identical output|same input always produces identical output/);
  assert.match(s,/seekable/);assert.match(s,/version/);
 }
});
test('UI demonstration guidance has an existing-owner route',()=>{
 assert.match(read('marketingskills/skills/video/SKILL.md'),/references\/ui-demo-delivery\.md/);
});

import os from 'node:os';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {huashuTransitions,beforeHuashuFile} from './helpers/huashu-snapshot.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const flat=s=>s.replace(/\s+/g,' ').toLowerCase();
const contracts={
 'marketingskills/skills/video/references/ui-demo-delivery.md':['staged response is not a successful live operation','original coordinates','backward seek','audio is optional','original approved source','metadata alone cannot prove this','unique owned scratch paths','never interpreter source'],
 'marketingskills/tools/integrations/hyperframes.md':['published `hyperframes` 0.8.40','not a root JavaScript `render` export','companion agent skills outside','local rendering is not automatically offline','commands above were source-checked, not executed here','does not guarantee byte-identical output'],
 'hallmark/references/ui-localization.md':['CJK is not one punctuation or spacing system','Preserve supplied punctuation','character by character','no font download or installation','not apply Chinese line-breaking rules wholesale','optional enhancements','not tested']
};
function check(s,clauses){for(const c of clauses)assert.ok(flat(s).includes(flat(c)),c);}
for(const [p,clauses] of Object.entries(contracts))test('scoped clauses and deletion controls: '+p,()=>{
 const s=read(p);check(s,clauses);for(const c of clauses)assert.throws(()=>check(flat(s).split(flat(c)).join('REMOVED'),clauses),{name:'AssertionError'},c);
});
test('exact predecessors retained and unknown first/middle/last mutations rejected',()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'huashu-history-'));
 try{for(const [p,r] of Object.entries(huashuTransitions)){
  const b=beforeExplainerFile(root,p);assert.equal(sha(b),r.current);
  const old=beforeHuashuFile(root,p);assert.equal(sha(old),r.previous);
  if(p.endsWith('SKILL.md')){assert.equal(beforeHiggsfieldFile(root,p).toString().split('---',3)[1],old.toString().split('---',3)[1]);assert.equal(read(p).split('\n').find(l=>l.startsWith('> **Prime safety:')),old.toString().split('\n').find(l=>l.startsWith('> **Prime safety:')));}
  fs.mkdirSync(path.dirname(path.join(tmp,p)),{recursive:true});fs.writeFileSync(path.join(tmp,p),b);assert.equal(sha(beforeHuashuFile(tmp,p)),r.previous);
  for(const at of [0,Math.floor(b.length/2),b.length-1]){const bad=Buffer.from(b);bad[at]^=1;fs.writeFileSync(path.join(tmp,p),bad);assert.deepEqual(beforeHuashuFile(tmp,p),bad);assert.notEqual(sha(beforeHuashuFile(tmp,p)),r.previous);}
 }}finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
test('current original payloads, primary identities and affected directory hash',()=>{
 const p=JSON.parse(read('marketingskills/huashu-provenance.json'));assert.equal(p.commit,'c4b83675d1cdc1a6f43039518db9057749931758');assert.equal(p.sources.length,6);
 for(const s of p.sources){assert.match(s.sha256,/^[a-f0-9]{64}$/);assert.match(s.git_blob,/^[a-f0-9]{40}$/);assert(s.bytes>0);}
 for(const [f,h] of Object.entries(p.local_original))assert.equal(sha(beforeExplainerFile(root,f)),h,f);
 assert.equal(p.primary.published_version,'0.8.40');assert.match(p.primary.archive_sha256,/^[a-f0-9]{64}$/);
 const m=JSON.parse(read('marketingskills/MANIFEST.json'));assert.equal(m.source.commit,'5b2c0007766c6a1cf1d53fd8fc73e979e0821022');
 const dir=path.join(root,'marketingskills/skills/video'),files=[];function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);if(e.isDirectory())walk(f);else files.push(f);}}walk(dir);
 const h=createHash('sha256');for(const f of files.sort()){h.update(path.relative(dir,f));h.update(Buffer.from([0]));h.update(fs.readFileSync(f));h.update(Buffer.from([0]));}assert.equal(h.digest('hex'),m.skills.find(s=>s.name==='video').sha256);
});
test('new local routes resolve; no broad skill or imported runtime',()=>{
 const p=JSON.parse(read('marketingskills/huashu-provenance.json'));
 for(const f of Object.keys(p.local_original))for(const [,href] of read(f).matchAll(/\]\(([^)]+)\)/g)){
  if(/^(https?:|#)/.test(href))continue;const target=path.resolve(root,path.dirname(f),href.split('#')[0]);assert(target.startsWith(root+path.sep));assert(fs.statSync(target).isFile(),f+': '+href);
 }
 assert.equal(read('marketingskills/skills/video/SKILL.md').split('](references/ui-demo-delivery.md)').length-1,1);
 assert(!fs.existsSync(path.join(root,'huashu-design')));assert(!fs.existsSync(path.join(root,'hyperframes')));
 assert(read('marketingskills/HUASHU_SOURCES.md').includes('imports no upstream text'));
});
test('native discovery keeps existing owner identities without prompt expansion',async()=>{
 assert(process.env.PRIME_NATIVE_ROOT);const {loadSkillsFromDir,formatSkillsForPrompt}=await import(pathToFileURL(path.join(process.env.PRIME_NATIVE_ROOT,'dist/core/skills.js')));
 const loaded=loadSkillsFromDir({dir:root,source:'user'});assert.deepEqual(loaded.diagnostics,[]);assert.equal(loaded.skills.length,67);
 for(const n of ['hallmark','video'])assert.equal(loaded.skills.filter(s=>s.name===n).length,1);
 assert(!formatSkillsForPrompt(loaded.skills).includes('CJK is not one'));assert(!loaded.skills.some(s=>s.name==='huashu-design'));
});
