# Rendering recipes, not a universal engine

Read only the relevant recipe. Keep the host and renderer boundary small: the host
owns size/input/scheduling/lifecycle; the renderer owns its specific state and GPU
resources. Do not build a plug-in catalogue or backend service to draw a few effects.
The example's exact API is in [runtime](runtime.md); this document is broader guidance.

## Common frame contract

Work in CSS-local coordinates for input and layout, device pixels for the backing
surface. Cap both DPR and total pixel area; a DPR cap alone does not bound a giant
canvas. Preserve aspect ratio when scaling to the area budget. Resize the backing
buffer only when dimensions change; skip zero-sized/hidden surfaces. Allocate per
resize or renderer initialization, not an unbounded new array every frame.

Use elapsed time in seconds, clamp a large resume delta, and cap simulation steps.
A renderer should be able to draw a useful still without scheduling a loop. One
owner requests animation frames; each callback checks whether work is still allowed.
Explicit Stop, reduced motion, offscreen, hidden document and destroy must stop
scheduling. Define whether a resize redraws the still, not a hidden auto-restart.

Do not merge unrelated lifecycles: a WebGL context must release its buffers/textures/
programs, while a CPU particle renderer releases its arrays/references. A common host
can call a renderer's cleanup without pretending every backend has the same resources.

## Ripples and particles: bounded CPU state

**Rings:** store center, age, lifetime and maximum radius for a small fixed pool.
Advance age using clamped delta; draw radius as a function of normalized age and
fade opacity toward zero. Reuse expired slots and cap insertions from pointer
movement. A tap or keyboard action can introduce a ring at a known position.
This suggests a water wake; it does not solve a fluid's velocity or pressure.

**Particles:** use bounded position/velocity/age arrays and an explicit seed or
repeatable initial arrangement where tests need it. Integrate a small force field
with time, not frame count; cap speed/step size and define edge behavior. Avoid
all-pairs interactions unless a measured small N justifies O(N²) work; spatial
partitioning is an option for a real scaling need, not mandatory infrastructure.
Keep the field decorative and separate from factual charts or progress values.

## Glyph scenes and reveal

Construct or load an approved source image, sample cells, compute a luminance/shape
feature and select a glyph from an explicit small alphabet. A simple luminance
ramp is cheaper but loses shape detail; more signatures improve matching at a cost.
Choose cell size in CSS pixels and cap row/column counts. Cache static cell analysis;
a moving reveal mask need not resample unchanged imagery every frame.

Draw the source and glyph layer with a bounded reveal mask or composite them in a
shader. Give keyboard/tap users a useful reveal/stop path. Keep meaningful HTML text
outside; drawing text on a canvas does not supply its semantics. Do not call random
letters encryption. Do not claim arbitrary DOM capture from an original scene.

Cross-origin images can taint Canvas2D/readback. Verify asset rights and origin-clean
loading before use; on rejection show a truthful fallback, not an endless loader.
Never attempt to bypass CORS or capture private UI to obtain a visual effect.

## WebGL distortion: explicit texture and checked shader

Use a small full-screen primitive, a known texture or procedural field, and a
fragment shader that perturbs UV coordinates. An illustrative displacement is
`uv + amplitude * direction(uv, time, pointer)`, bounded so sampling stays in its
intended domain. Clamp or deliberately wrap texture edges; explain the artifact
tradeoff. Start with one pass and modest displacement. Refraction terminology is
visual shorthand unless an actual physical model and evidence are supplied.

Check context creation, shader compilation, program linking and framebuffer
completeness where used. Failure must expose a readable still. Keep uniform units
explicit: CSS-local pointer, normalized coordinates, device-pixel resolution.
Reserve texture units, restore owned state when sharing a context, and avoid
unbounded texture rebuilds on pointer movement. Delete owned resources on destroy.

Test `webglcontextlost` and restoration. Prevent default only when deliberately
supporting restoration; otherwise leave a clear fallback. Do not blindly resume
motion or reuse invalid handles after context restoration. The WebGPU counterpart
needs a separate async device/init/loss contract; API presence is not adapter success.
Never try to switch an already-bound canvas between incompatible context types as
if that guaranteed recovery. A separate DOM fallback is simpler and more reliable.

## Advanced families: recipes, not bundled implementations

**Fluid/smoke:** use explicit velocity/dye fields, advection, divergence, pressure
iterations and projection, commonly with ping-pong targets. Bound grid resolution,
iteration count and splat rate. Check required render-target formats/extensions;
measure stability, dissipation and idle thresholds. A noise warp is not a solver.

**Glass/lens:** refract a known texture with a normal/offset field; use bounded
edge tint or blur only where it adds the requested look. Live interactive DOM is
not a texture by default. Resolve capture support and semantics separately; do
not require experimental HTML-in-canvas for ordinary websites. Keep useful controls
on an opaque, readable plane and define image/context failure behavior.

**Transitions:** maintain known outgoing/incoming surfaces and a bounded progress
parameter. Real navigation/content state wins; never wait for animation to expose
a failed route or hide a focused control. Reduced motion shows the destination
immediately. Handle interruption/reversal and rapid repeated actions explicitly.

**3D:** an approved maintained scene library can be safer than writing loaders,
controls and scene management from scratch. Decide geometry/material/light/camera
first; document asset origin, scale and loading/error states. Cap texture dimensions,
mesh/instance counts and pixel ratio. Cancel or ignore stale loads by generation;
dispose late results and all owned GPU resources. Keep a static image/HTML equivalent
and accessible external controls. These are integration requirements, not a claim
that this package contains a tested 3D engine.
