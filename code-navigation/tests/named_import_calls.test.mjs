import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractFile } from '/home/prime-agent/.local/share/prime-agent/graft-tools/upstream/dist/graph/extract.js';
import { resolveEdges } from '/home/prime-agent/.local/share/prime-agent/graft-tools/upstream/dist/graph/resolve.js';
function edges(files) {
 const parsed=Object.entries(files).map(([path,text])=>extractFile(path,text,path.endsWith('.tsx')?'tsx':'typescript'));
 return resolveEdges(parsed.flatMap(p=>p.nodes),parsed.flatMap(p=>p.rawEdges));
}
const alpha='export function target() { return 1; }';
const calls=(files)=>edges(files).filter(e=>e.relation==='calls');
for (const ext of ['ts','tsx']) test(`explicit duplicate and alias target: ${ext}`,()=>{
 const result=calls({'alpha.ts':alpha,'beta.ts':alpha,[`gamma.${ext}`]:`import { target } from './alpha.js'; import { target as alias } from './alpha.js'; export function outside(){target();alias();}`,'unrelated.ts':'export function alias() {}'});
 assert.deepEqual(result,[{source:`gamma.${ext}#outside`,target:'alpha.ts#target',relation:'calls',confidence:'extracted'}]);
});
for(const [title,spec,dep] of [
 ['external','external',alpha], ['external-file-lookalike','alpha.ts',alpha], ['missing','./missing.js',alpha],
 ['not-exported','./alpha.js','function target() {}'],
 ['ambiguous','./alpha.js','export function target() {} export function target() {}'],
 ['nested-only','./alpha.js','export function outer() { function target() {} }'],
]) test(`no guessed target: ${title}`,()=>{
 assert.deepEqual(calls({'alpha.ts':dep,'gamma.ts':`import { target } from '${spec}'; export function outside(){ target(); }`}),[]);
});
const shadows={
 plain:'function outside(target:()=>void) { target(); }',
 default:'function outside(target=()=>0) { target(); }',
 destructured:'function outside({target}: any) { target(); }',
 nestedDestructured:'function outside({nested: {target}}: any) { target(); }',
 array:'function outside([target]: any) { target(); }',
 rest:'function outside(...target: any[]) { target(); }',
 destructuredRest:'function outside({...target}: any) { target(); }',
 variable:'function outside(){ const target=()=>0; target(); }',
 destructuredVariable:'function outside(){ const {target}=obj; target(); }',
 renamedVariable:'function outside(){ const {key: target}=obj; target(); }',
 arrayVariable:'function outside(){ const [target]=obj; target(); }',
 variableDefault:'function outside(){ const {target=()=>0}=obj; target(); }',
 catch:'function outside(){ try {} catch(target) { target(); } }',
 catchPattern:'function outside(){ try {} catch({target}) { target(); } }',
 loop:'function outside(){ for(const target of list) { target(); } }',
 loopPattern:'function outside(){ for(const {target} of list) { target(); } }',
 forClassic:'function outside(){ for(let target=()=>0;ready;) { target(); } }',
 localFunction:'function outside(){ function target() {} target(); }',
 localClass:'function outside(){ class target {} target(); }',
 block:'function outside(){ { const target=()=>0; target(); } }',
 moduleBlock:'{ const target=()=>0; target(); }',
 moduleCatch:'try {} catch(target) { target(); }',
 moduleLoop:'for(const target of list) { target(); }',
 anonymous:'function outside(){ consume(({target}:any)=>target()); }',
 inherited:'function outside(target:()=>void){ function inner(){target();} inner(); }',
};
for(const [name,body] of Object.entries(shadows)) test(`shadow suppresses imported and global guesses: ${name}`,()=>{
 const result=calls({'alpha.ts':alpha,'gamma.ts':`import { target } from './alpha.js'; ${body}`});
 assert(!result.some(e=>e.target==='alpha.ts#target'),JSON.stringify(result));
});
test('nested shadow does not suppress sibling scope or value reference',()=>{
 const result=edges({'alpha.ts':alpha,'gamma.ts':`import { target } from './alpha.js'; function outer(){ function inner(target:any){ target(); } target(); } function value(){ return target; }`});
 assert(result.some(e=>e.source==='gamma.ts#outer' && e.target==='alpha.ts#target' && e.relation==='calls'));
 assert(!result.some(e=>e.source==='gamma.ts#outer.inner' && e.target==='alpha.ts#target'));
 assert(result.some(e=>e.source==='gamma.ts#value' && e.target==='alpha.ts#target' && e.relation==='references'));
});
test('unimported same-file call unchanged',()=>{
 assert.deepEqual(calls({'a.ts':'function target() {} function outside(){target();}'}),[{source:'a.ts#outside',target:'a.ts#target',relation:'calls',confidence:'extracted'}]);
});
