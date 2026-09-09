import {createHost} from './host.mjs';
import {createWarp} from './warp.mjs';
export const ENTITY_LIMITS = Object.freeze({ripples: 24, particles: 96, glyph: 960});
export function advanceParticle(p, dt, width, height, pointer) {
  dt = Math.min(0.05, Math.max(0, dt));
  if (pointer) {
    const dx = p.x - pointer.x, dy = p.y - pointer.y, d = Math.hypot(dx, dy);
    if (d > 0 && d < 100) { p.vx += dx / d * 35 * dt; p.vy += dy / d * 35 * dt; }
  }
  const speed = Math.hypot(p.vx, p.vy);
  if (speed > 65) { p.vx *= 65 / speed; p.vy *= 65 / speed; }
  p.x = ((p.x + p.vx * dt) % width + width) % width;
  p.y = ((p.y + p.vy * dt) % height + height) % height;
  return p;
}
function create2D(canvas, mode) {
  const ctx = canvas.getContext('2d', {alpha: false});
  if (!ctx) throw new Error('Canvas2D unavailable');
  let width = 1, height = 1, rings = [], particles = [], lastRing = -1, pointer = null, cells = 0;
  function reset() {
    rings = []; lastRing = -1; pointer = null;
    particles = Array.from({length: ENTITY_LIMITS.particles}, (_, i) => ({
      x: ((i * 0.61803398875) % 1) * width, y: ((i * 0.41421356237) % 1) * height,
      vx: Math.cos(i * 2.4) * 24, vy: Math.sin(i * 2.4) * 24}));
  }
  function addRing(x, y, time) {
    rings.push({x, y, born: time});
    if (rings.length > ENTITY_LIMITS.ripples) rings.shift();
  }
  return {backend: 'canvas2d', reset,
    resize(size) { width = size.width; height = size.height; reset(); },
    pointer(p) { pointer = p; },
    getEntityCount() { return mode === 'ripples' ? rings.length : mode === 'particles' ? particles.length : cells; },
    destroy() { rings = []; particles = []; pointer = null; },
    render({pixelWidth, pixelHeight, time, dt, running}) {
      ctx.setTransform(pixelWidth / width, 0, 0, pixelHeight / height, 0, 0);
      ctx.fillStyle = '#101f32'; ctx.fillRect(0, 0, width, height);
      if (mode === 'ripples') {
        if (!running && rings.length === 0) addRing(width * 0.5, height * 0.5, -0.6);
        if (running && time - lastRing > 0.23) {
          addRing(pointer?.x ?? width * (0.5 + Math.sin(time * 1.4) * 0.23),
            pointer?.y ?? height * (0.5 + Math.cos(time * 1.8) * 0.18), time);
          lastRing = time;
        }
        rings = rings.filter(r => time - r.born < 2.8);
        for (const ring of rings) {
          const age = Math.max(0, time - ring.born);
          ctx.strokeStyle = `rgba(98,225,214,${Math.max(0, 1 - age / 2.8)})`;
          ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(ring.x, ring.y, 5 + age * 70, 3 + age * 36, 0, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.fillStyle = '#aec9d0';
        for (let i = 0; i < 22; i++) ctx.fillRect((i * 73) % width, (i * 47) % height, 1.5, 1.5);
      } else if (mode === 'particles') {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]; if (running) advanceParticle(p, dt, width, height, pointer);
          ctx.fillStyle = i % 3 ? '#f8c984' : '#6edbd0';
          ctx.beginPath(); ctx.arc(p.x, p.y, i % 3 + 1.3, 0, Math.PI * 2); ctx.fill();
          const q = particles[(i + 13) % particles.length];
          if (Math.hypot(p.x - q.x, p.y - q.y) < 60) {
            ctx.strokeStyle = '#607273'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
      } else {
        // Original observatory landscape, progressively resolved from a glyph grid.
        const cols = Math.min(40, Math.max(8, Math.floor(width / 12)));
        const rows = Math.min(24, Math.max(6, Math.floor(height / 12))); cells = cols * rows;
        const cw = width / cols, ch = height / rows;
        const reveal = running ? Math.min(1, time / 6) : Math.min(1, time / 6 + 0.25);
        ctx.font = `${Math.max(8, Math.min(cw, ch))}px monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
          const u = x / cols, v = y / rows;
          const hill = v > 0.72 + Math.sin(u * 9) * 0.11;
          const moon = Math.hypot((u - 0.75) * width / height, v - 0.26) < 0.13;
          const tower = Math.abs(u - 0.35) < 0.055 && v > 0.44 && v < 0.76;
          const settled = u < reveal;
          ctx.fillStyle = settled ? moon ? '#ffdc9c' : tower ? '#a9c7cf' : hill ? '#4aa393' : '#465e78' : '#547b8c';
          const symbols = '.:+*';
          ctx.fillText(settled ? moon ? '@' : tower ? '#' : hill ? '+' : '.' : symbols[(x * 7 + y * 11 + Math.floor(time * 8)) % 4], (x + 0.5) * cw, (y + 0.5) * ch);
        }
      }
    }};
}
export function mountEffect(panel, mode = panel.dataset.effect) {
  if (!['ripples', 'particles', 'glyph', 'warp'].includes(mode)) throw new Error('Unknown effect mode');
  return createHost({canvas: panel.querySelector('canvas'), playButton: panel.querySelector('[data-action="play"]'),
    stopButton: panel.querySelector('[data-action="stop"]'), status: panel.querySelector('[role="status"]'),
    createRenderer: canvas => mode === 'warp' ? createWarp(canvas) : create2D(canvas, mode)});
}
