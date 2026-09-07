# Import publication completion review

Recommendation: accept the two-file candidate change for final-package integration, subject to the root's independent completed test run. No concrete blocker found. No code changes made.

## Reviewed scope

Read the full candidate `bin/import-diagram.mjs` and `dev/imports.test.mjs`, compared both against the staged Archify tree, and checked `references/imports.md` plus relevant SKILL/README statements. The publication change replaces direct output writes with same-directory scratch creation, file fsync, and exclusive hard-link publication. Exactly four tests are added; existing assertions are preserved.

Candidate: `/home/prime-agent/.prime/agent/session-artifacts/01a077c2-76c2-70fa-9967-55011b3b6685/sub-f9a4c769/candidate`
Stage: `/home/prime-agent/.prime/agent/skill-worktrees/archify-expanded-20260906T221844Z/archify`

## Contract assessment

- Same-directory scratch: random UUID path under dirname(out), opened with `wx` and mode `0600`.
- Complete content before publication: JSON is parsed before scratch creation; writeFile, file.sync, and close finish before link.
- No-clobber: hard-link creation fails for an existing destination, including a competing file created after preflight. No overwrite/rename fallback exists. Filesystems without hard-link support fail safely.
- Cleanup: only the scratch path is unlinked after checking its regular-file type and recorded device/inode. The destination is never unlinked. Missing scratch is tolerated; cleanup errors are surfaced.
- Cleanup truth: a post-publication cleanup error returns exit 2 / `output-cleanup` and explicitly states `complete output WAS published`, with scratch path. Pre-publication cleanup failures state output was NOT published. Operation errors are retained in that receipt when applicable.
- Scope: meets the requested publication contract for stable local directories. It fsyncs file content, not the directory; this is not a guarantee of directory-entry durability across a power loss. It is not a sandbox against malicious path replacement. Existing guidance explicitly excludes malicious parent-directory races.

## Added test review

1. Concurrent publishers: exactly one success, one failure; actual winner source matches output, mode is 0600, no scratch remains.
2. Injected fsync failure: no destination, output failure receipt, no scratch remains.
3. Destination race injected immediately before link: JSON scratch parses, competing bytes remain untouched, no scratch remains.
4. Injected unlink failure after publication: truthful published receipt, valid destination source, one residual scratch hard link sharing its inode; test removes that residual explicitly.

The concurrency test does not itself force both publishers past preflight, but the separate deterministic link-race test covers that critical no-clobber window.

## Evidence and limits

Read completed `sub-f9a4c769/imports-initial.log`: TAP reports 23 tests, 23 pass, 0 fail/cancelled/skipped/todo, duration 20047.710886 ms. These are log-reported results only. This reviewer did not execute tests and did not independently observe a shell process exit. The root owns full-package rerun and completed exit-code proof. No browser, network, install, waiting, or long-running jobs were used.

## Source SHA-256

| File | Candidate | Stage |
|---|---|---|
| bin/import-diagram.mjs | 2be6c77f0614a9f8312cdec905ac48a211b6f5633f6ef30b0e833a4c5c84192f | 295ad2368d73c4449077f3853ec436e5ed25759316023cebd97c68b372d64bd2 |
| dev/imports.test.mjs | 087855d37ddce202414f3a12aa9a890f16978bd5de28b30116396760f50c0033 | 40b1f15f2b9b12b808b454fa6d8a390d14f7712fc72f610ebbaf3da1cf1a217e |

TAP log SHA-256: `831163f1e41661be7b294fb396c85f86648b9f4ecf50290ae5d2bf92b69ccb0f`.
