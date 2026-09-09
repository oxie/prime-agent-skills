# Runtime and original examples

## Files and scope

- `assets/host.mjs`: shared sizing, current-rect input, finite scheduling, native controls, and cleanup.
- `assets/effects.mjs`: three small Canvas2D renderers and the demo mounting helper.
- `assets/warp.mjs`: an original WebGL2 fragment-field distortion renderer.
- `assets/demo/index.html`: static-first example with external HTML descriptions and controls.

No package installation, network assets, DOM capture, backend, encryption, fluid solver, or plugin registry is involved. Serve the skill directory with an ordinary local static server; open `assets/demo/index.html`. ES modules should be served over HTTP, not `file:`. The examples target modern browsers with ResizeObserver, IntersectionObserver, media-query events, Canvas2D, and optionally WebGL2. Unsupported setup produces a readable fallback rather than a compatibility shim.

## Use one existing mode

```js
import {mountEffect} from './assets/effects.mjs';
const instance = mountEffect(document.querySelector('[data-effect="ripples"]'));
// Call when the owning component is removed, before mounting again:
instance.destroy();
```

The panel must contain `canvas`, `button[data-action="play"]`, `button[data-action="stop"]`, and `output[role="status"]`. Its `data-effect` is `ripples`, `particles`, `glyph`, or `warp`; an optional second argument selects the mode explicitly. Keep meaningful text in HTML. Give buttons unique accessible names, make the decorative canvas `aria-hidden="true"`, and disable controls in initial markup so a failed module load cannot imply working controls. Mount one controller per panel; destroy the previous controller before remounting. Do not change the canvas backend in place: use a fresh canvas when switching Canvas2D and WebGL2.

`mountEffect` returns `{play(), stop(reason?), destroy(), getState()}`. The demo exposes the four controllers as `window.canvasEffectsDemo.instances`, keyed by mode, plus an idempotent aggregate `destroy()`. Public `play()` is for a deliberate user gesture, not mount, timers, scrolling, or preference-change handlers. Native button click handlers already call it. There is no auto-resume.

## Add a renderer only when needed

```js
import {createHost} from './assets/host.mjs';
const controller = createHost({
  canvas, playButton, stopButton, status,
  durationMs: 5000,
  createRenderer(canvas) {
    // Allocate locally; clean up partial allocation before throwing.
    return {
      backend: 'canvas2d',
      render(frame) { /* draw a still when frame.running is false */ },
      resize(size) { /* optional: respond to CSS/backing dimensions */ },
      reset() { /* optional: reset finite run */ },
      pointer(position) { /* optional: bounded state update */ },
      getEntityCount() { return 0; }, // optional diagnostic, not a test oracle
      destroy() { /* optional: release renderer-owned allocations */ }
    };
  }
});
```

This is a local function contract, not a plugin system. `render` receives CSS `width/height`, backing `pixelWidth/pixelHeight`, effective `dpr`, elapsed seconds `time`, delta seconds `dt` capped at 0.05, CSS-space `pointer` or null, and `running`. Resize draws once without scheduling motion; it resets the example particle/ripple state for the new dimensions. Unchanged-size observer notifications do not redraw. Zero-size observations do not allocate or paint; a later positive size can draw a still. The glyph renderer uses timed progression, not pointer interaction.

Pointer coordinates are clamped CSS-space values, recomputed from `getBoundingClientRect()` for each pointer event. The calculation accounts for scroll and axis-aligned CSS scaling; arbitrary rotation/skew/perspective transforms are not supported. Input is passive and does not suppress normal page scrolling. For Canvas2D, use independent backing/CSS ratios in `setTransform`, because integer backing dimensions can round slightly. The WebGL example converts the y coordinate to its bottom-up UV convention.

## Hard limits and lifecycle

- Backing DPR: at most 2. Backing pixel area: at most 1,000,000 per canvas, including extreme aspect ratios. CSS dimensions remain unchanged.
- Duration: finite and clamped to 1–10,000 ms. Demo: 8,000 ms. A wall-clock timeout cancels a throttled animation frame. Browser suspension can delay callbacks; execution stops as soon as they are delivered, not by a real-time OS deadline.
- Ripples: at most 24 rings; expiration after 2.8 seconds. Particles: 96; speeds capped at 65 CSS px/s. Glyphs: at most 40 × 24 cells. Warp: one full-screen triangle, no textures or external images.
- Start: one still preview, no animation loop. Play resets a finite run. Stop cancels RAF and the deadline timer and retains the last painted frame.
- Hidden document, offscreen canvas, or live reduced-motion preference: stop. Returning or disabling reduced motion does not restart. Initial reduced motion disables Play but keeps the still preview.
- ResizeObserver handles element size changes; IntersectionObserver stops offscreen work, with an additional rect check during active frames. DPR is refreshed on resize observations; moving between displays without a resize is not separately monitored.
- `pagehide` calls `destroy()`. A BFCache-restored page therefore remains static with disabled controls and a readable reload/remount status; no `pageshow` handler resumes it. A normal history reload mounts fresh still previews.
- `destroy()` cancels scheduled work, disconnects observers, removes listeners, releases renderer resources, and disables controls. Repeating it has no effect. It intentionally leaves descriptions and the last image in the DOM; the caller owns DOM removal.
- Partial host initialization failure releases resources already returned by the renderer. Factories must clean their own partial allocation before throwing; the GPU factory does this. Missing or throwing `matchMedia` and render/reset/resize failure hide the canvas and leave a readable status. WebGL context loss also stops, frees resources, and asks for reload; restoration never silently resumes.

`getState()` reports current lifecycle state, reason, draw count, sizes, last CSS-space pointer, entity count, pending RAF/timer, registered listener/observer counts, and backend. After failure or destroy the renderer backend becomes null. These diagnostics aid integration; browser tests must independently inspect pixels, trusted input, actual observer/listener teardown, and scheduling.

## What the examples prove

Ripples are expanding elliptical marks, not Navier–Stokes fluid simulation. Particles demonstrate bounded integration and local pointer repulsion. Glyph reveal draws an original moon/observatory/hillside directly as text marks, not screenshots or arbitrary page reconstruction. Warp distorts a procedurally generated stripe/sun/ridge field inside a real GLSL ES 3.00 fragment shader, not CSS blur or a Canvas2D approximation. A retained drawing buffer supports deterministic independent pixel checks; production adaptations can remove that option when they do not need readback, after testing their own capture and lifecycle needs.

Run `node --test tests/unit.mjs` for numerical and mocked lifecycle/resource contracts. See `tests/BROWSER.md` for the independently owned real-browser suite and sandbox requirements. Mocked tests alone do not prove GPU output, actual native input, browser visibility behavior, accessibility, or device performance. A shader that compiles on one software-rendered Linux browser is not evidence for every hardware driver. Visual refinements, framework adapters, physically accurate fluids, WebGPU, 3D, arbitrary DOM capture, and production benchmark claims are outside these implementations.
