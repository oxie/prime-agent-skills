# Test design: independent evidence and behavior slices

## When to use

Use when choosing regression coverage, working test-first, or checking whether an
assertion can detect the defect it claims to cover. Read the source, actual callers,
existing tests and project contracts first. Use the project's own runner/environment.
Select the smallest observation boundary that reaches the behavior; do not require
user confirmation for every routine test seam. Permission for consequential tests,
external effects and infrastructure remains separate.

## One behavior slice at a time

1. State the observable behavior and its expected outcome before implementing it.
2. Add or select a focused test at an existing useful seam.
3. Run it and confirm the failure is the missing behavior, not broken setup.
4. Implement enough to satisfy that behavior without speculative future features.
5. Run the test and relevant regressions; continue with the next behavior slice.
6. Refactor locally in a separate, behavior-preserving step when evidence supports it.

This feedback loop avoids writing a large imagined test surface before learning how
real callers use it. It is not a ban on planning a test matrix or adding a required
batch of regression cases. A test that already passes can document existing behavior;
do not manufacture a production fault to call it test-driven development.

## Check the oracle's source, not its syntax

An oracle is how the test decides what is correct. Expected results must have a
reason independent of the implementation being checked. A literal is not inherently
independent, and a formula is not inherently circular.

| Example | Assessment |
|---|---|
| Spec says two items at 200 cents, less a fixed 50-cent discount, total 350; assert 350 | Independent worked example, provided rounding and discount scope match the spec |
| Copy today's returned 400 into the expected literal after a failing assertion | Circular approval of the output; a literal did not make it correct |
| Compare `total(cart)` with `total(cart)` or its shared internal helper | Circular; the same fault can define both actual and expected |
| Repeat the production loop, including its discount and rounding branches | Correlated oracle; likely to preserve the same mistake |
| For nonnegative integer n, compare iterative `sumOneTo(n)` with independently derived `n*(n+1)/2` | Valid formula oracle within the specified safe numeric range |

For the formula case, test n=0, n=1 and n=4 (expected 10), plus representative safe
values. It detects an omitted last term; it does not prove large-number precision
outside that range. Keep the derivation independent of production helpers.
A reference implementation, property or differential check needs the same scrutiny:
shared dependencies or the same misunderstanding can make both versions agree wrongly.
A snapshot is reviewed evidence, not truth merely because a tool generated it.

Ask “Which plausible wrong implementation would this assertion reject?” For example,
a sum check that also passes when the last item is omitted needs a stronger input.
When proportionate and authorized, try a known-bad fixture or an isolated reversible
mutation and verify the test fails for the intended reason. Never alter a valid
assertion merely to make the implementation pass.

## Observe meaningful effects

Prefer caller-visible outcomes over the incidental route used to compute them.
Multiple assertions can establish one behavior; one assertion is not a quota.
Internal, characterization and storage checks remain useful when they protect a
real invariant or provide the safest observation point. Examples:

- **No write:** a cross-tenant update is denied and a fresh storage read shows the
  protected row unchanged. Also inspect relevant audit/outbox effects if forbidden.
- **Count:** retrying the same intent creates one charge, not two. A mock count can
  check local dispatch behavior, but cannot prove provider or database deduplication.
- **Order:** tied records have IDs `[A, B]`, not just equal scores or equal membership.
  Protocol ordering can also be contractual: acknowledge only after durable commit.
- **Durability:** success survives a supported close/reopen or restart of a disposable
  store. A cached read in the same process is not equivalent durability evidence.
- **Multiple callers:** one caller's mutation cannot change another caller's result.
  Test their actual shared-state interaction, not only two isolated successful calls.

Use real-boundary tests for real-boundary claims when authorized. See the existing
[contract boundaries](contract-boundaries.md) reference for retry/side-effect risks,
not as a reason to add those mechanisms to every test.

## Async readiness is not a timing contract

For a flaky asynchronous test, first decide what it promises:

- **Readiness:** use the project's existing event subscription or assertion-wait
  facility for the exact state/output, not a guessed sleep. Subscribe before the
  trigger when events are transient. Re-read mutable state on each check. Bound
  the overall wait and report safe last-observed state on timeout; clean up owned
  subscriptions and timers, including cancellation paths.
- **Timing:** for debounce, expiry or throttling, use the existing controlled clock
  and test the specified boundary. For a 100 ms debounce after one input, assert no
  call at 99 ms and the expected call after advancing the final millisecond and
  flushing the runner's scheduled work. An eventual-success wait cannot establish
  the no-early-call contract. Start a real-time measurement only after observing
  the relevant trigger; retain integration coverage when simulated time omits risk.

For readiness, checking that a result is present must not reject valid `0`, `false`
or empty-string results. Prefer native primitives over a new polling helper; use a
monotonic deadline where supported, not a universal polling interval or retry count.
A timeout is failed or inconclusive evidence, not permission to rerun until green.
These are application-test recipes, not permission for agent-side polling loops,
background workers, live-service probes or extra model calls.

## Preserve prerequisite effects when mocking

Before replacing a method, list its effects and identify which ones the behavior
under test needs. Keep those effects real in a disposable fixture; substitute only
at the slow or external boundary using an existing seam. Inspect code and existing
fixtures rather than contacting live providers to discover side effects.

Example: discovery fetches a catalogue and saves its IDs; duplicate detection later
reads the saved IDs. Mocking the whole discover-and-save method removes the write
and stops testing that handoff. Fake the catalogue fetch below it, keep the save
and duplicate check real, and assert the same ID is not inserted twice. A dispatch
count alone does not establish stored uniqueness or concurrent-write safety.

Use realistic contract-valid doubles for normal paths and explicit incomplete or
malformed doubles for rejection paths. Check arguments, counts or ordering when
contractual; do not require every possible field or ban mock assertions wholesale.
If mock setup dominates the test, consider a small authorized integration fixture,
not a speculative production interface or deletion of necessary lifecycle methods.

## Use substitutes deliberately

Control time, randomness and external I/O through existing injection or test tools.
Use a narrow fake/mock where it enables deterministic feedback; retain integration
coverage for transport, persistence or concurrency semantics the substitute omits.
A local stand-in may differ from the production database's locks and constraints.
Tests must not contact live payment, email or other providers just to avoid mocks.
An internal seam can be justified by the actual barrier; see [legacy-code.md](legacy-code.md).
Do not add a port, SDK wrapper or test-only public interface without a concrete need.

After redesign, map old assertions to retained coverage before removing obsolete
tests. Do not wholesale delete old unit tests because a new interface test exists.
Preserve distinct characterization, internal invariants and failure-path coverage.
Report what ran, completed exits and uncovered contracts. A green suite proves only
its exercised assertions, not all behavior or educational claims about the method.

Source and adaptations: [Matt Pocock](../MATTPOCOCK_SOURCES.md) and
[selected Superpowers recipes](../SUPERPOWERS_SOURCES.md).

## Validate the detector, including its evidence path

When an authorized mutation or negative fixture is meant to prove detection, first
run an unchanged positive control in the same disposable environment. Include the
same required config, dependencies and evaluator revision. If that control fails,
report broken setup; no mutant in that environment earns detection credit. Verify
that the intended mutation was actually applied. A missing anchor is not a caught
defect, and a timeout is not the intended assertion failure.

Fictional example: a refund fixture must reject an amount above the approved limit.
The unchanged copy passes. Removing the limit check should fail the named
`rejects-over-limit` assertion. If the copied project instead lacks a required config
file and fails at startup, classify it as infrastructure failure, not a caught refund
bug. If another assertion fails, record what it detected but do not credit the claim
that `rejects-over-limit` protects this behavior. Require the completed process result
and the specifically expected failure evidence together; a printed success marker
followed by a nonzero exit is not a passing control.

Follow the entire observation path, not only the expected-value expression. A hidden
assertion that reads through a candidate-editable adapter can observe fabricated
success. Identify who can read or write evaluator entrypoints, adapters, config,
inputs, process-status capture and result artifacts. Keep the trusted evaluator and
evidence channel outside candidate control using the project's approved isolation;
if the candidate legitimately changes an adapter, review and validate that boundary
separately rather than silently trusting it as the oracle. Protecting one file or
starting a fresh model context does not establish filesystem/process isolation.

This is a proposed test recipe, not an executed refund test, new harness or authority
to run untrusted audit scripts. Static presence checks and deterministic execution
are not security certification. Preserve independent expected outcomes and existing
real-boundary coverage. See [selection and limits](../COLEAM00_SOURCES.md).
