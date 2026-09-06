# Archify for Prime Agent

On-demand, local diagram generation from typed JSON. Supports architecture,
workflow, sequence, dataflow and lifecycle diagrams. The standalone HTML contains
inline SVG and an interactive reader. See [SKILL.md](SKILL.md) for the workflow.

## Runtime

Node >=18; no npm install or runtime dependencies. Browser checks use an existing
sandboxed Chrome/Chromium as a non-root user, without a server or browser package.
Run the absolute `bin/archify.mjs` path from the target project. Use explicit artifact
paths and `deliver` for final deterministic acceptance. Opening/exporting a diagram
is not proof of its facts or correctness.

## Prime changes

- No update networking, remote brand capture, external fonts or live watcher preview.
- Embedded brand IDs remain optional; separate trademark/license terms apply.
- Generated viewer has an offline-oriented CSP; it is not a sanitizer for arbitrary HTML.
- Default output receives resolved-extension checks. Existing alias/staged-delivery
  safeguards remain. Sidecar temporary files are exclusive and randomly named.
- Real visual checks require a rendered SVG and initialized reader runtime. Sandbox
  disabling is refused. Machine evidence remains distinct from visual review.
- Concise Prime instructions preserve truth, project scope, output ownership and
  nonblocking process control. No Claude hooks, background agent or autoinstall.

## Verification

From this directory, `npm test` runs the retained dependency-free regression subset
and Prime contract tests. `npm run test:browser` runs a bounded real-browser pilot
when `ARCHIFY_CHROME` points to an installed trusted executable. It writes development
evidence under `dev/evidence/browser`, uses disposable fixtures/profiles and exits.
These are developer commands, not startup hooks.

Upstream generator, full-site/release tests and development dependencies are omitted.
If schemas or built-in brand data change, regenerate in a separately reviewed pinned
upstream development checkout, review the generated diff, and rerun local validation.
Never edit generated validators merely to bypass a failing input.

See [AUDIT.md](AUDIT.md) for exact executed evidence and limitations, and
[UPSTREAM.md](UPSTREAM.md) for the pinned development snapshot and adaptation scope.
The Archify MIT [license](LICENSE) does not replace [third-party terms](THIRD_PARTY_NOTICES.md).
