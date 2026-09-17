// Which icons sit in which editor section. Defaults come from icons.js; whatever
// you rearrange here is stored with your settings and used everywhere after.
import { h, esc, I, openFull, toast, confirmSheet } from './ui.js';
import { EDITOR_SECTIONS, PEOPLE, iconSrc, GREEN_ICONS } from './icons.js';
import { label } from './labels.js';
import { db } from './db.js';

export function sectionsFor(settings) {
  const custom = settings?.sections || {};
  return EDITOR_SECTIONS.map(sec => ({ ...sec, items: custom[sec.id] || sec.items }));
}

export function labelIn(sec, id) {
  const fromSet = (sec.labels || PEOPLE).find?.(p => p.icon === id);
  return (sec.labels && fromSet?.label) || label(id) || '';
}

export async function openSectionEditor(onSaved) {
  const { S, render } = await import('./app.js');
  const { openIconPicker } = await import('./editor.js');

  // work on a copy until Done
  const draft = {};
  for (const sec of sectionsFor(S.settings)) draft[sec.id] = [...sec.items];

  const body = h('<div style="padding:4px 0 24px"></div>');

  const chip = (secId, id) => `<button class="emotion edit-chip" data-rm="${id}" data-sec="${secId}">
      <span class="ic${GREEN_ICONS.has(id) ? ' is-green' : ''}"><img src="${iconSrc(id)}" alt="" loading="lazy"></span>
      <span class="rm">✕</span>
      <span>${esc(labelFor(secId, id))}</span></button>`;

  function labelFor(secId, id) {
    const sec = EDITOR_SECTIONS.find(s => s.id === secId);
    return labelIn(sec, id);
  }

  const draw = () => {
    body.innerHTML = `<p class="list-title" style="padding:2px 22px 10px">
      Tap ✕ to take an icon out, ＋ to add one. Moving an icon into a section takes it out of the section it was in.</p>` +
      EDITOR_SECTIONS.map(sec => `<div class="card">
        <div class="section-head"><h3>${esc(sec.title)}</h3>
          <span class="v" style="color:var(--muted);font-size:13px">${draft[sec.id].length}</span></div>
        <div class="emotion-grid">
          ${draft[sec.id].map(id => chip(sec.id, id)).join('')}
          <button class="emotion" data-add="${sec.id}"><span class="add-chip">＋</span><span>add</span></button>
        </div></div>`).join('') +
      `<div style="padding:4px 16px 0"><button class="btn btn-ghost" data-reset style="width:100%">Reset to the defaults</button></div>`;
  };
  draw();

  const foot = h(`<div style="display:flex;gap:10px;width:100%">
    <button class="btn btn-primary" data-save>Save</button></div>`);

  const full = openFull({ title: 'Edit sections', body, foot });

  body.addEventListener('click', async (ev) => {
    const rm = ev.target.closest('[data-rm]');
    if (rm) {
      const { sec, rm: id } = rm.dataset;
      draft[sec] = draft[sec].filter(x => x !== id);
      rm.remove();
      return;
    }
    const add = ev.target.closest('[data-add]');
    if (add) {
      const secId = add.dataset.add;
      const already = draft[secId];
      openIconPicker(already, (ids) => {
        // anything newly chosen moves here out of whatever section held it
        for (const id of ids) {
          if (already.includes(id)) continue;
          for (const k of Object.keys(draft)) if (k !== secId) draft[k] = draft[k].filter(x => x !== id);
        }
        draft[secId] = ids;
        draw();
      }, secId);
      return;
    }
    if (ev.target.closest('[data-reset]')) {
      if (await confirmSheet('Reset sections', 'Every section goes back to the icons it shipped with.', 'Reset')) {
        for (const sec of EDITOR_SECTIONS) draft[sec.id] = [...sec.items];
        draw();
      }
    }
  });

  foot.querySelector('[data-save]').onclick = async () => {
    S.settings.sections = draft;
    await db.setSetting('settings', S.settings);
    full.close();
    render();
    toast('Sections saved');
    onSaved && onSaved();
  };
}
