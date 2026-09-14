# How Each AI Platform Picks Sources

Each AI search platform has its own search index, ranking logic, and content preferences. This guide covers what matters for getting cited on each one.

Sources cited throughout: Princeton GEO study (KDD 2024), SE Ranking domain authority study, ZipTie content-answer fit analysis.

---

## The Fundamentals

Every AI platform shares three baseline requirements:

1. **Your content must be discoverable through the relevant retrieval path** — Search indexing and user-requested page retrieval are different paths; the applicable requirements depend on the platform and feature.
2. **Access controls must match the intended use** — Search, training, and user-requested retrieval have different controls. Check the role table below; allowing access does not guarantee citation.
3. **Your content must be extractable** — AI systems pull passages, not pages. Clear structure and self-contained paragraphs win.

Beyond these basics, each platform weights different signals. Here's what matters and where.

---

## Google AI Overviews

Google AI Overviews pull from Google's own index and lean heavily on E-E-A-T signals (Experience, Expertise, Authoritativeness, Trustworthiness). They appear in roughly 45% of Google searches.

**What makes Google AI Overviews different:** They already have your traditional SEO signals — backlinks, page authority, topical relevance. The additional AI layer adds a preference for content with cited sources and structured data. Research shows that including authoritative citations in your content correlates with a 132% visibility boost, and writing with an authoritative (not salesy) tone adds another 89%.

**Importantly, AI Overviews don't just recycle the traditional Top 10.** Only about 15% of AI Overview sources overlap with conventional organic results. Pages that wouldn't crack page 1 in traditional search can still get cited if they have strong structured data and clear, extractable answers.

**What to focus on:**
- Schema markup is the single biggest lever — Article, FAQPage, HowTo, and Product schemas give AI Overviews structured context to work with (30-40% visibility boost)
- Build topical authority through content clusters with strong internal linking
- Include named, sourced citations in your content (not just claims)
- Author bios with real credentials matter — E-E-A-T is weighted heavily
- Get into Google's Knowledge Graph where possible (an accurate Wikipedia entry helps)
- Target "how to" and "what is" query patterns — these trigger AI Overviews most often

**Watch for OKF.** In June 2026 Google introduced the [Open Knowledge Format](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing) — a markdown spec for agent-readable site bundles. There is no confirmed signal that AI Overviews factor it in today, but the spec is published, the GitHub repo lives under `GoogleCloudPlatform`, and it ships inside Knowledge Catalog. For protocol-layer "register early" plays, it has the same shape as early schema.org adoption did a decade ago. See **Machine-Readable Files for AI Agents** in the main `SKILL.md` for how to generate and serve a bundle.

---

## ChatGPT

ChatGPT's web search draws from a Bing-based index. It combines this with its training knowledge to generate answers, then cites the web sources it relied on.

**What makes ChatGPT different:** Domain authority matters more here than on other AI platforms. An SE Ranking analysis of 129,000 domains found that authority and credibility signals account for roughly 40% of what determines citation, with content quality at about 35% and platform trust at 25%. Sites with very high referring domain counts (350K+) average 8.4 citations per response, while sites with slightly lower trust scores (91-96 vs 97-100) drop from 8.4 to 6 citations.

**Freshness is a major differentiator.** Content updated within the last 30 days gets cited about 3.2x more often than older content. ChatGPT clearly favors recent information.

**The most important signal is content-answer fit** — a ZipTie analysis of 400,000 pages found that how well your content's style and structure matches ChatGPT's own response format accounts for about 55% of citation likelihood. This is far more important than domain authority (12%) or on-page structure (14%) alone. Write the way ChatGPT would answer the question, and you're more likely to be the source it cites.

**Where ChatGPT looks beyond your site:** Wikipedia accounts for 7.8% of all ChatGPT citations, Reddit for 1.8%, and Forbes for 1.1%. Brand official sites are cited frequently but third-party mentions carry significant weight.

**What to focus on:**
- Invest in backlinks and domain authority — it's the strongest baseline signal
- Update competitive content at least monthly
- Structure your content the way ChatGPT structures its answers (conversational, direct, well-organized)
- Include verifiable statistics with named sources
- Clean heading hierarchy (H1 > H2 > H3) with descriptive headings

---

## Perplexity

Perplexity always cites its sources with clickable links, making it the most transparent AI search platform. It combines its own index with Google's and runs results through multiple reranking passes — initial relevance retrieval, then traditional ranking factor scoring, then ML-based quality evaluation that can discard entire result sets if they don't meet quality thresholds.

**What makes Perplexity different:** It's the most "research-oriented" AI search engine, and its citation behavior reflects that. Perplexity maintains curated lists of authoritative domains (Amazon, GitHub, major academic sites) that get inherent ranking boosts. It uses a time-decay algorithm that evaluates new content quickly, giving fresh publishers a real shot at citation.

**Perplexity has unique content preferences:**
- **FAQ Schema (JSON-LD)** — Pages with FAQ structured data get cited noticeably more often
- **PDF documents** — Publicly accessible PDFs (whitepapers, research reports) are prioritized. If you have authoritative PDF content gated behind a form, consider making a version public.
- **Publishing velocity** — How frequently you publish matters more than keyword targeting
- **Self-contained paragraphs** — Perplexity prefers atomic, semantically complete paragraphs it can extract cleanly

**What to focus on:**
- Review `PerplexityBot` search access against the approved site policy; distinguish it from `Perplexity-User` user-requested fetches (see the role table below)
- Implement FAQPage schema on any page with Q&A content
- Host PDF resources publicly (whitepapers, guides, reports)
- Add Article schema with publication and modification timestamps
- Write in clear, self-contained paragraphs that work as standalone answers
- Build deep topical authority in your specific niche

---

## Microsoft Copilot

Copilot is embedded across Microsoft's ecosystem — Edge, Windows, Microsoft 365, and Bing Search. It relies entirely on Bing's index, so if Bing hasn't indexed your content, Copilot can't cite it.

**What makes Copilot different:** The Microsoft ecosystem connection creates unique optimization opportunities. Mentions and content on LinkedIn and GitHub provide ranking boosts that other platforms don't offer. Copilot also puts more weight on page speed — sub-2-second load times are a clear threshold.

**What to focus on:**
- Submit your site to Bing Webmaster Tools (many sites only submit to Google Search Console)
- Use IndexNow protocol for faster indexing of new and updated content
- Optimize page speed to under 2 seconds
- Write clear entity definitions — when your content defines a term or concept, make the definition explicit and extractable
- Build presence on LinkedIn (publish articles, maintain company page) and GitHub if relevant
- Review `Bingbot` crawl access against the approved site policy

---

## Claude

Claude uses Brave Search as its search backend when web search is enabled — not Google, not Bing. This is a completely different index, which means your Brave Search visibility directly determines whether Claude can find and cite you.

**What makes Claude different:** Claude is extremely selective about what it cites. While it processes enormous amounts of content, its citation rate is very low — it's looking for the most factually accurate, well-sourced content on a given topic. Data-rich content with specific numbers and clear attribution performs significantly better than general-purpose content.

**What to focus on:**
- Verify your content appears in Brave Search results (search for your brand and key terms at search.brave.com)
- Review `Claude-SearchBot` search access and `Claude-User` user-requested retrieval separately from `ClaudeBot` training use, under the approved site policy
- Maximize factual density — specific numbers, named sources, dated statistics
- Use clear, extractable structure with descriptive headings
- Cite authoritative sources within your content
- Aim to be the most factually accurate source on your topic — Claude rewards precision

---

## Crawler Controls by Role

Search discovery, model-training use, and user-requested retrieval are separate policy decisions. Use these named roles to review the site's approved policy; this table is not an allow list or a ready-to-deploy robots.txt file.

| Named control | Official role | Scope and caveat |
|---|---|---|
| `OAI-SearchBot` | OpenAI search crawler | Surfaces sites in ChatGPT search. Independent of `GPTBot`. OpenAI says opted-out sites are not shown in search answers but may still appear as navigational links. |
| `GPTBot` | OpenAI training crawler | Crawls content that may be used to train generative AI foundation models. A training opt-out does not require opting out of `OAI-SearchBot`. |
| `ChatGPT-User` | OpenAI user-requested access | Not automatic web crawling or the Search opt-out control. OpenAI says robots.txt rules may not apply because a user initiates these requests. |
| `Claude-SearchBot` | Anthropic search crawler | Analyzes content to improve search relevance and accuracy. Blocking it prevents indexing for search optimization and may reduce search visibility. |
| `Claude-User` | Anthropic user-requested retrieval | Retrieves pages in response to user queries. Blocking it prevents that retrieval. Anthropic says its bots, including this one, honor robots.txt directives. |
| `ClaudeBot` | Anthropic training crawler | Collects web content that could contribute to model training. Restricting it signals exclusion of future materials from training datasets, not a blanket search opt-out. |
| `Googlebot` | Google Search crawler | Controls crawling for Search, including AI Overviews and AI Mode. Search preview/indexing controls such as `nosnippet`, `data-nosnippet`, `max-snippet`, and `noindex` have separate effects; consult Google's AI features guide. |
| `Google-Extended` | Google content-use product token | Controls use for training future Gemini models powering Gemini Apps and Vertex AI API for Gemini, and grounding in Gemini Apps and Grounding with Google Search on Vertex AI. It does not affect Google Search inclusion or ranking. It is a robots.txt token, not a separate HTTP user agent. |
| `PerplexityBot` | Perplexity search crawler | Surfaces and links sites in search results; not used to crawl content for AI foundation-model training. |
| `Perplexity-User` | Perplexity user-requested fetcher | Not automatic crawling or foundation-model training. Perplexity says it generally ignores robots.txt because a user requested the fetch. |

**Apply only the approved site policy.** Search access, training permission, and user-requested access remain the user's independent decisions, within each provider's documented controls. Do not default to allowing all bots or change robots.txt, CDN, or WAF rules without explicit authorization. Check relevant access restrictions without weakening security controls. robots.txt is not authentication or a universal content-use enforcement mechanism; the user-requested exceptions differ by provider. Allowing access does not guarantee indexing, citation, or recommendation. Do not promise that blocking any one crawler removes all mentions or citations through other sources.

**Official scope sources — checked 2026-09-14:** [OpenAI crawlers](https://developers.openai.com/api/docs/bots); [Anthropic bots](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler); [Google common crawlers / Google-Extended](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers#google-extended); [Google AI features controls](https://developers.google.com/search/docs/appearance/ai-features#control); [Perplexity bots](https://docs.perplexity.ai/docs/resources/perplexity-crawlers). Recheck these primary docs before advising a policy change; roles and controls can change.

---

## Where to Start

If you're optimizing for AI search for the first time, focus your effort where your audience actually is:

**Start with Google AI Overviews** — They reach the most users (45%+ of Google searches) and you likely already have Google SEO foundations in place. Add schema markup, include cited sources in your content, and strengthen E-E-A-T signals.

**Then address ChatGPT** — It's the most-used standalone AI search tool for tech and business audiences. Focus on freshness (update content monthly), domain authority, and matching your content structure to how ChatGPT formats its responses.

**Then expand to Perplexity** — Especially valuable if your audience includes researchers, early adopters, or tech professionals. Add FAQ schema, publish PDF resources, and write in clear, self-contained paragraphs.

**Copilot and Claude are lower priority** unless your audience skews enterprise/Microsoft (Copilot) or developer/analyst (Claude). But the fundamentals — structured content, cited sources, schema markup — help across all platforms.

**Actions that help everywhere:**
1. Review search, training, and user-requested access controls separately against the approved site policy
2. Implement schema markup (FAQPage, Article, Organization at minimum)
3. Include statistics with named sources in your content
4. Update content regularly — monthly for competitive topics
5. Use clear heading structure (H1 > H2 > H3)
6. Keep page load time under 2 seconds
7. Add author bios with credentials
