# Project setup and version boundaries

Start from the repository's actual entrypoints, package manager, scripts, lockfile,
Node requirement, Astro version, framework integrations and deployment target.
Inspect existing files before adding similarly named layout/components/config.
Do not overwrite custom source or lockfiles with generated output. For an approved
new project, select a compatible supported stack and review the scaffold diff;
record exact versions. This reference supplies no automatic acquisition command.

## Choose one coherent contract

| Area | Inspect / apply only to the selected project |
|---|---|
| Astro 5 Content Layer | `src/content.config.ts`, `defineCollection` from `astro:content`, `z` from `astro/zod` (Zod 3; old astro:content import also supported), loader from `astro/loaders`, entry `id`, imported `render(entry)`. |
| Astro 6 Content Layer | Same content config/ID/render model; import `z` from `astro/zod`. The old z export is deprecated, not described here as removed. Node >=22.12.0 is the documented minimum, not a recommendation to use an unpatched runtime. |
| Legacy collections | Astro 5 has legacy compatibility; the old config does not always error. Astro 6 removes legacy behavior by default. Inspect and migrate the entire schema/query/route chain when authorized, not just the config filename. |
| Other versions | Check matching official documentation and installed exports. Do not assume a later option works on 5/6 or silently upgrade to make an example compile. |
| Tailwind 4, if selected | Matching Vite integration (`@tailwindcss/vite`) and CSS `@import "tailwindcss"`; preserve actual theme/token definitions. |
| Tailwind 3, if retained | Matching legacy integration/config and v3 directives. Do not combine v4 setup commands with v3 copied config. |
| Plain CSS | Astro scoped/global CSS and existing project conventions may be sufficient. No Tailwind, React or font dependency is mandatory. |

Astro 5.2+ can install Tailwind 4 through its integration workflow; that fact is
not permission to run it. A utility name such as bg-background needs a real theme
mapping; declaring an unrelated CSS variable does not create it. Respect the actual
module format; do not place CommonJS require into an assumed native ESM config.

MDX needs the matching integration and loader pattern if it is a requirement.
A loader limited to `**/*.md` does not support `.mdx` just because the prose says so.
Local collections need not follow one prescribed folder tree; their loader base and
pattern define the selected files. A schema does not create a public route by itself.

## Output and hosting

A purely static site normally needs no server adapter. Preserve an existing valid
output mode. For a selected Astro 5/6 static-default project with on-demand endpoints,
use a compatible adapter and mark those routes `prerender = false`. Do not use
`output: 'hybrid'`; it was removed in Astro 5. Server output has different defaults;
do not change modes merely to match the static example.

Confirm that the actual host supports the selected adapter and endpoint behavior.
Keep secrets server-only, validate required configuration without printing values,
and do not put secrets in client-imported modules or public-prefixed variables.
Build-time content can become public HTML/JSON even if its original environment
variable was server-only. Inspect what crosses into output, not just the prefix.

Use the agreed production origin, base path and trailing-slash policy consistently
for route links, canonical URLs, feeds and assets. Do not silently publish a preview
hostname or placeholder domain. If the real domain is unavailable, mark deployment
metadata unresolved; a local preview can still be useful without pretending it is
production-ready. Existing subpath deployments must not be broken by root-only links.

Headers and redirects for static files belong to the actual host configuration.
Middleware source does not prove headers on emitted files. Do not enable analytics,
production publication or cloud resources while preparing local configuration.

## Verification setup

Read the project's native commands and call only authorized existing tooling.
For example, if package scripts already define `check` and `build`, use the selected
package runner for those scripts. Astro build alone need not perform full typechecks.
Do not install a missing checker or bypass a failed check without a justified decision.
Save exact exit results; a started process or log mentioning success is insufficient.

Relevant primary documentation is listed in [UPSTREAM.md](../UPSTREAM.md).
These are implementation questions and unexecuted API sketches, not a pretested
application, pinned dependency set or universal current-version guarantee.
