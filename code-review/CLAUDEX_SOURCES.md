# Claudex Loop: selected reviewer-to-author example

Reviewed [chaseai-yt/claudex-loop](https://github.com/chaseai-yt/claudex-loop/tree/8cf5e2c1771c5151d90c12642391d0ba8fa71b0e)
at `8cf5e2c1771c5151d90c12642391d0ba8fa71b0e`; provider plugin manifests report 2.1.0.

## Selected mechanism and limits

One original optional example extends the existing
[feedback reference](references/receiving-feedback.md#optional-example-the-reviewer-becomes-an-author).
It distinguishes a reviewer's prior evidence from the new delta they author while
fixing a finding. It keeps independent review conditional on the actual task,
preserves applicable earlier coverage and makes mixed authorship or gaps explicit.
Neither a role label nor a provider change establishes actual review coverage.

The source's [Phase 3](https://github.com/chaseai-yt/claudex-loop/blob/8cf5e2c1771c5151d90c12642391d0ba8fa71b0e/skills/claudex-loop/SKILL.md),
[build inspection](https://github.com/chaseai-yt/claudex-loop/blob/8cf5e2c1771c5151d90c12642391d0ba8fa71b0e/skills/claudex-loop/references/build.md)
and [builder compatibility entry](https://github.com/chaseai-yt/claudex-loop/blob/8cf5e2c1771c5151d90c12642391d0ba8fa71b0e/skills/codex-build/SKILL.md)
explicitly revisit authorship and independent inspection after coordinator takeover.
The local example retains that distinction, not a requirement to use another provider.
Full source byte counts, SHA-256 and Git blob identities are in claudex-provenance.json.

No upstream code or substantial prose is copied. No provider runtime, router, new
skill, automatic call, mandatory review round, model ranking, ledger or global policy
is installed. The original fictional import-limit case is not a reproduced bug.
No upstream tests or model calls were run. Local checks establish documentation,
source identity, unchanged routing and exact historical-byte contracts, not model
effectiveness or proof of independent judgment. This addition does not implement
runner fixes or certify its permissions, approval binding or compatibility.

## Rights

Retain the full root MIT notice below, including its Matt Pocock attribution. Existing
Code Review LICENSE and Superpowers notice remain unchanged. The repository license
does not establish rights to linked third-party material, provider services or media;
none is imported. No legacy templates or external credited code are copied.

```text
MIT License

Copyright (c) 2026 Chase AI

Portions of this project (the "grill" Act 1 of grill-me-codex and grill-with-docs-codex,
and the CONTEXT-FORMAT.md / ADR-FORMAT.md files) are adapted from skills by Matt Pocock
(https://github.com/mattpocock/skills), Copyright (c) 2026 Matt Pocock, used under the MIT
License. See each skill's THIRD-PARTY-NOTICES.md.

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
```
