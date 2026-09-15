# API authorization — scoped reference

Use when a protected endpoint changes or an object/tenant boundary is in question.
Keep the existing identity provider, permission model, request parser and database.
This is not a new auth service, scanner or mandatory security pass. A review is
read-only; production requests, test-account writes and external actions need
applicable authorization. No supported gap means no change.

## Define the boundary

Record the route, method, caller identity, tenant, resource, operation and allowed
fields. Include alternate/bulk endpoints only when relevant. Distinguish identity
verification from authorization for this exact operation. A role or visible button
alone is not permission. Use the existing provider's verified session/token result;
a decoded token, cookie presence or caller-selected tenant is not trusted identity.
Check current membership/revocation where the actual policy requires it.

Use the endpoint's real ID format: UUIDs, opaque strings and numeric IDs differ.
Reject partial numeric parses and unsafe integers only for numeric contracts; do
not impose a numeric parser on opaque IDs. Enforce body limits before expensive
parsing. Allowlist writable properties and pass the parser's transformed result,
not the original body or a spread of arbitrary properties, to the mutation.
Keep required business transitions and object authorization after shape validation.

## Make enforcement part of the operation

Locate the final read/write and all relevant side effects. Put owner, tenant and
operation conditions into the mutation or an equivalent correctly isolated
transaction. A separate check followed by an unconstrained write can race a
membership/ownership change. Row-level policy still needs correct session context.
Check affected-row counts and concurrent changes according to the database contract.
Administrative access needs explicit policy; do not add a blanket bypass.

Parameterize values; an ORM does not authorize requests or sanitize unsafe raw SQL.
Constrain sensitive returned fields as well as writable fields. Apply resource-
disclosure policy consistently: 401/403/404 behavior must match the actual service,
not expose another tenant's object merely to explain denial. CORS is neither
identity verification nor CSRF protection. Cookie-based mutations need the project's
CSRF policy. Keep tokens, raw bodies and private records out of routine logs.

For quotas, use established atomic counters/expiry and trusted identity/proxy
configuration. Define store-outage behavior; fail-open versus fail-closed is a
risk decision, not a library default to assume. Do not invent a quota service.

## Select tests that prove the denied action did not occur

Use disposable, authorized fixtures through the project's native runner. Example
matrix for an owned profile update; adapt expected statuses and policies:

| Input / identity | Required observation |
|---|---|
| Missing, expired or wrong-audience identity | Rejected before protected action |
| Valid caller, another owner or tenant | Documented denial; no protected write |
| Extra role/tenant/owner property | Rejected or explicitly excluded by contract; no privilege change |
| Malformed ID or invalid body | No protected write; no unintended external side effect |
| Valid padded display name | Only allowed, parsed/transformed value stored |
| Membership removed during operation | Policy holds under actual isolation/concurrency |
| Quota/store failure | Documented failure policy; no accidental bypass or duplicate effect |

For negative cases assert storage and relevant queued/provider effects are unchanged,
not only response status. Intentional security logging/quota accounting may change;
distinguish them from the denied business effect. Verify a positive authorized case
so an endpoint that rejects everything does not pass. Include bulk and cross-tenant
same-ID cases if the schema allows them. Do not reset unrelated records for cleanup.
A mocked no-call assertion cannot establish real transaction or provider behavior.

Report route/revision, evidence, supported defect, smallest fix and untested paths.
Passing parser tests is not deployed authorization or a security certification.

Modified for Prime: corrected, task-scoped prose adaptation. See
[source and license notices](../NEXT_SOURCES.md). No executable implementation copied.

## A hold must survive the next entrypoint

Use this example when a protected action can be reached through approval, retry,
queue dispatch or an administrative path. Successful validation and permission to act
are separate facts. Enforce the current policy at the final effect boundary, not
only in the caller that initially records a hold. Keep the hold durable and bound to
the intended resource, operation and revision; a generic `passed` status must not
silently erase it. Missing, stale or unreadable approval evidence cannot authorize
the protected action. An explicit administrative exception still needs its own policy.

Fictional example: a document export for revision r7 passes validation but awaits a
reviewer's approval. The first request returns `held`. A retry, the next queue tick
and a direct supported export endpoint must all leave the protected export and its
queued delivery unchanged. A test of the first response alone misses a dispatcher
that treats `passed` as permission. Use the actual shared state and final boundary
in a disposable fixture; a mocked caller refusal proves only that caller's behavior.

Include an authorized positive case: an allowed reviewer releases the r7 hold and
export proceeds under the existing duplicate-effect policy. If the document becomes
r8 before execution, r7 approval cannot authorize r8; require the policy's reapproval
or refusal. Check revision and permission atomically with the effect, or use the
service's equivalent expected-revision precondition, so a concurrent change cannot
slip between check and action. Repeat the denied cases across relevant entrypoints
and assert both stored state and forbidden delivery/outbox effects, while allowing
explicitly permitted security logging.

These are proposed regression cases, not proof of a deployed approval system. Use
existing authorization/state mechanisms; do not introduce a scheduler, approval
service or automatic merge path. See [selection and limits](../COLEAM00_SOURCES.md).
