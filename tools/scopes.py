#!/usr/bin/env python3
"""Two `var`s with the same name in the same function scope.

`site/app.js` is a single IIFE, and `var` is function-scoped — not
block-scoped. A `var rail` inside `if (wrap) { ... }` and another `var rail`
four hundred lines later are THE SAME VARIABLE. The second assignment
silently steals the first one's value.

That is not hypothetical. It shipped: the testimonial rail's controller
declared `var rail = doc.querySelector('.proof')` and took over the
variable the tab reel holds its strip in. The reel's init had already run,
so it looked correct and then stopped — every later markSlot/centreSlot
addressed the six testimonial cards instead of the twenty-one tabs. The
panes and aria-selected kept advancing because they do not touch `rail`,
so the section auto-played with a highlight that never moved. No visual
check and no accessibility check can see that.

Run:  python3 tools/scopes.py
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'site' / 'app.js'

FUNC = re.compile(r'\bfunction\b|=>')
VAR = re.compile(r'\bvar\s+([A-Za-z_$][\w$]*)')


def strip_noise(js: str) -> str:
    """Blank comments and string bodies, preserving length and newlines."""
    out = []
    i, n = 0, len(js)
    while i < n:
        c = js[i]
        if js.startswith('//', i):
            j = js.find('\n', i)
            j = n if j == -1 else j
            out.append(' ' * (j - i)); i = j
        elif js.startswith('/*', i):
            j = js.find('*/', i + 2)
            j = n if j == -1 else j + 2
            out.append(''.join('\n' if ch == '\n' else ' ' for ch in js[i:j])); i = j
        elif c in '"\'`':
            q, j = c, i + 1
            while j < n and js[j] != q:
                j += 2 if js[j] == '\\' else 1
            j = min(j + 1, n)
            out.append(' ' * (j - i)); i = j
        else:
            out.append(c); i += 1
    return ''.join(out)


def scan(js: str):
    """Walk the source assigning every `var` to its enclosing function scope."""
    scope_stack = [0]        # ids of the function scopes we are inside
    next_id = 1
    brace_owner = []         # for each open brace, the scope it opened (or None)
    pending_func = False
    found = {}               # (scope_id, name) -> [lines]

    i, n, line = 0, len(js), 1
    while i < n:
        c = js[i]
        if c == '\n':
            line += 1
            i += 1
            continue
        if js.startswith('=>', i):
            pending_func = True
            i += 2
            continue
        if js.startswith('function', i) and not (js[i - 1:i].isalnum() if i else False):
            pending_func = True
            i += 8
            continue
        if c == '{':
            if pending_func:
                scope_stack.append(next_id)
                brace_owner.append(next_id)
                next_id += 1
                pending_func = False
            else:
                brace_owner.append(None)
            i += 1
            continue
        if c == '}':
            if brace_owner:
                owner = brace_owner.pop()
                if owner is not None and scope_stack and scope_stack[-1] == owner:
                    scope_stack.pop()
            i += 1
            continue
        m = VAR.match(js, i)
        if m:
            found.setdefault((scope_stack[-1], m.group(1)), []).append(line)
            i = m.end()
            continue
        i += 1
    return found


def main():
    if not SRC.exists():
        print(f'{SRC} not found')
        return 1
    found = scan(strip_noise(SRC.read_text(encoding='utf-8')))
    clashes = {k: v for k, v in found.items() if len(v) > 1}
    print(f'=== {SRC.relative_to(ROOT)}: {len(clashes)} name(s) declared twice '
          f'in one function scope')
    for (scope, name), lines in sorted(clashes.items(), key=lambda x: x[1][0]):
        print(f'  var {name:<14} scope #{scope:<3} lines {lines}')
    if clashes:
        print('\n  Two `var`s of one name in one function scope are ONE variable.')
    return 0 if not clashes else 1


if __name__ == '__main__':
    sys.exit(main())
