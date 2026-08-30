# Changelog

Newest first, dated. No version numbers: this page gets revised continuously and
a counter would only ever grow. Each entry records what changed **and what was
wrong**, because the failure modes are the useful part.

## 2026-08-31 · the permission card, checked against the source line by line

Tong: *"我想问一下，option C 这个是我们真实的 UI 界面吗"* — a fair question, and
the honest answer before checking was "the shape yes, the interaction I added
no". So it got checked, against `vm0-ai/vm0` rather than against memory.

### what was right

`PermissionActionCard` in
`turbo/apps/platform/src/views/okou-page/chat-body-cards.tsx`, and every line
of it matches what this repo draws:

| | product | here |
|---|---|---|
| shell | `min-h-[88px] flex-col gap-3 rounded-lg border-border/70 bg-background/85 p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between` | same, including the `flex-col` that made D's narrow cell stack |
| icon | `h-10 w-10 rounded-lg border-border/70 bg-muted/40`, mark at 22 | same |
| title | `truncate text-[0.9375rem] font-medium` | same |
| detail | `mt-0.5 line-clamp-2 text-sm leading-5` muted | same |
| duration | `h-8 w-[116px] rounded-lg text-xs` | same |
| confirm | `h-9 rounded-lg border border-border bg-background hover:bg-state-hover` | same — **neutral, not the brand primary** |

Strings too, from `i18n/locales/en-US/common.json`: `connectorTitle`
`"{{connectorName}} permissions"`, `actionDescription`
`"{{action}} {{permissionName}}"`, `allow` `"Allow"`, `updated`
`"Permissions updated"`.

### what was wrong, and it was in the part I invented

The card is a faithful copy. **The interaction added for direction C was not**,
and it is the only part of any direction that was made up rather than read:

* **`"This time only"` does not exist.** The real set is
  `USER_PERMISSION_GRANT_EXPIRES_IN_OPTIONS = ["1h","24h","7d","always"]`
  (`signals/permission-allow/permission-grant-expiration.ts`), labelled
  `1 hour` / `24 hours` / `7 days` / `Always` in
  `authorization.permission.durationOptions.*`.
* **`7 days` was missing**, and it is real.
* The default is `1h` (`DEFAULT_USER_PERMISSION_GRANT_EXPIRES_IN`); C opened on
  the second option instead of the first.
* The expiry belongs **on the card**, in amber
  (`mt-0.5 text-xs font-medium text-amber-700`), using
  `chat.permissions.expiresInHours_one` — not on a mono line underneath it. The
  line underneath was also doing two jobs: half of it was a product string and
  half was marketing. It says one thing now, and the duration is on the card.

All four fixed. C cycles `1 hour → 24 hours → 7 days → Always` and the saved
card reads `✓ Permissions updated` with `Expires in 7 days` in amber.

### the one string still unverified

`campaign-budgets.write`. The connector catalog needs auth
(`api.vm0.ai/api/connector-catalog/google-ads/permissions` → `UNAUTHORIZED`) and
the only Google Ads entry in the repo is a test fixture with `permissions: []`.
The *format* is right — Gmail's `messages.write` appears in the CLI's own help —
but the specific scope is not sourced, and it is written down here rather than
left to look verified because everything around it is.

**A rule that came out of this:** a mock can be right in every part that was
copied and wrong in the one part that was invented, and the invented part is
invisible precisely because the rest is accurate. When a mock gains an
interaction it did not have, the interaction needs its own source.

Gate: 0 axe violations at 1440 and 390, no overflow, no clipped text.
Republished as v2.

---

## 2026-08-30 · the control section, four directions from the wireframe back

Tong: *"我们最初的时候是基于这个 Wireframe 来改的。现在看起来图片这个 section 我们
之前给做复杂了。其实讲的事情很简单。就是关于 agent 权限的问题 … 现在网站上你之前做
的，完全不符合我们的期望。"* Plus the R2 brand illustrations, and feedback 16–20.

**https://okou-control-options-zxll.sites.vm0.io** — four directions, each the
real section at real size on the real stylesheet. Nothing merged.

### what the wireframe actually says

Going back to it is the whole instruction. The origin of this section is **one
real product screen with four short claims around it** — the Agent's
Authorization tab, rows reading `Google Drive · Read files in a shared folder ·
Allowed` and `Gmail · Send mail · Denied`. It is one idea, shown once.

What is live is a 548px dialog, a browser card, two long captions and a closing
note, at **1.25 screens**. Every direction here is 0.73–0.83.

### the content, since he asked

The heading and the lede are the wireframe's and are **unedited** — the lede's
second sentence, *"Permissions follow the person, not the automation"*, is the
most differentiating line in the section and it happens to be exactly what the
product does: `permission-request` updates *the current user's* connector
grants. What was cut is everything after it:

| shipped | here |
|---|---|
| "Granular permissions." + 3 sentences | gone — the card *is* the claim |
| "Isolated execution." + microVM, 3 sentences | half a line, and `microVM` said as **cloud computer** (17) |
| closing note: activity trail + open source, 3 lines | the other half of that line (19) |

Nothing new is claimed. Every sentence that survives is a shorter version of a
sentence that was already on the page. **`microVM` is the one word changed**,
and 17 asked for it.

### the drawings are in the R2 register now, not this repo's

The illustration style arrived with the brief and it is not the hand-drawn ink
spot this repo already had: flat vector, one uniform black outline, geometric,
a character with an orange face, a cobalt beanie and a lime jumpsuit, no noise,
tonal shadow only. Two spots were generated to match — `spot-permission-key.png`
(the person holds the key and keeps the ring; the agent is the orange cube,
waiting at a door it cannot open) and `spot-cloud-computer.png` (17, literally).

`nano-banana-2` matched the reference first try on a **raw** prompt. The style
compiler has to be bypassed: `--prompt` routes into one of the house styles and
`image-style:vm0-illustration` is the *old* register, which is what produced the
ink spot the brief supersedes. Both come back on a flat cream ground, which the
page does not use — flood-filled from the border and trimmed to the ink.

### the four

| | route | what it is |
|---|---|---|
| **A** The ask, and nothing else | 抽象模拟真实产品 · 0.83 | Three lines of conversation and the card that stopped it. No columns, no captions, no drawing, no window chrome |
| **B** The drawing says it | 插画 · 0.76 | The key picture at full size, the claim and the card beside it |
| **C** You allow it, here | 交互 · 0.73 | The card is **live**: pick a duration, press Confirm, and the grant appears with your name and your hour |
| **D** Asked, granted, gone | 三格 · 0.79 | Three frames, one line. The only one that *shows* isolated execution |

### found while building

**A third of a card is not a card.** D's middle frame is ~380px and the row
form of `PermissionActionCard` has a ~450px min-content — the title is
`nowrap` and the scope is a long string, so it rendered as `Googl…` over three
wrapped lines. The product stacks below `sm`; the cell is narrower than `sm`,
so it stacks. Not a special case, the same rule the phone gets.

**A state that is markup cannot be toggled twice.** C's confirm first swapped
`.pcard__c`'s innerHTML, which orphaned the listeners bound to the nodes it
replaced: "Ask again" put the controls back and nothing answered them. Both
states are in the markup now and CSS shows one — which is also the only version
that renders correctly with JavaScript off, as the other three need.

**The review page was still loading Google Fonts.** Built before the site was
self-hosted Roobert, so the four directions were being judged in Archivo.

Gate: 0 axe violations at 1440 and 390, no horizontal overflow at either, no
clipped text. `site/index.html` is untouched; the two new illustrations are the
only thing added to `site/`.

---

## 2026-08-30 · the figures strip had 18 over and 28 under

Tong, on the `#outputs` outcome strip: *"这个文字上边的空间和下边的空间要一样高"*.

Measured before touching it, and he is reading 10px: **18px from the window's
bottom edge to the top of the letters, 28px from the bottom of the letters to
the edge of the band.** Same on all seven tabs.

### two gaps, two declarations

Above the strip, the frame's `row-gap: clamp(10px, 1.2vw, 15px)`. Below it, the
strip's `padding-bottom: var(--o-fpad)` — the frame's general air, borrowed
when the strip was given the frame's bottom padding to carry. 15 against 27.36.

Two values that are meant to look identical have to **be** the same
declaration; derived from different ones they are equal only by coincidence,
and these were not close. Both are `--o-mgap` now, one token used twice, set to
21 at 1440 — the midpoint of the two it replaces, so the frame keeps its height
and the windows keep theirs.

### and below 1080 it was four times worse

`display:block` throws a grid's `row-gap` away. In the stacked layout the strip
had **nothing** above it and the frame's padding plus its own underneath: 2px
over, 35px under. The frame drops its bottom padding there and the strip
carries the air on both sides, the same way it does on the grid.

| | before | after |
|---|---|---|
| 1920 / 1440 | 18 / 28 | 24 / 21.6 |
| 1280 | 16 / 26 | 22.2 / 20.8 |
| 1024 | 2 / 35 | 17.4 / 17 |
| 390 | 2 / 33 | 15 / 14.6 |

Every tab is now within 2.4px and most within 1. The residual is the words: an
ascender in `nightly` or a descender in `Waiting on you` moves the ink by up to
3px, and no single value equalises seven different strings at once. A 1px
correction was available and left out — it is smaller than the thing it would
be correcting for.

### the probe was wrong three times before it was right

`tools/probes/ometrics-air.js`. Three faults, each of which reported the strip
as **balanced** while it was 10px out:

* **It measured the line box.** A line box is taller than the letters and the
  letters are not centred in it. Canvas `actualBoundingBoxAscent/Descent`.
* **It reconstructed the baseline from half-leading.** The strip is a
  baseline-aligned flex row, so a child's box height is not its line-height and
  the arithmetic landed several pixels out — enough to invert the answer. A
  zero-size `inline-block` sits with its bottom margin edge on the baseline;
  ask the DOM instead of deriving it.
* **It sampled before the strip landed.** `.ostage.is-live .ometrics li` holds
  a `translateY(6px)` until the run finishes, and 6px is most of the error.
  Worse, the first fix polled the transform on the scene captured *before* the
  tab swap, so it returned immediately against the outgoing scene — three runs,
  three different answers, all confident.

The answer was only settled by scanning the painted pixels of a screenshot and
finding the same 18/28 that Tong's crop shows. **When a probe and a screenshot
disagree, the screenshot is right.**

Gate: `tokens.py`, `check-html.py`, `scopes.py`, `rules.py` 0 · 154 rules, 71
gate sections, 11 audit blocks, every pointer resolves · `audit.js` §1–§11 pass
· axe 0 in light and dark · six widths measured.

---

## 2026-08-29 · one typeface — Roobert everywhere, and it brought its own monospace

Tong: *"把整个网站的字体全部换成 Roobert TRIAL … 检查网站上的所有的字体，全都换成
Roobert TRIAL"*, then the twelve static cuts and the variable font.

### what was actually there

Audited before touching anything. **Six families, seven declarations**, and
three of them were only fallbacks for each other:

| | rendered on | role |
|---|---|---|
| Instrument Sans | 434 elements | `--fb`, prose |
| IBM Plex Mono | 161 | `--fm`, utility text |
| Archivo | 85 | `--fd`, headlines |
| Noto Sans | 33 | `--vm-font`, the vm0 app mock |
| Inter | 8 | `.ladder`, left over from a supplied reference |
| system-ui | one mock | `.slackui`, Slack's own UI stack |
| Cormorant Garamond | — | `.tpl__h1` / `.tpl__quote`, the artifact preview |

All seven are Roobert now, mocks included. Two stacks left on the page.

### the variable font has a MONO axis, and that is the whole story

`RoobertTRIALVF.ttf` carries `wght` 300–900, `ital` 0–11 **and `MONO` 0–100** —
the foundry ships a monospace of the same design, as named instances from
`Mono Light` to `SemiMono Heavy`.

So the page did not have to give up its third register. `--fm` is the *same
file* at `MONO:100`, declared as a second `@font-face` on the same URL. Labels,
timestamps, durations and figures keep a fixed advance: `LAUNCH CAMPAIGN` /
`0:01` still line up across four cards, and `MING · 09:12` is still an
instrument reading rather than prose in small caps. I had already written the
fallback plan — proportional plus `tabular-nums` — and it was strictly worse.
`tabular-nums` stays anyway: the axis fixes the advance, the feature fixes
which figures get drawn, and they are not the same switch.

### shipping the VF, not the statics

Two reasons, and the first is a trap:

* **The statics are stamped 650 and 750**, not 600 and 700. Every
  `font-weight:600` in the stylesheet would have landed on a neighbour and the
  page would have been subtly heavier everywhere, for no reason a screenshot
  explains. The VF is continuous, so 600 is 600.
* One axis file covers what twelve files covered, plus the mono.

Three passes in `tools/build-fonts.py`, each measured:

| | |
|---|---|
| supplied VF | 723 KB ttf · 253 KB woff2 |
| pin `ital` 0 — there is no `font-style:italic` in this page's CSS | 165 KB |
| subset to Latin, Latin-1, Latin Ext-A and the punctuation blocks | **64 KB** |

One request, 64 KB, replacing six Google-hosted families across two extra
connections. The Devanagari, CJK and Hangul in the language menu were never in
Archivo either and still fall back to the system face.

### what moved, and what did not

Roobert's metrics are close enough to Instrument Sans that **three elements on
the whole page changed line count** — two quote cards and the footer
disclaimer, each by one line, none of them clipped. Measured by diffing
`round(height / line-height)` for every text-bearing element against `main`
rather than by looking.

Everything else held: no horizontal overflow at 1440 or 390, no newly clipped
text (`.slk__unfurl-u` at 390 is an ellipsised URL and is identical on `main`),
audit §1–§11 pass, axe 0 in both themes.

### the three pinned surfaces

`RULES P1` pins a product mock to the product's own values, and three surfaces
were pinned to a *typeface*: the vm0 app window (Noto Sans), the Slack window
(system-ui) and the generated-website preview (Cormorant Garamond). All three
are Roobert now, which is what was asked for. The serif is the one to watch —
it was the only signal that the artifact preview is a *different* design, and
`.tpl` is exactly the case `K4` carves out. One line to put back.

### licence

Roobert TRIAL is Displaay's evaluation cut. `site/assets/fonts/roobert-var.woff2`
is published on GitHub Pages and directly downloadable, which is outside what a
trial licence covers. Recorded in `src/fonts/README.md`; the originals are
gitignored and only the built subset ships. Not a blocker — the site owner's
call — but it should be a retail web-font licence before this is the public
site for long.

Gate: `tokens.py`, `check-html.py`, `scopes.py`, `rules.py` 0 · 148 rules, 69
gate sections, 11 audit blocks, every pointer resolves · `audit.js` §1–§11 pass
· axe 0 violations in light and dark across 8 samples each, other than the known
`.wfo--list` fade on the first post-walk sample (QA §4af, still open) · 1440 and
390 clean.

---

## 2026-08-30 · the conversation plays like a conversation

Tong: *"你检查一下所有tab下的对话流，是否出现同样的问题… 现在有的tab的对话流，
最后一个bubble被盖起来了。而且图二chat内容应该从prompt box的上边缘出现，中间不应
该有space。检查所有tab修复问题"*

Both faults, on all seven tabs, and the fix for yesterday's one was making the
first of them worse.

### What was actually wrong

**A message that had not been said yet still held its space.** The rows are all
in the DOM from the start (N2: the resting state is the finished conversation)
and the loop reveals them with `clip-path` — at **full height**. In a
bottom-anchored list that means the un-arrived rows hold the floor and the
conversation plays in the top half, so the messages that HAD arrived were the
ones pushed off the top. 130px of reserved nothing under the newest message.

Yesterday's fix — top-anchor, then lift by the overflow — was treating the
symptom. Both are gone: **un-arrived rows collapse**, and `flex-end` then does
the entire job by itself. Each message appears on the composer's edge and lifts
the ones before it; once they no longer fit, the earliest go off the top. That
is a channel, and it needs no measurement, no hold and no JS at all — the whole
`slk lift` module is deleted.

Collapsing is scoped to `.is-live`, so with no JS and under reduced motion every
row is still there at full height. Verified: 6/7 and 3/4 rows visible per scene
under reduced motion — the missing one is the typing indicator, which is correct
in a finished conversation.

### The space above the composer

`.slk__ghost` — "Okou is typing…" — was a **fixed 17px row outside the list**,
reserving 19px whether or not anyone was typing, on every tab, always. That is
the gap in the second screenshot. It is a message now: inside the list,
collapsed when idle, growing when it types. Plus `.slk__list` lost its
`padding-bottom:4px` and `.okw__composer` its `margin-top:10px`.

Both readings of the window had it — four tabs are the Slack channel
(`.slk__list`), three are Okou's own (`.okw__list`), 19px and 14px respectively.

### Two process notes, because both cost a round

**A probe that measures a mid-animation frame reports the choreography as a
bug.** The first sweep flagged "lastClipped 12" on every tab at every width —
that 12 was the drop, mid-transition, doing exactly what it was for. A constant
that does not vary with the viewport is not an overflow.

**Then I stopped measuring and took two screenshots**, one early and one late,
and the actual fault — an empty bottom half — was visible immediately. It had
been in front of me in Tong's own screenshot the whole time.

### One thing I broke and put back

Deleting the drop machinery with `re.sub(r'.*--slk-drop.*')` also removed two
lines of an **unrelated** component that happens to use the same token name —
`--slk-drop:34px` on the workflow scene's Slack post, and its use in that
element's clip-path. Caught by reading the diff, restored, verified 0 in the
diff afterwards. RULES R2 is about slicing between anchors; this is the same
mistake with a regex, and the same fix: read the diff before building.

### Gate

`tokens.py` 0 · `check-html.py` balanced · `scopes.py` 0 · `rules.py` 153 rules,
all pointers resolve · `audit.js` §1 §6 §7 PASS · axe **0 violations**, 5 light
and 3 dark · all seven tabs settled clean at 1024 / 1120 / 1240 / 1440 / 1920
and 390 — nothing clipped, gap 0 everywhere.

---

## 2026-08-29 · the missing shadow, and the composition I broke looking for it

Tong: *"你之前那个覆盖关系，我觉得挺好的。我说的 bug 是你把阴影给去掉了。它也不是
阴影去掉，是你把 frame 缩小之后，阴影被截断了。"*

Right on both counts, including the mechanism.

### `inset(0)` deletes a box-shadow

`clip-path: inset()` resolves against the **border box**, and a `box-shadow` is
painted outside it. So the landed state of the Slack card —

```css
.wfsc[data-step="1"] .wfo--post.is-in{ clip-path:inset(0); }
```

— which reads as "clipped to nothing, everything visible", was cutting the
shadow off at the card's own edge. The card rendered as a flat white rectangle
with four hard corners, sitting on the mat beside two cards that lift off it.
It is the frame being shrunk to the card, exactly as he described it.

The bleed is read off the shadow rather than picked. `0 2px 10px` reaches five
pixels sideways and up; `0 26px 50px -26px` reaches 26 − 26 + 25 = 25 down.
`--slk-bleed:10px` / `--slk-drop:34px`, stated once and used by all three
clip states so the closed one still collapses to zero height at the top edge
and the wipe is unchanged.

`tools/audit.js` **§11** now checks every clipped surface on the page against
its own shadow: it parses both, works out the reach per side, and fails when
the clip cuts inside it. Forced back to `inset(0)` it reports
`cut top 3px, right 5px, bottom 25px, left 5px` — which is the shadow, measured.

**Its first version was wrong in the way this scene keeps being wrong.** It
parsed the clip with `/inset\(([^)]*)\)/`, which stops at the first `)` — and
the first `)` in `inset(-10px -10px calc(100% + 10px))` is the calc's own. It
reported the fixed card as still broken. `tools/probes/wfsc-geometry.js` had
the identical bug and had been quietly measuring the closed card as open ever
since I added clip-reading to it yesterday. Both now walk brackets.

### and the composition was fine

I read the same frame as a lapping fault — the landing card sits over the run
card's header — pulled the two apart, moved the run card down 6.5cqh and
re-centred the beat. All of it is reverted: `.wfo--ask` 12/19, `.wfo--post`
15/19, `.wfo--run` 36/36 and every beat-2/3/4 translate back to what it was.

The lesson is cheap and I paid full price for it: **a flat rectangle and a
badly-placed rectangle look the same in a still.** Before restyling a
composition because something in it looks wrong, name which pixels are wrong.
`RULES F46` now says what it should have said all along, and the "a lap is only
available where the thing underneath can spare the strip" rule I wrote
yesterday is gone — it was a rule invented to justify a change that should not
have been made.

What stands from yesterday: `margin:0` on `.wfo` (the UA `<figure>` margin was
real, and it is why the ask sat 40px right of where it was drawn), `audit.js`
§10, the `.arti__dot` transform, the lanes' `align-items:flex-start`, and the
two deleted paragraphs.

`--slk-bleed` costs the composition nothing: the probe reports the same two
laps it did before the whole detour — `s1 askxrun 175/23`, `s1+ postxrun
199/29` — and beats 2, 3 and 4 are back to the numbers they shipped with.

Gate: `tokens.py`, `check-html.py`, `scopes.py` 0 · 146 rules, 69 gate
sections, 11 audit blocks, every pointer resolves · `audit.js` §1–§11 pass ·
axe 0 violations in light and dark across 8 samples each, other than the
known `.wfo--list` fade on the first post-walk sample (QA §4af, still open).

---

---

## 2026-08-29 · the header becomes an object, and a channel opens on its first message

Two notes, and a third thing found under one of them.

### The header

Tong: *"Header 的左右 padding 应该是固定的。然后我觉得 header 的高度可以稍微再高
一点点。然后我在往下滚动的时候，这 header 会收缩起来，让它的宽度直接缩减到我可以
承载下这个 header 里面这些 content 的宽度。Login 的 button 要不要加一条非常浅的
stroke？"*

| | was | is |
|---|---|---|
| inset | `max(--nav-pad, --edge − --card-gap)` — derived from the measure, so the wordmark sat a different distance from the window edge at every width and ~250px in at 2560 | `--nav-pad-x: 28px`. A frame's inset is a constant |
| height | 62 / 54 | **68 / 58** |
| floating | inset to the section cards — a second full-width band with air in the middle | **as wide as its own content**, centred |
| Sign in | plain text | a 14%-ink inset ring |

**The pull-in had to stay a transition.** `width: auto → fit-content` does not
interpolate, so the bar is not given a width — it is given an inset on both
sides, `50% − --nav-w-stuck/2`, and `left`/`right` were already the two things
the header animates. `--nav-w-stuck` is measured in `app.js` off the three
groups and written to the bar, never read back from it: stuck, the bar is
already the size of the last answer, so measuring it there ratchets (RULES
F23). It also measures **unstuck** — the class comes off for the read — and
uses rects rather than `scrollWidth`, whose integer floor over three
fractional groups came out 4px short and broke "GET STARTED" onto two lines.

The group `gap` went 16 → `clamp(18px, 2.2vw, 32px)`. At rest it only trims
the two `1fr` columns and is invisible; once the bar hugs its content it is
the only space between the mark, the links and the buttons, and at 16 they
read as one dense run.

**The stroke is an exception to S3 and it is written down as one.** A surface
on this page is a fill, never an outline — but Sign in is the one control in
the bar with no ground of its own, and on the stuck bar's `--wash-2` a
`--wash-2` fill is invisible, which is why it had been plain text next to a
filled button. It is an inset ring, so it adds nothing to a 38px control that
has to match its neighbour to the pixel, and it is a token, so it crosses into
the dark band with everything else. **Say if you would rather have the fill —
this is the one thing here that argues with a rule.**

### The channel opened on a cut-off message

Tong, for the second time: *"用户刚进到对应的 tab 的时候，中间的对话 chat bubble
不要直接就被截断。第一个 chat bubble 要显示出来，但是在对话的过程中，可以被下面的
bubble 推上去。"*

`.slk__list` was `justify-content:flex-end`, because a Slack channel hangs
from the bottom and because bottom-anchoring is what stopped the last message
painting through the composer (98px of overlap at 1120). The overflow is real
— 0 at 1000 and 1080, **97px at 1120**, 75 at 1180, 26 at 1440 — so
top-anchoring alone would just move the clip to the other end.

It starts at `flex-start` and is **lifted afterwards by exactly its own
overflow**, as a margin on the first row. Same end state, different arrival:
the ask is read, then the replies land on top of it and push it up. Three
things that took a try each:

- **The lift is a margin on the first row, not a transform on the list.** The
  list is the element whose `overflow` does the clipping; moving it moves the
  crop with it. A negative margin there changes no row's own height, so the
  measurement cannot chase the value it just wrote (F23).
- **Measure at the moment you apply it.** Read up front, during the hold, the
  rows were still arriving and the number came out 14px short — the last
  message stayed under the floor.
- **The hold starts on intersection, not at load.** Run at load, the 1.5s was
  spent long before anyone scrolled that far, so the channel was already
  lifted when it was looked at. That is the original bug, restored by its own
  fix.

Arrival is now `0` on all seven tabs at 1120, 1240 and 1440; settled, the last
message ends exactly on the floor.

### `.nav.is-dark` had never once run

Found while checking the header over the closing band. A whole second copy of
the header — five tokens, an IntersectionObserver, a computed `rootMargin` —
and **nothing in the markup carried `data-ground="dark"`**, so `darkGrounds`
was empty and the class could not be set. Confirmed against the live build
before touching anything: dead there too.

Two lines: the attribute on `#cta` and `.footer`. And the observer's midline
was `12 + 54/2` as literals — 54 stopped being the stuck height the moment it
became 58, so it reads the tokens now.

**No gate looks for a class that is absent**, which is why this survived. New
rule S13; the check is to grep for the attribute the observer looks for.

### Gate

`tokens.py` 0 · `check-html.py` balanced · `scopes.py` 0 · `rules.py` 151
rules, all pointers resolve · `audit.js` §1 §3 §6 §7 PASS · axe **0
violations** across 6 light and 4 dark samples · 390 and 1440, no horizontal
overflow, header verified at rest, floating, narrow and over the dark band.

---

## 2026-08-29 · the workflow scene's beat 1 was a layout bug, not an animation bug

> **Partly reverted the same day** — see the entry above. The margin fault and
> the lane fault below are real and stand; the section on the landing card
> lapping the run card's header is wrong, and the recomposition it describes
> was undone. The lap was never the problem.

Tong: *"这里的动画好像出 bug 了，你检查一下"* — a zoom on the ask card and the run
card growing into each other. And: *"这段文字删掉"* on the two closing paragraphs
in the ladder's left column.

### the collision was 40 pixels of user-agent stylesheet

`.wfo--ask` is the only `<figure>` in the scene. This page has **no blanket
element reset** — every figure class on it (`.tplwin`, `.oresult`, `.quote`)
zeroes its own margin, so nothing ever needed one. `.wfo` did not, and the ask
card kept the UA default `margin:1em 40px`.

A margin on an absolutely positioned box is **added to its inset** — `left`
and `top` place the margin box. So the card rendered at 40px right and 14.15px
below the `left:12cqw; top:19cqh` it was drawn at, and 40px right is exactly
the strip by which it lapped the run card's header. Every geometry number this
scene was tuned to over the last three rounds was measured through that offset.

Nothing about it is animation. It is static in every beat, in every browser,
at every width — which is why three rounds of screenshots went past it: the
cards *move*, so anything wrong with where they end up reads as motion.

`tools/audit.js` **§10** now sweeps every absolutely positioned box on the page
for a margin. `auto` is exempt, because that is the centring idiom. **First run
found the second one:** `.arti__dot`, centred on its data point with
`margin:-4px 0 0 -4px` — half its own width, which stops being half the moment
the dot changes size. Its neighbour `.arti__val` was already doing the same job
with `translate(-50%,-100%)`; the dot now does too, and lands on the same pixel
it did before.

### the landing card was decapitating the card that produced it

Separate fault in the same beat, and worse. The `#growth` Slack card lands
`z-index:3` over the run card — the note beside it argues that the newest thing
in the picture cannot sit under the card that produced it, and that a 1cqh
graze is the worst of both, so **lap or clear** (F9).

What it lapped was the run card's **header**: 137 × 60px over the icon, the
title *Creator shortlist*, and the `Public` tag. What is left is a `RUNNING`
tag floating over nothing on a card with no name. F9 says not to graze; it does
not say a lap is free. A body can spare a strip, an identity row cannot.

Beat 1 is really **two compositions** — the ask beside the run card, then the
message that replaces it — and only the first one had ever been composed. Both
now clear and both are centred in the canvas:

| | ask + run | post + run |
|---|---|---|
| group X | 15 – 15 | 18 – 15 |
| group Y | 13 – 14 | 14 – 14 |
| overlaps | none | none |

The ask and the Slack card share a **top** edge at 14cqh, the run card sits at
42.5cqh, and beats 2, 3 and 4 are **pixel-identical to before** — the run card's
base moved 3cqw / 6.5cqh and every later state absorbed the same amount in the
other direction. That is the whole point of rebasing rather than nudging: the
three beats Tong has already accepted did not move.

### the probe could not see either of them

`tools/probes/wfsc-geometry.js` reported `postxrun` in **all four** beats, so
the one real overlap was buried in three phantoms. Two reasons, both worth
keeping:

* It tested visibility with `opacity` alone. The Slack card is `opacity:1` and
  hidden by `clip-path` — deliberately, because it loops and axe composites an
  inherited alpha (QA §1). It now reads the clip and reports the box that is
  actually on screen.
* Writing `data-step` by hand does **not** stop the runner's timer; only the
  page's own scroll handler does. The loop took `is-in` back off the card
  between the write and the measurement, and the landing measured 0px tall —
  a probe returning a confident wrong number, which is the failure mode this
  scene has now produced three times. It parks the pin on the last step first,
  and reports `s1` and `s1+` separately.

### and one the gate found on the way out

Dark mode, `.lane:nth-child(1) .lane__s:nth-child(7) em` — 3.12:1, live on
`main`. `.lanes` was `align-items:stretch`, so each lane card was sized to the
**band** rather than to its content: the card's white surface stopped exactly
at the crop while its last row carried on for another 26px, over the band's own
dark ground. In light both grounds are near-white and nothing shows, which is
why six audits missed it. At `align-items:flex-start` the surface runs past the
crop and the row that gets cut is cut over the card it belongs to. All eight
lanes hold the same eight steps, so the crop is still a straight edge.

### the two paragraphs are gone

`.ladder__foot` removed from the markup, and its rules, its two tokens
(`--wf-foot`, `--wf-foot-lh`) and its narrow-width overrides with it. The steps
column is top-aligned with the frame now. Centring it was the other option and
it is wrong: the list is 326–379px depending on which step is open, so centring
would drift all four titles by up to 26px every time you scroll a step.

**Still open, and not mine:** `.wfo--list` fails contrast in dark **during** its
fade — `#181d22` on `#171c21`, 1.01, six nodes, reproducible on `main` on the
first audit after a full-page walk and clean in all 22 samples after it. It is
the fault QA §4p2 describes: an opacity fade over text is a contrast change.
The fix is the one `.wfo--post` already had applied to it — a clip wipe instead
of a fade — but that changes the entrance of a beat that was signed off two
rounds ago, so it is a call to make rather than a bug to quietly patch.

Gate: `tokens.py`, `check-html.py`, `scopes.py`, `rules.py` all 0 · 146 rules,
69 gate sections, 10 audit blocks, every pointer resolves · `audit.js` §1–§10
pass · axe 0 violations in light and dark across 22 samples each · 1440 / 390
no horizontal overflow · beats 2–4 unchanged to the pixel.

---

## 2026-08-28 · four directions for the control section, and the card was the wrong component

Tong: *"16我不确定你是否使用了真实的场景卡片？… 17.用云端电脑，意思是可以用个插画
的概念 … 现在主要问题是，设计太平淡了，就是简单的排版。如果你要用简单的排版方式，
那就对视觉要求非常高。但如果你用一种更新颖的交互方式，那就需要 ui 更加简洁 … 我要
看到的是高质量。你可以给我4个设计让我来选择"*

Nothing merged. Four directions at
**https://okou-control-options.sites.vm0.io** — each the real section at real
size on the real stylesheet, built by `tools/build-control-options.py`.

### 16 · he was right to doubt it

The shipped card was **the wrong component**. There are two permission surfaces
in the product and I used the one that is not a scenario:

| | shipped | the real one |
|---|---|---|
| component | `PermissionAllowPage` — the standalone page you land on from a link | `PermissionActionCard` — the card that appears **in the conversation**, mid-run |
| shape | 548px dialog, brand mark, greeting, target pill, 8 stacked parts | one `min-h-[88px]` row: icon, title, scope, duration, confirm |
| confirm | the **brand orange** primary | a **neutral bordered** button — `border-border bg-background hover:bg-state-hover` |

The orange confirm is the tell. A marketing page showing a security dialog with
the wrong button is claiming something about the product that is not true, and
"真实的场景卡片" is exactly the right words for what was missing: the shipped
one was a specimen on a slide, not a run that had stopped to wait for someone.
All four directions carry the in-chat card, with the product's own strings
(`"{connector} permissions"` / `"Allow {scope}"`) and the real scope from the
catalog API.

### 17 · a drawing, not a UI

The cloud browser card was still a rectangle of product chrome. It is now a
spot illustration in the page's own hand-drawn brand register, generated for
this: `site/assets/brand/spot-cloud-machine.png`. Six generations across four
models to get there — the first passes came back with a thick uniform sticker
outline and a desaturated palette, and the fix was to specify the LINE (thin,
irregular, ~3px at 1024, "not a marker") and the exact hexes rather than to
name a style. Image-to-image against the existing spots returns 500 on every
model, so the reference had to be described instead of shown.

### The four

| | bet | what it is |
|---|---|---|
| **A** The ask, in the conversation | simple layout, high craft | One product window cropped at the band edge, the conversation running up out of the frame. 1.09 screens |
| **B** The drawing carries it | simple layout, illustration-led | The spot at full size with the real card lapping its lower edge. 1.06 screens |
| **C** One machine, three states | newer interaction, simpler UI | No headings, no captions, no columns. One object, one sentence, three beats: asks → granted for an hour → destroyed. 1.17 screens |
| **D** The dark interlude | newer form, shortest | The page's one dark moment besides the CTA; the drawing on a lit sheet, the card hanging off it. **0.81 screens** |

### Found while building

**The chat mock's own bubbles were invisible.** `.ochat__bubble` is
`background:var(--paper)`, which works because the real window sits on
`--o-fill`. On a white card both bubbles disappeared. The product's actual
treatment is two different things — a `gray-100` bubble for the user, and
**transparent, no border** for the assistant — and drawing both as white
bubbles is most of why a chat mock stops looking like that chat.

**A crop is only a crop if the content is taller than the frame.** A's window
was 470px around 400px of conversation, so `align-items:flex-end` produced a
gap at the top rather than a cut. Measured: 542 > 470, `cropped: true`.

**The card had no mobile shape.** The product is `flex-col … sm:flex-row`; I
kept it a row at every width, and because the title is `nowrap` its min-content
is ~450px — the review page came out **102px wider than a 390 phone**. It
stacks now, exactly where the product stacks.

**A guessed `min-height` cut a sentence in half.** C's line box was `3.4em` and
the longest of its three sentences is four lines. The three now share one grid
cell, so the block cannot resize between beats either (F9).

**The gate found three a11y violations, all in the review chrome** — `h1` to
`h3`, no `<main>`, content outside a landmark. 0 violations after, in both
themes, at 1440 and 390.

Not merged, and `site/` is untouched apart from the new illustration.
## 2026-08-28 · four comparison cards become three — in the cards' own style

Feedback 21. The first attempt at this replaced the four cards with three flat
ones: a grey rounded rectangle, a thin line mark, a heading, a paragraph. Tong,
on seeing it: *"我之前那些设计 你全给改成啥了啊 风格差的也太大了吧？"* — and he
was right. It was generic B2B, it belonged to no page in particular, and it
cost 762 lines of working animated mocks to get there. Reverted, then rebuilt
inside the card language that was already here.

**What 21 actually asked for, and what it did not.** It asked for three cards
on one line and for less UI. It did not ask for a different design language,
and "更抽象" is not the same instruction as "make it look like everything
else". The card here — a live product window on top, the `X vs Okou` lockup,
the headline, the paragraph — is the page's own idiom, and a comparison card
without the product on it is a claim without the receipt.

**The merge is the part of 21 that was right, and the reason is in the copy.**
Card 1 said *"Codex helps one person with one coding task … your whole team can
work together in one place"*; card 4 said *"Claude Code lives on one engineer's
machine … turns one person's know-how into shared capability"*. One axis argued
twice. Merged onto the parallel-lanes window — which is that argument, drawn —
the set becomes three different questions: who it is for, what you get back,
how you tell it. Zapier's card names n8n and carries 21's natural-language
point; ChatGPT's is untouched.

Three at `span 4` fit the measure: 422px a card at 1440, 334 in one column
below 900, and the section goes 1.29 screens → 0.89.

**One rule got in the way and had to go.** `.versus > :nth-child(n+3)
.vs__viz{height:…216px}` existed to make the second row shallower than the
first. With everything on one line there is no second row, and the rule
out-specified the three-up override while sitting later in the file — so the
third window stayed 60px shallow and left a hole under its paragraph. That is
exactly the shape `audit.js` §9 was built for two entries ago; this time it was
found by measuring, which is faster.

---


## 2026-08-28 · two rules stopped being paragraphs

Tong: *"之前聊到的很多规则性的内容可以加进设计规则文档或者脚本里"*.

The prose side was already full — 133 rules indexed, and `rules.py` keeping
every `QA §…` pointer honest. The gap was the other half of the sentence: of
those 133, the ones that had actually drawn blood were still only readable,
not checkable. Two of them are checks now, and both found live bugs on their
first run.

**`tokens.py` · channel as fill / channel as ring.** `--ink-rgb` and
`--paper-rgb` are the shadow-and-scrim channels and do not swap with the
theme, on purpose. Painted as a shadow that is right; painted as a visible
surface it is a theme bug in the mode nobody screenshots. Four occurrences of
one mistake:

| | dark |
|---|---|
| `.ctrl__index li` | 1.09 |
| `.unlock` — no edge at all | — |
| `.par__bar`, the four parallel tracks | **1.01** |
| `.quote__bar`, under a comment saying it "holds the same weight against the card on both grounds" | **1.04** |

The last two were live on the page. The comment on `.quote__bar` was exactly
backwards, which is the argument for a check over a paragraph in one line.

Mocks are skipped (their chrome is pinned, P1) and so are gradients, which are
scrims — what the channel is *for*. First run also found **a dead `.chip`
rule**, **`.ocard` missing from the mock list**, and the **mobile nav drawer
opening 97% white in dark mode** under `--nav-ink` link text: about 2:1, on a
surface you only see by opening the burger on a phone at night. 8.92:1 now.

**`audit.js` §8 · a state rule must win its property.** A `.is-*` declaration
that loses the cascade does nothing, and it reads as a broken animation rather
than as CSS — which is why the avatar lift survived a screenshot review, and
why the `cut` hero variant rendered identically to the default while its CSS
read correctly.

The block took three attempts, and the wrong ones are the useful part:

1. `if (r.cssRules)` before `r.selectorText`. With CSS nesting a `CSSStyleRule`
   also carries a (usually empty) `cssRules`, so every style rule was treated
   as a group and recursed into. It reported **"0 checked · PASS"** — the same
   shape of lie as the geometry probe that returned four identical states.
2. Toggling the class off and looking for a change. The class is not always on
   the matched element (`.ostage.is-live .ocard` puts it on an ancestor), and
   a state that returns a property to its *default* — `.ocard.is-on{transform:
   none}` cancelling the offset `.is-live` gives every card — looks identical
   either way. Ten correct rules reported dead.
3. Walking the cascade for real: every author rule matching the element that
   sets the same property, ordered by specificity then position, and asking
   whether ours is last. Then one more discrimination, or it is unusable:
   **losing to another state is ordinary cascade**; only a *resting* rule
   beating a state rule is a fault.

First run: the Okou window's nav lost its `.is-here` highlight in dark mode —
the theme rule out-specifies the state, so the current row was the same 60%
grey as the four inactive ones — and three lines in `base.css` still described
the rotator's old `display:none/block` machinery, replaced by `#rotator .rot`
and unable to fire since.

**And one regression of my own, caught on the way out.** The Slack landing
card added yesterday failed axe on two nodes in two runs of three, while
measuring 16:1 and 5.6:1 at rest. Every other object in that scene settles
once per beat; this one replays on a loop, so the odds of being sampled at
partial alpha are high, and axe composites an inherited opacity. It wipes with
`clip-path` now instead of fading — which is what QA §1 has said since the
`.reach__line` fix, and I did not apply it to the one object that needed it
most. Four clean runs.

---

## 2026-08-28 · the rules that were only in changelog entries

Tong: *"我们有没有记录网站规则和风格的文档或者脚本？之前聊到的很多可以整理成设计
规则的地方都整理成文档"*

Yes — `RULES.md` indexes them, `design-principles.md` argues them,
`design-system.md` holds the values, `motion.md` the timings, `qa-checklist.md`
is the machine half, and `tools/` is the part that runs. What was missing is
that **the last week's decisions had only ever landed in changelog prose**. A
rule in an entry is a story; a rule in the index is a rule. Nineteen of them
were promoted, and the index itself turned out to be broken in three places.

### The one that needed a script, not a paragraph

*"整体这部分太重了"* was read as a styling note for two rounds. It was a
**measurement**: 4.05 screens of scroll and 23.6% of the whole page, for a
reassurance, in a page whose main story took less. Nothing in the gate asked
that question, so `audit.js` §7 now does — pixels, screens and share per
section, plus who is asking:

```
hero          932px  1.04 screens   8.8%  2 CTA
workflows    2814px  3.13 screens  26.6%
control      1126px  1.25 screens  10.7%
```

- 2.2 screens is the cap for anything that is not the hero
- **the page asks twice**, the hero and the closing band; `a.btn` anywhere else
  fails, because five in-section CTAs are what made a reassurance read as a
  second product tour
- over the cap *on purpose* is fine — in `LONG_ON_PURPOSE`, **with its reason**,
  the way `.tplwin` and `.vsui` are named in the no-rules audit

It currently reports one: `workflows` at 3.13 screens, the page's subject. That
is a decision now rather than a section nobody had measured. Argued in
`design-principles.md` §14, gated at QA §3b, indexed as K7/K8.

### Nineteen rules promoted

S9 (a delimited strip carries no surface of its own) · M5 (`height` on a grid
container is not a ceiling) · M6 (a column beside a fixed-width object takes
that object's width) · T8 (a fixed-width chip beside elastic text takes its own
line) · C12 (a tint inside a mock is `--tile`, never `--wash`) · P11 (a mock's
dark mode is the product's dark ramp, not its light one inverted) · P12
(fidelity yields to legibility once, and the deviation is written at the rule) ·
P13 (product facts have sources — the catalog API, the `.tsx`, the i18n JSON) ·
K7, K8, K9 (weight is a measurement; the page asks twice; "don't show it" and
"don't lead with it" are different edits) · F39 (stacking order is part of the
state) · F40 (an arrival holds longer than a step) · R11–R14 (the review URL
comes from `main`; an earlier duplicate selector cannot be beaten from above; a
renamed class leaves its breakpoint rules behind; a brace inside a comment is
not a brace).

Three gate sections that RULES had been pointing at for weeks **did not exist** —
§4w, §4y, §4z, between them the machine half of nine rules. Written.

### The index was lying, and now something checks it

`tools/rules.py`. It reads `RULES.md` against `qa-checklist.md` and `audit.js`
and fails if a pointer does not resolve. First run, four findings:

| | |
|---|---|
| `QA §4w`, `§4y`, `§4z` | pointed at nine rules' gates; **no such sections** |
| `§4o`, `§4p` | each used for **two different** checks — the pointer was ambiguous, which is worse than wrong |
| `## 6. Grid and breakpoints## 6. Grid and breakpoints` | the heading was in the file twice, on one line |
| `C4 → §15` | not a gate section at all — it meant `design-system §15`. Cross-doc pointers are named now |

**And the linter shipped broken twice before it shipped.** `RULE_ID` was compiled
without `re.M`, so `findall` only ever tried position 0 and the duplicate-id
check passed by matching nothing — it reported "0 rules" and I read past it. Then
a lookbehind meant to distinguish a bare `§15` from `design-system §15` also
excluded `QA §4s`, i.e. every real pointer in the file, and it announced "all
pointers resolve" while looking at none of them. **A linter that cannot fail is
not a linter**: both are recorded at the regexes, and the fix is verified by
breaking `RULES.md` on purpose and checking the exit code, in both directions.

### Gate

`tokens.py` 0 · `check-html.py` balanced · `scopes.py` 0 · `rules.py` 133 rules,
64 gate sections, 7 audit blocks, all pointers resolve · `audit.js` §1 §3 §6 §7
PASS, §2 unchanged from HEAD.

---

## 2026-08-28 · one review URL, published from main

Tong: *"现在我分了三个chat来改网站，但是每次改的网站好像都没有merge到一个main里边，
所有不同的link在验收的时候都是分散的。"*

**The code was never forked.** `main` is one linear branch, no merge commits, and
every thread's work is on it — the prompt-box hero, the Slack scenes, the
workflow four-beat, the control rewrite. What was fragmented was *publishing*.

An `okou host` slug belongs to the **chat thread that created it**. A second
thread asking for the same `--site` does not republish it; it gets a new URL with
a suffix. So three threads meant three links, and each one was frozen at whatever
moment its own thread last published. Measured by the `?r=` stamp each URL was
serving:

| URL | commit | |
|---|---|---|
| `…-draft` | `461abc5` | **3 commits behind main** |
| `…-draft-bay3` | `8bb893d` | current |
| `okou-ai-teammate-swiss` (production) | `r=42` | predates asset stamping |

Two failure modes stacked: a URL per thread, and a publish per session rather
than per commit. One fix answers both — **publishing stops being something a
session does.** Every push to `main` now deploys `site/` to
`https://tongx-blip.github.io/VM0-Website/`, which is the same URL tomorrow no
matter which chats are alive. Per-thread `okou host` drafts stay useful for
showing work mid-session; acceptance moved to the Pages URL, and `CLAUDE.md`
step 5 now says so.

The job also runs `build-css.py` and fails if the tree moves. `site/styles.css`
is generated and `index.html` carries the `?r=` stamp pointing at it, so a thread
that edits `src/css` and forgets to rebuild pushes source that nobody is serving
— which is the other half of how the drift happened.

Not fixed here, and worth a decision: **production is far behind everything.**

---

## 2026-08-28 · the security section stops being a second product tour

Tong: *"这个 section 可以不做滚动的五屏的交互。这种交互方式挺重。然后我们就想把它
缩减成一屏，然后在一屏上可以把这些内容讲完。"* — and feedback 16–20 on the board.

### What it measured

Before touching anything: `#control` was **4.05 screens and 23.6% of the page's
entire scroll** — the longest section on the page, longer than `#workflows`,
which carries the product's main story. It was also the only section on the page
with a CTA per item: five of them, against the one ask in the closing band. That
is the mechanism behind "太重" — not the styling of any beat, but a reassurance
built at the scale of a feature tour. It is now **1.25 screens and 10.7%**, and
the page lost 320px of document height in the process.

### What went, and what that cost

Five beats became two claims and a footnote.

| was | now |
|---|---|
| 1 Granular permissions | the dialog, and the first caption |
| 2 Approval gates | the same dialog — it *is* the approval gate |
| 3 Isolated execution | the cloud browser card, and the second caption |
| 4 Credentials stay out of the run | **gone.** "这个也太多了，不需要表达" |
| 5 Traceable by default | its sentence, as the closing `.note`. "不需要重点提" |

The two deletions are not the same deletion, and the difference is in Tong's own
words: 18 says *don't express it*, 19 says *don't make a point of it*. So the
network card is gone without trace and the trail keeps its claim as a clause.

### The grant dialog is the product's, to the pixel

Feedback 16 asked for the real card. `app.vm0.ai` is behind a login, so it was
read out of `views/permission-allow/permission-allow-page.tsx` instead of
approximated: 548px shell at `rounded-[20px]`, the 500px column at `px-[26px]`,
the target pill's `pl-2 pr-8 py-3`, the 40px icon slot at `rounded-[10px]`, the
`h-8 w-[116px]` duration select and its real default (**1 hour**, not 24), the
`h-9 rounded-[10px]` confirm. The connector, scope and description are the real
ones — `google-ads` / `campaign-budgets.write` / "Create and update campaign
budgets." — pulled from the connector catalog, and the agent avatar is Okou's
own `svg:r1s0h1c5f4h`, composited from the three layers the app stacks.

Three deliberate deviations, all documented at the rules: the scope description
**wraps** where the product truncates (a card whose whole job is to be read must
not end in an ellipsis); the scope chip and the tick take page tokens because
`sky-700` and `green-600` have no dark sibling here; and every in-card tint is
**`--tile`, not `--wash`**. That last one is the interesting bug — `--wash` is
the grey the *page* sits on and it goes DARKER than `--paper` in dark mode, so
the target pill, the icon slot and the scope chip all rendered as holes punched
in the card. `--tile` is the token for a surface inside a card and it inverts
the right way. The comment saying exactly this has been in `system.css` since
the KPI row learned it.

### 17 is a cloud browser, not a cloud computer

"用云端电脑来表达" has a trap in it: the product's **Computer Use** is the
user's *own* Mac ("Requires an Apple silicon Mac"), so drawing it as the place
an isolated run happens would have been a product lie. The real cloud machine is
the **Cloud browser** — "an isolated cloud browser profile", with a live view the
user can take over. So the card is `BrowserSessionCard`: its own 400px cap,
`rounded-lg`, a 40px title row over a 16:10 preview, status as a 6px dot beside
an 11px label. The preview is a page Okou built, not a stock screenshot of
somebody else's product.

### Two layout faults found by looking

**The side column was floating in the middle of the dialog.** Centred, its three
items stopped 100px above the dialog's floor and the section ended on a hole.
`justify-content:space-between` hangs the first caption off the top edge and the
last off the bottom, so the two halves read as one block; the gap is the floor,
not the spacing.

**A 1fr column is not the card's width.** The browser card caps itself at 400px
the way the product does, so a leftover-track column left it against 200px of
nothing with the captions running past it on both sides. The column is now the
card's width and the pair is centred in the section.

**At 390 the scope chip was destroying its own sentence.** The chip is a fixed
22-character object and the sentence beside it is elastic, so the sentence came
out as four two-word lines wrapped *around* the chip. The chip takes its own
line now, at the page's 11px mono floor — at 12px it is 171px wide on a 170px
line and broke at its own hyphen, and a scope name that wraps is not a scope
name.

### A latent fault in the build, surfaced

`tools/build-css.py` aborted on `614 /* vs 615 */`. Not this change: `split_rules`
counted braces inside **comments**, and several notes in these sources quote the
rule they are about — `` `.wfo__who{transform:none}` ``. One such comment walked
the depth off by one, the splitter cut a block mid-comment, and the halves came
back out unbalanced. It only appears when an unrelated edit changes which rules
survive the prune, so it reads as the edit's fault. The splitter skips comments
now; at HEAD the fix is a no-op except that it stops mangling those two
comments, which were being cut and rejoined every build.

### Also gone

`.ctrl__stage/__frame/__win/__steps/__step/__spot/__index/__go`, `.perms*`,
`.cbox`, `.cgate`, `.cnet`, `.ctrail`, the ten `spot-*.png`, and 173 lines of
`app.js` — including the `--ctrl-h` self-measuring loop (RULES F23), which was
the most fragile script on the page. A stray `}` that had been sitting in
`system.css` since some earlier deletion went with it; the file balances now.

### Gate

NO-RULES pass · TYPE-SCALE identical to HEAD, no new page-level size ·
composition rule holds · obvious-bug sweep pass · reduced motion pass ·
token hygiene at parity (`--e-2` was already unused) · axe **0 violations**
across 14 runs light and 5 dark · 390 and 1440, both modes · no broken images,
no horizontal overflow.

### Still open

The captions are assembled from the existing beat copy — nothing new was
written, but two sentences were spliced and the three concept names became
inline lead-ins. Wording is Tong's, so those want a read.

---

## 2026-08-30 · the ladder hangs from the bottom

Tong: *"上边的title stick top和下边的定位stick bottom"*.

The lede already held the frame's top row; the steps sat at the top of the
second, so all the column's slack piled up under the last one — **125px at
steps 1-3 and 178 at step 4**, measured. `justify-content:flex-end` on
`.ladder__col` hangs the ladder from the bottom instead, and the air moves to
where it does some work: between the title and the steps.

The payoff is an alignment that was not there before. The ladder's bottom rule
now lands on the same line as the stage's bottom edge, in **every** step — both
at 660 of the 660px frame — so the two columns close together instead of one
trailing off into empty space.

**What moves instead, and why it is fine.** The slack has to go somewhere, and
bottom-hanging puts the variation on the ladder's TOP edge: 279 at steps 1-3
and 332 at step 4, because step 4's body is 74px against ~126 for the others.
That 53px shift happens during the same transition that opens step 4's body —
the ladder is already re-flowing at every step change — and it lands in open
space under the title with nothing to measure itself against. The bottom edge,
which now has the stage to line up with, is the one that holds still.

I considered reserving the tallest body height so neither edge moved. It needs
a pixel value that would be wrong at every width the copy rewraps at, and it
would buy stability on an edge nothing is aligned to.

**Gate.** axe 0 across 8 samples; `audit.js` §1, §6, §8, §9, §10, §11 PASS;
`tokens.py` 0; `rules.py` 154 rules resolving. Below 1080 `.ladder__col` is
`display:block`, so the rule is inert there and the stacked order is unchanged
— checked at 768 and 1024.

---

## 2026-08-29 · the ladder gets its own lede

Tong: *"把我图一标记的这段文字去掉，然后放到图二的位置，你可以用 Primary 橙色去
标记里边的词。跟其他 section 的风格保持一致"*

**"One chat becomes something the whole team runs"** leaves the centred lede and
becomes the ladder's own heading, at the top of the left column above Run /
Save / Hand over / Automate. Wording untouched; only the trailing full stop
goes, because a heading takes no trailing punctuation. It reads as the other
sections' headlines do — Archivo at display scale with one accent phrase — but
at the COLUMN's scale rather than the page's, because it introduces the four
steps beside it and not the section.

**A `<p>`, not an `<h3>`.** It would otherwise sit at the same heading level as
the four step titles it introduces.

**`--accent-solid`, not `--accent`.** C1 gives display marks the brand orange,
but this one clamps down to 23px at 1024, and 23px regular is below the
large-text threshold where #ED4E01's 3.4:1 stops being enough. `--accent-solid`
is 4.5:1 on paper at any size and the two are indistinguishable at this scale.
It is also orange from the resting frame rather than on `.is-lit`: the colour
is the point of the sentence and must not wait for JS (N2).

### The placement had a second half

Dropped into `.ladder__col` it was correct at desktop and quietly broken below
1080, where the layout stacks and `.ladder__stage` is sticky: the lede sat
between the stage and the steps, so it scrolled **under** the figure and out of
sight. Measured at 768 — on screen at y 583, with the stage occupying 78–655.

It is a grid item of `.ladder__view` now, not a child of the column: the view
takes a second row, the lede holds `1 / 1`, the steps `2 / 1`, and the stage
spans both at `1 / 2`. That also puts it first in the DOM, so the stacked
layout reads it before the figure instead of sliding it underneath. Verified at
390 and 1024 (lede above stage above steps) and at 1120 and 1920 (side by side,
where reading order does not apply).

**Gate.** axe 0 across 13 samples in both themes; `audit.js` §1, §6, §8, §9,
§10, §11 PASS; `tokens.py` 0, `scopes.py` 0, `rules.py` 153 rules resolving.

**One tension worth naming:** the section now carries two accent phrases —
`asset it keeps.` in the headline and `whole team runs` in the ladder's lede.
`.sentence .mark` was de-coloured once for exactly that reason. These two are
at different scales in different columns with the centred lede between them, so
I do not think it reads as a competition — but if it does, say so and the
headline's mark can go back to ink.

---

## 2026-08-29 · a hairline in the shadow tokens, because two whites met

Tong: *"两个frame糊在一起了，就是可以加一个非常浅的 stroke"*, then *"那其他地方都
要加哈"*.

This is the bill for lightening the shadows: separation was doing two jobs, and
only one of them was "this card is raised". Where the ask card overlaps the
shortlist card, two pure whites met with nothing between them.

**The hairline goes in the tokens, not on the components.** `--e-fig` and
`--e-lift` each take `0 0 0 .5px` as their FIRST layer, so every surface that
already reads them gets an edge from one edit — nine declarations across the
workflow cards, the ladder mocks, the Outputs connector cards, the app window,
the Slack panel and the comparison cards. `.par__c` was still declaring its own
shadow and now reads the token too.

It is a shadow layer, not a `border`: no layout, no box-sizing, and it is
exactly what the product's own `--zero-card-shadow` does. **S4's exception list
names it** — a surface's own edge is not a divider, and at `.07`/`.08` of
`--ink` it only shows where two surfaces overlap.

**Where it did NOT go, and why.** A survey of every near-white card-scale
surface on the page turned up nine. Four are the page's own section cards
(`.panel`, `.footer`, `.close`, body) — they sit on the grey `--wash` and have
never dissolved into anything; ringing them would make the page boxy and is the
thing S2 and S4 were argued over. Three more (`.cbro__view`, `.vs`, `.quote`)
are `--tile` grey on white, which is already a step off their ground. The two
that overlap another surface are the two that got it.

If "其他地方" meant the section cards as well, say so and I will — it is a
different decision, not a missed spot.

---

## 2026-08-29 · the globe rode 2.8px high, and the check for it was wrong twice

Tong: *"这个语言选择 icon 和文字没有对齐。"*

**Measured before touching it.** The button is `inline-flex; align-items:center`
and the label and the chevron are dead centre — all three at the same middle to
0.1px. The globe's *span* is centred too. Its **svg** is 2.8px high.

An `<svg>` is inline by default, so a bare span holding one is a **line box**:
16px of glyph plus 5.6px of the font's descender space below it. Centring that
21.6px box puts the visible glyph above centre. The label and the chevron are
flex items in their own right and have no line box, which is why only the globe
drifted.

**Fixed on the wrapper, not the svg.** `.pref__globe{ display:inline-flex }`.
The obvious `.pref__btn svg{ display:block }` is (0,1,1) and would out-specify
`.pref__moon{ display:none }` at (0,1,0) — the theme toggle would show the sun
and the moon at once. Verified: exactly one glyph in both themes, and all four
centres now agree to 0px. Now **S11**.

### The check took three goes

Worth writing down because two of the three looked like they worked:

1. *"wrapper taller than its svg"* — reported five padded buttons (`.pbox__ib`,
   `.slk__send`, `.railnav__b` …) which are **meant** to be bigger than their
   icons, and are fine.
2. Guarded with `height !== 'auto'` to exclude sized controls — **computed
   height is never `auto`** on a rendered element, so the guard fired every
   time and the check skipped precisely the case it existed for. It printed
   PASS with the fault reintroduced, which is the worst outcome available.
3. The signature is **off-centre**, not taller: a padded control centres its
   icon, a line box does not. `|svgMid − wrapperMid| > 1px`.

Version 3 is in `audit.js` §6 and self-tested per R15 — PASS on the fix, and
with `display:block` put back it names the element and the offset: *"svg off
its wrapper centre by -2.8px: .pref__globe"*, the same 2.8 measured by hand.

**Gate.** axe 0 across 6 samples; `audit.js` §1, §6, §8, §9, §10, §11 PASS;
`tokens.py` 0; `rules.py` 148 rules resolving.

**Noted, not changed:** the footer still carries the old cube-plus-OKOU lockup,
which is now inconsistent with the header's new logotype. Left alone because
the ask was the header, and swapping a second brand lockup is a decision rather
than a fix.

---

## 2026-08-29 · the figure shadows come off a scale again

Tong: *"这阴影还是被截断了。嗯，是不是阴影太重了？那整体把这些配图的阴影都减一减"*
— and the second sentence is the fix for the first.

**They had drifted.** Eight figure surfaces carried hand-picked shadows whose
second layer ran from `.24` to `.5`, each chosen next to the one before it
rather than against a scale — the heaviest was twice `--e-2`, the page's own
elevation token. Two roles now, stated once beside `--e-1..3`:

```css
--e-fig:  0 1px 2px  rgb(var(--ink-rgb) / .04), 0 14px 28px -22px rgb(var(--ink-rgb) / .20);
--e-lift: 0 1px 3px  rgb(var(--ink-rgb) / .05), 0 20px 40px -26px rgb(var(--ink-rgb) / .26);
```

`--e-fig` is a card resting on a ground; `--e-lift` is a card floating in front
of another card. Both are channel-based, so they follow `--ink` and the theme
(C8). All nine declarations route through them — the workflow cards, the ladder
mocks, the Outputs connector cards, the app window, the Slack panel and the
comparison cards. Now **S10**.

**And that is most of the cut.** The `#growth` card wipes in with an animating
`clip-path`, and a clip cuts the shadow at its moving edge: while the card is
half revealed, the shadow belonging to the half that IS revealed is not drawn.
That is inherent — a wipe cannot carry a drop shadow — but at `.42` over a
50px blur the cut read as a hard grey rectangle with corners, which is what the
screenshot shows. At `--e-lift` the same frame is a clean leading edge.

Checked at a forced worst-case frame rather than by waiting for the loop:

```js
p.style.transition='none'; p.style.clipPath='inset(-10px -10px calc(45% - 20px))';
```

**What the gate could and could not see.** `audit.js` §11 — added this morning
from the other thread — asserts that every clipped surface leaves room for its
shadow, and it passed both before and after: it measures the *static* bleed,
which was correct all along. The fault was in a frame the check cannot reach.
Written into the gate as an eye check with the snippet above, rather than
pretended to be automated.

**Gate.** axe 0 across 14 samples in both themes. `audit.js` §1, §6, §8, §9,
§10 and §11 all PASS. `tokens.py` 0, `rules.py` 147 rules resolving.

---

## 2026-08-29 · the new logo, and it gathers into the mark

Tong sent the new OKOU logotype as an SVG and its standalone mark, and asked
for the header to open on all four shapes and then collapse the last three to
the left until only the first is left.

**Inlined, not `<img>`.** Four paths cannot be animated separately through an
`<img>`, so the svg is in the markup with each glyph classed. Its DOM order is
not its visual order — U, O, O, K in the file — so the generator reorders to
left-to-right and records each glyph's own distance home: K −162, O −303,
U −448, in the svg's user units.

**The box is the finished state.** The `viewBox` is `0 0 138 140` — the first
glyph alone — and the other three live *outside* it, drawn only because
`overflow` is visible. So the header is laid out for the mark from the first
frame: measured at 390, 768 and 1440, the box is 26px in both frames and the
nav's centred links do not move by a pixel. The alternative, transitioning the
element's width, is a layout property on a timer (N1) and would reflow the bar
every frame for the whole gather. Now **N21**.

**Resting is the gathered mark (N2),** so no-JS, a slow connection and reduced
motion all show the finished logo rather than a wordmark that never resolves.
That means the opening state has to be switched ON before the first paint and
off again after the hold — and `is-armed` has to go on one painted frame later
(N12), or the three glyphs fly *out* from behind the mark on load, which is
the reverse of what this says.

**`opacity` here is deliberate.** N3 forbids fading text on a loop — "once per
load is an artifact; every twelve seconds forever is a defect" — and this is
four graphic paths in an `aria-hidden` svg playing once. The link carries its
own name in `aria-label`, since the wordmark it used to sit beside is now part
of the logo.

**`.mark` was taken.** The first pass called the component `.mark`, which is
already the highlight class in the reach section; `tokens.py`'s
duplicate-declaration check caught the collision on `color` and `transition`
before it reached a browser. It is `.wm`.

**Two dead rules** in `base.css` for the `<img>` and `<span>` that no longer
exist, removed — the R6 grep after replacing a block.

**Gate.** axe 0 across 8 samples; both frames checked in light and dark, in the
resting and stuck header, and under reduced motion (class `wm`, one glyph
visible, box 26). No collision at 390, where the opening logotype ends at 99px
and the next control starts at 187. `audit.js` §1/§6/§8/§9 PASS; `tokens.py` 0,
`scopes.py` 0, `rules.py` all pointers resolve.

---

## 2026-08-28 · 上下 was the arrangement, not the alignment

*"我都说了icon和text纵向左对齐，icon在text上边"* — and he had. I read 「icon和text
都上下对齐」 as "share a vertical axis" and built a horizontal row with the mark
centred beside the text. He meant stacked: **mark on top, text under it, both
flush left**. Two rounds on one sentence.

**One width, two heights.** *"connector的card宽度应该是固定的，高度可以根据content
变高"*. The horizontal stagger made card two narrower than card one, which reads
as two card sizes rather than as two cards. Both take the column's width now;
the stagger is vertical and the tilt carries the rest — and as a side effect the
lap is one number for both, which is what the rail insets by.

**The pair is centred as a group.** Percentage offsets from each end do not
survive a column that changes height: at 1440 they left 134px between two
content-height cards, and at 1120 — where the column is 403px and the cards
total 272 — the *same* percentages overlapped them by five. A flex column with
`justify-content:center` and a fixed gap holds the gap constant and splits
whatever is left equally above and below, which is the shape the earlier
「空荡荡」 complaint was asking for anyway. Caught by a new sweep assertion, not
by eye.

**A tab holds for 13s, not 9.** *"用户还没看完内容就切tab了"* — the exchange's
last message is cued at ~4.1s, the artifact lands at ~4.4s and its spring
settles by ~5.2s, so 9000 left under four seconds with the finished frame on
screen. 13000 gives the settled frame about 7.8s, which is the part anyone
actually reads.

**The bottom band, rebalanced.** *"整个frame下方因为在一开始要给data预留空间，所以
看起来有点空"*. Three things, measured at each step: the frame gave its bottom
padding to the windows and the strip supplies its own floor; the row-gap came
down from 22 to 15; and the strip itself went from a stacked block (46px, number
over label) to **one line** (24px, number then label). The band is 67px on a
595px frame, down from 95px on 625 — the frame is 30px shorter and the strip
reads as a footer under the picture rather than a row parked in a gap.

It is still empty for the five seconds the run takes, because that is what a
two-phase entrance is. If that is the part that bothers you, the other lever is
to move the strip into the left column under the connector cards — the frame
loses the band entirely and the column's air gets used — but it stops being
centred, which was the earlier ask.

**And the value comes before the label.** Inline, the DOM order is the reading
order: "6 backlog issues linked", not "backlog issues linked 6".

**Gate.** Sweep at 8 widths × 7 scenes × 5 timestamps, with two new assertions —
the two cards must be the same width, and they may not collide — clean. axe 0
across 18 samples in both themes. `audit.js` §1/§6/§8/§9 PASS. `tokens.py` 0,
`scopes.py` 0, `rules.py` all pointers resolve.

**Sandbox note.** The workspace was wiped twice mid-round. Everything was
already pushed, so the first was a `git clone`; the second took `/tmp` and the
local server but left the working tree, so nothing was rebuilt from memory.

---

## 2026-08-28 · seven from one pass over the stage

Six screenshots and a deletion. Each one measured before it was changed.

**The mark and the text share an axis.** *"connector card的icon和text都上下对齐"*
— they were flush at the top, which puts a 34px tile level with a 19px line
box: the mark reads low against the name and high against the sentence under
it, aligned to neither. Centred on the text block, it labels the card.

**The two cards are a pair, not two ends.** *"左边感觉有点空荡荡"* — measured,
**187px** of empty gradient between them in a 496px column. At 19% from the top
and 33% from the bottom the gap is 64px and the air is around the pair instead
of inside it.

**One type size for the data.** *"date字号不一样大？"* — the lead was set at
display size, and under a tab with only two metrics that reads as two type
sizes rather than as a hierarchy. The differentiation the numbers needed is
already carried by every tab having its own labels and its own count; doing it
in the type as well was one signal too many. The lead keeps a darker label.

**And the strip is centred on the frame.** *"data是不是可以在整个frame中间"* —
yes, and it was the right question: it summarises the whole run, so parking it
under the left column was saying it belonged to the window.

**A pill with a square button in it.** *"输入框圆的，但是里边的button方的，非常
不严谨"*. `--zero-composer-radius` is 1.5rem on a composer ~120px tall, where it
is a rounded rectangle; this mock compresses that control to a single 46px row,
and at 46px the same corner is a lozenge with an 8px button inside — which is
S1's own complaint about a page holding two ideas of what a control is. 14px
here, and the deviation from the product is written at the rule (P12).

**The ask has to survive the clip.** *"图五，第一段prompt就被盖住了"* — the Spec
Writing thread measured **387px of content in a 386px list**, so the user's own
prompt was sliced through its first line by the title bar. The artifact preview
was capped at 144px for a *fit*; it is 110px now, sized for **headroom** —
39–64px of slack on all three, checked rather than eyeballed.

**A header, not a first line.** *"artifacts的标题和下边内容融为一体了"* — white
caption on a white page running straight into the document. The product's own
`CardHeader` is a band on the card, so this takes the same shape: gray-50 with
the card's 0.7px rule under it.

**And the footnote is gone**, as asked.

### One the fix caused

Moving the cards inward put card two on the rail's "Connectors" caption, eating
its first letter. It reached `right:-18px` — `--o-lap` **plus eighteen** — while
the rail only keeps `--o-lap` clear, so the deeper card was always going to land
on chrome as soon as it sat at a label's height. Both cards share a right edge
now and stagger on the left, so the lap is one number and the rail's inset is
that number.

**And there was no check for it.** The rule that a card's lap must equal the
inset the chrome under it reserves was enforced only by a throwaway sweep
script in `/tmp`, never by anything in the repo — which is why the gate was
green while the screenshot plainly showed the fault. `audit.js` §8 tests it
now, against labels as well as icon tiles: a version that read only the tiles
would still have passed.

**Gate.** Sweep at 6 widths × 7 scenes × 5 timestamps, with the caption check
added — clean. axe 0 across 18 samples in both themes. `audit.js` §1/§6/§8/§9
PASS, `tokens.py` 0, `rules.py` all pointers resolve.

---

## 2026-08-28 · the numbers belong to the tab, so they moved onto the frame

Feedback 05 on the board — 「这个太多层了 … 每一个场景下的数字都不一样」 — had its
layering half done and its data half open. Tong: *"如果下边的data和每个tab是有联系
的，那这几个数据你觉得应该怎么放？而且你可能得差异化的放一下数据。切换tab后数据也
需要变"*

### Where they go

**On the frame, not under it.** Three grey blocks in a row below the stage was
the reading feedback 05 called 太多层 in the first place — and once the numbers
belong to a tab, a strip floating on the page beneath the frame is saying they
belong to the *page*. The frame takes a second grid row (`minmax(0,1fr) auto`)
and the strip stands on its own ground; `--o-h` grows by the strip's height so
nothing above it shrinks. The old `.metrics` row is gone.

**They land with the artifact.** These are what the run produced, so they arrive
on the same `.is-landed` cue as the page it shipped, staggered 70ms apart —
not before it, which would be the answer turning up before the work. Revealed
with `clip-path`, because this is text on a loop and that is the fault N3 exists
for.

**And the switch is free.** Every scene ships its own strip, so there is no JS
keeping data in sync with a tab — the markup that changes is the markup that
already changes.

### What they say

**Every value is already on screen in its own scene** (K10). Nothing is invented
and nothing is a plausible-looking round number:

| tab | | | |
| --- | --- | --- | --- |
| Storefront Launch | Brief to live **7 min** | Room tiles built **3** | Waiting on you **1 draft** |
| Ad Campaign | Sessions reviewed **10,220** | Budget moved **$183** | Ask to live **19 min** |
| Lead Scoring | Leads scored **12** | Tier A queued **4** | |
| Incident Triage | Events grouped **1,111** | Root causes **8** | Issues opened **2** |
| Spec Writing | Backlog issues linked **6** | Spec filed **1 page** | |
| Team Digest | Posted **Mondays 09:00** | In the channel **24** | |
| Board Deck | Slides rebuilt **8** | Refreshed **nightly** | |

1,111 events and eight root causes are what Okou says in `#incident-checkout`.
$183 is the figure in the Meta draft *and* on the dashboard beside it. The
durations are the difference between two timestamps in the thread above them —
9:24 → 9:31, 11:02 → 11:21.

**The count varies on purpose** (K11). Three scenes have three facts worth
stating and four have two; padding the short ones to a fixed trio is exactly
what made the old row read as a template wearing different numbers. And the
first one leads at display size — *"你可能得差异化的放一下数据"* — because three
values at one size is the same template again.

The footnote stays. The values are traceable, but they are still illustrative.

### Two on the way

**`data-count` had its separators stripped.** I wrote `data-count="1111"` so it
would parse, but `countUp()` parses the digits out itself and writes the
attribute back as the final text — so "1,111" animated up and landed as "1111".
It carries the display string now, `$` and comma included, which the function
already handles (`$0 … $183`).

**`<i>` is italic.** The numeral is in one, so the whole strip rendered oblique
under an upright picture until the component said otherwise.

**Gate.** Sweep at 7 widths × 7 scenes × 5 timestamps with new assertions that
the strip stays inside the frame, never overlaps a window, and is not collapsed
once landed — clean. One height across all seven tabs (625). axe 0 across 18
samples in both themes plus reduced motion, where all three rows are visible and
unclipped. `audit.js` §1/§5/§6/§8/§9 PASS. `tokens.py` 0, `check-html.py`
balanced, `rules.py` all pointers resolve.

---

## 2026-08-28 · the payoff moves inside the frame, and the row opens centred

Tong: *"如果左边把connector和对话流结合了，那右边的结果我觉得也应该放进这个渐变色
的frame里 … 用户刚切到一个tab上以后，connector和对话窗口居中，当对话结束后，右边
的artifacts从右侧滑进渐变frame"*

He is right about the diagnosis: the frame stopped 66% of the way across the
stage and the page it shipped sat beside it on white — the only object in the
row with no ground under it, which is exactly what the screenshot shows.

**One frame, one row, two items.** `.ostage__app` is the connectors *and* the
window as a single unit, because the opening beat moves them together and the
cards lap the window's left edge rather than the frame's. Pinned to the frame
they would have stayed put while the window travelled and the lap would have
opened into a gap.

**The beat is two states of one row.** Resting is the finished frame (N2):
both objects sit in their final places with no transform at all, so reduced
motion, no-JS and a tab at rest all show the whole row. `.is-live` puts it into
the *opening* state; `.is-landed` takes it out again at the cue.

The centring is one expression and needs no JS measurement:

```css
--o-appw:62%;
.ostage.is-live:not(.is-landed) .ostage__row{
  transform:translateX(calc((100% - var(--o-appw)) / 2));
}
```

A percentage translate and a percentage flex-basis resolve against the same box,
so the beat cannot drift from the layout, and changing the split changes both.

**The artifact slides and wipes; it does not fade.** The frame keeps
`overflow:visible` so the connector cards' shadows are not cut at its edge —
which means nothing clips the artifact for us. A fade would put an `opacity` on
a window full of text, on a loop, which is the fault N3 exists for and which axe
has caught on this page twice. `translateX(14%)` plus
`clip-path:inset(0 0 0 100%)` reads as the page arriving from the frame's right
edge, and both are on N1's list.

**It lands when the conversation is done, not on a clock.** The cue is the last
message's own `data-cue` plus 260ms, so a scene that gains a row does not need
the number re-guessed.

### Where the artifact ended up

At 1440, inside a frame whose inner box is 1248 × 498:

| | |
| --- | --- |
| width | **454px** — 38% of the inner width, the app unit taking 62% |
| height | **498px**, the frame's full inner height — the same as the window, so the two read as a pair rather than a window with a thumbnail beside it |
| position | flush to the frame's right padding (27px), settling from `translateX(14%)` |

**The crop is the open question.** The page inside is 880 × 4064 scaled to
454 × 2096, of which 459px shows — 22%. On Storefront Launch that cut currently
lands *through* the headline "BUILT FOR THE HOURS", which is the one kind of
crop the rules single out as reading like a rendering fault. It is not fixable
by choosing a width: each of the seven scenes has a different page image, so any
width tuned to one slices another somewhere else. Left as it is and raised
rather than quietly tuned.

### Two faults on the way

**The narrow layout was written for the old nesting.** `order` on `.ochat`,
`.ostage__conn` and `.tplwin` only worked while they were siblings of the frame.
Once they were nested the row stayed horizontal at 390: a 62% app unit and a
38% artifact side by side on a phone, with the conversation invisible and the
frame a column of empty gradient. The row is a flex column below 1080 and the
whole beat stands down there — centring a 62% unit inside a full-width column is
a translate to nowhere.

**`is-landed` outlived its pane.** `playPane` removes `is-live` on hand-back and
that was the only class it cleared, so the next tab opened already landed and
never played its opening beat — and every tab after it inherited the same.
Now **N20**.


**One fix that came in with a rebase.** `.vs3__vs{ opacity:.7 }` on
`--ink-mute` — 3 nodes, every axe sample, in both themes. That is exactly
**C11**, and the rule exists because `.vs__vs` shipped the same thing at `.5`
in the same component family. `--ink-mute` is already the lightest text the
page allows on every ground it uses, so any opacity on top of it is under AA
by construction. The `.86em` size step is the whole of the quietening.

### Two false positives, and what they cost

The sweep reported `artifact-over-window` at every narrow width: stacked, the
artifact is *below* the window and shares its left edge, so `left < right` is
trivially true. And it reported the artifact sitting 7px short of the frame at
5.4s — the 760ms spring had not finished; at 7.5s every scene settles flush at
exactly the 27px padding. Both checks are now scoped to the side-by-side layout
and sampled after the spring.

**Gate.** Sweep at **10 widths × 7 scenes × 5 timestamps** — clean, including
the new assertions that the artifact lands flush inside the frame and never
crosses the window. axe 0 across 24 samples in both themes (the one hit in each
is the cold first sample after a walk, already recorded). `audit.js` §1, §6, §8
and §9 PASS. `tokens.py` 0, `scopes.py` 0, `rules.py` all pointers resolve.

---

## 2026-08-28 · the rules from this week, moved out of prose and into the tools

Tong: *"之前聊到的很多规则性的内容可以加进设计规则文档或者脚本里。"*

The bias was toward **scripts over prose** — a rule nobody runs is a rule that
gets re-litigated. Three of this week's faults turned out to have exact
mechanical preconditions.

### Codified

**`tools/tokens.py` — sized grids with an implicit row track (M5).** `height`
on a grid container is not a ceiling; the tallest item pushes it and
`align-items:stretch` carries every sibling along. It shipped twice in one
afternoon. The first version reported **30 findings**, all of them
`display:grid; place-items:center` icon tiles that hold one small child and
can never over-constrain anything. Narrowed to grids with a *flexible column
template* it reports 2 — and both were real: `.nav` (inert, 62 = 62) and
`.ladder__view`, whose child measured 558 inside a 495 box mid-fit. Both now
declare `grid-template-rows:minmax(0,1fr)`; verified inert at 700/800/900/1100.

**`tools/audit.js` §8 — state integrity.** Two checks, both from the facepile:

- *A per-item z-index and a state z-index must not collide.* This took **three
  predicates**. The first reported seven pieces of noise (message rows in a
  list all sit at z-index 1 and never touch). The second was clean — and
  **silently missed the fault it was written for**, because the two tied faces
  were two apart and never touched *each other*; they each sat over the face
  between them. The third narrows to peers of the same class inside a group
  whose boxes overlap: content layered over background art (`.panel` over
  `.close__art`) is two different things at one level and is fine.
- *A marker's anchor is the row, not the wrap.* Any absolutely positioned child
  of a `flex-wrap:wrap` offsetParent, because a percentage inset there measures
  the wrap including rows you were not thinking about.

Both were proved by injecting the regression and watching the check fire, then
watching it pass on the fix — which is now **R15**, because the second
predicate above would otherwise have shipped looking green.

**`tools/rules.py` — a blind spot in the linter itself.** Check 1 only ever
read `##`, so three gate sections written a level down were invisible: `4aa`,
which no rule pointed at and which would have failed the moment one did, and
`4y` / `4z`, which **reuse ids already taken by `##` sections**. Nine rules
point at those two, so each pointer resolves to one of two different sections
— the ambiguity this tool's own docstring calls worse than a dangling pointer.
`4aa` is promoted (nothing pointed at it, zero risk). The other two are
**reported as warnings, not fixed**: re-pointing nine rules is a judgement
about what each one meant, and those rows are another thread's work.

### Indexed

New in `RULES.md`, each with a gate pointer that `rules.py` now verifies:
**F41** (a per-item z-index and a state z-index must not collide), **F42** (a
marker's anchor is the row, not the wrap), **F43** (before adding a second
element to mark a state, check whether the first can carry it), **F44** (a
state is read against its neighbours), **R15** (prove a check against its own
bug), **R16** (an attribute is only an anchor if one kind of element carries
it), **R17** (anything a generator strips, it must also write). M5's pointer
moves to the new gate section; P13 gains the two token-source paths this week
used.

New gate section **QA §4ab**, which also carries the three measurement traps
that cost time this week: `getBoundingClientRect` reports the *unclipped* box,
axe must be sampled on a warm page, and a generator is verified by reading the
document back rather than by its own summary.

### Already covered, and worth saying

`tokens.py` **already** lints raw durations and easings — which is why the
520ms I briefly hand-picked for the ring's recolour was wrong to add and right
to revert. And C1 already says a graphic accent takes `--accent` while accent
*text* takes `--accent-solid` / `--accent-wash`; that rule did not need
restating, only following.

**Gate.** `tokens.py` 0, `check-html.py` balanced, `scopes.py` 0, `rules.py`
140 rules / 66 sections / 8 blocks all resolving. `audit.js` §1, §6 and the new
§8 PASS; axe 0. The two grid changes verified by screenshot — the header and
the workflow figure are unchanged.

---

## 2026-08-28 · one stroke, not two — and an element deleted

Tong: *"现在头像两个stroke 一白，一个橙，没必要呢，你可以直接让白色stroke变成橙
色。就可以"*

Right, and it deletes a whole element. The active face carried two concentric
rings: its own `--paper` seam, plus a separate `.wfo__halo` that slid between
the avatars behind them. **The seam is the state now** — one stroke that changes
colour, `var(--wfo-seam, var(--paper))` swapping to `var(--accent)` on the
holder.

What went with it: the `.wfo__halo` element, its CSS block, the `--hx`
`offsetLeft` bookkeeping in `app.js`, and the z-index reasoning about sitting at
8 so it could be above the faces it was not on and below the one it was. Net
−32 lines.

**It also ends the class of bug I fixed an hour ago.** A ring drawn by the
avatar's own `box-shadow` cannot be centred on the wrong box, cannot land behind
the face it is marking, and cannot fall out of register with a lift declared
somewhere else. Those were three separate faults in the same eight pixels, and
none of them is reachable any more.

**`--accent`, not `--accent-solid`.** This is a graphic, so its floor is 3:1
rather than 4.5:1, and `--accent` clears that on every ground the page has in
both themes. `--accent-solid` is tuned for text on paper and reads as a muddy
rust at a 0.17em width.

**One thing I changed and changed back.** I retimed the recolour to 520ms on the
theory that `--t-state` was firing far ahead of the 620ms lift. `--t-state` is
420ms — the gap was 200ms, not the four-fifths I had assumed, and a number
picked to close it would have been a duration outside the token scale for no
gain. It reads `var(--t-state)`.

**Gate.** Rings sampled through ten cycles: exactly one orange at a time, never
two (the occasional zero is a frame caught mid-recolour, when the interpolated
colour matches neither end). axe 0 across 18 samples on the live rotation, light
and dark, plus reduced motion. `audit.js` §1/§6 PASS, §5 PASS, `tools/tokens.py`
0.

> **Before adding a second element to mark a state, check whether the first one
> can carry it.** A marker that is part of the thing it marks cannot drift from
> it.

---

## 2026-08-28 · the handover ring was never on the face it was pointing at

Tong: *"头像切换有bug，头像active的动画能不能更明显一些，而且现在第三个头像active
的时候，第一个头像也在前边，看起来像两个头像被active，很奇怪。还有outline Stroke
也bug了"* — three separate faults in the same eight pixels, all measured rather
than guessed.

**The ring hung below the pile.** `.wfo__halo` centred itself with
`top:50%` — but `.wfo--team` **wraps**: the avatars are row one and the caption
is row two, so half of that box is well below the middle of the faces. Measured:
halo centre 566 against a holder centre of 552. Fourteen pixels, which is
exactly `(65 − 37) / 2`. The fix is `top:0`, because row one begins at the
container's own top and the container has no padding — so the ring is anchored
to the avatar row and cannot be moved again by whatever the caption does.

**And it was behind all three faces.** `z-index:1` against avatars at 7–9, so
the only part of the ring ever visible was the bit sticking out — which, being
14px low, was a stray orange crescent under the pile. That is the "outline
stroke bug": not a broken stroke, a stroke drawn behind everything. It now sits
at 8: **above the faces it is not on, below the one it is**, which is what lets
the holder's own paper seam mask the ring's inner half.

**Two faces looked active.** `.wfo__who{ z-index:calc(9 - var(--wi)) }` puts the
leftmost at 9, and the holder rule *also* said 9 — a tie. So with the third
avatar holding, the first was still sitting in front of the second, and the pile
had two visual tops. The resting stack drops to 4/3/2 (leftmost still on top,
which is the facepile convention) and the holder clears everything at 20.

**The lift was five screen pixels.** `-.3em` at this scene's fit-to-frame scale.
It is `-.62em` now and the holder also scales to 1.12 — and, more usefully, the
two faces beside it stand *down* to .94. A lift has to be read against its
neighbours; a lift against two neighbours that have stepped back does not.

**One lift, one scale, stated once.** The ring and the face it rides used to
declare `-.3em` independently, which is how they were free to drift apart in the
first place. Both now read `--wfo-lift` and `--wfo-pop` off `.wfo--team`, so
they cannot disagree — including under reduced motion, where the lift becomes
`0em` and the ring stays *on* the face instead of floating above a face that
never moved. The holder is still marked there, by the ring and by standing at
full size among two that have not.

**Gate.** Halo-to-holder offset measured at every one of the three positions in
light, dark and reduced motion: **dx 0, dy 0** in all nine. z-indices: holder 20,
halo 8, others 4/3/2 — no ties anywhere in the cycle. Holder 41px against 35px
for its neighbours. axe **0 violations across 24 samples taken on the live
rotation** (12 light, 12 dark), sampled while the handover was actually moving
rather than parked. `audit.js` §1 and §6 PASS, §5 PASS under reduced motion,
`tools/tokens.py` 0.

> **A percentage offset is measured against the whole box, including rows you
> forgot were in it.** `top:50%` on a wrapping flex container centres on the
> wrap, not on the row you were thinking of.

---

## 2026-08-28 · the product window is read out of the product, not remembered

Tong: *"1，怎么不同 tab 下边，高度还不一样呢？2. 你做我们自己的产品，怎么差的这么
远呢，你不借鉴一下我们的 design token & Components 吗？… connector card 可以活泼
一点，像我给你发的图一样。而且我感觉 logo 有点大"*

### The heights

Three tabs at 545, three at 552, Ad Campaign at 574 — the section jumped as
you moved along the strip. **`height` on a grid container is not a ceiling.**
`.ostage` declared `height:var(--o-h)` but its row track was implicit and
therefore `auto`, so whichever scene had the tallest artifact pushed the track
past the declared height and `align-items:stretch` took the frame with it. Now
`grid-template-rows:minmax(0,1fr)` and `.ostage > *{ min-height:0 }`. The same
fault existed one level down inside `.ochat--okou`, where it put the composer
62px below the window's own bottom edge. Verified at five widths: every tab,
every one of the three boxes, one number.

### The design system

The window was drawn from memory, and it showed. It used **this marketing
page's** tokens for something that is supposed to *be* the product: Instrument
Sans, 12px radii, greys mixed from black into white. Every value is now
transcribed from the repo, with the source named in the CSS:

| | was (invented) | is (vm0-ai/vm0) |
| --- | --- | --- |
| type | Instrument Sans | **Noto Sans** — already one of the page's loaded families, so no new dependency |
| sidebar | a 148px thread list I made up | the product's **68px labelled nav rail** (`sidebar.tsx`), 9px captions, `bg-gray-50`, `border-r-[0.7px]` |
| greys | `color-mix(ink 4.5%, paper)` — warm | the **cool ramp**: gray-50 `#F3F5F8` at hue 216, and the whole scale keeps that cast |
| radii | 12px | **20px** card / **24px** composer / **8px** controls |
| borders | none | **0.7px `#C5CCD7`**, the `.zero-card` hairline |
| shadow | `rgb(ink / .05)` | `--zero-card-shadow`, tinted 220/12% — the product's own source says a hard black tint "reads muddy on white" |
| user message | white bubble | **gray-100, `rounded-xl`, 15px/1.7, `px-4 py-3`, `max-w-85%`** |
| assistant message | white bubble | **transparent, no border** — the single biggest reason it did not look like the product |
| selected nav | a hand-picked grey | `--state-selected`, the ladder's own step (`hsl(215 100% 19% / .085)`) |
| icons | mixed | lucide at **`--icon-stroke-width: 1.5`** |
| run state | orange all-caps `DONE` | a muted **"Done"** pill — the product's labels are sentence case with no all-caps |

The rail is also **80px narrower** than the list it replaced, and the
conversation gets all of it back.

Dark is not an inversion: the product's dark ramp is a different scale
(240 3%) and `--card` sits *between* gray-50 and gray-100 rather than on
either. Both blocks are transcribed separately.

### The connector cards

*"活泼一点 … logo 有点大"*. The reference's cards are **shallow and wide**, and
its marks are small things inside a bordered tile — not the card's subject.
Ours were portrait blocks led by a 48px logo, which is a tile, not a card that
happens to be floating. Now: a row rather than a column, a 34px tile carrying
a **20px** mark, then the name, then the line under it. And a degree and a bit
of rotation in opposite directions, because two cards lying perfectly square
read as a layout no matter how far apart you push them — `rotate` rather than
`transform`, since the entrance animation owns `transform`, and squared off
again below 1080 where they sit in a grid row and the tilt would read as a
fault.

### Three more, found while building

**An earlier duplicate of a selector cannot be beaten from above.** The new
`.ocard__ic` was inserted before the original block, so the 48px logo survived
every attempt to shrink it. Edited in place instead.

**The ask was being clipped.** The artifact at its natural height was 300px in
a 373px list, so the bottom-anchored list pushed the user's own message up
under the title bar and left a sliver of grey — which reads as a rendering
fault, not as scrollback. Capped and cropped from the **top**, so what is lost
is the tail of the page rather than its headline. All three scenes measured,
not eyeballed: 356/382, 382/382, 382/382.

**The narrow rules still named the old classes.** Renaming `.okw__side` to
`.okw__rail` left the ≤1080 block styling elements that no longer exist. And
that block is declared after the 620px rule that used to drop the cards to one
column, so it was silently overriding it — at 390 each card had ~100px left
for text and "Google Sheets" broke over two lines with its detail over four.
`repeat(auto-fit, minmax(190px, 1fr))` decides for itself.

**Gate.** axe 0 violations across 28 warm mid-animation samples (14 light, 14
dark) on all seven tabs; the one hit in each theme was the first sample after
a cold walk, on `.wfo__*` / `.cgate__allow` — the page-wide entrance-fade
artifact already recorded on 2026-08-27. Sweep at 13 widths × 7 scenes × 5
timestamps, now also asserting frame height == stage height and that no card
covers a rail mark. `audit.js` §1 and §6 PASS, §5 PASS under reduced motion.
Height equality checked at 1120/1280/1440/1600/1920.

**Not done, and worth saying:** the `/ui-design` skill asks for a before/after
plus nine variant mockups before any code. This went straight to the
implementation because the ask was to correct an established design against a
known source, not to choose a direction — but the exploration was skipped, not
forgotten.

---

## 2026-08-28 · the run lands somewhere, and the handover is one moving thing

Three screenshots. *"图一，这个ui有点问题。图二，每个小人轮换也出bug了，而且我
觉得可以有更好，更流畅的动画来体现小人的轮换吧？图三，'agent 小人滚动各种
connector，最终发到了 slack 群里' 这个发到群里的行为不太明显。"*

**图一 · the question was a pill.** Measured first: it was not overflowing —
18px inset on both sides, 3px above the card's bottom edge. The problem was
the form. A ring-and-shadow bar filling the whole footer is a card inside a
card, and it sat three pixels off the edge of the one containing it. The
footer is already a delimited strip: it has the divider above it and the
card's own inset. The question just sits in it as a row now — text left,
answers right, no surface of its own.

**图二 · the lift never happened.** `.wfsc[data-step="3"] .wfo__who{transform:
none}` is the entrance rule, it carries the same specificity as
`.wfo__who.is-holding`, and it sits later in the file — so the holding avatar
was never lifted at all. What Tong saw as the rotation being broken was three
avatars changing opacity while the pile's stacking order stayed DOM order, so
the one that was supposed to be forward was still behind the one after it.
The state class is scoped to the beat now and wins on the attribute.

And the rotation is **one moving thing** rather than three animations arguing.
A single ring slides between the faces, spring-eased, and the avatar under it
rises — the same grammar as the runner on beat 1. Nothing changes opacity. The
first pass filled the ring and scaled it 1.34, which spilled below the pile
onto the caption and read louder than the three faces it was pointing at;
spread on a shadow reaches outside the box without taking layout, and the
avatar's own paper seam masks the inner half, so what is left is one thin
accent edge. It clears the caption by 2px, measured.

**图三 · the chain had nowhere to land.** The last step lit exactly like the
four before it and nothing arrived anywhere — the same fault as the save card
that flew with no landing row, two months of entries ago. A `#growth` message
turns up when the runner reaches the Slack step: Slack's own vocabulary
(`.slk__*`, the channel mock another session built this week) rather than a
second one invented for it, and Slack's own chrome in both themes (RULES P1).

It takes the **ask's** box, and the ask steps aside in the same beat. Three
cards do not fit in a 760×545 canvas, but one leaving as another arrives does
— and it is the truer sentence: you asked, here it is in the channel. It
lands ON TOP of the run card, lapping it by 4cqh, because the newest thing in
a picture cannot be under the card that produced it; a 1cqh graze was the
first attempt and that is the worst of both (RULES F9). The landing holds for
twice a step before the loop restarts: an arrival that leaves as fast as a
step is not an arrival.

---

## 2026-08-27 · the four beats tell the product's own story now

Feedback 07–11, taken as one piece of work rather than five patches: 07 and 08
are the Run beat, 09 is Save, 10 is Hand over, 11 is Automate — the whole
scene. Tong: *"都你来决定，做完我来验收，动效可以更活泼一些"*.

**Reading the product's strings first changed what this was.** The scene was
telling a story the object model does not have:

| what the product does | what the page drew |
|---|---|
| a workflow comes out of a conversation (`createInChat`: *"Start from a conversation when no workflow fits yet"*) | the user presses a **SAVE WORKFLOW** button |
| a workflow has **visibility: public / private**, public meaning shared inside your workspace (`visibilityHelp`) | a tag that says "Workflow" |
| other members build **automations** on it — schedule, Gmail, Calendar, GitHub, webhook are all trigger types | a list of three other **workflow names** |
| making it private **stops the automations other members built** (`visibility.confirmDescription`) | three static faces and a caption |

That last row is why 11 read as "不够直给": the panel was showing the wrong
object. Once it shows automations *on this one workflow*, the relationship
between a workflow and its schedule is self-evident — one workflow, three ways
it gets triggered, three different people.

**07 · the scenario** is `KOL Research to Partnership Draft` from the official
`workflow-automation-examples`: X · Notion · Google Sheets · Gmail · Slack,
five connectors ending in Slack, and a growth job rather than an engineering
one — the page's default audience is non-technical business users. It replaces
a four-step chain of which three marks were Okou or Notion.

**08 · the runner travels the chain.** A list that fades in tells you the
recipe; something moving down it tells you the job is being done. An orange
runner sits on the connector mark of whichever step is live and steps down all
five, the finished rows keeping a green ring. It rides *on* the mark rather
than beside it so the row cannot reflow as it passes, and its `--ry` comes
from `offsetTop`, which the scene's viewport scaling cannot leak into.

**09 · the agent asks.** The orange SAVE WORKFLOW button is gone. The footer
holds a question and two answers — *"Make this a public workflow?"* /
`Make public` · `Not now` — in the product's own words.

**10 · the card changes hands.** The facepile hands it over: whoever is
holding it lifts out of the stack and takes the header, and the caption is
now *"anyone in the workspace can run it"*, which is what public means.

**11 · automations, not workflows.** The right panel is the same workflow with
an `Automations` sub-head and three rows — `Every Monday, 09:00` (Maya),
`When a creator replies` (Dan), `Before the growth sync` (Ines). The card's
own chip changed from `Mon 09:00` to `3 automations`, because the schedule was
otherwise printed twice 200px apart.

**And one the rebase turned up.** `--ground` had no declaration anywhere —
the Slack-channel work removed the inline styles that set it, which exposed
that `.ladder__panel` is not in the markup at all. It, `.ladder__deck` and the
`.wfstage` base rules are leftovers from the sliding-panel design the single
`.wfsc` scene replaced; 78 lines, gone. The first attempt cut a comment in
half and `build-css.py` refused to write the file, which is exactly the trap
it was given that check for. The `.wfstage` rules still sitting inside the
narrow media query are also dead but interleaved with live ones, and this file
has another session in it — left for a pass that can be done carefully.

**Four things the build turned up:**

* **A live row hides its own connector mark**, and `chainRun(false)` was
  calling `chainTo(0)` — so the Gmail step simply vanished on every beat after
  the first. Off means off: clear both classes.
* **The byline and "Public" share the header's third grid cell**, and the rule
  hiding the tag sat *before* the `:not([data-step="1"])` that sets it —
  losing on order, not on specificity. "Public" showed as a ghost behind the
  name. `display:none`, after.
* **The card gained a fifth step**, so all four states were re-derived from
  the probe. Every subject is centred to within 1cqh again and the avatars lap
  the card's bottom edge by 13px rather than sitting 50px inside it.
* **The Gmail mark was being stretched** — its SVG is 134×100 and the mark is
  a 16px square with the default `object-fit:fill`. The audit caught it;
  `contain` fixes it for every non-square connector.
## 2026-08-27 · the stage becomes one frame, and Okou gets a window of its own

Tong: *"Slack 之外的其他 tab。左侧的那个头像应该用 agent 头像。另外现在 Slack
界面左边会有一个模拟的 Slack 设计样式。我们自己的产品是不是也可以模拟一个侧边栏？
然后我在想是不是可以把左边的 connector 这两个卡片和右边的这个对话界面放到一个
frame 里边 … 那些两个 connector cards 可以比较随机地和这个右侧的那个界面有一些
overlap。正好就可以，加一些这种带 gradient 颜色的背景。看起来就会更加简洁一些"*
— with a crop of this page's own workflow section as the reference.

**Okou's replies were wearing a person's face.** `avatar-1` is one of the six
human portraits, on messages signed by the agent. They take the product's mark
on a tinted disc, which is what the Slack panels already did.

**Our own product now has a window too.** Sidebar, thread title, run state,
composer — mirroring `.ochat--slack` deliberately, so switching tabs between the
two readings is a change of *application*, not of layout. Every string in it
already existed: the recent-thread list is the other tabs' own labels, the
placeholder is the hero composer's, the state chip is the workflow card's orange
mono. Chrome may be invented; copy may not. Unlike Slack's panel this one is
**not** pinned — it is our product, and our product has a dark mode.

**Three panels became one frame.** The row was a grey card, a tinted chat and a
grey card: three grounds in a row saying nothing. Now the frame is the only
ground, the app window is the only white, and the two connector cards float in
front of it — one hanging from the top, one from the bottom, the lower one
pushed further right so it laps further onto the window. An even pair of offsets
reads as a layout; an uneven pair reads as objects.

### Six faults, each of which would have shipped

**A custom property set on a child is invisible to its parent.** The hue lived
on `.ochat`, which used to paint the tint. The frame paints it now, so every
frame read grey until the scene restated it there.

**`span_of()` counted its own opening tag.** Starting the scan at `start`
instead of `start + 1` matched the element's own `<div`, so depth went to 2 and
the span closed one level late — it pulled a single row out of a four-row panel
and left it unbalanced by one.

**`scene_span()` ran to a landmark instead of balancing.** It ended at
`<figure class="tplwin">`, true only while the connector cards sat in a column
of their own. Once they moved inside the frame, *between* the window and the
artifact, that span swallowed them and the next run would have deleted both
cards. It balances now.

**`.ocard{ position:relative }`, five hundred lines later.** A rule that exists
only to give an `::after` a containing block quietly undid the absolute
placement the cards now depend on; both collapsed back into the flow and stacked
on top of each other. An absolutely-positioned element is a containing block
too — the rule did not need to set position at all.

**A shared `background` unpinned Slack.** `.scene[data-scene] .ochat` is (0,2,0)
and out-specifies `.ochat--slack{ background:var(--slk-card) }` at (0,1,0), so
the panel would have followed our dark mode — the exact P1 fault that shipped
once already. Caught by reading the rule, not by the theme. The fill is set per
reading now; only the shadow is shared.

**The window was sized by its content.** `.ostage__frame` is a grid, and its row
track defaulted to `auto`, so the moment the typing row appeared the whole app
grew 62px and its last message crossed the composer — **at every width**, which
is the tell that it is a sizing fault rather than an arithmetic one.
`grid-template-rows:minmax(0,1fr)`; the stage sets the height and the window
clips.

### And one that axe found

**A message arrived by fading in.** `.ochat.is-live .ochat__row{ opacity:0 }`.
Sampled mid-transition, the muted greys in a message's meta line — the AGENT
badge, the timestamp, the typing ghost — composite below 4.5:1. It reproduced
about one sample in ten, which is exactly how often a 320ms window falls under a
probe. It is text, so N3 already forbade it; **the seventh instance this week**.
It is a downward wipe now, paired with the same rise, which reads as the message
dropping into the list. `:not(.slk__ghost)` because the ghost runs its own
left-to-right wipe and this selector would have replaced it.

### Two things that were *not* faults, recorded so they are not chased again

**A row overhanging the composer, when the list clips.** `getBoundingClientRect`
reports the unclipped box, so a bottom-anchored `overflow:hidden` list reads as
a 16px overlap that cannot paint. The predicate is the list's own bottom against
the composer's top, not the row's.

**Fast-scroll axe hits on a cold page.** A probe that scrolls the whole document
at 520px/70ms and fires axe at a random instant caught `.rot .line`, `.arti__url`
and `#sceneCopy` — different page-wide entrance fades each time — at about 3
samples in 54, and never twice in the same place. On a warm page it is 0/20, and
frame timing is identical to HEAD (21ms average both; a one-off 816ms worst was
first-paint). Not a regression. The page's section-level `.reveal` entrance does
still animate opacity over text, and that is its own piece of work.

**Gate.** axe 0 violations: 21 light samples and 21 dark across all seven tabs
taken *mid-animation*, plus the two covered `.perms` beats in both themes, plus
20 warm fast-scroll passes. Corrected overlap sweep at **13 widths × 7 scenes ×
5 timestamps through each exchange** — clean, including the containment check
that no card escapes its frame and no card covers a sidebar's marks. `audit.js`
§1 and §6 PASS, §5 PASS under reduced motion (1 of 7 rows hidden: the typing
ghost, which is `aria-hidden` and has no moment without motion). Narrow layout
returns the cards to the flow and collapses Okou's sidebar to a 44px rail —
open, it took 110 of the 305px window at 390 and the first message wrapped to
six lines of three words.

**Still per-scene hue, not the reference's cream.** The reference ground is warm
off-white; this uses the tab's own `--tab` mixed into `--paper`, so Storefront
Launch reads warm, Lead Scoring rose, Board Deck lavender. Warm cream is the one
ground this page has already rejected (design-principles §4). Say the word and
it becomes the cream everywhere.

---

## 2026-08-27 · four of the seven scenes are a channel; the other three lost the photograph

Tong: *"你可以看一下哪些场景适合做slack多人协作的，然后把对应tab下中间区域做成
slack的多人对话流。其他适合单人的场景就还是以我们自己的界面样式为主，但是可以加
一些图二这个section的背景色，去掉背景图片"*

**The split, and the test that produced it.** The question is not "could more
than one person care about this" — everything passes that. It is "does this
work actually happen in a channel, with more than one person in it":

| scene | reading | why |
| --- | --- | --- |
| Storefront Launch | `#launch-litoral` | brief, build, review, announce — four hands |
| Incident Triage | `#incident-checkout` | incidents ARE a channel: responders, a bot posting, an on-call handover at 7:40am |
| Team Digest | `#team` | the output *is* a channel post. "Post it to #team." |
| Ad Campaign | `#paid-acquisition` | "a draft in Meta, waiting on you" — the approval is the collaboration |
| Lead Scoring | Okou's own UI | a background job whose hand-off is to HubSpot, not to people |
| Spec Writing | Okou's own UI | one PM writing; shared for comment afterwards |
| Board Deck | Okou's own UI | one exec, before a board meeting, confidential by nature |

Copy is close to verbatim where a line already existed. The brief was to change
who is in the room, not what the work is.

**`tools/slack-scene.py` became `tools/slack-scenes.py`, data-driven.** One
`SCENES` dict, one `build()`, and every row carries its own `data-cue`, so a
scene's timing no longer depends on an array indexed by row order and shared
with the scenes that are not Slack.

**The bug that made the first run silently overwrite one panel four times.**
`scene_span()` looked up `data-scene="<key>"` and then walked forward to the
next `<div class="ochat">`. But **the tab buttons carry `data-scene` too**, and
all seven of them sit above all seven panels — so every key found its tab, then
walked into the *marketing* panel. Four builds, one target, and the generator
still printed `slack scenes: ads, engineering, marketing, ops`. It reported on
its intent, not on the document. The anchor is now
`<div class="scene…" data-scene="<key>"`, which only the panel matches, and the
verification prints each scene's *actual* channel name rather than trusting the
generator's own summary.

> **An attribute you search for is only an anchor if exactly one kind of
> element carries it.** Check that before writing a splice, not after.

**The wash, and why it is not cream.** The three single-person scenes lose the
painted photograph. It was doing two jobs — separating the panel from the page,
and giving each tab its own colour — and only the second is worth keeping. They
now take a soft radial wash in **their own scene hue** (`--tab` restated on the
panel, mixed 17% → 7% into `--paper`), not the warm off-white of the reference,
because warm cream is the one ground this page has already rejected as *"太
AI"* — see `docs/design-principles.md` §4. It also follows the theme, where the
photograph could not: in dark mode the wash becomes a dark tint of the same hue,
while the Slack panels stay pinned light, because Slack is Slack (P1).

**The hue restatement had to move into the generator.** It was first set by a
one-off script — and the generator's own wash pass rewrites that same `style`
attribute, so it was gone on the next run. Anything a generator strips, that
generator has to also write.

**Two participants read as the same person.** `avatar-1` and `avatar-4` are both
light-skinned and auburn, and at 36px they are indistinguishable; `#team` cast
Noah as 4 and Ravi as 1, in the same thread. Ravi took 3. No thread may cast
both, and the facepiles were re-cast to match.

**A pre-existing dark-mode violation, found by gating properly.** `.perms` stood
down at beats 2 and 4 with `opacity:.3`. On the dark ground that composites the
label ink to **1.8:1** and axe called it — one serious violation, 19 nodes, and
it was there at HEAD before any of this. **This is the sixth `opacity`-on-text
bug this week** (`.arti__val`, `.par__ask`, `.ocard`, `.lead-in`, `.slk__ghost`,
now `.perms`). It stands down by *focus* instead: `filter:blur(3px) saturate(.6)`
plus `scale:.985`, and app.js sets `aria-hidden` on the same beat, because a
panel covered by another panel is not content while it is covered. It also
simply looks better — a list behind a modal genuinely is out of focus.

**Gate.** axe 0 violations across 14 samples on all seven tabs at 1440, plus
light and dark at the two covered beats. Overlap sweep at **13 widths** (390,
600, 768, 900, 1024, 1080, 1120, 1200, 1280, 1360, 1440, 1600, 1920) × four
Slack panels: no message crossing the composer, no row escaping the pane —
this sweep exists because the composer-through-the-last-message bug shipped
past a four-width check. `audit.js` §1 and §6 PASS, §5 PASS under reduced
motion. Mobile 390 checked by eye.

---

## 2026-08-27 · the prompt box types, and three of its four icons were wrong

Tong: *"看看 hero有什么问题，button和prompt box在一起会不会有点奇怪？另外prompt
box可以active。icon有一个用错了，你去看一下我们的组件 … 展开的小modal是否用了
design token？怎么感觉stroke这么重？"*

**He found one wrong icon. There were three.** The composer's left group is
`Paperclip`, `SwatchBook`, `Route`, `Plug` — read out of `chat-composer.tsx`,
where the template picker renders `<SwatchBook size={18} />` and the workflow
prompt renders `<Route />`. I had shipped `LayoutTemplate` for the template
(wrong component entirely) and hand-drawn `Paperclip` and `Plug` from memory,
both of them older revisions of paths lucide has since redrawn. All four are
now lifted verbatim from `lucide-static`, and `Route` was added, so the group
is the app's four rather than my three.

*A path drawn from memory is a guess with the confidence of a fact.* Fetch it.

**The stroke is not heavy — the popover's edge was.** Measured: the icons
render 18px from a 24 viewBox at `stroke-width:2`, which is 1.5px effective —
exactly what `lucide-react` does at `size={18}` in the product. What read
heavy was the unlock note, which carried a 0.7px ring AND `--e-2`'s 54px blur.
The platform's own Popover is `w-72 rounded-[12px] border-[0.7px]
border-[hsl(var(--gray-400))] bg-card p-4` — **and no shadow**. Two edge
treatments on one 288px card is what made the outline shout. It is the
platform's popover to the pixel now: 288px, 16px padding, border only.

**Tokens, since he asked:** everything in the note comes from one —
`--paper`, `--r-card`, `--ink`, `--ink-soft`, `--accent-solid`, `--t-meta`,
`--fb`, and the box's own derived `--pbox-edge`. The two exceptions are the
16px title and the 34px button, which are the APP's `text-base` and button
height, not this page's scale, and are commented as such (RULES F31).

**The box types now.** It was a `<p>` pretending to be an input, which is a
picture of a composer rather than a composer — and the first thing anyone does
with a box like that is click in it. It is a real textarea: it grows from the
app's own 96px floor, Enter sends (Shift+Enter is a newline, as in the app),
and sending opens the same unlock note every other control does. The focus
state is `.zero-composer:focus-within::after` 1:1 — a second 0.7px edge one
step darker plus a wide low veil, on its own layer so the state animates
through opacity instead of repainting the card.

**And yes, the buttons beside it are odd.** Three calls to action inside
240px — a filled orange button, a secondary beside it, an orange send key
below — and pressing anything on the box produces a fourth. v0 and Cursor,
the two heroes built around a prompt box, carry no buttons at all: the box IS
the entry point. `data-cta="box"` hides the pair; the default stays as it
shipped, because removing a hero's primary CTA is a funnel decision rather
than a design one.

A third arrangement — buttons UNDER the box — is not shipped. `.hero__cta`
and `.showcase` are siblings of `.stack`, so reordering past the figure with
`order` alone dissolved `.stack` into the panel's 12-column grid and set the
paragraph one word per line. It needs `.hero__cta` promoted to a direct child
of `.hero`, which is a markup change worth making only if that is the one
chosen.

---

## 2026-08-27 · the type scale had no lint, which is why nobody could answer the question

Tong: *"你是不是改了字体大小，要不要更新一下design tokens，同步到所有section？"*

**No page token changed value**, and syncing would be the wrong move. What
actually changed in this session was all inside product mocks: the workflow
scene went from six sizes to three (his own *"字号一大堆"*), `.state` went
10.5→11px, and the new prompt box brought the app's 14/16px. The hero variants
*re-assign* existing tokens to the rotator — `--t-body` for `fold`, `--t-sm`
for `eyebrow` — and introduce no new value.

A mock keeps the APP's type scale on purpose (RULES P1). Pushing `--t-*` into
`.perms` or `.pbox` would make the drawings stop looking like the product,
which is the whole reason the exemption exists.

**But the question had nothing to check itself against, and that is a real
defect.** Two of them:

* **`tokens.py` linted raw radius and not raw font-size.** So 48 raw px sizes
  had collected in the design layer with nothing to catch them — and it is why
  the prompt box came out with its radii and heights named (`--pbox-r`,
  `--pbox-ctrl-r`, `--pbox-ctrl-h`, because the radius lint fired) and its type
  left as bare numbers (because nothing fired). There is a `raw type size`
  check now, scoped to the design layer and exempting mocks the same way the
  colour and radius checks do. Verified by breaking `.hero__body` to 18px and
  watching it report.
* **The type census was exempting a third of the mocks.** `.arti .tsh .lane
  .vsui .wfsc .wfo .par .ochat .ochip .ostage .cbox .cgate .cnet .ctrail
  .vs__viz` were all missing, so it counted the app's type as the page's,
  reported 24 sizes, and told nobody anything. The checklist's claim of
  **11** was measured with that broken list.

The real number, with the mocks properly out, is **14 at 1440x900**, and every
one is accounted for in `qa-checklist` §5: eight are `clamp()` display and
heading tokens evaluated at this viewport, four are `--t-body/-sm/-meta/-mono`,
one is `--q-name` (`calc(16 * var(--qu))` — the testimonial card scales with
its container), one is `.vs__vs` at `.86em`. Nothing off the scale.

**It earned its keep on the first rebase.** The Slack-channel scene that
landed while this was being written brought a new mock family, `.slk__*`, and
the gate immediately reported nine — seven raw radii, two raw durations and
one raw 9px — because `slk` was not on the mock list. All nine are correct as
written: the scene draws Slack, so its corners and timings are Slack's. What
was missing was the declaration that it is a mock, and that is exactly the
thing a list like this exists to force.

Also removed: `.announce`'s 10px responsive rule. There is no `.announce` in
the markup — dead CSS for a component that does not exist, same as `.ph` an
entry ago. And `.state`, which lives only inside `.perms`, joined the mock
list rather than being dragged onto the page's scale.

---

## 2026-08-27 · the hero stops being a white slab, and stops arguing with itself

Tong: *"header的三段text设计有点粗糙 … 你也可以去做一些网站hero调研 … hero可以用
默认的背景色现在hero白色背景和下边的section截开有点奇怪"*.

**The ground.** Every section on this page is a white card floating on
`--wash`. The hero was the one full-bleed white panel, so it ended in a hard
seam against the first grey gap — the page started as a white sheet and then
turned into cards. It sits on the page's own ground now. That also fixes
something the prompt box needed: white-on-white gave it nothing to be a
surface *against*, and white on `--wash` is exactly the relationship the app's
composer has with the app's background.

**The three text blocks.** Measured the field before touching anything:

| | hero text stack |
|---|---|
| Linear | 64px headline → 15px body. Two tiers. |
| Attio | 13px eyebrow → 64px headline → 18px line. Two tiers and a marker. |
| v0 (a prompt-box hero, like ours) | one 32px line. That is all. |
| Cursor | one 26px sentence, left. |

Nobody stacks a display, a mid-size sentence and a paragraph. Ours was
96 / 38 / 20 — three centred, grey-ish blocks in one typeface — and the middle
one read as a second headline arguing with the first. The two with a prompt
box in the hero are the most direct about it: when the box is the signature
element, the copy above it collapses to one line.

Three ways out, on `data-hero` so the choice is one word rather than a
rewrite, and all three keep every word — the copy is not ours to cut, only its
arrangement:

* **`fold`** (default) — the rotating line drops to body size and becomes the
  leading sentence of the paragraph, full-strength ink against the paragraph's
  softer grey. This is the page's OWN rule, already written down for sections:
  *"a section's claim, folded into the first sentence of its paragraph … it
  carries more weight than the sentence after it"*. The hero was the one place
  not obeying it.
* **`eyebrow`** — the rotating line moves above the display at 15px, quiet.
  Attio's shape. It gives the rotation a reason to exist and hands the display
  the top of the page.
* **`cut`** — the middle tier leaves the hero entirely. What v0 and Cursor do.
  The boldest, and the only one that loses five lines of copy, which is why it
  is not the default.

**Three lint failures came in with the rebase**, from the Storefront Launch
commit rather than this one: `.ochip` and `.ochip__ic` had raw radii, and
`.ochat__at` painted `var(--accent-ink)`, which is not declared anywhere — so
the one coloured word in that panel was falling back to inherited ink. The
comment above the rule says `--accent`, which is what it is now.

**`cut` did nothing on the first pass.** `#rotator` sets `display:block` from
an ID, which outranks `.hero[data-hero="cut"] .display--tail`. The screenshot
is what caught it — the variant rendered identically to the default and the
CSS looked correct.

---

## 2026-08-27 · the hero is the product's own prompt box

Feedback 02 — *"这个页面有三个方向：1. chatbox 2. UI 页面 3. 品牌向的
storytelling"* — resolved as (1), with the spec: *"做成prompt box，一比一的
prompt box … 用户点任何prompt box上的btn都会出发unlock的弹窗 … 用我们的
Design token & styles"*.

**Every number in it is read out of `turbo/apps/platform`, not eyeballed from
a screenshot.** The live app is behind auth, so the reference is the source:

| | value | where it comes from |
|---|---|---|
| shell radius | 24px | `--zero-composer-radius: 1.5rem` |
| shell border | 0.7px | `.zero-composer` on `gray-400` |
| shell shadow | `0 2px 12px` + `0 0 0 .5px` | `--zero-card-shadow` |
| editor inset | 16px | `px-4 pt-4` |
| editor height | 96px (68 under 560) | `min-h-[96px]` / `min-h-[68px]` |
| control row | 16px, 4px above | `px-4 pb-4 pt-1` |
| control size | 32px | `size="icon-sm"` → `h-8 w-8` |
| control radius | 8px | Button's `rounded-lg` |
| glyph | 18px | `iconSize="md"` |
| icons | Paperclip, LayoutTemplate, Plug, Mic, ArrowUp, ChevronDown | the composer's own lucide imports |
| placeholder | "Ask me to automate workflows, manage tasks…" | `chat.composer.placeholder`, en-US |
| picker label | "Select model" | `chat.composer.selectModel` |
| picker on mobile | collapses to a 32px icon | `h-8 w-8 px-0 sm:w-auto sm:px-3` |

**Colour comes from this page, not the app.** Same brand orange either way, and
a mock that ignored the page's ink would be the one thing on it that does not
follow the theme. One exception, named where it lives: the shell's edge. The
page's `--hairline` is its divider weight, and the composer's edge is what
makes the box read as the product's at all, so it is taken from the ink
channel at the alpha that lands on the app's own `gray-400` — derived, not
typed, and it therefore swaps with the theme.

**The unlock note.** Every control on the box looks live and none of them can
be, so all of them say the same thing. It is a popover hanging off the box
rather than a modal over the page — nothing here is destructive and nothing
needs the page dimmed to be understood — and it moves under whichever control
was pressed, instead of sitting in the middle and making you look for what you
just clicked. Its button is the PRODUCT's, not the page's: sentence case, 8px
radius, brand primary. Every button on this page is mono uppercase; inside a
picture of the app that would be the one thing in the frame that is not the
app (RULES P1) — and it matches the platform's own rule that a dialog's
primary is the brand colour while a page's primary is the dark neutral.

**Three things the build turned up:**

* **The hero clips**, and the section under it is a card that would cover
  anything escaping anyway — so the popover's room had to be *inside*. The box
  moved up by what the bottom reserve grew, which leaves the hero's height
  alone.
* **The popover had no edge in dark mode.** Its ring was `rgb(var(--ink-rgb) /
  .06)` — the shadow channel again, which does not swap with the theme, so it
  drew near-black on near-black. Same defect as the index bar two entries up,
  found the same way. It takes the box's own derived edge now.
* **`.ph`, the image placeholder, is gone** — the hero was its only user, and
  a component nothing references is dead weight in a file people read.

`.pbox` is on the two MOCK exemption lists in `tools/audit.js`: it draws a
border because the app draws a border, which is exactly what the exemption is
for.

---

## 2026-08-27 · the nine that did not need a decision

Tong sent 22 annotated screenshots (web-design-feedback.sites.vm0.io) and asked
for the small ones to be changed outright, with the rest held for a round where
he can rule on them one at a time. Nine were unambiguous. What each was, and
what was actually wrong:

* **01 · the grey header.** *"灰色导航bar 显得不好看"*. A fill is right for a
  header that floats over content — it is what makes it legible over anything
  (RULES S3) — but at the top of the page it is not floating over anything
  yet, and a grey slab across the window above a white hero is just a band of
  grey. It takes its ground at the moment it becomes a card (`is-stuck`), and
  the dark version follows the same rule.
* **01 · the hero rides up.** *"感觉有些往上蹿"*. With no ground under the
  header, the first line sat under the window edge with nothing between them.
  +36px of hero padding at every size.
* **04 · the digest's connectors.** *"左边的 connector可以是 asana, google
  drive, linear 之类的"*. They were Slack and Google Calendar — the output and
  the trigger — on a rail labelled *what the run reached into*. Now Linear
  ("shipped issues read from the team board") and Google Drive ("specs read
  from the shared folder"), which are what a digest reads FROM. No Asana icon
  in the set; Linear and Drive are both in it.
* **05 · the metrics.** *"这个太多层了"*. Three grey tiles inside a white card
  inside a white section card — three grounds to say one thing, and the middle
  one said nothing the section card had not, being the same colour one shadow
  away. The tiles stay; the card they sat on is gone.
* **06 · the connector wall.** *"感觉这个灰色好重"*. Forty tiles at `--wash-2`
  read as a grey band with logos in it: at that count the tile is the pattern
  and the mark is the detail, so the tile steps back to `--wash`. One tile
  alone would still take `--wash-2`.
* **13 · four chats, one job.** *"这里的标题可以有些序列感 … Launch campaign A -
  landing page"*. Four unrelated titles read as four errands. A shared
  "LAUNCH CAMPAIGN" kicker on its own line above each title — repeated on
  purpose, set small and muted so it reads once, as a group tag. No numbering:
  `01 /` on each would read as filing, not sequence.
* **15 · the agent-settings chrome.** *"这一部分的 UI 都可以去掉"*. Breadcrumb,
  agent identity row and tab strip removed from the permission mock, along
  with the beat-5 rules that drove the tab strip and the base.css rules behind
  it. Beat 5 still swaps its body; it just no longer explains itself with a
  tab.
* **22 · the secondary button.** *"感觉这个灰色的button 怪怪的"*. On the closing
  band the ground is `--wash` and the button was `--wash-2` — one step apart,
  which does not read as a button, it reads as a smudge. On that ground it
  takes `--paper` and an elevation. Scoped: on the white section cards
  `--wash-2` is still right.
* **22 · the tail.** *"太高了"*. The closing section's padding was sized for
  the drawing as if the drawing needed clearance; it does not, because the
  buttons can sit on its empty sky. 8vw→5.6vw on top, 22vw→16.5vw below.

**Held for the next round, and why:** 02 (three directions for the hero visual
— his call), 03 / 07 / 08 / 10 / 11 (scenario and narrative rewrites), 05's
second half (per-scene numbers, which need his prototype), 09 (the save button
is factually wrong about the product — the agent should ask; the replacement
is product copy), 12 (which sentence is ambiguous from the annotation), 14 and
16 (copy and the real product card), 17 (a new figure), 21 (three abstract
cards replacing the comparison), and 19+20 (demote the whole security block).

**18 is held even though it looks small.** *"这个也太多了，不需要表达"* — the
network card is beat 4's only content, and `.perms` is at .3 behind it.
Deleting it leaves that beat showing a dimmed list and nothing else. It is the
same decision as 20, not a separate one.

---

## 2026-08-27 · the frame follows the window, the picture sits in the middle of it

Tong: *"图一没有上下居中，底下的step组件位置也错了，应该一直在灰色的frame里，
灰色frame的高矮取决于Browser的高度。frame里的展示图应该用户按左右上下居中"*.

Three things, and the first two share a cause.

**A transform does not move a layout box.** `.ctrl__win` is scaled with
`transform:scale()`, and the index bar was a plain sibling after it — so the
bar was laid out after the mock's FULL-SIZE box while the frame was only as
tall as the *scaled* one. Every point of scale pushed the bar further past the
frame's bottom edge; at 0.87 it was outside it entirely. It is out of flow
now, riding in the frame's bottom padding like a caption on a mat, which is
also what lets the picture be centred in the whole frame rather than in a row
above it. The padding band it sits in was already clear of the picture, so it
costs the picture no height.

**The frame's height now comes from the window** — `innerHeight` minus the
same clearance top and bottom — rather than from the mock. Its proportions
were following the content around instead of the browser, and whatever height
was left over collected on one side.

**And the picture is centred in it, both ways.** `align-items:center` was not
enough on its own: with no `grid-template-rows` the implicit row is `auto`, so
it grew to the item, a picture taller than the frame made the *row* taller
than the frame, and there was nothing left to centre inside — the whole
overflow went out of the bottom and got clipped. `minmax(0,1fr)` pins the row
to the content box, an oversized item then overflows it equally at both ends,
and the scale, taken about the item's centre rather than its top, lands the
picture in the middle. Measured in all five beats at 390x844, 1024x640,
1024x768, 1280x800, 1344x1095, 1440x700, 1440x900, 1600x1200, 1920x1080 and
2560x1440: top gap equals bottom gap, left equals right, index inside, nothing
clipped — and every statement still lands within 1px of the frame's centre.

**A shape cap, because "as tall as the window" has a limit.** At 2560x1440 it
made the frame 616 wide by 1236 tall: a narrow grey slab with a card swimming
in the middle. It is capped at 1.6x its own width — the frame's width does not
depend on its height, so the cap cannot feed back — and it only bites above
about 1250px of window.

**Found on the way, and real:** the four unlit index marks were
`rgb(var(--ink-rgb) / .10)`. `--ink-rgb` is the *shadow* channel and does not
swap with the theme, on purpose (§1), so in dark mode the marks painted
near-black on a near-black ground — 1.09, i.e. they were not there at all.
`--ink` swaps; at 13% it is 1.32 in light and 1.46 in dark.

The three probes this took are in `tools/probes/` now rather than in /tmp,
where they were lost twice. They are the gate for this section.

---

## 2026-08-27 · the stage was measuring itself

Tong, with two screenshots of #control at 1344x1095 and 1330x801: *"这个区域
Responsive各种问题，你自己全方位检查一下，修改移动端，小屏幕，大屏幕的适配问题"*.

**The stage measured itself.** `ctrlWin` is named like `.ctrl__win` and holds
`#ctrlframe`. app.js §13 read *that* element's `offsetHeight` as "the natural
height of the mock", then wrote the answer straight back onto the same element
as `--ctrl-h` → `.ctrl__frame{height}`. So each pass read the number it had
just written, added the frame's own padding, and `Math.max` — which by design
only ever climbs — kept it. It ratchets one `pad` per ResizeObserver callback
until `fit` drops under 1 and the arithmetic reaches a fixed point: **963px of
frame around 622px of content**, converged, self-consistent, and wrong. The
band of empty grey under the mock was that 341px gap, and the mock was being
scaled to 0.93 to fit a frame that only needed to be 687.

It measures `.ctrl__win` now. The frame comes out 687–694 around 622–626 of
content at every window — padding, and nothing else.

**The sticky offset was fixed, so the columns only aligned at one window
height.** Every step but the first becomes current at the *middle of the
viewport* — that is what the IntersectionObserver decides — but the frame
parked at `--nav-h + clamp(20px,2.6vw,40px)`. When those two lines are not the
same line, the statement sits high by half the difference: 91px at 1095 tall,
and growing with the window. The offset now centres the frame in the viewport
and only falls back to bare header clearance when the window is too short to
centre in. `--ctrl-clear` is registered as a `<length>` so app.js can read the
clearance as a number instead of the token string `calc(var(--nav-h) + …)` —
and so that writing `top` cannot be read back as the input to `top`.

**The height budget was asymmetric, which made centring impossible.** It
reserved the header's clearance at the top and 16px at the bottom, which buys
a slightly larger mock and guarantees the frame cannot be centred under the
header: at 1280x800 the frame came out 671px in an 800px window, so
`(innerHeight - frameH) / 2` fell under the clearance, the offset clamped, and
every statement sat 31px above the frame's centre. Reserving the same
clearance at both ends costs about 12% of mock scale at 1280x800 and buys
alignment at every size. Measured, five steps, eight window sizes: every
statement's centre is now within 1px of the frame's centre at 1024x768,
1280x800, 1344x1095, 1366x768, 1440x900, 1512x982, 1600x1200, 1680x1050,
1920x1080 and 2560x1440.

**Fitting to the viewport was still running in the stacked layout.** Below
1000px the stage is `position:static` and simply flows, so there is nothing to
fit — but the scale kept applying, and at exactly 1000px wide it put 819px of
content inside a 904px frame. It now reads `getComputedStyle(stage).position`
rather than repeating the breakpoint, and is 1.0 whenever the stage is not
parked.

Two smaller things the sweep turned up, both real:

* **the five step buttons are 38px tall** — `.btn--sm`, the one place on this
  page where a genuine tap target falls under the 44px floor. Raised on coarse
  pointers and in the stacked layout; desktop proportions untouched.
* **`.state` was 10.5px**, half a pixel under the page's own floor. 11px.

A known limit, recorded rather than fixed: when `fit` drops below 1 the mock
shrinks but the frame keeps its column width, so a short window leaves more
air at the sides than at the top — 92px against 48px at 1024x640. Every fix
for it couples the frame's *width* to the scale, and the content reflows
inside that width, which is the same feedback loop this entry is about. The
side air is the price of not reintroducing it.

---

## 2026-08-27 · the teammates are a stack, and they scale

Tong, on the step-3 figure: *"这里的头像可以变成stack的方式"*.

Three separated avatars are three people who each did something; a
facepile is one group who share a thing, which is exactly what the
sentence under it says. They lap by a quarter of an avatar, ringed in the
card's own paper so the seam reads on both the card and the ground they
straddle, leftmost on top so the group is read left to right.

**It did not work the first time, and the reason is worth keeping.** The
block was a three-column grid so the caption could span the full width —
but a grid distributes a spanning item's size back over the tracks it
spans, so a 262px caption pushed the three `auto` avatar columns apart and
quietly ate the negative margins that make a stack. Nothing looked broken;
the avatars simply stayed where they were. Flex-wrap with the caption at
`flex:0 0 100%` gives the same two rows without the feedback loop.

**And the avatars were 34 hard pixels** — the `width` attribute, never
overridden. Every other number in this scene scales with the canvas, so
the faces grew and shrank *relative to the type beside them* at every
window size. Sized in em now, with the ring in em too: 37.5px at 1920,
26.3px at 390, and a lap of exactly 25% at both.

---

## 2026-08-27 · the scene is a layout, not an arrangement

Tong, with three screenshots: *"icon太小了。header右边的padding和左边的padding
不一致。两张卡的距离太近了 … icon如果是圆形就圆形，方形就和header统一，不要有
椭圆的。图二的头像第一版做的就挺好，应该和card有overlap，并且文字可能需要换个
位置。图三两个cards没有居中 … 整体检查一下字体大小和字重，比如图三的字号就一
大堆。看着很不舒服。即使是视觉展示，ui和Responsive也要严谨"*.

Seven complaints, five root causes. Each one was a number that had been
guessed instead of derived.

**Composition was done with `transform:scale()`.** Five resting states
carried `.85`, `.8`, `1.04`, `.8` and `.78`, so the same 12.5px label
rendered at five sizes and a `.78` card sat beside a `1.0` list. That is
what "字号一大堆" was looking at — not seven type sizes but one type size
photographed through five lenses. Every resting scale is gone; objects
move and fade, and nothing changes size except during an entrance.

**The type scale had six sizes, three of them inside 5% of each other.**
17.6 / 16.7 / 16.2 / 15.9 / 12.0 / 11.4. Three near-identical body sizes
do not read as a hierarchy, they read as carelessness. Collapsed to
three: `1em` for a card's name, `.88em` for anything read as a sentence,
`.68em` for anything read as a label — with nested sizes stated as the
fraction that lands back on one of the three, so a label inside a `.88em`
row is written `.77em`.

**Every inset was written `1em`, which meant four different insets.**
`1em` resolves in each element's own font-size, so the header indented
17.6px and the list rows 15.5px — the row dots sat two pixels inside the
icon directly above them. Hoisting it to `--wfo-pad:1em` on the card was
not enough either: an *unregistered* custom property inherits as raw
tokens, so the `em` was simply re-resolved in the child, which is the
same bug wearing a variable. `@property --wfo-pad{syntax:'<length>'}`
makes it compute once, in the card's em. Header, steps, rows, footer and
chip now all land on 17.6px, measured.

**The header tag was absolutely positioned.** `right:1.1em` against a
`1em` left padding is a 0.1em asymmetry you can see, and the title
reserved room for it with a guessed `padding-right:6.5em`, so a longer
tag was cut off — "RUNNIN". It is a three-column grid now: one inset on
both sides, and the tag has its own track, so it cannot collide with the
title at any width.

**The canvas was the wrong shape for its contents.** At 760×460 the card
measured 59% of the canvas height on its own, which is why step 3's
avatars ended up *inside* it and step 4's pair had 2cqw between them.
Measured the card (18em: header 4.2, steps 11.3, footer 2.7), derived
545 from it, and re-placed all four states from the probe rather than by
eye. Every state's subject is now centred to within 1cqh, the step-2
memory recedes straight up on the card's own axis instead of drifting
left, the step-3 avatars lap the card's bottom edge by a third of their
height with the caption dropped to its own row below, and step 4's two
cards are centred as a pair with 8cqw between them — the run card giving
up 6cqw of width so the list has room to set every name on one line.

**The empty footer.** Steps 1 and 3 hid the footer with `opacity:0`,
which left a 4.2em blank band inside the card and made the avatars lap
into nothing. It collapses now.

**And the responsive bug underneath all of it: `2.05cqw` on the canvas
was measuring the frame.** An element is never its own container, so a
container unit written on `.wfsc__cv` — which *is* the container —
resolved against the scene outside it. Whenever the canvas was
height-capped the type came out oversized relative to it and every object
grew in percentage terms: the card ran 37cqh tall at 1920×1080 and 43cqh
at 1024×900. The composition only ever held at one window size. Written
as `min(2.05cqw, calc(2.05cqh * 760 / 545))` it is 2.05% of whichever
dimension the canvas actually took, and the four states now measure
identically at 1024×900, 1280×760, 1440×700, 1440×900 and 1920×1080.

Two of these were found only because a probe was fixed first. `resize`
is not a command — it is `set viewport` — and the four "identical across
every viewport" readings that looked like a pass were four readings of
the same 1440px window. And the inner-alignment numbers were nonsense
until transitions were disabled, because a 640ms transform was still
running under the measurement.

---


## 2026-08-27 · the flicker, the icons, and a panel that had nothing to sit on

Tong: *"动画跳闪了一下。icon不太好看，找圆角实心icon，去开源icon库找。现在这个
slack对话框和背景差别不大。融在一起了"*.

**The flicker was a 42px layout jump, twice per play.** The typing
indicator was a message-shaped row inside the list, toggled with
`display`. In a bottom-anchored column that moves everything above it —
measured, the first message's top ran 398 → 356 → 398 as the ghost line
appeared and left. It is a **reserved 17px slot** between the list and the
composer now, whose height never changes, which is also where Slack puts
its own typing indicator. First message holds at 379 through the whole
play.

Getting it out of the list meant the shared cue array no longer described
this scene, so rows carry `data-cue` / `data-until` and the loop prefers
them. The array is indexed by row order, which coupled every scene's
timing to every other scene's row count; the six older scenes keep it.

**The icons were drawn by hand.** They come from real libraries now:
the composer's send mark is **Phosphor Icons** `paper-plane-tilt`, fill
weight (MIT) — rounded and solid, inlined because it has to inherit
`currentColor`. The reaction is real **Twemoji** `2705` (CC-BY 4.0),
vendored to `site/assets/icons/` with its licence beside it rather than
loaded from a CDN. Still not a font glyph: an emoji character renders as a
different picture on every operating system, which is the opposite of high
fidelity for a component whose job is to look like a screenshot — and the
page still contains no emoji *glyphs* (T6).

**The panel dissolved because it was the lightest thing in the row.**
Pure white on a section that is also pure white, separated by one
`#E4E6E9` hairline — and the connector cards beside it are `#F6F6F6`,
*darker* than it. It had nothing to sit on.

Two things fix it, and the first is the answer to "make it more like
Slack" as well: **Slack's dark sidebar**. A 44px aubergine rail cannot
blend into anything, and it is the single most recognisable thing about
the product. The second is a **window shadow**, which is the one case S3
reserves a shadow for — a product window sitting on a section.

The rail costs 44px of a panel that was already tight, so the eleven-width
sweep was re-run: no overflow, no clipping and 25px of composer clearance
from 390 to 1920.

**And the resting frame was announcing that Okou was still typing.** The
ghost line's hidden state was scoped under `.is-live`, so with no JS or
under reduced motion it sat open permanently — four messages after the
work had shipped. Hidden by default, shown only when cued; its dots stop
under reduced motion.

## 2026-08-27 · the Slack panel at high fidelity

Tong: *"很多ui bug，检查一下，我说了就算是网站展示图，也要按high fi的设计去做。
头像的外轮廓线，文字overlap等等，还有emoji的使用，icon等，要高保真"*. Five real
defects, and the first one had shipped.

**Text overlapping text, at every width between ~1080 and ~1400.**
`.slk__list` was `flex:1` with no `overflow`, so once the messages were
taller than the panel the list simply spilled out of its own box and
painted the last message straight through the composer — 98px of overlap
at 1120, 67 at 1200, 36 at 1280, gone by 1400. The reason it shipped is
worth writing down: the sweep tested 390, 768, 1024 and 1440, and all four
happened to fit. That is the failure QA §4j already names — a width
expression that agrees with you at the one width you looked at — and the
answer is the same one: sweep the band, not the corners.

The fix is also the correct product behaviour. A channel scrolls and hangs
from the bottom, so the list is `overflow:hidden` and bottom-anchored: it
cannot overlap anything at any width, and what survives a squeeze is the
newest message, which is what Slack keeps.

**The outline around the avatars.** Every `avatar-*.png` is a circle
inscribed in a 320px square — it touches all four edge midpoints and its
corners are fully transparent. Framed at Slack's 8px rounded square with a
tinted fill behind it, those corners showed the fill: a hard little wedge
at each corner of every face. The facepile was worse — a 2px ring on a
square box around circular art draws a rounded-square outline floating
clear of the picture inside it. Circular frames, no fill. Slack does draw
member avatars as rounded squares, but losing that is cheaper than
shipping four visible artefacts, and `.slk__av--okou` keeps the square,
which is how Slack draws an *app* icon anyway.

**The reaction was a generic tick.** A Slack reaction is an emoji and a
count. The mark is drawn as an inline SVG rather than typed: a font glyph
renders as a different picture on every operating system, which is the
opposite of high fidelity for something whose whole job is to look like a
screenshot — and T6 keeps emoji *glyphs* off this page. `✅` is a green
rounded square with a white check, and now that is what it is. The
invented "Seen by 6" pill went with it; Slack has no such control, and the
count on the reaction already says other people are in the room.

**The send mark pointed backwards.** `m5 12 14-7-5 7 5 7z` draws a plane
aimed left. It is a filled plane aimed right now.

**The AGENT badge rode high.** A 9px badge baselined against a 15px name
sits with its box above the cap line; Slack centres it.

**And the panel had to fit after all that.** Grouping the two consecutive
Okou messages — which is what Slack does, and drops the repeated avatar,
name and badge — plus a spacer that holds an indent instead of a 36px row
height, recovered most of it. In the 1001–1280 band, where the three
column stage squeezes this panel to 441px, the reaction and the unfurl's
service line stand down: they are the two elements that are texture rather
than narrative, and the header's facepile still says the room has eight
people in it. Measured at eleven widths from 390 to 1920: nothing clipped,
nothing overlapping.

## 2026-08-27 · the Storefront scene is a Slack channel, drawn as one

Tong: *"其实我们本意是想做的更像slack。也许可以做一个更像slack的假的对话界面，
然后把团队成员和agent的交流过程加上动画做进去，那可能就不需要有图片背景了"* —
with a screenshot of a real Slack thread that already has Okou in it.

The pass before this got the SHAPE right — one column, names, faces,
nobody right-aligned — and kept two things Slack does not have.

**Chat bubbles.** Slack has none. A message is plain text under a bold
name, on the channel's own white. Bubbles are the messaging-app idiom, and
drawing them was most of why the panel still read as a chat rather than as
a workspace.

**A painted ground.** Slack is white. Removing the painting also removed
the problem the pass before had to solve with a scrim and a paragraph of
contrast arithmetic: with no photograph behind the type there is nothing
to compute against.

What the reference carries and this now does: an **AGENT badge** beside
the app's name — how Slack marks a bot, and the one element that says
outright that a member of this channel is software — a timestamp after
every name, mentions as tinted chips, an unfurl with a left rule rather
than a card, reactions as small counted pills, a member facepile with a
count in the header, and a composer on the floor. The composer is drawn
rather than an `<input>`: a mock full of real form controls is a mock full
of focusable elements nobody can use (QA §4k2).

**The exchange plays.** Maya asks → the ghost line appears where the reply
will land → Okou answers → it publishes and the unfurl arrives → a
reaction pops from somebody who never typed → Dan picks it up → Okou
drafts the follow-up. Seven beats on the timeline that was already there:
the container kept `.ochat`/`.ochat__row`, so app.js drives it unchanged.

**A mock half-pinned is a mock broken in one theme.** Slack's ink is its
own near-black and does not follow the page, so the ground under it cannot
either — the first pass left the panel on `--paper`, that token inverts,
and eleven nodes of #1D1C1D landed on #171C21 in dark mode. Every value in
the panel is pinned now, which is what P1 has always meant. The same fault
`.perms__tabs span.is-on` shipped with.

**And the panel's borders are another application's chrome.** A channel
header rule, an AGENT badge, an unfurl bar, a composer field and the
window's own edge — five things the NO-RULES audit counted as page
furniture until `.ochat` was named in its exemption list, which is the
exception S4 states and the reason `.vs__viz` is already on it.

**Three more places in this section were standing text down with
opacity**, and axe found all of them once the panel stopped being a
photograph. None was a once-per-load artifact — the tab reel advances on
its own, so every one of them re-enters a sub-contrast state every few
seconds, forever:

* `.ostage.is-live .ocard` at `opacity:.55` — a connector card is a name
  and a sentence. Stood down by colour now; the 6px offset and the
  greyscale on the mark are untouched, because a transform and a filter
  on an image have no contrast floor.
* `.lead-in.is-swapping` at `opacity:0` — the one sentence that changes
  with the tab. It wipes behind its own top edge with `clip-path` now,
  which is the same gesture and never renders a half-opacity glyph.

That makes five instances of RULES N3 found this week. The rule has been
written down since the parallel figure was built; what was missing was a
gate step that looks *while things move*, which §1 now has.

Still the Storefront Launch tab only; the other six scenes keep their
two-party exchange until their conversations are written.

## 2026-08-26 · Storefront Launch becomes a channel, not a DM

Feedback 03 on the board: *"这个场景可以融合几个 slack 场景，现在表达的多是
个人工作"*. Rewritten for the Storefront Launch tab; the other six scenes
still carry their old two-party exchange.

**The layout was saying "individual" louder than the words were.** The
asker's message sat right-aligned, with no avatar and no name — the
direct-message idiom, the two-column shape every phone messaging app uses
to mean *you, and one other*. Everything else was Okou answering that one
person. No amount of new copy fixes a shape that says DM.

So the change is structural first: **nobody is right-aligned any more.**
Every message is a face, a name and a line in one column, because in a
channel they are all addressed to the room. A channel chip names the room
and says who else is in it; a second person, Dan, picks the work up after
the artifact lands. Two humans and Okou, six messages.

**It also ties the three columns into one story.** The connector cards on
the left have always asserted *Google Drive — brand brief read from the
shared folder* and *Gmail — launch announcement drafted, unsent*, and the
conversation never once referred to either. Maya's ask now ends "Brand kit
is in Drive", and Okou's last line answers Dan with "Drafted in Gmail —
unsent, yours to send." The left column stops being a caption and starts
being what the run reached for.

**The artifact card became a link, and paid for the two new people.** It
was a 252px card holding a picture of the published page — eighty pixels
from the window on the right that shows that same page at full size and
scrollable. Two pictures of one thing, the larger of them the panel's
biggest element. As a chip it says the same in sixty, and the ~190px it
gives back is exactly what the second person and the channel line cost.
The panel's content height is unchanged: 553px before, 553px after.

**Okou stopped wearing a human face.** Its rows used `avatar-1`, which was
harmless while it was the only party answering one unnamed asker. With
Maya and Dan in the room it was one illustrated face among three and the
reader had to work out which was the software.

**Two pieces of white text on a painting, and axe would not have caught
either.** The first pass put the channel line and every sender name
directly on `run-green.jpg`. That painting has pale passages — its
lightest pixel under those labels is rgb(218,233,168), which gives white
**1.13:1**. axe reports a photographic backdrop as *incomplete*, not as a
violation, so this would have shipped through a clean gate while being
invisible. QA §4k4 exists for exactly this and its recipe is to compute
against the lightest thing the chrome can ever sit on. The names moved
inside the bubbles, where Slack puts them anyway and where `--paper` makes
the question moot; the channel line took an `--ink` .72 scrim, which
composites to #4C4F52 over white and carries white at 7.4:1 on any passage
of any painting a tab can set.

**The cue list was a four-element array indexed by row order.** Six rows
meant `CUE[4]` was `undefined`, `t >= undefined` is false, and the last two
messages would never have appeared. It falls back to one step past the last
named beat now. The result also lands at 2100ms rather than 2600 — earlier
than the timing this was tightened to, with the team beats as a coda rather
than a delay in front of the payoff.

**Copy note.** The hard rule is that design work does not rewrite copy.
This item is the exception the board itself states — *"改的是场景本身和对话
内容，不是排版"* — and the narrative was asked for. Maya and the Litoral
brief were already the scene's; Dan, the channel name and the two
follow-up lines are new and are the part to argue with.

## 2026-08-26 · half as many things, drawn twice the size

Tong, with three reference screenshots beside ours: *"logo 背景有点亮，除了
我们自己的logo … 我觉得我们的图的复杂程度有点高，你看图三，图四，图五的复杂
程度就刚刚好 … 在简化一些"*.

**The two cards were carrying nineteen and twenty discrete pieces.** Card B
had browser chrome, a title, a live badge, three figures, three deltas, a
curve, a peak dot, a peak value, seven day labels and a receipt — inside a
532×276 band. The references it is held to carry four to six, at twice the
size, and some of what they carry is a grey placeholder bar rather than a
word. Cut to seven and nine:

* gone from B — the live badge, the third figure, all three deltas, the
  seven day labels, and the peak's value, which read `4.2×`: the ROAS
  figure printed a second time eighty pixels away.
* gone from D — two of five terminal lines (a terminal that is a *ground*
  does not need to be read, it needs to be recognisable) and the
  seven-bar run history, which was the busiest and least legible thing in
  the card.
* everything left got bigger: the dashboard title 15→17, its figures
  15→21, the receipt 12→13, the workflow title 14→16, its avatar 32→38,
  the faces 24→28, the terminal 11→12.

**The bottom of the artifact was crowded because four horizontal things
were sharing sixty pixels.** Deleting the axis took one of them out and
gave its 20px of reserved padding back to the curve, which went from 45px
to 60 at 1440. That is the same complaint as the last round; the last
round moved air around inside the crowding instead of removing one of the
things causing it.

**The connector wall was brighter than our own mark on it.** The tiles sat
at gray-50 and the centre tile — ours — is white, so it was twelve levels
brighter than the fifty-four around it and had to earn its place on size
alone. Two steps down the ramp to gray-100: the wall goes quiet, our mark
is the only lit thing on it, and the wave has somewhere to travel to.

**The workflow panel is centred now, not top-anchored.** It grew when the
run history came out, and at 1024 — where the band is 178px — a panel
pinned 22px from the top hung 7px out of the bottom. Centring makes that
impossible at any band height. It offsets by half the band's own top
inset, because `.tsh` starts below that padding and centring inside it is
not centring inside the band.

**`opacity:.4` on a sentence, in the parallel section.** Not mine — it
came in with that section's rebuild — but it is the third instance of
RULES N3 this week and the only one that was not transient: the
reduced-motion query drops the *transition*, not the state, so the ask row
sat permanently at four tenths and axe failed it on every single run.
Stood down by colour instead, which is what `--ink-mute` exists for. The
scale gesture stays; that part is a transform.

**A cache made four measurements lie.** `agent-browser open` on a URL it
has already loaded serves the cached HTML — the `?r=` hash busts the
stylesheet, not the page. Two screenshots this round showed a build that
was two edits old, and the fix above read as "still failing" until the
page was loaded with a cache-buster on the URL. Any re-test of the same
URL needs `?cb=<random>`.

## 2026-08-26 · the connector card gets its ground back

Tong, on three screenshots: *"这个图一底部空间有点拥挤。图三，上边的图和下边字看不出
分界，是不是需要有一个带颜色的背景？而且动画后边消失的有点生硬。"*

**The Zapier card had no band tint, and could not have had one.** Its three
siblings sit on `color-mix(--vs-hue 9%, --tile)`; this one was pinned to
plain `--tile` — the same value as the card body under it — so the figure
and the sentence ran together with no edge between them. The reason was
mechanical: the vignette was a `mask-image` on the **band**, and a masked
band masks its own fill, so a tint would have faded out at the card's
edges. Moving the mask onto the hub lets the band carry a colour again.

`--hue-ops`, because green sits between the engineering blue above it and
the leadership violet beside it, and the warm hues are out on a cool page.
At **15%** rather than the shared 9%, and that is coverage, not taste: how
much separation 9% buys depends on how dark the hue is — the product teal
lands 21 levels off `--tile`, the ops green only 12 — and this card has
the least tint showing of the four, since a wall of near-white tiles
covers most of it.

**The falloff was one straight line, and it cut tiles in half.**
`#000 45%, transparent 100%` still had the outer tiles at about 40% when
the band's `overflow:hidden` sliced them, so a half-painted chip was
chopped mid-way — which is what read as abrupt. Widening the ellipse made
it worse: the tiles then arrived at the edge at 0.9 and were cut at full
strength. Ten stops on an ease-out now, sized so alpha is ~0.03 by the
time a tile reaches the band's edge. Nothing is cut while it is still
visible, and fixing the fade is what gave the card its boundary: with the
outer tiles gone rather than faint, the band's own tint shows as a clean
strip under them.

**The artifact's bottom was carrying four horizontal things in sixty
pixels** — the curve, its baseline, the day row and the receipt's rule.
The air went between the axis and the receipt rather than between the
baseline and the days, because the days belong to the baseline above them;
the receipt strip went from 8px of padding to 11. The curve also got its
own range back (26–92 rather than 20–95), so it stops sitting low in a
plot half of which is empty.

**`tools/ship-figures.py` could only be run once.** It found the end of a
band by matching `</div>\n      </div>`; run it again on a file it had
already written and that marker was no longer the figure's own closing
pair but the one two levels out, so it ate `.vs__viz`'s closer and the
document unravelled from `<article>` to `</html>`. It balances tags now —
and the first balance-aware version was still off by one, because
`<(/?)div\b` matches `</div` without the `>`, so a `rindex` bounded by
`m.end()` could not see the closer it had just found. A generator that
cannot be run twice is a generator that will be run twice.


## 2026-08-26 · the other two figures, chosen from six

Tong: *"这两个卡…下边的 cards 的 terminal 你画得也太草率了吧…每个给我三种不同的设计吧"*.
Six directions went up at `okou-lane-options`; card B took **the artifact
and its receipt**, card D took **what one person knew, the team now runs**.

**The terminal was drawn as a dark box, not as a terminal.** Flat grey
monospace, three dots, no window title, no prompt colour, and — the tell —
no difference between what a person typed and what the machine said back.
Nothing in it was a terminal except the background. It has a title bar
with the session's name now, a coloured working directory, a dimmed `$`,
the command in near-white, output a tone below it, file paths in a third
tone, and a green tick on the line that finished. Those tones are fenced
in `.tsh__term`'s own group, behind the same wall `--t-shell` already sat
behind: a terminal really is coloured, and drawing it monochrome to
protect the page's palette is drawing something that is not a terminal.

**Card D's foreground is now what the sentence is about.** The terminal
recedes to a ground, still running; in front sits a workflow with an
author, a schedule, ten people using it, and a strip of its past runs —
each bar that run's own length, because seven identical bars is a progress
meter and a progress meter is the one thing a history is not.

**Card B's window is a browser, and its receipt is docked.** A browser's
toolbar is a *field*; the old mock drew three dots and let the URL float
beside them as bare text, which is most of why the picture read as a
diagram. The activity trail stopped being a white sticker parked across
the numbers it was vouching for and became the window's own last row.

**Seven flat bars became an area chart, and the layout stopped being
arithmetic.** Bars need height to say anything and this band has about
forty pixels spare, at which point the tallest day was 32px and the
shortest 12 — a texture, not a reading. Two rounds then went on
hand-solving the height, and both times the plot's baseline and day labels
finished up *behind* the dock. A comment full of arithmetic is a value
that stops being true the moment a font loads. The window is a flex column
now and the plot takes whatever is left.

**The KPI row cost the chart its height, twice.** Tiles cost thirty pixels
on a fill; stacking label under value cost fifty-three, which produced a
30px plot at 1440 and a 75px plot at 1260 — a cliff either side of a
breakpoint that only existed because the two were fighting. Inline, the
row is twenty pixels at every width and nothing has to be rationed.

**Three things the gate caught that looking would not have:**

* `.arti__val` — the peak's `4.2×` — was revealed with **opacity**. It is
  text, and text at part opacity is text under its contrast ratio; axe
  failed it about twice in twenty runs, which is what a 400ms fade inside
  a nine-second loop looks like from outside. RULES N3 has said so since
  the parallel figure was built, and I broke it on the one element in this
  figure it applies to. Clipped now; the dot beside it is a graphic and
  keeps its fade.
* `.tsh__runs span` is (0,1,1) and `.tsh__run--now` was (0,1,0), so the
  newest run silently kept the history's own 0.26 and the strip had no
  "now" in it at all.
* At 390 the workflow panel had 97px for its title, so *Weekly team
  digest* broke over three lines and pushed its own team off the card. The
  two surfaces stack below 1000 instead of narrowing.

**Still open, and not from this work:** `.reach__line .w` and
`.rot .line` fail contrast intermittently mid-reveal — about 3 runs in 25
at 390, and they reproduce identically on the published build from before
this change. Same defect as `.arti__val` had, in two older loops.


## 2026-08-26 · the Codex card, at the product's own size, on an endless track

Tong, on the version below: *"内容太多了。我说你加更多细节，不是加更多的 text,
可能是让它更精致，然后把控它所有的组件细节。"* And, pointing at how other
product pages do it: *"很多产品，它会用这种局部放大的方式去展示他们的产品。"*

Fair, and the diagnosis was the useful part: I had read "detail" as "more
rows". Three directions went up at `okou-lane-options` — the board at
product scale and cropped, the same board on a moving track, and a small
board with one step magnified in a travelling panel. Tong took the second.

**The mock stopped being shrunk.** Four agents at 29% of the band with
11px rows is not a crop of the app, it is a diagram of it: forty-eight
lines of type too small to read and too many to skim. The board is drawn
at the app's size now — 320px column, 32px avatar, 14px row, 34px line,
8px item radius, 12px meta — and the band crops it. Two agents and a bit
fit; five of their steps sit above the cut. **A third of the words.**

**The track never comes back.** The first pass held on one agent for six
seconds, slid to the next, and at the fourth jumped the whole board right
to start over — the one thing a loop must never let you see. It is a
marquee now: two copies of the four agents, travelling left at a constant
22px/s, put back by exactly one copy's width when they have moved that
far. The copies are painted from the same clock, so lane 4 is lane 0's
twin down to which step is live, and the wrap has nothing to show.

22px/s, not the connector rails' 26: those rails carry logos and nothing
on them has to be read. Every row on this one is a sentence.

**The wrap needed a LEAD, and a pixel diff is what found it.** The band
insets its content by 26px and the track started at that inset, so the
strip to the left of it had the previous agent's card behind it for the
whole cycle and *nothing* behind it at the instant of the reset. A 26px
sliver of white popping in the corner is not much, and it was the only
thing in the frame moving discontinuously — which is exactly what the eye
is built to catch. Starting the travel one lane in puts the whole visible
window, inset included, inside the track's interior. Twin lanes now land
on the same `getBoundingClientRect()` to four decimals and the frames
either side of a wrap diff to nothing across every fully-visible lane.

**The live row's highlight had no corners, and `getComputedStyle` said it
did.** The tint sat on `.lane__r` as a negative inline margin — 8px wider
than `.lane__s`, the element whose `overflow:hidden` makes the shutter
work. So the clip took both rounded corners off and the highlight shipped
as a full-bleed rectangle for two rounds. The radius was computed the
whole time; it was never painted. Inset, corner and tint all moved onto
the clipper, and the inset went 8px → 12px: a 14px label in a 34px row
has about twelve pixels of clear space above and below its ink, and at 8px
the highlight was tighter horizontally than vertically, which reads as a
band clamped onto the text rather than as a selected row.

**Elapsed time survives a pause.** Scrolling the card away and back reset
the clock to zero, which snapped the track to its start and rewound every
lane. The observer fires at 25% visible, so you would have watched it.


## 2026-08-26 · the Codex card runs

Tong: *"this card doesn't look refined enough — add some detail, the
agents can have names, add some animation, make it a loop."*

**The picture argued against the sentence.** "Several AIs get more done at
once" sat over four frozen task lists. Four lists are not "at once"; they
are four lists. Each lane runs now: its live step finishes, a tick takes
the pulse's place, the duration wipes in, and the next step opens above it
and pushes the older ones down past the cut.

**Each lane is regular; only the four together are not.** A lane finishes a
step on its own fixed interval — 3.3, 3.6, 3.9, 4.3 seconds — from its own
offset, and loops on its own whole number of seconds. Eleven, twelve,
thirteen and fourteen seconds realign once every forty-two minutes, so the
card reads as four independent runs without a single arbitrary number in
the timeline. An even stagger would have read as one progress bar drawn
four times, which is the opposite of the claim (RULES N6).

**The agents are named.** Mira, Kai, Ines and Ravi. Four lanes headed by an
avatar and the word "now" were four instances of one anonymous thing;
"several AIs" only means something if each one is a different somebody.
The timestamp moved to the right edge, where the product puts a row's meta,
and the name took the left.

**The finished steps say they are finished.** They were six identical grey
dots, which reads as *pending*, so a lane showed no progress at all. Now a
tick and the time the step took — the second column that makes a list of
labels read as a log. The tick is grey, not the run blue: forty blue marks
would leave nothing for the one step that is actually live to be marked
*with*. The live step is a selected row, `--p-tint`, which is what the
product draws.

**The list was never cut, and the CSS said it was.** The comment over
`.lanes` has always claimed the lanes "run to the bottom of the band and
are cut there". They did not. `.lane` is a flex column and its rows are
flex items, so a run longer than the card does not overflow — every row
silently shrinks until it fits. Six rows at 16px looked deliberate; twelve
would have too. `flex:none` on the rows, and the run is now 37–74px longer
than the band at every width.

**A `0fr` track is floored by the padding of the item inside it, not only
its own.** The rows carried 3px above and below for spacing, so a closed
row stayed 6px tall and its label overlapped its neighbour's for the whole
transition — legible, doubled, and wrong. §4k of the gate names this trap
from the track's side; this was the same trap from the item's. The row's
air is leading now, which is height a `0fr` track does collapse.

**The shutter is armed one painted frame late.** The resting frame has
every row open, so adding `.is-live` and the transition together played the
loop's opening state as an animation — nine rows sliding shut in front of
the reader. `.is-warm` is added on the frame after the first cue pass.
## 2026-08-27 · the collision the canvas change introduced

Moving the workflow scene onto a fixed-ratio canvas changed the coordinate
space and I did not re-check the states against it. At **Hand over** the team
avatars landed on top of the workflow card, covering "Post it to #team", and
the three per-avatar captions overlapped into `RAN IT RAN IT RAN IT`.

That is F9 — *check the geometry in every state, not only at rest* — broken
by the person who wrote it down two days ago.

**Measured, not eyeballed.** The card is 53% of the canvas on its own; at
scale .94 it ran 21→74% while the avatars sat at 58→65%, i.e. inside it.
Step 3 now lifts and shrinks the card so the team and the permissions line
have somewhere to be, and every state is asserted clean at 1024×900,
1440×900, 1440×700 and 1920×1080.

**One caption for the group.** Three `nowrap` labels each centred under a
34px avatar are wider than the avatars are apart, so they collided the moment
the canvas got small. A label that cannot fit under the thing it labels goes
beside the group instead — and it says something better: *three teammates ran
it this week*.

**The probe was broken before the layout was.** The first version set
`data-step` and measured in the same frame, so all four states reported the
geometry still on screen — four identical lines that read as a pass. The tell
is that the numbers do not change between steps. Now in the checklist as
§4n2b, with the `await` called out as the check.

**And the `?v=` trap cost a second round.** `build-css.py` stamps every
`assets/…` path in `index.html`, so a literal string replace against the path
as written in source matches nothing, prints its success message and changes
zero bytes. Written into the checklist beside the other regex warning: match
with a pattern that tolerates the stamp, and assert the replacement count.

Gate: axe 0 violations both themes after a full-page walk, borders 0, bug
sweep pass, no horizontal overflow at 390 / 768 / 1440×700, tokens 0, scopes 0.


## 2026-08-27 · figures fit the window, and compositions stop drifting

Three responsive faults, reported together, with two root causes.

**The control stage ignored the browser's height.** The frame was as tall as
the product mock inside it — 722px, whatever the window was — so on a short
viewport the permission screen simply ran off the bottom and the reader never
saw the row the beat was about. The mock now keeps its design size and the
stage scales it into whatever height is left, the way a photograph is fitted
to a frame: one factor, everything inside in proportion. `offsetHeight`
ignores transforms, so the natural height keeps measuring correctly while the
scale is on. Verified fitting at 1440×620 through 1280×1100.

Two details that were wrong on the first pass: the available height is the
stage's offset **minus the header**, not the offset doubled — the top number
exists to clear a floating header and there is no header at the bottom, and
mirroring it whole threw away 60px on windows that did not need it. And beat
3's `scale(.94)` had to become `scale(calc(var(--ctrl-fit) * .94))`, or the
pull-back would have thrown the viewport fit away.

**The workflow scene was not a composition.** Its objects each did their own
`cqw` / `cqh` arithmetic against the frame, which is five things doing five
sums: change the frame's *aspect* and they drift apart, the group stops being
centred, and at wide-and-short the whole scene sat in the top-left with a
quarter of the frame empty. It is a fixed-ratio canvas now — designed once at
760 × 460, letterboxed into the frame and centred — so cq units inside it are
canvas units with a fixed relationship and nothing can drift. Measured centred
to the pixel at 1600×620 and 1280×1000 alike.

Type inside the canvas scales with it rather than clamping. A canvas whose
type stops scaling is a canvas whose layout breaks: fixed boxes, growing text.
Legibility at the small end is the stacked layout below 820px, not a floor.

**The timestamp that "kept moving"** was the schedule chip. The `Save
workflow` chip beside it was only `opacity:0` — still in flow, still taking
its width, and that width came from the canvas, so every resize pushed the
visible chip sideways. Two states of one slot sit on one anchor.

Swept the rest of the page at 1440×620 and 1440×700: nothing else is taller
than the window except the hero's `.ph` product-image placeholder, which is
width-driven by its own aspect ratio and is a slot waiting to be replaced.
Flagged rather than changed.

Written up as `qa-checklist` §4n3 and `RULES.md` F11–F13.

Gate: axe 0 violations both themes after a full-page walk, borders 0, bug
sweep pass, no horizontal overflow at 390 / 768 / 1440×700 / 1920, tokens 0,
scopes 0.


## 2026-08-26 · the rules for figures, and the parallel section rebuilt on them

**The rules are written down.** `design-principles.md` §13 and `RULES.md`
F1–F10. Sections 0–12 were all about the page; nothing in them covered **the
picture beside the words**, which is where nearly all the rework on this page
has gone. Every rule there cost a round, and each is written with the failure
that produced it: a figure shows the claim happening rather than restating it;
a multi-step figure is one scene with states, not N pictures; abstracted
product UI, neither a diagram nor a screenshot; one gesture per beat; a gesture
must deliver something; the ground is re-decided when the objects change; tie a
figure to the page with a token rather than adjacency; a physical metaphor is a
different register; check the geometry in every state; and "redesign" means
replacing the argument, not restyling the wireframe.

**Then the parallel section was rebuilt against them.** It was a flow chart —
ask, hub, four status cards, two captions — that asserted all four of the
section's claims and showed none. Worse, its four cards carried fixed statuses
with one already reading *Done*, so **AT ONCE**, the word the whole section
turns on, was the one thing a frozen tree could not say.

Read off the copy, the four claims and what each one needs:

| the copy says | the figure has to show |
|---|---|
| a chat for every task | one ask becomes four chats |
| **nothing waits in line** | they advance **at the same time** |
| nobody sits watching | the person leaves |
| nothing stops when it sleeps | the work carries on without them |

**The second claim is the whole figure.** The only honest proof of parallel is
four progress lines moving together at *different* rates — a queue advances one
bar at a time, so four bars at four speeds is a thing a queue physically cannot
draw. Each lane carries its own `data-rate` (1 / 1.42 / 0.72 / 0.94, deliberately
untidy) and they finish out of order at 0:04 · 0:05 · 0:06 · 0:07. The four
clocks diverging *is* the argument.

**Claims three and four are one gesture.** Half way through, the ask row dims
and steps back — Ming has closed the tab — and the lanes do not follow. They
stay at full strength and keep moving, because they are not on that person's
machine. The status line says so while it happens. The note under the figure
now captions something visible instead of asserting it.

Each lane is tinted with a `--hue-*` token, the same set the page uses for
disciplines elsewhere, so a lane's colour means something (§13.7). The four
cards arrive **together**, not staggered: a stagger here would be the one thing
the figure exists to deny.

Under reduced motion or without JS the resting frame is the **finished**
figure, with the four different finishing times already on the clocks.

Gate: axe 0 violations both themes after a full-page walk, borders 0, bug sweep
pass, reduced-motion pass, 390 no overflow, tokens 0, scopes 0.


## 2026-08-26 · the four steps become one scene

**Four steps, four separate pictures.** Run / Save / Hand over / Automate each
had its own mock on its own painted panel, and the panels slid past one
another. Nothing carried over between them, so the reader re-read each screen
from scratch and the section's own claim — that one chat becomes something the
team keeps — was described but never shown happening.

**It is one scene with four states now.** The same objects persist and move:
the ask, the run, the workflow it condenses into, the team it goes to, the
schedule that finally makes it self-running. `data-step` on the scene is the
only thing that changes; every object reads that one attribute and CSS does
the rest, which is the same mechanic the control section uses. The four
sliding panels and the per-stage measure-and-fit script are gone with them.

**Where the boldness goes — one gesture per step, and nothing else:**

1. **Run** — the ask sits in the person's own words, the run works beneath it
2. **Save** — the ask recedes and the run *lifts, straightens and is renamed*:
   a thing that happened once becomes a thing the team keeps. This is the
   pivot of the section and it is the loudest moment in it
3. **Hand over** — the card moves aside and the team arcs in around it, each
   with their own permissions
4. **Automate** — a schedule snaps on and it lands in the workflows list

Everything between those four moments stays still on purpose.

**The painted grounds came out.** They were tuned when one opaque mock covered
most of the panel; with the objects floating, twice as much artwork shows and
every one of them went from atmosphere to picture. The brick wall and the blue
figure both won the composition outright — at any veil, and a heavier veil only
made a muddy photograph. The field is built from `--step-run / --save / --hand
/ --auto` instead: the **same four hues as the step markers in the left
column**, so the two halves of the ladder are tied together by a token rather
than by being next to each other. Mixed at 17/11/5% and no more — a stronger
tint turns the amber step into a cream field, which this page has rejected
once already.

**Three things caught on the way:**

- A `python` string replace against `index.html` silently did nothing, because
  `build-css.py` had already stamped `?v=` into the very `url(...)` I was
  matching on. It printed `ok` and changed no bytes. The tell was
  `--h: ""` and `background: none` in the computed style, not the script.
- `--accent-solid` on the RUNNING label failed contrast in dark mode: the card
  is `--paper` and `--paper` flips, so the label needs `--accent-wash`, the
  token that flips with it.
- The scene's card rules are the product's own chrome, so `.wfo` is **named**
  in `tools/audit.js` and `tools/tokens.py` rather than left as a quiet
  violation of a rule the audit still claims to enforce.

**Narrow screens get a column, not a composition.** Container units that read
well beside a 700px stage stacked four floating objects on top of one another
at 390. Below 820px each step shows only the objects it is about.

Ladder verified 1 1 2 3 4 4 with the scene matching the step at every position;
axe 0 violations in both themes after a full-page walk.


## 2026-08-26 · the Run step actually runs

**The step is called "Run" and its panel was a transcript.** Three finished
paragraphs, which show that work *happened* and never that it is happening —
against a claim that reads "Okou works out the angle and **does the job in
the open**". Nothing was in the open.

So the run plays. Each line arrives, works, and resolves, in order, and the
run ends on the artifact it produced: five steps with the connector each one
reached, the reasoning underneath, then the draft in Resend. The rule is one
sentence on purpose — deterministic and one-shot, not a loop that invents a
new pattern each cycle. The same facts the three paragraphs carried are all
still there; they are a trace now instead of a summary.

No new observer and no per-frame JS: `.absui__run` carries `reveal`, the
page's one observer adds `is-in`, and the delays are a custom property on
each row. Named under `absui__` so it inherits the mock exemptions rather
than needing new ones.

**It played to an empty room first.** Keyed off `.wfstage.is-on`, which is in
the markup at load, the whole run finished while the section was still a
screen and a half below the fold — every visitor arrived to a finished
transcript again, which is precisely what it replaced. The reveal observer is
the right trigger because it is the one that knows the section is on screen.

**Then it made the a11y gate non-deterministic, and that turned out not to be
its fault.** Auditing straight after the page-walk returned 1 violation on
roughly one pass in three. The nodes moved every time — and they were not the
run at all:

```
.reach__line.is-on > .w:nth-child(7)   ← then 4/5, then 3/4 …
```

The **reach statement's word-by-word fade**, looping, always leaving some word
at partial opacity for axe to catch. Reproduced on the published draft, so it
has been shipping. Fixed the way `qa-checklist` §1 already prescribed for
exactly this — *"text that fades is text below contrast, and a loop re-enters
that state forever. The fix is clip-path"* — the words now un-clip upward,
which is also the page's own headline idiom, so the statement rises the way
every other headline does. **14 consecutive audits across a full rotation:
0 violations.**

The run's own entrances went the same way before the cause was known, and
they stay that way on the merits: no text on this page fades any more. The
ticks still crossfade on opacity, because a dot is not text and carries no
contrast floor.

**What actually caught it:** auditing *immediately after* the walk, while
things are still moving, rather than at rest. Six audits at rest were clean;
the defect only exists mid-animation. That is now in the checklist.


## 2026-08-25 · the page shipped its own name in two typefaces

**Archivo 600 in the header, IBM Plex Mono 500 in the footer** — same size,
same tracking, different face and different weight. The footer lockup was
authored during the footer rebuild and picked up `--fm` because everything
else in a footer column is mono; nothing caught it because no check had ever
compared the two. A logo does not have variants. The footer now renders the
header's lockup to the pixel, icon included (20px, was 24).

It stays at `--t-wordmark` rather than growing to suit the footer: at 16px or
more a 600 weight trips the heading-weight gate, where the wordmark is the one
exemption *because* it sits under that threshold. Added to the checklist as
4n1, with the icon size in the same check — the mark and the word are one
lockup.

**Still open, not changed:** the footer's language button renders "English" in
Instrument Sans 12px inside a row where every other item is IBM Plex Mono 500
uppercase. By the page's own convention a control is utility text and belongs
in mono. Left alone because it is a control that was designed and signed off
two rounds ago — flagged rather than quietly restyled.


## 2026-08-25 · the beat gets shorter, and the stage stops moving

**68vh, not 100vh.** A full screen per beat fixed the uneven heights and cost
the thing the fade exists for: with a screen between them you never watch the
next statement arrive, you only see the one you are on and then, later,
another one. The beat is `max(68vh, --ctrl-h)` now — 722px at 1440×900, about
four fifths of a screen — so two steps share the viewport at the handoff and
the grey-to-bright change is something you watch rather than something you
find. The floor is the frame because the first step centres on the stage, and
one expression makes those two requirements stop fighting.

**The stage was resizing under the reader, and it broke the last beat.**
Beat 5 swaps the permission list for the activity trail and the window came
out 106px shorter. `--ctrl-h` was written straight back from that, so
`--ctrl-beat` shrank, all five steps shrank with it, the document lost 530px
mid-scroll — and step 5 was carried past the middle of the screen by the
reflow it had itself caused, so it never lit up at all. `on=-1`.

Two fixes, both structural rather than a nudged number. `--ctrl-h` now tracks
the **tallest** state the frame has been measured in, reset only when the
frame's *width* changes — width is the tell, because a beat change never
alters it and a viewport resize always does. And `.ctrl__frame` takes that
value as a `min-height`, so the sticky stage is a fixed object instead of one
that changes size as you read it. All five beats verified at 722/722/722/722/
722 with the frame at 722 throughout.

**The activity trail was five rows short of its own window.** With the stage
pinned, beat 5 left 245px of empty tinted ground under the trail. Rather than
shrink the frame back, the trail became the length the window is: eleven rows
from *Run started* through *Sandbox destroyed*, which is what a run trail
actually looks like and makes the two tabs the same shape.

**A contrast failure that had been shipping, and the gate hole that hid it.**
`--p-mute` (`#788192`, the product's gray-700) measures 3.9:1 on white, and
this page draws the mocks that use it at 9–12px — 28 failing nodes across the
parallel-work lanes, the artifact card and the workflow rows. Confirmed
present on the published draft before this round, so it is not a regression;
it is something every previous audit missed. **axe only sees revealed
elements**, and every run so far had been from one or two scroll positions,
so whole sections were never in the DOM axe measured. The rule now is: walk
the page top to bottom, return to the top, *then* audit — and that is written
into the checklist as the way the a11y gate is run, not as a footnote.

P1 pins a mock to the product's own values and that is still the rule, but a
pinned value does not outrank the contrast floor. `--p-mute` steps one stop
down its own ramp to gray-800 (`#666F7E`): 5.1:1 on `--p-card`, 4.6:1 on
`--p-tint`, same hue line. Walk-then-audit now returns **0 violations in both
themes**.

**On the site-wide type question:** the audit says no. Page-level prose already
runs 21 (section ledes) · 15 (`.note`, `.figcap`) · 13.5 (footnotes,
disclaimers, comparison-card body), and `--t-body`'s 17px is reached by
exactly two rendered elements — the hero paragraph and the connector line.
The control step at `--t-sm` did not become an outlier; it joined the 15px
supporting-prose tier it belongs to. Nothing else needs to move, and dropping
`--t-body` globally would be the wrong lever for what is really "the hero
paragraph is a point too big".


## 2026-08-25 · one screen per beat, and a report that fills its window

**Every control step is one viewport tall.** It was `min-height:54vh`, which
put two beats on a screen and changed the stage twice per scroll, and left
each step a slightly different height depending on whether its paragraph ran
to three lines or four. One screen per beat is the cadence this mechanic is
for. Measured: `900, 900, 900, 900, 900`.

**The first step still centres on the frame,** but it can no longer do that
by being exactly as tall as the frame. The box stays one viewport and the
*content box* is cut back to the frame's height with a bottom padding, so
centring inside it lands the block on the frame's middle line while the step
stays the same height as the other four. `frameMid === blockMid === 479`.

**The beat is scored in pixels of the band, not `intersectionRatio`.** The
ratio is measured against the *element*, so it depends on how tall a step
happens to be: at one viewport per step the most any step can ever score is
band ÷ step ≈ 0.24, and the observer's 0.25 threshold would never have
fired again. Comparing `intersectionRect.height` asks the question the beat
actually turns on — which step is sitting in the middle of the screen — and
keeps asking it correctly whatever the steps are resized to. All five beats
re-verified end to end.

**The mobile first step was 100px taller than its siblings.** The narrow
block overrode `padding-top` while the wide layout's bottom value
(`100vh - --ctrl-h`) stayed in place. `padding-block`, both values.

**The Team Digest preview did not fill its window.** `ops-v2.jpg` was
**880×870** where every other artifact page on this page is 1400–4000px
tall, so the preview ended a third of the way down and the "Scroll down"
hint below it was a lie — `scrollHeight - clientHeight` was too small to
scroll. Rebuilt at 880×2246 in the same visual language, with four sections
added to the three it had: *Shipped This Week*, *Delivery Throughput*, *By
Team* and *Next Week*, plus two more budget rows and a fourth blocker. The
window now overflows by **586px** and the hint is true.

Two things fixed while in there: the header row read `VARIANCESTATUS`
because the fourth column had no right padding, and the five summary tiles
wrapped 4 + 1 instead of sitting five across. The card thumbnail
(`ops-v2-card.jpg`) was re-cut from the same render so the chat's preview
and the full page agree.

**"Prepared by Zero" → "Prepared by Okou"** in the report header. Not a copy
rewrite — a product mock naming the wrong product.


## 2026-08-25 · the column fades, and the fan stops spreading

**The step paragraph was at the page's full prose size.** 17px is right for
prose that IS the content; this paragraph supports a statement and sits
beside a product screen whose own body text is 13.5px, so at 17px it
out-weighed both and made the column read heavy. `--t-sm` — the token that
already means *secondary prose* — and the page's eleven type sizes stay
eleven. The site-wide `--t-body` is untouched; that is a separate decision.

**The spots came down** from `clamp(78,8.2vw,112)` to
`clamp(64,6.4vw,88)`, and their own opacity curve is gone. The step fades
as one block now, and a drawing on its own curve inside a block on another
curve is two mechanics narrating one state.

**The first step is centred on the FRAME.** Third attempt, and the first
two are worth recording: a 12vh indent put the statement near the stage's
centre by luck and left the window's top edge floating against nothing; a
top alignment made the two columns start on one line but hung the
statement off the top of a 700px screen. What it wants is the middle of
the thing it is talking about. No clamp can do that — the frame's height
is whatever the product mock inside it comes out at — so app.js §13
measures it into `--ctrl-h` with a ResizeObserver and the step is made
exactly that tall. Both columns still start on one line, because it is the
step's BOX that grew, not its content that moved down. `padding-block:0`,
not `padding-top:0`: with a 20px bottom padding still on it the content
centred 10px high, which is precisely the near-miss that reads as "not
quite aligned" and cannot be seen in the CSS. Measured: `frameMid ===
blockMid === 479`.

**The steps fade, and the fade cost the paragraph its colour.** Resting
steps are `opacity:.6`; the one in the middle of the viewport is 1. First
attempt rested at 0.34 with the existing colours and axe returned a real
**violation**, 15 nodes — *not* the `incomplete` the testimonial cards
get. Worth knowing why the two differ: the rail's cards carry a
`transform`, so axe declines to composite them; these do not, so it
composites, and it is right to. The floor is arithmetic — resting text has
to clear 4.5:1 on paper *after* the fade, and `--ink-soft` cannot at any
opacity you would notice. Moving the paragraph to `--ink` buys the
headroom (`#0C0F12` at 0.6 over white composites to `#6D6D6D`) and 0.6 is
still a fade you can plainly see. A paragraph in full ink is a small
deviation from the page's prose colour and it is the price of the fade,
not a preference.

**The fan was spreading instead of compressing.** Cards that shrink inside
a track of unchanged width leave the leftover width sitting between them,
so the visible gap *grew* with distance: 31px beside the centre card, 78px
two out. Physically backwards — a fan compresses towards its edges, and
growing gaps read as spacing done by accident. `app.js` §12 now rebuilds
each card's position from the widths actually on screen (the scaled half
of each neighbour plus a gap that scales too) and hands the difference
back as `--x`. Gaps now run 29 · 26 · 24 outward, and they stay inside
24–29px at every point between snap positions, so nothing jumps mid-drag.
The translate is on the card, never the track, so every snap position is
exactly where it was.

`translateX` is written **before** `scale`. The other order scales the
translation too and every card lands short by its own scale factor.


## 2026-08-25 · the quotes get a middle

**The rail had no subject.** Six cards read from the left edge at one size,
so the row was a list you scrolled rather than a set with something in it
being read. It centres now: whichever card is on the rail's centre line is
full size and full strength, its neighbours are 0.91 and 0.65, and the pair
beyond are 0.82 and 0.30. Past that the size keeps shrinking and the fade
stops — the far cards have to read as *smaller*, not as absent, and below
0.3 the row only looks broken at the edges.

**One number drives both curves.** `app.js` §12 writes `--d` on each cell —
its distance from the centre line, measured in cards — and the CSS reads it
for the size and the strength. It is continuous, not stepped, so a card
halfway between two slots is halfway between two sizes and a drag feels
attached to the finger. With no JS, `--d` is 0 everywhere and every card
renders full size: the fallback is the plain rail, not a blank one.

**Three things had to be got right, and two of them bit first.**

- `.reveal.is-in{ opacity:1; transform:none }` is (0,2,0) and later in the
  file than `.qcell`, so the first version silently lost every declaration
  while the correct `--d` sat on the element unused. The paint moved to
  `.qcell > .quote`, which also leaves the grid track alone — the track is
  what the centre line is measured against, so scaling it would move the
  thing being measured.
- `getBoundingClientRect().width` reports the **scaled** box. The pitch
  would have shrunk with the cards, the arrows would have stepped short of
  a slot, and every distance would have been measured in a unit that
  changes as you scroll. `offsetWidth` is the layout width. A rect's
  *centre* is safe under a centred scale, which is why `depth()` may still
  use one.
- Percentages: the rail pads itself by `50% - card/2` so a card can reach
  the centre, so the card width can no longer be a percentage of the rail's
  content box — that would be defined in terms of a padding defined in
  terms of it. `--q-card` is stated against the viewport now and lands
  within 2px of where the `(100% - 3g)/3.5` version put it.

**The set loops.** Centring is what created the problem: with a finite row
the first card can only be centred with the whole left half of the section
empty, and the last with the right half empty — 37% of the rail, at the two
positions a visitor most reliably reaches by pressing an arrow until it
stops. The set is cloned before and after, the reader always sits in the
middle copy, and `scrollend` puts them back by exactly one set width onto
identical content at an identical snap position, so nothing moves on
screen. The jump is on `scrollend` and not during the scroll because
setting `scrollLeft` under a finger cancels the gesture, and there is a
whole set width of slack on each side, so there is no hurry. Neither arrow
is ever disabled now: there are no ends.

**The clones are `aria-hidden` and `inert`,** so the six quotes are
announced once, and marked `is-in` because the reveal observer only ever
watched the originals.

**The phone floor was wrong.** A flat 272px card is wider than the peek
room a 390px rail has, so the neighbours showed as ten-pixel slivers that
read as a clipping bug rather than as "there is more". `min(272px, 68vw)`.

**On the fade, honestly.** axe reports the off-centre cards as
*incomplete*, not as a violation — it cannot composite an inherited
opacity — and "the tool could not tell" is not the same as "it is fine".
The judgement recorded: the off-centre cards are previews rather than
reading material, every one of them reaches full strength on the centre
line by drag, wheel, arrow or keyboard, and a screen reader never sees the
fade at all. But a *stated* preference outranks that judgement, so
`prefers-reduced-transparency` and `prefers-contrast: more` both take the
opacity out and leave the depth to size alone.


## 2026-08-25 · the control steps get a drawing, a measure and a way out

**Five spot illustrations, one per beat.** Supplied from the brand's own
illustration set — the same register as the avatars, the stickers and the
landscape, not a sixth visual language — and matched to the claim each one
sits above: two hands and a pair of gears for granular permissions, a hand
striking out a mail on a screen for approval gates, two hands holding a
dashed frame for isolated execution, a hand pointing at a globe it does not
touch for credentials, and a presented chart for the activity trail.

They are **backgrounds, not `<img>`**. The five drawings have five aspect
ratios; a fixed box with `background-size:contain` lands all of them on one
baseline and one left edge without five `aspect-ratio` rules, they are
decorative so they want no alt text, and the browser fetches only the theme
whose declaration actually applies — five files per visitor, not ten.

**The dark variant is a second asset, not `invert(1)`.** The fix that was
right for the monochrome connector marks yesterday is wrong here: these
drawings contain people, and inverting them changes their skin. Each spot
was re-inked instead — white paper keyed to transparent by unmultiplying
against white, achromatic ink inverted so the drawing reads as white pen on
a dark ground, every chromatic pixel left exactly as painted. The spots also
stand down between beats on opacity, which *is* the right instrument here:
the reason it was wrong for the headings (all five are read on the way past,
so none may drop under the contrast floor) does not apply to a decorative
drawing carrying no information of its own.

**The two columns were too close.** At 64px the window's right edge and the
statement's first character were near enough that the eye grouped them into
one crowded block; a sticky stage has to read as a separate object the text
is talking *about*. 104px at 1440.

**The first step was indented 12vh and now aligns with the frame.** It was
pushed down so its statement would land on the stage's optical centre, which
meant the section opened with the window's top edge floating against nothing
and no cue for where the right column began. Aligning the two tops does the
work the indent was attempting. Measured, not eyeballed: `frameTop ===
spotTop === 7332`.

**The paragraphs were one sentence each and the beats had no exit.** Each
one now says what it actually means — that reading a Drive folder and saving
a Gmail draft are two separate grants, that a person answers the approval
rather than a settings page, that the microVM is destroyed rather than
reused, that a call to an unconnected host never leaves the sandbox, that
the engine underneath is open source — and each ends in a soft-fill button
into the product. Five identical ghost chips rather than anything louder:
the section's boldness is spent on beat 3 and stays there.

**One column needed its own spacing.** `min-height:54vh` was carrying the
distance between beats on the wide layout; with it gone at ≤1000px the
button of one step landed almost on the spot of the next, and the spot,
sized against a half-width column at `8.2vw`, came out a third of the
measure it sits above. Both are set explicitly in that block now.


## 2026-08-25 · no system components, and three dark-mode bugs

**The language control was a native `<select>`.** It painted with the
operating system's chrome — its own font, its blue highlight row, its own
checkmark — and its internal box lined up with nothing, which is why the
globe, the label and the chevron sat at three different distances and the
focus ring landed off to one side. Replaced with a button and a listbox
built from our own tokens: one baseline, gaps we chose, opens upward
because it lives in the last row of the document, and the selection is
marked with an accent dot rather than a filled row, because a highlighted
row is the OS's idiom and not ours. Everything the native element gave for
free had to be given back by hand — open/close, Escape, click-away, arrow
keys, Home/End, and focus returning to the button.

**The active segment was white on white in dark mode.** `.perms__tabs
span.is-on` had a hard-coded `background:#fff` while its text is `--ink`,
which is near-white in dark. Worth recording *why the audit missed it*:
that rule lives inside `.perms`, which is mock-exempt, and the exemption
assumes a mock is PINNED to one theme. This mock follows the theme, so the
literal was a real bug rather than a deliberate pin.

**Eleven brand marks were black on black.** The set was measured, not
guessed: every connector mark was drawn to a canvas and sampled, and the
eleven with saturation ≤ 22 and luminance ≤ 110 are inverted on a dark
ground. Inverting is the correct treatment rather than a hack — a
black-and-white mark's dark variant *is* its inverse, which is why
Notion's white-on-black box becomes black-on-white, the logo they publish
for dark grounds. The twenty-five coloured marks are untouched.

**Beat 5 was a card adrift.** The activity trail floated over an otherwise
empty frame with no relationship to the beat before it. It is the same
window on a different tab now: breadcrumb, agent header and tab strip all
stay, "Authorization" hands over to "Activity", and only the body swaps.
That is how the product works, and it is the connective tissue beat 4 was
missing.


## 2026-08-25 · control, designed this time

Tong: *"you implemented the logic I described, but the design is terrible.
We have talked about so many skills — did you use any of them?"*

No. I built the mechanism and shipped it without a design pass. Named
against `microsoft/frontend-design-review`'s format:

* **Blocking** — the stage was a white window on a white panel, so it had
  no edge at all and read as loose content rather than a screen. Every
  other mock on this page sits on a tinted band (`.vs__viz` and its
  `--vs-tint`); this one got nothing.
* **Blocking** — no progress feedback. Five beats and nothing said which
  one you were in or that there were five.
* **Major** — the step heading was `--t-h`, the same size as a card title,
  adrift in a half-empty column.
* **Major** — no composition. The stage top-aligned at the section top
  while the first step centred in its own 62vh box, leaving a screen of
  void under the lede.
* **Minor** — `anthropics/skills` frontend-design says spend your boldness
  in one place. I spread it evenly over five equal fades, which is the
  same as spending it nowhere.

### What changed

**A ground under the product surface.** The window now sits on a frame
tinted with `--hue-engineering` at 7%, the same device `.vs__viz` uses, so
it belongs to the page rather than to this section.

**Five marks, and they earn their place.** They encode which of five
moments this is and that there are five, which is the only justification a
structural device gets. Marks, not a rule — this page does not draw lines.

**The heading became a statement** — `--fd` at `--t-d3`, and the size never
changes between states, only the colour, because a size change on scroll
reflows text under the reader's eye.

**The boldness is spent on beat 3.** Four of the five claims have a real
product screen behind them; isolated execution has none, because a microVM
has no UI. So that beat gets the section's one big gesture — the window
pulls back and an accent boundary closes around it with its tag — and
everything else stays quiet, which is what makes it land.

Motion was already inside `bertbertson/premium-microinteractions`' bands:
`--e-out` is `cubic-bezier(.16,1,.3,1)`, its "premium" curve, and every
beat animates opacity/translate/scale only.


## 2026-08-25 · control becomes one run, and the footer stops scattering

### The control section

Tong's idea: prototype on the left, text scrolling on the right, the
prototype answering each block. Two things had to be checked first.

**Can real product screens carry it?** Mostly. Cloned `vm0-ai/vm0` and
matched each claim to a view: granular permissions →
`connector-permission-row` / `permissions-dialog`; approval gates →
`views/permission-allow` (a centred card with a target pill, the
permission, a grant-duration select, Deny / Allow); credentials →
`okou-page/components/network-content`, a real per-request log with host,
verdict and a block action; traceability → `activity-inspect-page`. Four of
five are real UI. **Isolated execution has none** — a microVM has no
screen — so that beat is the one abstraction here, and it is the only one.

**Does the page already do this?** Yes: `#workflows` is a `position:sticky`
stage with 16 scrolling steps. Building a second one would repeat the page
the way a second rail-and-stage would have repeated the tab reel.

So the mechanism differs. The ladder **swaps panels**; this one
**accumulates on one**. The five claims are five moments in the life of a
single run — what it may do, what it must ask for, where it runs, how its
credentials are attached, what it leaves behind — so the window never
changes: the list dims and the approval card rises over it, a boundary
draws around the whole window, the network log slides up, and the trail
finally replaces the list with rows that name what happened in the earlier
beats. One `data-beat` attribute on the stage is the only state.

Three bugs on the way in:

* **`position:sticky` did nothing.** `.panel` clips with `overflow:hidden`,
  which makes the section a *scroll container* and silently disables sticky
  inside it. `#workflows` had already hit this and fixed it with
  `overflow:clip`, which clips without becoming one. Now both share it.
* The beat observer shipped referencing an undefined variable inside a
  `.observe ? … : null` construction that `node --check` happily accepted.
  It would have thrown on first paint.
* The inactive steps rested at `opacity:.34` and axe failed them. It was
  right: all five get read on the way past, so none may drop under the
  contrast floor. They stand down by **colour** now, between two values
  that both pass.

### The footer

Four changes, all Tong's: the panel is `--paper` (it had become the same
grey as the ground and dissolved — I flagged that myself last round and
shipped it anyway); the theme toggle moved out of the header and into the
footer's bottom row; a language control joined it, with the ten locales
the product actually ships (`i18n/locales` — no zh-CN); and the tagline and
the disclaimer merged into one block under the wordmark.

That last one was the real fix. The footer had six loose regions —
wordmark, tagline, five columns, a full-width disclaimer band, a
copyright, a link row. The tagline and disclaimer are one thought, so they
sit together; the bottom row is now legal on the left and preferences on
the right. **Four regions became two.**

The CTA's bottom padding came down from `35vw` to `22vw`. It had been
sized to clear a hard-masked drawing on a black ground; on the grey the
clouds are already soft, and at 35vw it left a screenful of empty grey
between the buttons and the mountains.


## 2026-08-25 · the closing band stops being dark at all

Tong, pointing at the CTA: *"don't use black here either — use the
background grey."*

So the page no longer has a dark band. `.close` is `--wash`, the same
ground every other section sits on, and the CTA's whole set of dark
overrides is **deleted** rather than inverted: they existed to rescue that
section's type and buttons off a black ground, and the page's own light
defaults are already right. `data-ground="dark"` came off the wrapper —
there is now nothing on the page for the header's dark variant to react
to, though the mechanism stays.

The drawing is better for it. Its sky is white, and it was being masked
out of a black ground; on the page grey it simply blends, which is what
it was drawn for.

`--band` and `--band-2` are gone — six declarations across the light and
dark layers, dead the moment the band was. Two comments that described
the closing band as "the darkest surface on the page" were corrected
rather than left to mislead.

### One thing the flat ground broke

With the panel now the same grey as the sky behind it, its top edge is
invisible — and it was silently clipping the mountains, which appeared to
stand on nothing. Measured: the hill's highest horizon sat at 505px above
the page bottom and the panel's top edge is at 521, so the ground the
mountains stand on was *just* behind the panel. The drawing's extension
went from 140px to 210, putting the horizon at 577 — a strip of hill above
the edge, so the mountains stand on ground and the hill runs on behind the
panel and out into the gutters. The peaks land at 910, still clear of the
buttons.


## 2026-08-25 · the footer stops being black

Tong: *"the footer doesn't have to be black — just use the whole landing's
grey. Then make the background merge more comfortably with the section
above. And leave space at the bottom, don't sit on the edge."*

The panel is `--wash` now — the same grey every other section of the page
sits on — with the text on the ink scale. Both are page tokens, so dark
mode follows for free: there the page grey is `#0E1217`, which is still
one step off the band, and the card keeps reading as a card.

It is inset on all four sides now, `--card-gap` all round, so the drawing
runs under it as well as beside it. Measured 26px of hill between the card
and the bottom of the document.

### The merge took two goes, and measuring settled it

The dark had to hand over to the grey somewhere. The first attempt put
that handover in 150px and tried to hide it behind the hill — and it read
as a **grey haze smeared across the sky**, because the hill does not cover
that band. Measuring the drawing said why: scanning every eighth column
for the topmost green pixel, the hill's horizon runs from 524 to 799 of
1015, so its **lowest** point is only 222px above the page bottom. There
is nowhere up there to hide a seam.

So it stopped hiding. One ramp over 820px, `--band` to `--wash`, is not a
seam at all — it is the sky lightening toward the horizon, which is what a
sky does. The stops are measured from the bottom rather than in percent,
because `.close`'s height moves with the footer's and a percentage would
drift with it.


## 2026-08-25 · the CTA and the footer become one composition

Tong pointed at clay.com/about and lovable.dev and asked for our own
footer content in that shape, merging into the closing CTA.

Lovable is behind Cloudflare and would not render, so the pattern was read
off Clay, which is unambiguous: **the illustration behind the final CTA
does not stop at the section edge.** It runs on, and the footer sits on
top of it as a rounded panel inset from the viewport, so the artwork stays
visible in the gutters either side. The two never read as two bands.

Ours was exactly the stacked version — `.cta__scene` ended at the CTA's
bottom edge and the footer began again underneath, slicing the drawing
across a seam. Now a `.close` wrapper owns one dark ground and one
artwork, the CTA is transparent on top of it, and the footer is a panel
inset by the same `--card-gap` every other panel uses, rounded at the top
and flush to the bottom of the document.

Content is vm0.ai's footer, read off the live site: the five link columns,
the tagline, the disclaimer, the copyright and the five legal links. VM0
reads as Okou throughout, since that is this page's name.

### Sizing the artwork, which took three wrong tries

* **`object-fit:cover` was lying.** Past 900px tall the cover switches from
  cropping the top to cropping the *sides*, so making the box taller
  scaled the whole landscape up and slid the composition off to the right.
  A height that follows the width leaves the artist's framing alone.
* **Anchoring to the page bottom dropped the peaks.** The drawing's bottom
  edge is the bottom of the hill, so putting artwork in the footer's
  gutters put the mountains 173px above the panel — sparse and small.
  `scene-close.png` is the same drawing with 140px of hill stretched on
  underneath so it can ride higher and still reach the page bottom.
  **140 is solved, not chosen**: peaks sit 675px above the drawing's own
  bottom, everything scales by 1.0286 at 1440, and the panel's top is
  521px up, so E = 140 puts them 317px above it — below the buttons, which
  sit at about 400. The first attempt used 420 and drove the mountains
  through the CTA's copy.
* **Then a cloud crossed "Add to Slack".** The cloud band lands 297-492px
  above the panel; the buttons were at 400. More padding under them.

### The phone is a different composition

Stacked to one column the footer is 1389px tall against a 653px drawing,
so anchoring to the page bottom hid the artwork completely and left the
CTA on plain black. Below 960 the drawing moves *above* the panel instead
(`bottom:100%` on a `::before`), which is the composition the CTA had to
begin with. The gutters are 12px there and worth nothing, so the trade is
free.

Two bugs on the way in: `aspect-ratio` does not resolve on an absolutely
positioned box with `bottom` set and no `top` — it rendered as a hairline
until given an explicit height — and a `.panel--cta` padding override at
960 quietly won over the one I had just written.

### The fifth two-layer defect

`base.css` still had a `.footer` block, and its `overflow:hidden` — which
the design layer had no reason to restate — clipped the phone drawing to
nothing. It also styled `.footer__badge` and `.footer__line`, whose markup
no longer exists. Deleted rather than patched, as `.quote` was.

### Two things the gate caught

* The CTA now sits outside `<main>`, so its heading and body were in no
  landmark. The section is named from its own heading and is a `region`.
* The disclaimer at 42% white failed AA on the panel. 62%.
* Clay draws a hairline above its bottom bar and the first version copied
  it, straight into "no structural lines". The border audit caught it; the
  separation is the gap now.


## 2026-08-25 · the 54 token findings, 42 of which were my own tool

Asked to clear the list `tools/tokens.py` was reporting. The first useful
result was that **most of it was not real**:

* **Product mocks' motion was being reported.** The mock exemption applied
  to colour and radius but not to duration or easing, so `.vsui`'s
  `2400ms cubic-bezier(.33,0,.66,1)` — which *is* the product's
  RunningIndicator, copied out of `globals.css` — counted as a violation.
  The mock list was also missing `ochat`, `oresult` and the three `flow*`
  families.
* **The reduced-motion kill switch was being reported.** `.01ms !important`
  is not a duration, it means "effectively zero", and a token would hide
  that.

Corrected: **54 → 12**.

### The twelve

**Nine of them were one problem.** Hover and state feedback was running at
`.16s`, `.18s`, `.2s` and `.22s` across nine components — four durations
doing one job, which is the exact spread a token exists to close. All now
`--t-hover` (220ms). Three new tokens for values that had none: `--t-exit`
(300ms, leaving is quicker than arriving), `--t-word` (9ms, per-word
stagger) and `--t-drift` (6s, an ambient loop).

The focus ring on images carried `border-radius:2px`. An `outline` already
follows the element's own radius; the 2px was overriding that, not
providing it. Deleted.

### A token that did not exist

Adding `var(--t-drift)` to `base.css` before declaring it in `system.css`
left the drift animation with an invalid duration, so the browser dropped
the whole declaration and the character simply stopped moving. Nothing in
the visual gate can see that — the element is still there, still correct,
just still. `tools/tokens.py` now reports any bare `var(--x)` with no
declaration, skipping ones with a fallback and ones set at runtime from
`app.js` or an inline style. Verified by removing `--t-drift` again: it
prints `base.css:241 var(--t-drift)`.

### Thirty-three dead declarations

`.state`'s border-radius was set **four times** — `--r-pill`, then `0`,
then `--r-xs`, then `--r-btn`. Only the last ever applied. Three dead
declarations that read as intent.

A new check reports any declaration an identical later selector always
overrides. Its first version said **472**, and was wrong twice: `from`,
`to` and `40%` are keyframe selectors that different `@keyframes` reuse by
definition, and `base.css → system.css` is the *architecture* — system is
concatenated last precisely so it wins. Narrowed to one file, one media
context, identical selector: **65**, then 13 more in `system.css`. All 33
removed.

**Proved, not assumed.** Computed styles for 1682 elements across 30
properties, before and after. The first comparison showed 11 elements
differing — every one of them an animating element sampled at a different
moment. With `getAnimations()` paused at `currentTime = 0`: **0
differing**. The built stylesheet is 205,030 bytes against 208,193.

### Also

A compiled `tools/__pycache__/*.pyc` was tracked in git. Untracked, and
`__pycache__/` and `*.pyc` added to `.gitignore`.

All five checks now report 0: literals, the `background` shorthand,
undefined `var()`, dead declarations, and duplicate `var` names in the one
IIFE.


## 2026-08-25 · the tab reel stopped moving, and I broke it

Tong: *"the content below switches on its own, but the tab doesn't move
with it."* Correct, and it was mine.

Last round's testimonial rail controller opened with:

```js
var rail = doc.querySelector('.proof');
```

`site/app.js` is **one IIFE**, and `var` is function-scoped, not
block-scoped. The tab reel four hundred lines above holds its strip in a
`var rail` inside `if (wrap) { ... }` — a block, which does not scope
`var`. They are the same variable. My line reassigned it.

The reel's init had already run, so the first tab was lit and the strip
positioned; from then on every `markSlot` and `centreSlot` addressed the
six testimonial cards instead of the twenty-one tabs. `railItems()[10]`
was `undefined`, so `centreSlot` returned early and `--x` froze at its
initial `-661px`, and `markSlot` toggled a class on cards that have no
`is-on` styling. **The panes and `aria-selected` kept advancing** because
neither touches `rail` — which is exactly why it looked like a desync
rather than a crash.

Diagnosis went through four wrong theories (an exception in the
`okou:scene` listener, a second controller, a broken brace, an early
`return`) before instrumenting the function directly. The probe that
settled it printed `markSlot(10) items=6 railIsSameNode=false` — six, not
twenty-one, and not the same node. Reasoning about it was slower than
measuring it, again.

### Two more of the same, already shipping

`tools/scopes.py` is new: it walks `app.js` tracking real function scopes
and reports any name declared twice in one of them. It catches the bug
above the moment it is reintroduced, and it found two that predate it:

* **`t0`** — the parallel-work figure's clock at line 214 and the reel's
  dwell timer at 852. One variable. Whenever both sections were on screen
  at once the two animations reset each other's clock.
* **`cur`** — the step ladder's current step at 420 and the reel's tab
  index at 742. One variable. **Scrolling the ladder rewrote which tab the
  reel thought it was on**, so the next auto-advance jumped from wherever
  the ladder had left it.

The reel's two are renamed `reelT0` and `reelCur`; the lint now reports 0.

No visual check, no axe run and no screenshot could have found any of
these three. The section animates, the content is correct, and the
accessibility tree is correct — only the highlight is wrong.


## 2026-08-25 · the hover bug, and what it exposed underneath

Tong: *"I said no hover — so why does the background pattern disappear on
hover?"* Because of this, in `base.css`:

```css
.quote:hover{ background:var(--paper-2); }
```

`background` is the **shorthand**. It resets `background-image` to `none`,
so hovering wiped the card's doodles. The hover had been removed last
round — from the design layer only. This copy sat at (0,2,0) and won.

**That was the fourth time this session** a rule living in both layers
caused a defect: `.vs p` handed the product mocks a theme-flipping colour,
`.proof` kept an explicit 3-column template in front of the rail, and now
this. So the whole `.quote` block came out of `base.css` rather than being
patched again — and deleting it exposed two more defects that had been
shipping unnoticed:

* `.quote figcaption b{ font-size:13.5px; font-weight:700 }` at (0,1,2)
  beat `.quote__who b` at (0,1,1). **The attribution has been rendering at
  13.5px/700 since the section was built**, where the design is 16/500 —
  17.4px/500 at our scale. Nothing looked broken; it just was not the
  design.
* `flex:1` on the blockquote pushed the closing quote mark to the bottom
  of the card instead of leaving it 16 design px under the text.

`tools/tokens.py` gained a lint for the actual mechanism: a state rule
using the `background` shorthand on a selector whose base rule sets
`background-image`. Verified against the real bug — re-introduce it and
the tool prints `base.css:643 .quote:hover`; remove it and the count is 0.
No visual check could have caught this. The card is correct until a
pointer touches it.

### The rail shows three and a half cards

The fourth card sat entirely off-screen, and a rail nobody can see the end
of is a rail nobody scrolls. The card width is solved from the measure —
`(100% - 3 x gap) / 3.5` — so the fourth is always cut. Measured 3.54 at
1280 and above; on a phone the floor gives 1.21, which does the same job.
Everything else scaled with it, because `--qu` is a container unit: the
quote came down from 32px to 26px and the avatar ratio stayed 0.1514.

### Prev / next, and where they go

**Centred under the rail, not top-right.** Top-right is the convention and
it is wrong here: this section's heading is centred and a control pinned
to one corner pulls the composition off axis. Under the row it also covers
no card — an arrow floated over the first card hides content and implies
the card is clickable, which these explicitly are not.

Worth noting what the survey found: Resend, Sierra and Clay all ship rails
with **no arrows at all**, relying on drag, auto-drift or swipe. That is
fine on a trackpad and poor with a mouse, which is the case being served
here.

The craft is in the three things beyond drawing two arrows: they step by
exactly one card plus one gap so the row always lands card-aligned; they
disable at each end from the real scroll position, so they stay honest
when the rail is dragged instead of clicked; and they remove themselves
entirely when the rail does not overflow. At rest they carry no ground and
gain one on hover — one dimension per state, like the page's other ambient
controls.

A scope bug on the way in: the block used `win`, which does not exist in
that IIFE (`window` is not aliased), and shadowed the outer `reduce`,
which is already a boolean. It threw, so nothing was wired — the buttons
rendered and did nothing.

### The hub

Faster: 5.4s to 3.2s, wave step .115s to .085s. The centre tile keeps its
white ground and its outline and loses the drop shadow — it reads as the
centre by being bigger, whiter and more rounded, and the shadow was a
fourth signal saying what three already said.


## 2026-08-25 · the testimonials become a rail, and the hub gets a wave

Five changes asked for directly, plus an audit.

**A horizontal rail.** The six cards were a 3x2 grid; they are one
scrolling row now, running off both edges of the section. The negative
margin cancels the panel's padding and the matching `scroll-padding`
puts the first card back on the measure — the only way to have a card sit
flush with the heading above it *and* bleed off the edge.

**The image placeholder is gone**, and with it the customer-logo band.

**No hover on the cards, and no resting shadow.** `.quote` came out of the
`.feat` lift group entirely. The supplied design is a fill and nothing
else, and a #F6F6F6 card already separates from a white section.

**Wider gap between cards** — 40px against the design's 26.

**The quote mark sits closer to its text.** This one is worth recording
because the metrics were already right: the mark's box was 29 design px
and the gap 16, both exactly the Figma. But 29px is *Inter's* metric, and
we set the card in Instrument Sans, which puts its quote glyph higher in
the line box — leaving 26px of empty box under the ink. Measured
ink-bottom to text-top: the design is 20.5 design px and ours was 45.7.
Matching the box was not the same as matching the picture. Corrected with
a negative margin and re-measured: 20.5 against 20.5.

**The hub is a wave now.** Every tile carries a light inset outline, and
every tile runs the same animation — only the start time differs. `--d`
is the tile's distance from the centre in grid cells, written onto each
of the 55, so the whitening travels outward as a ring and the grey-back
follows it outward too. Background only; the shadow the old version lifted
each tile with was a second material idea doing the colour's job. Three
hand-picked tiles could never have made a wave — it needs all of them.

### Two things the rail broke

**Three 0px columns in front of the cards.** `base.css` had its own
`.proof` with `grid-template-columns:repeat(3,...)`. `grid-auto-flow:column`
in the design layer does not replace an explicit template, it sits behind
it: the first three cards landed in three 0px explicit tracks and only
cards four to six got the 417px implicit ones.

**A scroll container no keyboard could reach.** axe caught it. The rail is
`tabindex="0"` with a region label and a focus ring outside the cards.

### The token audit

`tools/tokens.py` is new: it parses both stylesheets, skips the token
declarations themselves and the pinned product mocks, and reports every
literal colour, radius, duration and easing left in a rule.

First run: **196**. Most of that was the tool being wrong — it counted the
dark layer's 38 token *definitions* as violations, and `\b` does not fire
after a BEM `__`, so every third-party mock in `base.css` was reported.
Fixed, the real number was **79**.

Converted 21 lines: every `rgba(255,255,255,x)` and `rgba(0,0,0,x)` outside
a mock now uses `rgb(var(--paper-rgb) / x)` and `rgb(var(--ink-rgb) / x)`.
Both channels were checked first and neither flips with the theme, so the
swap is exact.

**55 remain, and they are not all bugs.** 41 are raw transition durations
in `base.css` (`.16s`, `.18s`, `.2s`) that predate `--t-hover`; 10 are raw
radii inside scene mocks. They are listed by `tools/tokens.py` and should
come down deliberately rather than in a sweep at the end of an unrelated
round.


## 2026-08-24 · the testimonial section is built to the supplied Figma

Tong supplied a Figma frame ("Testimonial Section Design", file
`qOjbTX2K2K2YTobWMb6a1F`, node `700:269`) and three card-ground PNGs, and
asked for it on the landing page — scaled up by ratio, using our design
system, with a few more people.

**The frame, read through the API rather than eyeballed:** 1047x496, three
cards 317x448, 20px apart, 991 inner. Card radius 24, padding 24, vertical
rhythm 24, avatar 48, quote 24/29.05, ornamental marks 64 in a 29px box,
attribution rule 4x61 at #D9D9D9, name 500/16, role 300/16. Ground #F6F6F6
— which is `--tile` exactly.

**Scaling.** Our section's inner measure is 1302, so the design scales by
1302/991 = 1.314. Every value in the component is written as
`calc(<figma number> * var(--qu))` and nothing else, so the design's own
numbers are readable straight out of the CSS and the ratios cannot drift.

**The supplied art was a whole card ground** — doodle at top and bottom
with a flat #F6F6F6 field between. That field was keyed out to
transparency (distance-from-ground alpha, then un-compositing the colour)
so the drawing can sit on any surface. It is the reason the section works
in dark mode at all; as delivered it would have been a light rectangle on
a dark page.

**Six cards, and only four faces existed.** Our four avatars plus the two
in the Figma turned out to be the same four people. Two more were
generated in the same illustration style. They are slightly cleaner in
line than the hand-drawn originals; at 63px it does not read, but they are
generated and should be replaced when real ones exist.

### Three defects, all caught by measuring

**The scale factor was invalid CSS.** `clamp(.80, .5313 + .0543vw, 1.32)`
adds a number to a length, which CSS will not do. The whole custom
property was garbage, every value derived from it fell back, and the 48px
avatar rendered at its natural size — a 430px portrait. A unitless
viewport scale cannot be expressed at all; `--qu` is a *length* now, "one
Figma pixel".

**Then it tracked the wrong thing.** On the viewport the ratios were the
design's at 1440 and nowhere else: at 1024 the grid was still three-up on
a 294px card and the avatar came out 17.8% of it against the design's
15.1%; at 768 one 701px card put it at 6.5%. `--qu` is now `.31546cqw`
— 317 design px = 100cqw — so it measures the card, which is the thing the
proportion is about. Measured 0.1514 against the design's 0.1514 at 390,
768, 900, 1024, 1280, 1440 and 2560.

**`margin-inline:auto` collapsed the card to 41px.** On a grid item it
switches stretch to shrink-to-fit, and the only child is `flex:1 1 0%`
with `min-width:0`, so the cell resolved to zero and the card rendered as
nothing but its own padding. An explicit `width:min(100%,460px)` instead.

### Two judgement calls

**Not Inter.** The Figma is Inter Light and `.ladder` already sets that
precedent for its own Figma, so Inter was tried first. It is wrong here
for a reason only visible at 84px: Inter draws quotation marks as straight
slanted bars and the design's are tapered curved wedges. Instrument Sans
— the page's own prose face — is the closest shape we own, and it keeps a
second prose face off the page. It has no 300, so Light lands on 400.

**Two columns before one.** Straight from three to one made the cards
700px wide, which is not the object the design describes, and it was the
only place the proportions had to be clamped.

### New copy, for approval

Three sample quotes were added for the new cards. They are samples like
the existing three, and the section still says so above them:

- *"Every ticket gets a first answer with the account history already
  attached, before anyone opens it."* — Support lead, 400+ tickets a week
- *"The weekly report builds itself overnight, so the morning goes on
  deciding instead of assembling."* — Operations manager, 6-person team
- *"It picks up the repetitive engineering work, so the two of us stay on
  the parts only we can do."* — Technical founder, 2-person team

The wrapping quote marks were also removed from the three existing quotes,
because the design carries them as the two large ornaments.


## 2026-08-24 · four comparison cards that are four different pictures

Tong, twice: *"the other three cards are too uniform in form — go research how
other companies' landing pages do similar cards, and only then start"*, and
*"the four-card quadrant arrangement is a monotonous way to interact with them.
Really go research it."*

Research first: six pages fetched and rendered rather than recalled — Sierra,
Warp, Attio, Cursor, Linear, Raycast. Written up in
`docs/comparison-card-research.md`. **None of the six uses a grid of equal
quadrants.** They all bleed their imagery off an edge, which is what makes it
read as a fragment of a running interface rather than a diagram. Raycast varies
the *internal layout* card to card, not just the footprint — that is the actual
cure for sameness, because the eye reads the arrangement before it reads the
box.

The rail-and-stage that Warp and Attio use is the strongest pattern for this
content and was still rejected: this page already has a rail-driven stage in the
tab reel above, and a second one would fix the section by making the page repeat
itself.

**What was wrong here.** Three of the four pictures were the same component — a
vertical list of avatar + label + right-aligned timestamp — with different
strings in it. Only the connector hub stood apart. And one of them argued
against its own sentence: the Codex card claims *parallelism* and illustrated it
with a single sequential column.

Now a pinwheel on twelve columns, 7+5 then 5+7, and one device per claim:
lanes running side by side for Codex, the shipped artifact with its trail lifted
over one corner for ChatGPT, the hub kept as-is for Zapier, and a dark terminal
overlapped by the shared team surface for Claude Code. Band height is constant
within a row and different between rows.

The interaction is the scroll position. Hover is out (these cards are not
links), a rail is out (see above), so each card plays its sequence once on
arrival and the pinwheel's four different heights make them fire in turn.

### Four bugs found by measuring rather than looking

**`.vs p` was styling the product mocks.** At one class plus one type it scores
(0,1,1) and beat every mock class inside the media band at (0,1,0), so each
`<p>` in a mock took the page's prose colour and size — including `--ink-soft`,
which flips with the theme. In dark mode that was light grey text on the mocks'
white cards at **1.92:1**. Light mode hid it completely. The same rule existed
in *both* layers and fixing only the design one left the base copy winning.

**The terminal was a hole.** `--t-shell` #12171C against the dark band computes
to **1.16:1**. It now has a hairline rim, identical in both themes.

**The hub mask never reached the band edge.** Its percentages were relative to
the 682px grid, so the fade only finished 171px from centre while the band edge
is at 108px. The mask now lives on the band, inscribed.

**The trail hid the numbers it vouches for.** Twice — first anchored to the
window rather than the band, then at a constant `bottom:-16px` overhang that ate
its own last row once the mock type came down to 11px.

`tools/audit.js` exempts `.vs__viz` rather than naming mock classes one at a
time.

### Recovery note

This round's commit was lost with the sandbox before it was pushed, and the
clone came back two rounds stale. The published draft was intact, so the CSS was
restored by splicing the live stylesheet's own rules back into the sources and
converging until a rebuild matched the shipped bytes exactly — 0 rules missing,
0 extra, 0 differing. Verification, not recollection.


## 2026-08-24 · the security link is gone, and so is its CSS

*"Read how security works →"* removed from the Control section. It pointed at
`#cta` rather than at anything about security, so it promised a page that does
not exist.

The class went with it. `.linkline` was the page's only use of that component,
so once the markup was gone every rule for it was dead code — 4 declarations in
`system.css`, 3 in `base.css`, and its name inside two shared selector lists.
The build's pruner drops rules whose class is absent from the markup, but it
keeps compound selectors like `.panel > .linkline`, so "the stylesheet got
smaller" would not have been true on its own. Removed at source.

## 2026-08-24 · I shipped a broken layout, and the whole gate passed on it

Tong: *"did you break it? check yourself."* Yes. Two defects, both mine.

**The Zapier card's text escaped its card.** The heading and body were sitting
on the section background at full page width, across both columns. The cause
was a regex from the previous commit: `<div class="vsui">.*?</div>` matched
against a block whose rows are themselves `<div>`s, so the non-greedy match
stopped at the *first nested* `</div>` and the replacement left one orphan
behind. That orphan closed `.versus` early and reparented everything after it.

**The whole gate passed on that build.** axe: 0 violations in both modes.
Border audit: pass. Breakpoints 390/768/2560: no overflow. Token audit: clean.
Asset stamps: clean. And the screenshot I took to check my work was cropped
*above* the damage. A broken nesting fails no accessibility rule, draws no
border and overflows no viewport — it just silently reparents half a section,
and every instrument I had was pointed somewhere else.

`tools/check-html.py` exists now. Fed the broken build it reports
`line 978: </div> closes <article> opened on line 974` — the exact line. It
runs before every publish, and **R9** says never to regex across nested tags of
the same name in the first place.

**The hub was not centred, for a reason worth knowing.** It is deliberately
wider and taller than its band, and `place-items:center` — like flex centring —
falls back to *start* alignment once a child overflows. That is the spec's
safe-alignment behaviour and it is invisible until something overflows. It is
an absolute `50%` + `translate(-50%,-50%)` now, which has no such fallback.
Measured at 0px off centre at 390, 768, 1440 and 2560.

## 2026-08-24 · the Zapier card becomes the reach itself

The claim on that card is *"reads the goal, picks the tools, and handles the
multi-step work in between"*, and a four-row list of chosen tools was a
literal reading of it. The picture is the **reach**: every connector on one
regular grid, Okou at the exact centre, and the rim masked away so an 11 x 5
crop reads as "and the rest of the thousand".

**Light, in both modes.** The reference was a dark grid. A dark panel here
would be the only inverted surface on a light page and would fight the Page
Theme Lock — and in dark mode it is the *page* that inverts, not the mock. The
first dark pass got this wrong in an instructive way: the tiles were pinned to
gray-50 but the centre tile used `var(--paper)`, so it followed the theme and
went darker than its neighbours. The hub became the darkest thing on its own
grid, which is the exact opposite of what it is for. Pinned to white now, like
every other product mock on this page.

**The tiles are the product's chip**, not a marketing approximation: gray-50
`#F3F5F8` at the 8px item radius, the same chip the app puts a connector mark
in. Okou's tile is a size up at the 14px card radius, lifted, and the only
tile the accent touches.

**Multi-step, as a cascade.** Three tiles beside the centre light in order over
a 4.2s pass, overlapping slightly so it reads as work in flight rather than a
queue, and a ring leaves the centre on the same cycle. Sampled at 180ms the
order is clean 1 → 2 → 3.

Two things the grid needed that are worth remembering. `place-items:center`
shrinks a grid item to its container, so the grid stopped reaching the card's
edges until it was given `width:max-content` — and reaching the edges is the
one thing the rim mask needs. And the marks are ranked by distance from the
centre, so the ones a visitor actually recognises are the ones that survive the
fade.

**One contrast fix on the way.** `.vs__vs` — the word between the two logos —
carried `opacity:.5` on top of `--ink-mute`, which is already the lightest ink
the page allows, so it was under AA by construction. It is quieter by *size*
now. One dimension, not two.

## 2026-08-24 · the card surfaces are read out of the product, not invented

Tong: *"remember to use our components."* He was right, and the previous entry
below is where I got it wrong: I built those four surfaces from scratch —
status pills reading "Running", "Done", "Read", "Drafted", "Waiting", and
little orange progress bars. **None of that exists in the product.** That is
the exact failure **P1** is written to prevent: designing a parallel language
instead of opening the component.

So I opened it. `turbo/packages/ui/src/components/ui/card.tsx` is
`rounded-xl border border-border bg-card` — radius-xl **14px**, border
gray-200 **#DCE1E8**. The list row is
`views/okou-page/sidebar-dialogs.tsx`: a **32px `rounded-lg` avatar**, a
truncated **14px** title, then `ml-auto` with a **fixed 14px indicator slot**
and a **12px gray-700 #788192** timestamp. The product's own comment explains
the fixed slot — *"w-3.5 fits the widest indicator so the running dot is not
squashed and the timestamp never shifts"* — which is a detail no screenshot
would have told me.

And "Running" is not a word in the product. It is the **RunningIndicator**: a
0.86rem sky-600 dot with a centre that breathes and a ripple that expands, on a
2400ms cycle. Both keyframes are copied out of `globals.css`, not approximated.
Three rows now carry a live one.

The product's values are declared as `--p-*` inside `.vsui`, so it is obvious
at a glance that the block does not belong to this page's token system.

**The crop got fixed in the other direction.** The real row puts its indicator
and timestamp at the far right with `ml-auto`, so a deep right-hand crop
removes precisely the part carrying the state. I did that twice. The overflow
is 20px now and the **bottom** does the cropping: a list cut mid-row reads as a
list that continues, which is the same claim and costs nothing.

**The audit caught the borders, correctly.** `.vsui` now carries the platform
Card's real 1px border and the ripple's ring, and §2 flagged both. They are the
app's chrome rather than page furniture, so `.vsui` joins `.tplwin` in the
named exemption list — **S4** requires exceptions to be written down and scoped
by name, not silently allowed.

## 2026-08-24 · the comparison cards show the product, and both logos

**The diagrams meant nothing and they are gone.** Lines, dots and rounded
rects arranged into an abstract "one lane versus three" — a picture *of* an
argument rather than the thing being argued about. Each card now carries an
oversized crop of a real product surface, chosen from that card's own claim:

- **vs Codex** — the runs list, four jobs moving at once, three still running
- **vs ChatGPT** — a published artefact with its URL, its state, and the
  activity trail underneath it
- **vs Zapier** — a goal in quotes, then the tools Okou *picked* for it, each
  with what it did
- **vs Claude Code** — a team workflow list with the faces it is shared with

**They are cropped, and that is the whole point.** The surface is laid out at
the product's own size and runs off the right edge and past the bottom of its
band. A drawing that fits inside its frame reads as a small illustration
someone made; a fragment that continues outside the crop reads as a real
screen. Same rule as **P2** — a mock has two sizes.

That took one correction: the rows were pushing their meta to the far right,
which is exactly where the crop lands, so the first version cropped away the
progress bars and the timestamps — the two things carrying the meaning. The
rows are left-packed now, so the crop takes padding.

**Both logos.** A card comparing Okou with an alternative that shows only the
alternative's mark is describing them, not comparing. Every card leads with
`[their mark] Name · vs · [our mark] Okou`.

**No shadow, no hover.** `--e-1` put a 30px blur under every card — the largest
shadow on a page whose own **S3** says a surface is a fill. And the cards are
not links: a lift on hover promises a click that does not exist, which is a
worse lie than no feedback. They separate by tone instead — the card is
`--tile` against the section's white, and the media band is one solid step
further, **tinted per card** from the existing scene hues so four surfaces read
as four subjects. Solid, not gradient.

**Type came down.** The card heading was `--t-d3`, up to 30px, which put four
headings in competition with the section headline above them. `--t-h` now, one
step down, and the body from `--t-sm` to `--t-meta`.

**And the status inks reversed on dark for the third time.** `--ok-ink` and
`--wait-ink` are tuned to sit on their own 12% tint over *white*; on the same
tint over a dark card they are 2.3:1 and 2.1:1. Both are ground-aware now. That
is the third token in this file to need a dark sibling for the same reason, and
the pattern is now explicit: **an ink tuned against one ground is not a colour,
it is a colour plus an assumption.**

## 2026-08-24 · one label, a real arrow, and a centring I had broken

**The hint stopped being centred, and I broke it in the previous commit.**
The pill is `position:absolute; left:50%`, and the other half of that — the
`translateX(-50%)` that pulls it back by its own width — was living *inside the
keyframes*, as the first argument of `transform:translate(-50%, Npx)`. When the
bob moved onto the independent `translate` property, those keyframes went, and
the centring went with them. The pill sat with its left edge on the midline.

The comment I wrote at the time says the bob "composes with the centring
transform". There was no centring transform. I described an intention and did
not implement it, and nothing caught it because the change I was verifying was
the *motion*, which was correct.

The rule worth keeping: **a layout property must never be a side effect of an
animation.** If the animation is removed, replaced, or switched off by reduced
motion, the element still has to be where it belongs. `transform:translateX(-50%)`
is a static declaration now, and the reduced-motion guard added last round would
have exposed this immediately had anyone opened the page with it on.

**One label and a real arrow.** The seven hints said "Scroll it" six times and
"Scroll the page" once, with a chevron. All seven now say **"Scroll down"** with
Lucide `arrow-down` (`M12 5v14` + `m19 12-7 7-7-7`, fetched from source rather
than recalled). A chevron points; an arrow instructs, and the instruction is the
point.

## 2026-08-24 · the scroll hint breathes, and every eyebrow goes

**The hint's stutter had a specific cause, and it was the keyframes.** The loop
ran `0% / 45% / 70% / 100%` with `--e-elegant` as its timing function — and a
timing function applies **between each pair of keyframes**, not across the
cycle. So a strong ease-out ran three separate times per loop, and every
restart is a fresh burst of speed. That is the "fast, then slow, over and
over". It also held perfectly still for the last 30% of every cycle and pulsed
opacity on a fourth, unrelated rhythm.

It is one oscillation now: two keyframes, `alternate`, and a **symmetric**
curve. Sampled at 50ms, velocity builds to a peak mid-travel and decays to zero
at each extreme, then reverses — a bob, not a series of darts.

That needed a new token. Every easing in the file was an ease-**out**, which is
right for something that arrives and stays and wrong for anything that returns
to where it started; a loop eased out on both legs reads as twitching.
`--e-inout` is the first symmetric curve in the set.

The bob also moved off `transform` onto the independent `translate` property,
so it composes with the centring `translateX(-50%)` instead of overwriting it —
which is why the old rule needed two competing `transform` declarations to hide
the hint.

**The hint is back in all seven windows.** I removed six of them last round on
taste-skill's "no scroll cues" rule; Tong overruled it, which is his call — the
affordance is real, a scrollable region inside a window frame is genuinely not
obvious, and it is not the page-level "↓ scroll" the rule is aimed at. Six show
it. **Team Digest does not, and should not**: its artefact renders 426px inside
a 513px window, so there is nothing to scroll and the existing overflow check
correctly stands the hint down. A hint that points at nothing is a lie.

It also gained a reduced-motion guard, which it has never had. An infinite loop
is exactly what that media query is asking about.

**Every eyebrow is gone.** Four of them, and this settles the conflict recorded
last round: taste-skill gives eyebrows a budget (max 1 per 3 sections);
`pbakaus/impeccable` bans them outright — *"This one is a ban, not a default:
no brief earns it back. The heading carries its own weight."* We were compliant
with the first and in breach of the second. Tong resolved it in impeccable's
favour. The section heads read better without them, which is the argument the
rule was making.

## 2026-08-24 · uneven pills, and the comparison section becomes a picture

**"All the small tags have uneven padding, left small right big."** Two causes
stacking, both pushing the same way.

`letter-spacing` is applied after the LAST glyph as well as between glyphs, so
a tracked label in a pill always sits one tracking-unit further from the right
edge than the left. Every pill now gives that back with `calc(pad - Nem)`,
where N is that component's own tracking — `em` resolves against the element's
own font-size, so the two can never disagree. Chip, tag, state, tab and both
button sizes.

The chip had a second problem on top: it still carried `padding:7px 14px 7px
11px`, shaped around a leading dot that was **deleted a round earlier**. 11
left against 14 right, plus 1.92px of trailing track, on a label that had
nothing on its left any more.

**A process note that matters more than the fix.** Three rebuilds in a row
measured the same wrong numbers, and the CSS was right every time —
`agent-browser` was serving a cached page. The `?r=` hash changes on the
stylesheet, but the HTML that references it was itself cached, so the browser
never fetched the new one. **Cache-bust the page URL when verifying**, not just
trust the asset hash. Some of this session's earlier "verified" measurements
were taken the same way.

**The comparison section is a picture now.** It was a logo, a heading and a
paragraph, four times — the identical icon-plus-heading-plus-text grid that
`pbakaus/impeccable` names as the lazy container by default. Each card leads
with the difference it claims, drawn: the alternative's shape above in mute ink
and still, Okou's below in the accent and moving. One grammar, four times,
because the section makes one argument four times, and the comparison IS the
picture so the card needs no third element to explain it.

Geometry, not illustration — lines, rounded rects, circles and a travelling
pip, every coordinate specified. Nothing imitates a screenshot, which is the
line both skills draw. The section's placeholder band is gone with it: the
cards carry the visual, so **one of the three missing assets is no longer
missing**.

Two SVG traps on the way. `vector-effect:non-scaling-stroke` puts
`stroke-dasharray` in screen units while the path length stays in user units,
so every dashed animation desynced as the card resized — fixed with an explicit
`pathLength`. And an SVG with no height takes its intrinsic ratio at full
width, overran its band, and `overflow:visible` painted it straight over the
heading underneath.

**`zapier.svg` was broken and my own audit had cleared it.** The file held one
path — `M12 6H0V9H12V6Z` — a single horizontal bar of Zapier's asterisk, so
every place it appeared rendered an orange dash. The brand-mark audit measured
its ink as "100 × 25" and I filed that as "a wide wordmark, fine". It was not a
wordmark; it was a mark with five of its six spokes missing. Rebuilt as the
asterisk in Zapier's own orange.

**The reach statement loses its underline.** Display-scale type that swaps on a
timer: a stroke under a phrase that is about to be replaced draws the eye to
the swap rather than the phrase, and at that size the colour already carries
it. Same reason `.display` never took one.

**Lighthouse, honestly.** Six samples on identical bytes ran 76, 85, 96, 97, 98,
98 — median 96.5. There is no measurable regression from the new animations,
and that also means last round's "96 → 99" was one sample each and I reported
it with more confidence than one sample earns.

## 2026-08-24 · the whole taste-skill list, worked

Nineteen items from `taste-skill-reconciliation.md` Part 2. Sixteen done, one
withdrawn as my own error, two not done with reasons. Part 3 of that file has
the per-item status; this records what is worth remembering.

**Dark mode, as one token swap.** Eleven grounds and inks redefined under
`prefers-color-scheme: dark`, plus a `[data-theme]` pin and a nav toggle that
only writes to storage once somebody actually chooses. No second stylesheet:
every rule in the file already read a semantic token, which is the whole
return on the token work of the last two rounds.

What carries over is the RELATIONSHIPS, not the values. In light a card is
*lighter* than the page and the header is *darker* than both; in dark both
inverted, because "separates from its surroundings" was the rule and "is
lighter" was only how light mode happened to say it. Every pair was computed
before a line was written — worst text contrast in the dark block is 5.5:1,
lightest ground separation 1.08.

Three things did not swap, each for its own reason. The **channels**:
`--ink-rgb` is the shadow and scrim channel, and a shadow is dark in both
modes, so following `--ink` into near-white would have turned every elevation
into a glow. The **product mocks**: they draw the app, and a screenshot does
not flip with the page around it. And `--ink` itself turned out to be doing two
jobs — text colour *and* the closing band's ground — which is invisible until
the second mode, so the band got its own token.

**The accent reversed direction for the third time in this file**, and this
time it broke something: `--accent-solid` is 3.96:1 on a dark card. Every
accent *phrase* now reads `--accent-wash`, which is ground-aware; only the two
accent *fills* keep `--accent-solid`.

**The drawn mark was a regression, not a missing feature.** §1 spends the
accent in three places and names the first "the drawn marks under the sentences
that matter". `base.css` has drawn that stroke all along; the design layer was
cancelling it with `background:none` and substituting a colour swap. Restoring
it cost one deleted declaration, and forced the round's one real design call:
at reading size the phrase keeps its ink and the accent arrives underneath, one
dimension per state; at display size the phrase becomes the accent and carries
no stroke, because underlining the loudest line on the page is a second
emphasis on something that needs none.

**The banned scroll listener is down to one.** Both nav states are booleans
that flip at a line, which is what IntersectionObserver is for: `is-stuck` now
watches a 1px sentinel, `is-dark` watches the dark bands with a rootMargin set
to the header's midline. The ladder keeps a listener because it maps distance
onto a position rather than a boolean, and it now detaches below the pin
breakpoint, so narrow viewports carry none at all. The veil went further and
needs no JS whatever: `animation-timeline: scroll()` fades it in over the first
180px, so it arrives instead of existing.

**The stagger audit found one violation out of three candidates**, and the
useful part is the distinction. Words in a sentence and lines in a headline
overlap ~90% *on purpose* — a sentence rising is one gesture. Separate objects
are a queue of beats, and three tiles at 70ms against a 560ms fade arrived as
one blur. Now 120 against 420. N5 has a ratio now instead of an adjective.

**Corrections owed.** I reported seven hand-rolled SVG icons; all seven were
byte-for-byte Lucide `chevron-down`, verified against the upstream source.
Withdrawn. And the border audit was reporting four false hits in dark mode: the
UA's default button border on a `display:none` control, because the burger's
reset lived inside a narrow media query. Both the reset and the audit are
fixed; the audit now skips elements with no client rects.

**Three assets are still missing and were not faked.** The hero's product
screen, the comparison graphic and the customer logos are declared
placeholders. The only way to fill them was to generate a fake product
screenshot or invent customer brands, which the skill bans (4.8, 9.D) and K3/K4
ban. The skill's own last-resort clause says to leave the slot and say so. Said.

Lighthouse, before and after the round: performance **96 → 99**, FCP 0.9s →
0.5s, LCP 1.1s → 0.9s, CLS 0 both, and it had never been run before today.

## 2026-08-24 · the veil ramps from the top edge

The progression was starting in the wrong place. Every layer held **full alpha
from the top of the veil down to a hem in the last 22px**, so the whole header
region was one flat slab of maximum blur and the entire ramp was crammed
underneath it. That is invisible while the bar sits opaque on top of it — and
it is exactly what you see the moment the bar lifts and insets, because then
the strip above it and the gaps either side *are* that slab, arriving at full
strength against the window edge.

The stops are percentages of the whole veil now, and every layer starts fading
at 0%. Still monotonic and still widest-radius-first, so accumulated blur falls
continuously from the first pixel to nothing. Measured on the striped
instrument: contrast 2 → 255 over 66px with **0 non-monotonic steps**.

`--veil-fade` is renamed `--veil-tail`, because it no longer describes a fade
zone — the whole veil is the fade, and that number is only how far it reaches
past the header.

Also worth writing down, because it cost a detour: **the instrument has to be
read vertically.** The test backdrop is horizontal stripes, so every *row* is
uniform and a scan across x returns zero contrast at every height — which looks
exactly like a perfect pass. Sample down a column instead.

## 2026-08-24 · the two oranges are one orange, and the tokens get an audit

**The veil first.** Two complaints, one cause and one dial. The blur was
showing *horizontal lines* because the first version's masks rose AND fell —
each layer was a band, and where one band was descending while the next was
still climbing the total coverage dipped and rose again, printing three or four
hard lines across the strip. Every mask is monotonic now: opaque at the top,
one fade, gone, widest radius let go first, so the accumulated blur can only
decrease and there is no interior edge for a seam to form on. Reproduced and
then disproved on a striped test backdrop, which makes blur strength directly
visible — the seams are unmistakable on it and the fixed version is clean.
`--veil-fade` also comes down from 56px to 22px at 1440.

**The two buttons were never different colours.** Both are `#D64300`, in the
rendered page and in the screenshot they were reported from — I sampled the
screenshot to be sure. What differs is what is around them: the SIGN UP sits on
the header's grey where its contrast with the ground is 3.86:1, the hero button
on white where it is 4.5:1, and it is a fraction of the area. Same ink, two
surrounds, two readings.

**But the brand orange really was missing.** #ED4E01 was painting three things
on the whole page; the darkened `--accent-solid` was painting fourteen. That
sibling exists for exactly one reason — white text on the brand orange is
3.69:1 — and it had spread to places with no text on them at all: a 6px chip
dot, the section-label dot, the typing caret, the card read-bar, the window
light. All five are the brand orange now. The four that remain on
`--accent-solid` all carry text, which is the whole of its job.

`--accent-solid` cannot become #ED4E01 while the buttons carry white 12px
labels. That is not a tuning question: 3.69:1 against a 4.5:1 requirement, and
the only ways out are a darker label on the fill or a label big enough to count
as large text. Say the word and I will draw either.

**The token audit.** 95 declared, and 104 distinct colour literals living
outside them — 266 occurrences.

- **7 deleted**: `--navy`, `--green-dk`, `--sec`, `--g-000` (a second name for
  `--ink`), `--accent-ink` (a second name for `--accent-solid`), `--nav-bottom`,
  `--r-xl`, `--e-tag`. None referenced anywhere.
- **Channels added**, because a hex cannot carry an alpha and that is why the
  literals bred: `rgba(12,15,18,…)` had been re-typed **41 times in 22 different
  alphas**, none of which would have followed `--ink`. 66 sites now read
  `rgb(var(--ink-rgb) / .05)` and friends.
- **The scene hues got tokens.** Seven identity colours were sitting inline in
  the markup as literals with nothing behind them — which is exactly why the
  ladder had grown a fourth, nearly-matching set of its own in CSS, differing
  in one pink. Named for the team each belongs to.
- **Status inks**: `#0B6B40` and `#8F4207` were hard-coded inside `.state`.
  They are the AA-safe siblings of `--ok` and `--wait` on their own 12% tints —
  the same relationship `--accent` has to `--accent-solid`, so they are tokens
  now for the same reason.
- **A latent failure found on the way**: the wordmark's hover colour was
  `--accent-solid`, which was correct when the header was white and became
  3.86:1 the moment it went grey last round. axe never caught it because axe
  does not hover. It reads `--nav-accent` now, so it follows the ground.

Everything above is a visual no-op except the eight decorative shapes, and that
is not an assertion: 1290 elements had every computed colour, shadow, gradient
and mask captured before and after, and the diff is those eight and nothing
else. QA §4r now requires that diff for any colour refactor.

## 2026-08-23 · the header gets a measure, a veil, and a dark version

**A measure.** The header was the one thing on the page ignoring the 1320px
cap: at 2560 the wordmark sat 600px outside the content it labels while the bar
kept stretching. Matching the section column exactly is wrong in the other
direction — the header would read as one more column of the page rather than as
the frame around it, and two edges landing on the same pixel from different
systems looks like a coincidence rather than a decision. So it takes the
section card's own padding expression *measured from the window edge instead of
the card edge*, which lands its content exactly one `--card-gap` outside the
section column at every width. Bounded, related, deliberately not flush. The
content also does not move between the resting and floating states — the bar
pulls in by `--card-gap` and its padding gives the same amount back, so only
the ground travels.

**A veil.** A `backdrop-filter` is a switch: content is blurred or it is not,
and the boundary is a hard line across the page. Masking one blurred layer only
fades that line's *opacity* — the blur still starts at full strength. A ramp
needs several layers, each blurrier than the last and each masked to its own
band, so what changes down the strip is the blur radius. Four of them, painted
behind the header rather than inside it, so once the bar floats the veil is
what fills the strip above it and the gaps either side.

**No tint on it.** Carrying the header's grey down the strip was the obvious
next move and it undid the previous round: the tint filled the gaps around the
floating bar *in the bar's own colour*, so the bar stopped having edges and the
header read as full-bleed again at every scroll position. The veil blurs; the
bar colours. One job each.

**A dark version.** The page ends on two dark bands and a pale grey bar sitting
on them read as a leftover from the section above. The header now crosses into
a dark version of itself — and it reads the *ground*, not a scroll offset: the
bands declare themselves with `data-ground="dark"` and the header asks what is
behind its own midline, so moving a section or adding a band needs no number
changed. Everything inside the header reads five local tokens and no rule in it
names a colour, so the dark version is a five-line swap rather than a second
copy of the component.

The accent is the part worth writing down. **The correction runs in opposite
directions on the two grounds.** On grey, the brand orange has to be *darkened*
to clear AA (`--accent-wash`, added last round). On the dark header that same
darkened orange fails at 3.0:1, and it is `--accent` itself — the undarkened
display weight — that clears, at 4.7:1. `--accent-solid` clears neither: it is
tuned to exactly 4.5:1 on paper, so it is safe on white and on nothing else.

**And a third thing, which axe found and which no amount of colour tuning
fixes.** Loading the page and jumping straight to the closing band failed
contrast on the nav's hover-roll labels, reproducibly, 4 runs out of 4. The
cause is not either accent: while the header cross-fades between grounds it
passes through mid-grey, and at that instant the maths asks for a foreground
at L ≤ 0.012 (near-black) or L ≥ 1.20 (brighter than white). Both accents sit
at L ≈ 0.13–0.24. **No orange survives the middle of that fade** — the failure
is a property of animating between two grounds that pull the correction in
opposite directions, and it would exist for any brand colour.

So the fix is not a colour. The rolled-in label is decorative, `aria-hidden`
and clipped out of view until hovered — it had no business being rendered at
rest, where it was also giving axe 44 nodes of "incomplete" to chew on. It is
`visibility:hidden` now, with the hide delayed by the roll's own duration so
the slide still plays. Violations back to 0 on the reproducer.

**One transient left, and it is not from this round.** The same reproducer
still catches `.cta__btns .btn--dark` for about a second: the entrance reveal
animates opacity, and white on `--accent-solid` is *exactly* 4.5:1, so any
opacity below 1 dips under. It settles to 0 and it affects every text-on-accent
element inside a `.reveal`, so the fix is a decision about `.reveal` or about
`--accent-solid` rather than about this button. Left alone and written down.

## 2026-08-23 · the header stops pretending, and the KPI row becomes tiles

Four notes in one round: the tab reel, the window edge, the data row, the
header. Three of them were about a component claiming something it had not
earned.

**The tab reel.** Wider (720 → 820), and the end fade runs much further into
the neighbouring tab (6%/94% → 14%/86%) — a short fade reads as a crop, not as
"there is more of this". The third note was the real one: **a focused tab kept
only two arcs of its ring.** `.tabs` clips horizontally so the reel can slide
under a fixed centre line, and a clipping container clips *outlines* too — the
box was exactly as tall as the tabs, so the top and bottom of the 2px/3px-offset
ring were cut off. It now carries the ring's room vertically (`padding-block:6px`)
and takes it straight back out of the layout (`margin-block:-6px`).

**The window edge.** The 0.5px hairline was drawn as a spread shadow, which is
an *outside* stroke: it grew the window by half a pixel all round and sat
between the frame and its own drop shadow, which is what made it read heavy. It
is an inside stroke now, and lighter (.22 → .14). It could not simply become an
`inset` shadow: inset paints above the element's background but **below its
children**, and the chrome bar and the scroller are opaque and cover the whole
box. So it is an overlay pseudo-element, on top, `pointer-events:none`.

**The data row**, rebuilt to the supplied design: label above figure, left
aligned, each on its own tile. Two things were wrong before. The tiles did not
exist — three bare figures floated on the white card — and the row's own
`margin-inline:auto` was being overridden by `margin:0`, so the measure was
kept and then hung off the **left** of a 1300px card. The reference's grey
sampled at exactly `#F6F6F6`, the same panel grey as the connector cards six
inches above it, which was living as a hard-coded literal inside one component;
it is `--tile` now, with `--tile-pad` and `--tile-gap`, and the outputs panels
reference the same three. Every size in the reference maps onto the existing
scale to within a pixel — 15 / 53.3 / 23 against `--t-sm` / `--t-figure` /
`--t-unit`, and the tile's 24px inner padding against `--tile-pad`. The label
left the utility face: uppercase mono above a 54px numeral competes with it for
the top of the tile instead of introducing it. The row also stopped stacking at
960 — that breakpoint existed because three *bare* figures needed the width to
stay apart, and a tile does that job down to 640.

**The header.** It was floating from the very first pixel of an unscrolled
page, which is a decoration pretending to be a response to scroll. It is now
full-bleed, flush and square at rest, and becomes the floating bar on the way
down: steps down by `--nav-top`, pulls in to `--card-gap`, takes `--r-section`,
condenses to 54px. The corner came down 22 → 16: `--r-nav = --r-btn + --nav-pad`
stated a real relationship and still produced a lozenge on a 54px bar, so the
rule changed — a box inset to a section card's width takes a section card's
corner.

**And the shadow is gone.** Heavy enough to lift a white bar off a white
section, it read as a bruise; light enough not to, it lifted nothing. The
header carries its own ground instead — `--wash-2`, one step off the page grey
and two off a section card — which is the design system's own rule that a
surface is a fill. `--r-nav`, `--e-nav` and `--e-nav-stuck` are deleted rather
than left lying around.

That change cost one accessibility violation and it is worth writing down why:
**`--accent-solid` is tuned to exactly 4.5:1 on paper, so it clears AA on white
and on nothing else.** The nav links' hover copy rolls in in the accent; the
moment the header went grey it fell to 3.86:1. There is now `--accent-wash`
(#B93A00) for accent text on a grey — 4.9:1 on `--wash-2`, 5.3:1 on `--tile`.

**One bug found while in there, not a regression.** The mobile menu has been
opening 114px wide, centred inside a 374px header, with `left:0; right:0` in
the CSS the whole time. Box Alignment applies to absolutely-positioned boxes:
the panel inherited `justify-self:center` from the header's wide-layout grid,
which makes an abs-pos box shrink-to-fit and centre itself *inside* its insets
instead of stretching. The insets were never the problem. QA §4p now says to
read `justify-self` before touching `left`, `right` or `width`.

## 2026-08-23 · the Slack mark was never small; its viewBox was

"The Slack logo is too small, it should match the other logos." It did not match
because **the asset ships with 27% clearspace on every side** — its ink fills
46% of its own `viewBox`, where every other connector mark measures 88–100%.
Dropped into the same 48px box, it renders at half the size of its neighbours.
Measured, not guessed: each SVG drawn to a 256² canvas, alpha bounding box read
back. Slack was the only outlier on the page, by a factor of two.

Every previous encounter with this had been patched at the usage:
`scale(1.25)` on tags and buttons, `scale(1.34)` in the logo rail, `scale(1.35)`
twice in the hero, `scale(1.62)` plus a box override in the permissions list —
**six corrections, four different numbers, three files**, and none of them
agreed. The connector cards were built later and got none, which is where it
was finally visible. Every one of those was a patch on a symptom; the file was
wrong the whole time.

Fixed in the file: `viewBox="0 0 270 270"` → `"73.6 73.6 122.8 122.8"`, the
mark's own ink bounds, in both copies. Slack now measures 100% of its box with
51.9% ink area — between Notion (51.1) and Linear (61.3). All six CSS
corrections deleted; the `.perms__slack` class went with them. Removing them
also surfaced that a 15-line hero block had been pasted into `base.css` twice.

Two rules and a gate came out of it: crop the asset, never the CSS (**B1/B2**),
and QA **§4n** measures every mark's ink rather than trusting the eye. That grep
is what found the fifth and sixth corrections after the first four were gone.

**And a second bug, found while fixing the first.** Yesterday's asset stamping
was not actually re-stamping. The pattern `assets/[^"?]+` cannot match a URL
that already carries `?v=`, so the first build stamped every asset and no later
build ever updated one — editing a file in place left its URL frozen at the hash
it had the day it was added. Exactly the failure the stamping was added to stop,
reintroduced by the regex that implemented it. `slack.svg` changed content and
kept `?v=b7a261cf` through a full rebuild before this was caught.

The old stamp is now part of the match and gets discarded. Audited all 136
stamped URLs against their bytes: 0 stale. QA §9c no longer says "count the
`?v=`" — counting proves presence, not freshness; it now checks each stamp
against the file's sha1.

## 2026-08-23 · the fix was right; the delivery was not

Two rounds of "the artefact is still cut off" when the artefact had already been
fixed. The server was serving the corrected file — same sha1 as the local build,
funnel fully rendered, checked by cropping the bytes off the live URL before
writing a word of this. What was wrong is that **nobody could receive it.**

`build-css.py` stamped `styles.css?r=` and `app.js?r=` and **nothing else**. So
replacing an image in place — same path, new content — ships the *old* picture
to every browser and CDN edge that already holds it. The picture was fixed; the
URL never changed; so nothing changed on screen. This is the same failure as the
hand-kept `?r=42` that once shipped stale CSS across four deploys, and the lesson
was written down for CSS only.

**Every local asset now carries the hash of its own bytes** — 136 of them,
across `src=`, `href=` and `url()` in inline styles. Replace a file and its URL
changes with it; there is no way to ship a stale asset by accident any more.

The reason it took two rounds to see: I verified the fix by looking at *my*
build, and it was correct there every time. A local check cannot detect a
delivery bug. **Fetch the shipped bytes and inspect those.**

---

## 2026-08-23 · the captures were blank below the fold

The windows scrolled, but what they scrolled through was empty. Forcing every
reveal open — `classList.add('is-in'); style.opacity = 1` — makes the *wrapper*
visible without ever letting the page's own scroll observers fire, so anything
those observers render (charts, tables, lazy sections) was still unbuilt when
the capture ran. The ads dashboard's funnel section was two empty card outlines
above 400px of nothing.

**Capture by actually scrolling.** Walk the page in ~700px steps with a beat
between each, sit at the bottom, return to the top, then capture. The site's own
machinery does the rendering, which is the only way to be sure it happened.
Checked each result by cropping its last 900px and looking at it.

**`hidden` loses to any author `display`.** The scroll hint has
`display: inline-flex`, which beats the UA sheet's `[hidden] { display: none }` —
so a hint told to hide kept drawing itself. The ops report is a genuinely short
page that fits its window, and its hint was still sitting on top of it.
`.tplwin__hint[hidden] { display: none }`.

Live now: ads 445px of scroll, sales 181, engineering 550, product 181,
leadership 1304, Storefront 1476 — and ops 0, correctly, with no hint.

---

## 2026-08-23 · real full pages in every window, and the frame that never leaves

**Six of the seven windows had nothing to scroll.** Their artefacts were 2200 ×
1640 *viewport* screenshots — a 4:3 crop of a page, not the page — so at 880px
wide they were 656 tall against a ~553 window and the visitor saw a cut-off
picture with no way to move it. Only Storefront had a genuine full-page capture.

All six artefact pages are still live, so they were re-captured properly:
`--full` at 1280 with every reveal forced open first. Heights now 870 → 3713
instead of a flat 656. The board deck is the exception worth noting — it is a
**slide viewer**, so a full-page capture correctly returns one viewport; its six
slides were captured through the arrow key and stacked, which is what "eight
slides" should look like in a window you scroll.

**The scroll hint was bound to `querySelector` — the first window only.** Six of
the seven could never dismiss their hint. It is per-window now, and it hides
itself where a page genuinely does not overflow. That check has its own trap: a
pane at `display:none` measures `scrollHeight === clientHeight === 0`, so a
check at load hid six hints permanently — it re-measures on `okou:scene`.

**The frame never leaves.** Making the whole window arrive with the result put a
3.4-second hole in the right-hand third on *every* tab change, and an empty
column is a worse story than a slightly early one. The chrome, the URL and the
window's edge are now there from the first frame — informative in themselves —
and what arrives is the **page inside**, at 300ms. The causal beat is not lost:
it belongs to the result card in the conversation, which is the panel's hero and
still lands last.

The whole exchange is tightened with it — `[0, 700, 1700, 2600]` from
`[0, 1000, 2200, 3400]`. Each beat still settles before the next, and everything
is on screen inside 2.6s instead of 3.4.

---

## 2026-08-23 · all seven tabs, seven grounds, and the paragraph I deleted

**The missing first sentence was my bug.** Two rounds ago I replaced the tab
block wholesale and the replacement text did not carry `LINES` / `writeLead`
with it. `writeLead` was still *called* — from inside the swap's `setTimeout` —
so every call threw before `classList.remove('is-swapping')` ran, and the lede
sat at `opacity: 0` forever with the tab strip frozen behind it. Restored.
The failure is instructive: a function deleted from a block replacement fails
**silently inside a timeout**, and the visible symptom (a missing paragraph) is
nowhere near the cause.

**All six remaining tabs are rebuilt to the first tab's structure** — three
columns, the connectors it reached into, the exchange on a painted ground, the
artefact in a scrollable window. Every one keeps its real connector copy and its
real artefact screenshot; the conversations are written from what each run
actually did.

**Seven tabs, seven grounds.** Three more painted grounds generated
(`amber`, `teal`, `violet`) so no two tabs share a background, each with its
veil computed from its own mean luminance — 90 → 204 needs .04 → .51 to land the
bubbles on one value.

**Each pane plays its own exchange**, from the top, whenever the reel reaches it.
One shared timeline; `.is-live` moves to the pane being played and comes off the
one before it, so a pane at rest shows the finished conversation. The dwell goes
7.2s → **9s**: the exchange runs 4.3s, and 7.2 left it barely three seconds at
rest before the reel moved on.

**The reel is narrower** — `max-width: 720px`, centred. Seven tabs across the
full card read as a menu you are meant to scan; a short window with the
selection at its centre reads as a reel you are moving through, and the fade at
each end is what says there is more of it.

**The KPI row, per the `dataviz` skill:**

- **`tabular-nums` off.** Tabular gives every digit the width of a zero — right
  in a column that must align, wrong on a standalone figure. At 56px a "14" set
  tabular reads loose and mechanical. Tabular is for tables.
- **The row keeps its own measure** (760px). Three figures spread across a
  1300px card stop reading as one group and become three unrelated statements.
- **The caveat stops dressing as a fourth label.** It was in the utility face,
  uppercase and letter-spaced — exactly the label treatment — so it read as a
  fourth stat. It is prose at caption size now.

One deviation from the skill, stated: it asks for stat labels in sentence case;
ours stay uppercase mono because that is this page's utility-text rule and it is
applied everywhere else.

---

## 2026-08-23 · the reel loops, the turn changes hands, and the bar does not stop

**The tab row loops.** Three copies of the strip live in the rail —
`[clones][real][clones]` — and only the middle set is a real tablist: the outer
two are `aria-hidden`, out of the tab order and carry no role, so a screen
reader still hears seven tabs rather than twenty-one. Advancing off either end
animates *into* a clone and then re-seats on the matching real tab with the
transition switched off; same picture, so the seam is never seen. Verified
through a full cycle: 9 → 10 → 11 → 12 → 13 → wrap → 7 → 8, always exactly one
tab lit and always 0px from the centre line.

The first attempt lit **every copy** of the active scene, which put a second
highlighted tab at the edge of the mask — the exact seam the clones exist to
hide. Selection is now marked on the centred rail *slot*, not by matching
`data-scene`.

**The bar no longer stops on hover.** It was pausing whenever a pointer crossed
the section, which made the whole thing feel stuck — and the progress is
precisely what tells you the panel is going to change. It still pauses off
screen, in a background tab and under reduced motion; **keyboard focus** still
parks it, because a keyboard user has no other way to hold it; and any click
parks it for good.

**The user's avatar is gone.** You are the user — the only face that needs to
be there is the one you are talking to. Removing it also lets the ask run to
the panel's edge, which is what separates it from the replies.

**The turn changes hands visibly.** Okou's replies are a run of one voice and sit
close; the ask now carries `margin-bottom: clamp(14px, 1.8vw, 26px)` under it,
and that gap is what says the turn passed.

**The result preview is sized by width, not capped by height.** Capping the
height cropped the image, and the crop landed through the page's own headline —
a preview sliced across its type reads as a rendering fault, not a preview. At
66% of the column it shows the whole hero band with no crop at all.

**The browser's hairline is 0.5px** (`rgba(12,15,18,.22)` — the alpha comes up
as the line comes down, so it reads the same weight).

---

## 2026-08-22 · the tab reel, rectangles everywhere, and the rules in one file

**The tab strip is a centred reel.** The selected tab is always on the
viewport's centre line — the rail slides under a fixed centre rather than the
selection jumping around a static strip, so the eye never goes looking for what
is active and the seven cases read as one thing you are moving through.
Verified: the active tab's centre is 0px from the viewport's at every width,
after fonts load and on resize.

**Each tab carries its own hue and doubles as a progress bar.** It fills across
its width and hands over to the next one — 7.2s each. The first version wiped
the hue across the whole button and it was wrong twice over: the label sat on
two grounds at once, and half these hues (amber, pink) cannot carry white text
at any opacity. It is a **tint behind the label plus a solid bar under it**,
which is legible on every hue and is the same rule-as-progress-bar the ladder
already uses — one idea used twice rather than two ways of saying "how far
through".

It yields, as anything that moves on its own must: paused off screen, in a
background tab, on hover, on focus-within, and disabled entirely under reduced
motion. **A click parks it for good** — at that point the visitor is driving.
Arrow keys move through the reel.

**Two shapes, and only two — applied to the whole page.**

- **Every component with a box is a rectangle** (`--r-btn`). `--r-pill` is now
  only for things that are actually round. The chip, the tags, the tabs and the
  hero's serif lead were lozenges; the audit found the last one (`.serif-lead`,
  336 × 41 at radius 999) and the page now measures **zero** of them.
- **Every section is a white card on the grey page.** It had been mixing three
  shapes — grey bands (`parallel`, `positioning`), white bands (`control`,
  `proof`) and cards (`outputs`, `reach`, `workflows`) — so a reader had to work
  out what a section was three different ways. All seven are cards now; the hero
  and the closing CTA band are the two deliberate exceptions.

**Also:** the Outputs chip drops its shadow and pill for a `--wash-2` rectangle
(and no longer needs a per-section ground flip); the heading-to-tabs gap comes
down from 40–64px to 22–34px; and the lede is shortened so **every** tab's
version lands in exactly two lines, with the block reserving two so switching
tab never moves the strip underneath it.

**`docs/RULES.md` is new** — every rule this page is held to, one line each,
with a pointer to where it is argued and where it is machine-checked. Thirty-odd
rules across shape, measure, type, colour, motion, product mocks, content and
process. `design-principles.md` and `qa-checklist.md` now point at it. The
point is to stop re-litigating settled decisions three rounds later.

---

## 2026-08-22 · the generated page is real, and the three columns became one run

**The artefact is now an actual Blueprint Grid page.** It was a hand-coded
miniature that only resembled a website. The real one: a content plan authored
against `template:blueprint-grid`, rendered with the template's own engine
(`node render.mjs`), six media slots filled — three existing coastal photos plus
three generated with `seedream4` — captured full-length at 1280 and shipped as
one tall image the visitor scrolls. Subject unchanged: Litoral, the coastal
hotel. The same page's hero is the card inside the chat, so the thing Okou is
handing over and the thing in the window are visibly the same object. Plan kept
at `generated/litoral-plan.json`; 328KB for both assets, and three now-unused
`assets/template/*.jpg` are gone.

**The three columns are one run now.** They had been three unrelated pictures in
a row — two dead connector cards, a conversation talking to itself, and a window
that was simply always there. The section claims *you ask once, Okou reaches into
the tools you already use, something real ships*, so the columns say that in
order, off one timeline:

| t | what |
|---|---|
| 0.0s | the ask arrives |
| 0.7s | Google Drive lights — greyscale lifts, the card rises, a hairline of accent runs its width and goes out |
| 1.0s | Okou's typing dots |
| 1.25s | Gmail lights the same way |
| 2.2s | the dots are replaced by the reply |
| 3.4s | the result lands in the chat **and the window arrives with it** |

Everything is scoped to `.is-live`, added by JS only, so the resting page —
reduced motion, no JS, before the observer fires — has every column at full
strength.

**The five specific notes:**

- **Bubble padding** 14/16 → 11/14. At 15px text the old padding read as a
  speech-bubble sticker rather than a message.
- **The result card** was taking every remaining pixel, which made it the only
  thing in the panel and stopped the two messages above it reading as a
  conversation. Capped at 56% of the panel.
- **The window has an outline.** A shadow alone could not separate a white
  chrome bar from a white section; `0 0 0 1px rgba(12,15,18,.11)` does — the
  product's own window edge, which is why `.tplwin` is exempt from the
  no-rules audit.
- **The scroll hint is dark, frosted and worded** — "Scroll the page" on
  `rgba(12,15,18,.72)` with `backdrop-filter: blur(10px) saturate(1.3)`. A pale
  circle was a shape, not an instruction. **.72, not the .62 it looked best at**:
  over a pale photo .62 leaves white text at ~4.3:1, and axe cannot compute it
  because the backdrop is a scrolling image, so it has to be safe by
  construction. The blur is what makes it read as frosted, not the transparency.
- **`#ochat` carried `aria-label` on a bare `<div>`**, which is prohibited —
  `role="group"` now.

---

## 2026-08-21 · Outputs rebuilt from the Figma: three columns, a conversation, a hint

Figma node `676:2222` ("Outputs"), one to one on **structure**, adapted on size.
The tab strip above it is explicitly not from the reference — that stays ours.

**The row is three columns**, at the reference's own proportions (200 : 437 : 330,
16px gutter, 553px tall) expressed as `fr` so they hold at any width:

| | the reference | here |
|---|---|---|
| left | two 200 × 268 panels, `r16`, `#F6F6F6`, 20px pad, space-between | `.ocard` ×2 |
| middle | 437 × 553, `r16`, a painting behind white bubbles | `.ochat` |
| right | 330 × 553, chrome bar + the page | `.tplwin` |

**Sizes are adapted, not copied.** The reference is Inter 16px throughout; at our
measure that reads small, so the roles map onto this page's scale instead
(`--t-body` for a card title, `--t-sm` for its line and for a bubble,
`--t-meta` for the result caption) — `docs/design-system.md` §2. Radius is
`--r-section`, the same 16 the reference uses and the same every card here uses.

**The section is a card now**, like every other one — `.panel--card`, so the
grey page shows around it and `#outputs` comes off the transparent list.

**The exchange plays.** Four beats over ~3.7s, once, when the panel comes into
view: the ask arrives, Okou's typing dots appear, the dots are replaced by its
reply, then the page it built. One rAF timeline, no timers. Every beat is in the
resting DOM and `.is-live` is added by JS only, so reduced motion and no-JS show
the finished exchange rather than an empty green panel — the typing row is the
one thing that stays hidden, because it is a placeholder, not a message.

**The right column says it scrolls.** A chevron on a 2.2s loop rests at the foot
of the window and steps aside the moment `scrollTop > 12` — once it has been
used it has done its job. `pointer-events:none`, so it never eats a drag.

**New copy, permitted this round** ("你可以看是用现在网站上的还是重新生成"): Okou's
reply, "Something simple, then — one page, publishing as soon as it reads right."
The reference has "something simple" as a second user message; as Okou's answer
it does more work — it acknowledges the brief and says what happens next, which
is what makes the panel read as a conversation rather than two captions.

Below 1080 the three columns would be 63px wide on a phone, so the row unstacks:
the conversation leads, its connectors sit under it two across, the page goes
last. Below 620 the connectors stack too.

---

## 2026-08-20 · the product window is laid out at its real size, then scaled

Feedback, verbatim: "我说你可以把界面整个还原然后按比例缩小。你怎么给我做一个
这么小的窗口？" The window was being laid out at the marketing column's width
(~840px) with the app's real font sizes inside it — which is not a scaled-down
product, it is a cramped little window with desktop-sized text: the sidebar ate
30% of it, the thread had room for nothing, and every trick I had added to cope
(the sections that absorb height, the thread fade, the clipped artifact) was a
symptom of that one wrong decision.

**The window now lays out at its real desktop size and is scaled as ONE object.**

- `.appui` is a fixed **1280px** wide and its natural height (758px). At that
  size everything fits *by construction*: the full sidebar (Manage nav, Pinned,
  Chats with Zero with its thread row, Get Pro, footer pinned to the bottom by
  `margin-top:auto`), the thread title bar, the bubble, the run row, the whole
  artifact card, the full reply paragraph, the jump button, the composer.
- The thread sits in the product's own column: **`max-w-[900px]` centred**, 24px
  side padding, **`gap-6`** between messages — read out of
  `zero-chat-thread-page.tsx` (`mx-auto max-w-[900px]`, the composer in the same
  column), not guessed.
- **Every cope is deleted**: no `overflow:hidden` absorbing sections, no
  bottom-fade mask on the thread, no fixed `--app-h` crushing the window, no
  avatar hanging in a gutter that no longer exists.
- `app.js` scales it into the column by one factor —
  `--app-fit = columnWidth / 1280` — and publishes the rendered height so the
  right-hand column still stands one gap taller. At 1440 that is ×0.685:
  864 × 511 rendered, text at ~9–10px, exactly the miniature the reference was.
- Below 1080 nothing scales: the window lays out at the container's width like
  any block, unclipped, sidebar hidden under 720 as before.

One deliberate deviation, stated: the sidebar section labels are the app's
`sidebar-foreground/50`, which is 3.2:1 — inside the product that is the
product's call, but this page holds itself to axe 0, so the labels step to the
app's own `muted-foreground` (gray-800, 6.2:1). At ×0.685 the two are
indistinguishable.

**The lesson, for §13:** a faithful mock has TWO sizes — the size it is laid out
at, which must be the product's, and the size it is shown at, which is the
page's. Conflating them is how you get a small window instead of a small
product. Same rule as the ladder deck's fit, same mechanism.

---

## 2026-08-20 · two regressions from one margin

Fixing the shutter alignment introduced `margin-bottom` on the title, and that
one property broke two other things I did not re-check:

- **The marker sat below its title.** `.step` was `align-items:center`, so the
  marker was centred in row 1 — and row 1's height is the title's line box *plus
  its margin*. The marker ended up half that margin (14px) low. It is
  `align-items:start` now, and since `--wf-bar-h` is defined as the title's own
  line box, the two are flush by construction with no nudge.
- **The gap between a title and its paragraph was too large.** That gap and the
  air around a rule are the same value by design — the paragraph appears from
  exactly where the closed row's rule sits — so 29px, which was comfortable
  around a rule, opened a hole under a title. `--wf-rule-gap` is
  `clamp(15px, 1.45vw, 21px)` now: 21px at 1440, tighter rows throughout and a
  21px gap under a title.

Measured after: marker top = title top (offset 0), marker height = title line
box (26px), title→paragraph 21px, closed rows' rules 21–22px under their titles,
zero leak, and the mid-transition frame still cuts both texts exactly at their
rules.

**The lesson for the gate:** a margin added to solve a spacing problem changes
every `align-items` decision in the same grid row. QA §4k now measures the
marker against its title rather than trusting that it looks right.

---

## 2026-08-20 · a stated type scale, a progress rule, and the shutter finally lines up

**The scale had sizes but no rule.** Nine values whose ratios ran 1.74, 1.77,
1.5, 1.21, 1.14, 1.12, 1.18 — a list, not a gradient, which is why the reading
end felt cramped. It now has two regions and a stated reason for each:

- **Reading** — 12 · 13.5 · 15 · 17 · 21, ratio ≈ 1.12, **fixed px**. Fine steps
  because a single pixel is visible at reading size. Fixed rather than fluid
  because prose that resizes with the window stops honouring the measure its
  line-length was chosen for.
- **Display** — 23 · 30 · 54 · 66 · 96 · 108, ratio ≈ 1.3, **all fluid**. Coarse
  because at these sizes a small difference reads as a mistake rather than as
  hierarchy, and a headline should track the viewport.
- **The floor** — no page-level prose under 15px, no page-level label under 12px.
  Product mocks are exempt: they draw the app's sizes, which are the app's call.

Body 16.5 → **17**, secondary 14.5 → **15**, labels 11 → **12**, lede 20 → **21**.
Nine strays that belonged to no token were pulled onto it (`--t-tag`, the hero
body, the pull-quote, two footer sizes, the wordmark) and four display roles that
were one-off clamps got names (`--t-d-hero`, `--t-d-section`, and `--t-figure` /
`--t-statement` now point at existing steps). **19 distinct page sizes → 11**,
and the only one that is not a token is an em-relative inline icon.

**The ladder joins the page's scale.** Its sizes came from the Figma's own 16px
and sat outside this page entirely, which is precisely why that column read
small. A list title is a lede (21px), its paragraph is prose (17px at the page's
1.55 leading, not the Figma's 1.21 — that is a title's leading and it crowds four
lines), the closing note is secondary prose (15px).

**The open row's rule is a progress bar.** The pin's travel divides evenly
between the four rows, so how far through *this* row's share you have scrolled is
a real number: `pinProgress()` returns `p × n`, its integer part picks the row and
its fraction fills the bar. The bar filling and the step tipping over are
therefore the same number — the screen beside it can never slide early. Track is
the resting rule's grey, fill is that row's own hue, hoisted to `--marker` so the
marker in front of the title, the bar under it and the ground behind the screen
all read from one source.

**And the shutter finally lines up.** Two rounds of "the text should appear from
the line" and it still cut in mid-air, because two things kept the edge and the
rule apart *during* the motion while leaving them flush at both endpoints — which
is exactly the wrong way round:

1. `.step.is-active{ padding-bottom: 0 }` **animating** from 29px. The rule sits
   on the row's border box; the shutter is the growing box inside it. While that
   padding animated, they were up to 29px apart. The row's bottom padding is now
   **0 at all times**, and a closed row's air is the title's own `margin-bottom`,
   which never animates.
2. The paragraph's own `padding-bottom` animating for the same reason. Padding is
   the wrong tool: a `0fr` track cannot absorb it (hence the animation in the
   first place) and it pushes the text off the edge for the whole transition. The
   settled air above the rule is a **content-flow spacer** (`p::after` with a
   height) — content height a `0fr` track *does* collapse, and it never moves
   relative to the edge.

Measured: a closed row's rule sits 30px under its title; an open row's first line
starts 29px under its title. The text emerges from exactly where the line was.

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
