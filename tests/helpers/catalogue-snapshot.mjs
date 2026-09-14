// Exact compatibility/version transition; earlier evidence retains its source bytes.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');
export const catalogueTransition = {"previous": "9e587d73b1716716b81c7fc7e0b35b6a0bd6f4dbfe0fbbbc3c38b395cb172bd6", "current": "b7f63620fbc73f5c0f6b9f452ff79f9ad5f16a0f4f6dcf286fdcf2a061f0de2f", "replacements": [["  Prime-native Markdown guidance. No runtime package, provider key, installer,\n  server or hook. Implementation and verification use the target project's tools.", "  Markdown guidance; optional Python 3 stdlib catalogue helper. No runtime package,\n  provider key, installer, server or hook. Implementation uses project tools."], ["  version: 1.3.0-prime.1", "  version: 1.4.0-prime.1"]]};
export function beforeCatalogueSkill(root,owner){
 const b=readFileSync(resolve(root,owner,'SKILL.md'));
 if(owner!=='hallmark' || sha(b)!==catalogueTransition.current)return b;
 let text=b.toString('utf8');
 for(const [oldText,newText] of catalogueTransition.replacements){
  assert.equal(text.split(newText).length,2);text=text.replace(newText,oldText);
 }
 const previous=Buffer.from(text);assert.equal(sha(previous),catalogueTransition.previous);
 return previous;
}

export const catalogueUpstream = {"previous": "e36440e0a1baee2584112e9cb285d506410bbfa9ef524248eae9e21f1d93b6f6", "current": "cab69ffac04817881fedcd1699751b226463e90c27ba0f0fffea4ed3aa587104", "appendix": "\n## Optional UI UX Pro Max catalogue (local v1.4.0-prime.1)\n\nUser-approved read-only catalogue addition from Next Level Builder at\n`7f69fed6a2717900085f1bc3b263721f8ba025e2`. See [usage and scope](catalogue/README.md),\n[exact data provenance](catalogue/provenance.json) and [MIT notice](licenses/uiux-pro-max-MIT.txt).\nThree verbatim datasets and a bounded stdlib lookup are included; core guidance still\nneeds no runtime. No upstream generator, CSS output, MASTER/page persistence, rule\nengine, stack library, installer, companion skills, downloads or auto-update.\nThe helper's retrieval checks do not establish design quality or model effectiveness.\nEarlier notices and experimental source identities remain historical, not rerun evidence.\n", "replacement": ["local v1.3.0-prime.1.", "local v1.4.0-prime.1."]};
export function beforeCatalogueFile(root,rel){
 if(rel==='hallmark/SKILL.md')return beforeCatalogueSkill(root,'hallmark');
 const b=readFileSync(resolve(root,rel));
 if(rel!=='hallmark/UPSTREAM.md' || sha(b)!==catalogueUpstream.current)return b;
 let text=b.toString('utf8');assert(text.endsWith(catalogueUpstream.appendix));
 text=text.slice(0,-catalogueUpstream.appendix.length);
 const [oldText,newText]=catalogueUpstream.replacement;
 assert.equal(text.split(newText).length,2);text=text.replace(newText,oldText);
 const previous=Buffer.from(text);assert.equal(sha(previous),catalogueUpstream.previous);
 return previous;
}
