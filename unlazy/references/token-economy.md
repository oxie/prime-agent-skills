# Token economy

Spend model attention on implementation and judgment. Move repeated, deterministic verification into commands and keep orchestration context narrow.

## Keep enforcement cheap

- **Use runnable checks.** External command execution does not itself require model inference. The agent still spends context on the command, returned output, failure interpretation, and evidence review.
- **Cap evidence.** Store resolved environment facts plus the automatic output fingerprint, never raw successful output or a full build log.
- **Prime uses no Stop hook.** End turns nonblocking while owned work runs; resume from real replies and completed evidence. Do not add automatic continuations or a background monitor.
- **Use sequential checks by default.** Raise `--jobs` only for independent checks when wall-clock savings justify harder failure diagnosis.

## Keep contexts focused

- Give a leaf the shared contract and its own ledger, not the driver's transcript or unrelated leaf outputs.
- Keep `SKILL.md` limited to the core workflow. Load method, gate, orchestration, and parallel references only when the selected mode needs them.
- Append events to `status.log`. Do not repeatedly regenerate a large plan when one line records the event.
- Keep failure logs local and summarize only non-sensitive decisive facts when a manual report needs them; automatic success evidence already contains a digest and byte count.

## Mark leaf reasoning needs without inventing host controls

`Tier` is planner metadata for execution leaves, not a model name or a routing
guarantee:

- Use `judgment` when the leaf's own artifact needs design, security or
  compatibility reasoning, consequential manual review, or non-mechanical
  verification.
- Use `mechanical` only when the transformation pattern and acceptance gates are
  already fixed.

If the host exposes a documented model or reasoning control, the driver may map
these tiers through that host-specific control at launch. If no such control is
available, retain the tier as a briefing and review requirement and do not claim
that a particular model or reasoning level was selected.

Driver and branch duties are not leaf tiers. Contract and architecture work,
dispatch decisions, parent re-verification, branch integration, and the final
claim audit remain judgment responsibilities even when every execution leaf is
mechanical.

## Avoid false economy

Do not save time by skipping approval, negative controls, parent re-verification, or integration gates. Those checks exist because a fast false completion costs more than a direct failure.

Do not orchestrate a task that one focused session can implement and verify cleanly. Conversely, do not keep an entire build in one context merely to avoid subagent overhead when independent leaves and contracts are clear.

## Measurement claims

Earlier unlazy documentation gave exact token and effort ratios from a six-run exploratory comparison. The raw prompts, traces, outputs, and scoring records are not present in this repository, so those numbers are not reproducible here. Do not use them as product guarantees. A protocol for a future reproducible rerun is in [../research/validation-protocol.md](../research/validation-protocol.md).

## Compact views must preserve decisive evidence

Use this when a long tool result needs a smaller display, not as a reason to install
an output filter. A compact view is a derivative, not the authoritative result.
Use the current task's existing handle or authorized local artifact to recover needed
details instead of rerunning a command: another attempt can change state or evidence.
Keep the producing attempt and tested revision identifiable; a pathname or digest
alone does not establish that its contents answer the current question.

Preserve the producer's completed exit status, error state, relevant stream identity
and structured fields separately from display text. A display filter's zero exit is
not the producer's success. Unknown or incomplete execution stays unknown or incomplete.
A clipped view must say what was omitted and how to retrieve it within the authorized
scope. Absence of an error keyword in that view proves neither a clean run nor complete
search coverage. Inspect the decisive evidence before accepting the result.

Leave exact-data outputs intact when whitespace, repetition or byte identity matters,
even if they arrive through a shell or an MCP tool rather than a file reader. Tool
names do not establish safe compression. Preserve non-text blocks and required status
fields; leave unrecognized result schemas unchanged. If recovery is necessary, retain
the needed original before any lossy transformation and confirm it is accessible. If
that cannot be done safely, keep the original view or report the limit; do not discard
information and imply it can still be recovered.

Retain only needed, authorized evidence under existing privacy and retention rules.
This does not require saving raw successful logs, create another store, or override
the bounded automatic gate evidence above. Keep sensitive content out of summaries;
a recovery link grants no extra access. If evidence cannot be retained, keep the
verification limit explicit rather than invent a complete record.

Replace a repeated result with a reference only when the earlier result is actually
available in the current context or through an accessible authorized artifact. Same
session and matching bytes are insufficient after compaction, branch changes or
artifact expiry. If availability is unknown, show the needed content again. Do not
count a concurrent sibling's undelivered result as already seen.

Fictional review cases, not executed tool or model tests:
- A build exits 1; its summary filter exits 0 and hides a failing middle line. The
  build remains failed. Recover that attempt's diagnostic, not a new build's output.
- A complete, authorized result exits 0 and its relevant evidence is checked. A
  shorter display may preserve that supported success; compression alone cannot.
- A duplicate marker points to content removed by compaction and no artifact remains.
  It is not a usable replacement. Restore needed content or mark evidence unavailable.

These are manual evidence checks, not a compressor, hook or savings guarantee.
See [selection and source limits](../CHISLE_SOURCES.md).
