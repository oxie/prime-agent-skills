# Timeline

Curated from Cathryn Lavery, diagram-design `references/type-timeline.md` at `3b446333f164174a571106673f943c58df282ff8` (MIT). See [retained license](../LICENSE.diagram-design). This Prime adaptation changes prescriptive styling and preserves evidence over layout.

## Choose this type

Dated events, milestones or incident chronology.

This is a selectively loaded authoring brief, not a new deterministic renderer. Follow [design](design.md); typed Archify contracts remain authoritative in typed mode.

## Evidence to collect

Event timestamps/dates, timezone and precision, interval bounds, planned versus actual status.

## Geometry and reading order

Map time linearly to position: x = left + (t - start) / (end - start) * width. Alternate labels above/below a baseline using leaders that point to the exact event. Use a vertical time axis on narrow pages when clearer.

## Honesty and review

Unequal time gaps need unequal spacing. Label any axis break and do not run an uninterrupted trend across it. Uncertain dates need a range or uncertainty label. A uniformly spaced sequence must say it is ordered, not to scale.

Check text/connector clearance at the actual output size. Preserve required facts when splitting a dense view; name omissions and cross-view relations. Static lint does not prove semantic or geometric correctness.
