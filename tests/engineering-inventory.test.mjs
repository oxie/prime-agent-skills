// Mutation controls invoke the standalone gate against disposable owner copies.
// They stop at inventory validation, before any runtime loader is needed.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {spawnSync} from "node:child_process";
const root=fileURLToPath(new URL("..",import.meta.url));
const gate=path.join(root,"tests/engineering-references.mjs");
function rejectsMutation(change,reason){
 const fixture=fs.mkdtempSync(path.join(os.tmpdir(),"engineering-inventory-"));
 const owner=path.join(fixture,"engineering-references");
 try{
  fs.cpSync(path.join(root,"engineering-references"),owner,{recursive:true});
  change(owner);
  // An inventory regression must fail for the expected reason, not a later
  // loader error. The unused runtime path deliberately has no runtime module.
  const result=spawnSync(process.execPath,[gate,fixture,fixture],{encoding:"utf8",timeout:10000});
  assert.ifError(result.error);
  assert.equal(result.signal,null);
  assert.equal(result.status,1,result.stdout+result.stderr);
  assert.match(result.stderr,reason);
  assert.ok(!result.stdout.includes("ENGINEERING_REFERENCES_CONTRACT_AND_NATIVE_METADATA_OK"));
 }finally{
  fs.rmSync(fixture,{recursive:true,force:true});
 }
}
for(const name of ["debugging.md","domain-modeling.md","interface-design.md","test-design.md","agent-evaluation.md","threat-modeling.md","commerce.md"]){
 test(`reject missing reviewed reference ${name}`,()=>{
  rejectsMutation(owner=>fs.unlinkSync(path.join(owner,"references",name)),/Reviewed inventory: references/);
 });
}
for(const name of ["MATTPOCOCK_SOURCES.md","mattpocock-provenance.json","SUPER_SKILLS_SOURCES.md","super-skills-provenance.json","SUPERPOWERS_SOURCES.md","superpowers-provenance.json"]){
 test(`reject missing source record ${name}`,()=>{
  rejectsMutation(owner=>fs.unlinkSync(path.join(owner,name)),/Reviewed inventory: \./);
 });
}
for(const name of ["mattpocock-MIT.txt","super-skills-MIT.txt","superpowers-MIT.txt"]){
 test(`reject missing source license ${name}`,()=>{
  rejectsMutation(owner=>fs.unlinkSync(path.join(owner,"licenses",name)),/Reviewed inventory: licenses/);
 });
}
for(const dir of [".","references","licenses"]){
 test(`reject unreviewed file in ${dir}`,()=>{
  rejectsMutation(owner=>fs.writeFileSync(path.join(owner,dir,"unreviewed.md"),"# Unreviewed\n"),/Reviewed inventory:/);
 });
}
test("reject executable payload with unreviewed name",()=>{
 rejectsMutation(owner=>fs.writeFileSync(path.join(owner,"references","run.sh"),"#!/bin/sh\n",{mode:0o755}),/Reviewed inventory: references/);
});
for(const name of ["SKILL.md","references/debugging.md","licenses/super-skills-MIT.txt"]){
 test(`reject executable bit on approved name ${name}`,()=>{
  rejectsMutation(owner=>fs.chmodSync(path.join(owner,name),0o755),/Executable payload forbidden:/);
 });
}
test("reject nested payload hidden under an approved reference name",()=>{
 rejectsMutation(owner=>{
  const target=path.join(owner,"references/debugging.md");
  fs.unlinkSync(target);fs.mkdirSync(target);
  fs.writeFileSync(path.join(target,"run.sh"),"#!/bin/sh\n");
 },/Expected regular file: references\/debugging.md/);
});
test("reject symlink in place of an approved reference",()=>{
 rejectsMutation(owner=>{
  const target=path.join(owner,"references/debugging.md");
  fs.unlinkSync(target);fs.symlinkSync("test-design.md",target);
 },/Expected regular file: references\/debugging.md/);
});
test("reject unreviewed reference even when appended to a source manifest",()=>{
 rejectsMutation(owner=>{
  fs.writeFileSync(path.join(owner,"references/unreviewed.md"),"# Unreviewed\n");
  const target=path.join(owner,"mattpocock-provenance.json");
  const manifest=JSON.parse(fs.readFileSync(target,"utf8"));
  manifest.files.push({path:"references/unreviewed.md",sha256:"0".repeat(64)});
  fs.writeFileSync(target,JSON.stringify(manifest));
 },/Reviewed inventory: references/);
});
