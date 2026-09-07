# Bar / column chart

Curated from Cathryn Lavery, diagram-design `references/type-bar.md` at `3b446333f164174a571106673f943c58df282ff8` (MIT). See [retained license](../LICENSE.diagram-design). This Prime adaptation changes prescriptive styling and preserves evidence over layout.

## Choose this type

Comparison of category magnitudes; two-state differences may use dumbbells.

This is a selectively loaded authoring brief, not a new deterministic renderer. Follow [design](design.md); typed Archify contracts remain authoritative in typed mode.

## Evidence to collect

Categories, numeric values, units, source and period; groups/stacks and denominators if relevant.

## Geometry and reading order

Use a zero baseline for length encoding. Horizontal bars suit long labels. For nonnegative values, length = plot_width*v/max; for signed values use one common scale around zero. Keep bar widths consistent and values readable. Stacks add to their printed total.

## Honesty and review

Do not truncate bar axes or silently sort meaningful category order. Preserve ties. Unknown values are not zero-height bars. Dumbbells use two labeled endpoints on one scale; dot positions may use a disclosed nonzero range because length from zero is not the encoding.

Check text/connector clearance at the actual output size. Preserve required facts when splitting a dense view; name omissions and cross-view relations. Static lint does not prove semantic or geometric correctness.
