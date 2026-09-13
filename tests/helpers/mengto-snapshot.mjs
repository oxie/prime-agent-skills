import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');
const owners=new Set(['hallmark','cinematic-ui','canvas-effects']);
// Historical tests retain exact original bytes; no arbitrary suffix is accepted.
export function previousMengtoSkill(skills,owner){
 assert(owners.has(owner),'Only the three approved historical SKILL.md snapshots');
 const root=resolve(skills,owner),record=JSON.parse(readFileSync(resolve(root,'mengto-provenance.json'),'utf8')).routing;
 const b=readFileSync(resolve(root,'SKILL.md'));
 assert.equal(record.path,'SKILL.md');
 assert.equal(b.length,record.current.bytes);assert.equal(sha(b),record.current.sha256);
 const old=b.subarray(0,record.previous.bytes),add=b.subarray(record.previous.bytes);
 assert.equal(old.length,record.previous.bytes);assert.equal(sha(old),record.previous.sha256);
 assert.equal(add.length,record.addition.bytes);assert.equal(sha(add),record.addition.sha256);
 return old;
}
