// viewport.js — a minimal, dependency-free WebGL renderer for 3D Forge.
// Orbit / pan / zoom, a real-mm build plate + grid, per-object shading with
// selection highlight, a lithophane "backlight" preview, and CPU ray-picking.

import { mat4 } from './mesh.js';

const VS = `
attribute vec3 aPos;
attribute vec3 aNormal;
uniform mat4 uProj, uView;
varying vec3 vNormal, vWorld;
void main() {
    vNormal = aNormal;
    vWorld = aPos;
    gl_Position = uProj * uView * vec4(aPos, 1.0);
}`;

const FS = `
precision mediump float;
varying vec3 vNormal, vWorld;
uniform vec3 uColor;
uniform float uSelected;
uniform float uBacklight;
uniform vec3 uEye;
void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(uEye - vWorld);
    if (dot(N, V) < 0.0) N = -N;
    vec3 L1 = normalize(vec3(0.5, 0.7, 1.0));
    vec3 L2 = normalize(vec3(-0.6, -0.3, 0.4));
    float d = max(dot(N, L1), 0.0) * 0.85 + max(dot(N, L2), 0.0) * 0.35 + 0.28;
    vec3 base = uColor;
    if (uBacklight > 0.5) {
        float trans = pow(max(dot(N, -V), 0.0), 0.6);
        float glow = max(dot(N, normalize(vec3(0.0, -0.4, -1.0))), 0.0);
        base = mix(vec3(0.02, 0.02, 0.05), vec3(1.0, 0.95, 0.85), trans * 0.8 + glow * 0.5);
        gl_FragColor = vec4(base, 1.0);
        return;
    }
    vec3 col = base * d;
    float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0);
    col += rim * 0.25 * uColor;
    if (uSelected > 0.5) col = mix(col, vec3(0.13, 0.83, 0.93), 0.45) + 0.06;
    gl_FragColor = vec4(col, 1.0);
}`;

const LINE_VS = `
attribute vec3 aPos;
uniform mat4 uProj, uView;
void main() { gl_Position = uProj * uView * vec4(aPos, 1.0); }`;
const LINE_FS = `
precision mediump float;
uniform vec4 uColor;
void main() { gl_FragColor = uColor; }`;

function compile(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
}
function program(gl, vs, fs) {
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vs));
    gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    return p;
}

export class Viewport {
    constructor(canvas) {
        this.canvas = canvas;
        const gl = canvas.getContext('webgl', { antialias: true, preserveDrawingBuffer: false });
        if (!gl) throw new Error('WebGL not available');
        this.gl = gl;
        this.prog = program(gl, VS, FS);
        this.lineProg = program(gl, LINE_VS, LINE_FS);
        this.objects = [];   // { id, positions, normals, buffers, color, selected }
        this.plate = { w: 220, d: 220 };
        this.backlight = false;

        this.cam = { target: [0, 0, 20], dist: 260, yaw: -0.7, pitch: 0.9 };
        this._dirty = true;
        this._buildGrid();
        this._bindControls();
        this._resize();
        window.addEventListener('resize', () => this._resize());
        gl.enable(gl.DEPTH_TEST);
        const loop = () => { if (this._dirty) { this._render(); this._dirty = false; } requestAnimationFrame(loop); };
        requestAnimationFrame(loop);
    }

    invalidate() { this._dirty = true; }

    setPlate(w, d) { this.plate = { w, d }; this._buildGrid(); this.invalidate(); }
    setBacklight(on) { this.backlight = on; this.invalidate(); }

    // objects: [{ id, mesh (world-space Mesh), color:[r,g,b], selected }]
    setObjects(list) {
        const gl = this.gl;
        for (const o of this.objects) { gl.deleteBuffer(o.pos); gl.deleteBuffer(o.norm); }
        this.objects = list.map((o) => {
            const positions = Float32Array.from(o.mesh.positions);
            const normals = this._faceNormals(o.mesh);
            const pos = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, pos);
            gl.bufferData(gl.ARRAY_BUFFER, this._expand(positions, o.mesh.indices), gl.STATIC_DRAW);
            const norm = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, norm);
            gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
            return {
                id: o.id, color: o.color, selected: o.selected,
                pos, norm, count: o.mesh.indices.length,
                rawPos: positions, indices: o.mesh.indices,
            };
        });
        this.invalidate();
    }

    // Flat per-face normals expanded to non-indexed for crisp faceting.
    _faceNormals(mesh) {
        const p = mesh.positions, idx = mesh.indices;
        const n = new Float32Array(idx.length * 3);
        let o = 0;
        for (let i = 0; i < idx.length; i += 3) {
            const a = idx[i] * 3, b = idx[i + 1] * 3, c = idx[i + 2] * 3;
            const ux = p[b] - p[a], uy = p[b + 1] - p[a + 1], uz = p[b + 2] - p[a + 2];
            const vx = p[c] - p[a], vy = p[c + 1] - p[a + 1], vz = p[c + 2] - p[a + 2];
            let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
            const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
            for (let k = 0; k < 3; k++) { n[o++] = nx; n[o++] = ny; n[o++] = nz; }
        }
        return n;
    }
    _expand(positions, idx) {
        const out = new Float32Array(idx.length * 3);
        let o = 0;
        for (let i = 0; i < idx.length; i++) {
            const v = idx[i] * 3;
            out[o++] = positions[v]; out[o++] = positions[v + 1]; out[o++] = positions[v + 2];
        }
        return out;
    }

    _buildGrid() {
        const w = this.plate.w / 2, d = this.plate.d / 2, step = 10;
        const lines = [];
        for (let x = -w; x <= w + 0.001; x += step) lines.push(x, -d, 0, x, d, 0);
        for (let y = -d; y <= d + 0.001; y += step) lines.push(-w, y, 0, w, y, 0);
        this._gridData = new Float32Array(lines);
        // plate border (bright)
        this._plateData = new Float32Array([-w, -d, 0, w, -d, 0, w, d, 0, -w, d, 0, -w, -d, 0]);
        if (!this._gridBuf) { this._gridBuf = this.gl.createBuffer(); this._plateBuf = this.gl.createBuffer(); }
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._gridBuf);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this._gridData, this.gl.DYNAMIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._plateBuf);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this._plateData, this.gl.DYNAMIC_DRAW);
    }

    _resize() {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const r = this.canvas.getBoundingClientRect();
        this.canvas.width = Math.max(1, Math.round(r.width * dpr));
        this.canvas.height = Math.max(1, Math.round(r.height * dpr));
        this.invalidate();
    }

    _eye() {
        const { target, dist, yaw, pitch } = this.cam;
        return [
            target[0] + dist * Math.cos(pitch) * Math.cos(yaw),
            target[1] + dist * Math.cos(pitch) * Math.sin(yaw),
            target[2] + dist * Math.sin(pitch),
        ];
    }

    frameAll(bounds) {
        if (!bounds) return;
        const c = bounds.center, s = bounds.size;
        this.cam.target = [c[0], c[1], c[2]];
        this.cam.dist = Math.max(40, Math.hypot(s[0], s[1], s[2]) * 1.6 + 30);
        this.invalidate();
    }

    _matrices() {
        const aspect = this.canvas.width / this.canvas.height || 1;
        const proj = mat4.perspective(Math.PI / 4, aspect, 1, 6000);
        const eye = this._eye();
        const view = mat4.lookAt(eye, this.cam.target, [0, 0, 1]);
        return { proj, view, eye };
    }

    _render() {
        const gl = this.gl;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        if (this.backlight) gl.clearColor(0.01, 0.01, 0.03, 1); else gl.clearColor(0.035, 0.02, 0.07, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        const { proj, view, eye } = this._matrices();

        // grid + plate
        const lp = this.lineProg;
        gl.useProgram(lp);
        gl.uniformMatrix4fv(gl.getUniformLocation(lp, 'uProj'), false, proj);
        gl.uniformMatrix4fv(gl.getUniformLocation(lp, 'uView'), false, view);
        const lPos = gl.getAttribLocation(lp, 'aPos');
        gl.bindBuffer(gl.ARRAY_BUFFER, this._gridBuf);
        gl.enableVertexAttribArray(lPos);
        gl.vertexAttribPointer(lPos, 3, gl.FLOAT, false, 0, 0);
        gl.uniform4f(gl.getUniformLocation(lp, 'uColor'), 0.4, 0.3, 0.6, 0.35);
        gl.drawArrays(gl.LINES, 0, this._gridData.length / 3);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._plateBuf);
        gl.vertexAttribPointer(lPos, 3, gl.FLOAT, false, 0, 0);
        gl.uniform4f(gl.getUniformLocation(lp, 'uColor'), 0.65, 0.4, 0.95, 0.9);
        gl.drawArrays(gl.LINE_STRIP, 0, this._plateData.length / 3);

        // meshes
        const p = this.prog;
        gl.useProgram(p);
        gl.uniformMatrix4fv(gl.getUniformLocation(p, 'uProj'), false, proj);
        gl.uniformMatrix4fv(gl.getUniformLocation(p, 'uView'), false, view);
        gl.uniform3fv(gl.getUniformLocation(p, 'uEye'), eye);
        gl.uniform1f(gl.getUniformLocation(p, 'uBacklight'), this.backlight ? 1 : 0);
        const aPos = gl.getAttribLocation(p, 'aPos');
        const aNorm = gl.getAttribLocation(p, 'aNormal');
        for (const o of this.objects) {
            gl.bindBuffer(gl.ARRAY_BUFFER, o.pos);
            gl.enableVertexAttribArray(aPos);
            gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, o.norm);
            gl.enableVertexAttribArray(aNorm);
            gl.vertexAttribPointer(aNorm, 3, gl.FLOAT, false, 0, 0);
            gl.uniform3fv(gl.getUniformLocation(p, 'uColor'), o.color);
            gl.uniform1f(gl.getUniformLocation(p, 'uSelected'), o.selected ? 1 : 0);
            gl.drawArrays(gl.TRIANGLES, 0, o.count);
        }
        // Leave no attribute array enabled with a (possibly stale) buffer for the
        // next frame's line pass.
        gl.disableVertexAttribArray(aNorm);
    }

    _bindControls() {
        const el = this.canvas;
        let mode = null, lastX = 0, lastY = 0, moved = 0;
        const down = (e) => {
            el.setPointerCapture(e.pointerId);
            lastX = e.clientX; lastY = e.clientY; moved = 0;
            mode = (e.button === 0 && !e.shiftKey && !e.ctrlKey) ? 'orbit' : 'pan';
        };
        const move = (e) => {
            if (!mode) return;
            const dx = e.clientX - lastX, dy = e.clientY - lastY;
            lastX = e.clientX; lastY = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
            if (mode === 'orbit') {
                this.cam.yaw -= dx * 0.01;
                this.cam.pitch = Math.max(-1.5, Math.min(1.5, this.cam.pitch + dy * 0.01));
            } else {
                const k = this.cam.dist * 0.0016;
                const { yaw } = this.cam;
                this.cam.target[0] -= (-Math.sin(yaw) * dx) * k;
                this.cam.target[1] -= (Math.cos(yaw) * dx) * k;
                this.cam.target[2] += dy * k;
            }
            this.invalidate();
        };
        const up = (e) => {
            if (mode === 'orbit' && moved < 4 && this.onPick) this.onPick(this._pick(e));
            mode = null;
        };
        el.addEventListener('pointerdown', down);
        el.addEventListener('pointermove', move);
        el.addEventListener('pointerup', up);
        el.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.cam.dist = Math.max(20, Math.min(3000, this.cam.dist * (1 + Math.sign(e.deltaY) * 0.1)));
            this.invalidate();
        }, { passive: false });
    }

    // CPU ray-pick: returns object id under the cursor or null.
    _pick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        const { proj, view, eye } = this._matrices();
        const inv = invert(mat4.multiply(proj, view));
        const far = unproject(inv, x, y, 1);
        const dir = normalize([far[0] - eye[0], far[1] - eye[1], far[2] - eye[2]]);
        let best = null, bestT = Infinity;
        for (const o of this.objects) {
            const p = o.rawPos, idx = o.indices;
            for (let i = 0; i < idx.length; i += 3) {
                const t = rayTri(eye, dir, p, idx[i] * 3, idx[i + 1] * 3, idx[i + 2] * 3);
                if (t !== null && t < bestT) { bestT = t; best = o.id; }
            }
        }
        return best;
    }
}

// --- small vec/mat helpers for picking -------------------------------------
function normalize(v) { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
function unproject(inv, x, y, z) {
    const w = inv[3] * x + inv[7] * y + inv[11] * z + inv[15];
    return [
        (inv[0] * x + inv[4] * y + inv[8] * z + inv[12]) / w,
        (inv[1] * x + inv[5] * y + inv[9] * z + inv[13]) / w,
        (inv[2] * x + inv[6] * y + inv[10] * z + inv[14]) / w,
    ];
}
function rayTri(o, d, p, a, b, c) {
    const e1 = [p[b] - p[a], p[b + 1] - p[a + 1], p[b + 2] - p[a + 2]];
    const e2 = [p[c] - p[a], p[c + 1] - p[a + 1], p[c + 2] - p[a + 2]];
    const h = [d[1] * e2[2] - d[2] * e2[1], d[2] * e2[0] - d[0] * e2[2], d[0] * e2[1] - d[1] * e2[0]];
    const det = e1[0] * h[0] + e1[1] * h[1] + e1[2] * h[2];
    if (Math.abs(det) < 1e-9) return null;
    const f = 1 / det;
    const s = [o[0] - p[a], o[1] - p[a + 1], o[2] - p[a + 2]];
    const u = f * (s[0] * h[0] + s[1] * h[1] + s[2] * h[2]);
    if (u < 0 || u > 1) return null;
    const q = [s[1] * e1[2] - s[2] * e1[1], s[2] * e1[0] - s[0] * e1[2], s[0] * e1[1] - s[1] * e1[0]];
    const v = f * (d[0] * q[0] + d[1] * q[1] + d[2] * q[2]);
    if (v < 0 || u + v > 1) return null;
    const t = f * (e2[0] * q[0] + e2[1] * q[1] + e2[2] * q[2]);
    return t > 1e-4 ? t : null;
}
function invert(m) {
    const inv = new Float32Array(16);
    const a = m;
    inv[0] = a[5] * a[10] * a[15] - a[5] * a[11] * a[14] - a[9] * a[6] * a[15] + a[9] * a[7] * a[14] + a[13] * a[6] * a[11] - a[13] * a[7] * a[10];
    inv[4] = -a[4] * a[10] * a[15] + a[4] * a[11] * a[14] + a[8] * a[6] * a[15] - a[8] * a[7] * a[14] - a[12] * a[6] * a[11] + a[12] * a[7] * a[10];
    inv[8] = a[4] * a[9] * a[15] - a[4] * a[11] * a[13] - a[8] * a[5] * a[15] + a[8] * a[7] * a[13] + a[12] * a[5] * a[11] - a[12] * a[7] * a[9];
    inv[12] = -a[4] * a[9] * a[14] + a[4] * a[10] * a[13] + a[8] * a[5] * a[14] - a[8] * a[6] * a[13] - a[12] * a[5] * a[10] + a[12] * a[6] * a[9];
    inv[1] = -a[1] * a[10] * a[15] + a[1] * a[11] * a[14] + a[9] * a[2] * a[15] - a[9] * a[3] * a[14] - a[13] * a[2] * a[11] + a[13] * a[3] * a[10];
    inv[5] = a[0] * a[10] * a[15] - a[0] * a[11] * a[14] - a[8] * a[2] * a[15] + a[8] * a[3] * a[14] + a[12] * a[2] * a[11] - a[12] * a[3] * a[10];
    inv[9] = -a[0] * a[9] * a[15] + a[0] * a[11] * a[13] + a[8] * a[1] * a[15] - a[8] * a[3] * a[13] - a[12] * a[1] * a[11] + a[12] * a[3] * a[9];
    inv[13] = a[0] * a[9] * a[14] - a[0] * a[10] * a[13] - a[8] * a[1] * a[14] + a[8] * a[2] * a[13] + a[12] * a[1] * a[10] - a[12] * a[2] * a[9];
    inv[2] = a[1] * a[6] * a[15] - a[1] * a[7] * a[14] - a[5] * a[2] * a[15] + a[5] * a[3] * a[14] + a[13] * a[2] * a[7] - a[13] * a[3] * a[6];
    inv[6] = -a[0] * a[6] * a[15] + a[0] * a[7] * a[14] + a[4] * a[2] * a[15] - a[4] * a[3] * a[14] - a[12] * a[2] * a[7] + a[12] * a[3] * a[6];
    inv[10] = a[0] * a[5] * a[15] - a[0] * a[7] * a[13] - a[4] * a[1] * a[15] + a[4] * a[3] * a[13] + a[12] * a[1] * a[7] - a[12] * a[3] * a[5];
    inv[14] = -a[0] * a[5] * a[14] + a[0] * a[6] * a[13] + a[4] * a[1] * a[14] - a[4] * a[2] * a[13] - a[12] * a[1] * a[6] + a[12] * a[2] * a[5];
    inv[3] = -a[1] * a[6] * a[11] + a[1] * a[7] * a[10] + a[5] * a[2] * a[11] - a[5] * a[3] * a[10] - a[9] * a[2] * a[7] + a[9] * a[3] * a[6];
    inv[7] = a[0] * a[6] * a[11] - a[0] * a[7] * a[10] - a[4] * a[2] * a[11] + a[4] * a[3] * a[10] + a[8] * a[2] * a[7] - a[8] * a[3] * a[6];
    inv[11] = -a[0] * a[5] * a[11] + a[0] * a[7] * a[9] + a[4] * a[1] * a[11] - a[4] * a[3] * a[9] - a[8] * a[1] * a[7] + a[8] * a[3] * a[5];
    inv[15] = a[0] * a[5] * a[10] - a[0] * a[6] * a[9] - a[4] * a[1] * a[10] + a[4] * a[2] * a[9] + a[8] * a[1] * a[6] - a[8] * a[2] * a[5];
    let det = a[0] * inv[0] + a[1] * inv[4] + a[2] * inv[8] + a[3] * inv[12];
    det = det || 1e-9; det = 1 / det;
    for (let i = 0; i < 16; i++) inv[i] *= det;
    return inv;
}
