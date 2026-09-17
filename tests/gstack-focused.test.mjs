// Documentation/example/identity tests only. No agent trials, upstream execution,
// fingerprint tooling, browser access, application behavior or measured DX claim.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {beforeGstackFile,gstackTransitions} from './helpers/gstack-snapshot.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p));
const sha=b=>createHash('sha256').update(b).digest('hex');
const flat=s=>s.toString().replace(/\s+/g,' ');
const clauses={"unlazy/references/decision-verification.md": ["No second ledger, mandatory review phase, fingerprint tool or new completion vocabulary", "active implementation plan", "actual accepted decision, not just a review summary", "affected worker brief and gate", "A review-only note does not amend the contract", "proves neither approval, complete enumeration nor correct implementation", "proposals, rejected and deferred ideas out of executable scope", "authorized replacement updates the active plan and affected checks", "No extra approval is needed for already-authorized work", "relevant source and dirty state", "build/runtime actually exercised", "next owner", "completed command exit", "same setup and action sequence", "Separate a reproduced failure from a code-read concern or hypothesis", "If reproduction was unavailable, state the remaining gap", "no install, dependency, public/authenticated browser, live-data, deployment or automatic revert authority", "Do not delete valid failed assertions", "relevant source/dependency, fixture or running build", "mark affected evidence stale", "Retain unrelated evidence only with a stated reason", "Unknown identity means verification unavailable", "does not extend its executable guarantee"], "engineering-references/references/developer-first-value.md": ["Review only the affected journey", "No new persona document", "useful observable result, not merely installation success", "clean setup from a warm machine", "even `--help` executes code", "Confirm authorization for their effects, dependencies and network access", "Do not install packages, create accounts, access credentials, run billable calls, mutate live data or perform upgrades merely to complete a review", "Use the project's native environment, not the agent kernel", "no authenticated/public browsing or sandbox fallback", "recovery reaches success without duplicate or lost work", "rollback limits are explicit, not assumed", "A documentation edit does not prove the command it describes now works", "evidence coverage labels, not completion states or quality scores", "This can be a tested failure", "Name the tested segment and the missing boundary or environment", "conclusions from docs/code only", "do not invent elapsed time", "only when actually measured", "State interruptions, caches and excluded setup time", "first value was never reached, not a slow success", "Recheck affected evidence", "not a live run", "compatibility unknown"]};
function retains(text,phrases){for(const c of phrases)assert(flat(text).includes(c),c);}
test('optional guidance retains the accepted-decision, handoff, journey and safety contracts',()=>{
 for(const [p,phrases] of Object.entries(clauses)){
  const text=read(p);retains(text,phrases);
  for(const c of phrases)assert.throws(()=>retains(flat(text).split(c).join('REMOVED'),phrases),undefined,c);
 }
});
const retryExample=[
 'accepts D1 in plan p2',
 'Retry creates exactly one private report and keeps the entered title',
 'Automatic retry is rejected',
 'plan, worker brief and observing gate retain both conditions and that exclusion',
 'F1 on source c1/build b1',
 'transient-failure fixture, Save, then click Retry once',
 'Join D1 and F1',
 'c2/build b2 retest repeats it, counts one stored report and checks the unchanged title',
 'Merely opening the page without an error cannot verify F1',
 'Required privacy/denial checks remain required',
 'p2 evidence cannot close the changed gate even if c2 is unchanged',
 "preview still serves b1, c2's unit pass is not b2 UI evidence",
 'applied fix and missing retest separately',
 'proposed checks for an invented feature, not executed results'
];
test('connected example carries conditions/exclusion into plan and retests the same action and revision',()=>{
 const text=flat(read('unlazy/references/decision-verification.md')).split('## Connected fictional example:')[1];
 retains(text,retryExample);
 // Misleading positives are mutations of the delivered example, not a model simulation.
 for(const [from,to] of [
  ['one private report and keeps the entered title','one private report'],
  ['Automatic retry is rejected','Automatic retry is required'],
  ['plan, worker brief and observing gate','review summary'],
  ['then click Retry once','then open the page'],
  ['c2/build b2 retest repeats it','c2/build b1 retest opens it'],
  ['cannot close','can close'],
  ['not b2 UI evidence','b2 UI evidence'],
  ['proposed checks for an invented feature, not executed results','verified execution results']
 ]){assert(text.includes(from),from);assert.throws(()=>retains(text.replace(from,to),retryExample),undefined,from);}
});
test('journey covers meaningful success, error recovery, clean-install and upgrade evidence without invented outcomes',()=>{
 const text=flat(read('engineering-references/references/developer-first-value.md'));
 const stages=['Discover and install','First success','Real use','Error and recovery','Upgrade'];
 for(const stage of stages){assert(text.includes('| '+stage+' |'));assert.throws(()=>retains(text.replace('| '+stage+' |','| OMITTED |'),['| '+stage+' |']));}
 const example=text.split('## Fictional example:')[1];
 const checks=['label that INFERRED, not TESTED','inspect a nonzero exit and error','Assert the expected validation result, not just exit zero','TESTED only after the evidence exists','PARTIAL if it was not exercised from a clean supported environment','carry both conditions into the plan','original missing-input command and its recovery command','A corrected README alone cannot close','report it INFERRED with compatibility unknown','No real platform, version, elapsed-time or improvement claim'];
 retains(example,checks);
 for(const c of checks)assert.throws(()=>retains(example.replace(c,'UNSUPPORTED PASS'),checks),undefined,c);
});
const expected={"unlazy": {"repository": "https://github.com/garrytan/gstack", "commit": "a6b3a57512ca6d5c6aa5b68f74f736195021f96e", "package_version": "1.87.4", "root_version": "1.87.4.0", "adaptation": "Original optional Prime guidance; no upstream execution or runtime. Source inspection and deterministic contracts do not prove agent effectiveness.", "sources": [{"path": "autoplan/SKILL.md.tmpl", "ranges": [[164, 175]], "bytes": 26331, "sha256": "f97bf0271ce26d0b877536194b84d95ac872395061b03ebeeee67b9dc2b20048", "git_blob": "1a79b85471df061a3cce219ea1d219c4b84d3b68", "url": "https://github.com/garrytan/gstack/blob/a6b3a57512ca6d5c6aa5b68f74f736195021f96e/autoplan/SKILL.md.tmpl"}, {"path": "bin/gstack-autoplan-snapshot.ts", "ranges": [[103, 181]], "bytes": 45018, "sha256": "064a85d5ecf91d392d7ed40ab94c83d2598857260f2aa020f2c352dff44ecc8d", "git_blob": "60ce79b182496e2350ec9d71977b517ad1674f57", "url": "https://github.com/garrytan/gstack/blob/a6b3a57512ca6d5c6aa5b68f74f736195021f96e/bin/gstack-autoplan-snapshot.ts"}, {"path": "test/autoplan-snapshot.test.ts", "ranges": [[267, 295]], "bytes": 28138, "sha256": "7b5cb3abd43dd68315e31375699a4a97c58b424c7fcedc4cfcbd08b0b3562455", "git_blob": "59166a0465d2132790c8e951d480990b6fcf4fbe", "url": "https://github.com/garrytan/gstack/blob/a6b3a57512ca6d5c6aa5b68f74f736195021f96e/test/autoplan-snapshot.test.ts"}, {"path": "plan-eng-review/sections/review-sections.md", "ranges": [[306, 337]], "bytes": 69212, "sha256": "1c816e44c75142c37506a438c109ec6830bd6ca3c9a5bbb6c490f523cb2743a8", "git_blob": "4a12d9b3d82eb7907cc806866d999f5341907f4e", "url": "https://github.com/garrytan/gstack/blob/a6b3a57512ca6d5c6aa5b68f74f736195021f96e/plan-eng-review/sections/review-sections.md"}, {"path": "qa/SKILL.md.tmpl", "ranges": [[108, 119], [206, 243]], "bytes": 13886, "sha256": "1e36d22b188f58d98181a63ba312c317fc8f8bcd15565e3d39824ea4a483d498", "git_blob": "23934afde954c7ee15a27b0e5c63a3098d9655ba", "url": "https://github.com/garrytan/gstack/blob/a6b3a57512ca6d5c6aa5b68f74f736195021f96e/qa/SKILL.md.tmpl"}, {"path": "LICENSE", "ranges": [[1, 21]], "bytes": 1066, "sha256": "e56fbb5b3d95756f3fa1cfefa24732ec79f18ece1ad08a4e79e00df57e8b198c", "git_blob": "35029511144443297cad2d26e4bac17d0e352f93", "url": "https://github.com/garrytan/gstack/blob/a6b3a57512ca6d5c6aa5b68f74f736195021f96e/LICENSE"}, {"path": "NOTICE.md", "ranges": [[1, 39]], "bytes": 2472, "sha256": "879fc62ddab70035c6f697e1bc8afaaf0a380e8b3e4ffe256ca403c28d909f7c", "git_blob": "931bd4b301250baa410ea5347690559d0d745119", "url": "https://github.com/garrytan/gstack/blob/a6b3a57512ca6d5c6aa5b68f74f736195021f96e/NOTICE.md"}], "files": {"SKILL.md": {"bytes": 13015, "sha256": "6fe0a1e8935193e783e401f3ea595b34b212da9c9c4a0ae4df6b346390152f69"}, "UPSTREAM.md": {"bytes": 3349, "sha256": "65b6381743ae4531063f7a1e448e72f630f49929e9469b855e9853caaaba3022"}, "GSTACK_SOURCES.md": {"bytes": 2350, "sha256": "9152d31a640dc82fe768d7fb70613a6f284df9dbd33035b72857abb2e3b072c3"}, "licenses/gstack-MIT.txt": {"bytes": 1066, "sha256": "e56fbb5b3d95756f3fa1cfefa24732ec79f18ece1ad08a4e79e00df57e8b198c"}, "references/decision-verification.md": {"bytes": 5086, "sha256": "503a0cbe1e9bbe26a29145608207f38ebe27a42f2d8279c531ed9b6374ea3601"}}}, "engineering-references": {"repository": "https://github.com/garrytan/gstack", "commit": "a6b3a57512ca6d5c6aa5b68f74f736195021f96e", "package_version": "1.87.4", "root_version": "1.87.4.0", "adaptation": "Original optional Prime guidance; no upstream execution or runtime. Source inspection and deterministic contracts do not prove agent effectiveness.", "sources": [{"path": "plan-devex-review/SKILL.md.tmpl", "ranges": [[347, 395]], "bytes": 19456, "sha256": "11d29a46121fbb42ea934b6ef1292b6201dd9e1ee5ffd44ee73ae1ae5d386af1", "git_blob": "752354d987537b93c47adea4b772b5233dcb5176", "url": "https://github.com/garrytan/gstack/blob/a6b3a57512ca6d5c6aa5b68f74f736195021f96e/plan-devex-review/SKILL.md.tmpl"}, {"path": "devex-review/SKILL.md.tmpl", "ranges": [[44, 63], [84, 214]], "bytes": 8933, "sha256": "a11a0df8280f97f7b79e1118885e58b2ea9c15ee5f5433086afd8cad2bf48713", "git_blob": "0340c69bda95d85106e8e7bbab2008a5e3b4555a", "url": "https://github.com/garrytan/gstack/blob/a6b3a57512ca6d5c6aa5b68f74f736195021f96e/devex-review/SKILL.md.tmpl"}, {"path": "LICENSE", "ranges": [[1, 21]], "bytes": 1066, "sha256": "e56fbb5b3d95756f3fa1cfefa24732ec79f18ece1ad08a4e79e00df57e8b198c", "git_blob": "35029511144443297cad2d26e4bac17d0e352f93", "url": "https://github.com/garrytan/gstack/blob/a6b3a57512ca6d5c6aa5b68f74f736195021f96e/LICENSE"}, {"path": "NOTICE.md", "ranges": [[1, 39]], "bytes": 2472, "sha256": "879fc62ddab70035c6f697e1bc8afaaf0a380e8b3e4ffe256ca403c28d909f7c", "git_blob": "931bd4b301250baa410ea5347690559d0d745119", "url": "https://github.com/garrytan/gstack/blob/a6b3a57512ca6d5c6aa5b68f74f736195021f96e/NOTICE.md"}], "files": {"SKILL.md": {"bytes": 9227, "sha256": "d7802614ee7be88adfe9fbe2b096a8b4c1a4c668caef7b3fd897a7762e3b5446"}, "UPSTREAM.md": {"bytes": 8708, "sha256": "5a72f387f9b1c44e8688bbd366690e731258b30b0bc1583fe19286691443dacb"}, "GSTACK_SOURCES.md": {"bytes": 2201, "sha256": "3ef58e3ee449f0d983beabed73a6eee1b441dfa1f9f99fbce1fec8b550cdb0f2"}, "licenses/gstack-MIT.txt": {"bytes": 1066, "sha256": "e56fbb5b3d95756f3fa1cfefa24732ec79f18ece1ad08a4e79e00df57e8b198c"}, "references/developer-first-value.md": {"bytes": 5802, "sha256": "98b9906ac44ddd257de12c341b7ed31966ecd85dc13fc10b4479d26e3b678242"}}}};
test('pinned selected sources, full MIT rights and current payload identities are exact',()=>{
 for(const [owner,e] of Object.entries(expected)){
  const p=JSON.parse(read(owner+'/gstack-provenance.json'));assert.deepEqual(p,e);
  for(const [rel,r] of Object.entries(p.files)){
   const b=read(owner+'/'+rel);assert.equal(b.length,r.bytes);assert.equal(sha(b),r.sha256);
   assert.notEqual(sha(Buffer.concat([b,Buffer.from('unknown addition')])),r.sha256);
  }
  retains(read(owner+'/GSTACK_SOURCES.md'),['MIT, Copyright (c) 2026 Garry Tan','separate Apache-2.0 design-derived groups','not executed','No upstream code or substantial prose is copied','not improved agent effectiveness']);
  const license=read(owner+'/licenses/gstack-MIT.txt');
  assert.equal(sha(license),'e56fbb5b3d95756f3fa1cfefa24732ec79f18ece1ad08a4e79e00df57e8b198c');
  retains(license,['Copyright (c) 2026 Garry Tan','The above copyright notice and this permission notice shall be included','THE SOFTWARE IS PROVIDED "AS IS"']);
 }
});
test('exact approved transitions preserve prior identities; unknown modifications stay visible',()=>{
 assert.deepEqual(Object.keys(gstackTransitions).sort(),['engineering-references/SKILL.md','engineering-references/UPSTREAM.md','unlazy/SKILL.md','unlazy/UPSTREAM.md']);
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'gstack-history-'));
 try{for(const [p,r] of Object.entries(gstackTransitions)){
  const b=read(p);assert.equal(sha(b),r.current);assert.equal(sha(beforeGstackFile(root,p)),r.previous);
  const target=path.join(tmp,p);fs.mkdirSync(path.dirname(target),{recursive:true});
  const mutations=[Buffer.concat([b,Buffer.from('unapproved suffix')])];
  for(const at of [0,Math.floor(b.length/2),b.length-1]){const bad=Buffer.from(b);bad[at]^=1;mutations.push(bad);}
  for(const bad of mutations){fs.writeFileSync(target,bad);assert.deepEqual(beforeGstackFile(tmp,p),bad);assert.notEqual(sha(bad),r.previous);}
 }}finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
test('two owners route optional references with unchanged existing execution and review contracts',()=>{
 assert(read('unlazy/SKILL.md').includes(Buffer.from('](references/decision-verification.md)')));
 assert(read('engineering-references/SKILL.md').includes(Buffer.from('](references/developer-first-value.md)')));
 assert(flat(read('unlazy/SKILL.md')).includes('decision-to-verification handoffs'));
 assert(flat(read('engineering-references/SKILL.md')).includes('developer onboarding/first-value journeys'));
 const unchanged={"unlazy/package.json": "27eede4a0e746455df0cb29db2349c6074bd8d4a1195977d2e4a426a0cedebd3", "unlazy/scripts/gate-check.mjs": "29dee3acfdf566c24eedace85163a4e7a66eda01b712c5b4b76a99eae1eda8a1", "unlazy/scripts/gate-lint.mjs": "12fedaa4ad7bcfacf6da8d66f4ead0d186115e03fe941d3d20efd361dec7ee7e", "unlazy/references/prime.md": "81305fda0d9b561d6d23dc0b48004ec02a52c330346747d1b5c6b26a67436163", "unlazy/references/work-slicing.md": "bf1c43577d32882e3c24df40fcd6ae2a5a9bf6ad067901a1d43aca390c3adc98", "engineering-references/references/domain-modeling.md": "78573c0500966706693c967c8162d78aac1d48e38d3339c9ee739629afdb6ba7", "engineering-references/references/debugging.md": "aabde64e5635833179762fb4eae688f28dc64a429ca64dd8c34c7b501c2a350d", "engineering-references/references/contract-boundaries.md": "b4f438f92ef0455c22d76b7073ab09645e4e51c7465961fe9fd11e911941d82f", "browser-check/SKILL.md": "1fc984558ea031892c27568604d6f6e0018b15b5bbee27a7c476507aba2b5c65", "hallmark/SKILL.md": "b7f63620fbc73f5c0f6b9f452ff79f9ad5f16a0f4f6dcf286fdcf2a061f0de2f", "hallmark/references/verification.md": "1e409f733fdedc39757d5ffe635e464e76fd60cbb8e9b1c52cfd3aac7b227762", "code-review/SKILL.md": "9c74128df4eb7659eb6000ba45d68f1db86fd2826f25dbad55e5522b811249cc"};
 for(const [p,h] of Object.entries(unchanged))assert.equal(sha(read(p)),h,p);
});
test('new payloads are non-executable regular files and local owner links resolve',()=>{
 for(const [owner,e] of Object.entries(expected))for(const rel of [...Object.keys(e.files),'gstack-provenance.json']){
  const p=owner+'/'+rel,st=fs.lstatSync(path.join(root,p));assert(st.isFile()&&!st.isSymbolicLink());assert.equal(st.mode&0o111,0);
  if(!rel.endsWith('.md'))continue;
  for(const [,href] of read(p).toString().matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
   if(/^(https?:|#)/.test(href))continue;
   const target=path.resolve(root,owner,path.dirname(rel),href.split('#')[0]);
   assert(target.startsWith(path.join(root,owner)+path.sep));assert(fs.statSync(target).isFile(),target);
  }
 }
});
