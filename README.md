# VM0 Website

The Okou marketing site — the deployable page, its CSS sources, and the design
rules it is built on. This repo is the home for **anything written down about how
this site looks and behaves**: design principles, the design system, motion
spec, QA gate, and the change history.

Live pages are published from here to Okou's static hosting:

| | URL | Notes |
|---|---|---|
| Production | `okou-ai-teammate-swiss.sites.vm0.io` | never edited directly |
| Draft | `okou-ai-teammate-swiss-draft.sites.vm0.io` | every change lands here first |

## Layout

```
site/                 the deployable page — this is what gets published
  index.html          markup and copy (copy is edited by a human, not by tooling)
  styles.css          BUILT ARTIFACT — do not hand-edit, run tools/build-css.py
  app.js              interaction layer: one observer + one scroll loop
  assets/             logos, product screenshots, artifact previews
  robots.txt          Disallow: / — the draft must not be indexed
src/css/
  base.css            component-internal CSS for the product mocks
  system.css          the authoritative design layer — edit design here
docs/
  design-principles.md  the rules, and why each one exists
  design-system.md      tokens, type scale, grid, surfaces, components
  motion.md             timing, easing, the five entrances
  qa-checklist.md       the gate every change has to pass before publishing
  changelog.md          what changed, and what was wrong before
  skills-research.md    the agent skills this design work draws on
tools/
  build-css.py        assembles + prunes site/styles.css
  audit.js            the browser-side audits (no-rules, type scale, motion, a11y)
```

## Working on it

```bash
# 1. edit src/css/system.css (design) or site/index.html (structure/copy)
python3 tools/build-css.py            # -> site/styles.css

# 2. look at it
cd site && python3 -m http.server 8931
agent-browser set viewport 1440 900
agent-browser open http://localhost:8931/

# 3. run the gate — see docs/qa-checklist.md
agent-browser a11y            # must be 0 violations
#   plus the blocks in tools/audit.js

# 4. publish to the draft slug
okou host ./site --site okou-ai-teammate-swiss-draft
```

Pulling the current production build back down (it is the source of truth for
what is live):

```bash
okou host versions okou-ai-teammate-swiss
okou host clone okou-ai-teammate-swiss ./tmp-live
```

## Ground rules

1. **Never edit the production slug.** Publish to the draft, review, then
   promote deliberately.
2. **`site/styles.css` is generated.** Design changes go in
   `src/css/system.css`; mock internals in `src/css/base.css`. Do not add a new
   theme layer on top — read `docs/changelog.md` for what that did last time.
3. **Copy is content, not styling.** Do not rewrite headlines, body copy or
   labels while doing design work. Layout, order, type and motion are fair game.
4. **No structural lines.** See `docs/design-principles.md` §1.
5. **Ship only through the gate** in `docs/qa-checklist.md`: axe at 0, the
   no-rules audit at 0, five breakpoints, reduced motion.
