/* زاد المسلم — content repository */
const CONTENT_URL = './data/content.json';

const EMPTY_CONTENT = Object.freeze({
  version: 'unavailable',
  surahs: [],
  athkar: [],
  hadith: []
});

function normalizeList(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeItem(item, type) {
  if (!item || typeof item !== 'object') return null;
  const id = String(item.id ?? '').trim();
  if (!id) return null;
  return {
    ...item,
    id,
    type,
    title: String(item.title ?? '').trim(),
    text: String(item.text ?? '').trim(),
    source: String(item.source ?? '').trim(),
    reference: String(item.reference ?? '').trim(),
    review_status: String(item.review_status ?? 'draft').trim()
  };
}

function validateContent(raw) {
  const input = raw && typeof raw === 'object' ? raw : {};
  return {
    version: String(input.version ?? 'unknown'),
    schema_version: String(input.schema_version ?? '1'),
    surahs: normalizeList(input.surahs).map(item => normalizeItem(item, 'quran')).filter(Boolean),
    athkar: normalizeList(input.athkar).map(item => normalizeItem(item, 'dhikr')).filter(Boolean),
    hadith: normalizeList(input.hadith).map(item => normalizeItem(item, 'hadith')).filter(Boolean)
  };
}

let contentPromise;
export async function getContent() {
  if (!contentPromise) {
    contentPromise = fetch(CONTENT_URL, { credentials: 'same-origin', cache: 'no-cache' })
      .then(response => {
        if (!response.ok) throw new Error(`content:${response.status}`);
        return response.json();
      })
      .then(validateContent)
      .catch(() => EMPTY_CONTENT);
  }
  return contentPromise;
}

export async function searchContent(query, options = {}) {
  const term = String(query ?? '').trim().toLocaleLowerCase('ar');
  if (!term) return [];
  const content = await getContent();
  const types = Array.isArray(options.types) && options.types.length ? options.types : ['quran', 'dhikr', 'hadith'];
  const limit = Math.max(1, Math.min(Number(options.limit) || 50, 200));
  const results = [];

  for (const type of types) {
    const list = type === 'quran' ? content.surahs : type === 'dhikr' ? content.athkar : content.hadith;
    for (const item of list) {
      const haystack = `${item.title} ${item.text} ${item.source} ${item.reference}`.toLocaleLowerCase('ar');
      if (haystack.includes(term)) results.push(item);
      if (results.length >= limit) return results;
    }
  }
  return results;
}

export function contentStats(content) {
  return {
    quran: content?.surahs?.length ?? 0,
    athkar: content?.athkar?.length ?? 0,
    hadith: content?.hadith?.length ?? 0
  };
}
