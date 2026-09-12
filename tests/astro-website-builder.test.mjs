import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {test} from 'node:test';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(root,'astro-website-builder');
const read=p=>fs.readFileSync(path.join(dir,p),'utf8');
const hash=s=>createHash('sha256').update(s).digest('hex');
const normalize=s=>s.replace(/\s+/g,' ');
const required={
 'SKILL.md':[
  'not a default framework for every',
  'Reviews stay read-only unless edits are authorized',
  'Required backend features remain real work',
  'no upstream Astro Builder or Taste text is redistributed',
 ],
 'references/project-setup.md':[
  'Do not overwrite custom source or lockfiles',
  'Astro 5 has legacy compatibility',
  'Do not combine v4 setup commands with v3 copied config',
  "Do not use `output: 'hybrid'`",
  'Middleware source does not prove headers on emitted files',
 ],
 'references/content-routes.md':[
  'same finite epoch-millisecond cutoff to every build stage',
  'An index-page filter alone does not protect draft routes',
  'handle missing and unpublished entries before rendering',
  'changing draft metadata alone cannot withdraw deployed bytes',
  'Check the exact sorted IDs, not only the count',
  'A predicate unit test does not prove every route calls it',
 ],
 'references/page-delivery.md':[
  'JSON.stringify alone does not make data safe inside an HTML script element',
  'React is not required for a FAQ or navigation',
  'Hydrated islands normally start with server-rendered HTML',
  'A form without method/action defaults to GET on the current page',
  'Static hosting does not implement a POST endpoint because the form names one',
  'Never silently turn a failed response into an empty table or successful toast',
 ],
};
function check(p,s){for(const phrase of required[p])assert.ok(normalize(s).toLowerCase().includes(phrase.toLowerCase()),`${p}: ${phrase}`);}
test('selective builder contracts and phrase-removal controls',()=>{
 for(const p of Object.keys(required)){
  const text=normalize(read(p));check(p,text);
  for(const phrase of required[p]){
   const start=text.toLowerCase().indexOf(phrase.toLowerCase());
   assert.throws(()=>check(p,text.slice(0,start)+'REMOVED'+text.slice(start+phrase.length)),phrase);
  }
 }
});
test('actual pure example denies draft/future/invalid input and admits published boundary',()=>{
 const source=read('references/content-routes.md').match(/```js\n(\/\/ publication-predicate[\s\S]*?)```/);
 assert.ok(source,'one labeled example required');
 // Supply the same Date constructor as the fixtures. No Astro import or application execution.
 const context=vm.createContext({Date,Number});
 new vm.Script(source[1]+'\nthis.check = isPublished;').runInContext(context,{timeout:1000});
 const cutoff=Date.parse('2026-01-01T00:00:00Z');
 const entry=(draft,at)=>({draft,publishAt:new Date(at)});
 assert.equal(context.check(entry(false,cutoff),cutoff),true);
 assert.equal(context.check(entry(false,cutoff-1),cutoff),true);
 assert.equal(context.check(entry(true,cutoff-1),cutoff),false);
 assert.equal(context.check(entry(undefined,cutoff-1),cutoff),false);
 assert.equal(context.check(entry(false,cutoff+1),cutoff),false);
 assert.equal(context.check(entry(false,NaN),cutoff),false);
 assert.equal(context.check({draft:false,publishAt:'2025-01-01'},cutoff),false);
 assert.equal(context.check(entry(false,cutoff),NaN),false);
 assert.equal(context.check(entry(false,cutoff),Infinity),false);
});
test('exact install inventory, local links and original/source hashes',()=>{
 assert.deepEqual(fs.readdirSync(dir).sort(),['LICENSE','SKILL.md','UPSTREAM.md','provenance.json','references']);
 assert.deepEqual(fs.readdirSync(path.join(dir,'references')).sort(),['content-routes.md','page-delivery.md','project-setup.md']);
 const p=JSON.parse(read('provenance.json'));
 assert.equal(p.inspiration.commit,'8b2343c6b515b80ea44f9c69a16dd38d54e6e9ae');
 assert.equal(p.authorship,'Original Prime guidance and examples; no copied upstream Astro Builder or Taste text');
 assert.equal(p.files.length,6);
 for(const f of p.files)assert.equal(hash(read(f.path)),f.sha256,f.path);
 for(const s of p.reviewed_sources){assert.match(s.sha256,/^[a-f0-9]{64}$/);assert.ok(s.url.includes(p.inspiration.commit));}
 for(const rel of Object.keys(required).concat('UPSTREAM.md')){
  const text=read(rel).replace(/```[\s\S]*?```/g,'');
  for(const m of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
   if(/^(https?:|#)/.test(m[1]))continue;
   const target=path.resolve(dir,path.dirname(rel),m[1].split('#')[0]);
   assert.ok(target.startsWith(dir+path.sep));assert.ok(fs.statSync(target).isFile(),m[1]);
  }
 }
});
test('fresh native skill discovery exposes only scoped metadata',async()=>{
 const runtime=process.env.PRIME_NATIVE_ROOT;
 assert.ok(runtime,'Set PRIME_NATIVE_ROOT to the reviewed installed native package');
 const {loadSkillsFromDir,loadSkills,formatSkillsForPrompt}=await import(pathToFileURL(path.join(runtime,'dist/core/skills.js')));
 const loaded=loadSkillsFromDir({dir:root,source:'user'});
 assert.equal(loaded.diagnostics.length,0,JSON.stringify(loaded.diagnostics));
 const matches=loaded.skills.filter(s=>s.name==='astro-website-builder');
 assert.equal(matches.length,1);
 const prompt=formatSkillsForPrompt(matches);
 assert.ok(prompt.includes('explicitly selected Astro content-first website'));
 assert.ok(prompt.includes('Not a default framework for every website'));
 assert.ok(!prompt.includes('Establish the deliverable once'));
 assert.ok(!prompt.includes('publication-predicate'));
 const native=loadSkills({cwd:process.cwd(),agentDir:path.dirname(root),includeDefaults:true,skillPaths:[]});
 const found=native.skills.filter(s=>s.name==='astro-website-builder');
 assert.equal(found.length,1);assert.equal(found[0].filePath,path.join(dir,'SKILL.md'));
 assert.equal(found[0].disableModelInvocation,false);
});
console.log('Document/native-availability checks and pure predicate example only; no Astro build, model effectiveness, deployed publication, browser or app-runtime proof.');
