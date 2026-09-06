# Prime Agent Skills

Personal, Git-synced skills for Prime Agent.

## Install on a new machine

```bash
git clone https://github.com/oxie/prime-agent-skills.git ~/.prime/agent/skills
python3 ~/.prime/agent/skills/activate.py
```

`activate.py` creates `~/.prime/agent/AGENTS.md` as a symlink to the versioned global instructions in this repository. It refuses to overwrite an existing file.

Prime Agent discovers each child directory containing a valid `SKILL.md`. Start a new session or run `/reload` after changes.

## Skills

| Skill | Purpose | Upstream |
|---|---|---|
| `task-observer` | Always-on observation during user-started tool sessions. Uses Prime's continual harness and `refine` as its only persistence path. | [rebelytics/one-skill-to-rule-them-all](https://github.com/rebelytics/one-skill-to-rule-them-all) |

Task Observer does not create a parallel filesystem log, Claude hook, schedule, heartbeat, or background daemon. Installable skill source remains authoritative in this Git repository.

## Validate

```bash
python3 task-observer/scripts/validate-skill-bundle.py task-observer
python3 activate.py
```
