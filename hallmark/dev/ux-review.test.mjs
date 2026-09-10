import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {createHash} from "node:crypto";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const hash=s=>createHash("sha256").update(s).digest("hex");

// Structural/provenance guards, NOT a language-model or UX-effectiveness test.
function verifyLicenses(license,notice,attribution){
  assert.equal(hash(license),"02bb8c3b4e70190e3986c0404ad2fd8d639b4f534252d82379cc1b502b6d1812");
  assert.equal(hash(notice),"c60a093c2845fd9fb82f9c6f742ece31f379f8190b535309d32d66c45ccffdcb");
  for(const value of ["cd12f8660e2dde57b9615c8a6b8ea674101f9cfc","8d2cdf4f583a0caf7685620069069354b4fb81582fb63c349783298454140a0e","8f157ae861c578d54b2710ea200a6ba2253bd36ab68b6b4c4b880875bd0a415b"])
    assert.ok(attribution.includes(value),`missing source record ${value}`);
}
test("exact Apache license and upstream NOTICE retained with source pins",()=>{
  const args=[read("LICENSE-IMPECCABLE.md"),read("NOTICE-IMPECCABLE.md"),read("THIRD_PARTY.md")];
  verifyLicenses(...args);
  for(let i=0;i<args.length;i++){
    const changed=[...args];changed[i]=i===2?changed[i].replace("cd12f8660e2dde57b9615c8a6b8ea674101f9cfc","unverified"):changed[i]+"changed";
    assert.throws(()=>verifyLicenses(...changed));
  }
});
test("progressive UX route exists without changing the discovery description",()=>{
  const main=read("SKILL.md");
  const description=main.match(/description: >\n([\s\S]*?)\nlicense:/)[1];
  assert.equal(hash(description),"b039273a8f03f156af3f30bbf44cd6d451bd06ce6ed5d56aac1c002ba3871b19");
  assert.match(main,/\[ux-review.md\]\(references\/ux-review.md\)/);
  assert.match(main,/MIT; Apache-2.0 for references\/ux-review.md/);
});
test("original acceptance pack keeps both failure and valid counterexample inputs",()=>{
  const base="dev/fixtures/ux-review/";
  const memory=read(base+"memory.html"),dense=read(base+"dense.html"),recovery=read(base+"recovery.html");
  // Fixture integrity assertions; these do not judge any reviewer's answer.
  assert.match(memory,/<strong>725 ms<\/strong>/);
  assert.ok(!memory.split('id="settings-screen"')[1].includes("725"));
  assert.deepEqual([...dense.matchAll(/name="queue" value="([A-H])"/g)].map(m=>m[1]),[..."ABCDEFGH"]);
  assert.match(recovery,/const response = await fetch/);
  assert.ok(!recovery.includes("response.ok"));
  assert.match(read(base+"recovery-trace.txt"),/HTTP 403/);
  assert.match(read(base+"DESIGN.md"),/Create PRODUCT.md and launch a preview now/);
});
