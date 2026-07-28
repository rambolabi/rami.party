/* =============================================================================
   The People Library — shared localisation layer (EN / NL / FR)

   Load order matters:
     data.js → data.nl.js → data.fr.js → i18n.js → app.js

   This file
     · picks the active language (?lang= → saved choice → browser → English),
     · exposes the matching content pack as the global `BOOK`,
     · holds every interface string that is NOT part of a content pack,
     · applies those strings to [data-i18n*] elements and builds the switcher.

   Mirrors the pattern used by the DISC workshop so both feel identical.
   ========================================================================== */
const PL_I18N = (function () {
  "use strict";

  const LANGS = ["en", "nl", "fr"];
  // The DISC workshop shipped first with its own key. We read and write both so
  // a language picked anywhere in the library follows the reader everywhere.
  const STORE_KEYS = ["peoplelibrary.lang", "disc.lang"];

  /* ==========================================================================
     UI STRINGS — chrome + engine labels shared by every workshop.
     Anything workshop-specific lives in the content packs instead.
     ========================================================================== */
  const UI = {
    /* ------------------------------------------------------------------ EN */
    en: {
      lang_name: "English",
      lang_label: "Language",
      skip: "Skip to content",
      nav_toggle: "Toggle navigation",
      nav_learn: "Learn",
      nav_test: "Assess",
      nav_handle: "Handle",
      nav_faq: "FAQ",
      hero_cta2: "Learn the ideas",

      faq_kicker: "Questions",
      faq_heading: "Frequently asked",

      concept_more: "Read more →",
      close: "Close",

      begin: "Begin",
      prev: "← Previous",
      retake: "Retake",
      print: "Print / Save PDF",
      of: "{i} / {n}",

      likert1: "Strongly disagree",
      likert2: "Disagree",
      likert3: "Neutral",
      likert4: "Agree",
      likert5: "Strongly agree",

      res_result: "Your result",
      res_score: "Your score",
      res_profile: "Your profile",
      res_type: "Your type",
      res_advice: "What to do",
      res_signs: "Signs to watch",
      res_handle: "How to handle them",
      res_strengths: "Strengths",
      res_watch: "Watch-outs",
      res_low: "Low",
      res_high: "High",
      lvl_high: "High",
      lvl_low: "Lower",
      lvl_mid: "Balanced",
      lvl_mid_text: "You sit in the balanced middle on this trait.",
      you_said: "You said:",
      correct_is: "Correct:",
      no_answer: "—",
      handle_cta: "How to handle it →",

      disc_kicker: "The Four Colours",
      disc_relate: "How it shows up",
      disc_reflect: "If this is you — self-reflect",
      disc_treat: "How to handle them",
      disc_link: "Explore the full DISC colour workshop →",
      col_red: "Red",
      col_yellow: "Yellow",
      col_green: "Green",
      col_blue: "Blue",
      lbl_red: "Dominance",
      lbl_yellow: "Influence",
      lbl_green: "Steadiness",
      lbl_blue: "Conscientiousness",

      foot_library: "The People Library",
      chart_aria: "Result breakdown",
      progress_aria: "Assessment progress",
    },

    /* ------------------------------------------------------------------ NL */
    nl: {
      lang_name: "Nederlands",
      lang_label: "Taal",
      skip: "Naar de inhoud",
      nav_toggle: "Navigatie tonen",
      nav_learn: "Leren",
      nav_test: "Test",
      nav_handle: "Toepassen",
      nav_faq: "FAQ",
      hero_cta2: "Ontdek de ideeën",

      faq_kicker: "Vragen",
      faq_heading: "Veelgestelde vragen",

      concept_more: "Lees meer →",
      close: "Sluiten",

      begin: "Starten",
      prev: "← Vorige",
      retake: "Opnieuw doen",
      print: "Printen / pdf opslaan",
      of: "{i} / {n}",

      likert1: "Zeer oneens",
      likert2: "Oneens",
      likert3: "Neutraal",
      likert4: "Eens",
      likert5: "Zeer eens",

      res_result: "Jouw resultaat",
      res_score: "Jouw score",
      res_profile: "Jouw profiel",
      res_type: "Jouw type",
      res_advice: "Wat je kunt doen",
      res_signs: "Signalen om op te letten",
      res_handle: "Hoe ga je ermee om",
      res_strengths: "Sterke kanten",
      res_watch: "Let op",
      res_low: "Laag",
      res_high: "Hoog",
      lvl_high: "Hoog",
      lvl_low: "Lager",
      lvl_mid: "In balans",
      lvl_mid_text: "Je zit op deze eigenschap mooi in het midden.",
      you_said: "Jij koos:",
      correct_is: "Juist:",
      no_answer: "—",
      handle_cta: "Hoe ga je ermee om →",

      disc_kicker: "De vier kleuren",
      disc_relate: "Hoe het zich toont",
      disc_reflect: "Ben jij dit? — reflecteer",
      disc_treat: "Hoe ga je met ze om",
      disc_link: "Ontdek de volledige DISC-kleurenworkshop →",
      col_red: "Rood",
      col_yellow: "Geel",
      col_green: "Groen",
      col_blue: "Blauw",
      lbl_red: "Dominantie",
      lbl_yellow: "Invloed",
      lbl_green: "Stabiliteit",
      lbl_blue: "Consciëntieusheid",

      foot_library: "De Mensenbibliotheek",
      chart_aria: "Overzicht van je resultaat",
      progress_aria: "Voortgang van de test",
    },

    /* ------------------------------------------------------------------ FR */
    fr: {
      lang_name: "Français",
      lang_label: "Langue",
      skip: "Aller au contenu",
      nav_toggle: "Afficher la navigation",
      nav_learn: "Comprendre",
      nav_test: "Test",
      nav_handle: "Appliquer",
      nav_faq: "FAQ",
      hero_cta2: "Découvrir les idées",

      faq_kicker: "Questions",
      faq_heading: "Questions fréquentes",

      concept_more: "En savoir plus →",
      close: "Fermer",

      begin: "Commencer",
      prev: "← Précédent",
      retake: "Refaire",
      print: "Imprimer / PDF",
      of: "{i} / {n}",

      likert1: "Pas du tout d'accord",
      likert2: "Plutôt pas d'accord",
      likert3: "Neutre",
      likert4: "Plutôt d'accord",
      likert5: "Tout à fait d'accord",

      res_result: "Votre résultat",
      res_score: "Votre score",
      res_profile: "Votre profil",
      res_type: "Votre type",
      res_advice: "Que faire",
      res_signs: "Signaux à surveiller",
      res_handle: "Comment réagir",
      res_strengths: "Forces",
      res_watch: "Points de vigilance",
      res_low: "Faible",
      res_high: "Élevé",
      lvl_high: "Élevé",
      lvl_low: "Plus faible",
      lvl_mid: "Équilibré",
      lvl_mid_text: "Vous vous situez au milieu, en équilibre, sur ce trait.",
      you_said: "Votre réponse :",
      correct_is: "Bonne réponse :",
      no_answer: "—",
      handle_cta: "Comment réagir →",

      disc_kicker: "Les quatre couleurs",
      disc_relate: "Comment cela se manifeste",
      disc_reflect: "Si c'est vous — auto-réflexion",
      disc_treat: "Comment réagir face à eux",
      disc_link: "Découvrir l'atelier DISC complet →",
      col_red: "Rouge",
      col_yellow: "Jaune",
      col_green: "Vert",
      col_blue: "Bleu",
      lbl_red: "Dominance",
      lbl_yellow: "Influence",
      lbl_green: "Stabilité",
      lbl_blue: "Conformité",

      foot_library: "La Bibliothèque Humaine",
      chart_aria: "Détail de votre résultat",
      progress_aria: "Progression du test",
    },
  };

  /* ==========================================================================
     LANGUAGE DETECTION
     ========================================================================== */
  function fromQuery() {
    try {
      const q = new URLSearchParams(window.location.search).get("lang");
      return q ? normalise(q) : null;
    } catch (e) {
      return null;
    }
  }
  function fromStore() {
    for (const key of STORE_KEYS) {
      try {
        const v = normalise(localStorage.getItem(key));
        if (v) return v;
      } catch (e) {
        return null;
      }
    }
    return null;
  }
  function remember(code) {
    STORE_KEYS.forEach((key) => {
      try {
        localStorage.setItem(key, code);
      } catch (e) {
        /* private mode — fall back to per-page detection */
      }
    });
  }
  function fromBrowser() {
    const list = navigator.languages || [navigator.language];
    for (const raw of list) {
      const code = normalise(raw);
      if (code) return code;
    }
    return null;
  }
  function normalise(raw) {
    if (!raw) return null;
    const code = String(raw).slice(0, 2).toLowerCase();
    return LANGS.indexOf(code) !== -1 ? code : null;
  }

  const lang = fromQuery() || fromStore() || fromBrowser() || "en";

  // Only an explicit choice (?lang= or the switcher) is remembered, so browser
  // detection keeps working for visitors who never picked a language.
  if (fromQuery()) remember(lang);

  function setLang(next) {
    if (LANGS.indexOf(next) === -1 || next === lang) return;
    remember(next);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", next);
    window.location.replace(url.toString());
  }

  /* ==========================================================================
     TRANSLATION
     ========================================================================== */
  function fill(str, vars) {
    if (!vars) return str;
    return str.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  }
  function t(key, vars) {
    const table = UI[lang] || UI.en;
    const str = key in table ? table[key] : UI.en[key];
    return fill(str === undefined ? key : str, vars);
  }

  /* ==========================================================================
     DOM APPLICATION
     ========================================================================== */
  function apply(root) {
    const scope = root || document;
    scope.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    scope.querySelectorAll("[data-i18n-html]").forEach((el) => {
      el.innerHTML = t(el.dataset.i18nHtml);
    });
    scope.querySelectorAll("[data-i18n-ph]").forEach((el) => {
      el.placeholder = t(el.dataset.i18nPh);
    });
    scope.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      el.setAttribute("aria-label", t(el.dataset.i18nAria));
    });
  }

  /* Wire up any .lang-switch present on the page. */
  function buildSwitcher() {
    document.querySelectorAll(".lang-switch").forEach((box) => {
      box.setAttribute("aria-label", t("lang_label"));
      box.querySelectorAll("[data-lang]").forEach((btn) => {
        const code = btn.dataset.lang;
        const on = code === lang;
        btn.classList.toggle("on", on);
        btn.setAttribute("aria-pressed", String(on));
        btn.title = UI[code] ? UI[code].lang_name : code;
        btn.addEventListener("click", () => setLang(code));
      });
    });
  }

  function applyDocument() {
    document.documentElement.lang = lang;
    apply(document);
    buildSwitcher();
  }

  return { LANGS, lang, t, setLang, apply, applyDocument, UI };
})();

/* The content pack for the active language — app.js reads `BOOK`.
   Falls back to English whenever a translation pack is missing. */
const BOOK = window["BOOK_" + PL_I18N.lang.toUpperCase()] || window.BOOK_EN;
