# Blueprint Grid — website template (agent operating guide)

> thin oversized UPPERCASE grotesque × Space-Mono body · faint 4-column vertical-rule grid overlay · bracketed mono micro-labels + 01-02 indices · editorial ↗ arrow link-rows with hairline dividers · sharp full-bleed navy/court-azure grounds · deep royal-cobalt accent

This is a **website-studio skin**: a fixed section grammar, fully restyled in this template's character.
You produce a page by authoring a **content PLAN** (JSON) and rendering it with the engine bundled here.
**You never hand-write HTML or CSS** — the skin owns all styling; you choose sections and fill content.

- **Motion personality:** kinetic  ·  **Fonts:** blueprint-grid
- **Full palette + per-section treatment:** read `skin-blueprint-grid.md`.
- **The designer's worked example:** open `example.html` — this is the look you are reproducing.

## Workflow

1. **Read the brief** and gather the real content.
2. **Compose the section list to fit the content** — choose which sections, in what order, and repeat
   any when it helps. Which sections and their order are yours to decide; each section's `args` shape
   and the skin's look are fixed.
   - Pick the sections the content calls for; never emit a placeholder-only one.
   - **No specific direction from the user → use each section in the core repertoire below at least once.**
   - `sample-plan.json` is a starting point (every section once, in the example's order), not a cage —
     add / drop / reorder / repeat from there.
3. **Render:** `node render.mjs plan.json out.html`. Rendering is deterministic and network-free:
   it never searches for, downloads, or generates images. Each `.media` slot keeps its semantic
   `data-photo` / `data-media` metadata for you, the authoring AI, to select and insert the image.
4. **Choose and insert every visible image yourself.** For each slot, select the most suitable source
   among user-supplied images, relevant images in the user's source or reference material, and
   AI-generated images. There is no fixed source order. User-supplied assets are recommended when
   they fit, but they are not mandatory. Insert the final asset directly into the rendered `.media`
   element. Do not use stock-photo or image-search APIs.
5. **Revise by editing `out.html` directly.** `render.mjs` is for the initial HTML generation only.
   After the first render, never rerun it for revisions. Rerendering replaces the generated HTML and
   removes images you already inserted. Make every later content, layout, styling, and image change
   in `out.html` itself.
6. **Ship `out.html`.**

## Plan shape

`nav`, `hero` and `footer` come from TOP-LEVEL fields — they are **not** entries in `sections[]`.
Putting `{"fn":"nav"}` in `sections[]` renders a second nav and breaks the page's landmarks.

```jsonc
{
  "title": "...", "desc": "...",           // <title> and meta description
  "brand": "BRAND",
  "navLinks": [ { "label": "...", "href": "#features" } ],
  "navCta":   { "label": "...", "href": "#contact" },
  "hero":     { /* see "Hero fields" below — this shape is SKIN-SPECIFIC */ },
  "sections": [ { "fn": "featureGrid", "id": "features", "args": { } } ],
  "footer":   { "brand": "...", "tagline": "...", "year": "2026",
                "columns": [ { "title": "...", "links": [ { "label": "...", "href": "#" } ] } ] }
}
```

Per section entry:

| key | meaning |
|-----|---------|
| `fn` | **required** — the section builder to call. Must be one of the names below, exactly. |
| `args` | the content for that section (table below). |
| `id` | optional — emits an anchor immediately before the section. **Every `#foo` in `navLinks` / `footer` must match one**, or the link goes nowhere. |
| `ground` | optional — `"dark"` floods the section ground in the skin's dark treatment. |
| `motion` | optional — overrides the default `reveal-up`; `false` disables the reveal. |

## Section contract (`fn` → `args`) — this template's core repertoire

These are the sections `example.html` / `sample-plan.json` use — the default set to cover at least
once when the brief gives no specific direction. Pick, reorder, and repeat them freely; more sections
are in **Also available** below.

| `fn` | args (optional in parens) | item / nested fields |
|------|---------------------------|----------------------|
| `gridEditorial` | `(eyebrow)`, `(title)`, `(ctas)`, `(photo)`, `(reverse)` | `body[]: paragraphs (plain strings)` |
| `logos` | `(label)`, `marquee: true` (recommended — the auto-scrolling wall) | `items[]: plain strings` |
| `featureSplit` | `heading`, `(ratio: even / media-wide / text-wide)` | `items[]: {icon, eyebrow, title, body, reverse}` |
| `featureGrid` | `(heading)`, `(sub)`, `(cols=3)`, `(layout: cards / bento)` | `items[]: {icon, title, body}` |
| `fixedShowcase` | `(label)`, `(hint)`, `(backdrop)` | `slides[]: {title, body, photo}` |
| `statsBand` | `(layout: band / reveal)`, `(eyebrow)`, `(heading)`, `(sub)` | `items[]: {value, label}` |
| `steps` | `(heading)` | `items[]: {title, body}` — **numbered automatically; do not number them yourself** |
| `indexTiles` | `(heading)`, `(sub)`, `(layout: grid / coverflow)` | `items[]: {title, caption, photo}` — **numbered automatically** — count: **≤4 or a multiple of 4** (4-col grid) |
| `cardGrid` | `(heading)`, `(sub)`, `(batch=6)`, `(layout: grid / rail)`, `(filters[]: {key,label})` | `cards[]: {cat, tag, meta, title, role, cta, photo}` |
| `testimonial` | `(heading)`, `(layout: cards / marquee / case)` | `quotes[]: {text, name, role, (company), (stat:{value,label}), (photo), (cta)}` |
| `pricing` | `(heading)`, `(sub)` | `plans[]: {tier, price, unit, features[], popular}` — exactly one `popular:true` |
| `faq` | `(heading)`, `(layout: list / split / two-col)` | `items[]: {q, a}` |
| `contactForm` | `(heading)`, `(sub)`, `(cta: a STRING label)` | — name / email / message are built in |
| `ctaBand` | `title`, `(sub)`, `cta: {label, href}` | — |

Where a **count** rule is shown, honour it: those sections use a fixed-column grid, so an off-count
(e.g. 4 items in a 3-column grid) strands the last row.

### This skin bends the engine — you get these for free

Do not write these into the plan; the skin applies them:

- content images **parallax** (speed 0.05, scale 1.2)

### Also available

The section library is shared and larger than this template's example. These also render correctly in
this skin and are worth reaching for when the content calls for it:
`stickyScroll` · `mosaicScroll` · `pinnedSplit` · `team` · `showcasePanels` · `statCards` · `spotlightShow` · `coverStack` · `photoScatter` · `arcShowcase` · `scrollStatement`

**Keep at least one structural section** (`gridEditorial`, `fixedShowcase`) — a page reduced to
plain grids and text loses this template's identity and reads as generic.

## Hero fields (this skin)

```
plan.hero = { wordmark, title, lead, dots, ctas }
```

Uses `dots[0]` only (falls back to "Keep scrolling"). `ctas` render as arrow rows, not buttons.

The hero is the one part of the plan with **no shared contract**: `renderPage` hands `plan.hero`
straight to this skin's own `heroHTML()`. A field not listed above is silently ignored.

## Footer — this template ships the **`plain`** shape

There is one `footer` builder with three shapes, and **you do not name the shape — it is inferred from
which fields you supply**:

| what the plan supplies | what you get |
|---|---|
| `brand` / `tagline` / `year` / `columns` only | **plain** — a link grid — brand + columns, no image |
| + `bgPhoto` and/or `statement` | **cover** — a full-bleed photo with a centred statement over it |
| + `layout:"panel"` or `promo` | **panel** — an oversized wordmark + a frosted CTA card over a rounded image |

**This template's `example.html` ships the `plain` footer (a link grid — brand + columns, no image), and
`sample-plan.json` already matches it.** So:

- **Don't add `bgPhoto` / `statement` / `promo` to the footer unless you mean to change its shape.**
  Adding one silently switches the whole footer and your page stops matching the example. There is no
  warning — the render succeeds and looks deliberate.
- In particular a `bgPhoto` here turns a clean link grid into a full-bleed photo footer.
- Conversely, **don't strip the fields `sample-plan.json` already has** — that switches the shape the
  other way.

## Rules — do not break these

- **Do not hand-author the initial layout HTML or CSS.** Use the template and `render.mjs` for the
  first render. After that, make every revision directly in `out.html`; never rerun the renderer.
- **`photo` / `media` / `bgPhoto` fields take a SEMANTIC IMAGE BRIEF**, such as
  `"sunlit yoga studio with plants"`, not a URL, image bytes, provider, or model name. Write concrete
  nouns: subject + setting + light + mood. Use the brief yourself to choose or generate and insert
  the final asset.
- **Write real, specific copy — never lorem ipsum.** Any section may get 2 items or 12; don't assume.
- **Keep the palette and per-section treatment as-is** — that is the template's identity.

## Images

`render.mjs` is intentionally model-agnostic and performs no image lookup, image generation,
network, or provider calls. You, the authoring AI, must choose the most suitable asset for each
`.media` element from user-supplied images, relevant images in the user's source or reference
material, or AI-generated images, then insert it directly yourself. There is no fixed source order;
user-supplied assets are recommended when they fit, but they are not mandatory. Preserve the slot's
classes, metadata, accessible label, and any nested controls when inserting the final image.
Image-generation model and provider instructions come from the prompt you receive and must never be
hard-coded in this bundle.

## What's in this bundle

```
SKILL.md            this file
template.json       machine-readable metadata
sample-plan.json    the starting plan — mirrors example.html
example.html        the designer's worked example (copied from source, never regenerated)
skin-blueprint-grid.mjsthe skin: palette, fonts, and the restyle of every section
skin-blueprint-grid.mdthe skin spec — palette + per-section treatment, in prose
render.mjs          the network-free entry point: plan.json -> out.html
engine/             the render engine + shared section library
```

The visual gate (`qa-site.mjs`) needs a browser and lives in the source repo, not this bundle.
