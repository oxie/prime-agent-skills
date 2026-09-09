import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {DefaultResourceLoader,SettingsManager} from '/home/prime-agent/.local/lib/node_modules/prime-agent/dist/index.js';
const skill=resolve(process.argv[2]);
const discovery=process.argv.includes('--discovery');
const cwd=mkdtempSync(join(tmpdir(),'prime-code-nav-loader-'));
try {
 const loader=new DefaultResourceLoader({cwd,agentDir:'/home/prime-agent/.prime/agent',settingsManager:SettingsManager.inMemory({packages:[]}),additionalSkillPaths:discovery?[]:[skill],noSkills:!discovery,noExtensions:true,noPromptTemplates:true,noThemes:true,noContextFiles:true,bundledSkillsDir:null,systemPrompt:'',appendSystemPrompt:[]});
 await loader.reload();
 const resources=loader.getSkills();
 if (process.argv.includes('--expect-absent')) {
  assert.equal(resources.skills.filter(x=>x.name==='code-navigation').length,0);
  console.log('CODE_NAV_NATIVE_ABSENCE_OK');
 } else {
 if (!discovery) assert.equal(resources.skills.length,1,JSON.stringify(resources.diagnostics));
 const matches=resources.skills.filter(x=>x.name==='code-navigation');
 assert.equal(matches.length,1);
 assert.equal(resolve(matches[0].filePath),join(skill,'SKILL.md'));
 assert.ok(matches[0].description.includes('cross-file'));
 assert.ok(!resources.diagnostics.some(x=>x.type==='error'));
 assert.equal(loader.getExtensions().extensions.length,0);
 const text=readFileSync(join(skill,'SKILL.md'),'utf8');
 assert.ok(text.includes('scripts/code_nav.py'));
 console.log('CODE_NAV_FRESH_NATIVE_LOADING_OK');
 }
} finally {rmSync(cwd,{recursive:true,force:true});}
