# Design system

Everything here is declared once in `src/css/system.css` §1 and used through
custom properties. If a value is hard-coded in a rule instead of coming from a
token, that is a bug.

---

## 1. Colour

### Grounds and ink

| Token | Value | Use |
|---|---|---|
| `--paper` | `#FFFFFF` | default ground, and every surface |
| `--wash` | `#F4F6F7` | alternating section ground |
| `--wash-2` | `#EAEEF0` | inset fills: pills, secondary buttons, trays, the active step |
| `--ink` | `#0C0F12` | headings, primary fills, the closing chapter |
| `--ink-soft` | `#464C52` | body copy (8.4:1 on paper) |
| `--ink-mute` | `#636A70` | labels, captions, inactive text — the lightest text allowed (5.5:1 on paper, 5.1:1 on wash, 4.7:1 on wash-2) |

`--hairline` `#DFE4E7`, `--rule` `#C9D0D5` and `--grid` `#EDF0F2` survive as
tokens because the product mocks reference them. **Do not introduce new
page-level rules with them** (see design-principles §1).

### Accent

| Token | Value | Use |
|---|---|---|
| `--accent` | `#ED4E01` | brand orange: display-size emphasis, decoration |
| `--accent-solid` | `#D64300` | every interactive fill, and accent text below display size |
| `--accent-ink` | `#D64300` | alias of `--accent-solid`, kept for older rules |
| `--accent-2` | `#FFF1EA` | the faintest accent wash (rarely used) |

`--accent-solid` is 4.50:1 against **both** white text and a white ground — the
most vivid orange that does both. Accent fills carry **white** text; accent
phrases at text sizes are set bold.

### Status

`--ok #0E7C4A` · `--wait #B45309` · `--blue #1D6FE0` · `--yellow #F0B429`.
Status is drawn as a **tinted fill** with a darkened label:

```css
.state--ok   { background:rgba(14,124,74,.12); color:#0B6B40; }
.state--wait { background:rgba(180,83,9,.14);  color:#8F4207; }
.state--off  { background:var(--wash-2);       color:var(--ink-mute); }
```

### The legacy ramp

`--g-000 … --g-900` is a nine-step cool-neutral ramp that exists so the
untouched product-mock CSS in `base.css` lands inside this palette. Treat it as
private to the mocks; new work uses the named tokens above.

## 2. Type

| Role | Token | Family |
|---|---|---|
| Display | `--fd` | Archivo 600/700 |
| Body | `--fb` | Instrument Sans 400/500 |
| Utility | `--fm` | IBM Plex Mono 500, uppercase, `letter-spacing:.075–.16em` |

Scale — nine steps, no ad-hoc sizes:

| Token | Value | Used by |
|---|---|---|
| `--t-d1` | `clamp(42px, 6.4vw, 96px)` | hero headline (hero overrides to `clamp(46px,7.4vw,112px)`) |
| `--t-d2` | `clamp(29px, 3.7vw, 54px)` | `.sentence`, metric numerals, footer line |
| `--t-d3` | `clamp(21px, 2.2vw, 30px)` | hero rotator, step headings, `.vs h3` |
| `--t-h` | `clamp(17px, 1.35vw, 19px)` | card headings |
| `--t-lead` | `clamp(17px, 1.45vw, 20px)` | section lede |
| `--t-body` | `16.5px` | prose |
| `--t-sm` | `14.5px` | secondary prose, card copy |
| `--t-meta` | `13px` | attributions, disclaimers |
| `--t-mono` | `11px` | every utility label and control |

Five more fluid steps carry the components that need their own size. They are
named for the same reason the others are — the page measured 24 distinct sizes
while these lived as one-off `clamp()`s inside rules:

| Token | Value | Used by |
|---|---|---|
| `--t-figure` | `clamp(34px, 4vw, 56px)` | a metric numeral |
| `--t-unit` | `clamp(16px, 1.6vw, 22px)` | its unit (`hrs`, `+`) |
| `--t-statement` | `clamp(19px, 1.95vw, 27px)` | the rotating statement |
| `--t-tag` | `clamp(14px, 1.15vw, 17px)` | the hero tag |
| `--t-wordmark` | `14px` | the logo lockup |

**The whole page measures 16 distinct sizes, and every one is a token.** If a new
rule needs a size that is not on this list, the rule is wrong — or the step
belongs here, named.

Section headings step down from the hero: `clamp(33px, 4.6vw, 66px)`. At 96px a
two-line heading wrapped to four lines inside the reading column.

## 3. Space and measure

```css
--edge:   max(20px, calc((100vw - 1320px) / 2));   /* page gutter, caps content at 1320 */
--gutter: clamp(18px, 2vw, 30px);                  /* grid column gap */
--nav-h:  64px;                                    /* floating header, 56px when stuck */
```

Section padding: `clamp(78px, 7.6vw, 124px)` block, `--edge` inline.
Measures: prose `62ch`, the paired lede `38ch`, notes `64ch`.

## 4. Radius and elevation

Five radius steps, nothing in between:

| Token | Value | Use |
|---|---|---|
| `--r-panel` | `0` | full-bleed section bands |
| `--r-xs` | `8px` | small chips inside a product mock |
| `--r-btn` | `10px` | small controls, logo tiles |
| `--r-card` | `12px` | surfaces, cards, tiles |
| `--r-lg` | `clamp(16px, 1.8vw, 26px)` | a component-scale card (`.figures`) |
| `--r-xl` | `clamp(20px, 2.2vw, 34px)` | a section-scale card (`.panel--card`) |
| `--r-pill` | `999px` | buttons, tags, tabs, the composer |

Elevation is a scale too — a surface is a fill plus **one** of these, never a
hand-written shadow:

```css
--e-1        /* a card at rest                     */
--e-hover    /* the same card, lifted              */
--e-2        /* a section-scale card               */
--e-3        /* the largest objects: product shots */
--e-tag      /* the section tag                    */
--e-nav / --e-nav-stuck
```

## 5. Grid and composition

`.panel` is a 12-column grid, `column-gap: var(--gutter)`. Everything spans all
twelve columns; the section's own voice is centred inside that span.

```
              eyebrow
              HEADING          <=20ch
              lede             <=54ch
             [ action ]
+ 1 ------------------------------------- 12 +
| figure . cards . data row, full width       |
+---------------------------------------------+
```

```css
.panel > *{ grid-column:1 / 13; }
.panel > .chip,
.panel > .display,
.panel > .sentence,
.panel > .section-body,
.panel > .note,
.panel > .footnote,
.panel > .linkline,
.panel > .cta__btns{ justify-self:center; text-align:center; width:100%; }
.panel > .display     { max-width:20ch; }
.panel > .sentence    { max-width:24ch; }
.panel > .section-body{ max-width:54ch; margin-inline:auto; }
.panel > .note,.panel > .footnote{ max-width:58ch; margin-inline:auto; }
```

The hero uses the same shape through `.stack` (a centred flex column) followed by
`.showcase` — the product image with the stickers pinned around it.

Card interiors stay left-aligned. Only the section header, the mid-section
statement and section-level asides are centred.

Breakpoints: `960` (nav collapses to flex + burger, hero texture hidden, cards
single-column, placeholders go 4:3), `620` (scene sides stack, tighter steps).

## 6. Surfaces

One recipe, used everywhere:

```css
background: var(--paper);
border: 0;
border-radius: var(--r-card);
box-shadow: 0 1px 2px rgba(12,15,18,.03), 0 14px 30px -24px rgba(12,15,18,.2);
/* hover */
transform: translateY(-3px);
box-shadow: 0 2px 6px rgba(12,15,18,.05), 0 24px 46px -26px rgba(12,15,18,.28);
```

Product windows (`.absui`, `.slackui`, `.flowui`, `.perms`, `.scene__shot`) use
the same idea with a deeper shadow, because they are the largest objects on the
page.

Pills (`.tag`, `.scenes__tab:not(.is-on)`) take `--wash-2` on a paper ground and
`--paper` on a wash ground. **Scope those flips with `:not(.is-on)`** — a rule
like `#outputs .scenes__tab{background:var(--paper)}` out-specifies
`.scenes__tab.is-on` and silently erases the active state.

## 7. Chrome

**Floating header** — `position:fixed`, centred, `width:min(100vw - 24px, 1320px)`,
`grid-template-columns:1fr auto 1fr` → logo left, nav centred, actions right.
**Solid paper**, 16px radius, no border, a three-layer shadow. A translucent
blurred bar read as "already hidden" against a light page; solid plus depth is
what gives it presence. Past `scrollY > 28` it gains `.is-stuck` (56px tall,
deeper shadow). Under 960px it becomes flex with `order`: logo · actions ·
burger.

**The label roll** (learned from clay.com): every nav label is duplicated, the
pair sits in a `overflow:clip` box one line tall, and on hover both move up by
100% — the visible copy leaves, the duplicate arrives **in the accent**, 460ms
on `--e-out`.

```html
<a href="#outputs"><span class="roll">
  <span class="roll__t">Features</span>
  <span class="roll__t" aria-hidden="true">Features</span>
</span></a>
```

The duplicate is `aria-hidden`, so the label is announced once. Reduced motion
holds the first copy in place. The primary button answers with a press
(`translateY(-1px) scale(1.015)`), never a colour change.

## 6b. Section tags

Every "what section am I in" label is the same object: a pill with a 6px accent
dot, mono uppercase, `letter-spacing:.16em`. The hero's opening line is the same
tag one size up (`--t-tag`), which is why the top of the page and every section
head read as one system.

```css
.chip{ display:inline-flex; gap:9px; padding:8px 16px 8px 13px;
       border-radius:var(--r-pill); background:var(--paper); box-shadow:var(--e-tag); }
.chip::before{ content:""; width:6px; height:6px; border-radius:50%;
               background:var(--accent-solid); }
```

On a white section the tag takes `--wash-2` and drops the shadow; on the ink
chapter it takes `rgba(255,255,255,.1)`.

## 7b. Cards on a grey page

The page ground is `--wash`. A section is either a white band on it, or a
**card** — used where the content is a self-contained object:

```css
.panel--card{
  --card-gap:clamp(12px, 1.8vw, 26px);
  margin-inline:var(--card-gap);
  margin-block:clamp(10px, 1.4vw, 22px);              /* grey shows around it */
  padding-inline:max(20px, calc(var(--edge) - var(--card-gap)));
  background:var(--paper);
  border-radius:clamp(20px, 2.2vw, 34px);
  box-shadow:0 1px 2px rgba(12,15,18,.03), 0 26px 64px -44px rgba(12,15,18,.3);
}
```

The inline padding subtracts the card's own margin so the content still lands on
the same 1320 measure as an uncarded section. `#reach` is the first card;
`.figures` (the metrics block) is the same idea at component scale.

## 8. Sections

| # | Section | Ground |
|---|---|---|
| — | hero | paper |
| 1 | `#outputs` Outputs | wash |
| 2 | `#workflows` Shared workflows | paper |
| 3 | `#parallel` At once | wash |
| 4 | `#control` Control | paper |
| 5 | `#positioning` Positioning | wash |
| 6 | `#proof` Proof | paper |
| — | `#cta` + `.footer` | ink — one dark closing chapter |

```css
#outputs,#parallel,#positioning { background:var(--wash); }
#workflows,#control,#proof      { background:var(--paper); }
```

**Adding or reordering a section means re-deriving this list**, because the
alternation is the only thing separating two sections. Getting it wrong is
invisible in code review and obvious on the page — sections 2 and 3 were both
paper for one build and simply ran together.

## 9. Brand layer

The new branding is warmer and more illustrated than the neutral system. It is a
layer on top, not a replacement.

| Asset | File | Where it is allowed |
|---|---|---|
| Agent avatars x4 | `assets/brand/avatar-1…4.png` | wherever a person or agent is named: the parallel-work cards, the Slack transcript, the proof quotes, hero stickers |
| Painted stickers x3 | `sticker-idea` · `sticker-star` · `sticker-draft` | pinned at the corners of the hero product image, rotated 5–8° |
| Landscape | `scene-hills.png` | once, as the horizon of the closing dark chapter |
| Clouds · sun | `clouds.png` · `sun.png` | behind the hero type, low opacity, hidden under 960px |

```css
.avatar{ width:40px; height:40px; border-radius:50%; object-fit:cover; }
.showcase__sticker{ position:absolute; width:clamp(52px,6.2vw,88px);
                    filter:drop-shadow(0 12px 26px rgba(12,15,18,.18)); }
.cta__scene{ position:absolute; bottom:-1px; height:clamp(120px,14vw,210px);
             object-fit:cover; object-position:50% 100%;
             mask-image:linear-gradient(180deg, transparent 0%, #000 46%); }
```

**Gotcha:** an absolutely-positioned child of a grid container resolves its
percentages against its **grid area**, not the padding box — `width:116%` on
`.cta__scene` came out narrower than the section. Use `vw` for full-bleed
decoration, plus `max-width:none` to defeat the global `img{max-width:100%}`.

Controls are pills: `.btn`, `.scenes__tab`, `.nav__links a` all use `--r-pill`,
which is where the new brand comps are heading. Surfaces keep `--r-card`.

**One control height.** Nav links, the sign-in link and the small button are all
`height:38px` with pill radius, so the hover pill and the button are the same
object. Any new control in the header inherits that height.

## 10. Placeholders

```html
<figure class="ph ph--band" data-ph="Customer logos · 2400x686">
  <span class="ph__label">Image placeholder</span>
</figure>
```

`--wash-2` fill, soft shadow, centred mono label plus the `data-ph` spec.
Shapes: default 16:10 · `--wide` 16:9 · `--band` 21:6 · `--square` 1:1. Three are
live right now: the hero product screen, a comparison graphic in Positioning, and
a customer-logo strip in Proof.

## 11. What Okou reaches

A rotating statement over two rails of marks.

**The statement.** The copy for this region is long, so motion carries it instead
of the page: one sentence at a time, `clamp(19px, 1.95vw, 27px)` display face,
centred on a `54ch` measure. Words rise in sequence (22ms apart), the numbers
warm into the accent once they have settled, and the statement swaps every 6.5s.

```css
.reach__stage{ display:grid; place-items:center; min-height:3.9em; }
.reach__line{ grid-area:1 / 1; }           /* both share one cell, so the box
                                              is as tall as the longest and
                                              nothing shifts on swap */
.reach__line .w{ transition-delay:calc(var(--wi) * 22ms); }
```

Both statements stay in the DOM — nothing is hidden from a screen reader — and
reduced motion simply stacks them and stops the rails.

**Highlight only the numbers.** One `<mark>` per statement, on the figure or the
claim that carries it (`1,000+`, `Far more`). Highlighting three phrases in a
two-line sentence turns half the sentence orange and stops meaning anything.

**The rails.** Logos only — no names, no hover, nothing clickable. Tiles are
`clamp(46px, 4.2vw, 58px)` with the section's opposite ground, and the rails are
**inset** (`padding-inline: clamp(12px, 4.5vw, 90px)` on `.reach`) with a mask
fade at both ends, rather than running into the page edge. `app.js` duplicates
each track once for a seamless loop; `data-speed` sets the duration and
`data-dir="rev"` reverses the second rail. No mark appears twice within a rail.

Two earlier redesigns of this region were reverted (2026-08-18): a labelled
three-family wall of named chips, and a compact grid with logo-only connector
tiles. Agree the direction before rebuilding it again.

## 12. The Storefront Launch stage

The first tab of Outputs is built in code (`.scene--built`), not a screenshot:

```
.stage
├── .appui        the product — sidebar + thread, 74% width
├── .stage__conn  two connector cards, absolute, top right, above the product
└── .tplwin       the published page in a browser window, absolute right,
                  overlapping the product and scrollable
```

- `.appui` uses the page's own tokens, so the product picture stays in the design
  system rather than drifting like a screenshot would.
- `.tplwin__scroll` is `overflow-y:auto`, `tabindex="0"`, `role="region"` with a
  label, and `overscroll-behavior:contain` so scrolling it never scrolls the page.
- `.tpl` is a **separate miniature design system** — its own colours, its own
  serif — because it is depicting a different website. Nothing inside it should
  inherit ours, and its internal hairlines are that site's furniture, not ours.
- The product carries a right gutter (`clamp(20px, 9%, 104px)`) so no text is
  ever hidden under the overlapping window.

Photographs for the template are generated (`site/assets/template/`), scaled to
≤760px and saved as JPEG — 124KB for all three.

The other six tabs still use captured screenshots. If they are ever rebuilt the
same way, they should reuse `.appui` and only vary the thread and the artifact.

## 13. Drawing the product: the source of truth is the product

`.appui` is a picture of the real app, so **nothing in it may be invented**.
Every value below was read out of `vm0-ai/vm0`, not remembered:

| What | Where it comes from |
|---|---|
| Typeface | `turbo/apps/platform/src/views/css/index.css` → **Noto Sans**, JetBrains Mono |
| Colours | `turbo/packages/ui/src/styles/globals.css` → `--card #FFFFFF`, `--sidebar` gray-50 `#F3F5F8`, `--foreground` gray-950 `#14171D`, `--muted-foreground` gray-800 `#525B68`, `--border` gray-200 `#DCE1E8`, `--accent` gray-100 `#E7EBF0`, `--primary` primary-700 `#ED4E01` |
| Radii | `--radius 8px`, `--radius-md 6px`, `--radius-xl 14px` |
| Icons | **lucide-react**, the exact names the app imports: `Users` Agents · `Route` Workflows · `Plug` Connectors · `Package` Artifacts · `PanelLeftClose` collapse · `Hourglass`+`ChevronRight` the run row · `Paperclip`/`Image`/`SlidersHorizontal`/`Globe`/`Mic`/`ArrowUp` composer. The footer row uses the Slack mark, per `FOOTER_NAV.iconImg` |
| Run row | `<Hourglass size={14}/> <span class="text-[13px]">Worked for 3m</span> <ChevronRight size={14}/>`, muted, `rounded-lg px-2 py-1.5 min-h-9` |
| Prompt bubble | `rounded-lg bg-muted/40 text-sm`, `max-w-[85%]`, self-end |

How to refresh it when the app changes:

```bash
git clone --depth 1 --filter=blob:none --sparse https://github.com/vm0-ai/vm0
git sparse-checkout set turbo/apps/platform/src turbo/packages/ui
# icons: grep MANAGE_NAV in views/zero-page/zero-sidebar.tsx
# tokens: turbo/packages/ui/src/styles/globals.css
# glyph paths: unpkg.com/lucide-static@<version>/icons/<name>.svg
```

**Never hand-draw an SVG path for a product icon.** Pull the glyph from
`lucide-static` at the version in `turbo/apps/platform/package.json`. Hand-drawn
approximations are what made the first two attempts read as "not our product".

## 14. The pinned ladder, and fitting a screen to a frame

Shared workflows is the page's only scroll-driven section. Its shape:

```
.ladder                  a track, --wf-h + (steps − 1) × --wf-travel tall
└── .ladder__view        sticky; two placed cells, no auto flow
    ├── .ladder__stage   grid-area 1/2 — but FIRST in the source
    │   └── .ladder__frame   the mat: one height, --mat ground, overflow hidden
    │       └── .wfstage     absolutely inset; display:none/block switches them
    └── .ladder__col     grid-area 1/1 — the list, then .ladder__foot at its base
```

**Why the stage comes first in the markup.** Below 1080px the grid comes off and
the frame sticks over the list — and a grid item can only stick inside its own
cell, so the frame has to be a *block sibling ahead of* the list. On the wide
layout `grid-area` puts it back on the right. Never rely on `order` for this:
`order` moves the paint position, not the containing block.

**Reading the step from scroll.** `readStep()` is
`(stickyTop − ladderTop) / (trackHeight − viewHeight)`, floored into equal
shares. Nothing observes the steps themselves. Clicking one **scrolls the pin**
to `travel × (i + 0.5) / n` rather than just setting a class, so the scroll
position and the open step can never disagree. `--wf-travel: 64vh` is the scroll
spent per step; below ~50vh it flicks past, above ~80vh it feels stuck.

**The state is the size.** A resting title is `--t-step-off`, an open one
`--t-step`, and its paragraph unfolds with `grid-template-rows: 0fr → 1fr` (the
child needs `overflow:hidden` and `min-height:0`). No fill, no bar, no rule —
one dimension per state.

**The reference is reproduced at its own size.** The ladder is built to
Figma node `662:1561` token for token — 286 + 48 + 649 wide, 498 tall, 4 × 19
markers, 0.5px rules, Inter 300/400 at 16 → 32px, media `r=16` on `#D9D9D9`.
It is centred at `--wf-w: 983px` rather than stretched to the card, because
literal px values only hold their proportion at the size they were drawn: the
same 16px paragraph in a 520px column reads lost, and the mocks get pulled wider
than they were designed for. Every one of those numbers is a `--wf-*` custom
property at the top of §13, with the node id in the comment, so the next person
can diff them against the file rather than guess which are intentional.

**Sizing it to the viewport.** The reference frame is scaled by ONE factor — this
block's width over the reference's own 983px, 1.34× at 1440 — and every `--wf-*`
clamp maximum is that product. Scaling the whole frame by one number is the only
way to keep a reference's proportions while changing its size; tuning values
individually is how a design stops being the design. Targets worth holding, read
off a page whose sizing was called comfortable: **media ≈ 65–75% of viewport
height**, and enough space under it that the section does not end at the fold.

**Fitting, not matting.** When several product screens share one slot they must
not resize it, and a hard-coded fit is only right at one viewport. Each stage
lays out at one design width, `app.js` measures its natural height behind
`visibility:hidden`, and sets the scale:

```js
st.classList.add('is-measuring');            // display:block, height:auto, no transform
var h = st.getBoundingClientRect().height;
st.classList.remove('is-measuring');
st.style.setProperty('--fit', Math.min(bw / FIT_W, bh / h).toFixed(4));
```

```css
.wfstage{
  position:absolute; top:50%; left:50%;
  width:var(--dw); height:var(--dh);
  transform:translate(-50%, -50%) scale(var(--fit, 1));
}
```

Re-run it on resize and on `fonts.ready` — web fonts change every measurement.
The CSS defaults (`--fit: 1`) must still render something sane if the JS never
runs.

**A mat has to contrast with what it sits on.** The reference's ground never
shows because the picture fills it; a white app window on a white card needs a
dark mat and a real inset, or the frame reads as nothing at all.

- **Fit before you crop.** Cropping is only acceptable where the clipped edge is
  more of the same — a long thread, a long list. Where the bottom of the screen
  is the *point* (an action row, a composer, a total), scale it.
- Any entrance animation on a fitted element must use the independent
  `translate` / `scale` properties, not `transform`, or it replaces the fit.
- Where cropping *is* right, fade the last ~28px with `mask-image` on the
  overflow container only. Masking a whole pane dims the composer and the
  footnote inside it, which looks like a rendering fault.
- The fit factor is computed against one fixed box height, so **any layout with
  a different box height must reset it** (`transform:none`) and fall back to
  fading. The stacked layout does exactly that.
- `.panel--card` around a pinned section must use `overflow:clip`, not
  `overflow:hidden` — the latter makes the card a scroll container and
  `position:sticky` inside it has nothing to stick to.
