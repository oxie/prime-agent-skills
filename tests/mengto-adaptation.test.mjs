import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {previousMengtoSkill} from './helpers/mengto-snapshot.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(resolve(root,p));
const sha=b=>createHash('sha256').update(b).digest('hex');
const routeRecords={"canvas-effects": {"path": "SKILL.md", "previous": {"bytes": 6697, "sha256": "a6268ba4e5c92eb4caa2feb80d532705d087c548d61f2b62effc30990c3eb1fe"}, "addition": {"bytes": 457, "sha256": "78dac02e065b9ce0496064f973b725b27fa49f21827497830e1bb28ba76709e2"}, "current": {"bytes": 7154, "sha256": "2e71c43709ba37b11b977a07706470c5e3f58317e92bb8d3f067f24d09a1d1ee"}}, "cinematic-ui": {"path": "SKILL.md", "previous": {"bytes": 8121, "sha256": "1d62102bf7ed0dca73c254961ab44ea761d7c0e7d5b0e6d5cdbe6eda361d4a82"}, "addition": {"bytes": 325, "sha256": "d5f1790c664cfa85d3ecb89939175a7af1d93d06552807ae3e03d2ba4af4ee00"}, "current": {"bytes": 8446, "sha256": "ae748ac24fe63ac8dc4c4c4d57551e453767bf1bbb64b6c4eed3becb29b328d1"}}, "hallmark": {"path": "SKILL.md", "previous": {"bytes": 9000, "sha256": "44f66f48f6f367a595653f23e774bd5fcde4ce67c3a10d181f35a10fe1869833"}, "addition": {"bytes": 446, "sha256": "5873c91b1c2d524d9edf68c43a23f66df4baf585b4a89d7b15ca43c89ccac5b4"}, "current": {"bytes": 9446, "sha256": "d63b9421aeed3022b99ddabe9aeacb2b594736f9095909193e60ca876b53125b"}}, "marketingskills/skills/image": {"path": "SKILL.md", "previous": {"bytes": 16146, "sha256": "7711d1a43af22ec62da8a33e3252d5ea37e2fd5a90053a83144189d3bd26ee82"}, "addition": {"bytes": 329, "sha256": "3b8e382fca9242366792fe2cf42da31cea7f93594064cd3d5b82370a2aed242b"}, "current": {"bytes": 16475, "sha256": "0b1a13a9db01ef82d01f02cfc61fc84d1f3718234ace98b8fb30f92354f0bdcb"}}};
const pin="321c769739b823de5eb94eb3a52aa1974fe783a2";
const manifests=Object.fromEntries(Object.keys(routeRecords).map(o=>[o,JSON.parse(read(o+'/mengto-provenance.json'))]));
function routing(body,r){assert.equal(body.length,r.current.bytes);assert.equal(sha(body),r.current.sha256);assert.equal(sha(body.subarray(0,r.previous.bytes)),r.previous.sha256);assert.equal(sha(body.subarray(r.previous.bytes)),r.addition.sha256);assert.equal(body.length-r.previous.bytes,r.addition.bytes);}
test('four exact current routes and immutable earlier snapshots; mutations cannot hide as additions',()=>{
 for(const [o,r] of Object.entries(routeRecords)){const b=read(o+'/SKILL.md');routing(b,r);assert.deepEqual(manifests[o].routing,r);
 for(const i of [0,r.previous.bytes,b.length-1]){const bad=Buffer.from(b);bad[i]^=1;assert.throws(()=>routing(bad,r));}
 assert.throws(()=>routing(Buffer.concat([b,Buffer.from('extra')]),r));}
});
test('every selected source, full MIT and authored payload is byte bound',()=>{
 for(const [o,p] of Object.entries(manifests)){assert.equal(p.commit,pin);assert.equal(p.repository,'https://github.com/MengTo/Skills');assert(p.sources.length>=3);
 for(const s of p.sources){assert.match(s.git_blob,/^[a-f0-9]{40}$/);assert.match(s.sha256,/^[a-f0-9]{64}$/);assert(s.bytes>0);}
 assert.equal(sha(read(o+'/'+p.license.path)),p.license.sha256);assert(read(o+'/'+p.license.path).toString().includes('Copyright (c) 2026 Meng To'));
 for(const [rel,rec] of Object.entries(p.adapted_files)){const b=read(o+'/'+rel);assert.equal(sha(b),rec.sha256,rel);assert.equal(b.length,rec.bytes,rel);}
 }
});
test('snapshot helper checks full current file before returning exact historical bytes',()=>{
 const temp=mkdtempSync(resolve(tmpdir(),'mengto-snapshot-'));
 try{for(const o of ['hallmark','cinematic-ui','canvas-effects']){mkdirSync(resolve(temp,o));const b=read(o+'/SKILL.md');writeFileSync(resolve(temp,o,'SKILL.md'),b);writeFileSync(resolve(temp,o,'mengto-provenance.json'),JSON.stringify(manifests[o]));assert.equal(sha(previousMengtoSkill(temp,o)),routeRecords[o].previous.sha256);writeFileSync(resolve(temp,o,'SKILL.md'),Buffer.concat([b,Buffer.from('unexpected')]));assert.throws(()=>previousMengtoSkill(temp,o));}assert.throws(()=>previousMengtoSkill(temp,'unknown'));}finally{rmSync(temp,{recursive:true,force:true});}
});
const clauses={
 'hallmark/references/interaction-evidence.md':['Source-confirmed','IO is a visibility trigger','hypothetical','cancel()','unknown'],
 'hallmark/references/originality-evidence.md':['Meaningful differences','distinctive','not a legal verdict','history was not checked'],
 'marketingskills/skills/image/references/brand-worlds.md':['Human ritual','FOLDROOM','TIDENOTE','COMMONS PRESS','Image A','Image B','not numeric'],
 'canvas-effects/references/motion-profiling.md':['within the same','pseudo-elements','WeakMap','testKey','Full navigation destroys a realm','leaking negative control']
};
function checkClauses(t,c){for(const x of c)assert(t.includes(x),x);}
test('methods retain concrete mechanisms and evidence boundaries with deletion controls',()=>{for(const [p,c]of Object.entries(clauses)){const t=read(p).toString();checkClauses(t,c);for(const x of c)assert.throws(()=>checkClauses(t.replaceAll(x,''),c));}});
test('actual profiler snippet distinguishes ordinary input.type and stable anonymous handles',()=>{
 const code=read('canvas-effects/references/motion-profiling.md').toString().match(/```js\n([\s\S]*?)```/)[1];
 class Element {constructor(type){this.type=type;this.id='';this.isConnected=true;}getBoundingClientRect(){return{top:0,left:0,bottom:10,right:10};}}
 const el=new Element('text'),button=new Element('button');
 const animation=target=>({id:'',playState:'running',effect:{target,getComputedTiming:()=>({progress:.5})}});
 const a=animation(el),b=animation(button),c=animation({element:el,type:'::before'});
 const context={Element,WeakMap,Set,innerWidth:100,innerHeight:100,getComputedStyle:(e,p)=>{assert(!p||p==='::before');return{display:'block',visibility:'visible',opacity:'1'};}};
 vm.createContext(context);vm.runInContext(code+'\nthis.sample=sampleMotion;',context);
 const r=context.sample({getAnimations:()=>[a,b,c]}),r2=context.sample({getAnimations:()=>[b,a,c]});
 assert.equal(r[0].pseudo,null);assert.equal(r[1].pseudo,null);assert.equal(r[2].pseudo,'::before');assert.notEqual(r[0].testKey,r[1].testKey);assert.equal(r[0].testKey,r2[1].testKey);assert.equal(r[1].testKey,r2[0].testKey);
});
test('new references and owner routes resolve without a new skill or provider',async()=>{
 const native=process.env.PRIME_NATIVE_ROOT||resolve(process.env.HOME,'.local/lib/node_modules/prime-agent');const {loadSkillsFromDir}=await import(pathToFileURL(resolve(native,'dist/core/skills.js')).href);
 for(const [o,p]of Object.entries(manifests)){const loaded=loadSkillsFromDir({dir:resolve(root,o),source:'test'});assert.equal(loaded.skills.length,1);assert.deepEqual(loaded.diagnostics,[]);assert.equal(loaded.skills[0].disableModelInvocation,false);
 for(const rel of Object.keys(p.adapted_files).filter(x=>x.endsWith('.md'))){for(const m of read(o+'/'+rel).toString().matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){const link=m[1].split('#')[0];if(!link||/^[a-z]+:/i.test(link))continue;assert(existsSync(resolve(root,o,dirname(rel),link)),o+'/'+rel+':'+link);}}
 }
 assert(!existsSync(resolve(root,'mengto/SKILL.md')));
});

test('browser mask oracle accepts the measured two-layer serialization and rejects missing/wrong masks',()=>{
 const code=read('tests/mengto-browser/surfaces.mjs').toString().split('const output=')[0];
 const check=vm.runInNewContext(code+';maskMatches');
 const valid={maskComposite:'exclude, exclude',maskImage:'linear-gradient(white,white), linear-gradient(white,white)'};
 assert.equal(check(valid),true);
 for(const maskComposite of ['','add, add','exclude, add','exclude'])assert.equal(check({...valid,maskComposite}),false);
 for(const maskImage of ['none','linear-gradient(white,white)'])assert.equal(check({...valid,maskImage}),false);
});
