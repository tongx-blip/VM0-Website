#!/usr/bin/env python3
"""
Compose agent avatars from the brand's Avatar Composer, offline.

    python3 tools/build-avatars.py            # writes site/assets/avatars/*.svg
    python3 tools/build-avatars.py --list     # every dimension and its options

The composer lives at https://avatar-composer-v10-sharp.sites.vm0.io/ and is
the branding rule for agent avatars: six dimensions — background, face shape,
hairstyle, expression, skin tone, hair colour — over 232,050 valid
combinations. This reproduces its `compose()` exactly rather than approximating
it, so an avatar built here is byte-identical to one downloaded from the tool:

    layers = [ background,
               hair-underlay + hair-rear + hair-overlay,
               face,
               hair-front + hair-ear-join,
               expression ]

and the two colours ride on the root as custom properties (`--avatar-skin`,
`--avatar-hair`) which the component SVGs consume — which is why one file
recolours without touching a path.

The geometry lookup has four fallbacks and every one of them matters: a
hairstyle carries a variant per FACE GEOMETRY, and then per-face overrides on
top of that for the underlay, the overlay, the ear join and the front. Picking
`geometry.front` and stopping is how a hairstyle ends up floating off a face
it was never cut for.

The component SVGs are fetched once into `tools/avatar-cache/` (not committed —
it is 300+ files of somebody else's build output). The composed avatars ARE
committed: they are what the page ships, and regenerating them must not need
the network.

ADDING AN AGENT: put it in ROSTER and re-run. Nothing else.
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.request

# the host 403s the default `Python-urllib` agent
UA = {'User-Agent': 'Mozilla/5.0 (compatible; vm0-site-build/1.0)'}


def _get(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()

HOST = 'https://avatar-composer-v10-sharp.sites.vm0.io'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, 'tools', 'avatar-cache')
OUT = os.path.join(ROOT, 'site', 'assets', 'avatars')

# ── the roster ───────────────────────────────────────────────────────
#
# Okou is the only agent this page depicts, and it appears as a person in a
# conversation — a Slack row, its own chat window, the runner walking the
# connector chain. The brand MARK (the cube) is a different thing and stays
# where it is: the nav, the footer, the workspace tile, the comparison card.
#
# The choice is brand-led and deliberate, not a randomise. Ten candidates were
# rendered at 160, 44 and 22px and read at the size the page actually uses:
#
#   teal-stripes  NOT orange-marks. The page spends its one accent in three
#                 places (RULES C1) and this avatar sits beside two of them —
#                 an orange button in the nav and an orange mark in a
#                 sentence. An orange-grounded avatar makes a fourth. The deep
#                 green is also the only ground in the set that holds the gold
#                 face at 22px; on pink and on sky the head dissolves into it.
#   gold          #F8A100 — the warmest skin, and the highest contrast against
#                 that green
#   black         hair. The ground already carries a texture; a second
#                 saturated colour on top and the silhouette stops closing.
#   rounded-crop  a shape that survives being 22px across
#   gentle-smile  an agent that is working, not performing
#   round         the face geometry the composer marks `official`
ROSTER = {
    'agent-okou': {
        'background': 'teal-stripes',
        'face': 'round',
        'hair': 'rounded-crop',
        'expression': 'gentle-smile',
        'skin': 'gold',
        'hairColor': 'black',
    },
}


def fetch(path):
    """One component, cached. `path` is manifest-relative."""
    local = os.path.join(CACHE, path.replace('/', '__'))
    if not os.path.isfile(local):
        os.makedirs(CACHE, exist_ok=True)
        with open(local, 'wb') as f:
            f.write(_get('%s/%s' % (HOST, path)))
    return open(local, encoding='utf-8').read()


def inner(path):
    """The composer strips the <svg> wrapper off every component and keeps the
    body — the layers share one canvas and one coordinate space."""
    src = fetch(path)
    src = re.sub(r'^.*?<svg\b[^>]*>', '', src, flags=re.S)
    return re.sub(r'</svg>\s*$', '', src, flags=re.S)


def manifest():
    local = os.path.join(CACHE, 'avatar-manifest.json')
    if not os.path.isfile(local):
        os.makedirs(CACHE, exist_ok=True)
        open(local, 'wb').write(_get('%s/avatar-manifest.json' % HOST))
    return json.load(open(local, encoding='utf-8'))


def pick(items, ident, dimension):
    for item in items:
        if item['id'] == ident:
            return item
    raise SystemExit('unknown %s: %r — options are %s'
                     % (dimension, ident, ', '.join(i['id'] for i in items)))


def compose(m, sel):
    d = m['dimensions']
    background = pick(d['background'], sel['background'], 'background')
    face = pick(d['faceShape'], sel['face'], 'face')
    hair = pick(d['hairStyle'], sel['hair'], 'hair')
    expression = pick(d['expression'], sel['expression'], 'expression')
    skin = pick(d['skinTone'], sel['skin'], 'skin')
    hair_colour = pick(d['hairColor'], sel['hairColor'], 'hairColor')

    # the one compatibility rule the tool enforces
    if ('bearded' in (expression.get('tags') or [])
            and 'feminine' in (hair.get('tags') or [])):
        raise SystemExit('%s cannot wear %s: a bearded face set with feminine hair'
                         % (expression['id'], hair['id']))

    g = hair['geometry'][face['hairGeometry']]
    underlay = (g.get('underlayByFace') or {}).get(face['id']) or g.get('underlay')
    overlay = (g.get('overlayByFace') or {}).get(face['id']) or g.get('overlay')
    join = (g.get('frontJoinByFace') or {}).get(face['id'])
    override = (g.get('frontOverrideByFace') or {}).get(face['id']) or g.get('frontOverride')
    front = g.get('frontRemainder') if join else (override or g.get('front'))

    layers = [
        inner(background['asset']),
        (inner(underlay) if underlay else '')
        + inner(g['rear'])
        + (inner(overlay) if overlay else ''),
        inner(face['asset']),
        (inner(front) if front else '') + (inner(join) if join else ''),
        inner(expression['assetsByFace'][face['id']]),
    ]
    body = ''.join('<g data-layer="%s">%s</g>' % (name, layer)
                   for name, layer in zip(m['layerOrder'], layers))
    c = m['canvas']
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" '
            'viewBox="0 0 %d %d" style="--avatar-skin:%s;--avatar-hair:%s">%s</svg>\n'
            % (c['width'], c['height'], c['width'], c['height'],
               skin['value'], hair_colour['value'], body))


# The composed SVG is ~5 MB: its background layer carries a 2048² PNG inline,
# which is right for a design tool and wrong for a 22px avatar in a chat row.
# So the SVG is the source and the PNG is what ships — rendered by the same
# engine the composer itself runs in, at 4× the largest size the page uses
# (48px in `.ochat__ava`), which is what keeps it sharp on a 2× screen.
RASTER = 192


def rasterise(svg_path, png_path, size=RASTER):
    """Chromium headless. It is the renderer the composer uses, so what lands
    here is what the tool shows — a second SVG engine would be a second
    opinion about `var()` inside a component."""
    work = tempfile.mkdtemp()
    try:
        shutil.copy(svg_path, os.path.join(work, 'a.svg'))
        with open(os.path.join(work, 'i.html'), 'w', encoding='utf-8') as f:
            f.write('<!doctype html><meta charset=utf-8>'
                    '<style>html,body{margin:0}img{display:block;width:%dpx;height:%dpx}'
                    '</style><img src="a.svg">' % (size, size))
        subprocess.run(
            ['chromium', '--headless', '--disable-gpu', '--no-sandbox',
             '--hide-scrollbars', '--force-device-scale-factor=1',
             '--window-size=%d,%d' % (size, size),
             '--screenshot=' + os.path.join(work, 'o.png'),
             os.path.join(work, 'i.html')],
            check=True, capture_output=True, timeout=180)
        from PIL import Image
        im = Image.open(os.path.join(work, 'o.png')).convert('RGB')
        im.save(png_path, optimize=True)
        return im.size
    finally:
        shutil.rmtree(work, ignore_errors=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--list', action='store_true', help='print every dimension')
    ap.add_argument('--svg', action='store_true', help='also keep the source SVG')
    args = ap.parse_args()
    m = manifest()

    if args.list:
        for key, items in m['dimensions'].items():
            print('%s (%d)' % (key, len(items)))
            for i in items:
                tags = (' [%s]' % ','.join(i['tags'])) if i.get('tags') else ''
                print('    %-22s %s%s' % (i['id'], i['label'], tags))
        return 0

    os.makedirs(OUT, exist_ok=True)
    for name, sel in ROSTER.items():
        svg = compose(m, sel)
        work = tempfile.mkdtemp()
        svg_path = os.path.join(work, name + '.svg')
        with open(svg_path, 'w', encoding='utf-8') as f:
            f.write(svg)
        png = os.path.join(OUT, name + '.png')
        rasterise(svg_path, png)
        if args.svg:
            shutil.copy(svg_path, os.path.join(OUT, name + '.svg'))
        shutil.rmtree(work, ignore_errors=True)
        print('%-12s %-64s %5.1f KB' % (name, ' / '.join(sel.values()),
                                        os.path.getsize(png) / 1024))
    return 0


if __name__ == '__main__':
    sys.exit(main())
