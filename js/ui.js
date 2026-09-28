import { getContent } from './content.js';
import { getState, subscribe } from './core/state.js';
import { setLastRead, toggleBookmark } from './features/quran.js';
import { incrementDhikr, resetDhikr } from './features/adhkar.js';
import { getHadith } from './features/hadith.js';
import { unifiedSearch } from './features/search.js';
import { getPrayerSettings, setPrayerSettings } from './features/prayer.js';
import { updateSettings } from './features/settings.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
let content = null;
let active = 'home';
let searchTimer = 0;

function shell() {
  return `<section class="zaad-shell">
    <header class="zaad-header">
      <div><p class="eyebrow">زاد المسلم</p><h1>رفيقك للعبادة والمعرفة</h1><p class="muted">منظومة إسلامية رقمية مجانية</p></div>
      <div class="status" id="content-status">جاري التحميل…</div>
    </header>
    <nav class="tabs" aria-label="الأقسام">
      ${[['home','الرئيسية'],['quran','القرآن'],['adhkar','الأذكار'],['hadith','الحديث'],['search','البحث'],['tasbih','السبحة'],['prayer','الصلاة'],['settings','الإعدادات']].map(([id,label]) => `<button class="tab" data-tab="${id}" aria-current="${id===active?'page':'false'}">${label}</button>`).join('')}
    </nav>
    <div id="view" class="view"></div>
  </section>`;
}

function homeView() {
  const state = getState();
  const stats = content ? `${content.surahs.length} سورة مفهرسة • ${content.athkar.length} ذكر • ${content.hadith.length} حديث` : '';
  return `<div class="grid">
    <article class="card hero"><h2>السلام عليكم ورحمة الله وبركاته</h2><p>ابدأ بقراءة القرآن أو الأذكار، وتابع محفوظاتك ووردك اليومي.</p><button class="primary" data-tab="quran">فتح القرآن</button></article>
    <article class="card"><h3>آخر قراءة</h3><p>${state.lastRead ? `السورة ${state.lastRead.surahId} — الآية ${state.lastRead.verse}` : 'لم تسجل قراءة بعد'}</p><button data-tab="quran">متابعة</button></article>
    <article class="card"><h3>محفوظاتك</h3><p>${state.bookmarks.length} علامة محفوظة</p><button data-tab="quran">عرض القرآن</button></article>
    <article class="card"><h3>محتوى المنظومة</h3><p>${escape(stats)}</p><small>الأرقام تعكس المحتوى المحلي المتاح حاليًا.</small></article>
  </div>`;
}

function quranView() {
  if (!content) return loading();
  return `<div class="section-head"><div><h2>القرآن الكريم</h2><p class="muted">فهرس السور والقراءة المحفوظة. لا نعرض نصًا قرآنيًا غير موجود في البيانات الموثقة.</p></div></div>
    <div class="list">${content.surahs.map(s => `<article class="item"><div><h3>${escape(s.name)}</h3><p>${escape(s.type)} • ${s.verses} آية • الجزء ${s.juz}</p></div><div class="actions"><button data-read="${s.id}" data-verse="1">ابدأ</button><button data-bookmark="${s.id}" data-verse="1">حفظ</button></div></article>`).join('')}</div>`;
}

function adhkarView() {
  if (!content) return loading();
  return `<div class="section-head"><div><h2>الأذكار</h2><p class="muted">أذكار محلية مع بيان المصدر وحالة المراجعة.</p></div></div><div class="list">${content.athkar.map(d => { const progress=getState().dhikrProgress[d.id]||0; return `<article class="item"><div><h3>${escape(d.category)}</h3><p>${escape(d.text)}</p><small>${escape(d.source)} • المراجعة: ${escape(d.review_status)}</small></div><div class="counter"><strong>${progress}/${d.count}</strong><button data-dhikr="${escape(d.id)}" data-max="${d.count}">تسبيح</button><button data-reset="${escape(d.id)}">تصفير</button></div></article>`; }).join('')}</div>`;
}

async function hadithView() {
  if (!content) return loading();
  const items = await getHadith();
  return `<div class="section-head"><div><h2>الحديث</h2><p class="muted">النصوص المعروضة مقيدة بحالة المراجعة في البيانات.</p></div></div><div class="list">${items.map(h => `<article class="item"><div><h3>${escape(h.title)}</h3><p>${escape(h.text)}</p><small>${escape(h.source)} • ${escape(h.reference)}</small></div></article>`).join('')}</div>`;
}

function searchView() { return `<div class="section-head"><div><h2>البحث العربي الموحد</h2><p class="muted">ابحث في القرآن المفهرس والأذكار والحديث.</p></div></div><form id="search-form" class="search"><input id="search-input" aria-label="بحث" placeholder="اكتب كلمة للبحث…" autocomplete="off"><button class="primary">بحث</button></form><div id="search-results" class="list"></div>`; }

function tasbihView() { const p=getState().dhikrProgress.tasbih||0; return `<article class="card center"><h2>السبحة</h2><div class="big-number">${p}</div><button class="primary big-button" data-dhikr="tasbih">سبّح</button><button data-reset="tasbih">تصفير</button></article>`; }

function prayerView() { const p=getPrayerSettings(); return `<article class="card"><h2>إعدادات الصلاة</h2><p class="muted">تُحفظ التفضيلات محليًا. أوقات الصلاة الفعلية تحتاج مزود حساب/موقع موثق.</p><label>طريقة الحساب<input id="prayer-method" value="${escape(p.calculationMethod)}"></label><label>المذهب<input id="prayer-madhab" value="${escape(p.madhab)}"></label><label>المدينة<input id="prayer-city" value="${escape(p.city || '')}"></label><button class="primary" id="save-prayer">حفظ</button></article>`; }

function settingsView() { const s=getState().settings; return `<article class="card"><h2>الإعدادات</h2>${[['notifications','الإشعارات'],['location','الموقع'],['sound','الصوت']].map(([k,l])=>`<label class="toggle"><span>${l}</span><input type="checkbox" data-setting="${k}" ${s[k]?'checked':''}></label>`).join('')}<p class="muted">بيانات الحالة والتفضيلات تُحفظ محليًا.</p></article>`; }
function loading() { return `<article class="card center">جاري تحميل المحتوى…</article>`; }

async function render() {
  const view=document.getElementById('view'); if(!view) return;
  let html = active==='home'?homeView():active==='quran'?quranView():active==='adhkar'?adhkarView():active==='hadith'?await hadithView():active==='search'?searchView():active==='tasbih'?tasbihView():active==='prayer'?prayerView():settingsView();
  view.innerHTML=html;
  document.querySelectorAll('[data-tab]').forEach(button=>button.setAttribute('aria-current',button.dataset.tab===active?'page':'false'));
}

async function doSearch(query) {
  const box=document.getElementById('search-results'); if(!box) return;
  if(!query.trim()){ box.innerHTML=''; return; }
  clearTimeout(searchTimer);
  searchTimer=setTimeout(async()=>{ const results=await unifiedSearch(query,{limit:50}); box.innerHTML=results.length?results.map(r=>`<article class="item"><div><h3>${escape(r.title)}</h3><p>${escape(r.text || r.name)}</p><small>${escape(r.source)}${r.reference?' • '+escape(r.reference):''}</small></div></article>`).join(''):`<article class="card center">لا توجد نتائج.</article>`; },120);
}

export async function mountUI() {
  const root=document.getElementById('app'); if(!root) return;
  root.innerHTML=shell();
  content=await getContent();
  const status=document.getElementById('content-status');
  if(status) status.textContent=`${content.surahs.length} سورة • ${content.athkar.length} أذكار • ${content.hadith.length} أحاديث`;
  await render();
  root.addEventListener('click', async event => {
    const tab=event.target.closest('[data-tab]'); if(tab){ active=tab.dataset.tab; await render(); return; }
    const read=event.target.closest('[data-read]'); if(read){ await setLastRead(read.dataset.read,Number(read.dataset.verse)); await render(); return; }
    const bookmark=event.target.closest('[data-bookmark]'); if(bookmark){ await toggleBookmark(bookmark.dataset.bookmark,Number(bookmark.dataset.verse)); await render(); return; }
    const dhikr=event.target.closest('[data-dhikr]'); if(dhikr){ incrementDhikr(dhikr.dataset.dhikr,Number(dhikr.dataset.max)||Infinity); await render(); return; }
    const reset=event.target.closest('[data-reset]'); if(reset){ resetDhikr(reset.dataset.reset); await render(); return; }
    if(event.target.id==='save-prayer'){ setPrayerSettings({ calculationMethod:document.getElementById('prayer-method').value.trim()||'auto', madhab:document.getElementById('prayer-madhab').value.trim()||'shafi', city:document.getElementById('prayer-city').value.trim()||null }); await render(); }
  });
  root.addEventListener('submit', event => { if(event.target.id==='search-form'){ event.preventDefault(); doSearch(document.getElementById('search-input').value); } });
  root.addEventListener('change', event => { const input=event.target.closest('[data-setting]'); if(input){ updateSettings({[input.dataset.setting]:input.checked}); } });
  subscribe(() => { if(active==='home'||active==='adhkar'||active==='tasbih'||active==='settings') render(); });
}
