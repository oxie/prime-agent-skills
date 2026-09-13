# ReUI starter provenance and limits

Pinned source: https://github.com/keenthemes/reui/tree/8a2c701eaf95729f238274d5ce2555a5a8bd23e7
Repository package version2.5.2. This starter is a selective Prime adaptation, not
an official ReUI release, the complete catalogue, or an upstream endorsement.

## Actual reuse

The starter includes six selected primitive families and four local compositions.
See assets/starter/source-selection.json for exact upstream files, Git blob/SHA-256,
local output mappings and modifications. The component wrappers retain/adapt actual
ReUI source; compositions use the reviewed field/empty/panel anatomy with explicit
local validation, promise, state and table contracts. This is not a wholly original
app relabelled as an upstream library. No generated public registry payload or
upstream installer was executed. Demo-host aliases and external media were removed.

New local composition/demo/test text is MIT. Full Keenthemes2025MIT and shadcn2023MIT
notices are retained under assets/starter/licenses; see THIRD_PARTY.md there.
Underlying dependency licenses remain separate. No paid blocks, external fonts,
images, logos or motion icons are supplied. Linked sources gain no blanket rights.

## Deliberate exclusions and corrections

No advanced filter-tree compiler, stepper, upload gallery, virtualized spreadsheet,
Gantt or calendar is included. The source review found real defects and integration
risks in those areas; none is represented here as a validated ready-made feature.
The included form links labels/help/errors, scopes IDs per instance, validates
before callback dispatch, prevents duplicate pending submission and treats rejection
separately from confirmed callback completion. The plain table keeps stable IDs,
actual matching/order, tie order and semantic sort state. State samples are labelled
as previews; the demo's save is local memory, not remote persistence.

Styles preserve selected anatomy/density without copying the full style catalogue.
Custom tokens/base rules are wrapper-scoped; Tailwind theme/utilities are imported
intentionally without preflight. Existing project theme/primitive ownership still
wins. Do not import the demo page or its reset into a host project.

## Validation scope

Native typecheck, Vitest behavior, Vite production build, dependency audit and owned
local browser observations are distinct evidence. Behavioral tests cover local
callbacks and DOM semantics, not backend writes, real assistive technology or model
efficacy. Browser evidence covers only the recorded viewports/actions and cannot
certify every contrast, accessibility, performance or modified-consumer claim.
Current validation results are recorded in VERIFICATION.md after completion.

## Manual update and rollback

1. Select the needed upstream changes; compare pinned source/rights and local fixes.
2. Keep project/framework compatibility and lockfile changes explicit; lifecycle
   scripts stay disabled during dependency installation.
3. Re-run native typecheck, behavior tests, build and relevant rendered scenarios;
   inspect actual results rather than update expected snapshots to manufacture green.
4. Inspect the source diff, notices and provenance. Install/publish through the
   authoritative skills repository only after those checks; verify remote equality.

No automatic updater. Remove the source/pointer for rollback only after inspecting
consumer imports; copied project components remain independently owned and must not
be silently deleted or downgraded. No runtime package is loaded by skill discovery.
