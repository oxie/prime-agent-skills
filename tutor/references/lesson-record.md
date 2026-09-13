# Small lesson and optional learner record

Use the structure below in chat. Save only when requested. Replace the illustrative
content with the learner's topic and actual evidence; do not copy example results
into a real learner's record.

## Worked mini-lesson: an expiry boundary

This is an invented training system, not a claim about any real cache product.

**Goal:** Decide whether this training cache may serve an item.
**Starting point:** The learner says they know numeric comparisons (self-reported).
**Source:** Supplied training rule card, section “Expiry”:
“An item may be served only when the current time is strictly less than its
expiry time. At or after expiry, return a cache miss.”
**Scope:** Times are integer ticks on one clock; clock skew is out of scope.

**Explanation:** Compare current time with expiry. Strictly less excludes equality.
At time 8, an item with expiry 12 may be served because 8 < 12.

**Practice prompt:** Current time is 12 and expiry is 12. Should the cache serve
the item? Explain the comparison. Success means a correct decision and reason.

Stop here for the learner's attempt. The following is an illustrative feedback
branch, not evidence that a real learner answered.

**Example attempt:** “Serve it; it expires after tick 12.”
**Feedback:** You compared the right values, but the rule excludes equality.
12 < 12 is false, so this is a cache miss. “At expiry” is already too late.
**Transfer check:** Current time is 20 and expiry is 21. What should happen, and why?
If the learner correctly explains 20 < 21 without a hint, that is evidence for
this comparison task. It does not establish expertise with real cache systems.

## Optional portable record

A short Markdown record is enough. Select paths with the learner rather than
creating a fixed directory tree. Use these fields only for real supplied or
observed evidence:

- **Goal:** the agreed outcome, with any confirmed change.
- **Status:** active, or superseded by a specific replacement record.
- **Covered:** what was explained, without a learning claim.
- **Self-reported:** who claimed what prior knowledge and at what depth.
- **Demonstrated:** task identifier/input, a short response quote or faithful
  summary, result, and whether a hint or solution was supplied. Use “not yet
  demonstrated” if there was no independent attempt.
- **Source:** title/path or URL plus relevant section and known version; distinguish
  inspected material from suggested further reading.
- **Next step / uncertainty:** one evidence-led practice target or unresolved issue.

### Illustrative correction pair

**Record A — active, before correction**
Goal: apply the training expiry rule. Covered: expiry comparisons.
Self-reported: learner knows comparisons. Demonstrated: not yet demonstrated;
learner answered “serve” at time 12 / expiry 12. Feedback explained equality.
Next step: retry a boundary case without showing the answer.
Source: training rule card, “Expiry,” quoted above.

**Record B — replacement after an actual later attempt, if one occurs**
Goal: unchanged. Status: active; replaces Record A's current assessment.
Demonstrated: learner answered “miss, because 30 < 30 is false” for time 30 /
expiry 30, without a hint. Evidence supports this boundary task only.
Covered: no new topic. Self-reported knowledge remains unverified beyond the task.
Next step: check retrieval in a later learner-requested session.
Source: the same training rule card.

Mark Record A “superseded by Record B” and preserve the earlier evidence. If no
later attempt occurs, do not write Record B as fact. If the tutor misread an
answer or taught an incorrect rule, identify that error and correct the record;
do not attribute the tutor's mistake to the learner.
