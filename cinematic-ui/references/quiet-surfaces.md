# Quiet surfaces: three reusable static recipes

Use a quiet ground when it supports the actual subject, brand and reading task.
A flat fill is equally valid. Existing components, colors, content, accessibility
requirements and permissions take priority. These are independent choices, not
three mandatory layers or a page-wide theme.

[Library CSS](../assets/quiet-surfaces/quiet-surfaces.css) ·
[Local grain SVG](../assets/quiet-surfaces/grain.svg) ·
[Standalone demo](../assets/quiet-surfaces/index.html)

## Choose a material relationship

| Recipe | What the code actually draws | Useful direction | Edit first |
|---|---|---|---|
| `cui-quiet--mesh` | Two broad same-hue radial fields anchored near opposite corners, at 7% and 5% alpha | A daylight editorial opening or a calm specification section: the space feels gently lit without a glowing object | Move the field origins to support the actual crop and text placement; preserve a broad, low-contrast falloff |
| `cui-quiet--grain` | A repeating 128 × 128 local SVG containing 112 fixed black/white dots, at low layer opacity | Paper-like tooth behind a letter, craft account or reading section | Adjust the layer opacity against the real type size; drop it if tile repetition becomes noticeable |
| `cui-quiet--ledger` | Horizontal 1px rules every 40px, with a stronger rule every 200px | A quiet atlas, research log or instrument record | Choose spacing that leaves the text hierarchy in charge; these lines are not data or a semantic table |

The mesh and ledger presets use green-hue variations, not a universal brand
palette. Grain is neutral. Use actual project colors and materials rather than
adopting these presets as an identity. Check that the strongest decorative detail
remains less prominent than the quietest meaningful label. That is a composition
judgment, not a mathematical contrast guarantee or a fixed effect-count rule.

## Copy only the library and its local asset

Keep these two files together so the stylesheet-relative URL resolves:

```text
quiet-surfaces/
  quiet-surfaces.css
  grain.svg
```

Load `quiet-surfaces.css` through the project's normal CSS pipeline, preserving
or correctly rewriting `url("./grain.svg")`. The URL resolves relative to the
stylesheet, not the HTML page. The SVG has no script, filters, linked resources,
fonts or animation. It is a small authored vector tile, not a claim that a live
noise filter was pre-rasterized. No package or JavaScript is required.

Do not copy `demo.css` into a production host. It contains the standalone page's
layout, typography, controls and body styling. Those are not part of the library.

Opt in with the base class and **one** recipe class:

```html
<section class="cui-quiet cui-quiet--mesh" aria-labelledby="reading-title">
  <h2 id="reading-title">Materials and maintenance</h2>
  <p>Use the actual project content here.</p>
</section>
```

Replace `cui-quiet--mesh` with `cui-quiet--grain` or `cui-quiet--ledger`.
Add `cui-quiet--dark` for the explicit dark preset. It does not follow the OS theme
or change other sections. Do not combine recipe classes on the same wrapper;
they share `::before`, and the cascade would select or mix declarations rather
than produce a designed combination. The demo shows six independent wrappers
only to compare each recipe in both presets.

Add spacing and typography with the host component's existing classes. The
library does not set layout widths, padding, fonts, links, inputs or buttons.
It does set the opted-in wrapper's position, stacking context, foreground,
opaque background and border. Avoid placing it directly on controls.

### Keep the host in charge

No library rule targets `body`, `:root`, unclassed elements or global custom
properties. No host token is declared or overwritten. Namespacing reduces
accidental selector reach; this is **not** Shadow DOM or cascade isolation.
Host resets, inherited styles and more-specific rules can still affect it.
`isolation: isolate` creates only a local stacking context.

The empty `::before` layer is absolute within the wrapper, noninteractive and
at `z-index: -1`. In this stacking context it paints above the wrapper's opaque
background and below ordinary foreground content. It has no text or focus stop.
No opacity, filter or blend mode is applied to text or controls. There is no
fixed viewport layer, overflow clipping, forced compositor hint or animation.
Avoid custom negative-z foreground children. Check unusual nested stacking
contexts in the actual host.

If a component already uses `::before`, put the recipe on a fresh outer wrapper
instead of replacing its pseudo-element. Do not move or recreate app controls,
change form behavior or add `aria-hidden` to the content wrapper. An alternate
explicit SVG decoration must itself be `aria-hidden="true"`, nonfocusable,
noninteractive and behind the content; meaningful images need their real semantics.

Reuse existing tokens in project-local overrides loaded after the library. For
example, the base can map to the host's already-defined colors:

```css
.project-reading-surface.cui-quiet {
  color: var(--text-primary);
  background-color: var(--surface-solid);
  border-color: var(--border-subtle);
}
```

These token names are examples, not new defaults to add. Use an **opaque** host
surface. Also replace the recipe's gradient color stops with low-alpha versions
of the actual brand hue; changing only the base does not retint the fixed stops.
Check specificity when overriding the dark preset. Keep the strongest light and
dark stops close to the base, and verify the rendered result rather than treating
7% alpha as a contrast guarantee. Put interactive groups on the host's existing
opaque panels. Give inputs their normal opaque fill, useful boundary, visible
focus and labels. The demo's separate panel CSS illustrates that responsibility.

## Failure and accessibility behavior

- Missing or blocked `grain.svg`: grain disappears; the opaque surface, border,
  content and controls remain. The standalone SVG file can be inspected locally,
  but it is not needed for meaning. Do not bypass asset/CSP policy with a remote
  URL or data URI. Use the solid fill if the allowed delivery path blocks SVG.
- Unsupported gradients or disabled decoration: the opaque base is the fallback.
  No content waits for an effect to initialize.
- Reduced motion, on load or changed while reading: identical still output.
  There are no transitions, animation loops, SVG animations or timers to stop.
- Forced colors: library decoration is removed; the wrapper uses `Canvas`,
  `CanvasText` and a visible border. Preserve host controls' system text, links,
  boundaries and focus. Do not use `forced-color-adjust: none` to retain texture.
- Test actual text and control contrast over the brightest/darkest parts, as well
  as solid fallback and focus states. A high-contrast base alone does not prove
  textured foreground pairs pass. Ordinary text generally needs 4.5:1; relevant
  large text and control boundaries have their applicable 3:1 requirements.
  These recipes do not certify accessibility or every host integration.

## Standalone fixture and verification handoff

`index.html` loads the actual library and the separate `demo.css`. It uses normal
HTML landmarks, headings, local anchor links, wrapping long copy and labelled
inputs. Every recipe has an explicit light and dark example. Input groups sit
on opaque panels. The neutral comparison is outside every `cui-quiet` wrapper.
No input submits, saves or implements a backend; typing is only a local UI check.

Only when a local preview is authorized, from the `cinematic-ui/` skill root run:

```text
python3 -m http.server --bind 127.0.0.1 8765
```

Open `http://127.0.0.1:8765/assets/quiet-surfaces/` with the project's approved
local browser workflow. This fixture requires no framework. Keep the temporary
server handle and stop it when finished. Do not start a service merely by loading
this reference.

Check the real host as well as this fixture:

- 320px and desktop widths, long heading/link wrapping, 200% text resize and no
  horizontal overflow or clipped focus. Do not hide overflow to mask failures.
- Tab/Shift+Tab, visible focus, anchor activation and typing in light, dark and
  unwrapped neutral controls. Compare neutral computed styles with library CSS
  disabled to detect unintended reach, not merely the presence of a namespace.
- Forced colors removes only decoration. Reduced motion is still. A missing
  grain asset leaves useful content and opaque controls. Verify no unexpected
  remote requests, scripts, console errors or changes to the host's app behavior.
- Contrast across rendered fields, tile visibility at actual scale and whether
  the decoration competes with captions. Check with the real colors and content.

Static does not mean zero cost. SVG decoding/rasterization, gradient painting,
large surface area and repaint on layout/resize still consume resources. Measure
on relevant devices and viewports; do not infer performance from package count.
Check the installed fixture and each real host with their actual tools. Source
inspection, browser observations and device measurements are separate evidence;
one does not certify the others.

## Source and scope

Selected ideas and mesh/ledger recipe structure come from
`agiwhitelist/auteur` 1.3.1, commit
`9bca227df9877e60dc45d49783c8cbd885eccd9b`,
`reference/ambient-backgrounds.md` (static mesh, grain, ledger and foreground
restraint). The local wrapper architecture, bounded filter-free dot SVG,
light/dark presets, forced-colors treatment and standalone host-control fixture
are adaptation-authored. See [AUTEUR_SOURCES.md](../AUTEUR_SOURCES.md) for the
source mapping and retained license notice.

The upstream fixed viewport wiring, data-URI noise filter, animated contour,
ink, dust, haze, engines, scripts, provider tools and mandatory taste rules are
not included. These static recipes remain under Cinematic UI; they do not add a
new UI owner or runtime dependency.
