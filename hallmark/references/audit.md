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
