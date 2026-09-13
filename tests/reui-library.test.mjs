import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const library=path.join(root,'reui-library');const kit=path.join(library,'assets/starter');
const read=p=>fs.readFileSync(path.join(library,p),'utf8');
const sha=b=>createHash('sha256').update(b).digest('hex');
test('real source library stays separate from demo and advanced catalogue',()=>{
 const index=read('assets/starter/src/index.ts');
 for(const name of ['ProfileForm','ResourceTable','DataState','Panel','Button','Card','Field','Input','Empty','Table'])assert.ok(index.includes(name),name);
 assert.ok(!index.includes('demo/')&&!index.includes('styles.css'));
 const selection=JSON.parse(read('assets/starter/source-selection.json'));
 assert.equal(selection.upstream.commit,'8a2c701eaf95729f238274d5ce2555a5a8bd23e7');
 assert.equal(selection.files.filter(f=>f.relationship==='adapted-source-body').length,6);
 for(const f of selection.files){assert.ok(fs.statSync(path.join(kit,f.local_file)).isFile());for(const s of f.sources){assert.match(s.sha256,/^[a-f0-9]{64}$/);assert.match(s.git_blob_sha,/^[a-f0-9]{40}$/);}}
 assert.equal(fs.existsSync(path.join(kit,'node_modules')),false);assert.equal(fs.existsSync(path.join(kit,'dist')),false);
});
test('locked native setup is explicit and has no lifecycle installer',()=>{
 const p=JSON.parse(read('assets/starter/package.json')),l=JSON.parse(read('assets/starter/package-lock.json'));
 assert.equal(p.private,true);assert.equal(p.type,'module');assert.equal(p.engines.node,'^22.22.2 || ^24.15.0 || >=26.0.0');
 assert.equal(l.packages[''].engines.node,p.engines.node);assert.deepEqual(l.packages[''].dependencies,p.dependencies);assert.deepEqual(l.packages[''].devDependencies,p.devDependencies);
 for(const k of ['preinstall','install','postinstall','prepare'])assert.ok(!p.scripts[k]);
 assert.ok(p.scripts.build.startsWith('tsc --noEmit &&'));assert.ok(p.scripts.preview.includes('127.0.0.1')&&p.scripts.preview.includes('--strictPort'));
 for(const [name,version] of Object.entries({...p.dependencies,...p.devDependencies})){assert.match(version,/^\d+\.\d+\.\d+$/);assert.equal(l.packages['node_modules/'+name].version,version);}
});
test('full source notices and final versioned payload hashes are preserved',()=>{
 const p=JSON.parse(read('provenance.json'));
 for(const f of p.files)assert.equal(sha(fs.readFileSync(path.join(library,f.path))),f.sha256,f.path);
 assert.ok(p.files.some(f=>f.path==='assets/starter/package-lock.json'));
 for(const [p,owner] of [['assets/starter/licenses/ReUI-MIT.txt','2025 Keenthemes Inc'],['assets/starter/licenses/shadcn-MIT.txt','2023 shadcn']]){const s=read(p);assert.ok(s.includes(owner));assert.ok(s.includes('THE SOFTWARE IS PROVIDED "AS IS"'));}
 assert.ok(read('assets/starter/THIRD_PARTY.md').includes('premium products'));
});
test('scope keeps redesign, real callbacks, host tokens and RSC boundary explicit',()=>{
 const s=read('SKILL.md'),r=read('assets/starter/README.md');
 for(const phrase of ['not a mandatory design system','redesign','local memory','explicit client component','No MCP','npm ci --ignore-scripts'])assert.ok(s.replace(/\s+/g,' ').includes(phrase),phrase);
 assert.ok(r.includes('unlayered'));assert.ok(r.includes('not a continuously'));assert.ok(r.includes('Server Component'));
 const css=read('assets/starter/src/styles.css');assert.ok(!/--color-(foreground|background|primary|muted-foreground|muted)\s*:/.test(css));assert.ok(css.includes('--color-reui-primary:'));
 const profile=read('assets/starter/src/compositions/profile-form.tsx');assert.ok(profile.includes('validity.typeMismatch'));assert.ok(profile.includes('await onSave(next)'));
 const tests=read('assets/starter/tests/compositions.test.tsx');assert.ok(tests.includes('a@intranet'));assert.ok(tests.includes('originalNodes'));assert.ok(tests.includes('descending'));
});
test('relative library docs and catalogue link resolve',()=>{
 for(const file of ['SKILL.md','README.md','UPSTREAM.md','VERIFICATION.md','assets/starter/README.md','assets/starter/THIRD_PARTY.md']){
  for(const [,href] of read(file).matchAll(/\]\(([^)]+)\)/g)){
   if(/^(https?:|#)/.test(href))continue;const resolved=path.resolve(library,path.dirname(file),href.split('#')[0]);assert.ok(resolved.startsWith(library+path.sep));assert.ok(fs.statSync(resolved).isFile(),href);
  }
 }
 assert.ok(fs.readFileSync(path.join(root,'README.md'),'utf8').includes('| `reui-library` |'));
 assert.ok(fs.readFileSync(path.join(root,'hallmark/README.md'),'utf8').includes('../reui-library/README.md'));
});
test('native discovery loads one on-demand library without executing its assets',async()=>{
 const native=process.env.PRIME_NATIVE_ROOT;assert.ok(native);
 const {loadSkills,formatSkillsForPrompt}=await import(pathToFileURL(path.join(native,'dist/core/skills.js')));
 const result=loadSkills({cwd:process.cwd(),agentDir:path.dirname(root),includeDefaults:true,skillPaths:[]});
 const selected=result.skills.filter(s=>s.name==='reui-library');assert.equal(selected.length,1);assert.equal(selected[0].filePath,path.join(library,'SKILL.md'));
 const prompt=formatSkillsForPrompt(selected);assert.ok(prompt.includes('source-owned React UI components'));assert.ok(!prompt.includes('await onSave'));assert.ok(!prompt.includes('createRoot'));
});
console.log('Packaging/source/native metadata checks. Runtime behavior and browser evidence have separate recorded results.');
