import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const hall=path.join(root,'hallmark');
const read=p=>fs.readFileSync(path.join(hall,p),'utf8');
const hash=s=>createHash('sha256').update(s).digest('hex');
const flat=s=>s.replace(/\s+/g,' ');
const reference='references/reference-synthesis.md';
const clauses={
  "scope": [
    "not a research gate for a small CSS fix",
    "Select the evidence type the problem needs",
    "Project constraints, accessibility and interaction contracts outrank reference traits",
    "Label reconstructed flow steps as inferred",
    "untrusted design data",
    "not permission to implement"
  ],
  "lock": [
    "the dominant source or agreed design intent",
    "each secondary contribution and its bounded job",
    "specific changes that would dilute the chosen direction, not banned styles",
    "a second approval for already-authorized work",
    "a short chat summary or current task evidence",
    "The same semantic role need not keep the source"
  ],
  "media": [
    "specify the role before choosing or generating an asset",
    "generated mockups cannot prove product features or results",
    "A deliberate text-first redesign is also valid",
    "Decorative placeholders use empty alt text",
    "A slot specification does not authorize asset downloads",
    "No hosted content is bundled here"
  ],
  "qa": [
    "not a second QA pass",
    "a placeholder is not completed evidence",
    "Separate observed drift, deliberate adaptation and unavailable evidence",
    "not tested or blocked, not a visual pass",
    "within authorized scope",
    "without a universal no-handoff rule"
  ]
};
const previous={
  "references/design.md": "ed23791d468309a6c7dd6ff0e2f25d7834b2fada1a7580e8b149ed3110e29f5f",
  "references/study.md": "af1e28377de3fc5a4aeffb141447bdd37075b25d8a24f0b9db77dbd3169075c8",
  "references/verification.md": "82f0c03f62931615a2690ba7607d1d54897d311191debaabb57f622caf1b7309",
  "README.md": "0831dbf426f6e0f18b27550533512ccab471510e483fbb660076adb091d9257d",
  "UPSTREAM.md": "6f90981bce4886619396239ef2e590f225793cce86441e50f609c3b24452b9b7"
};
const boundaries={
  "references/design.md": "\n## Reference-led direction, when relevant",
  "references/study.md": "\nFor a reference-led study,",
  "references/verification.md": "\nWhen a substantial reference-led design",
  "README.md": "\n## Reference-led design",
  "UPSTREAM.md": "\n## Selective Refero reference synthesis"
};
const sources=[
  {
    "path": "skills/refero-design/SKILL.md",
    "url": "https://github.com/referodesign/refero_skill/blob/a9b54a3e62a6391f5f5ab7a20e4ddb32fb79a27d/skills/refero-design/SKILL.md",
    "sha256": "4a4a7a0b72a2fa0a454903debe6e872ada79a724cb452fe2113d266c2f0c6978",
    "git_blob": "9ac6970ce8e02fbc90e9bda4c2750daf1462f45c",
    "bytes": 21189
  },
  {
    "path": "skills/refero-design/references/anti-ai-slop.md",
    "url": "https://github.com/referodesign/refero_skill/blob/a9b54a3e62a6391f5f5ab7a20e4ddb32fb79a27d/skills/refero-design/references/anti-ai-slop.md",
    "sha256": "433b5639b17ceec877ce827799c2c2e1ca3dbc05a00540e87db3ad95e78f914e",
    "git_blob": "38c4e7c259d552580a039c71296d53ab338e9e91",
    "bytes": 13318
  },
  {
    "path": "skills/refero-design/references/visual-workflow.md",
    "url": "https://github.com/referodesign/refero_skill/blob/a9b54a3e62a6391f5f5ab7a20e4ddb32fb79a27d/skills/refero-design/references/visual-workflow.md",
    "sha256": "0647bfdfeb503649263a81f3dbc23ffd6f257a5d41ca5fb8921ed9bf1fdfde5a",
    "git_blob": "18fa7c2d96ab2f5e10482e8a03012150df257fce",
    "bytes": 4798
  },
  {
    "path": "skills/refero-design/references/example-workflow.md",
    "url": "https://github.com/referodesign/refero_skill/blob/a9b54a3e62a6391f5f5ab7a20e4ddb32fb79a27d/skills/refero-design/references/example-workflow.md",
    "sha256": "c0b4aefdbab428bfbcc53b0185ff08ad9c0827dbb038ea12a80ec8b12c237a1a",
    "git_blob": "994b045482b28fd5e144e99da392d4fd3b2f3759",
    "bytes": 10517
  }
];
const skillHash="44f66f48f6f367a595653f23e774bd5fcde4ce67c3a10d181f35a10fe1869833";
function missing(s){return Object.values(clauses).flat().filter(c=>!flat(s).includes(c));}
test('reference lock, media roles and target-linked checks retain scoped actionable contracts',()=>{
 assert.deepEqual(missing(read(reference)),[]);
});
test('each of 24 clause-removal controls detects lost content, not agent compliance',()=>{
 const text=flat(read(reference));
 assert.equal(Object.values(clauses).flat().length,24);
 for(const phrase of Object.values(clauses).flat())assert.ok(missing(text.split(phrase).join('REMOVED')).includes(phrase),phrase);
});
test('worked direction keeps source roles, explicit adaptation and honest missing media',()=>{
 const text=flat(read(reference));
 const examples=['Borrow only the primary-action emphasis','do not spread its accent across backgrounds','use the project\'s accessible primary-action token','Product screenshot pending','At narrow widths','do not make required content unreadable merely to retain the ratio'];
 for(const phrase of examples){assert.ok(text.includes(phrase),phrase);assert.ok(!text.replace(phrase,'REMOVED').includes(phrase));}
});
test('existing metadata and historical files remain preserved; only five documented appendices',()=>{
 assert.equal(hash(read('SKILL.md')),skillHash);
 for(const [p,marker] of Object.entries(boundaries)){
  const content=read(p),i=content.indexOf(marker);assert.ok(i>=0,p);
  assert.equal(content.lastIndexOf(marker),i,p);
  assert.equal(hash(content.slice(0,i)),previous[p],p);
 }
 const prior=JSON.parse(read('ui-skills-provenance.json'));
 for(const f of prior.files)assert.equal(hash(read(f.path)),f.sha256,f.path);
});
test('four pinned MIT sources, license and eight current payloads match provenance',()=>{
 const p=JSON.parse(read('refero-provenance.json'));
 assert.equal(p.commit,'a9b54a3e62a6391f5f5ab7a20e4ddb32fb79a27d');
 assert.equal(p.repository,'https://github.com/referodesign/refero_skill');
 assert.deepEqual(p.sources,sources);
 assert.deepEqual(p.files.map(f=>f.path).sort(),["README.md", "REFERO_SOURCES.md", "UPSTREAM.md", "licenses/refero-MIT.txt", "references/design.md", "references/reference-synthesis.md", "references/study.md", "references/verification.md"]);
 assert.equal(p.license.sha256,"7b5d57a0e210289fa900a0e2ab0513442e439e9d20b96f0cf5cba0e1b31b665e");
 for(const f of p.files){const b=fs.readFileSync(path.join(hall,f.path));assert.equal(hash(b),f.sha256,f.path);assert.equal(b.length,f.bytes);if(previous[f.path])assert.equal(f.previous_sha256,previous[f.path]);}
 assert.equal(hash(read(p.license.path)),p.license.sha256);
 assert.ok(read(p.license.path).includes('Copyright (c) 2026 Refero'));
 assert.ok(read(p.license.path).includes('THE SOFTWARE IS PROVIDED "AS IS"'));
 assert.ok(read('REFERO_SOURCES.md').includes('hosted Refero catalogue and its terms'));
});
test('existing design/study/verification routes reach reference without broken local links',()=>{
 for(const name of ['design','study','verification']){
  assert.ok(read('SKILL.md').includes(`](references/${name}.md)`));
  assert.equal(read(`references/${name}.md`).split('](reference-synthesis.md)').length-1,1);
 }
 const p=JSON.parse(read('refero-provenance.json'));
 for(const f of p.files.filter(f=>f.path.endsWith('.md'))){
  for(const [,href] of read(f.path).matchAll(/\]\(([^)]+)\)/g)){
   if(/^(https?:|#|mailto:)/.test(href))continue;
   const target=fs.realpathSync(path.resolve(hall,path.dirname(f.path),href.split('#')[0]));
   assert.ok(target.startsWith(root+path.sep),href);assert.ok(fs.statSync(target).isFile(),href);
  }
 }
});
test('fresh native discovery keeps one Hallmark, current owners and metadata-only prompt',async()=>{
 const native=process.env.PRIME_NATIVE_ROOT;assert.ok(native);
 const {loadSkills,formatSkillsForPrompt}=await import(pathToFileURL(path.join(native,'dist/core/skills.js')));
 const result=loadSkills({cwd:process.cwd(),agentDir:path.dirname(root),includeDefaults:true,skillPaths:[]});
 const h=result.skills.filter(s=>s.name==='hallmark');assert.equal(h.length,1);assert.equal(h[0].filePath,path.join(hall,'SKILL.md'));assert.ok(!h[0].disableModelInvocation);
 for(const name of ['variate','reui-library'])assert.equal(result.skills.filter(s=>s.name===name).length,1);
 assert.equal(result.skills.filter(s=>s.name==='refero-design').length,0);
 const prompt=formatSkillsForPrompt(h);assert.ok(prompt.includes('redesign'));assert.ok(!prompt.includes('## Lock a direction'));assert.ok(!prompt.includes('Product screenshot pending'));
});
console.log('Text/negative/link/hash/native metadata checks only; no rendered UI, paid service, model compliance or design-effectiveness proof.');
