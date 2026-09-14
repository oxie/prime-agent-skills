# Storefront decisions and feedback

Use for an in-scope product, browsing, cart or checkout UI change. Keep Hallmark's
selected design, audit or study workflow; a review remains read-only. This is not
a store-launch checklist, permission to add features, or a reason to change the
framework, brand or backend. Read only the section relevant to the task.

## Preserve the shopper's choice

- Resolve the selected option combination to a purchasable variant. Variant count
  alone does not establish intent: two colours or sizes can require a real choice.
  Automatic selection is appropriate only for one purchasable option or a clearly
  disclosed, valid product default. Never silently substitute another variant.
- Keep selected options, image where relevant, price and availability consistent.
  If another selection becomes invalid, explain what must change before purchase.
  Stock, backorder and preorder rules come from the backend, not a zero-stock guess.
- A range or starting price is not the selected variant's payable total. Label it
  accordingly. Reuse locale-aware currency formatting without guessing amount units.
- Cart lines need the chosen options as well as the product name. A reorder uses
  current prices and availability; explain unavailable lines and partial results.

## Preserve the browsing task

Use the site's existing URL/state conventions for supported filters, sort and page.
Restore valid controls on reload and browser Back, including useful scroll position.
When filters change, reset an invalid page/cursor; sorting should not discard filters.
A late response for an old query must not replace the current result set.

Choose pagination, load-more or infinite loading for the actual catalogue and task.
Retain reachable footer content, keyboard use, back navigation and crawlable page
links where indexing matters. Do not require infinite scroll or one grid density.
Show active filters, a clear/reset action and a helpful no-results state. Use real
backend counts; do not display invented matching products during loading.

## Make purchase feedback truthful

Distinguish pending, confirmed, rejected and unknown outcomes. A sent request or a
resolved fetch is not proof an item was added. If the UI predicts a change, label
pending work appropriately and follow the existing reconciliation contract rather
than declaring success early. Keep entered choices on recoverable failures.

Show calculated totals separately from shipping/tax estimates. A country switch
can change eligibility and totals; explain invalidated delivery or payment choices.
Do not promise free shipping solely because a local subtotal passed a threshold.
Use the backend's applicable promotion and shipping result. Stock scarcity, ratings
and delivery promises must reflect real data, not conversion placeholders.

Represent order status, payment status and notification status separately. An order
may exist while payment is pending; an email request is not evidence of delivery.
Only offer a retry that the transaction contract establishes as safe.

## Verify the changed experience

Use the existing project checks and, when authorized, browser-check. Select relevant
cases: an invalid variant combination, a rejected cart request, Back after filtering,
a country change that invalidates delivery, and payment pending on confirmation.
Check purchase controls at narrow widths, with keyboard/focus and safe-area insets;
announce meaningful cart changes without stealing focus. No browser session, model
trial or complete store audit is required merely to read this reference. Report
unexecuted cases as not tested; appearance alone proves no conversion improvement.

Engineering References owns transaction correctness: use its commerce reference when
API writes, region dependencies or uncertain payment outcomes are in scope. A purely
visual edit does not trigger that review. CRO retains conversion analysis; seo-audit
and schema retain indexing and structured data. Keep parameterized routes compatible
with the site's rendering strategy; they can be statically generated.

## Origin and maintenance

Original local guidance, offered under Hallmark's MIT terms. The review of
[Medusa's storefront skill](https://github.com/medusajs/medusa-agent-skills/tree/a46f3b13c6048b769337aee9cc8d6a61e8f660e1/plugins/ecommerce-storefront/skills/storefront-best-practices)
identified a useful commerce gap and unsafe examples. Its text, code and plugin
are not bundled or relicensed; no clear redistribution license was found at that
pin. This is not a line-by-line rewrite or a Medusa implementation recipe.
Existing Hallmark scope and engineering contracts remain authoritative. Future
changes need normal source review and deterministic checks, not automatic updates.
