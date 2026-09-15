# Product UI demos and frame-driven export

Use the relevant section when making an authorized product UI video or verifying a
frame-driven export. Video owns the production; Hallmark owns interface design and
Image owns asset preparation. This is not a new renderer, website redesign, browser
crawler, mandatory storyboard file or second approval workflow. Reuse the current
brief and [edit anatomy](edit-anatomy.md) when a reference edit is involved.

## Choose what must change on screen

| Required behavior | Smallest suitable representation | Keep honest |
|-------------------|----------------------------------|-------------|
| Show an existing screen or inspect one area | Approved screenshot or recording with framing/callouts | Source version, capture dimensions, redactions and actual visible content |
| Animate a few objects while most of the screen stays fixed | Screenshot plus selected overlays/slices | Original coordinates, crop/scale and final alignment; avoid a duplicate underneath |
| Show changing text, tabs or states that need independent timing | Reconstruct only the required UI region | Label simulated behavior; a staged response is not a successful live operation |

Choose by required behavior, not fixed effort estimates or a universal preference
for reconstruction. Do not invent features, results, testimonials or user data.
A real recording may be better than any reconstruction. Use owned/approved assets;
public availability or an official logo does not grant every reuse right. Remove
private data before capture/export. Do not expand into account access or external
asset collection without authorization.

For an overlay, keep one coordinate basis: screenshot CSS dimensions, pixel density,
crop and display scale. A slice should return to its intended slot, not merely near
it. Keep the target, pointer and explanatory text visible at the destination size.
A decorative pointer animation is not evidence that the underlying control works.

## Define scenes before expensive rendering

For each important beat, name the message, visible state, time range, needed assets
and a representative acceptance frame. Use as many beats as the content needs; no
fixed shot count, motion quota, camera multiplier or all-frame cover test applies.
Allow time to read results and captions. Static holds and ordinary cuts are valid.
Keep style coherent while varying composition only when it helps the explanation.

A compact fictional check: an approved search demo shows an input, then a labeled
simulated result. Inspect the frame before submission, the pending state and the
result hold. The displayed timing must not be presented as measured product latency.
If the task requires real performance evidence, capture and report that separately.

## Make state seekable

Use the project's selected frame/time interface. A direct seek to time t, a backward
seek to t and linear playback to t should produce the same intended scene state.
Do not rely on click history, uncaptured hover, wall-clock timers or unseeded randomness
to reach a required state. Initialize time zero and check the final valid frame; a
last-frame loop back to the opening is not a finished ending.

Separate interactive-preview controls from rendered playback. Keep actual controls
usable where interaction is required; do not delete event handlers indiscriminately.
Wait for the actual fonts/media and application readiness signal, with bounded errors,
rather than treating a fixed delay as success. Pin the relevant asset/tool versions.
Frame-state repeatability is not a promise of byte-identical encoding across machines.

## Verify the delivered file

Select checks for the agreed output, not every possible platform:

- Inspect completed command exits and the current artifact's identity. A partial
  export, missing scene or stale output is not complete even if a wrapper exits zero.
- Confirm duration, dimensions, frame rate and required streams. Check decoded frames
  at the opening, scene boundaries, key states and ending for clipping, unreadable text,
  missing assets and unintended blank/duplicate frames. Metadata alone cannot prove this.
- Compare captions, claims, order and required content against the original approved
  source, not only an exporter's intermediate extraction. Do not strip meaningful
  whitespace, punctuation or units to make content comparisons pass.
- Audio is optional according to the brief. If included, listen at the beginning,
  middle, end and key cues for intelligibility, unintended silence, clipping and sync.
  An audio stream's presence does not prove audible content. Use licensed material;
  no default music, watermark, voice cloning or cloud narration is implied.
- Where a specific player or presentation application matters, inspect it there.
  A known-good comparable file helps diagnose renderer/font failures, but does not
  clear defects in the new output. An unavailable target-player check stays untested.

Use unique owned scratch paths and preserve prior deliverables. Stage the new output
until required checks pass. Treat cue sheets/timelines as parsed data, never interpreter
source. Inspect the renderer's network behavior: local HTML is not necessarily offline.
Any cloud review needs explicit payload/destination and spending approval; it is not
part of these checks by default.

Report which checks ran, which scenes/frames were sampled, any omissions and remaining
limits. A source or metadata check is not a rendered review; a polished simulation is
not a production test. See [source notes](../../../HUASHU_SOURCES.md).
