# Domain terminology and sparse decision records

## When to use

Use when overloaded terms or conflicting scenarios obstruct a design, implementation
or documentation task. Reading a glossary for ordinary vocabulary needs no modeling
session. This reference does not require a new documentation tree, exhaustive domain
interview or code rename. Existing project documentation owners and instructions win.

Read the relevant glossary, architecture decisions, source and tests. Follow an
existing context map only into the area under discussion. Code shows current behavior;
it does not automatically define intended policy. A user statement may describe a
new requirement rather than an error in their understanding.

## Resolve a term through evidence

1. Name the ambiguous noun, state or relationship and the decision it blocks.
2. Find the current definitions and relevant code paths/scenarios using it.
3. Offer a small concrete contrast that separates the meanings.
4. Identify agreement, contradiction or missing evidence; ask only the consequential
   unresolved question rather than making the user repeat supplied context.
5. Record an accepted definition at the existing owner if documentation edits are
   authorized. Otherwise give the proposed wording in the response.

Prefer terms that distinguish real concepts. “Account” might mean a billing customer,
an authentication identity or a ledger account. Do not impose one synonym across
contexts with different meanings. A local alias can be legitimate at an external API
boundary; note the translation instead of silently changing the wire contract.

### Scenario/code contradiction

Suppose the glossary says “Cancellation ends an Order,” while a product scenario
requires cancelling one unshipped line and keeping the other lines active. Source
inspection shows `cancelOrder(id)` sets one order-wide status; tests cover only whole
orders. State that evidence precisely: current code supports whole-order cancellation,
while the scenario requires line-level cancellation. Do not report a runtime failure
unless it was exercised, or quietly document partial cancellation as already present.

Ask which meaning is intended for the current change if context does not settle it.
If partial cancellation is accepted as a requirement, distinguish `Order cancellation`
from `Line cancellation`, and trace the affected callers and state transitions before
implementation. If it is only a future idea, keep it proposed and outside the current
behavior contract. If whole-order behavior is intended, retain that definition and
record why the scenario is not supported when useful.

A useful follow-up scenario is “One of two lines has shipped; what can still be
cancelled?” It probes the actual relationship. Avoid inventing unrelated tax, inventory
or refund subsystems just to expand the interview.

## Keep the glossary about meaning

Use the project's chosen glossary path and format. A concise entry can contain:

- Canonical term and one or two sentences defining the concept in this context.
- A distinguishing example when nearby terms remain easy to confuse.
- Discouraged synonyms only where they genuinely obscure this meaning.
- A link to a different context's definition when the same word has another meaning.

Keep implementation recipes, unfinished notes and architectural rationale elsewhere.
Do not turn a glossary into the full specification. Preserve legitimate existing
content and follow local ownership when a document serves more than one purpose.
Create a new glossary or map only when authorized documentation work needs that
lasting boundary. No resolved term means no empty glossary to fill later.

## Record decisions sparingly

Follow an existing ADR policy first. Where the project leaves discretion, a separate
ADR earns its place when the choice is costly to reverse, surprising without context,
and based on a real trade-off. A glossary clarifies what something means; an ADR
explains why a consequential choice was made. Do not require an ADR for every term.

Example that earns a record: the system retains immutable order events and projects
current state instead of overwriting it, because mandated reconstruction outweighs
the added storage and projection-repair cost. The record should name that constraint,
the rejected overwrite alternative, and the accepted consistency/recovery consequences.
Do not invent the mandate or infer acceptance from an implementation suggestion.

Example that does not: rename a local variable from `x` to `lineCount` to match an
accepted glossary term. It is reversible, unsurprising and has no material trade-off.
Update the authorized code/comment if needed; do not create an ADR as a completion gate.

Use the project's chosen decision path and numbering, inspecting existing records
before adding one. A short title plus context, decision and reason can be sufficient.
Add alternatives, consequences or links only when they preserve useful rationale.
Label a suggestion **proposed**, not **accepted**. Record acceptance only from an
actual authorized decision; reading a draft or running a test is not approval.
For a changed decision, preserve history and use the project's supersession convention.

## Close the loop

Check accepted terminology against the affected documents, scenarios and relevant
source names. Distinguish an intentional legacy alias from an unresolved contradiction.
Update affected owning links in the same authorized change, not unrelated directories.
Report resolved meanings, material open questions and any proposed decision awaiting
acceptance. Do not claim code behavior changed because its glossary was edited.

Source and adaptations: [MATTPOCOCK_SOURCES.md](../MATTPOCOCK_SOURCES.md).

## Preserve requirement authority through a relay

Use this example when research, a summary or another agent supplies a specification.
Keep origin and acceptance separate: a fact can inform a decision without becoming
one, and an agent-generated decision is not evidence of human approval. Preserve the
speaker/source, descriptive or proposed or accepted status, scope, conditions and
superseding decision in the existing task contract; no new ledger or schema is needed.

Fictional example: the maintainer asks for a retrying client with an overall deadline
below ten seconds. Research finds that the current client retries three times. An
agent proposes five retries. A summary that says “implement five retries” has promoted
a suggestion and dropped the deadline; neither fluency nor repetition grants authority.
The three statements must remain distinct:

- Observation: the inspected current client retries three times, at the cited revision.
  That describes current behavior, not the required policy for the new client.
- Proposal: try five retries, subject to the unchanged overall deadline. It remains
  proposed until accepted by someone authorized for that decision.
- Accepted decision: an authorized maintainer chooses five retries while retaining
  the below-ten-second overall deadline. Record that decision and its scope together.

Trace these distinctions through research → summary → specification → implementation.
A source citation establishes origin, not approval; a field named `user` may contain
an automated choice. Check what the producer actually means rather than trusting the
label. Keep useful observations as context, but do not promote them into hard criteria
merely because a requirements extractor paraphrases them. Preserve exact material
constraints and their qualifications even when the surrounding explanation is shortened.

If a later authorized decision changes the retry count, update the canonical task
contract using the existing supersession convention before implementation. Reconcile
affected handoffs and checks; a correction only in a private summary leaves downstream
workers on the old contract. Do not silently replace a user requirement with an easier
artifact or treat a test pass as acceptance of a changed requirement. Missing authority
stays unresolved: ask the consequential question, not a full repeat interview.

Review both directions: a relayed proposal must not become accepted, and a valid later
decision must not be discarded as mere observation. Check the resulting specification
still contains the count, deadline and actual acceptance status. This is a worked
review example, not an executed interview or permission to run an autonomous one.
See [source findings and limits](../OUROBOROS_SOURCES.md).
