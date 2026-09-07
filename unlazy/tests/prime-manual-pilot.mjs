import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,existsSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const skill=process.argv[2]?resolve(process.argv[2]):dirname(dirname(fileURLToPath(import.meta.url)));
const base=mkdtempSync(join(tmpdir(),'unlazy-manual-'));
const project=join(base,'project'),home=join(base,'home'),approvals=join(base,'approvals');
for(const p of [project,home,approvals])mkdirSync(p,{mode:0o700});
mkdirSync(join(project,'evidence'));
const ledger=join(project,'evidence/acceptance.md');
const initial='# Gates: Prime manual pilot\n\n- [ ] G1: artifact has expected bytes\n  CHECK: '+JSON.stringify(process.execPath)+' verify.mjs\n  EXPECT: ARTIFACT_OK\n  EVIDENCE: pending\n';
writeFileSync(ledger,initial);
// Exact reviewed fixture program, no arbitrary commands or external resources.
writeFileSync(join(project,'verify.mjs'),"import {readFileSync} from 'node:fs';\nif(readFileSync('artifact.txt','utf8')!=='good\\n')throw new Error('artifact mismatch');\nconsole.log('ARTIFACT_OK');\n");
writeFileSync(join(project,'artifact.txt'),'good\n');
const env={PATH:'/usr/bin:/bin',HOME:home,UNLAZY_APPROVAL_DIR:approvals,LANG:'C.UTF-8'};
const results=[];
function run(name,args,extra={}){
 const r=spawnSync(process.execPath,[join(skill,'scripts/gate-check.mjs'),'--root',project,...args,ledger],{cwd:project,env:{...env,...extra},encoding:'utf8',timeout:10000,maxBuffer:100000});
 assert.equal(r.error,undefined);assert.equal(r.signal,null);
 results.push({name,exit:r.status,output:r.stdout+r.stderr});return r;
}
try{
 let rejected=run('status rejects runtime cwd',['--status','--cwd',project]);assert.equal(rejected.status,2);assert.equal(readFileSync(ledger,'utf8'),initial);
 let r=run('status does not execute/write',['--status']);assert.notEqual(r.status,0);assert.equal(readFileSync(ledger,'utf8'),initial);
 r=run('normal unapproved mode refuses',['--cwd',project]);assert.notEqual(r.status,0);assert.equal(readFileSync(ledger,'utf8'),initial);
 r=run('named ledger defaults to adjacent cwd',[]);assert.notEqual(r.status,0);assert.ok((r.stdout+r.stderr).includes(join(project,'evidence')));
 r=run('default approval store inside root refuses',['--approve','--cwd',project],{HOME:project,UNLAZY_APPROVAL_DIR:''});assert.equal(r.status,2);assert.ok((r.stdout+r.stderr).includes('outside the repository root'));assert.equal(existsSync(join(project,'.unlazy')),false);
 r=run('authorized artifact check succeeds',['--approve','--cwd',project]);assert.equal(r.status,0,r.stdout+r.stderr);assert.ok(readFileSync(ledger,'utf8').includes('[x] G1'));
 writeFileSync(join(project,'artifact.txt'),'changed\n');
 r=run('status cannot detect changed artifact',['--status']);assert.equal(r.status,0);
 r=run('fresh reverify catches changed artifact',['--reverify','--cwd',project]);assert.notEqual(r.status,0);assert.ok(readFileSync(ledger,'utf8').includes('[ ] G1'));
 writeFileSync(join(project,'artifact.txt'),'good\n');
 r=run('restored artifact freshly passes',['--reverify','--cwd',project]);assert.equal(r.status,0,r.stdout+r.stderr);
 writeFileSync(ledger,readFileSync(ledger,'utf8')+'\nABANDON: G1 intentional negative-control handoff\n');
 r=run('abandonment is non-success',['--status']);assert.equal(r.status,1);assert.ok((r.stdout+r.stderr).includes('HANDOFF REQUIRED'));
 assert.equal(existsSync(join(home,'.claude')),false);assert.equal(existsSync(join(project,'.claude')),false);
 console.log(JSON.stringify({ok:true,cases:results.length,results}));
}finally{rmSync(base,{recursive:true,force:true});}
