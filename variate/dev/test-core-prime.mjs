import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { atomicWrite, narrowTo, paths, readSet, safePath, switchTo, readBoard, listSets } from "../src/core.mjs";

function fixture(t, variants = ["original", "chosen", "other"]) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "variate-core-prime-"));
  t.after(() => fs.rmSync(base, { recursive: true, force: true }));
  const root = path.join(base, "project");
  fs.mkdirSync(root);
  const P = paths(root);
  const dir = path.join(P.VAR, "page");
  fs.mkdirSync(dir, { recursive: true });
  const target = path.join(root, "page.html");
  fs.writeFileSync(target, variants[0]);
  fs.writeFileSync(path.join(dir, "target"), "page.html\n");
  fs.writeFileSync(path.join(dir, "plan.json"), JSON.stringify({question: "which?", positions: variants.map((_, i) => ({name: `take ${i + 1}`}))}));
  variants.forEach((body, i) => fs.writeFileSync(path.join(dir, `${i + 1}.html`), body));
  return { base, root, P, dir, target };
}
const text = (file) => fs.readFileSync(file, "utf8");
const saved = (dir) => fs.readdirSync(path.join(dir, ".dropped")).map((n) => text(path.join(dir, ".dropped", n)));
const mode = (file) => fs.statSync(file).mode & 0o7777;
const temps = (dir) => fs.readdirSync(dir).filter((n) => n.includes(".tmp-"));

test("explicit narrow saves unmatched edit and original through later rounds", (t) => {
  const {P, dir, target} = fixture(t);
  fs.writeFileSync(target, "my live hand edit");
  assert.equal(narrowTo(P, "page", 2).ok, true);
  assert.equal(text(target), "chosen");
  assert.equal(text(path.join(dir, "1.html")), "chosen");
  assert.deepEqual(readSet(P, "page").variants.map((v) => v.n), [1]);
  assert.deepEqual(saved(dir).sort(), ["original", "chosen", "other", "my live hand edit"].sort());
  const originalBackup = fs.readdirSync(path.join(dir, ".dropped")).find((n) => text(path.join(dir, ".dropped", n)) === "original");
  fs.writeFileSync(path.join(dir, "2.html"), "later chosen");
  narrowTo(P, "page", 2);
  assert.equal(text(path.join(dir, ".dropped", originalBackup)), "original");
  assert.equal(text(target), "later chosen");
  assert.ok(saved(dir).includes("my live hand edit"));
});

test("single-position narrow still preserves and replaces unmatched live edit", (t) => {
  const {P, dir, target} = fixture(t, ["original"]);
  assert.equal(narrowTo(P, "page", 1).noop, true);
  fs.writeFileSync(target, "hand edit");
  assert.equal(narrowTo(P, "page", 1).ok, true);
  assert.equal(text(target), "original");
  assert.ok(saved(dir).includes("hand edit"));
});

test("positions 99 and above stay visible and adoption never overwrites 100", (t) => {
  const {P, dir, target} = fixture(t);
  fs.writeFileSync(path.join(dir, "99.html"), "ninety-nine");
  fs.writeFileSync(target, "first hand edit");
  assert.equal(switchTo(P, "page", 2).adopted, 100);
  assert.deepEqual(readSet(P, "page").variants.map((v) => v.n), [1, 2, 3, 99, 100]);
  fs.writeFileSync(target, "second hand edit");
  assert.equal(switchTo(P, "page", 99).adopted, 101);
  assert.equal(text(path.join(dir, "100.html")), "first hand edit");
  assert.equal(text(path.join(dir, "101.html")), "second hand edit");
  assert.equal(switchTo(P, "page", 100).ok, true);
  assert.equal(text(target), "first hand edit");
  narrowTo(P, "page", 101);
  assert.equal(text(target), "second hand edit");
  assert.ok(saved(dir).includes("first hand edit"));
});

test("safePath rejects lexical escape and missing descendants of symlinks, allows root alias", (t) => {
  const {base, root, P} = fixture(t);
  assert.throws(() => safePath(root, "../outside"), /outside project/);
  assert.throws(() => safePath(root, root + "-other/file"), /outside project/);
  assert.equal(safePath(root, "new/child/file"), path.join(root, "new/child/file"));
  fs.symlinkSync(base, path.join(root, "linked"), "dir");
  assert.throws(() => safePath(root, "linked/missing/file"), /symlink/);
  const alias = path.join(base, "alias");
  fs.symlinkSync(root, alias, "dir");
  assert.equal(safePath(alias, "page.html"), path.join(alias, "page.html"));
  assert.equal(paths(alias).ROOT, P.ROOT);
  assert.equal(switchTo(paths(alias), "page", 2).ok, true);
});

for (const mutation of [switchTo, narrowTo]) {
  for (const kind of ["target", "parent", "scratch-alias", "variant", "target-record", "plan", "set", "dropped", "board", "variate"]) {
    test(`${mutation.name} rejects ${kind} symlink without external changes`, (t) => {
      const {base, root, P, dir, target} = fixture(t);
      const outside = path.join(base, "outside");
      fs.mkdirSync(outside);
      const victim = path.join(outside, "victim.html");
      fs.writeFileSync(victim, "outside original bytes");
      if (kind === "target") {
        fs.unlinkSync(target); fs.symlinkSync(victim, target);
      } else if (kind === "parent") {
        fs.symlinkSync(outside, path.join(root, "linked"), "dir");
        fs.writeFileSync(path.join(dir, "target"), "linked/victim.html");
      } else if (kind === "scratch-alias") {
        fs.unlinkSync(target); fs.symlinkSync(path.join(dir, "1.html"), target);
      } else if (kind === "variant") {
        fs.unlinkSync(path.join(dir, "2.html")); fs.symlinkSync(victim, path.join(dir, "2.html"));
      } else if (kind === "target-record" || kind === "plan") {
        const file = path.join(dir, kind === "plan" ? "plan.json" : "target");
        fs.unlinkSync(file); fs.symlinkSync(victim, file);
      } else if (kind === "set") {
        fs.renameSync(dir, path.join(outside, "page")); fs.symlinkSync(path.join(outside, "page"), dir, "dir");
      } else if (kind === "dropped") {
        fs.symlinkSync(outside, path.join(dir, ".dropped"), "dir");
      } else if (kind === "board") {
        fs.symlinkSync(victim, P.BOARD);
      } else {
        fs.renameSync(P.VAR, path.join(outside, "scratch")); fs.symlinkSync(path.join(outside, "scratch"), P.VAR, "dir");
      }
      if (kind === "board") {
        assert.throws(() => paths(root), /symlink/);
        assert.throws(() => readBoard(P), /symlink/);
      } else {
        assert.throws(() => mutation(P, "page", 2), /symlink/);
      }
      assert.equal(text(victim), "outside original bytes");
      if (kind === "scratch-alias") assert.equal(text(path.join(dir, "1.html")), "original");
      assert.deepEqual(fs.readdirSync(outside).sort(), kind === "set" ? ["page", "victim.html"] : kind === "variate" ? ["scratch", "victim.html"] : ["victim.html"]);
    });
  }
}

test("listSets rejects a symlink set instead of silently accepting an alias", (t) => {
  const {P, dir} = fixture(t);
  fs.symlinkSync(dir, path.join(P.VAR, "alias"), "dir");
  assert.throws(() => listSets(P), /symlink/);
});

test("narrow archive collisions retain all previous snapshots", (t) => {
  const {P, dir, target} = fixture(t);
  fs.mkdirSync(path.join(dir, ".dropped"));
  fs.writeFileSync(path.join(dir, ".dropped", "1-take-1.html"), "older snapshot");
  fs.writeFileSync(target, "edit");
  narrowTo(P, "page", 2);
  assert.equal(text(path.join(dir, ".dropped", "1-take-1.html")), "older snapshot");
  assert.equal(text(path.join(dir, ".dropped", "1-take-1-2.html")), "original");
});

test("target switching, narrowing and atomic writes preserve modes", (t) => {
  const {P, dir, target} = fixture(t);
  fs.chmodSync(target, 0o751);
  fs.chmodSync(path.join(dir, "1.html"), 0o640);
  switchTo(P, "page", 2);
  assert.equal(mode(target), 0o751);
  narrowTo(P, "page", 3);
  assert.equal(mode(target), 0o751);
  assert.equal(mode(path.join(dir, "1.html")), 0o640);
  assert.equal(mode(path.join(dir, ".dropped", "1-take-1.html")), 0o640);
  atomicWrite(target, "updated");
  assert.equal(mode(target), 0o751);
  assert.deepEqual(temps(path.dirname(target)), []);
});

test("atomicWrite rejects symlink leaf and parent without writing outside", (t) => {
  const {base, root, target} = fixture(t);
  const outside = path.join(base, "outside"); fs.mkdirSync(outside);
  const victim = path.join(outside, "victim"); fs.writeFileSync(victim, "safe");
  fs.unlinkSync(target); fs.symlinkSync(victim, target);
  assert.throws(() => atomicWrite(target, "bad"), /symlink/);
  fs.symlinkSync(outside, path.join(root, "linked"), "dir");
  assert.throws(() => atomicWrite(path.join(root, "linked", "new"), "bad"), /symlink/);
  assert.equal(text(victim), "safe");
  assert.deepEqual(fs.readdirSync(outside), ["victim"]);
});

test("atomicWrite rejects stale expected bytes and cleans temp on a mid-write edit", (t) => {
  const {target} = fixture(t);
  assert.throws(() => atomicWrite(target, "bad", {expected: Buffer.from("stale")}), /stale/);
  const write = fs.writeFileSync;
  let changed = false;
  t.mock.method(fs, "writeFileSync", (file, ...args) => {
    const result = write(file, ...args);
    if (typeof file === "number" && !changed) { changed = true; write(target, "new live edit"); }
    return result;
  });
  assert.throws(() => atomicWrite(target, "bad"), /stale/);
  assert.equal(text(target), "new live edit");
  assert.deepEqual(temps(path.dirname(target)), []);
});

test("atomicWrite cleans temporary files after rename and write failures", (t) => {
  const {target} = fixture(t);
  t.mock.method(fs, "renameSync", () => { throw new Error("injected rename failure"); });
  assert.throws(() => atomicWrite(target, "bad"), /injected rename failure/);
  assert.equal(text(target), "original");
  assert.deepEqual(temps(path.dirname(target)), []);
  t.mock.restoreAll();
  const write = fs.writeFileSync;
  t.mock.method(fs, "writeFileSync", (file, ...args) => {
    if (typeof file === "number") throw new Error("injected write failure");
    return write(file, ...args);
  });
  assert.throws(() => atomicWrite(target, "bad"), /injected write failure/);
  assert.equal(text(target), "original");
  assert.deepEqual(temps(path.dirname(target)), []);
});

test("exclusive temp creation cannot clobber a pre-existing temporary file", (t) => {
  const {target} = fixture(t);
  const fixed = Buffer.alloc(12, 7);
  const collision = `${target}.tmp-${process.pid}-${fixed.toString("hex")}`;
  fs.writeFileSync(collision, "not ours");
  t.mock.method(crypto, "randomBytes", () => fixed);
  assert.throws(() => atomicWrite(target, "bad"), {code: "EEXIST"});
  assert.equal(text(collision), "not ours");
  assert.equal(text(target), "original");
});

test("failed narrow target replacement retains numbered originals and recovery copies", (t) => {
  const {P, dir, target} = fixture(t);
  fs.writeFileSync(target, "live edit");
  const rename = fs.renameSync;
  t.mock.method(fs, "renameSync", (from, to) => {
    if (to === target) throw new Error("injected target failure");
    return rename(from, to);
  });
  assert.throws(() => narrowTo(P, "page", 2), /injected target failure/);
  assert.equal(text(target), "live edit");
  assert.deepEqual([1, 2, 3].map((n) => text(path.join(dir, `${n}.html`))), ["original", "chosen", "other"]);
  assert.deepEqual(saved(dir).sort(), ["original", "chosen", "other", "live edit"].sort());
  assert.deepEqual(temps(path.dirname(target)), []);
});

test("stale live changes during narrow abort before target or numbered replacement", (t) => {
  const {P, dir, target} = fixture(t);
  fs.writeFileSync(target, "first edit");
  const write = fs.writeFileSync;
  let changed = false;
  t.mock.method(fs, "writeFileSync", (file, ...args) => {
    const result = write(file, ...args);
    if (typeof file === "number" && !changed) { changed = true; write(target, "later edit"); }
    return result;
  });
  assert.throws(() => narrowTo(P, "page", 2), /stale/);
  assert.equal(text(target), "later edit");
  assert.equal(text(path.join(dir, "1.html")), "original");
  assert.ok(saved(dir).includes("first edit"));
});


test("failed switch leaves the adopted edit and all prior variants intact", (t) => {
  const {P, dir, target} = fixture(t);
  fs.writeFileSync(target, "live edit");
  t.mock.method(fs, "renameSync", () => { throw new Error("injected switch failure"); });
  assert.throws(() => switchTo(P, "page", 2), /injected switch failure/);
  assert.equal(text(target), "live edit");
  assert.deepEqual([1, 2, 3, 4].map((n) => text(path.join(dir, `${n}.html`))), ["original", "chosen", "other", "live edit"]);
  assert.deepEqual(temps(path.dirname(target)), []);
});

test("late narrow scratch failure leaves all bytes recoverable in dropped", (t) => {
  const {P, dir, target} = fixture(t);
  fs.writeFileSync(target, "live edit");
  const rename = fs.renameSync;
  t.mock.method(fs, "renameSync", (from, to) => {
    if (to === path.join(dir, "1.html")) throw new Error("injected scratch failure");
    return rename(from, to);
  });
  assert.throws(() => narrowTo(P, "page", 2), /injected scratch failure/);
  // Not a whole-operation transaction: the target already switched, but all
  // old numbered files and saved source bytes remain available for recovery.
  assert.equal(text(target), "chosen");
  assert.deepEqual([1, 2, 3].map((n) => text(path.join(dir, `${n}.html`))), ["original", "chosen", "other"]);
  assert.deepEqual(saved(dir).sort(), ["original", "chosen", "other", "live edit"].sort());
  assert.deepEqual(temps(dir), []);
});

test("archive leaf symlinks, including dangling links, are refused", (t) => {
  const {P, base, dir, target} = fixture(t);
  const victim = path.join(base, "outside.html");
  fs.writeFileSync(victim, "outside original");
  fs.mkdirSync(path.join(dir, ".dropped"));
  const alias = path.join(dir, ".dropped", "1-take-1.html");
  fs.symlinkSync(victim, alias);
  assert.throws(() => narrowTo(P, "page", 2), /symlink/);
  assert.equal(text(victim), "outside original");
  assert.equal(text(target), "original");
  fs.unlinkSync(victim);
  assert.throws(() => narrowTo(P, "page", 2), /symlink/);
  assert.equal(fs.existsSync(victim), false);
  assert.equal(text(target), "original");
});
