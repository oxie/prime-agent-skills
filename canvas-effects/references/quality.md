# Quality and integration checks

Apply to the actual changed surface. A passing educational example is not a pass
for a customer website, another renderer, or every GPU driver. Preserve Hallmark's
UI requirements and the project's own security, business and deployment contracts.

## Readability and input

- Meaningful headings, body copy, navigation and form controls stay semantic HTML.
  Decorative canvas is hidden from assistive output and does not intercept input
  intended for the page. Informative visuals need useful equivalent content.
- Keep a readable still/no-JS/unsupported/failed-renderer state. Never cipher the
  only version of essential instructions, labels or errors. A reveal-all control
  must not itself be concealed by the effect it controls.
- Use native buttons with truthful state and visible focus. Test Tab/Shift-Tab,
  Enter and Space, plus touch and pointer behavior. A script calling `.click()` is
  not a substitute for a native keyboard activation test.
- Keep normal scrolling and zoom. Map input from current bounding rectangles and
  handle scaled/resized/scrolled containers. Do not hide a positioning bug with
  whole-page `overflow:hidden` or a fixed height that clips text.
- Check 320px width, 200% text resizing, long copy, focus targets and real contrast.
  Inspect actual text: bounds checks can miss joined words when a `<br>` is hidden.
  Check relevant text/UI pairings and moving backgrounds; do not certify WCAG from
  token values or a single screenshot.

## Lifecycle and failure

Require initial AND live reduced-motion handling. Stop work for explicit Stop,
offscreen, hidden document, page teardown and renderer failure; returning to view
must not override the user's stop choice. Cap finite run duration and particle/
field counts. Test that frame/render counters stop advancing, not only a paused label.

Disconnect observers/listeners, cancel frame/timer handles and release owned GPU
resources. Destroy is idempotent. Halfway initialization must unwind what it owns.
Test mounting/destroying repeatedly and actual history navigation; BFCache must not
restore an inert visible control. Distinguish actual background-tab behavior and
history restoration from synthetic event-handler unit tests.

Exercise missing and throwing contexts, shader failure, context/device loss, zero
size and asset failure for the backend actually used. Do not wrap application errors
in a decorative catch and report success. DOM fallback must remain available when
GPU initialization rejects asynchronously, not only when an API property is absent.

## Measure without exaggerating

Before implementation, reuse project budgets or define justified bounds for pixel
area, DPR, entity count, texture size/pass count and total run time. Then measure
what actually matters: frame work/long tasks, rendering latency, memory where tools
support it, resizing and repeated mount/unmount, multiple instances, media requests
and low-end/mobile behavior. Record renderer, browser, viewport, device/network and
sampling method. Software GPU validation is not hardware performance evidence.

A pixel cap is an allocation bound for the chosen surface, not total GPU/RSS memory.
A source-byte count is not compressed network transfer. A changing canvas proves
some drawing, not acceptable FPS. RequestAnimationFrame at display cadence is not
free because a logical animation changes only six times per second. Dirty caching
and stopping idle/offscreen work are useful, but still need observed evidence.

## Safe verification workflow

Use the actual project's environment and existing approved browser tooling. A
missing prerequisite is not permission to install packages, enable experimental
flags, remove sandboxing, expose a server publicly or attach to a user's browser.
Record the exact temporary handle/profile and clean up only owned resources.

Freeze source/test/helper hashes during a test run. Retain failed outputs. Check
rendered pixels or screenshots alongside semantic/input and lifecycle assertions.
Use both positive controls and targeted failures: removing an API must fail/disable
the enhancement while the known supported path demonstrably renders. Verify every
exported local module resolves in the intended copied project layout; a docs-site
build is not proof of standalone component packaging.

Report completed exit codes, what was actually seen, implementation versus recipe
coverage, and untested conditions. No model-quality, conversion, accessibility or
performance guarantee follows from the number of checks. The gallery test command
and its environment limits are in [BROWSER.md](../tests/BROWSER.md).
