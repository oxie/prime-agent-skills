# Typography: title, voice, notation

Read only the roles needed by the page. Type should establish where to look and
how long to stay. Film titles are not a reason to make navigation theatrical.
Use the existing font system first; a paid/display font is not a quality gate.

## T1 — Display as architecture

A short title can form the largest shape in the composition. Decide the silhouette
before effects: a wide single line, two balanced lines or a compact vertical block.
Give its supporting sentence enough separation to remain a second voice.

- **Fit:** poster-like launch, title-led portfolio, exhibition opening.
- **Concrete start:** one fluid display size using both rem and viewport units,
  not viewport units alone; a near-solid weight and deliberate line height. Treat
  these as proposals to inspect with actual words, not fixed cinematic tokens.
- **Tradeoff:** thin strokes and very tight leading can fail at small sizes; all
  caps can consume more space and reduce word recognition. Test accents, long
  words, translated copy and fallback fonts. Never clip essential text for drama.
- **Restraint:** no required text scramble, blur, outline fill or per-letter reveal.
  If decorative duplicate text exists, keep the meaningful heading once in HTML
  and hide only the duplicate from assistive technology.
- **Sources:** typography 1.1 Full-Width Display, 1.5 Split Headline; compositions #69.

## T2 — Editorial voice and sustained reading

Pair an expressive title role with a calm reading role already available in the
project. A serif title can suggest printed editorial texture; a sans title can be
just as quiet. Choose by the actual letterforms and content, not “serif = luxury.”

- **Fit:** essay, interview, cultural programme, documentary project detail.
- **Concrete start:** approximately 60–70ch prose measure and about 1.5–1.7 body
  line height are adjustable starting points. Use rem-based sizes and preserve
  user text settings. Give headings space that reflects section boundaries.
- **Tradeoff:** a narrow column invites focus but lengthens a page. Dense indexes
  should retain their established list/table conventions rather than inherit an
  essay layout. Do not shrink body text to preserve a poster-like composition.
- **Restraint:** use fewer competing sizes; meaning and rhythm come from paragraph
  grouping, not a new font or decorative divider for every section.
- **Sources:** typography 6.1 Perfect Body Text, 6.8 Balanced Subheading, 6.9 lists.

## T3 — Measured sans / useful titles

A clear sans family with a firm title weight and quieter support weight can feel
precise without becoming a science-fiction interface. Use alignment, leading and
relative scale to suggest a title card or catalogue entry.

- **Fit:** architecture, product presentation, programme listings, a cinematic
  introduction attached to a functional application.
- **Concrete start:** title, subheading, body, metadata roles within the existing
  scale. Numbers may use tabular figures where columns actually need comparison.
- **Tradeoff:** excessive letter spacing hurts lowercase reading; use tracked short
  labels sparingly. A monospace face is useful for codes, not evidence of precision.
- **Restraint:** navigation and CTA labels describe real destinations/actions.
  Avoid invented chapter codes, camera settings or production jargon in public UI.
- **Sources:** typography 1.11 Mixed Weight Headline, 6.3 Readable Letter-Spacing,
  6.4 Monospace for Data and 6.16 Button / CTA Text.

## T4 — Caption rail and credits

Captions provide the facts a visual cannot: subject, context, source, date, material
or licensing credit. Align them with the frame edge. Distinguish title from metadata
without making metadata too small or too pale to read.

- **Fit:** any meaningful figure, project facts, public programme, archive record.
- **Concrete start:** `figure`/`figcaption` for figure captions; normal text for
  record metadata; real heading structure for entries. Use a list or table when
  the data has those relationships. Keep credits close or clearly linked.
- **Tradeoff:** rails look elegant at wide widths but compete with the subject at
  small widths. Collapse them below the frame; preserve source order and copy.
- **Restraint:** do not fabricate film credits, venues, awards, client names or dates
  to make the composition look finished. Label draft copy/visual placeholders.
- **Sources:** typography 6.5 Caption Text, 6.6 Footnote Style, 6.15 metadata.

## T5 — A quotation as a quiet hold

A real, attributed quotation can slow the reading rhythm. Give it more space and
slightly larger type, not forced isolation in a full viewport. Let the attribution
remain legible. Use `blockquote` only for quoted content, not every large slogan.

- **Fit:** interview, reflective essay, verified testimonial.
- **Tradeoff:** a long quotation at hero scale is tiring; select with editorial
  accuracy and preserve meaning. Do not invent a testimonial or source.
- **Restraint:** the text need not fade in, type itself or acquire animated quotation
  marks. Repeating a key phrase at the ending can create continuity without motion.
- **Sources:** typography 1.12 Indented Quote Block, 6.12 Centered Pull Quote.

## Text on images and effects

Prefer opaque text panels or captions outside changing imagery. If overlay text is
required, inspect the brightest/darkest relevant image areas and all video states;
a gradient scrim is useful only when measured contrast remains adequate. A text
shadow is not proof. Keep reading text out of blend modes, masks and blur. Solid
fallback colors must work when image, filter or font loading fails.

A reveal cannot make the accessible name and visible text disagree. Do not announce
letters individually, animate counters into false data or delay links behind a
sequence. Decorative text must not create extra tab stops or duplicate reading.
Reserve special effects for a clear requested purpose, with the production motion
contract and an equally useful still state.

Font acquisition is a separate permission/licensing decision. Use installed/system
fallbacks when no approved font is available. Check layout shift and reflow with
fallbacks; local hosting also needs the exact font's license. A share-page URL is
not a CSS font endpoint, and no remote font provider is required.

Sources: [architectural typography](https://github.com/akseolabs-seo/cinematic-ui/blob/24a66c1d6140c21ec0d0e4d9ef663a97264003de/references/data/typography-cinema.md#L15-L230),
[image overlays](https://github.com/akseolabs-seo/cinematic-ui/blob/24a66c1d6140c21ec0d0e4d9ef663a97264003de/references/data/typography-cinema.md#L385-L409),
[quiet functional roles](https://github.com/akseolabs-seo/cinematic-ui/blob/24a66c1d6140c21ec0d0e4d9ef663a97264003de/references/data/typography-cinema.md#L1677-L1991).
Roles and safeguards are rewritten. These are not font pairings tested on your site.
