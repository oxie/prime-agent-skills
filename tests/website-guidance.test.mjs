import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const page='marketingskills/skills/site-architecture/references/page-purpose.md';
const layout='hallmark/references/content-layouts.md';
const norm=t=>t.replace(/\s+/g,' ').toLowerCase();
function requires(t,terms){for(const term of terms)assert.ok(norm(t).includes(term.toLowerCase()),term);}
test('existing owners route selectively to the two references',()=>{
 requires(read('hallmark/SKILL.md'),['content-layouts.md','read only the relevant comparison']);
 requires(read('marketingskills/skills/site-architecture/SKILL.md'),['page-purpose.md','read only the relevant recipe','Hallmark','Skip business/marketing intake','return only the requested deliverable','task fit and useful omissions take priority','not universal requirements']);
 for(const p of ['hallmark/SKILL.md','marketingskills/skills/site-architecture/SKILL.md'])assert.ok(!/^allowed-tools:|^disable-model-invocation: true/m.test(read(p)));
});
test('page recipes distinguish reader tasks and permit useful omissions',()=>{
 requires(read(page),['Index: help readers choose what to read','Article: help readers understand one piece','Three projects rarely need filtering','local synthesis','Quantitative outcomes and client quotations are optional','included/excluded','one well-structured page','a handful of resources can be simple links','without a signup CTA','does not automatically require competitor research','not robots rules','No minimum word count']);
});
test('layout decisions depend on content, not a universal card template',()=>{
 requires(read(layout),['List or editorial index','Do not add thumbnail cards to text-only material','A grid need not wrap every item','Check visual, DOM and keyboard order','A carousel hides items','No required sidebar','actual distinguishing attributes','not universal device breakpoints','Prefer no autoplay','no new renderer']);
});
function safety(t){requires(t,['approved brief','real results','no-results state','only when its approved process exists','No source checklist proves rendered quality']);}
test('layout safeguards and mutation negatives remain strong',()=>{
 const t=read(layout);safety(t);
 for(const phrase of ['approved brief','real results','no-results state','only when its approved process exists','No source checklist proves rendered quality'])assert.throws(()=>safety(t.replaceAll(phrase,'REMOVED')));
 requires(read(page),['does not authorize research','Missing evidence is not permission to manufacture it','No mandatory second pass','not a mandatory feature checklist']);
});
test('new local links resolve and bodies contain no foreign context or promotion hooks',()=>{
 for(const p of [page,layout,'hallmark/SKILL.md','marketingskills/skills/site-architecture/SKILL.md']){
  // Exclude code fences: Mermaid node syntax is not a Markdown link.
  const prose=read(p).replace(/```[\s\S]*?```/g,'');
  for(const [,href] of prose.matchAll(/\]\(([^\s)]+)\)/g)){
   if(href.includes('://')||href.startsWith('#'))continue;
   // Existing illustrative website URL, not a package reference.
   if(p==='marketingskills/skills/site-architecture/SKILL.md' && href==='/features/analytics')continue;
   const target=path.resolve(root,path.dirname(p),href.split('#')[0]);
   assert.ok(target.startsWith(root+path.sep));assert.ok(fs.statSync(target).isFile(),p+': '+href);
  }
 }
 for(const p of [page,layout])for(const bad of ['.cursor/','.claude/','npx ','star the repo','2,500+','3.2×','sitelinks searchbox'])assert.ok(!read(p).includes(bad),bad);
});
test('both packages preserve the reviewed source and MIT notice',()=>{
 for(const p of ['hallmark','marketingskills']){
  requires(read(p+'/THIRD_PARTY.md'),['70987bad4ebe9dce1f74858c1c64f3f8810f18e4','Copyright (c) 2025 kostja94','Permission is hereby granted']);
  requires(read(p+'/UPSTREAM.md'),['selective website','local synthesis','not an unchanged']);
 }
 const provenance=JSON.parse(read('tests/fixtures/website-guidance-sources.json'));
 assert.equal(provenance.commit,'70987bad4ebe9dce1f74858c1c64f3f8810f18e4');
 for(const [p,digest] of Object.entries(provenance.installed_sha256))assert.equal(createHash('sha256').update(read(p)).digest('hex'),digest,p);
});
test('fresh native loader exposes the same owners with metadata-only descriptions',async()=>{
 const runtime=process.env.PRIME_NATIVE_ROOT;
 assert.ok(runtime,'Set PRIME_NATIVE_ROOT to the installed Prime package');
 const {loadSkills,formatSkillsForPrompt}=await import(pathToFileURL(path.join(runtime,'dist/core/skills.js')));
 const loaded=loadSkills({cwd:process.env.HOME,agentDir:path.dirname(root),includeDefaults:true,skillPaths:[]});
 assert.equal(loaded.diagnostics.length,0,JSON.stringify(loaded.diagnostics));
 assert.equal(loaded.skills.filter(s=>s.filePath.startsWith(path.join(root,'marketingskills','skills')+path.sep)).length,50);
 for(const name of ['hallmark','site-architecture']){
  const entries=loaded.skills.filter(s=>s.name===name);assert.equal(entries.length,1);assert.equal(entries[0].disableModelInvocation,false);
  const prompt=formatSkillsForPrompt(entries);assert.ok(prompt.includes(name));assert.ok(!prompt.includes('## Choose by the visitor'));assert.ok(!prompt.includes('## Decide before decorating'));
 }
});
