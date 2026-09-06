import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { attach, detach, detect, ignoreLine, unignoreLine } from "../src/attach.mjs";

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "variate-attach-test-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const put = (rel, content) => {
    const file = path.join(root, rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
    return file;
  };
  return { root, put };
}
const url = "http://127.0.0.1:4100/v.js";

test("Nuxt collision preserves unmarked user plugin", (t) => {
  const { root, put } = fixture(t);
  put("nuxt.config.ts", "export default {};");
  const plugin = put("plugins/variate.client.ts", "// my own plugin\n");
  assert.match(attach(root, detect(root), url).error, /overwrite/);
  assert.equal(fs.readFileSync(plugin, "utf8"), "// my own plugin\n");
});

test("generated plugin deletion requires its recorded hash", (t) => {
  const { root, put } = fixture(t);
  put("nuxt.config.ts", "export default {};");
  const result = attach(root, detect(root), url);
  assert.equal(result.created, true);
  assert.match(result.generatedHash, /^[a-f0-9]{64}$/);
  const ledger = put(".variate/attach.json", JSON.stringify(result));
  const plugin = path.join(root, result.file);
  const generated = fs.readFileSync(plugin);
  assert.equal(attach(root, detect(root), url).already, true);
  fs.appendFileSync(plugin, "// user added this\n");
  const edited = fs.readFileSync(plugin);
  assert.match(detach(root, ledger).error, /changed or unverified/);
  assert.deepEqual(fs.readFileSync(plugin), edited);
  assert.equal(fs.existsSync(ledger), true);
  fs.writeFileSync(plugin, generated);
  put(".variate/attach.json", JSON.stringify({ ...result, generatedHash: undefined }));
  assert.match(detach(root, ledger).error, /unverified/);
  assert.deepEqual(fs.readFileSync(plugin), generated);
  put(".variate/attach.json", JSON.stringify(result));
  assert.equal(detach(root, ledger, { checkOnly: true }).ok, true);
  assert.deepEqual(fs.readFileSync(plugin), generated);
  assert.equal(detach(root, ledger).removed, true);
  assert.equal(fs.existsSync(plugin), false);
});

test("attachment removes only its marked lines in an existing file", (t) => {
  const { root, put } = fixture(t);
  const original = "<html>\n  <body>\n    Hello\n  </body>\n</html>\n";
  const file = put("index.html", original);
  const result = attach(root, detect(root), url);
  const ledger = put(".variate/attach.json", JSON.stringify(result));
  assert.equal(result.ok, true);
  assert.equal(detach(root, ledger).ok, true);
  assert.equal(fs.readFileSync(file, "utf8"), original);
});

test("pre-existing ignore rules and legacy ownership are preserved", (t) => {
  const { root, put } = fixture(t);
  const original = "# user rule\n.variate/\nnode_modules/\n";
  const file = put(".gitignore", original);
  const result = ignoreLine(root, ".variate/");
  assert.deepEqual(result, { already: true, owned: false });
  assert.equal(unignoreLine(root, ".variate/", result).skipped, true);
  assert.equal(unignoreLine(root, ".variate/", true).skipped, true);
  assert.equal(fs.readFileSync(file, "utf8"), original);
});

test("owned ignore rules are removed without deleting user additions", (t) => {
  const { root, put } = fixture(t);
  fs.mkdirSync(path.join(root, ".git"));
  const first = ignoreLine(root, ".variate/");
  assert.deepEqual(first, { created: true, owned: true });
  assert.equal(unignoreLine(root, ".variate/", first).file, true);
  const file = put(".gitignore", "node_modules/\n");
  const second = ignoreLine(root, ".variate/");
  assert.deepEqual(second, { added: true, owned: true });
  fs.appendFileSync(file, "# added by user\n");
  assert.equal(unignoreLine(root, ".variate/", second).removed, true);
  assert.equal(fs.readFileSync(file, "utf8"), "node_modules/\n# added by user\n");
});

test("attachment and ignore writes reject symlink files and parents", (t) => {
  const { root, put } = fixture(t);
  const external = fs.mkdtempSync(path.join(os.tmpdir(), "variate-external-test-"));
  t.after(() => fs.rmSync(external, { recursive: true, force: true }));
  const victim = path.join(external, "victim.html");
  const original = "<body>unchanged</body>\n";
  fs.writeFileSync(victim, original);
  fs.symlinkSync(victim, path.join(root, "index.html"));
  assert.throws(() => attach(root, { file: "index.html", stack: "static" }, url), /symlink/i);
  fs.symlinkSync(external, path.join(root, "plugins"));
  assert.throws(() => attach(root, { file: "plugins/variate.client.ts", stack: "nuxt", create: true }, url), /symlink/i);
  assert.equal(fs.existsSync(path.join(external, "variate.client.ts")), false);
  fs.symlinkSync(victim, path.join(root, ".gitignore"));
  assert.throws(() => ignoreLine(root, ".variate/"), /symlink/i);
  assert.throws(() => unignoreLine(root, ".variate/", { owned: true }), /symlink/i);
  const ledger = put(".variate/attach.json", JSON.stringify({ file: "index.html" }));
  assert.throws(() => detach(root, ledger), /symlink/i);
  fs.symlinkSync(ledger, path.join(root, "ledger.json"));
  assert.throws(() => detach(root, path.join(root, "ledger.json")), /symlink/i);
  fs.symlinkSync(path.join(root, ".variate"), path.join(root, "ledger-dir"));
  assert.throws(() => detach(root, path.join(root, "ledger-dir/attach.json")), /symlink/i);
  assert.deepEqual(fs.readFileSync(victim, "utf8"), original);
});


test("Vite attachment remains valid after multiline imports and restores exact bytes", (t) => {
  const { root, put } = fixture(t);
  for (const ending of ["", "\n"]) {
    const original = 'import {\n  readFileSync,\n  writeFileSync\n} from "node:fs";\nconsole.log(readFileSync, writeFileSync);' + ending;
    const file = put("src/main.mjs", original);
    const result = attach(root, { stack: "vite", file: "src/main.mjs" }, url);
    assert.equal(result.ok, true);
    execFileSync(process.execPath, ["--check", file], { timeout: 3000, stdio: "pipe" });
    const output = fs.readFileSync(file, "utf8");
    assert.ok(output.startsWith(original));
    assert.ok(output.indexOf("variate:begin") > output.indexOf("console.log"));
    const ledger = put(".variate/attach.json", JSON.stringify(result));
    assert.equal(detach(root, ledger).ok, true);
    assert.equal(fs.readFileSync(file, "utf8"), original);
  }
});

test("frameworks without a reviewed body anchor return an error without writes", (t) => {
  const { root, put } = fixture(t);
  for (const [stack, file, source] of [
    ["next-app", "app/layout.tsx", "export default function Layout() { return <main>Hello</main>; }\n"],
    ["next-pages", "pages/_app.tsx", "export default function App() { return <main>Hello</main>; }\n"],
    ["next-app", "app/inline.tsx", "export default function Layout() { return <html><body>Hello</body></html>; }\n"],
    ["astro", "src/layouts/Layout.astro", "---\nconst title = 'Hello';\n---\n<main>{title}</main>\n"],
    ["sveltekit", "src/routes/+layout.svelte", "<script>let title = 'Hello';</script>\n<main>{title}</main>\n"],
  ]) {
    const abs = put(file, source);
    assert.match(attach(root, { stack, file }, url).error, /no (standalone )?<\/body>/, stack);
    assert.equal(fs.readFileSync(abs, "utf8"), source, stack);
  }
});
