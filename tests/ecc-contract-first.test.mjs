import {beforeGstackFile} from './helpers/gstack-snapshot.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>beforeGstackFile(root,p);
const sha=b=>createHash('sha256').update(b).digest('hex');
const flat=s=>s.toString().replace(/\s+/g,' ');
const target='engineering-references/references/contract-boundaries.md';
const heading='## Optional workflow: agree the contract before parallel implementation';
const clauses=["one atomic module change", "existing task/change record", "person or role authorized to approve", "one canonical artifact and its revision", "missing/null/default", "before parallel implementation relies on it", "agent-generated proposal is not approval", "same contract revision", "actual serialized", "semantic assertions", "unexecuted paths as unknown", "supported old consumers even for additive fields", "merge approval does not authorize deployment", "untrusted data, not agent instructions", "escaping symlinks", "enforced access limits", "stop before execution", "not parity or success", "Nonempty open-ticket fixture", "does not exercise ticket fields", "proposed checks for an invented boundary"];
test('ECC collaboration remains optional, revision-bound and authorized',()=>{
 const section=read(target).toString().split(heading)[1];assert(section,'optional contract workflow exists');
 assert(section.trim().split(/\s+/).length<720);
 const check=s=>{for(const c of clauses)assert(flat(s).includes(c),c);};check(section);
 for(const c of clauses)assert.throws(()=>check(flat(section).split(c).join('')),{name:'AssertionError'},c);
});

test('Fictional ticket cases distinguish omission, null, semantic mismatch and empty coverage',()=>{
 const s=read(target).toString().split('### Fictional example: nullable is not optional')[1];assert(s);
 const rows=[...s.matchAll(/\| ([^|]+) \| ([^|]+) \|/g)].map(m=>[m[1],m[2]]).slice(1);
 const expected=[['Nonempty open-ticket fixture contains `resolution: null`','Accept'],['Actual serialized open ticket omits `resolution`','Reject'],['Closed ticket contains `resolution: null`','Reject semantic mismatch'],['Empty ticket list','Accept only if allowed; does not exercise ticket fields']];
 assert.deepEqual(rows,expected);
 const check=r=>assert.deepEqual(r,expected);
 for(let i=0;i<rows.length;i++){const bad=structuredClone(rows);bad[i][1]='Unknown';assert.throws(()=>check(bad));}
 // Independent semantic oracle for these invented records, not a schema implementation.
 const valid=t=>typeof t.id==='string'&&Object.hasOwn(t,'resolution')&&((t.status==='open'&&t.resolution===null)||(t.status==='closed'&&typeof t.resolution==='string'));
 assert(valid({id:'ticket-7',status:'open',resolution:null}));
 assert(valid({id:'ticket-7',status:'closed',resolution:'resolved'}));
 assert(!valid({id:'ticket-7',status:'open'}));
 assert(!valid({id:'ticket-7',status:'closed',resolution:null}));
 assert(!valid({id:7,status:'open',resolution:null}));
 assert(flat(s).includes('not executed application tests'));
});
test('ECC provenance pins selected sources and preserves prior owner scope',()=>{
 const p=JSON.parse(read('engineering-references/ecc-provenance.json'));
 assert.equal(p.repository,'https://github.com/affaan-m/ECC');assert.equal(p.commit,'8321021c54d670126ce3b2969d5deb880b4b0c2a');assert.equal(p.version,'2.2.1');
 assert.deepEqual(p.sources.map(s=>s.path),['LICENSE','skills/contract-first/SKILL.md','skills/ai-regression-testing/SKILL.md']);
 for(const s of p.sources){assert(s.bytes>0);assert.match(s.sha256,/^[a-f0-9]{64}$/);assert.match(s.git_blob,/^[a-f0-9]{40}$/);assert(s.url.endsWith(p.commit+'/'+s.path));}
 assert.deepEqual(Object.keys(p.files).sort(),['ECC_SOURCES.md','UPSTREAM.md','references/contract-boundaries.md']);
 for(const [f,r] of Object.entries(p.files)){const b=read('engineering-references/'+f);assert.equal(b.length,r.bytes);assert.equal(sha(b),r.sha256);}
 assert.equal(sha(read('engineering-references/SKILL.md')),'7c33875c8b8dcefa54e75fe59bb5fc653318cd2c0a3548cc827d89e87ddaa8bf');
 for(const c of ['Copyright (c) 2026 Affaan Mustafa','THE SOFTWARE IS PROVIDED "AS IS"','CC BY 4.0','No upstream code or substantial prose is copied','No upstream programs, tests, generators or model calls were executed','not a new runtime'])assert(flat(read('engineering-references/ECC_SOURCES.md')).includes(c),c);
});
test('ECC exact history rejects unknown prefix, body and suffix mutations',async()=>{
 const {beforeEccFile,eccTransitions}=await import('./helpers/ecc-snapshot.mjs');
 assert.deepEqual(Object.keys(eccTransitions).sort(),['engineering-references/UPSTREAM.md',target]);
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ecc-history-'));
 try{for(const [p,r] of Object.entries(eccTransitions)){
  const b=read(p),old=beforeEccFile(root,p);assert.equal(sha(b),r.current);assert.equal(sha(old),r.previous);assert.deepEqual(b,Buffer.concat([old,Buffer.from(r.appendix)]));
  fs.mkdirSync(path.dirname(path.join(tmp,p)),{recursive:true});fs.writeFileSync(path.join(tmp,p),old);assert.deepEqual(beforeEccFile(tmp,p),old);
  const mutations=[Buffer.concat([b,Buffer.from('unapproved suffix')])];
  for(const at of [0,Math.floor(b.length/2),b.length-1]){const bad=Buffer.from(b);bad[at]^=1;mutations.push(bad);}
  for(const bad of mutations){fs.writeFileSync(path.join(tmp,p),bad);assert.deepEqual(beforeEccFile(tmp,p),bad);assert.notEqual(sha(bad),r.previous);}
 }}finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
test('ECC docs use existing owner route and resolvable local links only',()=>{
 assert(read('engineering-references/SKILL.md').includes(Buffer.from('[Contract boundaries](references/contract-boundaries.md)')));
 for(const rel of ['engineering-references/ECC_SOURCES.md','engineering-references/UPSTREAM.md',target]){
  const st=fs.lstatSync(path.join(root,rel));assert(st.isFile()&&!st.isSymbolicLink());assert.equal(st.mode&0o111,0);
  for(const [,href] of read(rel).toString().matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
   if(/^(https?:|#)/.test(href))continue;
   const dest=path.resolve(root,path.dirname(rel),href.split('#')[0]);assert(dest.startsWith(path.join(root,'engineering-references')+path.sep));assert(fs.statSync(dest).isFile());
  }
 }
});
