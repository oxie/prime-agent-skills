// Local fixture state only. No saving, backend, network, timers or custom keys.
export function mountDemo(root) {
  const cleanups = [];
  for (const button of root.querySelectorAll('button[data-material-toggle]')) {
    const status = root.getElementById(button.getAttribute('aria-describedby'));
    if (!status) continue; // Keep disabled if the fixture cannot explain its state.
    const initialText = status.textContent;
    const toggle = () => {
      const pressed = button.getAttribute('aria-pressed') !== 'true';
      button.setAttribute('aria-pressed', String(pressed));
      status.textContent = pressed
        ? 'Pinned in this example only. No file or account was changed.'
        : 'Not pinned. This control changes only this local example.';
    };
    button.addEventListener('click', toggle);
    button.disabled = false;
    status.textContent = 'Not pinned. This control changes only this local example.';
    cleanups.push(() => {
      button.removeEventListener('click', toggle);
      button.disabled = true;
      button.setAttribute('aria-pressed', 'false');
      status.textContent = initialText;
    });
  }
  return () => cleanups.forEach(cleanup => cleanup());
}

if (typeof document !== 'undefined') mountDemo(document);
