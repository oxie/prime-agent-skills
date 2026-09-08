# Project Instructions

This home directory is the active Prime Agent harness workspace for prime-agent.

- Treat /home/prime-agent as the project root.
- Run Prime Agent from /home/prime-agent unless intentionally testing another project.
- Keep credentials out of project files and git.
- Use /login for provider setup when ready.
- Do not enable schedules, heartbeats, autonomous mode, retained subagents, or daemon-heavy flows until the manual harness path is proven.
- Before saying a harness change is ready, run an explicit verification command as prime-agent.
- Treat the IPython namespace as recoverable working memory, not the only copy of important state.
- For each subagent, require a complete atomic artifact before its final parent message. Use `<child-session-dir>/result.md` when no task-specific path is better.
- Do not accept a completed subagent as successfully fanned in until its artifact exists and is non-empty.
- Run `scripts/verify_core.sh`, `scripts/check_status.sh`, and `scripts/check_doctor.sh` as separate commands. Never combine or parallelize status and doctor.

## Coding discipline

Apply these rules to coding and code review. Scale the effort to the task; a clear typo
fix does not need a long plan or extra approval.

1. **Investigate before asking.** Read the relevant code, tests, and project instructions.
   Resolve routine uncertainty from available evidence. State material assumptions and
   proceed with low-risk, reversible choices. Ask only when unresolved ambiguity changes
   the required outcome, authorization, data safety, or a costly commitment.
   Trace relevant callers and their contracts before a bug fix; correct the actual
   root cause without assuming every caller needs the same behavior.
2. **Keep the solution small.** Implement the requested behavior with the simplest design
   that meets the actual requirements. Do not add speculative features, dependencies,
   configuration, or one-use abstractions. Prefer clarity over an arbitrary line count.
   Before adding code, check existing code, then the standard library, native platform
   features, and suitable installed dependencies. Use the first option that meets the
   actual contracts; an earlier option does not win if it changes required semantics.
   Otherwise write a small, clear implementation. A justified maintained dependency
   can be safer than hand-rolled code; respect approval rules. Never silently reduce
   an explicit requirement to make the solution smaller.
3. **Keep edits focused.** Match the surrounding style. Avoid unrelated formatting,
   refactoring, and cleanup. Remove only unused code caused by your changes; mention
   relevant pre-existing issues separately. Preserve unrelated user work. Each changed
   line should have a clear purpose in the requested task or its necessary verification.
4. **Preserve safeguards.** Simplicity is not permission to remove necessary validation,
   error handling, security checks, compatibility gates, or data-integrity protections.
   A safety or permission boundary takes priority over convenience or fewer lines.
5. **Test the actual outcome.** Define observable success before nontrivial changes.
   For a bug, reproduce it safely with a failing test when practical, then fix it and
   run relevant regression tests. Assert the behavior at issue, not a weaker proxy;
   for example, a tie-ordering test must check the tied items' order, not just scores.
   Never weaken a valid assertion or change the expected outcome merely to get green tests.
6. **Verify and report accurately.** Run checks in the target project's own environment.
   Inspect completed exit codes and results, and review the final diff for scope and
   accidental changes. Distinguish pre-existing failures, new failures, and checks not
   run. If verification is blocked, report the limit rather than claim a verified fix.

Apply these rules directly during ordinary coding; do not require a Ponytail invocation
or a second simplification pass. Ponytail remains optional for a focused complexity
review/audit, shortcut-comment report, or an explicit request for its workflow. Such a
review is read-only unless edits are authorized. Do not enable a persistent mode.

## Agent-owned upgrade and health checks

When the user asks whether this Prime Agent installation is working, especially after
an upgrade, the agent owns the check and routine repair. Do not give the user commands
to run or ask them to edit version numbers. This is standing authorization to run the
existing idempotent bootstrap and restore its already-reviewed compatible patch during
a user-requested health check. An explicit read-only request overrides repair permission.

Run as `prime-agent` from `/home/prime-agent`:

1. Run `scripts/bootstrap.sh`. It validates the actual installed CLI/package and Node,
   discovers the current bundle, and restores only a content-verified compatible patch.
2. After bootstrap succeeds, run `scripts/verify_core.sh` as its own command.
3. Run `scripts/check_status.sh` alone and review its exit code and output.
4. Only after status finishes, run `scripts/check_doctor.sh` alone and review its result.

Inspect completed exit codes, not just output or process admission. Do not claim full
readiness when bootstrap or core validation fails. Diagnose routine failures yourself;
rerun affected checks after fixing them. Do not stop at a missing patch and hand the
routine work back to the user.

For an unknown source hash, changed layout, or unsupported runtime requirement, perform
source review and isolated validation before considering a compatibility change. Never
bypass the content checks, automatically trust new hashes, or add a release-number pin.
Ask the user only for a real decision or access you cannot safely resolve, such as
credentials, a risky change, or a restart that would interrupt active work.

Report a short result, what you repaired, and any remaining limitation. Status and doctor
are isolated smoke tests, not live-daemon health checks. A running daemon may retain old
code until its next normal restart; do not restart it or claim it loaded new code without
verification. Do not enable schedules, background monitoring, or automatic upgrades for
this workflow. It runs when the user asks, not unattended.

See `docs/READINESS.md` for the detailed procedure and `docs/VERIFICATION.md` for historical
evidence. Use fresh command results, not those historical results, for current health.
