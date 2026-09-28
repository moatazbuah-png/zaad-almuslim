import { getState, setState } from '../core/state.js';

const DEFAULT_PRAYER_SETTINGS = Object.freeze({
  calculationMethod: 'auto',
  madhab: 'shafi',
  city: null,
  latitude: null,
  longitude: null
});

export function getPrayerSettings() {
  return { ...DEFAULT_PRAYER_SETTINGS, ...(getState().prayer || {}) };
}

export function setPrayerSettings(patch = {}) {
  const next = { ...getPrayerSettings() };
  for (const key of Object.keys(DEFAULT_PRAYER_SETTINGS)) {
    if (patch[key] !== undefined) next[key] = patch[key];
  }
  setState(state => ({ ...state, prayer: next }));
  return next;
}
