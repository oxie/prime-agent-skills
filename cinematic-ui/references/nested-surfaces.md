# Nested surfaces: plate, inset control and shared grid

These are three **opt-in** static craft recipes, not a theme or a new design owner.
The brief, host tokens, native components and Hallmark usability review take priority.
Use a plate-in-tray when a bounded note should feel like a physical object; use a
shared-line register when field relationships matter. A plain surface remains valid.
Do not apply a bezel to every card or mix industrial treatments into an unrelated UI.

[Reusable CSS](../assets/taste-craft/craft.css) ·
[Light/dark local examples](../assets/taste-craft/index.html) ·
[Native source tests](../tests/taste-surfaces.mjs)

## Copy the recipe, not the fixture

Copy only `craft.css` into the host's normal CSS pipeline. It has no external
fonts, images, framework, package, reset, viewport layer or motion. `demo.css` is
page styling, and `demo.mjs` is an honest local interaction test, not persistence.
Existing [material surfaces](material-surfaces.md) still own contact shadows,
raised/pressed faces and technical brackets. This addition supplies a different
relationship: an opaque plate nested in a separate tray, not another shadow preset.

```html
<div class="cui-bezel">
  <article class="cui-bezel__core" aria-labelledby="note-title">
    <h2 id="note-title">Actual project note</h2>
    <p>Keep real content, links and controls in normal flow.</p>
  </article>
</div>

<button class="cui-inset-control" type="button">
  <span class="cui-inset-control__label">Actual host action</span>
  <span class="cui-inset-control__arrow" aria-hidden="true">↗</span>
</button>

<dl class="cui-gap-grid">
  <div class="cui-gap-grid__cell"><dt>Field name</dt><dd>Actual value</dd></div>
  <div class="cui-gap-grid__cell"><dt>Another field</dt><dd>Actual value</dd></div>
  <div class="cui-gap-grid__cell"><dt>Final field</dt><dd>Actual value</dd></div>
</dl>
```

The example action needs the host's real handler. Preserve native semantics: one
button for an action, or adapt the scoped CSS to the host's native link for a real
destination. Never nest interactive elements. The inner arrow is decorative, has
no tab stop and does not intercept pointers. Its diagonal shape does not require
motion. Do not apply `aria-pressed` to a submit button or a link. For a real toggle,
keep a stable label and derive pressed state and any description from actual state.

## Geometry and token contract

The library consumes inherited `--cui-tc-*` tokens with opaque light fallbacks. It
declares no token values itself. Map these on a local host wrapper to existing,
defined tokens; do not introduce root globals or copy the demo themes wholesale.

| Property | Fallback | Contract |
|---|---|---|
| `--cui-tc-ink` / `--cui-tc-core` | `#20211e` / `#faf9f4` | Readable normal text and opaque inner surface/control fill |
| `--cui-tc-tray` | `#e4e2da` | Opaque outer tray and decorative arrow fill |
| `--cui-tc-line` | `#66645e` | Shell/core/control boundary and one-pixel grid ground |
| `--cui-tc-focus` | `#9c2820` | External 3px focus outline, 4px offset |
| `--cui-tc-radius` | `24px` | Uniform outer shell radius, a nonnegative length |
| `--cui-tc-border-width` | `1px` | Uniform shell border width, a nonnegative length |
| `--cui-tc-inset` | `6px` | Uniform shell padding, a nonnegative length |
| `--cui-tc-content-space` | `24px` | Inner content padding |
| `--cui-tc-cell-space` | `16px` | Grid field padding |
| `--cui-tc-control-radius` | `28px` | Host control corner radius, not a page-wide radius |

**Total inset = shell border + shell padding.** The core's outer radius is
`max(0px, outer radius - border width - padding)`. Defaults yield `24 - 1 - 6 = 17px`.
The core's own 1px border sits inside that edge and does not add another subtraction
for its outer radius. Its background follows that native border geometry.

Use matching uniform length units or CSS-compatible lengths; do not supply `%`,
elliptical radii, asymmetric padding/borders, extra margins between shell and core,
or overrides that break the equation. At very small dimensions CSS may normalize
radii; inspect actual rendered corners. The numeric source check is not a renderer.
Neither wrapper clips content or focus. Host ancestors can still clip: inspect the
whole container chain, particularly menus and external focus outlines.

Use opaque colors for `core` and `tray`, and override ink, line and focus together
when adapting to dark mode. The fixture's dark treatment uses `#e8f0e9` ink,
`#171d1a` core, `#29322c` tray, `#97a89b` line and `#b8e88b` focus. Those are example
values, not a required palette. Measure the actual host pairs and all states.

## Shared-line register and incomplete rows

The grid is two `minmax(0, 1fr)` columns with exactly `gap: 1px`, `padding: 1px` and a
line-colored parent. Opaque cells reveal that ground only at the divisions. The
last odd child spans `1 / -1`: one, three or five items do not leave a giant empty
line-colored block. It is a deliberate full-width final field, not a synthetic
record or invisible filler. Two/four/six items remain paired. An actually empty
grid is hidden with `:empty`; remove stray text when rendering an empty list.
At `42rem` viewport width and below, it becomes one column and resets the final span.

All direct children must be `.cui-gap-grid__cell`. No `dense` auto-flow, CSS order,
absolute placement or reverse layout changes reading/focus order. If the actual
host needs three columns, an embedded-container breakpoint or hidden fields,
adapt and test the corresponding incomplete-row logic; changing only the column
count invalidates this two-column contract. Use a semantic table for genuinely
tabular comparisons instead of turning data into arbitrary cards.

Forced colors abandons the background-gap trick: it uses `Canvas`/`CanvasText`, an
actual outer grid border and actual borders on each cell. Adjacent lines can be
thicker in this fallback; legible groups matter more than a decorative one-pixel
promise. Shell/core/control/arrow retain their solid borders. Focus uses a system
color. No forced-color suppression, clipping, blur, grain or pseudo-layer is needed.

## Two treatments, not two mandatory themes

The fixture pairs warm paper, broad heavy sans headings and open space for its
Swiss-print section. The dark telemetry section uses system monospace and tighter
field rhythm. The bezel stays rounded while the register stays square: the two
objects have different jobs. Neither mode claims to be a live instrument. All
sample labels describe the actual fixture; there are no invented measurements,
customer proof, branded imagery, legal marks or simulated sensor activity.

The unwrapped host field sits outside both theme wrappers and has no craft class.
Use it to compare computed styles with the library enabled and disabled. The
fixture is not a host-theme migration. It intentionally shows both treatments for
comparison; a real project need only choose the one that fits its identity.

## Local behavior and verification

The fixture starts with disabled buttons and an explicit unavailable explanation.
Its module exports `mountCraft(root)` for a Document or Element. Importing it does
not initialize anything. The HTML opts in explicitly. Setup enables only buttons
with a matching status node inside that root. Click changes only the clicked
button's `aria-pressed`, label underline and status text. Nothing is saved or sent.
The label stays stable; native Enter/Space activation belongs to the browser.

Repeated setup on the same root returns the same cleanup. Cleanup removes listeners,
restores initial disabled/pressed/text values and permits remount. Distinct roots
stay independent. Call cleanup before replacing the fixture root. The module is
for this demo, not a general application state framework. No network, storage,
custom keyboard handlers, timers, backend, server or provider is involved.

From `cinematic-ui/`, run:

```text
node --test tests/taste-surfaces.mjs
```

The dependency-free Node tests read the actual CSS/HTML/module. They check scoped
selectors, the radius equation including clamping and host overrides, actual color
pairs, one-pixel grid construction and ragged-row placement, native-control markup,
forced-colors borders, setup/toggle/cleanup and independent roots. Negative controls
mutate real source or behavior to show that geometry, contrast, empty-row strategy,
local state, clipping and selector leaks fail. This is a bounded source/model check,
not a complete CSS parser, computed cascade check or browser proof.

Separately, the integration owner must inspect an authorized browser fixture:

1. Desktop and 320px, 200% text resize, long labels/identifier, narrow embedding.
   Look at corner alignment, field divisions, final row, overflow and focus clearance.
2. Tab/Shift+Tab, native Enter/Space on each enabled button, status/pressed agreement,
   root cleanup/remount, native host typing and real anchors. Compare each root's state.
3. Light/dark, forced colors, reduced motion on load and live preference changes
   (all decoration stays still), CSS unavailable and JavaScript unavailable states.
4. Compare unwrapped host computed styles with `craft.css` on/off; inspect unexpected
   network requests and console errors. Confirm usable solid borders and opaque cores.

No renderer, screen-reader session, performance benchmark, legal originality result
or production-host integration is established by the source tests.

## Selected source relationship

Selected mechanisms: `Leonxlnx/taste-skill@ccbc15639c97057cbfcf32ecebc38ef716e4bb37`,
`skills/soft-skill/SKILL.md` §4.A–B (double bezel and nested decorative arrow), and
`skills/brutalist-skill/SKILL.md` §§2–3, 5, 8 (print/telemetry contrast, type density
and parent-background gap grid). Their mandatory style bans, randomization, motion,
global textures, asset assumptions, fictional data and framework choices are omitted.
The inset equation is corrected for shell border thickness. Ragged-row handling,
scoped tokens, semantics, opaque colors, forced-colors fallback, original markup,
local module and tests are adaptation-authored. No upstream executable code or
third-party visual asset is imported. Parent-owned provenance/license records retain
the source notice; this reference does not replace them.
