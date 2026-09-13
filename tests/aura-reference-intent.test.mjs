import {previousMengtoSkill} from './helpers/mengto-snapshot.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const hall=path.join(root,'hallmark');
const read=p=>fs.readFileSync(path.join(hall,p));
const hash=b=>createHash('sha256').update(b).digest('hex');
const flat=s=>s.replace(/\s+/g,' ');
const record=JSON.parse(read('aura-reference-intent.json'));
const previous={"sha256": "dc29eb2e94b90ae37a45b401dee94e6808e2f1a162201939f1e1f8fbc7a42c16", "bytes": 7141};
const added={"sha256": "d17ce9ae271f13010fceec23678d61d4c9f07734a897f1f1a34dee866ef074ec", "bytes": 2601};
const clauses=["**Mood direction**", "**Craft benchmark**", "**Named contribution**", "One reference may have several jobs", "A craft-only source is not the primary visual direction", "Explicit brand or layout requirements still apply", "Infer intent when context is clear", "materially change the outcome", "no new document or research round is required", "During existing QA", "cannot establish hidden states, motion quality or responsive behavior", "does not authorize fetching assets, running tools or changing a read-only study into implementation", "without introducing dark surfaces or animated counters", "No upstream text is bundled or relicensed"];
function inspectContent(body){for(const clause of clauses)assert(flat(body).includes(clause),clause);}
function inspectBytes(body){
 assert.equal(body.length,previous.bytes+added.bytes);
 assert.equal(hash(body.subarray(0,previous.bytes)),previous.sha256);
 assert.equal(hash(body.subarray(previous.bytes)),added.sha256);
}
test('original reference roles and example retain their purpose and permission limits',()=>{
 const body=read(record.path);inspectContent(body.subarray(previous.bytes).toString());
 for(const clause of clauses){const text=flat(body.subarray(previous.bytes).toString());assert.throws(()=>inspectContent(text.replaceAll(clause,'')),{name:'AssertionError'});}
});
test('exact append-only change rejects old-body edits, new-body edits and trailing content',()=>{
 const body=read(record.path);inspectBytes(body);
 for(const index of [0,previous.bytes,body.length-1]){const bad=Buffer.from(body);bad[index]^=1;assert.throws(()=>inspectBytes(bad));}
 assert.throws(()=>inspectBytes(Buffer.concat([body,Buffer.from('unexpected')])));
 assert.deepEqual(record.previous,previous);assert.equal(record.addition.sha256,added.sha256);assert.equal(record.addition.bytes,added.bytes);
 assert.equal(hash(body),record.current.sha256);assert.equal(body.length,record.current.bytes);
});
test('snapshot attribution is explicit, does not claim an upstream license, and preserves prior provenance',()=>{
 assert.equal(record.source.url,"https://www.aura.build/skills/a1ba11a7-002f-4cda-b4f7-fef201b57f02/creative-agency-design-protocol");assert.equal(record.source.content_sha256,"7b37e1e0e5050b847ce8ecae7cd962f57b5f6f9b0a2b9bc0e44da1c8e1b2d462");
 assert.equal(record.source.reuse_license_found,false);
 assert.equal(record.source.treatment,'General reference-role distinction only, expressed in original prose; upstream text not bundled or relicensed');
 assert.equal(hash(read('refero-provenance.json')),"44df23ec8b2aef3a19510ab72d1e696764ad98e214747aa6ef8b2c3ce14b4f4b");
 assert.equal(hash(previousMengtoSkill(root,'hallmark')),"44f66f48f6f367a595653f23e774bd5fcde4ce67c3a10d181f35a10fe1869833");
});
test('existing reference routes and new local attribution link resolve',()=>{
 for(const rel of ['references/design.md','references/study.md','references/verification.md'])assert(read(rel).toString().includes('](reference-synthesis.md)'));
 for(const [,href] of read(record.path).toString().matchAll(/\]\(([^)]+)\)/g)){
  if(/^(https?:|#|mailto:)/.test(href))continue;
  const resolved=path.resolve(hall,'references',href.split('#')[0]);
  assert(resolved.startsWith(root+path.sep));assert(fs.statSync(resolved).isFile());
 }
});
test('fresh native loading keeps Hallmark eligible without a new creative-agency owner',async()=>{
 const native=process.env.PRIME_NATIVE_ROOT;assert(native);
 const {loadSkills,formatSkillsForPrompt}=await import(pathToFileURL(path.join(native,'dist/core/skills.js')).href);
 const result=loadSkills({cwd:root,agentDir:path.join(root,'unused-agent'),includeDefaults:false,skillPaths:[hall]});
 assert.deepEqual(result.diagnostics,[]);assert.equal(result.skills.length,1);assert.equal(result.skills[0].name,'hallmark');
 assert.equal(result.skills[0].disableModelInvocation,false);assert(formatSkillsForPrompt(result.skills).includes('<name>hallmark</name>'));
 assert(!fs.existsSync(path.join(root,'creative-agency/SKILL.md')));
});
console.log('Text/hash/negative/link/native metadata checks only; no rendered UI or model-efficacy claim.');
