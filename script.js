/* ==========================================================================
   rami.party — enchantments
   Starfield, portal-card rendering, cursor glow, mobile nav, scroll reveal.
   ========================================================================== */

'use strict';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- Realm cards --------------------------------------------------------- */
function renderRealms() {
    const grid = document.getElementById('realmGrid');
    const realms = window.RAMI_REALMS;
    if (!grid || !Array.isArray(realms) || !realms.length) return;

    grid.innerHTML = '';
    realms.forEach(r => {
        const soon = r.status === 'soon';
        const li = document.createElement('li');
        li.className = `realm-card aura-${r.aura || 'violet'}${soon ? ' is-soon' : ''} reveal`;

        const tags = (r.tags || []).map(t => `<span>${t}</span>`).join('');
        const titleInner = soon
            ? `${r.title}`
            : `<a href="${r.href}">${r.title}</a>`;
        const enter = soon
            ? `<span class="realm-enter">🔒 Coming soon</span>`
            : `<span class="realm-enter">Enter <span class="arrow" aria-hidden="true">→</span></span>`;

        li.innerHTML = `
            <div class="realm-glyph" aria-hidden="true">${r.glyph || '✨'}</div>
            <p class="realm-tagline">${r.tagline || ''}</p>
            <h3>${titleInner}</h3>
            <p class="realm-desc">${r.description || ''}</p>
            <div class="realm-tags">${tags}</div>
            ${enter}
        `;
        grid.appendChild(li);
    });

    setupCardGlow();
    observeReveal();
}

/* Cursor-following glow on cards */
function setupCardGlow() {
    if (reduceMotion) return;
    document.querySelectorAll('.realm-card').forEach(card => {
        card.addEventListener('pointermove', e => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
            card.style.setProperty('--my', `${e.clientY - rect.top}px`);
        });
    });
}

/* ---- Starfield ----------------------------------------------------------- */
function startStarfield() {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let stars = [];
    let w, h, dpr;

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = canvas.width = Math.floor(innerWidth * dpr);
        h = canvas.height = Math.floor(innerHeight * dpr);
        canvas.style.width = innerWidth + 'px';
        canvas.style.height = innerHeight + 'px';
        const count = Math.min(160, Math.floor((innerWidth * innerHeight) / 9000));
        const palette = ['#ffffff', '#c99bff', '#7fe6f7', '#ffd77a', '#ff9ecb'];
        stars = Array.from({ length: count }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            r: (Math.random() * 1.4 + 0.3) * dpr,
            a: Math.random(),
            tw: Math.random() * 0.02 + 0.004,
            dir: Math.random() > 0.5 ? 1 : -1,
            c: palette[(Math.random() * palette.length) | 0],
        }));
    }

    function draw() {
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
        rafId = requestAnimationFrame(draw);
    }

    let rafId;
    resize();
    window.addEventListener('resize', () => { cancelAnimationFrame(rafId); resize(); if (!reduceMotion) draw(); });

    if (reduceMotion) {
        // Draw a single static frame.
        for (const s of stars) {
            ctx.globalAlpha = s.a;
            ctx.fillStyle = s.c;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    } else {
        draw();
    }
}

/* ---- Mobile navigation --------------------------------------------------- */
function setupMobileNav() {
    const burger = document.getElementById('burger');
    if (!burger) return;

    const overlay = document.createElement('nav');
    overlay.className = 'mobile-nav';
    overlay.id = 'mobileNav';
    overlay.setAttribute('aria-label', 'Mobile');
    overlay.innerHTML = `
        <button class="close-btn" aria-label="Close menu">&times;</button>
        <a href="#realms">Realms</a>
        <a href="./fun/lore/">Lore</a>
        <a href="./fun/prankscreens/">Prank Screens</a>
        <a href="./neko/">Neko</a>
        <a href="./archive/">The Vault</a>
    `;
    document.body.appendChild(overlay);
    const closeBtn = overlay.querySelector('.close-btn');

    const open = () => {
        overlay.classList.add('open');
        burger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        closeBtn.focus();
    };
    const close = () => {
        overlay.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        burger.focus();
    };

    burger.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    overlay.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('open')) close(); });
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
}

/* ---- Scroll reveal ------------------------------------------------------- */
let revealObserver;
function observeReveal() {
    const items = document.querySelectorAll('.reveal:not(.visible)');
    if (!items.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
        items.forEach(el => el.classList.add('visible'));
        return;
    }
    if (!revealObserver) {
        revealObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    }
    items.forEach((el, i) => {
        el.style.transitionDelay = `${Math.min(i * 60, 300)}ms`;
        revealObserver.observe(el);
    });
}

/* ---- Init ---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    renderRealms();
    startStarfield();
    setupMobileNav();
    observeReveal();
});
