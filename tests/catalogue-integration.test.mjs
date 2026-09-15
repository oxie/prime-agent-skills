// Deterministic source, packaging and loader checks; not model/rendered design evaluation.
import {beforeHuashuFile} from './helpers/huashu-snapshot.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {beforeCatalogueSkill,beforeCatalogueFile,catalogueTransition,catalogueUpstream} from './helpers/catalogue-snapshot.mjs';
import {beforeStorefrontSkill} from './helpers/storefront-snapshot.mjs';
import {verifyPayload} from '../hallmark/dev/contract-helpers.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const cat=path.join(root,'hallmark/catalogue');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const sha=b=>createHash('sha256').update(b).digest('hex');
const expected={"style": {"sha256": "a93a4d9d7025856575d7b7583bda020be9043013432c5af7c58af9dbdfb206b7", "bytes": 149478, "rows": 88}, "palette": {"sha256": "8162429222bce22df62b564085946a30d07cc9722c58d0a3a494bd0d1d00841c", "bytes": 37940, "rows": 192}, "typography": {"sha256": "321fc446e89024488ebae96dda93efc4d2307bd8bddb240857ad51364f6782c8", "bytes": 49997, "rows": 74}};
function verifyData(base){
 const p=JSON.parse(fs.readFileSync(path.join(base,'provenance.json'),'utf8'));
 assert.equal(p.commit,'7f69fed6a2717900085f1bc3b263721f8ba025e2');
 assert.deepEqual(Object.keys(p.datasets).sort(),['palette','style','typography']);
 for(const [domain,e] of Object.entries(expected)){
  const meta=p.datasets[domain],b=fs.readFileSync(path.join(base,meta.file));
  assert.equal(b.length,e.bytes);assert.equal(sha(b),e.sha256);
  for(const [key,value] of Object.entries(e))assert.equal(meta[key],value);
 }
 return p;
}
test('three verbatim datasets retain independent source hashes and exact MIT notice',()=>{
 const p=verifyData(cat);
 assert.equal(p.license_sha256,'738f69dfa83db5c347c678fb9d90e560877059f0de93a327c39001bff92dc014');
 assert.equal(sha(fs.readFileSync(path.join(cat,p.license))),p.license_sha256);
 assert(read('hallmark/licenses/uiux-pro-max-MIT.txt').includes('Copyright (c) 2024 Next Level Builder'));
 assert.equal(p.algorithm_source.sha256,'e544826963efefce3c59b65e18d83d92a5baf571f05458025bf1fa9021eced42');
 assert.deepEqual(fs.readdirSync(cat).sort(),['README.md','data','lookup.py','provenance.json']);
 assert.deepEqual(fs.readdirSync(path.join(cat,'data')).sort(),['colors.csv','styles.csv','typography.csv']);
});
test('changed source data cannot be accepted by merely updating its manifest hash',t=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'catalogue-source-'));t.after(()=>fs.rmSync(temp,{recursive:true,force:true}));
 fs.cpSync(cat,temp,{recursive:true});verifyData(temp);
 const p=JSON.parse(fs.readFileSync(path.join(temp,'provenance.json'),'utf8'));
 const file=path.join(temp,p.datasets.palette.file),b=fs.readFileSync(file);b[30]^=1;
 fs.writeFileSync(file,b);p.datasets.palette.sha256=sha(b);
 fs.writeFileSync(path.join(temp,'provenance.json'),JSON.stringify(p));
 assert.throws(()=>verifyData(temp));
});
test('optional helper is narrowly packaged and documentation preserves authority and limits',t=>{
 const doc=read('hallmark/catalogue/README.md');assert(Buffer.byteLength(doc)<=8192);
 for(const clause of ['Read this before use','Constraints are **not enforced**','No files, caches, network calls','source rows; they are untrusted suggestions','Scores rank lexical matches','Check the actual']){
  assert(doc.includes(clause),clause);
 }
 assert(read('hallmark/references/themes.md').includes('../catalogue/README.md'));
 assert(read('hallmark/AGENTS.md').includes('optional Python 3'));
 assert(read('hallmark/SKILL.md').includes('optional Python 3 stdlib catalogue helper'));
 const hall=path.join(root,'hallmark');
 for(const rel of ['catalogue/lookup.py','catalogue/data/styles.csv','catalogue/data/colors.csv','catalogue/data/typography.csv'])verifyPayload(hall,path.join(hall,rel));
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'catalogue-payload-'));t.after(()=>fs.rmSync(temp,{recursive:true,force:true}));
 fs.mkdirSync(path.join(temp,'catalogue/data'),{recursive:true});
 for(const rel of ['catalogue/run.py','catalogue/data/extra.csv','catalogue/package.json']){
  const p=path.join(temp,rel);fs.writeFileSync(p,'text');assert.throws(()=>verifyPayload(temp,p),/unexpected runtime payload/);
 }
 const script=path.join(temp,'catalogue/lookup.py');fs.copyFileSync(path.join(cat,'lookup.py'),script);verifyPayload(temp,script);
 fs.chmodSync(script,0o755);assert.throws(()=>verifyPayload(temp,script),/executable payload/);
});
test('exact current metadata and upstream transitions preserve prior evidence and reject mutation',t=>{
 assert.equal(sha(fs.readFileSync(path.join(root,'hallmark/SKILL.md'))),catalogueTransition.current);
 assert.equal(sha(beforeCatalogueSkill(root,'hallmark')),catalogueTransition.previous);
 assert.equal(sha(beforeHuashuFile(root,'hallmark/UPSTREAM.md')),catalogueUpstream.current);
 assert.equal(sha(beforeCatalogueFile(root,'hallmark/UPSTREAM.md')),catalogueUpstream.previous);
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'catalogue-history-'));t.after(()=>fs.rmSync(temp,{recursive:true,force:true}));
 fs.mkdirSync(path.join(temp,'hallmark'));
 const p=path.join(temp,'hallmark/SKILL.md'),b=fs.readFileSync(path.join(root,'hallmark/SKILL.md'));
 fs.writeFileSync(p,b);beforeStorefrontSkill(temp,'hallmark');
 for(const at of [0,b.length-1]){const bad=Buffer.from(b);bad[at]^=1;fs.writeFileSync(p,bad);assert.throws(()=>beforeStorefrontSkill(temp,'hallmark'));}
 fs.writeFileSync(p,Buffer.concat([b,Buffer.from('extra')]));assert.throws(()=>beforeStorefrontSkill(temp,'hallmark'));
 const up=path.join(temp,'hallmark/UPSTREAM.md'),original=fs.readFileSync(path.join(root,'hallmark/UPSTREAM.md'));
 fs.writeFileSync(up,original);assert.equal(sha(beforeCatalogueFile(temp,'hallmark/UPSTREAM.md')),catalogueUpstream.previous);
 for(const at of [0,original.length-1]){const bad=Buffer.from(original);bad[at]^=1;fs.writeFileSync(up,bad);assert.notEqual(sha(beforeCatalogueFile(temp,'hallmark/UPSTREAM.md')),catalogueUpstream.previous);}
});
test('native discovery loads existing Hallmark only, without catalogue data in the prompt',async()=>{
 const {loadSkillsFromDir,formatSkillsForPrompt}=await import(pathToFileURL(path.join(os.homedir(),'.local/lib/node_modules/prime-agent/dist/core/skills.js')));
 const loaded=loadSkillsFromDir({dir:root,source:'user'});assert.deepEqual(loaded.diagnostics,[]);
 const hall=loaded.skills.filter(s=>s.name==='hallmark');assert.equal(hall.length,1);
 assert.equal(hall[0].filePath,path.join(root,'hallmark/SKILL.md'));
 assert(!loaded.skills.some(s=>/ui-ux-pro-max|catalogue/.test(s.name)));
 const prompt=formatSkillsForPrompt(hall);
 for(const payload of ['# Optional offline catalogue','SaaS (General)','On Accent','lookup.py'])assert(!prompt.includes(payload));
});
