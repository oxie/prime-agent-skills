// Exact approved concept-reuse successor only; historical expectations stay unchanged.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');
export const conceptTransitions={"task-observer/SKILL.md": {"previous_sha256": "1c0505bdc190be068870ce477d01d35948ecbd7b6002465385f2bfd4a6cd95bd", "current_sha256": "1644c34ecff4a288c3451221cbd3db798d21425af8bb737dadf8f0a6c971fdd0", "old": "## One persistence path: Prime continual harness", "new": "\n## Reuse concepts from real projects\n\nWhen a project has a material design gap or meaningful work yields a reusable\nimplementation lesson, follow [concept recall and learning](references/concept-reuse.md).\nRetrieve by the problem, verify the full evidence and fit, then adapt within the\ncurrent task's permissions. At a natural milestone, retain only strong, nonduplicate,\nclient-safe concepts through the existing refinement path. This is not mandatory\nresearch for routine work or permission to install the source project.\n\n## One persistence path: Prime continual harness"}, "task-observer/UPSTREAM.md": {"previous_sha256": "98bffcae4875a71f0b4bcc4ce5457578beae13edfa04ad7ffe5ba1ab4c8d7506", "current_sha256": "0fcca9cbde164371e9053d421bc738e13f2eeef876a0400a52c1c14312386d96", "old": "", "new": "\n## Original problem-oriented concept reuse\n\nThe approved Prime adaptation adds [concept recall and learning](references/concept-reuse.md)\nunder Task Observer. It retrieves problem-oriented memories through the existing\nnative harness, checks source evidence and fit, and selectively refines lessons from\nreal authorized work. These are original workflow instructions, not imported project\ncode or an additional memory system. Source-specific concept cards live only in the\ncontinual harness; this repository does not mirror them or promise their backup.\nNo new runtime, dependency, provider, automatic capture or evaluation loop is added.\n"}};
export function beforeConceptReuseFile(root,relative){
 const b=fs.readFileSync(path.join(root,relative)),r=conceptTransitions[relative];
 if(!r || sha(b)!==r.current_sha256)return b;
 const text=b.toString('utf8');let previous;
 if(r.old){assert.equal(text.split(r.new).length,2);previous=text.replace(r.new,r.old);}
 else {assert(text.endsWith(r.new));previous=text.slice(0,-r.new.length);}
 const result=Buffer.from(previous);assert.equal(sha(result),r.previous_sha256);return result;
}
