# Script interfaces and reference loading

Use while authoring or changing an authorized skill that runs scripts or loads
supporting files. This is a design checklist, not a new runner, permission grant,
mandatory rewrite of working scripts, or reason to launch model evaluations.
Prefer the target project's existing commands and environment before adding code.

## Put prerequisites before the risky step

Keep the main instructions focused on decisions needed for the task. For each
optional reference, state a recognizable condition for loading it: for example,
“read the response-schema reference before changing the parser,” not “see references
for more.” Put a surprising environment requirement or safety gotcha before the
step that depends on it. Do not hide a prerequisite behind a symptom the agent
cannot know to look for. Never cut required safeguards merely to meet a line quota.

State a default compatible with the real project, plus the condition that requires
an alternative. Do not list several equal tools or install a new one by default.
Resolve script paths against the skill directory, but use the target project's
required working directory and environment; an absolute script path does not set
its working directory. References do not authorize an unrelated directory change.

## Make the script's contract easy to use

- **Inputs:** accept explicit flags, files or documented stdin rather than TTY
  prompts. Missing or ambiguous input should fail with an actionable error, not
  guess or wait indefinitely. Never put credentials in flags, logs or generated
  skill files; use the project's approved secure input channel.
- **Help:** keep `--help` concise. Describe required inputs, defaults, examples,
  expected outputs, prerequisites, side effects and meaningful exit codes.
- **Results:** prefer a stable JSON/CSV/TSV schema for machine data. Send diagnostics
  to stderr and results to stdout when the caller separates streams. Prime's shell
  handle combines stdout and stderr, so do not parse that combined transcript as
  clean JSON. Use a declared output file or an existing interface that actually
  keeps the streams separate. Report an output artifact only after successful
  completion; do not mistake a stale or partial file for the current result.
- **Bounds:** use a useful default output limit with documented continuation, or
  write large output to an explicit artifact path and return a short summary.
  Include truncation/completeness state. Bound relevant waits and external requests;
  report timeouts as failed or unknown outcomes, not success.
- **Failures:** say what input or condition failed, what was expected, and a safe
  next diagnostic step. Do not print secrets, full sensitive payloads or misleading
  repair commands. Document nonzero exits; the caller must inspect completed exits.
- **Effects:** use safe defaults and reject invalid inputs before writes. For an
  operation with significant effects, support a preview where useful and validate
  it against the current source of truth. A dry run or `--confirm` flag is not user
  authorization and does not remove races between preview and execution.
- **Retries:** state which operations can be repeated and how unknown outcomes are
  reconciled. “Create if absent” alone is not duplicate-write safety under concurrency.
  Preserve the project's transaction, idempotency and resource-ownership contracts.
- **Dependencies:** document the native environment and reviewed dependency versions.
  Do not add automatic downloads or install hooks from a documentation example.
  For a Prime Python-backed skill, the built-in skill-creator's package/callable
  contract remains authoritative; do not install external project code into the kernel.

For batch operations, prefer an explicit plan of intended effects, validation against
actual input/schema and permission, then execution through the existing project tool.
Keep this proportional: a read-only formatter does not need a deployment framework.

## Verify the actual interface

For a changed script, use the project's deterministic tests with disposable inputs.
Check a successful result, invalid input, relevant failure exits, artifact freshness
and protected state when an operation must not write. Exercise only the applicable
contracts; do not contact live providers or create a new environment merely for this
checklist. Mechanical checks do not establish agent instruction effectiveness.
Assess instruction usefulness during the next relevant real task through the existing
[maintenance workflow](prime-skill-maintenance.md#improve-instructions-from-real-work).

Source and modifications: [Agent Skills source notes](../AGENTSKILLS_SOURCES.md).
