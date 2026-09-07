# Dependency graph

Curated from Cathryn Lavery, diagram-design `references/type-dependency.md` at `3b446333f164174a571106673f943c58df282ff8` (MIT). See [retained license](../LICENSE.diagram-design). This Prime adaptation changes prescriptive styling and preserves evidence over layout.

## Choose this type

Shared dependencies or cycles that a tree cannot represent faithfully.

This is a selectively loaded authoring brief, not a new deterministic renderer. Follow [design](design.md); typed Archify contracts remain authoritative in typed mode.

## Evidence to collect

Stable nodes, explicit depends-on direction, versions if known, all selected edges, graph scope.

## Geometry and reading order

State the arrow convention (dependent → dependency). Rank acyclic portions by depth; condense strongly connected groups or route back-edges around the outside with cycle labels. If fan-in badges are used, compute distinct inbound dependents from the same shown scope.

## Honesty and review

Do not force a multi-parent graph into a tree or remove cycles to obtain ranks. More than one real cycle may need detail views, not silent deletion. Identify external/unknown nodes. Counts must disclose whether they refer to the selected view or full repository.

Check text/connector clearance at the actual output size. Preserve required facts when splitting a dense view; name omissions and cross-view relations. Static lint does not prove semantic or geometric correctness.
