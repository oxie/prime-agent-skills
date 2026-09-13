import {previousMengtoSkill} from './helpers/mengto-snapshot.mjs';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import test from 'node:test';
const skills=resolve(process.argv[2] ?? dirname(fileURLToPath(import.meta.url))+'/..');
const root=resolve(skills,'cinematic-ui');
const read=p=>readFileSync(resolve(root,p),'utf8');
const sha=b=>createHash('sha256').update(b).digest('hex');
const prov=JSON.parse(read('auteur-provenance.json'));
const clauses={"references/production-scenes.md": ["FEEL", "LEARN", "clear text area and narrow-width treatment", "not permission", "Separate parts only", "single fused mesh", "Node names alone do not prove", "Preserve accepted masters", "valid in-between states", "A single final frame is insufficient", "**category**", "**anti-category**", "**house**", "no new document is required", "Grayscale is not a contrast or color audit", "Functional/accessibility failures take priority", "cheap-and-decisive", "expensive-and-marginal"], "references/quiet-surfaces.md": ["Do not copy `demo.css`", "relative to the\nstylesheet", "No host token is declared or overwritten", "not** Shadow DOM or cascade isolation", "fresh outer wrapper", "Do not bypass asset/CSP policy", "Reduced motion, on load or changed", "Forced colors", "Static does not mean zero cost", "changing only the base does not retint", "solid fill", "actual brand hue"]};
function textContract(text, required){for(const clause of required)assert(text.includes(clause),clause);}
test('selected creative substance and boundaries, with every clause removed as a negative control',()=>{
 for(const [path,required] of Object.entries(clauses)){
  const text=read(path);textContract(text,required);
  for(const clause of required)assert.throws(()=>textContract(text.replaceAll(clause,''),required));
 }
});
test('exact source identity, source license and adaptation payload set',()=>{
 assert.equal(prov.commit,'9bca227df9877e60dc45d49783c8cbd885eccd9b');
 assert.equal(prov.repository,'https://github.com/agiwhitelist/auteur');
 assert.equal(prov.source_version,'1.3.1');
 const sources=[{"path": "LICENSE", "git_blob": "34d81ae5d35d8306d877a8be0dd11c9d2eda2ae8", "sha256": "030435fc8e382b307cd0d592b43c307634abae20b69da361d356fea230ee0672", "bytes": 1069}, {"path": "reference/assets.md", "git_blob": "efb313d167065cdaaaf1e04ac9b74b4999ed6055", "sha256": "a107efd87c770ed13073c4a0009ac18df2e5f9072e4191b87d934c27de5302b3", "bytes": 28689}, {"path": "reference/direct.md", "git_blob": "09734329537c9a983abfda176ec1f859c2eec1c6", "sha256": "690ff37289222e1a500d0a924ddee39e63ac6b174f1378bbc1ae6aa2cbfe51b5", "bytes": 12667}, {"path": "reference/taste.md", "git_blob": "eff2730ebdbbcd3ac57995dd9effc781e4ad3a49", "sha256": "9afe7497fff4c2488c77aea6ab74b19ecb5d5d4f82034683bff4977693e8f91f", "bytes": 14034}, {"path": "reference/verify.md", "git_blob": "979214381dcdc0c9fb8d5a6f659cad00488a19e1", "sha256": "07d5e3d935aa648dfac3347aa3106ad641a7d4935b30b17f5d268b24feed84c1", "bytes": 15150}, {"path": "templates/STORYBOARD.md", "git_blob": "4fad79ea5ee3c5445930067c462d209459ecfc4d", "sha256": "fb77582402c1c70306a7c8fb23762c927d122e7b41f81b654f95e81080219d89", "bytes": 4610}, {"path": "reference/ambient-backgrounds.md", "git_blob": "7757ed48e30677d15802516251da4bd4db5cc987", "sha256": "a86d50040d3f8dfcda4e47435453718ac060404fa431fa42e607ac4203e39aa2", "bytes": 8119}];
 assert.deepEqual(prov.sources,sources);
 const payload=["AUTEUR_SOURCES.md", "SKILL.md", "UPSTREAM.md", "assets/quiet-surfaces/demo.css", "assets/quiet-surfaces/grain.svg", "assets/quiet-surfaces/index.html", "assets/quiet-surfaces/quiet-surfaces.css", "licenses/auteur-MIT.txt", "references/light-material.md", "references/production-scenes.md", "references/quiet-surfaces.md", "references/selection.md", "tests/quiet-surfaces-browser/README.md", "tests/quiet-surfaces-browser/index.html", "tests/quiet-surfaces-browser/probe.js"];
 assert.deepEqual(Object.keys(prov.adapted_files).sort(),payload);
 for(const [path,hash] of Object.entries(prov.adapted_files))assert.equal(sha(path==='SKILL.md'?previousMengtoSkill(skills,'cinematic-ui'):readFileSync(resolve(root,path))),hash,path);
 assert.equal(sha(read('licenses/auteur-MIT.txt')),'030435fc8e382b307cd0d592b43c307634abae20b69da361d356fea230ee0672');
 assert(read('licenses/auteur-MIT.txt').includes('Copyright (c) 2026 agiwhitelist'));
 assert(read('AUTEUR_SOURCES.md').includes('third-party'));
});
test('old owners and unchanged Cinematic UI files retain their actual bytes',()=>{
 const previous={"UPSTREAM.md": "b49e860a9abe13028919dc50ac9677856a4916e3ca5539f8fdc0a42b7b4f1ea1", "LICENSE": "1126322e2cc8d165adc4c792eeb195717de2bcc7b39be1ce77959d78e87ef685", "SKILL.md": "5ac4b40f1baf1a170d5793d942fa66a3c21cddeb274b2d8d10ce11dbe89b7c15", "references/light-material.md": "c700d685ab0e406c402d757ed84319306cae69d2980df0ed755ddfcfa2240d93", "references/composition.md": "8b224a8c615d5e5bb1d686fc0c08045152f1e8d164ad831e568f3646372b6dd4", "references/pacing-motion.md": "ca6a50fdbeef467ec4f39477b7b90f7edc443a4248b8f51fd8820b3275bd1c94", "references/worked-directions.md": "94234585788d3c3d0ed1477a1816f7ba49b25923640bb84bb7f5317eb507bead", "references/evidence.md": "b067a8946918c16a05d17a2febb355df9690deae333a5ef7bf65db5f4d27ea7f", "references/typography.md": "0200b606f8b1a954f25bc3fabc41793b6a597bbad6f376966c206a7ea455c132", "references/production-checks.md": "7c96f8fdd0a50948ab2e239b8692da4ae28b4cd0c68421d7566f5b742997f580", "references/selection.md": "2480302c9d084d9e761bbf2816c56becdfd5e376ab8ba401bb01d7963c5f983f", "assets/demo/index.html": "4d1c983d11f47bbce910a1e441752c224ba0b45141cfc1a6d64f2a987829bf97", "assets/demo/scene.js": "9cd825e379c36a5a35448493e21121f2a7d1083798c5c3620b6562bea1220b23", "assets/demo/style.css": "77a4055135f0f31382c2695f91ca4cf6255b5bd8c34039ae3c904c32ba28b513", "tests/BROWSER.md": "4acfca82268ca8fe85d7f6cba90a07fc577bfd90b96de9b64b3894beb8287250", "tests/browser.py": "e832c36325c7a0574ca141d4e07a9d25bb29751f741152ab197eff6a7fc84021", "tests/native-contract.mjs": "e61b0774cf88dc658d98a52acb114d1ae0ffa68579706995671f5f22e88b2883"};
 assert.deepEqual(prov.previous_files,previous);
 const changed=new Set(['SKILL.md','UPSTREAM.md','references/selection.md','references/light-material.md']);
 for(const [path,hash] of Object.entries(previous))if(!changed.has(path))assert.equal(sha(path==='SKILL.md'?previousMengtoSkill(skills,'cinematic-ui'):readFileSync(resolve(root,path))),hash,path);
 for(const [path,hash] of Object.entries({"hallmark/SKILL.md": "44f66f48f6f367a595653f23e774bd5fcde4ce67c3a10d181f35a10fe1869833", "hallmark/refero-provenance.json": "44df23ec8b2aef3a19510ab72d1e696764ad98e214747aa6ef8b2c3ce14b4f4b", "canvas-effects/SKILL.md": "a6268ba4e5c92eb4caa2feb80d532705d087c548d61f2b62effc30990c3eb1fe"}))assert.equal(sha(path.endsWith('/SKILL.md')?previousMengtoSkill(skills,path.split('/')[0]):readFileSync(resolve(skills,path))),hash,path);
 // Existing reference/provenance bodies stay exact prefixes, not reworded history.
 for(const path of ['UPSTREAM.md','references/selection.md','references/light-material.md']){
  const bytes=readFileSync(resolve(root,path));const oldLength={"references/selection.md": 4505, "references/light-material.md": 7303, "UPSTREAM.md": 9347}[path];
  assert.equal(sha(bytes.subarray(0,oldLength)),previous[path],path);
 }
});
test('library is scoped static CSS; mutations demonstrate its guard boundaries',()=>{
 const css=read('assets/quiet-surfaces/quiet-surfaces.css');
 function inspect(text){
  const body=text.replace(/\/\*[\s\S]*?\*\//g,'');
  assert(!/(?:@import|@keyframes|\banimation\s*:|\btransition\s*:|\bfilter\s*:|\bbackdrop-filter\s*:|\bposition\s*:\s*fixed|(?:^|[;{])\s*--[\w-]+\s*:)/i.test(body));
  assert(!/(?:^|[{}])\s*(?:body|html|:root|\*)\s*[{,]/m.test(body));
  for(const match of body.matchAll(/([^{}]+)\{/g)){
   const selector=match[1].trim();if(selector.startsWith('@media'))continue;
   assert(selector.split(',').every(s=>s.trim().startsWith('.cui-quiet')),selector);
  }
  assert(/isolation:\s*isolate/.test(body));assert(/pointer-events:\s*none/.test(body));assert(/z-index:\s*-1/.test(body));
  assert(body.includes('@media (forced-colors: active)'));assert(body.includes('display: none'));
  const urls=[...body.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map(m=>m[1]);assert.deepEqual(urls,['./grain.svg']);
 }
 inspect(css);
 for(const extra of ['\nbody{color:red}','\n.cui-quiet{animation:pulse 1s}','\n@import "https://example.invalid/style.css";','\n.cui-quiet{--host-token:red}'])assert.throws(()=>inspect(css+extra));
 for(const clause of ['isolation: isolate','pointer-events: none','@media (forced-colors: active)'])assert.throws(()=>inspect(css.replace(clause,'')));
});
test('actual standalone demo and bounded filter-free local SVG',()=>{
 const html=read('assets/quiet-surfaces/index.html'),svg=read('assets/quiet-surfaces/grain.svg');
 assert(!/<(?:script|iframe|video|audio)\b/i.test(html));assert(!/(?:src|href)=["'](?:https?:|\/\/|data:)/i.test(html));
 assert(html.includes('href="./quiet-surfaces.css"'));assert(html.includes('href="./demo.css"'));
 for(const recipe of ['mesh','grain','ledger'])for(const theme of ['light','dark'])assert(html.includes(`id="${recipe}-${theme}"`));
 assert(/<section id="neutral" class="qs-demo-neutral"/.test(html));assert(html.includes('No submission or save feature'));
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
 for(const label of html.matchAll(/\bfor="([^"]+)"/g))assert(ids.includes(label[1]));
 assert(!/<(?:script|filter|feTurbulence|animate|image|foreignObject|use)\b/i.test(svg));assert(!/\b(?:href|onload|onclick)\s*=/.test(svg));
 const circles=[...svg.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"\/>/g)];assert(circles.length>0&&circles.length<=256);
 for(const [,x,y,r] of circles){assert(+r>0&&+r<=1);assert(+x-+r>=0&&+x+ +r<=128&&+y-+r>=0&&+y+ +r<=128);}
});
function luminance(rgb){const a=rgb.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return a[0]*.2126+a[1]*.7152+a[2]*.0722;}
const rgb=hex=>hex.match(/\w\w/g).map(x=>parseInt(x,16));
const mix=(bg,fg,a)=>bg.map((v,i)=>v*(1-a)+fg[i]*a);
const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
function rule(css, selector){
 const escaped=selector.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const body=css.replace(/\/\*[\s\S]*?\*\//g,'');
 const match=body.match(new RegExp('(?:^|})\\s*'+escaped+'\\s*\\{([^{}]*)\\}'));
 assert(match,selector);return match[1];
}
function declaration(body,name){
 const declarations=body.split(';').map(p=>p.trim()).filter(p=>p.startsWith(name+':'));
 assert.equal(declarations.length,1,name);return declarations[0].slice(name.length+1).trim();
}
function hexColor(body,name){const value=declaration(body,name);assert(/^#[\da-f]{6}$/i.test(value));return rgb(value.slice(1));}
function inspectDefaultContrast(css){
 const base=rule(css,'.cui-quiet'),dark=rule(css,'.cui-quiet.cui-quiet--dark');
 for(const [body,prefix] of [[base,'.cui-quiet--'],[dark,'.cui-quiet--dark.cui-quiet--']]){
  const text=hexColor(body,'color'),background=hexColor(body,'background-color');
  const surfaces=[background];
  for(const recipe of ['mesh','ledger']){
   const field=declaration(rule(css,prefix+recipe+'::before'),'background-image');
   const stops=[...field.matchAll(/rgb\((\d+) (\d+) (\d+) \/ (\d+(?:\.\d+)?)%\)/g)];assert.equal(stops.length,2);
   let worst=background;
   for(const [,r,g,b,a] of stops.reverse()){
    assert(+a>=0&&+a<=100);worst=mix(worst,[+r,+g,+b],+a/100);
   }
   surfaces.push(worst);
  }
  const opacity=Number(declaration(rule(css,prefix+'grain::before'),'opacity'));
  assert(Number.isFinite(opacity)&&opacity>=0&&opacity<=1);
  surfaces.push(mix(background,[0,0,0],opacity),mix(background,[255,255,255],opacity));
  for(const surface of surfaces)assert(contrast(text,surface)>=4.5,'actual default foreground contrast');
 }
}
test('actual CSS default contrast and bad foreground/opacity negatives, not every host',()=>{
 const css=read('assets/quiet-surfaces/quiet-surfaces.css');inspectDefaultContrast(css);
 assert.throws(()=>inspectDefaultContrast(css.replace('color: #20382a;','color: #f3f5f2;')),/actual default foreground contrast/);
 assert.throws(()=>inspectDefaultContrast(css.replace('opacity: 0.085;','opacity: 1;')),/actual default foreground contrast/);
 assert.equal(contrast([0,0,0],[255,255,255]),21);assert.equal(contrast([80,80,80],[80,80,80]),1);
});
test('existing native discovery advertises one eligible cinematic owner and its useful routes',async()=>{
 const native=resolve(process.env.HOME,'.local/lib/node_modules/prime-agent/dist');
 const {loadSkills,formatSkillsForPrompt}=await import(pathToFileURL(resolve(native,'core/skills.js')).href);
 const result=loadSkills({cwd:skills,agentDir:resolve(skills,'not-an-agent'),includeDefaults:false,skillPaths:[root]});
 assert.deepEqual(result.diagnostics,[]);assert.equal(result.skills.length,1);
 assert.equal(result.skills[0].name,'cinematic-ui');assert.equal(result.skills[0].disableModelInvocation,false);
 assert(result.skills[0].description.length<=1024);assert(formatSkillsForPrompt(result.skills).includes('cinematic-ui'));
 assert(read('SKILL.md').includes('references/production-scenes.md'));assert(read('SKILL.md').includes('references/quiet-surfaces.md'));
 assert(!existsSync(resolve(skills,'auteur/SKILL.md')));
});
