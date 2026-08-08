/* ============================================================================
   LORE CREATOR — forge your own lore images 🪄
   Everything renders to a <canvas>, entirely in the browser: pick a backdrop
   (gradient preset, a random gallery image, or your own upload), add meme or
   scroll-style text, stamp emoji, then download the result as a PNG.
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('creator-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    /* ------------------------------ presets ------------------------------ */
    const GRADIENTS = [
        { name: 'Midnight spell', stops: ['#0b0524', '#2d1b69', '#a855f7'] },
        { name: 'Dragon fire', stops: ['#1a0505', '#7c2d12', '#f59e0b'] },
        { name: 'Forbidden forest', stops: ['#021208', '#14532d', '#22d3ee'] },
        { name: 'Phoenix dawn', stops: ['#2a0a2e', '#9d174d', '#fbbf24'] },
        { name: 'Astral sea', stops: ['#020617', '#1e3a8a', '#67e8f9'] },
        { name: 'Parchment', stops: ['#3b2f1e', '#8a6d3b', '#e7d3a1'] }
    ];

    const QUOTES = [
        { top: 'You\u2019re a wizard', bottom: 'Harry 🧙' },
        { top: 'It\u2019s leviOsa', bottom: 'not levioSA ✨' },
        { top: 'I solemnly swear', bottom: 'I am up to no good 🐾' },
        { top: 'Mischief', bottom: 'managed 📜' },
        { top: 'After all this time?', bottom: 'Always. 🦌' },
        { top: 'When in doubt', bottom: 'go to the library 📚' },
        { top: 'Ancient prophecy says', bottom: 'touch grass 🌿' },
        { top: 'The dark lord fears', bottom: 'my Monday energy ☕' },
        { top: 'Expecto', bottom: 'a nap 😴' },
        { top: 'Muggles when', bottom: 'the wifi dies 😱' }
    ];

    const EMOJIS = [
        '🧙', '🪄', '✨', '🔮', '📜', '🦉', '🐉', '🧹', '⚡', '🌙',
        '⭐', '🕯️', '🧪', '🗝️', '👑', '🦌', '🐍', '🦄', '💀', '😄',
        '😱', '🥰', '🤣', '💖', '🎉', '☕', '🍄', '🌿', '🏰', '🪶'
    ];

    /* ------------------------------- state ------------------------------- */
    const state = {
        bg: { type: 'gradient', gradient: GRADIENTS[0], image: null },
        topText: '',
        bottomText: '',
        style: 'meme', // 'meme' | 'scroll'
        emoji: null,   // currently selected emoji to stamp
        emojiSize: 120,
        stamps: []     // { emoji, x, y, size }
    };

    /* ----------------------------- rendering ----------------------------- */
    function drawBackground() {
        if (state.bg.type === 'image' && state.bg.image) {
            // Cover-fit the image on the square canvas.
            const img = state.bg.image;
            const scale = Math.max(W / img.width, H / img.height);
            const dw = img.width * scale;
            const dh = img.height * scale;
            ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
        } else {
            const g = ctx.createLinearGradient(0, 0, W, H);
            const stops = state.bg.gradient.stops;
            stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, W, H);
            // A few soft "aurora" glows so plain gradients feel magical.
            ctx.save();
            ctx.globalAlpha = 0.22;
            [[W * 0.25, H * 0.3, '#ffffff'], [W * 0.75, H * 0.7, stops[stops.length - 1]]].forEach(([x, y, c]) => {
                const r = ctx.createRadialGradient(x, y, 0, x, y, W * 0.45);
                r.addColorStop(0, c);
                r.addColorStop(1, 'transparent');
                ctx.fillStyle = r;
                ctx.fillRect(0, 0, W, H);
            });
            ctx.restore();
        }
    }

    function wrapLines(text, maxWidth) {
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

    function drawText(text, anchor) {
        if (!text) return;
        const meme = state.style === 'meme';
        const size = meme ? 92 : 76;
        const lineHeight = size * 1.12;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = meme
            ? `900 ${size}px Impact, 'Arial Black', sans-serif`
            : `700 ${size}px 'Cinzel Decorative', Georgia, serif`;
        ctx.lineJoin = 'round';

        const lines = wrapLines(meme ? text.toUpperCase() : text, W - 100);
        lines.forEach((line, i) => {
            const y = anchor === 'top'
                ? 60 + size + i * lineHeight
                : H - 70 - (lines.length - 1 - i) * lineHeight;
            if (meme) {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = size / 9;
                ctx.strokeText(line, W / 2, y);
                ctx.fillStyle = '#fff';
            } else {
                ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
                ctx.shadowBlur = 18;
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.lineWidth = size / 12;
                ctx.strokeText(line, W / 2, y);
                ctx.fillStyle = '#fbbf24';
            }
            ctx.fillText(line, W / 2, y);
        });
        ctx.restore();
    }

    function drawStamps() {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        state.stamps.forEach((s) => {
            ctx.font = `${s.size}px serif`;
            ctx.fillText(s.emoji, s.x, s.y);
        });
        ctx.restore();
    }

    function render() {
        ctx.clearRect(0, 0, W, H);
        drawBackground();
        drawStamps();
        drawText(state.topText, 'top');
        drawText(state.bottomText, 'bottom');
    }

    /* ------------------------------ controls ----------------------------- */
    // Gradient swatches
    const swatches = document.getElementById('creator-swatches');
    GRADIENTS.forEach((g, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'creator-swatch' + (i === 0 ? ' active' : '');
        btn.title = g.name;
        btn.setAttribute('aria-label', `Backdrop: ${g.name}`);
        btn.style.background = `linear-gradient(135deg, ${g.stops.join(', ')})`;
        btn.addEventListener('click', () => {
            state.bg = { type: 'gradient', gradient: g, image: null };
            markActiveSwatch(btn);
            render();
        });
        swatches.appendChild(btn);
    });

    function markActiveSwatch(active) {
        swatches.querySelectorAll('.creator-swatch').forEach((b) => b.classList.toggle('active', b === active));
    }

    function setImageBackground(src, crossOriginSafe) {
        const img = new Image();
        img.onload = () => {
            state.bg = { type: 'image', gradient: state.bg.gradient, image: img };
            markActiveSwatch(null);
            render();
        };
        img.onerror = () => setImageBackground(randomGallerySrc(), crossOriginSafe);
        img.src = src;
    }

    function randomGallerySrc() {
        const cfg = GALLERY_CONFIG[Math.floor(Math.random() * GALLERY_CONFIG.length)];
        const n = 1 + Math.floor(Math.random() * cfg.count);
        return `./img/${cfg.folder}/${cfg.folder} (${n}).${cfg.ext}`;
    }

    document.getElementById('creator-random-img').addEventListener('click', () => {
        setImageBackground(randomGallerySrc());
    });

    document.getElementById('creator-upload').addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setImageBackground(reader.result);
        reader.readAsDataURL(file);
        e.target.value = '';
    });

    // Quote presets
    const quoteSelect = document.getElementById('creator-quotes');
    QUOTES.forEach((q, i) => {
        const opt = document.createElement('option');
        opt.value = String(i);
        opt.textContent = `${q.top} / ${q.bottom}`;
        quoteSelect.appendChild(opt);
    });

    const topInput = document.getElementById('creator-top');
    const bottomInput = document.getElementById('creator-bottom');

    quoteSelect.addEventListener('change', () => {
        const q = QUOTES[Number(quoteSelect.value)];
        if (!q) return;
        state.topText = topInput.value = q.top;
        state.bottomText = bottomInput.value = q.bottom;
        render();
    });

    topInput.addEventListener('input', () => { state.topText = topInput.value; render(); });
    bottomInput.addEventListener('input', () => { state.bottomText = bottomInput.value; render(); });

    // Text style toggle
    const memeBtn = document.getElementById('creator-style-meme');
    const scrollBtn = document.getElementById('creator-style-scroll');
    function setStyle(style) {
        state.style = style;
        memeBtn.classList.toggle('active', style === 'meme');
        scrollBtn.classList.toggle('active', style === 'scroll');
        memeBtn.setAttribute('aria-checked', String(style === 'meme'));
        scrollBtn.setAttribute('aria-checked', String(style === 'scroll'));
        render();
    }
    memeBtn.addEventListener('click', () => setStyle('meme'));
    scrollBtn.addEventListener('click', () => setStyle('scroll'));

    // Emoji palette
    const palette = document.getElementById('creator-emojis');
    EMOJIS.forEach((emoji) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'creator-emoji';
        btn.textContent = emoji;
        btn.setAttribute('aria-label', `Select ${emoji} stamp`);
        btn.addEventListener('click', () => {
            const isActive = state.emoji === emoji;
            state.emoji = isActive ? null : emoji;
            palette.querySelectorAll('.creator-emoji').forEach((b) => {
                b.classList.toggle('active', b === btn && !isActive);
            });
        });
        palette.appendChild(btn);
    });

    const sizeSlider = document.getElementById('creator-emoji-size');
    sizeSlider.addEventListener('input', () => {
        state.emojiSize = Number(sizeSlider.value);
    });

    // Stamp on canvas click (coordinates mapped from CSS pixels to canvas pixels).
    canvas.addEventListener('click', (e) => {
        if (!state.emoji) return;
        const rect = canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * W;
        const y = ((e.clientY - rect.top) / rect.height) * H;
        state.stamps.push({ emoji: state.emoji, x, y, size: state.emojiSize });
        render();
    });

    document.getElementById('creator-undo').addEventListener('click', () => {
        state.stamps.pop();
        render();
    });

    document.getElementById('creator-clear').addEventListener('click', () => {
        state.stamps = [];
        render();
    });

    // Surprise me: random backdrop + quote + a couple of stamps.
    document.getElementById('creator-surprise').addEventListener('click', () => {
        const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
        state.topText = topInput.value = q.top;
        state.bottomText = bottomInput.value = q.bottom;
        quoteSelect.value = String(QUOTES.indexOf(q));
        state.stamps = [];
        const stampCount = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < stampCount; i++) {
            state.stamps.push({
                emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
                x: W * (0.15 + Math.random() * 0.7),
                y: H * (0.3 + Math.random() * 0.4),
                size: 90 + Math.floor(Math.random() * 100)
            });
        }
        if (Math.random() < 0.5) {
            setImageBackground(randomGallerySrc());
        } else {
            const g = GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)];
            state.bg = { type: 'gradient', gradient: g, image: null };
            markActiveSwatch(swatches.children[GRADIENTS.indexOf(g)]);
            render();
        }
    });

    // Download as PNG.
    document.getElementById('creator-download').addEventListener('click', () => {
        render();
        canvas.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'lore-creation.png';
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }, 'image/png');
    });

    // First paint (re-render once the display fonts are ready so scroll-style
    // text uses Cinzel instead of the fallback).
    render();
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(render);
    }
});
