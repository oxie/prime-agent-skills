# Data-platform integration

Curated from Cathryn Lavery, diagram-design `references/type-dp-integration.md` at `3b446333f164174a571106673f943c58df282ff8` (MIT). See [retained license](../LICENSE.diagram-design). This Prime adaptation changes prescriptive styling and preserves evidence over layout.

## Choose this type

Platform sources, internal services, consumer surfaces and protocols, without a time axis.

This is a selectively loaded authoring brief, not a new deterministic renderer. Follow [design](design.md); typed Archify contracts remain authoritative in typed mode.

## Evidence to collect

Actual sources/consumers, platform boundary, internal services, directional protocols and scoped shared services.

## Geometry and reading order

Use sources on one side, a central platform group and consumers on the other. Full-width service bars may express broad scope; specific bindings still need explicit endpoints. Stagger fan-out ports and keep protocol labels outside node silhouettes.

## Honesty and review

Do not force all identity links to a boundary if evidence names a particular service. Do not infer access from connectivity. Colors must not override supplied protocols or directions. Use high-level for phase organization, data flow for ordered payload transformation.

Check text/connector clearance at the actual output size. Preserve required facts when splitting a dense view; name omissions and cross-view relations. Static lint does not prove semantic or geometric correctness.
