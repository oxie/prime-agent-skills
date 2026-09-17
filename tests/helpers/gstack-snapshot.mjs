// Recognize only exact approved gstack documentation transitions.
// Test-only historical views; no runtime source fingerprint or evidence engine.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');
export const gstackTransitions={"unlazy/SKILL.md":{"previous":"7ea98e4d9665d2912db7127fb917cf0973628e5f62798a4d8e1ead180f03ac96","current":"6fe0a1e8935193e783e401f3ea595b34b212da9c9c4a0ae4df6b346390152f69","chunks":[{"start":381,"current":"s, decision-to-verification handoff","previous":""},{"start":12656,"current":"\n## Accepted decisions and QA handoffs\n\nWhen review decisions change a substantial task or QA must connect a finding to a\nfix, read [decision-to-verification handoffs](references/decision-verification.md).\nCarry accepted conditions into the existing plan and repeat the actual failing\npath against the intended revision. No new ledger or runtime is required.\n","previous":""}]},"unlazy/UPSTREAM.md":{"previous":"6d1dc9d1e77eee321bf3322bfba7a5957932ec09b635cbbf5aaca86bdaca1045","current":"65b6381743ae4531063f7a1e448e72f630f49929e9469b855e9853caaaba3022","chunks":[{"start":2893,"current":"\n## Selected gstack decision and QA handoffs\n\nOriginal optional [decision-to-verification guidance](references/decision-verification.md)\nconnects accepted obligations, plan identity, reproduction and same-action retesting.\nIt does not change gate digests, approval logic, scripts, templates or execution\npermissions. See [selected source and rights](GSTACK_SOURCES.md) and\ngstack-provenance.json. Earlier source identities remain historical and unchanged.\n","previous":""}]},"engineering-references/SKILL.md":{"previous":"7c33875c8b8dcefa54e75fe59bb5fc653318cd2c0a3548cc827d89e87ddaa8bf","current":"d7802614ee7be88adfe9fbe2b096a8b4c1a4c668caef7b3fd897a7762e3b5446","chunks":[{"start":822,"current":", developer onboarding/first-value journeys","previous":""},{"start":8877,"current":"\n## Developer first value\n\nFor developer onboarding or an affected CLI, SDK, API or upgrade journey, read\n[developer first value](references/developer-first-value.md). Trace actual setup,\nuseful success, errors and recovery. Separate tested, partial and inferred evidence;\nthis optional review does not authorize installation or live service access.\n","previous":""}]},"engineering-references/UPSTREAM.md":{"previous":"e802d1d30089c4f8150e12e2675ebb0ea76959cbc30ee08be786b99148bf4f2d","current":"5a72f387f9b1c44e8688bbd366690e731258b30b0bc1583fe19286691443dacb","chunks":[{"start":8271,"current":"\n## Selected gstack developer journey\n\nOriginal optional [developer-first-value guidance](references/developer-first-value.md)\ntraces setup, useful success, errors, recovery and upgrades with explicit evidence\ncoverage. See [selected source and rights](GSTACK_SOURCES.md) and\ngstack-provenance.json. No gstack runtime, install, browser authority, scores or\nsimulated measurements are adopted. Earlier source identities remain unchanged.\n","previous":""}]}};
export function beforeGstackFile(root,relative){
 const b=fs.readFileSync(path.resolve(root,relative)),r=gstackTransitions[relative];
 if(!r||sha(b)!==r.current)return b;
 let text=b.toString('utf8');
 for(const c of [...r.chunks].reverse()){
  assert.equal(text.slice(c.start,c.start+c.current.length),c.current);
  text=text.slice(0,c.start)+c.previous+text.slice(c.start+c.current.length);
 }
 const old=Buffer.from(text);assert.equal(sha(old),r.previous);return old;
}
