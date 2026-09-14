# Commerce transaction boundaries

Read when changing cart writes, regional pricing dependencies, checkout completion
or guest-order access. Select the relevant cases; ordinary visual work needs none.
A review is read-only unless edits are authorized. This is original domain guidance,
not an SDK recipe, new payment framework or permission to transact against a live
store. Preserve the project's existing client, auth, cache and test environment.

## Establish the actual contract first

Identify the backend and installed SDK/provider versions from project dependencies,
types and relevant official documentation. Do not print environment values while
identifying configuration; use dependency names or redacted presence checks. Never
install a latest package or configure MCP merely to match a reference example.

Record only the identities needed for the changed operation: shopper or guest
capability, cart, selected variant, region, and payment/session or intent where
applicable. Determine amount units, tax inclusion, rounding and currency at the API
boundary. A formatting locale does not establish currency or amount units. Product
prices, cart-level promotions and the final amount due are not interchangeable.

Use [contract boundaries](contract-boundaries.md) for parsed responses, stale request
identity, cache reconciliation and unknown writes. An HTTP response alone is not
business success. Native fetch resolves on HTTP errors; check status, parse the
expected response and confirm the operation result before retiring pending state.
Prefer the SDK's documented response/error contract when that is the actual client.

## Follow regional dependencies

For a country or region change, trace only the relevant dependency edges:

| Changed input | State to recalculate or revalidate |
|---|---|
| Country/region | Currency, prices, taxes and allowed delivery addresses |
| Address or cart contents | Shipping eligibility, shipping groups and selected methods |
| Shipping, discounts or resulting total | Payment eligibility and any amount-bound session |
| Customer identity or promotion | Customer-specific prices, discounts and payable totals |

An explicit applicable saved choice outranks a geolocation hint. Countries and
regions are not synonyms; use the backend's mapping. Confirm a cart mutation before
presenting its new totals as settled. Include the real pricing dimensions in query
keys and guard late responses from the prior region or cart. Serialize conflicting
mutations or use the project's established version/intent-aware reconciliation.
Keep still-valid selections; explain and clear invalid ones. Do not charge an old
amount after a region/address change. Validate or replace sessions as the provider
contract requires; do not prescribe one lifecycle for every backend.

Use authoritative item/cart totals, adjustments and shipping eligibility. A local
price-times-quantity or threshold calculation is at most an explicitly labeled
estimate when taxes, discounts or other conditions apply. Recheck availability at
the write boundary, including backorder/preorder rules. UI disabling cannot reserve
stock. Preserve coupon case unless the backend defines normalization.

## Retire only the cart that became an order

1. Parse the completion result and establish the confirmed order/cart relationship.
2. Retire that completed cart's cached and persisted state. Clear the active cart
   only if its identity still matches the completed cart. Do not clear a newer cart
   created in another tab or after a delayed response.
3. Guard in-flight reads so an old cart cannot repopulate the header or popup.
4. Navigate with the confirmed order identity and permitted display data. Merely
   entering or revisiting a confirmation URL must not clear the current cart.

Reordering is a new shopping intent, not replay of an old price or payment. Check
current purchasability and prices; return explicit partial results if supported,
without silently substituting variants or duplicating already-added lines on retry.

## Separate payment progress from uncertainty

Keep order state, payment state and notification state distinct across checkout,
confirmation and account views. Follow the selected provider's synchronous or
asynchronous flow. A redirect, disabled button or success-looking page establishes
neither payment settlement nor notification delivery. Pending payment may be valid
for a confirmed order only when the backend/provider contract supports that flow.

A timeout after a payment or completion write is an unknown outcome, not necessarily
a rejection. Preserve the operation identity and reconcile with authoritative state
before offering a new attempt, or use a documented server-backed duplicate-safe
operation. A new random retry key is not reconciliation. Follow the detailed retry
rules in [contract boundaries](contract-boundaries.md); do not invent a second
idempotency layer. Verify provider callbacks/webhooks through the project's existing
signature, deduplication and ordering contract when that boundary is changed.

## Protect customer and guest-order access

Use [API authorization](api-authorization.md) for object/operation enforcement and
denied-write tests. A page redirect or authenticated session does not authorize
access to someone else's order, address, invoice or saved payment method. For guest
orders, establish the backend's documented capability and disclosure policy; an
opaque identifier alone is not a general authorization design. Avoid exposing full
address, phone or billing details beyond the permitted recipient and response.
Treat order-access links/capabilities as sensitive. Keep them, credentials, payment
data and private customer payloads out of diagnostics. Use provider-hosted/tokenized
payment handling as appropriate; do not collect or persist raw card security codes.

## Choose tests for the changed boundary

Use the target project's ordinary tests and authorized sandbox, never real purchases
or live payment calls solely for this checklist. Assert state and effects, not just
a toast or HTTP call count. Relevant cases include:

- HTTP rejection or malformed success body: no confirmed cart addition.
- Region A response arriving after region B: no stale price, selection or session.
- Completed cart A with new active cart B: B survives completion and page revisit.
- Lost response after committed completion: reconciliation does not create a second
  order/payment effect; a genuine rejection remains retryable only by its contract.
- Pending payment: confirmation does not claim paid or email delivered without proof.
- Another customer's object or invalid guest capability: denied disclosure/write,
  with protected state unchanged.

Keep unknowns explicit when provider or backend behavior is not exercised. These
cases are implementation acceptance examples, not tests executed by this document.
No synthetic model trials, benchmark loop or monitoring service is introduced.

## Origin and maintenance

Original local guidance under the existing MIT wrapper terms, composed around the
installed response, authorization and mutation contracts. A review of
[Medusa's storefront skill](https://github.com/medusajs/medusa-agent-skills/tree/a46f3b13c6048b769337aee9cc8d6a61e8f660e1/plugins/ecommerce-storefront/skills/storefront-best-practices)
identified commerce-specific gaps. No upstream text, code or plugin is bundled or
relicensed; no clear redistribution license was found at that pin. Existing source
notices retain their separate rights. Medusa-specific APIs and currency conventions
must be checked for the actual target version, not inferred from that skill.

Hallmark retains storefront presentation; CRO retains conversion analysis; seo-audit
and schema retain search guidance. This reference does not transfer those jobs or
require every owner to run. Maintain it through normal reviewed skill updates.
