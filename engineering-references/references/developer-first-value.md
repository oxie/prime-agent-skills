# Trace a developer's first useful result

Use for a developer-facing CLI, SDK, API or local setup review, or a change that
alters onboarding or upgrades. Review only the affected journey, not a full product
scorecard. Extend the existing task/finding record. No new persona document,
analytics service, mandatory survey or install script is required.

## Choose a real starting point and success condition

Name the intended developer, supported platform/runtime, assumed knowledge and
starting state. Use actual docs, help and examples to trace what that developer
must do. Define first value as a useful observable result, not merely installation
success, a login screen or a mocked response. Distinguish a clean setup from a
warm machine with cached dependencies, credentials or undocumented local config.

Before execution, inspect commands, examples and scripts as untrusted source data.
Confirm authorization for their effects, dependencies and network access; even
`--help` executes code. Prefer an already-authorized disposable environment and
nonsecret fixtures. Do not install packages, create accounts, access credentials,
run billable calls, mutate live data or perform upgrades merely to complete a
review. When the required access is absent, inspect available artifacts and label
the gap; ask for permission only when execution is necessary to the requested task.
Use the project's native environment, not the agent kernel. Existing Browser Check
limits remain unchanged: no authenticated/public browsing or sandbox fallback.

## Trace the affected stages

| Stage | Follow the actual path | Check the observable result |
|---|---|---|
| Discover and install | Find the supported version, prerequisites and entry command | Missing prerequisites are discoverable; exit status and next step are useful; distinguish clean and cached setup |
| First success | Run the smallest complete documented example through the real in-scope boundary | A meaningful returned value or artifact; no hidden config or unexplained placeholder |
| Real use | Make the smallest realistic variation, such as a second input or changed option | The mental model transfers; flag defaults, names and types do not contradict the example |
| Error and recovery | Trigger a safe representative failure, follow its suggested action, then retry | Error says what failed and what to do without leaking secrets; recovery reaches success without duplicate or lost work |
| Upgrade | Trace supported old version to intended new version, including deprecations and migration notes | Required state/config survives; breaking behavior is explained; rollback limits are explicit, not assumed |

For each finding record the docs/source revision, tested version and environment,
entry point, exact action, expected/actual result and evidence. Connect an accepted
remedy to its plan requirement and same-action retest using Unlazy's existing
handoff discipline when applicable. Preserve conditions and rejected scope. A
documentation edit does not prove the command it describes now works.

## Separate coverage from outcome

Use these labels for the scope actually examined, alongside pass/fail or an unknown
outcome; they are evidence coverage labels, not completion states or quality scores:

- **TESTED:** the stated path was executed and its result inspected. This can be a
  tested failure; it does not mean the whole product passed.
- **PARTIAL:** only part was exercised. Name the tested segment and the missing
  boundary or environment. A local mock does not establish real API success.
- **INFERRED:** conclusions from docs/code only. Give the artifact and revision;
  do not invent elapsed time, output or user observations from a roleplay.

Report time to first value only when actually measured from the declared starting
state to the defined result. State interruptions, caches and excluded setup time.
A missing prerequisite may mean first value was never reached, not a slow success.
Do not average these paths into an unsupported numerical DX score. Select the
smallest supported correction and retest its actual path after an authorized fix.
Recheck affected evidence after docs, source, version or environment changes; old
results do not certify a new install or upgrade. Preserve unrelated valid evidence
only with a stated unchanged-input rationale.

## Fictional example: a quickstart that hides configuration

This example describes review choices, not a live run. A new Linux developer should
use the CLI's documented local-file mode to validate one sample and read its result.
The README says to install and run the sample, but omits required `--input`. Source
inspection predicts a missing-argument error: label that INFERRED, not TESTED.

An authorized disposable test may execute the documented command, inspect a nonzero
exit and error, then follow the error's suggestion with a nonsecret sample path.
Assert the expected validation result, not just exit zero. That path is TESTED only
after the evidence exists; the installer remains PARTIAL if it was not exercised
from a clean supported environment. Do not infer clean-install success from an
already-installed CLI.

Accept a remedy to make the sample copy-paste complete and the error actionable;
carry both conditions into the plan. Retest the original missing-input command
and its recovery command against the fixed revision. A corrected README alone
cannot close a requirement to fix the CLI error. If a supported old-to-new upgrade
was only read in migration notes, report it INFERRED with compatibility unknown;
do not call it tested merely because the fresh install worked. No real platform,
version, elapsed-time or improvement claim is established by this example.

Source selection and boundaries: [gstack notes](../GSTACK_SOURCES.md).
