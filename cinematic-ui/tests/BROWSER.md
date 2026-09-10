# SALT browser verification

The fixture in `assets/demo/` is an original fictional editorial composition, not a
starter requirement. Open `index.html` directly for its static baseline. The only
optional effect is a seven-second, user-started light pass with pause/resume.

## Installation-specific runner

This check requires the **existing reviewed local environment**, not dependencies
bundled in this skill:

- `/home/prime-agent/.local/share/prime-agent/browser-use-tools/.venv/bin/python`
- Maintained private Google Chrome153 under
  `/home/prime-agent/.local/share/prime-agent/browser-use-tools/chrome/153.0.8010.36/`
- Sibling `browser-check/scripts/chrome_launch.py`, `owned_chrome.py` and
  `optional_optout.py` (reviewed browser-use0.13.10 optional-listener opt-out)

The shared launcher verifies the full pinned runtime before executing only the
actual Chrome binary under the existing `chrome` AppArmor profile. That profile
permits normal user namespaces; it is not whole-browser filesystem/egress isolation.
BrowserSession attaches through loopback CDP; it does not manage Chromium or call
an Agent, provider, cloud service or model. Private CDP event-registry APIs are
version-specific. A different installation needs review before adaptation; do not
install dependencies or remove the sandbox to make this check pass.

From this skill directory, use the native environment and a **new** evidence path:

```text
/home/prime-agent/.local/share/prime-agent/browser-use-tools/.venv/bin/python -I -B tests/browser.py --output /tmp/salt-evidence-UNIQUE
```

The default test deadline is 120 seconds (accepted range: 30–180), plus bounded
cleanup. Keep the command handle and inspect its completed exit and `evidence.json`.
An admitted job or screenshots alone are not success. Each run retains its errors
and per-check receipts; existing evidence directories are refused.

## Safety and scope

The server binds an ephemeral loopback port and serves only three fixture files.
There is no directory listing, arbitrary path serving or external asset request.
The browser gets a short private profile and clean environment, with telemetry,
cloud sync, extensions and version checks disabled. A bound non-listening local
proxy and fail-closed DNS rules permit only the exact owned fixture127.0.0.1 port
for browser traffic, not every loopback service. Optional download/dialog listeners
are disabled before BrowserSession starts. CDP denies downloads after attachment;
unexpected dialogs are dismissed and fail the run. These are browser controls, **not OS egress isolation**
or a packet audit. Do not describe absence of fixture network requests as proof
that every Chromium background component is silent.

Cleanup disconnects BrowserSession and delegates process shutdown to shared
OwnedChrome. The fresh CLI is a subreaper and sole browser wait owner; detached
adopted children are pidfd-pinned/reaped. No numeric process-group signal follows
leader reaping. Each server/proxy/log cleanup is attempted independently. Private
work is retained when child cleanup is uncertain. No user browser is attached or
stopped. Start/end hashes cover fixture, runner and all shared helper sources.

## What the checks mean

- Real Chromium layouts at 1440, 390 and 320 CSS pixels; screenshots of opening,
  notes and colophon; horizontal bounds and visible text checks.
- 200% text-only enlargement from a batch of computed font sizes, including px
  sizes. This tests text reflow, not device-scale zoom. SALT may wrap at this size.
- Native Tab/Enter/Space activation, skip link, chapter/study anchors and focus styles.
  Enter includes its character text in CDP; button activation is not replaced by a
  JavaScript click. Pause measurement waits for the WAAPI ready promise.
- Static first load; one finite seven-second effect; real timeline pause/resume;
  cancellation for live reduced-motion changes and no automatic restart.
- Initial reduced motion, no JavaScript and controlled unavailable/throwing optional
  animation APIs leave readable content and no misleading motion control.
- Offscreen pause uses the real IntersectionObserver. A second owned browser tab
  exercises actual document visibility. Actual history navigation records
  `pageshow.persisted`; restored pages offer a truthful static fallback with the
  motion control hidden. Pagehide teardown also has a separately labelled synthetic
  event check. A synthetic event alone is not evidence of BFCache use.
- Computed foreground/background contrast for named solid text surfaces, measured
  source-payload bound and animation count/duration. No heap/GPU budget, frame-rate
  benchmark, comprehensive accessibility audit or WCAG certification is claimed.
- Runtime/console errors and fixture-origin requests are recorded. No live site,
  assistive-technology matrix, mobile hardware or other browser engine is tested.

Review actual screenshots as well as machine assertions. A visual review is not a
conversion claim or a replacement for product-specific testing.
