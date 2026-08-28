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
MOCK_SELECTORS = re.compile(
    r'\.(vsui|lane|arti|tsh|hub|absui|slackui|flowui|flowchat|flowsave|flowlist'
    r'|okoui|ochat|ochip|ostage|oresult|appui|tplwin|tpl|step|mock|shot|slk'
    r'|acard|a2a|wfo|wfsc|par|pbox|unlock|pgrant|cbro|state|okw)'
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

    missing = undefined_refs([ROOT / 'src/css/base.css', ROOT / 'src/css/system.css'])
    print(f'\n=== var() references with no declaration: {len(missing)}')
    for name, (f, line) in missing:
        print(f'  {f}:{line}  var({name})')
    total += len(missing)

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
