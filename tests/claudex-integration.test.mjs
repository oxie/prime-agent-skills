// Documentation/history checks, not a model reviewer or efficacy experiment.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ref='code-review/references/receiving-feedback.md';
const read=p=>fs.readFileSync(path.join(root,p));
const sha=b=>createHash('sha256').update(b).digest('hex');
const flat=s=>s.toString().replace(/\s+/g,' ');
const clauses=["authorized fix", "does not require another review for every edit", "or authorize implementation", "With permission to fix it", "B is now an author of that delta", "B's R1 review cannot cover the R2 fix", "self-review, not independent review", "does not change who authored or reviewed", "relevant callers and affected proof checks", "not merely the role label", "Retain earlier coverage only where it still applies", "unchanged lines can behave differently", "Where the task requires independent review", "did not author the fix", "final delta and its interactions", "With mixed authorship", "A's own implementation independently reviewed", "A fresh session or different provider alone is not evidence", "no mandatory provider switch", "existing authorized review resources and budgets", "budget is exhausted", "disclose the gap", "rather than claiming approval or launching extra calls", "If independent review is not required", "authorization to fix, commit or publish separate", "no new ledger, model call, runtime or automatic review loop"];
test('role-transition example preserves conditional review and authority with deletion controls',()=>{
 const s=read(ref).toString().split('## Optional example: the reviewer becomes an author')[1];assert(s);
 assert(s.trim().split(/\s+/).length<360);
 const check=t=>{for(const c of clauses)assert(flat(t).includes(c),c);};check(s);
 for(const c of clauses)assert.throws(()=>check(flat(s).split(c).join('')),{name:'AssertionError'},c);
 for(const c of ['author A implements an import limit','checks revision R1','producing R2','limit is applied after a write','moves the check before the write'])assert(flat(s).includes(c));
});
test('pinned source notice and current payloads preserve entrypoint and old rights',()=>{
 const p=JSON.parse(read('code-review/claudex-provenance.json'));
 assert.equal(p.commit,'8cf5e2c1771c5151d90c12642391d0ba8fa71b0e');assert.equal(p.repository,'https://github.com/chaseai-yt/claudex-loop');
 assert.equal(p.sources.length,4);
 for(const s of p.sources){assert(s.bytes>0);assert.match(s.sha256,/^[a-f0-9]{64}$/);assert.match(s.git_blob,/^[a-f0-9]{40}$/);assert.equal(s.url,p.repository+'/blob/'+p.commit+'/'+s.path);}
 assert.deepEqual(Object.keys(p.files).sort(),['code-review/CLAUDEX_SOURCES.md','code-review/UPSTREAM.md',ref].sort());
 for(const [f,r] of Object.entries(p.files)){assert.equal(read(f).length,r.bytes);assert.equal(sha(read(f)),r.sha256);}
 for(const [f,h] of Object.entries(p.unchanged))assert.equal(sha(read(f)),h,f);
 const note=flat(read('code-review/CLAUDEX_SOURCES.md'));
 for(const c of ['Copyright (c) 2026 Chase AI','Copyright (c) 2026 Matt Pocock','No upstream code or substantial prose is copied','not model effectiveness','No upstream tests or model calls were run'])assert(note.includes(c),c);
 for(const f of Object.keys(p.files)){
  const st=fs.lstatSync(path.join(root,f));assert(st.isFile()&&!st.isSymbolicLink());assert.equal(st.mode&0o111,0);
  for(const [,href] of read(f).toString().matchAll(/\]\(([^)]+)\)/g)){
   if(/^(https?:|#)/.test(href))continue;const dest=path.resolve(root,path.dirname(f),href.split('#')[0]);assert(dest.startsWith(path.join(root,'code-review')+path.sep));assert(fs.statSync(dest).isFile());
  }
 }
});
test('exact append-only history accepts known successor and exposes unknown mutations',async()=>{
 const {beforeClaudexFile,claudexTransitions}=await import('./helpers/claudex-snapshot.mjs');
 assert.deepEqual(Object.keys(claudexTransitions).sort(),['code-review/UPSTREAM.md',ref].sort());
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'claudex-history-'));
 try{for(const [p,r] of Object.entries(claudexTransitions)){
  const b=read(p),old=beforeClaudexFile(root,p);assert.equal(sha(b),r.current);assert.equal(sha(old),r.previous);assert.deepEqual(b,Buffer.concat([old,Buffer.from(r.appendix)]));
  const f=path.join(tmp,p);fs.mkdirSync(path.dirname(f),{recursive:true});
  for(const clean of [b,old]){fs.writeFileSync(f,clean);assert.deepEqual(beforeClaudexFile(tmp,p),old);}
  for(const at of [0,Math.floor(b.length/2),b.length-1]){const bad=Buffer.from(b);bad[at]^=1;fs.writeFileSync(f,bad);assert.deepEqual(beforeClaudexFile(tmp,p),bad);}
  const bad=Buffer.concat([b,Buffer.from('unapproved suffix')]);fs.writeFileSync(f,bad);assert.deepEqual(beforeClaudexFile(tmp,p),bad);
 }}finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
