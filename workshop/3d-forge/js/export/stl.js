// stl.js — STL writers (binary + ASCII). The universal de-facto print format.
// Normals are recomputed per-face so slicers see correct outward orientation.

function faceNormal(p, a, b, c) {
    const ux = p[b] - p[a], uy = p[b + 1] - p[a + 1], uz = p[b + 2] - p[a + 2];
    const vx = p[c] - p[a], vy = p[c + 1] - p[a + 1], vz = p[c + 2] - p[a + 2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz) || 1;
    return [nx / l, ny / l, nz / l];
}

export function stlBinary(mesh) {
    const p = mesh.positions, idx = mesh.indices;
    const tris = idx.length / 3;
    const buf = new ArrayBuffer(84 + tris * 50);
    const dv = new DataView(buf);
    // 80-byte header
    const header = '3D Forge · rami.party — binary STL (mm)';
    for (let i = 0; i < 80; i++) dv.setUint8(i, i < header.length ? header.charCodeAt(i) : 32);
    dv.setUint32(80, tris, true);
    let o = 84;
    for (let i = 0; i < idx.length; i += 3) {
        const a = idx[i] * 3, b = idx[i + 1] * 3, c = idx[i + 2] * 3;
        const [nx, ny, nz] = faceNormal(p, a, b, c);
        dv.setFloat32(o, nx, true); dv.setFloat32(o + 4, ny, true); dv.setFloat32(o + 8, nz, true);
        o += 12;
        for (const v of [a, b, c]) {
            dv.setFloat32(o, p[v], true); dv.setFloat32(o + 4, p[v + 1], true); dv.setFloat32(o + 8, p[v + 2], true);
            o += 12;
        }
        dv.setUint16(o, 0, true); o += 2;
    }
    return new Blob([buf], { type: 'model/stl' });
}

export function stlAscii(mesh) {
    const p = mesh.positions, idx = mesh.indices;
    const out = ['solid 3DForge'];
    const f = (n) => n.toFixed(5);
    for (let i = 0; i < idx.length; i += 3) {
        const a = idx[i] * 3, b = idx[i + 1] * 3, c = idx[i + 2] * 3;
        const [nx, ny, nz] = faceNormal(p, a, b, c);
        out.push(`  facet normal ${f(nx)} ${f(ny)} ${f(nz)}`);
        out.push('    outer loop');
        for (const v of [a, b, c]) out.push(`      vertex ${f(p[v])} ${f(p[v + 1])} ${f(p[v + 2])}`);
        out.push('    endloop');
        out.push('  endfacet');
    }
    out.push('endsolid 3DForge');
    return new Blob([out.join('\n')], { type: 'model/stl' });
}
