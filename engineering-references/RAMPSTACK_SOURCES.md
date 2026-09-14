# Selective RampStack source notes

Reviewed repository: https://github.com/rampstackco/claude-skills
Pinned commit: `a67dd34c609f034c0cfd736a348659bbdf1605bf` (2026-09-14 review).
This is a corrected, condensed adaptation, not an unchanged bundle or endorsement.
Prior source identities and experimental results retain their original meaning.
No model-effectiveness, rendered-design or live-operation result is implied.

## Selected sources and ownership

`skills/backup-and-disaster-recovery/SKILL.md` and
`skills/backup-and-disaster-recovery/references/restore-runbook-template.md` inform
[recovery planning](references/recovery-planning.md). See
[exact source/local hashes](rampstack-provenance.json) and
[MIT license](licenses/rampstack-MIT.txt).

The local reference separates business RPO/RTO targets from measured data loss and
outage-to-verified-service recovery. A restore-command timer is only phase timing.
It adds state/dependency inventory, independent recovery copies and key access,
write fencing, consistency/business checks and honest partial-test evidence.

No upstream operational scripts, provider setup, fixed objectives/cadences, backup,
restore, drill, failover, schedules or infrastructure changes are authorized by
reading it. The existing runbook/operators remain the operational owners.
Manual source review and deterministic checks precede any approved update; prior
book/source bodies and historical hashes remain unchanged. No new skill or runtime.
