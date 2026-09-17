import test from 'node:test';
import {beforeHiggsfieldFile} from './helpers/higgsfield-snapshot.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>beforeHiggsfieldFile(root,p).toString('utf8');
const sha=b=>createHash('sha256').update(b).digest('hex');
const flat=s=>s.replace(/\s+/g,' ');
// Fixture/document tests only; no upstream execution, network or model calls.
const example='engineering-references/examples/okf';
const expectedFiles=['index.md','scope.md','definitions/index.md','definitions/active-workspace.md','definitions/active-workspace-legacy.md','policies/index.md','policies/activity.md'];
const parseCode="import json, pathlib, sys, yaml\nroot=pathlib.Path(sys.argv[1])\nout={}\nfor p in sorted(root.rglob('*.md')):\n text=p.read_text(encoding='utf-8')\n if text.startswith('---\\n'):\n  _, fm, body=text.split('---',2)\n  data=yaml.safe_load(fm)\n else: data=None;body=text\n out[p.relative_to(root).as_posix()]={'metadata':data,'body':body}\nprint(json.dumps(out))\n";
function loadExample(){
 const r=spawnSync('python3',['-B','-c',parseCode,path.join(root,example)],{encoding:'utf8'});
 assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout);
}
function resolveLink(from,href){
 const normalized=href.startsWith('/')?path.posix.normalize(href.slice(1)):path.posix.normalize(path.posix.join(path.posix.dirname(from),href.split('#')[0]));
 assert(!normalized.startsWith('../')&&!path.posix.isAbsolute(normalized),'escape');return normalized;
}
function inspectBundle(docs){
 assert.deepEqual(Object.keys(docs).sort(),[...expectedFiles].sort());
 const concepts=[];const edges=new Map();
 for(const [file,{metadata:m,body}] of Object.entries(docs)){
  const index=path.posix.basename(file)==='index.md';
  if(index){if(file==='index.md')assert.deepEqual(m,{okf_version:'0.2'});else assert.equal(m,null);}
  else{
   concepts.push(file);assert.equal(typeof m?.type,'string');assert(m.type.trim());
   assert(['draft','stable','deprecated'].includes(m.status));
   assert(!('verified' in m),'Fictional fixture cannot imply actual review');
   for(const family of ['generated','verified'])if(m[family]){
    const events=Array.isArray(m[family])?m[family]:[m[family]];
    for(const event of events){assert.equal(typeof event.by,'string');assert.match(event.at,/T.*(?:Z|[+-]\d\d:\d\d)$/);assert(Number.isFinite(Date.parse(event.at)));}
   }
   if(m.stale_after){assert.match(m.stale_after,/T.*(?:Z|[+-]\d\d:\d\d)$/);assert(Number.isFinite(Date.parse(m.stale_after)));}
  }
  const targets=[];
  for(const [,href] of body.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)){
   assert(!/^[a-z]+:/i.test(href),'Self-contained fixture has no external fetch');
   const target=resolveLink(file,href);assert(docs[target],`missing ${file} -> ${target}`);targets.push(target);
  }
  const sources=m?.sources??[];assert(Array.isArray(sources));const ids=new Set();
  for(const source of sources){assert.equal(typeof source.resource,'string');assert(docs[resolveLink(file,source.resource)]);assert(source.id&&!ids.has(source.id));ids.add(source.id);}
  for(const [,id] of body.matchAll(/\[\^([^\]]+)\](?!:)/g)){assert(ids.has(id),`unjoined claim ${file} ${id}`);assert(body.includes(`[^${id}]:`));}
  edges.set(file,targets);
 }
 assert.equal(concepts.length,4);
 const reached=new Set();const visit=p=>{if(reached.has(p))return;reached.add(p);for(const t of edges.get(p))visit(t);};visit('index.md');
 assert.deepEqual([...reached].sort(),[...expectedFiles].sort(),'Delivered index reaches all intended files');
 const current=docs['definitions/active-workspace.md'];const legacy=docs['definitions/active-workspace-legacy.md'];
 assert.equal(current.metadata.source_revision,'policy-r2');assert.equal(legacy.metadata.status,'deprecated');
 assert(current.body.includes('active-workspace-legacy.md'));assert(legacy.body.includes('active-workspace.md'));
 assert.equal(current.metadata.generated.by,'fictional-example/2');
 assert.equal(current.metadata.stale_after,'2026-10-01T00:00:00Z');
 assert(docs['scope.md'].body.includes('not included'));
 return docs;
}
test('OKF example parses real YAML and is connected, scoped and source-attributed',()=>inspectBundle(loadExample()));
test('OKF fixture checks reject missing concepts, index gaps, path escapes and misattributed claims',()=>{
 const good=loadExample();inspectBundle(good);
 const mutate=fn=>{const d=structuredClone(good);fn(d);assert.throws(()=>inspectBundle(d));};
 mutate(d=>delete d['scope.md'].metadata.type);
 mutate(d=>d['index.md'].metadata.okf_version=0.2);
 mutate(d=>d['definitions/index.md'].metadata={type:'Index'});
 mutate(d=>delete d['policies/activity.md']);
 mutate(d=>d['index.md'].body='No delivered entries');
 mutate(d=>d['scope.md'].body+=' [escape](../../outside.md)');
 mutate(d=>d['definitions/active-workspace.md'].metadata.sources[0].id='wrong');
 mutate(d=>d['definitions/active-workspace.md'].metadata.verified={by:'human:invented',at:'2026-09-01T00:00:00Z'});
 mutate(d=>d['definitions/active-workspace.md'].metadata.source_revision='policy-r1');
 mutate(d=>d['definitions/active-workspace-legacy.md'].metadata.status='stable');
 mutate(d=>d['definitions/active-workspace.md'].metadata.stale_after='2026-10-01');
});
test('OKF current and historical definitions distinguish actual example cases',()=>{
 const d=inspectBundle(loadExample());
 const current=d['definitions/active-workspace.md'].body,old=d['definitions/active-workspace-legacy.md'].body,policy=d['policies/activity.md'].body;
 function rules(text){const days=Number(text.match(/\[T - (\d+) days, T\)/)?.[1]);assert(Number.isFinite(days));return {days,heartbeat:!text.includes('Automated heartbeats do not qualify')};}
 function outcomes(c,o){return [c,o].map(r=>[
  ['human',14],['human',0],['heartbeat',1],['human',20],['human',31]
 ].map(([kind,days])=>days>0&&days<=r.days&&(kind==='human'||r.heartbeat)));}
 const expected=[[true,false,false,false,false],[true,false,true,true,false]];
 assert.deepEqual(outcomes(rules(current),rules(old)),expected);
 assert.throws(()=>assert.deepEqual(outcomes(rules(current.replace('14 days','30 days')),rules(old)),expected));
 assert.throws(()=>assert.deepEqual(outcomes(rules(current.replace('Automated heartbeats do not qualify','Heartbeats qualify')),rules(old)),expected));
 for(const phrase of ['Include the lower boundary and exclude T itself','Days mean elapsed 24-hour periods measured in UTC','Count each qualifying workspace once','For T before that effective instant','missing events prove inactivity'])assert(flat(policy).includes(phrase),phrase);
 const deadline=Date.parse(d['definitions/active-workspace.md'].metadata.stale_after);
 assert.deepEqual([deadline-1,deadline,deadline+1].map(now=>now>=deadline),[false,true,true]);
 // This arithmetic is an illustration oracle, not a production metric implementation.
});
const clauses={"engineering-references/references/knowledge-bundles.md": ["named recipient", "continual harness remains the durable agent-learning authority", "existing handoff record", "permissive format acceptance is not enough", "fictional documentation-only bundle", "source_revision", "approved source revision", "a trust badge is neither access control nor acceptance authority", "at consumption time", "Missing content, failed reads, conflicts", "symlink resolution", "not authorize network access", "failed or partial export must not silently replace", "authoritative job/result evidence", "test the exact delivered paths", "Publish or upload only with approval"], "marketingskills/skills/ai-seo/references/okf.md": ["OKF v0.2", "not an AI-search registration mechanism", "not Google Search integration", "no additional requirements or new machine-readable files", "Get explicit approval before publishing", "Neither `llms.txt` nor schema markup is an OKF prerequisite", "No frontmatter except optional", "bundle root", "site root", "Unknown evidence remains unknown", "not per-run attestation"]};
test('OKF guidance retains useful workflow and authority limits with deletion controls',()=>{
 for(const [p,items] of Object.entries(clauses)){
  const text=flat(read(p)),check=t=>{for(const clause of items)assert(t.includes(clause),clause);};
  check(text);for(const c of items)assert.throws(()=>check(text.split(c).join('')),{name:'AssertionError'},c);
 }
 const website=read('marketingskills/skills/ai-seo/references/okf.md');
 for(const forbidden of ['protocol-layer registration','recommended for most sites','Site is <10 pages','30 minutes a quarter','fits on one page'])assert(!website.includes(forbidden));
 assert(read('engineering-references/SKILL.md').includes('[knowledge bundles](references/knowledge-bundles.md)'));
 assert(read('engineering-references/SKILL.md').includes('portable project knowledge bundles'));
 const main=read('marketingskills/skills/ai-seo/SKILL.md');assert(main.includes('Optional OKF bundle'));
 assert(main.includes('listing it here does not establish adoption, ranking benefit or permission to publish'));
 assert(main.includes('Public hosting requires approval; the optional OKF bundle need not live at the site root'));
 assert(!main.includes('The files below help with those engines without harming Google'));
 assert(!main.includes('Add these machine-readable files to your site root:'));
});
test('OKF history restores only recognized successor bytes, preserving unknown mutations',async()=>{
 const {beforeOkfFile,okfTransitions}=await import('./helpers/okf-snapshot.mjs');
 assert.equal(Object.keys(okfTransitions).length,7);
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'okf-history-'));
 try{for(const [p,r] of Object.entries(okfTransitions)){
  const b=Buffer.from(read(p)),old=beforeOkfFile(root,p);assert.equal(sha(b),r.current);assert.equal(sha(old),r.previous);
  fs.mkdirSync(path.dirname(path.join(tmp,p)),{recursive:true});fs.writeFileSync(path.join(tmp,p),old);assert.deepEqual(beforeOkfFile(tmp,p),old);
  const muts=[Buffer.concat([b,Buffer.from('unknown append')])];
  for(const at of [0,Math.floor(b.length/2),b.length-1]){const bad=Buffer.from(b);bad[at]^=1;muts.push(bad);}
  for(const bad of muts){fs.writeFileSync(path.join(tmp,p),bad);assert.deepEqual(beforeOkfFile(tmp,p),bad);assert.notEqual(sha(bad),r.previous);}
 }}finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
test('OKF source identities, original payloads and Marketing digest stay explicit',()=>{
 for(const owner of ['engineering-references','marketingskills']){
  const p=JSON.parse(read(owner+'/okf-provenance.json'));
  assert.equal(p.commit,'ad30107c31c06aec8a7d5636e0d1058118604e6f');assert.equal(p.spec_version,'0.2');assert.equal(p.sources.length,7);
  for(const s of p.sources){assert.match(s.sha256,/^[a-f0-9]{64}$/);assert.match(s.git_blob,/^[a-f0-9]{40}$/);assert(s.bytes>0);assert(s.url.includes(p.commit+'/'+s.path));}
  for(const [file,r] of Object.entries(p.files)){const b=Buffer.from(read(owner+'/'+file));assert.equal(b.length,r.bytes);assert.equal(sha(b),r.sha256);const st=fs.lstatSync(path.join(root,owner,file));assert(st.isFile()&&!st.isSymbolicLink());assert.equal(st.mode&0o111,0);}
  for(const c of ['Apache License, Version 2.0','No Acme files, upstream implementation or substantial prose are copied','not a general OKF validator','not evidence of Google Search adoption'])assert(flat(read(owner+'/OKF_SOURCES.md')).includes(c),c);
 }
 const manifest=JSON.parse(read('marketingskills/MANIFEST.json'));const entry=manifest.skills.find(s=>s.name==='ai-seo');
 const h=createHash('sha256'),base=path.join(root,'marketingskills',entry.path);
 const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
 for(const file of walk(base).sort()){h.update(path.relative(base,file).split(path.sep).join('/')+'\0');h.update(fs.readFileSync(file));h.update('\0');}
 assert.equal(h.digest('hex'),entry.sha256);assert.equal(entry.sha256,JSON.parse(read('marketingskills/okf-provenance.json')).directory_transition.current);
});

test('OKF website example snippets parse and retain current/retired/source distinctions',()=>{
 const text=read('marketingskills/skills/ai-seo/references/okf.md');
 const blocks=[...text.matchAll(/```markdown\n([\s\S]*?)```/g)].map(m=>m[1]);assert.equal(blocks.length,3);
 const code="import json,sys,yaml\nprint(json.dumps([yaml.safe_load(t.split('---',2)[1]) for t in json.load(sys.stdin)]))";
 const r=spawnSync('python3',['-B','-c',code],{encoding:'utf8',input:JSON.stringify(blocks)});assert.equal(r.status,0,r.stderr);
 const [index,current,old]=JSON.parse(r.stdout);assert.deepEqual(index,{okf_version:'0.2'});
 assert.equal(current.type,'Product Plan');assert.equal(current.status,'draft');assert.equal(old.status,'deprecated');
 for(const m of [current,old]){assert(!('verified' in m));assert.equal(m.sources.length,1);assert(m.sources[0].resource.startsWith('https://example.com/'));assert(m.sources[0].id);}
 assert(blocks[1].includes('(./starter-retired.md)'));assert(blocks[2].includes('(./team.md)'));
 assert(flat(blocks[2]).includes('replacement does not imply automatic migration'));
});
