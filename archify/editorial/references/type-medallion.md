# Medallion / data-quality tiers

Curated from Cathryn Lavery, diagram-design `references/type-medallion.md` at `3b446333f164174a571106673f943c58df282ff8` (MIT). See [retained license](../LICENSE.diagram-design). This Prime adaptation changes prescriptive styling and preserves evidence over layout.

## Choose this type

Quality and access levels of related stored data and promotions between them.

This is a selectively loaded authoring brief, not a new deterministic renderer. Follow [design](design.md); typed Archify contracts remain authoritative in typed mode.

## Evidence to collect

Real tier names, formats, writer/reader roles, quality gates, promotion paths, retention/archive policies.

## Geometry and reading order

Arrange content-sized tier cards in promotion order. Repeat fields such as format, writer and example dataset consistently. Distinguish promotion from archival/lifecycle paths with labeled arrows. Use native SVG text/tspans for wrapping, never foreignObject.

## Honesty and review

Bronze/silver/gold are not universal facts. An anonymized tier needs evidence of the transformation and its limits, not just a name. Preserve rejected/quarantined paths and actual access distinctions. Do not invent sample filenames or imply quality improves automatically.

Check text/connector clearance at the actual output size. Preserve required facts when splitting a dense view; name omissions and cross-view relations. Static lint does not prove semantic or geometric correctness.
