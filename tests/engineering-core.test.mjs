import {beforeEccFile} from "./helpers/ecc-snapshot.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {createHash} from "node:crypto";
import {test} from "node:test";
const root=path.resolve(process.argv[2]??path.dirname(new URL(import.meta.url).pathname),process.argv[2]?"":"..");
const skill=path.join(root,"engineering-references");
const read=p=>fs.readFileSync(path.join(skill,p),"utf8");
const hash=s=>createHash("sha256").update(s).digest("hex");
function checkContracts(contract,release){
 const c=contract.replace(/\s+/g," "),r=release.replace(/\s+/g," ");
 for(const phrase of [
  "A small static page with no such boundary needs none",
  "Keep the existing framework, client, wire envelope, parser and cache mechanisms",
  "all cells are unknown until exercised",
  "A type declaration proves neither runtime mapping nor an end-to-end cell",
  "A caller-selected generic type, cast or JSON syntax parse does not validate a domain value",
  "Status zero alone cannot distinguish them",
  "other fault -> preserve as internal fault, not a retryable network error",
  "Parsed shape does not remove valid optional-data handling, business rules, tenant/object authorization, version checks or stale-state defenses",
  "A whole-snapshot restore is safe only if intervening changes cannot be erased",
  "An inverse patch can also clobber newer writes",
  "not publish old server state over another pending change",
  "Retry that write only with proven server-backed idempotency or another documented duplicate-safe operation contract",
  "not component memoization",
  "a genuinely new intent gets a new one",
  "No supported gap means no change",
 ]) assert.ok(c.includes(phrase),`Missing boundary contract: ${phrase}`);
 for(const phrase of [
  "Reviews stay read-only",
  "a recent-commits fallback is partial scope",
  "An intentionally off flag or fixed canary allocation can meet the requested phase",
  "Reverting code does not undo written data or side effects",
  "A version endpoint can hit one new instance while other replicas or CDN assets are old",
  "Missing remote access alone is not a discovered defect",
  "An unverified required migration/topic/config dependency is a release uncertainty",
  "State unexecuted checks as unknown",
 ]) assert.ok(r.includes(phrase),`Missing release contract: ${phrase}`);
}
test("approved references preserve corrective contracts",()=>checkContracts(read("references/contract-boundaries.md"),read("references/release-dependencies.md")));
test("negative controls reject lost safety distinctions",()=>{
 const c=read("references/contract-boundaries.md"),r=read("references/release-dependencies.md");
 for(const phrase of ["all cells are unknown until exercised","Status zero alone cannot","not component memoization","only if intervening changes cannot be erased","Retry that write only with proven"])
  assert.throws(()=>checkContracts(c.replace(phrase,"REMOVED"),r),phrase);
 for(const phrase of ["Missing remote access alone is not a discovered defect","An intentionally off flag or fixed canary allocation can meet the requested phase"])
  assert.throws(()=>checkContracts(c,r.replace(phrase,"REMOVED")),phrase);
});
test("routed scope and illustrative-only sample",()=>{
 const s=read("SKILL.md"),c=read("references/contract-boundaries.md");
 assert.ok(s.includes("not every reference by default"));
 for(const p of ["references/contract-boundaries.md","references/release-dependencies.md"])assert.equal(s.split(`](${p})`).length-1,1);
 assert.ok(c.includes("Conceptual pseudocode, not an executable implementation"));
 const hall=fs.readFileSync(path.join(root,"hallmark/SKILL.md"),"utf8");
 assert.ok(hall.includes("Use engineering-references only when data-backed controls"));
 assert.ok(hall.includes("Do not turn a static page or visual-only edit into a data-layer review"));
});
test("source mappings, license copies and installed reference hashes",()=>{
 const p=JSON.parse(read("core-provenance.json"));
 assert.equal(p.collection.commit,"bdfbf79ccaabdc31f60ce60ef1703a9abe95f9c3");
 assert.equal(p.sources.length,7);
 assert.deepEqual(p.files.map(x=>x.path).sort(),["references/contract-boundaries.md","references/release-dependencies.md"]);
 for(const f of [...p.files,...p.licenses])assert.equal(hash(beforeEccFile(root,"engineering-references/"+f.path)),f.sha256,f.path);
 for(const f of p.files){assert.ok(f.sources.length>=3);assert.ok(read(f.path).includes("Modified for Prime"));}
 assert.ok(read("THIRD_PARTY.md").includes("Whxuan0701"));
 assert.ok(read("THIRD_PARTY.md").includes("Not a blanket MIT grant"));
 for(const s of p.sources){assert.match(s.sha256,/^[a-f0-9]{64}$/);assert.ok(s.url.includes(p.collection.commit));}
});
test("relative documentation links resolve",()=>{
 for(const rel of ["SKILL.md","UPSTREAM.md","THIRD_PARTY.md","references/contract-boundaries.md","references/release-dependencies.md"]){
  const text=read(rel).replace(/```[\s\S]*?```/g,"");
  for(const m of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
   if(/^(https?:|#)/.test(m[1]))continue;
   const target=path.resolve(skill,path.dirname(rel),m[1].split("#")[0]);
   assert.ok(target.startsWith(skill+path.sep));assert.ok(fs.statSync(target).isFile(),m[1]);
  }
 }
});
console.log("Textual contracts, negative controls, links and hashes; not model behavior or executed application semantics.");
