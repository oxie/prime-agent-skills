# Reticle: source findings and reuse limits

Reviewed [reticlehq/reticle](https://github.com/reticlehq/reticle/tree/3a7785dda4c56712501da4fbf7626b49368fee8d)
at commit `3a7785dda4c56712501da4fbf7626b49368fee8d` (root version 2.14.0).
The appended section in [test design](references/test-design.md#preserve-evidence-validity-through-the-final-consumer)
is original prose under this owner's existing MIT terms. It is not copied source,
a translation of Reticle's instructions or a port of its implementation.

## Selected evidence

The review traced these source-level paths; reticle-provenance.json records exact
source bytes, SHA256, Git blob identities and local payload hashes.

| Pinned source | Observation informing the original guidance |
|---|---|
| [predicate-element.ts](https://github.com/reticlehq/reticle/blob/3a7785dda4c56712501da4fbf7626b49368fee8d/packages/server/src/events/predicate-element.ts#L30-L37) | A replied MATCH failure becomes an empty match; the absence branch at lines 136–149 can pass |
| [blind-spots.ts](https://github.com/reticlehq/reticle/blob/3a7785dda4c56712501da4fbf7626b49368fee8d/packages/server/src/honesty/blind-spots.ts#L286-L315) | Completeness classification excludes exact positive counts and does not traverse compound predicates |
| [flow-replay.ts](https://github.com/reticlehq/reticle/blob/3a7785dda4c56712501da4fbf7626b49368fee8d/packages/server/src/flows/flow-replay.ts#L459-L485) | A shared evaluator drops testid expectations on the assumption that another runner evaluated them |
| [replay-mapping.ts](https://github.com/reticlehq/reticle/blob/3a7785dda4c56712501da4fbf7626b49368fee8d/packages/server/src/runs/replay-mapping.ts#L16-L42) | Artifact projection maps execution OK to PASS without retaining unverifiable status |
| [cli-flow-commands.ts](https://github.com/reticlehq/reticle/blob/3a7785dda4c56712501da4fbf7626b49368fee8d/packages/server/src/cli/cli-flow-commands.ts#L185-L238) | Gate checks latest passing names and selected integrity conditions, not tested/current byte identity |

These are conditional source findings, not reproduced exploits or a claim that every
Reticle result is wrong. Independent contradiction/capture checks protect some paths;
ordinary testid steps do evaluate their testid expectation. The original lesson is to
preserve validity across all relevant paths, not to discard useful positive evidence
when unrelated observations are lost. The fictional notifications example is new.

## Rights and exclusions

Copyright (c) 2026 Reticle Labs. The [root overview](https://github.com/reticlehq/reticle/blob/3a7785dda4c56712501da4fbf7626b49368fee8d/LICENSE)
is a per-package map, not a blanket permissive grant. Core/browser/framework SDK
packages use Apache-2.0. The reviewed [server license](https://github.com/reticlehq/reticle/blob/3a7785dda4c56712501da4fbf7626b49368fee8d/packages/server/LICENSE)
is FSL-1.1-ALv2: specified Permitted Purposes exclude Competing Use, with Apache-2.0
conversion on each version's second release anniversary. The separate
[Enterprise license](https://github.com/reticlehq/reticle/blob/3a7785dda4c56712501da4fbf7626b49368fee8d/packages/server/src/ee/LICENSE)
requires an appropriate subscription for production and restricts bypass of license
functionality. Dependency, asset and trademark rights remain separate.

No FSL/Enterprise implementation or upstream operating instructions are copied. This
original addition does not relicense Reticle, assert upstream endorsement or provide
legal clearance for a later runtime integration. Review actual package terms again
before any such use. Existing local and historical third-party notices remain intact.

Reticle's SDK, daemon, MCP/HTTP tools, initializer, client approval changes, telemetry,
cloud sync, model-driven setup and benchmark claims are excluded. Browser Check and
existing authorization owners remain unchanged. No new runtime, dependency, global
rule or concept store is added.

## Verification limits

Upstream programs, tests, browsers, model calls and exploits were not executed.
The source assessment and deterministic local documentation/history/loading checks
establish their stated scope only. The proposed regression cases are not empirical
proof of application correctness, model compliance, privacy or production safety.
