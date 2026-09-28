import { getState, setState } from '../core/state.js';

export function getDhikrProgress(id) {
  return Number(getState().dhikrProgress[String(id)] || 0);
}

export function incrementDhikr(id, max = Infinity) {
  const key = String(id);
  const limit = Number.isFinite(max) ? Math.max(0, Number(max)) : Infinity;
  let value = 0;
  setState(state => {
    value = Math.min(getDhikrProgress(key) + 1, limit);
    return { ...state, dhikrProgress: { ...state.dhikrProgress, [key]: value } };
  });
  return value;
}

export function resetDhikr(id) {
  const key = String(id);
  setState(state => {
    const progress = { ...state.dhikrProgress };
    delete progress[key];
    return { ...state, dhikrProgress: progress };
  });
}
