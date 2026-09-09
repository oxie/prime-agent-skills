# Frame and space

Select by content hierarchy, not by movie reputation. Local C IDs describe ideas,
not tested layout components. “Wide” describes a frame, not a requirement for
`100vw`, viewport-height sections or fixed black bars. Use container-aware layout.

## C1 — Weighted split: subject and explanation

Give a figure more area than the adjacent explanation (roughly 3:2 is a sketch,
not a golden-ratio claim). Align a short title with a meaningful edge of the
figure. Keep metadata in a quiet rail. This makes a product, building or portrait
feel observed rather than one card among many.

- **Use:** object introduction, case-study opening, profile.
- **Tradeoff:** strong subject focus; less room for parallel options. Use equal
  panels instead if the visitor must compare two equally important things.
- **Narrow:** title, figure, caption and explanation in meaningful source order.
  Use `minmax(0, …)` tracks; reset offsets instead of shrinking text.
- **Still:** completely static; light direction or image crop can provide tension.
- **Upstream:** compositions #15–16 and #34–35; hero #15 Asymmetric Weight.

## C2 — Framed stage: a world inside the page

Place one real figure or original visual inside an inset frame with deliberate
space around it. The frame may be pale paper, a fine border or a dark solid stage.
Set the headline outside the picture if its contrast would depend on image content.
A shallow caption rail gives the frame a scale and a grounded purpose.

- **Use:** cultural event, lighting/object portfolio, artist project.
- **Tradeoff:** frame creates attention but reduces image area. Do not add faux
  controls, decorative scroll bars or browser chrome that looks interactive.
- **Narrow:** let the frame become taller if the subject needs it; use a dedicated
  approved crop rather than cropping away faces, text or the featured object.
- **Still:** a sharp foreground edge and soft backdrop give depth without parallax.
- **Upstream:** hero Pattern F / #18 Framed Viewport; compositions #73 adapted
  without fixed bars; visual element #31 Frame Border.

## C3 — Landscape → detail: change the scale of attention

Open with a broad, bounded figure that establishes place or context. Follow it
with a smaller detail and a readable explanation. Repeat one edge alignment so the
change in scale feels intentional. A panorama can be an original abstract horizon
when photography is unavailable; do not imply it documents a real location.

- **Use:** architecture, travel/editorial, environmental project, object process.
- **Tradeoff:** a wide crop establishes space but discards vertical information.
  Inspect a separate narrow crop. Never squeeze the scene into a fixed letterbox.
- **Narrow:** allow natural figure height and captions outside imagery; keep the
  overview → detail → explanation sequence. No full-screen interstitial.
- **Still:** sequential scale changes carry the story without scrolling transforms.
- **Upstream:** compositions #17–18 and #74.

## C4 — Reading room: cinematic intimacy without spectacle

Constrain prose to a comfortable measure, with generous outer space and deliberate
section gaps. A wider opening figure or title makes returning to the text feel like
moving closer. Keep captions near figures; put nonessential metadata outside the
main reading column only when it fits.

- **Use:** documentary essay, programme notes, interview, thoughtful brand story.
- **Tradeoff:** sustained attention rather than maximal above-fold density. For a
  searchable archive, keep the established list/filter view and use this for detail.
- **Narrow:** margins reduce, not font size; rails become normal-flow metadata.
  Long URLs and headings wrap. Do not justify prose into rivers of whitespace.
- **Still:** the default. A reading page needs no entrance treatment.
- **Upstream:** compositions #27, #31 and #72; typography 6.1 / 6.5.

## C5 — Type monument: the title is the scene

A short meaningful title dominates the frame. Support it with a small, clearly
separate programme/date/action band. Scale, line breaks and alignment do the work;
no required image or moving letters. Match the language's actual word lengths.

- **Use:** exhibition, cultural launch, manifesto with a clear next step.
- **Tradeoff:** high recall but weak for long titles, detailed product explanation
  or localization that cannot preserve the intended breaks.
- **Narrow:** fluid type with a readable rem floor; allow natural wraps. Test real
  copy, accents and fallback fonts. Essential text must never bleed offscreen.
- **Still:** strong flat color or neutral paper works; no visual-effect quota.
- **Upstream:** hero #7 Type Monument; compositions #69–70; typography 1.1 / 1.5.

## C6 — Paired perspectives: dialogue in space

Present two related views with explicit captions, then explain their relationship.
Repeat a common baseline/frame while changing the subject. A case study can show
context and result, or two viewpoints, without claiming a causal before/after.

- **Use:** interview, material study, documented comparison, collaboration.
- **Tradeoff:** pairing implies a relationship; verify it. Do not invent improved
  results or build a misleading unlabelled before/after slider.
- **Narrow:** one labelled view after the other, then the relationship. Avoid CSS
  reordering that makes focus and reading order disagree.
- **Still:** side-by-side or vertical sequence; no hover reveal or dragged divider
  is needed to access either view.
- **Upstream:** compositions #2, #33 and #77.

## C7 — Triptych / contact sheet: breadth with an anchor

Use a modest run of captioned images or entries to show related work. Give one
entry priority if the content warrants it; maintain common frames so varied images
read as a collection. A conventional grid is a good solution here.

- **Use:** programme, portfolio set, scene studies, real collection browse.
- **Tradeoff:** equal panels imply equal importance. Use a weighted layout when
  one story deserves focus; do not turn every site section into another triptych.
- **Narrow:** stack or use the project's existing accessible grid. If horizontal
  browsing is requested, supply native scrolling and explicit access to every item;
  never map vertical wheel input into compulsory sideways storytelling.
- **Still:** all captions and links visible without hover or staggered entrances.
- **Upstream:** compositions #5, #51 and #60; hero #29 Sequence Strip.

## C8 — Edited fragments: an archive, not visual clutter

Keep document/photo fragments within a regular underlying grid. Vary scale to make
one fragment primary. Use actual dates/titles and a clear route to the full record.
Reserve overlap or a tiny rotation for decoration outside text and controls.

- **Use:** memory archive, process notebook, craft portfolio with supplied material.
- **Tradeoff:** tactile irregularity can damage scan order. Avoid masonry if its
  column order contradicts chronological reading; do not invent handwriting/data.
- **Narrow:** flatten offsets and overlaps. The same records appear as a legible
  source-ordered list; nothing is accessible only from a tiny “paper corner.”
- **Still:** no perpetual floating cards or physics simulation.
- **Upstream:** compositions #48 and #50, substantially constrained for readability.

## Practical layout notes

Use normal flow for essential content and scoped grid/flex for composition.
Decorative absolute positioning needs a containing block and cannot determine the
height of a text region. Avoid fixed heights for text, blanket `white-space: nowrap`,
root overflow clipping and wide negative-margin tricks. Size media before load to
avoid layout shifts. If sticky media is justified, keep it shorter than the usable
viewport and disable sticking where height/zoom makes it obscure content.

Sources: [composition IDs and source sketches](https://github.com/akseolabs-seo/cinematic-ui/blob/24a66c1d6140c21ec0d0e4d9ef663a97264003de/references/data/compositions.md#L9-L144),
[hero framing](https://github.com/akseolabs-seo/cinematic-ui/blob/24a66c1d6140c21ec0d0e4d9ef663a97264003de/references/data/hero-archetypes.md#L101-L134),
[framed hero](https://github.com/akseolabs-seo/cinematic-ui/blob/24a66c1d6140c21ec0d0e4d9ef663a97264003de/references/data/hero-archetypes.md#L714-L744),
[frame border](https://github.com/akseolabs-seo/cinematic-ui/blob/24a66c1d6140c21ec0d0e4d9ef663a97264003de/references/data/visual-elements.md#L909-L935).
Names, combinations, tradeoffs and implementation constraints above are rewritten;
source snippets and their film attributions are not verified production guidance.
