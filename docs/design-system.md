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
| `--accent` | `#ED4E01` | emphasis at display sizes, primary fill, live state |
| `--accent-ink` | `#B93C00` | the same accent as small text (5.9:1) |
| `--accent-2` | `#FFF1EA` | the faintest accent wash (rarely used) |

An accent fill carries **ink** text, never white.

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

## 4. Radius

`--r-card 12px` (surfaces) · `--r-btn 10px` (buttons, tabs) · `--r-pill 999px`
(tags, the composer) · `--r-panel 0` (sections are full-bleed bands).

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
Blurred translucent paper, 14px radius, no border, soft shadow. Sits at the top
of the page; past `scrollY > 28` it gains `.is-stuck` (56px tall, more opaque,
deeper shadow). Under 960px it becomes flex with `order`: logo · actions ·
burger. There is no announce strip — it was removed 2026-08-18.

**Composer** (`.chatbar`) — fixed bottom-right pill, blurred paper, ink send
button that warms to accent, hides itself when the footer is in view.

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
