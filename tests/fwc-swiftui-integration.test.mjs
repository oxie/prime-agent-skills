// Documentation checks, not an executed resize/device/model trial.
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
const clauses=["Optional structural-resize example", "select an item, enter an unsaved edit and scroll", "compact \u2192 intermediate \u2192 wide \u2192 compact", "Preserve selection, navigation, edits, focus and scroll context", "distinguish intentional context changes from accidental loss", "If useful, reveal a detail/inspector pane without stretching reading lines", "Where relevant, do not reset state or replay pending operations/playback", "each edge's inset independently", "local adjustments for local obstructions", "Not an executed device test or full-app refactor"];
test('resize example preserves context without widening scope; deletion controls',()=>{
 const s=read('hallmark/references/app-quality.md').toString().split('### Structural resize round trip')[1].split('## Accessibility')[0];assert(s);assert(s.split(/\s+/).length<140);
 const check=t=>{for(const c of clauses)assert(flat(t).includes(c),c);};check(s);
 for(const c of clauses)assert.throws(()=>check(flat(s).split(c).join('')),{name:'AssertionError'},c);
 for(const c of ['reachable menu actions','logical reading/focus order','320 CSS px width','desktop resizing does not prove keyboard coverage','without moving focus','not a whole-product gate or full accessibility certification'])assert(flat(read('hallmark/references/app-quality.md')).includes(c),c);
});
test('FWC exact history inverses preserve original bytes; unknown mutations pass through',async()=>{
 const {beforeFwcFile,fwcTransitions}=await import('./helpers/fwc-swiftui-snapshot.mjs');
 assert.deepEqual(Object.keys(fwcTransitions).sort(),['hallmark/UPSTREAM.md','hallmark/references/app-quality.md']);
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'fwc-history-'));
 try{for(const [p,r] of Object.entries(fwcTransitions)){
  const b=read(p),old=beforeFwcFile(root,p);assert.equal(sha(b),r.current);assert.equal(sha(old),r.previous);
  fs.mkdirSync(path.dirname(path.join(tmp,p)),{recursive:true});fs.writeFileSync(path.join(tmp,p),old);assert.deepEqual(beforeFwcFile(tmp,p),old);
  const mutations=[Buffer.concat([b,Buffer.from('unapproved')])];for(const at of [0,Math.floor(b.length/2),b.length-1]){const bad=Buffer.from(b);bad[at]^=1;mutations.push(bad);}
  for(const bad of mutations){fs.writeFileSync(path.join(tmp,p),bad);assert.deepEqual(beforeFwcFile(tmp,p),bad);assert.notEqual(sha(bad),r.previous);}
 }}finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
test('FWC pin, rights, local payloads and unchanged entrypoint are explicit',()=>{
 const p=JSON.parse(read('hallmark/fwc-swiftui-provenance.json'));assert.equal(p.commit,'c2454e6948175e25e61c107c6dc7ebf03e291dfe');assert.equal(p.sources.length,3);
 for(const s of p.sources){assert(s.bytes>0);assert.match(s.sha256,/^[a-f0-9]{64}$/);assert.match(s.git_blob,/^[a-f0-9]{40}$/);}
 assert.deepEqual(Object.keys(p.files).sort(),['FWC_SWIFTUI_SOURCES.md','UPSTREAM.md','references/app-quality.md']);
 for(const [f,r] of Object.entries(p.files)){const b=read('hallmark/'+f);assert.equal(b.length,r.bytes);assert.equal(sha(b),r.sha256);}
 const note=flat(read('hallmark/FWC_SWIFTUI_SOURCES.md'));for(const c of ['MIT, Copyright (c) 2026 FloWritesCode','No upstream code or substantial prose is copied','not interchangeable identity guarantees','No SwiftUI pack','model effectiveness'])assert(note.includes(c),c);
 assert.equal(sha(read('hallmark/SKILL.md')),'b7f63620fbc73f5c0f6b9f452ff79f9ad5f16a0f4f6dcf286fdcf2a061f0de2f');
});
