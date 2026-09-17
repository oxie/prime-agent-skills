# Selected gstack methods and rights

Source: https://github.com/garrytan/gstack
Reviewed revision: `a6b3a57512ca6d5c6aa5b68f74f736195021f96e`. Package `1.87.4`; root VERSION `1.87.4.0`.
Selected material is covered by MIT, Copyright (c) 2026 Garry Tan; the full
[copyright, permission and warranty notice](licenses/gstack-MIT.txt) is retained.
The root NOTICE lists separate Apache-2.0 design-derived groups; none of the
selected files below is listed in those groups. This is a selected-source review,
not a claim that the whole gstack tree has only MIT terms or legal certification.

## Reviewed mechanism sources

- `autoplan/SKILL.md.tmpl`: 164–175.
- `bin/gstack-autoplan-snapshot.ts`: 103–181.
- `test/autoplan-snapshot.test.ts`: 267–295.
- `plan-eng-review/sections/review-sections.md`: 306–337.
- `qa/SKILL.md.tmpl`: 108–119, 206–243.

Root LICENSE and NOTICE.md were also reviewed. gstack-provenance.json records the
pin, source hashes/ranges and current local payload hashes. Source files and tests
were read as data, not executed. Generated engineering handoff prose is identified
as such; unresolved template expansions do not establish the generated behavior.

## Local changes and limits

The original decision-to-verification reference adds active-plan readback and
producer/consumer continuity to existing decision-authority and debugging rules.
It corrects recent/richer-plan selection with manual revision checks, and preserves
actual triggering actions through retest. Gate scripts and their guarantees do not
change; no exact-byte transport helper or automatic fingerprint tool is imported.

Prose is condensed and independently rewritten for Prime; examples are original
and fictional. No upstream code or substantial prose is copied. Prior attribution,
source identities and historical checks remain unchanged. No gstack installation,
runtime, hooks, service, memory system, automatic decisions/fixes/commits/reverts,
public/authenticated browser access, dependency or model trial is adopted.
Task Observer remains the sole durable learning authority. Ordinary deterministic
checks establish the stated content, routing and safety contracts, not improved
agent effectiveness or measured user outcomes. Assess usefulness on real authorized
work; no benchmark, speed multiplier or simulated timing claim is imported.
