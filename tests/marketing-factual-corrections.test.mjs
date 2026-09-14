// Bounded wording regressions. These do not validate an experiment or measure model behavior.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const flat=s=>s.replace(/\s+/g,' ');
function checkStatistics(text){
 const t=flat(text);
 for(const phrase of ['under the null hypothesis and the test assumptions','at least as extreme as observed','not the probability that the null hypothesis is true','not the probability that the result is random','effect size and uncertainty'])assert(t.includes(phrase),'Missing interpretation: '+phrase);
 for(const phrase of ['95% confidence = p-value','less than 5% chance the observed difference is due to random chance','Means <5% chance result is random'])assert(!t.includes(phrase),'Incorrect interpretation: '+phrase);
}
for(const rel of ['marketingskills/skills/ab-testing/SKILL.md','marketingskills/skills/ab-testing/references/sample-size-guide.md']){
 test('p-value conditional interpretation and limits: '+rel,()=>checkStatistics(fs.readFileSync(path.join(root,rel),'utf8')));
}
test('statistical wording checker rejects deleted conditions and false interpretations',()=>{
 const positive='under the null hypothesis and the test assumptions; at least as extreme as observed; not the probability that the null hypothesis is true; not the probability that the result is random; effect size and uncertainty';
 checkStatistics(positive);
 for(const phrase of ['under the null hypothesis and the test assumptions','at least as extreme as observed','not the probability that the null hypothesis is true','not the probability that the result is random','effect size and uncertainty'])assert.throws(()=>checkStatistics(positive.replace(phrase,'')),/Missing interpretation/);
 assert.throws(()=>checkStatistics(positive+' Means <5% chance result is random'),/Incorrect interpretation/);
});

const crawlerClauses=[
  {
    "id": "openai-search",
    "clause": "OAI-SearchBot supports ChatGPT search independently of GPTBot training.",
    "file": "SKILL.md",
    "require": [
      "`OAI-SearchBot` supports ChatGPT search",
      "`GPTBot` crawls content that may be used for model training",
      "These robots.txt settings are independent."
    ]
  },
  {
    "id": "openai-user",
    "clause": "ChatGPT-User handles user-requested access, not automatic crawling; robots may not apply.",
    "file": "SKILL.md",
    "require": [
      "`ChatGPT-User` handles user-requested access, not automatic search crawling",
      "robots.txt rules may not apply"
    ]
  },
  {
    "id": "anthropic-roles",
    "clause": "Anthropic separates search, user retrieval and training, and honors robots for all three.",
    "file": "SKILL.md",
    "require": [
      "`Claude-SearchBot` supports search quality",
      "`Claude-User` handles user-requested retrieval",
      "`ClaudeBot` collects potential training content",
      "Anthropic says all three honor robots.txt directives."
    ]
  },
  {
    "id": "google-search",
    "clause": "Googlebot governs crawling for Search including AI Overviews/AI Mode.",
    "file": "SKILL.md",
    "require": [
      "`Googlebot` controls crawling for Google Search, including AI Overviews and AI Mode."
    ]
  },
  {
    "id": "google-extended",
    "clause": "Google-Extended is a product token for specified Gemini training/grounding, not Search ranking/inclusion or a distinct HTTP user agent.",
    "file": "references/platform-ranking-factors.md",
    "require": [
      "training future Gemini models powering Gemini Apps and Vertex AI API for Gemini",
      "grounding in Gemini Apps and Grounding with Google Search on Vertex AI",
      "does not affect Google Search inclusion or ranking",
      "robots.txt token, not a separate HTTP user agent"
    ]
  },
  {
    "id": "perplexity-roles",
    "clause": "Perplexity search bot is distinct from user fetches; neither role is foundation-model training; user fetches generally ignore robots.",
    "file": "SKILL.md",
    "require": [
      "`PerplexityBot` supports search discovery, not foundation-model training",
      "`Perplexity-User` handles user-requested fetches, not training or automatic crawling",
      "Perplexity says it generally ignores robots.txt"
    ]
  },
  {
    "id": "independent-user-policy",
    "clause": "Do not use an all-bots allow default or deploy policies; user retains independent decisions.",
    "file": "references/platform-ranking-factors.md",
    "require": [
      "not an allow list or a ready-to-deploy robots.txt file",
      "remain the user's independent decisions",
      "Do not default to allowing all bots or change robots.txt, CDN, or WAF rules without explicit authorization."
    ]
  },
  {
    "id": "no-guarantees",
    "clause": "Access does not guarantee outcomes; blocking does not universally remove citations; navigation exception is preserved.",
    "file": "references/platform-ranking-factors.md",
    "require": [
      "Allowing access does not guarantee indexing, citation, or recommendation.",
      "Do not promise that blocking any one crawler removes all mentions or citations through other sources.",
      "may still appear as navigational links"
    ]
  },
  {
    "id": "access-audit",
    "clause": "Training blocks are not visibility failures; audit against approved policy without weakening safeguards.",
    "file": "references/agent-readiness.md",
    "require": [
      "Blocking `GPTBot` or `ClaudeBot` is not a blanket search-visibility failure.",
      "Do not weaken security controls",
      "not a blanket allow/block list",
      "Do not assume a robots.txt statement universally enforces training, citation, or summarization preferences"
    ]
  },
  {
    "id": "dated-primary-sources",
    "clause": "Reference names all four primary-source owners and date.",
    "file": "references/platform-ranking-factors.md",
    "require": [
      "checked 2026-09-14",
      "https://developers.openai.com/api/docs/bots",
      "https://support.claude.com/en/articles/8896518-",
      "https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers#google-extended",
      "https://developers.google.com/search/docs/appearance/ai-features#control",
      "https://docs.perplexity.ai/docs/resources/perplexity-crawlers"
    ]
  },
  {
    "id": "reject-conflations",
    "clause": "Reject old blanket crawler/citation claims and unsupported alternate alias in the three revised files.",
    "files": [
      "SKILL.md",
      "references/platform-ranking-factors.md",
      "references/agent-readiness.md"
    ],
    "reject": [
      "anthropic-ai",
      "GPTBot handles both for OpenAI",
      "OpenAI \u2014 powers ChatGPT search",
      "Google Gemini and AI Overviews",
      "Allow all AI bots in robots.txt",
      "Allow: /",
      "Block the bot, lose the citation",
      "blocking it means that platform can't cite you",
      "blocking prevents AI training on your content but also prevents citation",
      "those engines literally cannot cite you",
      "those platforms can't cite you",
      "that platform can't cite your content",
      "self-inflicted invisibility",
      "Allow ClaudeBot",
      "Ensure Bingbot has full crawl access"
    ]
  }
];
const aiRead=rel=>fs.readFileSync(path.join(root,'marketingskills/skills/ai-seo',rel),'utf8');
function checkCrawler(text,required=[],rejected=[]){
 const t=flat(text);
 for(const p of required)assert(t.includes(p),'Missing crawler contract: '+p);
 for(const p of rejected)assert(!t.includes(p),'Old conflation: '+p);
}
for(const c of crawlerClauses){
 test('crawler roles: '+c.id,()=>{
  if(c.file)checkCrawler(aiRead(c.file),c.require);
  else for(const file of c.files)checkCrawler(aiRead(file),[],c.reject);
 });
}
test('crawler checker rejects each removed safeguard and each old conflation',()=>{
 for(const c of crawlerClauses){
  if(c.require){const positive=c.require.join(' | ');checkCrawler(positive,c.require);
   for(const p of c.require)assert.throws(()=>checkCrawler(positive.replace(p,''),c.require));
  }else for(const p of c.reject)assert.throws(()=>checkCrawler(p,[],c.reject));
 }
});
