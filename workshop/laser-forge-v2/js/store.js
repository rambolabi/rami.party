// store.js — application state, pub/sub, undo/redo, autosave (pure JS)

const LS_KEY = 'laserforge.project.v1';

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
        artboard: { widthMM: 300, heightMM: 300, bed: 'Diode 300×300' },
        objects: [],
        selectedId: null,
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
    get selected() {
        return this.state.objects.find((o) => o.id === this.state.selectedId) || null;
    }

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
        if (!this.state.objects.some((o) => o.id === this.state.selectedId)) {
            this.state.selectedId = null;
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
        if (select) this.state.selectedId = obj.id;
        this.commit('add');
        return obj;
    }
    removeSelected() {
        const id = this.state.selectedId;
        if (!id) return;
        this.state.objects = this.state.objects.filter((o) => o.id !== id);
        this.state.selectedId = null;
        this.commit('remove');
    }
    duplicateSelected() {
        const sel = this.selected;
        if (!sel) return;
        const copy = JSON.parse(JSON.stringify(sel));
        copy.id = `o${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
        copy.x += 4; copy.y += 4;
        copy.name = (copy.name || copy.type) + ' copy';
        this.addObject(copy);
    }
    select(id) {
        if (this.state.selectedId === id) return;
        this.state.selectedId = id;
        this.emit('select');
    }
    // Live update without pushing history (during drags / slider input)
    patch(id, props, { transient = false } = {}) {
        const o = this.state.objects.find((x) => x.id === id);
        if (!o) return;
        Object.assign(o, props);
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
