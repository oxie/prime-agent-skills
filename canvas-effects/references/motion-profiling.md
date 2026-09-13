# Bounded motion profiling in the target project

Use on demand for a named motion, offscreen-work or teardown concern. Extend the
existing [quality checks](quality.md), not every frontend task. Identify the component,
route, expected lifecycle and available native test command before measuring. Run
instrumentation through that project's approved browser/test interface. The shared
browser-check skill does not expose arbitrary `evaluate` or performance traces; this
recipe neither adds those capabilities nor authorizes a new browser, package or service.

## Fix the measurement scope first

Record the revision, native command, browser/renderer, viewport, sampled component and
observation interval. Choose relevant page positions (for a long page: top, middle,
footer; narrow layout when it changes ownership/visibility). Bound sampling time and
route cycles to the failure being investigated. Use the same states before and after
an authorized fix. A source audit or screenshot is not a CPU/GPU measurement.

Locate CSS animations/transitions, pseudo-elements, WAAPI handles, RAF loops, timers,
observers and asynchronously loaded resources in the component. Trace actual owners,
not only matching declarations or a `data-animation-active` label. Separate animation
playback state, geometry/intersection, rendered visibility and drawing work.

## CSS/WAAPI: observe live objects, retain completed controls

In the browser engine supported by the actual project runner, `getAnimations()`
returns live animation objects, including CSS transitions and normally animations on
pseudo-elements. Computed positive duration and `animation-play-state: running` do
not prove movement: a finite animation can already be completed. Keep selected handles
to observe finite controls after they disappear from `getAnimations()`.

This sampling function belongs inside a selected native test, not in browser-check.
`retained` contains only known handles for this component; do not collect all page
objects. Adapt pseudo-element reporting to the engine and record unavailable fields.

```js
// Test-local identity survives separate samples; no DOM mutation or global registry.
const motionKeys = new WeakMap();
let nextMotionKey = 1;
function sampleMotion(root, retained = []) {
  const handles = [...new Set([
    ...root.getAnimations({ subtree: true }), ...retained
  ])];
  return handles.map(animation => {
    const effect = animation.effect;
    const target = effect?.target;
    const owner = target instanceof Element ? target : target?.element;
    const pseudo = effect?.pseudoElement
      ?? (!(target instanceof Element) ? target?.type : null) ?? null;
    if (!motionKeys.has(animation)) motionKeys.set(animation, nextMotionKey++);
    const rect = owner?.getBoundingClientRect();
    const style = owner ? getComputedStyle(owner) : null;
    const pseudoStyle = owner && pseudo ? getComputedStyle(owner, pseudo) : null;
    return {
      testKey: motionKeys.get(animation),
      id: animation.id, // May be empty/nonunique; pair samples by testKey.
      name: animation.animationName ?? animation.transitionProperty ?? '(WAAPI)',
      ownerId: owner?.id ?? null, // Use a stable project test id if IDs are absent.
      pseudo,
      connected: owner?.isConnected ?? null,
      playState: animation.playState,
      pending: animation.pending,
      playbackRate: animation.playbackRate,
      currentTime: animation.currentTime,
      progress: effect?.getComputedTiming().progress ?? null,
      ownerRectIntersectsViewport: rect ? rect.bottom > 0 && rect.right > 0
        && rect.top < innerHeight && rect.left < innerWidth : null,
      ownerDisplay: style?.display ?? null,
      ownerVisibility: style?.visibility ?? null,
      ownerOpacity: style?.opacity ?? null,
      pseudoDisplay: pseudoStyle?.display ?? null,
      pseudoVisibility: pseudoStyle?.visibility ?? null,
      pseudoOpacity: pseudoStyle?.opacity ?? null
    };
  });
}
```

Take paired samples over a bounded interval using the runner's own test clock/frame
interface. Compare the same handles, not list indices. Keep `running`, `paused`,
`finished` and `idle` separate; keep pending transitions separate too. A running
animation with zero playback rate or an inactive scroll timeline need not advance.
A changing timeline/progress establishes advancement, not visible pixels or cost.
Completed finite animations can leave a forward-filled visual state without ongoing
motion; canceled/removed animations may be absent. Neither absence proves RAF stopped.

Explicitly inspect the selected owner's `::before` and `::after` rules and the engine's
reported pseudo animation handles. Their geometry can differ from the owner's box.
Ancestor clipping/opacity, occlusion, `display:none`, `visibility:hidden`, opacity zero
and offscreen intersection are different conditions; do not collapse them to “visible.”
If pseudo ownership/geometry is unavailable, report it as unknown and use a targeted
rendered control, not a blanket zero-offscreen claim. Avoid unbounded DOM inventories.

Use controls relevant to the changed mechanism: a visibly running loop; a manually
paused loop; a finite completed animation (retain its handle); and a pseudo-element
animation with its own pause rule. The completed control must not count as running
just because computed CSS still declares a duration. Hidden and offscreen controls
must exercise the actual visibility code, not manually set a diagnostic label.

## RAF: instrument the callback and pending requests

CSS playback sampling cannot see a canvas simulation loop. In a test-only seam at the
owner's scheduler/draw call, record per-instance callback executions, actual render
calls, pending native request IDs and teardown count. Keep the counters accessible to
the test after unmount, not only on a removed DOM node. Increment execution inside
the actual callback; increment draws at the real draw call. A setter for `active=false`
is not the oracle.

For example, a wrapper around the owner's injected native scheduler can account for
requests without changing its policy. Install before the owner starts and keep the
wrapper through the post-teardown observation window. This is a test seam, not an
instruction to patch global RAF or add permanent production instrumentation.

```js
function meterScheduler(requestNative, cancelNative) {
  const pending = new Set();
  let callbacks = 0;
  return {
    request(callback) {
      const id = requestNative(time => {
        pending.delete(id); // Executing request no longer waits in the queue.
        callbacks++;
        callback(time); // Re-scheduling must use this same injected scheduler.
      });
      pending.add(id);
      return id;
    },
    cancel(id) {
      cancelNative(id);
      pending.delete(id);
    },
    snapshot: () => ({ callbacks, pending: pending.size })
  };
}
```

Pass correctly bound native functions, for example
`requestAnimationFrame.bind(window)` and `cancelAnimationFrame.bind(window)`.
Native RAF is asynchronous; this wrapper is not compatible with a synchronously
invoking fake. Owner paths that bypass it are outside coverage. Count draws separately
so a loop that fires callbacks without rendering remains visible as ongoing work.
Multiple owners need separate meters; shared scheduler traffic cannot be attributed
by subtracting a guessed baseline.

### Positive lifecycle and leaking negative control

Use the project's test controls to exercise the real visibility and lifecycle paths:

| Transition | Evidence after the transition has settled |
|---|---|
| Visible and explicitly playing | Callback/render counters advance; the expected surface actually changes |
| Visible → offscreen | After IO delivery/cancellation, sample an interval: counters stop and no owned RAF remains pending |
| Offscreen → visible | Under an auto-resume contract counters advance without duplicate chains; under explicit-play policy they stay stopped until Play |
| Live reduced motion / explicit Stop | Current animation settles/stops as specified; re-entry does not override the stop preference |
| Same-document unmount | Teardown executes; pending is zero; old instance counters cannot advance during a bounded later window |
| Remount | New instance renders, old one stays stopped; simultaneous pending requests match the owner's design |

Also exercise document-hidden behavior using the actual supported browser mechanism;
synthetic `visibilitychange` dispatch does not change `document.hidden` or prove tab
behavior. Record synthetic handler tests separately. A throttled background RAF is
not evidence of application cancellation.

For an isolated test fixture, intentionally omit cancellation in its teardown while
letting its callback continue scheduling. The same unmount assertion must fail:
old callbacks advance and/or pending requests remain. This leaking negative control
proves the detector can see the failure. It is not a production patch and must be
stopped/reaped by the test cleanup. Keep the ordinary, correctly destroyed positive
control passing. If neither advances, the runner or seam may be inert; fix the oracle
rather than claiming leak clearance. Add a separate fixture if the failure is a timer,
listener or late async resource instead of RAF; one negative control does not cover all.

Drive an SPA's own route control or component mount/unmount API within the same
JavaScript document. Full navigation destroys a realm and can hide an SPA cleanup leak.
Verify the document stayed the same (for example a test-held document identity marker)
and that the component's cleanup actually ran. Full navigation/back/BFCache behavior
is a different test with separately labeled evidence, not a substitute.

## Interpret and repair at the owner

A targeted CSS pause rule may also need `.is-offscreen::before` and
`.is-offscreen::after`; pausing a section does not automatically pause descendants.
RAF needs direct cancellation/gating, not CSS. Re-entry must obey finite completion,
explicit Stop and reduced-motion policy. Cap resumed simulation delta to avoid a large
jump. Disconnect owned observers/listeners/timers; abort loads where supported and
release late-arriving textures/media after destruction. Test those async paths if
changed. Use the existing runtime's ownership rules rather than a new global manager.

Report actual samples, completed native check exit codes and failures. Stable connected
DOM/canvas counts do not exclude detached trees, listeners, GPU textures, workers or
media buffers. Keep heap/trace measurements optional and label unavailable tools.
Zero measured offscreen animations is a scoped symptom result, not a performance
certification or proof of zero CPU/GPU work. Do not replace a failing check with a
paused label, declare a detached owner clean from `isConnected=false`, or infer a
hardware frame-rate improvement from software-renderer screenshots.

Method adapted selectively from MengTo/Skills, commit
`321c769739b823de5eb94eb3a52aa1974fe783a2`, `optimize-web-animations/SKILL.md`
and `references/browser-profiling.md`, with corrected completed-animation,
pseudo-element, native-tool and same-document leak evidence boundaries.
