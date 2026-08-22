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

  /* ── 3b. the parallel figure, played as a run ─────────────────
     One rAF timeline, not a stack of timers, and it only advances while
     the figure is on screen and the tab is in front. The page's resting
     state is the finished frame, so reduced motion and no-JS both get a
     complete figure rather than an empty one. */
  var a2a = doc.getElementById('a2a');
  if (a2a && !reduce) {
    var askEl = a2a.querySelector('.a2a__ask');
    var cards = [].slice.call(a2a.querySelectorAll('.a2a__card'));
    var stats = cards.map(function (c) { return c.querySelector('.a2a__st'); });
    var askText = askEl.textContent.replace(/\s+/g, ' ').trim();

    // the typed copy is decorative; the sentence itself stays readable
    var sr = doc.createElement('span');
    sr.className = 'a2a__sr';
    sr.textContent = askText;
    var typed = doc.createElement('span');
    typed.setAttribute('aria-hidden', 'true');
    var caret = doc.createElement('i');
    caret.className = 'a2a__caret';
    caret.setAttribute('aria-hidden', 'true');
    askEl.textContent = '';
    askEl.appendChild(sr);
    askEl.appendChild(typed);
    askEl.appendChild(caret);

    var TYPE_START = 640;
    var TYPE_MS = 34;                       // per character
    var typeEnd = TYPE_START + askText.length * TYPE_MS;

    // Each task reports back on its own clock, and NOT in the order they
    // were opened — the middle one finishes first. That out-of-order beat
    // is the whole argument of the section, so it is written down here
    // rather than falling out of an even stagger.
    var CUES = [
      [120,  '.a2a__step'],
      [420,  '.a2a__ask'],
      [typeEnd + 300, '.a2a__hub'],
      [typeEnd + 700, '.a2a__stage'],
      [typeEnd + 1000, cards[0]], [typeEnd + 1140, cards[1]],
      [typeEnd + 1280, cards[2]], [typeEnd + 1420, cards[3]],
      [typeEnd + 1950, stats[0]],
      [typeEnd + 2210, stats[2]],          // CRM refresh lands first
      [typeEnd + 2570, stats[1]],
      [typeEnd + 2930, stats[3]],
      [typeEnd + 3450, '.a2a__back']
    ];
    var LOOP = typeEnd + 9500;

    var t0 = null, raf = 0, visible = false;

    function paint(now) {
      raf = 0;
      if (!visible || document.hidden) { t0 = null; return; }
      if (t0 === null) t0 = now;
      var t = now - t0;
      if (t > LOOP) { reset(); t0 = now; t = 0; }

      typed.textContent = askText.slice(
        0, Math.max(0, Math.min(askText.length,
          Math.floor((t - TYPE_START) / TYPE_MS)))
      );
      askEl.classList.toggle('is-typed', t >= typeEnd);

      CUES.forEach(function (cue) {
        var el = typeof cue[1] === 'string' ? a2a.querySelector(cue[1]) : cue[1];
        if (el) el.classList.toggle('is-on', t >= cue[0]);
      });
      raf = requestAnimationFrame(paint);
    }

    function reset() {
      typed.textContent = '';
      askEl.classList.remove('is-typed');
      CUES.forEach(function (cue) {
        var el = typeof cue[1] === 'string' ? a2a.querySelector(cue[1]) : cue[1];
        if (el) el.classList.remove('is-on');
      });
    }

    function run(on) {
      visible = on;
      if (on) {
        a2a.classList.add('is-live');
        if (!raf) raf = requestAnimationFrame(paint);
      } else {
        t0 = null;
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
      }
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { run(e.isIntersecting); });
      }, { threshold: 0.25 }).observe(a2a);
    } else {
      run(true);
    }
    doc.addEventListener('visibilitychange', function () {
      if (!document.hidden && visible && !raf) raf = requestAnimationFrame(paint);
    });
  }

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
  var ochat = doc.getElementById('ochat');
  if (ochat && !reduce) {
    var beats = [].slice.call(ochat.querySelectorAll('.ochat__row'));
    // Staggered so each beat SETTLES before the next starts — with 3+ moving
    // parts no more than one should be in flight at a time, or the panel reads
    // as a flurry instead of an exchange. The gap before the result is the
    // longest: it is the hero, and a beat of stillness is what makes it land.
    var CUE = [0, 1000, 2200, 3400];         // ms; the typing row leaves
                                             // exactly when the reply arrives
    var oT0 = null, oRaf = 0, oSeen = false;

    function oPaint(now) {
      oRaf = 0;
      if (oT0 === null) oT0 = now;
      var t = now - oT0;
      beats.forEach(function (row, i) {
        var on = t >= CUE[i];
        if (row.classList.contains('ochat__row--typing')) {
          on = t >= CUE[1] && t < CUE[2];    // thinking, then it is replaced
        }
        row.classList.toggle('is-on', on);
      });
      if (t < CUE[CUE.length - 1] + 700) oRaf = requestAnimationFrame(oPaint);
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (e) {
          if (!e.isIntersecting || oSeen) return;
          oSeen = true;
          ochat.classList.add('is-live');
          oRaf = requestAnimationFrame(oPaint);
          obs.disconnect();
        });
      }, { threshold: 0.35 }).observe(ochat);
    }
  }

  /* the published page scrolls; the hint stands down once it has been used */
  var tplwin = doc.querySelector('.tplwin');
  var tplscroll = tplwin ? tplwin.querySelector('.tplwin__scroll') : null;
  if (tplwin && tplscroll) {
    tplscroll.addEventListener('scroll', function () {
      tplwin.classList.toggle('is-scrolled', tplscroll.scrollTop > 12);
    }, { passive: true });
  }

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

  function syncStages(n) {
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

  function readScroll() {
    if (nav) nav.classList.toggle('is-stuck', window.scrollY > 28);
    // stacked, the frame is stuck over the list and all four paragraphs are
    // open at once: there is no scroll distance left to read a step from, so
    // the frame follows taps instead and nothing is hidden if nobody taps
    if (steps.length && view && pinned.matches && performance.now() >= lock) {
      setStep(readStep());
      paintProgress();
    }
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { readScroll(); ticking = false; });
  }, { passive: true });
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
    var tabs = [].slice.call(wrap.querySelectorAll('.scenes__tab'));
    var panes = [].slice.call(wrap.querySelectorAll('.scene'));
    var line = doc.getElementById('scene-line');
    // No emoji: it was the one pictogram on a page that has none, and it read
    // as decoration bolted onto a sentence rather than part of it.
    var LINES = {
      marketing:  ['builds', 'Maya’s', '', 'storefront.'],
      ads:        ['optimizes', 'Maya’s', '', 'ad spend.'],
      sales:      ['scores', 'Ravi’s', '', 'pipeline.'],
      engineering:['triages', 'Lin’s', '', 'error queue.'],
      product:    ['writes', 'Sofia’s', '', 'export spec.'],
      ops:        ['sends', 'Noah’s', '', 'Monday digest.'],
      leadership: ['rebuilds', 'Dana’s', '', 'board deck.']
    };
    var writeLead = function (key) {
      if (!line || !LINES[key]) return;
      var p = LINES[key];
      // no accent here: at this size, on the grey ground, orange text
      // cannot clear 4.5:1. The lead is emphasised by ink + weight.
      line.textContent = 'Okou ' + p[0] + ' ' + p[1] + ' ' + p[3];
    };
    var show = function (key) {
      if (line) {
        line.classList.add('is-swapping');
        window.setTimeout(function () {
          writeLead(key);
          line.classList.remove('is-swapping');
        }, reduce ? 0 : 240);
      }
      tabs.forEach(function (t) {
        var on = t.dataset.scene === key;
        t.classList.toggle('is-on', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      panes.forEach(function (p) {
        var on = p.dataset.scene === key;
        p.classList.remove('is-on');
        if (on) { void p.offsetWidth; p.classList.add('is-on'); }
      });
    };
    tabs.forEach(function (t) {
      t.addEventListener('click', function () { show(t.dataset.scene); });
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
})();
