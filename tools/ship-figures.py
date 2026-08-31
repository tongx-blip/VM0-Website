#!/usr/bin/env python3
"""
Splice the two chosen comparison-card figures into site/index.html.

    python3 tools/ship-figures.py

Card B took direction 1 (the artifact, and its receipt) and card D took
direction 3 (what one person knew, the team now runs) — see
docs/changelog.md 2026-08-26. The options page keeps the losing four; this
writes the winners into the page with the repo's own component prefixes
(`.arti__*`, `.tsh__*`) rather than the generic names the comparison page
used, because those roots are already what `tools/audit.js` exempts and
what `docs/design-system.md` §12 documents.

The figures are markup-heavy and every value in them is a measurement, so
they are generated rather than hand-edited: a hand-edit is where a stray
`<div>` gets closed against `</section>` and two paragraphs end up inside
the wrong column (QA §4h).
"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML = os.path.join(ROOT, 'site', 'index.html')

TICK = ('<svg class="arti__tick" viewBox="0 0 24 24" fill="none" stroke-width="3.4" '
        'stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 4 4L19 7"/></svg>')


# ── card B ────────────────────────────────────────────────────────────
CHART = [('Mon', 34), ('Tue', 52), ('Wed', 41), ('Thu', 68),
         ('Fri', 58), ('Sat', 86), ('Sun', 74)]

STEPS = [('Read GA4 and Meta', '17s'),
         ('Pulled the creative specs', '11s'),
         ('Drafted the brief', '24s'),
         ('Published the page', '6s')]


def _smooth(pts):
    """Catmull-Rom through the points, as cubic Beziers. A polyline reads
    as a sketch; the curve is what makes it a chart."""
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


def card_b(peak=5):
    """FEWER THINGS, DRAWN BIGGER.

    This figure had nineteen discrete pieces in a 532×276 band: browser
    chrome, a title, a live badge, three figures, three deltas, a curve, a
    peak dot, a peak value, seven day labels and a receipt. The references
    it is being held to carry four to six, at twice the size, and half of
    what they do carry is a grey placeholder bar rather than a word.

    So: the live badge goes (it decorated rather than said anything), the
    third figure goes, the deltas go, the seven day labels go, and the
    peak's value goes — it read `4.2×`, which is the ROAS figure printed a
    second time eighty pixels away. Seven pieces left, and the space they
    give back goes to the curve, which was the one part carrying a reading
    and the part that was being squeezed into the bottom of its own plot.
    """
    W, H, lo, hi = 280.0, 60.0, 26.0, 92.0   # the week's own range, +3 either side
    pts = [((W / (len(CHART) - 1)) * i, H - (v - lo) / (hi - lo) * (H - 8) - 4)
           for i, (_, v) in enumerate(CHART)]
    line = _smooth(pts)
    area = line + ' L%.1f %.1f L0 %.1f Z' % (W, H, H)
    px, py = pts[peak]

    stats = ''.join(
        '<div class="arti__s"><b>%s</b><span>%s</span></div>' % (value, label)
        for value, label in (('4.2&#215;', 'ROAS'), ('1,204', 'LEADS')))

    dock = ''
    for i, (label, dur) in enumerate(STEPS):
        dock += ('<b class="arti__step" data-cue="%d" data-until="%d">%s<i>%s</i></b>'
                 % (i * 2400, (i + 1) * 2400, label, dur))

    return (
        '<div class="arti" data-loop="9600">'
        '<div class="arti__win">'
        '<p class="arti__bar"><i></i><i></i><i></i>'
        '<span class="arti__url">'
        '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round">'
        '<rect x="5" y="11" width="14" height="9" rx="2"/>'
        '<path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'
        'okou-artifact-weekly.sites.vm0.io</span></p>'
        '<div class="arti__body">'
        '<div class="arti__dash">'
        '<p class="arti__h">Weekly Ad Operator Dashboard</p>'
        '<div class="arti__stats">%s</div>'
        '<div class="arti__chart">'
        '<div class="arti__plot">'
        '<svg class="arti__svg" viewBox="0 0 280 60" preserveAspectRatio="none" '
        'data-cue="600">'
        '<path class="arti__area" d="%s"/>'
        '<path class="arti__line" d="%s" fill="none" vector-effect="non-scaling-stroke"/>'
        '</svg>'
        '<span class="arti__dot" style="--x:%.2f%%;--y:%.2f%%"></span>'
        '</div></div></div></div>'
        '<div class="arti__dock"><span class="arti__k">%s</span>%s</div>'
        '</div></div>'
        % (stats, area, line, px / W * 100, py / H * 100, TICK, dock))


# ── card D ────────────────────────────────────────────────────────────
# THREE LINES, NOT FIVE. Two file paths said the same thing one says, and
# a terminal that is a GROUND does not need to be read — it needs to be
# recognisable. What is left is the shape of a session: a command, what it
# is doing, what it finished.
TERM_LINES = [('cmd', 'claude'),
              ('out', 'reading local files…'),
              ('ok', 'drafted the patch')]


def card_d():
    body = ''
    for kind, text in TERM_LINES:
        if kind == 'cmd':
            body += ('<p class="tsh__l"><span class="tsh__p">~/repo</span>'
                     '<span class="tsh__d">$</span>'
                     '<span class="tsh__c">%s</span></p>' % text)
        elif kind == 'file':
            body += '<p class="tsh__l tsh__l--f">%s</p>' % text
        elif kind == 'ok':
            body += ('<p class="tsh__l"><span class="tsh__ok">%s</span>%s</p>'
                     % (TICK.replace('arti__tick', 'tsh__tick'), text))
        else:
            body += '<p class="tsh__l">%s</p>' % text

    faces = ''.join(
        '<img class="tsh__face" src="assets/brand/avatar-%d.png" alt="" '
        'width="24" height="24">' % n for n in (1, 2, 3, 4))

    return (
        '<div class="tsh" data-loop="9000">'
        '<div class="tsh__term">'
        '<p class="tsh__bar"><i class="tsh__d1"></i><i class="tsh__d2"></i>'
        '<i class="tsh__d3"></i><span class="tsh__title">repo — claude — 80&#215;24</span></p>'
        '<div class="tsh__body">%s</div></div>'
        '<div class="tsh__wf">'
        '<p class="tsh__wfh">'
        '<img class="tsh__av" src="assets/brand/avatar-4.jpg" alt="" width="32" height="32">'
        '<span><b>Weekly team digest</b><em>from Ravi · used by 10 people</em></span>'
        '<i class="tsh__sched">Mon 09:00</i></p>'
        '<p class="tsh__faces">%s<em>running now</em></p>'
        '</div></div>'
        % (body, faces))


def splice(html, viz_class, figure):
    """Replace everything inside the band, found by BALANCING tags rather
    than by matching a `</div>\n      </div>` string.

    The string version worked exactly once. Run it again — on a file this
    script had already written — and the marker it keyed on was no longer
    the figure's own closing pair but the one two levels out, so it ate
    `.vs__viz`'s closer and the document unravelled from `<article>` all
    the way to `</html>`. A generator that cannot be run twice is a
    generator that will be run twice."""
    i = html.index(viz_class)
    start = html.index('>', i) + 1
    depth, end, j = 1, None, start
    while depth:
        m = re.compile(r'<(/?)div\b').search(html, j)
        if not m:
            raise SystemExit('unbalanced div after ' + viz_class)
        depth += -1 if m.group(1) else 1
        end, j = m.start(), m.end()               # `end` is where the tag OPENS
    # m.end() stops after `</div`, not after `</div>`, so a rindex bounded by
    # it cannot see the closer it just found and silently returns the one
    # before — which is how a balance-aware splice still ate a tag.
    return html[:start] + '\n        ' + figure + '\n      ' + html[end:]


def balanced(fragment):
    """Every generated figure has to close itself. A stray `<div>` does not
    throw — the browser closes it at `</section>` and the content silently
    lands in the wrong column, which is exactly how two paragraphs once
    ended up inside a sticky sidebar (QA §4h). Checked on the fragment,
    not on a slice of the document: a slice that starts inside an opening
    tag counts that tag's closer and nothing else, so it always reports an
    imbalance that is not there."""
    for t in ('div', 'p', 'span', 'svg'):
        n = sum(1 if not m.group(1) else -1
                for m in re.finditer(r'<(/?)' + t + r'[ />]', fragment))
        assert n == 0, '%s unbalanced by %d' % (t, n)


def main():
    b, d = card_b(), card_d()
    balanced(b)
    balanced(d)
    html = open(HTML, encoding='utf-8').read()
    html = splice(html, 'vs__viz--artifact', b)
    html = splice(html, 'vs__viz--shared', d)
    open(HTML, 'w', encoding='utf-8').write(html)
    print('spliced both figures — tags balanced')


if __name__ == '__main__':
    main()
