---
name: astro-website-builder
description: >
  Build or extend an explicitly selected Astro content-first website: shared page
  layouts, Markdown content collections, static routes, selective islands, metadata
  and publication checks. Use for Astro business sites, portfolios, blogs, resource
  sites, or Astro website-builder requests. Not a default framework for every
  website, an automatic scaffold/deployer, an auth/database starter, or a substitute
  for page-purpose, visual design, SEO or application-security owners.
license: MIT (original Prime implementation guidance; see UPSTREAM.md)
compatibility: >
  Markdown guidance only. Inspect the target project's installed Astro, Node,
  integrations, lockfile and native commands. Worked contracts cover Astro 5/6
  Content Layer, not an unbounded latest-version compatibility promise.
metadata:
  version: 1.0.0-prime.1
---

# Astro website builder

Turn the agreed site into working Astro pages without introducing a second design
system or changing the project's framework by default. For existing Astro work,
reuse the actual repository and installed versions. This skill is not an installer.

## Establish the deliverable once

Read applicable root, ancestor and target instructions and relevant source before edits.
Reuse the known audience, page purpose, content, brand, domain and hosting decision.
Do not restart discovery or ask answered questions. For an unclear new site, settle
only decisions that change the outcome, access, cost or implementation scope.
Existing approval carries forward; a new deployment/provider/account does not.

List requested routes, each route's purpose, content source, shared shell, required
interaction and expected public/private status. For a one-page change, list only
that change. Do not manufacture a blog, testimonials, service areas or contact form
merely to fill a standard site map. Missing business facts are unknown, not license
to invent credible names, reviews, addresses, metrics or generated documentary photos.

Use existing owners only when their questions help:
- site-architecture: page purpose, hierarchy, navigation and useful omissions.
- Hallmark: visual direction, content layout, responsive/keyboard/reduced-motion use.
- copywriting/content-strategy: actual marketing content, not mandatory SEO prose.
- seo-audit/schema: indexing and truthful metadata/structured-data contracts.
- engineering-references: real data/API/mutation risks, not every static page.
- browser-check: authorized owned local rendered evidence under its existing limits.

## Implement the requested slice

1. **Confirm the stack.** Read [project setup](references/project-setup.md): existing
   scripts/config/lockfile, content API generation, styling and hosting capabilities.
   A build request is not permission to overwrite an existing project with a scaffold.
2. **Build one complete route and its reusable shell.** Establish typed layout/head
   props, navigation, real content, assets and only needed interactions. Validate this
   slice before repeating it across the requested routes. Keep intentional differences.
3. **Connect repeated content.** Use [content and routes](references/content-routes.md)
   when collections are justified. Make schema, IDs, publication selection, routes,
   list links and any RSS/sitemap consumers agree. Do not copy legacy entry methods
   into Content Layer code.
4. **Finish the page contract.** Use [page delivery](references/page-delivery.md) for
   metadata, image ownership, native/no-JS behavior, missing/error states and evidence.
   Complete the agreed pages, not a polished home page with dead navigation.
5. **Verify and hand off.** Run existing authorized native checks, inspect emitted
   content and relevant local rendered behavior, then report completed/unavailable
   checks. Build success is not deployment success or a measured SEO improvement.

Read only the relevant reference; a small edit does not require a full-site audit.
A valid existing solution with no supported gap needs no new tooling or change.

## Permission and scope boundaries

Reviews stay read-only unless edits are authorized. Do not execute upstream install
commands, run a moving latest scaffold, refresh integrations, start servers, call
providers, generate images, provision databases or deploy from this skill alone.
Use the target project's own runner; inspect scripts before executing them. Keep
local processes bounded and record/clean up only those the task owns.

There is no bundled Turso/admin/auth implementation, image-generation helper,
analytics default, mandatory React/Tailwind/font package, aesthetic rule pack,
remote research loop, background service or automatic updater. Required backend
features remain real work with their own permission and tested contracts; do not
fake successful submissions or quietly omit an explicit user requirement.

## Report

Name changed files/routes, implementation rationale, content/publication policy,
actual commands and completed results, rendered evidence and remaining limits.
Distinguish estimates, source inspection, tested behavior and production verification.
Do not call a snippet a tested starter, a screenshot a functional test, or noindex an
access control. See [UPSTREAM.md](UPSTREAM.md) for source inspiration, exclusions and
original authorship; no upstream Astro Builder or Taste text is redistributed.
