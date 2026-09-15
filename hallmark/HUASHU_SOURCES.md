# Original CJK addition after Huashu review

The CJK section in references/ui-localization.md is original local guidance under
Hallmark's existing local license. It preserves the earlier reference and source
notices, whose historical hashes are not rewritten.

Review input: [Huashu typography](https://github.com/alchaincyf/huashu-design/blob/c4b83675d1cdc1a6f43039518db9057749931758/references/typography.md).
Huashu's root license is MIT, Copyright (c) 2026 alchaincyf (花叔 · 花生).
No upstream prose, code, fonts or assets are copied. No font-name authorship test,
fixed punctuation style, automatic download or new localization pass is introduced.

Primary references are linked in the CJK section: W3C Chinese layout requirements
and the Inter author site. CSS Fonts/Text evidence informed the fallback and wrapping
checks; Chinese-specific guidance is not presented as Japanese or Korean rules. Use language, region and writing
mode plus actual font/rendering evidence, not a universal CJK rule. Inter's official
site also documents text and display optical sizes; a font name cannot establish
AI authorship. MDN compatibility evidence contradicts universal text-wrap: pretty
support; check the target browsers instead of promising it.

The repository integration record (marketingskills/huashu-provenance.json) records
review source hashes and this original payload. Existing next-provenance.json and
its source/license records remain unchanged. Tests reconstruct exact predecessor
bytes for historical assertions only; unknown mutations do not gain acceptance.

[Inter](https://rsms.me/inter/) · [MDN text-wrap](https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap)

This is source-supported guidance, not a font-license audit, rendered-language test
or accessibility certification. No upstream runtime or model experiment was used.
