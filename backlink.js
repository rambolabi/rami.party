/* ==========================================================================
   rami.party — the way home
   --------------------------------------------------------------------------
   Some realms were built before the hub existed and have no navigation of
   their own, which strands a visitor the moment they arrive. Dropping

       <script src="/backlink.js" defer></script>

   just before </body> adds a small, unobtrusive "back to rami.party" pill in
   the corner. All styles are injected here and namespaced, so nothing can
   clash with the page it lands on.
   ========================================================================== */

(function () {
    'use strict';

    if (window.self !== window.top) return;                  // never inside an embed
    if (document.querySelector('.rp-backlink')) return;       // never twice

    var style = document.createElement('style');
    style.textContent = [
        '.rp-backlink{position:fixed;left:16px;bottom:16px;z-index:2147483000;',
        'display:inline-flex;align-items:center;gap:8px;padding:9px 15px;border-radius:999px;',
        'font:600 14px/1 system-ui,-apple-system,"Segoe UI",sans-serif;text-decoration:none;',
        'color:#ece9ff;background:rgba(16,8,42,.82);border:1px solid rgba(168,85,247,.45);',
        'box-shadow:0 8px 24px rgba(0,0,0,.45);backdrop-filter:blur(8px);',
        '-webkit-backdrop-filter:blur(8px);opacity:.75;transition:opacity .25s ease,transform .25s ease}',
        '.rp-backlink:hover,.rp-backlink:focus-visible{opacity:1;transform:translateY(-2px);color:#fff;',
        'border-color:rgba(34,211,238,.7)}',
        '.rp-backlink:focus-visible{outline:2px solid #22d3ee;outline-offset:3px}',
        '@media print{.rp-backlink{display:none}}',
        '@media (prefers-reduced-motion:reduce){.rp-backlink{transition:none}}'
    ].join('');

    var link = document.createElement('a');
    link.className = 'rp-backlink';
    link.href = '/';
    link.setAttribute('aria-label', 'Back to rami.party');
    link.innerHTML = '<span aria-hidden="true">←</span> rami.party';

    function mount() {
        document.head.appendChild(style);
        document.body.appendChild(link);
    }

    if (document.body) mount();
    else document.addEventListener('DOMContentLoaded', mount);
})();
