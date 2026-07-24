(function () {
    'use strict';

    // ===== DOM ============================================================
    const $ = (id) => document.getElementById(id);
    const canvas = $('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const fileInput = $('fileInput');
    const uploadArea = $('uploadArea');
    const instructions = $('instructions');
    const canvasContainer = $('canvasContainer');
    const toastWrap = $('toastWrap');

    const blurBtn = $('blurBtn'), blackBarBtn = $('blackBarBtn'), pixelateBtn = $('pixelateBtn');
    const blurAllBtn = $('blurAllBtn'), pixelAllBtn = $('pixelAllBtn');
    const addWatermarkBtn = $('addWatermarkBtn'), tileWatermarkBtn = $('tileWatermarkBtn');
    const exportBtn = $('exportBtn'), copyBtn = $('copyBtn'), clearBtn = $('clearBtn');
    const undoBtn = $('undoBtn'), redoBtn = $('redoBtn');
    const zoomInBtn = $('zoomInBtn'), zoomOutBtn = $('zoomOutBtn'), zoomResetBtn = $('zoomResetBtn');
    const zoomLabel = $('zoomLabel');
    const metadataDisplay = $('metadataDisplay');

    const blurIntensity = $('blurIntensity'), blurValue = $('blurValue');
    const barColor = $('barColor'), barColorBox = $('barColorBox'), barColorText = $('barColorText'), barColorPreview = $('barColorPreview');
    const watermarkText = $('watermarkText'), watermarkDate = $('watermarkDate');
    const fontSize = $('fontSize'), fontValue = $('fontValue');
    const watermarkOpacity = $('watermarkOpacity'), opacityValue = $('opacityValue');
    const watermarkColor = $('watermarkColor'), watermarkRotation = $('watermarkRotation'), rotationValue = $('rotationValue');
    const watermarkPreview = $('watermarkPreview');
    const colorPreviewBox = $('colorPreviewBox'), colorPreviewText = $('colorPreviewText'), wmColorPreview = $('wmColorPreview');
    const formatSelect = $('formatSelect'), qualityRange = $('qualityRange'), qualityValue = $('qualityValue'), qualityLabel = $('qualityLabel');

    // ===== State ==========================================================
    let currentTool = null;
    let watermarkMode = false;
    let isDrawing = false;
    let startX = 0, startY = 0;
    let originalImageData = null;   // pristine, for "reset"
    let baseImageData = null;       // last committed state (for live preview base)
    let currentFile = null;
    let imageMetadata = {};
    let sensitiveKeys = new Set();
    const undoStack = [];
    const redoStack = [];
    const MAX_HISTORY = 30;
    let zoom = 1;                   // 0 => fit
    let fitMode = true;

    const THEMES = ['matrix', 'cyan', 'amber', 'black', 'white'];

    const today = new Date().toISOString().split('T')[0];
    watermarkDate.value = today;

    // ===== Theming ========================================================
    function applyTheme(name) {
        document.documentElement.setAttribute('data-theme', name);
        document.querySelectorAll('.theme-dot').forEach(d =>
            d.setAttribute('aria-pressed', String(d.dataset.setTheme === name)));
        try { localStorage.setItem('censor-theme', name); } catch (e) {}
    }
    document.querySelectorAll('.theme-dot').forEach(dot => {
        dot.addEventListener('click', () => applyTheme(dot.dataset.setTheme));
        dot.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); applyTheme(dot.dataset.setTheme); }
        });
    });
    (function initTheme() {
        let saved = 'matrix';
        try { saved = localStorage.getItem('censor-theme') || 'matrix'; } catch (e) {}
        if (!THEMES.includes(saved)) saved = 'matrix';
        applyTheme(saved);
    })();

    // ===== Toast ==========================================================
    function toast(msg, danger) {
        const el = document.createElement('div');
        el.className = 'toast' + (danger ? ' danger' : '');
        el.textContent = msg;
        toastWrap.appendChild(el);
        setTimeout(() => el.remove(), 2800);
    }

    // ===== Helpers ========================================================
    function escapeHtml(text) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }
    function formatBytes(bytes) {
        if (!bytes) return '0 Bytes';
        const k = 1024, sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    // ===== Slider bindings ================================================
    blurIntensity.addEventListener('input', () => blurValue.textContent = blurIntensity.value);
    fontSize.addEventListener('input', () => { fontValue.textContent = fontSize.value; updateWatermarkPreview(); });
    watermarkOpacity.addEventListener('input', () => { opacityValue.textContent = Math.round(watermarkOpacity.value * 100) + '%'; updateWatermarkPreview(); });
    watermarkRotation.addEventListener('input', () => { rotationValue.textContent = watermarkRotation.value + '°'; updateWatermarkPreview(); });
    watermarkText.addEventListener('input', updateWatermarkPreview);
    watermarkDate.addEventListener('input', updateWatermarkPreview);
    qualityRange.addEventListener('input', () => qualityValue.textContent = Math.round(qualityRange.value * 100) + '%');

    function syncQualityVisibility() {
        const lossy = formatSelect.value !== 'image/png';
        qualityRange.style.display = lossy ? '' : 'none';
        qualityValue.style.display = lossy ? '' : 'none';
        qualityLabel.style.display = lossy ? '' : 'none';
    }
    formatSelect.addEventListener('change', syncQualityVisibility);

    // Color pickers
    wmColorPreview.addEventListener('click', () => watermarkColor.click());
    watermarkColor.addEventListener('input', () => {
        const c = watermarkColor.value.toUpperCase();
        colorPreviewBox.style.background = c;
        colorPreviewText.textContent = c;
        updateWatermarkPreview();
    });
    barColorPreview.addEventListener('click', () => barColor.click());
    barColor.addEventListener('input', () => {
        const c = barColor.value.toUpperCase();
        barColorBox.style.background = c;
        barColorText.textContent = c;
    });

    function updateWatermarkPreview() {
        const text = watermarkText.value || 'For: [purpose] only';
        const date = watermarkDate.value;
        const opacity = Math.round(watermarkOpacity.value * 100);
        const rotation = watermarkRotation.value;
        watermarkPreview.innerHTML =
            '<div style="color:' + escapeHtml(watermarkColor.value) + ';opacity:' + watermarkOpacity.value +
            ';font-size:' + Math.min(fontSize.value, 22) + 'px;transform:rotate(' + rotation +
            'deg);font-weight:bold;text-align:center;line-height:1.3;">' + escapeHtml(text) +
            (date ? '<br>' + escapeHtml(date) : '') + '</div>' +
            '<small style="color:var(--text-dim);margin-top:8px;display:block;">' + opacity + '% · ' + rotation + '°</small>';
    }

    // ===== Upload =========================================================
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); } });
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) loadImage(file); else toast('That was not an image file.', true);
    });
    fileInput.addEventListener('change', (e) => { if (e.target.files[0]) loadImage(e.target.files[0]); });

    // Paste from clipboard
    window.addEventListener('paste', (e) => {
        const items = (e.clipboardData || {}).items || [];
        for (const item of items) {
            if (item.type && item.type.indexOf('image') === 0) {
                const file = item.getAsFile();
                if (file) { loadImage(file); toast('Pasted image from clipboard'); e.preventDefault(); return; }
            }
        }
    });

    function loadImage(file) {
        if (!file.type || file.type.indexOf('image') !== 0) { toast('Please choose an image file.', true); return; }
        currentFile = file;
        const reader = new FileReader();
        reader.onerror = () => toast('Could not read that file.', true);
        reader.onload = (e) => {
            const img = new Image();
            img.onerror = () => toast('Could not decode that image.', true);
            img.onload = () => {
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                baseImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                undoStack.length = 0;
                redoStack.length = 0;
                updateHistoryButtons();
                enableTools();
                instructions.style.display = 'none';
                canvas.style.display = 'block';
                fitMode = true; zoom = 1; applyZoom();
                extractMetadata(file);
                toast('Image loaded — start censoring');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // ===== Enable / disable ===============================================
    function enableTools() {
        [blurBtn, blackBarBtn, pixelateBtn, blurAllBtn, pixelAllBtn, blurIntensity, barColor,
         watermarkText, watermarkDate, fontSize, watermarkOpacity, watermarkRotation, watermarkColor,
         addWatermarkBtn, tileWatermarkBtn, exportBtn, copyBtn, clearBtn,
         formatSelect, qualityRange, zoomInBtn, zoomOutBtn, zoomResetBtn]
            .forEach(el => el.disabled = false);
        syncQualityVisibility();
        updateWatermarkPreview();
    }

    // ===== History ========================================================
    // baseImageData always holds the last COMMITTED canvas state. Committing an
    // edit pushes the previous committed state onto the undo stack.
    function pushHistory() {
        if (!baseImageData) return;
        undoStack.push(baseImageData);
        if (undoStack.length > MAX_HISTORY) undoStack.shift();
        redoStack.length = 0;
        baseImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        updateHistoryButtons();
    }
    function updateHistoryButtons() {
        undoBtn.disabled = undoStack.length === 0;
        redoBtn.disabled = redoStack.length === 0;
    }
    function undo() {
        if (!undoStack.length) return;
        redoStack.push(baseImageData);
        const prev = undoStack.pop();
        ctx.putImageData(prev, 0, 0);
        baseImageData = prev;
        updateHistoryButtons();
    }
    function redo() {
        if (!redoStack.length) return;
        undoStack.push(baseImageData);
        const next = redoStack.pop();
        ctx.putImageData(next, 0, 0);
        baseImageData = next;
        updateHistoryButtons();
    }
    undoBtn.addEventListener('click', undo);
    redoBtn.addEventListener('click', redo);

    function restoreBase() { if (baseImageData) ctx.putImageData(baseImageData, 0, 0); }

    // ===== Tool selection =================================================
    function setActive(btn) {
        [blurBtn, blackBarBtn, pixelateBtn].forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');
    }
    function selectTool(tool, btn) {
        if (watermarkMode) cancelWatermarkMode();
        if (currentTool === tool) { currentTool = null; setActive(null); return; }
        currentTool = tool; setActive(btn);
    }
    blurBtn.addEventListener('click', () => selectTool('blur', blurBtn));
    blackBarBtn.addEventListener('click', () => selectTool('blackbar', blackBarBtn));
    pixelateBtn.addEventListener('click', () => selectTool('pixelate', pixelateBtn));

    // ===== Pointer / drawing =============================================
    function canvasPos(e) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (canvas.width / rect.width),
            y: (e.clientY - rect.top) * (canvas.height / rect.height)
        };
    }

    canvas.addEventListener('pointerdown', (e) => {
        if (canvas.style.display === 'none') return;
        const p = canvasPos(e);
        if (watermarkMode) {
            placeWatermark(p.x, p.y);
            cancelWatermarkMode();
            return;
        }
        if (!currentTool) { toast('Select a censor tool first.'); return; }
        isDrawing = true;
        startX = p.x; startY = p.y;
        canvas.setPointerCapture(e.pointerId);
        e.preventDefault();
    });

    canvas.addEventListener('pointermove', (e) => {
        if (watermarkMode) {
            const p = canvasPos(e);
            restoreBase();
            drawWatermark(p.x, p.y, true);
            return;
        }
        if (!isDrawing || !currentTool) return;
        const p = canvasPos(e);
        restoreBase();
        const x = Math.min(startX, p.x), y = Math.min(startY, p.y);
        const w = Math.abs(p.x - startX), h = Math.abs(p.y - startY);
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,.9)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(x + .5, y + .5, w, h);
        ctx.fillStyle = 'rgba(255,255,255,.10)';
        ctx.fillRect(x, y, w, h);
        ctx.restore();
    });

    function endDraw(e) {
        if (!isDrawing || !currentTool) return;
        isDrawing = false;
        const p = canvasPos(e);
        restoreBase();
        applyCensor(startX, startY, p.x, p.y);
    }
    canvas.addEventListener('pointerup', endDraw);
    canvas.addEventListener('pointercancel', () => { if (isDrawing) { isDrawing = false; restoreBase(); } });

    function applyCensor(x1, y1, x2, y2) {
        let x = Math.round(Math.min(x1, x2));
        let y = Math.round(Math.min(y1, y2));
        let w = Math.round(Math.abs(x2 - x1));
        let h = Math.round(Math.abs(y2 - y1));
        x = Math.max(0, x); y = Math.max(0, y);
        w = Math.min(w, canvas.width - x); h = Math.min(h, canvas.height - y);
        if (w < 4 || h < 4) { restoreBase(); return; }

        if (currentTool === 'blur') applyBlur(x, y, w, h);
        else if (currentTool === 'blackbar') { ctx.fillStyle = barColor.value; ctx.fillRect(x, y, w, h); }
        else if (currentTool === 'pixelate') applyPixelate(x, y, w, h);
        pushHistory();
    }

    function applyBlur(x, y, w, h) {
        const region = ctx.getImageData(x, y, w, h);
        boxBlur(region, Math.max(2, Math.round(parseInt(blurIntensity.value, 10) / 2)));
        ctx.putImageData(region, x, y);
    }

    function applyPixelate(x, y, w, h) {
        const size = Math.max(2, parseInt(blurIntensity.value, 10));
        const region = ctx.getImageData(x, y, w, h);
        const d = region.data;
        for (let by = 0; by < h; by += size) {
            for (let bx = 0; bx < w; bx += size) {
                let r = 0, g = 0, b = 0, a = 0, n = 0;
                const maxY = Math.min(by + size, h), maxX = Math.min(bx + size, w);
                for (let yy = by; yy < maxY; yy++) {
                    for (let xx = bx; xx < maxX; xx++) {
                        const i = (yy * w + xx) * 4;
                        r += d[i]; g += d[i + 1]; b += d[i + 2]; a += d[i + 3]; n++;
                    }
                }
                r = r / n; g = g / n; b = b / n; a = a / n;
                for (let yy = by; yy < maxY; yy++) {
                    for (let xx = bx; xx < maxX; xx++) {
                        const i = (yy * w + xx) * 4;
                        d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = a;
                    }
                }
            }
        }
        ctx.putImageData(region, x, y);
    }

    // Fast separable box blur (multiple passes approximate Gaussian)
    function boxBlur(imageData, radius) {
        if (radius < 1) return imageData;
        const passes = 3;
        for (let p = 0; p < passes; p++) {
            boxBlurH(imageData, radius);
            boxBlurV(imageData, radius);
        }
        return imageData;
    }
    function boxBlurH(img, r) {
        const { data, width: w, height: h } = img;
        const out = new Uint8ClampedArray(data);
        const span = r * 2 + 1;
        for (let y = 0; y < h; y++) {
            const row = y * w * 4;
            let ar = 0, ag = 0, ab = 0, aa = 0;
            for (let i = -r; i <= r; i++) {
                const x = Math.min(w - 1, Math.max(0, i)) * 4 + row;
                ar += data[x]; ag += data[x + 1]; ab += data[x + 2]; aa += data[x + 3];
            }
            for (let x = 0; x < w; x++) {
                const o = row + x * 4;
                out[o] = ar / span; out[o + 1] = ag / span; out[o + 2] = ab / span; out[o + 3] = aa / span;
                const addX = Math.min(w - 1, x + r + 1) * 4 + row;
                const subX = Math.max(0, x - r) * 4 + row;
                ar += data[addX] - data[subX];
                ag += data[addX + 1] - data[subX + 1];
                ab += data[addX + 2] - data[subX + 2];
                aa += data[addX + 3] - data[subX + 3];
            }
        }
        data.set(out);
    }
    function boxBlurV(img, r) {
        const { data, width: w, height: h } = img;
        const out = new Uint8ClampedArray(data);
        const span = r * 2 + 1;
        for (let x = 0; x < w; x++) {
            const col = x * 4;
            let ar = 0, ag = 0, ab = 0, aa = 0;
            for (let i = -r; i <= r; i++) {
                const y = Math.min(h - 1, Math.max(0, i)) * w * 4 + col;
                ar += data[y]; ag += data[y + 1]; ab += data[y + 2]; aa += data[y + 3];
            }
            for (let y = 0; y < h; y++) {
                const o = y * w * 4 + col;
                out[o] = ar / span; out[o + 1] = ag / span; out[o + 2] = ab / span; out[o + 3] = aa / span;
                const addY = Math.min(h - 1, y + r + 1) * w * 4 + col;
                const subY = Math.max(0, y - r) * w * 4 + col;
                ar += data[addY] - data[subY];
                ag += data[addY + 1] - data[subY + 1];
                ab += data[addY + 2] - data[subY + 2];
                aa += data[addY + 3] - data[subY + 3];
            }
        }
        data.set(out);
    }

    // Whole-image shortcuts
    blurAllBtn.addEventListener('click', () => {
        const region = ctx.getImageData(0, 0, canvas.width, canvas.height);
        boxBlur(region, Math.max(3, Math.round(parseInt(blurIntensity.value, 10))));
        ctx.putImageData(region, 0, 0);
        pushHistory(); toast('Whole image blurred');
    });
    pixelAllBtn.addEventListener('click', () => {
        applyPixelate(0, 0, canvas.width, canvas.height);
        pushHistory(); toast('Whole image pixelated');
    });

    // ===== Watermark ======================================================
    addWatermarkBtn.addEventListener('click', () => {
        if (watermarkMode) { cancelWatermarkMode(); return; }
        watermarkMode = true;
        currentTool = null; setActive(null);
        addWatermarkBtn.classList.add('active');
        addWatermarkBtn.textContent = '❌ Cancel placement';
        canvas.style.cursor = 'copy';
        toast('Click on the image to place the watermark');
    });
    function cancelWatermarkMode() {
        watermarkMode = false;
        addWatermarkBtn.classList.remove('active');
        addWatermarkBtn.textContent = '📍 Place watermark';
        canvas.style.cursor = 'crosshair';
        restoreBase();
    }

    function drawWatermark(x, y, preview) {
        const text = watermarkText.value || 'For: [purpose] only';
        const date = watermarkDate.value;
        const size = parseInt(fontSize.value, 10);
        const opacity = parseFloat(watermarkOpacity.value);
        const rotation = parseInt(watermarkRotation.value, 10) * Math.PI / 180;
        ctx.save();
        ctx.globalAlpha = preview ? opacity * 0.7 : opacity;
        ctx.font = 'bold ' + size + 'px ' + getComputedStyle(document.body).fontFamily;
        ctx.fillStyle = watermarkColor.value;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,.45)';
        ctx.shadowBlur = Math.max(2, size / 10);
        ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1;
        ctx.translate(x, y);
        ctx.rotate(rotation);
        if (date) {
            ctx.fillText(text, 0, -size * 0.6);
            ctx.fillText(date, 0, size * 0.6);
        } else {
            ctx.fillText(text, 0, 0);
        }
        ctx.restore();
    }
    function placeWatermark(x, y) { drawWatermark(x, y, false); pushHistory(); toast('Watermark placed'); }

    tileWatermarkBtn.addEventListener('click', () => {
        const text = watermarkText.value || 'For: [purpose] only';
        const date = watermarkDate.value;
        const size = parseInt(fontSize.value, 10);
        const opacity = parseFloat(watermarkOpacity.value);
        const rotation = parseInt(watermarkRotation.value, 10) * Math.PI / 180;
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.font = 'bold ' + size + 'px ' + getComputedStyle(document.body).fontFamily;
        ctx.fillStyle = watermarkColor.value;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const label = date ? text + '   ' + date : text;
        const stepX = Math.max(ctx.measureText(label).width, size * 4) + size * 2;
        const stepY = size * 4;
        ctx.rotate(rotation);
        const diag = Math.hypot(canvas.width, canvas.height);
        for (let y = -diag; y < diag; y += stepY) {
            for (let x = -diag; x < diag; x += stepX) {
                ctx.fillText(label, x, y);
            }
        }
        ctx.restore();
        pushHistory();
        toast('Watermark tiled across document');
    });

    // ===== Metadata =======================================================
    const SENSITIVE = new Set([
        'GPSLatitude', 'GPSLongitude', 'GPSAltitude', 'GPSLatitudeRef', 'GPSLongitudeRef',
        'GPSAltitudeRef', 'GPSTimeStamp', 'GPSDateStamp', 'GPSProcessingMethod',
        'Make', 'Model', 'LensModel', 'LensMake', 'Software', 'SerialNumber',
        'DateTime', 'DateTimeOriginal', 'DateTimeDigitized', 'Artist', 'Copyright', 'UserComment'
    ]);

    function extractMetadata(file) {
        imageMetadata = {};
        sensitiveKeys = new Set();
        imageMetadata['File Name'] = file.name;
        imageMetadata['File Size'] = formatBytes(file.size);
        imageMetadata['File Type'] = file.type || 'unknown';
        imageMetadata['Last Modified'] = new Date(file.lastModified).toLocaleString();
        imageMetadata['Dimensions'] = canvas.width + ' × ' + canvas.height + ' px';

        try {
            EXIF.getData(file, function () {
                const all = EXIF.getAllTags(this) || {};
                Object.keys(all).forEach(tag => {
                    let value = all[tag];
                    if (value === undefined || value === null || value === '') return;
                    if (tag === 'GPSLatitude' || tag === 'GPSLongitude') value = formatGPS(value);
                    else if (Array.isArray(value)) value = value.join(', ');
                    else if (typeof value === 'object') { try { value = JSON.stringify(value); } catch (e) { value = String(value); } }
                    imageMetadata[tag] = value;
                    if (SENSITIVE.has(tag)) sensitiveKeys.add(tag);
                });
                displayMetadata();
            });
        } catch (e) {
            displayMetadata();
        }
        // Ensure something shows even if EXIF is async/never fires
        displayMetadata();
    }
    function formatGPS(coord) {
        if (!Array.isArray(coord) || coord.length !== 3) return coord;
        return coord[0] + '° ' + coord[1] + "' " + coord[2] + '"';
    }
    function displayMetadata() {
        const keys = Object.keys(imageMetadata);
        if (!keys.length) { metadataDisplay.innerHTML = '<div class="no-metadata">No metadata found.</div>'; return; }
        let html = '';
        keys.forEach(key => {
            const val = imageMetadata[key];
            if (val === '' || val === undefined || val === null) return;
            const flag = sensitiveKeys.has(key);
            html += '<div class="metadata-item"><span class="metadata-key">' + escapeHtml(key) +
                (flag ? ' ⚠️' : '') + '</span><span class="metadata-value' + (flag ? ' flag' : '') + '">' +
                escapeHtml(String(val)) + '</span></div>';
        });
        metadataDisplay.innerHTML = html || '<div class="no-metadata">No metadata found.</div>';
    }

    // ===== Zoom ===========================================================
    function applyZoom() {
        if (fitMode) {
            canvas.style.width = '';
            canvas.style.height = '';
            canvas.style.maxWidth = '100%';
            canvas.style.maxHeight = window.innerWidth <= 980 ? '60vh' : '72vh';
            zoomLabel.textContent = 'Fit';
        } else {
            canvas.style.maxWidth = 'none';
            canvas.style.maxHeight = 'none';
            canvas.style.width = (canvas.width * zoom) + 'px';
            canvas.style.height = (canvas.height * zoom) + 'px';
            zoomLabel.textContent = Math.round(zoom * 100) + '%';
        }
    }
    function setZoom(z) { fitMode = false; zoom = Math.min(8, Math.max(0.1, z)); applyZoom(); }
    zoomInBtn.addEventListener('click', () => setZoom((fitMode ? 1 : zoom) * 1.25));
    zoomOutBtn.addEventListener('click', () => setZoom((fitMode ? 1 : zoom) / 1.25));
    zoomResetBtn.addEventListener('click', () => { fitMode = true; applyZoom(); });
    window.addEventListener('resize', () => { if (fitMode) applyZoom(); });

    // ===== Export =========================================================
    function exportBlob() {
        return new Promise((resolve, reject) => {
            const type = formatSelect.value;
            const quality = type === 'image/png' ? undefined : parseFloat(qualityRange.value);
            canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('encode failed')), type, quality);
        });
    }
    exportBtn.addEventListener('click', async () => {
        if (!currentFile) return;
        try {
            const blob = await exportBlob();
            const ext = ({ 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' })[formatSelect.value] || 'png';
            const base = currentFile.name.replace(/\.[^/.]+$/, '') || 'document';
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = base + '_censored.' + ext;
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            toast('✓ Downloaded — all metadata removed');
        } catch (e) {
            toast('Export failed. Try a different format.', true);
        }
    });

    copyBtn.addEventListener('click', async () => {
        if (!navigator.clipboard || !window.ClipboardItem) { toast('Clipboard copy not supported here.', true); return; }
        try {
            const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            toast('✓ Copied clean image to clipboard');
        } catch (e) {
            toast('Copy failed (browser blocked it).', true);
        }
    });

    clearBtn.addEventListener('click', () => {
        if (!originalImageData) return;
        if (!confirm('Discard all edits and restore the original image?')) return;
        ctx.putImageData(originalImageData, 0, 0);
        baseImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        undoStack.length = 0; redoStack.length = 0;
        updateHistoryButtons();
        if (watermarkMode) cancelWatermarkMode();
        setActive(null); currentTool = null;
        toast('Restored original image');
    });

    // ===== Keyboard shortcuts ============================================
    window.addEventListener('keydown', (e) => {
        const mod = e.ctrlKey || e.metaKey;
        if (!mod) { if (e.key === 'Escape' && watermarkMode) cancelWatermarkMode(); return; }
        const k = e.key.toLowerCase();
        if (k === 'z' && !e.shiftKey) { if (!undoBtn.disabled) { e.preventDefault(); undo(); } }
        else if ((k === 'y') || (k === 'z' && e.shiftKey)) { if (!redoBtn.disabled) { e.preventDefault(); redo(); } }
        else if (k === 's') { if (!exportBtn.disabled) { e.preventDefault(); exportBtn.click(); } }
    });

    updateWatermarkPreview();
})();
