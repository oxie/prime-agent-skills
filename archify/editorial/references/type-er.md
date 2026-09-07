# ER / data model

Curated from Cathryn Lavery, diagram-design `references/type-er.md` at `3b446333f164174a571106673f943c58df282ff8` (MIT). See [retained license](../LICENSE.diagram-design). This Prime adaptation changes prescriptive styling and preserves evidence over layout.

## Choose this type

Conceptual or logical entities and relationship cardinality, not physical DDL.

This is a selectively loaded authoring brief, not a new deterministic renderer. Follow [design](design.md); typed Archify contracts remain authoritative in typed mode.

## Evidence to collect

Entity names, relevant attributes, relationship names, optionality and cardinality at both ends.

## Geometry and reading order

Use a header and content-sized attribute compartment. Relationships join entity boxes; place cardinality near each endpoint with one consistent notation. Cluster related entities while keeping each relationship traceable.

## Honesty and review

Use database schema when SQL types, indexes, referential actions or column-level FKs carry the story. Do not invent keys or cardinalities from naming alone. Distinguish unknown cardinality from many; disclose omitted fields.

Check text/connector clearance at the actual output size. Preserve required facts when splitting a dense view; name omissions and cross-view relations. Static lint does not prove semantic or geometric correctness.
