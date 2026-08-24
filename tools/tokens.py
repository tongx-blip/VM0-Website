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
    r'\.(vsui|lane|arti|tsh|hub|absui|slackui|flowui|perms|okoui|appui|tplwin|tpl|step|mock|shot|acard|a2a)'
    r'(?:__|--|\b)'
)

HEX = re.compile(r'#[0-9A-Fa-f]{3,8}\b')
RGB = re.compile(r'\brgba?\(\s*[\d.]+[\s,]')          # a literal channel, not rgb(var(--x) / a)
TIME = re.compile(r'(?<![\w-])\d*\.?\d+m?s\b')
EASE = re.compile(r'cubic-bezier\(')
RADIUS = re.compile(r'border-radius\s*:\s*([^;}]+)')


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

        if EASE.search(line):
            findings.append((n + 1, 'raw easing', selector, stripped[:88]))

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

    return findings


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
    print(f'\nTOTAL: {total}')
    return 0 if total == 0 else 1


if __name__ == '__main__':
    sys.exit(main())
