# Selected GSD Core source and rights

Repository: https://github.com/open-gsd/gsd-core

Reviewed commit: `c9a5cc3e1288b432305aa8eea881fa2eab883083`. The source `package.json`
declares `1.14.0`; no upstream package was installed or executed.

## Selected idea and local adaptation

- [edge-probe.md](https://github.com/open-gsd/gsd-core/blob/c9a5cc3e1288b432305aa8eea881fa2eab883083/gsd-core/references/edge-probe.md):
  lines 62-113 (relevant behavior questions and unresolved choices), 143-155
  (carry the choice into observing checks), 304-307 (character-unit ambiguity).
- [package.json](https://github.com/open-gsd/gsd-core/blob/c9a5cc3e1288b432305aa8eea881fa2eab883083/package.json):
  lines 1-10 establish the reviewed package identity only.

Original local prose adds a small optional behavior-rule contrast to
[product-intent shaping](references/product-intent.md). It distinguishes discovering
unstated meaning from preserving stated requirements and from observing execution.
The combining-accent example and controls are fictional, not executed application
results. Existing Engineering test-design guidance owns oracle/test mechanics; the
current Unlazy route and accepted-decision handoff need no duplicate entrypoint.

No upstream code or substantial instructional passage is copied. The selected
[MIT notice](licenses/gsd-MIT.txt), Copyright (c) 2026 Open GSD, is retained in full.
Earlier owner and source licenses remain applicable. This is not a whole-repository
or dependency-license clearance, endorsement or runtime-compatibility claim.

## Exclusions and evidence limits

No GSD runtime, installer, hooks, provider calls, classifier, fixed taxonomy,
coverage score, backstop schema, mandatory checklist/phase, memory store, SBFL
branch or model trial is adopted. Unknown intent is not settled by a passing test
of current behavior. A known intended rule without runtime evidence is still unverified.
Upstream context/performance claims and completion-with-unverified wording are not
adopted. Existing authority, scope and safety contracts remain controlling.

`gsd-provenance.json` records selected source bytes/ranges and adaptation payload
identities. Earlier provenance remains historical; tests invert only the exact
reviewed transition and leave unknown mutations visible. Deterministic wording,
identity and loading checks do not establish measured agent effectiveness.
