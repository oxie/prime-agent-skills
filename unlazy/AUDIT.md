# Unlazy Prime acceptance audit

## Scope and source

`2.1.0-prime.1`, MIT, source pin `16671491f6679ad9378f52604d3bc2415b4120c7`.
Two independent read-only reviewers inspected the complete executable source/test
runners and the complete workflow references/templates. Final narrow integration
reviews verified the installer/test split and Prime workflow. Their nonempty artifacts
were inspected by the root agent. Source review is not runtime or security certification.

## Deliberate adaptation

- Gate/checker, linter, dispatch recorder and supporting runtime: nine modules remain
  byte-identical to the pin. Ownership leases and supplied handle records are advisory
  coordination, not isolation or authenticated native scheduling.
- Installer: unconditional stderr refusal and exit 2, no imports, filesystem reads,
  branches or configuration changes. The unsafe upstream substring ownership/concurrent
  settings-write behavior is excluded, not claimed repaired.
- The scan-only Claude hook remains for private regression fixtures only. No real hook,
  global activation, provider/configuration change, scheduler, watcher or daemon was added.
- Prime guidance uses real RLM admission, explicit messages, atomic nonempty artifacts,
  completed exits, independent verification and nonblocking turns. These are instructions,
  not proven prevention of model stalls. No live recorded RLM wave was piloted here.
- Bounded polish, user authorization, private outside-root approval storage and Task
  Observer coexistence are explicit. Approval does not hash called dependencies or sandbox
  commands. `--status` is structural, not fresh artifact verification.

## Completed package verification

Final native `npm test` completed with exit 0 under Node v22.22.2 on Linux:

| Suite | Registered checks passed |
|---|---:|
| Core run-tests | 30/30 |
| Dispatch | 27/27 |
| Hardening | 51/51 |
| Stress | 17/17 |
| Advisory lint | 29/29 |
| Contract inventory | 8/8 |
| Source self-check | 15/15 |
| Prime refusal/document contracts | 15/15 |
| Actual manual gate pilot | 10/10 |
| Total | **202/202** |

Eleven installer-only upstream cases were removed (four core, seven stress), not
silently skipped or counted as passes. Remaining test bodies/helpers/drivers retain
upstream behavior. The upstream runners include platform guards; a registered passing
case does not imply its Windows-specific branches ran on Linux. No Windows/macOS/all-Node
coverage or productivity improvement is claimed.

The manual pilot verifies no status write/execution, runtime-option refusal with
`--status`, unapproved execution refusal, named-ledger cwd, default approval storage
inside the checked root failing closed, reviewed positive execution, stale structural
status after artifact mutation, fresh reverify failure/recovery and non-successful
abandonment. An invalid `--status --cwd` documentation example was caught and corrected.
The earlier lexical documentation-test mismatch was also corrected before the final run.

Native loader plus fresh offline RPC discovery found 55 skills and `skill:unlazy`
without diagnostics or model requests. Skill validator, 19 native Node syntax checks,
local Markdown links, credential-pattern scan, 45 core host tests and separate status
and doctor commands passed. Installed-path and remote-sync receipts are retained with
the release handoff, separate from this package-stage audit.

## Test environment and cleanup limits

No dependency installation was needed. Tests ran with a clean environment and private
HOME/TMPDIR/approval/npm settings, not the live credential environment. A disposable PID
namespace was unavailable (`unshare` uid_map EPERM). A reviewed one-shot Linux subreaper
used event-driven reaping, preserved the actual npm exit, bounded tests to 420 seconds
and owned pidfd cleanup to five seconds. It was not a network/filesystem sandbox.
The final run adopted and reaped six test-killed descendants; cleanup completed with
no remaining direct children, timeout or supervisor errors. Its SIGKILL/timeout paths
were not separately stress-certified. No persistent supervisor remains.

Historical research is motivation only. The six-run report lacks reproducible raw
materials and has not been independently replicated. Gate success proves declared
oracles, not omitted English requirements, worker honesty or intervention efficacy.

## Evidence

- [Native test output](dev/evidence/native-tests.txt)
- [Native exit/cleanup receipt](dev/evidence/native-supervisor.json)
- [Manual gate pilot](dev/evidence/manual-pilot.json)
- [Acceptance checks](dev/evidence/checks.json)
- Session release artifacts: `/home/prime-agent/.prime/agent/session-artifacts/01a077c2-76c2-70fa-9967-55011b3b6685/unlazy-install-20260907T093007Z`
