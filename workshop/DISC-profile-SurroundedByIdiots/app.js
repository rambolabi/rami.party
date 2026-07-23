/* =============================================================================
   The Four Colours — DISC Workshop engine
   Handles navigation, colour content, interaction matrix, three assessments
   (self / observe / quick) and all Chart.js visualisations.
   Depends on: data.js (DISC), Chart.js (global `Chart`).
   ========================================================================== */
(function () {
  "use strict";

  const ORDER = ["red", "yellow", "green", "blue"];
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const hex = (k) => DISC.colors[k].hex;
  const name = (k) => DISC.colors[k].name;

  /* Fisher–Yates shuffle (returns a new array) */
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* Convert raw per-colour scores to rounded percentages summing to 100 */
  function toPercents(scores) {
    const total = ORDER.reduce((s, k) => s + (scores[k] || 0), 0) || 1;
    const raw = ORDER.map((k) => ({ k, v: (scores[k] || 0) / total * 100 }));
    // Largest-remainder rounding so values sum to exactly 100
    const floored = raw.map((r) => ({ k: r.k, f: Math.floor(r.v), rem: r.v - Math.floor(r.v) }));
    let remainder = 100 - floored.reduce((s, r) => s + r.f, 0);
    floored.sort((a, b) => b.rem - a.rem);
    for (let i = 0; i < floored.length && remainder > 0; i++, remainder--) floored[i].f++;
    const out = {};
    floored.forEach((r) => (out[r.k] = r.f));
    return out;
  }

  /* Rank colours by percentage, descending */
  function rank(pct) {
    return ORDER.slice().sort((a, b) => pct[b] - pct[a]);
  }

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
     CHART HELPERS (Chart.js radar)
     ========================================================================== */
  function makeRadar(canvas, pct) {
    const data = ORDER.map((k) => pct[k]);
    return new Chart(canvas, {
      type: "radar",
      data: {
        labels: ORDER.map((k) => name(k)),
        datasets: [
          {
            data,
            fill: true,
            backgroundColor: "rgba(46,111,214,0.14)",
            borderColor: "rgba(46,111,214,0.9)",
            borderWidth: 2,
            pointBackgroundColor: ORDER.map((k) => hex(k)),
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        animation: { duration: 500 },
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `${c.label}: ${c.raw}%` } } },
        scales: {
          r: {
            beginAtZero: true,
            suggestedMax: Math.max(50, Math.ceil(Math.max(...data) / 10) * 10),
            ticks: { display: false, stepSize: 10 },
            grid: { color: "rgba(20,24,31,0.10)" },
            angleLines: { color: "rgba(20,24,31,0.10)" },
            pointLabels: { font: { size: 13, weight: "700", family: "Inter" }, color: "#3b4453" },
          },
        },
      },
    });
  }

  function makeDoughnut(canvas, pct) {
    return new Chart(canvas, {
      type: "doughnut",
      data: {
        labels: ORDER.map((k) => name(k)),
        datasets: [
          {
            data: ORDER.map((k) => pct[k]),
            backgroundColor: ORDER.map((k) => hex(k)),
            borderColor: "#fff",
            borderWidth: 3,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: "58%",
        animation: { duration: 450, easing: "easeOutQuart" },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => `${c.label}: ${c.raw}%` } },
        },
      },
    });
  }

  /* Horizontal bar rows (custom DOM, used for self/observe/live) */
  function renderBars(container, pct, { winner } = {}) {
    container.innerHTML = ORDER.map((k) => {
      const c = DISC.colors[k];
      const isWin = winner === k;
      return `
        <div class="bar-row" style="--c:${c.hex}">
          <span class="bar-key" style="color:${isWin ? c.hex : ""}">${c.name}</span>
          <span class="bar-track"><span class="bar-fill" style="width:${pct[k]}%"></span></span>
          <span class="bar-val">${pct[k]}%</span>
        </div>`;
    }).join("");
  }

  /* Blend description for the result detail block */
  function blendText(pct, ranked) {
    const top = ranked[0];
    const second = ranked[1];
    const gap = pct[top] - pct[second];
    if (gap >= 22) return `You lead clearly with <strong style="color:${hex(top)}">${name(top)}</strong>. This is your dominant, most natural style.`;
    if (gap >= 8) return `You lead with <strong style="color:${hex(top)}">${name(top)}</strong>, strongly supported by <strong style="color:${hex(second)}">${name(second)}</strong> — a common two-colour blend.`;
    return `You're a close blend of <strong style="color:${hex(top)}">${name(top)}</strong> and <strong style="color:${hex(second)}">${name(second)}</strong>. You flex fluidly between these styles.`;
  }

  function resultDetailHTML(k, pct, ranked, subject) {
    const c = DISC.colors[k];
    const who = subject === "self" ? "You" : "They";
    return `
      <h4 style="color:${c.hex}">${c.icon} ${c.name} — ${c.archetype}</h4>
      <p>${blendText(pct, ranked)}</p>
      <p>${c.summary}</p>
      <div class="rd-grid" style="--c:${c.hex}">
        <div><h5>Core strengths</h5><ul>${c.strengths.slice(0, 4).map((s) => `<li>${s}</li>`).join("")}</ul></div>
        <div><h5>Watch-outs</h5><ul>${c.weaknesses.slice(0, 4).map((s) => `<li>${s}</li>`).join("")}</ul></div>
        <div><h5>${who === "You" ? "You are" : "They are"} motivated by</h5><ul>${c.motivators.slice(0, 4).map((s) => `<li>${s}</li>`).join("")}</ul></div>
        <div><h5>${subject === "self" ? "How you connect best" : "How to connect with them"}</h5><ul><li>${c.interact}</li></ul></div>
      </div>`;
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
     OBSERVE OTHERS (live radar)
     ========================================================================== */
  function initObserve() {
    const shell = $("#obsQuiz");
    const stages = {
      intro: $('[data-stage="intro"]', shell),
      run: $('[data-stage="run"]', shell),
      result: $('[data-stage="result"]', shell),
    };
    const nameInput = $("#obsName");
    const whoEl = $("#obsWho");
    const qEl = $("#obsQ");
    const optsEl = $("#obsOptions");
    const barEl = $("#obsBar");
    const countEl = $("#obsCount");
    const backBtn = $('[data-action="back-obs"]', shell);
    const leadEl = $("#obsLead");
    let questions = [];
    let idx = 0;
    let answers = [];
    let subjectName = "";
    let liveChart = null;
    let resultChart = null;

    function show(stage) {
      Object.entries(stages).forEach(([n, el]) => (el.hidden = n !== stage));
    }

    function tally(upTo) {
      const scores = { red: 0, yellow: 0, green: 0, blue: 0 };
      for (let i = 0; i < upTo; i++) if (answers[i]) scores[answers[i]]++;
      return scores;
    }

    function start() {
      subjectName = (nameInput.value || "").trim();
      questions = shuffle(DISC.othersQuestions);
      answers = new Array(questions.length).fill(null);
      idx = 0;
      whoEl.innerHTML = subjectName ? `Reading: <b>${escapeHTML(subjectName)}</b>` : "Reading: <b>this person</b>";
      show("run");
      if (liveChart) liveChart.destroy();
      liveChart = makeRadar($("#obsChart"), { red: 0, yellow: 0, green: 0, blue: 0 });
      updateLive(0);
      paint();
    }

    function paint() {
      const q = questions[idx];
      qEl.textContent = q.q;
      barEl.style.width = `${(idx / questions.length) * 100}%`;
      countEl.textContent = `${idx + 1} / ${questions.length}`;
      backBtn.hidden = idx === 0;
      optsEl.innerHTML = q.options
        .map((o) => `<button class="opt${answers[idx] === o.color ? " chosen" : ""}" data-c="${o.color}" style="--c:${hex(o.color)}">${o.text}</button>`)
        .join("");
      $$(".opt", optsEl).forEach((b) => b.addEventListener("click", () => answer(b.dataset.c)));
    }

    function updateLive(count) {
      const scores = tally(count);
      const pct = toPercents(scores);
      if (count === 0) {
        leadEl.textContent = "Answer to begin…";
        renderBars($("#obsLiveBars"), { red: 0, yellow: 0, green: 0, blue: 0 });
        if (liveChart) {
          liveChart.data.datasets[0].data = [0, 0, 0, 0];
          liveChart.update();
        }
        return;
      }
      const ranked = rank(pct);
      const top = ranked[0];
      leadEl.innerHTML = `<span style="color:${hex(top)}">${DISC.colors[top].icon} ${name(top)}</span> leading`;
      renderBars($("#obsLiveBars"), pct, { winner: top });
      if (liveChart) {
        liveChart.data.datasets[0].data = ORDER.map((k) => pct[k]);
        liveChart.data.datasets[0].borderColor = hex(top);
        liveChart.data.datasets[0].backgroundColor = DISC.colors[top].soft;
        liveChart.update();
      }
    }

    function answer(color) {
      answers[idx] = color;
      updateLive(idx + 1);
      if (idx < questions.length - 1) {
        idx++;
        paint();
      } else {
        finish();
      }
    }

    function finish() {
      const scores = tally(questions.length);
      const pct = toPercents(scores);
      const ranked = rank(pct);
      const top = ranked[0];
      const gap = pct[ranked[0]] - pct[ranked[1]];
      const confidence = gap >= 25 ? "High confidence" : gap >= 12 ? "Moderate confidence" : "Low confidence — a genuine blend";

      barEl.style.width = "100%";
      $("#obsResultEyebrow").textContent = subjectName ? `${subjectName}'s dominant style` : "Their dominant style";
      $("#obsResultTitle").innerHTML = `${DISC.colors[top].icon} ${name(top)} <span style="color:${hex(top)}">${DISC.colors[top].label}</span>`;
      $("#obsResultBlurb").textContent = DISC.colors[top].tagline;
      $("#obsConfidence").textContent = confidence;
      renderBars($("#obsResultBars"), pct, { winner: top });
      $("#obsResultDetail").style.setProperty("--c", hex(top));
      $("#obsResultDetail").innerHTML = resultDetailHTML(top, pct, ranked, "other");

      if (resultChart) resultChart.destroy();
      show("result");
      resultChart = makeDoughnut($("#obsResultChart"), pct);
      stages.result.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    $('[data-action="start-obs"]', shell).addEventListener("click", start);
    nameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") start();
    });
    backBtn.addEventListener("click", () => {
      if (idx > 0) {
        idx--;
        updateLive(idx);
        paint();
      }
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
  function escapeHTML(s) {
    return s.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  }

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
    initTips();
    initFaq();
    initMisc();
  });
})();
