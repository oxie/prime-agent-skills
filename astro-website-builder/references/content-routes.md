# Content to public routes

Use collections for repeated structured content when they simplify the actual site.
Do not create a CMS, database or generic content abstraction for one static page.
Read the installed Astro version first. This is an original worked contract for
Astro 5/6 Content Layer, not a complete runnable starter. Adapt paths/schema and run
native checks in the target project; the examples below have no app-runtime evidence.

## Schema, identity and rendering move together

For an Astro 6 `src/content.config.ts`, a small notes collection can use:

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

export const collections = {
  notes: defineCollection({
    loader: glob({ base: './src/notes', pattern: '**/*.md' }),
    schema: z.object({
      title: z.string(),
      summary: z.string(),
      draft: z.boolean(),
      publishAt: z.coerce.date(),
    }),
  }),
};
```

The same `astro/zod` import is exported in Astro 5 (Zod 3) and Astro 6 (Zod 4).
The older `astro:content` z import also works in 5 but is deprecated in 6.
Avoid carrying version-specific Zod transforms/default/error APIs across that boundary.
The explicit draft field makes the author choose publication state. Match that
choice to the actual editorial policy. Valid dates alone do not establish timezone
intent: use an explicit offset/UTC instant for scheduled publication, or define and
convert an editorial date-only convention consistently. Do not guess from locale.

Glob produces an entry ID; inspect actual nested IDs and custom generateId behavior.
A frontmatter slug can override the generated ID; it does not create entry.slug.
Treat route identity as a stable public contract. Reject conflicting IDs/URLs and
unintended segments, including case/encoding/trailing-slash collisions relevant to
the host. Do not assume `entry.slug` exists on a loader entry. Preserve an existing slug override or generateId contract; a custom slug does not
inherently need a new mapping. Add redirects if a changed public URL is authorized.

## One publication rule for every consumer

For this example, define the rule once in the project's content-query module.
The caller supplies the same finite epoch-millisecond cutoff to every build stage;
choose that cutoff through the existing build configuration, not separate clocks
inside each page/feed. Dynamic requests need their explicitly chosen request policy.

```js
// publication-predicate: pure example, not an Astro module
function isPublished(data, asOfMs) {
  return Number.isFinite(asOfMs)
    && data.draft === false
    && data.publishAt instanceof Date
    && Number.isFinite(data.publishAt.getTime())
    && data.publishAt.getTime() <= asOfMs;
}
```

`getCollection('notes')` supplies entries to this predicate. The project's shared
query selects published entries and sorts them deterministically: publishAt descending,
then unique entry ID as tie breaker. Keep the same selected data for lists, static
paths, related/tag/search pages, feeds and sitemap URL sources. An index-page filter
alone does not protect draft routes. If a surface does not exist, do not build it
solely for this checklist. Do not export private source fields to client search data.

For `src/pages/notes/[...id].astro`, the structure is:

```astro
---
import { render } from 'astro:content';
import { publicNotes } from '../../lib/public-notes';
import SiteLayout from '../../layouts/SiteLayout.astro';

export async function getStaticPaths() {
  // Project adapter: returns the shared, sorted, publication-filtered selection.
  const entries = await publicNotes();
  return entries.map((entry) => ({ params: { id: entry.id }, props: { entry } }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
---
<SiteLayout title={entry.data.title} description={entry.data.summary}>
  <article><h1>{entry.data.title}</h1><Content /></article>
</SiteLayout>
```

`publicNotes` and `SiteLayout` are explicitly project-owned adapters, not supplied
modules; implement them against the contracts above and the page-delivery reference.
Avoid a second H1 inside article Markdown when the template supplies the title.
For Content Layer use imported `render(entry)`, not `entry.render()`. Non-renderable
data entries need data rendering rather than a Markdown Content component.
For on-demand `getEntry`, handle missing and unpublished entries before rendering or
serializing them. Apply the actual response/disclosure policy, not an empty success.

## Lists, links, feed and sitemap

Generate list links and canonical URLs with the same URL mapping as the route,
including base path and slug encoding. Check a nested entry and a tied-date pair,
not only the first flat filename. Preserve caller requirements such as pagination,
zero entries and route redirects. Empty content needs a real empty state, not a
fake article or invented testimonial.

If RSS is required, use the project's existing supported feed mechanism; introduce
`@astrojs/rss` only with applicable dependency approval. Feed items use the same
published selection, real absolute site URLs, titles, summaries and publication
dates. Use a serializer that escapes XML, not unescaped text interpolation. Full-body
HTML needs its own safe content handling; a summary feed need not invent it.

A sitemap integration can consume generated static routes, but cannot infer every
on-demand route or editorial restriction. Check the actual emitted entries and any
custom route sources. Explicitly exclude utility/private/preview/nonindexable URLs
as appropriate; substring-matching '/admin' is not a general publication policy.
RSS, sitemap, robots and noindex are not access controls. Never put private drafts,
originals or unapproved assets under public/ or in exported client data. A static
page already emitted remains public until the appropriate rebuild/removal/cache
process completes; changing draft metadata alone cannot withdraw deployed bytes.

## Prove selection at the output boundary

Use authorized synthetic fixtures: one published entry, a draft, a future entry,
a nested ID, missing/invalid data and two entries sharing a publication timestamp.
Check the exact sorted IDs, not only the count. At the chosen cutoff, verify both
positive inclusion and negative exclusion across every implemented public surface.
Assert the draft/future URL and unique body marker are absent from final emitted
HTML, feeds, search data and source maps/assets where relevant—not merely the index.

A predicate unit test does not prove every route calls it. Build and inspect actual
output using project-native tooling. For on-demand routes, test relevant requests
and response bodies in the authorized environment. Distinguish draft content kept
out of a build from truly authenticated private content. Mark untested surfaces
unknown; do not claim a pure fixture proves Astro integration or deployed cache removal.
