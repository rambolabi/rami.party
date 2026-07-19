/* =====================================================================
   filldisk.com — recreation
   ---------------------------------------------------------------------
   A faithful, self-contained homage to Feross Aboukhadijeh's filldisk.com.

   The 2012 original abused a browser bug: localStorage was capped ~5 MB
   *per origin*, but Chrome/Safari/IE did NOT enforce a limit across
   subdomains — so `1.filldisk.com`, `2.filldisk.com`, … each got their
   own 5 MB, letting a page fill the whole disk.

   That bug is long patched. This recreation runs on a single origin, so
   the browser caps it to a few MB of THIS page's localStorage. It is
   harmless and fully reversible with the "Stop the madness!" button.
   ===================================================================== */
(function () {
  'use strict';

  var PREFIX = 'filldisk:';       // only ever touch our own keys
  var CHUNK_CHARS = 50000;        // ~100 KB per write (UTF-16 = 2 bytes/char)
  var TICK_MS = 30;               // write cadence (keeps the UI lively)
  var METER_TARGET_MB = 10;       // meter reaches 100% around the modern cap

  // A big blob of text to write on each tick.
  var CHUNK = new Array(CHUNK_CHARS + 1).join('\u265E'); // ♞ — "lots of cats" ;)

  // Cat faces cycled through as the disk fills.
  var CATS = ['🐱','😺','😸','😹','😻','😼','😽','🙀','😿','😾','🐈','🐈‍⬛','🐯','🦁'];

  // --- DOM ---------------------------------------------------------------
  var mbEl      = document.querySelector('.mb');
  var meterFill = document.querySelector('.meter-fill');
  var meterEl   = document.querySelector('.meter');
  var catEl     = document.querySelector('.cat');
  var catWall   = document.querySelector('.cat-wall');
  var fillBtn   = document.querySelector('.fill');
  var reclaimBtn= document.querySelector('.reclaim');
  var statusEl  = document.querySelector('.status');
  var musicBtn  = document.querySelector('.music');

  // --- State -------------------------------------------------------------
  var writtenBytes = 0;
  var chunkIndex = 0;
  var catIndex = 0;
  var filling = false;
  var timer = null;

  // ----------------------------------------------------------------------
  //  Helpers
  // ----------------------------------------------------------------------
  function setStatus (html) { statusEl.innerHTML = html; }

  function bytesOf (key, value) {
    return (key.length + value.length) * 2; // UTF-16
  }

  /** Sum up any fill data left over from a previous visit. */
  function scanExisting () {
    var bytes = 0, count = 0;
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key && key.indexOf(PREFIX) === 0) {
        var val = localStorage.getItem(key) || '';
        bytes += bytesOf(key, val);
        count++;
      }
    }
    writtenBytes = bytes;
    chunkIndex = count;
  }

  function usedMB () { return writtenBytes / (1024 * 1024); }

  function render () {
    var mb = usedMB();
    mbEl.textContent = mb.toFixed(1);

    // Redden the page like the original (white -> red as it fills).
    var nonRed = 255 - Math.min(chunkIndex * 4, 255);
    var hex = nonRed.toString(16);
    if (hex.length === 1) hex = '0' + hex;
    document.body.style.backgroundColor = '#ff' + hex + hex;

    // Progress meter.
    var pct = Math.min(100, (mb / METER_TARGET_MB) * 100);
    meterFill.style.width = pct.toFixed(1) + '%';
    meterEl.setAttribute('aria-valuenow', Math.round(pct));

    reclaimBtn.disabled = writtenBytes === 0;
  }

  function showNextCat () {
    var face = CATS[catIndex];
    catIndex = (catIndex + 1) % CATS.length;

    catEl.textContent = face;
    catEl.classList.remove('bounce');
    void catEl.offsetWidth;   // restart the pop animation
    catEl.classList.add('bounce');

    // Build up a growing "wall of cats" (capped so the DOM stays light).
    if (catWall.childElementCount < 400) {
      var s = document.createElement('span');
      s.textContent = face;
      catWall.appendChild(s);
    }
  }

  // ----------------------------------------------------------------------
  //  Filling
  // ----------------------------------------------------------------------
  function writeChunk () {
    var key = PREFIX + chunkIndex;
    try {
      localStorage.setItem(key, CHUNK);
    } catch (e) {
      // QuotaExceededError — the modern per-origin cap has been hit.
      stopFill();
      setStatus('💥 Full! Your browser only let this page store <strong>' +
        mbEl.textContent + '&nbsp;MB</strong> before saying &ldquo;no more cats!&rdquo; ' +
        'That&rsquo;s the modern per-site quota doing its job. ' +
        'Hit <strong>Stop&nbsp;the&nbsp;madness!</strong> to reclaim it.');
      return false;
    }

    writtenBytes += bytesOf(key, CHUNK);
    chunkIndex++;
    showNextCat();
    render();
    return true;
  }

  function startFill () {
    if (filling) return;
    filling = true;
    fillBtn.textContent = 'Filling…';
    fillBtn.disabled = true;
    setStatus('😼 Filling your disk with cats&hellip;');
    timer = setInterval(writeChunk, TICK_MS);
  }

  function stopFill () {
    filling = false;
    if (timer) { clearInterval(timer); timer = null; }
    fillBtn.textContent = "Fill \u2019er up!";
    fillBtn.disabled = false;
  }

  function reclaim () {
    stopFill();

    var keys = [];
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key && key.indexOf(PREFIX) === 0) keys.push(key);
    }
    keys.forEach(function (k) { localStorage.removeItem(k); });

    writtenBytes = 0;
    chunkIndex = 0;
    catWall.innerHTML = '';
    catEl.textContent = '🐱';
    render();
    setStatus('🧹 Phew! Reclaimed every byte &mdash; your disk space is back. ' +
      'The original site put a &ldquo;Stop the madness!&rdquo; button here too.');
  }

  // ----------------------------------------------------------------------
  //  "Trololo" tune (WebAudio, off by default — no autoplay surprises)
  // ----------------------------------------------------------------------
  var audio = (function () {
    var ctx = null, timerId = null, playing = false;
    // A short, cheesy looping motif (semitones from A4).
    var NOTES = [0, 4, 7, 12, 7, 4, 0, 4, 7, 4, 2, -1];
    var step = 0;

    function freq (semi) { return 440 * Math.pow(2, semi / 12); }

    function tick () {
      var t = ctx.currentTime;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq(NOTES[step]);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
      step = (step + 1) % NOTES.length;
    }

    return {
      toggle: function () {
        if (playing) {
          playing = false;
          clearInterval(timerId);
          timerId = null;
          return false;
        }
        if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
        playing = true;
        step = 0;
        tick();
        timerId = setInterval(tick, 260);
        return true;
      }
    };
  })();

  // ----------------------------------------------------------------------
  //  Wire up
  // ----------------------------------------------------------------------
  fillBtn.addEventListener('click', startFill);
  reclaimBtn.addEventListener('click', reclaim);

  musicBtn.addEventListener('click', function () {
    var on = audio.toggle();
    musicBtn.setAttribute('aria-pressed', String(on));
    musicBtn.textContent = '♪ trololo: ' + (on ? 'on' : 'off');
  });

  // Restore any leftover fill from a previous visit.
  scanExisting();
  render();
  if (writtenBytes > 0) {
    setStatus('Welcome back — there&rsquo;s still <strong>' + mbEl.textContent +
      '&nbsp;MB</strong> of cats stored from last time. ' +
      'Keep filling, or hit <strong>Stop&nbsp;the&nbsp;madness!</strong> to clear it.');
  }
})();
