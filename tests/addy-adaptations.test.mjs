import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath, pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const hash=s=>createHash('sha256').update(s).digest('hex');
const docs={
 telemetry:'engineering-references/references/telemetry-evidence.md',
 retry:'engineering-references/references/contract-boundaries.md',
 migration:'engineering-references/references/release-dependencies.md',
 js:'ponytail/SKILL.md',
};
const clauses={
 telemetry:['Do not add instrumentation to every feature','this reference does not authorize new dependencies',
 'Count attempts separately from final outcomes','A timeout log cannot prove whether a charge applied',
 'downstream overrides or untrusted message headers must not impersonate a trusted origin',
 'Correlation is not authorization','Do not move unsafe metric labels into logs and assume that makes them safe',
 'A tail sampler cannot recover spans discarded by an earlier head sampler',
 'Actual emitted output does not prove collector ingestion','report the unverified layer'],
 retry:['Recheck current authorization before status lookup or response replay',
 'A local atomic claim is not atomic with an external effect',
 'do not release a claim and retry just because it seems old',
 'Do not silently treat the oldest supported replay as a fresh intent after key expiry'],
 migration:['An additive change is not automatically online-safe',
 'backfill cannot overwrite newer writes','two writes alone are not atomic',
 'A short quiet period or active-key count does not prove every consumer migrated','No mandatory down path'],
 js:['object versus Map result','synchronous throws versus Promise rejection',
 'Promise identity and relevant catch/finally cleanup ordering','An explicitly requested behavior change is not an exact refactor'],
};
function check(kind,text){
 const flat=text.replace(/\s+/g,' ');
 for(const clause of clauses[kind])assert.ok(flat.includes(clause),`${kind}: ${clause}`);
}
test('four selective adaptations retain their scope and corrective distinctions',()=>{
 for(const [kind,p] of Object.entries(docs))check(kind,read(p));
});
test('phrase-removal controls reject each lost distinction (not semantic proof)',()=>{
 for(const [kind,p] of Object.entries(docs)){
  const flat=read(p).replace(/\s+/g,' ');
  for(const clause of clauses[kind])assert.throws(()=>check(kind,flat.replace(clause,'REMOVED')),clause);
 }
});
test('direct source mapping preserves source pin, notices, baseline and live hashes',()=>{
 const p=JSON.parse(read('engineering-references/addy-provenance.json'));
 assert.equal(p.commit,'be4e44a9fbc5e8df0beaefadbb28bd22ee61cc39');
 assert.equal(p.repository,'https://github.com/addyosmani/agent-skills');
 assert.equal(p.sources.length,5);
 assert.deepEqual(p.files.map(f=>f.path).sort(),Object.values(docs).sort());
 for(const f of p.files)assert.equal(hash(read(f.path)),f.sha256,f.path);
 for(const s of p.sources){assert.match(s.sha256,/^[a-f0-9]{64}$/);assert.ok(s.url.includes(p.commit));assert.match(s.git_blob,/^[a-f0-9]{40}$/);}
 const core=JSON.parse(read('engineering-references/core-provenance.json'));
 for(const f of core.files){assert.equal(f.pre_addy_sha256,p.files.find(x=>x.path===`engineering-references/${f.path}`).previous_sha256);assert.equal(hash(read(`engineering-references/${f.path}`)),f.sha256);}
 const license=read('engineering-references/licenses/addyosmani-MIT.txt');
 assert.equal(hash(license),p.license_sha256);
 assert.ok(read('ponytail/UPSTREAM.md').includes(license.trim()));
 for(const f of ['engineering-references/ADDY_SOURCES.md','ponytail/UPSTREAM.md'])assert.ok(read(f).includes(p.commit));
 assert.ok(read('engineering-references/THIRD_PARTY.md').includes('Not a blanket MIT grant'));
});
test('routes and links remain narrow and resolve',()=>{
 const e=read('engineering-references/SKILL.md'),p=read('ponytail/SKILL.md');
 assert.equal(e.split('](references/telemetry-evidence.md)').length-1,1);
 assert.ok(e.includes('not every reference by default'));
 assert.ok(p.includes('Review/audit never applies fixes'));
 for(const rel of [...Object.values(docs),'engineering-references/ADDY_SOURCES.md','ponytail/UPSTREAM.md']){
  for(const [,href] of read(rel).replace(/```[\s\S]*?```/g,'').matchAll(/\]\(([^)]+)\)/g)){
   if(/^(https?:|#)/.test(href))continue;
   const target=path.resolve(root,path.dirname(rel),href.split('#')[0]);
   assert.ok(target.startsWith(root+path.sep));assert.ok(fs.statSync(target).isFile(),href);
  }
 }
});
// Original local counterexamples, not upstream fixtures or a general refactor checker.
test('equal counts do not make object and Map representations equivalent',()=>{
 const record={'8':{count:2},'2':{count:1}};
 const map=new Map([['8',2],['2',1]]);
 assert.equal(record['8'].count,map.get('8')); // Happy-path scalar agreement.
 assert.notDeepEqual(record,map);
 assert.deepEqual(Object.keys(record),['2','8']);
 assert.deepEqual([...map.keys()],['8','2']);
 assert.equal(JSON.stringify(map),'{}');
 assert.equal(JSON.stringify(record),'{"2":{"count":1},"8":{"count":2}}');
 const keyed={};keyed[7]='first';keyed['7']='second';
 assert.equal(Object.keys(keyed).length,1);
 assert.equal(new Map([[7,'first'],['7','second']]).size,2);
 const preserved=Object.fromEntries(Object.entries(record).map(([k,v])=>[k,{count:v.count}]));
 assert.deepEqual(preserved,record);assert.equal(JSON.stringify(preserved),JSON.stringify(record));
});
test('removing an async boundary can change failure delivery and Promise identity',async()=>{
 const failure=new Error('local example');
 function delegate(){throw failure;}
 async function wrapped(){return delegate();}
 function direct(){return delegate();}
 let result;assert.doesNotThrow(()=>{result=wrapped();});
 await assert.rejects(result,e=>e===failure);
 assert.throws(direct,e=>e===failure);
 const stable=Promise.resolve(5);
 async function adapted(){return stable;}
 function unchanged(){return stable;}
 const other=adapted();assert.notEqual(other,stable);assert.equal(unchanged(),stable);
 assert.equal(await other,await stable); // Values agree, identity does not.
});
test('return await retains local catch and defers finally until settlement',async()=>{
 const error=new Error('local failure');
 async function catches(){try{return await Promise.reject(error);}catch{return 'handled';}}
 async function bypasses(){try{return Promise.reject(error);}catch{return 'handled';}}
 assert.equal(await catches(),'handled');await assert.rejects(bypasses(),e=>e===error);
 let settle;const pending=new Promise(resolve=>{settle=resolve;});
 const events=[];
 async function waits(){try{return await pending;}finally{events.push('wait-cleanup');}}
 async function early(){try{return pending;}finally{events.push('early-cleanup');}}
 const a=waits(),b=early();assert.deepEqual(events,['early-cleanup']);
 settle(9);assert.deepEqual(await Promise.all([a,b]),[9,9]);
 assert.deepEqual(events,['early-cleanup','wait-cleanup']);
});
test('fresh native metadata exposes owners, not reference bodies',async()=>{
 const native=process.env.PRIME_NATIVE_ROOT;assert.ok(native,'Set PRIME_NATIVE_ROOT');
 const {loadSkills,formatSkillsForPrompt}=await import(pathToFileURL(path.join(native,'dist/core/skills.js')));
 const loaded=loadSkills({cwd:process.cwd(),agentDir:path.dirname(root),includeDefaults:true,skillPaths:[]});
 for(const name of ['engineering-references','ponytail']){
  const matches=loaded.skills.filter(s=>s.name===name);assert.equal(matches.length,1);
  assert.equal(matches[0].filePath,path.join(root,name,'SKILL.md'));
 }
 const prompt=formatSkillsForPrompt(loaded.skills.filter(s=>['engineering-references','ponytail'].includes(s.name)));
 assert.ok(prompt.includes('operator-led telemetry'));
 assert.ok(!prompt.includes('A tail sampler cannot recover'));
 assert.ok(!prompt.includes('Server recovery details'));
});
console.log('Document contracts and local JS semantics only; no telemetry/database/provider or model-efficacy proof.');
