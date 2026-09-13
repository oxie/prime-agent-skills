// Owned local fixture only. Compares neutral host before/after loading actual library CSS.
const host = document.querySelector('#host'), input = document.querySelector('#host-input');
const snapshot = el => Array.from(getComputedStyle(el), p => [p, getComputedStyle(el).getPropertyValue(p)]);
const before = [snapshot(host), snapshot(input)];
const opaqueRGB = color => {
 const match = color.match(/^rgba?\(([^)]+)\)$/);
 if (!match) return false;
 const channels = match[1].split(/[\s,/]+/).map(Number);
 return channels.every(Number.isFinite) && (channels.length === 3 || (channels.length === 4 && channels[3] === 1));
};
const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = '../../assets/quiet-surfaces/quiet-surfaces.css';
const loaded = new Promise((resolve, reject) => { link.onload = resolve; link.onerror = reject; });
document.head.append(link);
try {
 await loaded;
 const checks = [];
 const viewportFits = document.documentElement.scrollWidth <= innerWidth;
 const check = (name, ok) => { checks.push({name, ok}); if (!ok) throw new Error(name); };
 check('probe fits viewport', viewportFits);
 check('neutral computed styles unchanged', JSON.stringify(before) === JSON.stringify([snapshot(host), snapshot(input)]));
 for (const cls of ['mesh', 'grain', 'ledger']) {
  const el = document.querySelector('.cui-quiet--' + cls), bg = getComputedStyle(el, '::before'), style = getComputedStyle(el);
  check(cls + ' rendered background declared', bg.backgroundImage !== 'none');
  check(cls + ' local noninteractive decoration', style.isolation === 'isolate' && bg.zIndex === '-1' && bg.pointerEvents === 'none');
  check(cls + ' opaque fallback', opaqueRGB(style.backgroundColor) && style.opacity === '1');
  check(cls + ' static', bg.animationName === 'none' && bg.transitionDuration === '0s');
  const input = el.querySelector('input'); input.focus();
  check(cls + ' input accepts focus', document.activeElement === input);
 }
 const translucent = document.createElement('div');
 translucent.style.cssText = 'position:absolute;visibility:hidden;background-color:rgba(24,44,32,0.1)';
 document.body.append(translucent);
 check('translucent fallback rejected', !opaqueRGB(getComputedStyle(translucent).backgroundColor));
 translucent.remove();
 const grain = getComputedStyle(document.querySelector('.cui-quiet--grain'), '::before').backgroundImage;
 const url = grain.match(/^url\("([^"]+)"\)$/);
 check('grain uses single image URL', Boolean(url));
 const tile = new Image(); tile.src = url[1]; await tile.decode();
 check('actual grain SVG decoded', tile.naturalWidth === 128 && tile.naturalHeight === 128);
 input.focus(); check('neutral input accepts focus', document.activeElement === input);
 input.blur(); window.scrollTo(0, 0);
 document.querySelector('#result').textContent = 'QUIET_SURFACES_BROWSER_PROBE_OK\n' + JSON.stringify(checks, null, 2);
 document.querySelector('#result').dataset.status = 'passed';
} catch (error) {
 document.querySelector('#result').textContent = 'QUIET_SURFACES_BROWSER_PROBE_FAILED: ' + String(error);
 document.querySelector('#result').dataset.status = 'failed';
}
