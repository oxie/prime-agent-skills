# Tree / hierarchy

Curated from Cathryn Lavery, diagram-design `references/type-tree.md` at `3b446333f164174a571106673f943c58df282ff8` (MIT). See [retained license](../LICENSE.diagram-design). This Prime adaptation changes prescriptive styling and preserves evidence over layout.

## Choose this type

A rooted parent-child hierarchy with at most one parent per non-root item.

This is a selectively loaded authoring brief, not a new deterministic renderer. Follow [design](design.md); typed Archify contracts remain authoritative in typed mode.

## Evidence to collect

Root(s), stable node identities, parent edges, level meanings and intentionally omitted branches.

## Geometry and reading order

Root at top or left; align siblings, reserve branch corridors, and use clear elbow branches or a shared bus where that bus means one parent relationship. Draw branches before boxes. Allocate subtree width from its leaves.

## Honesty and review

Use dependency graph for shared dependencies or cycles. Do not duplicate one object into unrelated leaves without identifying it as a repeated reference. Preserve actual levels and mark any collapsed subtree with its count and scope.

Check text/connector clearance at the actual output size. Preserve required facts when splitting a dense view; name omissions and cross-view relations. Static lint does not prove semantic or geometric correctness.
