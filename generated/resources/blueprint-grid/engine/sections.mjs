/* sections.mjs — core section library. Each returns HTML bound to role vars, carries
 * data-section / data-variant hooks for qa-site, owns its responsive + a11y behaviour.
 * NO effects — appearance values come from the theme (foundation + template).
 * Icons come from the shared ICON LIBRARY (icons.mjs — Lucide, ISC-licensed): icon(raw) is
 * the low-level wrapper; ic(name) looks one up by name (+ aliases). */
import { icon, ic } from './icons.mjs';

/* THEME TOGGLE — integrated light/dark control for the nav (header) + footer (replaces the old
 * floating button). Wired by THEME_JS. Every learned website carries it in header AND footer. */
const _SUN='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const _MOON='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
export function themeToggle(where='nav'){
  return `<button class="theme-toggle theme-toggle--${where}" type="button" role="switch" aria-checked="false" aria-label="Switch to dark theme" data-theme-toggle>
    <span class="theme-toggle__icon theme-toggle__sun" aria-hidden="true">${_SUN}</span>
    <span class="theme-toggle__icon theme-toggle__moon" aria-hidden="true">${_MOON}</span>
    <span class="theme-toggle__label"></span>
  </button>`;
}

/* NAV — brand + links + CTA; desktop bar ↔ mobile drawer (keyboard-operable). */
export function nav({brand='Acme', links=[], cta={label:'Get started',href:'#cta'}}={}){
  const items = links.map(l=>`<li><a href="${l.href}">${l.label}</a></li>`).join('');
  return `<nav class="nav" data-section="nav" aria-label="Primary">
    <div class="container nav__bar">
      <a class="nav__brand" href="#top" aria-label="${brand} — home" data-initial="${(String(brand).trim()[0]||'•').toUpperCase()}"><span class="nav__wordmark">${brand}</span></a>
      <button class="nav__burger" aria-expanded="false" aria-controls="nav-menu" aria-label="Menu">
        ${icon('<path d="M3 6h18M3 12h18M3 18h18"/>')}
      </button>
      <div class="nav__menu" id="nav-menu">
        <ul class="nav__links">${items}</ul>
        <a class="btn btn-primary nav__cta" href="${cta.href}">${cta.label}</a>
        ${themeToggle('nav')}
      </div>
    </div>
  </nav>`;
}

/* HERO — eyebrow + display title + lead + dual CTA + media. LAYOUT VARIANTS:
 * split (text+media) | split-reverse (media+text) | centered (text only) | stacked (text over
 * a wide media band). variant changes the internal grid structure → real above-the-fold variety. */
export function hero({eyebrow='', title='', lead='', ctas=[], variant='split', mediaSeed='hero'}={}){
  const btns = ctas.map((c,i)=>`<a class="btn ${i===0?'btn-primary':'btn-ghost'}" href="${c.href}">${c.label}</a>`).join('');
  const text = `<div class="hero__text">
    ${eyebrow?`<p class="eyebrow">${eyebrow}</p>`:''}
    <h1 class="display">${title}</h1>
    ${lead?`<p class="lead hero__lead">${lead}</p>`:''}
    ${btns?`<div class="hero__cta">${btns}</div>`:''}
  </div>`;
  const media = `<div class="media hero__media" data-media="${mediaSeed}" role="img" aria-label="Product preview"></div>`;
  const inner = variant==='centered'      ? text
              : variant==='split-reverse' ? media+text
              :                             text+media;   // split, stacked (stacked stacks via CSS)
  return `<section class="section hero" data-section="hero" data-variant="${variant}">
    <div class="container hero__grid hero--${variant}">${inner}</div>
  </section>`;
}

/* FEATURE-SPLIT — alternating media/text rows. items:[{eyebrow,title,body,icon,reverse}].
 * ratio variant tunes the column proportions: even (1:1) | media-wide | text-wide. */
export function featureSplit({heading='', items=[], ratio='even'}={}){
  const rows = items.map((it,i)=>`<div class="fs__row ${it.reverse?'fs--rev':''}" data-variant="${it.reverse?'media-left':'media-right'}">
    <div class="fs__text">
      ${it.icon?`<span class="fs__icon">${ic(it.icon||"sparkles")}</span>`:''}
      ${it.eyebrow?`<p class="eyebrow">${it.eyebrow}</p>`:''}
      <h3 class="h2">${it.title}</h3>
      <p class="lead">${it.body}</p>
    </div>
    <div class="media" data-media="feat-${i}" role="img" aria-label="${it.title}"></div>
  </div>`).join('');
  return `<section class="section fs" data-section="feature" data-variant="${ratio}">
    <div class="container">
      ${heading?`<h2 class="h2 fs__heading">${heading}</h2>`:''}
      <div class="fs__rows fs--${ratio}">${rows}</div>
    </div>
  </section>`;
}

/* CTA-BAND — focused conversion panel on the accent ground (accent-ink text = AA-safe). */
export function ctaBand({title='', sub='', cta={label:'Get started',href:'#'}}={}){
  return `<section class="section cta" data-section="cta" id="cta">
    <div class="container cta__panel">
      <div>
        <h2 class="h2 cta__title">${title}</h2>
        ${sub?`<p class="cta__sub">${sub}</p>`:''}
      </div>
      <a class="btn cta__btn" href="${cta.href}">${cta.label}</a>
    </div>
  </section>`;
}

/* FOOTER — link columns + brand + copyright. Returns the <footer> inner. VARIANTS: default (compact
 * band) | COVER (bgPhoto → a FULL-VIEWPORT image footer with an optional centred statement, the link
 * columns sitting low, and the copyright pinned to the bottom edge; a dark gradient grounds the base).
 * statement:{eyebrow,title,sub,cta}. anchor = an optional in-page id (e.g. 'cta') for the closing band. */
export function footer({brand='Acme', tagline='', columns=[], year='2025', bgPhoto='', statement=null, anchor='', layout='', promo=null, legal=[]}={}){
  const cols = columns.map(c=>`<div class="ft__col"><h4 class="ft__h">${c.title}</h4><ul>${
    c.links.map(l=>`<li><a href="${l.href}">${l.label}</a></li>`).join('')}</ul></div>`).join('');
  // PANEL — a DIFFERENTIATED footer: an oversized wordmark + link columns on the left, a frosted CTA
  // card stacked over a rounded image card on the right, a faint grid ground, copyright + legal on the
  // baseline. (Promoted from a frosted-product teardown; opt-in via layout:'panel'.)
  if(layout==='panel'){
    const legalRow = legal.length ? `<span class="ft__legal">${legal.map(l=>`<a href="${l.href}">${l.label}</a>`).join('')}</span>` : '';
    const promoCard = promo ? `<aside class="ft__promo">
      ${promo.eyebrow?`<p class="eyebrow ft__promoEy">${promo.eyebrow}</p>`:''}
      ${promo.title?`<p class="ft__promoTitle">${promo.title}</p>`:''}
      ${promo.cta?`<a class="btn ft__promoCta" href="${promo.cta.href}">${promo.cta.label}</a>`:''}
    </aside>` : '';
    const shot = (promo&&promo.photo) ? `<div class="ft__shot media" data-photo="${promo.photo}" role="img" aria-label="${brand}"></div>` : '';
    return `<div class="ftp" data-sgrid data-nav-dark>${anchor?`<a id="${anchor}"></a>`:''}<div class="ftp__grid" aria-hidden="true"></div>
      <div class="container ft__pgrid">
        <div class="ft__brandBlock"><div class="ft__name" data-bleed>${brand}</div></div>
        <div class="ft__cols">${cols}</div>
        <div class="ft__promoWrap">${promoCard}${shot}</div>
      </div>
      <div class="container ft__bottom"><span class="small">© ${year} ${brand}. All rights reserved.</span>${legalRow}${themeToggle('footer')}</div>
    </div>`;
  }
  const grid = `<div class="container ft__grid">
    <div class="ft__brand"><div class="ft__name">${brand}</div><p class="small">${tagline}</p></div>
    ${cols}
  </div>`;
  const bottom = `<div class="container ft__bottom"><span class="small">© ${year} ${brand}. All rights reserved.</span>${themeToggle('footer')}</div>`;
  if(bgPhoto){
    const st = statement ? `<div class="container ft__statement">
      ${statement.eyebrow?`<p class="eyebrow ft__eyebrow">${statement.eyebrow}</p>`:''}
      ${statement.title?`<h2 class="h2 ft__stTitle">${statement.title}</h2>`:''}
      ${statement.sub?`<p class="lead ft__stSub">${statement.sub}</p>`:''}
      ${statement.cta?`<a class="btn ft__stCta" href="${statement.cta.href}">${statement.cta.label}</a>`:''}
    </div>` : '';
    return `<div class="ftx">${anchor?`<a id="${anchor}"></a>`:''}<div class="ft__bg media" data-photo="${bgPhoto}" role="img" aria-label="${brand}"></div><div class="ft__scrim"></div>
    <div class="ft__cover">${st}<div class="ft__lower">${grid}${bottom}</div></div></div>`;
  }
  return `${grid}
  ${bottom}`;
}

/* FEATURE-GRID — N icon+title+body cards. layout: cards (uniform 2–3 cols) | bento (mixed-size
 * tile mosaic — a genuinely different grid skeleton). */
export function featureGrid({heading='', sub='', items=[], cols=3, layout='cards'}={}){
  const cards=items.map(it=>`<div class="fg__card" data-section-item="feature">
    ${it.icon?`<span class="fg__icon">${ic(it.icon||"sparkles")}</span>`:''}
    <h3 class="h3">${it.title}</h3><p class="body muted">${it.body}</p></div>`).join('');
  return `<section class="section fg" data-section="feature-grid" data-variant="${layout}">
    <div class="container">
      ${heading?`<div class="sec-head"><h2 class="h2">${heading}</h2>${sub?`<p class="lead">${sub}</p>`:''}</div>`:''}
      <div class="fg__grid fg--${layout}" style="--fg-cols:${cols}">${cards}</div>
    </div></section>`;
}

/* LOGOS — "trusted by" strip (text placeholders; a template swaps in real SVG logos).
 * marquee=true → a full-bleed CONTINUOUSLY SCROLLING logo WALL (no label needed) via the marquee
 * motion primitive; otherwise a centred static row with an optional label. */
export function logos({label='', items=[], marquee=false}={}){
  const row = items.map(n=>`<span class="logos__item">${n}</span>`).join('');
  if(marquee){
    return `<section class="section logos logos--wall" data-section="logos" data-variant="wall">
      ${label?`<div class="container"><p class="logos__label small muted">${label}</p></div>`:''}
      <div class="logos__marquee" data-motion="marquee" aria-label="${label||'Featured partners'}">${row}</div>
    </section>`;
  }
  return `<section class="section logos" data-section="logos" data-variant="row">
    <div class="container">
      ${label?`<p class="logos__label small muted">${label}</p>`:''}
      <div class="logos__row">${row}</div>
    </div></section>`;
}

/* STATS-BAND — 3–4 big metrics + captions. (Add data-motion="count-up" per cell to animate.)
 * VARIANT reveal — a pinned left header ("Here's the proof.") beside a tall RIGHT column of huge
 * numbers revealed ONE AT A TIME as you scroll (the focused number is bright, neighbours fall away).
 * eyebrow + heading label the block; items:[{value,label}]. (Promoted from a frosted-product teardown.) */
export function statsBand({items=[], layout='band', eyebrow='', heading='', sub=''}={}){
  if(layout==='reveal'){
    return `<section class="section stats stats--reveal" data-section="stats" data-variant="reveal" data-sgrid data-nav-dark>
      <div class="container stats__revwrap">
        <div class="stats__lead">
          ${eyebrow?`<p class="eyebrow">${eyebrow}</p>`:''}
          ${heading?`<h2 class="h2 stats__leadH">${heading}</h2>`:''}
          ${sub?`<p class="lead stats__leadSub">${sub}</p>`:''}
        </div>
        <div class="stats__stack" data-motion="stat-focus">${items.map(s=>`<div class="st__row">
          <div class="st__num">${s.value}</div><p class="small muted st__cap">${s.label}</p></div>`).join('')}</div>
      </div></section>`;
  }
  return `<section class="section stats" data-section="stats">
    <div class="container stats__grid">${items.map(s=>`<div class="stats__cell">
      <div class="stats__num">${s.value}</div><p class="small muted">${s.label}</p></div>`).join('')}</div></section>`;
}

/* STEPS — numbered how-it-works (ol = semantic order). */
export function steps({heading='', items=[]}={}){
  return `<section class="section steps" data-section="steps">
    <div class="container">
      ${heading?`<div class="sec-head"><h2 class="h2">${heading}</h2></div>`:''}
      <ol class="steps__list">${items.map((it,i)=>`<li class="steps__item">
        <span class="steps__num">${String(i+1).padStart(2,'0')}</span>
        <div><h3 class="h3">${it.title}</h3><p class="body muted">${it.body}</p></div></li>`).join('')}</ol>
    </div></section>`;
}

/* TESTIMONIAL — quote cards. layout VARIANTS: cards (3-col grid) | spotlight (one big centred
 * quote column) | marquee (scrolling row of cards). Same markup, different structure. */
export function testimonial({heading='', quotes=[], layout='cards'}={}){
  const cards=quotes.map((q,i)=>{
    const _i=((q.name||'').trim()[0]||'?').toUpperCase(); const _cl=['#0E7C6B','#E2533B','#EFA12E','#2E8B57','#7A5A3C','#2E4257'][i%6]; const _sv=`<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect width='120' height='120' fill='${_cl}'/><text x='60' y='82' font-family='Georgia,serif' font-weight='700' font-size='58' fill='#fff' text-anchor='middle'>${_i}</text></svg>`; const av = q.avatar || `data:image/svg+xml,${encodeURIComponent(_sv)}`;
    return `<figure class="tm__card">
    ${q.stat?`<div class="tm__stat"><span class="tm__stat-label">${q.stat.label||''}</span><span class="tm__stat-value">${q.stat.value||''}</span></div>`:''}
    <blockquote class="tm__quote">${q.text}</blockquote>
    <figcaption class="tm__by"><img class="tm__avatar" src="${av}" alt="" loading="lazy" decoding="async"><span class="tm__meta"><span class="tm__name">${q.name}</span><span class="small muted">${q.role}</span></span></figcaption>
  </figure>`;}).join('');
  const head = heading?`<div class="sec-head"><h2 class="h2">${heading}</h2></div>`:'';
  // CASE — a single-spotlight CASE-STUDY CAROUSEL (learned from a fintech testimonials block): one wide
  // split card at a time (media LEFT · company + a stat pill + a big quote + attribution + a "read case
  // study" link RIGHT), with dots + prev/next below (TM_JS). quotes:[{text,name,role,company,photo,
  // stat:{value,label},cta:{label,href}}]. Degrades with no-JS to the first slide (all in the DOM).
  if(layout==='case'){
    const av=(q,i)=>{const _i=((q.name||'').trim()[0]||'?').toUpperCase();const _cl=['#0E7C6B','#E2533B','#EFA12E','#2E8B57','#7A5A3C','#2E4257'][i%6];const _sv=`<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect width='96' height='96' fill='${_cl}'/><text x='48' y='66' font-family='Georgia,serif' font-weight='700' font-size='46' fill='#fff' text-anchor='middle'>${_i}</text></svg>`;return q.avatar||`data:image/svg+xml,${encodeURIComponent(_sv)}`;};
    const slides=quotes.map((q,i)=>`<article class="tm__case" data-i="${i}">
      <div class="tm__caseMedia media" data-media="tmc-${i}"${q.photo?` data-photo="${q.photo}"`:''} role="img" aria-label="${q.name||''}"><button class="tm__play" type="button" aria-label="Play">${icon('<path d="M8 5v14l11-7z"/>',22)}</button></div>
      <div class="tm__caseBody">
        <div class="tm__caseTop">
          <span class="tm__company">${q.company||q.name||''}</span>
          ${q.stat?`<span class="tm__statWrap"><span class="tm__statPill">${ic('trending-up',16)}<span class="tm__statVal">${q.stat.value}</span></span><span class="tm__statLabel small">${q.stat.label||''}</span></span>`:''}
        </div>
        <blockquote class="tm__caseQuote">${q.text}</blockquote>
        <figcaption class="tm__caseFoot">
          <span class="tm__by"><img class="tm__avatar" src="${av(q,i)}" alt="" loading="lazy" decoding="async"><span class="tm__meta"><span class="tm__name">${q.name||''}</span><span class="small muted">${q.role||''}</span></span></span>
          ${q.cta?`<a class="tm__caseCta" href="${q.cta.href}">${ic('arrow-right',18)} ${q.cta.label}</a>`:''}
        </figcaption>
      </div>
    </article>`).join('');
    const dots=quotes.map((q,i)=>`<button class="tm__dot${i===0?' is-active':''}" type="button" data-i="${i}" aria-label="Story ${i+1}" aria-pressed="${i===0}"></button>`).join('');
    // stage runs FULL-BLEED (outside .container) as a horizontal DRAG carousel — ~1.5 cards show at a time,
    // cards fade in/out at the browser edges (no hard cut). data-mos-drag reuses the mosaic drag runtime.
    return `<section class="section tm tm--case" data-section="testimonial" data-variant="case" data-tm-carousel>
      <div class="container">${head}</div>
      <div class="tm__stage" data-mos-drag>${slides}</div>
      <div class="container"><div class="tm__nav"><button class="tm__arrow" type="button" data-d="-1" aria-label="Previous">${icon('<path d="m15 18-6-6 6-6"/>',20)}</button><div class="tm__dots">${dots}</div><button class="tm__arrow" type="button" data-d="1" aria-label="Next">${icon('<path d="m9 18 6-6-6-6"/>',20)}</button></div></div>
    </section>`;
  }
  // marquee runs FULL-BLEED (outside .container) so cards flow in/out at the screen edges, not
  // cut at a centred container; its own class avoids the .tm__grid{display:grid} override.
  if(layout==='marquee'){
    return `<section class="section tm tm--marquee" data-section="testimonial" data-variant="marquee">
      <div class="container">${head}</div>
      <div class="tm__marquee" data-motion="marquee">${cards}</div>
    </section>`;
  }
  return `<section class="section tm tm--${layout}" data-section="testimonial" data-variant="${layout}">
    <div class="container">
      ${head}
      <div class="tm__grid">${cards}</div>
    </div></section>`;
}

/* PRICING — 3 plan cards (tier · price · features · popular flag). */
export function pricing({heading='', sub='', plans=[]}={}){
  const cards=plans.map(p=>`<div class="pr__card${p.popular?' pr__card--pop':''}">
    ${p.popular?`<span class="pr__badge">Most popular</span>`:''}
    <h3 class="h3 pr__tier">${p.tier}</h3>
    <div class="pr__price"><span class="pr__amt">${p.price}</span><span class="small muted">${p.unit||''}</span></div>
    <ul class="pr__feats">${(p.features||[]).map(f=>`<li>${f}</li>`).join('')}</ul>
    <a class="btn ${p.popular?'btn-primary':'btn-ghost'} pr__cta" href="#cta">Choose ${p.tier}</a></div>`).join('');
  return `<section class="section pr" data-section="pricing">
    <div class="container">
      ${heading?`<div class="sec-head"><h2 class="h2">${heading}</h2>${sub?`<p class="lead">${sub}</p>`:''}</div>`:''}
      <div class="pr__grid">${cards}</div></div></section>`;
}

/* FAQ — native <details>/<summary> accordion (keyboard + a11y for free, 0 JS). */
/* FAQ — native <details> accordion. layout VARIANTS: list (centred 1-col) | split (heading
 * left, accordion right) | two-col (accordion across two columns). */
export function faq({heading='Frequently asked questions', items=[], layout='list'}={}){
  const list=`<div class="faq__list">${items.map(it=>`<details class="faq__item"><summary class="faq__q">${it.q}<span class="faq__icon" aria-hidden="true">${ic('plus',20)}</span></summary><div class="faq__a"><p class="body muted">${it.a}</p></div></details>`).join('')}</div>`;
  return `<section class="section faq faq--${layout}" data-section="faq" data-variant="${layout}">
    <div class="container faq__wrap">
      ${heading?`<h2 class="h2 faq__h">${heading}</h2>`:''}
      ${list}
    </div></section>`;
}

/* CONTACT-FORM — HTML5-validated fields + a success state (FORM_JS). */
export function contactForm({heading='Get in touch', sub='', cta='Send message'}={}){
  return `<section class="section cf" data-section="contact" id="contact">
    <div class="container cf__wrap">
      <div class="sec-head"><h2 class="h2">${heading}</h2>${sub?`<p class="lead">${sub}</p>`:''}</div>
      <form class="cf__form" novalidate>
        <div class="cf__row">
          <label class="cf__field"><span>Name</span><input name="name" type="text" required autocomplete="name"></label>
          <label class="cf__field"><span>Email</span><input name="email" type="email" required autocomplete="email"></label>
        </div>
        <label class="cf__field"><span>Message</span><textarea name="message" rows="4" required></textarea></label>
        <button class="btn btn-primary" type="submit">${cta}</button>
        <p class="cf__ok small" role="status" hidden>Thanks — we'll be in touch.</p>
      </form>
    </div></section>`;
}

/* CARD-GRID — filterable card grid + "load more" (behaviour-heavy). filters:[{key,label}]
 * (first = default, key 'all' shows everything); cards:[{cat,tag,meta,title,role,cta}]. */
export function cardGrid({heading='', sub='', filters=[], cards=[], batch=6, moreLabel='Load more', layout='grid'}={}){
  const tabs = filters.length ? `<div class="cg__tabs" role="group" aria-label="Filter ${heading||'items'}">${
    filters.map((f,i)=>`<button class="cg__tab" type="button" data-cat="${f.key}" aria-pressed="${i===0?'true':'false'}">${f.label}</button>`).join('')}</div>` : '';
  const cells = cards.map(c=>`<article class="cg__card" data-cat="${c.cat||'all'}">
    ${c.photo?`<div class="cg__media media" data-photo="${c.photo}" role="img" aria-label="${c.title||''}"></div>`:''}
    <div class="cg__top">${c.tag?`<span class="cg__tag mono">${c.tag}</span>`:''}${c.meta?`<span class="cg__meta mono">${c.meta}</span>`:''}</div>
    <h3 class="h3 cg__title">${c.title}</h3>
    ${c.role?`<p class="cg__role small muted">${c.role}</p>`:''}
    ${c.cta?`<span class="cg__link mono" aria-hidden="true">${c.cta} →</span>`:''}
  </article>`).join('');
  return `<section class="section cg" data-section="card-grid" data-variant="${layout}" data-cardgrid data-batch="${batch}">
    <div class="container">
      ${heading?`<div class="sec-head cg__head"><h2 class="h2">${heading}</h2>${sub?`<p class="lead">${sub}</p>`:''}</div>`:''}
      ${tabs}
      <div class="cg__railwrap"><div class="cg__navwrap"><button class="cg__nav cg__nav--prev" type="button" aria-label="Previous">${icon('<path d="m15 18-6-6 6-6"/>',20)}</button><button class="cg__nav cg__nav--next" type="button" aria-label="Next">${icon('<path d="m9 18 6-6-6-6"/>',20)}</button></div><div class="cg__grid${layout==='rail'?' cg--rail':''}">${cells}</div></div>
      <div class="cg__morewrap"><button class="btn btn-ghost cg__more" type="button">${moreLabel}</button></div>
    </div></section>`;
}

/* INDEX-TILES — numbered photo tiles with a dark scrim + big index + caption (editorial
 * "our domain / services" grid). items:[{title,caption,photo}]. Index auto from position. */
export function indexTiles({heading='', sub='', items=[], layout='grid'}={}){
  // COVERFLOW variant (learned 2026-07-13): an Apple-style 3D cover-flow — the CENTRE card faces
  // flat (0°) & largest, side cards tilt inward (rotateY) and recede/shrink the further they sit;
  // switching rotates a side card to flat as it slides to centre (COVERFLOW_JS · data-coverflow).
  // Cards are server-rendered (so no-JS / reduced-motion degrades to a horizontal snap rail).
  if(layout==='coverflow'){
    const cards=items.map((it,i)=>`<article class="itf__card" data-i="${i}" tabindex="0" aria-label="${it.title}">
      <div class="it__media media itf__media" data-media="tile-${i}"${it.photo?` data-photo="${it.photo}"`:''} role="img" aria-label="${it.title}"></div>
      <div class="itf__cap"><span class="it__num mono">${String(i+1).padStart(2,'0')}</span><h3 class="h3 it__title itf__title">${it.title}</h3>${it.caption?`<p class="small it__cap">${it.caption}</p>`:''}</div>
    </article>`).join('');
    const dots=items.map((it,i)=>`<button class="itf__dot" type="button" data-i="${i}" aria-label="Show ${it.title}"></button>`).join('');
    return `<section class="section it it--flow" data-section="index-tiles" data-variant="coverflow" data-coverflow>
      <div class="container">
        ${heading?`<div class="sec-head"><h2 class="h2">${heading}</h2>${sub?`<p class="lead">${sub}</p>`:''}</div>`:''}
        <div class="itf">
          <div class="itf__stage"><div class="itf__track">${cards}</div></div>
          <div class="itf__ctl">
            <button class="itf__arrow" type="button" data-d="-1" aria-label="Previous">${icon('<path d="m15 18-6-6 6-6"/>',20)}</button>
            <div class="itf__dots" role="group" aria-label="Choose a tile">${dots}</div>
            <button class="itf__arrow" type="button" data-d="1" aria-label="Next">${icon('<path d="m9 18 6-6-6-6"/>',20)}</button>
          </div>
        </div>
      </div></section>`;
  }
  const tiles=items.map((it,i)=>`<article class="it__tile" data-section-item="tile">
    <div class="it__media media" data-media="tile-${i}"${it.photo?` data-photo="${it.photo}"`:''} role="img" aria-label="${it.title}"></div>
    <div class="it__body">
      <span class="it__num mono">${String(i+1).padStart(2,'0')}</span>
      <h3 class="h3 it__title">${it.title}</h3>
      ${it.caption?`<p class="small it__cap">${it.caption}</p>`:''}
    </div></article>`).join('');
  return `<section class="section it" data-section="index-tiles">
    <div class="container">
      ${heading?`<div class="sec-head"><h2 class="h2">${heading}</h2>${sub?`<p class="lead">${sub}</p>`:''}</div>`:''}
      <div class="it__grid">${tiles}</div>
    </div></section>`;
}

/* STICKY-SCROLL — the pinned-narrative section (learned from a CPG storytelling site). A LEFT
 * column stays PINNED while its panels CROSS-FADE IN PLACE; a RIGHT gallery of images SCROLLS UP
 * past it. As each gallery image crosses the viewport centre, the matching left panel fades in
 * (STICKY_JS · IntersectionObserver). reverse=true swaps the sides. items:[{eyebrow,title,body,
 * cta:{label,href},photo,caption}]. A11y: every panel is in the DOM and readable; under
 * prefers-reduced-motion / mobile it degrades to a plain stacked list (no pin, no fade).
 * (promotion candidate, web-motion §3 — a genuinely novel signature the 15 didn't cover.) */
export function stickyScroll({heading='', intro='', items=[], reverse=false, layout='vertical'}={}){
  // HORIZONTAL mode (learned 2026-07-04): LEFT column pinned (heading + intro + prev/next + counter),
  // RIGHT a row of image cards (photo + title + body + cta) that translate HORIZONTALLY as the page
  // scrolls vertically (STICKY_JS · data-sticky-h). reverse swaps sides. Degrades to a plain
  // horizontal-scroll rail (no pin) on mobile / under reduced-motion / no-JS.
  if(layout==='horizontal'){
    const cards = items.map((it,i)=>`<article class="ssh__card" data-i="${i}">
      <div class="ssh__media media" data-media="ss-${i}"${it.photo?` data-photo="${it.photo}"`:''} role="img" aria-label="${it.title||''}"></div>
      <div class="ssh__cbody">
        <h3 class="h3 ssh__title">${it.title||''}</h3>
        ${it.body?`<p class="small ssh__text">${it.body}</p>`:''}
        ${it.cta?`<a class="btn btn-ghost ssh__cta" href="${it.cta.href}">${it.cta.label}</a>`:''}
      </div>
    </article>`).join('');
    const tabs = items.slice(0,2).map((it,i)=>`<button class="ssh__tab${i===0?' is-active':''}" type="button" data-i="${i}">${it.tag||('0'+(i+1))}</button>`).join('');
    return `<section class="section ss ssh${reverse?' ss--rev':''}" data-section="sticky-scroll" data-variant="${reverse?'media-left':'media-right'}" data-sticky-h>
      <div class="ssh__grid">
        <div class="ssh__pin">
          ${tabs?`<div class="ssh__tabs" role="group" aria-label="Filter">${tabs}</div>`:''}
          ${heading?`<h2 class="h2 ssh__heading">${heading}</h2>`:''}
          ${intro?`<p class="lead ssh__intro">${intro}</p>`:''}
          <div class="ssh__nav"><button class="ssh__arrow" type="button" data-d="-1" aria-label="Previous">${icon('<path d="m15 18-6-6 6-6"/>',20)}</button><span class="ssh__count mono"><span class="ssh__cur">1</span> / ${String(items.length).padStart(2,'0')}</span><button class="ssh__arrow" type="button" data-d="1" aria-label="Next">${icon('<path d="m9 18 6-6-6-6"/>',20)}</button></div>
        </div>
        <div class="ssh__viewport"><div class="ssh__track">${cards}</div></div>
      </div>
    </section>`;
  }
  const panels = items.map((it,i)=>`<div class="ss__panel${i===0?' is-active':''}" data-i="${i}">
    ${it.eyebrow?`<p class="eyebrow ss__eyebrow">${it.eyebrow}</p>`:''}
    <h3 class="h2 ss__title">${it.title}</h3>
    ${it.body?`<p class="lead ss__body">${it.body}</p>`:''}
    ${it.cta?`<a class="btn btn-primary ss__cta" href="${it.cta.href}">${it.cta.label}</a>`:''}
  </div>`).join('');
  const gallery = items.map((it,i)=>`<figure class="ss__item" data-i="${i}">
    <div class="ss__media media" data-media="ss-${i}"${it.photo?` data-photo="${it.photo}"`:''} role="img" aria-label="${it.title||''}"></div>
    ${it.caption?`<figcaption class="ss__cap">${it.caption}</figcaption>`:''}
  </figure>`).join('');
  return `<section class="section ss${reverse?' ss--rev':''}" data-section="sticky-scroll" data-variant="${reverse?'media-left':'media-right'}" data-sticky-scroll>
    <div class="container">
      ${heading?`<h2 class="h2 ss__heading">${heading}</h2>`:''}
      <div class="ss__grid">
        <div class="ss__pin"><div class="ss__panels">${panels}</div></div>
        <div class="ss__gallery">${gallery}</div>
      </div>
    </div></section>`;
}

/* MOSAIC-SCROLL (learned 2026-07-04) — TWO offset rows of image cards that auto-scroll horizontally
 * (the marquee primitive; the second row runs REVERSE for the staggered look). Each card = a photo +
 * a small tag/title. A moving image wall. items:[{photo,title,tag}]. */
export function mosaicScroll({heading='', sub='', items=[]}={}){
  const half=Math.max(1,Math.ceil(items.length/2));
  const rowA=items.slice(0,half); let rowB=items.slice(half); if(!rowB.length) rowB=rowA;
  // text overlays the image (bottom-aligned) over a gradient scrim; kept as a SIBLING of .mos__media so
  // apply-photos (which rewrites the .media content) never wipes it.
  const card=(it,i)=>`<article class="mos__card">
    <div class="mos__media media" data-media="mos-${i}"${it.photo?` data-photo="${it.photo}"`:''} role="img" aria-label="${it.title||''}"></div>
    ${(it.title||it.tag)?`<div class="mos__meta">${it.tag?`<span class="mos__tag mono">${it.tag}</span>`:''}${it.title?`<span class="mos__title">${it.title}</span>`:''}</div>`:''}
  </article>`;
  // DRAG (not auto-scroll): each row is a horizontal scroll strip you drag (MOS_JS); a hint tells users.
  const row=(items,dir)=>`<div class="mos__row" data-motion="marquee" data-marquee-dir="${dir}" aria-label="${heading||'Gallery'}">${items.map(card).join('')}</div>`;
  return `<section class="section mos" data-section="mosaic-scroll" data-variant="rows">
    <div class="container mos__head">
      ${(heading||sub)?`<div class="sec-head"><h2 class="h2">${heading}</h2>${sub?`<p class="lead">${sub}</p>`:''}</div>`:''}
    </div>
    <div class="mos__rows">${row(rowA,'normal')}${row(rowB,'reverse')}</div>
  </section>`;
}

/* TEAM (promoted 2026-07-10) — leadership/people cards. Each card is a portrait that ENLARGES on hover;
 * name + role + optional socials overlay the bottom over a gradient. members:[{name,role,photo,linkedin,x}]. */
export function team({heading='', sub='', members=[]}={}){
  const LI='<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5A2.5 2.5 0 114.96 8.5 2.5 2.5 0 014.98 3.5zM3 9h4v12H3V9zm6 0h3.84v1.64h.05c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.8 2.67 4.8 6.14V21H17v-5.6c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96V21H9V9z"/></svg>';
  const X='<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true"><path d="M18.24 2.25h3.31l-7.23 8.26L23 21.75h-6.66l-5.22-6.82-5.97 6.82H1.66l7.73-8.84L1.24 2.25h6.83l4.71 6.23 5.46-6.23zm-1.16 17.52h1.83L7.01 4.13H5.05z"/></svg>';
  const card=(m,i)=>`<article class="team__card">
    <div class="team__media media" data-media="team-${i}"${m.photo?` data-photo="${m.photo}"`:''} role="img" aria-label="${m.name||''}"></div>
    <div class="team__info">
      <span class="team__txt"><span class="team__name">${m.name||''}</span><span class="team__role small">${m.role||''}</span></span>
      ${(m.linkedin||m.x)?`<span class="team__socials">${m.linkedin?`<a class="team__soc" href="${m.linkedin}" aria-label="${m.name||''} on LinkedIn">${LI}</a>`:''}${m.x?`<a class="team__soc" href="${m.x}" aria-label="${m.name||''} on X">${X}</a>`:''}</span>`:''}
    </div>
  </article>`;
  return `<section class="section team" data-section="team" data-variant="cards">
    <div class="container">
      ${(heading||sub)?`<div class="sec-head"><h2 class="h2">${heading}</h2>${sub?`<p class="lead">${sub}</p>`:''}</div>`:''}
      <div class="team__grid">${members.map(card).join('')}</div>
    </div></section>`;
}

/* tiltCards(html) — opt-in (skin.cardTilt) post-process that tags every card element with `data-tilt`, so the
 * motion runtime gives cards a subtle 3D parallax tilt toward the cursor on hover. Runs on composed BODY markup
 * only (matches `class="…"`, never CSS selectors), and skips cards that already carry it. */
export function tiltCards(html){
  const TOK='(?:fg__card|cg__card|pr__card|team__card|mos__card|stc__card|ss__card|tm__card|tm__case)';
  return html.replace(new RegExp('<(div|article|figure)((?:(?!data-tilt)[^>])*?\\bclass="[^"]*\\b'+TOK+'\\b[^"]*")','g'),
    '<$1 data-tilt$2');
}

/* PINNED-SPLIT (promoted 2026-07-08, from a voice-planner consumer site → glass-bloom) — the crown
 * signature: a CENTER media (a phone / image) stays PINNED in the viewport and CROSS-FADES between
 * frames, while text panels ALTERNATE left ↔ right and scroll up past it. As each panel crosses the
 * viewport centre the matching centre frame fades in (PINNED_JS · IntersectionObserver). Genuinely
 * different from stickyScroll (which pins ONE side): here the media is centred and the copy is
 * bilateral. Degrades (mobile / reduced-motion / no-JS) to a readable static stack: media on top,
 * copy blocks below. items:[{eyebrow,title,body,photo}]. Base geometry here; skins paint .pin__*. */
export function pinnedSplit({heading='', intro='', kicker='', items=[], device='phone', layout='center'}={}){
  // SLIDE variant — a CENTER image pinned in the middle; over a short scroll it slides UP and leaves
  // while the LEFT heading + RIGHT description cross-fade IN PLACE to the next frame (PIN_SLIDE_JS).
  if(layout==='slide'){
    const n=items.length;
    const shots=items.map((it,i)=>`<div class="pins__shot media${i===0?' is-front':''}" data-media="pins-${i}"${it.photo?` data-photo="${it.photo}"`:''} data-i="${i}" role="img" aria-label="${it.title||''}"></div>`).join('');
    const lefts=items.map((it,i)=>`<div class="pins__text${i===0?' is-on':''}" data-i="${i}">${it.eyebrow?`<p class="eyebrow">${it.eyebrow}</p>`:''}<h3 class="h2 pins__title">${it.title||''}</h3></div>`).join('');
    const rights=items.map((it,i)=>`<div class="pins__desc${i===0?' is-on':''}" data-i="${i}">${it.body?`<p class="lead">${it.body}</p>`:''}</div>`).join('');
    return `<section class="section pin pin--slide" data-section="pinned-split" data-variant="slide" data-pin-slide data-signature="pinned-slide">
      ${(heading||intro||kicker)?`<div class="container pin__intro">${kicker?`<p class="eyebrow">${kicker}</p>`:''}${heading?`<h2 class="h2 pin__heading">${heading}</h2>`:''}${intro?`<p class="lead">${intro}</p>`:''}</div>`:''}
      <div class="pins__track" style="--n:${n}">
        <div class="pins__stage container">
          <div class="pins__col pins__left">${lefts}</div>
          <div class="pins__center">${shots}</div>
          <div class="pins__col pins__right">${rights}</div>
        </div>
      </div>
    </section>`;
  }
  const frames = items.map((it,i)=>`<div class="pin__frame${i===0?' is-active':''}" data-i="${i}">
    <div class="pin__shot media" data-media="pin-${i}"${it.photo?` data-photo="${it.photo}"`:''} role="img" aria-label="${it.title||''}"></div>
  </div>`).join('');
  const panels = items.map((it,i)=>`<div class="pin__panel${i===0?' is-active':''}" data-i="${i}"><div class="pin__copy">
    ${it.eyebrow?`<p class="eyebrow pin__eyebrow">${it.eyebrow}</p>`:''}
    <h3 class="h2 pin__title">${it.title||''}</h3>
    ${it.body?`<p class="lead pin__text">${it.body}</p>`:''}
  </div></div>`).join('');
  return `<section class="section pin pin--${device}" data-section="pinned-split" data-variant="center" data-pinned-split data-signature="pinned-split">
    ${(heading||intro||kicker)?`<div class="container pin__intro">${kicker?`<p class="eyebrow">${kicker}</p>`:''}${heading?`<h2 class="h2 pin__heading">${heading}</h2>`:''}${intro?`<p class="lead">${intro}</p>`:''}</div>`:''}
    <div class="pin__wrap">
      <div class="pin__stage"><div class="pin__device">${frames}</div></div>
      <div class="pin__panels">${panels}</div>
    </div>
  </section>`;
}

/* COVER-STACK (promoted 2026-07-06, from a product-designer portfolio → serif-stack) — page-by-page
 * case-study panels that STACK & cover as you scroll (each is position:sticky with a per-index top
 * offset → a dealt-deck effect). Pure CSS (no JS). items:[{badge,label,title,metas:[],href,soon,
 * shots:[photo…]}]. Base geometry in SECTION_CSS; skins paint .cst__*. */
export function coverStack({heading='', sub='Selected work', items=[]}={}){
  const panel = (it,i)=>`<article class="cst__panel" style="--i:${i}">
    <div class="cst__inner">
      <div class="cst__head">
        <span class="cst__badge">${(it.badge||it.title||'•').slice(0,2).toUpperCase()}</span>
        <span class="cst__label mono">${it.label||''}</span>
        ${it.soon?`<span class="cst__soon mono">Coming soon ${ic('clock',14)}</span>`:`<a class="cst__cta" href="${it.href||'#'}">View case study ${ic('arrow-right',15)}</a>`}
      </div>
      <h3 class="cst__title">${it.title||''}</h3>
      ${(it.metas&&it.metas.length)?`<p class="cst__metas mono">${it.metas.join('&nbsp;&nbsp;•&nbsp;&nbsp;')}</p>`:''}
      ${(it.shots&&it.shots.length)?`<div class="cst__shots">${it.shots.map((sh,j)=>`<div class="cst__shot media" data-media="cst-${i}-${j}"${sh?` data-photo="${sh}"`:''} role="img" aria-label="${it.title||''}"></div>`).join('')}</div>`:''}
    </div>
  </article>`;
  return `<section class="section cst" data-section="cover-stack" data-variant="stack">
    <div class="container cst__intro">
      ${sub?`<p class="eyebrow">${sub}</p>`:''}
      ${heading?`<h2 class="h2 cst__heading">${heading}</h2>`:''}
    </div>
    <div class="cst__track">${items.map(panel).join('')}</div>
  </section>`;
}

/* PHOTO-SCATTER (promoted 2026-07-06 → serif-stack) — rotated photos scattered AROUND centred text;
 * each straightens + lifts on hover (a playground / gallery moment). Degrades to a wrapped row on
 * mobile. items:[{photo,label}]. Base geometry in SECTION_CSS; skins paint .psc__*. */
export function photoScatter({title='', sub='', items=[]}={}){
  const it = items.slice(0,6).map((p,i)=>`<figure class="psc__item psc__p${i+1}">
    <div class="media" data-media="psc-${i}"${p.photo?` data-photo="${p.photo}"`:''} role="img" aria-label="${p.label||title}"></div>
    ${p.label?`<span class="psc__label mono">${p.label}</span>`:''}
  </figure>`).join('');
  return `<section class="section psc" data-section="photo-scatter" data-variant="scatter">
    <div class="psc__stage">
      <div class="psc__center">
        ${title?`<h2 class="psc__title">${title}</h2>`:''}
        ${sub?`<p class="psc__sub">${sub}</p>`:''}
      </div>
      ${it}
    </div>
  </section>`;
}

/* ARC-SHOWCASE carousel behaviour — INLINED in the builder (self-contained, so it works via
 * gen-engine/build-skinsheet without touching their fixed script-injection list). Fanned arc: the
 * active card sits upright/front, neighbours fan out (rotate + drop + scale + dim); prev/next +
 * autoplay + click-to-focus; pauses on hover; reduced-motion keeps the plain scroll rail. */
// The ORIGINAL tuned fan logic (extracted verbatim from the shipped coastal-hotel skinsheet, Tong-tuned):
// infinite-loop ring (clones cards so the wrap-around is hidden), ANG=12°/step, quadratic DROP=30 arc,
// stepX = card×1.2 (clear gap, never overlapping), side arrows vertically centred on the ACTIVE card's
// image, autoplay pausing on hover/focus/tab-hidden. Idempotency guard so an inline copy is safe.
const ARC_JS = `
document.querySelectorAll('[data-arc]').forEach(function(sec){
  if(sec.__arcOn) return; sec.__arcOn=1;
  var stage=sec.querySelector('.arc__stage');
  var cards=[].slice.call(sec.querySelectorAll('.arc__card'));
  if(!stage||cards.length<2) return;
  var RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
  var VIS=2, MIN=2*VIS+4;
  var base=cards.slice();
  while(cards.length < MIN){ base.forEach(function(c){ if(cards.length>=MIN)return;
    var cl=c.cloneNode(true); cl.removeAttribute('data-i'); stage.appendChild(cl); cards.push(cl); }); }
  var n=cards.length, active=0, timer=null;
  var prev=sec.querySelector('.arc__prev'), next=sec.querySelector('.arc__next');
  sec.classList.add('is-live');
  var ANG=12, DROP=30;
  function layout(){
    var w=cards[0].offsetWidth||280, stepX=w*1.2;
    cards.forEach(function(c,i){
      var off=((i-active)%n+n)%n; if(off>n/2) off-=n;
      var a=Math.abs(off), vis=a<=VIS;
      var sc=Math.max(.84,1-a*0.05);
      c.style.transform='translateX(calc(-50% + '+(off*stepX).toFixed(0)+'px)) translateY('+(off*off*DROP).toFixed(0)+'px) rotate('+(off*ANG).toFixed(2)+'deg) scale('+sc.toFixed(3)+')';
      c.style.zIndex=String(200-Math.round(a*10));
      c.style.opacity=vis?'1':'0';
      c.style.pointerEvents=vis?'auto':'none';
      c.classList.toggle('is-active',off===0);
      c.setAttribute('aria-hidden',String(off!==0));
    });
    var ac=cards[active]; if(ac&&prev&&next){ var m=ac.querySelector('.arc__media')||ac;
      var cy=ac.offsetTop + m.offsetTop + m.offsetHeight/2;
      prev.style.top=cy+'px'; next.style.top=cy+'px'; }
  }
  function go(d){ active=(active+d+n)%n; layout(); }
  if(prev)prev.addEventListener('click',function(){go(-1);restart();});
  if(next)next.addEventListener('click',function(){go(1);restart();});
  cards.forEach(function(c,i){ c.addEventListener('click',function(){ if(i!==active){active=i;layout();restart();} }); });
  addEventListener('resize',layout);
  addEventListener('load',layout);
  layout(); requestAnimationFrame(layout); setTimeout(layout,300);
  function play(){ if(RM)return; stop(); timer=setInterval(function(){go(1);},4200); }
  function stop(){ if(timer){clearInterval(timer);timer=null;} }
  function restart(){ stop(); play(); }
  sec.addEventListener('pointerenter',stop);
  sec.addEventListener('pointerleave',play);
  sec.addEventListener('focusin',stop);
  sec.addEventListener('focusout',play);
  document.addEventListener('visibilitychange',function(){ document.hidden?stop():play(); });
  play();
});
`;

/* ARC-SHOWCASE (promoted from the TUNED coastal-hotel version, 2026-07-06) — a fanned ARC of tilted
 * photo cards (NO card plate — just the photo + caption), prev/next side arrows + autoplay + infinite
 * loop. items:[{photo,cap,cta,href}]. Structure/CSS/JS = exactly what Tong tuned. Degrades to a
 * horizontal scroll rail without JS / under reduced-motion. */
export function arcShowcase({eyebrow='', heading='', items=[]}={}){
  const cards = items.map((it,i)=>`<article class="arc__card" data-i="${i}">
    <div class="arc__media media" data-media="arc-${i}"${it.photo?` data-photo="${it.photo}"`:''} role="img" aria-label="${it.cap||''}"></div>
    ${it.cap?`<figcaption class="arc__cap">${it.cap}</figcaption>`:''}
    ${it.cta?`<a class="arc__cardcta" href="${it.href||'#'}">${it.cta}</a>`:''}
  </article>`).join('');
  return `<section class="section arc" data-section="arc-showcase" data-variant="fan" data-arc>
    <div class="container"><div class="sec-head arc__head">
      ${eyebrow?`<p class="eyebrow">${eyebrow}</p>`:''}
      ${heading?`<h2 class="h2">${heading}</h2>`:''}
    </div></div>
    <div class="arc__viewport">
      <div class="arc__stage">${cards}</div>
      <button class="arc__btn arc__prev" type="button" aria-label="Previous">${icon('<path d="m15 18-6-6 6-6"/>')}</button>
      <button class="arc__btn arc__next" type="button" aria-label="Next">${icon('<path d="m9 18 6-6-6-6"/>')}</button>
    </div>
    <script>${ARC_JS}</script>
  </section>`;
}

/* SCROLL-STATEMENT (promoted from the TUNED coastal-hotel version, 2026-07-06) — full-bleed photo +
 * a CENTRED serif statement whose lines brighten one-by-one on scroll (`text-illuminate`, MOTION_JS;
 * no extra JS). quote = string (split on sentences) or an array of lines. optional cta:{label,href}. */
export function scrollStatement({eyebrow='', quote='', photo='', cta}={}){
  let lines = Array.isArray(quote) ? quote : String(quote).split(/(?<=[.!?])\s+/).filter(Boolean);
  if(lines.length<2) lines = String(quote).trim().split(/\s+/).reduce((a,w,i)=>{ (a[Math.floor(i/6)]=a[Math.floor(i/6)]||[]).push(w); return a; },[]).map(x=>x.join(' '));
  const inner = lines.map(l=>`<span class="mo-ill sst__ln">${l}</span>`).join(' ');
  return `<section class="section sst" data-section="scroll-statement" data-variant="illuminate" data-width="bleed">
    <div class="sst__bg media" data-media="sst"${photo?` data-photo="${photo}"`:''} aria-hidden="true"></div>
    <div class="sst__wrap">
      ${eyebrow?`<p class="eyebrow sst__eyebrow">${eyebrow}</p>`:''}
      <p class="sst__quote" data-motion="text-illuminate">${inner}</p>
      ${cta?`<a class="btn btn-primary sst__cta" href="${cta.href||'#'}">${cta.label}</a>`:''}
    </div>
  </section>`;
}

/* ===== STRUCTURAL sections — learned from a padel-club site (xnrgyclub.com, 2026-07-01). Its
 * identity IS the layout: a strict 4-COLUMN grid every element snaps to, and a pinned FIXED-
 * BACKGROUND slider. Brought in as contract sections so the generator (and any skin) can compose
 * them. base layout lives in SECTION_CSS; skins paint. ============================================ */

/* GRID-EDITORIAL — the signature 4-COLUMN construction grid. Content SNAPS to a visible 4-col rule
 * grid with safe insets: eyebrow (col 1), a giant heading spanning cols 1–3, a body column (col 1),
 * CTAs (col 1), and a large image snapped to cols 3–4. reverse=true mirrors the image to cols 1–2.
 * A genuinely different skeleton — asymmetric GRID PLACEMENT, not a 50/50 split. body = array of paras. */
export function gridEditorial({eyebrow='', title='', body=[], ctas=[], photo='', reverse=false}={}){
  const paras=(Array.isArray(body)?body:[body]).filter(Boolean).map(t=>`<p>${t}</p>`).join('');
  const btns=ctas.map((c,i)=>`<a class="btn ${i===0?'btn-primary':'btn-ghost'}" href="${c.href}">${c.label}</a>`).join('');
  return `<section class="section ge${reverse?' ge--rev':''}" data-section="grid-editorial" data-variant="${reverse?'media-left':'media-right'}">
    <div class="container ge__grid">
      ${eyebrow?`<p class="eyebrow ge__eyebrow" data-motion="reveal-fade">${eyebrow}</p>`:''}
      <h2 class="h2 ge__title" data-motion="reveal-up">${title}</h2>
      <div class="ge__body" data-motion="reveal-up">${paras}${btns?`<div class="ge__cta">${btns}</div>`:''}</div>
      <div class="ge__media media" data-media="ge"${photo?` data-photo="${photo}"`:''} data-motion="reveal-up" role="img" aria-label="${title}"></div>
    </div>
  </section>`;
}

/* FIXED-SHOWCASE — a full-bleed section whose BACKGROUND STAYS FIXED while a centred card advances.
 * A pinned backdrop (a texture / photo) holds still; the centre card (NN-of-NN index, title, photo,
 * body) cross-fades between slides driven by scroll + prev/next + dots; two bracketed labels are
 * pinned at the viewport edges. Degrades to a plain stacked list without JS / under reduced-motion /
 * on mobile (every card is in the DOM and readable). slides:[{title,body,photo}]. (FIXEDSHOW_JS) */
export function fixedShowcase({label='', hint='Keep scrolling', backdrop='', slides=[]}={}){
  const n=slides.length;
  const cards=slides.map((s,i)=>`<article class="fx__card${i===0?' is-active':''}" data-i="${i}">
    <p class="fx__ix mono">${String(i+1).padStart(2,'0')} <span class="fx__ixn">- ${String(n).padStart(2,'0')}</span></p>
    <h3 class="h2 fx__title">${s.title}</h3>
    <div class="fx__media media" data-media="fx-${i}"${s.photo?` data-photo="${s.photo}"`:''} role="img" aria-label="${s.title||''}"></div>
    ${s.body?`<p class="fx__body">${s.body}</p>`:''}
  </article>`).join('');
  const dots=slides.map((s,i)=>`<button class="fx__dot${i===0?' is-active':''}" type="button" data-i="${i}" aria-label="Show slide ${i+1}"></button>`).join('');
  const spacers=slides.map((_,i)=>`<div class="fx__spacer" data-i="${i}"></div>`).join('');
  return `<section class="section fx" data-section="fixed-showcase" data-variant="pinned" data-width="bleed" data-fixed-showcase>
    <div class="fx__pin">
      <div class="fx__bg media" data-media="fx-bg"${backdrop?` data-photo="${backdrop}"`:''} aria-hidden="true"></div>
      ${label?`<span class="fx__label fx__label--l">${label}</span>`:''}
      ${hint?`<span class="fx__label fx__label--r">${hint}</span>`:''}
      <div class="fx__stage">
        <div class="fx__cards">${cards}</div>
        <div class="fx__nav"><button class="fx__arrow" type="button" data-d="-1" aria-label="Previous slide">${icon('<path d="m15 18-6-6 6-6"/>',20)}</button><div class="fx__dots" role="group" aria-label="Slides">${dots}</div><button class="fx__arrow" type="button" data-d="1" aria-label="Next slide">${icon('<path d="m9 18 6-6-6-6"/>',20)}</button></div>
      </div>
    </div>
    <div class="fx__track" aria-hidden="true">${spacers}</div>
  </section>`;
}

/* ===== STRUCTURAL promotion candidates — learned from an enterprise process-automation site
 * (poetic.com ingestion, 2026-06-30). LESSON (re-stated by Tong): a learned site's identity is
 * its LAYOUT/STRUCTURE, not only paint — these bring NEW skeletons (asymmetric scattered text,
 * graphic metric cards, full-bleed product panels, giant wordmark band). A skin dresses them;
 * future skins should vary them. base layout lives in SECTION_CSS_X; skins paint. */

function avatarFor(name='', i=0){
  const _i=((name||'').trim()[0]||'?').toUpperCase();
  const _cl=['#0C7C6C','#0E0E0E','#13A18C','#1A1A1A','#0A5F54','#2A2A2A'][i%6];
  const _sv=`<svg xmlns='http://www.w3.org/2000/svg' width='112' height='112'><rect width='112' height='112' fill='${_cl}'/><text x='56' y='76' font-family='Arial,sans-serif' font-weight='700' font-size='52' fill='#fff' text-anchor='middle'>${_i}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(_sv)}`;
}

/* splitHeading — a heading whose SEGMENTS carry different tones (the "colour shifts mid-sentence"
 * treatment). segs:[{t,tone}] tone:'ink'|'accent'|'muted'. data-motion word-reveal scroll-recolours. */
export function splitHeading(segs=[], cls='h2'){
  return `<h2 class="${cls} xhead" data-motion="word-reveal">${segs.map(s=>
    `<span class="xhead__seg xhead--${s.tone||'ink'}">${s.t}</span>`).join(' ')}</h2>`;
}

/* STAT-CARDS — square GRAPHIC metric cards: big number top-left, a centred graphic, caption
 * bottom-left, a tiny corner accent. (graphic-rich metric band, not flat text tiles.)
 * items:[{num,label,photo}]. */
export function statCards({items=[]}={}){
  return `<section class="section stc" data-section="stat-cards" data-variant="grid">
    <div class="container">
      <div class="stc__grid">${items.map((it,i)=>`<article class="stc__card" data-section-item="stat">
        <span class="stc__num">${it.num}</span>
        <div class="stc__graphic media" data-media="stc-${i}"${it.photo?` data-photo="${it.photo}"`:''} role="img" aria-label="${it.label||''}"></div>
        <p class="stc__cap small">${it.label||''}</p>
        <span class="stc__corner" aria-hidden="true"></span>
      </article>`).join('')}</div>
    </div></section>`;
}

/* SHOWCASE-PANELS — LARGE full-bleed product panels in a row: title TOP-LEFT, big index TOP-RIGHT,
 * corner accent, a floating light product MOCK inside. heading via splitHeading segments.
 * items:[{title,photo}]. */
export function showcasePanels({headingSegs=[], items=[]}={}){
  return `<section class="section spnl" data-section="showcase-panels" data-variant="row">
    <div class="container">
      ${headingSegs.length?splitHeading(headingSegs,'h2'):''}
      <div class="spnl__grid">${items.map((it,i)=>`<article class="spnl__panel" data-section-item="panel">
        <div class="spnl__top"><h3 class="spnl__title">${it.title}</h3><span class="spnl__ix mono">/${i+1}</span></div>
        <span class="spnl__corner" aria-hidden="true"></span>
        <div class="spnl__mock media" data-media="spnl-${i}"${it.photo?` data-photo="${it.photo}"`:''} role="img" aria-label="${it.title||''}"></div>
      </article>`).join('')}</div>
    </div></section>`;
}

/* SPOTLIGHT-SHOW — ASYMMETRIC full-bleed black showcase (scattered text): index + label TOP-LEFT,
 * a graphic TOP-RIGHT, an OFFSET large quote, attribution BOTTOM-LEFT, prev/next + brand-tab
 * switcher BOTTOM-RIGHT, and a GIANT wordmark band beneath. Tabs/arrows cross-fade slides
 * (SHOW_JS, keyboard-operable; data in a JSON island). slides:[{quote,name,role,brand,graphic}]. */
export function spotlightShow({label='', slides=[]}={}){
  const data = slides.map((s,i)=>({quote:s.quote||'',name:s.name||'',role:s.role||'',brand:s.brand||('0'+(i+1)),graphic:s.graphic||'',avatar:s.avatar||avatarFor(s.name,i)}));
  const s0=data[0]||{};
  const tabs = data.map((s,i)=>`<button class="sx__tab${i===0?' is-active':''}" type="button" data-i="${i}" aria-pressed="${i===0?'true':'false'}">${s.brand}</button>`).join('');
  return `<section class="section sx" data-section="spotlight-show" data-variant="asymmetric" data-ground="dark" data-spotlight-show>
    <script type="application/json" class="sx__data">${JSON.stringify(data).replace(/</g,'\\u003c')}</script>
    <div class="container sx__wrap">
      <div class="sx__head"><span class="sx__ix">1</span>${label?`<p class="sx__label small">${label}</p>`:''}</div>
      <div class="sx__graphic media" data-media="sx-g"${s0.graphic?` data-photo="${s0.graphic}"`:''} role="img" aria-label=""></div>
      <blockquote class="sx__quote">${s0.quote}</blockquote>
      <figure class="sx__by">
        <img class="sx__avatar" src="${s0.avatar}" alt="" loading="lazy" width="56" height="56">
        <figcaption><span class="sx__name">${s0.name}</span><span class="small muted sx__role">${s0.role}</span></figcaption>
      </figure>
      <div class="sx__controls">
        <div class="sx__nav"><button class="sx__arrow" type="button" data-d="-1" aria-label="Previous story">${icon('<path d="m15 18-6-6 6-6"/>',20)}</button><button class="sx__arrow" type="button" data-d="1" aria-label="Next story">${icon('<path d="m9 18 6-6-6-6"/>',20)}</button></div>
        <div class="sx__tabs" role="group" aria-label="Choose a story">${tabs}</div>
      </div>
    </div>
    <div class="sx__wordmark" aria-hidden="true">${s0.brand}</div>
  </section>`;
}

/* base layout for the structural promotions (skins paint over this). */
export const SECTION_CSS_X = `
/* team (promoted 2026-07-10) — BIG people cards, 3 across a screen. DEFAULT: a small centred image floats in
 * the card's upper-middle over the plain card, with the info beneath it (dark text). HOVER: the image ENLARGES
 * to fill the WHOLE card and the name/role read in white over its base. The info box stays put; only the
 * backdrop swaps (card → image+scrim) so the text colour cross-fades. Socials show in both states. */
.team__grid{display:grid;gap:clamp(1rem,2vw,2rem);grid-template-columns:1fr;margin-top:var(--space-7)}
@media(min-width:560px){.team__grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(min-width:860px){.team__grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(min-width:1160px){.team__grid{grid-template-columns:repeat(4,minmax(0,1fr))}}
.team__card{position:relative;aspect-ratio:4/5;overflow:hidden;background:var(--surface);isolation:isolate;
  transition:box-shadow .45s var(--mo-ease,ease)}
/* image box — a SQUARE (1:1), SHARP corners, in the upper-middle by default; grows to fill the card on hover.
   (bottom:32.8% makes it exactly square on the 4/5 card: width 74% == height 74%.) */
.team__media{position:absolute;top:8%;left:13%;right:13%;bottom:32.8%;z-index:0;overflow:hidden;aspect-ratio:auto;border:0;border-radius:0;
  transition:top .55s var(--mo-ease,cubic-bezier(.2,.8,.2,1)),left .55s var(--mo-ease,cubic-bezier(.2,.8,.2,1)),right .55s var(--mo-ease,cubic-bezier(.2,.8,.2,1)),bottom .55s var(--mo-ease,cubic-bezier(.2,.8,.2,1))}
.team__card:hover .team__media,.team__card:focus-within .team__media{top:0;left:0;right:0;bottom:0}
.team__media img,.team__media picture,.team__media picture img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
/* scrim only fades in on hover, once the image sits behind the text */
.team__card::after{content:"";position:absolute;left:0;right:0;bottom:0;height:48%;z-index:1;pointer-events:none;opacity:0;
  background:linear-gradient(to top,rgba(8,9,15,.85) 0,rgba(8,9,15,.4) 46%,transparent);transition:opacity .45s}
.team__card:hover::after,.team__card:focus-within::after{opacity:1}
.team__info{position:absolute;left:0;right:0;bottom:0;height:30%;z-index:2;display:flex;align-items:flex-end;justify-content:space-between;gap:.75rem;
  padding:clamp(.35rem,1.4vw,1.15rem) clamp(.55rem,1.4vw,1.35rem);color:var(--ink)}
.team__card:hover .team__info,.team__card:focus-within .team__info{color:#fff}
.team__txt{display:flex;flex-direction:column;gap:.2rem;min-width:0}
.team__name{font-weight:600;font-size:clamp(1.05rem,1.35vw,1.3rem);line-height:1.2}
.team__role{color:var(--ink-soft)}
.team__card:hover .team__role,.team__card:focus-within .team__role{color:rgba(255,255,255,.76)}
/* socials in BOTH states — outlined circles by default, white-filled over the image on hover */
.team__socials{display:flex;gap:.45rem;flex:none}
.team__soc{display:grid;place-items:center;width:36px;height:36px;border-radius:999px;color:var(--ink-soft);
  background:transparent;border:1px solid var(--border);transition:background .3s,color .3s,border-color .3s}
.team__card:hover .team__soc,.team__card:focus-within .team__soc{background:#fff;border-color:transparent;color:#0b0c12}
/* stat-cards */
.stc__grid{display:grid;gap:var(--space-4);grid-template-columns:repeat(2,minmax(0,1fr))}
@media(min-width:880px){.stc__grid{grid-template-columns:repeat(4,minmax(0,1fr))}}
.stc__card{position:relative;display:grid;grid-template-rows:auto 1fr auto;gap:var(--space-3);
  aspect-ratio:1/1;padding:var(--space-5);border-radius:var(--radius);background:var(--surface);overflow:hidden}
.stc__num{font-family:var(--fd);font-weight:800;letter-spacing:-.04em;font-size:clamp(1.6rem,3vw,2.4rem);line-height:1}
.stc__graphic{align-self:center;justify-self:center;width:78%;aspect-ratio:16/10;border:0}
.stc__cap{margin:0}
.stc__corner{position:absolute;right:0;bottom:0;width:14px;height:14px;background:var(--accent)}
/* showcase-panels */
.spnl__grid{display:grid;gap:var(--space-4);grid-template-columns:1fr}
@media(min-width:760px){.spnl__grid{grid-template-columns:repeat(3,1fr)}}
.spnl__panel{position:relative;display:flex;flex-direction:column;gap:var(--space-5);
  min-height:clamp(340px,42vw,520px);padding:clamp(1.4rem,2.4vw,2.2rem);border-radius:var(--radius);
  background:var(--surface);overflow:hidden}
.spnl__top{display:flex;align-items:flex-start;justify-content:space-between;gap:var(--space-4)}
.spnl__ix{flex:none}
.spnl__corner{position:absolute;right:0;top:0;width:16px;height:16px;background:var(--accent)}
.spnl__mock{margin-top:auto;width:100%;aspect-ratio:16/10;border-radius:var(--r-md)}
/* spotlight-show — asymmetric grid (scattered text) */
.sx{padding-block:clamp(3rem,7vw,6rem) 0;overflow:hidden}
/* FIXED HEIGHT so switching slides (different quote lengths) never resizes the block or jumps the
   wordmark: top row (index/label + graphic) TOP-aligned; the quote+attribution+controls cluster
   BOTTOM-aligned. rows = auto (top) · 1fr (slack) · auto (bottom); the quote sits at the bottom
   of the slack row so short quotes leave the gap ABOVE, not below. */
.sx__wrap{display:grid;gap:clamp(1.5rem,3vw,2.5rem);grid-template-columns:1fr 1fr;
  grid-template-rows:auto 1fr auto;min-height:560px;
  grid-template-areas:'head graphic' 'quote quote' 'by controls'}
.sx__head{grid-area:head}
.sx__graphic{grid-area:graphic;justify-self:end;width:min(260px,40vw);aspect-ratio:16/10;border:0}
.sx__quote{grid-area:quote;align-self:end;margin:0;max-width:30ch;margin-left:clamp(0px,8vw,140px)}
.sx__by{grid-area:by;display:flex;align-items:center;gap:var(--space-3);margin:0;align-self:end;margin-left:clamp(0px,8vw,140px)}
.sx__avatar{width:56px;height:56px;object-fit:cover}
.sx__by figcaption{display:flex;flex-direction:column}
.sx__controls{grid-area:controls;display:flex;align-items:flex-end;justify-content:space-between;gap:var(--space-4);flex-wrap:wrap}
.sx__nav{display:flex;gap:var(--space-2)}
.sx__arrow{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;padding:0;border-radius:var(--r-pill);border:1px solid currentColor;background:transparent;color:inherit;cursor:pointer;font-size:1.2rem;line-height:0}
.sx__tabs{display:flex;gap:var(--space-4)}
.sx__tab{display:inline-flex;align-items:center;min-height:44px;background:transparent;border:0;color:inherit;opacity:.5;cursor:pointer;font-family:var(--fd);font-weight:700;letter-spacing:-.01em;font-size:1rem;padding:.3rem .1rem}
.sx__tab.is-active{opacity:1}
.sx__wordmark{font-family:var(--fd);font-weight:800;letter-spacing:-.055em;line-height:.78;
  font-size:clamp(4.5rem,26vw,22rem);white-space:nowrap;overflow:hidden;margin-top:clamp(1rem,3vw,2.5rem)}
@media(max-width:639px){
  .sx__wrap{grid-template-columns:1fr;grid-template-rows:none;min-height:0;grid-template-areas:'head' 'graphic' 'quote' 'by' 'controls'}
  .sx__graphic{justify-self:start}.sx__quote{margin-left:0;align-self:auto}.sx__by{margin-left:0}
}
/* split heading tones (skin sets the colours) */
.xhead__seg{transition:opacity .5s ease,color .5s ease}
/* word-reveal: segments dim until the heading enters view (JS adds .is-in) — final state AA */
[data-motion="word-reveal"] .xhead__seg{opacity:.32}
[data-motion="word-reveal"].is-in .xhead__seg{opacity:1}
@media(prefers-reduced-motion:reduce){[data-motion="word-reveal"] .xhead__seg{opacity:1}}
/* pinned-split — CENTER media pinned + cross-fading; text panels alternate L/R and scroll past.
   Base geometry (role-token paint; skins override .pin__* to taste). */
.pin{padding-block:0;position:relative}
.pin__intro{max-width:52rem;margin-inline:auto;text-align:center;padding-block:clamp(3rem,7vw,6rem) 0}
.pin__intro .lead{margin-top:var(--space-3)}
.pin__wrap{position:relative}
.pin__device{position:relative;width:min(300px,72vw);margin-inline:auto}
.pin__frame{position:absolute;inset:0;opacity:0;transition:opacity .6s var(--mo-ease,ease)}
.pin__frame:first-child{position:relative}          /* first frame holds the stage height */
.pin__frame.is-active{opacity:1}
.pin__shot{aspect-ratio:1/2;width:100%;border-radius:var(--r-xl);overflow:hidden;margin:0}
.pin__panel{padding-inline:var(--gutter)}
.pin__copy{max-width:34rem}
.pin__title{margin-bottom:var(--space-3)}
@media(min-width:1024px){
  .pin__stage{position:sticky;top:0;height:100svh;display:grid;place-items:center;z-index:1;pointer-events:none}
  .pin__panels{position:relative;z-index:2;margin-top:-100svh;pointer-events:none}
  .pin__panel{min-height:100svh;display:flex;align-items:center}
  .pin__panel:nth-child(odd){justify-content:flex-start}
  .pin__panel:nth-child(even){justify-content:flex-end;text-align:right}
  .pin__copy{max-width:min(34%,30rem);pointer-events:auto}
}
/* mobile / narrow: static stack — device (frame 1) on top, copy blocks below, all readable */
@media(max-width:1023px){
  .pin__wrap{display:flex;flex-direction:column;gap:clamp(2rem,6vw,3rem);padding-block:clamp(2.5rem,7vw,4rem)}
  .pin__stage{order:-1}
  .pin__panels{display:flex;flex-direction:column;gap:clamp(1.5rem,5vw,2.5rem)}
  .pin__panel{min-height:0}
}
@media(prefers-reduced-motion:reduce){
  .pin__stage{position:static;height:auto}
  .pin__panels{margin-top:0}
  .pin__panel{min-height:0;margin-block:clamp(1rem,4vw,2rem)}
}
/* testimonial CASE carousel — a horizontal DRAG row of compact split cards (~1.5 show at once); cards fade
   in/out at the browser edges (no hard cut). Drag via data-mos-drag (MOS_JS); arrows/dots scroll (TM_JS). */
.tm--case .tm__stage{display:flex;gap:clamp(1rem,2vw,1.6rem);overflow-x:auto;overflow-y:hidden;cursor:grab;
  scroll-snap-type:x proximity;scrollbar-width:none;-ms-overflow-style:none;padding-inline:var(--gutter);padding-block:.4rem;margin-top:var(--space-5);
  -webkit-mask:linear-gradient(90deg,transparent 0,#000 clamp(28px,5vw,96px),#000 calc(100% - clamp(28px,5vw,96px)),transparent 100%);
          mask:linear-gradient(90deg,transparent 0,#000 clamp(28px,5vw,96px),#000 calc(100% - clamp(28px,5vw,96px)),transparent 100%)}
.tm--case .tm__stage::-webkit-scrollbar{display:none}
.tm--case .tm__stage.is-drag{cursor:grabbing;scroll-snap-type:none}
.tm__case{flex:none;width:min(80vw,640px);scroll-snap-align:center;display:grid;grid-template-columns:1fr;border-radius:var(--r-card,20px);overflow:hidden;background:var(--surface)}
@media(min-width:820px){.tm__case{grid-template-columns:.82fr 1.18fr}}
.tm__caseMedia{position:relative;aspect-ratio:4/3;width:100%;border:0;border-radius:0;margin:0}
@media(min-width:820px){.tm__caseMedia{aspect-ratio:auto;min-height:320px}}
.tm__play{position:absolute;left:18px;bottom:18px;width:44px;height:44px;border-radius:50%;border:0;background:var(--pop,#C9F24C);color:#111;display:inline-flex;align-items:center;justify-content:center;cursor:pointer}
.tm__caseBody{padding:clamp(1.25rem,2.2vw,1.9rem);display:flex;flex-direction:column;gap:var(--space-4)}
.tm__caseTop{display:flex;align-items:flex-start;justify-content:space-between;gap:var(--space-4);flex-wrap:wrap}
.tm__company{font-family:var(--fd);font-weight:600;font-size:1.05rem}
.tm__statWrap{display:flex;flex-direction:column;align-items:flex-end;gap:.2rem;text-align:right}
.tm__statPill{display:inline-flex;align-items:center;gap:.3rem;background:var(--pop,#C9F24C);color:#111;border-radius:var(--r-pill);padding:.28rem .66rem;font-weight:700}
/* tm__stat — quote-card metric (label over value); used by spotlight/cards/marquee layouts */
.tm__stat{display:flex;flex-direction:column;gap:.15rem;margin-bottom:var(--space-2)}
.tm__stat-label{text-transform:uppercase;letter-spacing:.08em;font-size:.72rem;color:var(--ink-soft)}
.tm__stat-value{font-family:var(--fd);font-weight:700;font-size:clamp(1.3rem,2.4vw,1.8rem);line-height:1;color:var(--ink)}
.tm__caseQuote{margin:0;font-size:clamp(1.1rem,1.7vw,1.45rem);line-height:1.34;flex:1}
.tm__caseFoot{display:flex;align-items:center;justify-content:space-between;gap:var(--space-4);flex-wrap:wrap;margin:0}
.tm__caseFoot .tm__by{display:flex;align-items:center;gap:var(--space-3)}
.tm__caseFoot .tm__avatar{width:44px;height:44px;border-radius:50%;object-fit:cover;flex:none}
.tm__caseFoot .tm__meta{display:flex;flex-direction:column}
.tm__caseCta{display:inline-flex;align-items:center;gap:.4rem;text-decoration:none;font-weight:600;color:var(--ink)}
.tm__nav{display:flex;align-items:center;justify-content:center;gap:var(--space-5);margin-top:var(--space-6)}
.tm__dots{display:flex;align-items:center;gap:.35rem}
.tm__dot{width:40px;height:40px;min-width:40px;min-height:40px;padding:0;border:0;background:transparent;cursor:pointer;position:relative}
.tm__dot::before{content:"";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:9px;height:9px;border-radius:50%;background:var(--border);transition:background .2s,width .2s}
.tm__dot.is-active::before{width:22px;border-radius:5px;background:var(--ink)}
.tm__arrow{width:44px;height:44px;flex:none;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;border:1px solid var(--border);background:transparent;color:var(--ink);cursor:pointer}
/* stats-band REVEAL — pinned left header · right column of huge numbers focused one-at-a-time */
.stats--reveal .stats__revwrap{display:grid;gap:clamp(1.5rem,4vw,3rem);grid-template-columns:1fr}
@media(min-width:900px){.stats--reveal .stats__revwrap{grid-template-columns:.82fr 1.18fr;align-items:start}
  .stats--reveal .stats__lead{position:sticky;top:clamp(4.5rem,20vh,10rem);align-self:start}}
.stats--reveal .stats__stack{display:flex;flex-direction:column;gap:clamp(2.5rem,13vh,8rem);padding-block:clamp(1.5rem,9vh,6rem)}
.st__row{display:block}
.st__num{font-family:var(--fd);font-weight:800;letter-spacing:-.04em;line-height:.9;font-size:clamp(3.2rem,11vw,8.5rem);font-variant-numeric:tabular-nums}
.st__cap{max-width:32ch;margin-top:var(--space-3)}
/* footer PANEL — oversized wordmark + link columns · frosted CTA card over an image card · grid ground */
.ftp{position:relative;overflow:hidden;padding-block:clamp(2.5rem,6vw,4.5rem) clamp(1.4rem,3vw,2.4rem)}
.ftp__grid{position:absolute;inset:0;z-index:0;pointer-events:none;
  background-image:linear-gradient(to right,var(--ftp-line,rgba(255,255,255,.06)) 1px,transparent 1px),linear-gradient(to bottom,var(--ftp-line,rgba(255,255,255,.06)) 1px,transparent 1px);
  background-size:var(--ftp-cell,72px) var(--ftp-cell,72px);-webkit-mask:linear-gradient(#000,transparent);mask:linear-gradient(#000,transparent)}
.ftp>.container{position:relative;z-index:1}
/* ALL panel rules scoped under .ftp so they NEVER leak into the default/cover footer of other skins
   (.ft__name / .ft__bottom / .ft__col are shared class names — the panel styling must stay panel-only). */
.ftp .ft__pgrid{display:grid;gap:clamp(1.6rem,4vw,3rem);grid-template-columns:1fr;align-items:start}
/* brand on TOP-left · link columns BENEATH it as THREE columns · promo card on the right (with a
   generous gap between the left text block and the right image block) */
@media(min-width:900px){.ftp .ft__pgrid{grid-template-columns:1fr .9fr;grid-template-areas:'brand promo' 'cols promo';row-gap:clamp(2rem,5vw,3.4rem);column-gap:clamp(3.5rem,8vw,8rem)}
  .ftp .ft__brandBlock{grid-area:brand}.ftp .ft__cols{grid-area:cols}.ftp .ft__promoWrap{grid-area:promo}}
.ftp .ft__name{font-family:var(--fd);font-weight:800;letter-spacing:-.04em;line-height:.86;font-size:clamp(2.4rem,6vw,4.4rem)}
.ftp .ft__cols{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(1rem,2.5vw,2rem)}
@media(max-width:560px){.ftp .ft__cols{grid-template-columns:repeat(2,1fr)}}
.ftp .ft__cols .ft__col ul{display:flex;flex-direction:column;gap:.55rem;margin-top:var(--space-3)}
.ftp .ft__promoWrap{display:flex;flex-direction:column;gap:var(--space-4)}
.ftp .ft__promo{border-radius:var(--radius);padding:clamp(1.3rem,2.4vw,1.9rem)}   /* structure only — the skin paints the card */
.ftp .ft__promoTitle{font-family:var(--fd);font-weight:600;font-size:clamp(1.05rem,1.6vw,1.3rem);line-height:1.25;margin:var(--space-3) 0 var(--space-4)}
.ftp .ft__shot{aspect-ratio:16/10;border-radius:var(--radius);margin:0}
.ftp .ft__bottom{display:flex;align-items:center;gap:var(--space-4);flex-wrap:wrap;justify-content:space-between;margin-top:clamp(2rem,5vw,3.5rem)}
.ftp .ft__legal{display:inline-flex;gap:var(--space-5);flex-wrap:wrap}
/* pinned-split SLIDE variant — center image slides UP & leaves over a short scroll; side heading +
   description cross-fade IN PLACE (PIN_SLIDE_JS drives the transforms/active frame). */
.pin--slide{padding-block:0}
.pin--slide .pins__track{position:relative;height:calc((var(--n) + 1) * 90svh)}
.pin--slide .pins__stage{position:sticky;top:0;height:100svh;display:grid;grid-template-columns:1.15fr auto 1.15fr;align-items:center;gap:clamp(1.2rem,3vw,3rem)}
.pins__center{position:relative;width:min(390px,50vw);aspect-ratio:3/4;justify-self:center}
.pins__shot{position:absolute;inset:0;margin:0;aspect-ratio:auto;border-radius:var(--r-xl);overflow:hidden;opacity:0;will-change:transform,opacity}
.pins__shot.is-front{opacity:1}
.pins__col{position:relative;align-self:center;height:64%;width:100%}   /* fill the track so %-widths on the absolute text resolve */
.pins__left{text-align:left}
.pins__right{text-align:right}
/* side text FILLS its column (up to ~32rem) so a line holds a comfortable 5–8 words, not 1–2 */
.pins__text,.pins__desc{position:absolute;top:50%;width:min(32rem,100%);transform:translateY(-42%);opacity:0;transition:opacity .55s var(--mo-ease,ease),transform .55s var(--mo-ease,ease)}
.pins__left .pins__text{left:0}
.pins__right .pins__desc{right:0}
.pins__text.is-on,.pins__desc.is-on{opacity:1;transform:translateY(-50%)}
@media(max-width:860px){
  .pin--slide .pins__track{height:auto}
  .pin--slide .pins__stage{position:static;height:auto;display:block;padding-block:clamp(2rem,8vw,4rem)}
  .pins__center{width:min(280px,68vw);margin:0 auto clamp(1.4rem,6vw,2.4rem)}
  .pins__shot{position:relative;opacity:1!important;transform:none!important}
  .pins__shot:not([data-i="0"]){display:none}
  .pins__col{height:auto}
  .pins__text,.pins__desc{position:relative;top:auto;transform:none;opacity:1;text-align:left;max-width:none;margin-block:0 clamp(1rem,4vw,1.6rem)}
  .pins__right{text-align:left}
}
@media(prefers-reduced-motion:reduce){.pins__shot{opacity:1}.pins__text,.pins__desc{opacity:1;transform:translateY(-50%)}}
`;

/* spotlight-show tab/arrow switcher + word-reveal IO. Injected by the build. */
export const SHOW_JS = `
document.querySelectorAll('[data-spotlight-show]').forEach(function(sec){
  var data=[];try{data=JSON.parse(sec.querySelector('.sx__data').textContent)}catch(e){return;}
  if(data.length<2) return;
  var q=sec.querySelector('.sx__quote'),nm=sec.querySelector('.sx__name'),ro=sec.querySelector('.sx__role'),
      av=sec.querySelector('.sx__avatar'),wm=sec.querySelector('.sx__wordmark'),
      tabs=[].slice.call(sec.querySelectorAll('.sx__tab')),cur=0;
  function show(i){ i=(i+data.length)%data.length; cur=i; var d=data[i];
    q.style.opacity=0; setTimeout(function(){ q.textContent=d.quote; nm.textContent=d.name; ro.textContent=d.role;
      av.src=d.avatar; wm.textContent=d.brand; q.style.opacity=1; },160);
    tabs.forEach(function(t,j){ t.classList.toggle('is-active',j===i); t.setAttribute('aria-pressed',String(j===i)); });
  }
  q.style.transition='opacity .25s ease';
  tabs.forEach(function(t){ t.addEventListener('click',function(){ show(+t.getAttribute('data-i')); }); });
  sec.querySelectorAll('.sx__arrow').forEach(function(a){ a.addEventListener('click',function(){ show(cur+ +a.getAttribute('data-d')); }); });
});
(function(){
  if(!('IntersectionObserver' in window)){document.querySelectorAll('[data-motion=\\'word-reveal\\']').forEach(function(h){h.classList.add('is-in')});return;}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){ if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target);} });},{threshold:.35});
  document.querySelectorAll('[data-motion="word-reveal"]').forEach(function(h){io.observe(h);});
})();
`;

/* Section-owned CSS (layout + responsive + mobile-nav). Injected once by the build. */
export const SECTION_CSS = `
/* nav */
.nav{position:sticky;top:0;z-index:100;background:var(--bg);border-bottom:1px solid var(--border)}
.nav__bar{display:flex;align-items:center;justify-content:space-between;min-height:64px;gap:var(--space-5)}
.nav__brand{font-family:var(--fd);font-weight:700;font-size:1.25rem;letter-spacing:-.02em;text-decoration:none}
.nav__menu{display:flex;align-items:center;gap:var(--space-6)}
.nav__links{display:flex;gap:var(--space-5);list-style:none;margin:0;padding:0}
.nav__links a{text-decoration:none;color:var(--ink-soft);font-weight:500}
.nav__links a:hover{color:var(--ink)}
/* theme toggle (nav + footer) */
.theme-toggle{display:inline-flex;align-items:center;gap:.45rem;min-height:44px;min-width:44px;justify-content:center;padding:.4rem .7rem;border-radius:var(--r-pill);border:1px solid var(--border);background:var(--surface);color:var(--ink);font:600 .82rem var(--fb);cursor:pointer;transition:border-color .15s,background .15s}
.theme-toggle:hover{border-color:var(--ink-soft)}
.theme-toggle svg{width:18px;height:18px;flex:none}
.theme-toggle__icon{display:none;align-items:center}
html[data-theme="light"] .theme-toggle__moon{display:inline-flex}
html[data-theme="dark"] .theme-toggle__sun{display:inline-flex}
.theme-toggle__label{display:none}
.theme-toggle--footer .theme-toggle__label{display:inline}
.ft__bottom{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--space-3)}
.nav__burger{display:none;align-items:center;justify-content:center;width:44px;height:44px;
  background:transparent;border:1px solid var(--border);border-radius:var(--r-sm);color:var(--ink);cursor:pointer}
@media(max-width:767px){
  .nav__burger{display:inline-flex}
  .nav__menu{position:absolute;left:0;right:0;top:100%;flex-direction:column;align-items:stretch;gap:var(--space-4);
    background:var(--bg);border-bottom:1px solid var(--border);padding:var(--space-5);
    transform:translateY(-8px);opacity:0;visibility:hidden;transition:opacity .18s,transform .18s,visibility .18s}
  .nav[data-open="true"] .nav__menu{transform:none;opacity:1;visibility:visible}
  .nav__links{flex-direction:column;gap:var(--space-2)}
  .nav__links a{display:block;padding:.6rem 0}
  .nav__cta{width:100%}
}
/* hero — layout variants (split · split-reverse · centered · stacked) */
.hero__grid{display:grid;gap:var(--space-7);align-items:center}
@media(min-width:880px){
  .hero--split{grid-template-columns:1.05fr .95fr}
  .hero--split-reverse{grid-template-columns:.95fr 1.05fr}
}
.hero--centered{text-align:center;max-width:54rem;margin-inline:auto}
.hero--centered .hero__cta{justify-content:center}
.hero--stacked{text-align:center;justify-items:center}            /* text over a wide media band */
.hero--stacked .hero__text{max-width:54rem}
.hero--stacked .hero__cta{justify-content:center}
.hero--stacked .hero__media{width:100%;aspect-ratio:16/7}
.hero__lead{margin-top:var(--space-4);max-width:46ch}
.hero--stacked .hero__lead,.hero--centered .hero__lead{margin-inline:auto}
.hero__cta{display:flex;flex-wrap:wrap;gap:var(--space-3);margin-top:var(--space-6)}
.hero .media{aspect-ratio:5/4}
/* feature-split */
.fs__heading{max-width:20ch;margin-bottom:var(--space-7)}
.fs__rows{display:flex;flex-direction:column;gap:clamp(2.5rem,6vw,5rem)}
.fs__row{display:grid;gap:var(--space-6);align-items:center}
@media(min-width:880px){
  .fs__row{grid-template-columns:1fr 1fr}                     /* ratio: even (default) */
  .fs--media-wide .fs__row{grid-template-columns:1fr 1.5fr}  /* media column wider */
  .fs--text-wide .fs__row{grid-template-columns:1.5fr 1fr}   /* text column wider */
  .fs--rev .fs__text{order:2}
}
.fs__icon{display:inline-flex;width:48px;height:48px;align-items:center;justify-content:center;
  border:1px solid var(--border);border-radius:var(--r-md);color:var(--accent);margin-bottom:var(--space-4)}
.fs__text .lead{margin-top:var(--space-3)}
/* cta — the panel is ALWAYS inset from the screen edges by the responsive gutter (never full-bleed):
   the section carries the side gutter and the panel is a max-width block centred inside it. This is the
   canonical fix (skins must NOT set .cta{padding-inline:0}); it keeps a comfortable margin at every bp. */
.cta{padding-inline:var(--gutter)}
.cta__panel{max-width:var(--container);margin-inline:auto;
  background:var(--accent);color:var(--accent-ink);border-radius:var(--r-xl);
  padding:clamp(2rem,5vw,3.5rem);display:flex;flex-wrap:wrap;gap:var(--space-5);
  align-items:center;justify-content:space-between}
.cta__title{color:var(--accent-ink);max-width:24ch}
.cta__sub{color:var(--accent-ink);opacity:.92;margin-top:var(--space-3);max-width:46ch}
.cta__btn{background:var(--accent-ink);color:var(--accent)}
/* footer */
footer{background:var(--surface);border-top:1px solid var(--border);padding-block:var(--space-8) var(--space-6);margin-top:var(--space-2)}
.ft__grid{display:grid;gap:var(--space-6)}
@media(min-width:680px){ .ft__grid{grid-template-columns:1.6fr 1fr 1fr 1fr} }
.ft__name{font-family:var(--fd);font-weight:700;font-size:1.2rem}
.ft__brand .small{color:var(--ink-soft);margin-top:var(--space-2);max-width:34ch}
.ft__h{font-family:var(--fd);font-size:.95rem;margin-bottom:var(--space-3)}
.ft__col ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:var(--space-2)}
.ft__col a{text-decoration:none;color:var(--ink-soft)} .ft__col a:hover{color:var(--ink)}
.ft__bottom{margin-top:var(--space-7);color:var(--ink-soft)}
/* ===== Phase-2 sections ===== */
.muted{color:var(--ink-soft)}
.sec-head{max-width:60ch;margin:0 auto var(--space-7);text-align:center}
.sec-head .lead{margin-top:var(--space-3)}
/* feature-grid */
.fg__grid{display:grid;gap:var(--space-5);grid-template-columns:1fr}
@media(min-width:640px){.fg__grid{grid-template-columns:repeat(2,1fr)}}
@media(min-width:960px){.fg__grid{grid-template-columns:repeat(var(--fg-cols,3),1fr)}}
.fg__card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:var(--space-5)}
.fg__icon{display:inline-flex;width:46px;height:46px;align-items:center;justify-content:center;border:1px solid var(--border);border-radius:var(--r-md);color:var(--accent);margin-bottom:var(--space-4)}
.fg__card .h3{margin-bottom:var(--space-2)}
/* feature-grid: BENTO mosaic (mixed-size tiles → a different grid skeleton, not a uniform row) */
@media(min-width:760px){
  .fg__grid.fg--bento{grid-template-columns:repeat(4,1fr);grid-auto-rows:minmax(148px,1fr);grid-auto-flow:dense}
  .fg--bento .fg__card{display:flex;flex-direction:column;justify-content:flex-end}
  .fg--bento .fg__card:nth-child(6n+1){grid-column:span 2;grid-row:span 2}   /* feature tile */
  .fg--bento .fg__card:nth-child(6n+2){grid-column:span 2}                    /* wide */
  .fg--bento .fg__card:nth-child(6n+6){grid-column:span 2}                    /* wide */
}
/* logos */
.logos__label{text-align:center;letter-spacing:.04em}
.logos__row{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:var(--space-5) var(--space-7);margin-top:var(--space-5)}
.logos__item{font-family:var(--fd);font-weight:700;font-size:1.3rem;color:var(--ink-soft);opacity:.7;letter-spacing:-.01em}
/* stats */
.stats__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:var(--space-6);text-align:center}
.stats__num{font-family:var(--fd);font-weight:700;font-size:clamp(2.2rem,5vw,3.4rem);color:var(--accent);line-height:1;letter-spacing:-.02em}
.stats__cell .small{margin-top:var(--space-2)}
/* steps */
.steps__list{list-style:none;margin:0;padding:0;display:grid;gap:var(--space-6)}
@media(min-width:880px){.steps__list{grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}}
.steps__item{display:flex;gap:var(--space-4);align-items:flex-start}
.steps__num{font-family:var(--fd);font-weight:700;font-size:1rem;color:var(--accent-ink);background:var(--accent);width:40px;height:40px;flex:none;display:flex;align-items:center;justify-content:center;border-radius:var(--r-pill)}
.steps__item .h3{margin-bottom:var(--space-1)}
/* testimonial — layout variants (cards · spotlight · marquee) */
.tm__grid{display:grid;gap:var(--space-5);grid-template-columns:1fr}
@media(min-width:760px){.tm--cards .tm__grid{grid-template-columns:repeat(3,1fr)}}
.tm__card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:var(--space-5);margin:0;display:flex;flex-direction:column;gap:var(--space-4)}
.tm__quote{margin:0;font-size:1.05rem;line-height:1.55}
.tm__by{display:flex;align-items:center;gap:var(--space-3);margin-top:auto}   /* avatar + name row, pinned to card bottom */
.tm__avatar{width:44px;height:44px;border-radius:50%;object-fit:cover;flex:none}
.tm__meta{display:flex;flex-direction:column}
.tm__name{font-family:var(--fd);font-weight:600}
/* spotlight: one big centred quote column (no card chrome) */
.tm--spotlight .tm__grid{max-width:56rem;margin-inline:auto;gap:var(--space-7)}
.tm--spotlight .tm__card{background:transparent;border:0;padding:0;text-align:center;align-items:center;gap:var(--space-4)}
.tm--spotlight .tm__quote{font-size:clamp(1.4rem,3.2vw,2.1rem);line-height:1.35}
.tm--spotlight .tm__by{margin-top:0;flex-direction:column;gap:var(--space-2);text-align:center}
.tm--spotlight .tm__avatar{width:56px;height:56px}
/* marquee: scrolling row of fixed-width quote cards (uses the marquee motion primitive) */
/* marquee: a full-bleed scrolling row (the motion primitive sets display:flex + overflow:hidden
   on .tm__marquee; cards are fixed-width so they flow continuously in/out at the screen edges) */
.tm__marquee{margin-top:var(--space-6)}
.tm--marquee .tm__card{width:min(380px,80vw);flex:none;white-space:normal}
/* pricing */
.pr__grid{display:grid;gap:var(--space-5);grid-template-columns:1fr}
@media(min-width:820px){.pr__grid{grid-template-columns:repeat(3,1fr);align-items:stretch}}   /* equal-height cards */
.pr__card{position:relative;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:var(--space-6);display:flex;flex-direction:column;gap:var(--space-4)}
.pr__card--pop{border-color:var(--accent);box-shadow:var(--shadow-lifted)}
.pr__badge{position:absolute;top:0;right:var(--space-5);transform:translateY(-50%);background:var(--accent);color:var(--accent-ink);font-family:var(--fd);font-weight:600;font-size:.72rem;letter-spacing:.04em;text-transform:uppercase;padding:.3rem .7rem;border-radius:var(--r-pill)}
.pr__price{display:flex;align-items:baseline;gap:.4rem}
.pr__amt{font-family:var(--fd);font-weight:700;font-size:clamp(2rem,4vw,2.8rem);letter-spacing:-.02em}
.pr__feats{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:var(--space-2);flex:1}
.pr__feats li{padding-left:1.5rem;position:relative;color:var(--ink-soft)}
.pr__feats li::before{content:"";position:absolute;left:0;top:.55em;width:8px;height:8px;border-radius:50%;background:var(--accent)}
.pr__cta{margin-top:var(--space-3)}
/* faq (native details) — layout variants (list · split · two-col) */
.faq__wrap{max-width:760px;margin-inline:auto}
.faq__h{margin-bottom:var(--space-6);text-align:center}
/* split: heading on the left, accordion on the right */
.faq--split .faq__wrap{max-width:var(--w-wide)}
.faq--split .faq__h{text-align:left}
@media(min-width:860px){
  .faq--split .faq__wrap{display:grid;grid-template-columns:.7fr 1.3fr;gap:var(--space-7);align-items:start}
  .faq--split .faq__h{margin-bottom:0;position:sticky;top:var(--space-7)}
}
/* two-col: accordion flows across two columns */
.faq--two-col .faq__wrap{max-width:var(--w-standard)}
@media(min-width:760px){
  .faq--two-col .faq__list{columns:2;column-gap:var(--space-7)}
  .faq--two-col .faq__item{break-inside:avoid}
}
.faq__item{border-bottom:1px solid var(--border)}
.faq__q{display:flex;align-items:center;justify-content:space-between;gap:var(--space-4);cursor:pointer;list-style:none;padding:var(--space-4) 0;font-family:var(--fd);font-weight:600;font-size:1.05rem}
.faq__q::-webkit-details-marker{display:none}
.faq__icon{flex:none;display:inline-flex;align-items:center;justify-content:center;color:var(--ink-soft);transition:transform .25s,color .2s}   /* clean icon, no circle/border */
.faq__item[open] .faq__icon,.faq__item[data-closing] .faq__icon{transform:rotate(45deg);color:var(--accent)}   /* plus → × on open */
.faq__item[data-closing] .faq__icon{transform:rotate(0);color:var(--ink-soft)}
.faq__a{padding-bottom:var(--space-4);overflow:hidden}   /* overflow clip = smooth height anim (FAQ_JS) */
/* contact form */
.cf__wrap{max-width:680px;margin-inline:auto}
.cf__form{display:flex;flex-direction:column;gap:var(--space-4)}
.cf__row{display:grid;gap:var(--space-4)}
@media(min-width:600px){.cf__row{grid-template-columns:1fr 1fr}}
.cf__field{display:flex;flex-direction:column;gap:var(--space-2)}
.cf__field span{font-size:.9rem;font-weight:600}
.cf__field input,.cf__field textarea{font:inherit;color:var(--ink);background:var(--surface);border:1px solid var(--border);border-radius:var(--r-md);padding:.7rem .9rem}
.cf__field input:focus,.cf__field textarea:focus{outline:none;border-color:var(--ring);box-shadow:0 0 0 3px color-mix(in srgb,var(--ring) 28%,transparent)}
.cf__field :user-invalid{border-color:var(--danger,#dc2626)}
.cf__ok{color:var(--ok,#16a34a);font-weight:600}
/* card-grid (filterable + load-more) */
.cg__head{margin:0 auto var(--space-5);text-align:center}
.cg__tabs{display:flex;flex-wrap:wrap;justify-content:center;gap:var(--space-3);margin-bottom:var(--space-5)}
.cg__tab{font:600 .85rem var(--fd);min-height:40px;padding:.5rem 1.05rem;background:var(--surface);color:var(--ink-soft);border:1px solid var(--border);border-radius:var(--r-pill);cursor:pointer;transition:color .15s,border-color .15s}
.cg__tab[aria-pressed="true"]{color:var(--accent-ink);background:var(--accent);border-color:var(--accent)}
.cg__tab:hover{color:var(--ink)}
.cg__grid{display:grid;gap:var(--space-4);grid-template-columns:1fr}
@media(min-width:640px){.cg__grid{grid-template-columns:repeat(2,1fr)}}
@media(min-width:980px){.cg__grid{grid-template-columns:repeat(3,1fr)}}
.cg__card{display:flex;flex-direction:column;gap:var(--space-3);background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:var(--space-5);transition:border-color .18s ease,transform .18s ease}
.cg__card:hover{border-color:var(--accent);transform:translateY(-3px)}   /* hover-frame: border-highlight + lift (promotion candidate) */
.cg__card[hidden]{display:none}
/* card RAIL — the ONE canonical horizontal-scroll formula (define ONCE; a skin opts in with
   skin.cardLayout='rail' or a plan passes layout:'rail'). Aligns the FIRST card to the page gutter
   AND lets cards bleed off both screen edges (no white gap, no hard cut) — works with or without a
   sidebar. Skins may recolour cards but MUST NOT re-hand-write this geometry. (skin-contract §4)
   ROOT-CAUSE FIX (Tong, 2026-07-08): bleed to the true VIEWPORT edge, not just the container edge —
   margin-inline:-gutter only reaches the container edge, so on screens WIDER than the container the
   cards hard-cut at the container margin. width:100vw + margin-inline:calc(50% - 50vw) = full-bleed;
   the padding then re-aligns the first card to the container edge. Same fix any full-bleed rail needs. */
.cg__grid.cg--rail{display:flex;grid-template-columns:none;overflow-x:auto;scroll-snap-type:x mandatory;
  width:100vw;margin-inline:calc(50% - 50vw);
  padding-inline:max(var(--gutter), calc((100vw - var(--container,1200px))/2));
  scroll-padding-inline:max(var(--gutter), calc((100vw - var(--container,1200px))/2));
  padding-block:4px;scrollbar-width:none}
.cg__grid.cg--rail::-webkit-scrollbar{display:none}
.cg--rail>.cg__card{flex:0 0 clamp(260px,80vw,340px);scroll-snap-align:start}
.cg__navwrap{display:none}
.cg__top{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3)}
.cg__tag{font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;color:var(--accent);border:1px solid var(--accent);border-radius:var(--r-sm);padding:.18rem .5rem}
.cg__meta{font-size:.78rem;color:var(--ink-soft);letter-spacing:.02em}
.cg__title{margin:0}
.cg__link{font-size:.8rem;color:var(--accent);margin-top:auto;letter-spacing:.04em}
.cg__morewrap{display:flex;justify-content:center;margin-top:var(--space-6)}
.cg__railwrap{position:relative}
/* prev/next are a GROUPED pair at the top-right (never one-above-the-other), icon always centred.
   Codified in the BASE so every skin inherits it — a skin may only recolour, not re-place. */
.cg[data-variant="rail"] .cg__navwrap{display:flex;justify-content:flex-end;gap:var(--space-2);margin-bottom:var(--space-3)}
.cg__nav{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;flex:none;cursor:pointer;line-height:0}
.cg__nav svg{width:20px;height:20px;display:block}
.cg__morewrap[hidden],.cg__more[hidden]{display:none}
/* index-tiles — numbered photo tiles with dark scrim (text is white on the tile's --ink ground,
   so it clears AA regardless of the photo) */
.it__grid{display:grid;gap:var(--space-4);grid-template-columns:1fr}
@media(min-width:560px){.it__grid{grid-template-columns:repeat(2,1fr)}}
@media(min-width:960px){.it__grid{grid-template-columns:repeat(4,1fr)}}
.it__tile{position:relative;aspect-ratio:3/4;border-radius:var(--r-lg);overflow:hidden;background:#141414;display:flex}   /* fixed-dark photo ground (white text is AA in BOTH themes, independent of --ink) */
.it__media{position:absolute;inset:0;width:100%;height:100%;border:0;border-radius:0;aspect-ratio:auto;opacity:.9}
.it__tile::after{content:"";position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.78),rgba(0,0,0,.12) 55%,rgba(0,0,0,.28))}
.it__body{position:relative;z-index:1;margin-top:auto;padding:var(--space-5);color:#fff}
.it__num{display:block;font-size:1.9rem;font-weight:700;line-height:1;opacity:.85;margin-bottom:var(--space-3);color:#fff}
.it__title{color:#fff;margin-bottom:var(--space-1)}
.it__cap{color:rgba(255,255,255,.86)}
/* index-tiles COVERFLOW — 3D cover-flow carousel (COVERFLOW_JS positions the cards). No-JS /
   reduced-motion fallback = a horizontal snap rail (the .itf__track flex row below). JS adds
   [data-flow-ready] which switches the track to the absolute 3D stage. */
.it--flow{overflow-x:clip}   /* guard the full-bleed itf from a sub-pixel 100vw horizontal scroll */
.it--flow .itf{--cw:clamp(200px,24vw,340px);--ch:calc(var(--cw)*1.33);position:relative;margin-top:var(--space-6);margin-left:calc(50% - 50vw);margin-right:calc(50% - 50vw)}   /* full-bleed to the browser edges so cards fan out to the sides */
.it--flow .itf__stage{position:relative}
.it--flow .itf__track{display:flex;gap:var(--space-4);overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:var(--space-3);scrollbar-width:none}
.it--flow .itf__track::-webkit-scrollbar{display:none}
.it--flow .itf__card{position:relative;flex:0 0 var(--cw);height:var(--ch);scroll-snap-align:center;border-radius:var(--r-lg);overflow:hidden;background:#141414;cursor:pointer;box-shadow:0 24px 60px -20px rgba(0,0,0,.5)}
.it--flow .itf__media{opacity:1}
.it--flow .itf__card::after{content:"";position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.72),rgba(0,0,0,.05) 55%,rgba(0,0,0,.22))}
.it--flow .itf__cap{position:absolute;left:0;right:0;bottom:0;z-index:2;padding:var(--space-5);color:#fff}
.it--flow .itf__cap .it__num,.it--flow .itf__cap .it__title,.it--flow .itf__cap .it__cap{color:#fff}
.it--flow .itf__ctl{display:flex;align-items:center;justify-content:center;gap:var(--space-5);margin-top:var(--space-6)}
.it--flow .itf__arrow{flex:none;width:52px;height:52px;border-radius:var(--r-pill);border:1px solid var(--border);background:transparent;color:var(--ink);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:border-color .2s,background .2s}
@media(max-width:559px){.it--flow .itf .itf__dots{display:none}}   /* narrow screens: arrows + card-tap navigate; dots would overflow the row (higher-specificity so it beats the base display:flex regardless of source order) */
.it--flow .itf__arrow:hover{border-color:var(--ink)}
.it--flow .itf__dots{display:flex;gap:0;align-items:center}
.it--flow .itf__dot{position:relative;width:40px;height:40px;min-width:40px;padding:0;border:0;background:transparent;cursor:pointer}   /* 40×40 hit area; visual dot is the ::before (tap-target gate) */
.it--flow .itf__dot::before{content:"";position:absolute;top:50%;left:50%;width:8px;height:8px;transform:translate(-50%,-50%);border-radius:var(--r-pill);background:color-mix(in srgb,var(--ink) 22%,transparent);transition:background .2s,transform .2s}
.it--flow .itf__dot.is-active::before{background:var(--ink);transform:translate(-50%,-50%) scale(1.35)}
/* 3D mode (JS ready): the track becomes a fixed-height perspective stage; JS transforms each card */
.it--flow .itf[data-flow-ready] .itf__stage{height:calc(var(--ch) + 5rem);perspective:1600px;perspective-origin:50% 45%;overflow-x:clip;overflow-y:visible;touch-action:pan-y;cursor:grab}   /* clip only sideways (full-bleed); leave the card drop-shadow visible below */
.it--flow .itf[data-flow-ready] .itf__track{position:absolute;inset:0;display:block;overflow:visible;transform-style:preserve-3d;padding:0}
.it--flow .itf[data-flow-ready] .itf__card{position:absolute;top:50%;left:50%;width:var(--cw);margin:calc(var(--ch)/-2) 0 0 calc(var(--cw)/-2);transform-origin:center center;transition:transform .55s cubic-bezier(.22,.61,.36,1),filter .55s ease,opacity .55s ease;will-change:transform,filter}
.it--flow .itf[data-flow-ready] .itf__cap{opacity:0;transition:opacity .4s ease .1s}
.it--flow .itf[data-flow-ready] .itf__card.is-active .itf__cap{opacity:1}
/* sticky-scroll — pinned cross-fading panels (left) + scrolling gallery (right) */
.ss__heading{max-width:22ch;margin-bottom:var(--space-7)}
.ss__grid{display:grid;gap:var(--space-6)}
.ss__gallery{display:flex;flex-direction:column;gap:clamp(2rem,6vw,4.5rem)}
.ss__item{margin:0}
.ss__media{aspect-ratio:4/5;width:100%;border-radius:var(--r-lg);overflow:hidden}
.ss__cap{margin-top:var(--space-3);color:var(--ink-soft)}
.ss__title{margin-bottom:var(--space-3)}
.ss__cta{margin-top:var(--space-5)}
@media(min-width:880px){
  .ss__grid{grid-template-columns:.92fr 1.08fr;gap:clamp(2.5rem,6vw,5rem);align-items:start}
  .ss--rev .ss__grid{grid-template-columns:1.08fr .92fr}
  .ss--rev .ss__pin{order:2}
  .ss__pin{position:sticky;top:88px;height:min(74vh,560px);align-self:start}
  .ss__panels{position:relative;height:100%}
  .ss__panel{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;
    opacity:0;transform:translateY(16px);transition:opacity .5s ease,transform .5s ease;pointer-events:none}
  .ss__panel.is-active{opacity:1;transform:none;pointer-events:auto}
}
/* mobile / reduced-motion: plain stacked list — every panel paired above its image, no pin/fade */
@media(max-width:879px){
  .ss__panels{display:flex;flex-direction:column;gap:var(--space-5)}
  .ss__panel{position:static;opacity:1;transform:none}
  .ss__gallery{margin-top:var(--space-6)}
}
/* sticky-scroll HORIZONTAL — pinned text (left) + a row of image cards that translate horizontally
   as the page scrolls vertically (STICKY_JS). Fallback (mobile / reduced-motion / no-JS) = a plain
   horizontal-scroll rail, no pin. */
.ssh__grid{display:grid;gap:var(--space-6);padding-inline:var(--gutter)}   /* left/right gutter so pinned text + cards never touch the screen edge (base — all skins) */
.ssh__viewport{overflow-x:auto;scrollbar-width:none}
.ssh__viewport::-webkit-scrollbar{display:none}
.ssh__track{display:flex;gap:var(--space-5);width:max-content;will-change:transform}
.ssh__card{flex:0 0 clamp(260px,34vw,440px);display:flex;flex-direction:column}
.ssh__media{aspect-ratio:4/3;width:100%}
.ssh__cbody{padding-top:var(--space-4)}
.ssh__title{margin-bottom:var(--space-2)}
.ssh__text{margin-bottom:var(--space-4)}
.ssh__tabs{display:flex;gap:var(--space-3);margin-bottom:var(--space-5)}
.ssh__tab{min-height:40px;min-width:40px;padding:.4rem .85rem;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;background:transparent;border:1px solid currentColor;color:inherit;border-radius:var(--r-pill);font:inherit;line-height:1}   /* ≥40×40 tap target (was ~31×21 default-button); skins may restyle */
.ssh__nav{display:flex;align-items:center;gap:var(--space-4);margin-top:var(--space-6)}
.ssh__arrow{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;padding:0;border:1px solid currentColor;background:transparent;color:inherit;cursor:pointer;border-radius:var(--r-pill)}
.ssh__count{letter-spacing:.06em}
@media(min-width:880px){
  /* ROOT-CAUSE FIX (Tong, 2026-07-08): a sliding media rail must BLEED to the BROWSER EDGES, not be
     hard-cut at a container/column boundary. So the viewport spans the FULL viewport width (edge to
     edge); the pinned text is OVERLAID on one side over a bg→transparent gradient that MASKS the cards
     passing behind it (a soft fade, never a hard vertical cut). Cards enter from one screen edge and
     fade out under the text on the other. The same pattern any full-bleed rail should reuse. */
  .ssh{min-height:200vh}
  .ssh__grid{position:sticky;top:0;height:100vh;display:block;padding-inline:0;gap:0}
  .ssh__viewport{position:absolute;inset:0;display:flex;align-items:center;overflow:hidden}
  .ssh__track{align-items:center}
  .ssh:not(.ss--rev) .ssh__track{padding-left:min(56%,680px);padding-right:var(--gutter)}
  .ss--rev.ssh .ssh__track{padding-left:var(--gutter);padding-right:min(56%,680px)}
  /* the pinned text is OVERLAID over a bg→transparent MASK. The mask stays SOLID well past the text
     (to ~82%) and only fades in the last stretch, so the heading/intro never sit over a see-through
     image (that was the unreadable-text bug). The text also wraps inside the solid zone. */
  .ssh__pin{position:absolute;top:0;bottom:0;left:0;width:min(60%,720px);z-index:2;
    display:flex;flex-direction:column;justify-content:center;
    padding:0 clamp(3.5rem,10vw,8rem) 0 var(--gutter);
    background:linear-gradient(90deg, var(--bg) 0, var(--bg) 82%, transparent)}
  .ss--rev.ssh .ssh__pin{left:auto;right:0;padding:0 var(--gutter) 0 clamp(3.5rem,10vw,8rem);
    background:linear-gradient(270deg, var(--bg) 0, var(--bg) 82%, transparent)}
  .ssh__heading{font-size:clamp(1.7rem,3.2vw,2.5rem)}
}
/* mosaic-scroll — two DRAGGABLE rows of image cards (text sits INSIDE the image over a gradient).
   Equal horizontal + vertical gaps (--mos-gap); drag to scroll (MOS_JS), with a hint. */
.mos{overflow:hidden;--mos-gap:clamp(.4rem,.8vw,.7rem)}
.mos__head{display:flex;align-items:flex-end;justify-content:space-between;gap:var(--space-4);flex-wrap:wrap}
.mos__hint{display:inline-flex;align-items:center;gap:.4rem;color:var(--ink-soft);font-size:.85rem;white-space:nowrap}
.mos__hint svg{width:18px;height:18px}
.mos__rows{display:flex;flex-direction:column;gap:var(--mos-gap);margin-top:var(--space-6)}
/* FULL-BLEED rows (run edge to edge) with a soft horizontal FADE at both screen edges → cards emerge from /
   dissolve into the browser edges instead of a hard cut. Track keeps a gutter so nothing sits flush at rest. */
.mos__row{overflow-x:auto;overflow-y:hidden;cursor:grab;scrollbar-width:none;-ms-overflow-style:none;scroll-snap-type:x proximity;
  -webkit-mask:linear-gradient(90deg,transparent 0,#000 clamp(28px,5vw,96px),#000 calc(100% - clamp(28px,5vw,96px)),transparent 100%);
          mask:linear-gradient(90deg,transparent 0,#000 clamp(28px,5vw,96px),#000 calc(100% - clamp(28px,5vw,96px)),transparent 100%)}
.mos__row::-webkit-scrollbar{display:none}
.mos__row.is-drag{cursor:grabbing;scroll-snap-type:none}
.mos__track{display:flex;gap:var(--mos-gap);width:max-content;padding-inline:var(--gutter)}
.mos__card{position:relative;flex:none;width:clamp(240px,30vw,440px);scroll-snap-align:start;overflow:hidden;border-radius:var(--r-lg)}
.mos__media{aspect-ratio:4/3;width:100%;border-radius:0}
.mos__card::after{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;
  background:linear-gradient(to top,rgba(6,7,12,.74) 0,rgba(6,7,12,.3) 34%,transparent 62%)}
.mos__meta{position:absolute;left:0;right:0;bottom:0;z-index:2;display:flex;flex-direction:column;align-items:flex-start;gap:.2rem;
  padding:clamp(.8rem,1.4vw,1.2rem);color:#fff}
.mos__tag{color:rgba(255,255,255,.72)}
.mos__title{font-weight:600;color:#fff}
.mos__row img,.mos__media img{pointer-events:none;-webkit-user-drag:none;user-select:none}
/* grid-editorial — the 4-COLUMN construction grid. column-gap:0 so the tracks land EXACTLY on the
 * 25/50/75% rule lines → content + image edges sit ON the lines; the safe zone is INTERNAL padding
 * (not a gap), so nothing kisses a line. This is the whole point: content aligned to the grid. */
.ge__grid{position:relative;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));
  row-gap:clamp(1.6rem,4vw,3rem);column-gap:0}
.ge__grid::before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;
  background:repeating-linear-gradient(to right,var(--ge-rule,rgba(0,0,0,.14)) 0 1px,transparent 1px 25%)}
.ge__grid>*{position:relative;z-index:1}
.ge__eyebrow{grid-column:1/2;grid-row:1;align-self:center}
.ge__title{grid-column:1/4;grid-row:2;padding-right:var(--space-5)}          /* span cols 1–3, safe inset before the 75% line */
.ge__body{grid-column:1/2;grid-row:3;align-self:start;padding-right:var(--space-6)} /* col 1 only, safe inset before the 25% line */
.ge__body p+p{margin-top:var(--space-4)}
.ge__cta{display:flex;flex-wrap:wrap;gap:var(--space-3);margin-top:var(--space-6)}
.ge__media{grid-column:3/5;grid-row:3;align-self:start;aspect-ratio:4/5;width:100%}  /* left edge ON the 50% line */
.ge--rev .ge__body{grid-column:4/5;padding-right:0;padding-left:var(--space-6)}
.ge--rev .ge__media{grid-column:1/3}
.ge--rev .ge__title{grid-column:2/5;text-align:right;padding-right:0;padding-left:var(--space-5)}
@media(max-width:767px){
  .ge__grid{grid-template-columns:1fr}
  .ge__grid::before{display:none}
  .ge__eyebrow,.ge__title,.ge__body,.ge__media,.ge--rev .ge__title,.ge--rev .ge__body,.ge--rev .ge__media{grid-column:1;grid-row:auto;text-align:left;padding-inline:0}
}
/* fixed-showcase — pinned FIXED backdrop while the centre card advances (scroll + prev/next/dots) */
.fx{padding:0;position:relative}
.fx__pin{position:sticky;top:0;height:100vh;min-height:560px;overflow:hidden;
  display:grid;place-items:center;background:var(--fx-ground,#2F5E86)}
.fx__bg{position:absolute;inset:0;z-index:0;border:0;border-radius:0;aspect-ratio:auto}
.fx__bg>img{filter:brightness(.86)}
.fx__label{position:absolute;z-index:3;top:50%;transform:translateY(-50%);
  font-family:var(--fb);font-size:.82rem;letter-spacing:.02em;color:#fff}
.fx__label--l{left:clamp(1rem,4vw,3.5rem)}
.fx__label--r{right:clamp(1rem,4vw,3.5rem)}
.fx__stage{position:relative;z-index:2;width:min(420px,86vw);display:flex;flex-direction:column;
  align-items:center;gap:var(--space-5)}
.fx__cards{position:relative;width:100%;display:grid}
.fx__card{grid-area:1/1;width:100%;background:var(--bg);color:var(--ink);
  padding:clamp(1.6rem,3vw,2.4rem);display:flex;flex-direction:column;gap:var(--space-4);
  text-align:center;opacity:0;transform:translateY(14px);transition:opacity .5s ease,transform .5s ease;pointer-events:none}
.fx__card.is-active{opacity:1;transform:none;pointer-events:auto}
.fx__ix{margin:0;letter-spacing:.12em}.fx__ixn{opacity:.5}
.fx__title{margin:0}
.fx__media{width:100%;aspect-ratio:4/3;border:0}
.fx__body{margin:0}
.fx__nav{display:flex;align-items:center;gap:var(--space-4)}
.fx__arrow{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;padding:0;
  border:1px solid rgba(255,255,255,.5);background:transparent;color:#fff;cursor:pointer}
.fx__dots{display:flex;align-items:center;gap:var(--space-2)}
.fx__dot{width:9px;height:9px;padding:0;border:1px solid #fff;background:transparent;cursor:pointer}
.fx__dot.is-active{background:#fff}
.fx__track{position:relative}
.fx__spacer{height:100vh}
/* mobile / no-JS / reduced-motion: no pin, cards become a readable stacked list, labels inline */
@media(max-width:767px){
  .fx__pin{position:static;height:auto;min-height:0;padding-block:clamp(2.5rem,7vw,4rem);gap:var(--space-5)}
  .fx__stage{width:min(520px,92vw)}
  .fx__cards{display:flex;flex-direction:column;gap:var(--space-4)}
  .fx__card{position:static;opacity:1;transform:none;pointer-events:auto}
  .fx__nav{display:none}.fx__track{display:none}
  .fx__label{position:static;transform:none;color:#fff;display:inline-block;margin:.3rem .6rem}
}
/* JS/reduced-motion fallback: unpin + stack every card readable (mirrors the mobile path) */
.fx.is-static .fx__pin{position:static;height:auto;min-height:0;padding-block:clamp(2.5rem,7vw,4rem);gap:var(--space-5)}
.fx.is-static .fx__cards{display:flex;flex-direction:column;gap:var(--space-4)}
.fx.is-static .fx__card{position:static;opacity:1;transform:none;pointer-events:auto}
.fx.is-static .fx__nav,.fx.is-static .fx__track{display:none}
.fx.is-static .fx__label{position:static;transform:none;display:inline-block;margin:.3rem .6rem}
@media(prefers-reduced-motion:reduce){ .fx__card{transition:none} }
/* cover-stack (promoted) — page-by-page sticky panels that stack & cover on scroll. Base paint uses
   role tokens so it works for ANY skin; skins override .cst__* to taste. */
.cst{padding-block:clamp(2.5rem,5vw,4rem) 0}
.cst__intro{margin-bottom:clamp(1.5rem,3vw,2.5rem)}
.cst__heading{max-width:20ch;margin-top:var(--space-2)}
.cst__track{display:flex;flex-direction:column}
.cst__panel{position:sticky;top:calc(84px + var(--i,0)*12px);border-radius:26px 26px 0 0;overflow:hidden;
  min-height:min(82vh,700px);display:flex;background:var(--surface);border:1px solid var(--border);box-shadow:0 -8px 40px rgb(0 0 0/.06)}
.cst__inner{width:100%;max-width:var(--container);margin-inline:auto;padding:clamp(1.6rem,4vw,3rem);
  display:flex;flex-direction:column;gap:clamp(1rem,2.2vw,1.5rem)}
.cst__head{display:flex;align-items:center;gap:.8rem;flex-wrap:wrap}
.cst__badge{width:36px;height:36px;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;
  font-family:var(--fd);font-weight:700;font-size:.78rem;flex:none;background:var(--surface-2);color:var(--ink)}
.cst__label{color:var(--ink-soft)}
.cst__cta,.cst__soon{margin-left:auto;display:inline-flex;align-items:center;gap:.4rem;min-height:44px;
  padding:.6rem 1.2rem;border-radius:var(--r-pill);font-size:.8rem;text-decoration:none}
.cst__cta{background:var(--ink);color:var(--bg)}
.cst__soon{background:var(--surface-2);color:var(--ink-soft)}
.cst__title{max-width:24ch;line-height:1.1}
.cst__metas{margin:0;color:var(--ink-soft)}
.cst__shots{display:flex;gap:var(--space-4);overflow-x:auto;scrollbar-width:none;margin-top:auto;
  padding-block:4px;margin-inline:calc(-1*clamp(1.6rem,4vw,3rem));padding-inline:clamp(1.6rem,4vw,3rem)}
.cst__shots::-webkit-scrollbar{display:none}
.cst__shot{flex:0 0 clamp(240px,32vw,360px);aspect-ratio:4/3;overflow:hidden;margin:0;border:1px solid var(--border);border-radius:18px}
@media(max-width:640px){.cst__panel{min-height:auto;top:70px}}
/* photo-scatter (promoted) — rotated photos scattered around centred text; straighten-lift on hover */
.psc{overflow:hidden;padding-block:clamp(3rem,7vw,6rem)}
.psc__stage{position:relative;max-width:var(--container);margin-inline:auto;min-height:clamp(540px,58vw,660px);
  display:flex;align-items:center;justify-content:center;padding-inline:var(--gutter)}
.psc__center{position:relative;z-index:3;text-align:center;max-width:26rem;margin-inline:auto}
.psc__sub{color:var(--ink-soft);max-width:26ch;margin-inline:auto}
.psc__item{position:absolute;width:clamp(150px,15vw,224px);transform:rotate(var(--rot,0deg));
  border:1px solid var(--border);border-radius:16px;background:var(--surface-2);box-shadow:0 10px 30px rgb(0 0 0/.10);
  transition:transform .32s cubic-bezier(.2,.8,.2,1),box-shadow .32s ease}
.psc__item .media{aspect-ratio:3/4;width:100%;margin:0;border:0}
.psc__item:hover{transform:rotate(0) scale(1.05) translateY(-8px);z-index:8}
.psc__label{position:absolute;top:-12px;left:14px;padding:.32rem .72rem;border-radius:var(--r-pill);
  background:var(--surface);border:1px solid var(--border);color:var(--ink);font-size:.72rem;
  transform:rotate(-5deg);white-space:nowrap;box-shadow:0 6px 16px rgb(0 0 0/.14);z-index:2;letter-spacing:.02em}
.psc__p1{top:2%;left:1%;--rot:-7deg} .psc__p2{top:-1%;right:4%;left:auto;--rot:5deg}
.psc__p3{bottom:4%;left:7%;--rot:6deg} .psc__p4{bottom:0%;right:2%;left:auto;--rot:-6deg}
.psc__p5{top:34%;left:-1%;--rot:4deg} .psc__p6{top:36%;right:-1%;left:auto;--rot:-4deg}
@media(max-width:860px){
  .psc__stage{flex-wrap:wrap;min-height:0;gap:var(--space-5) var(--space-4)}
  .psc__center{order:-1;flex-basis:100%;margin-bottom:var(--space-3)}
  .psc__item{position:static;width:clamp(132px,40vw,190px)}
  .psc__p2,.psc__p4,.psc__p6{right:auto}
}
/* arc-showcase (promoted, TUNED coastal-hotel geometry — verbatim) — NO card plate; a scroll rail by
   default, .is-live (ARC_JS) fans the cards along the arc with side arrows centred on the active card */
.arc{overflow:hidden}
.arc__head{text-align:center;margin-inline:auto}
.arc__viewport{position:relative;overflow:hidden;margin-top:var(--space-7);width:100%}
.arc__stage{display:flex;gap:var(--space-4);overflow-x:auto;padding:var(--space-4) var(--gutter);scroll-snap-type:x mandatory}
.arc__card{flex:0 0 clamp(220px,64vw,300px);scroll-snap-align:center;margin:0}
.arc__media{aspect-ratio:3/4;width:100%;border-radius:var(--r-md);overflow:hidden}
.arc__cap{margin-top:var(--space-3);text-align:center}
.arc__cardcta{display:block;text-align:center;margin-top:var(--space-2)}
.arc.is-live .arc__viewport{height:clamp(460px,52vw,660px)}
.arc.is-live .arc__stage{display:block;overflow:visible;height:100%;padding:0}
.arc.is-live .arc__card{position:absolute;left:50%;top:clamp(1rem,3vw,2.5rem);width:clamp(240px,25vw,340px);
  transform:translateX(-50%);transform-origin:center center;cursor:pointer;
  transition:transform .7s var(--mo-ease,cubic-bezier(.2,.8,.2,1)),opacity .5s ease;will-change:transform}
.arc.is-live .arc__card.is-active{cursor:default}
.arc__btn{position:absolute;top:42%;transform:translateY(-50%);z-index:30;display:inline-flex;align-items:center;justify-content:center;
  width:54px;height:54px;border:1px solid var(--border);border-radius:var(--r-pill);background:var(--surface);color:var(--ink);cursor:pointer;
  box-shadow:0 8px 24px -12px rgba(0,0,0,.35);transition:border-color .18s,background .18s,color .18s}
.arc__prev{left:clamp(.6rem,3vw,2.2rem)}
.arc__next{right:clamp(.6rem,3vw,2.2rem)}
.arc__btn:hover{border-color:var(--accent);color:var(--accent)}
/* scroll-statement (promoted, TUNED coastal-hotel geometry — verbatim) — full-bleed photo + a CENTRED
   serif statement, lines lit by text-illuminate */
.sst{position:relative;min-height:clamp(460px,82vh,760px);display:grid;place-items:center;overflow:hidden;
  background:#141414;color:#fff;text-align:center;padding-block:clamp(3rem,10vh,7rem)}
.sst__bg{position:absolute;inset:0;z-index:0;border:0;border-radius:0;aspect-ratio:auto}
.sst__bg>img{width:100%;height:100%;object-fit:cover}
.sst::before{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.5))}
.sst__wrap{position:relative;z-index:2;max-width:56rem;padding-inline:var(--gutter);margin-inline:auto}
.sst__eyebrow{color:#fff;opacity:.86;margin-bottom:var(--space-4)}
.sst__quote{font-size:clamp(1.6rem,4vw,3rem);line-height:1.42;margin:0 auto}
.sst__cta{margin-top:var(--space-6)}
`;

/* mobile-nav toggle (keyboard + aria). Injected once by the build. */
export const THEME_JS = `
(function(){
  var root=document.documentElement;
  function apply(){var d=root.getAttribute('data-theme')||'light';
    document.querySelectorAll('[data-theme-toggle]').forEach(function(b){
      b.setAttribute('aria-checked',String(d==='dark'));
      b.setAttribute('aria-label',d==='dark'?'Switch to light theme':'Switch to dark theme');
      var l=b.querySelector('.theme-toggle__label'); if(l)l.textContent=d==='dark'?'Light mode':'Dark mode';
    });}
  document.querySelectorAll('[data-theme-toggle]').forEach(function(b){b.addEventListener('click',function(){
    var d=(root.getAttribute('data-theme')||'light')==='dark'?'light':'dark';
    root.setAttribute('data-theme',d);try{localStorage.setItem('theme',d)}catch(e){}apply();});});
  apply();
})();
`;

export const NAV_JS = `
document.querySelectorAll('.nav__burger').forEach(function(b){
  b.addEventListener('click',function(){
    var nav=b.closest('.nav'); var open=nav.getAttribute('data-open')==='true';
    nav.setAttribute('data-open',String(!open)); b.setAttribute('aria-expanded',String(!open));
  });
});
document.querySelectorAll('.nav__menu a').forEach(function(a){
  a.addEventListener('click',function(){var nav=a.closest('.nav');if(nav){nav.setAttribute('data-open','false');
    var b=nav.querySelector('.nav__burger');if(b)b.setAttribute('aria-expanded','false');}});
});
/* nav SCROLL STATE — data-scrolled (past hero), data-hide (scroll direction), and data-tone
   (light|dark of whatever section sits BEHIND the fixed nav). A section counts as DARK if it's the
   hero, a data-ground="dark" slab, a .ftx cover footer, or is explicitly marked [data-nav-dark].
   Skins style .nav[data-tone="dark"] to flip the header into dark-mode chrome, and back to light over
   white sections — a fixed nav is its own stacking context so this can't be done with blend modes. */
(function(){
  var nav=document.querySelector('.nav'); if(!nav) return;
  var hero=document.querySelector('.hero'); var lastY=window.pageYOffset||0;
  function darkZones(){ return [].slice.call(document.querySelectorAll('.hero,[data-ground="dark"],.ftx,[data-nav-dark]')); }
  var dz=darkZones();
  function onScroll(){
    var y=window.pageYOffset||0;
    var past = hero ? (hero.getBoundingClientRect().bottom<=72) : (y>80);
    nav.setAttribute('data-scrolled', String(!!past));
    if(y>160 && y>lastY+4) nav.setAttribute('data-hide','true');        // scrolling DOWN → hide up
    else if(y<lastY-4 || y<80) nav.setAttribute('data-hide','false');   // scrolling UP / near top → show
    lastY=y;
    var nr=nav.getBoundingClientRect(), probe=nr.top+nr.height/2, over='light';   // probe = nav's centre
    for(var i=0;i<dz.length;i++){ var r=dz[i].getBoundingClientRect(); if(r.top<=probe && r.bottom>=probe){ over='dark'; break; } }
    nav.setAttribute('data-tone', over);
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', function(){ dz=darkZones(); onScroll(); });
  onScroll();
})();
`;

/* contact-form: HTML5 validate + show success state (no backend). Injected by the build. */
export const FORM_JS = `
document.querySelectorAll('.cf__form').forEach(function(f){ f.addEventListener('submit',function(e){
  e.preventDefault(); if(!f.checkValidity()){f.reportValidity();return;}
  var ok=f.querySelector('.cf__ok'); if(ok)ok.hidden=false; f.reset(); });});
`;

/* card-grid: filter tabs (aria-pressed) + progressive "load more". Hidden cards use the
 * hidden attribute (display:none) so the gate never measures off-screen content. */
export const CARDGRID_JS = `
document.querySelectorAll('[data-cardgrid]').forEach(function(grid){
  var tabs=[].slice.call(grid.querySelectorAll('.cg__tab'));
  var cards=[].slice.call(grid.querySelectorAll('.cg__card'));
  var morewrap=grid.querySelector('.cg__morewrap'), more=grid.querySelector('.cg__more');
  var rail=grid.querySelector('.cg__grid');var prevB=grid.querySelector('.cg__nav--prev'),nextB=grid.querySelector('.cg__nav--next');
  function railStep(d){if(!rail)return;var c=rail.querySelector('.cg__card');var w=c?c.getBoundingClientRect().width+28:300;rail.scrollBy({left:d*w,behavior:'smooth'});}
  if(prevB)prevB.addEventListener('click',function(){railStep(-1);});if(nextB)nextB.addEventListener('click',function(){railStep(1);});
  var batch=parseInt(grid.getAttribute('data-batch'),10)||6, cur='all', shown=batch;
  function render(){
    var matched=cards.filter(function(c){return cur==='all'||c.getAttribute('data-cat')===cur;});
    cards.forEach(function(c){c.hidden=true;});
    matched.slice(0,shown).forEach(function(c){c.hidden=false;});
    if(morewrap) morewrap.hidden = matched.length<=shown;
  }
  tabs.forEach(function(t){ t.addEventListener('click',function(){
    tabs.forEach(function(x){x.setAttribute('aria-pressed','false');});
    t.setAttribute('aria-pressed','true'); cur=t.getAttribute('data-cat')||'all'; shown=batch; render();
  });});
  if(more) more.addEventListener('click',function(){ shown+=batch; render(); });
  render();
});
`;

/* sticky-scroll: as each gallery image crosses the viewport centre, activate the matching pinned
 * panel (cross-fade in place). The gallery scrolls normally; only the LEFT panel swaps. Honours
 * prefers-reduced-motion (skips → all panels are statically visible via the mobile CSS path). */
export const STICKY_JS = `
(function(){
  if(matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  if(!('IntersectionObserver' in window)) return;
  document.querySelectorAll('[data-sticky-scroll]').forEach(function(sec){
    var panels=[].slice.call(sec.querySelectorAll('.ss__panel'));
    var items=[].slice.call(sec.querySelectorAll('.ss__item'));
    if(panels.length<2||!items.length) return;
    function activate(i){ panels.forEach(function(p){ p.classList.toggle('is-active', +p.getAttribute('data-i')===i); }); }
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting) activate(+e.target.getAttribute('data-i')); });
    },{rootMargin:'-48% 0px -48% 0px',threshold:0});
    items.forEach(function(it){io.observe(it);});
  });
})();
/* sticky-scroll HORIZONTAL: map the section's vertical scroll progress → the card track's X.
   Skips the pin under reduced-motion / mobile (the CSS fallback = a manual horizontal rail). */
(function(){
  document.querySelectorAll('[data-sticky-h]').forEach(function(sec){
    var track=sec.querySelector('.ssh__track'), vp=sec.querySelector('.ssh__viewport');
    var curEl=sec.querySelector('.ssh__cur'), cards=[].slice.call(sec.querySelectorAll('.ssh__card'));
    var tabs=[].slice.call(sec.querySelectorAll('.ssh__tab'));
    tabs.forEach(function(t){ t.addEventListener('click',function(){ tabs.forEach(function(x){x.classList.remove('is-active');x.setAttribute('aria-pressed','false');}); t.classList.add('is-active'); t.setAttribute('aria-pressed','true'); }); });
    if(!track||!vp) return;
    var RM=matchMedia('(prefers-reduced-motion:reduce)').matches, MOB=matchMedia('(max-width:879px)').matches;
    if(RM||MOB) return;                 // CSS fallback = manual horizontal scroll rail
    vp.style.overflow='hidden';
    function maxX(){ return Math.max(0, track.scrollWidth - vp.clientWidth); }
    function prog(){ var total=sec.offsetHeight-window.innerHeight; if(total<=0)return 0;
      return Math.min(1,Math.max(0,-sec.getBoundingClientRect().top/total)); }
    function apply(){ var p=prog(); track.style.transform='translateX('+(-p*maxX())+'px)';
      if(curEl&&cards.length){ curEl.textContent=String(Math.min(cards.length,Math.round(p*(cards.length-1))+1)).padStart(2,'0'); } }
    sec.querySelectorAll('.ssh__arrow').forEach(function(a){ a.addEventListener('click',function(){
      var total=sec.offsetHeight-window.innerHeight; if(total<=0)return; var step=total/Math.max(1,cards.length-1);
      var base=window.pageYOffset+sec.getBoundingClientRect().top; var cur=Math.min(total,Math.max(0,prog()*total));
      window.scrollTo({top:base+Math.min(total,Math.max(0,cur+(+a.getAttribute('data-d'))*step)),behavior:'smooth'}); }); });
    window.addEventListener('scroll',apply,{passive:true}); window.addEventListener('resize',apply); apply();
  });
})();
`;

/* pinned-split: as each text panel crosses the viewport centre, activate the matching CENTRE frame
 * (cross-fade in place). The panels scroll normally; only the pinned centre media swaps. Honours
 * prefers-reduced-motion / no-IO (bails → the CSS static-stack path shows frame 1 + all copy). */
export const PINNED_JS = `
document.querySelectorAll('[data-pinned-split]').forEach(function(sec){
  var frames=[].slice.call(sec.querySelectorAll('.pin__frame'));
  var panels=[].slice.call(sec.querySelectorAll('.pin__panel'));
  if(frames.length<2||!panels.length) return;
  if(matchMedia('(prefers-reduced-motion:reduce)').matches||!('IntersectionObserver' in window)) return;
  function activate(i){ frames.forEach(function(f){f.classList.toggle('is-active',+f.getAttribute('data-i')===i);});
    panels.forEach(function(p){p.classList.toggle('is-active',+p.getAttribute('data-i')===i);}); }
  var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting) activate(+e.target.getAttribute('data-i')); }); },
    {rootMargin:'-45% 0px -45% 0px',threshold:0});
  panels.forEach(function(p){io.observe(p);});
});
`;

/* pinned-split SLIDE: scrub the pinned section — the center image slides UP & fades as you scroll
 * (one leaves, the next enters from below), while the side heading + description cross-fade to the
 * active frame IN PLACE. Degrades (reduced-motion) to everything visible. Injected by the build. */
export const PIN_SLIDE_JS = `
document.querySelectorAll('[data-pin-slide]').forEach(function(sec){
  var track=sec.querySelector('.pins__track'); if(!track) return;
  var shots=[].slice.call(sec.querySelectorAll('.pins__shot'));
  var lefts=[].slice.call(sec.querySelectorAll('.pins__text'));
  var rights=[].slice.call(sec.querySelectorAll('.pins__desc'));
  var n=shots.length; if(!n) return;
  if(matchMedia('(prefers-reduced-motion:reduce)').matches){
    shots.forEach(function(s){s.style.opacity=1;}); lefts.forEach(function(e){e.classList.add('is-on');}); rights.forEach(function(e){e.classList.add('is-on');}); return; }
  var ticking=false;
  function frame(){ ticking=false;
    var vh=window.innerHeight; var top=track.getBoundingClientRect().top;   // scrub over the pinned TRACK
    var total=track.offsetHeight-vh; var p= total>0 ? (-top)/total : 0; if(p<0)p=0; else if(p>1)p=1;
    var pos=p*n;
    for(var i=0;i<n;i++){ var t=pos-i;
      var ty=-t*100; if(ty>100)ty=100; else if(ty<-100)ty=-100;
      var op=1-Math.abs(t); if(op<0)op=0; else if(op>1)op=1;
      var s=shots[i]; s.style.transform='translateY('+ty.toFixed(1)+'%) scale('+(0.93+0.07*op).toFixed(3)+')';
      s.style.opacity=op.toFixed(3); s.style.zIndex=String(100-Math.round(Math.abs(t)*20));
    }
    var active=Math.round(pos); if(active<0)active=0; else if(active>n-1)active=n-1;
    for(var j=0;j<lefts.length;j++){ lefts[j].classList.toggle('is-on',j===active); }
    for(var k=0;k<rights.length;k++){ rights[k].classList.toggle('is-on',k===active); }
  }
  function onScroll(){ if(!ticking){ticking=true;requestAnimationFrame(frame);} }
  window.addEventListener('scroll',onScroll,{passive:true}); window.addEventListener('resize',onScroll); frame();
});
`;

/* index-tiles COVERFLOW: position each card in a 3D cover-flow around the active index — centre flat
 * & largest, side cards tilt inward (rotateY) and recede/shrink with distance. Arrows / dot / card-
 * click / ←→ keys switch. Bails under reduced-motion (leaves the CSS horizontal snap-rail fallback). */
export const COVERFLOW_JS = `
document.querySelectorAll('[data-coverflow]').forEach(function(sec){
  var itf=sec.querySelector('.itf'), track=sec.querySelector('.itf__track'), stg=sec.querySelector('.itf__stage');
  var cards=[].slice.call(sec.querySelectorAll('.itf__card'));
  var dots=[].slice.call(sec.querySelectorAll('.itf__dot'));
  var N=cards.length;
  if(!itf||!track||N<2) return;
  if(matchMedia('(prefers-reduced-motion:reduce)').matches) return;   // keep CSS snap-rail fallback
  itf.setAttribute('data-flow-ready','');
  var active=Math.floor(N/2), prevK=cards.map(function(){return null;});
  function offset(i){ var k=((i-active)%N+N)%N; if(k>N/2) k-=N; return k; }   // shortest signed ring distance -> infinite loop
  function render(){
    var cw=cards[0].offsetWidth||300;
    cards.forEach(function(c,i){
      var k=offset(i), ak=Math.abs(k), dir=k<0?-1:1, x,ry,sc,tz;
      if(k===0){ x=0; ry=0; sc=1; tz=0; }
      else{ x=dir*(cw*0.92+(ak-1)*cw*0.66); ry=-dir*48; sc=Math.max(0.7,1-0.08*ak); tz=-70*ak; }
      if(prevK[i]!==null && Math.abs(k-prevK[i])>N/2){ c.style.transition='none'; (function(el){ requestAnimationFrame(function(){ requestAnimationFrame(function(){ el.style.transition=''; }); }); })(c); }   // a card wrapping across the seam JUMPS (no fly-across)
      prevK[i]=k;
      c.style.transform='translateX('+x+'px) translateZ('+tz+'px) rotateY('+ry+'deg) scale('+sc+')';
      c.style.zIndex=String(100-ak); c.style.opacity=1; c.style.filter='brightness('+(k===0?1:0.72)+')';
      c.classList.toggle('is-active',k===0);
      if(dots[i]) dots[i].classList.toggle('is-active',k===0);
    });
  }
  function go(n){ active=((n%N)+N)%N; render(); }   // wrap both ways -> infinite loop
  sec.querySelectorAll('.itf__arrow').forEach(function(a){ a.addEventListener('click',function(){ go(active + (+a.getAttribute('data-d'))); }); });
  dots.forEach(function(d){ d.addEventListener('click',function(){ go(+d.getAttribute('data-i')); }); });
  cards.forEach(function(c){ c.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); go(+c.getAttribute('data-i')); } }); });
  itf.addEventListener('keydown',function(e){ if(e.key==='ArrowLeft'){go(active-1);} else if(e.key==='ArrowRight'){go(active+1);} });
  // horizontal drag / swipe (pointer = mouse + touch); a real drag suppresses the click-to-centre
  var down=false, sx=0, moved=0, suppress=false;
  if(stg){
    stg.addEventListener('pointerdown',function(e){ down=true; sx=e.clientX; moved=0; suppress=false; });
    window.addEventListener('pointermove',function(e){ if(down) moved=e.clientX-sx; });
    window.addEventListener('pointerup',function(){ if(!down) return; down=false; var cw=cards[0].offsetWidth||300;
      if(Math.abs(moved)>8){ suppress=true; var steps=Math.round(-moved/(cw*0.55)); if(steps) go(active+steps); } });
    stg.addEventListener('click',function(e){ if(suppress){ suppress=false; return; }
      var best=active,bd=1/0; cards.forEach(function(c,i){ var r=c.getBoundingClientRect(),mid=r.left+r.width/2,d=Math.abs(mid-e.clientX); if(d<bd){bd=d;best=i;} }); go(best); });
    var wlock=false;
    stg.addEventListener('wheel',function(e){ if(Math.abs(e.deltaX)<=Math.abs(e.deltaY)) return; e.preventDefault(); if(wlock) return; wlock=true; go(active+(e.deltaX>0?1:-1)); setTimeout(function(){wlock=false;},220); },{passive:false});
  }
  window.addEventListener('resize',render); render();
});
`;

/* mosaic-scroll: drag-to-scroll each row (pointer drag → scrollLeft). Native wheel/trackpad + keyboard
 * arrows still work; a click that didn't drag passes through. Injected by the build. */
export const MOS_JS = `
document.querySelectorAll('[data-mos-drag]').forEach(function(row){
  var down=false,startX=0,startL=0,moved=false;
  row.addEventListener('pointerdown',function(e){ if(e.button!==undefined&&e.button!==0)return;
    down=true; moved=false; startX=e.clientX; startL=row.scrollLeft; try{row.setPointerCapture(e.pointerId);}catch(x){} row.classList.add('is-drag'); });
  row.addEventListener('pointermove',function(e){ if(!down)return; var dx=e.clientX-startX; if(Math.abs(dx)>4)moved=true; row.scrollLeft=startL-dx; e.preventDefault(); });
  function up(){ down=false; row.classList.remove('is-drag'); }
  row.addEventListener('pointerup',up); row.addEventListener('pointercancel',up);
  row.addEventListener('click',function(e){ if(moved){ e.preventDefault(); e.stopPropagation(); } },true);
  row.addEventListener('keydown',function(e){ if(e.key==='ArrowRight')row.scrollLeft+=240; else if(e.key==='ArrowLeft')row.scrollLeft-=240; });
});
`;

/* testimonial CASE carousel: dots + prev/next switch the single visible split card. No-JS → first
 * slide shows (all slides are in the DOM & readable). Injected by the build. */
export const TM_JS = `
document.querySelectorAll('[data-tm-carousel]').forEach(function(sec){
  var stage=sec.querySelector('.tm__stage');
  var cards=[].slice.call(sec.querySelectorAll('.tm__case'));
  var dots=[].slice.call(sec.querySelectorAll('.tm__dot'));
  if(!stage||cards.length<2) return;
  function step(){ return cards[0].getBoundingClientRect().width + 20; }
  sec.querySelectorAll('.tm__arrow').forEach(function(a){a.addEventListener('click',function(){
    stage.scrollBy({left:(+a.getAttribute('data-d'))*step(),behavior:'smooth'}); });});
  dots.forEach(function(d,j){d.addEventListener('click',function(){
    cards[j].scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'}); });});
  function sync(){ var r=stage.getBoundingClientRect(); var c=r.left+r.width/2; var best=0,bd=1e9;
    cards.forEach(function(card,j){ var cr=card.getBoundingClientRect(); var cc=cr.left+cr.width/2; var dd=Math.abs(cc-c); if(dd<bd){bd=dd;best=j;} });
    dots.forEach(function(d,j){d.classList.toggle('is-active',j===best);d.setAttribute('aria-pressed',String(j===best));}); }
  var raf=0; stage.addEventListener('scroll',function(){ if(raf)return; raf=requestAnimationFrame(function(){raf=0;sync();}); },{passive:true});
  sync();
});
`;

/* fixed-showcase: the pinned backdrop stays put (CSS sticky) while the centre card ADVANCES.
 * Scroll drives the active card (IntersectionObserver over the .fx__track spacers), and prev/next
 * arrows + dots jump directly. Under reduced-motion / no-IO it flips to the static stacked list
 * (.is-static) so every card is readable. Injected by the build. */
export const FIXEDSHOW_JS = `
document.querySelectorAll('[data-fixed-showcase]').forEach(function(sec){
  var cards=[].slice.call(sec.querySelectorAll('.fx__card'));
  var dots=[].slice.call(sec.querySelectorAll('.fx__dot'));
  var spacers=[].slice.call(sec.querySelectorAll('.fx__spacer'));
  if(cards.length<2){ return; }
  var RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
  if(RM || !('IntersectionObserver' in window)){ sec.classList.add('is-static'); return; }
  var cur=0;
  function show(i){ i=(i+cards.length)%cards.length; cur=i;
    cards.forEach(function(c,j){ c.classList.toggle('is-active',j===i); });
    dots.forEach(function(d,j){ d.classList.toggle('is-active',j===i); d.setAttribute('aria-pressed',String(j===i)); });
  }
  sec.querySelectorAll('.fx__arrow').forEach(function(a){ a.addEventListener('click',function(){ show(cur + (+a.getAttribute('data-d'))); }); });
  dots.forEach(function(d){ d.addEventListener('click',function(){ show(+d.getAttribute('data-i')); }); });
  if(spacers.length===cards.length){
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting) show(+e.target.getAttribute('data-i')); }); },
      {rootMargin:'-50% 0px -50% 0px',threshold:0});
    spacers.forEach(function(s){ io.observe(s); });
  }
  show(0);
});
`;

/* faq: smooth expand/collapse for the native <details> (it has NO height animation by
 * default — it snaps open). Keeps <details> semantics + keyboard; animates the .faq__a
 * height + fade via the Web Animations API. Honours prefers-reduced-motion (plain toggle). */
export const FAQ_JS = `
(function(){
  var RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
  document.querySelectorAll('.faq__item').forEach(function(d){
    var sum=d.querySelector('summary'), body=d.querySelector('.faq__a'), anim=null;
    if(!sum||!body) return;
    sum.addEventListener('click',function(e){
      if(RM) return;                                  // let native toggle handle it
      e.preventDefault();
      if(anim){ anim.cancel(); anim=null; }
      var pb=getComputedStyle(body).paddingBottom||'0px';   // animate padding too → true 0 collapse
      if(!d.open){                                    // OPEN: render, then grow 0→auto
        d.open=true; var h=body.offsetHeight;
        anim=body.animate([{height:'0px',opacity:0,paddingBottom:'0px'},{height:h+'px',opacity:1,paddingBottom:pb}],{duration:280,easing:'cubic-bezier(.2,.8,.2,1)'});
        anim.onfinish=function(){if(anim){anim.cancel();anim=null;}body.style.height='';};
      } else {                                        // CLOSE: shrink auto→0 (incl padding), hold 0, THEN unset open
        var start=body.offsetHeight; d.setAttribute('data-closing','');
        anim=body.animate([{height:start+'px',opacity:1,paddingBottom:pb},{height:'0px',opacity:0,paddingBottom:'0px'}],{duration:240,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
        // fill:forwards holds height:0 so there's NO 1-frame pop back to full height (the close stutter);
        // padding animates to 0 too so it doesn't plateau at the padding height. Close details FIRST
        // (→display:none), then release the held animation.
        anim.onfinish=function(){d.open=false;d.removeAttribute('data-closing');if(anim){anim.cancel();anim=null;}body.style.height='';};
      }
    });
  });
})();
`;
