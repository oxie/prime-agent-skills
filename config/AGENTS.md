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
