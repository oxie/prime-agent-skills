# Control motion, tooltip timing and DOM diagnosis

Use only the section that matches an authorized Hallmark task. This is not a
mandatory motion pass, a component library or a reason to add animation.
Keep the selected workflow and existing stack. Native CSS or an existing primitive
may be enough; do not install a library or migrate APIs to follow this reference.
Use [app-quality.md](app-quality.md) for control contracts and
[verification.md](verification.md) for evidence and handoff.

## 1. Tune an existing microinteraction

Start with a named problem: a menu jumps on reversal, a sidebar feels slow, or
repeated feedback competes with work. State what the motion explains and how often
it repeats. An instant state change can be the better repeated-use design.

- Trace the requested state, current visual state and any pending completion.
  Try open → close → open before settling. Retarget from the current position;
  avoid restarting an entrance or letting an old completion overwrite newer input.
  A CSS transition can support this; keyframes and existing animation APIs can too.
- Change one relevant variable at a time: distance/scale, duration, origin or easing.
  For a small popover, 160ms, scale 0.96 and a 150ms exit are illustrative starting
  hypotheses, not limits or measured improvements. Judge at actual size and speed.
- Derive transform origin from the trigger and resolved placement. Recheck collision
  flips, RTL, narrow screens and zoom; do not copy a fixed bottom-left corner.
- Choose acceleration, overshoot and settling to fit the job. A quick initial
  response with a quiet finish may suit feedback. Springs are not inherently wrong;
  conspicuous repeated bounce may be. Avoid adding blur to hide an unresolved defect.
- Keep real operations independent of decorative timing. Start the actual save,
  copy or navigation when its contract requires; show success only when confirmed.
  Busy/disabled states follow real work, not an animation lockout. Preserve error,
  pending and unknown outcomes and the project's existing reconciliation behavior.
- An exit may retain a visual node briefly, not an invisible action target.
  Keep expanded/selected state truthful; move or restore focus at the semantic
  close and remove closed content from keyboard, pointer and assistive interaction.
  Opacity, pointer-events or aria-hidden alone do not solve all three contracts.
- Preserve accessible names, status announcements and the widget's existing keys,
  dismissal and focus rules. A fading duplicate label must not duplicate announcements.
  Keep hit areas stable. Essential content must remain usable without the effect.
- Respect reduced motion at startup and when the preference changes live. Settle
  or remove nonessential motion without losing state, focus or pending operations.
  Cancel stale timers, listeners and animation callbacks on replacement or teardown;
  do not depend on an animation-end event that cancellation can prevent.

For an implementation, verify pointer/keyboard use, early/mid/late reversal and
rapid repeated input reaching the last requested state. Check focus during exit,
placement/RTL, reduced motion live, route teardown and real success/failure timing.
Run relevant native checks. A screenshot alone proves none of these behaviors.

## 2. Bound warm tooltip timing in a real toolbar

Use only for adjacent tools where repeated delay is a named problem. Prefer an
existing accessible provider's group-delay feature. Do not add a tooltip system
for self-explanatory controls or hide essential instructions behind hover.

- Cold: first eligible pointer reveal waits the chosen initial delay. Leaving or
  changing the target cancels its pending open; stale callbacks cannot open old tips.
- Warm: enter this state only after a tooltip actually opens. Nearby tools in the
  same bounded group can open with less delay. Do not warm unrelated toolbars.
- Cooling: when neither pointer nor focus remains in the group or its active
  tooltip, start a finite idle deadline. Re-entry before expiry can retain warmth;
  expiry returns to cold. Warmth must not persist for the entire component lifetime.
  An initial 500ms delay is illustrative; choose the warm delay and idle window
  for the project. Keyboard focus need not inherit the pointer's waiting period.
- Keep names available without tooltips and IDs unique across instances. Preserve
  Tab/Shift-Tab and Escape dismissal without moving focus into a noninteractive tip.
  Escape cancels pending opens and must not immediately reopen the same tip until
  a deliberate new interaction. Keep supplemental hover content hoverable and
  persistent while needed; support a touch alternative where information is needed.
- Track pointer and focus together so one leaving does not wrongly close the other's
  active tip. Follow the existing primitive's dismissal and portal/hover-region model.
  Cancel open/cool timers on teardown; remove stale description relationships.

Test cold/warm/cool elapsed behavior, leaving before reveal, rapid traversal, idle
return, Escape, focus/pointer overlap, touch, multiple instances and pending-timer
unmount. Check actual assistive output and zoom/edge/RTL placement, not IDs alone.

## 3. Diagnose DOM-motion cost only for a named performance concern

Locate the interaction and source owner before changing technique. List geometry
reads, layout-affecting writes, their order/frequency and other code touching them.
Repeated write → forced geometry read across many elements is a thrashing candidate.
A bounded before/after endpoint measurement is different: it can require deliberate
layout. Batch compatible reads and writes without erasing a needed endpoint read.
A requestAnimationFrame callback alone does not prevent forced layout.

Prefer the least costly approach that preserves endpoint geometry, document flow,
scroll range, hit areas, text and focus. Scaling a panel is not equivalent to
resizing it. Transform/opacity can help but do not guarantee cheap compositing.
Inspect affected area, paint work, layer count/size and frame or long-task evidence
before claiming a speedup. Use will-change only with a reason and remove temporary
hints. Bound animation loops and clean up observers/listeners; hiding is not teardown.
Do not impose blanket bans on scroll handlers, CSS variables, springs, view
transitions or blur sizes. Evaluate actual work, support, cancellation and fallback.

Report source-supported risks separately from measured causes. Actual performance
measurements are unavailable from this reference. Shared browser-check supports
only its authorized local checks, not public browsing or performance traces. Use
separately approved target-project measurement tools when needed; otherwise mark
frame/paint/layer claims not tested. No dependency or tool capability is added here.
