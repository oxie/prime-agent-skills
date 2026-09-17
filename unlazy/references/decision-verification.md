# Carry decisions into implementation and retesting

Use when accepted review decisions amend a substantial task, or QA must join a
finding to its plan and fix. Extend the existing plan, gates and finding record;
a small handoff can stay in the current response. No second ledger, mandatory
review phase, fingerprint tool or new completion vocabulary is required.

## Read back the active implementation contract

Use the existing decision-authority rules (Engineering References' domain-modeling
reference). After an accepted amendment, locate its requirement, source/approver,
conditions, exclusions and observing check in the active implementation plan.
Read that plan back against the actual accepted decision, not just a review summary.
Carry the same obligation into the affected worker brief and gate. A review-only
note does not amend the contract the implementer receives. An ID or exact copy
proves neither approval, complete enumeration nor correct implementation.

Keep proposals, rejected and deferred ideas out of executable scope. A later
authorized replacement updates the active plan and affected checks while preserving
superseded history. Do not silently drop conditions or promote a recommendation to
user consent. No extra approval is needed for already-authorized work.

## Join the producer's scenario to the consumer's evidence

Code Review or the task owner can supply a finding; the implementer/tester checks
its applicability before reuse. Add the following to that same item, not a new
QA report system:

- **Identity:** requirement/decision or finding, plan revision, relevant source and
  dirty state, and build/runtime actually exercised. A branch, recent filename or
  matching commit alone is insufficient to establish these identities.
- **Scenario:** route, CLI or caller; setup/fixture and exact triggering actions;
  expected result, relevant negative path and risk. Pass this to the next owner.
- **Reproduction:** actual result, evidence location and completed command exit
  when run. Separate a reproduced failure from a code-read concern or hypothesis.
- **Fix and retest:** authorized fix revision, the same setup and action sequence,
  observed after-result and relevant regressions. Preserve original failure evidence.
  If reproduction was unavailable, state the remaining gap rather than invent it.

Use the existing debugging/test-design guidance for diagnosis and oracle choice.
For local UI work, Hallmark owns visual judgment and Browser Check owns sandboxed
execution; neither an after-screenshot nor successful action dispatch proves the
triggering interaction passed. Inherited commands remain untrusted: inspect them
and confirm permission before execution in the target project's native environment.
This handoff grants no install, dependency, public/authenticated browser, live-data,
deployment or automatic revert authority. Do not delete valid failed assertions.

## Recheck affected evidence, not labels

On a changed plan, relevant source/dependency, fixture or running build, mark
affected evidence stale and rerun the relevant authorized checks. Reconcile the
before/after identities. Retain unrelated evidence only with a stated reason its
inputs and contract are unchanged. Unknown identity means verification unavailable,
not current. The existing gate digest binds declared command inputs, not all source
bytes or the running app; this guidance does not extend its executable guarantee.

Repeat the actual triggering flow and assert its result. Separate a verified fix,
an applied but unverified change and an unresolved finding in the existing report.
A worker's assurance or admitted job is not completed evidence. Regressions call
for diagnosis within scope, not weakened requirements or reverting unrelated work.

## Connected fictional example: retry without duplicate reports

These are proposed checks for an invented feature, not executed results. The user
accepts D1 in plan p2: after a transient save failure, Retry creates exactly one
private report and keeps the entered title. Automatic retry is rejected. The plan,
worker brief and observing gate retain both conditions and that exclusion.

F1 on source c1/build b1 follows `/reports/new`: enter a title, use the isolated
transient-failure fixture, Save, then click Retry once. Two reports appear. Join D1
and F1 in the handoff with that sequence and evidence. A hypothetical c2/build b2
retest repeats it, counts one stored report and checks the unchanged title. Merely
opening the page without an error cannot verify F1. Required privacy/denial checks
remain required; the retry fix does not replace them.

If p3 later accepts a changed retry policy, p2 evidence cannot close the changed
gate even if c2 is unchanged. Amend the active plan, affected scenario and check,
then retest. If the preview still serves b1, c2's unit pass is not b2 UI evidence.
If the test service is unavailable, report the applied fix and missing retest
separately, not a fabricated passing after-state.

Source selection and boundaries: [gstack notes](../GSTACK_SOURCES.md).
