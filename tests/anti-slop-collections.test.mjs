// Original local fixtures and documentation/history checks; no upstream plugin or model.
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
const clauses=["optional example", "not as a ban on array methods", "hole at index 0", "present `undefined` at index 1", "returns one element", "yields two", "finishes filtering before mapping", "partial consumption", "callback order, indexes", "callback's array argument and `thisArg`", "valid `0`, `false` and empty strings", "Confirm deployed runtime support", "do not polyfill iterator helpers", "fresh and locally owned", "no retained snapshots or shared aliases", "bounded copy is not automatically a performance defect", "behavior-preserving control", "do not prove a speedup", "Do not add a lint rule, dependency or automatic rewrite", "two-slot array with no inherited indexed properties"];
test('optional collection example keeps each semantic and authority distinction',()=>{
 const section=read('ponytail/SKILL.md').toString().split('### Collection refactors: fewer passes are not equivalent behavior')[1]?.split('\n## Complexity review and audit')[0];
 assert(section);assert(section.trim().split(/\s+/).length<310);
 const check=s=>{for(const c of clauses)assert(flat(s).includes(c),c);};
 check(section);for(const c of clauses)assert.throws(()=>check(flat(section).split(c).join('')),{name:'AssertionError'},c);
});
test('holes and present undefined differ, with dense and hole-preserving controls',()=>{
 const input=new Array(2);input[1]=undefined;
 const missing=v=>v===undefined;
 const eager=input.filter(missing);
 const iteratorValues=[...input.values()].filter(missing);
 assert.deepEqual(eager,[undefined]);assert.deepEqual(iteratorValues,[undefined,undefined]);
 assert.equal(0 in input,false);assert.equal(1 in input,true);
 const preserved=[];for(let i=0;i<input.length;i++)if(i in input&&missing(input[i]))preserved.push(input[i]);
 assert.deepEqual(preserved,eager);
 const dense=[undefined,'kept'];assert.deepEqual([...dense.values()].filter(missing),dense.filter(missing));
});
test('equal outputs can conceal different callback order and indexes',()=>{
 const input=[2,3,4],eagerEvents=[],fusedEvents=[],indexes=[];
 const eager=input.filter((v,i,a)=>{assert.equal(a,input);eagerEvents.push(`f${v}`);return v%2===0;})
  .map((v,i,a)=>{assert.deepEqual(a,[2,4]);indexes.push(i);eagerEvents.push(`m${v}`);return v*10;});
 const fused=[];for(const [i,v] of input.entries()){fusedEvents.push(`f${v}`);if(v%2===0){fusedEvents.push(`m${v}`);fused.push(v*10);}}
 assert.deepEqual(eager,fused);assert.deepEqual(indexes,[0,1]);
 assert.deepEqual(eagerEvents,['f2','f3','f4','m2','m4']);assert.deepEqual(fusedEvents,['f2','m2','f3','f4','m4']);
 const filtered=input.filter(v=>v%2===0);assert.deepEqual(filtered.map((v,i)=>[v,i]),[[2,0],[4,1]]);
 assert.deepEqual(input.flatMap((v,i)=>v%2===0?[[v,i]]:[]),[[2,0],[4,2]]);
 const receiver={floor:3};assert.deepEqual(input.filter(function(v){assert.equal(this,receiver);return v>=this.floor;},receiver),[3,4]);
});
test('deferred consumption changes reads and errors; truthiness is not missing-only filtering',()=>{
 // A generator demonstrates the timing distinction without requiring new iterator helpers.
 const source=[1,2],seen=[];
 function* lazy(){for(const v of source){seen.push(v);if(v<0)throw new Error('negative');yield v*2;}}
 const eager=source.map(v=>v*2),stream=lazy();assert.deepEqual(seen,[]);
 assert.equal(stream.next().value,2);assert.deepEqual(seen,[1]);source[1]=-1;
 assert.deepEqual(eager,[2,4]);assert.throws(()=>stream.next(),/negative/);assert.deepEqual(seen,[1,-1]);
 const input=[undefined,0,false,'','ok'];assert.deepEqual(input.filter(Boolean),['ok']);
 assert.deepEqual(input.filter(v=>v!==undefined),[0,false,'','ok']);
});
test('accumulator mutation is equivalent only when earlier versions need not survive',()=>{
 const input=['a','b'],snapshots=[],mutated=[];
 const copied=input.reduce((acc,v)=>{const next=[...acc,v];snapshots.push(next);return next;},[]);
 const inPlace=input.reduce((acc,v)=>{acc.push(v);mutated.push(acc);return acc;},[]);
 assert.deepEqual(copied,inPlace);assert.deepEqual(snapshots,[['a'],['a','b']]);
 assert.deepEqual(mutated,[['a','b'],['a','b']]);assert.equal(mutated[0],mutated[1]);
 const owned=input.reduce((acc,v)=>{acc.push(v);return acc;},[]);assert.deepEqual(owned,copied);assert.deepEqual(input,['a','b']);
});
test('source selection, payloads and rights retain exact identities and limits',()=>{
 const p=JSON.parse(read('ponytail/anti-slop-provenance.json'));
 assert.equal(p.repository,'https://github.com/dmmulroy/anti-slop');assert.equal(p.commit,'c44ef22ca116d0ba62a3ff663a0bd13a3f3fa40b');
 assert.equal(p.sources.length,4);assert.equal(new Set(p.sources.map(s=>s.path)).size,4);
 for(const s of p.sources){assert(s.bytes>0);assert.match(s.sha256,/^[a-f0-9]{64}$/);assert.match(s.git_blob,/^[a-f0-9]{40}$/);assert(s.url.endsWith(p.commit+'/'+s.path));}
 assert.equal(p.primary_documents.length,3);for(const d of p.primary_documents){assert(d.url.startsWith('https://developer.mozilla.org/'));assert.equal(d.status,200);assert.match(d.sha256,/^[a-f0-9]{64}$/);}
 assert.deepEqual(Object.keys(p.files).sort(),['ANTI_SLOP_SOURCES.md','SKILL.md','UPSTREAM.md']);
 for(const [f,r] of Object.entries(p.files)){const b=read('ponytail/'+f);assert.equal(b.length,r.bytes);assert.equal(sha(b),r.sha256);}
 const note=flat(read('ponytail/ANTI_SLOP_SOURCES.md'));
 for(const c of ['Copyright (c) 2026 Dillon Mulroy','No upstream implementation or substantial prose is copied','not a benchmark or model-effectiveness result','No lint pack, installer, Effect policy or dependency is adopted'])assert(note.includes(c),c);
 for(const rel of ['SKILL.md','UPSTREAM.md','ANTI_SLOP_SOURCES.md']){
  const file=path.join(root,'ponytail',rel),st=fs.lstatSync(file);assert(st.isFile()&&!st.isSymbolicLink());assert.equal(st.mode&0o111,0);
  for(const [,href] of fs.readFileSync(file,'utf8').matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
   if(/^(https?:|#)/.test(href))continue;const target=path.resolve(path.dirname(file),href.split('#')[0]);assert(target.startsWith(path.join(root,'ponytail')+path.sep));assert(fs.statSync(target).isFile());
  }
 }
});
test('historical Ponytail bytes are restored only for exact approved changes',async()=>{
 const {beforeCollectionsFile,collectionTransitions}=await import('./helpers/anti-slop-collections-snapshot.mjs');
 assert.deepEqual(Object.keys(collectionTransitions).sort(),['ponytail/SKILL.md','ponytail/UPSTREAM.md']);
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'collections-history-'));
 try{for(const [p,r] of Object.entries(collectionTransitions)){
  const b=read(p),old=beforeCollectionsFile(root,p);assert.equal(sha(b),r.current);assert.equal(sha(old),r.previous);
  const dest=path.join(tmp,p);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,old);assert.deepEqual(beforeCollectionsFile(tmp,p),old);
  assert.equal(b.toString().split(r.addition).length,2);assert.equal(b.toString().replace(r.addition,''),old.toString());
  if(p==='ponytail/SKILL.md')assert.equal(b.toString().split('---')[1],old.toString().split('---')[1]);
  for(const at of [0,Math.floor(b.length/2),b.length-1]){const bad=Buffer.from(b);bad[at]^=1;fs.writeFileSync(dest,bad);assert.deepEqual(beforeCollectionsFile(tmp,p),bad);}
  const suffix=Buffer.concat([b,Buffer.from('unapproved')]);fs.writeFileSync(dest,suffix);assert.deepEqual(beforeCollectionsFile(tmp,p),suffix);
 }}finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
