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
