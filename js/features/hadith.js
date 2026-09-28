import { getContent } from '../content.js';

export async function getHadith(options = {}) {
  const content = await getContent();
  const status = options.status || 'published';
  return content.hadith.filter(item => !status || item.review_status === status);
}

export async function findHadith(query, limit = 20) {
  const term = String(query || '').trim().toLocaleLowerCase('ar');
  if (!term) return [];
  const items = await getHadith({ status: '' });
  return items.filter(item => `${item.title} ${item.text} ${item.source} ${item.reference}`.toLocaleLowerCase('ar').includes(term)).slice(0, limit);
}
