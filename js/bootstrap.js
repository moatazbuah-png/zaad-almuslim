import { getState, subscribe } from './core/state.js';
import { getContent, contentStats } from './content.js';

let bootPromise;

export function bootstrapZaad() {
  if (bootPromise) return bootPromise;
  bootPromise = getContent().then(content => {
    const state = getState();
    document.documentElement.dataset.zaadReady = 'true';
    window.Zaad = { version: '2.0.0', contentStats: contentStats(content), getState, subscribe };
    window.dispatchEvent(new CustomEvent('zaad:ready', { detail: { state, content } }));
    return window.Zaad;
  });
  return bootPromise;
}
