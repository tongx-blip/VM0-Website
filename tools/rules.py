#!/usr/bin/env python3
"""Keep the rule index honest.

`docs/RULES.md` is the index — every rule, one line, with a pointer to the gate
that checks it. An index is only worth reading if its pointers resolve, and
three of them did not: RULES sent you to `QA §4w`, `§4y` and `§4z` for nine
rules, and none of those sections existed. Two more (`§4o`, `§4p`) pointed at a
heading that had been used twice, so the pointer was ambiguous rather than
wrong, which is worse.

None of that is visible by reading either file on its own. So:

    python3 tools/rules.py        # 0 = the index agrees with the gate

Checks, in order of how badly each one bit:
  1. every `QA §…` pointer in RULES.md resolves to a heading in qa-checklist.md
  2. no heading id is used twice in qa-checklist.md
  3. no rule id is used twice in RULES.md
  4. every audit.js block a gate section names actually exists
  5. (warning) gate sections written as `###` are invisible to checks 1-2

Check 5 exists because check 1 only ever read `##`. Three sections were
written a level down: `4aa`, which no rule pointed at and which would have
failed the moment one did, and `4y` / `4z`, which REUSE ids already taken by
`##` sections. Nine rules point at those two, so each pointer resolves to one
of two different sections — the ambiguity this file's own docstring calls
worse than a dangling pointer. Reported, not failed: re-pointing nine rules is
a judgement about what each one meant, not a lint fix.
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RULES = ROOT / 'docs' / 'RULES.md'
GATE = ROOT / 'docs' / 'qa-checklist.md'
AUDIT = ROOT / 'tools' / 'audit.js'

# The pointer cell is prose (`QA §1, §4s`), so take every `§token` in it rather
# than assuming one per row. A BARE `§n` means the QA gate; a pointer into
# another doc names the doc first. C4 said `§15` and meant design-system's,
# which read as a dangling gate pointer for as long as the index existed — so
# the named ones are removed before the bare ones are collected.
#
# Do not try to express "bare" as a lookbehind. `(?<!\w )` also excludes
# `QA §4s`, which is every real pointer in the file, and the check then passes
# by matching nothing at all — it reported "all pointers resolve" while looking
# at none of them.
CROSS_DOC = re.compile(r'\b(?:design-system|design-principles|motion|changelog|RULES)\s*§\s*[0-9][0-9a-z]*')
POINTER = re.compile(r'§\s*([0-9][0-9a-z]*)')
# `| F23 | **…` — a rule id is the first cell of a table row.
# re.M matters: `findall` without it only tries position 0, so the duplicate-id
# check silently passed on every run — a linter that cannot fail is not a linter.
RULE_ID = re.compile(r'^\|\s*([A-Z][0-9]+)\s*\|', re.M)
HEADING = re.compile(r'^##\s+([0-9][0-9a-z]*)\.\s', re.M)
# the same ids one level down, which checks 1-2 cannot see
SUBHEADING = re.compile(r'^###\s+([0-9][0-9a-z]*)\.\s', re.M)
BLOCK = re.compile(r'^/\* ──\s*(\d+)\.', re.M)


def main() -> int:
    rules = RULES.read_text(encoding='utf-8')
    gate = GATE.read_text(encoding='utf-8')
    audit = AUDIT.read_text(encoding='utf-8')

    headings = HEADING.findall(gate)
    known = set(headings)
    blocks = set(BLOCK.findall(audit))
    bad = []

    # 1. pointers resolve. Only look at the last cell of a rule row: a rule's
    #    "why" column quotes CSS and prose that can contain a § of its own.
    for line in rules.splitlines():
        m = RULE_ID.match(line)
        if not m:
            continue
        cells = [c.strip() for c in line.split('|')]
        cell = CROSS_DOC.sub('', cells[-2] if len(cells) > 2 else '')
        for target in POINTER.findall(cell):
            if target not in known:
                bad.append('%s points at QA §%s, which does not exist' % (m.group(1), target))

    # 2. and 3. no id is claimed twice
    for label, ids in (('qa-checklist heading', headings),
                       ('RULES id', RULE_ID.findall(rules))):
        seen, dupes = set(), []
        for i in ids:
            (dupes.append(i) if i in seen else seen.add(i))
        for d in sorted(set(dupes)):
            bad.append('%s §%s is used twice — the pointer to it is ambiguous' % (label, d))

    # 4. a gate that names an audit block must name one that is there
    for target in set(re.findall(r'audit\.js\s*§(\d+)', gate)):
        if target not in blocks:
            bad.append('qa-checklist names audit.js §%s, which does not exist' % target)

    # 5. sections a level down are invisible to 1-2 (warning, not a failure)
    subs = SUBHEADING.findall(gate)
    warn = []
    for sid in sorted(set(subs)):
        if sid in known:
            warn.append('QA §%s exists as BOTH `##` and `###` — every pointer '
                        'to it resolves to one of two sections' % sid)
        else:
            warn.append('QA §%s is written as `###`, so no rule can point at it'
                        % sid)

    n = len(RULE_ID.findall(rules))
    for w in warn:
        print('    warning: ' + w)
    if bad:
        print('=== rule index: %d problem(s)' % len(bad))
        for b in bad:
            print('  ' + b)
        return 1
    print('=== rule index: %d rules, %d gate sections, %d audit blocks — all pointers resolve'
          % (n, len(headings), len(blocks)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
