/* زاد المسلم — compatibility bridge */
import { getState, setState } from './core/state.js';
import { getContent } from './content.js';
import { setLastRead, toggleBookmark } from './features/quran.js';
import { incrementDhikr, resetDhikr } from './features/adhkar.js';
import { unifiedSearch } from './features/search.js';
import { updateSettings } from './features/settings.js';

export async function loadContent() { return getContent(); }
export function loadZaadState() { return getState(); }
export function saveZaadState(patch = {}) { return setState(patch); }
export function setLastReadCompat(surahId, verseNumber = 1) { return setLastRead(surahId, verseNumber); }
export function toggleBookmarkCompat(surahId, verseNumber = 1) { return toggleBookmark(surahId, verseNumber); }
export function addDhikr(id, max = Infinity) { return incrementDhikr(id, max); }
export function resetDhikrCompat(id) { return resetDhikr(id); }
export async function search(query, options = {}) { return unifiedSearch(query, options); }
export function updatePreferences(patch) { return updateSettings(patch); }

export const summary = Object.freeze({
  title: 'زاد المسلم',
  description: 'منظومة إسلامية رقمية مجانية للقرآن والأذكار والحديث والعبادات والتعليم.',
  status: 'phase-2-integration'
});

window.ZaadApp = Object.freeze({ summary, loadState: loadZaadState, saveState: saveZaadState, loadContent, setLastRead: setLastReadCompat, toggleBookmark: toggleBookmarkCompat, addDhikr, resetDhikr: resetDhikrCompat, search, updatePreferences });
