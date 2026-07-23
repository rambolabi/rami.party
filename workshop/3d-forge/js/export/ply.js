// ply.js — Stanford PLY (ASCII + binary), with optional per-vertex colour.
// PLY carries vertex colour, ideal for lithophane/relief tint checks in
// Meshmixer/Blender.

export function plyExport(mesh, { binary = true, color = [180, 150, 230] } = {}) {
    const p = mesh.positions, idx = mesh.indices;
    const nv = p.length / 3, nf = idx.length / 3;
    const col = mesh.color ? mesh.color.map((v) => Math.round(v * 255)) : color;

    const header =
        'ply\n' +
        `format ${binary ? 'binary_little_endian' : 'ascii'} 1.0\n` +
        'comment 3D Forge · rami.party — units: millimetre\n' +
        `element vertex ${nv}\n` +
        'property float x\nproperty float y\nproperty float z\n' +
        'property uchar red\nproperty uchar green\nproperty uchar blue\n' +
        `element face ${nf}\n` +
        'property list uchar int vertex_indices\n' +
        'end_header\n';

    if (!binary) {
        const lines = [header.trimEnd()];
        for (let i = 0; i < p.length; i += 3)
            lines.push(`${p[i].toFixed(5)} ${p[i + 1].toFixed(5)} ${p[i + 2].toFixed(5)} ${col[0]} ${col[1]} ${col[2]}`);
        for (let i = 0; i < idx.length; i += 3)
            lines.push(`3 ${idx[i]} ${idx[i + 1]} ${idx[i + 2]}`);
        return new Blob([lines.join('\n') + '\n'], { type: 'application/octet-stream' });
    }

    const headerBytes = new TextEncoder().encode(header);
    const body = new ArrayBuffer(nv * 15 + nf * 13);
    const dv = new DataView(body);
    let o = 0;
    for (let i = 0; i < p.length; i += 3) {
        dv.setFloat32(o, p[i], true); dv.setFloat32(o + 4, p[i + 1], true); dv.setFloat32(o + 8, p[i + 2], true);
        dv.setUint8(o + 12, col[0]); dv.setUint8(o + 13, col[1]); dv.setUint8(o + 14, col[2]);
        o += 15;
    }
    for (let i = 0; i < idx.length; i += 3) {
        dv.setUint8(o, 3);
        dv.setInt32(o + 1, idx[i], true); dv.setInt32(o + 5, idx[i + 1], true); dv.setInt32(o + 9, idx[i + 2], true);
        o += 13;
    }
    return new Blob([headerBytes, body], { type: 'application/octet-stream' });
}
