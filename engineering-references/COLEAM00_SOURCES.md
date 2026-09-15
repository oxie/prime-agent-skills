# Coleam00: selected evaluation and approval lessons

Source: https://github.com/coleam00/skills at
`73ec6524088ab8a9ddf953ff7baa495415c76cd1`, reviewed 2026-09-15. Plugin metadata version 1.0.0.

Three original, corrected additions remain under existing references:

- [Agent evaluation](references/agent-evaluation.md#comparing-instructions-without-confusing-the-intervention-with-the-outcome):
  applicability, neighboring examples and separating treatment from task output.
- [Test design](references/test-design.md#validate-the-detector-including-its-evidence-path):
  clean controls, the intended negative failure, and evaluator-channel integrity.
- [API authorization](references/api-authorization.md#a-hold-must-survive-the-next-entrypoint):
  a durable revision-bound hold across retries and alternate effect paths.

## Evidence and corrections

Paths below are relative to the pinned repository, not local executable commands.
[coleam00-provenance.json](coleam00-provenance.json) records source Git blobs,
SHA256/length and current local additions. Earlier provenance remains historical.

- `.claude/skills/ablate-ai-layer/references/comparison.md:19-41,61-79` motivates
  per-rule applicability and the neighboring-code confound. The runner's
  `scripts/run_ablation.py:135-177` measures intervention deletions against the
  original HEAD; the local prose requires a separate treatment baseline and masked
  grading. Equal outcomes on a few tasks are not proof a rule is redundant.
- `.claude/skills/build-dark-factory/templates/harness/mutations/run.py:45-59,99-118`
  treats any inner failure as detection without an identical clean-copy control.
  In contrast, `scripts/_test_runner.py:1523-1531` requires the intended named test
  and labels unrelated failures `WRONG-TEST`. The local refund example is fictional.
- Under that factory subtree, `templates/harness/holdout/run.py:41-47` imports a
  driver/config not protected by `templates/runner/factory/guard.py:29-49`;
  `run-workflow.sh:637-667` executes candidate validation and does not preserve its
  exit status as a required gate input. The local reference protects the whole
  observation path, not just hidden assertions or fresh context.
- `templates/runner/factory/gate.sh:167-215,248-261` uses a local hold but persists
  ordinary passed state; `state.py:278-281`, `orchestrator.sh:383-417` and
  `merge.sh:35-84,146-169` expose alternate merge paths and mutable-head evidence.
  The original document-export example generalizes the state/authorization risk;
  it is not an executed upstream reproduction or a new merge workflow.

Only pinned source and caller/test contracts were reviewed. Upstream scripts/tests,
model experiments, desktop actions and providers were not run. Local wording,
link, integrity and mutation checks do not prove model effectiveness, actual
isolation or production authorization. Assess usefulness during relevant authorized
work through the existing Task Observer/refine path, not a scheduled evaluation.

## Exclusions and maintenance

No factory/PIV bundle, installer, scheduler, hook, desktop/browser controller,
ablation runner, automatic pruning, new skill or memory store is included. Existing
routing, budgets, approval rules and real-boundary tests remain authoritative.
Changes are manual, bounded and follow the normal approved validation/Git workflow.
Root MIT does not grant rights to separately installed dependencies, third-party
assets or trademarks; none is imported here.

## MIT notice

The prose and fictional examples above are independently authored. Retain this
reviewed source notice for the selected mechanisms; it does not relicense other
existing reference material.

MIT License

Copyright (c) 2026 Cole Medin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
