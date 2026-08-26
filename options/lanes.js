/* ====================================================================
   options/lanes.js — the lane loop, plus the two extra mechanics that
   Options 2 and 3 add on top of it.

   The base loop is exactly the one that ships in site/app.js §3b2, kept
   identical on purpose: the three directions differ in COMPOSITION and
   SCALE, and a comparison is worthless if they also differ in timing.

     · one rAF, one cue list, gated on an observer and visibilitychange
     · the resting state is the finished run — `.is-live` is added by JS
       and by nothing else, so reduced motion and no-JS show every step
     · each lane finishes a step on its own fixed interval (3.3 / 3.6 /
       3.9 / 4.3s) from its own offset, and loops on its own whole number
       of seconds (11 / 12 / 13 / 14). Every lane is predictable alone;
       the four realign once every forty-two minutes.
   ==================================================================== */
(function () {
  'use strict';

  var doc = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var CLOCK = [[2000, 3600, 12000],       // [first step, every, loop]
               [1100, 3300, 11000],
               [3800, 4300, 14000],
               [2900, 3900, 13000]];

  // the two newest steps stand down a beat apart at the end of a lane's
  // loop, so the wrap reads as the list settling rather than as a cut
  var FOLD = [700, 300];

  /* Option 2's travel. 22, against the connector rails' 26 in
     site/app.js: those rails carry logos and nothing on them has to be
     read, while every row on this track is a sentence. Four pixels is
     the difference between a board you can read as it passes and one you
     have to catch. */
  var TRACK_PX_PER_SEC = 22;
  var SETS = 4;                           // agents per copy of the track
  var LENS_HOLD = 4200;                   // Option 3: seconds per agent

  [].slice.call(doc.querySelectorAll('.lz')).forEach(function (fig) {
    var board = fig.querySelector('.lanes');
    if (!board || reduce) return;

    var lanes = [].slice.call(board.querySelectorAll('.lane'));
    var rows = lanes.map(function (l) {
      return [].slice.call(l.querySelectorAll('.lane__s'));
    });

    var isTrack = fig.classList.contains('lz--pan');
    var lens = fig.querySelector('.lens');

    // elapsed time SURVIVES a pause. Without this, scrolling the card
    // away and back restarts the clock at zero, which snaps the track
    // back to its start and rewinds every lane — the observer fires at
    // 25% visible, so you would watch it happen.
    var raf = 0, t0 = null, tAcc = 0, visible = false;
    var shownLane = -1, shownTime = '';

    /* ── the board ─────────────────────────────────────────────── */
    function paintBoard(t) {
      rows.forEach(function (list, i) {
        var c = CLOCK[i % CLOCK.length], lt = t % c[2], live = null;
        list.forEach(function (row, r) {
          // everything below the top two is already on the board; the two
          // newest arrive on this lane's own clock, newest last
          var on = r > 1 || (lt >= c[0] + (1 - r) * c[1] && lt < c[2] - FOLD[r]);
          row.classList.toggle('is-on', on);
          if (on && !live) live = row;    // the newest step present is the live one
        });
        list.forEach(function (row) { row.classList.toggle('is-run', row === live); });
      });
    }

    /* ── Option 2: the endless track ───────────────────────────────
       One copy's width of travel, then back by exactly that width. The
       track holds TWO copies of the four agents and the copies are
       painted from the same clock — lane 4 is lane 0's twin down to which
       step is live — so the frame before the reset and the frame after it
       are the same picture and the wrap has nothing to see.

       SET is measured, not derived: it is the distance from the first
       lane to its own twin, which already contains the gaps. Measuring it
       every frame would be a forced reflow sixty times a second, so it is
       cached and re-read on resize.

       LEAD IS WHY THE WRAP IS ACTUALLY INVISIBLE, and it took a pixel
       diff to find. The band insets its content by 26px, and the track
       starts at that inset — so with the travel running from 0, the strip
       to the LEFT of it has the previous agent's card behind it for the
       whole cycle and nothing behind it at the instant the travel resets.
       A 26px sliver of white popping in the corner is not much, and it is
       the only thing in the frame that moves discontinuously, which is
       exactly what the eye is built to catch. Starting one lane in puts
       the whole visible window, inset included, inside the track's
       interior, so wrapping by one copy's width leaves every pixel where
       it was.

       Measured, not assumed: a lane and its twin land at the same
       `getBoundingClientRect()` to the fourth decimal, and a pixel diff of
       the two frames is empty across every fully-visible lane. What is
       left is text antialiasing on the one lane the band's edge cuts —
       Chrome re-rasters the layer at the new offset and a clipped glyph
       can land on the other side of a tile boundary. One frame, once a
       minute, on a partial word. That one is a rasteriser artifact, not a
       seam, and chasing it would cost the crop. */
    var SET = 0, LEAD = 0;

    function measure() {
      SET = lanes.length > SETS ? lanes[SETS].offsetLeft - lanes[0].offsetLeft : 0;
      LEAD = SET / SETS;                  // one lane pitch
    }

    function paintTrack(t) {
      if (!SET) measure();
      if (!SET) return;
      var x = LEAD + (t / 1000 * TRACK_PX_PER_SEC) % SET;
      board.style.setProperty('--pan', -x.toFixed(2) + 'px');
    }

    /* ── Option 3: the lens ────────────────────────────────────── */
    function paintLens(t) {
      var i = Math.floor(t / LENS_HOLD) % lanes.length;
      if (i !== shownLane) swapLens(i);
      if (shownLane === -1) return;
      // the timer is the one thing that keeps counting between swaps —
      // written only when the string changes, not sixty times a second
      var s = elapsed(t, shownLane);
      if (s !== shownTime) {
        shownTime = s;
        lens.querySelector('.lens__s i').textContent = s;
      }
    }

    /* THE SWAP IS A CUT, AND THE TRAVEL CARRIES IT. An earlier version
       wiped the four text nodes out with clip-path, changed them, and
       wiped them back — which is correct about never fading text (N3) and
       wrong about everything else: for 340ms the panel stood there empty,
       and an empty panel reads as a bug rather than as a transition. A
       hard swap at the instant the lens starts moving is legible in every
       frame, which is what the rule is actually protecting. */
    function swapLens(i) {
      shownLane = i;
      var lane = lanes[i];
      var live = lane.querySelector('.lane__s.is-run') || lane.querySelector('.lane__s');

      var face = lane.querySelector('.lane__h img').src;
      lens.querySelector('.lens__av').src = face;
      // the narrow layout drops the header row and paints the same face
      // as the step row's own marker — see variants.css, narrow block
      lens.style.setProperty('--lens-face', 'url("' + face + '")');
      lens.querySelector('.lens__h b').textContent = lane.querySelector('.lane__h b').textContent;
      lens.querySelector('.lens__h em').textContent = lane.querySelector('.lane__t').textContent;
      lens.querySelector('.lens__s b').textContent = live.querySelector('em').textContent;

      // it travels to the agent it is showing: left-aligned under that
      // lane, clamped so it never hangs off either edge of the band
      var band = fig.getBoundingClientRect().width;
      var w = lens.offsetWidth;
      var x = lane.offsetLeft + lane.offsetWidth / 2 - w / 2;
      lens.style.setProperty('--lens-x',
        Math.max(16, Math.min(band - w - 16, x)) + 'px');
    }

    /* HOW LONG THE TASK HAS BEEN RUNNING, not how long this step has.
       Timed from the step, the number never leaves 0:00–0:04, because a
       step in this loop lasts four seconds and a step in the product
       lasts as long as it lasts — a mock's clock is not the thing being
       depicted. The task timer counts up from a per-agent base and never
       resets, which is what a running task actually shows. */
    var BASE = [74, 213, 41, 156];          // seconds, per agent

    function elapsed(t, i) {
      var s = BASE[i % BASE.length] + Math.floor(t / 1000);
      return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
    }

    function park(now) {
      if (now && t0 !== null) tAcc = now - t0;
      t0 = null;
    }

    /* ── the frame ─────────────────────────────────────────────── */
    function paint(now) {
      raf = 0;
      if (!visible || doc.hidden) { park(now); return; }
      if (t0 === null) t0 = now - tAcc;
      var t = tAcc = now - t0;

      paintBoard(t);
      if (isTrack) paintTrack(t);
      if (lens) paintLens(t);

      raf = requestAnimationFrame(paint);
    }

    function run(on) {
      visible = on;
      if (!on) {
        park();
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
        return;
      }
      if (!board.classList.contains('is-live')) {
        board.classList.add('is-live');
        // the shutter is armed one PAINTED frame late: the resting frame
        // has every row open, so switching the transition on in the same
        // frame plays the loop's opening state as nine rows sliding shut
        raf = requestAnimationFrame(function (ts) {
          paint(ts);
          requestAnimationFrame(function () { board.classList.add('is-warm'); });
        });
        return;
      }
      if (!raf) raf = requestAnimationFrame(paint);
    }

    if (isTrack) window.addEventListener('resize', measure);

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
