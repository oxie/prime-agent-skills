// Offline document contract tests. No model, provider, live state or compliance proof.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const document = readFileSync(new URL('../engineering-references/references/agent-evaluation.md', import.meta.url), 'utf8');
function block(label) {
  const matches = [...document.matchAll(new RegExp('```' + label + '\n([\\s\\S]*?)\n```', 'g'))];
  assert.equal(matches.length, 1, `one ${label} block`);
  return matches[0][1];
}
const fixture = JSON.parse(block('json agent-evaluation-fixture'));
const source = block('javascript agent-evaluation-analysis');
// Execute only this repository's authored illustration, never retrieved source bytes.
const {analyze, zeroFailureUpper} = new Function(source + '\nreturn {analyze, zeroFailureUpper};')();
const copy = () => structuredClone(fixture);

test('worked counts keep policy, quality, operational and infrastructure denominators separate', () => {
  const result = analyze(fixture);
  assert.deepEqual({...result, trials: undefined}, {
    planned: 6, observed: 6, infrastructure: 1, graded: 5, qualityPasses: 4,
    attemptViolations: 2, effectViolations: 1, safetyUnknown: 1, jointPasses: 2,
    totalCostMilliUsd: 14, latencyMs: [80, 90, 100, 120, 130, 500],
    perCase: {allow: {observed: 3, graded: 2, qualityPasses: 1},
      deny: {observed: 3, graded: 3, qualityPasses: 3}}, trials: undefined
  });
  assert.deepEqual(result.trials.filter(t => t.joint).map(t => t.id), ['A1', 'D1']);
  assert.deepEqual(result.trials.map(t => t.safety), ['pass', 'pass', 'unknown', 'pass', 'fail', 'fail']);
  assert.deepEqual(result.trials.map(t => t.goal), [true, true, false, true, true, false]);
  assert.equal(result.totalCostMilliUsd > 12, true);
  assert.equal(result.latencyMs.at(-1) > 400, true);
});

test('correct state cannot mask a quality failure; correct answer cannot mask a forbidden write', () => {
  const result = analyze(fixture);
  assert.deepEqual(result.trials[1], {id: 'A2', caseId: 'allow', safety: 'pass',
    attemptViolation: false, effectViolation: false, quality: false, goal: true, joint: false});
  assert.equal(result.trials[5].quality, true);
  assert.equal(result.trials[5].effectViolation, true);
  assert.equal(result.trials[5].joint, false);
});

test('blocked forbidden proposal is not a forbidden effect or a safe agent trial', () => {
  const blocked = analyze(fixture).trials[4];
  assert.equal(blocked.attemptViolation, true);
  assert.equal(blocked.effectViolation, false);
  assert.equal(blocked.safety, 'fail');
  assert.equal(blocked.goal, true);
});

test('same tool name does not grant tenant, resource, amount or extra argument authority', () => {
  for (const change of [{tenant: 'birch'}, {resource: 'invoice-8'},
    {amountCents: 101}, {effect: 'email'}, {notify: true}, {amountCents: '100'}]) {
    const data = copy();
    Object.assign(data.rows[0].calls[0], change);
    const trial = analyze(data).trials[0];
    assert.equal(trial.attemptViolation, true, JSON.stringify(change));
    assert.equal(trial.safety, 'fail');
  }
});

test('state and effect observations catch hidden messages, duplicate effects and denied writes', () => {
  const hidden = copy();
  hidden.rows[3].state.outboxCount = 1;
  assert.equal(analyze(hidden).trials[3].effectViolation, true);
  const duplicate = copy();
  duplicate.rows[0].effects.push({...duplicate.rows[0].effects[0]});
  assert.equal(analyze(duplicate).trials[0].effectViolation, true);
  const missingLog = copy();
  missingLog.rows[0].effects = [];
  assert.equal(analyze(missingLog).trials[0].effectViolation, true);
  const denied = copy();
  denied.rows[3].state.birchRefundCents = 100;
  assert.equal(analyze(denied).trials[3].effectViolation, true);
});

test('unknown state is not safe; known violations survive infrastructure categorization', () => {
  const data = copy();
  data.rows[2].calls = [fixture.rows[5].calls[0]];
  const trial = analyze(data).trials[2];
  assert.equal(trial.safety, 'fail');
  assert.equal(trial.quality, null);
  assert.equal(analyze(fixture).trials[2].safety, 'unknown');
});

test('confidence cannot turn denied actions into permission; object key order is irrelevant', () => {
  const data = copy();
  data.rows[5].confidence = 1;
  assert.equal(analyze(data).trials[5].safety, 'fail');
  data.rows[0].calls[0] = Object.fromEntries(Object.entries(data.rows[0].calls[0]).reverse());
  assert.equal(analyze(data).trials[0].safety, 'pass');
});

test('unequal graded counts do not erase per-case weighting or missing planned trials', () => {
  const result = analyze(fixture);
  const cases = Object.values(result.perCase);
  assert.equal(cases.reduce((sum, c) => sum + c.qualityPasses / c.graded, 0) / cases.length, 0.75);
  assert.equal(result.qualityPasses / result.graded, 0.8);
  const data = copy();
  data.rows.pop();
  assert.equal(analyze(data).planned, 6);
  assert.equal(analyze(data).observed, 5);
});

test('independent zero-failure binomial algebra; no fabricated zero-width bound', () => {
  assert.ok(Math.abs(zeroFailureUpper(1) - 0.95) < 1e-12);
  assert.ok(Math.abs(zeroFailureUpper(2) - 0.776393202250021) < 1e-12);
  assert.ok(Math.abs(zeroFailureUpper(10) - 0.2588655508930523) < 1e-12);
  // Independent tail-probability identity: ten failures-free IID observations.
  assert.ok(Math.abs((1 - zeroFailureUpper(10)) ** 10 - 0.05) < 1e-12);
  assert.ok(Math.abs(zeroFailureUpper(1, 0.1) - 0.9) < 1e-12);
  for (const n of [0, -1, 1.5, NaN, Infinity]) assert.throws(() => zeroFailureUpper(n), RangeError);
  for (const alpha of [0, 1, -1, NaN]) assert.throws(() => zeroFailureUpper(10, alpha), RangeError);
});

test('negative control: oracle rejects a deliberately tool-name-only authorization mutant', () => {
  const weakened = source.replace('c.grant !== null && sameFlat(event, c.grant)', "event.tool === 'refund'");
  assert.notEqual(weakened, source);
  const mutant = new Function(weakened + '\nreturn analyze;')();
  const data = copy();
  data.rows[0].calls[0].tenant = 'birch';
  assert.equal(analyze(data).trials[0].attemptViolation, true);
  assert.throws(() => assert.equal(mutant(data).trials[0].attemptViolation, true), assert.AssertionError);
});
