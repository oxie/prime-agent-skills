# State machine

Curated from Cathryn Lavery, diagram-design `references/type-state.md` at `3b446333f164174a571106673f943c58df282ff8` (MIT). See [retained license](../LICENSE.diagram-design). This Prime adaptation changes prescriptive styling and preserves evidence over layout.

## Choose this type

States, events, guards and actions. Default to typed lifecycle for its supported state model.

This is a selectively loaded authoring brief, not a new deterministic renderer. Follow [design](design.md); typed Archify contracts remain authoritative in typed mode.

## Evidence to collect

Named states, initial/final states if defined, transitions in event [guard] / action form, retries and error behavior.

## Geometry and reading order

Rounded state boxes with start dot and final ring where applicable. Route the dominant path consistently and reserve space for self-loops and reverse transitions. Put transition labels in clear space without obscuring destinations.

## Honesty and review

An action is not automatically a state. Show all supplied triggers and guards. An any-state shorthand must name its exact scope and exceptions; it must not accidentally include terminal states. Do not invent a final state for a continuing service.

Check text/connector clearance at the actual output size. Preserve required facts when splitting a dense view; name omissions and cross-view relations. Static lint does not prove semantic or geometric correctness.
