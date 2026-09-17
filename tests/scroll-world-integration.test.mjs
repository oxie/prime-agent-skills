// Documentation, independent arithmetic and history checks; not rendered-media or model efficacy tests.
import test from 'node:test';
import {beforeHiggsfieldFile} from './helpers/higgsfield-snapshot.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ref='cinematic-ui/references/pacing-motion.md';
const read=p=>beforeHiggsfieldFile(root,p);
const sha=b=>createHash('sha256').update(b).digest('hex');
const flat=s=>s.toString().replace(/\s+/g,' ');
const clauses=["authorized website", "not a requirement to animate", "appearance continuity only", "actual decoded boundary frames", "source revision and served derivative", "near the end is not necessarily the final frame", "not proof of exact identity", "several adjacent decoded frames", "with their timestamps", "does not rule out a speed or path jump", "does not recover the physical camera's exact position or velocity", "clip duration, scroll distance and easing", "actual player, not just source playback", "0.005 source seconds per pixel", "otherwise comparable", "twice as fast per scroll pixel", "decoder delay and smoothing", "Do not prescribe equal durations", "authorized checks", "forward and reverse traversal", "media readiness and settling", "desktop and narrow variants where supplied", "distinguishable opaque frames", "a cut, not a blend", "when authorized", "honest cut or static presentation", "Preserve every meaningful state and caption", "one poster must not erase the relationship", "Interactive seeking is not deterministic export", "Report unavailable rendered checks", "no universal similarity threshold or extra model calls"];
test('continuity example keeps distinct evidence and optional authority with deletion controls',()=>{
 const s=read(ref).toString().split('## Optional example: matching frames, discontinuous motion')[1];assert(s);
 assert(s.trim().split(/\s+/).length<440);
 const check=t=>{for(const c of clauses)assert(flat(t).includes(c),c);};check(s);
 for(const c of clauses)assert.throws(()=>check(flat(s).split(c).join('')),{name:'AssertionError'},c);
});
test('worked scroll rates use duration over distance, not matching endpoints',()=>{
 const check=s=>{
  const match=s.match(/a four-second clip over (\d+) CSS pixels advances (\d+(?:\.\d+)?) source seconds per pixel; an eight-second clip over the same distance advances (\d+(?:\.\d+)?)/);assert(match);
  const [,distance,first,second]=match.map(Number);
  const rate=(seconds,pixels)=>seconds/pixels;
  assert.equal(first,rate(4,distance));assert.equal(second,rate(8,distance));
  assert.equal(second/first,2);assert.equal(rate(8,1600),rate(4,800));
  assert.notEqual(rate(4,800),rate(8,800));
 };
 const s=flat(read(ref));check(s);
 for(const [old,bad] of [['0.005','0.05'],['0.01','0.02'],['800 CSS pixels','400 CSS pixels']])assert.throws(()=>check(s.replace(old,bad)),{name:'AssertionError'});
});
test('pinned source notice and current payloads preserve entrypoint and old rights',()=>{
 const p=JSON.parse(read('cinematic-ui/scroll-world-provenance.json'));
 assert.equal(p.commit,'71cc36d3bb150248ae36a2c552f9cbf88802a79c');assert.equal(p.repository,'https://github.com/oso95/scroll-world');
 assert.equal(p.sources.length,4);
 for(const s of p.sources){assert(s.bytes>0);assert.match(s.sha256,/^[a-f0-9]{64}$/);assert.match(s.git_blob,/^[a-f0-9]{40}$/);assert.equal(s.url,p.repository+'/blob/'+p.commit+'/'+s.path);}
 assert.deepEqual(Object.keys(p.files).sort(),['cinematic-ui/SCROLL_WORLD_SOURCES.md','cinematic-ui/UPSTREAM.md',ref].sort());
 for(const [f,r] of Object.entries(p.files)){assert.equal(read(f).length,r.bytes);assert.equal(sha(read(f)),r.sha256);}
 for(const [f,h] of Object.entries(p.unchanged))assert.equal(sha(read(f)),h,f);
 const note=flat(read('cinematic-ui/SCROLL_WORLD_SOURCES.md'));
 for(const c of ['Copyright (c) 2026 cyw','No upstream code or substantial prose is copied','not model effectiveness','No upstream tests or model calls were run'])assert(note.includes(c),c);
 for(const f of Object.keys(p.files)){
  const st=fs.lstatSync(path.join(root,f));assert(st.isFile()&&!st.isSymbolicLink());assert.equal(st.mode&0o111,0);
  for(const [,href] of read(f).toString().matchAll(/\]\(([^)]+)\)/g)){
   if(/^(https?:|#)/.test(href))continue;const dest=path.resolve(root,path.dirname(f),href.split('#')[0]);assert(dest.startsWith(path.join(root,'cinematic-ui')+path.sep));assert(fs.statSync(dest).isFile());
  }
 }
});
test('exact append-only history accepts known successor and exposes unknown mutations',async()=>{
 const {beforeScrollWorldFile,scrollWorldTransitions}=await import('./helpers/scroll-world-snapshot.mjs');
 assert.deepEqual(Object.keys(scrollWorldTransitions).sort(),['cinematic-ui/UPSTREAM.md',ref].sort());
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'scroll-world-history-'));
 try{for(const [p,r] of Object.entries(scrollWorldTransitions)){
  const b=read(p),old=beforeScrollWorldFile(root,p);assert.equal(sha(b),r.current);assert.equal(sha(old),r.previous);assert.deepEqual(b,Buffer.concat([old,Buffer.from(r.appendix)]));
  const f=path.join(tmp,p);fs.mkdirSync(path.dirname(f),{recursive:true});
  for(const clean of [b,old]){fs.writeFileSync(f,clean);assert.deepEqual(beforeScrollWorldFile(tmp,p),old);}
  for(const at of [0,Math.floor(b.length/2),b.length-1]){const bad=Buffer.from(b);bad[at]^=1;fs.writeFileSync(f,bad);assert.deepEqual(beforeScrollWorldFile(tmp,p),bad);}
  const bad=Buffer.concat([b,Buffer.from('unapproved suffix')]);fs.writeFileSync(f,bad);assert.deepEqual(beforeScrollWorldFile(tmp,p),bad);
 }}finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
