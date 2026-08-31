/* one shared clock, so the four options play together and can be compared
   on the same beat rather than on whenever each happened to scroll in. */
(function () {
  var grid = document.querySelector('.ogrid');

  /* D · the focus rotation. The two padded end cards exist so the first and
     last real member are flanked, and they are never focused themselves.

     PING-PONG, NOT WRAP. Going 6 -> 1 rewinds the whole strip in one 560ms
     sweep, which is the longest and fastest movement on the page and lands
     on the seam every cycle. Reversing at the ends means the largest step is
     always one card, and nothing in the figure ever moves faster than the
     thing it is asking you to read. */
  var d = document.querySelector('.oD');
  if (d) {
    var lanes = [].slice.call(d.querySelectorAll('.dlane'));
    var FIRST = 1, LAST = lanes.length - 2, at = FIRST, dir = 1;
    var focus = function (n) {
      at = n;
      d.style.setProperty('--i', n);
      lanes.forEach(function (l, k) { l.classList.toggle('is-focus', k === n); });
    };
    focus(FIRST);
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      /* 2200 dwell + 560 move. The dwell is what makes it readable: the eye
         needs to finish one card before the next is offered. */
      setInterval(function () {
        if (at + dir > LAST || at + dir < FIRST) dir = -dir;
        focus(at + dir);
      }, 2760);
    }
  }

  function play() {
    grid.classList.remove('is-play');
    void grid.offsetWidth;          // reflow, or the class swap is coalesced
    grid.classList.add('is-play');
  }
  document.getElementById('replay').addEventListener('click', play);
  document.getElementById('theme').addEventListener('click', function () {
    var h = document.documentElement;
    h.setAttribute('data-theme', h.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });
  setTimeout(play, 260);
})();
