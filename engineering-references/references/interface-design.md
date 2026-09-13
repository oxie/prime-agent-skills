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
