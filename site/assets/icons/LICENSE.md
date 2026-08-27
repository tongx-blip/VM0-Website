# Third-party artwork vendored here

**emoji-2705.svg** — “white heavy check mark”, from **Twemoji**
(https://github.com/jdecked/twemoji). Graphics licensed **CC-BY 4.0**:
https://creativecommons.org/licenses/by/4.0/ — © Twitter, Inc and other
contributors.

Vendored rather than loaded from a CDN, and vendored rather than typed as a
font glyph: an emoji character renders as a different picture on every
operating system, which is the opposite of high fidelity for a component
whose job is to look like a screenshot of Slack. See `docs/RULES.md` T6 —
the page still contains no emoji *glyphs*.

The send mark inside the composer is **Phosphor Icons** `paper-plane-tilt`
(fill weight), **MIT** — https://github.com/phosphor-icons/core. It is
inlined rather than vendored because it has to inherit `currentColor`.
