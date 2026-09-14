// Exact later routing transition. Historical sources/evaluations retain old bytes.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');
export const storefrontRoutes = {"hallmark": {"previous": {"bytes": 9912, "sha256": "a1cf8ce06e0d3305d23a02bb79dcc04d95b0187c31f634b0a4304bd7b8b6f49a"}, "addition": {"bytes": 215, "sha256": "b83e841ea9d027fb3045799e2fa402182138091c0b42183ae3713892bedecb2f"}, "current": {"bytes": 10127, "sha256": "9e587d73b1716716b81c7fc7e0b35b6a0bd6f4dbfe0fbbbc3c38b395cb172bd6"}}, "engineering-references": {"previous": {"bytes": 7609, "sha256": "8ee4682e187b43f82e5ee5dc0220d456b39364bd60503f91fca7e57be4ddc26b"}, "addition": {"bytes": 243, "sha256": "e281e915f68febb4bf49d2d10b02f063339ddaa54bd02a37c84cf0dc0beaff18"}, "current": {"bytes": 7852, "sha256": "deda8e34acdc84fe008f5b1b245c93b81f43d45b2cf3ef4522dca268c93f6012"}}};
const earlier = {
 'hallmark': {bytes:9446,sha256:'d63b9421aeed3022b99ddabe9aeacb2b594736f9095909193e60ca876b53125b'},
 'engineering-references': {bytes:7174,sha256:'2a30a68ebb43812832b6fd425df706e52678a704a6e45f19f4da58dc293bba51'},
};
export function beforeStorefrontSkill(root,owner){
 assert(Object.hasOwn(storefrontRoutes,owner),'Only reviewed storefront owners');
 const b=readFileSync(resolve(root,owner,'SKILL.md')),r=storefrontRoutes[owner];
 for(const old of [r.previous,earlier[owner]])if(b.length===old.bytes && sha(b)===old.sha256)return b;
 assert.equal(b.length,r.current.bytes);assert.equal(sha(b),r.current.sha256);
 const previous=b.subarray(0,r.previous.bytes),addition=b.subarray(r.previous.bytes);
 assert.equal(sha(previous),r.previous.sha256);assert.equal(addition.length,r.addition.bytes);assert.equal(sha(addition),r.addition.sha256);
 return previous;
}
