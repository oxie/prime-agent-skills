# Source and adaptation

Source: https://github.com/ciembor/agent-rules-books
Pinned commit: `893a88a6fce3a80c565bf39ac65021b43a8b2990`
License: MIT, Copyright (c) 2026 Maciej Ciemborowicz. The original license is
included in LICENSE and must accompany copies or substantial portions.

## Included material

| Local reference | Pinned upstream file |
|---|---|
| references/release-it.md | release-it/release-it.mini.md |
| references/data-intensive-applications.md | designing-data-intensive-applications/designing-data-intensive-applications.mini.md |
| references/legacy-code.md | working-effectively-with-legacy-code/working-effectively-with-legacy-code.mini.md |

Only each first heading was changed from `OBEY ...` to a scoped-reference title.
The rest of each mini file is unchanged. provenance.json records original and
installed SHA-256 hashes and headings. SKILL.md is the local Prime adaptation:
one task-selected reference, existing instructions first, no mandatory cleanup
or architecture, and no new operational authority.

These are unofficial, chatbot-assisted engineering instructions inspired by
Release It! (Michael T. Nygard), Designing Data-Intensive Applications (Martin
Kleppmann), and Working Effectively with Legacy Code (Michael Feathers). They
are not original book text or author/publisher-endorsed material. The repository's
internal traceability is not independent verification of book fidelity. No legal
clearance or measured Prime effectiveness is claimed.

## Excluded

The other eleven packs, full/nano variants, compatibility matrix, extraction and
release workflows, npm installer, editor configuration, hooks and global rules
are not installed. No runtime dependency or automatic updater is required.

## Selected engineering core extension

Version 1.1.0-prime.1 adds two independently worded, corrected references:
[contract boundaries](references/contract-boundaries.md) and
[release dependencies](references/release-dependencies.md). They are not book minis.
The original three minis, LICENSE and provenance.json remain unchanged.
See [THIRD_PARTY.md](THIRD_PARTY.md) and core-provenance.json for the seven selected
AAS sources, canonical origin checks, distinct licenses and modification notices.
No AAS runtime, installer, MCP manager, provider SDK or global process is installed.

## Maintenance and removal

Updates are manual: review a new upstream pin and selected changes, preserve
local scope protections, update provenance, and run the content/discovery checks
before the normal approved Git synchronization workflow. Do not fetch new
upstream content automatically during ordinary use.

Remove the engineering-references directory through that same approved workflow
to remove the skill. No settings, database, background process, or dependencies
need undoing. Other sessions pick up discovery changes on their next reload/start.

## Four-priority batch: API and SQL (1.2.0-prime.1)

Adds two narrowly routed references, with distinct [source and license notices](NEXT_SOURCES.md)
and next-provenance.json. Existing reference content and historical evidence remain
unchanged. No runtime, installer, provider, framework project or Astro skill is installed.

## Selected Matt Pocock additions (1.4.0-prime.1)

Adds four corrected on-demand references for debugging, test design, interface
comparison and domain terminology. [Source notices](MATTPOCOCK_SOURCES.md) record
the exact selected sources and MIT terms. No upstream setup or workflow runtime
is installed. Existing references and historical provenance remain unchanged.

## Selected Superpowers additions

See [SUPERPOWERS_SOURCES.md](SUPERPOWERS_SOURCES.md) for the exact pin, MIT notice,
selected mechanisms and local exclusions. This is an extension under the existing
owner, not installation of an upstream process bundle or evidence of measured gains.
