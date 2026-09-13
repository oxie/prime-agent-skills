# Interaction evidence → implementation brief

Use on demand for a supplied UI clip or selected local HTML/source when the task
asks how an interaction works or how to rebuild its mechanism. Keep the requested
output: diagnosis, prompt or implementation brief. This does not authorize a build,
new captures, an article pack or external browsing. Start with the reference's job in
[reference synthesis](reference-synthesis.md); preserve the real brand and content.

## Extract a behavior, not a screenshot theme

Read available HTML, CSS and scripts together. Trace the event/observer into the
state change and rendered property. A library import alone does not confirm that it
drives the observed interaction. For clips, inspect actual frames with the available
image/video tools; keep source identity, original timestamps and crop/viewport.
Sample densely around a short transition rather than treating one frame per second
as timing evidence. Edited footage, speed changes and synthetic screenshot pans must
be labeled; their timeline is not necessarily the application's timeline.

Use one row per independently useful behavior in the existing task output:

| Evidence location | State and trigger | Driver status | Rebuild proposal | Assets | Fallback/input | Failure to test |
|---|---|---|---|---|---|---|
| File + line range, or clip + original timestamp/frame | Initial → changing → settled; input actually seen | Source-confirmed with call path, inferred, or unknown | Property, API, lifecycle and proposed timing | Role, available file or labeled missing asset | Narrow/touch/keyboard, reduced motion, no JS/error | An observable bad result, not “looks wrong” |

Separate observation from cause. A panel holding its screen position while content
moves is observable. Native sticky, timeline pinning and a video edit can produce a
similar image. Exact easing, duration, library identity, scroll-versus-time causality
and unseen mobile states remain unknown without stronger evidence. If timing is
estimated, state the sampled interval and uncertainty. Proposed constants are tuning
choices, not recovered facts.

## Choose the smallest matching mechanism

- CSS transitions for local hover/focus/pressed states; retain a native semantic
  control and visible focus. A hover-only cue needs an equivalent touch behavior.
- IntersectionObserver for entering/leaving a region; CSS or WAAPI for the reveal.
  IO is a visibility trigger, not a continuous scroll-progress clock. WAAPI helps
  when cancellation, reversal or explicit completion is required.
- Native `position: sticky` for a panel held within its section. Check ancestor
  overflow, available scroll distance and the sticky element's height first.
  Timeline pinning is for a needed coordinated handoff, not ordinary stickiness.
- Native scroll-snap for a simple horizontal strip; use existing carousel tooling
  only for required controls, looping or drag behavior that snap does not supply.
- For verified scroll-scrubbed video, map normalized section progress to the media's
  seekable duration after metadata loads, clamp it, and coalesce seek requests.
  Test reverse/fast scroll and failed loading. Autoplay is not equivalent to scrub.
- Use Canvas Effects only for a real canvas/shader mechanism. Cinematic UI owns
  narrative art direction; the image skill owns asset creation and video owns footage
  or edit analysis. None of these handoffs grants new tool or asset permissions.

## Worked UI example — hypothetical, not inspected source

Suppose a supplied museum-programme clip `programme.mp4` shows a date panel staying
near the top between original timestamps 00:04.00 and 00:07.20. Programme cards rise
into view. Frames at 00:04.00, 00:04.12 and 00:04.32 show one card faint/low, moving,
and settled. Scrolling appears in the clip; exact scroll coupling is unknown.

| Evidence | State/trigger | Driver and proposal | Asset/fallback | Failure |
|---|---|---|---|---|
| Hypothetical `programme.mp4`, times above | Date panel holds; cards enter; no reverse or touch shown | Driver unknown. Propose native sticky plus IO-triggered WAAPI card entrances; not a scrubbed timeline | Approved programme image with reserved size; missing image gets a labeled slot. Real title/date remain HTML | Panel covers a focused link; repeated entrances flash while scrolling back |

The following is a proposed implementation sketch, not extracted source. Scope it
to the programme component. These values illustrate the decision, not exact easing
recovery. Cards remain readable if JS/IO/WAAPI is unavailable.

```css
.programme__date { position: sticky; top: 1rem; align-self: start; }
.programme__link:focus-visible { outline: 2px solid currentColor; outline-offset: 4px; }
@media (max-width: 48rem) {
  .programme__date { position: static; }
}
```

```js
// Called by the component's mount; register its return value with unmount.
function mountProgramme(root) {
  const cards = [...root.querySelectorAll('.programme__card')];
  if (!('IntersectionObserver' in window) || !('animate' in Element.prototype)
      || !('matchMedia' in window)) return () => {};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const active = new Set();
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target); // Once, not repeated on reverse scroll.
      if (reduced.matches) continue;
      const motion = entry.target.animate([
        { opacity: 0.3, transform: 'translateY(12px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 240, easing: 'ease-out' });
      active.add(motion);
      const release = () => active.delete(motion);
      motion.finished.then(release, release); // Cancellation rejects finished.
    }
  }, { threshold: 0.15 });
  const settle = () => {
    if (reduced.matches) {
      for (const motion of active) motion.cancel();
      active.clear(); // Underlying CSS is the settled readable state.
    }
  };
  reduced.addEventListener('change', settle);
  cards.forEach(card => observer.observe(card));
  return () => {
    observer.disconnect();
    reduced.removeEventListener('change', settle);
    for (const motion of active) motion.cancel();
    active.clear();
  };
}
```

No hover is needed to reveal programme information. Native links retain Tab/Enter
and touch activation. At narrow widths the date becomes normal flow; reduced motion
shows settled cards, including when the preference changes during a reveal. A missing
image must not collapse layout. Test focused links around the sticky panel, deep
entry, reverse/fast scroll, JS disabled and unmount mid-reveal in the actual project.
A card taller than the viewport may never meet this example's intersection threshold;
it still remains readable. Adapt the trigger if that entrance is required.

Report inspected states separately from proposed states and untested behavior. The
example is not proof that the museum UI exists or that its native tests have run.

Method adapted selectively from MengTo/Skills, commit
`321c769739b823de5eb94eb3a52aa1974fe783a2`: `html-to-interaction-prompts` and
`video-to-superprompt` (including `references/superprompt-template.md`).
