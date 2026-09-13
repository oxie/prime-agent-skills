import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
const installed=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const root=process.env.MI_SKILLS_ROOT||installed;
const fallback=process.env.MI_BASE_ROOT||installed;
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const hash=b=>createHash('sha256').update(b).digest('hex');
const clauses={
 'engineering-references/references/debugging.md':['the tied item IDs in','missing imports','higher reproduction rate','as unverified against the original symptom','original\nunminimized scenario'],
 'engineering-references/references/test-design.md':['a formula is not inherently circular','**No write:**','not equivalent durability evidence','Do not wholesale delete old unit tests','sumOneTo(n)'],
 'engineering-references/references/interface-design.md':['same requirements','Preparation preserves ordered, immutable validated rows','rechecks constraints','A second adapter is not required','old tests until'],
 'engineering-references/references/domain-modeling.md':['Code shows current behavior','if documentation edits are','does not: rename','proposed','reading a draft or running a test is not approval'],
 'unlazy/references/work-slicing.md':['closed or rejected tracker item is not a satisfied prerequisite','no cycles','E -> M1, E -> M2, M1 + M2 -> K','every required migration batch','do not promise\nindependent releasability'],
 'code-review/SKILL.md':['includes relevant dirty work','relevant callers','against this scope','snapshot changed','ranked by consequence across both lenses'],
 'tutor/SKILL.md':['Default to a one-off chat lesson','Never invent an attempt','revealed\n   answer alone','does\n   not prove long-term retention','single exported lesson does not authorize a course tree'],
 'questionnaire/SKILL.md':['Do not repeat questions already answered','catch-all does\n  not count as coverage','only if supplied or confirmed','Sending requires separate authorization','not a sent message']
};
const normalize=s=>s.replace(/\s+/g,' ');
function missing(s,list){s=normalize(s);return list.filter(p=>!s.includes(normalize(p)));}
test('all eight capabilities preserve specific positive content contracts',()=>{
 for(const [p,list] of Object.entries(clauses))assert.deepEqual(missing(read(p),list),[],p);
});
test('removing each required clause is detected (text controls, not model behavior)',()=>{
 let count=0;
 for(const [p,list] of Object.entries(clauses)){
  const original=normalize(read(p));assert.deepEqual(missing(original,list),[],p);
  for(const clause of list){const needle=normalize(clause);const mutated=original.split(needle).join('REMOVED');assert.ok(missing(mutated,list).includes(clause),p+': '+clause);count++;}
 }
 assert.equal(count,40);
});
test('selected source notices, identities, current bytes and versioned routes',()=>{
 for(const owner of ['engineering-references','unlazy','code-review','tutor','questionnaire']){
  const prov=JSON.parse(read(owner+'/mattpocock-provenance.json'));
  assert.equal(prov.commit,'3cca18b368ae95cdbdebbff572ccafa662551015');
  const license=read(owner+'/'+prov.license);assert.ok(license.includes('2026 Matt Pocock'));assert.ok(license.includes('THE SOFTWARE IS PROVIDED "AS IS"'));
  assert.equal(hash(license),prov.license_sha256);
  for(const f of prov.files)assert.equal(hash(read(owner+'/'+f.path)),f.sha256,owner+'/'+f.path);
  for(const s of prov.sources){assert.match(s.git_blob_sha,/^[a-f0-9]{40}$/);assert.match(s.sha256,/^[a-f0-9]{64}$/);assert.ok(s.url.includes(prov.commit));}
 }
 for(const p of ['debugging.md','test-design.md','interface-design.md','domain-modeling.md'])assert.equal(read('engineering-references/SKILL.md').split('(references/'+p+')').length-1,1);
 assert.equal(read('unlazy/SKILL.md').split('(references/work-slicing.md)').length-1,1);
 assert.equal(JSON.parse(read('unlazy/package.json')).version,'2.1.0-prime.2');
});
test('all changed Markdown local links resolve without leaving skills roots',()=>{
 for(const owner of ['engineering-references','unlazy','code-review','tutor','questionnaire']){
  const p=JSON.parse(read(owner+'/mattpocock-provenance.json'));
  for(const f of p.files.filter(f=>f.path.endsWith('.md'))){
   const source=read(owner+'/'+f.path);
   for(const [,href] of source.matchAll(/\]\(([^)]+)\)/g)){
    if(/^(https?:|#)/.test(href))continue;
    const relative=path.join(owner,path.dirname(f.path),href.split('#')[0]);
    const live=path.resolve(root,relative),old=path.resolve(fallback,relative);
    assert.ok(live.startsWith(path.resolve(root)+path.sep));
    assert.ok(fs.existsSync(live)||fs.existsSync(old),owner+'/'+f.path+' -> '+href);
   }
  }
 }
});
test('native discovery exposes task triggers, not reference bodies or forced invocation',async()=>{
 assert.ok(process.env.PRIME_NATIVE_ROOT);
 const {loadSkillsFromDir,formatSkillsForPrompt}=await import(pathToFileURL(path.join(process.env.PRIME_NATIVE_ROOT,'dist/core/skills.js')));
 const result=loadSkillsFromDir({dir:root,source:'project'});
 for(const name of ['engineering-references','unlazy','code-review','tutor','questionnaire']){
  const skills=result.skills.filter(s=>s.name===name);assert.equal(skills.length,1,name);
  assert.equal(skills[0].disableModelInvocation,false);assert.ok(skills[0].description.length<=1024);
  const formatted=formatSkillsForPrompt(skills);assert.ok(formatted.includes('<name>'+name+'</name>'));assert.ok(!formatted.includes('Record A — active'));
 }
 assert.ok(!formatSkillsForPrompt(result.skills.filter(s=>s.name==='code-review')).includes('git diff HEAD'));
});
function fixture(){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'pocock-scope-'));
 const env=Object.fromEntries(Object.entries(process.env).filter(([k])=>!k.startsWith('GIT_')));
 Object.assign(env,{GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:os.devNull,GIT_TERMINAL_PROMPT:'0'});
 const git=(...args)=>execFileSync('git',['-C',dir,...args],{env,encoding:'utf8',stdio:['ignore','pipe','pipe']});
 git('init','-q');git('config','user.name','Scope Test');git('config','user.email','scope@example.invalid');git('config','commit.gpgsign','false');
 const hooks=path.join(dir,'.git','empty-hooks');fs.mkdirSync(hooks);git('config','core.hooksPath',hooks);
 const write=(p,s)=>fs.writeFileSync(path.join(dir,p),s);
 const diff=(...args)=>git('diff','--no-ext-diff','--no-textconv',...args);
 return {dir,git,write,diff,cleanup:()=>fs.rmSync(dir,{recursive:true,force:true})};
}
test('real Git: HEAD-only review misses dirty work; staged and worktree versions differ',()=>{
 const f=fixture();try{
  f.write('tracked.txt','base\n');f.git('add','--','tracked.txt');f.git('commit','-qm','base');
  const base=f.git('rev-parse','HEAD').trim();
  f.write('tracked.txt','STAGED_SENTINEL\n');f.git('add','--','tracked.txt');f.write('tracked.txt','WORKTREE_SENTINEL\n');
  assert.equal(f.diff(base+'...HEAD','--'),'');
  assert.match(f.diff('--cached','HEAD','--'),/\+STAGED_SENTINEL/);assert.doesNotMatch(f.diff('--cached','HEAD','--'),/WORKTREE_SENTINEL/);
  assert.equal(f.git('show',':tracked.txt'),'STAGED_SENTINEL\n');
  assert.match(f.diff('--'),/-STAGED_SENTINEL/);assert.match(f.diff('--'),/\+WORKTREE_SENTINEL/);
  assert.match(f.diff('HEAD','--'),/\+WORKTREE_SENTINEL/);
  const snapshot=hash(fs.readFileSync(path.join(f.dir,'tracked.txt')));f.write('tracked.txt','CHANGED_LATER\n');assert.notEqual(hash(fs.readFileSync(path.join(f.dir,'tracked.txt'))),snapshot);
  f.write('tracked.txt','base\n');assert.equal(f.diff('HEAD','--'),'');assert.match(f.diff('--cached','HEAD','--'),/STAGED_SENTINEL/);
 }finally{f.cleanup();}
});
test('real Git: untracked names need NUL-safe enumeration; ignored/private content is not included',()=>{
 const f=fixture();try{
  f.write('.gitignore','.env\n');f.git('add','--','.gitignore');f.git('commit','-qm','base');
  const strange='new\nname with space.txt';f.write(strange,'NEW_FILE_SENTINEL\n');f.write('.env','NOT_A_REAL_SECRET\n');
  assert.equal(f.diff('HEAD','--'),'');
  assert.deepEqual(f.git('ls-files','--others','--exclude-standard','-z').split('\0').filter(Boolean),[strange]);
  assert.equal(fs.readFileSync(path.join(f.dir,strange),'utf8'),'NEW_FILE_SENTINEL\n');
 }finally{f.cleanup();}
});
test('real Git: literal fixed point and merge-base comparisons differ on diverged branches',()=>{
 const f=fixture();try{
  f.write('base.txt','base\n');f.git('add','--','base.txt');f.git('commit','-qm','base');const common=f.git('rev-parse','HEAD').trim();
  f.git('checkout','-qb','target');f.write('target-only.txt','TARGET_SENTINEL\n');f.git('add','--','target-only.txt');f.git('commit','-qm','target');const target=f.git('rev-parse','HEAD').trim();
  f.git('checkout','-qb','feature',common);f.write('feature.txt','FEATURE_SENTINEL\n');f.git('add','--','feature.txt');f.git('commit','-qm','feature');const head=f.git('rev-parse','HEAD').trim();
  assert.equal(f.git('rev-parse','--verify','--end-of-options',target+'^{commit}').trim(),target);
  assert.match(f.diff(target,head,'--'),/TARGET_SENTINEL/);assert.doesNotMatch(f.diff(target+'...'+head,'--'),/TARGET_SENTINEL/);
  assert.equal(f.git('merge-base',target,head).trim(),common);assert.match(f.diff(common,head,'--'),/FEATURE_SENTINEL/);
 }finally{f.cleanup();}
});
test('real Git: initial index review does not require inventing HEAD',()=>{
 const f=fixture();try{
  f.write('first.txt','INITIAL_SENTINEL\n');f.git('add','--','first.txt');assert.match(f.diff('--cached','--'),/INITIAL_SENTINEL/);
  assert.throws(()=>f.git('rev-parse','--verify','HEAD'));
 }finally{f.cleanup();}
});
test('worked oracle and lesson examples distinguish deliberate wrong outcomes',()=>{
 const sum=n=>{let result=0;for(let i=1;i<=n;i++)result+=i;return result;};
 const omitLast=n=>{let result=0;for(let i=1;i<n;i++)result+=i;return result;};
 for(const n of [0,1,4,20])assert.equal(sum(n),n*(n+1)/2);
 assert.equal(sum(4),10);assert.notEqual(omitLast(4),10);
 assert.equal(omitLast(4),omitLast(4)); // A circular oracle accepts the known defect.
 const mayServe=(now,expiry)=>now<expiry;
 assert.equal(mayServe(12,12),false);assert.equal(mayServe(20,21),true);assert.equal(mayServe(22,21),false);
 assert.notEqual(12<=12,mayServe(12,12));
});
test('questionnaire worked draft directly covers the required missing reserve input',()=>{
 const doc=read('questionnaire/references/draft-guide.md');
 const required=[['Q1','peak request rate'],['Q2','evidence supports'],['Q3','capacity reserve rule']];
 const covers=s=>required.every(([id,topic])=>s.split('\n').some(line=>line.startsWith('### '+id+'. ')&&line.includes(topic)));
 assert.equal(covers(doc),true);
 assert.equal(covers(doc.replace(/### Q3\.[\s\S]*?(?=### Q4\.)/,'')),false);
 assert.ok(doc.includes('No deadline or effort estimate has been supplied'));
});
console.log('Content/mutation guards, worked examples, real disposable Git scope fixtures and native metadata only; not model-review or learning-effectiveness evidence.');

test('Git configuration trust is checked before any state command; flags are not a sandbox',()=>{
 const skill=read('code-review/SKILL.md'),scope=read('code-review/references/scope.md');
 const required=['trusted Git executable/environment and repository configuration','core.fsmonitor','not general configuration sanitization','or stop and report the limit'];
 assert.deepEqual(missing(scope,required),[]);
 for(const [text,left,right] of [[skill,'Before any Git command','Then inspect current Git state'],[scope,'## Trust boundary','## Resolve and record']]){
  const precedes=s=>{const a=s.indexOf(left),b=s.indexOf(right);return a>=0&&b>=0&&a<b;};
  assert.equal(precedes(text),true);
  assert.equal(precedes(text.replace(left,'REMOVED')),false);
  assert.equal(precedes(text.replace(right,'REMOVED')),false);
  assert.equal(precedes(right+' then '+left),false);
 }
 for(const clause of required){const mutant=normalize(scope).split(normalize(clause)).join('REMOVED');assert.ok(missing(mutant,required).includes(clause));}
});
