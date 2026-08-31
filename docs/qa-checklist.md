# QA gate

> The rules themselves are indexed in **`RULES.md`** — one line each, with a
> pointer to where each is argued and where it is checked. This file is the
> machine half.

Run all of it before publishing, even for a one-line change. Every check here
exists because something slipped past without it. The audit snippets live in
`tools/audit.js`.

```bash
python3 tools/build-css.py
python3 tools/tokens.py        # token hygiene + the type scale
python3 tools/check-html.py    # markup balance
python3 tools/rules.py         # RULES.md's pointers still resolve
cd site && python3 -m http.server 8931 &
agent-browser set viewport 1440 900
agent-browser open "http://localhost:8931/?cb=$RANDOM"      # note the cache-buster
```

**The `?cb=` is not optional on a re-test.** `agent-browser open` on a URL it
has already loaded serves the cached HTML, and the `?r=` hash on the assets
busts the *stylesheet*, not the page. A round of this gate was run twice against
a build two edits old — two screenshots showed deleted elements still present,
and a fix that worked read as "still failing". If a measurement disagrees with
the source, check the loaded hash before debugging the CSS:

```js
[...document.querySelectorAll('link[rel=stylesheet]')].map(l => l.href.split('?r=')[1])
// must match: sha1sum site/styles.css | cut -c1-8
```

---

## 1. Accessibility — must be **0 violations**

**WALK THE PAGE FIRST.** axe only measures elements that are actually
rendered, and most of this page is behind a reveal observer — anything still
at `opacity:0` is skipped in silence. Auditing from the top, or from wherever
the last check left the scroll, covers a fraction of the page and returns a
clean 0 for sections axe never looked at. Walk down in viewport steps, sit at
the bottom, come back to the top, *then* audit:

```js
(async () => {
  const step = Math.round(innerHeight * 0.8);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
    window.scrollTo({ top: y, behavior: 'instant' }); await wait(90);
  }
  window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
  await wait(300);
  window.scrollTo({ top: 0, behavior: 'instant' }); await wait(300);
  return [...document.querySelectorAll('.reveal,[data-reveal]')]
    .filter(el => parseFloat(getComputedStyle(el).opacity) < 0.9).length;  // ~0
})()
```

```bash
agent-browser a11y            # expect: violations 0
```

This is not theoretical. `--p-mute` at 9–12px measured 3.9:1 and shipped 28
failing nodes across the parallel-work lanes, the artifact card and the
workflow rows — through every audit run before this one, because the lanes
were never revealed at the position the audit was run from.

**A pinned mock value does not outrank the contrast floor.** P1 pins a product
mock to the product's own palette, and that stands — but the product spends
its greys on 14px+ rows and this page draws the same mocks at 9–12px. When the
two collide, step down the product's own ramp rather than inventing a colour
or quietly leaving it: `--p-mute` is gray-800, not the gray-700 the product
uses, and the reason is written where the token is declared.

**Audit the resting frame.** A looping animation makes this check
non-deterministic — axe measures one instant, and an element caught mid-fade
reports below contrast. Park the loop first, then audit:

```js
document.getElementById('a2a').classList.remove('is-live');
```

Then run it *again* without parking, ~20 times across a full loop. Anything that
reproduces is a real defect: text that fades is text below contrast, and a loop
re-enters that state forever. The fix is `clip-path`, not a quieter audit.

**Audit while things are still moving, not only at rest.** Six audits at rest
came back clean while the page was shipping a real violation; it only exists
mid-animation. Run the audit *immediately* after the walk, and repeat it a
dozen times without pausing:

```bash
for i in $(seq 1 14); do agent-browser a11y | sed -n '2p'; sleep 0.6; done
# every line must read violations: 0
```

The nodes move between runs when it is an animation — `.reach__line .w:nth-child(7)`
on one pass, `(4)` and `(5)` on the next. A wandering node list *is* the
diagnosis: something is fading, and it is text.

**No text on this page fades.** Entrances, exits and swaps of anything with
words in it use `clip-path` (and `transform`), never `opacity` — the reach
statement, the run trace in the Run step, the headline masks. Opacity is for
dots, rules, illustrations and other things with no contrast floor.

Recurring causes, in the order they have actually bitten:

- **`--ink-mute` on a `--wash-2` fill.** The mute grey has to clear AA on the
  *darkest* ground it lands on, not just on white. Check labels inside trays,
  pills, tabs and status chips.
- **White text on an accent fill.** 3.4:1. Accent fills carry ink text.
- **Landmarks without a unique name.** Any `<aside>` needs its own `aria-label`
  (the composer has one).
- **New copy in a `--ink-mute` caption at <14px.**

## 2. No structural lines — must be **0**

`tools/audit.js` §1. Counts every element outside a product mock whose computed
border is visible. The design forbids them (`docs/design-principles.md` §1).

Watch for: a rule re-appearing from `src/css/base.css` after a selector changes.
Base-layer `border-top`s survive unless explicitly reset — `system.css` §2 keeps
a reset block listing every page-level element; add to it rather than patching
one selector at a time.

## 3. Ground alternation

No two adjacent sections may share a ground, because that is the only thing
separating them. Check with:

```js
['hero','outputs','workflows','parallel','control','positioning','proof','cta']
  .map(id => id + ':' + getComputedStyle(document.getElementById(id)).backgroundColor)
```

Expect: paper, wash, paper, wash, paper, wash, paper, ink.

## 3b. Attention budget — run this BEFORE restyling anything called heavy

`tools/audit.js` §7. Three numbers per section: pixels, **screens** of scroll,
and **share of the whole page**. It exists because "整体这部分太重了" was treated
as a styling note for two rounds, and the actual finding was a measurement — the
security section at **4.05 screens and 23.6% of the page**, longer than the
section carrying the product's main story, for a *reassurance*.

```bash
agent-browser set viewport 1440 900
agent-browser open "http://localhost:8931/?cb=$RANDOM"
# then paste tools/audit.js §7
```

- **2.2 screens is the cap** for anything that is not the hero. Past that a
  reader is scrolling through one idea for longer than it takes to state it.
- **The page asks twice — the hero and the closing band.** `a.btn` anywhere else
  fails. Five in-section CTAs are most of what made a reassurance read as a
  second product tour, and a reader told to act five times has been told to act
  zero times.
- **Over the cap on purpose is fine, in the check, with the reason.**
  `LONG_ON_PURPOSE` in §7, the same way `.tplwin` and `.vsui` are named in the
  no-rules audit. Today it holds one entry: `workflows`, the page's subject.

**Measure before, and after.** The number is the argument in both directions —
it is also how you show the change landed: 4.05 → 1.25 screens, 23.6% → 10.7%.

**Screens, not pixels, and share, not size.** A section is heavy relative to the
window it is read in and to what sits around it. A short section can still be
wrong if its neighbours are shorter; a long one can be right if it is the
subject. Neither is visible in a pixel count.

## 4. Active states survived the ground flips

Any rule scoped by section id (`#outputs .tag`) out-specifies a state class
(`.tag.is-on`). After touching grounds, confirm:

```js
const t = document.querySelector('.scenes__tab.is-on');
getComputedStyle(t).backgroundColor + ' / ' + getComputedStyle(t).color
// expect ink / white — not white / white
```

Same for `.step.is-active`, `.slackui__ch.is-on`, `.state--*`.

## 4b. The composition rule holds

Every section is a centred stack over a full-width figure. Spot-check that no
section has invented its own arrangement:

```js
[...document.querySelectorAll('.panel')].map(p => {
  const h = p.querySelector(':scope > .display');
  return p.id + ':' + (h ? getComputedStyle(h).textAlign : '—');
})   // every one must be "center"
```

Also confirm the eyebrow, lede and any section-level aside are centred, and that
card interiors are still left-aligned.

## 4c. Brand layer and placeholders

- Stickers must not overlap type — check the hero at 1920, 1440 and 390.
- The landscape must bleed to both viewport edges (percentages resolve against
  the grid area, so it needs `vw`): `document.querySelector('.cta__scene')
  .getBoundingClientRect()` should start at a negative x.
- Every `.ph` shows both its label and its `data-ph` spec, centred.
- Decorative imagery carries `alt=""` and `aria-hidden="true"`.

## 4d. Controls and the accent

- Every button, the active tab and the composer key are `--accent-solid` with
  **white** text. No black controls remain outside the product mocks.
- Nav links, sign-in and the small button all measure 38px tall.
- The hero's rotating statement is **one line at every width** — force each
  phrase and check `scrollWidth === innerWidth` at 390:

```js
[...document.querySelectorAll('#rotator .rot')].forEach(r => r.classList.remove('is-on'));
document.querySelectorAll('#rotator .rot')[3].classList.add('is-on');   // the longest
```

- The rails in "what Okou reaches" run only while on screen, stay inset from the
  container, and carry no hover affordance. The rotating statement must not
  change the block height when it swaps:

```js
[...document.querySelectorAll('.rail')].map(r =>
  r.classList.contains('is-in') + '/' +
  getComputedStyle(r.querySelector('.rail__track')).animationPlayState)
Math.round(document.querySelector('.rail').getBoundingClientRect().x)  // > 100 at 1440
```

## 4e. The obvious-bug sweep

`tools/audit.js` §6. Four checks that exist because each of these shipped:

- **A tag stretched across its whole section.** `.panel > .chip` inherits
  `width:100%` from the composition rule, which beats a pill's
  `width:max-content`. Any tag wider than ~320px is a bug.
- **Two rails with the same duration but different track lengths** move at
  different speeds. Duration is computed from track width in `app.js`
  (`RAIL_PX_PER_SEC`); the two rates must match.
- **A squashed brand mark.** Several connector SVGs are not square (Gmail is
  4:3); any of them in a fixed box needs `object-fit:contain`.
- **A mark that reads small.** Slack and Notion ship with heavy internal padding
  and need a compensating `transform:scale()` to sit optically level.

None of these fail an accessibility audit or a layout measurement — they are
only visible by looking. **Take a screenshot of a section head and of every
figure before publishing.**

## 4f. The product mock is the product

`docs/design-system.md` §12. When any part of the app is drawn on this page:

- **One content column.** The chat title, the prompt's right edge, the artifact,
  the paragraph, the action row and the composer share one left and one right
  edge. Only the agent avatar hangs into the gutter.

```js
['.appui__title','.appui__art','.appui__say','.appui__acts','.appui__composer']
  .map(s => Math.round(document.querySelector(s).getBoundingClientRect().x))
// every value identical
```

- **Sentence case only** — the product never uses Title Case or CSS uppercase:

```js
[...document.querySelectorAll('.appui *')]
  .filter(e => getComputedStyle(e).textTransform === 'uppercase').length   // 0
```

- **A mock that is meant to be CUT has to actually overflow.** Every device in
  the comparison band bleeds off an edge, and a flex column will not let it:
  its rows are flex items, so a list longer than the card does not overflow —
  every row shrinks by a few pixels until the list fits, and the mock reads as
  a short list that happens to have ended. Nothing in the CSS says so; the rows
  simply measure less than their line-height. Measure the overflow, don't look
  at it:

```js
[...document.querySelectorAll('.lanes .lane')].map(l => {
  const rows = l.querySelectorAll('.lane__s');
  return Math.round(rows[rows.length - 1].getBoundingClientRect().bottom -
                    l.closest('.vs__viz').getBoundingClientRect().bottom);
})   // every one > 0, at 390 / 768 / 1024 / 1280 / 1440 / 1920
```

  `flex:none` on the children is the fix, and it belongs on the container's
  children as a rule, not on the one row that was noticed.
- **Read the component, not the design system.** "It uses our tokens" is not the
  same as "it is our component". Open the `.tsx` that draws the thing and copy
  its class list. The values that have been wrong every time are the ones a
  screenshot cannot tell you: a 255px sidebar, a 14px row, and the difference
  between `--state-hover` and `--state-selected`.
- **Composite the state layer, never eyeball it.**

```js
// selected must be one step past hover, not equal to it
getComputedStyle(document.querySelector('.appui__nav li.is-on')).backgroundColor
// expect rgb(222, 228, 235) — rgb(231, 235, 240) is the HOVER colour
```

- **The mock lays out at the product's size and scales as one object.** Check
  the natural size is the design size and nothing inside is clipped:

```js
const a = document.querySelector('.appui');
[a.offsetWidth,                                  // 1280 — the DESIGN width
 [...a.querySelectorAll('*')].filter(el =>
   !el.closest('.appui__slackbox') &&            // the app's own scale-[2.2] mark
   el.scrollHeight - el.clientHeight > 1).length] // 0 — nothing clips anywhere
```

  A mock that needs any element to scroll, fade or absorb height is laid out at
  the wrong size. The sidebar footer, the full reply and the composer must all
  be present in the natural layout, not rescued by overflow tricks.

- **Read the reference, don't approximate.** Open the captured screenshot beside
  the build and account for every control: the collapse toggle, top-right
  actions, jump-to-latest, the tool row, the mic, the model chevron.

- **Every glyph is a real Lucide icon, at the version the app ships**, and every
  colour, radius and typeface is a platform token (`docs/design-system.md` §13).
  Hand-drawn paths are the thing that made the mock read as "not our product":

```js
const svgs = [...document.querySelectorAll('.appui svg')];
svgs.length && svgs.filter(s =>
  s.getAttribute('stroke-width') !== '2' ||
  s.getAttribute('viewBox') !== '0 0 24 24').length            // must be 0
getComputedStyle(document.querySelector('.appui')).fontFamily  // "Roobert TRIAL"
```

## 4g. The pinned ladder

`docs/design-system.md` §14. Three things break silently here:

```js
// the step must advance 1 → 2 → 3 → 4 across the track, and clamp at both ends
const l = ladder = document.getElementById('ladder'), v = l.querySelector('.ladder__view');
const travel = l.offsetHeight - v.offsetHeight, top = parseFloat(getComputedStyle(v).top);
[-0.2, 0.125, 0.375, 0.625, 0.875, 1.3].map(p => {
  scrollTo({top: l.getBoundingClientRect().top + scrollY - top + travel * p, behavior: 'instant'});
  return p + ':' + document.querySelector('.step.is-active').dataset.step;
})   // expect 1 1 2 3 4 4 — and .wfstage.is-on must always match
```

- **The box must not resize between steps, and nothing may overflow it.**
  Every stage must report zero on both axes:

```js
[...document.querySelectorAll('.wfstage')].map(st => {
  const f = document.querySelector('.ladder__frame').getBoundingClientRect();
  st.style.display = 'block';                       // measure the hidden ones
  const r = st.firstElementChild.getBoundingClientRect();
  st.style.display = '';
  return st.dataset.step + ':' + Math.round(r.bottom - f.bottom) + '/' +
                                 Math.round(r.right - f.right);
})   // every one must be 0/0 — a mock with its own min-height wins otherwise
```

  If one overflows, raise its `--dh` to the height it needs rather than letting
  it crop. `--dh` is measured, not guessed: sum the visible pane's children.
- **A mask must not fall on a control.** Screenshot every stage and read the
  composer, the send key and any footnote. `mask-image` on a pane, rather than on
  the scroll region inside it, dims them.
- **A fitted stage's entrance must use `translate`, not `transform`** — otherwise
  the keyframe replaces the fit and the screen jumps to full size mid-animation.
  Check `getComputedStyle(stage).transform` is a scale matrix while `.is-on`.
- **Check the narrow layout separately.** It is a different mechanic: the frame
  sticks over the list and follows taps. Verify at 390 that the frame is stuck
  (`getBoundingClientRect().top` equals the sticky offset, not a negative number)
  and that tapping the third step changes both the title state and the stage.

## 4h. Tags balance in a block you moved

Moving a block of markup is a structural edit, so check it before looking at it:

```bash
python3 - <<'EOF'
import re; s=open('site/index.html').read()
seg=s[s.index('<section class="panel" id="workflows"'):s.index('AT ONCE')]
for t in ('div','section','ol','li','p'):
    print(t, sum(1 if not m.group(1) else -1 for m in re.finditer(r'<(/?)'+t+r'[ >]', seg)))
EOF
```

Every count must be 0. An unclosed `<div>` does not throw — the browser closes it
at `</section>`, and the content silently lands inside the wrong column. That is
exactly how the two closing paragraphs of Shared workflows ended up inside the
sticky right-hand column. Note also that product mocks contain their own
`<section>` elements, so "the section's end" is the **last** `</section>` before
the next section, not the first.

## 4i. Heading weight

Every site-level title is Roobert **500** (`system.css` §3). Nothing outside a
product mock may be 700, and 600 survives only on the wordmark:

```js
const MOCK = '.absui,.slackui,.flowui,.perms,.okoui,.mock,.appui,.tplwin,.tpl';
[...document.querySelectorAll('main *,.footer *,.nav *')]
  .filter(el => !el.closest(MOCK) && el.textContent.trim() &&
                parseInt(getComputedStyle(el).fontWeight) >= 600 &&
                parseFloat(getComputedStyle(el).fontSize) >= 16)
  .map(el => el.className + ' ' + getComputedStyle(el).fontWeight)
// expect [] — the wordmark is under 16px so it does not appear
```

Also confirm every heading is still in the **display** face. `base.css` sets
`font-family:inherit` on some of them, which resolves to the prose face and is
invisible in a diff:

```js
[...document.querySelectorAll('h2,h3,.display,.sentence')]
  .filter(h => !h.closest(MOCK))
  .map(h => getComputedStyle(h).fontFamily.split(',')[0])
// every one "Roobert TRIAL" — no exceptions left; the ladder's Inter is gone
```

## 4j. One section geometry

`docs/design-system.md` §8. Four things that each shipped wrong once:

```js
// the header is exactly as wide as a section card — at every width
const n = document.getElementById('nav').getBoundingClientRect();
const c = document.querySelector('.panel--card').getBoundingClientRect();
[Math.round(n.x) === Math.round(c.x), Math.round(n.right) === Math.round(c.right)]

// one corner, no shadows
[...document.querySelectorAll('.panel--card')].map(p => getComputedStyle(p).borderTopLeftRadius)
[...document.querySelectorAll('.panel--card')].filter(p => getComputedStyle(p).boxShadow !== 'none').length  // 0

// a pinned block sits with equal air above and below
const v = document.querySelector('.ladder__view').getBoundingClientRect();
[Math.round(v.top - n.bottom), Math.round(innerHeight - v.bottom)]   // equal
```

**Sweep the band, not the corners.** A panel whose content wraps will fit at
some widths and overflow at others, and the four widths everyone tests are not
a sample — they are four points that can all land in the gaps. The Slack panel
shipped with its composer painted through the last message at *every* width
from 1080 to 1400, and passed 390/768/1024/1440. Step through the range:

```bash
for w in 1010 1060 1120 1160 1220 1280 1320 1440; do  # …and 390/768/1920
  # set the viewport, then, per overflowing candidate:
  #   list.scrollHeight - list.clientHeight            → 0
  #   composer.top - lastMessage.bottom                → > 0
done
```

Anything that lays text over a fixed footer needs `overflow` on the scrolling
part. A flex child with `min-height:0` and no `overflow` does not clip — it
spills, and paints over whatever comes after it.

Re-run the width check at **390 / 768 / 1024 / 1280 / 1920** — the failure mode
is a header whose width expression happens to agree with the cards at the one
width you looked at.

## 4j2. The measure is still capped

Changing a card's `padding-inline` is the one edit that silently removes the
1320px cap, because the cap *lives* in that padding:

```js
[1280, 1440, 1920].forEach(w => { /* set the viewport, then */ });
Math.round(document.querySelector('.ladder__view').getBoundingClientRect().width)
// must never exceed 1320
```

The floor and the cap are one rule:
`max(var(--pad-section), calc(var(--edge) - var(--card-gap)))`. Setting it to
`--pad-section` alone reads correctly at 1440 and runs 450px too wide at 1920.

## 4k. Rows that look symmetric and are not

Measure, don't eyeball. For any list of rows separated by a rule:

```js
const st = [...document.querySelectorAll('.step')];
st.map((s, i) => {
  const t = s.querySelector('.step__t').getBoundingClientRect();
  const next = st[i + 1] && st[i + 1].getBoundingClientRect().top;
  return [Math.round(t.top - s.getBoundingClientRect().top),
          next && Math.round(next - t.bottom)];
})   // above and below must match on every CLOSED row
```

Two causes, both invisible in the CSS:

- **`grid-template-rows: 0fr` does not absorb padding — on either edge, and
  not on either ELEMENT.** The trap below is the track's own padding; the
  same floor comes from the padding of the item *inside* the track, which
  is the version that reads as a CSS bug rather than a layout one, because
  the closed row keeps its label and paints it over its neighbour's:

```js
[...document.querySelectorAll('.lanes.is-live .lane__s:not(.is-on)')]
  .map(r => Math.round(r.getBoundingClientRect().height))   // every one 0
```

  Give a collapsible row its air as **leading**, never as padding —
  line-height is height a `0fr` track does collapse.
- **`grid-template-rows: 0fr` does not absorb padding — on EITHER edge.** The
  track is floored at the collapsed item's padding box, so a gap meant for the
  open state is silently present on every closed one. `padding-top` shows as a
  too-tall closed row; `padding-bottom` shows as a closed row leaking the first
  line of its own paragraph. Both belong to the open state only:

```js
[...document.querySelectorAll('.step:not(.is-active) .step__body > p')]
  .filter(p => p.getBoundingClientRect().height > 1)   // must be [] where rows collapse
```
- **A decoration taller than the text sets the row height.** A marker bar at
  `clamp(19px, 1.8vw, 26px)` beside an 18px title makes the row 26px and pushes
  the title off centre. Derive it from the text it marks.
- **A margin added for spacing re-decides every `align-items` in that row.**
  A `margin-bottom` on the title makes row 1 taller than the title's line box,
  so anything `center`-aligned beside it drops by half that margin. Measure the
  marker against the text, never against the row:

```js
[...document.querySelectorAll('.step')].filter(s => {
  const b = s.querySelector('.step__bar').getBoundingClientRect();
  const t = s.querySelector('.step__t').getBoundingClientRect();
  return Math.abs(b.top - t.top) > 1;        // must be []
})
```

## 4k2. Nothing hidden is still focusable

Any panel, tab or slide that is present-but-not-showing — anything switched by
`transform` rather than `display` — must be `inert`, not merely `aria-hidden`.
A product mock is full of real `<button>` elements:

```js
[...document.querySelectorAll('[aria-hidden="true"]')]
  .filter(el => el.querySelector('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])'))
  .filter(el => !el.inert)          // must be []
```

axe catches this as `aria-hidden-focus`, but only once the element is on screen.

## 4k3. A rule that masks text is that row's own edge

When a divider is meant to occlude text sliding in and out from behind it, the
divider has to be the **bottom border of the growing element**, not the top
border of the next one. Any air sitting between them — a list `gap`, a bottom
padding on the row — is the distance by which the text will be cut short of the
line, and the text then appears out of empty space:

```js
const s = document.querySelector('.step.is-active');
const p = s.querySelector('.step__body > p');
Math.round(s.getBoundingClientRect().bottom - p.getBoundingClientRect().bottom)  // ≈ 0
```

Check the closing direction too. Force it and screenshot immediately:

```js
document.querySelectorAll('.step').forEach(s => s.classList.remove('is-active'));
document.querySelectorAll('.step')[2].classList.add('is-active');
```

One row should be sinking behind its rule while the next rises from behind its
own.

## 4k4. Translucent chrome over an image

Any pill, bar or overlay that floats over a photo cannot be verified by axe —
the backdrop is an image, so the tool reports it as *incomplete* or flags it
intermittently depending on what has scrolled under it. It has to be safe by
construction: compute the effective background against the **lightest** thing it
can ever sit on (white) and check from there.

```
rgba(12,15,18,.62) over white → #6B6E71 → white text 4.3:1   ✗
rgba(12,15,18,.72) over white → #4C4F52 → white text 7.4:1   ✓
```

Backdrop blur is what makes such a control read as frosted. Transparency is not
— reach for the blur and keep the fill opaque enough to be legible anywhere.

## 4m2. A scrollable preview really scrolls

An artefact shown "in a window the visitor can scroll" must actually overflow
it. A *viewport* screenshot does not — it is a crop of a page, and at the
window's width it lands within a few dozen pixels of the window's height:

```js
[...document.querySelectorAll('.scene')].map(s => {
  const p = s.querySelector('.tplwin__scroll');
  return s.dataset.scene + ':' + (p.scrollHeight - p.clientHeight);   // all > 0
})
```

**Check the source images, not just the live measurement** — a hidden pane
reports 0 whatever its content is, so the DOM check only ever tells you about
the one scene that is showing. The artefact pages are all 880 wide, and their
heights are the real answer:

```bash
cd site/assets/artifact && python3 - <<'EOF'
import struct, glob
for f in sorted(glob.glob('*.jpg')):
    d = open(f,'rb').read(); i = 2
    while i < len(d):
        if d[i] != 0xFF: i += 1; continue
        m = d[i+1]
        if m in (0xC0,0xC1,0xC2,0xC3):
            print(f, struct.unpack('>HH', d[i+5:i+9])[::-1]); break
        if m in (0xD8,0xD9) or 0xD0 <= m <= 0xD7: i += 2; continue
        i += 2 + struct.unpack('>H', d[i+2:i+4])[0]
EOF
```

A full page runs 1400–4000px. `ops-v2.jpg` shipped at **870** and the Team
Digest preview ended a third of the way down its window with a "Scroll down"
hint under it that could not be obeyed. Anything near 900 is a page that was
cropped to a viewport instead of captured whole.

Three traps:

- **Forcing reveals open does not render a page.** Adding `is-in` and setting
  `opacity: 1` makes wrappers visible; it does not fire the page's scroll
  observers, so anything they build is still missing when you capture. **Capture
  by scrolling** — walk the page in viewport steps with a beat between each, sit
  at the bottom, come back to the top, then shoot. Then crop the last 900px of
  the result and look at it.
- **`hidden` loses to any author `display` rule.** `[hidden] { display: none }`
  lives in the UA sheet, so `display: inline-flex` on the same element beats it.
  Anything toggled with `.hidden = true` needs `[hidden] { display: none }` in
  the author sheet too.
- **A hidden pane measures zero.** `display:none` gives
  `scrollHeight === clientHeight === 0`, so a check at load concludes "no
  overflow" for every pane but the first and hides their hints for good.
  Re-measure when a pane is shown.
- **`querySelector` binds one of them.** Per-window behaviour needs
  `querySelectorAll` — six of seven windows once shared a handler that only
  ever ran for the first.

## 4m3. A conversation plays like one, and ends on the composer

RULES N22, N23. A channel hangs from the bottom, and copying that verbatim
without collapsing the messages that have not been said yet gives you the
worst of both: the conversation plays in the top half, the reserved rows hold
the bottom empty, and the messages that HAVE arrived are the ones pushed off.

```js
// settled, on every tab and at every width
(() => {
  const sc = document.querySelector('.scene.is-on');
  const l = sc.querySelector('.slk__list, .okw__list');
  const lb = l.getBoundingClientRect();
  const rows = [...l.children].filter(e => e.getBoundingClientRect().height > .5
    && getComputedStyle(e).position !== 'absolute');
  const last = rows[rows.length - 1].getBoundingClientRect();
  const comp = sc.querySelector('.slk__composer, .okw__composer');
  return { clipped: Math.round(last.bottom - lb.bottom),          // must be ≤ 0
           gap: Math.round(comp.getBoundingClientRect().top - lb.bottom) };  // must be 0
})()
```

- **Un-arrived rows collapse, and only under `.is-live`.** At rest the
  conversation is finished (N2), so with no JS and under reduced motion every
  message is present at full height. Check it: reduced motion must show every
  row but the typing one.
- **Nothing between the last message and the composer.** No list padding-bottom,
  no composer margin-top, and the typing indicator lives *inside* the list so it
  takes no room when nobody is typing.
- **Watch it, do not only measure it.** Two rounds of this were spent reading
  numbers that were describing a mid-animation frame as a bug. Screenshot the
  tab early and late and look at the two.
- **All seven tabs, and both readings of the window** — four are the Slack
  channel (`.slk__list`), three are Okou's own (`.okw__list`), and they had the
  same two faults. Sweep 1024 / 1120 / 1240 / 1440 / 1920 / 390.

## 4m. An auto-advancing carousel yields

Anything that advances on its own must stop when a person is using it:

```js
const t = document.getElementById('sceneTabs');
// each of these must freeze the fill and the advance
t.dispatchEvent(new PointerEvent('pointerenter'));   // hover
t.querySelector('.tab').focus();                     // keyboard
// plus: off screen (IntersectionObserver), background tab
// (visibilitychange), and prefers-reduced-motion — which disables it wholly
document.querySelector('.tab.is-on').style.getPropertyValue('--p')  // '' under reduced motion
```

It must **not** pause on hover — the progress is what tells a visitor the panel
is going to change, and freezing it whenever a pointer crosses the section makes
the section feel stuck. Keyboard focus is the exception: a keyboard user has no
other way to hold it.

If the reel loops by cloning, check the seam:

```js
const r = document.querySelector('.tabs__rail');
[r.children.length,                              // 3 × the real count
 r.querySelectorAll('[role=tab]').length,        // the real count only
 [...r.querySelectorAll('[aria-hidden=true]')].filter(e => e.tagName === 'BUTTON' && e.tabIndex >= 0).length,  // 0
 r.querySelectorAll('.is-on').length]            // exactly 1, at every moment
```

Selection must be marked on the centred **slot**, never by matching a data
attribute — matching lights every copy and puts a second highlighted item at
the edge of the mask, which is the seam the clones exist to hide.

A click must **park it for good** — at that point the visitor is driving, and
taking the wheel back is worse than never having offered it.

Also check the selection stays centred at every width and after fonts load:

```js
const v = document.querySelector('.tabs').getBoundingClientRect();
const t2 = document.querySelector('.tab.is-on').getBoundingClientRect();
Math.round((t2.left + t2.width / 2) - (v.left + v.width / 2))   // 0
```

## 4l. A marquee actually closes its loop

A track duplicated once is only seamless if **one copy is at least as wide as the
rail**. Otherwise the row runs out of content before it wraps and a gap crosses
the screen — which reads as broken, not as a design:

```js
[...document.querySelectorAll('.rail')].map(r =>
  Math.round(r.querySelector('.rail__track').scrollWidth / 2) >= r.clientWidth)
// every one true
```

Watch a full cycle at 1920, where the rail is widest and one copy is least likely
to cover it.

## 4l2. A marquee inside a padded container needs a LEAD

Arithmetic is not enough. A track that travels from 0 to one copy's width and
resets is seamless *where the track has content* — but a media band insets its
content, and that inset strip has the previous item behind it for the whole cycle
and **nothing** behind it at the instant of the reset. A sliver of the ground
popping in the corner is the only thing in the frame moving discontinuously,
which is exactly what the eye catches.

Start the travel one item in, so the whole visible window — inset included — is
inside the track's interior at every moment of the cycle:

```js
// the window must never leave the track, at either end, at every width
const f = document.querySelector('.vs__viz--parallel');
const b = f.querySelector('.lanes'), L = [...b.querySelectorAll('.lane')];
const set = L[4].offsetLeft - L[0].offsetLeft, lead = set / 4;
const inset = parseFloat(getComputedStyle(f).paddingLeft);
[lead - inset >= 0,                                        // left
 lead + set - inset + f.getBoundingClientRect().width <= b.scrollWidth]  // right
// both true at 390 / 768 / 1024 / 1280 / 1440 / 1920
```

**Then prove the wrap by diffing two frames, not by watching it.** A wrap once a
minute is not something you can reliably catch by eye. Freeze the loop's own
state with an `!important` override, screenshot at `-(lead + set)` and at
`-lead`, and diff:

```js
// twin lanes must land on the same rect, to the decimal
const at = (p, i) => { st.textContent = `.lanes{transform:translate3d(${p}px,0,0)!important}`;
                       return L[i].getBoundingClientRect(); };
at(-(lead + set), 4).left === at(-lead, 0).left    // true, and .top too
```

Expect the fully-visible items to diff to **zero**. Text antialiasing on the one
item the container's edge *cuts* may still differ — Chrome re-rasters the layer
at the new offset and a clipped glyph can land the other side of a tile boundary.
That one is a rasteriser artifact on a partial word for a single frame, not a
seam; do not spend the crop chasing it.

## 4n. Brand marks fill their own box

Connector SVGs arrive from brand kits with wildly different internal clearspace.
Dropped into one fixed box they then read at wildly different sizes, and the
tempting fix — `transform:scale()` on that one usage — leaves the *asset* wrong
and every other usage of it still small. Slack shipped with **46% of its own
viewBox** as ink and had accumulated four different corrections in three files;
the cards, added later, had none, so it appeared there at half size.

Measure the ink, do not eyeball it. Render each mark to a canvas and take the
alpha bounding box — **every mark's long side is ≥ 90% of its viewBox**, and any
that is not needs its `viewBox` cropped, not a CSS rule:

```js
// per SVG, drawn at 256², counting alpha > 8
const d = ctx.getImageData(0,0,256,256).data;   // → bbox / 256
```

Then confirm nothing is compensating in CSS. A per-brand `scale()` is allowed
only as an **optical** nudge on a mark that already measures ≥ 95% — anything
above 1.06 is compensating for a crop, and belongs in the file:

```bash
grep -rn 'src\*=' src/css/ | grep -i 'scale('
# today: exactly one line, .logo img[src*="notion"] at 1.06
```

This grep is what found the fifth and sixth Slack corrections after the first
four had been removed — one of them inside a hero block that had been pasted
into `base.css` twice.

Non-square marks (Gmail 4:3, Meta, Zapier) are exempt on the short axis only:
they letterbox, they never stretch.

### An agent is drawn and a person is photographed

RULES B4. The two must be told apart at **22px with no AGENT badge in frame**,
and the only difference that survives at that size is the medium. The invariant
is greppable:

```bash
# agents: composed by tools/build-avatars.py, under assets/avatars/
grep -o 'assets/avatars/[a-z-]*\.png' site/index.html | sort -u
# people: photographs, under assets/brand/, and JPEG because they are photographs
grep -o 'assets/brand/avatar-[0-9]\.jpg' site/index.html | sort -u
# and nothing may cross over
grep -c 'assets/brand/avatar-[0-9]\.png' site/index.html    # must be 0
```

- **Look at it at 22px, not at 256.** Both media read fine large; the whole point
  is the small size. Crop a Slack row from a screenshot and check that the
  agent row is obvious.
- **A person is never drawn in the page's own register.** That was the first
  attempt and it was coherent and wrong — the agent avatar is built from the
  same flat vector faces.

## 4o. The header is in the right state for the scroll position

Two states, and each one is a claim about where the page is. At rest it is
full-bleed and square; scrolled it is inset, rounded and shorter. Assert both,
because the resting state is the one nobody ever screenshots:

```js
const n = document.getElementById('nav'), r = () => n.getBoundingClientRect();
window.scrollTo(0, 0);   // rest: flush, full width, square
// top 0 · left 0 · width === innerWidth · borderRadius 0px · boxShadow none
window.scrollTo(0, 600); // stuck: stepped down, pulled in, --r-section
// top --nav-top · left --card-gap · borderRadius 16px · boxShadow none
```

No shadow in **either** state (RULES §S3). The header separates by tone, so the
thing to check is that its fill still differs from what it is over — sample it
against a white section AND against the page grey in the gap between two.

**Its content is bounded and deliberately not flush** (RULES §S7). At every
width the header's content sits exactly one `--card-gap` outside the section
column — never at the window edge, never on the section's own line:

```js
const logo = document.querySelector('.nav__logo').getBoundingClientRect().left;
const sec  = document.querySelector('.panel--card');
const col  = sec.getBoundingClientRect().left + parseFloat(getComputedStyle(sec).paddingLeft);
// logo < col, and col - logo === --card-gap. Check 390 / 1440 / 2560.
```

**It reads the ground, not a scroll offset.** The dark bands declare themselves
with `data-ground="dark"`; the header asks what is behind its own midline. Move
a dark section and nothing here needs editing — so the check is that the class
tracks the *element*, not a number:

```js
document.getElementById('nav').classList.contains('is-dark')
// false over any card · true once #cta or .footer spans the bar's midline
```

Run axe in **both** grounds, and audit the transition too — **load the page and
jump straight to `#cta`**, which is the path that finds what scrolling past it
does not:

```bash
# open, settle, then: document.getElementById('cta').scrollIntoView()
agent-browser a11y     # at ~1.6s AND at ~3s
```

The dark version is not a free repaint. The accent correction reverses
direction there (RULES §C1) — `--accent-wash`, correct on grey, is 3.0:1 on the
dark header. And **while the ground cross-fades it passes through mid-grey,
where no orange clears AA at all**: the maths asks for L ≤ 0.012 or L ≥ 1.20
and both accents sit at L ≈ 0.13–0.24. Any accent text rendered through that
fade fails for ~400ms, for any brand colour. The answer is not to tune it —
decorative, `aria-hidden`, clipped-out text must not be *rendered* at rest
(`visibility:hidden`), which also stops axe reporting 44 nodes of "incomplete".

Known and deliberately unfixed: `.cta__btns .btn--dark` fails for about a
second on that same path. White on `--accent-solid` is exactly 4.5:1, so the
reveal's opacity fade dips it under. It settles, and it is a decision about
`.reveal` or `--accent-solid`, not about that button.

**The veil is four layers, not one** (RULES §S8), and it carries no tint. A tint
was tried: it filled the gaps around the floating bar in the bar's own colour,
so the bar lost its edges and the header read as full-bleed at every scroll
position. The veil blurs; the bar colours.

```js
document.querySelectorAll('.navveil i').length                          // 4
getComputedStyle(document.querySelector('.navveil i')).backdropFilter   // blur(14px)
```

**Measure the ramp; do not look at it.** Blur is invisible over flat colour, so
put a striped backdrop behind the veil and read the profile down a single
column — horizontal stripes mean each *row* is uniform, so sample **vertically**
(a scan across x reads 0 everywhere and looks like a pass):

```html
<!-- serve next to styles.css -->
<body style="height:300vh;background:repeating-linear-gradient(180deg,#000 0 4px,#fff 4px 8px)">
<div class="navveil"><i></i><i></i><i></i><i></i></div>
```

Two things must hold, and each one has already failed once:

- **Every mask is monotonic.** Local vertical contrast may never *drop* as you
  go down. Masks that rise and fall make each layer a band, and where one band
  descends while the next climbs the coverage dips — that prints three or four
  hard horizontal lines across the strip.
- **The ramp starts at the top edge**, i.e. row 0 is already fully blurred and
  contrast is climbing by the next sample. Holding every layer at full alpha
  until a hem near the bottom makes the whole header region one flat slab; you
  cannot see it while the bar sits opaque on top, and it appears the moment the
  bar lifts and insets.

Last run: contrast 2 → 255 over 66px, **0 non-monotonic steps**.

## 4p. An absolutely-positioned child of a grid or flex parent

`left:0; right:0` does **not** guarantee a stretched box. Box Alignment applies
to absolutely-positioned boxes too: a `justify-self` other than `normal`/
`stretch` inherited from the parent's layout makes the box shrink-to-fit and
align *inside* the insets. The mobile menu spent an unknown number of rounds
114px wide, centred in a 374px header, with `left:0; right:0` in the CSS the
whole time — and the insets were never the problem.

```js
const p = document.querySelector('.nav.is-open .nav__links');
p.getBoundingClientRect().width === p.parentElement.clientWidth   // must be true
```

If a panel is narrower than its insets say it should be, read `justify-self`
before you touch `left`, `right` or `width`.

## 4q. A stat tile is label-then-value

The row is `label` (prose, sentence case, `--t-sm`, `--ink-mute`) above `value`
(`--t-figure`) with its unit at `--t-unit` on the same baseline, left-aligned on
a `--tile` ground at `--r-section`. Nothing else in the row wears the label's
clothes — the caveat under it is `.footnote` at `--t-meta`, not a fourth stat.

```js
[...document.querySelectorAll('.metrics li')].map(li => [
  li.firstElementChild.tagName,                      // SPAN — the label leads
  getComputedStyle(li.querySelector('span')).textTransform,   // none
  li.querySelector('span').getClientRects().length,  // 1 — label on one line
])
```

## 4r. Token hygiene — nothing declared that is unused, nothing painted that is not a token

Two greps and a diff. Run all three; the first two are cheap and the third is
the only one that proves a colour refactor was safe.

**a. No token is declared and never used.** 106 declared, 0 unused:

```bash
python3 - <<'EOF'
import re
src = open('src/css/system.css').read() + open('src/css/base.css').read() \
    + open('site/index.html').read() + open('site/app.js').read()
root = re.search(r':root\{(.*?)\n\}', src, re.S).group(1)
for t in re.findall(r'(--[a-z0-9-]+)\s*:', root):
    if not re.search(r'var\(\s*'+re.escape(t)+r'\s*[,)]', src): print('UNUSED', t)
EOF
```

**b. Nothing in the design layer paints with a literal.** Everything left in
`system.css` outside `:root` must be one of exactly three things: a **mask**
alpha stop (`#000` in a `mask-image` — that is not a colour), a **component's
own token declaration** (`.tpl`'s `--sand`, `.tplwin`'s `--chrome-pill`), or a
**channel consumption** (`rgb(var(--ink-rgb) / .05)`). Anything else is a bug.
`base.css` is exempt: a product mock draws the app's own colours, and Slack's
aubergine is Slack's (RULES §P1).

**c. A colour refactor must be a visual no-op, and you must prove it.** Capture
every computed colour on the page before and after and diff them — a mechanical
substitution across 66 sites cannot be eyeballed:

```js
// before AND after: for every element in body *, record
// color, backgroundColor, border*Color, boxShadow, fill, stroke, backgroundImage, maskImage
```

The last run: 1290 elements, **8 differences**, every one of them the intended
`--accent-solid` → `--accent` on a decorative shape. Anything you cannot name
in advance is a regression.

## 4s. Both modes, every time

The page is dual-mode. Every check in this file that reads a colour has to be
run twice, and the cheap way to force it is the pin rather than the OS:

```js
document.documentElement.setAttribute('data-theme', 'dark');   // or 'light'
```

- **axe: 0 violations in BOTH.** Dark is not a free repaint. The first dark run
  failed on the ladder, whose inks came from a supplied Figma as pure black —
  correct for a light-only page, invisible on a dark one. Mock fidelity (P1)
  governs what is inside a window frame; it does not license black text on a
  dark page.
- **The accent reverses direction, again.** `--accent-solid` is 3.96:1 on a
  dark card. Every accent *phrase* must read `--accent-wash`; only fills keep
  `--accent-solid`.
- **Ground separation survives.** Card vs page, header vs card, tile vs card,
  band vs page: each pair ≥ 1.05 in both modes. Compute it, do not squint.
- **The mocks did not invert.** They should still look like the product.
- **A tint INSIDE a mock is `--tile`, never `--wash`.** `--wash` is the grey the
  *page* sits on: in dark it goes **darker** than `--paper`, so every
  `bg-muted/30` the product paints as a raised surface comes out as a hole
  punched in the card. The grant dialog shipped its target pill, icon slot and
  scope chip that way and it only shows in dark. Grep any new mock:

```bash
awk '/^\.<mock>\{/,/^\/\* ─/' src/css/base.css | grep -n 'var(--wash)'
# must be empty — a surface inside a card is --tile
```

## 4t. Pills are optically centred, and you are not looking at a cache

**Verify with a cache-buster.** `?r=` changes on the stylesheet, but a cached
HTML never requests the new one. Three rebuilds in a row measured identical
wrong numbers against correct CSS:

```bash
agent-browser open "http://localhost:8931/index.html?cb=$(date +%s%N)"
```

**Then check the trailing track.** `letter-spacing` is applied after the last
glyph as well as between glyphs, so a tracked label sits one tracking-unit
closer to the left edge than the right. `getBoundingClientRect` on a Range will
NOT show it — the trailing space is outside the ink box, so the naive
measurement reports a perfect balance:

```js
['.chip','.state','.tab','.btn--lg','.btn--sm','.tag'].map(sel => {
  const c = getComputedStyle(document.querySelector(sel));
  const track = parseFloat(c.letterSpacing) || 0;
  return sel + ' ' + (parseFloat(c.paddingRight) + track - parseFloat(c.paddingLeft)).toFixed(1);
})   // every one within 0.5 of zero
```

And when a decoration is deleted, **check what its padding was compensating
for**: the chip kept `11px` left against `14px` right for a round after the
dot on its left was removed.

## 4u. A brand mark can be broken and still measure fine

`zapier.svg` held one path — a single bar of a six-spoke asterisk. §4n measured
its ink as 100 × 25 and it was filed as "a wide wordmark", which is exactly what
a broken mark looks like to a bounding box. **Any mark whose aspect is stranger
than about 3:1 gets looked at, not measured** — render it at 64px and compare
it to the brand's real mark.

## 4v. After touching keyframes, check the element is still where it belongs

Keyframes are a tempting place to park a transform, and a centring offset
parked there disappears the moment the keyframes are rewritten. After any
animation change, assert POSITION as well as motion:

```js
const w = document.querySelector('.scene.is-on .tplwin');
const h = w.querySelector('.tplwin__hint');
const wr = w.getBoundingClientRect(), hr = h.getBoundingClientRect();
Math.round((hr.left + hr.width / 2) - (wr.left + wr.width / 2))   // 0
```

Then check it again with the animation off (`prefers-reduced-motion`), which is
the state that proves the position does not depend on the loop at all.

## 4w. A product visual on a card is a crop, and a comparison shows both sides

RULES P6, P7, P9. These are read, not computed — but read them every time a
figure lands on a card.

- **Does it run off the edge?** Lay the surface out at the product's own size
  and let the band take whatever does not fit. A drawing that fits inside its
  frame reads as an illustration *of* the product; a fragment that continues
  past the crop reads as the product.
- **Is it left-packed?** Meta pushed to the far right is exactly what the crop
  eats.
- **Did it get scaled instead of cropped?** Four columns shrunk to 29% of a band
  with 11px rows is a diagram of the app, not a picture of it.
- **Does the comparison carry both marks**, theirs and ours, with the word
  between them? One logo describes; it does not compare.
- **Prove the crop.** `flex:none` on the children of any flex column holding a
  list — a flex column shrinks its rows rather than overflowing, so a
  twelve-step run fits a card sized for eight and the comment claiming it is
  "cut there" stays true-looking and false (P8).

```js
// the surface must be wider (or taller) than the box that clips it
[...document.querySelectorAll('.vs__viz, .acard')].map(el => {
  const c = el.firstElementChild;
  return el.className.split(' ')[0] + ' ' +
    (c ? c.scrollWidth + '/' + el.clientWidth : '—');
})
```

## 4y. The picture agrees with the sentence above it, in both themes

RULES K5, K6, R10. **Nothing in the visual gate can catch a picture that is
merely wrong**, so this one is done by reading.

- **Read the claim, then the figure.** The Codex card claimed *parallelism* —
  "several AIs get more done at once" — and drew a single sequential column.
  Ask what shape the claim has before styling anything.
- **A card set varies inside, not outside.** Four boxes at four widths with the
  same insides is one template stretched. Vary the arrangement *within* each
  card (`docs/comparison-card-research.md`).
- **Measure a mock's colours in BOTH themes.** Mock surfaces are often
  `aria-hidden`, so axe never looks at them, and a correct-looking light
  screenshot has hidden three separate defects: mock text at 1.92:1 in dark, a
  terminal at 1.16:1 against its band, and a mask still 60% opaque where the
  card cut it.

```js
document.documentElement.setAttribute('data-theme', 'dark');
[...document.querySelectorAll('[aria-hidden="true"] *')]
  .filter(e => e.textContent.trim() && !e.children.length)
  .map(e => getComputedStyle(e).color + ' on ' + getComputedStyle(e.parentElement).backgroundColor)
```

## 4z. The mock is the product, and every state actually happens

RULES S9, F33-F40. The checks that exist because a mock looked like the product
until someone who uses the product looked at it.

- **Every glyph is a real Lucide icon**, at the version the app ships, and it is
  the icon the component *renders* — not the one whose name sounds right. Three
  of four composer icons were wrong at once: `LayoutTemplate` where the app
  renders `SwatchBook`, plus two outdated hand-drawn paths. Fetch the path.
- **One edge treatment per surface.** A 0.7px ring and a 54px shadow together is
  what makes an outline read heavy; the platform's Popover has the border and no
  shadow.
- **A control that looks live is live**, or it says why it is not. The prompt box
  shipped as a `<p>` pretending to be an input, and clicking in it is the first
  thing anyone does.
- **A delimited strip carries no surface of its own.** A footer with a divider
  above it and the card's inset either side is already delimited; a
  ring-and-shadow bar inside it is a card inside a card.
- **A state class out-specifies the resting rule that sets the same property.**
  Equal specificity plus later position means the state does nothing, and the
  symptom looks like broken motion rather than broken CSS:

```js
// for each state class, does the resting rule win?
const el = document.querySelector('.wfo__who');
el.classList.add('is-holding');
getComputedStyle(el).transform    // must not be 'none'
```

- **Stacking order is part of the state.** Choosing the forward object by
  opacity while the pile keeps DOM order leaves the one meant to be in front
  behind its successor.
- **A journey arrives, and the arrival holds.** If something travels, something
  turns up — and it stays for longer than a step, or it did not arrive.

```js
// the delivered thing exists, and is on top of what produced it
const a = document.querySelector('.slk'), b = document.querySelector('.wfo--run');
a && b && (a.getBoundingClientRect().top < b.getBoundingClientRect().bottom)
```

## 4x. The markup is still balanced, and nothing escaped its container

**Run the structural check after ANY scripted edit to the markup.** This is not
optional and it is not covered by anything else in this file:

```bash
python3 tools/check-html.py            # "site/index.html: balanced"
```

It exists because a regex edit matched `<div class="vsui">.*?</div>` against a
block whose rows are themselves `<div>`s. The non-greedy match stopped at the
first nested `</div>`, and the replacement left one orphan behind. That orphan
closed `.versus` early, so a comparison card's heading and body escaped the
grid and spanned the page at full width.

**Every check in this file passed on that build.** axe: 0 violations. Border
audit: pass. Breakpoint sweep: no overflow at any width. Token audit: clean.
Asset stamps: clean. The screenshot I took was cropped above the damage. A
broken *nesting* does not fail a11y, does not draw a border, and does not
overflow the viewport — it just quietly reparents half a section.

So also assert containment, which is the symptom a human notices first:

```js
[...document.querySelectorAll('.vs')].every(c => c.closest('.versus'))        // true
[...document.querySelectorAll('.vs')].map(c => Math.round(c.getBoundingClientRect().width))
// four equal numbers — one card wider than its siblings means it escaped
```

**And never regex across nested tags of the same name.** Match on a unique
attribute, or rebuild the block from its opening tag by counting depth.

**Never string-match an `assets/…` path in `index.html`.** `build-css.py`
stamps `?v=<hash>` onto every one of them, so a literal match against the
path you wrote in source silently matches nothing — the script prints its
success message and changes zero bytes. This has cost two rounds. Match with
a regex that tolerates the stamp, and assert the replacement count.

## 4n1. One logo, rendered one way

The wordmark appears in the header and in the footer, and they are authored in
different places months apart. Every property must match — the page shipped
its own name in **Roobert 600** at the top and **Roobert Mono 500** at the
bottom, at the same size and the same tracking, which reads as a mistake
rather than as a variant:

```js
['.nav__logo span', '.footer__mark span'].map(s => {
  const c = getComputedStyle(document.querySelector(s));
  return [c.fontFamily.split(',')[0], c.fontWeight, c.fontSize, c.letterSpacing].join('/');
})   // two identical strings
```

Check the icon beside it too — `.nav__logo img` and `.footer__mark img` are
one lockup, so one size.

**Do not grow the wordmark past 16px.** The heading-weight gate (4i) allows
600 nowhere outside a product mock, and the wordmark is its one exemption
*because* it sits under that threshold. A larger footer lockup at 600 turns
that exemption into a violation.

## 4n3. A figure fits the viewport, and its contents scale with it

Two separate failures, one answer.

**A figure sized only by its content ignores the browser.** The control
stage was as tall as the product mock inside it — 722px, whatever the window
was — so on a short viewport the screen ran off the bottom and the reader
never saw the row the beat was about. A figure that must be seen whole is
**fitted**: the mock keeps its design size and one scale factor puts it in
whatever height is left.

```js
// nothing that has to be read whole may be taller than the window
['.ctrl__frame','.ladder__view','.wfsc'].map(s => {
  const el = document.querySelector(s); if (!el) return s + ':—';
  return s + ':' + (el.getBoundingClientRect().height <= innerHeight);
})   // all true, at 1440×620 as well as 1440×900
```

The available height is the stage's offset **minus the header**, not the
offset doubled: the top number exists to clear a floating header and there
is no header at the bottom. Mirroring it whole threw away 60px and scaled
the mock down on viewports that did not need it. Keep a floor (0.62) — below
it the product's 13px rows stop being readable, and a picture nobody can
read is worse than one that is cropped.

**A composition positioned in container units is not a composition.** The
workflow scene's objects each did their own `cqw` / `cqh` arithmetic against
the frame. Change the frame's **aspect** and they drift apart, the group
stops being centred, and at wide-and-short the whole scene sat in a corner.

Design it once at a fixed size, keep that ratio at every scale, and centre
it:

```js
const f = document.querySelector('.ladder__frame').getBoundingClientRect();
const c = document.querySelector('.wfsc__cv').getBoundingClientRect();
[Math.round(c.left - f.left) === Math.round(f.right - c.right),   // centred
 Math.round(c.top  - f.top)  === Math.round(f.bottom - c.bottom)]
// true at 1600×620 and 1280×1000 alike
```

**A hidden element still takes its width.** The step-4 schedule chip appeared
to wander as the browser was resized: the `Save workflow` chip beside it was
only `opacity:0`, still in flow, and its width came from the canvas — so
every resize pushed the visible chip sideways. Two states of one slot sit on
**one anchor**, not side by side.

## 4n2b. Measure every state for overlap — and wait for it to settle

A multi-state figure has N compositions and each one can collide. Assert it
rather than looking at one of them:

```js
(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const cv = document.querySelector('.wfsc__cv').getBoundingClientRect();
  const sc = document.getElementById('wfScene');
  const sel = ['.wfo--ask','.wfo--run','.wfo--team','.wfo--perm','.wfo--list'];
  const out = [];
  for (const step of ['1','2','3','4']) {
    sc.dataset.step = step;
    await wait(900);                       // ← the transitions are 420–640ms
    const box = sel.map(n => {
      const el = document.querySelector(n);
      if (parseFloat(getComputedStyle(el).opacity) < 0.05) return null;
      const r = el.getBoundingClientRect();
      return { n, l:r.left, r:r.right, t:r.top, b:r.bottom };
    }).filter(Boolean);
    const hit = [];
    for (let i=0;i<box.length;i++) for (let j=i+1;j<box.length;j++) {
      const a=box[i], b=box[j];
      const ox = Math.min(a.r,b.r)-Math.max(a.l,b.l);
      const oy = Math.min(a.b,b.b)-Math.max(a.t,b.t);
      if (ox>2 && oy>2) hit.push(a.n+'×'+b.n);
    }
    const esc = box.filter(x => x.t<cv.top-2||x.b>cv.bottom+2||
                                x.l<cv.left-2||x.r>cv.right+2).map(x=>x.n);
    out.push('s'+step+' ov['+(hit.join(' ')||'ok')+'] out['+(esc.join(' ')||'ok')+']');
  }
  return out.join('  ');   // every state: ov[ok] out[ok]
})()
```

**The `await` is the check.** Without it the probe sets `data-step` and
measures in the same frame, so all four states report the geometry that is
still on screen — four identical lines that look like a pass. The tell is
that the numbers do not change between steps; if they do not, the probe is
broken, not the layout.

Run it at 1024×900, 1440×900, 1440×700 and 1920×1080. On a fixed-ratio canvas
the four should agree; if they do not, something in the figure is still sized
against the frame rather than the canvas.

## 4n2. A sticky stage must not resize between its own states

If a pinned stage swaps content per beat, measure it in **every** state, not
just the one that happens to be showing:

```js
const f = document.querySelector('.ctrl__frame');
[1,2,3,4,5].map(b => { f.dataset.beat = b; return b + ':' + f.offsetHeight; })
// one number, five times
```

A stage that shrinks at one beat is not just ugly. If anything derives a
layout value from its height — here `--ctrl-beat`, which sets all five step
heights — the shrink feeds back: the steps shrink, the document loses height
mid-scroll, and the beat that caused it gets carried past the observer band
before it can activate. The symptom is the last beat never lighting up
(`findIndex(is-on) === -1`) while the first four are fine.

Two rules that came out of it:

- **Derive from the maximum, never the current value.** `--ctrl-h` tracks the
  tallest state seen, and `.ctrl__frame` takes it as a `min-height` so the
  stage is a fixed object.
- **Reset the maximum on width, not on every resize callback.** A beat change
  fires the ResizeObserver too; only a real viewport change alters the width.

```js
[...document.querySelectorAll('.ctrl__step')].map(s => Math.round(s.offsetHeight))
// identical at every beat, and equal to the frame
```

## 4o2. A centre-focused rail

The testimonial rail centres a card and fades the rest. Four things it gets
wrong the moment any of them is touched:

```js
// 1. the paint actually applies. `.reveal.is-in{opacity:1;transform:none}` is
//    (0,2,0) and later in the file than `.qcell` — it silently wins, and the
//    correct `--d` sits on the element doing nothing.
[...document.querySelectorAll('.qcell')].map(c =>
  c.style.getPropertyValue('--d') + ' → ' +
  getComputedStyle(c.querySelector('.quote')).transform)
// d 0 → matrix(1,…), d 1 → 0.91, d 2 → 0.82 — never all matrix(1)

// 2. the pitch is the LAYOUT width. A bounding rect reports the scaled box,
//    so every distance would be measured in a unit that shrinks as you scroll.
document.querySelector('.qcell').offsetWidth   // constant at a given viewport

// 3. one arrow press moves exactly one slot
const p = document.querySelector('.proof'), a = p.scrollLeft;
document.querySelectorAll('.railnav__b')[1].click();
// after the smooth scroll: p.scrollLeft - a === card + gap

// 4. the loop puts you back. Push it to either extreme and wait for scrollend.
p.scrollLeft = 0;      // → settles back to one set width in, not at 0
```

**Percentages in a self-padded scroller.** The rail pads itself by
`50% - card/2`, so a card width written as a percentage of the rail's
*content* box is defined in terms of a padding defined in terms of it.
`--q-card` must stay stated against the viewport.

**The gaps must SHRINK outward.** A card that scales inside a track of
unchanged width leaves the leftover width between the cards, so the row
spreads instead of compressing:

```js
const q = [...document.querySelectorAll('.qcell')]
  .map(c => c.querySelector('.quote').getBoundingClientRect())
  .filter(r => r.right > -300 && r.left < innerWidth + 300);
q.slice(1).map((r, i) => Math.round(r.left - q[i].right))
// monotonic towards the middle — e.g. 24, 26, 29, 29, 26, 24. Never 31, 78.
```

Re-run it **between** snap positions (`p.style.scrollSnapType='none'`, then
`p.scrollLeft += 94`) — the offsets are interpolated per card, and a
mistake there shows as the row jumping a few pixels at each slot boundary
while looking perfect at rest.

**`translateX` goes before `scale`.** The other order scales the
translation too, and every card lands short by its own scale factor.

## 4p2. An opacity fade over text is a contrast change

axe composites an inherited `opacity` **unless** the element also carries a
`transform`, in which case it downgrades to `incomplete`. So two fades of
the same depth can report differently, and the `incomplete` one is the tool
declining to judge rather than passing. Never read it as a pass.

Compute the floor before choosing the value: resting text must clear 4.5:1
on its ground *after* the fade. On white, `--ink` (`#0C0F12`) survives down
to about 0.56; `--ink-soft` does not survive any fade you would notice. If
a design needs a deeper fade than the type can pay for, the type colour has
to darken to buy it — that is what `.ctrl__step p` at `--ink` is for.

Two fades on this page, and they are not the same case:

- **`.ctrl__step`** — 0.6, and every statement is read at full strength as
  it passes the middle of the viewport. This one axe checks; it must be 0
  violations.
- **`.qcell > .quote`** — down to 0.3, and axe returns `incomplete`. The
  recorded judgement: the off-centre cards are previews rather than reading
  material, any one of them reaches full strength on the centre line by
  drag, wheel, arrow or keyboard, and a screen reader never sees the fade.
  Both fades take `prefers-reduced-transparency` and `prefers-contrast:
  more` as an exit. If a fade is ever extended to text nobody can bring to
  full strength, neither judgement holds.

## 4q1. A container unit written on the container measures the wrong box

An element is **never its own query container**. A `cqw` written on the same
element that declares `container-type` resolves against the *next container
out*. On a letterboxed canvas — `width:min(100%, calc(100cqh * W / H))` inside
a scene — that is the frame, not the canvas, so the moment the canvas is
height-capped the type is oversized relative to what it sits in and every
child grows in percentage terms. The scene's card measured 37cqh tall at
1920×1080 and 43cqh at 1024×900 from exactly this.

Either move the declaration to a wrapper *inside* the container, or write the
letterbox out longhand against the outer container:

    font-size: min(2.05cqw, calc(2.05cqh * 760 / 545));

Check it, do not assume it:

    getComputedStyle(cv).fontSize / cv.getBoundingClientRect().width  // → 2.05%

at three viewports, at least one of them height-constrained (1440×700) and one
width-constrained (1024×900). If the ratio is not constant, the unit is
resolving against the wrong box.

## 4q2. One inset per card, and `1em` is not it

`padding: … 1em` on four parts of one card is four different insets, because
`em` resolves in each part's own font-size — a `.88em` row indents 15.5px
under a `1em` header's 17.6px, and the dots sit two pixels inside the icon
directly above them.

Hoisting it to a custom property is not the fix on its own. An **unregistered**
custom property inherits as raw tokens, so `--pad:1em` declared on the card is
re-resolved in whichever child substitutes it — the same bug wearing a
variable. Register it so it computes once, at the declaration:

    @property --wfo-pad{ syntax:'<length>'; inherits:true; initial-value:0px; }

Verify by measuring, with **transitions disabled** (see 4n2b) and the object's
own `transform` cleared, that every inset in the card is one number:

    hdIcL 17.6  tagR 17.6  bodyL 17.6  chipL 17.6

A hidden sibling measured instead of a visible one will read wrong for an
innocent reason — `scale(.86)` moves a bounding box's left edge inward by 7%
of its width. Measure the element that is actually on.

## 4q3. Composition is position, never scale

A resting state may not carry `transform:scale()`. Five states at `.85`, `.8`,
`1.04`, `.8` and `.78` render the same 12.5px label at five sizes and put a
`.78` card beside a `1.0` list — which reads to anyone looking at it as a mess
of type sizes, not as depth. Objects move, rotate and fade between states;
scale belongs to an entrance and ends at 1.

    [...scene.querySelectorAll('[class*="--"]')]
      .map(e => getComputedStyle(e).transform)      // no matrix with a≠1 at rest

## 4q4. Three type sizes in a mock, not six

Count the distinct computed sizes inside a figure across **all** its states:

    const seen={}; for (const s of steps){ scene.dataset.step=s; await wait(700);
      scene.querySelectorAll('*').forEach(e=>{const c=getComputedStyle(e);
        if(e.textContent.trim()) seen[c.fontSize+' '+c.fontWeight]=1}) }

Three is the ceiling: a name, a sentence, a label. Six with three of them
inside 5% of each other (17.6 / 16.7 / 16.2 / 15.9) is not a hierarchy. State
nested sizes as the fraction that lands back on one of the three — a `.68em`
label inside a `.88em` row is written `.77em`.

## 4q5. `resize` is not a command

It is `agent-browser set viewport <w> <h>`. `resize` returns an error the
shell swallows, the window stays at whatever it was, and a sweep across four
viewports returns four readings of the same one — which looks exactly like a
perfectly responsive layout. Always print `innerWidth` alongside the
measurement so the sweep proves it actually moved.

## 4q6. A grid track is sized by what spans it

`grid-column:1 / -1` on a wide caption does not just place it — the track
sizing algorithm distributes its width back over every `auto` track it spans.
A 262px caption over three avatar columns pushed them apart and silently
absorbed the negative margins that were supposed to make a facepile. Nothing
errors; the layout just ignores you.

When one row needs items packed (overlapped, gapless, centred as a unit) and
another row is full-width, use `flex-wrap` with the full-width item at
`flex:0 0 100%`. It cannot feed back into the first row's sizing.

Assert the lap, do not look at it:

    const a=[...els].map(e=>e.getBoundingClientRect());
    (a[0].right - a[1].left) / a[0].width   // → the intended fraction

## 4q7. An `<img>` with no CSS size is a hard pixel size

`width`/`height` attributes are a fallback, not a design decision. Inside a
figure whose every other number scales with the canvas, an unstyled `<img>`
stays at its attribute size and therefore changes size *relative to the type
beside it* at every window. Give it `width`/`height` in em, and any ring or
border in em too.

    // same figure, four viewports — the ratio is what must hold
    avatar 37.5 lap 9.3 (25%)   //  1920x1080
    avatar 26.3 lap 6.5 (25%)   //   390x844

## 4q8. A stage may not measure itself

If a script writes a size onto an element, it may not read that element's size
as the input. `--ctrl-h` was written onto `.ctrl__frame{height}` and read back
from the same element, with `Math.max` on the read — so it ratcheted one
padding per ResizeObserver callback and settled on 963px of frame around 622px
of content. It converges, which is what makes it invisible: no error, no
flicker, just a band of empty ground that looks like a design decision.

Measure the CONTENT, write to the FRAME. Then assert they differ only by the
padding, in every state:

    frame.getBoundingClientRect().height - win.getBoundingClientRect().height
      === paddingTop + paddingBottom      // ± the deliberate max-state slack

The same rule covers the sticky offset: `--ctrl-top` is written onto the
stage's `top`, so the height budget must not read the live `top`. Register the
design clearance as its own `<length>` property and read that.

## 4q9. A scroll-linked pair aligns at the line the observer uses

If an IntersectionObserver makes a step "current" at the middle of the
viewport, then whatever the step is paired with must be centred on the middle
of the viewport too. A fixed sticky offset satisfies that at exactly one
window height and drifts by half the difference everywhere else — 91px at
1095px tall, invisible at the 900px the design was drawn at.

Verify by scrolling each step's CONTENT centre to `innerHeight/2` and reading
the pair's centre. Two traps:

* **Scroll the content centre, not the box centre.** A step with asymmetric
  padding (the first one usually has some) reports a box centre that is
  nowhere near its text, and the probe invents a defect that is not there.
* **Converge, don't jump.** The first scroll changes reveal state and re-runs
  the sizing, which moves the target. Loop until the delta is under a pixel;
  a single `scrollBy` reported an 18px error that did not exist.

## 4q10. Sweep the section, do not spot-check it

One probe, every viewport, all states, asserting: nothing escapes the frame in
any state, the page has no horizontal overflow, tap targets clear 44px, and no
type falls under the floor. Run it at 320, 390, 430, 600, 768, 820, 1000,
1024, 1280, 1440, 1920 and 2560 — plus at least one short window (1024x640,
1440x700), which is where a fitted stage misbehaves.

Use `element.checkVisibility({opacityProperty:true, visibilityProperty:true})`
for the escape test. `getComputedStyle(e).opacity` reads only the element's own
value, so a child of an `opacity:0` parent looks visible and every hidden
state reports a false escape.

## 4q11. A transform does not move a layout box

Anything laid out *after* a scaled element is placed against that element's
full-size box, not against what you can see. The control section's index bar
was a sibling after a `scale(0.87)` mock inside a frame sized to the scaled
height, so it sat outside the frame entirely — and it got further out with
every point of scale.

If a thing must stay inside a frame that a transform is resizing, take it out
of flow. Then assert it, in every state:

    idx.getBoundingClientRect().bottom <= frame.getBoundingClientRect().bottom

## 4q12. `align-items:center` needs a row to centre in

An implicit grid row is `auto`, so it grows to its item. Give a fixed-height
container one oversized item and the ROW becomes taller than the container:
centring inside the row is then a no-op, and the whole overflow leaves from
the bottom. `grid-template-rows:minmax(0,1fr)` pins the row to the content
box, and an oversized item overflows it equally at both ends.

Pair it with `transform-origin:center` — an origin of `top center` makes a
shrinking picture drift upward out of the middle it was placed in.

Assert the air, don't look at it. `getBoundingClientRect()` on a scaled
element is the *visual* box, which is exactly what you want here:

    top === bottom  &&  left === right      // in every state, every viewport

## 4q13. Keep the probes in the repo

`tools/probes/` — `ctrl-frame.js`, `ctrl-align.js`, `ctrl-sweep.js`. These are
the gate for #control, they took a session to get right, and twice they were
written to /tmp and lost when the sandbox reset. A probe that has to be
rewritten is a probe that will be rewritten wrong.

## 4ag. Equal air is one declaration, and it is measured to the ink

The `#outputs` figures strip had 18px above it and 28px below. Two causes, and
the first is the one that generalises:

**The two gaps came from different declarations.** Above, the frame’s
`row-gap: clamp(10px, 1.2vw, 15px)`. Below, the strip’s
`padding-bottom: var(--o-fpad)` — the frame’s general air, borrowed. Two
values that are meant to look identical are only ever equal by coincidence.
Both now read `--o-mgap`, one token used twice (RULES M7).

**And a line box is not the ink.** Even with the same number on both sides the
gaps differ, because the letters do not sit centred in their line box. Here the
ink sits 3.3px below the box top and 2.3px above the content bottom, averaged
over the seven tabs — a 1px residual, left in deliberately because it is
smaller than the tab-to-tab variation it would be correcting for.

**`display:block` throws the `row-gap` away.** Below 1080 the frame stacks its
children as blocks, so the gap above the strip simply stopped existing: 2px
over and 35px under, four times worse than the desktop fault. The frame drops
its bottom padding there and the strip carries the air on both sides, exactly
as it does above 1080. **Check a token that lives on a grid at one width and a
block at another.**

`tools/probes/ometrics-air.js`, every tab, every width. Three things it had to
get right before it reported anything true — all three had it calling the
strip balanced while it was 10px out:

* **Canvas ink, not the box.** `actualBoundingBoxAscent/Descent`.
* **The baseline from the DOM, not from arithmetic.** The strip is a
  baseline-aligned flex row, so a child’s box height is not its line-height
  and half-leading arithmetic lands several pixels out. A zero-size
  `inline-block` sits with its bottom margin edge on the baseline.
* **Wait for the strip to land.** `.ostage.is-live .ometrics li` holds a
  `translateY(6px)` until the run finishes, and 6px is most of the error.
  Poll the transform on the scene that is on *after* the swap — polling the
  one captured before it returns immediately against the outgoing scene, which
  is how three separate runs of this probe produced three different answers.

Expect every tab within ~2px, at 1920 / 1440 / 1280 / 1100 / 1024 / 390.

## 4ad. A channel token is not a fill token — now a lint

`--ink-rgb` and `--paper-rgb` are the shadow-and-scrim channels and they do
**not** swap with the theme, on purpose (`system.css` §1). Painted as a shadow
they are right: a shadow is dark in both modes. Painted as a *visible surface*
they are a theme bug — and one that only appears in the mode nobody
screenshots.

Four occurrences of the same mistake is what made this a check rather than a
paragraph:

| | dark-mode contrast |
|---|---|
| `.ctrl__index li` — four of five marks | 1.09 |
| `.unlock` — the popover had no edge at all | — |
| `.par__bar` — the four parallel tracks | **1.01** |
| `.quote__bar` — under a comment claiming it held on both grounds | **1.04** |

    python3 tools/tokens.py     # `channel as fill` / `channel as ring`

It flags `--ink-rgb`/`--paper-rgb` in a `background`, or in a **zero-blur**
`box-shadow` (which is a ring, not a shadow). It skips mocks, whose chrome is
pinned (P1), and gradients, which are scrims — what the channel is *for*.
`--accent-rgb`, `--ok-rgb` and `--wait-rgb` are semantic colours meant to be
painted and are not checked.

The fix is always the same shape: `color-mix(in srgb, var(--ink) N%,
transparent)`. `--ink` swaps; the channel does not.

**First run found three:** a dead rule for a `.chip` that is not in the markup,
`.ocard` missing from the mock list, and the mobile nav drawer opening **97%
white in dark mode** under `--nav-ink` link text — about 2:1, on the one
surface nobody opens on a phone in the dark. It is 8.92:1 now.

## 4ae. A state rule must win its property — now an audit block

A `.is-*` declaration that loses the cascade does nothing, and the failure
reads as a broken animation rather than as CSS, which is why it survives a
screenshot review. Two shipped this month:

* `.wfo__who.is-holding{transform}` under `.wfsc[data-step="3"] .wfo__who{
  transform:none}` — the avatar that was supposed to lift never moved.
* `.hero[data-cta="cut"] .display--tail{display:none}` under
  `#rotator .rot{display:block}` — the variant rendered identically to the
  default and the CSS read correctly.

`tools/audit.js` §9. **Toggling the class is the wrong test** — the first
version of this block did that and reported ten correct rules as dead, because
a state that returns a property to its default (`.ocard.is-on{transform:none}`
cancelling the offset `.is-live` gave every card) looks identical either way.
It walks the cascade instead: every author rule that matches the element and
sets the same property, ordered by specificity then document position, and
asks whether ours is last.

Two more things it needs to be usable:

* **Losing to another state is ordinary cascade.** `.ocard{transform:6px}`
  under `.is-live` is *meant* to be cancelled by `.ocard.is-on`. Only a
  **resting** rule beating a state rule is reported.
* **`:not(.is-x)` states are skipped and counted**, not quietly passed — the
  state there is the absence of a class and what to toggle is ambiguous.

**First run found two:** the Okou-window nav lost its `.is-here` highlight in
dark mode (the theme rule out-specifies the state, so the current row was the
same 60% grey as the four inactive ones), and three dead lines in `base.css`
still describing the rotator's old `display:none/block` machinery, replaced by
`#rotator .rot` and unable to fire since.

## 4af. Where an object is, and what it is allowed to sit on

Four faults from one beat of the workflow scene, all of them read from the
outside as "the animation is broken" and none of them animation. One of the
four was mine, added while fixing the other three.

**A margin on an absolutely positioned box is added to its inset.** `left` and
`top` place the *margin* box. This page has no blanket element reset — every
figure class zeroes its own margin — so one `<figure>` with no `margin:0` of
its own inherits the UA default `1em 40px` and lands 40px right and 14px low of
where it was drawn. That was `.wfo--ask`, the only `<figure>` in the scene, and
the 40px is exactly what it lapped the run card by. `tools/audit.js` §10 sweeps
every absolutely positioned box on the page; `auto` is exempt (it is the
centring idiom) and a negative margin used to centre a dot is not — use a
transform, the way `.arti__val` already does. **First run found the second
one:** `.arti__dot` at `margin:-4px 0 0 -4px`.

**A `clip-path` clips the shadow off too.** `inset()` resolves against the
**border box**, and a `box-shadow` is painted outside it — so `inset(0)`, which
reads as "clipped to nothing", deletes the drop shadow. The Slack landing card
was the one surface in the scene with no shadow: a flat white rectangle with
four hard edges sitting on the mat, next to two cards that lift off it. Bleed
the clip by the shadow's reach — read off the shadow, not guessed: sideways and
up, `0 2px 10px` reaches 5px; down, `0 26px 50px -26px` reaches
26 − 26 + 25 = 25px. `--slk-bleed` / `--slk-drop` state it once for both the
open and the closed state. `tools/audit.js` §11 checks every clipped surface on
the page against its own shadow, **in every beat** — a wipe is only wrong in the
state where it is supposed to be showing, which is the state nobody screenshots.

**And I mis-read that frame as a lapping fault.** The landing card overlaps the
run card's header, and I took that for the bug, pulled the two apart and
re-centred the whole beat. Tong: *"你之前那个覆盖关系，我觉得挺好的。我说的 bug
是你把阴影给去掉了"*. The lap was never the problem; the missing shadow was what
made the frame look broken, and the lap is what was carrying the depth that
would have made the overlap read as depth. **Before restyling a composition
because something in it looks wrong, name which pixels are wrong.** A flat
rectangle and a badly-placed rectangle look the same in a still.

**Beat 1 is two compositions, not one.** The ask beside the run card, and the
#growth message that replaces it. Each has to be checked on its own, so
`tools/probes/wfsc-geometry.js` reports it twice — `s1` and `s1+`. The two laps
it reports there are intended. Two things the probe needed before it could see
anything:

* **Read `clip-path`, not just opacity.** An object hidden by a clip still has
  its full border box, and the Slack card was counted as present in all four
  beats — four phantom overlaps that buried the one real one.
* **Park the loops first.** Setting `data-step` by hand does not stop the
  runner's timer; it took `is-in` back off the card between the write and the
  measurement, and the landing measured 0px tall.

**A card in a cropped band takes its content's height.** `.lanes` stretched
each lane to the band, so the lane's white surface stopped at the crop while
its last row ran on another 26px over the band's own ground. Light hid it;
dark shipped a 3.12:1 node that axe caught and six audits before it did not,
because they were run in light.

## 4ah. A mock is only as true as its least-sourced part

`PermissionActionCard` was copied out of the product line by line — shell,
icon, title, detail, duration select, and the neutral bordered confirm that is
the tell for this component. Every string came from `common.json`. Then a
direction needed the card to be *clickable*, and the duration list written to
make that work offered **"This time only"**, which the product has never had,
and omitted **"7 days"**, which it has.

The copied 95% is what hides the invented 5%: a reviewer checks the parts that
look like decisions, and a dropdown full of plausible durations does not look
like a decision.

**So: when a mock gains behaviour the source did not have, the behaviour gets
sourced too.** For this product that means:

```
USER_PERMISSION_GRANT_EXPIRES_IN_OPTIONS   ["1h","24h","7d","always"]
DEFAULT_USER_PERMISSION_GRANT_EXPIRES_IN   "1h"
authorization.permission.durationOptions.* 1 hour / 24 hours / 7 days / Always
chat.permissions.*                         the card's own strings
```

`gh api search/code` reaches all of it; the connector **catalog** does not
(`api.vm0.ai/api/connector-catalog/…` needs auth), so a scope name like
`campaign-budgets.write` cannot be verified this way and has to be recorded as
unverified rather than left looking sourced.

**And put the state where the product puts it.** The expiry is amber, on the
card, `mt-0.5 text-xs font-medium text-amber-700` — not a caption underneath.
A line under a card that mixes a real product string with a marketing phrase
reads as UI and is not.

## 5. Type scale

`docs/design-system.md` §2.

**The lint is the check now.** `tools/tokens.py` reports `raw type size` for
any absolute `px` font-size in the DESIGN layer that is not a mock — which is
the thing the census below was trying to prove and could not, because it was
exempting only a third of the mocks and therefore counting the app's type
scale as the page's. Run `python3 tools/tokens.py`; it must be 0.

The census still has a job the lint cannot do: it sees the COMPUTED value, so
it catches two rules resolving to sizes 0.5px apart, which reads as sloppiness
even when both sides are tokens (RULES F15). **14 at 1440x900**, and every one
accounted for:

- eight of them are `--t-d1/d2/d3` and the section headings, all `clamp()` —
  one token each, evaluated at this viewport. They move with the window.
- `17 / 15 / 13.5 / 12` — `--t-body`, `--t-sm`, `--t-meta`, `--t-mono`.
- `15.5049` — `--q-name`, `calc(16 * var(--qu))`. The testimonial card scales
  with its container, so this is 16 design units, not a stray value.
- `11.61` — `.vs__vs` at `.86em`. A fraction of its parent, by design.

```js
const MOCK = '.absui,.slackui,.flowui,.perms,.okoui,.acard,.a2a,.scene__shot,'
  + '.appui,.tplwin,.tpl,.pbox,.arti,.tsh,.lane,.vsui,.wfsc,.wfo,.par,'
  + '.ochat,.ochip,.ostage,.cbox,.cgate,.cnet,.ctrail,.vs__viz,.mock';
const sizes = {};
document.querySelectorAll('main *,.footer *,.nav *').forEach(el => {
  if (el.closest(MOCK) || !el.textContent.trim()) return;
  const s = getComputedStyle(el).fontSize; sizes[s] = (sizes[s] || 0) + 1;
});
Object.keys(sizes).length   // 14 — a NEW one is the thing to explain
```

**A mock's sizes are the app's and stay raw.** Pushing the page's `--t-*` into
`.perms` or `.pbox` would make the drawings stop looking like the product,
which is the whole reason the exemption exists (RULES P1). If a mock's type
looks wrong, the fix is inside the mock's own scale — three sizes, a name, a
sentence, a label (RULES F15) — not the page's tokens.

Then the floor:

```js
[...document.querySelectorAll('main *,.footer *,.nav *')]
  .filter(el => !el.closest(MOCK) && el.textContent.trim() && !el.children.length)
  .filter(el => parseFloat(getComputedStyle(el).fontSize) < 12)   // must be []
```

A stray reads as a token at 1440 and diverges everywhere else, so check the
count at one width and trust it — the values are what matter, not the viewport.

## 6. Grid and breakpoints

Check `390 / 768 / 1024 / 1280 / 1920`:

- `document.documentElement.scrollWidth === innerWidth` (no horizontal scroll)
- the centred stack keeps its measures — heading ≤20ch, lede ≤54ch —
  `tools/audit.js` §3 prints the boxes
- the hero product image and its stickers stay inside the viewport
- the nav collapses to logo · actions · burger under 960px

## 7. Motion

`tools/audit.js` §4 — the hero sequence fired, marks lit, the counters read
exactly `2 hrs / 8+ / 14 hrs`, the ladder step and its stage panel agree,
`.is-stuck` toggles past 28px.

Then reduced motion:

```bash
agent-browser set media light reduced-motion
# tools/audit.js §5 must return PASS — nothing left invisible
agent-browser set media light
```

## 8. Copy is unchanged

Design work must not alter wording. Diff the copy, not just the file:

```bash
git diff -- site/index.html | grep -E '^[-+]' | grep -vE '^[-+]{3}' | grep -viE 'class=|data-|<div|<span|<p |aria-'
```

Anything that shows up here needs to be an explicit, requested copy change.

## 9. Performance sanity

```bash
agent-browser vitals
```

Baseline to hold: CLS 0, FCP under ~0.5s locally, LCP under ~1.5s. The page is
image-heavy; new screenshots go through the same `assets/` conventions and keep
`loading="lazy"` below the fold.

## 9a. The build did not corrupt the CSS

`tools/build-css.py` aborts on unbalanced `/*` / `*/`, but that only catches the
loud case. The prune pass reads the comment above a rule as part of its selector,
so **a dot or a comma in a comment can delete the rule under it**. After any
build that touched a commented block, confirm the rule actually reached the
browser — the file having the text is not proof:

```js
[...document.styleSheets].flatMap(sh => { try { return [...sh.cssRules] } catch { return [] } })
  .filter(r => r.selectorText && /YOUR-SELECTOR/.test(r.selectorText)).length   // > 0
```

## 9c. Replaced assets actually reach people

Changing a file in place does not change its URL, so browsers and CDN edges keep
the old bytes. `build-css.py` stamps `?v=<sha1>` on every local asset for exactly
this reason — confirm it did, and confirm the live copy is the one you built:

```bash
curl -s "$LIVE/assets/artifact/ads-v1.jpg" -o /tmp/a.jpg
md5sum /tmp/a.jpg site/assets/artifact/ads-v1.jpg   # must match
ffmpeg -i /tmp/a.jpg -vf "crop=..." /tmp/look.png   # and LOOK at it
```

**Counting `?v=` proves nothing** — a stamp can be present and stale. The first
version of the stamper matched `assets/[^"?]+`, which cannot match a URL that
already carries a stamp, so it stamped each asset once and never re-stamped one;
editing a file in place left its URL frozen at the hash it had the day it was
added. Check the stamp against the bytes:

```bash
python3 - <<'EOF'
import re, hashlib, os
h = open('site/index.html').read()
for p, stamp in re.findall(r'(assets/[^"?)\s]+)\?v=([0-9a-f]{8})', h):
    real = hashlib.sha1(open(os.path.join('site', p), 'rb').read()).hexdigest()[:8]
    if real != stamp: print('STALE', p, stamp, '->', real)
EOF
# must print nothing
```

**A local check cannot detect a delivery bug.** If someone reports a fix has not
landed, fetch the shipped bytes before re-fixing anything — twice now the file
has been correct on disk and correct on the server and still wrong on screen.

## 9b. The asset links point at what you just built

`tools/build-css.py` stamps `styles.css?r=<hash>` and `app.js?r=<hash>` from the
file contents. Never edit those by hand, and never publish without running the
build:

```bash
python3 tools/build-css.py
grep -o 'styles.css?r=[0-9a-z]*' site/index.html    # must match the new hash
```

A hand-kept `?r=42` sat unchanged across four deploys. Returning visitors kept a
cached stylesheet from before a block was renamed, so that whole region rendered
with **no CSS at all** while everything else looked fine. Hard-reload proves
nothing here — check the query string.

### 4y2. Card sets and product mocks

Run this on any section built from repeated cards, and after any change to a
mock's markup.

- **Read each claim, then look at its picture.** Does the shape of the image
  match the shape of the sentence? A parallelism claim drawn as one column is
  a defect no automated check can see (K5).
- **Are any two pictures the same component with different strings?** If so the
  set is uniform however different the boxes are (K6).
- **Does each image bleed off an edge**, or does it float whole inside padding?
  A crop is what makes a mock read as a running interface rather than a diagram.
- **Measure mock text and surface contrast in BOTH themes.** These elements are
  `aria-hidden`, so a clean axe run says nothing about them (R10).
- **Check specificity, not just the rule you wrote.** A section rule like
  `.vs p` scores (0,1,1) and silently beats every mock class at (0,1,0). Grep
  for the same selector in *both* `system.css` and `base.css` — fixing one
  layer leaves the other winning.
- **A panel anchored by `bottom:` has a constant overhang.** Shrink its type and
  it loses proportionally more of itself off the cut.
- **A mask's percentages are relative to the element it is on.** If that element
  overflows its container, the fade finishes outside the visible box and the
  crop is a hard cut. Put the mask on the box that does the clipping.

### 4z2. A component built to a supplied design

- **Read the frame through the API, do not eyeball it.** Sizes, fills,
  radii, letter spacing and auto-layout gaps are all in the node JSON.
- **Write every value as `calc(<design number> * var(--unit))`.** The
  design's own numbers stay readable in the CSS and the ratios cannot
  drift as the component is edited.
- **The scale unit must be a LENGTH.** A unitless scale cannot be built
  from a viewport unit: CSS will not add a number to a length nor divide
  one by another. `clamp(.8, .53 + .054vw, 1.32)` is invalid, silently.
- **Scale off the component, not the viewport.** Use `cqw` on a wrapping
  container. A viewport formula only holds at the one width it was solved
  for, and breaks completely when the column count changes.
- **Then MEASURE the rendered ratios against the design's** at every
  breakpoint, and state where they deviate and why:

```js
const q = document.querySelector('.quote'), r = q.getBoundingClientRect();
(q.querySelector('.quote__av').getBoundingClientRect().width / r.width)  // vs 48/317
```

- **Supplied art with a baked ground has to be keyed out** before it can
  live on a themed surface, or the component only works in one mode.
- **`margin-inline:auto` on a grid item** turns stretch into shrink-to-fit.
  With a `flex:1 1 0%` child that resolves to zero width.

## 4aa. Behaviour, before publishing

`site/app.js` is one IIFE. `var` is function-scoped and a block is not a
scope, so two `var`s of one name anywhere in it are one variable.

```bash
python3 tools/scopes.py     # must print 0
python3 tools/tokens.py     # the `background:` shorthand lint must print 0
```

- **For any section that changes on its own, log the parts against each
  other over a full cycle** — the pane, the control's active class, the
  ARIA state and any derived text. They can disagree while each looks
  right alone, and a screenshot only ever shows one frame:

```js
setInterval(() => log(pane.dataset.x, tabs.findIndex(isOn), line.textContent), 2000)
```

- **When behaviour is wrong, instrument the function.** Four wrong
  theories came before one probe on the reel. `markSlot(10) items=6` ended
  it in one run.

## 4ab. State integrity — the checks that came out of a facepile

Two of three avatars looked active at once and the ring meant to mark the
active one hung below the pile. Both faults were invisible in a still and
obvious in motion, so **run this with the page moving**, not parked.

```js
// tools/audit.js §8
```

- **A per-item z-index and a state z-index must not collide.**
  `.wfo__who{z-index:calc(9 - var(--wi))}` gave the leftmost face 9, and the
  rule that lifts the holder also said 9. Equal z-index falls back to DOM
  order — the exact thing an explicit z-index was added to stop depending on.
  §8 reports a tie only where the group is a stack (some pair of its boxes
  overlaps, clipped to the parent) **and** the tied elements share a class.
  Both narrowings were forced by false positives: six message rows in a
  bottom-anchored list all sit at z-index 1 and never touch, and `.panel`
  over `.close__art` is content layered over background art, which is fine.

- **A marker's anchor is the row, not the wrap.** `top:50%` on a container
  that wraps resolves against the whole padding box, caption row included —
  the ring hung 14px low, exactly `(65 − 37) / 2`. §8 reports any absolutely
  positioned child of a `flex-wrap:wrap` offsetParent.

- **A sized grid must state its row track**, or the tallest item pushes the
  container past the height it declared and `align-items:stretch` carries
  every sibling with it:

```bash
python3 tools/tokens.py     # "sized grids with an implicit row track" must be 0
```

  Narrowed to grids with a flexible column template: `display:grid;
  place-items:center` on a 32px icon tile is every icon on the page and can
  never over-constrain anything. Unnarrowed it reported 30; narrowed, 2, and
  both were real.

- **Prove a new check against the bug it was written for.** Inject the
  regression, confirm the check fires, then confirm it passes on the fix.
  The z-index check went through three predicates before one worked: the
  first reported seven pieces of noise, the second was clean *and silently
  missed the real fault* — the two tied faces were two apart and never
  touched each other; they each sat over the face between them.

- **A state is read against its neighbours.** Measure the rendered sizes, not
  the transform values: a `-.3em` lift came to five screen pixels once the
  scene's fit-to-frame scale applied, and nothing beside it had moved.

- **`getBoundingClientRect` reports the UNCLIPPED box.** For a bottom-anchored
  `overflow:hidden` list, assert the *list's* bottom against the composer, not
  a row's — a row overhanging by 16px it cannot paint is not a fault, and
  chasing it costs a round.

- **Sample axe on a warm page.** The first pass after a load catches unrelated
  entrance fades at random — 3 hits in 54 cold, 0 in 20 warm, with frame timing
  identical either way. Re-run before attributing a hit to the change under
  test.

- **Verify a generator by reading the document back**, never by its own
  summary. `data-scene` is on the tab buttons *and* the scene panels, and every
  button sits above every panel, so four builds wrote into one target while the
  tool printed four scene names. Anything a generator strips, it must also
  write, or a value set anywhere else is gone on the next run.

- **A phase class is cleared where the class that set it is cleared.** A
  two-phase entrance adds `.is-live` for the *opening* state and a second class
  to release it. `playPane` removes `is-live` on hand-back; `is-landed` had to
  be removed in the same line, or the next tab opened already finished.

- **A percentage translate and a percentage flex-basis resolve against the same
  box.** Stating the app unit as `--o-appw:62%` and centring it with
  `translateX(calc((100% - var(--o-appw)) / 2))` means the beat cannot drift
  from the layout — no JS measurement, and nothing to re-derive when the split
  changes.

- **Every number on the page is traceable to something visible near it.** Read
  values off the scene rather than choosing plausible ones: its messages, its
  connector cards, the difference between two timestamps in the thread. A
  figure that cannot be traced is decoration with a number on it.

- **`data-count` carries the DISPLAY string, separators and all.** `countUp()`
  parses the digits out for the maths and writes the attribute back as the
  final text, so stripping the comma to make it parse leaves "1,111" reading
  "1111" once the animation ends.

- **`<i>` is italic by default.** A numeral wrapped in one renders oblique
  under an upright picture unless the component says `font-style:normal`.

- **A floating card's deepest lap is the inset the chrome under it reserves.**
  One card at `--o-lap` and another at `--o-lap + 18` means the rail keeps the
  wrong strip clear, and the deeper one lands on a label as soon as it sits at
  that height. Stagger on the far edge, not on the lapping one.

- **Check chrome coverage against LABELS, not just icons.** §8's rail check
  tested the icon tiles and passed while a card was eating the first letter of
  "Connectors".

- **Size a clipped list for headroom, not for a fit.** 387px of content in a
  386px list is not "fits" — it is one reflow away from slicing the first line
  of the thing the picture exists to show.

- **Percentage offsets from each end do not survive a column that changes
  height.** Two content-height cards at `top:12%` / `bottom:23%` sat 134px
  apart at 1440 and overlapped by 5px at 1120. Centre the pair with a fixed
  gap instead, and assert both the equal width and the non-collision.

- **A tab's dwell has to cover assembly AND reading.** Time the last cue, the
  landing and the spring, then add reading time — 9s looked generous and left
  under four seconds with the finished frame on screen.

- **An element that ends smaller than it starts is laid out at its END size.**
  Draw the departing parts outside the box on `overflow:visible` rather than
  transitioning `width`. Check the neighbours' positions in both frames — if
  anything moved, the box is being animated.

- **A one-shot `opacity` on a graphic is not the N3 fault.** N3 forbids fading
  TEXT on a LOOP; four `aria-hidden` paths playing once per load are what its
  own "once per load is an artifact" clause allows. Confirm the element is not
  text and not on a timer before reaching for it.

- **A wipe cannot carry a drop shadow.** `clip-path` cuts the shadow at the
  moving edge, so while a card wipes in, the shadow belonging to the part
  already revealed is not drawn — and the heavier the shadow, the more the cut
  reads as a broken rectangle rather than as the leading edge. §11 checks the
  static bleed; it cannot see the moving edge, so judge that one by eye at a
  forced mid-wipe frame:

```js
el.style.transition='none'; el.style.clipPath='inset(-10px -10px calc(45% - 20px))';
```

- **The signature of a line-box gap is OFF-CENTRE, not "taller than the
  glyph".** A padded or explicitly sized control is meant to be bigger and
  centres its icon; a line box puts the glyph at the top with descender space
  below. `audit.js` §6 tests the offset. A first version tested the height
  difference and reported five padded buttons while missing the fault it was
  written for — and a guard on `height !== 'auto'` skipped it entirely, because
  computed height is never `auto` on a rendered element.

## 10. Publish

```bash
okou host ./site --site okou-ai-teammate-swiss-draft
```

Then re-run §1 and §2 against the live draft URL — the hosted build loads real
webfonts, which has changed measured heights before. Promoting to the production
slug is a separate, deliberate decision.

- **An attribute is only an anchor if one kind of element carries it.** The tab
  buttons and the scene panels both carry `data-scene`, and every button sits
  above every panel — so a splice keyed on `data-scene="x"` wrote into the same
  panel seven times while reporting success. Verify a generator by reading the
  document back (what channel is in each scene?), never by its own summary.
- **Anything a generator strips, that generator must also write.** A value set
  by a one-off script outside the generator is gone on its next run.
- **No thread may cast two faces that read alike at 36px.** `avatar-1` and
  `avatar-4` are both light-skinned and auburn and are indistinguishable at
  message size.
- **Text is never dimmed with `opacity`** — not even a panel standing down
  behind another panel. On the dark ground `opacity:.3` composites label ink to
  1.8:1. Recede by colour, by focus (`filter:blur`), or by scale, and pair it
  with `aria-hidden` if the thing is genuinely not content at that moment.

- **A custom property set on a child is invisible to its parent.** When a value
  moves from an element to its container, the value has to move with it.
- **A balanced-tag scan starts one character in.** Beginning at the opening
  tag's own index matches that tag and closes the span one level late.
- **A splice span must balance, not run to the next landmark.** The landmark is
  only stable until something else moves between the two.
- **Never re-declare `position` in a rule whose job is to host an `::after`.**
  An absolutely-positioned element is already a containing block; setting
  `position:relative` hundreds of lines later silently undoes the placement.
- **A grid's row track defaults to `auto`.** A product window meant to be a
  fixed height and clip needs `grid-template-rows:minmax(0,1fr)`, or it grows
  with its content the first time a transient row appears — and a fault that
  appears at *every* width is a sizing fault, not arithmetic.
- **Check specificity against the pinned mock before adding a shared rule.**
  `.scene[data-scene] .ochat` (0,2,0) beats `.ochat--slack` (0,1,0); a shared
  `background` will unpin a mock that must not follow the theme.
- **`getBoundingClientRect` reports the unclipped box.** For a list with
  `overflow:hidden`, assert the LIST's bottom against the composer, not a row's.
- **Sample axe on a warm page.** A cold first pass catches unrelated entrance
  fades at random; re-run before attributing a hit to the change under test.

- **`height` on a grid container is not a ceiling.** Without an explicit
  `grid-template-rows:minmax(0,1fr)` the row track is `auto` and the tallest
  item wins — which is how seven tabs ended up at three different heights.
  Check EVERY tab, not the one you are looking at.
- **A product mock is transcribed, not remembered.** Open the real token file
  and the real component and copy the values, naming the source path in a
  comment so the next person can diff it. vm0's live in
  `turbo/packages/ui/src/styles/globals.css`,
  `turbo/apps/platform/src/views/css/index.css`, and the `okou-page` views.
- **The product's greys are a COOL ramp** (gray-50 `#F3F5F8`, hue 216).
  `color-mix(black, white)` gives a warm grey that reads as a different
  product. Same for shadows: the product's is tinted 220/12%.
- **An earlier duplicate of a selector cannot be beaten from above.** Edit the
  existing block; do not add a competing one before it.
- **A later media block silently overrides an earlier one at every width it
  covers.** A `@media (max-width:1080px)` rule declared after a
  `@media (max-width:620px)` rule wins at 390 too.
- **When you rename a class, grep the media queries.** Narrow-width rules are
  the easiest place for a dead selector to hide.

- **`top:50%` on a WRAPPING flex container centres on the wrap, not on the row.**
  If a caption shares the box, half of it is below the thing you meant to centre
  on. Anchor to `top:0` and the row, or measure in JS.
- **An indicator drawn behind everything is not an indicator.** Check its
  z-index against the stack it is marking: above the items it is not on, below
  the one it is.
- **Two elements must never state the same offset independently.** A lift used
  by both a marker and the thing it marks belongs in one custom property on
  their shared parent, or they will drift.
- **A state has to be readable against its neighbours, not just against
  itself.** Lift the active one AND stand the others down; measure the rendered
  sizes (41 vs 35) rather than trusting the transform values.
- **Sample axe while the thing is moving.** Parking on a settled frame tests a
  state the visitor may never see.
- **Before adding a second element to mark a state, check whether the first one
  can carry it.** A ring drawn as the avatar's own `box-shadow` cannot be
  mis-centred, mis-stacked, or fall out of register with a lift — three faults a
  separate marker element had all at once.
- **A graphic accent uses `--accent` (3:1 floor); accent TEXT uses
  `--accent-solid` / `--accent-wash` (4.5:1).** The text token reads muddy as a
  thin stroke.
