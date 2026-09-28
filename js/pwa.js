const INSTALL_KEY = 'zaad-pwa-install-dismissed';
let deferredPrompt = null;

function makeInstallButton() {
  if (document.getElementById('pwa-install-button')) return;
  const button = document.createElement('button');
  button.id = 'pwa-install-button';
  button.type = 'button';
  button.className = 'fixed right-4 top-20 z-[55] hidden rounded-2xl border border-yellow-400/30 bg-emerald-900/95 px-4 py-3 text-xs font-black text-yellow-200 shadow-2xl backdrop-blur';
  button.innerHTML = '<i class="fa-solid fa-download ml-1"></i> تثبيت التطبيق';
  button.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result?.outcome === 'accepted') button.remove();
      deferredPrompt = null;
      return;
    }
    if (window.showToast) window.showToast('من قائمة المتصفح اختر إضافة إلى الشاشة الرئيسية');
  });
  document.body.appendChild(button);
  return button;
}

function updateInstallButton() {
  const button = makeInstallButton();
  if (!button) return;
  const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  button.classList.toggle('hidden', standalone || !deferredPrompt);
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const registration = await navigator.serviceWorker.register('./sw.js', { scope: './' });
    registration.update().catch(() => {});
  } catch (error) {
    console.warn('PWA service worker registration failed', error);
  }
}

function persistLocalProgress() {
  try {
    const data = {
      tasbeeh: window.totalTasbeeh || 0,
      tracker: Array.isArray(window.trackerTasks) ? window.trackerTasks : null,
      city: document.querySelector('#cityModal button')?.textContent || null,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('zaad-progress-v1', JSON.stringify(data));
  } catch (_) {}
}

function restoreLocalProgress() {
  try {
    const raw = localStorage.getItem('zaad-progress-v1');
    if (!raw) return;
    const data = JSON.parse(raw);
    if (Number.isFinite(data.tasbeeh) && typeof window.totalTasbeeh === 'number') {
      window.totalTasbeeh = data.tasbeeh;
      const total = document.getElementById('tasbeeh-total');
      if (total) total.textContent = String(data.tasbeeh);
    }
    if (Array.isArray(data.tracker) && Array.isArray(window.trackerTasks)) {
      data.tracker.forEach((item, index) => {
        if (window.trackerTasks[index]) window.trackerTasks[index].done = Boolean(item.done);
      });
      if (window.renderTracker) window.renderTracker();
    }
  } catch (_) {}
}

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredPrompt = event;
  updateInstallButton();
});

window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  document.getElementById('pwa-install-button')?.remove();
});

window.addEventListener('online', () => window.showToast?.('تم الاتصال بالإنترنت'));
window.addEventListener('offline', () => window.showToast?.('أنت الآن في وضع عدم الاتصال'));
window.addEventListener('beforeunload', persistLocalProgress);

window.addEventListener('DOMContentLoaded', () => {
  makeInstallButton();
  restoreLocalProgress();
  registerServiceWorker();
  setTimeout(updateInstallButton, 1200);
  setInterval(persistLocalProgress, 5000);
});

window.ZaadPWA = Object.freeze({ registerServiceWorker, persistLocalProgress });
