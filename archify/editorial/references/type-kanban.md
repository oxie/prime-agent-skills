# Kanban board

Curated from Cathryn Lavery, diagram-design `references/type-kanban.md` at `3b446333f164174a571106673f943c58df282ff8` (MIT). See [retained license](../LICENSE.diagram-design). This Prime adaptation changes prescriptive styling and preserves evidence over layout.

## Choose this type

An as-of snapshot of work items by state, with workload and blockers.

This is a selectively loaded authoring brief, not a new deterministic renderer. Follow [design](design.md); typed Archify contracts remain authoritative in typed mode.

## Evidence to collect

State columns, unique items, owners when known, WIP limits, blocked/waiting/done status and snapshot date.

## Geometry and reading order

Use equal-width state columns with count and limit in the header. Stack readable cards with IDs and status text; show blocked and waiting with distinct labels/patterns. There are no flow arrows. Overflow groups state exactly how many items are not individually drawn.

## Honesty and review

Count all in-scope cards, including aggregated items, for WIP. A missing limit is unknown or not set, not infinity. Do not hide multiple blockers to conserve accent. Do not confuse people with work items; use process/swimlane to explain transition rules.

Check text/connector clearance at the actual output size. Preserve required facts when splitting a dense view; name omissions and cross-view relations. Static lint does not prove semantic or geometric correctness.
