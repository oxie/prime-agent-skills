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
