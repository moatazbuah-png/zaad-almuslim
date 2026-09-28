import { getState, setState } from '../core/state.js';

export function setLastRead(surahId, verse = 1) {
  const id = Number(surahId);
  const ayah = Math.max(1, Number(verse) || 1);
  if (!Number.isInteger(id) || id < 1 || id > 114) return getState().lastRead;
  setState(state => ({ ...state, lastRead: { surahId: id, verse: ayah, updatedAt: new Date().toISOString() } }));
  return getState().lastRead;
}

export function getLastRead() {
  return getState().lastRead;
}

export function toggleBookmark(surahId, verse = 1) {
  const id = Number(surahId);
  const ayah = Math.max(1, Number(verse) || 1);
  if (!Number.isInteger(id) || id < 1 || id > 114) return false;
  let added = false;
  setState(state => {
    const key = `${id}:${ayah}`;
    const exists = state.bookmarks.some(item => item.key === key);
    added = !exists;
    return {
      ...state,
      bookmarks: exists
        ? state.bookmarks.filter(item => item.key !== key)
        : [...state.bookmarks, { key, surahId: id, verse: ayah, createdAt: new Date().toISOString() }]
    };
  });
  return added;
}
