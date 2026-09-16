# App, mobile and usability checks

Keep scope/evidence limits; use relevant sections, not a whole-product gate or full
accessibility certification.

## States

A static list needs no invented loading/error path. For data-backed views:

| State | Content, only when supported |
|---|---|
| Genuinely empty / first use | Explain absence; offer real first action |
| Filters match nothing | Explain constraint; allow clearing/changing filters |
| Permission denied | Explain limits; use existing request route; protect restricted data |
| Failure | Explain failure; real recovery; keep entered work |
| Loading | Name pending work; do not claim empty/success |

Choose columns for the reader's decision; keep deciding fields scannable, headers,
relationships and real actions. Charts need a question, units, period and readable
labels; a sentence may suffice. Deltas need a real, named comparison period. Label
prototype values visibly. Equal cards and familiar shells can fit.

## Verify controls

Exercise changed controls, not just the presence of an `href` or handler. Check
filtered rows, reachable menu actions, destinations and form validation/submission
results. Label unwired prototypes. Use native links/buttons and normal keys (Enter for
links, Enter/Space for buttons). Composite widgets may use arrows and roving tabindex;
`tabindex="-1"` is valid there and for programmatic focus targets. Check logical
reading/focus order, visible focus, accessible names, label associations and dialog
focus return. Provide keyboard/touch equivalents for hover reveals or dragging. Show
errors/status in text, not just color; announce changes to assistive technology when
needed without moving focus.

## Reflow

Use content-driven breakpoints, not device lists. Fluid layouts may need no
breakpoint, smaller type, single-column collapse or replacement navigation. Test long
labels/values and flex/grid children that cannot shrink or wrap. Keep necessary
table/code horizontal scrolling local, discoverable and keyboard-operable; keep all
content, table semantics and code meaning. Wrap when meaning allows; do not clip the
root or delete columns to hide overflow. Intentional image cropping differs from lost
text/controls.

For existing fixed/sticky navigation, reserve its space and safe-area insets. Check
final rows, submit controls and focused targets stay reachable. Test available
on-screen keyboards; desktop resizing does not prove keyboard coverage. Check full-height
sections as browser chrome changes; content sizing/dynamic viewport units may help.
New fixed nav is not required.

### Structural resize round trip

Optional structural-resize example: select an item, enter an unsaved edit and scroll.
Resize compact → intermediate → wide → compact. Preserve selection, navigation, edits,
focus and scroll context; distinguish intentional context changes from accidental
loss. If useful, reveal a detail/inspector pane without stretching reading lines.
Where relevant, do not reset state or replay pending operations/playback. Handle each
edge's inset independently; prefer local adjustments for local obstructions. Not an
executed device test or full-app refactor. See [source](../FWC_SWIFTUI_SOURCES.md).

## Accessibility

- WCAG 2.2 text contrast (1.4.3): ≥4.5:1 normal; ≥3:1 large text: at least
  18pt regular (24 CSS px) or 14pt bold (about 18.67 CSS px).
  Normal-weight 18px is not large. Compare the **unrounded** ratio; round only display.
  4.499 fails 4.5:1. Check actual backgrounds, worst areas over gradients/images
  and relevant rendered states.
- Non-text contrast (1.4.11): generally 3:1 against adjacent colors to identify
  controls/states or convey graphics. Not every decorative border,
  inactive control or neighboring chart segment requires 3:1. Use labels/patterns,
  not color alone; assess the criterion's exceptions.
- Target size: WCAG 2.2 AA (2.5.8): 24 by 24 CSS px, with spacing/other exceptions
  (inline, equivalent, user-agent-controlled, essential). 44 by 44 CSS px is enhanced AAA
  (2.5.5), with its exceptions: a touch goal, not a universal AA minimum.
  Inspect actual hit areas and spacing, not icon size alone.
- Test text resizing to 200% without lost content/function (1.4.4), separately from
  reflow at 320 CSS px width (1.4.10, including two-dimensional-content exceptions).
  Pixel font units alone do not prove failure. Test reduced motion for existing
  animation; keep a usable static/reduced alternative as needed.
  Do not add motion just to test it.

Record state, viewport/input, measurement and result in
[verification.md](verification.md). Unavailable browser/device/assistive technology
checks are **not tested**; source review is not observed interaction.

Adapted from Miqdad Badjuber's Anti-slop UI/Human/Layoutmobile, with corrections. See
[provenance](../UPSTREAM.md) for sources and licenses.
