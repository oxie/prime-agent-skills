# Draft and coverage guide

Use this worked example as a shape, not as facts to copy into another request.
All organizations, roles, numbers, and documents below are illustrative supplied
context. No deadline or effort estimate has been supplied, so neither is invented.

## Example brief from the user

“I am the launch lead. Draft questions for our service owner. We must decide
whether one instance has enough request capacity for launch. The supplied load
test says one instance sustains 400 requests/second for payload P. Launch uses
payload P in region A. We still need the peak request forecast and our required
capacity reserve. Please do not send it.”

## Recipient-ready draft

# Launch capacity inputs

**Purpose:** Help the launch lead decide whether one instance has enough request
capacity for launch.
**From:** Launch lead. **To:** Service owner.
**Use of answers:** Compare expected demand and the required reserve with measured
capacity. This is input to a decision, not a request to approve the launch.

### Context

The supplied load test measured 400 requests/second per instance for payload P.
Launch uses the same payload in region A. We need demand and reserve inputs for
this request-capacity comparison; this is not a full readiness review.

### How to answer

Partial answers and “I don't know” are useful. Mark estimates or uncertainty and
point us to the relevant owner if an input is outside your knowledge. A range is
fine when a single figure would imply false precision.

### Q1. What peak request rate should we plan for at launch?

_Why this matters: this is the demand input to the capacity comparison._

> Answer (requests/second; estimate or range is welcome):

### Q2. What evidence supports that peak forecast?

> Answer (source, observation, or “not yet available”):

### Q3. What capacity reserve rule must this launch meet?

_Why this matters: “20% reserve” can mean different things. State the rule in
terms we can apply, such as a maximum allowed utilization._

> Answer (rule and any uncertainty, or the owner who can confirm it):

### Q4. Anything else we should know about this capacity comparison?

> Answer (optional):

## Coverage note for the user, separate from recipient copy

| Needed input/outcome | Already supplied | Remaining gap | Coverage |
| --- | --- | --- | --- |
| Compare launch demand with one-instance capacity | 400 requests/second, payload P, region A | Peak forecast and its basis | Q1, Q2 |
| Apply required reserve before deciding | No reserve rule supplied | Applicable reserve rule | Q3 |

Q4 is a catch-all, not a substitute for Q1–Q3. The draft covers the stated request
capacity decision. It does not establish redundancy, failover, or overall launch
readiness, which were not requested.

## Adaptation checklist

- Replace the purpose, recipient, and known context with the supplied brief.
- Map each required decision to the specific missing inputs needed to decide it.
  If the input is already established, cite it instead of asking again.
- Draft one question per unknown idea; split a forecast from its evidence when
  both are needed. Delete questions that do not serve a required outcome.
- Add answer stubs with useful units or answer type, not prefilled invented answers.
- Keep uncertainty language. Do not add a deadline or estimated effort unless
  supplied or confirmed. Leave unknown identities out if they are not essential.
- Deliver in chat unless file output was requested. Never treat drafting as sending.
