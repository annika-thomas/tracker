import { $, h, esc, I, openSheet, toast, photoURL } from './ui.js';
import { MOODS, moodFace, mascot, pod, sprout } from './moods.js';
import { EMOTIONS, WEATHERS, iconSrc, GREEN_CATEGORY_IDS, categoryOf } from './icons.js';
import { db, exportJSON, importJSON } from './db.js';
import { openEditor } from './editor.js';
import { renderStats } from './stats.js';
import { renderArchive } from './archive.js';
import { renderProfile } from './profile.js';

// ------------------------------------------------------------------- state
export const S = {
  tab: 'calendar',
  cursor: new Date(),
  selected: null,
  entries: new Map(),
  settings: { theme: 'system', weekStart: 0, autoWeather: true },
  filter: { moods: new Set(), emotions: new Set(), favOnly: false, q: '', period: 'all' },
  statsMode: 'monthly',
  statsYear: new Date().getFullYear(),
  archiveMode: 'list'
};

// -------------------------------------------------------------- date utils
export const pad = (n) => String(n).padStart(2, '0');
export const key = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
export const todayKey = () => key(new Date());
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const monthLabel = (d) => `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
export const monthLong = (m) => MONTHS_LONG[m];
export const dayShort = (d) => DAYS[d.getDay()];
export const dayLong = (d) => DAYS_LONG[d.getDay()];
export const monthShort = (m) => MONTHS[m];

export function entryOf(k) { return S.entries.get(k); }

export async function reload() {
  const all = await db.all();
  S.entries = new Map(all.map(e => [e.date, e]));
}

export async function saveEntry(e) { await db.put(e); await reload(); render(); }
export async function deleteEntry(k) { await db.del(k); await reload(); render(); }

// ------------------------------------------------------------------ chrome
export function iconChip(id, { on = true, size = null } = {}) {
  const green = GREEN_CATEGORY_IDS.has(categoryOf(id));
  return `<span class="ic${on ? '' : ' is-off'}${green ? ' is-green' : ''}"${size ? ` style="width:${size}px;height:${size}px"` : ''}>
    <img src="${iconSrc(id)}" alt="" loading="lazy"></span>`;
}

function topbar() {
  return `<div class="topbar">
    <button class="avatar-pill" data-act="quick">${pod(26)}${I.chevronDown({ s: 16 })}</button>
    <div class="topbar-right">
      <button class="icon-btn" data-act="theme" aria-label="Theme">${I.palette({ s: 24 })}</button>
      <button class="icon-btn" data-act="menu" aria-label="Menu">${I.menu({ s: 24 })}</button>
    </div>
  </div>`;
}

// --------------------------------------------------------------- calendar
function calendarScreen() {
  const cur = S.cursor;
  const y = cur.getFullYear(), m = cur.getMonth();
  const first = new Date(y, m, 1);
  const days = new Date(y, m + 1, 0).getDate();
  const lead = (first.getDay() - S.settings.weekStart + 7) % 7;
  const tKey = todayKey();

  let cells = '';
  for (let i = 0; i < lead; i++) cells += `<div class="day"><div class="slot"></div><span class="num"></span></div>`;
  for (let d = 1; d <= days; d++) {
    const k = `${y}-${pad(m + 1)}-${pad(d)}`;
    const e = S.entries.get(k);
    const future = k > tKey;
    cells += `<button class="day${S.selected === k ? ' is-selected' : ''}${future ? ' is-future' : ''}" data-day="${k}">
      <div class="slot">${e ? moodFace(e.mood, { size: 44 }) : ''}</div>
      <span class="num">${d}</span></button>`;
  }

  const order = [...Array(7)].map((_, i) => DAYS[(i + S.settings.weekStart) % 7]);

  return `<section class="screen is-active" id="s-calendar">
    ${topbar()}
    <div class="month-head">
      <button class="month-title" data-act="month">${monthLabel(cur)}${I.chevronDown({ s: 18 })}</button>
      <button class="icon-btn trailing" data-act="export" aria-label="Export">${I.share({ s: 23 })}</button>
    </div>
    <div class="weekdays">${order.map(d => `<span>${d}</span>`).join('')}</div>
    <div class="days">${cells}</div>
    <div id="detail">${detailHTML()}</div>
  </section>`;
}

function detailHTML() {
  if (!S.selected) return '';
  const e = S.entries.get(S.selected);
  return `<div class="sprout">${sprout(30)}</div>${e ? entryCard(e) : emptyCard(S.selected)}`;
}

export function paintDetail() {
  const host = document.getElementById('detail');
  if (host) host.innerHTML = detailHTML();
}

export function entryCard(e) {
  const d = parseKey(e.date);
  const photos = (e.photos || []).map(p => `<img src="${photoURL(p)}" alt="">`).join('');
  const emo = (e.emotions || []).map(id => EMOTIONS.find(x => x.id === id)).filter(Boolean);
  const chips = [...emo.map(x => x.icon), ...(e.icons || [])];
  const w = e.weather && WEATHERS.find(x => x.id === e.weather.id);
  const sleepTxt = e.sleep && e.sleep.mins
    ? `${Math.floor(e.sleep.mins / 60)}h ${e.sleep.mins % 60}m${e.sleep.count > 1 ? ` · ${e.sleep.count}` : ' · 1'}` : null;

  return `<div class="card" data-card="${e.date}">
    <div class="entry-head">
      ${moodFace(e.mood, { size: 46 })}
      <div class="entry-title">
        <h2>${MONTHS[d.getMonth()]} ${d.getDate()} <button data-act="fav" aria-label="Favourite">${e.fav ? I.starFull({ s: 19 }) : I.star({ s: 19 })}</button></h2>
        <p>${dayShort(d)} · ${d.getFullYear()}</p>
      </div>
      <div class="entry-actions">
        <button data-act="save" aria-label="Save">${I.download({ s: 22 })}</button>
        <button data-act="edit" aria-label="Edit">${I.edit({ s: 22 })}</button>
        <button data-act="more" aria-label="More">${I.dots({ s: 22 })}</button>
      </div>
    </div>
    ${photos ? `<div class="entry-photos">${photos}</div>` : ''}
    ${chips.length ? `<div class="chip-grid">${chips.map(id => iconChip(id)).join('')}</div>` : ''}
    ${e.note ? `<p class="entry-note">${esc(e.note)}</p>` : ''}
    ${(w || sleepTxt) ? `<div class="meta-row">
      ${w ? `<span class="meta-chip"><img src="${iconSrc(w.icon)}" alt="">${e.weather.tempF != null ? `${Math.round(e.weather.tempF)}°F` : esc(w.label)}</span>` : ''}
      ${sleepTxt ? `<span class="meta-chip"><img src="${iconSrc('1f319')}" alt="">${sleepTxt}</span>` : ''}
    </div>` : ''}
  </div>`;
}

function emptyCard(k) {
  const d = parseKey(k);
  return `<div class="card">
    <div class="entry-head">
      <span class="ic" style="width:46px;height:46px;background:var(--chip-off)"></span>
      <div class="entry-title"><h2>${MONTHS[d.getMonth()]} ${d.getDate()}</h2><p>${dayShort(d)} · ${d.getFullYear()}</p></div>
    </div>
    <div class="empty-day">Nothing recorded yet.
      <button data-act="edit">＋ Add an entry</button>
    </div>
  </div>`;
}

// ------------------------------------------------------------------- nav
function nav() {
  const b = (id, icon, label) =>
    `<button data-tab="${id}" class="${S.tab === id ? 'is-active' : ''}" aria-label="${label}">${icon}</button>`;
  return `<div class="nav">
    ${b('calendar', I.navCal({ s: 25 }), 'Calendar')}
    ${b('stats', I.navStats({ s: 25 }), 'Stats')}
    <div class="spacer"></div>
    ${b('archive', I.navArchive({ s: 25 }), 'Archive')}
    ${b('profile', I.navUser({ s: 25 }), 'Profile')}
  </div>
  <button class="fab" data-act="log" aria-label="Log today">${mascot(56)}</button>`;
}

// ---------------------------------------------------------------- render
export function render() {
  const app = $('#app');
  let screen = '';
  if (S.tab === 'calendar') screen = calendarScreen();
  else if (S.tab === 'stats') screen = renderStats(S);
  else if (S.tab === 'archive') screen = renderArchive(S);
  else screen = renderProfile(S);
  app.innerHTML = screen + nav();
}

// ---------------------------------------------------------------- actions
async function monthPicker() {
  const y0 = S.cursor.getFullYear();
  const body = h(`<div style="padding-bottom:18px">
    <div style="display:flex;align-items:center;justify-content:space-between;padding:4px 4px 14px">
      <button class="icon-btn" data-y="-1">${I.chevronLeft({ s: 22 })}</button>
      <b style="font-size:18px" data-year>${y0}</b>
      <button class="icon-btn" data-y="1">${I.chevronRight({ s: 22 })}</button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
      ${MONTHS.map((m, i) => `<button data-m="${i}" style="height:52px;border-radius:14px;background:var(--bg);font-size:15px">${m}</button>`).join('')}
    </div></div>`);
  let year = y0;
  const sheet = openSheet({ title: 'Jump to', body });
  body.addEventListener('click', e => {
    const yb = e.target.closest('[data-y]');
    if (yb) { year += Number(yb.dataset.y); body.querySelector('[data-year]').textContent = year; return; }
    const mb = e.target.closest('[data-m]');
    if (mb) { S.cursor = new Date(year, Number(mb.dataset.m), 1); sheet.close(); render(); }
  });
}

function themeSheet() {
  const opts = [['system', 'Match system'], ['light', 'Light'], ['dark', 'Dark']];
  const body = h(`<div style="padding-bottom:16px">${opts.map(([v, l]) =>
    `<button class="list-row" data-v="${v}" style="background:var(--bg);border-radius:14px;margin-bottom:8px">
      <span class="t"><b>${l}</b></span><span class="v">${S.settings.theme === v ? '✓' : ''}</span></button>`).join('')}</div>`);
  const sheet = openSheet({ title: 'Theme', body });
  body.onclick = async (e) => {
    const b = e.target.closest('[data-v]'); if (!b) return;
    S.settings.theme = b.dataset.v;
    await db.setSetting('settings', S.settings);
    applyTheme(); sheet.close();
  };
}

function menuSheet() {
  const rows = [
    ['log', 'Log today', I.plus({ s: 22 })],
    ['archive', 'Archive', I.navArchive({ s: 22 })],
    ['stats', 'Statistics', I.navStats({ s: 22 })],
    ['sections', 'Edit icon sections', I.tabPuzzle({ s: 22 })],
    ['export', 'Back up data', I.download({ s: 22 })],
    ['profile', 'Settings', I.gear({ s: 22 })]
  ];
  const body = h(`<div style="padding-bottom:16px">${rows.map(([a, l, ic]) =>
    `<button class="list-row" data-a="${a}" style="background:var(--bg);border-radius:14px;margin-bottom:8px">
      <span style="color:var(--ink-2)">${ic}</span><span class="t"><b>${l}</b></span></button>`).join('')}</div>`);
  const sheet = openSheet({ title: 'Menu', body });
  body.onclick = (e) => {
    const b = e.target.closest('[data-a]'); if (!b) return;
    sheet.close();
    const a = b.dataset.a;
    if (a === 'log') openEditor(todayKey());
    else if (a === 'sections') import('./sections.js').then(m => m.openSectionEditor());
    else if (a === 'export') exportBackup();
    else { S.tab = a; render(); }
  };
}

export async function exportBackup() {
  const json = await exportJSON();
  const blob = new Blob([json], { type: 'application/json' });
  const name = `mood-tracker-${todayKey()}.json`;
  const file = new File([blob], name, { type: 'application/json' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'Mood Tracker backup' }); return; } catch { /* cancelled */ }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast('Backup saved');
}

export async function importBackup(file) {
  try {
    const n = await importJSON(await file.text());
    await reload(); render();
    toast(`Imported ${n} ${n === 1 ? 'entry' : 'entries'}`);
  } catch (err) { toast('Could not read that file'); }
}

async function entryMenu(k) {
  const e = S.entries.get(k);
  const body = h(`<div style="padding-bottom:16px">
    <button class="list-row" data-a="edit" style="background:var(--bg);border-radius:14px;margin-bottom:8px"><span class="t"><b>Edit entry</b></span></button>
    <button class="list-row" data-a="fav" style="background:var(--bg);border-radius:14px;margin-bottom:8px"><span class="t"><b>${e?.fav ? 'Remove from favourites' : 'Add to favourites'}</b></span></button>
    <button class="list-row danger" data-a="del" style="background:var(--bg);border-radius:14px"><span class="t"><b>Delete entry</b></span></button>
  </div>`);
  const sheet = openSheet({ title: 'Entry', body });
  body.onclick = async (ev) => {
    const b = ev.target.closest('[data-a]'); if (!b) return;
    sheet.close();
    if (b.dataset.a === 'edit') openEditor(k);
    if (b.dataset.a === 'fav') await saveEntry({ ...e, fav: !e.fav });
    if (b.dataset.a === 'del') {
      const { confirmSheet } = await import('./ui.js');
      if (await confirmSheet('Delete entry', 'This entry will be removed from this device.')) deleteEntry(k);
    }
  };
}

// --------------------------------------------------------------- theming
export function applyTheme() {
  const t = S.settings.theme;
  if (t === 'system') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', t);
  const dark = t === 'dark' || (t === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', dark ? '#1B1D1A' : '#EFEFEA');
}

// ------------------------------------------------------------ global events
document.addEventListener('click', async (ev) => {
  const tab = ev.target.closest('[data-tab]');
  if (tab) { S.tab = tab.dataset.tab; render(); return; }

  const day = ev.target.closest('[data-day]');
  if (day) {
    const k = day.dataset.day;
    if (S.selected === k) { openEditor(k); return; }
    S.selected = k;
    document.querySelector('.day.is-selected')?.classList.remove('is-selected');
    day.classList.add('is-selected');
    paintDetail();
    document.querySelector('.card')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return;
  }

  const act = ev.target.closest('[data-act]');
  if (!act) return;
  const card = act.closest('[data-card]');
  const k = card?.dataset.card || S.selected || todayKey();
  switch (act.dataset.act) {
    case 'log': openEditor(todayKey()); break;
    case 'quick': openEditor(todayKey()); break;
    case 'edit': openEditor(k); break;
    case 'month': monthPicker(); break;
    case 'theme': themeSheet(); break;
    case 'menu': menuSheet(); break;
    case 'export': exportBackup(); break;
    case 'more': entryMenu(k); break;
    case 'fav': {
      const e = S.entries.get(k);
      if (!e) break;
      const next = { ...e, fav: !e.fav };
      S.entries.set(k, next);
      act.innerHTML = next.fav ? I.starFull({ s: 19 }) : I.star({ s: 19 });
      await db.put(next);
      break;
    }
    case 'save': {
      const e = S.entries.get(k);
      if (!e) return;
      const txt = entryText(e);
      if (navigator.share) { try { await navigator.share({ text: txt }); return; } catch {} }
      await navigator.clipboard?.writeText(txt); toast('Copied to clipboard');
      break;
    }
  }
});

export function entryText(e) {
  const d = parseKey(e.date);
  const emo = (e.emotions || []).map(id => EMOTIONS.find(x => x.id === id)?.label).filter(Boolean);
  return [
    `${dayLong(d)}, ${monthLong(d.getMonth())} ${d.getDate()} ${d.getFullYear()}`,
    `Mood: ${MOODS[e.mood].label}`,
    emo.length ? `Emotions: ${emo.join(', ')}` : '',
    e.note ? `\n${e.note}` : ''
  ].filter(Boolean).join('\n');
}

// ------------------------------------------------------------------- boot
(async function boot() {
  const saved = await db.setting('settings');
  if (saved) S.settings = { ...S.settings, ...saved };
  applyTheme();
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
  await reload();
  // deep link: #2026-04-01 opens that day, #log opens today's editor
  const hash = location.hash.slice(1);
  if (/^\d{4}-\d{2}-\d{2}$/.test(hash)) { S.selected = hash; S.cursor = parseKey(hash); }
  else S.selected = todayKey();
  render();
  if (hash === 'log') openEditor(todayKey());
  addEventListener('hashchange', () => {
    const k = location.hash.slice(1);
    if (/^\d{4}-\d{2}-\d{2}$/.test(k)) { S.selected = k; S.cursor = parseKey(k); S.tab = 'calendar'; render(); }
    else if (k === 'log') openEditor(todayKey());
  });
  if ('serviceWorker' in navigator) {
    const reg = () => navigator.serviceWorker.register('sw.js').catch(() => {});
    document.readyState === 'complete' ? reg() : addEventListener('load', reg);
  }
})();
