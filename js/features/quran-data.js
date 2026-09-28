/*
 * زاد المسلم — Quran data adapter
 *
 * Quran text source: cchartm16/quran, sourced from Tanzil's Uthmani text.
 * Tanzil terms require verbatim use, attribution, and a link to tanzil.net.
 * The app caches fetched data locally for offline reuse after first sync.
 */
const CATALOG_URL = 'https://raw.githubusercontent.com/Mushaf-Learning/quran-text/main/metadata/surahs.json';
const TEXT_URL = 'https://raw.githubusercontent.com/cchartm16/quran/master/quran-uthmani.txt';
const CATALOG_CACHE = 'zaad:quran:catalog:v1';
const TEXT_CACHE = 'zaad:quran:text:v1';

function read(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
}
function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function normalizeCatalog(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map(item => ({
    id: Number(item.number),
    name: String(item.name_arabic || '').trim(),
    title: String(item.name_arabic || '').trim(),
    type: item.revelation_type === 'Medinan' ? 'مدنية' : 'مكية',
    verses: Number(item.ayah_count),
    juz: Number(item.juz_start),
    page: Number(item.page_start),
    revelationOrder: Number(item.revelation_order),
    ruku: Number(item.ruku_count)
  })).filter(item => Number.isInteger(item.id) && item.id >= 1 && item.id <= 114 && item.name && item.verses > 0);
}

function normalizeText(raw) {
  const map = new Map();
  for (const line of String(raw || '').split(/\r?\n/)) {
    const parts = line.split('|');
    if (parts.length < 3) continue;
    const surahId = Number(parts[0]);
    const verse = Number(parts[1]);
    const text = parts.slice(2).join('|').trim();
    if (!Number.isInteger(surahId) || !Number.isInteger(verse) || !text) continue;
    if (!map.has(surahId)) map.set(surahId, []);
    map.get(surahId).push({ verse, text });
  }
  return Object.fromEntries([...map.entries()].map(([id, verses]) => [String(id), verses.sort((a, b) => a.verse - b.verse)]));
}

export async function getQuranCatalog() {
  const cached = read(CATALOG_CACHE);
  if (Array.isArray(cached) && cached.length === 114) return cached;
  try {
    const response = await fetch(CATALOG_URL, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const catalog = normalizeCatalog(await response.json());
    if (catalog.length === 114) { write(CATALOG_CACHE, catalog); return catalog; }
  } catch {}
  return Array.isArray(cached) ? cached : [];
}

export async function getQuranText() {
  const cached = read(TEXT_CACHE);
  if (cached && typeof cached === 'object' && Object.keys(cached).length >= 114) return cached;
  try {
    const response = await fetch(TEXT_URL, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = normalizeText(await response.text());
    if (Object.keys(text).length >= 114) { write(TEXT_CACHE, text); return text; }
  } catch {}
  return cached && typeof cached === 'object' ? cached : {};
}

export async function getSurah(surahId) {
  const id = Number(surahId);
  const [catalog, text] = await Promise.all([getQuranCatalog(), getQuranText()]);
  const meta = catalog.find(item => item.id === id);
  if (!meta) return null;
  return { ...meta, versesText: text[String(id)] || [] };
}

export async function searchQuran(query, limit = 50) {
  const term = String(query || '').normalize('NFKD').replace(/[\u064B-\u065F\u0670]/g, '').trim();
  if (!term) return [];
  const text = await getQuranText();
  const results = [];
  for (const [surahId, verses] of Object.entries(text)) {
    for (const item of verses) {
      if (item.text.normalize('NFKD').replace(/[\u064B-\u065F\u0670]/g, '').includes(term)) {
        results.push({ id: `${surahId}:${item.verse}`, surahId: Number(surahId), verse: item.verse, title: `القرآن — سورة ${surahId}، آية ${item.verse}`, text: item.text, source: 'Tanzil Project' });
        if (results.length >= limit) return results;
      }
    }
  }
  return results;
}

export const QURAN_SOURCES = Object.freeze({
  text: TEXT_URL,
  metadata: CATALOG_URL,
  attribution: 'Tanzil Project — https://tanzil.net/'
});
