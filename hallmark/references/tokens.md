# Reuse tokens; export only when requested

The project's current token source is authoritative: CSS custom properties, Tailwind
configuration/@theme, DTCG, component tokens or another established pipeline. Preserve
its names, imports, scope, dark-mode strategy and version. Do not always add tokens.css
or four exports. Small component changes should not create a second token authority.
Read an existing design/token document before editing and preserve unrelated sections.

## Scoped changes

- Reuse semantic roles instead of scattering new colour/spacing literals. Existing
  colour formats are valid; an OKLCH conversion is not required for visual quality.
- Add a token only for a real missing role within authorized scope. Avoid global resets,
  append-only duplicate root rules and unrelated palette changes.
- Named theme palettes are suggestions, not automatically contrast-validated systems.
  Measure actual foreground/background state pairs after use.
- No token or global stylesheet changes during an open Variate single-file round.

## Explicit exports

Inspect the consumer and version before emitting a format. Do not offer universal
copy-and-paste mappings from upstream. Verify the result with that consumer's native
parser/build, including dark mode and all used aliases.

- **CSS:** use the project's real custom-property strategy. `oklch(...)` is a CSS
  function; `color(oklch ...)` is not a valid substitute.
- **Tailwind:** v3 config extension and v4 `@theme` are different interfaces. Inspect
  current imports and conventions; do not disrupt the framework entry stylesheet.
- **shadcn/ui:** inspect the installed components and CSS. Some systems consume full
  colour functions; older systems wrap channel values. Match the consumer, not a
  universal bare-triple recipe.
- **DTCG:** choose the requested specification/consumer version and validate it. Modern
  colour values use structured colour-space objects; dimensions/durations use their
  defined structures. Do not label arbitrary CSS strings “canonical DTCG”. If no
  validator is available, mark the export unvalidated and do not claim compatibility.

A requested portable `design.md` can record roles, actual token sources, approved
palette/type, component contracts and measured evidence. Do not embed every export or
record guessed contrast as a pass. Preserve existing sections and omit sensitive data.

## Document claims and export loss, only on request

For a requested design document, keep each normative claim tied to its governing
source and actual product scope. Check that the product consumes that source through
imports, aliases, theme resolution or a shared owner; disconnected examples do not
establish its system. Record role, value, source, scope and confidence in the existing
task evidence when useful. Repetition alone does not turn page-local literals into a
global scale, and visual impressions do not establish undocumented brand intent.
Distinguish current accepted rules, measured observations and proposed changes.

Preserve accepted decisions and alternate-theme values unless current authority
explicitly replaces them. Resolve conflicting sources rather than silently choosing
the most repeated value. A screenshot cannot establish exact CSS values or internal
token names. Supplied source and authorized local evidence may resolve these facts;
this reference adds no public crawling or arbitrary computed-style tool capability.
If evidence is absent, scope or omit the claim and explain the uncertainty.

Keep the project's existing document format, token names and consumer version. Do
not require a DESIGN.md alpha schema, external CLI, fixed section order or new file
for ordinary UI work. Preserve provenance where the project wants it without copying
private source locations into a public document.

For an explicitly requested export, define expected tokens/categories, values, aliases
and theme modes before conversion. Inspect actual emitted content with the selected
consumer's native interface; command success alone does not prove complete conversion.
Compare the prior accepted document and the new output for dropped or changed meaning.
A missing font category, unresolved alias or lost alternate theme is an explicit loss,
not a passing export. Preserve supported information and report unsupported conversion;
do not delete it merely to silence a validator or retry an incompatible format forever.
No package installation or export execution is authorized by this note. Unavailable
validation remains unvalidated, not a reason to conceal the requested draft or its limits.
