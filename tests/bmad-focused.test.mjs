// Documentation and native-loading contracts, not an application or agent trial.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {beforeBmadFile,bmadTransitions} from './helpers/bmad-snapshot.mjs';
import {beforeGsdFile} from './helpers/gsd-snapshot.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>beforeGsdFile(root,p);
const sha=b=>createHash('sha256').update(b).digest('hex');
const flat=s=>s.toString().replace(/\s+/g,' ');
function retains(text,phrases){for(const c of phrases)assert(flat(text).includes(c),c);}
const clauses={"unlazy/references/product-intent.md": ["Skip this for a clear bug fix or an already sufficient plan", "not a mandatory document, interview, planning phase or new tracker", "Do not invent user research, approval, success metrics or product decisions", "Purpose and user", "Capability and success", "Consequential constraints", "Non-goals", "Assumptions and open questions", "Missing detail is not automatically a non-goal", "Do not execute a material assumption as if approved", "passing an implementation test does not prove adoption", "check whether the stated capabilities and constraints can coexist", "walk the authoritative input claim by claim", "relevant section/revision", "required supporting material", "background provenance", "A source link alone does not prove its obligations were preserved", "every consequential claim is present and checked", "do not present the brief as complete or dispatch that work as ready", "Carry the brief and required supporting material into affected worker briefs and checks", "does not replace it, change gate semantics or authorize extra tools"], "engineering-references/references/interface-design.md": ["Optional architecture compatibility check", "do not require a new architecture document or a review for every edit", "Existing higher-scope decisions stay binding", "not proof that a bug or accidental convention is an approved requirement", "two implementations that obey every written decision yet disagree", "implementation defect, not a missing architecture decision", "**Binds:**", "**Prevents:**", "**Rule:**", "smallest binding decision", "no parallel memory log", "preserve required real-boundary tests", "a paper counterexample proves runtime behavior", "If no consequential gap is supported, add no rule", "Do not standardize harmless internal choices", "not safe to defer"]};
const examples={"unlazy/references/product-intent.md": ["tenant isolation, lifetime, revocation, required columns and the delivery exclusion", "fixture's expected rows and columns match", "another tenant gets no content", "revoke access after generation and a new download gets no content", "delete generated files by creation time plus seven days", "Verify both deletion and denial, not just a hidden link", "no scheduled delivery", "outside executable scope unless accepted", "actual path and revision supplied in a real brief", "maximum export size is not supplied", "active plan, affected worker briefs and verification gates", "generation unit test alone cannot establish download authorization or actual file deletion", "same-action retest", "No tests of this fictional application were executed"], "engineering-references/references/interface-design.md": ["Both can follow that weak note, but their timing choices conflict", "A already violates the fuller product contract", "not permission to relax the product requirement", "export worker, download handler and storage delivery boundary", "current tenant membership and administrator role, export ownership and expiry before releasing content", "An issued storage URL must not bypass these checks", "expiry denial alone does not prove deletion", "post-revocation URL is no longer compliant", "not merely add a permission check to a UI button", "does not promise to erase bytes already delivered", "in-flight response is a separate product decision", "Do not defer authorization timing or required columns", "including through any issued URL", "intended running revision", "not executed results or measured agent effectiveness"]};
for(const [p,checks] of Object.entries(clauses))test(p+' retains scoped planning and safety contracts',()=>{
 const text=flat(read(p));retains(text,checks);
 for(const c of checks)assert.throws(()=>retains(text.split(c).join('REMOVED'),checks),undefined,c);
});
for(const [p,checks] of Object.entries(examples))test(p+' connects obligations, boundaries and real verification limits',()=>{
 const text=flat(read(p)).split('Connected fictional example: tenant audit export')[1];
 assert(text);retains(text,checks);
 for(const c of checks)assert.throws(()=>retains(text.replace(c,'UNSUPPORTED PASS'),checks),undefined,c);
});
test('misleading compressed scope and permissive architecture mutations fail the delivered examples',()=>{
 const cases=[
  ['unlazy/references/product-intent.md','another tenant gets no content','another tenant gets content'],
  ['unlazy/references/product-intent.md','no scheduled delivery','scheduled delivery required'],
  ['unlazy/references/product-intent.md','No tests of this fictional application were executed','Application tests passed'],
  ['engineering-references/references/interface-design.md','An issued storage URL must not bypass these checks','An issued storage URL may bypass these checks'],
  ['engineering-references/references/interface-design.md','current tenant membership','original tenant membership'],
  ['engineering-references/references/interface-design.md','expiry denial alone does not prove deletion','expiry denial alone proves deletion'],
 ];
 for(const [p,from,to] of cases){const text=flat(read(p));assert(text.includes(from));assert.throws(()=>retains(text.replace(from,to),examples[p]));}
});
const expected={"unlazy": {"repository": "https://github.com/bmad-code-org/BMAD-METHOD", "commit": "0a00053409731db811f2595ceb521dff9dde9a19", "sampled_module_version": "6.13.0-next", "adaptation": "Original optional Prime planning guidance. No upstream runtime execution or measured agent-effectiveness claim.", "sources": [{"path": "skills/bmad-spec/SKILL.md", "ranges": [[81, 126], [156, 160]], "bytes": 17152, "sha256": "779378dfc233fc5550126f7858fe22f75c1958d0e1097cf9f9820e87a36ac043", "git_blob": "c9d085fe0381fae87614732859ba79acbfeaef65", "url": "https://github.com/bmad-code-org/BMAD-METHOD/blob/0a00053409731db811f2595ceb521dff9dde9a19/skills/bmad-spec/SKILL.md"}, {"path": "skills/bmad-spec/assets/spec-template.md", "ranges": [[1, 49]], "bytes": 2361, "sha256": "4b3a032c045fdd0903933446fc07f93e879997f28a0294ed4344da71192b20ee", "git_blob": "d7568fa850aee7b4400e296edc353206fc6e6593", "url": "https://github.com/bmad-code-org/BMAD-METHOD/blob/0a00053409731db811f2595ceb521dff9dde9a19/skills/bmad-spec/assets/spec-template.md"}, {"path": "docs/plan/choose-a-planning-path.md", "ranges": [[17, 65]], "bytes": 12344, "sha256": "8e3142ea1ef11fadb2ca2d0fb8bb783134e4301da2d1e8522aaad255d73d40db", "git_blob": "bd49daaf2e181fe859aa0d83c976c297865ff9fe", "url": "https://github.com/bmad-code-org/BMAD-METHOD/blob/0a00053409731db811f2595ceb521dff9dde9a19/docs/plan/choose-a-planning-path.md"}, {"path": "LICENSE", "ranges": [[1, 30]], "bytes": 1572, "sha256": "0aa79baf6328b4a1e694ce10a12ffc36d7666554da128dff0e8fcda0fc536a66", "git_blob": "557212d307dbed13aa72e8f158c9e4a626a3243a", "url": "https://github.com/bmad-code-org/BMAD-METHOD/blob/0a00053409731db811f2595ceb521dff9dde9a19/LICENSE"}, {"path": "TRADEMARK.md", "ranges": [[1, 55]], "bytes": 2805, "sha256": "ce57ad749e43277c6021e5d5085980b33c9bf8f67a070bbbf07e041ccdddc58b", "git_blob": "e6ae5784827ee30a0c728e438efa9fbacdac23f2", "url": "https://github.com/bmad-code-org/BMAD-METHOD/blob/0a00053409731db811f2595ceb521dff9dde9a19/TRADEMARK.md"}, {"path": "CONTRIBUTORS.md", "ranges": [[1, 32]], "bytes": 1331, "sha256": "1f0d0736ff06fcea2c504834b9d13196f37ca57fae5cf9054899dcec4ed36ad4", "git_blob": "f36cc81fb2b54e554282b850c800898aa21ee7b7", "url": "https://github.com/bmad-code-org/BMAD-METHOD/blob/0a00053409731db811f2595ceb521dff9dde9a19/CONTRIBUTORS.md"}], "files": {"SKILL.md": {"bytes": 13466, "sha256": "3f0b5bf840aadb013564738e61ac926e17aeb7adadf1c9d847decb4f1868a981"}, "UPSTREAM.md": {"bytes": 3820, "sha256": "ad4c46b6dcc96791ed33ef9969162b20133756348ca7d1eea3493254aa6496ca"}, "BMAD_SOURCES.md": {"bytes": 2836, "sha256": "50df1473c69eabaf43fae0e75d787897d7ab2030838355b3a129a0fad5bba4ae"}, "licenses/bmad-MIT.txt": {"bytes": 1572, "sha256": "0aa79baf6328b4a1e694ce10a12ffc36d7666554da128dff0e8fcda0fc536a66"}, "references/product-intent.md": {"bytes": 6227, "sha256": "b9d30de8714c8852b7c0a70a6f0d90e638cd9adfbca2f1bf5de180509970ff37"}}}, "engineering-references": {"repository": "https://github.com/bmad-code-org/BMAD-METHOD", "commit": "0a00053409731db811f2595ceb521dff9dde9a19", "sampled_module_version": "6.13.0-next", "adaptation": "Original optional Prime planning guidance. No upstream runtime execution or measured agent-effectiveness claim.", "sources": [{"path": "skills/bmad-architecture/SKILL.md", "ranges": [[9, 35]], "bytes": 13939, "sha256": "2c3401fe79e33fc12189f69d3f370db5390b12ae610ff8a14ea3b05bcd263e38", "git_blob": "d8444c5d348816f5e4172b7137fe23a4b33c4a60", "url": "https://github.com/bmad-code-org/BMAD-METHOD/blob/0a00053409731db811f2595ceb521dff9dde9a19/skills/bmad-architecture/SKILL.md"}, {"path": "skills/bmad-architecture/assets/spine-template.md", "ranges": [[24, 40], [52, 79]], "bytes": 4357, "sha256": "ef4ff795624eb5439fae54a06edb389feb5a0cf79cb01ae007af51109335d198", "git_blob": "56329f4838e97adce4c8971d8e53e25e8df18892", "url": "https://github.com/bmad-code-org/BMAD-METHOD/blob/0a00053409731db811f2595ceb521dff9dde9a19/skills/bmad-architecture/assets/spine-template.md"}, {"path": "skills/bmad-architecture/customize.toml", "ranges": [[87, 101]], "bytes": 6335, "sha256": "e9c5f75bd6605199f3908d6a1f013d6b42fb12b6f35c9a5e13a44f7f872b7b79", "git_blob": "b8867733fd146b95b66b4c846ce07fab82e24a7a", "url": "https://github.com/bmad-code-org/BMAD-METHOD/blob/0a00053409731db811f2595ceb521dff9dde9a19/skills/bmad-architecture/customize.toml"}, {"path": "LICENSE", "ranges": [[1, 30]], "bytes": 1572, "sha256": "0aa79baf6328b4a1e694ce10a12ffc36d7666554da128dff0e8fcda0fc536a66", "git_blob": "557212d307dbed13aa72e8f158c9e4a626a3243a", "url": "https://github.com/bmad-code-org/BMAD-METHOD/blob/0a00053409731db811f2595ceb521dff9dde9a19/LICENSE"}, {"path": "TRADEMARK.md", "ranges": [[1, 55]], "bytes": 2805, "sha256": "ce57ad749e43277c6021e5d5085980b33c9bf8f67a070bbbf07e041ccdddc58b", "git_blob": "e6ae5784827ee30a0c728e438efa9fbacdac23f2", "url": "https://github.com/bmad-code-org/BMAD-METHOD/blob/0a00053409731db811f2595ceb521dff9dde9a19/TRADEMARK.md"}, {"path": "CONTRIBUTORS.md", "ranges": [[1, 32]], "bytes": 1331, "sha256": "1f0d0736ff06fcea2c504834b9d13196f37ca57fae5cf9054899dcec4ed36ad4", "git_blob": "f36cc81fb2b54e554282b850c800898aa21ee7b7", "url": "https://github.com/bmad-code-org/BMAD-METHOD/blob/0a00053409731db811f2595ceb521dff9dde9a19/CONTRIBUTORS.md"}], "files": {"SKILL.md": {"bytes": 9420, "sha256": "b1dc343c0cb25c98235c2011ac37053f50323856d7f740391d3a3c8678b33f3a"}, "UPSTREAM.md": {"bytes": 9181, "sha256": "2ed1831e3761a7d21e148d0363ce8ae05b7c8ca3a8a8297c94c6e6dc514803ab"}, "BMAD_SOURCES.md": {"bytes": 2880, "sha256": "83cc3f554a93665a2065d40f755fdfa9d78ec0dc241a99356caf042976df72bc"}, "licenses/bmad-MIT.txt": {"bytes": 1572, "sha256": "0aa79baf6328b4a1e694ce10a12ffc36d7666554da128dff0e8fcda0fc536a66"}, "references/interface-design.md": {"bytes": 10493, "sha256": "6fd122f55c2b26a928c99fd0c7626c1cf64afbc7f0934ba0025bb525f611c03c"}}}};
test('pinned source and current adaptation identities with full MIT notice are exact',()=>{
 for(const [owner,e] of Object.entries(expected)){
  assert.deepEqual(JSON.parse(read(owner+'/bmad-provenance.json')),e);
  for(const [rel,r] of Object.entries(e.files)){
   const b=read(owner+'/'+rel);assert.equal(b.length,r.bytes);assert.equal(sha(b),r.sha256);
   assert.notEqual(sha(Buffer.concat([b,Buffer.from('unknown addition')])),r.sha256);
  }
  const rights=read(owner+'/licenses/bmad-MIT.txt');
  assert.equal(sha(rights),'0aa79baf6328b4a1e694ce10a12ffc36d7666554da128dff0e8fcda0fc536a66');
  retains(rights,['Copyright (c) 2025 BMad Code, LLC','The above copyright notice and this permission notice shall be included','THE SOFTWARE IS PROVIDED "AS IS"','TRADEMARK NOTICE:']);
  retains(read(owner+'/BMAD_SOURCES.md'),['not executed','do not establish improved agent effectiveness','Names and logos are separate trademarks','no endorsement','not a whole-repository license certification','No upstream runtime','Older provenance files describe their original historical payloads']);
 }
});
test('exact approved transitions preserve historic payloads and unknown mutations stay visible',()=>{
 assert.deepEqual(Object.keys(bmadTransitions).sort(),['engineering-references/SKILL.md','engineering-references/UPSTREAM.md','engineering-references/references/interface-design.md','unlazy/SKILL.md','unlazy/UPSTREAM.md']);
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'bmad-history-'));
 try{for(const [p,r] of Object.entries(bmadTransitions)){
  const b=read(p);assert.equal(sha(b),r.current);assert.equal(sha(beforeBmadFile(root,p)),r.previous);
  const target=path.join(tmp,p);fs.mkdirSync(path.dirname(target),{recursive:true});
  const mutations=[Buffer.concat([b,Buffer.from('unapproved suffix')])];
  for(const at of [0,Math.floor(b.length/2),b.length-1]){const bad=Buffer.from(b);bad[at]^=1;mutations.push(bad);}
  for(const bad of mutations){fs.writeFileSync(target,bad);assert.deepEqual(beforeBmadFile(tmp,p),bad);}
 }}finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
test('optional owner routing and non-executable payloads keep reference bodies on demand',()=>{
 retains(read('unlazy/SKILL.md'),['shaping rough product intent','[product-intent shaping](references/product-intent.md)','Skip this optional aid for a clear bug fix']);
 retains(read('engineering-references/SKILL.md'),['architecture compatibility','optional architecture compatibility counterexample']);
 for(const [owner,e] of Object.entries(expected))for(const rel of [...Object.keys(e.files),'bmad-provenance.json']){
  const p=owner+'/'+rel,st=fs.lstatSync(path.join(root,p));assert(st.isFile()&&!st.isSymbolicLink());assert.equal(st.mode&0o111,0);
  if(!rel.endsWith('.md'))continue;
  for(const [,href] of read(p).toString().matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
   if(/^(https?:|#)/.test(href))continue;
   const target=path.resolve(root,owner,path.dirname(rel),href.split('#')[0]);
   assert(target.startsWith(path.join(root,owner)+path.sep));assert(fs.statSync(target).isFile(),target);
  }
 }
});
