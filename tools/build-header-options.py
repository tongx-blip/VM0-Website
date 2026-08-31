#!/usr/bin/env python3
"""Build options-header/ — four ways to separate the header from the page.

    python3 tools/build-header-options.py
    okou host ./options-header --site okou-header-options

Tong: *"我感觉 header 的颜色和背景有点混在一起了。但是我又不想给 header 加太多的阴
影，感觉会有点廉价。"*

MEASURED FIRST, because "it blends" is a number:

    stuck bar  #EAEEF0  vs page ground   #F4F6F7   contrast 1.077   ΔL  6.9%
    stuck bar  #EAEEF0  vs section card  #FFFFFF   contrast 1.168   ΔL 15.1%
    page ground #F4F6F7 vs section card  #FFFFFF   contrast 1.084   ΔL  8.1%

The third line is the diagnosis. **The header's separation is the same size as
the page's own ambient steps.** Grey on grey at 1.077 is not an edge anyone can
see, and even at its best — over a white card — the bar is only one more step
in a stack of greys. The bar is not a different ORDER of thing; it is one more
grey. No amount of tuning that grey fixes a problem whose cause is that grey is
the wrong channel, and he is right that reaching for shadow is the cheap way
out: a shadow heavy enough to beat 1.077 is the bruise RULES S3 already refused
once.

So each direction changes a DIFFERENT channel, and none of them is shadow:

    A  material   the bar has no fill; what is behind it goes out of focus
    B  value      the bar inverts — the page already has a dark register
    C  silhouette no colour change at all; the bar gets smaller and steps back
    D  tone       the same channel, but two rungs instead of half of one

**Judged on the real page, in motion.** A header only exists in two states and
the change between them is the information (S6), so a static comparison of four
headers proves nothing. This copies `site/` whole and adds a switcher: scroll
once, flip between the four with the same content behind the bar.
"""
import hashlib
import os
import re
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, 'site')
OUT = os.path.join(ROOT, 'options-header')

SWITCH = '''
<div class="hsw" role="group" aria-label="Header direction">
  <p class="hsw__k">Header · four directions</p>
  <div class="hsw__row">
    <button type="button" data-go="0" class="is-on">Now</button>
    <button type="button" data-go="a">A · Glass</button>
    <button type="button" data-go="b">B · Inverted</button>
    <button type="button" data-go="c">C · Smaller</button>
    <button type="button" data-go="d">D · Deeper</button>
  </div>
  <p class="hsw__n" id="hswNote">The header as it ships. Grey on grey — 1.077 against the page ground.</p>
</div>
'''


def build():
    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    shutil.copytree(SITE, OUT)

    for name in ('header-options.css', 'header-options.js'):
        shutil.copy(os.path.join(ROOT, 'tools', name),
                    os.path.join(OUT, name.replace('header-options', 'variants')))

    with open(os.path.join(OUT, 'robots.txt'), 'w') as f:
        f.write('User-agent: *\nDisallow: /\n')

    html = open(os.path.join(OUT, 'index.html'), encoding='utf-8').read()
    html = html.replace('</head>', '<link rel="stylesheet" href="variants.css">\n</head>', 1)
    html = html.replace('<body>', '<body>\n' + SWITCH, 1)
    html = html.replace('</body>', '<script src="variants.js"></script>\n</body>', 1)
    html = html.replace('<title>', '<meta name="robots" content="noindex, nofollow">\n<title>', 1)

    # the site build stamps its own assets; stamp the two files it does not
    # know about, for the same reason (RULES R1)
    def stamp(m):
        path = m.group(2)
        full = os.path.join(OUT, path.split('?')[0])
        if not os.path.isfile(full):
            return m.group(0)
        h = hashlib.sha1(open(full, 'rb').read()).hexdigest()[:8]
        return '%s="%s?v=%s"' % (m.group(1), path.split('?')[0], h)

    html = re.sub(r'(src|href)="(variants\.(?:css|js))"', stamp, html)
    open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(html)

    kb = sum(os.path.getsize(os.path.join(dp, f))
             for dp, _, fs in os.walk(OUT) for f in fs) / 1024
    print('options-header/  the real page + 4 header variants  %.0f KB' % kb)


if __name__ == '__main__':
    build()
