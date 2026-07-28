/* =============================================================================
   The People Library — shared data-driven workshop engine

   Reads the global BOOK object (supplied by i18n.js from the active content
   pack) and renders the whole page.

   Assessment modes
     score    · weighted points → percentage → band
     classify · tally categories → winning category + breakdown bars
     quiz     · right/wrong knowledge check + review
     profile  · multi-trait Likert meters
     axes     · dichotomies (MBTI-style four-letter code)

   Optional extras: BOOK.assessment2 (second assessment section) and
   BOOK.disc (cross-link to the DISC colour workshop).
   ========================================================================== */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const t = PL_I18N.t;

  const DISC_ORDER = ["red", "yellow", "green", "blue"];
  const DISC_META = {
    red: { icon: "🔴", hex: "#e63946" },
    yellow: { icon: "🟡", hex: "#f0a500" },
    green: { icon: "🟢", hex: "#2a9d5c" },
    blue: { icon: "🔵", hex: "#2e6fd6" },
  };

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  }

  /* Bands sorted low → high, guaranteed to have a usable floor. */
  function sortedBands(A) {
    const bands = (A.bands || []).slice().sort((a, b) => a.min - b.min);
    return bands.length ? bands : [{ min: 0, color: "var(--accent)", label: "", title: "", blurb: "", advice: [] }];
  }
  function bandFor(A, pct) {
    const bands = sortedBands(A);
    let match = bands[0];
    for (const b of bands) if (pct >= b.min) match = b;
    return match;
  }

  /* The meter gradient is built from the band colours themselves, so a
     workshop where a high score is GOOD reads green on the right, and one
     where a high score is a warning reads red on the right — automatically. */
  function meterGradient(A) {
    const bands = sortedBands(A);
    if (bands.length === 1) return bands[0].color || "var(--accent)";
    const stops = bands.map((b, i) => {
      const next = bands[i + 1];
      const from = Math.max(0, Math.min(100, b.min));
      const to = next ? Math.max(0, Math.min(100, next.min)) : 100;
      const mid = i === 0 ? from : (from + to) / 2;
      return `${b.color || "var(--accent)"} ${Math.round(i === bands.length - 1 ? 100 : mid)}%`;
    });
    return `linear-gradient(90deg, ${stops.join(", ")})`;
  }

  function scrollTo(el) {
    if (!el) return;
    el.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  }

  /* ---- Static content / meta -------------------------------------------- */
  function initMeta() {
    const m = BOOK.meta;
    document.documentElement.style.setProperty("--accent", m.accent);
    document.title = `${m.title} — ${m.subtitle}`;
    $("#metaDesc").setAttribute("content", m.description);
    $("#metaTheme").setAttribute("content", m.accent);
    const ogT = $('meta[property="og:title"]');
    if (ogT) ogT.setAttribute("content", `${m.title} — ${m.subtitle}`);
    const ogD = $('meta[property="og:description"]');
    if (ogD) ogD.setAttribute("content", m.description);

    $("#brandBadge").textContent = m.emoji;
    $("#brandText").textContent = m.short;
    $("#heroEyebrow").textContent = m.eyebrow || "";
    $("#heroTitle").innerHTML = m.heroTitle;
    $("#heroLead").innerHTML = m.heroLead;
    $("#heroCta").textContent = m.heroCta || t("begin");

    $("#learnKicker").textContent = BOOK.learn.kicker;
    $("#learnHeading").textContent = BOOK.learn.heading;
    $("#learnSub").innerHTML = BOOK.learn.sub;
    $("#navLearn").textContent = BOOK.learn.nav || t("nav_learn");

    $("#handleKicker").textContent = BOOK.handle.kicker;
    $("#handleHeading").textContent = BOOK.handle.heading;
    $("#handleSub").innerHTML = BOOK.handle.sub;
    $("#navHandle").textContent = BOOK.handle.nav || t("nav_handle");
    const cta = BOOK.handle.cta || t("handle_cta");
    $$(".handle-cta").forEach((el) => (el.innerHTML = cta));

    $("#footerNote").innerHTML = m.footerNote;
    $("#footerSupport").innerHTML = m.footerSupport || "";
    $("#year").textContent = new Date().getFullYear();

    $("#heroCards").innerHTML = BOOK.concepts
      .slice(0, 4)
      .map((c) => `<div class="hero-card"><span aria-hidden="true">${c.icon}</span><b>${esc(c.name)}</b></div>`)
      .join("");
  }

  /* ---- Navigation -------------------------------------------------------- */
  function initNav() {
    const toggle = $(".nav-toggle");
    const links = $("#nav-links");

    function closeMenu() {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    $$("[data-nav]").forEach((a) => a.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
    document.addEventListener("click", (e) => {
      if (links.classList.contains("open") && !e.target.closest(".nav")) closeMenu();
    });

    // Scroll-spy over the sections that are actually visible on this page.
    const navMap = {};
    $$(".nav-links a[data-nav]").forEach((a) => (navMap[a.getAttribute("href").slice(1)] = a));
    const sections = Object.keys(navMap)
      .map((id) => document.getElementById(id))
      .filter((el) => el && !el.hidden);
    const spy = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          $$(".nav-links a").forEach((a) => {
            a.classList.remove("active");
            a.removeAttribute("aria-current");
          });
          const link = navMap[e.target.id];
          if (link) {
            link.classList.add("active");
            link.setAttribute("aria-current", "true");
          }
        }),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* ---- Learn (concept cards + drawer) ------------------------------------ */
  function initLearn() {
    const grid = $("#conceptGrid");
    const detail = $("#conceptDetail");

    grid.innerHTML = BOOK.concepts
      .map(
        (c, i) => `
        <button type="button" class="concept-card" data-i="${i}" aria-expanded="false" aria-controls="conceptDetail">
          <span class="cc-icon" aria-hidden="true">${c.icon}</span>
          <span class="cc-name">${esc(c.name)}</span>
          <span class="cc-tag">${c.tag}</span>
          <span class="cc-more">${esc(t("concept_more"))}</span>
        </button>`
      )
      .join("");

    let open = -1;

    function render(i) {
      const c = BOOK.concepts[i];
      detail.innerHTML = `
        <div class="detail-top">
          <span class="detail-badge" aria-hidden="true">${c.icon}</span>
          <h3 class="detail-title">${esc(c.name)}</h3>
          <button type="button" class="detail-close" aria-label="${esc(t("close"))}">✕</button>
        </div>
        <p class="detail-summary">${c.summary}</p>
        <ul class="detail-points">${(c.points || []).map((p) => `<li>${p}</li>`).join("")}</ul>`;
      $(".detail-close", detail).addEventListener("click", () => {
        const card = $(`.concept-card[data-i="${open}"]`, grid);
        close();
        if (card) card.focus();
      });
    }
    function show(i) {
      open = i;
      $$(".concept-card", grid).forEach((b) => {
        const on = Number(b.dataset.i) === i;
        b.classList.toggle("selected", on);
        b.setAttribute("aria-expanded", String(on));
      });
      render(i);
      detail.hidden = false;
    }
    function close() {
      open = -1;
      $$(".concept-card", grid).forEach((b) => {
        b.classList.remove("selected");
        b.setAttribute("aria-expanded", "false");
      });
      detail.hidden = true;
    }
    $$(".concept-card", grid).forEach((b) =>
      b.addEventListener("click", () => (open === Number(b.dataset.i) ? close() : show(Number(b.dataset.i))))
    );
  }

  /* ---- Assessment engine (reusable) -------------------------------------- */
  function mountAssessment(shell, A, sectionIds) {
    if (sectionIds) {
      if (sectionIds.kicker) $("#" + sectionIds.kicker).textContent = A.kicker;
      if (sectionIds.heading) $("#" + sectionIds.heading).textContent = A.heading;
      if (sectionIds.sub) $("#" + sectionIds.sub).innerHTML = A.sub;
    }
    $(".a-icon", shell).textContent = A.icon || "📝";
    $(".a-introTitle", shell).textContent = A.introTitle;
    $(".a-introText", shell).innerHTML = A.introText;

    const stages = {
      intro: $('[data-stage="intro"]', shell),
      run: $('[data-stage="run"]', shell),
      result: $('[data-stage="result"]', shell),
    };
    const qEl = $(".a-q", shell);
    const optsEl = $(".a-options", shell);
    const barEl = $(".a-bar", shell);
    const barBox = $(".a-progress", shell);
    const countEl = $(".a-count", shell);
    const backBtn = $('[data-action="back"]', shell);
    const resultEl = $(".a-result", shell);

    let questions = [];
    let idx = 0;
    let answers = [];
    let locked = false;

    function show(stage) {
      Object.entries(stages).forEach(([n, el]) => (el.hidden = n !== stage));
    }

    function likertOptions(reverse) {
      const base = [t("likert1"), t("likert2"), t("likert3"), t("likert4"), t("likert5")];
      return base.map((text, i) => ({ text, value: reverse ? 4 - i : i }));
    }

    function start() {
      const qs = A.shuffle === false ? A.questions.slice() : shuffle(A.questions);
      questions = qs.map((q) => {
        let options;
        if (A.mode === "profile") options = likertOptions(q.reverse);
        else options = A.shuffleOptions === false ? (q.options || []).slice() : shuffle(q.options || []);
        return Object.assign({}, q, { options });
      });
      answers = new Array(questions.length).fill(null);
      idx = 0;
      locked = false;
      show("run");
      paint();
      scrollTo(shell);
    }

    function paint(focusOptions) {
      const q = questions[idx];
      const pct = Math.round((idx / questions.length) * 100);
      qEl.textContent = q.q;
      barEl.style.width = `${pct}%`;
      if (barBox) barBox.setAttribute("aria-valuenow", String(pct));
      countEl.textContent = t("of", { i: idx + 1, n: questions.length });
      backBtn.hidden = idx === 0;
      optsEl.innerHTML = q.options
        .map(
          (o, i) =>
            `<button type="button" class="opt${answers[idx] === i ? " chosen" : ""}" data-i="${i}" aria-pressed="${answers[idx] === i}">${o.text}</button>`
        )
        .join("");
      $$(".opt", optsEl).forEach((b) => b.addEventListener("click", () => answer(Number(b.dataset.i))));
      if (focusOptions) {
        const first = $(".opt", optsEl);
        if (first) first.focus({ preventScroll: true });
      }
    }

    function answer(i) {
      if (locked) return;
      answers[idx] = i;
      // Show the choice registering before moving on — much clearer on touch.
      $$(".opt", optsEl).forEach((b, n) => {
        b.classList.toggle("chosen", n === i);
        b.setAttribute("aria-pressed", String(n === i));
      });
      locked = true;
      const delay = prefersReducedMotion ? 0 : 170;
      window.setTimeout(() => {
        locked = false;
        if (idx < questions.length - 1) {
          idx++;
          paint(true);
        } else {
          finish();
        }
      }, delay);
    }

    function finish() {
      barEl.style.width = "100%";
      if (barBox) barBox.setAttribute("aria-valuenow", "100");
      const fn = { classify: finishClassify, quiz: finishQuiz, profile: finishProfile, axes: finishAxes }[A.mode] || finishScore;
      fn();
      show("result");
      scrollTo(stages.result);
    }

    function animateBars(values) {
      const paint = () => $$(".bar-fill", resultEl).forEach((el, i) => (el.style.width = `${values[i]}%`));
      if (prefersReducedMotion) paint();
      else requestAnimationFrame(() => requestAnimationFrame(paint));
    }

    function finishScore() {
      let sum = 0;
      let max = 0;
      questions.forEach((q, i) => {
        const pts = q.options.map((o) => o.points || 0);
        max += pts.length ? Math.max.apply(null, pts) : 0;
        if (answers[i] != null && q.options[answers[i]]) sum += q.options[answers[i]].points || 0;
      });
      const pct = max ? Math.round((sum / max) * 100) : 0;
      const band = bandFor(A, pct);
      resultEl.innerHTML = `
        <div class="result-head">
          <p class="result-eyebrow">${esc(A.resultEyebrow || t("res_result"))}</p>
          <div class="score-badge"><span class="score-num" style="color:${band.color}">${pct}%</span><span class="score-den">${esc(band.label)}</span></div>
          <h3 class="result-title" style="color:${band.color}">${esc(band.title)}</h3>
          <p class="result-blurb">${band.blurb}</p>
        </div>
        <div class="meter">
          <div class="meter-track" style="background:${meterGradient(A)}" role="img" aria-label="${esc(band.title)} — ${pct}%">
            <span class="meter-marker" style="left:${pct}%;border-color:${band.color}"></span>
          </div>
          <div class="meter-scale"><span>${esc(A.scaleLow || t("res_low"))}</span><span>${esc(A.scaleHigh || t("res_high"))}</span></div>
        </div>
        <div class="result-detail" style="--c:${band.color}">
          <h4>${esc(band.adviceTitle || t("res_advice"))}</h4>
          <ul class="rd-list">${(band.advice || []).map((a) => `<li>${a}</li>`).join("")}</ul>
        </div>`;
    }

    function finishClassify() {
      const cats = A.categories || {};
      const tally = {};
      Object.keys(cats).forEach((k) => (tally[k] = 0));
      questions.forEach((q, i) => {
        if (answers[i] == null) return;
        const opt = q.options[answers[i]];
        if (opt && opt.cat in tally) tally[opt.cat]++;
      });
      const total = Object.values(tally).reduce((s, v) => s + v, 0) || 1;
      const ranked = Object.keys(tally).sort((a, b) => tally[b] - tally[a]);
      const c = cats[ranked[0]];
      if (!c) return;

      const pcts = ranked.map((k) => Math.round((tally[k] / total) * 100));
      const bars = ranked
        .map((k, i) => {
          const cat = cats[k];
          return `<div class="bar-row" style="--c:${cat.color}"><span class="bar-key"><span aria-hidden="true">${cat.icon}</span> ${esc(cat.name)}</span><span class="bar-track"><span class="bar-fill"></span></span><span class="bar-val">${pcts[i]}%</span></div>`;
        })
        .join("");

      resultEl.innerHTML = `
        <div class="result-head">
          <p class="result-eyebrow">${esc(A.resultEyebrow || t("res_result"))}</p>
          <h3 class="result-title" style="color:${c.color}"><span aria-hidden="true">${c.icon}</span> ${esc(c.name)}</h3>
          <p class="result-blurb">${c.summary}</p>
        </div>
        <div class="result-bars">${bars}</div>
        <div class="result-detail" style="--c:${c.color}">
          <h4 style="color:${c.color}">${esc(c.name)}</h4>
          <div class="rd-grid">
            <div><h5>${esc(c.signsTitle || t("res_signs"))}</h5><ul>${(c.signs || []).map((s) => `<li>${s}</li>`).join("")}</ul></div>
            <div><h5>${esc(c.handleTitle || t("res_handle"))}</h5><ul>${(c.handle || []).map((s) => `<li>${s}</li>`).join("")}</ul></div>
          </div>
        </div>`;
      animateBars(pcts);
    }

    function finishQuiz() {
      let correct = 0;
      const reviews = questions.map((q, i) => {
        const chosenOpt = answers[i] != null ? q.options[answers[i]] : null;
        const isRight = !!(chosenOpt && chosenOpt.correct);
        if (isRight) correct++;
        const rightOpt = q.options.find((o) => o.correct);
        return {
          q: q.q,
          chosen: chosenOpt ? chosenOpt.text : t("no_answer"),
          right: rightOpt ? rightOpt.text : "",
          isRight,
          explain: q.explain,
        };
      });
      const pct = Math.round((correct / questions.length) * 100);
      const band = bandFor(A, pct);
      resultEl.innerHTML = `
        <div class="result-head">
          <p class="result-eyebrow">${esc(A.resultEyebrow || t("res_score"))}</p>
          <div class="score-badge"><span class="score-num" style="color:${band.color}">${correct}/${questions.length}</span><span class="score-den">${esc(band.label)}</span></div>
          <h3 class="result-title" style="color:${band.color}">${esc(band.title)}</h3>
          <p class="result-blurb">${band.blurb}</p>
        </div>
        <div class="review">
          ${reviews
            .map(
              (r) => `
            <div class="review-item ${r.isRight ? "right" : "wrong"}">
              <div class="review-q">${r.q}</div>
              <div class="review-a">${esc(t("you_said"))} <b class="${r.isRight ? "right" : "wrong"}">${esc(r.chosen)}</b>${
                r.isRight ? "" : ` · ${esc(t("correct_is"))} <b class="right">${esc(r.right)}</b>`
              }</div>
              ${r.explain ? `<div class="review-x">${r.explain}</div>` : ""}
            </div>`
            )
            .join("")}
        </div>`;
    }

    function finishProfile() {
      const traits = A.traits || {};
      const order = (A.traitOrder || Object.keys(traits)).filter((k) => k in traits);
      const sums = {};
      const maxes = {};
      order.forEach((k) => {
        sums[k] = 0;
        maxes[k] = 0;
      });
      questions.forEach((q, i) => {
        if (!(q.trait in maxes)) return; // ignore any stray question
        maxes[q.trait] += 4;
        if (answers[i] != null && q.options[answers[i]]) sums[q.trait] += q.options[answers[i]].value;
      });
      const pcts = {};
      order.forEach((k) => (pcts[k] = maxes[k] ? Math.round((sums[k] / maxes[k]) * 100) : 0));

      const bars = order
        .map((k) => {
          const tr = traits[k];
          return `<div class="bar-row" style="--c:${tr.color}"><span class="bar-key">${tr.icon ? `<span aria-hidden="true">${tr.icon}</span> ` : ""}${esc(tr.name)}</span><span class="bar-track"><span class="bar-fill"></span></span><span class="bar-val">${pcts[k]}%</span></div>`;
        })
        .join("");

      const cells = order
        .map((k) => {
          const tr = traits[k];
          const p = pcts[k];
          const level = p >= 60 ? "high" : p <= 40 ? "low" : "mid";
          const text = level === "high" ? tr.high : level === "low" ? tr.low : tr.mid || t("lvl_mid_text");
          const label = t("lvl_" + level);
          return `<div><h5 style="color:${tr.color}">${esc(tr.name)} — ${esc(label)} (${p}%)</h5><p>${text}</p></div>`;
        })
        .join("");

      resultEl.innerHTML = `
        <div class="result-head">
          <p class="result-eyebrow">${esc(A.resultEyebrow || t("res_profile"))}</p>
          <h3 class="result-title">${esc(A.resultTitle || t("res_profile"))}</h3>
          <p class="result-blurb">${A.resultBlurb || ""}</p>
        </div>
        <div class="result-bars">${bars}</div>
        <div class="result-detail"><div class="rd-grid rd-grid-text">${cells}</div></div>`;
      animateBars(order.map((k) => pcts[k]));
    }

    function finishAxes() {
      const axes = A.axes || [];
      const counts = {};
      axes.forEach((ax) => (counts[ax.key] = { L: 0, R: 0 }));
      questions.forEach((q, i) => {
        if (answers[i] == null) return;
        const opt = q.options[answers[i]];
        if (!opt || !counts[q.axis]) return;
        if (opt.side === "L" || opt.side === "R") counts[q.axis][opt.side]++;
      });

      let code = "";
      const widths = [];
      const rows = axes.map((ax) => {
        const c = counts[ax.key];
        const total = c.L + c.R || 1;
        const lPct = Math.round((c.L / total) * 100);
        const winner = c.L >= c.R ? ax.left : ax.right;
        code += winner.code;
        const wPct = Math.max(lPct, 100 - lPct);
        widths.push(wPct);
        return `<div class="bar-row" style="--c:${A.axisColor || "var(--accent)"}"><span class="bar-key">${esc(ax.left.code)} · ${esc(ax.right.code)}</span><span class="bar-track"><span class="bar-fill"></span></span><span class="bar-val">${esc(winner.code)} ${wPct}%</span></div>`;
      });

      const type = (A.types && A.types[code]) || { name: "", blurb: "", strengths: [], watch: [] };
      const hasDetail = (type.strengths && type.strengths.length) || (type.watch && type.watch.length);
      resultEl.innerHTML = `
        <div class="result-head">
          <p class="result-eyebrow">${esc(A.resultEyebrow || t("res_type"))}</p>
          <h3 class="result-title result-code">${esc(code)}${type.name ? ` · ${esc(type.name)}` : ""}</h3>
          <p class="result-blurb">${type.blurb || ""}</p>
        </div>
        <div class="result-bars">${rows.join("")}</div>
        ${
          hasDetail
            ? `<div class="result-detail"><div class="rd-grid">
          <div><h5>${esc(t("res_strengths"))}</h5><ul>${(type.strengths || []).map((s) => `<li>${s}</li>`).join("")}</ul></div>
          <div><h5>${esc(t("res_watch"))}</h5><ul>${(type.watch || []).map((s) => `<li>${s}</li>`).join("")}</ul></div>
        </div></div>`
            : ""
        }`;
      animateBars(widths);
    }

    backBtn.addEventListener("click", () => {
      if (idx > 0) {
        idx--;
        paint(true);
      }
    });
    $('[data-action="start"]', shell).addEventListener("click", start);
    $('[data-action="restart"]', shell).addEventListener("click", () => {
      answers = [];
      idx = 0;
      locked = false;
      resultEl.innerHTML = "";
      barEl.style.width = "0%";
      show("intro");
      scrollTo(shell);
    });
    $$('[data-action="print"]', shell).forEach((b) => b.addEventListener("click", () => window.print()));
  }

  function initAssessments() {
    mountAssessment($("#assessQuiz"), BOOK.assessment, { kicker: "testKicker", heading: "testHeading", sub: "testSub" });
    $("#navTest").textContent = BOOK.assessment.nav || BOOK.assessment.heading;
    if (BOOK.assessment2) {
      $("#test2").hidden = false;
      $("#navTest2Li").hidden = false;
      $("#navTest2").textContent = BOOK.assessment2.nav || BOOK.assessment2.heading;
      mountAssessment($("#assessQuiz2"), BOOK.assessment2, { kicker: "testKicker2", heading: "testHeading2", sub: "testSub2" });
    }
  }

  /* ---- DISC colour cross-link ------------------------------------------- */
  function initDisc() {
    if (!BOOK.disc) return;
    const d = BOOK.disc;
    $("#disc").hidden = false;
    $("#navDiscLi").hidden = false;
    $("#navDisc").textContent = d.nav || t("disc_kicker");
    $("#discKicker").textContent = d.kicker || t("disc_kicker");
    $("#discHeading").textContent = d.heading;
    $("#discSub").innerHTML = d.sub;

    const labels = d.labels || {};
    const relate = labels.relate || t("disc_relate");
    const reflect = labels.reflect || t("disc_reflect");
    const treat = labels.treat || t("disc_treat");

    $("#discGrid").innerHTML = DISC_ORDER.map((k) => {
      const meta = DISC_META[k];
      const c = d.colors[k];
      if (!c) return "";
      return `
        <div class="disc-card" style="--c:${meta.hex}">
          <div class="disc-head"><span class="disc-badge" aria-hidden="true">${meta.icon}</span><div><b>${esc(t("col_" + k))}</b><small>${esc(t("lbl_" + k))}</small></div></div>
          <div class="disc-block"><h5>${esc(relate)}</h5><p>${c.relate}</p></div>
          <div class="disc-block"><h5>${esc(reflect)}</h5><p>${c.reflect}</p></div>
          <div class="disc-block"><h5>${esc(treat)}</h5><p>${c.treat}</p></div>
        </div>`;
    }).join("");

    const link = d.link || "../DISC-profile-SurroundedByIdiots/index.html";
    const sep = link.indexOf("?") === -1 ? "?" : "&";
    $("#discCta").innerHTML = `<a class="btn btn-primary" href="${esc(link + sep + "lang=" + PL_I18N.lang)}">${esc(d.linkLabel || t("disc_link"))}</a>`;
  }

  /* ---- Handle / tips ----------------------------------------------------- */
  function initTips() {
    $("#tipsGrid").innerHTML = BOOK.handle.cards
      .map(
        (col) => `
        <div class="tip-card ${col.tone || ""}">
          <div class="tip-head"><span class="tip-badge" aria-hidden="true">${col.icon}</span><b>${esc(col.title)}</b></div>
          <ul class="tip-list">${col.items.map((x) => `<li>${x}</li>`).join("")}</ul>
        </div>`
      )
      .join("");
  }

  /* ---- FAQ --------------------------------------------------------------- */
  function initFaq() {
    $("#faqList").innerHTML = BOOK.faq
      .map((f) => `<details class="faq-item"><summary>${f.q}</summary><div class="faq-a">${f.a}</div></details>`)
      .join("");
  }

  /* ---- Boot -------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    PL_I18N.applyDocument();
    initMeta();
    initLearn();
    initAssessments();
    initTips();
    initDisc();
    initFaq();
    initNav(); // last: hidden sections are now resolved
  });
})();
