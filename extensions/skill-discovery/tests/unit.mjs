import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createCatalog, metadataFingerprint, selectSkills, discover, rewritePayload, GUIDANCE } from '../catalog.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../../..');
const cohort = JSON.parse(readFileSync(resolve(here, '../cohort.json')));
const nativeRoot = process.env.PRIME_AGENT_DIST ?? '/home/prime-agent/.local/lib/node_modules/prime-agent/dist';
const { loadSkills, formatSkillsForPrompt } = await import(`${nativeRoot}/index.js`);
const paths = ['marketingskills/skills', 'archify', 'code-navigation', 'hallmark', 'ponytail', 'task-observer', 'unlazy', 'variate'].map(p => resolve(root, p));
const skills = loadSkills({ cwd: root, agentDir: root, includeDefaults: false, skillPaths: paths }).skills;
const catalog = createCatalog(skills);
const names = items => new Set(items.map(s => s.name));
const fixturesPath = process.env.SKILL_DISCOVERY_FIXTURES ?? resolve(here, 'fixtures.json');

function synthetic(name, dir, overrides = {}) {
  const filePath = join(dir, `${name}.md`);
  writeFileSync(filePath, '# Synthetic metadata-only fixture\n');
  return { name, filePath, baseDir: dir, kind: 'markdown', description: 'Fixture description',
    disableModelInvocation: false, sourceInfo: {path:filePath, source:'fixture', scope:'temporary', origin:'top-level'}, ...overrides };
}

test('reviewed cohort15 matches native parser and source identity', () => {
  assert.equal(cohort.skills.length, 15);
  for (const entry of cohort.skills) {
    const skill = skills.find(s => s.name === entry.name);
    assert(skill, entry.name);
    assert.equal(metadataFingerprint(skill), entry.fingerprint, entry.name);
    assert.equal(skill.filePath, resolve(root, entry.path));
  }
  const selected = selectSkills(catalog, 'Fix off-by-one loop', cohort, root);
  for (const entry of cohort.skills) assert(!names(selected).has(entry.name), entry.name);
  for (const skill of catalog.skills.filter(s => !cohort.skills.some(c => c.name === s.name))) assert(names(selected).has(skill.name));
});

test('metadata/path/Python changes fail visible; native snapshot unmutated', () => {
  const original = skills.find(s => s.name === 'ads');
  const before = JSON.stringify(skills);
  const unknown = {...original,name:'new-optional-skill'};
  assert(names(selectSkills(createCatalog([unknown]), 'code', cohort, root)).has(unknown.name));
  for (const change of [{newNativeMetadata:'unreviewed'}, {description:original.description+' NEW'}, {filePath:original.filePath+'.override'},
    {baseDir:original.baseDir+'.override'}, {kind:'python',python:{importName:'ads',packagePath:'/fixture',pyprojectPath:'/fixture/pyproject.toml'}}]) {
    const changed = createCatalog([{...original,...change}]);
    assert(names(selectSkills(changed, 'code', cohort, root)).has('ads'));
  }
  selectSkills(catalog, 'ads', cohort, root);
  assert.equal(JSON.stringify(skills), before);
  assert.throws(() => createCatalog([original,original]), /Invalid/);
  assert.throws(() => createCatalog([{...original,kind:'unknown'}]), /Invalid/);
});

test('frozen lower-bound routing (not efficacy benchmark)', () => {
  const bytes = readFileSync(fixturesPath);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), '53e905b122cbad819afb0d44068df241c6cf948efb34b6c49468636b32757783');
  const fixtures = JSON.parse(bytes).fixtures;
  assert.equal(fixtures.length,35);
  let exercised = 0;
  for (const fixture of fixtures) {
    if (fixture.mode && !['explicit_native_invocation','exact_name_lookup','follow_up_after_code_map','skill_referenced_dependency'].includes(fixture.mode)) continue;
    const visible = names(selectSkills(catalog, fixture.query, cohort, root));
    const response = discover(catalog, {action:'search',query:fixture.query,limit:1});
    assert.deepEqual(response.fallback,{action:'full'});
    for (const required of fixture.required_skills) assert(visible.has(required) || names(response.skills).has(required), `${fixture.id}: ${required}`);
    exercised++;
  }
  assert(exercised >= 24);
  console.log(`Frozen routing subset exercised: ${exercised}; lifecycle/native cases belong to independent native suite.`);
});

test('search is union without cutoff; exact lookup is independent', () => {
  const response = discover(catalog,{action:'search',query:'AEO PPC GA4 JSON-LD ad headlines sales one-pager video image',limit:1});
  for (const name of ['ai-seo','ads','analytics','schema','ad-creative','sales-enablement','video','image']) assert(names(response.skills).has(name),name);
  const exact = discover(catalog,{action:'get',name:'ad-creative'});
  assert.equal(exact.skills[0].name,'ad-creative');
  exact.skills[0].description = 'CHANGED RESPONSE';
  assert.notEqual(discover(catalog,{action:'get',name:'ad-creative'}).skills[0].description, 'CHANGED RESPONSE');
  for (const name of ['AD-CREATIVE','../ad-creative','/etc/passwd','not-a-skill']) assert.equal(discover(catalog,{action:'get',name}).status,'not_found');
  const zero = discover(catalog,{action:'search',query:'water boiling point'});
  assert.equal(zero.skills.length,0); assert.deepEqual(zero.fallback,{action:'full'});
});

test('complete stable pagination and stale cursor refusal', () => {
  let cursor, combined=[];
  do {
    const response=discover(catalog,{action:'list',limit:3,...(cursor?{cursor}:{})});
    assert.equal(response.status,'ok');
    combined.push(...response.skills); cursor=response.nextCursor;
    assert.equal(response.complete,cursor===null);
  } while(cursor);
  assert.deepEqual(combined,catalog.skills);
  const first=discover(catalog,{action:'full',limit:1});
  assert.equal(first.skills.length,1); assert(!first.complete);
  assert.equal(discover(createCatalog(skills),{action:'list',cursor:first.nextCursor}).status,'stale_cursor', 'new native snapshot invalidates old cursors even with unchanged metadata');
  assert.equal(discover(catalog,{action:'list',cursor:'broken'}).status,'stale_cursor');
  assert.equal(discover(catalog,{action:'list',limit:101}).status,'invalid_request');
});

test('disabled entries never exposed; read-time deletion is unavailable', () => {
  const dir=mkdtempSync(join(tmpdir(),'skill-discovery-unit-'));
  try {
    const allowed=synthetic('allowed',dir), hidden=synthetic('hidden',dir,{disableModelInvocation:true});
    const hiddenPython=synthetic('hidden-python',dir,{kind:'python',disableModelInvocation:true,python:{importName:'hidden_python',packagePath:dir,pyprojectPath:join(dir,'pyproject.toml')}});
    const cat=createCatalog([allowed,hidden,hiddenPython]);
    for(const action of ['search','get','list','full']) {
      const response=discover(cat,{action,query:'hidden',name:'hidden'});
      assert(!response.skills.some(s=>s.disableModelInvocation));
      assert(!JSON.stringify(response.skills).includes('hidden'));
    }
    assert.equal(discover(cat,{action:'get',name:'allowed'}).status,'ok');
    rmSync(allowed.filePath);
    assert.equal(discover(cat,{action:'get',name:'allowed'}).status,'unavailable');
    assert.equal(discover(cat,{action:'full'}).status,'unavailable');
    assert.equal(discover(undefined,{action:'full'}).status,'unavailable');
  } finally {rmSync(dir,{recursive:true,force:true});}
});

test('late replacement is immutable, uniquely matched and identity/tool/API gated', () => {
  const fullFragment=formatSkillsForPrompt(skills);
  const selectedNames=names(selectSkills(catalog,'Fix the loop',cohort,root));
  const selectedFragment=formatSkillsForPrompt(skills.filter(s=>selectedNames.has(s.name)));
  const payload={instructions:'LATEST POLICY\n'+fullFragment+'\nLATEST SUFFIX',prompt_cache_key:'session-A',input:[{role:'user',content:'unchanged'}],tools:[{type:'function',name:'discover_skills'}],model:'fixture',unknown:{keep:true}};
  const options={api:'openai-codex-responses',sessionId:'session-A',systemPrompt:payload.instructions,fullFragment,selectedFragment,activeTools:['discover_skills'],allowed:true};
  const before=structuredClone(payload), output=rewritePayload(payload,options);
  assert(output); assert.deepEqual(payload,before);
  assert.equal(output.instructions,'LATEST POLICY\n'+selectedFragment+'\n\n'+GUIDANCE+'\nLATEST SUFFIX');
  for(const key of Object.keys(payload).filter(k=>k!=='instructions')) assert.equal(output[key],payload[key]);
  for(const option of [{api:'anthropic-messages'},{sessionId:'session-B'},{systemPrompt:'stale'},{activeTools:[]},{allowed:false},{fullFragment:''}]) assert.equal(rewritePayload(payload,{...options,...option}),undefined);
  for(const change of [{prompt_cache_key:'child-session'},{tools:[]},{input:{}},{instructions:null}]) assert.equal(rewritePayload({...payload,...change},options),undefined);
  for(const instructions of ['missing',fullFragment+fullFragment]) assert.equal(rewritePayload({...payload,instructions},{...options,systemPrompt:instructions}),undefined);
});


test('native-loaded extension lifecycle isolates IDs and full/retry fail open', async () => {
  const {discoverAndLoadExtensions} = await import(`${nativeRoot}/index.js`);
  const dir=mkdtempSync(join(tmpdir(),'skill-discovery-loader-'));
  try {
    const loaded=await discoverAndLoadExtensions([resolve(here,'../index.ts')],dir,join(dir,'agent'));
    assert.deepEqual(loaded.errors,[]);
    const extension=loaded.extensions[0];
    loaded.runtime.getActiveTools=()=>['discover_skills'];
    const emit=async(name,event,ctx)=>{
      let result;
      for(const handler of extension.handlers.get(name)??[]) result=await handler(event,ctx);
      return result;
    };
    const prompt='LATEST POLICY'+formatSkillsForPrompt(skills)+'LATEST SUFFIX';
    const context=id=>({cwd:root,sessionManager:{getSessionId:()=>id},model:{api:'openai-codex-responses'},getSystemPrompt:()=>prompt});
    const a=context('A'),b=context('B');
    const start=ctx=>emit('before_agent_start',{prompt:'Fix the loop',systemPrompt:prompt,systemPromptOptions:{skills}},ctx);
    const tool=extension.tools.get('discover_skills').definition;
    const get=ctx=>tool.execute('fixture',{action:'get',name:'ads'},undefined,undefined,ctx);
    const payload=id=>({instructions:prompt,prompt_cache_key:id,input:[],tools:[{type:'function',name:'discover_skills'}]});
    for(const lifecycle of ['session_start','session_before_switch','session_before_fork','session_before_tree','session_tree','session_before_compact','session_compact','session_before_refine','session_shutdown']) {
      assert.equal(await start(a),undefined);
      await start(b);
      const original=await get(a);
      await emit(lifecycle,{},b);
      const after=await get(a);
      assert.deepEqual(after,original,`${lifecycle} B must not invalidate A`);
      assert.equal((await get(b)).details.status,'unavailable');
      const rewritten=await emit('before_provider_request',{payload:payload('A')},a);
      assert(rewritten,`${lifecycle} B must not consume A selection`);
      assert.equal(await emit('before_provider_request',{payload:payload('A')},a),undefined,'second request defaults full');
    }
    await start(a);
    const full=await tool.execute('full',{action:'full'},undefined,undefined,a);
    assert.equal(full.details.status,'ok');
    assert.equal(await emit('before_provider_request',{payload:payload('A')},a),undefined);
    await start(a);
    assert.equal(await emit('before_provider_request',{payload:payload('INLINE-CHILD')},a),undefined);
    await start(a);
    await emit('agent_end',{},a);
    assert.equal(await emit('before_provider_request',{payload:payload('A')},a),undefined);
  } finally {rmSync(dir,{recursive:true,force:true});}
});
