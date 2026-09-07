# Offline diagram import

`archify import` extracts source evidence. It does not render diagrams, execute
Mermaid, call a browser, fetch URLs, install tools, or convert to Archify typed JSON.
The returned extractor IR is **not** valid `archify render` input. Read and verify
it, then explicitly model the intended diagram using Archify's typed schema or
the separately checked static editorial path.
Never execute or interpolate imported labels, links, styles, or attributes as code.

## Commands

```text
archify import --help
archify import mermaid source.mmd
archify import mermaid notes.md --diagram all --out new-evidence.json
archify import drawio source.drawio --page all
archify import drawio source.drawio --page "Page name" --out new-evidence.json
archify import mermaid source.mmd --timeout-ms 20000
```

- Mermaid extensions: `.mmd`, `.mermaid`, `.md`, `.markdown`, `.mdown`, `.mkd`.
  Markdown must contain fenced Mermaid blocks.
- Mermaid selector: `--diagram N|all`. Draw.io selector: `--page N|NAME|all`.
  Indices start at zero. The default is the first diagram/page. All source
  blocks/pages are parsed before selection; a bad unselected block can still fail.
- Default stdout is the extractor JSON IR, unchanged. No sidecar is created.
- `--out` must name a **new** lowercase `.json` file. Input must be a regular,
  non-symlink file. Existing outputs, hard-link aliases, symlinks (including output
  directory ancestors), directories, and overwrite attempts fail. The wrapper
  writes a same-directory exclusive mode-`0600` scratch file only after successful
  parsing, fsyncs and closes it, then publishes with an exclusive hard link. Existing
  destinations are never replaced. This publishes complete bytes, not directory-entry
  crash durability. Cleanup failure is a nonzero result and states whether complete
  output was already published; do not infer rollback from that failure.
  Parent directories must already exist. Successful `--out` produces no stdout.
- `--timeout-ms` is an integer from 1 through 30000; default 10000. Unknown,
  repeated, or incomplete flags fail. Prefix dash-leading input paths with `./`.
- Python 3.10+ is required. The wrapper uses `python3` with `-I -B` (isolated mode,
  no bytecode files). `ARCHIFY_PYTHON` can name one explicit executable; it is not
  a shell command and cannot contain interpreter arguments. This is a trusted
  operator setting, not a diagram-controlled value. Missing Python is a blocked
  prerequisite, never permission to install it or to fetch a fallback tool.

## Boundaries and receipts

The Node wrapper uses argv-based `spawn`, never a shell. It caps combined process
stdout/stderr at 16 MiB and kills the extractor when its timeout or output limit
is reached. No partial IR is emitted on parser failure. Failure stderr is one
JSON receipt with `command`, `ok: false`, `error`, and `detail`; parser diagnostics
are escaped as JSON text and truncated to 8192 characters. Exit codes:

| Code | Meaning |
|---|---|
| 0 | IR or help emitted; or new output file written |
| 2 | Arguments, path, parser, output, output-limit, or invalid-IR failure |
| 3 | Python executable unavailable/blocked |
| 124 | Extractor timeout |

The Python parsers use only the standard library. Mermaid source is capped at
4 MiB, 2000 nodes, and 5000 edges per diagram. Draw.io source is capped at 32 MiB;
each inflated XML/PNG metadata payload is capped at 64 MiB. Actual reads and
inflations are bounded, not only file-size checks. Draw.io has no independent
node-count cap; the command timeout/output cap still applies. XML DTD and entity
declarations are rejected before XML parsing. Invalid UTF-8, including decoded
percent escapes, fails instead of silently replacing source facts. Python does
not evaluate labels, click targets, style values, entities, or JavaScript.

These are bounded offline parsers, not an OS sandbox. They assume a stable local
input and output directory during a command. Concurrent malicious replacement of
parent directories is outside this filesystem API's guarantee. An intentionally
configured alternate executable is trusted operator code.

## Fidelity ledger: retain, simplify, discard, unknown

| Source | Retained evidence | Simplified/discarded or unknown |
|---|---|---|
| Mermaid flowchart/graph | IDs, label text, shape family, directed links, edge labels, subgraph membership, direction | Source layout absent; style and click statements counted/discarded; icon/image URLs and renderer config discarded; not every Mermaid construct is supported |
| Mermaid sequenceDiagram | Actors/participants, aliases, message order, arrow/style family, fragment labels/regions, notes | Activation/deactivation, exact lifelines and fragment geometry absent; fragment records do not map complete execution semantics |
| Mermaid stateDiagram-v2 | States, transition labels, composite parents, start/end markers, fork/join/choice hints | No full state execution model; each start/end endpoint gets a generated node; some notes/concurrency syntax can be omitted |
| Mermaid erDiagram | Entity IDs, field text, relationship label/cardinality text | No typed ER field/cardinality schema, validation, or exact layout |
| draw.io | Pages, node IDs, plain labels, inferred shape families, parent links, basic geometry/style hints, UserObject attributes/link strings, edges, structural counts | HTML labels flatten; only selected styles retained; endpoint references outside known nodes become null; waypoint count rather than coordinates; custom icons not rendered; no promise of pixel or geometry fidelity |

Supported Mermaid families are **flowchart/graph, sequenceDiagram,
stateDiagram-v2, and erDiagram**. Unsupported families such as pie, mindmap,
classDiagram, gantt, and legacy stateDiagram fail. This is a partial grammar,
not Mermaid's official parser: some unrecognized statements within supported
families are silently omitted. In particular, put the family header on its own
line; source statements on that header line are not imported. Unknown statements
have no complete IR ledger. Compare source node/edge counts and every meaningful
label/quantity manually; a zero exit code proves parsing, not complete fidelity.
Do not invent missing facts or infer a real execution trace from source order.

Draw.io accepts raw `mxGraphModel`/`mxfile`, deflate+base64 payloads, and PNG/SVG
with embedded draw.io metadata. Generic images are not recognized. PNG processing
extracts metadata; it does not validate/render the image. Empty/unknown page cells
can yield empty IR. Recursive nested-parent geometry in the pinned implementation
can accumulate coordinates incorrectly; treat geometry as a hint and verify it
against source before any redraw. Structural analysis/type candidates are
heuristics, not an approved architecture or a guaranteed layout.

Draw.io link/attribute strings can contain active-looking values such as
`javascript:`. They remain inert strings in IR. HTML entities can decode to
active-looking label text. JSON encoding is not permission to insert that text
into HTML without safe text escaping. Imported facts, names, numbers, and unknowns
must be verified before any manual redesign or information reduction.

## Source, license, and local changes

Upstream: https://github.com/cathrynlavery/diagram-design

Pinned commit: `3b446333f164174a571106673f943c58df282ff8`.
Sources: `skills/diagram-design/scripts/drawio_extract.py` and
`skills/diagram-design/scripts/mermaid_extract.py`. The upstream MIT license,
Copyright (c) 2025 Cathryn Lavery, is reproduced at `imports/LICENSE`.

`mermaid_extract.py` is byte-identical to the pin. `drawio_extract.py` has two
focused safety changes: bounded actual source read after the size check, and
strict UTF-8/percent-escape decoding for raw, inflated, and PNG-embedded text.
No rendering rules, IR fields, graph algorithms, or grammar rules were changed.
The wrapper validates JSON, so non-finite draw.io numeric values that serialize
as nonstandard JSON also fail rather than being silently transformed.

Bundled SHA-256:

```text
1531c28f686f61fdd70bc755f38da68829ff21d12ee308072ef02c8f723255d5  imports/drawio_extract.py
83294bfd3a7471ec272ef55005d889088823cedcb3cfbbae706acf944d2a362b  imports/mermaid_extract.py
```

## Native tests

Run from the Archify directory:

```text
node --test dev/imports.test.mjs
```

Tests use synthetic fixtures and bounded native Node/Python subprocesses only.
They exercise the `runImport(args)` seam and automatically use `bin/archify.mjs`
when present. `ARCHIFY_TEST_CLI` can name the intended root CLI explicitly. When
no root CLI is present, a private generated dispatch stub tests the same seam;
that is not a claim that the real root CLI was tested. No dependencies are
installed. Temporary fixtures are removed after the suite.
