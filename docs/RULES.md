# The rules, in one place

`design-principles.md` argues them, `design-system.md` gives the values,
`motion.md` gives the timings, `qa-checklist.md` machine-checks them. **This
file is the index** — every rule this page is held to, one line each, with a
pointer to where it is argued and where it is checked.

If you are about to change something visual, read this. If you are about to
add a rule, add it here too, or it will be re-litigated in three rounds' time.

---

## Shape

| # | Rule | Why | Checked |
|---|---|---|---|
| S1 | **Every component with a box is a rectangle** — `--r-btn` 10px. `--r-pill` is only for things that are actually round: avatars, status dots, bar caps. | A page that mixes lozenges and rectangles has two ideas about what a control is. | QA §4j |
| S2 | **Every section is a white card on the grey page** — `--r-section` 16px, no shadow. The hero and the closing CTA band are the two deliberate exceptions. | Mixing grey bands, white bands and cards makes a reader work out what a section is three different ways. | QA §4j |
| S3 | **A surface is a fill.** Not an outline, and not a shadow either at section scale. Shadow is reserved for things that genuinely float: the header, and a product window sitting on a section. | | QA §2 |
| S4 | **No structural lines.** Separate with grounds, space and the type scale. Exceptions are written down and scoped to one component by name. | Hairlines used as structure read as clutter. | QA §2 |
| S5 | **A rounded box holding rounded controls has a derived corner**: `--r-nav = --r-btn + --nav-pad`. | Otherwise the two curves fight — pinched in one corner, loose in the next. | §7 |

## Measure

| # | Rule | Why | Checked |
|---|---|---|---|
| M1 | **One section geometry**: `--card-gap` (grey around the card) and `--pad-section` (card edge → content), with the block padding derived at `× 1.35`. | A card whose top gap has no relationship to its side gap reads as two decisions. | QA §4j |
| M2 | **The measure is capped at 1320px** — and the cap lives *inside* `padding-inline: max(--pad-section, --edge − --card-gap)`. Setting that to `--pad-section` alone silently removes it. | | QA §4j2 |
| M3 | **The header is exactly as wide as a section card.** | A header sized by its own expression agrees with the cards at no width at all. | QA §4j |
| M4 | **Equal air above and below a pinned block is derived**, not chosen — and it measures against the **stuck** header height, not the resting one. | A fixed top margin balances at one window height only. | QA §4j |

## Type

| # | Rule | Why | Checked |
|---|---|---|---|
| T1 | **Two regions.** Reading (12 · 13.5 · 15 · 17 · 21, ratio ≈1.12, fixed px) and display (23 · 30 · 54 · 66 · 96 · 108, ratio ≈1.3, all fluid). | One ratio cannot serve a 12px label and a 108px headline. Prose must not resize with the window or it stops honouring its measure. | QA §5 |
| T2 | **The floor**: no page-level prose under 15px, no page-level label under 12px. Product mocks are exempt — they draw the app's sizes. | | QA §5 |
| T3 | **11 distinct sizes on the page, every one a token.** A one-off `clamp()` inside a rule is a bug. | It was 19 before this was written down. | QA §5 |
| T4 | **Every site-level title is Archivo 500.** Nothing outside a mock is 700; 600 survives only on the wordmark. | A bold grotesque at display size reads as shouting. | QA §4i |
| T5 | **Three faces**: Archivo display, Instrument Sans prose, IBM Plex Mono utility. Inter only inside the one component built to a supplied design. | | QA §4i |
| T6 | **No emoji.** | It was the one pictogram on a page that has none, and it read as decoration bolted onto a sentence. | — |

## Colour

| # | Rule | Why | Checked |
|---|---|---|---|
| C1 | **One accent in two weights** — `--accent` for display-size marks, `--accent-solid` (4.5:1 both ways) for anything smaller and every fill. | | QA §1 |
| C2 | **Cool neutrals, never warm.** | Warm off-white reads as AI-generated. | — |
| C3 | **State layers are composited, not picked.** Hover and selected are one translucent layer at two alphas; `#E7EBF0` is *hover*, `#DEE4EB` is *selected*. | No screenshot can tell you this, and using hover for selected makes every selected row a step too light. | QA §4f |
| C4 | **A photographic ground's veil is computed** — `1 − target ÷ that image's mean luminance` — so images of different brightness land a screen on the same value. | | §15 |
| C5 | **Translucent chrome over an image must be safe by construction**: compute against white, the lightest thing it can sit on. Blur makes it read as frosted; transparency is not what does that. | axe cannot evaluate a scrolling backdrop. | QA §4k4 |
| C6 | **axe 0 violations.** Audit the *resting* frame — park any loop first, then sample ~20 times across it. | | QA §1 |

## Motion

| # | Rule | Why | Checked |
|---|---|---|---|
| N1 | **Transform, opacity and clip-path only.** Tokenised curves; never `ease`/`linear`. | | §motion |
| N2 | **The resting state is the finished state.** `.is-live` is added by JS only, so reduced motion, no-JS and pre-observer all show complete content. | Never build a loop that leaves the page empty if it fails. | QA §5 |
| N3 | **Looping text must not fade.** Reveal text-bearing elements with `clip-path` — painted or not painted, never half-legible. | Once per load is an artifact; every twelve seconds forever is a defect. | QA §1 |
| N4 | **One rAF and one cue list per timeline.** Never a stack of `setTimeout`s. Gate on an observer and on `visibilitychange`. | | §motion |
| N5 | **Lead with the hero**: the most important element gets the largest displacement and the only sprung curve. **One spatial origin** — mixed directions read as chaos. **Stagger so each beat settles before the next starts.** | LottieFiles motion-design. | — |
| N6 | **Write the irregularity down.** Four tasks finishing 1-3-2-4 read as independent runs; 1-2-3-4 reads as a progress bar. | | — |
| N7 | **Anything present-but-not-showing must be `inert`**, not merely `aria-hidden` — a product mock is full of real buttons. | | QA §4k2 |
| N8 | **Auto-advancing anything pauses** off screen, in a background tab, on keyboard focus, and under reduced motion; a click parks it for good. It does **not** pause on hover. | The progress is what says the panel will change; freezing it under the pointer makes the section feel stuck. A keyboard user has no other way to hold it. | QA §4m |
| N9 | **A looping reel clones, and only the middle set is real.** Clones are `aria-hidden`, roleless and out of the tab order; selection is marked on the centred slot, never by matching a data attribute. | Matching lights every copy and shows a second highlighted item at the mask edge — the seam the clones exist to hide. | QA §4m |

## Product mocks

| # | Rule | Why | Checked |
|---|---|---|---|
| P1 | **Read the component, not the design system.** Open the `.tsx` and copy its class list. | "It uses our tokens" is not "it is our component". | QA §4f |
| P2 | **A mock has two sizes**: it is laid out at the product's own size and *scaled* to the page's. | Laying out at the marketing column's width gives a cramped window with desktop-sized text, and every clip it then needs is a symptom. | QA §4f |
| P3 | **Nothing inside a mock may be clipped, faded or height-absorbed.** If it needs that, it is laid out at the wrong size. | | QA §4f |
| P4 | **Every glyph is a real Lucide icon** at the version the app ships; typeface and colours are platform tokens. | Hand-drawn paths are what made the mock read as "not our product". | QA §4f |
| P5 | **Sentence case only.** The product never uses Title Case or CSS uppercase. | | QA §4f |

## Content

| # | Rule | Why | Checked |
|---|---|---|---|
| K1 | **Copy is content.** Design work does not rewrite wording unless it is asked for, and then the diff is shown. | | QA §8 |
| K2 | **Section labels**: uppercase, text only, no numbers, above the heading. | `01 / OUTPUTS` in a left rail is an AI tell and costs a quarter of the page. | QA §4j |
| K3 | **Real content or nothing.** Placeholders declare themselves. | | QA §4c |
| K4 | **A generated artefact is really generated** — authored as a plan, rendered by the template's own engine, and shipped as what it produced. | A hand-coded thing that resembles a website is not the product's output. | — |

## Process

| # | Rule | Why |
|---|---|---|
| R1 | **Edit the source, never `site/styles.css`.** Run `tools/build-css.py`, which stamps `?r=` on CSS/JS and `?v=<sha1>` on **every local asset**. | A hand-kept hash shipped stale CSS across four deploys; unversioned images then made two correct screenshot fixes invisible for two rounds. |
| R7 | **Verify a fix against the SHIPPED bytes, not your build.** `curl` the live URL, check its hash, crop the image and look at it. | A local check cannot detect a delivery bug — the file was right on disk and right on the server, and still wrong on screen. |
| R2 | **Never slice a file between two anchors without asserting the distance.** Prefer `replace(old, new, 1)` with the full block and an assert. | A two-anchor slice once deleted 1084 lines, and the symptom surfaced far from the cause. |
| R3 | **`git diff --stat` before building**, and read the built file for the rule you just wrote — the pruner has silently eaten one before. | |
| R6 | **After replacing a block, grep for every identifier the old block defined.** A function dropped from a replacement still *called* from a `setTimeout` throws silently, and the visible symptom lands nowhere near the cause. | A missing lede sentence turned out to be a `writeLead` deleted two rounds earlier. |
| R4 | **Publish to the draft slug only.** Production is never edited directly. | |
| R5 | **A dated changelog entry per round**, recording what changed *and what was wrong*. No version numbers. | |
