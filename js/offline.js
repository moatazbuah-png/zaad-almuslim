const CACHE_KEY = 'zaad:content-cache:v1';

export async function readCachedContent() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function fetchWithOfflineFallback(url) {
  try {
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
    return { data, offline: false };
  } catch {
    const cached = await readCachedContent();
    if (cached) return { data: cached, offline: true };
    throw new Error('OFFLINE_CONTENT_UNAVAILABLE');
  }
}
