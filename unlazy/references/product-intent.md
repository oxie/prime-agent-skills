# Shape product intent without losing the contract

## When to use

Use when a feature or product request is too rough to build or test without guessing,
or several source documents must become one usable implementation brief. Skip this
for a clear bug fix or an already sufficient plan. Reuse the existing issue, plan or
PRD; this is not a mandatory document, interview, planning phase or new tracker.

Read the supplied intent, accepted decisions and relevant project constraints first.
Resolve routine facts from authorized evidence. Ask only about a material gap that
changes scope, user outcome, permission, safety or a costly commitment. Do not invent
user research, approval, success metrics or product decisions to fill the shape.

## Make the smallest usable contract

In the existing planning artifact, capture only what the work needs:

- **Purpose and user:** who needs what outcome, and why it matters.
- **Capability and success:** what they can do, with an observable result and relevant
  failure or denial behavior. Describe the outcome before choosing implementation.
- **Consequential constraints:** conditions that rule out otherwise plausible designs.
  Preserve security, compatibility, data lifetime and other accepted limits.
- **Non-goals:** explicit exclusions from the request or accepted decisions. Missing
  detail is not automatically a non-goal; do not invent exclusions to make work fit.
- **Assumptions and open questions:** label inference separately from accepted scope.
  Name the decision owner for unresolved consequential choices. Do not execute a
  material assumption as if approved; continue independent, already-authorized work.

Existing identifiers and terminology are enough. No special schema or new ID system
is required. A product-level success signal may need real user evidence later;
passing an implementation test does not prove adoption, satisfaction or business value.

## Check coherence, then preservation

First check whether the stated capabilities and constraints can coexist and whether
success can actually be observed. Surface conflicts rather than silently choosing a
weaker requirement. Then walk the authoritative input claim by claim: would omitting
this detail change an implementation, design or verification decision? If yes, retain
it in the brief or explicitly identify the required supporting material and its
relevant section/revision. Tables, rules, examples and diagrams can carry obligations.

Distinguish **required supporting material** from **background provenance**. A source
link alone does not prove its obligations were preserved. Do not call a source fully
absorbed until every consequential claim is present and checked. Keep required detail
with its existing owner; do not copy entire source documents or make a parallel memory
log. If required material is missing or inaccessible, name the affected work and gap;
do not present the brief as complete or dispatch that work as ready.

Carry the brief and required supporting material into affected worker briefs and
checks. A worker needs the actual conditions, not only a link to a summary. Use the
existing [decision-to-verification handoff](decision-verification.md) for accepted
changes, plan identity and current evidence. This shaping step does not replace it,
change gate semantics or authorize extra tools, installation, deployment or live data.

## Connected fictional example: tenant audit export

Illustrative accepted input: a tenant administrator needs a manual audit export for
an investigation. Include only that tenant's records. Generated export files must be
deleted no later than seven days after creation. Each new download must require
current access; an earlier permission check cannot survive access revocation. No
scheduled delivery. The existing audit-field table defines the required columns.
These are invented requirements for this example, not a real approved project.

A compact brief retains the following:

- **Capability:** an authorized tenant administrator requests and downloads the
  tenant's audit export, with the columns in the required audit-field table.
- **Success/denial:** the fixture's expected rows and columns match; another tenant
  gets no content; revoke access after generation and a new download gets no content.
- **Lifetime:** delete generated files by creation time plus seven days and deny
  downloads at or after expiry. Verify both deletion and denial, not just a hidden link.
- **Exclusion:** no scheduled delivery. A suggestion to email exports later remains
  outside executable scope unless accepted through the existing decision process.
- **Required support:** the existing audit-field table, with its actual path and
  revision supplied in a real brief. It is required input, not background provenance.
- **Open question:** maximum export size is not supplied. Resolve it with the product
  owner before committing to a size-dependent implementation; do not invent a limit.

“Admins can export audit data” fails preservation: it loses tenant isolation, lifetime,
revocation, required columns and the delivery exclusion. “Secure export” is not a
testable replacement for these obligations. Keep all of them in the active plan,
affected worker briefs and verification gates, including access-denial checks.

For the worker/download boundary, use Engineering References' optional architecture
compatibility check in its interface-design reference. The same example there shows
why authorization at generation is not authorization for a later download. Storage
library and helper names can remain local choices; security timing cannot.

Proposed verification joins a known tenant fixture and audit-field table to generation,
download, revocation and expiry checks against the intended source/build. A generation
unit test alone cannot establish download authorization or actual file deletion. If
an authorized test finds a post-revocation download succeeds, preserve that sequence
for the fix and same-action retest using the existing handoff. Missing boundary access
means unverified, not passed. No tests of this fictional application were executed.

Source selection and limits: [BMAD_SOURCES.md](../BMAD_SOURCES.md).
