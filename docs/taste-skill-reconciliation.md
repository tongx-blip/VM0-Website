# Reconciliation: `Leonxlnx/taste-skill` vs this page's rules

**Source:** `github.com/Leonxlnx/taste-skill` · 79,742★ · 5,460 forks · MIT ·
`skills/taste-skill/SKILL.md`, 1,206 lines, read in full on 2026-08-24.
The repo also ships `brutalist` / `minimalist` / `soft` / `redesign` /
`image-to-code` / `imagegen-frontend-web|mobile` / `brandkit` / `stitch`, and a
`research/laziness/` folder. Only the main skill is reconciled here.

**What it is.** Not a style guide. It is a **banned-patterns list** with a
mechanical pre-flight check — 14 sections, ~60 checkboxes. Its thesis: LLM design
is bad not because the model lacks taste but because it reaches for the same
defaults every time, so the fix is a list of the defaults it must not reach for.

**Why this document exists.** We have our own rules in `RULES.md`, argued one at
a time against this page. Where the two agree, that is corroboration. Where they
disagree, one of them is wrong, and it is worth knowing which. This file records
the verdict per rule. **No code was changed to produce it.**

Verdicts:

| | meaning |
|---|---|
| **PASS** | already compliant, usually because we argued our way to the same rule |
| **COUNTER** | we have a written, argued reason for doing the opposite |
| **FIX** | the skill is right and we are not doing it |
| **CALL** | needs Tong's decision — copy, brand, or a genuine taste fork |

---

## Summary

| verdict | count |
|---|---|
| PASS | 26 |
| COUNTER | 7 |
| FIX | 10 |
| CALL | 5 |

The headline result: **we are strong on colour, type, tokens and accessibility
discipline, and weak on the two things the skill cares most about** — the
mechanical eyebrow/section-rhythm rules, and the fact that the page has **no
dark mode at all**.

Three of the seven COUNTERs are the same argument: this page draws the product,
and the skill was written for pages that do not.

---

## Section 0-1 · Brief inference and dials

| Rule | Verdict | Notes |
|---|---|---|
| 0.B Declare a one-line "design read" before building | **PASS** | `system.css` §1 opens with one: *"Swiss grid discipline on a cool neutral ground, with ONE accent spent in three places only."* That is a design read in everything but name. |
| 0.D Anti-default discipline (no AI-purple, no glassmorphism-on-everything, no Inter+slate) | **PASS** | None of the five named defaults appear. |
| 1 Three dials (`DESIGN_VARIANCE` / `MOTION_INTENSITY` / `VISUAL_DENSITY`) | **FIX** | We have no such shorthand. Read off the built page, this site is roughly **VARIANCE 4 · MOTION 6 · DENSITY 3**. Worth recording, because the skill's preset for a mainstream SaaS landing is 7/6/4 — our variance is *deliberately* three points lower (see the composition rule below) and writing that down turns an unexamined habit into a stated position. |

## Section 2-3 · Foundation, stack, icons

| Rule | Verdict | Notes |
|---|---|---|
| 2.A Use an official design system package when the brief maps to one | **COUNTER** | The brief maps to "Tailwind + modern SaaS". We ship **zero JS libraries and hand-authored CSS** — a stated hard rule in `CLAUDE.md`. The skill's concern is agents reinventing Fluent or Carbon badly; it does not apply to a bespoke marketing page with its own token layer. |
| 3.C Icons from Phosphor / HugeIcons / Radix / Tabler; **Lucide discouraged** | **COUNTER** | RULES **P4** mandates *real Lucide icons at the version the app ships*, because the mock has to be the product. The skill's ranking is about greenfield taste; ours is about fidelity to an existing product. Ours wins here. |
| 3.C **Never hand-roll SVG icon paths** | **PASS** | ~~7 inline `<svg>`, hand-drawn~~ — **this was my error.** All seven were byte-for-byte Lucide `chevron-down` (`m6 9 6 6 6-6`, 24×24, stroke-width 2, round caps), verified against `lucide-icons/lucide` source. Inlining a real icon is not hand-rolling one. The theme toggle added since uses real Lucide `sun` and `moon` the same way. |
| 3.D Emoji discouraged | **PASS** | RULES **T6** bans them outright. Stricter than the skill. |
| 3.E Cap the layout width | **PASS** | 1320px, and RULES **M2** puts the cap *inside* the padding expression so it cannot be silently removed. |

## Section 4.1-4.2 · Type and colour

| Rule | Verdict | Notes |
|---|---|---|
| 4.1 Inter discouraged as default | **PASS** | RULES **T5**: Inter appears only inside the one component built to a supplied Figma. |
| 4.1 Serif discipline; `Fraunces` / `Instrument_Serif` banned | **PASS** | The only serif is Cormorant Garamond, and only inside `.tpl` — the *generated artefact* the product produced, which has its own design system by **K4**. Neither banned face is used. |
| 4.1 No oversized H1s; control hierarchy with weight and colour | **CALL** | `--t-d-hero` tops out at **108px**. That is at the loud end of the skill's range. It is also the page's one deliberate voice, and **T4** already holds every title to Archivo 500 rather than reaching for weight. Worth one look at 1920 before deciding. |
| 4.2 Max 1 accent, saturation < 80% | **PASS** | One accent in three ground-dependent weights (**C1**). |
| 4.2 THE LILA RULE (no AI-purple) | **PASS** | — |
| 4.2 One palette, no warm/cool drift | **PASS** | **C2**: cool neutrals, never warm. Written down before this skill was read. |
| 4.2 **COLOR CONSISTENCY LOCK** — one accent across the whole page | **CALL** | We spend **seven scene hues** (amber, red, pink, blue, teal, olive, violet) plus four ladder markers, on top of the accent. **C1** says these are identity, not decoration, and after this round they are real tokens rather than inline literals. But seven is a lot, and the skill's rule exists because exactly this drifts. See optimisation #11. |
| 4.2 Premium-consumer beige+brass palette ban | **PASS** | Not applicable, and **C2** forbids the family anyway. |

## Section 4.3-4.4 · Layout and materiality

| Rule | Verdict | Notes |
|---|---|---|
| 4.3 **ANTI-CENTER BIAS** — avoid centred heroes above VARIANCE 4 | **COUNTER** | `system.css` §1: *"ONE COMPOSITION RULE. Every section — the hero included — is a centred stack over a full-width figure. Nothing else. That single rule is what makes the page read as designed rather than assembled."* This is the deepest disagreement in the document and it is a real fork, not an oversight. The skill's own override clause covers it: centred is acceptable for manifesto briefs where the message *is* the design. |
| 4.4 Cards only when elevation means something | **PASS** | **S2/S3**: a surface is a fill; section cards carry no shadow. |
| 4.4 Tint shadows to the background hue, no pure-black drops | **PASS** | Every shadow is `rgb(var(--ink-rgb) / …)`, a cool near-black, never `#000`. |
| 4.4 **SHAPE CONSISTENCY LOCK** | **PASS** | The skill permits a mixed scale *when the rule is documented and followed*. **S1** documents it (10 / 12 / 16 / pill), **S5** derives the header's corner from it. |

## Section 4.5-4.6 · Interactive states

| Rule | Verdict | Notes |
|---|---|---|
| 4.5 Tactile `:active` feedback | **PASS** | `.btn--dark:active` translates and scales. |
| 4.5 **BUTTON CONTRAST CHECK** | **PASS** | White on `--accent-solid` is exactly 4.5:1 by construction — that is *why* `--accent-solid` exists. |
| 4.5 CTA label must not wrap at desktop | **PASS** | Verified at 390-2560 this round. |
| 4.5 **NO DUPLICATE CTA INTENT** | **FIX** | Nav says **"Sign up"**, hero says **"Get started for free"**. Same intent, two labels — a named pre-flight fail. |
| 4.5 Loading / empty / error states | **FIX** | Every product mock shows only the happy path. For a page whose whole argument is "this is really the product", the absence of a single waiting or denied state is a fidelity gap — though `.state--wait` / `.state--off` do exist in the permissions mock. |
| 4.6 Label above input, never placeholder-as-label | **PASS** | The one composer input is a mock with no real form. |

## Section 4.7 · Layout discipline (the skill's hard rules)

| Rule | Verdict | Notes |
|---|---|---|
| Hero fits the viewport, CTA visible without scroll | **PASS** | CTAs bottom out at **643px of 900**. |
| Hero subtext ≤ 20 words | **FIX** | Ours is **33 words**. |
| **Hero stack ≤ 4 text elements** | **FIX** | We have **five**: eyebrow chip, headline, rotating statement, 33-word lede, CTA row. The rotating statement is the fifth. |
| Hero top padding ≤ 6rem | **PASS** | `clamp(104px, 16vh, 140px)` — at the cap, not over it. |
| Navigation on one line, ≤ 80px | **PASS** | 62px at rest, 54px stuck. |
| **EYEBROW RESTRAINT** — max 1 per 3 sections | **FIX** | **7 eyebrows across 10 sections; the budget is 4.** The skill calls this its single most-violated rule and makes the check mechanical. Ours are: Outputs, Shared workflows, At once, Control, Positioning, Proof, For high-agency teams. |
| SPLIT-HEADER BAN | **PASS** | No section uses left-headline / right-floating-paragraph. |
| ZIGZAG ALTERNATION CAP | **PASS** | No image+text splits at all — every section is a centred stack. |
| **Section-Layout-Repetition Ban** — ≥4 layout families across 8 sections | **COUNTER** | Direct collision with the composition rule. We run **one** family by design. Same argument as 4.3; recorded here because it is the same disagreement wearing a different number. |
| Bento cell count / background diversity | **PASS** | No bento grid. |
| Mobile collapse declared per section | **PASS** | Explicit breakpoints throughout; verified at 390/640/768 this round. |

## Section 4.8 · Images

| Rule | Verdict | Notes |
|---|---|---|
| **Div-based fake screenshots are banned** ("the #1 LLM-design Tell") | **COUNTER** | Five mocks, ~125 elements: `.slackui` (47), `.tplwin` (42), `.absui` (18), `.perms` (14), `.flowui` (4). The skill bans *fake* UI made of styled divs. Ours are governed by **P1-P5**: open the `.tsx`, copy its class list, real Lucide at the shipped version, the product's own sizes, sentence case only. That is the opposite of the lazy pattern the ban targets — but a reviewer applying the skill literally will stop here first, so the reasoning has to stay written down. |
| Hero needs a real visual | **FIX** | The hero's visual is a **declared placeholder** (`Product image · Product screen · 2560×1600`), and there is a second one for the comparison graphic. Our **K3** ("real content or nothing; placeholders declare themselves") and the skill's own last-resort clause both permit this — but the skill is right that a landing page whose hero is a labelled grey box is *incomplete*, not minimal. |
| Logo wall uses real SVG marks, no category labels | **PASS** | Real connector SVGs, cropped to their own ink (**B1**), no labels underneath. |
| Hand-rolled decorative SVG discouraged | **CALL** | The brand illustration layer (clouds, hills, stickers, avatars) is hand-made and is the page's warmth layer. Deliberate, and named as such in `system.css` §1. |

## Section 4.9-4.11 · Content, quotes, theme

| Rule | Verdict | Notes |
|---|---|---|
| Sub-paragraph ≤ 25 words | **CALL** | Hero lede is 33. Copy is **K1** territory. |
| No data-dump sections; long lists need a different component | **PASS** | Longest list is the 4-step ladder. |
| Fake-precise numbers must be real or labelled | **PASS** | The artefacts carry `DEMO DATA - NOT LIVE`, and the KPI row carries *"Illustrative metrics for now. Replace with verified customer outcomes."* Exactly what the skill asks for. |
| COPY SELF-AUDIT | **CALL** | **K1** forbids design work from rewriting copy. Flagged, not actioned. |
| 4.10 Quotes ≤ 3 lines | **PASS** | Three quotes at 15/16/17 words, 3 lines each. |
| 4.10 No em-dash in quote text | **CALL** | See 9.G. |
| 4.11 **Page Theme Lock** | **PASS** | Light page; the closing CTA band and footer are the one deliberate dark switch, which the skill explicitly permits once per page. The header now crosses into it rather than sitting on top of it. |

## Section 5-6 · Motion, performance, accessibility

| Rule | Verdict | Notes |
|---|---|---|
| 5 **MOTION MUST BE MOTIVATED** | **PASS** | **N5/N6** and `motion.md` require a stated reason per beat. |
| 5.D **`window.addEventListener('scroll')` is banned** | **FIX** | `app.js:539` uses it for the whole page, and `app.js:388` for a pane. It *is* rAF-throttled, which answers the perf half of the objection — but the nav's stuck state, the nav's ground detection and the ladder's progress all have better primitives available (IntersectionObserver, `animation-timeline: view()`). |
| 5.D Custom scroll-progress maths from `window.scrollY` | **FIX** | `pinProgress()` does exactly this. |
| 6.A **Animate only `transform` and `opacity`** | **FIX** | RULES **N1** says the same thing — and the header I built this week transitions `top`, `left`, `right`, `height` and `border-radius`. Five layout properties, on a fixed element, for 420ms. It is a one-shot state change rather than a scroll-linked animation, so it is defensible, but **it breaks our own N1 and the skill's 6.A simultaneously** and that should be a written exception, not an oversight. |
| 6.B Reduced motion mandatory | **PASS** | **N2**: the resting state is the finished state; `.is-live` is JS-only. |
| 6.C **Dark mode mandatory for consumer-facing pages** | **FIX** | **Zero occurrences of `prefers-color-scheme` in the entire stylesheet.** The page is light-only. This is the single largest gap between us and the skill, and the token work done this round (channels, ground-aware swaps, `--nav-ground` / `--nav-ink` / `--nav-accent`) is most of the machinery needed to close it. |
| 6.D Core Web Vitals measured | **FIX** | Never run. The page carries 182 images and four stacked `backdrop-filter` layers fixed at the top. |
| 6.E Grain only on fixed, pointer-events-none layers | **PASS** | No grain layer. |
| 6.F Z-index restraint | **PASS** | Four values total (2, 3, 99, 100), each documented. |

## Section 9 · AI tells

| Rule | Verdict | Notes |
|---|---|---|
| 9.A No neon / outer glows | **PASS** | |
| 9.A **No pure `#000000`** | **PASS** | Zero as of this round — the last four `color:#000` became tokens. |
| 9.A No oversaturated accents, no gradient text | **PASS** | |
| 9.A No custom cursors | **PASS** | No `cursor:url` anywhere. |
| 9.B No oversized H1 | **CALL** | See 4.1. |
| 9.C **No 3-column equal feature cards** | **PASS** | The KPI row is three equal tiles, but it is a stat row, not a feature row — the skill's ban is aimed at "three identical cards describing three features". Connector cards come in pairs. |
| 9.D No Jane Doe / Acme / fake-perfect numbers | **PASS** | Maya, Noah, Dana, Sofia; Litoral; every metric declared illustrative. |
| 9.E No hand-rolled SVG icons | **PASS** | Duplicate of 3.C, and wrong for the same reason. |
| 9.E No div-based fake screenshots | **COUNTER** | See 4.8. |
| 9.F **No section-numbering eyebrows** | **PASS** | Zero. RULES **K2** banned `01 / OUTPUTS` independently, for the same stated reason. |
| 9.F **No scroll cues** | **CALL** | Seven: `Scroll it` ×6, `Scroll the page` ×1. The skill's target is a page-level "↓ scroll" under a hero, which is decoration. Ours labels a *scrollable inner region inside a mock browser window*, which is a genuinely non-obvious affordance. Defensible — but seven labels for one idea is more than the idea needs. |
| 9.F **Zero decorative status dots** | **CALL** | Two: the eyebrow chip's dot and the section-label dot. Neither conveys state. And this round they were *promoted* to the brand orange, which walks further into the tell. |
| 9.F Middle-dot rationed to 1 per line | **PASS** | Eight on the page, all in metadata strips at ≤1 per line. |
| 9.F No `border-t` + `border-b` on every row | **PASS** | **S4** bans structural lines outright. Stricter. |
| 9.F No version footers, locale strips, weather strips, pills-on-images, photo-credit captions | **PASS** | None present. |
| 9.G **EM-DASH: total ban** | **CALL** | **Six in visible copy.** The skill calls this the single most-violated tell and allows no exceptions. **K1** puts copy off-limits to design work, so this is Tong's call and nobody else's. |

---

## The three real forks

Everything above compresses to three genuine disagreements. They are not
oversights on either side.

**1. One layout family, or four.** The skill wants ≥4 layout families across 8
sections and no centred hero. We run one centred family everywhere, on purpose,
and say so in the first twenty lines of the stylesheet. The skill is optimising
against *sameness born of laziness*; our rule produces sameness born of a
decision. Both can be true, and only looking at the page settles it. Worth
noting: this rule is also what makes the eyebrow problem worse — with one
layout family, the eyebrow becomes the only thing distinguishing one section
head from the next, which is precisely why there are seven of them.

**2. Drawing the product in divs.** Banned outright by the skill as its #1 tell.
Governed by five of our own rules, all of which exist because the mock was wrong
before. Ours is the more specific rule and it wins — but only for as long as
P1-P5 are actually enforced. The moment a mock is drawn from a screenshot
instead of from the component, the skill is right and we are not.

**3. The em-dash.** No technical argument, only a taste one, and it is not mine
to settle.

---

## What this reconciliation changed about our rules

Nothing yet — no code was touched. But three of our own rules came out of it
looking weaker than they did going in:

- **N1** ("transform, opacity and clip-path only") is currently violated by the
  header I shipped this week. Either the rule gets a written exception for
  one-shot state changes, or the header gets rebuilt on transforms.
- **C1**'s "these are the only colours the page spends" is doing a lot of work
  for seven hues plus four markers. It is a defensible position, stated once,
  covering eleven values.
- **K2** bans numbered section labels but says nothing about *how many* labels a
  page may carry. The skill's mechanical budget is better than our qualitative
  rule, and costs nothing to adopt.

---
---

# Part 2 · Optimisation list

Read off the reconciliation above plus the page as it actually stands. Ranked
within each group by (impact × confidence) ÷ effort. **Nothing here is done.**

Items marked **[copy]** need Tong: `CLAUDE.md` puts wording off-limits to design
work. Items marked **[fork]** are taste decisions, not defects.

## A · Structural — the biggest gaps

**A1. Ship dark mode.** *Impact: highest on the list. Effort: one round.*
Zero `prefers-color-scheme` in the stylesheet. Every consumer-facing page the
skill would pass has both modes, and we have most of the machinery already: the
channel tokens added this round, and the header's proven ground-swap pattern
(five local tokens, no rule inside the component names a colour). Two things
already learned on the header carry straight over: the accent correction
**reverses direction** on a dark ground, and `--accent-solid` is safe on white
and nothing else. Do it as a token swap at `:root`, never as a second stylesheet.

**A2. Cull the eyebrows, 7 → 3.** *Impact: high. Effort: minutes.*
Ten sections, budget of four, seven in place. Drop **"At once"**, **"Positioning"**
and **"Proof"** — in all three the headline underneath already says the same
thing, so the label is pure rhythm. Keep Outputs, Shared workflows, Control.
This is the skill's most-violated rule and the cheapest fix on the page. It also
partly answers fork #1: with one layout family, the eyebrow is the only thing
separating one section head from the next, which is *why* there are seven.

**A3. Replace the hero placeholder with a real image.** *Impact: high. Effort: medium.*
The hero's visual is a declared grey box (`Product image · 2560×1600`). Every
other pixel on the page is finished. Both our **K3** and the skill's last-resort
clause permit a labelled placeholder, but the skill is right that it reads as
*incomplete*, not as restraint. Same for the second one (comparison graphic,
2400×686).

## B · Technical — named by the skill, and true

**B4. Delete the page's scroll listener.** *Impact: medium-high. Effort: medium.*
`app.js:539` is a hard ban in the skill (5.D) and has three consumers, each with
a better primitive:
- nav stuck state → a 1px sentinel + `IntersectionObserver`, zero per-frame work
- nav dark-ground detection → `IntersectionObserver` on `[data-ground="dark"]`
  with `rootMargin` set to the header's midline
- ladder progress → CSS `animation-timeline: view()`, JS only as fallback

Ours is rAF-throttled so the perf objection is already half-answered; the win is
that the page would do **no per-frame scroll work at all**.

**B5. Resolve the header's layout animation.** *Impact: medium. Effort: small either way.*
It transitions `top`, `left`, `right`, `height` and `border-radius` — five
layout properties on a fixed element. That breaks **N1** *and* the skill's 6.A
at once. It is a one-shot 420ms state change rather than a scroll-linked
animation, so it is defensible — but right now it is undefended. Either write
the exception into N1 with that reasoning, or rebuild it on transforms. Writing
it down is the honest minimum; leaving our own rule quietly broken is not.

**B6. Run Lighthouse.** *Impact: unknown, which is the point. Effort: minutes.*
Never measured. 182 images and — new this week — four stacked full-width
`backdrop-filter` layers pinned to the top of the viewport. That veil is the
most likely INP/FPS cost on the page and it has never been profiled.

**B7. Hand-rolled SVG chevrons → the icon set.** *Effort: minutes.*
Seven inline `<svg>` with hand-drawn paths, while **P4** already mandates real
icons at the shipped version. Cheap consistency win.

## C · Copy and brand — Tong's call

**C8. One label per intent. [copy]** Nav says "Sign up", hero says "Get started
for free". The skill calls two labels for one intent a pre-flight fail. Pick one
and use it in nav, hero and closing band.

**C9. Hero: 5 text elements → 4, and 33 words → ≤20. [copy]** The stack is
eyebrow + headline + rotating statement + 33-word lede + CTAs. My recommendation
is to drop the **eyebrow**, not the rotator — the rotating statement is the more
distinctive of the two, and A2 is already cutting eyebrows elsewhere.

**C10. The em-dash. [copy] [fork]** Six in visible copy. The skill bans it
outright and calls it the #1 tell; there is no technical argument either way.

**C11. Seven scene hues. [fork]** Amber, red, pink, blue, teal, olive, violet,
plus four ladder markers — eleven values beyond the accent. **C1** defends them
as identity rather than decoration and they are proper tokens now. Still worth
asking whether three would carry the same idea, or whether desaturating them a
step would let the accent stay the loudest colour on the page.

**C12. Scroll cues, 7 → 1. [fork]** Six "Scroll it" plus one "Scroll the page".
The affordance is real — a scrollable region inside a mock browser window is
genuinely not obvious — but it only has to be taught once. Keep it on the first
artefact the visitor meets and drop the other six.

**C13. Two decorative dots. [fork]** The eyebrow chip's dot and the section-label
dot convey no state, and this round they were *promoted* to the brand orange,
which walks further into the tell rather than out of it.

## D · Motion — quality, not quantity

**D14. Move the reveals to scroll-driven CSS.** *The best motion change available.*
`animation-timeline: view()` replaces the IntersectionObserver reveal outright:
it runs off the main thread, it removes code rather than adding it, and its
no-support fallback is "content is simply visible" — which is **exactly** what
**N2** already demands. This is the rare upgrade that improves the motion, the
performance and the rule compliance in one edit.

**D15. Give the tab reel a spring.** **N5** says the hero of a moment gets the
only sprung curve. Right now the rail slides on `--e-elegant` and the selected
pill merely changes fill — the selection is a side effect of the slide. Let the
incoming pill overshoot slightly on `--e-spring` while the rail keeps its
elegant slide, and the *selection* becomes the beat.

**D16. The `.mark` underline should draw, not appear.** It currently switches
colour on `.is-lit`. Drawing the stroke left to right over ~500ms is the same
rule-as-progress-bar language the ladder and the tabs already use — the
stylesheet twice argues "one idea, used twice, instead of two ways of saying the
same thing". This would be the third use of the same idea, not a fourth idea.

**D17. View Transitions on the tab switch.** The artefact window fades its page
image in. `document.startViewTransition` plus a `view-transition-name` on the
window would morph one artefact into the next. Native, no library, pure
progressive enhancement — and it makes the seven cases feel like one window
changing its mind rather than seven images cross-fading.

**D18. Let the veil arrive.** The header's blur exists at full strength at
`scrollY: 0`, where there is nothing behind it to blur. Fading the veil in over
the first ~200px would make it read as a *response to scroll*, which is the same
argument that produced the header's two states in the first place.

**D19. Audit the reveal stagger against N5.** The rule says each beat must settle
before the next starts. I have not measured whether the current stagger actually
does that — and an unmeasured motion rule is a rule we are guessing at.

## Suggested order

1. **A2** (eyebrows) and **B7** (icons) — an afternoon, immediate anti-slop return
2. **A3** (hero image) — the one thing that reads as unfinished
3. **D14** (scroll-driven reveals) + **B4** (kill the scroll listener) — one
   coherent piece of work; do them together, they touch the same code
4. **B6** (Lighthouse) — before and after step 3, so the change is measured
5. **A1** (dark mode) — its own round
6. **C8-C13** — whenever Tong rules
7. **D15-D18** — motion polish, once the structure is settled

---
---

# Part 3 · What was done, 2026-08-24

Every item in Part 2 was worked. Statuses are honest: three are **not done**
and say why.

| # | item | status |
|---|---|---|
| A1 | dark mode | **done** — token swap, `prefers-color-scheme` + a `data-theme` pin, nav toggle with `localStorage`. 0 axe violations in both modes. |
| A2 | eyebrows 7 → 4 | **done** — dropped *At once*, *Positioning*, *Proof*. Budget for 10 sections is 4. |
| A3 | hero image | **NOT DONE — blocked, deliberately.** See below. |
| B4 | kill the scroll listener | **done** — both nav states moved to `IntersectionObserver`; the one remaining listener is the ladder's, and it now detaches below the pin breakpoint. |
| B5 | header's layout animation | **done** — written as an exception in **N1** with its reasoning, and noted at the rule itself. |
| B6 | Lighthouse | **done** — perf **96 → 99**, FCP 0.9s → 0.5s, LCP 1.1s → 0.9s, CLS 0 both. |
| B7 | hand-rolled SVG | **withdrawn — my error.** They were real Lucide all along. |
| C8 | duplicate CTA intent | **done** — nav "Sign up" → "Get started". |
| C9 | hero stack 5 → 4, lede ≤ 20 words | **done** — 33 → 20, eyebrow dropped. |
| C10 | em-dash | **done** — 12 removed (6 in copy, 6 more hiding as `&mdash;` entities inside the mocks, which the first grep missed). |
| C11 | seven scene hues | **done, narrowly** — only one was a real problem. |
| C12 | scroll cues 7 → 1 | **done.** |
| C13 | decorative dots | **done** — both, plus a third in `base.css` that only surfaced in dark mode. |
| D14 | scroll-driven reveals | **partly** — the veil is now scroll-driven CSS; reveals stay on `IntersectionObserver`, which the skill already allows. |
| D15 | spring on the reel | **done** — `tabLand`, plays once on arrival and settles to 1. |
| D16 | the mark draws | **done** — and it turned out not to be new work. See below. |
| D17 | View Transitions on tab switch | **NOT DONE.** See below. |
| D18 | the veil arrives | **done** — `animation-timeline: scroll()`, no JS, no listener. |
| D19 | stagger audit | **done** — and it found one real violation of three candidates. |

## The three that need a word

**A3 · the hero image is blocked, and filling it would have been the worse
answer.** The only ways to produce one were to generate a fake product
screenshot or invent customer logos. Both are banned by the skill I was
implementing (4.8 fake product previews, 9.D invented brands) and by our own
**K3** and **K4**. The skill's own last-resort clause is explicit: leave the
labelled slot and *tell the user*. So: **this page needs three real assets** —
a product screen (2560×1600) in the hero, a comparison graphic (2400×686), and
customer logos (2400×686). Nothing else on the page is unfinished.

**D16 · the drawn mark was not a new feature, it was a regression.**
`system.css` §1 spends the accent in three places and names the first of them
"the drawn marks under the sentences that matter". `base.css` has drawn that
stroke all along, from 0% to 100% of the phrase's width. The design layer was
cancelling it with `background:none` and substituting a colour swap. Restoring
it cost one deleted declaration. It also produced the round's one genuine
design decision: at reading size the phrase keeps its ink and the accent
arrives underneath, one dimension per state; at display size the phrase becomes
the accent and carries no stroke, because underlining a 96px line that is
already the loudest thing on the page is a second emphasis on something that
does not need one.

**D17 · View Transitions, skipped on purpose.** The tab switch already
cross-fades through `.is-on` classes with a documented timing. Wrapping it in
`document.startViewTransition` means the two systems own the same frames, which
is the exact failure mode the skill warns about for GSAP and Motion. It is a
real improvement and it is a *rebuild* of the tab machinery, not a patch. Worth
its own round, with the reel's spring and the pane swap designed together.

## What the round changed about our own rules

- **N1** now carries a written exception for the header, with the reason.
- **N5** gained a measurable ratio: separate objects stagger at 25-35% of
  duration; words in a sentence are exempt. The audit found 70ms against a
  560ms fade, an 87% overlap that arrived as one blur. Now 120/420.
- **C1** extended: every accent *phrase* reads `--accent-wash`, which is
  ground-aware; only the two accent *fills* keep `--accent-solid`. Dark mode is
  what forced this — `--accent-solid` is 3.96:1 on a dark card.
- **tools/audit.js** now skips elements with no client rects. It was reporting
  the UA's default button border on a `display:none` control, four false hits
  that only appeared in dark mode.
