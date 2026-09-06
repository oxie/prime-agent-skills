# Installation Audit

## Decision

A wholesale installation of the upstream repository was rejected. This directory is a pinned, safety-adapted, content-only runtime bundle accepted for Prime Agent advisory use.

- Source: https://github.com/coreyhaines31/marketingskills
- Commit: `5b2c0007766c6a1cf1d53fd8fc73e979e0821022` (`v2.11.1`, unsigned lightweight tag)
- Git tree: `e13a1d9e5500ab1390353c6c7d74499978e89603`
- License: MIT
- Review date: `2026-09-06`

## Why the upstream repository was not installed intact

The upstream checkout includes 64 credentialed Node API clients, executable repository scripts, mutable package and Git examples, CI workflows, live-account mutations, broad file/network workflows, Claude-specific instructions, and scheduling guidance. No obvious malware, committed credential, install hook, compiled binary, or automatic checkout execution was found. The risk came from the authority that later tool use could exercise.

## Runtime controls in this bundle

- No `.js`, `.mjs`, `.py`, `.sh`, package manifest, workflow, hook, Claude/agent context file, or executable-mode file is included.
- All 50 skill entry points include a Prime safety wrapper that requires explicit authorization for consequential action and prefers previews/read-only/dry-run work.
- The API CLIs and repository automation are excluded.
- CLI documentation links point to the exact audited upstream commit for review only.
- `marketing-loops` is manual-first and cannot schedule automation without an explicit user request after manual validation.
- The ad-review HTML asset uses neutral fictional placeholders and has no fetch/XHR/WebSocket/storage/cookie/eval behavior. User-supplied image URLs can still make a browser fetch those images.
- Broken cross-skill links and Prime-specific `WebFetch` wording were repaired.

## Validation

- 50/50 frontmatter blocks parse and meet Prime name/description rules.
- Prime Agent v0.9.2 discovers all 50 exact skill names from the nested `skills/` directory.
- All included JSON parses.
- All local Markdown links resolve, using a stricter scan that also inspected code fences.
- No symlink, executable bit, executable source extension, or common credential/private-key pattern was found in the installed set.
- The upstream validator passed all 50 source bundles before adaptation.
- The local Task Observer bundle gate passes 48/50 adapted bundles. Its two remaining failures are expected false positives for intentional `{...}` marketing/data-layer template placeholders in `analytics` and `cold-email`; custom parsing and Prime discovery pass both.

## Remaining use-time risks

Skill prose includes commands, provider suggestions, scraping/research techniques, code snippets, regulated-channel guidance, and optional third-party services. Treat remote and project content as untrusted data. Review privacy, platform terms, copyright/trademark, advertising claims, CAN-SPAM/CASL/TCPA/GDPR/CCPA/FTC, and account/spend implications for each real use. Vendor mentions may include disclosed commercial relationships and are not endorsements.

## Update policy

Do not run `git pull` or overwrite this bundle from upstream. Review a new full commit, reapply the adaptations listed in `UPSTREAM.md`, regenerate `MANIFEST.json`, rerun the checks, and commit the result as a new proposal.
