# ReUI starter verification

Validated manually as prime-agent on Node22.22.2, npm10.9.7 and private sandboxed
Chrome153.0.8010.36. This is a small selected source library, not certification of
all ReUI or future consumers. No provider, MCP, remote API or external media used.

## Native results

- Project-local dependency install with lifecycle scripts disabled: exit0.
- npm audit snapshot: exit0, zero reported vulnerabilities (not perpetual safety).
- TypeScript strict project typecheck and Vite production build: exit0.
- Vitest: 26/26, comprising21composition and5primitive/source checks. Checks cover
  real callback payloads, invalid/no-dispatch, pending/double-submit, rejection/retry,
  per-instance links, initial-value semantics, filtering, actual stable tie order,
  row DOM identity, state callbacks/roles, panel semantics, BaseUI ref/disabled
  forwarding, error-array dedup/empty cases and custom semantic namespace guard.

A fresh source-only copy of the installed starter also passed offline npm ci with
scripts disabled,26/26 tests and the strict typecheck/production build. Its main
app JS/CSS matched the rendered candidate byte-for-byte. The fresh consumer host
fixture was rebuilt and rendered too; both expected colors remained present.
Installed packaging/native-discovery checks passed6/6; related existing checks
passed35/35. These are bounded task checks, not a full harness/daemon health check.

## Rendered evidence

Owned production preview at127.0.0.1:5179. Screenshots were opened and inspected;
completed reports had no page errors and verified owned browser cleanup.

- 1440x1100: local profile save and displayed saved output, owner filtering and
  descending row order. No page-level horizontal overflow in the captured DOM.
- 390x844 with reduced-motion preference: visible skip-link and invalid-field focus,
  dark theme, linked visible error, accepted local-domain email and long saved name
  wrapping in the output. No page-level horizontal overflow in captured DOM.
- 320x844 with reduced-motion preference: narrow layout/table wrapping and state
  surface inspected. The bounded Panel body may scroll; no root overflow clipping.
- 900x700 host fixture: before the semantic prefix fix, neither expected background
  appeared. Afterward, screenshot contains13,887 exact orange pixels (#d95f02) for
  the host button outside the wrapper and13,641 blue pixels (#244fa8) inside. Both
  images were inspected. Restored host orange is the regression result; the new ReUI
  utility supplies a separate positive blue control. This is not arbitrary CSS isolation.

## Review and corrections

Independent source review verified real ReUI reuse, notices and contracts. Corrections
include native rather than dot-required email validation, correct notice links,
accurate Node engine range, custom semantic theme namespaces and filtering blank
FieldError messages before deduplication. Host and RSC integration limits are explicit.

The empty-alert negative test reproduced the bug. Its initial run also exposed a
separate test-only Vite URL asset transform error; a project-relative native read
fixed that harness issue without weakening assertions. Initial imports failed before
builder files existed; that is construction evidence, not a product bug reproduction.
One early narrow action run was incomplete when a retry selector was absent after an
out-of-viewport click. A separate run with explicit viewport scroll exercised the
actual error and retry states successfully. The failed run remains in private task
evidence; it was not relabelled as passing. Shared browser tooling was not patched.

## Limits and reproduction

No real screen reader, full keyboard matrix, exhaustive contrast audit, text zoom,
performance trace, RSC/Next integration, backend or model-efficacy trial was performed.
Declared wider Node compatibility comes from dependency engine intersections; only
Node22.22.2 was run. Native and rendered evidence have separate meanings.

See [starter commands and API boundaries](assets/starter/README.md) and
[the host fixture](assets/starter/tests/fixtures/README.md) to repeat the relevant
checks. Installed packaging/native discovery and authoritative Git synchronization
are verified separately in the task publication evidence; they do not run the app
on skill load. Dependencies and generated dist remain outside the installed checkout.
