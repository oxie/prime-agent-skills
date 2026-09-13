// Native, dependency-free source contracts. Not a CSS parser or browser audit.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { mountDemo } from '../assets/material-surfaces/demo.mjs';

const asset = name => readFileSync(new URL(`../assets/material-surfaces/${name}`, import.meta.url), 'utf8');
const css = asset('surfaces.css');
const demo = asset('demo.css');
const html = asset('index.html');
const script = asset('demo.mjs');
const clean = text => text.replace(/\/\*[\s\S]*?\*\//g, '');
const rules = text => [...clean(text).matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .map(([, selector, body]) => ({ selector: selector.trim(), body }));
const rule = (text, selector) => {
  const found = rules(text).find(entry => entry.selector === selector);
  assert.ok(found, `Missing actual CSS selector: ${selector}`);
  return found.body;
};
function scopeContract(text) {
  const parsed = rules(text);
  assert.ok(parsed.length > 10);
  for (const { selector } of parsed) {
    for (const part of selector.split(',')) {
      assert.match(part.trim(), /^(?:button)?\.cui-material(?:[.:[\s]|$)/);
      assert.doesNotMatch(part, /(?:^|\s)(?:body|html|:root|\*)\b/);
    }
  }
  assert.doesNotMatch(clean(text), /(?:overflow(?:-\w+)?\s*:\s*(?:hidden|clip)|clip-path\s*:|outline\s*:\s*(?:none|0)|!important|position\s*:\s*fixed|forced-color-adjust\s*:\s*none)/);
  assert.doesNotMatch(clean(text), /(?:@import|url\s*\(|animation\s*:|transition\s*:|filter\s*:|will-change\s*:)/);
  for (const { body } of parsed) assert.doesNotMatch(body, /(?:^|;)\s*--[\w-]+\s*:/, 'Library must consume inherited tokens, not overwrite them');
}

test('actual library rules stay inside the explicit opt-in scope', () => scopeContract(css));
test('scope contract rejects global reach and clipped focus regressions', () => {
  assert.throws(() => scopeContract(css.replace('.cui-material {', 'body {')));
  assert.throws(() => scopeContract(css.replace('isolation: isolate;', 'isolation: isolate; overflow: hidden;')));
  assert.throws(() => scopeContract(css + '\n.cui-material { --host-color: red; }'));
});

test('contact shadow preserves the neutral five-step falloff, not a glow', () => {
  const body = rule(css, '.cui-material.cui-material--contact');
  for (const layer of [
    '0 1px 1px -0.5px', '0 3px 3px -1.5px', '0 6px 6px -3px',
    '0 12px 12px -6px', '0 24px 24px -12px',
  ]) assert.ok(body.includes(`${layer} rgb(0 0 0 / 6%)`));
});

test('raised and pressed states reverse the actual gradient and shadow direction', () => {
  const raised = rule(css, 'button.cui-material.cui-material--control');
  const pressed = rule(css, 'button.cui-material.cui-material--control[aria-pressed="true"]');
  assert.match(raised, /linear-gradient\(180deg, var\(--cui-ms-top[\s\S]*var\(--cui-ms-bottom/);
  assert.match(pressed, /linear-gradient\(180deg, var\(--cui-ms-bottom[\s\S]*var\(--cui-ms-top/);
  assert.match(pressed, /inset 0 3px 6px/);
  assert.match(pressed, /inset 0 0 0 1px/);
  assert.match(raised, /min-block-size: 44px/);
  const focus = rule(css, 'button.cui-material.cui-material--control:focus-visible');
  assert.match(focus, /outline: 3px solid var\(--cui-ms-focus/);
  assert.match(focus, /outline-offset: 4px/);
});

test('masked edge is confined to decoration; rails share the panel edge', () => {
  const before = rule(css, '.cui-material.cui-material--frame::before');
  const after = rule(css, '.cui-material.cui-material--frame::after');
  for (const body of [before, after]) {
    assert.match(body, /content: ""/);
    assert.match(body, /pointer-events: none/);
    assert.match(body, /position: absolute/);
    assert.match(body, /z-index: -1/);
  }
  assert.match(before, /mask-composite: exclude/);
  assert.match(before, /-webkit-mask-composite: xor/);
  assert.match(before, /padding: 1px/);
  assert.match(before, /inset: -1px/);
  assert.match(css, /@supports \(mask-composite: exclude\) or \(-webkit-mask-composite: xor\)/);
  assert.match(after, /inset: -8px -1px/);
  assert.match(after, /border-inline: 1px solid/);
  assert.equal((after.match(/\/ 10px 1px no-repeat/g) || []).length, 4);
  for (const { selector, body } of rules(css)) {
    if (/mask(?:-composite)?\s*:/.test(body)) assert.ok(selector.endsWith('::before'));
  }
});

test('forced-colors removes decoration and keeps opaque readable control states', () => {
  const forced = css.slice(css.indexOf('@media (forced-colors: active)'));
  assert.match(forced, /color: CanvasText;\s+background: Canvas;/);
  assert.match(forced, /color: HighlightText;\s+background: Highlight;/);
  assert.match(forced, /border-color: CanvasText/);
  assert.match(forced, /outline-color: CanvasText/);
  assert.match(forced, /::before,\s*\.cui-material\.cui-material--frame::after\s*\{\s*display: none;/);
});

function channels(hex) {
  assert.match(hex, /^#[\da-f]{6}$/i);
  return [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
}
function luminance(rgb) {
  return rgb.map(x => x / 255).map(x => x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)
    .reduce((sum, x, i) => sum + x * [0.2126, 0.7152, 0.0722][i], 0);
}
function contrast(a, b) {
  const [lo, hi] = [luminance(a), luminance(b)].sort((a, b) => a - b);
  return (hi + 0.05) / (lo + 0.05);
}
function palette(text, preset) {
  const values = {};
  // Read values used by the actual CSS, not a second list of purported colors.
  for (const [, token, hex] of text.matchAll(/var\(--cui-ms-([\w-]+),\s*(#[\da-f]{6})\)/gi)) values[token] = hex;
  for (const [, token, hex] of preset.matchAll(/--cui-ms-([\w-]+):\s*(#[\da-f]{6})/gi)) values[token] = hex;
  return values;
}
function contrastContract(values) {
  const c = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, channels(v)]));
  assert.ok(contrast(c.ink, c.fill) >= 4.5, 'Opaque body text');
  // Sample every 1% of the implemented opaque two-stop sRGB control gradient.
  for (let i = 0; i <= 100; i++) {
    const bg = c.top.map((v, k) => v + (c.bottom[k] - v) * i / 100);
    assert.ok(contrast(c.ink, bg) >= 4.5, `Control text at ${i}%`);
    assert.ok(contrast(c.line, bg) >= 3, `Control border at ${i}%`);
    assert.ok(contrast(c.focus, bg) >= 3, `Focus/control at ${i}%`);
  }
}
test('actual light fallbacks and dark override colors meet bounded text/boundary checks', () => {
  contrastContract(palette(css, ''));
  contrastContract(palette(css, rule(demo, '.preset--dark')));
});
test('contrast check rejects a real CSS foreground regression', () => {
  assert.throws(() => contrastContract(palette(css.replace('#242628', '#f5f5f3'), '')));
});

test('fixture has two honest disabled native controls and local resources only', () => {
  const buttons = [...html.matchAll(/<button\b([^>]+)>([^<]+)<\/button>/g)];
  assert.equal(buttons.length, 2);
  for (const [, attrs, label] of buttons) {
    assert.match(attrs, /type="button"/);
    assert.match(attrs, /aria-pressed="false"/);
    assert.match(attrs, /\bdisabled\b/);
    assert.match(attrs, /data-material-toggle/);
    assert.ok(label.length > 20);
    const id = attrs.match(/aria-describedby="([^"]+)"/)[1];
    assert.ok(html.includes(`id="${id}" role="status"`));
  }
  assert.equal((html.match(/cui-material--contact/g) || []).length, 2);
  assert.equal((html.match(/cui-material--frame/g) || []).length, 2);
  const neutral = html.match(/<div class="neutral-host"[\s\S]*?<\/div>/)[0];
  assert.doesNotMatch(neutral, /cui-material/);
  assert.match(neutral, /<label for="host-note">/);
  for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    assert.ok(url.startsWith('./') || (url.startsWith('#') && url.length > 1), url);
    if (url.startsWith('#')) assert.ok(html.includes(`id="${url.slice(1)}"`), `Unresolved ${url}`);
  }
  assert.doesNotMatch(script, /(?:fetch\s*\(|setInterval|requestAnimationFrame|keydown|localStorage)/);
});

function fakeRoot(withStatus = true) {
  const attrs = new Map([['aria-pressed', 'false'], ['aria-describedby', 'status']]);
  const listeners = new Map();
  const button = {
    disabled: true,
    getAttribute: name => attrs.get(name),
    setAttribute: (name, value) => attrs.set(name, value),
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: (name, callback) => { if (listeners.get(name) === callback) listeners.delete(name); },
  };
  const status = { textContent: 'Unavailable until demo script loads.' };
  const root = {
    querySelectorAll: selector => { assert.equal(selector, 'button[data-material-toggle]'); return [button]; },
    getElementById: id => { assert.equal(id, 'status'); return withStatus ? status : null; },
  };
  return { root, button, status, listeners };
}
test('actual demo handler toggles both ways and cleanup restores disabled baseline', () => {
  const { root, button, status, listeners } = fakeRoot();
  const cleanup = mountDemo(root);
  assert.equal(button.disabled, false);
  assert.match(status.textContent, /^Not pinned/);
  assert.deepEqual([...listeners.keys()], ['click']);
  listeners.get('click')();
  assert.equal(button.getAttribute('aria-pressed'), 'true');
  assert.match(status.textContent, /^Pinned in this example only/);
  listeners.get('click')();
  assert.equal(button.getAttribute('aria-pressed'), 'false');
  assert.match(status.textContent, /^Not pinned/);
  cleanup();
  assert.equal(button.disabled, true);
  assert.equal(button.getAttribute('aria-pressed'), 'false');
  assert.equal(status.textContent, 'Unavailable until demo script loads.');
  assert.equal(listeners.size, 0);
});
test('missing description keeps the demo control honestly unavailable', () => {
  const { root, button, listeners } = fakeRoot(false);
  mountDemo(root)();
  assert.equal(button.disabled, true);
  assert.equal(listeners.size, 0);
});
