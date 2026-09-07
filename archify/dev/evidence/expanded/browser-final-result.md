# Archify browser completion

Private candidate: `/home/prime-agent/.prime/agent/session-artifacts/01a077c2-76c2-70fa-9967-55011b3b6685/sub-402a8f99/candidate`
Final integration payload: `/home/prime-agent/.prime/agent/session-artifacts/01a077c2-76c2-70fa-9967-55011b3b6685/sub-402a8f99/payload` (three complete files only).
No shared/live files, packages, dependencies, browser installation, server, or network fetch were changed or started.
Runtime: uid 1007 (prime-agent), Node v22.22.2, sandboxed existing `/snap/chromium/current/usr/lib/chromium-browser/chrome`.

## Completed changes
- Preserve the provided FIFO guard, managed-CSP exact snapshot check, no-clobber output publication, and optional new capture directory.
- Resolve variable SVG presentation attributes as well as inline computed styles. Keep SVG title/desc, local definitions, geometry, CSS gradients/backgrounds, and internal ARIA IDs.
- Add font-configuration and explicit browser configuration evidence. These are not resolved-glyph/font portability claims.
- Keep exact PNG dimension assertions. Chromium quantizes fractional clips; only bounded native rounding differences may use reported canvas resampling. Unexpected differences fail closed.
- Gracefully close Chromium before forced-close fallback and profile removal. Record exact owned profile path, process PID, and cleanup checks.
- Extend the manual pilot with optional `--fixtures`: benign CSS geometry/background-gradient/internal-gradient/ARIA fixture, trusted SVG roundtrip, exact fractional PNG sizes, and transformed-root SVG refusal. Hostile HTML was not loaded; hostile fixtures remain static-only tests.

## Completed browser tests
- Fresh example deliveries: wardley, journey, bar each exit 0. Exact deliver receipts: `evidence/<name>-deliver.json`.
- `node dev/editorial-browser-pilot.mjs <private input> <new pilot dir>`: wardley exit 0, 9 cases; journey exit 0, 9 cases.
- Same command with `--fixtures`: bar exit 0, 17 cases.
- Total 35 receipts: 28 success receipts, 7 expected refusals. There were 29 actual browser sessions, including the successful transformed-root refusal and trusted SVG roundtrip. All observed HTTP(S) attempt counts were zero. All cleanup assertions passed.
- Browser unit tests: `node --test --test-concurrency=1 dev/editorial-browser.test.mjs`, exit 0, 7/7. See `unit-ultimate.log`.

## Final evidence (supersedes earlier failed/intermediate pilot directories)
- `evidence/wardley-ultimate/pilot/receipts.json`
- `evidence/journey-ultimate/pilot/receipts.json`
- `evidence/bar-ultimate/pilot/receipts.json`
- Each has `viewports/390x844.png`, `viewports/1440x1000.png`, `primary-0.25.png`, `primary-0.5.png`, `primary-1.png`, `primary-1.5.png`, and `primary.svg`.
- Bar also has `fidelity-viewports/`, `fidelity.svg`, `fidelity-roundtrip.png`, four `fidelity-<scale>.png`, benign fixture sources and successful delivery receipts, and transformed fixture source/delivery. `transformed.svg` is correctly absent.
- `evidence/ultimate-summary.json` lists dimensions, metrics, counts, and normalization evidence.
- `evidence/ultimate-cleanup-audit.json` lists all 29 owned profile and 28 snapshot paths, absent at delayed recheck. Four earlier/unattributed profile directories were preserved; no global-temp-cleanliness claim.
- `evidence/capture-equivalence.json`: all six final main screenshots are byte-identical to the previous successful `*-complete` screenshots root reviewed.
- `browser-diff.patch`: scoped diff against supplied latest payload.

## Measured versus viewed
Measurements: page horizontal containment, positive primary SVG boxes, title/desc, visible equivalent text presence, configured font stacks, 390×844 and 1440×1000 viewports. Wardley and journey report local horizontal diagram scrolling on mobile; this is not whole-diagram visibility in one screenshot. Scrolling interaction and screen readers were not tested.

Viewed here: desktop Wardley, mobile journey and bar, fixture source screenshot, and final standalone SVG roundtrip plus normalized PNG. The fixture visibly preserves a dark CSS background gradient, red-to-blue SVG rectangle, and white text. Root reviewed all six main captures. Visual review is not mathematical/content correctness, accessibility, or consumer-portability certification.

The standalone SVG was reopened directly from the trusted freshly generated export only, with document scripts disabled and external schemes blocked. Its computed CSS confirmed 160px×70px rectangle geometry, root 300.5px×180.5px dimensions, `rgb(16, 32, 48)` background, CSS `linear-gradient`, internal `url("#paint")`, and internal-only ARIA references.

Fractional fixture outputs are 75×45, 150×90, 301×181 and 451×271 at 0.25, 0.5, 1 and 1.5 respectively. The last used rounding-only resampling from native 450×270; it can slightly interpolate pixels and is explicitly recorded. It is not claimed to be lossless raster reproduction.

Network evidence is a CDP event tap on the inspected page session, with blocking and background-networking-disable flags. It is not a machine-wide packet capture or proof about every Chromium subsystem. No external requests were observed. No dependency installation or server was used.

## Payload SHA-256 manifest
- `bin/editorial-browser.mjs`: `1c11fb24050400b75e58807d00070947e852f1a242c67452977de7924a78dfae` (27071 bytes)
- `dev/editorial-browser.test.mjs`: `246ff5aaac463292905ff1681c781fa5bc90d760319e1a639d0671694908cdc7` (7288 bytes)
- `dev/editorial-browser-pilot.mjs`: `0412f2afe2e9b6008ea38ae5154b9b49022bc8adf59decbb68890470b8b76680` (11926 bytes)

## Final native verification
- Final `npm test` completed exit 0: **294/294 tests**, zero failures/skips. `full-test-ultimate.log`; duration 113.85s.
- Earlier full suite also exited 0, 294/294, before graceful-shutdown refinement. Final result above uses final module bytes.
- Final delayed cleanup recheck: 2026-09-07T08:00:31.025946+00:00; all recorded owned profiles/snapshots absent and no recorded browser PID retains an Archify profile command.
- All capture and export receipt hashes revalidated against files. `sha256-manifest.json` contains SHA-256 and byte counts for all final payload and evidence files (56 entries).
- Earlier failed pilots remain for diagnostic history only. Failures fixed: shared-parent no-sidecar test interference, retained CSS var attributes, invalid template regex escaping, fractional clip quantization, and non-graceful profile cleanup race.
- No remaining task blocker. Shared typed adapter is unchanged. No installation, commit, or push was performed by this child; parent owns integration and synchronization.
