/* ==========================================================================
   Mail Ward — volume dashboard charts.
   A tiny SVG renderer that replaces Chart.js for the two charts this page
   needs, so the whole suite runs offline with no third-party code.
   Everything is built with createElementNS/textContent — no innerHTML.
   ========================================================================== */
(function (global) {
    'use strict';

    var NS = 'http://www.w3.org/2000/svg';

    function svgEl(tag, attrs) {
        var n = document.createElementNS(NS, tag);
        if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
        return n;
    }

    function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

    /* Shorten a label to fit a pixel width, measured by character estimate.
       (Cheap and stable — measuring real text would force a layout per item.) */
    function fit(text, maxChars) {
        text = String(text);
        return text.length > maxChars ? text.slice(0, Math.max(1, maxChars - 1)) + '…' : text;
    }

    function nice(n) { return Number(n).toLocaleString(); }

    /* ---------------------------------------------------------------- bars */
    function barChart(container, items, opts) {
        opts = opts || {};
        clear(container);
        if (!items.length) return;

        var width = Math.max(260, container.clientWidth || 520);
        var rowH = 30;
        var gap = 8;
        var padTop = 6;
        var padBottom = 22;
        var labelW = Math.round(Math.min(210, Math.max(96, width * 0.36)));
        var valueW = 54;
        var trackX = labelW + 10;
        var trackW = Math.max(30, width - trackX - valueW - 6);
        var height = padTop + items.length * rowH + (items.length - 1) * gap + padBottom;

        var max = items.reduce(function (m, it) { return Math.max(m, it.count); }, 0) || 1;

        var svg = svgEl('svg', {
            width: '100%', height: String(height),
            viewBox: '0 0 ' + width + ' ' + height,
            role: 'img',
            'aria-label': opts.label || 'Bar chart'
        });

        // Gridlines at 0 / 25 / 50 / 75 / 100 % of the maximum.
        for (var g = 0; g <= 4; g++) {
            var gx = trackX + trackW * (g / 4);
            svg.appendChild(svgEl('line', {
                x1: gx, y1: padTop, x2: gx, y2: height - padBottom,
                stroke: 'rgba(0,0,0,.08)', 'stroke-width': 1
            }));
            var gl = svgEl('text', {
                x: gx, y: height - padBottom + 15, 'text-anchor': 'middle',
                fill: 'rgba(0,0,0,.45)', 'font-size': 10.5,
                'font-family': 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
            });
            gl.textContent = nice(Math.round(max * g / 4));
            svg.appendChild(gl);
        }

        items.forEach(function (it, i) {
            var y = padTop + i * (rowH + gap);
            var w = Math.max(2, trackW * (it.count / max));

            var label = svgEl('text', {
                x: labelW, y: y + rowH / 2 + 4, 'text-anchor': 'end',
                fill: '#31405c', 'font-size': 12,
                'font-family': 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
            });
            label.textContent = fit(it.sender, Math.floor(labelW / 6.6));
            var lt = svgEl('title');
            lt.textContent = it.sender;
            label.appendChild(lt);
            svg.appendChild(label);

            svg.appendChild(svgEl('rect', {
                x: trackX, y: y, width: trackW, height: rowH,
                rx: 6, fill: 'rgba(102,126,234,.09)'
            }));

            var bar = svgEl('rect', {
                x: trackX, y: y, width: w, height: rowH, rx: 6,
                fill: (opts.colors && opts.colors[i]) || 'rgba(102,126,234,.85)'
            });
            var bt = svgEl('title');
            bt.textContent = it.sender + ' — ' + nice(it.count);
            bar.appendChild(bt);
            svg.appendChild(bar);

            var val = svgEl('text', {
                x: trackX + w + 7, y: y + rowH / 2 + 4,
                fill: '#31405c', 'font-size': 12, 'font-weight': 600,
                'font-family': 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
            });
            val.textContent = nice(it.count);
            svg.appendChild(val);
        });

        container.appendChild(svg);
    }

    /* ------------------------------------------------------------ doughnut */
    function arcPath(cx, cy, rOuter, rInner, a0, a1) {
        // A full circle cannot be expressed as a single arc — nudge it closed.
        if (a1 - a0 >= Math.PI * 2) a1 = a0 + Math.PI * 2 - 0.0001;
        var large = (a1 - a0) > Math.PI ? 1 : 0;
        var x0 = cx + rOuter * Math.cos(a0), y0 = cy + rOuter * Math.sin(a0);
        var x1 = cx + rOuter * Math.cos(a1), y1 = cy + rOuter * Math.sin(a1);
        var x2 = cx + rInner * Math.cos(a1), y2 = cy + rInner * Math.sin(a1);
        var x3 = cx + rInner * Math.cos(a0), y3 = cy + rInner * Math.sin(a0);
        return 'M' + x0 + ' ' + y0 +
            'A' + rOuter + ' ' + rOuter + ' 0 ' + large + ' 1 ' + x1 + ' ' + y1 +
            'L' + x2 + ' ' + y2 +
            'A' + rInner + ' ' + rInner + ' 0 ' + large + ' 0 ' + x3 + ' ' + y3 + 'Z';
    }

    function doughnut(container, items, opts) {
        opts = opts || {};
        clear(container);
        if (!items.length) return;

        var width = Math.max(260, container.clientWidth || 520);
        var narrow = width < 420;
        var size = narrow ? Math.min(width - 20, 240) : 230;
        var legendRows = items.length;
        var legendH = legendRows * 20 + 4;
        var height = narrow ? size + legendH + 16 : Math.max(size, legendH) + 8;

        var total = items.reduce(function (s, it) { return s + it.count; }, 0) || 1;
        var cx = narrow ? width / 2 : size / 2 + 6;
        var cy = size / 2 + 4;
        var rOuter = size / 2 - 6;
        var rInner = rOuter * 0.58;

        var svg = svgEl('svg', {
            width: '100%', height: String(height),
            viewBox: '0 0 ' + width + ' ' + height,
            role: 'img',
            'aria-label': opts.label || 'Distribution chart'
        });

        var angle = -Math.PI / 2;
        items.forEach(function (it, i) {
            var sweep = (it.count / total) * Math.PI * 2;
            var p = svgEl('path', {
                d: arcPath(cx, cy, rOuter, rInner, angle, angle + sweep),
                fill: (opts.colors && opts.colors[i]) || '#667eea',
                stroke: '#fff', 'stroke-width': 2
            });
            var t = svgEl('title');
            t.textContent = it.sender + ' — ' + nice(it.count) +
                ' (' + ((it.count / total) * 100).toFixed(1) + '%)';
            p.appendChild(t);
            svg.appendChild(p);
            angle += sweep;
        });

        var centre = svgEl('text', {
            x: cx, y: cy - 2, 'text-anchor': 'middle', fill: '#31405c',
            'font-size': 20, 'font-weight': 700,
            'font-family': 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
        });
        centre.textContent = nice(total);
        svg.appendChild(centre);
        var sub = svgEl('text', {
            x: cx, y: cy + 16, 'text-anchor': 'middle', fill: 'rgba(0,0,0,.45)',
            'font-size': 11,
            'font-family': 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
        });
        sub.textContent = opts.centreLabel || 'in top 10';
        svg.appendChild(sub);

        var lx = narrow ? 14 : size + 22;
        var ly = narrow ? size + 20 : Math.max(10, (height - legendH) / 2 + 12);
        var maxChars = Math.floor(Math.max(60, width - lx - 60) / 6.4);

        items.forEach(function (it, i) {
            var y = ly + i * 20;
            svg.appendChild(svgEl('rect', {
                x: lx, y: y - 9, width: 11, height: 11, rx: 3,
                fill: (opts.colors && opts.colors[i]) || '#667eea'
            }));
            var t = svgEl('text', {
                x: lx + 17, y: y, fill: '#31405c', 'font-size': 11.5,
                'font-family': 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
            });
            t.textContent = fit(it.sender, maxChars) + '  ' +
                ((it.count / total) * 100).toFixed(1) + '%';
            var tt = svgEl('title');
            tt.textContent = it.sender + ' — ' + nice(it.count);
            t.appendChild(tt);
            svg.appendChild(t);
        });

        container.appendChild(svg);
    }

    /* Re-render on container resize so the charts stay readable. */
    function responsive(container, draw) {
        draw();
        if (typeof ResizeObserver === 'undefined') {
            window.addEventListener('resize', function () { draw(); });
            return;
        }
        if (container.__mwRO) container.__mwRO.disconnect();
        var last = container.clientWidth;
        var ro = new ResizeObserver(function () {
            if (Math.abs(container.clientWidth - last) < 12) return;
            last = container.clientWidth;
            draw();
        });
        ro.observe(container);
        container.__mwRO = ro;
    }

    global.MWCharts = { bar: barChart, doughnut: doughnut, responsive: responsive };
})(window);
