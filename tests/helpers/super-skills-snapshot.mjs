import {beforeStorefrontSkill} from './storefront-snapshot.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');
const approved={"previous": {"bytes": 7174, "sha256": "2a30a68ebb43812832b6fd425df706e52678a704a6e45f19f4da58dc293bba51"}, "current": {"bytes": 7609, "sha256": "8ee4682e187b43f82e5ee5dc0220d456b39364bd60503f91fca7e57be4ddc26b"}, "addition": {"bytes": 372, "sha256": "41aedeb2ccb1c68b1c02d110b9f3a27c376f912d1d5560f875f04a33ea248b14"}, "previousHeader": "---\nname: engineering-references\ndescription: >\n  Consult focused checklists for production failure handling, data-consistency\n  and schema/replay risks, or difficult changes in poorly tested legacy code.\n  Use for reliability reviews, retry/timeout/overload design, transactional or\n  derived-data changes, safe legacy test seams, cross-path field/enum propagation,\n  parsed network responses, mutation/cache reconciliation, and diff-linked release\n  dependencies or running-revision evidence, API object/tenant authorization and\n  denied-write tests, result-preserving SQL diagnosis, or operator-led telemetry\n  evidence, exact-symptom debugging, independent test oracles, interface design\n  comparisons, or domain terminology and material decision records. Not a mandatory\n  coding rulebook, routine cleanup pass, or deployment tool.\nlicense: \"MIT for original wrapper/book references; CC-BY-4.0, MIT and Apache-2.0 for selected adaptations (see THIRD_PARTY.md)\"\nmetadata:\n  version: 1.4.0-prime.1\n  upstream: https://github.com/ciembor/agent-rules-books\n  upstream-commit: 893a88a6fce3a80c565bf39ac65021b43a8b2990\n---\n", "currentHeader": {"bytes": 1185, "sha256": "89f00665f00883927cbe77bdd461632b1acba1e4e6f1cdba93775589593bf9d1"}};
// Only the exact approved old/current engineering entrypoint; no generic normalization.
export function beforeSuperEngineering(skills){
 const b=beforeStorefrontSkill(skills,'engineering-references');
 if(b.length===approved.previous.bytes && sha(b)===approved.previous.sha256)return b;
 assert.equal(b.length,approved.current.bytes);assert.equal(sha(b),approved.current.sha256);
 const header=b.subarray(0,approved.currentHeader.bytes),addition=b.subarray(b.length-approved.addition.bytes);
 assert.equal(sha(header),approved.currentHeader.sha256);assert.equal(sha(addition),approved.addition.sha256);
 const old=Buffer.concat([Buffer.from(approved.previousHeader),b.subarray(approved.currentHeader.bytes,b.length-approved.addition.bytes)]);
 assert.equal(old.length,approved.previous.bytes);assert.equal(sha(old),approved.previous.sha256);return old;
}
