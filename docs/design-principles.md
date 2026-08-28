# Design principles

The rules this site is held to. Each one exists because of a specific decision or
a specific mistake — the reason is written down so the rule can be argued with
later instead of cargo-culted.

---

> Every rule on this page is indexed in **`RULES.md`**. This file argues the
> visual ones; the values live in `design-system.md`.

## 0. Two shapes, and only two

**Every component with a box is a rectangle** (`--r-btn`, 10px). `--r-pill` is
reserved for things that are actually round — an avatar, a status dot, the cap
of a progress bar. A page that mixes lozenges and rectangles has two ideas about
what a control is, and a reader has to hold both.

**Every section is a white card on the grey page** (`--r-section`, 16px, no
shadow). The hero and the closing CTA band are the two deliberate exceptions:
the hero is the page opening full-bleed, the CTA is the dark chapter that ends
it. Before this was settled the page mixed grey bands, white bands and cards —
three ways of answering "what is a section".

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
UI — and that now includes a mock of somebody *else's* product: the Storefront
Launch scene draws a Slack channel, whose header rule, AGENT badge, unfurl bar,
composer field and window edge are all Slack's chrome. The `NO-RULES` audit in
`tools/audit.js` exempts those subtrees by name and must otherwise return 0.

**Consequences to remember**
- Status is a tinted fill (`ALLOWED` / `DENIED` / `NOT GRANTED`), never a
  bordered chip.
- Secondary buttons are a soft fill (`--wash-2`), never an outline.
- **A section is a fill, full stop** — no shadow either. A white card on a grey
  page is already a separate object; a shadow under it only softens the edge it
  was meant to define. Shadow is reserved for things that genuinely float above
  the page: the header, and pills sitting on a white ground.
- Emphasis is **colour on the phrase**, not an underline (§3).
- Diagrams: if captions already narrate the flow, the connectors are redundant.
  The parallel-work figure says "You ask once → Four tasks, each in its own chat
  → Each chat reports back", so the lines came out and a tray groups the cards.

**The one exception, and how to earn it.** The Shared-workflows ladder separates
its rows with a 0.5px rule and marks each with a 4px colour bar. That came from a
supplied Figma with an explicit instruction to implement it token for token, so
the exception is recorded here and `.step` is named in the audit's exemption list
— not left as a quiet violation of a rule the audit still claims to enforce. Any
future exception works the same way: it is written down, it is scoped to one
component by name, and the audit keeps returning 0 for everything else. A line
that appears because a layout would not read without it is still a bug.

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

## 13. A section figure shows the claim happening

Sections 0–12 are about the page. This one is about the **picture beside the
words**, which is where most of the rework on this page has gone. Every rule
here cost a round.

### 13.1 A figure shows the claim happening. It does not restate it.

The step is called **Run** and its claim is that Okou *"does the job in the
open"*. The panel beside it was three finished paragraphs. A transcript proves
work **happened**; it can never show work **happening**, so nothing was in the
open. The fix was not better paragraphs — it was making the run play.

Ask of any figure: *what does a reader see change?* If the answer is "nothing,
they read it", it is a caption with a border, not a figure.

### 13.2 One scene with states, not N pictures

Run · Save · Hand over · Automate had four mocks on four painted panels that
slid past one another. Four pictures: nothing carried over, the reader
re-started at every step, and the section's own claim — *one chat becomes
something the team keeps* — was described four times and shown zero.

A multi-step figure is **one scene**. The same objects persist and move; a
single attribute (`data-step`) is the only thing that changes; every object
reads it and CSS does the rest. If an object exists in step 2 and step 4 it is
the *same element*, not two.

### 13.3 Abstracted product UI — not a screenshot, not a diagram

Two failures, opposite directions:

- **Too abstract.** A spine-and-nodes flow and a terminal log were both read as
  *"跟 VM0 的产品看不出太大关联，就是贼抽象"*. Geometry that could belong to any
  product belongs to none.
- **Too literal.** A screenshot in a browser chrome goes stale every release,
  cannot be translated, shows detail nobody is being asked to read, and looks
  like every other SaaS page.

The register in between: **the product's own chrome** — its cards, chips,
radii, connector marks and accent — with the prose that carries no meaning
**reduced to bars**. Recognisable as ours, readable at a glance, and it never
goes stale because it was never a screenshot.

### 13.4 One gesture per beat, and everything else stays still

Name the gesture in one sentence before building it. In the workflow scene:
the run *lifts, straightens and is renamed* at Save; the team *arcs in* at Hand
over; a schedule *snaps on* at Automate. Nothing else moves during those
moments. Motion spread evenly across a figure reads as noise, and the one thing
that mattered gets no more attention than the four that did not.

### 13.5 A gesture must deliver something

The save card flew back toward the workflow list and **nothing arrived** — an
object leaving with nothing landing is an empty gesture, and the reader is left
looking at where it used to be. Whatever moves must change something at the far
end: a row appears, a count goes up, a state flips.

### 13.6 The ground serves the objects, and is re-decided when they change

The four painted grounds were tuned when a single opaque mock covered most of
the panel. The moment the objects started floating, twice as much artwork
showed and every ground went from atmosphere to **picture** — the brick wall
and the blue figure both won the composition outright, at any veil. Raising the
veil further only made a muddy photograph.

A ground is not a constant. If the thing standing on it changes shape, the
ground is re-decided, and "make it darker" is not a re-decision.

### 13.7 Tie a figure to the page with a token, not with adjacency

The workflow scene's field is built from `--step-run / --save / --hand /
--auto` — the **same four hues as the step markers in the left column**. The
two halves of the ladder are now related by a token rather than by being next
to each other, which is the only kind of relationship that survives someone
editing one of them.

### 13.8 A physical metaphor is a different register — choose it on purpose

Sticky notes, paper, rotation and print shadows read as the physical world.
Tong, on the version that used them: *"变铅纸的感觉更像是物理世界"*. That
register is available for a brand moment; it is wrong for a figure whose
subject is software, and mixing the two makes the software look like a prop.

### 13.9 Check the geometry in every state, not only at rest

Two collisions shipped inside one week: a card and a list overlapping at step
4, and a sticky stage that resized between its own beats — which fed back into
a layout value derived from its height and stopped the last beat activating at
all. A figure with N states has N compositions, and each one is looked at.

---

## 14. A section has an attention budget, and it is a number

Tong, on the security block: *"整体这部分太重了，感觉其实不需要，应该是一个 btw
的感觉"*. Every instinct says to go and restyle a beat. Measure it first.

It was **4.05 screens of scroll and 23.6% of the whole page** — the longest
section on the page, longer than the one that carries the product's main story,
and it was a *reassurance*. That number is the finding. No amount of restyling
any single beat would have produced it, and with it the fix is obvious rather
than a matter of taste: the section was built at the scale of a feature tour.

Three things fall out of it, and `audit.js` §7 prints all three.

**Screens, not pixels.** A section is heavy relative to the window it is read
in, and 2.2 screens is the cap for anything that is not the hero. Past that,
a reader is scrolling through one idea for longer than it takes to state it.

**Share, not size.** A section can be short and still be wrong, if the thing
around it is shorter. The comparison is what makes "too heavy" checkable.

**The page asks twice.** The hero and the closing band. That is the whole
budget. Five in-section CTAs — *Set up an Agent, Try an approval gate, Run your
first task, Connect a tool, See a run trail* — are what turn a section into a
second product tour, and the reader who was told to act five times has been
told to act zero times.

A section over the cap on purpose is fine; it goes in the check's
`LONG_ON_PURPOSE` list **with its reason**, the way every other exception in
this repo is written down and scoped by name. Today there is one: the workflow
scene at 3.13 screens, because it is the page's subject.

### 14.1 "Do not show it" and "do not lead with it" are different edits

Two of the five beats were cut in the same round, from two notes one line apart:

- 「这个也太多了，**不需要表达**」 → the credential-injection card is gone. No
  trace, no clause, no smaller version of it.
- 「这个也是，**不需要重点提**」 → the activity trail keeps its sentence, in the
  closing note, and loses its picture, its heading and its button.

Reading both as "delete" throws away a claim the reader wanted. Reading both as
"shrink" leaves an implementation detail on the page after being told twice it
did not belong. The words are different; the edits are different.

---

**On being asked to redesign.** *"重构"* means replacing the **argument** —
what the picture is trying to prove — not restyling the wireframe. Changing
type sizes, spacing and easing on a layout that was never re-decided is
decorating. And when the ask is visual, build it and let them look: arguing
about quality in prose costs a round and settles nothing.
