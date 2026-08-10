/* ==========================================================================
   Searching and sorting
   Plain substring matching over one prepared haystack per entry: every word
   you type has to appear somewhere, and the name counts for most.
   ========================================================================== */

(function () {
    'use strict';

    var OST = window.OST;

    OST.tokenise = function (q) {
        return String(q || '').toLowerCase().split(/\s+/).filter(Boolean);
    };

    OST.matches = function (item, toks) {
        for (var i = 0; i < toks.length; i++) {
            if (item.haystack.indexOf(toks[i]) === -1) return false;
        }
        return true;
    };

    OST.score = function (item, toks) {
        if (!toks.length) return 0;
        var name = item.name.toLowerCase();
        var tags = (item.tags || '').toLowerCase();
        var total = 0;
        toks.forEach(function (t) {
            if (name.indexOf(t) === 0) total += 100;
            else if (name.indexOf(t) !== -1) total += 60;
            else if (tags.indexOf(t) !== -1) total += 25;
            else total += 5;
        });
        return total;
    };

    function byName(a, b) {
        return a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0;
    }

    /* Without a query, "best" means the rail order: subject first, then the
       shelf, then the name. The entries come from thirty files, so their
       written order would only look random here. */
    function bySubject(a, b) {
        var ao = OST.subjectById[a.subs[0]], bo = OST.subjectById[b.subs[0]];
        ao = ao ? ao.order : 99;
        bo = bo ? bo.order : 99;
        if (ao !== bo) return ao - bo;
        var as = OST.shelfById[a.shelf].order, bs = OST.shelfById[b.shelf].order;
        if (as !== bs) return as - bs;
        return byName(a, b);
    }

    function bySoonest(a, b) {
        var ai = a.nextIso || '', bi = b.nextIso || '';
        if (ai && bi) return ai === bi ? byName(a, b) : (ai < bi ? -1 : 1);
        if (ai) return -1;
        if (bi) return 1;
        return byName(a, b);
    }

    OST.sort = function (list, mode, toks) {
        var out = list.slice();
        if (mode === 'name') return out.sort(byName);
        if (mode === 'name-desc') return out.sort(function (a, b) { return byName(b, a); });
        if (mode === 'soonest') return out.sort(bySoonest);
        if (toks.length) {
            return out.sort(function (a, b) {
                return (OST.score(b, toks) - OST.score(a, toks)) || byName(a, b);
            });
        }
        return out.sort(bySubject);
    };
})();
