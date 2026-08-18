/* ================================================================
   OKOU — interaction layer, v41

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
  var watched = doc.querySelectorAll('.reveal, [data-reveal], .marquee, .mark');

  function enter(el) {
    el.classList.add('is-in');
    if (el.classList.contains('mark')) {
      // the mark lands after the line it underlines has arrived
      window.setTimeout(function () { el.classList.add('is-lit'); }, 240);
    }
    if (el.hasAttribute('data-count')) countUp(el);
  }

  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        enter(e.target);
        if (!e.target.classList.contains('marquee')) io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    watched.forEach(function (el) { io.observe(el); });
  } else {
    watched.forEach(function (el) {
      el.classList.add('is-in');
      el.classList.add('is-lit');
      if (el.hasAttribute('data-count')) el.textContent = el.dataset.count;
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

  /* ── 3. the connectors band cycles through the catalogue ──────
     One chip at a time flips to a connector that was not on screen.
     No hover, no scroll, no link: the point is only that there are far
     more of these than fit, which is what the copy claims. */
  var POOL = [
    ['google-drive_marketing', 'Google Drive'],
    ['google-analytics', 'Google Analytics'],
    ['meta-ads', 'Meta Ads'],
    ['zapier', 'Zapier'],
    ['perplexity', 'Perplexity'],
    ['manus', 'Manus'],
    ['openclaw', 'OpenClaw']
  ];
  var band = doc.getElementById('wallConnectors');
  if (band && !reduce) {
    var chips = [].slice.call(band.querySelectorAll('.cap'));
    var pool = POOL.slice();
    var last = -1;
    window.setInterval(function () {
      if (document.hidden || !chips.length || !pool.length) return;
      var i = Math.floor(Math.random() * chips.length);
      if (i === last) i = (i + 1) % chips.length;
      last = i;
      var chip = chips[i];
      var img = chip.querySelector('img');
      if (!img) return;
      var outgoing = [img.getAttribute('src').replace(/.*\/|\.svg$/g, ''),
                      chip.textContent.trim()];
      // never show the same connector twice
      var onScreen = chips.map(function (c) { return c.textContent.trim(); });
      var free = pool.map(function (x, n) { return n; })
                     .filter(function (n) { return onScreen.indexOf(pool[n][1]) === -1; });
      if (!free.length) return;
      var incoming = pool.splice(free[Math.floor(Math.random() * free.length)], 1)[0];
      chip.classList.add('is-out');
      window.setTimeout(function () {
        img.setAttribute('src', 'assets/connectors/' + incoming[0] + '.svg');
        chip.lastChild.nodeValue = incoming[1];
        pool.push(outgoing);
        chip.classList.remove('is-out');
      }, 260);
    }, 2400);
  }

  /* ── 4. one scroll loop: header state + step ladder ─────────── */
  var nav = doc.getElementById('nav');
  var ladder = doc.getElementById('ladder');
  var steps = ladder ? [].slice.call(ladder.querySelectorAll('.step')) : [];
  var stages = ladder ? [].slice.call(ladder.querySelectorAll('.wfstage')) : [];
  var lock = 0;

  function syncStages(n) {
    stages.forEach(function (s) { s.classList.toggle('is-on', s.dataset.step === n); });
  }

  function readScroll() {
    if (nav) nav.classList.toggle('is-stuck', window.scrollY > 28);

    if (steps.length) {
      var active = ladder.querySelector('.step.is-active');
      if (performance.now() < lock) {
        if (active) syncStages(active.dataset.step);
      } else {
        var focus = window.innerHeight * 0.44;
        var best = 0, bestDist = Infinity;
        steps.forEach(function (s, i) {
          var r = s.getBoundingClientRect();
          var d = Math.abs(r.top + r.height / 2 - focus);
          if (d < bestDist) { bestDist = d; best = i; }
        });
        steps.forEach(function (s, i) { s.classList.toggle('is-active', i === best); });
        syncStages(steps[best].dataset.step);
      }
    }
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { readScroll(); ticking = false; });
  }, { passive: true });
  window.addEventListener('resize', readScroll, { passive: true });
  readScroll();

  steps.forEach(function (s) {
    s.addEventListener('click', function () {
      steps.forEach(function (x) { x.classList.toggle('is-active', x === s); });
      syncStages(s.dataset.step);
      lock = performance.now() + 1200;   // a click outranks the scroll reading
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

  /* ── 7. the sticky composer ─────────────────────────────────── */
  var bar = doc.getElementById('chatbar');
  var ph = doc.getElementById('chatPh');
  var prompts = [
    'Draft the Q3 campaign brief',
    'Build the storefront off the brand brief',
    'Summarise last week’s ad spend',
    'Refresh the CRM and queue the follow-ups',
    'Turn this run into a workflow the team can use'
  ];
  if (ph && !reduce) {
    var i = 0;
    window.setInterval(function () {
      if (document.hidden) return;
      ph.classList.add('is-swapping');
      window.setTimeout(function () {
        i = (i + 1) % prompts.length;
        ph.textContent = prompts[i];
        ph.classList.remove('is-swapping');
      }, 300);
    }, 3800);
  }
  var footer = doc.querySelector('.footer');
  if (bar && footer && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { bar.classList.toggle('is-hidden', e.isIntersecting); });
    }, { threshold: 0.06 }).observe(footer);
  }
  if (bar) {
    bar.querySelector('.chatbar__go').addEventListener('click', function () {
      doc.getElementById('cta').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
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
    var tabs = [].slice.call(wrap.querySelectorAll('.scenes__tab'));
    var panes = [].slice.call(wrap.querySelectorAll('.scene'));
    var line = doc.getElementById('scene-line');
    var LINES = {
      marketing:  ['builds', 'Maya’s', '🛍️', 'storefront.'],
      ads:        ['optimizes', 'Maya’s', '📣', 'ad spend.'],
      sales:      ['scores', 'Ravi’s', '📇', 'pipeline.'],
      engineering:['triages', 'Lin’s', '🐞', 'error queue.'],
      product:    ['writes', 'Sofia’s', '📄', 'export spec.'],
      ops:        ['sends', 'Noah’s', '🗂️', 'Monday digest.'],
      leadership: ['rebuilds', 'Dana’s', '📊', 'board deck.']
    };
    var show = function (key) {
      if (line && LINES[key]) {
        var p = LINES[key];
        line.innerHTML = '<mark class="mark mark--tan is-lit">Okou</mark> ' + p[0] +
          ' ' + p[1] + ' <span class="inline-ic">' + p[2] + '</span> ' + p[3];
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
