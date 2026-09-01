#!/usr/bin/env python3
"""
Build options-versus/ — four figures for the THIRD comparison card
(`Zapier · n8n vs Okou`), each one rendered at real size inside the real
three-card row, on the real stylesheet.

    python3 tools/build-versus-options.py
    okou host ./options-versus --site okou-versus-options

WHY THE FIGURE IS BEING REDRAWN

Tong, on the shipped card: *"这个卡片你可以想下怎么表达，一个是传统工具调用
方式，一个是自然语言调用方式"* — and on the screenshot itself: *"zapier /n8n
通过传统的工具方式调用，我们是自然语言，门槛低"*.

The card's own sentence has said that all along: *"Zapier and n8n run the rule
you wired. Okou reads the goal in plain language, picks the tools, and handles
the multi-step work in between."* The picture above it is a wall of connector
logos with our cube lit in the middle, which argues a different claim —
*"we have integrations"* — and every alternative on this page has those too.
So the figure is not wrong, it is answering a question nobody asked.

WHAT EVERY OPTION HAS TO DO

  · Show BOTH invocations. A card that only shows ours is not a comparison —
    the same rule that put both marks in the pair row.
  · Draw the alternative in its own neutral, never in our chrome. Card 1
    already set that convention with a terminal.
  · Fit 422×276 at 1440 and stay legible at 214px tall on a laptop.
  · Not be a fourth vertical list: the three cards in this row are a lane
    stack, a browser artifact and this one, and each has to be a different
    KIND of picture.

COPY IS UNTOUCHED. The heading and the paragraph are the shipped ones. The
strings inside the figures are figure content, like "Storefront launch" in
card 1 — but if a direction wins, the heading is worth one more look: *"A doer
with context, not a trigger"* argues context, and these four argue the ask.
"""
import hashlib
import os
import re
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, 'site')
OUT = os.path.join(ROOT, 'options-versus')

# the one sentence, used by three of the four. It is a job, not a prompt —
# a trigger, a condition and a destination in one line of English, which is
# exactly the wiring the panel beside it is spelling out in five fields.
SAY = 'When a lead fills the form, qualify it and tell the owner in Slack.'

MIC = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" '
       'stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>'
       '<path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/></svg>')
CLIP = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" '
        'stroke-linecap="round" stroke-linejoin="round">'
        '<path d="M21 12.5 12.9 20.6a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.3-2.3l7.8-7.8"/></svg>')
ARROW = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" '
         'stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>')

# the three the sentence actually names: the form, the CRM, the channel
CONNECTORS = ['google-sheet.svg', 'hubspot.svg', 'slack.svg']


def say_box(cls='say'):
    """ours: the composer, with the sentence already in it"""
    return (
        '<div class="%s">'
        '<p class="say__t">%s<span class="say__caret"></span></p>'
        '<p class="say__r"><span class="say__ic">%s%s</span>'
        '<span class="say__go">%s</span></p>'
        '</div>' % (cls, SAY, CLIP, MIC, ARROW))


# ══════════════════════════════════════════════════════════════════════
#  A · two surfaces
# ══════════════════════════════════════════════════════════════════════
def fig_a():
    nodes = ''.join('<span class="ask__node ask__node--%d"><i></i><i></i></span>' % n
                    for n in (1, 2, 3))
    # the noodle, node to node. Drawn as two absolute bars rather than an SVG:
    # the canvas is a flexible box, so `preserveAspectRatio="none"` stretched
    # the path off the node's midline at every width.
    wire = ('<span class="ask__j ask__j--1"></span>'
            '<span class="ask__j ask__j--2"></span>')
    rows = ''.join(
        '<span class="ask__row"><b>%s</b><span>%s</span></span>' % (label, value)
        for label, value in (
            ('Trigger', 'New form response'),
            ('Account', 'Choose an account'),
            ('Field map', 'email → Contact.email'),
            ('Filter', 'Only continue if…'),
        ))
    return ('<div class="ask">'
            '<div class="ask__canvas">%s%s<div class="ask__panel">%s</div></div>'
            '%s</div>' % (wire, nodes, rows, say_box()))


# ══════════════════════════════════════════════════════════════════════
#  B · five steps, or one sentence
# ══════════════════════════════════════════════════════════════════════
def fig_b():
    # six, so the chain runs off the band's right edge — there is always one
    # more field, and a chain that ends flush inside the frame says the opposite
    steps = ['Trigger', 'Filter', 'Format', 'Lookup', 'Action', 'Path']
    chain = '<span class="chain__j"></span>'.join(
        '<span class="chain__chip">%s</span>' % s for s in steps)
    marks = ''.join('<img src="assets/connectors/%s" alt="" width="17" height="17">' % c
                    for c in CONNECTORS)
    return ('<div class="chain">'
            '<div class="chain__wire">%s</div>'
            '<p class="chain__and">…and the fields inside each one</p>'
            '<div class="chain__say"><p>%s</p></div>'
            '<p class="chain__picked">%s<em>Okou picked these</em></p>'
            '</div>' % (chain, SAY, marks))


# ══════════════════════════════════════════════════════════════════════
#  C · the drawing
# ══════════════════════════════════════════════════════════════════════
def fig_c():
    return ('<div class="drawn">'
            '<img src="assets/brand/spot-wired-vs-spoken.webp" alt="" '
            'width="1180" height="738" loading="lazy"></div>')


# ══════════════════════════════════════════════════════════════════════
#  D · the setup empties
# ══════════════════════════════════════════════════════════════════════
def fig_d():
    rows = ''.join(
        '<span class="setup__row" style="--i:%d"><b>%s</b><span>%s</span></span>'
        % (i, label, value)
        for i, (label, value) in enumerate((
            ('Trigger', 'New form response'),
            ('Account', 'Choose an account'),
            ('Filter', 'Only continue if…'),
            ('Field map', 'email → Contact.email'),
            ('Lookup', 'Find owner by region'),
            ('Action', 'Send channel message'),
        )))
    # the header and the rows are ONE object so they can leave together —
    # generic wording on purpose, because the card compares Zapier *and* n8n
    return ('<div class="setup">'
            '<div class="setup__sheet">'
            '<p class="setup__hd"><i></i>New workflow <b>6 steps</b></p>'
            '<div class="setup__rows">%s</div>'
            '</div>'
            '<div class="setup__said"><p>%s</p><em>Okou picked the tools</em></div>'
            '</div>' % (rows, SAY))



# ══════════════════════════════════════════════════════════════════════
#  ROUND 2 — B, three ways
#
#  Tong: *"B的方向可以，但是和其他两个cards比，这个第三张card不够饱满，而且动画
#  有点看不出来，根据B你可以在修改3个方案么"*.
#
#  Both faults have one cause. B was three small objects centred in a
#  405×302 band with tint showing on all four sides, while the two cards
#  beside it are oversized product surfaces CROPPED by their bands. A figure
#  that fits politely inside its frame reads as emptier than its neighbours
#  whatever is in it. And in a row of three where the other two animate, the
#  one that does not reads as the one that is broken.
#
#  So in all three: the figure is bigger than the band and cropped by it, and
#  the sentence writes itself on a 9s loop. What differs is the ground it is
#  written over — their language as wallpaper, as a column that never ends,
#  or as a chain that folds away under it.
# ══════════════════════════════════════════════════════════════════════

# the sentence, broken where it breaks, because each line carries its own
# wipe (RULES N3: looping text is painted or not painted, never faded)
SAY_L1 = 'When a lead fills the form,'
SAY_L2 = 'qualify it and tell the owner in Slack.'

STEPS = ['Trigger', 'Filter', 'Format', 'Lookup', 'Action', 'Path',
         'Delay', 'Webhook', 'Parse', 'Branch']

FIELDS = [
    ('Trigger', 'New form response'),
    ('Account', 'Choose an account'),
    ('Filter', 'Only continue if…'),
    ('Field map', 'email → Contact.email'),
    ('Lookup', 'Find owner by region'),
    ('Format', 'Title case the name'),
    ('Action', 'Send channel message'),
    ('Fallback', 'Choose an account'),
]


def sayc():
    """the sentence card — one component, all three variants"""
    marks = ''.join('<img src="assets/connectors/%s" alt="" width="19" height="19">' % c
                    for c in CONNECTORS)
    return ('<div class="sayc">'
            '<p class="sayc__p">'
            '<span class="sayc__l">%s</span>'
            '<span class="sayc__l">%s<i class="sayc__c"></i></span>'
            '</p>'
            '<p class="sayc__f">%s<em>Okou picked these</em></p>'
            '</div>' % (SAY_L1, SAY_L2, marks))


def chips(names, join=False):
    sep = '<span class="wjoin"></span>' if join else ''
    return sep.join('<span class="wchip">%s</span>' % n for n in names)


def fig_wall():
    """B1 — their language as the ground, drifting behind ours"""
    rows = []
    # each row is DOUBLED and travels exactly one copy (N14): a track that
    # starts at 0 leaves its own first item's worth of space empty at the reset
    for i, dur in enumerate(('44s', '52s', '38s', '58s', '48s')):
        order = STEPS[i * 2:] + STEPS[:i * 2]
        rows.append('<div class="wall__row" style="--dur:%s">%s%s</div>'
                    % (dur, chips(order), chips(order)))
    return '<div class="wall">%s</div>%s' % (''.join(rows), sayc())


def fig_split():
    """B2 — a column of fields that never ends, beside one sentence"""
    rows = ''.join('<span class="split__row"><b>%s</b><span>%s</span></span>' % f
                   for f in FIELDS)
    return ('<div class="split">'
            '<div class="split__col">'
            '<p class="split__hd">Set up · <b>6 steps, 24 fields</b></p>'
            '<div class="split__win"><div class="split__track">%s%s</div></div>'
            '</div>%s</div>' % (rows, rows, sayc()))


def fig_fold():
    """B3 — the chain folds away as the sentence writes itself over it"""
    return ('<div class="fold">'
            '<div class="fold__rows">'
            '<div class="fold__row">%s</div>'
            '<div class="fold__row fold__row--2">%s</div>'
            '<div class="fold__row fold__row--3">%s</div>'
            '</div>%s</div>'
            % (chips(STEPS[:5], join=True), chips(STEPS[5:9], join=True),
               chips(STEPS[2:7], join=True), sayc()))

OPTIONS = [
    ('B', 'Where it started — what you approved',
     'for reference · unchanged · static',
     'The direction, as it was: five chips of jargon wired in a row against '
     'one line of prose. This is the one to compare the three below with — and '
     'the two faults are visible from here. It sits in the middle of its band '
     'with tint on all four sides while the cards beside it are cropped by '
     'theirs, and nothing on it moves.',
     'chain', fig_b),
    ('B1', 'The wall',
     'their language as the ground · marquee + typing',
     'Their steps become <b>wallpaper</b> — five rows running off all four '
     'edges, drifting in alternate directions, dense enough that you stop '
     'reading them. Our sentence is the one object on the card that is not '
     'part of it, on a real surface cropped by the band like its neighbours. '
     'The fullest of the three, and the one where the alternative is scenery '
     'rather than an opponent.',
     'wall', fig_wall),
    ('B2', 'The split',
     'a column that never ends · scroll + typing',
     'Side by side, and <b>theirs never finishes</b>: a sheet of fields scrolls '
     'past forever under the header “6 steps, 24 fields”, while ours writes one '
     'sentence and stops. The count is the argument in two numbers, and the '
     'scrolling column is the most literal picture of 门槛 in the set. Closest '
     'to a product surface, so it sits most naturally with the other two cards.',
     'split', fig_split),
    ('B3', 'The fold',
     'the wiring is replaced · one 9s beat',
     'One object and one beat: three rows of chain run the full width, then '
     'close up and dim as the sentence writes itself over the space they were '
     'taking. It does not delete them — the claim is that the wiring is '
     '<b>replaced</b>, not that it never existed. The clearest motion of the '
     'three; also the only one whose card looks different at second 1 and '
     'second 6.',
     'fold', fig_fold),
]


def row_html(subject_viz, viz_class):
    """the real three-card row, with the third card's figure swapped out"""
    src = open(os.path.join(SITE, 'index.html'), encoding='utf-8').read()
    i = src.index('<div class="versus versus--three"')
    row = src[i:src.index('</section>', i)]

    arts = [m.start() for m in re.finditer(r'<article class="vs reveal">', row)]
    third = row[arts[2]:]
    head, tail = third.split('<div class="vs__txt">', 1)
    new_third = (
        '<article class="vs reveal is-in vs--subject">\n'
        '      <div class="vs__viz vs__viz--%s" aria-hidden="true">%s</div>\n'
        '      <div class="vs__txt">%s' % (viz_class, subject_viz, tail))

    out = row[:arts[2]] + new_third
    # the page's reveal observer is not on this build, so the resting state has
    # to be the arrived one — otherwise every card renders at opacity 0 (N2)
    out = out.replace('<article class="vs reveal">', '<article class="vs reveal is-in">')
    out = out.replace('<div class="versus versus--three" data-reveal="stagger">',
                      '<div class="versus versus--three is-in">')
    return out


def build():
    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    os.makedirs(OUT)
    shutil.copy(os.path.join(SITE, 'styles.css'), OUT)
    shutil.copy(os.path.join(ROOT, 'tools', 'versus-options.css'),
                os.path.join(OUT, 'variants.css'))

    css = open(os.path.join(OUT, 'styles.css'), encoding='utf-8').read()
    html_src = open(os.path.join(SITE, 'index.html'), encoding='utf-8').read()
    i = html_src.index('<div class="versus versus--three"')
    row_src = html_src[i:html_src.index('</section>', i)]

    wanted = {'brand/spot-wired-vs-spoken.webp', 'fonts/roobert-var.woff2'}
    wanted |= {'connectors/' + c for c in CONNECTORS}
    # everything the two untouched cards reference, and everything the
    # stylesheet itself points at — `okou host` refuses a build with holes
    wanted |= {m.split('?')[0] for m in
               re.findall(r'(?:src|href)="assets/([^"]+)"', row_src)}
    wanted |= {m.split('?')[0] for m in
               re.findall(r'url\(\s*assets/([^)\'"\s]+)', css)}
    for rel in sorted(wanted):
        src = os.path.join(SITE, 'assets', rel)
        if not os.path.isfile(src):
            print('  missing asset:', rel)
            continue
        dst = os.path.join(OUT, 'assets', rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy(src, dst)

    with open(os.path.join(OUT, 'robots.txt'), 'w') as f:
        f.write('User-agent: *\nDisallow: /\n')

    blocks = []
    for key, title, bet, blurb, viz_class, fn in OPTIONS:
        blocks.append(
            '<section class="opt" id="opt-%s" aria-labelledby="h-%s">'
            '<div class="opt__head">'
            '<p class="opt__k">Option %s</p>'
            '<h2 class="opt__t" id="h-%s">%s</h2>'
            '<p class="opt__bet">%s</p>'
            '<p class="opt__blurb">%s</p>'
            '</div>'
            '<div class="opt__frame"><section class="panel panel--card">%s</section></div>'
            '</section>' % (key.lower(), key.lower(), key, key.lower(),
                            title, bet, blurb, row_html(fn(), viz_class)))

    html = '''<!doctype html>
<!-- PINNED LIGHT. This build is a review surface, not the page: it borrows
     site/styles.css, and that stylesheet honours `prefers-color-scheme`, so on
     a machine set to dark the whole comparison arrived in dark and the figures
     were being judged against grounds the decision is not about. `data-theme`
     is the site's own switch — the dark block is `:root:not([data-theme=
     "light"])` — so this is the page's mechanism, not an override of it.
     The real page keeps both themes; only the review pins one. -->
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="robots" content="noindex, nofollow">
<title>Zapier · n8n card — B, three ways</title>
<link rel="stylesheet" href="styles.css">
<link rel="stylesheet" href="variants.css">
</head>
<body class="opts">
<header class="opts__head">
  <p class="opts__k">Round 2 · B, three ways</p>
  <h1 class="opts__h">Fuller, and it moves.</h1>
  <p class="opts__l">Tong on round 1: <b>“B的方向可以，但是和其他两个 cards 比，
  这个第三张 card 不够饱满，而且动画有点看不出来。”</b></p>
  <p class="opts__l">Both faults have one cause. B was three small objects
  centred in a 405×302 band with tint showing on all four sides, while the two
  cards beside it are <b>oversized product surfaces cropped by their bands</b> —
  the lane stack loses 130px off the right, the browser window runs past both
  edges. A figure that fits politely inside its frame reads as emptier than its
  neighbours whatever is in it. And in a row of three where the other two
  animate, the one that does not reads as the one that is broken.</p>
  <p class="opts__l">So in all three: the sentence sits on a real surface that
  <b>runs past the right edge</b>, and it <b>writes itself</b> on a 9s loop —
  line, line, then the three tools it picked. What differs is the ground it is
  written over: their language as wallpaper, as a column that never ends, or as
  a chain that folds away under it. B as you saw it is first, for comparison.</p>
</header>
<main>
%s
</main>
<footer class="opts__foot"><p>Nothing here is merged. Pick one, or a mix of two.</p></footer>
</body>
</html>''' % ('\n'.join(blocks))

    def stamp(m):
        path = m.group(2)
        full = os.path.join(OUT, path.split('?')[0])
        if not os.path.isfile(full):
            return m.group(0)
        h = hashlib.sha1(open(full, 'rb').read()).hexdigest()[:8]
        return '%s="%s?v=%s"' % (m.group(1), path.split('?')[0], h)

    html = re.sub(r'(src|href)="((?:assets|variants|styles)[^"]*)"', stamp, html)
    with open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(html)
    kb = sum(os.path.getsize(os.path.join(dp, f))
             for dp, _, fs in os.walk(OUT) for f in fs) / 1024
    print('options-versus/  %d figures  %.0f KB' % (len(OPTIONS), kb))


if __name__ == '__main__':
    build()
