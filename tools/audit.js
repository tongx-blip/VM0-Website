/* ================================================================
   Browser-side audits for this page. Paste a block into
   `agent-browser eval "<block>"` (or DevTools) against a running copy.

       cd site && python3 -m http.server 8931
       agent-browser set viewport 1440 900
       agent-browser open http://localhost:8931/

   These are the checks that caught real regressions, so run them before
   publishing. See docs/qa-checklist.md for the full gate.
   ================================================================ */

/* ── 1. NO-RULES — the design forbids structural lines. Must return 0.
      Borders inside a product mock are the product's own UI, not page
      furniture, so those subtrees are exempt. ─────────────────────── */
(() => {
  const MOCK = '.absui,.slackui,.flowui,.perms,.okoui,.mock';
  const bad = [];
  document.querySelectorAll('body *').forEach(el => {
    if (el.closest(MOCK)) return;
    const cs = getComputedStyle(el);
    ['Top', 'Right', 'Bottom', 'Left'].forEach(side => {
      const w = parseFloat(cs['border' + side + 'Width']);
      const color = cs['border' + side + 'Color'];
      if (w > 0 && cs['border' + side + 'Style'] !== 'none' &&
          !/transparent|, 0\)/.test(color) && color !== cs.backgroundColor) {
        bad.push((el.className || el.tagName) + ' ' + side + ' ' + color);
      }
    });
  });
  return bad.length ? bad.slice(0, 30) : 'PASS — no visible page-level borders';
})()

/* ── 2. TYPE-SCALE — page-level type must stay on the scale. Product mocks
      are exempt: they mimic app UI at its own sizes. ───────────────── */
(() => {
  const MOCK = '.absui,.slackui,.flowui,.perms,.okoui,.acard,.a2a,.scene__shot';
  const sizes = {};
  document.querySelectorAll('main *,.footer *,.nav *,.announce *,.chatbar *').forEach(el => {
    if (el.closest(MOCK) || !el.textContent.trim()) return;
    const s = getComputedStyle(el).fontSize;
    sizes[s] = (sizes[s] || 0) + 1;
  });
  return Object.entries(sizes).sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]))
    .map(([s, n]) => s + '×' + n).join('  ');
})()

/* ── 3. GRID CONTRACT — the reading column and the paired opening
      paragraph. Above 1080px they sit side by side; below, they stack. ── */
(() => {
  const h = document.querySelector('#outputs h2');
  const p = document.querySelector('#outputs .section-body');
  const r = el => { const b = el.getBoundingClientRect(); return Math.round(b.x) + '/' + Math.round(b.width); };
  return 'viewport ' + innerWidth + ' | heading x/w ' + r(h) + ' | lede x/w ' + r(p) +
         ' | scrollWidth ' + document.documentElement.scrollWidth;
})()

/* ── 4. MOTION — the entrances fired, the counters landed on their exact
      markup strings, the ladder tracks scroll. ─────────────────────── */
(() => ({
  revealed: document.querySelectorAll('.is-in').length,
  litMarks: document.querySelectorAll('.mark.is-lit').length + '/' + document.querySelectorAll('.mark').length,
  heroSequence: document.querySelectorAll('#hero [data-in].is-in').length,
  metrics: [...document.querySelectorAll('.metrics b')].map(b => b.textContent),
  activeStep: document.querySelector('.step.is-active')?.dataset.step,
  activeStage: document.querySelector('.wfstage.is-on')?.dataset.step,
  navStuck: document.getElementById('nav').classList.contains('is-stuck'),
}))()

/* ── 5. REDUCED MOTION — nothing may stay invisible when the choreography
      is skipped. Run after: agent-browser set media light reduced-motion ── */
(() => {
  const hidden = [...document.querySelectorAll('.reveal,[data-reveal]')]
    .filter(el => parseFloat(getComputedStyle(el).opacity) < 0.9);
  return hidden.length ? hidden.map(el => el.className) : 'PASS — all content visible';
})()
