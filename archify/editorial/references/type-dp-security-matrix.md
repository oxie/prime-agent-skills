# Data-platform security matrix

Curated from Cathryn Lavery, diagram-design `references/type-dp-security-matrix.md` at `3b446333f164174a571106673f943c58df282ff8` (MIT). See [retained license](../LICENSE.diagram-design). This Prime adaptation changes prescriptive styling and preserves evidence over layout.

## Choose this type

Who can perform which operations on each component or resource.

This is a selectively loaded authoring brief, not a new deterministic renderer. Follow [design](design.md); typed Archify contracts remain authoritative in typed mode.

## Evidence to collect

Role/group identities, resource names, exact permission values, source/as-of date, inherited/conditional rules and unknowns.

## Geometry and reading order

Rows are resources, columns are roles. Use consistent cell padding and repeat headers on split views. Print exact permission words in every relevant cell, with color as a secondary cue. No connectors are needed; row/column intersection defines the relation.

## Honesty and review

Unknown, no access, not applicable and not assessed are distinct states. Do not infer denial from a blank cell or effective access from a declared role. Document conditions and inheritance; a small HTML table may be the clearest accessible companion.

Check text/connector clearance at the actual output size. Preserve required facts when splitting a dense view; name omissions and cross-view relations. Static lint does not prove semantic or geometric correctness.
