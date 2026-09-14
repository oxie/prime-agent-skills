// Local DOM demonstration only. Import has no side effects; the page opts in.
// Call with a Document or Element. No timers, custom keys, storage or network.
const mounted = new WeakMap();
export function mountCraft(root) {
  if (mounted.has(root)) return mounted.get(root);
  const cleanups = [];
  const statuses = new Map([...root.querySelectorAll('[data-craft-status]')]
    .map(status => [status.id, status]));
  for (const button of root.querySelectorAll('button[data-craft-toggle]')) {
    const status = statuses.get(button.getAttribute('aria-describedby'));
    if (!status) continue; // The fixture starts disabled; never enable without an explanation.
    const initialText = status.textContent;
    const initialDisabled = button.disabled;
    const initialPressed = button.getAttribute('aria-pressed');
    const describe = pressed => {
      button.setAttribute('aria-pressed', String(pressed));
      status.textContent = pressed
        ? 'Emphasis on in this example only. Nothing is saved or sent.'
        : 'Emphasis off. This control changes only this local example.';
    };
    const toggle = () => describe(button.getAttribute('aria-pressed') !== 'true');
    button.addEventListener('click', toggle);
    button.disabled = false;
    describe(false);
    cleanups.push(() => {
      button.removeEventListener('click', toggle);
      button.disabled = initialDisabled;
      if (initialPressed === null) button.removeAttribute('aria-pressed');
      else button.setAttribute('aria-pressed', initialPressed);
      status.textContent = initialText;
    });
  }
  const cleanup = () => {
    if (mounted.get(root) !== cleanup) return;
    cleanups.forEach(undo => undo());
    mounted.delete(root);
  };
  mounted.set(root, cleanup);
  return cleanup;
}
