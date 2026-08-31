#!/usr/bin/env python3
"""
Build options-parallel/ — four directions for the FIRST comparison card's
figure (`.vs__viz--parallel`, "Built for the team, not one terminal.").

    python3 tools/build-parallel-options.py    ->  options-parallel/

Why this round exists, in numbers. The band is **334 × 214**. The lane drawn
into it is **296 × 387**, so the card shows **1.08 agents** and cuts 45% off
the one it does show. The `.lane` rule explains its own width as *"two lanes
and 14 of gap leave a 72px peek of the third"* — arithmetic that needs a
**974px** band. The section went three-up, the band went to 334, and the
object was never re-derived. Principle §13.6: a ground is re-decided when the
thing standing on it changes, and this is the same fault with the two swapped.

So the copy claims several agents working at once and the picture shows one.
Each option below is a different answer to *which part of the claim the
picture should carry* — not four skins on one drawing:

  A  the COUNT      four complete agents, nothing cropped
  B  the SPLIT      one ask, fanning into four lanes
  C  the COMPARISON serial against parallel on one clock
  D  the OVERFLOW   the crop is the message, and it says how many

All four are drawn at the real 334 × 214 under the real copy, because the
question is how they read next to the two cards beside them.
"""
import os
import re
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'options-parallel')
SITE = os.path.join(ROOT, 'site')

BAND_W, BAND_H = 334, 214


def av(n, size=22):
    """A PERSON. `assets/brand/avatar-*.jpg` are photographs, and RULES B4 is
    that an agent is drawn and a person is photographed. Use this only where
    the copy means a person."""
    return ('<img class="oav" src="assets/brand/avatar-%d.jpg" alt="" '
            'width="%d" height="%d">' % (n, size, size))


def agent(size=22):
    """THE RUNNER. B4 again, and B6: a run card's mark names Okou-as-teammate.
    A photograph in the runner seat says a human is doing the task, which is
    the opposite of what this card claims. `#parallel`, the page's other
    four-at-once figure, already puts this file on all four of its run cards.

    One face, four seats: the composer is the rule for any OTHER agent and
    would give genuinely distinct ones, but it needs `tools/avatar-cache/`
    (not committed) and the host is 403 from here."""
    return ('<img class="oav oav--agent" src="assets/avatars/agent-okou.png" '
            'alt="" width="%d" height="%d">' % (size, size))


def pair(n, size=22):
    """THE OWNER, WITH THE RUNNER ON IT. Neither seat alone carries the
    sentence: four photographs read as several and say humans are doing the
    work; four copies of one agent face say the right thing and read as one
    thing repeated. The copy has three nouns — *one person's know-how*,
    *several agents*, *shared capability* — so the seat carries two marks.

    The photograph is the task's owner and gives the row its plurality; the
    agent badge is the runner and is what B4/B6 require in that seat. One
    visual unit, so every option keeps its geometry."""
    return ('<span class="opair" style="--s:%dpx">'
            '<img class="oav" src="assets/brand/avatar-%d.jpg" alt="" '
            'width="%d" height="%d">'
            '<img class="oav oav--badge" src="assets/avatars/agent-okou.png" '
            'alt="" width="%d" height="%d"></span>'
            % (size, n, size, size, round(size * .52), round(size * .52)))


IND = ('<span class="vsui__ind"><span class="vsui__ind-c"></span>'
       '<span class="vsui__ind-r"></span></span>')

TICK = ('<svg class="otick" viewBox="0 0 24 24" fill="none" stroke-width="3.4" '
        'stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 4 4L19 7"/></svg>')

# The eight runs the shipped card already names. Copy is content (§7) — these
# are the strings that are on the page today, reused verbatim.
RUNS = [
    (1, 'Mira',  'Storefront launch',  'Writing the sections'),
    (2, 'Kwame', 'Ad campaign',        'Rebuilding the set'),
    (3, 'Sofia', 'Export spec',        'Linking the issues'),
    (4, 'Dana',  'Board deck',         'Pulling Q3 numbers'),
    (5, 'Ravi',  'Lead scoring',       'Scoring the list'),
    (6, 'Leo',   'Weekly report',      'Reading the channel'),
]


# ══════════════════════════════════════════════════════════════════════
#  A — THE COUNT.  Four complete agents, nothing cropped.
#
#  The unit stops being the product's 296px column and becomes the product's
#  own task ROW, which is what fits four of in 214px of height. Nothing is
#  cut, so "several" is a thing you can count instead of infer.
#  Gesture: the four bars advance on ONE clock, together, once.
# ══════════════════════════════════════════════════════════════════════
def opt_a():
    rows = []
    for i, (n, who, task, step) in enumerate(RUNS[:4]):
        rows.append(
            '<div class="arow" style="--p:%d%%;--d:%dms">'
            '%s<span class="arow__t">%s</span>'
            '<span class="arow__bar"><span class="arow__fill"></span></span>'
            '%s'
            '</div>' % (72 - i * 11, i * 90, pair(n, 22), task, IND))
    return '<div class="oA">%s</div>' % ''.join(rows)


# ══════════════════════════════════════════════════════════════════════
#  B — THE SPLIT.  One ask, fanning into four lanes.
#
#  The sentence is "splits the work between several agents", and a split
#  needs the thing being split to be in the picture. The ask is one row at
#  the top; the four lanes are what it becomes.
#  Gesture: the ask lands, four lanes deal out 80ms apart, then all four run.
# ══════════════════════════════════════════════════════════════════════
def opt_b():
    lanes = []
    for i, (n, who, task, step) in enumerate(RUNS[:4]):
        lanes.append(
            '<div class="blane" style="--p:%d%%;--d:%dms">'
            '%s<span class="blane__t">%s</span>'
            '<span class="blane__bar"><span class="blane__fill"></span></span>'
            '</div>' % (78 - i * 13, 260 + i * 80, pair(n, 20), task))
    return ('<div class="oB">'
            '<div class="bask">%s<span class="bask__l"></span>'
            '<span class="bask__l bask__l--s"></span><i>now</i></div>'
            '<div class="bfan">%s</div>'
            '</div>' % (av(6, 22), ''.join(lanes)))


# ══════════════════════════════════════════════════════════════════════
#  C — THE COMPARISON.  Serial against parallel, on one clock.
#
#  This is the only one of the three cards whose headline is about TIME
#  ("one task at a time"), and the two halves of that sentence have never
#  been in the same picture. Both marks are already in the card's own kicker
#  (P7), so the figure is allowed to name them.
#  Gesture: one sweep crosses once. The serial row is on its second task
#  when the parallel rows are all done.
#
#  NO RUNNER BADGE HERE. The seat is 16px, which puts the badge at 8 — and the
#  avatar round settled 16 as the floor where that face still reads. C is the
#  one option that does not need it: both groups are already named in text.
# ══════════════════════════════════════════════════════════════════════
def opt_c():
    ser = ''.join(
        '<span class="cchip" style="--x:%d%%;--w:%d%%">%s</span>' % (x, w, t)
        for x, w, t in [(0, 26, 'Storefront'), (27, 25, 'Ad set'),
                        (53, 27, 'Spec'), (81, 30, 'Deck')])
    par = ''.join(
        '<div class="crow" style="--d:%dms">%s'
        '<span class="cchip cchip--us" style="--x:0%%;--w:%d%%">%s</span></div>'
        % (i * 70, av(n, 16), w, task)
        for i, ((n, who, task, step), w) in
        enumerate(zip(RUNS[:4], [38, 31, 44, 35])))
    return ('<div class="oC">'
            '<p class="chead">Claude Code · Codex</p>'
            '<div class="cser"><div class="crow crow--ser">%s</div></div>'
            '<p class="chead chead--us">Okou</p>'
            '<div class="cpar">%s</div>'
            '<span class="csweep"></span>'
            '</div>' % (ser, par))


# ══════════════════════════════════════════════════════════════════════
#  D — THE OVERFLOW.  The crop is the message, and it says how many.
#
#  The conservative one: keep the endless track this card was already built
#  on, but re-derive the unit for a 334 band (152, so 2.1 fit and the cut
#  lands on a card's body rather than through its title), and put the number
#  on the band so the crop reads as "there are more" instead of as clipping.
#  Gesture: the focus moves from member to member and DWELLS. The centred
#  card is at full strength; the two beside it are dimmed and stepped down a
#  little, so the eye is told where to read without a line being drawn.
# ══════════════════════════════════════════════════════════════════════
def opt_d():
    # PADDED AT BOTH ENDS. The focus sits on a card and the two beside it are
    # what say "there are more", so the first and last real member need a
    # neighbour too — otherwise the rotation opens and closes on a strip of
    # bare ground, which reads as a bug rather than as an edge. Six members,
    # eight cards, and the focus cycles 1..6.
    cards = []
    for n, who, task, step in [RUNS[-1]] + RUNS + [RUNS[0]]:
        cards.append(
            '<div class="dlane">'
            '<p class="dlane__h">%s<b>%s</b></p>'
            '<p class="dlane__t">%s</p>'
            '<p class="dlane__s dlane__s--now">%s<em>%s</em></p>'
            '<p class="dlane__s">%s<em>Read the brief</em><i>14s</i></p>'
            '<p class="dlane__s">%s<em>Picked the template</em><i>9s</i></p>'
            '<p class="dlane__s">%s<em>Opened the folder</em><i>6s</i></p>'
            '<p class="dlane__s">%s<em>Checked the kit</em><i>11s</i></p>'
            '<p class="dlane__s">%s<em>Wrote the outline</em><i>21s</i></p>'
            '</div>' % (pair(n, 18), who, task, IND, step,
                        TICK, TICK, TICK, TICK, TICK))
    return ('<div class="oD" data-i="1">'
            '<div class="dtrack">%s</div>'
            '<span class="dcount"><b>6</b> agents <b>11</b> tasks</span>'
            '</div>' % ''.join(cards))


OPTIONS = [
    ('A', 'the count',
     'Four complete agents, nothing cropped. The unit stops being the '
     'product’s 296px column and becomes its task row — the thing four of '
     'fit in 214px. “Several” becomes a number you can count.',
     'Four bars advance on one clock, together, once.', opt_a),
    ('B', 'the split',
     'One ask at the top, four lanes under it. The sentence says Okou '
     '<i>splits</i> the work, and a split needs the thing being split to be '
     'in the picture.',
     'The ask lands, four lanes deal out 80ms apart, then all four run.', opt_b),
    ('C', 'the comparison',
     'Serial against parallel on one clock. This is the only card of the '
     'three whose headline is about time — “one task at a time” — and the '
     'two halves of that sentence have never been in the same picture.',
     'One sweep crosses once. The serial row is on task 2 when the four '
     'are done.', opt_c),
    ('D', 'the overflow',
     'Six team members on one track, re-derived for a 334 band, with the '
     'count on it. The crop stops reading as a clipping bug and starts '
     'reading as “there are more”.',
     'The focus steps from member to member and dwells — 2.2s on each, 560ms '
     'to move. The centred card is at full strength; the two beside it are '
     'dimmed and stepped down 6%.', opt_d),
]


def build():
    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    os.makedirs(OUT)

    # the real stylesheet, so every option is drawn in the page's own tokens
    shutil.copy(os.path.join(SITE, 'styles.css'), os.path.join(OUT, 'styles.css'))
    os.makedirs(os.path.join(OUT, 'assets', 'brand'))
    for n in range(1, 7):
        shutil.copy(os.path.join(SITE, 'assets', 'brand', 'avatar-%d.jpg' % n),
                    os.path.join(OUT, 'assets', 'brand', 'avatar-%d.jpg' % n))
    for f in ('okou-icon.svg',):
        shutil.copy(os.path.join(SITE, 'assets', f), os.path.join(OUT, 'assets', f))
    os.makedirs(os.path.join(OUT, 'assets', 'avatars'))
    shutil.copy(os.path.join(SITE, 'assets', 'avatars', 'agent-okou.png'),
                os.path.join(OUT, 'assets', 'avatars', 'agent-okou.png'))
    os.makedirs(os.path.join(OUT, 'assets', 'fonts'))
    shutil.copy(os.path.join(SITE, 'assets', 'fonts', 'roobert-var.woff2'),
                os.path.join(OUT, 'assets', 'fonts', 'roobert-var.woff2'))
    with open(os.path.join(OUT, 'robots.txt'), 'w') as f:
        f.write('User-agent: *\nDisallow: /\n')

    cards = []
    for key, name, why, gesture, fn in OPTIONS:
        cards.append(
            '<article class="ocard2">'
            '<p class="okey"><b>%s</b><span>%s</span></p>'
            '<article class="vs">'
            '<div class="vs__viz vs__viz--parallel" aria-hidden="true">%s</div>'
            '<div class="vs__txt">'
            '<p class="vs__pair"><span class="vs__side">Claude Code · Codex</span>'
            '<span class="vs__vs">vs</span>'
            '<span class="vs__side vs__side--us">Okou</span></p>'
            '<h3>Built for the team, not one terminal.</h3>'
            '<p>Claude Code and Codex live on one person’s machine, one task at '
            'a time. Okou runs in the cloud, splits the work between several '
            'agents, and turns one person’s know-how into shared capability.</p>'
            '</div></article>'
            '<p class="owhy">%s</p>'
            '<p class="oges"><b>Motion</b> %s</p>'
            '</article>' % (key, name, fn(), why, gesture))

    html = HTML % {'cards': '\n'.join(cards), 'w': BAND_W, 'h': BAND_H}
    with open(os.path.join(OUT, 'index.html'), 'w') as f:
        f.write(html)
    with open(os.path.join(OUT, 'options.css'), 'w') as f:
        f.write(CSS)
    with open(os.path.join(OUT, 'options.js'), 'w') as f:
        f.write(JS)
    print('options-parallel/  4 options at %d x %d' % (BAND_W, BAND_H))


HTML = """<!doctype html>
<html lang="en" data-theme="light"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Parallel card — four directions</title>
<link rel="stylesheet" href="styles.css">
<link rel="stylesheet" href="options.css">
</head>
<body class="obody">
<header class="ohead">
  <h1>“Built for the team, not one terminal.”</h1>
  <p>The band is <b>%(w)d&thinsp;&times;&thinsp;%(h)d</b>. The lane drawn into it
  is <b>296&thinsp;&times;&thinsp;387</b>, so the shipped card shows
  <b>1.08 agents</b> and cuts 45%% off the one it shows. The rule explains its
  width as “two lanes and 14 of gap leave a 72px peek of the third” — which
  needs a <b>974px</b> band. Four answers, all at the real size, all under the
  real copy.</p>
  <p class="ohead__c"><button id="replay" type="button">Replay the motion</button>
  <button id="theme" type="button" class="ghost">Light / dark</button></p>
</header>
<div class="ogrid">
%(cards)s
</div>
<script src="options.js"></script>
</body></html>
"""


CSS = """/* options-parallel — the comparison surface only. Not shipped.
   Every band below is 334 x 214, the real one. The heights are stated, not
   guessed: whatever does not fit in 214 is the thing being judged. */
.obody{ margin:0; padding:40px clamp(16px,4vw,56px) 96px; background:var(--wash);
  font-family:var(--fb); color:var(--ink); }
.ohead{ max-width:70ch; margin:0 auto 40px; }
.ohead h1{ font-family:var(--fd); font-size:30px; font-weight:500; margin:0 0 12px; }
.ohead p{ font-size:15px; line-height:1.6; color:var(--ink-mute); margin:0 0 12px; }
.ohead b{ color:var(--ink); font-weight:500; }
.ohead__c{ display:flex; gap:10px; }
.ohead__c button{ font-family:var(--fm); font-size:12px; letter-spacing:.06em;
  text-transform:uppercase; padding:9px 14px; border:0; border-radius:10px;
  background:var(--accent-solid); color:#fff; cursor:pointer; }
.ohead__c .ghost{ background:var(--wash-2); color:var(--ink); }

/* 334 EXACTLY, NOT `minmax(334px,1fr)`. The 1fr stretched every column to the
   viewport — the bands were coming out 634 wide in a one-column pane, so the
   whole premise of this page ("drawn at the real size") was false and D's pan
   arithmetic, which is stated against a 334 band, centred on nothing. */
.ogrid{ display:grid; gap:32px; grid-template-columns:repeat(auto-fit,334px);
  justify-content:center; max-width:1320px; margin:0 auto; align-items:start; }
.ocard2{ width:334px; }
.okey{ display:flex; align-items:baseline; gap:10px; margin:0 0 10px;
  font-family:var(--fm); font-size:12px; letter-spacing:.06em; text-transform:uppercase; }
.okey b{ font-size:15px; color:var(--accent-solid); }
.okey span{ color:var(--ink-mute); }
.owhy{ font-size:14px; line-height:1.6; color:var(--ink-mute); margin:14px 2px 8px; }
.oges{ font-size:13px; line-height:1.6; color:var(--ink-mute); margin:0 2px; }
.oges b{ font-family:var(--fm); font-size:11px; letter-spacing:.06em;
  text-transform:uppercase; color:var(--ink); margin-right:8px; }

.ogrid .vs__viz{ width:100%; height:214px; overflow:hidden; position:relative; }
/* FILL THE BAND, DO NOT ASK IT. `height:100%` on the option root came back as
   194 in a 214 band, so B's fourth lane cleared the bottom edge by 2px — which
   is not clipped and still reads as clipped. `inset:0` is the band, exactly,
   and every height below is then stated against a number that is true. */
.oA,.oB,.oC,.oD{ position:absolute; inset:0; }
.oav{ border-radius:9999px; flex:none; object-fit:cover; }
/* B5. The supplied avatar is a square tile with its own ground; rounding it
   crops the ground the branding file draws. The people stay circles. */
.oav--agent{ border-radius:6px; }
/* the owner, with the runner badged on it. `--s` is the photograph's size, so
   the badge and the box follow it and one rule serves 16 / 18 / 20 / 22. */
.opair{ position:relative; display:inline-flex; flex:none;
  width:var(--s); height:var(--s); }
.oav--badge{ position:absolute; right:-3px; bottom:-3px; border-radius:5px;
  box-shadow:0 0 0 1.5px var(--p-card); }

/* ── A · the count ──────────────────────────────────────────────────
   12 padding both sides leaves 190. Four 38px rows and three 8px gaps
   is 176, so the stack is centred in 190 with 7 either side and NOTHING
   is cut — which is the entire claim of this option. */
.oA{ padding:12px; display:flex; flex-direction:column;
  justify-content:center; gap:8px; box-sizing:border-box; }
.arow{ height:38px; box-sizing:border-box; flex:none;
  display:flex; align-items:center; gap:9px; padding:0 10px;
  border-radius:10px; background:var(--p-card); border:1px solid var(--p-border); }
.arow__t{ flex:1; min-width:0; font-size:12.5px; font-weight:500; color:var(--p-fg);
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.arow__bar{ flex:0 0 52px; height:4px; border-radius:9999px;
  background:var(--p-tint); overflow:hidden; }
.arow__fill{ display:block; height:100%; width:0; border-radius:inherit;
  background:var(--p-run); }
.is-play .arow__fill{ width:var(--p); transition:width 1500ms var(--e-out);
  transition-delay:var(--d); }

/* ── B · the split ──────────────────────────────────────────────────
   190 usable: a 30px ask, an 8px gap, then four 33px lanes on 6px gaps
   = 150. The fan is what is left, and it is the whole point, so it gets
   the slack rather than the ask. */
.oB{ padding:12px; display:flex; flex-direction:column; gap:8px;
  box-sizing:border-box; }
.bask{ height:30px; box-sizing:border-box; flex:none;
  display:flex; align-items:center; gap:8px; padding:0 10px;
  border-radius:9px; background:var(--p-tint);
  opacity:0; transform:translateY(-6px); }
.is-play .bask{ opacity:1; transform:none;
  transition:opacity 300ms var(--e-out),transform 300ms var(--e-out); }
.bask__l{ height:6px; border-radius:9999px; background:var(--p-border); flex:1; }
.bask__l--s{ flex:0 0 38px; }
.bask i{ font-style:normal; font-size:10px; color:var(--p-mute); }
.bfan{ display:flex; flex-direction:column; gap:6px; flex:1;
  justify-content:center; }
.blane{ height:32px; box-sizing:border-box; flex:none;
  display:flex; align-items:center; gap:8px; padding:0 9px;
  border-radius:9px; background:var(--p-card); border:1px solid var(--p-border);
  opacity:0; transform:translateY(-8px) scale(.98); }
.is-play .blane{ opacity:1; transform:none;
  transition:opacity 320ms var(--e-out),transform 420ms var(--e-spring);
  transition-delay:var(--d); }
.blane__t{ flex:1; min-width:0; font-size:12px; color:var(--p-fg);
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.blane__bar{ flex:0 0 44px; height:4px; border-radius:9999px;
  background:var(--p-tint); overflow:hidden; }
.blane__fill{ display:block; height:100%; width:0; border-radius:inherit;
  background:var(--p-run); }
.is-play .blane__fill{ width:var(--p); transition:width 1400ms var(--e-out);
  transition-delay:620ms; }

/* ── C · the comparison ─────────────────────────────────────────────
   One x axis for both halves. The serial chips are laid out to total
   111%, so the last one is cut by the band — that IS the reading: it has
   not finished. Every parallel chip ends under 50%. */
.oC{ padding:12px 12px 10px; display:flex; flex-direction:column;
  box-sizing:border-box; }
.chead{ margin:0 0 5px; font-family:var(--fm); font-size:10px; letter-spacing:.07em;
  text-transform:uppercase; color:var(--p-mute); }
.chead--us{ color:var(--accent-solid); margin-top:14px; }
.crow{ position:relative; height:22px; }
.cpar .crow{ height:19px; margin-bottom:5px; }
.cpar .crow:last-child{ margin-bottom:0; }
.cchip{ position:absolute; top:50%; translate:0 -50%; left:var(--x); width:var(--w);
  height:16px; border-radius:5px; background:var(--p-border); color:var(--p-mute);
  font-size:9.5px; line-height:16px; padding-left:6px; overflow:hidden;
  white-space:nowrap; box-sizing:border-box; }
.cpar{ position:relative; }
.cpar .oav{ position:absolute; left:0; top:50%; translate:0 -50%; }
.cchip--us{ left:22px; width:calc(var(--w) - 6px);
  background:color-mix(in srgb,var(--p-run) 32%,var(--p-card));
  color:var(--p-fg); opacity:0; transform:scaleX(.15); transform-origin:left center; }
.is-play .cchip--us{ opacity:1; transform:none;
  transition:opacity 240ms var(--e-out),transform 700ms var(--e-out);
  transition-delay:var(--d); }
.csweep{ position:absolute; top:28px; bottom:10px; left:12px; width:1px;
  background:var(--accent-solid); opacity:0; }
.is-play .csweep{ animation:cSweep 2600ms var(--e-out) forwards; }
@keyframes cSweep{ 0%{opacity:.85;transform:translateX(0)}
  92%{opacity:.85} 100%{opacity:0;transform:translateX(300px)} }

/* ── D · the overflow ───────────────────────────────────────────────
   200 + 10 of gap in a 334 band centres one card and leaves a 57px peek
   either side, so the focused member is flanked rather than sitting on a
   strip of bare ground. The pan is stated once:

       centre of card i = i*210 + 100          (track coords)
       we want it at    = 334/2 = 167
       so translateX    = 67 - i*210

   NOT AN ANIMATION ON THE TRACK. The focus is a state (`--i` plus
   `.is-focus`), and the transition carries it — so reduced motion lands on
   a finished, readable frame instead of a paused one. */
.oD{ overflow:hidden; }
.dtrack{ display:flex; gap:10px; padding:12px 0 0; width:max-content;
  align-items:flex-start;
  transform:translate3d(calc(67px - var(--i,1) * 210px),0,0);
  transition:transform 560ms var(--e-spring); }

/* TALLER THAN THE BAND, AND TALL ENOUGH TO SURVIVE THE SCALE. At content
   height the cards stopped 135px into a 214 band and the count floated in
   60px of empty ground. 240 also means a card stepped down to .94 about its
   own centre still runs past the crop (12 + 240*.94 ≈ 237 > 214) — otherwise
   the two side cards would show a bottom edge the centre one does not have,
   and the crop would read as belonging to the focus rather than to the band. */
.dlane{ flex:0 0 200px; height:240px; overflow:hidden;
  padding:12px 13px; border-radius:12px 12px 0 0;
  border:1px solid var(--p-border); border-bottom:0; background:var(--p-card);
  opacity:.42; transform:scale(.94);
  transition:opacity 560ms var(--e-out), transform 560ms var(--e-spring); }
.dlane.is-focus{ opacity:1; transform:none; }
.dlane__h{ display:flex; align-items:center; gap:8px; margin:0 0 7px; }
.dlane__h b{ font-size:12.5px; font-weight:500; color:var(--p-fg); }
.dlane__t{ margin:0 0 9px; font-size:13.5px; font-weight:500; color:var(--p-fg);
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.dlane__s{ display:flex; align-items:center; gap:7px; margin:0 0 6px;
  font-size:11.5px; color:var(--p-mute); }
.dlane__s em{ font-style:normal; flex:1; min-width:0; white-space:nowrap;
  overflow:hidden; text-overflow:ellipsis; }
.dlane__s i{ font-style:normal; font-size:10.5px; }
.dlane__s--now{ color:var(--p-fg); background:var(--p-tint);
  margin-inline:-7px; padding:4px 7px; border-radius:6px; }
.otick{ width:12px; height:12px; stroke:var(--p-mute); flex:none; }

/* THE COUNT IS NOT PART OF THE CARDS. It was white-on-blur over white
   surfaces — the same material as the thing behind it, so it read as a
   label printed on a card rather than as the band's own. Ink fill, light
   type, and the lift shadow: a different material, which is what separates
   it. Fill and shadow, never an outline.

   IN THE CORNER, NOT FLOATING NEAR IT. At `right:12 bottom:12` the chip is
   130 wide in a 334 band, so it cannot clear the 200px centred card — it
   landed across the focused card's fourth step row and cut it mid-height,
   and the focused card is the one thing here that is meant to be read.
   Anchored into the band's own corner it belongs to the band, and what it
   covers is the strip the crop was already taking. */
.dcount{ position:absolute; right:0; bottom:0; z-index:2;
  font-family:var(--fm); font-size:10px; letter-spacing:.05em;
  text-transform:uppercase; color:rgb(255 255 255 / .72);
  background:var(--p-fg); box-shadow:var(--e-lift);
  padding:7px 12px 8px; border-radius:10px 0 0 0; }
.dcount b{ color:#fff; font-weight:500; }

@media (prefers-reduced-motion:reduce){
  .dtrack,.dlane{ transition:none; }
  .is-play .csweep{ animation:none; opacity:0; }
  .arow__fill,.blane__fill{ width:var(--p) !important; transition:none !important; }
  .bask,.blane,.cchip--us{ opacity:1 !important; transform:none !important; }
}
"""


JS = """/* one shared clock, so the four options play together and can be compared
   on the same beat rather than on whenever each happened to scroll in. */
(function () {
  var grid = document.querySelector('.ogrid');

  /* D · the focus rotation. The two padded end cards exist so the first and
     last real member are flanked, and they are never focused themselves.

     PING-PONG, NOT WRAP. Going 6 -> 1 rewinds the whole strip in one 560ms
     sweep, which is the longest and fastest movement on the page and lands
     on the seam every cycle. Reversing at the ends means the largest step is
     always one card, and nothing in the figure ever moves faster than the
     thing it is asking you to read. */
  var d = document.querySelector('.oD');
  if (d) {
    var lanes = [].slice.call(d.querySelectorAll('.dlane'));
    var FIRST = 1, LAST = lanes.length - 2, at = FIRST, dir = 1;
    var focus = function (n) {
      at = n;
      d.style.setProperty('--i', n);
      lanes.forEach(function (l, k) { l.classList.toggle('is-focus', k === n); });
    };
    focus(FIRST);
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      /* 2200 dwell + 560 move. The dwell is what makes it readable: the eye
         needs to finish one card before the next is offered. */
      setInterval(function () {
        if (at + dir > LAST || at + dir < FIRST) dir = -dir;
        focus(at + dir);
      }, 2760);
    }
  }

  function play() {
    grid.classList.remove('is-play');
    void grid.offsetWidth;          // reflow, or the class swap is coalesced
    grid.classList.add('is-play');
  }
  document.getElementById('replay').addEventListener('click', play);
  document.getElementById('theme').addEventListener('click', function () {
    var h = document.documentElement;
    h.setAttribute('data-theme', h.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });
  setTimeout(play, 260);
})();
"""


if __name__ == '__main__':
    build()
