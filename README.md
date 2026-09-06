# Prime Agent Skills

Personal, Git-synced skills for Prime Agent.

## Install on a new machine

```bash
git clone https://github.com/oxie/prime-agent-skills.git ~/.prime/agent/skills
```

Prime Agent discovers each child directory containing a valid `SKILL.md`. Start a new session or run `/reload` after changes.

## Skills

| Skill | Purpose | Upstream |
|---|---|---|
| `task-observer` | Finds reusable skill ideas and improvements during tool-using work. Manual-only: `/skill:task-observer`. | [rebelytics/one-skill-to-rule-them-all](https://github.com/rebelytics/one-skill-to-rule-them-all) |

## Validate

```bash
python3 task-observer/scripts/validate-skill-bundle.py task-observer
```
