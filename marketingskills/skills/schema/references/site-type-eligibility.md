# Site-Type Eligibility: Variants, Profiles and Communities

Use this reference only for real product variants, a genuine profile page, or a community
post/question. Do not add all types to every website. These are focused original examples,
not a complete property catalogue or permission to publish, crawl, access accounts or submit data.

## Separate the checks

Google documentation checked 2026-09-15; recheck the linked type-specific guide for the
chosen feature before implementation. The page's actual purpose decides the type.

1. **Vocabulary and syntax:** parse the JSON; check schema.org types and property values.
2. **Feature eligibility:** a valid type is not proof of a supported Google feature or eligible page.
3. **Required versus recommended:** meet the chosen feature's required properties and nested
   rules. Add recommended properties only when applicable and backed by real content.
4. **Content truth:** visible content and source records must support the markup. Never invent
   authors, affiliations, qualifications, ratings, offers, availability, dates or counts to pass a tool.
5. **Display:** the Rich Results Test cannot prove every content policy or guarantee a rich result,
   ranking uplift, E-E-A-T improvement or AI citation. Report tests not run and evidence gaps.

All values below are **fictional illustrations**. Replace them with real page data before use.
If required data is unavailable, report the missing fact and stop short of claiming eligibility.
Optional unknown values should be omitted, not replaced with plausible guesses. Retain existing
privacy, access and publishing boundaries; this reference grants no additional permissions.

| Page purpose | Candidate | Google scope and exclusions |
|---|---|---|
| One product sold in different sizes, colors or other supported variant dimensions | ProductGroup with Product variants | Supported variant information extends eligible Product markup; not a category page or unrelated product bundle |
| Information about one person or organization affiliated with the site | ProfilePage | Suitable for an author, employee, user profile or personal About Me page; not every homepage or third-party business review |
| A genuine user-generated discussion post with replies | DiscussionForumPosting | Not publisher-authored blog content, even with comments, or product reviews |
| One question with answers submitted by users | QAPage | Not a multi-question FAQ, ordinary how-to, or marketing workaround for retired FAQ rich results |

## ProductGroup: actual variants, not an aggregate offer

Use [Google's variant guide](https://developers.google.com/search/docs/appearance/structured-data/product-variants)
with either the [product snippet](https://developers.google.com/search/docs/appearance/structured-data/product-snippet)
or [merchant listing](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing) requirements.

- **Required property table:** ProductGroup requires name. Google lists hasVariant, variesBy and
  productGroupID under recommended properties, but its **technical guidelines also require unique
  variant IDs** (for example sku or gtin) and a **unique group ID** via productGroupID or the
  variants' inProductGroupWithID. If both group-ID forms appear, their values must match.
- Use hasVariant to nest Products, or isVariantOf to link them back to the group. Give each
  variant a specific name and real distinguishing properties. variesBy supports full schema.org
  URLs for color, size, suggestedAge, suggestedGender, material and pattern. Do not invent SKUs or GTINs.
- **Each variant still needs Product markup for the target surface.** Merchant listings require
  name, image and offers (Offer); the offer requires price and currency. Product snippets instead
  require name and at least one of review, aggregateRating or offers, with nested requirements.
  Do not invent reviews, shipping/return policies, or offers just to fill suggested fields.
- Use real variant-specific images, prices, availability and directly selectable URLs. A variant
  URL must select the correct variant, including the matching offer and add-to-cart behavior.
  AggregateOffer describes aggregated offers, not a group of variants.
- **Single-page strategy:** one distinct canonical URL for the overall group; distinct variant
  selector URLs can use query parameters. ProductGroup.url is the base URL without selectors.
- **Multi-page strategy:** follow the guide's self-contained markup per page; there is no single
  canonical URL for the overall group, and do not set ProductGroup.url. Keep group IDs consistent
  across pages. Do not apply the single-page canonical rule to this different page model.
- For merchant pages, Google recommends Product markup in initial HTML. Dynamic markup can make
  shopping crawls less frequent/reliable, particularly for fast-changing prices and availability.
  This is not a blanket ban on JavaScript. Validate actual markup within authorized tool scope.
- Conditional policies still apply: for adult-oriented products within Google's adult-content
  policy, its guide requires hasAdultConsideration using the supported
  https://schema.org/SexualContentConsideration value. A non-adult example does not remove that gate.

Illustration: one product page with two color variants. The two selector URLs, offers,
SKUs and images must work and match real inventory before using this shape in production.
Ratings and arbitrary expiry dates are deliberately absent.

```json
{
  "@context": "https://schema.org",
  "@type": "ProductGroup",
  "@id": "https://example.com/products/desk-mat#group",
  "name": "Desk mat",
  "url": "https://example.com/products/desk-mat",
  "productGroupID": "MAT-01",
  "variesBy": ["https://schema.org/color"],
  "hasVariant": [
    {
      "@type": "Product",
      "name": "Desk mat - blue",
      "sku": "MAT-01-BLUE",
      "color": "Blue",
      "image": "https://example.com/images/mat-blue.jpg",
      "url": "https://example.com/products/desk-mat?color=blue",
      "offers": {
        "@type": "Offer",
        "url": "https://example.com/products/desk-mat?color=blue",
        "price": "25.00",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      }
    },
    {
      "@type": "Product",
      "name": "Desk mat - gray",
      "sku": "MAT-01-GRAY",
      "color": "Gray",
      "image": "https://example.com/images/mat-gray.jpg",
      "url": "https://example.com/products/desk-mat?color=gray",
      "offers": {
        "@type": "Offer",
        "url": "https://example.com/products/desk-mat?color=gray",
        "price": "25.00",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      }
    }
  ]
}
```

## ProfilePage: a page about the actual site-affiliated entity

[Google's profile guide](https://developers.google.com/search/docs/appearance/structured-data/profile-page)
requires the page's primary focus to be one person or organization affiliated with the site.
An author page, employee page, forum user profile, or personal About Me page can fit.
A store homepage full of products or a third-party organization review does not fit this feature.
Do not label every portfolio homepage ProfilePage without checking its main content.

**Required:** mainEntity (Person or Organization), with name. Google permits alternateName
in place of name if name is unavailable, such as an account known only by a handle.
**Recommended when applicable:** real profile image, description, identifiers, sameAs and
profile creation/modification dates. Do not add a default avatar as a person's image, fabricate
qualifications, or set dateModified on every build. Interaction counts must reflect the hosting
platform, not totals borrowed from other sites. Use stable entity IDs to connect real authorship;
a link alone does not prove expertise or improve rankings.

Illustration: a dedicated author biography. There are no invented credentials or profile dates.
An Article can identify this same author through its author.url and matching entity @id.

```json
{
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": "https://example.com/authors/morgan#profile",
  "url": "https://example.com/authors/morgan",
  "mainEntity": {
    "@type": "Person",
    "@id": "https://example.com/authors/morgan#person",
    "name": "Morgan Lee",
    "url": "https://example.com/authors/morgan"
  }
}
```

## DiscussionForumPosting: real user-generated discussion

[Google's discussion guide](https://developers.google.com/search/docs/appearance/structured-data/discussion-forum)
applies to user-generated discussion, not posts primarily written by the publisher or its agents.
A publisher blog with comments remains a blog; product reviews have their own review rules.
If the community primarily uses one-question/answer pages, use the QAPage branch below instead.

**Required for the main post:** author including author.name, datePublished, and at least one
of text, image or video. The content-property exception for external-URL representations of
posts on other pages is not a reason to omit the main post's visible content. A Comment needs
author, datePublished, and content (text/image/video) too. Include the full post and reply text
that appears on the page; preserve comment order and use each comment's actual anchor URL.
**Recommended when applicable:** headline only when there is a real separate title, author.url,
comment, dateModified and real interaction counts. Never invent a title or post timestamp.

For discussion forums Google prefers Microdata or RDFa to avoid duplicating large text blocks;
JSON-LD remains supported. The example uses JSON-LD for clarity, not as a migration mandate.
The dates below are fictional post records, not values to copy or replace with today's date.

```json
{
  "@context": "https://schema.org",
  "@type": "DiscussionForumPosting",
  "@id": "https://example.com/forum/desks#post",
  "url": "https://example.com/forum/desks",
  "headline": "Share your desk setup",
  "text": "I moved my desk beside the window. Share your setup changes here.",
  "datePublished": "2026-08-01T10:00:00Z",
  "author": {
    "@type": "Person",
    "name": "Riley",
    "url": "https://example.com/users/riley"
  },
  "comment": [
    {
      "@type": "Comment",
      "url": "https://example.com/forum/desks#reply-1",
      "text": "I added a lamp for evening work.",
      "datePublished": "2026-08-01T11:00:00Z",
      "author": {
        "@type": "Person",
        "name": "Sam",
        "url": "https://example.com/users/sam"
      }
    }
  ]
}
```

## QAPage: one genuine question and its answers

[Google's Q&A guide](https://developers.google.com/search/docs/appearance/structured-data/qapage)
requires one QAPage containing exactly one mainEntity Question. For ordinary community Q&A,
users must be able to submit alternative answers. A publisher FAQ, how-to, blog answer, or
product page with many questions does not qualify. Google documents a separate education
exception for user-submitted homework questions answered/selected by experts; check that exact
guidance for education work rather than using it to qualify marketing content.

**Required:** Question.name (full short question), answerCount, and at least one acceptedAnswer
or suggestedAnswer to qualify for the rich result. Each Answer requires its full text. With
no answers, use answerCount 0 and report that the question is not rich-result eligible; do not
make up an answer. Use acceptedAnswer only if actually accepted by the asker, moderators or a
site voting system, not merely because it is newest. Other answers belong in suggestedAnswer.
**Recommended when available:** longer question text, author, dates, answer URLs and real votes.
Distinguish answers from clarifying comments; mark the latter as Comment. Count actual answers
across pagination, not just those currently displayed. Do not turn comments into extra answers.

Illustration: a community page that allows answers and has one real suggested answer in this
fictional scenario. Its count is illustrative; no acceptance, votes or dates are asserted.

```json
{
  "@context": "https://schema.org",
  "@type": "QAPage",
  "url": "https://example.com/questions/desk-width",
  "mainEntity": {
    "@type": "Question",
    "name": "How do I measure the width of my desk?",
    "answerCount": 1,
    "suggestedAnswer": {
      "@type": "Answer",
      "text": "Measure from the left edge to the right edge of the desktop with a tape measure.",
      "url": "https://example.com/questions/desk-width#answer-1"
    }
  }
}
```

## Bounded verification and handoff

- Confirm the page format and source facts before proposing a feature. Omission is appropriate
  when the type adds no useful supported meaning or the page does not qualify.
- Parse each JSON-LD block; check vocabulary with the [Schema.org Validator](https://validator.schema.org/).
  Use the [Rich Results Test](https://search.google.com/test/rich-results) for supported feature checks
  only within authorized disclosure scope; do not upload private drafts without permission.
- Check actual visible/rendered content and stable IDs/URLs within authorized tool scope. For
  commerce, confirm that selector URLs and offers refer to the same variant. Source-only evidence
  cannot prove live selection, rendering, crawlability, price freshness or indexing.
- Report syntax results, feature requirements, factual gaps and tests not run separately.
  Relevant Search Console reports require authorized access. No test or implementation guarantees display.
