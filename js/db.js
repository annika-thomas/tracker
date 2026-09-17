// Tiny IndexedDB layer. Everything lives on this device.
const DB_NAME = 'mood-tracker';
const VERSION = 1;
let _db = null;

function open() {
  if (_db) return Promise.resolve(_db);
  return new Promise((res, rej) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('entries')) db.createObjectStore('entries', { keyPath: 'date' });
      if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings');
    };
    req.onsuccess = () => { _db = req.result; res(_db); };
    req.onerror = () => rej(req.error);
  });
}

function tx(store, mode, fn) {
  return open().then(db => new Promise((res, rej) => {
    const t = db.transaction(store, mode);
    const s = t.objectStore(store);
    let out;
    const r = fn(s);
    if (r) r.onsuccess = () => { out = r.result; };
    t.oncomplete = () => res(out);
    t.onerror = () => rej(t.error);
  }));
}

export const db = {
  get: (date) => tx('entries', 'readonly', s => s.get(date)),
  all: () => tx('entries', 'readonly', s => s.getAll()),
  put: (entry) => tx('entries', 'readwrite', s => s.put({ ...entry, updated: Date.now() })),
  del: (date) => tx('entries', 'readwrite', s => s.delete(date)),
  clear: () => tx('entries', 'readwrite', s => s.clear()),
  setting: (k) => tx('settings', 'readonly', s => s.get(k)),
  setSetting: (k, v) => tx('settings', 'readwrite', s => s.put(v, k))
};

// ---- export / import -----------------------------------------------------
const blobToDataURL = (b) => new Promise(res => {
  const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(b);
});
const dataURLToBlob = async (d) => (await fetch(d)).blob();

export async function exportJSON() {
  const entries = await db.all();
  const out = [];
  for (const e of entries) {
    const photos = [];
    for (const p of e.photos || []) photos.push(await blobToDataURL(p));
    out.push({ ...e, photos });
  }
  return JSON.stringify({ app: 'mood-tracker', version: 1, exported: new Date().toISOString(), entries: out }, null, 2);
}

export async function importJSON(text, { merge = true } = {}) {
  const data = JSON.parse(text);
  if (!Array.isArray(data.entries)) throw new Error('Not a Mood Tracker backup');
  if (!merge) await db.clear();
  let n = 0;
  for (const e of data.entries) {
    const photos = [];
    for (const p of e.photos || []) {
      if (typeof p === 'string' && p.startsWith('data:')) photos.push(await dataURLToBlob(p));
    }
    await db.put({ ...e, photos });
    n++;
  }
  return n;
}
