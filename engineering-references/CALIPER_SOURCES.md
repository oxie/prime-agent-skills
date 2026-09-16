# Caliper: skill-routing source selection

Reviewed [edonadei/caliper](https://github.com/edonadei/caliper/tree/fe11ea7ea11d8fcf2b28d163df18d608fc0f591c)
at commit `fe11ea7ea11d8fcf2b28d163df18d608fc0f591c` (caliper-eval 0.12.0).
The optional [routing example](references/agent-evaluation.md#skill-routing-target-neighbour-and-silence)
is original prose under this owner's existing MIT terms. It adds target, neighbour
and silence cases and a fictional denominator example, not an evaluation runtime.

## Selected evidence

caliper-provenance.json records exact source identities and current local payloads.

| Pinned source | Contribution and limit |
|---|---|
| [Grill reference](https://github.com/edonadei/caliper/blob/fe11ea7ea11d8fcf2b28d163df18d608fc0f591c/skills/grill-skill/REFERENCE.md) | Neighbour and silence probes distinguish intended selection from over-triggering. Avoid naming a skill when spontaneous selection is the question, not for every task. |
| [Activation detector](https://github.com/edonadei/caliper/blob/fe11ea7ea11d8fcf2b28d163df18d608fc0f591c/caliper/activation.py) | Dedicated tool names and path-like tool inputs identify requested activation, but do not verify successful loading or use. The local example explicitly requires stronger observation. |
| [Result schema](https://github.com/edonadei/caliper/blob/fe11ea7ea11d8fcf2b28d163df18d608fc0f591c/caliper/schema/results.py) | Separate activation/output measures and non-target opportunity denominators inform the example. Missing coverage must not become confirmed silence. |
| [Activation scoring tests](https://github.com/edonadei/caliper/blob/fe11ea7ea11d8fcf2b28d163df18d608fc0f591c/tests/test_activation_scoring.py) | Source assertions distinguish recall, precision and unwanted activation. Tests were read, not run. |

The ten-case example is newly invented: two wanted loads and two unwanted loads in
eight non-target opportunities. Its arithmetic describes those fictional observations,
not model performance, a recommended trial count or evidence of improvement. Valid
alternative selections remain allowed when the actual contract permits them.

## Rights and exclusions

The [root license](https://github.com/edonadei/caliper/blob/fe11ea7ea11d8fcf2b28d163df18d608fc0f591c/LICENSE)
is MIT, Copyright (c) 2026 Emrick Donadei. No upstream code or substantial prose is copied.
This notice does not clear external agent CLIs, providers, dependencies, fetched skills
or private traces, and does not imply upstream endorsement.

No Caliper runner, skill pack, CLI dependency, generated verifier, permission bypass,
automatic evaluation, skill pruning, new ledger or global concept memory is installed.
The existing skill entrypoint and routing stay unchanged. Historical source records
retain their original revisions and evidence limits.

## Verification limits

No upstream programs, tests or model calls were executed. Local deterministic checks
cover wording, fictional arithmetic, exact historical reconstruction and packaging,
not model routing or effectiveness, runtime isolation, cost savings or live-daemon health.
