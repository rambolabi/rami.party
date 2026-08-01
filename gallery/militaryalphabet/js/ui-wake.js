/* ============================================================
   Phonetic Alphabet Studio — wake lock UI
   Everything the user sees for the wake lock: the two header pills,
   the timer panel with presets, custom durations, "until HH:MM",
   pomodoro, the progress ring and the behaviour switches.
   All state lives in PAS.wake; this file only paints and forwards.
   ============================================================ */
(function (window, document) {
    "use strict";

    const PAS = window.PAS = window.PAS || {};
    const RING_R = 26;
    const RING_C = 2 * Math.PI * RING_R;

    const OPTION_CONTROLS = [
        ["optChime", "chime"],
        ["optNotify", "notify"],
        ["optTitle", "title"],
        ["optFallback", "fallback"],
        ["optBattery", "battery"],
        ["optActivity", "activity"]
    ];

    function setPill(state, text) {
        const pill = PAS.$("wakeToggle");
        if (!pill) { return; }
        pill.classList.remove("on", "off", "unsupported");
        pill.classList.add(state);
        PAS.$("wakeText").textContent = text;
        pill.setAttribute("aria-pressed", state === "on" ? "true" : "false");
    }

    /* Cheap 1 Hz repaint: countdown label + ring only. */
    function paintCountdown(st) {
        const btn = PAS.$("timerToggle");
        const label = PAS.$("timerText");
        if (!btn || !label) { return; }

        if (!st.supported && !st.opts.fallback) {
            label.textContent = PAS.t("timer.pill.na");
            btn.classList.remove("on", "ending");
        } else if (st.wanted && st.deadline) {
            label.textContent = PAS.t("timer.pill.running", { time: PAS.fmtCountdown(st.remaining) });
            btn.classList.add("on");
            btn.classList.toggle("ending", st.remaining <= 60000);
        } else {
            label.textContent = PAS.t("timer.pill.off");
            btn.classList.remove("on", "ending");
        }

        const arc = PAS.$("wakeRingArc");
        const ringLabel = PAS.$("wakeRingLabel");
        const ring = PAS.$("wakeRing");
        if (arc && ringLabel && ring) {
            const active = st.wanted && !!st.deadline;
            ring.classList.toggle("is-idle", !active);
            arc.style.strokeDasharray = RING_C.toFixed(2);
            arc.style.strokeDashoffset = (RING_C * (1 - (active ? st.progress : 0))).toFixed(2);
            ringLabel.textContent = active ? PAS.fmtCountdown(st.remaining) : "\u221E";
        }
    }

    function paintStatus(st) {
        const status = PAS.$("timerStatus");
        if (!status) { return; }
        const fallbackNote = st.usingFallback ? PAS.t("st.fallback") : "";

        if (!st.supported && !st.opts.fallback) {
            status.innerHTML = PAS.t("st.noApi");
            return;
        }
        if (!st.wanted) {
            status.innerHTML = PAS.t("st.off");
            return;
        }
        if (st.idle) {
            status.innerHTML = PAS.t("st.idle");
            return;
        }
        if (st.mode === "pomodoro") {
            status.innerHTML = PAS.t("st.pomodoro", {
                phase: PAS.t(st.phase === "work" ? "st.phase.work" : "st.phase.rest"),
                time: PAS.fmtCountdown(st.remaining),
                cycles: st.cycles
            });
            return;
        }
        if (st.deadline) {
            status.innerHTML = PAS.t("st.timer", {
                time: PAS.fmtCountdown(st.remaining),
                until: PAS.fmtTimeOfDay(st.deadline)
            }) + fallbackNote;
            return;
        }
        status.innerHTML = PAS.t("st.noTimer") + fallbackNote;
    }

    function paint(st) {
        st = st || PAS.wake.state();

        if (!st.supported && !st.opts.fallback) { setPill("unsupported", PAS.t("wake.state.na")); }
        else if (!st.wanted) { setPill("off", PAS.t("wake.state.off")); }
        else if (st.idle) { setPill("off", PAS.t("wake.state.idle")); }
        else if (st.holding) { setPill("on", PAS.t(st.usingFallback ? "wake.state.video" : "wake.state.on")); }
        else { setPill("off", PAS.t("wake.state.paused")); }

        paintCountdown(st);
        paintStatus(st);

        PAS.$$(".timer-preset[data-minutes]").forEach(function (btn) {
            const mins = parseInt(btn.dataset.minutes, 10);
            const active = st.wanted && st.mode === "timer" &&
                (st.deadline ? mins === st.minutes : mins === 0);
            btn.classList.toggle("is-active", active);
            btn.setAttribute("aria-pressed", active ? "true" : "false");
        });

        const pomo = PAS.$("timerPomodoro");
        if (pomo) {
            const on = st.mode === "pomodoro" && st.wanted;
            pomo.classList.toggle("is-active", on);
            pomo.setAttribute("aria-pressed", on ? "true" : "false");
        }

        OPTION_CONTROLS.forEach(function (pair) {
            const el = PAS.$(pair[0]);
            if (el) { el.checked = !!st.opts[pair[1]]; }
        });
    }

    function openPanel(open) {
        const panel = PAS.$("timerPanel");
        const btn = PAS.$("timerToggle");
        if (!panel || !btn) { return; }
        panel.hidden = !open;
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        if (open) { paint(); }
    }

    function startCustom() {
        const field = PAS.$("timerCustom");
        const mins = parseInt(field.value, 10);
        if (!mins || mins < 1 || mins > PAS.wake.MAX_MINUTES) {
            PAS.toast(PAS.t("t.minutesRange", { max: PAS.wake.MAX_MINUTES }));
            field.focus();
            field.select();
            return;
        }
        PAS.wake.start(mins, true);
    }

    PAS.uiWake = {
        togglePanel: function () {
            const panel = PAS.$("timerPanel");
            openPanel(panel.hidden);
        },
        closePanel: function () { openPanel(false); },
        isPanelOpen: function () { return !PAS.$("timerPanel").hidden; },

        init: function () {
            const panel = PAS.$("timerPanel");
            const timerBtn = PAS.$("timerToggle");
            const pill = PAS.$("wakeToggle");
            const custom = PAS.$("timerCustom");
            const st = PAS.wake.state();

            if (st.minutes) { custom.value = String(st.minutes); }

            pill.addEventListener("click", function () { PAS.wake.toggle(); });
            timerBtn.addEventListener("click", PAS.uiWake.togglePanel);
            PAS.$("timerClose").addEventListener("click", function () {
                openPanel(false);
                timerBtn.focus();
            });

            PAS.$("timerPresets").addEventListener("click", function (e) {
                const btn = e.target.closest(".timer-preset[data-minutes]");
                if (!btn) { return; }                       // the pomodoro button has its own handler
                const mins = parseInt(btn.dataset.minutes, 10) || 0;
                custom.value = mins ? String(mins) : "";
                PAS.wake.start(mins, true);
            });

            PAS.$("timerStart").addEventListener("click", startCustom);
            custom.addEventListener("keydown", function (e) {
                if (e.key === "Enter") { e.preventDefault(); startCustom(); }
            });
            PAS.$("timerStop").addEventListener("click", function () { PAS.wake.cancelTimer(); });
            PAS.$("timerPlus15").addEventListener("click", function () { PAS.wake.extend(15); });
            PAS.$("timerPlus60").addEventListener("click", function () { PAS.wake.extend(60); });
            PAS.$("timerPomodoro").addEventListener("click", function () {
                if (PAS.wake.state().mode === "pomodoro") { PAS.wake.cancelTimer(); }
                else { PAS.wake.startPomodoro(); }
            });

            const untilField = PAS.$("timerUntil");
            PAS.$("timerUntilBtn").addEventListener("click", function () {
                PAS.wake.startUntil(untilField.value);
            });
            untilField.addEventListener("keydown", function (e) {
                if (e.key === "Enter") { e.preventDefault(); PAS.wake.startUntil(untilField.value); }
            });

            OPTION_CONTROLS.forEach(function (pair) {
                const el = PAS.$(pair[0]);
                if (!el) { return; }
                el.addEventListener("change", function () {
                    PAS.wake.setOption(pair[1], el.checked);
                });
            });

            // Click outside closes the panel; the two pills are part of the control.
            document.addEventListener("click", function (e) {
                if (panel.hidden) { return; }
                if (panel.contains(e.target) || timerBtn.contains(e.target) || pill.contains(e.target)) { return; }
                openPanel(false);
            });

            PAS.on("wake:change", paint);
            PAS.on("wake:tick", function (state) {
                paintCountdown(state);
                if (!panel.hidden) { paintStatus(state); }
            });
            PAS.on("lang:change", function () { paint(); });

            paint();
        }
    };
})(window, document);
