/* =============================================================================
   Communication card page — renders a shareable "how to communicate with…"
   card for a single colour (?c=red) or a two-colour blend (?c=red-yellow).
   Depends on: data.js (DISC), shared.js (window.DUI).
   ========================================================================== */
(function () {
  "use strict";

  const { ORDER, hex, name, pairKey, escapeHTML } = window.DUI;
  const T = DISC_I18N.t;
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
    const tips = DISC.tips[k];
    document.title = T("cc_title_single", { name: c.name });

    $("#commHero").style.setProperty("--c", c.hex);
    $("#commHero").innerHTML = `
      <div class="comm-badge">${c.icon}</div>
      <p class="kicker">${T("cc_kicker")}</p>
      <h1>${T("cc_h1_single", { name: c.name, label: c.label })}</h1>
      <p class="comm-essence">${m.essence}</p>
      <p class="comm-share">${T("cc_share_single", { name: c.name })}</p>`;

    $("#commBody").style.setProperty("--c", c.hex);
    $("#commBody").innerHTML = `
      <div class="comm-card"><p>${m.intro}</p></div>

      <div class="comm-card">
        <h2>${T("cc_rules")}</h2>
        <ul class="comm-rules">${m.rules.map((r) => `<li>${r}</li>`).join("")}</ul>
      </div>

      <div class="comm-two">
        <div class="comm-card do-card">
          <h2>${T("tip_do")}</h2>
          <ul class="comm-list">${tips.do.map((x) => `<li>${x}</li>`).join("")}</ul>
        </div>
        <div class="comm-card dont-card">
          <h2>${T("tip_dont")}</h2>
          <ul class="comm-list">${tips.dont.map((x) => `<li>${x}</li>`).join("")}</ul>
        </div>
      </div>

      <div class="comm-two">
        <div class="comm-card">
          <h2>${T("cc_good")}</h2>
          <ul class="phrase good">${m.goodPhrases.map((p) => `<li>${p}</li>`).join("")}</ul>
        </div>
        <div class="comm-card">
          <h2>${T("cc_bad")}</h2>
          <ul class="phrase bad">${m.badPhrases.map((p) => `<li>${p}</li>`).join("")}</ul>
        </div>
      </div>

      <div class="comm-card">
        <h2>${T("cc_practice")}</h2>
        <div class="comm-grid">
          <div class="comm-mini"><h3>${T("cc_writing")}</h3><p>${m.email}</p></div>
          <div class="comm-mini"><h3>${T("cc_conflict")}</h3><p>${m.conflict}</p></div>
          <div class="comm-mini"><h3>${T("cc_motivate")}</h3><p>${m.motivate}</p></div>
          <div class="comm-mini"><h3>${T("cc_pressure")}</h3><p>${c.stress}</p></div>
        </div>
      </div>`;
  }

  /* ---- Two-colour blend card --------------------------------------------- */
  function renderPair(key) {
    const [a, b] = key.split("-");
    const p = DISC.pairComms[key];
    const ca = DISC.colors[a], cb = DISC.colors[b];
    document.title = T("cc_title_pair", { title: p.title });

    $("#commHero").style.setProperty("--c", ca.hex);
    $("#commHero").innerHTML = `
      <div class="comm-duo"><i style="background:${ca.hex}"></i><i style="background:${cb.hex}"></i></div>
      <p class="kicker">${T("cc_kicker")}</p>
      <h1>${T("cc_h1_pair", { title: p.title })}</h1>
      <p class="comm-essence">${p.intro}</p>
      <p class="comm-share">${T("cc_share_pair", { a: ca.name, b: cb.name })}</p>`;

    $("#commBody").style.setProperty("--c", ca.hex);
    $("#commBody").innerHTML = `
      <div class="comm-card">
        <h2>${T("cc_tension")}</h2>
        <p>${p.tension}</p>
      </div>

      <div class="comm-card">
        <h2>${T("cc_handle")}</h2>
        <ul class="comm-howto">${p.howTo.map((x) => `<li>${x}</li>`).join("")}</ul>
      </div>

      <div class="comm-card dont-card">
        <h2>${T("cc_watch")}</h2>
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
        <h2 style="color:${c.hex}">${c.icon} ${T("cc_side", { name: c.name })}</h2>
        <p>${DISC.comms[k].essence}</p>
        <p style="margin-top:10px;font-weight:600;color:${c.hex}">${T("cc_open", { name: c.name })}</p>
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
