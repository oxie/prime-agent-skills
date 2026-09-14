// Development-only structural guards. These never execute linked or JSON content.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// UPSTREAM.md: original workflows + Anti-slop/Impeccable/website guidance.
// NEXT/UI_SKILLS/REFERO/MENGTO/TASTE_SOURCES.md: selective later additions.
export const referenceNames = [
  "design.md", "audit.md", "study.md", "variate.md", "directions.md", "themes.md",
  "tokens.md", "verification.md", "app-quality.md", "ux-review.md", "content-layouts.md",
  "shadcn-composition.md", "ui-localization.md", "interaction-motion.md",
  "reference-synthesis.md", "interaction-evidence.md", "originality-evidence.md", "print-telemetry.md",
];
export const dataPayloads = [
  "next-provenance.json", "ui-skills-provenance.json", "refero-provenance.json",
  "aura-reference-intent.json", "mengto-provenance.json", "taste-provenance.json",
];
export const licensePayloads = [
  "licenses/AAS-LICENSE-CONTENT.txt", "licenses/CC-BY-4.0.txt", "licenses/shadcn-MIT.txt",
  "licenses/ui-skills-MIT.txt", "licenses/refero-MIT.txt", "licenses/mengto-MIT.txt",
  "licenses/taste-MIT.txt",
];
// Optional, source-owned handoffs only; not permission to read an entire sibling tree.
const siblingLinks = new Map([
  ["README.md", ["reui-library/README.md"]],
  ["SKILL.md", ["cinematic-ui/references/inline-media-type.md"]],
  ["references/print-telemetry.md", [
    "cinematic-ui/assets/taste-craft/craft.css", "cinematic-ui/assets/taste-craft/index.html",
  ]],
]);
const within = (root, file) => file.startsWith(root + path.sep);

export function descriptionOf(main) {
  const match = main.match(/^description: >\n((?:  [^\n]*\n)+)license:/m);
  assert.ok(match, "missing folded description");
  return match[1].replace(/^  /gm, "").replace(/\s+/g, " ").trim();
}
export function verifyDescription(description) {
  assert.ok(description.length > 20 && description.length <= 1024, "description budget");
  for (const phrase of [
    "visual-design audit", "screenshot analysis", "Complements Variate",
    "microinteraction tuning", "design-system drift", "design-document review",
    "version-aware shadcn composition", "localized UI usability",
    "Not for routine nonvisual coding, security/SEO audits, conversion measurement, or automatic redesign of every UI edit",
    "URL-only study asks for a screenshot", "authorized local previews can use the shared browser-check skill",
    "does not provide a public-web crawler",
  ]) assert.ok(description.includes(phrase), `missing routing boundary: ${phrase}`);
}
export function verifyVersion(main, upstream) {
  const version = main.match(/^  version: (\d+\.\d+\.\d+-prime\.\d+)$/m)?.[1];
  assert.ok(version, "missing Prime adaptation version");
  const documented = upstream.match(/^- Upstream v[^;\n]+; local v(\d+\.\d+\.\d+-prime\.\d+)\.$/m)?.[1];
  assert.equal(version, documented, "version must match the current UPSTREAM.md local release");
}
export function verifyReadingBudget(main, refs) {
  // Review budgets, not hash-derived current lengths: a 10 KiB entrypoint, 8 KiB
  // selective notes, and 96 KiB total. UX retains its original 6500-byte ceiling.
  // Refero + original Aura role clarification is one 10 KiB on-demand guide.
  assert.ok(Buffer.byteLength(main) <= 10 * 1024, "entrypoint exceeds 10 KiB");
  assert.deepEqual(Object.keys(refs).sort(), [...referenceNames].sort(), "reviewed reference inventory");
  for (const [name, text] of Object.entries(refs)) {
    const budget = name === "ux-review.md" ? 6500 : name === "reference-synthesis.md" ? 10 * 1024 : 8 * 1024;
    assert.ok(text.trim().length > 0 && Buffer.byteLength(text) <= budget, `reference budget: ${name}`);
  }
  assert.ok(Object.values(refs).reduce((n, text) => n + Buffer.byteLength(text), 0) <= 96 * 1024, "total reference budget");
}
export function files(dir) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
    const file = path.join(dir, entry.name);
    assert.ok(!entry.isSymbolicLink(), `symlink payload: ${file}`);
    if (entry.isDirectory()) return files(file);
    assert.ok(entry.isFile(), `non-regular payload: ${file}`);
    return [file];
  });
}
export function verifyPayload(root, file) {
  assert.ok(within(root, file), `escaping payload: ${file}`);
  assert.equal(fs.realpathSync(file), file, `symlink payload: ${file}`);
  const stat = fs.lstatSync(file);
  assert.ok(stat.isFile(), `non-regular payload: ${file}`);
  const rel = path.relative(root, file);
  if (rel.startsWith("dev" + path.sep)) return; // Tests/fixtures are not skill runtime.
  assert.ok(!(stat.mode & 0o111), `executable payload: ${rel}`);
  assert.ok(file.endsWith(".md") || rel === "LICENSE" || dataPayloads.includes(rel) || licensePayloads.includes(rel),
    `unexpected runtime payload: ${rel}`);
  const text = fs.readFileSync(file, "utf8");
  assert.ok(text.trim() && !text.includes("\0") && !text.startsWith("#!"), `non-text payload: ${rel}`);
  if (dataPayloads.includes(rel)) {
    const data = JSON.parse(text);
    assert.ok(data && typeof data === "object" && !Array.isArray(data), `expected record object: ${rel}`);
  }
}
export function verifyLink(root, file, link) {
  if (/^https?:\/\//i.test(link) || link.startsWith("#")) return; // Citation only; no fetch.
  const decoded = decodeURIComponent(link);
  assert.ok(!/^[a-z][a-z0-9+.-]*:/i.test(decoded) && !decoded.startsWith("/") && !decoded.includes("\\"),
    `unsafe link: ${link}`);
  const target = path.resolve(path.dirname(file), decoded.split("#")[0]);
  const rel = path.relative(root, file);
  const sibling = path.relative(path.dirname(root), target);
  assert.ok(within(root, target) || siblingLinks.get(rel)?.includes(sibling), `external bundle dependency: ${rel} ${link}`);
  assert.ok(fs.existsSync(target), `missing ${rel} ${link}`);
  assert.equal(fs.realpathSync(target), target, `symlink link: ${link}`);
  assert.ok(fs.statSync(target).isFile(), `not a file link: ${link}`);
  assert.ok(!(fs.statSync(target).mode & 0o111), `executable link: ${link}`);
  assert.ok(/\.(?:md|json|txt|css|html|png)$/.test(target) || path.basename(target) === "LICENSE", `non-document link: ${link}`);
}
