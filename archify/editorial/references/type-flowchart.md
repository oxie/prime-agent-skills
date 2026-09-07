# Flowchart

Curated from Cathryn Lavery, diagram-design `references/type-flowchart.md` at `3b446333f164174a571106673f943c58df282ff8` (MIT). See [retained license](../LICENSE.diagram-design). This Prime adaptation changes prescriptive styling and preserves evidence over layout.

## Choose this type

Decision logic and branching actions. Default to typed workflow when its contract covers the behavior.

This is a selectively loaded authoring brief, not a new deterministic renderer. Follow [design](design.md); typed Archify contracts remain authoritative in typed mode.

## Evidence to collect

Start/end, actions, decisions, branch conditions, rejoin points and exceptional outcomes.

## Geometry and reading order

Use start/end ovals, action rectangles and decision diamonds; label every outgoing decision edge. Orient the main path consistently and allocate side corridors for branches and retries. Explicit merge points distinguish a join from a crossing.

## Honesty and review

Never infer yes/no branches from left/right position. Do not delete failure paths for a tidy happy path. A decision with many outcomes may need a labeled switch or detail view, not invented binary decisions.

Check text/connector clearance at the actual output size. Preserve required facts when splitting a dense view; name omissions and cross-view relations. Static lint does not prove semantic or geometric correctness.
