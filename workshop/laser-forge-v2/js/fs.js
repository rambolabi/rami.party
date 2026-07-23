// fs.js — File System Access API: real open/save round-trips with graceful fallback.
// Also a tiny IndexedDB store for "recent files" handles. Pure JS.

export const fsSupported = 'showSaveFilePicker' in window && 'showOpenFilePicker' in window;

const TYPES = [{ description: 'Laser Forge project', accept: { 'application/json': ['.json'] } }];

export async function verifyPermission(handle, write = true) {
    const opts = { mode: write ? 'readwrite' : 'read' };
    if ((await handle.queryPermission(opts)) === 'granted') return true;
    if ((await handle.requestPermission(opts)) === 'granted') return true;
    return false;
}

export async function pickOpen() {
    const [handle] = await window.showOpenFilePicker({ types: TYPES, multiple: false });
    const file = await handle.getFile();
    const data = JSON.parse(await file.text());
    await addRecent(handle);
    return { handle, data, name: handle.name };
}

export async function pickSave(suggestedName = 'laserforge.json') {
    const handle = await window.showSaveFilePicker({ suggestedName, types: TYPES });
    await addRecent(handle);
    return handle;
}

export async function writeHandle(handle, dataObj) {
    if (!(await verifyPermission(handle, true))) throw new Error('Permission denied');
    const w = await handle.createWritable();
    await w.write(new Blob([JSON.stringify(dataObj)], { type: 'application/json' }));
    await w.close();
}

// ---- IndexedDB recents ------------------------------------------------------
const DB = 'laserforge2', STORE = 'recents';
function idb() {
    return new Promise((res, rej) => {
        const r = indexedDB.open(DB, 1);
        r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: 'id' });
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
    });
}
export async function addRecent(handle) {
    try {
        const db = await idb();
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put({ id: handle.name, name: handle.name, handle, ts: Date.now() });
        return new Promise((res) => { tx.oncomplete = res; });
    } catch (_) { /* ignore */ }
}
export async function listRecents() {
    try {
        const db = await idb();
        const tx = db.transaction(STORE, 'readonly');
        return await new Promise((res) => {
            const req = tx.objectStore(STORE).getAll();
            req.onsuccess = () => res((req.result || []).sort((a, b) => b.ts - a.ts).slice(0, 8));
            req.onerror = () => res([]);
        });
    } catch (_) { return []; }
}
