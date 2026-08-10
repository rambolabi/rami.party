/* ==========================================================================
   One result card
   Title, then what it is in one line, then the labels, then the links. The
   list view is the same DOM with a different stylesheet.
   ========================================================================== */

(function () {
    'use strict';

    var OST = window.OST;
    var make = OST.make;

    function metaRow(dl, key, value) {
        var row = make('div', 'meta__row');
        row.appendChild(make('dt', 'meta__key', key));
        row.appendChild(make('dd', 'meta__val', value));
        dl.appendChild(row);
    }

    function eventMeta(item) {
        var dl = make('dl', 'meta');
        var country = OST.countryByCc[item.cc] || { name: '', flag: '📍' };
        var where = item.place || country.name;
        if (country.name && item.place && item.place.indexOf(country.name) === -1 && item.cc !== 'online') {
            where = item.place + ', ' + country.name;
        }
        metaRow(dl, 'Where', country.flag + ' ' + where);

        var when = item.when || '';
        var cadence = OST.cadences[item.cadence];
        if (cadence && item.cadence !== 'rolling') when += (when ? ', ' : '') + cadence;
        else if (cadence) when = when || cadence;
        if (when) metaRow(dl, 'When', when);
        if (item.next) metaRow(dl, 'Next', item.next);
        if (item.held) metaRow(dl, 'Latest', item.held);
        return dl;
    }

    function labels(item) {
        var ul = make('ul', 'badges');
        item.subs.forEach(function (id) {
            var s = OST.subjectById[id];
            if (s) ul.appendChild(OST.badge(s.glyph, s.label, 'sub'));
        });
        var format = OST.typeById[item.type] || OST.accessById[item.access] || OST.kindById[item.kind];
        if (format) ul.appendChild(OST.badge(format.glyph, format.label.replace(/s$/, ''), 'format'));
        var cost = OST.costs[item.cost];
        if (cost) ul.appendChild(OST.badge(cost.glyph, cost.label, 'cost'));
        if (item.upcoming) ul.appendChild(OST.badge('⏳', 'Still to come', 'soon'));
        if (item.source) ul.appendChild(OST.badge('🐙', 'Source', 'source'));
        if (item.gdpr) ul.appendChild(OST.badge('🛡️', 'GDPR', 'gdpr'));
        if (item.local) ul.appendChild(OST.badge('📍', 'Hosted here', 'local'));
        return ul;
    }

    OST.card = function (item) {
        var shelf = OST.shelfById[item.shelf];
        var card = make('article', 'card card--' + item.shelf);

        var head = make('div', 'card__head');
        var mark = make('span', 'card__shelf', shelf.glyph);
        mark.title = shelf.label.replace(/s$/, '');
        head.appendChild(mark);
        head.appendChild(make('h3', 'card__title', item.name));
        card.appendChild(head);

        card.appendChild(make('p', 'card__desc', item.desc));
        if (item.shelf === 'event') card.appendChild(eventMeta(item));

        if (item.note) {
            var note = make('p', 'card__note');
            note.appendChild(make('span', 'card__note-glyph', '⚠️'));
            note.appendChild(make('span', null, item.note));
            card.appendChild(note);
        }

        card.appendChild(labels(item));

        var foot = make('div', 'card__links');
        if (item.links.length) foot.appendChild(OST.linkTo(item.links[0], 'btn btn-primary card__cta'));
        if (item.links.length > 1) {
            var details = make('details', 'more');
            var summary = make('summary', 'more__summary');
            summary.appendChild(make('span', null, 'More links'));
            summary.appendChild(make('span', 'more__count', String(item.links.length - 1)));
            details.appendChild(summary);
            var list = make('div', 'more__list');
            item.links.slice(1).forEach(function (l) { list.appendChild(OST.linkTo(l, 'more__link')); });
            details.appendChild(list);
            foot.appendChild(details);
        }
        card.appendChild(foot);
        return card;
    };
})();
