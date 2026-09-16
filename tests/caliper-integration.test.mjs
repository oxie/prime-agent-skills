// Local documentation/arithmetic/history checks; no upstream code or models.
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
const flat=s=>s.toString().replace(/\s+/g,' ');
const clauses=["existing call/spend budget", "Freeze the available skills and descriptions", "do not name the target skill", "Explicit invocation is a different question", "target, a neighbouring skill and work needing no skill", "Declare acceptable selections before observing results", "exact set only when the contract requires it", "candidate discovery, requested loading, successful content loading and subsequent instruction use", "path mention or attempted tool call alone does not prove successful loading", "separately from task-output and safety grades", "ten fully observed cases", "activation means successful content loading", "not one minus precision", "unmeasured, not zero", "missing or incomplete observations unknown", "report their counts and coverage", "confirmed silence or exact-set correctness", "not model trials, confidence bounds or measured improvement", "no new ledger, automatic testing, extra retries, installation or skill pruning", "zero or negative comparison is still a completed evaluation"];
test('Caliper routing example preserves observation, opportunity and authorization limits',()=>{
 const section=read('engineering-references/references/agent-evaluation.md').toString().split('## Skill routing: target, neighbour and silence')[1];
 assert(section);assert(section.trim().split(/\s+/).length<430);assert(!section.includes('```'));
 const check=s=>{for(const c of clauses)assert(flat(s).includes(c),c);};
 check(section);for(const c of clauses)assert.throws(()=>check(flat(section).split(c).join('')),{name:'AssertionError'},c);
 // Check the actual documented rows against independently derived fictional counts.
 const rows=[...section.matchAll(/\| ([^|]+) \| ([^|]+) \| (\d+) \/ (\d+) = (\d+)% \|/g)];
 assert.equal(rows.length,3);
 const expected=[['Recall',2,2,100],['Precision',2,4,50],['Unwanted activation rate',2,8,25]];
 const checkRows=rs=>assert.deepEqual(rs.map(m=>[m[1],+m[3],+m[4],+m[5]]),expected);
 checkRows(rows);for(const m of rows)assert.equal(+m[3]/+m[4]*100,+m[5]);
 const wrong=rows.map(m=>[...m]);wrong[2][4]='4';wrong[2][5]='50';assert.throws(()=>checkRows(wrong));
});
test('Caliper history accepts only exact approved appends',async()=>{
 const {beforeCaliperFile,caliperTransitions}=await import('./helpers/caliper-snapshot.mjs');
 assert.deepEqual(Object.keys(caliperTransitions).sort(),['engineering-references/UPSTREAM.md','engineering-references/references/agent-evaluation.md']);
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'caliper-history-'));
 try{for(const [p,r] of Object.entries(caliperTransitions)){
  const b=read(p),old=beforeCaliperFile(root,p);assert.equal(sha(b),r.current);assert.equal(sha(old),r.previous);assert.deepEqual(b,Buffer.concat([old,Buffer.from(r.appendix)]));
  fs.mkdirSync(path.dirname(path.join(tmp,p)),{recursive:true});fs.writeFileSync(path.join(tmp,p),old);assert.deepEqual(beforeCaliperFile(tmp,p),old);
  const mutations=[Buffer.concat([b,Buffer.from('unapproved suffix')])];
  for(const at of [0,Math.floor(b.length/2),b.length-1]){const bad=Buffer.from(b);bad[at]^=1;mutations.push(bad);}
  for(const bad of mutations){fs.writeFileSync(path.join(tmp,p),bad);assert.deepEqual(beforeCaliperFile(tmp,p),bad);assert.notEqual(sha(bad),r.previous);}
 }}finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
test('Caliper provenance preserves rights, payloads and existing routing',()=>{
 const owner='engineering-references',p=JSON.parse(read(owner+'/caliper-provenance.json'));
 assert.equal(p.repository,'https://github.com/edonadei/caliper');assert.equal(p.commit,'fe11ea7ea11d8fcf2b28d163df18d608fc0f591c');assert.equal(p.sources.length,5);
 assert.equal(new Set(p.sources.map(s=>s.path)).size,5);
 for(const s of p.sources){assert(s.bytes>0);assert.match(s.sha256,/^[a-f0-9]{64}$/);assert.match(s.git_blob,/^[a-f0-9]{40}$/);assert(s.url.includes(p.commit+'/'+s.path));}
 assert.deepEqual(Object.keys(p.files).sort(),['CALIPER_SOURCES.md','UPSTREAM.md','references/agent-evaluation.md']);
 for(const [f,r] of Object.entries(p.files)){const b=read(owner+'/'+f);assert.equal(b.length,r.bytes);assert.equal(sha(b),r.sha256);}
 for(const c of ['MIT, Copyright (c) 2026 Emrick Donadei','No upstream code or substantial prose is copied','No upstream programs, tests or model calls were executed','not model routing or effectiveness'])assert(flat(read(owner+'/CALIPER_SOURCES.md')).includes(c),c);
 assert.equal(sha(read(owner+'/SKILL.md')),'fbb9af80ec40cb5ee7636a454c51a426f895a141e1e197ed5ed4a82c96340af8');
 for(const rel of ['CALIPER_SOURCES.md','UPSTREAM.md','references/agent-evaluation.md']){
  const st=fs.lstatSync(path.join(root,owner,rel));assert(st.isFile()&&!st.isSymbolicLink());assert.equal(st.mode&0o111,0);
  for(const [,href] of read(owner+'/'+rel).toString().matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
   if(/^(https?:|#)/.test(href))continue;
   const target=path.resolve(root,owner,path.dirname(rel),href.split('#')[0]);assert(target.startsWith(path.join(root,owner)+path.sep));assert(fs.statSync(target).isFile());
  }
 }
});
