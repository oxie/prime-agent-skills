# Polar chart

Curated from Cathryn Lavery, diagram-design `references/type-polar.md` at `3b446333f164174a571106673f943c58df282ff8` (MIT). See [retained license](../LICENSE.diagram-design). This Prime adaptation changes prescriptive styling and preserves evidence over layout.

## Choose this type

One quantitative series across cyclic categories whose order matters.

This is a selectively loaded authoring brief, not a new deterministic renderer. Follow [design](design.md); typed Archify contracts remain authoritative in typed mode.

## Evidence to collect

Unique ordered category labels, unit, nonnegative finite values, shared zero-based maximum.

## Geometry and reading order

Space categories at equal angles. Compute r = R*v/max and endpoint (cx+r*cos(theta), cy+r*sin(theta)). Use constant-sized endpoint marks and circular scale rings. At zero, omit the value ray/marker and print 0.

## Honesty and review

Radius, not filled sector area, encodes magnitude. Never add a minimum visible ray, sort cyclic categories by value or coerce unknown to zero. Negative or incompatible values need another chart. Category labels stay upright; allow perimeter padding.

Check text/connector clearance at the actual output size. Preserve required facts when splitting a dense view; name omissions and cross-view relations. Static lint does not prove semantic or geometric correctness.
