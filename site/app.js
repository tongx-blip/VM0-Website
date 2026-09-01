/* ================================================================
   OKOU — interaction layer

   Rules this file follows (premium-microinteraction standard):
   · only transform / opacity / clip-path are animated
   · one IntersectionObserver and one requestAnimationFrame loop
     drive every scroll-linked behaviour — no per-feature listeners
   · every entrance is one of five named variants, so the page never
     animates in a single uniform way
   · prefers-reduced-motion is honoured by skipping the choreography,
     never by leaving content hidden
   ================================================================ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var doc = document;

  /* ── 0a. the wordmark gathers into the mark ──────────────────
     The page opens on the whole logotype — O K O U — and a beat later the
     last three tuck in behind the first, which is the standalone mark.

     THE RESTING DOM IS THE GATHERED MARK (N2), so the opening state has to
     be switched ON before the first paint and switched off again after the
     hold. That ordering matters: adding `is-intro` and `is-armed` together
     would play the opening state as an animation — the three glyphs would
     fly OUT from behind the mark on load, which is the reverse of what this
     says. `is-armed` goes on one painted frame later (N12), so the arrival
     is a state and only the departure is a transition.

     Nothing here runs under reduced motion: the CSS kills the transition
     and the resting state is already the finished one, so the mark simply
     is the mark. */
  var wm = doc.querySelector('.wm');
  if (wm && !reduce) {
    wm.classList.add('is-intro');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        wm.classList.add('is-armed');
        /* THE HOLD. 1150 was long enough to READ "OKOU" and not long enough
           to look deliberate — the gather started while the eye was still
           arriving. 2200 lets the whole logotype sit as a state before it
           becomes a mark, which is the point of showing it at all, and is
           still well short of a splash screen. */
        setTimeout(function () { wm.classList.remove('is-intro'); }, 2200);
      });
    });
  }

  /* ── 0. index children so CSS can stagger them ─────────────── */
  doc.querySelectorAll('[data-reveal="mask"]').forEach(function (el) {
    el.querySelectorAll('.line').forEach(function (l, i) {
      l.style.setProperty('--li', i);
    });
  });
  doc.querySelectorAll('[data-reveal="stagger"]').forEach(function (el) {
    [].forEach.call(el.children, function (c, i) {
      c.style.setProperty('--ci', i);
    });
  });

  /* ── 1. one observer for every on-screen entrance ──────────── */
  var watched = doc.querySelectorAll('.reveal, [data-reveal], .rail, .mark');

  function enter(el) {
    el.classList.add('is-in');
    if (el.classList.contains('mark')) {
      // the mark lands after the line it underlines has arrived
      window.setTimeout(function () { el.classList.add('is-lit'); }, 240);
    }
    if (el.hasAttribute('data-count')) countUp(el);
    el.querySelectorAll('[data-count]').forEach(countUp);
  }

  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        enter(e.target);
        // the rails keep their observer: they pause again off screen
        if (!e.target.classList.contains('rail')) io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    watched.forEach(function (el) { io.observe(el); });
  } else {
    watched.forEach(function (el) {
      el.classList.add('is-in');
      el.classList.add('is-lit');
      el.querySelectorAll('[data-count]').forEach(function (c) {
        c.textContent = c.dataset.count;
      });
    });
  }

  /* ── 2. metrics count up to the number already written there ── */
  function countUp(el) {
    var target = el.dataset.count || el.textContent;
    var m = target.match(/([\d.,]+)/);
    if (!m || reduce) { el.textContent = target; return; }
    var end = parseFloat(m[1].replace(/,/g, ''));
    var pre = target.slice(0, m.index);
    var post = target.slice(m.index + m[1].length);
    var dur = 900, t0 = null;
    function frame(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      var v = end * eased;
      el.textContent = pre + (end % 1 ? v.toFixed(1) : Math.round(v)) + post;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = target;
    }
    requestAnimationFrame(frame);
  }

  /* ── 3. the reach block ──────────────────────────────────────
     Rails: duplicate each track once so the loop is seamless.
     Statement: split into words so they can rise in sequence, then
     swap statements on a timer. Both statements stay in the DOM. */
  var RAIL_PX_PER_SEC = 26;          // one speed for every rail
  var railTracks = [];
  doc.querySelectorAll('.rail').forEach(function (r) {
    var track = r.querySelector('.rail__track');
    if (!track) return;
    // The keyframe travels exactly one copy of the content, so ONE copy has to
    // be at least as wide as the rail — otherwise the row runs out of logos
    // before it wraps and a gap crosses the screen. Repeat the content until it
    // covers the rail, then duplicate the whole thing for the seamless half.
    var one = track.innerHTML;
    for (var i = 0; i < 8 && track.scrollWidth < r.clientWidth; i++) {
      track.innerHTML += one;
    }
    track.innerHTML += track.innerHTML;
    railTracks.push(track);
  });
  function timeRails() {
    railTracks.forEach(function (track) {
      // the keyframe travels -50% of the track, i.e. exactly one copy of the
      // content. Duration = that distance / speed, so rails with different
      // numbers of logos still move at the same rate.
      var distance = track.scrollWidth / 2;
      if (!distance) return;
      track.style.setProperty('--dur', (distance / RAIL_PX_PER_SEC).toFixed(2) + 's');
    });
  }
  timeRails();
  window.addEventListener('resize', timeRails, { passive: true });
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(timeRails).catch(function () {});

  var stage = doc.getElementById('reachStage');
  if (stage) {
    var lines = [].slice.call(stage.querySelectorAll('.reach__line'));

    // wrap every word, keeping <mark> elements intact
    lines.forEach(function (line) {
      (function walk(node) {
        [].slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            if (!n.textContent.trim()) return;
            var frag = doc.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (!part.trim()) { frag.appendChild(doc.createTextNode(part)); return; }
              var w = doc.createElement('span');
              w.className = 'w';
              w.textContent = part;
              frag.appendChild(w);
            });
            node.replaceChild(frag, n);
          } else if (n.nodeType === 1) {
            walk(n);
          }
        });
      })(line);
      [].slice.call(line.querySelectorAll('.w')).forEach(function (w, i) {
        w.style.setProperty('--wi', i);
      });
    });

    if (reduce) {
      lines.forEach(function (l) { l.classList.add('is-on'); });
    } else {
      var li = 0;
      window.setInterval(function () {
        if (document.hidden || lines.length < 2) return;
        var out = lines[li];
        out.classList.remove('is-on');
        out.classList.add('is-out');
        window.setTimeout(function () { out.classList.remove('is-out'); }, 620);
        li = (li + 1) % lines.length;
        window.setTimeout(function () { lines[li].classList.add('is-on'); }, 420);
      }, 6500);
    }
  }

  /* ── 3b. the parallel figure ──────────────────────────────────
     One rAF clock, four lanes reading it at four rates. The rates are
     the argument: a queue advances one bar at a time, so four bars
     moving together at different speeds is a thing a queue physically
     cannot draw. They finish out of order for the same reason.

     Half way through, the person leaves. The ask row dims; the lanes do
     not, because they are not on that person's machine — which is the
     note under the figure, shown instead of stated.

     It runs only while on screen and while the tab is in front, and the
     resting state under reduced motion or no JS is the FINISHED figure,
     never an empty one. */
  var par = doc.getElementById('par');
  if (par) {
    var parCards = [].slice.call(par.querySelectorAll('.par__c'));
    var parState = doc.getElementById('parState');
    var parLabel = parState ? parState.querySelector('span') : null;
    var RUN_MS = 5200;          // the whole figure, once

    function fmt(sec) {
      return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
    }
    /* each lane's own finishing time, written before either branch so the
       reduced-motion resting frame shows four different clocks rather than
       four zeros — the figure's whole point is that they are not in step */
    parCards.forEach(function (c) {
      var rate = parseFloat(c.dataset.rate) || 1;
      c.dataset.done = fmt(Math.round((RUN_MS / 1000) / rate));
    });

    function parFinish() {
      par.classList.add('is-in', 'is-away', 'is-done');
      parCards.forEach(function (c) {
        c.classList.add('is-done');
        c.style.setProperty('--p', 1);
        var el = c.querySelector('.par__el');
        if (el) el.textContent = c.dataset.done || el.textContent;
      });
      if (parLabel) parLabel.textContent = 'Four chats \u00b7 all reported back';
    }

    if (reduce || !('requestAnimationFrame' in window)) {
      parFinish();
    } else {
      var parT0 = null, parRaf = null, parOn = false, parPlayed = false;

      function parPaint(t) {
        if (parT0 === null) parT0 = t;
        var e = t - parT0;
        var away = e > RUN_MS * 0.42;
        par.classList.toggle('is-away', away);
        if (parLabel) {
          parLabel.textContent = away
            ? 'Ming closed the tab \u00b7 the chats carry on'
            : 'Four chats opened \u00b7 all running';
        }
        var allDone = true;
        parCards.forEach(function (c) {
          var rate = parseFloat(c.dataset.rate) || 1;
          var p = Math.min(1, (e / RUN_MS) * rate);
          c.style.setProperty('--p', p.toFixed(4));
          var el = c.querySelector('.par__el');
          // a finished lane's clock stops at its own time; a running one
          // keeps counting, so the four numbers visibly diverge
          if (el) el.textContent = p >= 1 ? c.dataset.done : fmt(Math.round(e / 1000));
          if (p >= 1) c.classList.add('is-done'); else allDone = false;
        });
        if (allDone) {
          parRaf = null; parPlayed = true;
          par.classList.add('is-done');
          if (parLabel) parLabel.textContent = 'Four chats \u00b7 all reported back';
          return;
        }
        parRaf = requestAnimationFrame(parPaint);
      }

      function parStart() {
        if (parRaf || parPlayed) return;
        parRaf = requestAnimationFrame(parPaint);
      }

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            parOn = e.isIntersecting;
            if (parOn) { par.classList.add('is-in'); parStart(); }
            else if (parRaf) { cancelAnimationFrame(parRaf); parRaf = null; parT0 = null; }
          });
        }, { threshold: 0.32 }).observe(par);
      } else {
        par.classList.add('is-in'); parStart();
      }

      doc.addEventListener('visibilitychange', function () {
        if (document.hidden) {
          if (parRaf) { cancelAnimationFrame(parRaf); parRaf = null; parT0 = null; }
        } else if (parOn) { parStart(); }
      });
    }
  }

  /* ── 3b2. the four agents, one at a time, on a track that does not run ─
     The card claims that several agents get more done AT ONCE, and it used
     to say so by TRAVELLING: the board panned left at 22px a second so all
     four went past without shrinking any of them. Tong: *"动画不用滚动了，让
     每个 member 的 card 轮流切换，切换后停留一小段时间，再切切换。中间的 card
     清晰，两边的 cards 加透明度并稍稍按比例缩小一点点。"*

     So the focus steps and DWELLS instead. The centred card is at full
     strength; the two beside it are dimmed and stepped down 6%, which tells
     the eye where to read without drawing a line to say it. The peek either
     side is what carries "there are more" now that nothing is moving past.

     ONE DIRECTION, FOREVER. Tong: *"卡片一直从右边往左划出，无限循环，不要
     往右滑。"* The first pass ping-ponged at the ends to avoid rewinding the
     strip, and the return leg slid the cards RIGHT — which is the one thing
     the figure must not do: a board of running work that backs up reads as
     undoing itself.

     So the track carries THREE copies of the four agents and the focus lives
     in the middle one. It always advances, always leftward; when it steps
     onto the twin of where it started, the frame it lands on is identical to
     the one a whole copy back, so the index is snapped back by four with the
     transition off. Nothing moves during the snap because nothing is
     different after it. That is the same seamless-wrap argument the old pan
     used, stated once in indices instead of in pixels — and it is why the
     focused card always has a real neighbour on both sides.

     ONE LANE RUNS AT A TIME, and it is the one being read (§13.4: one
     gesture per beat, everything else still). That also retires the four
     irregular clocks — 3.3 / 3.6 / 3.9 / 4.3 seconds, chosen so four
     simultaneous lanes never coincided. Nothing is simultaneous any more,
     so the cadence is stated once and restarts with the focus, which is
     what puts the steps inside the dwell where they can be seen.

     The resting frame is the finished run. `.is-live` is added here and
     nowhere else, so no-JS, reduced motion and the moments before the
     observer fires all get the complete figure. */
  var lanesEl = doc.querySelector('.vs__viz--parallel .lanes');
  if (lanesEl && !reduce) {
    /* READ, not retyped. The slide's duration is `--lane-move` on `.lanes`
       and CSS is what actually performs it; a copy here is a second opinion
       that goes stale the first time one of them is edited. */
    var LANE_MOVE = (function () {
      var v = parseFloat(getComputedStyle(lanesEl).getPropertyValue('--lane-move'));
      return v === v ? v : 1000;
    })();
    /* The dwell grows with the move. Slowing only the slide leaves the same
       gap between two slower slides, which reads as MORE hurried rather than
       less — the cadence is dwell + move, and it is that number Tong is
       watching. 2200 + 640 → 3200 + 1000. */
    var LANE_DWELL = 3200;                 // how long a card is held
    var LANE_STEP_IN = [1500, 600];        // newest row, then the one under it

    var laneEls = [].slice.call(lanesEl.querySelectorAll('.lane'));
    var laneRows = laneEls.map(function (lane) {
      return [].slice.call(lane.querySelectorAll('.lane__s'));
    });
    // three copies of the same agents; the focus runs through the middle one
    var LANE_SET = laneEls.length / 3;
    var LANE_FIRST = LANE_SET;

    var lRaf = 0, lT0 = null, lAcc = 0, lVis = false;
    var laneAt = LANE_FIRST, laneSince = 0, laneWrapAt = 0;

    /* the whole-copy jump. Same frame either side of it, so the only thing
       that must not happen is a transition — which would animate a move the
       reader has no reason to see. */
    function laneSnap(n) {
      lanesEl.classList.add('is-snap');
      laneFocus(n);
      void lanesEl.offsetWidth;          // land the value before re-arming
      lanesEl.classList.remove('is-snap');
    }

    function laneFocus(n) {
      laneAt = n;
      lanesEl.style.setProperty('--lane-i', String(n));
      laneEls.forEach(function (l, k) {
        l.classList.toggle('is-focus', k === n);
        if (k !== n) l.classList.remove('is-live', 'is-warm');
      });
      /* N12: the shutter is armed one painted frame after the state class.
         Added together, `.is-live` and the transition play the loop's
         OPENING state as an animation — eight open rows sliding shut in
         front of the reader, because the resting frame has every row open. */
      var lane = laneEls[n];
      lane.classList.add('is-live');
      requestAnimationFrame(function () { lane.classList.add('is-warm'); });
    }

    function lanePaint(now) {
      lRaf = 0;
      if (!lVis || document.hidden) { lanePark(now); return; }
      if (lT0 === null) lT0 = now - lAcc;
      var t = lAcc = now - lT0;

      /* THE SNAP GETS ITS OWN TICK, IN THE MIDDLE OF THE DWELL. Doing it in
         the same turn as the next move made the whole thing rest on a forced
         reflow landing between two writes to the same property; if it did
         not, the browser coalesces them and the card slides RIGHT by three
         pitches — the one thing this figure must never do. Landing on the
         twin schedules the jump for after the move has settled, so every
         ANIMATED change is one card to the left and the only silent one
         happens while nothing else is moving. */
      if (laneWrapAt && t >= laneWrapAt) {
        laneSnap(laneAt - LANE_SET);
        laneWrapAt = 0;
      }

      if (t - laneSince >= LANE_DWELL + LANE_MOVE) {
        laneSince = t;
        laneFocus(laneAt + 1);
        if (laneAt >= LANE_FIRST + LANE_SET) laneWrapAt = t + LANE_MOVE + 60;
      }

      // only the focused lane runs; the rest are finished lists at rest
      var rows = laneRows[laneAt], lt = t - laneSince, live = null;
      rows.forEach(function (row, r) {
        var on = r > 1 || lt >= LANE_STEP_IN[r];
        row.classList.toggle('is-on', on);
        if (on && !live) live = row;       // the newest step present is the live one
      });
      rows.forEach(function (row) { row.classList.toggle('is-run', row === live); });

      lRaf = requestAnimationFrame(lanePaint);
    }

    function lanePark(now) {
      if (now && lT0 !== null) lAcc = now - lT0;
      lT0 = null;
    }

    function laneRun(on) {
      lVis = on;
      if (!on) {
        lanePark();
        if (lRaf) { cancelAnimationFrame(lRaf); lRaf = 0; }
        return;
      }
      if (!laneEls[LANE_FIRST].classList.contains('is-focus')) laneFocus(LANE_FIRST);
      if (!lRaf) lRaf = requestAnimationFrame(lanePaint);
    }

    /* OBSERVE THE BAND, NOT THE TRACK — and this is why this figure has never
       animated, before this rotation or after it. `.lanes` is `width:max-content`:
       twelve cards is about 3000px, of which only the band's ~420 is ever
       unclipped, so its intersection ratio tops out near 0.14 and a 0.25
       threshold can NEVER be met. The observer sat there forever saying the
       track was off screen while it was plainly in front of the reader.

       A threshold is a fraction OF THE OBSERVED ELEMENT, so it can only be
       asked of an element whose size means something. The band is the thing
       that is either on screen or not; the track is a strip that is mostly
       off the side of it by construction. */
    var laneBand = lanesEl.closest('.vs__viz') || lanesEl;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { laneRun(e.isIntersecting); });
      }, { threshold: 0.25 }).observe(laneBand);
    } else {
      laneRun(true);
    }
    doc.addEventListener('visibilitychange', function () {
      if (!document.hidden && lVis && !lRaf) lRaf = requestAnimationFrame(lanePaint);
    });
  }

  /* ── 3b3. the other two comparison figures, on a cue list ─────
     Cards B and D used to play a one-shot entrance and then sit there.
     Both loop now, and both loop on the same tiny engine so the page has
     one mechanism for this rather than three: a cycle length on the
     figure, a time on anything inside it, and one rAF reading the list
     every frame.

         data-loop="9600"   on the figure — the cycle, in ms
         data-cue="1200"    on a child — gets `.is-on` from then on
         data-until="2400"  optional — and loses it again at that point

     Card B's receipt takes one step at a time from that list; its chart
     wipes in once per cycle. Card D's run history fills bar by bar and
     the newest run fires last.

     THE RESTING FRAME IS THE FINISHED FIGURE. `.is-live` is added here
     and nowhere else, and every "not yet" rule in system.css is scoped
     under it, so no-JS, reduced motion and the moments before the
     observer fires all show the complete thing. */
  [].slice.call(doc.querySelectorAll('.arti[data-loop], .tsh[data-loop]'))
    .forEach(function (fig) {
      if (reduce) return;

      var span = parseInt(fig.dataset.loop, 10) || 9000;
      var cues = [].slice.call(fig.querySelectorAll('[data-cue]')).map(function (el) {
        var until = el.dataset.until;
        return [parseInt(el.dataset.cue, 10),
                until ? parseInt(until, 10) : Infinity, el];
      });
      if (!cues.length) return;

      var cRaf = 0, cT0 = null, cAcc = 0, cVis = false;

      function cuePaint(now) {
        cRaf = 0;
        if (!cVis || document.hidden) { cuePark(now); return; }
        if (cT0 === null) cT0 = now - cAcc;
        var t = cAcc = (now - cT0) % span;
        for (var i = 0; i < cues.length; i++) {
          cues[i][2].classList.toggle('is-on', t >= cues[i][0] && t < cues[i][1]);
        }
        cRaf = requestAnimationFrame(cuePaint);
      }

      // elapsed time survives a pause: resuming from zero replays the
      // whole cycle in front of a reader who is already looking at it
      function cuePark(now) {
        if (now && cT0 !== null) cAcc = (now - cT0) % span;
        cT0 = null;
      }

      function cueRun(on) {
        cVis = on;
        if (!on) {
          cuePark();
          if (cRaf) { cancelAnimationFrame(cRaf); cRaf = 0; }
          return;
        }
        fig.classList.add('is-live');
        if (!cRaf) cRaf = requestAnimationFrame(cuePaint);
      }

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) {
          es.forEach(function (e) { cueRun(e.isIntersecting); });
        }, { threshold: 0.25 }).observe(fig);
      } else {
        cueRun(true);
      }
      doc.addEventListener('visibilitychange', function () {
        if (!document.hidden && cVis && !cRaf) cRaf = requestAnimationFrame(cuePaint);
      });
    });

  /* ── 3c. the product window, scaled as one object ─────────────
     The window is laid out at its real desktop size (--app-dw) and scaled
     into the marketing column by one factor. offsetHeight reads the
     natural, untransformed height, so the wrapper can hold the scaled
     footprint and the right-hand column can match it. */
  var stageApp = doc.querySelector('.stage__app');
  var appWin = stageApp ? stageApp.querySelector('.appui') : null;
  var appWide = window.matchMedia('(min-width: 1081px)');

  function fitAppWindow() {
    if (!stageApp || !appWin) return;
    var stage = stageApp.closest('.stage');
    if (!appWide.matches) {
      stageApp.style.removeProperty('height');
      if (stage) { stage.style.removeProperty('--app-fit'); stage.style.removeProperty('--app-nh'); }
      return;
    }
    var w = stageApp.clientWidth;
    var dw = parseFloat(getComputedStyle(appWin).width) || 1280;
    if (!(w > 0)) return;
    var fit = Math.min(1, w / dw);
    var nh = appWin.offsetHeight;
    if (stage) {
      stage.style.setProperty('--app-fit', fit.toFixed(4));
      stage.style.setProperty('--app-nh', nh + 'px');
    }
  }

  fitAppWindow();
  window.addEventListener('resize', fitAppWindow, { passive: true });
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(fitAppWindow).catch(function () {});
  window.addEventListener('load', fitAppWindow);

  /* ── 3d. the Outputs exchange, played once on arrival ─────────
     Four beats: the ask, Okou thinking, its reply, the page it made.
     Every beat is in the resting DOM — `.is-live` is added by JS only —
     so reduced motion and no-JS get the finished exchange. */
  /* Every tab has its own exchange, and each one plays when its pane is shown
     — the first on arrival, the rest when the reel reaches them. One shared
     timeline function; `.is-live` is set only on the pane being played, so a
     pane at rest (and reduced motion, and no JS) shows the finished
     conversation rather than an empty ground. */
  var ochats = [].slice.call(doc.querySelectorAll('.ochat'));
  if (ochats.length && !reduce) {
    // Tightened: the old 3.4s to the result was a long time to hold someone at
    // a tab they did not choose. This still reads as an exchange — each beat
    // settles before the next — and everything is on screen inside 2.6s.
    // ask · thinking · reply · result — and then whatever a scene adds
    // after it. The Storefront thread continues past the payoff with a
    // second person, so the array is a floor rather than the whole list:
    // an index past the end lands one STEP after the last named beat.
    // Note the result now arrives at 2100, EARLIER than the 2600 this was
    // tightened to; the team beats are a coda, not a delay before it.
    var CUE = [0, 550, 1300, 2100];
    var CUE_STEP = 800;

    function cueAt(i) {
      return i < CUE.length ? CUE[i]
           : CUE[CUE.length - 1] + (i - CUE.length + 1) * CUE_STEP;
    }
    var SIDE = [450, 850];             // the two connectors, as Okou reaches
    var PAGE = 300;                    // the page lands in its window, early
    // how long after the last message the artifact slides in. Long enough
    // to read as a consequence of the exchange rather than part of it.
    var LAND_AFTER = 260;
    var oRaf = 0, oT0 = null, oPane = null;

    function playPane(pane) {
      if (!pane || pane === oPane) return;
      if (oRaf) { cancelAnimationFrame(oRaf); oRaf = 0; }
      // hand the previous pane back its finished state
      if (oPane) {
        oPane.classList.remove('is-live');
        var prev = oPane.closest('.ostage');
        /* `is-landed` goes with `is-live`. Left behind, the next tab opens
           already landed and never plays its centred beat — and the tab
           after that inherits it too. */
        if (prev) prev.classList.remove('is-live', 'is-landed');
      }
      oPane = pane;
      pane.classList.add('is-live');
      var stage = pane.closest('.ostage');
      if (stage) stage.classList.add('is-live');
      oT0 = null;
      oRaf = requestAnimationFrame(oTick);
    }

    function oTick(now) {
      oRaf = 0;
      if (!oPane) return;
      if (oT0 === null) oT0 = now;
      var t = now - oT0;
      var stage = oPane.closest('.ostage');
      [].slice.call(oPane.querySelectorAll('.ochat__row')).forEach(function (row, i) {
        // A SCENE MAY STATE ITS OWN TIMELINE. The shared array is indexed
        // by row order, which couples every scene's timing to every other
        // scene's row count — the Slack scene has seven rows and a ghost
        // line that is not in the message flow at all. `data-cue` and
        // `data-until` let it say what it means; the other six keep the
        // array and the class-based typing case.
        var from = row.dataset.cue !== undefined ? +row.dataset.cue : cueAt(i);
        var until = row.dataset.until !== undefined ? +row.dataset.until : Infinity;
        var on = t >= from && t < until;
        if (row.dataset.cue === undefined &&
            row.classList.contains('ochat__row--typing')) {
          on = t >= CUE[1] && t < CUE[2];   // thinking, then it is replaced
        }
        row.classList.toggle('is-on', on);
      });
      if (stage) {
        [].slice.call(stage.querySelectorAll('.ocard')).forEach(function (c, i) {
          c.classList.toggle('is-on', t >= SIDE[i]);
        });
        var win = stage.querySelector('.tplwin');
        if (win) win.classList.toggle('is-on', t >= PAGE);
      }
      var rows = oPane.querySelectorAll('.ochat__row');
      var last = cueAt(rows.length - 1);
      for (var k = 0; k < rows.length; k++) {
        if (rows[k].dataset.cue !== undefined) last = Math.max(last, +rows[k].dataset.cue);
      }
      /* THE PAGE ARRIVES WHEN THE CONVERSATION IS DONE, not on a clock of
         its own. `last` is the final message's cue, so the landing is
         stated against the exchange rather than a number that has to be
         re-guessed every time a scene gains a row. Until then the row is
         centred and the artifact is off to the right. */
      if (stage) stage.classList.toggle('is-landed', t >= last + LAND_AFTER);
      if (t < last + 900) oRaf = requestAnimationFrame(oTick);
    }

    // the visible pane is whichever scene is on; watch the section, not each pane
    var outputs = doc.getElementById('outputs');
    if (outputs && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var on = doc.querySelector('.scene.is-on .ochat');
          if (on) playPane(on);
        });
      }, { threshold: 0.25 }).observe(outputs);
    }
    // and replay whenever the reel lands on a new pane
    doc.addEventListener('okou:scene', function () {
      var on = doc.querySelector('.scene.is-on .ochat');
      if (on) playPane(on);
    });
  }

  /* Every published page scrolls, and each window's hint stands down once its
     own page has been used. This was bound to `querySelector` — the FIRST
     window only — so six of the seven never dismissed their hint.

     A hint is also a lie if there is nothing to scroll, so it only appears
     once the image has loaded and is genuinely taller than the window. */
  [].slice.call(doc.querySelectorAll('.tplwin')).forEach(function (win) {
    var pane = win.querySelector('.tplwin__scroll');
    var hint = win.querySelector('.tplwin__hint');
    if (!pane) return;
    pane.addEventListener('scroll', function () {
      win.classList.toggle('is-scrolled', pane.scrollTop > 12);
    }, { passive: true });

    function checkOverflow() {
      if (!hint) return;
      hint.hidden = pane.scrollHeight <= pane.clientHeight + 8;
    }
    var img = pane.querySelector('img');
    if (img && !img.complete) img.addEventListener('load', checkOverflow);
    window.addEventListener('resize', checkOverflow, { passive: true });
    // A pane that is `display:none` measures 0 for both scrollHeight and
    // clientHeight, so a check at load would hide the hint on six of the seven
    // windows for good. Re-measure whenever a scene is actually shown.
    doc.addEventListener('okou:scene', checkOverflow);
    checkOverflow();
  });

  /* ── 3c. the floating header is as wide as what it carries ─────
     `.nav.is-stuck` insets by `50% - --nav-w-stuck/2` on both sides, so the
     number this writes is the only thing standing between a full-width bar
     and an object. Measure the three GROUPS and write to the BAR — never
     read the bar's own width back, which is the fault F23 is about: the
     stuck bar is already the size of the last answer, so measuring it would
     ratchet.

     `scrollWidth` on each group is its content width and does not change
     when the grid's 1fr columns collapse around it, which is what makes
     this stable across the two states. */
  (function () {
    var bar = doc.getElementById('nav');
    if (!bar) return;
    var groups = ['.nav__logo', '.nav__links', '.nav__auth']
      .map(function (sel) { return bar.querySelector(sel); })
      .filter(Boolean);
    if (groups.length < 2) return;

    function measure() {
      // display:none at narrow widths measures 0; leave the last good value
      var links = bar.querySelector('.nav__links');
      if (links && !links.getClientRects().length) return;
      // MEASURE IT UNSTUCK. Stuck, the bar is already the width of the last
      // answer and the groups inside it are squeezed to fit, so measuring
      // there ratchets the number DOWN a little every time — the first run
      // came back 826px and wrapped "GET STARTED" onto two lines. The class
      // comes off for the read and goes straight back on, in one frame.
      var was = bar.classList.contains('is-stuck');
      if (was) bar.classList.remove('is-stuck');
      var cs = getComputedStyle(bar);
      var gap = parseFloat(cs.columnGap) || 0;
      var padX = parseFloat(cs.paddingLeft) || 0;
      // rects, not scrollWidth: scrollWidth is an integer and these three
      // groups are all fractional, so the floors added up to a bar ~4px too
      // narrow — which is a wrapped button, not a rounding error
      var w = groups.reduce(function (a, el) {
        return a + el.getBoundingClientRect().width;
      }, 0);
      w += gap * (groups.length - 1) + padX * 2;
      if (was) bar.classList.add('is-stuck');
      bar.style.setProperty('--nav-w-stuck', Math.ceil(w) + 1 + 'px');
    }

    window.addEventListener('resize', measure, { passive: true });
    window.addEventListener('load', measure);
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(measure);
    measure();
  })();

  /* ── 4. one scroll loop: header state + step ladder ───────────
     The ladder is a pinned section taller than its own viewport, and how
     far you have scrolled through that pin IS which step is open — one
     step per equal share of the travel. Below the pinning breakpoint the
     section is an ordinary stack, so the step nearest the reading line
     wins instead. Clicking a step scrolls the pin to where that step
     lives, so the page never disagrees with itself. */
  var nav = doc.getElementById('nav');
  var ladder = doc.getElementById('ladder');
  var view = ladder ? ladder.querySelector('.ladder__view') : null;
  var steps = ladder ? [].slice.call(ladder.querySelectorAll('.step')) : [];
  var stages = ladder ? [].slice.call(ladder.querySelectorAll('.wfstage')) : [];
  var pinned = window.matchMedia('(min-width: 1081px)');
  var lock = 0;
  var cur = -1;

  var deck = ladder ? ladder.querySelector('.ladder__deck') : null;
  var panels = ladder ? [].slice.call(ladder.querySelectorAll('.ladder__panel')) : [];

  /* One scene, four states. The four sliding panels are gone: `data-step`
     on the scene is the only thing that changes, and every object in it
     reads that one attribute — same mechanic as the control section, and
     the reason the four steps now read as one story rather than four
     unrelated pictures. */
  var wfScene = doc.getElementById('wfScene');

  /* ───────────────────────────────────────────────────────────────────
     15. the scene's two loops

     Beat 1 runs a RUNNER down the five-connector chain; beat 3 hands the
     card from one teammate to the next. Both are loops, both stop dead
     when their beat is not showing, and both are the same shape: an index
     that advances on a timer and writes one class.

     They exist because the two beats were making a claim in text that
     the picture was not making. "It does the job" was a list that faded
     in, and "anyone can run it" was a caption under three static faces.
     ─────────────────────────────────────────────────────────────────── */
  var runCard = doc.querySelector('.wfo--run');
  var runSteps = [].slice.call(doc.querySelectorAll('.wfo__steps li'));
  var runner = doc.querySelector('.wfo__runner');
  var faces = [].slice.call(doc.querySelectorAll('.wfo__who'));
  var byTag = doc.querySelector('.wfo__tag--by');
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var chainAt = 0, chainTimer = null, handAt = 0, handTimer = null;

  var postCard = doc.querySelector('.wfo--post');

  function chainTo(i) {
    if (!runner || !runSteps.length) return;
    chainAt = i % runSteps.length;
    /* the last step is a DELIVERY, not one more row lighting up: the
       message turns up in #growth. THE ASK STAYS PUT. It used to be sent
       away on this same cue, and one card leaving as another arrived in its
       box read as the question turning into the answer — 为什么一开始的chat，
       在之后消失了变成了一个slack里agent的反馈. Both are on the canvas at
       once now, which is also what happens in the channel. */
    var landed = chainAt === runSteps.length - 1;
    if (postCard) postCard.classList.toggle('is-in', landed);
    runSteps.forEach(function (li, n) {
      li.classList.toggle('is-live', n === chainAt);
      li.classList.toggle('is-done', n < chainAt);
    });
    var mk = runSteps[chainAt].querySelector('.wfo__mk');
    if (mk) {
      /* offsetTop is measured against the list, which is the runner's
         containing block — no getBoundingClientRect, so the scale the whole
         scene is under cannot leak into the number. */
      runner.style.setProperty('--ry', (mk.offsetTop - runner.offsetTop) + 'px');
    }
  }

  function chainRun(on) {
    if (chainTimer) { clearTimeout(chainTimer); chainTimer = null; }
    if (runCard) runCard.classList.toggle('is-running', !!on);
    if (!on) {
      /* clear both classes — `chainTo(0)` would leave row 0 live, and a live
         row hides its own connector mark, so the Gmail step simply vanished
         on every beat after the first. */
      runSteps.forEach(function (li) { li.classList.remove('is-live', 'is-done'); });
      if (postCard) postCard.classList.remove('is-in');
      return;
    }
    if (reduced) { chainTo(runSteps.length - 1); return; }
    chainTo(0);
    /* the landing holds for two steps' worth before the loop restarts —
       an arrival that leaves as fast as a step is not an arrival */
    var tick = function () {
      var last = chainAt === runSteps.length - 1;
      chainTo(chainAt + 1);
      chainTimer = setTimeout(tick, last ? 1150 : (chainAt === runSteps.length - 1 ? 2400 : 1150));
    };
    chainTimer = setTimeout(tick, 1150);
  }

  function handTo(i) {
    if (!faces.length) return;
    handAt = i % faces.length;
    /* The ring is the holder's own seam now, so there is nothing to move:
       the class IS the state. The halo this used to position — and the
       `--hx` offsetLeft it needed — are gone. */
    faces.forEach(function (f, n) { f.classList.toggle('is-holding', n === handAt); });
    if (byTag) {
      var f = faces[handAt];
      var img = f.querySelector('img');
      var av = byTag.querySelector('.wfo__byav');
      var nm = byTag.querySelector('b');
      if (av && img) av.style.backgroundImage = 'url(' + img.getAttribute('src') + ')';
      if (nm) nm.textContent = f.dataset.who || '';
    }
  }

  function handRun(on) {
    if (handTimer) { clearInterval(handTimer); handTimer = null; }
    if (!on) { faces.forEach(function (f) { f.classList.remove('is-holding'); }); return; }
    handTo(0);
    if (reduced) return;
    handTimer = setInterval(function () { handTo(handAt + 1); }, 1900);
  }

  function syncStages(n) {
    if (wfScene) wfScene.dataset.step = n;
    chainRun(n === '1');
    handRun(n === '3');
    stages.forEach(function (s) { s.classList.toggle('is-on', s.dataset.step === n); });
    // the deck scrolls to the step instead of the panels being swapped out,
    // so the three that are not showing have to be hidden from a reader
    panels.forEach(function (p, i) {
      var on = p.dataset.step === n;
      // `inert`, not just aria-hidden: these panels are on screen-adjacent and
      // still hold real buttons, so hiding them from a reader without also
      // taking them out of the tab order leaves keyboard focus walking into
      // a panel nobody can see.
      if ('inert' in p) p.inert = !on;
      p.setAttribute('aria-hidden', on ? 'false' : 'true');
      if (on && deck) deck.style.setProperty('--i', i);
    });
  }

  function setStep(i) {
    if (i === cur) return;
    cur = i;
    steps.forEach(function (s, n) {
      var on = n === i;
      if (!on) s.style.removeProperty('--p');
      s.classList.toggle('is-active', on);
      var t = s.querySelector('.step__t');
      if (t) t.setAttribute('aria-expanded', on ? 'true' : 'false');
    });
    syncStages(steps[i].dataset.step);
  }

  function pinTravel() {
    return view ? ladder.offsetHeight - view.offsetHeight : 0;
  }

  function pinTop() {
    var t = view ? parseFloat(getComputedStyle(view).top) : 0;
    return t === t ? t : 0;                 // NaN when `top` reads `auto`
  }

  // How far through the pin you are, as one number. Its integer part is which
  // row is open; its fraction is how full that row's progress bar should be —
  // so the bar filling and the step tipping over are the SAME number, and the
  // screen beside it can never slide before the bar reaches the end.
  function pinProgress() {
    var travel = pinTravel();
    if (travel <= 0) return 0;
    var p = (pinTop() - ladder.getBoundingClientRect().top) / travel;
    return Math.max(0, Math.min(0.99999, p)) * steps.length;
  }

  function readStep() {
    return Math.min(steps.length - 1, Math.floor(pinProgress()));
  }

  /* Fit each screen into the mat. Every stage lays out at one design width
     and is scaled to whatever the mat currently is — the mat is fluid, so a
     hard-coded height is only ever right at one viewport. */
  var FIT_W = 760;

  function fitStages() {
    var panel = ladder && ladder.querySelector('.ladder__panel');
    if (!panel || !stages.length) return;
    var cs = getComputedStyle(panel);
    var bw = panel.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    var bh = panel.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    if (!(bw > 0 && bh > 0)) return;
    stages.forEach(function (st) {
      st.style.setProperty('--dw', FIT_W + 'px');
      st.classList.add('is-measuring');
      var h = st.getBoundingClientRect().height;
      st.classList.remove('is-measuring');
      if (!h) return;
      st.style.setProperty('--dh', Math.round(h) + 'px');
      st.style.setProperty('--fit', Math.min(bw / FIT_W, bh / h).toFixed(4));
    });
  }

  function paintProgress() {
    if (!pinned.matches || !view || cur < 0) return;
    var local = pinProgress() - cur;
    steps[cur].style.setProperty('--p', Math.max(0, Math.min(1, local)).toFixed(4));
  }

  /* ── the header's two states, both read by observer ────────────
     A scroll listener runs on every frame the page moves, whether or not
     anything it computes has changed. Both of these are BOOLEANS that flip
     at a line, which is exactly what IntersectionObserver is for, so
     neither of them costs a frame any more.

     STUCK: a 1px sentinel sits at the top of the document. While it is
     visible the page has not moved; the moment it leaves, the header
     floats. No scroll position is read at all.

     DARK: the page's dark bands declare themselves with data-ground="dark",
     and the observer's rootMargin puts the trigger line exactly where the
     header's midline sits. A band that moves, or a new one, still needs no
     number changed here — the geometry is expressed once, in the margin. */
  /* Two kinds of ground the header has to answer to, watched the same way:
     the page's dark bands, and the hero's brand orange. Both are read from
     what is actually BEHIND the bar's midline rather than from a scroll
     offset, so moving a section never leaves the header lying about it. */
  var darkGrounds = [].slice.call(doc.querySelectorAll('[data-ground="dark"]'));
  var brandGrounds = [].slice.call(doc.querySelectorAll('[data-ground="brand"]'));

  var sentinel = doc.createElement('div');
  sentinel.setAttribute('aria-hidden', 'true');
  sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:28px;pointer-events:none;';
  doc.body.appendChild(sentinel);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) {
      if (nav) nav.classList.toggle('is-stuck', !e[0].isIntersecting);
    }).observe(sentinel);

    /* The header's midline, as a viewport inset: everything above it is
       "behind the bar". --nav-top + half the stuck height — READ, not
       retyped. The two literals here were 12 and 54, and 54 stopped being
       the stuck height the day it became 58; a constant copied out of a
       token is a token that no longer has one consumer. */
    function navPx(name, fallback) {
      var v = parseFloat(getComputedStyle(doc.documentElement)
        .getPropertyValue(name));
      return v === v ? v : fallback;
    }
    var mid = navPx('--nav-top', 12) + navPx('--nav-h-stuck', 58) / 2;
    var darkObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.target.__overNav = e.isIntersecting; });
      if (!nav) return;
      nav.classList.toggle('is-dark', darkGrounds.some(function (el) { return el.__overNav; }));
      nav.classList.toggle('is-brand', brandGrounds.some(function (el) { return el.__overNav; }));
    }, { rootMargin: -mid + 'px 0px ' + (mid - window.innerHeight) + 'px 0px' });
    darkGrounds.concat(brandGrounds).forEach(function (el) { darkObserver.observe(el); });
  }

  function readScroll() {
    // stacked, the frame is stuck over the list and all four paragraphs are
    // open at once: there is no scroll distance left to read a step from, so
    // the frame follows taps instead and nothing is hidden if nobody taps
    if (steps.length && view && pinned.matches && performance.now() >= lock) {
      setStep(readStep());
      paintProgress();
    }
  }

  /* The ladder is the ONE thing left that needs a continuous read: it maps
     scroll distance through a pinned block onto a step index and a progress
     fraction, which is a position, not a boolean. It is rAF-throttled, and
     it is only attached while the ladder is actually pinned — below that
     breakpoint the page carries no scroll listener at all. */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { readScroll(); ticking = false; });
  }
  function syncScrollListener() {
    window.removeEventListener('scroll', onScroll);
    if (steps.length && view && pinned.matches) {
      window.addEventListener('scroll', onScroll, { passive: true });
    }
  }
  syncScrollListener();
  if (pinned.addEventListener) pinned.addEventListener('change', syncScrollListener);
  window.addEventListener('resize', function () {
    cur = -1; fitStages(); readScroll();
  }, { passive: true });
  fitStages();
  readScroll();
  // web fonts change every one of those measurements
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(fitStages).catch(function () {});

  steps.forEach(function (s, i) {
    s.addEventListener('click', function () {
      setStep(i);
      if (!pinned.matches || !view) return;
      var travel = pinTravel();
      if (travel <= 0) return;
      lock = performance.now() + 900;      // let the scroll settle first
      window.scrollTo({
        top: ladder.getBoundingClientRect().top + window.scrollY - pinTop() +
             travel * ((i + 0.5) / steps.length),
        behavior: reduce ? 'auto' : 'smooth'
      });
    });
  });

  /* ── 6. hero: one orchestrated page-load sequence ───────────── */
  var hero = doc.getElementById('hero');
  if (hero) {
    var seq = [].slice.call(hero.querySelectorAll('[data-in]'));
    var start = function () {
      seq.forEach(function (el, i) {
        el.style.setProperty('--rd', (reduce ? 0 : 90 + i * 110) + 'ms');
        el.classList.add('is-in');
        if (el.classList.contains('mark')) el.classList.add('is-lit');
        el.querySelectorAll('.mark').forEach(function (mk) {
          window.setTimeout(function () { mk.classList.add('is-lit'); }, 500 + i * 110);
        });
      });
    };
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(start).catch(start);
    else window.addEventListener('load', start);
    window.setTimeout(start, 1200);      // never let the fold wait on a font
  }

  /* ── 7b. the theme control ──────────────────────────────────────
     The page follows the system by default. A click pins it to one mode
     and remembers that; nothing is written until someone actually asks,
     so a visitor who never touches it keeps following their OS. */
  var themeBtn = doc.getElementById('themeToggle');
  if (themeBtn) {
    var root = doc.documentElement;
    var systemDark = window.matchMedia('(prefers-color-scheme: dark)');

    function isDark() {
      var pinned = root.getAttribute('data-theme');
      return pinned ? pinned === 'dark' : systemDark.matches;
    }
    function paintToggle() {
      var dark = isDark();
      themeBtn.setAttribute('aria-pressed', String(dark));
      themeBtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    }

    try {
      var saved = window.localStorage.getItem('okou-theme');
      if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved);
    } catch (e) { /* private mode: fall through to the system preference */ }

    paintToggle();
    systemDark.addEventListener('change', paintToggle);
    themeBtn.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { window.localStorage.setItem('okou-theme', next); } catch (e) {}
      paintToggle();
    });
  }

  /* ── 8. mobile navigation ───────────────────────────────────── */
  var burger = doc.getElementById('burger');
  if (burger && nav) {
    burger.addEventListener('click', function () { nav.classList.toggle('is-open'); });
    nav.querySelectorAll('.nav__links a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('is-open'); });
    });
  }

  /* ── 9. hero statement rotator ──────────────────────────────── */
  var box = doc.getElementById('rotator');
  if (box) {
    var items = [].slice.call(box.querySelectorAll('.rot'));
    if (items.length > 1 && !reduce) {
      var r = 0, held = false;
      box.addEventListener('mouseenter', function () { held = true; });
      box.addEventListener('mouseleave', function () { held = false; });
      window.setInterval(function () {
        if (held || document.hidden) return;
        var out = items[r];
        out.classList.remove('is-on');
        out.classList.add('is-out');
        window.setTimeout(function () { out.classList.remove('is-out'); }, 620);
        r = (r + 1) % items.length;
        items[r].classList.add('is-on');
      }, 4200);
    }
  }

  /* ── 10. role scenes: tabs swap the stage and the sentence ──── */
  var wrap = doc.getElementById('scenes');
  if (wrap) {
    var rail = wrap.querySelector('.tabs__rail');
    var viewport = wrap.querySelector('.tabs');
    var real = [].slice.call(wrap.querySelectorAll('.tab'));
    var panes = [].slice.call(wrap.querySelectorAll('.scene'));
    var line = doc.getElementById('scene-line');
    var N = real.length;

    // The one sentence that changes with the tab. No emoji: it was the only
    // pictogram on a page that has none.
    var LINES = {
      marketing:  ['builds', 'Maya’s', 'storefront.'],
      ads:        ['optimizes', 'Maya’s', 'ad spend.'],
      sales:      ['scores', 'Ravi’s', 'pipeline.'],
      engineering:['triages', 'Lin’s', 'error queue.'],
      product:    ['writes', 'Sofia’s', 'export spec.'],
      ops:        ['sends', 'Noah’s', 'Monday digest.'],
      leadership: ['rebuilds', 'Dana’s', 'board deck.']
    };
    function writeLead(key) {
      if (!line || !LINES[key]) return;
      var p = LINES[key];
      // no accent here: at this size, on the grey ground, orange text cannot
      // clear 4.5:1. The lead is emphasised by ink and weight.
      line.textContent = 'Okou ' + p[0] + ' ' + p[1] + ' ' + p[2];
    }

    /* ── the reel loops ─────────────────────────────────────────────
       Three copies of the strip: [clones][real][clones]. Only the middle
       set is a real tablist — the outer two are decoration, hidden from
       assistive tech and out of the tab order, so a screen reader still
       hears seven tabs and not twenty-one.

       Advancing off either end animates into a clone and then silently
       re-seats on the matching real tab with the transition switched off.
       The visitor sees one continuous reel; the DOM never grows. */
    var clonesBefore = [], clonesAfter = [];
    if (rail && !reduce) {
      real.forEach(function (t) {
        [clonesBefore, clonesAfter].forEach(function (bucket) {
          var c = t.cloneNode(true);
          c.removeAttribute('role');
          c.removeAttribute('aria-selected');
          c.setAttribute('aria-hidden', 'true');
          c.tabIndex = -1;
          c.classList.remove('is-on');
          bucket.push(c);
        });
      });
      clonesBefore.forEach(function (c) { rail.insertBefore(c, real[0]); });
      clonesAfter.forEach(function (c) { rail.appendChild(c); });
      // a clone is still clickable: it selects the tab it is a copy of
      clonesBefore.concat(clonesAfter).forEach(function (c) {
        c.addEventListener('click', function () { show(c.dataset.scene, true); });
      });
    }

    // every element in the rail, in order — index N…2N-1 is the real set
    function railItems() {
      return rail ? [].slice.call(rail.children) : real;
    }

    /* reelCur / reelT0, not cur / t0. Both names were already taken at the
       top level of this IIFE — `cur` by the step ladder's current step and
       `t0` by the parallel-work figure's clock — and `var` is function
       scoped, so these were literally the same variables. Scrolling the
       ladder rewrote the reel's tab index; the two animation clocks reset
       each other whenever both sections were on screen at once. */
    var reelCur = 0;          // index into the REAL set
    var slot = clonesBefore.length ? N : 0;   // which rail item is centred

    function markSlot(i) {
      railItems().forEach(function (t, n) {
        var on = n === i;
        t.classList.toggle('is-on', on);
        if (!on) t.style.removeProperty('--p');
      });
    }

    // Slide the rail so the chosen item sits on the viewport's centre line.
    // The selection is the fixed thing and the rail moves under it.
    function centreSlot(i, animate) {
      if (!rail || !viewport) return;
      var t = railItems()[i];
      if (!t) return;
      if (!animate) rail.style.transition = 'none';
      var x = (viewport.clientWidth / 2) - (t.offsetLeft + t.offsetWidth / 2);
      rail.style.setProperty('--x', Math.round(x) + 'px');
      if (!animate) { void rail.offsetWidth; rail.style.transition = ''; }
    }

    /* Move to a real tab index, optionally by way of a clone so the reel
       appears to keep going in one direction. `viaSlot` is the rail item to
       animate to; once it lands we re-seat silently on the real one. */
    var show = function (key, fromUser, viaSlot) {
      var i = 0;
      real.forEach(function (t, n) { if (t.dataset.scene === key) i = n; });
      reelCur = i;
      if (line) {
        line.classList.add('is-swapping');
        window.setTimeout(function () {
          writeLead(key);
          line.classList.remove('is-swapping');
        }, reduce ? 0 : 240);
      }
      real.forEach(function (t, n) {
        t.setAttribute('aria-selected', n === i ? 'true' : 'false');
        t.tabIndex = n === i ? 0 : -1;
      });
      panes.forEach(function (p) {
        var on = p.dataset.scene === key;
        p.classList.remove('is-on');
        if (on) { void p.offsetWidth; p.classList.add('is-on'); }
      });
      // the exchange in the pane that just arrived plays from the top
      doc.dispatchEvent(new CustomEvent('okou:scene'));

      // ONE item is selected — the one on the centre line. Lighting every
      // copy of the scene would show a second highlighted tab at the edge
      // of the mask, which is the seam the clones exist to hide.
      var home = clonesBefore.length ? N + i : i;
      var target = (viaSlot !== undefined) ? viaSlot : home;
      markSlot(target);
      if (target !== home) {
        slot = target;
        centreSlot(slot, true);
        // when the slide finishes, re-seat on the identical real tab with
        // the transition off — same picture, so nothing is seen
        window.setTimeout(function () {
          slot = home;
          markSlot(slot);
          markSlot(slot);
    centreSlot(slot, false);
        }, 660);
      } else {
        slot = home;
        centreSlot(slot, true);
      }
      reelT0 = null;                       // a new tab gets a full turn
      if (fromUser) held = true;       // and a click parks the carousel
    };

    real.forEach(function (t) {
      t.addEventListener('click', function () { show(t.dataset.scene, true); });
    });
    // arrow keys move through the reel, as a tablist should
    if (rail) {
      rail.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        var n = (reelCur + d + N) % N;
        show(real[n].dataset.scene, true, clonesBefore.length ? slot + d : undefined);
        real[n].focus();
      });
    }
    window.addEventListener('resize', function () { centreSlot(slot, false); }, { passive: true });
    if (doc.fonts && doc.fonts.ready) {
      doc.fonts.ready.then(function () { centreSlot(slot, false); }).catch(function () {});
    }
    centreSlot(slot, false);

    /* ── the tab is its own progress bar ────────────────────────────
       It fills across its width and hands over to the next one, and the
       reel always travels the same way so it reads as one continuous
       strip rather than snapping back to the start.

       It pauses off screen, in a background tab and under reduced motion.
       It does NOT pause on hover: the progress is what tells you the
       thing is going to change, and freezing it the moment a pointer
       crosses the section makes the whole section feel stuck. Keyboard
       focus still parks it — a keyboard user has no other way to hold it
       — and any click parks it for good, because from then on the
       visitor is driving. */
    // The exchange inside a pane runs ~4.3s; a dwell of 7.2 left it barely
    // three seconds at rest before the reel moved on. Nine gives the finished
    // state time to be looked at, which is the point of showing it.
    /* MS PER TAB, and it has to cover assembly AND reading. The exchange's
       last message is cued at ~4.1s, the artifact lands at ~4.4s and its
       spring settles by ~5.2s — so 9000 left under four seconds with the
       finished frame on screen, and *"用户还没看完内容就切tab了"*. 13s gives
       the settled frame about 7.8s, which is the part anyone actually reads. */
    var DWELL = 13000;                // ms per tab
    /* `reelHeld`, not `reelHeld`: the hero rotator two hundred lines up already
       declares one, and `var` is function-scoped in this single IIFE. They
       were one flag — hovering the hero headline paused this reel, and a
       click here parked the hero rotator for good (tools/scopes.py). */
    var reelT0 = null, tRaf = 0, onScreen = false, reelHeld = false, kbd = false;

    function tick(now) {
      tRaf = 0;
      if (!onScreen || reelHeld || kbd || document.hidden || reduce) { reelT0 = null; return; }
      if (reelT0 === null) reelT0 = now;
      var p = (now - reelT0) / DWELL;
      if (p >= 1) {
        var next = (reelCur + 1) % N;
        show(real[next].dataset.scene, false, clonesBefore.length ? slot + 1 : undefined);
        p = 0;
      }
      var onEl = railItems()[slot];
      if (onEl) onEl.style.setProperty('--p', Math.min(1, p).toFixed(4));
      tRaf = requestAnimationFrame(tick);
    }
    function pump() { if (!tRaf) tRaf = requestAnimationFrame(tick); }

    if ('IntersectionObserver' in window && !reduce) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          onScreen = e.isIntersecting;
          if (onScreen) pump(); else reelT0 = null;
        });
      }, { threshold: 0.2 }).observe(wrap);
    }
    wrap.addEventListener('focusin', function () { kbd = true; reelT0 = null; });
    wrap.addEventListener('focusout', function () { kbd = false; pump(); });
    doc.addEventListener('visibilitychange', function () {
      if (!document.hidden) pump();
    });
  }

  /* ── 11. Slack channels switch the transcript ───────────────── */
  var ui = doc.getElementById('slackui');
  if (ui) {
    var chans = [].slice.call(ui.querySelectorAll('.slackui__ch'));
    var cpanes = [].slice.call(ui.querySelectorAll('.slackui__pane'));
    chans.forEach(function (c) {
      c.addEventListener('click', function () {
        chans.forEach(function (x) { x.classList.toggle('is-on', x === c); });
        cpanes.forEach(function (p) {
          p.classList.remove('is-on');
          if (p.dataset.ch === c.dataset.ch) { void p.offsetWidth; p.classList.add('is-on'); }
        });
      });
    });
  }

  /* ── 12. the testimonial rail's prev / next ─────────────────────
     Steps by exactly one card plus one gap, so the row always lands
     card-aligned instead of at an arbitrary offset. State is read back
     off the real scroll position rather than counted, which is the only
     version that stays true when the rail is also dragged or swiped. */
  /* `qrail`, NOT `rail`. This file is one IIFE and `var` is function-scoped,
     so a second `var rail` here reassigned the SAME variable the tab reel
     above holds its strip in. Init had already run, so the reel looked
     right and then silently stopped: every later markSlot/centreSlot
     operated on the testimonial rail instead, whose six children have no
     index 10. The panes and aria kept advancing, the highlight and the
     strip never moved again. */
  var railnav = doc.querySelector('.railnav');
  var qrail = doc.querySelector('.proof');
  if (qrail) {
    var qreal = [].slice.call(qrail.querySelectorAll('.qcell'));

    /* THE SET REPEATS THREE TIMES, and the reader is always in the middle
       copy. Centring a card is what this rail does now, and with a finite
       row that means the first card can only be centred with the entire
       left half of the section empty, and the last one with the right
       half empty — 37% of the rail, at the two positions a visitor is
       most likely to reach by pressing an arrow until it stops. Looping
       removes both voids and both dead arrows at once: there is no first
       card and no last one, so the fan is never half a fan.

       The clones are `aria-hidden` and `inert`, so the quotes are
       announced once and the six real cards are the only ones in the
       accessibility tree. They are also marked `is-in` because the reveal
       observer only ever watched the originals. */
    var qcells = qreal;
    if (qreal.length > 2) {
      var mkCopy = function (where) {
        qreal.forEach(function (c) {
          var copy = c.cloneNode(true);
          copy.classList.add('is-in');
          copy.setAttribute('aria-hidden', 'true');
          copy.inert = true;
          if (where === 'before') qrail.insertBefore(copy, qreal[0]);
          else qrail.appendChild(copy);
        });
      };
      mkCopy('before');
      mkCopy('after');
      qcells = [].slice.call(qrail.querySelectorAll('.qcell'));
    }
    var qloop = qcells.length > qreal.length;
    var btns = railnav ? [].slice.call(railnav.querySelectorAll('.railnav__b')) : [];

    /* offsetWidth, NOT getBoundingClientRect().width. The cards carry a
       scale() now, and a bounding rect reports the SCALED box — so the
       pitch would shrink with the cards, the buttons would step short of
       a full slot, and every distance below would be measured in a unit
       that changes as you scroll. offsetWidth is the layout width and
       does not move. */
    function step() {
      if (!qcells.length) return qrail.clientWidth;
      var gap = parseFloat(getComputedStyle(qrail).columnGap) || 0;
      return qcells[0].offsetWidth + gap;
    }

    /* THE SCALE CURVE, in one place. CSS reads `--d` and applies the same
       curve for the size; this is the JS copy of it, needed to work out
       how far each card has to be pulled back in. Keep the two in step. */
    function qscale(t) { return Math.max(0.76, 1 - 0.09 * t); }

    /* WHERE CARD n SHOULD SIT, measured from the centre card.
       Left alone, the cards keep their full pitch while shrinking inside
       it, so the visible gap GROWS with distance — 31px beside the centre
       card and 78px two out. Physically that is backwards: a fan
       compresses towards its edges, and the row read as though the far
       cards had been spaced by accident.

       So the gap is rebuilt from what is actually on screen. Between card
       n-1 and card n the distance is the scaled half of each of them plus
       a gap that scales too, which makes the space shrink with distance
       instead of growing. Everything is expressed as a translate, so the
       grid track — and therefore every snap position — never moves. */
    function qoffset(n) {
      var w = qcells.length ? qcells[0].offsetWidth : 0;
      var g = parseFloat(getComputedStyle(qrail).columnGap) || 0;
      var x = 0;
      for (var k = 1; k <= n; k++) {
        x += g * qscale(k) + w * (qscale(k - 1) + qscale(k)) / 2;
      }
      return x;
    }

    /* How far each card is from the rail's centre line, in cards. CSS
       reads `--d` for the size and the strength and `--x` for the pull —
       see .qcell in system.css. A rect's CENTRE is unaffected by a centred
       scale, so measuring centres here is safe even though the widths
       are not. The offset is interpolated between whole cards so a card
       halfway between two slots is halfway between two positions; without
       that the row would jump a few pixels at every slot boundary. */
    function depth() {
      var r = qrail.getBoundingClientRect();
      var mid = r.left + r.width / 2;
      var pitch = step() || 1;
      qcells.forEach(function (c) {
        var b = c.getBoundingClientRect();
        var signed = (b.left + b.width / 2 - mid) / pitch;
        var d = Math.abs(signed);
        var lo = Math.floor(d);
        var want = qoffset(lo) + (qoffset(lo + 1) - qoffset(lo)) * (d - lo);
        var x = (want - d * pitch) * (signed < 0 ? -1 : 1);
        c.style.setProperty('--d', String(Math.round(d * 1000) / 1000));
        c.style.setProperty('--x', Math.round(x * 100) / 100 + 'px');
      });
    }

    function sync() {
      if (railnav) {
        var max = qrail.scrollWidth - qrail.clientWidth;
        // a control for something that cannot happen is worse than none
        railnav.hidden = max < 4;
        // a looping rail has no ends, so neither arrow is ever dead
        btns[0].disabled = qloop ? false : qrail.scrollLeft <= 1;
        btns[1].disabled = qloop ? false : qrail.scrollLeft >= max - 1;
      }
      depth();
    }

    /* Put the reader back in the middle copy. The jump is exactly one set
       wide, onto identical content at an identical snap position, so
       nothing moves on screen — the rail simply never runs out.

       It happens on SCROLLEND, not during the scroll. Setting scrollLeft
       under a finger, or in the middle of a smooth scroll the arrows
       started, cancels the gesture; there is a whole set-width of slack on
       each side, so there is no hurry. `scrollend` where it exists, a
       short debounce where it does not. */
    function setWidth() { return qreal.length * step(); }
    function normalise() {
      if (!qloop) return;
      var w = setWidth();
      if (qrail.scrollLeft < w * 0.5) qrail.scrollLeft += w;
      else if (qrail.scrollLeft > w * 1.5) qrail.scrollLeft -= w;
    }

    /* one frame per scroll burst. A scroll event can fire many times per
       frame, and depth() reads layout on every card — unthrottled it is
       six forced reflows per event.

       `qOnScroll`, not `onScroll`: this file is one IIFE and not in strict
       mode, so a `function onScroll` in this block is copied out to the
       enclosing scope and overwrites the ladder's. `addEventListener` holds
       the function OBJECT so the ladder kept working — but its
       `removeEventListener(…, onScroll)` runs later, on resize, and by then
       the name resolved here. The ladder's scroll listener could never be
       detached, which is precisely what its own comment says it does.
       `tools/scopes.py` checks for this now. */
    var qTick = false;
    function qOnScroll() {
      if (qTick) return;
      qTick = true;
      requestAnimationFrame(function () { qTick = false; sync(); });
    }

    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        qrail.scrollBy({
          left: step() * Number(b.dataset.dir),
          behavior: reduce ? 'auto' : 'smooth'
        });
      });
    });

    /* Open on the first REAL card — the head of the middle copy — so the
       section starts on quote one with the set already fanning out on
       both sides. Guarded so a resize never yanks the rail back from
       wherever the reader has put it. */
    var qParked = false;
    function park() {
      if (qParked || !qcells.length) return;
      var i = qloop ? qreal.length : Math.floor((qcells.length - 1) / 2);
      var target = qcells[i].offsetLeft + qcells[i].offsetWidth / 2 - qrail.clientWidth / 2;
      if (target > 1) qrail.scrollLeft = target;
      qParked = true;
      sync();
    }

    var qEnd;
    qrail.addEventListener('scroll', qOnScroll, { passive: true });
    if ('onscrollend' in window) {
      qrail.addEventListener('scrollend', normalise);
    } else {
      qrail.addEventListener('scroll', function () {
        clearTimeout(qEnd);
        qEnd = setTimeout(normalise, 160);
      }, { passive: true });
    }
    window.addEventListener('resize', sync);
    // the avatars and the card art decide the final height and therefore
    // the final geometry; a first pass before they land measures a rail
    // that is about to move
    window.addEventListener('load', function () { park(); sync(); });
    sync();
    park();
  }

  /* ── 14. the language control ────────────────────────────────────
     A listbox, because a native <select> paints with the operating
     system's chrome and cannot be made to match anything. Everything the
     native one gave for free has to be given back by hand: open/close,
     Escape, click-away, arrow keys, Home/End, and focus returning to the
     button when the menu closes. */
  var lang = doc.getElementById('lang');
  if (lang) {
    var langBtn = lang.querySelector('.lang__btn');
    var langMenu = lang.querySelector('.lang__menu');
    var langCur = lang.querySelector('.lang__cur');
    var langOpts = [].slice.call(lang.querySelectorAll('.lang__opt'));

    function langOpen(open) {
      langMenu.hidden = !open;
      langBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        var sel = lang.querySelector('.lang__opt.is-on') || langOpts[0];
        sel.focus();
      }
    }

    function langPick(el) {
      langOpts.forEach(function (o) {
        var on = o === el;
        o.classList.toggle('is-on', on);
        o.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      langCur.textContent = el.textContent;
      langOpen(false);
      langBtn.focus();
    }

    langBtn.addEventListener('click', function () {
      langOpen(langMenu.hidden);
    });

    langOpts.forEach(function (o) {
      o.addEventListener('click', function () { langPick(o); });
    });

    langMenu.addEventListener('keydown', function (e) {
      var i = langOpts.indexOf(doc.activeElement);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        var n = (i + (e.key === 'ArrowDown' ? 1 : -1) + langOpts.length) % langOpts.length;
        langOpts[n].focus();
      } else if (e.key === 'Home') { e.preventDefault(); langOpts[0].focus(); }
      else if (e.key === 'End') { e.preventDefault(); langOpts[langOpts.length - 1].focus(); }
      else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (i > -1) langPick(langOpts[i]);
      } else if (e.key === 'Escape') { langOpen(false); langBtn.focus(); }
    });

    langBtn.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); langOpen(true); }
    });

    doc.addEventListener('click', function (e) {
      if (!lang.contains(e.target)) langOpen(false);
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !langMenu.hidden) { langOpen(false); langBtn.focus(); }
    });
  }

  /* ───────────────────────────────────────────────────────────────────
     14. the hero prompt box: every control is a locked door

     The box is the product's composer, so every control on it looks live.
     None of them can be — this is a marketing page — so all of them say
     the same thing: sign in. One note, moved under whichever control was
     pressed, rather than five notes or one that always sits in the middle
     and makes you look for what you just clicked.
     ─────────────────────────────────────────────────────────────────── */
  var pbox = doc.getElementById('pbox');
  var unlock = doc.getElementById('unlock');
  if (pbox && unlock) {
    var lastTrigger = null;

    function unlockOpen(trigger) {
      var box = pbox.getBoundingClientRect();
      var t = trigger.getBoundingClientRect();
      /* the popover is centred on the control and clamped inside the box by
         the CSS `clamp()`, so this only has to say where the control is */
      unlock.style.setProperty('--ux', (t.left + t.width / 2 - box.left) + 'px');
      unlock.hidden = false;
      lastTrigger = trigger;
      trigger.setAttribute('aria-expanded', 'true');
    }

    function unlockClose() {
      if (unlock.hidden) return;
      unlock.hidden = true;
      if (lastTrigger) lastTrigger.setAttribute('aria-expanded', 'false');
      lastTrigger = null;
    }

    /* the box types, and Enter sends — which is the same locked door as every
       control, so it opens the same note. Shift+Enter is a newline, as it is
       in the app. */
    var pboxIn = doc.getElementById('pboxIn');
    if (pboxIn) {
      pboxIn.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' || e.shiftKey) return;
        e.preventDefault();
        unlockOpen(doc.querySelector('.pbox__send'));
      });
      /* grow with what is typed, from the app's own 96px floor */
      pboxIn.addEventListener('input', function () {
        pboxIn.style.height = 'auto';
        pboxIn.style.height = Math.max(pboxIn.scrollHeight, 0) + 'px';
      });
    }

    [].slice.call(pbox.querySelectorAll('[data-unlock]')).forEach(function (btn) {
      btn.setAttribute('aria-controls', 'unlock');
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (lastTrigger === btn) { unlockClose(); return; }
        unlockOpen(btn);
      });
    });

    doc.addEventListener('click', function (e) {
      if (!unlock.contains(e.target)) unlockClose();
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !unlock.hidden) {
        var back = lastTrigger;
        unlockClose();
        if (back) back.focus();
      }
    });
    /* a popover pinned to a control has to follow it, and the control moves
       with the layout */
    window.addEventListener('resize', unlockClose);
  }

  /* ───────────────────────────────────────────────────────────────────
     16. #control · no player any more

     It was one: three steps on a 5.2s timer, a progress rule, arrow-key
     navigation, an IntersectionObserver, a `visibilitychange` handler and an
     N4 park-on-interaction rule — ~90 lines to show one of three pictures.
     With two claims left, both are simply on the page (system.css `.ctrl`),
     and the section has no JS at all. Deleting behaviour is the cheapest way
     to satisfy N8, N16 and N4 at once.
     ─────────────────────────────────────────────────────────────────── */

  /* ───────────────────────────────────────────────────────────────────
     17. the hero folds to card width

     One number, written to one custom property: 0 while the hero is full
     bleed, 1 once it has narrowed to the section cards' width. The CSS
     does everything else — the clip is `--fold * --card-gap` on each side
     and `--fold * --r-section` on the corners, so this file never names a
     pixel and the geometry stays in the stylesheet where it can be read
     next to the thing it belongs to.

     Written on `scroll` rather than driven by an animation timeline: this
     page supports browsers without `scroll()` and the fallback for a
     scroll-linked animation is no animation at all, which here means a
     hero that never folds. It is one property write per frame on one
     element, and the property only feeds a clip — no layout (N1).
     ─────────────────────────────────────────────────────────────────── */
  var fold = doc.getElementById('herofold');
  if (fold) {
    var heroEl = fold.querySelector('.hero');
    /* `foldTick`, not `ticking`: the ladder declares one at the top of this
       IIFE and `var` is function-scoped. Sharing it meant the ladder's
       handler set the flag first on every scroll event and this one read
       it as "already scheduled" and returned — the hero never folded. */
    var foldAt = -1, foldTick = false;

    function foldTravel() {
      /* the wrapper is one viewport plus the travel; the travel is what is
         left once the sticky hero has been read at full size */
      return Math.max(1, fold.offsetHeight - (heroEl ? heroEl.offsetHeight : 0));
    }

    function foldPaint() {
      foldTick = false;
      var top = fold.getBoundingClientRect().top;
      var p = Math.min(1, Math.max(0, -top / foldTravel()));
      /* three decimals: the clip is sub-pixel and writing every float
         change repaints for nothing */
      p = Math.round(p * 1000) / 1000;
      if (p === foldAt) return;
      foldAt = p;
      fold.style.setProperty('--fold', p);
    }

    window.addEventListener('scroll', function () {
      if (foldTick) return;
      foldTick = true;
      requestAnimationFrame(foldPaint);
    }, { passive: true });
    window.addEventListener('resize', foldPaint, { passive: true });
    foldPaint();
  }
})();
