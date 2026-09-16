# Ouroboros: source findings and reuse limits

Reviewed [Q00/ouroboros](https://github.com/Q00/ouroboros/tree/79a423e80f93d4acc2aa0ee5b98340e86a766476)
at commit `79a423e80f93d4acc2aa0ee5b98340e86a766476`. The appended examples in
[domain modeling](references/domain-modeling.md#preserve-requirement-authority-through-a-relay)
and [test design](references/test-design.md#an-evidence-requirement-must-reach-the-approval-gate)
are original prose under this owner's existing MIT terms, not copied implementation
or translations of upstream prompts. They sharpen existing guidance with concrete
relay and parser/default examples, not a competing requirements or evaluation system.

## Selected source evidence

ouroboros-provenance.json records exact source identities and local payload hashes.
All links below target the reviewed revision, not a moving branch.

| Source | Observation informing the examples |
|---|---|
| [answer_provenance.py](https://github.com/Q00/ouroboros/blob/79a423e80f93d4acc2aa0ee5b98340e86a766476/src/ouroboros/bigbang/answer_provenance.py) | Separates decisions from adopted observations; its user category can include generated decisions and does not establish human consent. Observation answers are withheld from extraction while question context remains. |
| [seed_generator.py](https://github.com/Q00/ouroboros/blob/79a423e80f93d4acc2aa0ee5b98340e86a766476/src/ouroboros/bigbang/seed_generator.py) | Requirement extraction actually consumes that interview projection. This credits a useful defense without treating source labels as approval authority. |
| [semantic.py](https://github.com/Q00/ouroboros/blob/79a423e80f93d4acc2aa0ee5b98340e86a766476/src/ouroboros/evaluation/semantic.py) | Prompt requires evidence, but missing evidence and unanswered questions receive empty compatibility defaults; compliance uses truthiness. The schema does not require evidence. |
| [pipeline.py](https://github.com/Q00/ouroboros/blob/79a423e80f93d4acc2aa0ee5b98340e86a766476/src/ouroboros/evaluation/pipeline.py) | Approval uses score/compliance or consensus with a gaming veto, not a required-evidence gate. |
| [checklist.py](https://github.com/Q00/ouroboros/blob/79a423e80f93d4acc2aa0ee5b98340e86a766476/src/ouroboros/evaluation/checklist.py) | Checklist acceptance counts final approval separately from stored evidence. |
| [provenance tests](https://github.com/Q00/ouroboros/blob/79a423e80f93d4acc2aa0ee5b98340e86a766476/tests/unit/bigbang/test_answer_provenance.py) and [semantic tests](https://github.com/Q00/ouroboros/blob/79a423e80f93d4acc2aa0ee5b98340e86a766476/tests/unit/evaluation/test_semantic.py) | Pin observation handling and compatibility defaults respectively. Tests were read, not executed. |

These are conditional source findings, not a claim that every upstream decision is
unauthorized or every evaluation is wrong. Existing provenance exclusion, consistency
checks and gaming vetoes are real safeguards; they do not establish missing authority
or supply absent evidence. The retry/deadline and import/row-count scenarios are new
fictional examples. Their proposed regression cases have not been run against a model
or an upstream application.

## Rights and exclusions

The [root license](https://github.com/Q00/ouroboros/blob/79a423e80f93d4acc2aa0ee5b98340e86a766476/LICENSE)
is MIT, Copyright (c) 2025 Q00. No upstream code or substantial prose is copied.
That license does not clear dependency, provider, external companion or third-party
asset rights. This original guidance does not relicense Ouroboros or imply endorsement.

No upstream runtime, installer, interview/evolution loop, schema, event store,
telemetry, approval bypass, model judge or new skill is installed. No new ledger,
mandatory interview process, global concept memory or routing layer is added.
Historical sources and assertions retain their original revisions and limits.

## Verification limits

Source text and deterministic local documentation, history and packaging checks do
not prove interview quality, model compliance, cost savings, security or production
correctness. No upstream programs, tests or model calls were executed. Native loading
checks verify packaging only, not live-daemon health or measured improvement.
