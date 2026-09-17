import { I } from './ui.js';
import { MOODS, moodFace, pod } from './moods.js';

const pad = (n) => String(n).padStart(2, '0');
const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function monthEntries(S, y, m) {
  const out = [];
  const days = new Date(y, m + 1, 0).getDate();
  for (let d = 1; d <= days; d++) {
    const e = S.entries.get(`${y}-${pad(m + 1)}-${pad(d)}`);
    if (e) out.push({ day: d, mood: e.mood });
  }
  return { days, points: out };
}

// deterministic stand-in series, shown faded behind the "add an entry" tip
function samplePoints(days) {
  const out = []; let seed = 7;
  for (let d = 1; d <= days; d++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    out.push({ day: d, mood: seed % 5 });
  }
  return out;
}

function flowChart(points, days, sample, month) {
  const W = 340, H = 150, L = 34, R = 8, T = 10, B = 26;
  const x = (d) => L + (d - 1) / Math.max(1, days) * (W - L - R);
  const y = (m) => T + m / 4 * (H - T - B);
  const ticks = [];
  for (let d = 1; d <= days; d += 5) ticks.push(d);
  ticks.push(days + 1);                       // first of next month, as the app shows
  const label = (d) => d > days
    ? `${(month + 1) % 12 + 1}/1`
    : `${month + 1}/${d}`;

  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(p.day).toFixed(1)} ${y(p.mood).toFixed(1)}`).join(' ');
  return `<svg class="chart${sample ? ' is-sample' : ''}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Mood over the month">
    ${MOODS.map((m, i) => `<circle cx="${L - 20}" cy="${y(i)}" r="7" fill="${m.color}"/>`).join('')}
    ${ticks.map(d => `<line x1="${x(d)}" y1="${T - 4}" x2="${x(d)}" y2="${H - B}" stroke="var(--hair)" stroke-width="1"/>`).join('')}
    ${points.length > 1 ? `<path d="${path}" fill="none" stroke="#9CC48C" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>` : ''}
    ${points.map(p => `<circle cx="${x(p.day)}" cy="${y(p.mood)}" r="3.4" fill="#8FBB7C"/>`).join('')}
    ${ticks.map(d => `<text x="${x(d)}" y="${H - 8}" text-anchor="middle" font-size="10" fill="var(--muted)">${label(d)}</text>`).join('')}
  </svg>`;
}

function barChart(points, sample) {
  const counts = [0, 0, 0, 0, 0];
  points.forEach(p => counts[p.mood]++);
  const max = Math.max(1, ...counts);
  return `<div class="${sample ? 'is-sample' : ''}">
    <div style="display:grid;grid-template-columns:repeat(5,1fr);align-items:end;gap:10px;height:132px">
      ${counts.map((c, i) => `<div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;gap:6px">
        <small style="font-size:11.5px;color:var(--muted)">${c || ''}</small>
        <div style="width:70%;height:${Math.max(4, c / max * 92)}px;background:${MOODS[i].color};border-radius:8px 8px 4px 4px"></div>
      </div>`).join('')}
    </div>
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;padding-top:10px;justify-items:center">
      ${MOODS.map((m, i) => moodFace(i, { size: 34 })).join('')}
    </div></div>`;
}

function yearGrid(S, year) {
  let html = '<div class="year-grid">';
  for (let m = 0; m < 12; m++) {
    const days = new Date(year, m + 1, 0).getDate();
    const lead = new Date(year, m, 1).getDay();
    let cells = '';
    for (let i = 0; i < lead; i++) cells += '<i style="background:transparent"></i>';
    for (let d = 1; d <= days; d++) {
      const e = S.entries.get(`${year}-${pad(m + 1)}-${pad(d)}`);
      cells += `<i${e ? ` style="background:${MOODS[e.mood].color}"` : ''}></i>`;
    }
    html += `<div class="ym"><h5>${MON[m]}</h5><div class="cells">${cells}</div></div>`;
  }
  return html + '</div>';
}

export function renderStats(S) {
  const cur = S.cursor;
  const y = cur.getFullYear(), m = cur.getMonth();
  const { days, points } = monthEntries(S, y, m);
  const sample = points.length === 0;
  const flowPts = sample ? samplePoints(days) : points;

  const monthly = `
    <div class="month-head">
      <button class="month-title" data-act="month">${MON[m]} ${y}${I.chevronDown({ s: 18 })}</button>
    </div>
    <div class="card">
      <div class="stat-head"><h3>Mood Flow</h3>${sample ? '<span class="pill-sample">Sample</span>' : ''}</div>
      ${sample ? `<div class="tip">${tipIcon()}Please add an entry.</div>` : ''}
      ${flowChart(flowPts, days, sample, m)}
    </div>
    <div class="card">
      <div class="stat-head"><h3>Mood Bar</h3>${sample ? '<span class="pill-sample">Sample</span>' : ''}</div>
      ${sample ? `<div class="tip">${tipIcon()}Please add an entry.</div>` : ''}
      ${barChart(flowPts, sample)}
    </div>`;

  const yearCount = [...S.entries.keys()].filter(k => k.startsWith(String(S.statsYear))).length;
  const annual = `
    <div class="month-head">
      <button class="month-title" data-stats="year">${S.statsYear}${I.chevronDown({ s: 18 })}</button>
    </div>
    <div class="card">
      <div class="stat-head"><h3>Year in moods</h3><span class="v" style="color:var(--muted);font-size:13.5px">${yearCount} ${yearCount === 1 ? 'entry' : 'entries'}</span></div>
      ${yearGrid(S, S.statsYear)}
      <div class="legend">${MOODS.map(m2 => `<span><i style="background:${m2.color}"></i>${m2.label}</span>`).join('')}</div>
    </div>`;

  return `<section class="screen is-active" id="s-stats">
    <div class="topbar">
      <button class="avatar-pill" data-act="quick">${pod(26)}${I.chevronDown({ s: 16 })}</button>
      <div class="topbar-right">
        <button class="icon-btn" data-act="theme">${I.palette({ s: 24 })}</button>
        <button class="icon-btn" data-act="menu">${I.menu({ s: 24 })}</button>
      </div>
    </div>
    <div class="subtabs">
      <button data-stats="monthly" class="${S.statsMode === 'monthly' ? 'is-active' : ''}">Monthly</button>
      <button data-stats="annual" class="${S.statsMode === 'annual' ? 'is-active' : ''}">Annual</button>
    </div>
    ${S.statsMode === 'monthly' ? monthly : annual}
  </section>`;
}

const tipIcon = () => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
  <path d="M9.5 17h5M10 20h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.5.4.8 1 .8 1.6h5.4c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3z"/></svg>`;

document.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-stats]');
  if (!b) return;
  const { S, render } = await import('./app.js');
  const v = b.dataset.stats;
  if (v === 'monthly' || v === 'annual') { S.statsMode = v; render(); return; }
  if (v === 'year') {
    const { openSheet, h } = await import('./ui.js');
    const now = new Date().getFullYear();
    const years = [...Array(8)].map((_, i) => now - i);
    const body = h(`<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding-bottom:18px">
      ${years.map(yy => `<button data-y="${yy}" style="height:52px;border-radius:14px;background:var(--bg);font-size:15px">${yy}</button>`).join('')}</div>`);
    const sheet = openSheet({ title: 'Choose a year', body });
    body.onclick = (ev) => {
      const yb = ev.target.closest('[data-y]'); if (!yb) return;
      S.statsYear = Number(yb.dataset.y); sheet.close(); render();
    };
  }
});
