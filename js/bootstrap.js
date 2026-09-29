import { getState, subscribe } from './core/state.js';
import { getContent, contentStats } from './content.js';

function applyModernTheme() {
  if (document.getElementById('zaad-modern-theme')) return;
  const style = document.createElement('style');
  style.id = 'zaad-modern-theme';
  style.textContent = `
    :root {
      --zaad-bg: #071411;
      --zaad-surface: rgba(16, 37, 30, .88);
      --zaad-surface-2: rgba(21, 49, 39, .92);
      --zaad-line: rgba(216, 184, 91, .20);
      --zaad-gold: #e5c766;
      --zaad-gold-soft: #f3dda0;
      --zaad-text: #fbfaf4;
      --zaad-muted: #aebfb7;
    }
    html { background: var(--zaad-bg) !important; }
    body {
      background: radial-gradient(900px 420px at 50% -120px, rgba(31,104,78,.48), transparent 70%), linear-gradient(180deg,#081a15 0%,#06110e 100%) !important;
      color: var(--zaad-text) !important;
      -webkit-font-smoothing: antialiased;
    }
    .app { max-width: 980px !important; }
    .top {
      padding-top: max(10px, env(safe-area-inset-top)) !important;
      background: rgba(5,17,14,.82) !important;
      border-bottom-color: var(--zaad-line) !important;
    }
    .brand { gap: 12px !important; }
    .logo {
      width: 48px !important; height: 48px !important; border-radius: 16px !important;
      box-shadow: 0 8px 28px rgba(229,199,102,.16);
    }
    .hero {
      position: relative; overflow: hidden;
      border-color: var(--zaad-line) !important;
      background: radial-gradient(420px 180px at 100% 0%,rgba(229,199,102,.10),transparent 70%), linear-gradient(145deg,rgba(20,67,52,.98),rgba(8,29,23,.98)) !important;
      box-shadow: 0 22px 70px rgba(0,0,0,.28) !important;
    }
    .hero::after {
      content: '۞'; position: absolute; left: 22px; bottom: -18px;
      font-size: 92px; color: rgba(229,199,102,.06); pointer-events: none;
    }
    .hero h2 { max-width: 680px; letter-spacing: -.5px; }
    .feature, .card, .book, .topic {
      background: var(--zaad-surface) !important;
      border-color: var(--zaad-line) !important;
      box-shadow: 0 10px 30px rgba(0,0,0,.10);
      transition: transform .18s ease, border-color .18s ease, background .18s ease;
    }
    .feature { min-height: 124px !important; }
    .feature:hover, .feature:focus-visible, .book:hover, .topic:hover {
      transform: translateY(-2px);
      border-color: rgba(229,199,102,.42) !important;
      background: var(--zaad-surface-2) !important;
    }
    .feature b { color: var(--zaad-gold-soft) !important; }
    .primary { box-shadow: 0 8px 24px rgba(229,199,102,.12); }
    .secondary, .iconbtn { background: rgba(13,35,28,.92) !important; }
    .search {
      background: rgba(4,18,14,.78) !important;
      border-color: var(--zaad-line) !important;
    }
    .search:focus {
      border-color: rgba(229,199,102,.55) !important;
      box-shadow: 0 0 0 3px rgba(229,199,102,.08);
    }
    .quran { box-shadow: 0 18px 50px rgba(0,0,0,.18); }
    .nav {
      padding-bottom: max(8px, env(safe-area-inset-bottom)) !important;
      background: rgba(5,17,14,.90) !important;
      backdrop-filter: blur(18px);
    }
    .nav button { min-height: 52px; border-radius: 14px; }
    .nav button.active { background: rgba(229,199,102,.08); }
    button:focus-visible, input:focus-visible, select:focus-visible {
      outline: 2px solid rgba(229,199,102,.70);
      outline-offset: 2px;
    }
    @media (max-width:560px) {
      .content { padding: 10px !important; }
      .hero { border-radius: 22px !important; padding: 19px !important; }
      .hero h2 { font-size: 24px !important; }
      .feature { min-height: 112px !important; padding: 14px !important; }
      .section { margin-top: 14px !important; }
      .nav button span { font-size: 18px !important; }
    }
    @media (prefers-reduced-motion:reduce) {
      *, *::before, *::after { scroll-behavior:auto !important; transition:none !important; }
    }
  `;
  document.head.appendChild(style);
}

export async function bootstrapZaad() {
  applyModernTheme();
  const content = await getContent();
  const state = getState();
  document.documentElement.dataset.zaadReady = 'true';
  window.Zaad = Object.freeze({
    version: '2.1.0',
    contentStats: contentStats(content),
    getState,
    subscribe
  });
  window.dispatchEvent(new CustomEvent('zaad:ready', { detail: { state, content } }));
  return window.Zaad;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => bootstrapZaad(), { once: true });
} else {
  bootstrapZaad();
}
