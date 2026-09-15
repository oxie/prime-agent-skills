import {beforeClaudeSeoFile} from './helpers/claude-seo-snapshot.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const owner='marketingskills/skills/seo-audit';
const tool='marketingskills/tools/integrations/google-search-console.md';
const read=p=>beforeClaudeSeoFile(root,p);
const sha=b=>createHash('sha256').update(b).digest('hex');
const route={"previous": {"bytes": 16958, "sha256": "8ffbf008051949d5203ef9ca220b22593fc986f55fbd847f2b12842e46f2c97e"}, "current": {"bytes": 17347, "sha256": "356fb5f7b2a069c609dbf576e2d82f255bee01de68c72f96b7eb141f2539d868"}, "change": "one description sentence plus optional append; previous body intact"};
const preserved={"marketingskills/skills/seo-audit/evals/evals.json": "b808dfa7ee1e312cda39cfac57f44674bd3cee6eaa151af7008760a9514bb6cf", "marketingskills/skills/seo-audit/references/ai-writing-detection.md": "f1e273f56ce7e2215ff218bf903680ddcec0fd026ab90c3ebfb3439ed0edfaa4", "marketingskills/skills/seo-audit/references/international-seo.md": "d2fc76f40eccc422ae0f1d7e5b770095e89a045f38e1d0370811203da57996ff"};
const oldBodySha="11073d6d2e0ce8c3b1103255120f376dab2e05129341a28de729e49f3b0700e8";
const appendix="\n## Optional Search Console diagnosis\n\nFor a Search Console export, search-performance change or indexing investigation,\nuse [Search Console diagnosis](references/search-console-diagnosis.md). It adds\ncomparison and evidence checks, not automatic account access, monitoring or URL\nsubmission. [Source notes and corrections](GSC_SOURCES.md).\n";
test('explicit native GSC trigger and narrow route preserve the previous body',()=>{
 const b=read(owner+'/SKILL.md'),text=b.toString();assert.equal(b.length,route.current.bytes);assert.equal(sha(b),route.current.sha256);
 assert(text.endsWith(appendix));const previousBody=text.slice(text.indexOf('\n---',4)+4,-appendix.length);assert.equal(sha(previousBody),oldBodySha);
 assert(text.split('\n---')[0].includes('Google Search Console (GSC) exports'));assert.equal(text.split('(references/search-console-diagnosis.md)').length-1,1);
});
test('all other SEO owner files remain exact',()=>{for(const [p,h] of Object.entries(preserved))assert.equal(sha(read(p)),h,p);});
function guideCases(text){
 const rows=text.split('\n').filter(l=>/^\| (ordinary-page|generic-video|job-readonly|live-broadcast|inspect-page|sitemap-readonly) \|/.test(l));
 const entries=rows.map(l=>l.split('|').slice(1,-1).map(x=>x.trim()));assert.equal(entries.length,6);assert.equal(new Set(entries.map(r=>r[0])).size,6);return Object.fromEntries(entries.map(([id,...fields])=>[id,fields]));
}
function verifyGuideCases(text){
 assert.deepEqual(guideCases(text),{
 'ordinary-page':['Product page','Indexing API notification','Write approved','Do not use Indexing API'],
 'generic-video':['VideoObject without BroadcastEvent','Indexing API notification','Write approved','Do not use Indexing API'],
 'job-readonly':['JobPosting page','Indexing API notification','Read only','No submission'],
 'live-broadcast':['BroadcastEvent in VideoObject','Indexing API notification','Separate setup and write approved','Eligible for separate Indexing API workflow'],
 'inspect-page':['Ordinary article','URL Inspection read','Read approved','Read indexed status only'],
 'sitemap-readonly':['Sitemap','Submit sitemap','Read only','No submission']});
}
test('actual guide scenarios preserve content eligibility AND authorization boundaries',()=>{
 const text=read(tool).toString();verifyGuideCases(text);
 for(const [before,after] of [
  ['Product page | Indexing API notification | Write approved | Do not use Indexing API','Product page | Indexing API notification | Write approved | Eligible for separate Indexing API workflow'],
  ['JobPosting page | Indexing API notification | Read only | No submission','JobPosting page | Indexing API notification | Read only | Eligible for separate Indexing API workflow'],
  ['BroadcastEvent in VideoObject | Indexing API notification | Separate setup and write approved | Eligible for separate Indexing API workflow','BroadcastEvent in VideoObject | Indexing API notification | Separate setup and write approved | No submission'],
  ['Ordinary article | URL Inspection read | Read approved | Read indexed status only','Ordinary article | URL Inspection read | Read approved | Request indexing'],
  ['Sitemap | Submit sitemap | Read only | No submission','Sitemap | Submit sitemap | Read only | Submit sitemap']
 ]){assert(text.includes(before));assert.throws(()=>verifyGuideCases(text.replace(before,after)),assert.AssertionError);}
});
test('guide removes generic submission example and explains separate API, scopes and data limits',()=>{
 const text=read(tool).toString(),flat=text.replace(/\s+/g,' ');
 for(const phrase of ['not an installed client or permission','auth/webmasters.readonly','auth/webmasters`','auth/indexing','does not request indexing','live test','JobPosting','BroadcastEvent','do not prove that Google crawled or indexed','does not avoid quotas or guarantee a complete export'])assert(flat.includes(phrase),phrase);
 assert(!text.includes('urlNotifications:publish'));assert(!text.includes('200 queries per minute'));assert(!text.includes('1,200 requests per minute'));
});
test('source, full MIT and all current adapted payloads are bound',()=>{
 const p=JSON.parse(read(owner+'/gsc-provenance.json'));
 assert.equal(p.repository,'https://github.com/kostja94/marketing-skills');assert.equal(p.commit,'70987bad4ebe9dce1f74858c1c64f3f8810f18e4');
 for(const r of p.sources){assert.match(r.git_blob,/^[a-f0-9]{40}$/);assert.match(r.sha256,/^[a-f0-9]{64}$/);assert(r.bytes>0);}
 assert.equal(sha(read(owner+'/licenses/kostja-MIT.txt')),p.sources.find(r=>r.path==='LICENSE').sha256);
 for(const [rel,r] of Object.entries(p.adapted_files)){const b=read(rel);assert.equal(b.length,r.bytes);assert.equal(sha(b),r.sha256,rel);}
 assert(p.primary_references.length>=5);for(const r of p.primary_references){assert(r.url.startsWith('https://'));assert.match(r.sha256,/^[a-f0-9]{64}$/);assert(r.bytes>0);}
});
test('current Markdown links resolve without broadening installed scope',()=>{
 const prov=JSON.parse(read(owner+'/gsc-provenance.json'));
 for(const rel of Object.keys(prov.adapted_files).filter(p=>p.endsWith('.md'))){const text=read(rel).toString().replace(/```[\s\S]*?```/g,'');for(const [,href] of text.matchAll(/\]\(([^)]+)\)/g)){if(/^(https?:|#|mailto:)/.test(href))continue;const dest=path.resolve(root,path.dirname(rel),href.split('#')[0]);assert(dest.startsWith(root+path.sep),href);assert(fs.statSync(dest).isFile(),href);}}
});
function dirhash(dir){const files=[];function walk(p){for(const e of fs.readdirSync(p,{withFileTypes:true})){const f=path.join(p,e.name);if(e.isDirectory())walk(f);else if(e.isFile())files.push(f);}}walk(dir);const h=createHash('sha256');for(const f of files.sort()){h.update(path.relative(dir,f).split(path.sep).join('/'));h.update(Buffer.from([0]));h.update(fs.readFileSync(f));h.update(Buffer.from([0]));}return h.digest('hex');}
test('SEO package digest matches and native metadata loads just the owner',async()=>{
 const m=JSON.parse(read('marketingskills/MANIFEST.json'));assert.equal(dirhash(path.join(root,owner)),m.skills.find(s=>s.name==='seo-audit').sha256);
 const native=process.env.PRIME_NATIVE_ROOT;assert(native);const {loadSkillsFromDir,formatSkillsForPrompt}=await import(pathToFileURL(path.join(native,'dist/core/skills.js')));
 const loaded=loadSkillsFromDir({dir:path.join(root,owner),source:'explicit'});assert.deepEqual(loaded.diagnostics,[]);assert.equal(loaded.skills.length,1);const skill=loaded.skills[0];assert.equal(skill.name,'seo-audit');assert(skill.description.includes('Google Search Console (GSC) exports'));assert(skill.description.length<=1024);assert(!skill.disableModelInvocation);const prompt=formatSkillsForPrompt(loaded.skills);assert(!prompt.includes('Never average row CTRs'));assert(!prompt.includes('job-readonly'));
});
