/* skin-xnrgy.mjs — a Website Studio skin learned from a padel/sport-club brand site
 * (xnrgyclub.com), re-expressed (source branding / copy / assets stripped — only the visual
 * LANGUAGE is carried). See TEARDOWN-xnrgy.md.
 *
 * ESSENCE — "xnrgy": an editorial CONSTRUCTION-DRAWING system. THIN oversized UPPERCASE
 * grotesque display set against a SPACE-MONO body; a faint 4-COLUMN vertical-rule grid drawn
 * over the signature blocks; bracketed mono micro-labels ( [like this] ) and 01-02 indices;
 * editorial ↗ arrow link-rows with hairline dividers; SHARP everything (radius 0); full-bleed
 * alternation of deep-navy slabs, court-azure grounds and edge-bleed photos. Warm light-gray
 * page + deep royal-cobalt accent; dark mode flips to a navy page.
 */
export const skin = {
  id:'blueprint-grid',
  fontsAttr:'blueprint-grid', motionAttr:'kinetic',
  parallax:{speed:0.05, scale:1.2},
  fontLink:'<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@200;300;400;500;600;700;800&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">',
  signature:'thin oversized UPPERCASE grotesque × Space-Mono body · faint 4-column vertical-rule grid overlay · bracketed mono micro-labels + 01-02 indices · editorial ↗ arrow link-rows with hairline dividers · sharp full-bleed navy/court-azure grounds · deep royal-cobalt accent',
  css:`
/* ① COLOURS — dual-mode, all 11 roles ---------------------------------------------------- */
/* neutrals are generic (not copyrightable); the LANGUAGE we keep is "warm light-gray editorial
 * page + deep-navy grounds + ONE deep cobalt accent + a court-azure support". */
:root{
  --bg:#EBEBEB; --ink:#0F1320; --ink-soft:#50566A;
  --accent:#192B88; --accent-ink:#FFFFFF;            /* deep royal cobalt (source CTA) */
  --support-1:#0E142E; --support-2:#3E6E9E;          /* navy · court-azure */
  --surface:#E2E2E0; --surface-2:#D7D7D4;
  --border:#C6C6C2; --ring:#192B88;
  --fd:'Hanken Grotesk'; --fb:'Space Mono';
  --radius:0; --container:var(--w-wide); --gutter:clamp(1.1rem,4vw,3.5rem);
  --navy:#0F1320; --court:#2F5E86;                    /* dark slab · court-azure band */
  --on-slab:#7FA8FF;                                  /* bright cobalt for text on navy */
  --rule:rgba(15,19,32,.14);                          /* the 4-column grid hairline (light) */
  --ge-rule:var(--rule); --fx-ground:var(--court);    /* grid-editorial rules · fixed-showcase ground */
}
html[data-theme="dark"]{
  --bg:#0B0F1E; --ink:#EBEBEB; --ink-soft:#9AA0B4;
  --accent:#6E8CFF; --accent-ink:#0A0E1E;            /* brighter cobalt clears AA on navy */
  --support-1:#C7D2F5; --support-2:#7FB0DC;
  --surface:#121729; --surface-2:#1A2038;
  --border:#2A3252; --ring:#6E8CFF;
  --navy:#070A16; --court:#284B6B; --on-slab:#9DB6FF;
  --rule:rgba(235,235,235,.12); --ge-rule:var(--rule); --fx-ground:var(--court);
}

/* shared chrome — the XNRGY voice: thin UPPERCASE grotesque heads × Space-Mono body ------- */
.display,h1,.h1,h2,.h2{font-family:var(--fd);text-transform:uppercase;font-weight:300}
.display{font-weight:300;letter-spacing:-.045em;line-height:.9}
h1,.h1{font-weight:300;letter-spacing:-.04em;line-height:.94}
h2,.h2{font-weight:300;letter-spacing:-.035em;line-height:.98}
h3,.h3{font-family:var(--fd);text-transform:uppercase;font-weight:500;letter-spacing:-.01em;line-height:1.06}
body{line-height:1.7}
p,.lead{font-family:var(--fb)}
.lead{color:var(--ink-soft);font-size:clamp(1rem,1.3vw,1.12rem);line-height:1.65;letter-spacing:-.01em}
.small,small{font-family:var(--fb)}
.muted{color:var(--ink-soft)}
strong{font-weight:700}
.mono{font-family:var(--fb)}
/* theme-toggle — TRANSPARENT/outlined so its icon+label always ride the LOCAL ground colour
 * (currentColor = --ink). Fixes the light-mode footer bug: the base painted it --surface bg (page
 * light) while the footer flips --ink to light → light-on-light = invisible. Transparent bg + a
 * currentColor icon + a hairline border is legible in BOTH themes, in BOTH the nav and the footer. */
.theme-toggle{border-radius:0;font-family:var(--fb);text-transform:uppercase;letter-spacing:.06em;
  font-size:.72rem;background:transparent;color:var(--ink);border:1px solid var(--border)}
.theme-toggle:hover{background:transparent;border-color:var(--ink)}
.theme-toggle svg{color:var(--ink)}

/* eyebrow → plain mono uppercase micro-label (like the source's "INTRODUCTION"); brackets are
 * reserved for the PINNED corner labels (.fx__label). ink-soft adapts to any ground. */
.eyebrow{font-family:var(--fb);font-weight:700;font-size:.72rem;letter-spacing:.16em;
  text-transform:uppercase;color:var(--ink-soft)}

/* buttons — sharp mono uppercase; filled cobalt + hairline ghost */
.btn{border-radius:0;font-family:var(--fb);font-weight:700;text-transform:uppercase;
  letter-spacing:.07em;font-size:.78rem;padding:.9rem 1.5rem}
.btn-primary{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}
.btn-ghost{background:transparent;color:var(--ink);border:1px solid var(--ink)}
.btn-primary:hover{background:var(--ink);border-color:var(--ink);color:#fff}
.btn-ghost:hover{background:var(--ink);color:var(--bg);border-color:var(--ink)}

/* the DARK SLAB ground (plans flood a section ground:'dark') — fixed navy in BOTH themes;
 * accent → bright cobalt; surfaces transparent (no alpha surfaces on a flooded ground). */
[data-ground="dark"]{--bg:var(--navy);--ink:#FFFFFF;--ink-soft:#9AA0B4;--surface:transparent;
  --surface-2:transparent;--border:rgba(255,255,255,.16);--accent:var(--on-slab);--accent-ink:#0A0E1E;
  --rule:rgba(255,255,255,.13);background:var(--navy);color:#fff}
[data-ground="dark"] .eyebrow{color:#9AA0B4}

/* NOTE: the 4-column vertical rules live ONLY on the page-level construction grid (grid-editorial),
 * where content actually snaps to them. No decorative column overlays elsewhere (they only hurt
 * reading) — per Tong, 2026-07-01. */

/* editorial ↗ arrow link-row (hairline-divider underline). Used by the hero CTA rows. */
.xn-arrow{position:relative;display:flex;align-items:center;justify-content:space-between;gap:1rem;
  font-family:var(--fb);font-weight:400;text-decoration:none;color:var(--ink);
  padding:.95rem 0;border-top:1px solid var(--border)}
.xn-arrow:last-child{border-bottom:1px solid var(--border)}
.xn-arrow::after{content:"↗";font-weight:700;transition:transform .25s ease}
.xn-arrow:hover{color:var(--accent)}
.xn-arrow:hover::after{transform:translate(3px,-3px)}

/* ===== the two STRUCTURAL sections this skin BRINGS (the LAYOUT it learned) =============== */

/* GRID-EDITORIAL — the 4-column construction grid. Giant thin uppercase heading spanning cols 1–3,
 * Space-Mono body in col 1 (safe inset), sharp image snapped to cols 3–4; visible column rules. */
.ge{padding-block:clamp(3.5rem,8vw,7rem)}
.ge__eyebrow{color:var(--ink-soft)}
.ge__title{font-family:var(--fd);text-transform:uppercase;font-weight:300;letter-spacing:-.04em;
  line-height:.94;font-size:clamp(2.6rem,7vw,5.5rem)}
.ge__body p{font-family:var(--fb);color:var(--ink);line-height:1.7}
.ge__media{border:1px solid var(--border);border-radius:0}

/* FIXED-SHOWCASE — court-azure fixed backdrop; the centre card is a sharp light panel; bracketed
 * pinned side labels; mono index NN-of-NN; thin uppercase title. */
.fx{--fx-ground:var(--court)}
.fx__label{font-family:var(--fb);letter-spacing:.02em;color:#fff}
.fx__label::before{content:"[";opacity:.7;margin-right:.35em}
.fx__label::after{content:"]";opacity:.7;margin-left:.35em}
.fx__card{background:#EBEBEB;color:#0F1320;border-radius:0}
.fx__ix{font-family:var(--fb);font-weight:700;color:#0F1320}
.fx__title{font-family:var(--fd);text-transform:uppercase;font-weight:400;letter-spacing:-.02em;
  font-size:clamp(1.5rem,3vw,2.1rem);color:#0F1320}
.fx__media{border:0;border-radius:0}
.fx__body{font-family:var(--fb);color:#3A3F52;font-size:1rem;line-height:1.6}
.fx__arrow{border-radius:0}

/* ===== the fixed 15, in the XNRGY character ============================================= */

/* 1 · NAV — page-gray bar, hairline base; letter-spaced wordmark; mono uppercase links */
.nav{background:var(--bg);border-bottom:1px solid var(--ink)}
.nav__bar{min-height:68px}
.nav__brand{font-family:var(--fd);font-weight:700;text-transform:uppercase;letter-spacing:.34em;
  font-size:1.1rem;padding-left:.34em}
.nav__links a{font-family:var(--fb);font-weight:400;text-transform:uppercase;letter-spacing:.06em;
  font-size:.76rem;color:var(--ink-soft)}
.nav__links a:hover{color:var(--ink)}
.nav__cta{padding:.7rem 1.15rem;font-size:.72rem}

/* 2 · HERO — bespoke below (heroHTML). Base hooks so the class exists. */
.hero{padding:0}

/* 3 · LOGOS — mono uppercase names, wide gaps, hairline band */
.logos{padding-block:clamp(2rem,4.5vw,3.2rem);border-block:1px solid var(--border)}
.logos__label{font-family:var(--fb);letter-spacing:.18em;text-transform:uppercase;
  color:var(--ink-soft);font-size:.72rem}
.logos__marquee,.logos__row{gap:clamp(2.4rem,6vw,5rem)}
.logos__item{font-family:var(--fd);font-weight:300;text-transform:uppercase;letter-spacing:-.02em;
  font-size:clamp(1.5rem,3.2vw,2.4rem);color:var(--ink);opacity:.85}

/* 4 · FEATURE-GRID — sharp hairline panels; mono /01 corner index; thin uppercase titles */
.fg .sec-head{margin-inline:0;text-align:left;max-width:24ch}
.fg .sec-head .h2{font-size:clamp(2rem,5vw,3.6rem)}
.fg__grid{gap:1px;background:var(--border);border:1px solid var(--border);counter-reset:fgx}
.fg__card{position:relative;background:var(--bg);border:0;border-radius:0;
  padding:clamp(1.6rem,2.6vw,2.4rem);min-height:clamp(220px,26vw,320px);
  display:flex;flex-direction:column;justify-content:flex-end;gap:var(--space-3);overflow:hidden}
.fg__card::before{counter-increment:fgx;content:counter(fgx,decimal-leading-zero);position:absolute;
  top:clamp(1.4rem,2.4vw,2.2rem);left:clamp(1.6rem,2.6vw,2.4rem);font-family:var(--fb);
  font-weight:700;color:var(--accent);font-size:.82rem;letter-spacing:.08em}
.fg__icon{position:absolute;top:clamp(1.1rem,2.2vw,1.9rem);right:clamp(1.6rem,2.6vw,2.4rem);
  width:38px;height:38px;border:1px solid var(--border);border-radius:0;color:var(--accent)}
.fg__card .h3{font-size:clamp(1.15rem,1.8vw,1.5rem);margin-bottom:var(--space-1)}
.fg__card .muted{color:var(--ink-soft);font-size:1rem}
.fg--bento .fg__card:nth-child(6n+1){min-height:clamp(280px,32vw,420px)}

/* 5 · STATS — full navy slab moment; huge thin numbers + mono captions + hairline columns +
 * the 4-column rule overlay behind. */
.stats{padding-block:clamp(3.5rem,8vw,6rem)}
.stats__grid{gap:0;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));text-align:left}
.stats__cell{padding:clamp(1rem,2.6vw,2rem);border-left:1px solid var(--border)}
.stats__cell:first-child{border-left:0;padding-left:0}
.stats__num{font-family:var(--fd);font-weight:200;text-transform:uppercase;letter-spacing:-.04em;
  line-height:.9;color:var(--ink);font-size:clamp(2.8rem,7vw,5rem);font-variant-numeric:tabular-nums}
.stats__cell .small{font-family:var(--fb);color:var(--ink-soft);margin-top:var(--space-3);
  font-size:.82rem;letter-spacing:.02em;max-width:20ch}

/* 6 · STEPS — 01- mono indices, hairline rows, thin uppercase titles */
.steps .sec-head{margin-inline:0;text-align:left;max-width:24ch}
.steps .sec-head .h2{font-size:clamp(2rem,5vw,3.4rem)}
.steps__list{gap:0;grid-template-columns:1fr}
.steps__item{padding-block:clamp(1.7rem,3.4vw,2.6rem);border-top:1px solid var(--border);
  align-items:baseline;gap:clamp(1.2rem,4vw,3rem)}
.steps__item:first-child{border-top:0}
.steps__num{background:transparent;color:var(--accent);width:auto;height:auto;border-radius:0;
  font-family:var(--fb);font-weight:700;font-size:1rem;letter-spacing:.06em;flex:none;min-width:3.5ch}
.steps__num::after{content:" —";color:var(--ink-soft)}
.steps__item .h3{font-size:clamp(1.3rem,2.4vw,1.9rem);margin-bottom:var(--space-2)}
.steps__item .muted{color:var(--ink-soft)}

/* 7 · STICKY-SCROLL — thin uppercase pinned heads, mono body, sharp media, court-azure eyebrow */
.ss__heading{font-size:clamp(2rem,5vw,3.6rem);max-width:20ch}
.ss__eyebrow{color:var(--support-2)}
.ss__title{font-size:clamp(1.7rem,3.2vw,2.6rem)}
.ss__body{color:var(--ink-soft)}
.ss__media{border-radius:0;border:1px solid var(--border)}
.ss__cap{font-family:var(--fb);color:var(--ink-soft);font-size:.82rem;letter-spacing:.02em}

/* 8 · TESTIMONIAL — distinct SHARP cards (bordered boxes), mono quote, thin grotesk name, square
 * avatar, a bracketed quote-mark. */
.tm__grid{gap:var(--space-4);background:transparent}
.tm__card{background:var(--surface);border:1px solid var(--border);border-radius:0;
  padding:clamp(1.7rem,3vw,2.4rem);gap:var(--space-5)}
.tm__quote{font-family:var(--fb);font-weight:400;font-size:clamp(1rem,1.4vw,1.12rem);line-height:1.6}
.tm__avatar{width:46px;height:46px;border-radius:0;object-fit:cover}
.tm__name{font-family:var(--fd);text-transform:uppercase;font-weight:500;letter-spacing:0}
.tm__by .small{font-family:var(--fb);font-size:.78rem}
.tm--spotlight .tm__card{background:transparent;border:0;padding:0}
.tm--spotlight .tm__card::before{display:none}
.tm--spotlight .tm__quote{font-family:var(--fd);text-transform:uppercase;font-weight:300;
  letter-spacing:-.03em;font-size:clamp(1.6rem,4vw,2.7rem);line-height:1.05}
.tm--marquee .tm__card{background:var(--surface)}
.tm--marquee .tm__card::before{display:none}

/* 9 · PRICING — stark sharp hairline columns; thin price numerals; popular inverts to navy slab */
.pr__grid{gap:1px;background:var(--border);border:1px solid var(--border)}
.pr__card{background:var(--bg);border:0;border-radius:0;padding:clamp(1.9rem,3vw,2.8rem)}
.pr__tier{font-family:var(--fd);text-transform:uppercase;font-weight:500;font-size:1.05rem;letter-spacing:.02em}
.pr__amt{font-family:var(--fd);font-weight:200;letter-spacing:-.05em;font-size:clamp(2.6rem,5vw,3.8rem)}
.pr__price .small{font-family:var(--fb)}
.pr__feats li{font-family:var(--fb);color:var(--ink-soft);font-size:.88rem;padding-left:1.4rem}
.pr__feats li::before{content:"—";left:0;top:0;width:auto;height:auto;border-radius:0;background:none;color:var(--accent)}
.pr__badge{border-radius:0;font-family:var(--fb);text-transform:uppercase;letter-spacing:.06em}
.pr__card--pop{background:var(--navy);border:0;box-shadow:none;color:#fff}
.pr__card--pop .pr__tier,.pr__card--pop .pr__amt{color:#fff}
.pr__card--pop .pr__price .small,.pr__card--pop .pr__feats li,.pr__card--pop .small,.pr__card--pop .muted{color:#B9BECE}
.pr__card--pop .pr__feats li::before{color:var(--on-slab)}
.pr__card--pop .pr__badge{background:var(--on-slab);color:#0A0E1E}
.pr__card--pop .pr__cta{background:#fff;color:var(--navy);border-color:#fff}
.pr__card--pop .pr__cta:hover{background:var(--on-slab);color:#0A0E1E}

/* 10 · FAQ — big thin uppercase questions; hairline list; mono answers; ↗-style + icon */
.faq__h{font-family:var(--fd);text-transform:uppercase;font-weight:300;letter-spacing:-.035em;
  font-size:clamp(2rem,4.5vw,3.4rem)}
.faq__item{border-bottom:1px solid var(--border)}
.faq__item:first-child{border-top:1px solid var(--border)}
.faq__q{font-family:var(--fd);text-transform:uppercase;font-weight:500;letter-spacing:-.01em;
  font-size:clamp(1.1rem,1.9vw,1.45rem);padding-block:clamp(1.2rem,2.2vw,1.6rem)}
.faq__icon{color:var(--accent)}
.faq__a .muted{font-family:var(--fb);color:var(--ink-soft);font-size:1rem;line-height:1.65}

/* 11 · CONTACT — underline-only mono fields; bracketed uppercase labels; sharp submit */
.cf .sec-head{margin-inline:0;text-align:left}
.cf .sec-head .h2{font-size:clamp(2rem,5vw,3.4rem)}
.cf__field span{font-family:var(--fb);text-transform:uppercase;letter-spacing:.1em;font-size:.72rem;color:var(--ink-soft)}
.cf__field input,.cf__field textarea{font-family:var(--fb);background:transparent;border:0;
  border-bottom:1px solid var(--ink);border-radius:0;padding:.7rem 0}
.cf__field input:focus,.cf__field textarea:focus{box-shadow:none;border-bottom-color:var(--accent)}
.cf__form .btn{align-self:flex-start;margin-top:var(--space-4)}

/* 12 · CARD-GRID — sharp framed cards; square media; mono tag/meta; ↗ link; sharp filter tabs */
.cg .sec-head{margin-inline:0;text-align:left}
.cg .sec-head .h2{font-size:clamp(2rem,5vw,3.4rem)}
.cg__tabs{justify-content:flex-start}
.cg__tab{border-radius:0;font-family:var(--fb);text-transform:uppercase;letter-spacing:.06em;font-size:.72rem}
.cg__tab[aria-pressed="true"]{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.cg__card{background:var(--bg);border:1px solid var(--border);border-radius:0;padding:var(--space-4)}
.cg__card:hover{border-color:var(--ink);transform:none}
.cg__media{border-radius:0;aspect-ratio:4/3}
.cg__tag{border-radius:0;color:var(--accent);border-color:var(--accent);text-transform:uppercase;letter-spacing:.06em}
.cg__meta{font-family:var(--fb)}
.cg__title{font-family:var(--fd);text-transform:uppercase;font-weight:500;font-size:clamp(1.1rem,1.7vw,1.4rem)}
.cg__link{font-family:var(--fb);color:var(--accent);letter-spacing:.04em}

/* 13 · INDEX-TILES — sharp tiles; oversized mono index; thin uppercase titles */
.it .sec-head{margin-inline:0;text-align:left}
.it .sec-head .h2{font-size:clamp(2rem,5vw,3.4rem)}
.it__grid{gap:1px;background:var(--border)}
.it__tile{border-radius:0}
.it__tile::after{background:linear-gradient(to top,rgba(11,15,30,.85),rgba(11,15,30,.05) 60%,rgba(11,15,30,.32))}
.it__num{font-family:var(--fb);font-weight:700;font-size:1.4rem;letter-spacing:.04em;opacity:.95}
.it__title{font-family:var(--fd);text-transform:uppercase;font-weight:400;letter-spacing:-.01em;font-size:clamp(1.2rem,2vw,1.55rem)}
.it__cap{font-family:var(--fb);font-size:.8rem}

/* 14 · CTA — navy slab with the 4-column grid overlay + a giant faint ghost wordmark behind.
 * As the CLOSING band it flows straight into the (also-navy) footer: when the CTA is the last
 * section, drop its bottom padding so the two navy slabs read as ONE continuous block (no light
 * page-gray strip between them). */
.cta{padding-block:clamp(3rem,7vw,5rem);padding-inline:var(--gutter)}
.cta__panel{background:var(--navy);color:#fff;border-radius:0;position:relative;overflow:hidden;
  padding:clamp(2.6rem,6vw,5rem)}
/* ghost wordmark = the site's OWN brand (data-ghost on the panel), never a hard-coded demo name */
.cta__panel::before{content:attr(data-ghost);position:absolute;right:2%;bottom:-16%;z-index:0;font-family:var(--fd);
  font-weight:300;text-transform:uppercase;font-size:clamp(6rem,20vw,16rem);letter-spacing:-.04em;
  line-height:1;color:#fff;opacity:.05;pointer-events:none}
.cta__panel>*{position:relative;z-index:1}
.cta__title{color:#fff;font-family:var(--fd);text-transform:uppercase;font-weight:300;letter-spacing:-.035em;
  font-size:clamp(2rem,5vw,3.6rem);max-width:16ch}
.cta__sub{font-family:var(--fb);color:#9AA0B4}
.cta__btn{background:#fff;color:var(--navy);border-color:#fff}
.cta__btn:hover{background:var(--on-slab);color:#0A0E1E}

/* 15 · FOOTER — navy ground (fixed dark, both themes) on the SAME 4-column grid: wide-spaced
 * brand + mono contact in col 1, then BIG THIN UPPERCASE grotesque link columns (like the source);
 * faint column-rule overlay; mono bottom bar. */
footer{background:var(--navy);color:#EBEBEB;border-top:0;margin-top:var(--space-2);
  --ink:#EBEBEB;--ink-soft:#9AA0B4;--border:rgba(255,255,255,.16)}
/* the base footer carries margin-top:var(--space-2) (8px) — it would show an 8px light page-gray
 * seam between the navy CTA slab and the navy footer. Zero it so the two dark slabs are continuous. */
.ft__grid{padding-top:var(--space-9);row-gap:var(--space-7)}
@media(min-width:680px){.ft__grid{grid-template-columns:1.4fr 1fr 1fr;column-gap:var(--gutter)}}
.ft__name{font-family:var(--fd);font-weight:300;text-transform:uppercase;letter-spacing:.28em;
  font-size:clamp(1.7rem,3.4vw,2.6rem);padding-left:.28em}
.ft__brand .small{font-family:var(--fb);color:#9AA0B4;margin-top:var(--space-4);max-width:34ch}
.ft__h{font-family:var(--fb);text-transform:uppercase;letter-spacing:.14em;font-size:.7rem;
  color:#9AA0B4;font-weight:700;margin-bottom:var(--space-4)}
.ft__col ul{gap:0}
.ft__col a{font-family:var(--fd);text-transform:uppercase;font-weight:300;letter-spacing:-.01em;
  font-size:clamp(1.4rem,2.4vw,2rem);line-height:1.5;color:#EBEBEB;display:inline-block;padding:.05rem 0}
.ft__col a:hover{color:#fff}
.ft__bottom{border-top:1px solid rgba(255,255,255,.16);padding-top:var(--space-5);
  margin-top:var(--space-8);color:#9AA0B4}
.ft__bottom .small{font-family:var(--fb);letter-spacing:.02em}

/* HERO layout (bespoke markup below) — left full-bleed court photo · right navy grid panel */
.xnhero{padding:0;overflow:hidden}
.xnhero__grid{display:grid;grid-template-columns:1fr;min-height:clamp(560px,72vh,760px)}
@media(min-width:900px){.xnhero__grid{grid-template-columns:1.05fr .95fr}}
.xnhero__media{border:0;border-radius:0;aspect-ratio:auto;min-height:320px;height:100%;background:var(--surface-2)}
.xnhero__panel{background:var(--navy);color:#fff;display:flex;flex-direction:column;justify-content:center;
  gap:clamp(1.4rem,3vw,2.2rem);padding:clamp(2.2rem,5vw,4.5rem)}
.xnhero__label{color:#9AA0B4}
.xnhero__title{font-size:clamp(3rem,9vw,7rem);line-height:.86;max-width:12ch;color:#fff}
.xnhero__title::after{content:"";display:block;width:clamp(3rem,10vw,7rem);height:1px;background:rgba(255,255,255,.4);margin-top:clamp(1rem,2.5vw,1.8rem)}
.xnhero__lead{color:#B9BECE;max-width:44ch;font-size:clamp(1rem,1.2vw,1.1rem)}
.xnhero__links{margin-top:clamp(.5rem,1.5vw,1rem)}
.xnhero__links .xn-arrow{color:#EBEBEB;border-color:rgba(255,255,255,.2)}
.xnhero__links .xn-arrow:last-child{border-color:rgba(255,255,255,.2)}
.xnhero__links .xn-arrow:hover{color:#fff}
`,

  /* 2 · HERO — the SIGNATURE block. Left = full-bleed court photo; right = deep-navy panel with
   * the 4-column grid overlay, a bracketed micro-label, a thin oversized UPPERCASE two-line
   * display (second line indented → the source's offset), a mono lead, and editorial ↗
   * arrow link-rows (built from the ctas). */
  heroHTML({wordmark, title, lead, dots=[], ctas=[]}){
    const label = (dots[0]||'Keep scrolling');
    const rows = (ctas.length?ctas:[{label:'Events',href:'#features'},{label:'Request proposal',href:'#cta'}])
      .map(c=>`<a class="xn-arrow xnhero__link" href="${c.href}">${c.label}</a>`).join('');
    return `<section class="section hero xnhero" data-section="hero" data-variant="split" data-signature="xnrgy-hero">
      <div class="xnhero__grid">
        <div class="xnhero__media media" data-media="hero" data-motion="reveal-fade" role="img" aria-label="On court"></div>
        <div class="xnhero__panel" data-ground="dark">
          <p class="eyebrow xnhero__label" data-motion="reveal-fade">${label}</p>
          <h1 class="display xnhero__title" data-motion="reveal-up" style="overflow-wrap:anywhere">${title||wordmark}</h1>
          ${lead?`<p class="lead xnhero__lead" data-motion="reveal-up">${lead}</p>`:''}
          <div class="xnhero__links" data-motion="reveal-up">${rows}</div>
        </div>
      </div>
    </section>`;
  }
};
