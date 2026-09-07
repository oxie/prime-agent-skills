# Prime Agent Skills

Personal, Git-synced skills for Prime Agent.

## Install on a new machine

```bash
git clone https://github.com/oxie/prime-agent-skills.git ~/.prime/agent/skills
python3 ~/.prime/agent/skills/activate.py
```

`activate.py` creates `~/.prime/agent/AGENTS.md` as a symlink to the versioned global instructions in this repository. It refuses to overwrite an existing file.

A skill or standing-instruction change is considered synced only after validation, commit, push to this repository's configured `origin`, and remote-ref verification. Project-scoped home instructions are mirrored in `config/projects/prime-agent-home/AGENTS.md`; global instructions remain in `config/AGENTS.md`. If authentication blocks the push, record and report the pending commit rather than claiming completion.

The root `.ignore` excludes only this repository README from loose-Markdown skill parsing.
Prime Agent discovers directories containing a valid `SKILL.md` recursively. Start a new session or run `/reload` after changes.

## Skills

| Skill | Purpose | Upstream |
|---|---|---|
| `archify` | Unified technical diagrams, 39 guided editorial layouts, local draw.io/Mermaid imports, static checks and exports. | [tt-a1i/archify](https://github.com/tt-a1i/archify) @ `c651940`, plus [cathrynlavery/diagram-design](https://github.com/cathrynlavery/diagram-design) @ `3b44633` (curated unified Prime adaptation) |
| `hallmark` | Lean, project-first visual design, audit and screenshot study; design guidance for Variate rounds. | [nutlope/hallmark](https://github.com/nutlope/hallmark) @ `13ac0ec` (curated Prime adaptation) |
| `variate` | On-demand design alternatives with a foreground localhost preview and Prime-native, nonblocking decisions. | [Nutlope/variate](https://github.com/Nutlope/variate) @ `3a82377` (reviewed local adaptation) |
| `task-observer` | Always-on observation during user-started tool sessions. Uses Prime's continual harness for decisions and isolated Git proposal branches for tested installable-skill improvements. | [rebelytics/one-skill-to-rule-them-all](https://github.com/rebelytics/one-skill-to-rule-them-all) |
| `marketingskills` (50 skills) | Pinned, Prime-adapted marketing strategy and execution guidance. Content-only install; API CLIs and upstream automation are excluded. | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) @ `5b2c000` |

Task Observer does not create a parallel observation log, Claude hook, schedule, heartbeat, or background daemon. It may autonomously prepare and commit tested changes in isolated `observer/...` proposal branches. It cannot merge into live `main` or push without explicit approval.

## Validate

```bash
python3 task-observer/scripts/validate-skill-bundle.py task-observer
python3 activate.py
# Marketing bundle review and provenance:
cat marketingskills/AUDIT.md
```
