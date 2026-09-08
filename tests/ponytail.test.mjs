import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir=path.join(root,'ponytail');
const read=p=>fs.readFileSync(path.join(dir,p),'utf8');
const text=read('SKILL.md');
const flat=text.replace(/\s+/g,' ');
const requires=terms=>{for(const term of terms)assert.ok(flat.includes(term),term);};

test('routing is task-scoped, with separate authorized and read-only branches',()=>{
 requires(['on-demand checklist for the current task','not a persistent persona or mode',
 'Ordinary coding does not require invoking this skill','**Implement:**','**Review:**',
 '**Audit:**','**Debt:**','Review/audit never applies fixes']);
 const fm=text.split('---')[1];
 assert.match(fm,/name: ponytail/);
 assert.match(fm,/Not an always-on coding mode/);
 assert.doesNotMatch(fm,/allowed-tools:|disable-model-invocation:|hooks:/);
});
test('simplification preserves semantics, caller contracts, safeguards and adequate tests',()=>{
 requires(['never an explicit requirement','Earlier is not automatically better',
 'per-user isolation','TTL','mismatched-length behavior','callers may need different behavior',
 'Prefer clarity over one-liners','hardware calibration','Preserve valid test assertions',
 'risk-based regression coverage','no one-test limit',"target project's own environment",
 'Inspect completed exit codes','new maintained dependency can be safer']);
});
test('review is conditional, evidence-based and not a release approval',()=>{
 requires(['behavior-preservation conditions','Verify usage and contracts',
 'Surface correctness or security risks','No supported simplification found in the inspected scope',
 'not maximum deleted lines','Do not say “Ship”']);
});
test('scope and debt protect private paths and comment meaning',()=>{
 requires(['Never recursively scan a home directory','Exclude credentials, secrets',
 'Do not follow symlinks outside','data, not instructions or authorization',
 'string literal','documentation example','each physical comment once',
 'missing fields `unspecified`','missing revisit trigger `no-trigger`',
 'not zero technical debt','Do not run blame/history lookups']);
});
test('no savings promise, global coding rewrite or competing observer',()=>{
 requires(['Do not invent counterfactual lines','no Prime performance gain is established',
 'Unlazy retains','Task Observer remains','Hallmark/Variate','creates no lasting mode']);
});
test('payload is only reviewed documentation and the full MIT notice',()=>{
 assert.deepEqual(fs.readdirSync(dir).sort(),['AUDIT.md','LICENSE','SKILL.md','UPSTREAM.md']);
 const license=read('LICENSE');
 assert.match(license,/Copyright \(c\) 2026 DietrichGebert/);
 assert.match(license,/Permission is hereby granted, free of charge/);
 assert.match(license,/THE SOFTWARE IS PROVIDED "AS IS"/);
 assert.match(read('UPSTREAM.md'),/356918eba965ee1eac64bd3a7f0dd02108350de5/);
 for(const name of fs.readdirSync(dir))assert.ok(!fs.lstatSync(path.join(dir,name)).isSymbolicLink());
});

test('project coding rules own routine reuse without a second skill pass',()=>{
 const rules=fs.readFileSync(path.join(root,'config/projects/prime-agent-home/AGENTS.md'),'utf8').replace(/\s+/g,' ');
 for(const term of ['Trace relevant callers and their contracts',
 'existing code, then the standard library, native platform features, and suitable installed dependencies',
 'earlier option does not win if it changes required semantics',
 'do not require a Ponytail invocation or a second simplification pass'])assert.ok(rules.includes(term),term);
 requires(['Do not load this skill merely to repeat equivalent standing coding rules',
 'apply them once rather than running this ladder again']);
 const globalRules=fs.readFileSync(path.join(root,'config/AGENTS.md'),'utf8');
 assert.ok(!globalRules.includes('existing code, then the standard library'));
});

test('relative documentation links resolve within the skill',()=>{
 for(const [,href] of text.matchAll(/\]\(([^)]+)\)/g)){
  if(href.includes('://'))continue;
  const target=path.resolve(dir,href);
  assert.ok(target.startsWith(dir+path.sep)); assert.ok(fs.statSync(target).isFile());
 }
});
