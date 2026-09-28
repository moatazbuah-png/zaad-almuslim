/*
 * زاد المسلم — application foundation
 * Keep this file framework-free so the MVP remains fast and deployable as a static PWA.
 */

const ZAAD_STORAGE_KEY = 'zaad-almuslim-state-v1';

const summary = {
  title: 'زاد المسلم',
  description: 'منظومة إسلامية رقمية مجانية تجمع القرآن والأذكار والحديث والعبادات والتعليم في تجربة عربية موثوقة.',
  status: 'MVP → foundation hardening',
  principles: [
    'المحتوى الإسلامي مجاني للمستخدم',
    'المصادر قابلة للتتبع والمراجعة',
    'الخصوصية أولًا وتقليل جمع البيانات',
    'لا مفاتيح سرية داخل الواجهة',
    'التوسع التدريجي بدل إعادة بناء المشروع'
  ]
};

const defaultState = Object.freeze({
  version: 1,
  tracker: {},
  tasbeehTotal: 0,
  selectedCity: 'القاهرة',
  preferences: {
    reducedMotion: false,
    notifications: false
  }
});

function loadZaadState() {
  try {
    const raw = localStorage.getItem(ZAAD_STORAGE_KEY);
    if (!raw) return structuredClone(defaultState);
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(defaultState),
      ...parsed,
      preferences: { ...defaultState.preferences, ...(parsed.preferences || {}) }
    };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveZaadState(patch) {
  const next = { ...loadZaadState(), ...patch };
  try {
    localStorage.setItem(ZAAD_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage can be unavailable in private/restricted browser contexts.
  }
  return next;
}

function updateTrackerState(taskId, done) {
  const state = loadZaadState();
  return saveZaadState({
    tracker: { ...state.tracker, [String(taskId)]: Boolean(done) }
  });
}

function addTasbeehCount(amount = 1) {
  const safeAmount = Number.isFinite(Number(amount)) ? Math.max(0, Math.floor(Number(amount))) : 0;
  const state = loadZaadState();
  return saveZaadState({ tasbeehTotal: state.tasbeehTotal + safeAmount });
}

function setSelectedCity(city) {
  if (typeof city !== 'string' || city.trim().length === 0) return loadZaadState();
  return saveZaadState({ selectedCity: city.trim().slice(0, 80) });
}

// Escape dynamic text before inserting it into HTML templates.
function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// Expose only the small public surface needed by the current inline MVP.
window.ZaadApp = Object.freeze({
  summary,
  loadState: loadZaadState,
  saveState: saveZaadState,
  updateTrackerState,
  addTasbeehCount,
  setSelectedCity,
  escapeHtml
});

console.log('Zaad al-Muslim foundation loaded');