const state = { content: null, drafts: JSON.parse(localStorage.getItem('zaad-drafts') || '[]') };

async function loadContent() {
  const response = await fetch('data/content.json');
  if (!response.ok) throw new Error('تعذر تحميل بيانات المحتوى');
  state.content = await response.json();
  renderMetrics();
  renderResults('');
  renderDrafts();
}

function renderMetrics() {
  const { surahs, athkar, hadith } = state.content;
  document.querySelector('#surahCount').textContent = surahs.length;
  document.querySelector('#thikrCount').textContent = athkar.length;
  document.querySelector('#hadithCount').textContent = hadith.length;
  document.querySelector('#reviewCount').textContent = hadith.filter(item => item.status === 'review').length;
}

function renderResults(query) {
  const term = query.trim().toLowerCase();
  const all = [
    ...state.content.surahs.map(item => ({ type: 'سورة', title: item.name, detail: `${item.type} • ${item.verses} آية` })),
    ...state.content.athkar.map(item => ({ type: 'ذكر', title: item.text, detail: `${item.category} • ${item.source}` })),
    ...state.content.hadith.map(item => ({ type: 'حديث', title: item.title, detail: `${item.source} • ${item.status}` }))
  ];
  const filtered = term ? all.filter(item => `${item.title} ${item.detail}`.toLowerCase().includes(term)) : all.slice(0, 10);
  document.querySelector('#results').innerHTML = filtered.length
    ? filtered.map(item => `<div class="row"><span><b>${escapeHtml(item.type)}:</b> ${escapeHtml(item.title)}</span><small class="muted">${escapeHtml(item.detail)}</small></div>`).join('')
    : '<p class="muted">لا توجد نتائج.</p>';
}

function renderDrafts() {
  const element = document.querySelector('#drafts');
  element.innerHTML = state.drafts.length
    ? state.drafts.map((draft, index) => `<div class="row"><span>${escapeHtml(draft.text)}<small class="muted"><br>المصدر: ${escapeHtml(draft.source || 'غير محدد')} • مسودة</small></span><button class="btn secondary" data-delete="${index}">حذف</button></div>`).join('')
    : '<p class="muted">لا توجد مسودات محلية.</p>';
  element.querySelectorAll('[data-delete]').forEach(button => button.addEventListener('click', () => {
    state.drafts.splice(Number(button.dataset.delete), 1);
    localStorage.setItem('zaad-drafts', JSON.stringify(state.drafts));
    renderDrafts();
  }));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[character]));
}

document.querySelector('#search').addEventListener('input', event => renderResults(event.target.value));
document.querySelector('#saveDraft').addEventListener('click', () => {
  const text = document.querySelector('#draftText').value.trim();
  const source = document.querySelector('#draftSource').value.trim();
  const message = document.querySelector('#message');
  if (!text) { message.textContent = 'اكتب نص المسودة أولًا.'; return; }
  state.drafts.unshift({ text, source, createdAt: new Date().toISOString() });
  localStorage.setItem('zaad-drafts', JSON.stringify(state.drafts));
  document.querySelector('#draftText').value = '';
  document.querySelector('#draftSource').value = '';
  message.textContent = 'تم حفظ المسودة محليًا بانتظار المراجعة.';
  renderDrafts();
});

loadContent().catch(error => { document.querySelector('#results').textContent = error.message; });
