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
assert.deepEqual(fs.readdirSync(path.join(skill,"references")).sort(),[...expected.map(p=>path.basename(p)),"contract-boundaries.md","release-dependencies.md","api-authorization.md","sql-diagnosis.md"].sort());
assert.deepEqual(fs.readdirSync(skill).sort(),["LICENSE","SKILL.md","UPSTREAM.md","provenance.json","references","THIRD_PARTY.md","core-provenance.json","licenses","NEXT_SOURCES.md","next-provenance.json"].sort());
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
for(const doc of ["SKILL.md","UPSTREAM.md",...expected]){
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
