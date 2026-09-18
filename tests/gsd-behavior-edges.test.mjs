// Static guidance/identity controls, not application execution or agent-efficacy trials.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {beforeGsdFile,gsdTransitions} from './helpers/gsd-snapshot.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p));
const sha=b=>createHash('sha256').update(b).digest('hex');
const flat=s=>s.toString().replace(/\s+/g,' ');
function retains(text,phrases){for(const c of phrases)assert(flat(text).includes(c),c);}
const clauses=["Use this optional contrast when a requirement permits materially different results", "not as a checklist for every change", "Reuse an established rule", "observed behavior alone does not establish that the choice was approved", "Choose a concrete input that separates plausible meanings", "Select only relevant questions", "not an exhaustive taxonomy or authority to add features, limits or prohibitions", "accepted rule and its source", "precise unresolved question and decision owner", "Explain a consequential dismissal", "do not invent a test expectation", "Continue independent authorized work", "active plan, affected worker brief and observing check", "missing intent", "missing execution evidence", "property test or observed output cannot supply missing intent", "written acceptance example cannot supply missing execution evidence", "pending, not verified", "no test framework or status schema", "static heading typo needs none of these questions", "does not report executed application tests or model-effectiveness results"];
const example=["11 ASCII `a` characters", "combining acute accent U+0301", "first 12 code units end at an unaccented `e`", "first 12 grapheme clusters retain `e` with its accent", "ASCII-only examples cannot distinguish", "Neither choice is approved by the word \u201ccharacters\u201d alone", "already specifies grapheme clusters, use that rule without a new question", "name the unit choice as unresolved", "successful `slice(0, 12)` run is not approval", "retain the first 12 grapheme clusters unchanged; add no ellipsis", "preserve both conditions", "11, 12 and 13 clusters, empty input", "Assert the exact retained text and no ellipsis", "not just a length measured in the implementation's possibly wrong unit", "independent of the production segmentation helper", "Do not expand this into a Unicode normalization or internationalization project"];
function section(){return flat(read('unlazy/references/product-intent.md')).split('## Discover an unstated behavior rule')[1].split('## Check coherence, then preservation')[0];}
test('optional discovery preserves intent authority, relevant scope and downstream evidence',()=>{
 const text=section();retains(text,clauses);
 for(const c of clauses)assert.throws(()=>retains(text.split(c).join('REMOVED'),clauses),undefined,c);
});
test('worked contrast distinguishes representation, exact expectation and no-change controls',()=>{
 const text=section();retains(text,example);
 for(const c of example)assert.throws(()=>retains(text.split(c).join('REMOVED'),example),undefined,c);
});
test('misleading approval, completeness and weakened-assertion mutations fail',()=>{
 const text=section(),checks=[...clauses,...example];
 for(const [from,to] of [
  ['observed behavior alone does not establish','observed behavior alone establishes'],
  ['Neither choice is approved','Either choice is approved'],
  ['already specifies grapheme clusters, use that rule without a new question','already specifies grapheme clusters, ask for approval again'],
  ['retain the first 12 grapheme clusters unchanged; add no ellipsis','retain 12 code units; add an ellipsis'],
  ['Assert the exact retained text and no ellipsis','Assert only that the call succeeds'],
  ['pending, not verified','verified'],
  ['static heading typo needs none of these questions','static heading typo requires every question'],
 ]){assert(text.includes(from));assert.throws(()=>retains(text.replace(from,to),checks),undefined,from);}
});
const expected={"repository": "https://github.com/open-gsd/gsd-core", "commit": "c9a5cc3e1288b432305aa8eea881fa2eab883083", "package_version": "1.14.0", "adaptation": "Original optional behavior-rule contrast; no upstream execution or measured agent-effectiveness claim.", "sources": [{"path": "gsd-core/references/edge-probe.md", "ranges": [[62, 113], [143, 155], [304, 307]], "bytes": 19717, "sha256": "d28899e29723d906af53a1c4e0bcf6594714149769b96084edb862fc401cee5d", "git_blob": "ab6c2bf20ee999dfc104f1635c14b0506b9e82f1", "url": "https://github.com/open-gsd/gsd-core/blob/c9a5cc3e1288b432305aa8eea881fa2eab883083/gsd-core/references/edge-probe.md"}, {"path": "LICENSE", "ranges": [[1, 21]], "bytes": 1065, "sha256": "3a160aec61eeb28e75e8017346ee190db07986a09c4bd72555cc706f1d99e27e", "git_blob": "d47f8ea21c0c46de01da7f0f61f92d4bee44631b", "url": "https://github.com/open-gsd/gsd-core/blob/c9a5cc3e1288b432305aa8eea881fa2eab883083/LICENSE"}, {"path": "package.json", "ranges": [[1, 10]], "bytes": 11464, "sha256": "a4a46bd57ba146bd3905d8c3110ad2d47de90f7f79daeb0a8d34a70ae1c77567", "git_blob": "292dba2af65173330bebee9c9f790a2841e05257", "url": "https://github.com/open-gsd/gsd-core/blob/c9a5cc3e1288b432305aa8eea881fa2eab883083/package.json"}], "files": {"references/product-intent.md": {"bytes": 9630, "sha256": "8122cfc63bc3ef7e8ad8656606698aa8530732a1e81ad46fdde83b36228a12a1"}, "UPSTREAM.md": {"bytes": 4278, "sha256": "acb58aaed37223debedb55966d717dc0feb160767658840f808d04cf38a40196"}, "GSD_SOURCES.md": {"bytes": 2400, "sha256": "00467c8748cef1b30f1ff82c2a544c713344b8a95cab32bc03d49bf4119ad5a0"}, "licenses/gsd-MIT.txt": {"bytes": 1065, "sha256": "3a160aec61eeb28e75e8017346ee190db07986a09c4bd72555cc706f1d99e27e"}}};
test('selected source and delivered payload identities, rights and limits are exact',()=>{
 assert.deepEqual(JSON.parse(read('unlazy/gsd-provenance.json')),expected);
 for(const [p,r] of Object.entries(expected.files)){
  const b=read('unlazy/'+p);assert.equal(b.length,r.bytes);assert.equal(sha(b),r.sha256);
  assert.notEqual(sha(Buffer.concat([b,Buffer.from('unknown addition')])),r.sha256);
 }
 const license=read('unlazy/licenses/gsd-MIT.txt');
 retains(license,['Copyright (c) 2026 Open GSD','The above copyright notice and this permission notice shall be included','THE SOFTWARE IS PROVIDED "AS IS"']);
 retains(read('unlazy/GSD_SOURCES.md'),['no upstream package was installed or executed','No upstream code or substantial instructional passage is copied','not a whole-repository or dependency-license clearance','No GSD runtime','not establish measured agent effectiveness']);
});
test('history inversion accepts only the two exact approved additions and exposes mutations',()=>{
 assert.deepEqual(Object.keys(gsdTransitions).sort(),['unlazy/UPSTREAM.md','unlazy/references/product-intent.md']);
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'gsd-history-'));
 try{for(const [p,r] of Object.entries(gsdTransitions)){
  const b=read(p);assert.equal(sha(b),r.current);
  const old=beforeGsdFile(root,p);assert.equal(sha(old),r.previous);
  const target=path.join(tmp,p);fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.writeFileSync(target,old);assert.deepEqual(beforeGsdFile(tmp,p),old);
  const mutations=[Buffer.concat([b,Buffer.from('unapproved suffix')])];
  for(const at of [0,Math.floor(b.length/2),b.length-1]){const bad=Buffer.from(b);bad[at]^=1;mutations.push(bad);}
  for(const bad of mutations){fs.writeFileSync(target,bad);assert.deepEqual(beforeGsdFile(tmp,p),bad);}
 }}finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
const unchanged={"unlazy/SKILL.md": "3f0b5bf840aadb013564738e61ac926e17aeb7adadf1c9d847decb4f1868a981", "unlazy/package.json": "27eede4a0e746455df0cb29db2349c6074bd8d4a1195977d2e4a426a0cedebd3", "unlazy/scripts/gate-check.mjs": "29dee3acfdf566c24eedace85163a4e7a66eda01b712c5b4b76a99eae1eda8a1", "unlazy/scripts/gate-lint.mjs": "12fedaa4ad7bcfacf6da8d66f4ead0d186115e03fe941d3d20efd361dec7ee7e", "unlazy/references/decision-verification.md": "503a0cbe1e9bbe26a29145608207f38ebe27a42f2d8279c531ed9b6374ea3601", "unlazy/references/prime.md": "81305fda0d9b561d6d23dc0b48004ec02a52c330346747d1b5c6b26a67436163", "unlazy/bmad-provenance.json": "85795ee9e688db4da373f82d21636698b0cd7091ae1b350d6d72db01f0ee62d3", "unlazy/gstack-provenance.json": "29e0c23c772c935c576b89b00592016bbd1c35c99ffe457263a09e22bac65e3e", "engineering-references/SKILL.md": "b1dc343c0cb25c98235c2011ac37053f50323856d7f740391d3a3c8678b33f3a", "engineering-references/references/test-design.md": "9a274414496a8d1d05b52a6faa80d512d700d4d6e5e31055be4a2b8d50e4a94f", "engineering-references/references/debugging.md": "aabde64e5635833179762fb4eae688f28dc64a429ca64dd8c34c7b501c2a350d", "engineering-references/references/interface-design.md": "6fd122f55c2b26a928c99fd0c7626c1cf64afbc7f0934ba0025bb525f611c03c", "task-observer/SKILL.md": "1644c34ecff4a288c3451221cbd3db798d21425af8bb737dadf8f0a6c971fdd0"};
test('existing entrypoint, runtime, handoffs and Engineering owners are unchanged',()=>{
 for(const [p,h] of Object.entries(unchanged))assert.equal(sha(read(p)),h,p);
 retains(read('unlazy/SKILL.md'),['shaping rough product intent','[product-intent shaping](references/product-intent.md)']);
});
test('payloads are non-executable regular files and local owner links resolve',()=>{
 for(const rel of [...Object.keys(expected.files),'gsd-provenance.json']){
  const p='unlazy/'+rel,st=fs.lstatSync(path.join(root,p));assert(st.isFile()&&!st.isSymbolicLink());assert.equal(st.mode&0o111,0);
  if(!rel.endsWith('.md'))continue;
  for(const [,href] of read(p).toString().matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
   if(/^(https?:|#)/.test(href))continue;
   const target=path.resolve(root,'unlazy',path.dirname(rel),href.split('#')[0]);
   assert(target.startsWith(path.join(root,'unlazy')+path.sep));assert(fs.statSync(target).isFile(),target);
  }
 }
});
