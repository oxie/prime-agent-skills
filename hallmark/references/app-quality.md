# App, mobile and usability checks

Keep the selected workflow's scope and verification limits. Use relevant sections,
not a whole-product gate or full accessibility certification.

## States and decisions

A static list needs no invented loading/error path. For data-backed views:

| State | Useful content, only when supported |
|---|---|
| Genuinely empty / first use | Explain what is absent; offer the real first action |
| Filters match nothing | Explain the active constraint; let the user clear/change filters |
| Permission denied | Explain access limits; use an existing request route; protect restricted data |
| Failure | Say what failed; offer real recovery; preserve entered work |
| Loading | Name the pending operation; do not claim empty/success yet |

Choose columns from the reader's decision; make deciding fields easy to scan.
Preserve headers, relationships and real actions.
A chart answers a named question with units, period and readable labels; a
sentence may be clearer. Deltas need a real, named comparison period. Label
prototype values visibly. Equal cards and familiar shells can fit the task.

## Controls: verify the outcome

Exercise the changed control, not just the presence of an `href` or handler.
Check changed rows after filtering, reachable menu actions, link destinations
and actual form validation/submission results. Label unwired prototypes.
Use native links/buttons and their normal keys (Enter for links, Enter/Space for
buttons). Composite widgets may use arrow keys and roving tabindex; `tabindex="-1"`
is valid there and for programmatic focus targets. Check logical reading/focus
order, visible focus, accessible names, label associations and dialog focus return.
Provide keyboard and touch equivalents for hover reveals or dragging. Communicate
errors/status in text, not color alone; check appropriate status announcements
when changes need to reach assistive technology without moving focus.

## Reflow and mobile reachability

Choose breakpoints where content stops working, not from a required device list.
Fluid layouts may need no new breakpoint, smaller type, single-column collapse
or replacement navigation.
Test long labels/values and flex/grid children that cannot shrink or wrap.

Contain necessary table/code horizontal scrolling locally, with discoverable,
keyboard-operable access to all content; preserve table semantics and code meaning.
Wrap when meaning allows; do not clip the root or delete columns to hide overflow.
Intentional image cropping differs from lost text/controls.

For existing fixed/sticky navigation, reserve its occupied space and applicable
safe-area insets. Check the final row, submit control and focused target remain
reachable. Test an on-screen keyboard where available; desktop resizing does not
prove keyboard coverage. Check full-height sections
as browser chrome changes; content sizing or dynamic viewport units may help.
New fixed nav is not required.

## Accessibility measurements: avoid false passes

- WCAG 2.2 text contrast (1.4.3): at least 4.5:1 for normal text; 3:1 for large
  text, at least 18pt regular (24 CSS px) or 14pt bold (about 18.67 CSS px).
  Normal-weight 18px is not large. Compare the **unrounded** ratio; round only its
  display. A ratio of 4.499 fails 4.5:1. Check actual backgrounds, including the
  worst area behind text over gradients/images and relevant rendered states.
- Non-text contrast (1.4.11) concerns visual information needed to identify
  controls/states and understand graphics, generally 3:1 against adjacent colors.
  It does not demand every decorative border or inactive control meet that ratio.
  Use labels/patterns rather than color alone; assess the criterion's exceptions,
  not a blanket rule that every neighboring chart segment must contrast 3:1.
- Target size: WCAG 2.2 AA (2.5.8) is 24 by 24 CSS px, with spacing and other
  exceptions (including inline, equivalent, user-agent-controlled and essential
  targets). 44 by 44 CSS px is the enhanced AAA criterion (2.5.5), with its own
  exceptions, and a useful touch goal, not a universal AA minimum. Inspect actual
  hit areas and spacing, not icon size alone.
- Test text resizing to 200% without lost content/function (1.4.4), separately
  from reflow at 320 CSS px width (1.4.10, including its two-dimensional-content
  exceptions). Pixel font units alone do not prove failure. Exercise reduced
  motion for existing animation; preserve a usable static/reduced alternative
  where needed. Do not add motion just to test it.

Record state, viewport/input, measurement and result per
[verification.md](verification.md). Unavailable browser/device/assistive technology
checks are **not tested**; source review is not observed interaction.

Adapted from Miqdad Badjuber's Anti-slop UI/Human/Layoutmobile, with corrections.
See [provenance](../UPSTREAM.md) for source and license records.
