// Small UI kit: DOM helpers, line icons, sheets, toasts.
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function h(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const S = (p, o = {}) => `<svg width="${o.s || 24}" height="${o.s || 24}" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="${o.w || 1.8}" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;

export const I = {
  chevronDown: (o) => S('<path d="M6 9l6 6 6-6"/>', { w: 2.2, ...o }),
  chevronLeft: (o) => S('<path d="M15 5l-7 7 7 7"/>', { w: 2.2, ...o }),
  chevronUp: (o) => S('<path d="M6 15l6-6 6 6"/>', { w: 2.2, ...o }),
  chevronRight: (o) => S('<path d="M9 5l7 7-7 7"/>', { w: 2, ...o }),
  menu: (o) => S('<path d="M4 7h16M4 12h16M4 17h16"/>', { w: 1.9, ...o }),
  palette: (o) => S('<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.8 1.8-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.1 0-1 .8-1.7 1.8-1.7H16a5 5 0 0 0 5-5c0-4-4-7.3-9-7.3z"/><circle cx="7.5" cy="11.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="11" cy="7.8" r="1.1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="8.6" r="1.1" fill="currentColor" stroke="none"/>', o),
  share: (o) => S('<path d="M12 15V4m0 0L8.5 7.5M12 4l3.5 3.5"/><path d="M5 13v5.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V13"/>', o),
  download: (o) => S('<path d="M12 4v10m0 0l3.5-3.5M12 14l-3.5-3.5"/><path d="M5 15v3.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V15"/>', o),
  edit: (o) => S('<path d="M5 19h3l9.5-9.5a2.1 2.1 0 0 0-3-3L5 16v3z"/><path d="M14 6.5l3.5 3.5"/>', o),
  dots: (o) => S('<circle cx="5.5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="18.5" cy="12" r="1.4" fill="currentColor" stroke="none"/>', o),
  star: (o) => S('<path d="M12 4.2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 9.9l5.4-.8z"/>', { w: 1.6, ...o }),
  starFull: (o) => `<svg width="${o?.s || 24}" height="${o?.s || 24}" viewBox="0 0 24 24" fill="#F0B429"><path d="M12 4.2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 9.9l5.4-.8z"/></svg>`,
  gear: (o) => S('<circle cx="12" cy="12" r="3.2"/><path d="M19.4 14.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5v.2a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1h.2a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>', { w: 1.5, ...o }),
  x: (o) => S('<path d="M6 6l12 12M18 6L6 18"/>', { w: 2.1, ...o }),
  plus: (o) => S('<path d="M12 5v14M5 12h14"/>', { w: 2, ...o }),
  search: (o) => S('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>', o),
  trash: (o) => S('<path d="M4 7h16M10 4h4M9 7v12m6-12v12M6 7l1 13h10l1-13"/>', { w: 1.7, ...o }),
  heart: (o) => S('<path d="M12 20s-7-4.3-7-9.2A4 4 0 0 1 12 8a4 4 0 0 1 7-1.2c0 4.9-7 13.2-7 13.2z"/>', o),
  // nav
  navCal: (o) => S('<rect x="3.5" y="5" width="17" height="15.5" rx="3.4"/><path d="M3.5 9.6h17"/><circle cx="8.6" cy="14.4" r="1.15" fill="currentColor" stroke="none"/><circle cx="12" cy="14.4" r="1.15" fill="currentColor" stroke="none"/><circle cx="15.4" cy="14.4" r="1.15" fill="currentColor" stroke="none"/>', o),
  navStats: (o) => `<svg width="${o?.s || 24}" height="${o?.s || 24}" viewBox="0 0 24 24" fill="currentColor"><rect x="3.6" y="12" width="4" height="8.5" rx="1.6"/><rect x="10" y="7" width="4" height="13.5" rx="1.6"/><rect x="16.4" y="14" width="4" height="6.5" rx="1.6"/></svg>`,
  navArchive: (o) => S('<rect x="3.5" y="4.8" width="17" height="4.6" rx="1.6"/><path d="M5 9.4v8.3a1.6 1.6 0 0 0 1.6 1.6h10.8a1.6 1.6 0 0 0 1.6-1.6V9.4"/><path d="M10 13h4"/>', o),
  navUser: (o) => S('<circle cx="12" cy="8.6" r="3.9"/><path d="M4.6 20c.6-3.8 3.7-6 7.4-6s6.8 2.2 7.4 6"/>', o),
  // picker tabs
  tabFace: (o) => S('<circle cx="12" cy="12" r="8.6"/><circle cx="9.2" cy="10.4" r=".9" fill="currentColor" stroke="none"/><circle cx="14.8" cy="10.4" r=".9" fill="currentColor" stroke="none"/><path d="M9.2 14.4c1.7 1.5 4 1.5 5.6 0"/>', { w: 1.6, ...o }),
  tabTree: (o) => S('<path d="M12 3.4L5.6 13.2h12.8z"/><path d="M12 13.2v6.8"/><path d="M8.2 17.4h7.6"/>', { w: 1.6, ...o }),
  tabFood: (o) => S('<path d="M4 9.6c0-2.8 3.6-5 8-5s8 2.2 8 5"/><path d="M3.6 12.6h16.8M4.4 16c1.4 1.6 3 2.6 7.6 2.6s6.2-1 7.6-2.6"/>', { w: 1.6, ...o }),
  tabPin: (o) => S('<path d="M12 21s6.4-6.2 6.4-10.4A6.4 6.4 0 0 0 5.6 10.6C5.6 14.8 12 21 12 21z"/><circle cx="12" cy="10.4" r="2.2"/>', { w: 1.6, ...o }),
  tabPuzzle: (o) => S('<path d="M10 5.2h2.6a1.9 1.9 0 1 1 3.8 0H19a1 1 0 0 1 1 1v2.6a1.9 1.9 0 1 1 0 3.8V16a1 1 0 0 1-1 1h-2.6a1.9 1.9 0 1 0-3.8 0H10a1 1 0 0 1-1-1v-2.6a1.9 1.9 0 1 1 0-3.8V6.2a1 1 0 0 1 1-1z" transform="translate(-.5 1.5)"/>', { w: 1.6, ...o }),
  tabBox: (o) => S('<path d="M12 3.4l8 4.3v8.6l-8 4.3-8-4.3V7.7z"/><path d="M4 7.7l8 4.3 8-4.3M12 12v8.6"/>', { w: 1.6, ...o }),
  tabHouse: (o) => S('<path d="M4.4 10.6L12 4.4l7.6 6.2v8.2a1.4 1.4 0 0 1-1.4 1.4H5.8a1.4 1.4 0 0 1-1.4-1.4z"/>', { w: 1.6, ...o }),
  tabDumbbell: (o) => S('<path d="M3.4 13.6l-.9-.9a1.6 1.6 0 0 1 0-2.3l.9-.9M20.6 10.4l.9.9a1.6 1.6 0 0 1 0 2.3l-.9.9"/><rect x="4" y="8.4" width="3.4" height="7.2" rx="1.3"/><rect x="16.6" y="8.4" width="3.4" height="7.2" rx="1.3"/><path d="M7.4 12h9.2"/>', { w: 1.6, ...o })
};

// ------------------------------------------------------------------ sheets
const layer = () => document.getElementById('sheets');

export function openSheet({ title, body, foot, onClose }) {
  const wrap = h(`<div class="sheet-wrap"><div class="sheet">
    <div class="sheet-head"><h2>${esc(title)}</h2><button class="x" aria-label="Close">${I.x({ s: 26 })}</button></div>
    <div class="sheet-body"></div>
    ${foot ? '<div class="sheet-foot"></div>' : ''}
  </div></div>`);
  wrap.querySelector('.sheet-body').append(body);
  if (foot) wrap.querySelector('.sheet-foot').append(foot);
  const close = () => { wrap.remove(); onClose && onClose(); };
  wrap.querySelector('.x').onclick = close;
  wrap.addEventListener('click', e => { if (e.target === wrap) close(); });
  layer().append(wrap);
  return { el: wrap, close };
}

export function openFull({ title, titleTrailing = '', right = '', body, foot, onBack, cls = '' }) {
  const wrap = h(`<div class="full ${cls}">
    <div class="full-head">
      <button class="icon-btn back">${I.chevronLeft({ s: 26 })}</button>
      <h1>${esc(title)}${titleTrailing}</h1>
      <div class="right">${right}</div>
    </div>
    <div class="full-body"></div>
    ${foot ? '<div class="full-foot"></div>' : ''}
  </div>`);
  wrap.querySelector('.full-body').append(body);
  if (foot) wrap.querySelector('.full-foot').append(foot);
  const close = () => { wrap.remove(); onBack && onBack(); };
  wrap.querySelector('.back').onclick = close;
  layer().append(wrap);
  return { el: wrap, close };
}

let toastTimer;
export function toast(msg) {
  document.querySelector('.toast')?.remove();
  const t = h(`<div class="toast">${esc(msg)}</div>`);
  document.body.append(t);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.remove(), 2200);
}

export function confirmSheet(title, message, danger = 'Delete') {
  return new Promise(res => {
    const body = h(`<p style="padding:0 2px 16px;color:var(--ink-2);font-size:15px">${esc(message)}</p>`);
    const foot = h(`<div style="display:flex;gap:10px;width:100%">
      <button class="btn btn-ghost" style="flex:1">Cancel</button>
      <button class="btn btn-primary" style="background:#C4544F">${esc(danger)}</button></div>`);
    const s = openSheet({ title, body, foot, onClose: () => res(false) });
    foot.children[0].onclick = () => { s.close(); res(false); };
    foot.children[1].onclick = () => { s.el.remove(); res(true); };
  });
}
