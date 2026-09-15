import {beforeWeknoraFile} from './weknora-snapshot.mjs';
// Exact RampStack append-only routes; old source evidence keeps its original bytes.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');
export const rampstackRoutes={"marketingskills/skills/image": {"previous": {"bytes": 16917, "sha256": "f8fe96dfb90fa21fa68fa7858ed772879c2f48eb04ae807a9ee777a7ffb9ae68"}, "addition": {"bytes": 268, "sha256": "94155e7c02f177097425a488b37f83baf4648dd74cb4a200b700efdc1505dfef"}, "current": {"bytes": 17185, "sha256": "e8a5a1abb74a6a56030fbd0081cedce14a340a9a3152e80fb85b50765a26dab6"}}, "engineering-references": {"previous": {"bytes": 7852, "sha256": "deda8e34acdc84fe008f5b1b245c93b81f43d45b2cf3ef4522dca268c93f6012"}, "addition": {"bytes": 312, "sha256": "5a9df5e3a2d6a38888842e237b49711d3b355c495184caf9a6277d5b4ff22396"}, "current": {"bytes": 8164, "sha256": "4c0c80a5ec73b0b850b580ec273bba474933315878a2c81247b26db6ef7e2a07"}}};
export function beforeRampstackSkill(root,owner){
 const b=beforeWeknoraFile(root,owner+'/SKILL.md'),r=rampstackRoutes[owner];
 if(!r || sha(b)!==r.current.sha256)return b;
 assert.equal(b.length,r.current.bytes);
 const old=b.subarray(0,r.previous.bytes),addition=b.subarray(r.previous.bytes);
 assert.equal(sha(old),r.previous.sha256);assert.equal(sha(addition),r.addition.sha256);
 assert.equal(addition.length,r.addition.bytes);return old;
}

export const rampstackDocs={"engineering-references/UPSTREAM.md": {"previous": "12ed8398b58732ab8679dae9d9b6f4269aa9dbeed49893d0ddd9409f88a99662", "current": "e9788637a1cf3be2b0cb0ac295004f26e64135226e3492acdb08a6b567608c54", "appendix": "\n## Selective RampStack guidance and factual corrections\n\nSee [source notes](RAMPSTACK_SOURCES.md) and rampstack-provenance.json for the\nreviewed selection, corrections, exact source/local identities and exclusions.\nNo new skill, executable payload or automatic workflow is installed.\n"}, "engineering-references/THIRD_PARTY.md": {"previous": "573159808afac636af14a22b5c6c04f2aeb19663e97033123247cd6bb13b82d5", "current": "1d42a1c9d30c15651fea8f36dfd1bb03778da3ea8bf8c9c7d2eaf78405771c48", "appendix": "\n## RampStack selective adaptation\n\nCorrected guidance from RampStack Co.; see [source notes and MIT attribution](RAMPSTACK_SOURCES.md).\nThis does not grant rights to any third-party asset mentioned in the sources.\n"}};
export function beforeRampstackFile(root,relative){
 const b=beforeWeknoraFile(root,relative),r=rampstackDocs[relative];
 if(!r || sha(b)!==r.current)return b;
 const t=b.toString('utf8');assert(t.endsWith(r.appendix));
 const old=Buffer.from(t.slice(0,-r.appendix.length));assert.equal(sha(old),r.previous);return old;
}
