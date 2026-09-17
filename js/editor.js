import { h, esc, I, openFull, openSheet, toast, confirmSheet } from './ui.js';
import { MOODS, moodFace } from './moods.js';
import { CATEGORIES, EMOTIONS, WEATHERS, EDITOR_SECTIONS, iconSrc, GREEN_CATEGORY_IDS, GREEN_ICONS } from './icons.js';
import { label } from './labels.js';

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

const catOf = (id) => {
  for (const c of CATEGORIES) for (const s of c.sections) if (s.items.includes(id)) return c.id;
  return null;
};

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
      <div class="pick-grid">${sec.items.map(id => `
        <button data-icon="${id}">
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
    b.querySelector('.ic').style.boxShadow = chosen.has(id) ? '0 0 0 2.5px var(--accent)' : '';
    count.textContent = chosen.size ? `${chosen.size} selected` : '';
  };

  const foot = h(`<div style="display:flex;gap:10px;width:100%;align-items:center">
    <span style="flex:1;color:var(--muted);font-size:13.5px;padding-left:4px"></span>
    <button class="btn btn-primary" style="flex:0 0 140px">Done</button></div>`);
  const count = foot.children[0];
  count.textContent = chosen.size ? `${chosen.size} selected` : '';

  const full = openFull({
    title: 'Select an icon', cls: 'is-picker',
    right: `<button class="icon-btn" data-close>${I.x({ s: 26 })}</button>`,
    body, foot
  });
  full.el.querySelector('.full-head .back').remove();
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
  const urls = new Map();                       // photo blob -> object URL, made once
  const urlFor = (p) => {
    if (!urls.has(p)) urls.set(p, URL.createObjectURL(p));
    return urls.get(p);
  };

  const chipHTML = (id, on, green) =>
    `<span class="ic${on ? '' : ' is-off'}${green ? ' is-green' : ''}"><img src="${iconSrc(id)}" alt="" loading="lazy"></span>`;

  const labelledCell = (id, on, green, text) =>
    `<button class="emotion${on ? ' is-on' : ''}" data-icon="${id}">
      ${chipHTML(id, on, green)}<span>${esc(text)}</span></button>`;

  const card = (inner, attrs = '') => `<div class="card"${attrs}>${inner}</div>`;

  const sectionHTML = (sec) => {
    const extras = draft.icons.filter(id => !sec.items.includes(id) && catOf(id) === sec.id);
    const items = [...sec.items, ...extras];
    const cells = items.map(id =>
      labelledCell(id, draft.icons.includes(id), sec.green || GREEN_ICONS.has(id), sec.labels
        ? sec.labels.find(p => p.icon === id)?.label || label(id)
        : label(id))).join('');
    return card(`<div class="section-head"><h3>${esc(sec.title)}</h3>
      <button data-collapse="${sec.id}" class="icon-btn" style="color:var(--muted)">${I.chevronUp({ s: 22 })}</button></div>
      <div data-body="${sec.id}">
        <div class="emotion-grid">${cells}
          <button class="emotion" data-act="pick" data-pick-cat="${sec.id}">
            <span class="add-chip">＋</span><span>more</span></button>
        </div>
      </div>`);
  };

  const body = h('<div style="padding:4px 0 24px"></div>');
  body.innerHTML = [
    card(`<div class="mood-row" data-moods>${MOODS.map((m, i) =>
      `<button data-mood="${i}">${moodFace(i, { size: 44, muted: draft.mood !== i })}</button>`).join('')}</div>`),

    card(`<div class="section-head"><h3>Emotions</h3>
      <button data-collapse="emotions" class="icon-btn" style="color:var(--muted)">${I.chevronUp({ s: 22 })}</button></div>
      <div data-body="emotions"><div class="emotion-grid">${EMOTIONS.map(e =>
        `<button class="emotion${draft.emotions.includes(e.id) ? ' is-on' : ''}" data-emo="${e.id}">
          ${chipHTML(e.icon, draft.emotions.includes(e.id), false)}<span>${esc(e.label)}</span></button>`).join('')}</div></div>`),

    ...EDITOR_SECTIONS.map(sectionHTML),

    card(`<div class="section-head"><h3>Photo</h3></div>
      <div data-photos></div>
      <div class="field" style="margin-top:16px"><label for="entry-note">Note</label>
        <textarea class="input" rows="3" id="entry-note" data-note placeholder="How was your day?">${esc(draft.note)}</textarea></div>`),

    card(`<div class="section-head"><h3>Weather</h3>
      <button data-act="auto-weather" style="color:var(--accent);font-weight:600;font-size:14px">Use my location</button></div>
      <div class="seg" data-weathers>${WEATHERS.map(w =>
        `<button data-weather="${w.id}" class="${draft.weather?.id === w.id ? 'is-on' : ''}">
          <img src="${iconSrc(w.icon)}" alt="">${esc(w.label)}</button>`).join('')}</div>
      <p data-temp style="margin:12px 2px 0;color:var(--muted);font-size:13.5px"${draft.weather?.tempF == null ? ' hidden' : ''}>${
        draft.weather?.tempF != null ? Math.round(draft.weather.tempF) + '°F' : ''}</p>
      <div class="section-head" style="margin:20px 0 12px"><h3>Sleep</h3></div>
      <div style="display:flex;gap:10px;align-items:center">
        <input class="input" style="flex:1" type="number" min="0" max="24" inputmode="numeric" id="sleep-h" data-sleep-h placeholder="h" value="${draft.sleep.mins ? Math.floor(draft.sleep.mins / 60) : ''}">
        <input class="input" style="flex:1" type="number" min="0" max="59" inputmode="numeric" id="sleep-m" data-sleep-m placeholder="m" value="${draft.sleep.mins ? draft.sleep.mins % 60 : ''}">
        <input class="input" style="flex:1" type="number" min="1" max="9" inputmode="numeric" id="sleep-c" data-sleep-c placeholder="sessions" value="${draft.sleep.count || 1}">
      </div>`)
  ].join('');

  const foot = h(`<div style="display:flex;gap:10px;width:100%">
    <button class="btn btn-square" data-act="fav">${draft.fav ? I.starFull({ s: 22 }) : I.star({ s: 22 })}</button>
    <button class="btn btn-primary" data-act="done">Done</button></div>`);

  const full = openFull({
    title: `${dayLong(d)}, ${monthLong(d.getMonth())} ${d.getDate()}`,
    titleTrailing: I.chevronDown({ s: 17 }),
    right: `<button class="icon-btn" data-act="gear">${I.gear({ s: 22 })}</button>`,
    body, foot,
    onBack: () => urls.forEach(u => URL.revokeObjectURL(u))
  });
  const q = (sel) => full.el.querySelector(sel);

  // photos are the only part that re-renders, and only its own container
  const drawPhotos = () => {
    q('[data-photos]').innerHTML = draft.photos.length
      ? `<div class="thumbs">${draft.photos.map((p, i) =>
          `<span class="thumb"><img src="${urlFor(p)}" alt=""><button data-del-photo="${i}">✕</button></span>`).join('')}</div>
         <button class="photo-add" data-act="photo" style="height:52px;margin-top:12px">＋ Add another</button>`
      : `<button class="photo-add" data-act="photo">＋ Add a photo</button>`;
  };
  drawPhotos();

  const readInputs = () => {
    draft.note = q('[data-note]')?.value ?? draft.note;
    const hh = Number(q('[data-sleep-h]')?.value || 0), mm = Number(q('[data-sleep-m]')?.value || 0);
    draft.sleep = { mins: hh * 60 + mm, count: Number(q('[data-sleep-c]')?.value || 1) };
  };

  const paintMoods = () => {
    full.el.querySelectorAll('[data-mood]').forEach(b => {
      const i = Number(b.dataset.mood);
      b.innerHTML = moodFace(i, { size: 44, muted: draft.mood !== i });
    });
  };

  // one tap = one class change, so nothing reflows or flashes
  const setCell = (btn, on) => {
    btn.classList.toggle('is-on', on);
    btn.querySelector('.ic')?.classList.toggle('is-off', !on);
  };

  full.el.addEventListener('click', async (ev) => {
    const t = ev.target;

    const moodBtn = t.closest('[data-mood]');
    if (moodBtn) { draft.mood = Number(moodBtn.dataset.mood); paintMoods(); return; }

    const emo = t.closest('[data-emo]');
    if (emo) {
      const id = emo.dataset.emo;
      const on = !draft.emotions.includes(id);
      draft.emotions = on ? [...draft.emotions, id] : draft.emotions.filter(x => x !== id);
      setCell(emo, on); return;
    }

    const iconBtn = t.closest('[data-icon]');
    if (iconBtn) {
      const id = iconBtn.dataset.icon;
      const on = !draft.icons.includes(id);
      draft.icons = on ? [...draft.icons, id] : draft.icons.filter(x => x !== id);
      setCell(iconBtn, on); return;
    }

    const col = t.closest('[data-collapse]');
    if (col) {
      const inner = q(`[data-body="${col.dataset.collapse}"]`);
      const open = inner.hidden;
      inner.hidden = !open;
      col.innerHTML = open ? I.chevronUp({ s: 22 }) : I.chevronDown({ s: 22 });
      return;
    }

    const delPhoto = t.closest('[data-del-photo]');
    if (delPhoto) { draft.photos.splice(Number(delPhoto.dataset.delPhoto), 1); drawPhotos(); return; }

    const w = t.closest('[data-weather]');
    if (w) {
      const id = w.dataset.weather;
      const on = draft.weather?.id !== id;
      draft.weather = on ? { id, tempF: draft.weather?.tempF ?? null } : null;
      full.el.querySelectorAll('[data-weather]').forEach(b => b.classList.toggle('is-on', on && b === w));
      q('[data-temp]').hidden = !(on && draft.weather?.tempF != null);
      return;
    }

    const act = t.closest('[data-act]')?.dataset.act;
    if (!act) return;

    if (act === 'pick') {
      const startCat = t.closest('[data-pick-cat]')?.dataset.pickCat;
      openIconPicker(draft.icons, (ids) => {
        const added = ids.filter(id => !draft.icons.includes(id));
        draft.icons = ids;
        // reflect the picker's result without rebuilding the page
        full.el.querySelectorAll('[data-icon]').forEach(b => setCell(b, ids.includes(b.dataset.icon)));
        for (const id of added) {
          const sec = EDITOR_SECTIONS.find(s => s.id === catOf(id));
          const grid = sec && q(`[data-body="${sec.id}"] .emotion-grid`);
          if (grid && !grid.querySelector(`[data-icon="${CSS.escape(id)}"]`)) {
            grid.insertBefore(h(labelledCell(id, true, GREEN_ICONS.has(id), label(id))), grid.lastElementChild);
          }
        }
      }, startCat);
    }
    if (act === 'photo') {
      const inp = h('<input type="file" accept="image/*" multiple hidden>');
      document.body.append(inp);
      inp.onchange = async () => {
        for (const f of inp.files) draft.photos.push(await shrink(f));
        inp.remove(); drawPhotos();
      };
      inp.click();
    }
    if (act === 'auto-weather') {
      try {
        toast('Checking the weather…');
        draft.weather = await fetchWeather();
        full.el.querySelectorAll('[data-weather]').forEach(b => b.classList.toggle('is-on', b.dataset.weather === draft.weather.id));
        const temp = q('[data-temp]');
        temp.textContent = Math.round(draft.weather.tempF) + '°F';
        temp.hidden = false;
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
    fetchWeather().then(wx => {
      draft.weather = wx;
      full.el.querySelectorAll('[data-weather]').forEach(b => b.classList.toggle('is-on', b.dataset.weather === wx.id));
      const temp = q('[data-temp]');
      if (temp) { temp.textContent = Math.round(wx.tempF) + '°F'; temp.hidden = false; }
    }).catch(() => {});
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
