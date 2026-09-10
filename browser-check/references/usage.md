# Actions and evidence

An action file is an explicit JSON array of at most16 objects (64KiB total):

```json
[
  {"action":"fill","selector":"#demo-name","value":"Example"},
  {"action":"press","key":"Tab"},
  {"action":"click","selector":"#show-preview"},
  {"action":"wait-for","selector":"#preview-ready"},
  {"action":"screenshot"},
  {"action":"scroll","x":0,"y":500}
]
```

Click/fill require exactly one CSS match. Fill refuses password, file, hidden and
credential/one-time-code autocomplete fields. Never put real credentials in actions.
Selectors are<=512characters, fill text<=4096. Press supports Tab, Shift+Tab, Enter,
Escape, Space, ArrowUp/Down/Left/Right, Home and End. Scroll offsets are bounded to
10000pixels per axis. Unknown/extra/duplicate keys fail instead of being ignored.

`wait-for` waits up to5seconds for selector presence, not visibility or business
success. Use a meaningful project-specific ready marker for asynchronous UI work.
Initial navigation waits for its own native document loader. There is no general
claim that a SPA, animation or asynchronous request has settled after a click.
Native project tests remain the right place for detailed application assertions.

Viewport320–3840 by240–2160, device scale1. Images are viewport-only, not full-page.
Each PNG<=8MiB, all PNGs<=64MiB; report<=2MiB. Text/control/error samples are bounded
and may be incomplete. Page JavaScript errors are observations, not an automatic
quality verdict. State actual viewport, actions and limits in the handoff.

Browser work has a60-second operation deadline plus bounded cleanup. The fresh
process uses resource limits, but does not claim a kernel-enforced aggregate RAM
budget or protection against hostile native code. Normal failures and handled
cancellation must stop/reap owned Chrome helpers. A forcibly killed supervisor cannot
promise cleanup; use retained owned identity evidence for recovery, never `pkill`.

Do not overwrite output directories. Evidence may contain private project text or
screenshots; it is owner-private, not automatically uploaded, published or committed.
The caller owns removing unneeded evidence and closing its project preview handle.
