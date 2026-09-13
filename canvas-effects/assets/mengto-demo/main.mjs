import {createHost} from '../host.mjs';
import {createFoliage, createPointerTrail} from '../foliage-trails.mjs';
// Demo-only exported controllers for a local fixture. No production window API.
export const controllers = new Map();
for (const panel of document.querySelectorAll('.foliage-trails [data-study]')) {
  controllers.set(panel.dataset.study, createHost({
    canvas:panel.querySelector('canvas'), playButton:panel.querySelector('[data-action="play"]'),
    stopButton:panel.querySelector('[data-action="stop"]'), status:panel.querySelector('[role="status"]'),
    durationMs:8000, createRenderer:panel.dataset.study === 'foliage' ? createFoliage : createPointerTrail
  }));
}
export function destroy() { for(const controller of controllers.values())controller.destroy();controllers.clear(); }
