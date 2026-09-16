# Chisle source review and selection

Reviewed [JayPokale/Chisle](https://github.com/JayPokale/Chisle) v3.3.0 at
`c40fc65e2a65ec1285aac2a018568db8af86d41a`. This is an original optional Prime documentation addition,
not Chisle installation, copied implementation or author endorsement.

## Selected evidence

- [Compression core](https://github.com/JayPokale/Chisle/blob/c40fc65e2a65ec1285aac2a018568db8af86d41a/hooks/chisle-compress-output.js): lines 153–171 normalize display text; 194–224 track same-session hashes; 247–268 prune/store spills; 329–336 spill after normalization; 351–366 preserve recognized output shapes. Recovery is useful, but a transformed copy, expired reference or failed spill is not guaranteed original evidence.
- [Pi adapter](https://github.com/JayPokale/Chisle/blob/c40fc65e2a65ec1285aac2a018568db8af86d41a/pi-extension/index.js): lines 74–78 and 108–120 reset deduplication across lifecycle changes; 147–178 use earlier-turn results and preserve non-text blocks. These host-specific defenses are evidence for a principle, not portable Prime code.
- [Compression tests](https://github.com/JayPokale/Chisle/blob/c40fc65e2a65ec1285aac2a018568db8af86d41a/tests/test_compress.js): lines 279–297 check a clean-text spill; 328–335 intentionally retain compression when spilling fails. The clean-text case does not test preservation of pre-normalization bytes.
- [Pi tests](https://github.com/JayPokale/Chisle/blob/c40fc65e2a65ec1285aac2a018568db8af86d41a/tests/test_pi_extension.js): host-mock coverage of status/content and lifecycle behavior, not Prime compatibility or a model-effectiveness result.

## Local decision and limits

The appended section in [token economy](references/token-economy.md) explains compact
views versus authoritative evidence, producer status versus filter status, exact-data
exceptions, authorized recovery and current-context availability. Its build/duplicate
examples are original fictional cases, not executed upstream regressions. Existing
bounded automatic evidence and privacy/retention rules remain authoritative; this adds
no raw-success-log mandate or storage system.

Rejected: persistent terse persona, rigid response/test limits, cross-agent installer,
automatic compression, hooks, extensions, update lookup and benchmark savings claims.
No upstream code or generated answer was executed. Deterministic local wording,
identity, history and packaging checks do not prove live compression, model compliance,
security or cost savings. Source review is not runtime validation.

chisle-provenance.json records exact inspected source identities and current local
payload hashes. Existing source pins, notices and historical assertions remain intact.
Updates and removal use the approved skill-maintenance workflow; remove only this
addition and its source/test records, not unrelated Unlazy content.

## Rights

Upstream [LICENSE](https://github.com/JayPokale/Chisle/blob/c40fc65e2a65ec1285aac2a018568db8af86d41a/LICENSE)
is MIT, Copyright (c) 2026 Jay Pokale. It requires retaining copyright and permission
notices in copies or substantial portions and disclaims warranty. No upstream code or
substantial prose is copied here; the original guidance uses this toolkit's MIT terms.
MIT is not proof of compatibility, benchmark truth or clearance for third-party
prompts, model outputs or private transcripts. No such material is imported.
