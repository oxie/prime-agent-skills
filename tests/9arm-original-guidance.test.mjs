// Static content/history controls, not an application or model-behavior trial.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {beforeOriginalGuidanceFile,originalGuidanceTransitions} from './helpers/original-guidance-snapshot.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p));
const sha=b=>createHash('sha256').update(b).digest('hex');
const flat=t=>t.toString().replace(/\s+/g,' ');
const clauses={"engineering-references/references/debugging.md": ["When a substantive bug write-up is requested or required by the project", "current PR, ticket or document", "Do not create a second record system", "require a write-up for a typo", "supported mechanism", "code locations, revision identifiers and evidence links", "earlier ineffective fix", "actual tested environment/revision, completed outcomes and untested scope", "does not alone prove a cause", "Do not strengthen a hypothesis", "unknown escape cause stays unknown", "unknown ownership stays explicit", "no follow-up can be a valid outcome", "no required template", "An incomplete investigation can still have a useful record", "missing reproduction or untested patch plainly", "local retest is not evidence of deployment", "do not delay it for bug closeout", "Keep the technical record intact", "no permission to fetch private tickets or publish it", "unchanged cache key \u2192 old entry reused after rename \u2192 stale title", "without asserting this was the only escape cause", "locally retested at r18; not deployed; multi-worker behavior untested", "BUG-43 stays unassigned", "invented documentation example, not an executed application test"], "marketingskills/skills/copy-editing/references/source-fidelity-and-clarity.md": ["user asks to reframe supplied engineering material", "non-marketing edit", "not permission to research, fetch tickets or send messages", "shorter update does not replace it", "not their job title", "Ask only when missing context prevents a useful, safe draft", "If a decision or recommendation is requested", "Separate observed impact from possible exposure", "None implies the next state", "Unknown impact, cause, owner, timing or validation remains unknown", "do not strip it by category or impose a link quota", "Preserve uncertainty and caveats in the delivered body", "not automatically safe to share with a wider audience", "without fixed word or bullet limits", "Keep required conditions", "actual final draft", "complete supplied facts", "PR-42 is in review, not merged or deployed", "Customer exposure is unknown", "Mira owns PR-42", "BUG-43 tracks the multi-worker check and has no assigned owner", "No ETA or workaround is supplied", "invented input facts, not observed product results", "must not assign BUG-43 to Mira", "If the input instead says the cause is unknown or the patch was not tested, keep that limit in both views", "only a typo correction was requested, skip this reframing", "Neither draft authorizes sending it"]};
function retains(t,terms){for(const c of terms)assert(flat(t).includes(c),c);}
for(const [p,terms] of Object.entries(clauses))test(p+' optional guidance protects meaning and scope',()=>{
 const t=flat(read(p));retains(t,terms);
 for(const c of terms)assert.throws(()=>retains(t.split(c).join('REMOVED'),terms),undefined,c);
});
const example=Object.keys(clauses)[1];
function views(text){return ['Reply to “Is the preview fix live?”','Email to the release lead'].map((h,i)=>{
 const s=text.split('**'+h+'**')[1];assert(s,h);
 const end=i===0?s.indexOf('**Email to the release lead**'):s.indexOf('Both views retain');
 return flat(s.slice(0,end).split('\n').filter(l=>l.startsWith('>')).map(l=>l.replace(/^> ?/,'')).join(' '));
});}
function checkViews(text){
 const [reply,email]=views(text);
 retains(reply,['No.','running revision is r17','Patch r18 passed the local rename check','PR-42 is still in review','neither merged nor deployed','Customer exposure remains unknown','multi-worker behavior is untested']);
 retains(email,['assign an owner for BUG-43','before deciding whether to schedule deployment',"Mira's PR-42",'Patch r18 passed the local rename check','not merged or deployed','r17 is still running','Customer exposure remains unknown','Multi-worker behavior is untested','BUG-43 is unassigned','No ETA or workaround has been supplied']);
}
test('both rendered example bodies retain their decision-critical supported facts',()=>{
 const text=read(example).toString();checkViews(text);
 // Mutate the delivered view, not the explanatory notes or source facts.
 for(const [from,to] of [
  ['> No. The running revision is r17.','> Yes. The running revision is r18.'],
  ['> PR-42 is still in review and is neither merged nor deployed.','> PR-42 is merged and deployed.'],
  ['> remains unknown; multi-worker behavior is untested.','> is resolved; multi-worker behavior passed.'],
  ['> is unassigned. No ETA or workaround has been supplied.','> is assigned to Mira. Deploy tomorrow; restart as a workaround.'],
 ]){assert(text.includes(from));assert.throws(()=>checkViews(text.replace(from,to)),undefined,from);}
});
test('fictional source facts explicitly support the claimed verification states',()=>{
 const copy=read(example).toString();
 const eng=read('engineering-references/references/debugging.md').toString();
 function check(copyText,engText){
  const source=copyText.split('### Fictional source, two supported views')[1].split('**Reply to')[0];
  retains(source,['At patch `r18`, the local rename check passed.','multi-worker behavior is untested']);
  const facts=engText.split('Supplied investigation facts:')[1].split('A useful record keeps')[0];
  retains(facts,['same local test now returns the renamed title','customer exposure remains unknown and multi-worker behavior is untested']);
  checkViews(copyText);
 }
 check(copy,eng);
 for(const weaker of ['local rename check was rerun.','local rename check failed.','local rename check was not run.','']){
  assert(copy.includes('local rename check passed.'));
  assert.throws(()=>check(copy.replace('local rename check passed.',weaker),eng));
 }
 const engFact='customer exposure remains unknown and multi-worker\nbehavior is untested';
 assert(eng.includes(engFact));
 for(const weaker of ['customer exposure and multi-worker behavior remain unknown','customer exposure remains unknown and multi-worker behavior passed']){
  assert.throws(()=>check(copy,eng.replace(engFact,weaker)));
 }
});
const expected={"engineering-references/references/debugging.md": {"bytes": 14060, "sha256": "8e170673d15d86d696ac8d9297202db06df462c4112c8d31b77d5e46ffe66a21"}, "marketingskills/skills/copy-editing/references/source-fidelity-and-clarity.md": {"bytes": 12147, "sha256": "81ac559f38b6076d43e568929f2105e39c61366ee8e010c257bd2b8c4a4b288b"}, "engineering-references/UPSTREAM.md": {"bytes": 10140, "sha256": "03d02093adf9c09cb30a92601de5fd73810e1a49b9f94b54015a04b53c4371e6"}, "marketingskills/UPSTREAM.md": {"bytes": 10050, "sha256": "ddb33a500a4410898d0adb9d72d686f46a2d46c350af6aa8edced728d6dadeae"}, "engineering-references/SKILL.md": {"bytes": 9599, "sha256": "95b71203310185ab042507f3b19def212bf3efe6e0d5c97009a8bb856efbbb99"}, "marketingskills/skills/copy-editing/SKILL.md": {"bytes": 19310, "sha256": "8b82b1f0e5517d968fc3163c7745b1023a09b09ef7a45792f546d5ea3ce85010"}, "marketingskills/MANIFEST.json": {"bytes": 12162, "sha256": "a9853936cfdb9db6e95497238e2c8a6de730f8179aaafa0c02b783504779e6d8"}};
test('approved payloads are exact; attribution is consideration not a license grant',()=>{
 for(const [p,r] of Object.entries(expected)){const b=read(p);assert.equal(b.length,r.bytes,p);assert.equal(sha(b),r.sha256,p);}
 for(const p of ['engineering-references/UPSTREAM.md','marketingskills/UPSTREAM.md']){
  const t=flat(read(p));retains(t,["a1fc303b274ed06c32d405ba5a6db00ded6e5663"]);
  assert(/No upstream prose/.test(t));assert(/no declared license|No license was declared/.test(t));
 }
});
test('exact inverses preserve base identities and unknown current/base mutations stay visible',()=>{
 assert.deepEqual(Object.keys(originalGuidanceTransitions).sort(),Object.keys(expected).sort());
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'original-guidance-history-'));
 try{for(const [p,r] of Object.entries(originalGuidanceTransitions)){
  const current=read(p),old=beforeOriginalGuidanceFile(root,p);assert.equal(sha(current),r.current);assert.equal(sha(old),r.previous);
  const target=path.join(tmp,p);fs.mkdirSync(path.dirname(target),{recursive:true});
  for(const source of [current,old]){
   fs.writeFileSync(target,source);assert.deepEqual(beforeOriginalGuidanceFile(tmp,p),old);
   const bads=[Buffer.concat([source,Buffer.from('unapproved addition')])];
   for(const at of [0,Math.floor(source.length/2),source.length-1]){const b=Buffer.from(source);b[at]^=1;bads.push(b);}
   for(const bad of bads){fs.writeFileSync(target,bad);assert.deepEqual(beforeOriginalGuidanceFile(tmp,p),bad);}
  }
 }}finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
test('current marketing manifest changes only Copy Editing digest, not upstream history',()=>{
 const current=JSON.parse(read('marketingskills/MANIFEST.json'));
 const old=JSON.parse(beforeOriginalGuidanceFile(root,'marketingskills/MANIFEST.json'));
 const row=current.skills.find(s=>s.name==='copy-editing'),prior=old.skills.find(s=>s.name==='copy-editing');
 assert.notEqual(row.sha256,prior.sha256);row.sha256=prior.sha256;assert.deepEqual(current,old);
});
test('existing owner routes are optional and all changed document links resolve',()=>{
 retains(read('engineering-references/SKILL.md'),['bug-fix closeout','requested substantive bug write-up','optional closeout section']);
 retains(read('marketingskills/skills/copy-editing/SKILL.md'),['requested engineering update','optional rewrite example','Skip product-marketing context']);
 for(const p of Object.keys(expected).filter(p=>p.endsWith('.md'))){
  const st=fs.lstatSync(path.join(root,p));assert(st.isFile()&&!st.isSymbolicLink());assert.equal(st.mode&0o111,0);
  assert(!/^allowed-tools:|^hooks:/m.test(read(p).toString()));
  for(const [,href] of read(p).toString().matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
   if(/^(https?:|#)/.test(href))continue;
   const dest=path.resolve(root,path.dirname(p),href.split('#')[0]);assert(dest.startsWith(root+path.sep));assert(fs.statSync(dest).isFile(),p+': '+href);
  }
 }
});
