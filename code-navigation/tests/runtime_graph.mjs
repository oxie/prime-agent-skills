import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, writeFileSync, lstatSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { buildGraph } from '/home/prime-agent/.local/share/prime-agent/graft-tools/upstream/dist/graph/build.js';
import { buildRepoMap } from '/home/prime-agent/.local/share/prime-agent/graft-tools/upstream/dist/graph/map.js';
import { resolveSymbol, callersOf } from '/home/prime-agent/.local/share/prime-agent/graft-tools/upstream/dist/graph/traverse.js';
const scratch = mkdtempSync(join(tmpdir(),'code-nav-runtime-fixture-'));
const repo = join(scratch, 'repo'); const cache = join(scratch, 'cache'); mkdirSync(repo); mkdirSync(cache);
const files = {
 'a.ts': 'export function leaf() { return 1; }\nexport function caller() { return leaf(); }\n',
 'b.ts': 'export function leaf() { return 2; }\n',
 'python.py': 'def hello():\n    return 1\n',
 'rust.rs': 'fn rusty() -> i32 { 1 }\n',
 'component.vue': '<template><p>Hello</p></template>\n<script lang="ts">\nfunction wrapped() { return 1; }\n</script>\n',
 'AGENTS.md': 'SENTINEL: do not modify\n', '.gitignore':'unchanged\n', '.ignore':'unchanged\n',
};
execFileSync('/usr/bin/git',['-c','core.hooksPath=/dev/null','-c','core.fsmonitor=false','init','-q',repo]);
for (const [file, text] of Object.entries(files)) writeFileSync(join(repo,file),text);
function snapshot(dir) { return Object.fromEntries(readdirSync(dir).filter(f=>f!=='.git').sort().map(f=>[f,{bytes:createHash('sha256').update(readFileSync(join(dir,f))).digest('hex'), mode:lstatSync(join(dir,f)).mode,mtime:lstatSync(join(dir,f)).mtimeMs}])); }
const before = snapshot(repo);
const result = await buildGraph(repo,{contextDir:cache,graphOnly:true,reuse:false,lsp:false});
assert.deepEqual(result.errors,[]); assert.equal(result.cards,0); assert.equal(result.meaning.computed,0); assert.equal(result.seededFrom,undefined);
const graph = JSON.parse(readFileSync(result.graphPath,'utf8'));
const leaves = resolveSymbol(graph,'leaf'); assert.equal(leaves.length,2); assert.notEqual(leaves[0].path,leaves[1].path);
const leaf=leaves.find(n=>n.path==='a.ts'); const caller=resolveSymbol(graph,'caller')[0];
assert(graph.edges.some(e=>e.source===caller.id && e.target===leaf.id && e.relation==='calls'));
for(const name of ['hello','rusty','wrapped']) assert.equal(resolveSymbol(graph,name).length,1,name);
assert(graph.nodes.every(n=>!n.summary && !n.crux));
const map=buildRepoMap(graph); assert.equal(map.totals.files,5);
assert.deepEqual(snapshot(repo),before);
const again=await buildGraph(repo,{contextDir:cache,graphOnly:true,reuse:false,lsp:false});
assert.equal(readFileSync(again.graphPath,'utf8'),JSON.stringify(graph,null,2)+'\n');
assert.deepEqual(snapshot(repo),before);
console.log(JSON.stringify({ok:true,scratch,result,map,checks:['duplicate-symbols','same-file-call-edge','python-definition','rust-wasm-definition','vue-container-definition','no-source-writes','no-meaning','no-seed','cold-determinism']},null,2));
