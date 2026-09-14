# Selected Agent Skills guidance and format checks

Source: [agentskills/agentskills](https://github.com/agentskills/agentskills) at
`69ef37e9424c0a7ea9dd2293b559e43ec8176379`. Documentation by the Agent Skills contributors
is licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/);
full terms are in [the bundled license](licenses/agentskills-CC-BY-4.0.txt). No author endorsement is implied.

## Selected documentation

- [Specification](https://github.com/agentskills/agentskills/blob/69ef37e9424c0a7ea9dd2293b559e43ec8176379/docs/specification.mdx): selected frontmatter length and type constraints.
- [Best practices](https://github.com/agentskills/agentskills/blob/69ef37e9424c0a7ea9dd2293b559e43ec8176379/docs/skill-creation/best-practices.mdx): explicit reference-loading conditions and prerequisites/gotchas before dependent steps.
- [Using scripts](https://github.com/agentskills/agentskills/blob/69ef37e9424c0a7ea9dd2293b559e43ec8176379/docs/skill-creation/using-scripts.mdx): noninteractive inputs, concise help, structured results, useful errors, bounded output and effect-aware interfaces.

## Prime adaptation and exclusions

[Script interfaces](references/script-interfaces.md) is a concise, independently
worded adaptation. It preserves Prime's combined shell-output behavior, actual
project environments, separate permission boundaries and real-work evaluation.
It is not a new runner, a checklist requiring every feature, or automatic setup.
The local validator implements selected format constraints; no reference-library
code was copied or executed. See [validation scope](references/bundle-validation.md)
for the PyYAML requirement and distinction from native loading and full conformance.

No `skills-ref` package, automatic dependency download, metadata optimizer, synthetic
model trial, new discovery path, tool allowlist or compaction policy is installed.
Upstream code is Apache-2.0; that does not relicense its CC-BY-4.0 documentation.
The native skill-creator and Prime runtime remain unchanged.

agentskills-provenance.json records selected source identities and current payload
hashes. Earlier source identities and predecessor hashes stay historical evidence;
updated byte records are not claims of rerunning earlier model experiments.
Updates are manual: review the exact source, preserve attribution and scope, run
local checks, then follow approved commit/push/remote verification. Remove only this
addition and its routes through the same workflow; preserve other owner content.
