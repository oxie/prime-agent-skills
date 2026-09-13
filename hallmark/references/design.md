# Design and redesign

## A small sequence

1. Inspect the named files, surrounding components, current token sources and native
   commands. Preserve the framework, data flow, links and content contracts.
2. State one design question and a file-level scope. Do not widen a component request
   into a page, replace a page tree, or remove production code without authorization.
3. Choose a structural response before ornament. Explain one tradeoff: scanning vs
   narrative, density vs breathing room, immediate action vs deeper explanation.
4. Implement within the existing system. Create extra files only when necessary for
   the requested outcome. Prefer semantic HTML and the project's component primitives.
5. Check actual behavior/rendering using verification.md, then review the diff.

## What a good direction specifies

- **Hierarchy:** first thing to read, second thing to understand, primary action.
- **Composition:** a concrete arrangement (e.g. left task summary/right working demo),
  not just adjectives such as “clean”, “premium” or “modern”.
- **Type and space:** use the current scale, sensible line lengths and content-led
  breakpoints; allow long labels, translations and intentional italic type.
- **Colour:** assign semantic roles and preserve an existing palette. New colour is
  not a substitute for structure. Suggest theme rows only when the brief allows it.
- **Interaction:** show real states and preserve their behavior. An unwired prototype
  is labelled as such; never report a fake submission as success.

## Existing systems

Do not rotate the theme/navigation between pages of the same product. Shared components
stay shared. A local redesign must not add root resets or shadow shared tokens. If the
best option requires a shared change, describe it and handle it outside any open
single-file comparison round, within the user's approved scope.

## New projects

Infer reasonable choices from a useful brief rather than requiring an interview.
Use a simple native implementation that fits the request. If no stack was selected,
choose a low-cost reversible baseline; do not scaffold a framework just for a mockup.
A meaningful prototype may be static, but label absent backend behavior and real-asset
placeholders. Do not present invented testimonials or numbers as production copy.

## Marketing context

Use supplied positioning and `.agents/product-marketing.md` when relevant. For an
actual messaging rewrite, load the installed copywriting skill rather than inventing
claims. Use the CRO skill for conversion hypotheses and analytics/ab-testing for
measurement. Hallmark's visual judgement is not conversion evidence. Load only the
skill needed for the requested subtask; do not fan out across the marketing catalogue.

## Reference-led direction, when relevant

For a requested new direction or reference-led redesign, use
[reference synthesis](reference-synthesis.md) to preserve the primary traits, bound
secondary borrowing and specify media roles. Keep a brief task-local lock, not a new
mandatory research or approval stage. Compare those commitments during existing QA.
