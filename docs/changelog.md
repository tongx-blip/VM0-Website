# Changelog

Newest first. Each entry records what changed **and what was wrong**, because the
failure modes are the useful part.

---

## v42 — no structural lines · 2026-08-17

Feedback: *"你在网站上加的这些线条太乱了，可以把线条都去掉…另外这些带数字的小标签就非常
像 AI generated。你可以有标签但不要放在左边，占这么大的空间。去掉数字保留文本就成。"*

- **Every page-level rule removed** — the hero's 12-column grid overlay, the
  full-page vertical spine, section top borders, rules above paragraphs,
  captions, footer blocks, card and screenshot outlines, outlined pills, ghost
  buttons and status chips, the parallel-figure connectors, and the emphasis
  underline itself. Verified mechanically: 0 visible page-level border edges.
- **Definition moved to grounds + space + shadow.** Sections alternate
  paper/wash strictly; surfaces are a fill plus a soft shadow; status is a tinted
  fill.
- **Emphasis became colour.** `<mark>` no longer draws a rule; the phrase warms
  from ink into the accent (`--accent` at display sizes, `--accent-ink` at text
  sizes).
- **Labels re-cut** — `01 / OUTPUTS` in a left rail → `OUTPUTS`, a small
  uppercase eyebrow directly above the heading. Numbers kept only on the
  four-step workflow ladder, where the order carries meaning.
- **Layout re-derived** — reading column 1–8, the section's opening paragraph in
  9–12 bottom-aligned to the heading (this is what fills the right half now that
  no rail does), figures and card grids span 1–12.
- **Parallel figure** — connectors dropped, four chats grouped in a tray. Its
  own captions already narrate the flow.
- Bugs found and fixed in the same pass:
  - `#outputs .scenes__tab{background:paper}` out-specified
    `.scenes__tab.is-on` → the active tab rendered white-on-white. Scope ground
    flips with `:not(.is-on)`.
  - The paired lede's selector out-specified `.panel > *`, so on mobile it stayed
    trapped in a ~110px column. Reset added at 1080px.
  - Base-layer `border-top`s survived the rewrite; a single reset block now lists
    every page-level element.
  - Sections 2 and 3 were both paper for one build → nothing separated them.
    Alternation re-derived and added to the QA gate.
  - `--ink-mute #6A7278` on `--wash-2` was 4.19:1 → darkened to `#636A70`, which
    clears AA on paper, wash and wash-2.

Result: 0 axe violations, 0 page-level borders, page 8.1k tall at 1440.

## v41 — the rebuild · 2026-08-17

Feedback: floating header like Motion's, research better design/motion skills,
critique the page, then fix it wholesale. No copy changes.

**What was wrong.** `styles.css` was 2,733 lines of *five stacked theme layers*:
"Swiss technical editorial + one orange accent" → a seven-swatch `PALETTE` →
"colour lives in backgrounds" → `WIREFRAME` → `WIREFRAME v2` → `v40`. The last
layers won, so the shipped page was:

- `--accent: #5C5C5C` — the accent was grey; `.mark{background-image:none}`
  disabled every emphasis in the copy;
- `img{filter:grayscale(1)}` plus a greyscale Slack panel — the 1,000+ real
  connector marks and every product screenshot were drained of colour;
- one typeface doing display, body and captions, across **25 distinct font
  sizes**;
- 29 serious axe contrast violations;
- `display--center{text-align:left}` — class names contradicting the layout;
- each section boxed in a 28px-radius hairline that hard-cut the marquee rails;
- scene cards floating *over* the product screenshot, hiding its sidebar and
  truncating a sentence mid-word;
- a single uniform `.reveal` fade as the only motion, plus a dead
  `[data-parallax]` handler and four separate scroll listeners.

**What replaced it**

- Two-layer stylesheet with a build step (`base.css` + `system.css`), the four
  historical theme layers excised, dead rules pruned (112KB → 94KB).
- Cool-neutral palette + one accent (VM0 orange `#ED4E01`); imagery back in
  colour.
- Three type roles (Archivo / Instrument Sans / IBM Plex Mono) on one scale.
- 12-column grid; floating header (logo left, nav centred, actions right) that
  rests below the announce strip and rises on scroll.
- Product stage rebuilt as three columns so nothing covers the screenshot.
- Motion layer on the microinteractions standard: tokenised easings and timing
  bands, five named entrances, one hero load sequence, one observer + one rAF
  loop.
- Dark closing chapter (CTA + footer).

Result: 29+2 axe violations → 0; CLS 0; page 10.6k → 9.2k at 1440.

## v40 and earlier — inherited

The page as it existed on the production slug when this repo started
(`okou-ai-teammate-swiss` v46). Kept only as the origin of the `base.css`
component CSS: the Okou app window, the Slack transcript, the permissions table
and the workflow stages are all from that lineage and are still in use.

**Lesson carried forward:** never re-theme by appending a layer. A new visual
direction replaces the design layer; it does not stack on top of the last one.
