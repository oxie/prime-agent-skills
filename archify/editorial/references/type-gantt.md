# Gantt chart

Curated from Cathryn Lavery, diagram-design `references/type-gantt.md` at `3b446333f164174a571106673f943c58df282ff8` (MIT). See [retained license](../LICENSE.diagram-design). This Prime adaptation changes prescriptive styling and preserves evidence over layout.

## Choose this type

Task intervals, overlap, phases and milestones over real time.

This is a selectively loaded authoring brief, not a new deterministic renderer. Follow [design](design.md); typed Archify contracts remain authoritative in typed mode.

## Evidence to collect

Task start/end dates, timezone where material, date inclusivity convention, milestones, dependencies and actual/planned status.

## Geometry and reading order

Use one shared time axis; x(t) = left + (t-start)/(end-start)*width. Bar endpoints map to task endpoints. Put tasks in rows with phase grouping. A milestone is a point, not a duration bar. Route essential dependencies outside bars.

## Honesty and review

Do not stretch short tasks to fit labels or equalize unequal durations. Show unknown dates as unknown, not plausible bars. A today line needs an as-of date. Critical path is a computed scheduling claim, not whichever task has accent color.

Check text/connector clearance at the actual output size. Preserve required facts when splitting a dense view; name omissions and cross-view relations. Static lint does not prove semantic or geometric correctness.
