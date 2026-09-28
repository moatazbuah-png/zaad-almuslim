/*
 * زاد المسلم — client foundation
 * Framework-free, privacy-first, offline-friendly.
 */
const ZAAD_STORAGE_KEY = 'zaad-almuslim-state-v2';
const ZAAD_DATA_URL = './data/content.json';

const summary = Object.freeze({
  title: 'زاد المسلم',
  description: 'منظومة إسلامية رقمية مجانية للقرآن والأذكار والحديث والعبادات والتعليم.',
  status: 'production-foundation',
  principles: Object.freeze([
    'المحتوى الإسلامي الأساسي مجاني',
    'المصادر قابلة للتتبع والمراجعة',
    'الخصوصية أولًا وتقليل جمع البيانات',
    'لا مفاتيح سرية داخل الواجهة',
    'التوسع التدريجي دون إعادة بناء غير ضرورية'
  ])
});

const defaultState = Object.freeze({
  version: 2,
  tracker: {},
  tasbeehTotal: 0,
  selectedCity: 'القاهرة',
  lastRead: null,
  bookmarks: [],
  preferences: { reducedMotion: false, notifications: false }
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadZaadState() {
  try {
    const raw = localStorage.getItem(ZAAD_STORAGE_KEY);
    if (!raw) return clone(defaultState);
    const parsed = JSON.parse(raw);
    return {
      ...clone(defaultState),
      ...parsed,
      version: 2,
      tracker: { ...defaultState.tracker, ...(parsed.tracker || {}) },
      bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks.slice(0, 500) : [],
      preferences: { ...defaultState.preferences, ...(parsed.preferences || {}) }
    };
  } catch {
    return clone(defaultState);
  }
}

function saveZaadState(patch = {}) {
  const next = { ...loadZaadState(), ...patch, version: 2 };
  try { localStorage.setItem(ZAAD_STORAGE_KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
  return next;
}

function updateTrackerState(taskId, done) {
  const state = loadZaadState();
  return saveZaadState({ tracker: { ...state.tracker, [String(taskId)]: Boolean(done) } });
}

function addTasbeehCount(amount = 1) {
  const n = Number(amount);
  const safeAmount = Number.isFinite(n) ? Math.max(0, Math.min(100000, Math.floor(n))) : 0;
  const state = loadZaadState();
  return saveZaadState({ tasbeehTotal: state.tasbeehTotal + safeAmount });
}

function setSelectedCity(city) {
  if (typeof city !== 'string') return loadZaadState();
  const value = city.trim().slice(0, 80);
  return value ? saveZaadState({ selectedCity: value }) : loadZaadState();
}

function setLastRead(surahId, verseNumber = 1) {
  const s = Number(surahId); const v = Number(verseNumber);
  if (!Number.isInteger(s) || s < 1 || s > 114 || !Number.isInteger(v) || v < 1) return loadZaadState();
  return saveZaadState({ lastRead: { surahId: s, verseNumber: v, updatedAt: new Date().toISOString() } });
}

function toggleBookmark(id) {
  const key = String(id || '').trim().slice(0, 120);
  if (!key) return loadZaadState();
  const state = loadZaadState();
  const exists = state.bookmarks.includes(key);
  const bookmarks = exists ? state.bookmarks.filter(item => item !== key) : [...state.bookmarks, key].slice(-500);
  return saveZaadState({ bookmarks });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

let contentPromise;
async function loadContent() {
  if (!contentPromise) {
    contentPromise = fetch(ZAAD_DATA_URL, { credentials: 'same-origin' })
      .then(response => { if (!response.ok) throw new Error(`content:${response.status}`); return response.json(); })
      .then(data => ({ ...data, surahs: Array.isArray(data.surahs) ? data.surahs : [], athkar: Array.isArray(data.athkar) ? data.athkar : [], hadith: Array.isArray(data.hadith) ? data.hadith : [] }))
      .catch(() => ({ version: 'unavailable', surahs: [], athkar: [], hadith: [] }));
  }
  return contentPromise;
}

window.ZaadApp = Object.freeze({
  summary, loadState: loadZaadState, saveState: saveZaadState,
  updateTrackerState, addTasbeehCount, setSelectedCity, setLastRead,
  toggleBookmark, escapeHtml, loadContent
});

console.log('Zaad al-Muslim foundation loaded');