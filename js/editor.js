import { h, esc, I, openFull, openSheet, toast, confirmSheet } from './ui.js';
import { MOODS, moodFace } from './moods.js';
import { CATEGORIES, EMOTIONS, WEATHERS, EDITOR_SECTIONS, iconSrc, GREEN_CATEGORY_IDS, GREEN_ICONS } from './icons.js';

const TAB_ICONS = {
  face: I.tabFace, tree: I.tabTree, burger: I.tabFood, pin: I.tabPin,
  puzzle: I.tabPuzzle, box: I.tabBox, house: I.tabHouse, dumbbell: I.tabDumbbell
};

const WMO = (c) =>
  c === 0 ? 'sunny' : c <= 2 ? 'partly' : c === 3 ? 'cloudy'
  : c === 45 || c === 48 ? 'fog'
  : (c >= 71 && c <= 77) || c === 85 || c === 86 ? 'snow'
  : c >= 95 ? 'storm' : 'rain';

async function fetchWeather() {
  const pos = await new Promise((res, rej) =>
    navigator.geolocation.getCurrentPosition(res, rej, { timeout: 8000, maximumAge: 9e5 }));
  const { latitude, longitude } = pos.coords;
  const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,weather_code&temperature_unit=fahrenheit`);
  const j = await r.json();
  return { id: WMO(j.current.weather_code), tempF: j.current.temperature_2m };
}

// --------------------------------------------------------------- icon picker
export function openIconPicker(selected, onDone, startCat) {
  const chosen = new Set(selected);
  let tab = CATEGORIES.some(c => c.id === startCat) ? startCat : CATEGORIES[0].id;

  const body = h('<div><div class="tabs"></div><div class="pick-body"></div></div>');
  const tabs = body.querySelector('.tabs');
  const list = body.querySelector('.pick-body');

  const drawTabs = () => {
    tabs.innerHTML = CATEGORIES.map(c =>
      `<button data-cat="${c.id}" class="${c.id === tab ? 'is-active' : ''}">${TAB_ICONS[c.tab]({ s: 25 })}</button>`).join('');
  };
  const drawList = () => {
    const cat = CATEGORIES.find(c => c.id === tab);
    const green = GREEN_CATEGORY_IDS.has(cat.id);
    list.innerHTML = cat.sections.map(sec => `<div class="pick-section">
      <h4>${esc(sec.title)}</h4>
      <div class="pick-grid">${sec.items.map((id, i) => `
        <button data-icon="${id}" data-k="${id}|${i}">
          <span class="ic${green ? ' is-green' : ''}"${chosen.has(id) ? ' style="box-shadow:0 0 0 2.5px var(--accent)"' : ''}>
            <img src="${iconSrc(id)}" alt="" loading="lazy"></span>
        </button>`).join('')}</div></div>`).join('') + '<div style="height:20px"></div>';
  };
  drawTabs(); drawList();

  tabs.onclick = (e) => {
    const b = e.target.closest('[data-cat]'); if (!b) return;
    tab = b.dataset.cat; drawTabs(); drawList(); list.scrollTop = 0;
  };
  list.onclick = (e) => {
    const b = e.target.closest('[data-icon]'); if (!b) return;
    const id = b.dataset.icon;
    chosen.has(id) ? chosen.delete(id) : chosen.add(id);
    const ic = b.querySelector('.ic');
    ic.style.boxShadow = chosen.has(id) ? '0 0 0 2.5px var(--accent)' : '';
    count.textContent = chosen.size ? `${chosen.size} selected` : '';
  };

  const foot = h(`<div style="display:flex;gap:10px;width:100%;align-items:center">
    <span style="flex:1;color:var(--muted);font-size:13.5px;padding-left:4px"></span>
    <button class="btn btn-primary" style="flex:0 0 140px">Done</button></div>`);
  const count = foot.children[0];
  count.textContent = chosen.size ? `${chosen.size} selected` : '';

  const full = openFull({
    title: 'Select an icon',
    cls: 'is-picker',
    right: `<button class="icon-btn" data-close>${I.x({ s: 26 })}</button>`,
    body, foot
  });
  full.el.querySelector('.full-head .back').remove();
  full.el.querySelector('.full-head').style.justifyContent = 'space-between';
  full.el.querySelector('[data-close]').onclick = () => full.close();
  foot.children[1].onclick = () => { onDone([...chosen]); full.close(); };
}

// -------------------------------------------------------------- entry editor
export async function openEditor(dateKey) {
  const { S, saveEntry, deleteEntry, parseKey, dayLong, monthLong, render } = await import('./app.js');
  const d = parseKey(dateKey);
  const existing = S.entries.get(dateKey);
  const draft = {
    date: dateKey,
    mood: existing?.mood ?? 1,
    emotions: [...(existing?.emotions || [])],
    icons: [...(existing?.icons || [])],
    photos: [...(existing?.photos || [])],
    note: existing?.note || '',
    weather: existing?.weather || null,
    sleep: existing?.sleep || { mins: 0, count: 1 },
    fav: !!existing?.fav
  };
  let emotionsOpen = true;
  const collapsed = {};

  const body = h('<div style="padding:4px 0 24px"></div>');

  const card = (inner, cls = '') => `<div class="card ${cls}">${inner}</div>`;

  const draw = () => {
    body.innerHTML = [
      card(`<div class="mood-row">${MOODS.map((m, i) =>
        `<button data-mood="${i}">${moodFace(i, { size: 44, muted: draft.mood !== i })}</button>`).join('')}</div>`),

      card(`<div class="section-head"><h3>Emotions</h3>
        <button data-act="toggle-emo" class="icon-btn" style="color:var(--muted)">${emotionsOpen ? I.chevronUp({ s: 22 }) : I.chevronDown({ s: 22 })}</button></div>
        ${emotionsOpen ? `<div class="emotion-grid">${EMOTIONS.map(e => {
          const on = draft.emotions.includes(e.id);
          return `<button class="emotion${on ? ' is-on' : ''}" data-emo="${e.id}">
            <span class="ic${on ? '' : ' is-off'}"><img src="${iconSrc(e.icon)}" alt=""></span>
            <span>${esc(e.label)}</span></button>`;
        }).join('')}</div>` : ''}`),

      ...EDITOR_SECTIONS.map(sec => sectionCard(sec)),

      card(`<div class="section-head"><h3>Photo</h3></div>
        ${draft.photos.length ? `<div class="thumbs">${draft.photos.map((p, i) =>
          `<span class="thumb"><img src="${URL.createObjectURL(p)}" alt=""><button data-del-photo="${i}">✕</button></span>`).join('')}</div>
          <button class="photo-add" data-act="photo" style="height:52px;margin-top:12px">＋ Add another</button>`
        : `<button class="photo-add" data-act="photo">＋ Add a photo</button>`}
        <div class="field" style="margin-top:16px"><label>Note</label>
          <textarea class="input" rows="3" data-note placeholder="How was your day?">${esc(draft.note)}</textarea></div>`),

      card(`<div class="section-head"><h3>Weather</h3>
        <button data-act="auto-weather" style="color:var(--accent);font-weight:600;font-size:14px">Use my location</button></div>
        <div class="seg">${WEATHERS.map(w =>
          `<button data-weather="${w.id}" class="${draft.weather?.id === w.id ? 'is-on' : ''}">
            <img src="${iconSrc(w.icon)}" alt="">${esc(w.label)}</button>`).join('')}</div>
        ${draft.weather?.tempF != null ? `<p style="margin:12px 2px 0;color:var(--muted);font-size:13.5px">${Math.round(draft.weather.tempF)}°F</p>` : ''}
        <div class="section-head" style="margin:20px 0 12px"><h3>Sleep</h3></div>
        <div style="display:flex;gap:10px;align-items:center">
          <input class="input" style="flex:1" type="number" min="0" max="24" inputmode="numeric" data-sleep-h placeholder="h" value="${draft.sleep.mins ? Math.floor(draft.sleep.mins / 60) : ''}">
          <input class="input" style="flex:1" type="number" min="0" max="59" inputmode="numeric" data-sleep-m placeholder="m" value="${draft.sleep.mins ? draft.sleep.mins % 60 : ''}">
          <input class="input" style="flex:1" type="number" min="1" max="9" inputmode="numeric" data-sleep-c placeholder="sessions" value="${draft.sleep.count || 1}">
        </div>`)
    ].join('');
  };

  const sectionCard = (sec) => {
    const open = collapsed[sec.id] !== true;
    // anything picked from the browser that belongs here shows alongside the defaults
    const extras = draft.icons.filter(id => !sec.items.includes(id) && catOf(id) === sec.id);
    const items = [...sec.items, ...extras];
    const chip = (id) => {
      const on = draft.icons.includes(id);
      const green = sec.green || GREEN_ICONS.has(id);
      return `<span class="ic${on ? '' : ' is-off'}${green ? ' is-green' : ''}"><img src="${iconSrc(id)}" alt="" loading="lazy"></span>`;
    };
    const body = sec.labels
      ? `<div class="emotion-grid">${sec.labels.map(p => {
          const on = draft.icons.includes(p.icon);
          return `<button class="emotion${on ? ' is-on' : ''}" data-icon="${p.icon}">
            ${chip(p.icon)}<span>${esc(p.label)}</span></button>`;
        }).join('')}</div>`
      : `<div class="pick-grid">${items.map(id =>
          `<button data-icon="${id}">${chip(id)}</button>`).join('')}
          <button data-act="pick" data-pick-cat="${sec.id}"><span class="add-chip">＋</span></button></div>`;
    return card(`<div class="section-head"><h3>${esc(sec.title)}</h3>
      <button data-collapse="${sec.id}" class="icon-btn" style="color:var(--muted)">${open ? I.chevronUp({ s: 22 }) : I.chevronDown({ s: 22 })}</button></div>
      ${open ? body : ''}`);
  };

  const catOf = (id) => {
    for (const c of CATEGORIES) for (const s of c.sections) if (s.items.includes(id)) return c.id;
    return null;
  };

  draw();

  const foot = h(`<div style="display:flex;gap:10px;width:100%">
    <button class="btn btn-square" data-act="fav">${draft.fav ? I.starFull({ s: 22 }) : I.star({ s: 22 })}</button>
    <button class="btn btn-primary" data-act="done">Done</button></div>`);

  const full = openFull({
    title: `${dayLong(d)}, ${monthLong(d.getMonth())} ${d.getDate()}`,
    titleTrailing: I.chevronDown({ s: 17 }),
    right: `<button class="icon-btn" data-act="gear">${I.gear({ s: 22 })}</button>`,
    body, foot
  });

  const readInputs = () => {
    const q = (s) => full.el.querySelector(s);
    draft.note = q('[data-note]')?.value ?? draft.note;
    const hh = Number(q('[data-sleep-h]')?.value || 0), mm = Number(q('[data-sleep-m]')?.value || 0);
    draft.sleep = { mins: hh * 60 + mm, count: Number(q('[data-sleep-c]')?.value || 1) };
  };

  full.el.addEventListener('click', async (ev) => {
    const t = ev.target;
    const moodBtn = t.closest('[data-mood]');
    if (moodBtn) { readInputs(); draft.mood = Number(moodBtn.dataset.mood); draw(); return; }

    const emo = t.closest('[data-emo]');
    if (emo) {
      readInputs();
      const id = emo.dataset.emo;
      draft.emotions = draft.emotions.includes(id) ? draft.emotions.filter(x => x !== id) : [...draft.emotions, id];
      draw(); return;
    }

    const iconBtn = t.closest('[data-icon]');
    if (iconBtn) {
      readInputs();
      const id = iconBtn.dataset.icon;
      draft.icons = draft.icons.includes(id) ? draft.icons.filter(x => x !== id) : [...draft.icons, id];
      draw(); return;
    }

    const col = t.closest('[data-collapse]');
    if (col) { readInputs(); const k = col.dataset.collapse; collapsed[k] = !collapsed[k]; draw(); return; }

    const delPhoto = t.closest('[data-del-photo]');
    if (delPhoto) { readInputs(); draft.photos.splice(Number(delPhoto.dataset.delPhoto), 1); draw(); return; }

    const w = t.closest('[data-weather]');
    if (w) {
      readInputs();
      draft.weather = draft.weather?.id === w.dataset.weather ? null : { id: w.dataset.weather, tempF: draft.weather?.tempF ?? null };
      draw(); return;
    }

    const act = t.closest('[data-act]')?.dataset.act;
    if (!act) return;
    if (act === 'toggle-emo') { readInputs(); emotionsOpen = !emotionsOpen; draw(); }
    if (act === 'pick') {
      readInputs();
      const startCat = t.closest('[data-pick-cat]')?.dataset.pickCat;
      openIconPicker(draft.icons, (ids) => { draft.icons = ids; draw(); }, startCat);
    }
    if (act === 'photo') {
      readInputs();
      const inp = h('<input type="file" accept="image/*" multiple hidden>');
      document.body.append(inp);
      inp.onchange = async () => {
        for (const f of inp.files) draft.photos.push(await shrink(f));
        inp.remove(); draw();
      };
      inp.click();
    }
    if (act === 'auto-weather') {
      try {
        toast('Checking the weather…');
        draft.weather = await fetchWeather();
        draw();
      } catch { toast('Could not get your location'); }
    }
    if (act === 'fav') {
      draft.fav = !draft.fav;
      foot.children[0].innerHTML = draft.fav ? I.starFull({ s: 22 }) : I.star({ s: 22 });
    }
    if (act === 'gear') {
      const inner = h(`<div style="padding-bottom:16px">
        <button class="list-row danger" data-a="del" style="background:var(--bg);border-radius:14px"><span class="t"><b>Delete this entry</b></span></button></div>`);
      const sheet = openSheet({ title: 'Entry options', body: inner });
      inner.onclick = async () => {
        sheet.close();
        if (await confirmSheet('Delete entry', 'This entry will be removed from this device.')) {
          await deleteEntry(dateKey); full.close();
        }
      };
    }
    if (act === 'done') {
      readInputs();
      await saveEntry(draft);
      S.selected = dateKey;
      render();
      full.close();
    }
  });

  // auto weather on a fresh entry for today
  if (!existing && S.settings.autoWeather && dateKey === new Date().toISOString().slice(0, 10)) {
    fetchWeather().then(w => { draft.weather = w; draw(); }).catch(() => {});
  }
}

// downscale photos so a phone's storage quota lasts
async function shrink(file, max = 1280, quality = 0.82) {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    return await new Promise(res => c.toBlob(b => res(b || file), 'image/jpeg', quality));
  } catch { return file; }
}
