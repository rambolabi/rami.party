/* =============================================================================
   Communication card page — renders a shareable "how to communicate with…"
   card for a single colour (?c=red) or a two-colour blend (?c=red-yellow).
   Depends on: data.js (DISC), shared.js (window.DUI).
   ========================================================================== */
(function () {
  "use strict";

  const { ORDER, hex, name, pairKey, escapeHTML } = window.DUI;
  const $ = (s) => document.querySelector(s);
  const SINGLES = ORDER;

  /* ---- Resolve the requested card from the URL --------------------------- */
  function resolve() {
    const raw = (new URLSearchParams(location.search).get("c") || "red").toLowerCase().trim();
    if (raw.includes("-")) {
      const parts = raw.split("-").filter((p) => SINGLES.includes(p));
      if (parts.length === 2 && parts[0] !== parts[1]) {
        const key = pairKey(parts[0], parts[1]);
        if (DISC.pairComms[key]) return { type: "pair", key };
      }
    }
    if (SINGLES.includes(raw)) return { type: "single", key: raw };
    return { type: "single", key: "red" };
  }

  /* ---- Single-colour card ------------------------------------------------ */
  function renderSingle(k) {
    const c = DISC.colors[k];
    const m = DISC.comms[k];
    const t = DISC.tips[k];
    document.title = `How to communicate with a ${c.name} — DISC Communication Card`;

    $("#commHero").style.setProperty("--c", c.hex);
    $("#commHero").innerHTML = `
      <div class="comm-badge">${c.icon}</div>
      <p class="kicker">How to communicate with</p>
      <h1>a ${c.name} <span>· ${c.label}</span></h1>
      <p class="comm-essence">${m.essence}</p>
      <p class="comm-share">Share this card with anyone who works with a ${c.name} — or keep it as a mirror for yourself.</p>`;

    $("#commBody").style.setProperty("--c", c.hex);
    $("#commBody").innerHTML = `
      <div class="comm-card"><p>${m.intro}</p></div>

      <div class="comm-card">
        <h2>Three golden rules</h2>
        <ul class="comm-rules">${m.rules.map((r) => `<li>${r}</li>`).join("")}</ul>
      </div>

      <div class="comm-two">
        <div class="comm-card do-card">
          <h2>Do</h2>
          <ul class="comm-list">${t.do.map((x) => `<li>${x}</li>`).join("")}</ul>
        </div>
        <div class="comm-card dont-card">
          <h2>Don't</h2>
          <ul class="comm-list">${t.dont.map((x) => `<li>${x}</li>`).join("")}</ul>
        </div>
      </div>

      <div class="comm-two">
        <div class="comm-card">
          <h2>Phrases that work</h2>
          <ul class="phrase good">${m.goodPhrases.map((p) => `<li>${p}</li>`).join("")}</ul>
        </div>
        <div class="comm-card">
          <h2>Phrases that backfire</h2>
          <ul class="phrase bad">${m.badPhrases.map((p) => `<li>${p}</li>`).join("")}</ul>
        </div>
      </div>

      <div class="comm-card">
        <h2>In practice</h2>
        <div class="comm-grid">
          <div class="comm-mini"><h3>In writing</h3><p>${m.email}</p></div>
          <div class="comm-mini"><h3>In conflict</h3><p>${m.conflict}</p></div>
          <div class="comm-mini"><h3>To motivate them</h3><p>${m.motivate}</p></div>
          <div class="comm-mini"><h3>Under pressure they turn</h3><p>${c.stress}</p></div>
        </div>
      </div>`;
  }

  /* ---- Two-colour blend card --------------------------------------------- */
  function renderPair(key) {
    const [a, b] = key.split("-");
    const p = DISC.pairComms[key];
    const ca = DISC.colors[a], cb = DISC.colors[b];
    document.title = `How to communicate with a ${p.title} blend — DISC Communication Card`;

    $("#commHero").style.setProperty("--c", ca.hex);
    $("#commHero").innerHTML = `
      <div class="comm-duo"><i style="background:${ca.hex}"></i><i style="background:${cb.hex}"></i></div>
      <p class="kicker">How to communicate with</p>
      <h1>a ${p.title} blend</h1>
      <p class="comm-essence">${p.intro}</p>
      <p class="comm-share">For people who mix ${ca.name} and ${cb.name} — the most common way real people show up.</p>`;

    $("#commBody").style.setProperty("--c", ca.hex);
    $("#commBody").innerHTML = `
      <div class="comm-card">
        <h2>The inner tension</h2>
        <p>${p.tension}</p>
      </div>

      <div class="comm-card">
        <h2>How to handle them</h2>
        <ul class="comm-howto">${p.howTo.map((x) => `<li>${x}</li>`).join("")}</ul>
      </div>

      <div class="comm-card dont-card">
        <h2>Watch out for</h2>
        <p>${p.watch}</p>
      </div>

      <div class="comm-two">
        ${miniColorCard(a)}
        ${miniColorCard(b)}
      </div>`;
  }

  function miniColorCard(k) {
    const c = DISC.colors[k];
    return `
      <a class="comm-card" style="text-decoration:none;border-left-color:${c.hex}" href="communicate.html?c=${k}">
        <h2 style="color:${c.hex}">${c.icon} The ${c.name} side</h2>
        <p>${DISC.comms[k].essence}</p>
        <p style="margin-top:10px;font-weight:600;color:${c.hex}">Open the full ${c.name} card →</p>
      </a>`;
  }

  /* ---- Related-card navigation ------------------------------------------- */
  function renderNav(current) {
    $("#commSingles").innerHTML = SINGLES.map((k) => {
      const c = DISC.colors[k];
      const on = current.type === "single" && current.key === k;
      return `<a class="btn btn-ghost" href="communicate.html?c=${k}" style="${on ? `border-color:${c.hex};color:${c.hex}` : ""}">${c.icon} ${c.name}</a>`;
    }).join("");

    const combos = [];
    for (let i = 0; i < SINGLES.length; i++)
      for (let j = i + 1; j < SINGLES.length; j++) combos.push(pairKey(SINGLES[i], SINGLES[j]));
    $("#commPairs").innerHTML = combos.map((key) => {
      const on = current.type === "pair" && current.key === key;
      const [a, b] = key.split("-");
      return `<a class="btn btn-ghost" href="communicate.html?c=${key}" style="${on ? `border-color:${hex(a)};color:${hex(a)}` : ""}">${DISC.pairComms[key].title}</a>`;
    }).join("");
  }

  document.addEventListener("DOMContentLoaded", () => {
    const card = resolve();
    if (card.type === "pair") renderPair(card.key);
    else renderSingle(card.key);
    renderNav(card);
    window.scrollTo(0, 0);
    const y = $("#year");
    if (y) y.textContent = new Date().getFullYear();
  });
})();
