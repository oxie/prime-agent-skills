import { createHash, randomUUID } from 'node:crypto';
import { accessSync, constants, statSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';

export const GUIDANCE = 'Optional marketing, advertising, measurement, SEO, pricing, research, copy, social and media skills: use discover_skills search by request, get by exact name, or full for the complete catalogue. Rediscover on domain changes, ambiguity or skill references. Read SKILL.md before use; resolve relative paths from its directory. Discovery grants no permission.';
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const normalize = text => text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const includesPhrase = (text, phrase) => (` ${text} `).includes(` ${normalize(phrase)} `);
const aliases = {
  ads: ['ppc', 'paid', 'campaign', 'targeting', 'retargeting', 'roas'],
  'ad-creative': ['ppc', 'paid ad', 'ad variants', 'ad headlines', 'ad copy', 'ad creative', 'creative testing'],
  analytics: ['ga4', 'conversion events', 'tracking', 'instrumentation', 'event tracking'],
  attribution: ['revenue disagree', 'attribution', 'incrementality', 'revenue', 'cac'],
  'customer-research': ['customer interviews', 'customer research', 'voice of customer', 'voc', 'jtbd', 'personas', 'survey'],
  'seo-audit': ['seo', 'ranking', 'crawl', 'indexing', 'search engine'],
  'ai-seo': ['aeo', 'geo', 'llmo', 'ai generated answers', 'ai search', 'ai visibility', 'ai citations'],
  schema: ['json ld', 'structured data', 'schema markup'],
  'marketing-plan': ['marketing plan', 'growth plan', 'gtm plan'],
  pricing: ['pricing', 'price', 'monetization', 'packaging'],
  video: ['video', 'explainer', 'remotion'],
  image: ['image', 'graphic', 'mockup'],
  'sales-enablement': ['sales one pager', 'one pager', 'sales collateral', 'pitch deck', 'objection handling'],
  copywriting: ['homepage copy', 'copy', 'headlines', 'landing page', 'value proposition'],
  social: ['organic posts', 'social', 'linkedin', 'twitter', 'instagram', 'tiktok'],
};

// Hash native parsed metadata, not a second frontmatter parser. Source identity
// is checked separately against the exact canonical file and base directory.
export function metadataFingerprint(skill) {
  return hash([skill.name, skill.description, skill.kind, skill.disableModelInvocation, skill.python ?? null]);
}

export function createCatalog(skills) {
  if (!Array.isArray(skills)) throw new Error('Invalid native skill snapshot');
  const names = new Set(), paths = new Set();
  const copied = skills.map(skill => {
    if (!skill || typeof skill.name !== 'string' || !skill.name ||
        typeof skill.description !== 'string' || typeof skill.filePath !== 'string' ||
        typeof skill.baseDir !== 'string' || typeof skill.disableModelInvocation !== 'boolean' ||
        !['markdown', 'python'].includes(skill.kind) ||
        (skill.kind === 'python' && typeof skill.python?.importName !== 'string') ||
        names.has(skill.name) || paths.has(skill.filePath)) throw new Error('Invalid native skill metadata');
    names.add(skill.name); paths.add(skill.filePath);
    return structuredClone(skill);
  }).filter(skill => !skill.disableModelInvocation)
    .sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
  // A fresh native snapshot invalidates cursors even after a no-change reload.
  return { id: hash([randomUUID(), copied]), skills: copied };
}

function matches(skill, query) {
  const text = normalize(query);
  return includesPhrase(text, skill.name) || (aliases[skill.name] ?? []).some(alias => includesPhrase(text, alias));
}

export function selectSkills(catalog, query, cohort, skillRoot) {
  if (typeof query !== 'string' || !Array.isArray(cohort?.skills)) throw new Error('Invalid selection');
  const reviewed = new Map(cohort.skills.map(entry => [entry.name, entry]));
  return catalog.skills.filter(skill => {
    const entry = reviewed.get(skill.name);
    if (!entry || skill.kind !== 'markdown' || skill.disableModelInvocation ||
        Object.keys(skill).some(key => !['name', 'description', 'kind', 'disableModelInvocation',
          'python', 'filePath', 'baseDir', 'sourceInfo'].includes(key)) ||
        metadataFingerprint(skill) !== entry.fingerprint) return true;
    const expected = resolve(skillRoot, entry.path);
    // An unexpected symlink/override is visible, not silently trusted.
    try {
      if (resolve(skill.filePath) !== expected || realpathSync(skill.filePath) !== expected ||
          resolve(skill.baseDir) !== resolve(expected, '..')) return true;
    } catch { return true; }
    return matches(skill, query);
  });
}

function readable(skill) {
  try { accessSync(skill.filePath, constants.R_OK); return statSync(skill.filePath).isFile(); }
  catch { return false; }
}

export function discover(catalog, params) {
  const action = params?.action;
  const result = { action, status: 'ok', snapshot: catalog?.id ?? null, skills: [], nextCursor: null,
    complete: true, fallback: { action: 'full' }, guidance: GUIDANCE };
  if (!catalog) return { ...result, status: 'unavailable' };
  if (!['search', 'get', 'list', 'full'].includes(action) ||
      (params.limit !== undefined && (!Number.isInteger(params.limit) || params.limit < 1 || params.limit > 100)) ||
      ['query', 'name', 'cursor'].some(key => params[key] !== undefined && typeof params[key] !== 'string'))
    return { ...result, status: 'invalid_request' };
  if (action === 'get') {
    const skill = catalog.skills.find(skill => skill.name === params.name);
    if (!skill) return { ...result, status: 'not_found' };
    if (!readable(skill)) return { ...result, status: 'unavailable' };
    return { ...result, skills: [structuredClone(skill)] };
  }
  if (action === 'search') {
    if (!params.query?.trim()) return { ...result, status: 'invalid_request' };
    // Union, never top-K: limit applies only to catalogue pagination.
    const found = catalog.skills.filter(skill => matches(skill, params.query));
    if (found.some(skill => !readable(skill))) return { ...result, status: 'unavailable' };
    return { ...result, skills: structuredClone(found) };
  }
  const limit = params.limit ?? 25;
  let offset = 0;
  if (params.cursor !== undefined) {
    const match = /^([a-f0-9]{64}):(0|[1-9][0-9]*)$/.exec(params.cursor);
    if (!match || match[1] !== catalog.id || !Number.isSafeInteger(Number(match[2])) || Number(match[2]) >= catalog.skills.length)
      return { ...result, status: 'stale_cursor' };
    offset = Number(match[2]);
  }
  const page = catalog.skills.slice(offset, offset + limit);
  if (page.some(skill => !readable(skill))) return { ...result, status: 'unavailable' };
  const complete = offset + page.length >= catalog.skills.length;
  return { ...result, skills: structuredClone(page), complete,
    nextCursor: complete ? null : `${catalog.id}:${offset + page.length}` };
}

export function rewritePayload(payload, options) {
  try {
    const { api, sessionId, systemPrompt, fullFragment, selectedFragment, activeTools, allowed } = options;
    if (!allowed || api !== 'openai-codex-responses' || !payload ||
        Object.getPrototypeOf(payload) !== Object.prototype ||
        typeof sessionId !== 'string' || !sessionId || payload.prompt_cache_key !== sessionId ||
        typeof payload.instructions !== 'string' || payload.instructions !== systemPrompt ||
        !Array.isArray(payload.input) || !Array.isArray(payload.tools) ||
        !activeTools?.includes('discover_skills') ||
        !payload.tools.some(tool => tool?.type === 'function' && tool.name === 'discover_skills') ||
        typeof fullFragment !== 'string' || !fullFragment || typeof selectedFragment !== 'string' ||
        fullFragment === selectedFragment) return undefined;
    const offset = payload.instructions.indexOf(fullFragment);
    if (offset < 0 || payload.instructions.indexOf(fullFragment, offset + 1) >= 0) return undefined;
    return { ...payload, instructions: payload.instructions.slice(0, offset) + selectedFragment +
      '\n\n' + GUIDANCE + payload.instructions.slice(offset + fullFragment.length) };
  } catch { return undefined; }
}
