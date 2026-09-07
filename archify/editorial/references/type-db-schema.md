# Physical database schema

Curated from Cathryn Lavery, diagram-design `references/type-db-schema.md` at `3b446333f164174a571106673f943c58df282ff8` (MIT). See [retained license](../LICENSE.diagram-design). This Prime adaptation changes prescriptive styling and preserves evidence over layout.

## Choose this type

Real tables, SQL types, constraints, indexes and column-level foreign keys.

This is a selectively loaded authoring brief, not a new deterministic renderer. Follow [design](design.md); typed Archify contracts remain authoritative in typed mode.

## Evidence to collect

DDL/migration evidence, qualified table names, columns/types/nullability, PK/UQ/FK constraints, indexes and referential actions.

## Geometry and reading order

Use table header, fixed-height column rows and an optional index compartment. FK paths anchor at the specific source and referenced column rows, not the table center. For several FKs on one row, offset ports within that row or widen the corridor; keep endpoints identifiable.

## Honesty and review

Preserve exact SQL types and ON DELETE/ON UPDATE actions when known. Unknown actions remain unknown; do not assume CASCADE. Mark omitted columns/indexes with counts and scope. This is not conceptual ER: entity-box cardinality cannot replace physical column references.

Check text/connector clearance at the actual output size. Preserve required facts when splitting a dense view; name omissions and cross-view relations. Static lint does not prove semantic or geometric correctness.
