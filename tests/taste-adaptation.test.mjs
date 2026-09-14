import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync,mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {resolve,dirname,relative} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import {beforeTasteSkill,tasteRoutes} from './helpers/taste-snapshot.mjs';
import {previousMengtoSkill} from './helpers/mengto-snapshot.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(resolve(root,p));
const sha=b=>createHash('sha256').update(b).digest('hex');
const expectedRoutes={"cinematic-ui": {"path": "SKILL.md", "previous": {"bytes": 8446, "sha256": "ae748ac24fe63ac8dc4c4c4d57551e453767bf1bbb64b6c4eed3becb29b328d1"}, "addition": {"bytes": 357, "sha256": "2c06400c6d7a2b8fa4211bf3468fc8d5b9e2b848db2983e0cde81824a78d52b0"}, "current": {"bytes": 8803, "sha256": "cd7346ca6ddad2d1f898d6b7d9ab5e374157f88c366b87ab9ff05846a0d93572"}}, "hallmark": {"path": "SKILL.md", "previous": {"bytes": 9446, "sha256": "d63b9421aeed3022b99ddabe9aeacb2b594736f9095909193e60ca876b53125b"}, "addition": {"bytes": 466, "sha256": "816edd69fc05247d5336e240e413b2468e5e53b878b2bbccc9943e57772edeb3"}, "current": {"bytes": 9912, "sha256": "a1cf8ce06e0d3305d23a02bb79dcc04d95b0187c31f634b0a4304bd7b8b6f49a"}}, "marketingskills/skills/image": {"path": "SKILL.md", "previous": {"bytes": 16475, "sha256": "0b1a13a9db01ef82d01f02cfc61fc84d1f3718234ace98b8fb30f92354f0bdcb"}, "addition": {"bytes": 442, "sha256": "922b2397fb684714bf7aecb10149b002febff85ec7543b9444495d8fbf223b1d"}, "current": {"bytes": 16917, "sha256": "f8fe96dfb90fa21fa68fa7858ed772879c2f48eb04ae807a9ee777a7ffb9ae68"}}};
const expectedSources={"cinematic-ui": [{"path": "skills/soft-skill/SKILL.md", "sha256": "e1e32f5e2d420872c6c7332b53d5ff7721946766b78c4822b424c2d512c8fdbc", "git_blob": "4038f41ec0137ec92e98ed0151fe3b7038b9329e", "bytes": 10561}, {"path": "skills/brutalist-skill/SKILL.md", "sha256": "fffbaac8597f07679e9d87145533567658aedba3b5eca6f16a7075a333048caa", "git_blob": "f5375b908340e1376ed391232a31c5d82d5babfb", "bytes": 8456}, {"path": "skills/gpt-tasteskill/SKILL.md", "sha256": "2e64c269953f2656c21bf5a0fa6b4568e82fe0c72b36e8f84758e090349966a5", "git_blob": "03ed209b8fdc0a3cd6bccf8a5b3bfffe56aa4558", "bytes": 7857}, {"path": "skills/minimalist-skill/SKILL.md", "sha256": "36bc7328f085405f43b476938e62460fa573bf7e984e949e072bcf014831a44c", "git_blob": "44ead27ef04ffe79ade0c6df7fd696dbcf7b246b", "bytes": 7901}, {"path": "LICENSE", "sha256": "4575a543ab88dad12ccea7d97e563d0bce5b448b06072e65d3264497dad326df", "git_blob": "48a2f6640b81ff8eca9ce7f6a96337692713ef5b", "bytes": 1065}], "hallmark": [{"path": "skills/brutalist-skill/SKILL.md", "sha256": "fffbaac8597f07679e9d87145533567658aedba3b5eca6f16a7075a333048caa", "git_blob": "f5375b908340e1376ed391232a31c5d82d5babfb", "bytes": 8456}, {"path": "skills/gpt-tasteskill/SKILL.md", "sha256": "2e64c269953f2656c21bf5a0fa6b4568e82fe0c72b36e8f84758e090349966a5", "git_blob": "03ed209b8fdc0a3cd6bccf8a5b3bfffe56aa4558", "bytes": 7857}, {"path": "LICENSE", "sha256": "4575a543ab88dad12ccea7d97e563d0bce5b448b06072e65d3264497dad326df", "git_blob": "48a2f6640b81ff8eca9ce7f6a96337692713ef5b", "bytes": 1065}], "marketingskills/skills/image": [{"path": "skills/brandkit/SKILL.md", "sha256": "b0c4837e1bd140ca816ae54948754ddd2ac1e2a4d3619363777a80caf00b2ede", "git_blob": "d76399f666af97ac8c142928e02602d9732e78aa", "bytes": 15992}, {"path": "skills/minimalist-skill/SKILL.md", "sha256": "36bc7328f085405f43b476938e62460fa573bf7e984e949e072bcf014831a44c", "git_blob": "44ead27ef04ffe79ade0c6df7fd696dbcf7b246b", "bytes": 7901}, {"path": "LICENSE", "sha256": "4575a543ab88dad12ccea7d97e563d0bce5b448b06072e65d3264497dad326df", "git_blob": "48a2f6640b81ff8eca9ce7f6a96337692713ef5b", "bytes": 1065}]};
const history={"cinematic-ui/mengto-provenance.json": "f45a8f43d0d983a60e3f559636cb9048beabd8f84a0c9a0594c7ffbfa5d21909", "cinematic-ui/auteur-provenance.json": "4b5855158edc7b1814da0bb065d36617a4c45f95859f59b56372415bde5ecab9", "hallmark/next-provenance.json": "a9dc4ca4652411ec9025fe0bacfba66530c1b57967a3a1b5e9b731b6520dc1eb", "hallmark/aura-reference-intent.json": "079e6da82f964bc68a7083d0d0d6d06e95b984315fba7fbf22e26c1f1eaeebc2", "hallmark/ui-skills-provenance.json": "9d8880c4f877e9eee3accce6578f86032df53fdcaa4d13fc17457647d6ac8cf2", "hallmark/mengto-provenance.json": "0a9ada5e50b10637cd6597620239888aad27a4877947962494f9232b6c16f76d", "hallmark/refero-provenance.json": "44df23ec8b2aef3a19510ab72d1e696764ad98e214747aa6ef8b2c3ce14b4f4b", "marketingskills/skills/image/mengto-provenance.json": "bb9c96cb76d74982fdd217c5b464951c716e8710936ed660c0a7ca5fa797afb0"};
const provs=Object.fromEntries(Object.keys(expectedRoutes).map(o=>[o,JSON.parse(read(o+'/taste-provenance.json'))]));
function currentBytes(b,r){assert.equal(b.length,r.current.bytes);assert.equal(sha(b),r.current.sha256);assert.equal(sha(b.subarray(0,r.previous.bytes)),r.previous.sha256);assert.equal(sha(b.subarray(r.previous.bytes)),r.addition.sha256);assert.equal(b.length-r.previous.bytes,r.addition.bytes);}
test('approved current routes and prior prefixes are independently locked',()=>{
 assert.deepEqual(tasteRoutes,expectedRoutes);
 for(const [owner,r]of Object.entries(expectedRoutes)){
  const b=read(owner+'/SKILL.md');currentBytes(b,r);assert.deepEqual(provs[owner].routing,r);
  for(const i of [0,r.previous.bytes,b.length-1]){const corrupt=Buffer.from(b);corrupt[i]^=1;assert.throws(()=>currentBytes(corrupt,r));}
  assert.throws(()=>currentBytes(Buffer.concat([b,Buffer.from('extra')]),r));assert.throws(()=>currentBytes(b.subarray(0,r.previous.bytes),r));
 }
});
test('history adapter accepts exact current or old fixture bytes only; chained guards survive',()=>{
 const scratch=mkdtempSync(resolve(tmpdir(),'taste-snap-'));
 try{for(const [owner,r]of Object.entries(expectedRoutes)){
  const dir=resolve(scratch,owner);mkdirSync(dir,{recursive:true});const b=read(owner+'/SKILL.md');writeFileSync(resolve(dir,'SKILL.md'),b);
  assert.equal(sha(beforeTasteSkill(scratch,owner)),r.previous.sha256);
  if(owner!=='marketingskills/skills/image'){
   const old=JSON.parse(read(owner+'/mengto-provenance.json'));writeFileSync(resolve(dir,'mengto-provenance.json'),JSON.stringify(old));
   assert.equal(sha(previousMengtoSkill(scratch,owner)),old.routing.previous.sha256);
  }
  writeFileSync(resolve(dir,'SKILL.md'),b.subarray(0,r.previous.bytes));assert.equal(sha(beforeTasteSkill(scratch,owner)),r.previous.sha256);
  for(const corrupt of [Buffer.concat([b,Buffer.from('extra')]),Buffer.from(b)]){if(corrupt.length===b.length)corrupt[0]^=1;writeFileSync(resolve(dir,'SKILL.md'),corrupt);assert.throws(()=>beforeTasteSkill(scratch,owner));}
 }assert.throws(()=>beforeTasteSkill(scratch,'canvas-effects'));}finally{rmSync(scratch,{recursive:true,force:true});}
});
test('pinned sources, MIT, current payloads and old provenance remain byte-bound',()=>{
 for(const [owner,prov]of Object.entries(provs)){
  assert.equal(prov.commit,'ccbc15639c97057cbfcf32ecebc38ef716e4bb37');assert.equal(prov.repository,'https://github.com/Leonxlnx/taste-skill');assert.deepEqual(prov.sources,expectedSources[owner]);
  const license=read(owner+'/'+prov.license.path);assert.equal(sha(license),prov.license.sha256);assert(license.toString().includes('Copyright (c) 2026 Leonxlnx'));assert(license.toString().includes('Permission is hereby granted'));
  for(const [rel,rec]of Object.entries(prov.adapted_files)){const b=read(owner+'/'+rel);assert.equal(sha(b),rec.sha256,owner+'/'+rel);assert.equal(b.length,rec.bytes);}
 }
 for(const [p,h]of Object.entries(history))assert.equal(sha(read(p)),h,p);
});
const clauses={"hallmark/references/print-telemetry.md": ["Print register", "Telemetry readout", "Macro/micro hierarchy", "last odd cell", "not image-dependent halftoning", "unknown, stale, pending and confirmed"], "marketingskills/skills/image/references/identity-concepts.md": ["Monogram + meaning", "Product action", "Metaphor fusion", "Negative space", "Construction geometry", "LOANFOLD", "not quotas", "not a vector master", "16/32px"], "marketingskills/skills/image/references/ink-spot-illustration.md": ["Contour:", "Spot:", "Paper:", "not a provider-generated output", "not a production identity master", "does not inherit"]};
function hasClauses(text,required){for(const phrase of required)assert(text.includes(phrase),phrase);}
test('methods retain craft, concrete examples and evidence limits with deletion controls',()=>{
 for(const [p,required]of Object.entries(clauses)){const text=read(p).toString();hasClauses(text,required);for(const phrase of required)assert.throws(()=>hasClauses(text.replaceAll(phrase,''),required));}
});
test('payload links resolve and original owners remain natively eligible',async()=>{
 const native=process.env.PRIME_NATIVE_ROOT||resolve(process.env.HOME,'.local/lib/node_modules/prime-agent');const {loadSkillsFromDir}=await import(pathToFileURL(resolve(native,'dist/core/skills.js')).href);
 for(const [owner,p]of Object.entries(provs)){
  const loaded=loadSkillsFromDir({dir:resolve(root,owner),source:'test'});assert.equal(loaded.skills.length,1);assert.deepEqual(loaded.diagnostics,[]);assert.equal(loaded.skills[0].disableModelInvocation,false);
  for(const rel of Object.keys(p.adapted_files).filter(x=>x.endsWith('.md'))){
   for(const fragment of read(owner+'/'+rel).toString().split('](').slice(1)){
    const link=fragment.split(')')[0].split('#')[0];if(!link||link.includes(':'))continue;assert(existsSync(resolve(root,owner,dirname(rel),link)),owner+'/'+rel+':'+link);
   }
  }
 }
 assert(!existsSync(resolve(root,'taste-skill/SKILL.md')));
});
function directoryHash(dir){const files=[];function walk(path){for(const e of readdirSync(path,{withFileTypes:true})){const p=resolve(path,e.name);if(e.isDirectory())walk(p);else if(e.isFile())files.push(p);}}walk(dir);const h=createHash('sha256');for(const p of files.sort((a,b)=>relative(dir,a)<relative(dir,b)?-1:relative(dir,a)>relative(dir,b)?1:0)){h.update(relative(dir,p));h.update(Buffer.from([0]));h.update(readFileSync(p));h.update(Buffer.from([0]));}return h.digest('hex');}
test('image manifest records the complete current package',()=>{
 const manifest=JSON.parse(read('marketingskills/MANIFEST.json'));const entry=manifest.skills.find(x=>x.name==='image');assert.equal(entry.sha256,directoryHash(resolve(root,'marketingskills/skills/image')));
 assert(manifest.local_expansions.some(x=>x.source==='Leonxlnx/taste-skill'&&x.commit==='ccbc15639c97057cbfcf32ecebc38ef716e4bb37'&&x.provenance==='skills/image/taste-provenance.json'));
});

test('actual browser overflow oracle accounts for space taken by vertical scrollbars',()=>{
 const line=read('tests/taste-browser/probe.mjs').toString().split(String.fromCharCode(10)).find(x=>x.startsWith('function fitsViewport('));assert(line);
 const fits=vm.runInNewContext('('+line+')');
 assert.equal(fits({scrollWidth:305,clientWidth:305,innerWidth:320}),true);
 assert.equal(fits({scrollWidth:310,clientWidth:305,innerWidth:320}),false);
 assert.equal(fits({scrollWidth:321,clientWidth:305,innerWidth:320}),false);
 const old=vm.runInNewContext('('+line.replace('root.clientWidth','root.innerWidth')+')');
 assert.equal(old({scrollWidth:310,clientWidth:305,innerWidth:320}),true,'negative control demonstrates the former false pass');
});
