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

## Preserve evidence validity through the final consumer

Use this when assertions pass through evaluators, replay results, saved artifacts or
completion gates. Keep predicate truth separate from whether it could be evaluated.
Carry observation validity, actually evaluated coverage and the tested source/fixture/
assertion revision through every adapter. Use the project's existing result contract;
no new evidence service is implied. A declared assertion is not an executed assertion.
Record failed reads, skipped checks and unknown outcomes explicitly, and keep them
ineligible for verified success at the final consumer. Successful action dispatch or
an assertion-free replay cannot fill that gap.

Decide which propositions require a complete observation window. Observing one event
can support “at least one” despite unrelated loss. “None”, “exactly N” and “at most N”
need relevant completeness before passing: a lost matching event can disprove them.
Bound the claim to the actual session, document and interval; a quiet interval does
not prove that no later event will occur. Preserve these requirements in compound
predicates. A conjunction needs every required branch; a disjunction may rely on a
sufficient, validly proved branch, but must not award coverage to unproved branches.
Do not turn every partial observation into failure or every positive count into proof.

Fictional regression cases for an authorized disposable fixture:

| Case | Required final evidence |
|---|---|
| A DOM match command returns an explicit read error | Unknown/unevaluable, not zero matches and a passing absence check |
| Two matching notifications occurred, one was lost, and one remains | “Exactly one” is unknown; “at least one” can still be supported |
| An absence predicate is wrapped in a one-branch conjunction | The wrapper cannot erase its completeness requirement |
| A nested or alternate-locator assertion is declared but skipped | No assertion credit merely because its declaration exists |
| A flow passes on revision A, then a covered input becomes B | A's artifact cannot authorize B without applicable fresh evidence |

Trace each case through the real consumer boundary, including serialization and
reload where applicable. Pair negative cases with a complete-window positive control
and an actual evaluated assertion. Check the stored status and final gate decision,
not only the inner evaluator's boolean. Carry forward a supported contradiction as
such; unknown observation is not proof of an application defect.

Bind reusable passing evidence to the bytes actually exercised, including relevant
uncommitted changes and flow/fixture revisions. A newest timestamp or matching flow
name is not that binding. Follow [running-revision evidence](release-dependencies.md)
when the served build can differ from the checkout. Never weaken an expectation to
recover green or claim that a repaired locator preserved intent when its consequence
check was empty or skipped.

These are proposed cases, not executed browser tests or proof of production safety.
Keep existing authorization, independent oracles and real-boundary coverage. No SDK,
MCP server, telemetry, provider call or automatic replay is authorized here. See
[source findings and limits](../RETICLE_SOURCES.md).

## An evidence requirement must reach the approval gate

Use this example when a model or adapter produces a result used for acceptance.
A prompt saying “show evidence or fail” is not enforcement if another layer defaults
missing evidence to success. Trace the declared requirement → response schema →
parser/defaults → stored result → final approval. Inspect the actual consumer and any
legacy or alternate route, not only the judge's instructions.

Fictional example: a checker may approve an import only after observing the required
row-count check for the tested input revision. Its model returns `approved: true` but
omits the check evidence. The parser supplies an empty list for compatibility, and the
final gate reads only `approved`. The response is parseable, but the required check is
unverified. A high score or a second judge's agreement cannot supply the missing event.

For an authorized disposable fixture, state the required evidence and exercise these
cases through parsing, persistence/reload and the real approval consumer:

| Input/evidence case | Required outcome |
|---|---|
| Correctly typed result with supported evidence of the required check on the current revision | Eligible to pass this evidence gate; other acceptance and authorization checks still apply |
| Missing or empty required evidence, even with `approved: true` | Unverified, not a supported pass |
| Malformed evidence or string `"false"` where a boolean is required | Explicit invalid result, not truthiness-based approval |
| A declared check was skipped or never configured | Not checked; no credit for having declared it |
| Valid evidence shows the required row count is wrong | Supported failure, not missing evidence |
| A legacy result parses but cannot establish required evidence | Explicit legacy/unverified state at final approval |

Validate required field types and semantics at the owning boundary. Nonempty evidence
is necessary only where the contract requires it, and is not sufficient by itself:
a citation, copied marker or unrelated successful command may not support the claim.
Bind evidence to the actual check, attempt and tested revision. Keep unknown observation
separate from a demonstrated product defect; do not fabricate proof to satisfy a schema.

A compatibility path may preserve readable older results without granting them verified
status. Ensure serialization, defaults and later aggregation preserve that distinction.
Pair each rejection with the supported positive case so a gate that rejects everything
does not pass the test. Assert the stored state and final decision, not just parser
success, and never weaken the evidence requirement merely to restore green results.

These are proposed regression cases, not a new evaluator, executed model trial or
production-safety claim. Use the project's existing result contract and approved test
tools; this example adds no provider calls, dependencies or automatic grading service.
See [source findings and limits](../OUROBOROS_SOURCES.md).
