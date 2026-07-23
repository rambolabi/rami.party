// amf.js — Additive Manufacturing File (XML). Carries colour/material; compact
// for lattices. Explicit millimetre units.

export function amfExport(mesh, { color = [0.7, 0.6, 0.9] } = {}) {
    const p = mesh.positions, idx = mesh.indices;
    const c = mesh.color || color;
    const out = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<amf unit="millimeter">',
        '  <metadata type="producer">3D Forge · rami.party</metadata>',
        '  <material id="1">',
        `    <color><r>${c[0].toFixed(4)}</r><g>${c[1].toFixed(4)}</g><b>${c[2].toFixed(4)}</b></color>`,
        '  </material>',
        '  <object id="1">',
        '    <mesh>',
        '      <vertices>',
    ];
    const f = (n) => n.toFixed(5);
    for (let i = 0; i < p.length; i += 3) {
        out.push(`        <vertex><coordinates><x>${f(p[i])}</x><y>${f(p[i + 1])}</y><z>${f(p[i + 2])}</z></coordinates></vertex>`);
    }
    out.push('      </vertices>', '      <volume materialid="1">');
    for (let i = 0; i < idx.length; i += 3) {
        out.push(`        <triangle><v1>${idx[i]}</v1><v2>${idx[i + 1]}</v2><v3>${idx[i + 2]}</v3></triangle>`);
    }
    out.push('      </volume>', '    </mesh>', '  </object>', '</amf>');
    return new Blob([out.join('\n')], { type: 'application/xml' });
}
