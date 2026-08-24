#!/usr/bin/env python3
"""Structural balance check for site/index.html.

Exists because a regex edit consumed a nested `</div>` from inside a product
mock and left an orphan behind. The orphan closed `.versus` early, so one
comparison card's text escaped the grid and spanned the whole page. Nothing
in the visual gate caught it: axe passed, the border audit passed, the
breakpoint sweep passed, and the screenshot I took was cropped above the
damage.

Run this after ANY scripted edit to the markup.
"""
import re, sys

VOID = {'img','br','hr','meta','link','input','source','area','col','embed',
        'track','wbr','path','circle','rect','use','line','polygon','ellipse','stop'}

def check(path):
    s = open(path, encoding='utf-8').read()
    tok = re.compile(r'<(/?)([a-zA-Z][\w-]*)([^>]*?)(/?)>')
    stack, errs = [], []
    for m in tok.finditer(s):
        close, name, _, selfc = m.group(1), m.group(2).lower(), m.group(3), m.group(4)
        if name in VOID or selfc == '/':
            continue
        if not close:
            stack.append((name, m.start()))
        elif not stack:
            errs.append(f'stray </{name}> at line {s[:m.start()].count(chr(10))+1}')
        else:
            top, pos = stack.pop()
            if top != name:
                errs.append(f'line {s[:m.start()].count(chr(10))+1}: </{name}> '
                            f'closes <{top}> opened on line {s[:pos].count(chr(10))+1}')
                stack.append((top, pos))
    for name, pos in stack:
        errs.append(f'<{name}> never closed (line {s[:pos].count(chr(10))+1})')
    return errs

if __name__ == '__main__':
    path = sys.argv[1] if len(sys.argv) > 1 else 'site/index.html'
    errs = check(path)
    if errs:
        print(f'{path}: {len(errs)} structural problem(s)')
        for e in errs[:20]:
            print('  ', e)
        sys.exit(1)
    print(f'{path}: balanced')
