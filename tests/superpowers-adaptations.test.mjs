import {beforeRampstackFile} from './helpers/rampstack-snapshot.mjs';
import {beforeConceptReuseFile} from './helpers/concept-reuse-snapshot.mjs';
const historicalFile=(root,p)=>p.startsWith('task-observer/')?beforeConceptReuseFile(root,p):beforeRampstackFile(root,p);
// Mechanical contracts and native metadata only. No models, providers or efficacy claims.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>historicalFile(root,p).toString('utf8');
const hash=s=>createHash('sha256').update(s).digest('hex');
const flat=s=>s.replace(/\s+/g,' ');
const contracts={
  "engineering-references/references/test-design.md": [
    "Subscribe before the trigger when events are transient",
    "Bound the overall wait",
    "assert no call at 99 ms",
    "An eventual-success wait cannot establish the no-early-call contract",
    "must not reject valid `0`, `false`",
    "not permission for agent-side polling loops",
    "Fake the catalogue fetch below it, keep the save and duplicate check real",
    "explicit incomplete or malformed doubles for rejection paths",
    "Check arguments, counts or ordering when contractual"
  ],
  "engineering-references/references/debugging.md": [
    "compare a failing path with a working path",
    "Trace upstream from the first observed mismatch",
    "Missing telemetry means unknown",
    "Do not log payloads or environment dumps by default",
    "never interpolate its value into a diagnostic",
    "No table or instrumentation is required for a bug already explained by the source"
  ],
  "code-review/references/receiving-feedback.md": [
    "Bind the supplied comments to the revision they discuss",
    "**Accept:**",
    "**Reject:**",
    "**Needs evidence:**",
    "**Defer:**",
    "no local grep matches are not proof",
    "One unclear item need not block independent, understood and authorized work",
    "drafting is not publication"
  ],
  "task-observer/SKILL.md": [
    "primarily during authorized tasks, not synthetic model trials",
    "small fixed call/spend budget and a stopping rule",
    "Do not create evaluation loops, background testing or extra workers",
    "static checks do not establish model effectiveness"
  ],
  "task-observer/references/prime-skill-maintenance.md": [
    "Use outcomes from authorized tasks as the primary evidence",
    "explicit user approval, a small fixed call/spend budget and a stopping rule",
    "Do not retry indefinitely",
    "cheap deterministic link, metadata and contract checks remain required",
    "missing tool, access limit or runtime failure",
    "Give a short positive recipe",
    "named required field",
    "observable fact",
    "Do not manufacture that task or retain a worker waiting for it"
  ]
};
const missing=(text,clauses)=>clauses.filter(c=>!flat(text).includes(flat(c)));
test('selected recipes and real-work evaluation boundaries remain explicit',()=>{
 for(const [p,clauses] of Object.entries(contracts))assert.deepEqual(missing(read(p),clauses),[],p);
});
test('deleting each declared contract is detected; text checks, not behavior trials',()=>{
 for(const [p,clauses] of Object.entries(contracts)){
  const original=flat(read(p));assert.deepEqual(missing(original,clauses),[],p);
  for(const c of clauses)assert.ok(missing(original.split(flat(c)).join('REMOVED'),clauses).includes(c),p+': '+c);
 }
});
test('existing owners retain pinned source identities, licenses and exact current payloads',()=>{
 for(const owner of ['engineering-references','code-review','task-observer']){
  const pr=JSON.parse(read(owner+'/superpowers-provenance.json'));
  assert.equal(pr.repository,'https://github.com/obra/superpowers');
  assert.equal(pr.commit,'b36e0829c6d0140e93cfef2ca599b1b07d4a7797');
  assert.equal(pr.license,'licenses/superpowers-MIT.txt');
  const license=read(owner+'/'+pr.license);
  assert(license.includes('Copyright (c) 2025 Jesse Vincent'));
  assert(license.includes('THE SOFTWARE IS PROVIDED "AS IS"'));
  assert.equal(hash(license),pr.license_sha256);
  assert(pr.sources.length>0);assert(pr.files.length>0);
  for(const s of pr.sources){
   assert.match(s.git_blob_sha,/^[a-f0-9]{40}$/);assert.match(s.sha256,/^[a-f0-9]{64}$/);
   assert.equal(s.url,'https://github.com/obra/superpowers/blob/'+pr.commit+'/'+s.path);
   assert(s.bytes>0);
  }
  for(const f of pr.files){
   const p=path.resolve(root,owner,f.path);assert(p.startsWith(path.resolve(root,owner)+path.sep));
   const stat=fs.lstatSync(p);assert(stat.isFile());assert.equal(stat.mode&0o111,0);
   const b=historicalFile(root,owner+'/'+f.path);assert.equal(hash(b),f.sha256,owner+'/'+f.path);assert.equal(b.length,f.bytes);
   if(f.previous_sha256)assert.match(f.previous_sha256,/^[a-f0-9]{64}$/);
  }
 }
});
test('addition links resolve locally without escaping their owner',()=>{
 for(const owner of ['engineering-references','code-review','task-observer']){
  const pr=JSON.parse(read(owner+'/superpowers-provenance.json'));
  for(const f of pr.files.filter(f=>f.path.endsWith('.md'))){
   const text=read(owner+'/'+f.path).replace(/```[\s\S]*?```/g,'');
   for(const [,href] of text.matchAll(/\]\(([^)]+)\)/g)){
    if(/^(https?:|#|mailto:)/.test(href))continue;
    const target=path.resolve(root,owner,path.dirname(f.path),href.split('#')[0]);
    assert(target.startsWith(path.resolve(root,owner)+path.sep),href);
    assert(fs.statSync(target).isFile(),href);
   }
  }
 }
});
test('fresh native discovery exposes incoming-review trigger, not reference bodies',async()=>{
 assert(process.env.PRIME_NATIVE_ROOT);
 const {loadSkillsFromDir,formatSkillsForPrompt}=await import(pathToFileURL(path.join(process.env.PRIME_NATIVE_ROOT,'dist/core/skills.js')));
 const result=loadSkillsFromDir({dir:root,source:'project'});assert.deepEqual(result.diagnostics,[]);
 for(const name of ['engineering-references','code-review','task-observer']){
  const matches=result.skills.filter(s=>s.name===name);assert.equal(matches.length,1);
  assert.equal(matches[0].filePath,path.join(root,name,'SKILL.md'));assert.equal(matches[0].disableModelInvocation,false);
  assert(matches[0].description.length<=1024);
 }
 const prompt=formatSkillsForPrompt(result.skills.filter(s=>s.name==='code-review'));
 assert(prompt.includes('assessing incoming review comments'));
 assert(!prompt.includes('## Verify before accepting'));
 assert(read('code-review/SKILL.md').includes('(references/receiving-feedback.md)'));
 assert(!fs.existsSync(path.join(root,'using-superpowers')));
});
