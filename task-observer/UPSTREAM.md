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

The Prime validator supports an explicit, file-local `<!-- task-observer: allow-template-placeholders -->` marker within the first 20 lines for reviewed documents that intentionally use moustache syntax. The exception applies only to the template-slot residue check and emits a warning.


## Cross-session learning clarification

The Prime adapter now explicitly routes reviewed reusable workflow lessons and durable
preferences to `refine.run(..., global_=True)`, while keeping temporary task state local.
It requires checking persisted scope and fresh-session loading before claiming global
availability. This changes guidance, not the runtime, permissions, activation mechanism,
backup behavior or approval-gated skill-maintenance workflow. Learned global harness
state remains in Prime's native store, not a second Git observation database.

## Selected Superpowers additions

See [SUPERPOWERS_SOURCES.md](SUPERPOWERS_SOURCES.md) for the exact pin, MIT notice,
selected mechanisms and local exclusions. This is an extension under the existing
owner, not installation of an upstream process bundle or evidence of measured gains.

## Selected Agent Skills maintenance additions

See [AGENTSKILLS_SOURCES.md](AGENTSKILLS_SOURCES.md) for the pinned documentation,
CC-BY-4.0 attribution, script-interface guidance and selected format checks.
The local checker now needs PyYAML to validate actual parsed metadata; it does not
install dependencies or replace Prime's native loader. Its exact scope and commands
are documented in [bundle validation](references/bundle-validation.md).
