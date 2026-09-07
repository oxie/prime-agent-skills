# Editorial delivery and exports

Archify has one CLI but distinct evidence contracts. Five typed renderers validate
JSON and geometry. The editorial path is agent-authored static HTML/SVG with
conservative resource/markup/structure checks. Layout guidance is not a renderer.

## Local files and ownership

Use `node <skill-dir>/bin/archify.mjs editorial check candidate.html --json`, then
`editorial deliver candidate.html new.html --json`. New editorial destinations must
not exist. Do not delete existing files to defeat that protection. Keep the editable
candidate and the successful receipt; inspect exit code and exact input/artifact
hashes. Failed delivery is not success even if an older output is visible.

The gate intentionally rejects active HTML, external resources and ambiguous syntax.
Source and delivered HTML are each limited to 1 MiB. The conservative checker also
bounds document nodes, nesting and supported reference expansion; these are not a
universal browser-memory limit. Use one primary SVG with a positive finite viewBox,
unique IDs, authored title/desc,
visible text and safe static geometry. Do not inject arbitrary upstream SVG/XML.
Do not weaken the gate just to accept a copied example. Draft placeholders must be
replaced. Approved project colours and available system font stacks are allowed;
fonts are configuration, not proof that a particular font supplied every glyph.

These checks are conservative lint, not a complete browser sanitizer. They do not
prove correct values, area/axis encoding, content meaning, label placement, contrast,
accessibility or mobile fit. Check chart values and layout against the source and
inspect rendered output separately. No script/motion is added to editorial figures;
existing typed Archify interaction remains available on its own path.

## Browser evidence

`editorial visual-check delivered.html --json` uses an installed trusted Chromium,
non-root sandbox and a private snapshot/profile. No dependency installation, server,
watcher or autowake. The browser path validates the snapshot before navigation,
blocks external requests and disables document scripts. Missing tooling is blocked,
not passed. A success describes only the recorded checks/viewports. Mobile vertical
scrolling can be appropriate; clipping and illegible text are not repairs.

Visual review is separate. Add `--capture-dir <NEW-directory>` to the visual-check
command to capture screenshots. Without it the check emits metrics only. Existing
directories are refused. A failed capture may retain an explicitly reported incomplete
new evidence directory; do not mistake partial screenshots for a passed run.
Open actual screenshots with an image-capable tool, and
state the observations. Avoid claims about untested interactions or screen readers.

## Explicit exports only

`editorial export delivered.html new.png --scale 2 --json`
`editorial export delivered.html new.svg --json`

These export the **primary diagram SVG**, not outer headings, cards or the whole page.
The caller must explicitly request export. The output path must be new. PNG scale accepts finite fractional values from 0.25 through 4 (default 1).
Exports are capped at 16 million pixels and 16,384 pixels per side. Scale applies
only to PNG. Never allocate arbitrary canvas sizes from untrusted values. PNG dimensions are based on the rendered SVG bounding
box and scale, not an assumed viewBox-to-pixel equality. Verify actual reported PNG
pixel dimensions for exact-size requests. Chromium may quantize a fractional clip;
when necessary the bounded exporter normalizes that small rounding difference to
the requested integer pixel dimensions and records the normalization in its receipt.
This is not a guarantee of byte-identical pixels across browsers or hosts.

SVG export uses DOM/XML serialization with materialized style values, not regex
extraction plus a remote Google Fonts import. It retains meaningful SVG title/desc and
internal definitions. Standalone SVG export refuses a transformed root SVG to avoid
double-scaling its measured bounds; move supported transforms to child groups or use
PNG when the root transform must remain. Font availability still affects portability; no universal
Figma/Illustrator/font-fidelity claim. Verify the target consumer when required.

An export is a communication asset, not typed validation or proof of the diagram's
facts. No video, clipboard, remote onboarding or automatic font packaging is included.
