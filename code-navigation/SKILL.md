---
name: code-navigation
description: >-
  Navigate a substantial code repository with local structural indexes: find definitions, inspect file APIs, trace callers/dependencies, and map connected code. Use for cross-file orientation, change-impact analysis, or repeated code exploration when normal grep/read becomes inefficient. No model calls, code execution from the target repository, deep summaries or automatic hooks. Not a replacement for source inspection, tests, ordinary search, or project memory.
license: MIT
compatibility: Linux, Python 3, libseccomp and the separately installed pinned Graft/Node runtime. Fail closed if required runtime controls are unavailable.
metadata:
  upstream: trailhq/Graft
  upstream-commit: 3a85a2f40e283ac0c9b617d9a4bead18d73c3c70
---

# Code navigation

Use this only when structural navigation helps the current coding task. For an obvious single-file edit, use normal source tools. This is an on-demand derived code index, not behavioral memory or ground truth.

## Before use

- Use the real authorized repository/worktree root. Never index the home directory wholesale.
- Runtime: `~/.local/share/prime-agent/graft-tools/upstream`. The installed runtime must match the pinned manifest. Do not install or upgrade dependencies as a side effect of a query.
- Invoke the launcher below through `bash()` from Prime, not by importing Graft into the Python kernel. Resolve `scripts/code_nav.py` relative to this skill directory.
- No provider credentials, `--deep`, Graft CLI/MCP, `graft init`, host hooks, automatic updates or background watcher are part of this integration.

## Commands

```text
python3 -I <skill-dir>/scripts/code_nav.py index --repo /absolute/project
python3 -I <skill-dir>/scripts/code_nav.py map --repo /absolute/project
python3 -I <skill-dir>/scripts/code_nav.py find --repo /absolute/project --query "token validation"
python3 -I <skill-dir>/scripts/code_nav.py outline --repo /absolute/project --file src/auth.ts
python3 -I <skill-dir>/scripts/code_nav.py trace --repo /absolute/project --symbol validateToken --direction in --depth 2
python3 -I <skill-dir>/scripts/code_nav.py check --repo /absolute/project
python3 -I <skill-dir>/scripts/code_nav.py forget --repo /absolute/project
```

Run `--help` for the actual bounds and optional arguments. Commands return JSON. Inspect the exit code and `ok`/health fields. An error, stale state, scope limit or truncation is not a complete answer. On unavailable/failed indexing, use ordinary source search instead of silently trusting an old graph.

## How to work

1. Get a map or locate a definition.
2. Read its outline and trace relevant relationships.
3. Open the decisive original source. Check callers' contracts before changing behavior.
4. Make only the requested change and run the project's actual tests.

A call graph can miss dynamic behavior and unsupported files. Multiple name matches require disambiguation: use `--symbol path.ts#name` or add `--file path.ts`. Named relative TS/TSX imports use a small reviewed correction; package aliases, re-exports and uncertain scopes remain incomplete. Inferred edges are weaker evidence than resolved ones. No match does not establish no dependency. Keep normal grep for configuration, docs, templates and patterns outside the structural index.

Every query checks content hashes, then reuses unchanged parses. Caches are private, scoped and disposable. Never copy graph output into behavioral memory automatically or treat cached excerpts as primary source evidence. Do not report upstream's estimated “tokens saved” as measured user savings.

## Installation, limits and rollback

See [runtime and provenance](UPSTREAM.md) and [installation/verification](references/runtime.md). Source repositories and host configuration must remain unchanged. Network restriction is process-level, not a full filesystem sandbox or certification for hostile native parsers. Index only the authorized project. Use `forget` for its exact cache; do not delete shared cache roots manually.
