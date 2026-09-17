# Pacing before animation

A page is read at the visitor's speed. Film editing offers relationships between
scenes, not permission to seize scrolling or make people wait. Content density,
scale and recurrence can create cinematic pacing on a completely static page.

## Content rhythms (local P IDs)

| Rhythm | Useful sequence | What carries it | Tradeoff / narrow behavior |
|---|---|---|---|
| **P1 Establish → encounter → invitation** | Show what/where; introduce one real work/person; offer useful next action | Open frame, closer feature, clear dates/link | The opening must still explain the site; narrow reading order stays identical |
| **P2 Wide → close → context** | Place/overview; meaningful detail; explanation and source | Figure aspect/scale changes, then readable column | Needs real detail worth inspecting; preserve separate captions and deliberate crops |
| **P3 Recurrence with changed scale** | Repeat a frame or contour across introduction, process and result | Common edge/shape, changed subject or size | Repetition builds continuity; do not force every page to invent a signature |
| **P4 Montage → quiet hold** | A modest collection; one selected story/quote; related records | Brief captioned entries followed by lower density | The visitor controls reading pace; avoid auto-advancing galleries or empty spacer walls |
| **P5 Sharp cut → sustained detail** | Bold title field; immediate boundary into practical information | Static color/scale contrast; plain content grid | Contrast can be tiring if repeated; use no flash or mandatory entrance sequence |
| **P6 Parallel views → shared account** | Two labelled perspectives; a common explanation | Pairing and repeated captions; explicit relationship | No fake causal before/after; linear reading order must preserve both viewpoints |

A site can use P1 for a homepage, P2 for a project detail and immediate functional
access for its archive/contact page. These are choices, not required section
counts. Keep useful links and metadata where visitors need them, even if that
breaks an imagined movie arc. Do not invent scarcity, authority, social proof or
numbers to fill a narrative beat. Public labels should describe content; internal
“scene thesis” and director names do not belong in UI unless the topic needs them.

Source relation: narrative beats B2–3, B7, B10–12, B15, B19–20 and B24;
compositions #74, #76–77. The sequences above are original combinations, not
prescriptions for named directors.

## Optional motion palette (local M IDs)

Choose **none** unless motion serves a specific purpose. There are no entrance
minima, hero decoration minima or bans on repeating a useful transition. One clear
moment often works better than many, but this is an editing preference, not a quota.

### M0 — The still

Use static light, scale change between sections or a recurring contour. Nothing
moves; content is immediately present. This is also the target for reduced motion,
missing APIs, no JavaScript and optional-feature failure. It should look finished,
not like a stopped loading state.

### M1 — Finite light cue on decoration

An original light/shadow layer can move slightly once to draw attention to a framed
subject. The text, links and geometry remain still. Define an explicit duration,
travel distance, trigger and end state; a proposed starting point might be a
600–900ms, small-distance sweep, to be judged and measured on the actual surface.
It is not a performance guarantee or a required timing range.

Do not replay it on every scroll intersection. Stop or settle it when offscreen,
the document becomes hidden, the user asks to reduce motion or the view tears down.
No essential information is carried by the cue. Source relation: light leak and
camera entrance ideas, rewritten as finite decorative enhancement.

### M2 — Bounded image reveal / cut

A brief opacity change or small edge reveal can mark a requested content update.
The new content and its semantic state must not depend on the effect finishing.
Prefer a stable frame; do not make an incoming image change layout. If the image is
meaningful, ensure fallback content remains available rather than default-hidden.

Use one visual treatment that fits the update. Avoid rapid cuts, flash, blur on
reading text or long stagger delays. Reduced motion shows the final state at once.
Source relation: camera #10 Curtain wipe and #21 Crossfade overlap, without their
unverified film associations or default-hidden snippet contract.

### M3 — Visual rhyme / match cut without route delay

A shared frame or shape can suggest continuity between an index entry and its
actual detail. First make the plain link and destination work. If the project
already supports an approved transition mechanism, enhance it without delaying
navigation, breaking history or losing focus. No dependency is required merely
for this metaphor. Static repetition is often enough.

Browser support/failure must return normal navigation. Reduced motion removes the
transition. Test real loading/error states; do not keep a beautiful outgoing screen
covering a failed destination. Source relation: camera #19 Match cut dissolve;
this is a web continuity analogy, not a reproduction of a film edit.

### M4 — Media hold, not scroll captivity

On a roomy layout, a figure can remain visible alongside related prose with native
sticky positioning. Content still scrolls normally. Use short natural sections,
not artificial hundreds-of-viewport-height spacers. If the media cannot fit the
usable viewport at current width/zoom, return it to normal flow.

The static/narrow version places each figure near its text. All information is
available without pinning, scroll-linked motion or API support. If dynamic media
swaps are explicitly requested, preserve accessible captions and all underlying
content; read production checks before implementing. Source relation: compositions
#43 / #64 and camera #43 Freeze frame hold, stripped of compulsory spacer behavior.

## Motion contract before implementation

Record only what is relevant: purpose, target, trigger, maximum runtime/repeats,
amplitude, easing, static endpoint, interrupt behavior, offscreen/hidden policy,
preference-change handling and teardown owner. Use existing motion tokens if any.
Examples are hypotheses until rendered. A library-count cap is not a GPU budget.

- All meaningful content renders in HTML/server output before enhancement. Scope
  optional code separately from route/form/business logic. Feature-detect in the
  client; never read `window`/`document` during server rendering.
- `prefers-reduced-motion: reduce` applies on first load **and when it changes**.
  CSS must supply still states; JS-owned animation must listen for the preference
  change and cancel/settle work. Do not restart a finished cue when preference
  changes back unless a deliberate user action requests replay.
- Stop optional work offscreen, on `visibilitychange` to hidden and on navigation
  teardown. Cancel animation frames/timers/animations, disconnect observers and
  remove listeners through the project's lifecycle. Resume only if the chosen
  finite contract still permits it; a hidden tab must not accumulate work.
- No default autoplay audio, flashing, shake, system-cursor replacement, wheel
  interception, essential hover-only content or drag-only critical paths. For
  deliberately looping/auto-moving content, provide appropriate pause/stop/hide
  control; default to a finite or still design instead. Video needs its own playback,
  caption/transcript, licensing, bandwidth and control decisions.
- Guard optional initialization. If an API is absent or setup fails halfway, leave
  content visible, controls truthful and listeners cleaned up. An enhancement error
  must not disable a form, blank a page or fake success. Test failure injection.

Sources: [universal beats](https://github.com/akseolabs-seo/cinematic-ui/blob/24a66c1d6140c21ec0d0e4d9ef663a97264003de/references/data/narrative-beats.md#L25-L70),
[camera metaphor entries](https://github.com/akseolabs-seo/cinematic-ui/blob/24a66c1d6140c21ec0d0e4d9ef663a97264003de/references/data/camera-shots-50.md#L7-L80),
[sticky compositions](https://github.com/akseolabs-seo/cinematic-ui/blob/24a66c1d6140c21ec0d0e4d9ef663a97264003de/references/data/compositions.md#L74-L118).
No source animation code is bundled here. Lifecycle and failure requirements are
adaptation-authored production constraints, not upstream test results.

## Optional example: matching frames, discontinuous motion

Use this example for an authorized website with scroll-scrubbed, prerendered clips.
It adds a seam check, not a requirement to animate, generate assets or build a player.

Fictional case: two clips meet on the same doorway image. Both move forward, yet
the approach feels slow and the next room rushes past. Matching that one image
supports appearance continuity only; it does not establish continuous motion.
Inspect three separate things:

- **Displayed endpoints.** Identify the actual decoded boundary frames, source
  revision and served derivative. A frame extracted near the end is not necessarily
  the final frame the player shows. Resizing, cropping or re-encoding can change the
  handoff. Similar pixels or a similarity score are not proof of exact identity.
- **Motion through the seam.** Compare several adjacent decoded frames on each side
  with their timestamps. Follow stable landmarks for direction and apparent speed;
  moving forward on both sides does not rule out a speed or path jump. Image-space
  motion alone does not recover the physical camera's exact position or velocity.
- **Delivered scroll mapping.** Inspect clip duration, scroll distance and easing
  in the actual player, not just source playback. For example, with linear mapping,
  a four-second clip over 800 CSS pixels advances 0.005 source seconds per pixel;
  an eight-second clip over the same distance advances 0.01. If source motion is
  otherwise comparable, the second advances twice as fast per scroll pixel.
  Easing can change the seam rate again; decoder delay and smoothing can lag the
  requested frame. Do not prescribe equal durations as a universal fix.

Within the task's authorized checks, inspect forward and reverse traversal and a
jump across the seam after media readiness and settling. Check the served desktop
and narrow variants where supplied; a master-only check does not cover a changed
crop or encode. Use distinguishable opaque frames when checking a claimed dissolve:
if the incoming fade stays behind a fully opaque outgoing layer until it switches
on top at full opacity, the viewer sees a cut, not a blend.

Correct the relevant frames, timing or layer behavior when authorized, or choose an
honest cut or static presentation. Preserve every meaningful state and caption;
one poster must not erase the relationship. Keep the existing [motion contract](#motion-contract-before-implementation)
and [production checks](production-checks.md), including static content and controls.
Interactive seeking is not deterministic export. Report unavailable rendered checks
and remaining limits; no universal similarity threshold or extra model calls follow
from this example. See [source selection and limits](../SCROLL_WORLD_SOURCES.md).
