# Hallmark for Prime Agent

A lean, MIT-licensed adaptation of [nutlope/hallmark](https://github.com/nutlope/hallmark).
Optional design guidance, not a standing rule that every page must look different.
Read SKILL.md for the workflow and UPSTREAM.md for provenance and intentional changes.

## Useful requests

- “Use Hallmark to redesign this hero within our existing brand.”
- “Audit this page's visual design; give findings only.”
- “Study this screenshot. Explain the hierarchy and what remains uncertain.”
- “Use Hallmark and Variate for two structurally different options for this file.”

Hallmark chooses and explains the design. Variate handles the file comparison and
acceptance when requested. Neither skill makes conversion or accessibility guarantees
from a screenshot. Project builds and real browser checks remain necessary.

No runtime dependency, provider key, CLI installer, asset download, hook or server.
URL-only study requests a screenshot; there is no unvalidated URL-fetch implementation.
All required design guidance is local; no companion website/assets are needed.

## Validation

From this directory, with Node 22 for the development-only tests:

```
node --test dev/contracts.test.mjs
node dev/native-discovery.mjs .. /absolute/prime-agent/runtime/root
CHROMIUM_BIN=/path/to/chromium node dev/pilot.mjs --variate ../variate --artifacts /absolute/evidence-dir
```

The pilot requires the adjacent adapted Variate skill and a sandbox-capable Chromium.
It uses disposable fixtures, bounded checks and owned process cleanup; not a watcher.
See AUDIT.md for executed evidence and limits. Update through prime-agent-skills:
validate, commit, push the configured origin and verify the remote ref.
