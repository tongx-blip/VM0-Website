#!/usr/bin/env python3
"""
Build options/ — competing directions for the comparison cards' figures,
each drawn in the real card at its real width, so they can be compared by
looking rather than by description.

    python3 tools/build-options.py    ->  options/
    okou host ./options --site okou-lane-options

The Codex card is settled (product scale on an endless track, shipped
2026-08-26) and appears here only as the reference the other two are held
to. What is open is card B (ChatGPT — the shipped artifact) and card D
(Claude Code — the terminal), three directions each.
"""
import hashlib
import os
import re
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'options')
SITE = os.path.join(ROOT, 'site')

TICK = ('<svg class="ico-tick" viewBox="0 0 24 24" fill="none" stroke-width="3.4" '
        'stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 4 4L19 7"/></svg>')
IND = ('<span class="vsui__ind"><span class="vsui__ind-c"></span>'
       '<span class="vsui__ind-r"></span></span>')


def av(n, size=32, cls='ava'):
    return ('<img class="%s" src="assets/brand/avatar-%d.png" alt="" '
            'width="%d" height="%d">' % (cls, n, size, size))


# ══════════════════════════════════════════════════════════════════════
#  CARD B — ChatGPT vs Okou · "Does the work, not just the thinking."
#  Band: 532 × 276
# ══════════════════════════════════════════════════════════════════════

def win_chrome(url):
    """A published page's own chrome. The artifact IS a site, so this is a
    browser, and a browser's toolbar is a URL field — not three dots and a
    string floating beside them."""
    return ('<p class="win__bar"><i></i><i></i><i></i>'
            '<span class="win__url">'
            '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round">'
            '<rect x="5" y="11" width="14" height="9" rx="2"/>'
            '<path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>%s</span></p>' % url)


def stat(value, label, delta=None, up=True):
    d = ''
    if delta:
        d = ('<em class="stat__d stat__d--%s">'
             '<svg viewBox="0 0 24 24" fill="none" stroke-width="3" stroke-linecap="round" '
             'stroke-linejoin="round"><path d="%s"/></svg>%s</em>'
             % ('up' if up else 'down',
                'm6 15 6-6 6 6' if up else 'm6 9 6 6 6-6', delta))
    return ('<div class="stat"><b>%s</b>%s<span>%s</span></div>' % (value, d, label))


CHART = [('Mon', 34), ('Tue', 52), ('Wed', 41), ('Thu', 68),
         ('Fri', 58), ('Sat', 86), ('Sun', 74)]


def _smooth(pts):
    """Catmull-Rom through the points, converted to cubic Beziers. A
    polyline reads as a sketch; the curve is what makes it look like a
    chart a product would actually draw."""
    d = 'M%.1f %.1f' % pts[0]
    for i in range(len(pts) - 1):
        p0 = pts[i - 1] if i else pts[0]
        p1, p2 = pts[i], pts[i + 1]
        p3 = pts[i + 2] if i + 2 < len(pts) else p2
        d += ' C%.1f %.1f %.1f %.1f %.1f %.1f' % (
            p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6,
            p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6,
            p2[0], p2[1])
    return d


def chart(peak=5):
    """AN AREA, NOT SEVEN BARS. Bars need height to say anything, and this
    band has about forty pixels to spare after the chrome, the title and
    the tiles — at which point the tallest day was thirty-two pixels and
    the shortest twelve, which is a texture rather than a reading. A
    filled curve is legible at any height, and it is what a dashboard of
    this kind draws anyway.

    The peak's value sits ON the peak. Parked in the top-right corner it
    was the first thing the window's right bleed removed, and a callout
    that only survives at one crop is not a callout."""
    W, H = 280.0, 60.0
    lo, hi = 20.0, 95.0
    pts = [((W / (len(CHART) - 1)) * i,
            H - (v - lo) / (hi - lo) * (H - 8) - 4)
           for i, (_, v) in enumerate(CHART)]
    line = _smooth(pts)
    area = line + ' L%.1f %.1f L0 %.1f Z' % (W, H, H)
    px, py = pts[peak]
    axis = ''.join('<em>%s</em>' % lab for lab, _ in CHART)
    return (
        '<div class="chart">'
        '<div class="chart__plot">'
        '<svg class="chart__svg" viewBox="0 0 280 60" preserveAspectRatio="none" '
        'aria-hidden="true" data-cue="600">'
        '<path class="chart__area" d="%s"/>'
        '<path class="chart__line" d="%s" fill="none" vector-effect="non-scaling-stroke"/>'
        '</svg>'
        '<span class="chart__dot" style="--x:%.2f%%;--y:%.2f%%"></span>'
        '<b class="chart__val" style="--x:%.2f%%;--y:%.2f%%">4.2&#215;</b>'
        '</div>'
        '<p class="chart__axis">%s</p></div>'
        % (area, line, px / W * 100, py / H * 100, px / W * 100, py / H * 100, axis))


TRAIL_STEPS = [('Read GA4 and Meta', 'google-analytics.svg', '17s'),
               ('Pulled the creative specs', 'meta-ads.svg', '11s'),
               ('Drafted the brief', 'notion.svg', '24s'),
               ('Published the page', 'vercel.svg', '6s')]


def trail_rows(cls='trail', with_tool=True, start=900, step=520):
    out = []
    for i, (label, tool, dur) in enumerate(TRAIL_STEPS):
        tool_html = ('<img class="%s__tool" src="assets/connectors/%s" alt="" '
                     'width="14" height="14">' % (cls, tool)) if with_tool else ''
        out.append('<p class="%s__r" data-cue="%d"><span class="%s__k">%s</span>'
                   '%s<b>%s</b><i>%s</i></p>'
                   % (cls, start + i * step, cls, TICK, tool_html, label, dur))
    return ''.join(out)


def dash_body(compact=False):
    return (
        '<div class="dash">'
        '<p class="dash__h">Weekly Ad Operator Dashboard'
        '<em class="dash__live"><span></span>Live</em></p>'
        '<div class="dash__stats">%s%s%s</div>%s</div>'
        % (stat('4.2×', 'ROAS', '0.6', True),
           stat('$18.4k', 'SPEND', '4%', False),
           stat('1,204', 'LEADS', '112', True),
           '' if compact else chart()))


B1 = ('<div class="fig fig--b1" data-loop="9000">'
      '<div class="win win--b1">%s<div class="win__body">%s</div>'
      # the receipt is DOCKED to the window it vouches for, not floated
      # over the numbers it is vouching for
      '<div class="dock">'
      '<span class="dock__k">%s</span>'
      '<b class="dock__t" data-cue="0" data-until="2400">Read GA4 and Meta<i>17s</i></b>'
      '<b class="dock__t" data-cue="2400" data-until="4800">Pulled the creative specs<i>11s</i></b>'
      '<b class="dock__t" data-cue="4800" data-until="7200">Drafted the brief<i>24s</i></b>'
      '<b class="dock__t" data-cue="7200" data-until="9000">Published the page<i>6s</i></b>'
      '</div>'
      '</div></div>'
      % (win_chrome('okou-artifact-weekly.sites.vm0.io'), dash_body(), TICK))

B2 = ('<div class="fig fig--b2" data-loop="8000">'
      # what the alternative hands you: a block of text and a copy button
      '<div class="ans">'
      '<p class="ans__h">Answer</p>'
      '<p class="ans__l"></p><p class="ans__l"></p><p class="ans__l ans__l--s"></p>'
      '<p class="ans__l"></p><p class="ans__l ans__l--m"></p>'
      '<p class="ans__copy"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" '
      'stroke-linecap="round" stroke-linejoin="round">'
      '<rect x="9" y="9" width="11" height="11" rx="2"/>'
      '<path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>Copy</p></div>'
      '<div class="win win--b2">%s<div class="win__body">%s</div></div>'
      '<div class="ship" data-cue="600"><span class="ship__k">%s</span>Shipped</div>'
      '</div>'
      % (win_chrome('okou-artifact-weekly.sites.vm0.io'), dash_body(), TICK))

B3 = ('<div class="fig fig--b3" data-loop="7600">'
      # the run is the hero and the artifact is what it produced
      '<div class="run">'
      '<p class="run__h">%s<b>Kai</b><span>Weekly ad report</span><i>58s</i></p>'
      '<div class="run__steps">%s</div></div>'
      '<figure class="artc" data-cue="2900">'
      '<span class="artc__shot"><span></span><span></span><span></span></span>'
      '<figcaption><b>Weekly Ad Operator Dashboard</b>'
      '<em>okou-artifact-weekly.sites.vm0.io</em></figcaption></figure>'
      '</div>'
      % (av(2, 28), trail_rows('run', True, 300, 620)))


# ══════════════════════════════════════════════════════════════════════
#  CARD D — Claude Code vs Okou · "Built for shared work, not one terminal."
#  Band: 752 × 216
# ══════════════════════════════════════════════════════════════════════

def term(title, lines, typed=None, wide=True):
    """A terminal that is actually drawn as one. The old mock was flat grey
    monospace on a dark box with three dots — no title, no prompt colour, no
    distinction between what was typed and what came back. Every tone below
    belongs to the terminal's own world, not to this page's palette."""
    body = ''
    for kind, text in lines:
        if kind == 'cmd':
            body += ('<p class="term__l"><span class="term__p">~/repo</span>'
                     '<span class="term__d">$</span>'
                     '<span class="term__c">%s</span></p>' % text)
        elif kind == 'file':
            body += '<p class="term__l term__l--f">%s</p>' % text
        elif kind == 'ok':
            body += ('<p class="term__l"><span class="term__ok">%s</span>%s</p>'
                     % (TICK, text))
        elif kind == 'run':
            body += ('<p class="term__l"><span class="term__sp"></span>%s</p>' % text)
        else:
            body += '<p class="term__l">%s</p>' % text
    tail = ''
    if typed is not None:
        tail = ('<p class="term__l"><span class="term__p">~/repo</span>'
                '<span class="term__d">$</span>'
                '<span class="term__c" data-type="%s"></span>'
                '<span class="term__cur"></span></p>' % typed)
    return ('<div class="term%s"><p class="term__bar">'
            '<i class="term__d1"></i><i class="term__d2"></i><i class="term__d3"></i>'
            '<span class="term__title">%s</span></p>'
            '<div class="term__body">%s%s</div></div>'
            % (' term--wide' if wide else '', title, body, tail))


D_LINES = [('cmd', 'claude'),
           ('out', 'reading local files…'),
           ('file', 'src/checkout/session.ts'),
           ('file', 'src/checkout/refund.ts'),
           ('ok', 'drafted the patch')]


def okou_row(n, title, meta, live=False, cue=None):
    c = ' data-cue="%d"' % cue if cue is not None else ''
    return ('<p class="row%s"%s>%s<b>%s</b>'
            '<span class="row__slot">%s</span><em>%s</em></p>'
            % (' row--live' if live else '', c, av(n, 32), title,
               IND if live else '', meta))


def faces(ns, note):
    return ('<p class="faces">%s<em>%s</em></p>'
            % (''.join(av(n, 24, 'faces__a') for n in ns), note))


D1 = ('<div class="fig fig--d1" data-loop="7200">%s'
      '<div class="okp okp--d1">'
      '<p class="okp__h">Shared workflows<em>4 running</em></p>'
      '%s%s%s</div></div>'
      % (term('repo — claude — 80×24', D_LINES, typed='git diff --stat'),
         okou_row(3, 'Weekly team digest', 'Mon 09:00', True),
         okou_row(4, 'Incident triage', 'on alert', True),
         faces([1, 2, 3, 4], '+6 in the team')))

D2 = ('<div class="fig fig--d2" data-loop="9000">'
      '<div class="half half--one"><p class="half__cap">One machine, one session</p>%s</div>'
      '<div class="half half--team"><p class="half__cap">The whole team, in one place</p>'
      '<div class="okp okp--d2">%s%s%s%s</div></div></div>'
      % (term('claude — 80×24', D_LINES[:4], typed='claude', wide=False),
         okou_row(1, 'Storefront launch', 'now', True),
         okou_row(2, 'Ad campaign shift', 'now', True),
         okou_row(3, 'Weekly team digest', 'Mon 09:00', True),
         faces([1, 2, 3, 4], '+6 in the team')))

D3 = ('<div class="fig fig--d3" data-loop="9000">%s'
      '<div class="okp okp--d3">'
      '<p class="wf__h">%s<span><b>Weekly team digest</b>'
      '<em>from Ravi · used by 10 people</em></span>'
      '<i class="wf__sched">Mon 09:00</i></p>'
      '<div class="wf__runs">'
      '<span class="wf__run" style="--h:58%%" data-cue="600"></span>'
      '<span class="wf__run" style="--h:82%%" data-cue="1200"></span>'
      '<span class="wf__run" style="--h:47%%" data-cue="1800"></span>'
      '<span class="wf__run" style="--h:71%%" data-cue="2400"></span>'
      '<span class="wf__run" style="--h:63%%" data-cue="3000"></span>'
      '<span class="wf__run" style="--h:90%%" data-cue="3600"></span>'
      '<span class="wf__run wf__run--now" style="--h:100%%" data-cue="4200"></span></div>'
      '%s</div></div>'
      % (term('repo — claude — 80×24', D_LINES, wide=True),
         av(4, 32), faces([1, 2, 3, 4], 'running now')))


# ══════════════════════════════════════════════════════════════════════

GROUPS = [
  ('B', 'ChatGPT', 'connectors/openai.svg',
   'Does the work, not just the thinking.',
   'ChatGPT gives you an answer to paste somewhere. Okou is connected to the '
   'tools, so the answer arrives as a shipped artifact with an activity trail '
   'behind it.',
   'artifact', 'vs--narrow', [
     ('b1', 'The artifact, and its receipt',
      'The window is a real browser: a URL field with a lock, not three dots and '
      'a floating string. The chart gets a baseline, a named peak and day labels; '
      'the stat tiles get the movement that makes a number mean something. The '
      'activity trail stops being a sticker parked across the chart and becomes '
      'what it actually is — a receipt docked to the bottom of the thing it '
      'vouches for, advancing one step at a time.', B1),
     ('b2', 'The answer, and the artifact',
      'Draws the sentence rather than the product: behind, greyed and small, the '
      'thing the alternative hands you — a block of text and a Copy button. In '
      'front, overlapping it, the artifact that got shipped. The one card in the '
      'set whose picture is an argument.', B2),
     ('b3', 'The run, and what it shipped',
      'Inverts the hierarchy. The activity trail becomes the hero at product '
      'size — agent, step, the tool each step touched, how long it took — and the '
      'artifact arrives as the product’s own artifact card when the last step '
      'lands. The trail is the claim; this is the version that says so.', B3),
   ]),
  ('D', 'Claude Code', 'connectors/anthropic.svg',
   'Built for shared work, not one terminal.',
   'Claude Code lives on one engineer’s machine. Okou runs in the cloud, '
   'connects to the team’s tools, and turns one person’s know-how into '
   'shared capability.',
   'shared', 'vs--wide', [
     ('d1', 'A terminal that is actually drawn as one',
      'Same composition, real craft. The old terminal was flat grey monospace on '
      'a dark box: no window title, no prompt colour, no difference between what '
      'was typed and what came back. This one has a title bar, a coloured path, a '
      'dimmed <code>$</code>, output in a lower tone, a green tick on the line '
      'that finished, and a caret that blinks on a one-second beat while the next '
      'command types itself.', D1),
     ('d2', 'One seat, or the whole team',
      'No overlap — the contrast is the composition. Left, at its own scale, one '
      'machine with one session. Right, the same moment in Okou: three runs '
      'moving at once and ten people on them. The asymmetry between the two '
      'halves is the entire sentence.', D2),
     ('d3', 'What one person knew, the team now runs',
      'The terminal recedes to a ground, still running, and the foreground is the '
      'thing the sentence is actually about: a workflow with an author, a '
      'schedule, ten people using it and a strip of its past runs — the newest of '
      'which fires while you watch.', D3),
   ]),
]


CARD = """
    <section class="opt" id="opt-%(key)s">
      <p class="opt__eyebrow">Option %(n)s</p>
      <h3 class="opt__h">%(title)s</h3>
      <p class="opt__note">%(note)s</p>
      <div class="opt__stage opt__stage--%(width)s">
        <article class="vs %(width)s">
          <div class="vs__viz vs__viz--%(hue)s lzc lzc--%(key)s" aria-hidden="true">%(figure)s</div>
          <div class="vs__txt">
            <p class="vs__pair"><span class="vs__side"><img src="assets/%(logo)s" alt="" width="18" height="18">%(rival)s</span><span class="vs__vs">vs</span><span class="vs__side vs__side--us"><img src="assets/avatars/agent-okou.png" alt="" width="18" height="18">Okou</span></p>
            <h4>%(head)s</h4>
            <p>%(body)s</p>
          </div>
        </article>
      </div>
    </section>
"""

GROUP = """
  <section class="grp">
    <h2 class="grp__h">Card %(letter)s · %(rival)s</h2>
    <p class="grp__lede">%(head)s</p>
%(cards)s
  </section>
"""

HEAD = """<!doctype html>
<!-- pinned light: a review build borrows site/styles.css, which honours
     `prefers-color-scheme`, so on a dark machine the comparison arrived in
     dark and the options were judged against a ground the decision is not
     about. `data-theme` is the site's own switch, not an override of it. -->
<html lang="en" data-theme="light"><head>
<meta name="color-scheme" content="light">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Comparison cards · directions</title>
<meta name="robots" content="noindex,nofollow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=Instrument+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Noto+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css?r=%(css)s">
<link rel="stylesheet" href="variants.css?r=%(var)s">
</head><body class="opts">
<header class="opts__head">
  <p class="opts__label">OKOU · POSITIONING</p>
  <h1 class="opts__t">Two cards, three directions each.</h1>
  <p class="opts__lede">Every figure is drawn in the real card at the real width —
  532&#215;276 for ChatGPT, 752&#215;216 for Claude Code — because a figure judged at
  any other size is a different figure. All six are live; give each one about
  ten seconds.</p>
</header>
<main>
%(groups)s
</main>
<script src="cards.js?r=%(js)s"></script>
</body></html>
"""


def main():
    os.makedirs(os.path.join(OUT, 'assets'), exist_ok=True)
    shutil.copyfile(os.path.join(SITE, 'styles.css'), os.path.join(OUT, 'styles.css'))
    open(os.path.join(OUT, 'robots.txt'), 'w').write('User-agent: *\nDisallow: /\n')

    groups = ''
    n_total = 0
    for letter, rival, logo, head, body, hue, width, variants in GROUPS:
        cards = ''
        for i, (key, title, note, fig) in enumerate(variants):
            n_total += 1
            cards += CARD % {'key': key, 'n': i + 1, 'title': title, 'note': note,
                             'figure': fig, 'hue': hue, 'width': width,
                             'logo': logo, 'rival': rival, 'head': head, 'body': body}
        groups += GROUP % {'letter': letter, 'rival': rival, 'head': head,
                           'cards': cards}

    # Every mark the figures use, PLUS every asset the shipped stylesheet
    # names — `okou host` refuses a bundle with a dangling reference, and
    # styles.css is the whole design layer.
    want = {'avatars/agent-okou.png'}
    want |= {'brand/avatar-%d.png' % n for n in range(1, 7)}
    want |= {'connectors/' + f for f in
             ('openai.svg', 'anthropic.svg', 'google-analytics.svg', 'meta-ads.svg',
              'notion.svg', 'vercel.svg')}
    css = open(os.path.join(OUT, 'styles.css'), encoding='utf-8').read()
    want |= {m[len('assets/'):] for m in
             re.findall(r'url\(\s*(assets/[^)?\s]+)', css)}
    for rel in sorted(want):
        src = os.path.join(SITE, 'assets', rel)
        if not os.path.isfile(src):
            continue
        dst = os.path.join(OUT, 'assets', rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copyfile(src, dst)

    def h(name):
        return hashlib.sha1(open(os.path.join(OUT, name), 'rb').read()).hexdigest()[:8]

    open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(
        HEAD % {'groups': groups, 'css': h('styles.css'),
                'var': h('variants.css'), 'js': h('cards.js')})
    print('options/ built — %d directions across %d cards' % (n_total, len(GROUPS)))


if __name__ == '__main__':
    main()
