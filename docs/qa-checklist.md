# QA gate

> The rules themselves are indexed in **`RULES.md`** — one line each, with a
> pointer to where each is argued and where it is checked. This file is the
> machine half.

Run all of it before publishing, even for a one-line change. Every check here
exists because something slipped past without it. The audit snippets live in
`tools/audit.js`.

```bash
python3 tools/build-css.py
cd site && python3 -m http.server 8931 &
agent-browser set viewport 1440 900
agent-browser open http://localhost:8931/
```

---

## 1. Accessibility — must be **0 violations**

```bash
agent-browser a11y            # expect: violations 0, passes 41
```

**Audit the resting frame.** A looping animation makes this check
non-deterministic — axe measures one instant, and an element caught mid-fade
reports below contrast. Park the loop first, then audit:

```js
document.getElementById('a2a').classList.remove('is-live');
```

Then run it *again* without parking, ~20 times across a full loop. Anything that
reproduces is a real defect: text that fades is text below contrast, and a loop
re-enters that state forever. The fix is `clip-path`, not a quieter audit.

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
getComputedStyle(document.querySelector('.appui')).fontFamily  // "Noto Sans"
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

Every site-level title is Archivo **500** (`system.css` §3). Nothing outside a
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
// every one "Archivo" — except the ladder, which is Inter by design
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

## 5. Type scale

`docs/design-system.md` §2. Count the page's distinct sizes — **11**, and every
one a token:

```js
const MOCK = '.absui,.slackui,.flowui,.perms,.okoui,.acard,.a2a,.scene__shot,.appui,.tplwin,.tpl';
const sizes = {};
document.querySelectorAll('main *,.footer *,.nav *,.announce *').forEach(el => {
  if (el.closest(MOCK) || !el.textContent.trim()) return;
  const s = getComputedStyle(el).fontSize; sizes[s] = (sizes[s] || 0) + 1;
});
Object.keys(sizes).length   // 11 — anything more is a stray clamp() in a rule
```

Then the floor:

```js
[...document.querySelectorAll('main *,.footer *,.nav *')]
  .filter(el => !el.closest(MOCK) && el.textContent.trim() && !el.children.length)
  .filter(el => parseFloat(getComputedStyle(el).fontSize) < 12)   // must be []
```

A stray reads as a token at 1440 and diverges everywhere else, so check the
count at one width and trust it — the values are what matter, not the viewport.

## 6. Grid and breakpoints## 6. Grid and breakpoints

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

## 10. Publish

```bash
okou host ./site --site okou-ai-teammate-swiss-draft
```

Then re-run §1 and §2 against the live draft URL — the hosted build loads real
webfonts, which has changed measured heights before. Promoting to the production
slug is a separate, deliberate decision.
