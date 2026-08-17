# QA gate

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

Recurring causes, in the order they have actually bitten:

- **`--ink-mute` on a `--wash-2` fill.** The mute grey has to clear AA on the
  *darkest* ground it lands on, not just on white. Check labels inside trays,
  pills, tabs and status chips.
- **White text on an accent fill.** 3.4:1. Accent fills carry ink text.
- **Landmarks without a unique name.** The announce strip and the composer are
  both `<aside>`; each needs its own `aria-label`.
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

## 5. Type scale

`tools/audit.js` §2. Page-level sizes should be the nine scale steps plus the
hero lead and the chrome sizes — roughly ten distinct values. If the list grows,
a hard-coded `font-size` has crept in. (For reference: the pre-rebuild page had
25.)

## 6. Grid and breakpoints

Check `390 / 768 / 1024 / 1280 / 1920`:

- `document.documentElement.scrollWidth === innerWidth` (no horizontal scroll)
- the heading/lede pair is side by side above 1080px and stacked below —
  `tools/audit.js` §3 prints both boxes
- the floating header never overlaps the announce strip (`--ann` is measured, so
  check after a font swap and at the width where the strip wraps)
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

## 10. Publish

```bash
okou host ./site --site okou-ai-teammate-swiss-draft
```

Then re-run §1 and §2 against the live draft URL — the hosted build loads real
webfonts, which has changed measured heights before. Promoting to the production
slug is a separate, deliberate decision.
