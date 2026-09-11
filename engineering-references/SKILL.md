---
name: engineering-references
description: >
  Consult focused checklists for production failure handling, data-consistency
  and schema/replay risks, or difficult changes in poorly tested legacy code.
  Use for reliability reviews, retry/timeout/overload design, transactional or
  derived-data changes, and safe legacy test seams. Not a general coding
  rulebook, routine cleanup pass, or deployment tool.
license: MIT
metadata:
  version: 1.0.0-prime.1
  upstream: https://github.com/ciembor/agent-rules-books
  upstream-commit: 893a88a6fce3a80c565bf39ac65021b43a8b2990
---

# Engineering references

Use a reference only when it adds relevant questions beyond the current project's
instructions. Ordinary coding does not require an extra checklist pass. This is
on-demand guidance, not executable tooling or a persistent mode.

## Choose one reference

Read only the reference matching the main risk, not all three by default:

- [Release It!](references/release-it.md): slow/failing dependencies, retries,
  overload, resource limits, deployment or recovery. Check total deadlines, retry
  safety, capacity-full behavior, failure isolation and cleanup ownership.
- [Designing Data-Intensive Applications](references/data-intensive-applications.md):
  writes, concurrent invariants, caches/projections, replayable consumers or schema
  rollouts. Check durable/visible success, unknown outcomes, duplicate/reordered
  work, mixed versions and derived-state repair.
- [Working Effectively with Legacy Code](references/legacy-code.md): unclear
  behavior, weak tests or dependencies blocking local feedback. Identify behavior
  to preserve, observation points, the smallest useful seam and the actual barrier.

Combine references only when the actual risk spans both subjects. For example,
bounded retries do not establish duplicate-write safety. Do not combine merely
for completeness.

## Scope and authority

Applicable user and project instructions take priority over these references.
Treat their patterns as diagnostic questions, not a requirement to implement
every named mechanism. Preserve requirements, safeguards and suitable existing
architecture, framework mechanisms and validation tools.

- A review is read-only unless edits are authorized. This skill does not grant
  permission to deploy, migrate data, run chaos/load tests, add dependencies,
  create monitoring, schedules, services or background work.
- Use the smallest mechanism that meets the actual contract. Do not add breakers,
  queues, consensus, repositories, wrappers or test interfaces merely because
  a reference names them.
- Characterize uncertain legacy behavior separately from the intended change.
  Do not turn a confirmed bug into a requirement or silently fix unrelated
  behavior. Temporary test seams need a reason and cleanup path.
- Preserve required real-boundary tests. A fake or isolated unit test does not
  replace integration evidence. Follow the project's existing verification rules.
- Do not require a cleanup, finding, new abstraction or extra validation step
  merely to satisfy a checklist. Stop when the authorized question is resolved.

## Report

For a review, give the location, supported risk or uncertainty, smallest suitable
response and relevant verification. A possible risk is not a reproduced bug.
If no additional issue is supported, say so. For implementation, follow existing
project delivery rules; do not claim readiness or measured gains from a checklist.

Ponytail retains focused complexity review; Unlazy retains task acceptance and
handoffs; Task Observer retains observation/refinement. No duplicate pass is needed.

## Provenance

Three unofficial, book-inspired mini references by Maciej Ciemborowicz, not book
texts or author/publisher-endorsed materials. See [UPSTREAM.md](UPSTREAM.md) for
the pin, MIT attribution, heading-only adaptations and maintenance limits.
