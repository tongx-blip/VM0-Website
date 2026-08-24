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
      furniture, so those subtrees are exempt. So is `.step`: the ladder is
      built to a supplied reference design that separates its rows with a
      0.5px rule, and that was an explicit instruction — see
      docs/design-principles.md §1. ─────────────────────────────────── */
(() => {
  // .vsui is the comparison cards' product surface: the platform Card's real
  // 1px gray-200 border and the RunningIndicator's ripple ring are the app's
  // own chrome, not page furniture (RULES S4 wants exceptions named).
  const MOCK = '.absui,.slackui,.flowui,.perms,.okoui,.mock,.appui,.tplwin,.tpl,.step,.vsui';
  const bad = [];
  document.querySelectorAll('body *').forEach(el => {
    if (el.closest(MOCK)) return;
    // an element that does not render cannot draw a line. Without this the
    // audit reports the UA's default button border on display:none controls,
    // which is a real 4-hit false positive at desktop widths.
    if (!el.getClientRects().length) return;
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
  const MOCK = '.absui,.slackui,.flowui,.perms,.okoui,.acard,.a2a,.scene__shot,.appui,.tplwin,.tpl';
  const sizes = {};
  document.querySelectorAll('main *,.footer *,.nav *,.announce *').forEach(el => {
    if (el.closest(MOCK) || !el.textContent.trim()) return;
    const s = getComputedStyle(el).fontSize;
    sizes[s] = (sizes[s] || 0) + 1;
  });
  return Object.entries(sizes).sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]))
    .map(([s, n]) => s + '×' + n).join('  ');
})()

/* ── 3. COMPOSITION RULE — every section is a centred stack over a
      full-width figure. Every heading must report "center". ── */
(() => {
  const rows = [...document.querySelectorAll('.panel')].map(p => {
    const h = p.querySelector(':scope > .display, :scope .stack .display');
    const l = p.querySelector(':scope > .section-body');
    const box = el => { const b = el.getBoundingClientRect(); return Math.round(b.x) + '/' + Math.round(b.width); };
    return (p.id || 'panel') + ' → ' + (h ? getComputedStyle(h).textAlign + ' ' + box(h) : 'no heading') +
           (l ? ' | lede ' + box(l) : '');
  });
  return 'viewport ' + innerWidth + ' | scrollWidth ' + document.documentElement.scrollWidth +
         '\n' + rows.join('\n');
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
  rails: [...document.querySelectorAll('.rail')].map(r =>
    r.classList.contains('is-in') + '/' +
    getComputedStyle(r.querySelector('.rail__track')).animationPlayState +
    '/' + getComputedStyle(r.querySelector('.rail__track')).animationDirection),
  // on screen every rail must read  true/running  — and the two must differ
  // in direction. A rail that is not in the observer's selector list stays
  // paused forever and reads as a frozen row.
}))()

/* ── 5. REDUCED MOTION — nothing may stay invisible when the choreography
      is skipped. Run after: agent-browser set media light reduced-motion ── */
(() => {
  const hidden = [...document.querySelectorAll('.reveal,[data-reveal]')]
    .filter(el => parseFloat(getComputedStyle(el).opacity) < 0.9);
  return hidden.length ? hidden.map(el => el.className) : 'PASS — all content visible';
})()

/* ── 6. THE OBVIOUS-BUG SWEEP — the checks that exist because something
      shipped looking plainly wrong. Run this every time. ───────────── */
(() => {
  const out = [];

  // a pill must hug its label: `width:100%` from the composition rule once
  // stretched every section tag across the whole section
  [...document.querySelectorAll('.panel > .chip')].forEach(c => {
    const w = c.getBoundingClientRect().width;
    if (w > 320) out.push('tag stretched: "' + c.textContent.trim() + '" ' + Math.round(w) + 'px');
  });

  // both rails must travel at the same speed, not the same duration
  const rates = [...document.querySelectorAll('.rail__track')].map(t => {
    const d = parseFloat(getComputedStyle(t).animationDuration);
    return d ? (t.scrollWidth / 2) / d : 0;
  });
  if (rates.length === 2 && Math.abs(rates[0] - rates[1]) > 2)
    out.push('rails differ in speed: ' + rates.map(r => r.toFixed(1) + 'px/s').join(' vs '));

  // no brand mark may be squashed (several connector SVGs are not square)
  document.querySelectorAll('img').forEach(i => {
    if (!i.naturalWidth || !i.getClientRects().length) return;
    const r = i.getBoundingClientRect();
    const nat = i.naturalWidth / i.naturalHeight, got = r.width / r.height;
    if (getComputedStyle(i).objectFit === 'fill' && Math.abs(nat - got) / nat > 0.12)
      out.push('squashed: ' + (i.getAttribute('src') || '').split('/').pop());
  });

  // a mark with heavy internal padding reads smaller than its neighbours
  const inks = [...document.querySelectorAll('.logo img')].map(i => i.getBoundingClientRect().width);
  if (inks.length && Math.max(...inks) / Math.min(...inks) > 1.6)
    out.push('logo box sizes diverge: ' + Math.min(...inks) + '–' + Math.max(...inks));

  return out.length ? out : 'PASS — no obvious visual bugs';
})()
