/* =============================================================================
   The Four Colours — DISC Workshop engine
   Handles navigation, colour content, interaction matrix, three assessments
   (self / observe / quick) and all Chart.js visualisations.
   Depends on: data.js (DISC), shared.js (window.DUI), Chart.js (global `Chart`).
   ========================================================================== */
(function () {
  "use strict";

  const {
    ORDER, hex, name, shuffle, toPercents, rank, pairKey,
    makeRadar, makeRadarPair, renderBars,
    blendPairLink, resultDetailHTML, escapeHTML,
  } = window.DUI;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ==========================================================================
     NAVIGATION
     ========================================================================== */
  function initNav() {
    const toggle = $(".nav-toggle");
    const links = $("#nav-links");
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    $$("[data-nav], .brand").forEach((a) =>
      a.addEventListener("click", () => {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );

    // Scroll spy
    const sections = ["learn", "self", "observe", "quick", "tips", "faq"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const navMap = {};
    $$(".nav-links a[data-nav]").forEach((a) => (navMap[a.getAttribute("href").slice(1)] = a));
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            $$(".nav-links a").forEach((a) => a.classList.remove("active"));
            const link = navMap[e.target.id];
            if (link) link.classList.add("active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* ==========================================================================
     LEARN — colour cards + detail drawer
     ========================================================================== */
  function initLearn() {
    const grid = $("#colorGrid");
    const detail = $("#colorDetail");

    grid.innerHTML = ORDER.map((k) => {
      const c = DISC.colors[k];
      return `
        <button class="color-card" data-color="${k}" style="--c:${c.hex}" aria-expanded="false">
          <span class="cc-icon">${c.icon}</span>
          <div class="cc-name">${c.name}</div>
          <div class="cc-label">${c.label}</div>
          <p class="cc-tag">${c.tagline}</p>
          <span class="cc-more">Explore ${c.name} →</span>
        </button>`;
    }).join("");

    let openKey = null;

    function renderDetail(k) {
      const c = DISC.colors[k];
      detail.style.setProperty("--c", c.hex);
      detail.innerHTML = `
        <div class="detail-top">
          <span class="detail-badge">${c.icon}</span>
          <div>
            <div class="detail-title">${c.name} — ${c.archetype}</div>
            <div class="detail-sub">${c.label}</div>
          </div>
          <button class="detail-close" aria-label="Close">✕</button>
        </div>
        <p class="detail-summary">${c.summary}</p>
        <div class="chips">${c.traits.map((t) => `<span class="chip">${t}</span>`).join("")}</div>
        <div class="detail-grid">
          <div class="detail-cell"><h4>Communication</h4><p>${c.communication}</p></div>
          <div class="detail-cell"><h4>Decision making</h4><p>${c.decisions}</p></div>
          <div class="detail-cell"><h4>Work environment</h4><p>${c.workEnv}</p></div>
          <div class="detail-cell"><h4>Under stress</h4><p>${c.stress}</p></div>
          <div class="detail-cell"><h4>Strengths</h4><ul>${c.strengths.map((s) => `<li>${s}</li>`).join("")}</ul></div>
          <div class="detail-cell neg"><h4>Watch-outs</h4><ul>${c.weaknesses.map((s) => `<li>${s}</li>`).join("")}</ul></div>
          <div class="detail-cell"><h4>Motivated by</h4><ul>${c.motivators.map((s) => `<li>${s}</li>`).join("")}</ul></div>
          <div class="detail-cell"><h4>How to connect</h4><p>${c.interact}</p></div>
        </div>`;
      $(".detail-close", detail).addEventListener("click", close);
    }

    function open(k) {
      openKey = k;
      $$(".color-card", grid).forEach((b) => {
        const on = b.dataset.color === k;
        b.classList.toggle("selected", on);
        b.setAttribute("aria-expanded", String(on));
      });
      renderDetail(k);
      detail.hidden = false;
    }
    function close() {
      openKey = null;
      $$(".color-card", grid).forEach((b) => {
        b.classList.remove("selected");
        b.setAttribute("aria-expanded", "false");
      });
      detail.hidden = true;
    }

    $$(".color-card", grid).forEach((b) =>
      b.addEventListener("click", () => (openKey === b.dataset.color ? close() : open(b.dataset.color)))
    );
  }

  /* ==========================================================================
     INTERACTION MATRIX
     ========================================================================== */
  function initMatrix() {
    const rowA = $("#matrixA");
    const rowB = $("#matrixB");
    const out = $("#matrixResult");
    const state = { a: null, b: null };

    function build(row, side) {
      row.innerHTML = ORDER.map((k) => {
        const c = DISC.colors[k];
        return `<button class="pick" data-k="${k}" style="--c:${c.hex}">${c.name}</button>`;
      }).join("");
      $$(".pick", row).forEach((btn) =>
        btn.addEventListener("click", () => {
          state[side] = btn.dataset.k;
          $$(".pick", row).forEach((p) => p.classList.toggle("on", p === btn));
          render();
        })
      );
    }

    function render() {
      if (!state.a || !state.b) {
        out.textContent = "Choose a colour in each row above.";
        return;
      }
      const text = DISC.interactions[state.a][state.b];
      out.innerHTML = `<span><strong style="color:${hex(state.a)}">${name(state.a)}</strong> &nbsp;meets&nbsp; <strong style="color:${hex(state.b)}">${name(state.b)}</strong> — ${text}</span>`;
    }

    build(rowA, "a");
    build(rowB, "b");
  }

  /* ==========================================================================
     SELF ASSESSMENT (Likert)
     ========================================================================== */
  function initSelf() {
    const shell = $("#selfQuiz");
    const stages = {
      intro: $('[data-stage="intro"]', shell),
      run: $('[data-stage="run"]', shell),
      result: $('[data-stage="result"]', shell),
    };
    const qEl = $("#selfQ");
    const barEl = $("#selfBar");
    const countEl = $("#selfCount");
    const backBtn = $('[data-action="back-self"]', shell);
    const likert = $("#selfLikert");
    let questions = [];
    let idx = 0;
    let answers = [];
    let chart = null;

    function show(stage) {
      Object.entries(stages).forEach(([n, el]) => (el.hidden = n !== stage));
    }

    function start() {
      questions = shuffle(DISC.selfQuestions);
      answers = new Array(questions.length).fill(null);
      idx = 0;
      show("run");
      paint();
    }

    function paint() {
      const q = questions[idx];
      qEl.textContent = q.text;
      barEl.style.width = `${(idx / questions.length) * 100}%`;
      countEl.textContent = `${idx + 1} / ${questions.length}`;
      backBtn.hidden = idx === 0;
      $$("button", likert).forEach((b) =>
        b.classList.toggle("chosen", answers[idx] === Number(b.dataset.score))
      );
    }

    function answer(score) {
      answers[idx] = score;
      if (idx < questions.length - 1) {
        idx++;
        paint();
      } else {
        finish();
      }
    }

    function finish() {
      const scores = { red: 0, yellow: 0, green: 0, blue: 0 };
      questions.forEach((q, i) => {
        // Map 1..5 to 0..4 weight so "neutral" contributes little
        scores[q.color] += (answers[i] || 3) - 1;
      });
      const pct = toPercents(scores);
      const ranked = rank(pct);
      const top = ranked[0];

      barEl.style.width = "100%";
      $("#selfResultTitle").innerHTML = `${DISC.colors[top].icon} ${name(top)} <span style="color:${hex(top)}">${DISC.colors[top].label}</span>`;
      $("#selfResultTitle").style.color = "var(--ink)";
      $("#selfResultBlurb").textContent = DISC.colors[top].tagline;
      renderBars($("#selfBars"), pct, { winner: top });
      $("#selfResultDetail").style.setProperty("--c", hex(top));
      $("#selfResultDetail").innerHTML = resultDetailHTML(top, pct, ranked, "self");

      const pk = blendPairLink(pct, ranked);
      $("#selfPairCta").innerHTML = pk
        ? `<a class="btn btn-ghost" href="communicate.html?c=${pk}">📇 Share your “How to communicate with me” card →</a>`
        : `<a class="btn btn-ghost" href="communicate.html?c=${top}">📇 Share your ${name(top)} communication card →</a>`;

      if (chart) chart.destroy();
      show("result");
      chart = makeRadar($("#selfChart"), pct);
      stages.result.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    $$("button", likert).forEach((b) =>
      b.addEventListener("click", () => answer(Number(b.dataset.score)))
    );
    backBtn.addEventListener("click", () => {
      if (idx > 0) {
        idx--;
        paint();
      }
    });
    $('[data-action="start-self"]', shell).addEventListener("click", start);
    $('[data-action="restart-self"]', shell).addEventListener("click", () => {
      show("intro");
    });
  }

  /* ==========================================================================
     OBSERVE OTHERS — two passes: natural style (live) + adapted/under-pressure
     ========================================================================== */
  function initObserve() {
    const shell = $("#obsQuiz");
    const stages = {
      intro: $('[data-stage="intro"]', shell),
      run: $('[data-stage="run"]', shell),
      bridge: $('[data-stage="bridge"]', shell),
      adapt: $('[data-stage="adapt"]', shell),
      result: $('[data-stage="result"]', shell),
    };
    const nameInput = $("#obsName");
    const whoEl = $("#obsWho");
    // Pass 1 (natural)
    const qEl = $("#obsQ");
    const optsEl = $("#obsOptions");
    const barEl = $("#obsBar");
    const countEl = $("#obsCount");
    const backBtn = $('[data-action="back-obs"]', shell);
    const leadEl = $("#obsLead");
    // Pass 2 (adapted)
    const aqEl = $("#obsAdaptQ");
    const aOptsEl = $("#obsAdaptOptions");
    const aBarEl = $("#obsAdaptBar");
    const aCountEl = $("#obsAdaptCount");
    const aBackBtn = $('[data-action="back-adapt"]', shell);

    let natQ = [], natA = [], natIdx = 0;
    let adaptQ = [], adaptA = [], adaptIdx = 0;
    let subjectName = "";
    let liveChart = null, resultChart = null;

    const who = () => (subjectName ? escapeHTML(subjectName) : "they");
    const Who = () => (subjectName ? escapeHTML(subjectName) : "They");

    function show(stage) {
      Object.entries(stages).forEach(([n, el]) => (el.hidden = n !== stage));
    }
    function tally(answers, upTo) {
      const s = { red: 0, yellow: 0, green: 0, blue: 0 };
      for (let i = 0; i < upTo; i++) if (answers[i]) s[answers[i]]++;
      return s;
    }

    /* ----- Pass 1: natural ----- */
    function start() {
      subjectName = (nameInput.value || "").trim();
      natQ = shuffle(DISC.othersQuestions);
      natA = new Array(natQ.length).fill(null);
      natIdx = 0;
      whoEl.innerHTML = subjectName ? `Reading: <b>${escapeHTML(subjectName)}</b> · natural style` : "Reading: <b>this person</b> · natural style";
      show("run");
      if (liveChart) liveChart.destroy();
      liveChart = makeRadar($("#obsChart"), { red: 0, yellow: 0, green: 0, blue: 0 });
      updateLive(0);
      paintNat();
    }
    function paintNat() {
      const q = natQ[natIdx];
      qEl.textContent = q.q;
      barEl.style.width = `${(natIdx / natQ.length) * 100}%`;
      countEl.textContent = `${natIdx + 1} / ${natQ.length}`;
      backBtn.hidden = natIdx === 0;
      optsEl.innerHTML = q.options
        .map((o) => `<button class="opt${natA[natIdx] === o.color ? " chosen" : ""}" data-c="${o.color}" style="--c:${hex(o.color)}">${o.text}</button>`)
        .join("");
      $$(".opt", optsEl).forEach((b) => b.addEventListener("click", () => answerNat(b.dataset.c)));
    }
    function updateLive(count) {
      const pct = toPercents(tally(natA, count));
      if (count === 0) {
        leadEl.textContent = "Answer to begin…";
        renderBars($("#obsLiveBars"), { red: 0, yellow: 0, green: 0, blue: 0 });
        if (liveChart) { liveChart.data.datasets[0].data = [0, 0, 0, 0]; liveChart.update(); }
        return;
      }
      const top = rank(pct)[0];
      leadEl.innerHTML = `<span style="color:${hex(top)}">${DISC.colors[top].icon} ${name(top)}</span> leading`;
      renderBars($("#obsLiveBars"), pct, { winner: top });
      if (liveChart) {
        liveChart.data.datasets[0].data = ORDER.map((k) => pct[k]);
        liveChart.data.datasets[0].borderColor = hex(top);
        liveChart.data.datasets[0].backgroundColor = DISC.colors[top].soft;
        liveChart.update();
      }
    }
    function answerNat(color) {
      natA[natIdx] = color;
      updateLive(natIdx + 1);
      if (natIdx < natQ.length - 1) { natIdx++; paintNat(); }
      else toBridge();
    }

    /* ----- Bridge into pass 2 ----- */
    function toBridge() {
      const pct = toPercents(tally(natA, natQ.length));
      const top = rank(pct)[0];
      $("#obsBridgeText").innerHTML =
        `At their natural best, ${who()} read as mostly <strong style="color:${hex(top)}">${name(top)}</strong>. ` +
        `Now, six quick questions on how ${who()} behave <em>under pressure</em> — their <strong>adapted</strong> style.`;
      show("bridge");
      stages.bridge.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    /* ----- Pass 2: adapted ----- */
    function startAdapt() {
      adaptQ = shuffle(DISC.othersAdaptedQuestions);
      adaptA = new Array(adaptQ.length).fill(null);
      adaptIdx = 0;
      show("adapt");
      paintAdapt();
    }
    function paintAdapt() {
      const q = adaptQ[adaptIdx];
      aqEl.textContent = q.q;
      aBarEl.style.width = `${(adaptIdx / adaptQ.length) * 100}%`;
      aCountEl.textContent = `${adaptIdx + 1} / ${adaptQ.length}`;
      aBackBtn.hidden = false;
      aOptsEl.innerHTML = q.options
        .map((o) => `<button class="opt${adaptA[adaptIdx] === o.color ? " chosen" : ""}" data-c="${o.color}" style="--c:${hex(o.color)}">${o.text}</button>`)
        .join("");
      $$(".opt", aOptsEl).forEach((b) => b.addEventListener("click", () => answerAdapt(b.dataset.c)));
    }
    function answerAdapt(color) {
      adaptA[adaptIdx] = color;
      if (adaptIdx < adaptQ.length - 1) { adaptIdx++; paintAdapt(); }
      else finish();
    }

    /* ----- Combined result ----- */
    function shiftNote(natPct, adaptPct, natTop, adaptTop) {
      let riser = null, riseAmt = -Infinity, faller = null, fallAmt = Infinity;
      ORDER.forEach((k) => {
        const d = adaptPct[k] - natPct[k];
        if (d > riseAmt) { riseAmt = d; riser = k; }
        if (d < fallAmt) { fallAmt = d; faller = k; }
      });
      if (natTop === adaptTop && riseAmt < 12) {
        return `<h4>Natural vs. under pressure</h4><p>${Who()} stay fairly consistent — <strong style="color:${hex(natTop)}">${name(natTop)}</strong> leads whether relaxed or stretched. What you see is close to what you get.</p>`;
      }
      return `<h4>Natural vs. under pressure</h4><p>At ease, ${who()} lead with <strong style="color:${hex(natTop)}">${name(natTop)}</strong>. Under pressure ${who()} shift toward <strong style="color:${hex(adaptTop)}">${name(adaptTop)}</strong> — the <strong style="color:${hex(riser)}">${name(riser)}</strong> side rises while <strong style="color:${hex(faller)}">${name(faller)}</strong> fades. Expect a noticeably different person on a stressful day, and adjust how you approach ${who()}.</p>`;
    }

    function finish() {
      const natPct = toPercents(tally(natA, natQ.length));
      const adaptPct = toPercents(tally(adaptA, adaptQ.length));
      const natRank = rank(natPct);
      const natTop = natRank[0];
      const adaptTop = rank(adaptPct)[0];
      const gap = natPct[natRank[0]] - natPct[natRank[1]];
      const confidence = gap >= 25 ? "High confidence" : gap >= 12 ? "Moderate confidence" : "Low confidence — a genuine blend";

      $("#obsResultEyebrow").textContent = subjectName ? `${subjectName}'s natural style` : "Their natural style";
      $("#obsResultTitle").innerHTML = `${DISC.colors[natTop].icon} ${name(natTop)} <span style="color:${hex(natTop)}">${DISC.colors[natTop].label}</span>`;
      $("#obsResultBlurb").textContent = DISC.colors[natTop].tagline;
      $("#obsConfidence").textContent = confidence;
      renderBars($("#obsResultBars"), natPct, { winner: natTop });
      $("#obsResultDetail").style.setProperty("--c", hex(natTop));
      $("#obsResultDetail").innerHTML = resultDetailHTML(natTop, natPct, natRank, "other");
      $("#obsShift").style.setProperty("--c", hex(adaptTop));
      $("#obsShift").innerHTML = shiftNote(natPct, adaptPct, natTop, adaptTop);

      const pk = blendPairLink(natPct, natRank);
      const ctaEl = $("#obsPairCta");
      ctaEl.innerHTML = pk
        ? `<a class="btn btn-ghost" href="communicate.html?c=${pk}">📇 Their “How to communicate with them” card →</a>`
        : `<a class="btn btn-ghost" href="communicate.html?c=${natTop}">📇 The ${name(natTop)} communication card →</a>`;

      if (resultChart) resultChart.destroy();
      show("result");
      resultChart = makeRadarPair($("#obsResultChart"), natPct, adaptPct, "Natural", "Under pressure");
      stages.result.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    /* ----- Wiring ----- */
    $('[data-action="start-obs"]', shell).addEventListener("click", start);
    nameInput.addEventListener("keydown", (e) => { if (e.key === "Enter") start(); });
    backBtn.addEventListener("click", () => { if (natIdx > 0) { natIdx--; updateLive(natIdx); paintNat(); } });
    $('[data-action="start-adapt"]', shell).addEventListener("click", startAdapt);
    aBackBtn.addEventListener("click", () => {
      if (adaptIdx > 0) { adaptIdx--; paintAdapt(); }
      else show("bridge");
    });
    $('[data-action="restart-obs"]', shell).addEventListener("click", () => {
      nameInput.value = "";
      show("intro");
    });
  }

  /* ==========================================================================
     QUICK IDENTIFIER
     ========================================================================== */
  function initQuick() {
    const shell = $("#quickQuiz");
    const stages = {
      run: $('[data-stage="run"]', shell),
      result: $('[data-stage="result"]', shell),
    };
    const qEl = $("#quickQ");
    const optsEl = $("#quickOptions");
    const dotsEl = $("#quickDots");
    const qs = DISC.quickQuestions;
    let idx = 0;
    let scores = {};

    function show(stage) {
      Object.entries(stages).forEach(([n, el]) => (el.hidden = n !== stage));
    }

    function start() {
      idx = 0;
      scores = { red: 0, yellow: 0, green: 0, blue: 0 };
      show("run");
      paint();
    }

    function paint() {
      const q = qs[idx];
      qEl.textContent = q.q;
      optsEl.innerHTML = q.options
        .map((o) => `<button class="opt" data-c="${o.color}" style="--c:${hex(o.color)}">${o.text}</button>`)
        .join("");
      $$(".opt", optsEl).forEach((b) => b.addEventListener("click", () => answer(b.dataset.c)));
      dotsEl.innerHTML = qs.map((_, i) => `<i class="${i < idx ? "done" : ""}"></i>`).join("");
    }

    function answer(color) {
      scores[color]++;
      if (idx < qs.length - 1) {
        idx++;
        paint();
      } else {
        finish();
      }
    }

    function finish() {
      const top = rank(toPercents(scores))[0];
      const c = DISC.colors[top];
      $("#quickResult").style.setProperty("--c", c.hex);
      $("#quickResult").innerHTML = `
        <div class="qr-badge">${c.icon}</div>
        <h3>${c.name}</h3>
        <div class="qr-label">${c.archetype} · ${c.label}</div>
        <p>${c.summary}</p>`;
      show("result");
    }

    $('[data-action="restart-quick"]', shell).addEventListener("click", start);
    start();
  }

  /* ==========================================================================
     COMMUNICATION CARD LINKS
     ========================================================================== */
  function initCards() {
    const singles = $("#cardsSingles");
    const pairs = $("#cardsPairs");
    if (!singles || !pairs) return;

    singles.innerHTML = ORDER.map((k) => {
      const c = DISC.colors[k];
      return `
        <a class="comm-link" href="communicate.html?c=${k}" style="--c:${c.hex}">
          <span class="comm-link-icon">${c.icon}</span>
          <span class="comm-link-body">
            <b>${c.name}</b>
            <small>${DISC.comms[k].essence}</small>
          </span>
          <span class="comm-link-go">→</span>
        </a>`;
    }).join("");

    const combos = [];
    for (let i = 0; i < ORDER.length; i++)
      for (let j = i + 1; j < ORDER.length; j++) combos.push([ORDER[i], ORDER[j]]);

    pairs.innerHTML = combos.map(([a, b]) => {
      const key = pairKey(a, b);
      const p = DISC.pairComms[key];
      return `
        <a class="comm-link comm-link-pair" href="communicate.html?c=${key}" style="--c1:${hex(a)};--c2:${hex(b)}">
          <span class="comm-link-duo"><i style="background:${hex(a)}"></i><i style="background:${hex(b)}"></i></span>
          <span class="comm-link-body">
            <b>${p.title}</b>
            <small>${DISC.colors[a].archetype} + ${DISC.colors[b].archetype}</small>
          </span>
          <span class="comm-link-go">→</span>
        </a>`;
    }).join("");
  }

  /* ==========================================================================
     TIPS + FAQ
     ========================================================================== */
  function initTips() {
    $("#tipsGrid").innerHTML = ORDER.map((k) => {
      const c = DISC.colors[k];
      const t = DISC.tips[k];
      return `
        <div class="tip-card" style="--c:${c.hex}">
          <div class="tip-head">
            <span class="tip-badge">${c.icon}</span>
            <b>${c.name}</b>
          </div>
          <ul class="tip-list do">
            <h5>Do</h5>
            ${t.do.map((x) => `<li>${x}</li>`).join("")}
          </ul>
          <ul class="tip-list dont last">
            <h5>Don't</h5>
            ${t.dont.map((x) => `<li>${x}</li>`).join("")}
          </ul>
        </div>`;
    }).join("");
  }

  function initFaq() {
    $("#faqList").innerHTML = DISC.faq
      .map(
        (f) => `
        <details class="faq-item">
          <summary>${f.q}</summary>
          <div class="faq-a">${f.a}</div>
        </details>`
      )
      .join("");
  }

  /* ==========================================================================
     UTIL
     ========================================================================== */
  function initMisc() {
    const y = $("#year");
    if (y) y.textContent = new Date().getFullYear();
    $$('[data-action="print"]').forEach((b) => b.addEventListener("click", () => window.print()));
  }

  /* ==========================================================================
     BOOT
     ========================================================================== */
  document.addEventListener("DOMContentLoaded", () => {
    Chart.defaults.font.family = "Inter, system-ui, sans-serif";
    initNav();
    initLearn();
    initMatrix();
    initSelf();
    initObserve();
    initQuick();
    initCards();
    initTips();
    initFaq();
    initMisc();
  });
})();
