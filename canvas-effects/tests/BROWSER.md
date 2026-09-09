# Canvas effects browser acceptance

Run from this skill directory with the existing reviewed local environment:

```text
/home/prime-agent/.local/share/prime-agent/browser-use-tools/.venv/bin/python tests/browser.py --output /tmp/canvas-effects-evidence-UNIQUE --deadline 180
```

The evidence directory must be new and outside the package. The runner resolves
assets relative to itself, so the same command works after installation. It needs
the existing browser-use environment (including Pillow), sandboxed Chromium at
`/snap/chromium/current/usr/lib/chromium-browser/chrome`, and exact-process helpers
from `/home/prime-agent/.local/share/prime-agent/browser-use-tools/checks/verify_browser.py`.
It does not install dependencies. A different environment needs review; never add
unsafe browser flags to force WebGL success.

## Safety and evidence

Only packaged assets are served by an ephemeral loopback server. The history
check serves the same demo HTML at one extra local URL; no extra script is added. Symlinks and
unknown asset types are refused. Chromium receives a private temporary profile,
clean environment, disabled downloads/telemetry/cloud extensions, fail-closed
non-loopback proxy and DNS controls. This is not OS egress isolation or a packet
audit. BrowserSession attaches to CDP without an Agent, provider, cloud or model.
The renderer sandbox and exact owned process cleanup are checked. The reviewed
launch/CDP/cleanup infrastructure comes from cinematic-ui's local browser runner;
the acceptance checks are independently written for this contract.

Keep the command handle. Read its **completed exit code**, `evidence.json`, and
screenshots. An admitted process or screenshot alone is not a pass. Each check
records its assertion and data. Failures remain in separate evidence directories.
Start/end source hashes cover all assets, this runner and the reviewed helper.
Cleanup disconnects BrowserSession, terminates/reaps only the owned process group
and exact remembered helper identities, closes the server/proxy, and removes only
the private temporary tree. The deadline bounds testing, with bounded extra cleanup.

## Assertions

- Nonuniform static canvas pixels; four distinct images; native Play changes actual
  pixels; native Stop freezes pixels. Warp must be real WebGL2, with nonuniform
  rendered output and motion, not just a context or diagnostic claim. Pixel samples
  read real backing buffers with toDataURL; viewport-only screenshots show layout.
  This avoids captureBeyondViewport resizing the responsive canvas during a sample.
- Real Tab, Enter, Space, mouse and touch events. Enter includes its CDP character
  text. Pointer coordinates are checked after scroll and resize, together with local
  ripple pixel changes at the physical input location.
- 320 CSS px and 200% computed font-size enlargement, with heading/body/control
  horizontal bounds and screenshots. Text enlargement is not device-scale zoom.
- Initial/live reduced motion, real offscreen intersection and a second owned
  foreground tab. Returning does not silently resume. A complete finite run is
  observed within ten seconds on glyph reveal, with a finished landscape pixel
  comparison and screenshot. Backing pixels and effective DPR have explicit caps.
- Real history navigation/back with actual pagehide cleanup receipts; persisted
  status is recorded. Synthetic persisted pagehide/pageshow checks are separately
  labelled and do not claim BFCache use. Controls must be usable or honestly disabled
  with reload guidance. Zero-size suppression counts native drawing calls.
- Real `WEBGL_lose_context`, null/throwing context and matchMedia APIs, and production JavaScript
  disabled. CDP init instrumentation may still run in the no-JS test; production
  enhancement and useful HTML are the oracle, not the absence of init globals.
- Repeated mount/destroy and idempotent destroy with independent native RAF,
  listener and observer tracking. Counts are compared to a destroyed-demo baseline;
  no late RAF callback is allowed. Diagnostics supplement these native counters.
- No unexpected runtime/console errors, only successful fixture-origin requests,
  stable source hashes and exact private resource cleanup.

These are bounded Chromium software-renderer samples (Chromium selected SwiftShader
without a test-supplied unsafe enabling flag), not hardware-GPU evidence or FPS, heap, GPU-memory, accessibility or
WCAG certification. They do not test mobile hardware, assistive technology or other
engines. Inspect screenshots before accepting the visual result. No live website,
restricted upstream implementation or external image is involved.
