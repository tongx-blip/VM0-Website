/* options-header — flip the header's ground on the real page.
   Review chrome. Nothing here ships. */
(function () {
  'use strict';
  var sw = document.querySelector('.hsw');
  if (!sw) return;

  var NOTE = {
    '0': 'The header as it ships. #EAEEF0 on #F4F6F7 — contrast 1.077, which is ' +
         'the same size as the page’s own step from grey to a white card.',
    'a': 'MATERIAL. A white veil at 74% over blur(20px) saturate(1.7) — no ' +
         'opaque ground. The edge is what goes out of focus behind it, so it is ' +
         'strongest over busy content. At 55% it vanished over the flat gaps ' +
         'between cards: glass with nothing to refract is just a weaker fault.',
    'b': 'VALUE. It inverts: 1.077 becomes 14.4. Not a new register — the page ' +
         'already ends on two dark bands and the header already crosses into them.',
    'c': 'SILHOUETTE. Not one colour changed. 46px instead of 58, 22px from the ' +
         'top instead of 12, tighter to its content. If this reads as separated, ' +
         'the fault was never contrast.',
    'd': 'TONE, PROPERLY. Two rungs down the same cool ramp: #DBE2E7 is 1.207 ' +
         'against the page ground and 1.309 against a white card. The boring ' +
         'answer — and if it is enough, A, B and C are solving a solved problem. ' +
         '(A warm-tinted version measured just as well and is not here: this page ' +
         'has already called warm off-white 太 AI.)'
  };

  var note = document.getElementById('hswNote');
  var btns = [].slice.call(sw.querySelectorAll('button'));

  function go(v) {
    if (v === '0') document.documentElement.removeAttribute('data-v');
    else document.documentElement.setAttribute('data-v', v);
    btns.forEach(function (b) { b.classList.toggle('is-on', b.dataset.go === v); });
    if (note) note.textContent = NOTE[v] || '';
    try { sessionStorage.setItem('hsw', v); } catch (e) { /* private mode */ }
  }

  btns.forEach(function (b) {
    b.addEventListener('click', function () { go(b.dataset.go); });
  });

  /* keep the choice across a reload — the header only exists in two states and
     comparing them means scrolling, so losing the variant on every refresh
     makes the page unusable for the thing it is for */
  var saved = null;
  try { saved = sessionStorage.getItem('hsw'); } catch (e) { /* ignore */ }
  go(saved && NOTE[saved] ? saved : '0');

  /* 1-5 switch, because comparing four grounds means going back and forth and
     a pointer trip to the bottom of the screen breaks the comparison */
  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var i = ['1', '2', '3', '4', '5'].indexOf(e.key);
    if (i < 0 || !btns[i]) return;
    go(btns[i].dataset.go);
  });
})();
