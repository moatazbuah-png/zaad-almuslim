/* زاد المسلم — local Arabic search */
import { searchContent } from './content.js';

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
  const results = await searchContent(normalized, options);
  return results.filter(item => normalizeArabic(`${item.title} ${item.text} ${item.source} ${item.reference}`).includes(normalized));
}
