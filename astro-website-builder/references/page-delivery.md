# Deliver complete pages, not just a scaffold

Follow the agreed route-purpose map. Build one representative full slice first:
layout/head, navigation, content and assets, needed interaction, and expected
empty/error/not-found behavior. Reuse that shell only where it fits the other
requested pages. Keep native semantics and the project's selected design system.

## A shared layout/head contract

Use one clear owner for document wrapper, lang/direction, charset, viewport,
page title, description and main landmark. Match typed Props across wrapper/head
and all callers, including optional noindex/canonical/image fields. Do not rely on
runtime prop spreading to hide a type mismatch. Ensure the page supplies the actual
content and one meaningful page-level heading, without duplicating it in Markdown.

Construct public URLs from the agreed origin and path policy, not an untrusted
request Host or an unchecked arbitrary canonical string. Support real site base
paths, locale routes and deliberate canonical overrides. Do not publish preview
origins. Image metadata must describe an existing asset and its real dimensions.
Use the existing SEO/schema owners for indexing decisions. There are no mandatory
word counts, keyword quotas, every-page schema requirements or ranking promises.

Structured data must match real visible facts. Do not invent business details,
ratings, SearchAction endpoints, authors or timestamps. JSON.stringify alone does
not make data safe inside an HTML script element. Use a maintained safe embedding
method, or correctly escape script-breaking characters (notably `<`) before raw
JSON-LD insertion; preserve JSON validity. HTML text escaping and JS/JSON serialization
have different contracts. Test a string containing a closing-script sequence.
Never feed arbitrary markup to set:html as a shortcut for safe content rendering.

## Assets and presentation

Use owned/approved assets and preserve their actual license/notice obligations.
A package's name, image-provider brand or generated output does not establish rights.
Keep fonts, icons and motion optional and task-led; do not copy Taste's universal
font/card/color rules or fabricate proof to make a page appear credible.

Import processed source images from src/ using the supported Astro asset API.
Files under public/ are normally referenced by URL, not treated as imported source
metadata. Account for base paths and remote image policy. Reserve real geometry,
provide meaningful alt for informative images and empty alt for decorative ones.
Loading strategy follows importance: do not lazy-load the critical hero by habit
or preload every font/image. Inspect real output rather than infer optimization
from an Image component name. Avoid hiding essential text to fix a narrow layout.

## Islands and progressive enhancement

Static .astro output and native HTML cover many reading pages, disclosures and
forms. React is not required for a FAQ or navigation. For a needed framework island,
match the project's integration and choose hydration deliberately. client:load suits
immediate controls; client:visible can suit deferrable work. Do not defer an essential
interaction without a usable pre-hydration path. client:only skips server rendering
and needs an intentional fallback; it is not a universal browser-API fix.

Hydrated islands normally start with server-rendered HTML. Browser-only globals
must not run in server render paths; hydration must reconcile the initial content.
Do not assume state is shared between separate islands. Use only the project's
required state bridge, not a new global store. Verify actual callbacks/value shapes
for local shadcn wrappers through the existing composition reference when relevant.

For any form, decide the native/no-JS behavior before adding an async handler.
A form without method/action defaults to GET on the current page: private field
values can enter URLs. Use an explicit safe endpoint/method and a server capable of
handling it, or do not enable submission until a real destination exists. Static
hosting does not implement a POST endpoint because the form names one. Third-party
form services and message sends require separate applicable authority.

Server validation, authorization/CSRF where applicable, abuse controls and storage
retention remain required for real submissions. The client must distinguish HTTP
failure, transport/unknown outcome and confirmed success. Never silently turn a
failed response into an empty table or successful toast. Prevent unsafe duplicate
retries. Use the existing engineering/API guidance for those boundaries rather than
the excluded upstream admin-cookie/database examples.

Check labels/help/errors, native Enter submission, explicit button types, focus and
status announcements. Menus/disclosures need appropriate expanded state and controlled
region relationships. Test keyboard, escape/focus return for modal behavior, narrow
widths, text zoom and reduced motion. Correct native controls need no framework swap.

## Verification and delivery

Use the target's existing authorized check/type/build/test commands and inspect their
completed exits. Test exact routes and content policies, broken links, missing-entry
responses, metadata/base-path/canonical output, public asset resolution and secret
exposure. A build or typecheck alone cannot establish these outcomes.

When a local preview is authorized, use the project's manual server workflow and
record its owned handle. browser-check retains its exact authorized-local-origin,
action and cleanup limits. No public/authenticated browsing or automatic server
startup is granted here. For read-only reviews, report missing rendered evidence
rather than run mutating builds or start services.

If deployment is requested separately, verify the actual adapter/runtime, environment
requirements, host headers/redirects and public route responses. Keep analytics,
cloud provisioning, migrations and deployment approval separate. Report an unavailable
production check as unknown, not a defect by itself or a verified deployment.

Return the agreed route inventory with working/missing status, changed files,
commands/results, output/publication checks and rendered limits. Do not quietly
reduce a requested backend or page to a static mock. State unresolved requirements
and the concrete permission or decision needed. No extra site-wide audit is required
once the authorized slice and its real checks are complete.
