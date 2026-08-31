#!/usr/bin/env python3
"""Two declarations of the same name in the same function scope.

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

**Named function declarations count too, and they bite harder.** This file is
not in strict mode, so a `function paint()` inside `if (ctrl) { … }` is copied
out to the enclosing function scope when its block runs (Annex B). Two blocks
that each declare a `function paint` therefore share one binding, and the one
whose block ran LAST owns it — including for the listeners the first block
already registered. That shipped once: the #control stepper and the hero fold
both declared `paint`, the fold's scroll handler resolved to the stepper's
`paint(i)`, and the hero simply never folded while every check passed.

A `var` collision steals a value. A `function` collision steals behaviour, and
it does it across two features that have nothing to do with each other.

Run:  python3 tools/scopes.py
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'site' / 'app.js'

FUNC = re.compile(r'\bfunction\b|=>')
# `var a = 1, b = 2;` declares BOTH. Matching only the first name is how a
# shared `ticking` got past this check and stopped the hero folding: the
# ladder's scroll handler set the flag first on every event and the fold's
# handler read it as "already scheduled" and returned, forever.
VAR = re.compile(r'\bvar\s+([A-Za-z_$][\w$]*)')
VAR_MORE = re.compile(r'\s*,\s*([A-Za-z_$][\w$]*)')
# `function name(` — a DECLARATION. An anonymous `function (` and a function
# expression assigned to something already counted are not declarations and do
# not create a binding in the enclosing scope.
FUNC_DECL = re.compile(r'\bfunction\s+([A-Za-z_$][\w$]*)\s*\(')


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
            # a NAMED declaration also creates a binding in the scope it is
            # written in — record it before descending into its own body
            d = FUNC_DECL.match(js, i)
            if d:
                found.setdefault((scope_stack[-1], d.group(1)), []).append(line)
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
            # walk the rest of the declarator list. Stop at the `;` or at a
            # `,` that belongs to something else — an initialiser can contain
            # commas of its own, so only a comma at depth 0 continues the list.
            depth, j = 0, i
            while j < n:
                ch = js[j]
                if ch in '([{':
                    depth += 1
                elif ch in ')]}':
                    if depth == 0:
                        break
                    depth -= 1
                elif ch == ';' and depth == 0:
                    break
                elif ch == '\n':
                    line += 1
                elif ch == ',' and depth == 0:
                    nxt = VAR_MORE.match(js, j)
                    if nxt:
                        found.setdefault((scope_stack[-1], nxt.group(1)), []).append(line)
                        j = nxt.end()
                        continue
                j += 1
            i = j
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
        print(f'  {name:<18} scope #{scope:<3} lines {lines}')
    if clashes:
        print('\n  Two declarations of one name in one function scope are ONE\n'
              '  binding — for `var` and, in sloppy mode, for `function` too.')
    return 0 if not clashes else 1


if __name__ == '__main__':
    sys.exit(main())
