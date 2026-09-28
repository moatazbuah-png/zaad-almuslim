/* زاد المسلم — content repository */
import { fetchWithOfflineFallback } from './offline.js';
import { searchQuran } from './features/quran-data.js';

const CONTENT_URL = './data/content.json';
const EMPTY_CONTENT = Object.freeze({ version: 'unavailable', schema_version: '1', surahs: [], athkar: [], hadith: [] });

function normalizeList(value) { return Array.isArray(value) ? value : []; }
function normalizeArabic(value) {
  return String(value ?? '').normalize('NFKD').replace(/[\u064B-\u065F\u0670]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').replace(/ة/g, 'ه').toLocaleLowerCase('ar');
}
function normalizeItem(item, type) {
  if (!item || typeof item !== 'object') return null;
  const id = String(item.id ?? '').trim();
  if (!id) return null;
  return { ...item, id, type, title: String(item.title ?? item.name ?? '').trim(), text: String(item.text ?? '').trim(), source: String(item.source ?? '').trim(), reference: String(item.reference ?? '').trim(), review_status: String(item.review_status ?? 'draft').trim() };
}
function validateContent(raw) {
  const input = raw && typeof raw === 'object' ? raw : {};
  return { version: String(input.version ?? input.updatedAt ?? 'unknown'), schema_version: String(input.schema_version ?? input.schemaVersion ?? '1'), surahs: normalizeList(input.surahs).map(item => normalizeItem(item, 'quran')).filter(Boolean), athkar: normalizeList(input.athkar).map(item => normalizeItem(item, 'dhikr')).filter(Boolean), hadith: normalizeList(input.hadith).map(item => normalizeItem(item, 'hadith')).filter(Boolean) };
}
let contentPromise;
export async function getContent() {
  if (!contentPromise) contentPromise = fetchWithOfflineFallback(CONTENT_URL).then(({ data }) => validateContent(data)).catch(() => EMPTY_CONTENT);
  return contentPromise;
}
export async function searchContent(query, options = {}) {
  const term = normalizeArabic(query).trim();
  if (!term) return [];
  const types = Array.isArray(options.types) && options.types.length ? options.types : ['quran', 'dhikr', 'hadith'];
  const limit = Math.max(1, Math.min(Number(options.limit) || 50, 200));
  const results = [];
  if (types.includes('quran')) {
    const quranResults = await searchQuran(term, limit);
    results.push(...quranResults.map(item => ({ ...item, type: 'quran', review_status: 'source-verified' })));
    if (results.length >= limit) return results.slice(0, limit);
  }
  const content = await getContent();
  for (const type of types.filter(item => item !== 'quran')) {
    const list = type === 'dhikr' ? content.athkar : content.hadith;
    for (const item of list) {
      const haystack = normalizeArabic(`${item.title} ${item.text} ${item.source} ${item.reference}`);
      if (haystack.includes(term)) results.push(item);
      if (results.length >= limit) return results;
    }
  }
  return results;
}
export function contentStats(content) { return { quran: 114, athkar: content?.athkar?.length ?? 0, hadith: content?.hadith?.length ?? 0 }; }
