import { setState, getState } from '../js/core/state.js';
import { getContent } from '../js/content.js';
import { setLastRead, toggleBookmark } from '../js/features/quran.js';
import { incrementDhikr, resetDhikr } from '../js/features/adhkar.js';
import { getHadith } from '../js/features/hadith.js';
import { searchArabic } from '../js/search.js';

function assert(condition, message) {
  if (!condition) throw new Error(`TEST_FAILED: ${message}`);
}

export async function runCoreTests() {
  setState({ bookmarks: [], dhikrProgress: {}, lastRead: null });
  const content = await getContent();
  assert(content.surahs.length > 0, 'content Quran list');
  assert(content.athkar.length > 0, 'content adhkar list');
  assert(content.hadith.length > 0, 'content hadith list');

  const lastRead = await setLastRead(2, 7);
  assert(lastRead?.surahId === 2 && lastRead?.verse === 7, 'lastRead invariant');
  assert((await setLastRead(2, 999))?.verse === 7, 'invalid verse rejected');

  assert(await toggleBookmark(2, 7) === true, 'bookmark add invariant');
  assert(getState().bookmarks.length === 1, 'bookmark stored');
  assert(await toggleBookmark(2, 7) === false, 'bookmark remove invariant');
  assert(getState().bookmarks.length === 0, 'bookmark removed');

  assert(incrementDhikr('morning', 3) === 1, 'dhikr increment');
  assert(incrementDhikr('morning', 3) === 2, 'dhikr second increment');
  resetDhikr('morning');
  assert(!getState().dhikrProgress.morning, 'dhikr reset');

  assert((await getHadith()).length > 0, 'reviewed hadith available');
  assert((await searchArabic('الإسلام')).length > 0, 'Arabic search');
  return true;
}
