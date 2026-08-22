/* gen-engine.mjs — the GENERATION engine. renderPage(skin, page) composes a page
 * from a CONTENT-DRIVEN section plan (shared library sections, chosen + ordered by the content) and
 * DRESSES it in a SKIN (skin-contract.md). The same skin yields different page shapes per content;
 * the skin re-styles every section. No fixed arrangement, no preset token catalogue — the skin owns
 * colours + fonts (--fd/--fb) + the full restyle in skin.css.
 *
 * ── Differences from `System Code/gen-engine.mjs`, and why ────────────────────────────────────────
 * The source engine and `build-skinsheet.mjs` (which rendered each skin's example.html) disagreed on
 * three skin opt-ins and on which behaviour scripts get bundled. A plan rendered through the source
 * engine therefore could NOT reproduce its own skin's example. This build closes that gap, so
 * `render.mjs plan.json` reproduces `example.html`:
 *
 *   1. Honours `skin.statsLayout` / `skin.indexLayout` / `skin.footerLayout` (the source engine
 *      honoured only cardLayout / pinnedLayout, so frosted-scatter lost its `stats[reveal]` +
 *      panel footer and serif-stack lost its `index-tiles[coverflow]`).
 *   2. The sticky-pin guard now tests the RESOLVED layout, not the raw plan args — a skin-supplied
 *      `statsLayout:'reveal'` must suppress the reveal wrapper exactly like a plan-supplied one,
 *      or the transform breaks the position:sticky pin.
 *   3. Bundles every behaviour script the section library ships (adds SHOW_JS, FIXEDSHOW_JS,
 *      COVERFLOW_JS). The source engine omitted them, so `spotlightShow` (black-slabs),
 *      `fixedShowcase` (blueprint-grid) and `indexTiles[coverflow]` (serif-stack) rendered as
 *      inert markup with no driver.
 *   4. An unknown `fn` throws a named, actionable error instead of `S[spec.fn] is not a function`.
 *
 * Everything else is byte-for-byte the source engine's behaviour.
 */
import { readFileSync, writeFileSync } from 'fs';
import * as S from './sections.mjs';
import { MOTION_JS } from './motion.mjs';

const F = {
  foundation:readFileSync('foundation.css','utf8'),
  motion:readFileSync('motion.css','utf8'), effects:readFileSync('effects.css','utf8'),
  shell:readFileSync('site-shell.html','utf8')
};

// A skin may set a DEFAULT layout for these sections; an explicit `args.layout` in the plan always wins.
const SKIN_LAYOUT = { cardGrid:'cardLayout', pinnedSplit:'pinnedLayout', indexTiles:'indexLayout', statsBand:'statsLayout' };

// build one body section: call the shared builder, then dress it (ground + scroll motion + media
// parallax + anchor). `skin` may opt into per-skin treatments (skin.parallax, skin.contactBg).
function renderSection(spec, skin){
  if(typeof S[spec.fn] !== 'function')
    throw new Error(`plan error: unknown section fn "${spec.fn}". Valid: ${Object.keys(S).filter(k=>typeof S[k]==='function').sort().join(', ')}`);
  let a = spec.args || {};
  const lk = SKIN_LAYOUT[spec.fn];
  if(lk && skin[lk] && !a.layout) a = {...a, layout:skin[lk]};
  let html = S[spec.fn](a);
  // pinned/sticky signature sections manage their own scroll behaviour — never wrap them in a reveal
  // (a reveal transform on the section would break the position:sticky pin). ground still applies.
  const noReveal = spec.fn==='pinnedSplit' || spec.fn==='stickyScroll' || spec.fn==='fixedShowcase' || spec.motion===false
                || (spec.fn==='statsBand' && a.layout==='reveal');   // sticky header — a reveal transform would break the pin
  const motion = spec.fn==='featureGrid' ? 'reveal-up' : (spec.motion || 'reveal-up');
  html = html.replace('<section ', `<section ${noReveal?'':`data-motion="${motion}" `}${spec.ground?`data-ground="${spec.ground}" `:''}`);
  if(spec.fn==='featureGrid') html = html.replace('class="fg__grid', 'data-motion="stagger" class="fg__grid');
  // image parallax on content media — OPT-IN per skin (skin.parallax = {speed,scale}). A skin that
  // omits it gets STATIC images (object-fit:cover still covers). No silent force-adding to every site.
  if(skin.parallax){
    const ps = skin.parallax;
    html = html.replace(/class="(it__media media|cg__media media|media)"/g, `class="$1" data-motion="image-parallax" data-speed="${ps.speed}" data-pscale="${ps.scale}"`);
  }
  // contact: a full-bleed image behind the form, if the skin opts in (skin.contactBg keyword);
  // it parallaxes only when the skin also opts into parallax.
  if(spec.fn==='contactForm' && skin.contactBg){
    const par = skin.parallax ? ` data-motion="image-parallax" data-speed="0.08" data-pscale="1.32"` : '';
    html = html.replace('<div class="container', `<div class="media cf__bg"${par} data-photo="${skin.contactBg}"></div><div class="container`);
  }
  // line-reveal opt-in (skin.lineReveal): body paragraphs wipe in one line at a time on scroll.
  if(skin.lineReveal && (spec.fn==='steps' || spec.fn==='featureSplit'))
    html = html.replace(/class="body muted">|class="lead">/g, m=>m.replace('">',`" data-motion="line-reveal">`));
  if(spec.id) html = `<a id="${spec.id}"></a>` + html;
  return html;
}

export function renderPage(skin, page){
  const NAV = S.nav({brand:page.brand, links:page.navLinks, cta:page.navCta});
  const HERO = skin.heroHTML(page.hero);
  let BODY = (page.sections||[]).map(s=>renderSection(s, skin)).join('\n');
  if(skin.cardTilt) BODY = S.tiltCards(BODY);   // opt-in: every card tilts toward the cursor on hover
  // the skin may own the footer SHAPE (e.g. frosted-scatter's panel); an explicit plan layout wins.
  const foot = page.footer || {};
  const FOOTER = S.footer(skin.footerLayout && !foot.layout ? {...foot, layout:skin.footerLayout} : foot);
  const html = F.shell
    .replace('data-theme="light"', `data-theme="light" data-fonts="${skin.fontsAttr||skin.id}" data-motion-personality="${skin.motionAttr}" data-signature="${skin.signature}"`)
    .replace(/<link href="https:\/\/fonts[^>]*>/, skin.fontLink)
    .replace('{{TITLE}}', page.title).replace('{{DESC}}', page.desc)
    .replace('{{STYLE}}', [F.foundation,F.motion,F.effects,S.SECTION_CSS,S.SECTION_CSS_X,skin.css].join('\n'))
    .replace('{{NAV}}', NAV)
    .replace('{{MAIN}}', HERO+'\n'+BODY)
    .replace('{{FOOTER}}', FOOTER)
    .replace('{{SCRIPT}}', [S.NAV_JS,S.FORM_JS,S.CARDGRID_JS,S.FAQ_JS,S.STICKY_JS,S.PINNED_JS,S.PIN_SLIDE_JS,
                            S.MOS_JS,S.TM_JS,S.SHOW_JS,S.FIXEDSHOW_JS,S.COVERFLOW_JS,S.THEME_JS,MOTION_JS].join('\n'));
  writeFileSync(page.out, html);
  const secs=(html.match(/data-section="/g)||[]).length;
  console.log(`${page.out}: ${html.length} bytes · ${secs} sections · plan=[${(page.sections||[]).map(s=>s.fn).join(', ')}]`);
  return html;
}
