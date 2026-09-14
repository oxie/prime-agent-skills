// Static content/history/loading contracts, not model or payment behavior tests.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {beforeStorefrontSkill,storefrontRoutes} from './helpers/storefront-snapshot.mjs';
import {beforeTasteSkill} from './helpers/taste-snapshot.mjs';
import {beforeSuperEngineering} from './helpers/super-skills-snapshot.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const sha=b=>createHash('sha256').update(b).digest('hex');
const flat=s=>s.replace(/\s+/g,' ');
const clauses={
 'hallmark/references/storefront.md':[
  'a review remains read-only',
  'Variant count alone does not establish intent',
  'Never silently substitute another variant',
  'reset an invalid page/cursor',
  'A late response for an old query must not replace the current result set',
  'A sent request or a resolved fetch is not proof an item was added',
  'Do not promise free shipping solely because a local subtotal passed a threshold',
  'order status, payment status and notification status separately',
  'A purely visual edit does not trigger that review',
  'they can be statically generated',
 ],
 'engineering-references/references/commerce.md':[
  'A review is read-only unless edits are authorized',
  'Do not print environment values',
  'Determine amount units, tax inclusion, rounding and currency at the API boundary',
  'Native fetch resolves on HTTP errors',
  'Include the real pricing dimensions in query keys',
  'Merely entering or revisiting a confirmation URL must not clear the current cart',
  'only if its identity still matches the completed cart',
  'A new random retry key is not reconciliation',
  'documented server-backed duplicate-safe operation',
  'order state, payment state and notification state distinct',
  'opaque identifier alone is not a general authorization design',
  'protected state unchanged',
  'never real purchases or live payment calls solely for this checklist',
 ]
};
function check(text,required){for(const c of required)assert(flat(text).includes(c),'Missing contract: '+c);}
test('original commerce contracts retain scope and failure distinctions',()=>{
 for(const [p,c] of Object.entries(clauses))check(read(p),c);
});
test('removing each declared clause fails its positive-control checker',()=>{
 for(const [p,c] of Object.entries(clauses)){
  const text=flat(read(p));check(text,c);
  for(const phrase of c)assert.throws(()=>check(text.split(phrase).join('REMOVED'),c),/Missing contract/);
 }
});
test('new routes have exact appended bytes; historical records are unchanged',()=>{
 for(const [owner,r] of Object.entries(storefrontRoutes)){
  const b=fs.readFileSync(path.join(root,owner,'SKILL.md'));
  assert.equal(b.length,r.current.bytes);assert.equal(sha(b),r.current.sha256);
  assert.equal(sha(beforeStorefrontSkill(root,owner)),r.previous.sha256);
 }
 assert.equal(sha(beforeTasteSkill(root,'hallmark')),'d63b9421aeed3022b99ddabe9aeacb2b594736f9095909193e60ca876b53125b');
 assert.equal(sha(beforeSuperEngineering(root)),'2a30a68ebb43812832b6fd425df706e52678a704a6e45f19f4da58dc293bba51');
});
test('history adapter rejects changed prefixes suffixes and unrecorded additions',t=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'storefront-history-'));t.after(()=>fs.rmSync(temp,{recursive:true,force:true}));
 for(const [owner,r] of Object.entries(storefrontRoutes)){
  fs.mkdirSync(path.join(temp,owner));const target=path.join(temp,owner,'SKILL.md'),b=fs.readFileSync(path.join(root,owner,'SKILL.md'));
  fs.writeFileSync(target,b);assert.equal(sha(beforeStorefrontSkill(temp,owner)),r.previous.sha256);
  for(const at of [0,b.length-1]){const bad=Buffer.from(b);bad[at]^=1;fs.writeFileSync(target,bad);assert.throws(()=>beforeStorefrontSkill(temp,owner));}
  fs.writeFileSync(target,Buffer.concat([b,Buffer.from('extra')]));assert.throws(()=>beforeStorefrontSkill(temp,owner));
 }
});
test('on-demand links resolve and new prose adds no executable payload or assumed license',()=>{
 for(const p of Object.keys(clauses)){
  const text=read(p),stat=fs.lstatSync(path.join(root,p));assert(stat.isFile());assert.equal(stat.mode&0o111,0);
  assert(Buffer.byteLength(text)<=8*1024);assert(!text.includes('```'));
  assert(flat(text).includes('no clear redistribution license was found'));
  assert(text.includes('a46f3b13c6048b769337aee9cc8d6a61e8f660e1'));
  for(const m of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
   if(/^https?:/.test(m[1]))continue;
   const target=path.resolve(path.dirname(path.join(root,p)),m[1].split('#')[0]);
   assert(target.startsWith(root+path.sep));assert(fs.statSync(target).isFile());
  }
 }
 for(const [owner,ref] of [['hallmark','storefront.md'],['engineering-references','commerce.md']]){
  assert.equal(read(owner+'/SKILL.md').split('](references/'+ref+')').length-1,1);
  assert(fs.statSync(path.join(root,owner,'references',ref)).isFile());
 }
});
test('fresh native loader exposes existing owners, not a mandatory storefront skill',async()=>{
 const runtime=path.join(os.homedir(),'.local/lib/node_modules/prime-agent/dist/core/skills.js');
 const {loadSkillsFromDir,formatSkillsForPrompt}=await import(pathToFileURL(runtime));
 const result=loadSkillsFromDir({dir:root,source:'user'});assert.deepEqual(result.diagnostics,[]);
 const owners=result.skills.filter(s=>Object.hasOwn(storefrontRoutes,s.name));assert.equal(owners.length,2);
 for(const s of owners){assert.equal(s.filePath,path.join(root,s.name,'SKILL.md'));assert(s.description.length<=1024);}
 const prompt=formatSkillsForPrompt(owners);assert(!prompt.includes('# Commerce transaction boundaries'));assert(!prompt.includes('## Storefront UI'));
 assert(!result.skills.some(s=>s.name==='storefront-best-practices'));
});
