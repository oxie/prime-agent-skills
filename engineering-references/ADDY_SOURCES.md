# Direct Addy Osmani adaptations

Source: [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills), commit
`be4e44a9fbc5e8df0beaefadbb28bd22ee61cc39`. MIT, Copyright (c) 2025 Addy Osmani;
[full permission and disclaimer](licenses/addyosmani-MIT.txt) retained unchanged.
No upstream endorsement. Source identity and text checks are not task-efficacy proof.

These are selective, corrected prose adaptations, not upstream implementations.
The prior AAS source mappings remain intact in [THIRD_PARTY.md](THIRD_PARTY.md).
Local explanatory additions here use CC BY 4.0 with underlying Addy MIT rights
retained; this is not a blanket relicense of the skill or external linked works.

| Installed portion | Direct pinned source |
|---|---|
| [Telemetry evidence](references/telemetry-evidence.md) | `skills/observability-and-instrumentation/SKILL.md`, `references/observability-checklist.md` |
| [Contract boundaries](references/contract-boundaries.md), “Server recovery details” in section 4 | `skills/api-and-interface-design/SKILL.md`, idempotency discussion |
| [Release dependencies](references/release-dependencies.md), “Phased migration exit evidence” in section 2 | `skills/deprecation-and-migration/SKILL.md`, phased schema migration and consumer inventory |

Corrections: no per-feature telemetry mandate or new tool authority; trusted entry
attribution and bounded safe fields; emission versus ingestion/diagnosis; sampling
loss limits; explicit unknown external effects and reconciliation; scoped key/replay
policy; race-safe resumable backfill and consumer-horizon evidence; no universally
safe additive DDL or mandatory reversible migration claim. No runtime code copied.

The same review adds an original analytical JS/TS note to Ponytail, under that
owner's separate MIT notice in its UPSTREAM.md. It analyzes counterexamples from
`skills/code-simplification/SKILL.md`; no linked Anthropic/plugin text was copied.
Exact source paths, URLs, Git blobs, SHA-256 and current installed file hashes are
in addy-provenance.json (installed paths there are skills-repository-relative).
Core source identities remain unchanged; pre_addy_sha256 retains each prior core
file hash, while sha256 identifies the current extended file. Historical reports
and pilot evidence are not rebound to new bytes.

## Not adopted

No other upstream entrypoint, lifecycle, interview loop, fixed quota, floor guard,
source-rewriting hook, URL cache, installer, MCP, browser/provider or eval runner.
The full 25-skill review informed selection, not a claim that all 197 blobs were
semantically audited. Optional performance-artifact guidance remains a future
lookup, not a newly installed persona or measurement capability.

Updates are manual: inspect changed source and notices, preserve target ownership,
review the diff, run focused native/tests, then commit/push/verify the remote.
Documentation checks and local JS counterexamples do not establish application
telemetry, database/provider guarantees, model effectiveness or production health.
