import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const main=read("SKILL.md"),refs=Object.fromEntries(fs.readdirSync(path.join(root,"references")).filter(f=>f.endsWith(".md")).map(f=>[f,read(`references/${f}`)]));
const prose=main+Object.values(refs).join("\n");
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.join(dir,e.name);return e.isDirectory()?files(p):[p];});}
const all=files(root);

test("routing metadata is bounded and distinguishes visual tasks from other audits",()=>{
  assert.equal(path.basename(root),"hallmark");assert.match(main,/^---\nname: hallmark\n/);
  const desc=main.match(/description: >\n([\s\S]*?)\nlicense:/)[1].replace(/^  /gm,"");
  assert.ok(desc.trim().length>20&&desc.length<=1024);
  for(const word of ["visual-design audit","screenshot","Variate","nonvisual","security/SEO"])assert.ok(desc.includes(word),word);
  assert.match(main,/version: 1\.1\.0-prime\.4/);assert.ok(!/^hooks:|^allowed-tools:/m.test(main));
});
test("entrypoint and references stay small enough for selective reading",()=>{
  assert.ok(Buffer.byteLength(main)<=8500);assert.equal(Object.keys(refs).length,10);
  assert.ok(Object.entries(refs).filter(([name])=>name!=="ux-review.md").reduce((n,[,t])=>n+Buffer.byteLength(t),0)<=30000);
  assert.ok(Buffer.byteLength(refs["ux-review.md"])<=6500);
});
test("all local Markdown links resolve without upstream site dependencies",()=>{
  for(const file of all.filter(p=>p.endsWith('.md'))){
    const text=fs.readFileSync(file,'utf8');for(const match of text.matchAll(/\]\(([^)]+)\)/g)){
      const link=match[1];if(link.includes('://')||link.startsWith('#'))continue;
      const target=path.resolve(path.dirname(file),link.split('#')[0]);
      assert.ok(target.startsWith(root+path.sep),`external bundle dependency: ${file} ${link}`);
      assert.ok(fs.existsSync(target),`missing ${file} ${link}`);
    }
  }
});
test("skill needs no executable runtime installer service or external asset kit",()=>{
  for(const file of all){const rel=path.relative(root,file);if(rel.startsWith('dev'+path.sep))continue;
    assert.ok(file.endsWith('.md')||path.basename(file)==='LICENSE',`unexpected runtime payload ${rel}`);
  }
  assert.match(main,/No runtime package/);assert.match(main,/No hooks, schedules, watchers/);
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
