#!/usr/bin/env node
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,readdirSync,existsSync,lstatSync,linkSync,symlinkSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const installer=join(root,'scripts/install-hooks.mjs');
const refusal='Unlazy Prime: Claude hook installation and removal are disabled. No settings were read or changed.\n';
const tests=[];
const test=(name,fn)=>tests.push({name,fn});
function fixture(fn){
  const base=mkdtempSync(join(tmpdir(),'unlazy-prime-'));
  const cwd=join(base,'project'),home=join(base,'home');
  mkdirSync(cwd);mkdirSync(home);
  const run=(args=[])=>{
    const r=spawnSync(process.execPath,[installer,...args],{cwd,env:{PATH:'/usr/bin:/bin',HOME:home},encoding:'utf8',timeout:2000,maxBuffer:8192});
    assert.equal(r.error,undefined);assert.equal(r.signal,null);assert.equal(r.status,2);
    assert.equal(r.stdout,'');assert.equal(r.stderr,refusal);
  };
  try{fn({base,cwd,home,run});}finally{rmSync(base,{recursive:true,force:true});}
}
for(const args of [[],['--help'],['-h'],['--global'],['--shared'],['--uninstall'],['--global','--uninstall'],['--scope','bad;echo\nprivate']]){
  test('installer refusal has no new state: '+JSON.stringify(args),()=>fixture(({cwd,home,run})=>{
    run(args);assert.deepEqual(readdirSync(cwd),[]);assert.deepEqual(readdirSync(home),[]);
  }));
}
test('existing local/shared/global settings and unrelated substring handlers are byte-preserved',()=>fixture(({cwd,home,run})=>{
  const bytes=JSON.stringify({hooks:{Stop:[{hooks:[{type:'command',command:'echo '+join(root,'scripts/stop-hook.mjs')+'.extra'},{type:'command',command:'echo --unlazy-hook-v2 unrelated'}]}]},editor:'preserve'})+'\n';
  mkdirSync(join(cwd,'.claude'));mkdirSync(join(home,'.claude'));
  const files=[join(cwd,'.claude/settings.local.json'),join(cwd,'.claude/settings.json'),join(home,'.claude/settings.json')];
  files.forEach(f=>writeFileSync(f,bytes));
  for(const args of [[],['--shared'],['--global'],['--uninstall'],['--global','--uninstall']])run(args);
  for(const f of files){assert.equal(readFileSync(f,'utf8'),bytes);assert.equal(existsSync(f+'.unlazy.bak'),false);}
}));
for(const kind of ['symlink','hardlink'])test(kind+' settings victim preserved',()=>fixture(({base,cwd,run})=>{
  const victim=join(base,'victim');writeFileSync(victim,'preserve\n');mkdirSync(join(cwd,'.claude'));
  const target=join(cwd,'.claude/settings.local.json');
  if(kind==='symlink')symlinkSync(victim,target);else linkSync(victim,target);
  const before=lstatSync(target);run(['--uninstall']);
  assert.equal(readFileSync(victim,'utf8'),'preserve\n');assert.equal(lstatSync(target).ino,before.ino);assert.equal(existsSync(target+'.unlazy.bak'),false);
}));
test('FIFO settings refused without opening or blocking',()=>fixture(({cwd,run})=>{
  if(process.platform==='win32')return;
  mkdirSync(join(cwd,'.claude'));const target=join(cwd,'.claude/settings.local.json');
  const made=spawnSync('mkfifo',[target],{encoding:'utf8',timeout:2000});assert.equal(made.status,0,made.stderr);
  run();assert.equal(lstatSync(target).isFIFO(),true);assert.equal(existsSync(target+'.unlazy.bak'),false);
}));
test('Prime adapter states authorization and evidence limitations',()=>{
  const text=readFileSync(join(root,'references/prime.md'),'utf8').replace(/\s+/g,' ');
  for(const token of ['not the answer','not authorization','outside','nonempty','completed','Task Observer','does not create agents, authenticate their handles','one low-cost polish','bash(command)'])assert.ok(text.includes(token),token);
});
test('active skill has no hook-install offer or endless polish',()=>{
  const text=readFileSync(join(root,'SKILL.md'),'utf8');
  assert.ok(text.includes('refusal-only stub'));assert.ok(text.includes('at most one low-cost polish'));
  assert.ok(!text.includes('finds nothing'));assert.ok(!text.includes('Install the optional Claude'));
});
test('native adapter and plan avoid foreign launch tools',()=>{
  const dispatch=readFileSync(join(root,'references/dispatch.md'),'utf8');
  assert.ok(dispatch.includes('rlm_child_id'));assert.ok(!dispatch.includes('call `spawn_agent`'));
  const plan=readFileSync(join(root,'templates/PLAN.md'),'utf8');assert.ok(plan.includes('Prime native RLM'));
});

// Documentation contracts: these guard the handoff specification, not agent behavior.
function assertResearchHandoffContract(text){
  const sections=new Map([...text.matchAll(/^## (.+)\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm)].map(m=>[m[1],m[2]]));
  const required={
    'Scope and authority':['not a second memory','permission','untrusted data'],
    'Report shape':['Brief','Overview','Evidence','Transfer to Prime','existing equivalent','rollback','blocked','untested'],
    'Freshness and access':['historical','timestamp','digest','missing','canonical','Do not crawl'],
    'Publishing':['temporary','previous','manifest last','not power-loss'],
    'Verification and value':['negative control','preparation','not tokens','not a blinded','Do not lower']
  };
  for(const [heading,tokens] of Object.entries(required)){
    assert.ok(sections.has(heading),`missing section: ${heading}`);
    for(const token of tokens)assert.ok(sections.get(heading).includes(token),`${heading}: ${token}`);
  }
}
test('research handoff reference has required routing, sections and tokens',()=>{
  const skill=readFileSync(join(root,'SKILL.md'),'utf8');
  assert.ok(skill.includes('[research handoffs](references/research-handoffs.md)'));
  assertResearchHandoffContract(readFileSync(join(root,'references/research-handoffs.md'),'utf8'));
});
for(const heading of ['Scope and authority','Report shape','Freshness and access','Publishing','Verification and value']){
  test('research contract rejects missing '+heading,()=>{
    const text=readFileSync(join(root,'references/research-handoffs.md'),'utf8');
    assertResearchHandoffContract(text); // Positive control before testing rejection.
    const damaged=text.replace('## '+heading+'\n','## Removed section\n');
    assert.notEqual(damaged,text);
    assert.throws(()=>assertResearchHandoffContract(damaged),/missing section/);
  });
}

for(const token of ['not a second memory','rollback','canonical','not power-loss','not a blinded']){
  test('research contract rejects missing token '+token,()=>{
    const text=readFileSync(join(root,'references/research-handoffs.md'),'utf8');
    assertResearchHandoffContract(text);
    const damaged=text.replace(token,'REMOVED_REQUIRED_TOKEN');
    assert.notEqual(damaged,text);
    assert.throws(()=>assertResearchHandoffContract(damaged));
  });
}

let failures=0;
for(const {name,fn} of tests){try{fn();console.log('ok   Prime: '+name);}catch(e){failures++;console.error('FAIL Prime: '+name+'\n'+e.stack);}}
console.log(`Prime contracts ${tests.length-failures}/${tests.length}`);
if(failures)process.exitCode=1;
