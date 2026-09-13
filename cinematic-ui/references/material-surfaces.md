# Material surfaces: contact, control and frame

These three optional CSS recipes add object depth and engineered boundaries.
They are not a page theme, design system or app starter. Keep the actual brief,
project tokens, native components, content and accessibility requirements in
charge. Choose one material relationship for the component; a flat fill remains
valid. Hallmark still owns usability and system fit.

[Reusable CSS](../assets/material-surfaces/surfaces.css) ·
[Standalone light/dark fixture](../assets/material-surfaces/index.html) ·
[Native tests](../tests/material-surfaces.mjs)

## What the code preserves

| Recipe | Mechanism | Useful task | Main tradeoff |
|---|---|---|---|
| `cui-material--contact` | Five neutral shadows widen from `1px` to `24px` offset/blur, with negative spread at half each offset and 6% black per layer | A reading sheet, specimen card or bounded work note with slight lift | Dense lists do not need five shadows on every row; a border alone may be clearer |
| `cui-material--control` | Opaque vertical gradient, bright upper inset edge, dark lower bevel and compact outer shadows; real `aria-pressed="true"` reverses the gradient and replaces lift with inset depth | A native toggle with a stable label and actual application state | Depth cannot be the only state cue; preserve native semantics and a textual state description |
| `cui-material--frame` | One-pixel masked 145-degree gradient edge plus two aligned vertical rails that overshoot 8px, finished by four 10px perpendicular bracket marks | An inspection checklist, diagnostic section or technical record | Brackets are decoration, not controls, live readings or a semantic data grid |

The contact stack keeps the useful medium-scale Beautiful Shadows progression,
not its huge hero shadow. The control translates the skeuomorphic light direction
and reversed pressed depth without texture, embossed text or ornamental motion.
A solid readable control border is retained instead of a faint reflective wrapper;
the inset highlight provides the reflective edge. The frame retains the masked
edge and rail logic without adopting a full dark shell, moving scan line or neon
atmosphere. All three stay still, including when reduced motion changes.

These object-level recipes complement [quiet surfaces](quiet-surfaces.md).
That existing owner already supplies Auteur mesh, grain and ledger grounds; no
new grain or duplicate ambient background is included here. Do not stack both
libraries' pseudo-elements on the same wrapper. If a quiet ground and a material
object both have a useful role, use separate nested wrappers and inspect the
combined hierarchy. Avoid layering effects merely because they are available.

## Copy one library, preserve the host

Copy **only `surfaces.css`** through the host's normal CSS pipeline. There are no
font, image, package or remote dependencies. Do not copy `demo.css` or `demo.mjs`
into a production component: they are only the comparison fixture's page styling
and local pin interaction. No server or browser starts when this guide is loaded.

Use the base class plus one recipe. Keep layout and type on host-owned classes:

```html
<article class="project-note cui-material cui-material--contact">
  <h2>Transport notes</h2>
  <p>Actual project content stays in normal flow.</p>
</article>

<button class="project-toggle cui-material cui-material--control"
        type="button" aria-pressed="false" aria-describedby="pin-state">
  Pin the installation cue sheet
</button>
<p id="pin-state">Not pinned.</p>

<section class="project-checklist cui-material cui-material--frame"
         aria-labelledby="check-title">
  <h2 id="check-title">Installation checks</h2>
  <p>Real checks and links go here. The frame adds no semantics.</p>
</section>
```

The button example needs the host's real toggle handler. Keep its label stable and
update `aria-pressed` and the state description from real application state.
Do not copy these attributes onto a link, a radio group, a tab or a momentary
submit action. Do not replace submission, authorization, persistence, validation
or error handling with the demo handler. No visual recipe implements a backend.

The library does not set page widths, panel padding, heading styles, link colors
or global resets. It does set the opted-in surface's position, isolation, opaque
fill, foreground, border and radius. The control also inherits its host font,
wraps long labels and has a 44px minimum block size. Native button appearance,
keyboard activation and disabled behavior remain; no custom key handler is used.

Namespacing is not Shadow DOM isolation. Host rules can override these recipes.
Preserve existing spacing, typography, focus treatment and token ownership. The
library consumes `--cui-ms-*` properties using fallback values; it declares none.
Set overrides on the actual component or an explicit local theme wrapper, not
`:root` unless the host already owns that decision. For example:

```css
.project-checklist {
  --cui-ms-ink: var(--text-primary);
  --cui-ms-fill: var(--surface-solid);
  --cui-ms-line: var(--border-strong);
  --cui-ms-focus: var(--focus-ring);
  --cui-ms-rail: var(--border-subtle);
  --cui-ms-edge: var(--border-highlight);
  padding: 1.5rem;
}
```

Those host token names are examples, not tokens to introduce automatically. Map
only to existing defined colors. Use **opaque** fill and top/bottom gradient
stops, and measure the actual pairs. If the host has no matching token, retain a
fallback or make a scoped, reviewed choice. A transparent fill breaks the known
reading plane. Override all related colors when switching theme; changing the
ink alone does not retint the control gradient.

### Tuning the material

| Local property / dimension | Light fallback | Tuning guidance |
|---|---|---|
| `--cui-ms-ink`, `--cui-ms-fill` | `#242628`, `#f5f5f3` | Existing opaque foreground/surface pair first; ordinary text generally needs 4.5:1 |
| `--cui-ms-top`, `--cui-ms-bottom` | `#ffffff`, `#dedfdd` | Keep the two opaque stops close; test text across the gradient in both directions |
| `--cui-ms-line` | `#727574` | Keep a functional control boundary; do not substitute a faint decorative alpha |
| `--cui-ms-highlight` | white at 80% | A one-pixel inset edge, not a whole-face gloss; dark fixture reduces it to 22% |
| `--cui-ms-focus` | `#174ba6` | Solid 3px outline, 4px offset; inspect against both the control and its surroundings |
| `--cui-ms-radius`, `--cui-ms-frame-radius` | `12px`, `2px` | Use the host radius. About 8–16px suits these controls; keep rail-frame corners nearly square (0–4px) |
| `--cui-ms-rail`, `--cui-ms-edge` | `#858987`, `#b6b9b6` | Quieter than meaningful text. They do not carry state or data |
| Contact shadow | five 6% neutral layers | Scale down or drop the widest layer for dense contexts. Avoid a new colored glow |
| Frame edge / rail overshoot | 1px / 8px | Keep the edge 1px at this scale. About 4–12px overshoot is useful if surrounding spacing can afford it |

The latter dimensions are literal recipe CSS, not an invented configuration API.
For intentional local changes, edit the relevant scoped rule in the host copy and
recheck it. In the fixture the explicit dark wrapper sets ink `#f1f3f1`, fill and
bottom `#202423`, top `#343937`, line `#919991` and focus `#a9caff`; it does not
follow the OS theme or retheme neutral host content. These are example presets,
not a required palette or calibrated material model.

## Layer and fallback contracts

- Use a fresh wrapper if the component already owns `::before` or `::after`.
  Frame pseudo-elements are empty and noninteractive. Their `z-index: -1` in the
  local isolated stacking context places them above the opaque base and below
  ordinary content. Avoid custom negative-z foreground children.
- Only the edge pseudo-element is masked. Its content box is removed by standard
  `mask-composite: exclude` or prefixed `xor`; it never masks the section's text.
  A feature query limits enhancement. The ordinary solid border stays as the
  unsupported-mask fallback, with the highlight painted over it rather than a
  second spaced border. Unsupported gradients leave the opaque base.
- Rails use the same border-edge coordinates as the panel, not viewport offsets.
  Leave at least the overshoot distance plus normal host spacing around it. Rails
  add no layout width. Do not clip the whole surface to hide layout mistakes.
- No recipe uses overflow clipping, blend modes, filters, animation or a fixed
  viewport layer. The control's focus outline sits outside its decoration.
  Host ancestors can still clip it; inspect the actual container chain.
- Forced colors removes frame pseudo-elements and shadows. Surfaces use `Canvas`
  and `CanvasText`; pressed controls use `Highlight` and `HighlightText`, with
  an external system-color focus outline. No `forced-color-adjust: none` is used.
  Do not force decorative colors back into this fallback.
- CSS unavailable: semantic content and native controls remain. Demo JavaScript
  unavailable: pin buttons stay disabled with an explicit explanation. Successful
  demo setup enables them and shows “Not pinned”; clicks only change local DOM
  state. No file, preference, account or network operation occurs.

## Verification: source evidence is not rendering evidence

From the `cinematic-ui/` root, run this dependency-free native check:

```text
node --test tests/material-surfaces.mjs
```

It reads the actual CSS, checks bounded selectors and token consumption, asserts
shadow/gradient/mask/rail mechanisms, checks forced-colors structure, samples the
actual opaque gradient stop colors for text/boundary contrast, and exercises the
actual demo handler with a small DOM stub. Negative cases reject global selector
leakage, clipping and poor foreground contrast. The fixture's long content and
neutral host strip are also checked structurally. This is not a full CSS parser,
computed cascade test, browser keyboard check or accessibility certificate.

With an authorized local browser workflow, check separately:

1. Desktop and 320px widths, 200% text resize, long labels and long accession IDs.
   Check no horizontal overflow, clipped outline or rail collision. Do not add
   overflow hiding to make this pass.
2. Tab and Shift+Tab through links, host field and both enabled pin buttons.
   Activate pins with Enter and Space. Verify `aria-pressed`, stable label and
   the visible state description agree. Type in the neutral host field.
3. Light and dark gradient faces, pressed and disabled states, top/bottom bevels,
   focus against adjacent host backgrounds, solid fallback, and forced colors.
   Inspect contrast with actual rendered backgrounds, not only default tokens.
4. Disable masks and then the demo script. Confirm the first leaves a solid frame
   boundary and the second leaves truthful disabled controls with readable notes.
   Reduced motion on load or changed later must stay still.
5. Compare neutral host computed styles with library CSS disabled and enabled.
   Inspect screenshots for actual edge alignment and hierarchy. Check unexpected
   network requests, console errors and the real host's application behavior.

This child-authored fixture was source-tested only; browser checks belong to the
integration handoff. No browser, server, performance benchmark, screen-reader
session or target-host integration result is implied. Still shadows and gradients
have paint cost; measure on relevant devices instead of claiming zero cost.

## Selected source relationship

Selected reference mechanisms come from `MengTo/Skills`, commit
`321c769739b823de5eb94eb3a52aa1974fe783a2`, specifically these source documents:

- `agent-skills/web-design/beautiful-shadows/SKILL.md`: medium neutral layered
  falloff; preserved as actual CSS rather than a Tailwind-only string.
- `agent-skills/web-design/skeuomorphic-ui/SKILL.md`: directional face, inset
  highlight and reversed pressed depth. Motion, microtexture and embossing omitted.
- `agent-skills/web-design/css-border-gradient/SKILL.md`: one-pixel masked edge,
  inherited radius and noninteractive decoration. Opaque and unsupported fallbacks
  added; border gradient is not the focus indicator.
- `agent-skills/web-design/framed-tech-dark-border-gradient/SKILL.md`: aligned
  overshooting rails and small corner markers, reduced to one semantic section.
- `agent-skills/web-design/high-contrast-skeuomorphic-clean/SKILL.md`: restrained
  dark molded surface and clear separation, not a mandatory whole-site system.

The namespace, host-token contract, native control demo, light/dark fixture,
forced-colors fallback, tests and integration guidance are adaptation-authored.
No upstream executable script, demo asset, external font, texture, app behavior or
agent policy is imported. See the skill's integration provenance and retained
license notices for the parent-owned source/license record.
