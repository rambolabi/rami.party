/* ==========================================================================
   rami.party — enchantments
   Starfield, portal-card rendering, cursor glow, mobile nav, scroll reveal.
   ========================================================================== */

'use strict';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- Realm cards --------------------------------------------------------- */
function cardMarkup(r) {
    const soon = r.status === 'soon';
    const tags = (r.tags || []).map(t => `<span>${t}</span>`).join('');
    const ext = r.external ? ' target="_blank" rel="noopener noreferrer"' : '';
    const titleInner = soon ? r.title : `<a href="${r.href}"${ext}>${r.title}</a>`;
    const enter = soon
        ? `<span class="realm-enter">🔒 ${r.tagline === 'Never drew breath' ? 'Nothing to see' : 'Coming soon'}</span>`
        : `<span class="realm-enter">${r.external ? 'Visit' : 'Enter'} <span class="arrow" aria-hidden="true">→</span></span>`;

    return `
        <li class="realm-card aura-${r.aura || 'violet'}${soon ? ' is-soon' : ''}${r.external ? ' is-external' : ''} reveal">
            <div class="realm-glyph" aria-hidden="true">${r.glyph || '✨'}</div>
            <p class="realm-tagline">${r.tagline || ''}</p>
            <h3>${titleInner}</h3>
            <p class="realm-desc">${r.description || ''}</p>
            <div class="realm-tags">${tags}</div>
            ${enter}
        </li>`;
}
window.cardMarkup = cardMarkup;

function renderRealms() {
    const root = document.getElementById('realmGroups');
    const realms = window.RAMI_REALMS;
    const groups = window.RAMI_GROUPS;
    if (!root || !Array.isArray(realms) || !Array.isArray(groups)) return;

    root.innerHTML = '';
    groups.forEach(g => {
        const items = realms.filter(r => r.category === g.id);
        if (!items.length) return;
        const section = document.createElement('section');
        section.className = 'realm-group';
        section.innerHTML = `
            <header class="group-head">
                <span class="group-emoji" aria-hidden="true">${g.emoji}</span>
                <h3>${g.title}</h3>
                <p>${g.blurb}</p>
            </header>
            <ul class="realm-grid" role="list">
                ${items.map(cardMarkup).join('')}
            </ul>`;
        root.appendChild(section);
    });

    setupCardGlow();
    observeReveal();
}

/* Cursor-following glow on cards */
function setupCardGlow(root) {
    if (reduceMotion) return;
    (root || document).querySelectorAll('.realm-card').forEach(card => {
        if (card.dataset.glow) return;
        card.dataset.glow = '1';
        card.addEventListener('pointermove', e => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
            card.style.setProperty('--my', `${e.clientY - rect.top}px`);
        });
    });
}

/* ---- Project search ------------------------------------------------------ */
const STATUS_META = {
    finished: { label: 'Finished', cls: 'st-finished', icon: '✅' },
    wip: { label: 'WIP', cls: 'st-wip', icon: '🚧' },
    archived: { label: 'Archived', cls: 'st-archived', icon: '☄️' },
    planned: { label: 'Planned', cls: 'st-planned', icon: '🕓' },
};

function resolveWorkshopHref(href, external) {
    if (!href) return null;
    if (external || /^https?:/.test(href) || href.startsWith('//') || href === '#') return href;
    return './workshop/' + href.replace(/^\.\//, '');
}

function buildSearchIndex() {
    const entries = [];
    const seen = new Set();
    const push = (item, statusKey, url, external) => {
        if (!item || !item.title) return;
        if (item.title === 'Enter the Workshop') return;      // a portal, not a project
        const key = item.title.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        const meta = STATUS_META[statusKey] || STATUS_META.wip;
        const tags = (item.tags || []).join(' ');
        const haystack = [item.title, item.tagline, item.description, item.search, tags, meta.label, statusKey]
            .filter(Boolean).join(' ').toLowerCase();
        entries.push({ item, meta, url, external: !!external, haystack });
    };

    (window.RAMI_REALMS || []).forEach(r => {
        let statusKey = r.category === 'gallery' ? 'finished'
            : r.category === 'wastes' ? 'archived' : 'wip';
        if (r.status === 'soon' && r.category !== 'wastes') statusKey = 'planned';
        push(r, statusKey, r.href, r.external);
    });
    (window.RAMI_WORKSHOP || []).forEach(w => {
        const statusKey = w.status === 'soon' ? 'planned' : 'wip';
        push(w, statusKey, resolveWorkshopHref(w.href, w.external), w.external);
    });
    (window.RAMI_PLANNED || []).forEach(p => {
        push({ title: p.name, tagline: 'Not yet begun', description: p.note, search: p.note, tags: ['planned'] },
            'planned', null, false);
    });
    return entries;
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function resultCardMarkup(e) {
    const it = e.item;
    const soon = !e.url || e.url === '#';
    const ext = e.external ? ' target="_blank" rel="noopener noreferrer"' : '';
    const title = soon ? escapeHtml(it.title) : `<a href="${e.url}"${ext}>${escapeHtml(it.title)}</a>`;
    const tags = (it.tags || []).map(t => `<span>${escapeHtml(t)}</span>`).join('');
    const enter = soon
        ? `<span class="realm-enter">🔒 Nothing to visit</span>`
        : `<span class="realm-enter">${e.external ? 'Visit' : 'Enter'} <span class="arrow" aria-hidden="true">→</span></span>`;
    return `
        <li class="realm-card aura-${it.aura || 'violet'}${soon ? ' is-soon' : ''}${e.external ? ' is-external' : ''} visible">
            <span class="status-badge ${e.meta.cls}">${e.meta.icon} ${e.meta.label}</span>
            <div class="realm-glyph" aria-hidden="true">${it.glyph || '✨'}</div>
            <p class="realm-tagline">${escapeHtml(it.tagline || '')}</p>
            <h3>${title}</h3>
            <p class="realm-desc">${escapeHtml(it.description || '')}</p>
            <div class="realm-tags">${tags}</div>
            ${enter}
        </li>`;
}

let SEARCH_INDEX = null;
function setupSearch() {
    const input = document.getElementById('realmSearch');
    const results = document.getElementById('realmResults');
    const groups = document.getElementById('realmGroups');
    const clearBtn = document.getElementById('realmSearchClear');
    if (!input || !results || !groups) return;
    SEARCH_INDEX = buildSearchIndex();

    const run = () => {
        const raw = input.value.trim();
        const q = raw.toLowerCase();
        if (clearBtn) clearBtn.hidden = !raw;
        if (!q) {
            results.hidden = true;
            results.innerHTML = '';
            groups.hidden = false;
            return;
        }
        const tokens = q.split(/\s+/);
        const matches = SEARCH_INDEX.filter(e => tokens.every(t => e.haystack.includes(t)));
        groups.hidden = true;
        results.hidden = false;
        if (!matches.length) {
            results.innerHTML =
                `<p class="search-empty">No realms match “${escapeHtml(raw)}”. Try another incantation.</p>`;
            return;
        }
        results.innerHTML =
            `<p class="search-count">${matches.length} realm${matches.length === 1 ? '' : 's'} found</p>
             <ul class="realm-grid" role="list">${matches.map(resultCardMarkup).join('')}</ul>`;
        setupCardGlow(results);
    };

    input.addEventListener('input', run);
    input.addEventListener('keydown', e => { if (e.key === 'Escape') { input.value = ''; run(); } });
    if (clearBtn) clearBtn.addEventListener('click', () => { input.value = ''; run(); input.focus(); });
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
        <a href="./gallery/lore/">Lore</a>
        <a href="./gallery/prankscreens/">Prank Screens</a>
        <a href="./wasteland/">The Wastelands</a>
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
window.__ramiReveal = observeReveal;
window.__ramiGlow = setupCardGlow;

/* ---- Init ---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    renderRealms();
    startStarfield();
    setupMobileNav();
    setupSearch();
    observeReveal();
});
