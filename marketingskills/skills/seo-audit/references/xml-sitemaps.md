# XML sitemaps from the real site inventory

Use for supplied sitemap files, sitemap generation in an authorized project, or an
explicitly scoped sitemap audit. Site architecture owns page hierarchy, not this XML
format. No crawling or submission is authorized by this reference. For a read-only
review, do not run a build or modify public files without applicable permission.

## Inventory and base checks

Start from the intended public canonical/indexable routes, not guessed slugs. Record
origin/base path, locale strategy, exclusions, source revision and generation time.
Do not publish preview origins, credentials, private routes or session/query secrets.
For URL targets without response/indexing evidence, report unverified, not failed.

Validate XML and namespaces with the project's existing parser; disable external
entities, DTD/network resolution and unbounded expansion when reading untrusted XML.
Escape URL query ampersands correctly and use fully qualified URLs. A parseable
urlset is not proof its URLs exist, are indexable or represent the intended inventory.
Retain request, redirect and final URL evidence if fetching was separately authorized.
Bound candidate count, redirects, time and decompressed bytes; discovered cross-host
URLs require scope review, not only a public-IP check. Do not import a new fetcher.

A sitemap file allows up to 50,000 URL entries and 50 MB (52,428,800 bytes)
uncompressed. Measure actual serialized UTF-8 bytes, including extension metadata.
Compression does not increase the limit. Split larger output and use a sitemap index;
check the index's own limits and referenced file coverage. Hreflang alternate children
do not count as extra URL entries but do count toward size. Splitting by content type
or locale can work; preserve reciprocal/self-listing alternates and actual URL policy.

Google ignores priority and changefreq. Optional lastmod must reflect significant
page changes accurately and consistently, not every deployment or sitemap regeneration.
A template rebuild with unchanged main content is not a new publication date. Do not
invent timestamps for missing data. Sitemap discovery/submission is a hint, not an
indexing guarantee; account submission and robots.txt edits need separate authority.

## Select only applicable extensions

| Extension | Actual inventory and checks |
|---|---|
| Images | Use the image namespace and actual image URLs associated with that page. Up to 1,000 image entries per URL. Cross-domain/CDN image URLs are possible; confirm crawl access and property verification requirements rather than rewriting them to the page host. Do not revive removed image caption/title/license/geo-location tags as Google requirements. |
| Video | Use the video namespace, truthful title/description, accessible thumbnail and content_loc or player_loc as applicable. The landing page must actually contain the video. Confirm the current required fields and URL/access restrictions against the official video guide; a video sitemap alone cannot establish video indexing eligibility. |
| News | Use the news namespace only for real news publication content, with actual publication name/language, original publication_date and title. Keep news metadata for articles from the last two days; do not reset publication dates to keep old articles eligible. |

News allows at most 1,000 news entries per sitemap. In a mixed sitemap, keep the
generic total-URL and file-size caps as well as the separate news-entry cap. Older
article URLs can remain after removing their news metadata. Do not treat 1,000 as a
replacement for the total-URL cap merely because the news namespace appears.

## Small generation/verification example

For a publisher with a real article inventory, select intended canonical URLs first.
Attach news metadata only to records within the two-day window using the original
publication time. Retain older indexable article URLs without news metadata. Split
when any applicable count or serialized-byte limit is reached. Record excluded or
missing-date records instead of silently inventing values.

In an authorized implementation, test boundary fixtures: ordinary URLs with no news
metadata, 1,000 versus 1,001 news entries, an older article retaining its URL but not
news metadata, escaped query ampersands, unchanged-build lastmod, wrong preview
origin, and size computed from uncompressed output. These are proposed project tests,
not claims that a generator or client site was executed during skill installation.

Sources checked 2026-09-15; recheck the applicable extension before implementation:
- [Build a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Sitemap indexes](https://developers.google.com/search/docs/crawling-indexing/sitemaps/large-sitemaps)
- [Localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Image sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps)
- [Video sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/video-sitemaps)
- [News sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap)
