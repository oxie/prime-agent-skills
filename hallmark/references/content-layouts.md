# Choose components from content

Use with Hallmark's existing workflow and [composition directions](directions.md).
Read only the relevant comparison. The approved brief, current design system and
real visitor task take priority; this is not a mandatory redesign or card recipe.
For website/page purpose and content requirements, use site-architecture's
page-purpose reference. Do not repeat its intake or create another source of truth.

## Decide before decorating

Identify what visitors must scan, compare, read or inspect. Select a layout that
makes that action easy with the actual content and assets. Name the reason and
one relevant tradeoff in the existing design rationale, not a separate report.
Keep a deliberate visual direction: typography, hierarchy, spacing, imagery and
interaction should express this project's identity. Different website types need
not share the same hero → cards → testimonials → CTA sequence.

| Content/task | Useful starting point | Avoid or check |
| --- | --- | --- |
| Titles and metadata; articles, writing samples, reference entries | List or editorial index; rich rows only when extra fields help | Do not add thumbnail cards to text-only material; retain informative titles on narrow screens |
| Comparable products, projects or resources with similar fields | Grid or aligned rows; expose comparison facts | A grid need not wrap every item in a bordered/shadowed card; do not equalize genuinely different priorities |
| Images with varied aspect ratios; photography or visual showcase | Masonry when preserving image shape aids discovery | Check visual, DOM and keyboard order; use a regular grid/list if reordering makes navigation confusing |
| One detailed article or project story | Reading column with evidence/media and useful scan points | No required sidebar, TOC, giant hero or share toolbar; long guides and short essays differ |
| A small set of featured items | Static row/grid is often enough | A carousel hides items and adds controls; use only for a real space/browsing need, not because a list is long |
| Large docs or resource collections | Section navigation with index/search when needed | Tiny collections do not need a sidebar, search service, filters or an app shell |

## Item anatomy is conditional

Keep one item focused on one destination or decision. Choose fields by task:

- **Article/writing sample:** title, meaningful date/author, short excerpt if useful.
- **Project/showcase:** actual preview, project name, role or creator, destination.
- **Service:** audience/outcome, real scope, relevant next action.
- **Resource:** title, format, subject and access/download information.
- **Product comparison:** actual distinguishing attributes, price/availability only
  when known. Do not copy marketing card conventions into technical reference rows.

An image, border, icon, badge or button is not mandatory. Keep real text accessible
when images fail. Use links for navigation and buttons for actions; avoid nested
interactive targets in a clickable card/row. A static gallery needs no invented
hover action, modal or backend. Reuse existing components when their contracts fit.

## Responsive and interaction checks

Choose columns and density from content width, not universal device breakpoints.
Test long titles, missing images and actual item counts. Preserve meaningful aspect
ratios or deliberate crops; reserve media space. Keep logical reading and focus
order when columns collapse or items are visually reordered. CSS dense placement
or multi-column layout is not automatically an accessible masonry implementation.

Filters must have useful distinctions, real results, clear/reset behavior and a
no-results state. Search must work with the actual content. Do not add either to
make a small site look sophisticated. For paginated/loaded archives, preserve
reachable content and return navigation; a decorative load-more button is not done.

If a carousel is justified, provide labeled operable controls, understandable
position and predictable focus. Prefer no autoplay. Any approved automatic motion
needs pause/control and reduced-motion handling. It must not be the sole way to
reach essential content. Keep gesture alternatives and keyboard access.

Do not ban CSS transforms as if all scaling caused layout shift; check actual
geometry, clipping, overlap and motion. Respect supplied brand and asset rights.
Use Hallmark's existing verification reference and the project's own tools to
inspect implemented narrow/wide views, keyboard/focus and relevant states.
No source checklist proves rendered quality, accessibility compliance or originality.

## Different briefs, different omissions

- Three-project personal portfolio: prioritize work and role; omit empty filters.
- Text-led journal: prioritize titles and reading; omit decorative product cards.
- Product documentation: prioritize task paths and accurate examples; omit a sales
  funnel or motion-heavy hero that delays access to the answer.
- Visual community showcase: prioritize previews, attribution and discovery; add a
  submit action only when its approved process exists.

These are decision examples, not fixed layouts. Hallmark retains visual direction;
Variate retains requested comparisons, and browser-check retains authorized local
preview evidence. No new renderer, server, dependency or automatic audit is added.

Provenance: selectively adapted from kostja94/marketing-skills at
`70987bad4ebe9dce1f74858c1c64f3f8810f18e4`; MIT, copyright (c) 2025 kostja94.
See UPSTREAM.md and THIRD_PARTY.md for source mapping and license. Brief-specific
omissions, portfolio application and Prime workflow boundaries are local synthesis.
