/* ==========================================================================
   Small DOM helpers
   Everything on this page is built with these four, so no markup is ever
   assembled from strings and no entry text can become HTML.
   ========================================================================== */

(function () {
    'use strict';

    var OST = window.OST;

    OST.make = function (tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined && text !== null) node.textContent = text;
        return node;
    };

    OST.badge = function (glyph, text, modifier) {
        var li = OST.make('li', 'badge' + (modifier ? ' badge--' + modifier : ''));
        li.appendChild(OST.make('span', 'badge__glyph', glyph));
        li.appendChild(OST.make('span', 'badge__text', text));
        return li;
    };

    OST.isExternal = function (url) {
        return /^https?:\/\//i.test(url);
    };

    OST.linkTo = function (link, className) {
        var a = OST.make('a', className);
        a.href = link.u;
        if (OST.isExternal(link.u)) {
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
        }
        a.appendChild(OST.make('span', 'link__glyph', link.g || '🔗'));
        a.appendChild(OST.make('span', 'link__text', link.t));
        if (OST.isExternal(link.u)) {
            var mark = OST.make('span', 'link__ext', '↗');
            mark.setAttribute('aria-hidden', 'true');
            a.appendChild(mark);
        }
        return a;
    };

    OST.option = function (value, label) {
        var o = OST.make('option', null, label);
        o.value = value;
        return o;
    };
})();
