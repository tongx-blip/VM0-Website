# Design principles

The rules this site is held to. Each one exists because of a specific decision or
a specific mistake — the reason is written down so the rule can be argued with
later instead of cargo-culted.

---

## 1. No structural lines

**Nothing on this page is separated by a rule.** No section dividers, no column
grid overlay, no hairline above a paragraph or a caption or a footer block, no
vertical spine, no outlines on cards, screenshots, pills, buttons or status
chips, no connector lines in diagrams, no underline under emphasised text.

Separation comes from four things instead:

1. **Grounds** — sections alternate `--paper` and `--wash`; no two neighbours
   share a ground, so the boundary is visible without drawing it.
2. **Space** — the section padding and the gaps between blocks carry the rhythm.
3. **Type scale** — hierarchy is size and weight, not a line above a label.
4. **Shadow** — a surface is a fill plus a soft shadow. Never an outline.

**Why:** individually justified hairlines add up to visual noise ("这些线条太乱
了"). A page full of rules also reads as machine-assembled, because the rules are
narrating a structure the layout should already make obvious.

**Exception:** borders *inside* a product mock (the Okou app window, Slack, the
permissions table, the workflow list) stay. There they depict the product's own
UI. The `NO-RULES` audit in `tools/audit.js` exempts those subtrees and must
otherwise return 0.

**Consequences to remember**
- Status is a tinted fill (`ALLOWED` / `DENIED` / `NOT GRANTED`), never a
  bordered chip.
- Secondary buttons are a soft fill (`--wash-2`), never an outline.
- Emphasis is **colour on the phrase**, not an underline (§3).
- Diagrams: if captions already narrate the flow, the connectors are redundant.
  The parallel-work figure says "You ask once → Four tasks, each in its own chat
  → Each chat reports back", so the lines came out and a tray groups the cards.

## 2. Labels: no numbers, no rail

A section label is a small uppercase eyebrow, **text only**, sitting directly
above the heading.

- ✅ `OUTPUTS`
- ❌ `01 / OUTPUTS`
- ❌ the label parked in a left-hand column of its own

**Why:** `01 / 02 / 03` markers in a left rail are the single clearest tell of an
AI-generated page, and they cost a quarter of the page width to say almost
nothing. Numbering is only earned when the content genuinely **is** a sequence —
the four workflow steps (Run → Save → Hand over → Automate) keep their numbers
because the order is the point; a list of sections does not.

## 3. One accent, in two weights

Orange is the only hue on the page besides ink and the neutral grounds. It is
declared twice because one value cannot do both jobs:

| Token | Value | Job |
|---|---|---|
| `--accent` | `#ED4E01` | the brand orange — display-size emphasis, decoration |
| `--accent-solid` | `#D64300` | **4.5:1 both ways**: carries white text as a fill *and* stays legible as text on paper |

`#D64300` is the most saturated orange that clears AA in both directions, which
is why every button fill, every control and every accent phrase below display
size uses it. Going brighter breaks white-on-orange (`#ED4E01` is 3.7:1); going
darker turns rust and stops reading as the brand.

Where it appears — and nowhere else:

1. **Emphasis** — the phrase inside `<mark>` warms from ink to orange as it
   arrives, one phrase per section, and it goes **bold** at text sizes.
2. **Every primary control** — buttons, the active tab, the composer's send key.
   All orange, all **white text**. Hover does not change the fill (any brighter
   orange drops white text under 4.5:1); the lift and the shadow carry it.
3. **Live state inside the product figures** — a running task, an active step.

**Where orange text is not allowed:** below ~24px on the grey page ground.
`--accent-solid` is 4.16:1 on `--wash`, so small accent text there fails AA and
darkening it far enough turns it rust. Emphasise with ink and weight instead —
that is what the tab-driven lead sentence in Outputs does.

## 4. Cool neutrals, never warm

Grounds are pure white and cool greys (`#F4F6F7`, `#EAEEF0`). Warm off-white,
cream and beige are out — they read as "AI default" and Tong has rejected them
before. Ink is a cool near-black (`#0C0F12`), not `#000`.

## 5. Real imagery, real brand marks

Product screenshots and connector logos ship **in full colour**. A greyscale
filter over the imagery ("wireframe" mode) drains the most persuasive assets on
the page — the 1,000+ real connector marks and the real app screens — and was
the single biggest reason the page looked dead before 2026-08.

## 6. Type has three roles

- **Display** — Archivo 600/700, tight tracking. Headlines and statements.
- **Body** — Instrument Sans 400/500. Prose.
- **Utility** — IBM Plex Mono 500, uppercase, tracked. Labels, data, captions,
  controls. Its job is to signal "this string is metadata, not prose".

One scale, nine steps (`docs/design-system.md`). The pre-2026-08 page had 25
distinct font sizes and one typeface doing all three jobs.

## 7. Copy is content

Design work does not rewrite copy. Headlines, body text and labels are edited by
a human. What design may change: order, position, column, size, weight, ground,
and motion. (The one authorised exception so far: dropping the `01 /` prefixes
from section labels.)

## 8. Motion is orchestrated, not sprinkled

One page-load sequence in the hero, five named entrance variants, and hover
craft on every interactive element. Timing and easing come from tokens, never
browser defaults. Full spec in `docs/motion.md`.

## 9. One composition rule for the whole page

Every section — the hero included — has the same shape:

```
        eyebrow            ← uppercase, no number
        HEADING            ← centred, ≤20ch
        lede               ← centred, ≤54ch
       [ action ]          ← centred
┌─────────────────────────────────────────┐
│  figure / cards / data, full width       │
└─────────────────────────────────────────┘
```

Centred stack, then a full-width figure. Nothing else. Prose **inside** a card
stays left-aligned; only the section's own voice is centred.

**Why:** the previous layout let each section arrange itself — heading left,
lede right, figure somewhere — and the page read as assembled rather than
designed ("整个landing page都有点乱，因为文字的排版没有特别明显的规律"). One
visible rule, repeated without exception, is what makes a long page feel
composed. It is also the rule the reader can *see*, which is the point.

The hero is not an exception: same stack, larger type, with the product image
directly underneath it (Notion's shape). If a section seems to need a different
arrangement, the content is wrong, not the rule.

## 10. Illustration is the warmth layer

The neutral system carries structure; the brand illustration carries warmth. Use
it deliberately and sparingly:

- **Agent avatars** (`assets/brand/avatar-*.png`) go where a *person or an agent*
  is named — the parallel-work cards, the Slack transcript, the proof quotes.
  Never as decoration for its own sake.
- **Painted stickers** (`sticker-*.png`) pin around the hero product image, at
  the corners, slightly rotated, never overlapping type.
- **The landscape** (`scene-hills.png`) appears once, as the horizon on the
  closing dark chapter, bottom-cropped and faded into the ground.
- **Clouds and sun** sit behind the hero type at low opacity, and are hidden
  below 960px.

Controls are pills (`--r-pill`), as in the new brand comps. Everything else keeps
the 12px surface radius.

## 11. Placeholders are honest

Where a real image is still missing, ship a marked placeholder rather than a
stand-in stock image or a fabricated screenshot:

```html
<figure class="ph ph--wide" data-ph="Product screen · 2560×1600">
  <span class="ph__label">Product image</span>
</figure>
```

It states what belongs there and at what size, so the slot can be filled without
guessing. `ph--wide` 16:9 · default 16:10 · `ph--band` 21:6 · `ph--square` 1:1.

## 12. Accessibility is part of the design, not a pass afterwards

Ship at **0 axe violations**. Concretely: `--ink-mute` (`#636A70`) is the lightest text
allowed, and it is chosen to clear AA on every ground the page uses — paper,
wash and wash-2; accent text uses `--accent-ink`; every landmark has a
unique accessible name; `prefers-reduced-motion` skips the choreography without
leaving anything invisible; focus is visible.
