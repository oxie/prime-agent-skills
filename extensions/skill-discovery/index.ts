import type { ExtensionAPI } from '@earendil-works/pi-coding-agent';
import { formatSkillsForPrompt } from '@earendil-works/pi-coding-agent';
import { Type } from '@sinclair/typebox';
import { readFileSync, realpathSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCatalog, discover, selectSkills, rewritePayload } from './catalog.mjs';

export default function skillDiscovery(pi: ExtensionAPI) {
  // Resolve the source, not the registration symlink; isolated worktrees retain
  // their own cohort root and cannot accidentally qualify live overrides.
  const directory = dirname(realpathSync(fileURLToPath(import.meta.url)));
  const skillRoot = resolve(directory, '../..');
  const cohort = JSON.parse(readFileSync(resolve(directory, 'cohort.json'), 'utf8'));
  const states = new Map<string, any>();
  const clear = (_event, ctx) => { states.delete(ctx.sessionManager.getSessionId()); };
  for (const event of ['session_start', 'session_before_switch', 'session_before_fork',
    'session_before_tree', 'session_tree', 'session_before_compact', 'session_compact',
    'session_before_refine', 'session_shutdown'] as const) pi.on(event, clear);
  pi.on('agent_end', (_event, ctx) => {
    const state = states.get(ctx.sessionManager.getSessionId());
    if (state) state.allowed = false;
  });
  pi.on('before_agent_start', (event, ctx) => {
    const id = ctx.sessionManager.getSessionId();
    states.delete(id);
    try {
      const skills = event.systemPromptOptions?.skills;
      const catalog = createCatalog(skills);
      const selected = selectSkills(catalog, event.prompt, cohort, skillRoot);
      states.set(id, { catalog, cwd: ctx.cwd, full: false, allowed: true,
        fullFragment: formatSkillsForPrompt(skills),
        selectedFragment: formatSkillsForPrompt(skills.filter(skill => selected.some(item => item.name === skill.name))) });
    } catch { /* Unsupported metadata keeps the original native prompt. */ }
    // Never return systemPrompt: native late policy rebuilds remain authoritative.
  });
  pi.on('before_provider_request', (event, ctx) => {
    const id = ctx.sessionManager.getSessionId();
    const state = states.get(id);
    if (!state) return;
    const allowed = state.allowed && !state.full && state.cwd === ctx.cwd;
    state.allowed = false; // Retry, continuation and unknown follow-ups default full.
    return rewritePayload(event.payload, {
      api: ctx.model?.api, sessionId: id, systemPrompt: ctx.getSystemPrompt(),
      fullFragment: state.fullFragment, selectedFragment: state.selectedFragment,
      activeTools: pi.getActiveTools(), allowed,
    });
  });
  pi.registerTool({
    name: 'discover_skills', label: 'Discover skills',
    description: 'Find optional skill metadata. search by request; get exact canonical name; list pages; full restores current-turn catalogue. Read SKILL.md before use. No permission grant.',
    parameters: Type.Object({
      action: Type.Union(['search', 'get', 'list', 'full'].map(value => Type.Literal(value))),
      query: Type.Optional(Type.String()), name: Type.Optional(Type.String()),
      cursor: Type.Optional(Type.String()), limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 })),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const state = states.get(ctx.sessionManager.getSessionId());
      let result;
      try {
        result = discover(state?.cwd === ctx.cwd ? state.catalog : undefined, params);
        // A complete fallback stays full for the entire turn. Other tool calls
        // do not reinstate cached selection on subsequent model requests.
        if (state && (params.action === 'full' || result.status !== 'ok')) {
          state.full = true; state.allowed = false;
        }
      } catch {
        if (state) { state.full = true; state.allowed = false; }
        result = discover(undefined, params);
      }
      return { content: [{ type: 'text', text: JSON.stringify(result) }], details: result };
    },
  });
}
