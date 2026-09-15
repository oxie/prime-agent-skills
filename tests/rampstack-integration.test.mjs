import {beforeWeknoraFile} from './helpers/weknora-snapshot.mjs';
// Source/wording/native contracts only; not design, model or live recovery evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {rampstackRoutes,rampstackDocs,beforeRampstackSkill,beforeRampstackFile} from './helpers/rampstack-snapshot.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>beforeWeknoraFile(root,p);
const sha=b=>createHash('sha256').update(b).digest('hex');
const flat=s=>s.toString().replace(/\s+/g,' ').toLowerCase();
const clauses={
  "marketingskills/skills/image/references/logo-delivery.md": [
    "Keep the approved master",
    "not a production package",
    "An SVG container can hold only a bitmap",
    "Outlining text does not remove font-license obligations",
    "not a matched Pantone specification",
    "Do not invent assignment clauses",
    "does not prove rendering or vendor acceptance",
    "not permission to email, upload, publish"
  ],
  "marketingskills/skills/free-tools/references/calculator-methodology.md": [
    "a review remains read-only",
    "without surrendering contact details",
    "never invent a benchmark",
    "do not label an arbitrary range a statistical confidence interval",
    "expected answer must not come from the same implementation",
    "Missing is not automatically zero",
    "stale responses must not replace a newer input",
    "must not silently rewrite the meaning",
    "Do not add result storage solely"
  ],
  "engineering-references/references/recovery-planning.md": [
    "Use only when backup or disaster-recovery planning is requested",
    "not a backup tool",
    "never key or credential values",
    "Replication can copy corruption/deletion",
    "Record targets separately from measured results",
    "only that phase, not the full RTO",
    "A recent snapshot timestamp alone does not prove",
    "Avoid two authoritative writers",
    "switching DNS back cannot undo new writes",
    "A tabletop review proves plan coverage only",
    "separate explicit authorization",
    "no recurring agent work"
  ]
};
function check(t,required){for(const c of required)assert(flat(t).includes(flat(c)),'Missing scope: '+c);}
for(const [p,c] of Object.entries(clauses))test('focused reference and deletion controls: '+p,()=>{
 const t=flat(read(p));check(t,c);for(const phrase of c)assert.throws(()=>check(t.split(flat(phrase)).join('REMOVED'),c));
});
test('new current routes and exact old source identities both hold',()=>{
 for(const [owner,r] of Object.entries(rampstackRoutes)){
  const b=read(owner+'/SKILL.md');assert.equal(sha(b),r.current.sha256);assert.equal(b.length,r.current.bytes);
  assert.equal(sha(beforeRampstackSkill(root,owner)),r.previous.sha256);
 }
 for(const [p,r] of Object.entries(rampstackDocs)){assert.equal(sha(read(p)),r.current);assert.equal(sha(beforeRampstackFile(root,p)),r.previous);}
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'rampstack-history-'));
 try{for(const owner of Object.keys(rampstackRoutes)){
  fs.mkdirSync(path.join(temp,owner),{recursive:true});const p=owner+'/SKILL.md',b=read(p);
  fs.writeFileSync(path.join(temp,p),b);assert.equal(sha(beforeRampstackSkill(temp,owner)),rampstackRoutes[owner].previous.sha256);
  // Unknown bytes pass through to the historical/current caller's exact hash gate, never silently strip.
  for(const at of [0,b.length-1]){const bad=Buffer.from(b);bad[at]^=1;fs.writeFileSync(path.join(temp,p),bad);assert.deepEqual(beforeRampstackSkill(temp,owner),bad);assert.notEqual(sha(bad),rampstackRoutes[owner].previous.sha256);}
 }}finally{fs.rmSync(temp,{recursive:true,force:true});}
});
test('source selection, MIT notices and current local payloads are bound',()=>{
 for(const owner of ['marketingskills','engineering-references']){
  const p=JSON.parse(read(owner+'/rampstack-provenance.json'));
  assert.equal(p.repository,'https://github.com/rampstackco/claude-skills');assert.equal(p.commit,'a67dd34c609f034c0cfd736a348659bbdf1605bf');
  assert.equal(p.sources.length,owner==='marketingskills'?5:3);
  for(const s of p.sources){assert.match(s.sha256,/^[a-f0-9]{64}$/);assert.match(s.git_blob,/^[a-f0-9]{40}$/);assert(s.bytes>0);}
  const license=read(owner+'/'+p.license).toString();assert(license.includes('Copyright (c) 2026 RampStack Co.'));assert(license.includes('THE SOFTWARE IS PROVIDED "AS IS"'));
  for(const [rel,r] of Object.entries(p.adapted_files)){const b=read(owner+'/'+rel);assert.equal(sha(b),r.sha256,rel);assert.equal(b.length,r.bytes);}
 }
});
test('local links resolve and new references stay ordinary nonexecutable Markdown',()=>{
 for(const p of [...Object.keys(clauses),'marketingskills/RAMPSTACK_SOURCES.md','engineering-references/RAMPSTACK_SOURCES.md']){
  const stat=fs.lstatSync(path.join(root,p));assert(stat.isFile());assert.equal(stat.mode & 0o111,0);
  for(const m of read(p).toString().matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
   if(/^https?:/.test(m[1])||m[1].startsWith('#'))continue;
   const target=path.resolve(root,path.dirname(p),m[1].split('#')[0]);assert(target.startsWith(root+path.sep));assert(fs.statSync(target).isFile(),target);
  }
 }
 const free=read('marketingskills/skills/free-tools/SKILL.md').toString();assert(free.includes('Lead capture only if it serves the approved strategy'));assert(!free.includes('perfect design, every edge case'));
});
test('existing 67 owners remain metadata-only with optional body routes',async()=>{
 const runtime=path.resolve(process.env.HOME,'.local/lib/node_modules/prime-agent');
 const {loadSkillsFromDir,formatSkillsForPrompt}=await import(pathToFileURL(path.join(runtime,'dist/core/skills.js')));
 const loaded=loadSkillsFromDir({dir:root,source:'user'});assert.equal(loaded.diagnostics.length,0,JSON.stringify(loaded.diagnostics));assert.equal(loaded.skills.length,67);
 for(const name of ['image','free-tools','engineering-references','ab-testing','ai-seo'])assert.equal(loaded.skills.filter(s=>s.name===name).length,1);
 const prompt=formatSkillsForPrompt(loaded.skills);for(const p of Object.keys(clauses))assert(!prompt.includes(read(p).toString().split('\n')[0]));
});
