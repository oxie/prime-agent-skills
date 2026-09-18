import {beforeOriginalGuidanceFile} from './helpers/original-guidance-snapshot.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>beforeOriginalGuidanceFile(root,p).toString('utf8');
const sha=b=>createHash('sha256').update(b).digest('hex');
const flat=t=>t.replace(/\s+/g,' ');
const base='marketingskills/skills/image/references/website-asset-pack/';
test('Higgsfield connected workflow and original pack exist',()=>{for(const p of ['marketingskills/skills/image/references/website-asset-workflow.md','marketingskills/skills/video/references/connected-website-shots.md',...['index.md','brief.md','shots.md','delivery.md','pack.json'].map(p=>base+p)])assert(read(p).trim());});

function validatePack(p){
 assert.equal(p.example,'fictional-documentation-only');assert.equal(p.media_present,false);assert.equal(p.provider,null);
 assert.deepEqual(p.authorization,{upload:false,generate:false,paid_attempt_limit:0,deploy:false});
 for(const r of p.references){assert.equal(r.evidence,'hypothetical');assert(r.revision);assert(r.role);assert(r.excludes.length);}
 const nodes=[...p.references,...p.shots,...p.outputs],ids=nodes.map(n=>n.id);assert.equal(new Set(ids).size,ids.length);
 const graph=new Map(nodes.map(n=>[n.id,n.depends_on??[]]));
 const visiting=new Set(),visited=new Set();
 function visit(id){assert(graph.has(id),'missing dependency');assert(!visiting.has(id),'cycle');if(visited.has(id))return;visiting.add(id);for(const dep of graph.get(id))visit(dep);visiting.delete(id);visited.add(id);}
 ids.forEach(visit);
 for(const n of p.shots)assert.equal(n.status,'planned');
 for(const n of p.outputs){assert.equal(n.status,'planned');assert.equal(n.approval,'unperformed');assert.equal(n.inspection,'unperformed');if(n.proposed_path)assert(n.proposed_path.startsWith('assets/')&&!n.proposed_path.includes('..'));}
 assert(Object.values(p.checks).every(v=>v==='unperformed'));
 const t=p.timeline;assert(graph.has(t.asset));assert.equal(t.duration_seconds,6);
 let end=0;for(const c of t.chapters){assert.equal(c.in,end);assert(c.out>c.in);end=c.out;}assert.equal(end,t.duration_seconds);
 const change=p.revision_case;assert.equal(change.changed,'object-front');assert.notEqual(change.from,change.to);
 const affected=new Set([change.changed]);let changed=true;while(changed){changed=false;for(const n of nodes)if(!affected.has(n.id)&&(n.depends_on??[]).some(d=>affected.has(d))){affected.add(n.id);changed=true;}}
 affected.delete(change.changed);
 assert.deepEqual([...affected].sort(),[...change.invalidate].sort());
 assert.deepEqual(p.outputs.filter(n=>!affected.has(n.id)).map(n=>n.id),change.retain);
 return p;
}
test('fictional pack joins references, shots, outputs and one shared six-second timeline',()=>validatePack(JSON.parse(read(base+'pack.json'))));
test('pack oracle rejects invented evidence, dependency loss, stale approval and clip replay',()=>{
 const good=JSON.parse(read(base+'pack.json'));validatePack(good);
 const bad=fn=>{const p=structuredClone(good);fn(p);assert.throws(()=>validatePack(p));};
 bad(p=>p.media_present=true);bad(p=>p.authorization.generate=true);bad(p=>p.authorization.paid_attempt_limit=1);
 bad(p=>p.references[0].evidence='verified');bad(p=>p.outputs[0].approval='approved');bad(p=>p.checks.receiving_site='passed');
 bad(p=>p.shots[1].depends_on=['missing']);bad(p=>p.shots[0].depends_on=['V1']);bad(p=>p.revision_case.invalidate.pop());
 bad(p=>p.revision_case.retain.push('hero-wide'));bad(p=>p.outputs[0].proposed_path='../outside.webp');
 bad(p=>p.timeline.chapters[1].in=0);bad(p=>p.timeline.chapters[1].out=6);bad(p=>p.timeline.duration_seconds=18);
});

const clauses={"marketingskills/skills/image/references/website-asset-workflow.md": ["A prompt-only handoff is a complete result", "missing evidence does not authorize invented faces", "reference name its source revision, role and exclusions", "generated reference sheet cannot establish unseen geometry", "a global change requires reviewing all affected prompts and outputs", "Unknown cost is not zero", "Inspect actual assets, not just the prompts", "Changed meaningful content invalidates affected approval", "Keep unrelated assets valid", "one poster is not enough", "public deployment and community-feed listing are separate decisions"], "marketingskills/skills/video/references/connected-website-shots.md": ["shared-film time ranges", "old completion must not survive", "not guaranteed by wording", "resume uncertain jobs instead of blindly resubmitting", "Website integration and public deployment remain separately owned"], "marketingskills/tools/integrations/higgsfield.md": ["not executed or verified as a CLI contract", "auto-uploaded", "under an Enterprise Agreement", "not automatically to any paid or Business plan", "server enhances the prompt", "unknown submission outcome", "never submit merely to discover the price", "6–60 audio jobs and 6–60 video jobs", "Vendor virality scores are not measured retention", "Full Brandkit executable state", "No automatic memory"]};

test('connected workflow and provider safeguards survive with deletion controls',()=>{
 for(const [p,terms] of Object.entries(clauses)){
  const text=flat(read(p)),check=t=>{for(const term of terms)assert(t.includes(term),term);};
  check(text);for(const term of terms)assert.throws(()=>check(text.replaceAll(term,'')),{name:'AssertionError'},term);
 }
});
test('owner routing remains optional and no executable or provider access is added',()=>{
 for(const [p,target] of [['marketingskills/skills/image/SKILL.md','website-asset-workflow.md'],['marketingskills/skills/video/SKILL.md','connected-website-shots.md'],['cinematic-ui/SKILL.md','Connected image and video asset handoff']]){
  const t=read(p);assert(t.includes(target));assert(!/^allowed-tools:|^disable-model-invocation:/m.test(t));
 }
 for(const p of ['marketingskills/skills/image/SKILL.md','marketingskills/skills/video/SKILL.md'])assert(read(p).includes("'Higgsfield,'"));
 assert(read('cinematic-ui/SKILL.md').includes('not a new website\nplatform default'));
 const guide=read('marketingskills/tools/integrations/higgsfield.md');
 for(const bad of ['curl -fsSL','npx skills add','auth login','generate create '])assert(!guide.includes(bad),bad);
 const ex=fs.readdirSync(path.join(root,base)).sort();assert.deepEqual(ex,['brief.md','delivery.md','index.md','pack.json','shots.md']);
});
test('new document links resolve within the checkout and example is reachable',()=>{
 const files=[...Object.keys(clauses),...['index.md','brief.md','shots.md','delivery.md'].map(p=>base+p),'marketingskills/HIGGSFIELD_SOURCES.md','cinematic-ui/HIGGSFIELD_SOURCES.md'];
 for(const p of files){const t=read(p).replace(/```[\s\S]*?```/g,'');for(const [,href] of t.matchAll(/\]\(([^\s)]+)\)/g)){
  if(href.includes('://')||href.startsWith('#'))continue;const dest=path.resolve(root,path.dirname(p),href.split('#')[0]);
  assert(dest.startsWith(root+path.sep));assert(fs.statSync(dest).isFile(),p+': '+href);
 }}
 for(const name of ['brief.md','shots.md','delivery.md','pack.json'])assert(read(base+'index.md').includes(']('+name+')'));
 assert(read('marketingskills/skills/image/references/website-asset-workflow.md').includes('website-asset-pack/index.md'));
});
test('provenance pins and notices are preserved and only Image/Video skill digests change',async()=>{
 const p=JSON.parse(read('marketingskills/higgsfield-provenance.json'));
 assert.equal(p.sources.length,18);const pins=new Set(p.sources.map(s=>s.commit));assert.deepEqual([...pins].sort(),['c0b73ab946df6658cca513db78bdc3909a655bfd','d071406147a37b835bed09543d85ab3e9bd85c7d'].sort());
 for(const s of p.sources){assert.match(s.sha256,/^[a-f0-9]{64}$/);assert(s.bytes>0);assert(s.path);}
 const note=read('marketingskills/HIGGSFIELD_SOURCES.md');for(const term of ['Copyright (c) 2026 O-Side Media','Copyright (c) 2026 Higgsfield AI','Permission is hereby granted','No third-party prompt pack'])assert(note.includes(term));
 const manifest=JSON.parse(read('marketingskills/MANIFEST.json'));
 const {beforeHiggsfieldFile}=await import('./helpers/higgsfield-snapshot.mjs');
 const old=JSON.parse(beforeHiggsfieldFile(root,'marketingskills/MANIFEST.json'));
 assert.deepEqual(manifest.source,old.source);assert.deepEqual(manifest.skills.filter(s=>!['image','video'].includes(s.name)),old.skills.filter(s=>!['image','video'].includes(s.name)));

 for(const name of ['image','video']){
  const row=manifest.skills.find(s=>s.name===name),dir=path.join(root,'marketingskills',row.path),hash=createHash('sha256');
  function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);}
  for(const f of walk(dir).sort()){hash.update(path.relative(dir,f).split(path.sep).join('/'));hash.update('\0');hash.update(fs.readFileSync(f));hash.update('\0');}
  assert.equal(hash.digest('hex'),row.sha256);
 }
});
test('exact historical adapter restores six predecessor files; unknown edits remain visible',async()=>{
 const {beforeHiggsfieldFile,higgsfieldTransitions}=await import('./helpers/higgsfield-snapshot.mjs');
 assert.equal(Object.keys(higgsfieldTransitions).length,6);
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'higgsfield-history-'));
 try{for(const [p,r] of Object.entries(higgsfieldTransitions)){
  const current=Buffer.from(read(p)),old=beforeHiggsfieldFile(root,p);assert.equal(sha(current),r.current);assert.equal(sha(old),r.previous);
  fs.mkdirSync(path.dirname(path.join(tmp,p)),{recursive:true});fs.writeFileSync(path.join(tmp,p),old);assert.deepEqual(beforeHiggsfieldFile(tmp,p),old);
  for(const at of [0,Math.floor(current.length/2),current.length-1]){const bad=Buffer.from(current);bad[at]^=1;fs.writeFileSync(path.join(tmp,p),bad);assert.deepEqual(beforeHiggsfieldFile(tmp,p),bad);}
  const append=Buffer.concat([current,Buffer.from('unknown')]);fs.writeFileSync(path.join(tmp,p),append);assert.deepEqual(beforeHiggsfieldFile(tmp,p),append);
 }}finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
