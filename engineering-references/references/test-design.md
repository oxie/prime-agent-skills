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

Source and adaptations: [MATTPOCOCK_SOURCES.md](../MATTPOCOCK_SOURCES.md).
