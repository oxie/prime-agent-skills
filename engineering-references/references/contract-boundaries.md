# Contract boundaries — scoped reference

Modified for Prime: selectively rewritten and corrected; not an upstream implementation.
See [source and license notices](../THIRD_PARTY.md) and core-provenance.json
at the skill root. No upstream endorsement or runtime validation is implied.

## Select the relevant section

Use for a changed field crossing several paths, an unreliable response boundary,
or a write whose pending state and cached result can disagree. Read only the
matching sections below. A small static page with no such boundary needs none.
This is on-demand guidance, not a required worksheet, architecture, or audit pass.
Reviews stay read-only unless changes and checks are authorized.

Keep the existing framework, client, wire envelope, parser and cache mechanisms.
Do not add a dependency, wrapper layer, ID-branding scheme or lint rule to match
this reference. Fix a demonstrated gap at its existing owner.

## 1. Trace meaning across paths

Start with the invariant, source of truth, changed revision and relevant consumers.
Define absent properties, explicit null, false/zero, enabled values and unfamiliar
enums separately. State whether each means unknown, disabled, inherited or invalid.
Do not turn a missing amount into zero or infer authorization from a visible button.
An additive optional field is not automatically compatible with strict decoders,
signed payloads, old records, cached data or consumers with different semantics.

Trace producer → transformation → consumer for the material paths, such as:
- storage → mapper → detail and list responses → decoder → presentation;
- write → event/job → worker → derived cache or index;
- old payload → current reader, and new payload → supported old reader;
- stored capability + server flag/policy → every protected operation.

Include only real, in-scope paths. Do not create analytics or search requirements
where none exist. Identify serialized aliases, defaults, projections and flag
locations. Database origin alone does not prove old or loosely typed data valid.
For an absence claim, record the searched scope and revision, not just one filename.

### Optional state-by-path worksheet

Example semantics only: `can_export` absent/null/false denies export; only true
with the server flag on may permit it, subject to current authorization. An unknown
`export_mode` is preserved as unsupported and denies that mode, not mapped to a
known permissive mode. These are example product decisions, not universal defaults.

| State | Detail → current client | List → current client | Job → worker / old client |
|---|---|---|---|
| missing capability | Hide action | Hide action | Deny / hide |
| explicit null | Hide; retain unknown meaning | Same | Deny / decode null safely |
| false | Hide; explicit denial | Same | Deny / hide |
| true, flag off | Hide; server rejects attempt | Same | Server rejects / hide |
| true, flag on | Allow only if authorized | Same | Enforce current policy / compatible handling |
| unknown mode | Unsupported; no permissive fallback | Same | Reject unsupported / no decoder crash |

Each cell needs expected result, evidence location, revision and status. The table
above lists expectations only: **all cells are unknown until exercised**. Replace
columns with actual paths; split the combined example column when independently used.
Static source can support a missing mapping or conflicting default before execution;
keep the corresponding runtime behavior unverified rather than claiming a test ran.

Use `proven` for the exact agreement supported by direct evidence and relevant
completed checks; `partial` for narrower evidence; `missing` for an evidenced absent
required edge; `conflict` for incompatible meanings; `unknown` for ambiguous,
unavailable or unexecuted behavior; `not_applicable` with a concrete scope reason.
A type declaration proves neither runtime mapping nor an end-to-end cell. A unit
check at a mapper does not prove a released client. State limits without expanding
access. Derive any blocking requirement from the task's actual contract.

## 2. Parse the response and preserve failure meaning

Locate the real response-to-domain boundary before components or caches consume it.
A caller-selected generic type, cast or JSON syntax parse does not validate a domain
value. Require the existing parser at that boundary or its existing entity adapter;
normalize expected parser failures there if callers rely on normalized failures.
Do not promise one error shape while leaking schema-library exceptions outside it.
Keep programming faults distinguishable; do not label every thrown exception offline.

Use the endpoint's actual body, envelope, media type and success/error conventions.
An empty 204 is valid only for an operation with a no-content result contract. An
empty body for a required entity is not a successful entity. Files and streams need
their own existing contract, not forced JSON. Treat malformed 2xx as invalid response.
For non-2xx, preserve HTTP status even if the error body is malformed. Honor valid
application-error envelopes even on 2xx when the API uses them. Validate machine codes and field-error shapes; map only recognized form fields and
safe messages. Do not expose raw server text, payloads or credentials in UI or logs.

Pass the request-local cancellation signal through transport, body reads and any
existing retry waits. Distinguish deliberate cancellation, deadline expiry,
transport failure, server rejection and invalid response. Status zero alone cannot
distinguish them. Recognize cancellation using the runtime's supported mechanism;
do not infer it solely from a later-aborted mutable controller reference.
A deliberate cancel normally causes no failure toast or automatic retry. It stops
local interest, not necessarily server work. A dispatched write can remain unknown.
Retain request/intent identity checks so obsolete completions cannot replace newer
results even when cancellation is late or unsupported by a dependency.

### Conceptual pseudocode, not an executable implementation

This describes responsibility placement, not new helpers or a certified API sample.
Use the project's throw/result and native cancellation conventions instead.

```text
request = capture this attempt's identity, signal and endpoint contract
try transport + body read using that signal and the existing client
  recognized deliberate cancellation -> preserve cancellation outcome
  recognized deadline expiry -> timeout outcome
  recognized transport failure -> transport outcome
  other fault -> preserve as internal fault, not a retryable network error
if non-success HTTP status:
  parse error details if valid; otherwise use safe fallback retaining status
  return the existing normalized server/HTTP failure
try decode expected success body, envelope and domain with existing parser
  expected decoding/schema failure -> normalized invalid-response failure
  unexpected programming fault -> preserve as internal fault
before publishing: reject obsolete attempt or deliberate cancellation
return parsed domain value, or contract-declared no-content result
```

Keep UI messages/navigation at the existing presentation owner. Verify the installed
query-library version before choosing callback APIs; per-query `onError` is not
available in every TanStack Query version. Parsed shape does not remove valid
optional-data handling, business rules, tenant/object authorization, version checks
or stale-state defenses. Avoid redundant parsing, not distinct safeguards.

## 3. Choose pending or optimistic writes

Prefer pending for server-owned IDs/totals, expensive or irreversible effects,
uncertain outcomes and lists whose correct update cannot be computed locally.
Confirmation is not proof that optimism is safe. A name such as `mark-paid` does
not establish a low-risk operation. A job accepted by the server is not completed.
Use optimistic presentation only when the local prediction and recovery contract
are clear and low risk. Label it provisional; the server remains authoritative.

For relevant caches, identify query keys, detail records, filtered/paginated lists,
ordering, counts and other derived state. Reuse the existing cache design.
Cancel or guard old reads before patching; this does not serialize concurrent writes.
Choose the smallest suitable conflict strategy: serialize conflicting operations,
or use operation/version-aware patches and rollback that preserve later changes.
A whole-snapshot restore is safe only if intervening changes cannot be erased.
An inverse patch can also clobber newer writes; it is not automatically race-safe.

A status update can remove a row from one filter and add it to another, change sort
position or totals, and leave a page boundary unknown. Update only what the actual
query contract supports; otherwise show pending and invalidate/reconcile relevant
queries. Updating every visible matching row is not sufficient cache coherence.
On completion reconcile parsed authoritative data without overwriting newer intents.
Coordinate invalidation/refetch with outstanding writes; an early settlement must
not publish old server state over another pending change. After failure or unknown
outcome, use the operation's recovery path rather than claiming rollback undid a write.

## 4. Retry an intent, not a component lifetime

A lost response can follow a committed write. Retry that write only with proven
server-backed idempotency or another documented duplicate-safe operation contract.
Network error, status zero, HTTP method, a disabled button or a sent key is not proof.
Verify key scope, payload binding, atomic deduplication, concurrent requests,
retention window and response replay/status lookup behavior in the actual service.
Never assume the client detects financial routes and silently makes them safe.

Keep key and payload in explicit intent state that lasts across required retries
or recovery, not component memoization. Same intent and payload reuse the identity;
a genuinely new intent gets a new one. A changed payload needs the server contract's
explicit handling, not accidental reuse. Clear resolved intent state deliberately.
Do not discard an unresolved write's identity merely on navigation or local cancel;
retain the recovery reference as needed. Abandoning UI is not undoing server effects.
Bound allowed retries and total time; do not retry deliberate cancellation,
validation or conflict blindly. If duplicate safety is unknown, show unknown outcome
and reconcile/status-check within authority instead of issuing a fresh write.

## Select checks, then report evidence

Use the project runner when authorized. Relevant cases include valid response,
invalid JSON/envelope/null/primitive, valid no-content versus missing entity,
malformed HTTP error, field errors, deliberate abort, timeout and stale completion.
For writes consider late reads, two overlapping operations with the older one failing,
filter membership/order/counts, lost response after commit, retry and new intent.
Assert resulting records and user-visible state, not merely a toast or request count.
Report supported findings, smallest response and exact evidence limits. No supported
gap means no change; unexecuted checks remain unknown, not a passing review fixture.
