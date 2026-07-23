/* =============================================================================
   Surrounded By… — shared workshop engine
   Data-driven: reads the global BOOK object from data.js and renders the whole
   site. Supports three assessment modes: "score", "classify" and "quiz".
   ========================================================================== */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const A = BOOK.assessment;

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
    $("#heroEyebrow").textContent = m.eyebrow || "A Thomas Erikson Workshop";
    $("#heroTitle").innerHTML = m.heroTitle;
    $("#heroLead").innerHTML = m.heroLead;
    $("#heroCta").textContent = m.heroCta || "Take the assessment";

    $("#learnKicker").textContent = BOOK.learn.kicker;
    $("#learnHeading").textContent = BOOK.learn.heading;
    $("#learnSub").innerHTML = BOOK.learn.sub;

    $("#testKicker").textContent = A.kicker;
    $("#testHeading").textContent = A.heading;
    $("#testSub").innerHTML = A.sub;
    $("#navTest").textContent = A.nav || "Assess";
    $("#introIcon").textContent = A.icon || "📝";
    $("#introTitle").textContent = A.introTitle;
    $("#introText").innerHTML = A.introText;

    $("#handleKicker").textContent = BOOK.handle.kicker;
    $("#handleHeading").textContent = BOOK.handle.heading;
    $("#handleSub").innerHTML = BOOK.handle.sub;
    $("#navHandle").textContent = BOOK.handle.nav || "Handle";
    $("#resultCta").innerHTML = BOOK.handle.cta || "How to handle it →";

    $("#footerNote").innerHTML = m.footerNote;
    $("#footerSupport").innerHTML =
      `Want the full picture? <strong>Read <em>${esc(m.title)}</em> by Thomas Erikson</strong> — buy the book and support the author.`;
    $("#year").textContent = new Date().getFullYear();

    // hero mini cards
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
    const ids = ["learn", "test", "handle", "faq"];
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

  /* ---- Assessment engine ------------------------------------------------- */
  function initAssessment() {
    const shell = $("#assessQuiz");
    const stages = {
      intro: $('[data-stage="intro"]', shell),
      run: $('[data-stage="run"]', shell),
      result: $('[data-stage="result"]', shell),
    };
    const qEl = $("#aQ");
    const optsEl = $("#aOptions");
    const barEl = $("#aBar");
    const countEl = $("#aCount");
    const backBtn = $('[data-action="back"]', shell);

    let questions = [];
    let idx = 0;
    let answers = []; // stores chosen option index per question

    function show(stage) { Object.entries(stages).forEach(([n, el]) => (el.hidden = n !== stage)); }

    function start() {
      questions = (A.shuffle === false ? A.questions.slice() : shuffle(A.questions)).map((q) => ({
        ...q,
        options: A.shuffleOptions === false ? q.options.slice() : shuffle(q.options),
      }));
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
      if (A.mode === "classify") finishClassify();
      else if (A.mode === "quiz") finishQuiz();
      else finishScore();
      show("result");
      stages.result.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    /* score mode */
    function finishScore() {
      let sum = 0, max = 0;
      questions.forEach((q, i) => {
        const pts = q.options.map((o) => o.points || 0);
        max += Math.max(...pts);
        if (answers[i] != null) sum += q.options[answers[i]].points || 0;
      });
      const pct = max ? Math.round((sum / max) * 100) : 0;
      const band = A.bands.slice().sort((a, b) => b.min - a.min).find((b) => pct >= b.min) || A.bands[0];
      $("#aResult").innerHTML = `
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
      requestAnimationFrame(() => { const mk = $(".meter-marker"); if (mk) mk.style.left = `${pct}%`; });
    }

    /* classify mode */
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
      const bars = ranked
        .map((k) => {
          const cat = A.categories[k];
          const pct = Math.round((tally[k] / total) * 100);
          return `<div class="bar-row" style="--c:${cat.color}"><span class="bar-key">${cat.icon} ${cat.name}</span><span class="bar-track"><span class="bar-fill" style="width:0"></span></span><span class="bar-val">${pct}%</span></div>`;
        })
        .join("");
      $("#aResult").innerHTML = `
        <div class="result-head">
          <p class="result-eyebrow">${A.resultEyebrow || "The type around you"}</p>
          <h3 class="result-title" style="color:${c.color}">${c.icon} ${c.name}</h3>
          <p class="result-blurb">${c.summary}</p>
        </div>
        <div class="result-bars">${bars}</div>
        <div class="result-detail" style="--c:${c.color}">
          <h4 style="color:${c.color}">${c.name}</h4>
          <div class="rd-grid">
            <div><h5>Signs to watch</h5><ul>${c.signs.map((s) => `<li>${s}</li>`).join("")}</ul></div>
            <div><h5>How to handle them</h5><ul>${c.handle.map((s) => `<li>${s}</li>`).join("")}</ul></div>
          </div>
        </div>`;
      // animate bars
      const targets = ranked.map((k) => Math.round((tally[k] / total) * 100));
      requestAnimationFrame(() => $$(".result-bars .bar-fill").forEach((el, i) => (el.style.width = `${targets[i]}%`)));
    }

    /* quiz mode */
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
      $("#aResult").innerHTML = `
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

    backBtn.addEventListener("click", () => { if (idx > 0) { idx--; paint(); } });
    $('[data-action="start"]', shell).addEventListener("click", start);
    $('[data-action="restart"]', shell).addEventListener("click", () => show("intro"));
    $$('[data-action="print"]').forEach((b) => b.addEventListener("click", () => window.print()));
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
    initAssessment();
    initTips();
    initFaq();
  });
})();
