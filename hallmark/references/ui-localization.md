# UI localization — scoped implementation questions

Use when supported locales, localized controls or language-dependent layout are in
scope. Not every public app requires localization. A static prose edit with no
locale requirement needs no locale audit. Reviews stay read-only; translation
services, new dependencies and automatic scans are not authorized here.
Use existing application i18n mechanisms; native Intl may cover formatting needs.
Hallmark owns visible usability, the project owns message/runtime implementation,
and seo-audit owns locale URLs, hreflang, canonicals and indexing. No duplicate plan.

## Define language and message contracts

Identify supported locale tags, default/base language, namespaces, file formats,
explicit exclusions and fallback policy. Do not infer a locale only from the parent
folder: messages/en.json and messages/fr.json are different locales. Preserve the
project's source-of-truth layout. A missing locale file is not a complete translation.

Use meaningful message keys and context for translators where the existing library
uses keys. Do not concatenate fragments whose order/grammar changes by language.
Match placeholders, plural/select branches and escaping to the supported message
format and library version; do not require ICU if another mechanism meets the need.
Fallback must not conceal a required translation gap. Distinguish intentionally
untranslated proper names/content from missing UI messages. Translation completeness
alone does not establish linguistic correctness; human review may remain unavailable.

Choose locale, timezone, currency and calendar deliberately for dates/numbers.
Use supported Intl or existing formatters rather than string replacement. A locale
does not determine currency or a user's timezone. Preserve amounts/instants and
business rounding; formatting is not conversion. Test zero, plural categories,
negative/large values and boundary dates in relevant locales. Date-only values need
semantics that do not shift the displayed day through accidental timezone conversion.

Keep document/subtree lang and direction accurate. Establish deterministic initial
locale on server and client where applicable; browser-only detection can cause
hydration mismatch or wrong-language flashes. Preserve the project's persistence and
explicit language-choice policy rather than inventing a consent/storage mechanism.

## Check real translated layout and interactions

Use representative actual long translations or labeled pseudo-localization. There
is no universal percentage of expansion. Test navigation, buttons, validation/help,
empty/loading/error states and tables at narrow widths and text zoom. Keep essential
text available; clipping or forced ellipsis is not a localization fix. Status and
error messages need the same attention as headings. Do not fabricate translations.

Prefer logical spacing/alignment for writing direction where layout should follow
it. Mirror directional arrows only when their meaning requires it, not every icon,
logo, media control or number. Check keyboard order, focus return and arrow-key
behavior against the actual widget/library direction contract. DOM reading order
must remain meaningful; visual reversal alone is not sufficient.
For mixed-direction user text/IDs, use suitable bidi isolation rather than reversing
strings; treat translated interpolation as untrusted data, not raw executable HTML.

## CJK typography in the selected locale

CJK is not one punctuation or spacing system. Confirm locale, approved copy and
writing mode. Chinese quotation conventions vary by region and orientation;
[CLREQ](https://www.w3.org/TR/clreq/#h_quotations) is Chinese-specific guidance.
Preserve supplied punctuation; flag mismatches rather than rewriting copy.

Check actual glyph coverage, including names and regional forms. Browsers select
fallback character by character; a CSS family name does not prove rendered font use.
Compare loaded/fallback baselines, size, weight, wrapping and clipped controls.
[Inter](https://rsms.me/inter/) offers text/display optical sizes, not proof of CJK
coverage. Keep chosen fonts; no font download or installation is authorized.

Check real strings at narrow widths and text zoom. Do not apply Chinese line-breaking
rules wholesale to Japanese or Korean. Tune line-break, word-break and overflow to
the locale and renderer; do not insert spaces/hard breaks to match a screenshot.
Treat text-wrap balance/pretty as optional enhancements with readable ordinary
wrapping; support varies by value and renderer.

Inspect the target browser or receiving renderer. Record locale, font state and
widths; unavailable rendering or linguistic review is **not tested**. A successful
font load is not visual evidence. Keep the current workflow.

## Honest completeness evidence

Use the project's existing parser/checker if authorized and suitable. Declare the
locale/namespace set and exact files considered. Report discovered, selected, parsed,
checked, excluded and failed counts separately. A scan cap or skipped file means
partial coverage, never a complete pass. Malformed message data must surface as an
error/incomplete check, not disappear. Parse each supported format, or mark it untested.

Compare required keys, placeholder names/types, branches and nesting using the
actual message schema. Decide intentional fallback/exclusions explicitly. Inspect
remaining user-facing literals even in files that already contain i18n calls.
One translation call does not clear every string in that file. Regex matching alone
cannot reliably distinguish UI prose, identifiers, comments and runtime messages.
The upstream i18n_checker.py is not installed or a trusted completeness gate.

## Small useful verification set

Use native project tests for: missing locale/namespace/key, invalid syntax, changed
placeholder, plural/select cases and valid documented fallback. Add a known-valid
control so a checker that rejects everything cannot pass. Inspect rendered long text,
RTL/mixed-direction fields, date/time/number semantics and language-switch behavior
when relevant. Actual accessibility/AT checks are separate from key counts.

Example: a second-locale settings page has translated labels but an untranslated
save error and an RTL back arrow that still points the wrong way. Fix those specific
contracts, not every icon or the entire app architecture. A complete existing setup
needs no new tooling. Report findings, smallest response and unavailable checks.

Modified for Prime: selectively rewritten with coverage/error distinctions and no
bundled checker. See [source and license notices](../NEXT_SOURCES.md).
