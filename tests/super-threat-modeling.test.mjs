// Offline contract tests for the actual fictional document blocks.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const document = readFileSync(new URL(
  '../engineering-references/references/threat-modeling.md', import.meta.url), 'utf8');
function block(marker, language) {
  const pattern = new RegExp(`<!-- ${marker} -->\\s*\\x60{3}${language}\\n([\\s\\S]*?)\\n\\x60{3}`);
  const match = document.match(pattern);
  assert.ok(match, `missing document block ${marker}`);
  return match[1];
}
const fixture = JSON.parse(block('threat-fixture', 'json'));
// Only authored, local example code; never retrieved or upstream content.
const check = vm.runInNewContext(
  `${block('threat-check', 'js')}; checkInvoiceExample`, {}, { timeout: 1000 });
function gaps(model) { return Array.from(check(model)); }
function mutated(change) { const model = structuredClone(fixture); change(model); return model; }

test('no-gap fixture has the specified independent denial and success oracle', () => {
  assert.equal(fixture.revision, 'invoice-fixture-v1');
  assert.deepEqual(fixture.evidence[0].denied, {
    status: 403, invoiceWrites: 0, queuedEmails: 0, returnedFields: [], auditEvents: 1,
  });
  assert.deepEqual(fixture.evidence[0].allowed, {
    status: 200, invoiceWrites: 1, queuedEmails: 0,
  });
  assert.deepEqual(gaps(fixture), []);
});
test('seeded missing tenant boundary is found, not replaced by network boundary', () => {
  assert.deepEqual(gaps(mutated(m => m.boundaries.pop())), ['missing-boundary:F2']);
  assert.deepEqual(gaps(mutated(m => m.flows[1].boundary = 'B1')), ['missing-boundary:F2']);
});
test('unknown graph endpoint cannot be silently accepted', () => {
  assert.deepEqual(gaps(mutated(m => m.flows[1].to = 'missing')), ['unknown-node:F2']);
});
test('seeded missing control cannot retain a mitigated label', () => {
  assert.deepEqual(gaps(mutated(m => m.controls = [])),
    ['missing-control:T1', 'unsupported-mitigated:T1']);
});
test('documented, stale, failed or unlinked evidence cannot support mitigated', () => {
  for (const change of [
    m => m.evidence[0].level = 'documented',
    m => m.evidence[0].revision = 'old-revision',
    m => m.evidence[0].result = 'fail',
    m => m.controls[0].evidence = 'missing',
  ]) assert.deepEqual(gaps(mutated(change)), ['unsupported-mitigated:T1']);
});
test('403 plus a pass label cannot hide denied business effects or leaked data', () => {
  for (const change of [
    m => m.evidence[0].denied.invoiceWrites = 1,
    m => m.evidence[0].denied.queuedEmails = 1,
    m => m.evidence[0].denied.returnedFields = ['tenant-B-label'],
    m => delete m.evidence[0].denied.invoiceWrites,
    m => m.evidence[0].denied.status = 200,
  ]) assert.deepEqual(gaps(mutated(change)), ['unsupported-mitigated:T1']);
});
test('reject-everything observations fail the positive-control requirement', () => {
  assert.deepEqual(gaps(mutated(m => {
    m.evidence[0].allowed.status = 403;
    m.evidence[0].allowed.invoiceWrites = 0;
  })), ['unsupported-mitigated:T1']);
});
test('a proposed control is not a mitigated claim', () => {
  assert.deepEqual(gaps(mutated(m => {
    m.threat.status = 'proposed'; m.evidence = [];
  })), []); // No unsupported status claim; this does not mean the threat is closed.
});
test('dangling threat flow cannot retain a mitigated label', () => {
  for (const change of [
    m => m.threat.flow = 'missing',
    m => m.flows = m.flows.filter(flow => flow.id !== m.threat.flow),
  ]) assert.deepEqual(gaps(mutated(change)), ['missing-flow:T1', 'unsupported-mitigated:T1']);
  assert.deepEqual(gaps(mutated(m => {
    m.threat.flow = 'missing'; m.threat.status = 'proposed';
  })), ['missing-flow:T1']);
});
