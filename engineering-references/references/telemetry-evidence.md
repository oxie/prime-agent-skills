# Operator-led telemetry — scoped reference

Modified for Prime from selected Addy Osmani guidance. See [source notices](../ADDY_SOURCES.md)
and addy-provenance.json. This is guidance, not a logger, collector or tested service.

## When this adds value

Use when an authorized reliability change or review cannot answer an operator's
question from existing telemetry. Do not add instrumentation to every feature.
Reuse the project's logger, metrics, tracing and severity policy. A source review
stays read-only; this reference does not authorize new dependencies, collectors,
providers, alert rules, live traffic, induced failures or access to remote logs.

## Map the question to usable evidence

Start with the actual question, then the smallest existing signal that answers it.
Record event/metric/span, safe fields, query or artifact location, time window and
coverage limit. An example worksheet is not a requirement to create another file:

| Question | Possible evidence | Distinction to retain |
|---|---|---|
| Did a retried job recover? | Attempt events and authoritative final job state | Attempt failure is not final operation failure |
| Did a timed-out payment apply? | Provider status/reconciliation tied to durable intent | A timeout log cannot prove whether a charge applied |
| Which entry started this run? | Fixed entry-point label propagated with run context | A correlation ID alone does not identify the entry point |
| Where was time spent? | Relevant duration histogram or complete sampled span chain | One sampled trace is not the fleet latency distribution |

Separate stable operation identity from per-attempt/run identity. Define success,
terminal failure, retryable failure and unknown outcome using the operation's actual
contract. Count attempts separately from final outcomes; specify what delivery,
replay, deduplication and observation window permit you to count. Repeated log
lines are not necessarily repeated business effects, and absent logs are not proof
of success. Use authoritative state for effect claims, not a logger call count.

## Preserve attribution and bound data

Set an allowlisted entry-point label at the trusted entry (for example scheduler,
replay endpoint or CLI), rather than guess it in a shared worker. Propagate the
origin and correlation context across actual queue/HTTP boundaries. Establish who
can write that metadata; downstream overrides or untrusted message headers must
not impersonate a trusted origin. A process name or coincidental field is only a hint.

Validate incoming correlation IDs for the project's format, length and trust/proxy
policy; generate an internal ID where needed. Correlation is not authorization.
Do not put credentials, raw payloads, auth headers, personal data or raw error text
into telemetry. Allowlist and bound diagnostic fields; apply access and retention
policy to logs/traces too, not just metrics. Do not move unsafe metric labels into
logs and assume that makes them safe.

Use bounded metric dimensions and route templates, not user/tenant/request IDs,
raw URLs or arbitrary error messages. Estimate the combinations and series budget.
A bounded status code may be more useful than its class; choose for the question.
Histograms expose latency tails; means and rates can still answer other questions.
Keep instrumentation overhead and collector failure from changing the business
contract; diagnose dropped telemetry through existing facilities where available.

If using sampling, record where spans are dropped and which events can be observed.
A tail sampler cannot recover spans discarded by an earlier head sampler. Do not
claim all errors are retained without evidence from the actual export pipeline.
Alerts, when in scope, need an actionable question, justified threshold/window,
owner and runbook. Preserve existing SLO/severity policy; capacity warnings can be
valid before users are affected. Do not lower production thresholds to test a page.

## Verify emission separately from ingestion and diagnosis

Choose authorized native test cases for the changed path: success, transient recovery,
terminal failure and unknown external outcome where relevant. Inspect actual emitted
records, field safety, bounded labels and count meaning. Check context propagation
at the real queue/HTTP boundary, not only a child-logger mock. Prove an unknown effect
through its reconciliation path before claiming the retry is safe.

A fake logger test proves at most the calls it observes. Actual emitted output does
not prove collector ingestion, queryability, alert delivery or useful diagnosis.
For those claims use an already authorized collector/test sink, find the relevant
failure through telemetry and verify the intended query or test alert destination.
Avoid real pages, provider effects and production failure injection. If access is
absent, report the unverified layer; do not expand permissions to fill the table.
Report signal, evidence location, environment/revision/window and remaining limits.
