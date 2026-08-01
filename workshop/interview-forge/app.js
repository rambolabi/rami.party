/* ==========================================================================
   Interview Forge — application logic (vanilla JS, no dependencies).
   Everything is kept in localStorage; nothing ever leaves the browser.
   ========================================================================== */
(function () {
    'use strict';

    /* ---- Constants ------------------------------------------------------ */
    var LS = { lang: 'if.lang', theme: 'if.theme', sessions: 'if.sessions', current: 'if.current' };

    var THEMES = [
        { id: 'midnight', label: 'Midnight', colour: '#0b1020' },
        { id: 'slate', label: 'Slate', colour: '#14181d' },
        { id: 'daylight', label: 'Daylight', colour: '#f4f6fa' },
        { id: 'parchment', label: 'Parchment', colour: '#f6f1e6' },
        { id: 'forest', label: 'Forest', colour: '#0d1714' },
        { id: 'contrast', label: 'High contrast', colour: '#000000' }
    ];

    var LEVELS = ['junior', 'medior', 'senior'];
    var MAX_FILE_BYTES = 1500000; /* larger files are kept for this session only */

    var POSITION_GROUPS = {
        support: { en: 'Support & workplace', nl: 'Support & werkplek', fr: 'Support & poste de travail' },
        infra: { en: 'Infrastructure & network', nl: 'Infrastructuur & netwerk', fr: 'Infrastructure & réseau' },
        security: { en: 'Security', nl: 'Security', fr: 'Sécurité' },
        dev: { en: 'Development & data', nl: 'Development & data', fr: 'Développement & données' },
        business: { en: 'Business & delivery', nl: 'Business & delivery', fr: 'Business & delivery' }
    };

    /* ---- State ---------------------------------------------------------- */
    var state = {
        lang: 'en',
        theme: 'midnight',
        route: 'home',
        step: 1,
        session: null,
        sessions: [],
        tab: 'brief',
        split: false,
        reportScope: 'answered',
        reportAnswers: false,
        compare: [],
        lib: { q: '', cat: '', role: '', level: '' }
    };

    var QMAP = {};
    var view = document.getElementById('view');

    /* ---- Tiny helpers --------------------------------------------------- */
    function esc(s) {
        return String(s === undefined || s === null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function t(key, vars) {
        var pack = window.IF_I18N[state.lang] || window.IF_I18N.en;
        var s = pack[key];
        if (s === undefined) { s = window.IF_I18N.en[key]; }
        if (s === undefined) { return key; }
        if (vars) {
            Object.keys(vars).forEach(function (k) {
                s = s.split('{' + k + '}').join(String(vars[k]));
            });
        }
        return s;
    }

    /* Localised value out of an {en,nl,fr} object. */
    function L(obj) {
        if (!obj) { return ''; }
        return obj[state.lang] || obj.en || '';
    }

    function byId(list, id) {
        for (var i = 0; i < list.length; i++) { if (list[i].id === id) { return list[i]; } }
        return null;
    }

    function uid(prefix) {
        return (prefix || 'x') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
    }

    function todayISO() {
        var d = new Date();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    var toastTimer = null;
    function toast(msg) {
        var el = document.getElementById('toast');
        el.textContent = msg;
        el.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2200);
    }

    function b64encode(str) {
        var bytes = new TextEncoder().encode(str);
        var bin = '';
        bytes.forEach(function (b) { bin += String.fromCharCode(b); });
        return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    function b64decode(str) {
        var s = str.replace(/-/g, '+').replace(/_/g, '/');
        while (s.length % 4) { s += '='; }
        var bin = atob(s);
        var bytes = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) { bytes[i] = bin.charCodeAt(i); }
        return new TextDecoder().decode(bytes);
    }

    /* ---- Storage -------------------------------------------------------- */
    function load() {
        try {
            state.lang = localStorage.getItem(LS.lang) || guessLang();
            state.theme = localStorage.getItem(LS.theme) || 'midnight';
            state.sessions = JSON.parse(localStorage.getItem(LS.sessions) || '[]');
            var cur = localStorage.getItem(LS.current);
            if (cur) { state.session = byId(state.sessions, cur); }
        } catch (e) {
            state.sessions = [];
        }
        if (!window.IF_I18N[state.lang]) { state.lang = 'en'; }
    }

    function guessLang() {
        var n = (navigator.language || 'en').slice(0, 2).toLowerCase();
        return window.IF_I18N[n] ? n : 'en';
    }

    var saveTimer = null;
    function save(now) {
        clearTimeout(saveTimer);
        var run = function () {
            try {
                localStorage.setItem(LS.sessions, JSON.stringify(state.sessions.map(persistable)));
                localStorage.setItem(LS.lang, state.lang);
                localStorage.setItem(LS.theme, state.theme);
                if (state.session) { localStorage.setItem(LS.current, state.session.id); }
            } catch (e) {
                toast('⚠ ' + e.name);
            }
        };
        if (now) { run(); } else { saveTimer = setTimeout(run, 400); }
    }

    /* Files above the size limit are not written to localStorage. */
    function persistable(session) {
        var copy = JSON.parse(JSON.stringify(session, function (k, v) {
            return v;
        }));
        copy.files = (session.files || []).map(function (f) {
            return f.data && f.size <= MAX_FILE_BYTES ? f : { name: f.name, type: f.type, size: f.size };
        });
        return copy;
    }

    /* ---- Question index -------------------------------------------------- */
    function buildIndex() {
        QMAP = {};
        (window.IF_QUESTIONS || []).forEach(function (q) { QMAP[q.id] = q; });
    }

    function question(id) {
        if (QMAP[id]) { return QMAP[id]; }
        if (state.session) {
            var c = byId(state.session.customQs || [], id);
            if (c) { return c; }
        }
        return null;
    }

    function allQuestions() {
        var list = (window.IF_QUESTIONS || []).slice();
        if (state.session && state.session.customQs) { list = state.session.customQs.concat(list); }
        return list;
    }

    function questionsForRoles(roles) {
        if (!roles || !roles.length) { return []; }
        return (window.IF_QUESTIONS || []).filter(function (q) {
            return (q.roles || []).some(function (r) { return roles.indexOf(r) !== -1; });
        });
    }

    /* Spread a capped selection evenly over the chosen roles. */
    function recommend(roles, max) {
        var picked = [];
        var seen = {};
        var pools = roles.map(function (r) {
            return questionsForRoles([r]).sort(function (a, b) {
                return LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level);
            });
        });
        var idx = 0;
        while (picked.length < max) {
            var added = false;
            for (var p = 0; p < pools.length; p++) {
                var q = pools[p][idx];
                if (q && !seen[q.id]) {
                    seen[q.id] = true;
                    picked.push(q.id);
                    added = true;
                    if (picked.length >= max) { break; }
                }
            }
            if (!added) { break; }
            idx++;
        }
        return picked;
    }

    /* ---- Session model --------------------------------------------------- */
    function newSession() {
        return {
            id: uid('iv'),
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            candidate: {
                name: '', position: '', date: todayISO(), interviewer: '', source: '',
                email: '', phone: '', experience: '', availability: '', salary: '', background: ''
            },
            positionId: '',
            roles: [],
            qids: [],
            customQs: [],
            responses: {},
            disc: {},
            files: [],
            notes: '',
            summary: { strengths: '', concerns: '', verdict: '' }
        };
    }

    function touch() {
        if (state.session) { state.session.updated = new Date().toISOString(); }
        save();
    }

    function useSession(session) {
        if (!byId(state.sessions, session.id)) { state.sessions.unshift(session); }
        state.session = session;
        save(true);
    }

    function response(qid) {
        var r = state.session.responses[qid];
        if (!r) { r = state.session.responses[qid] = { note: '', rating: 0, asked: false }; }
        return r;
    }

    function isAnswered(qid) {
        var r = state.session.responses[qid];
        return !!(r && (r.note.trim() || r.rating || r.asked));
    }

    /* ---- Routing --------------------------------------------------------- */
    function go(route, opts) {
        state.route = route;
        if (opts && opts.step) { state.step = opts.step; }
        location.hash = '#/' + route;
        render();
    }

    function readHash() {
        var h = location.hash || '';
        if (h.indexOf('#tpl=') === 0) {
            applyTemplateLink(h.slice(5));
            return;
        }
        var m = h.match(/^#\/(home|setup|workspace|compare)/);
        state.route = m ? m[1] : 'home';
        if (state.route === 'workspace' && !state.session) { state.route = 'home'; }
    }

    function applyTemplateLink(payload) {
        try {
            var data = JSON.parse(b64decode(payload));
            var s = newSession();
            s.roles = Array.isArray(data.roles) ? data.roles : [];
            s.positionId = data.positionId || '';
            s.qids = (Array.isArray(data.qids) ? data.qids : []).filter(function (id) { return !!QMAP[id]; });
            if (data.customQs) {
                s.customQs = data.customQs.filter(function (c) { return c && c.q; }).map(function (c) {
                    var id = uid('own');
                    s.qids.push(id);
                    return { id: id, custom: true, cat: 'behaviour', roles: [], level: 'medior', q: c.q, a: c.a || null };
                });
            }
            useSession(s);
            state.route = 'setup';
            state.step = 1;
            toast(t('msg.templateLoaded'));
        } catch (e) {
            state.route = 'home';
        }
        history.replaceState(null, '', location.pathname + location.search + '#/setup');
    }

    /* ==========================================================================
       Rendering
       ========================================================================== */
    function render() {
        document.documentElement.setAttribute('lang', state.lang);
        document.documentElement.setAttribute('data-theme', state.theme);
        var themeMeta = document.getElementById('meta-theme');
        var th = byId(THEMES, state.theme);
        if (themeMeta && th) { themeMeta.setAttribute('content', th.colour); }

        /* static labels */
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            el.textContent = t(el.getAttribute('data-i18n'));
        });

        document.querySelectorAll('.topnav .btn').forEach(function (b) {
            var r = b.getAttribute('data-route');
            if (r === state.route) { b.setAttribute('aria-current', 'page'); } else { b.removeAttribute('aria-current'); }
            if (r === 'workspace') { b.disabled = !state.session; }
        });

        if (state.route === 'setup') { renderSetup(); }
        else if (state.route === 'workspace') { renderWorkspace(); }
        else if (state.route === 'compare') { renderCompare(); }
        else { renderHome(); }

        renderLibrary();
    }

    /* ---- Home ------------------------------------------------------------ */
    function renderHome() {
        var rows = state.sessions.map(function (s) {
            return '<div class="session-row">' +
                '<strong>' + esc(s.candidate.name || '—') + '</strong>' +
                '<span class="muted">' + esc(s.candidate.position || '') + '</span>' +
                '<span class="faint">' + esc(s.candidate.date || s.created.slice(0, 10)) + '</span>' +
                '<span class="faint">' + esc(s.qids.length) + ' × ?</span>' +
                '<span class="spacer" style="flex:1"></span>' +
                '<button class="btn btn-sm" data-action="open-session" data-id="' + esc(s.id) + '">' + esc(t('home.open')) + '</button>' +
                '<button class="btn btn-sm" data-action="dup-session" data-id="' + esc(s.id) + '">' + esc(t('home.duplicate')) + '</button>' +
                '<button class="btn btn-sm btn-danger" data-action="del-session" data-id="' + esc(s.id) + '">' + esc(t('home.delete')) + '</button>' +
                '</div>';
        }).join('');

        view.innerHTML =
            '<section class="hero">' +
            '<h1>' + esc(t('home.title')) + '</h1>' +
            '<p>' + esc(t('home.lead')) + '</p>' +
            '<p class="faint">' + esc(t('home.stats', {
                q: (window.IF_QUESTIONS || []).length,
                p: window.IF_POSITIONS.length,
                r: window.IF_ROLES.length
            })) + ' · ' + esc(t('app.privacy')) + '</p>' +
            '</section>' +

            '<div class="choice-grid">' +
            '<button class="choice" data-action="quick-start">' +
            '<span class="glyph" aria-hidden="true">⚡</span>' +
            '<h3>' + esc(t('home.quick')) + '</h3><p>' + esc(t('home.quickDesc')) + '</p></button>' +
            '<button class="choice" data-action="guided">' +
            '<span class="glyph" aria-hidden="true">🧭</span>' +
            '<h3>' + esc(t('home.guide')) + '</h3><p>' + esc(t('home.guideDesc')) + '</p></button>' +
            '</div>' +

            '<section class="card" style="margin-top:1.4rem">' +
            '<h2>' + esc(t('home.saved')) + '</h2>' +
            (rows ? '<div class="session-list">' + rows + '</div>' : '<p class="muted">' + esc(t('home.savedEmpty')) + '</p>') +
            '<p style="margin-top:1rem">' +
            '<label class="btn btn-sm" for="import-file">' + esc(t('home.import')) + '</label>' +
            '<input type="file" id="import-file" accept="application/json,.json" class="sr-only">' +
            '</p>' +
            '</section>';
    }

    /* ---- Setup wizard ----------------------------------------------------- */
    function renderSetup() {
        if (!state.session) { useSession(newSession()); }
        var s = state.session;
        var total = 5;
        var labels = ['wiz.s1', 'wiz.s2', 'wiz.s3', 'wiz.s4', 'wiz.s5'];

        var pills = labels.map(function (k, i) {
            var n = i + 1;
            var cls = n === state.step ? 'step-pill active' : (n < state.step ? 'step-pill done' : 'step-pill');
            return '<button class="' + cls + '" data-action="goto-step" data-step="' + n + '">' +
                '<span class="n">' + n + '</span>' + esc(t(k)) + '</button>';
        }).join('');

        var body = '';
        if (state.step === 1) { body = stepCandidate(s); }
        else if (state.step === 2) { body = stepPosition(s); }
        else if (state.step === 3) { body = stepRoles(s); }
        else if (state.step === 4) { body = stepQuestions(s); }
        else { body = stepReview(s); }

        var actions =
            '<div class="wizard-actions">' +
            (state.step > 1 ? '<button class="btn" data-action="step-back">← ' + esc(t('btn.back')) + '</button>' : '') +
            (state.step < total
                ? '<button class="btn btn-primary" data-action="step-next">' + esc(t('btn.next')) + ' →</button>'
                : '<button class="btn btn-primary" data-action="start-interview">' + esc(t('wiz.start')) + ' →</button>') +
            '<span class="spacer" style="flex:1"></span>' +
            '<button class="btn btn-sm" data-action="share-template">' + esc(t('btn.share')) + '</button>' +
            '</div>';

        view.innerHTML =
            '<p class="faint">' + esc(t('wiz.step', { n: state.step, total: total })) + '</p>' +
            '<div class="steps">' + pills + '</div>' +
            '<section class="card">' + body + '</section>' + actions;
    }

    function textField(key, path, value, type) {
        return '<label class="field"><span>' + esc(t(key)) + '</span>' +
            '<input type="' + (type || 'text') + '" data-field="' + esc(path) + '" value="' + esc(value || '') + '"></label>';
    }

    function stepCandidate(s) {
        var c = s.candidate;
        var files = (s.files || []).map(function (f, i) {
            return '<div class="file-row">' +
                '<span aria-hidden="true">📎</span>' +
                '<span class="name">' + esc(f.name) + '</span>' +
                '<span class="faint">' + Math.round((f.size || 0) / 1024) + ' kB</span>' +
                (f.data ? '<button class="btn btn-sm" data-action="open-file" data-index="' + i + '">' + esc(t('home.open')) + '</button>' : '') +
                '<button class="btn btn-sm btn-danger" data-action="del-file" data-index="' + i + '">' + esc(t('btn.remove')) + '</button>' +
                '</div>';
        }).join('');

        return '<h2>' + esc(t('wiz.s1')) + '</h2><p class="muted">' + esc(t('wiz.s1.help')) + '</p>' +
            '<div class="grid-2">' +
            textField('field.name', 'candidate.name', c.name) +
            textField('field.position', 'candidate.position', c.position) +
            textField('field.date', 'candidate.date', c.date, 'date') +
            textField('field.interviewer', 'candidate.interviewer', c.interviewer) +
            textField('field.source', 'candidate.source', c.source) +
            textField('field.email', 'candidate.email', c.email, 'email') +
            textField('field.phone', 'candidate.phone', c.phone, 'tel') +
            textField('field.experience', 'candidate.experience', c.experience) +
            textField('field.availability', 'candidate.availability', c.availability) +
            textField('field.salary', 'candidate.salary', c.salary) +
            '</div>' +
            '<label class="field"><span>' + esc(t('field.background')) + '</span>' +
            '<textarea data-field="candidate.background">' + esc(c.background) + '</textarea></label>' +
            '<label class="field"><span>' + esc(t('field.cv')) + '</span>' +
            '<input type="file" id="cv-file" multiple accept=".pdf,.png,.jpg,.jpeg,.txt,.md,.doc,.docx">' +
            '<small class="faint">' + esc(t('field.cvHint')) + '</small></label>' +
            '<div class="file-list">' + files + '</div>';
    }

    function stepPosition(s) {
        var tpls = window.IF_TEMPLATES.map(function (tpl) {
            return '<button class="pick" data-action="pick-template" data-id="' + esc(tpl.id) + '">' +
                '<span class="glyph" aria-hidden="true">' + tpl.glyph + '</span>' +
                '<span class="label">' + esc(L(tpl.name)) + '<span class="sub">' + esc(L(tpl.note)) + '</span></span></button>';
        }).join('');

        var groups = Object.keys(POSITION_GROUPS).map(function (g) {
            var items = window.IF_POSITIONS.filter(function (p) { return p.group === g; }).map(function (p) {
                var on = s.positionId === p.id;
                return '<button class="pick' + (on ? ' selected' : '') + '" aria-pressed="' + on + '" ' +
                    'data-action="pick-position" data-id="' + esc(p.id) + '">' +
                    '<span class="glyph" aria-hidden="true">' + p.glyph + '</span>' +
                    '<span class="label">' + esc(L(p.name)) +
                    '<span class="sub">' + p.roles.length + ' ' + esc(t('wiz.roles').toLowerCase()) + '</span></span></button>';
            }).join('');
            return '<h3 class="group-title">' + esc(L(POSITION_GROUPS[g])) + '</h3><div class="pick-grid">' + items + '</div>';
        }).join('');

        return '<h2>' + esc(t('wiz.s2')) + '</h2><p class="muted">' + esc(t('wiz.s2.help')) + '</p>' +
            '<h3 class="group-title">' + esc(t('wiz.templates')) + '</h3>' +
            '<div class="pick-grid">' + tpls + '</div>' +
            '<h3 class="group-title">' + esc(t('wiz.positions')) + '</h3>' + groups;
    }

    function stepRoles(s) {
        var chips = window.IF_ROLES.map(function (r) {
            var on = s.roles.indexOf(r.id) !== -1;
            var n = questionsForRoles([r.id]).length;
            return '<button class="chip" aria-pressed="' + on + '" data-action="toggle-role" data-id="' + esc(r.id) + '">' +
                esc(L(r.name)) + ' <span class="faint">' + n + '</span></button>';
        }).join('');

        return '<h2>' + esc(t('wiz.s3')) + '</h2><p class="muted">' + esc(t('wiz.s3.help')) + '</p>' +
            '<p class="faint">' + esc(t('wiz.selected', { n: s.roles.length })) + ' · ' +
            esc(t('lib.results', { n: questionsForRoles(s.roles).length })) + '</p>' +
            '<div class="chip-wrap">' + chips + '</div>' +
            '<div class="wizard-actions">' +
            '<button class="btn btn-sm" data-action="roles-clear">' + esc(t('btn.clearAll')) + '</button>' +
            '<button class="btn btn-sm" data-action="auto-select">' + esc(t('wiz.autoSelect')) + '</button>' +
            '</div>';
    }

    function stepQuestions(s) {
        var pool = questionsForRoles(s.roles);
        /* keep already-selected questions visible even if their role was dropped */
        s.qids.forEach(function (id) {
            var q = question(id);
            if (q && pool.indexOf(q) === -1) { pool.push(q); }
        });

        var byCat = {};
        pool.forEach(function (q) { (byCat[q.cat] = byCat[q.cat] || []).push(q); });

        var groups = window.IF_CATEGORIES.filter(function (c) { return byCat[c.id]; }).map(function (c) {
            var items = byCat[c.id].map(function (q) {
                var on = s.qids.indexOf(q.id) !== -1;
                return '<button class="pick' + (on ? ' selected' : '') + '" aria-pressed="' + on + '" ' +
                    'data-action="toggle-question" data-id="' + esc(q.id) + '">' +
                    '<span class="glyph" aria-hidden="true">' + (on ? '✓' : '＋') + '</span>' +
                    '<span class="label">' + esc(L(q.q)) +
                    '<span class="sub">' + esc(t('level.' + q.level)) + '</span></span></button>';
            }).join('');
            return '<h3 class="group-title">' + c.glyph + ' ' + esc(L(c.name)) + ' <span class="faint">(' + byCat[c.id].length + ')</span></h3>' +
                '<div class="pick-grid">' + items + '</div>';
        }).join('');

        var customs = (s.customQs || []).map(function (q) {
            return '<div class="session-row"><span>' + esc(L(q.q)) + '</span>' +
                '<span class="spacer" style="flex:1"></span>' +
                '<button class="btn btn-sm btn-danger" data-action="del-custom" data-id="' + esc(q.id) + '">' + esc(t('btn.remove')) + '</button></div>';
        }).join('');

        return '<h2>' + esc(t('wiz.s4')) + '</h2><p class="muted">' + esc(t('wiz.s4.help')) + '</p>' +
            '<p class="faint">' + esc(t('wiz.selected', { n: s.qids.length })) + '</p>' +
            '<div class="wizard-actions" style="margin-top:0">' +
            '<button class="btn btn-sm" data-action="auto-select">' + esc(t('wiz.autoSelect')) + '</button>' +
            '<button class="btn btn-sm" data-action="questions-clear">' + esc(t('btn.clearAll')) + '</button>' +
            '<button class="btn btn-sm" data-action="open-library">' + esc(t('nav.library')) + '</button>' +
            '</div>' +
            (groups || '<p class="muted">' + esc(t('lib.none')) + '</p>') +
            '<h3 class="group-title">' + esc(t('wiz.customQ')) + '</h3>' +
            '<div class="session-list">' + customs + '</div>' +
            '<div class="wizard-actions" style="margin-top:.6rem">' +
            '<input type="text" id="custom-q" placeholder="' + esc(t('wiz.customQPlaceholder')) + '" style="flex:1 1 260px">' +
            '<button class="btn" data-action="add-custom">' + esc(t('btn.add')) + '</button>' +
            '</div>';
    }

    function stepReview(s) {
        var roleNames = s.roles.map(function (id) {
            var r = byId(window.IF_ROLES, id);
            return r ? '<span class="chip static">' + esc(L(r.name)) + '</span>' : '';
        }).join('');

        return '<h2>' + esc(t('wiz.s5')) + '</h2><p class="muted">' + esc(t('wiz.s5.help')) + '</p>' +
            '<p><strong>' + esc(t('wiz.review.candidate')) + ':</strong> ' + esc(s.candidate.name || '—') +
            (s.candidate.position ? ' — ' + esc(s.candidate.position) : '') + '</p>' +
            '<p><strong>' + esc(t('wiz.review.questions')) + ':</strong> ' + s.qids.length + '</p>' +
            '<p><strong>' + esc(t('wiz.review.subjects')) + ':</strong></p><div class="chip-wrap">' + roleNames + '</div>' +
            '<div class="wizard-actions"><button class="btn btn-sm" data-action="save-template">' + esc(t('btn.saveTemplate')) + '</button></div>';
    }

    /* ---- Workspace -------------------------------------------------------- */
    function renderWorkspace() {
        var s = state.session;
        if (!s) { state.route = 'home'; return renderHome(); }

        var tabs = [
            ['brief', 'ws.tab.brief'], ['questions', 'ws.tab.questions'], ['notes', 'ws.tab.notes'],
            ['disc', 'ws.tab.disc'], ['result', 'ws.tab.result']
        ].map(function (pair) {
            return '<button class="tab" role="tab" aria-selected="' + (state.tab === pair[0]) + '" ' +
                'data-action="tab" data-tab="' + pair[0] + '">' + esc(t(pair[1])) + '</button>';
        }).join('');

        var done = s.qids.filter(isAnswered).length;
        var pct = s.qids.length ? Math.round(done / s.qids.length * 100) : 0;

        var body = '';
        if (state.tab === 'brief') { body = tabBrief(s); }
        else if (state.tab === 'questions') { body = tabQuestions(s); }
        else if (state.tab === 'notes') { body = tabNotes(s); }
        else if (state.tab === 'disc') { body = tabDisc(s); }
        else { body = tabResult(s); }

        view.innerHTML =
            '<div class="ws-head">' +
            '<div><div class="who">' + esc(s.candidate.name || '—') + '</div>' +
            '<div class="role">' + esc(s.candidate.position || '') + ' · ' + esc(s.candidate.date || '') + '</div></div>' +
            '<span class="spacer" style="flex:1"></span>' +
            '<span class="faint">' + esc(t('ws.progress', { done: done, total: s.qids.length })) + '</span>' +
            '<button class="btn btn-sm no-print" data-action="toggle-split" aria-pressed="' + state.split + '">' + esc(t('ws.split')) + '</button>' +
            '<button class="btn btn-sm no-print" data-action="open-library">☰ ' + esc(t('nav.library')) + '</button>' +
            '<button class="btn btn-sm btn-primary no-print" data-action="tab" data-tab="result">' + esc(t('btn.finish')) + '</button>' +
            '</div>' +
            '<div class="progress-bar"><span style="width:' + pct + '%"></span></div>' +
            '<div class="tabs no-print" role="tablist">' + tabs + '</div>' +
            body;
    }

    function tabBrief(s) {
        var c = s.candidate;
        var files = (s.files || []).map(function (f, i) {
            return '<div class="file-row"><span aria-hidden="true">📎</span><span class="name">' + esc(f.name) + '</span>' +
                (f.data ? '<button class="btn btn-sm" data-action="open-file" data-index="' + i + '">' + esc(t('home.open')) + '</button>' : '<span class="faint">—</span>') +
                '</div>';
        }).join('');

        return '<section class="card"><h2>' + esc(t('ws.tab.brief')) + '</h2>' +
            '<div class="grid-2">' +
            textField('field.name', 'candidate.name', c.name) +
            textField('field.position', 'candidate.position', c.position) +
            textField('field.date', 'candidate.date', c.date, 'date') +
            textField('field.interviewer', 'candidate.interviewer', c.interviewer) +
            textField('field.experience', 'candidate.experience', c.experience) +
            textField('field.availability', 'candidate.availability', c.availability) +
            textField('field.salary', 'candidate.salary', c.salary) +
            textField('field.source', 'candidate.source', c.source) +
            '</div>' +
            '<label class="field"><span>' + esc(t('field.background')) + '</span>' +
            '<textarea data-field="candidate.background">' + esc(c.background) + '</textarea></label>' +
            '<label class="field"><span>' + esc(t('field.cv')) + '</span>' +
            '<input type="file" id="cv-file" multiple accept=".pdf,.png,.jpg,.jpeg,.txt,.md,.doc,.docx"></label>' +
            '<div class="file-list">' + files + '</div>' +
            '</section>';
    }

    function questionCard(qid, opts) {
        var q = question(qid);
        if (!q) { return ''; }
        var r = state.session.responses[qid] || { note: '', rating: 0, asked: false };
        var cat = byId(window.IF_CATEGORIES, q.cat);
        var ratings = [1, 2, 3, 4, 5].map(function (n) {
            return '<button data-action="rate" data-id="' + esc(qid) + '" data-value="' + n + '" ' +
                'aria-pressed="' + (r.rating === n) + '" aria-label="' + n + '/5">' + n + '</button>';
        }).join('');

        var answer = q.a ? '<div class="answer hidden" data-answer="' + esc(qid) + '">' +
            '<strong>' + esc(t('ws.answer')) + '</strong>' + esc(L(q.a)) + '</div>' : '';

        return '<article class="q-card' + (isAnswered(qid) ? ' answered' : '') + '">' +
            '<div class="q-top"><div class="q-text">' + esc(L(q.q)) +
            '<div class="q-meta">' +
            (cat ? '<span class="tag">' + cat.glyph + ' ' + esc(L(cat.name)) + '</span>' : '') +
            (q.level ? '<span class="tag level">' + esc(t('level.' + q.level)) + '</span>' : '') +
            (q.disc ? '<span class="tag">DISC ' + esc(q.disc) + '</span>' : '') +
            '</div></div>' +
            (q.a ? '<button class="btn btn-sm no-print" data-action="toggle-answer" data-id="' + esc(qid) + '">' + esc(t('ws.showAnswer')) + '</button>' : '') +
            (opts && opts.removable ? '<button class="btn btn-sm btn-danger no-print" data-action="drop-question" data-id="' + esc(qid) + '">×</button>' : '') +
            '</div>' + answer +
            '<div class="q-note"><textarea data-note="' + esc(qid) + '" placeholder="' + esc(t('ws.notePlaceholder')) + '">' + esc(r.note) + '</textarea></div>' +
            '<div class="q-foot no-print">' +
            '<span class="faint">' + esc(t('ws.rating')) + '</span><span class="rating">' + ratings + '</span>' +
            '<label class="faint"><input type="checkbox" data-asked="' + esc(qid) + '"' + (r.asked ? ' checked' : '') + '> ' + esc(t('ws.asked')) + '</label>' +
            '</div></article>';
    }

    function tabQuestions(s) {
        var ids = s.qids.filter(function (id) {
            var q = question(id);
            return q && q.cat !== 'disc';
        });

        var body;
        if (!ids.length) {
            body = '<section class="card"><p class="muted">' + esc(t('ws.empty')) + '</p>' +
                '<button class="btn btn-primary" data-action="open-library">' + esc(t('ws.addFromLibrary')) + '</button></section>';
        } else {
            var byCat = {};
            ids.forEach(function (id) {
                var q = question(id);
                (byCat[q.cat] = byCat[q.cat] || []).push(id);
            });
            body = window.IF_CATEGORIES.filter(function (c) { return byCat[c.id]; }).map(function (c) {
                return '<section class="q-group"><h3>' + c.glyph + ' ' + esc(L(c.name)) + '</h3>' +
                    byCat[c.id].map(function (id) { return questionCard(id, { removable: true }); }).join('') +
                    '</section>';
            }).join('');
            /* custom questions land in whatever category they were given */
        }

        var notes = '<aside class="side-notes card"><h3>' + esc(t('ws.notesTitle')) + '</h3>' +
            '<p class="faint">' + esc(t('ws.book')) + '</p>' +
            '<textarea data-field="notes" style="min-height:22rem" placeholder="' + esc(t('ws.notesPlaceholder')) + '">' + esc(s.notes) + '</textarea></aside>';

        return '<div class="split' + (state.split ? ' on' : '') + '"><div>' + body + '</div>' + (state.split ? notes : '') + '</div>';
    }

    function tabNotes(s) {
        return '<section class="card"><h2>' + esc(t('ws.notesTitle')) + '</h2>' +
            '<textarea data-field="notes" style="min-height:24rem" placeholder="' + esc(t('ws.notesPlaceholder')) + '">' + esc(s.notes) + '</textarea>' +
            '</section>' +
            '<section class="card"><h2>' + esc(t('ws.tab.result')) + '</h2>' +
            '<label class="field"><span>' + esc(t('ws.strengths')) + '</span><textarea data-field="summary.strengths">' + esc(s.summary.strengths) + '</textarea></label>' +
            '<label class="field"><span>' + esc(t('ws.concerns')) + '</span><textarea data-field="summary.concerns">' + esc(s.summary.concerns) + '</textarea></label>' +
            '<label class="field"><span>' + esc(t('ws.verdict')) + '</span><select data-field="summary.verdict">' +
            ['', 'hire', 'maybe', 'no'].map(function (v) {
                return '<option value="' + v + '"' + (s.summary.verdict === v ? ' selected' : '') + '>' +
                    esc(t(v ? 'ws.verdict.' + v : 'ws.verdict.none')) + '</option>';
            }).join('') + '</select></label></section>';
    }

    function discScores(s) {
        var counts = { D: 0, I: 0, S: 0, C: 0 };
        var total = 0;
        Object.keys(s.disc || {}).forEach(function (qid) {
            var v = s.disc[qid];
            if (counts[v] !== undefined) { counts[v]++; total++; }
        });
        return { counts: counts, total: total };
    }

    function tabDisc(s) {
        var discQs = allQuestions().filter(function (q) { return q.cat === 'disc'; });
        var selected = s.qids.filter(function (id) { var q = question(id); return q && q.cat === 'disc'; });
        var list = (selected.length ? selected : discQs.map(function (q) { return q.id; }));

        var sc = discScores(s);
        var bars = window.IF_DISC.map(function (d) {
            var n = sc.counts[d.id];
            var pct = sc.total ? Math.round(n / sc.total * 100) : 0;
            return '<div class="disc-row"><span>' + esc(L(d.name)) + '</span>' +
                '<span class="disc-track"><span style="width:' + pct + '%;background:' + d.colour + '"></span></span>' +
                '<span class="faint">' + pct + '%</span></div>';
        }).join('');

        var cards = list.map(function (id) {
            var q = question(id);
            if (!q) { return ''; }
            var mark = (s.disc || {})[id] || '';
            var buttons = window.IF_DISC.map(function (d) {
                var on = mark === d.id;
                return '<button data-action="disc-mark" data-id="' + esc(id) + '" data-value="' + d.id + '" ' +
                    'aria-pressed="' + on + '" title="' + esc(L(d.name)) + '" ' +
                    'style="' + (on ? 'background:' + d.colour + ';' : '') + '">' + d.id + '</button>';
            }).join('');
            return '<article class="q-card">' +
                '<div class="q-top"><div class="q-text">' + esc(L(q.q)) + '</div>' +
                (q.a ? '<button class="btn btn-sm no-print" data-action="toggle-answer" data-id="' + esc(id) + '">' + esc(t('ws.showAnswer')) + '</button>' : '') +
                '</div>' +
                (q.a ? '<div class="answer hidden" data-answer="' + esc(id) + '"><strong>' + esc(t('ws.answer')) + '</strong>' + esc(L(q.a)) + '</div>' : '') +
                '<div class="q-note"><textarea data-note="' + esc(id) + '" placeholder="' + esc(t('ws.notePlaceholder')) + '">' + esc((s.responses[id] || {}).note || '') + '</textarea></div>' +
                '<div class="q-foot no-print"><span class="faint">' + esc(t('disc.mark')) + '</span>' +
                '<span class="disc-mark">' + buttons + '</span></div></article>';
        }).join('');

        var legend = window.IF_DISC.map(function (d) {
            return '<p><strong style="color:' + d.colour + '">' + esc(L(d.name)) + '</strong> — ' + esc(L(d.desc)) + '</p>';
        }).join('');

        return '<section class="card"><h2>' + esc(t('disc.title')) + '</h2>' +
            '<p class="muted">' + esc(t('disc.lead')) + '</p>' +
            '<h3>' + esc(t('disc.result')) + '</h3>' +
            (sc.total ? '<div class="disc-bars">' + bars + '</div>' : '<p class="muted">' + esc(t('disc.none')) + '</p>') +
            legend + '</section>' +
            '<div class="split' + (state.split ? ' on' : '') + '"><div>' + cards + '</div>' +
            (state.split ? '<aside class="side-notes card"><h3>' + esc(t('ws.notesTitle')) + '</h3>' +
                '<textarea data-field="notes" style="min-height:22rem">' + esc(s.notes) + '</textarea></aside>' : '') +
            '</div>';
    }

    function tabResult(s) {
        var md = buildMarkdown(s);
        return '<section class="card no-print"><h2>' + esc(t('res.title')) + '</h2>' +
            '<div class="wizard-actions" style="margin-top:0">' +
            '<label class="field" style="margin:0"><span>' + esc(t('res.scope')) + '</span>' +
            '<select data-action="scope">' +
            [['filled', 'res.scope.filled'], ['answered', 'res.scope.answered'], ['all', 'res.scope.all']].map(function (p) {
                return '<option value="' + p[0] + '"' + (state.reportScope === p[0] ? ' selected' : '') + '>' + esc(t(p[1])) + '</option>';
            }).join('') + '</select></label>' +
            '<label class="faint"><input type="checkbox" data-action="with-answers"' + (state.reportAnswers ? ' checked' : '') + '> ' + esc(t('res.withAnswers')) + '</label>' +
            '</div>' +
            '<div class="wizard-actions">' +
            '<button class="btn" data-action="copy-md">' + esc(t('btn.copy')) + '</button>' +
            '<button class="btn" data-action="download-md">' + esc(t('btn.download')) + '</button>' +
            '<button class="btn" data-action="print">' + esc(t('btn.print')) + '</button>' +
            '<button class="btn" data-action="export-json">' + esc(t('btn.exportJson')) + '</button>' +
            '<button class="btn" data-action="save-template">' + esc(t('btn.saveTemplate')) + '</button>' +
            '<button class="btn" data-action="share-template">' + esc(t('btn.share')) + '</button>' +
            '</div>' +
            '<h3>' + esc(t('res.preview')) + '</h3>' +
            '<div class="md-preview" id="md-preview">' + esc(md) + '</div></section>' +
            '<section class="card"><div class="md-preview" style="max-height:none">' + esc(md) + '</div></section>';
    }

    /* ---- Markdown report --------------------------------------------------- */
    function buildMarkdown(s) {
        var c = s.candidate;
        var out = [];
        out.push('# ' + t('res.title') + ' — ' + (c.name || '—'));
        out.push('');
        var meta = [
            [t('field.position'), c.position], [t('field.date'), c.date], [t('field.interviewer'), c.interviewer],
            [t('field.source'), c.source], [t('field.email'), c.email], [t('field.phone'), c.phone],
            [t('field.experience'), c.experience], [t('field.availability'), c.availability], [t('field.salary'), c.salary]
        ].filter(function (p) { return p[1]; });
        meta.forEach(function (p) { out.push('- **' + p[0] + ':** ' + p[1]); });
        if (c.background) { out.push('', '## ' + t('field.background'), '', c.background); }
        if ((s.files || []).length) {
            out.push('', '## ' + t('field.cv'), '');
            s.files.forEach(function (f) { out.push('- ' + f.name); });
        }

        var ids = s.qids.filter(function (id) {
            if (state.reportScope === 'all') { return true; }
            return isAnswered(id);
        });
        if (state.reportScope === 'filled') {
            ids = ids.filter(function (id) { return ((s.responses[id] || {}).note || '').trim(); });
        }

        if (ids.length) {
            var byCat = {};
            ids.forEach(function (id) {
                var q = question(id);
                if (q) { (byCat[q.cat] = byCat[q.cat] || []).push(id); }
            });
            out.push('', '## ' + t('ws.tab.questions'));
            window.IF_CATEGORIES.forEach(function (cat) {
                if (!byCat[cat.id]) { return; }
                out.push('', '### ' + L(cat.name));
                byCat[cat.id].forEach(function (id) {
                    var q = question(id);
                    var r = s.responses[id] || {};
                    out.push('', '**' + L(q.q) + '**');
                    if (state.reportAnswers && q.a) { out.push('', '> ' + t('ws.answer') + ': ' + L(q.a)); }
                    if (r.note && r.note.trim()) { out.push('', r.note.trim()); }
                    if (r.rating) { out.push('', '_' + t('ws.rating') + ': ' + r.rating + '/5_'); }
                    if (s.disc && s.disc[id]) { out.push('', '_DISC: ' + s.disc[id] + '_'); }
                });
            });
        }

        var sc = discScores(s);
        if (sc.total) {
            out.push('', '## ' + t('disc.title'), '');
            window.IF_DISC.forEach(function (d) {
                out.push('- ' + L(d.name) + ': ' + Math.round(sc.counts[d.id] / sc.total * 100) + '%');
            });
        }

        if (s.notes && s.notes.trim()) { out.push('', '## ' + t('ws.notesTitle'), '', s.notes.trim()); }
        if (s.summary.strengths) { out.push('', '## ' + t('ws.strengths'), '', s.summary.strengths); }
        if (s.summary.concerns) { out.push('', '## ' + t('ws.concerns'), '', s.summary.concerns); }

        var avg = averageScore(s);
        out.push('', '## ' + t('ws.score'), '', avg === null ? '—' : avg.toFixed(1) + ' / 5');
        out.push('', '**' + t('ws.verdict') + ':** ' + t(s.summary.verdict ? 'ws.verdict.' + s.summary.verdict : 'ws.verdict.none'));
        return out.join('\n');
    }

    function averageScore(s) {
        var sum = 0, n = 0;
        Object.keys(s.responses || {}).forEach(function (id) {
            var r = s.responses[id];
            if (r && r.rating) { sum += r.rating; n++; }
        });
        return n ? sum / n : null;
    }

    function categoryAverages(s) {
        var acc = {};
        Object.keys(s.responses || {}).forEach(function (id) {
            var r = s.responses[id];
            if (!r || !r.rating) { return; }
            var q = QMAP[id] || byId(s.customQs || [], id);
            if (!q) { return; }
            var a = acc[q.cat] || (acc[q.cat] = { sum: 0, n: 0 });
            a.sum += r.rating;
            a.n++;
        });
        Object.keys(acc).forEach(function (k) { acc[k] = acc[k].sum / acc[k].n; });
        return acc;
    }

    /* ---- Compare ----------------------------------------------------------- */
    function renderCompare() {
        if (state.sessions.length < 2) {
            view.innerHTML = '<section class="card"><h1>' + esc(t('cmp.title')) + '</h1>' +
                '<p class="muted">' + esc(t('cmp.empty')) + '</p></section>';
            return;
        }

        var picker = state.sessions.map(function (s) {
            var on = state.compare.indexOf(s.id) !== -1;
            return '<button class="chip" aria-pressed="' + on + '" data-action="toggle-compare" data-id="' + esc(s.id) + '">' +
                esc(s.candidate.name || '—') + '</button>';
        }).join('');

        var chosen = state.sessions.filter(function (s) { return state.compare.indexOf(s.id) !== -1; });
        if (!chosen.length) { chosen = state.sessions.slice(0, 4); }

        var cats = {};
        chosen.forEach(function (s) {
            Object.keys(categoryAverages(s)).forEach(function (c) { cats[c] = true; });
        });
        var catIds = window.IF_CATEGORIES.filter(function (c) { return cats[c.id]; }).map(function (c) { return c.id; });

        var head = '<tr><th>' + esc(t('cmp.subject')) + '</th>' + chosen.map(function (s) {
            return '<th>' + esc(s.candidate.name || '—') + '<br><span class="faint">' + esc(s.candidate.position || '') + '</span></th>';
        }).join('') + '</tr>';

        var averages = chosen.map(categoryAverages);

        var rows = catIds.map(function (cid) {
            var cat = byId(window.IF_CATEGORIES, cid);
            var values = averages.map(function (a) { return a[cid]; });
            var best = Math.max.apply(null, values.map(function (v) { return v === undefined ? -1 : v; }));
            return '<tr><td>' + cat.glyph + ' ' + esc(L(cat.name)) + '</td>' +
                values.map(function (v) {
                    var isBest = v !== undefined && v === best && best > 0;
                    return '<td class="' + (isBest ? 'best' : '') + '">' + (v === undefined ? '—' : v.toFixed(1)) + '</td>';
                }).join('') + '</tr>';
        }).join('');

        var overall = chosen.map(averageScore);
        var bestOverall = Math.max.apply(null, overall.map(function (v) { return v === null ? -1 : v; }));
        var totalRow = '<tr><td><strong>' + esc(t('cmp.avg')) + '</strong></td>' +
            overall.map(function (v) {
                var isBest = v !== null && v === bestOverall && bestOverall > 0;
                return '<td class="' + (isBest ? 'best' : '') + '"><strong>' + (v === null ? '—' : v.toFixed(1)) + '</strong></td>';
            }).join('') + '</tr>';

        var answeredRow = '<tr><td>' + esc(t('cmp.answered')) + '</td>' + chosen.map(function (s) {
            var prev = state.session;
            state.session = s;
            var n = s.qids.filter(isAnswered).length;
            state.session = prev;
            return '<td>' + n + ' / ' + s.qids.length + '</td>';
        }).join('') + '</tr>';

        var discRow = '<tr><td>' + esc(t('disc.title')) + '</td>' + chosen.map(function (s) {
            var sc = discScores(s);
            if (!sc.total) { return '<td>—</td>'; }
            var top = ['D', 'I', 'S', 'C'].sort(function (a, b) { return sc.counts[b] - sc.counts[a]; })[0];
            return '<td>' + top + ' (' + Math.round(sc.counts[top] / sc.total * 100) + '%)</td>';
        }).join('') + '</tr>';

        var verdictRow = '<tr><td>' + esc(t('ws.verdict')) + '</td>' + chosen.map(function (s) {
            return '<td>' + esc(t(s.summary.verdict ? 'ws.verdict.' + s.summary.verdict : 'ws.verdict.none')) + '</td>';
        }).join('') + '</tr>';

        view.innerHTML = '<section class="card"><h1>' + esc(t('cmp.title')) + '</h1>' +
            '<p class="muted">' + esc(t('cmp.lead')) + ' ' + esc(t('cmp.best')) + '</p>' +
            '<p class="faint">' + esc(t('cmp.select')) + '</p>' +
            '<div class="chip-wrap">' + picker + '</div>' +
            '<div class="cmp-scroll" style="margin-top:1rem"><table class="cmp-table"><thead>' + head + '</thead>' +
            '<tbody>' + rows + totalRow + answeredRow + discRow + verdictRow + '</tbody></table></div></section>';
    }

    /* ---- Question library drawer ------------------------------------------- */
    function renderLibrary() {
        var catSel = document.getElementById('lib-cat');
        var roleSel = document.getElementById('lib-role');
        var lvlSel = document.getElementById('lib-level');
        var search = document.getElementById('lib-search');

        search.placeholder = t('lib.search');

        catSel.innerHTML = '<option value="">' + esc(t('lib.subject')) + '</option>' +
            window.IF_CATEGORIES.map(function (c) {
                return '<option value="' + esc(c.id) + '"' + (state.lib.cat === c.id ? ' selected' : '') + '>' + c.glyph + ' ' + esc(L(c.name)) + '</option>';
            }).join('');
        roleSel.innerHTML = '<option value="">' + esc(t('lib.role')) + '</option>' +
            window.IF_ROLES.map(function (r) {
                return '<option value="' + esc(r.id) + '"' + (state.lib.role === r.id ? ' selected' : '') + '>' + esc(L(r.name)) + '</option>';
            }).join('');
        lvlSel.innerHTML = '<option value="">' + esc(t('lib.level')) + '</option>' +
            LEVELS.map(function (l) {
                return '<option value="' + l + '"' + (state.lib.level === l ? ' selected' : '') + '>' + esc(t('level.' + l)) + '</option>';
            }).join('');

        var results = libResults();
        document.getElementById('lib-count').textContent = t('lib.results', { n: results.length });

        var html = results.slice(0, 300).map(function (q) {
            var inSet = state.session && state.session.qids.indexOf(q.id) !== -1;
            var cat = byId(window.IF_CATEGORIES, q.cat);
            return '<div class="lib-item' + (inSet ? ' in-set' : '') + '">' +
                '<div class="q-top"><div class="q-text">' + esc(L(q.q)) +
                '<div class="q-meta">' +
                (cat ? '<span class="tag">' + cat.glyph + ' ' + esc(L(cat.name)) + '</span>' : '') +
                '<span class="tag level">' + esc(t('level.' + q.level)) + '</span>' +
                (q.roles || []).slice(0, 3).map(function (r) {
                    var role = byId(window.IF_ROLES, r);
                    return role ? '<span class="tag">' + esc(L(role.name)) + '</span>' : '';
                }).join('') +
                '</div></div>' +
                '<button class="btn btn-sm" data-action="lib-toggle" data-id="' + esc(q.id) + '">' +
                (inSet ? esc(t('btn.remove')) : esc(t('btn.add'))) + '</button></div>' +
                (q.a ? '<details><summary class="faint">' + esc(t('ws.answer')) + '</summary><div class="answer">' + esc(L(q.a)) + '</div></details>' : '') +
                '</div>';
        }).join('');

        document.getElementById('lib-results').innerHTML = html || '<p class="muted">' + esc(t('lib.none')) + '</p>';
    }

    function libResults() {
        var q = state.lib.q.trim().toLowerCase();
        return allQuestions().filter(function (item) {
            if (state.lib.cat && item.cat !== state.lib.cat) { return false; }
            if (state.lib.level && item.level !== state.lib.level) { return false; }
            if (state.lib.role && (item.roles || []).indexOf(state.lib.role) === -1) { return false; }
            if (!q) { return true; }
            var hay = [L(item.q), item.a ? L(item.a) : '', item.cat, (item.roles || []).join(' ')].join(' ').toLowerCase();
            var cat = byId(window.IF_CATEGORIES, item.cat);
            if (cat) { hay += ' ' + L(cat.name).toLowerCase(); }
            (item.roles || []).forEach(function (r) {
                var role = byId(window.IF_ROLES, r);
                if (role) { hay += ' ' + L(role.name).toLowerCase(); }
            });
            return q.split(/\s+/).every(function (word) { return hay.indexOf(word) !== -1; });
        });
    }

    function openLibrary(open) {
        var drawer = document.getElementById('library');
        var backdrop = document.getElementById('drawer-backdrop');
        drawer.classList.toggle('hidden', !open);
        backdrop.classList.toggle('hidden', !open);
        document.getElementById('library-btn').setAttribute('aria-expanded', String(open));
        if (open) { document.getElementById('lib-search').focus(); }
    }

    /* ==========================================================================
       Actions
       ========================================================================== */
    function setField(path, value) {
        var parts = path.split('.');
        var target = state.session;
        for (var i = 0; i < parts.length - 1; i++) { target = target[parts[i]]; }
        target[parts[parts.length - 1]] = value;
        touch();
    }

    function applyTemplate(tplId) {
        var tpl = byId(window.IF_TEMPLATES, tplId);
        if (!tpl) { return; }
        var s = state.session;
        s.roles = tpl.roles.slice();
        s.qids = recommend(tpl.roles, tpl.max);
        s.positionId = '';
        touch();
    }

    function pickPosition(id) {
        var p = byId(window.IF_POSITIONS, id);
        if (!p) { return; }
        var s = state.session;
        s.positionId = (s.positionId === id) ? '' : id;
        if (s.positionId) {
            s.roles = p.roles.slice();
            if (!s.candidate.position) { s.candidate.position = L(p.name); }
        }
        touch();
    }

    function autoSelect() {
        var s = state.session;
        if (!s.roles.length) { return; }
        var picked = recommend(s.roles, Math.min(30, Math.max(12, s.roles.length * 3)));
        picked.forEach(function (id) { if (s.qids.indexOf(id) === -1) { s.qids.push(id); } });
        touch();
    }

    function toggleQuestion(id) {
        var s = state.session;
        var i = s.qids.indexOf(id);
        if (i === -1) { s.qids.push(id); } else { s.qids.splice(i, 1); }
        touch();
    }

    function templatePayload() {
        var s = state.session;
        return {
            positionId: s.positionId,
            roles: s.roles,
            qids: s.qids.filter(function (id) { return !!QMAP[id]; }),
            customQs: (s.customQs || []).map(function (c) { return { q: c.q }; })
        };
    }

    function shareTemplate() {
        var url = location.origin + location.pathname + '#tpl=' + b64encode(JSON.stringify(templatePayload()));
        copyText(url, t('msg.linkCopied'));
    }

    function saveTemplate() {
        try {
            var stored = JSON.parse(localStorage.getItem('if.templates') || '[]');
            stored.unshift({
                id: uid('tpl'),
                name: state.session.candidate.position || t('btn.saveTemplate'),
                created: new Date().toISOString(),
                payload: templatePayload()
            });
            localStorage.setItem('if.templates', JSON.stringify(stored.slice(0, 40)));
            toast(t('msg.templateSaved'));
        } catch (e) { toast('⚠ ' + e.name); }
    }

    function copyText(text, msg) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () { toast(msg); }, function () { fallbackCopy(text, msg); });
        } else {
            fallbackCopy(text, msg);
        }
    }

    function fallbackCopy(text, msg) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); toast(msg); } catch (e) { /* ignore */ }
        document.body.removeChild(ta);
    }

    function download(filename, text, type) {
        var blob = new Blob([text], { type: type || 'text/markdown;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }

    function safeName(s) {
        return (s || 'interview').replace(/[^a-z0-9\-_ ]/gi, '').trim().replace(/\s+/g, '-').toLowerCase() || 'interview';
    }

    function readFiles(fileList) {
        var s = state.session;
        Array.prototype.forEach.call(fileList, function (file) {
            var entry = { name: file.name, type: file.type, size: file.size, data: null };
            s.files.push(entry);
            var reader = new FileReader();
            reader.onload = function () {
                entry.data = reader.result;
                touch();
                render();
            };
            reader.readAsDataURL(file);
        });
        touch();
    }

    function openFile(index) {
        var f = (state.session.files || [])[index];
        if (!f || !f.data) { return; }
        var w = window.open();
        if (!w) { return; }
        /* Render the attachment inside a sandboxed frame so an HTML/SVG
           attachment cannot script against this origin. */
        var frame = w.document.createElement('iframe');
        frame.setAttribute('sandbox', '');
        frame.setAttribute('title', f.name);
        frame.src = f.data;
        frame.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;border:0';
        w.document.title = f.name;
        w.document.body.style.margin = '0';
        w.document.body.appendChild(frame);
    }

    /* ---- Event wiring ------------------------------------------------------- */
    function onClick(e) {
        var el = e.target.closest('[data-action]');
        if (!el) { return; }
        var action = el.getAttribute('data-action');
        var id = el.getAttribute('data-id');
        var s = state.session;

        switch (action) {
            case 'quick-start':
                var qs = newSession();
                useSession(qs);
                applyTemplate('tpl-quick-screen');
                state.tab = 'brief';
                go('workspace');
                return;
            case 'guided':
                useSession(newSession());
                state.step = 1;
                go('setup');
                return;
            case 'open-session':
                state.session = byId(state.sessions, id);
                state.tab = 'brief';
                save(true);
                go('workspace');
                return;
            case 'dup-session':
                var src = byId(state.sessions, id);
                var copy = JSON.parse(JSON.stringify(src));
                copy.id = uid('iv');
                copy.created = copy.updated = new Date().toISOString();
                copy.candidate = Object.assign({}, copy.candidate, { name: '', email: '', phone: '', background: '' });
                copy.responses = {};
                copy.disc = {};
                copy.notes = '';
                copy.files = [];
                copy.summary = { strengths: '', concerns: '', verdict: '' };
                useSession(copy);
                state.step = 1;
                go('setup');
                return;
            case 'del-session':
                if (!window.confirm(t('msg.confirmDelete'))) { return; }
                state.sessions = state.sessions.filter(function (x) { return x.id !== id; });
                if (s && s.id === id) { state.session = state.sessions[0] || null; }
                save(true);
                render();
                toast(t('msg.deleted'));
                return;
            case 'goto-step': state.step = Number(el.getAttribute('data-step')); render(); return;
            case 'step-back': state.step = Math.max(1, state.step - 1); render(); return;
            case 'step-next':
                if (state.step === 1 && !s.candidate.name.trim()) { toast(t('msg.nameRequired')); return; }
                state.step = Math.min(5, state.step + 1);
                render();
                return;
            case 'start-interview':
                state.tab = s.qids.length ? 'questions' : 'brief';
                go('workspace');
                return;
            case 'pick-template': applyTemplate(id); state.step = 3; render(); toast(t('msg.added')); return;
            case 'pick-position': pickPosition(id); render(); return;
            case 'toggle-role':
                var i = s.roles.indexOf(id);
                if (i === -1) { s.roles.push(id); } else { s.roles.splice(i, 1); }
                touch();
                render();
                return;
            case 'roles-clear': s.roles = []; touch(); render(); return;
            case 'questions-clear': s.qids = []; touch(); render(); return;
            case 'auto-select': autoSelect(); render(); return;
            case 'toggle-question': toggleQuestion(id); render(); return;
            case 'drop-question': toggleQuestion(id); render(); return;
            case 'add-custom': addCustom(); return;
            case 'del-custom':
                s.customQs = (s.customQs || []).filter(function (c) { return c.id !== id; });
                s.qids = s.qids.filter(function (x) { return x !== id; });
                touch();
                render();
                return;
            case 'tab': state.tab = el.getAttribute('data-tab'); render(); return;
            case 'toggle-split': state.split = !state.split; render(); return;
            case 'toggle-answer':
                var box = document.querySelector('[data-answer="' + CSS.escape(id) + '"]');
                if (box) {
                    var hidden = box.classList.toggle('hidden');
                    el.textContent = t(hidden ? 'ws.showAnswer' : 'ws.hideAnswer');
                }
                return;
            case 'rate':
                var v = Number(el.getAttribute('data-value'));
                var r = response(id);
                r.rating = r.rating === v ? 0 : v;
                touch();
                render();
                return;
            case 'disc-mark':
                var val = el.getAttribute('data-value');
                s.disc = s.disc || {};
                if (s.disc[id] === val) { delete s.disc[id]; } else { s.disc[id] = val; }
                touch();
                render();
                return;
            case 'open-library': openLibrary(true); return;
            case 'lib-toggle': toggleQuestion(id); renderLibrary(); if (state.route !== 'home') { render(); } return;
            case 'toggle-compare':
                var ci = state.compare.indexOf(id);
                if (ci === -1) { state.compare.push(id); } else { state.compare.splice(ci, 1); }
                render();
                return;
            case 'copy-md': copyText(buildMarkdown(s), t('msg.copied')); return;
            case 'download-md': download(safeName(s.candidate.name) + '.md', buildMarkdown(s)); return;
            case 'print': window.print(); return;
            case 'export-json':
                download(safeName(s.candidate.name) + '.json', JSON.stringify(persistable(s), null, 2), 'application/json');
                return;
            case 'save-template': saveTemplate(); return;
            case 'share-template': shareTemplate(); return;
            case 'open-file': openFile(Number(el.getAttribute('data-index'))); return;
            case 'del-file':
                s.files.splice(Number(el.getAttribute('data-index')), 1);
                touch();
                render();
                return;
            default: return;
        }
    }

    function addCustom() {
        var input = document.getElementById('custom-q');
        if (!input || !input.value.trim()) { return; }
        var text = input.value.trim();
        var s = state.session;
        var q = {
            id: uid('own'), custom: true, cat: 'behaviour', roles: [], level: 'medior',
            q: { en: text, nl: text, fr: text }, a: null
        };
        s.customQs = s.customQs || [];
        s.customQs.push(q);
        s.qids.push(q.id);
        input.value = '';
        touch();
        render();
    }

    function onInput(e) {
        var el = e.target;
        var s = state.session;

        if (el.id === 'lib-search') { state.lib.q = el.value; renderLibrary(); return; }
        if (!s) { return; }

        if (el.hasAttribute('data-field')) { setField(el.getAttribute('data-field'), el.value); return; }
        if (el.hasAttribute('data-note')) {
            response(el.getAttribute('data-note')).note = el.value;
            touch();
            return;
        }
    }

    function onChange(e) {
        var el = e.target;
        var s = state.session;

        if (el.id === 'lib-cat') { state.lib.cat = el.value; renderLibrary(); return; }
        if (el.id === 'lib-role') { state.lib.role = el.value; renderLibrary(); return; }
        if (el.id === 'lib-level') { state.lib.level = el.value; renderLibrary(); return; }
        if (el.id === 'lang-select') {
            state.lang = el.value;
            save(true);
            render();
            return;
        }
        if (el.id === 'theme-select') {
            state.theme = el.value;
            save(true);
            render();
            return;
        }
        if (el.id === 'import-file' && el.files && el.files[0]) { importSession(el.files[0]); return; }
        if (!s) { return; }
        if (el.id === 'cv-file' && el.files && el.files.length) { readFiles(el.files); return; }
        if (el.hasAttribute('data-asked')) {
            response(el.getAttribute('data-asked')).asked = el.checked;
            touch();
            render();
            return;
        }
        if (el.getAttribute('data-action') === 'scope') { state.reportScope = el.value; render(); return; }
        if (el.getAttribute('data-action') === 'with-answers') { state.reportAnswers = el.checked; render(); return; }
        if (el.hasAttribute('data-field')) { setField(el.getAttribute('data-field'), el.value); render(); return; }
    }

    function importSession(file) {
        var reader = new FileReader();
        reader.onload = function () {
            try {
                var data = JSON.parse(reader.result);
                if (!data || !data.candidate || !Array.isArray(data.qids)) { throw new Error('shape'); }
                data.id = uid('iv');
                data.responses = data.responses || {};
                data.disc = data.disc || {};
                data.files = data.files || [];
                data.customQs = data.customQs || [];
                data.summary = data.summary || { strengths: '', concerns: '', verdict: '' };
                useSession(data);
                toast(t('msg.imported'));
                render();
            } catch (e) {
                toast(t('msg.importFailed'));
            }
        };
        reader.readAsText(file);
    }

    /* ---- Boot --------------------------------------------------------------- */
    function fillSelectors() {
        var lang = document.getElementById('lang-select');
        lang.innerHTML = window.IF_LANGS.map(function (l) {
            return '<option value="' + l.id + '"' + (state.lang === l.id ? ' selected' : '') + '>' + l.flag + ' ' + esc(l.label) + '</option>';
        }).join('');

        var theme = document.getElementById('theme-select');
        theme.innerHTML = THEMES.map(function (th) {
            return '<option value="' + th.id + '"' + (state.theme === th.id ? ' selected' : '') + '>' + esc(th.label) + '</option>';
        }).join('');
    }

    function boot() {
        buildIndex();
        load();
        fillSelectors();
        readHash();

        document.addEventListener('click', onClick);
        document.addEventListener('input', onInput);
        document.addEventListener('change', onChange);

        document.getElementById('library-btn').addEventListener('click', function () {
            openLibrary(document.getElementById('library').classList.contains('hidden'));
        });
        document.getElementById('library-close').addEventListener('click', function () { openLibrary(false); });
        document.getElementById('drawer-backdrop').addEventListener('click', function () { openLibrary(false); });
        document.getElementById('lib-add-all').addEventListener('click', function () {
            if (!state.session) { useSession(newSession()); }
            libResults().slice(0, 100).forEach(function (q) {
                if (state.session.qids.indexOf(q.id) === -1) { state.session.qids.push(q.id); }
            });
            touch();
            toast(t('msg.added'));
            render();
        });

        document.querySelectorAll('.topnav .btn').forEach(function (b) {
            b.addEventListener('click', function () { go(b.getAttribute('data-route')); });
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') { openLibrary(false); }
            if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
                e.preventDefault();
                openLibrary(true);
            }
        });

        window.addEventListener('hashchange', function () { readHash(); render(); });
        window.addEventListener('beforeunload', function () { save(true); });

        render();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
