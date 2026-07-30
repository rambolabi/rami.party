/* ==========================================================================
   Frostcaller — the small shared interface bits
   --------------------------------------------------------------------------
   Toast, clipboard, download, the year in the footer, the back-to-top button
   and the starfield. Both pages had their own near-identical copy of every one
   of these; this is the single copy, so a fix lands in both places and the
   strings only need translating once.

   Loaded after i18n.js and text.js, before either page's own script.
   ========================================================================== */

'use strict';

let toastTimer;

/** A short message in the corner. Replaces whatever was there. */
function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = el('div', 'toast');
        toast.id = 'toast';
        toast.setAttribute('role', 'status');
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    requestAnimationFrame(() => toast.classList.add('show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
}

/**
 * Copy to the clipboard, then say so — on the button itself if one was given,
 * so the feedback appears where the user is looking.
 */
function copyText(text, btn) {
    const label = btn ? btn.textContent : null;
    const done = () => {
        showToast(t('ui.copied'));
        if (btn) {
            btn.textContent = t('ui.copiedbtn');
            setTimeout(() => { btn.textContent = label; }, 1400);
        }
    };
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else {
        fallbackCopy(text, done);
    }
}

/** For insecure contexts and older browsers, where the async API is absent. */
function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { showToast(t('ui.copyfail')); }
    document.body.removeChild(ta);
}

/** Save a string as a file. Nothing is uploaded; the blob never leaves. */
function downloadText(filename, text, mime) {
    try {
        const blob = new Blob([text], { type: (mime || 'text/plain') + ';charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        showToast(tv('ui.saved', { name: filename }));
    } catch (e) {
        showToast(t('ui.savefail'));
    }
}

/** The footer year and the back-to-top button, on both pages. */
function setupPageFurniture() {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const toTop = document.getElementById('toTop');
    if (!toTop) return;
    const onScroll = () => {
        toTop.hidden = false;
        toTop.classList.toggle('show', window.scrollY > 500);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    onScroll();
}

/**
 * The drifting stars behind everything.
 *
 * `density` is one star per this many square pixels — the console page uses a
 * sparser sky so the log stays readable. Honours prefers-reduced-motion by
 * painting one frame and stopping, rather than by showing nothing.
 */
function startStarfield(density, cap) {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = canvas.getContext('2d');
    const per = density || 9000;
    const max = cap || 160;
    const palette = ['#ffffff', '#c99bff', '#7fe6f7', '#ffd77a', '#ff9ecb'];
    let stars = [], w, h, dpr, rafId;

    const resize = () => {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = canvas.width = Math.floor(innerWidth * dpr);
        h = canvas.height = Math.floor(innerHeight * dpr);
        canvas.style.width = innerWidth + 'px';
        canvas.style.height = innerHeight + 'px';
        const count = Math.min(max, Math.floor((innerWidth * innerHeight) / per));
        stars = Array.from({ length: count }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            r: (Math.random() * 1.4 + 0.3) * dpr,
            a: Math.random(),
            tw: Math.random() * 0.02 + 0.004,
            dir: Math.random() > 0.5 ? 1 : -1,
            c: palette[(Math.random() * palette.length) | 0],
        }));
    };

    const draw = () => {
        ctx.clearRect(0, 0, w, h);
        for (const s of stars) {
            s.a += s.tw * s.dir;
            if (s.a <= 0.1 || s.a >= 1) s.dir *= -1;
            ctx.globalAlpha = Math.max(0.1, Math.min(1, s.a));
            ctx.fillStyle = s.c;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        if (!still) rafId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', () => {
        cancelAnimationFrame(rafId);
        resize();
        draw();
    });
}
