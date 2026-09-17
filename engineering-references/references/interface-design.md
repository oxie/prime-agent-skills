# Compare interfaces under the same contract

## When to use

Use when a meaningful interface choice is open, or caller complexity suggests an
existing boundary may be misplaced. This is an optional design comparison, not a
mandatory architecture pass. Read relevant callers, implementation, tests and scoped
instructions first. Reviews stay read-only unless changes are authorized.

An interface includes everything a caller must know: arguments and results, valid
states, ordering, errors, cancellation, configuration and material performance limits.
Depth means useful behavior behind manageable caller obligations, not lines of code.
Locality means a policy change can be made and verified in its rightful owner instead
of repeated across callers. Use project vocabulary; do not rename services or APIs
merely to enforce this terminology.

## Fix the comparison frame

Pick the actual candidate and list its existing caller contracts. Include behavior
to preserve, dependencies, supported failure modes and non-goals. Trace at least the
materially different callers so a convenient default does not erase another use case.
Sketch two genuinely different interfaces against those same requirements. More
alternatives or delegated designers are useful only when the task justifies them;
there is no quota for workers, entry points or hypothetical flexibility.

For each design show a short usage example, obligations left with callers, complexity
hidden inside, dependencies and testing approach. Include invalid use and recovery,
not just the happy-path signature. Do not claim that moving code behind a method
removes the need to define its error, ownership or concurrency semantics.

### Example: import records from two existing callers

Fixed contract: CLI and HTTP callers import a bounded ordered list. Every row is
validated before any durable write. Invalid input returns indexed errors and writes
nothing. Success commits the entire list atomically in input order. Existing
cancellation semantics are preserved: cancel before commit writes nothing; cancel
after the commit point does not imply rollback. No streaming requirement is added.

**A — one operation:** `importRecords(rows, signal) -> ImportResult`.
Usage: each caller submits its list and handles `invalid(errors)`, `committed(ids)`
or the project's defined cancellation/storage failure. Validation, ordering and
transaction control live behind the operation. Callers cannot commit a partial list.
Tests cover invalid-late-row/no-write, order, atomic failure and cancellation timing.

**B — prepared value:** `prepareImport(rows) -> Invalid | PreparedImport`, then
`commitImport(prepared, signal) -> CommitResult`.
Usage: each caller checks preparation, then passes the opaque prepared value to
commit. Preparation preserves ordered, immutable validated rows. Commit owns the
same atomic transaction and cancellation boundary as A. It rechecks constraints
that can change between preparation and commit; preparation is not a reservation.
Callers must understand that preparation is not persistence and handle commit failure.
Tests add the preparation/commit gap to all of A's required behavior checks.

These are different interaction models, not the same method with different names.
Both must preserve all fixed contracts; neither may write each validated row early
or turn cancellation into an unsupported guarantee. B has more caller obligations
and a stale-state risk. Prefer A for these callers unless an actual preview or reuse
need earns B's extra surface. A future hypothetical workflow is not that evidence.

## Compare where the work really lives

- **Caller burden:** count concepts and legal/illegal sequences, not only parameters.
- **Leverage:** which repeated validation, orchestration or error policy disappears
  from actual callers? Which complexity merely moved into setup or configuration?
- **Locality:** walk one likely policy change through each design and its tests.
  Name the files/owners that change; do not equate fewer files with safer semantics.
- **Seam placement:** can tests exercise the relevant behavior without omitting real
  persistence, transport or concurrency guarantees? Keep those integration checks.
- **Migration cost:** account for supported callers, compatibility and preserved tests.
  A cleaner new signature can still be a worse authorized change today.

Run the deletion thought experiment: if the module vanished, would necessary policy
reappear across callers, or would only pointless forwarding vanish? This is a question,
not a rule to delete every small wrapper. Check hidden obligations before deciding.

### Necessary adapter counterexample

A five-line adapter converts a provider timeout exception to the application's typed
`DeliveryUnknown` result and passes the caller's cancellation signal to the SDK.
Removing it may expose provider-specific errors or drop cancellation in every caller.
Keep it even with one production adapter: it protects a real compatibility boundary.
A second adapter is not required to justify that boundary, and a test fake is not
proof that another production implementation is needed. Reuse suitable native SDK
or framework facilities rather than adding a duplicate abstraction.

## Recommend and verify within scope

Recommend one design and explain the decisive contract trade-off. A hybrid is useful
only if its combined caller obligations are checked again. If implementing, migrate
incrementally and verify affected callers in the project's native environment.
Retain old tests until their distinct assertions have proven replacement coverage;
do not delete whole suites merely because tests now cross a deeper interface.
Use [test-design.md](test-design.md) for oracle and observation choices. For a focused
complexity audit, Ponytail remains the owner; this comparison does not trigger a
second mandatory review, automatic refactor or publication step.

Source and adaptations: [MATTPOCOCK_SOURCES.md](../MATTPOCOCK_SOURCES.md).

## Optional architecture compatibility check

Use when independently built components share a boundary and the written decisions
may allow incompatible interpretations. Reuse the existing design or plan; do not
require a new architecture document or a review for every edit. Read the accepted
product conditions, required supporting material, callers and code first. Existing
higher-scope decisions stay binding; a conflict needs its rightful owner's resolution,
not a silent local override. Code is evidence of current behavior, not proof that a
bug or accidental convention is an approved requirement.

Try to construct two implementations that obey every written decision yet disagree
at the shared boundary: data meaning, ownership, state transitions, errors, permission
timing or protocol semantics. Show the concrete pair and the consequence. If the pair
violates an existing rule, it is an implementation defect, not a missing architecture
decision. Fix or verify it through the existing authorized workflow.

For a real gap, record the smallest binding decision in the current artifact:

- **Binds:** which components, capability or boundary must agree.
- **Prevents:** the specific incompatible choices and resulting failure.
- **Rule:** the observable constraint both implementations must obey.

Keep material rationale and evidence with the existing decision record; no parallel
memory log. Recheck the pair against the tightened rule and preserve required
real-boundary tests. Do not claim that a paper counterexample proves runtime behavior.
If no consequential gap is supported, add no rule. Do not standardize harmless internal
choices or turn the current stack, folder tree or library version into a permanent
invariant. A deliberate deferral names why it is safe and when/whose decision is needed;
an unresolved shared contract that blocks safe implementation is not safe to defer.

### Connected fictional example: tenant audit export

Continue the product-intent example from Unlazy: tenant isolation, required audit
columns, deletion by seven days after creation, current access for each new download
and no scheduled delivery are accepted in this hypothetical plan. The audit-field
table remains required supporting material. None may disappear from a worker brief.

A weak architecture note says only “Export access must be authorized.” Component A
checks permission at generation and returns a storage URL that stays usable after
revocation. Component B expects each new download to check current membership and
role. Both can follow that weak note, but their timing choices conflict. A already
violates the fuller product contract; the architectural gap is its missing propagation
into the shared boundary, not permission to relax the product requirement.

- **Binds:** export worker, download handler and storage delivery boundary.
- **Prevents:** treating permission at generation or possession of a URL as permission
  after revocation; leaking content across tenants or after expiry.
- **Rule:** bind the export to its tenant and creation time. Each new download checks
  the caller's current tenant membership and administrator role, export ownership
  and expiry before releasing content. An issued storage URL must not bypass these
  checks. Delete the generated file by creation time plus seven days; expiry denial
  alone does not prove deletion.

Under this rule, A's post-revocation URL is no longer compliant. The implementation
must enforce the delivery boundary, not merely add a permission check to a UI button.
This does not promise to erase bytes already delivered. Whether to abort an in-flight
response is a separate product decision; do not infer that guarantee from “new download.”
Defer helper names and storage-library internals to their implementation owners because
they do not change this contract. Do not defer authorization timing or required columns.

Proposed boundary checks: generate for tenant A; verify its expected rows/columns;
attempt tenant B access and get no content; revoke A's caller before a new request and
get no content, including through any issued URL; at expiry verify denial and actual
file deletion. Use controlled fixtures and the intended running revision. Link these
checks to the existing product gates; do not add a separate architecture tracker.
These are illustrative checks, not executed results or measured agent effectiveness.

Selected source and rights: [BMAD_SOURCES.md](../BMAD_SOURCES.md).
