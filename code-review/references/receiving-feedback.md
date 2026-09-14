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
