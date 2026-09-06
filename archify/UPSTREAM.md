# Provenance and adaptation

- Upstream: https://github.com/tt-a1i/archify
- Reviewed commit: `c6519401f7b91b9d43011657880893b0a8955548`
- Source subtree: `archify/`
- Upstream version/channel: `2.17.0-dev.1`, development (not a stable-release claim).
- Prime adaptation: `2.17.0-dev.1-prime.1`.
- Upstream MIT LICENSE and THIRD_PARTY_NOTICES.md retained; embedded marks retain
  their own source/license metadata. Archify credits Cocoon-AI's MIT diagram generator.

Retained: five typed renderers, shared geometry/validation, generated validator and
brand data, HTML viewer, schemas, examples, recipes, migrations, architecture compare,
local evidence verification, CLI delivery/check tooling and focused native regressions.

Changed: Prime skill instructions and references; local-only brand resolver;
preview refusal stub; silent no-network/no-state update stub; external font removal
and viewer CSP; default-output extension guard; exclusive random visual sidecar
scratch files; mandatory Chromium sandbox; missing SVG/runtime browser failure;
standalone package scripts/version metadata; development-only acceptance scripts.

Omitted: upstream site, release/install automation, generators requiring development
dependencies, dependency lockfile, full repository test orchestration and unsupported
full-suite tests. No npm dependencies were installed. Source review is not a guarantee
about unexecuted features. See AUDIT.md for measured results and known limits.

Updates are explicit reviewed changes to prime-agent-skills, not a background checker.
Preserve focused local changes when comparing a future upstream revision. Test in an
isolated checkout, review evidence, commit/push and independently verify remote HEAD.
