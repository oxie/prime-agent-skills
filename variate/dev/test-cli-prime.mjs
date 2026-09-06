import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { sha } from "../src/core.mjs";
const skill = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cliPath = path.join(skill, "variate.mjs");
function cli(root, ...args) {
  try { return { code: 0, out: execFileSync(process.execPath, [cliPath, ...args, "--root", root], { encoding: "utf8", timeout: 8000, stdio: ["ignore", "pipe", "pipe"] }) }; }
  catch (e) { return { code: e.status, out: String(e.stdout || "") + String(e.stderr || e) }; }
}
function project(t) {
  const root=fs.mkdtempSync(path.join(os.tmpdir(), "variate-cli-test-"));
  t.after(() => fs.rmSync(root, {recursive:true,force:true}));
  return root;
}
async function preview(t,root) {
  const child=spawn(process.execPath,[cliPath,"up","--root",root,"--port","0"],{stdio:["ignore","pipe","pipe"]});
  const exited=new Promise(resolve => child.once("exit",(code,signal)=>resolve({code,signal})));
  t.after(async()=>{ if(child.exitCode===null && child.signalCode===null) child.kill("SIGTERM"); await exited; });
  let stdout="",stderr="";
  await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error(`preview startup timed out: ${stderr} ${stdout}`)),7000);
    child.stdout.on("data",chunk=>{ stdout+=chunk; if(/^(PAGE|VARIATE)\s/m.test(stdout)){ clearTimeout(timer); resolve(); } });
    child.stderr.on("data",chunk=>stderr+=chunk);
    child.once("error",e=>{clearTimeout(timer);reject(e);});
    child.once("exit",()=>{clearTimeout(timer);reject(new Error(`preview exited at startup: ${stderr} ${stdout}`));});
  });
  assert.equal(child.exitCode,null,"up remains a foreground owned process");
  const ledger=JSON.parse(fs.readFileSync(path.join(root,".variate/server.json")));
  assert.equal(ledger.pid,child.pid,"server runs in the recorded CLI process, no detached child");
  return {child,exited,ledger};
}

test("foreground preview completes real lifecycle and preserves preexisting ignore rule", {timeout:15000}, async t=>{
  const root=project(t); fs.mkdirSync(path.join(root,".git"));
  const original="<html><body>original</body></html>";
  fs.writeFileSync(path.join(root,"index.html"),original);
  const ignore=".variate/\nuser-rule/\n"; fs.writeFileSync(path.join(root,".gitignore"),ignore);
  const p=await preview(t,root);
  assert.equal(cli(root,"add","index.html").code,0);
  const set=path.join(root,".variate/index");
  assert.equal(fs.readFileSync(path.join(set,"1.html"),"utf8"),original);
  const variant='<html><body data-variate-section="index">selected</body></html>';
  fs.writeFileSync(path.join(set,"2.html"),variant);
  assert.equal(cli(root,"use","index","2").code,0);
  assert.equal(fs.readFileSync(path.join(root,"index.html"),"utf8"),variant);
  const end=cli(root,"end"); assert.equal(end.code,0,end.out);
  assert.equal((await p.exited).code,0); assert.equal(fs.existsSync(path.join(root,".variate")),false);
  assert.equal(fs.readFileSync(path.join(root,".gitignore"),"utf8"),ignore);
  assert.equal(fs.readFileSync(path.join(root,"index.html"),"utf8"),"<html><body>selected</body></html>");
});
test("owned gitignore creation is removed after preview ends", {timeout:15000}, async t=>{
  const root=project(t); fs.mkdirSync(path.join(root,".git")); fs.writeFileSync(path.join(root,"index.html"),"<html><body>one</body></html>");
  const p=await preview(t,root); assert.ok(fs.existsSync(path.join(root,".gitignore")));
  const end=cli(root,"end"); assert.equal(end.code,0,end.out); await p.exited;
  assert.equal(fs.existsSync(path.join(root,".gitignore")),false);
});
test("Nuxt edited generated plugin blocks cleanup before destroying anything", {timeout:15000}, async t=>{
  const root=project(t); fs.writeFileSync(path.join(root,"nuxt.config.ts"),"export default {};");
  const p=await preview(t,root);
  const file=path.join(root,"plugins/variate.client.ts"); const generated=fs.readFileSync(file);
  const ledger=JSON.parse(fs.readFileSync(path.join(root,".variate/attach.json")));
  assert.equal(ledger.generatedHash,sha(generated));
  fs.writeFileSync(file,Buffer.concat([generated,Buffer.from("// user edit\n")]));
  const end=cli(root,"end"); assert.notEqual(end.code,0); assert.match(end.out,/changed or unverified/);
  assert.ok(fs.existsSync(path.join(root,".variate/attach.json"))); assert.equal(p.child.exitCode,null);
  assert.ok(fs.readFileSync(file,"utf8").endsWith("// user edit\n"));
  fs.writeFileSync(file,generated);
  const retry=cli(root,"end"); assert.equal(retry.code,0,retry.out); await p.exited;
  assert.equal(fs.existsSync(file),false);
});
test("Vite no-final-newline attachment ledger allows exact restoration", {timeout:15000}, async t=>{
  const root=project(t); fs.mkdirSync(path.join(root,"src")); fs.writeFileSync(path.join(root,"vite.config.js"),"export default {};");
  const source='import {\n  a,\n  b\n} from "./dep.js";\nconsole.log(a, b);';
  const file=path.join(root,"src/main.js"); fs.writeFileSync(file,source);
  const p=await preview(t,root);
  assert.equal(JSON.parse(fs.readFileSync(path.join(root,".variate/attach.json"))).separatorAdded,true);
  const end=cli(root,"end"); assert.equal(end.code,0,end.out); await p.exited;
  assert.equal(fs.readFileSync(file,"utf8"),source);
});
test("advisory check reports parser execution failure instead of success", t=>{
  const root=project(t); fs.writeFileSync(path.join(root,"main.ts"),"export const value = 1;\n");
  assert.equal(cli(root,"add","main.ts").code,0);
  fs.writeFileSync(path.join(root,".variate/main/2.ts"),"export const value = 2;\n");
  const ts=path.join(root,"node_modules/typescript"); fs.mkdirSync(path.join(ts,"lib"),{recursive:true});
  fs.writeFileSync(path.join(ts,"lib/typescript.js"),"throw new Error('fixture parser failure');");
  fs.writeFileSync(path.join(ts,"package.json"),JSON.stringify({main:"lib/typescript.js"}));
  const result=cli(root,"check","main"); assert.match(result.out,/TypeScript parser failed to execute/);
});
test("runtime version matches skill metadata and no executable hook installer is shipped",t=>{
  const root=project(t); const result=cli(root,"version"); assert.equal(result.code,0);
  const text=fs.readFileSync(path.join(skill,"SKILL.md"),"utf8");
  assert.ok(text.includes(`version: ${result.out.trim()}`));
  assert.equal(/^hooks:/m.test(text.split("---")[1]),false);
  assert.equal(fs.existsSync(path.join(skill,"scripts/install.mjs")),false);
});

test("unowned existing marked Nuxt plugin is never claimed or removed",{timeout:15000},t=>{
  const root=project(t);fs.writeFileSync(path.join(root,"nuxt.config.ts"),"export default {};");
  fs.mkdirSync(path.join(root,"plugins"));const file=path.join(root,"plugins/variate.client.ts");
  const original="// variate:begin\nconsole.log('user code');\n// variate:end\n";fs.writeFileSync(file,original);
  const result=cli(root,"up","--port","0");assert.equal(result.code,3,result.out);assert.match(result.out,/no trusted attachment ledger/);
  assert.equal(fs.existsSync(path.join(root,".variate/attach.json")),false);assert.equal(fs.readFileSync(file,"utf8"),original);
  assert.equal(cli(root,"end").code,0);assert.equal(fs.readFileSync(file,"utf8"),original);
});
test("sparse extension guidance chooses a vacant slot and releases registration lock",t=>{
  const root=project(t);fs.writeFileSync(path.join(root,"index.html"),"one");assert.equal(cli(root,"add","index.html").code,0);
  for(const n of [3,4])fs.writeFileSync(path.join(root,`.variate/index/${n}.html`),String(n));
  const result=cli(root,"add","index.html");assert.equal(result.code,2);assert.match(result.out,/index\/5\.html/);
  assert.equal(fs.readFileSync(path.join(root,".variate/index/4.html"),"utf8"),"4");
  assert.equal(fs.existsSync(path.join(root,".variate/queue.lock")),false);
});
