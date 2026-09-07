# Editorial integration fix

Complete. Copy ONLY the two updated private payload files below. Preserve root's existing Node wrapper with `-B`; no new `bin/editorial.mjs` copy is needed. Original `result.md` remains unchanged for historical evidence. Shared/live worktree and catalogue files were only read, never edited.

```json
{
  "editorial/check.py": {
    "bytes": 36476,
    "sha256": "9501135da4a28474c64f1bb3d5c25733febc2740be7ceb69f032ee91e87eef42"
  },
  "dev/editorial.test.mjs": {
    "bytes": 22354,
    "sha256": "d46a20a1e5813b8da0af29985ce6b127a9958971dddf39a897987d177962b8dc"
  }
}
```

Payload: `/home/prime-agent/.prime/agent/session-artifacts/01a077c2-76c2-70fa-9967-55011b3b6685/sub-833f014b/payload`

## Focused changes

1. Permit exact `tabindex="0"` on safe static HTML for keyboard access to labelled scroll regions. Reject negative, positive, empty and invalid values, and reject tabindex on SVG. No general keyboard scripting or interaction support was added.
2. Permit only the named `data-archify-editorial` attribute on SVG with a bounded lowercase slug (`[a-z][a-z0-9-]{0,63}`). Arbitrary data-* attributes and placement on HTML remain rejected.
3. Permit safe CSS `color-scheme` through the existing complete CSS resource/function gate. No script/resource policy was weakened.
4. Close SVG use fan-out gap. Referenced use targets may not contain further use anywhere in the target subtree. Also bound all original plus direct clone estimates to 24,000 nodes and 8 MiB of structural/text/attribute bytes. This prevents both exponential acyclic nesting and very wide leaf cloning, including large-path/text amplification that a node-only cap would miss. Plain leaf/group use remains accepted. Receipt now includes `bounded_svg_use_expansion` with estimated node/byte counts. This is a conservative static subset and estimate, not a universal rendering-resource proof.
5. Add FIFO source check/deliver regression. Existing gate snapshot already uses `O_RDONLY | O_NOFOLLOW | O_NONBLOCK` before regular-file fstat, so no source-read code change was needed. Browser worker owns its separate FIFO fix.

## Security reproduction

Security review fixture: `/home/prime-agent/.prime/agent/session-artifacts/01a077c2-76c2-70fa-9967-55011b3b6685/sub-37565ce4/audit-fixtures/fanout.html`.
SHA-256 `824bd0c094da48274dc7a29ba688543e52821f88e05fb8fd834c23e4ac9529d8`, 2,101 bytes, 32 groups doubling prior use, potentially 2^32 leaf instances.

- Before fix, direct native helper returned exit 0 / ok true: reproduced the bug without browser execution.
- After fix, same exact source returned exit 1 / ok false: `SVG use targets may not contain further use elements`.
- No adversarial HTML was loaded into a browser.

## Verification

Native cwd: `/home/prime-agent/.prime/agent/session-artifacts/01a077c2-76c2-70fa-9967-55011b3b6685/sub-833f014b/payload`.

- `node --test --test-concurrency=1 dev/editorial.test.mjs`: final exit **0**, **102/102 passed**, 0 skipped/failed/cancelled, shell duration **41.181739 seconds**. Includes all original hostile CSS/tag/resource tests, new keyboard/metadata compatibility tests, nested/wide/byte-heavy use cloning, and FIFO check/deliver with no writer. Log: `/home/prime-agent/.prime/agent/session-artifacts/01a077c2-76c2-70fa-9967-55011b3b6685/sub-833f014b/editorial-integration-tests.log`.
- `python3 -I -B editorial/check.py <shared-stage>/editorial/examples/{wardley,journey,bar}.html --json`: all three independent final helper commands exit **0**, ok true.
- Private Node exported `runEditorial` CLI dispatcher invoked with `deliver` for each of the same three shared-stage originals to NEW private .html outputs: all exit **0**, all exact source/artifact hashes present, managedCsp true.
- Private Node dispatcher `check` on all three delivered files: all exit **0**, managedCsp true, confirming inserted CSP/recheck compatibility.
- Three output files only, no receipt/scratch sidecars. Private delivery test outputs removed after successful recheck and evidence capture.
- Full machine receipts: `/home/prime-agent/.prime/agent/session-artifacts/01a077c2-76c2-70fa-9967-55011b3b6685/sub-833f014b/editorial-integration-evidence.json`.

Source and artifact identities:

```json
{
  "wardley": {
    "input": {
      "path": "/home/prime-agent/.prime/agent/skill-worktrees/archify-expanded-20260906T221844Z/archify/editorial/examples/wardley.html",
      "sha256": "8c21f543061bc23f93648fb38c69728765bf987440fd9b33581dc1a5934f6b87",
      "bytes": 6634
    },
    "artifact": {
      "path": "/home/prime-agent/.prime/agent/session-artifacts/01a077c2-76c2-70fa-9967-55011b3b6685/sub-833f014b/payload/.integration-test-output/wardley.html",
      "sha256": "15e9d1fce935e76264286f6bb915ff0ce0168adf6ccfe0b45e78759babcc96cc",
      "bytes": 6860
    }
  },
  "journey": {
    "input": {
      "path": "/home/prime-agent/.prime/agent/skill-worktrees/archify-expanded-20260906T221844Z/archify/editorial/examples/journey.html",
      "sha256": "b9edbd26d02efb227c9a4ad5f9bedf41e3882fbf8247b9f4b7119adc95c47a2a",
      "bytes": 6997
    },
    "artifact": {
      "path": "/home/prime-agent/.prime/agent/session-artifacts/01a077c2-76c2-70fa-9967-55011b3b6685/sub-833f014b/payload/.integration-test-output/journey.html",
      "sha256": "8695917f1e61a63e0b587a5b101015c89d36badd8ad4970f782f72c7ca818cba",
      "bytes": 7223
    }
  },
  "bar": {
    "input": {
      "path": "/home/prime-agent/.prime/agent/skill-worktrees/archify-expanded-20260906T221844Z/archify/editorial/examples/bar.html",
      "sha256": "28160bd8952cf765ba5fbedea5452b3a2fb99d1924ff39f372f184f2f0b89115",
      "bytes": 5705
    },
    "artifact": {
      "path": "/home/prime-agent/.prime/agent/session-artifacts/01a077c2-76c2-70fa-9967-55011b3b6685/sub-833f014b/payload/.integration-test-output/bar.html",
      "sha256": "4a7db317f9b789febc0f1f66171ad71401383ca7c50c557c8a0a1e3a0d403336",
      "bytes": 5931
    }
  }
}
```

No additional catalogue mismatch remains in these three supplied examples. Draft templates may still correctly fail placeholders. No browser/visual/typed-geometry evidence is claimed here; parent owns those checks. No dependencies, network, servers, shared edits, commits or pushes were used.
