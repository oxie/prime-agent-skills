# Inputs, evidence and limits

Use an explicit absolute canonical Git root with an ordinary `.git` directory;
linked worktrees and directory scans are not supported. Select 1–16 regular,
nonhidden UTF-8 files, at most 256 KiB each and 2 MiB total. Supported extensions:
CSS/SCSS/SASS/LESS, JS/JSX/TS/TSX/MJS/CJS, Vue/Svelte/Astro, HTML/HTM (case-insensitive).
No project code, build command, hook, configuration or DESIGN.md is executed/read.
Symlinks, hardlinks, hidden paths, traversal, binary/NUL input and invalid UTF-8
are refused. Files are opened through no-follow directory descriptors and checked
again after a completed scan. The original project is never an engine read/write grant.

Static HTML uses the real upstream HTML/CSS engine; other supported files use
its real regex source engine. Every linked stylesheet must be a relative `.css`
file explicitly selected with `--file`; external/root-relative/encoded links,
`<base>` and CSS `@import` are refused instead of silently losing CSS coverage.
Scoped `data-impeccable-ignore` attributes are refused. Comment waivers and project
config have no authority. HTML5 parser recovery is not HTML syntax validation.

For HTML targets missing explicit `html`, `head` or `body` tags, JSON
`coverage.skipped` records the target and missing document-wrapper context. The
upstream parser removes implied wrappers: a fragment can read its linked stylesheet
yet fail to apply `body { ... }` because no body node remains. This is not a
browser-complete cascade. Source is never auto-wrapped. An explicit full document
with the same linked CSS supplies that context; fragment results need this limit.

Source-only scanning cannot establish rendered overflow, image loading, JavaScript
behavior, responsive state, focus usability, or visual contrast over real imagery.

## Reading JSON

- `status=complete` means only the declared supported source scan completed.
- `findings` preserves upstream ID, description, file, line and snippet.
  `line=0` means upstream did not provide a location; do not invent one.
- `upstream_severity` retains the engine's original severity. Upstream `slop`
  category findings become public `advisory` style/context observations. They do
  not cause exit 2. A normal Arial receipt demonstrates why this distinction matters.
  `quality` entries remain quality heuristics requiring product-context review.
- `coverage.attempted` names each requested engine/target. `coverage.executed`
  lists actual upstream profiler event groups and call counts after success.
  Group names such as `color-rules` are not individual rule IDs. Registry metadata
  contains 61 IDs, **not** 61 applicable/executed checks on each input.
  No external pack or design-system comparisons are enabled.
- `errors` takes precedence over findings. Partial findings never turn a failed
  target into a clean result. `source_hashes` and `source_unchanged` support freshness.

## Actual boundaries

The standard-library Python parent validates and snapshots selected files. Before
executing the fixed hash-pinned native binary, it applies Linux Landlock ABI 4:
read access only to the input snapshot, native libraries/loader and loader cache;
execution only for the engine and exact dynamic loader; writes only to private
scratch. No HOME/project/config/proc content access is granted. Seccomp denies
all socket creation/connect, process/thread creation/signals, cross-process memory,
chmod/chown/timestamp/xattr mutations, namespace/ptrace/BPF and
other escape interfaces. TCP bind/connect is also denied by Landlock. The child
has a fixed clean environment and no inherited nonstandard descriptors.
This is real kernel enforcement, not a claim that a temporary cwd is a sandbox.
It is not isolation from a malicious same-UID actor modifying the adapter/runtime.

Default wall deadline is 15 seconds; `--timeout` accepts .001–90 seconds. The
work path uses a deadline alarm, not just socket inactivity timeouts. SIGALRM is
deferred only while temporary-directory ownership is established and during its
cleanup; pending deadlines are delivered inside the owned context or after removal.
Actual scan work remains interruptible. This bounded cleanup tail can extend past
the requested work deadline (owned child waits are capped at 3 seconds). Kernel
filesystem stalls, SIGKILL and host failure cannot promise automatic cleanup. Child
limits include 15 CPU seconds, 1 GiB virtual address space, 4 MiB combined captured
output, 256 descriptors and 16 MiB per created file. Cleanup kills/reaps owned
children and removes private scan directories, including operational failures.
These are not an RSS/cgroup or host-wide denial-of-service certification.

The `rendered` verb is retained only to return an explicit operational error
before HTTP/browser startup. It is not a source fallback. `--url`,
`--allow-resource` and `--trusted-local` are reserved, nonoperational parameters.
`--runtime /approved/path` supports controlled verification/staging of the same
hash-pinned engine, not arbitrary executables or on-demand installation.
