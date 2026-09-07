# Editorial layout catalogue — 39 types

Curated from Cathryn Lavery, diagram-design `SKILL.md and references/type-*.md` at `3b446333f164174a571106673f943c58df282ff8` (MIT). See [retained license](../LICENSE.diagram-design). This Prime adaptation changes prescriptive styling and preserves evidence over layout.

## Routing within one Archify package

Archify's five typed modes remain the default for technical architecture,
workflow, sequence, dataflow and lifecycle diagrams. Those modes use their existing
JSON schemas, renderers and delivery receipts. Select editorial mode for a named
unsupported layout or an explicitly requested static editorial figure.

Editorial means agent-authored static HTML with inline SVG, checked separately.
The 39 entries are layout briefs, **not 39 deterministic renderers**. An overlapping
name such as architecture or sequence does not replace the typed contract. Never
send an unsupported catalogue ID to a typed renderer or claim typed delivery for
hand-authored SVG.

Load [design](design.md), then only the chosen type brief. Load
[semantic patterns](semantic-patterns.md) when queueing, provenance, policy,
trust, enforcement or residual risk drives the meaning. Use a table or prose if
it tells the story more clearly. No arbitrary node limit authorizes deleting facts.

The machine catalogue is [catalogue.json](../catalogue.json). Its `reference`
values are relative to the **Archify skill root**, not to this document.
Variants listed below reuse their parent brief and do not inflate the count.

| ID | Named layout | Use when showing |
|---|---|---|
| `architecture` | [Architecture](type-architecture.md) | Components, connections, ownership and system boundaries. Default to Archify typed architecture for technical maps. |
| `it-state` | [IT current-state](type-it-state.md) | The current or legacy landscape, including manual handoffs and known friction. |
| `flowchart` | [Flowchart](type-flowchart.md) | Decision logic and branching actions. Default to typed workflow when its contract covers the behavior. |
| `sequence` | [Sequence](type-sequence.md) | Time-ordered messages between actors. Default to typed sequence for supported technical exchanges. |
| `state` | [State machine](type-state.md) | States, events, guards and actions. Default to typed lifecycle for its supported state model. |
| `er` | [ER / data model](type-er.md) | Conceptual or logical entities and relationship cardinality, not physical DDL. |
| `timeline` | [Timeline](type-timeline.md) | Dated events, milestones or incident chronology. |
| `swimlane` | [Swimlane](type-swimlane.md) | Cross-functional steps and handoffs across responsible actors. |
| `quadrant` | [Quadrant](type-quadrant.md) | Positioning along two dimensions, or four named scenarios from two drivers. |
| `radar` | [Radar / Spider](type-radar.md) | Profiles across several comparable criteria on an explicit common scale. |
| `polar` | [Polar chart](type-polar.md) | One quantitative series across cyclic categories whose order matters. |
| `loop` | [Loop / flywheel](type-loop.md) | A genuine returning cycle; a shared hub is useful only when repeated passes accumulate shared state. |
| `nested` | [Nested containment](type-nested.md) | Scope, membership, trust zones or hierarchy where inclusion carries meaning. |
| `tree` | [Tree / hierarchy](type-tree.md) | A rooted parent-child hierarchy with at most one parent per non-root item. |
| `org-chart` | [Org chart / responsibility map](type-org-chart.md) | Accountability, reporting, escalation or work routing among people, teams or agents. |
| `layers` | [Layer stack](type-layers.md) | Ordered abstraction levels or enforcement surfaces. |
| `venn` | [Venn / set overlap](type-venn.md) | Set membership and meaningful intersections. |
| `pyramid` | [Pyramid / funnel](type-pyramid.md) | Ranked hierarchy, foundation-to-apex relationships, or shrinking conversion cohorts. |
| `bar` | [Bar / column chart](type-bar.md) | Comparison of category magnitudes; two-state differences may use dumbbells. |
| `treemap` | [Treemap](type-treemap.md) | Parts of a known total where relative area is the story. |
| `line` | [Line chart](type-line.md) | Ordered quantitative trends; variants: slopegraph, ridgeline and bump chart. |
| `gantt` | [Gantt chart](type-gantt.md) | Task intervals, overlap, phases and milestones over real time. |
| `scatter` | [Scatter plot](type-scatter.md) | Two-variable distributions or association; variants: bubble and beeswarm. |
| `high-level` | [High-level data stack](type-high-level.md) | End-to-end data stack across phases within actual deployment boundaries. |
| `process` | [Process](type-process.md) | Ordered work with owners, inputs, outputs and tools visible per stage. |
| `medallion` | [Medallion / data-quality tiers](type-medallion.md) | Quality and access levels of related stored data and promotions between them. |
| `data-flow` | [Role-scoped data flow](type-data-flow.md) | Data pipelines where who initiates, transforms, publishes and consumes matters. Default to typed dataflow for supported technical lineage. |
| `dp-integration` | [Data-platform integration](type-dp-integration.md) | Platform sources, internal services, consumer surfaces and protocols, without a time axis. |
| `dp-security-matrix` | [Data-platform security matrix](type-dp-security-matrix.md) | Who can perform which operations on each component or resource. |
| `sankey` | [Sankey / flow quantity](type-sankey.md) | A quantity that splits or merges across stages. |
| `fishbone` | [Fishbone / Ishikawa](type-fishbone.md) | Candidate and confirmed causes of one observed effect. |
| `wardley` | [Wardley map](type-wardley.md) | A value chain positioned by user visibility and component evolution, not runtime architecture. |
| `kanban` | [Kanban board](type-kanban.md) | An as-of snapshot of work items by state, with workload and blockers. |
| `journey` | [User journey map](type-journey.md) | One persona’s actions and experience across stages, including evidenced or explicitly hypothetical sentiment. |
| `deployment` | [Deployment](type-deployment.md) | Where software runs: environment, host/pod/service, deployed artifact and replicas. |
| `dependency` | [Dependency graph](type-dependency.md) | Shared dependencies or cycles that a tree cannot represent faithfully. |
| `uml-class` | [UML class diagram](type-uml-class.md) | Object-model structure where operations and typed relationships matter. |
| `story-map` | [User story map](type-story-map.md) | A narrative backbone divided into release scope, not a status board. |
| `db-schema` | [Physical database schema](type-db-schema.md) | Real tables, SQL types, constraints, indexes and column-level foreign keys. |

## Variant routing

- Bar: grouped, stacked and dumbbell comparisons.
- Line: slopegraph, ridgeline and bump chart.
- Scatter: bubble and beeswarm.
- Quadrant: positioned marks or a four-scenario matrix.
- Pyramid: conceptual pyramid or quantitative funnel, with declared encoding.

## Local starting points

Use [light template](../assets/template-light.html) or
[dark template](../assets/template-dark.html). Both are intentionally marked DRAFT;
replace all draft content before claiming a complete artifact.
Original synthetic demonstrations: [Wardley](../examples/wardley.html),
[journey](../examples/journey.html), [bar](../examples/bar.html).
Examples are not user facts, research, measured benchmarks or security evidence.
