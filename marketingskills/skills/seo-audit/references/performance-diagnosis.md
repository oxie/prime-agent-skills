# Performance diagnosis from comparable evidence

Use for an actual performance question, not an automatic optimization pass. Work
from supplied reports or separately authorized checks. No provider API, credential,
public crawl, installation or browser startup is authorized by this reference.

## Establish what was measured

Record the requested/final URL, build or deployment revision when known, capture
time, device/form factor and network/CPU conditions. Distinguish URL versus origin,
field versus lab, reporting window, metric coverage and aggregation. Missing field
data is unknown, not a failed page. An origin aggregate is not a measurement of one
route. A single navigation is not a population distribution.

For available real-user metrics, good thresholds are LCP <=2.5s, INP <=200ms and
CLS <=0.1 at the 75th percentile (p75). State unavailable metrics and any report-level
assessment limits. A Lighthouse score or passing local trace is not proof of a field
CWV pass. Do not substitute lab Total Blocking Time for measured field INP.

## Find the cause before selecting a fix

- **LCP:** identify the actual element; it may be text, not a hero image. For an image
  navigation, distinguish server response time, resource discovery delay, download
  duration and render delay. The phases sum on that navigation; separate p75 values
  do not sum to overall LCP p75. CrUX image subparts omit text LCP and do not provide
  an exact percentage decomposition of overall p75. Do not infer “40% contribution”
  or an oversized image solely from separate percentile values.
- **Discovery versus priority:** preload can expose a late-discovered resource early;
  fetchpriority is a relative-priority hint, not preload. Check the waterfall and
  actual LCP resource before applying either. Do not preload every image/font or
  mark all resources high priority. Avoid lazy-loading the actual critical LCP image.
- **INP:** inspect the affected interaction and its input delay, handler processing
  and presentation delay. Locate long tasks and main-thread work before changing
  event handlers, splitting work or reducing rendering cost. A quiet initial page
  load does not prove responsive interactions throughout the visit.
- **CLS:** identify the shifting elements and timing. Reserve image/embed geometry,
  inspect injected content, fallback font metrics and font swaps. `font-display: swap`
  can itself shift layout; choose loading/fallback behavior from the observed cause,
  not a universal “swap plus preload” recipe.

Preserve cache and privacy requirements. Do not remove `Cache-Control: no-store` to
improve a static score. Chrome can admit eligible no-store pages to bfcache under
safety conditions; behavior varies by browser. Inspect actual not-restored reasons
and sensitive-data requirements before changing navigation/cache behavior.

## Verify and report

Recheck the same route and representative interaction with comparable conditions.
Repeat a noisy lab measurement only within the agreed bounded check plan; show
variation rather than select the best run. Compare field windows with device/origin
scope intact; a rolling field window can contain both old and new deployments.
A before/after change alone does not establish deployment causality or ranking gain.

Report: evidence source/window/coverage; observed element or interaction; proposed
cause and confidence; smallest relevant fix; comparable recheck; remaining unknowns.
For example, a lower local LCP after a preload proves only that observed lab result,
not an immediate CrUX or Google ranking improvement.

Sources checked 2026-09-15:
- [Core Web Vitals](https://web.dev/articles/vitals)
- [Optimize LCP](https://web.dev/articles/optimize-lcp)
- [CrUX metrics and image subparts](https://developer.chrome.com/docs/crux/methodology/metrics)
- [Fetch priority](https://web.dev/articles/fetch-priority)
- [Optimize CLS](https://web.dev/articles/optimize-cls)
- [Chrome no-store and bfcache](https://developer.chrome.com/docs/web-platform/bfcache-ccns)
