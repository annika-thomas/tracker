import { h, esc, I, openSheet } from './ui.js';
import { moodFace, pod, MOODS } from './moods.js';
import { EMOTIONS, iconSrc } from './icons.js';

const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export function matches(S, e) {
  const f = S.filter;
  if (f.favOnly && !e.fav) return false;
  if (f.period && f.period !== 'all') {
    const now = new Date();
    if (f.period === 'month' && !e.date.startsWith(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)) return false;
    if (f.period === 'year' && !e.date.startsWith(String(now.getFullYear()))) return false;
    if (f.period === '30') {
      const cut = new Date(now); cut.setDate(cut.getDate() - 30);
      if (new Date(e.date + 'T00:00:00') < cut) return false;
    }
  }
  if (f.moods.size && !f.moods.has(e.mood)) return false;
  if (f.emotions.size && !(e.emotions || []).some(x => f.emotions.has(x))) return false;
  if (f.q) {
    const q = f.q.toLowerCase();
    const hay = [e.note || '', e.date, ...(e.emotions || [])].join(' ').toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

export function renderArchive(S) {
  const list = [...S.entries.values()].filter(e => matches(S, e)).sort((a, b) => b.date.localeCompare(a.date));
  const activeFilters = S.filter.moods.size + S.filter.emotions.size + (S.filter.favOnly ? 1 : 0)
    + (S.filter.period && S.filter.period !== 'all' ? 1 : 0);

  const rows = list.map(e => {
    const [y, m, d] = e.date.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    const emo = (e.emotions || []).map(id => EMOTIONS.find(x => x.id === id)?.label).filter(Boolean);
    const sub = e.note?.trim() || emo.join(', ') || `${(e.icons || []).length} ${(e.icons || []).length === 1 ? 'activity' : 'activities'}`;
    return `<button class="arc-row" data-open="${e.date}">
      ${moodFace(e.mood, { size: 42 })}
      <span class="t"><b>${MON[m - 1]} ${d}, ${y}</b><p>${DAY[dt.getDay()]} · ${esc(sub)}</p></span>
      ${e.fav ? I.starFull({ s: 18 }) : ''}
      ${(e.photos || []).length ? `<img src="${URL.createObjectURL(e.photos[0])}" style="width:42px;height:42px;border-radius:9px;object-fit:cover" alt="">` : ''}
    </button>`;
  }).join('');

  const photos = list.flatMap(e => (e.photos || []).map(p => ({ p, date: e.date })));
  const gallery = photos.map(x => `<img src="${URL.createObjectURL(x.p)}" data-open="${x.date}" alt="">`).join('');

  return `<section class="screen is-active" id="s-archive">
    <div class="topbar">
      <button class="avatar-pill" data-act="quick">${pod(26)}${I.chevronDown({ s: 16 })}</button>
      <div class="topbar-right">
        <button class="icon-btn" data-arc="mode">${S.archiveMode === 'list' ? I.navArchive({ s: 23 }) : I.navCal({ s: 23 })}</button>
        <button class="icon-btn" data-act="menu">${I.menu({ s: 24 })}</button>
      </div>
    </div>
    <div class="month-head"><div class="month-title">Archive</div></div>
    <div class="search">${I.search({ s: 20 })}<input placeholder="Search notes and emotions" value="${esc(S.filter.q)}" data-arc-q></div>
    <div class="filters-bar">
      <button data-arc="filter" class="${activeFilters ? 'is-on' : ''}">${I.tabPuzzle({ s: 17 })} Filter${activeFilters ? ` · ${activeFilters}` : ''}</button>
      <button data-arc="fav" class="${S.filter.favOnly ? 'is-on' : ''}">${I.star({ s: 17 })} Favourites</button>
      ${activeFilters || S.filter.q ? '<button data-arc="reset">Clear</button>' : ''}
    </div>
    ${list.length
      ? (S.archiveMode === 'list'
        ? `<div class="list">${rows}</div>`
        : (gallery ? `<div class="gallery">${gallery}</div>` : `<p class="empty-day">No photos yet.</p>`))
      : `<p class="empty-day">Nothing here yet.</p>`}
  </section>`;
}

export function openFilterSheet(S, onApply) {
  const moods = new Set(S.filter.moods);
  const emos = new Set(S.filter.emotions);

  let period = S.filter.period || 'all';
  const PERIODS = [['all', 'All time'], ['month', 'This month'], ['30', 'Last 30 days'], ['year', 'This year']];
  const body = h(`<div style="padding-bottom:6px">
    <div style="display:flex;justify-content:center;padding:2px 0 18px">
      <div class="seg" data-periods style="justify-content:center">
        ${PERIODS.map(([v, l]) => `<button data-period="${v}" class="${period === v ? 'is-on' : ''}" style="height:40px;border-radius:20px">${l}</button>`).join('')}
      </div>
    </div>
    <div class="mood-row" style="padding:2px 0 22px">${MOODS.map((m, i) =>
      `<button data-fm="${i}">${moodFace(i, { size: 46, muted: !moods.has(i) })}</button>`).join('')}</div>
    <p style="margin:0 0 14px;font-size:14px;color:var(--muted)">Emotions</p>
    <div class="emotion-grid" style="grid-template-columns:repeat(6,1fr);gap:14px 4px">
      ${EMOTIONS.map(e => `<button class="emotion" data-fe="${e.id}">
        <span class="ic${emos.has(e.id) ? '' : ' is-off'}" style="width:48px;height:48px"><img src="${iconSrc(e.icon)}" alt="" style="width:28px;height:28px"></span>
      </button>`).join('')}
    </div></div>`);

  const foot = h(`<div style="display:flex;gap:10px;width:100%">
    <button class="btn btn-ghost">Reset</button>
    <button class="btn btn-primary">See results</button></div>`);

  const sheet = openSheet({ title: 'When did I record…', body, foot });

  body.onclick = (e) => {
    const pb = e.target.closest('[data-period]');
    if (pb) {
      period = pb.dataset.period;
      body.querySelectorAll('[data-period]').forEach(b2 => b2.classList.toggle('is-on', b2.dataset.period === period));
      return;
    }
    const m = e.target.closest('[data-fm]');
    if (m) {
      const i = Number(m.dataset.fm);
      moods.has(i) ? moods.delete(i) : moods.add(i);
      m.innerHTML = moodFace(i, { size: 46, muted: !moods.has(i) });
      return;
    }
    const em = e.target.closest('[data-fe]');
    if (em) {
      const id = em.dataset.fe;
      emos.has(id) ? emos.delete(id) : emos.add(id);
      em.querySelector('.ic').classList.toggle('is-off', !emos.has(id));
    }
  };
  foot.children[0].onclick = () => {
    moods.clear(); emos.clear(); period = 'all';
    body.querySelectorAll('[data-period]').forEach(b2 => b2.classList.toggle('is-on', b2.dataset.period === 'all'));
    body.querySelectorAll('[data-fm]').forEach((b, i) => b.innerHTML = moodFace(i, { size: 54, muted: true }));
    body.querySelectorAll('[data-fe] .ic').forEach(ic => ic.classList.add('is-off'));
  };
  foot.children[1].onclick = () => { onApply(moods, emos, period); sheet.close(); };
}

document.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-arc]');
  if (b) {
    const { S, render } = await import('./app.js');
    const v = b.dataset.arc;
    if (v === 'mode') S.archiveMode = S.archiveMode === 'list' ? 'gallery' : 'list';
    if (v === 'fav') S.filter.favOnly = !S.filter.favOnly;
    if (v === 'reset') { S.filter = { moods: new Set(), emotions: new Set(), favOnly: false, q: '', period: 'all' }; }
    if (v === 'filter') {
      openFilterSheet(S, (moods, emos, period) => {
        S.filter.moods = moods; S.filter.emotions = emos; S.filter.period = period; render();
      });
      return;
    }
    render();
    return;
  }
  const open = e.target.closest('[data-open]');
  if (open) {
    const { S, render, parseKey } = await import('./app.js');
    const { openEditor } = await import('./editor.js');
    const k = open.dataset.open;
    S.selected = k; S.cursor = parseKey(k); S.tab = 'calendar'; render();
    if (e.shiftKey) openEditor(k);
  }
});

document.addEventListener('input', async (e) => {
  if (!e.target.matches('[data-arc-q]')) return;
  const { S, render } = await import('./app.js');
  S.filter.q = e.target.value;
  const pos = e.target.selectionStart;
  render();
  const inp = document.querySelector('[data-arc-q]');
  if (inp) { inp.focus(); inp.setSelectionRange(pos, pos); }
});
