# Print and telemetry: two optional directions

Use when the brief calls for a printed register, industrial editorial page or
instrument-like readout. Hallmark still owns hierarchy, usability and the existing
brand. These are art choices, not bans on rounded corners, color, imagery or other
layouts. Do not turn a requested component treatment into a whole-site redesign.

## Choose what the surface means

| Direction | Composition and type | Surface and detail | Good reason to choose it |
|---|---|---|---|
| Print register | A substantial sans heading against a quiet margin; smaller captions align to visible rules. An occasional serif can provide editorial contrast. | The host's paper/ink roles; a flat accent or approved image crop anchors a selected fact. | A programme, archive or publication should feel edited and stable. |
| Telemetry readout | A clear task heading, then compact labeled values with aligned units. Mono or tabular figures support comparison; body copy remains comfortable to read. | The host's dark surface and readable foreground, with restrained technical framing. State colors retain their real meanings. | Users must inspect actual measurements, logs or system state. |

Print is not simply telemetry with a light background. It gives more space to the
headline and editorial pauses. Telemetry gives more space to comparison and status
explanation. A dark archive can still use print composition; a light instrument can
still use telemetry grammar. Choose according to content and the approved system,
not a mandatory theme switch or a military-fiction overlay.

**Macro/micro hierarchy:** make a title or important verified value the distant
reading anchor. Cluster its source, unit and explanatory caption nearby at a clearly
smaller but readable scale. Leave a deliberate quiet zone before the next group.
Micro means supporting role, not tiny text. Use host type tokens and test the actual
font, accents, long labels and text zoom. Tight display tracking/leading is a local
optical choice; do not apply it to navigation, paragraphs or every numeral.

## Give the notation a real job

- Label values with units, source and update time when those facts exist. Show
  unknown, stale, pending and confirmed as different states; a dash must not silently
  mean zero. Do not invent irregular numbers, revision IDs or timestamps for texture.
- Use a semantic table for row/column comparison; a `<dl>` for name/value groups;
  `<data>` only when a machine-readable value is useful; `<time>` for a known date.
  `<samp>` is sample program output, `<kbd>` is user input, and `<output>` is an actual
  calculation or user-action result, not a styling hook for arbitrary text.
- Keep actions as real links, buttons and form controls with their existing behavior.
  A bracket, crosshair or status lamp is not an accessible name. Give state a text
  label, not just a color. Decorative markers should not enter the reading order.
- Do not add fake terminal commands, legal marks, barcodes or live-looking counters
  to imply authority. Label demonstration data as examples. A static fixture is not
  a live telemetry client, and visual polish is not evidence of measurement accuracy.

## Original one-pixel register recipe

Use the original scoped [craft.css](../../cinematic-ui/assets/taste-craft/craft.css)
recipe, not a second grid implementation. Its `.cui-gap-grid` parent supplies the
rule color through `gap: 1px`; each `.cui-gap-grid__cell` paints an opaque surface.
The last odd cell spans the final row, and the grid becomes one column below 42rem.
Source order stays visual order; no dense backfill or clipping is needed.

Map `--cui-tc-line`, `--cui-tc-core`, `--cui-tc-ink` and `--cui-tc-cell-space` to
existing host roles on the chosen component. Do not copy fixture palettes globally.
The following original integration example uses that reusable CSS. Its labels
describe this illustration, not product or customer facts.

```html
<p>Layout example — these labels describe this static illustration.</p>
<dl class="cui-gap-grid editorial-register">
  <div class="cui-gap-grid__cell"><dt>Medium</dt><dd>HTML and CSS</dd></div>
  <div class="cui-gap-grid__cell"><dt>Behavior</dt><dd>Static</dd></div>
  <div class="cui-gap-grid__cell"><dt>Data connection</dt><dd>None</dd></div>
</dl>
```

```css
/* Replace the right-hand aliases with the host's actual existing tokens. */
.editorial-register {
  --cui-tc-line: var(--border-strong);
  --cui-tc-core: var(--surface-solid);
  --cui-tc-ink: var(--text-primary);
  --cui-tc-cell-space: var(--space-panel);
  margin: 0;
  font-family: inherit;
}
.editorial-register dt { font-weight: 600; }
.editorial-register dd { margin: .5em 0 0; }
```

The library's forced-colors fallback uses actual borders and system colors rather
than relying on background gaps. It does not promise identical one-pixel geometry
in that mode. For a table, keep its header associations instead of converting it
to this `<dl>`. Leave interactive descendants' focus rings unobstructed and retain
the host's control styles.

See the [local craft fixture](../../cinematic-ui/assets/taste-craft/index.html)
for light print and dark telemetry treatments. It is an original surface study with
local demonstration controls, not an upstream product screenshot or a live service.
Reuse the selected CSS recipe; the fixture's demo styling and control script are not
required by a static register.

## Texture and verification

A static scanline or dot pattern can suggest a printed or emissive surface. Keep it
local, decorative and away from small text; removing it should not change meaning.
A dot overlay is **not image-dependent halftoning or error-diffusion dithering**.
No such image transformation is supplied here. Neither grain nor CRT motion is
required, and a clean opaque surface is a complete direction.

When using the recipe, inspect odd/even item counts, long values/URLs, narrow reflow,
text resize, source/focus order and forced colors in the host. Check text/background
and state pairs using actual tokens and rendered content. Source checks cannot prove
these visual results. Keep real data and control behavior unchanged; report any
unavailable browser or live-data checks as not tested.
