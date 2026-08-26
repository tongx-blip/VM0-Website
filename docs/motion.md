# Motion

Implemented in `src/css/system.css` §18 and `site/app.js`. Zero dependencies —
CSS transitions plus one `IntersectionObserver` and one `requestAnimationFrame`
loop. The numbers below come from the *premium-microinteractions* standard
(`docs/skills-research.md`), so they are not taste; they are the spec.

---

## 1. Non-negotiables

1. Animate **only** `transform`, `opacity` and `clip-path`. Never layout
   properties (`top`, `left`, `width`, `height`, `margin`, `padding`).
2. Never use a browser default easing (`ease`, `linear`, `ease-in`, `ease-out`).
   Use a token.
3. Respect `prefers-reduced-motion: reduce` by **skipping the choreography**,
   never by leaving content hidden. The audit for this is in `tools/audit.js` §5.
4. One observer and one scroll loop for the whole page. No per-feature scroll
   listeners.
5. ≤6 properties animating at once; hover response ≤16ms.

## 2. Tokens

```css
--e-out:     cubic-bezier(.16, 1, .3, 1);    /* default */
--e-snap:    cubic-bezier(.22, 1, .36, 1);   /* buttons, small elements */
--e-elegant: cubic-bezier(.25, 1, .5, 1);    /* large movements, crossfades */
--e-spring:  cubic-bezier(.34, 1.3, .64, 1); /* the one playful beat */

--t-hover:  220ms;   /* pointer feedback        (spec band 200–260) */
--t-press:  120ms;   /* :active                 (spec band 90–140)  */
--t-state:  420ms;   /* state changes, header   (spec band 350–650) */
--t-reveal: 640ms;   /* scroll entrance         (spec band 500–700) */
```

## 3. The five entrances

Every element that arrives on scroll uses exactly one named variant, so the page
never animates in a single uniform way. The observer adds `.is-in`; CSS does the
rest.

| Variant | Markup | What it does | Used for |
|---|---|---|---|
| default | `class="reveal"` | fade + 18px rise, 640ms `--e-out` | paragraphs, notes, links |
| mask | `data-reveal="mask"` | each `.line` un-clips upward, 820ms, staggered 90ms via `--li` | every headline |
| stagger | `data-reveal="stagger"` | children rise in sequence, 560ms, 70ms apart via `--ci` | metrics, card grids |
| scale | `data-reveal="scale"` | settles from `scale(.985) translateY(14px)`, 720ms `--e-elegant` | the product stage |
| colour | `class="mark"` | the phrase warms from ink to accent, 620ms, 240ms after its line | emphasised phrases |

`--li` and `--ci` are written by `app.js` at load so the CSS can compute the
delays without JS being involved per frame.

## 4. The hero load sequence

The only orchestrated page-load moment. Elements carry `data-in`; `app.js` waits
for `document.fonts.ready` (with a 1.2s safety timeout so the fold never waits on
a webfont), then adds `.is-in` with a 110ms cascade: headline → thesis + actions
→ rotating statement → paragraph, with the emphasised phrase warming last.

## 5. Continuous and interactive motion

- **Statement rotator** — 4.2s dwell, then the outgoing line masks upward while
  the incoming one un-clips: 520ms `--e-elegant`. Pauses on hover and when the
  tab is hidden.
- **Connector marquees** — CSS keyframes, duration from `data-speed`, direction
  from `data-dir`. `animation-play-state` is `paused` until the rail is on
  screen, and pauses again on hover.
- **The four lanes** (`app.js` §3b2) — the Codex card's agents each finish a
  step on their own fixed interval (3.3 / 3.6 / 3.9 / 4.3s) from their own
  offset, and each loops on its own whole number of seconds (11 / 12 / 13 / 14).
  Every lane is therefore perfectly predictable on its own and the four never
  coincide, which is the only honest way to draw work happening *at once*. The
  arriving step is a `0fr → 1fr` shutter, never a fade (§N3), and the two
  newest steps stand down a beat apart at the end of a lane's loop so the wrap
  reads as the list settling rather than as a cut.
- **Metric counters** — count up over 900ms with a cubic ease-out and finish on
  the **exact string in the markup** (`data-count`), so the copy is never
  changed by the animation. Skipped entirely under reduced motion.
- **Step ladder** — the scroll loop picks the step nearest 44% of the viewport;
  a click wins for 1200ms so the settling scroll can't steal it back. The active
  step becomes a `--wash-2` surface; its stage panel swaps with a 440ms rise.
- **Floating header** — `.is-stuck` past 28px: rises from `translateY(var(--ann))`
  to 0, height 64→56px, ground more opaque. Only transform/height/background.
- **Hover craft** — buttons `translateY(-1px)` + shadow (220ms `--e-snap`),
  `:active` settles at 120ms; surfaces lift 3px; pills lift 2px; the logo mark
  rotates −12° on `--e-spring`; links draw their underline from the left; the
  arrow in a link nudges 4px.

## 6. What is deliberately absent

- No scroll-jacking, no smooth-scroll library, no parallax.
- No animation engine. GSAP was evaluated (see `docs/skills-research.md`); its
  patterns are used, its 116KB is not. If a future feature genuinely needs
  pinning or scrubbing, bundle GSAP + ScrollTrigger **locally** under
  `site/assets/vendor/` rather than pulling a CDN at runtime.
- CSS scroll-driven animations (`animation-timeline: view()`) are avoided: they
  do not tick reliably in the headless Chromium used for review, which makes
  them impossible to verify.

## A figure that performs instead of describing

`#parallel` is the page's one looping narrative. The rules it establishes:

- **One rAF timeline, one cue list.** Cues are `[ms, target]` pairs read every
  frame and toggled with `classList.toggle`, so scrubbing backwards (the loop
  reset) is free and no timer can drift out of sequence. Never a stack of
  `setTimeout`s.
- **Gate it.** An `IntersectionObserver` starts and stops the loop, and
  `visibilitychange` restarts it — a looping animation in a background tab is
  pure waste.
- **The resting state is the finished frame.** `.is-live` is added by JS only.
  Reduced motion, no JS, and the moments before the observer fires all get the
  complete figure. Never build a loop that leaves the page empty if it fails.
- **Write the irregularity down.** Four tasks that finish 1-3-2-4 read as four
  independent runs; 1-2-3-4 reads as a progress bar. If a sequence is meant to
  look uncoordinated, it has to be authored, not derived from an index.
- **Looping text must not fade.** Text at partial opacity is text below its
  contrast ratio. Once per page load is an artifact; every twelve seconds,
  forever, is a defect. Reveal text-bearing elements with `clip-path` — painted
  or not painted, never half-legible. Fades stay for surfaces and decoration.

## A rule that masks text sliding past it

The gesture: a divider is a shutter, and a paragraph appears from behind it and
retreats behind it. It is easy to get 90% right and have it read as broken,
because **the two ways it fails both look correct at the endpoints**.

The shutter is the growing box (`grid-template-rows: 0fr → 1fr` + `overflow:
hidden`). The rule has to be that box's own bottom edge, in every frame. Which
means **nothing between them may animate**:

- The row's `padding-bottom` must be **constant** (zero). A closed row's air is
  the title's `margin-bottom`, which never changes. If the padding animates to
  make room, the shutter and the rule drift by that padding for the whole of the
  transition — flush at 0% and at 100%, up to 29px apart in the middle.
- The paragraph must carry **no padding at all**. A `0fr` track cannot absorb
  padding, so any padding has to animate to avoid leaking a closed row's first
  line — and animating padding pushes the text off the shutter edge. Put the
  settled air in the **content flow** instead:

```css
.step__body > p::after{ content:""; display:block; height:var(--wf-rule-gap); }
```

  Content height is what a `0fr` track *does* collapse, and it never moves
  relative to the edge.

**Check it by measuring, then by looking.** A closed row's rule and an open row's
first line should sit the same distance under their titles — the text emerges
from exactly where the line was. Then force a transition and screenshot mid-way:
one row's last line must be sliced by its rule with no gap, and the next row's
first line sliced by its own.

```js
document.querySelectorAll('.step').forEach(s => s.classList.remove('is-active'));
document.querySelectorAll('.step')[2].classList.add('is-active');   // screenshot now
```
