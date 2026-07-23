// plugins.js — extension hooks for custom generators + G-code dialects.
// Exposes a small global `window.LaserForge` API. Plugin code is user-supplied JS and
// therefore runs behind an explicit "run untrusted code?" gate. Persisted in IndexedDB.

const generators = new Map();   // type -> descriptor
const dialects = new Map();     // id   -> descriptor
const listeners = new Set();

export const PluginAPI = {
    registerGenerator(desc) {
        if (!desc || !desc.type || typeof desc.localLoops !== 'function') throw new Error('Generator needs {type, localLoops()}');
        generators.set(desc.type, desc);
        emit();
        return true;
    },
    registerDialect(desc) {
        if (!desc || !desc.id || typeof desc.header !== 'function') throw new Error('Dialect needs {id, header()}');
        dialects.set(desc.id, desc);
        emit();
        return true;
    },
    version: 2,
};

function emit() { for (const fn of listeners) fn(); }
export function onPluginsChanged(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function getGenerator(type) { return generators.get(type) || null; }
export function listGenerators() { return [...generators.values()]; }
export function listDialects() { return [...dialects.values()]; }

// Install the global namespace once.
export function installGlobal() {
    if (!window.LaserForge) window.LaserForge = {};
    window.LaserForge.registerGenerator = PluginAPI.registerGenerator;
    window.LaserForge.registerDialect = PluginAPI.registerDialect;
    window.LaserForge.version = PluginAPI.version;
}

// ---- untrusted-code gate + evaluation --------------------------------------
export function runPluginCode(code) {
    // Deliberately explicit: the user must confirm before we evaluate their code.
    const ok = window.confirm(
        'Run this plugin?\n\nPlugins are JavaScript that runs in this page. Only run code you trust — ' +
        'it can read your current design. It cannot access the network in normal use, but treat it like any script.');
    if (!ok) return { ok: false, reason: 'declined' };
    try {
        // eslint-disable-next-line no-new-func
        const fn = new Function('LaserForge', `"use strict";\n${code}`);
        fn(window.LaserForge);
        return { ok: true };
    } catch (e) {
        return { ok: false, reason: e.message };
    }
}

// ---- persistence (IndexedDB) -----------------------------------------------
const DB = 'laserforge2', STORE = 'plugins';
function idb() {
    return new Promise((res, rej) => {
        const r = indexedDB.open(DB, 1);
        r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains(STORE)) r.result.createObjectStore(STORE, { keyPath: 'id' }); };
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
    });
}
export async function savePlugin(id, name, code, enabled = true) {
    try { const db = await idb(); const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).put({ id, name, code, enabled, ts: Date.now() }); return new Promise((r) => { tx.oncomplete = r; }); }
    catch (_) {}
}
export async function listPlugins() {
    try { const db = await idb(); const tx = db.transaction(STORE, 'readonly'); return await new Promise((res) => { const q = tx.objectStore(STORE).getAll(); q.onsuccess = () => res(q.result || []); q.onerror = () => res([]); }); }
    catch (_) { return []; }
}
export async function deletePlugin(id) {
    try { const db = await idb(); const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).delete(id); return new Promise((r) => { tx.oncomplete = r; }); }
    catch (_) {}
}
