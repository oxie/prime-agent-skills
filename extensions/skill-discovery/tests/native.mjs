// Independent acceptance: installed public SDK + real installed Codex serializer; no inference.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const args=Object.fromEntries(process.argv.slice(2).map((v,i,a)=>v.startsWith('--')?[v,a[i+1]?.startsWith('--')?true:a[i+1]??true]:null).filter(Boolean));
const native=args['--native-root']||'/home/prime-agent/.local/lib/node_modules/prime-agent/dist';
const artifacts=path.resolve(args['--artifacts']);
const skillRoot=path.resolve(args['--skills-root']);
const extension=args['--extension']&&path.resolve(args['--extension']);
const fixtureFile=args['--fixtures']||new URL('./fixtures.json',import.meta.url);
fs.mkdirSync(artifacts,{recursive:true});
const frozen=fs.readFileSync(fixtureFile);
assert.equal(crypto.createHash('sha256').update(frozen).digest('hex'),'53e905b122cbad819afb0d44068df241c6cf948efb34b6c49468636b32757783');
const fixtures=JSON.parse(frozen);
process.env.PRIME_AGENT_CODING_AGENT_DIR=path.join(artifacts,'isolated-global-agent');
const sdk=await import(path.join(native,'index.js'));
const codex=await import(path.join(native,'../node_modules/@earendil-works/pi-ai/dist/providers/openai-codex-responses.js'));
const sessions=[],checks=[],captures=[],measurements=[],fixtureResults=[],responses=[],errors=[];
let currentCapture=null;const sessionOwners=new Map();
const clone=x=>JSON.parse(JSON.stringify(x));
const bytes=x=>Buffer.byteLength(typeof x==='string'?x:JSON.stringify(x),'utf8');
const freeze=x=>{if(x&&typeof x==='object'){for(const v of Object.values(x))freeze(v);Object.freeze(x);}return x;};
const names=x=>x.map(s=>s.name);
const visible=x=>x.filter(s=>!s.disableModelInvocation);
const write=(p,s)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,s);};
const save=(p,x)=>write(path.join(artifacts,p),JSON.stringify(x,null,2)+'\n');
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const sourcePaths=[new URL(import.meta.url),fixtureFile,path.join(native,'index.js'),path.join(native,'core/agent-session-services.js'),path.join(native,'core/agent-session.js'),path.join(native,'core/extensions/loader.js'),path.join(native,'core/extensions/runner.js'),path.join(native,'../node_modules/@earendil-works/pi-ai/dist/providers/openai-codex-responses.js'),...(extension?[extension,path.join(path.dirname(extension),'catalog.mjs'),path.join(path.dirname(extension),'cohort.json')]:[])].filter(p=>fs.existsSync(p));
const sourceHashes=sourcePaths.map(p=>({path:String(p),sha256:sha(p)}));
save('source-hashes-start.json',{node:process.version,files:sourceHashes});
const syntheticToken='fixture.'+Buffer.from(JSON.stringify({'https://api.openai.com/auth':{chatgpt_account_id:'synthetic-native-acceptance-only'}})).toString('base64url')+'.not-a-signature';
// No real authentication is read. This is the only installed serializer transport.
globalThis.fetch=async (url,opts)=>{
 assert(currentCapture,'Unexpected fetch blocked');
 assert.equal(opts.method,'POST');
 assert.equal(String(url),'https://native-acceptance.invalid/codex/responses');
 currentCapture.serialized=opts.body;currentCapture.final=JSON.parse(opts.body);
 let events=[{type:'response.created',response:{id:'resp_fixture'}},{type:'response.output_item.added',output_index:0,item:{type:'message',id:'msg_fixture',role:'assistant',content:[]}},{type:'response.content_part.added',output_index:0,content_index:0,part:{type:'output_text',text:''}},{type:'response.output_text.delta',output_index:0,content_index:0,delta:'FIXTURE_ONLY'},{type:'response.output_item.done',output_index:0,item:{type:'message',id:'msg_fixture',role:'assistant',content:[{type:'output_text',text:'FIXTURE_ONLY'}]}},{type:'response.completed',response:{id:'resp_fixture',status:'completed',usage:{input_tokens:0,output_tokens:0,total_tokens:0}}}];
 if(currentCapture.toolArgs){const item={type:'function_call',id:'fc_fixture',call_id:'call_fixture',name:'discover_skills',arguments:JSON.stringify(currentCapture.toolArgs)};events=[{type:'response.created',response:{id:'resp_fixture_tool'}},{type:'response.output_item.added',output_index:0,item:{...item,arguments:''}},{type:'response.output_item.done',output_index:0,item},{type:'response.completed',response:{id:'resp_fixture_tool',status:'completed',usage:{input_tokens:0,output_tokens:0,total_tokens:0}}}];}
 return new Response(events.map(e=>'data: '+JSON.stringify(e)+'\n\n').join(''),{status:200,headers:{'content-type':'text/event-stream'}});
};
globalThis.WebSocket=class {constructor(){throw Error('WEBSOCKET_NETWORK_FORBIDDEN');}};
async function check(name,fn){try{const details=await fn();checks.push({name,status:'PASS',details});console.log('PASS '+name);}catch(e){checks.push({name,status:'FAIL',error:e.stack});console.error('FAIL '+name+' '+e.message);}}
function fixtureSkill(root,name,description='Synthetic native acceptance metadata.',disabled=false,python=false){
 const dir=path.join(root,name);write(path.join(dir,'SKILL.md'),`---\nname: ${name}\ndescription: ${JSON.stringify(description)}\ndisable-model-invocation: ${disabled}\n---\n${name} BODY_ONLY_SENTINEL\n`);
 if(python){write(path.join(dir,'pyproject.toml'),'[project]\nname = "'+name+'"\nversion = "0.0.0"\n');write(path.join(dir,'src',name.replaceAll('-','_'),'__init__.py'),'# Synthetic metadata only; never imported.\n');}
 return path.join(dir,'SKILL.md');
}
const home=path.join(artifacts,'fixture-home'), cwd=path.join(home,'project-a'), agentDir=path.join(home,'agent');
fs.mkdirSync(cwd,{recursive:true});fs.mkdirSync(agentDir,{recursive:true});
write(path.join(cwd,'AGENTS.md'),'PROJECT_A_SCOPE_MUST_SURVIVE\nUnicode policy: café Δ 保留.\n');
const fixtureRoot=path.join(agentDir,'skills');
fixtureSkill(fixtureRoot,'synthetic-disabled','Disabled Markdown metadata forbidden.',true);
fixtureSkill(fixtureRoot,'synthetic-python','Eligible Python doctrine sentinel.',false,true);
fixtureSkill(fixtureRoot,'synthetic-python-disabled','Disabled Python metadata forbidden, runtime roster unchanged.',true,true);
fixtureSkill(fixtureRoot,'synthetic-precedence','USER_EFFECTIVE_SENTINEL');
fixtureSkill(path.join(cwd,'.prime','agent','skills'),'synthetic-precedence','PROJECT_DUPLICATE_SENTINEL');
let serial=0;
async function makeSession({candidate=true,work=cwd,extraPaths=[],manager,api='openai-codex-responses',excluded=false,extensionPath=extension,roots=[skillRoot],prefixExtensions=[],appendSystemPrompt=[]}={}){
 const state={id:++serial,candidate,mode:'normal',records:[],before:[],lateRefresh:false,errors:[],compactions:0,context:null,stages:[]};
 const streamSimple=(model,context,options)=>{
  const state=sessionOwners.get(options?.sessionId);assert(state,'Unknown synthetic native session transport');
  const rec={owner:state.id,label:state.label,context:clone(context),before:null,after:null,...(state.sseTools?.length?{toolArgs:state.sseTools.shift()}:{})};state.records.push(rec);captures.push(rec);currentCapture=rec;
  return codex.streamOpenAICodexResponses(model,context,{...options,apiKey:syntheticToken,transport:'sse',sessionId:state.mode==='inline-child-key'?'synthetic-inline-child-session':options.sessionId,onPayload:async body=>{
   state.onPayload=options?.onPayload;state.lastContext=context;state.lastOptions=options;
   if(state.mode==='missing') body={...body,instructions:body.instructions.replace(sdk.formatSkillsForPrompt(state.before.at(-1).event.systemPromptOptions.skills),'')};
   if(state.mode==='duplicate') body={...body,instructions:body.instructions+sdk.formatSkillsForPrompt(state.before.at(-1).event.systemPromptOptions.skills)};
   if(state.mode==='wrong-instructions') body={...body,instructions:42};
   if(state.mode==='missing-input') {body={...body};delete body.input;}
   if(state.mode==='missing-tools') {body={...body};delete body.tools;}
   if(state.mode==='excluded-tool-schema') body={...body,tools:body.tools.filter(t=>t.name!=='discover_skills')};
   rec.before=clone(body);const snapshot=structuredClone(body);freeze(body);
   const result=await options?.onPayload?.(body,model);assert.deepEqual(body,snapshot,'Native callback mutated its input');
   rec.after=clone(result??body);rec.immutable=true;
   assert.deepEqual({...result??body,instructions:null},{...body,instructions:null},'Actual non-instructions fields changed');
   if(state.mode==='normal' && result?.instructions!==undefined && result.instructions!==body.instructions){
    const full=sdk.formatSkillsForPrompt(state.before.at(-1).event.systemPromptOptions.skills), offset=body.instructions.indexOf(full);
    assert(offset>=0);assert(result.instructions.startsWith(body.instructions.slice(0,offset)));assert(result.instructions.endsWith(body.instructions.slice(offset+full.length)));
    rec.prefixSuffixPreserved=true;
   }
   if(state.mode==='normal'){
    assert.deepEqual({...rec.after,instructions:null},{...rec.before,instructions:null},'Non-instructions provider fields changed');
    rec.instructionsOnly=true;
   }
   return result;
  }});
 };
 const settings=sdk.SettingsManager.inMemory({transport:'sse',enableBuiltinSkills:true,autoRefine:{enabled:false},compaction:{enabled:false,keepRecentTokens:1,reserveTokens:100},retry:{enabled:false},telemetry:{enabled:false}});
 const factories=[pi=>{
  state.pi=pi;
  pi.registerProvider('native-acceptance',{api,baseUrl:'https://native-acceptance.invalid',apiKey:syntheticToken,streamSimple,models:[{id:'fixture',name:'Synthetic serializer fixture',reasoning:false,input:['text'],cost:{input:0,output:0,cacheRead:0,cacheWrite:0},contextWindow:100000,maxTokens:20}]});
  pi.on('before_agent_start',async(event,ctx)=>{state.before.push({event:clone(event),current:ctx.getSystemPrompt()});state.context=ctx;if(state.invalidSnapshot){state.invalidSnapshot=false;await state.session.extensionRunner.emitBeforeAgentStart(event.prompt,undefined,ctx.getSystemPrompt(),{});}if(state.fullAtStart){state.fullAtStart=false;state.fullResult=await tool(state,{action:'full',limit:100});}if(state.refineAtStart){state.refineAtStart=false;state.stages.push('late before_agent_start observed old harness');state.refinePromise=state.session.refine({instructions:'Synthetic local native acceptance only'});await state.refineReady;state.releaseRefine();state.stages.push('return before_agent_start while refine plan settles');}if(state.lateRefresh){pi.registerTool({name:'fresh-policy-tool',label:'Fresh native policy',description:'Fresh native tool',parameters:{type:'object',properties:{}},promptGuidelines:['FRESH_TOOL_POLICY_MUST_SURVIVE'],execute:async()=>({content:[{type:'text',text:'unused'}]})});state.lateRefresh=false;}});
  pi.on('session_before_refine',async()=>{state.stages.push('native no-model refinement hook');state.markRefineReady?.();if(state.refineRelease)await state.refineRelease;return {proposal:{summary:'FRESH_HARNESS_POLICY_MUST_SURVIVE',rationale:'Isolated acceptance fixture',edits:[{action:'create',kind:'prompt',id:'native-acceptance-policy',title:'Fresh native policy',content:'FRESH_HARNESS_POLICY_MUST_SURVIVE',reason:'Isolated native callback acceptance'}],expectedOutcome:'FRESH_HARNESS_POLICY_MUST_SURVIVE'}};});
  pi.on('before_provider_request',event=>{if(state.mode==='late-extension')return {...event.payload,instructions:event.payload.instructions+'\nLATER_EXTENSION_POLICY'};});
  pi.on('session_before_compact',event=>{state.compactions++;return {compaction:{summary:'SYNTHETIC_NO_MODEL_COMPACTION',firstKeptEntryId:event.preparation.firstKeptEntryId,tokensBefore:event.preparation.tokensBefore,details:{synthetic:true}}};});
 }];
 const services=await sdk.createAgentSessionServices({cwd:work,agentDir,settingsManager:settings,authStorage:sdk.AuthStorage.inMemory({},{usePrimeCliConfig:false}),telemetryDisabled:true,noBuiltinHerdrReporter:true,resourceLoaderOptions:{noExtensions:true,additionalExtensionPaths:candidate?[...prefixExtensions,extensionPath]:[],additionalSkillPaths:[...roots,...extraPaths],extensionFactories:factories,appendSystemPrompt,noPromptTemplates:true,noThemes:true}});
 assert.deepEqual(services.resourceLoader.getExtensions().errors,[],'Native extension loader error');
 const result=await sdk.createAgentSessionFromServices({services,sessionManager:manager??sdk.SessionManager.inMemory(work),model:services.modelRegistry.find('native-acceptance','fixture'),...(excluded?{tools:['ipython']} : {}),telemetryDisabled:true,prewarmIpythonKernel:false});
 state.session=result.session;state.services=services;sessions.push(state);sessionOwners.set(state.session.sessionManager.getSessionId(),state);
 await state.session.bindExtensions({onError:e=>{state.errors.push(e);errors.push({owner:state.id,...e});}});
 return state;
}
async function prompt(state,text,label=text){state.label=label;const n=state.records.length;await state.session.prompt(text);assert(state.records.length>n,'No native serializer call');const rec=state.records.at(-1);rec.nativeErrors=state.session.agent.state.messages.filter(m=>m.role==='assistant'&&m.stopReason==='error');assert(rec.serialized,'No intercepted serialized request: '+JSON.stringify(rec.nativeErrors));assert.equal(rec.nativeErrors.length,0,'Synthetic response failed');return rec;}
async function tool(state,params){const runner=state.session.extensionRunner;const def=runner.getToolDefinition('discover_skills');assert(def,'discover_skills not registered');const result=await def.execute('acceptance-'+responses.length,params,undefined,undefined,runner.createContext());const parsed=JSON.parse(result.content[0].text);assert.deepEqual(result.details,parsed);responses.push({params,result:parsed,utf8Bytes:bytes(result)});assert(!JSON.stringify(parsed).includes('BODY_ONLY_SENTINEL'),'Discovery leaked skill body');assert(parsed.fallback?.action==='full','Missing full catalogue route');assert(typeof parsed.guidance==='string'&&/read/i.test(parsed.guidance),'Missing read-before-use guidance');return parsed;}
let baseline,candidate;
try{
 await check('native pristine baseline and actual Codex transport',async()=>{baseline=await makeSession({candidate:false});const rec=await prompt(baseline,'Fix the off-by-one error in this loop.','baseline-code');const skills=baseline.services.resourceLoader.getSkills().skills;assert(rec.final.instructions.includes(sdk.formatSkillsForPrompt(baseline.before.at(-1).event.systemPromptOptions.skills)));assert.equal(rec.final.tools.some(t=>t.name==='discover_skills'),false);assert(rec.immutable&&rec.instructionsOnly);assert(rec.final.instructions.includes('PROJECT_A_SCOPE_MUST_SURVIVE'));assert(rec.final.instructions.includes('synthetic_python'));assert(!rec.final.instructions.includes('<name>synthetic-python-disabled</name>'));save('baseline-registry.json',skills);return {registry:skills.length,python:sdk.getPythonSkillRuntimeInfo(skills),requestBytes:bytes(rec.serialized)};});
 if(!baseline||!checks.at(-1).status.startsWith('PASS'))throw Error('Native baseline setup failed');
 if(!args['--baseline-only']){
  await check('native candidate loader full registry and runtime doctrine',async()=>{candidate=await makeSession();const b=baseline.services.resourceLoader.getSkills().skills,c=candidate.services.resourceLoader.getSkills().skills;assert.deepEqual(c,b);assert.deepEqual(sdk.getPythonSkillRuntimeInfo(c),sdk.getPythonSkillRuntimeInfo(b));assert(candidate.session.getAllTools().some(t=>t.name==='discover_skills'));const rec=await prompt(candidate,'Fix the off-by-one error in this loop.','candidate-code');assert(rec.final.instructions.includes('synthetic_python'));assert(rec.final.instructions.includes('<name>synthetic-python</name>'));assert(!rec.final.instructions.includes('<name>synthetic-python-disabled</name>'));assert(!rec.final.instructions.includes('<name>synthetic-disabled</name>'));assert(!rec.final.instructions.includes('<name>ads</name>'),'Intended coding reduction absent');assert(candidate.session.agent.state.systemPrompt.includes('<name>ads</name>'),'Native full prompt was changed');return {loaded:candidate.session.extensionRunner.getExtensionPaths(),pythonRuntimeUnchanged:true};});
  if(!candidate)throw Error('Candidate session could not be constructed');
  await check('frozen fixture direct routing and exact/slash modes (25 of35)',async()=>{
   for(const f of fixtures.fixtures.filter(f=>!f.mode||['follow_up_after_code_map','skill_referenced_dependency','exact_name_lookup','explicit_native_invocation'].includes(f.mode))){
    try{
     let rec,answer,available,route;
     if(f.mode==='explicit_native_invocation'){rec=await prompt(candidate,f.query,f.id);assert(rec.final.input.some(m=>JSON.stringify(m).includes('ad-creative')));assert(rec.final.input.some(m=>JSON.stringify(m).includes('<skill')),'Native slash expansion absent');available=new Set(['ad-creative']);route='native explicit body expansion';}
     else if(f.mode==='exact_name_lookup'){const name=f.id==='by-name-absent'?'nonexistent-fixture-skill':'sales-enablement';answer=await tool(candidate,{action:'get',name});assert.equal(answer.status,name==='sales-enablement'?'ok':'not_found');if(name==='sales-enablement')assert.equal(answer.skills[0].filePath,candidate.services.resourceLoader.getSkills().skills.find(s=>s.name===name).filePath);available=new Set(names(answer.skills));route='exact native effective metadata';}
     else {if(f.mode==='follow_up_after_code_map')await prompt(candidate,fixtures.fixtures.find(item=>item.id==='code-map').query,'mid-task-prior-code-map');rec=await prompt(candidate,f.query,f.id);answer=await tool(candidate,{action:'search',query:f.query});available=new Set([...candidate.services.resourceLoader.getSkills().skills.filter(s=>rec.final.instructions.includes(`<name>${s.name}</name>`)).map(s=>s.name),...names(answer.skills)]);route='visible plus actual discovery response';if(f.fallback_required||f.empty_result_valid)assert.equal(answer.fallback.action,'full');}
     for(const required of f.required_skills)assert(available.has(required),f.id+' missing '+required);
     fixtureResults.push({id:f.id,status:'PASS',route,returned:answer&&names(answer.skills),required:f.required_skills,notClaimed:'No skill execution or inference quality assertion'});
    }catch(e){fixtureResults.push({id:f.id,status:'FAIL',error:e.stack});}
   }
   const fails=fixtureResults.filter(x=>x.status==='FAIL');assert.equal(fails.length,0,JSON.stringify(fails));return {executed:fixtureResults.length,remainingModes:'Dedicated native lifecycle tests below; not names-only proxies'};
  });
  function dedicated(id,details){fixtureResults.push({id,status:'PASS',route:'dedicated native acceptance',details});}
  await check('complete native eligible stable pagination and disabled slash',async()=>{
   await prompt(candidate,'List all available skills.','all-pages');
   const expected=visible(candidate.before.at(-1).event.systemPromptOptions.skills).sort((a,b)=>a.name<b.name?-1:1);
   const all=[];let cursor;let snapshot;let count=0;
   do{const page=await tool(candidate,{action:'list',limit:7,...(cursor?{cursor}:{})});assert.equal(page.status,'ok');snapshot??=page.snapshot;assert.equal(page.snapshot,snapshot);all.push(...page.skills);cursor=page.nextCursor;assert.equal(page.complete,cursor===null);assert(++count<100,'Pagination did not terminate');}while(cursor);
   assert.deepEqual(all,expected);assert.equal(new Set(all.map(s=>s.filePath)).size,all.length);dedicated('all-pages',{pages:count,entries:all.length});
   for(const name of ['synthetic-disabled','synthetic-python-disabled']){const exact=await tool(candidate,{action:'get',name});assert.equal(exact.status,'not_found');const search=await tool(candidate,{action:'search',query:name});assert(!search.skills.some(s=>s.name===name));}
   const full=await tool(candidate,{action:'full',limit:100});assert.deepEqual(full.skills,expected);dedicated('disabled-search',{disabledMarkdownAndPython:true,full:true});
   const a=await prompt(candidate,'/skill:synthetic-disabled','disabled-explicit'),b=await prompt(baseline,'/skill:synthetic-disabled','baseline-disabled-explicit');
   assert(a.final.input.some(m=>JSON.stringify(m).includes('synthetic-disabled BODY_ONLY_SENTINEL')));assert(b.final.input.some(m=>JSON.stringify(m).includes('synthetic-disabled BODY_ONLY_SENTINEL')));
   assert(!a.final.instructions.includes('<name>synthetic-disabled</name>'));dedicated('disabled-explicit',{actualNativeSlashBody:true});
   assert.equal((await tool(candidate,{action:'get',name:'../../etc/passwd'})).status,'not_found');
   for(const params of [{action:'list',limit:0},{action:'list',limit:101},{action:'list',limit:1.5},{action:'search',query:7},{action:'what'}])assert.equal((await tool(candidate,params)).status,'invalid_request');
   return {pages:count,entries:all.length,disabledRuntimeRoster:sdk.getPythonSkillRuntimeInfo(candidate.services.resourceLoader.getSkills().skills).some(s=>s.name==='synthetic-python-disabled')};
  });
  await check('native full mode restores current-turn serializer instructions',async()=>{
   candidate.fullAtStart=true;const rec=await prompt(candidate,'Fix the off-by-one error in this loop.','full-current-turn');assert.deepEqual(rec.after,rec.before);assert(rec.final.instructions.includes('<name>ads</name>'));assert.equal(candidate.fullResult.status,'ok');
   const next=await prompt(candidate,'Fix the off-by-one error in this loop.','full-reset-next-turn');assert(!next.final.instructions.includes('<name>ads</name>'));
  });
  await check('native API and shape fail-open plus inherited inline-child session key',async()=>{
   for(const mode of ['missing','duplicate','wrong-instructions','missing-input','missing-tools','excluded-tool-schema','inline-child-key']){candidate.mode=mode;const rec=await prompt(candidate,'Fix the off-by-one error in this loop.','fault-'+mode);assert.deepEqual(rec.after,rec.before,mode+' must leave request unchanged');}
   candidate.mode='normal';const unknown=await makeSession({api:'unreviewed-native-api'});const rec=await prompt(unknown,'Fix the off-by-one error in this loop.','unknown-api');assert.deepEqual(rec.after,rec.before);assert(rec.final.instructions.includes('<name>ads</name>'));
   const excluded=await makeSession({excluded:true});const ex=await prompt(excluded,'Fix the off-by-one error in this loop.','explicit-tool-allowlist');assert.deepEqual(ex.after,ex.before);assert(!ex.final.tools.some(t=>t.name==='discover_skills'));assert(ex.final.instructions.includes('<name>ads</name>'));
   dedicated('incompatible',{actualNativeSerializer:true,faults:7,unknownApi:true,explicitExcludedTool:true,inlineChild:'Actual installed serializer with inherited parent callback context and different child prompt_cache_key; no RLM worker spawned.'});
  });
  await check('latest dynamic native tool and scoped context policy survives',async()=>{
   candidate.lateRefresh=true;const rec=await prompt(candidate,'Fix the off-by-one error in this loop.','late-native-tool');
   assert(rec.final.tools.some(t=>t.name==='fresh-policy-tool'));assert(rec.final.instructions.includes('FRESH_TOOL_POLICY_MUST_SURVIVE'));assert(rec.final.instructions.includes('PROJECT_A_SCOPE_MUST_SURVIVE'));assert(rec.final.instructions.includes('café Δ 保留'));
   assert(!candidate.before.at(-1).event.systemPrompt.includes('FRESH_TOOL_POLICY_MUST_SURVIVE'),'Fixture failed to place native refresh after candidate observation');
   assert(candidate.session.agent.state.systemPrompt.includes('<name>ads</name>'));return {actualNativeDynamicToolRefresh:true,notRefinementProxy:true};
  });
  await check('two independent sessions and native cwd precedence',async()=>{
   const workB=path.join(home,'project-b');write(path.join(workB,'AGENTS.md'),'PROJECT_B_SCOPE_ONLY\n');fixtureSkill(path.join(workB,'.prime','agent','skills'),'synthetic-project-only','PROJECT_B_SKILL_ONLY');
   const b=await makeSession({work:workB});const oracle=await makeSession({candidate:false,work:workB});
   assert.deepEqual(b.services.resourceLoader.getSkills(),oracle.services.resourceLoader.getSkills());
   const recB=await prompt(b,'Trace repository callers.','session-B-code');const recA=await prompt(candidate,'Plan paid campaign targeting.','session-A-ads');
   assert(!recB.final.instructions.includes('<name>ads</name>'));assert(recA.final.instructions.includes('<name>ads</name>'));assert(recB.final.instructions.includes('PROJECT_B_SCOPE_ONLY'));assert(!recB.final.instructions.includes('PROJECT_A_SCOPE_MUST_SURVIVE'));assert(!recA.final.instructions.includes('PROJECT_B_SCOPE_ONLY'));
   const effective=(await tool(candidate,{action:'get',name:'synthetic-precedence'})).skills[0];const nativeEffective=baseline.services.resourceLoader.getSkills().skills.find(s=>s.name==='synthetic-precedence');assert.deepEqual(effective,nativeEffective);
   dedicated('parallel-sessions',{differentIds:[candidate.session.sessionManager.getSessionId(),b.session.sessionManager.getSessionId()],queries:'ads versus repository',ownCwd:true});dedicated('rules-scope',{nativePrecedenceCompared:true,effective});
  });
  await check('native metadata edit removal new and stale-cursor reload',async()=>{
   const mirror=path.join(artifacts,'cohort-edit-root'), mirrorExtension=path.join(mirror,'extensions','skill-discovery','index.ts');
   for(const file of ['index.ts','catalog.mjs','cohort.json']){const src=path.join(path.dirname(extension),file);write(path.join(path.dirname(mirrorExtension),file),fs.readFileSync(src));}
   const adsRelative='marketingskills/skills/ads/SKILL.md', adsPath=path.join(mirror,adsRelative);write(adsPath,fs.readFileSync(path.join(skillRoot,adsRelative)));
   const m=await makeSession({extensionPath:mirrorExtension,roots:[mirror,skillRoot]});await prompt(m,'Fix the off-by-one error in this loop.','mirror-initial');const initial=(await tool(m,{action:'get',name:'ads'})).skills[0];assert.equal(initial.filePath,adsPath);assert(!m.records.at(-1).final.instructions.includes('<name>ads</name>'),'Initial identical reviewed metadata must qualify');
   const page=await tool(m,{action:'list',limit:1});assert(page.nextCursor);
   const raw=fs.readFileSync(adsPath,'utf8');write(adsPath,raw.replace('description:','description: EDITED_UNVETTED_DESCRIPTION '));
   await m.session.reload();const edited=await prompt(m,'Fix the off-by-one error in this loop.','mirror-edited');assert(edited.final.instructions.includes('<name>ads</name>'));assert(edited.final.instructions.includes('EDITED_UNVETTED_DESCRIPTION'));assert.equal((await tool(m,{action:'list',cursor:page.nextCursor})).status,'stale_cursor');dedicated('reload-edit',{nativeReload:true,initialReviewedHidden:true,editedVisible:true,staleCursorRejected:true});
   const removable=fixtureSkill(fixtureRoot,'synthetic-removable','Native deletion fixture');await m.session.reload();await prompt(m,'Find synthetic removable.','before-delete');assert.equal((await tool(m,{action:'get',name:'synthetic-removable'})).status,'ok');fs.unlinkSync(removable);assert.equal((await tool(m,{action:'get',name:'synthetic-removable'})).status,'unavailable');await m.session.reload();await prompt(m,'Continue coding.','after-delete');assert.equal((await tool(m,{action:'get',name:'synthetic-removable'})).status,'not_found');dedicated('read-time-removal',{beforeReloadUnavailable:true,afterReloadNotFound:true});
   fixtureSkill(fixtureRoot,'synthetic-new-visible','NEW_NATIVE_METADATA_SENTINEL');await m.session.reload();const added=await prompt(m,'Continue coding.','new-default-visible');assert(added.final.instructions.includes('<name>synthetic-new-visible</name>'));dedicated('unknown-new',{nativeReload:true,newDefaultVisible:true});
   const adsDir=path.dirname(adsPath);write(path.join(adsDir,'pyproject.toml'),'[project]\nname="ads"\nversion="0.0.0"\n');write(path.join(adsDir,'src/ads/__init__.py'),'# Native Python kind-change fixture only\n');await m.session.reload();const pythonChanged=await prompt(m,'Continue coding.','cohort-python-kind');assert(pythonChanged.final.instructions.includes('<name>ads</name>'));assert.equal((await tool(m,{action:'get',name:'ads'})).skills[0].kind,'python');
   const samePage=await tool(m,{action:'list',limit:1});const sameSkills=m.before.at(-1).event.systemPromptOptions.skills;await m.session.reload();await prompt(m,'Continue coding.','unchanged-reload');assert.deepEqual(m.before.at(-1).event.systemPromptOptions.skills,sameSkills);assert.equal((await tool(m,{action:'list',cursor:samePage.nextCursor})).status,'stale_cursor');
   write(adsPath,raw.replace('name: ads','name: ads-renamed-native'));await m.session.reload();const renamed=await prompt(m,'Continue coding.','renamed-native-metadata');assert(renamed.final.instructions.includes('<name>ads-renamed-native</name>'));assert.equal((await tool(m,{action:'get',name:'ads-renamed-native'})).skills[0].filePath,adsPath);
   write(adsPath,fs.readFileSync(adsPath,'utf8').replace('description:','disable-model-invocation: true\ndescription:'));await m.session.reload();const disabled=await prompt(m,'Continue coding.','disabled-after-reload');assert(!disabled.final.instructions.includes('<name>ads-renamed-native</name>'));assert.equal((await tool(m,{action:'get',name:'ads-renamed-native'})).status,'not_found');
  });
  await check('actual native compaction and discovery recovery without summary model',async()=>{
   const before=candidate.compactions, calls=captures.length;const result=await candidate.session.compact();assert(result);assert.equal(candidate.compactions,before+1);assert.equal(captures.length,calls,'Compaction unexpectedly invoked provider');assert(candidate.session.sessionManager.getEntries().some(e=>e.type==='compaction'));
   const rec=await prompt(candidate,'Continue after compaction; the selected skill says to use analytics next.','compaction-follow-up');assert(rec.final.instructions.includes('PROJECT_A_SCOPE_MUST_SURVIVE'));assert(rec.final.instructions.includes('synthetic_python'));assert(rec.final.tools.some(t=>t.name==='discover_skills'));assert.equal((await tool(candidate,{action:'get',name:'analytics'})).status,'ok');assert.equal((await tool(candidate,{action:'full',limit:100})).status,'ok');dedicated('compaction',{actualNativeCompaction:true,modelCallsForSummary:0,exactAndFullRecovered:true});
  });
  await check('actual native local refinement after callback and persisted resume',async()=>{
   const manager=sdk.SessionManager.create(cwd,path.join(artifacts,'persisted-sessions'));const r=await makeSession({manager});await prompt(r,'Fix an off-by-one error.','refine-setup');
   r.refineReady=new Promise(resolve=>r.markRefineReady=resolve);r.refineRelease=new Promise(resolve=>r.releaseRefine=resolve);r.refineAtStart=true;
   const rec=await prompt(r,'Fix the next off-by-one error.','late-native-refinement');const refinement=await r.refinePromise;
   assert(refinement.appliedEdits.some(e=>e.applied));assert(refinement.harnessStatePath.startsWith(artifacts+path.sep));assert.equal(refinement.scope,'local');assert(rec.final.instructions.includes('FRESH_HARNESS_POLICY_MUST_SURVIVE'));assert(!r.before.at(-1).event.systemPrompt.includes('FRESH_HARNESS_POLICY_MUST_SURVIVE'));assert(rec.final.instructions.includes('PROJECT_A_SCOPE_MUST_SURVIVE'));assert(rec.final.instructions.includes('synthetic_python'));
   const file=manager.getSessionFile();assert(file?.startsWith(artifacts+path.sep));await r.session.disposeAsync({reason:'acceptance-resume'});sessions.splice(sessions.indexOf(r),1);
   const resumed=await makeSession({manager:sdk.SessionManager.open(file)});const restored=await prompt(resumed,'Continue coding after resume.','native-resume');assert(restored.final.instructions.includes('FRESH_HARNESS_POLICY_MUST_SURVIVE'));assert.equal((await tool(resumed,{action:'get',name:'ads'})).status,'ok');
   return {stages:r.stages,refinement,sessionFile:file,actualNoModelRefinement:true,preciseTiming:'Native refinement planning starts in a later before_agent_start handler, proposal is released as that handler returns; native preparation waits/applies before the serialized request.',resume:true};
  });
  await check('public native queued follow-up changes domain',async()=>{
   await prompt(candidate,'Trace code navigation callers.','queued-code');const n=candidate.records.length;
   const done=new Promise((resolve,reject)=>{const timeout=setTimeout(()=>{unsubscribe();reject(Error('Queued follow-up did not complete within10s'));},10000);const unsubscribe=candidate.session.subscribe(event=>{if(event.type==='agent_end'&&candidate.records.length>n){clearTimeout(timeout);unsubscribe();resolve();}});});
   candidate.label='native-queued-follow-up';await candidate.session.followUp('Now write ad headlines and use analytics next.',undefined,{resumeIfIdle:true});await done;
   const rec=candidate.records.at(-1);assert(rec.serialized);assert(rec.final.instructions.includes('PROJECT_A_SCOPE_MUST_SURVIVE'));const result=await tool(candidate,{action:'search',query:'ad headlines analytics'});for(const name of ['ad-creative','analytics'])assert(result.skills.some(s=>s.name===name));
  });
  await check('later native extension composes without hiding its changes',async()=>{candidate.mode='late-extension';const rec=await prompt(candidate,'Fix an off-by-one loop error.','late-extension');assert(rec.final.instructions.endsWith('LATER_EXTENSION_POLICY'));assert(!rec.final.instructions.includes('<name>ads</name>'));candidate.mode='normal';});
  await check('paired final serialized UTF8 prompt and schema accounting',async()=>{
   const cases=[['code','Fix the off-by-one error in this loop.'],['one-domain','Plan PPC campaign targeting.'],['multi-domain','Trace repository dependencies, redesign pricing and write paid ad variants.'],['unknown','What is the boiling point of water?'],['full','Fix the off-by-one error in this loop.'],['compatibility','Fix the off-by-one error in this loop.'],['follow-up','Now produce a marketing hero image and explainer video.']];
   for(const [name,query]of cases){const b=await makeSession({candidate:false}),o=await makeSession({api:name==='compatibility'?'unreviewed-native-api':'openai-codex-responses'});if(name==='follow-up'){await prompt(b,'Plan PPC campaign targeting.','pair-baseline-first');await prompt(o,'Plan PPC campaign targeting.','pair-optional-first');}if(name==='full')o.fullAtStart=true;const before=await prompt(b,query,'pair-baseline-'+name),after=await prompt(o,query,'pair-optional-'+name);assert.deepEqual(b.before.at(-1).event.systemPromptOptions.skills,o.before.at(-1).event.systemPromptOptions.skills);assert.deepEqual(before.final.tools,after.final.tools.filter(t=>t.name!=='discover_skills'));
    const instructionBaseline=bytes(before.final.instructions),instructionOptional=bytes(after.final.instructions),schemaBaseline=bytes(before.final.tools),schemaOptional=bytes(after.final.tools),baselineTotal=instructionBaseline+schemaBaseline,optionalTotal=instructionOptional+schemaOptional;
    const extraSchema=after.final.tools.find(t=>t.name==='discover_skills');const full=sdk.formatSkillsForPrompt(o.before.at(-1).event.systemPromptOptions.skills);const shown=o.before.at(-1).event.systemPromptOptions.skills.filter(s=>after.final.instructions.includes(`<name>${s.name}</name>`));const selected=sdk.formatSkillsForPrompt(shown);const guidanceBytes=after.final.instructions===after.before.instructions?0:bytes(after.final.instructions)-bytes(after.before.instructions)+bytes(full)-bytes(selected);
    let response; if(name==='full')response=o.fullResult;else response=await tool(o,{action:'search',query});
    measurements.push({case:name,boundary:'Installed streamOpenAICodexResponses final JSON.stringify(body), fetch intercepted before network',instructionBaseline,instructionOptional,schemaBaseline,schemaOptional,baselineTotal,optionalTotal,netReduction:baselineTotal-optionalTotal,discoverySchemaObjectBytes:bytes(extraSchema),guidanceBytes,baselineRequestBytes:bytes(before.serialized),optionalRequestBytes:bytes(after.serialized),wholeRequestReduction:bytes(before.serialized)-bytes(after.serialized),discoveryResponseTextBytes:bytes(response),retainedDiscoveryMessagesBytes:0,responseRetentionNote:'Direct native tool invocation; response not inserted into model history in this pair. Separate actual tool roundtrip below.',selected:names(shown),fallback:after.final.instructions===after.before.instructions?'native-full':'selective-with-full-route'});
    if(['code','one-domain','multi-domain'].includes(name))assert(baselineTotal>optionalTotal,name+' net prompt reduction must be positive');
   }
  });

  await check('earlier native extension edits force exact-context fail-open',async()=>{
   const earlier=path.join(artifacts,'earlier-extension.ts');write(earlier,String.raw`export default function(pi){pi.on('before_provider_request',event=>({...event.payload,instructions:event.payload.instructions+'\nEARLIER_EXTENSION_POLICY'}));}`);
   const e=await makeSession({prefixExtensions:[earlier]});e.mode='early-extension';const rec=await prompt(e,'Fix the off-by-one error in this loop.','earlier-extension');assert(rec.final.instructions.endsWith('EARLIER_EXTENSION_POLICY'));assert(rec.final.instructions.includes('<name>ads</name>'));assert.deepEqual(rec.final,{...rec.before,instructions:rec.before.instructions+'\nEARLIER_EXTENSION_POLICY'});
  });

  await check('duplicate full catalogue in actual native context and invalid native event snapshot',async()=>{
   const oracle=await makeSession({candidate:false});await prompt(oracle,'Fix the off-by-one error in this loop.','duplicate-oracle');const full=sdk.formatSkillsForPrompt(oracle.before.at(-1).event.systemPromptOptions.skills);const d=await makeSession({appendSystemPrompt:[full]});const rec=await prompt(d,'Fix the off-by-one error in this loop.','native-duplicate-catalogue');const captured=sdk.formatSkillsForPrompt(d.before.at(-1).event.systemPromptOptions.skills);assert.equal(rec.before.instructions.split(captured).length-1,2);assert.deepEqual(rec.after,rec.before);assert.equal(rec.before.instructions,d.session.agent.state.systemPrompt,'Duplicate test must pass own-context equality before unique-fragment guard');
   const i=await makeSession();i.invalidSnapshot=true;const missing=await prompt(i,'Fix the off-by-one error in this loop.','invalid-native-snapshot');assert.deepEqual(missing.after,missing.before);assert(missing.final.instructions.includes('<name>ads</name>'));assert.equal((await tool(i,{action:'get',name:'ads'})).status,'unavailable');
  });
  await check('real native discovery tool roundtrip and retained response bytes',async()=>{
   const r=await makeSession();r.sseTools=[{action:'search',query:'Plan PPC paid campaign targeting.'}];const start=r.records.length;await prompt(r,'Plan PPC paid campaign targeting.','real-tool-roundtrip');const seq=r.records.slice(start);assert.equal(seq.length,2,'Exactly one synthetic tool call and one follow-up provider request');assert(!seq[0].final.instructions.includes('<name>video</name>'));assert(seq[1].final.instructions.includes('<name>video</name>'),'Native continuation must fail open full');
   const results=r.session.agent.state.messages.filter(m=>m.role==='toolResult'&&m.toolName==='discover_skills');assert.equal(results.length,1);const text=results[0].content.find(c=>c.type==='text').text;const answer=JSON.parse(text);assert.equal(answer.status,'ok');assert(answer.skills.some(s=>s.name==='ads'));assert(!text.includes('BODY_ONLY_SENTINEL'));
   const retained=seq[1].final.input.filter(i=>i.type==='function_call_output');assert.equal(retained.length,1);assert.equal(retained[0].output,text);
   measurements.push({case:'actual-discovery-roundtrip',firstRequestPromptBytes:bytes(seq[0].final.instructions)+bytes(seq[0].final.tools),secondRequestPromptBytes:bytes(seq[1].final.instructions)+bytes(seq[1].final.tools),discoveryResponseTextBytes:bytes(text),actualRetainedToolOutputItemBytes:bytes(retained[0]),secondInputBytes:bytes(seq[1].final.input),secondTotalSerializedRequestBytes:bytes(seq[1].serialized),note:'Actual native Agent tool execution and installed serializer conversion, no inference. Second request is native full catalogue plus retained metadata; no total-sequence saving is claimed.'});
  });
  await check('shared native ResourceLoader factory lifecycle state isolation',async()=>{
   const a=await makeSession();await prompt(a,'Plan PPC campaign targeting.','shared-A');const before=await tool(a,{action:'get',name:'ads'});assert.equal(before.status,'ok');
   const sm=sdk.SessionManager.inMemory(cwd);const made=await sdk.createAgentSessionFromServices({services:a.services,sessionManager:sm,model:a.services.modelRegistry.find('native-acceptance','fixture'),telemetryDisabled:true,prewarmIpythonKernel:false});
   const b={id:++serial,candidate:true,mode:'normal',records:[],before:a.before,session:made.session,services:a.services,errors:[],stages:[]};sessions.push(b);sessionOwners.set(sm.getSessionId(),b);await b.session.bindExtensions({onError:e=>{b.errors.push(e);errors.push({owner:b.id,...e});}});
   assert.equal((await tool(a,{action:'get',name:'ads'})).status,'ok','B startup erased A catalog');await prompt(b,'Trace repository callers.','shared-B');assert(!b.records.at(-1).final.instructions.includes('<name>ads</name>'));assert.equal((await tool(a,{action:'get',name:'ads'})).status,'ok','B turn erased A catalog');
   await b.session.extensionRunner.emit({type:'session_start',reason:'new'});assert.equal((await tool(a,{action:'get',name:'ads'})).status,'ok','B lifecycle erased A catalog');assert.equal((await tool(b,{action:'get',name:'ads'})).status,'unavailable','B lifecycle did not invalidate B');
   return {actualServicesShared:true,sessionIds:[a.session.sessionManager.getSessionId(),b.session.sessionManager.getSessionId()],BStartupAndTurnAndLifecyclePreserveA:true};
  });
  await check('all35 frozen fixture modes have real declared evidence',async()=>{assert.equal(fixtureResults.length,35);assert.deepEqual(fixtureResults.map(x=>x.id).sort(),fixtures.fixtures.map(x=>x.id).sort());assert(fixtureResults.every(x=>x.status==='PASS'));return {frozen35:true,notInferenceBenchmark:true};});

 }
}finally{
 for(const s of sessions.reverse()){try{await s.session.disposeAsync({reason:'acceptance-complete'});}catch(e){checks.push({name:'session disposal',status:'FAIL',error:e.stack});}}
 const sourceUnchanged=sourcePaths.every((p,i)=>sha(p)===sourceHashes[i].sha256);checks.push({name:'executed source and frozen fixture bytes unchanged during suite',status:sourceUnchanged?'PASS':'FAIL'});
 save('checks.json',checks);save('captures.json',captures);save('measurements.json',measurements);save('fixture-results.json',fixtureResults);save('tool-responses.json',responses);save('extension-errors.json',errors);
 const failed=checks.filter(c=>c.status==='FAIL');save('summary.json',{status:failed.length?'FAIL':'PASS',checks:checks.length,failed:failed.length,nativeSerializerCalls:captures.length,interceptedRequests:captures.filter(c=>c.serialized).length,realNetworkCalls:0,modelInferenceCalls:0,frozenSha256:crypto.createHash('sha256').update(frozen).digest('hex'),limits:['Real Python module execution and fresh installed operational checks are root-owned.','No model efficacy, token, latency or dollar measurement.']});
 process.exitCode=failed.length?1:0;
}
