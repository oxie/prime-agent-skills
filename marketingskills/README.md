# Marketing Skills for Prime Agent

This is a safety-adapted runtime bundle of the open-source [marketingskills](https://github.com/coreyhaines31/marketingskills) collection.

- Upstream commit: `5b2c0007766c6a1cf1d53fd8fc73e979e0821022`
- Installed skill bundles: 50
- License: MIT; see `LICENSE`
- Skill entry points: `skills/*/SKILL.md`
- Companion integration documentation: `tools/`

## Safety adaptation

The upstream API CLI helpers, repository scripts, workflows, Claude plugin files, and agent-context files are not installed. They are not needed for Prime Agent skill discovery. Some upstream API helpers can read credentials and make remote write requests when invoked. Links to their source are retained for review, but they must not be copied or run without a separate audit and explicit approval.

Every installed `SKILL.md` includes a Prime safety wrapper. The skills are guidance, not standing authorization. External publishing, sending, spending, account changes, package installation, scheduling, broad file access, data uploads, and other consequential actions require explicit user authorization; preview them and prefer read-only or dry-run steps.

## Selective quality-review expansion

`copy-editing` also covers non-marketing prose and code comments through a separate,
non-conversion workflow. `copywriting` retains marketing scope with source-fidelity
checks. See UPSTREAM.md and THIRD_PARTY.md for the reviewed Anti-slop selection.
No separate skill, always-on pointer, installer or MCP server is added.

## Installed skills

- `ab-testing`
- `ad-creative`
- `ads`
- `ai-seo`
- `analytics`
- `aso`
- `attribution`
- `churn-prevention`
- `co-marketing`
- `cold-email`
- `community-marketing`
- `competitor-profiling`
- `competitors`
- `content-strategy`
- `copy-editing`
- `copywriting`
- `cro`
- `customer-research`
- `directory-submissions`
- `emails`
- `events`
- `free-tools`
- `image`
- `influencer-marketing`
- `launch`
- `lead-magnets`
- `marketing-council`
- `marketing-ideas`
- `marketing-loops`
- `marketing-plan`
- `marketing-psychology`
- `offers`
- `onboarding`
- `paywalls`
- `popups`
- `pricing`
- `product-marketing`
- `programmatic-seo`
- `prospecting`
- `public-relations`
- `referrals`
- `revops`
- `sales-enablement`
- `schema`
- `seo-audit`
- `signup`
- `site-architecture`
- `sms`
- `social`
- `video`
