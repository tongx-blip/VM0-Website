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
    var CUE = [0, 700, 1700, 2600];    // ask · thinking · reply · result
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
        var on = t >= CUE[i];
        if (row.classList.contains('ochat__row--typing')) {
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
      if (t < CUE[CUE.length - 1] + 900) oRaf = requestAnimationFrame(oTick);
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

    var cur = 0;          // index into the REAL set
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
      cur = i;
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
      t0 = null;                       // a new tab gets a full turn
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
        var n = (cur + d + N) % N;
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
    var t0 = null, tRaf = 0, onScreen = false, held = false, kbd = false;

    function tick(now) {
      tRaf = 0;
      if (!onScreen || held || kbd || document.hidden || reduce) { t0 = null; return; }
      if (t0 === null) t0 = now;
      var p = (now - t0) / DWELL;
      if (p >= 1) {
        var next = (cur + 1) % N;
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
          if (onScreen) pump(); else t0 = null;
        });
      }, { threshold: 0.2 }).observe(wrap);
    }
    wrap.addEventListener('focusin', function () { kbd = true; t0 = null; });
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
  var railnav = doc.querySelector('.railnav');
  var rail = doc.querySelector('.proof');
  if (railnav && rail) {
    var btns = [].slice.call(railnav.querySelectorAll('.railnav__b'));
    function step() {
      var card = rail.querySelector('.qcell');
      if (!card) return rail.clientWidth;
      var gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
      return card.getBoundingClientRect().width + gap;
    }

    function sync() {
      var max = rail.scrollWidth - rail.clientWidth;
      // a control for something that cannot happen is worse than none
      railnav.hidden = max < 4;
      btns[0].disabled = rail.scrollLeft <= 1;
      btns[1].disabled = rail.scrollLeft >= max - 1;
    }

    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        rail.scrollBy({
          left: step() * Number(b.dataset.dir),
          behavior: reduce ? 'auto' : 'smooth'
        });
      });
    });

    rail.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  }
})();
