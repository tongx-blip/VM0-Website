# How other landing pages build the "how we differ" card set

Done 2026-08-24, before rebuilding `.versus`. The brief was: our four
comparison cards are too uniform in form, and the 2×2 arrangement is a
monotonous way to interact with them — go and look at how other products
do this first.

Six pages were fetched and rendered rather than recalled: sierra.ai,
warp.dev, attio.com, cursor.com, linear.app, raycast.com.

## What was found

| | Section shape | Card treatment | Interaction |
|---|---|---|---|
| **Sierra** | four across, one row | the card is *only* the image well — heading and body sit free on the page ground below it, with no fill behind them | none on desktop; a drag carousel appears on narrow widths |
| **Warp** | vertical rail left, one large stage right | rows expand in place; the active one gets a thin progress underline | auto-advancing |
| **Attio** | sticky left rail + full-scale bands | no cards at all; the rail lists all five claims, active in full ink with an accent tick, the rest dimmed | scroll drives the rail index |
| **Cursor** | alternating full-width bands | no cards; image and text swap sides band to band | scroll only |
| **Linear** | one very large stage + numbered sub-rail | no cards; a real product screen with one UI element lifted forward | sub-rail |
| **Raycast** | asymmetric bento — one wide card, two half cards | **three different internal layouts in one section**: text-left/image-right, image-above-text, centred-graphic-above-text | hover |

Not one of the six uses a grid of equal quadrants.

## The three findings that decided our direction

**1. Every one of them lets the image bleed off an edge.** Sierra's panels
are cut mid-component, Raycast's run off three sides, Attio's product
screen is clipped left and right. That crop is what makes them read as a
fragment of a running interface. Ours floated whole inside padding, which
is what made them read as diagrams.

**2. Raycast varies the internal layout, not just the footprint.** This is
the actual cure for sameness. Four cards at four different widths but with
the same insides still look like one template stretched — the eye reads
the internal arrangement before it reads the box.

**3. The rail-and-stage pattern is the strongest one here and we still
cannot use it.** Warp and Attio both get an entire section out of one
persistent index plus one big stage, and it would suit four named
comparisons well. But this page already has a rail-driven stage — the tab
reel above. A second one would fix this section and make the page repeat
itself.

## What our own section was doing wrong

Three of the four pictures were the same component: a vertical list of
avatar + label + right-aligned timestamp, with different strings. Only the
connector hub stood apart.

Worse than repetitive, one of them argued against its own sentence. The
Codex card claims **parallelism** — "several AIs get more done at once" —
and illustrated it with a single sequential column.

## What was built

A pinwheel on twelve columns: 7+5, then 5+7. No row-spanning, so nothing
is fragile; every card differs in width from its neighbour and from the
card above it. Band height is constant within a row and different between
rows — varying it inside a row makes the two text blocks start at
different heights, which reads as a mistake rather than as rhythm.

Then one device per claim, each a different kind of picture:

- **vs Codex** — three task lanes running side by side with a fourth cut
  off at the right edge. Parallelism had to be visible as *width*.
- **vs ChatGPT** — the shipped artifact itself: a published page with its
  URL, numbers and chart, and the activity trail as a small panel lifted
  over its bottom-left corner. The composite Attio and Linear both use.
- **vs Zapier** — the connector hub, unchanged. It was already the one
  card doing its own thing.
- **vs Claude Code** — a dark terminal running off the left edge with the
  shared team surface overlapping and outranking it. The only card that
  draws the alternative's own form, because here the contrast *is* the
  claim.

Every one of them bleeds off an edge.

## The interaction

The sameness complaint and the interaction complaint are the same
complaint: four identical things that all just sit there.

Hover is out — these cards are not links, and a hover affordance promises
a click that does not exist. A rail is out for the reason above. So the
scroll position is the interaction: each card plays its own sequence once
as it arrives, and because the pinwheel puts them at four different
heights they fire one after another rather than together. Each is a single
state change, not a loop — an entrance may be a performance, an idle may
not.

## One thing worth flagging

Several of the comparison-page write-ups surveyed alongside this
(apexure, poweredbysearch, reviewflowz) advise against putting competitor
logos and brand marks on your own page, on trademark grounds. Showing both
marks is a deliberate call already made here — a card with only the
competitor's logo is describing them, not comparing — and naming
competitors on a landing page is ordinary practice. Noting it as a factor,
not as an objection.
