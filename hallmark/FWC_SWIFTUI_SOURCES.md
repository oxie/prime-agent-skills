# FWC SwiftUI: selected resize-continuity lesson

Source: [FloWritesCode/fwc-swiftui-skills](https://github.com/FloWritesCode/fwc-swiftui-skills/tree/c2454e6948175e25e61c107c6dc7ebf03e291dfe),
commit `c2454e6948175e25e61c107c6dc7ebf03e291dfe`. The new structural resize example in
[app-quality](references/app-quality.md#structural-resize-round-trip) is original prose,
not copied implementation or a SwiftUI port. Existing wording on that page is tightened
to retain its reading budget; its accessibility, scope and verification safeguards remain.

## Selection and corrections

The source's [adaptive reference](https://github.com/FloWritesCode/fwc-swiftui-skills/blob/c2454e6948175e25e61c107c6dc7ebf03e291dfe/skills/swiftui-iphone-duo/reference.md)
Rules 19–21 distinguish layout transitions from application-state changes, require
intermediate widths and bound reading lines. Rule 15 handles asymmetric insets.
Its [entrypoint](https://github.com/FloWritesCode/fwc-swiftui-skills/blob/c2454e6948175e25e61c107c6dc7ebf03e291dfe/skills/swiftui-iphone-duo/SKILL.md)
recommends preparation instead of untestable hardware assumptions.

The original local scenario checks selection, an unsaved edit, focus and scroll context
through a compact → intermediate → wide → compact round trip. Related panes are optional,
not a density quota. A local obstruction need not replace the whole screen. Resizing
must not replay operations; intentional context changes remain distinct from accidental
state loss. Apply only to the authorized structural layout change, not every visual edit.

Apple's [AnyLayout documentation](https://developer.apple.com/documentation/swiftui/anylayout)
explicitly supports changing layout type without destroying subview state;
[ViewThatFits](https://developer.apple.com/documentation/swiftui/viewthatfits) instead
chooses among alternatives. They are not interchangeable identity guarantees.
[Apple's preparation talk](https://developer.apple.com/videos/play/tech-talks/111461/)
confirms asymmetric safe areas and independent edge handling. These support the concepts,
not a claim that our fictional regression scenario has been executed.

Native recipes are excluded: the upstream Liquid Glass samples need the required
`edge:` label on `safeAreaBar`; effect feedback is not button action semantics; a
padding estimate is not an API guarantee. Apple confirms the Duo APIs in current
talks, but announced APIs are not local SDK or simulator verification. Scene accessories
are not universally Duo-exclusive, and camera-accessory use has dynamic conditions.
No hardware dimensions, universal fixed-column ban, forced full-app refactor or
unverified native availability rule enters Hallmark.

## Rights and evidence limits

Upstream is MIT, Copyright (c) 2026 FloWritesCode; see its
[license](https://github.com/FloWritesCode/fwc-swiftui-skills/blob/c2454e6948175e25e61c107c6dc7ebf03e291dfe/LICENSE).
No upstream code or substantial prose is copied. Apple documentation, media, trademarks
and external installer rights remain separate. Original guidance uses this owner's
existing terms; no upstream endorsement or relicensing is implied.

fwc-swiftui-provenance.json records pinned source identities and current local hashes.
Earlier source pins, licenses, pilots and hashes remain historical and unchanged.
No SwiftUI pack, installer, runtime, new skill, routing change or automatic test process
is installed. Source review and local wording/history/loading checks do not establish
rendered behavior, accessibility certification or model effectiveness. No Swift code,
simulator, browser or model trial was executed for this addition. Use the project's
existing authorized checks on a real task; unavailable checks remain not tested.
