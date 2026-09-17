// Documentation/history checks only, not compressor or model-effectiveness tests.
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
const clauses=["compact view is a derivative", "producer's completed exit status", "filter's zero exit", "Unknown or incomplete execution stays unknown or incomplete", "say what was omitted", "proves neither a clean run nor complete search coverage", "Leave exact-data outputs intact", "Tool names do not establish safe compression", "leave unrecognized result schemas unchanged", "before any lossy transformation", "keep the original view or report the limit", "does not require saving raw successful logs", "recovery link grants no extra access", "Same session and matching bytes are insufficient", "concurrent sibling's undelivered result", "build remains failed", "shorter display may preserve that supported success", "mark evidence unavailable", "not a compressor, hook or savings guarantee"];
const check=s=>{for(const c of clauses)assert(flat(s).includes(c),c);};
test('compact view guidance preserves decisive contracts and rejects each deletion',()=>{
 const text=read('unlazy/references/token-economy.md').toString();
 const section=text.split('## Compact views must preserve decisive evidence')[1];
 assert(section);assert(section.split(/\s+/).length<600);assert(!section.includes('```'));
 check(section);for(const c of clauses)assert.throws(()=>check(flat(section).split(c).join('REMOVED')),undefined,c);
});
test('exact approved appends preserve history and leave unknown changes visible',async()=>{
 const {beforeChisleFile,chisleTransitions}=await import('./helpers/chisle-snapshot.mjs');
 assert.deepEqual(Object.keys(chisleTransitions).sort(),['unlazy/UPSTREAM.md','unlazy/references/token-economy.md']);
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'chisle-history-'));
 try{for(const [p,r] of Object.entries(chisleTransitions)){
  const b=read(p);assert.equal(sha(b),r.current);assert.equal(sha(beforeChisleFile(root,p)),r.previous);
  assert.equal(Buffer.concat([beforeChisleFile(root,p),Buffer.from(r.appendix)]).compare(b),0);
  fs.mkdirSync(path.dirname(path.join(tmp,p)),{recursive:true});
  const mutations=[Buffer.concat([b,Buffer.from('unapproved suffix')])];
  for(const at of [0,Math.floor(b.length/2),b.length-1]){const bad=Buffer.from(b);bad[at]^=1;mutations.push(bad);}
  for(const bad of mutations){fs.writeFileSync(path.join(tmp,p),bad);assert.deepEqual(beforeChisleFile(tmp,p),bad);assert.notEqual(sha(bad),r.previous);}
 }}finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
test('source pin, current payloads, rights and unchanged activation are explicit',()=>{
 const p=JSON.parse(read('unlazy/chisle-provenance.json'));
 assert.equal(p.commit,'c40fc65e2a65ec1285aac2a018568db8af86d41a');
 assert.equal(p.repository,'https://github.com/JayPokale/Chisle');
 assert.equal(p.sources.length,5);assert.equal(new Set(p.sources.map(s=>s.path)).size,5);
 for(const s of p.sources){assert(s.bytes>0);assert.match(s.sha256,/^[a-f0-9]{64}$/);assert.match(s.git_blob,/^[a-f0-9]{40}$/);assert(s.url.includes(p.commit+'/'+s.path));}
 assert.deepEqual(Object.keys(p.files).sort(),['CHISLE_SOURCES.md','UPSTREAM.md','references/token-economy.md']);
 for(const [rel,r] of Object.entries(p.files)){const b=read('unlazy/'+rel);assert.equal(b.length,r.bytes);assert.equal(sha(b),r.sha256);}
 const note=flat(read('unlazy/CHISLE_SOURCES.md'));
 for(const c of ['MIT, Copyright (c) 2026 Jay Pokale','No upstream code or substantial prose is copied','No upstream code or generated answer was executed','not a compressor','no raw-success-log mandate']){
  if(c==='not a compressor')assert(flat(read('unlazy/references/token-economy.md')).includes(c));else assert(note.includes(c),c);
 }
 assert.equal(sha(read('unlazy/SKILL.md')),'7ea98e4d9665d2912db7127fb917cf0973628e5f62798a4d8e1ead180f03ac96');
 assert.equal(sha(read('unlazy/package.json')),'27eede4a0e746455df0cb29db2349c6074bd8d4a1195977d2e4a426a0cedebd3');
});
test('new owner links resolve locally and payloads are plain files',()=>{
 for(const rel of ['unlazy/references/token-economy.md','unlazy/UPSTREAM.md','unlazy/CHISLE_SOURCES.md']){
  const st=fs.lstatSync(path.join(root,rel));assert(st.isFile()&&!st.isSymbolicLink());assert.equal(st.mode&0o111,0);
  for(const [,href] of read(rel).toString().matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
   if(/^(https?:|#)/.test(href))continue;
   const target=path.resolve(root,path.dirname(rel),href.split('#')[0]);assert(target.startsWith(path.join(root,'unlazy')+path.sep));assert(fs.statSync(target).isFile(),target);
  }
 }
});
