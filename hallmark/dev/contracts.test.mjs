import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import os from "node:os";
import {descriptionOf, verifyDescription, verifyVersion, verifyReadingBudget, files,
  verifyPayload, verifyLink, dataPayloads, licensePayloads} from "./contract-helpers.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const main=read("SKILL.md"),refs=Object.fromEntries(fs.readdirSync(path.join(root,"references")).filter(f=>f.endsWith(".md")).map(f=>[f,read(`references/${f}`)]));
const prose=main+Object.values(refs).join("\n");
const all=files(root);

test("routing metadata is bounded and distinguishes visual tasks from other audits",()=>{
  assert.equal(path.basename(root),"hallmark");assert.match(main,/^---\nname: hallmark\n/);
  verifyDescription(descriptionOf(main));
  verifyVersion(main,read("UPSTREAM.md"));
  assert.ok(!/^hooks:|^allowed-tools:/m.test(main));
});
test("entrypoint and references stay small enough for selective reading",()=>{
  verifyReadingBudget(main,refs);
});
test("local Markdown links resolve with only documented optional sibling handoffs",()=>{
  for(const file of all.filter(p=>p.endsWith('.md'))){
    const text=fs.readFileSync(file,'utf8');
    for(const match of text.matchAll(/\]\(([^)]+)\)/g))verifyLink(root,file,match[1]);
  }
});
test("only the named optional catalogue helper adds runtime code; no installer or service",()=>{
  for(const file of all)verifyPayload(root,file);
  for(const rel of [...dataPayloads,...licensePayloads])assert.ok(all.includes(path.join(root,rel)),`missing reviewed payload ${rel}`);
  assert.match(main,/No runtime package/);assert.match(main,/No hooks, schedules, watchers/);
});

test("routing and version guards reject lost scope without pinning description bytes",()=>{
  const description=descriptionOf(main);
  verifyDescription(description.replace("Design distinctive, usable interfaces", "Design clear, usable interfaces"));
  for(const [before,after] of [
    ["Not for routine nonvisual coding", "Use for routine nonvisual coding"],
    ["security/SEO audits", "all audits"],
    ["conversion measurement", "conversion improvement"],
    ["URL-only study asks for a screenshot", "URL-only study crawls the URL"],
    ["authorized local previews", "public previews"],
    ["does not provide a public-web crawler", "provides a public-web crawler"],
    ["version-aware shadcn composition", "shadcn installation"],
    ["localized UI usability", "automatic locale translation"],
  ])assert.throws(()=>verifyDescription(description.replace(before,after)),/routing boundary/);
  assert.throws(()=>verifyDescription(description+"x".repeat(1024)),/description budget/);
  assert.throws(()=>descriptionOf(main.replace("description: >","description:")),/folded description/);
  assert.throws(()=>verifyVersion(main.replace(/version: [^\n]+/,"version: 0.0.0-prime.0"),read("UPSTREAM.md")),/version must match/);
  assert.throws(()=>verifyVersion(main.replace(/version: [^\n]+/,"version: latest"),read("UPSTREAM.md")),/Prime adaptation version/);
});
test("reading budgets reject missing, renamed, extra, empty and oversized references",()=>{
  assert.throws(()=>verifyReadingBudget("x".repeat(10*1024+1),refs),/entrypoint/);
  const missing={...refs};delete missing["tokens.md"];
  assert.throws(()=>verifyReadingBudget(main,missing),/inventory/);
  assert.throws(()=>verifyReadingBudget(main,{...missing,"renamed.md":refs["tokens.md"]}),/inventory/);
  assert.throws(()=>verifyReadingBudget(main,{...refs,"extra.md":"new guide"}),/inventory/);
  for(const [name,size] of [["audit.md",8193],["ux-review.md",6501],["reference-synthesis.md",10241]])
    assert.throws(()=>verifyReadingBudget(main,{...refs,[name]:"x".repeat(size)}),/reference budget/);
  assert.throws(()=>verifyReadingBudget(main,{...refs,"audit.md":" "}),/reference budget/);
  const full=Object.fromEntries(Object.keys(refs).map(name=>[name,"x".repeat(name==="ux-review.md"?6500:8192)]));
  assert.throws(()=>verifyReadingBudget(main,full),/total reference budget/);
});
test("payload and link guards reject executable, unreviewed and escaping mutations",t=>{
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),"hallmark-contract-"));
  t.after(()=>fs.rmSync(temp,{recursive:true,force:true}));
  const bundle=path.join(temp,"hallmark");fs.mkdirSync(bundle);
  const put=(rel,text="# Local text\n")=>{
    const file=path.join(bundle,rel);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,text);return file;
  };
  const source=put("SKILL.md"),doc=put("references/guide.md"),data=put(dataPayloads[0],"{}");
  verifyPayload(bundle,doc);verifyPayload(bundle,data);
  verifyLink(bundle,source,"references/guide.md#section");
  verifyLink(bundle,source,"https://example.com/citation");verifyLink(bundle,source,"#section");
  for(const rel of ["run.js","run.sh","run.py","package.json","extra-provenance.json","licenses/extra.txt","devil/run.js"])
    assert.throws(()=>verifyPayload(bundle,put(rel)),/unexpected runtime payload/);
  for(const text of ["not JSON","[]","null"]){
    fs.writeFileSync(data,text);assert.throws(()=>verifyPayload(bundle,data));
  }
  fs.writeFileSync(data,"{}");fs.chmodSync(data,0o755);
  assert.throws(()=>verifyPayload(bundle,data),/executable payload/);fs.chmodSync(data,0o644);
  assert.throws(()=>verifyPayload(bundle,put("script.md","#!/bin/sh\necho bad\n")),/non-text payload/);
  assert.throws(()=>verifyPayload(bundle,put("binary.md","\0")),/non-text payload/);
  const outside=path.join(temp,"outside.md");fs.writeFileSync(outside,"# Outside\n");
  assert.throws(()=>verifyPayload(bundle,outside),/escaping payload/);
  const alias=path.join(bundle,"alias.md");fs.symlinkSync(outside,alias);
  assert.throws(()=>verifyPayload(bundle,alias),/symlink payload/);
  assert.throws(()=>files(bundle),/symlink payload/);
  for(const link of ["../outside.md","%2e%2e/outside.md","../hallmark-other/guide.md","../reui-library/README.md"])
    assert.throws(()=>verifyLink(bundle,source,link),/external bundle dependency/);
  for(const link of ["/etc/passwd","//example.com/path","file:///tmp/a","javascript:alert","data:text/plain,hi","..\\outside.md"])
    assert.throws(()=>verifyLink(bundle,source,link),/unsafe link/);
  assert.throws(()=>verifyLink(bundle,source,"references/missing.md"),/missing/);
  assert.throws(()=>verifyLink(bundle,source,"references"),/not a file/);
  assert.throws(()=>verifyLink(bundle,source,"alias.md"),/symlink link/);
  put("run.js");assert.throws(()=>verifyLink(bundle,source,"run.js"),/non-document link/);
  fs.chmodSync(doc,0o755);assert.throws(()=>verifyLink(bundle,source,"references/guide.md"),/executable link/);
  fs.chmodSync(doc,0o644);
  // A valid optional handoff must resolve from its documented source, not any file.
  const sibling=path.join(temp,"cinematic-ui/references");fs.mkdirSync(sibling,{recursive:true});
  const target=path.join(sibling,"inline-media-type.md");fs.writeFileSync(target,"# Recipe\n");
  verifyLink(bundle,source,"../cinematic-ui/references/inline-media-type.md");
  assert.throws(()=>verifyLink(bundle,doc,"../../cinematic-ui/references/inline-media-type.md"),/external bundle dependency/);
  fs.unlinkSync(target);fs.symlinkSync(outside,target);
  assert.throws(()=>verifyLink(bundle,source,"../cinematic-ui/references/inline-media-type.md"),/symlink link/);
});

test("21 structures and 21 source theme choices remain available locally",()=>{
  const macros=[...refs['directions.md'].matchAll(/^\| (\d{2}) /gm)].map(m=>Number(m[1]));assert.deepEqual(macros,Array.from({length:21},(_,i)=>i+1));
  const names=[...refs['themes.md'].matchAll(/^\| ([A-Z][^|]+) \|/gm)].map(m=>m[1].trim()).filter(n=>n!=='Theme');
  assert.equal(new Set(names).size,21);assert.equal(names.length,21);
  for(const name of ['Specimen','Cobalt','Lumen','Hum','Grid'])assert.ok(names.includes(name));
  assert.match(refs['themes.md'],/All contrast is UNVERIFIED/);assert.match(refs['themes.md'],/Do not fetch fonts/);
});
test("brief and existing system outrank style suggestions; no repeat interview",()=>{
  assert.match(main,/user's brief and existing design system take priority/);
  assert.match(main,/Do not ask answered questions/);assert.match(main,/Preserve intentional fonts/);
  assert.match(main,/not mandatory rotation/);
  for(const bad of ['silently flatten','NOT bypassable','Always ask — answering is optional','58 / 58 ✓'])assert.ok(!prose.includes(bad),bad);
});
test("audit is read-only and distinguishes functional issues from taste",()=>{
  assert.match(refs['audit.md'],/Do not edit/);assert.match(refs['audit.md'],/optional visual suggestion/);
  assert.match(refs['audit.md'],/not approval/);assert.match(refs['audit.md'],/Do not infer who or what authored/);
});
test("study has explicit vision evidence limits and no invented URL fetch capability",()=>{
  const text=refs['study.md'];for(const part of ['URL-only request','does not prove ownership','Do not execute','Only explicit approval','unknown','vision is unavailable'])assert.ok(text.includes(part),part);
  assert.match(main,/URL-only requests, ask for a screenshot/);assert.match(text,/Private\/internal URLs/);
  assert.match(main,/authorized owned local preview/);assert.match(main,/`browser-check` skill/);
  assert.match(main,/does not crawl public URLs/);
});
test("tokens follow actual consumer and do not create parallel authorities",()=>{
  const text=refs['tokens.md'];for(const part of ['Do not always add tokens.css','version','native','shadcn','DTCG','unvalidated','No token or global stylesheet changes during an open Variate'])assert.ok(text.includes(part),part);
  assert.match(main,/No mandatory `tokens.css`/);assert.match(main,/Re-read current relevant sources/);
});
test("Variate owns baseline live switching queue and acceptance",()=>{
  const text=refs['variate.md'];for(const part of ['One coordinator','baseline','live target','shared styles','assigned','does not acknowledge','relevant user request','plan.json','separate approved change'])assert.ok(text.includes(part),part);
  assert.match(text,/not implement a second queue/);
});
test("verification never equates self-score or source inspection with runtime proof",()=>{
  assert.match(main,/never print a pass score before/);assert.match(main,/not tested/);
  assert.match(refs['verification.md'],/WCAG ratios/);assert.match(refs['verification.md'],/APCA Lc/);
  assert.match(refs['verification.md'],/no numeric score|not a numeric score/);
});
test("MIT provenance retained and unsafe source licensing claims not imported",()=>{
  assert.match(read('LICENSE'),/Copyright \(c\) 2026 Hallmark contributors/);
  assert.match(read('UPSTREAM.md'),/13ac0ec7e148655948100b6396439e481361d690/);
  assert.ok(!/Unsplash[^\n]*CC0|Pexels[^\n]*CC0/.test(prose));
});
test("pilot alternatives preserve exact copy links tokens and single-file constraints",()=>{
  const fixture='dev/fixtures/existing-system/';const baseline=read(fixture+'index.html');
  const visible=s=>s.match(/<body[^>]*>([\s\S]*?)<\/body>/i)[1].replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  const hrefs=s=>[...s.matchAll(/<a[^>]*href="([^"]+)"/g)].map(m=>m[1]);
  for(const n of [2,3]){
    const text=read(fixture+n+'.html');assert.equal(visible(text),visible(baseline));assert.deepEqual(hrefs(text),hrefs(baseline));
    assert.match(text,/<main[^>]*data-variate-section="index"/);assert.match(text,/href="tokens.css"/);
    assert.ok(!/<script|https?:|@import|overflow[^;]*:\s*(hidden|clip)|white-space:\s*nowrap/i.test(text));
    const style=text.match(/<style>([\s\S]*?)<\/style>/i)[1];assert.ok(!/#(?:[0-9a-f]{3}){1,2}\b|(?:oklch|rgb|hsl)\(/i.test(style));
    assert.match(style,/font-family:\s*var\(--font\)/);assert.match(style,/:focus-visible/);
  }
});
