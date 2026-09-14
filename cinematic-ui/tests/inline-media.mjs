// Source-only contracts for the actual static fixture. No DOM/layout engine.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const assetURL = name => new URL(`../assets/inline-media/${name}`, import.meta.url);
const asset = name => readFileSync(assetURL(name), 'utf8');
const css = asset('inline-media.css');
const demo = asset('demo.css');
const html = asset('index.html');
const svg = asset('study.svg');
const clean = s => s.replace(/\/\*[\s\S]*?\*\//g, '');
// These small readers cover our deliberately simple source grammar, not arbitrary CSS/XML.
const rules = s => [...clean(s).matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .map(([, selector, body]) => ({ selector: selector.trim(), body }));
const rule = (s, selector) => {
  const found = rules(s).find(r => r.selector === selector);
  assert.ok(found, `Missing ${selector}`);
  return found.body;
};
const attrs = s => Object.fromEntries([...s.matchAll(/([\w-]+)="([^"]*)"/g)].map(m => [m[1], m[2]]));
const tags = (s, name) => [...s.matchAll(new RegExp(`<${name}\\b([^>]*)>`, 'g'))].map(m => attrs(m[1]));
const text = s => s.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

function scopeContract(s) {
  const parsed = rules(s);
  assert.ok(parsed.length >= 5);
  for (const { selector, body } of parsed) {
    assert.match(selector, /^\.cui-inline-title(?: > \.cui-inline-media(?: > img)?)?$/);
    assert.doesNotMatch(body, /(?:^|;)\s*--[\w-]+\s*:/, 'Consume host tokens; do not overwrite');
  }
  assert.doesNotMatch(clean(s), /(?:@import|url\(|animation\s*:|transition\s*:|filter\s*:|!important|position\s*:|overflow(?:-\w+)?\s*:\s*(?:hidden|clip)|clip-path|opacity\s*:|content\s*:)/);
}
function layoutContract(s) {
  const title = rule(s, '.cui-inline-title');
  const slot = rule(s, '.cui-inline-title > .cui-inline-media');
  const image = rule(s, '.cui-inline-title > .cui-inline-media > img');
  assert.match(title, /white-space: normal;/);
  assert.match(title, /overflow-wrap: anywhere;/);
  assert.match(title, /hyphens: auto;/);
  assert.match(title, /max-inline-size: 100%;/);
  assert.doesNotMatch(title, /(?:^|;)\s*(?:height|block-size|min-width|inline-size|display)\s*:/);
  assert.match(slot, /display: inline-block;/);
  assert.match(slot, /box-sizing: border-box;/);
  assert.match(slot, /inline-size: min\(var\(--cui-im-media-size, 1\.8em\), 100%\);/);
  assert.match(slot, /aspect-ratio: 2 \/ 1;/);
  assert.match(slot, /pointer-events: none;/);
  assert.match(slot, /background-color: var\(--cui-im-media-fill, #fbf8f1\);/);
  assert.match(image, /inline-size: 100%;/);
  assert.match(image, /block-size: 100%;/);
  assert.match(image, /object-fit: contain;/);
}

test('library is opt-in, host-token driven and static', () => scopeContract(css));
test('scope rejects global selectors, hidden text and host-token overrides', () => {
  assert.throws(() => scopeContract(css.replace('.cui-inline-title {', 'h2 {')));
  assert.throws(() => scopeContract(css + '\n.cui-inline-title { overflow: hidden; }'));
  assert.throws(() => scopeContract(css + '\n.cui-inline-title { --cui-im-size: 3rem; }'));
});
test('actual CSS reserves the image slot and keeps heading wraps unconstrained', () => layoutContract(css));
test('layout contracts reject no-wrap, lost ratio and cropped-image regressions', () => {
  assert.throws(() => layoutContract(css.replace('white-space: normal;', 'white-space: nowrap;')));
  assert.throws(() => layoutContract(css.replace('aspect-ratio: 2 / 1;', 'aspect-ratio: auto;')));
  assert.throws(() => layoutContract(css.replace('object-fit: contain;', 'object-fit: cover;')));
  assert.throws(() => layoutContract(css.replace('hyphens: auto;', 'hyphens: auto; height: 4rem;')));
});

const expectedHeadings = new Map([
  ['light-title', 'A small place for a thought.'],
  ['dark-title', 'A small place for a thought.'],
  ['long-title', 'Ein kleiner Platz für Gedanken und Aufbewahrungsmöglichkeiten.'],
  ['missing-title', 'A small place for a thought.'],
]);
function headingContract(s) {
  const headings = [...s.matchAll(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/g)]
    .filter(([, a]) => attrs(a).class === 'cui-inline-title');
  assert.equal(headings.length, 4);
  for (const [, attributeText, contents] of headings) {
    const a = attrs(attributeText);
    assert.ok(expectedHeadings.has(a.id));
    assert.equal(a['aria-label'], undefined, 'Do not replace the textual heading name');
    const spans = [...contents.matchAll(/<span\b([^>]*)>([\s\S]*?)<\/span>/g)];
    assert.equal(spans.length, 1);
    const span = spans[0];
    const media = attrs(span[1]);
    assert.equal(media.class, 'cui-inline-media');
    assert.equal(media['aria-hidden'], 'true');
    assert.equal(media.tabindex, undefined);
    assert.equal(text(span[2]), '', 'Do not hide meaningful words inside decoration');
    const images = tags(span[2], 'img');
    assert.equal(images.length, a.id === 'missing-title' ? 0 : 1);
    for (const image of images) {
      assert.equal(image.alt, '');
      assert.equal(image.width, '240');
      assert.equal(image.height, '120');
      assert.equal(image.src, './study.svg');
    }
    assert.equal(text(contents.replace(span[0], '')), expectedHeadings.get(a.id), 'Image-free text stays complete');
    assert.match(contents, /\s<span/);
    assert.match(contents, /<\/span>\s/);
    assert.doesNotMatch(contents, /<br\b|<a\b|<button\b/);
  }
  assert.match(s, /id="long-title" lang="de"/);
}
test('real heading text survives image removal, including absent and translated specimens', () => headingContract(html));
test('semantics reject named decoration, hidden words and missing dimensions', () => {
  assert.throws(() => headingContract(html.replace('alt=""', 'alt="Folded note"')));
  assert.throws(() => headingContract(html.replace('aria-hidden="true">', 'aria-hidden="true">small')));
  assert.throws(() => headingContract(html.replace('width="240"', 'width="0"')));
  assert.throws(() => headingContract(html.replace('A small <span', 'A <span')));
});

function svgContract(s) {
  assert.doesNotMatch(s, /<!DOCTYPE|<!ENTITY|<\?|\b(?:href|style|on\w+)\s*=|<script|<foreignObject/i);
  const actualTags = [...s.matchAll(/<([a-zA-Z][\w-]*)\b/g)].map(m => m[1]);
  assert.deepEqual(actualTags, ['svg', 'title', 'desc', 'polygon', 'path']);
  const root = tags(s, 'svg')[0];
  assert.equal(root.viewBox, '0 0 240 120');
  assert.equal(root.width, '240');
  assert.equal(root.height, '120');
  assert.equal(root.role, 'img');
  for (const id of root['aria-labelledby'].split(' ')) {
    assert.match(s, new RegExp(`<(?:title|desc) id="${id}">[^<]+<`));
  }
  const polygon = tags(s, 'polygon')[0];
  const path = tags(s, 'path')[0];
  assert.equal(path.fill, 'none');
  assert.equal(path['stroke-linecap'], 'round');
  assert.equal(path['stroke-linejoin'], 'round');
  assert.ok(Number(path['stroke-width']) > 0 && Number(path['stroke-width']) <= 3);
  // Restrict to one continuous M/L path; no hidden second subpath or external shape.
  assert.match(path.d, /^M [\d. ]+(?:L [\d. ]+)+$/);
  const commands = [...path.d.matchAll(/([ML])\s+([\d.]+)\s+([\d.]+)/g)];
  assert.equal(commands.length, 13);
  const points = commands.map(([, , x, y]) => [Number(x), Number(y)]);
  const fill = polygon.points.split(/\s+/).map(pair => pair.split(',').map(Number));
  assert.equal(fill.length, 4);
  const corners = [points[0], points[2], points[4], points[6]];
  for (let i = 0; i < 4; i++) {
    assert.deepEqual(fill[i], [corners[i][0] + 8, corners[i][1] + 5], 'Real +8/+5 offset fill');
  }
  assert.deepEqual(points[8], points[0], 'Outline reconnects before internal folds');
  for (const [x, y] of [...points, ...fill]) {
    assert.ok(Number.isFinite(x) && Number.isFinite(y));
    assert.ok(x >= 3 && x <= 237 && y >= 3 && y <= 117, 'Stroke-safe viewBox bounds');
    // A 2:1 capsule is a central rectangle and two radius-60 semicircles.
    const cx = Math.max(60, Math.min(180, x));
    assert.ok(Math.hypot(x - cx, y - 60) < 57, 'Margin inside the actual capsule, including stroke');
  }
  assert.ok(contrast(path.stroke, '#fbf8f1') >= 4.5, 'Ink on default plate');
  assert.ok(contrast(path.stroke, polygon.fill) >= 4.5, 'Ink over spot');
}
function contrast(a, b) {
  const luminance = hex => {
    assert.match(hex, /^#[\da-f]{6}$/i);
    return [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
      .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
  };
  const [lo, hi] = [luminance(a), luminance(b)].sort((x, y) => x - y);
  return (hi + 0.05) / (lo + 0.05);
}
test('actual SVG has a continuous note outline and bounded offset pastel geometry', () => svgContract(svg));
test('SVG checks reject wrong offset, disconnected line, invisible ink and remote resource', () => {
  assert.throws(() => svgContract(svg.replace('52,36', '53,36')));
  assert.throws(() => svgContract(svg.replace('L 109 66', 'M 109 66')));
  assert.throws(() => svgContract(svg.replace('stroke="#292c30"', 'stroke="#fbf8f1"')));
  assert.throws(() => svgContract(svg.replace('</svg>', '<image href="https://example.invalid/remote.svg"/></svg>')));
  assert.throws(() => svgContract(svg.replace('L 109 66', 'L 999 66')));
});

test('demo has truthful native disclosure, useful figure alternative and only local resources', () => {
  assert.doesNotMatch(html, /<script|\son\w+=|role="button"|javascript:/i);
  const figure = html.match(/<figure\b[^>]*>([\s\S]*?)<\/figure>/)[1];
  const meaningful = tags(figure, 'img')[0];
  assert.ok(meaningful.alt.length > 50);
  assert.doesNotMatch(figure, /aria-hidden/);
  assert.match(figure, /<figcaption>Original SVG illustration:/);
  assert.match(html, /<details>\s*<summary>When the image carries meaning<\/summary>/);
  assert.match(html, /not a production trademark or an image-provider result/);
  for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (url.startsWith('#')) assert.ok(html.includes(`id="${url.slice(1)}"`));
    else {
      assert.match(url, /^\.\/[\w.-]+$/);
      assert.ok(existsSync(assetURL(url.slice(2))));
    }
  }
  const neutral = html.match(/<div id="neutral-host">([\s\S]*?)<\/div>/)[1];
  assert.doesNotMatch(neutral, /cui-inline/);
});

test('actual light/dark text pairs meet source arithmetic and focus stays visible', () => {
  for (const selector of ['.type-demo__panel', '.type-demo__panel--dark']) {
    const body = rule(demo, selector);
    const ink = body.match(/--cui-im-ink:\s*(#[\da-f]{6})/)[1];
    const background = body.match(/\bbackground:\s*(#[\da-f]{6})/)[1];
    assert.ok(contrast(ink, background) >= 4.5);
  }
  assert.match(demo, /a:focus-visible,[\s\S]*summary:focus-visible\s*\{\s*outline: 3px solid currentColor;\s*outline-offset: 4px;/);
  const forced = css.slice(css.indexOf('@media (forced-colors: active)'));
  assert.match(forced, /color: CanvasText;/);
  assert.match(forced, /background-color: Canvas;/);
  assert.match(forced, /border-color: CanvasText;/);
});
