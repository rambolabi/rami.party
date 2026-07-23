// store.js — application state: objects, selection, build plate, undo/redo,
// autosave, and a lazy world-space mesh cache the viewport and exporter read.

import { buildMesh } from './objects.js';
import { mat4 } from './scene/mesh.js';

export const BED_PRESETS = [
    { name: 'Ender-class 220×220', w: 220, d: 220 },
    { name: 'Bambu / Prusa 256×256', w: 256, d: 256 },
    { name: 'Large 300×300', w: 300, d: 300 },
    { name: 'Mini 180×180', w: 180, d: 180 },
    { name: 'Resin small 130×80', w: 130, d: 80 },
    { name: 'Resin 218×123', w: 218, d: 123 },
];

const KEY = '3dforge:project:v1';
const DEG = Math.PI / 180;

export class Store {
    constructor() {
        this.state = { plate: { ...BED_PRESETS[0] }, objects: [], selectedId: null };
        this.assets = {};          // id → { field } for image-based objects
        this._cache = new Map();   // id → world Mesh
        this._subs = [];
        this.undoStack = [];
        this.redoStack = [];
        this._coKey = null; this._coTime = 0;
    }

    subscribe(fn) { this._subs.push(fn); return () => { this._subs = this._subs.filter((f) => f !== fn); }; }
    _emit(reason) { for (const fn of this._subs) fn(this.state, reason); }

    // --- persistence --------------------------------------------------------
    save() {
        try { localStorage.setItem(KEY, JSON.stringify(this.state)); } catch (_) { /* quota */ }
    }
    load() {
        try {
            const raw = localStorage.getItem(KEY);
            if (raw) {
                const s = JSON.parse(raw);
                if (s && Array.isArray(s.objects)) this.state = s;
            }
        } catch (_) { /* ignore */ }
    }

    // --- selection ----------------------------------------------------------
    get selected() { return this.state.objects.find((o) => o.id === this.state.selectedId) || null; }
    select(id) { this.state.selectedId = id; this._emit('select'); }

    // --- history ------------------------------------------------------------
    snapshot() { return JSON.stringify({ plate: this.state.plate, objects: this.state.objects, selectedId: this.state.selectedId }); }
    _maybeSnapshot(key) {
        const now = Date.now();
        if (key && key === this._coKey && now - this._coTime < 1500) { this._coTime = now; return; }
        this._coKey = key; this._coTime = now;
        this.undoStack.push(this.snapshot());
        if (this.undoStack.length > 80) this.undoStack.shift();
        this.redoStack = [];
    }
    undo() {
        if (!this.undoStack.length) return;
        this.redoStack.push(this.snapshot());
        this._restore(this.undoStack.pop());
    }
    redo() {
        if (!this.redoStack.length) return;
        this.undoStack.push(this.snapshot());
        this._restore(this.redoStack.pop());
    }
    _restore(json) {
        const s = JSON.parse(json);
        this.state.plate = s.plate; this.state.objects = s.objects; this.state.selectedId = s.selectedId;
        this._cache.clear();
        this._coKey = null;
        this.save();
        this._emit('history');
    }

    // --- mutations ----------------------------------------------------------
    addObject(obj) {
        this._maybeSnapshot(null);
        this.state.objects.push(obj);
        this.state.selectedId = obj.id;
        this.save();
        this._emit('add');
    }
    removeObject(id) {
        this._maybeSnapshot(null);
        this.state.objects = this.state.objects.filter((o) => o.id !== id);
        this._cache.delete(id);
        if (this.state.selectedId === id) this.state.selectedId = null;
        this.save();
        this._emit('remove');
    }
    duplicate(id) {
        const src = this.state.objects.find((o) => o.id === id);
        if (!src) return;
        this._maybeSnapshot(null);
        const copy = JSON.parse(JSON.stringify(src));
        copy.id = 'o' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
        copy.transform.pos[0] += 10; copy.transform.pos[1] += 10;
        if (this.assets[id]) this.assets[copy.id] = this.assets[id];
        this.state.objects.push(copy);
        this.state.selectedId = copy.id;
        this.save();
        this._emit('add');
    }
    updateParams(id, patch, coalesceKey = null) {
        const obj = this.state.objects.find((o) => o.id === id);
        if (!obj) return;
        this._maybeSnapshot(coalesceKey);
        Object.assign(obj.params, patch);
        this._cache.delete(id);
        this.save();
        this._emit('params');
    }
    updateTransform(id, patch, coalesceKey = null) {
        const obj = this.state.objects.find((o) => o.id === id);
        if (!obj) return;
        this._maybeSnapshot(coalesceKey);
        Object.assign(obj.transform, patch);
        this._cache.delete(id);
        this.save();
        this._emit('transform');
    }
    setColor(id, color) {
        const obj = this.state.objects.find((o) => o.id === id);
        if (!obj) return;
        this._maybeSnapshot('color' + id);
        obj.color = color;
        this.save();
        this._emit('color');
    }
    rename(id, name) {
        const obj = this.state.objects.find((o) => o.id === id);
        if (!obj) return;
        obj.name = name; this.save(); this._emit('rename');
    }
    setPlate(plate) {
        this._maybeSnapshot(null);
        this.state.plate = plate; this.save(); this._emit('plate');
    }
    newProject() {
        this._maybeSnapshot(null);
        this.state = { plate: { ...BED_PRESETS[0] }, objects: [], selectedId: null };
        this.assets = {}; this._cache.clear();
        this.save(); this._emit('new');
    }

    setAsset(id, field) { this.assets[id] = { field }; this._cache.delete(id); this._emit('params'); }

    // Drop the object so its lowest point sits on the plate (z = 0).
    dropToPlate(id) {
        const w = this.worldMesh(id); if (!w) return;
        const b = w.bounds();
        const obj = this.state.objects.find((o) => o.id === id);
        this.updateTransform(id, { pos: [obj.transform.pos[0], obj.transform.pos[1], obj.transform.pos[2] - b.min[2]] });
    }
    centerOnPlate(id) {
        const w = this.worldMesh(id); if (!w) return;
        const b = w.bounds();
        const obj = this.state.objects.find((o) => o.id === id);
        this.updateTransform(id, { pos: [obj.transform.pos[0] - b.center[0], obj.transform.pos[1] - b.center[1], obj.transform.pos[2]] });
    }

    // --- derived geometry ---------------------------------------------------
    _matrix(obj) {
        const t = obj.transform;
        return mat4.compose(t.pos, [t.rot[0] * DEG, t.rot[1] * DEG, t.rot[2] * DEG], t.scale);
    }
    worldMesh(id) {
        if (this._cache.has(id)) return this._cache.get(id);
        const obj = this.state.objects.find((o) => o.id === id);
        if (!obj) return null;
        const local = buildMesh(obj, this.assets);
        const world = local.applyMatrix(this._matrix(obj));
        this._cache.set(id, world);
        return world;
    }
    worldObjects() {
        return this.state.objects.map((o) => ({
            id: o.id, color: o.color, selected: o.id === this.state.selectedId, mesh: this.worldMesh(o.id),
        }));
    }
    sceneBounds() {
        const objs = this.state.objects;
        if (!objs.length) return { center: [0, 0, 10], size: [100, 100, 20], min: [0, 0, 0], max: [0, 0, 0] };
        let min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
        for (const o of objs) {
            const b = this.worldMesh(o.id).bounds();
            for (let i = 0; i < 3; i++) { min[i] = Math.min(min[i], b.min[i]); max[i] = Math.max(max[i], b.max[i]); }
        }
        return { min, max, center: [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2], size: [max[0] - min[0], max[1] - min[1], max[2] - min[2]] };
    }

    // Merge the whole scene into one repaired Mesh for export.
    exportMesh() {
        const meshes = this.state.objects.map((o) => this.worldMesh(o.id)).filter((m) => m && m.triangleCount);
        const merged = meshes.length === 1 ? meshes[0].clone() : (() => {
            const m = meshes[0] ? meshes[0].clone() : null;
            if (!m) return null;
            for (let i = 1; i < meshes.length; i++) m.append(meshes[i]);
            return m;
        })();
        if (!merged) return null;
        if (this.state.objects.length === 1) merged.color = this.state.objects[0].color;
        return merged.repaired();
    }
}
