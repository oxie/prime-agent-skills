# Historical Anti-slop pilot evidence

`anti-slop-pilot.json` is the unchanged synthetic task record first committed in
`22980c2eff795b81fb52a877a0086ff2f12d4dd1` (2026-09-07).
Its SHA-256 is
`78406a029e2e404f2125c1caca3f581a8f24c865974c20df776a8da5bfdf6e49`.

`anti-slop-pilot-snapshot.json` archives the eight guidance files from that exact
revision. Each `utf8` value decodes to the original file bytes, including final
newlines. The manifest records the source revision, original paths, SHA-256
hashes and Git blob IDs. All eight hashes match the pilot's original
`guidance_sha256` map. The sources are data, not installed skills. Preserve them
unchanged; do not update historical hashes when current guidance changes.
Attribution and license records remain in `hallmark/THIRD_PARTY.md` and
`marketingskills/THIRD_PARTY.md`.

The source revision is the immutable repository snapshot that matches the
recorded guidance. It is not a claim that a provider ran from a committed tree.
The record supplies no provider identity or independent execution attestation.

Run from the skills repository:

```text
node --test tests/anti-slop-extraction.test.mjs
```

The first group of tests still reads current installed guidance and checks its
integration safeguards. Historical tests pin the original pilot and archive
bytes, verify each archived source against the original guidance digest and Git
blob ID, then check the recorded outputs. Negative controls reject changed pilot
bytes, forged provenance, incomplete/extra source manifests, corrupt source
bytes, path rebinding and fabricated updated source hashes. Tests do not need
Git history at runtime.

For an independent provenance check in a checkout with the source revision,
compare decoded archive bytes with `git show <revision>:<source-path>` and check
`git ls-tree -r <revision>` against the recorded Git blob IDs. SHA-256 binds raw
file bytes; Git blob IDs hash `blob <byte-length>\0` followed by file bytes.

These checks preserve historical evidence. They do not rerun the pilot, call a
provider, measure current model effectiveness, verify browser behavior or make
an accessibility/compliance claim. A new pilot requires separate authorization
and a new record; it must not replace this one.
