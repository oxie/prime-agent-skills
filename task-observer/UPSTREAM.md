# Upstream source

- Project: https://github.com/rebelytics/one-skill-to-rule-them-all
- Skill: `task-observer`
- Version: `3.1.0`
- Commit: `2967fa5f2f16336677d216fe83d9832a52aadc00`
- License: CC BY 4.0; see `LICENSE.txt`

The bundled `scripts/` and upstream references come from the reviewed release. `references/prime-skill-maintenance.md` is part of the Prime-native adaptation.
The original upstream `SKILL.md` is preserved in Git history at commit
`1721278` in this repository.

## Prime Agent adaptation

The active `SKILL.md` is rewritten as a concise Prime-native adapter. It uses
Prime Agent's continual harness and `refine` as the sole durable observation
and refinement authority. It does not create the upstream filesystem backlog,
install a Claude hook, or enable schedules, heartbeats, autonomous background
runs, retained workers, or daemons. Concrete installed-skill improvements are prepared as tested commits on isolated Git proposal branches; merging and pushing require explicit user approval.

Global in-session activation is versioned at `config/AGENTS.md` and installed
safely by the repository's `activate.py`.
