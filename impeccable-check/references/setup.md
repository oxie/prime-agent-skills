# Controlled setup, identity and rollback

This release supports **source/static-HTML checking only**. Rendered checking is
excluded because the verified host trial could not provide the required Chromium
namespace sandbox under `NO_NEW_PRIVS`. Setup, updates and rollback are controlled
maintainer actions within user authorization, never part of a scan invocation.

## Fixed reviewed artifacts

- Upstream: `https://github.com/pbakaus/impeccable`, commit
  `cd12f8660e2dde57b9615c8a6b8ea674101f9cfc`, engine crate version `0.1.5`.
- Final source-only binary SHA-256: `ad8c8e6033b1ae4ff24b77278e8600b287eba5486001273b46fffe1a2fb95194`.
- `references/engine-identity.json` records the compiler acquisition URLs/checksums,
  exact derived Cargo.lock hash, source archive hash and 61 registered IDs.
- Only five unchanged upstream libraries are linked: foundation/common/core/detect/html.
  The tiny entrypoint is preserved in [native-entry.rs](native-entry.rs).
  It calls `detect_text` or `StaticHtmlEngine` directly. The only native behavior
  adaptation is bounded source-only dispatch (including case-insensitive HTML/HTM).
  Upstream library rule predicates are unchanged. Installer, context, hook, browser
  and live code are not included in the source-only build.
- Runtime bundle: engine, source archive, Apache LICENSE/NOTICE, dependency license
  metadata/notices and MPL-covered source archives. The original `selectors` crate
  lacks a root license file; its manifest/source identifies MPL-2.0. Full source and
  the same MPL-2.0 text are supplied. Other dual-licensed dependencies retain notices;
  MIT/Apache alternatives avoid imposing optional Zlib/Unlicense choices.

## Reproduce the private build (maintainer only, controlled setup)

The verified build acquired only rustc/cargo/rust-std 1.98.1 native
x86_64 components from the official dated `static.rust-lang.org/dist/2026-09-03/`
HTTPS manifest and verified its SHA-256 values. It extracted reviewed components
without executing rustup/install scripts. This is same-origin integrity and TLS,
not independently verified publisher signatures. No wasm target was downloaded.

1. Verify the pinned source commit and unpack `source.tar.gz` in an isolated build
   directory. It includes the minimal workspace and derived Cargo.lock.
2. Use the reviewed native compiler component set from `engine-identity.json`, or
   re-review any compiler change. Do not use upstream `rust-toolchain.toml` or launchers.
3. With private `HOME`, `CARGO_HOME`, target and cache directories, run this shape:

```text
env -i HOME=/private/build-home CARGO_HOME=/private/cargo-home RUSTC=/private/toolchain/bin/rustc PATH=/private/toolchain/bin:/usr/bin:/bin CARGO_TARGET_DIR=/private/target CARGO_BUILD_JOBS=2 /private/toolchain/bin/cargo build --release -p impeccable --locked --offline
```

Offline reproduction needs the checksum-verified crates already cached. Acquiring
missing crates is a separately controlled setup step, never a scan-time fallback.
The final lock is an exact version/source/checksum subset of the reviewed upstream
lock; only unused workspace/dependency entries are pruned. Do not silently update it.
Build reproducibility does not promise a bit-identical binary across tools/paths.
A different binary requires explicit review, hash update, tests and release approval.

## Controlled installation

Perform installation only within explicit setup authorization.

1. Verify the complete runtime release bundle against its `bundle-sha256.json`.
2. Record whether `~/.local/share/prime-agent/impeccable-tools` already exists.
   If it does, preserve the complete original directory and a manifest of every file
   before changing anything. Do not overwrite unrelated runtime contents.
3. Copy the verified bundle to a fresh sibling staging directory. Verify its manifest
   again. Rename it to `impeccable-tools` only after the existing directory is safely
   preserved. Do not copy the toolchain, build cache or experimental browser prototype.
4. Merge/install this skill only through the authoritative `prime-agent-skills`
   approval/Git procedure. Run actual fresh discovery and the known-bad/benign scans
   with the installed default runtime; verify all exit codes, hashes and cleanup.
5. Complete commit/push/remote verification under the skills repository rules.
   Remove only setup-owned temporary files after preserving required evidence.

## Exact rollback semantics

- Stop only the installation's active test scan process group, if any, and verify no owned
  `scan-*` directory or child remains. Never stop a user's browser or service.
- If no runtime existed before installation, remove only the recorded installed
  bundle after matching its saved manifest. If one existed, move the replacement bundle
  aside and restore the original directory atomically; verify every saved hash.
- Revert only this skill's approved installation/change in the skills repository,
  preserving unrelated work. Validate, commit/push and verify the remote ref per the
  standing synchronization rule. Removing a file without Git synchronization is not
  a completed rollback.
- Private compiler/cache directories and experimental browser prototypes are not
  runtime dependencies. Remove only recorded setup-owned directories after preserving
  required evidence. Do not remove system packages or unrelated browsers/toolchains
  during rollback.
