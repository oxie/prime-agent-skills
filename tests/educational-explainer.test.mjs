import {beforeHiggsfieldFile} from './helpers/higgsfield-snapshot.mjs';
import {beforeSlopMonsterFile} from './helpers/slopmonster-snapshot.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const video='marketingskills/skills/video/SKILL.md';
const ref='marketingskills/skills/video/references/educational-explainers.md';
test('educational explainer route separates understanding from promotion',()=>{
 const s=read(video);assert.match(s,/references\/educational-explainers\.md/);
 const section=s.split('### Explainer Video')[1].split('### Batch Social Clips')[0];
 assert.match(section,/Educational/);assert.match(section,/Promotional/);assert.match(section,/not a required sales CTA/);
});
test('original educational guidance exists under Video only',()=>{
 assert.match(read(ref),/claim/);assert.match(read(ref),/timing/);
});

import os from 'node:os';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {explainerTransitions,beforeExplainerFile} from './helpers/explainer-snapshot.mjs';
import {beforeHuashuFile,huashuTransitions} from './helpers/huashu-snapshot.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const flat=s=>s.replace(/\s+/g,' ').toLowerCase();
const clauses=[
 'not a renderer, research campaign or new approval workflow',
 'A URL or a sentence copied into a storyboard is not proof',
 'Preserve denominators, units, scope and uncertainty',
 'where it stops applying',
 'Label illustrative data on screen',
 'Do not claim that watching the video demonstrates learning',
 'Use narration or an appropriate described alternative',
 'A per-shot glitch allowance is not a flash-safety test',
 'one authoritative timing representation',
 'including when using supplied audio',
 'Validate missing/duplicate IDs',
 'interpolated alignment; it is not measured word timing',
 'mark affected captions, cues, scenes and review evidence stale',
 'Rebuild and verify those dependents',
 'do not freeze an error',
 'Reuse existing approval',
 'Missing scenes or missing check coverage are incomplete',
 'No additional export pipeline, automatic lesson log or model evaluation',
];
function check(s){for(const c of clauses)assert(flat(s).includes(flat(c)),c);}
test('original guidance clauses with independent deletion controls',()=>{
 const s=read(ref);check(s);assert(Buffer.byteLength(s)<9000);
 for(const c of clauses)assert.throws(()=>check(flat(s).split(flat(c)).join('REMOVED')),{name:'AssertionError'},c);
});
test('exact pre-integration bytes, metadata and safety survive; unknown mutations do not',t=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'explainer-history-'));t.after(()=>fs.rmSync(tmp,{recursive:true,force:true}));
 for(const [p,r] of Object.entries(explainerTransitions)){
  const b=beforeSlopMonsterFile(root,p);assert.equal(sha(b),r.current);
  const prev=beforeExplainerFile(root,p);assert.equal(sha(prev),r.previous);
  assert.equal(sha(beforeHuashuFile(root,p)),huashuTransitions[p].previous);
  if(p===video){assert.equal(beforeHiggsfieldFile(root,p).toString().split('---',3)[1],prev.toString().split('---',3)[1]);
   const safety=s=>s.split('\n').find(l=>l.startsWith('> **Prime safety:'));
   assert(safety(read(p)));assert.equal(safety(read(p)),safety(prev.toString()));}
  const f=path.join(tmp,p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,b);assert.equal(sha(beforeExplainerFile(tmp,p)),r.previous);
  for(const at of [0,Math.floor(b.length/2),b.length-1]){
   const bad=Buffer.from(b);bad[at]^=1;fs.writeFileSync(f,bad);
   assert.deepEqual(beforeExplainerFile(tmp,p),bad);assert.deepEqual(beforeHuashuFile(tmp,p),bad);
   assert.notEqual(sha(beforeExplainerFile(tmp,p)),r.previous);
  }
 }
});
test('current local provenance and Video directory digest match; historical identities retained',()=>{
 const p=JSON.parse(read('marketingskills/explainer-provenance.json'));
 assert.equal(p.review_commit,'5b57239578284385c72ebfb2d1fce3ab61a3950a');assert.equal(p.sources.length,7);
 assert.match(p.review_license,/PolyForm Noncommercial/);assert.match(read('marketingskills/EXPLAINER_SOURCES.md'),/not relicense upstream/);
 for(const s of p.sources){assert.match(s.sha256,/^[a-f0-9]{64}$/);assert.match(s.git_blob,/^[a-f0-9]{40}$/);assert(s.bytes>0);}
 for(const [f,h] of Object.entries(p.local_original))assert.equal(sha(beforeSlopMonsterFile(root,f)),h,f);
 const m=JSON.parse(read('marketingskills/MANIFEST.json'));assert.equal(m.source.commit,'5b2c0007766c6a1cf1d53fd8fc73e979e0821022');
 const dir=path.join(root,'marketingskills/skills/video'),files=[];
 function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){assert(!e.isSymbolicLink());const f=path.join(d,e.name);if(e.isDirectory())walk(f);else{assert(e.isFile());files.push(f);}}}walk(dir);
 const h=createHash('sha256');for(const f of files.sort()){h.update(path.relative(dir,f));h.update(Buffer.from([0]));h.update(fs.readFileSync(f));h.update(Buffer.from([0]));}
 assert.equal(h.digest('hex'),m.skills.find(s=>s.name==='video').sha256);
 assert.equal(JSON.parse(read('marketingskills/huashu-provenance.json')).commit,'c4b83675d1cdc1a6f43039518db9057749931758');
});
test('local links resolve, existing exports reused, no new renderer or broad skill',()=>{
 const p=JSON.parse(read('marketingskills/explainer-provenance.json'));
 for(const f of [...Object.keys(p.local_original),'marketingskills/UPSTREAM.md'])for(const [,href] of read(f).matchAll(/\]\(([^)]+)\)/g)){
  if(/^(https?:|#)/.test(href))continue;const target=path.resolve(root,path.dirname(f),href.split('#')[0]);assert(target.startsWith(root+path.sep));assert(fs.statSync(target).isFile(),f+': '+href);
 }
 assert.equal(read(video).split('](references/educational-explainers.md)').length-1,1);
 assert.match(read(ref),/\]\(ui-demo-delivery\.md\)/);
 assert(!fs.existsSync(path.join(root,'anything2explainer')));
});
test('native discovery preserves Video identity and prompt size',async()=>{
 const runtime=process.env.PRIME_NATIVE_ROOT||path.join(os.homedir(),'.local/lib/node_modules/prime-agent');
 const {loadSkillsFromDir,formatSkillsForPrompt}=await import(pathToFileURL(path.join(runtime,'dist/core/skills.js')));
 const loaded=loadSkillsFromDir({dir:root,source:'user'});assert.deepEqual(loaded.diagnostics,[]);assert.equal(loaded.skills.length,67);
 assert.equal(loaded.skills.filter(s=>s.name==='video').length,1);
 assert(!loaded.skills.some(s=>s.name==='anything2explainer'));
 assert(!formatSkillsForPrompt(loaded.skills).includes('Plan the explanation and its evidence together'));
});
