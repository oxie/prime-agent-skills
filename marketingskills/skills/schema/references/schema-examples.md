# Schema Markup Examples

JSON-LD examples for common schema types. These are fictional illustrations, not facts
about a real site or deploy-ready offers, ratings, identities or dates. Replace all values
with verified page content; omit unsupported optional fields. If a required fact is missing,
report the eligibility gap instead of inventing it. Keep real offer availability and dates current.

Schema.org vocabulary validity, Google feature eligibility, required/recommended properties,
and actual display are separate checks. Google does not guarantee rich results or ranking gains.
Feature notes below were checked on 2026-09-15; verify the linked current guidance when using them.
For product variants, genuine profiles and community formats, use
[site-type-eligibility.md](site-type-eligibility.md) only when that page type applies.

## Contents
- Organization
- WebSite (with SearchAction)
- Article / BlogPosting
- Product
- SoftwareApplication
- FAQPage
- HowTo
- BreadcrumbList
- LocalBusiness
- Event
- Multiple Schema Types
- Implementation Example (Next.js)

## Organization

For company/brand homepage or about page. Google's general Organization guidance has no required properties; provide the recommended identity details that actually apply. Subtypes and specific merchant features can have additional requirements.

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Example Company",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "sameAs": [
    "https://twitter.com/example",
    "https://linkedin.com/company/example",
    "https://facebook.com/example"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-555-555-5555",
    "contactType": "customer service"
  }
}
```

---

## WebSite (with SearchAction)

For a homepage describing a real site search function. Google removed the sitelinks
search box starting November 21, 2024. SearchAction remains vocabulary, not a way to
enable that retired feature; omit it if there is no real search function or other need.
WebSite name and url still support Google's site-name system. Site names are not
supported by the Rich Results Test. Do not remove useful truthful markup solely due to retirement.

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Example",
  "url": "https://example.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://example.com/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

---

## Article / BlogPosting

For blog posts and news articles. Google has no required Article properties; headline, image, author and dates are recommended when applicable. The example includes other valid vocabulary, not a universal Google-required property set.

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How to Implement Schema Markup",
  "image": "https://example.com/image.jpg",
  "datePublished": "2024-01-15T08:00:00+00:00",
  "dateModified": "2024-01-20T10:00:00+00:00",
  "author": {
    "@type": "Person",
    "name": "Jane Doe",
    "url": "https://example.com/authors/jane"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Example Company",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  },
  "description": "A complete guide to implementing schema markup...",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://example.com/schema-guide"
  }
}
```

---

## Product

For a specific product page. Choose the Google surface before validating:
- Product snippets require name and at least one of review, aggregateRating or offers.
- Merchant listings require name, image and offers (Offer), on a page where shoppers can buy from the merchant.
- Nested fields have their own requirements. Offer price is required; priceCurrency is
  recommended for snippets but required for merchant listings. Availability is recommended.
- The example's rating and offer are fictional. Only emit ratings grounded in real eligible
  reviews visible on the page. An offers-only snippet can be eligible despite a review warning.
- Add priceValidUntil only for an actual expiry; a past date can prevent snippet display.
  Do not use AggregateOffer to group variants; see the focused variant reference.

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Premium Widget",
  "image": "https://example.com/widget.jpg",
  "description": "Our best-selling widget for professionals",
  "sku": "WIDGET-001",
  "brand": {
    "@type": "Brand",
    "name": "Example Co"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://example.com/products/widget",
    "priceCurrency": "USD",
    "price": "99.99",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "127"
  }
}
```

---

## SoftwareApplication

For actual software app pages, including applicable SaaS apps. Google's software app result
requires name, offers.price, and aggregateRating or review, including their nested requirements.
Do not invent a free price or rating to meet this gate; the values below are fictional.

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Example App",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web, iOS, Android",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.6",
    "ratingCount": "1250"
  }
}
```

---

## FAQPage

For pages with publisher-written frequently asked questions. Google retired FAQ rich results
for **all sites starting May 7, 2026**, superseding the former government/health restriction.
This remains a vocabulary example for other useful consumers, not a Google rich-result recipe.
Do not remove truthful existing FAQPage solely because the feature retired. Do not relabel
this as QAPage; that requires the appropriate genuine question-and-answer page format.

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is schema markup?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Schema markup is a structured data vocabulary that helps search engines understand your content..."
      }
    },
    {
      "@type": "Question",
      "name": "How do I implement schema?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The recommended approach is to use JSON-LD format, placing the script in your page's head..."
      }
    }
  ]
}
```

---

## HowTo

For instructional content and tutorials. Google removed HowTo rich results on
September 13, 2023. This remains a vocabulary example, not a current Google rich-result recipe.
No removal is needed solely for that retirement; do not promise AI-citation benefits either.

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Add Schema Markup to Your Website",
  "description": "A step-by-step guide to implementing JSON-LD schema",
  "totalTime": "PT15M",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Choose your schema type",
      "text": "Identify the appropriate schema type for your page content...",
      "url": "https://example.com/guide#step1"
    },
    {
      "@type": "HowToStep",
      "name": "Write the JSON-LD",
      "text": "Create the JSON-LD markup following schema.org specifications...",
      "url": "https://example.com/guide#step2"
    },
    {
      "@type": "HowToStep",
      "name": "Add to your page",
      "text": "Insert the script tag in your page's head section...",
      "url": "https://example.com/guide#step3"
    }
  ]
}
```

---

## BreadcrumbList

For a page with breadcrumb navigation. Google's feature requires at least two ListItem
entries with position and name (name can instead be on a Thing used as item). The last
breadcrumb can omit item; Google then uses the containing page URL.

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://example.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Blog",
      "item": "https://example.com/blog"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "SEO Guide",
      "item": "https://example.com/blog/seo-guide"
    }
  ]
}
```

---

## LocalBusiness

For local business location pages.

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Example Coffee Shop",
  "image": "https://example.com/shop.jpg",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main Street",
    "addressLocality": "San Francisco",
    "addressRegion": "CA",
    "postalCode": "94102",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "37.7749",
    "longitude": "-122.4194"
  },
  "telephone": "+1-555-555-5555",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "08:00",
      "closes": "18:00"
    }
  ],
  "priceRange": "$$"
}
```

---

## Event

For event vocabulary, including online events. **This online-only example is not eligible
for Google's event experience**, which currently requires a physical location and address,
a dedicated single-event page, and events bookable by the general public. Do not invent a
venue to qualify. Its historical dates and ticket values are illustrations, not current event facts.

```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Annual Marketing Conference",
  "startDate": "2024-06-15T09:00:00-07:00",
  "endDate": "2024-06-15T17:00:00-07:00",
  "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
  "eventStatus": "https://schema.org/EventScheduled",
  "location": {
    "@type": "VirtualLocation",
    "url": "https://example.com/conference"
  },
  "image": "https://example.com/conference.jpg",
  "description": "Join us for our annual marketing conference...",
  "offers": {
    "@type": "Offer",
    "url": "https://example.com/conference/tickets",
    "price": "199",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "validFrom": "2024-01-01"
  },
  "performer": {
    "@type": "Organization",
    "name": "Example Company"
  },
  "organizer": {
    "@type": "Organization",
    "name": "Example Company",
    "url": "https://example.com"
  }
}
```

---

## Multiple Schema Types

Combine multiple schema types using @graph.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://example.com/#organization",
      "name": "Example Company",
      "url": "https://example.com"
    },
    {
      "@type": "WebSite",
      "@id": "https://example.com/#website",
      "url": "https://example.com",
      "name": "Example",
      "publisher": {
        "@id": "https://example.com/#organization"
      }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://example.com" },
        { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://example.com/blog" }
      ]
    }
  ]
}
```

---

## Implementation Example (Next.js)

```jsx
export default function ProductPage({ product }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    // ... other properties
  };

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </Head>
      {/* Page content */}
    </>
  );
}
```

---

## Feature Sources

Google feature notes checked 2026-09-15. These sources define eligibility, not guarantees.

- [Organization](https://developers.google.com/search/docs/appearance/structured-data/organization)
- [Site names](https://developers.google.com/search/docs/appearance/site-names) and [sitelinks search-box retirement](https://developers.google.com/search/blog/2024/10/sitelinks-search-box)
- [Article](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Product snippets](https://developers.google.com/search/docs/appearance/structured-data/product-snippet) and [merchant listings](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing)
- [Software apps](https://developers.google.com/search/docs/appearance/structured-data/software-app)
- [FAQ retirement](https://developers.google.com/search/updates#removing-faq-rich-result) and [HowTo retirement update](https://developers.google.com/search/blog/2023/08/howto-faq-changes)
- [Breadcrumb](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)
- [Local business](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Event](https://developers.google.com/search/docs/appearance/structured-data/event)
- [Google feature gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery)
