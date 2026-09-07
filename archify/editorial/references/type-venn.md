# Venn / set overlap

Curated from Cathryn Lavery, diagram-design `references/type-venn.md` at `3b446333f164174a571106673f943c58df282ff8` (MIT). See [retained license](../LICENSE.diagram-design). This Prime adaptation changes prescriptive styling and preserves evidence over layout.

## Choose this type

Set membership and meaningful intersections.

This is a selectively loaded authoring brief, not a new deterministic renderer. Follow [design](design.md); typed Archify contracts remain authoritative in typed mode.

## Evidence to collect

Set definitions, membership/intersection facts, whether sizes are qualitative or quantitative.

## Geometry and reading order

Prefer two or three circles with outside set labels and clear labels in overlap regions. Use leaders for small intersections. A qualitative Venn can use equal circles only with a not-to-scale note. For quantitative sets, area and intersection area must match stated quantities.

## Honesty and review

Radius proportional to count is wrong: area scales with radius squared. Arbitrary circles cannot fit every set-size/intersection combination. Use a table or another set visualization if exact quantities cannot be represented; never imply an unsupported intersection.

Check text/connector clearance at the actual output size. Preserve required facts when splitting a dense view; name omissions and cross-view relations. Static lint does not prove semantic or geometric correctness.
