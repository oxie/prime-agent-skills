# Runtime, limits and verification

## Installed scope

- Base Graft commit: `3a85a2f40e283ac0c9b617d9a4bead18d73c3c70`, MIT, `@nanonets/graft` 0.17.0.
- Isolated runtime: `/home/prime-agent/.local/share/prime-agent/graft-tools/upstream`.
- Manifest: sibling `runtime.json`, schema 2. It records 322 base/current source files, 516 dist files and 10 selected native binaries.
- Reviewed correction: `../patches/named-import-calls.patch`, SHA256 `43cfd51e9ae9cacff7a1d83e5dd19bd7eee2f197f84907a1e1d7febd9705a959`. Only `src/graph/extract.ts` and `src/graph/resolve.ts` change. Dependencies/lock stay unchanged.
- Tested toolchain: Linux x64, Node 22.22.2, npm 10.9.7, Python 3.12.3, TypeScript 6.0.3, node-gyp 12.4.0. A toolchain change needs fresh validation; the launcher does not hash the Node executable or every transitive JS/WASM file.

The patch fixes an observed missing-call bug, not a general module resolver. Named relative TS/TSX imports and aliases use existing AST metadata. External/missing/ambiguous targets do not get a global-name fallback. Shadow suppression is conservative and can omit real edges. Package/path aliases, re-exports and full type/export semantics remain outside its guarantee. Always inspect decisive source.

## Query controls

| Control | Default / maximum |
|---|---|
| Whole-operation wall time | 60 / 120 seconds |
| Cache lock wait | 2 / 10 seconds; zero means fail immediately |
| Output bytes | 1 MiB / 2 MiB; minimum 1024 |
| Result limit / graph depth | 30 / 200 items; depth 1 / 5 |
| Node old-space / per-child virtual address space | 512 MiB / 4 GiB |
| Per-child CPU / file size / open descriptors | 120 seconds / 256 MiB / 128 |
| Git-visible entries / eligible visible bytes | 20,000 / 64 MiB |
| Upstream per-file exclusion | Files above 1,000,000 bytes are excluded and counted |

These are not aggregate RSS or disk guarantees. Cache size/count are checked before reuse and before ready publication. Oversized output fails rather than returning partial JSON. Item truncation is explicit. A query search uses `total:null` and a lower bound when the true total is unknown.

Results expose `ok`, `command`, `repo`, `health`, `result`. Operational failures exit 1; invalid CLI arguments exit 2. Health includes scope, source hash, coverage/exclusions, parse reuse, cache identity, runtime commit and patch SHA. `index` and `check` report counts; `map` returns capped directories/hubs/hotspots; `find` supports either `--query` or `--symbol`; `outline` requires an exact relative file; `trace` returns original edge confidence and endpoint locations. Resolve duplicate names with an exact ID or `--file`.

Every query checks content hashes and reuses unchanged parses. Ready is invalidated before work and published only after source/cache/output checks. Corrupt or interrupted owned caches rebuild cold. Deep summaries/crux/concepts are not inherited. Unavailable grammar or actual extraction failures cannot publish current state; tolerant parsing is not syntax certification.

Default caches live at `~/.cache/prime-agent/code-navigation`. Each identity includes canonical Git working-tree root, adapter version, structural scope, base commit and reviewed patch hash. Worktrees are separate. `--cache-root` must be absolute, private and outside the source scope. `forget` removes only its checked identity; the adjacent private lock inode and root ownership marker remain to avoid lock-splitting races. It works without the runtime, while the installed skill/patch remain available. Do not broadly delete the shared cache root.

Network controls use inherited libseccomp and no_new_privs. Network socket/connect/send paths and io_uring are denied. AF_UNIX anonymous socketpairs remain for libuv/Git child stdio. The launcher removes provider/preload/Graft environment settings from child environments and disables Git hooks, fsmonitor and global/system configuration. Config includes and scope-expanding `.graft` settings are refused. This is not a filesystem sandbox, hostile-owner tamper boundary, or certification for arbitrary malicious native-parser inputs.

## Reviewed manual installation / rebuild

No query installs or upgrades anything. Do not run Graft CLI, MCP, `init`, upkeep, deep enrichment, npm lifecycle scripts or host integrations.

1. Obtain the exact base commit in a clean checkout. Verify HEAD, clean status and tracked-file hashes. Keep that checkout unchanged for derivation checks. Copy its 322 source files into a **new empty** isolated runtime; never overwrite an existing runtime implicitly.
2. Review [lifecycle code](lifecycle-review.md), [native build details](native-review.json), the lock, native binding sources and the [small patch](../patches/named-import-calls.patch). The public npm install requires network access; query execution does not.
3. Use an environment allowlist (PATH, private HOME/TMPDIR, USER/LOGNAME, LANG), with `GIT_CONFIG_NOSYSTEM=1`, `GIT_CONFIG_GLOBAL=/dev/null`, `NPM_CONFIG_USERCONFIG=/dev/null`, `NPM_CONFIG_IGNORE_SCRIPTS=true`, `NPM_CONFIG_AUDIT=false`, `NPM_CONFIG_FUND=false`. Never inherit provider keys, NODE_OPTIONS or npm credentials.
4. In the isolated runtime, run each command separately and retain its completed exit:

```text
npm ci --ignore-scripts --no-audit --no-fund
timeout 300 node node_modules/node-gyp/bin/node-gyp.js rebuild --directory node_modules/tree-sitter-kotlin --nodedir=/usr --jobs=2
git apply --check /absolute/skill/patches/named-import-calls.patch
git apply /absolute/skill/patches/named-import-calls.patch
timeout 120 node node_modules/typescript/bin/tsc -p tsconfig.json
```

Only Kotlin needs the reviewed native build. Other direct grammars use locked Linux-x64 prebuilds. Verify local Node headers match before building; do not download headers or rebuild everything. Keep original source `.scm` query assets. No viewer build or CLI registration is needed.

5. Run the native tests below with private HOME/TMPDIR **outside any ancestor Git repository**, and signing/hooks/fsmonitor disabled via Git configuration overrides. Tests use synthetic repositories, not private project indexes.
6. Build a candidate `runtime.json.tmp` from observed files and completed commands. Required fields: `schema_version:2`, `ready:true`, `source_commit`, `package`, `toolchain` (including `node_path`), `dependencies` (lock hash and locked package records), `source_integrity` (`unchanged:false`, original `base_hashes`, patched `hashes`, exact two `changed_files`), `reviewed_patch` (ID `named-import-calls-v1` and hash above), `commands` (nonempty completed successes), `modules` (all dist hashes), `native_modules` (reviewed native binary hashes). Do not reuse historical command success as a new installation result. Keep live `runtime.json` absent/not-ready during a rebuild.
7. Verify the candidate with `tests/verify_runtime.py --source /clean/pinned/checkout --manifest /runtime/runtime.json.tmp`. It checks current files and reconstructs patched source from the originals. After all checks pass, atomically rename the candidate to `runtime.json`; then run launcher acceptance. Preserve old manifests only as history.

## Repeatable checks

Resolve all paths from this skill directory. Use the isolated runtime's Node/tsx for upstream tests, not imports into Prime's Python kernel.

```text
python3 -I tests/verify_runtime.py --source /clean/pinned/checkout
node --max-old-space-size=512 --disable-wasm-trap-handler tests/runtime_smoke.mjs
node --max-old-space-size=512 --disable-wasm-trap-handler tests/runtime_graph.mjs
node --test tests/named_import_calls.test.mjs
python3 -I tests/unit_adapter.py
python3 -I tests/acceptance.py --evidence /private/task/evidence
python3 -I tests/faults.py --evidence /private/task/evidence
python3 -I tests/resource_limits.py --evidence /private/task/evidence
```

`faults.py` uses test-only interception around real native engine I/O to force extraction failure, a build-time source edit and a missing Rust grammar. It does not modify production code or expose a query-time test hook. Resource probes reserve virtual address space without touching gigabytes of RAM; they check actual allocation, file-size and descriptor refusal.

From the runtime directory, the reviewed upstream regression selection is:

```text
node --import tsx --test --test-concurrency=2 test/graph-references.test.ts test/graph-resolve-typed.test.ts test/graph-bindings.test.ts test/graph-cross-language.test.ts test/graph-extract-dedup.test.ts test/graph-invariants.test.ts test/graph-incremental.test.ts test/graph-traverse.test.ts test/graph-map.test.ts
```

These are functional/boundary checks, not model-performance experiments or savings measurements. Raw runtime smoke output can contain upstream map metadata; the supported adapter strips savings/promotion output. The upstream map omits some generic/container language labels; adapter totals use graph language metadata, but per-directory labels remain upstream's incomplete view.

## Rollback

1. Stop new uses and verify no command still owns this runtime/cache.
2. While the skill exists, run `forget --repo <exact-root>` for each explicitly selected cache. It does not remove other projects or the stable lock/root marker.
3. Remove only the installed `code-navigation` directory and the canonical owned `graft-tools` directory. Do not touch Prime dependencies, provider configuration, other skills or target repositories. A skill removal must be committed/pushed and its remote ref verified under the normal skills synchronization rule.
4. Existing sessions may retain old skill descriptions until reload; new sessions discover the removal. No daemon restart, hook undo or provider reconfiguration is required.

Installation validation includes an exact-directory reversible uninstall/restore drill plus cache deletion and source/host snapshots. That drill is not a claim that a removal was published to Git.
