# Agent skills this design work draws on

Surveyed 2026-08-17 while rebuilding the page. Recorded so the next pass starts
from the same references instead of re-searching.

---

## Loaded and used

### `anthropics/skills` → `skills/frontend-design/SKILL.md`

The direction skill. Process: brainstorm → plan a compact token system
(colour / type / layout / **signature**) → critique the plan against the brief →
build → critique again.

Its most useful section is the **AI-slop calibration list** — the three looks
AI-generated design converges on regardless of subject:

1. warm cream background (near `#F4F1EA`) + high-contrast serif + terracotta;
2. near-black + a single acid-green or vermilion accent;
3. **broadsheet layout: hairline rules, zero border-radius, dense columns.**

The pre-rebuild page was squarely #3. Both of Tong's rounds of feedback —
"the lines are messy" and "numbered labels look AI-generated" — are that entry
arriving from a human instead. Also from this skill: structural devices
(numbering, eyebrows, dividers) must **encode something true** about the content,
and "spend your boldness in one place."

Same repo, also useful: `theme-factory` (ten ready token themes),
`brand-guidelines`, `canvas-design`, `web-artifacts-builder`.

### `microsoft/skills` → `.github/skills/frontend-design-review/`

Two modes: review an existing UI, or create one. Three pillars — frictionless
insight-to-action, quality craft, trustworthy building — plus
`references/quick-checklist.md`, `review-output-format.md`,
`review-type-modifiers.md`, `pattern-examples.md`. Used as the framework for the
written critique (issues sorted blocking / major / minor). Credits Anthropic's
`frontend-design` as its own inspiration.

### `bertbertson/premium-microinteractions-skill`

The motion spec, in numbers. Adopted wholesale into
`src/css/system.css` §1 and documented in `docs/motion.md`:

- timing bands — hover 200–260ms, press 90–140, modal in 320–400 / out 240–300,
  page 400–550, scroll reveal 500–700, micro-success 500–800;
- approved curves — `cubic-bezier(.16,1,.3,1)` premium, `(.22,1,.36,1)` snappy,
  `(.25,1,.5,1)` elegant, `(.34,1.3,.64,1)` subtle spring;
- **forbids** `linear`, `ease`, `ease-in`, `ease-out`;
- core rules — animate only transform/opacity, ≥58fps, ≤6 simultaneous animated
  properties, honour `prefers-reduced-motion`;
- a weighted 0–5 score where scroll behaviour carries the most weight (0.22).

### `greensock/gsap-skills` (official GSAP)

`skills/gsap-core | timeline | scrolltrigger | plugins | performance | react |
utils`. The reference for scroll-driven work — ScrollTrigger's
`start/end/scrub/pin/toggleActions`, `clamp()` positions, `ScrollTrigger.refresh()`
after layout changes.

**Decision: patterns adopted, library not installed.** Timeline-with-stagger and
scroll-progress thinking shaped `app.js`; GSAP's 72KB + ScrollTrigger's 44KB
would be a runtime dependency this page does not need. If pinning or true
scrubbing is ever required, bundle both **locally** under `site/assets/vendor/`
rather than hot-linking a CDN.

## Indexed, not used here

`google-labs-code/design-md` and `stitch-loop` · `uxKero/anydesign` (image / URL
/ Figma → a `design.md` system) · `expo/building-native-ui` ·
`microsoft/frontend-ui-dark-ts` · `rampstackco/claude-skills` (59-skill website
lifecycle) · `zarazhangrui/frontend-slides`.

## How to search for more

```bash
gh search repos --topic agent-skills --sort stars --limit 25
gh search repos --topic claude-skills --sort stars --limit 25
gh api repos/OWNER/REPO/git/trees/main?recursive=1 --jq '.tree[].path'   # list a repo's skills
```

Caveats found the hard way: multi-word `gh search repos "some long phrase"`
usually returns nothing, and `gh search code --filename SKILL.md` times out with
HTTP 408. The aggregate indexes worth grepping are
`VoltAgent/awesome-agent-skills`, `ComposioHQ/awesome-claude-skills` and
`travisvn/awesome-claude-skills`.
