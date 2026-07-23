// qr.js — self-contained QR Code encoder (byte mode, versions 1..10, ECL L/M/Q/H)
// Faithful implementation of the standard QR algorithm (GF(256) Reed–Solomon,
// masking + penalty selection). Pure JS, no dependencies.

const EXP = new Uint8Array(256);
const LOG = new Uint8Array(256);
(function initGF() {
    for (let i = 0; i < 8; i++) EXP[i] = 1 << i;
    for (let i = 8; i < 256; i++) EXP[i] = EXP[i - 4] ^ EXP[i - 5] ^ EXP[i - 6] ^ EXP[i - 8];
    for (let i = 0; i < 255; i++) LOG[EXP[i]] = i;
})();
const gexp = (n) => { while (n < 0) n += 255; while (n >= 256) n -= 255; return EXP[n]; };
const glog = (n) => LOG[n];

function polyMultiply(a, b) {
    const num = new Array(a.length + b.length - 1).fill(0);
    for (let i = 0; i < a.length; i++)
        for (let j = 0; j < b.length; j++)
            num[i + j] ^= gexp(glog(a[i]) + glog(b[j]));
    return num;
}
function polyMod(num, e) {
    let start = 0;
    while (start < num.length && num[start] === 0) start++;
    num = num.slice(start);
    if (num.length < e.length) return num;
    const ratio = glog(num[0]) - glog(e[0]);
    const res = num.slice();
    for (let i = 0; i < e.length; i++) res[i] ^= gexp(glog(e[i]) + ratio);
    return polyMod(res, e);
}
function ecPolynomial(len) {
    let a = [1];
    for (let i = 0; i < len; i++) a = polyMultiply(a, [1, gexp(i)]);
    return a;
}

const RS = {
    L: [[1,26,19],[1,44,34],[1,70,55],[1,100,80],[1,134,108],[2,86,68],[2,98,78],[2,121,97],[2,146,116],[2,86,68,2,87,69]],
    M: [[1,26,16],[1,44,28],[1,70,44],[2,50,32],[2,67,43],[4,43,27],[4,49,31],[2,60,38,2,61,39],[3,58,36,2,59,37],[4,69,43,1,70,44]],
    Q: [[1,26,13],[1,44,22],[2,35,17],[2,50,24],[2,33,15,2,34,16],[4,43,19],[2,32,14,4,33,15],[4,40,18,2,41,19],[4,36,16,4,37,17],[6,43,19,2,44,20]],
    H: [[1,26,9],[1,44,16],[2,35,13],[4,25,9],[2,33,11,2,34,12],[4,43,15],[4,39,13,1,40,14],[4,40,14,2,41,15],[4,36,12,4,37,13],[6,43,15,2,44,16]],
};
function rsBlocks(version, ecl) {
    const raw = RS[ecl][version - 1];
    const out = [];
    for (let i = 0; i < raw.length; i += 3)
        for (let c = 0; c < raw[i]; c++) out.push({ total: raw[i + 1], data: raw[i + 2] });
    return out;
}

const ALIGN = [[], [6,18], [6,22], [6,26], [6,30], [6,34], [6,22,38], [6,24,42], [6,26,46], [6,28,50]];
const ECL_INDICATOR = { L: 1, M: 0, Q: 3, H: 2 };

class BitBuffer {
    constructor() { this.buf = []; this.len = 0; }
    put(num, length) { for (let i = length - 1; i >= 0; i--) this.putBit(((num >>> i) & 1) === 1); }
    putBit(b) {
        const idx = Math.floor(this.len / 8);
        if (this.buf.length <= idx) this.buf.push(0);
        if (b) this.buf[idx] |= 0x80 >>> (this.len % 8);
        this.len++;
    }
}
function countBits(version) { return version < 10 ? 8 : 16; }

function createData(version, ecl, bytes) {
    const buffer = new BitBuffer();
    buffer.put(4, 4);
    buffer.put(bytes.length, countBits(version));
    for (const b of bytes) buffer.put(b, 8);
    const blocks = rsBlocks(version, ecl);
    const totalData = blocks.reduce((s, b) => s + b.data, 0);
    const capacityBits = totalData * 8;
    if (buffer.len > capacityBits) throw new Error('QR: data too long for version');
    if (buffer.len + 4 <= capacityBits) buffer.put(0, 4);
    while (buffer.len % 8 !== 0) buffer.putBit(false);
    const pad = [0xec, 0x11];
    let pi = 0;
    while (buffer.buf.length < totalData) buffer.buf.push(pad[pi++ % 2]);
    return createBytes(buffer, blocks);
}
function createBytes(buffer, blocks) {
    let offset = 0, maxDc = 0, maxEc = 0;
    const dcdata = [], ecdata = [];
    for (const blk of blocks) {
        const dc = blk.data, ec = blk.total - blk.data;
        maxDc = Math.max(maxDc, dc); maxEc = Math.max(maxEc, ec);
        const d = new Array(dc);
        for (let i = 0; i < dc; i++) d[i] = 0xff & buffer.buf[i + offset];
        offset += dc;
        const rsPoly = ecPolynomial(ec);
        const raw = d.concat(new Array(rsPoly.length - 1).fill(0));
        const mod = polyMod(raw, rsPoly);
        const e = new Array(ec);
        for (let i = 0; i < ec; i++) {
            const modIndex = i + mod.length - ec;
            e[i] = modIndex >= 0 ? mod[modIndex] : 0;
        }
        dcdata.push(d); ecdata.push(e);
    }
    const total = blocks.reduce((s, b) => s + b.total, 0);
    const data = new Array(total);
    let idx = 0;
    for (let i = 0; i < maxDc; i++)
        for (let b = 0; b < blocks.length; b++)
            if (i < dcdata[b].length) data[idx++] = dcdata[b][i];
    for (let i = 0; i < maxEc; i++)
        for (let b = 0; b < blocks.length; b++)
            if (i < ecdata[b].length) data[idx++] = ecdata[b][i];
    return data;
}

function bchDigit(data) { let d = 0; while (data !== 0) { d++; data >>>= 1; } return d; }
const G15 = 0b10100110111, G18 = 0b1111100100101, G15MASK = 0b101010000010010;
function bchTypeInfo(data) {
    let d = data << 10;
    while (bchDigit(d) - bchDigit(G15) >= 0) d ^= G15 << (bchDigit(d) - bchDigit(G15));
    return ((data << 10) | d) ^ G15MASK;
}
function bchTypeNumber(data) {
    let d = data << 12;
    while (bchDigit(d) - bchDigit(G18) >= 0) d ^= G18 << (bchDigit(d) - bchDigit(G18));
    return (data << 12) | d;
}

function maskFn(p, i, j) {
    switch (p) {
        case 0: return (i + j) % 2 === 0;
        case 1: return i % 2 === 0;
        case 2: return j % 3 === 0;
        case 3: return (i + j) % 3 === 0;
        case 4: return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
        case 5: return ((i * j) % 2) + ((i * j) % 3) === 0;
        case 6: return (((i * j) % 2) + ((i * j) % 3)) % 2 === 0;
        case 7: return (((i * j) % 3) + ((i + j) % 2)) % 2 === 0;
        default: return false;
    }
}

class Matrix {
    constructor(version) {
        this.version = version;
        this.size = version * 4 + 17;
        this.m = Array.from({ length: this.size }, () => new Array(this.size).fill(null));
    }
    setupFinder(row, col) {
        for (let r = -1; r <= 7; r++) for (let c = -1; c <= 7; c++) {
            const rr = row + r, cc = col + c;
            if (rr < 0 || rr >= this.size || cc < 0 || cc >= this.size) continue;
            const on = (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
                (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
                (r >= 2 && r <= 4 && c >= 2 && c <= 4);
            this.m[rr][cc] = on;
        }
    }
    setupTiming() {
        for (let i = 8; i < this.size - 8; i++) {
            if (this.m[i][6] === null) this.m[i][6] = i % 2 === 0;
            if (this.m[6][i] === null) this.m[6][i] = i % 2 === 0;
        }
    }
    setupAlignment() {
        const pos = ALIGN[this.version - 1];
        for (const r of pos) for (const c of pos) {
            if (this.m[r][c] !== null) continue;
            for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++)
                this.m[r + dr][c + dc] = Math.max(Math.abs(dr), Math.abs(dc)) !== 1;
        }
    }
    setupTypeInfo(ecl, mask) {
        const data = (ECL_INDICATOR[ecl] << 3) | mask;
        const bits = bchTypeInfo(data);
        for (let i = 0; i < 15; i++) {
            const on = ((bits >> i) & 1) === 1;
            if (i < 6) this.m[i][8] = on;
            else if (i < 8) this.m[i + 1][8] = on;
            else this.m[this.size - 15 + i][8] = on;
            if (i < 8) this.m[8][this.size - i - 1] = on;
            else if (i < 9) this.m[8][15 - i - 1 + 1] = on;
            else this.m[8][15 - i - 1] = on;
        }
        this.m[this.size - 8][8] = true;
    }
    setupVersionInfo() {
        if (this.version < 7) return;
        const bits = bchTypeNumber(this.version);
        for (let i = 0; i < 18; i++) {
            const on = ((bits >> i) & 1) === 1;
            this.m[Math.floor(i / 3)][i % 3 + this.size - 8 - 3] = on;
            this.m[i % 3 + this.size - 8 - 3][Math.floor(i / 3)] = on;
        }
    }
    mapData(data, mask) {
        let inc = -1, row = this.size - 1, bitIndex = 7, byteIndex = 0;
        for (let col = this.size - 1; col > 0; col -= 2) {
            if (col === 6) col--;
            for (; ;) {
                for (let c = 0; c < 2; c++) {
                    const cc = col - c;
                    if (this.m[row][cc] === null) {
                        let dark = false;
                        if (byteIndex < data.length) dark = ((data[byteIndex] >>> bitIndex) & 1) === 1;
                        if (maskFn(mask, row, cc)) dark = !dark;
                        this.m[row][cc] = dark;
                        bitIndex--;
                        if (bitIndex === -1) { byteIndex++; bitIndex = 7; }
                    }
                }
                row += inc;
                if (row < 0 || row >= this.size) { row -= inc; inc = -inc; break; }
            }
        }
    }
}

function penalty(mx) {
    const size = mx.size, m = mx.m;
    let score = 0;
    const val = (r, c) => (m[r][c] ? 1 : 0);
    for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
        let same = 0; const cur = val(r, c);
        for (let cc = c; cc < size && val(r, cc) === cur; cc++) same++;
        if (same >= 5) { score += 3 + (same - 5); c += same - 1; }
    }
    for (let c = 0; c < size; c++) for (let r = 0; r < size; r++) {
        let same = 0; const cur = val(r, c);
        for (let rr = r; rr < size && val(rr, c) === cur; rr++) same++;
        if (same >= 5) { score += 3 + (same - 5); r += same - 1; }
    }
    for (let r = 0; r < size - 1; r++) for (let c = 0; c < size - 1; c++) {
        const s = val(r, c) + val(r, c + 1) + val(r + 1, c) + val(r + 1, c + 1);
        if (s === 0 || s === 4) score += 3;
    }
    const pat = [1, 0, 1, 1, 1, 0, 1];
    for (let r = 0; r < size; r++) for (let c = 0; c < size - 6; c++) {
        let ok = true;
        for (let k = 0; k < 7; k++) if (val(r, c + k) !== pat[k]) { ok = false; break; }
        if (ok) score += 40;
    }
    for (let c = 0; c < size; c++) for (let r = 0; r < size - 6; r++) {
        let ok = true;
        for (let k = 0; k < 7; k++) if (val(r + k, c) !== pat[k]) { ok = false; break; }
        if (ok) score += 40;
    }
    let dark = 0;
    for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) dark += val(r, c);
    const ratio = (dark / (size * size)) * 100;
    score += Math.floor(Math.abs(ratio - 50) / 5) * 10;
    return score;
}

function buildMatrix(version, ecl, data, mask) {
    const mx = new Matrix(version);
    mx.setupFinder(0, 0);
    mx.setupFinder(mx.size - 7, 0);
    mx.setupFinder(0, mx.size - 7);
    mx.setupAlignment();
    mx.setupTiming();
    mx.setupVersionInfo();
    mx.setupTypeInfo(ecl, mask);
    mx.mapData(data, mask);
    return mx;
}

// Public: generate a QR matrix. Returns { size, modules: boolean[][] }.
export function qrGenerate(text, ecl = 'M') {
    const bytes = new TextEncoder().encode(String(text));
    let version = 1;
    for (; version <= 10; version++) {
        const blocks = rsBlocks(version, ecl);
        const totalData = blocks.reduce((s, b) => s + b.data, 0);
        const need = 4 + countBits(version) + bytes.length * 8;
        if (need <= totalData * 8) break;
    }
    if (version > 10) throw new Error('QR: content too long (max version 10 supported).');
    const data = createData(version, ecl, bytes);
    let best = null, bestScore = Infinity;
    for (let mask = 0; mask < 8; mask++) {
        const mx = buildMatrix(version, ecl, data, mask);
        const s = penalty(mx);
        if (s < bestScore) { bestScore = s; best = mx; }
    }
    return { size: best.size, modules: best.m.map((row) => row.map((v) => !!v)) };
}

export const QR_ECL = ['L', 'M', 'Q', 'H'];
