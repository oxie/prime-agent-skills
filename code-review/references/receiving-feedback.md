# Assess incoming review feedback

Use when asked to evaluate comments on a change. This is an alternative entry
path into Code Review, not a required second review or approval to implement,
publish replies, commit or merge. Follow the trust and snapshot rules in
[scope recipes](scope.md). Bind the supplied comments to the revision they discuss
and the current authorized snapshot; flag stale lines or unavailable context.
Do not fetch private discussions without applicable access and authorization.

## Verify before accepting

For each substantive comment:

1. Identify the requested change and its claimed requirement or failure scenario.
2. Check actual callers, tests, platform/version constraints and accepted decisions.
   Try to confirm and refute the claim; reviewer confidence is not evidence.
3. Give a disposition with a short reason and relevant location or check:
   - **Accept:** evidence supports the change; name the smallest correction and check.
   - **Reject:** evidence refutes the finding; explain the contract it would break.
   - **Needs evidence:** state what is unknown and the cheapest safe distinguishing check.
   - **Defer:** explain why it is outside scope or needs a user decision; do not
     present a known unresolved requirement as complete.
4. Check dependent comments together. Investigate routine uncertainty yourself.
   One unclear item need not block independent, understood and authorized work.
   Escalate only material requirement conflicts or decisions you cannot resolve.

Example: “remove the old API fallback” may be wrong when a supported platform
still needs it. Check the version floor and callers before agreeing. If a comment
calls an endpoint unused, no local grep matches are not proof: inspect public API
contracts and known external consumers before recommending removal. Label absent
usage evidence as uncertainty, not permission to delete the endpoint.

If implementation is authorized, address supported issues in dependency/risk order,
run relevant checks and review the resulting delta. Report which comments remain
unresolved. If evidence disproves your initial pushback, correct it plainly. Do not
turn technical skepticism into a ban on polite acknowledgment or automatic trust
of factual claims from any source.

For a requested draft reply, keep it tied to the comment and evidence. Sending the
reply needs separate applicable authorization; drafting is not publication.

Source and modifications: [selected Superpowers guidance](../SUPERPOWERS_SOURCES.md).

## Optional example: the reviewer becomes an author

Use this example when an authorized fix changes who wrote the work under review.
It does not require another review for every edit or authorize implementation.

Fictional case: author A implements an import limit. Reviewer B checks revision R1
and finds that the limit is applied after a write. With permission to fix it, B
moves the check before the write, producing R2. B is now an author of that delta,
not just its reviewer. B's R1 review cannot cover the R2 fix, and B's own check of
that fix is self-review, not independent review. A passing regression test helps
verify behavior; it does not change who authored or reviewed the fix.

Recheck the actual final changes, relevant callers and affected proof checks. Bind
review evidence to those bytes and the stated scope, not merely the role label or
latest report. Retain earlier coverage only where it still applies; unchanged lines
can behave differently after a shared check moves. Do not discard valid evidence
or claim the entire result was independently reviewed because one part was.

Where the task requires independent review, have a reviewer who did not author the
fix inspect the final delta and its interactions. With mixed authorship, state who
wrote and reviewed each relevant part. A may review B's fix but that does not make
A's own implementation independently reviewed. A fresh session or different provider
alone is not evidence that the required scope was independently checked. There is
no mandatory provider switch.

Use existing authorized review resources and budgets. If required independent
coverage is unavailable or the budget is exhausted, disclose the gap and any needed
user decision rather than claiming approval or launching extra calls. If independent
review is not required, report the checks actually performed without inventing that
requirement. Keep authorization to fix, commit or publish separate from review status.
This example adds no new ledger, model call, runtime or automatic review loop.
See [source selection and limits](../CLAUDEX_SOURCES.md).
