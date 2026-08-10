/* ==========================================================================
   The backdrop
   The same drifting starfield as the rest of rami.party, self-contained so
   the page keeps working if it is ever dropped.
   ========================================================================== */

(function () {
    'use strict';

    window.OST.startStarfield = function () {
        var canvas = document.getElementById('starfield');
        if (!canvas || !canvas.getContext) return;
        var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var ctx = canvas.getContext('2d');
        var stars = [];
        var w, h, dpr, rafId;

        function resize() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = canvas.width = Math.floor(innerWidth * dpr);
            h = canvas.height = Math.floor(innerHeight * dpr);
            canvas.style.width = innerWidth + 'px';
            canvas.style.height = innerHeight + 'px';
            var count = Math.min(160, Math.floor((innerWidth * innerHeight) / 9000));
            var palette = ['#ffffff', '#c99bff', '#7fe6f7', '#ffd77a', '#ff9ecb'];
            stars = [];
            for (var i = 0; i < count; i++) {
                stars.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    r: (Math.random() * 1.4 + 0.3) * dpr,
                    a: Math.random(),
                    tw: Math.random() * 0.02 + 0.004,
                    dir: Math.random() > 0.5 ? 1 : -1,
                    c: palette[(Math.random() * palette.length) | 0],
                });
            }
        }

        function draw() {
            ctx.clearRect(0, 0, w, h);
            for (var i = 0; i < stars.length; i++) {
                var s = stars[i];
                s.a += s.tw * s.dir;
                if (s.a <= 0.1 || s.a >= 1) s.dir *= -1;
                ctx.globalAlpha = Math.max(0.1, Math.min(1, s.a));
                ctx.fillStyle = s.c;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            if (!reduceMotion) rafId = requestAnimationFrame(draw);
        }

        resize();
        draw();
        window.addEventListener('resize', function () {
            cancelAnimationFrame(rafId);
            resize();
            draw();
        });
    };
})();
