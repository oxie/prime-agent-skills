// Documentation and exact historical-byte contracts only; no upstream scanner or model.
import {beforeOkfFile} from './helpers/okf-snapshot.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ref='marketingskills/skills/copy-editing/references/source-fidelity-and-clarity.md';
const read=p=>beforeOkfFile(root,p);
const sha=b=>createHash('sha256').update(b).digest('hex');
const flat=s=>s.toString().replace(/\s+/g,' ');
const clauses=["authorized edit already involves a checker", "no required tool or extra editing pass", "snippets are fictional", "only an internal placeholder", "filtered view, not the reader-facing sentence", "Do not count extractor placeholders as prose", "Empty, partial, unsupported or failed checks are not clean coverage", "which relevant content was excluded", "when they are in the requested scope", "changed \u201cmay take up to\u201d into a fixed duration", "lost \u201cduring maintenance\u201d", "invented a personal recommendation", "Notes claiming fidelity are not evidence", "does not verify that the claim is true", "exact final body intended for delivery", "earlier draft, command banner or change notes", "visibly labeled unresolved details", "If output separation is ambiguous", "recheck the affected text", "neither factual support nor authorship", "grants no permission to publish", "No scanner, automatic model call, new ledger or publication gate"];
test('optional final-copy example retains coverage, fidelity and authority boundaries',()=>{
 const s=read(ref).toString().split('## Optional example: a clean check of the wrong text')[1];
 assert(s);assert(s.trim().split(/\s+/).length<360);
 const check=t=>{for(const c of clauses)assert(flat(t).includes(c),c);};check(s);
 for(const c of clauses)assert.throws(()=>check(flat(s).split(c).join('')),{name:'AssertionError'},c);
 // Exact fictional pair check, not a semantic grader or a model-generated output.
 const q=[...s.matchAll(/“([^”]+)”/g)].map(m=>flat(m[1]));
 assert(q.includes('Exports may take up to two minutes during maintenance.'));
 assert(q.includes('Exports take two minutes. I recommend this service.'));
 assert(q.includes('During maintenance, exports may take up to two minutes.'));
 assert(flat(s).includes('It preserves the supplied claim; it does not verify that the claim is true.'));
});
test('SlopMonster provenance binds sources, notice and unchanged routing',()=>{
 const p=JSON.parse(read('marketingskills/slopmonster-provenance.json'));
 assert.equal(p.repository,'https://github.com/ItsssssJack/SlopMonster');assert.equal(p.commit,'f261dbf11c2a206ecd8780c070a46dae64edd8be');
 assert.equal(p.sources.length,5);assert.equal(new Set(p.sources.map(s=>s.path)).size,5);
 for(const s of p.sources){assert(s.bytes>0);assert.match(s.sha256,/^[a-f0-9]{64}$/);assert.match(s.git_blob,/^[a-f0-9]{40}$/);assert(s.url.endsWith(p.commit+'/'+s.path));}
 assert.deepEqual(Object.keys(p.files).sort(),['marketingskills/MANIFEST.json','marketingskills/SLOPMONSTER_SOURCES.md','marketingskills/UPSTREAM.md',ref].sort());
 for(const [f,r] of Object.entries(p.files)){const b=read(f);assert.equal(b.length,r.bytes);assert.equal(sha(b),r.sha256);}
 assert.equal(sha(read('marketingskills/skills/copy-editing/SKILL.md')),'9a1b911cc508d873e08364761ec64f96bb2ea9a5ee5a9276692c38066280ec35');
 const note=flat(read('marketingskills/SLOPMONSTER_SOURCES.md'));
 for(const c of ['Copyright (c) 2026 Jack Roberts','No upstream code or substantial prose is copied','No upstream tests or model calls were run','not model effectiveness or factual verification','Jasper copy and repository illustrations are not reused'])assert(note.includes(c),c);
 for(const f of [ref,'marketingskills/SLOPMONSTER_SOURCES.md','marketingskills/UPSTREAM.md']){
  const st=fs.lstatSync(path.join(root,f));assert(st.isFile()&&!st.isSymbolicLink());assert.equal(st.mode&0o111,0);
  for(const [,href] of read(f).toString().matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
   if(/^(https?:|#)/.test(href))continue;const target=path.resolve(root,path.dirname(f),href.split('#')[0]);assert(target.startsWith(path.join(root,'marketingskills')+path.sep));assert(fs.statSync(target).isFile());
  }
 }
});
test('exact additions preserve previous reference and history; manifest changes only owner digest',async()=>{
 const {beforeSlopMonsterFile,slopMonsterTransitions}=await import('./helpers/slopmonster-snapshot.mjs');
 assert.deepEqual(Object.keys(slopMonsterTransitions).sort(),['marketingskills/UPSTREAM.md',ref].sort());
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'slopmonster-history-'));
 try{for(const [p,r] of Object.entries(slopMonsterTransitions)){
  const b=read(p),old=beforeSlopMonsterFile(root,p);assert.equal(sha(b),r.current);assert.equal(sha(old),r.previous);assert.deepEqual(b,Buffer.concat([old,Buffer.from(r.appendix)]));
  const dest=path.join(tmp,p);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,old);assert.deepEqual(beforeSlopMonsterFile(tmp,p),old);
  for(const at of [0,Math.floor(b.length/2),b.length-1]){const bad=Buffer.from(b);bad[at]^=1;fs.writeFileSync(dest,bad);assert.deepEqual(beforeSlopMonsterFile(tmp,p),bad);}
  const bad=Buffer.concat([b,Buffer.from('unapproved suffix')]);fs.writeFileSync(dest,bad);assert.deepEqual(beforeSlopMonsterFile(tmp,p),bad);
 }}finally{fs.rmSync(tmp,{recursive:true,force:true});}
 const p=JSON.parse(read('marketingskills/slopmonster-provenance.json')),bytes=read('marketingskills/MANIFEST.json'),m=JSON.parse(bytes);
 const current=m.skills.find(s=>s.name==='copy-editing').sha256;
 assert.equal(current,p.owner_digest.current);assert.equal(bytes.toString().split(current).length,2);
 assert.equal(sha(Buffer.from(bytes.toString().replace(current,p.owner_digest.previous))),p.previous_manifest_sha256);
 const dir=path.join(root,'marketingskills/skills/copy-editing'),files=[];
 function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){assert(!e.isSymbolicLink());const f=path.join(d,e.name);if(e.isDirectory())walk(f);else{assert(e.isFile());files.push(f);}}}walk(dir);
 const h=createHash('sha256');for(const f of files.sort()){h.update(path.relative(dir,f).split(path.sep).join('/'));h.update('\0');h.update(fs.readFileSync(f));h.update('\0');}assert.equal(h.digest('hex'),current);
});
