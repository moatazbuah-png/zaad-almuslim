import { searchArabic } from '../search.js';

export async function unifiedSearch(query, options = {}) {
  return searchArabic(query, {
    ...options,
    types: options.types || ['quran', 'dhikr', 'hadith']
  });
}
