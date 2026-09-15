# Upstream and Local Adaptation

- Source: https://github.com/coreyhaines31/marketingskills
- Pinned commit: `5b2c0007766c6a1cf1d53fd8fc73e979e0821022`
- Installed on: `2026-09-06`
- Upstream license: MIT (`LICENSE`)

## Included

- All 50 bundles under `skills/`, including references, evals, and assets.
- Non-executable integration and Composio documentation under `tools/`.
- `tools/REGISTRY.md` and the upstream license.

## Excluded

- `tools/clis/` API client executables.
- Repository release, sync, and validation scripts.
- GitHub workflows, Claude plugin/configuration files, and repository-level agent instructions.
- Contributor, partner-program administration, and changelog files that are not required at runtime.

## Local compatibility fixes

- Added a one-line Prime safety wrapper to every `SKILL.md` to approval-gate external, credentialed, filesystem-wide, package-install, scheduling, and other consequential actions.
- Repaired two stale `positioning` links to target `product-marketing`.
- Repaired the `ad-creative` link to `ads/references/meta-decision-system.md`.
- Made two `attribution` cross-skill conversion-tracking references explicit and resolvable.
- Replaced Claude-specific `WebFetch` wording in `aso` with Prime-compatible HTTP/browser guidance.
- Replaced Claude/cron-first scheduling guidance in `marketing-loops` with Prime manual-first, explicit-request rules.
- Replaced two direct CLI command examples with approved-connection, read-only guidance.
- Rewrote links to excluded CLI sources as pinned upstream GitHub links.
- Replaced the ad-review HTML template's real-brand health/discount claims with neutral placeholders.
- Removed one upstream trailing-space defect so `git diff --check` passes.
- Added explicit Task Observer validation markers to reviewed files that intentionally use mail-merge or Google Tag Manager `{{...}}` syntax.

These local changes are intended to preserve Prime Agent compatibility and safety. Review and reapply them when updating from upstream.


## Selective Anti-slop expansion

Additional reviewed source: miqdadbadjuber/anti-slop package 3.2.4 at
`55e0e160d18a9a963c6486d5c6be6d9e82418c5c`; attribution in [THIRD_PARTY.md](THIRD_PARTY.md).
Copy-editing now also selects non-marketing prose and code-comment review. Those paths
skip marketing context, conversion sweeps and scoring panels; comment work is not an
executable-code/security audit. Copywriting retains its marketing scope and gains
source-fidelity safeguards. In that expansion, the remaining 48 skill entry points were unchanged.
No separate Anti-slop skill, always-on pointer, installer, plugin/MCP code or permission
metadata is added. Upstream versions remain upstream identifiers; Prime adaptation
metadata and this record identify the local additions. Facts, quotes, uncertainty,
code directives and author voice take priority over cosmetic pattern removal.

## Selective website guidance

Source: https://github.com/kostja94/marketing-skills at
`70987bad4ebe9dce1f74858c1c64f3f8810f18e4` (MIT; notice in THIRD_PARTY.md). This is not an unchanged
installation or endorsement. Selected source files:

- `skills/pages/content/blog/SKILL.md` (SHA-256 `e6b5e99842316156389b3008021a3305680900561c45432236eab866d2a1fd1c`)
- `skills/pages/content/article/SKILL.md` (SHA-256 `36098e7ca47e9638f1a2340a97534b907611cb438fd77775bcebe5488f45e01c`)
- `skills/pages/marketing/showcase/SKILL.md` (SHA-256 `38a81c70bb5c9ba40ba4ddcff9244cb9628f37188f5e8d03a5dc27a529a35e5a`)
- `skills/pages/marketing/customer-stories/SKILL.md` (SHA-256 `727e01369058ca6d8e042383dd9048208f2e65c5686cdb9f5521a426edb9a0ed`)
- `skills/pages/marketing/services/SKILL.md` (SHA-256 `df3bf5ce06810d08d921a163cea80a9a2d6f5aabd72df33214b19fd0be8fd0fe`)
- `skills/pages/content/docs/SKILL.md` (SHA-256 `0b6278230babf1f9ae3438cb41807f5ed15cab57dfca88ad883ead46d8b1dc71`)
- `skills/pages/content/resources/SKILL.md` (SHA-256 `8936f3ff2db32dfe2020ff8977903bd29af26be969da5e7980fcea0041a262ac`)

Adaptation: condense the selected page/component decisions into an on-demand
reference under the existing owner. Portfolio application, useful omissions and
Prime handoffs are local synthesis. Remove numeric quotas, unsupported traffic/SEO
claims, fixed layout requirements, automatic research, promotion, foreign context
paths and operational setup. Preserve actual content, permissions, existing design
systems and source/browser verification. No new skill names, runtime or installer.
Update only after source review; retain scope controls and run website-guidance tests.

Runtime reference: skills/site-architecture/references/page-purpose.md. Hallmark owns
visual layout; site-architecture retains hierarchy and page-purpose decisions.

## Selective RampStack guidance and factual corrections

See [source notes](RAMPSTACK_SOURCES.md) and rampstack-provenance.json for the
reviewed selection, corrections, exact source/local identities and exclusions.
No new skill, executable payload or automatic workflow is installed.

## Selective Claude SEO guidance and current feature corrections

See [source notes](CLAUDE_SEO_SOURCES.md) and claude-seo-provenance.json for the
reviewed source, primary-document corrections, exact identities and exclusions.
SEO Audit and Schema remain the owners; no new runtime or automatic workflow.
