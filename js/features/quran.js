import { getContent } from '../content.js';
import { getState, setState } from '../core/state.js';

async function validVerse(surahId, verse) {
  const content = await getContent();
  const surah = content.surahs.find(item => Number(item.id) === Number(surahId));
  const ayah = Number(verse);
  if (!surah || !Number.isInteger(ayah) || ayah < 1) return null;
  const max = Number(surah.verses);
  if (Number.isInteger(max) && ayah > max) return null;
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
