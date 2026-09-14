# Google Search Console

Free tool for monitoring website search performance and indexing.

This is API reference guidance, not an installed client or permission to use an
account. Prefer supplied exports for analysis. Credentialed reads, sitemap writes
and indexing submissions need separate applicable authorization. Never put tokens
in documents or logs. The HTTP examples below are request descriptions, not shell
commands. Encode property identifiers and sitemap URLs as path parameters.

For interpreting supplied results, see the optional
[Search Console diagnostic worksheet](../../skills/seo-audit/references/search-console-diagnosis.md).

## Capabilities

| Integration | Available | Notes |
|-------------|-----------|-------|
| API | ✓ | Search Analytics API, URL Inspection API |
| MCP | - | Not available |
| CLI | - | Use gcloud or API scripts |
| SDK | ✓ | Google API client libraries |

## Authentication

- **Type**: OAuth 2.0 or Service Account
- **Read scope**: `https://www.googleapis.com/auth/webmasters.readonly` for authorized Search Analytics and URL Inspection reads.
- **Sitemap submission**: requires `https://www.googleapis.com/auth/webmasters`, property access and explicit write authorization. A read-only connection cannot submit a sitemap.
- **Separate API**: the restricted Indexing API uses its own setup and `https://www.googleapis.com/auth/indexing` scope; Search Console read scope is not submission authority.
- **Setup**: Create credentials in Google Cloud Console

## Common Agent Operations

### Get search analytics

```bash
POST https://searchconsole.googleapis.com/webmasters/v3/sites/{site_url}/searchAnalytics/query

{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "dimensions": ["query"],
  "rowLimit": 100
}
```

### Get performance by page

```bash
POST https://searchconsole.googleapis.com/webmasters/v3/sites/{site_url}/searchAnalytics/query

{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "dimensions": ["page"],
  "rowLimit": 50
}
```

### Get performance by country

```bash
POST https://searchconsole.googleapis.com/webmasters/v3/sites/{site_url}/searchAnalytics/query

{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "dimensions": ["country", "query"],
  "rowLimit": 100
}
```

### Inspect URL

```bash
POST https://searchconsole.googleapis.com/v1/urlInspection/index:inspect

{
  "inspectionUrl": "https://example.com/page",
  "siteUrl": "https://example.com/"
}
```

### List sitemaps

```bash
GET https://searchconsole.googleapis.com/webmasters/v3/sites/{site_url}/sitemaps

Authorization: Bearer {access_token}
```

### Submit sitemap

```bash
PUT https://searchconsole.googleapis.com/webmasters/v3/sites/{site_url}/sitemaps/{sitemap_url}

Authorization: Bearer {access_token}
```

### Indexing requests are not general Search Console API operations

URL Inspection's `index:inspect` returns information about Google's indexed
version; it does not request indexing or run the Search Console UI's live test.
For ordinary articles, product pages and homepages, use normal discovery through
links and sitemaps. An eligible, authorized property owner can use the Search
Console UI's request-indexing feature where available. None guarantees indexing.

The **separate Indexing API** is restricted to pages with `JobPosting`, or
`BroadcastEvent` embedded in `VideoObject`. It is not a general submit-URL API.
Do not add misleading structured data to make an ordinary page appear eligible.
Even a supported page needs separate API setup, credentials/property permission
and explicit authorization to submit. Accepted notifications do not prove that
Google crawled or indexed the page. This guide installs no submission client.

#### Illustrative routing cases

These are documentation cases, not real account operations. “Eligible” means
only the stated content-type condition; it is not permission or a guarantee.

| Case | Content | Requested operation | Authorization | Expected route |
|---|---|---|---|---|
| ordinary-page | Product page | Indexing API notification | Write approved | Do not use Indexing API |
| generic-video | VideoObject without BroadcastEvent | Indexing API notification | Write approved | Do not use Indexing API |
| job-readonly | JobPosting page | Indexing API notification | Read only | No submission |
| live-broadcast | BroadcastEvent in VideoObject | Indexing API notification | Separate setup and write approved | Eligible for separate Indexing API workflow |
| inspect-page | Ordinary article | URL Inspection read | Read approved | Read indexed status only |
| sitemap-readonly | Sitemap | Submit sitemap | Read only | No submission |

## Dimensions

- `query` - Search query
- `page` - Page URL
- `country` - Country code
- `device` - Device type (MOBILE, DESKTOP, TABLET)
- `date` - Date
- `searchAppearance` - Search result type

## Metrics

- `clicks` - Clicks from search
- `impressions` - Search impressions
- `ctr` - Click-through rate
- `position` - Average position

## Filters

```json
{
  "dimensionFilterGroups": [{
    "filters": [{
      "dimension": "query",
      "operator": "contains",
      "expression": "keyword"
    }]
  }]
}
```

## When to Use

- Analyzing search performance
- Finding keyword opportunities
- Monitoring indexing status
- Planning ordinary-page discovery or reviewing separately authorized, eligible indexing requests
- Identifying crawl issues
- Tracking position changes

## Rate Limits

Limits differ by API, method, property, user and project. Search Analytics also
has load limits; URL Inspection has separate per-site limits. Check the current
[Search Console usage limits](https://developers.google.com/webmaster-tools/limits)
and the approved project's quota before querying. Pagination does not avoid quotas
or guarantee a complete export: Search Analytics may return only top rows.
Do not create retry loops, scheduled exports or quota workarounds from this guide.

## Primary references

- [Search Analytics query](https://developers.google.com/webmaster-tools/v1/searchanalytics/query)
- [URL Inspection read](https://developers.google.com/webmaster-tools/v1/urlInspection.index/inspect)
- [Sitemap submission and scope](https://developers.google.com/webmaster-tools/v1/sitemaps/submit)
- [Restricted Indexing API use](https://developers.google.com/search/apis/indexing-api/v3/using-api)

Local correction and snapshot identities: [GSC source notes](../../skills/seo-audit/GSC_SOURCES.md).
Source documents retain their own terms; this is original explanatory wording.

## Relevant Skills

- seo-audit
- programmatic-seo
- analytics
