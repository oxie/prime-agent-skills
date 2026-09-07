# Line chart

Curated from Cathryn Lavery, diagram-design `references/type-line.md` at `3b446333f164174a571106673f943c58df282ff8` (MIT). See [retained license](../LICENSE.diagram-design). This Prime adaptation changes prescriptive styling and preserves evidence over layout.

## Choose this type

Ordered quantitative trends; variants: slopegraph, ridgeline and bump chart.

This is a selectively loaded authoring brief, not a new deterministic renderer. Follow [design](design.md); typed Archify contracts remain authoritative in typed mode.

## Evidence to collect

Observed positions/times, series, values, units, missing segments and chosen domain.

## Geometry and reading order

Map true time intervals to x; use straight segments between samples unless justified interpolation is labeled. Label domains and series. Slopegraphs connect exactly two comparable states on equal y-scales. Ridgelines share x and an explicit density/amplitude normalization. Bump charts show ranks over snapshots.

## Honesty and review

Do not bridge missing observations, imply causality or smooth away extremes. A nonzero y-domain must be visible. Slopegraphs retain both endpoint values. Ridgelines disclose bandwidth/normalization. Bump ties retain equal ranks and explicit tie rules, not arbitrary unique positions.

Check text/connector clearance at the actual output size. Preserve required facts when splitting a dense view; name omissions and cross-view relations. Static lint does not prove semantic or geometric correctness.
