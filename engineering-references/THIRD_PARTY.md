# Selected engineering core — attribution and license notices

**Not a blanket MIT grant.** The original wrapper and three book-inspired references
retain their existing MIT notice in LICENSE. The two added references selectively
adapt material collected by sickn33 and contributors in
[Agentic Awesome Skills](https://github.com/sickn33/agentic-awesome-skills/tree/bdfbf79ccaabdc31f60ce60ef1703a9abe95f9c3).
The collection's original non-code prose is [CC BY 4.0](licenses/CC-BY-4.0.txt);
see its [LICENSE-CONTENT](https://github.com/sickn33/agentic-awesome-skills/blob/bdfbf79ccaabdc31f60ce60ef1703a9abe95f9c3/LICENSE-CONTENT).
Specific third-party rights are preserved below; the collection cannot relicense
material it does not own. Attribution is not upstream endorsement or legal certification.
All material is supplied AS IS, without warranties; full disclaimers accompany licenses.

## Modified for Prime

`references/contract-boundaries.md` and `references/release-dependencies.md` are
selectively rewritten, combined and corrected adaptations, not verbatim source
files or production implementations. The collection itself adapted community
material; our changes retain that history rather than claim original authorship.
Local explanatory contributions to these two references are offered under CC BY 4.0;
underlying MIT/Apache-2.0 rights and notices remain applicable to their portions.

Changes: task-only section selection; explicit state/path evidence; runtime parsing
rather than type casts; cancellation/error distinctions; server-backed retry contracts;
intent lifetime; concurrency/filter reconciliation; intended rollout/flag semantics;
limited revision evidence. Removed mandatory architectures, framework snippets,
fixed task gates, automatic operations and unsupported safety/performance claims.
The three book mini files remain byte-identical to the previous installed version.

## Source mapping

| Added reference | Source and creator | Terms |
|---|---|---|
| Contract boundaries, state/path worksheet | `cross-platform-contract-propagation-audit`, Whxuan0701, via AAS | CC BY 4.0 for original AAS prose |
| Contract boundaries, response and mutation sections | `frontend-data-contracts`, `frontend-optimistic-mutations`, stareezy-1 | MIT, Copyright (c) 2026 stareezy-1 |
| Contract boundaries, interface caveats | `api-and-interface-design`, Addy Osmani | MIT, Copyright (c) 2025 Addy Osmani |
| Release dependencies, diff-to-prerequisite questions | `pre-release-review` and `references/checklist.md`, chaunsin | Apache-2.0 |
| Release dependencies, running-revision distinction | `pre-ship-gate`, Sharrmavishal | MIT, Copyright (c) 2026 Sharrmavishal |

Exact collection paths, pinned URLs, source SHA-256 and installed hashes are in
core-provenance.json. These identify the reviewed inputs, not equivalent current
versions of external repositories. No external implementation scripts or assets
were copied, activated or executed.

## Canonical origin checks and full licenses

- [stareezy-1/frontend-architecture-skill](https://github.com/stareezy-1/frontend-architecture-skill/tree/d7f0c53dcd0c2c43f455bd5ce88aa6797c585fe0), inspected at `d7f0c53dcd0c2c43f455bd5ce88aa6797c585fe0`: [full license](licenses/stareezy-1-MIT.txt).
- [chaunsin/agent-skills](https://github.com/chaunsin/agent-skills/tree/ad4c62f4e49d0cd020e48a4ac8cca7492939053e), inspected at `ad4c62f4e49d0cd020e48a4ac8cca7492939053e`: [full license](licenses/Apache-2.0.txt).
- [Sharrmavishal/operating-kit](https://github.com/Sharrmavishal/operating-kit/tree/1ad1df770e51385bdbf1d8ec568bd6e15d7de8c4), inspected at `1ad1df770e51385bdbf1d8ec568bd6e15d7de8c4`: [full license](licenses/operating-kit-MIT.txt).
- [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills/tree/be4e44a9fbc5e8df0beaefadbb28bd22ee61cc39), inspected at `be4e44a9fbc5e8df0beaefadbb28bd22ee61cc39`: [full license](licenses/addyosmani-MIT.txt).

The four canonical source trees were inspected for additional NOTICE files; none
were present at those checked revisions. Original data-contract, mutation, interface
and pre-release files were located there. operating-kit exposes the live-verification
principle in `.cursor/rules/ship-and-recover.mdc`, not a same-named pre-ship skill;
we attribute the AAS adaptation separately and do not claim byte identity or original
source authorship for all AAS additions. These canonical checks resolve the declared
license notices; the selected content pin remains the AAS commit above.

Updates are manual and require review of changed bytes, notices and target contracts.
No automatic fetch, AAS installer, Core/MCP runtime, dependencies or update service.

Later direct Addy retry/migration sections and the telemetry reference have separate
[mappings and modification notices](ADDY_SOURCES.md) and addy-provenance.json.
Original AAS/canonical source identities above are preserved. Current core file
hashes and their pre-addition hashes are recorded in core-provenance.json.

## RampStack selective adaptation

Corrected guidance from RampStack Co.; see [source notes and MIT attribution](RAMPSTACK_SOURCES.md).
This does not grant rights to any third-party asset mentioned in the sources.
