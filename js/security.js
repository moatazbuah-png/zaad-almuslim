export function setText(element, value) {
  if (!element) return;
  element.textContent = String(value ?? '');
}

export function clearChildren(element) {
  if (!element) return;
  while (element.firstChild) element.removeChild(element.firstChild);
}

export function safeUrl(value) {
  try {
    const url = new URL(String(value), window.location.origin);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}
