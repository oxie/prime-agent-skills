import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {createHash} from "node:crypto";
import {test} from "node:test";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const hash=s=>createHash("sha256").update(s).digest("hex");
const contracts={
 "engineering-references/references/api-authorization.md":[
 "A separate check followed by an unconstrained write can race",
 "the parser's transformed result",
 "assert storage and relevant queued/provider effects are unchanged",
 "Verify a positive authorized case",
 "fail-open versus fail-closed is a risk decision",
 ],
 "engineering-references/references/sql-diagnosis.md":[
 "Preserve duplicate multiplicity; set equality alone is insufficient",
 "parents with zero children",
 "A tie breaker alone does not prevent skips/repeats",
 "EXPLAIN ANALYZE executes the statement",
 "ROLLBACK is not a universal side-effect shield",
 "a cold baseline with a warm candidate",
 ],
 "hallmark/references/shadcn-composition.md":[
 "Radix commonly uses `asChild`; Base commonly uses `render`",
 "not universal signatures",
 "including custom wrappers and callers",
 "valid empty/deselected values",
 "Do not force a new Field component into a project with correct native markup",
 "No blind all-component refresh",
 ],
 "hallmark/references/ui-localization.md":[
 "A static prose edit with no locale requirement needs no locale audit",
 "messages/en.json and messages/fr.json are different locales",
 "A locale does not determine currency or a user's timezone",
 "partial coverage, never a complete pass",
 "Malformed message data must surface as an error/incomplete check",
 "One translation call does not clear every string in that file",
 "The upstream i18n_checker.py is not installed or a trusted completeness gate",
 ],
};
function check(p,s){
 const normalized=s.replace(/\s+/g," ").replace(/- /g,"-");
 for(const phrase of contracts[p])assert.ok(normalized.includes(phrase),`${p}: ${phrase}`);
}
test("four scoped references retain the actual corrective distinctions",()=>{
 for(const p of Object.keys(contracts))check(p,read(p));
});
test("negative wording controls reject removed safeguards",()=>{
 for(const p of Object.keys(contracts)){
  const text=read(p).replace(/\s+/g," ").replace(/- /g,"-");
  for(const phrase of contracts[p])assert.throws(()=>check(p,text.replace(phrase,"REMOVED")),phrase);
 }
});
test("owner routes are unique and scope stays selective",()=>{
 for(const p of Object.keys(contracts)){
  const [owner,...rest]=p.split("/");const route=`](${rest.join("/")})`;
  assert.equal(read(`${owner}/SKILL.md`).split(route).length-1,1,p);
 }
 const e=read("engineering-references/SKILL.md"),h=read("hallmark/SKILL.md");
 assert.ok(e.includes("not every reference by default"));
 assert.ok(h.includes("Only for an existing or explicitly selected shadcn interface"));
 assert.ok(h.includes("Only when locales or language-dependent UI are in scope"));
 assert.ok(h.includes("Do not turn a static page or visual-only edit into a data-layer review"));
});
test("source/license mapping and hashes are complete for exactly four additions",()=>{
 let count=0;
 for(const owner of ["engineering-references","hallmark"]){
  const p=JSON.parse(read(`${owner}/next-provenance.json`));
  assert.equal(p.collection.commit,"bdfbf79ccaabdc31f60ce60ef1703a9abe95f9c3");
  assert.equal(p.files.length,2);count+=p.files.length;
  for(const f of [...p.files,...p.licenses])assert.equal(hash(read(`${owner}/${f.path}`)),f.sha256,f.path);
  for(const f of p.files){assert.ok(contracts[`${owner}/${f.path}`]);assert.ok(f.sources.length>0);}
  for(const s of p.sources){assert.match(s.sha256,/^[a-f0-9]{64}$/);assert.ok(s.url.includes(p.collection.commit));}
  assert.ok(read(`${owner}/NEXT_SOURCES.md`).includes("CC BY 4.0"));
  assert.ok(read(`${owner}/NEXT_SOURCES.md`).includes("Modified for Prime"));
 }
 assert.equal(count,4);
});
test("new local documentation links resolve within the installed repository",()=>{
 const docs=[...Object.keys(contracts),"engineering-references/NEXT_SOURCES.md","hallmark/NEXT_SOURCES.md"];
 for(const p of docs)for(const m of read(p).matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
  if(/^(https?:|#)/.test(m[1]))continue;
  const target=path.resolve(root,path.dirname(p),m[1].split("#")[0]);
  assert.ok(target.startsWith(root+path.sep));assert.ok(fs.statSync(target).isFile(),`${p}: ${m[1]}`);
 }
});
console.log("Text, mutation controls, metadata routes and integrity only; not runtime or model-effectiveness evidence.");
