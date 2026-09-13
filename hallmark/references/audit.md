# Visual-design audit — read-only

Read only the requested target and relevant context. Do not edit, write a project
log, append a CSS stamp, export tokens or quietly start a redesign. A report in chat
is enough unless the user asked for a report file. Do not run builds/tests that write
generated files or start servers during a read-only audit. Request separate approval
for additional execution when it is needed; report the missing evidence meanwhile.

For each finding give:

- **Evidence:** source path/line, screenshot region, or actual observed behavior.
- **Impact:** what the user cannot read, reach, understand or complete.
- **Category:** functional/accessibility defect, design-system inconsistency, or
  optional visual suggestion. Do not label a familiar pattern “critical AI slop”.
- **Next action:** smallest useful fix; note uncertainty or an unperformed check.

Prioritize blocked tasks and lost content over polish. Distinguish a visible contrast
concern from a measured failure. A source-only audit cannot assert breakpoint, keyboard
or screen-reader success/failure without that evidence. If no screenshot/browser is
available, report the limit and source-level findings without fabricating observations.

Do not infer who or what authored a page from its fonts, gradients or card layout.
User-requested visual parity is not a defect. Recommend a separate, scoped redesign
only when it would meet the brief better; an audit is not approval to perform it.

## Prove claimed design-system drift

Use this extra test only when calling a difference a design-system inconsistency,
not as a gate on every visual suggestion. Begin at the selected route/layout and
trace its actual compositions, variants, token aliases, configuration and inherited
styles. A similar name, repeated literal or nearby file is not proof of ownership.
Exclude disconnected demos, other products and unused legacy themes from that claim.

Before reporting drift, establish:
- **Governing contract:** a current accepted design rule for this property/surface,
  or a direct contradiction in presentation within the same task. A preference,
  stale proposal or undocumented exception is not automatically a binding rule.
- **Applied path:** source evidence that the owner/value reaches the surface through
  imports, props, resolved configuration or CSS inheritance. Call this source-traced,
  not observed rendering. Use rendered evidence for perceived hierarchy or usability.
- **Supported correction:** name the exact existing token, variant or owner when the
  contract determines one. If the right choice depends on unknown product intent,
  label that uncertainty rather than invent a mandatory correction.

Reopen cited sources and try to disprove the claim: wrong scope, deliberate exception,
stale evidence, different lifecycle/theme, or another finding with the same root cause.
If no candidate inconsistency survives these checks, say no supported inconsistency
was found in the inspected scope.
Do not impose a finding quota. Multiple valid solutions can remain optional suggestions
or a requested Variate comparison. Do not suppress observed functional/accessibility
problems because they fail this narrower drift test; report them in their own category.

## Selected handoff, only when requested

A chat finding does not require a plan file. For a requested implementation handoff,
make the selected change understandable without this conversation: target revision,
exact owner/exemplar, evidence, what changes and stays, affected/inheriting consumers,
possibly affected consumers still needing checks, and deliberate exclusions. Include
actual project check commands when known, acceptance conditions and stop conditions
for changed source or ambiguous authority. Unknown checks remain unknown, not invented.
Reuse the existing plan format/location. This does not grant edits during an audit or
require a second approval when the user already authorized the selected implementation.
