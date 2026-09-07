# Nested containment

Curated from Cathryn Lavery, diagram-design `references/type-nested.md` at `3b446333f164174a571106673f943c58df282ff8` (MIT). See [retained license](../LICENSE.diagram-design). This Prime adaptation changes prescriptive styling and preserves evidence over layout.

## Choose this type

Scope, membership, trust zones or hierarchy where inclusion carries meaning.

This is a selectively loaded authoring brief, not a new deterministic renderer. Follow [design](design.md); typed Archify contracts remain authoritative in typed mode.

## Evidence to collect

Containers, explicit parent membership, sibling scopes and cross-boundary relationships if relevant.

## Geometry and reading order

Use nested rectangles with enough inset for labels and content. Draw outer regions before inner regions. Keep sibling containers separate; increase canvas size rather than bury inner labels. Use a clear visual boundary hierarchy.

## Honesty and review

Containment asserts membership, not dependency or permission inheritance by default. Do not put unrelated objects inside a convenient ring. State exceptions to inherited rules and disclose omitted levels. Use tree for parent-child links without actual containment.

Check text/connector clearance at the actual output size. Preserve required facts when splitting a dense view; name omissions and cross-view relations. Static lint does not prove semantic or geometric correctness.
