import test from 'node:test';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const h=read('hallmark/SKILL.md'),e=read('marketingskills/skills/copy-editing/SKILL.md'),w=read('marketingskills/skills/copywriting/SKILL.md');
const a=read('hallmark/references/app-quality.md');
const f=read('marketingskills/skills/copy-editing/references/source-fidelity-and-clarity.md');
const c=read('marketingskills/skills/copy-editing/references/comment-review.md');
const normalize=t=>t.replace(/\s+/g,' ').toLowerCase();
function requires(text,terms){for(const term of terms)assert.ok(normalize(text).includes(term.toLowerCase()),term);}
test('discovery descriptions distinguish mobile UI, general prose/comments and marketing drafting',()=>{
 requires(h.split('license:')[0],['app/mobile usability','nonvisual','security/SEO']);
 requires(e.split('metadata:')[0],['documents','reports','README files','code comments','non-marketing branch']);
 requires(w.split('metadata:')[0],['marketing copy']);
 for(const text of [h,e,w])assert.ok(!/^disable-model-invocation: true|^allowed-tools:|^hooks:/m.test(text));
});
test('nonmarketing task branch precedes and bypasses conversion workflow',()=>{
 assert.ok(e.indexOf('## Choose the Task Mode First')<e.indexOf('## Core Philosophy'));
 requires(e,['Skip product-marketing context, the Seven Sweeps, conversion checklists, and expert personas','Skip the marketing workflow','For marketing tasks, check product marketing context first','a review returns findings']);
});
test('fidelity protects meaning rather than cosmetic authorship cues',()=>{
 requires(f,['uncertainty','negation','MUST NOT','denominators','comparison periods','correlation into causation','exact quotations','Passive voice is valid','not independent factual verification','does not establish authorship','typos']);
});
test('rewrite examples no longer manufacture pricing or security scope',()=>{
 requires(f,['Here is our pricing. | Do not invent a tier','Data is encrypted. | Data is encrypted.','scope is unknown','do not add “research showed.”']);
 requires(e,['Conditional specificity examples','only from supplied evidence','flag missing information rather than invent terms']);
});
test('comment review preserves tool directives, placement and semantic boundaries',()=>{
 requires(c,['Shebangs','encoding declarations','Lint suppressions','type-checker directives','formatter','coverage','compiler/build','source-map','Documentation-generated types','doctest','License/copyright','placement','keep a blank line','Do not shift code columns','non-comment whitespace','does not prove','semantics unchanged','unknown directive','not a code-correctness, performance, or security audit']);
});
test('useful comments and author conventions are not subject to quotas',()=>{
 requires(c,['numbered algorithm steps','section separators','no one-comment-per-block quota','Do not erase an unresolved TODO','not idempotent','Hold the lock']);
});
test('drafting links fidelity and rejects unsupported conversion proof',()=>{
 requires(w,['Draft and Claim Check','does not verify current Slack capabilities','free trial','must exist','not general document or code-comment writing']);
 const framework=read('marketingskills/skills/copywriting/references/copy-frameworks.md');
 requires(framework,['Conditional examples, not product facts','source not supplied','does not supply primary evidence']);
 for(const bad of ['**+81% conversions**','**−38% sales cycle**','**roughly tripled (3×) conversions**'])assert.ok(!framework.includes(bad));
});
test('refresh and word alternatives retain historical facts and technical qualifiers',()=>{
 requires(read('marketingskills/skills/copy-editing/references/content-refresh.md'),['never relabel old data as current','only when real evidence is supplied']);
 requires(read('marketingskills/skills/copy-editing/references/plain-english-alternatives.md'),['not use this as a bulk replacement list','robust statistics','condition, timing, or voice']);
});
test('app/mobile checks preserve real states, content and native controls',()=>{
 requires(a,['A static list needs no invented loading/error path','Filters match nothing','Permission denied','real, named comparison period','not just the presence','Enter for links','roving tabindex','programmatic focus targets','do not clip the root','New fixed nav is not required']);
});
test('accessibility thresholds and exceptions are corrected without certification claims',()=>{
 requires(a,['18pt regular (24 CSS px)','14pt bold','Normal-weight 18px is not large','unrounded','4.499 fails','24 by 24','44 by 44','enhanced AAA','exceptions','200%','320 CSS px','reduced motion','not tested','not a whole-product gate or full accessibility certification']);
});
test('existing brand and scope controls remain intact',()=>{
 requires(h,["user's brief and existing design system take priority",'No mandatory','theme switcher','report only','do not edit','not an AI-authorship detector']);
 requires(e,['No mandatory questionnaire','without changing files','Do not require per-finding approval','stop when the requested edits']);
});
test('both receiving packages preserve Anti-slop MIT attribution',()=>{
 for(const pkg of ['hallmark','marketingskills'])requires(read(pkg+'/THIRD_PARTY.md'),['55e0e160d18a9a963c6486d5c6be6d9e82418c5c','MIT License','Copyright (c) 2026 Miqdad Badjuber','Permission is hereby granted']);
});
test('new progressive links resolve inside the installed repository',()=>{
 for(const p of ['hallmark/SKILL.md','hallmark/references/app-quality.md','marketingskills/skills/copy-editing/SKILL.md','marketingskills/skills/copy-editing/references/comment-review.md','marketingskills/skills/copy-editing/references/source-fidelity-and-clarity.md','marketingskills/skills/copywriting/SKILL.md']){
 for(const [,href] of read(p).matchAll(/\]\(([^\s)]+)\)/g)){
 if(href.includes('://')||href.startsWith('#'))continue;
 const target=path.resolve(root,path.dirname(p),href.split('#')[0]);assert.ok(target.startsWith(root+path.sep));assert.ok(fs.existsSync(target),p+': '+href);
 }}
});

test('all 50 marketing skill directory digests match the documented byte contract',()=>{
 const manifest=JSON.parse(read('marketingskills/MANIFEST.json'));
 assert.equal(manifest.skills.length,50);
 for(const entry of manifest.skills){
  const dir=path.join(root,'marketingskills',entry.path);
  const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
  const files=walk(dir).map(p=>({p,rel:path.relative(dir,p).split(path.sep).join('/')})).sort((a,b)=>a.rel<b.rel?-1:a.rel>b.rel?1:0);
  const hash=createHash('sha256');for(const {p,rel} of files){hash.update(rel);hash.update('\0');hash.update(fs.readFileSync(p));hash.update('\0');}
  assert.equal(hash.digest('hex'),entry.sha256,entry.name);
 }
});

// Historical evidence is frozen; the current integration contracts above still
// read installed source. This archive does not measure current model behavior.
const pilotBytes=fs.readFileSync(path.join(root,'tests/fixtures/anti-slop-pilot.json'));
const snapshotBytes=fs.readFileSync(path.join(root,'tests/fixtures/anti-slop-pilot-snapshot.json'));
const pilot=JSON.parse(pilotBytes);
const snapshot=JSON.parse(snapshotBytes);
const pilotSha256='78406a029e2e404f2125c1caca3f581a8f24c865974c20df776a8da5bfdf6e49';
const snapshotSha256='7e6b993b0037e221a19c3cb29a7513d63e63df6213cb97656ae7c9318d150899';
const sourceRevision='22980c2eff795b81fb52a877a0086ff2f12d4dd1';
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const gitBlob=bytes=>createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
function historicalBinding(recordBytes,archive){
 assert.equal(sha256(recordBytes),pilotSha256,'original pilot bytes');
 const record=JSON.parse(recordBytes);
 assert.deepEqual(Object.keys(archive).sort(),['pilot','source_revision','sources']);
 assert.equal(archive.source_revision,sourceRevision,'historical source revision');
 assert.deepEqual(archive.pilot,{
  path:'tests/fixtures/anti-slop-pilot.json',sha256:pilotSha256,git_blob:gitBlob(recordBytes)
 },'pilot provenance');
 assert.deepEqual(Object.keys(archive.sources).sort(),Object.keys(record.guidance_sha256).sort(),'exact historical source set');
 for(const [p,digest] of Object.entries(record.guidance_sha256)){
  const source=archive.sources[p];
  assert.deepEqual(Object.keys(source).sort(),['git_blob','sha256','utf8'],p+': source manifest');
  assert.equal(typeof source.utf8,'string',p+': UTF-8 source');
  const bytes=Buffer.from(source.utf8,'utf8');
  assert.equal(source.sha256,digest,p+': recorded guidance digest');
  assert.equal(sha256(bytes),digest,p+': historical source bytes');
  assert.equal(gitBlob(bytes),source.git_blob,p+': Git blob provenance');
 }
 for(const output of Object.values(record.outputs)){
  for(const p of output.loadedReferences)assert.ok(Object.hasOwn(archive.sources,p),p+': archived reference');
 }
}
test('historical pilot binds unchanged evidence to authentic archived source, not current skill bytes',()=>{
 assert.equal(sha256(snapshotBytes),snapshotSha256,'exact archived snapshot bytes');
 historicalBinding(pilotBytes,snapshot);
 const routes={prose:'copy-editing',comments:'copy-editing',ui:'hallmark',draft:'copywriting'};
 for(const [key,skill] of Object.entries(routes))assert.deepEqual(pilot.outputs[key].selectedSkills,[skill]);
});
test('historical binding rejects changed pilot bytes or rewritten guidance hashes',()=>{
 assert.throws(()=>historicalBinding(Buffer.concat([pilotBytes,Buffer.from('\n')]),snapshot),/original pilot bytes/);
 const changed=pilotBytes.toString('utf8').replace(pilot.guidance_sha256['hallmark/SKILL.md'],'0'.repeat(64));
 assert.throws(()=>historicalBinding(Buffer.from(changed),snapshot),/original pilot bytes/);
});
test('historical binding rejects corrupted provenance and incomplete source manifests',()=>{
 const wrongRevision=structuredClone(snapshot);wrongRevision.source_revision='0'.repeat(40);
 assert.throws(()=>historicalBinding(pilotBytes,wrongRevision),/historical source revision/);
 const wrongPilot=structuredClone(snapshot);wrongPilot.pilot.git_blob='0'.repeat(40);
 assert.throws(()=>historicalBinding(pilotBytes,wrongPilot),/pilot provenance/);
 const missing=structuredClone(snapshot);delete missing.sources['hallmark/SKILL.md'];
 assert.throws(()=>historicalBinding(pilotBytes,missing),/exact historical source set/);
 const extra=structuredClone(snapshot);extra.sources['unrecorded.md']=snapshot.sources['hallmark/SKILL.md'];
 assert.throws(()=>historicalBinding(pilotBytes,extra),/exact historical source set/);
});
test('historical binding rejects corrupt source bytes, rebinding and fabricated source hashes',()=>{
 const p='hallmark/SKILL.md';
 const corrupt=structuredClone(snapshot);corrupt.sources[p].utf8+='\n';
 assert.throws(()=>historicalBinding(pilotBytes,corrupt),/historical source bytes/);
 const rebound=structuredClone(snapshot);rebound.sources[p]=snapshot.sources['hallmark/references/audit.md'];
 assert.throws(()=>historicalBinding(pilotBytes,rebound),/recorded guidance digest/);
 const fabricated=structuredClone(corrupt);
 fabricated.sources[p].sha256=sha256(Buffer.from(fabricated.sources[p].utf8));
 fabricated.sources[p].git_blob=gitBlob(Buffer.from(fabricated.sources[p].utf8));
 assert.throws(()=>historicalBinding(pilotBytes,fabricated),/recorded guidance digest/);
 const wrongBlob=structuredClone(snapshot);wrongBlob.sources[p].git_blob='0'.repeat(40);
 assert.throws(()=>historicalBinding(pilotBytes,wrongBlob),/Git blob provenance/);
});
test('prose pilot preserves quantities, qualifiers, command and approved quotation',()=>{
 const text=pilot.outputs.prose.output;
 for(const token of ['in beta','12-run local test','median','8 s to 6 s','may not generalize to production','not verified Windows support','`tool export --dry-run`','“Fast—when it fits.”'])assert.ok(text.includes(token),token);
 assert.equal(text,pilot.inputs.prose.input.replace('currently ',''));
});
function commentPositions(input,output){
 const expected=input.replace('// Increment count by one.','');
 assert.equal(output,expected,'only redundant comment text may change; preserve all other bytes and line positions');
}
test('comment pilot preserves directives, executable bytes and source-map line positions',()=>{
 commentPositions(pilot.inputs.comments.input,pilot.outputs.comments.output);
});
test('comment gate rejects the original line-shifting failure and executable mutation',()=>{
 const input=pilot.inputs.comments.input;
  const shifted=input.replace('// Increment count by one.'+String.fromCharCode(10),'');
  assert.notEqual(shifted,input);
  assert.equal(shifted.split(String.fromCharCode(10)).length,input.split(String.fromCharCode(10)).length-1);
  assert.throws(()=>commentPositions(input,shifted));
 assert.throws(()=>commentPositions(input,pilot.outputs.comments.output.replace('count += 1','count += 2')));
});
test('UI pilot distinguishes source concerns, valid brand choices and untested behavior',()=>{
 const out=pilot.outputs.ui.output;
 requires(out,['No files were edited','runtime behavior were not tested','min-width:900px','overflow-x:hidden','no native button semantics','There is no button in this snippet','Keep all three real pricing tiers','theme switcher is not required','em dash','not shown in this snippet','No compliance or conversion claim']);
});
test('draft pilot stays within supplied facts with benchmark uncertainty intact',()=>{
 assert.equal(pilot.outputs.draft.output,'TraceKit is a command-line tool that exports local logs as JSON. Its dry-run option previews which files would be exported. Production benchmarks have not been measured.');
});
