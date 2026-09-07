# Treemap

Curated from Cathryn Lavery, diagram-design `references/type-treemap.md` at `3b446333f164174a571106673f943c58df282ff8` (MIT). See [retained license](../LICENSE.diagram-design). This Prime adaptation changes prescriptive styling and preserves evidence over layout.

## Choose this type

Parts of a known total where relative area is the story.

This is a selectively loaded authoring brief, not a new deterministic renderer. Follow [design](design.md); typed Archify contracts remain authoritative in typed mode.

## Evidence to collect

Nonnegative finite part values, hierarchy if present, total and any explicit Other grouping.

## Geometry and reading order

Area_i = usable_area * value_i / total. A squarified layout improves aspect ratios. Compute geometry before adding labels. Keep gutters/strokes from materially distorting small parts; measure each part’s relative area error. Put tiny-part labels in a keyed legend.

## Honesty and review

Do not snap data area to a decorative grid or enlarge small cells to fit words. Name what Other contains. Zero has zero area; missing is outside the total with an explicit note. Use bars when precise comparison matters more than overall share.

Check text/connector clearance at the actual output size. Preserve required facts when splitting a dense view; name omissions and cross-view relations. Static lint does not prove semantic or geometric correctness.
