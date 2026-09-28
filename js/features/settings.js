import { getState, setState } from '../core/state.js';

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
