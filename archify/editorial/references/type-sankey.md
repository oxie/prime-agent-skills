# Sankey / flow quantity

Curated from Cathryn Lavery, diagram-design `references/type-sankey.md` at `3b446333f164174a571106673f943c58df282ff8` (MIT). See [retained license](../LICENSE.diagram-design). This Prime adaptation changes prescriptive styling and preserves evidence over layout.

## Choose this type

A quantity that splits or merges across stages.

This is a selectively loaded authoring brief, not a new deterministic renderer. Follow [design](design.md); typed Archify contracts remain authoritative in typed mode.

## Evidence to collect

Nonnegative finite flows in one unit/period, endpoints, node totals, sources/sinks and balance assumptions.

## Geometry and reading order

Choose as many stage columns as the actual story requires. Use one scale k: ribbon thickness = k*flow. Stack incident flow offsets so node height equals the corresponding total. Draw closed ribbons with horizontal entry/exit tangents; direction follows labeled stage order.

## Honesty and review

At each conservation node compare inflow and outflow; name losses, gains, storage or uncertainty rather than silently balancing. Do not round thickness to a grid, add minimum widths or use ordinary arrows as quantitative bands. Disclose partial scope and small-flow aggregation.

Check text/connector clearance at the actual output size. Preserve required facts when splitting a dense view; name omissions and cross-view relations. Static lint does not prove semantic or geometric correctness.
