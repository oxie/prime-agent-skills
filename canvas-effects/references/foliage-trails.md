# Foliage and distance trails

Two optional Canvas2D renderers, not a replacement host or a general particle
framework. [Local demo](../assets/mengto-demo/index.html) contains original static
SVG fallback artwork and two semantic panels. No remote media, fonts or imports.
Use an authorized local HTTP preview; ES modules are not a `file:` workflow.

## Reuse one renderer

Read the existing [runtime contract](runtime.md) first. Scheduling, backing size,
current-rect pointer mapping and all Play/Stop policy stay in `createHost` unchanged.

```js
import {createHost} from './assets/host.mjs';
import {createFoliage, createPointerTrail} from './assets/foliage-trails.mjs';
const controller = createHost({
  canvas, playButton, stopButton, status,
  durationMs: 8000,
  createRenderer: canvas => createFoliage(canvas, {count: 72, wind: 8})
  // Or: canvas => createPointerTrail(canvas, {count: 160, spacing: 14, coast: .5})
});
// On component removal, before remounting:
// controller.destroy();
```

The canvas is decorative (`aria-hidden="true"`). Put scene meaning, instructions,
status and native buttons outside it. Disable Play and Stop in initial HTML.
Only a deliberate user action may start `controller.play()`. Use one controller
per canvas and do not switch rendering backends on an existing canvas.

The demo's `main.mjs` exports `controllers` (a Map keyed by `foliage` / `trail`)
and `destroy()` for a local browser fixture only. Nothing is installed on `window`.
The reusable renderer module exposes no global interface or scheduler.

## A leaf is not a spinning dot

`createFoliage(canvas, {count, wind})` bakes six local 64×64 transparent sprites:
three warm front colors and three paler, less saturated backs. The original
asymmetric toothed silhouette has a stem and branching veins. Drawing paths
happens at creation, not once per leaf per frame. Every moving leaf uses
`drawImage`; no image loading, CSS filter or external texture is involved.

The long-axis tumble and in-plane roll are distinct:

```js
const face = Math.cos(spin);             // signed; crosses through zero
const slipVelocity = Math.sin(spin) * slip;
ctx.rotate(roll);
ctx.scale(face, 1);
// face < 0 selects the dull underside, while preserving the mirrored scale.
```

Slip is ninety degrees out of phase with apparent width. It peaks when the leaf
is edge-on and stalls when the face is broad. `leafTumble(spin, slip)` exports
that numerical contract as `{scaleX, back, slipVelocity}`. Its slip magnitude
is clamped to 0–64 CSS px/s. The update samples the angle at the step midpoint;
wind is a separate constant drift, not an unrelated oscillating x path.

A deterministic local seed varies phase, spin rate and sign, roll rate, fall,
slip, position and color. Drawing proceeds from smaller/dimmer to larger/brighter
leaves. This supplies depth inside one canvas; it does **not** place leaves over
HTML text. Recycling uses a 40 px margin around the current host CSS bounds.
Count scales by square-root viewport area down to 40% on small panels, never
above the requested clamped count. It is not a physical aerodynamic simulation.

## Distance is carried across events

`createDistanceSampler({spacing = 14, cap = 24})` returns:

- `sample({x, y}, budget?)`: array of marks in path order. First input only anchors.
- `reset()`: forget the anchor and residual; next input starts a new stroke.
- Null or nonfinite input resets. Zero movement returns no marks and keeps the residual.

Spacing is clamped to 1–128 CSS pixels; cap to integer 0–64. Optional budget is
clamped to 0–cap. Configuration must contain numbers; NaN/infinite values use defaults.
For a residual of 6 px at spacing 10, the next mark is **4 px** into the next
segment, not 10 px into it. The code measures the first offset as
`spacing - residual`, then steps by spacing. Positions therefore remain invariant
when the same polyline is split into more collinear events, provided no cap is hit
(apart from floating-point rounding). Different curves or dropped corner events
are different paths and cannot have identical results.

**Overflow policy:** emit at most the current budget, discard the rest of that
segment's debt, clear the residual and anchor at its endpoint. Do not retain an
unbounded accumulator. Stationary follow-ups emit nothing; the next mark needs
a fresh full spacing. Overflow deliberately creates a gap and breaks partition
invariance. It must not turn into an idle burst at the endpoint.

## A bounded luminous trail

`createPointerTrail(canvas, {count, spacing, coast})` uses the sampler on actual
host pointer events, not frame-end coordinates. Emission is limited to 24 marks
between draws, across **all** input events in that interval. A fixed ring of mote
objects overwrites old slots. Position, age and velocity go into the same slot
before the write index advances. There is no accumulating point history.

The baked radial sprite has a small bright core and faint green halo. Motes coast
with exponential drag, a mild sine curl and buoyancy. They soften by at most 40%
before fading out over a 1.5–2.5 second life. This is additive Canvas2D drawing,
not a GPU bloom/post-processing claim. It is distinct from the leaf renderer.

The first manual pointer input resets the authored-path anchor. Local
`pointerleave` and `pointercancel` listeners reset the sampler without obtaining
coordinates; the unchanged host alone maps positions. Reentry never joins across
the missing stroke. Resize and Play reset all state. Destroy removes the two
renderer-owned listeners and releases sprite backing storage.

Play first traces an authored river path, so keyboard users can operate the full
study with native buttons. Any pointer input takes over until the next Play.
Touch uses ordinary passive host input; it does not capture the pointer or block
scrolling. There is no idle emission and no emitter lag. These deliberate choices
avoid stationary plumes and preserve input-path spacing. The trail is not a drawing
editor, freehand keyboard application, timer-mode comparison or 3D camera overlay.

## Bounds and lifecycle

| Resource | Bound |
| --- | --- |
| Foliage count | requested integer 1–128; area-scaled actual count |
| Foliage wind | −40 to 40 CSS px/s |
| Trail ring | requested integer 8–192 slots; default 160 |
| Trail emissions | 24 between draws; sampler standalone cap at most 64 |
| Coast coefficient | 0.1–3 per second |
| Sprite storage | foliage: 6 × 64² pixels; trail: 1 × 64² pixels |
| Drawing surface | host DPR ≤2; backing area ≤1,000,000 pixels per canvas |
| Integration dt | 0–1/30 second; invalid input uses zero |
| Run duration | demo 8 seconds; host maximum 10 seconds |

Mount draws a composed still without requesting animation. Trail still artwork is
composed directly from at most 48 points; it does not run a hidden simulation to
warm up. Both HTML fallback illustrations remain present if Canvas2D setup fails.
Stop retains the last frame. Live reduced motion, hidden document and offscreen
state stop host work. Returning visibility or disabling reduced motion never
resumes. Initial reduced motion keeps artwork and disables Play. Pagehide destroys;
BFCache return remains inactive until reload/remount. Unmount must call destroy.
Sprite setup failure releases partial allocations and uses the host's readable
fallback. An unchanged-size observation does not redraw or create a loop.

These are hard implementation limits, not measured CPU or frame-time results.
Browser scheduling can delay the timeout during suspension. No zero-CPU or
universal device-performance claim is made.

## Checks and limits

From this skill directory, run separately:

```text
node --test tests/foliage-trails.mjs
node --test tests/unit.mjs
```

The new tests assert independent expected sampler positions, event partitions,
residual carry, cap debt discard, zero motion/reentry, signed face/slip relationships,
baked sprite/count bounds, real host input delivery and mocked host lifecycle.
Mocks record transforms, images and cleanup, not rendered browser pixels.

The parent integration owns authorized browser checks. Inspect both panels at
mobile/desktop widths; exercise trusted Play/Stop, live reduced motion, hidden /
offscreen return, pointer leave/reentry, resize, unsupported context and destroy.
Look for visibly thinning leaves and different backs, not merely a frame counter.
Inspect the trail's spacing before coasting displaces the marks. Browser screenshots,
actual device performance and accessibility certification are not established by
these Node tests. See [existing browser guidance](../tests/BROWSER.md).
