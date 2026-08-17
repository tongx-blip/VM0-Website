# Working in this repo

Read `docs/design-principles.md` before changing anything visual. It is short,
and every rule in it comes from a decision that has already been argued once.

## Order of operations

1. **Read** `docs/design-principles.md`, then the relevant part of
   `docs/design-system.md`. Motion work also needs `docs/motion.md`.
2. **Edit the source, not the artifact.**
   - design → `src/css/system.css`
   - product-mock internals → `src/css/base.css`
   - structure → `site/index.html`
   - behaviour → `site/app.js`
   - `site/styles.css` is **generated** — run `python3 tools/build-css.py`.
3. **Look at it in a browser.** Serve `site/` and take screenshots at 1440 and
   390. A screenshot catches what a diff cannot.
4. **Run the gate** in `docs/qa-checklist.md`. Not a subset of it.
5. **Publish to the draft slug only**:
   `okou host ./site --site okou-ai-teammate-swiss-draft`
6. **Write it down.** Add an entry to `docs/changelog.md` — what changed and what
   was wrong. If a mistake could plausibly repeat, add the check to
   `docs/qa-checklist.md` rather than a warning to prose.

## Hard rules

- **Never edit the production slug** (`okou-ai-teammate-swiss`). Clone it with
  `okou host clone` if you need to see what is live.
- **Never rewrite copy** while doing design work. Layout, order, type, colour and
  motion are yours; wording is not.
- **Never add a new theme layer** on top of `system.css`. A new direction
  *replaces* the design layer. Five stacked layers is how the page ended up grey
  with its accent switched off — see `docs/changelog.md`.
- **No structural lines.** If a change needs a divider to read, the spacing or
  the grounds are wrong.
- **No new dependency** without a stated reason. The page ships zero JS
  libraries and three webfonts.

## Conventions

- Every colour, size, radius, duration and easing comes from a token in
  `system.css` §1. A hard-coded value in a rule is a bug.
- Section labels: uppercase, text only, no numbers, above the heading.
- Surfaces: fill + shadow, never an outline.
- Anything scoped by section id (`#outputs .thing`) out-specifies state classes
  (`.thing.is-on`) — always add `:not(.is-on)`.
- Utility text (labels, data, captions, controls) is IBM Plex Mono; prose is
  Instrument Sans; headlines are Archivo.
