# UML class diagram

Curated from Cathryn Lavery, diagram-design `references/type-uml-class.md` at `3b446333f164174a571106673f943c58df282ff8` (MIT). See [retained license](../LICENSE.diagram-design). This Prime adaptation changes prescriptive styling and preserves evidence over layout.

## Choose this type

Object-model structure where operations and typed relationships matter.

This is a selectively loaded authoring brief, not a new deterministic renderer. Follow [design](design.md); typed Archify contracts remain authoritative in typed mode.

## Evidence to collect

Class/interface names, attributes, operations, visibility, inheritance/realization, ownership and multiplicities.

## Geometry and reading order

Use name, attributes and operations compartments sized to content. Hollow triangle points to superclass/interface (dashed for realization). Composition has a filled diamond at the owner; aggregation a hollow diamond. Association and dashed dependency must not masquerade as inheritance.

## Honesty and review

Show a legend for used relationship kinds and preserve multiplicity. Do not assume composition means SQL cascading deletion. Mark omitted members with a count/scope. Route conceptual entities to ER, physical FKs to database schema, and runtime placement to deployment.

Check text/connector clearance at the actual output size. Preserve required facts when splitting a dense view; name omissions and cross-view relations. Static lint does not prove semantic or geometric correctness.
