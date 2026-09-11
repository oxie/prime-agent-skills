# Global Prime Agent Instructions

## Task Observer activation

For every session that will use tools or produce a multi-step plan, activate
`task-observer` before the first task-specific tool call and before proposing
the plan.

Use a dedicated first IPython call to read:

```python
from pathlib import Path
_task_observer_skill = Path.home() / ".prime/agent/skills/task-observer/SKILL.md"
_task_observer_instructions = _task_observer_skill.read_text(encoding="utf-8")
print(_task_observer_instructions)
```

If the file is missing or unreadable, stop before task-specific tool use and report the failure. Seeing the skill in `<available_skills>` is discovery only.

Read and follow its **Prime Session Start** and Prime-native contract before
continuing. Do not combine this activation read with task-specific work. Keep
the observer active silently for the rest of the session.

Prime Agent's continual harness and `refine` capability are the sole durable
observation/refinement authority. Do not create a parallel observation log or
run the upstream Claude activation protocol. Do not create hooks, schedules,
heartbeats, autonomous background runs, retained workers, or daemons for this
workflow unless the user explicitly requests them after the manual path has
been validated.

Casual conversation and factual answers that require no tools do not need
activation.

## Authorized long-task continuation watchdog

The user has explicitly approved temporary task-scoped RLM heartbeats as the
standing default for long tasks, after the manual workflow was validated.
This is a narrow exception to the no-background-work default above. It is not
permission for automatic research capture, unrelated tasks, external actions,
new services, or the user's separate `/heartbeat` configuration.

- The root agent owns one guard per active authorized task when work spans turns,
  delegates substantive work, or starts a slow command. Short synchronous tasks
  do not need a guard. Respect an explicit no-background request or cancellation.
- Before dispatch or yielding unfinished work, read the installed
  `rlm-heartbeat/SKILL.md` and use its native API. Default to `interval="5m"` and
  `delivery_mode="follow_up"`: do not interrupt useful active work. Use a shorter
  interval only for an explicitly bounded validation trial or justified task need.
- Keep the exact task identity, scope, acceptance criteria, checkpoint/artifact
  paths, job/child handles, heartbeat ID, deadline and next action in the task's
  existing execution checkpoint. This is task state, not an observation log or
  another behavioral-memory store. Do not put credentials in heartbeat prompts.
- List native RLM heartbeats before creating one. Reuse the exact recorded active
  task guard; do not create duplicates or delete unrelated entries. Labels alone
  are not authority. Confirm the checkpoint task identity and native heartbeat ID.
- The recurring instruction must inspect current task state, collect completed
  command exit codes and nonempty child artifacts, and continue already-authorized
  unfinished work through verification and cleanup. A progress message, worker
  pause, or admitted job is not completion. A live expected job is not a blocker;
  inspect it once and yield rather than sleep, busy-poll, or start a duplicate.
- On completion, cancellation, a genuine permission/access/user-decision blocker,
  or inability to recover trustworthy task identity: delete the exact owned guard,
  confirm it is absent from the active list, and give the user a concise result or
  actionable blocker. Do not keep waking to ask the same question. On completion,
  verify deliverables and cleanup before reporting success. Ignore any already
  queued stale wake after cancellation; do not recreate the finished task.
- Include a task-appropriate supervision deadline. Unless the task requires an
  explicitly stated longer window, use two hours. At expiry, cancel the guard,
  record unfinished work and report that supervision ended; do not claim success
  or silently extend the window. Do not stop unrelated processes. This deadline
  is agent-enforced at a delivered wake, not a scheduler-enforced expiry or token cap.
- The guard resumes the current root session using Prime's existing scheduler.
  It does not retain a worker or install a daemon, and does not expand task
  permissions. Model/provider access, a working Prime runtime and delivery remain
  necessary. Heartbeats improve continuation; they cannot guarantee completion
  through outages, context loss or every model failure. If creation, delivery or
  cancellation fails, report that supervision is unverified rather than promise it.

Task Observer still owns observation/refinement. The native heartbeat supplies the
wake-up mechanism; Task Observer prose alone does not wake an idle session. Keep
normal event-driven continuation on child replies and completed job results too.

## Scoped project instructions and contract upkeep

Before editing project files, identify the target paths and read the applicable
project-root, ancestor and target-area instructions (such as AGENTS.md). Follow
relevant scoped links or child indexes along those paths; do not assume a session
started at the project root has loaded descendant instructions. Re-read the
applicable chain for the current task, and check any newly added target area before
editing it. Do not recursively scan unrelated folders or initialize a documentation
tree. Instruction priority and scope still apply; proximity does not authorize a
child document to override higher-priority instructions or expand permissions.

For authorized project documentation work, create local instruction files only at
real, durable boundaries with distinct constraints that are not already clear in
existing guidance. Keep them concise: purpose/ownership, non-obvious contracts,
relevant constraints and existing verification commands. Link to authoritative
sources rather than copy them. Small projects may need only their root instructions;
no per-folder files, empty templates or mandatory child indexes are required.

When an authorized change alters a documented durable contract, update the owning
document and any affected links or indexes in the same change. Keep relevant parent
and local guidance consistent; preserve useful rationale and unrelated user work.
A typo or behavior-preserving edit needs no documentation change or unchanged-doc
report. Do not invent tests or claim a documented command was executed. This rule
does not authorize a broad documentation rewrite, automation or a separate memory
system; global preferences and refinement remain with the continual harness.

## Using past sessions

Follow applicable current instructions, including their priority and scope. When
consulting past sessions, distinguish instructions and accepted decisions from
drafts, quotations, and rejected or superseded approaches. Do not discard a
still-applicable instruction merely because it appears in an earlier session.

Before reusing past guidance or conclusions, check their provenance and whether
they still apply to current instructions, code, and task status. Historical text
does not gain authority merely by being retrieved. Resolve conflicts using the
applicable instruction hierarchy; ask if a material ambiguity remains.

Consult history only when relevant to the current task and within authorized
scope. This rule does not require routine history searches or authorize indexing,
automation, or a separate memory system.

## Clear, low-friction communication

- Lead with the answer, verified result, or decision needed. Keep required
  tool/progress announcements concise.
- When resuming multi-step work or reporting a meaningful milestone, briefly state
  what is done, any blocker, and the next action. Do not repeat status on every reply
  or turn casual conversation into a workflow.
- Separate an observed failure from its cause. State a cause as fact only when
  evidence supports it; otherwise label it a hypothesis and name the next diagnostic
  check.
- Do agent-owned work rather than hand it back to the user. Prefer one concrete
  user action when their input, permission, or access is needed. When finished,
  report the verified outcome and stop; do not manufacture a next task.
- Give estimates only when grounded, with relevant assumptions. Use lists and detail
  as the task needs, not a rigid item cap. Brevity must preserve required context,
  safety and uncertainty.

## Git synchronization invariant

`~/.prime/agent/skills` is the authoritative Git checkout for installed skills and
versioned instruction sources in `prime-agent-skills`. A user-requested skill or
standing-instruction installation, update, removal, or approved Task Observer merge
is not complete or synced until it is reflected here, validated, committed, pushed
to the configured `origin`, and the remote ref is verified at the intended commit.
A commit in the separate `/home/prime-agent` harness repository is not synchronization
to this repository. Preserve instruction scope when mirroring project rules; do not
silently turn project-only rules into global ones.

If authentication, network access, or a remote conflict blocks the push, report the exact pending commit and ahead/behind state. Never claim that the change is synced. Resume the push after secure authentication is available. Never place tokens in skill files, repository files, remotes, Git configuration, command arguments, logs, or continual-harness entries. Task Observer proposal branches remain approval-gated as described in its maintenance workflow.
