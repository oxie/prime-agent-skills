// Documentation contract checks, not model or authorship-detection evaluation.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const flat=t=>t.replace(/\s+/g,' ').toLowerCase();
const clauses={"marketingskills/skills/seo-audit/references/ai-writing-detection.md": ["does not establish authorship", "No punctuation quota", "Do not use blanket replacements", "Source Fidelity and Clarity"], "marketingskills/skills/copywriting/references/natural-transitions.md": ["does not establish authorship", "optional examples", "Do not invent evidence", "Source Fidelity and Clarity"]};
function verify(t,cs){for(const c of cs)assert(flat(t).includes(flat(c)),c);}
for(const [p,cs] of Object.entries(clauses))test('optional editing without authorship inference: '+p,()=>{
 const t=read(p);verify(t,cs);for(const c of cs)assert.throws(()=>verify(flat(t).split(flat(c)).join('removed'),cs));
 for(const forbidden of ['most reliable markers','one em dash per page','signals AI writing','complete list of AI writing tells'])assert(!t.includes(forbidden));
 for(const [,href] of t.matchAll(/\]\(([^)]+)\)/g)){if(/^(https?:|#)/.test(href))continue;assert(fs.statSync(path.resolve(root,path.dirname(p),href.split('#')[0])).isFile(),href);}
});

import os from 'node:os';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {humanizerCorrections,beforeHumanizerCorrections} from './helpers/humanizer-corrections-snapshot.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
test('exact predecessor recovery preserves examples and rejects unknown changes',()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'humanizer-correction-'));
 try{for(const [p,r] of Object.entries(humanizerCorrections)){
  const b=fs.readFileSync(path.join(root,p)),old=beforeHumanizerCorrections(root,p);assert.equal(sha(b),r.current);assert.equal(sha(old),r.previous);
  if(p.endsWith('SKILL.md')){assert.equal(read(p).split('---',3)[1],old.toString().split('---',3)[1]);const safety=t=>t.split('\n').find(l=>l.startsWith('> **Prime safety:'));assert.equal(safety(read(p)),safety(old.toString()));}
  else if(p.endsWith('ai-writing-detection.md')){const rows=t=>t.split('\n').filter(l=>l.startsWith('| ')&&!/\| (Avoid|Original|Instead of)/.test(l)&&!l.includes('----'));assert.deepEqual(rows(read(p)),rows(old.toString()));}
  else {for(const l of old.toString().split('\n').filter(l=>l.startsWith('- ')&&!l.includes('Transitions to Avoid')))assert(read(p).includes(l),l);}
  fs.mkdirSync(path.dirname(path.join(tmp,p)),{recursive:true});fs.writeFileSync(path.join(tmp,p),b);assert.equal(sha(beforeHumanizerCorrections(tmp,p)),r.previous);
  for(const at of [0,Math.floor(b.length/2),b.length-1]){const bad=Buffer.from(b);bad[at]^=1;fs.writeFileSync(path.join(tmp,p),bad);assert.deepEqual(beforeHumanizerCorrections(tmp,p),bad);assert.notEqual(sha(bad),r.previous);}
 }}finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
test('correct owning link and source-fidelity route remain explicit',()=>{
 const audit=read('marketingskills/skills/seo-audit/SKILL.md');assert(audit.includes('[Optional style and clarity checks](references/ai-writing-detection.md)'));assert(!audit.includes('[AI Writing Detection]'));
 for(const p of Object.keys(clauses))assert(read(p).includes('(../../copy-editing/references/source-fidelity-and-clarity.md)'));
 assert(read('marketingskills/UPSTREAM.md').includes('No Humanizer text, code, skill, detector, new editing pass or runtime is installed.'));
 assert(!fs.existsSync(path.join(root,'humanizer')));
});
test('current affected directory digests match and original source pin stays intact',()=>{
 const m=JSON.parse(read('marketingskills/MANIFEST.json'));assert.equal(m.source.commit,'5b2c0007766c6a1cf1d53fd8fc73e979e0821022');
 for(const name of ['seo-audit','copywriting']){const dir=path.join(root,'marketingskills/skills',name),files=[];function walk(p){for(const e of fs.readdirSync(p,{withFileTypes:true})){const f=path.join(p,e.name);if(e.isDirectory())walk(f);else files.push(f);}}walk(dir);const h=createHash('sha256');for(const p of files.sort()){h.update(path.relative(dir,p));h.update(Buffer.from([0]));h.update(fs.readFileSync(p));h.update(Buffer.from([0]));}assert.equal(h.digest('hex'),m.skills.find(s=>s.name===name).sha256);}
});
test('native loading has the existing owners with no Humanizer or prompt expansion',async()=>{
 const runtime=process.env.PRIME_NATIVE_ROOT;assert(runtime);const {loadSkillsFromDir,formatSkillsForPrompt}=await import(pathToFileURL(path.join(runtime,'dist/core/skills.js')));
 const loaded=loadSkillsFromDir({dir:root,source:'user'});assert.deepEqual(loaded.diagnostics,[]);assert.equal(loaded.skills.length,67);assert(!loaded.skills.some(s=>s.name==='humanizer'));
 for(const name of ['copy-editing','copywriting','seo-audit'])assert.equal(loaded.skills.filter(s=>s.name===name).length,1);
 assert(!formatSkillsForPrompt(loaded.skills).includes('No punctuation quota'));
});
