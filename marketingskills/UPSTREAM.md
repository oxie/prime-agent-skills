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
