# Lifecycle/native review

Pinned source: 3a85a2f40e283ac0c9b617d9a4bead18d73c3c70, @nanonets/graft 0.17.0.

- Root postinstall imports telemetry and can spawn a detached CLI telemetry-flush child. Never executed.
- Root prepare performs broad build then telemetry key stamping. Never executed.
- Root build includes unused viewer compilation/esbuild. Skipped; direct TypeScript compilation produces the provider modules.
- Every dependency lifecycle script was disabled using npm ci --ignore-scripts.
- tree-sitter and grammar install scripts use node-gyp-build. Reviewed its loader/build control and all binding.gyp files (native-review.json). Matching locked Linux x64 prebuilds worked without installers.
- Kotlin alone lacks a prebuild. Reviewed its binding.cc, binding.gyp, and nested node-addon-api .gyp. It compiles bundled parser.c/scanner.c plus small N-API binding; no custom action/download. Ran only explicit node-gyp rebuild, --jobs=2, timeout 300, --nodedir=/usr (installed headers are Node 22.22.2). Build succeeded without network/header download.
- tree-sitter-cli installer downloads an executable; unnecessary to parse bundled grammars, never executed. CLI itself never executed.
- esbuild lifecycle unnecessary for TypeScript-only provider runtime. fsevents is Darwin-only. Neither executed.
- Base install made no source or package-lock changes. Later user-approved named-import-calls-v1 changes exactly two runtime source files; see patch review and schema2 manifest. No package-lock/dependency changes, native forks, overrides beyond upstream's locked override, or trust bypass.
- Static direct relative-import closure of the four intended module entries: import-closure.json. It contains no CLI, hosts, telemetry or AI-provider module. Graph build uses enrichGraph without a summarizer; the synthetic graph confirms computed=0, no summary/crux. Dynamic WASM/native grammar loads remain local dependencies.
- Tests ran with a minimal allowlist environment, no NODE_OPTIONS, no provider keys, no dotenv loading, GIT_CONFIG_NOSYSTEM=1/GIT_CONFIG_GLOBAL=/dev/null. This is not a network sandbox; the adapter supplies kernel network restrictions and independently checks resource/source boundaries.
