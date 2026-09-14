# Recovery planning and restore evidence

Use only when backup or disaster-recovery planning is requested. This is a planning
and review checklist, not a backup tool, incident commander or permission to execute
restores, drills, failovers, schedules, monitoring, uploads or infrastructure changes.
A review stays read-only. Use the project's existing runbook and approved operators;
do not create a second operational authority or request secrets in a document.

## Inventory the state and dependencies

List stateful systems, owners and business impact: databases, object/file storage,
configuration, access-control state, queues/event logs and necessary metadata.
Distinguish authoritative data from reproducible caches/projections. Identify the
source needed to rebuild each derived store and the time/capacity that rebuild needs.
Include dependencies required to recover: DNS, identity provider, secret/key manager,
backup catalogue, compatible software/schema versions and provider-account access.
Record key locations and access procedures, never key or credential values.

Choose scenarios explicitly: accidental deletion, delayed corruption, ransomware,
account compromise, regional/provider outage or lost access. Replication can copy
corruption/deletion and is not a substitute for recoverable history. A copy in the
same failure or administrative domain may disappear with the source. Evaluate
separate accounts/locations, least privilege, encryption and immutable/offline copies
against the actual threats; no universal provider or copy-count rule proves recovery.

## Set measurable objectives

Agree business-specific RPO (acceptable lost committed state, expressed as a time
window) and RTO (acceptable service interruption). State the event/start and verified
service end condition used to measure each. No universal one-hour target or quarterly
drill cadence is implied. Retention must cover plausible corruption-detection lag
and applicable obligations; distinguish operational recovery from archival retention.

Record targets separately from measured results. Measure outage-to-verified-service
recovery, including detection/authorization, provisioning, key access, restore,
validation and traffic recovery. A timer started at the restore command measures
only that phase, not the full RTO. For RPO compare recovered consistent state with
known committed state at disruption, identify lost/missing work and disclose unknowns.
A recent snapshot timestamp alone does not prove the achieved recovery point.

## Design the restore procedure before an incident

Name the authorizer, operator, alternate contacts, go/no-go criteria and bounded
stop conditions. Prefer an isolated restore target for a separately approved test.
Before any authorized real restore, identify exact source/target and backup version,
compatible restore software, required keys and access. Verify backup integrity and
consistency, not only the backup job's success flag. Preserve current state/evidence
where feasible and contain the original corruption/compromise before reintroducing it.

Plan how writers, jobs, consumers and traffic are fenced during cutover. Avoid two
authoritative writers or replaying duplicate external effects such as payments and
notifications. State what happens to writes after the selected recovery point and
how they are reconciled. Define rollback or roll-forward honestly: switching DNS
back cannot undo new writes, and some restores are not reversible.

Verification must include relevant business invariants and user flows, not only
row counts: relationships, permissions, expected objects, schema compatibility and
safe replay/derived-state rebuild. Record checks and expected outcomes before use.
Resume traffic/writers only through the approved decision once the named service
criteria pass; observe the recovery window through already-approved tooling.

## Evidence and handoff

A tabletop review proves plan coverage only. An isolated partial restore proves the
paths actually exercised, not regional failover or all systems. Record exact scenario,
backup identity, environment, checks, measured timings/loss, untested dependencies,
failures and owner actions. Do not report an untested plan as a successful recovery.
Schedule or execute drills only with separate explicit authorization and bounded
blast radius, stop criteria and owned-resource cleanup.

Keep the inventory, target-versus-measured results, procedure, authorizations,
verification criteria and open gaps in the project's existing runbook. This adds
no recurring agent work. [Release It!](release-it.md) owns production failure handling;
[DDIA](data-intensive-applications.md) owns consistency/replay semantics.

Source: corrected selective adaptation of RampStack backup-and-disaster-recovery and
its restore-runbook-template at `a67dd34c609f034c0cfd736a348659bbdf1605bf`; see
[source notes](../RAMPSTACK_SOURCES.md). MIT notice retained locally.
