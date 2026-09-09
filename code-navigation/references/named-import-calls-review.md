# named-import-calls-v1 review

Authorized by root after required imported-duplicate edge gate failed. Base commit 3a85a2f40e283ac0c9b617d9a4bead18d73c3c70. Unified patch SHA256 `43cfd51e9ae9cacff7a1d83e5dd19bd7eee2f197f84907a1e1d7febd9705a959`.

## Scope

45 production additions,13 removals across exactly src/graph/extract.ts and src/graph/resolve.ts. No dependency, package-lock, compiler option, CLI, provider, lifecycle, or native binding changes. Original reviewed checkout is byte-identical. Unit tests reside in runtime-review, outside the base322 source file set.

## Mechanism

- WalkCtx preserves original import map alongside scoped map.
- For TS/TSX bare (nonmember) calls, reuse imported-symbol metadata to carry original name and module specifier in existing RawEdge fields. Aliases bind to original exported name.
- If original map has the name but scoped map removed it, emit no call edge. This prevents false global fallback under shadows, not only false import-derived certainty.
- Existing function shadow filter now handles binding-pattern identifiers, destructuring/rest/default patterns, variables, catches, loops, local classes and anonymous scopes. Nested function/class bodies stay separate. Pattern analysis deliberately over-suppresses uncertain bindings; this is a conservative AST approximation, not a TS compiler.
- Additional walk scope filtering covers statement blocks, catches, for loops and anonymous functions that do not mint definition nodes. Outer scoped removal propagates into nested closures. Separate sibling function scopes preserve their imports.
- Resolver handles explicit relative imported bare TS/TSX calls before global fallback. It requires exactly one exported top-level function in the resolved module; external/missing/ambiguous/nested-only/nonexported targets are dropped, never retried globally. Member and other-language call branches remain unchanged.
- The existing upstream module resolver/exported-node metadata still defines module and export coverage. This patch does not add package/path-alias resolution, type checking, export-list/re-export traversal, overload semantics, or a general lexical binder. Conservatism can omit real edges; extraction confidence is not compiler-grade.

## Evidence

- Baseline native source test: exit1,7/35 passed,28 failed; named-import-calls.baseline.log preserved.
- Patched native source: exit0,35/35 passed (named-import-calls.patch1.log).
- Patched compiled dist: exit0,35/35 passed (named-import-calls.compiled.log).
- No valid assertion weakened, skipped or removed.
- Nine existing reviewed upstream suites: exit0,108/108 passed, no skips. graph-references (including GC-pressure child probe),graph-resolve-typed,graph-bindings,graph-cross-language,graph-extract-dedup,graph-invariants,graph-incremental,graph-traverse,graph-map. TMPDIR=/tmp and safe Git environment avoid ancestor Git scope/real user config.
- Direct tsc: exit0. Ten native grammar/four imports and original graph smoke repeated: exit0 each.
- Native git apply --check and apply to fresh /tmp reconstruction: exit0 each; all322 reconstructed hashes equal current runtime source.
- Updated verifier: exit0; verifies schema2, exact pinned patch SHA, original/current hashes, changed file set, native/dist hashes, lock hash, all12 successful command records and full patch derivation. Log verify-runtime-patch.log.

## Provenance interface

runtime.json schema_version=2, ready=true. source_integrity.unchanged=false; base_hashes records original322; hashes records current322; changed_files records two exact paths. reviewed_patch is {id:"named-import-calls-v1",sha256:"43cfd51e9ae9cacff7a1d83e5dd19bd7eee2f197f84907a1e1d7febd9705a959"}. All516 compiled file hashes refreshed. Historical runtime-v1.json preserved without mutation. Root copies reviewed patch into versioned skill; adapter validates its exact hash rather than trusting unchanged=true.
