// zip.js — tiny STORE-method ZIP writer (pure JS) so 3MF needs no dependency.
// Files are stored uncompressed with correct CRC-32 and headers, which every
// slicer's 3MF reader accepts.

const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        t[n] = c >>> 0;
    }
    return t;
})();

function crc32(bytes) {
    let c = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
}

// files: [{ name: string, data: Uint8Array }] → Blob (application/zip)
export function zipStore(files) {
    const enc = new TextEncoder();
    const chunks = [];
    const central = [];
    let offset = 0;

    for (const file of files) {
        const nameBytes = enc.encode(file.name);
        const data = file.data;
        const crc = crc32(data);

        const local = new ArrayBuffer(30 + nameBytes.length);
        const dv = new DataView(local);
        dv.setUint32(0, 0x04034b50, true); // local file header sig
        dv.setUint16(4, 20, true);         // version needed
        dv.setUint16(6, 0, true);          // flags
        dv.setUint16(8, 0, true);          // method: store
        dv.setUint16(10, 0, true);         // mod time
        dv.setUint16(12, 0x21, true);      // mod date
        dv.setUint32(14, crc, true);
        dv.setUint32(18, data.length, true);
        dv.setUint32(22, data.length, true);
        dv.setUint16(26, nameBytes.length, true);
        dv.setUint16(28, 0, true);
        const localHeader = new Uint8Array(local);
        localHeader.set(nameBytes, 30);
        chunks.push(localHeader, data);

        const cen = new ArrayBuffer(46 + nameBytes.length);
        const cv = new DataView(cen);
        cv.setUint32(0, 0x02014b50, true); // central dir sig
        cv.setUint16(4, 20, true);
        cv.setUint16(6, 20, true);
        cv.setUint16(8, 0, true);
        cv.setUint16(10, 0, true);
        cv.setUint16(12, 0, true);
        cv.setUint16(14, 0x21, true);
        cv.setUint32(16, crc, true);
        cv.setUint32(20, data.length, true);
        cv.setUint32(24, data.length, true);
        cv.setUint16(28, nameBytes.length, true);
        cv.setUint32(42, offset, true);
        const cenBytes = new Uint8Array(cen);
        cenBytes.set(nameBytes, 46);
        central.push(cenBytes);

        offset += localHeader.length + data.length;
    }

    let centralSize = 0;
    for (const c of central) centralSize += c.length;

    const end = new ArrayBuffer(22);
    const ev = new DataView(end);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(8, files.length, true);
    ev.setUint16(10, files.length, true);
    ev.setUint32(12, centralSize, true);
    ev.setUint32(16, offset, true);

    return new Blob([...chunks, ...central, new Uint8Array(end)], { type: 'application/zip' });
}
