import {mountEffect} from '../effects.mjs';
const instances = {};
for (const panel of document.querySelectorAll('[data-effect]')) {
  instances[panel.dataset.effect] = mountEffect(panel);
}
window.canvasEffectsDemo = {instances, destroy() {
  for (const instance of Object.values(instances)) instance.destroy();
}};
