import { bootstrapZaad } from './bootstrap.js';
import { getState, subscribe } from './core/state.js';
import { setLastRead, toggleBookmark } from './features/quran.js';
import { incrementDhikr, resetDhikr } from './features/adhkar.js';
import { unifiedSearch } from './features/search.js';
import { getPrayerSettings, setPrayerSettings } from './features/prayer.js';
import { updateSettings } from './features/settings.js';
import { setText } from './security.js';
import { mountUI } from './ui.js';

function emit(name, detail = {}) { window.dispatchEvent(new CustomEvent(`zaad:${name}`, { detail })); }

let initialized = false;
export async function initIntegration() {
  if (initialized) return window.Zaad;
  initialized = true;
  await bootstrapZaad();
  await mountUI();
  subscribe(state => emit('state-change', { state }));
  emit('integration-ready', { state: getState() });
  return window.Zaad;
}

export const api = Object.freeze({
  getState, setLastRead, toggleBookmark, incrementDhikr, resetDhikr,
  unifiedSearch, getPrayerSettings, setPrayerSettings, updateSettings, setText
});

window.Zaad = Object.freeze({ ...(window.Zaad || {}), api });

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initIntegration, { once: true });
else initIntegration();
