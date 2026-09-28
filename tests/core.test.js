// Lightweight browser-oriented test cases.
// Run these assertions from a browser test runner after loading the app modules.

import { setState, getState } from '../js/core/state.js';
import { setLastRead, toggleBookmark } from '../js/features/quran.js';
import { incrementDhikr, resetDhikr } from '../js/features/adhkar.js';

export function runCoreTests() {
  setState({ bookmarks: [], dhikrProgress: {}, lastRead: null });
  setLastRead(2, 7);
  console.assert(getState().lastRead.surahId === 2 && getState().lastRead.verse === 7, 'lastRead invariant');
  toggleBookmark(2, 7);
  console.assert(getState().bookmarks.length === 1, 'bookmark add invariant');
  toggleBookmark(2, 7);
  console.assert(getState().bookmarks.length === 0, 'bookmark remove invariant');
  console.assert(incrementDhikr('morning', 3) === 1, 'dhikr increment invariant');
  console.assert(incrementDhikr('morning', 3) === 2, 'dhikr second increment invariant');
  resetDhikr('morning');
  console.assert(!getState().dhikrProgress.morning, 'dhikr reset invariant');
  return true;
}
