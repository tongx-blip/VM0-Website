#!/usr/bin/env python3
"""
Build options/ — three directions for the Codex card's product figure,
each drawn in the real card at its real width, so they can be compared by
looking rather than by description.

    python3 tools/build-options.py    ->  options/
    okou host ./options --site okou-lane-options
"""
import os, re, shutil, hashlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'options')
SITE = os.path.join(ROOT, 'site')

# ── the run, newest step first ───────────────────────────────────────
LANES = [
  ("avatar-1.png", "Mira", "Storefront launch", [
    ("Writing the sections", None),   ("Pulled the copy deck", "14s"),
    ("Picked the template", "9s"),    ("Read the brand kit", "21s"),
    ("Opened the store", "6s"),       ("Checked stock levels", "12s"),
    ("Listed the collections", "18s"),("Priced the bundles", "33s"),
  ]),
  ("avatar-2.png", "Kai", "Ad campaign shift", [
    ("Rebalancing the budget", None), ("Read GA4 and Meta", "17s"),
    ("Flagged two ad sets", "8s"),    ("Exported last week", "23s"),
    ("Pulled creative specs", "11s"), ("Read the pacing report", "19s"),
    ("Checked the frequency caps", "26s"), ("Listed the live campaigns", "15s"),
  ]),
  ("avatar-3.png", "Ines", "Spec for bulk export", [
    ("Drafting the spec", None),      ("Scanned the schema", "22s"),
    ("Read the open issues", "16s"),  ("Checked the API", "10s"),
    ("Listed the endpoints", "13s"),  ("Read the changelog", "29s"),
    ("Collected the requests", "44s"),("Tagged the duplicates", "18s"),
  ]),
  ("avatar-4.png", "Ravi", "Weekly team digest", [
    ("Collecting the threads", None), ("Opened the channels", "5s"),
    ("Read Monday standup", "24s"),   ("Listed the owners", "11s"),
    ("Read the retro notes", "20s"),  ("Checked the calendar", "8s"),
    ("Pulled the shipped PRs", "34s"),("Summarised the blockers", "46s"),
  ]),
]

IND = ('<span class="vsui__ind"><span class="vsui__ind-c"></span>'
       '<span class="vsui__ind-r"></span></span>')
TICK = ('<svg class="lane__tick" viewBox="0 0 24 24" fill="none" stroke-width="3.4" '
        'stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 4 4L19 7"/></svg>')


def rows(steps, n, durations=True):
    out = []
    for i, (label, dur) in enumerate(steps[:n]):
        key = (IND if i < 3 else '') + TICK
        cls = 'lane__s lane__s--now' if i == 0 else 'lane__s'
        meta = '<i>%s</i>' % dur if (dur and durations) else ''
        out.append('<p class="%s"><span class="lane__r"><span class="lane__k">%s</span>'
                   '<em>%s</em>%s</span></p>' % (cls, key, label.replace("'", "’"), meta))
    return ''.join(out)


def board(n_lanes, n_steps, durations=True):
    out = ['<div class="lanes">']
    for av, name, title, steps in LANES[:n_lanes]:
        out.append('<div class="lane">'
                   '<p class="lane__h"><img src="assets/brand/%s" alt="" width="32" height="32">'
                   '<b>%s</b><span>now</span></p>'
                   '<p class="lane__t">%s</p>%s</div>'
                   % (av, name, title, rows(steps, n_steps, durations)))
    out.append('</div>')
    return ''.join(out)


def lens():
    """the magnified callout — one step, at the size the product draws it"""
    return ('<div class="lens" aria-hidden="true">'
            '<p class="lens__h"><img class="lens__av" src="assets/brand/avatar-1.png" alt="" '
            'width="32" height="32"><b>Mira</b><em>Storefront launch</em></p>'
            '<p class="lens__s">' + IND + '<b>Writing the sections</b><i>0:12</i></p>'
            '</div>')


VARIANTS = [
  ('crop', 'Product scale',
   'The mock stops being shrunk. Every value is the app’s own — 32px avatar, '
   '14px row, 34px line, 8px radius — and the band crops the board instead of '
   'fitting it. Two agents and a bit, five steps each: a third of the words, '
   'twice the craft.',
   board(3, 8)),
  ('pan', 'Product scale, and the camera moves',
   'The same board at the same size, but it pans: the view holds on one agent for '
   'six seconds, then slides to the next. What is magnified is whoever you are '
   'looking at, and the neighbours stay cut into both edges so the width still '
   'says “at once”.',
   board(4, 8)),
  ('lens', 'The board, and one step magnified',
   'The four lanes go small — they are there to be counted, not read — and a '
   'single step is lifted out at product size in a panel that travels to whichever '
   'agent is working. The picture says “four” and “this is what one of them '
   'is doing” at the same time.',
   board(4, 5, durations=False) + lens()),
]


CARD = """
<section class="opt" id="opt-%(key)s">
  <p class="opt__eyebrow">Option %(n)s</p>
  <h2 class="opt__h">%(title)s</h2>
  <p class="opt__note">%(note)s</p>
  <div class="opt__stage">
    <article class="vs vs--wide">
      <div class="vs__viz vs__viz--parallel lz lz--%(key)s" aria-hidden="true">%(figure)s</div>
      <div class="vs__txt">
        <p class="vs__pair"><span class="vs__side"><img src="assets/connectors/openai.svg" alt="" width="18" height="18">Codex</span><span class="vs__vs">vs</span><span class="vs__side vs__side--us"><img src="assets/okou-icon.svg" alt="" width="18" height="18">Okou</span></p>
        <h3>Several AIs get more done at once.</h3>
        <p>Codex helps one person with one coding task. Okou divides the work between several AIs, so different jobs move forward at the same time and your whole team can work together in one place.</p>
      </div>
    </article>
  </div>
</section>
"""

HEAD = """<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Codex card · three directions</title>
<meta name="robots" content="noindex,nofollow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=Instrument+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Noto+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css?r=%(css)s">
<link rel="stylesheet" href="variants.css?r=%(var)s">
</head><body class="opts">
<header class="opts__head">
  <p class="opts__label">OKOU · POSITIONING</p>
  <h1 class="opts__t">Three ways to draw “several AIs at once”.</h1>
  <p class="opts__lede">Same card, same copy, same loop. What changes is how much of
  the product you are shown and at what size. Each one is live — watch it for
  fifteen seconds before deciding.</p>
</header>
<main>
%(cards)s
</main>
<script src="lanes.js?r=%(js)s"></script>
</body></html>
"""


def main():
    if os.path.isdir(OUT):
        for n in ('index.html',):
            p = os.path.join(OUT, n)
            if os.path.exists(p):
                os.remove(p)
    os.makedirs(os.path.join(OUT, 'assets', 'brand'), exist_ok=True)
    os.makedirs(os.path.join(OUT, 'assets', 'connectors'), exist_ok=True)

    shutil.copyfile(os.path.join(SITE, 'styles.css'), os.path.join(OUT, 'styles.css'))

    # The marks these three figures use, PLUS every asset the shipped
    # stylesheet names. `okou host` refuses to publish a bundle with a
    # dangling reference, and styles.css is the whole design layer — it
    # points at grounds and spot drawings this page never draws. Copying
    # what it references is cheaper than pruning a built artifact.
    want = {'brand/avatar-1.png', 'brand/avatar-2.png', 'brand/avatar-3.png',
            'brand/avatar-4.png', 'connectors/openai.svg', 'okou-icon.svg'}
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
    open(os.path.join(OUT, 'robots.txt'), 'w').write('User-agent: *\nDisallow: /\n')

    cards = ''.join(
        CARD % {'key': k, 'n': i + 1, 'title': t, 'note': note, 'figure': fig}
        for i, (k, t, note, fig) in enumerate(VARIANTS))

    def h(name):
        return hashlib.sha1(open(os.path.join(OUT, name), 'rb').read()).hexdigest()[:8]

    open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(
        HEAD % {'cards': cards, 'css': h('styles.css'),
                'var': h('variants.css'), 'js': h('lanes.js')})
    print('options/ built — %d variants' % len(VARIANTS))


if __name__ == '__main__':
    main()
