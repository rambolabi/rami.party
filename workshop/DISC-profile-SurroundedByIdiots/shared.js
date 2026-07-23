/* =============================================================================
   The Four Colours — shared helpers (window.DUI)
   Reusable scoring, chart and content helpers shared by the main workshop
   (app.js), the forced-choice test and the communication cards.
   Depends on: data.js (DISC), Chart.js (global `Chart`) where charts are used.
   ========================================================================== */
window.DUI = (function () {
  "use strict";

  const ORDER = ["red", "yellow", "green", "blue"];
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
    const safe = {};
    ORDER.forEach((k) => (safe[k] = Math.max(0, scores[k] || 0)));
    const total = ORDER.reduce((s, k) => s + safe[k], 0) || 1;
    const floored = ORDER.map((k) => {
      const v = (safe[k] / total) * 100;
      return { k, f: Math.floor(v), rem: v - Math.floor(v) };
    });
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

  /* Alphabetical pair key, e.g. ("yellow","red") -> "red-yellow" */
  function pairKey(a, b) {
    return [a, b].sort().join("-");
  }

  /* ---- Charts ------------------------------------------------------------ */
  function radarDataset(pct, color, fillAlpha) {
    return {
      data: ORDER.map((k) => pct[k]),
      fill: true,
      backgroundColor: color.fill || "rgba(46,111,214,0.14)",
      borderColor: color.border || "rgba(46,111,214,0.9)",
      borderWidth: 2,
      pointBackgroundColor: color.points || ORDER.map((k) => hex(k)),
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
      label: color.label || "",
    };
  }

  function radarScale(maxVal) {
    return {
      r: {
        beginAtZero: true,
        suggestedMax: Math.max(50, Math.ceil(maxVal / 10) * 10),
        ticks: { display: false, stepSize: 10 },
        grid: { color: "rgba(20,24,31,0.10)" },
        angleLines: { color: "rgba(20,24,31,0.10)" },
        pointLabels: { font: { size: 13, weight: "700", family: "Inter" }, color: "#3b4453" },
      },
    };
  }

  function makeRadar(canvas, pct) {
    const maxVal = Math.max(...ORDER.map((k) => pct[k]));
    return new Chart(canvas, {
      type: "radar",
      data: { labels: ORDER.map((k) => name(k)), datasets: [radarDataset(pct, {})] },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        animation: { duration: 500 },
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `${c.label || ""} ${c.raw}%` } } },
        scales: radarScale(maxVal),
      },
    });
  }

  /* Overlay two profiles (natural vs adapted) on one radar */
  function makeRadarPair(canvas, pctA, pctB, labelA, labelB) {
    const maxVal = Math.max(...ORDER.map((k) => Math.max(pctA[k], pctB[k])));
    const dsA = radarDataset(pctA, {
      fill: "rgba(46,111,214,0.16)",
      border: "rgba(46,111,214,0.95)",
      points: ORDER.map((k) => hex(k)),
      label: labelA,
    });
    const dsB = radarDataset(pctB, {
      fill: "rgba(230,57,70,0.10)",
      border: "rgba(230,57,70,0.85)",
      points: "rgba(230,57,70,0.85)",
      label: labelB,
    });
    dsB.borderDash = [6, 5];
    return new Chart(canvas, {
      type: "radar",
      data: { labels: ORDER.map((k) => name(k)), datasets: [dsA, dsB] },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        animation: { duration: 500 },
        plugins: {
          legend: { display: true, position: "bottom", labels: { usePointStyle: true, boxWidth: 8, font: { size: 12, family: "Inter" } } },
          tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${c.raw}%` } },
        },
        scales: radarScale(maxVal),
      },
    });
  }

  function makeDoughnut(canvas, pct) {
    return new Chart(canvas, {
      type: "doughnut",
      data: {
        labels: ORDER.map((k) => name(k)),
        datasets: [{ data: ORDER.map((k) => pct[k]), backgroundColor: ORDER.map((k) => hex(k)), borderColor: "#fff", borderWidth: 3, hoverOffset: 8 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: "58%",
        animation: { duration: 450, easing: "easeOutQuart" },
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `${c.label}: ${c.raw}%` } } },
      },
    });
  }

  /* Horizontal bar rows (custom DOM) */
  function renderBars(container, pct, opts) {
    const winner = opts && opts.winner;
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

  /* ---- Blend narrative (Thomas Erikson guidance) ------------------------- */
  /* Always name the top two colours. If three or four colours sit close       */
  /* together, describe the person as a bigger situational mix.                */
  function blendText(pct, ranked, subject) {
    const self = subject !== "other";
    const Subj = self ? "You" : "They";
    const are = self ? "You're" : "They're";
    const your = self ? "your" : "their";
    const them = self ? "you" : "them";
    const they = self ? "you" : "they";
    const S = (k) => `<strong style="color:${hex(k)}">${name(k)}</strong>`;
    const [c1, c2, c3, c4] = ranked;

    const onlyOne = pct[c2] === 0 && pct[c3] === 0 && pct[c4] === 0;
    if (onlyOne) return `${Subj} score as an almost pure ${S(c1)} — a rare, unusually clear single-colour profile.`;

    const spread4 = pct[c1] - pct[c4];
    const spread3 = pct[c1] - pct[c3];
    const gap12 = pct[c1] - pct[c2];

    if (spread4 <= 12) {
      return `${are} an unusually even blend of all four colours — ${S(c1)}, ${S(c2)}, ${S(c3)} and ${S(c4)} sit close together. Rather than one fixed style, ${they} shift considerably depending on the situation and the people around ${them}. Read the moment before deciding which colour ${self ? "you're" : "they're"} showing.`;
    }
    if (spread3 <= 12) {
      return `${are} a broad three-colour blend of ${S(c1)}, ${S(c2)} and ${S(c3)}. ${Subj} draw on whichever fits the moment, so ${your} style flexes noticeably with the situation rather than staying fixed.`;
    }
    if (gap12 >= 20) return `${Subj} lead strongly with ${S(c1)}, backed by ${S(c2)} as ${your} clear secondary style.`;
    if (gap12 >= 8) return `${Subj} lead with ${S(c1)}, strongly supported by ${S(c2)} — a common two-colour blend.`;
    return `${are} an almost even blend of ${S(c1)} and ${S(c2)}, flexing fluidly between the two.`;
  }

  /* Should we point the reader at a two-colour communication card? */
  function blendPairLink(pct, ranked) {
    const [c1, c2, c3] = ranked;
    const spread3 = pct[c1] - pct[c3];
    const gap12 = pct[c1] - pct[c2];
    if (spread3 <= 12) return null; // three/four-way: no single pair
    if (pct[c2] === 0) return null; // effectively single
    if (gap12 <= 24) return pairKey(c1, c2); // meaningful secondary
    return null;
  }

  function resultDetailHTML(k, pct, ranked, subject) {
    const c = DISC.colors[k];
    const self = subject === "self";
    return `
      <h4 style="color:${c.hex}">${c.icon} ${c.name} — ${c.archetype}</h4>
      <p>${blendText(pct, ranked, self ? "self" : "other")}</p>
      <p>${c.summary}</p>
      <div class="rd-grid" style="--c:${c.hex}">
        <div><h5>Core strengths</h5><ul>${c.strengths.slice(0, 4).map((s) => `<li>${s}</li>`).join("")}</ul></div>
        <div><h5>Watch-outs</h5><ul>${c.weaknesses.slice(0, 4).map((s) => `<li>${s}</li>`).join("")}</ul></div>
        <div><h5>${self ? "You are" : "They are"} motivated by</h5><ul>${c.motivators.slice(0, 4).map((s) => `<li>${s}</li>`).join("")}</ul></div>
        <div><h5>${self ? "How you connect best" : "How to connect with them"}</h5><ul><li>${c.interact}</li></ul></div>
      </div>`;
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  }

  return {
    ORDER, hex, name, shuffle, toPercents, rank, pairKey,
    makeRadar, makeRadarPair, makeDoughnut, renderBars,
    blendText, blendPairLink, resultDetailHTML, escapeHTML,
  };
})();
