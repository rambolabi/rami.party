// store.js — application state, pub/sub, undo/redo, autosave (pure JS)

const LS_KEY = 'laserforge2.project.v1';

const BED_PRESETS = {
    'Diode 400×400': { w: 400, h: 400 },
    'Diode 300×300': { w: 300, h: 300 },
    'A4 (297×210)': { w: 297, h: 210 },
    'CO₂ 600×400': { w: 600, h: 400 },
    'CO₂ 900×600': { w: 900, h: 600 },
    'Fiber 110×110': { w: 110, h: 110 },
};

function defaultState() {
    return {
        artboard: { widthMM: 300, heightMM: 300, bed: 'Diode 300×300', origin: 'bottom-left' },
        objects: [],
        selectedId: null,
        selectedIds: [],
        view: { zoom: 1, panX: 40, panY: 40, fitted: false },
    };
}

export class Store {
    constructor() {
        this.state = defaultState();
        this.listeners = new Set();
        this.undoStack = [];
        this.redoStack = [];
        this._saveTimer = null;
        this._lastSnapshot = this.snapshot();
    }

    get objects() { return this.state.objects; }
    get selectedId() { return this.state.selectedId; }
    get selectedIds() { return this.state.selectedIds || []; }
    get selected() {
        return this.state.objects.find((o) => o.id === this.state.selectedId) || null;
    }
    get selectedObjects() {
        const set = new Set(this.selectedIds);
        return this.state.objects.filter((o) => set.has(o.id));
    }
    isSelected(id) { return (this.state.selectedIds || []).includes(id); }

    subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
    emit(reason = 'change') { for (const fn of this.listeners) fn(this.state, reason); }

    // --- history -----------------------------------------------------------
    snapshot() {
        return JSON.stringify({ artboard: this.state.artboard, objects: this.state.objects });
    }
    commit(reason = 'edit') {
        const cur = this.snapshot();
        if (cur === this._lastSnapshot) { this.emit(reason); return; }
        this.undoStack.push(this._lastSnapshot ?? cur);
        if (this.undoStack.length > 60) this.undoStack.shift();
        this.redoStack.length = 0;
        this._lastSnapshot = cur;
        this.autosave();
        this.emit(reason);
    }
    _restore(snap) {
        const data = JSON.parse(snap);
        this.state.artboard = data.artboard;
        this.state.objects = data.objects;
        const ids = new Set(this.state.objects.map((o) => o.id));
        this.state.selectedIds = (this.state.selectedIds || []).filter((id) => ids.has(id));
        if (!ids.has(this.state.selectedId)) {
            this.state.selectedId = this.state.selectedIds[this.state.selectedIds.length - 1] ?? null;
        }
        this._lastSnapshot = this.snapshot();
        this.autosave();
        this.emit('history');
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

    // --- mutations ---------------------------------------------------------
    addObject(obj, { select = true } = {}) {
        this.state.objects.push(obj);
        if (select) { this.state.selectedId = obj.id; this.state.selectedIds = [obj.id]; }
        this.commit('add');
        return obj;
    }
    removeSelected() {
        const ids = new Set(this.selectedIds);
        if (!ids.size) return;
        this.state.objects = this.state.objects.filter((o) => !ids.has(o.id));
        this.state.selectedId = null;
        this.state.selectedIds = [];
        this.commit('remove');
    }
    duplicateSelected() {
        const sels = this.selectedObjects;
        if (!sels.length) return;
        const copies = sels.map((sel) => {
            const copy = JSON.parse(JSON.stringify(sel));
            copy.id = `o${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
            copy.x += 4; copy.y += 4;
            copy.name = (copy.name || copy.type) + ' copy';
            return copy;
        });
        this.state.objects.push(...copies);
        this.state.selectedIds = copies.map((c) => c.id);
        this.state.selectedId = copies[copies.length - 1].id;
        this.commit('add');
    }
    // Selection: additive toggles membership; otherwise replaces.
    select(id, { additive = false } = {}) {
        if (id == null) {
            if (!this.selectedIds.length && this.state.selectedId == null) return;
            this.state.selectedIds = []; this.state.selectedId = null;
            this.emit('select'); return;
        }
        let ids = this.state.selectedIds || [];
        if (additive) {
            ids = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
        } else {
            if (ids.length === 1 && ids[0] === id && this.state.selectedId === id) return;
            ids = [id];
        }
        this.state.selectedIds = ids;
        this.state.selectedId = ids.includes(id) ? id : (ids[ids.length - 1] ?? null);
        this.emit('select');
    }
    selectMany(ids) {
        this.state.selectedIds = [...new Set(ids)];
        this.state.selectedId = this.state.selectedIds[this.state.selectedIds.length - 1] ?? null;
        this.emit('select');
    }
    selectAll() {
        this.selectMany(this.state.objects.map((o) => o.id));
    }
    clearSelection() { this.select(null); }
    // Live update without pushing history (during drags / slider input)
    patch(id, props, { transient = false } = {}) {
        const o = this.state.objects.find((x) => x.id === id);
        if (!o) return;
        Object.assign(o, props);
        if (transient) this.emit('live');
        else this.commit('patch');
    }
    // Patch several objects in one shot (group drags), single emit/commit.
    patchMany(updates, { transient = false } = {}) {
        for (const u of updates) {
            const o = this.state.objects.find((x) => x.id === u.id);
            if (o) Object.assign(o, u.props);
        }
        if (transient) this.emit('live');
        else this.commit('patch');
    }
    reorder(id, dir) {
        const arr = this.state.objects;
        const i = arr.findIndex((o) => o.id === id);
        if (i < 0) return;
        const j = dir === 'up' ? i + 1 : i - 1;
        if (j < 0 || j >= arr.length) return;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        this.commit('reorder');
    }
    setArtboard(props) { Object.assign(this.state.artboard, props); this.commit('artboard'); }
    newProject() {
        this.state = defaultState();
        this.undoStack.length = 0; this.redoStack.length = 0;
        this._lastSnapshot = this.snapshot();
        this.autosave();
        this.emit('new');
    }

    // Replace the whole object list (import / boolean / group ops).
    setObjects(objects, selectIds = null) {
        this.state.objects = objects;
        if (selectIds) {
            this.state.selectedIds = [...selectIds];
            this.state.selectedId = selectIds[selectIds.length - 1] ?? null;
        }
        this.commit('edit');
    }

    // --- grouping ----------------------------------------------------------
    groupMembers(id) {
        const o = this.state.objects.find((x) => x.id === id);
        if (!o || !o.groupId) return o ? [o.id] : [];
        return this.state.objects.filter((x) => x.groupId === o.groupId).map((x) => x.id);
    }
    group() {
        const sels = this.selectedObjects;
        if (sels.length < 2) return;
        const gid = `g${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
        for (const o of sels) o.groupId = gid;
        this.commit('edit');
    }
    ungroup() {
        const sels = this.selectedObjects;
        if (!sels.length) return;
        for (const o of sels) delete o.groupId;
        this.commit('edit');
    }

    // --- persistence -------------------------------------------------------
    autosave() {
        clearTimeout(this._saveTimer);
        this._saveTimer = setTimeout(() => {
            try {
                localStorage.setItem(LS_KEY, JSON.stringify({
                    artboard: this.state.artboard, objects: this.state.objects,
                }));
            } catch (_) { /* quota / private mode — ignore */ }
        }, 400);
    }
    load() {
        try {
            const raw = localStorage.getItem(LS_KEY);
            if (!raw) return false;
            const data = JSON.parse(raw);
            if (!data || !Array.isArray(data.objects)) return false;
            this.state.artboard = data.artboard || defaultState().artboard;
            this.state.objects = data.objects;
            this._lastSnapshot = this.snapshot();
            return true;
        } catch (_) { return false; }
    }
}

export { BED_PRESETS };
