import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { paths, atomicWrite, readSet, sha } from "../src/core.mjs";
import { createRequest, queueState } from "../src/queue.mjs";
import { drainRequests, ackRequest, peekRequests, withQueueLock } from "../src/requests.mjs";
const skill = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "variate-requests-test-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const P = paths(root);
  fs.mkdirSync(path.join(P.VAR, "page"), { recursive: true });
  fs.writeFileSync(path.join(root, "index.html"), "<html><body>one</body></html>");
  fs.writeFileSync(path.join(P.VAR, "page", "target"), "index.html\n");
  fs.copyFileSync(path.join(root, "index.html"), path.join(P.VAR, "page", "1.html"));
  fs.writeFileSync(path.join(P.VAR, "page", "2.html"), "<html><body>two</body></html>");
  return P;
}
function cli(P, ...args) {
  try { return { status: 0, output: execFileSync(process.execPath, [path.join(skill, "variate.mjs"), ...args, "--root", P.ROOT], { encoding: "utf8", timeout: 10000 }) }; }
  catch (e) { return { status: e.status, output: String(e.stderr || e.stdout || e) }; }
}

test("peek/drain after end do not recreate a workspace", t => {
  const P = fixture(t); fs.rmSync(P.VAR, { recursive: true });
  assert.deepEqual(peekRequests(P), { queued: 0, working: 0, pending: 0 });
  assert.deepEqual(drainRequests(P, "session-a"), []);
  const out = cli(P, "drain", "--consumer", "session-a"); assert.equal(out.status, 0);
  assert.equal(fs.existsSync(P.VAR), false);
});
test("claim-before-action crash redelivers without treating receipt as fulfillment", t => {
  const P = fixture(t); const ask = createRequest(P, "more", { set: "page", from: 1 });
  const [first] = drainRequests(P, "session-a"); assert.equal(first.id, ask.id);
  const [retry] = drainRequests(P, "session-a");
  assert.equal(retry.redelivered, true); assert.equal(retry.ackedAt, undefined);
  assert.equal(queueState(P).working.length, 1);
  assert.equal(fs.readFileSync(path.join(P.ROOT, "index.html"), "utf8"), "<html><body>one</body></html>");
});
test("foreign consumer cannot steal or acknowledge unfinished work", t => {
  const P = fixture(t); const ask = createRequest(P, "vary", { hint: "hero" });
  drainRequests(P, "session-a");
  assert.throws(() => drainRequests(P, "session-b"), /another consumer/);
  assert.throws(() => ackRequest(P, ask.id, "session-b", "ok", "wrong owner"), /another consumer/);
  const [recovered] = drainRequests(P, "session-b", ask.id);
  assert.equal(recovered.claimedBy, "session-b"); assert.equal(recovered.redelivered, true);
});
test("explicit ack stores terminal state and a later drain does not redeliver it", t => {
  const P = fixture(t); const ask = createRequest(P, "vary", {}); drainRequests(P, "session-a");
  assert.throws(() => ackRequest(P, ask.id, "session-a", undefined, ""), /explicit/);
  ackRequest(P, ask.id, "session-a", "skipped", "User changed the design brief");
  assert.deepEqual(drainRequests(P, "session-a"), []);
  const done = JSON.parse(fs.readFileSync(path.join(P.REQ_DONE, fs.readdirSync(P.REQ_DONE)[0])));
  assert.equal(done.result, "skipped"); assert.ok(done.ackedAt);
});
test("crash after terminal metadata but before rename is recovered without redoing action", t => {
  const P = fixture(t); createRequest(P, "vary", {}); const [req] = drainRequests(P, "session-a");
  const file = path.join(P.REQ, fs.readdirSync(P.REQ).find(f => f.endsWith(".working")));
  atomicWrite(file, JSON.stringify({ ...req, ackedAt: new Date().toISOString(), result: "ok", note: "completed" }));
  assert.deepEqual(drainRequests(P, "session-b"), []);
  assert.equal(fs.readdirSync(P.REQ_DONE).length, 1);
});
test("queue lock fails closed; neither concurrent consumer overwrites records", t => {
  const P = fixture(t);
  withQueueLock(P, () => assert.throws(() => createRequest(P, "vary", {}), /busy or interrupted/));
  assert.equal(peekRequests(P).pending, 0); assert.equal(fs.existsSync(path.join(P.VAR, "queue.lock")), false);
});
test("keep snapshots are server-derived, not supplied by page text", t => {
  const P = fixture(t); const req = createRequest(P, "done", { set: "page", n: 1, liveHash: "forged", selectedHash: "forged" });
  const hash = sha(fs.readFileSync(path.join(P.ROOT, "index.html")));
  assert.equal(req.params.liveHash, hash); assert.equal(req.params.selectedHash, hash);
  assert.equal(createRequest(P, "done", { set: "page", n: 2 }).error.includes("changed"), true);
});
test("stale keep refuses without overwriting newer hand edits or removing alternatives", t => {
  const P = fixture(t); const req = createRequest(P, "done", { set: "page", n: 1 }); drainRequests(P, "session-a");
  fs.writeFileSync(path.join(P.ROOT, "index.html"), "newer hand edit");
  const out = cli(P, "end", "--request", req.id, "--consumer", "session-a");
  assert.notEqual(out.status, 0); assert.match(out.output, /changed after keep/);
  assert.equal(fs.readFileSync(path.join(P.ROOT, "index.html"), "utf8"), "newer hand edit");
  assert.ok(readSet(P, "page")); assert.equal(queueState(P).working.length, 1);
});
test("end refuses pending asks and preserves all state", t => {
  const P = fixture(t); createRequest(P, "vary", { hint: "new nav" });
  const out = cli(P, "end"); assert.notEqual(out.status, 0); assert.match(out.output, /unfinished/);
  assert.ok(fs.existsSync(path.join(P.VAR, "page", "1.html")));
});
test("final keep validates and acknowledges before removing queue; later peek stays absent", t => {
  const P = fixture(t); const req = createRequest(P, "done", { set: "page", n: 1 }); drainRequests(P, "session-a");
  const out = cli(P, "end", "--request", req.id, "--consumer", "session-a");
  assert.equal(out.status, 0, out.output); assert.equal(fs.existsSync(P.VAR), false);
  assert.deepEqual(peekRequests(P), { queued: 0, working: 0, pending: 0 });
  assert.equal(fs.readFileSync(path.join(P.ROOT, "index.html"), "utf8"), "<html><body>one</body></html>");
});
test("legacy waiting and wake flags are refused without creating state", t => {
  const P = fixture(t); fs.rmSync(P.VAR, { recursive: true });
  assert.notEqual(cli(P, "await", "--timeout", "20").status, 0);
  assert.notEqual(cli(P, "peek", "--hook").status, 0);
  assert.equal(fs.existsSync(P.VAR), false);
});
test("new cannot discard existing baseline and hidden targets cannot be registered", t => {
  const P = fixture(t); fs.rmSync(path.join(P.VAR, "page"), { recursive: true });
  assert.notEqual(cli(P, "add", "index.html", "--new").status, 0);
  fs.writeFileSync(path.join(P.ROOT, ".env"), "private fixture");
  assert.notEqual(cli(P, "add", ".env").status, 0);
  assert.equal(fs.readFileSync(path.join(P.ROOT, "index.html"), "utf8"), "<html><body>one</body></html>");
});

test("malformed queued and working records block end without file loss", t => {
  const P=fixture(t); fs.mkdirSync(P.REQ,{recursive:true});
  for(const suffix of ["json","json.working"]){
    const file=path.join(P.REQ,`0001-vary.${suffix}`);fs.writeFileSync(file,"{truncated");
    const result=cli(P,"end"); assert.notEqual(result.status,0); assert.match(result.output,/Unreadable request/);
    assert.equal(fs.readFileSync(file,"utf8"),"{truncated");assert.ok(fs.existsSync(path.join(P.VAR,"page/2.html")));fs.unlinkSync(file);
  }
});
test("producers cannot recreate a closed workspace",t=>{
  const P=fixture(t);fs.rmSync(P.VAR,{recursive:true});
  assert.throws(()=>createRequest(P,"vary",{}),/No variate session/);assert.equal(fs.existsSync(P.VAR),false);
});
test("old lock owner never removes a replacement holder's lock",t=>{
  const P=fixture(t),lock=path.join(P.VAR,"queue.lock");
  withQueueLock(P,()=>{fs.renameSync(lock,lock+".old");fs.writeFileSync(lock,"new owner");});
  assert.equal(fs.readFileSync(lock,"utf8"),"new owner");
});
test("cooperating offline use narrow and add refuse a busy mutation lock",t=>{
  const P=fixture(t);withQueueLock(P,()=>{
    for(const args of [["use","page","2"],["narrow","page","1"],["add","index.html"]]) {
      const result=cli(P,...args);assert.notEqual(result.status,0);assert.match(result.output,/queue busy or interrupted/);
    }
  });assert.equal(fs.readFileSync(path.join(P.ROOT,"index.html"),"utf8"),"<html><body>one</body></html>");
});

test("edit injected after keep preflight preserves live bytes alternatives and unfinished claim",t=>{
  const P=fixture(t);const req=createRequest(P,"done",{set:"page",n:1});drainRequests(P,"session-a");
  const preload=path.join(P.ROOT,"inject.mjs");
  fs.writeFileSync(preload,`import fs from "node:fs"; const rename=fs.renameSync;
    fs.renameSync=function(from,to,...args){const result=rename.call(this,from,to,...args);
      if(to===${JSON.stringify(P.BOARD)})fs.writeFileSync(${JSON.stringify(path.join(P.ROOT,"index.html"))},"late user edit");return result;};`);
  let failure;
  try{execFileSync(process.execPath,["--import",preload,path.join(skill,"variate.mjs"),"end","page","--request",req.id,"--consumer","session-a","--root",P.ROOT],{timeout:8000,stdio:"pipe"});}
  catch(e){failure=e;}
  assert.ok(failure);assert.match(String(failure.stderr),/stale file changed before cleanup/);
  assert.equal(fs.readFileSync(path.join(P.ROOT,"index.html"),"utf8"),"late user edit");
  assert.ok(fs.existsSync(path.join(P.VAR,"page/1.html")));assert.ok(fs.existsSync(path.join(P.VAR,"page/2.html")));
  assert.equal(peekRequests(P).working,1);assert.equal(fs.existsSync(path.join(P.VAR,"queue.lock")),false);
});
