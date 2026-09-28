import { getState, subscribe } from './core/state.js';
import { getContent, contentStats } from './content.js';

export async function bootstrapZaad() {
  const content = await getContent();
  const state = getState();
  document.documentElement.dataset.zaadReady = 'true';
  window.Zaad = Object.freeze({
    version: '2.0.0',
    contentStats: contentStats(content),
    getState,
    subscribe
  });
  window.dispatchEvent(new CustomEvent('zaad:ready', { detail: { state, content } }));
  return window.Zaad;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => bootstrapZaad(), { once: true });
} else {
  bootstrapZaad();
}
