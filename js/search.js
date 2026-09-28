/* زاد المسلم — unified Arabic search */
import { searchContent } from './content.js';
import { searchQuran } from './features/quran-data.js';

export function normalizeArabic(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ة/g, 'ه')
    .toLocaleLowerCase('ar')
    .trim();
}

export async function searchArabic(query, options = {}) {
  const normalized = normalizeArabic(query);
  if (!normalized) return [];
  const limit = Math.max(1, Math.min(Number(options.limit) || 50, 200));
  const types = options.types || ['quran', 'dhikr', 'hadith'];
  const results = [];
  if (types.includes('quran')) results.push(...await searchQuran(normalized, limit));
  if (results.length < limit && types.some(type => type === 'dhikr' || type === 'hadith')) {
    results.push(...await searchContent(normalized, { ...options, types: types.filter(type => type !== 'quran'), limit: limit - results.length }));
  }
  return results.slice(0, limit).filter(item => normalizeArabic(`${item.title} ${item.text} ${item.source} ${item.reference}`).includes(normalized));
}
