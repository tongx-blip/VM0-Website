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
| S3 | **A surface is a fill.** Not an outline, and not a shadow either at section scale. Shadow is reserved for a product window sitting on a section — *not* the header, which separates by tone. | A shadow heavy enough to lift a white bar off a white section reads as a bruise; a light one does not lift it at all. | QA §2 |
| S4 | **No structural lines.** Separate with grounds, space and the type scale. Exceptions are written down and scoped to one component by name — currently `.tplwin` (a browser window's own edge) and `.vsui` (the platform `Card`'s 1px gray-200 border and the RunningIndicator's ripple ring). | Hairlines used as structure read as clutter. A product mock's borders are the app's chrome, not this page's. | QA §2 |
| S5 | **A box inset to a section card's width takes a section card's corner** — `--r-section`, 16px. The old `--r-nav = --r-btn + --nav-pad` derived the header's corner from the control inside it and produced 22px, which on a 54px bar is a lozenge. | The relationship being stated does not make the result right; a corner belongs to the box's own scale, not its contents'. | QA §4o |
| S6 | **The header has two states and the change between them is the message.** At rest it is full-bleed, flush, square, part of the page. Once the page moves it steps down by `--nav-top`, pulls in to `--card-gap`, takes `--r-section` and condenses to `--nav-h-stuck`. | A rounded bar floating above the first pixel of an unscrolled page is a decoration pretending to be a response to scroll. | QA §4o |
| S7 | **The header's content is bounded by the measure, one `--card-gap` outside the section column** — the section card's own padding expression, taken from the window edge instead of the card edge. | Unbounded, the wordmark sat 600px outside the content it labels at 2560. Flush with the section column, two edges land on the same pixel from different systems and read as a coincidence. | QA §4o |
| S8 | **The blur under the header is a ramp, not a switch — and the ramp starts at the top edge.** Four masked backdrop layers of increasing radius, every mask monotonic (opaque, one fade, gone) with stops as percentages of the whole veil. | A single masked layer fades the blur's *opacity* and still starts it at full strength. Masks that rise **and** fall make each layer a band, and overlapping bands print hard horizontal lines. Holding every layer at full alpha until a hem near the bottom makes the header region a flat slab — invisible under an opaque bar, obvious the moment the bar lifts and insets. | QA §4o |

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
| T7 | **A tracked label in a pill compensates its trailing space** — `padding-right: calc(pad - Nem)` where N is that component's own tracking. `letter-spacing` is applied after the last glyph too, so a centred tracked label is off-centre by one tracking-unit, always to the right. | Reported as "left small, right big" across every small tag on the page. | QA §4t |

## Colour

| # | Rule | Why | Checked |
|---|---|---|---|
| C1 | **One accent. Which weight is safe depends entirely on the ground, and on whether anything sits on it.** `--accent` (#ED4E01, the brand orange) for display marks, for accent text on a dark ground, **and for every decorative fill that carries no text**. `--accent-solid` only where text sits on or beside it at reading size on paper. `--accent-wash` for accent text on a grey. | `--accent-solid` is tuned to *exactly* 4.5:1 on white, so it clears AA on white and nothing else — 3.86:1 on `--wash-2`, 3.84:1 on the dark header. The correction runs in **opposite directions** on the two grounds. A 6px dot has no text on it and was wearing the compromise for no reason: the brand orange appeared in 3 places on the page and the darkened one in 14. | QA §1, §4r |
| C2 | **Cool neutrals, never warm.** | Warm off-white reads as AI-generated. | — |
| C3 | **State layers are composited, not picked.** Hover and selected are one translucent layer at two alphas; `#E7EBF0` is *hover*, `#DEE4EB` is *selected*. | No screenshot can tell you this, and using hover for selected makes every selected row a step too light. | QA §4f |
| C4 | **A photographic ground's veil is computed** — `1 − target ÷ that image's mean luminance` — so images of different brightness land a screen on the same value. | | §15 |
| C5 | **Translucent chrome over an image must be safe by construction**: compute against white, the lightest thing it can sit on. Blur makes it read as frosted; transparency is not what does that. | axe cannot evaluate a scrolling backdrop. | QA §4k4 |
| C6 | **axe 0 violations.** Audit the *resting* frame — park any loop first, then sample ~20 times across it. | | QA §1 |
| C11 | **Never put `opacity` on `--ink-mute`.** It is defined as the lightest text the page allows on every ground it uses; any opacity on top of it is under AA by construction. Make a label quieter with size or weight. | `.vs__vs` shipped at `opacity:.5` and axe caught it. | QA §1 |
| C7 | **A component that crosses grounds carries both versions as a token swap**, never as a second copy. The header defines `--nav-ground` / `--nav-ink` / `--nav-ink-hi` / `--nav-accent` / `--nav-chip`; no rule inside it names a colour. | Two copies drift the moment one of them is edited. | QA §4o |
| C8 | **A colour used at an alpha is declared as channels** — `--ink-rgb`, `--paper-rgb`, `--accent-rgb`, `--accent-solid-rgb`, `--ok-rgb`, `--wait-rgb` — and consumed as `rgb(var(--ink-rgb) / .05)`. A hex cannot carry an alpha, which is the whole reason the literals bred. | `rgba(12,15,18,…)` was re-typed **41 times in 22 different alphas**, and not one of them would have followed `--ink` if `--ink` had moved. | QA §4r |
| C10 | **An ink tuned against one ground is a colour plus an assumption.** Any ink that sits on a tint (`--accent-solid`, `--accent-wash`, `--ok-ink`, `--wait-ink`) needs a sibling for the other mode, and the correction usually REVERSES direction. | Three separate tokens have now needed this, each found only after dark mode existed: 3.86:1, 3.96:1, 2.3:1. | QA §1, §4s |
| C9 | **The page has two modes and they are ONE token swap** — eleven grounds and inks redefined under `prefers-color-scheme: dark`, plus a `[data-theme]` pin so it can be forced. No second stylesheet, no `dark:` variant per rule. What carries over is the RELATIONSHIPS, not the values: a card is one step off the page ground, the header one step off the card, the band stays the darkest surface. Product mocks do **not** invert — they draw the app, and a real screenshot does not flip with the page around it (P1). | A second copy of a design drifts from the first the week after it is written. | QA §1, §4s |

## Motion

| # | Rule | Why | Checked |
|---|---|---|---|
| N1 | **Transform, opacity and clip-path only** for anything scroll-linked, looping, or per-frame. Tokenised curves; never `ease`/`linear`. **One written exception:** the header's rest↔float change transitions `top`/`left`/`right`/`height`/`border-radius`. | The rule exists because layout properties cost a reflow *every frame*. This is a one-shot 420ms state change on a single fixed element that fires twice per visit, not a timeline — and the alternative (a transform-driven inset) cannot hold `--r-section` because scaling a box scales its corner. Exceptions are allowed; unexamined ones are not. | QA §4o |
| N2 | **The resting state is the finished state.** `.is-live` is added by JS only, so reduced motion, no-JS and pre-observer all show complete content. | Never build a loop that leaves the page empty if it fails. | QA §5 |
| N3 | **Looping text must not fade.** Reveal text-bearing elements with `clip-path` — painted or not painted, never half-legible. | Once per load is an artifact; every twelve seconds forever is a defect. | QA §1 |
| N4 | **One rAF and one cue list per timeline.** Never a stack of `setTimeout`s. Gate on an observer and on `visibilitychange`. | | §motion |
| N5 | **Lead with the hero**: the most important element gets the largest displacement and the only sprung curve. **One spatial origin** — mixed directions read as chaos. **Stagger so each beat settles before the next starts: for separate OBJECTS the delay is 25-35% of the duration.** Words in one sentence and lines in one headline are exempt — they overlap ~90% on purpose, because a sentence rising is one gesture, not a queue. | LottieFiles motion-design. Three tiles at 70ms against a 560ms fade arrived as one blur; the rule was there and unmeasured. | QA §7 |
| N6 | **Write the irregularity down.** Four tasks finishing 1-3-2-4 read as independent runs; 1-2-3-4 reads as a progress bar. | | — |
| N7 | **Anything present-but-not-showing must be `inert`**, not merely `aria-hidden` — a product mock is full of real buttons. | | QA §4k2 |
| N8 | **Auto-advancing anything pauses** off screen, in a background tab, on keyboard focus, and under reduced motion; a click parks it for good. It does **not** pause on hover. | The progress is what says the panel will change; freezing it under the pointer makes the section feel stuck. A keyboard user has no other way to hold it. | QA §4m |
| N10 | **A loop that returns to its start takes a symmetric curve** (`--e-inout`), and it is TWO keyframes with `alternate` — never three stops with an ease-out. A timing function applies between each pair of keyframes, so a multi-stop loop restarts its easing at every stop and reads as a series of darts. | The scroll hint ran 0/45/70/100 on `--e-elegant`: three ease-outs per cycle, plus a 30% dead hold and an opacity pulse on a fourth rhythm. | QA §7 |
| N11 | **A layout property is never a side effect of an animation.** Centring, offsets and sizing are static declarations; keyframes only ever carry the movement. | The scroll hint's `translateX(-50%)` lived inside its keyframes. Replacing the keyframes silently un-centred the pill, and the change under test — the motion — was correct, so nothing caught it. | QA §7 |
| N9 | **A looping reel clones, and only the middle set is real.** Clones are `aria-hidden`, roleless and out of the tab order; selection is marked on the centred slot, never by matching a data attribute. | Matching lights every copy and shows a second highlighted item at the mask edge — the seam the clones exist to hide. | QA §4m |

## Product mocks

| # | Rule | Why | Checked |
|---|---|---|---|
| P1 | **Read the component, not the design system.** Open the `.tsx` and copy its class list — and the values that matter most are the ones a screenshot cannot show you. | "It uses our tokens" is not "it is our component". The comparison cards shipped with invented status pills and progress bars that exist nowhere in the app; the real row is an avatar, a title, a fixed 14px indicator slot and a timestamp, and the product's own comment says the slot is fixed so the timestamp never shifts. | QA §4f |
| P2 | **A mock has two sizes**: it is laid out at the product's own size and *scaled* to the page's. | Laying out at the marketing column's width gives a cramped window with desktop-sized text, and every clip it then needs is a symptom. | QA §4f |
| P3 | **Nothing inside a mock may be clipped, faded or height-absorbed.** If it needs that, it is laid out at the wrong size. | | QA §4f |
| P4 | **Every glyph is a real Lucide icon** at the version the app ships; typeface and colours are platform tokens. | Hand-drawn paths are what made the mock read as "not our product". | QA §4f |
| P5 | **Sentence case only.** The product never uses Title Case or CSS uppercase. | | QA §4f |
| P6 | **A product visual on a marketing card is a CROP, not a drawing.** Lay the surface out at the product's own size and let it run off the edge of its band. | A drawing that fits inside its frame reads as an illustration of the product; a fragment that continues outside the crop reads as the product. And left-pack the rows: meta pushed to the far right is exactly what the crop eats. | QA §4w |
| P7 | **A comparison card carries BOTH marks.** Theirs and ours, with the word between them. | Showing only the competitor's logo describes them; it does not compare. | QA §4w |

## Brand marks

| # | Rule | Why | Checked |
|---|---|---|---|
| B1 | **Every connector SVG is cropped to its own ink.** A mark that renders small is a badly-cropped `viewBox`; fix the file, once. | | QA §4n |
| B2 | **Never correct a crop in CSS.** A per-brand `transform:scale()` patches one usage; the same asset then turns up somewhere else, still small, and earns a second number. Slack collected **six** — 1.25, 1.34, 1.35, 1.35, 1.62 and a box override, across three files — and was still half the size of its neighbours in the cards, where nobody had thought to add a seventh. Optical nudges ≤ 1.06 on an already-tight mark are fine. | | QA §4n |
| B3 | **Marks letterbox, never stretch** — `object-fit:contain` in a fixed box. Non-square marks (Gmail, Meta, Zapier) keep their own aspect. | | QA §4n |

## Content

| # | Rule | Why | Checked |
|---|---|---|---|
| K1 | **Copy is content.** Design work does not rewrite wording unless it is asked for, and then the diff is shown. | | QA §8 |
| K2 | **No eyebrow above a heading. At all.** Not numbered, not lettered, not a plain word — the heading carries its own weight. | This rule used to say "uppercase, text only, no numbers". taste-skill gives eyebrows a budget; `pbakaus/impeccable` bans them, and the ban is right: with one centred composition for every section, the eyebrow was the only thing distinguishing one section head from the next, which is why the page had grown seven of them. | QA §4j |
| K3 | **Real content or nothing.** Placeholders declare themselves. | | QA §4c |
| K4 | **A generated artefact is really generated** — authored as a plan, rendered by the template's own engine, and shipped as what it produced. | A hand-coded thing that resembles a website is not the product's output. | — |

## Process

| # | Rule | Why |
|---|---|---|
| R1 | **Edit the source, never `site/styles.css`.** Run `tools/build-css.py`, which stamps `?r=` on CSS/JS and `?v=<sha1>` on **every local asset**. | A hand-kept hash shipped stale CSS across four deploys; unversioned images then made two correct screenshot fixes invisible for two rounds. |
| R7 | **Verify a fix against the SHIPPED bytes, not your build.** `curl` the live URL, check its hash, crop the image and look at it. | A local check cannot detect a delivery bug — the file was right on disk and right on the server, and still wrong on screen. |
| R8 | **Cache-bust the page URL when verifying in a browser**, not just the asset hash. `?r=` changes on the stylesheet, but a cached HTML never asks for the new one — three rebuilds in a row measured identical wrong numbers against correct CSS. | | QA §4t |
| R2 | **Never slice a file between two anchors without asserting the distance.** Prefer `replace(old, new, 1)` with the full block and an assert. | A two-anchor slice once deleted 1084 lines, and the symptom surfaced far from the cause. |
| R3 | **`git diff --stat` before building**, and read the built file for the rule you just wrote — the pruner has silently eaten one before. | |
| R6 | **After replacing a block, grep for every identifier the old block defined.** A function dropped from a replacement still *called* from a `setTimeout` throws silently, and the visible symptom lands nowhere near the cause. | A missing lede sentence turned out to be a `writeLead` deleted two rounds earlier. |
| R4 | **Publish to the draft slug only.** Production is never edited directly. | |
| R5 | **A dated changelog entry per round**, recording what changed *and what was wrong*. No version numbers. | |
