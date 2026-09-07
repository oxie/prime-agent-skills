# Sequence

Curated from Cathryn Lavery, diagram-design `references/type-sequence.md` at `3b446333f164174a571106673f943c58df282ff8` (MIT). See [retained license](../LICENSE.diagram-design). This Prime adaptation changes prescriptive styling and preserves evidence over layout.

## Choose this type

Time-ordered messages between actors. Default to typed sequence for supported technical exchanges.

This is a selectively loaded authoring brief, not a new deterministic renderer. Follow [design](design.md); typed Archify contracts remain authoritative in typed mode.

## Evidence to collect

Actors, ordered messages, call/return/asynchronous kinds, guards, repetitions and known timing.

## Geometry and reading order

Place actors across the top and lifelines downward. Messages run between lifelines at separate time levels. Keep self-calls as local loops. Enclose alternatives, optional regions and loops in labeled frames, with guards and clear region separators.

## Honesty and review

Preserve message kinds and actual ordering. Explain line/arrow conventions; styling a success must not turn a return into a new call. Vertical spacing shows order, not elapsed time unless a time scale is declared. Do not fake concurrency as sequence.

Check text/connector clearance at the actual output size. Preserve required facts when splitting a dense view; name omissions and cross-view relations. Static lint does not prove semantic or geometric correctness.
