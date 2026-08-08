/* ============================================================================
   LORE CREATOR — forge your own lore cards & muggle memes.
   Canvas-only, no libraries, everything stays on your device.
   ========================================================================== */
(() => {
    'use strict';

    /* -----------------------------------------------------------------------
       Word-hoards
       ----------------------------------------------------------------------- */
    const LORE_TITLES = [
        'Ancient Wisdom', 'The Grimoire Says', 'Prophecy № 7', 'Forbidden Knowledge',
        'Wizard Proverb', 'From the Restricted Section', 'Scroll of Truth',
        'The Elders Whisper', 'Enchanted Reminder', 'Lore of the Day'
    ];

    const LORE_QUOTES = [
        'Trust the wand. The plan was never real.',
        'The prophecy said nothing about Mondays.',
        'Magic is just chores done with confidence.',
        'Every cauldron is a soup pot if you believe.',
        'Not all who wander are lost — some seek snacks.',
        'The owl delivers, but never explains.',
        'A tidy spellbook hides an untidy mind.',
        'Beware of wizards selling wands with warranties.',
        'The third rule of magic: there are no rules.',
        'Even dragons started as difficult eggs.',
        'Moonlight is free. Use it generously.',
        'A whispered spell is still a spell.',
        'The castle remembers everyone who was kind.',
        'Potions take time. So do people.',
        'Never duel before breakfast.',
        'The stars are just old spells still burning.',
        'Some doors only open for the curious.',
        'A familiar chooses you. Usually at 3 a.m.',
        'Enchant responsibly. Disenchant rarely.',
        'The broom flies better when you stop steering.'
    ];

    const MEME_PAIRS = [
        ['WHEN THE POTION SAYS', 'SHAKE WELL BEFORE OPENING'],
        ['ME CASTING A SPELL', 'THE SPELL: CASTING ME'],
        ['NOBODY:', 'THE OWL AT 3AM: HOOT'],
        ['CERTIFIED', 'MUGGLE MOMENT'],
        ['ONE DOES NOT SIMPLY', 'ORGANISE THE SPELLBOOK'],
        ['ME: I KNOW A SHORTCUT', 'THE SHORTCUT:'],
        ['WIZARDS AFTER ONE SPELL', 'TIME FOR A 200 YEAR NAP'],
        ['THE CAULDRON IS EMPTY', 'THE VIBES ARE FULL'],
        ['LEVEL 1 MAGE', 'LEVEL 100 CONFIDENCE'],
        ['INSTRUCTIONS UNCLEAR', 'CAT IS NOW A DRAGON'],
        ['MY LAST BRAINCELL', 'CASTING FIREBALL INDOORS'],
        ['WHEN YOU FINALLY REST', 'AND THE QUEST UPDATES']
    ];

    const EMOJI_PALETTE = [
        '🧙', '🪄', '✨', '🔮', '🐉', '🦄', '🦉', '🧪', '📜', '🕯️',
        '🌙', '⚡', '🎩', '🐈‍⬛', '🍄', '🗝️', '🦇', '☄️', '🧹', '🏰'
    ];

    const BG_STYLES = ['nebula', 'aurora', 'parchment', 'midnight', 'potion'];

    /* -----------------------------------------------------------------------
       Elements
       ----------------------------------------------------------------------- */
    const $ = (id) => document.getElementById(id);
    const section = $('creator');
    const toggleBtn = $('creator-toggle');
    if (!section || !toggleBtn) return;

    const canvas = $('creator-canvas');
    const ctx = canvas.getContext('2d');
    const styleSelect = $('creator-bg-style');
    const galleryBtn = $('creator-bg-gallery');
    const generateBtn = $('creator-bg-generate');
    const uploadInput = $('creator-bg-upload');
    const topInput = $('creator-top-text');
    const bottomInput = $('creator-bottom-text');
    const quoteBtn = $('creator-quote');
    const emojiTray = $('creator-emoji-tray');
    const sizeSlider = $('creator-emoji-size');
    const clearBtn = $('creator-emoji-clear');
    const randomBtn = $('creator-random');
    const downloadBtn = $('creator-download');
    const modeRadios = Array.from(document.querySelectorAll('input[name="creator-mode"]'));

    /* -----------------------------------------------------------------------
       State
       ----------------------------------------------------------------------- */
    const state = {
        bgType: 'generated',          // 'generated' | 'image'
        bgStyle: 'nebula',
        seed: (Math.random() * 1e9) >>> 0,
        bgImage: null,                // HTMLImageElement when bgType === 'image'
        mode: 'lore',                 // 'lore' | 'meme'
        topText: 'Ancient Wisdom',
        bottomText: 'Trust the wand. The plan was never real.',
        stickers: [],                 // { ch, x, y, size }  (x/y are 0..1)
        selected: -1
    };

    topInput.value = state.topText;
    bottomInput.value = state.bottomText;

    // Seeded PRNG so "regenerate" gives a genuinely new but stable backdrop.
    function mulberry32(a) {
        return () => {
            a |= 0; a = (a + 0x6D2B79F5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    /* -----------------------------------------------------------------------
       Canvas sizing — generated backdrops are square; photo backdrops keep
       their aspect ratio (clamped so extreme panoramas stay usable).
       ----------------------------------------------------------------------- */
    const BASE = 1080;

    function resizeCanvas() {
        let w = BASE;
        let h = BASE;
        if (state.bgType === 'image' && state.bgImage) {
            const ratio = state.bgImage.naturalHeight / state.bgImage.naturalWidth;
            h = Math.round(BASE * Math.min(1.5, Math.max(0.6, ratio)));
        }
        if (canvas.width !== w) canvas.width = w;
        if (canvas.height !== h) canvas.height = h;
    }

    /* -----------------------------------------------------------------------
       Generated backdrops
       ----------------------------------------------------------------------- */
    function drawStars(rnd, W, H, n, bright) {
        for (let i = 0; i < n; i++) {
            const x = rnd() * W;
            const y = rnd() * H;
            const r = rnd() * 1.8 + 0.4;
            ctx.globalAlpha = 0.25 + rnd() * (bright ? 0.75 : 0.45);
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
        // A few four-point sparkles.
        for (let i = 0; i < 6; i++) {
            const x = rnd() * W;
            const y = rnd() * H;
            const s = 6 + rnd() * 14;
            ctx.globalAlpha = 0.5 + rnd() * 0.5;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(x - s, y); ctx.lineTo(x + s, y);
            ctx.moveTo(x, y - s); ctx.lineTo(x, y + s);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }

    function bgNebula(rnd, W, H) {
        ctx.fillStyle = '#0b0524';
        ctx.fillRect(0, 0, W, H);
        const hues = ['168,85,247', '236,72,153', '34,211,238', '251,191,36'];
        for (let i = 0; i < 7; i++) {
            const x = rnd() * W;
            const y = rnd() * H;
            const r = W * (0.25 + rnd() * 0.35);
            const g = ctx.createRadialGradient(x, y, 0, x, y, r);
            g.addColorStop(0, `rgba(${hues[i % hues.length]},${0.18 + rnd() * 0.16})`);
            g.addColorStop(1, 'rgba(11,5,36,0)');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, W, H);
        }
        drawStars(rnd, W, H, 220, true);
    }

    function bgAurora(rnd, W, H) {
        const base = ctx.createLinearGradient(0, 0, 0, H);
        base.addColorStop(0, '#020617');
        base.addColorStop(1, '#0b1b33');
        ctx.fillStyle = base;
        ctx.fillRect(0, 0, W, H);
        drawStars(rnd, W, H, 150, false);
        const colors = ['52,211,153', '34,211,238', '168,85,247'];
        for (let i = 0; i < 3; i++) {
            const yBase = H * (0.2 + i * 0.16 + rnd() * 0.06);
            ctx.beginPath();
            ctx.moveTo(-50, yBase);
            for (let x = 0; x <= W + 50; x += 40) {
                ctx.lineTo(x, yBase + Math.sin(x / (90 + i * 30) + rnd() * 2) * 46);
            }
            ctx.lineTo(W + 50, yBase - 190);
            ctx.lineTo(-50, yBase - 190);
            ctx.closePath();
            const g = ctx.createLinearGradient(0, yBase - 190, 0, yBase + 46);
            g.addColorStop(0, `rgba(${colors[i]},0)`);
            g.addColorStop(1, `rgba(${colors[i]},0.32)`);
            ctx.fillStyle = g;
            ctx.fill();
        }
    }

    function bgParchment(rnd, W, H) {
        ctx.fillStyle = '#e6d3a7';
        ctx.fillRect(0, 0, W, H);
        // Speckle it like old paper.
        for (let i = 0; i < 2400; i++) {
            ctx.globalAlpha = rnd() * 0.08;
            ctx.fillStyle = rnd() > 0.5 ? '#8a6d3b' : '#5b451f';
            ctx.fillRect(rnd() * W, rnd() * H, rnd() * 3 + 1, rnd() * 3 + 1);
        }
        ctx.globalAlpha = 1;
        // Stained blotches.
        for (let i = 0; i < 5; i++) {
            const x = rnd() * W;
            const y = rnd() * H;
            const r = 60 + rnd() * 190;
            const g = ctx.createRadialGradient(x, y, 0, x, y, r);
            g.addColorStop(0, 'rgba(120,84,32,0.13)');
            g.addColorStop(1, 'rgba(120,84,32,0)');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, W, H);
        }
        // Burnt vignette + double border.
        const v = ctx.createRadialGradient(W / 2, H / 2, W * 0.32, W / 2, H / 2, W * 0.78);
        v.addColorStop(0, 'rgba(60,38,10,0)');
        v.addColorStop(1, 'rgba(60,38,10,0.5)');
        ctx.fillStyle = v;
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = 'rgba(90,62,22,0.65)';
        ctx.lineWidth = 5;
        ctx.strokeRect(28, 28, W - 56, H - 56);
        ctx.lineWidth = 1.6;
        ctx.strokeRect(44, 44, W - 88, H - 88);
    }

    function bgMidnight(rnd, W, H) {
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#050510');
        g.addColorStop(0.7, '#141433');
        g.addColorStop(1, '#241a4d');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        drawStars(rnd, W, H, 260, true);
        // Moon with halo.
        const mx = W * (0.62 + rnd() * 0.24);
        const my = H * (0.16 + rnd() * 0.14);
        const halo = ctx.createRadialGradient(mx, my, 40, mx, my, 210);
        halo.addColorStop(0, 'rgba(253,240,200,0.5)');
        halo.addColorStop(1, 'rgba(253,240,200,0)');
        ctx.fillStyle = halo;
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#f6ecc9';
        ctx.beginPath();
        ctx.arc(mx, my, 62, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(200,185,140,0.5)';
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(mx - 30 + rnd() * 60, my - 30 + rnd() * 60, 4 + rnd() * 9, 0, Math.PI * 2);
            ctx.fill();
        }
        // Rolling hill silhouettes.
        ctx.fillStyle = '#03030a';
        for (let i = 0; i < 2; i++) {
            const yBase = H * (0.82 + i * 0.08);
            ctx.beginPath();
            ctx.moveTo(0, H);
            for (let x = 0; x <= W; x += 30) {
                ctx.lineTo(x, yBase + Math.sin(x / 150 + i * 2 + rnd()) * 26);
            }
            ctx.lineTo(W, H);
            ctx.closePath();
            ctx.fill();
        }
    }

    function bgPotion(rnd, W, H) {
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, '#0f2027');
        g.addColorStop(0.5, '#1b3a4b');
        g.addColorStop(1, '#3b1d5a');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        // Glowing brew light from below.
        const glow = ctx.createRadialGradient(W / 2, H, 60, W / 2, H, H * 0.9);
        glow.addColorStop(0, 'rgba(52,211,153,0.4)');
        glow.addColorStop(1, 'rgba(52,211,153,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, W, H);
        // Rising bubbles.
        for (let i = 0; i < 40; i++) {
            const x = rnd() * W;
            const y = rnd() * H;
            const r = 4 + rnd() * 26;
            ctx.globalAlpha = 0.12 + rnd() * 0.3;
            ctx.strokeStyle = '#a7f3d0';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha *= 0.8;
            ctx.fillStyle = '#d1fae5';
            ctx.beginPath();
            ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.22, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        drawStars(rnd, W, H, 60, false);
    }

    const BG_PAINTERS = {
        nebula: bgNebula,
        aurora: bgAurora,
        parchment: bgParchment,
        midnight: bgMidnight,
        potion: bgPotion
    };

    /* -----------------------------------------------------------------------
       Drawing helpers
       ----------------------------------------------------------------------- */
    function drawCover(img, W, H) {
        const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;
        ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
    }

    // Word-wrap `text` to `maxWidth`, returning the lines.
    function wrapText(text, maxWidth) {
        const words = text.split(/\s+/).filter(Boolean);
        const lines = [];
        let line = '';
        words.forEach((word) => {
            const test = line ? `${line} ${word}` : word;
            if (ctx.measureText(test).width > maxWidth && line) {
                lines.push(line);
                line = word;
            } else {
                line = test;
            }
        });
        if (line) lines.push(line);
        return lines;
    }

    // Shrink the font until the text fits in `maxLines` at `maxWidth`.
    function fitText(text, fontFor, startSize, minSize, maxWidth, maxLines) {
        let size = startSize;
        let lines;
        for (; size >= minSize; size -= 4) {
            ctx.font = fontFor(size);
            lines = wrapText(text, maxWidth);
            if (lines.length <= maxLines) break;
        }
        return { size: Math.max(size, minSize), lines };
    }

    function paintLoreText(W, H) {
        const isParchment = state.bgType === 'generated' && state.bgStyle === 'parchment';
        const ink = isParchment ? '#3b2a10' : '#f8e7b3';
        const glowColor = isParchment ? 'rgba(59,42,16,0.35)' : 'rgba(251,191,36,0.55)';

        // Readability veil behind the quote on busy/photo backdrops.
        if (!isParchment) {
            const veil = ctx.createLinearGradient(0, H * 0.52, 0, H);
            veil.addColorStop(0, 'rgba(5,2,20,0)');
            veil.addColorStop(0.55, 'rgba(5,2,20,0.55)');
            veil.addColorStop(1, 'rgba(5,2,20,0.78)');
            ctx.fillStyle = veil;
            ctx.fillRect(0, H * 0.5, W, H * 0.5);
            const cap = ctx.createLinearGradient(0, 0, 0, H * 0.24);
            cap.addColorStop(0, 'rgba(5,2,20,0.6)');
            cap.addColorStop(1, 'rgba(5,2,20,0)');
            ctx.fillStyle = cap;
            ctx.fillRect(0, 0, W, H * 0.24);
        }

        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';

        // Eyebrow title.
        if (state.topText.trim()) {
            ctx.font = `700 ${Math.round(W * 0.034)}px "Cinzel Decorative", Georgia, serif`;
            ctx.fillStyle = ink;
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 14;
            const title = `✦ ${state.topText.trim().toUpperCase()} ✦`;
            ctx.fillText(title, W / 2, H * 0.12, W * 0.9);
            ctx.shadowBlur = 0;
        }

        // Main quote near the lower third.
        const quote = state.bottomText.trim();
        if (quote) {
            const fontFor = (s) => `900 ${s}px "Cinzel Decorative", Georgia, serif`;
            const { size, lines } = fitText(quote, fontFor, Math.round(W * 0.062), 30, W * 0.82, 4);
            ctx.font = fontFor(size);
            const lineHeight = size * 1.32;
            const yStart = H * 0.86 - (lines.length - 1) * lineHeight;
            ctx.shadowColor = 'rgba(0,0,0,0.55)';
            ctx.shadowBlur = 16;
            ctx.shadowOffsetY = 3;
            ctx.fillStyle = ink;
            lines.forEach((line, i) => ctx.fillText(line, W / 2, yStart + i * lineHeight));
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;
            // Divider flourish above the quote.
            const flourishY = yStart - lineHeight * 0.9;
            ctx.font = `400 ${Math.round(W * 0.03)}px Georgia, serif`;
            ctx.fillStyle = isParchment ? 'rgba(59,42,16,0.75)' : 'rgba(248,231,179,0.85)';
            ctx.fillText('— ✦ —', W / 2, flourishY);
        }
    }

    function paintMemeText(W, H) {
        const fontFor = (s) => `900 ${s}px Impact, "Arial Black", sans-serif`;
        const draw = (text, anchor) => {
            if (!text.trim()) return;
            const { size, lines } = fitText(text.trim().toUpperCase(), fontFor, Math.round(W * 0.085), 34, W * 0.92, 3);
            ctx.font = fontFor(size);
            ctx.textAlign = 'center';
            ctx.lineJoin = 'round';
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = Math.max(4, size / 11);
            const lineHeight = size * 1.16;
            lines.forEach((line, i) => {
                const y = anchor === 'top'
                    ? size + W * 0.03 + i * lineHeight
                    : H - W * 0.04 - (lines.length - 1 - i) * lineHeight;
                ctx.strokeText(line, W / 2, y);
                ctx.fillText(line, W / 2, y);
            });
        };
        draw(state.topText, 'top');
        draw(state.bottomText, 'bottom');
    }

    function paintStickers(W, H) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        state.stickers.forEach((s, i) => {
            ctx.font = `${s.size}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
            ctx.fillText(s.ch, s.x * W, s.y * H);
            if (i === state.selected) {
                ctx.save();
                ctx.strokeStyle = 'rgba(34,211,238,0.9)';
                ctx.lineWidth = 3;
                ctx.setLineDash([8, 7]);
                ctx.beginPath();
                ctx.arc(s.x * W, s.y * H, s.size * 0.62, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
        });
        ctx.textBaseline = 'alphabetic';
    }

    function render() {
        resizeCanvas();
        const W = canvas.width;
        const H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        if (state.bgType === 'image' && state.bgImage) {
            drawCover(state.bgImage, W, H);
        } else {
            const painter = BG_PAINTERS[state.bgStyle] || bgNebula;
            painter(mulberry32(state.seed), W, H);
        }

        if (state.mode === 'lore') paintLoreText(W, H);
        else paintMemeText(W, H);

        paintStickers(W, H);
    }

    /* -----------------------------------------------------------------------
       Background sources
       ----------------------------------------------------------------------- */
    function useGeneratedBackdrop(newSeed) {
        state.bgType = 'generated';
        if (newSeed) state.seed = (Math.random() * 1e9) >>> 0;
        render();
    }

    function loadImageBackdrop(src) {
        const img = new Image();
        img.onload = () => {
            state.bgType = 'image';
            state.bgImage = img;
            render();
        };
        img.onerror = () => useGeneratedBackdrop(true);
        img.src = src;
    }

    function randomGallerySrc() {
        const cfg = pick(GALLERY_CONFIG);
        return gallerySrc(cfg, 1 + Math.floor(Math.random() * cfg.count));
    }

    /* -----------------------------------------------------------------------
       Sticker interaction — drag to move, double-tap to remove.
       ----------------------------------------------------------------------- */
    let dragging = false;

    function canvasPoint(e) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (canvas.width / rect.width),
            y: (e.clientY - rect.top) * (canvas.height / rect.height)
        };
    }

    function hitSticker(p) {
        for (let i = state.stickers.length - 1; i >= 0; i--) {
            const s = state.stickers[i];
            const dx = p.x - s.x * canvas.width;
            const dy = p.y - s.y * canvas.height;
            if (Math.hypot(dx, dy) <= s.size * 0.65) return i;
        }
        return -1;
    }

    canvas.addEventListener('pointerdown', (e) => {
        const p = canvasPoint(e);
        const hit = hitSticker(p);
        state.selected = hit;
        if (hit !== -1) {
            dragging = true;
            sizeSlider.value = state.stickers[hit].size;
            canvas.setPointerCapture(e.pointerId);
        }
        render();
    });

    canvas.addEventListener('pointermove', (e) => {
        if (!dragging || state.selected === -1) return;
        const p = canvasPoint(e);
        const s = state.stickers[state.selected];
        s.x = Math.min(1, Math.max(0, p.x / canvas.width));
        s.y = Math.min(1, Math.max(0, p.y / canvas.height));
        render();
    });

    canvas.addEventListener('pointerup', () => { dragging = false; });
    canvas.addEventListener('pointercancel', () => { dragging = false; });

    canvas.addEventListener('dblclick', (e) => {
        const hit = hitSticker(canvasPoint(e));
        if (hit !== -1) {
            state.stickers.splice(hit, 1);
            state.selected = -1;
            render();
        }
    });

    function addSticker(ch) {
        state.stickers.push({
            ch,
            x: 0.3 + Math.random() * 0.4,
            y: 0.25 + Math.random() * 0.4,
            size: Number(sizeSlider.value) || 130
        });
        state.selected = state.stickers.length - 1;
        render();
    }

    /* -----------------------------------------------------------------------
       Controls
       ----------------------------------------------------------------------- */
    EMOJI_PALETTE.forEach((ch) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'emoji-chip';
        btn.textContent = ch;
        btn.setAttribute('aria-label', `Add ${ch} sticker`);
        btn.addEventListener('click', () => addSticker(ch));
        emojiTray.appendChild(btn);
    });

    sizeSlider.addEventListener('input', () => {
        if (state.selected !== -1) {
            state.stickers[state.selected].size = Number(sizeSlider.value);
            render();
        }
    });

    clearBtn.addEventListener('click', () => {
        state.stickers = [];
        state.selected = -1;
        render();
    });

    galleryBtn.addEventListener('click', () => loadImageBackdrop(randomGallerySrc()));

    generateBtn.addEventListener('click', () => {
        state.bgStyle = styleSelect.value;
        useGeneratedBackdrop(true);
    });

    styleSelect.addEventListener('change', () => {
        state.bgStyle = styleSelect.value;
        useGeneratedBackdrop(false);
    });

    uploadInput.addEventListener('change', () => {
        const file = uploadInput.files && uploadInput.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            state.bgType = 'image';
            state.bgImage = img;
            render();
            URL.revokeObjectURL(url);
        };
        img.src = url;
        uploadInput.value = '';
    });

    let textTimer;
    const onTextInput = () => {
        clearTimeout(textTimer);
        textTimer = setTimeout(() => {
            state.topText = topInput.value;
            state.bottomText = bottomInput.value;
            render();
        }, 90);
    };
    topInput.addEventListener('input', onTextInput);
    bottomInput.addEventListener('input', onTextInput);

    modeRadios.forEach((radio) => {
        radio.addEventListener('change', () => {
            if (!radio.checked) return;
            state.mode = radio.value;
            render();
        });
    });

    function rollQuote() {
        if (state.mode === 'lore') {
            state.topText = pick(LORE_TITLES);
            state.bottomText = pick(LORE_QUOTES);
        } else {
            const pair = pick(MEME_PAIRS);
            state.topText = pair[0];
            state.bottomText = pair[1];
        }
        topInput.value = state.topText;
        bottomInput.value = state.bottomText;
        render();
    }

    quoteBtn.addEventListener('click', rollQuote);

    randomBtn.addEventListener('click', () => {
        state.mode = Math.random() > 0.5 ? 'lore' : 'meme';
        modeRadios.forEach((r) => { r.checked = r.value === state.mode; });
        state.stickers = [];
        state.selected = -1;
        const n = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < n; i++) {
            state.stickers.push({
                ch: pick(EMOJI_PALETTE),
                x: 0.12 + Math.random() * 0.76,
                y: 0.15 + Math.random() * 0.55,
                size: 90 + Math.floor(Math.random() * 110)
            });
        }
        rollQuote(); // renders with the new words
        if (Math.random() > 0.45) {
            state.bgStyle = pick(BG_STYLES);
            styleSelect.value = state.bgStyle;
            useGeneratedBackdrop(true);
        } else {
            loadImageBackdrop(randomGallerySrc());
        }
    });

    downloadBtn.addEventListener('click', () => {
        const wasSelected = state.selected;
        state.selected = -1;   // hide the selection ring in the export
        render();
        canvas.toBlob((blob) => {
            state.selected = wasSelected;
            render();
            if (!blob) return;
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `lore-card-${Date.now()}.png`;
            link.click();
            setTimeout(() => URL.revokeObjectURL(link.href), 4000);
        }, 'image/png');
    });

    /* -----------------------------------------------------------------------
       Open / close
       ----------------------------------------------------------------------- */
    function setOpen(open) {
        section.hidden = !open;
        toggleBtn.setAttribute('aria-expanded', String(open));
        toggleBtn.innerHTML = open
            ? '<span aria-hidden="true">🪄</span> Close the Lore Creator'
            : '<span aria-hidden="true">🪄</span> Open the Lore Creator';
        if (open) {
            render();
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    toggleBtn.addEventListener('click', () => setOpen(section.hidden));

    /* Public hook used by the lightbox "Remix" button. */
    window.LoreCreator = {
        openWith(src) {
            setOpen(true);
            loadImageBackdrop(src);
        }
    };

    // Re-render once the display font arrives so the first card isn't in a
    // fallback serif. Safe even if the font never loads.
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => { if (!section.hidden) render(); });
    }

    render(); // pre-render so opening the panel is instant
})();
