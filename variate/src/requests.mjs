// Nonblocking, single-consumer durable request handling for Prime Agent.
import fs from "node:fs";
import path from "node:path";
import { safePath, atomicWrite, readJsonSafe, nowIso } from "./core.mjs";

function entries(P, suffix) {
  safePath(P.ROOT, P.REQ);
  if (!fs.existsSync(P.REQ)) return [];
  return fs.readdirSync(P.REQ).filter(f => /^\d+-/.test(f) && f.endsWith(suffix)).sort()
    .map(f => safePath(P.ROOT, path.join(P.REQ, f)));
}
export function withQueueLock(P, fn) {
  const lock = safePath(P.ROOT, path.join(P.VAR, "queue.lock"));
  if (!fs.existsSync(P.VAR)) throw new Error("No variate session; register a set or start a preview first");
  let fd;
  try { fd = fs.openSync(lock, "wx", 0o600); }
  catch (e) { if (e.code === "EEXIST") throw new Error("Request queue busy or interrupted: inspect queue.lock; never steal a live lock"); throw e; }
  try { fs.writeFileSync(fd, JSON.stringify({ pid: process.pid, at: nowIso() })); return fn(); }
  finally {
    const owned = fs.fstatSync(fd);
    fs.closeSync(fd);
    try {
      const current = fs.lstatSync(lock);
      if (current.dev === owned.dev && current.ino === owned.ino) fs.unlinkSync(lock);
    } catch (e) { if (e.code !== "ENOENT") throw e; }
  }
}
function identity(consumer) {
  if (typeof consumer !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(consumer))
    throw new Error("drain/ack requires --consumer <stable-session-id>");
  return consumer;
}
function idValue(id) {
  if (!/^\d{1,16}$/.test(String(id))) throw new Error("Invalid request id");
  return String(id);
}
function requestFile(P, id) {
  const prefix = idValue(id) + "-";
  const matches = entries(P, ".json.working").filter(f => path.basename(f).startsWith(prefix));
  if (matches.length !== 1) throw new Error(`Request ${id} is not uniquely claimed`);
  return matches[0];
}
export function claimedRequest(P, id, consumer) {
  identity(consumer);
  const file = requestFile(P, id);
  const req = readJsonSafe(file);
  if (!req || req.claimedBy !== consumer) throw new Error(`Request ${id} belongs to another consumer or needs explicit recovery`);
  return req;
}
function finishAck(P, file, req) {
  const dest = safePath(P.ROOT, path.join(P.REQ_DONE, path.basename(file).replace(/\.working$/, "")));
  fs.mkdirSync(P.REQ_DONE, { recursive: true });
  if (fs.existsSync(dest)) throw new Error(`Duplicate terminal record for request ${req.id}; inspect before recovery`);
  fs.renameSync(file, dest);
}
export function ackRequest(P, id, consumer, result, note, { locked = false } = {}) {
  identity(consumer); idValue(id);
  if (!["ok", "skipped", "failed"].includes(result) || typeof note !== "string" || !note.trim())
    throw new Error("Acknowledgement requires explicit --result ok|skipped|failed and --note");
  const apply = () => {
    const file = requestFile(P, id);
    const req = claimedRequest(P, id, consumer);
    const done = { ...req, ackedAt: nowIso(), result, note: note.trim().slice(0, 300) };
    // Persist terminal state BEFORE atomic rename. Recovery recognizes it as
    // finished; a claim alone is never evidence that an action completed.
    atomicWrite(file, JSON.stringify(done, null, 2) + "\n");
    finishAck(P, file, done);
    return done;
  };
  return locked ? apply() : withQueueLock(P, apply);
}
export function peekRequests(P) {
  const queued = entries(P, ".json");
  const working = entries(P, ".json.working");
  return { queued: queued.length, working: working.length, pending: queued.length + working.length };
}
export function drainRequests(P, consumer, reclaim = null) {
  identity(consumer);
  if (!fs.existsSync(P.VAR)) return [];
  return withQueueLock(P, () => {
    let working = entries(P, ".json.working");
    // Repair a crash after durable acknowledgement but before its rename.
    for (const file of working) {
      const req = readJsonSafe(file);
      if (!req) throw new Error(`Unreadable claimed request: ${path.basename(file)}`);
      if (req.ackedAt && ["ok", "skipped", "failed"].includes(req.result)) finishAck(P, file, req);
    }
    working = entries(P, ".json.working");
    if (reclaim != null) {
      const file = requestFile(P, reclaim);
      const req = readJsonSafe(file);
      atomicWrite(file, JSON.stringify({ ...req, claimedBy: consumer, recoveredAt: nowIso() }, null, 2) + "\n");
    }
    const batch = [];
    for (const file of working) {
      const req = readJsonSafe(file);
      if (req.claimedBy !== consumer) throw new Error(`Request ${req.id} belongs to another consumer; verify it stopped before explicit --reclaim ${req.id}`);
      batch.push({ ...req, redelivered: true });
    }
    for (const file of entries(P, ".json")) {
      const req = readJsonSafe(file);
      if (!req?.id) throw new Error(`Unreadable queued request: ${path.basename(file)}`);
      const dest = safePath(P.ROOT, file + ".working");
      if (fs.existsSync(dest)) throw new Error(`Duplicate claim ${req.id}`);
      // A crash in the rename/metadata window leaves an unowned request that
      // requires explicit reclaim, rather than being silently dropped.
      fs.renameSync(file, dest);
      const claimed = { ...req, claimedBy: consumer, claimedAt: nowIso() };
      atomicWrite(dest, JSON.stringify(claimed, null, 2) + "\n");
      batch.push(claimed);
    }
    return batch;
  });
}
