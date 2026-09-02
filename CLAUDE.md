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

- **There is exactly one review URL and it is
  https://tongx-blip.github.io/VM0-Website/.** Before answering any visual
  feedback, check the reviewer is on it — `document.documentElement.dataset.build`
  in their console, or `curl <url> | grep data-build`, against
  `python3 tools/build-css.py` locally. Four rounds of feedback on the header's
  stroke were spent on two older slugs (`okou-ai-teammate-swiss`,
  `okou-ai-teammate-swiss-draft`) that never carried the property at all: every
  value looked identical from where it was being reviewed, so "heavier" kept
  coming back until the number was twice past the answer. **A screenshot is not
  evidence about this page until you know which build it is of.** Neither of
  those slugs can be published to from a different chat thread — `okou host
  versions okou-ai-teammate-swiss` 404s, and the draft resolves to a suffixed
  alias — so they cannot be fixed, only retired by whoever owns them.

- **Never hand someone an `okou host` URL as the thing to review.** A host slug
  belongs to the chat thread that created it, so a second thread asking for the
  same `--site` gets a *different* URL with a suffix. Three threads once meant
  three review links, each frozen at that thread's last publish — one of them
  three commits behind `main`, and production older than the asset stamping
  itself. `okou host ./site --site okou-ai-teammate-swiss-draft` is still fine
  for showing work mid-session; the acceptance link is the Pages URL above, and
  it is only current if you **pushed**.

  **And a slug you have handed out is a slug you now have to keep.** Publish it
  again in the same breath as every push, or it goes on showing the work as it
  was the day you sent the link. It cost a whole round: the avatar swap was live
  on Pages with 0 cubes while `okou-ai-teammate-swiss-draft-opx8` — the link
  handed out four rounds earlier in the same thread — still served 24 of them,
  and the feedback that came back was about those.

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
  libraries and **one webfont** — a 64 KB variable Roobert, self-hosted, built
  by `tools/build-fonts.py` (fontTools + brotli are a BUILD dependency, not a
  shipped one). There is no Google Fonts request.

## Conventions

- Every colour, size, radius, duration and easing comes from a token in
  `system.css` §1. A hard-coded value in a rule is a bug.
- Section labels: uppercase, text only, no numbers, above the heading.
- Surfaces: fill + shadow, never an outline.
- Anything scoped by section id (`#outputs .thing`) out-specifies state classes
  (`.thing.is-on`) — always add `:not(.is-on)`.
- **One typeface, three registers.** Headlines `--fd`, prose `--fb`, utility
  text `--fm` — all Roobert TRIAL. `--fm` is the same file on its `MONO:100`
  axis, so labels, data and captions are still monospaced and still align in a
  column; it is not a second family.
- **Controls are prose.** `--fb` 500, sentence case, `letter-spacing:normal`,
  `--t-meta` (`--t-sm` on `.btn--lg`). The utility register is mono **and**
  uppercase **and** tracked, and the three only work together: on a lowercase
  string a fixed advance spaces the word visibly unevenly. RULES S18.
