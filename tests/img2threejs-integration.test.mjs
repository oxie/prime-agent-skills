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
const owner='canvas-effects',ref='references/reference-driven-3d.md';
const clauses=["optional inspection method", "observed features from inferred hidden geometry", "not permission to download", "not an exact 3D cross-section", "Preserve the original projection", "object-ID/depth pass", "alpha-tested or transparent", "Beauty-render subtraction is not an exact visibility mask", "foreground-mask overlap", "Watertight edge counts do not prove", "feature never recorded during intake", "Unknown illumination does not uniquely determine", "Distinct coordinate-plane counts are not a solidness test", "input uncertainty and project needs", "including relevant uncommitted changes", "Image hashes alone cannot show", "Missing, stale or incomplete evidence is not a pass", "a newer failure must not be outvoted", "actual report and applicable coverage", "high aggregate score cannot override", "unchanged fixture passes", "missing renderer or broken setup is not successful defect detection", "not an executed reconstruction", "do not launch model trials", "static/reduced-motion fallback", "stale-load disposal and owned GPU cleanup", "adds no browser API or renderer"];
const norm=t=>t.replace(/\s+/g,' ');
function check(t){for(const c of clauses)assert(norm(t).includes(c),c);}
test('3D reference retains scoped evidence contracts; each deletion is detected',()=>{
 const t=read(owner+'/'+ref).toString();check(t);
 for(const c of clauses)assert.throws(()=>check(norm(t).replace(c,'')),{name:'AssertionError'},c);
 assert(!t.includes('```'),'guidance only, no executable example');
 assert(t.split(/\s+/).length<1400,'keep the optional reference focused');
});
test('3D history preserves exact earlier bytes and exposes arbitrary mutations',async()=>{
 const {beforeImg2threejsFile,img2threejsTransitions}=await import('./helpers/img2threejs-snapshot.mjs');
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'img2three-history-'));
 try{for(const [p,r] of Object.entries(img2threejsTransitions)){
  const b=read(p),old=beforeImg2threejsFile(root,p);assert.equal(sha(b),r.current);assert.equal(sha(old),r.previous);
  assert.deepEqual(b,Buffer.concat([old,Buffer.from(r.appendix)]));
  assert.deepEqual(b.toString().split('---')[1],old.toString().split('---')[1],'frontmatter unchanged');
  fs.mkdirSync(path.dirname(path.join(tmp,p)),{recursive:true});fs.writeFileSync(path.join(tmp,p),old);
  assert.deepEqual(beforeImg2threejsFile(tmp,p),old);
  for(const at of [0,Math.floor(b.length/2),b.length-1]){const bad=Buffer.from(b);bad[at]^=1;fs.writeFileSync(path.join(tmp,p),bad);assert.deepEqual(beforeImg2threejsFile(tmp,p),bad);}
  const extra=Buffer.concat([b,Buffer.from('unapproved')]);fs.writeFileSync(path.join(tmp,p),extra);assert.deepEqual(beforeImg2threejsFile(tmp,p),extra);
 }}finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
test('3D source identity, full license, conditional route and local links are bound',()=>{
 const p=JSON.parse(read(owner+'/img2threejs-provenance.json'));
 assert.equal(p.repository,'https://github.com/img2threejs/img2threejs');
 assert.equal(p.commit,'6e60b5e22419464b4853e01ddb6c0e6f6659a733');
 assert.equal(p.sources.length,9);assert.equal(new Set(p.sources.map(s=>s.path)).size,9);
 for(const s of p.sources){assert.match(s.sha256,/^[a-f0-9]{64}$/);assert.match(s.git_blob,/^[a-f0-9]{40}$/);assert(s.bytes>0);}
 for(const [f,r]of Object.entries(p.files)){const b=read(owner+'/'+f);assert.equal(sha(b),r.sha256,f);assert.equal(b.length,r.bytes,f);}
 const license=read(owner+'/'+p.license.path);assert.equal(sha(license),p.sources.find(s=>s.path==='LICENSE').sha256);
 for(const c of ['Apache License','Version 2.0','Copyright 2026 hoainho','END OF TERMS AND CONDITIONS'])assert(license.toString().includes(c));
 assert(norm(read(owner+'/SKILL.md').toString()).includes('When an explicitly requested model or interactive 3D scene must match reference images'));
 for(const f of ['SKILL.md','PROVENANCE.md','IMG2THREEJS_SOURCES.md',ref]){
  for(const m of read(owner+'/'+f).toString().matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
   const href=m[1].split('#')[0];if(!href||/^[a-z]+:/i.test(href))continue;
   const target=path.resolve(root,owner,path.dirname(f),href);assert(target.startsWith(path.join(root,owner)+path.sep));assert(fs.statSync(target).isFile(),target);
  }
 }
});
