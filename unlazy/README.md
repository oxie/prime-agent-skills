# Unlazy for Prime Agent

Version `2.1.0-prime.1`, adapted from [Leonxlnx/unlazy](https://github.com/Leonxlnx/unlazy)
commit `16671491f6679ad9378f52604d3bc2415b4120c7`. MIT; see [LICENSE](LICENSE).

Use `/skill:unlazy` for substantial work that needs an acceptance ledger, explicit
ownership, runnable checks and independent verification. See [SKILL.md](SKILL.md)
and [Prime execution](references/prime.md). No dependency installation is needed.
Node >=16 is the retained upstream floor; this installation is tested with Node 22
on Linux, not every supported runtime or Windows.

## Included

- Manual gate checker, advisory linter and optional dispatch recorder.
- Six upstream workflow references adapted for Prime, one Prime adapter and three templates.
- Native RLM guidance with real admission handles, nonblocking turns, atomic artifacts,
  completed command exits and parent re-verification.
- Preserved gate/parser/approval/lease/dispatch safeguards and regression tests.

## Deliberately excluded

The hook installer is an unconditional refusal stub (exit 2 for all arguments).
It never reads or changes settings. The scan-only Claude hook remains solely for
isolated regression coverage; no hook is configured or used in Prime. No watcher,
scheduler, heartbeat, global activation, automatic CHECK approval, dependency download
or second learning database is installed. Task Observer remains the sole learning path.

A ledger is not a sandbox or a guarantee that the model cannot stop early. `--status`
is non-executing; normal mode may execute existing approvals and `--approve` may execute
immediately. Inspect exact commands and called code and confirm user authorization.
An approval store must be private and outside the checked root. In particular the
default `~/.unlazy/approved` is invalid when checking `/home/prime-agent` itself.

## Validation

`npm test` runs the retained non-installer regressions plus Prime refusal/contracts.
Eleven old installer-only cases were removed, not counted as passes. Their supported
behavior no longer exists in this package. Core gate/dispatch tests are not skipped.

Do not run the stress suite in a credential-bearing environment. It creates temporary
settings/approvals and detached process fixtures. Use a disposable copy, clean environment,
private HOME/TMPDIR/approval/npm state, and bounded owned-process cleanup. See [AUDIT.md](AUDIT.md)
for completed evidence and its limits. No npm install is needed.

Historical research motivation is not evidence that this adaptation improves productivity.
The upstream six-run report lacks the raw materials needed for reproduction; see
[validation protocol](research/validation-protocol.md). No efficacy multiplier is claimed.
