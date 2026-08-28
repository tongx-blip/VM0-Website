/* Option C only: one machine, three states.
   One rAF-free cue list on a single interval, gated on visibility and on the
   observer, and parked for good the moment someone drives it themselves
   (RULES N4, N8, N16). Nothing here ships — it is the mechanic being reviewed. */
(function () {
  'use strict';
  var el = document.getElementById('occ');
  if (!el) return;
  var BEATS = ['asks', 'granted', 'gone'];
  var HOLD = [3200, 2600, 2000];   // the arrival holds longer than the step (F40)
  var i = 0, timer = null, parked = false, seen = false;

  var dots = [].slice.call(el.querySelectorAll('.occ__dot'));

  function paint() {
    el.dataset.beat = BEATS[i];
    dots.forEach(function (d, n) { d.classList.toggle('is-on', n === i); });
  }
  function stop() { if (timer) { clearTimeout(timer); timer = null; } }
  function tick() {
    stop();
    if (parked || !seen || document.hidden) return;
    timer = setTimeout(function () { i = (i + 1) % BEATS.length; paint(); tick(); }, HOLD[i]);
  }

  dots.forEach(function (d) {
    d.addEventListener('click', function () {
      parked = true; stop();
      i = Number(d.dataset.go) || 0; paint();
    });
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else tick();
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      seen = entries[0].isIntersecting;
      if (seen) tick(); else stop();
    }, { threshold: 0.25 }).observe(el);
  } else { seen = true; }

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    parked = true;
  }
  paint();
  tick();
})();
