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

  /* ── 3b2. the four lanes, played as four independent runs ─────
     The Codex card claims that several AIs get more done AT ONCE, and a
     frozen picture of four task lists cannot say "at once" — it says
     "four task lists". So each lane runs: its live step finishes, the
     tick takes the pulse's place, its duration wipes in, and the next
     step opens above it and pushes the older ones down past the cut.

     THE IRREGULARITY IS AUTHORED, and it is the only thing about this
     that is irregular. Each lane finishes a step on its own FIXED
     interval — 3.3, 3.6, 3.9, 4.3 seconds — starting from its own offset
     and looping on its own whole number of seconds. Every lane is
     therefore perfectly predictable on its own, and the four never
     coincide: 11 · 12 · 13 · 14 seconds realign once every 42 minutes.
     One even stagger across all four would read as a single progress bar
     drawn four times, which is the opposite of the sentence.

     THE BOARD ALSO TRAVELS, leftward, at a constant 22px a second, and
     it never stops and never comes back. At the product's own size only
     two agents fit in the band, and a card whose sentence is "several"
     should not have to be taken on trust — the track shows all four
     without shrinking any of them. 22 rather than the connector rails'
     26 (§7): those rails carry logos and nothing on them has to be read,
     while every row on this one is a sentence.

     The resting frame is the finished run. `.is-live` is added here and
     nowhere else, so no-JS, reduced motion and the moments before the
     observer fires all get the complete figure. */
  var lanesEl = doc.querySelector('.vs__viz--parallel .lanes');
  if (lanesEl && !reduce) {
    var LANE_CLOCK = [[2000, 3600, 12000],    // [first step, every, loop]
                      [1100, 3300, 11000],
                      [3800, 4300, 14000],
                      [2900, 3900, 13000]];
    // the two newest steps stand down a beat apart at the end of a lane's
    // loop, so the wrap reads as the list settling back rather than as a cut
    var LANE_FOLD = [700, 300];

    var LANE_PX_PER_SEC = 22;
    var LANE_SETS = 4;                        // agents in one copy of the track

    var laneEls = [].slice.call(lanesEl.querySelectorAll('.lane'));
    var laneRows = laneEls.map(function (lane) {
      return [].slice.call(lane.querySelectorAll('.lane__s'));
    });

    // elapsed time SURVIVES a pause. Without this, scrolling the card away
    // and back restarts the clock at zero, which snaps the track to its
    // start and rewinds every lane — the observer fires at 25% visible, so
    // you would watch it happen.
    var lRaf = 0, lT0 = null, lAcc = 0, lVis = false;

    /* SET is the distance from a lane to its own twin, gaps included, and
       LEAD is why the wrap is invisible rather than merely arithmetically
       correct. The band insets its content by --pad, and the track starts
       at that inset: with the travel running from zero, the strip to the
       LEFT of it has the previous agent's card behind it for the whole
       cycle and nothing behind it at the instant the travel resets. A
       26px sliver of white popping in the corner is not much, and it is
       the only thing in frame moving discontinuously, which is exactly
       what the eye is built to catch. Starting one lane in puts the whole
       visible window, inset included, inside the track's interior.

       Measured, not assumed: a lane and its twin land on the same
       `getBoundingClientRect()` to four decimals, and a pixel diff of the
       frame before and after a wrap is empty across every fully-visible
       lane. See docs/qa-checklist.md §4l2. */
    var laneSet = 0, laneLead = 0;

    function laneMeasure() {
      laneSet = laneEls.length > LANE_SETS
        ? laneEls[LANE_SETS].offsetLeft - laneEls[0].offsetLeft : 0;
      laneLead = laneSet / LANE_SETS;
    }

    function lanePaint(now) {
      lRaf = 0;
      if (!lVis || document.hidden) { lanePark(now); return; }
      if (lT0 === null) lT0 = now - lAcc;
      var t = lAcc = now - lT0;

      if (!laneSet) laneMeasure();
      if (laneSet) {
        lanesEl.style.setProperty('--pan',
          -(laneLead + (t / 1000 * LANE_PX_PER_SEC) % laneSet).toFixed(2) + 'px');
      }

      laneRows.forEach(function (rows, i) {
        // `% LANE_CLOCK.length`: the second copy of the board runs on the
        // first copy's clock, so lane 4 is lane 0's twin down to which step
        // is live. That is what leaves the wrap nothing to show.
        var c = LANE_CLOCK[i % LANE_CLOCK.length], lt = t % c[2], live = null;
        rows.forEach(function (row, r) {
          // everything below the top two is already on the board; the two
          // newest arrive on this lane's clock, newest last
          var on = r > 1 ||
            (lt >= c[0] + (1 - r) * c[1] && lt < c[2] - LANE_FOLD[r]);
          row.classList.toggle('is-on', on);
          if (on && !live) live = row;      // the newest step present is the live one
        });
        rows.forEach(function (row) { row.classList.toggle('is-run', row === live); });
      });
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
      if (!lanesEl.classList.contains('is-live')) {
        lanesEl.classList.add('is-live');
        // The shutter is armed one painted frame late. Added together,
        // `.is-live` and the transition would play the loop's opening
        // state as an animation — nine rows sliding shut in front of the
        // reader — because the resting frame has every row open.
        lRaf = requestAnimationFrame(function (ts) {
          lanePaint(ts);
          requestAnimationFrame(function () { lanesEl.classList.add('is-warm'); });
        });
        return;
      }
      if (!lRaf) lRaf = requestAnimationFrame(lanePaint);
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { laneRun(e.isIntersecting); });
      }, { threshold: 0.25 }).observe(lanesEl);
    } else {
      laneRun(true);
    }
    doc.addEventListener('visibilitychange', function () {
      if (!document.hidden && lVis && !lRaf) lRaf = requestAnimationFrame(lanePaint);
    });
    window.addEventListener('resize', laneMeasure);
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
    var oRaf = 0, oT0 = null, oPane = null;

    function playPane(pane) {
      if (!pane || pane === oPane) return;
      if (oRaf) { cancelAnimationFrame(oRaf); oRaf = 0; }
      // hand the previous pane back its finished state
      if (oPane) {
        oPane.classList.remove('is-live');
        var prev = oPane.closest('.ostage');
        if (prev) prev.classList.remove('is-live');
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

  function syncStages(n) {
    if (wfScene) wfScene.dataset.step = n;
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
  var darkGrounds = [].slice.call(doc.querySelectorAll('[data-ground="dark"]'));

  var sentinel = doc.createElement('div');
  sentinel.setAttribute('aria-hidden', 'true');
  sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:28px;pointer-events:none;';
  doc.body.appendChild(sentinel);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) {
      if (nav) nav.classList.toggle('is-stuck', !e[0].isIntersecting);
    }).observe(sentinel);

    /* The header's midline, as a viewport inset: everything above it is
       "behind the bar". --nav-top + half the stuck height. */
    var mid = 12 + 54 / 2;
    var darkObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.target.__overNav = e.isIntersecting; });
      if (!nav) return;
      nav.classList.toggle('is-dark', darkGrounds.some(function (el) { return el.__overNav; }));
    }, { rootMargin: -mid + 'px 0px ' + (mid - window.innerHeight) + 'px 0px' });
    darkGrounds.forEach(function (el) { darkObserver.observe(el); });
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
    var DWELL = 9000;                 // ms per tab
    var reelT0 = null, tRaf = 0, onScreen = false, held = false, kbd = false;

    function tick(now) {
      tRaf = 0;
      if (!onScreen || held || kbd || document.hidden || reduce) { reelT0 = null; return; }
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
       six forced reflows per event. */
    var qTick = false;
    function onScroll() {
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
    qrail.addEventListener('scroll', onScroll, { passive: true });
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

  /* ── 13. control: the scroll position IS the run's clock ─────────
     One IntersectionObserver over the five steps; whichever is nearest
     the middle of the viewport sets the window's beat. The stage reads
     one attribute and CSS does the rest, so there is exactly one place
     that knows which moment we are in. */
  var ctrlWin = doc.getElementById('ctrlframe');
  var ctrlSteps = [].slice.call(doc.querySelectorAll('.ctrl__step'));
  if (ctrlWin && ctrlSteps.length && 'IntersectionObserver' in window) {
    var seen = new Map();

    function pickBeat() {
      var best = null, bestRatio = 0;
      ctrlSteps.forEach(function (el) {
        var r = seen.get(el) || 0;
        if (r > bestRatio) { bestRatio = r; best = el; }
      });
      ctrlSteps.forEach(function (el) { el.classList.toggle('is-on', el === best); });
      if (best) ctrlWin.dataset.beat = best.dataset.beat;
    }

    /* HOW MUCH OF THE BAND a step covers, in pixels — not
       intersectionRatio. The ratio is measured against the ELEMENT, so
       it depends on how tall a step happens to be: at one viewport per
       step the most a step can ever score is band/step ≈ 0.24, and the
       0.25 threshold below would never fire. Comparing the intersected
       height directly asks the question the beat actually turns on —
       which step is sitting in the middle of the screen — and keeps
       asking it correctly whatever the steps are resized to. */
    var ctrlObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        seen.set(e.target, e.isIntersecting ? e.intersectionRect.height : 0);
      });
      pickBeat();
    }, {
      // a band across the middle of the viewport: the step sitting there
      // is the one being read, which is the one the stage should answer
      rootMargin: '-38% 0px -38% 0px',
      threshold: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.5, 0.75, 1]
    });
    ctrlSteps.forEach(function (el) { ctrlObserver.observe(el); });

    /* The first step is centred on the FRAME and every step's height has
       the frame as its floor — see --ctrl-beat in system.css. That needs
       the frame's height, and the frame's height is whatever the product
       mock inside it comes out at, so it is measured rather than guessed.
       Written on .ctrl so one custom property serves the whole section.

       THE MAXIMUM, NOT THE CURRENT VALUE. Beat 5 swaps the permission
       list for the activity trail and the window comes out 106px
       shorter; the naive version wrote that straight back, so
       --ctrl-beat shrank, all five steps shrank with it, the document
       lost 530px of height mid-scroll and the last beat never reached
       the middle of the screen at all — it had already been carried past
       it by the reflow it caused. Tracking the tallest state instead
       makes the stage a fixed object: it is also what `min-height` on
       .ctrl__frame reads, so the window stops resizing between beats.
       Converges either way round — measure the short beat first and the
       tall one raises it on its own ResizeObserver callback.

       A real viewport resize has to reset it, or the section would keep
       a stale maximum forever. Width is the tell: a beat change never
       alters it, a resize always does. */
    var ctrlGrid = doc.querySelector('.ctrl');
    var ctrlStage = doc.querySelector('.ctrl__stage');
    /* THE CONTENT, NOT THE FRAME. `ctrlWin` is #ctrlframe — the stage — and
       measuring it here made the stage measure itself: --ctrl-h is written
       back onto .ctrl__frame as its `height`, so offsetHeight returned the
       number we had just written, plus the padding, every pass. It ratchets
       (Math.max only ever goes up) by one `pad` per ResizeObserver callback
       until `fit` drops under 1 and the arithmetic finds a fixed point —
       963px of frame around 622px of content, converged and self-consistent
       and wrong. The band of empty grey under the mock was that gap. */
    var ctrlContent = doc.querySelector('.ctrl__win');
    var ctrlMax = 0, ctrlW = 0;

    /* THE STAGE FITS THE VIEWPORT, and its contents scale to match.
       The frame was as tall as the product mock inside it and nothing
       else — 722px, whatever the browser was. On a short window the
       screen simply ran off the bottom and the reader never saw the row
       the whole beat was about.

       So the mock keeps its own design size and the stage scales it, the
       way a photograph is fitted to a frame: one factor, everything
       inside it in proportion. `offsetHeight` ignores transforms, so the
       natural height keeps measuring correctly while the scale is on.

       A floor of 0.62: below that the product's own 13px rows stop being
       readable, and a picture nobody can read is worse than one that is
       cropped. Under it the frame simply keeps its height. */
    function ctrlHeight() {
      if (!ctrlGrid) return;
      if (!ctrlContent) return;
      if (ctrlContent.offsetWidth !== ctrlW) { ctrlW = ctrlContent.offsetWidth; ctrlMax = 0; }
      ctrlMax = Math.max(ctrlMax, ctrlContent.offsetHeight);

      var pad = 0;
      var frame = doc.querySelector('.ctrl__frame');
      if (frame) {
        var fs = getComputedStyle(frame);
        pad = parseFloat(fs.paddingTop) + parseFloat(fs.paddingBottom);
      }
      /* The DESIGN clearance, not the live `top` — we are about to write
         `top`, and reading it back would close the same loop that made the
         frame measure itself. --ctrl-clear is registered as a <length>, so
         this is a number rather than `calc(var(--nav-h) + clamp(…))`. */
      var top = parseFloat(getComputedStyle(ctrlGrid)
                  .getPropertyValue('--ctrl-clear')) || 0;
      /* A SYMMETRIC budget, because the frame is centred. The old version
         reserved the header's clearance at the top and only 16px at the
         bottom, which buys a slightly bigger mock and makes centring
         impossible: at 1280x800 the frame came out 671px in an 800px
         window, so (innerHeight - frameH) / 2 fell under the header and
         the offset had to clamp — leaving every statement 31px above the
         frame's centre. Reserving the same clearance at both ends means
         the frame always fits centred, and the mock pays for it with a
         few per cent of scale. */
      /* THE FRAME'S HEIGHT COMES FROM THE WINDOW, and the picture is
         centred in whatever that leaves. The frame used to hug the mock,
         which meant its proportions changed with the mock rather than with
         the browser, and the leftover air all collected on one side.
         Fitting is only meaningful while the stage is PARKED — once the
         layout stacks the frame simply flows, so it hugs its content
         again. Read the layout rather than repeating its breakpoint. */
      var parked = ctrlStage && getComputedStyle(ctrlStage).position === 'sticky';
      /* …up to a SHAPE cap. The frame is a picture frame, and at 2560x1440
         "as tall as the window allows" made it 616 wide by 1236 tall — a
         narrow grey slab with a card swimming in the middle of it. 1.6x its
         own width is the point past which it stops reading as a frame. The
         cap is on the frame's WIDTH, which does not depend on its height,
         so it cannot feed back. It only bites above about 1250px of window. */
      var frameW = ctrlStage ? ctrlStage.getBoundingClientRect().width : 0;
      var frameH = parked ? Math.min(window.innerHeight - 2 * top, frameW * 1.6)
                          : ctrlMax + pad;
      var avail = frameH - pad;
      var fit = !parked ? 1
              : Math.max(0.62, Math.min(1, ctrlMax ? avail / ctrlMax : 1));

      frameH = Math.round(frameH);
      ctrlGrid.style.setProperty('--ctrl-fit', fit.toFixed(4));
      ctrlGrid.style.setProperty('--ctrl-h', frameH + 'px');
      /* Centre the frame in the window so that "current" — which the
         observer decides at the middle of the viewport — is the same line
         the frame is centred on. Falls back to clearance on windows too
         short to centre in. */
      /* max() only matters once the 0.62 legibility floor binds and the
         frame is taller than the window can centre. */
      ctrlGrid.style.setProperty('--ctrl-top',
        Math.max(top, Math.round((window.innerHeight - frameH) / 2)) + 'px');
    }
    if ('ResizeObserver' in window) {
      new ResizeObserver(ctrlHeight).observe(ctrlContent || ctrlWin);
    } else {
      window.addEventListener('resize', ctrlHeight);
      window.addEventListener('load', ctrlHeight);
    }
    ctrlHeight();
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
})();
