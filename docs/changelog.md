# Changelog

Newest first, dated. No version numbers: this page gets revised continuously and
a counter would only ever grow. Each entry records what changed **and what was
wrong**, because the failure modes are the useful part.

---

## 2026-08-20 · the grounds are shown, and the rule is the mask

**The blur is gone.** The paintings render as painted — only the per-ground
`saturate()` and the computed veil remain. The veil is what keeps a ground from
competing with a screen full of 13px text; the blur was doing that job twice.

**The rule is what masks the paragraph, in both directions.** It already looked
close, but the geometry was wrong: the air between two rows lived in the list's
`gap`, and the rule was the *next* row's `border-top`. So the paragraph was being
cut 29px above the line, and the text appeared out of empty space rather than
from behind it.

Now every bit of air belongs to a row:

```
.ladder__steps      gap: 0
.step               padding: --wf-rule-gap 0            ← its own air
.step:not(:last)    border-bottom                       ← its OWN bottom edge
.step.is-active     padding-bottom: 0                   ← handed to the paragraph
.is-active … > p    padding-bottom: --wf-rule-gap
```

Opening a row hands its bottom air to the paragraph, so the rule ends up flush
against the growing box — measured 1px — and the text slides out from under the
line. Closing reverses it. Caught mid-transition, "Save" is being swallowed by
the rule below it while "Hand over" is emerging from behind its own; that frame
is the whole specification.

The `clip-path` I had added is gone. The row's own `overflow` does the masking,
and a clip would only cut the text somewhere the line is not.

**The 0fr trap, a second time.** A closed row was showing the first line of a
paragraph it was supposed to have swallowed, because the paragraph carried
`padding-bottom` unconditionally and **a `0fr` track cannot absorb padding** — it
floors the row at the padding box. Both paddings belong to the open state now.
This is the same failure that made closed rows taller at the bottom than the top
a few rounds ago; it is in the QA gate as §4k and it still caught me out, so the
note there now names padding on *either* edge.

---

## 2026-08-20 · one title size, a stroke-led reveal, and a deck of painted grounds

**The list.** Every title is one size now — the open row is told apart by weight
and ink alone (400/`#000` against 300/`rgba(0,0,0,.6)`), which is how the
supplied Lovable reference does it and which stops the list jumping as you scroll
past it. The air on each side of a rule is its own token, `--wf-rule-gap`
(20→29px), separate from the 12→16px inside a row; they had been sharing one
value, which is why the rules sat too close to the text.

**The reveal is led by the stroke.** The row grows, which pushes the rule under
it downwards, and the paragraph is uncovered from the top by a `clip-path` at
exactly the same duration and curve — so the text reads as being drawn down *by*
the rule rather than fading in behind it. Both halves share `--t-state` and
`--e-elegant`; if they ever diverge the gesture comes apart.

**One section padding, derived.** `--pad-section` 24→72px becomes 20→48px, and
the block padding is `× 1.35` of it rather than its own clamp — a card whose top
gap has no relationship to its side gap reads as two decisions. At 1440 that is
58 / 43, down from 78 / 63.

**The right column is a deck.** Four panels stacked inside the frame and scrolled
by one transform, so changing step *slides* rather than cuts — the same gesture
the pin itself is making. Each screen sits on one of the four painted brand
grounds, matched by hue to the marker beside its step.

**The grounds are computed, not placed.** At full strength a painting fights a
screen full of 13px text and tints its white. Each ground is blurred 26px and
scaled past its own edges, so it becomes a *field* of colour rather than a
pattern, and then veiled by an amount derived from its own mean luminance:

| | mean L | veil | |
|---|---|---|---|
| green | 95 | .04 | `1 − 100 ÷ L` |
| blue | 141 | .29 | |
| red | 159 | .37 | |
| pink | 204 | .51 | |

One flat veil had left the pale pink washing out the screen and the deep green
nearly black. 436KB for all four at 1280px wide.

**Three things I broke and fixed in the same round:**

- **I deleted 1084 lines of `system.css`.** A slice from `.ladder__frame{` to
  `/* ── the layout ──` — anchors I assumed were adjacent and which were 1000
  lines apart. It took the nav's roll-hover, the whole product mock and §14–§24
  with it; the symptom was the header rendering every label twice. Reverted and
  re-applied as targeted replacements. **Never slice a file between two anchors
  without asserting the distance between them.**
- **The 1320px measure cap was gone.** Setting `.panel--card`'s
  `padding-inline` to `--pad-section` alone silently dropped
  `max(…, --edge − --card-gap)`, and a card at 1920 ran 1772px wide. The floor
  and the cap are both in the rule now.
- **`aria-hidden` on a panel full of buttons.** With all four panels in the DOM
  and visible, hiding three from a reader without also taking them out of the
  tab order left keyboard focus walking into a panel nobody can see. They are
  `inert` now.

---

## 2026-08-19 · the parallel figure stops describing a run and performs one

The section's claim is *you ask once → four chats open → each reports back as it
finishes*. It was a still diagram of that claim. It is now the claim happening,
on a loop, with **no words added or changed** — the timing carries the argument
that the copy was having to assert.

The run, ~12s:

| | |
|---|---|
| 0.1s | "You ask once" |
| 0.4s | the bubble appears empty, with a caret |
| 0.6s | the sentence types, 34ms a character, and the bubble grows with it |
| +0.3 | Okou takes it — the pill lands on `--e-spring`, the one bit of weight in the sequence |
| +0.7 | the tray, then four cards unroll 140ms apart |
| +1.9 | each task reports its own status — **card 3 first**, then 1, 2, 4 |
| +3.4 | "Each chat reports back as its task finishes" |
| hold | three dots keep pulsing; the finished one sits still |

**The out-of-order finish is the point.** Cards open 1-2-3-4 and report 1-3-2-4.
An even stagger would have read as a progress bar in four pieces; four clocks
that disagree is what "in its own chat" actually means, so it is written into
the cue list rather than falling out of a loop index.

One rAF timeline, gated on an IntersectionObserver and `visibilitychange`, so it
costs nothing off screen or in a background tab. The resting state — reduced
motion, no JS, the page before the observer fires — is the finished frame with
every element visible, which is also what the section looked like before today.

**Two things fade nothing.** Auditing mid-animation flagged
`.a2a__st` and then `.a2a__t`, and both were real: text at `opacity: .4` is text
below its contrast ratio, and because this figure *loops*, it re-entered that
state every twelve seconds rather than once per page load. So the status line
**wipes** (`clip-path`) instead of fading, and the cards **unroll** instead of
fading. Either painted or not painted, never half-legible — and a card unrolling
is a better picture of a chat opening than a card fading in. Sampled the audit 22
times across the loop afterwards: clean.

That leaves one transient elsewhere — the hero's rotating statement crossfades
its text every 6.5s and will flag if the audit lands inside those 620ms. Same
class of issue, same fix available; left alone this round because the hero's
motion is settled.

---

## 2026-08-19 · the product mock, measured off the components

The mock had been built from a screenshot and a memory of the tokens, which is
why it kept reading as "close but not ours". Every value below is now read out
of `vm0-ai/vm0` — the component that draws it, not the picture of it.

| | had been | actually is |
|---|---|---|
| sidebar width | 238px | **255px** (`zero-directed-shared.tsx`, `w-[255px]`) |
| nav / thread row | 13px, min-h 32, pad 5/8, gap 10 | **`h-8 gap-2 rounded-lg p-2 text-sm leading-5`** — 14px |
| section label | 12px, muted-foreground | **13px, weight 500, lh 16, `sidebar-foreground/50`** |
| **selected row** | `#E7EBF0` | **`#DEE4EB`** — `#E7EBF0` is `--state-hover`; selected is `--state-selected`, one step further down the ladder |
| org switcher | 13px/600, gap 8, pad 6/8 | **`text-sm font-semibold`, `gap-2.5 px-2 py-2`**, chevron 16 |
| user bubble | radius 8, muted/40 | **`rounded-xl` (14px), gray-100 `#E7EBF0`, `text-[0.9375rem] leading-[1.7]`** |
| artifact card | radius 8, 1px border | **`.zero-card`: radius 20px, 0.7px gray-400, `--zero-card-shadow`** |
| composer | radius 14, 1px border | **`.zero-composer`: radius 24px, 0.7px gray-400, same shadow** |
| send button | 30px square, no glyph | **`Button size="icon-sm"`: 32px, radius 8, primary-700, `ArrowUp` 18** |
| tool icons | bare 18px glyphs | **`variant="quiet" size="icon-sm"`: 32px targets, 16px glyphs, muted** |
| model picker | grey fill, 12.5px | **`variant="outline" size="sm"`: h-8 px-3, 0.7px gray-400, 14px/500** |
| Slack mark in the footer | plain 16px | **`h-3.5 w-3.5 scale-[2.2]`** — the mark ships with heavy internal padding |

The one that mattered most is the **state ladder**. The platform's hover and
selected states are not flat greys, they are one translucent layer
(`--state-layer 215 100% 19%`) at 5% and 8.5%. Composited onto the sidebar those
land on `#E7EBF0` and `#DEE4EB` — and the mock had been using the *hover* colour
to mark the *selected* row, so every selected row in the picture was one step too
light. That is not a value you can eyeball; it has to be computed from the ladder.

**The window is shorter and the thread behaves like a thread.** `--app-h` comes
down from 620 to 540 at 1440. The sidebar's pinned-and-threads block and the
thread itself are what absorb that (`flex-1 min-h-0 overflow-hidden`, exactly as
`ExpandedSidebarSections` does), so the footer stays pinned instead of being
pushed out of the window — which is what had happened to Get Pro, the Slack row
and the account row. The thread runs past the bottom of the window and fades
there, so the ask, the run row and the artifact it produced stay in view.

**The right-hand column is one column now, not three floating pieces.** The stage
was three absolutely-positioned elements at hand-picked offsets. It is a
two-column grid: the two connector cards share the published page's width with a
single gap between them, and that same gap is the distance down to the page. So
everything on the right lines up on the same two edges, and the column is one
`--conn-gap` taller than the product on each side. Measured at 1440: connectors
`972..1351`, page `972..1351`, gap between cards 18, gap down to the page 18.

Below 1080 the same block stacks under the product; below 720 the sidebar is
hidden, which is what the app does at that width too.

---

## 2026-08-19 · one section geometry: width, radius, padding, no shadow

Nine notes in one round. The half that mattered was structural — the page had no
single rule for how wide a section is, how far its content sits from its edge, or
what its corner is, so every one of those had drifted apart.

**One geometry, stated in tokens, applied everywhere.**

```
--card-gap    12 → 26px   the grey that shows around a section card
--pad-section 24 → 72px   that card's edge → its content
--edge        max(card-gap + pad-section, (100vw − 1320) / 2)
--r-section   16px        every section's corner
--nav-pad     12px        header edge → the controls inside it
--r-nav       calc(--r-btn + --nav-pad)
```

- **The header is now exactly as wide as a section** — `left/right:
  var(--card-gap)` instead of a `min(100vw − 24px, 1320px)` that agreed with the
  cards at no width at all. Verified equal at 390 / 768 / 1024 / 1280 / 1920.
- **Its corner is derived, not chosen.** A rounded box holding rounded controls
  needs `control radius + the gap between them`, or the two curves fight and the
  button looks pinched in one corner and loose in the next. 10 + 12 = 22px, and
  the padding is symmetric now (it was 20 left, 10 right).
- **Controls are rounded rectangles**, `--r-btn` 10px, not lozenges.
- **Section content sits much further from the edge** — 60px → 89px at 1440 —
  and the same token drives every section, so it can never drift again.
- **No section carries a shadow.** A white card on a grey page is already a
  separate object; the shadow only softened the edge it was meant to define.

**The pinned block is centred, not offset.** Equal space above and below in the
viewport needs the offset *derived*: a fixed top margin only balances at one
window height. `--wf-top` is now
`nav-bottom + (100vh − nav-bottom − --wf-h) / 2`. Measured 98 / 98 at 1440×900,
where it had been 102 / 94 — and the 8px was the header, which is `--nav-h-stuck`
(54px), not `--nav-h` (62px), at the moment a pinned section is on screen. That
distinction is now a token.

**A closed ladder row was taller at the bottom than at the top.** 19px above the
title, 29px below. The cause: `grid-template-rows: 0fr` cannot absorb *padding* —
the track is floored at the collapsed item's padding box, so the open row's 11px
gap was silently present on every closed row too. The gap now only exists while
the row is open. Also: the marker was `clamp(19px, 1.8vw, 26px)` and had grown
taller than the title's line box, so it — not the title — was setting the row
height and pushing the text off centre. It is `--wf-title × --wf-title-lh` now,
which is what the reference always had. Rows measure 17 / 16.

**The open row was too big**: title 44 → 36px, paragraph 22 → 18px, foot 16 →
14px. The reference's 2× title ratio is preserved.

**The first logo rail never closed its loop.** `app.js` duplicated the track once
so the `-50%` keyframe would be seamless — but one copy was narrower than the
rail, so the row ran out of logos before it wrapped and a gap crossed the screen.
It now repeats the content until one copy covers the rail, *then* duplicates.

**Copy (requested).** The two rotating statements were three lines and two, so
the block reserved three and padded itself unevenly. Both are two lines now:

> 1,000+ connectors for the tools **your team** already uses, plus our own APIs
> and model picker.
> Far more arrives built in than **with** Codex or Claude Code — and Okou reaches
> **it all** the same way.

The second lost "less to wire up, less to install", which was the weakest clause
and the only one not carrying new information. The reach card measures 78 / 78.

---

## 2026-08-19 · the ladder sized to the viewport, and a build that ate a comment

Measured against the Apollo page supplied as a reference (that screenshot is a
1260 × 857 viewport at DPR 2): its media is **558 × 554 — square, 65% of the
viewport height** — its columns are near 50/50, its section headline is ~40px,
and its screenshot sits inset in a mat that contrasts hard with the card. Ours
was doing the opposite: a 649px picture on a 1320px card, a `#D9D9D9` mat
completely hidden behind a white app window, content jammed under the header and
a large dead band at the bottom of the viewport.

**One scale factor, not a re-design.** Every `--wf-*` value is still Figma node
`662:1561`, now multiplied by the ratio of this block's width to the reference's
own 983px — 1.34× at 1440. That is what the clamp maxima are: 16 → 22px body,
32 → 44px open title, 12 → 16px foot, 48 → 64px gutter, 4 → 5.5px marker. Every
proportion the reference was drawn with survives (the 2× title jump, the
40-character measure, the 649 : 498 media); only the absolute size changes. The
`--wf-w: 983px` cap is gone, so the block fills the card: media **872 × 668**,
which is 74% of the viewport height.

- **Safe space.** The pin now starts at `--nav-h + 60px`, not `+ 26px`.
- **Vertical fill.** The media height is capped at `100vh - --nav-h - 168px`
  instead of `- 96px`, and because it is now much taller the dead band under it
  is ~110px rather than ~300px.
- **The mat is visible.** `var(--mat)` (`#171B1F`) with the screen inset by
  `clamp(20px, 3.4vw, 52px)`. The reference fills its box with the picture so its
  ground never shows; ours is a white window on a white card, which is exactly
  why it disappeared.

**The fit is measured now, not written down.** Hard-coded `--dh` values were only
ever right at one viewport, and the mat is fluid. `app.js` lays each stage out at
one design width (760px), reads its natural height behind
`visibility:hidden`, and sets `--fit = min(boxW/760, boxH/h)`. Re-run on resize
and on `fonts.ready`. All four screens now sit inside the mat with room to spare —
including the Slack thread, which had been losing its last message to a crop.

**`tools/build-css.py` was silently rewriting comments into live CSS.**
`split_rules` hands back everything between `}` and the next `{`, which includes
the comment above a rule. The pruner then split that "selector" on commas and
matched `\.([a-z…])` against each part — so a comment containing **`app.js`**
read as the class `.js`, was found to be unused, and was **dropped**, leaving its
own tail (`its own height, nothing scaled, nothing visible */`) sitting in the
output as live CSS. The browser swallowed that and the entire rule beneath it,
which is why `.wfstage.is-measuring` never applied and only the visible stage got
measured. Fixed by separating the leading comments from the selector before
splitting, and the build now **aborts** if `/*` and `*/` counts disagree in the
output. This is the second time this file has shipped a silent corruption — the
first was the stale `?r=` hash.

---

## 2026-08-19 · shared workflows, built to the Figma; lighter titles everywhere

Three instructions in one round: drop the floating composer, put the whole
section in a card like the logo wall, and **implement the ladder to the Figma's
own tokens** ("完全按照figma的tokens实现") rather than translating it into this
page's scale, which is what the first attempt did and why it read wrong.

**Read out of `qOjbTX2K2K2YTobWMb6a1F`, node `662:1561`, and used verbatim:**

| | |
|---|---|
| frame | 286 + 48 gutter + 649, 498 tall inside its own padding |
| row | horizontal, 12px gutter, cross-axis **centred** |
| marker | 4 × 19px, `r=100` — `#F8A100` `#E24E4A` `#E4ABC8` `#3758A2` |
| rule between rows | **0.5px `rgba(0,0,0,.12)`**, 12px each side, never first or last |
| resting title | Inter **300**, 16px / 19.36 lh, `rgba(0,0,0,.6)` |
| open title | Inter **400**, 32px / 38.73 lh, `#000` — exactly 2× |
| open paragraph | Inter 300, 16px / 19.36 lh, 8px under its title |
| closing paragraphs | Inter 300, 12px / 14.52 lh, gap 12, `SPACE_BETWEEN` to the foot |
| media | `r=16`, ground `#D9D9D9` |

Two deliberate departures, both stated rather than silent:

- **Inter is now loaded** (300;400). The reference specifies it and Instrument
  Sans ships no 300 here, so a "w300" would have silently synthesised to 400.
  This is the section's own face; the rest of the page is unchanged.
- **The block is reproduced at the reference's own 983 × 498, centred**, instead
  of stretched to the card. Literal token values only stay in proportion at the
  size they were drawn — stretched to 1320 the same 16px paragraph and 32px
  title looked lost, and the mocks were pulled 36% wider than they were drawn.

**The rules and the marker bars break `docs/design-principles.md` §1.** They were
asked for explicitly, so the rule now records the exception rather than being
quietly violated, and `tools/audit.js` §1 exempts `.step` by name.

**Fit, don't crop.** Our screens are drawn taller than the reference box — the
two-pane workspace needs 572px and the Slack window 640px against the box's 498.
Each stage now lays out at the height it needs and is scaled to the box, the way
a photograph is fitted to a frame. Cropping would have taken the action row off
the bottom of the save card, which is the entire point of that screen. The
`wfIn` entrance had to move from `transform` to the independent `translate`
property so it composes with that scale instead of replacing it.

**Also fixed while in here:**

- **`.panel--card` would have killed the pin.** `overflow:hidden` makes an
  element a scroll container, and `position:sticky` inside one has nothing to
  stick to. `overflow:clip` clips without that side effect.
- **The floating composer is gone** — markup, both CSS layers, the placeholder
  rotator, the footer observer and the scroll-to-CTA handler.
- **`.vs h3` was rendering in the prose face.** `base.css` sets
  `font-family:inherit` on it, which resolves to the body face; a section
  heading in the wrong face is the one type role that must not drift.

**Titles are lighter across the whole site** ("整个网站的title 字体都太粗了改细").
Every site-level heading is now Archivo **500**: the display, the second-order
sentence, the hero's rotating statement, the figures and their units, the card
headings and the pull-quote. Nothing on the page is 700 any more. 600 survives
only on the wordmark and inside product mocks, where it is the app's own weight
rather than this page's voice — recorded at the top of `system.css` §3 so it does
not drift back one selector at a time.

---

## 2026-08-19 · shared workflows: one step at a time, in a frame

Feedback: borrow the layout of the reference (a tab strip, then a big title with
its paragraph on the left and a screen matted in a coloured frame on the right);
show **one tab at a time, driven by scrolling**; move the two closing paragraphs
into the left column; when a step opens, its title grows and its paragraph
appears; and **the picture must always keep one height** — mat it in a frame with
a background colour if the shapes differ. Structure from the reference, not its
colours or type sizes.

What the section is now:

- **A pinned section, and scroll position IS the step.** `.ladder` is a track
  `--wf-h + 3 × 64vh` tall; `.ladder__view` sticks inside it. `app.js` divides
  the travel into four equal shares — no IntersectionObserver, no per-step
  scroll listener, the same one rAF-throttled reader the header already used.
  Clicking a step *scrolls the pin* to where that step lives, so the page can
  never disagree with itself.
- **Only the open step has a paragraph.** Titles rest at `--t-step-off`
  (18–22px) and grow to `--t-step` (26–42px) when open; the paragraph unfolds
  with `grid-template-rows: 0fr → 1fr`. Two new named steps in §1 — the size
  change *is* the state, so nothing else marks it.
- **The mat.** Four mocks of four different shapes (a chat window, a two-pane
  workspace, Slack, a workflow list) made the section jump every time the step
  changed. They now sit inset in one frame at one fixed height on a new
  `--mat #171B1F` ground. Each mock fills the frame instead of declaring its own
  height, and where a screen holds more than the frame does the clipped edge
  **fades** — a list off the bottom, a thread off the top, since a thread is
  anchored to its newest message (`justify-content:flex-end`). A hard crop
  mid-sentence reads as a bug.
- **The two closing paragraphs moved into the left column**, at its foot, beside
  the figure they describe.

Four things that were wrong:

- **`.figcap` and `.note` were never in the section at all.** `.ladder` and
  `.ladder__stage` were both left unclosed, so the browser closed them at
  `</section>` — the two paragraphs had been living *inside the right-hand
  sticky column* this whole time, which is why their position looked awkward.
  Balance the tags of any block you move: `<section class="flowchat">` inside a
  product mock also means "find the last `</section>`", not the first.
- **`base.css` still owned the ladder's layout** — two-column grid, `opacity:.42`
  on a resting step, a 3px accent `border-left`, 19px titles. Page layout is not
  a mock internal; it is deleted, and the design layer owns it outright. This is
  the fifth-theme-layer failure in miniature.
- **A grid item can only stick inside its own cell.** The narrow layout puts the
  frame on top and sticks it over the list, which needs the grid off
  (`display:block`) and the frame *first in the source* — so the stage now comes
  before the column in the markup and both are placed explicitly by `grid-area`
  on the wide layout.
- **Slack's channel column came back at 390px.** `base.css` drops it at 860px and
  then a later unconditional rule re-declares `grid-template-columns:230px …`,
  which won. Inside the mat that left the thread about a hundred pixels wide.
  Re-dropped from the design layer, which has the last word.

`tools/audit.js` §1 and §2 had never been told about `.appui`, `.tplwin` and
`.tpl` — the mocks built the round before — so §1 was reporting the product's own
borders as page furniture. Added to both exemption lists.

Narrow layouts do not scroll-drive: the frame is stuck over the list and all four
paragraphs are open, so there is no travel left to read a step from. The frame
follows taps there, and nothing is hidden if nobody taps.

---

## 2026-08-19 · the product mock, rebuilt from the product's own source

Feedback: still not faithful — did you check it against our design system, are
you using our components? Don't invent. Every icon in the sidebar is made up.

I had been drawing the app from a screenshot: hand-written SVG paths, this
site's typeface and this site's greys. That is why it kept reading as
"not our product". Fixed by going to the source, `vm0-ai/vm0`:

- **Icons are the app's own imports**, pulled from `lucide-static` at the version
  `turbo/apps/platform/package.json` pins: `Users` Agents · `Route` Workflows ·
  `Plug` Connectors · `Package` Artifacts (read out of `MANAGE_NAV` in
  `zero-sidebar.tsx`), `PanelLeftClose`, the Slack mark on the footer row,
  `Hourglass`+`ChevronRight` on the run row, and
  `Paperclip`/`Image`/`SlidersHorizontal`/`Globe`/`Mic`/`ArrowUp` in the
  composer. **Every one of my four Manage icons had been wrong.**
- **Typeface is Noto Sans**, not the marketing site's Instrument Sans.
- **Colours are the platform tokens**: card `#FFFFFF`, sidebar gray-50
  `#F3F5F8`, foreground gray-950 `#14171D`, muted gray-800 `#525B68`, border
  gray-200 `#DCE1E8`, active row gray-100 `#E7EBF0`, primary-700 `#ED4E01`.
- **Radii are `--radius` 8px / `--radius-xl` 14px**, not my invented values.
- The run row now matches the app's markup exactly — hourglass, 13px label,
  chevron, muted, `rounded-lg px-2 py-1.5 min-h-9` — instead of the sigma-ish
  glyph I had drawn.
- The template's sea-green failed AA at 9px (3.59:1); it now has a legible
  sibling `--sea-ink #456B5E` for small text.

Recorded as `docs/design-system.md` §13 with the exact commands to re-read the
source, and added to the gate: 0 non-Lucide SVGs inside `.appui`, font must
compute to Noto Sans.

0 axe violations (43 passes), 0 page-level borders, one content column
(left 338 / right 945), sweep clean, no horizontal scroll 390–1920.

## 2026-08-19 · the product mock, aligned and faithful (/ui-design)

Feedback: the reference screenshot is squarely aligned and mine is all over the
place, and the product is not faithfully reproduced. Ran `/ui-design`.

**What was wrong.** The mock had *four different left edges* — chat title at
20px, avatar at 20px, reply text at 51px, composer at 16px — so nothing lined
up. And I had approximated the app from memory rather than reading the
reference, which the skill explicitly forbids: no collapse control, no top-right
actions, no jump-to-latest, no mic, three tool icons instead of four, and
`WORKED FOR 3M` set in **uppercase** when the product writes sentence case.

**What it is now.** One content column: the chat title, the prompt bubble's
right edge, the artifact, the paragraph, the action row and the composer all
share `--gl` (338px) and `--gr` (945px) at 1440. Only the agent avatar hangs
into the left gutter, exactly as the app does it. In the sidebar, group labels,
row icons and icon-less rows share one edge (76px) and labelled rows share
another (100px) — which is the app's own two-edge pattern, measured off the
reference rather than guessed.

Restored from the reference: the sidebar collapse control, the two top-right
actions, the jump-to-latest button above the composer, the fourth tool icon and
the mic, the model chip's chevron, the artifact card's hairline and link-blue
title. `--overlap` reserves the width the page window covers, so the column
still ends clear of it.

Sentence case throughout the mock — **0 uppercase elements inside `.appui`**,
now measured in the gate.

0 axe violations (43 passes), 0 page-level borders, no horizontal scroll
390–1920.

## 2026-08-19 · the Storefront Launch tab, drawn in code

Feedback: build this region in code rather than as a screenshot, make the
interface bigger, use our own avatars, pick something for the Workspace mark,
swap the template for Coastal Hotel, and overlay the template on the product as
a panel the visitor can actually scroll. Only this tab for now — review before
the other six.

- **The product UI is code, not a PNG.** `.appui` — sidebar (workspace row, the
  four Manage items, Pinned, the chat list, Get Pro, footer) plus the thread
  (prompt, agent reply with the artifact preview, action row, composer with the
  model chip). Our brand avatars stand in for the agent and the user; the
  workspace mark is the Okou icon on an accent-wash tile.
- **Bigger**: the stage is 1300px wide at 1440 — the product alone is 962px,
  against 745px for the old screenshot.
- **The template is a real page**, regenerated for a coastal hotel called
  Litoral: `.tpl` has its own miniature design system (sand/shell/sea-green,
  Cormorant Garamond) and three photographs generated for it. It lives in
  `.tplwin`, a browser window pinned to the right that **overlaps the product and
  scrolls** (`overflow-y:auto`, keyboard-focusable, `overscroll-behavior:contain`).
- **The two connector cards** sit above the product's top-right corner, clear of
  the chat, as in the sketch.
- The product keeps a right gutter (`clamp(20px, 9%, 104px)`) so nothing readable
  ever sits underneath the overlapping window.
- The other six tabs still use their captured screenshots.

0 axe violations (43 passes), 0 page-level borders, sweep clean, no horizontal
scroll 390–1920.

## 2026-08-18 · three visual bugs that screenshots would have caught

Feedback: the Slack mark is too small, the two logo rows run at different
speeds, and the tag above every heading is plainly broken.

- **The section tag stretched the full width of its section.** The composition
  rule sets `width:100%` on `.panel > .chip` — correct for a centred text block,
  wrong once the eyebrow became a pill, and it out-specifies the pill's own
  `width:max-content`. Tags are 86–220px now instead of 1320.
- **The rails had matching durations, not matching speeds.** 54s and 72s over
  tracks of 878px and 1617px is 26px/s against 26px/s only by accident — it was
  not. `app.js` now derives each duration from its own track width
  (`RAIL_PX_PER_SEC = 26`), so both rails travel at the same rate whatever they
  contain.
- **Slack read small**: its SVG carries ~30% internal padding, so at an equal box
  it looks smaller than every neighbour. Scaled 1.34 (Notion 1.06) to sit
  optically level.
- Found while sweeping: **Gmail's mark was being squashed** (4:3 natural, drawn
  in a square box with `object-fit:fill`). Every brand mark now letterboxes.

All four are invisible to the accessibility audit and to layout measurements —
they only show up by looking. Added `tools/audit.js` §6, an obvious-bug sweep
that checks tag width, rail speed parity, squashed marks and diverging logo
sizes, plus a QA-gate note: **screenshot a section head and every figure before
publishing.**

## 2026-08-18 · tags, a softer horizon, and the token sweep

- **The closing illustration** gets a long dissolve at its top edge
  (`transparent → #000` over 40% of the band) instead of a hard cut, and the CTA
  bottom padding dropped so the **buttons overlap the fade**.
- **Section tags.** The hero's opening line is now one long pill with a 6px
  accent dot, and every section eyebrow is that same object one size down. One
  shape for every "what section am I in" label.
- **Shared workflows was four text blocks before any visual.** The second
  headline folded into the paragraph as its lead sentence (the pattern already
  used in Outputs), and the third paragraph moved *below* the ladder as its
  caption — it describes the figure, so it now sits with it. Two blocks before
  the figure instead of four; no words changed, only their place.
- **Design-system sweep.** Radius and elevation are now scales
  (`--r-xs/btn/card/lg/xl/pill`, `--e-1/2/3/hover/tag/nav`), the five unnamed
  fluid type steps got names (`--t-figure/unit/statement/tag/wordmark`), and raw
  `#fff`/one-off shadows were replaced. The page now measures **16 distinct type
  sizes, 6 radii and 9 text colours — every one of them a token.**
- A rotating statement at `opacity:0` is still measured for contrast (axe blends
  it with the ground) and would be announced twice; the inactive statement is
  `visibility:hidden` now.
- The accent cannot be used for text below ~24px on the grey ground (4.16:1), so
  the tab-driven lead sentence is emphasised with ink and weight instead.

## 2026-08-18 · grey page, cards, a live header

Feedback in one pass: the two logo rows sit frozen; make the logo wall its own
section wrapped in a big card, with a light grey background for the whole site;
the highlighted phrase should be orange from the first frame and must not change
weight (the line was reflowing); the three figures are blunt and their note is
awkwardly placed; the outputs section has two titles — fold the second into the
paragraph and let it change with the tab; the header looks washed out and its
hover is dull — look at clay.com.

- **The rails were frozen.** The IntersectionObserver still listed `.marquee`
  after the class was renamed `.rail`, so `.is-in` never landed and the tracks
  stayed `paused` forever. Fixed, and the rails' play state is now part of the
  motion read-out in `tools/audit.js` so a frozen row cannot pass silently again.
- **The page ground is light grey.** Sections are either white bands on it or —
  new — `.panel--card`: a white card with radius and shadow, inset from the page.
  The reach block is now its own section (`#reach`) in that card. Sections that
  were "wash" simply show the page ground, so the alternation reads as before.
- **Highlights stopped changing weight.** `.mark.is-lit` no longer sets
  `font-weight:700`; `--accent-solid` clears AA at these sizes on its own, and
  re-weighting reflowed the line mid-animation. In the rotating statement the
  phrase is orange from the first frame — no warm-up.
- **The figures became an object**: metrics and their note in one white card,
  numeral and unit at two sizes (`2` + `hrs`), the note as the card's caption
  rather than a line floating under the middle column.
- **The count-up had never run.** `[data-count]` sits on children of the observed
  element, and `enter()` only checked the element itself. It now walks
  descendants.
- **Outputs has one title.** The second headline folded into the paragraph as its
  lead sentence, in ink and 600, with the deliverable in the accent — and it
  swaps when the tab does, with the paragraph height reserved so the tabs below
  never move.
- **The header has presence and a real hover.** Solid paper instead of a
  translucent blur, three-layer shadow. Nav labels now use the clay.com **text
  roll**: the visible label leaves upward while its duplicate arrives from below
  in the accent, 460ms. The duplicate is `aria-hidden`, so the label is still
  announced once. The primary button answers with a press instead of a colour
  change.

0 axe violations, 0 page-level borders, no horizontal scroll 390–1920.

## 2026-08-18 · the reach region: logos only, one statement at a time

Feedback: could it be logos only, like the reference? The logo wall should not
run to both edges — leave some padding. The text is too close to the logos, and
could be bigger. Highlight the important numbers and keywords. And since there
is a lot of text, could it rotate — solve it with motion instead of writing it
all out at once.

- **Rails are logo-only.** Tiles `clamp(46px, 4.2vw, 58px)`, no names, no hover.
  34 unique marks across two rails, none repeated inside a rail.
- **Inset, not edge-to-edge**: `padding-inline: clamp(12px, 4.5vw, 90px)` plus a
  mask fade at both ends. At 1440 that is 125px of air on each side.
- **The paragraph became a rotating statement**: one sentence at a time,
  16.5px → `clamp(19px, 1.95vw, 27px)`, words rising 22ms apart, swapping every
  6.5s. Both statements share one grid cell so the box is as tall as the longest
  and nothing shifts on swap.
- **One highlight per statement** — `1,000+` and `Far more`. The first pass
  highlighted three phrases and turned half the sentence orange.
- Gap from statement to rails: `clamp(38px, 4.4vw, 68px)` on top of the centred
  stage, so the two no longer crowd each other.
- Reduced motion stacks both statements and freezes the rails; both are in the
  DOM regardless, so nothing is hidden from a screen reader.

Region height 306px at 1440. 0 axe violations, 0 page-level borders, no
horizontal scroll 390–1920.

## 2026-08-18 · the reach region, reverted to the two scrolling rows

Feedback: *"不成啊，这效果太差了。要不先退回之前两行滚动的那个版本吧。"*

Two attempts at redesigning this region both landed worse than what they
replaced. Reverted the markup, CSS and script for the region to the state at
commit `2e4e928` — the two full-bleed scrolling rails — and kept everything
else from the rounds since (orange controls, the one-line hero statement, the
header sizing, the closing illustration, hashed asset links).

- Region height: 430px (wall) → 276px (compact grid) → **114px** (two rails).
- Kept from the intervening feedback: no hover affordance on the chips, since
  none of them link anywhere; the marquee still pauses on hover, which is a
  reading aid rather than a click affordance.
- "Explore the workflow behind this" stays deleted — that was a separate
  instruction, not part of this region's design.

**Lesson:** two redesigns in a row, each shipped as a whole, each rejected. When
a region is working and the ask is "show it differently", propose the direction
before rebuilding it — the cost of guessing wrong is a full round trip.

## 2026-08-18 · cache-busting, automated

The "what Okou reaches" region rendered completely unstyled for anyone who had
visited before. Not a CSS bug: `index.html` still linked `styles.css?r=42`, a
hand-maintained cache-buster that had not moved across four deploys, so browsers
served a cached stylesheet from before the block was renamed `.wall` → `.cat`.
Every other region kept its old class names and looked fine, which is why it
read as one broken area rather than a broken page.

- `tools/build-css.py` now stamps `styles.css?r=<sha1>` and `app.js?r=<sha1>`
  from the built bytes. It cannot be forgotten, and it changes only when the
  file changes.
- Added to the QA gate as §9b.
- **Dropped version numbers** from this changelog and from the source banners.
  Entries are dated; the page is revised continuously and a counter would only
  ever climb.

## 2026-08-18 · the reach region, compressed

Feedback: the capability wall takes far too much of the page — the ask was a
different *way of showing* these, not a flattened list of all of them; the
connector logos keep changing and it is not clear how; divide them better, show
them more efficiently, and be more considered about the typography.

- **~430px → ~275px** at 1440, and 624px → 440px at 390.
- **Treatment now follows identity.** Models and built-in APIs keep icon + name,
  because four models share two vendor marks and the name is what identifies
  them. Connectors are **logo tiles only**, with the brand name on `alt` — the
  logo already identifies them, and the names were costing two thirds of the
  height for nothing.
- **The models grid flows by column**, two rows, so each vendor keeps its models
  in one column (Claude Opus / Claude Fable, GPT 5.6 / gpt-image-2) instead of
  scattering them across a row-filled grid.
- **The cycling is gone.** One chip flipping every 2.4s read as an unexplained
  flicker on a list nobody can click. Items keep their staggered entrance and
  then hold still.
- Twenty connector tiles now fit on one row at 1440; the grids fall to two
  columns below 900px and stay there.

Result: 0 axe violations, 0 page-level borders, no horizontal scroll 390–1920.

## 2026-08-18 · orange controls, a one-line hero statement, the capability wall

Feedback: the hero's middle line must never wrap; the hero paragraph is too big;
don't hide the illustration; that orange is wrong; make every black button orange
with white text; the header hover pill is a different size from the button;
delete "Explore the workflow behind this"; and the connectors/models region is
messy — two different categories reduced to two scrolling rails, with hover
states on things that don't link anywhere. Redesign it.

- **The accent is now two tokens.** `--accent-solid #D64300` is the most vivid
  orange that clears 4.5:1 *both* as a fill under white text and as text on
  paper. It replaces the rust `#B93C00` that read wrong, and it lets every
  control be orange with white text. `--accent #ED4E01` stays for display-size
  emphasis and decoration. Hover no longer changes the fill — a brighter orange
  drops white text under AA — so buttons lift and shadow instead.
- **Hero**: the rotating statement is `white-space:nowrap` with its own clamp, so
  it is one line at every width down to 390px; the paragraph steps down from
  `--t-lead` to 16.5px.
- **Header**: nav links, sign-in and the small button share `height:38px` and
  pill radius, so the hover pill and the button are the same object.
- **Closing illustration** is shown, not faded: the mask came off, the band grew
  to `clamp(230px, 34vw, 560px)` and it bleeds the full viewport width.
- **"Explore the workflow behind this" removed.**
- **The connectors/models region was rebuilt as a capability wall** — three
  labelled families (Models · Built-in APIs · Connectors) of chips, replacing the
  two marquees. No hover affordance, because nothing there is a link. Instead the
  connectors band **cycles**: every 2.4s one chip flips to another connector from
  a pool of real assets, which is what "1,000+" actually looks like. Chips arrive
  family by family, 34ms apart.
- Bug caught in the same pass: the first cycling build could show the same brand
  twice (Gmail/Notion existed in both the grid and the pool) — the swap now
  checks what is on screen first.

**New copy introduced** (flagged for review): the three wall labels — "Models",
"Built-in APIs", "Connectors" — and the connector names that rotate in (Google
Drive, Google Analytics, Meta Ads, Zapier, Perplexity, Manus, OpenClaw).

Result: 0 axe violations, 0 page-level borders, one line at every breakpoint,
no horizontal scroll 390–1920.

## 2026-08-18 · one composition rule, and the brand layer

Feedback: delete the announce strip; the hero's information is scattered and
messy — centre it, stack it, and put a product image underneath like Notion; the
whole page reads messy because the type has no obvious rule; add placeholders
where images belong; here are the new branding comps (reference only) plus agent
avatars and textures to use.

- **Announce strip deleted.** The header now sits at the top of the page and the
  `--ann` measurement in `app.js` is gone with it.
- **One composition rule everywhere** (`docs/design-principles.md` §9): centred
  stack — eyebrow → heading → lede → action — then a full-width figure. The hero
  is the same shape at a larger size. This replaces the heading-left /
  lede-right pairing, which let every section arrange itself differently.
- **Hero rebuilt**: centred stack, the rotating statement as a single line under
  the headline, then the product image directly below with brand stickers pinned
  at its corners.
- **Three placeholders** for images that do not exist yet: the hero product
  screen, a comparison graphic in Positioning, a customer-logo strip in Proof.
  Each states its intended size in `data-ph`.
- **Brand layer added** from the supplied assets: four agent avatars (parallel
  work cards, Slack transcript, proof quotes), three painted stickers (hero),
  clouds and sun behind the hero type, and the landscape as the horizon of the
  closing dark chapter. Controls became pills, following the brand comps.
- **Footer** follows the same centred rule instead of its own two-column layout.
- **Accent frequency halved**: the mid-section statement is no longer coloured;
  one accent phrase per section, in the heading.
- Bugs found and fixed in the same pass:
  - An absolutely-positioned child of a grid container resolves percentages
    against its **grid area**, so the full-bleed landscape rendered 240px
    narrower than the section. Use `vw` + `max-width:none`.
  - `.ph` with `display:grid; place-items:center` pushed its label and spec to
    opposite ends of the box; it needs to be a centred flex column.
  - A stray `opacity:.9` on `.footnote` dropped it under AA on the wash ground.
  - Base `text-align:left` on `.hero__body` survived the move into a centred
    stack.

Result: 0 axe violations, 0 page-level borders, strict paper/wash alternation,
no horizontal scroll at 390–1920, reduced motion clean.

## 2026-08-17 · no structural lines

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

## 2026-08-17 · the rebuild

Feedback: floating header like Motion's, research better design/motion skills,
critique the page, then fix it wholesale. No copy changes.

**What was wrong.** `styles.css` was 2,733 lines of *five stacked theme layers*:
"Swiss technical editorial + one orange accent" → a seven-swatch `PALETTE` →
"colour lives in backgrounds" → `WIREFRAME` → `WIREFRAME v2` → a final
patch layer. The last
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

## Before this repo — the inherited page

The page as it existed on the production slug when this repo started
(the production slug as it stood on 2026-08-17). Kept only as the origin of the `base.css`
component CSS: the Okou app window, the Slack transcript, the permissions table
and the workflow stages are all from that lineage and are still in use.

**Lesson carried forward:** never re-theme by appending a layer. A new visual
direction replaces the design layer; it does not stack on top of the last one.
