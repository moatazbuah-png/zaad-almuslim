import { getState, setState } from '../core/state.js';
import { getQuranCatalog, getSurah } from './quran-data.js';

async function validVerse(surahId, verse) {
  const catalog = await getQuranCatalog();
  const surah = catalog.find(item => Number(item.id) === Number(surahId));
  const ayah = Number(verse);
  if (!surah || !Number.isInteger(ayah) || ayah < 1 || ayah > surah.verses) return null;
  return { surahId: Number(surahId), verse: ayah };
}

export async function setLastRead(surahId, verse = 1) {
  const valid = await validVerse(surahId, verse);
  if (!valid) return getState().lastRead;
  setState(state => ({ ...state, lastRead: { ...valid, updatedAt: new Date().toISOString() } }));
  return getState().lastRead;
}

export function getLastRead() { return getState().lastRead; }

export async function toggleBookmark(surahId, verse = 1) {
  const valid = await validVerse(surahId, verse);
  if (!valid) return false;
  let added = false;
  setState(state => {
    const key = `${valid.surahId}:${valid.verse}`;
    const exists = state.bookmarks.some(item => item.key === key);
    added = !exists;
    return { ...state, bookmarks: exists ? state.bookmarks.filter(item => item.key !== key) : [...state.bookmarks, { key, ...valid, createdAt: new Date().toISOString() }] };
  });
  return added;
}

export async function getQuranSurah(surahId) {
  return getSurah(surahId);
}
