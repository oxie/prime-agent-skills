# Provenance and adaptation

Source: https://github.com/Leonxlnx/unlazy
Pin: `16671491f6679ad9378f52604d3bc2415b4120c7`
Source target: `2.1.0` (not asserted to be a tagged release).
Prime package: `2.1.0-prime.1`. License: MIT, retained unchanged in LICENSE.

Changes: Prime-native workflow/docs/templates; bounded polish; explicit approval and
outside-root approval storage; native handles, atomic handoffs and completed-exit checks;
no duplicate observation system. README replaced with Prime guidance. Hook installer
replaced by unconditional refusal. Four run-tests and seven stress-tests installer-only
cases replaced by Prime refusal tests and an actual manual gate pilot; all other behavioral test bodies retained.
Nine other runtime modules remain byte-identical to the source pin.

The upstream installer had overbroad substring/marker ownership and no concurrent settings
update lock. It is not repaired or supported: the Prime entry point cannot execute it.
The scan-only hook is retained for fixture tests but is not configured or part of Prime
execution. No global settings or hooks are installed.

Research files are retained as historical motivation with their reproducibility caveats,
not independently validated research or evidence of Prime efficacy. Linux/Node validation
does not establish Windows or all Node-version compatibility. See AUDIT.md.

Local research-handoff addition: optional layered report/knowledge-transfer reference,
a narrow Unlazy routing link, and documentation-contract regression controls.
Inspired by the reviewed progressive-context methodology in
https://github.com/volcengine/OpenViking (reviewed commit
2eb36eabbd6b589bc14e89f462d852b887dc62bf); no upstream OpenViking code or text copied.
This is a manual convention, not a retrieval engine or measured savings claim.

## Prime work-slicing reference

Version 2.1.0-prime.2 adds an on-demand planning reference adapted from selected
Matt Pocock sources. Existing scripts, templates and acceptance mechanisms are
unchanged. See [MATTPOCOCK_SOURCES.md](MATTPOCOCK_SOURCES.md).

## Selective WeKnora evidence contracts

See [source notes](WEKNORA_SOURCES.md) and weknora-provenance.json for the reviewed
mechanisms, original local guidance and exact source identities. No WeKnora runtime,
connector, memory store, service or automatic ingestion is installed. Historical
source records keep their original revisions and verification limits.
