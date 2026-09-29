import { readStorage, writeStorage } from './storage.js';

const INITIAL_STATE = Object.freeze({
  theme: 'dark',
  activeTab: 'home',
  lastRead: null,
  bookmarks: [],
  dhikrProgress: {},
  tasbeehCount: 0,
  tasbeehTotal: 0,
  tasbeehPhrase: '',
  prayer: {},
  settings: {
    notifications: false,
    location: false,
    sound: true
  }
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function sanitizeState(value) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    ...clone(INITIAL_STATE),
    ...source,
    bookmarks: Array.isArray(source.bookmarks) ? source.bookmarks : [],
    tasbeehCount: Number.isFinite(Number(source.tasbeehCount)) ? Math.max(0, Number(source.tasbeehCount)) : 0,
    tasbeehTotal: Number.isFinite(Number(source.tasbeehTotal)) ? Math.max(0, Number(source.tasbeehTotal)) : 0,
    tasbeehPhrase: typeof source.tasbeehPhrase === 'string' ? source.tasbeehPhrase : '',
    dhikrProgress: source.dhikrProgress && typeof source.dhikrProgress === 'object' ? source.dhikrProgress : {},
    prayer: source.prayer && typeof source.prayer === 'object' ? source.prayer : {},
    settings: { ...INITIAL_STATE.settings, ...(source.settings || {}) }
  };
}

let state = sanitizeState(readStorage('state', INITIAL_STATE));
const listeners = new Set();

export function getState() {
  return clone(state);
}

export function setState(patch) {
  const next = typeof patch === 'function' ? patch(getState()) : { ...state, ...patch };
  state = sanitizeState(next);
  writeStorage('state', state);
  listeners.forEach(listener => listener(getState()));
  return getState();
}

export function subscribe(listener) {
  if (typeof listener !== 'function') return () => {};
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export { INITIAL_STATE };
