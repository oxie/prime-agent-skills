import {beforeStorefrontSkill} from './storefront-snapshot.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');
export const tasteRoutes = {"cinematic-ui": {"path": "SKILL.md", "previous": {"bytes": 8446, "sha256": "ae748ac24fe63ac8dc4c4c4d57551e453767bf1bbb64b6c4eed3becb29b328d1"}, "addition": {"bytes": 357, "sha256": "2c06400c6d7a2b8fa4211bf3468fc8d5b9e2b848db2983e0cde81824a78d52b0"}, "current": {"bytes": 8803, "sha256": "cd7346ca6ddad2d1f898d6b7d9ab5e374157f88c366b87ab9ff05846a0d93572"}}, "hallmark": {"path": "SKILL.md", "previous": {"bytes": 9446, "sha256": "d63b9421aeed3022b99ddabe9aeacb2b594736f9095909193e60ca876b53125b"}, "addition": {"bytes": 466, "sha256": "816edd69fc05247d5336e240e413b2468e5e53b878b2bbccc9943e57772edeb3"}, "current": {"bytes": 9912, "sha256": "a1cf8ce06e0d3305d23a02bb79dcc04d95b0187c31f634b0a4304bd7b8b6f49a"}}, "marketingskills/skills/image": {"path": "SKILL.md", "previous": {"bytes": 16475, "sha256": "0b1a13a9db01ef82d01f02cfc61fc84d1f3718234ace98b8fb30f92354f0bdcb"}, "addition": {"bytes": 442, "sha256": "922b2397fb684714bf7aecb10149b002febff85ec7543b9444495d8fbf223b1d"}, "current": {"bytes": 16917, "sha256": "f8fe96dfb90fa21fa68fa7858ed772879c2f48eb04ae807a9ee777a7ffb9ae68"}}};
// Accept only exact approved current bytes or exact historical fixture bytes.
export function beforeTasteSkill(skills,owner){
 assert(Object.hasOwn(tasteRoutes,owner),'Only the three approved Taste owners');
 const r=tasteRoutes[owner],b=owner==='hallmark'?beforeStorefrontSkill(skills,owner):readFileSync(resolve(skills,owner,'SKILL.md'));
 if(b.length===r.previous.bytes && sha(b)===r.previous.sha256)return b;
 assert.equal(b.length,r.current.bytes);assert.equal(sha(b),r.current.sha256);
 const previous=b.subarray(0,r.previous.bytes),addition=b.subarray(r.previous.bytes);
 assert.equal(sha(previous),r.previous.sha256);assert.equal(addition.length,r.addition.bytes);assert.equal(sha(addition),r.addition.sha256);
 return previous;
}
