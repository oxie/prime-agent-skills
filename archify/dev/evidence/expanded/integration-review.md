# Independent read-only integration review

Scope: `/home/prime-agent/.prime/agent/skill-worktrees/archify-expanded-20260906T221844Z/archify`: SKILL.md, README.md, references/editorial.md, new dispatch/doctor sections of bin/archify.mjs, and the initial bin/editorial-browser.mjs. Read the shared ChromeVisualBrowser close/constructor only to understand inherited resource behavior. No source changes or executable tests. This is source review, not installation approval. Gate/import modules were pending and their temporary absence is **not** a defect finding.

Reviewed snapshot hashes:
- `SKILL.md`: `d4669c69560b2fe5934439914d9941f4b73ef610cd38b2fbd4a835cfd3fcd449`
- `README.md`: `468cb0f9ada49d95f5e819ef854c4752fd1e6a3d8bbb2ebf1cee7735a50827e5`
- `references/editorial.md`: `4e00ab9fae8d63656f3c9aed145cf2964ad28a2546c44591fcd6a05e94facae7`
- `bin/archify.mjs`: `2649df031ce25be4a9ae5d105f044ec4a43028e2b7e5fa59fae73226b6de1088`
- `bin/editorial-browser.mjs`: `dbad526b50ec1273c26e8737e1563650d3b59b32b672defdfaba3661ca497deb`

## Findings

### 1. Medium — screenshot review has no concrete capture path in the initial editorial command

SKILL.md:141 and references/editorial.md:37 ask the agent to inspect actual screenshots after editorial visual-check. In the reviewed browser module, visual-check only appends geometry observations (264–275). `Page.captureScreenshot` is reached only in the explicit PNG export branch (288). No screenshot path is recorded or persisted for visual-check. As written, the agent cannot follow the documented visual-review step using that command's artifacts; a separate manually requested export is not the same as a mobile/desktop whole-page review.

Choose one honest contract: bounded, exclusive screenshot sidecars/capture outputs for visual-check, with ownership and dimensions recorded; or explicit documentation that visual-check is metrics-only, visual review remains pending, and an available approved screenshot method is separately required. Do not imply the current metric receipt contains captures. Parent and browser worker have been told.

### 2. Medium — network receipt can claim blocking enabled when setup failed before blocking

`network = networkEvidence(...)` occurs at browser module:257. `Emulation.setScriptExecutionDisabled`, `Network.enable` and `Network.setBlockedURLs` happen afterward. Finally (:311) reports `httpBlockingEnabled: Boolean(network)`. A failure before setBlockedURLs resolves therefore reports blocking enabled even though only a listener was attached.

Set a dedicated blocking-configured flag only after successful `Network.setBlockedURLs`, and report it separately from listener attachment/observed attempts. The HTTP(S) attempt counter is evidence of those schemes only, not all possible subresource mechanisms. Static-gate protections remain a separate layer.

### 3. Conditional medium — SVG materialization must agree with the gate's permitted CSS geometry

The computed-property list in browser module:166 includes paint/text/transforms but omits `x`, `y`, `cx`, `cy`, `r`, `rx`, `ry`, `width`, `height` and `d`. Export clones attributes/classes but not the outer HTML stylesheet. If the pending gate permits geometry in outer CSS, an accepted figure such as a CSS-sized circle can change shape in the standalone SVG.

Resolve by rejecting unsupported CSS geometry in the gate or materializing permitted geometry properties and testing rendered parity. This is conditional because the gate was not available for review; it is not a claim that current accepted inputs demonstrably bypass validation. Browser worker was informed. Existing root width/height overrides do not solve child shape geometry.

### 4. Low — scale/pixel bounds are implemented but not discoverable where documentation sends the reader

SKILL.md:148 sends readers to references/editorial.md for bounds; that reference (:46–48) instead says to read command help. CLI help only shows `--scale number` (archify.mjs:22). Actual bounds are scale 0.25–4, PNG area 16,000,000 pixels, side limit 16,384 pixels (browser module:11,32–35,284); SVG rejects --scale (:44).

Put these constants and PNG-only scope directly in the reference/help. The implementation is bounded at export capture; this is a documentation loop, not a missing numeric check. Rendering happens before capture-size rejection, so do not claim these caps are a universal browser-memory budget.

### 5. Low — doctor classifies an absent/old Python runtime as a missing package file

The new Python check records `missing: 1` (archify.mjs:1251–1252). Existing summary sums that into `required files missing` (:1366,1375). Thus a fully present package with Python 3.9 yields a false missing-file summary, though its per-check label is informative.

Track runtime absence/incompatibility separately or label it invalid/unsupported. Preserve the accurate distinction that typed rendering needs only Node and browser availability is optional rather than a package-readiness promise.

### 6. Low — final delivery footer still requires an editable JSON path for editorial output

SKILL.md:171 says “Return artifact and editable JSON paths” after both paths. Editorial authoring creates an editable HTML candidate, not necessarily JSON. Change to editable source path(s), naming typed JSON versus editorial HTML and optional imported IR. Do not synthesize a second JSON model just to satisfy the footer.

## Already being fixed; do not duplicate as new blockers

Parent reports browser worker is fixing SVG/background export, local horizontal-scroll metrics/clipping semantics and cleanup. The initial snapshot indeed predates those changes. Review their final tests and updated source rather than treating this report as validation of the fixes. In particular, cleanup failures must not prevent owned temporary-directory cleanup or falsely retain a passing receipt; local scrolling must not be described as all SVG pixels visible at once.

## Strengths and no-issue conclusions

- Main routing and catalogue accurately distinguish five typed renderers, 39 guided layouts, static lint, browser measurements, visual review and import fidelity. No silent replacement of typed diagrams is promised.
- Brand/facts/quantities/unknowns clearly outrank grid/font/palette/deletion preferences. Static-first editorial does not remove existing typed interaction.
- Browser source snapshots bytes, checks exact hash/length in the static receipt, requires managed CSP, checks again after gating, rejects root/no-sandbox, disables page scripts, and requests blocked-network policy before navigating.
- Import/catalogue dispatch preserves the established typed type set. Dynamic imports avoid forcing editorial dependencies into ordinary typed commands.
- New export publication uses a complete temporary file and exclusive hard-link publication, refusing existing paths and symlink ancestors. This is an ownership safeguard, not a whole-filesystem sandbox or immunity from arbitrary concurrent directory swaps.
- PNG dimension checks use measured rendered bounds and verify encoded dimensions; SVG uses DOM/XML serialization, not regex extraction or external font imports. No new dependency installs, network onboarding, profiles, motion, watchers or plugin entry points are introduced in these reviewed files.

## Required final evidence remains root-owned

Run completed native package/gate/import/CLI tests; sandboxed browser checks of all three delivered synthetic demos at recorded mobile/desktop viewports; visual inspection using actual captures; SVG and PNG parity/dimensions (including dark background and fractional scale); missing browser/Python/error cleanup; local scroll versus hidden clipping; preexisting output refusal. Source review alone is not runtime, geometry, accessibility or synchronization evidence.

## Follow-up received after review

Browser worker reports adding computed `x/y/cx/cy/r/rx/ry/width/height/d` geometry to serialization. This is reported by the implementer, not independently rerun here. Worker also confirms visual-check intentionally creates no sidecars under the parent task; `dev/editorial-browser-pilot.mjs` explicitly exports PNG captures into a new evidence directory for manual screenshot review. Therefore finding 1 is a documentation/workflow clarification, not a recommendation to add unrequested sidecars. Document that separate capture path, or mark ordinary visual-check review pending when no captures exist.
