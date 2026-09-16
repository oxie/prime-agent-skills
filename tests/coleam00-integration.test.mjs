import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
import {beforeReticleFile} from './helpers/reticle-snapshot.mjs';
const read=p=>beforeReticleFile(root,p);
const sha=b=>createHash('sha256').update(b).digest('hex');
const clauses={"engineering-references/references/agent-evaluation.md": ["record whether each case actually exercises it", "`unobservable/error`", "treatment baseline", "deleting a rules file is the intervention, not implementation progress", "A no-op in either arm must remain a no-op", "mapping outside grader input", "report limited blinding", "Separate new-file work from edits with nearby examples", "Any removal needs its own authorization", "Worktrees isolate checkout edits, not credentials"], "engineering-references/references/test-design.md": ["unchanged positive control in the same disposable environment", "no mutant in that environment earns detection credit", "intended mutation was actually applied", "infrastructure failure, not a caught refund bug", "specifically expected failure evidence together", "nonzero exit is not a passing control", "candidate-editable adapter", "process-status capture and result artifacts", "not an executed refund test"], "engineering-references/references/api-authorization.md": ["Successful validation and permission to act are separate facts", "final effect boundary", "resource, operation and revision", "Missing, stale or unreadable approval evidence cannot authorize", "the next queue tick", "authorized positive case", "r7 approval cannot authorize r8", "Check revision and permission atomically", "forbidden delivery/outbox effects"]};
const normalized=t=>t.replace(/\s+/g,' ');
function check(t,cs){for(const c of cs)assert(normalized(t).includes(c),c);}
test('Cole selection keeps applicability, independent evidence and durable authorization explicit',()=>{
 for(const [p,cs] of Object.entries(clauses)){
  const t=read(p).toString();check(t,cs);
  for(const c of cs)assert.throws(()=>check(normalized(t).replace(c,''),cs),{name:'AssertionError'},c);
 }
});

test('Cole history inversions preserve old bytes and refuse unknown changes',async()=>{
 const {beforeColeam00File,coleam00Transitions}=await import('./helpers/coleam00-snapshot.mjs');
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'cole-history-'));
 try{for(const [p,r] of Object.entries(coleam00Transitions)){
  const b=read(p);assert.equal(sha(b),r.current);const old=beforeColeam00File(root,p);assert.equal(sha(old),r.previous);
  fs.mkdirSync(path.dirname(path.join(tmp,p)),{recursive:true});
  fs.writeFileSync(path.join(tmp,p),old);assert.deepEqual(beforeColeam00File(tmp,p),old);
  for(const at of [0,Math.floor(b.length/2),b.length-1]){
   const bad=Buffer.from(b);bad[at]^=1;fs.writeFileSync(path.join(tmp,p),bad);
   assert.deepEqual(beforeColeam00File(tmp,p),bad);assert.notEqual(sha(bad),r.previous);
  }
 }}finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
test('Cole source notice and current payloads have exact identities and local links',()=>{
 const owner='engineering-references';const p=JSON.parse(read(owner+'/coleam00-provenance.json'));
 assert.equal(p.repository,'https://github.com/coleam00/skills');
 assert.equal(p.commit,'73ec6524088ab8a9ddf953ff7baa495415c76cd1');
 assert.deepEqual(Object.keys(p.files).sort(),['references/agent-evaluation.md','references/api-authorization.md','references/test-design.md']);
 assert.equal(p.sources.length,12);assert.equal(new Set(p.sources.map(s=>s.path)).size,12);
 for(const s of p.sources){assert.match(s.git_blob,/^[a-f0-9]{40}$/);assert.match(s.sha256,/^[a-f0-9]{64}$/);assert(s.bytes>0);}
 for(const [f,r] of Object.entries(p.files)){const b=read(owner+'/'+f);assert.equal(sha(b),r.sha256);assert.equal(b.length,r.bytes);}
 const notice=read(owner+'/'+p.license_notice).toString();assert(notice.includes('Copyright (c) 2026 Cole Medin'));
 assert(notice.includes('Permission is hereby granted, free of charge'));assert(notice.includes('THE SOFTWARE IS PROVIDED "AS IS"'));
 assert(notice.includes('model experiments, desktop actions and providers were not run'));
 for(const f of [p.license_notice,'UPSTREAM.md',...Object.keys(p.files)]){
  const b=read(owner+'/'+f).toString();for(const m of b.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
   if(/^https?:/.test(m[1])||m[1].startsWith('#'))continue;
   const target=path.resolve(root,owner,path.dirname(f),m[1].split('#')[0]);
   assert(target.startsWith(path.join(root,owner)+path.sep));assert(fs.statSync(target).isFile(),target);
  }
 }
});
test('Cole additions stay optional prose without new routing or executable payloads',async()=>{
 const {coleam00Transitions}=await import('./helpers/coleam00-snapshot.mjs');
 assert.equal(sha(read('engineering-references/SKILL.md')),'fbb9af80ec40cb5ee7636a454c51a426f895a141e1e197ed5ed4a82c96340af8');
 for(const p of Object.keys(clauses)){const text=coleam00Transitions[p].appendix;assert(!text.includes('```'),'No executable example introduced');}
});
