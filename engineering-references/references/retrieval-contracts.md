# Retrieval results, coverage and index readiness

Use only for an authorized review or change to retrieval, multi-source search or a
similar derived-index boundary. Read the relevant section, not a universal RAG
checklist. This adds no search engine, service, provider, database or model trial.
Reviews remain read-only unless edits and checks are authorized. Existing project
contracts and [response/write boundaries](contract-boundaries.md) take priority.

## Preserve coverage through the final caller

Capture the requested source scope and the actual completed scope using the existing
result envelope. Distinguish complete-with-hits, complete-empty, partial and failed;
keep cancellation and invalid response distinct where the API requires them.
A complete-empty result means successful coverage of that stated scope under its
filters/limits, not proof that no relevant fact exists anywhere. A malformed 2xx
response is not an empty successful search. Validate the actual envelope before
applying optional-field defaults.

Trace backend → aggregation → tool/API wrapper → model/UI. A lower layer returning
an error is insufficient if its caller catches it and returns success with no hits.
Logs alone do not communicate degraded coverage to the consumer. If partial results
are allowed, keep useful hits with a safe failed-scope/coverage indication; if the
contract requires all sources, fail rather than silently degrade. Do not force one
failure policy onto every caller or expose internal endpoints/secrets in errors.

For example, sources A and B succeed while C times out. "A/B contain these passages;
C was unavailable" is bounded evidence. "No document mentions X" is not supported
by zero hits from A/B while C is unread. All-source failure must not trigger a false
absence claim or automatic switch to unapproved web sources.

## Make ranking independent of arrival order

For concurrent stores, define whether fusion consumes separate per-store ranked
lists or a globally ordered list per modality. Completion order is not relevance
order. Do not concatenate locally sorted lists and then treat their positions as
global ranks. Reciprocal rank fusion uses rank positions, not probability estimates;
normalizing scores without sorting does not repair incorrect assigned ranks.

If merging comparable scores, use the declared normalization and a deterministic
tie-breaker before assigning ranks. Otherwise retain separate ranked lists with the
intended fusion weights. Define deduplication identity and when truncation occurs;
a later reranker cannot recover candidates already discarded by an earlier limit.
Bound request-wide work as well as per-store work: query expansion × model groups ×
stores can multiply a nominal top-k or concurrency cap. Reuse existing admission and
time budgets; do not add a new scheduler solely for this reference.

## Separate persisted content from searchable readiness

Identify authoritative records, derived indexes and the revision/status binding
between them. Saved content is not necessarily indexed or ready for retrieval.
Resolve hits against current authorized records when the contract requires current
content; reject deleted, disabled, inaccessible or incompatible-revision hits rather
than trusting stale vector payloads. Scope checks still apply to hydrated neighbors
and related records, not only the initial hit. A valid identifier is not permission.

Before destructive replacement, resolve required dependencies and define the
failure/recovery path. Do not delete usable state and then discover the replacement
engine cannot be constructed. Use the project's appropriate staging, status,
version or compensation mechanism; no distributed transaction is mandated here.
Record failed indexing separately from successful persistence. Define whether old
content remains usable, how retry reconciles partial writes, and who owns cleanup.
Deleting a DB row does not prove every index entry or stored file was reclaimed.

## Verify the consumer-visible outcome when implementation is authorized

Select tests for the actual changed contract:
- One backend fails, all fail, complete-empty, cancellation and malformed success:
  assert final result/coverage and allowed downstream actions, not only log output.
- Reverse store completion timing with the same candidate lists: assert identical
  selected IDs and order, including ties; do not check only counts or score ranges.
- Dependency resolution fails before replacement: assert old usable state remains
  when required and no destructive step occurs before prerequisites succeed.
- Persist succeeds but indexing fails; retry; stale/deleted/unauthorized hits:
  assert authoritative state, readiness and exact visible content/revision.
- Clip a page or one oversized chunk: distinguish truncation from pagination and
  verify a usable continuation when complete reading is promised. Otherwise label
  the unreachable remainder rather than returning a misleading complete result.

These are proposed cases, not executed tests or proof of retrieval quality. Model
experiments require separate approval and a bounded budget. Report source inspection,
implemented behavior and checks actually run separately. See
[source notes](../WEKNORA_SOURCES.md). No upstream code is bundled.
