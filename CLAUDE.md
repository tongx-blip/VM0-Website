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
     It also stamps the `?r=<hash>` on the asset links; publishing without it
     ships stale CSS to anyone who has visited before.
3. **Look at it in a browser.** Serve `site/` and take screenshots at 1440 and
   390. A screenshot catches what a diff cannot.
4. **Run the gate** in `docs/qa-checklist.md`. Not a subset of it. The cheap
   half is four commands — `tools/tokens.py`, `tools/check-html.py`,
   `tools/scopes.py`, `tools/rules.py` — and `tools/audit.js` §1–§7 in the
   browser. Run §7 (the attention budget) **before** restyling anything
   anyone has called heavy; "太重了" is a number, not a taste argument.
5. **Push to `main`. That is what publishes.** Every push deploys `site/` to
   **https://tongx-blip.github.io/VM0-Website/** — the one URL work is accepted
   at. Rebase onto `origin/main` first; several threads work on this page at
   once and the branch is kept linear.
6. **Write it down.** Add a **dated** entry to `docs/changelog.md` — what changed
   and what was wrong. No version numbers anywhere: this page is revised
   continuously and a counter would only ever climb. If a mistake could
   plausibly repeat, add the check to `docs/qa-checklist.md` rather than a
   warning to prose.

## Hard rules

- **Never hand someone an `okou host` URL as the thing to review.** A host slug
  belongs to the chat thread that created it, so a second thread asking for the
  same `--site` gets a *different* URL with a suffix. Three threads once meant
  three review links, each frozen at that thread's last publish — one of them
  three commits behind `main`, and production older than the asset stamping
  itself. `okou host ./site --site okou-ai-teammate-swiss-draft` is still fine
  for showing work mid-session; the acceptance link is the Pages URL above, and
  it is only current if you **pushed**.

- **Never edit the production slug** (`okou-ai-teammate-swiss`). Clone it with
  `okou host clone` if you need to see what is live.
- **Never rewrite copy** while doing design work. Layout, order, type, colour and
  motion are yours; wording is not.
- **Adding a rule means adding it to `docs/RULES.md`** — one line, with the
  pointer to where it is argued and where it is checked. `tools/rules.py`
  fails if that pointer does not resolve. A rule that is only in a changelog
  entry gets re-litigated in three rounds' time.
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
