// Mechanical wording/history/loading checks, not model or upstream behavior trials.
import {beforeWikiskillFile} from './helpers/wikiskill-snapshot.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {beforeWeknoraFile,weknoraTransitions} from './helpers/weknora-snapshot.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>beforeWikiskillFile(root,p);
const sha=b=>createHash('sha256').update(b).digest('hex');
const flat=s=>s.toString().replace(/\s+/g,' ');
const clauses={"unlazy/references/research-handoffs.md": ["current evidence", "historical evidence", "navigation reference", "does not promote the underlying source", "does not prove that source supports", "stable document/chunk ID", "A failed search is not evidence of absence", "if omitted text is unreachable", "Credential-visible sources are not", "not a second memory or observation system"], "engineering-references/references/retrieval-contracts.md": ["Reviews remain read-only", "complete-with-hits, complete-empty, partial and failed", "malformed 2xx response is not an empty successful search", "Logs alone do not communicate degraded coverage", "Completion order is not relevance order", "normalizing scores without sorting", "deterministic tie-breaker", "reranker cannot recover candidates already discarded", "Saved content is not necessarily indexed", "Scope checks still apply to hydrated neighbors", "before prerequisites succeed", "assert identical selected IDs and order", "These are proposed cases, not executed tests"]};
const check=(t,c)=>{for(const p of c)assert(flat(t).includes(p),'Missing contract: '+p);};
for(const [p,c] of Object.entries(clauses))test('scoped evidence contracts and deletion controls: '+p,()=>{
 const t=flat(read(p));check(t,c);for(const phrase of c)assert.throws(()=>check(t.split(phrase).join('REMOVED'),c));
});
test('exact later transition preserves prior identities without accepting mutations',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'weknora-history-'));
 try{for(const [p,r] of Object.entries(weknoraTransitions)){
  const b=read(p);assert.equal(sha(b),r.current);assert.equal(sha(beforeWeknoraFile(root,p)),r.previous);
  fs.mkdirSync(path.dirname(path.join(temp,p)),{recursive:true});
  for(const at of [0,b.length-1]){const bad=Buffer.from(b);bad[at]^=1;fs.writeFileSync(path.join(temp,p),bad);assert.deepEqual(beforeWeknoraFile(temp,p),bad);assert.notEqual(sha(bad),r.previous);}
 }}finally{fs.rmSync(temp,{recursive:true,force:true});}
});
test('source and local payload identities, MIT and links are explicit',()=>{
 for(const owner of ['unlazy','engineering-references']){
  const p=JSON.parse(read(owner+'/weknora-provenance.json'));
  assert.equal(p.repository,'https://github.com/Tencent/WeKnora');assert.equal(p.commit,'bca3a9f448e9936bcf2160d5543a97b86b24ecc7');
  assert.equal(p.sources.length,owner==='unlazy'?4:5);
  for(const s of p.sources){assert.match(s.git_blob,/^[a-f0-9]{40}$/);assert.match(s.sha256,/^[a-f0-9]{64}$/);assert(s.bytes>0);}
  const notice=read(owner+'/'+p.license_notice).toString();assert(notice.includes('Copyright (C) 2025 Tencent'));assert(notice.includes('THE SOFTWARE IS PROVIDED "AS IS"'));
  for(const [rel,r] of Object.entries(p.adapted_files)){const b=read(owner+'/'+rel);assert.equal(sha(b),r.sha256);assert.equal(b.length,r.bytes);}
  for(const rel of [p.license_notice,...Object.keys(p.adapted_files)]){
   const f=owner+'/'+rel;assert.equal(fs.lstatSync(path.join(root,f)).mode&0o111,0);
   for(const m of read(f).toString().matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
    if(/^(https?:|#)/.test(m[1]))continue;
    const target=path.resolve(root,path.dirname(f),m[1].split('#')[0]);assert(target.startsWith(root+path.sep));assert(fs.statSync(target).isFile(),target);
   }
  }
 }
});
test('native loading keeps 67 existing owners and bodies on demand',async()=>{
 const runtime=path.resolve(process.env.HOME,'.local/lib/node_modules/prime-agent');
 const {loadSkillsFromDir,formatSkillsForPrompt}=await import(pathToFileURL(path.join(runtime,'dist/core/skills.js')));
 const result=loadSkillsFromDir({dir:root,source:'user'});assert.equal(result.diagnostics.length,0,JSON.stringify(result.diagnostics));assert.equal(result.skills.length,67);
 for(const name of ['unlazy','engineering-references'])assert.equal(result.skills.filter(s=>s.name===name).length,1);
 const prompt=formatSkillsForPrompt(result.skills);assert(!prompt.includes('Completion order is not relevance order'));assert(!prompt.includes('## Current evidence, history and retrieval limits'));
 assert(read('engineering-references/SKILL.md').toString().includes('[retrieval contracts](references/retrieval-contracts.md)'));
});
