# Anti-slop: selected collection-semantics example

Source: [dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop/tree/c44ef22ca116d0ba62a3ff663a0bd13a3f3fa40b),
commit `c44ef22ca116d0ba62a3ff663a0bd13a3f3fa40b`, package metadata 0.1.2.
The source is explicitly opinionated team guidance, not a universal standard.

## Selection and limits

One original optional example in [Ponytail](SKILL.md#collection-refactors-fewer-passes-are-not-equivalent-behavior)
develops the README's cautions around array/iterator rewrites and reducer copies.
No upstream implementation or substantial prose is copied. Source rules were read
to check their scope, not installed or imported. No lint pack, installer, Effect
policy or dependency is adopted. There is no new skill, global activation or
mandatory second coding pass. Existing Ponytail and Addy notices remain intact.

The source review inspected code and test assertions without executing upstream
programs. Original local Node fixtures exercise specific collection behaviors;
they are not upstream RuleTester results. These tests and metadata checks are
not a benchmark or model-effectiveness result, and do not establish browser/runtime
compatibility outside the tested local environment. No model trial was run.

Selected source files (immutable URLs and full identities in anti-slop-provenance.json):

- [README.md](https://github.com/dmmulroy/anti-slop/blob/c44ef22ca116d0ba62a3ff663a0bd13a3f3fa40b/README.md):
  no-array-filter-map and no-reduce-accumulator-copy explanations and explicit caveats.
- [Array pipeline rule](https://github.com/dmmulroy/anti-slop/blob/c44ef22ca116d0ba62a3ff663a0bd13a3f3fa40b/src/rules/no-array-filter-map.ts):
  syntactic rule scope, not proof of safe rewrites or better performance.
- [Reducer-copy rule](https://github.com/dmmulroy/anti-slop/blob/c44ef22ca116d0ba62a3ff663a0bd13a3f3fa40b/src/rules/no-reduce-accumulator-copy.ts):
  local evidence and limits; does not prove ownership or authorize mutation.
- [LICENSE](https://github.com/dmmulroy/anti-slop/blob/c44ef22ca116d0ba62a3ff663a0bd13a3f3fa40b/LICENSE).

Primary semantic references, retrieved 2026-09-16; response hashes are in the same
provenance file. They support the factual distinctions, not copied prose or code:

- [MDN Array.filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter):
  holes are skipped; callback receives element, index and array; optional thisArg.
- [MDN Array.values](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/values):
  holes yield undefined; values are read during iteration rather than snapshotted.
- [MDN Iterator.filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/filter):
  lazy consumption and callback arguments; deployed support still needs checking.

## Rights

Upstream MIT, Copyright (c) 2026 Dillon Mulroy. The complete notice follows for
attribution. It does not grant rights to external documentation, dependencies or
nested third-party code. The upstream vendored Stylistic implementation has separate
notices; none of that implementation is copied here. This addition does not import
upstream's installer or its incomplete root-notice copying behavior.

```text
MIT License

Copyright (c) 2026 Dillon Mulroy

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
