# Independent verification follow-up

## Static SVG fan-out — CLOSED for demonstrated fixture

- Exact staged helper: `/home/prime-agent/.prime/agent/skill-worktrees/archify-expanded-20260906T221844Z/archify/editorial/check.py`.
- SHA-256: `9501135da4a28474c64f1bb3d5c25733febc2740be7ceb69f032ee91e87eef42` (unchanged before/after command).
- Command: `python3 -I -B <stage>/editorial/check.py check <this-session>/audit-fixtures/fanout.html`.
- Fixture SHA-256: `824bd0c094da48274dc7a29ba688543e52821f88e05fb8fd834c23e4ac9529d8`.
- Completed result: exit **1**, `ok:false`, error **SVG use targets may not contain further use elements**.
- Earlier helper accepted the same 32-level acyclic doubling fixture with exit 0. This independent static retest closes that demonstrated acceptance bug.
- Raw evidence: `audit-fixtures/fanout-fixed.result.json`.

No browser loaded. This is not browser resource-use certification or independent repetition of the worker's full 102-test suite. Wide node/byte amplification regression coverage is worker-reported, not rerun here.

## DrawIO invalid UTF-8 — CLOSED for demonstrated fixture

- Command: `node <stage>/bin/archify.mjs import drawio <this-session>/audit-fixtures/invalid.drawio`.
- Exact staged SHA-256 identities (unchanged before/after command):
  - `bin/archify.mjs`: `0879a81d5d4ee2923d60b94da581fa5ee103bdf287a5338e6bf30c7fc064c162`.
  - `bin/import-diagram.mjs`: `295ad2368d73c4449077f3853ec436e5ed25759316023cebd97c68b372d64bd2`.
  - `imports/drawio_extract.py`: `1531c28f686f61fdd70bc755f38da68829ff21d12ee308072ef02c8f723255d5`.
- Fixture SHA-256: `ee54695a32919d4493dda0cdbdc766315cfe5dd3e0c926d86939e173a9b62147`.
- Completed root CLI result: exit **2**, `ok:false`, error **extractor-failed**.
- Detail: `drawio_extract: diagram contains invalid UTF-8 (including percent-encoded data)`.
- The original draft emitted successful IR containing a silently replaced U+FFFD label. The fixed root CLI emits only structured failure for the same invalid-byte fixture. This closes the demonstrated silent replacement bug.
- Raw evidence: `audit-fixtures/drawio-invalid-utf8-fixed.result.json`.

Scope remains targeted: invalid raw DrawIO UTF-8 only. Embedded/compressed/percent-decoded input coverage and the full 19-test suite are worker-reported, not independently repeated here. Import output publication hardening is a separate pending change and was not exercised by this stdout rejection probe. No browser, network, install or source edits occurred.
