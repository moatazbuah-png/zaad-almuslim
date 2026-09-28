import { getContent } from '../content.js';

export async function getHadith(options = {}) {
  const content = await getContent();
  const status = options.status ?? 'review';
  return content.hadith.filter(item => !status || item.review_status === status || (status === 'published' && item.review_status === 'review'));
}

export async function findHadith(query, limit = 20) {
  const term = String(query || '').trim().toLocaleLowerCase('ar');
  const safeLimit = Math.max(1, Math.min(Number(limit) || 20, 100));
  if (!term) return [];
  const items = await getHadith({ status: '' });
  return items.filter(item => `${item.title} ${item.text} ${item.source} ${item.reference}`.toLocaleLowerCase('ar').includes(term)).slice(0, safeLimit);
}
