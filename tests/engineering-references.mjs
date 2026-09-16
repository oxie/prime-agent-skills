import {beforeWikiskillFile} from "./helpers/wikiskill-snapshot.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {createHash} from "node:crypto";
import {pathToFileURL} from "node:url";
const root=path.resolve(process.argv[2]);
const runtime=path.resolve(process.argv[3]);
const skill=path.join(root,"engineering-references");
const read=p=>fs.readFileSync(path.join(skill,p),"utf8");
const hash=s=>createHash("sha256").update(s).digest("hex");
const text=read("SKILL.md");
const manifest=JSON.parse(read("provenance.json"));
const expected=["references/data-intensive-applications.md","references/legacy-code.md","references/release-it.md"];
assert.equal(manifest.commit,"893a88a6fce3a80c565bf39ac65021b43a8b2990");
assert.equal(manifest.repository,"https://github.com/ciembor/agent-rules-books");
assert.deepEqual(manifest.files.map(f=>f.path).sort(),expected);
// Explicit reviewed payloads, not a manifest/directory-driven allowlist. Later
// additions must update this owner gate after source and scope review.
const mattReferences=["debugging.md","domain-modeling.md","interface-design.md","test-design.md"];
const superReferences=["agent-evaluation.md","threat-modeling.md"];
const references=[...expected.map(p=>path.basename(p)),"contract-boundaries.md","release-dependencies.md","api-authorization.md","sql-diagnosis.md","telemetry-evidence.md","commerce.md","recovery-planning.md","retrieval-contracts.md",...mattReferences,...superReferences];
const inventory={
 ".":["LICENSE","SKILL.md","UPSTREAM.md","provenance.json","references","THIRD_PARTY.md","core-provenance.json","licenses","NEXT_SOURCES.md","next-provenance.json","ADDY_SOURCES.md","addy-provenance.json","MATTPOCOCK_SOURCES.md","mattpocock-provenance.json","SUPER_SKILLS_SOURCES.md","super-skills-provenance.json","SUPERPOWERS_SOURCES.md","superpowers-provenance.json","RAMPSTACK_SOURCES.md","rampstack-provenance.json","WEKNORA_SOURCES.md","weknora-provenance.json","WIKISKILL_SOURCES.md","wikiskill-provenance.json","COLEAM00_SOURCES.md","coleam00-provenance.json","RETICLE_SOURCES.md","reticle-provenance.json","OUROBOROS_SOURCES.md","ouroboros-provenance.json"],
 references,
 licenses:["AAS-LICENSE-CONTENT.txt","Apache-2.0.txt","CC-BY-4.0.txt","addyosmani-MIT.txt","operating-kit-MIT.txt","stareezy-1-MIT.txt","mattpocock-MIT.txt","super-skills-MIT.txt","superpowers-MIT.txt","rampstack-MIT.txt"],
};
for(const [dir,names] of Object.entries(inventory)){
 assert.deepEqual(fs.readdirSync(path.join(skill,dir)).sort(),[...names].sort(),`Reviewed inventory: ${dir}`);
 for(const name of names){
  const relative=path.join(dir,name);
  const stat=fs.lstatSync(path.join(skill,relative));
  if(dir==="." && ["references","licenses"].includes(name)){
   assert.ok(stat.isDirectory(),`Expected real directory: ${relative}`);
  }else{
   assert.ok(stat.isFile(),`Expected regular file: ${relative}`);
   assert.equal(stat.mode & 0o111,0,`Executable payload forbidden: ${relative}`);
  }
 }
}
const matt=JSON.parse(read("mattpocock-provenance.json"));
const superSkills=JSON.parse(read("super-skills-provenance.json"));
assert.equal(matt.repository,"https://github.com/mattpocock/skills");
assert.equal(matt.commit,"3cca18b368ae95cdbdebbff572ccafa662551015");
assert.equal(superSkills.repository,"https://github.com/BigY0shi/super-skills");
assert.equal(superSkills.commit,"86e4cec2d51927a8ecff4370f892136fc6317523");
assert.deepEqual(matt.files.filter(f=>f.path.startsWith("references/")).map(f=>path.basename(f.path)).sort(),[...mattReferences].sort());
assert.deepEqual(Object.keys(superSkills.adapted_files).filter(p=>p.startsWith("references/")).map(p=>path.basename(p)).sort(),[...superReferences].sort());
for(const name of mattReferences){
 const relative=`references/${name}`;
 assert.equal(hash(beforeWikiskillFile(root,"engineering-references/"+relative)),matt.files.find(f=>f.path===relative).sha256,relative);
}
for(const name of superReferences){
 const relative=`references/${name}`;
 assert.equal(hash(beforeWikiskillFile(root,"engineering-references/"+relative)),superSkills.adapted_files[relative].sha256,relative);
}
assert.equal(matt.license,"licenses/mattpocock-MIT.txt");
assert.equal(superSkills.license.path,"licenses/super-skills-MIT.txt");
for(const item of [
 ...JSON.parse(read("core-provenance.json")).licenses,
 ...JSON.parse(read("next-provenance.json")).licenses,
 {path:matt.license,sha256:matt.license_sha256},
 superSkills.license,
])assert.equal(hash(read(item.path)),item.sha256,`Source license: ${item.path}`);
assert.equal(hash(read("LICENSE")),manifest.license_sha256);
assert.ok(read("LICENSE").includes("Copyright (c) 2026 Maciej Ciemborowicz"));
for(const item of manifest.files){
 const content=read(item.path);
 assert.equal(hash(content),item.installed_sha256,item.path);
 const at=content.indexOf("\n");
 assert.equal(content.slice(0,at),item.installed_heading);
 assert.ok(!item.installed_heading.includes("OBEY"));
 assert.equal(hash(item.upstream_heading+content.slice(at)),item.upstream_sha256,`Only the heading may change: ${item.path}`);
}
function checkScope(input){
 const normalized=input.replace(/\s+/g," ");
 for(const phrase of [
  "Ordinary coding does not require an extra checklist pass",
  "not every reference by default",
  "Combine references only when the actual risk spans multiple subjects",
  "Applicable user and project instructions take priority",
  "diagnostic questions, not a requirement to implement every named mechanism",
  "A review is read-only unless edits are authorized",
  "does not grant permission to deploy",
  "Do not turn a confirmed bug into a requirement",
  "Preserve required real-boundary tests",
  "Do not require a cleanup, finding, new abstraction or extra validation step merely to satisfy a checklist",
  "If no additional issue is supported, say so",
  "Ponytail retains focused complexity review",
  "Task Observer retains observation/refinement",
 ]) assert.ok(normalized.includes(phrase),`Missing scope contract: ${phrase}`);
}
checkScope(text);
assert.throws(()=>checkScope(text.replace("not every reference by default","every reference by default")));
assert.throws(()=>checkScope(text.replace("instructions take priority","instructions are optional")));
assert.throws(()=>checkScope(text.replace("A review is read-only unless edits are authorized","A review always edits")));
assert.throws(()=>checkScope(text.replace("Preserve required real-boundary tests","Skip real-boundary tests")));
for(const doc of ["SKILL.md","UPSTREAM.md","MATTPOCOCK_SOURCES.md","SUPER_SKILLS_SOURCES.md","SUPERPOWERS_SOURCES.md","COLEAM00_SOURCES.md","RETICLE_SOURCES.md",...references.map(name=>`references/${name}`)]){
 for(const m of read(doc).matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
  if(/^https?:/.test(m[1]) || m[1].startsWith("#"))continue;
  const target=path.resolve(skill,path.dirname(doc),m[1].split("#")[0]);
  assert.ok(target.startsWith(skill+path.sep),`Out-of-scope link: ${m[1]}`);
  assert.ok(fs.statSync(target).isFile(),`Missing link: ${m[1]}`);
 }
}
const {loadSkillsFromDir,formatSkillsForPrompt}=await import(pathToFileURL(path.join(runtime,"dist/core/skills.js")));
const loaded=loadSkillsFromDir({dir:root,source:"user"});
assert.equal(loaded.diagnostics.length,0,JSON.stringify(loaded.diagnostics));
const matches=loaded.skills.filter(s=>s.name==="engineering-references");
assert.equal(matches.length,1,"Exactly one router must be discovered");
const prompt=formatSkillsForPrompt(matches);
assert.ok(prompt.includes("engineering-references"));
assert.ok(prompt.includes("production failure handling"));
assert.ok(prompt.includes("mutation/cache reconciliation"));
assert.ok(prompt.includes("running-revision evidence"));
assert.ok(prompt.includes("denied-write tests"));
assert.ok(prompt.includes("result-preserving SQL diagnosis"));
for(const phrase of ["exact-symptom debugging","independent test oracles","interface design comparisons","domain terminology","stochastic agent evaluation","trust-boundary threat modeling"]){
 assert.ok(prompt.includes(phrase),`Reviewed routing metadata: ${phrase}`);
}
for(const name of [...mattReferences,...superReferences]){
 assert.ok(!prompt.includes(read(`references/${name}`).split("\n")[0]),`Reference body remains on demand: ${name}`);
}
const hall=n=>loaded.skills.filter(s=>s.name===n);
assert.equal(hall("hallmark").length,1);
const hallPrompt=formatSkillsForPrompt(hall("hallmark"));
assert.ok(hallPrompt.includes("version-aware shadcn composition"));
assert.ok(hallPrompt.includes("localized UI usability"));
assert.ok(!hallPrompt.includes("Only when locales or language-dependent UI"));
assert.ok(!prompt.includes("Retry an intent"),"New reference content remains on demand");
assert.ok(!prompt.includes("## Choose the relevant reference"),"Skill body must remain on demand");
for(const item of manifest.files)assert.ok(!prompt.includes(item.installed_heading),"Reference bodies must remain on demand");
assert.equal(matches[0].disableModelInvocation,false,"Targeted automatic discovery should remain available");
console.log("ENGINEERING_REFERENCES_CONTRACT_AND_NATIVE_METADATA_OK");

// Exercise the current native loader and installed catalogue without starting a CLI daemon.
const actualRoot=path.resolve(process.argv[4]??root);
const {loadSkills}=await import(pathToFileURL(path.join(runtime,"dist/core/skills.js")));
const native=loadSkills({cwd:process.cwd(),agentDir:path.dirname(actualRoot),includeDefaults:true,skillPaths:root===actualRoot?[]:[skill]});
const nativeMatches=native.skills.filter(s=>s.name==="engineering-references");
assert.equal(nativeMatches.length,1);
assert.equal(nativeMatches[0].filePath,path.join(skill,"SKILL.md"));
const {createCatalog,selectSkills,discover}=await import(pathToFileURL(path.join(actualRoot,"extensions/skill-discovery/catalog.mjs")));
const cohort=JSON.parse(fs.readFileSync(path.join(actualRoot,"extensions/skill-discovery/cohort.json"),"utf8"));
assert.ok(!cohort.skills.some(s=>s.name==="engineering-references"));
const catalog=createCatalog(native.skills);
for(const query of ["Review retry deadlines and overloaded dependencies","Check durable writes and duplicate replay","Find a small legacy characterization seam","Fix a routine typo",""]){
 assert.ok(selectSkills(catalog,query,cohort,actualRoot).some(s=>s.name==="engineering-references"));
}
assert.equal(discover(catalog,{action:"get",name:"engineering-references"}).skills[0].name,"engineering-references");
console.log("ENGINEERING_REFERENCES_NATIVE_LOADER_AND_CATALOGUE_OK");
console.log("Metadata availability and wording contracts only; not model routing or effectiveness proof.");
