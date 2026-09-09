import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,realpathSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const config=new URL('../config/AGENTS.md',import.meta.url);
const text=readFileSync(config,'utf8');
const heading='## Clear, low-friction communication';
assert.equal(text.split(heading).length-1,1,'Communication guidance must occur once');
const section=text.split(heading)[1].split('\n## ')[0].replace(/\s+/g,' ');
for(const phrase of [
 'answer, verified result, or decision needed',
 'required tool/progress announcements',
 'resuming multi-step work', 'meaningful milestone',
 'what is done, any blocker, and the next action',
 'Do not repeat status on every reply',
 'Separate an observed failure from its cause',
 'only when evidence supports it', 'label it a hypothesis',
 'next diagnostic check', 'Do agent-owned work',
 'input, permission, or access is needed',
 'report the verified outcome and stop', 'do not manufacture a next task',
 'estimates only when grounded', 'relevant assumptions',
 'not a rigid item cap', 'safety and uncertainty',
]) assert.ok(section.includes(phrase),`Missing communication contract: ${phrase}`);
for(const heading of ['## Task Observer activation','## Authorized long-task continuation watchdog','## Git synchronization invariant'])
 assert.ok(text.includes(heading),`Existing safeguard missing: ${heading}`);
console.log('COMMUNICATION_INSTRUCTION_CONTRACT_OK');
const native=process.argv.indexOf('--native');
if(native!==-1){
 const {loadProjectContextFiles}=await import(pathToFileURL(resolve(process.argv[native+1])).href);
 const agentDir=resolve(process.argv[native+2]);
 const cwd=mkdtempSync(join(tmpdir(),'prime-communication-load-'));
 try{
  const files=loadProjectContextFiles({cwd,agentDir});
  const matches=files.filter(f=>realpathSync(f.path)===realpathSync(config));
  assert.equal(matches.length,1,'Global versioned instructions must load exactly once');
  assert.equal(matches[0].content,text);
  console.log('COMMUNICATION_FRESH_NATIVE_LOADING_OK');
 }finally{rmSync(cwd,{recursive:true,force:true});}
}
