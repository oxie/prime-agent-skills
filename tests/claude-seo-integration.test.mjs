// Documentation contracts only; no SEO, model, crawl or browser outcome claims.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const flat=t=>t.replace(/\s+/g,' ').toLowerCase();
const clauses={
  "marketingskills/skills/seo-audit/SKILL.md": [
    "Consider `x-default`",
    "same-language regional duplicates",
    "default locale may use the root URL",
    "noindex can be appropriate",
    "No fixed character limit",
    "Current responsive/browser checks"
  ],
  "marketingskills/skills/seo-audit/references/international-seo.md": [
    "not a whole-cluster failure guarantee",
    "not required on every multilingual site",
    "same-language regional duplicates",
    "default language can live at `/`",
    "noindex can be appropriate"
  ],
  "marketingskills/skills/seo-audit/references/performance-diagnosis.md": [
    "Missing field data is unknown",
    "URL versus origin",
    "separate p75 values do not sum",
    "fetchpriority is a relative-priority hint",
    "Preserve cache and privacy requirements",
    "not proof of a field CWV pass"
  ],
  "marketingskills/skills/seo-audit/references/release-render-checks.md": [
    "requested and final URL",
    "initial response versus rendered DOM",
    "intentional change is not automatically a regression",
    "Do not normalize away",
    "nearby citation marker does not establish support",
    "no fixed character limit",
    "No crawler, persistent snapshot database"
  ],
  "marketingskills/skills/seo-audit/references/xml-sitemaps.md": [
    "50,000",
    "50 MB",
    "uncompressed",
    "1,000 news entries",
    "last two days",
    "not a new publication date",
    "priority",
    "changefreq",
    "unverified, not failed",
    "No crawling or submission is authorized"
  ],
  "marketingskills/skills/schema/references/site-type-eligibility.md": [
    "ProductGroup",
    "ProfilePage",
    "DiscussionForumPosting",
    "QAPage"
  ]
};
function check(t,cs){for(const c of cs)assert(flat(t).includes(flat(c)),c);}
for(const [p,cs] of Object.entries(clauses))test('scoped guidance and deletion controls: '+p,()=>{
 const t=read(p);check(t,cs);for(const c of cs)assert.throws(()=>check(flat(t).split(flat(c)).join('REMOVED'),cs));
});

import os from 'node:os';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {beforeClaudeSeoFile,claudeSeoTransitions} from './helpers/claude-seo-snapshot.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const schema='marketingskills/skills/schema';
test('schema correction clauses cannot disappear silently',()=>{
 const required=['No required properties','Product snippets','merchant listings','May 7, 2026','September 13, 2023','November 21, 2024','recommended properties','does not guarantee','QAPage is not a workaround','Do not fabricate'];
 const t=read(schema+'/SKILL.md');check(t,required);
 for(const c of required)assert.throws(()=>check(flat(t).split(flat(c)).join('REMOVED'),required));
 assert(!t.includes('Required: headline, image, datePublished, author'));
 assert(!t.includes('Required: name, image, offers (price + availability)'));
});
function examples(p){return [...read(p).matchAll(/```json\n([\s\S]*?)\n```/g)].map(m=>JSON.parse(m[1]));}
function checkExamples(xs){
 assert.equal(xs.length,4);
 const [group,profile,forum,qa]=xs;
 assert.equal(group['@type'],'ProductGroup');assert.equal(group.hasVariant.length,2);
 assert.deepEqual(group.variesBy,['https://schema.org/color']);assert(group.productGroupID);
 assert.equal(new Set(group.hasVariant.map(v=>v.sku)).size,2);
 for(const v of group.hasVariant){assert.equal(v['@type'],'Product');assert.equal(v.url,v.offers.url);assert(v.image);assert(v.color);assert.equal(new URL(v.url).searchParams.get('color'),v.color.toLowerCase());assert(v.offers.priceCurrency);assert(Number(v.offers.price)>0);}
 assert.equal(profile['@type'],'ProfilePage');assert.equal(profile.mainEntity['@type'],'Person');assert(profile.mainEntity.name);
 assert.equal(forum['@type'],'DiscussionForumPosting');assert(forum.author.name);assert(forum.datePublished);assert(forum.text);assert.equal(forum.comment.length,1);assert(forum.comment[0].url.includes('#'));
 assert.equal(qa['@type'],'QAPage');assert.equal(qa.mainEntity['@type'],'Question');assert.equal(qa.mainEntity.answerCount,1);assert(qa.mainEntity.suggestedAnswer.text);assert(!qa.mainEntity.acceptedAnswer);
}
test('all JSON examples parse; site-type examples preserve their stated relationships',()=>{
 const counts=[schema+'/SKILL.md',schema+'/references/schema-examples.md',schema+'/references/site-type-eligibility.md'].map(p=>examples(p).length);
 assert.deepEqual(counts,[1,11,4]);const xs=examples(schema+'/references/site-type-eligibility.md');checkExamples(xs);
 for(const mutate of [x=>x[0].hasVariant[1].sku=x[0].hasVariant[0].sku,x=>x[0].hasVariant[0].offers.url='https://example.com/wrong',x=>x[1].mainEntity.name='',x=>x[2].comment[0].url='https://example.com/no-anchor',x=>x[3].mainEntity.answerCount=2]){const bad=structuredClone(xs);mutate(bad);assert.throws(()=>checkExamples(bad));}
});
test('historical bytes are recovered only for exact approved transitions',()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'claude-seo-history-'));
 try{for(const [p,r] of Object.entries(claudeSeoTransitions)){
  const b=fs.readFileSync(path.join(root,p));assert.equal(sha(b),r.current,p);assert.equal(sha(beforeClaudeSeoFile(root,p)),r.previous,p);
  fs.mkdirSync(path.dirname(path.join(tmp,p)),{recursive:true});fs.writeFileSync(path.join(tmp,p),b);assert.equal(sha(beforeClaudeSeoFile(tmp,p)),r.previous);
  if(p.endsWith('SKILL.md')){const prev=beforeClaudeSeoFile(tmp,p).toString();assert.equal(read(p).split('---',3).slice(0,2).join('---'),prev.split('---',3).slice(0,2).join('---'));assert.equal(read(p).split('\n').find(l=>l.startsWith('> **Prime safety:')),prev.split('\n').find(l=>l.startsWith('> **Prime safety:')));}
  for(const at of [0,Math.floor(b.length/2),b.length-1]){const bad=Buffer.from(b);bad[at]^=1;fs.writeFileSync(path.join(tmp,p),bad);assert.deepEqual(beforeClaudeSeoFile(tmp,p),bad);assert.notEqual(sha(bad),r.previous);}
 }}finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
test('selected provenance, links, permissions and current owner hashes are bound',()=>{
 const prov=JSON.parse(read('marketingskills/claude-seo-provenance.json'));
 assert.equal(prov.commit,'92795530b4cc92c6bf7a2435b82c15b003e71181');assert.equal(prov.sources.length,9);
 for(const r of prov.sources){assert.match(r.sha256,/^[a-f0-9]{64}$/);assert.match(r.git_blob,/^[a-f0-9]{40}$/);assert(r.bytes>0);}
 const notes=read('marketingskills/'+prov.license);assert(notes.includes('Copyright (c) 2026 agricidaniel'));assert(notes.includes('THE SOFTWARE IS PROVIDED "AS IS"'));
 for(const [rel,r] of Object.entries(prov.adapted_files)){
  const p='marketingskills/'+rel,b=fs.readFileSync(path.join(root,p));assert.equal(b.length,r.bytes,p);assert.equal(sha(b),r.sha256,p);assert.equal(fs.statSync(path.join(root,p)).mode&0o111,0);
  for(const [,href] of b.toString().replace(/```[\s\S]*?```/g,'').matchAll(/\]\(([^)]+)\)/g)){
   if(/^(https?:|#|mailto:)/.test(href))continue;const target=path.resolve(root,path.dirname(p),href.split('#')[0]);assert(target.startsWith(root+path.sep));assert(fs.statSync(target).isFile(),href);
  }
 }
 const manifest=JSON.parse(read('marketingskills/MANIFEST.json'));assert.equal(manifest.source.commit,'5b2c0007766c6a1cf1d53fd8fc73e979e0821022');
 for(const name of ['schema','seo-audit']){
  const dir=path.join(root,'marketingskills/skills',name),files=[];function walk(p){for(const e of fs.readdirSync(p,{withFileTypes:true})){const f=path.join(p,e.name);if(e.isDirectory())walk(f);else files.push(f);}}walk(dir);
  const h=createHash('sha256');for(const p of files.sort()){h.update(path.relative(dir,p));h.update(Buffer.from([0]));h.update(fs.readFileSync(p));h.update(Buffer.from([0]));}
  assert.equal(h.digest('hex'),manifest.skills.find(s=>s.name===name).sha256);
 }
});
test('native metadata retains 67 owners and keeps added references out of discovery prompt',async()=>{
 const runtime=process.env.PRIME_NATIVE_ROOT;assert(runtime);
 const {loadSkillsFromDir,formatSkillsForPrompt}=await import(pathToFileURL(path.join(runtime,'dist/core/skills.js')));
 const loaded=loadSkillsFromDir({dir:root,source:'user'});assert.deepEqual(loaded.diagnostics,[]);assert.equal(loaded.skills.length,67);
 for(const name of ['seo-audit','schema']){const s=loaded.skills.filter(s=>s.name===name);assert.equal(s.length,1);assert.equal(s[0].filePath,path.join(root,'marketingskills/skills',name,'SKILL.md'));}
 const prompt=formatSkillsForPrompt(loaded.skills);for(const p of Object.keys(clauses).filter(p=>p.includes('/references/')))assert(!prompt.includes(read(p).split('\n')[0]));
});
