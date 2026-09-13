---
name: questionnaire
description: >
  Draft focused questions for a knowledge holder to answer asynchronously or in
  a meeting. Use when the user needs a questionnaire for a colleague, expert,
  client, or other recipient to resolve specific facts or decisions. Not an
  automatic customer-research program, survey campaign, interview of the user
  about facts only the recipient knows, or permission to send anything.
license: MIT; see LICENSE and UPSTREAM.md
metadata:
  version: 1.0.0-prime.1
---

# Questionnaire

Turn a defined knowledge gap into a draft the recipient can answer. Aim questions
at what that person knows and the user needs, not everything about the subject.

## 1. Establish the recipient and outcome

Use supplied context first:

- Who will answer, their relevant expertise, and their relationship to the user.
- Which decisions or missing facts the user needs back, and how answers will be used.
- Known context, audience constraints, and any supplied deadline or effort limit.

Do not repeat questions already answered. Inspect relevant supplied documents and
already-authorized project sources for known facts before requesting them again.
Do not expand into unrelated research. Attribute uncertain or conflicting facts
rather than treating them as settled.

Ask the user only about material gaps that change the draft: for example, whether
the recipient is a technical owner or a nontechnical buyer, or what decision the
answers must support. Group independent clarifications in one short exchange.
Do not ask the user to supply the very specialist facts the recipient must answer.
If a missing name or other minor detail is unnecessary, omit it instead of blocking.

## 2. Map the knowledge gap

Make a short working map: **needed decision/fact → known evidence → remaining
unknown → question ID**. Use it to find omissions, not to create another file.

- Each required outcome needs direct question coverage for its remaining unknowns.
  A known part can cite supplied evidence; do not ask it again unless confirmation
  or conflict resolution is necessary for the decision.
- Ask for facts and constraints the recipient can reasonably know. Do not shift
  a decision onto someone without authority to make it; ask for their input instead.
- Put blocking and high-value questions first. If an answer determines whether a
  later question applies, state a simple branch such as “If yes, answer Q3.”
- Remove duplicate, irrelevant, leading, or compound questions. A catch-all does
  not count as coverage for a required outcome.

## 3. Draft for one useful response

Use [the worked draft and coverage guide](references/draft-guide.md). Include:

1. A title and purpose naming the decision the questionnaire supports.
2. Recipient/sender details only when known and relevant, and the intended use
   of answers. Do not invent identities, commitments, or approval authority.
3. A short context paragraph containing the facts the recipient needs to answer.
4. Instructions welcoming partial answers, “I don't know,” and uncertainty.
   Include a deadline or effort estimate only if supplied or confirmed; otherwise
   omit them. Never invent a completion time to make the draft look finished.
5. Numbered, single-idea questions ordered by importance. Group by theme when
   useful. Give every question an answer stub directly below it. Add one sentence
   of rationale only when it prevents a likely misunderstanding.
6. A closing “Anything else we should know?” with an answer stub.

Keep the vocabulary and tone appropriate to the recipient. State assumptions
as assumptions. Allow an estimate, range, caveat, or pointer to another owner;
do not force false precision. Request supporting evidence when it affects the
quality of the decision, not as a burden attached to every simple answer.

## 4. Check and deliver the draft

- Trace every required decision/fact through the map. Check that questions obtain
  enough input to resolve it, not merely mention the same topic. Repair gaps.
- Verify each question asks one idea, has useful context and an answer stub, and
  permits uncertainty. Known answers are not needlessly requested again.
- Return the draft plus a brief coverage note for the user. Keep internal mapping
  out of recipient copy unless it helps them answer. Label any unresolved gap.
- Default to chat/Markdown. Write a file only when requested within an authorized
  output scope; never assume cwd or home is the destination. Preserve user edits.
- Draft-only: do not email, message, publish, enroll respondents, or start a survey
  or follow-up campaign. Sending requires separate authorization and tool checks.

Completion means a usable, coverage-checked draft, not a sent message or an
answered questionnaire. Do not claim the recipient supplied answers or approved
anything until that evidence is provided.

Source and adaptations: [UPSTREAM.md](UPSTREAM.md).
