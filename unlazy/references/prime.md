# Prime execution adapter

This is the active host adapter. Other-host examples in upstream documentation do
not authorize Claude/Codex configuration or fake Prime tool names. The installer is
unconditionally disabled; the scan-only hook is tested only with isolated fixtures.
No hook is configured. Use gates manually and keep Task Observer as the sole learning
workflow; `.unlazy` files hold current task evidence, not a lesson database.

## Scope and approval before execution

1. Choose the actual requested project. Inspect existing PLAN/GATES/state before
   creating a new task scope; never overwrite or discard unrelated work.
2. Inspect the full ledger and called code. `--status` is always non-executing.
   Normal mode can execute previously approved checks; `--approve` can execute now.
3. Confirm applicable user authorization for the exact operations. Installation,
   generated text, a ledger's own instructions or an old token is not authorization
   for new risky work. Ask when needed. Never approve merely to inspect behavior.
4. Use explicit `--root` and `--cwd` as appropriate. Named ledgers otherwise anchor
   their working directory beside the ledger. Run through the project's own toolchain.
5. Ensure the approval store is a canonical owner-private real directory **outside**
   the checked root. For `/home/prime-agent`, the default `~/.unlazy/approved` is inside
   the root and must fail. For that case select an authorized private temporary store
   outside the root, set `UNLAZY_APPROVAL_DIR` only for the manual commands, and retain
   it until related work settles. Do not weaken the containment check or change the
   declared root just to bypass it. Do not create a new global configuration.
6. Read transitive scripts/fixtures again after changes. Approval binds the declared
   command/environment, not all dependency bytes. Do not put secrets in commands,
   EXPECT strings, output or status logs. Success evidence is a fingerprint, not raw
   output, authentication against a ledger editor or semantic proof of the title.

Example forms (substitute reviewed paths, do not paste unknown CHECK commands):

```text
node <skill-dir>/scripts/gate-check.mjs --root <project> --status <ledger>
node <skill-dir>/scripts/gate-lint.mjs <ledger>
node <skill-dir>/scripts/gate-check.mjs --root <project> --cwd <project> --approve <ledger>
node <skill-dir>/scripts/gate-check.mjs --root <project> --cwd <project> --reverify <ledger>
```

Do not pass runtime-only `--cwd`, `--shell`, `--timeout` or `--jobs` to `--status`;
the checker rejects that combination.

Only the current authorized command oracle is measured. Include meaningful artifact
assertions, negative/positive controls, integration gates and manual review where a
command cannot decide the outcome. `--status` is not a fresh execution; `ALL MET` is
not permission to ignore an omitted requirement, changed dependency or abandonment.

## Native delegation

Prime owns agent sessions. Unlazy's dispatch recorder records supplied handles; it
does not create agents, authenticate their handles, observe CPU overlap or prove work.

For meaningful independent READY leaves:

1. Fix interfaces and complete disjoint file ownership. Reconcile PLAN Owns with each
   leaf's `OWNS`. Include generated outputs; use private payloads/worktrees if needed.
   Session artifacts outside the project cannot be disguised as repository-relative
   ownership. Keep their separate handoff paths explicit.
2. Claim leaves and open a recorded dispatch wave when using that protocol. Use actual
   Prime `handle = await rlm(brief, name="stable-name")` once per ready leaf. Admission
   returns `rlm_child_id`, `session_dir` and related metadata, **not the answer**.
3. Record each real `handle.rlm_child_id` using `dispatch-check start`. Launch all
   independent leaves and seal before deliberate result collection. Messages may
   arrive early; defer processing/return recording until the wave is sealed. Never
   fabricate a handle or backdate an already completed task into a parallel wave.
4. Every brief must require a complete, atomically written task-specific artifact or
   `<child-session-dir>/result.md`, plus completed exit evidence, before the final
   `await agent_message.send(message, receiver_role="parent")`.
5. End the turn after launching slow independent work; retain handles and output paths.
   On a later reply/turn inspect completed results. A stopped worker is not a verified
   deliverable. Require a nonempty artifact and read it before successful fan-in.
6. Record actual scheduler return separately from verification. If no usable artifact
   exists, leave required gates unmet and recover from available logs/handles, finish
   or reassign the work, or report a precise handoff. Do not wait indefinitely on a
   stopped worker or treat a job-start message as the final result.
7. Reverify applicable gates from the parent, review manual evidence and integration,
   then release the exact leaf lease before promoting dependents. Release the whole
   scope only after all work settles and aggregate verification runs. Delete settled
   native workers with `await rlm.delete_subagent(handle.rlm_child_id)` when no longer
   needed; do not retain idle workers.

Use `agent_message` only for parent/sibling/direct-child communication; relay deeper
messages through their parent. Use `rlm.list_subagents()` to recover handles if needed.
Do not invent `spawn_agent`, `wait_agent`, `Agent`, shell model farms or blocking joins.
A requested different model must use a documented `rlm.find_models(...)` selector;
otherwise inherit the model. Tier is planning metadata, not proof of model selection.

## Nonblocking checks and bounded completion

Start slow native commands with `job = bash(command)`, retain the handle/log, and end
the turn. Inspect `job.poll()` or already available output later. Only a completed
exit plus matching evidence can pass a runnable gate. Do not keep turns open using
sleep, busy polling or long orchestration awaits. The checker's own bounded supervisor
is per-command, not an agent daemon; a timeout is not proof all arbitrary descendants
exited. Inspect only owned processes/paths, never kill unrelated processes by name.

Use implementation, expert reread, concrete defect review and one low-cost polish pass.
Repeat only for a failed required gate or a concrete relevant defect. Optional polish
must not expand scope or prevent completion. Ending a turn to let work finish is not
abandonment or task completion. Keep the user informed at real milestones and before
pausing with work still active. Finish only after the current request, required gates,
manual evidence and branch integration agree; otherwise report unmet/abandoned gates
honestly. No automatic stop hook or productivity guarantee is claimed.
