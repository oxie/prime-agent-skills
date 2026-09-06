import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawn} from "node:child_process";
import {pathToFileURL} from "node:url";
const skills=path.resolve(process.argv[2]),runtime=path.resolve(process.argv[3]);
const {loadSkillsFromDir}=await import(pathToFileURL(path.join(runtime,"dist/core/skills.js")));
const loaded=loadSkillsFromDir({dir:skills,source:"user"});
assert.equal(loaded.diagnostics.length,0,JSON.stringify(loaded.diagnostics));
for(const name of ["hallmark","variate"])assert.equal(loaded.skills.filter(s=>s.name===name).length,1);
console.log(`native loader PASS: ${loaded.skills.length} skills, no diagnostics`);
const fixture=fs.mkdtempSync(path.join(os.tmpdir(),"hallmark-prime-discovery-"));
for(const d of ["agent","tmp","project"])fs.mkdirSync(path.join(fixture,d));
fs.symlinkSync(skills,path.join(fixture,"agent/skills"),"dir");
const env={...process.env,PRIME_AGENT_CODING_AGENT_DIR:path.join(fixture,"agent"),TMPDIR:path.join(fixture,"tmp")};
for(const k of Object.keys(env))if(k.startsWith("PRIME_AGENT_INTERNAL_"))delete env[k];
const child=spawn("prime-agent",["--mode","rpc","--offline","--no-session","--no-tools","--no-extensions","--no-context-files","--no-prompt-templates","--provider","openai","--model","gpt-4o","--cwd",path.join(fixture,"project")],{env,stdio:["pipe","pipe","pipe"]});
let buffer="",errors="",verified=false;
const timer=setTimeout(()=>child.kill("SIGTERM"),20000);
child.stderr.on("data",c=>errors+=c);child.once("error",e=>console.error(e.message));
child.stdout.on("data",chunk=>{buffer+=chunk;let at;
 while((at=buffer.indexOf("\n"))>=0){const line=buffer.slice(0,at);buffer=buffer.slice(at+1);let m;try{m=JSON.parse(line);}catch{continue;}
 if(m.id!=="hallmark-discovery")continue;
 try{assert.equal(m.success,true,JSON.stringify(m));
   for(const name of ["hallmark","variate"]){const c=m.data.commands.filter(c=>c.name===`skill:${name}`);assert.equal(c.length,1);
     assert.equal(fs.realpathSync(c[0].sourceInfo.path),fs.realpathSync(path.join(skills,name,"SKILL.md")));console.log(`fresh Prime default discovery PASS: skill:${name}`);}
   verified=true;
 }catch(e){console.error(e.message);}child.stdin.end();
 }});
child.stdin.write(JSON.stringify({id:"hallmark-discovery",type:"get_commands"})+"\n");
const result=await new Promise(resolve=>child.once("exit",(code,signal)=>resolve({code,signal})));clearTimeout(timer);
try{assert.equal(result.code,0,`Prime exit ${JSON.stringify(result)}: ${errors.slice(-2000)}`);assert.ok(verified,errors.slice(-2000));console.log("no model request, no runtime configuration changed");}
finally{fs.rmSync(fixture,{recursive:true,force:true});}
