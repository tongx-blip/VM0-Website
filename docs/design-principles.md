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

## 3. One accent, spent on meaning

`--accent: #ED4E01` (VM0 orange) is the only hue on the page besides ink and the
neutral grounds. It appears in exactly three roles:

1. **Emphasis** — the phrase inside `<mark class="mark">` warms from ink into the
   accent as it arrives. Display sizes use `--accent`; text sizes use
   `--accent-ink` (`#B93C00`) so small type still clears AA.
2. **The primary action** — the ink button warms to accent on hover; on the dark
   closing chapter the primary button *is* accent.
3. **Live state inside the product figures** — a running task, an active step.

**Hard rule:** an accent fill always carries **ink** text. White on `#ED4E01` is
3.4:1 and fails.

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

## 9. Layout: fill the width on purpose

- Reading column: grid columns 1–8.
- The section's **opening paragraph sits in columns 9–12**, bottom-aligned to the
  heading — that pairing is what uses the right half now that no rail does.
  Below 1080px it stacks.
- Figures, data rows and card grids span all twelve columns.
- The reading edge never moves: every text block starts at the same x.

## 10. Accessibility is part of the design, not a pass afterwards

Ship at **0 axe violations**. Concretely: `--ink-mute` (`#636A70`) is the lightest text
allowed, and it is chosen to clear AA on every ground the page uses — paper,
wash and wash-2; accent text uses `--accent-ink`; every landmark has a
unique accessible name; `prefers-reduced-motion` skips the choreography without
leaving anything invisible; focus is visible.
