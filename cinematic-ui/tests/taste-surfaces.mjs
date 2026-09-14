// Dependency-free source contracts and small state/placement models, NOT renderer proof.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { mountCraft } from '../assets/taste-craft/demo.mjs';

const read = name => readFileSync(new URL(`../assets/taste-craft/${name}`, import.meta.url), 'utf8');
const css = read('craft.css');
const demo = read('demo.css');
const html = read('index.html');
const script = read('demo.mjs');
const clean = text => text.replace(/\/\*[\s\S]*?\*\//g, '');
const rules = text => [...clean(text).matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .map(([, selector, body]) => ({ selector: selector.trim(), body }));
const rule = (text, selector) => {
  const result = rules(text).find(item => item.selector === selector);
  assert.ok(result, `Missing CSS rule: ${selector}`);
  return result.body;
};
const shellSelector = '.cui-bezel';
const coreSelector = '.cui-bezel > .cui-bezel__core';
const lastSelector = '.cui-gap-grid > .cui-gap-grid__cell:last-child:nth-child(odd)';

function scopeContract(text) {
  assert.ok(rules(text).length >= 12);
  for (const { selector, body } of rules(text)) {
    for (const part of selector.split(',')) {
      assert.match(part.trim(), /^(?:button)?\.cui-(?:bezel|inset-control|gap-grid)(?:[.:[\s]|$)/);
    }
    assert.doesNotMatch(body, /(?:^|;)\s*--[\w-]+\s*:/, 'Consume host tokens, never overwrite them');
  }
  assert.doesNotMatch(clean(text), /(?:overflow(?:-\w+)?\s*:\s*(?:hidden|clip)|clip-path\s*:|outline\s*:\s*(?:none|0)|!important|position\s*:\s*fixed|forced-color-adjust\s*:\s*none)/);
  assert.doesNotMatch(clean(text), /(?:@import|url\s*\(|animation\s*:|transition\s*:|filter\s*:|will-change\s*:|\border\s*:)/);
}
test('library stays scoped, static, token-consuming and unclipped', () => scopeContract(css));
test('negative controls reject global selectors, clipping and token ownership leaks', () => {
  assert.throws(() => scopeContract(css.replace('.cui-bezel {', 'body {')));
  assert.throws(() => scopeContract(css + '\n.cui-bezel { overflow: hidden; }'));
  assert.throws(() => scopeContract(css + '\n.cui-bezel { --cui-tc-ink: red; }'));
});

function resolveLengths(expression, tokens) {
  return expression.replace(/var\((--[\w-]+), (\d+(?:\.\d+)?)px\)/g,
    (_, token, fallback) => `${tokens[token] ?? fallback}px`);
}
function geometryContract(text) {
  const shell = rule(text, shellSelector);
  const core = rule(text, coreSelector);
  const radius = shell.match(/border-radius: ([^;]+);/)[1];
  const padding = shell.match(/padding: ([^;]+);/)[1];
  const border = shell.match(/border: (var\([^)]+\)) solid/)[1];
  const equation = core.match(/border-radius: max\(0px, calc\((.*?)\)\);/)[1];
  const number = (value, tokens) => {
    const resolved = resolveLengths(value, tokens);
    assert.match(resolved, /^\d+(?:\.\d+)?px$/);
    return Number.parseFloat(resolved);
  };
  for (const tokens of [{},
    { '--cui-tc-radius': 32, '--cui-tc-border-width': 3, '--cui-tc-inset': 8 },
    { '--cui-tc-radius': 4, '--cui-tc-border-width': 2, '--cui-tc-inset': 6 },
    { '--cui-tc-radius': 0, '--cui-tc-border-width': 0, '--cui-tc-inset': 0 },
  ]) {
    const operands = resolveLengths(equation, tokens).split(' - ');
    const actual = Math.max(0, operands.map(part => number(part, {})).reduce((a, b) => a - b));
    const expected = Math.max(0, number(radius, tokens) - number(border, tokens) - number(padding, tokens));
    assert.equal(actual, expected, 'Core radius must subtract the complete shell inset');
  }
  assert.match(shell, /box-sizing: border-box/);
  assert.match(core, /border: 1px solid/);
}
test('actual radius equation includes shell border plus padding and zero clamp', () => geometryContract(css));
test('negative geometry controls reject missing border, padding and wrong sign', () => {
  for (const broken of [
    css.replace(' - var(--cui-tc-border-width, 1px)', ''),
    css.replace(' - var(--cui-tc-inset, 6px)', ''),
    css.replace(' - var(--cui-tc-inset, 6px)', ' + var(--cui-tc-inset, 6px)'),
  ]) assert.throws(() => geometryContract(broken));
});

function gridContract(text) {
  const grid = rule(text, '.cui-gap-grid');
  const cell = rule(text, '.cui-gap-grid > .cui-gap-grid__cell');
  assert.match(grid, /display: grid/);
  assert.match(grid, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(grid, /gap: 1px/);
  assert.match(grid, /padding: 1px/);
  assert.match(grid, /background: var\(--cui-tc-line, #[\da-f]{6}\)/);
  assert.match(cell, /background: var\(--cui-tc-core, #[\da-f]{6}\)/);
  assert.match(cell, /min-inline-size: 0/);
  assert.match(rule(text, lastSelector), /grid-column: 1 \/ -1/);
  assert.match(rule(text, '.cui-gap-grid:empty'), /display: none/);
  assert.doesNotMatch(clean(text), /(?:dense|grid-auto-flow|\border\s*:)/);
  const narrow = text.slice(text.indexOf('@media (max-width: 42rem)'), text.indexOf('@media (forced-colors: active)'));
  assert.match(rule(narrow, '.cui-gap-grid'), /grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(rule(narrow, lastSelector), /grid-column: auto/);
  // Model only the explicit two-column span strategy confirmed above, not layout.
  for (const count of [0, 1, 2, 3, 4, 5, 6, 7]) {
    const rows = [];
    for (let index = 0; index < count; index++) {
      const row = Math.floor(index / 2);
      const width = index === count - 1 && count % 2 ? 2 : 1;
      (rows[row] ??= []).push({ index, width });
    }
    assert.deepEqual(rows.flat().map(item => item.index), Array.from({ length: count }, (_, i) => i));
    assert.ok(rows.every(row => row.reduce((sum, item) => sum + item.width, 0) === 2), 'No unpainted last track');
  }
}
test('actual one-pixel parent gap and ragged-row strategy cover 0–7 items in DOM order', () => gridContract(css));
test('negative grid controls reject missing final span, filler strategy and changed columns', () => {
  assert.throws(() => gridContract(css.replace('grid-column: 1 / -1', 'grid-column: auto')));
  assert.throws(() => gridContract(css.replace('repeat(2,', 'repeat(3,')));
  assert.throws(() => gridContract(css + '\n.cui-gap-grid { grid-auto-flow: dense; }'));
});

test('forced colors uses real grid and cell borders rather than recoloring absent borders', () => {
  const forced = css.slice(css.indexOf('@media (forced-colors: active)'));
  for (const selector of ['.cui-gap-grid', '.cui-gap-grid > .cui-gap-grid__cell']) {
    const body = rule(forced, selector);
    assert.match(body, /border: 1px solid CanvasText/);
    assert.match(body, /color: CanvasText/);
    assert.match(body, /background: Canvas/);
  }
  assert.match(forced, /border-color: CanvasText/);
  assert.match(rule(forced, 'button.cui-inset-control:focus-visible'), /outline-color: CanvasText/);
});

function luminance(hex) {
  assert.match(hex, /^#[\da-f]{6}$/i);
  return [1, 3, 5].map(i => Number.parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
    .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
}
function contrast(a, b) {
  const [lo, hi] = [luminance(a), luminance(b)].sort((a, b) => a - b);
  return (hi + 0.05) / (lo + 0.05);
}
function palette(text, preset = '') {
  const pairs = [...text.matchAll(/var\(--cui-tc-([\w-]+), (#[\da-f]{6})\)/gi)].map(([, k, v]) => [k, v]);
  const overrides = [...preset.matchAll(/--cui-tc-([\w-]+): (#[\da-f]{6})/gi)].map(([, k, v]) => [k, v]);
  return Object.fromEntries([...pairs, ...overrides]);
}
function contrastContract(text, preset = '') {
  const p = palette(text, preset);
  for (const fill of ['core', 'tray']) {
    assert.ok(contrast(p.ink, p[fill]) >= 4.5, `Text on ${fill}`);
    assert.ok(contrast(p.line, p[fill]) >= 3, `Control border on ${fill}`);
    assert.ok(contrast(p.focus, p[fill]) >= 3, `Focus on ${fill}`);
  }
  const background = preset.match(/\n  background: (#[\da-f]{6});/i)?.[1];
  if (background) {
    assert.ok(contrast(p.ink, background) >= 4.5, 'Section text');
    assert.ok(contrast(p.focus, background) >= 3, 'Focus against section ground');
  }
}
test('actual opaque fallback and both fixture palettes meet bounded contrast arithmetic', () => {
  contrastContract(css);
  for (const name of ['print', 'telemetry']) contrastContract(css, rule(demo, `.craft-demo .preset--${name}`));
});
test('negative contrast controls reject actual foreground, border and dark-pair regressions', () => {
  assert.throws(() => contrastContract(css.replaceAll('#20211e', '#faf9f4')));
  assert.throws(() => contrastContract(css.replaceAll('#66645e', '#faf9f4')));
  const dark = rule(demo, '.craft-demo .preset--telemetry');
  assert.throws(() => contrastContract(css, dark.replace('#171d1a', '#e8f0e9')));
});

test('fixture preserves single native controls, inert arrow, truthful labels and neutral host', () => {
  const buttons = [...html.matchAll(/<button\b([^>]+)>([\s\S]*?)<\/button>/g)];
  assert.equal(buttons.length, 2);
  for (const [, attributes, body] of buttons) {
    assert.match(attributes, /type="button"/);
    assert.match(attributes, /aria-pressed="false"/);
    assert.match(attributes, /\bdisabled\b/);
    assert.match(attributes, /data-craft-toggle/);
    assert.doesNotMatch(body, /<(?:button|a|input)\b|tabindex/);
    assert.match(body, /class="cui-inset-control__arrow" aria-hidden="true"/);
    const id = attributes.match(/aria-describedby="([^"]+)"/)[1];
    assert.ok(html.includes(`id="${id}" data-craft-status role="status"`));
  }
  assert.match(rule(css, 'button.cui-inset-control > .cui-inset-control__arrow'), /pointer-events: none/);
  assert.match(rule(css, 'button.cui-inset-control'), /min-block-size: 44px/);
  assert.match(rule(css, 'button.cui-inset-control:focus-visible'), /outline: 3px solid/);
  const neutral = html.match(/<div class="neutral-host">[\s\S]*?<\/div>/)[0];
  assert.doesNotMatch(neutral, /cui-|preset/);
  assert.match(neutral, /<label for="host-note">/);
  assert.match(neutral, /<input id="host-note" type="text"/);
  assert.equal((html.match(/<dl class="cui-gap-grid">/g) || []).length, 2);
  assert.equal((html.match(/class="cui-gap-grid__cell"/g) || []).length, 8);
  for (const [, url] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    assert.ok(url.startsWith('./') || (url.startsWith('#') && html.includes(`id="${url.slice(1)}"`)), url);
  }
  assert.match(html, /no live connection/);
  assert.match(html, /Nothing is saved or sent/);
  assert.doesNotMatch(script, /(?:fetch\s*\(|XMLHttpRequest|setInterval|setTimeout|requestAnimationFrame|keydown|localStorage|sessionStorage)/);
  assert.doesNotMatch(script, /typeof document|mountCraft\(document\)/, 'No import side effects');
});

function fakeRoot(withStatus = true) {
  const attrs = new Map([['aria-pressed', 'false'], ['aria-describedby', 'status']]);
  const listeners = new Map();
  const button = {
    disabled: true,
    getAttribute: name => attrs.get(name) ?? null,
    setAttribute: (name, value) => attrs.set(name, value),
    removeAttribute: name => attrs.delete(name),
    addEventListener: (name, callback) => {
      const set = listeners.get(name) ?? new Set(); set.add(callback); listeners.set(name, set);
    },
    removeEventListener: (name, callback) => {
      listeners.get(name)?.delete(callback);
      if (!listeners.get(name)?.size) listeners.delete(name);
    },
  };
  const status = { id: 'status', textContent: 'Local toggle unavailable until script loads.' };
  const root = { querySelectorAll: selector => {
    if (selector === '[data-craft-status]') return withStatus ? [status] : [];
    assert.equal(selector, 'button[data-craft-toggle]'); return [button];
  } };
  const click = () => listeners.get('click')?.forEach(callback => callback());
  return { root, button, status, listeners, click };
}
function behaviorContract(mount) {
  const a = fakeRoot(); const b = fakeRoot();
  const cleanup = mount(a.root); const cleanupB = mount(b.root);
  try {
    assert.equal(mount(a.root), cleanup, 'Idempotent root setup');
    assert.equal(a.button.disabled, false);
    assert.equal(a.listeners.get('click').size, 1);
    assert.match(a.status.textContent, /^Emphasis off/);
    a.click();
    assert.equal(a.button.getAttribute('aria-pressed'), 'true');
    assert.match(a.status.textContent, /^Emphasis on in this example only/);
    assert.equal(b.button.getAttribute('aria-pressed'), 'false', 'Root state must remain local');
    assert.match(b.status.textContent, /^Emphasis off/);
    a.click();
    assert.equal(a.button.getAttribute('aria-pressed'), 'false');
    assert.match(a.status.textContent, /^Emphasis off/);
  } finally { cleanup(); cleanupB(); }
  assert.equal(a.button.disabled, true);
  assert.equal(a.button.getAttribute('aria-pressed'), 'false');
  assert.equal(a.status.textContent, 'Local toggle unavailable until script loads.');
  assert.equal(a.listeners.size, 0);
  cleanup();
  const remount = mount(a.root);
  a.click(); assert.equal(a.button.getAttribute('aria-pressed'), 'true');
  remount(); assert.equal(a.listeners.size, 0);
}
test('actual initializer toggles locally, supports independent roots, cleanup and remount', () => behaviorContract(mountCraft));
test('missing status keeps disabled baseline without a listener', () => {
  const a = fakeRoot(false); const cleanup = mountCraft(a.root);
  assert.equal(a.button.disabled, true);
  assert.equal(a.listeners.size, 0);
  cleanup();
});
test('negative local-state control rejects a mutated actual module', async () => {
  const broken = script.replace('String(pressed)', 'String(!pressed)');
  assert.notEqual(broken, script);
  const module = await import(`data:text/javascript;base64,${Buffer.from(broken).toString('base64')}`);
  assert.throws(() => behaviorContract(module.mountCraft));
});
