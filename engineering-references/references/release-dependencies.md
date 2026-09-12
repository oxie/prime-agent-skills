# Release dependencies — scoped reference

Modified for Prime: selectively rewritten and corrected; not an upstream implementation.
See [source and license notices](../THIRD_PARTY.md) and core-provenance.json
at the skill root. No upstream endorsement or runtime validation is implied.

## When this adds value

Use for a diff with operational prerequisites, compatibility-sensitive rollout,
or a question about whether the intended revision actually serves intended traffic.
Read only the relevant sections. This supplements Release It!; it is not a new
release gate, mandatory template, deployment tool or permission to access production.
A small static page edit with no release question or changed operational contract
needs no release checklist. Do not invent a worker, schema or service requirement.

Keep existing release tooling and project acceptance rules. Reviews stay read-only.
Do not deploy, migrate, register callbacks, alter flags/traffic, tail remote logs,
probe providers or create monitoring merely to fill an evidence gap. Use authorized
existing evidence; propose the smallest missing confirmation when access is absent.

## 1. Establish the actual change and intent

Record the authorized release range or patch, included worktree changes, affected
services and intended artifact/revision. Use the project's release convention;
a recent-commits fallback is partial scope, not proof of the complete release diff.
Keep unrelated local changes separate. Confirm the target environment and intended
rollout when those facts materially change the answer.

State intended outcomes separately: artifact built/uploaded, revision running,
traffic routed, cohort enabled, background work processed, or full rollout complete.
An intentionally off flag or fixed canary allocation can meet the requested phase.
Do not demand full enablement or promotion unless that is the intended outcome.

## 2. Map changed code to prerequisites

For each material dependency, connect the changed file/symbol to the required
operational state, evidence or owner confirmation, ordering constraint and recovery.
Use existing configuration and runbooks; do not require a new tracking system.
A file in the diff is not proof that a target environment applied it.

| Diff signal | Relevant dependency questions |
|---|---|
| New config read or renamed key | Build-time or runtime? Default/validation? Deployment injection and safe failure? |
| Column, enum, index or required data | Migration/backfill needed? Actual runner wired? Target applied state and old data compatible? |
| Topic or producer/consumer payload | Resource/permissions ready? Mixed-version readers/writers? Retained messages, retry/replay and deployment order? |
| Worker behavior | Compatible worker revision, concurrency/capacity, job acceptance versus completed effects? |
| Callback URL or provider setting | Correct environment registration, URL/redirect allowlist, auth/signature policy and cutover coordination? |
| Assets, templates or frontend routes | Correct uploaded artifact, path, permissions, backend route, CDN/cache relationship? |
| Cache key/value or projection | Mixed values/readers, invalidation or rebuild, lag and rollback compatibility? |
| Build/deploy workflow or runtime | Tested artifact identity propagated, required tools/config available, direct job-output dependencies correct? |

Report names and redacted evidence, never secret values. Source-control absence
alone does not prove a secret or external resource is absent in production.
Owner metadata can help; git authorship is not authority or required signoff.

Order by compatibility, not a universal rule that migrations or workers always go
first. For example, compatible consumers may need to precede a new producer; an
expand step may precede new code while a destructive contract step waits for old
readers/writers to retire. Include queued messages and old cache shapes in that test.
Distinguish reversible rollback, roll-forward, compensating action and restoration.
Reverting code does not undo written data or side effects. Do not prescribe a `down`
migration for an irreversible change or replace tables with lossy snapshots.

## 3. Verify the intended running state, if authorized

Deployment exit zero proves command success, not the deployed revision or behavior.
Prefer immutable artifact identifiers tied to the intended source/build, rather than
an ambiguous short commit or mutable tag. Inspect revision evidence through the
intended service/route, with environment, time and observed scope recorded.

A version endpoint can hit one new instance while other replicas or CDN assets are
old. Pair it with existing rollout inventory/routing evidence for the intended
regions, replicas, cohorts or traffic allocation. Include workers when changed;
an HTTP revision does not identify a queue consumer. No need to add an endpoint
or a monitoring service if existing authorized tooling supplies suitable evidence.

Check a relevant critical behavior through the intended traffic path when permitted.
Identify whether a probe bypassed the edge, used a mock, hit only one replica or
exercised only a health handler. Avoid destructive/live side effects just to test
readiness. A health 200 and matching revision alone do not prove prerequisites,
correct behavior, traffic coverage or safe compatibility with the remaining fleet.
When a flag is intentionally off, verify its intended off behavior and staged
artifact/rollout state, not a feature action expected only after enablement.
An intended 10% canary should match that allocation; it is not a failed full deploy.

## 4. Report only supported conclusions

Separate confirmed diff-linked defects, plausible requirements needing confirmation,
and neutral access limits. Missing remote access alone is not a discovered defect.
An unverified required migration/topic/config dependency is a release uncertainty,
not a neutral footnote; apply the project's actual acceptance criteria to it.
“No blocker found in the reviewed scope” is not “production verified ready.”

Report the range, intended phase, relevant finding/location, impact, smallest next
check or repair and evidence limits. State unexecuted checks as unknown. For live
claims include observed artifact/revision, traffic scope and relevant behavior,
not just a successful command. Stop when the authorized question is resolved;
Unlazy and project instructions retain acceptance and completed-command reporting.
