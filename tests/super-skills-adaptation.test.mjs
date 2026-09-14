import {beforeStorefrontSkill} from './helpers/storefront-snapshot.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {beforeSuperEngineering} from './helpers/super-skills-snapshot.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>p==='engineering-references/SKILL.md'?beforeStorefrontSkill(root,'engineering-references'):fs.readFileSync(path.join(root,p));
const sha=b=>createHash('sha256').update(b).digest('hex');
const routes={"engineering-references": {"previous": {"bytes": 7174, "sha256": "2a30a68ebb43812832b6fd425df706e52678a704a6e45f19f4da58dc293bba51"}, "current": {"bytes": 7609, "sha256": "8ee4682e187b43f82e5ee5dc0220d456b39364bd60503f91fca7e57be4ddc26b"}, "addition": {"bytes": 372, "sha256": "41aedeb2ccb1c68b1c02d110b9f3a27c376f912d1d5560f875f04a33ea248b14"}}, "marketingskills/skills/competitor-profiling": {"previous": {"bytes": 14906, "sha256": "446b2ffe684733b15e430b6cbd7ba94ef3d242716a27710cca96d918565d1742"}, "current": {"bytes": 15267, "sha256": "267f437f099bcd554b59c0bde2b7c1a69259de9acb845aa0eebb100eb7aebcf9"}, "addition": {"bytes": 361, "sha256": "41834621e006e363b901d4ee6e9f29b5f52cda85151246d6e05894f21e750409"}}};
const preserved={"engineering-references/UPSTREAM.md": "b043e81c57592832f534ca7af7de07c456b6b6fa24f704483b25a33c302005dc", "engineering-references/core-provenance.json": "75d129c3629fde4a6d025a6e34305871de2488d42f4af8661718a79cba5e5fb3", "engineering-references/MATTPOCOCK_SOURCES.md": "19f1d5f0cd9c1b9e6d54309225778e39cd4dc516f47976b64cbfe3bff4a79405", "engineering-references/next-provenance.json": "2fba639d5b7e81c932dd81057a09071fc32f50118eb58debc6ac0b24e55d9386", "engineering-references/mattpocock-provenance.json": "4529e7ea548656251167000c78835ddf4aa1ddd8343bd2a05a5e24f388d4b36e", "engineering-references/ADDY_SOURCES.md": "b4e2168db1947332574b06a37a91413656c9933dc0c49f1f7722707626561ab7", "engineering-references/NEXT_SOURCES.md": "c2d4e0e1441c7618729e500ab637a9a9a0f931622d6048c053d864788a578c9a", "engineering-references/provenance.json": "7f57672fd3f12196a385f0a74532a5e881bbbefcc208edebc617bfa2f6797e21", "engineering-references/THIRD_PARTY.md": "573159808afac636af14a22b5c6c04f2aeb19663e97033123247cd6bb13b82d5", "engineering-references/addy-provenance.json": "7233abc9113c1eae2f41c69e1e01894c2d891ab03071437a9529cb2bd24f6a47", "engineering-references/LICENSE": "c21def7bbce1900717a361a06af67399903d31bd3a695757fff534d6698d1bdb", "engineering-references/references/domain-modeling.md": "c44e31a2986803b789176b67465e5031c4846cfc2eacb8e8886b6f602d467caf", "engineering-references/references/test-design.md": "f57f608c93389fe3a65cb71dc637fbaacf2ddd78788984ded0adba6ff814c0e9", "engineering-references/references/api-authorization.md": "62b12ba0aeb5e791d259e7e1893a95697e14c954a652313e339107ac8dbb387a", "engineering-references/references/contract-boundaries.md": "fc3119b6040f6a5636594cdb440a76e53321828fc1a2d8965e18f66d43c1072f", "engineering-references/references/sql-diagnosis.md": "75a9091556af355d4d3c6493c76780dd5a35a35f93bc651d996ea07debe83240", "engineering-references/references/release-dependencies.md": "3749da35996c7fd14db793a288a8b25fecab178230135acc04e819ff2ba05d30", "engineering-references/references/telemetry-evidence.md": "13978684bb0fb7cf42b0a7c3e71163f1fc5f4be7ec3f4be58071437dbf280126", "engineering-references/references/legacy-code.md": "cf21febb651dc040ea9c07f4a3e5a065d0096c2daad3fb2e36bb964042fc628a", "engineering-references/references/debugging.md": "27c4d5c5ee9fc49fafa5bc407434a2172dd2d5bd3ba9aa837ebd082a39260e7a", "engineering-references/references/interface-design.md": "229ec7703abc5f2cb878a8112c80f17bd87068c4ba3268f5176393d35bb96a8b", "engineering-references/references/release-it.md": "679755209ebf0a092af4cafa66478f91ab80d5a16c44cb0450f4305796c5e329", "engineering-references/references/data-intensive-applications.md": "4a249e5973a5d85ebe941f85dae11a53ab526e56861497711b3b2489e72feccf", "engineering-references/licenses/mattpocock-MIT.txt": "0e7ac423bf2c6e223b7c5b156f8cf72da49d748e56a1641402c31f22ad07dbb5", "engineering-references/licenses/Apache-2.0.txt": "c71d239df91726fc519c6eb72d318ec65820627232b2f796219e87dcf35d0ab4", "engineering-references/licenses/operating-kit-MIT.txt": "aca69f0468abc0f8066e11d75b85306d1144292c6cd24442449dcdeec90784c2", "engineering-references/licenses/CC-BY-4.0.txt": "9e5f1b3c610b9c2da5c313bf81d577a7d1acec686bdb0384edefa6df0f90cd94", "engineering-references/licenses/addyosmani-MIT.txt": "6f202f8bd568cd730dbb2b0d1f8e243bc74c2fa1f64dbce9b2c7ea08bd5c9fd7", "engineering-references/licenses/AAS-LICENSE-CONTENT.txt": "deae07ece522fbca65ab33f0c18ca9630b1077a8f3f233c0af445235b3fb6fcf", "engineering-references/licenses/stareezy-1-MIT.txt": "3a82e47df9ab1017d61dd760cdc7200422ed84d7bb694ff8ac86b06694ec30f2", "marketingskills/skills/competitor-profiling/evals/evals.json": "53c34c29378d3c16db7a43189e4d6903a4740bedc09e576246243434d4b6d89a", "marketingskills/skills/competitor-profiling/references/tool-reference.md": "37defe4f29d15a74b10e9b0c17d798f62effaa025e2ff8fece377171adbb658a", "marketingskills/skills/competitor-profiling/references/templates.md": "710d78cb519012eb7e39f63643e22d7b9026c91c569262b44c45535c10717a91"};
const owners=Object.keys(routes);
test('current routes are independently locked, native triggers explicit, and prior engineering body retained',()=>{
 for(const owner of owners){const b=read(owner+'/SKILL.md');assert.equal(b.length,routes[owner].current.bytes);assert.equal(sha(b),routes[owner].current.sha256);assert.equal(sha(b.subarray(b.length-routes[owner].addition.bytes)),routes[owner].addition.sha256);}
 const old=beforeSuperEngineering(root);assert.equal(sha(old),routes['engineering-references'].previous.sha256);
 const prof=read(owners[1]+'/SKILL.md');assert.equal(sha(prof.subarray(0,routes[owners[1]].previous.bytes)),routes[owners[1]].previous.sha256);
 const eng=read(owners[0]+'/SKILL.md').toString();assert(eng.includes('stochastic agent'));assert(eng.includes('trust-boundary threat modeling'));assert(eng.includes('version: 1.5.0-prime.1'));
});
test('actual historical adapter accepts only known old/current snapshots and rejects mutations',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'super-snapshot-'));try{
  fs.mkdirSync(path.join(temp,'engineering-references'));const p=path.join(temp,'engineering-references/SKILL.md');const current=read('engineering-references/SKILL.md'),old=beforeSuperEngineering(root);
  for(const b of [old,current]){fs.writeFileSync(p,b);assert.deepEqual(beforeSuperEngineering(temp),old);}
  for(const b of [old,current])for(const at of [0,Math.floor(b.length/2),b.length-1]){const bad=Buffer.from(b);bad[at]^=1;fs.writeFileSync(p,bad);assert.throws(()=>beforeSuperEngineering(temp));}
  for(const b of [Buffer.concat([current,Buffer.from('extra')]),current.subarray(0,current.length-1),Buffer.from('foreign skill')]){fs.writeFileSync(p,b);assert.throws(()=>beforeSuperEngineering(temp));}
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
// Original batch identities above remain historical evidence. Only these four
// reviewed Superpowers extensions supersede current-file equality; no old run is
// claimed to have tested the new content.
const superpowersRevisions={
  "engineering-references/UPSTREAM.md": "12ed8398b58732ab8679dae9d9b6f4269aa9dbeed49893d0ddd9409f88a99662",
  "engineering-references/mattpocock-provenance.json": "221333caa572e07d1abf4173e7cb9dd391027759ff6218be154dad9fd82f1aef",
  "engineering-references/references/test-design.md": "f9dd35e1ae25e6c089c2b8a1c723b87463bed73806688c42a208e1a30bc143e4",
  "engineering-references/references/debugging.md": "2e7eb1e17c80248c7a9ccbec0dcf12c71d503b8ed944a3755facb6a9ab53713d"
};
test('prior files stay exact except explicitly approved later Superpowers revisions',()=>{
 const later=JSON.parse(read('engineering-references/superpowers-provenance.json'));
 for(const [p,h] of Object.entries(preserved)){
  if(Object.hasOwn(superpowersRevisions,p)){
   const rel=p.slice('engineering-references/'.length);
   const record=later.files.find(f=>f.path===rel);assert(record,p);
   assert.equal(record.previous_sha256,h,p+' original identity');
   assert.equal(record.sha256,superpowersRevisions[p],p+' approved revision');
   assert.equal(sha(read(p)),superpowersRevisions[p],p);
  }else assert.equal(sha(read(p)),h,p);
 }
});
test('selected source/license identities and every adapted owner file are bound',()=>{
 for(const owner of owners){const p=JSON.parse(read(owner+'/super-skills-provenance.json'));assert.equal(p.repository,'https://github.com/BigY0shi/super-skills');assert.equal(p.commit,'86e4cec2d51927a8ecff4370f892136fc6317523');assert.deepEqual(p.routing,routes[owner]);
  for(const r of p.sources){assert.match(r.sha256,/^[a-f0-9]{64}$/);assert.match(r.git_blob,/^[a-f0-9]{40}$/);assert(r.bytes>0);}
  assert.equal(sha(read(owner+'/'+p.license.path)),p.license.sha256);assert(read(owner+'/'+p.license.path).toString().includes('Copyright (c) 2026 Yoshi'));
  for(const [rel,r] of Object.entries(p.adapted_files)){const b=read(owner+'/'+rel);assert.equal(b.length,r.bytes);assert.equal(sha(b),r.sha256,rel);}
  for(const r of p.primary_references){assert.match(r.sha256,/^[a-f0-9]{64}$/);assert(r.url.startsWith('https://'));assert(r.bytes>0);assert.equal(r.treatment,'consulted, not copied or relicensed');}
 }
});
test('current Markdown routes and citations resolve in the installed skills scope',()=>{
 for(const owner of owners){const prov=JSON.parse(read(owner+'/super-skills-provenance.json'));
  for(const rel of Object.keys(prov.adapted_files).filter(x=>x.endsWith('.md'))){
   const text=read(owner+'/'+rel).toString().replace(/```[\s\S]*?```/g,'');
   for(const [,href] of text.matchAll(/\]\(([^)]+)\)/g)){if(/^(https?:|#|mailto:)/.test(href))continue;const target=path.resolve(root,owner,path.dirname(rel),href.split('#')[0]);assert(target.startsWith(root+path.sep),href);assert(fs.statSync(target).isFile(),href);}
  }
 }
});
function dirhash(dir){const files=[];function visit(p){for(const e of fs.readdirSync(p,{withFileTypes:true})){const f=path.join(p,e.name);if(e.isDirectory())visit(f);else if(e.isFile())files.push(f);}}visit(dir);const h=createHash('sha256');for(const f of files.sort((a,b)=>{const x=path.relative(dir,a),y=path.relative(dir,b);return x<y?-1:x>y?1:0;})){h.update(path.relative(dir,f).split(path.sep).join('/'));h.update(Buffer.from([0]));h.update(fs.readFileSync(f));h.update(Buffer.from([0]));}return h.digest('hex');}
test('complete competitor package digest and native owner eligibility',async()=>{
 const manifest=JSON.parse(read('marketingskills/MANIFEST.json'));assert.equal(dirhash(path.join(root,owners[1])),manifest.skills.find(x=>x.name==='competitor-profiling').sha256);
 const native=process.env.PRIME_NATIVE_ROOT;assert(native);const {loadSkillsFromDir,formatSkillsForPrompt}=await import(pathToFileURL(path.join(native,'dist/core/skills.js')));
 for(const owner of owners){const r=loadSkillsFromDir({dir:path.join(root,owner),source:'explicit'});assert.equal(r.skills.length,1);assert.deepEqual(r.diagnostics,[]);assert.equal(r.skills[0].disableModelInvocation,false);assert(r.skills[0].description.length<=1024);const prompt=formatSkillsForPrompt(r.skills);assert(!prompt.includes('Fictional worked example'));assert(!prompt.includes('LumenLedger'));}
});
