# Skin: `blueprint-grid`

Learned from **blueprint-gridclub.com** (a padel / sport-club brand, WordPress), re-expressed — source
branding, copy and assets are NOT carried; only the visual **language** is. Full live teardown in
`System Code/TEARDOWN-blueprint-grid.md`.

## Essence
An editorial **construction-drawing** system. THIN oversized **UPPERCASE grotesque** display set
against a **Space-Mono** body; a faint **4-column vertical-rule grid** drawn over the signature
blocks; bracketed mono micro-labels `[ like this ]` and `01–02` indices; editorial **↗ arrow
link-rows** with hairline dividers; **sharp** everything (radius 0); full-bleed alternation of
deep-navy slabs, court-azure accents and edge-bleed photos. Warm light-gray page + deep royal-cobalt
accent; dark mode flips to a navy page.

## Signature (what makes it unmistakable)
- thin oversized UPPERCASE grotesque × Space-Mono body (the core type tension);
- a **real 4-column construction grid** every element snaps to (see grid-editorial), not just a rule overlay;
- a **pinned FIXED-background slider** (see fixed-showcase) — the backdrop holds while the centre card advances;
- plain mono micro-labels + `01 – NN` indices; **bracketed** `[ … ]` labels only on the pinned corners;
- editorial **↗ arrow link-rows** (hero CTAs); big thin UPPERCASE grotesque link columns in the footer;
- sharp full-bleed navy / court-azure grounds; deep royal-cobalt accent, giant ghost wordmark on the CTA.

## STRUCTURAL sections this skin BROUGHT into the library (the layout, not just paint)
Promoted into `sections.mjs` (base layout in `SECTION_CSS`, painted by the skin) so the generator +
any skin can reuse them — this is the [[web-learn-structure-not-paint]] rule applied:
- **`gridEditorial`** — the signature **4-column construction grid**: eyebrow (col 1), giant heading
  spanning cols 1–3, Space-Mono body in *just* col 1 (safe inset), CTAs (col 1), image snapped to
  cols 3–4; visible column rules. `reverse` mirrors the image to cols 1–2. A NEW skeleton.
- **`fixedShowcase`** — a **pinned FIXED-background slider**: a sticky backdrop stays put while the
  centre card (`NN – total` index · thin title · photo · mono body) cross-fades on scroll + prev/next
  + dots; two bracketed labels pinned at the viewport edges. Degrades to a stacked list (no-JS /
  reduced-motion / mobile). JS = `FIXEDSHOW_JS`.

A REAL content page proving both (with real images) = `gen-blueprint-grid-demo.mjs` → `blueprint-grid-demo.html` →
`apply-photos.mjs` → gated full + `--site`, hosted.

## Colour → roles
| role | light | dark |
|---|---|---|
| bg | `#EBEBEB` warm gray | `#0B0F1E` navy |
| ink | `#0F1320` deep navy | `#EBEBEB` |
| accent | `#192B88` royal cobalt | `#6E8CFF` |
| support | `#0E142E` navy · `#3E6E9E` court-azure | — |
| slab ground | `--navy #0F1320` (fixed both themes) | `#070A16` |

## Fonts
- display: **Hanken Grotesk** (light neutral grotesque — free stand-in for the source's thin NeueHelvetica);
- body / labels / buttons / indices: **Space Mono** (the source's body face, exact).

## Levers
`--radius:0` (sharp) · `--container:var(--w-wide)` · tight gutter · grounds `dark` (navy slab).
`parallax:{speed:.05, scale:1.2}` (kinetic image parallax).

## Proof
`node build-skinsheet.mjs ../Skins/blueprint-grid/skin-blueprint-grid.mjs` → `skinsheet-blueprint-grid.html`, then
`node qa-site.mjs skinsheet-blueprint-grid.html` **and** `--site` — both **PASS** (4 breakpoints × 2 themes ·
landmarks · tap-target · links · contrast · type-floor · signature · motion · layout-variety).
All 15 sections restyled (20 instances incl. variants). Verified by eye in light + dark.

## Gate gotchas hit (codified)
- **Space Mono body must stay ≥16px** — mono reads large per-em, so trimming card/faq/hero-lead copy
  to .92–.96rem trips TYPE-FLOOR; keep body `p`/`.lead` at ≥1rem (labels/eyebrows/captions exempt).
- the 4-column grid + ghost-wordmark are `::before/::after` decoration (pointer-events:none, no text)
  → invisible to the contrast/effBg parser, safe to overlay on any ground.
- footer & CTA use a **fixed** navy ground with explicit light text (not role vars) so they stay legible
  in BOTH themes (accent-ink flips dark in dark mode).

## Fixes folded in (Tong, 2026-07-07 — these are template rules now, not one-off tweaks)
- **theme-toggle must be TRANSPARENT/outlined**, not `--surface`-filled. The base paints it
  `background:var(--surface);color:var(--ink)`; the footer flips `--ink` light for its navy ground but
  leaves `--surface` at the page light-gray → light-on-light = **invisible in light mode** (both the
  header AND footer toggle). Fix in the skin: `.theme-toggle{background:transparent;color:var(--ink);
  border:1px solid var(--border)}` so the icon+label ride the LOCAL ground colour in every context.
- **CTA is the CLOSING slab — it flows into the footer.** Both are navy; `main>.cta:last-child{
  padding-bottom:0}` removes the light page-gray strip so the two read as ONE continuous dark block.
- **ghost wordmark = the site's OWN brand, never a baked demo name.** Was hard-coded `content:"RALLYA"`.
  Now `content:attr(data-ghost)`; `ctaBand` emits `data-ghost` and the engine defaults it to `page.brand`.
