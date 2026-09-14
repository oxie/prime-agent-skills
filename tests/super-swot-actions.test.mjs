import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Offline document contract, not a strategy engine or business-truth judge.
const document = readFileSync(new URL(
  '../marketingskills/skills/competitor-profiling/references/swot-actions.md',
  import.meta.url,
), 'utf8');
const example = document.match(
  /<!-- swot-example:start -->\s*```json\s*([\s\S]*?)```\s*<!-- swot-example:end -->/,
);
assert.ok(example, 'the actual reference must contain its worked fixture');
const fixture = JSON.parse(example[1]);
const nonempty = value => typeof value === 'string' && value.trim().length > 0;

function indexById(rows) {
  const index = new Map();
  for (const row of rows) {
    assert.ok(nonempty(row.id), 'missing ID');
    assert.ok(!index.has(row.id), 'duplicate ID');
    index.set(row.id, row);
  }
  return index;
}

function check(data) {
  assert.equal(data.fictional, true, 'fixture must be clearly fictional');
  for (const key of ['focalCompany', 'competitor', 'decision', 'asOf', 'selection']) {
    assert.ok(nonempty(data[key]), `missing context: ${key}`);
  }
  assert.notEqual(data.focalCompany, data.competitor);
  const sources = indexById(data.sources);
  const factors = indexById(data.factors);
  indexById(data.actions);
  for (const source of sources.values()) {
    for (const key of ['subject', 'locator', 'asOf', 'observation']) {
      assert.ok(nonempty(source[key]), `missing source: ${key}`);
    }
  }
  for (const factor of factors.values()) {
    assert.ok(['S', 'W', 'O', 'T'].includes(factor.kind), 'invalid factor kind');
    const source = sources.get(factor.source);
    assert.ok(source, 'unknown evidence ID');
    assert.equal(factor.subject, source.subject, 'source subject mismatch');
    // Exact-match ledger for THIS fixture; not semantic entailment of arbitrary prose.
    assert.equal(factor.fact, source.observation, 'unsupported fixture fact');
    assert.ok(nonempty(factor.interpretation), 'missing interpretation');
    if (['S', 'W'].includes(factor.kind)) {
      assert.equal(factor.subject, data.focalCompany, 'wrong internal company');
    } else {
      assert.notEqual(factor.subject, data.focalCompany, 'internal fact used as external');
    }
  }
  const kinds = { SO: ['S', 'O'], ST: ['S', 'T'], WO: ['W', 'O'], WT: ['W', 'T'] };
  for (const action of data.actions) {
    assert.ok(Object.hasOwn(kinds, action.pair), 'unknown pair');
    const actual = action.factors.map(id => {
      assert.ok(factors.has(id), 'unknown action factor');
      return factors.get(id).kind;
    });
    assert.deepEqual(actual, kinds[action.pair], 'pair/type mismatch');
    for (const key of ['owner', 'proposal', 'rationale', 'measure', 'reviewPoint',
      'decisionRule', 'uncertainty', 'permission']) {
      assert.ok(nonempty(action[key]), `missing action: ${key}`);
    }
  }
  return data.actions.map(({ id, pair, factors }) => ({ id, pair, factors }));
}

function changed(mutate) {
  const copy = structuredClone(fixture);
  mutate(copy);
  return copy;
}

test('actual fictional input produces exactly the documented selected pairs', () => {
  assert.equal(fixture.focalCompany, 'LumenLedger');
  assert.equal(fixture.competitor, 'RidgeAudit');
  assert.deepEqual(check(fixture), [
    { id: 'A1', pair: 'SO', factors: ['S1', 'O1'] },
    { id: 'A2', pair: 'WT', factors: ['W1', 'T1'] },
  ]);
  assert.equal(fixture.sources[3].observation,
    'RidgeAudit announced a signed-export pilot; availability is unverified.');
  assert.match(fixture.actions[0].decisionRule, /both fields survive/);
  assert.match(fixture.actions[1].decisionRule, /Hold buyer-facing wording/);
});

test('reject rival capability as our strength even with internally matching evidence', () => {
  assert.throws(() => check(changed(data => {
    data.sources[0].subject = data.competitor;
    data.factors[0].subject = data.competitor;
  })), /wrong internal company/);
});

test('reject unsupported capability despite a valid citation ID', () => {
  assert.throws(() => check(changed(data => {
    data.factors[0].fact = 'The tested build signs exported files.';
  })), /unsupported fixture fact/);
});

test('reject evidence mismatch and missing citation', () => {
  assert.throws(() => check(changed(data => {
    data.factors[0].subject = data.competitor;
  })), /source subject mismatch/);
  assert.throws(() => check(changed(data => {
    data.factors[0].source = 'invented-source';
  })), /unknown evidence ID/);
});

test('reject our internal capability relabeled as an external opportunity', () => {
  assert.throws(() => check(changed(data => {
    data.factors[0].kind = 'O';
  })), /internal fact used as external/);
});

test('reject wrong pair outcome, unknown factors and repeated same-side factor', () => {
  assert.throws(() => check(changed(data => {
    data.actions[0].pair = 'ST';
  })), /pair\/type mismatch/);
  assert.throws(() => check(changed(data => {
    data.actions[0].factors = ['S1', 'missing'];
  })), /unknown action factor/);
  assert.throws(() => check(changed(data => {
    data.actions[0].factors = ['S1', 'S1'];
  })), /pair\/type mismatch/);
});

test('return incomplete actions for missing measure, owner, uncertainty or review contract', () => {
  for (const key of ['owner', 'measure', 'uncertainty', 'reviewPoint', 'decisionRule', 'permission']) {
    assert.throws(() => check(changed(data => {
      data.actions[0][key] = ' ';
    })), new RegExp(`missing action: ${key}`));
  }
});

test('allow a single supported action or no supported pair without quadrant quotas', () => {
  assert.equal(check(changed(data => { data.actions = [data.actions[0]]; })).length, 1);
  assert.deepEqual(check(changed(data => {
    data.factors = [data.factors[3]];
    data.actions = [];
    data.selection = 'Only rival data is available; no supported cross-action yet.';
  })), []);
});
