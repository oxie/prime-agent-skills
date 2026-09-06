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
