import {previousMengtoSkill} from './helpers/mengto-snapshot.mjs';
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
const files={audit:'references/audit.md',tokens:'references/tokens.md',motion:'references/interaction-motion.md'};
const clauses={
 audit:['not as a gate on every visual suggestion','is not proof of ownership',
 'Call this source-traced, not observed rendering','try to disprove the claim',
 'no supported inconsistency was found','Do not suppress observed functional/accessibility problems',
 'A chat finding does not require a plan file','require a second approval when the user already authorized'],
 tokens:['Repetition alone does not turn page-local literals into a global scale',
 'Preserve accepted decisions and alternate-theme values','A screenshot cannot establish exact CSS values',
 'adds no public crawling','command success alone does not prove complete conversion',
 'do not delete it merely to silence a validator','Unavailable validation remains unvalidated'],
 motion:['not a mandatory motion pass','keyframes and existing animation APIs can too',
 'illustrative starting hypotheses, not limits or measured improvements',
 'show success only when confirmed','Opacity, pointer-events or aria-hidden alone do not solve all three contracts',
 'when the preference changes live','Warmth must not persist for the entire component lifetime',
 "Keyboard focus need not inherit the pointer's waiting period",'Escape cancels pending opens',
 'Track pointer and focus together','Cancel open/cool timers on teardown',
 'A requestAnimationFrame callback alone does not prevent forced layout',
 'Scaling a panel is not equivalent to resizing it','not public browsing or performance traces'],
};
function check(kind,text){const flat=text.replace(/\s+/g,' ');for(const phrase of clauses[kind])assert.ok(flat.includes(phrase),`${kind}: ${phrase}`);}
test('scoped additions preserve actionable safeguards and evidence distinctions',()=>{
 for(const [kind,p] of Object.entries(files))check(kind,read(p));
});
test('phrase-removal controls reject each lost clause, not semantic certification',()=>{
 for(const [kind,p] of Object.entries(files)){
  const flat=read(p).replace(/\s+/g,' ');
  for(const phrase of clauses[kind])assert.throws(()=>check(kind,flat.replace(phrase,'REMOVED')),phrase);
 }
});
test('only the selected sections expand the previous audit and token bodies',()=>{
 const p=JSON.parse(read('ui-skills-provenance.json'));
 for(const [name,heading] of [['audit','## Prove claimed design-system drift'],['tokens','## Document claims and export loss, only on request']]){
  const content=read(files[name]);const before=content.slice(0,content.indexOf(heading)).trimEnd()+'\n';
  const record=p.files.find(f=>f.path===files[name]);assert.equal(hash(before),record.previous_sha256);
 }
 assert.deepEqual(p.files.map(f=>f.path).sort(),['SKILL.md',...Object.values(files)].sort());
 for(const f of p.files)assert.equal(hash(f.path==='SKILL.md'?previousMengtoSkill(root,'hallmark'):read(f.path)),f.sha256,f.path);
});
test('pinned direct provenance and distinct full MIT notice retained',()=>{
 const p=JSON.parse(read('ui-skills-provenance.json'));
 assert.equal(p.repository,'https://github.com/ibelick/ui-skills');
 assert.equal(p.commit,'79081abff1e887d55920f3debc11d78fea83a1b3');
 assert.equal(p.sources.length,15);
 for(const s of p.sources){assert.ok(s.url.includes(p.commit));assert.match(s.sha256,/^[a-f0-9]{64}$/);assert.match(s.git_blob,/^[a-f0-9]{40}$/);}
 assert.equal(hash(read(p.license.path)),p.license.sha256);
 assert.match(read(p.license.path),/Copyright \(c\) 2026 Julien Thibeaut/);
 assert.match(read(p.license.path),/THE SOFTWARE IS PROVIDED "AS IS"/);
 assert.match(read('LICENSE'),/Copyright \(c\) 2026 Hallmark contributors/);
 assert.ok(read('UI_SKILLS_SOURCES.md').includes('not a blanket license'));
});
test('routes preserve workflow and expand no browser or execution authority',()=>{
 const s=read('SKILL.md');
 assert.equal(s.split('](references/interaction-motion.md)').length-1,1);
 assert.ok(s.includes('Only for an animated control, tooltip timing issue or named DOM-motion concern'));
 assert.ok(s.includes('only when token changes/exports or a requested design document are in scope'));
 for(const phrase of ['**Audit:** report only','Do not ask answered questions','does not crawl public URLs','No hooks, schedules, watchers','Do not invent backend behavior'])assert.ok(s.includes(phrase),phrase);
 assert.ok(!/^hooks:|^allowed-tools:/m.test(s));
 for(const f of [path.join(hall,'SKILL.md'),...Object.values(files).map(p=>path.join(hall,p)),path.join(hall,'UI_SKILLS_SOURCES.md')]){
  // Keep this historical owner-only link contract exact; Taste tests check its new cross-owner route.
  const linkText=f===path.join(hall,'SKILL.md')?previousMengtoSkill(root,'hallmark').toString('utf8'):fs.readFileSync(f,'utf8');
  for(const [,href] of linkText.matchAll(/\]\(([^)]+)\)/g)){
   if(/^(https?:|#)/.test(href))continue;
   const target=path.resolve(path.dirname(f),href.split('#')[0]);assert.ok(target.startsWith(hall+path.sep));assert.ok(fs.statSync(target).isFile(),href);
  }
 }
});
test('fresh native discovery loads Hallmark once with metadata, not reference bodies',async()=>{
 const native=process.env.PRIME_NATIVE_ROOT;assert.ok(native);
 const {loadSkills,formatSkillsForPrompt}=await import(pathToFileURL(path.join(native,'dist/core/skills.js')));
 const loaded=loadSkills({cwd:process.cwd(),agentDir:path.dirname(root),includeDefaults:true,skillPaths:[]});
 const h=loaded.skills.filter(s=>s.name==='hallmark');assert.equal(h.length,1);assert.equal(h[0].filePath,path.join(hall,'SKILL.md'));
 const prompt=formatSkillsForPrompt(h);assert.ok(prompt.includes('microinteraction tuning'));
 assert.ok(!prompt.includes('Warmth must not persist'));assert.ok(!prompt.includes('Prove claimed design-system drift'));
 assert.equal(loaded.skills.filter(s=>s.name==='variate').length,1);
});
console.log('Text, source identities and native metadata only; no rendered interaction, export, accessibility, performance or model-efficacy proof.');
