/* ====================================================================
   options/cards.js — one loop engine for all six directions.

   The same shape the page already ships (site/app.js §3b, §3b2): ONE rAF
   per figure, a cue list read every frame and toggled with
   `classList.toggle`, gated on an IntersectionObserver and on
   `visibilitychange`. Never a stack of `setTimeout`s — scrubbing back to
   zero at the loop point is then free and nothing can drift out of order.

   Two declarations do all the work, in the markup:

     data-loop="9000"   on the figure — the cycle, in ms
     data-cue="1200"    on anything inside it — gets `.is-on` from then on
     data-until="2400"  optional — and loses it again at that point
     data-type="text"   types itself out, one character at a time

   THE RESTING STATE IS THE FINISHED FRAME. `.is-live` is added here and
   nowhere else, so no-JS, reduced motion and the moments before the
   observer fires all show the complete figure with every cue satisfied.
   A loop that leaves the page empty when it fails is a bug, not a loop.
   ==================================================================== */
(function () {
  'use strict';

  var doc = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var TYPE_MS = 55;          // per character
  var TYPE_HOLD = 1400;      // how long a finished line sits before it clears

  [].slice.call(doc.querySelectorAll('.lzc')).forEach(function (fig) {
    if (reduce) return;

    var loop = parseInt(fig.dataset.loop, 10) || 8000;

    var cues = [].slice.call(fig.querySelectorAll('[data-cue]')).map(function (el) {
      var until = el.dataset.until;
      return [parseInt(el.dataset.cue, 10), until ? parseInt(until, 10) : Infinity, el];
    });

    // the typewriter keeps its own copy of the string: the element is
    // emptied on the first frame and refilled a character at a time, so
    // the markup stays the source of truth for the resting state
    var typers = [].slice.call(fig.querySelectorAll('[data-type]')).map(function (el) {
      return { el: el, text: el.dataset.type, shown: -1 };
    });

    var raf = 0, t0 = null, acc = 0, visible = false;

    function paint(now) {
      raf = 0;
      if (!visible || doc.hidden) { park(now); return; }
      if (t0 === null) t0 = now - acc;
      var t = acc = (now - t0) % loop;

      for (var i = 0; i < cues.length; i++) {
        cues[i][2].classList.toggle('is-on', t >= cues[i][0] && t < cues[i][1]);
      }

      for (var j = 0; j < typers.length; j++) {
        var ty = typers[j];
        // type, hold, clear — and the clear happens by going back to zero
        // characters rather than by fading, because a half-opacity glyph
        // is a glyph under its contrast ratio (RULES N3)
        var span = ty.text.length * TYPE_MS;
        var n = t < span ? Math.floor(t / TYPE_MS)
              : t < span + TYPE_HOLD ? ty.text.length : 0;
        if (n !== ty.shown) {
          ty.shown = n;
          ty.el.textContent = ty.text.slice(0, n);
        }
      }

      raf = requestAnimationFrame(paint);
    }

    // elapsed time survives a pause: resuming from zero would replay every
    // cue at once in front of a reader who is already looking at the card
    function park(now) {
      if (now && t0 !== null) acc = (now - t0) % loop;
      t0 = null;
    }

    function run(on) {
      visible = on;
      if (!on) {
        park();
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
        return;
      }
      fig.classList.add('is-live');
      if (!raf) raf = requestAnimationFrame(paint);
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { run(e.isIntersecting); });
      }, { threshold: 0.25 }).observe(fig);
    } else {
      run(true);
    }
    doc.addEventListener('visibilitychange', function () {
      if (!doc.hidden && visible && !raf) raf = requestAnimationFrame(paint);
    });
  });
})();
