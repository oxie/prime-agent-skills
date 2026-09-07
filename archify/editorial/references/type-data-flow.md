# Role-scoped data flow

Curated from Cathryn Lavery, diagram-design `references/type-data-flow.md` at `3b446333f164174a571106673f943c58df282ff8` (MIT). See [retained license](../LICENSE.diagram-design). This Prime adaptation changes prescriptive styling and preserves evidence over layout.

## Choose this type

Data pipelines where who initiates, transforms, publishes and consumes matters. Default to typed dataflow for supported technical lineage.

This is a selectively loaded authoring brief, not a new deterministic renderer. Follow [design](design.md); typed Archify contracts remain authoritative in typed mode.

## Evidence to collect

Roles, stages, payload types, transformation nodes, triggers, storage and external consumers.

## Geometry and reading order

Use stage columns and role lanes. Nodes occupy the matching owner/stage cell; show explicit input and output payload labels. Distinguish governance triggers from quantity/data handoffs. Reserve clear corridors for cross-role routes and label the actual payload/protocol.

## Honesty and review

Empty cells need no fake nodes. Do not label only the focal edge if other payloads matter. Equal arrow widths do not imply equal data volume. Permissions and data movement are separate; use a security matrix to make access claims explicit.

Check text/connector clearance at the actual output size. Preserve required facts when splitting a dense view; name omissions and cross-view relations. Static lint does not prove semantic or geometric correctness.
