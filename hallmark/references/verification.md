# Evidence-based handoff

Pick checks for the actual change. These are a work checklist, not a numeric score or
claim that every task needs a full audit. Report pass/fail/not tested with evidence.

| Area | Useful evidence |
|---|---|
| Scope | Before/after diff; shared files unchanged for a component or Variate round |
| Build | Target project's normal build/typecheck/test command and completed exit code |
| Rendering | Actual screenshot/browser at desktop and narrow widths; representative 320–414px plus project breakpoints |
| Reflow | Overflow measurements and visual inspection; long labels/content and text zoom, not root clipping |
| Interaction | Real keyboard Tab/activation and pointer actions; no invisible focus or trapped modal |
| States | States the component truly supports; disabled controls, loading/errors only when backed by real logic |
| Contrast | Measured foreground/background pairs for the actual rendered states; WCAG ratios or clearly labelled APCA Lc, never “APCA 7:1” |
| Motion | Reduced-motion preference actually exercised; video needs a pause/static alternative, not merely a poster attribute |
| Content | Supplied facts preserved; real links/actions; placeholders and unimplemented backend clearly labelled |
| Assets | Exact source license/attribution checked for any newly acquired font/photo/icon |

Do not infer actual computed font use or visual rhythm from HTML declarations. Do not
count absence of a motion library as proof of no motion. Browser measurements complement
visual inspection; neither certifies all assistive technology. Run only bounded tests
and own any preview process with a recorded handle. Shut down owned processes after use.

A useful final reply is brief: changed files, chosen direction and tradeoff, actual
checks, and limits. Do not claim conversion improvements without measurement. For
screenshot study/audit, explicitly separate observed facts from inferred recommendations.
