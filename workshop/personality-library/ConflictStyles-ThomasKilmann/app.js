/* =============================================================================
   Personality Workshop — shared data-driven engine
   Reads the global BOOK object from data.js and renders the whole site.
   Assessment modes: "score", "classify", "quiz", "profile" (multi-trait),
   "axes" (dichotomies / MBTI-style). Supports an optional second assessment
   (BOOK.assessment2) and an optional DISC colour cross-link section (BOOK.disc).
   ========================================================================== */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const DISC_COLORS = {
    red: { name: "Red", label: "Dominance", icon: "🔴", hex: "#e63946" },
    yellow: { name: "Yellow", label: "Influence", icon: "🟡", hex: "#f0a500" },
    green: { name: "Green", label: "Steadiness", icon: "🟢", hex: "#2a9d5c" },
    blue: { name: "Blue", label: "Conscientiousness", icon: "🔵", hex: "#2e6fd6" },
  };
  const DISC_ORDER = ["red", "yellow", "green", "blue"];

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  }

  /* ---- Static content / meta -------------------------------------------- */
  function initMeta() {
    const m = BOOK.meta;
    document.documentElement.style.setProperty("--accent", m.accent);
    document.title = `${m.title} — ${m.subtitle}`;
    $("#metaDesc").setAttribute("content", m.description);
    $("#metaTheme").setAttribute("content", m.accent);
    $("#brandBadge").textContent = m.emoji;
    $("#brandText").textContent = m.short;
    $("#heroEyebrow").textContent = m.eyebrow || "A Personality Workshop";
    $("#heroTitle").innerHTML = m.heroTitle;
    $("#heroLead").innerHTML = m.heroLead;
    $("#heroCta").textContent = m.heroCta || "Take the assessment";

    $("#learnKicker").textContent = BOOK.learn.kicker;
    $("#learnHeading").textContent = BOOK.learn.heading;
    $("#learnSub").innerHTML = BOOK.learn.sub;

    $("#handleKicker").textContent = BOOK.handle.kicker;
    $("#handleHeading").textContent = BOOK.handle.heading;
    $("#handleSub").innerHTML = BOOK.handle.sub;
    $("#navHandle").textContent = BOOK.handle.nav || "Handle";
    $("#resultCta").innerHTML = BOOK.handle.cta || "How to handle it →";

    $("#footerNote").innerHTML = m.footerNote;
    $("#footerSupport").innerHTML =
      m.footerSupport ||
      `Want the full picture? <strong>Read <em>${esc(m.title)}</em> by Thomas Erikson</strong> — buy the book and support the author.`;
    $("#year").textContent = new Date().getFullYear();

    $("#heroCards").innerHTML = BOOK.concepts
      .slice(0, 4)
      .map((c) => `<div class="hero-card"><span>${c.icon}</span><b>${c.name}</b></div>`)
      .join("");
  }

  /* ---- Navigation -------------------------------------------------------- */
  function initNav() {
    const toggle = $(".nav-toggle");
    const links = $("#nav-links");
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    $$("[data-nav]").forEach((a) =>
      a.addEventListener("click", () => {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
    const ids = ["learn", "test", "test2", "handle", "disc", "faq"];
    const navMap = {};
    $$(".nav-links a[data-nav]").forEach((a) => (navMap[a.getAttribute("href").slice(1)] = a));
    const spy = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          $$(".nav-links a").forEach((a) => a.classList.remove("active"));
          if (navMap[e.target.id]) navMap[e.target.id].classList.add("active");
        }
      }),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    ids.map((id) => document.getElementById(id)).filter(Boolean).forEach((s) => spy.observe(s));
  }

  /* ---- Learn (concept cards + drawer) ------------------------------------ */
  function initLearn() {
    const grid = $("#conceptGrid");
    const detail = $("#conceptDetail");
    grid.innerHTML = BOOK.concepts
      .map((c, i) => `
        <button class="concept-card" data-i="${i}" aria-expanded="false">
          <span class="cc-icon">${c.icon}</span>
          <div class="cc-name">${c.name}</div>
          <p class="cc-tag">${c.tag}</p>
          <span class="cc-more">Read more →</span>
        </button>`)
      .join("");
    let open = -1;
    function render(i) {
      const c = BOOK.concepts[i];
      detail.innerHTML = `
        <div class="detail-top">
          <span class="detail-badge">${c.icon}</span>
          <div class="detail-title">${c.name}</div>
          <button class="detail-close" aria-label="Close">✕</button>
        </div>
        <p class="detail-summary">${c.summary}</p>
        <ul class="detail-points">${(c.points || []).map((p) => `<li>${p}</li>`).join("")}</ul>`;
      $(".detail-close", detail).addEventListener("click", close);
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
      $$(".concept-card", grid).forEach((b) => { b.classList.remove("selected"); b.setAttribute("aria-expanded", "false"); });
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
    const countEl = $(".a-count", shell);
    const backBtn = $('[data-action="back"]', shell);
    const resultEl = $(".a-result", shell);

    let questions = [];
    let idx = 0;
    let answers = [];

    function show(stage) { Object.entries(stages).forEach(([n, el]) => (el.hidden = n !== stage)); }

    function likertOptions(reverse) {
      const base = ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"];
      return base.map((text, i) => ({ text, value: reverse ? 4 - i : i }));
    }

    function start() {
      let qs = A.shuffle === false ? A.questions.slice() : shuffle(A.questions);
      questions = qs.map((q) => {
        let options;
        if (A.mode === "profile") options = likertOptions(q.reverse);
        else options = A.shuffleOptions === false ? q.options.slice() : shuffle(q.options);
        return { ...q, options };
      });
      answers = new Array(questions.length).fill(null);
      idx = 0;
      show("run");
      paint();
    }

    function paint() {
      const q = questions[idx];
      qEl.textContent = q.q;
      barEl.style.width = `${(idx / questions.length) * 100}%`;
      countEl.textContent = `${idx + 1} / ${questions.length}`;
      backBtn.hidden = idx === 0;
      optsEl.innerHTML = q.options
        .map((o, i) => `<button class="opt${answers[idx] === i ? " chosen" : ""}" data-i="${i}">${o.text}</button>`)
        .join("");
      $$(".opt", optsEl).forEach((b) => b.addEventListener("click", () => answer(Number(b.dataset.i))));
    }

    function answer(i) {
      answers[idx] = i;
      if (idx < questions.length - 1) { idx++; paint(); }
      else finish();
    }

    function finish() {
      barEl.style.width = "100%";
      const fn = { classify: finishClassify, quiz: finishQuiz, profile: finishProfile, axes: finishAxes }[A.mode] || finishScore;
      fn();
      show("result");
      stages.result.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function finishScore() {
      let sum = 0, max = 0;
      questions.forEach((q, i) => {
        const pts = q.options.map((o) => o.points || 0);
        max += Math.max(...pts);
        if (answers[i] != null) sum += q.options[answers[i]].points || 0;
      });
      const pct = max ? Math.round((sum / max) * 100) : 0;
      const band = A.bands.slice().sort((a, b) => b.min - a.min).find((b) => pct >= b.min) || A.bands[0];
      resultEl.innerHTML = `
        <div class="result-head">
          <p class="result-eyebrow">${A.resultEyebrow || "Your result"}</p>
          <div class="score-badge"><span class="score-num" style="color:${band.color}">${pct}%</span><span class="score-den">${band.label}</span></div>
          <h3 class="result-title" style="color:${band.color}">${band.title}</h3>
          <p class="result-blurb">${band.blurb}</p>
        </div>
        <div class="meter">
          <div class="meter-track"><span class="meter-marker" style="left:${pct}%"></span></div>
          <div class="meter-scale"><span>${A.scaleLow || "Low"}</span><span>${A.scaleHigh || "High"}</span></div>
        </div>
        <div class="result-detail" style="--c:${band.color}">
          <h4>${band.adviceTitle || "What to do"}</h4>
          <ul class="rd-grid" style="grid-template-columns:1fr">${band.advice.map((a) => `<li>${a}</li>`).join("")}</ul>
        </div>`;
    }

    function finishClassify() {
      const tally = {};
      Object.keys(A.categories).forEach((k) => (tally[k] = 0));
      questions.forEach((q, i) => {
        if (answers[i] != null) {
          const cat = q.options[answers[i]].cat;
          if (cat in tally) tally[cat]++;
        }
      });
      const total = Object.values(tally).reduce((s, v) => s + v, 0) || 1;
      const ranked = Object.keys(tally).sort((a, b) => tally[b] - tally[a]);
      const top = ranked[0];
      const c = A.categories[top];
      const bars = ranked.map((k) => {
        const cat = A.categories[k];
        const pct = Math.round((tally[k] / total) * 100);
        return `<div class="bar-row" style="--c:${cat.color}"><span class="bar-key">${cat.icon} ${cat.name}</span><span class="bar-track"><span class="bar-fill" style="width:0"></span></span><span class="bar-val">${pct}%</span></div>`;
      }).join("");
      resultEl.innerHTML = `
        <div class="result-head">
          <p class="result-eyebrow">${A.resultEyebrow || "Your result"}</p>
          <h3 class="result-title" style="color:${c.color}">${c.icon} ${c.name}</h3>
          <p class="result-blurb">${c.summary}</p>
        </div>
        <div class="result-bars">${bars}</div>
        <div class="result-detail" style="--c:${c.color}">
          <h4 style="color:${c.color}">${c.name}</h4>
          <div class="rd-grid">
            <div><h5>${c.signsTitle || "Signs to watch"}</h5><ul>${c.signs.map((s) => `<li>${s}</li>`).join("")}</ul></div>
            <div><h5>${c.handleTitle || "How to handle them"}</h5><ul>${c.handle.map((s) => `<li>${s}</li>`).join("")}</ul></div>
          </div>
        </div>`;
      const targets = ranked.map((k) => Math.round((tally[k] / total) * 100));
      requestAnimationFrame(() => $$(".bar-fill", resultEl).forEach((el, i) => (el.style.width = `${targets[i]}%`)));
    }

    function finishQuiz() {
      let correct = 0;
      const reviews = questions.map((q, i) => {
        const chosen = answers[i];
        const chosenOpt = chosen != null ? q.options[chosen] : null;
        const isRight = chosenOpt && chosenOpt.correct;
        if (isRight) correct++;
        const rightOpt = q.options.find((o) => o.correct);
        return { q: q.q, chosen: chosenOpt ? chosenOpt.text : "—", right: rightOpt ? rightOpt.text : "", isRight, explain: q.explain };
      });
      const pct = Math.round((correct / questions.length) * 100);
      const band = A.bands.slice().sort((a, b) => b.min - a.min).find((b) => pct >= b.min) || A.bands[0];
      resultEl.innerHTML = `
        <div class="result-head">
          <p class="result-eyebrow">${A.resultEyebrow || "Your score"}</p>
          <div class="score-badge"><span class="score-num" style="color:${band.color}">${correct}/${questions.length}</span><span class="score-den">${band.label}</span></div>
          <h3 class="result-title" style="color:${band.color}">${band.title}</h3>
          <p class="result-blurb">${band.blurb}</p>
        </div>
        <div class="review">
          ${reviews.map((r) => `
            <div class="review-item ${r.isRight ? "right" : "wrong"}">
              <div class="review-q">${r.q}</div>
              <div class="review-a">You said: <b class="${r.isRight ? "right" : "wrong"}">${esc(r.chosen)}</b>${r.isRight ? "" : ` · Correct: <b class="right">${esc(r.right)}</b>`}</div>
              ${r.explain ? `<div class="review-x">${r.explain}</div>` : ""}
            </div>`).join("")}
        </div>`;
    }

    function finishProfile() {
      const traits = A.traits;
      const sums = {}, maxes = {};
      Object.keys(traits).forEach((k) => { sums[k] = 0; maxes[k] = 0; });
      questions.forEach((q, i) => {
        maxes[q.trait] += 4;
        if (answers[i] != null) sums[q.trait] += q.options[answers[i]].value;
      });
      const order = A.traitOrder || Object.keys(traits);
      const pcts = {};
      order.forEach((k) => (pcts[k] = maxes[k] ? Math.round((sums[k] / maxes[k]) * 100) : 0));
      const bars = order.map((k) => {
        const t = traits[k];
        return `<div class="bar-row" style="--c:${t.color}"><span class="bar-key">${t.icon ? t.icon + " " : ""}${t.name}</span><span class="bar-track"><span class="bar-fill" style="width:0"></span></span><span class="bar-val">${pcts[k]}%</span></div>`;
      }).join("");
      const cells = order.map((k) => {
        const t = traits[k];
        const p = pcts[k];
        const level = p >= 60 ? "high" : p <= 40 ? "low" : "balanced";
        const text = level === "high" ? t.high : level === "low" ? t.low : (t.mid || "You sit in the balanced middle on this trait.");
        const lvlLabel = level === "high" ? "High" : level === "low" ? "Lower" : "Balanced";
        return `<div><h5 style="color:${t.color}">${t.name} — ${lvlLabel} (${p}%)</h5><p style="color:var(--ink-2)">${text}</p></div>`;
      }).join("");
      resultEl.innerHTML = `
        <div class="result-head">
          <p class="result-eyebrow">${A.resultEyebrow || "Your profile"}</p>
          <h3 class="result-title">${A.resultTitle || "Your profile"}</h3>
          <p class="result-blurb">${A.resultBlurb || ""}</p>
        </div>
        <div class="result-bars">${bars}</div>
        <div class="result-detail"><div class="rd-grid">${cells}</div></div>`;
      requestAnimationFrame(() => $$(".bar-fill", resultEl).forEach((el, i) => (el.style.width = `${pcts[order[i]]}%`)));
    }

    function finishAxes() {
      const axes = A.axes;
      const counts = {};
      axes.forEach((ax) => (counts[ax.key] = { L: 0, R: 0 }));
      questions.forEach((q, i) => {
        if (answers[i] != null) {
          const side = q.options[answers[i]].side;
          if (counts[q.axis]) counts[q.axis][side]++;
        }
      });
      let code = "";
      const rows = axes.map((ax) => {
        const c = counts[ax.key];
        const total = c.L + c.R || 1;
        const lPct = Math.round((c.L / total) * 100);
        const rPct = 100 - lPct;
        const winner = c.L >= c.R ? ax.left : ax.right;
        code += winner.code;
        const wPct = Math.max(lPct, rPct);
        return `<div class="bar-row" style="--c:${A.axisColor || "var(--accent)"}"><span class="bar-key">${ax.left.code} · ${ax.right.code}</span><span class="bar-track"><span class="bar-fill" style="width:0" data-w="${wPct}"></span></span><span class="bar-val">${winner.code} ${wPct}%</span></div>`;
      });
      const type = (A.types && A.types[code]) || { name: code, blurb: "", strengths: [], watch: [] };
      resultEl.innerHTML = `
        <div class="result-head">
          <p class="result-eyebrow">${A.resultEyebrow || "Your type"}</p>
          <h3 class="result-title" style="letter-spacing:2px">${code}${type.name ? ` · ${type.name}` : ""}</h3>
          <p class="result-blurb">${type.blurb || ""}</p>
        </div>
        <div class="result-bars">${rows.join("")}</div>
        ${type.strengths ? `<div class="result-detail"><div class="rd-grid">
          <div><h5>Strengths</h5><ul>${(type.strengths || []).map((s) => `<li>${s}</li>`).join("")}</ul></div>
          <div><h5>Watch-outs</h5><ul>${(type.watch || []).map((s) => `<li>${s}</li>`).join("")}</ul></div>
        </div></div>` : ""}`;
      requestAnimationFrame(() => $$(".bar-fill", resultEl).forEach((el) => (el.style.width = `${el.dataset.w}%`)));
    }

    backBtn.addEventListener("click", () => { if (idx > 0) { idx--; paint(); } });
    $('[data-action="start"]', shell).addEventListener("click", start);
    $('[data-action="restart"]', shell).addEventListener("click", () => show("intro"));
    $$('[data-action="print"]', shell).forEach((b) => b.addEventListener("click", () => window.print()));
  }

  function initAssessments() {
    mountAssessment($("#assessQuiz"), BOOK.assessment, { kicker: "testKicker", heading: "testHeading", sub: "testSub" });
    $("#navTest").textContent = BOOK.assessment.nav || "Assess";
    if (BOOK.assessment2) {
      $("#test2").hidden = false;
      $("#navTest2Li").hidden = false;
      $("#navTest2").textContent = BOOK.assessment2.nav || "More";
      mountAssessment($("#assessQuiz2"), BOOK.assessment2, { kicker: "testKicker2", heading: "testHeading2", sub: "testSub2" });
    }
  }

  /* ---- DISC colour cross-link ------------------------------------------- */
  function initDisc() {
    if (!BOOK.disc) return;
    const d = BOOK.disc;
    $("#disc").hidden = false;
    $("#navDiscLi").hidden = false;
    if (d.nav) $("#navDisc").textContent = d.nav;
    $("#discKicker").textContent = d.kicker || "The Four Colours";
    $("#discHeading").textContent = d.heading;
    $("#discSub").innerHTML = d.sub;
    const labels = d.labels || { relate: "How it shows up", reflect: "If this is you — self-reflect", treat: "How to handle them" };
    $("#discGrid").innerHTML = DISC_ORDER.map((k) => {
      const col = DISC_COLORS[k];
      const c = d.colors[k];
      return `
        <div class="disc-card" style="--c:${col.hex}">
          <div class="disc-head"><span class="disc-badge">${col.icon}</span><div><b>${col.name}</b><small>${col.label}</small></div></div>
          <div class="disc-block"><h5>${labels.relate}</h5><p>${c.relate}</p></div>
          <div class="disc-block"><h5>${labels.reflect}</h5><p>${c.reflect}</p></div>
          <div class="disc-block"><h5>${labels.treat}</h5><p>${c.treat}</p></div>
        </div>`;
    }).join("");
    const link = d.link || "../DISC-profile-SurroundedByIdiots/index.html";
    $("#discCta").innerHTML = `<a class="btn btn-primary" href="${link}">${d.linkLabel || "Explore the full DISC colour workshop →"}</a>`;
  }

  /* ---- Handle / tips ----------------------------------------------------- */
  function initTips() {
    $("#tipsGrid").innerHTML = BOOK.handle.cards
      .map((col) => `
        <div class="tip-card ${col.tone || ""}">
          <div class="tip-head"><span class="tip-badge">${col.icon}</span><b>${col.title}</b></div>
          <ul class="tip-list">${col.items.map((x) => `<li>${x}</li>`).join("")}</ul>
        </div>`)
      .join("");
  }

  /* ---- FAQ --------------------------------------------------------------- */
  function initFaq() {
    $("#faqList").innerHTML = BOOK.faq
      .map((f) => `<details class="faq-item"><summary>${f.q}</summary><div class="faq-a">${f.a}</div></details>`)
      .join("");
  }

  document.addEventListener("DOMContentLoaded", () => {
    initMeta();
    initNav();
    initLearn();
    initAssessments();
    initTips();
    initDisc();
    initFaq();
  });
})();
