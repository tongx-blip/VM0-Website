#!/usr/bin/env python3
"""Does the design layer actually use its own tokens?

The convention in CLAUDE.md is that every colour, radius, duration and
easing comes from a token in system.css 1. This checks it instead of
trusting it.

Three things are legitimately NOT tokens and are declared as exemptions
rather than quietly skipped:

  * the token block itself, which is where literals belong;
  * product mocks, which are pinned to values read out of the real product
    and must NOT follow the page's theme (P1) — they carry their own --p-*
    or --hub-* / --t-shell block and are listed below;
  * supplied-design components, whose numbers are the design's own and are
    written as `calc(<figma number> * var(--qu))` on purpose.

Run:  python3 tools/tokens.py
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# blocks whose literals are deliberate and documented
PINNED_PREFIXES = (
    '--p-', '--t-shell', '--t-dim', '--t-lit', '--t-caret',
    '--hub-tile', '--hub-line', '--hub-lit',
)
# selectors that draw a product surface: pinned by design, see P1
# `\b` does not fire after a BEM `__`, so .slackui__rail never matched and
# every third-party mock in base.css was reported as a token violation.
#
# AND IT DOES NOT FIRE BEFORE A PLURAL EITHER. `lane` cannot match `.lanes`
# or `.lanes__count`: the boundary needs a non-word character after `lane`
# and finds `s`. Same bug as the line above, one letter further along — the
# block a mock's own track and its count sit in was outside the exemption
# while every card inside it was in. A name is listed here, not a stem.
MOCK_SELECTORS = re.compile(
    r'\.(vsui|lanes|lane|arti|tsh|hub|absui|slackui|flowui|flowchat|flowsave|flowlist'
    r'|okoui|ochat|ochip|ocard|ostage|oresult|appui|tplwin|tpl|step|mock|shot|slk'
    r'|acard|a2a|wfo|wfsc|par|pbox|unlock|pgrant|cbro|state|okw'
    r'|pcard|perms|cpane|ctrl__who|ctrl__ava'
    # the third comparison card's figure: `wall`/`wchip` draw a WIRING
    # vocabulary that belongs to the alternative being compared (the same
    # argument as the terminal on card one), and `wsay` is the product's
    # own composer at the app's sizes. Both are pinned by P1, which is why
    # the connector hub they replaced was on this list too.
    r'|wall|wchip|wsay)'
    r'(?:__|--|\b)'
)

HEX = re.compile(r'#[0-9A-Fa-f]{3,8}\b')
RGB = re.compile(r'\brgba?\(\s*[\d.]+[\s,]')          # a literal channel, not rgb(var(--x) / a)
TIME = re.compile(r'(?<![\w-])\d*\.?\d+m?s\b')
EASE = re.compile(r'cubic-bezier\(')
RADIUS = re.compile(r'border-radius\s*:\s*([^;}]+)')
# An ABSOLUTE type size. `em` and `%` are relative and belong to whatever set
# them; a bare px is a number somebody typed, and 48 of them had collected in
# the design layer with nothing to catch them — which is also how a new
# component came to tokenise its radii and not its type.
FONTSIZE = re.compile(r'font-size\s*:\s*([^;}]+)')
# The two channels that do NOT swap with the theme (§1): --ink-rgb is the
# shadow-and-scrim channel and --paper-rgb its opposite. Used as a shadow they
# are correct — a shadow is dark in both modes. Used as VISIBLE PAINT they are
# a theme bug, and one that only shows up in the mode nobody screenshots: the
# index bar drew 1.09 in dark, the unlock popover had no edge at all, the four
# parallel bars ran on 1.01, and the testimonial rule sat at 1.04 under a
# comment claiming it "holds the same weight against the card on both
# grounds". Four occurrences of one mistake is a check, not a paragraph.
#
# --accent-rgb, --ok-rgb and --wait-rgb are semantic colours: green stays
# green, and they are meant to be painted.
PIN_CHANNEL = re.compile(r'var\(--(ink|paper)-rgb\)')
BG_PAINT = re.compile(r'\bbackground(-color)?\s*:\s*([^;}]+)')
RING = re.compile(r'0\s+0\s+0\s+[^,;}]*var\(--(ink|paper)-rgb\)')


def strip_comments(css: str) -> str:
    """Blank comments out, keeping length so line numbers survive."""
    out, i, n = [], 0, len(css)
    while i < n:
        if css.startswith('/*', i):
            j = css.find('*/', i + 2)
            j = n if j == -1 else j + 2
            out.append(''.join('\n' if c == '\n' else ' ' for c in css[i:j]))
            i = j
        else:
            out.append(css[i])
            i += 1
    return ''.join(out)


def token_block(css: str) -> range:
    """Line range of :root { ... } — literals in here are the point."""
    m = re.search(r':root\s*\{', css)
    if not m:
        return range(0)
    start = css[:m.start()].count('\n')
    depth, i = 0, m.end() - 1
    while i < len(css):
        if css[i] == '{':
            depth += 1
        elif css[i] == '}':
            depth -= 1
            if depth == 0:
                break
        i += 1
    return range(start, css[:i].count('\n') + 1)


def audit(path: Path):
    design_layer = path.name == 'system.css'
    raw = path.read_text(encoding='utf-8')
    css = strip_comments(raw)
    lines = css.split('\n')
    rootlines = token_block(css)

    # the selector each line belongs to, for the mock exemption
    selector, findings = '', []
    for n, line in enumerate(lines):
        if '{' in line and ':' not in line.split('{')[0]:
            selector = line.split('{')[0].strip() or selector
        if n in rootlines:
            continue
        stripped = line.strip()
        if not stripped or stripped.startswith('@'):
            continue

        prop = stripped.split(':')[0].strip()
        # ANY custom-property declaration is a token being DEFINED, wherever
        # it lives — the dark layer redeclares the whole palette outside
        # :root and the first version of this tool reported all 38 of them.
        if prop.startswith('--'):
            continue
        if prop.startswith(PINNED_PREFIXES):
            continue
        # a mask needs an opaque stencil; #000 there is not a colour
        if 'mask-image' in prop or 'mask' == prop:
            continue
        in_mock = bool(MOCK_SELECTORS.search(selector))

        for label, rx in (('hex colour', HEX), ('literal rgb', RGB)):
            for m in rx.finditer(line):
                if in_mock:
                    continue
                findings.append((n + 1, label, selector, stripped[:88]))
                break

        # A product mock's timing is copied out of the real product for the
        # same reason its colours are — .vsui's 2400ms / cubic-bezier(.33,0,.66,1)
        # IS the RunningIndicator. The mock exemption applied only to colour
        # and radius, so every mock's motion was reported as a violation.
        if EASE.search(line) and not in_mock:
            findings.append((n + 1, 'raw easing', selector, stripped[:88]))

        # `.01ms !important` is the reduced-motion kill switch, not a
        # duration — it means "effectively zero" and a token would obscure it
        if '.01ms' not in line and not in_mock:
            for m in TIME.finditer(line):
                if 'var(--' in line:
                    continue
                if any(k in line for k in ('transition', 'animation')):
                    findings.append((n + 1, 'raw duration', selector, stripped[:88]))
                    break

        m = RADIUS.search(line)
        if m and 'var(--' not in m.group(1) and not in_mock:
            if not re.fullmatch(r'\s*(0|50%|inherit|9999px|999px)\s*', m.group(1)):
                findings.append((n + 1, 'raw radius', selector, stripped[:88]))

        # A mock draws the app and keeps the APP's type scale (RULES P1), so
        # this only ever asks about the page's own chrome — and only in the
        # DESIGN layer. base.css is the mock-internals layer by definition
        # (CLAUDE.md), and almost every size in it is overridden by
        # system.css anyway, so linting it would be 49 lines of noise.
        m = FONTSIZE.search(line) if design_layer else None
        if m and 'var(--' not in m.group(1) and not in_mock:
            v = m.group(1).strip()
            if re.search(r'\d\s*px', v) and not v.startswith(('inherit', 'clamp')):
                findings.append((n + 1, 'raw type size', selector, stripped[:88]))

        # A mock's chrome is pinned on purpose (P1), and a gradient over a
        # painted ground is a scrim, which is what this channel is FOR.
        if not in_mock:
            m = BG_PAINT.search(line)
            if m and PIN_CHANNEL.search(m.group(2)) and 'gradient(' not in m.group(2):
                findings.append((n + 1, 'channel as fill', selector, stripped[:88]))
            # a zero-blur box-shadow is a ring, not a shadow
            if 'box-shadow' in line and RING.search(line):
                findings.append((n + 1, 'channel as ring', selector, stripped[:88]))

    return findings


STATE = re.compile(r'(:hover|:focus|:active|:focus-visible|\.is-[\w-]+)')


def shorthand_wipes_image(paths):
    """A state rule that says `background:` clears background-image.

    This is what made the testimonial cards' doodles vanish on hover: the
    design layer painted them with `background-image`, and a leftover
    `.quote:hover{ background:var(--paper-2) }` in the other layer reset the
    shorthand. Nothing in the visual gate can see it — the card looks
    correct until a pointer touches it.
    """
    base_imgs, state_bgs = set(), []
    for path in paths:
        css = strip_comments(path.read_text(encoding='utf-8'))
        for m in re.finditer(r'([^{}]+)\{([^{}]*)\}', css):
            sel = ' '.join(m.group(1).split())
            body = m.group(2)
            line = css[:m.start()].count('\n') + 1
            if re.search(r'background-image\s*:', body) or re.search(r'background\s*:[^;]*url\(', body):
                for one in sel.split(','):
                    base_imgs.add(STATE.sub('', one.strip()))
            if STATE.search(sel) and re.search(r'(?<![\w-])background\s*:', body):
                for one in sel.split(','):
                    state_bgs.append((path.name, line, one.strip()))
    out = []
    for name, line, sel in state_bgs:
        if STATE.sub('', sel) in base_imgs:
            out.append((name, line, sel))
    return out


def undefined_refs(paths):
    """A var(--x) with no --x declared anywhere.

    The dangerous half of this problem. A literal that should be a token is
    merely untidy; a token that does not exist makes the whole declaration
    invalid and the browser silently drops it. `animation:bob var(--t-drift)`
    with no --t-drift stopped the drift entirely, and nothing in the visual
    gate noticed because the element simply sat still.
    """
    declared, used = set(), {}
    for path in paths:
        css = strip_comments(path.read_text(encoding='utf-8'))
        for m in re.finditer(r'(--[\w-]+)\s*:', css):
            declared.add(m.group(1))
        # a var() WITH a fallback cannot break, so only bare ones matter
        for m in re.finditer(r'var\(\s*(--[\w-]+)\s*\)', css):
            used.setdefault(m.group(1), (path.name, css[:m.start()].count('\n') + 1))

    # per-element properties are set at runtime, not declared in the sheet:
    # app.js via setProperty, or an inline style attribute in the markup
    for extra in (ROOT / 'site' / 'app.js', ROOT / 'site' / 'index.html'):
        if not extra.exists():
            continue
        txt = extra.read_text(encoding='utf-8')
        for m in re.finditer(r"setProperty\(\s*['\"](--[\w-]+)", txt):
            declared.add(m.group(1))
        # EVERY custom property in the attribute, not the first one. The old
        # pattern was non-greedy from `style="`, so `style="--x:1%;--y:2%"`
        # declared --x and missed --y — and --y was then reported as an
        # undefined reference, which is a lint failing a correct page.
        for m in re.finditer(r'style="([^"]*)"', txt):
            for d in re.finditer(r'(--[\w-]+)\s*:', m.group(1)):
                declared.add(d.group(1))

    return sorted((name, where) for name, where in used.items() if name not in declared)


def dead_declarations(paths):
    """A declaration a later, identical selector always overrides.

    `.state`'s border-radius was set four times — pill, then 0, then --r-xs,
    then --r-btn. Only the last applied. Three dead declarations look like
    intent, and get read as intent by the next person to open the file.

    Compared only within ONE FILE, one media context, identical selector.
    Two exclusions matter, and the first version of this check got both
    wrong — it reported 472:

    * base.css -> system.css is the ARCHITECTURE. system.css is concatenated
      last precisely so it wins. Reporting those was reporting the design
      layer for doing its job.
    * `from`, `to`, `40%` are keyframe selectors. Different @keyframes reuse
      them by definition and never override one another.
    """
    seen = {}
    KEYFRAME_SEL = re.compile(r'(from|to|[\d.]+%)(\s*,\s*(from|to|[\d.]+%))*$')
    for path in paths:
        css = strip_comments(path.read_text(encoding='utf-8'))
        media, media_depth, depth, in_kf, kf_depth = '', None, 0, False, None
        for m in re.finditer(r'@[\w-]+[^{]*\{|([^{}]+)\{([^{}]*)\}|\}', css):
            tok = m.group(0)
            if tok.startswith('@'):
                if tok.startswith('@keyframes'):
                    in_kf, kf_depth = True, depth
                elif tok.startswith('@media'):
                    media, media_depth = ' '.join(tok[:-1].split()), depth
                depth += 1
                continue
            if tok == '}':
                depth -= 1
                if kf_depth is not None and depth == kf_depth:
                    in_kf, kf_depth = False, None
                if media_depth is not None and depth == media_depth:
                    media, media_depth = '', None
                continue
            sel = ' '.join((m.group(1) or '').split())
            if not sel or sel.startswith('@') or in_kf or KEYFRAME_SEL.match(sel):
                continue
            line = css[:m.start()].count('\n') + 1
            for d in (m.group(2) or '').split(';'):
                if ':' not in d:
                    continue
                prop = d.split(':')[0].strip()
                if not prop or prop.startswith('--'):
                    continue
                seen.setdefault((path.name, media, sel, prop), []).append(line)
    return {k: v for k, v in seen.items() if len(v) > 1}


SHORTHAND = {
    'margin':        ('margin-top', 'margin-right', 'margin-bottom', 'margin-left',
                      'margin-block', 'margin-inline'),
    'padding':       ('padding-top', 'padding-right', 'padding-bottom', 'padding-left',
                      'padding-block', 'padding-inline'),
    'border-radius': ('border-top-left-radius', 'border-top-right-radius',
                      'border-bottom-right-radius', 'border-bottom-left-radius'),
    'inset':         ('top', 'right', 'bottom', 'left'),
    'background':    ('background-color', 'background-image', 'background-position',
                      'background-size', 'background-repeat'),
    'border':        ('border-width', 'border-style', 'border-color'),
    'gap':           ('row-gap', 'column-gap'),
    'overflow':      ('overflow-x', 'overflow-y'),
    'flex':          ('flex-grow', 'flex-shrink', 'flex-basis'),
    'grid-template': ('grid-template-rows', 'grid-template-columns'),
    'font':          ('font-size', 'font-weight', 'font-family', 'line-height'),
}


def shorthand_eats_longhand(paths):
    """A longhand a LATER shorthand on the same selector silently resets.

    Three times in one day, in three different components:

      * `.okw__bar` restated `padding-left` above a block whose `padding`
        shorthand followed it — the connector card's lap inset never applied.
      * `.panel--lead-left > .section-body{margin-inline:0}` lost to
        `.panel > .section-body{margin-inline:auto}` (equal specificity, later
        position) and the heading went left while the lede stayed centred.
      * `.wfo__replyhd{margin-top:2.1em}` was reset to 0 by the `margin:0 0
        .35em` in the very next rule, so *"两段离着太近了"* stayed 7px after the
        fix that was supposed to make it 33.

    None of these is a specificity mistake, which is why reading the selectors
    does not find them: the two rules are IDENTICAL selectors and the later one
    simply wins. `dead_declarations` misses it because the property names
    differ. The fix is always the same — fold the value into the shorthand —
    and the check is cheap, so it lives here rather than in prose.
    """
    hits = []
    for path in paths:
        css = strip_comments(path.read_text(encoding='utf-8'))
        # (media, selector) -> {prop: [lines]}
        seen, media, media_depth, depth, in_kf, kf_depth = {}, '', None, 0, False, None
        for m in re.finditer(r'@[\w-]+[^{]*\{|([^{}]+)\{([^{}]*)\}|\}', css):
            tok = m.group(0)
            if tok.startswith('@'):
                if tok.startswith('@keyframes'):
                    in_kf, kf_depth = True, depth
                elif tok.startswith('@media'):
                    media, media_depth = ' '.join(tok[:-1].split()), depth
                depth += 1
                continue
            if tok == '}':
                depth -= 1
                if kf_depth is not None and depth == kf_depth:
                    in_kf, kf_depth = False, None
                if media_depth is not None and depth == media_depth:
                    media, media_depth = '', None
                continue
            sel = ' '.join((m.group(1) or '').split())
            if not sel or sel.startswith('@') or in_kf:
                continue
            line = css[:m.start()].count('\n') + 1
            for d in (m.group(2) or '').split(';'):
                if ':' not in d:
                    continue
                prop = d.split(':')[0].strip()
                if not prop or prop.startswith('--'):
                    continue
                seen.setdefault((media, sel), {}).setdefault(prop, []).append(line)
        for (media, sel), props in seen.items():
            for short, longs in SHORTHAND.items():
                if short not in props:
                    continue
                last_short = max(props[short])
                for lg in longs:
                    if lg not in props:
                        continue
                    dead = [n for n in props[lg] if n < last_short]
                    if dead:
                        hits.append((path.name, media, sel, lg, dead, last_short))
    return hits


def dark_themes_disagree(path):
    """The two dark palettes must declare the same values.

    There are two of them and there always will be: the OS's preference
    (`@media (prefers-color-scheme: dark)` on `:root:not([data-theme=light])`)
    and the toggle (`:root[data-theme="dark"]`). They are the SAME theme
    reached two ways, so any token one declares the other must declare
    identically.

    The brand palette landed in one of them and not the other, and nothing
    caught it: each block is internally consistent, each renders a plausible
    dark page, and no screenshot shows both. The page had a warm dark mode on
    a Mac set to dark and a cool one for anyone who pressed the button.
    """
    css = strip_comments(path.read_text(encoding='utf-8'))

    def declared(selector):
        out = {}
        for m in re.finditer(re.escape(selector) + r'\s*\{(.*?)\n?\s*\}', css, re.S):
            for d in re.finditer(r'(--[a-z0-9-]+)\s*:\s*([^;]+);', m.group(1)):
                out[d.group(1)] = ' '.join(d.group(2).split())
        return out

    auto = declared(':root:not([data-theme="light"])')
    toggle = declared(':root[data-theme="dark"]')
    return [(t, auto.get(t), toggle.get(t))
            for t in sorted(set(auto) | set(toggle))
            if auto.get(t) != toggle.get(t)]


def grid_height_without_rows(paths):
    """A sized grid whose row track is left implicit.

    `height` on a grid container is NOT a ceiling (RULES M5). An implicit row
    track is `auto`, so the tallest item pushes the container past the height
    it declared and `align-items:stretch` carries every sibling with it. It
    shipped twice in one afternoon: seven Outputs tabs came out 545 / 552 /
    574 as the artifact changed under them, and one level down the same fault
    put a composer 62px below its own window's bottom edge.

    The precondition is exact and lives in one rule, so it is worth catching
    here rather than by eye: a block that declares a definite `height` AND
    behaves as a grid AND never says `grid-template-rows`.

    `auto`, `100%`, `min-content` and friends are not definite — they cannot
    over-constrain anything. A single-row grid is the whole point of the
    check, so `grid-template-columns` alone still counts as grid behaviour.
    """
    DEFINITE = re.compile(r'^\s*(\d|calc\(|clamp\(|var\(|min\(|max\()')
    out = []
    for path in paths:
        css = strip_comments(path.read_text(encoding='utf-8'))
        for m in re.finditer(r'([^{}]+)\{([^{}]*)\}', css):
            sel = ' '.join((m.group(1) or '').split())
            body = m.group(2) or ''
            if not sel or sel.startswith('@'):
                continue
            decls = {}
            for d in body.split(';'):
                if ':' in d:
                    k, _, v = d.partition(':')
                    decls[k.strip()] = v.strip()
            if 'grid-template-rows' in decls:
                continue
            # A LAYOUT grid, not a centring one. `display:grid` with
            # `place-items:center` and a fixed 32px box is every icon tile on
            # the page — one small child that cannot overflow, and no
            # `stretch` cascade to carry the mistake sideways. Requiring a
            # column template with a flexible track cut this from 30
            # findings to the two that were real.
            cols = decls.get('grid-template-columns', '') or decls.get('grid-template', '')
            is_grid = bool(cols) and bool(re.search(r'fr\b|minmax\(|repeat\(', cols))
            h = decls.get('height', '')
            if is_grid and h and DEFINITE.match(h):
                line = css[:m.start()].count('\n') + 1
                out.append((path.name, line, sel[:44], h[:28]))
    return out


def main():
    total = 0
    for name in ('src/css/system.css', 'src/css/base.css'):
        path = ROOT / name
        found = audit(path)
        total += len(found)
        print(f'\n=== {name}: {len(found)} not using a token')
        for line, kind, sel, text in found[:40]:
            print(f'  {line:>5}  {kind:<13} {sel[:34]:<34} {text}')
        if len(found) > 40:
            print(f'  … and {len(found) - 40} more')
    paths = [ROOT / 'src/css/base.css', ROOT / 'src/css/system.css']
    wipes = shorthand_wipes_image(paths)
    print(f'\n=== state rules whose `background:` shorthand clears a '
          f'background-image: {len(wipes)}')
    for name, line, sel in wipes:
        print(f'  {name}:{line}  {sel}')
    total += len(wipes)

    grids = grid_height_without_rows(paths)
    print(f'\n=== sized grids with an implicit row track (RULES M5): {len(grids)}')
    for name, line, sel, h in grids:
        print(f'  {name}:{line}  {sel:<44} height:{h}')
    total += len(grids)

    drift = dark_themes_disagree(ROOT / 'src/css/system.css')
    print(f'\n=== tokens where the two dark themes disagree: {len(drift)}')
    for token, auto, toggle in drift:
        print(f'  {token:<16} prefers-color-scheme={auto}  data-theme={toggle}')
    total += len(drift)

    missing = undefined_refs([ROOT / 'src/css/base.css', ROOT / 'src/css/system.css'])
    print(f'\n=== var() references with no declaration: {len(missing)}')
    for name, (f, line) in missing:
        print(f'  {f}:{line}  var({name})')
    total += len(missing)

    eaten = shorthand_eats_longhand([ROOT / 'src/css/base.css', ROOT / 'src/css/system.css'])
    print(f'\n=== longhands reset by a later shorthand on the same selector: {len(eaten)}')
    for f0, media, sel, lg, dead_lines, short_line in eaten[:14]:
        m = f' @{media[:18]}' if media else ''
        print(f'  {f0}{m}  {sel[:32]:<32} {lg:<16} line(s) {dead_lines} < shorthand line {short_line}')
    total += len(eaten)

    dead = dead_declarations([ROOT / 'src/css/base.css', ROOT / 'src/css/system.css'])
    n_dead = sum(len(v) - 1 for v in dead.values())
    print(f'\n=== declarations overridden by an identical later selector: {n_dead}')
    for (f0, media, sel, prop), lines in sorted(dead.items(), key=lambda x: -len(x[1]))[:14]:
        m = f' @{media[:20]}' if media else ''
        print(f'  {f0}{m}  {sel[:34]:<34} {prop:<15} lines {lines}')
    total += n_dead

    print(f'\nTOTAL: {total}')
    return 0 if total == 0 else 1


if __name__ == '__main__':
    sys.exit(main())
