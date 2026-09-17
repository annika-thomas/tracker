import { h, I, openSheet, toast, confirmSheet } from './ui.js';
import { pod, mascot, MOODS, moodFace } from './moods.js';

const pad = (n) => String(n).padStart(2, '0');

function streak(S) {
  let n = 0;
  const d = new Date();
  if (!S.entries.has(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`)) d.setDate(d.getDate() - 1);
  for (;;) {
    const k = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    if (!S.entries.has(k)) break;
    n++; d.setDate(d.getDate() - 1);
  }
  return n;
}

export function renderProfile(S) {
  const all = [...S.entries.values()];
  const now = new Date();
  const thisMonth = all.filter(e => e.date.startsWith(`${now.getFullYear()}-${pad(now.getMonth() + 1)}`)).length;
  const avg = all.length ? all.reduce((a, e) => a + e.mood, 0) / all.length : null;
  const themeLabel = { system: 'Match system', light: 'Light', dark: 'Dark' }[S.settings.theme];

  return `<section class="screen is-active" id="s-profile">
    <div class="topbar">
      <button class="avatar-pill" data-act="quick">${pod(26)}${I.chevronDown({ s: 16 })}</button>
      <div class="topbar-right">
        <button class="icon-btn" data-act="theme">${I.palette({ s: 24 })}</button>
        <button class="icon-btn" data-act="menu">${I.menu({ s: 24 })}</button>
      </div>
    </div>
    <div class="month-head"><div class="month-title">Profile</div></div>

    <div style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:6px 0 20px">
      ${avg == null ? mascot(78) : moodFace(Math.round(avg), { size: 78 })}
      <b style="font-size:17px">${all.length ? `Mostly ${MOODS[Math.round(avg)].label}` : 'No entries yet'}</b>
      <small style="color:var(--muted)">${all.length ? `across ${all.length} ${all.length === 1 ? 'day' : 'days'}` : 'Tap the bean to log today'}</small>
    </div>

    <div class="stat-cards">
      <div class="stat-card"><b>${all.length}</b><small>entries</small></div>
      <div class="stat-card"><b>${streak(S)}</b><small>day streak</small></div>
      <div class="stat-card"><b>${thisMonth}</b><small>this month</small></div>
    </div>

    <p class="list-title">Appearance</p>
    <div class="list">
      <button class="list-row" data-act="theme"><span class="t"><b>Theme</b></span><span class="v">${themeLabel}</span></button>
      <button class="list-row" data-prof="weekstart"><span class="t"><b>Week starts on</b></span><span class="v">${S.settings.weekStart === 0 ? 'Sunday' : 'Monday'}</span></button>
    </div>

    <p class="list-title">Entries</p>
    <div class="list">
      <button class="list-row" data-prof="sections"><span class="t"><b>Icons in each section</b><small>Add, remove, or move icons between sections</small></span><span class="v">›</span></button>
      <button class="list-row" data-prof="autoweather"><span class="t"><b>Fill weather automatically</b><small>Uses your location, nothing is uploaded</small></span><span class="v">${S.settings.autoWeather ? 'On' : 'Off'}</span></button>
    </div>

    <p class="list-title">Your data · stored on this device only</p>
    <div class="list">
      <button class="list-row" data-act="export"><span style="color:var(--ink-2)">${I.download({ s: 21 })}</span><span class="t"><b>Back up to a file</b><small>JSON, includes photos</small></span></button>
      <button class="list-row" data-prof="import"><span style="color:var(--ink-2)">${I.share({ s: 21 })}</span><span class="t"><b>Restore from a file</b></span></button>
      <button class="list-row" data-prof="sample"><span style="color:var(--ink-2)">${I.plus({ s: 21 })}</span><span class="t"><b>Load sample month</b><small>See how the charts look</small></span></button>
      <button class="list-row danger" data-prof="wipe"><span>${I.trash({ s: 21 })}</span><span class="t"><b>Erase everything</b></span></button>
    </div>

    <p class="list-title" style="padding-bottom:20px">Mood Tracker · works offline · add to your home screen to use it like an app</p>
  </section>`;
}

document.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-prof]');
  if (!b) return;
  const { S, render, reload, saveEntry } = await import('./app.js');
  const { db } = await import('./db.js');
  const v = b.dataset.prof;

  if (v === 'sections') {
    const { openSectionEditor } = await import('./sections.js');
    openSectionEditor();
  }
  if (v === 'weekstart') {
    S.settings.weekStart = S.settings.weekStart === 0 ? 1 : 0;
    await db.setSetting('settings', S.settings); render();
  }
  if (v === 'autoweather') {
    S.settings.autoWeather = !S.settings.autoWeather;
    await db.setSetting('settings', S.settings); render();
  }
  if (v === 'import') {
    const inp = h('<input type="file" accept="application/json,.json" hidden>');
    document.body.append(inp);
    inp.onchange = async () => {
      const { importBackup } = await import('./app.js');
      if (inp.files[0]) await importBackup(inp.files[0]);
      inp.remove();
    };
    inp.click();
  }
  if (v === 'sample') {
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth();
    const days = Math.min(new Date(y, m + 1, 0).getDate(), now.getDate());
    const EM = ['excited','relaxed','proud','happy','calm','grateful','tired','anxious','bored','stressed'];
    const ICONS = ['1f6cb','1f4d6','2615','1f3c3','1f4bb','1f36b','1f3ae','1f9f9','1f6cf','1f33f','1f37a','1f4de'];
    let seed = 42;
    const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    for (let d = 1; d <= days; d++) {
      const k = `${y}-${pad(m + 1)}-${pad(d)}`;
      if (S.entries.has(k)) continue;
      const mood = Math.min(4, Math.floor(rnd() * 3 + (rnd() > .82 ? 2 : 0)));
      await db.put({
        date: k, mood,
        emotions: EM.filter(() => rnd() > .78).slice(0, 4),
        icons: ICONS.filter(() => rnd() > .7).slice(0, 8),
        photos: [], note: '', fav: rnd() > .9,
        weather: { id: ['sunny','partly','cloudy','rain'][Math.floor(rnd() * 4)], tempF: Math.round(48 + rnd() * 34) },
        sleep: { mins: Math.round((6 + rnd() * 3) * 60), count: 1 }
      });
    }
    await reload(); render(); toast('Sample month loaded');
  }
  if (v === 'wipe') {
    if (await confirmSheet('Erase everything', 'Every entry and photo on this device will be deleted. This cannot be undone.', 'Erase')) {
      await db.clear(); await reload(); render(); toast('All entries erased');
    }
  }
});
