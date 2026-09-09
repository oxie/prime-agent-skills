# Production checks: preserve the useful website

Apply checks to the actual changed scope. A cinematic fixture passing a check does
not prove that a different site passes. Hallmark leads UI quality; the project's
native engineering contracts still own app/backend correctness and security.

## Before changing code

Read callers/components and existing tokens, route handling, content and approved
tools. Keep auth, API/data shapes, permissions, validation, analytics and business
logic unchanged unless explicitly in scope. A visual change must not fabricate
submission success, a live metric, a purchase, a testimonial or a backend service.
Use real labels and destinations; do not ship `href="#"` as a pretend CTA.

Build the still, semantic version first. Keep scope-local CSS and existing file
organization; no mandatory token rewrite, design-doc trio, framework or starter.
For dependencies, check existing project code, platform capabilities and approved
maintained packages. Add a dependency only with the required authorization and a
specific contract native options cannot meet. No CDN, cloud, font provider, shader
library or asset download is a prerequisite. Do not execute reference snippets or
fetch a library merely because a reference mentions it.

## Content, input and layout

- Use real headings, landmarks, paragraphs, lists and figure captions. Match DOM
  and visual reading order. Use links for destinations, buttons for actions and
  native form controls where suitable. Decorative layers have no accessible name,
  tab stop or pointer interception; meaningful images have useful alternatives.
- Preserve truthful labels, loading/empty/error states and recovery paths. Keep
  existing form submission, validation and focus behavior. Do not substitute a
  visual mockup for a working component. Do not imply visual review is a security audit.
- Test keyboard tab/shift-tab, activation, visible focus and anchor targets. Test
  dialogs/disclosures or other widgets only when present, including expected keys,
  state announcements and focus return. Never hide the system cursor or require
  hover, drag, wheel interception or precise pointer motion to reach information.
- Inspect real desktop and narrow layouts including **320px**. Check long copy,
  translated labels where relevant and **200% text resize**. Avoid clipped headings,
  fixed text heights, overlay collisions and root overflow hiding as a repair.
  Sticky elements cannot conceal focus targets or defeat short-height/zoom use.
- Measure contrast for actual foreground/background pairs and interaction states,
  including changing image/light areas. As a baseline, ordinary text needs 4.5:1,
  large text 3:1, and relevant UI components 3:1 against adjacent colors.
  Keep focus indicators clearly visible and measure their relevant contrast;
  apply the project's applicable accessibility requirements and exceptions correctly.
  Sampling one pair is not an accessibility audit. Include hover/focus, disabled
  context, gradients and optional-feature-off states where relevant.
- Preserve visible link affordance, touch targets, native zoom, reduced motion and
  platform accessibility settings. No flashing/strobing as a default cinematic cue.
  Contrast and semantic tests need rendered evidence, not just token names.

Reference standards: [WCAG contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html),
[non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html),
[reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html),
[resize text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html),
[pause/stop/hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html).
These links identify standards, not checks already performed or a compliance claim.

## Enhancement and motion lifecycle

Read the [motion contract](pacing-motion.md) for any optional motion. Specify the
trigger, maximum duration/repeats, endpoint and cancellation. A still page needs no
JavaScript merely to report “animation disabled.”

| Condition | Required behavior to exercise |
|---|---|
| First render / SSR | Meaningful content and links in HTML; browser-only setup runs only on the client; no hydration-dependent blank screen |
| No JavaScript | Readable composition, useful anchors/links and honest static controls; essential backend forms use their actual supported fallback |
| `prefers-reduced-motion: reduce` on load | No nonessential motion; stable final visual state, no hidden text waiting for observers |
| Preference changes while loaded | Cancel/settle JS and CSS decoration immediately; leave content/controls intact; do not secretly restart completed cues |
| Offscreen or document hidden | Stop/cancel optional work according to finite contract; no idle animation-frame/timer loop burning resources |
| Route unmount / teardown | Cancel frames, timers and animations; disconnect observers; remove listeners; dispose requested graphics resources |
| Unsupported optional API | Skip enhancement, not content; provide solid visual fallback for filters/masks/graphics |
| Optional initialization fails | Roll back partial enhancement/listeners; content visible and usable; no fake success or swallowed application error |
| Image/font/video fails or is slow | Reserved dimensions, readable fallback, truthful media state and functional controls; no indefinite decorative loader |

Use feature detection and guarded optional setup. A catch around decoration must
not hide required application failures. Test missing `IntersectionObserver`,
`Element.animate`, graphics context or whichever optional feature was actually
used, not an unrelated API. A missing-feature test and a thrown-initialization test
are different. Inspect reduced-motion transitions both before and during animation.
Continuous media, if explicitly needed, requires suitable controls and its own
caption/transcript, audio, motion and bandwidth decisions.

## Resource budget: choose, measure, report

Before adding heavy media/effects, agree a project-appropriate budget or reuse its
existing one. Identify the critical content, target devices/network and acceptable
resource tradeoffs. A library count or CSS property is not a performance result.

Measure what the changed implementation can affect: transferred media/font/script
bytes, requests, layout shift, LCP/INP or relevant lab proxies, long tasks, interaction
latency, animation frame work and work while hidden/offscreen. Record browser,
viewport, device/network conditions and capture procedure. Local fixture bytes are
not compressed transfer bytes; desktop lab timing is not field performance.
No scores, “GPU accelerated therefore fast” claims or universal numeric budget is
provided by this skill. Respect project budgets, and label metrics not measured.

Reserve media space; use approved responsive images and appropriate loading rules.
Do not lazy-load the critical hero blindly. Avoid large animated blur/backdrop
regions, unnecessary `will-change`, unbounded particles and always-on noise loops.
Suspend rather than merely conceal expensive effects. A package-free implementation
can still be slow, and an approved maintained dependency can be the correct choice.

## Verification and delivery

Run the actual project's native build/tests and inspect completed exit codes. Use
its approved preview/browser tooling without installing or starting new services
implicitly. Inspect actual screenshots at representative desktop/narrow widths,
then exercise keyboard, anchors, reflow/text resize, reduced motion and applicable
failure states. Check console errors and unexpected network requests. Test real
controls and destinations, not only screenshots or selector counts.

For read-only study/audit, do not run mutating builds or start a preview without
authorization. Mark unavailable checks **not tested**; source review cannot certify
rendering, input behavior or performance. Preserve failing receipts instead of
weakening valid checks. Review the final diff for scope and accidental changes.

Handoff: changed files; thesis and chosen craft entries with tradeoffs; actual source
and asset permissions/limits; completed check commands/results and screenshots;
remaining failures and untested conditions. Do not claim accessibility compliance,
originality, conversion improvement or production readiness from visual polish.

The bundled [fixture verification](../tests/BROWSER.md) is a bounded educational
example, not a required project test harness or permission to publish a website.

Provenance: the upstream [native-first decision and screening](https://github.com/akseolabs-seo/cinematic-ui/blob/24a66c1d6140c21ec0d0e4d9ef663a97264003de/references/implementation-guardrails.md#L9-L28)
inspired a small part of this reference. Detailed semantic/input, lifecycle,
failure and measurement checks above are adaptation-authored, aligned with
Hallmark and ordinary project engineering, not claims about upstream validation.
