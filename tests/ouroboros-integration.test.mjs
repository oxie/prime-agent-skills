// Documentation/history controls only; no upstream runtime or model trials.
import {beforeCaliperFile} from './helpers/caliper-snapshot.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>beforeCaliperFile(root,p);
const sha=b=>createHash('sha256').update(b).digest('hex');
const flat=s=>s.toString().replace(/\s+/g,' ');
const clauses={"engineering-references/references/domain-modeling.md": ["Keep origin and acceptance separate", "agent-generated decision is not evidence of human approval", "descriptive or proposed or accepted status", "no new ledger or schema is needed", "retries three times", "agent proposes five retries", "below-ten-second overall deadline", "source citation establishes origin, not approval", "field named `user` may contain an automated choice", "update the canonical task contract", "Reconcile affected handoffs and checks", "Missing authority stays unresolved", "valid later decision must not be discarded", "not an executed interview"], "engineering-references/references/test-design.md": ["declared requirement \u2192 response schema \u2192 parser/defaults \u2192 stored result \u2192 final approval", "reads only `approved`", "high score or a second judge", "parsing, persistence/reload and the real approval consumer", "Supported failure, not missing evidence", "Not checked; no credit", "Explicit invalid result, not truthiness-based approval", "Explicit legacy/unverified state", "necessary only where the contract requires it", "not sufficient by itself", "attempt and tested revision", "unknown observation separate from a demonstrated product defect", "gate that rejects everything", "stored state and final decision", "never weaken the evidence requirement", "proposed regression cases, not a new evaluator"]};
test('Ouroboros examples preserve authority and enforce evidence at actual consumers',()=>{
 for(const [p,cs] of Object.entries(clauses)){
  const heading=p.includes('domain-modeling')?'## Preserve requirement authority through a relay':'## An evidence requirement must reach the approval gate';
  const section=read(p).toString().split(heading)[1];assert(section);assert(section.trim().split(/\s+/).length<550);assert(!section.includes('```'));
  const check=s=>{for(const c of cs)assert(flat(s).includes(c),c);};
  check(section);for(const c of cs)assert.throws(()=>check(flat(section).split(c).join('')),{name:'AssertionError'},c);
 }
});
test('exact Ouroboros appends invert only recognized bytes and preserve historical readers',async()=>{
 const {beforeOuroborosFile,ouroborosTransitions}=await import('./helpers/ouroboros-snapshot.mjs');
 assert.deepEqual(Object.keys(ouroborosTransitions).sort(),['engineering-references/UPSTREAM.md','engineering-references/references/domain-modeling.md','engineering-references/references/test-design.md']);
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ouroboros-history-'));
 try{for(const [p,r] of Object.entries(ouroborosTransitions)){
  const b=read(p),old=beforeOuroborosFile(root,p);assert.equal(sha(b),r.current);assert.equal(sha(old),r.previous);assert.deepEqual(b,Buffer.concat([old,Buffer.from(r.appendix)]));
  fs.mkdirSync(path.dirname(path.join(tmp,p)),{recursive:true});fs.writeFileSync(path.join(tmp,p),old);assert.deepEqual(beforeOuroborosFile(tmp,p),old);
  const mutations=[Buffer.concat([b,Buffer.from('unapproved suffix')])];
  for(const at of [0,Math.floor(b.length/2),b.length-1]){const bad=Buffer.from(b);bad[at]^=1;mutations.push(bad);}
  for(const bad of mutations){fs.writeFileSync(path.join(tmp,p),bad);assert.deepEqual(beforeOuroborosFile(tmp,p),bad);assert.notEqual(sha(bad),r.previous);}
 }}finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
test('Ouroboros source rights, payload identities and unchanged routing remain explicit',()=>{
 const owner='engineering-references',p=JSON.parse(read(owner+'/ouroboros-provenance.json'));
 assert.equal(p.repository,'https://github.com/Q00/ouroboros');assert.equal(p.commit,'79a423e80f93d4acc2aa0ee5b98340e86a766476');
 assert.equal(p.sources.length,8);assert.equal(new Set(p.sources.map(s=>s.path)).size,8);
 for(const s of p.sources){assert(s.bytes>0);assert.match(s.sha256,/^[a-f0-9]{64}$/);assert.match(s.git_blob,/^[a-f0-9]{40}$/);assert(s.url.includes(p.commit+'/'+s.path));}
 assert.deepEqual(Object.keys(p.files).sort(),['OUROBOROS_SOURCES.md','UPSTREAM.md','references/domain-modeling.md','references/test-design.md']);
 for(const [f,r] of Object.entries(p.files)){const b=read(owner+'/'+f);assert.equal(b.length,r.bytes);assert.equal(sha(b),r.sha256);}
 const note=flat(read(owner+'/OUROBOROS_SOURCES.md'));
 for(const c of ['MIT, Copyright (c) 2025 Q00','No upstream code or substantial prose is copied','conditional source findings','No upstream programs, tests or model calls were executed','No new ledger','not live-daemon health or measured improvement'])assert(note.includes(c),c);
 assert.equal(sha(read(owner+'/SKILL.md')),'fbb9af80ec40cb5ee7636a454c51a426f895a141e1e197ed5ed4a82c96340af8');
});
test('Ouroboros additions retain local links and nonexecutable plain documentation',()=>{
 for(const rel of ['engineering-references/OUROBOROS_SOURCES.md','engineering-references/UPSTREAM.md',...Object.keys(clauses)]){
  const st=fs.lstatSync(path.join(root,rel));assert(st.isFile()&&!st.isSymbolicLink());assert.equal(st.mode&0o111,0);
  for(const [,href] of read(rel).toString().matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
   if(/^(https?:|#)/.test(href))continue;
   const target=path.resolve(root,path.dirname(rel),href.split('#')[0]);assert(target.startsWith(path.join(root,'engineering-references')+path.sep));assert(fs.statSync(target).isFile(),target);
  }
 }
});
