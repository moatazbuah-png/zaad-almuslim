import { getState, setState } from '../core/state.js';

const THEME_KEY = 'zaad-theme';

export function applyTheme(theme) {
  const value = theme === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.theme = value;
  try { localStorage.setItem(THEME_KEY, value); } catch {}
  return value;
}

export function getTheme() {
  try { return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark'; } catch { return 'dark'; }
}

export function initializeTheme() {
  return applyTheme(getTheme());
}

export function getSettings() {
  return getState().settings;
}

export function updateSettings(patch = {}) {
  const allowed = ['notifications', 'location', 'sound'];
  const next = {};
  for (const key of allowed) {
    if (typeof patch[key] === 'boolean') next[key] = patch[key];
  }
  setState(state => ({ ...state, settings: { ...state.settings, ...next } }));
  return getSettings();
}
