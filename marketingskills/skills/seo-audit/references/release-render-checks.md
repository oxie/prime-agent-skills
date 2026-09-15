# Manual SEO release and rendering checks

Use for an authorized build, migration or before/after SEO comparison. Select the
changed routes and representative templates from the actual project. This is not a
mandatory whole-site audit. No crawler, persistent snapshot database, monitoring,
provider call or deployment permission is added. browser-check retains its own
explicitly authorized local-preview boundary; a local preview is not live Google
rendering or indexing evidence.

## Bind evidence to the release

Record revision/build, capture time, requested and final URL, redirect chain/status,
environment/origin, route/template and intended change. Distinguish initial response
versus rendered DOM and supplied exports. Include relevant response headers as well
as HTML directives. Keep private URLs/query values and page contents in the approved
project evidence scope, not skill files or public reports.

Use a reviewed baseline, not merely the newest file. Record missing baseline, failed
fetch/render, blocked resources and partial route coverage. Do not silently substitute
HTTP 200 or an empty result when evidence is unavailable. A known-old baseline can
be compared if clearly labeled; it is not proof of the immediately previous release.

Do not normalize away trailing slashes, path parameters or query ordering/values
unless the site's equivalence is established. Preserve raw and final URLs. Tracking
parameter removal or an apparent canonical match is not general URL identity proof.

## Compare the actual contract

| Area | Evidence to compare | Decision limit |
|---|---|---|
| Response/indexing | Redirects, status, X-Robots-Tag, raw and rendered robots | A robots.txt block can prevent seeing noindex; do not infer indexed status from a tag alone |
| Canonical/locales | Raw/rendered canonical, language/region alternates, actual target policy | Canonical is a signal; same-language regional duplicates need different treatment from translations |
| Main content/navigation | Visible primary content, mobile parity, real href links and pagination URLs | Do not ban a framework by name; load-more without crawlable URLs can hide later content |
| Metadata | Title, description, document language, relevant sharing metadata | Compare meaning and intended page identity, not character quotas |
| Structured data | Parsed server JSON-LD and separately available rendered markup, current feature target | Missing raw markup is not absence of JS markup; removal of an inapplicable/retired feature is not automatically a regression |
| Inventory/assets | Selected route coverage, sitemap membership, public asset URLs, broken links | Report uninspected targets; do not pretend an XML parse performed a crawl |

Serve correct critical robots/canonical information in initial HTML where practical;
removing initial noindex with JavaScript may not prevent its use. Google can render
JavaScript; non-200 responses might not be sent to rendering. SSR/SSG can reduce
reliance on rendering, but public CSR is not inherently unindexable. Check actual
content and render evidence, including interaction-triggered lazy content.

For pagination, use distinct crawlable URLs and per-page canonicals. Google no
longer uses rel=next/prev for this purpose and generally does not click buttons.
Preserve usable navigation for people; a load-more interface can coexist with links.

## Metadata review, not an automated spam score

Write accurate, distinctive titles and descriptions from the actual page. There is
no fixed character limit for Google's title or meta description; display truncation
varies with device width and query. Short is not inherently bad, and length is not a
ranking guarantee. Good programmatic descriptions can use real product/page data.

Review title echo, repeated stock CTA and boilerplate across representative pages
as clues to lost specificity. They do not prove scaled abuse, AI authorship or low
quality. Keep legitimate brand mentions. Avoid keyword quotas, ASCII-only multilingual
comparisons and arbitrary percentage-uniqueness gates. Review language and meaning.

If checking factual copy, a nearby citation marker does not establish support; inspect
the relevant source passage and freshness. No claims extracted by a heuristic is not
“all facts verified.” This is a bounded content check, not a new verification engine.

## Classify changes and recheck

An intentional change is not automatically a regression. Record expected versus
unexpected differences, supporting evidence, consequence and a proposed response.
Prioritize unintended indexing blocks or wrong public origins over cosmetic text
changes. Do not automatically restore removed schema or roll back a release.

After an authorized fix, rerun the affected project checks and comparable route
checks. State source-only, local-rendered, live-response and Search Console evidence
separately. Lab performance changes are not immediate field/ranking outcomes; use
[performance diagnosis](performance-diagnosis.md) for that distinction.

Sources checked 2026-09-15:
- [JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Pagination](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading)
- [Title links](https://developers.google.com/search/docs/appearance/title-link)
- [Snippets and programmatic descriptions](https://developers.google.com/search/docs/appearance/snippet)
- [Helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
