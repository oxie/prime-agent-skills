// Documentation/history contracts only; no upstream or model execution.
import {beforeColeam00File} from './helpers/coleam00-snapshot.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {beforeWikiskillFile,wikiskillTransitions} from './helpers/wikiskill-snapshot.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>beforeColeam00File(root,p);
const sha=b=>createHash('sha256').update(b).digest('hex');
const flat=b=>b.toString().replace(/\s+/g,' ');
const clauses={
 'Evidence from this attempt, not a previous one':[
  'artifact presence is not proof that the current attempt succeeded',
  'actual attempt and relevant input/configuration revision',
  'completed execution result and the artifact',
  'heuristic alone does not establish attempt identity',
  'must be labeled reused',
  'rather than attach an older transcript',
  'Zero tool calls alone does not prove launch failure',
  'do not delete unrelated files or rerun a model',
  'final caller cannot promote the stale artifact to current success'],
 'Empty search with incomplete coverage':[
  'content the tool skipped',
  'completed status, search root, filters/ignore rules, permissions',
  'An error or excluded file is not a successful no-match',
  'only the relevant authorized file',
  'forcing text mode is conditional, not a default search policy',
  'Bound both the files and output',
  'avoid printing raw control characters, secrets or unrelated content',
  'Do not disable all exclusions, traverse outside the approved scope',
  'report incomplete coverage rather than "not present"']
};
function check(t){
 const sections=new Map([...t.matchAll(/^### (.+)\n([\s\S]*?)(?=^### |$(?![\s\S]))/gm)].map(m=>[m[1],flat(m[2])]));
 for(const [h,cs] of Object.entries(clauses)){assert(sections.has(h),h);for(const c of cs)assert(sections.get(h).includes(c),c);}
}
test('two scoped examples and each safeguard deletion are detected',()=>{
 const t=read('engineering-references/references/debugging.md').toString();check(t);
 for(const h of Object.keys(clauses))assert.throws(()=>check(t.replace('### '+h,'### REMOVED')));
 for(const cs of Object.values(clauses))for(const c of cs){
  // Preserve section newlines while removing a clause across wrapped lines.
  const pattern=new RegExp(c.split(/\s+/).map(w=>w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('\\s+'));
  const bad=t.replace(pattern,'REMOVED');assert.notEqual(bad,t,c);assert.throws(()=>check(bad));
 }
});
test('approved history inversions preserve bytes and refuse unknown mutations',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'wikiskill-history-'));
 try{for(const [p,r] of Object.entries(wikiskillTransitions)){
  const b=read(p);assert.equal(sha(b),r.current);assert.equal(sha(beforeWikiskillFile(root,p)),r.previous);
  fs.mkdirSync(path.dirname(path.join(temp,p)),{recursive:true});
  for(const at of [0,Math.floor(b.length/2),b.length-1]){const bad=Buffer.from(b);bad[at]^=1;fs.writeFileSync(path.join(temp,p),bad);assert.deepEqual(beforeWikiskillFile(temp,p),bad);assert.notEqual(sha(bad),r.previous);}
 }}finally{fs.rmSync(temp,{recursive:true,force:true});}
});
test('pinned source notices, current payload and local links are explicit',()=>{
 const owner='engineering-references';const p=JSON.parse(read(owner+'/wikiskill-provenance.json'));
 assert.equal(p.repository,'https://github.com/ashutoshsinghpr7/wikiskill');assert.equal(p.commit,'02fac2c804fe156e43b12c691e4ae527614d63a1');assert.equal(p.sources.length,6);
 for(const s of p.sources){assert.match(s.git_blob,/^[a-f0-9]{40}$/);assert.match(s.sha256,/^[a-f0-9]{64}$/);assert(s.bytes>0);}
 for(const [f,v] of Object.entries(p.files)){const b=read(owner+'/'+f);assert.equal(sha(b),v.sha256);assert.equal(b.length,v.bytes);}
 const notice=read(owner+'/'+p.license_notice).toString();assert(notice.includes('Copyright (c) 2026 Ashutosh Singh'));assert(notice.includes('THE SOFTWARE IS PROVIDED "AS IS"'));
 for(const f of ['references/debugging.md','UPSTREAM.md',p.license_notice]){
  const full=owner+'/'+f;assert.equal(fs.lstatSync(path.join(root,full)).mode&0o111,0);
  for(const [,href] of read(full).toString().matchAll(/\]\(([^)]+)\)/g)){
   if(/^(https?:|#)/.test(href))continue;
   const target=path.resolve(root,path.dirname(full),href.split('#')[0]);assert(target.startsWith(path.join(root,owner)+path.sep));assert(fs.statSync(target).isFile());
  }
 }
});
