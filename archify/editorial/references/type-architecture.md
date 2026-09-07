# Architecture

Curated from Cathryn Lavery, diagram-design `references/type-architecture.md` at `3b446333f164174a571106673f943c58df282ff8` (MIT). See [retained license](../LICENSE.diagram-design). This Prime adaptation changes prescriptive styling and preserves evidence over layout.

## Choose this type

Components, connections, ownership and system boundaries. Default to Archify typed architecture for technical maps.

This is a selectively loaded authoring brief, not a new deterministic renderer. Follow [design](design.md); typed Archify contracts remain authoritative in typed mode.

## Evidence to collect

Named components, directed connections, protocols, actual boundaries and scope.

## Geometry and reading order

Group by tier or trust boundary. Keep one main reading direction. Draw boundaries first, then traceable connectors, then nodes and clear labels. Use orthogonal corridors where helpful; fan distinct ports and separate crossings from junctions.

## Honesty and review

A boundary is a fact, not a decorative grouping. Do not merge components that share a path but have different identity, ownership, failure or deployment boundaries. Preserve reverse and asynchronous traffic.

Check text/connector clearance at the actual output size. Preserve required facts when splitting a dense view; name omissions and cross-view relations. Static lint does not prove semantic or geometric correctness.
