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
  // .vs__viz rather than .vsui: the comparison band now draws four different
  // product surfaces (.vsui, .lane, .arti__win, .tsh__share) and naming them
  // one at a time meant the audit failed every time a new one was added.
  // Everything inside a media band is a mock by definition.
  // .wfo is the workflow scene's product surfaces — an Okou workflow card
  // and the team's workflow list. Their internal rules are the product's own
  // chrome, the same argument as .perms and .absui, so the subtree is named
  // here rather than left as a quiet violation of a rule this audit claims
  // to enforce (docs/design-principles.md §1).
  // `.ochat` draws SLACK — a channel header rule, an AGENT badge, an
  // unfurl's left bar, a composer field and the panel's own window edge.
  // Every one is another application's chrome, which is the exception S4
  // states and the same reason `.vs__viz` is already on this list.
  const MOCK = '.absui,.slackui,.flowui,.okoui,.mock,.appui,.tplwin,.tpl,.step,' +
               '.vs__viz,.wfo,.pbox,.ochat,.pgrant,.cbro';
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
  /* Every product mock on the page, not the half of them this list used to
     name. A mock draws the app and keeps the APP's type scale (RULES P1), so
     counting its internals as page type made the census report 24 sizes and
     tell nobody anything. Missing before: .arti .tsh .lane .vsui .wfsc .wfo
     .par .ochat .ochip .ostage .pgrant .cbro .vs__viz. */
  const MOCK = '.absui,.slackui,.flowui,.okoui,.acard,.a2a,.scene__shot,'
    + '.appui,.tplwin,.tpl,.pbox,.arti,.tsh,.lane,.vsui,.wfsc,.wfo,.par,'
    + '.ochat,.ochip,.ostage,.pgrant,.cbro,.vs__viz,.mock';
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

/* ── 7. ATTENTION BUDGET — what each section costs the reader, and who is
      asking. "这部分太重了" is a measurement, not a taste argument, and it
      was never measured until the security section had grown to 4.05
      screens and 23.6% of the whole page — longer than the section that
      carries the product's main story, and the only one with a button
      per item. Run this BEFORE restyling anything anyone calls heavy.
      RULES K7, K8. ─────────────────────────────────────────────────── */
(() => {
  const doc = document.documentElement.scrollHeight;
  const vh  = window.innerHeight;
  const CAP = 2.2;                        // screens

  // The page asks in two places and they are deliberate: the hero, and the
  // closing band. A button anywhere else is a section competing with the
  // page's own ask — five of them are what turned a reassurance into a
  // second product tour.
  const MAY_ASK = new Set(['hero', 'cta']);

  // A section over the cap on purpose. Each entry needs a reason, and the
  // reason is the point: it is the difference between a decision and a
  // section nobody has measured.
  const LONG_ON_PURPOSE = {
    workflows: 'the product\'s main story — the four-beat scene is the page\'s subject',
  };

  const rows = [], bad = [], noted = [];
  [...document.querySelectorAll('main > section[id], body > section[id]')].forEach(s => {
    const h       = s.getBoundingClientRect().height;
    const screens = h / vh;
    const share   = h / doc * 100;
    const ctas    = s.querySelectorAll('a.btn').length;
    rows.push(s.id.padEnd(12) + String(Math.round(h)).padStart(5) + 'px  ' +
              screens.toFixed(2) + ' screens  ' + share.toFixed(1).padStart(4) + '%' +
              (ctas ? '  ' + ctas + ' CTA' : ''));
    if (screens > CAP) {
      const line = s.id + ' is ' + screens.toFixed(2) + ' screens (' + share.toFixed(1) + '%)';
      (s.id in LONG_ON_PURPOSE ? noted : bad).push(
        line + (s.id in LONG_ON_PURPOSE ? ' — ' + LONG_ON_PURPOSE[s.id] : ''));
    }
    if (ctas && !MAY_ASK.has(s.id)) bad.push(s.id + ' carries ' + ctas + ' CTA' + (ctas > 1 ? 's' : '') + ' of its own');
  });

  const body = rows.join('\n') + (noted.length ? '\n\nover the cap, on purpose\n  ' + noted.join('\n  ') : '');
  return bad.length ? body + '\n\nFAIL\n  ' + bad.join('\n  ')
                    : body + '\n\nPASS — nothing unbudgeted over ' + CAP + ' screens, and only the hero and the band ask';
})()

/* ── 8. STATE INTEGRITY — the checks that came out of a facepile where two
      of three avatars looked active at once. Both faults were invisible in
      a still and obvious in motion, so run this with the page MOVING.
      ───────────────────────────────────────────────────────────────── */
(() => {
  const out = [];

  /* A TIE IN A STACK IS NOT A STACK. `.wfo__who{z-index:calc(9 - --wi)}`
     gave the leftmost face 9, and the rule meant to lift the active one
     said 9 as well. With the third avatar holding, the first was still in
     front of the second and the pile had two visual tops — read as "两个
     头像被active". Equal z-index falls back to DOM order, which is exactly
     the thing an explicit z-index was added to stop depending on.
     Siblings only: z-index is meaningless across stacking contexts. */
  const groups = new Map();
  document.querySelectorAll('[class]').forEach(el => {
    const z = getComputedStyle(el).zIndex;
    if (z === 'auto' || !el.parentElement) return;
    if (!groups.has(el.parentElement)) groups.set(el.parentElement, []);
    groups.get(el.parentElement).push([el, +z]);
  });
  /* AND ONLY WHERE THE GROUP IS ACTUALLY A STACK. Six message rows in a
     list all sit at z-index 1 and never touch, so paint order decides
     nothing — reporting those was seven findings of noise. But the test is
     NOT "do the two tied boxes overlap each other": in the fault this was
     written for, the two faces sharing z-index 9 were two apart and never
     touched. They each sat over the face BETWEEN them, which is what made
     the pile read as having two fronts.
     So: if any pair in the group overlaps, the group is a stack, and a
     stack's top value has to be held by exactly one element. */
  const hits = (a, b) => a.right > b.left + 1 && a.left < b.right - 1 &&
                         a.bottom > b.top + 1 && a.top < b.bottom - 1;
  groups.forEach((kids, parent) => {
    if (kids.length < 2) return;
    /* CLIPPED TO THE PARENT. A bottom-anchored `overflow:hidden` list keeps
       its older messages in layout above the top edge, where their boxes
       overlap and nothing is painted. Compare what is on screen. */
    const pr = parent.getBoundingClientRect();
    const boxes = kids.map(k => {
      const r = k[0].getBoundingClientRect();
      return { left: Math.max(r.left, pr.left), right: Math.min(r.right, pr.right),
               top: Math.max(r.top, pr.top), bottom: Math.min(r.bottom, pr.bottom) };
    });
    let stacked = false;
    for (let i = 0; i < boxes.length && !stacked; i++)
      for (let j = i + 1; j < boxes.length && !stacked; j++)
        if (boxes[i].right > boxes[i].left && boxes[j].right > boxes[j].left &&
            hits(boxes[i], boxes[j])) stacked = true;
    if (!stacked) return;
    const top = Math.max(...kids.map(k => k[1]));
    const tied = kids.filter(k => k[1] === top).map(k => k[0]);
    /* PEERS OF THE SAME CLASS. Content layered over background art is two
       different things at the same level and is fine — `.panel` and
       `.footer` both sit at 1 over `.close__art` and never compete, because
       they occupy different regions. The fault shape is narrower and always
       looks the same: a rule computes a per-item z-index across N identical
       children, and a state rule for "the active one" collides with the
       value the first child already had. Same class, same level, in a pile
       that overlaps. */
    const kind = e => e.className.split(' ')[0];
    if (tied.length > 1 && new Set(tied.map(kind)).size === 1)
      out.push('a stack with ' + tied.length + ' tops at z-index ' + top + ': ' +
               tied.map(t => '.' + t.className.split(' ')[0]).join(', ') +
               ' inside .' + (parent.className.split(' ')[0] || parent.tagName.toLowerCase()));
  });

  /* A MARKER MUST BE ON THE THING IT MARKS. The handover ring centred
     itself with `top:50%` against a container that WRAPS — avatars on row
     one, caption on row two — so it hung 14px below the faces, exactly
     (65 - 37) / 2. A percentage inset resolves against the whole padding
     box including rows you were not thinking about. */
  document.querySelectorAll('*').forEach(el => {
    const cs = getComputedStyle(el);
    if (cs.position !== 'absolute') return;
    const p = el.offsetParent;
    if (!p) return;
    const ps = getComputedStyle(p);
    if (ps.display !== 'flex' || ps.flexWrap !== 'wrap') return;
    out.push('absolute child of a WRAPPING flex container: .' +
             (el.className.split(' ')[0] || el.tagName.toLowerCase()) +
             ' in .' + (p.className.split(' ')[0] || p.tagName.toLowerCase()) +
             ' — a percentage inset here measures the wrap, not the row');
  });

  /* A FLOATING CARD MAY NOT COVER CHROME. The connector cards lap the app
     window's left edge on purpose, and the window answers by insetting its
     own sidebar by exactly that lap — so the strip a card lies across is
     empty. That holds only while every card laps by the SAME amount: one of
     them reached `--o-lap + 18`, and the moment it was moved to a label's
     height it ate the first letter of "Connectors".
     Labels as well as icons: a check that tested only the icon tiles passed
     while the screenshot plainly showed the fault. */
  const chrome = [...document.querySelectorAll(
    '.okw__org, .okw__nav i, .okw__nav em, .slk__ws, .slk__rail i')];
  const cards = [...document.querySelectorAll('.ocard')];
  chrome.forEach(n => {
    const r = n.getBoundingClientRect();
    if (!r.width) return;
    cards.forEach(c => {
      const q = c.getBoundingClientRect();
      if (!q.width) return;
      const ox = Math.min(q.right, r.right) - Math.max(q.left, r.left);
      const oy = Math.min(q.bottom, r.bottom) - Math.max(q.top, r.top);
      if (ox > 1 && oy > 1)
        out.push('a connector card covers "' +
                 ((n.textContent || '').trim() || n.className.split(' ')[0]) +
                 '" by ' + Math.round(ox) + '×' + Math.round(oy) + 'px');
    });
  });

  return out.length ? out : 'PASS — no ties, no insets over a wrap, no covered chrome';
})()

/* ── 9. STATE RULES THAT LOSE THE CASCADE — a `.is-*` declaration must be
      the one that wins on the element it is written for. `.wfo__who
      .is-holding{transform}` sat at lower specificity than `.wfsc[data-step
      ="3"] .wfo__who{transform:none}` and earlier in the file, so the avatar
      it was supposed to lift never moved — and that reads as a broken
      animation rather than as CSS, which is why it survived a screenshot
      review. `.hero[data-cta="cut"] .display--tail{display:none}` lost the
      same way to `#rotator{display:block}`.

      TOGGLING THE CLASS IS THE WRONG TEST. A state that returns a property
      to its default — `.ocard.is-on{transform:none}` cancelling the offset
      `.is-live` gave every card — looks identical with the class on and off,
      and the first version of this block reported ten such rules as dead.
      What matters is not whether the element changes but whether OUR
      declaration is the last one standing, so this walks the cascade for
      real: every author rule that matches the element and sets the same
      property, ordered by specificity then document position. Author origin,
      no `!important` — both would need the same treatment if this page ever
      used them. RULES F36. ───────────────────────────────────────────── */
(() => {
  const spec = (sel) => {
    const ids = (sel.match(/#[\w-]+/g) || []).length;
    const cls = (sel.match(/\.[\w-]+|\[[^\]]+\]|:(?!:)(?!not\b|is\b|where\b)[\w-]+/g) || []).length;
    const els = (sel.match(/(^|[\s>+~])(?![.#\[:*])[a-zA-Z][\w-]*/g) || []).length;
    return ids * 10000 + cls * 100 + els;
  };

  // every author style rule, in document order
  const all = [];
  for (const sheet of document.styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; }          // cross-origin
    const walk = (list) => {
      for (const r of list) {
        // selectorText FIRST: with CSS nesting a CSSStyleRule also carries a
        // (usually empty) cssRules, so `if (r.cssRules)` is truthy for every
        // style rule and recursing on it first finds nothing.
        if (r.selectorText && r.style) {
          for (const sel of r.selectorText.split(',')) {
            const s = sel.trim();
            if (!s) continue;
            const props = [];
            for (let i = 0; i < r.style.length; i++) props.push(r.style[i]);
            if (props.length) all.push({ sel: s, props, sp: spec(s), i: all.length });
          }
        }
        if (r.cssRules && r.cssRules.length) walk(r.cssRules);
      }
    };
    walk(rules);
  }

  const lost = [], unseen = [], skipped = [];
  for (const rule of all) {
    if (!/\.is-[\w-]/.test(rule.sel)) continue;
    if (/:not\([^)]*\.is-/.test(rule.sel)) { skipped.push(rule.sel); continue; }
    let el;
    try { el = document.querySelector(rule.sel); } catch { continue; }
    if (!el) { unseen.push(rule.sel); continue; }

    for (const p of rule.props) {
      if (/^transition|^animation/.test(p)) continue;   // not a visible state
      let winner = rule;
      for (const other of all) {
        if (other === rule || !other.props.includes(p)) continue;
        let hit = false;
        try { hit = el.matches(other.sel); } catch { continue; }
        if (!hit) continue;
        if (other.sp > winner.sp || (other.sp === winner.sp && other.i > winner.i)) winner = other;
      }
      /* Losing to ANOTHER STATE of the same thing is ordinary cascade, not
         a fault: `.ocard{transform:6px}` under `.is-live` is meant to be
         cancelled by `.ocard.is-on{transform:none}`. What this is looking
         for is a RESTING rule beating a state rule — `#rotator .rot` over
         `.rot.is-on`, a theme rule over `.is-here`. So: only report when
         the winner carries no state of its own. */
      if (winner !== rule && !/\.is-[\w-]/.test(winner.sel)) {
        lost.push(rule.sel + ' {' + p + '} loses to ' + winner.sel);
        break;                                          // one line per rule
      }
    }
  }

  const body = 'state rules checked: ' + all.filter(r => /\.is-[\w-]/.test(r.sel)).length +
               '  ·  not on the page right now: ' + unseen.length +
               '  ·  skipped (:not): ' + skipped.length;
  return lost.length
    ? body + '\n\nFAIL — these declarations never win\n  ' + lost.join('\n  ')
    : body + '\n\nPASS — every state declaration on the page wins its property';})()


/* ── 10. MARGIN ON AN ABSOLUTE BOX — the inset is not the whole story.
      `left`/`top` place the margin box, so a margin is ADDED to the number
      you authored. Nothing on this page wants that: an object positioned in
      container units is positioned exactly, and any margin on it is either a
      UA default nobody zeroed or a leftover from when the thing was in flow.

      This exists because `.wfo--ask` is the only <figure> in the workflow
      scene and this page has no blanket element reset — every other figure
      class zeroes its own margin, so nobody noticed. It kept the UA
      `margin:1em 40px` and rendered 40px right and 14px below the
      `left:12cqw; top:19cqh` it was drawn at, which is exactly the strip by
      which it lapped the run card's header. Four rounds of screenshots read
      that as "the animation is buggy". ──────────────────────────────── */
(() => {
  const bad = [...document.querySelectorAll('body *')].filter(el => {
    const cs = getComputedStyle(el);
    if (cs.position !== 'absolute' && cs.position !== 'fixed') return false;
    /* `auto` is the centring idiom and resolves to a real number, so read the
       cascaded value rather than the used one. */
    const decl = [cs.marginTop, cs.marginRight, cs.marginBottom, cs.marginLeft];
    return decl.some(v => v !== 'auto' && Math.abs(parseFloat(v) || 0) > 0.5);
  }).map(el => (el.tagName.toLowerCase() + '.' + (el.className + '').trim().split(/\s+/).join('.'))
      + ' {' + [getComputedStyle(el).marginTop, getComputedStyle(el).marginRight,
                getComputedStyle(el).marginBottom, getComputedStyle(el).marginLeft].join(' ') + '}');
  return bad.length
    ? 'FAIL — absolutely positioned, and carrying a margin the inset does not account for\n  ' + [...new Set(bad)].join('\n  ')
    : 'PASS — every absolutely positioned box is where its inset says it is';
})()
