// Packaging, source and guidance contracts only; no model calls or efficacy claims.
import test from 'node:test';
import {beforeConceptReuseFile} from './helpers/concept-reuse-snapshot.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','task-observer');
const historical=p=>beforeConceptReuseFile(path.dirname(root),'task-observer/'+p);
const read=p=>historical(p).toString('utf8');
const hash=b=>createHash('sha256').update(b).digest('hex');
const flat=s=>s.replace(/\s+/g,' ');
const contracts={
 'references/script-interfaces.md':[
  'recognizable condition for loading it',
  'before the step that depends on it',
  'absolute script path does not set its working directory',
  'rather than TTY prompts',
  'Never put credentials in flags',
  "Prime's shell handle combines stdout and stderr",
  'do not parse that combined transcript as clean JSON',
  'do not mistake a stale or partial file for the current result',
  'Include truncation/completeness state',
  'is not user authorization',
  'not duplicate-write safety under concurrency',
  'Mechanical checks do not establish agent instruction effectiveness'
 ],
 'references/bundle-validation.md':[
  'with PyYAML available',
  'parsed YAML value',
  'Prime-specific and unknown top-level fields remain accepted',
  'not full Agent Skills conformance',
  'does not interpret `allowed-tools` as permission'
 ],
 'references/prime-skill-maintenance.md':[
  '(script-interfaces.md)', '(bundle-validation.md)',
  'Do not launch synthetic agent trials'
 ]
};
test('selected guidance preserves specific interface and authority boundaries',()=>{
 for(const [p,terms] of Object.entries(contracts)){
  const text=flat(read(p));for(const term of terms)assert(text.includes(term),p+': '+term);
  for(const term of terms)assert(!text.split(term).join('REMOVED').includes(term),p+': '+term);
 }
});
test('pinned documentation license and current payload identities are bound',()=>{
 const pr=JSON.parse(read('agentskills-provenance.json'));
 assert.equal(pr.repository,'https://github.com/agentskills/agentskills');
 assert.equal(pr.commit,'69ef37e9424c0a7ea9dd2293b559e43ec8176379');
 assert.equal(pr.license,'licenses/agentskills-CC-BY-4.0.txt');
 assert.equal(hash(read(pr.license)),pr.license_sha256);
 assert(read(pr.license).includes('Attribution 4.0 International'));
 assert.equal(pr.sources.length,4);assert(pr.files.length>=6);
 for(const s of pr.sources){
  assert.match(s.sha256,/^[a-f0-9]{64}$/);assert.match(s.git_blob_sha,/^[a-f0-9]{40}$/);
  assert.equal(s.url,'https://github.com/agentskills/agentskills/blob/'+pr.commit+'/'+s.path);
 }
 for(const f of pr.files){
  const target=path.resolve(root,f.path);assert(target.startsWith(root+path.sep));
  const b=historical(f.path);assert.equal(hash(b),f.sha256,f.path);assert.equal(b.length,f.bytes);
 }
});
test('new maintenance routes and local documentation links resolve',()=>{
 const pr=JSON.parse(read('agentskills-provenance.json'));
 for(const f of pr.files.filter(f=>f.path.endsWith('.md'))){
  const text=read(f.path).replace(/```[\s\S]*?```/g,'');
  for(const [,href] of text.matchAll(/\]\(([^)]+)\)/g)){
   if(/^(https?:|#|mailto:)/.test(href))continue;
   const target=path.resolve(root,path.dirname(f.path),href.split('#')[0]);
   assert(target.startsWith(root+path.sep),href);assert(fs.statSync(target).isFile(),href);
  }
 }
});
