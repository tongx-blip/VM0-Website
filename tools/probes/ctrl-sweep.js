/* #control · one probe, every viewport. Nothing escapes the frame in any
   state, no horizontal overflow, tap targets clear 44px, no type under the
   floor. Run it at 320/390/430/600/768/820/1000/1024/1280/1440/1920/2560,
   plus a short window (1024x640, 1440x700).                               */
(async ()=>{
  const w = ms => new Promise(r=>setTimeout(r,ms));
  const grid = document.querySelector('.ctrl');
  const frame = document.getElementById('ctrlframe');
  const win = document.querySelector('.ctrl__win');
  const idx = document.querySelector('.ctrl__index');
  const steps = [...document.querySelectorAll('.ctrl__step')];
  grid.scrollIntoView({block:'start'}); await w(700);
  const cs = getComputedStyle(grid);
  const bad = [];
  for (let b=1;b<=5;b++){
    frame.dataset.beat = String(b); await w(650);
    const fr = frame.getBoundingClientRect();
    [...win.querySelectorAll('*')].forEach(e=>{
      const r = e.getBoundingClientRect();
      if (r.width<1||r.height<1) return;
      /* checkVisibility, NOT getComputedStyle(e).opacity — that reads only
         the element's own value, so every child of a hidden state reports a
         false escape. */
      if (e.checkVisibility && !e.checkVisibility({opacityProperty:true,visibilityProperty:true,contentVisibilityAuto:true})) return;
      if (r.left < fr.left-1 || r.right > fr.right+1 || r.top < fr.top-1 || r.bottom > fr.bottom+1)
        bad.push('b'+b+' escapes:'+(e.className||e.tagName).toString().split(' ')[0]);
    });
  }
  if (document.documentElement.scrollWidth > innerWidth+1) bad.push('page scrollW '+document.documentElement.scrollWidth);
  if (idx){ const ir = idx.getBoundingClientRect(), fr = frame.getBoundingClientRect();
    if (ir.right > fr.right+1 || ir.left < fr.left-1 || ir.bottom > fr.bottom+1 || ir.top < fr.top-1)
      bad.push('index bar escapes'); }
  steps.forEach((s,i)=>{ const a=s.querySelector('a'); if(a){ const r=a.getBoundingClientRect();
    if (r.height<40||r.width<44) bad.push('step'+(i+1)+' cta '+Math.round(r.width)+'x'+Math.round(r.height)); }});
  const small = new Set();
  grid.querySelectorAll('*').forEach(e=>{ if(!e.textContent.trim())return;
    const f=parseFloat(getComputedStyle(e).fontSize); if(f<11) small.add(Math.round(f*10)/10+':'+(e.className||e.tagName).toString().split(' ')[0]); });
  if (small.size) bad.push('type<11 '+[...small].join(','));
  const fr = frame.getBoundingClientRect();
  return innerWidth+'x'+innerHeight+' fit '+cs.getPropertyValue('--ctrl-fit').trim()
    +' frame '+Math.round(fr.width)+'x'+Math.round(fr.height)
    +' | '+(bad.length? [...new Set(bad)].join(' ; ') : 'OK');
})()
