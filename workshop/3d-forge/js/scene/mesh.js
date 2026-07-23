// mesh.js — the heart of 3D Forge.
// A Mesh is an indexed triangle soup in real millimetres. Every generator in the
// app produces one of these, every exporter consumes one, and the validator
// guarantees it is watertight/manifold before it ever reaches a slicer.
//
// Design goals:
//   * "Watertight by construction" — generators build closed shells; the validator
//     is a safety net, not a crutch.
//   * Real millimetres, always. No hidden unit scaling.
//   * Pure JS, no dependencies.

// ---------------------------------------------------------------------------
// Minimal column-major mat4 helpers (shared with the WebGL viewport).
// ---------------------------------------------------------------------------
export const mat4 = {
    identity() {
        return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    },
    multiply(a, b) {
        const o = new Float32Array(16);
        for (let c = 0; c < 4; c++) {
            for (let r = 0; r < 4; r++) {
                o[c * 4 + r] =
                    a[0 * 4 + r] * b[c * 4 + 0] +
                    a[1 * 4 + r] * b[c * 4 + 1] +
                    a[2 * 4 + r] * b[c * 4 + 2] +
                    a[3 * 4 + r] * b[c * 4 + 3];
            }
        }
        return o;
    },
    translation(x, y, z) {
        const m = mat4.identity();
        m[12] = x; m[13] = y; m[14] = z;
        return m;
    },
    scaling(x, y, z) {
        const m = mat4.identity();
        m[0] = x; m[5] = y; m[10] = z;
        return m;
    },
    rotationX(a) {
        const c = Math.cos(a), s = Math.sin(a), m = mat4.identity();
        m[5] = c; m[6] = s; m[9] = -s; m[10] = c;
        return m;
    },
    rotationY(a) {
        const c = Math.cos(a), s = Math.sin(a), m = mat4.identity();
        m[0] = c; m[2] = -s; m[8] = s; m[10] = c;
        return m;
    },
    rotationZ(a) {
        const c = Math.cos(a), s = Math.sin(a), m = mat4.identity();
        m[0] = c; m[1] = s; m[4] = -s; m[5] = c;
        return m;
    },
    perspective(fovy, aspect, near, far) {
        const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far), m = new Float32Array(16);
        m[0] = f / aspect; m[5] = f; m[10] = (far + near) * nf;
        m[11] = -1; m[14] = 2 * far * near * nf;
        return m;
    },
    lookAt(eye, center, up) {
        const [ex, ey, ez] = eye, [cx, cy, cz] = center;
        let zx = ex - cx, zy = ey - cy, zz = ez - cz;
        let zl = Math.hypot(zx, zy, zz) || 1; zx /= zl; zy /= zl; zz /= zl;
        let xx = up[1] * zz - up[2] * zy, xy = up[2] * zx - up[0] * zz, xz = up[0] * zy - up[1] * zx;
        let xl = Math.hypot(xx, xy, xz) || 1; xx /= xl; xy /= xl; xz /= xl;
        const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
        return new Float32Array([
            xx, yx, zx, 0,
            xy, yy, zy, 0,
            xz, yz, zz, 0,
            -(xx * ex + xy * ey + xz * ez),
            -(yx * ex + yy * ey + yz * ez),
            -(zx * ex + zy * ey + zz * ez), 1,
        ]);
    },
    // Compose a transform from position(mm) / euler rotation(rad) / scale.
    compose(pos, rot, scl) {
        let m = mat4.translation(pos[0], pos[1], pos[2]);
        m = mat4.multiply(m, mat4.rotationZ(rot[2]));
        m = mat4.multiply(m, mat4.rotationY(rot[1]));
        m = mat4.multiply(m, mat4.rotationX(rot[0]));
        m = mat4.multiply(m, mat4.scaling(scl[0], scl[1], scl[2]));
        return m;
    },
    transformPoint(m, x, y, z) {
        return [
            m[0] * x + m[4] * y + m[8] * z + m[12],
            m[1] * x + m[5] * y + m[9] * z + m[13],
            m[2] * x + m[6] * y + m[10] * z + m[14],
        ];
    },
};

// ---------------------------------------------------------------------------
// Mesh
// ---------------------------------------------------------------------------
export class Mesh {
    constructor() {
        this.positions = []; // flat [x,y,z, x,y,z, ...] in mm
        this.indices = [];   // flat [a,b,c, ...]
        this.color = null;   // optional [r,g,b] 0..1 (per-mesh)
    }

    get vertexCount() { return this.positions.length / 3; }
    get triangleCount() { return this.indices.length / 3; }

    addVertex(x, y, z) {
        const i = this.positions.length / 3;
        this.positions.push(x, y, z);
        return i;
    }

    addTriangle(a, b, c) { this.indices.push(a, b, c); }

    // Add a convex quad (a,b,c,d wound CCW) as two triangles.
    addQuad(a, b, c, d) { this.indices.push(a, b, c, a, c, d); }

    clone() {
        const m = new Mesh();
        m.positions = this.positions.slice();
        m.indices = this.indices.slice();
        m.color = this.color ? this.color.slice() : null;
        return m;
    }

    // Append another mesh's geometry (indices re-based).
    append(other) {
        const base = this.positions.length / 3;
        for (let i = 0; i < other.positions.length; i++) this.positions.push(other.positions[i]);
        for (let i = 0; i < other.indices.length; i++) this.indices.push(other.indices[i] + base);
        return this;
    }

    static merge(meshes) {
        const out = new Mesh();
        for (const m of meshes) out.append(m);
        return out;
    }

    // Apply a 4x4 matrix in place (baking a transform into the geometry).
    applyMatrix(m) {
        const p = this.positions;
        for (let i = 0; i < p.length; i += 3) {
            const [x, y, z] = mat4.transformPoint(m, p[i], p[i + 1], p[i + 2]);
            p[i] = x; p[i + 1] = y; p[i + 2] = z;
        }
        return this;
    }

    translate(x, y, z) {
        const p = this.positions;
        for (let i = 0; i < p.length; i += 3) { p[i] += x; p[i + 1] += y; p[i + 2] += z; }
        return this;
    }

    bounds() {
        const p = this.positions;
        if (!p.length) return { min: [0, 0, 0], max: [0, 0, 0], size: [0, 0, 0], center: [0, 0, 0] };
        let minx = Infinity, miny = Infinity, minz = Infinity;
        let maxx = -Infinity, maxy = -Infinity, maxz = -Infinity;
        for (let i = 0; i < p.length; i += 3) {
            const x = p[i], y = p[i + 1], z = p[i + 2];
            if (x < minx) minx = x; if (y < miny) miny = y; if (z < minz) minz = z;
            if (x > maxx) maxx = x; if (y > maxy) maxy = y; if (z > maxz) maxz = z;
        }
        return {
            min: [minx, miny, minz], max: [maxx, maxy, maxz],
            size: [maxx - minx, maxy - miny, maxz - minz],
            center: [(minx + maxx) / 2, (miny + maxy) / 2, (minz + maxz) / 2],
        };
    }

    // Weld coincident vertices to an epsilon grid. Returns a *new* indexed mesh
    // with shared vertices — essential for the manifold test and smaller exports.
    welded(eps = 1e-4) {
        const map = new Map();
        const out = new Mesh();
        out.color = this.color ? this.color.slice() : null;
        const remap = new Int32Array(this.vertexCount);
        const inv = 1 / eps;
        const p = this.positions;
        for (let i = 0; i < p.length; i += 3) {
            const key =
                Math.round(p[i] * inv) + '|' +
                Math.round(p[i + 1] * inv) + '|' +
                Math.round(p[i + 2] * inv);
            let idx = map.get(key);
            if (idx === undefined) {
                idx = out.addVertex(p[i], p[i + 1], p[i + 2]);
                map.set(key, idx);
            }
            remap[i / 3] = idx;
        }
        for (let i = 0; i < this.indices.length; i += 3) {
            const a = remap[this.indices[i]], b = remap[this.indices[i + 1]], c = remap[this.indices[i + 2]];
            if (a === b || b === c || a === c) continue; // drop degenerate
            out.addTriangle(a, b, c);
        }
        return out;
    }

    // Smooth per-vertex normals for the WebGL preview (area-weighted).
    computeNormals() {
        const n = new Float32Array(this.positions.length);
        const p = this.positions, idx = this.indices;
        for (let i = 0; i < idx.length; i += 3) {
            const a = idx[i] * 3, b = idx[i + 1] * 3, c = idx[i + 2] * 3;
            const ux = p[b] - p[a], uy = p[b + 1] - p[a + 1], uz = p[b + 2] - p[a + 2];
            const vx = p[c] - p[a], vy = p[c + 1] - p[a + 1], vz = p[c + 2] - p[a + 2];
            const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
            n[a] += nx; n[a + 1] += ny; n[a + 2] += nz;
            n[b] += nx; n[b + 1] += ny; n[b + 2] += nz;
            n[c] += nx; n[c + 1] += ny; n[c + 2] += nz;
        }
        for (let i = 0; i < n.length; i += 3) {
            const l = Math.hypot(n[i], n[i + 1], n[i + 2]) || 1;
            n[i] /= l; n[i + 1] /= l; n[i + 2] /= l;
        }
        return n;
    }

    // Per-triangle geometric normal (unnormalised area vector helper).
    triNormal(t) {
        const p = this.positions, i = t * 3;
        const a = this.indices[i] * 3, b = this.indices[i + 1] * 3, c = this.indices[i + 2] * 3;
        const ux = p[b] - p[a], uy = p[b + 1] - p[a + 1], uz = p[b + 2] - p[a + 2];
        const vx = p[c] - p[a], vy = p[c + 1] - p[a + 1], vz = p[c + 2] - p[a + 2];
        return [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
    }

    // Signed volume in mm^3 (positive when normals face outward). Useful both as a
    // print-material estimate and as an orientation sanity check.
    volume() {
        const p = this.positions, idx = this.indices;
        let v = 0;
        for (let i = 0; i < idx.length; i += 3) {
            const a = idx[i] * 3, b = idx[i + 1] * 3, c = idx[i + 2] * 3;
            v += (
                p[a] * (p[b + 1] * p[c + 2] - p[b + 2] * p[c + 1]) -
                p[a + 1] * (p[b] * p[c + 2] - p[b + 2] * p[c]) +
                p[a + 2] * (p[b] * p[c + 1] - p[b + 1] * p[c])
            ) / 6;
        }
        return v;
    }

    // Validate manifold/watertight. Every edge of a closed 2-manifold is shared by
    // exactly two triangles. We weld first so generator seams count correctly.
    validate() {
        const w = this.welded();
        const edges = new Map();
        const key = (a, b) => (a < b ? a + '_' + b : b + '_' + a);
        for (let i = 0; i < w.indices.length; i += 3) {
            const t = [w.indices[i], w.indices[i + 1], w.indices[i + 2]];
            for (let e = 0; e < 3; e++) {
                const k = key(t[e], t[(e + 1) % 3]);
                edges.set(k, (edges.get(k) || 0) + 1);
            }
        }
        let boundary = 0, nonManifold = 0;
        for (const c of edges.values()) {
            if (c === 1) boundary++;
            else if (c > 2) nonManifold++;
        }
        const watertight = boundary === 0 && nonManifold === 0;
        return {
            watertight,
            manifold: watertight,
            boundaryEdges: boundary,
            nonManifoldEdges: nonManifold,
            triangles: w.triangleCount,
            vertices: w.vertexCount,
            volume: this.volume(),
        };
    }

    // Best-effort repair used by the pre-export auto-repair pass: weld, drop
    // degenerate triangles, and orient all faces consistently with the mesh's
    // overall volume so normals point outward.
    repaired() {
        const w = this.welded();
        if (w.volume() < 0) {
            for (let i = 0; i < w.indices.length; i += 3) {
                const b = w.indices[i + 1];
                w.indices[i + 1] = w.indices[i + 2];
                w.indices[i + 2] = b;
            }
        }
        w.color = this.color ? this.color.slice() : null;
        return w;
    }
}
