import { bootstrapZaad } from './bootstrap.js';
import { getState, subscribe } from './core/state.js';
import { setLastRead, toggleBookmark } from './features/quran.js';
import { incrementDhikr, resetDhikr } from './features/adhkar.js';
import { unifiedSearch } from './features/search.js';
import { updateSettings } from './features/settings.js';
import { setText } from './security.js';

function emit(name, detail = {}) {
  window.dispatchEvent(new CustomEvent(`zaad:${name}`, { detail }));
}

export async function initIntegration() {
  await bootstrapZaad();
  subscribe(state => emit('state-change', { state }));
  emit('integration-ready', { state: getState() });
}

export const api = Object.freeze({
  getState,
  setLastRead,
  toggleBookmark,
  incrementDhikr,
  resetDhikr,
  unifiedSearch,
  updateSettings,
  setText
});

window.Zaad = Object.freeze({ ...(window.Zaad || {}), api });

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initIntegration, { once: true });
} else {
  initIntegration();
}
