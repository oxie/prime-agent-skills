# Debugging the reported symptom

## When to use

Use when the hard part is obtaining a trustworthy signal for a reported defect,
intermittent failure or performance regression. This extends ordinary bug fixing;
it is not a mandatory sequence for every typo or permission to probe production.
Read relevant source, callers, tests and project instructions before choosing a
reproduction. Source reading can reveal a safe seam or disprove an unsafe approach.

## Bind the signal to the report

State the input and setup, triggering actions, actual result and expected result.
Include the caller chain, timing or environment only when it changes the symptom.
Separate the user's observation from your proposed cause. Ask only for missing
facts that prevent a safe, useful next step; do not require an exhaustive interview.

Choose the cheapest authorized observation that reaches that behavior:

- Existing unit/integration test with a focused fixture.
- Project CLI with fixture input and independently expected output.
- Authorized local HTTP or browser interaction asserting response or UI state.
- Sanitized captured payload replayed offline at the actual affected boundary.
- Small disposable harness using existing local test substitutes.
- Differential run against a known-good revision/configuration, with the same input.
- Seeded property tests, bounded repeated trials or bisection when they fit the bug.
- A precise human-assisted scenario when automation cannot reach the environment.

Use the target project's native environment and runner. Inspect inherited commands
and fixtures before executing them. Reuse existing seams; see [legacy-code.md](legacy-code.md)
only if dependencies block feedback. A harness must not silently omit the caller
interaction, persistence or scheduling behavior needed to trigger this defect.
Stress, fuzzing, live replay, instrumentation and load tests require applicable
authorization and bounded resources. Do not increase load or add services by default.
Keep sensitive captures out of repositories and reports; quote only safe signal lines.

### Exact symptom versus a nearby bug

Report: two callers request equal-score items; the second caller loses stable order.
A test that sorts once and checks the scores can pass despite the reported defect.
A test that catches a null input exception finds a different bug, even if nearby.
Drive both callers with shared state as in the report; assert the tied item IDs in
order for each result. Keep the null case separate rather than substituting it.

Run the check before fixing when practical. Inspect why it failed: missing imports,
fixture setup errors and unrelated exceptions are not the desired red signal.
Record the command, completed exit, precise failing assertion and tested scope in
the existing task evidence. A check is red-capable only if it can reject this defect;
a successful smoke test alone does not establish that ability.

## Narrow and falsify

Once the exact failure occurs, remove one input, setup step or caller at a time.
Keep a reduction only if the same symptom remains. Stop minimization when further
work costs more than it clarifies; preserve the original scenario for final checking.
Pin clock/random inputs or control scheduling through existing test mechanisms.
For intermittent failures record attempts, failures, seed and relevant conditions.
A higher reproduction rate is useful, not proof of determinism. Do not promise
reliability from an arbitrary repetition count or replace failures with retries.

Form a small set of plausible causes grounded in source and observations. For each,
state a prediction and a distinguishing probe: “If shared array mutation is the
cause, isolating the second caller's input will preserve the first result's order.”
Change one factor, observe the result, and reject or revise the hypothesis. Prefer
existing debugger inspection or narrowly tagged temporary diagnostics over broad logs.
For slowness, compare the same workload and environment to a measured baseline;
choose timing, profiler or query-plan evidence that observes the reported bottleneck.
A changed timing result alone does not identify its cause.

## When red remains unresolved

Continue safe source inspection and label hypotheses as unconfirmed. State what was
tried, which scenario remains inaccessible, and what evidence would distinguish
causes. A passing nearby test does not resolve the original red gap. Ask for one
necessary artifact, access decision or authorized human run when that is the blocker.
A source-supported fix may be proposed or implemented within scope, but report it
as unverified against the original symptom; do not claim reproduced or fixed.
Do not demand production instrumentation merely to satisfy this reference.

## Fix, recheck, clean up

Turn the useful reproduction into a regression at a seam that reaches the real
pattern, then make the smallest supported fix. Rerun that test and the original
unminimized scenario, plus regressions for other affected callers and contracts.
If no suitable automated seam exists, name the remaining gap and retain the best
authorized evidence; do not certify a shallow substitute as equivalent coverage.
Remove only task-created temporary probes and disposable harnesses no longer needed.
Keep useful regression fixtures and tests. Report the supported cause, actual checks,
completed exits, and any unresolved reproduction or runtime limits.

Source and adaptations: [MATTPOCOCK_SOURCES.md](../MATTPOCOCK_SOURCES.md).
