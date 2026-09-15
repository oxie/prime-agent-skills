// Exact later append transition; never re-label prior source tests as current evidence.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');
export const weknoraTransitions={"engineering-references/SKILL.md": {"previous": "4c0c80a5ec73b0b850b580ec273bba474933315878a2c81247b26db6ef7e2a07", "current": "fbb9af80ec40cb5ee7636a454c51a426f895a141e1e197ed5ed4a82c96340af8", "appendix": "\n## Retrieval evidence and readiness\n\nFor multi-source search coverage, asynchronous ranking or saved-versus-indexed state,\nread [retrieval contracts](references/retrieval-contracts.md). Use only the changed\nboundary; no search service, database, model trial or whole-system audit is implied.\n"}, "engineering-references/UPSTREAM.md": {"previous": "e9788637a1cf3be2b0cb0ac295004f26e64135226e3492acdb08a6b567608c54", "current": "494f1a9a62404100b3c2883e19fa03ced32b6522ca1aefbad633ad3767093f39", "appendix": "\n## Selective WeKnora evidence contracts\n\nSee [source notes](WEKNORA_SOURCES.md) and weknora-provenance.json for the reviewed\nmechanisms, original local guidance and exact source identities. No WeKnora runtime,\nconnector, memory store, service or automatic ingestion is installed. Historical\nsource records keep their original revisions and verification limits.\n"}, "unlazy/UPSTREAM.md": {"previous": "104a731a1bdcd284d15506fecc382ed6bfc270506d147c115a1f664d3d2a3001", "current": "ca6ed7eb2e816b4318f2ec51c77b1c9224965e7f86168ef7bdb92845564f9052", "appendix": "\n## Selective WeKnora evidence contracts\n\nSee [source notes](WEKNORA_SOURCES.md) and weknora-provenance.json for the reviewed\nmechanisms, original local guidance and exact source identities. No WeKnora runtime,\nconnector, memory store, service or automatic ingestion is installed. Historical\nsource records keep their original revisions and verification limits.\n"}};
export function beforeWeknoraFile(root,relative){
 const b=readFileSync(resolve(root,relative)),r=weknoraTransitions[relative];
 if(!r || sha(b)!==r.current)return b;
 const t=b.toString('utf8');assert(t.endsWith(r.appendix));
 const old=Buffer.from(t.slice(0,-r.appendix.length));assert.equal(sha(old),r.previous);return old;
}
