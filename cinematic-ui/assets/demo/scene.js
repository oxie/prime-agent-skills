/* Enhancement only: one finite, user-started light pass. Content never depends on it. */
(() => {
  const button = document.querySelector('#motion-toggle');
  const status = document.querySelector('#motion-status');
  const scene = document.querySelector('#scene');
  const light = document.querySelector('.light');
  let animation = null;
  let observer = null;
  let preference = null;
  let inView = false;
  let disposed = false;
  const label = (text, message) => { button.textContent = text; status.textContent = message; };
  const cancel = (message = 'Static light study.') => {
    if (animation) animation.cancel();
    animation = null;
    label('Play light study', message);
  };
  const pause = () => {
    if (animation?.playState === 'running') {
      animation.pause();
      label('Resume light study', 'Light study paused.');
    }
  };
  const visibility = () => { if (document.hidden) pause(); };
  const change = () => {
    cancel(preference.matches ? 'Reduced motion: static light study.' : 'Static light study.');
    button.disabled = preference.matches;
  };
  const fail = () => {
    cancel('Light animation unavailable. Static study shown.');
    button.hidden = true;
    observer?.disconnect();
  };
  const play = () => {
    if (disposed || preference.matches || document.hidden || !inView) return;
    try {
      if (animation?.playState === 'running') { pause(); return; }
      if (animation?.playState === 'paused') animation.play();
      else {
        cancel();
        animation = light.animate([{transform:'translateX(0)',opacity:0},{transform:'translateX(60%)',opacity:1},{transform:'translateX(120%)',opacity:0}], {duration:7000,iterations:1,easing:'ease-in-out'});
        animation.onfinish = () => { cancel('Light study complete.'); label('Replay light study', 'Light study complete.'); };
      }
      label('Pause light study', 'Light study playing (7 seconds).');
    } catch { fail(); }
  };
  const teardown = () => {
    disposed = true;
    cancel('Static study after leaving this page. Reload to enable motion.');
    button.hidden = true;
    observer?.disconnect();
    preference?.removeEventListener('change', change);
    document.removeEventListener('visibilitychange', visibility);
    button.removeEventListener('click', play);
  };
  try {
    if (!light.animate || !window.matchMedia || !window.IntersectionObserver) { fail(); return; }
    preference = matchMedia('(prefers-reduced-motion: reduce)');
    if (!preference.addEventListener) { fail(); return; }
    observer = new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      if (!inView) pause();
    });
    observer.observe(scene);
    preference.addEventListener('change', change);
    document.addEventListener('visibilitychange', visibility);
    button.addEventListener('click', play);
    window.addEventListener('pagehide', teardown, {once:true});
    change();
    button.hidden = false;
  } catch { fail(); }
})();
