/* ============================================================
   Phonetic Alphabet Studio — screen wake lock
   Owns everything that keeps the display awake:
     · the Screen Wake Lock API (with a muted-video fallback)
     · a countdown timer: presets, custom minutes, "until HH:MM", extend
     · pomodoro chaining (work block awake, break asleep)
     · expiry chime, system notification and a title-bar countdown
     · battery-aware and activity-aware auto-release

   The module is headless. It emits:
     wake:change  — something structural changed, repaint everything
     wake:tick    — one second passed, repaint just the countdown
   ============================================================ */
(function (window, document) {
    "use strict";

    const PAS = window.PAS = window.PAS || {};
    const KEYS = PAS.KEYS;

    const MAX_MINUTES = 1440;          // 24 h ceiling for custom durations
    const IDLE_MS = 5 * 60 * 1000;     // activity mode: release after 5 min idle
    const BATTERY_FLOOR = 0.2;         // battery mode: release below 20 %
    const POMODORO = { work: 25, rest: 5 };

    function baseTitle() { return PAS.t("app.title"); }

    const s = {
        supported: ("wakeLock" in navigator),
        wanted: true,          // user intent
        sentinel: null,        // live WakeLockSentinel
        video: null,           // fallback <video> element
        usingFallback: false,
        deadline: 0,           // epoch ms the current period ends (0 = no timer)
        periodStart: 0,        // epoch ms the current period began (for the ring)
        minutes: 0,            // duration of the current/last timer, in minutes
        mode: "always",        // "always" | "timer" | "pomodoro"
        phase: "work",         // pomodoro phase
        cycles: 0,             // completed pomodoro work blocks
        idle: false,           // activity mode has parked the lock
        lastActivity: Date.now(),
        opts: {
            chime: false,
            notify: false,
            title: true,
            fallback: false,
            battery: false,
            activity: false
        }
    };

    /* ---------- Small helpers ---------- */
    function persist() {
        PAS.store(KEYS.wake, s.wanted ? "1" : "0");
        PAS.store(KEYS.wakeMinutes, String(s.minutes));
        PAS.store(KEYS.wakeUntil, s.deadline ? String(s.deadline) : "");
        // Empty when not in pomodoro, otherwise "<phase>:<completed blocks>".
        PAS.store(KEYS.pomodoro, s.mode === "pomodoro" ? s.phase + ":" + s.cycles : "");
    }

    function changed() { PAS.emit("wake:change", api.state()); }

    function remaining() { return s.deadline ? s.deadline - Date.now() : 0; }

    function progress() {
        if (!s.deadline || !s.periodStart) { return 0; }
        const total = s.deadline - s.periodStart;
        if (total <= 0) { return 1; }
        return PAS.clamp(1 - (remaining() / total), 0, 1);
    }

    /* ---------- Expiry chime (WebAudio, no asset needed) ---------- */
    function chime() {
        if (!s.opts.chime) { return; }
        if (PAS.speech && PAS.speech.isMuted()) { return; }   // one mute switch for the whole page
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) { return; }
        try {
            const ctx = new Ctx();
            [880, 660, 440].forEach(function (freq, i) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const at = ctx.currentTime + i * 0.22;
                osc.type = "sine";
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.0001, at);
                gain.gain.exponentialRampToValueAtTime(0.25, at + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.2);
                osc.connect(gain).connect(ctx.destination);
                osc.start(at);
                osc.stop(at + 0.22);
            });
            setTimeout(function () { try { ctx.close(); } catch (e) { /* ignore */ } }, 1500);
        } catch (e) { /* ignore */ }
    }

    /* ---------- System notification ---------- */
    function notify(title, body) {
        if (!s.opts.notify) { return; }
        if (!("Notification" in window) || window.Notification.permission !== "granted") { return; }
        try { new window.Notification(title, { body: body, tag: "pas-wake" }); }
        catch (e) { /* ignore */ }
    }

    /* ---------- Title-bar countdown ---------- */
    function paintTitle() {
        const base = baseTitle();
        if (!s.opts.title) {
            if (document.title !== base) { document.title = base; }
            return;
        }
        if (s.wanted && s.deadline) {
            document.title = "\u23F1 " + PAS.fmtCountdown(remaining()) + " \u00B7 " + base;
        } else if (document.title !== base) {
            document.title = base;
        }
    }

    /* ---------- Muted-video fallback (browsers without the API) ---------- */
    function startFallback() {
        if (s.video || !s.opts.fallback) { return false; }
        const canvas = document.createElement("canvas");
        canvas.width = 2; canvas.height = 2;
        if (typeof canvas.captureStream !== "function") { return false; }
        const ctx = canvas.getContext("2d");
        if (!ctx) { return false; }
        try {
            // One frame per second is enough to keep the stream "live".
            const stream = canvas.captureStream(1);
            const video = document.createElement("video");
            video.setAttribute("playsinline", "");
            video.setAttribute("aria-hidden", "true");
            video.muted = true;
            video.loop = true;
            video.width = 1; video.height = 1;
            video.style.cssText = "position:fixed;left:-2px;top:-2px;width:1px;height:1px;opacity:0.01;pointer-events:none";
            video.srcObject = stream;
            document.body.appendChild(video);
            const paint = setInterval(function () {
                ctx.fillStyle = ctx.fillStyle === "#000001" ? "#000002" : "#000001";
                ctx.fillRect(0, 0, 2, 2);
            }, 1000);
            video.__paintTimer = paint;
            const p = video.play();
            if (p && typeof p.catch === "function") { p.catch(function () { /* autoplay blocked */ }); }
            s.video = video;
            s.usingFallback = true;
            return true;
        } catch (e) { return false; }
    }

    function stopFallback() {
        if (!s.video) { return; }
        try {
            clearInterval(s.video.__paintTimer);
            s.video.pause();
            if (s.video.srcObject) {
                s.video.srcObject.getTracks().forEach(function (t) { t.stop(); });
                s.video.srcObject = null;
            }
            s.video.remove();
        } catch (e) { /* ignore */ }
        s.video = null;
        s.usingFallback = false;
    }

    /* ---------- Acquire / release ---------- */
    async function acquire() {
        if (s.sentinel || s.idle) { return; }
        if (!s.supported) { startFallback(); changed(); return; }
        if (document.visibilityState !== "visible") { return; }
        try {
            s.sentinel = await navigator.wakeLock.request("screen");
            s.sentinel.addEventListener("release", function () {
                s.sentinel = null;
                changed();
            });
            stopFallback();
        } catch (err) {
            s.sentinel = null;
            startFallback();
        }
        changed();
    }

    async function release() {
        const sentinel = s.sentinel;
        s.sentinel = null;
        stopFallback();
        try { if (sentinel) { await sentinel.release(); } } catch (e) { /* ignore */ }
    }

    /* ---------- Timer lifecycle ---------- */
    function armPeriod(minutes) {
        s.minutes = PAS.clamp(Math.round(minutes) || 0, 0, MAX_MINUTES);
        s.periodStart = Date.now();
        s.deadline = s.minutes > 0 ? s.periodStart + s.minutes * 60000 : 0;
    }

    async function expire() {
        if (s.mode === "pomodoro") {
            if (s.phase === "work") {
                s.cycles++;
                s.phase = "rest";
                armPeriod(POMODORO.rest);
                await release();
                chime();
                notify(PAS.t("n.break.title"), PAS.t("n.break.body", { n: POMODORO.rest }));
                PAS.toast(PAS.t("t.break", { n: POMODORO.rest }));
            } else {
                s.phase = "work";
                armPeriod(POMODORO.work);
                await acquire();
                chime();
                notify(PAS.t("n.work.title"), PAS.t("n.work.body", { n: POMODORO.work }));
                PAS.toast(PAS.t("t.work"));
            }
            persist();
            changed();
            return;
        }

        s.deadline = 0;
        s.periodStart = 0;
        s.wanted = false;
        s.mode = "timer";
        persist();
        await release();
        paintTitle();
        chime();
        notify(PAS.t("n.timerDone.title"), PAS.t("n.timerDone.body"));
        PAS.toast(PAS.t("t.timerDone"));
        changed();
    }

    /* ---------- Battery watch ---------- */
    function watchBattery() {
        if (!navigator.getBattery) { return; }
        navigator.getBattery().then(function (bat) {
            const check = function () {
                if (!s.opts.battery || !s.wanted) { return; }
                if (!bat.charging && bat.level <= BATTERY_FLOOR) {
                    api.off(true);
                    PAS.toast(PAS.t("t.batteryLow"));
                    notify(PAS.t("n.battery.title"), PAS.t("n.battery.body", { n: Math.round(BATTERY_FLOOR * 100) }));
                }
            };
            bat.addEventListener("levelchange", check);
            bat.addEventListener("chargingchange", check);
            check();
        }).catch(function () { /* ignore */ });
    }

    /* ---------- Activity watch ----------
       The listeners are only attached while the option is on: mousemove is a
       high-frequency event and nobody should pay for a feature they left off. */
    const ACTIVITY_EVENTS = ["mousemove", "keydown", "pointerdown", "wheel", "touchstart"];

    function markActive() {
        s.lastActivity = Date.now();
        if (s.idle && s.wanted) {
            s.idle = false;
            acquire();
            PAS.toast(PAS.t("t.activeAgain"));
        }
    }

    function setActivityWatch(on) {
        ACTIVITY_EVENTS.forEach(function (ev) {
            if (on) { window.addEventListener(ev, markActive, { passive: true }); }
            else { window.removeEventListener(ev, markActive); }
        });
        if (on) { s.lastActivity = Date.now(); }
    }

    function checkIdle() {
        if (s.idle || !s.wanted) { return; }
        if (Date.now() - s.lastActivity <= IDLE_MS) { return; }
        // Only worth scanning for playing media once we would otherwise idle out.
        const playing = PAS.$$("audio, video").some(function (el) {
            return el !== s.video && !el.paused && !el.ended && el.currentTime > 0;
        });
        if (playing) { s.lastActivity = Date.now(); return; }
        s.idle = true;
        release();
        changed();
    }

    /* ---------- Public API ---------- */
    const api = {
        MAX_MINUTES: MAX_MINUTES,

        state: function () {
            return {
                supported: s.supported,
                wanted: s.wanted,
                holding: !!s.sentinel || s.usingFallback,
                usingFallback: s.usingFallback,
                idle: s.idle,
                deadline: s.deadline,
                minutes: s.minutes,
                remaining: remaining(),
                progress: progress(),
                mode: s.mode,
                phase: s.phase,
                cycles: s.cycles,
                opts: Object.assign({}, s.opts)
            };
        },

        /* minutes === 0 keeps the screen awake with no time limit */
        start: async function (minutes, announce) {
            if (!s.supported && !s.opts.fallback) {
                PAS.toast(PAS.t("t.wakeUnsupported"));
                return;
            }
            s.mode = "timer";
            s.phase = "work";
            s.wanted = true;
            s.idle = false;
            s.lastActivity = Date.now();
            armPeriod(minutes);
            persist();
            await acquire();
            changed();
            if (announce) {
                PAS.toast(s.minutes
                    ? PAS.t("t.wakeFor", { duration: PAS.fmtDuration(s.minutes) })
                    : PAS.t("t.wakeNoLimit"));
            }
        },

        /* "17:30" -> the next time the clock reads 17:30 */
        startUntil: async function (hhmm) {
            const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || "").trim());
            if (!m) { PAS.toast(PAS.t("t.timeFormat")); return; }
            const h = parseInt(m[1], 10);
            const min = parseInt(m[2], 10);
            if (h > 23 || min > 59) { PAS.toast(PAS.t("t.timeFormat")); return; }
            const target = new Date();
            target.setHours(h, min, 0, 0);
            if (target.getTime() <= Date.now()) { target.setDate(target.getDate() + 1); }
            const minutes = Math.round((target.getTime() - Date.now()) / 60000);
            if (minutes > MAX_MINUTES) { PAS.toast(PAS.t("t.tooFar")); return; }
            await api.start(Math.max(1, minutes), false);
            PAS.toast(PAS.t("t.wakeUntil", { time: PAS.fmtTimeOfDay(target) }));
        },

        /* Add time to a running countdown (or start one from now). */
        extend: async function (minutes) {
            minutes = Math.round(minutes) || 0;
            if (!minutes) { return; }
            if (!s.wanted) { await api.start(minutes, true); return; }
            if (!s.deadline) {
                await api.start(minutes, true);
                return;
            }
            const capped = Math.min(s.deadline + minutes * 60000, Date.now() + MAX_MINUTES * 60000);
            s.deadline = capped;
            s.minutes = Math.round((s.deadline - s.periodStart) / 60000);
            persist();
            changed();
            PAS.toast(PAS.t("t.extended", {
                duration: PAS.fmtDuration(minutes),
                time: PAS.fmtCountdown(remaining())
            }));
        },

        /* Drop the countdown but keep the screen awake. */
        cancelTimer: async function () {
            if (!s.deadline && s.mode !== "pomodoro") { PAS.toast(PAS.t("t.noTimer")); return; }
            s.mode = "timer";
            await api.start(0, false);
            PAS.toast(PAS.t("t.timerCancelled"));
        },

        startPomodoro: async function () {
            if (!s.supported && !s.opts.fallback) {
                PAS.toast(PAS.t("t.wakeUnsupported"));
                return;
            }
            s.mode = "pomodoro";
            s.phase = "work";
            s.cycles = 0;
            s.wanted = true;
            s.idle = false;
            armPeriod(POMODORO.work);
            persist();
            await acquire();
            changed();
            PAS.toast(PAS.t("t.pomodoro", { work: POMODORO.work, rest: POMODORO.rest }));
        },

        off: async function (quiet) {
            s.wanted = false;
            s.deadline = 0;
            s.periodStart = 0;
            s.mode = "timer";
            s.phase = "work";
            s.idle = false;
            persist();
            await release();
            changed();
            if (!quiet) { PAS.toast(PAS.t("t.wakeOff")); }
        },

        toggle: async function () {
            if (s.wanted) { await api.off(); return; }
            await api.start(s.minutes, false);
            PAS.toast(s.minutes
                ? PAS.t("t.wakeFor", { duration: PAS.fmtDuration(s.minutes) })
                : PAS.t("t.wakeOn"));
        },

        /* ---- options ---- */
        setOption: function (name, value) {
            if (!Object.prototype.hasOwnProperty.call(s.opts, name)) { return Promise.resolve(false); }
            const on = !!value;

            if (name === "notify" && on) {
                if (!("Notification" in window)) {
                    PAS.toast(PAS.t("t.noNotify"));
                    return Promise.resolve(false);
                }
                return window.Notification.requestPermission().then(function (perm) {
                    const granted = perm === "granted";
                    s.opts.notify = granted;
                    PAS.storeBool(KEYS.wakeNotify, granted);
                    if (!granted) { PAS.toast(PAS.t("t.notifyDenied")); }
                    changed();
                    return granted;
                });
            }

            s.opts[name] = on;
            const keyMap = {
                chime: KEYS.wakeChime, notify: KEYS.wakeNotify, title: KEYS.wakeTitle,
                fallback: KEYS.wakeFallback, battery: KEYS.wakeBattery, activity: KEYS.wakeActivity
            };
            PAS.storeBool(keyMap[name], on);

            // The chime shares the page's mute switch, so say so rather than
            // letting the user think the option is broken.
            if (name === "chime" && on && PAS.speech.isMuted()) { PAS.toast(PAS.t("t.chimeMuted"), 3200); }
            if (name === "title") { paintTitle(); }
            if (name === "fallback") {
                if (on && s.wanted && !s.sentinel) { startFallback(); }
                if (!on) { stopFallback(); }
            }
            if (name === "activity") {
                setActivityWatch(on);
                if (!on) {
                    s.idle = false;
                    if (s.wanted) { acquire(); }
                }
            }
            changed();
            return Promise.resolve(on);
        },

        /* ---- lifecycle ---- */
        restore: function () {
            s.opts.chime = PAS.loadBool(KEYS.wakeChime, false);
            s.opts.notify = PAS.loadBool(KEYS.wakeNotify, false) &&
                ("Notification" in window) && window.Notification.permission === "granted";
            s.opts.title = PAS.loadBool(KEYS.wakeTitle, true);
            s.opts.fallback = PAS.loadBool(KEYS.wakeFallback, false);
            s.opts.battery = PAS.loadBool(KEYS.wakeBattery, false);
            s.opts.activity = PAS.loadBool(KEYS.wakeActivity, false);

            const savedIntent = PAS.load(KEYS.wake);
            const savedUntil = parseInt(PAS.load(KEYS.wakeUntil, "0"), 10) || 0;
            const savedPomodoro = PAS.load(KEYS.pomodoro, "").split(":");
            const savedPhase = savedPomodoro[0];
            s.minutes = PAS.clamp(parseInt(PAS.load(KEYS.wakeMinutes, "0"), 10) || 0, 0, MAX_MINUTES);
            s.wanted = savedIntent === null ? true : savedIntent === "1";
            s.mode = (savedPhase === "work" || savedPhase === "rest") ? "pomodoro" : "timer";
            s.phase = savedPhase === "rest" ? "rest" : "work";
            s.cycles = s.mode === "pomodoro" ? (parseInt(savedPomodoro[1], 10) || 0) : 0;

            if (savedUntil && s.wanted) {
                if (savedUntil > Date.now()) {
                    s.deadline = savedUntil;                       // resume across reloads
                    s.periodStart = savedUntil - s.minutes * 60000;
                } else {
                    s.deadline = 0;                                // ran out while closed
                    s.wanted = false;
                    s.mode = "timer";
                }
            }
            if (!s.deadline && s.mode === "pomodoro") { s.mode = "timer"; }
            persist();
        },

        /* A ?wake= parameter overrides the restored state (kiosk / shared links). */
        applyUrlParam: function () {
            const raw = PAS.param("wake");
            if (raw === null) { return false; }
            const value = raw.trim().toLowerCase();
            if (value === "off") { api.off(true); return true; }
            if (value === "pomodoro") { api.startPomodoro(); return true; }
            const mins = parseInt(value, 10);
            if (!isFinite(mins) || mins < 0 || mins > MAX_MINUTES) { return false; }
            api.start(mins, false);
            return true;
        },

        /* Wall-clock driven so a throttled background tab still expires on time. */
        tick: function () {
            if (s.opts.activity) { checkIdle(); }
            paintTitle();
            if (!s.wanted || !s.deadline) { return; }
            if (Date.now() >= s.deadline) { expire(); return; }
            PAS.emit("wake:tick", api.state());
        },

        init: function () {
            api.restore();

            document.addEventListener("visibilitychange", function () {
                if (document.visibilityState !== "visible") { return; }
                if (s.wanted && s.deadline && Date.now() >= s.deadline) { expire(); return; }
                if (s.wanted) { acquire(); }
            });

            watchBattery();
            setActivityWatch(s.opts.activity);

            if (!api.applyUrlParam() && s.wanted) { acquire(); }

            paintTitle();
            changed();
        },

        /* Test hook: drive the countdown without stubbing Date or the
           Wake Lock API. Used by the browser checks in todo.md. */
        debug: {
            setRemaining: function (ms) {
                s.periodStart = Date.now();
                s.deadline = Date.now() + ms;
                s.minutes = Math.max(1, Math.round(ms / 60000));
                changed();
            },
            expireNow: function () {
                s.deadline = Date.now() - 1;
                api.tick();
            },
            snapshot: function () { return api.state(); }
        }
    };

    PAS.wake = api;
})(window, document);
