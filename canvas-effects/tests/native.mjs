import assert from 'node:assert/strict';
import {readFileSync,readdirSync,lstatSync,existsSync,mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {resolve,dirname,relative,sep,join} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=resolve(process.argv[2] ?? join(dirname(fileURLToPath(import.meta.url)),'..'));
const native=resolve(process.argv[3] ?? join(process.env.HOME,'.local/lib/node_modules/prime-agent/dist'));
const {loadSkills,formatSkillsForPrompt}=await import(pathToFileURL(join(native,'index.js')).href);
const checks=[];
function check(name,fn){fn();checks.push(name);}
function inspectPackage(base){
 const paths=[];
 function walk(dir){for(const entry of readdirSync(dir,{withFileTypes:true})){
  const p=join(dir,entry.name);assert(!lstatSync(p).isSymbolicLink(),'No package symlinks');
  if(entry.isDirectory())walk(p);else paths.push(p);
 }}walk(base);
 assert(paths.some(p=>relative(base,p)==='SKILL.md'),'Skill body exists');
 for(const p of paths){
  const rel=relative(base,p);
  assert(!/(^|\/)(?:AGENTS\.md|CLAUDE\.md|CODEX\.md|GEMINI\.md|skill\.json|registry\.json|components\.json|package\.json|node_modules|\.cursor|\.windsurf|agents)(\/|$)/.test(rel),'No competing adapters, scraped database or package installation');
  if(!p.endsWith('.md'))continue;
  const text=readFileSync(p,'utf8');
  for(const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
   const href=match[1].split('#')[0];if(!href||/^[a-z][a-z0-9+.-]*:/i.test(href))continue;
   const target=resolve(dirname(p),href),within=relative(base,target);
   assert(within&&!within.startsWith('..'+sep)&&within!=='..'&&!within.startsWith(sep),`Local reference escapes package: ${rel}:${href}`);
   assert(existsSync(target),`Missing local reference: ${rel}:${href}`);
  }
 }
 return paths;
}
const files=inspectPackage(root);
function skillBodySentinelPresent(){return readFileSync(join(root,'SKILL.md'),'utf8').includes('Build effects that support the website');}
const load=(skillRoot)=>loadSkills({cwd:root,agentDir:join(root,'nonexistent-agent'),includeDefaults:false,skillPaths:[skillRoot]});
const loaded=load(root);
check('one native eligible Markdown skill, canonical directory, no diagnostics',()=>{
 assert.equal(loaded.skills.length,1);assert.deepEqual(loaded.diagnostics,[]);
 const s=loaded.skills[0];assert.equal(s.name,'canvas-effects');assert.equal(s.kind,'markdown');assert.equal(s.disableModelInvocation,false);assert.equal(s.filePath,join(root,'SKILL.md'));
 assert(s.description.length>0&&s.description.length<=1024);assert(!s.python);
});
check('native prompt advertises metadata rather than references or fixture',()=>{
 const formatted=formatSkillsForPrompt(loaded.skills);
 assert(formatted.includes('<name>canvas-effects</name>'));assert(formatted.includes(join(root,'SKILL.md')));
 assert(skillBodySentinelPresent());assert(!formatted.includes('Build effects that support the website'));assert(!formatted.includes('const checks='));
});
const skill=readFileSync(join(root,'SKILL.md'),'utf8');
check('routing is canvas-specific, not a universal frontend/backend workflow',()=>{
 const d=loaded.skills[0].description;
 assert(/canvas/i.test(d));assert(/WebGL|particles|ripples/i.test(d));assert(/not|exclude/i.test(d));assert(/backend|nonvisual|generic|ordinary/i.test(d));
 assert(/Hallmark/.test(skill));assert(/Variate/.test(skill));
});
check('provenance names reference pin and separates original package license',()=>{
 const provenance=readFileSync(join(root,'PROVENANCE.md'),'utf8'),license=readFileSync(join(root,'LICENSE'),'utf8');
 assert(provenance.includes('https://github.com/DavidHDev/canvas-ui'));
 assert(provenance.includes('34b1e46cd8dc56b8a1e7746561104008bdabee5c'));
 assert(provenance.includes('No Canvas UI component implementation'));assert(provenance.includes('restricts redistribution'));
 assert(license.includes('Permission is hereby granted'));assert(license.includes('THE SOFTWARE IS PROVIDED'));
});
check('practical local fixture and browser verification instructions exist',()=>{
 for(const rel of ['assets/demo/index.html','tests/browser.py','tests/BROWSER.md'])assert(existsSync(join(root,rel)),rel);
 const html=readFileSync(join(root,'assets/demo/index.html'),'utf8');
 assert(/<main\b/i.test(html));assert(/<h1\b/i.test(html));assert(/<title>/i.test(html));
 assert(!/<(?:script|link|img|iframe|video|audio)\b[^>]*(?:src|href)\s*=\s*['"]https?:/i.test(html),'No external fixture dependencies');
});
const scratch=mkdtempSync(join(tmpdir(),'canvas-native-contract-'));
try{
 check('negative control: missing native description does not load',()=>{
  const bad=join(scratch,'missing-description');mkdirSync(bad);writeFileSync(join(bad,'SKILL.md'),'---\nname: missing-description\n---\n# Body\n');
  assert.equal(load(bad).skills.length,0);
 });
 check('positive control: disabled metadata follows native eligibility',()=>{
  const disabled=join(scratch,'disabled-canvas');mkdirSync(disabled);writeFileSync(join(disabled,'SKILL.md'),'---\nname: disabled-canvas\ndescription: Explicit canvas fixture\ndisable-model-invocation: true\n---\n# Body\n');
  const result=load(disabled);assert.equal(result.skills.length,1);assert.equal(result.skills[0].disableModelInvocation,true);assert.equal(formatSkillsForPrompt(result.skills),'');
 });
 check('negative controls: broken link and forbidden component registry fail audit',()=>{
  const fixture=join(scratch,'package');mkdirSync(fixture);writeFileSync(join(fixture,'SKILL.md'),'# Test\n[broken](absent.md)');
  assert.throws(()=>inspectPackage(fixture),/Missing local reference/);
  writeFileSync(join(fixture,'SKILL.md'),'# Test\n');assert.equal(inspectPackage(fixture).length,1);
  writeFileSync(join(fixture,'registry.json'),'{}');assert.throws(()=>inspectPackage(fixture),/No competing adapters/);
 });
}finally{rmSync(scratch,{recursive:true,force:true});}
console.log(JSON.stringify({status:'CANVAS_EFFECTS_NATIVE_CONTRACT_OK',checks,files:files.length,bodyBytes:Buffer.byteLength(skill),limits:'Native loading and static contracts only, not a model routing/quality benchmark or browser result.'},null,2));
