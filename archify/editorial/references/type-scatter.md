# Scatter plot

Curated from Cathryn Lavery, diagram-design `references/type-scatter.md` at `3b446333f164174a571106673f943c58df282ff8` (MIT). See [retained license](../LICENSE.diagram-design). This Prime adaptation changes prescriptive styling and preserves evidence over layout.

## Choose this type

Two-variable distributions or association; variants: bubble and beeswarm.

This is a selectively loaded authoring brief, not a new deterministic renderer. Follow [design](design.md); typed Archify contracts remain authoritative in typed mode.

## Evidence to collect

Each observation ID, x/y values and units, optional nonnegative size value, missing-data policy.

## Geometry and reading order

Map x/y independently on stated scales. Constant dots carry no third quantity. For bubbles set radius = K*sqrt(value), so area is proportional. For beeswarm preserve exact measured x and displace only on the non-data axis to resolve overlap.

## Honesty and review

A fitted trend needs a stated method, not a decorative diagonal. Correlation is not causation. Do not jitter a measured axis without disclosing it. Bubble zero means no area, and clipping must not hide large marks. Explain exclusions, axis ranges and any aggregation.

Check text/connector clearance at the actual output size. Preserve required facts when splitting a dense view; name omissions and cross-view relations. Static lint does not prove semantic or geometric correctness.
