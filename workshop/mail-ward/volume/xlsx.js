/* ==========================================================================
   Mail Ward — minimal local .xlsx reader.
   Replaces the SheetJS CDN bundle. An .xlsx file is a ZIP of XML parts, and
   every modern browser can already inflate DEFLATE via DecompressionStream
   and parse XML via DOMParser — so no third-party code is needed.

   Scope on purpose: reads the first worksheet of an .xlsx into rows of
   objects keyed by the header row. That is all this dashboard needs.
   The legacy binary .xls (BIFF) format is NOT supported — it is a completely
   different container and cannot be read without a real library.
   ========================================================================== */
(function (global) {
    'use strict';

    function supported() {
        return typeof DecompressionStream === 'function' && typeof DOMParser === 'function';
    }

    /* ------------------------------------------------------------ ZIP part */

    function readU16(dv, off) { return dv.getUint16(off, true); }
    function readU32(dv, off) { return dv.getUint32(off, true); }

    /* Locate the End Of Central Directory record by scanning backwards for its
       signature (it sits in the last 64 KB, after an optional comment). */
    function findEOCD(dv) {
        var max = Math.min(dv.byteLength, 0xFFFF + 22);
        for (var i = 22; i <= max; i++) {
            var off = dv.byteLength - i;
            if (readU32(dv, off) === 0x06054b50) return off;
        }
        return -1;
    }

    function listEntries(buf) {
        var dv = new DataView(buf);
        var eocd = findEOCD(dv);
        if (eocd < 0) throw new Error('Not a valid .xlsx file (no ZIP end-of-directory record found).');

        var count = readU16(dv, eocd + 10);
        var dirOffset = readU32(dv, eocd + 16);
        var entries = {};
        var p = dirOffset;

        for (var i = 0; i < count; i++) {
            if (readU32(dv, p) !== 0x02014b50) break;           // central directory header
            var method = readU16(dv, p + 10);
            var compSize = readU32(dv, p + 20);
            var nameLen = readU16(dv, p + 28);
            var extraLen = readU16(dv, p + 30);
            var commentLen = readU16(dv, p + 32);
            var localOffset = readU32(dv, p + 42);
            var name = new TextDecoder('utf-8').decode(new Uint8Array(buf, p + 46, nameLen));
            entries[name] = { method: method, compSize: compSize, localOffset: localOffset };
            p += 46 + nameLen + extraLen + commentLen;
        }
        return { dv: dv, buf: buf, entries: entries };
    }

    /* The central directory records the compressed size; the local header
       records the real name/extra lengths, which is where the data starts. */
    function rawData(zip, entry) {
        var dv = zip.dv;
        var off = entry.localOffset;
        if (readU32(dv, off) !== 0x04034b50) throw new Error('Corrupt .xlsx: bad local file header.');
        var nameLen = readU16(dv, off + 26);
        var extraLen = readU16(dv, off + 28);
        var start = off + 30 + nameLen + extraLen;
        return new Uint8Array(zip.buf, start, entry.compSize);
    }

    function inflateRaw(bytes) {
        var ds = new DecompressionStream('deflate-raw');
        var stream = new Blob([bytes]).stream().pipeThrough(ds);
        return new Response(stream).arrayBuffer();
    }

    function readText(zip, path) {
        var entry = zip.entries[path];
        if (!entry) return Promise.resolve(null);
        var data = rawData(zip, entry);
        if (entry.method === 0) {                                // stored, not compressed
            return Promise.resolve(new TextDecoder('utf-8').decode(data));
        }
        if (entry.method !== 8) {
            return Promise.reject(new Error('Unsupported ZIP compression method ' + entry.method + ' in ' + path + '.'));
        }
        return inflateRaw(data).then(function (buf) {
            return new TextDecoder('utf-8').decode(new Uint8Array(buf));
        });
    }

    /* --------------------------------------------------------- sheet part */

    function parseXml(text, what) {
        var doc = new DOMParser().parseFromString(text, 'application/xml');
        if (doc.getElementsByTagName('parsererror').length) {
            throw new Error('Could not parse ' + what + ' inside the .xlsx.');
        }
        return doc;
    }

    /* "BC12" -> 54 (zero-based column index) */
    function colIndex(ref) {
        var n = 0;
        for (var i = 0; i < ref.length; i++) {
            var c = ref.charCodeAt(i);
            if (c < 65 || c > 90) break;
            n = n * 26 + (c - 64);
        }
        return n - 1;
    }

    function sharedStrings(doc) {
        if (!doc) return [];
        var out = [];
        var sis = doc.getElementsByTagName('si');
        for (var i = 0; i < sis.length; i++) {
            // A shared string is either one <t>, or several runs each with a <t>.
            var ts = sis[i].getElementsByTagName('t');
            var s = '';
            for (var j = 0; j < ts.length; j++) s += ts[j].textContent;
            out.push(s);
        }
        return out;
    }

    function cellValue(cell, strings) {
        var type = cell.getAttribute('t');
        if (type === 'inlineStr') {
            var ts = cell.getElementsByTagName('t');
            var s = '';
            for (var j = 0; j < ts.length; j++) s += ts[j].textContent;
            return s;
        }
        var v = cell.getElementsByTagName('v')[0];
        if (!v) return '';
        var raw = v.textContent;
        if (type === 's') {
            var idx = parseInt(raw, 10);
            return strings[idx] !== undefined ? strings[idx] : '';
        }
        if (type === 'b') return raw === '1' ? 'TRUE' : 'FALSE';
        return raw;
    }

    /* Which part holds the first worksheet? Follow workbook.xml -> rels.
       Falls back to the conventional path when the rels are unusual. */
    function firstSheetPath(workbookDoc, relsDoc, zip) {
        try {
            if (workbookDoc && relsDoc) {
                var sheets = workbookDoc.getElementsByTagName('sheet');
                if (sheets.length) {
                    var rid = sheets[0].getAttribute('r:id') ||
                        sheets[0].getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
                    var rels = relsDoc.getElementsByTagName('Relationship');
                    for (var i = 0; i < rels.length; i++) {
                        if (rels[i].getAttribute('Id') === rid) {
                            var target = rels[i].getAttribute('Target').replace(/^\/?xl\//, '').replace(/^\//, '');
                            if (zip.entries['xl/' + target]) return 'xl/' + target;
                        }
                    }
                }
            }
        } catch (e) { /* fall through to the conventional path */ }

        if (zip.entries['xl/worksheets/sheet1.xml']) return 'xl/worksheets/sheet1.xml';
        var names = Object.keys(zip.entries).filter(function (n) {
            return /^xl\/worksheets\/.*\.xml$/.test(n);
        }).sort();
        return names[0] || null;
    }

    /* -------------------------------------------------------------- public */

    /**
     * Read the first worksheet of an .xlsx File/Blob.
     * Resolves with an array of plain objects keyed by the header row.
     */
    function readFirstSheet(file) {
        if (!supported()) {
            return Promise.reject(new Error(
                'This browser cannot unzip .xlsx locally (DecompressionStream is missing). ' +
                'Save the file as CSV and load that instead.'));
        }

        return file.arrayBuffer().then(function (buf) {
            var zip = listEntries(buf);
            if (!Object.keys(zip.entries).length) {
                throw new Error('That file does not look like an .xlsx workbook.');
            }
            return Promise.all([
                readText(zip, 'xl/sharedStrings.xml'),
                readText(zip, 'xl/workbook.xml'),
                readText(zip, 'xl/_rels/workbook.xml.rels')
            ]).then(function (parts) {
                var strings = parts[0] ? sharedStrings(parseXml(parts[0], 'sharedStrings.xml')) : [];
                var wb = parts[1] ? parseXml(parts[1], 'workbook.xml') : null;
                var rels = parts[2] ? parseXml(parts[2], 'workbook.xml.rels') : null;
                var path = firstSheetPath(wb, rels, zip);
                if (!path) throw new Error('No worksheet found inside the .xlsx.');
                return readText(zip, path).then(function (xml) {
                    return { xml: xml, strings: strings };
                });
            });
        }).then(function (sheet) {
            var doc = parseXml(sheet.xml, 'the worksheet');
            var rowEls = doc.getElementsByTagName('row');
            var grid = [];

            for (var r = 0; r < rowEls.length; r++) {
                var cells = rowEls[r].getElementsByTagName('c');
                var row = [];
                for (var c = 0; c < cells.length; c++) {
                    var ref = cells[c].getAttribute('r') || '';
                    // A row omits empty cells entirely, so trust the reference.
                    var idx = ref ? colIndex(ref) : row.length;
                    row[idx] = cellValue(cells[c], sheet.strings);
                }
                grid.push(row);
            }

            // Skip any leading blank rows before the header.
            var start = 0;
            while (start < grid.length && !grid[start].some(function (v) { return v != null && String(v).trim(); })) start++;
            if (start >= grid.length) return [];

            var headers = grid[start].map(function (h) { return h == null ? '' : String(h).trim(); });
            var out = [];
            for (var i = start + 1; i < grid.length; i++) {
                var src = grid[i];
                if (!src || !src.some(function (v) { return v != null && String(v).trim(); })) continue;
                var obj = {};
                for (var k = 0; k < headers.length; k++) {
                    if (!headers[k]) continue;
                    obj[headers[k]] = src[k] == null ? '' : src[k];
                }
                out.push(obj);
            }
            return out;
        });
    }

    global.MWXlsx = { readFirstSheet: readFirstSheet, supported: supported };
})(window);
