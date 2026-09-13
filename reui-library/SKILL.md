---
name: reui-library
description: >
  Reuse and redesign actual source-owned React UI components from a small tested
  ReUI starter: forms, panels, empty/loading/error states and basic tables. Use
  when the user asks for ReUI, ready-made reusable application components, or a
  React/shadcn component-library starting point. Supplies code, not just design
  advice. Complements Hallmark; not a universal UI framework, full ReUI catalogue,
  advanced data grid/calendar, MCP client or automatic package installer.
license: MIT; selected ReUI and shadcn notices in assets/starter/THIRD_PARTY.md
compatibility: >
  Source-first React 19 and Tailwind 4. Bundled demo/test tools require Node ^22.22.2 || ^24.15.0 || >=26.0.0 and npm;
  dependencies are project-local and locked. No runtime executes on skill loading.
metadata:
  version: 1.0.0-prime.1
  upstream: https://github.com/keenthemes/reui
  upstream-commit: 8a2c701eaf95729f238274d5ce2555a5a8bd23e7
---

# ReUI Library — usable source, owned by the project

Use [the starter](assets/starter/README.md) as implementation material, not a
mandatory design system. Hallmark owns design intent, Variate requested alternatives,
and project engineering real data, security and persistence. The user's redesign
brief overrides upstream advice to preserve a demo's appearance.

## Choose only what the project needs

1. Read target instructions, existing components/tokens and native package/lock files.
   Prefer a suitable existing component. Check actual React, Tailwind and primitive
   family contracts; never replace an existing stack or global stylesheet silently.
   In an RSC framework, import interactive source inside an explicit client component;
   the Vite pilot does not verify direct Server Component imports.
2. Inspect the selected exports in [src/index.ts](assets/starter/src/index.ts).
   The four compositions are ProfileForm, ResourceTable, DataState and Panel.
   Selected primitive families are source-owned; inspect their actual props before
   adapting. A labelled panel is not a modal. A plain table is not a virtual grid.
3. Copy/adapt only the needed source and dependency closure into the authorized
   project. Preserve its imports, tokens, business contracts and unrelated files.
   Retain [source notices](assets/starter/THIRD_PARTY.md) and record local changes.
   Do not blindly overwrite components, install packages, or append global CSS.
4. Connect the callbacks to actual application behavior. The bundled demo commits
   only local memory. A fulfilled save callback must mean the application's chosen
   completion contract; unknown/pending/failed remote writes must not look saved.
   The table filters/sorts provided local rows, not all server matches.
5. Run that project's typecheck/build and behavior tests. Check rendered narrow/wide
   layouts, long content, labels/errors, keyboard/focus, touch and relevant motion
   preferences. The starter's evidence is not certification of a modified consumer.

## Authorized isolated demo

For an explicitly requested trial, copy the starter to an owned working directory;
keep node_modules/build outputs out of the installed skills checkout. From that
copy, using its own Node/npm environment:

```text
npm ci --ignore-scripts
npm run typecheck
npm test
npm run build
npm run preview
```

The manual preview binds 127.0.0.1:5179 with strict port selection. Retain its process
handle and stop it after checks. Use browser-check only for this owned authorized
origin; no public browsing, external assets or backend submissions are required.
Dependency lifecycle scripts stay disabled; normal reviewed build/test commands
are separate actions. Do not upgrade npm, start a server, or fetch dependencies
merely because this skill was loaded.

## Beyond the small starter

ReUI is an optional upstream catalogue, not fully vendored or universally verified.
The reviewed revision has 1,105 examples in each Base and Radix catalogue; the starter is only
a small selected subset. Source/version/rights are in [UPSTREAM.md](UPSTREAM.md).
Advanced filters, steppers, upload galleries, grids and scheduling need separate
review and regression work; known defects were not imported as working recipes.

No MCP, ReUI account, Pro/Ultimate purchase, upstream agent skill or unpinned shadcn
CLI is needed here. External imagery, fonts, icons and premium products have their
own rights. Source ownership means updates and security fixes require deliberate
review; there is no updater, provider, hook, background service or telemetry.
