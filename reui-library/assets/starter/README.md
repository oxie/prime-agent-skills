# ReUI starter — source-owned React components

A small reusable library with a separate local demo. This is not the full ReUI kit,
a hosted service, a modal framework, or a backend. Adapt and redesign it for the
product rather than copying a screenshot's branding.

## Environment and commands

Tested here on Node22.22.2 with React19, Tailwind4 and BaseUI1.5. The locked demo/test
tools declare Node `^22.22.2 || ^24.15.0 || >=26.0.0`; other versions were not tested. Copy this
starter to an owned project/workspace; keep its node_modules and dist out of the
installed skills checkout. Use its lockfile with your native Node/npm environment:

```text
npm ci --ignore-scripts
npm run typecheck
npm test
npm run build
npm run preview
```

The last command serves the reviewed production output at
http://127.0.0.1:5179 with strict port selection; it stays running until stopped.
Do not point at an unrelated service if the port is busy. No installer, server or
package code runs merely from skill discovery. No remote assets or account needed.

## Reuse source, not the demo

Public exports live in src/index.ts. Import the needed primitives/compositions,
not demo/App.tsx. This private package exposes TypeScript source for compatible
bundlers/workspaces, not a precompiled CommonJS/npm distribution. For an existing
project, review and adapt the relevant files and imports rather than replacing
its package.json, tokens, styles or component folder. Copy source notices too.

Import src/styles.css once and wrap this library's surface in `.reui-kit`.
`data-theme="dark"` on that wrapper selects its dark tokens. The stylesheet imports
Tailwind theme/utilities, not preflight, and scopes its own base/token rules.
Review existing Tailwind integration before including it in a host; do not add a
second reset or silently change global theme policy. Tailwind theme/utilities are
still global; this is not Shadow DOM or a wholly prefixed stylesheet. The source can instead be
adapted to the host's existing design tokens/classes. Test the actual consumer.


Local component CSS is unlayered and can win over regular layered Tailwind utilities
for the properties it sets; className plus tailwind-merge is not a universal style
override. Change the wrapper's --reui-* tokens or use deliberately scoped overriding
CSS, or adapt the source into the host's cascade layers. If sources sit outside the
host's Tailwind scan, include the selected source paths explicitly.

For React Server Component frameworks, import the interactive compositions inside
an explicitly marked client component. This Vite-tested source package is not
verified as a direct Server Component import; it does not create that boundary for you.

## Composition contracts

### ProfileForm

`initialValue: {name, email}` initializes state on mount; it is not a continuously
controlled value. `onSave(value)` returns void or a Promise. Name is required and
must contain non-whitespace content; email must be valid. Inputs have unique IDs
per instance. Invalid input never calls onSave. Pending prevents repeat submission.
A rejection preserves edits and offers retry through the same form; success is
shown only after callback resolution. Values are trimmed before dispatch.

A callback that merely queues a remote write must not resolve as if the write were
confirmed. Connect it to the application's real completion/error/reconciliation
contract. Do not use this local sample as authorization, validation or persistence
for a backend. The demo's callback commits parent-owned memory only; reload resets it.

### ResourceTable

`rows` contains `{id, name, owner, status: 'active' | 'paused'}` records. Supply unique
stable IDs. Search matches local name/owner; Name sorting starts ascending and
can toggle descending while preserving input order for equal names. The caption,
column headers and sort state are semantic table markup. No server querying,
pagination, all-matches selection, editing, virtual window or ARIA grid is implied.
An empty supplied collection differs from a search with no matching rows.

### DataState

`status: 'loading' | 'empty' | 'error'`, optional `onRetry`. Loading uses status,
error uses alert, and retry exists only when a handler is supplied. Choose status
from the actual data owner. Demo state controls are explicitly samples, not an
invented network request or failed API.

### Panel

`title`, `children`, optional `footer`. A labelled section with bounded scrollable
body and separate footer. It is not a modal/drawer: there is no invented focus trap,
backdrop, Escape dismissal or aria-modal. Use the project's real dialog primitive
if those behaviors are required.

## Scope and maintenance

Selected Button/Card/Field/Input/Empty/Table primitive families retain or adapt
actual reviewed ReUI source; new compositions correct the reviewed form semantics.
See source-selection.json, THIRD_PARTY.md and LICENSE for origins and changes.
Advanced filters, upload galleries, steppers, Gantt, virtualized data grids and
external assets are deliberately not included. Known upstream issues are not
presented as verified components here.

Source ownership means updates are manual. Keep local modifications and review
upstream changes before merging. Check direct/transitive dependency advisories,
versions and license requirements in the target environment; never auto-upgrade
from an upstream example command. The pilot does not certify a future consumer's
security, accessibility, performance, contrast or business correctness.
