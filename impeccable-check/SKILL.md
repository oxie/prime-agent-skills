---
name: impeccable-check
description: >
  Run an explicit, bounded Impeccable source or static-HTML check for mechanical UI
  observations. Use when the user requests Impeccable detection, a deterministic
  source UI check, or a selected-file anti-pattern scan. Optional and read-only:
  not a universal frontend router, design verdict, accessibility certificate,
  automatic fixer or full rendered detector. Can pair with the shared browser-check
  skill for separately labeled browser-assisted review.
license: Apache-2.0
compatibility: Linux x86_64, Python 3.12+, Landlock ABI 4, and separately verified pinned native runtime.
metadata:
  version: 1.0.1
---

# Impeccable Check

**Source/static HTML only.** Use the verified pinned runtime at
`~/.local/share/prime-agent/impeccable-tools`. Never download, build or update on
invocation. If it is missing or its hash differs, stop. Read
[setup and rollback](references/setup.md) for controlled installation.

1. Confirm the ordinary canonical Git root and 1–16 explicitly selected UTF-8 files.
   Read [usage and limits](references/usage.md) before the first scan.
2. Keep design guidance independent: take a first look using the actual product
   brief and, when useful, Hallmark. Do not pre-judge the detector result.
3. Run the explicit script, resolving this skill's own path:

```text
/usr/bin/python3 -I /absolute/impeccable-check/scripts/check.py source --root /canonical/project --file src/page.html --file src/page.css
```

4. Reconcile evidence with the brief. Report rule ID, file, snippet, uncertainty,
   and coverage. Style observations are advisory, never authorship evidence.
   A `quality` category is still a heuristic, not an objective defect by itself.
   Do not edit source, add waivers, or turn findings into blanket design bans.

Exit `0`: complete supported scan, no primary findings (advisories may exist).
Exit `2`: primary heuristic findings. Exit `1`: operational error/incomplete scan;
never call this clean. JSON includes source hashes, scope, actual event counts,
findings, primary/advisory counts and errors. A clean result is not a quality or
WCAG certificate. Existing design specialists remain independent owners.

## Optional browser-assisted review

The automated `rendered` command remains **unsupported** and refuses before HTTP or
browser launch. The unfinished custom rendered backend was discontinued in favor
of the shared [Browser Check skill](../browser-check/SKILL.md).

For an authorized owned local preview, run Browser Check separately for screenshots,
DOM observations and explicit interaction tests. Its fresh browser does not replace
or bypass this detector's confinement. Keep three result sections:

1. **Automated source findings:** this checker's rule IDs and actual coverage.
2. **Browser observations:** screenshot hashes, viewport, actions and observed facts.
3. **Not tested:** native Impeccable rendered detectors and any unexercised behavior.

Do not turn browser observations into native detector results, invent executed counts
or claim paired-pixel/contrast checks ran. Hallmark can interpret visual evidence;
existing design and project owners stay unchanged. Browser execution/actions need
applicable authorization even though the source scan is read-only.
