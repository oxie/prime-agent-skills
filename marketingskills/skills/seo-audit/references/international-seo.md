# International SEO: Evidence & Sources

Detailed evidence backing the International SEO & Localization section of the SEO Audit skill. Organized by topic with source URLs and key quotes.

---

## Hreflang

### Placement Methods

Google supports three equivalent methods: HTML `<link>` in `<head>`, HTTP `Link` headers, and XML sitemap `<xhtml:link>` elements. Google confirmed no method is prioritized over another.

Using multiple methods is allowed, but Google documents no Search benefit and more
maintenance work. Keep them consistent; report conflicting annotations without
claiming a guaranteed processing outcome.

- [Google Search Central: Localized Versions](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [SEJ: Google Combines Hreflang Signals](https://www.searchenginejournal.com/google-combines-hreflang-signals-from-html-sitemaps/389219/)

### Reciprocal Requirement

Google requires self-listing and reciprocal links. It also explicitly allows some
languages to be omitted on some pages and processes links that point to each other.
A missing edge is not a whole-cluster failure guarantee; report the affected links.

Every page must include itself (self-referencing) in the hreflang set. Missing self-referencing is the #1 error found by Semrush audits. A study of 374,756 domains found 67% of hreflang implementations had issues.

- [Google Search Central: Localized Versions](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Semrush: 9 Common Hreflang Errors](https://www.semrush.com/blog/hreflang-errors/)
- [SE Land: 31% of International Websites Contain Hreflang Errors](https://searchengineland.com/study-31-of-international-websites-contain-hreflang-errors-395161)

### x-default

Introduced April 2013. Designates a fallback for users whose language/region matches
no declared variant. It can share a URL with a language-specific alternate. Consider
it especially for selectors or redirecting home pages; it is not required on every
multilingual site. If selected, keep that fallback consistent in the related set.

- [Google Blog: x-default hreflang](https://developers.google.com/search/blog/2013/04/x-default-hreflang-for-international-pages)
- [Google Blog: How x-default can help you (2023)](https://developers.google.com/search/blog/2023/05/x-default)

### Language & Region Codes

Language: ISO 639-1 (2-letter). Region: ISO 3166-1 Alpha 2 (2-letter). Format: `language[-script][-region]`.

You cannot specify a region code alone. Common mistakes: `en-UK` (should be `en-GB`), `es-419` (not ISO 3166-1). A study found 8.9% of sites using hreflang contain invalid language codes.

- [Google Search Central: Localized Versions](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [SE Land: 31% Study](https://searchengineland.com/study-31-of-international-websites-contain-hreflang-errors-395161)

### Hreflang at Scale (20+ locales)

Choose HTML, headers or sitemap annotations by maintenance and actual output cost,
not a fixed locale-count threshold. Sitemap annotations avoid extra page-head bytes
but still need generation and validation. Alternate `<xhtml:link>` children do not
count as additional URL entries; their bytes count toward the file-size limit.

John Mueller recommends focusing hreflang on pages receiving wrong-language traffic, not every page: "I wouldn't do it for any of the other pages of the site because it's so complex & hard to manage."

- [SERoundtable: Child Elements Don't Count](https://www.seroundtable.com/google-child-elements-dont-count-towards-sitemap-url-limit-34377.html)
- [SERoundtable: Where To Focus Hreflang](https://www.seroundtable.com/using-hreflang-34127.html)
- [Yoast: hreflang Ultimate Guide](https://yoast.com/hreflang-ultimate-guide/)

### Google vs Bing

Bing treats hreflang as a "weak signal." Bing relies on `content-language` meta tag, HTML `lang` attribute, ccTLDs, and server location. Yandex supports hreflang like Google.

For both engines: implement hreflang (Google/Yandex) + `<html lang="...">` + `<meta http-equiv="content-language">` (Bing).

- [Digital Ready Marketing: Bing Doesn't Use Hreflang](https://digitalreadymarketing.com/bing-doesnt-use-hreflang-annotation-what-does-it-use/)
- [Yoast: hreflang Ultimate Guide](https://yoast.com/hreflang-ultimate-guide/)

---

## Canonicalization & i18n

### Self-Referencing Canonicals

Genuinely translated, independently useful pages normally identify their own
canonical URL. Do not collapse translations onto one language by habit. For
same-language regional duplicates, Google supports a preferred canonical alongside
hreflang. Decide from actual content and intended regional experience.

Google's docs: "Specify a canonical page in the same language, or the best possible substitute language if a canonical doesn't exist for the same language."

- [John Mueller: hreflang canonical](https://johnmu.com/hreflang-canonical/)
- [Google: Consolidate Duplicate URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)

### Align Canonical and Hreflang Signals

Align the intended canonical and alternate relationships. Canonical declarations
are signals, not an unconditional override or a guarantee of whole-set rejection.
Check Google-selected canonical evidence when available; do not infer it from the
HTML tag alone.

Google also states: "Google prefers URLs that are part of hreflang clusters for canonicalization" -- when signals align, hreflang strengthens canonical selection.

- [John Mueller: hreflang canonical](https://johnmu.com/hreflang-canonical/)
- [SEJ: Hreflang Tags Are Hints](https://www.searchenginejournal.com/google-reminds-that-hreflang-tags-are-hints-not-directives/546428/)
- [Google: Consolidate Duplicate URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)

### Near-Duplicate Regional Variants

Mueller (2023 Office Hours): "If the content is completely the same, and we can't tell any difference, then for simplicity and user experience we may just show one version -- even if hreflang is present."

Do not manufacture differences merely to seek multiple indexed copies. For similar
or duplicate same-language regional pages, Google recommends selecting a preferred
canonical plus hreflang. Hreflang does not guarantee separate indexing.

- [International Web Mastery: Same-Language Duplicate Pages](https://internationalwebmastery.com/blog/how-google-handles-canonicalization-of-same-language-duplicate-near-duplicate-pages/)
- [Google: Managing Multi-Regional Sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)

### Pagination Across Locales

Google: "Don't use the first page of a paginated sequence as the canonical page. Instead, give each page its own canonical URL." Each paginated page in each locale gets self-referencing canonical. Google no longer uses `rel="next/prev"` for pagination. Provide crawlable links and
distinct URLs; Google generally does not click load-more buttons.

- [Google: Pagination Best Practices](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading)

---

## International Sitemaps

### Structure

Each `<url>` entry includes `<xhtml:link>` alternates for every locale. Requires `xmlns:xhtml="http://www.w3.org/1999/xhtml"` namespace.

Split by content type or locale according to maintenance needs. Either is possible;
keep the actual alternate sets reciprocal and self-listing across the chosen files.

- [Google Search Central: Localized Versions](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Lumar: How Google Handles Hreflang](https://www.lumar.io/office-hours/hreflang/)

### Size Limits

50,000 URL entries / 50 MB uncompressed per sitemap. Alternate child links do not
count as extra URL entries. Measure the generated uncompressed bytes, including all
alternates; do not replace either limit with an assumed 2,000–5,000 URL budget.
See [XML sitemap checks](xml-sitemaps.md) for extensions and evidence limits.

- [Google: Build and Submit a Sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [SERoundtable: Sitemap 50,000 Limit](https://www.seroundtable.com/google-sitemap-50-000-limit-based-on-location-urls-not-alternative-urls-33843.html)

### Submission

Search Console submission and a robots.txt sitemap reference are available discovery
methods, not a requirement to do both in every audit. Individual child submissions
can help reporting. Do not submit or change robots.txt without applicable approval.

- [Google: Build and Submit a Sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)

### Next.js Caveat

Inspect the installed framework version and generated XML. Ensure the emitted set
includes its own URL and the intended alternates; do not assume a configuration
property automatically includes or excludes self-listing.

- [Next.js Docs: sitemap.xml](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)

---

## URL Structure

### Strategies Compared

Google treats subdirectories and subdomains equivalently. Mueller: "From our point of view...they say subdomains and subdirectories are essentially equivalent."

URL parameters (`?lang=en`) are explicitly "Not recommended" per Google docs.

- [Google: Managing Multi-Regional Sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)

### Default Language

The default language can live at `/` without a prefix. Google documents a default
locale homepage, a selector or a redirecting homepage as possible strategies. Use
distinct discoverable variant URLs; do not force a `/en/` migration or x-default
solely because a framework prefers that convention.

- [Google Blog: x-default](https://developers.google.com/search/blog/2023/05/x-default)
- [Google Blog: Creating the Right Homepage](https://developers.google.com/search/blog/2014/05/creating-right-homepage-for-your)

### Content Negotiation / IP Redirects

Locale-adaptive content can leave variants undiscovered. Googlebot generally
originates in the US and does not send Accept-Language, though Google documents
geo-distributed crawling. Prefer distinct crawlable URLs and explicit alternate
links; do not rely solely on inferred visitor location.

- [Google: Locale-Adaptive Pages](https://developers.google.com/search/docs/specialty/international/locale-adaptive-pages)

### Trailing Slash Consistency

Mueller: trailing slash is "a significant part of the URL and will change the URL if it's there or not." Pick one format for all locale paths, internal links, canonicals, hreflang, and sitemaps.

Mueller (2025): "Consistency is the biggest technical SEO factor."

- [SERoundtable: Consistency Is The Biggest Technical SEO Factor](https://www.seroundtable.com/google-consistency-seo-40427.html)

### Search Console Geotargeting

The International Targeting report is deprecated. Google now relies entirely on hreflang, content language analysis, and linking patterns. You can add subdirectory properties for per-locale reporting.

- [Google Support: International Targeting Deprecated](https://support.google.com/webmasters/answer/12474899?hl=en)

### Framework Locale Modes

Use the project's routing strategy and inspect actual URLs and emitted alternate
links for the installed framework version. A default locale without a prefix can
work. Serving all languages only at one negotiated URL is a different discovery
problem; a framework option name alone does not establish Google requirements.

- [next-intl: Routing Configuration](https://next-intl.dev/docs/routing/configuration)
- [Next.js Discussion #18419](https://github.com/vercel/next.js/discussions/18419)

---

## Content Quality Across Locales

### Auto-Translated Content (2025 Stance)

Google removed longstanding guidance advising against auto-translated content in mid-2025. Current stance: "Our policies do not strictly define content that has been translated by AI as spam." The scaled content abuse policy mentions translation as a possible vector, but does not ban it.

Reddit scaled AI translations to 35+ languages with Google's knowledge. The key distinction is intent and quality, not the method.

- [Google Spam Policies](https://developers.google.com/search/docs/essentials/spam-policies)
- [Glenn Gabe: Auto-Translating Content](https://www.gsqi.com/marketing-blog/auto-translating-content-google-scaled-content-abuse/)
- [SE Land: Reddit AI Translations](https://searchengineland.com/google-comments-on-reddits-use-of-ai-to-translate-its-pages-456908)

### Thin Locale Pages

Google: "Localized versions of a page are only considered duplicates if the main content of the page remains untranslated." Pages with only translated boilerplate get clustered as duplicates.

Avoid creating pages that cannot help users. For existing unwanted pages, noindex
can be appropriate to prevent indexing if crawlers can fetch the directive. It is
not a canonical-selection or crawl-budget optimization method. Choose improving,
noindexing, removing or canonicalizing true duplicates according to intent, then
update hreflang and sitemaps consistently. This guidance does not authorize live changes.

- [Google: Block indexing](https://developers.google.com/search/docs/crawling-indexing/block-indexing)

- [Google: Localized Versions](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google: Crawl Budget Management](https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget)

### Helpful Content System Impact

The helpful-content work became part of core ranking in March 2024. The linked 2022
announcement describes a historical system, not a current formula for diagnosing
a whole-site penalty. Assess actual usefulness and search evidence; one thin locale
page does not establish site-wide ranking harm.

- [Google Blog: Helpful Content Update](https://developers.google.com/search/blog/2022/08/helpful-content-update)
- [Amsive: What Changed in 2024](https://www.amsive.com/insights/seo/googles-helpful-content-update-ranking-system-what-happened-and-what-changed-in-2024/)

### Partial Translation

Google: "Translating only the boilerplate text of your pages while keeping the bulk of your content in a single language...can create a bad user experience." Google uses visible content (not lang attribute) to determine page language.

Translate ALL content on a page if you create a locale version. Untranslated metadata (title, description) in the wrong language reduces CTR.

- [Google: Managing Multi-Regional Sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)

### Crawl Budget

Only a concern for 1M+ pages or 10K+ pages changing daily. But alternate URLs (hreflang targets) do consume crawl budget. Broken hreflang links waste budget AND invalidate signals.

- [Google: Crawl Budget Management](https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget)
- [Google Blog: Crawl Budget](https://developers.google.com/search/blog/2017/01/what-crawl-budget-means-for-googlebot)

### Locale-Specific Signals

Google identifies audience via: "local addresses and phone numbers on the pages, the use of local language and currency, links from other local sites, or signals from your Business Profile."

- [Google: Managing Multi-Regional Sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)
