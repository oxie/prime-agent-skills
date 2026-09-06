# Designing useful alternatives

## One question, distinct answers

Name the decision before drafting: hierarchy, layout, density, emphasis, or another
specific visual question. Keep the user's original as the first initial position.
Three new alternatives should explore materially different structures, not only
padding or color changes. Later refinement usually needs only two or three options.

Write `plan.json` first:

```json
{
  "question": "How much should the hero explain before the first scroll?",
  "positions": [
    {"name": "original"},
    {"name": "product first", "angle": "demonstration leads", "cost": "less space for explanation"},
    {"name": "editorial", "angle": "type and narrative", "cost": "less immediate product detail"},
    {"name": "compact", "angle": "short hierarchy", "cost": "less supporting context"}
  ]
}
```

Use real product copy and assets. Do not fabricate testimonials, customer counts,
logos, revenue, or other proof. Do not invent factual claims to fill a layout.

## Respect the project, not a universal house style

Read its tokens, components, imports, neighboring sections, copy, and constraints.
Use those foundations. In an empty project settle a simple shared baseline before
comparing layouts. The user's brief takes priority over preferences about italic
headings, eyebrow labels, dashes, accent colors, or a particular visual trend.
Keep accessibility, honest contrast, keyboard use, and responsive behavior intact.
Honor `prefers-reduced-motion`; use motion only when it helps the task.

## Complete replacement contract

Each variant must work when copied over the target by itself: compatible exports,
props, client/server boundaries, and only dependencies/assets already available in
the project. Do not change shared tokens, stylesheets, or imports to make just one
variant work. Keep variant-specific styles inside the one target file when its
framework supports that; otherwise choose a narrower target or explain the limit.
Do not smuggle multi-file redesigns into a single-file comparison.

Add `data-variate-section="<set>"` to the markup root in new variants, never the
initial baseline. Style-only files have no root marker. Cleanup strips the kept
markup marker, not CSS selectors containing its name.

## Review and refine

Run lint plus the native project build/typecheck/tests. Inspect each rendered option,
console failures, keyboard use, and around 390px width. A grep-based lint is not a
browser test. State if browser verification is unavailable.

Present each position's intent and cost; recommend one with a reason. Preserve newer
hand edits and check queued snapshot hashes before refining. Narrow only after a
choice is explicit. Passed-over variants remain in `.dropped/` until the set ends;
reuse them only if the user asks to revisit that direction.

For a merge, name which parts come from which actual variants and create a new complete
variant. Small follow-up edits after the round closes can be ordinary edits; while it
is open, use a new variant and switch, never edit the live target directly.
