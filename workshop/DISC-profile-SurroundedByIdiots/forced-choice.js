/* =============================================================================
   Forced-choice (ipsative) self-test.
   For each group of four words the taker marks MOST (+2) and LEAST (-1) like
   them. Scores are shifted non-negative and shown as a percentage balance.
   Depends on: data.js (DISC), shared.js (window.DUI), Chart.js.
   ========================================================================== */
(function () {
  "use strict";

  const { ORDER, hex, name, shuffle, toPercents, rank, makeRadar, renderBars, blendPairLink, resultDetailHTML } = window.DUI;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const shell = $("#fcQuiz");
  const stages = {
    intro: $('[data-stage="intro"]', shell),
    run: $('[data-stage="run"]', shell),
    result: $('[data-stage="result"]', shell),
  };
  const rowsEl = $("#fcRows");
  const barEl = $("#fcBar");
  const countEl = $("#fcCount");
  const backBtn = $('[data-action="fc-back"]', shell);

  let groups = [];        // shuffled groups, each: [{color,word}, …]
  let picks = [];         // per group: { most: color|null, least: color|null }
  let idx = 0;
  let chart = null;

  function show(stage) {
    Object.entries(stages).forEach(([n, el]) => (el.hidden = n !== stage));
  }

  function start() {
    groups = shuffle(DISC.forcedChoiceGroups).map((g) => shuffle(ORDER.map((k) => ({ color: k, word: g[k] }))));
    picks = groups.map(() => ({ most: null, least: null }));
    idx = 0;
    show("run");
    paint();
  }

  function paint() {
    barEl.style.width = `${(idx / groups.length) * 100}%`;
    countEl.textContent = `${idx + 1} / ${groups.length}`;
    backBtn.hidden = idx === 0;
    const g = groups[idx];
    const p = picks[idx];
    rowsEl.innerHTML = g
      .map(
        (o) => `
      <div class="fc-row${p.most === o.color ? " is-most" : ""}${p.least === o.color ? " is-least" : ""}" data-c="${o.color}">
        <span class="fc-word">${o.word}</span>
        <div class="fc-btns">
          <button class="fc-most" data-pick="most" aria-label="Most like me">Most</button>
          <button class="fc-least" data-pick="least" aria-label="Least like me">Least</button>
        </div>
      </div>`
      )
      .join("");

    $$(".fc-row", rowsEl).forEach((row) => {
      const color = row.dataset.c;
      $(".fc-most", row).addEventListener("click", () => choose("most", color));
      $(".fc-least", row).addEventListener("click", () => choose("least", color));
    });
  }

  function choose(kind, color) {
    const p = picks[idx];
    if (kind === "most") {
      p.most = p.most === color ? null : color;
      if (p.least === color) p.least = null; // can't be both
    } else {
      p.least = p.least === color ? null : color;
      if (p.most === color) p.most = null;
    }
    paint();
    if (p.most && p.least) {
      // brief pause so the selection is visible, then advance
      setTimeout(() => {
        if (idx < groups.length - 1) { idx++; paint(); }
        else finish();
      }, 260);
    }
  }

  function finish() {
    const raw = { red: 0, yellow: 0, green: 0, blue: 0 };
    picks.forEach((p) => {
      if (p.most) raw[p.most] += 2;
      if (p.least) raw[p.least] -= 1;
    });
    // Shift so the lowest colour sits at zero, then convert to percentages
    const min = Math.min(...ORDER.map((k) => raw[k]));
    const shifted = {};
    ORDER.forEach((k) => (shifted[k] = raw[k] - min));
    const pct = toPercents(shifted);
    const ranked = rank(pct);
    const top = ranked[0];

    barEl.style.width = "100%";
    $("#fcResultTitle").innerHTML = `${DISC.colors[top].icon} ${name(top)} <span style="color:${hex(top)}">${DISC.colors[top].label}</span>`;
    $("#fcResultBlurb").textContent = DISC.colors[top].tagline;
    renderBars($("#fcBars"), pct, { winner: top });
    $("#fcResultDetail").style.setProperty("--c", hex(top));
    $("#fcResultDetail").innerHTML = resultDetailHTML(top, pct, ranked, "self");

    const pk = blendPairLink(pct, ranked);
    $("#fcPairCta").innerHTML = pk
      ? `<a class="btn btn-ghost" href="communicate.html?c=${pk}">📇 Your “How to communicate with me” card →</a>`
      : `<a class="btn btn-ghost" href="communicate.html?c=${top}">📇 Your ${name(top)} communication card →</a>`;

    if (chart) chart.destroy();
    show("result");
    chart = makeRadar($("#fcChart"), pct);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  backBtn.addEventListener("click", () => {
    if (idx > 0) { idx--; paint(); }
  });
  $('[data-action="fc-start"]', shell).addEventListener("click", start);
  $('[data-action="fc-restart"]', shell).addEventListener("click", () => show("intro"));
  $$('[data-action="print"]').forEach((b) => b.addEventListener("click", () => window.print()));

  document.addEventListener("DOMContentLoaded", () => {
    Chart.defaults.font.family = "Inter, system-ui, sans-serif";
    const y = $("#year");
    if (y) y.textContent = new Date().getFullYear();
  });
})();
