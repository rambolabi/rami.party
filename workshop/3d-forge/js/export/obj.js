// obj.js — Wavefront OBJ (+ optional MTL). Great interop with Blender/Meshmixer.

export function objExport(mesh, { name = 'model', color = [0.7, 0.6, 0.9] } = {}) {
    const p = mesh.positions, idx = mesh.indices;
    const c = mesh.color || color;
    const lines = [
        '# 3D Forge · rami.party — units: millimetre',
        `mtllib ${name}.mtl`,
        `o ${name}`,
        `usemtl ${name}_mat`,
    ];
    const f = (n) => n.toFixed(5);
    for (let i = 0; i < p.length; i += 3) lines.push(`v ${f(p[i])} ${f(p[i + 1])} ${f(p[i + 2])}`);
    for (let i = 0; i < idx.length; i += 3) lines.push(`f ${idx[i] + 1} ${idx[i + 1] + 1} ${idx[i + 2] + 1}`);
    const mtl = [
        '# 3D Forge material',
        `newmtl ${name}_mat`,
        `Kd ${c[0].toFixed(4)} ${c[1].toFixed(4)} ${c[2].toFixed(4)}`,
        'Ka 0 0 0', 'Ks 0.1 0.1 0.1', 'd 1', 'illum 2',
    ];
    return {
        obj: new Blob([lines.join('\n')], { type: 'text/plain' }),
        mtl: new Blob([mtl.join('\n')], { type: 'text/plain' }),
    };
}
