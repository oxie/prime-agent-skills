# Work slicing and dependency evidence

## Extend the existing plan

Use when a substantial task needs independently verifiable slices or a wide refactor
cannot land as ordinary vertical slices. This supplements [the Depth Tree](method.md),
not its replacement. Unlazy still owns contracts, acceptance gates, exact file
ownership, leases, dispatch, parent re-verification and final request reconciliation.
Do not create another planner, scheduler, tracker or completion-state vocabulary.

Read the current request, plan, relevant source and existing decisions first. Reuse
the current task's PLAN and ledgers when present. For a small planning-only request,
a response can contain the breakdown; this reference does not force file writes.
Planning permission is not permission to implement, publish tracker issues, provision
services, commit changes or create background work.

## Slice by observable capability

State what a caller or user can do after each slice, and how a check demonstrates it.
Include only the layers that capability actually crosses. A CLI feature need not
invent a web UI; a static page need not invent a database. Prefer one narrow complete
path over “all schemas,” then “all APIs,” then “all tests.” Each slice must keep its
required denial/error behavior rather than saving all safeguards for a final ticket.

For each slice put its outcome, contract IDs, observing gates, exact ownership and
real blocking IDs in the existing plan. Keep implementation details where they help
execution without making a speculative full design. Shared files need an earlier
owner or an integration owner; conceptual independence does not prevent file clashes.
A prefactor belongs first only when it makes the required change safer or possible,
not as an automatic cleanup phase. Size by coherent deliverable and verification
cost, not a universal token count or a one-ticket-per-session rule.

### Vertical-slice DAG example

Illustrative report-management feature; IDs stand for existing PLAN leaf IDs.
An arrow means the predecessor must be VERIFIED before the successor is ready.

```text
A: create and retrieve one private report, including denial tests
A -> B: list that caller's reports in specified order
A -> C: archive one owned report; reject foreign-report archive with no write
B + C -> D: list excludes archived reports and preserves remaining order
```

A includes the required persistence/API path and an end-to-end check, not merely a
schema. B and C deliver separate observable behavior. They can run concurrently only
with disjoint ownership and verified A. D has a real cross-slice integration claim.
Avoid an arbitrary B -> C edge if C does not need B. Conversely, do not omit the C -> D
edge just because the list-only tests pass before archiving exists.

Check that IDs exist, edges reflect required outputs, and the graph has no cycles.
A cycle often hides an unsettled shared contract: resolve or extract that contract,
or combine inseparable work. Do not silently delete edges to unlock dispatch.

## Decisions are not implementation

When a design is genuinely unresolved, name the decision, evidence needed and affected
slices. A decision leaf may finish with an accepted choice, not working product code.
Keep precise unanswered questions as pending work; keep vague in-scope uncertainty
in the existing plan until it can be stated clearly. Out-of-scope ideas do not become
new work without authorization. No compulsory all-cases interview is needed.

A closed or rejected tracker item is not a satisfied prerequisite. Example: “Use
provider X” is rejected, so a slice requiring X's API contract remains WAITING. Do
not treat closure as approval or invent the missing contract. Revise the affected
plan and gates to the authorized alternative, or surface the unresolved handoff.
Likewise, ABANDONED, returned, merely implemented and stale evidence are not VERIFIED.
Use the existing [orchestration](orchestration.md) and [dispatch](dispatch.md) rules;
a verified predecessor alone does not bypass ownership claims or lease release.

## Wide mechanical refactor: expand, migrate, contract

When one symbol/schema change spans many callers and no narrow vertical change can
remain compatible, use this explicit exception rather than forcing broken slices:

1. **Expand:** introduce the new form beside the old with tested compatibility.
   Observe the actual adapter/translation semantics, not just both names compiling.
2. **Migrate:** split real caller groups into owned batches, each requiring verified
   expand evidence. Check their behavior and compatibility with unmigrated callers.
3. **Contract:** remove the old form only after every required migration batch is
   VERIFIED and an integration gate proves no supported old use remains.

For example, E expands `customerId` beside a legacy key; M1 migrates HTTP callers and
M2 migrates jobs; K contracts. The DAG is E -> M1, E -> M2, M1 + M2 -> K. If M2 is
rejected or fails, K is not ready, even if a text search finds no HTTP legacy key.
Include actual serialized data, retained messages, old workers and rollback consumers
when the contract involves them. A code search alone does not establish their absence.
For operational rollout evidence use the engineering release-dependencies reference;
this plan does not authorize migration or production probes.

If batches cannot stay green alone, use an explicitly planned integration branch and
final integrate-and-verify gate. Label intermediate results as partial; do not promise
independent releasability. Contract/removal still waits for verified prerequisites.
Do not weaken a valid gate to certify an incompatible batch as green.

## Verify the joined outcome

Use authorized checks in the target project's native environment. Parent verification
must inspect nonempty artifacts and completed exits, then test cross-slice behavior.
Use the existing root inventory to prove every requested outcome is covered; passing
leaf tests alone does not prove integration. Report pending decisions and rejected
prerequisites as visible limits, never silently drop them from the completion claim.

Source and adaptations: [MATTPOCOCK_SOURCES.md](../MATTPOCOCK_SOURCES.md).
