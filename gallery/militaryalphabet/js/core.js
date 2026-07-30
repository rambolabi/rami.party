/* ============================================================
   Phonetic Alphabet Studio — core
   Shared namespace, storage, formatting, clipboard, toasts and a
   tiny event bus. Loaded first; every other module builds on it.
   No dependencies, no build step.
   ============================================================ */
(function (window, document) {
    "use strict";

    const PAS = window.PAS = window.PAS || {};

    /* ---------- localStorage keys (one place, no magic strings) ---------- */
    PAS.KEYS = {
        alphabet: "ma.alphabet",
        theme: "ma.theme",
        lang: "ma.lang",
        muted: "ma.muted",
        rate: "ma.rate",
        pitch: "ma.pitch",
        voice: "ma.voice",
        gap: "ma.gap",
        format: "ma.format",
        direction: "ma.dir",
        callsign: "ma.callsign",
        morseRow: "ma.morserow",
        history: "ma.history",
        tab: "ma.tab",
        seen: "ma.seen",
        quizBest: "ma.quizbest",
        quizMode: "ma.quizmode",
        wake: "ma.wake",
        wakeMinutes: "ma.wakemin",
        wakeUntil: "ma.wakeuntil",
        wakeChime: "ma.wakechime",
        wakeNotify: "ma.wakenotify",
        wakeTitle: "ma.waketitle",
        wakeFallback: "ma.wakefallback",
        wakeBattery: "ma.wakebattery",
        wakeActivity: "ma.wakeactivity",
        pomodoro: "ma.pomodoro"
    };

    /* ---------- DOM ---------- */
    PAS.$ = function (id) { return document.getElementById(id); };
    PAS.$$ = function (selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    };

    /* True while the caret sits in a field, so global shortcuts stay out of the way. */
    PAS.isTyping = function (el) {
        el = el || document.activeElement;
        if (!el) { return false; }
        const tag = el.tagName;
        return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable === true;
    };

    /* ---------- Storage (never throws: private mode / storage disabled) ---------- */
    PAS.store = function (key, value) {
        try { localStorage.setItem(key, String(value)); } catch (e) { /* ignore */ }
    };
    PAS.load = function (key, fallback) {
        const fb = fallback === undefined ? null : fallback;
        try {
            const v = localStorage.getItem(key);
            return v === null ? fb : v;
        } catch (e) { return fb; }
    };
    PAS.remove = function (key) {
        try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
    };
    PAS.loadNum = function (key, fallback) {
        const n = parseFloat(PAS.load(key, ""));
        return isFinite(n) ? n : fallback;
    };
    PAS.storeBool = function (key, on) { PAS.store(key, on ? "1" : "0"); };
    PAS.loadBool = function (key, fallback) {
        const v = PAS.load(key);
        return v === null ? fallback : v === "1";
    };
    PAS.storeJSON = function (key, value) {
        try { PAS.store(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
    };
    PAS.loadJSON = function (key, fallback) {
        try {
            const raw = PAS.load(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (e) { return fallback; }
    };

    /* ---------- Numbers & time ---------- */
    PAS.clamp = function (n, min, max) { return Math.min(max, Math.max(min, n)); };
    PAS.pad2 = function (n) { return n < 10 ? "0" + n : String(n); };

    /* 5400000 -> "1:30:00" · 90000 -> "01:30" */
    PAS.fmtCountdown = function (ms) {
        const total = Math.max(0, Math.ceil(ms / 1000));
        const h = Math.floor(total / 3600);
        const m = Math.floor((total % 3600) / 60);
        const s = total % 60;
        return h > 0 ? h + ":" + PAS.pad2(m) + ":" + PAS.pad2(s) : PAS.pad2(m) + ":" + PAS.pad2(s);
    };

    /* 90 -> "1h 30m" · 45 -> "45 min" */
    PAS.fmtDuration = function (minutes) {
        minutes = Math.round(minutes);
        if (minutes < 60) { return PAS.t("dur.min", { n: minutes }); }
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        if (m) { return PAS.t("dur.hm", { h: h, m: m }); }
        return PAS.t(h === 1 ? "dur.hour" : "dur.hours", { h: h });
    };

    /* 24-hour, to match the footer clock and the radio context of the tool. */
    PAS.fmtTimeOfDay = function (date) {
        return new Date(date).toLocaleTimeString(PAS.i18n ? PAS.i18n.current() : [], {
            hour: "2-digit", minute: "2-digit", hour12: false
        });
    };

    /* ---------- Text ---------- */
    const HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    PAS.escapeHtml = function (s) {
        return String(s).replace(/[&<>"']/g, function (c) { return HTML_ESCAPES[c]; });
    };

    PAS.shuffle = function (list) {
        const out = list.slice();
        for (let i = out.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const t = out[i]; out[i] = out[j]; out[j] = t;
        }
        return out;
    };

    PAS.pick = function (list) { return list[Math.floor(Math.random() * list.length)]; };

    /* ---------- Tiny event bus ---------- */
    const listeners = {};
    PAS.on = function (name, fn) {
        (listeners[name] = listeners[name] || []).push(fn);
    };
    PAS.emit = function (name, payload) {
        const list = listeners[name];
        if (!list) { return; }
        list.slice().forEach(function (fn) {
            try { fn(payload); } catch (e) { console.error("[PAS] listener for " + name + " failed", e); }
        });
    };

    /* ---------- Toast ---------- */
    let toastTimer = null;
    PAS.toast = function (msg, ms) {
        const t = PAS.$("toast");
        if (!t) { return; }
        t.textContent = msg;
        t.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { t.classList.remove("show"); }, ms || 1800);
    };

    /* ---------- Clipboard ---------- */
    function fallbackCopy(text) {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        let ok = false;
        try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
        document.body.removeChild(ta);
        return ok;
    }

    PAS.copy = function (text, quiet) {
        if (!text) { return Promise.resolve(false); }
        const done = function (ok) {
            if (!quiet) { PAS.toast(PAS.t(ok ? "t.copied" : "t.copyFailed")); }
            return ok;
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text).then(
                function () { return done(true); },
                function () { return done(fallbackCopy(text)); }
            );
        }
        return Promise.resolve(done(fallbackCopy(text)));
    };

    /* ---------- File download ---------- */
    PAS.download = function (filename, mime, content) {
        const blob = content instanceof Blob ? content : new Blob([content], { type: mime + ";charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    };

    /* ---------- URL parameters ---------- */
    PAS.param = function (name) {
        try { return new URLSearchParams(window.location.search).get(name); }
        catch (e) { return null; }
    };
})(window, document);
