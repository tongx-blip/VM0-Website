/* motion.mjs — the runtime that wires every [data-motion] primitive (motion.css).
 * One IntersectionObserver (reveal family) + one rAF loop (parallax / progress) +
 * pointer handlers (tilt / magnetic / spotlight / cursor). 0 dependencies. Honours
 * prefers-reduced-motion. Returns the source string so a build can inline it. */
export const MOTION_JS = `
(function(){
  var root=document.documentElement;
  var RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
  var HOVER=matchMedia('(hover:hover)').matches;
  var num=function(v,d){v=parseFloat(v);return isNaN(v)?d:v;};

  // text-split: wrap each word in <span class=mo-line><span class=mo-w --i></span></span>
  document.querySelectorAll('[data-motion="text-split"]').forEach(function(el){
    var words=el.textContent.trim().split(/\\s+/); el.textContent='';
    words.forEach(function(w,i){ var line=document.createElement('span'); line.className='mo-line';
      var s=document.createElement('span'); s.className='mo-w'; s.style.setProperty('--i',i); s.textContent=w;
      line.appendChild(s); el.appendChild(line); if(i<words.length-1) el.appendChild(document.createTextNode(' ')); });
  });
  // stagger: index children
  document.querySelectorAll('[data-motion="stagger"]').forEach(function(el){
    [].forEach.call(el.children,function(c,i){c.style.setProperty('--i',i);}); });

  if(RM){ document.querySelectorAll('[data-motion^="reveal"],[data-motion="stagger"],[data-motion="text-split"],[data-motion="count-up"]').forEach(function(e){e.classList.add('mo-in');}); return; }

  // marquee: clone the track once for a seamless -50% loop. Idempotent — skip if already wrapped
  // (a page whose DOM was serialized AFTER this ran, e.g. apply-photos output, won't double-wrap).
  document.querySelectorAll('[data-motion="marquee"]').forEach(function(el){
    if(el.querySelector('.mo-track')) return;
    var t=document.createElement('div'); t.className='mo-track'; while(el.firstChild)t.appendChild(el.firstChild);
    el.appendChild(t);
    // A SHORT list makes the track narrower than the viewport → the -50% loop leaves an empty gap
    // on the right (uneven distribution). Repeat the base items until one track comfortably exceeds
    // a wide viewport, THEN clone it for the seamless loop. So a few logos still fill the row.
    var base=t.innerHTML, guard=0;
    while(t.scrollWidth < 2200 && guard++ < 24){ t.insertAdjacentHTML('beforeend', base); }
    var c=t.cloneNode(true); el.appendChild(c); });

  // line-reveal: split a paragraph into visual LINES and wipe each in left→right as it enters view.
  // (learned from a frosted product site — body copy that "types" one line at a time, per line L→R.)
  [].slice.call(document.querySelectorAll('[data-motion="line-reveal"]')).forEach(function(el){
    var txt=(el.textContent||'').replace(/\\s+/g,' ').trim(); if(!txt) return;
    el.textContent=''; var words=txt.split(' '), probe=[];
    words.forEach(function(w,i){ var s=document.createElement('span'); s.style.display='inline-block';
      s.textContent=w+(i<words.length-1?'\\u00a0':''); el.appendChild(s); probe.push(s); });
    var lines=[],cur=[],top=null;
    probe.forEach(function(s){ var t=s.offsetTop; if(top===null||Math.abs(t-top)>2){ if(cur.length)lines.push(cur); cur=[]; top=t; } cur.push(s); });
    if(cur.length)lines.push(cur);
    el.textContent='';
    lines.forEach(function(ln,li){ var outer=document.createElement('span'); outer.className='mo-lr';
      var inner=document.createElement('span'); inner.className='mo-lr-i'; inner.style.setProperty('--i',li);
      ln.forEach(function(s){ s.style.display=''; inner.appendChild(s); }); outer.appendChild(inner); el.appendChild(outer); });
    el.classList.add('is-split');
  });

  // count-up tween
  function countUp(el){ var to=num(el.getAttribute('data-to'),num(el.textContent,0)); var suf=el.getAttribute('data-suffix')||'';
    var dur=1400, t0=null; function step(t){ if(!t0)t0=t; var k=Math.min(1,(t-t0)/dur); var e=1-Math.pow(1-k,3);
      el.textContent=Math.round(to*e)+suf; if(k<1)requestAnimationFrame(step); } requestAnimationFrame(step); }

  // IntersectionObserver: reveal family + count-up
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){ if(!e.isIntersecting)return;
      var el=e.target; el.classList.add('mo-in');
      if(el.getAttribute('data-motion')==='count-up') countUp(el);
      io.unobserve(el); });},{threshold:.16,rootMargin:'0px 0px -8% 0px'});
    document.querySelectorAll('[data-motion^="reveal"],[data-motion="stagger"],[data-motion="text-split"],[data-motion="count-up"],[data-motion="line-reveal"]').forEach(function(e){io.observe(e);});
  } else { document.querySelectorAll('[data-motion]').forEach(function(e){e.classList.add('mo-in');}); }

  // rAF: parallax + image-parallax + scroll-progress
  var paras=[].slice.call(document.querySelectorAll('[data-motion="parallax"]'));
  var imgs=[].slice.call(document.querySelectorAll('[data-motion="image-parallax"] > *'));
  var bars=[].slice.call(document.querySelectorAll('[data-motion="scroll-progress"]'));
  var ills=[].slice.call(document.querySelectorAll('[data-motion="text-illuminate"]'));   // scroll-linked line brighten
  var focs=[].slice.call(document.querySelectorAll('[data-motion="stat-focus"]'));        // one big number in focus at a time
  var ticking=false;
  function frame(){ var vh=innerHeight, mid=vh/2;
    paras.forEach(function(el){ var sp=num(el.getAttribute('data-speed'),.18); var r=el.getBoundingClientRect();
      var off=((r.top+r.height/2)-mid)*-sp; el.style.transform='translate3d(0,'+off.toFixed(1)+'px,0)'; });
    imgs.forEach(function(el){ var p=el.parentElement; var sp=num(p.getAttribute('data-speed'),.06); var sc=num(p.getAttribute('data-pscale'),1.18);
      var r=p.getBoundingClientRect(); var off=((r.top+r.height/2)-mid)*sp;   /* +sp: scroll DOWN → image drifts UP (conventional parallax) */
      var hw=(sc-1)/2*r.height*.92; if(off>hw)off=hw; else if(off<-hw)off=-hw;   /* CLAMP to the scale headroom so the image always covers — never a gap at the frame edge */
      el.style.transform='scale('+sc+') translate3d(0,'+off.toFixed(1)+'px,0)'; });
    if(bars.length){ var h=document.documentElement.scrollHeight-innerHeight; var k=h>0?Math.min(1,scrollY/h):0;
      bars.forEach(function(b){b.style.transform='scaleX('+k.toFixed(4)+')';}); }
    // text-illuminate: light the statement LINE BY LINE as the block scrolls up through the viewport
    ills.forEach(function(el){ var lines=el.querySelectorAll('.mo-ill'); var m=lines.length; if(!m)return;
      var r=el.getBoundingClientRect(); var p=(vh-r.top)/(vh+r.height); if(p<0)p=0; else if(p>1)p=1;
      var lit=p*(m+1);
      for(var i=0;i<m;i++){ var t=lit-i; if(t<0)t=0; else if(t>1)t=1; lines[i].style.opacity=(0.28+0.72*t).toFixed(3); } });
    // stat-focus: the row nearest viewport-centre is bright; neighbours fall away (screenshot-1 big numbers)
    focs.forEach(function(scene){ var rows=scene.querySelectorAll('.st__row'); var n=rows.length; if(!n)return;
      var best=1e9,bi=0;
      for(var i=0;i<n;i++){ var rr=rows[i].getBoundingClientRect(); var dc=Math.abs((rr.top+rr.height/2)-mid); if(dc<best){best=dc;bi=i;} }
      for(var j=0;j<n;j++){ var dd=Math.abs(j-bi); var o=dd===0?1:(dd===1?0.42:0.12);
        rows[j].style.setProperty('--foc',o.toFixed(2)); rows[j].classList.toggle('is-foc',j===bi); } });
    ticking=false; }
  function onScroll(){ if(!ticking){ticking=true; requestAnimationFrame(frame);} }
  if(paras.length||imgs.length||bars.length||ills.length||focs.length){ addEventListener('scroll',onScroll,{passive:true}); addEventListener('resize',onScroll); frame(); }

  if(!HOVER) return;
  // custom cursor — the understated dot (grows on interactive, difference blend). The ONE cursor.
  var cur=document.createElement('div'); cur.className='mo-cursor'; cur.style.opacity='0'; document.body.appendChild(cur);
  document.documentElement.classList.add('mo-cursor-on');   // → hide the native pointer (CSS, pointer devices only)
  addEventListener('pointermove',function(e){ cur.style.opacity='1'; cur.style.left=e.clientX+'px'; cur.style.top=e.clientY+'px'; });
  document.querySelectorAll('a,button,[data-magnetic],[data-motion="hover-tilt"],[data-motion="magnetic"]').forEach(function(el){
    el.addEventListener('pointerenter',function(){cur.classList.add('mo-big');});
    el.addEventListener('pointerleave',function(){cur.classList.remove('mo-big');}); });

  // hover-tilt (rotateX/Y toward cursor) — [data-tilt] is the opt-in "all cards tilt" hook (skin.cardTilt)
  document.querySelectorAll('[data-motion="hover-tilt"],[data-tilt]').forEach(function(el){
    el.addEventListener('pointermove',function(e){ var t=num(getComputedStyle(root).getPropertyValue('--mo-tilt'),6);
      var r=el.getBoundingClientRect(); var px=(e.clientX-r.left)/r.width-.5, py=(e.clientY-r.top)/r.height-.5;
      el.style.transform='perspective(800px) rotateY('+(px*t).toFixed(2)+'deg) rotateX('+(-py*t).toFixed(2)+'deg)'; });
    el.addEventListener('pointerleave',function(){el.style.transform='';}); });

  // magnetic (translate toward cursor)
  document.querySelectorAll('[data-motion="magnetic"]').forEach(function(el){
    el.addEventListener('pointermove',function(e){ var m=num(getComputedStyle(root).getPropertyValue('--mo-mag'),.3);
      var r=el.getBoundingClientRect(); var dx=(e.clientX-(r.left+r.width/2))*m, dy=(e.clientY-(r.top+r.height/2))*m;
      el.style.transform='translate('+dx.toFixed(1)+'px,'+dy.toFixed(1)+'px)'; });
    el.addEventListener('pointerleave',function(){el.style.transform='';}); });

  // spotlight (move the radial light)
  document.querySelectorAll('[data-motion="spotlight"]').forEach(function(el){
    el.addEventListener('pointermove',function(e){ var r=el.getBoundingClientRect();
      el.style.setProperty('--mx',(e.clientX-r.left)+'px'); el.style.setProperty('--my',(e.clientY-r.top)+'px'); }); });

  // pointer-parallax — scattered children drift toward the cursor at per-depth rates (hero mis-align).
  // Each [data-depth] child lags the pointer by an eased amount → layered depth + deliberate offset.
  [].slice.call(document.querySelectorAll('[data-motion="pointer-parallax"]')).forEach(function(scene){
    var items=[].slice.call(scene.querySelectorAll('[data-depth]')); if(!items.length) return;
    var tx=0,ty=0,cx=0,cy=0,raf=0;
    function loop(){ cx+=(tx-cx)*.09; cy+=(ty-cy)*.09;
      items.forEach(function(el){ var d=num(el.getAttribute('data-depth'),.2);
        el.style.transform='translate3d('+(cx*d).toFixed(1)+'px,'+(cy*d).toFixed(1)+'px,0)'; });
      if(Math.abs(tx-cx)>.15||Math.abs(ty-cy)>.15){ raf=requestAnimationFrame(loop); } else { raf=0; } }
    scene.addEventListener('pointermove',function(e){ var r=scene.getBoundingClientRect();
      tx=((e.clientX-r.left)/r.width-.5)*r.width*.12; ty=((e.clientY-r.top)/r.height-.5)*r.height*.12;
      if(!raf) raf=requestAnimationFrame(loop); });
    scene.addEventListener('pointerleave',function(){ tx=0; ty=0; if(!raf) raf=requestAnimationFrame(loop); });
  });

  // spotlight-cursor — a continuous background grid that scrolls with the page and lights around the
  // pointer. The page grid (.pagegrid) is DOCUMENT-aligned → publish DOCUMENT coords to :root (--gx/--gy,
  // updated on move AND scroll so the highlight stays under the cursor). Each [data-sgrid] island gets
  // element-LOCAL cursor coords (--lx/--ly) + a document-top offset (--goy) so its grid phase-aligns to
  // the page grid (lines run unbroken across the boundary — no truncation).
  // Every section (+ footer) carries the same cursor-lit grid. Publish each host's cursor-LOCAL coords
  // (--lx/--ly) so the light follows the pointer, and its DOCUMENT-top (--goy) so all the grids share
  // ONE origin → the lines run continuously from section to section (no truncation at a boundary).
  var gridHosts=[].slice.call(document.querySelectorAll('main .section, body>footer .ftp'));
  if(gridHosts.length){
    function setGoy(){ var sy=window.pageYOffset||0;
      for(var i=0;i<gridHosts.length;i++){ var el=gridHosts[i]; el.style.setProperty('--goy',Math.round(el.getBoundingClientRect().top+sy)+'px'); } }
    addEventListener('pointermove',function(e){
      for(var i=0;i<gridHosts.length;i++){ var el=gridHosts[i], r=el.getBoundingClientRect();
        if(r.bottom<-400||r.top>innerHeight+400) continue;   // skip far-off-screen sections
        el.style.setProperty('--lx',Math.round(e.clientX-r.left)+'px'); el.style.setProperty('--ly',Math.round(e.clientY-r.top)+'px'); }
    },{passive:true});
    addEventListener('resize',setGoy); setGoy();
  }
})();
`;
