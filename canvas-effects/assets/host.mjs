// Original bounded decorative-canvas host. No renderer registry or external runtime.
export const LIMITS = Object.freeze({dpr: 2, pixels: 1000000, durationMs: 10000});
export function backingSize(width, height, deviceDpr = 1) {
  width = Math.max(1, Number.isFinite(width) ? width : 1);
  height = Math.max(1, Number.isFinite(height) ? height : 1);
  const dpr = Math.min(LIMITS.dpr, Math.max(0.1, Number.isFinite(deviceDpr) ? deviceDpr : 1),
    Math.sqrt(LIMITS.pixels / width / height), LIMITS.pixels / width, LIMITS.pixels / height);
  return {width, height, dpr, pixelWidth: Math.max(1, Math.floor(width * dpr)),
    pixelHeight: Math.max(1, Math.floor(height * dpr))};
}
export function pointerPosition(event, rect, width, height) {
  return {x: Math.min(width, Math.max(0, (event.clientX - rect.left) * width / Math.max(1, rect.width))),
    y: Math.min(height, Math.max(0, (event.clientY - rect.top) * height / Math.max(1, rect.height)))};
}
export function createHost({canvas, playButton, stopButton, status, createRenderer, durationMs = 8000}) {
  const win = canvas.ownerDocument.defaultView;
  const doc = canvas.ownerDocument;
  let media = null;
  const duration = Math.min(LIMITS.durationMs, Math.max(1, Number.isFinite(durationMs) ? durationMs : 8000));
  let renderer, raf = null, timer = null, start = 0, previous = 0, elapsed = 0, visible = true;
  let running = false, destroyed = false, failed = false, reason = 'Still preview. Play runs for up to 8 seconds.';
  let frames = 0, size = backingSize(1, 1), pointer = null, sized = false;
  const cleanups = [], observers = [];
  function announce(message) {
    reason = message; status.textContent = message;
    playButton.disabled = destroyed || failed || Boolean(media?.matches);
    stopButton.disabled = !running;
  }
  function listen(target, type, fn, options) {
    target.addEventListener(type, fn, options);
    cleanups.push(() => target.removeEventListener(type, fn, options));
  }
  function stop(message = 'Stopped. Press Play to run again.') {
    running = false;
    if (raf !== null) win.cancelAnimationFrame(raf);
    if (timer !== null) win.clearTimeout(timer);
    raf = timer = null;
    announce(message);
  }
  function release() {
    for (const cleanup of cleanups.splice(0)) cleanup();
    for (const observer of observers.splice(0)) observer.disconnect();
    try { renderer?.destroy?.(); } catch { /* Preserve readable failure during cleanup. */ }
    renderer = null;
  }
  function fail(message) {
    failed = true; stop(message); release(); canvas.hidden = true;
  }
  function render(dt = 0) {
    renderer.render({ ...size, time: elapsed / 1000, dt, pointer, running });
    frames++;
  }
  function onScreen() {
    const r = canvas.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < win.innerHeight && r.left < win.innerWidth;
  }
  function tick(now) {
    raf = null;
    if (!running || destroyed || failed) return;
    if (doc.hidden || !visible || !onScreen() || media.matches) { stop('Paused by visibility or motion preference. Press Play to restart.'); return; }
    elapsed = Math.min(duration, now - start);
    try { render(Math.min(0.05, Math.max(0, (now - previous) / 1000))); }
    catch { fail('Canvas rendering unavailable. The description remains below.'); return; }
    previous = now;
    if (elapsed >= duration) stop('Run complete. Press Play to run again.');
    else raf = win.requestAnimationFrame(tick);
  }
  function play() {
    if (destroyed || failed) return false;
    if (media.matches || doc.hidden || !visible || !onScreen()) {
      stop('Motion is unavailable while hidden, offscreen, or reduced motion is enabled.'); return false;
    }
    stop(); elapsed = 0; pointer = null;
    try { renderer.reset?.(); } catch { fail('Canvas reset unavailable. The description remains below.'); return false; }
    running = true; start = previous = win.performance.now();
    announce(`Playing. Stops within ${duration / 1000} seconds.`);
    // Wall-clock guard remains effective even when RAF is throttled.
    timer = win.setTimeout(() => stop('Run complete. Press Play to run again.'), duration);
    raf = win.requestAnimationFrame(tick); return true;
  }
  function resize() {
    if (destroyed || failed) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const next = backingSize(rect.width, rect.height, win.devicePixelRatio);
    if (sized && Object.keys(next).every(key => next[key] === size[key])) return;
    size = next; sized = true;
    if (canvas.width !== size.pixelWidth) canvas.width = size.pixelWidth;
    if (canvas.height !== size.pixelHeight) canvas.height = size.pixelHeight;
    try { renderer.resize?.(size); render(); }
    catch { fail('Canvas sizing unavailable. The description remains below.'); }
  }
  const api = {play, stop, destroy() {
    if (destroyed) return;
    destroyed = true; stop('Preview inactive. Reload or remount to enable controls.'); release();
  }, getState() { return {running, destroyed, failed, reason, frames, ...size, pointer,
    entities: renderer?.getEntityCount?.() ?? 0, pendingFrame: raf !== null,
    pendingTimer: timer !== null, listenerCount: cleanups.length, observerCount: observers.length,
    backend: renderer?.backend ?? null}; }};
  try {
    media = win.matchMedia('(prefers-reduced-motion: reduce)');
    renderer = createRenderer(canvas);
    listen(win, 'pagehide', () => api.destroy());
    listen(playButton, 'click', play);
    listen(stopButton, 'click', () => stop());
    listen(canvas, 'pointermove', event => {
      if (!running) return;
      pointer = pointerPosition(event, canvas.getBoundingClientRect(), size.width, size.height);
      renderer.pointer?.(pointer);
    }, {passive: true});
    listen(canvas, 'pointerdown', event => {
      if (!running) return;
      pointer = pointerPosition(event, canvas.getBoundingClientRect(), size.width, size.height);
      renderer.pointer?.(pointer);
    }, {passive: true});
    listen(doc, 'visibilitychange', () => { if (doc.hidden) stop('Stopped while hidden. Press Play to restart.'); });
    listen(media, 'change', () => {
      if (media.matches) stop('Reduced motion: still preview.');
      else announce('Still preview. Press Play to start.');
    });
    listen(canvas, 'webglcontextlost', event => { event.preventDefault(); fail('WebGL context lost. Reload to restore the decorative preview.'); });
    const ro = new win.ResizeObserver(resize); observers.push(ro); ro.observe(canvas);
    const io = new win.IntersectionObserver(entries => {
      visible = entries[entries.length - 1]?.isIntersecting ?? true;
      if (!visible && running) stop('Stopped offscreen. Press Play to restart.');
    }); observers.push(io); io.observe(canvas);
    resize();
    if (!failed) announce(media.matches ? 'Reduced motion: still preview.' : reason);
  } catch {
    fail('Canvas unavailable. Read the scene description below.');
  }
  return api;
}
