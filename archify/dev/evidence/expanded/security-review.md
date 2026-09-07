# Expanded Archify security/runtime audit

## Scope and decision

Read-only review of the staged static gate and canonical browser draft, plus draft import wrapper/extractors. No live/shared source was changed. No browser was launched, no network/install occurred, and the fan-out fixture was never browser-loaded. Native Node/Python probes ran only against private files. Root owns integration, acceptance and Git.

**Do not treat this as browser-tested or final release approval.** Two demonstrated issues remain open against my inspected versions: static SVG expansion bounds and silent DrawIO UTF-8 replacement. Browser FIFO handling was fixed and independently retested. Other browser fixes were source-reviewed only.

## Exact inspected sources

- Stage: `/home/prime-agent/.prime/agent/skill-worktrees/archify-expanded-20260906T221844Z/archify`.
- `bin/editorial.mjs`: `fdef01f310868cd20cf58ca402157ad2474897531bb4dbadb67b9f6ef689dcb7`.
- `editorial/check.py`: `6d64f37b89f7f8869f3847046ac12d79c4b901e7d94f70caef5111e4714a816f` (still stage hash at final inspection).
- Canonical browser: `/home/prime-agent/.prime/agent/session-artifacts/01a077c2-76c2-70fa-9967-55011b3b6685/sub-df600397/payload/bin/editorial-browser.mjs`. Initial inspected hash: `cd3f7074cfe6857a4e9314eb0b055ff16bb86272ca73b0f973297ab807d6413c`.
- Browser FIFO fix native-tested hash: `abf03b123df54c3f903f24aeda11ccf3255d09a716444a9cc04ec87c66b61560`.
- Newest browser source-reviewed hash: `12a6e53e1c65b0ccd763c0b02ce5408eda4d336be7c52f65ec0974be3ffea2c0`. This adds root-transform refusal too. The stage browser copy was not used as canonical evidence.
- Imports payload: `/home/prime-agent/.prime/agent/session-artifacts/01a077c2-76c2-70fa-9967-55011b3b6685/sub-363d5877/payload`. Its result.md was absent at final inspection, so this is a **draft audit**.
- Import wrapper hash: `295ad2368d73c4449077f3853ec436e5ed25759316023cebd97c68b372d64bd2`.
- DrawIO extractor hash: `798bf2041e5d4988ddec76daa2e8f757f19d848011dbd59acaee138fb396cc2e`.
- Mermaid extractor hash: `83294bfd3a7471ec272ef55005d889088823cedcb3cfbbae706acf944d2a362b`.

## Findings

### 1. HIGH — SVG cycle detection does not bound acyclic use expansion (OPEN)

`editorial/check.py:413-424` visits each original node once and rejects cycles, but does not account for the cloned subtree cost of `<use>`. The 2,101-byte `audit-fixtures/fanout.html` contains 32 groups that each use the previous group twice, then a visible use of the last group. The gate exits 0 with `ok:true`, while the reference graph represents 2^32 leaf instances. Input bytes, original nodes and tree depth all stay small. Actual Chromium resource impact is untested; do not browser-load this fixture.

**Repro:** `python3 -I -B <stage>/editorial/check.py check <this-session>/audit-fixtures/fanout.html`.

**Fix:** reject use targets that contain further use nodes, and cap aggregate referenced subtree expansion, or use a saturating expansion-cost calculation. The gate worker received the fixture and proposes rejecting nested reuse plus a 24,000 expanded-node ceiling. That proposed fix was not present in my inspected stage version and is not independently verified here.

### 2. MEDIUM — DrawIO silently changes invalid UTF-8 labels (OPEN, draft)

`imports/drawio_extract.py:101,148,179` decodes with `errors="replace"`; URL unquoting also defaults to replacement. Unlike Mermaid, invalid bytes can produce successful IR with changed facts and no fidelity warning. Native `runImport(['drawio', invalidFixture])` exits 0 and returns `label: "cost \ufffd"` from a label containing byte FF.

**Repro:** use `audit-fixtures/invalid.drawio` through the exported Node `runImport` interface or normal integrated `archify import drawio` command.

**Fix:** strictly decode supported encodings and strictly URL-unquote each raw/compressed/PNG/SVG path, then return a bounded structured failure on invalid text. An explicitly reported encoding-loss ledger is an alternative, but silent replacement is not. Parent received exact evidence.

### 3. HIGH — Browser snapshot FIFO blocks before deadlines (FIXED + native retest)

Initial `editorial-browser.mjs:55` used synchronous `openSync(O_RDONLY|O_NOFOLLOW)` before checking file type. A `.html` FIFO with no writer blocks the entire process before any timeout or receipt. The native public `runEditorialBrowser` interface, against a private canonical copy and private FIFO, required external `timeout 2s`: exit 124, no output, no browser launched.

**Fix verified:** `O_NONBLOCK` is now present. Same native probe on `abf03b123…` exits 1 in 0.82 seconds with structured regular-file rejection and `httpBlockingEnabled:false`. Browser operation was never reached.

### 4. MEDIUM — Standalone SVG loses permitted gradient background (SOURCE FIXED; browser untested)

Initial serializer property allowlist omitted `background-image`, although the gate accepts `svg { background-image: linear-gradient(red, blue); }`. The supplied `audit-fixtures/gradient.html` passes static checks and delivery. Copying background-color alone does not preserve that paint.

**Fix source-reviewed:** latest browser copies computed background-image and background position/size/repeat/origin/clip/attachment. Computed style resolves ordinary CSS custom-property use before serialization. No gradient export or screenshot was generated or visually compared by this reviewer.

### 5. MEDIUM — Shared browser close hides profile cleanup failure (SOURCE FIXED; no full-browser retest)

`bin/visual-check.mjs:495-499` catches profile `rmSync` errors. The initial editorial wrapper therefore could claim successful cleanup although its profile remained. Native isolated prototype test with an already-exited fake child and injected rmSync failure confirmed `close()` resolves successfully. This test launched no browser.

**Fix source-reviewed:** newest editorial wrapper independently removes `browser.profileRoot` after close, even if close throws, and records removal failures in cleanupErrors/fail status. The shared typed helper remains unchanged. The new wrapper failure path was not independently executed here.

### 6. MEDIUM — Root transform applied to already transformed export dimensions (SOURCE FIXED; browser untested)

Initial SVG serializer copied computed root transform, then sized the cloned root from `getBoundingClientRect()`, which already reflects that transform. Root `transform:scale(.5)` risks double-scaling/clipping. This is a source-derived geometry finding, not a measured browser regression.

**Fix source-reviewed:** newest browser rejects non-none root SVG transforms for standalone SVG export before clone sizing. Child transforms remain supported. PNG rendering was not tested here.

## Positive checks and boundaries

- Static source reads use POSIX no-follow directory handles, O_NONBLOCK, strict UTF-8, byte limits, and before/after size/time identity checks.
- Static delivery validates the transformed exact bytes and inserts canonical restrictive CSP immediately after head start. My benign native delivery exited 0; actual artifact hash and byte count matched its receipt. Repeating delivery to that existing path exited 1 and left its bytes unchanged.
- Static publication uses same-directory hard-link no-clobber publication. Browser publication uses exclusive temp creation and no-clobber hard linking. Neither is represented as a whole-filesystem transaction or defense against arbitrary concurrent directory replacement.
- Editorial subprocess wrapper has no shell, isolated Python mode, 10-second SIGKILL limit and combined 256KiB output bound. Python emits ASCII-escaped JSON, so per-chunk UTF-8 decoding there is not a new bug.
- Import wrapper also uses no shell, isolated Python, combined output bounds, deadlines and exclusive creation. Its source size preflight is not a snapshot identity guarantee; documentation should not imply one.
- Canonical browser gates exact snapshot hashes before browser construction, requires managed CSP, keeps sandbox checks, and configures script disabling/network blocking/cache/media before file navigation. Source review only; network prevention was not empirically tested.
- Current browser draft has explicit optional NEW capture directory, metrics-only default, network-enabled evidence flag, local-scroll metadata and incomplete-capture status. These were not reported again as unresolved findings.
- Conservative static parser checks are useful subset lint, not universal sanitization, layout, semantics or accessibility proof. The package remains five typed renderers plus broader guidance, not 39 new typed renderers.

## Evidence and limits

`audit-fixtures/` includes native probe outputs and inert source fixtures. Do not open fanout.html in a browser. Private test workspace: `/tmp/archify-security-audit-81ik4uro`. All started test commands completed. Existing 97 gate tests were reported by the gate worker, not rerun or independently certified here. Root is rerunning integrated CLI checks. No typed-regression suite, browser launch, PNG/SVG fidelity comparison, cross-platform filesystem test, network probe, installation, Git change or remote verification was performed.
