import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,mkdirSync,writeFileSync,rmSync,realpathSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const config=new URL('../config/AGENTS.md',import.meta.url);
const text=readFileSync(config,'utf8');
const heading='## Scoped project instructions and contract upkeep';
function check(document){
 assert.equal(document.split(heading).length-1,1,'Scoped guidance must occur exactly once');
 const section=document.split(heading)[1].split('\n## ')[0].replace(/\s+/g,' ');
 for(const phrase of [
  'identify the target paths and read the applicable project-root, ancestor and target-area instructions',
  'do not assume a session started at the project root has loaded descendant instructions',
  'Re-read the applicable chain for the current task',
  'check any newly added target area before editing it',
  'Do not recursively scan unrelated folders or initialize a documentation tree',
  'Instruction priority and scope still apply',
  'proximity does not authorize a child document to override higher-priority instructions or expand permissions',
  'For authorized project documentation work',
  'only at real, durable boundaries',
  'Link to authoritative sources rather than copy them',
  'no per-folder files, empty templates or mandatory child indexes are required',
  'update the owning document and any affected links or indexes in the same change',
  'preserve useful rationale and unrelated user work',
  'needs no documentation change or unchanged-doc report',
  'Do not invent tests or claim a documented command was executed',
  'global preferences and refinement remain with the continual harness',
 ])assert.ok(section.includes(phrase),phrase);
}
check(text);
for(const phrase of ['Do not recursively scan','Instruction priority and scope still apply','For authorized project documentation work','needs no documentation change','global preferences and refinement remain with the continual harness'])
 assert.throws(()=>check(text.replace(phrase,'REMOVED')));
assert.throws(()=>check(text+'\n'+heading+'\nDuplicate'));
for(const heading of ['## Task Observer activation','## Authorized long-task continuation watchdog','## Using past sessions','## Clear, low-friction communication','## Git synchronization invariant'])assert.ok(text.includes(heading));
console.log('SCOPED_INSTRUCTIONS_CONTRACT_OK');
const [native,agentDir]=process.argv.slice(2);
assert.ok(native&&agentDir,'Supply native resource-loader.js and installed agent directory');
const {loadProjectContextFiles}=await import(pathToFileURL(resolve(native)));
const tmp=mkdtempSync(join(tmpdir(),'prime-scoped-contract-'));
try {
 const repo=join(tmp,'project'),area=join(repo,'area'),privateAgent=join(tmp,'agent');
 mkdirSync(area,{recursive:true});mkdirSync(privateAgent);
 writeFileSync(join(repo,'AGENTS.md'),'SYNTHETIC_ROOT\nChild: area/AGENTS.md');
 writeFileSync(join(area,'AGENTS.md'),'SYNTHETIC_CHILD');
 const rootFiles=loadProjectContextFiles({cwd:repo,agentDir:resolve(agentDir)});
 const matches=rootFiles.filter(f=>realpathSync(f.path)===realpathSync(config));
 assert.equal(matches.length,1);assert.equal(matches[0].content,text);check(matches[0].content);
 assert.ok(!rootFiles.some(f=>f.content==='SYNTHETIC_CHILD'));
 const childFiles=loadProjectContextFiles({cwd:area,agentDir:privateAgent});
 const ri=childFiles.findIndex(f=>f.content.startsWith('SYNTHETIC_ROOT'));
 const ci=childFiles.findIndex(f=>f.content==='SYNTHETIC_CHILD');
 assert.ok(ri>=0&&ci>ri);
 console.log('SCOPED_FRESH_NATIVE_LOADING_OK');
 console.log('Wording and native loading checks only; no model-behavior guarantee.');
} finally {rmSync(tmp,{recursive:true,force:true});}
