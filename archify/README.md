# Archify — one technical and editorial diagram package

Use **Archify** for technical diagrams, publication figures, charts and local diagram
imports. One skill, one CLI, two distinct evidence contracts. See [SKILL.md](SKILL.md).

| Mode | What it does | Evidence |
|---|---|---|
| Typed | Five architecture/workflow/sequence/dataflow/lifecycle renderers | Schema/geometry checks and exact-byte delivery receipts |
| Editorial | Agent-authored static HTML/SVG across 39 curated layout guides | Conservative static checks, explicit browser measurements and separate visual review |
| Import | Bounded local Mermaid and draw.io extraction | Extracted IR and a human/agent-reviewed fidelity ledger, not automatic typed conversion |

Run `node <skill-dir>/bin/archify.mjs catalogue --json` to see the distinction.
A layout guide is not an additional deterministic renderer. No second skill entry
point or automatic switch of existing typed projects is installed.

## Runtime and boundaries

Node >=18 for the CLI; Python >=3.10 for imports/editorial checks. Standard libraries
only. No npm/pip install is needed. Browser checks and PNG/SVG editorial exports need
an existing compatible sandboxed Chromium, as a non-root user. `ARCHIFY_CHROME` may
name that trusted executable; `ARCHIFY_PYTHON` may name the selected Python interpreter.
Missing tooling is reported, not installed automatically.

Use absolute packaged CLI paths from the target project. New editorial/import/export
outputs must not exist. Preserve user files; use new revision paths rather than
removing files to bypass ownership checks. Browser commands inspect only successfully
delivered checked static snapshots. No watchers, server, wake jobs, remote fonts,
remote brand capture, automatic updates or global profile/style writes.

Branding is local to the requested artifact and comes from approved project tokens.
Familiar fonts, white backgrounds or dense required topology are not inherently wrong.
Never alter real quantities, erase technical edges or invent facts for visual neatness.

## Commands and maintenance

See [imports](references/imports.md), [editorial delivery/export](references/editorial.md),
and [the catalogue](editorial/references/catalogue.md). Existing typed commands and
interactive reader remain available. Editorial exports include the primary diagram,
not surrounding editorial HTML. New editorial figures are static, without a motion
controller; existing typed interaction is unchanged.

Developer tests run via `npm test`; real-browser tests are separate explicit commands.
They must run in disposable projects/profiles and clean owned processes. No test is a
startup hook. Do not present structural lint, DOM checks or a screenshot as universal
security, accessibility, design quality or chart-math certification.

[UPSTREAM.md](UPSTREAM.md) records both pinned sources and local differences.
[AUDIT.md](AUDIT.md) records measured evidence and untested scope. Archify's [MIT
license](LICENSE) and [third-party notices](THIRD_PARTY_NOTICES.md) remain; the curated
Diagram Design material has its own retained MIT notice. No new icon bundle is copied.
