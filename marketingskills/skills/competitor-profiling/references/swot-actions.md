# Optional SWOT cross-actions

Use only when an authorized profile or comparison needs strategic actions. This
is a synthesis aid, not another research phase. Keep the existing raw-data capture,
source links and profile flow unchanged. Drafting actions does not authorize new
research, outreach, publishing, spending, product changes or account access.

## Fix the point of view first

Name the **focal company**, competitor(s), decision, segment and evidence date.
If profiling a rival's strategy, that rival can be the focal company; do not silently
switch back to “us.” The existing Competitive SWOT template deliberately has
“theirs” strengths/weaknesses and “for us” opportunities. **Do not feed those mixed
perspectives straight into this matrix.** Reclassify the relevant evidence for one
focal company first. A rival's strength may inform an external threat to us; it is
not our internal strength. Lack of a feature on a web page is not proof of absence.

For each material factor, record an ID, S/W/O/T, whose fact it is, exact source
locator/date, observation, interpretation and uncertainty. S/W concern the focal
company's internal capabilities or constraints. O/T concern external conditions
relative to its decision. Buyer needs and rival announcements are external; their
strategic meaning is an inference. Preserve announcement versus verified delivery,
small samples, stale sources and conflicting evidence. Missing evidence stays
unknown. Do not invent capabilities, demand, market shares or performance metrics.

## Select useful pairs, not a quota

| Pair | Question for this focal company |
|---|---|
| SO | Can a supported strength help address this external opportunity? |
| ST | Can a supported strength reduce exposure to this external threat? |
| WO | Is addressing this weakness a proportionate way to pursue this opportunity? |
| WT | Can we limit exposure where this weakness meets this threat? |

Choose only pairs with a credible causal link. There is no requirement to fill
four quadrants, form every combination, or produce a fixed number of strategies.
No supported pair is a valid result: state what is missing rather than manufacture
an action. Prioritize by decision relevance, evidence and reversible effort; do not
turn ordinal opinions into a measured ROI score.

For each selected pair write: **factor IDs → reason → bounded proposed action →
owner (confirmed or proposed) → observable measure → review point → decision rule
→ uncertainty → permission needed**. Separate a proposed success criterion from
an observed result. If the baseline or numeric target is unknown, say so; a local
pass/fail check can be sufficient. Recommend a next step, not a guaranteed outcome.
Return the draft to the existing profile/summary. A new research or execution need
is a scoped handoff, not permission to invoke services or contact anyone.

## Complete fictional example

Everything below, including company names, source locators, observations and dates,
is invented training data, not business evidence. Decision scope: audit-export
positioning for the supplied pilot-buyer checklist. The source ledger is the input;
factors and two selected actions are the output. No action has been run and no
business result has been measured. Proposed owners are not assignments to real staff.

The ledger's `observation` and factor's `fact` are intentionally literal matches so
a small offline test can check provenance consistency. In real work, check any
paraphrase or inference against the actual saved evidence yourself; string equality
is not a general method for deciding business truth.

<!-- swot-example:start -->
```json
{
  "fictional": true,
  "focalCompany": "LumenLedger",
  "competitor": "RidgeAudit",
  "decision": "Choose an offline preparation step for audit-export positioning.",
  "asOf": "2026-09-01",
  "sources": [
    {
      "id": "E1",
      "subject": "LumenLedger",
      "locator": "fictional/product-check.md#export",
      "asOf": "2026-09-01",
      "observation": "The tested build exports event timestamps and actor IDs in CSV."
    },
    {
      "id": "E2",
      "subject": "LumenLedger",
      "locator": "fictional/product-check.md#signature",
      "asOf": "2026-09-01",
      "observation": "The tested build does not sign exported files."
    },
    {
      "id": "E3",
      "subject": "Pilot buyer brief",
      "locator": "fictional/buyer-brief.md#requirements",
      "asOf": "2026-08-28",
      "observation": "The supplied buyer checklist requests event timestamps and actor IDs in a portable file."
    },
    {
      "id": "E4",
      "subject": "RidgeAudit",
      "locator": "fictional/ridge-announcement.md#export",
      "asOf": "2026-08-30",
      "observation": "RidgeAudit announced a signed-export pilot; availability is unverified."
    }
  ],
  "factors": [
    {
      "id": "S1",
      "kind": "S",
      "subject": "LumenLedger",
      "source": "E1",
      "fact": "The tested build exports event timestamps and actor IDs in CSV.",
      "interpretation": "This capability may help answer the supplied checklist."
    },
    {
      "id": "W1",
      "kind": "W",
      "subject": "LumenLedger",
      "source": "E2",
      "fact": "The tested build does not sign exported files.",
      "interpretation": "Cannot claim signed-export support."
    },
    {
      "id": "O1",
      "kind": "O",
      "subject": "Pilot buyer brief",
      "source": "E3",
      "fact": "The supplied buyer checklist requests event timestamps and actor IDs in a portable file.",
      "interpretation": "A possible fit for this buyer, not evidence of market-wide demand."
    },
    {
      "id": "T1",
      "kind": "T",
      "subject": "RidgeAudit",
      "source": "E4",
      "fact": "RidgeAudit announced a signed-export pilot; availability is unverified.",
      "interpretation": "A possible comparison risk if signed exports matter; no proven competitive loss."
    }
  ],
  "actions": [
    {
      "id": "A1",
      "pair": "SO",
      "factors": [
        "S1",
        "O1"
      ],
      "owner": "Product specialist (proposed)",
      "proposal": "Prepare an offline proof pack using synthetic events and the supplied buyer checklist.",
      "rationale": "Use the verified export fields to test this specific external requirement.",
      "measure": "Record pass/fail for timestamp and actor-ID preservation when the synthetic CSV is opened.",
      "reviewPoint": "At proof-pack review, before any buyer-facing use.",
      "decisionRule": "Continue drafting only if both fields survive; otherwise record the mismatch and revise the claim.",
      "uncertainty": "Portable-file format acceptance and purchase intent remain unknown.",
      "permission": "Draft and local synthetic review only; no buyer contact or publishing."
    },
    {
      "id": "A2",
      "pair": "WT",
      "factors": [
        "W1",
        "T1"
      ],
      "owner": "Product marketing lead (proposed)",
      "proposal": "Draft an internal claim checklist that separates current unsigned export from the rival announcement.",
      "rationale": "Limit overclaiming while our signing gap could matter in a competitor comparison.",
      "measure": "Record whether each draft signed-export statement is marked unsupported for LumenLedger and announced-only for RidgeAudit.",
      "reviewPoint": "At internal claim review, before collateral approval.",
      "decisionRule": "Hold buyer-facing wording if it implies our signed-export support or verified RidgeAudit availability.",
      "uncertainty": "The buyer may not need signatures; rival availability is unknown.",
      "permission": "Draft only; no product commitment, account action or publication."
    }
  ],
  "selection": "A1 first to test known checklist fit; A2 is a small claim safeguard. ST adds no distinct action here. WO would need feasibility evidence before proposing a signing investment. No action count is required."
}
```
<!-- swot-example:end -->

A1 is an SO action, not evidence that LumenLedger wins the deal. A2 is a WT
safeguard, not proof of demand for signatures. Selecting these two does not require
inventing ST/WO actions. With only rival data and no supported focal-company S/W,
return “no supported cross-action yet”; preserve the existing profile facts.

### Negative controls and test limits

- Replace S1's subject with RidgeAudit: reject the focal-company mixup, even if
  RidgeAudit really has that capability.
- Claim LumenLedger signs exports under E1: reject the unsupported fact, even if
  the citation ID exists. E2 explicitly records the opposite for this build.
- Relabel A1 as ST while keeping O1: reject the pair/type mismatch.
- Remove an action's measure or uncertainty: return it for completion, not approval.

Run `node --test tests/super-swot-actions.test.mjs` from the skills repository root.
These **offline contract tests** parse this actual document fixture and mutate it
for negative controls. They check source/factor identity, literal fact consistency,
pair composition and action fields. They do not judge causal merit, real source
truth, strategy quality, permissions in a live system, or agent compliance.

## Method grounding

- [Business Queensland: SWOT analysis](https://www.business.qld.gov.au/running-business/planning/swot-analysis)
  grounds the internal/external distinction and warns that SWOT does not itself
  prioritize issues or provide solutions. Consulted as an unversioned public page;
  the integration evidence manifest records the saved bytes and SHA-256. Its
  broader planning/research suggestions are not adopted as task permissions.
- Selective inspiration: [BigY0shi/super-skills, founders catalogue, lines 92–98](https://github.com/BigY0shi/super-skills/blob/86e4cec2d51927a8ecff4370f892136fc6317523/skills/founders-suite/references/skills-catalog.md#L92-L98).
  Only the evidence-to-pair-to-action idea is retained, not its quadrant quotas.
  SWOT and SO/ST/WO/WT matching are general strategy methods, not claimed as
  Yoshi's invention. This worksheet and fictional example are original expressions.
