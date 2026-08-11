/* ==========================================================================
   Home page: a short index of what is in the library, pointing at the
   searchable catalogue. Built with createElement/textContent only.
   ========================================================================== */

(function () {
    'use strict';

    var box = document.getElementById('script-index');
    if (!box || !Array.isArray(window.GLAMOURS)) return;

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text) node.textContent = text;
        return node;
    }

    window.GLAMOURS.forEach(function (g) {
        var row = el('a', 'index-row');
        row.href = 'scripts.html#' + g.id;

        var main = el('span', 'index-main');
        main.appendChild(el('strong', null, g.title));
        var done = g.status === 'complete';
        var status = el('span', 'badge ' + (done ? 'done' : 'wip'), done ? 'Completed' : 'WIP');
        status.title = done ? 'Completed' : 'Work in progress';
        main.appendChild(status);
        main.appendChild(el('span', 'badge site', g.site));

        row.appendChild(main);
        row.appendChild(el('span', 'index-sub', g.summary));
        box.appendChild(row);
    });

    var count = document.getElementById('script-count');
    if (count) {
        count.textContent = window.GLAMOURS.length === 1
            ? '1 script in the library'
            : window.GLAMOURS.length + ' scripts in the library';
    }
})();
