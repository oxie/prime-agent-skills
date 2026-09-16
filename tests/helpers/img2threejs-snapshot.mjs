// Only the exact approved 3D guidance appendix is invertible for historical tests.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');
export const img2threejsTransitions={"canvas-effects/SKILL.md": {"previous": "2e71c43709ba37b11b977a07706470c5e3f58317e92bb8d3f067f24d09a1d1ee", "current": "01dbf62b1d854e4779b1694ea8c5cc17d522455162cb0d4c8cae9187c2c10348", "appendix": "\n## Reference-driven 3D modelling\n\nWhen an explicitly requested model or interactive 3D scene must match reference\nimages, read [reference-driven 3D inspection](references/reference-driven-3d.md).\nIt covers camera matching, inferred geometry and separate appearance/structure\nchecks, not a generator or automatic reconstruction workflow. Existing lifecycle,\naccessibility, resource and browser-permission boundaries still apply.\n"}};
export function beforeImg2threejsFile(root,relative){
 const b=readFileSync(resolve(root,relative)),r=img2threejsTransitions[relative];
 if(!r || sha(b)!==r.current)return b;
 const add=Buffer.from(r.appendix);assert(b.subarray(b.length-add.length).equals(add));
 const old=b.subarray(0,b.length-add.length);assert.equal(sha(old),r.previous);return old;
}
