import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const storage = new Map();
globalThis.localStorage = {
  getItem: key => storage.has(key) ? storage.get(key) : null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: key => storage.delete(key),
  clear: () => storage.clear()
};

const originalFetch = globalThis.fetch;
const quranCatalogUrl = 'https://raw.githubusercontent.com/Mushaf-Learning/quran-text/main/metadata/surahs.json';
const quranTextUrl = 'https://raw.githubusercontent.com/cchartm16/quran/master/quran-uthmani.txt';
const catalogFixture = Array.from({ length: 114 }, (_, index) => ({
  number: index + 1,
  name_arabic: `سورة ${index + 1}`,
  ayah_count: index === 1 ? 286 : 7,
  revelation_type: index < 5 ? 'Meccan' : 'Medinan',
  revelation_order: index + 1,
  ruku_count: 1,
  juz_start: 1,
  page_start: index + 1
}));
const textFixture = Array.from({ length: 114 }, (_, index) => `${index + 1}|1|آية اختبار ${index + 1}`).join('\n');

globalThis.fetch = async url => {
  const target = String(url);
  if (target === './data/content.json') {
    const body = await fs.readFile(path.join(root, 'data/content.json'), 'utf8');
    return new Response(body, { status: 200, headers: { 'content-type': 'application/json' } });
  }
  if (target === quranCatalogUrl) {
    return new Response(JSON.stringify(catalogFixture), { status: 200, headers: { 'content-type': 'application/json' } });
  }
  if (target === quranTextUrl) {
    return new Response(textFixture, { status: 200, headers: { 'content-type': 'text/plain' } });
  }
  return originalFetch(url);
};

function assert(condition, message) {
  if (!condition) throw new Error(`TEST_FAILED: ${message}`);
}

const { setState, getState } = await import('../js/core/state.js');
const { getContent, contentStats } = await import('../js/content.js');
const { setLastRead, toggleBookmark, getQuranSurah } = await import('../js/features/quran.js');
const { getQuranCatalog, getQuranText } = await import('../js/features/quran-data.js');
const { incrementDhikr, resetDhikr } = await import('../js/features/adhkar.js');
const { getHadith } = await import('../js/features/hadith.js');
const { searchArabic, normalizeArabic } = await import('../js/search.js');
const { getPrayerSettings, setPrayerSettings } = await import('../js/features/prayer.js');
const { updateSettings } = await import('../js/features/settings.js');

export async function runCoreTests() {
  storage.clear();
  setState({ bookmarks: [], dhikrProgress: {}, lastRead: null });
  const content = await getContent();
  assert(content.surahs.length > 0, 'Quran local content available');
  assert(content.athkar.length > 0, 'adhkar available');
  assert(content.hadith.length > 0, 'hadith available');
  const stats = contentStats(content);
  assert(stats.quran === content.surahs.length, 'content stats Quran');

  const catalog = await getQuranCatalog();
  assert(catalog.length === 114, 'complete Quran catalog');
  const quranText = await getQuranText();
  assert(Object.keys(quranText).length === 114, 'complete Quran text cache');
  const surah = await getQuranSurah(2);
  assert(surah?.versesText?.[0]?.text === 'آية اختبار 2', 'Quran verse loader');

  const lastRead = await setLastRead(2, 7);
  assert(lastRead?.surahId === 2 && lastRead?.verse === 7, 'lastRead invariant');
  assert((await setLastRead(2, 999))?.verse === 7, 'invalid verse rejected');

  assert(await toggleBookmark(2, 7) === true, 'bookmark add invariant');
  assert(getState().bookmarks.length === 1, 'bookmark stored');
  assert(await toggleBookmark(2, 7) === false, 'bookmark remove invariant');
  assert(getState().bookmarks.length === 0, 'bookmark removed');

  assert(incrementDhikr('morning', 3) === 1, 'dhikr increment');
  assert(incrementDhikr('morning', 3) === 2, 'dhikr second increment');
  assert(incrementDhikr('morning', 2) === 2, 'dhikr capped');
  resetDhikr('morning');
  assert(!getState().dhikrProgress.morning, 'dhikr reset');

  assert((await getHadith()).length > 0, 'reviewed hadith available');
  assert(normalizeArabic('الإِسْلَام') === 'الاسلام', 'Arabic normalization');
  assert((await searchArabic('الإسلام')).length > 0, 'Arabic search');

  const prayer = setPrayerSettings({ city: 'القاهرة', madhab: 'hanafi' });
  assert(prayer.city === 'القاهرة' && prayer.madhab === 'hanafi', 'prayer settings');
  updateSettings({ sound: false, notifications: true, ignored: 'x' });
  assert(getState().settings.sound === false && getState().settings.notifications === true, 'settings persistence');
  assert(!('ignored' in getState().settings), 'settings whitelist');

  return true;
}

try {
  await runCoreTests();
  console.log('All integration tests passed');
} finally {
  globalThis.fetch = originalFetch;
}
