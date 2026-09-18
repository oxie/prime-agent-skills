# Source Fidelity and Clarity

Use for requested edits or reviews of existing documents, reports, README files,
technical explanations, and other non-marketing prose. Marketing drafts and edits
also use the fact check below. For code comments, read [Comment Review](comment-review.md)
first. This is an editing method, not an AI-authorship detector or a new-writing skill.

## Focused review

1. Read the requested text, nearby context, and any supplied voice sample. Identify
   the audience, purpose, and allowed scope from the request. General prose does not
   need product-marketing context, conversion sweeps, expert personas, or CTAs.
2. Preserve the meaning before improving the style. Protect facts, names, numbers,
   units, dates, comparisons, attribution, uncertainty, negation, and requirements
   such as MUST, MUST NOT, should, or may. Keep identifiers, commands, paths, code
   examples, links, exact quotations, and legal wording unchanged unless their edit
   is explicitly in scope. Do not remove a qualifier just because it sounds cautious.
3. Make the smallest useful clarity edit: remove actual filler, clarify a supported
   reference, split a crowded sentence, or move the main point forward. Keep needed
   context, limitations, exceptions, and technical terms. A word such as “robust”
   can be a precise technical term; word lists are suggestions, not replacement rules.
4. Keep the author's intentional register, humor, idioms, rhythm, and punctuation.
   A supplied voice sample guides style, not new facts. Passive voice is valid when
   the actor is unknown, irrelevant, or intentionally withheld. Do not invent an
   actor to make a sentence active. Repeat a clear term instead of cycling through
   synonyms that might imply a different entity or meaning.
5. Compare the edited text with its source using the check below. A report-only
   request returns findings and suggested edits without file changes. An authorized
   edit applies focused changes, without a new approval ritual. Ask only if a
   material ambiguity blocks a safe result; otherwise keep the uncertain text and
   flag the gap briefly. Report meaningful changes and remaining limits as needed.

## Source-to-edit check

- Can each edited factual claim be traced to the source or supplied evidence?
  Do not add a fact, name, number, date, quote, citation, feature, promise, deadline,
  security scope, guarantee, or purported research finding for extra specificity.
- Are numbers, units, denominators, comparison periods, uncertainty, negation,
  causality, conditions, and requirement strength unchanged? A clearer sentence must
  not turn correlation into causation, “may” into “will,” or “not all” into “none.”
- Did a deletion remove necessary substance, an exception, or attribution? Preserve
  meaningful broad statements when the source does not support greater precision.
- Is the source itself unverified or inconsistent? Do not silently correct facts by
  guessing. Flag the issue, retain the attribution/uncertainty, or propose an omission
  appropriate to the task. Source fidelity is not independent factual verification.
- Is any missing detail clearly marked as an editorial placeholder rather than
  publish-ready prose? Prefer a plain supported version when that meets the request.
  Do not insert plausible “example” figures into real copy without a visible label.
- Did the edit preserve voice and exact quotations? Punctuation, polished grammar,
  familiar phrasing, or a cluster of style patterns does not establish authorship.
  Do not fabricate lived experience, personal anecdotes, typos, or errors to appear human.

## Fact-preserving examples

These invented source snippets demonstrate editing, not verified product claims.
The edited column may use only the information in its source column.

| Source | Edited | Boundary |
|---|---|---|
| In order to continue, clients must not retry after HTTP 401. | To continue, clients must not retry after HTTP 401. | Keep the prohibition and status code. |
| It is important to note that the timeout may exceed 5 ms under load. | The timeout may exceed 5 ms under load. | Keep uncertainty, unit, and condition. |
| The checkout is fast. The process is quick. The flow is speedy. | The checkout is fast. | Remove repetition, not add a click count. |
| Here is an overview of our pricing. I hope this helps! | Here is our pricing. | Do not invent a tier, seat count, or support promise. |
| Data is encrypted. | Data is encrypted. | Do not add “in transit” or “at rest”; scope is unknown. |
| Users prefer simple pricing. | Users prefer simple pricing. | Flag missing support if reviewing claims; do not add “research showed.” |

Leave a sentence unchanged when an edit would reduce precision or merely impose taste.
Do not broaden an editing request into research, publication, a repository cleanup,
or a correctness/security audit. State what you actually checked, not a guarantee
of truth, performance, or unchanged behavior.

## Provenance

Selectively adapted from Miqdad Badjuber's [Anti-slop copy guidance](https://github.com/miqdadbadjuber/anti-slop/blob/55e0e160d18a9a963c6486d5c6be6d9e82418c5c/skills/antislop-copywriting/SKILL.md),
principally the no-new-facts rule, fabricated-specifics and gap-filling checks,
synonym consistency, and voice calibration. This adaptation rejects the upstream
punctuation bans, authorship claims, invented example details, and core delivery gate.
See [upstream provenance](../../../UPSTREAM.md) and the [MIT notice](../../../THIRD_PARTY.md).

## Optional example: a clean check of the wrong text

Use this example when an authorized edit already involves a checker or generated
rewrite. It adds no required tool or extra editing pass. The snippets are fictional,
not product claims.

Source: “Exports may take up to two minutes during maintenance.”

Suppose a style checker excludes quoted text and code. The export sentence is the
whole intended passage, but extraction leaves only an internal placeholder. A
“no matches” result describes that filtered view, not the reader-facing sentence.
Do not count extractor placeholders as prose or remove meaningful content to make
a score pass. Empty, partial, unsupported or failed checks are not clean coverage.
State which text was inspected and which relevant content was excluded, including
reader-facing labels or alternative text when they are in the requested scope.

Now suppose a rewrite returns “Exports take two minutes. I recommend this service.”
plus separate editorial notes saying “Kept the timing.” Even if the whole rewritten
body has no flagged words, it changed “may take up to” into a fixed duration, lost
“during maintenance” and invented a personal recommendation. Notes claiming fidelity
are not evidence of it. A supported clarity edit is “During maintenance, exports may
take up to two minutes.” It preserves the supplied claim; it does not verify that
the claim is true.

Inspect the exact final body intended for delivery, not an earlier draft, command
banner or change notes. Keep editorial notes separate without discarding necessary
qualifiers or visibly labeled unresolved details from the body. If output separation
is ambiguous, resolve it before calling the deliverable checked. After a later edit,
recheck the affected text rather than applying an older score to new content.
Compare that body with the source and supplied evidence using the check above.
A style score proves neither factual support nor authorship and grants no permission
to publish. No scanner, automatic model call, new ledger or publication gate is
introduced. See [source selection and limits](../../../SLOPMONSTER_SOURCES.md).

## Optional engineering update for a different audience

Use when the user asks to reframe supplied engineering material for a particular
recipient or channel. This is a non-marketing edit, not permission to research,
fetch tickets or send messages. Keep the engineering record as the evidence source;
a shorter update does not replace it. Infer the recipient's needs from the request,
not their job title. Ask only when missing context prevents a useful, safe draft;
otherwise state a material gap without making the user complete a questionnaire.

Select the supported state, consequence and next action that answer this reader's
question. If a decision or recommendation is requested, lead with that need and its
supported rationale; do not force a neutral status format. Separate observed impact
from possible exposure. Preserve distinctions such as investigated, locally tested,
in review, merged, deployed and recovery observed. None implies the next state.
Unknown impact, cause, owner, timing or validation remains unknown, not plausible filler.

Translate unnecessary implementation detail into causal language only within the
requested rewrite scope. Keep technical terms the reader needs. A release revision,
configuration name, identifier or second evidence link may be crucial to a decision;
do not strip it by category or impose a link quota. Preserve uncertainty and caveats
in the delivered body, not just editorial notes. Respect the source's audience and
confidentiality: an internal customer identifier is not automatically safe to share
with a wider audience. Do not fetch or disclose extra details to make the story vivid.

Choose presentation for the destination, without fixed word or bullet limits. A reply
can answer the immediate question directly; a new channel post may need brief context.
An email can put the decision or state in its subject and explain the consequence in
its body. Spoken notes can use short prompts instead of polished paragraphs. Keep
required conditions even when that makes the draft longer. A plain paragraph is fine
when no channel-specific structure helps. Run the existing source-to-edit check on
the actual final draft; this adds no separate scoring pass or publication workflow.

### Fictional source, two supported views

The complete supplied facts for this example are: BUG-42 concerns stale report titles
after rename. Engineering traced reuse of an old cached preview. At patch `r18`, the
local rename check passed. The patch includes report revision in the cache key. PR-42 is in review, not
merged or deployed. The running revision is `r17`. Customer exposure is unknown and
multi-worker behavior is untested. Mira owns PR-42. BUG-43 tracks the multi-worker
check and has no assigned owner. The release lead is asked to assign that check's
owner before deciding whether to schedule deployment. No ETA or workaround is supplied.
These are invented input facts, not observed product results.

**Reply to “Is the preview fix live?”**

> No. The running revision is r17. Patch r18 passed the local rename check, but
> PR-42 is still in review and is neither merged nor deployed. Customer exposure
> remains unknown; multi-worker behavior is untested.

**Email to the release lead**

> Subject: BUG-42 — assign BUG-43 before the deployment scheduling decision
>
> Please assign an owner for BUG-43, the multi-worker check, before deciding whether
> to schedule deployment. Mira's PR-42 addresses stale titles after rename by making
> cached previews depend on the report revision. Patch r18 passed the local rename
> check. PR-42 is in review, not merged or deployed; r17 is still running.
>
> Customer exposure remains unknown. Multi-worker behavior is untested, and BUG-43
> is unassigned. No ETA or workaround has been supplied.

Both views retain what matters to their question. The reply need not repeat every
owner detail; the email must not assign BUG-43 to Mira merely because she owns PR-42.
“Fixed for all customers,” a delivery date or a workaround would add unsupported facts.
If the input instead says the cause is unknown or the patch was not tested, keep that
limit in both views. If only a typo correction was requested, skip this reframing.
Neither draft authorizes sending it. Source consideration and original-writing
boundary: [UPSTREAM.md](../../../UPSTREAM.md#original-engineering-update-guidance).
