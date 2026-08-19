#!/usr/bin/env python3
"""
Build site/styles.css from the two CSS sources, prune dead rules, and stamp
the asset links in index.html with a content hash.

    python3 tools/build-css.py

Why a build step at all: styles.css is two layers with a deliberate order.

  src/css/base.css    component-internal CSS — the product mocks (Okou app
                      window, Slack, permissions table, workflow stages). Edit
                      this only when a mock's own internals change.
  src/css/system.css  the authoritative design layer — colour roles, type
                      scale, grid, chrome, section rhythm, motion. Edit this
                      for anything that is a design decision.

system.css is concatenated last so it always wins. Never re-theme the page by
appending another layer on top: that is exactly how the pre-2026-08 stylesheet
ended up with five stacked themes fighting each other (see docs/changelog.md).

The prune pass keeps the shipped file honest — the old file carried ~18KB of
rules for markup that had been deleted years earlier. Classes that only ever
appear at runtime are whitelisted below.

The hash stamp exists because a hand-maintained `?r=NN` was left at 42 across
four deploys: browsers kept a cached stylesheet that predated a renamed block,
and that whole region rendered with no CSS at all. The hash is derived from the
file contents, so it cannot be forgotten.
"""
import hashlib
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML = os.path.join(ROOT, 'site', 'index.html')
JS = os.path.join(ROOT, 'site', 'app.js')
SOURCES = [os.path.join(ROOT, 'src', 'css', 'base.css'),
           os.path.join(ROOT, 'src', 'css', 'system.css')]
OUT = os.path.join(ROOT, 'site', 'styles.css')

# state classes and markup injected by app.js at runtime
RUNTIME = {
    'is-in', 'is-lit', 'is-on', 'is-out', 'is-active', 'is-stuck', 'is-open',
    'is-hidden', 'is-swapping', 'is-new', 'is-run', 'is-done', 'is-next',
    'mark', 'mark--tan', 'mark--pink', 'mark--purple', 'mark--red',
    'mark--green', 'inline-ic', 'line', 'rot', 'reveal', 'panel', 'hero',
}


def markup_classes():
    html = open(HTML, encoding='utf-8').read()
    js = open(JS, encoding='utf-8').read()
    found = set()
    for attr in re.findall(r'class="([^"]+)"', html):
        found.update(attr.split())
    # class names built inside JS string literals
    found.update(re.findall(
        r"[\"'`]([a-z][a-z0-9_-]*(?:__[a-z0-9-]+)?(?:--[a-z0-9-]+)?)[\"'`]", js))
    return found | RUNTIME


def split_rules(css):
    """Yield (selector, body, whole) for each top-level block."""
    out, i, depth, start, sel_end = [], 0, 0, 0, 0
    while i < len(css):
        ch = css[i]
        if ch == '{':
            if depth == 0:
                sel_end = i
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                out.append((css[start:sel_end], css[sel_end + 1:i], css[start:i + 1]))
                start = i + 1
        i += 1
    if start < len(css):
        out.append((None, None, css[start:]))
    return out


COMMENT = re.compile(r'/\*.*?\*/', re.S)


def split_head(selector):
    """Separate the comments that sit above a rule from the selector itself.

    `split_rules` hands back everything between `}` and the next `{`, which
    includes any preceding comment. That matters: a comment containing a dot
    (`app.js`, `0.5px`, `--wf-h: 498px.`) reads as a class name to the pruner,
    and a comment containing a comma gets split into "selectors" that are then
    re-joined without it. That silently rewrote a comment into live CSS once and
    swallowed the rule underneath it — see docs/changelog.md.
    """
    last = None
    for m in COMMENT.finditer(selector):
        last = m
    return (selector[:last.end()], selector[last.end():]) if last else ('', selector)


def selector_used(selector, classes):
    used = re.findall(r'\.(-?[_a-zA-Z][\w-]*)', selector)
    return True if not used else any(c in classes for c in used)


def prune(css, classes):
    kept = []
    for selector, body, whole in split_rules(css):
        if selector is None:                      # trailing comment / whitespace
            kept.append(whole)
            continue
        lead, real = split_head(selector)
        head = real.strip()
        if head.startswith('@'):
            if head.split()[0] in ('@media', '@supports'):
                inner = prune(body, classes)
                if inner.strip():
                    kept.append(selector + '{' + inner + '}')
            else:                                  # @keyframes, @font-face …
                kept.append(whole)
            continue
        parts = head.split(',')
        keep = [p for p in parts if selector_used(p, classes)]
        if not keep:
            continue
        if len(keep) != len(parts):
            kept.append(lead + ','.join(p.strip() for p in keep) + '{' + body + '}')
        else:
            kept.append(whole)
    return '\n'.join(kept)


def stamp(css_text):
    """Point index.html at the exact bytes it was built against."""
    html = open(HTML, encoding='utf-8').read()
    css_hash = hashlib.sha1(css_text.encode('utf-8')).hexdigest()[:8]
    js_hash = hashlib.sha1(open(JS, 'rb').read()).hexdigest()[:8]
    new = re.sub(r'styles\.css\?r=[0-9a-z]+', 'styles.css?r=' + css_hash, html)
    new = re.sub(r'app\.js\?r=[0-9a-z]+', 'app.js?r=' + js_hash, new)
    if new != html:
        open(HTML, 'w', encoding='utf-8').write(new)
    return css_hash, js_hash


def main():
    classes = markup_classes()
    raw = '\n'.join(open(p, encoding='utf-8').read() for p in SOURCES)
    out = prune(raw, classes)

    # A rule rebuilt from a mis-split selector leaves a comment's tail as live
    # CSS, which the browser then swallows along with the rule after it. Cheap
    # to detect, and it has shipped once.
    if out.count('/*') != out.count('*/'):
        raise SystemExit(
            'build aborted: %d `/*` vs %d `*/` in the output — a comment was '
            'cut in half by the prune pass' % (out.count('/*'), out.count('*/')))
    open(OUT, 'w', encoding='utf-8').write(out)
    css_hash, js_hash = stamp(out)
    print('sources %d KB -> site/styles.css %d KB (%d classes in markup)'
          % (len(raw) // 1024, len(out) // 1024, len(classes)))
    print('stamped  styles.css?r=%s  app.js?r=%s' % (css_hash, js_hash))


if __name__ == '__main__':
    sys.exit(main())
