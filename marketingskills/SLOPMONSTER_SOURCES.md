# SlopMonster: selected final-copy fidelity example

Reviewed source: [ItsssssJack/SlopMonster](https://github.com/ItsssssJack/SlopMonster/tree/f261dbf11c2a206ecd8780c070a46dae64edd8be),
commit `f261dbf11c2a206ecd8780c070a46dae64edd8be`. MIT, Copyright (c) 2026 Jack Roberts.

## Selection and ownership

One original optional example in Copy Editing's
[source-fidelity reference](skills/copy-editing/references/source-fidelity-and-clarity.md#optional-example-a-clean-check-of-the-wrong-text)
separates the checker's extracted view from the actual final body and from factual
support. It uses fictional export copy, not third-party homepage wording. Existing
source-fidelity checks remain authoritative; the example is not a new editing pass.

No upstream code or substantial prose is copied. Jasper copy and repository
illustrations are not reused. No scanner, shell script, model chain, dependency,
new skill, authorship detector, style quota or publication gate is installed.
Copy Editing's entry point, source version and safety wrapper remain unchanged.

## Source mapping and limits

Full SHA-256, Git blob identities and byte counts are in slopmonster-provenance.json.

- [Scorer](https://github.com/ItsssssJack/SlopMonster/blob/f261dbf11c2a206ecd8780c070a46dae64edd8be/tools/deslop.py):
  Markdown stand-ins and raw selected-view slicing can leave non-prose residues
  that satisfy a nonempty-token check. A no-match result need not cover real copy.
- [Cleanse wrapper](https://github.com/ItsssssJack/SlopMonster/blob/f261dbf11c2a206ecd8780c070a46dae64edd8be/tools/cleanse.sh):
  body/notes splitting and raw-transcript fallback motivate checking the final
  artifact rather than assuming every stdout byte is the rewrite.
- [Prompt](https://github.com/ItsssssJack/SlopMonster/blob/f261dbf11c2a206ecd8780c070a46dae64edd8be/prompts/cleanse.txt):
  preserving meaning and facts competes with adding personal texture; only
  source-supported voice and claims belong in a fidelity-preserving edit.
- [Published example](https://github.com/ItsssssJack/SlopMonster/blob/f261dbf11c2a206ecd8780c070a46dae64edd8be/examples/jasper-live-run.md):
  a reported clean rewrite adds a first-person preference absent the original.
  Source inspection identifies that addition; it does not verify a live model run.
- [License](https://github.com/ItsssssJack/SlopMonster/blob/f261dbf11c2a206ecd8780c070a46dae64edd8be/LICENSE).

These are source-supported observations, not executed reproductions. No upstream
tests or model calls were run. Local checks cover documentation clauses, exact
historical reconstruction, payload identities, links and native discovery, not model
effectiveness or factual verification. No conversion, quality or detector-evasion
benefit is claimed. Empty/unsupported/partial/failed checking remains distinct from
valid coverage. A preserved source claim is not independently verified.

## Rights

The complete upstream MIT notice is retained below for attribution. It does not
license external reference material, third-party quotations or separately owned
media. Existing Corey Haines and Miqdad Badjuber notices remain unchanged; this
original addition does not replace their provenance or rebind historical pilots.

```text
MIT License

Copyright (c) 2026 Jack Roberts

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
