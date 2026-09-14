import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const doc = readFileSync(new URL('../marketingskills/skills/seo-audit/references/search-console-diagnosis.md', import.meta.url), 'utf8');
function block(label) {
  const matches = [...doc.matchAll(new RegExp('```' + label + '\\n([\\s\\S]*?)\\n```', 'g'))];
  assert.equal(matches.length, 1, `one actual document block: ${label}`);
  return matches[0][1];
}
const fixtures = JSON.parse(block('json gsc-fixtures'));
const source = block('javascript gsc-checks');
// Only our local, original illustrative block is executed. No API/client/data fetch.
const load = code => new Function(`${code}\nreturn { ctr, compareScope, matchedChange, indexingAction };`)();
const checks = load(source);
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-12, `${a} != ${b}`);
function verifyMix(api) {
  const { before, after } = fixtures.mix;
  close(api.ctr(before), 0.091);
  close(api.ctr(after), 0.019);
  close(api.ctr(after) - api.ctr(before), -0.072);
  before.forEach((row, i) => close(api.ctr([row]), api.ctr([after[i]])));
}
function verifyMatched(api) {
  const { before, after } = fixtures.sameQueryPage;
  close(api.matchedChange(before[0], after), -0.02);
  assert.equal(api.matchedChange(before[1], after), null, 'missing page is unknown, not zero');
}
function verifyCoverage(api) {
  const { before, after } = fixtures.incomplete;
  assert.equal(api.compareScope(before, after), 'rows-only');
}
function verifyType(api) {
  assert.equal(api.compareScope(fixtures.scopeBefore, { ...fixtures.scopeAfter, type: 'image' }), 'incompatible');
}

test('actual worked mix example: weighted aggregate worsens with unchanged segments', () => verifyMix(checks));
test('actual same query/page example: page key cannot be collapsed to query', () => verifyMatched(checks));
test('incomplete export: observed row CTR is not property CTR', () => {
  verifyCoverage(checks);
  close(checks.ctr(fixtures.incomplete.rows), 0.05);
  close(fixtures.incomplete.reportTotal.clicks / fixtures.incomplete.reportTotal.impressions, 0.025);
  assert.notEqual(checks.ctr(fixtures.incomplete.rows), 0.025);
});
test('comparable scope, incompatible comparisons and missing scope', () => {
  assert.equal(checks.compareScope(fixtures.scopeBefore, fixtures.scopeAfter), 'comparable');
  for (const patch of fixtures.incompatiblePatches) {
    assert.equal(checks.compareScope(fixtures.scopeBefore, { ...fixtures.scopeAfter, ...patch }), 'incompatible', JSON.stringify(patch));
  }
  for (const field of Object.keys(fixtures.scopeBefore).filter(k => k !== 'coverage')) {
    const incomplete = { ...fixtures.scopeAfter }; delete incomplete[field];
    assert.equal(checks.compareScope(fixtures.scopeBefore, incomplete), 'incompatible', field);
  }
  assert.equal(checks.compareScope({ ...fixtures.scopeBefore, finality: 'fresh' }, { ...fixtures.scopeAfter, finality: 'fresh' }), 'incompatible');
  assert.equal(checks.compareScope(fixtures.scopeBefore, { ...fixtures.scopeAfter, coverage: undefined }), 'rows-only');
});
test('zero denominator, invalid counts, expected versus important missing URLs', () => {
  assert.equal(checks.ctr([]), null);
  assert.equal(checks.ctr([{ clicks: 0, impressions: 0 }]), null);
  for (const row of [{ clicks: -1, impressions: 5 }, { clicks: 1, impressions: 0 }, { clicks: 2, impressions: 1 }, { clicks: 1, impressions: NaN }]) {
    assert.throws(() => checks.ctr([row]), /counts/);
  }
  assert.deepEqual(fixtures.indexing.map(row => checks.indexingAction(row)),
    ['expected-exclusion', 'investigate-important-missing', 'clarify-intent']);
  fixtures.indexing.forEach(row => assert.equal(checks.indexingAction(row), row.expectedAction));
});

test('decisive assertions reject meaningful arithmetic and diagnostic mutants', () => {
  const mutations = [
    ['mean of row CTRs', 'return impressions === 0 ? null : clicks / impressions;', 'return rows.reduce((s, r) => s + r.clicks / r.impressions, 0) / rows.length;', verifyMix],
    ['query-only join', 'JSON.stringify(row.keys) === JSON.stringify(before.keys)', 'row.keys[0] === before.keys[0]', verifyMatched],
    ['claim completeness', "return 'rows-only';", "return 'comparable';", verifyCoverage],
    ['ignore search type', "'property', 'type', 'timezone'", "'property', 'timezone'", verifyType],
    ['zero treated as measured CTR', 'return impressions === 0 ? null : clicks / impressions;', 'return impressions === 0 ? 0 : clicks / impressions;', api => assert.equal(api.ctr([]), null)],
    ['all noindex ignored', "if (row.expectedIndexable === false) return 'expected-exclusion';", "if (row.reason === 'noindex') return 'expected-exclusion';", api => fixtures.indexing.forEach(row => assert.equal(api.indexingAction(row), row.expectedAction))],
  ];
  for (const [name, old, replacement, verify] of mutations) {
    assert.equal(source.split(old).length, 2, `unique mutation point: ${name}`);
    assert.throws(() => verify(load(source.replace(old, replacement))), { name: 'AssertionError' }, name);
  }
});
