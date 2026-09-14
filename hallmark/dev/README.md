# Current Hallmark contract checks

Run from the skills repository:

```text
node --test hallmark/dev/contracts.test.mjs hallmark/dev/ux-review.test.mjs
```

The contract tests use the current `SKILL.md` and `UPSTREAM.md` release agreement,
semantic routing/scope checks, and an explicit inventory of 18 reviewed references.
They do not pin mutable description bytes. The original Apache license/NOTICE and
source pins remain exact integrity checks. Earlier failures recorded in source notices
and historical evidence are not rewritten as passes by these current tests.

Reading budgets are review gates, not performance or token-count claims: 10 KiB for
the entrypoint, 8 KiB per selective reference, the retained 6,500-byte UX ceiling,
and 10 KiB for reference synthesis (Refero plus the original Aura role clarification).
The 96 KiB total reference budget keeps growth visible rather than allowing every
reference to reach its individual ceiling. At this repair the entrypoint is 9,912
bytes and references total 91,993 bytes. These rounded ceilings provide small editing
headroom while preserving progressive reading; new topics need an inventory/budget
review, not an automatic bound increase.

Production payload checks permit Markdown, the root `LICENSE`, six named JSON
provenance/change records and seven named license texts. The development-only helper
lists them explicitly from the source notices; arbitrary JSON/TXT and runtime scripts
are not allowed. JSON records must parse as objects. Production files must be regular,
non-executable text; symlinks, shebang payloads and escaping paths fail. Four exact
source-to-target sibling links cover the documented ReUI handoff and Cinematic UI
recipe/fixture. They do not allow arbitrary sibling trees, scripts or external files.
HTTP(S) links are citations only and are not fetched. Mutation tests exercise missing
boundaries, oversized/missing references, unreviewed payloads and link/path escapes.
These are bounded packaging checks, not a general Markdown parser or malware scanner.

