import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p));
const sha=b=>createHash('sha256').update(b).digest('hex');
const clauses=["predicate truth separate from whether it could be evaluated", "actually evaluated coverage", "A declared assertion is not an executed assertion", "ineligible for verified success at the final consumer", "\u201cNone\u201d, \u201cexactly N\u201d and \u201cat most N\u201d", "actual session, document and interval", "A conjunction needs every required branch", "must not award coverage to unproved branches", "explicit read error", "\u201cExactly one\u201d is unknown", "wrapper cannot erase its completeness requirement", "including serialization and reload", "complete-window positive control", "stored status and final gate decision", "unknown observation is not proof of an application defect", "including relevant uncommitted changes", "newest timestamp or matching flow name", "consequence check was empty or skipped", "proposed cases, not executed browser tests"];
const normalize=t=>t.replace(/\s+/g,' ');
const check=t=>{for(const c of clauses)assert(normalize(t).includes(c),c);};
test('Reticle original guidance preserves validity, completeness and scope through final consumers',()=>{
 const t=read('engineering-references/references/test-design.md').toString().split('## Preserve evidence validity through the final consumer')[1];
 assert(t);check(t);assert(t.trim().split(/\s+/).length<650);assert(!t.includes('```'));
 for(const c of clauses)assert.throws(()=>check(normalize(t).replace(c,'')),{name:'AssertionError'},c);
});
test('Reticle exact history inversions retain old evidence and reject unknown mutations',async()=>{
 const {beforeReticleFile,reticleTransitions}=await import('./helpers/reticle-snapshot.mjs');
 assert.deepEqual(Object.keys(reticleTransitions).sort(),['engineering-references/UPSTREAM.md','engineering-references/references/test-design.md']);
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'reticle-history-'));
 try {for(const [p,r] of Object.entries(reticleTransitions)){
  const b=read(p);assert.equal(sha(b),r.current);const old=beforeReticleFile(root,p);assert.equal(sha(old),r.previous);
  assert.deepEqual(b,Buffer.concat([old,Buffer.from(r.appendix)]));
  fs.mkdirSync(path.dirname(path.join(tmp,p)),{recursive:true});
  fs.writeFileSync(path.join(tmp,p),old);assert.deepEqual(beforeReticleFile(tmp,p),old);
  for(const at of [0,Math.floor(b.length/2),b.length-1]){
   const bad=Buffer.from(b);bad[at]^=1;fs.writeFileSync(path.join(tmp,p),bad);
   assert.deepEqual(beforeReticleFile(tmp,p),bad);assert.notEqual(sha(bad),r.previous);
  }
  const extra=Buffer.concat([b,Buffer.from('unapproved')]);fs.writeFileSync(path.join(tmp,p),extra);assert.deepEqual(beforeReticleFile(tmp,p),extra);
 }}finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
test('Reticle sources, license limits and payload identities remain explicit without new routing',()=>{
 const owner='engineering-references';const p=JSON.parse(read(owner+'/reticle-provenance.json'));
 assert.equal(p.repository,'https://github.com/reticlehq/reticle');assert.equal(p.commit,'3a7785dda4c56712501da4fbf7626b49368fee8d');
 assert.equal(p.sources.length,8);assert.equal(new Set(p.sources.map(s=>s.path)).size,8);
 for(const s of p.sources){assert.match(s.git_blob,/^[a-f0-9]{40}$/);assert.match(s.sha256,/^[a-f0-9]{64}$/);assert(s.bytes>0);}
 for(const [f,r] of Object.entries(p.files)){const b=read(owner+'/'+f);assert.equal(sha(b),r.sha256);assert.equal(b.length,r.bytes);}
 const note=read(owner+'/RETICLE_SOURCES.md').toString();
 for(const c of ['FSL-1.1-ALv2','Competing Use','Enterprise','original prose','not executed','does not relicense'])assert(note.includes(c),c);
 assert.equal(sha(read(owner+'/SKILL.md')),'fbb9af80ec40cb5ee7636a454c51a426f895a141e1e197ed5ed4a82c96340af8');
 for(const f of Object.keys(p.files))for(const m of read(owner+'/'+f).toString().matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
  if(/^https?:/.test(m[1])||m[1].startsWith('#'))continue;
  const target=path.resolve(root,owner,path.dirname(f),m[1].split('#')[0]);assert(target.startsWith(path.join(root,owner)+path.sep));assert(fs.statSync(target).isFile(),target);
 }
});
