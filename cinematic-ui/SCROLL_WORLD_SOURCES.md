# Scroll World: selected continuity lesson

Source: [oso95/scroll-world](https://github.com/oso95/scroll-world), pinned at
`71cc36d3bb150248ae36a2c552f9cbf88802a79c`; plugin manifest version 0.8.0.

## Selection and limits

[Pacing and motion](references/pacing-motion.md) gains one optional original example:
matching endpoint appearance does not establish adjacent-frame motion or continuity
under the delivered scroll/time mapping. The doorway and four/eight-second arithmetic
are fictional local teaching examples, not measurements of upstream output.

| Pinned source | Selected evidence | Treatment |
|---|---|---|
| [SKILL.md](https://github.com/oso95/scroll-world/blob/71cc36d3bb150248ae36a2c552f9cbf88802a79c/skills/scroll-world/SKILL.md#L467-L519) | Clip-frame handoff and seam review | Keep actual-endpoint intent; distinguish similarity from identity and motion continuity |
| [pipeline.md](https://github.com/oso95/scroll-world/blob/71cc36d3bb150248ae36a2c552f9cbf88802a79c/skills/scroll-world/references/pipeline.md#L85-L96) | Near-end extraction; image upload conversion at216–225 | Verify actual displayed frames and served derivatives, not assumed exact handoff |
| [scrub-engine.js](https://github.com/oso95/scroll-world/blob/71cc36d3bb150248ae36a2c552f9cbf88802a79c/skills/scroll-world/references/scrub-engine.js#L172-L288) | Scroll bands, easing, opacity/stacking and asynchronous seeking | Original mapping example and opaque-layer check; not an engine port |
| [LICENSE](https://github.com/oso95/scroll-world/blob/71cc36d3bb150248ae36a2c552f9cbf88802a79c/LICENSE) | MIT, cyw2026 | Full notice below; earlier Cinematic UI licenses remain unchanged |

No upstream code or substantial prose is copied. No upstream tests or model calls
were run. Source reasoning found that the supplied opaque-video layers switch on top
already opaque rather than visibly dissolving. Near-end extraction, finite reported
PSNR and JPEG conversion do not establish exact frame identity. These are qualified
source findings, not rendered reproductions or proof that every generated seam fails.

FFmpeg documents [-sseof](https://ffmpeg.org/ffmpeg.html) as seeking relative to EOF
and [PSNR](https://ffmpeg.org/ffmpeg-filters.html#psnr) as a mean-square-error-derived
measure. [MDN seekable](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/seekable)
describes currently seekable ranges, not a painted-frame or deterministic-export
certificate. Only relevant documentation sections were inspected. No universal
similarity threshold, exact camera reconstruction or provider capability is claimed.

The production-scenes reference already separates endpoints from physically valid
in-between states. This addition supplies temporal and delivered-interaction detail,
not a second generic lifecycle checklist. Use existing production/static/input
contracts. Interactive media is not an export renderer. Documentation, arithmetic,
packaging and history checks establish their stated contracts, not model effectiveness,
rendered continuity, browser compatibility, accessibility or performance.

Not included: the player, shell pipeline, PIL utility, templates, generation prompts,
provider installation/routing, paid probes, automatic retries, new skill or mandatory
rendering/model workflow. Repository MIT does not clear third-party media, brand marks,
provider outputs or service terms. Existing task permissions govern assets and spend.

## Source notice

MIT License

Copyright (c) 2026 cyw

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
