import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import { startSidecar } from "../src/sidecar.mjs";

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "variate-http-test-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const put = (rel, content) => {
    const file = path.join(root, rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
    return file;
  };
  return { root, put };
}
async function launch(t, root, serve = true) {
  const sidecar = await startSidecar({ root, port: 0, serve });
  t.after(() => sidecar.close());
  return sidecar;
}
function request(sidecar, url, { method = "GET", headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: "127.0.0.1", port: sidecar.port, path: url, method, headers, agent: false }, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("error", reject);
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString() }));
    });
    req.setTimeout(3000, () => req.destroy(new Error("test HTTP timeout")));
    req.on("error", reject);
    req.end(body == null ? undefined : JSON.stringify(body));
  });
}

test("HTTP static serving refuses direct and resolved hidden paths, allows safe aliases", async (t) => {
  const { root, put } = fixture(t);
  put("index.html", "<body>visible home</body>");
  put("visible.txt", "public bytes");
  const secret = put(".env", "PRIVATE=not-served");
  put(".private/index.html", "private directory");
  fs.symlinkSync(secret, path.join(root, "env-alias.txt"));
  fs.symlinkSync(path.join(root, ".private"), path.join(root, "private-alias"));
  fs.symlinkSync(path.join(root, "visible.txt"), path.join(root, "safe-alias.txt"));
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), "variate-http-outside-"));
  t.after(() => fs.rmSync(outside, { recursive: true, force: true }));
  fs.writeFileSync(path.join(outside, "secret.txt"), "outside private");
  fs.symlinkSync(path.join(outside, "secret.txt"), path.join(root, "outside.txt"));
  const sidecar = await launch(t, root);
  fs.symlinkSync(path.join(root, ".variate/token"), path.join(root, "token-alias.txt"));
  fs.symlinkSync(path.join(root, ".variate"), path.join(root, "state-alias"));
  for (const url of ["/.env", "/.variate/token", "/env-alias.txt", "/private-alias/", "/token-alias.txt", "/state-alias/token", "/outside.txt", "/%2eenv"]) {
    const response = await request(sidecar, url);
    assert.equal(response.status, 403, url);
    assert.equal(response.body, "no", url);
  }
  const home = await request(sidecar, "/");
  assert.equal(home.status, 200);
  assert.match(home.body, /visible home/);
  assert.match(home.body, /src="\/v.js"/);
  assert.equal((await request(sidecar, "/safe-alias.txt")).body, "public bytes");
  assert.equal((await request(sidecar, "/missing.txt")).status, 404);
});

test("actual HTTP Host, Origin and Bearer boundaries still gate reads and writes", async (t) => {
  const { root, put } = fixture(t);
  const target = put("index.html", "first");
  put(".variate/page/target", "index.html\n");
  put(".variate/page/1.html", "first");
  put(".variate/page/2.html", "second");
  const sidecar = await launch(t, root);
  const auth = { Authorization: `Bearer ${sidecar.token}` };
  const body = { set: "page", to: 2 };
  assert.equal(sidecar.server.address().address, "127.0.0.1");
  assert.equal((await request(sidecar, "/health", { headers: { Host: "evil.example" } })).status, 403);
  assert.equal((await request(sidecar, "/health", { headers: { Origin: "https://evil.example" } })).status, 403);
  assert.equal((await request(sidecar, "/state")).status, 401);
  const state = await request(sidecar, `/state?t=${sidecar.token}`);
  assert.equal(state.status, 200);
  assert.equal(JSON.parse(state.body).agent, "on-request");
  assert.equal((await request(sidecar, "/state", { headers: { ...auth, Origin: "null" } })).status, 200);
  assert.equal((await request(sidecar, `/switch?t=${sidecar.token}`, { method: "POST", body })).status, 401);
  assert.equal((await request(sidecar, "/switch", { method: "POST", body, headers: { ...auth, Origin: "null" } })).status, 403);
  assert.equal((await request(sidecar, "/switch", { method: "POST", body, headers: { ...auth, Origin: "https://evil.example" } })).status, 403);
  assert.equal(fs.readFileSync(target, "utf8"), "first");
  const switched = await request(sidecar, "/switch", { method: "POST", body, headers: { ...auth, Origin: "http://localhost:3000" } });
  assert.equal(switched.status, 200);
  assert.equal(switched.headers["access-control-allow-origin"], "http://localhost:3000");
  assert.equal(fs.readFileSync(target, "utf8"), "second");
  const card = await request(sidecar, "/v.js");
  assert.equal(card.status, 200);
  assert.ok(card.body.includes(`"port":${sidecar.port}`));
  const unknown = await request(sidecar, "/switch", { method: "POST", body: { set: "page", to: 99 }, headers: auth });
  assert.equal(unknown.status, 400);
});

test("HTTP switches reject symlinked targets without altering the victim", async (t) => {
  const { root, put } = fixture(t);
  const target = put("index.html", "first");
  const victim = put("victim.html", "do not touch");
  put(".variate/page/target", "index.html\n");
  put(".variate/page/1.html", "first");
  put(".variate/page/2.html", "second");
  const sidecar = await launch(t, root);
  fs.unlinkSync(target);
  fs.symlinkSync(victim, target);
  const response = await request(sidecar, "/switch", { method: "POST", headers: { Authorization: `Bearer ${sidecar.token}` }, body: { set: "page", to: 2 } });
  assert.ok(response.status >= 400, response.body);
  assert.equal(fs.readFileSync(victim, "utf8"), "do not touch");
});

test("sidecar startup refuses token and state symlink write paths", async (t) => {
  for (const rel of [".variate/token", ".variate/server.json", ".variate/state", ".variate/requests"]) {
    const { root, put } = fixture(t);
    const victim = put("untouched", "original");
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.symlinkSync(victim, path.join(root, rel));
    await assert.rejects(async () => startSidecar({ root, port: 0 }), /symlink/i);
    assert.equal(fs.readFileSync(victim, "utf8"), "original");
  }
});


test("HTTP switch checks breadcrumb paths before changing the target", async (t) => {
  const { root, put } = fixture(t);
  const target = put("index.html", "first");
  const victim = put("victim.txt", "untouched");
  put(".variate/page/target", "index.html\n");
  put(".variate/page/1.html", "first");
  put(".variate/page/2.html", "second");
  const sidecar = await launch(t, root);
  fs.symlinkSync(victim, path.join(root, ".variate/state/last-switch.json"));
  const response = await request(sidecar, "/switch", { method: "POST", headers: { Authorization: `Bearer ${sidecar.token}` }, body: { set: "page", to: 2 } });
  assert.ok(response.status >= 400, response.body);
  assert.equal(fs.readFileSync(target, "utf8"), "first");
  assert.equal(fs.readFileSync(victim, "utf8"), "untouched");
});

test("startup rejects a late symlink ledger and tears down its socket", async (t) => {
  const { root, put } = fixture(t);
  const victim = put("victim.txt", "untouched");
  const started = startSidecar({ root, port: 0 });
  fs.symlinkSync(victim, path.join(root, ".variate/server.json"));
  await assert.rejects(started, /symlink/i);
  assert.equal(fs.readFileSync(victim, "utf8"), "untouched");
});


test("HTTP shutdown closes only the sidecar, including SSE, not its host process", async (t) => {
  const { root } = fixture(t);
  const sidecar = await launch(t, root);
  const auth = { Authorization: `Bearer ${sidecar.token}` };
  let stream;
  const ready = new Promise((resolve, reject) => {
    const req = http.get({ host: "127.0.0.1", port: sidecar.port, path: "/events", headers: auth, agent: false }, (res) => {
      stream = res;
      res.once("data", () => resolve());
      res.on("error", reject);
    });
    req.on("error", reject);
    req.setTimeout(3000, () => req.destroy(new Error("SSE test timeout")));
    t.after(() => req.destroy());
  });
  await ready;
  const streamClosed = new Promise((resolve) => stream.once("close", resolve));
  const response = await request(sidecar, "/shutdown", { method: "POST", headers: auth });
  assert.equal(response.status, 200);
  assert.equal(JSON.parse(response.body).bye, true);
  await sidecar.close();
  await streamClosed;
  assert.equal(sidecar.server.listening, false);
  // These assertions run in the very process /shutdown used to terminate.
  assert.equal(typeof process.pid, "number");
  await assert.rejects(request(sidecar, "/health"), /ECONNREFUSED/);
  await sidecar.close(); // Explicit teardown is safe after HTTP shutdown.
});

test("HTTP switch refuses the shared cleanup lock without changing target",async t=>{
  const {root,put}=fixture(t);put("index.html","one");put(".variate/page/target","index.html\n");
  put(".variate/page/1.html","one");put(".variate/page/2.html","two");
  const sidecar=await launch(t,root);put(".variate/queue.lock","held by cleanup");
  const result=await request(sidecar,"/switch",{method:"POST",headers:{Authorization:`Bearer ${sidecar.token}`,"Content-Type":"application/json"},body:{set:"page",to:2}});
  assert.notEqual(result.status,200);assert.match(result.body,/queue busy or interrupted/);
  assert.equal(fs.readFileSync(path.join(root,"index.html"),"utf8"),"one");
});
