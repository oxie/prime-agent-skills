// Shared internals for variate. Zero dependencies.
//
// The model, entire: a SET is one target file plus N alternatives living in
// .variate/<set>/. Variant 1 starts as the user's original. Narrowing saves
// that baseline in .dropped before replacing 1. Switching atomically replaces
// the target file with a variant and the user's own dev server
// re-renders it. Which variant is live is never stored: it is derived by
// hashing the target against each variant, so there is nothing to desync.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// The one copy of the version. SKILL.md's frontmatter states it too (a skill
// file cannot import), and smoke-cli trips when the two drift.
export const VERSION = "3.2.0-prime.1";

export const sha = (buf) => crypto.createHash("sha256").update(buf).digest("hex");
export const nowIso = () => new Date().toISOString();

export function readSafe(file) {
  try { return fs.readFileSync(file, "utf8"); } catch { return null; }
}

export function readBytes(file) {
  try { return fs.readFileSync(file); } catch { return null; }
}

/** Resolve lexically inside root; never follow a symlink below that root.
 * Missing descendants are allowed. The project root itself may be a symlink.
 * This is a local safety check, not a sandbox against actively racing writers.
 */
export function safePath(root, candidate) {
  const base = path.resolve(root);
  const file = path.resolve(base, candidate);
  const rel = path.relative(base, file);
  if (rel === ".." || rel.startsWith(".." + path.sep) || path.isAbsolute(rel)) {
    throw new Error(`path outside project: ${candidate}`);
  }
  let at = base;
  for (const part of rel.split(path.sep).filter(Boolean)) {
    at = path.join(at, part);
    let st;
    try { st = fs.lstatSync(at); }
    catch (err) {
      if (err.code === "ENOENT") continue;
      throw err;
    }
    if (st.isSymbolicLink()) throw new Error(`symlink path refused: ${at}`);
  }
  return file;
}

function checkedFile(file) {
  const absolute = path.resolve(file);
  return safePath(path.parse(absolute).root, absolute);
}

function snapshot(file) {
  checkedFile(file);
  try {
    const stat = fs.statSync(file);
    if (!stat.isFile()) throw new Error(`not a regular file: ${file}`);
    return { body: fs.readFileSync(file), mode: stat.mode & 0o7777 };
  } catch (err) {
    if (err.code === "ENOENT") return { body: null, mode: null };
    throw err;
  }
}

function sameBytes(a, b) {
  return a === null ? b === null : b !== null && a.equals(b);
}

/** Mode-preserving temp + rename. Detect ordinary stale writes before replace.
 * This does not make a multi-file operation transactional or prevent a local
 * process from racing the final check and rename.
 */
export function atomicWrite(file, content, opts = {}) {
  file = checkedFile(file);
  const before = snapshot(file);
  const expected = Object.hasOwn(opts, "expected") ? opts.expected : before.body;
  if (!sameBytes(before.body, expected)) throw new Error(`stale file changed: ${file}`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  checkedFile(file);
  const tmp = file + ".tmp-" + process.pid + "-" + crypto.randomBytes(12).toString("hex");
  let fd;
  let created = false;
  try {
    fd = fs.openSync(tmp, "wx", before.mode ?? 0o666);
    created = true;
    fs.writeFileSync(fd, content);
    if (before.mode !== null) fs.fchmodSync(fd, before.mode);
    fs.closeSync(fd);
    fd = undefined;
    if (!sameBytes(snapshot(file).body, expected)) throw new Error(`stale file changed: ${file}`);
    fs.renameSync(tmp, file);
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
    if (created && fs.existsSync(tmp)) fs.unlinkSync(tmp);
  }
}

export function readJsonSafe(file) {
  const raw = readSafe(file);
  if (raw == null) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function statMtimeSafe(p) {
  try { return fs.statSync(p).mtimeMs; } catch { return null; }
}

export function slug(raw) {
  const s = String(raw ?? "").toLowerCase().trim()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return s || "set";
}

/** Escape a string for literal use inside a RegExp source. */
export const escapeRe = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Stable per-project port in 4100-4899, so two projects' cards never contend
 * and the script tag URL is deterministic for a given root.
 */
export function defaultPortFor(rootAbs) {
  const h = crypto.createHash("sha1").update(String(rootAbs)).digest();
  return 4100 + (h.readUInt32BE(0) % 800);
}

/** Every path variate knows about, derived once from the project root. */
export function paths(root) {
  const ROOT = fs.realpathSync(path.resolve(root));
  const VAR = path.join(ROOT, ".variate");
  const P = {
    ROOT,
    VAR,
    SETS: VAR,
    REQ: path.join(VAR, "requests"),
    REQ_DONE: path.join(VAR, "requests", "done"),
    STATE: path.join(VAR, "state"),
    // what this session has already settled; see recordSettled
    BOARD: path.join(VAR, "board.json"),
    // scripts/await.mjs owns this file; it runs with --ws <root>/.variate
    HEARTBEAT: path.join(VAR, "state", "agent.heartbeat"),
    // written by the sidecar on every /switch; read by await's idle report
    LAST_SWITCH: path.join(VAR, "state", "last-switch.json"),
    SERVER_JSON: path.join(VAR, "server.json"),
    TOKEN: path.join(VAR, "token"),
    ATTACH: path.join(VAR, "attach.json"),
    LOG: path.join(VAR, "server.log"),
  };
  for (const file of Object.values(P)) safePath(ROOT, file);
  return P;
}

// ---------------------------------------------------------------------------
// sets

const RESERVED = new Set(["requests", "done", "node_modules"]);

/** A set dir holds: target (one line), plan.json, and 1.<ext> .. N.<ext>. */
export function listSets(P) {
  safePath(P.ROOT, P.SETS);
  let names;
  try { names = fs.readdirSync(P.SETS, { withFileTypes: true }); } catch { return []; }
  const out = [];
  for (const e of names) {
    safePath(P.ROOT, path.join(P.SETS, e.name));
    if (!e.isDirectory() || e.name.startsWith(".") || RESERVED.has(e.name)) continue;
    const s = readSet(P, e.name);
    if (s) out.push(s);
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

export function readSet(P, name) {
  const dir = setDir(P, name);
  if (!dir) return null;
  const targetRel = (readSafe(safePath(P.ROOT, path.join(dir, "target"))) ?? "").trim();
  if (!targetRel) return null;
  const target = safePath(P.ROOT, targetRel);

  const ext = path.extname(target);
  const variants = [];
  // Enumerate real positions rather than stopping at an arbitrary upper cap.
  const numbered = new RegExp(`^([1-9][0-9]*)${escapeRe(ext)}$`);
  for (const entry of fs.readdirSync(dir)) {
    const f = safePath(P.ROOT, path.join(dir, entry));
    const match = numbered.exec(entry);
    if (!match) continue;
    const n = Number(match[1]);
    if (!Number.isSafeInteger(n)) throw new Error(`variant position too large: ${entry}`);
    const body = snapshot(f).body;
    if (body === null) throw new Error(`variant could not be read: ${f}`);
    variants.push({ n, file: f, sha: sha(body) });
  }
  variants.sort((a, b) => a.n - b.n);
  const { question, plan } = readPlan(safePath(P.ROOT, path.join(dir, "plan.json")));
  const live = readBytes(target);
  const liveSha = live ? sha(live) : null;
  // Derived, never stored: which variant the target currently equals.
  const at = liveSha ? (variants.find((v) => v.sha === liveSha)?.n ?? null) : null;

  return {
    name, dir, targetRel, target, ext,
    n: variants.length,
    variants,
    question,
    plan,
    at,
    exists: !!live,
  };
}

/**
 * A round is a question with named answers, and each answer can say what it
 * changes and what that costs:
 *
 *   { "question": "...", "positions": [{ "name", "angle", "cost" }, ...] }
 *
 * A bare array of strings is still a plan, just one where every position is a
 * name and nothing else. Both shapes normalize to the same thing here, so
 * nothing downstream has to know which was written.
 */
export function readPlan(file) {
  const raw = readJsonSafe(file);
  const list = Array.isArray(raw) ? raw : Array.isArray(raw?.positions) ? raw.positions : [];
  const str = (v) => (v == null || v === "" ? null : String(v));
  return {
    question: str(raw && !Array.isArray(raw) ? raw.question : null),
    plan: list.map((p) => (typeof p === "string" || p == null
      ? { name: str(p), angle: null, cost: null }
      : { name: str(p.name), angle: str(p.angle), cost: str(p.cost) })),
  };
}

export function setDir(P, name) {
  const clean = slug(name);
  if (!clean || RESERVED.has(clean)) return null;
  const dir = safePath(P.ROOT, path.join(P.SETS, clean));
  if (!dir.startsWith(P.SETS + path.sep)) return null;
  return fs.existsSync(dir) ? dir : null;
}

/** The public shape the card sees. Never leaks absolute paths. */
export function setSummary(s) {
  return {
    name: s.name,
    target: s.targetRel,
    n: s.n,                                   // how many exist
    have: s.variants.map((v) => v.n),         // which positions exist: they can arrive out of order
    max: s.variants.length ? s.variants[s.variants.length - 1].n : 0,
    at: s.at,
    question: s.question,
    plan: s.plan,
    missing: !s.exists,
  };
}

// ---------------------------------------------------------------------------
// the board
//
// A page is not one round. Someone prototyping a landing page settles the
// hero, then the nav, then the pricing, and each closed round takes its own
// directory with it, so by the end nothing remembers what was decided or why.
// The board is the thin thread through a session: one line per settled piece,
// written when a round closes, read back as the closing recap. It lives
// inside .variate and leaves with it. Nothing is ever written to the user's
// own tree, and nothing depends on this file existing.

export function readBoard(P) {
  const b = readJsonSafe(safePath(P.ROOT, P.BOARD));
  return {
    settled: Array.isArray(b?.settled) ? b.settled : [],
    passed: Array.isArray(b?.passed) ? b.passed : [],
  };
}

// What the user turned down is worth remembering as much as what they kept:
// a direction they passed over is not a fresh idea two rounds later, and the
// board is how a later draft knows. Position 1 is their own baseline, so
// moving off it is never recorded as a rejection.
export function recordPassed(P, piece, entries) {
  try {
    const board = readBoard(P);
    let grew = false;
    for (const e of entries) {
      if (!e?.name) continue;
      if (board.passed.some((p) => p.piece === piece && p.name === e.name)) continue;
      board.passed.push({ piece, name: e.name, ...(e.angle ? { angle: e.angle } : {}), at: nowIso() });
      grew = true;
    }
    if (grew) atomicWrite(P.BOARD, JSON.stringify(board, null, 2) + "\n");
  } catch { /* advisory: a broken board never blocks a round */ }
}

export function recordSettled(P, s, why) {
  // Only positions the user could actually have SEEN count as turned down.
  // A round is often decided before the last file lands, and killing off a
  // direction nobody ever looked at is worse than not remembering at all.
  recordPassed(P, s.name, s.plan
    .map((p, i) => ({ ...p, n: i + 1 }))
    .filter((p) => p.n !== 1 && p.n !== (s.at ?? -1))
    .filter((p) => s.variants.some((v) => v.n === p.n)));
  try {
    const board = readBoard(P);
    const kept = s.at ? (s.plan[s.at - 1]?.name ?? `position ${s.at}`) : "your own edit";
    board.settled = board.settled.filter((e) => e.piece !== s.name);
    board.settled.push({
      piece: s.name,
      target: s.targetRel,
      question: s.question ?? null,
      kept,
      why: why ?? null,
      at: nowIso(),
    });
    atomicWrite(P.BOARD, JSON.stringify(board, null, 2) + "\n");
    return kept;
  } catch { return null; }   // advisory: a broken board never blocks a round
}

/** plan.json as we write it back: the object form, without empty fields. */
function writablePlan(question, positions) {
  const out = {};
  if (question) out.question = question;
  out.positions = positions.map((p) => {
    const o = { name: p?.name ?? null };
    if (p?.angle) o.angle = p.angle;
    if (p?.cost) o.cost = p.cost;
    return o;
  });
  return out;
}

// Scratch snapshots are exclusive: never clobber another saved edit.
function writeExclusive(P, file, body, mode) {
  file = safePath(P.ROOT, file);
  const fd = fs.openSync(file, "wx", mode ?? 0o666);
  try {
    fs.writeFileSync(fd, body);
    if (mode != null) fs.fchmodSync(fd, mode);
  } catch (err) {
    fs.closeSync(fd);
    fs.unlinkSync(file);
    throw err;
  }
  fs.closeSync(fd);
}

function archive(P, s, attic, tag, body, mode) {
  let dest = safePath(P.ROOT, path.join(attic, `${tag}${s.ext}`));
  for (let i = 2; fs.existsSync(dest); i++) {
    dest = safePath(P.ROOT, path.join(attic, `${tag}-${i}${s.ext}`));
  }
  writeExclusive(P, dest, body, mode);
}

/**
 * Narrow to a new position 1. Save every source (including the original
 * baseline and any unmatched live edit) in .dropped before replacing files.
 * These recovery copies last until the user explicitly ends the set.
 */
export function narrowTo(P, name, n) {
  const s = readSet(P, name);
  if (!s) return { error: `no set "${name}"` };
  const keep = s.variants.find((v) => v.n === Number(n));
  if (!keep) return { error: `set "${s.name}" has no variant ${n} (has ${s.variants.map((v) => v.n).join(", ") || "none"})` };
  const live = snapshot(s.target);
  const chosen = snapshot(safePath(P.ROOT, keep.file));
  const body = chosen.body;
  if (body === null || sha(body) !== keep.sha) throw new Error(`variant ${n} changed or could not be read`);
  if (s.n === 1 && keep.n === 1 && sameBytes(live.body, body)) {
    return { ok: true, kept: 1, removed: 0, noop: true };
  }
  const kept = s.plan[keep.n - 1] ?? null;
  const label = kept?.name ?? null;
  const attic = safePath(P.ROOT, path.join(s.dir, ".dropped"));
  const first = safePath(P.ROOT, path.join(s.dir, `1${s.ext}`));
  const planFile = safePath(P.ROOT, path.join(s.dir, "plan.json"));
  const oldPlan = snapshot(planFile).body;
  const originals = s.variants.map((v) => {
    const source = snapshot(safePath(P.ROOT, v.file));
    if (source.body === null || sha(source.body) !== v.sha) throw new Error(`variant ${v.n} changed`);
    return { ...v, ...source };
  });
  fs.mkdirSync(attic, { recursive: true });
  // Copy all sources first. Even the chosen source remains recoverable if a
  // later write fails. Do not remove numbered originals before target replace.
  for (const v of originals) {
    const tag = `${v.n}-${slug(s.plan[v.n - 1]?.name ?? `position-${v.n}`)}`;
    archive(P, s, attic, tag, v.body, v.mode);
  }
  if (live.body !== null && !s.variants.some((v) => v.sha === sha(live.body))) {
    archive(P, s, attic, "live-your-own-edit", live.body, live.mode);
  }
  if (!sameBytes(live.body, body)) atomicWrite(s.target, body, { expected: live.body });
  // Recheck even on an HMR-saving no-op, before touching the scratch originals.
  else if (!sameBytes(snapshot(s.target).body, live.body)) throw new Error(`stale file changed: ${s.target}`);
  atomicWrite(first, body, { expected: originals.find((v) => v.n === 1)?.body ?? null });
  atomicWrite(planFile,
    JSON.stringify(writablePlan(s.question, [kept ?? { name: "where you landed" }]), null, 2) + "\n",
    { expected: oldPlan });
  for (const v of originals) {
    if (v.n === 1) continue;
    safePath(P.ROOT, v.file);
    if (!sameBytes(snapshot(v.file).body, v.body)) throw new Error(`variant ${v.n} changed`);
    fs.unlinkSync(v.file);
  }
  recordPassed(P, s.name, s.variants
    .filter((v) => v.n !== keep.n && v.n !== 1)
    .map((v) => s.plan[v.n - 1]).filter(Boolean));
  return { ok: true, kept: 1, was: Number(n), removed: s.n - 1, label };
}

/** Switch atomically, first adopting any unmatched live edit as a free slot. */
export function switchTo(P, name, n, opts = {}) {
  const s = readSet(P, name);
  if (!s) return { error: `no set "${name}"` };
  const target = s.variants.find((v) => v.n === Number(n));
  if (!target) return { error: `set "${s.name}" has no variant ${n} (has 1-${s.n})` };
  const live = snapshot(s.target);
  const body = snapshot(safePath(P.ROOT, target.file)).body;
  if (body === null || sha(body) !== target.sha) throw new Error(`variant ${n} changed or could not be read`);
  let adopted = null;
  if (live.body !== null && !s.variants.some((v) => v.sha === sha(live.body))) {
    adopted = (s.variants.at(-1)?.n ?? 0) + 1;
    if (!Number.isSafeInteger(adopted)) throw new Error("no safe variant position remains");
    writeExclusive(P, path.join(s.dir, `${adopted}${s.ext}`), live.body, live.mode);
  }
  // Force writes the same bytes again for an explicit dev-server replay.
  if (sameBytes(live.body, body) && !adopted && !opts.force) return { ok: true, at: Number(n), noop: true };
  atomicWrite(s.target, body, { expected: live.body });
  return { ok: true, at: Number(n), adopted };
}

// A variant may tag its root element data-variate-section="<set>" so the card
// can watch exactly that part of the page, flash it when sets switch, and say
// so when the user is on a screen that does not render it. The marker is
// working apparatus, not design: `end` calls this so the kept file leaves the
// session without it, keeping the promise that nothing is variate-shaped.
export function withoutMarker(s, src) {
  const esc = escapeRe(s.name);
  // Only in attribute position. The same string can legitimately appear as a
  // CSS selector the variant styles itself with ([data-variate-section="x"]),
  // and a blind replace there shreds the selector and ships the kept design
  // unstyled, with the only other copy already deleted. So: preceded by
  // whitespace, followed by an attribute boundary, and inside a tag, which
  // the lookbehind checks by requiring a `<` with no `>` between.
  const attr = new RegExp(
    `(?<=<[^<>]*)\\s+data-variate-section\\s*=\\s*(?:"${esc}"|'${esc}'|\\{\\s*["'\`]${esc}["'\`]\\s*\\})(?=[\\s/>])`,
    "g",
  );
  const out = src.replace(attr, "");
  return out;
}

export function stripMarker(s, opts = {}) {
  const before = snapshot(s.target).body;
  if (Object.hasOwn(opts, "expected") && !sameBytes(before, opts.expected))
    throw new Error(`stale file changed before cleanup: ${s.target}`);
  const src = before?.toString("utf8") ?? null;
  if (src == null) return false;
  const out = withoutMarker(s, src);
  if (out === src) return false;
  atomicWrite(s.target, out, { expected: before });
  return true;
}
