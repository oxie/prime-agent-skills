# Deployment

Curated from Cathryn Lavery, diagram-design `references/type-deployment.md` at `3b446333f164174a571106673f943c58df282ff8` (MIT). See [retained license](../LICENSE.diagram-design). This Prime adaptation changes prescriptive styling and preserves evidence over layout.

## Choose this type

Where software runs: environment, host/pod/service, deployed artifact and replicas.

This is a selectively loaded authoring brief, not a new deterministic renderer. Follow [design](design.md); typed Archify contracts remain authoritative in typed mode.

## Evidence to collect

Actual zones and infrastructure nodes, artifact names/versions when known, replica counts, ports/protocols and as-of date.

## Geometry and reading order

Use containment: zone contains infrastructure node, which contains artifact chips. Replica badges summarize identical instances only. Connect actual network endpoints with labeled protocol/port paths and distinguish replication or asynchronous traffic.

## Honesty and review

An unknown version remains unknown. Do not infer a trust boundary from a decorative box or treat one replica as high availability. Label environment boundaries and actual scope. Use architecture if there is no placement decision; preserve distinct replicas if their roles differ.

Check text/connector clearance at the actual output size. Preserve required facts when splitting a dense view; name omissions and cross-view relations. Static lint does not prove semantic or geometric correctness.
