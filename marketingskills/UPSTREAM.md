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
source-fidelity safeguards. The remaining 48 skill entry points are unchanged.
No separate Anti-slop skill, always-on pointer, installer, plugin/MCP code or permission
metadata is added. Upstream versions remain upstream identifiers; Prime adaptation
metadata and this record identify the local additions. Facts, quotes, uncertainty,
code directives and author voice take priority over cosmetic pattern removal.
