/* The four-beat workflow scene: every object inside the canvas, every state.
   Asserts the subject is centred, nothing escapes, and flags every overlap so
   the intended ones can be checked against the unintended ones.

   Beat 1 has TWO frames — before the runner reaches Slack and after — so it
   is reported twice: `s1` is the ask beside the run card, `s1+` is the
   #growth message that replaces the ask. They are separate compositions and
   each one has to stand on its own.

       agent-browser eval "$(cat tools/probes/wfsc-geometry.js)"              */
(async ()=>{
  const wait = ms => new Promise(r=>setTimeout(r,ms));
  const sc = document.getElementById('wfScene');
  const sel = ['.wfo--ask','.wfo--post','.wfo--run','.wfo--team','.wfo--perm','.wfo--list'];
  const pc = (v,t) => Math.round(v/t*100);

  /* An object hidden by clip-path still has its full border box, and a probe
     that only reads opacity counted the Slack card as present in all four
     beats — four phantom overlaps that hid the one real one underneath them.
     Read the clip too, and report what is actually on screen. */
  const visible = el => {
    const cs = getComputedStyle(el);
    if (parseFloat(cs.opacity) < 0.05 || cs.visibility === 'hidden') return null;
    const r = el.getBoundingClientRect();
    const m = /^inset\(([^)]*)\)/.exec(cs.clipPath);
    if (!m) return r;
    const p = m[1].trim().split(/\s+/).slice(0, 4);
    const s = [p[0], p[1] ?? p[0], p[2] ?? p[0], p[3] ?? p[1] ?? p[0]];
    const px = (v, base) => v.endsWith('%') ? parseFloat(v) / 100 * base : parseFloat(v);
    const t = px(s[0], r.height), rr = px(s[1], r.width),
          b = px(s[2], r.height), l = px(s[3], r.width);
    const box = { left:r.left + l, right:r.right - rr, top:r.top + t, bottom:r.bottom - b };
    return (box.right - box.left > 1 && box.bottom - box.top > 1) ? box : null;
  };

  let cv;
  const frame = (label) => {
    const box = sel.map(n => { const el = document.querySelector(n);
      const r = visible(el); if (!r) return null;
      return { n:n.replace('.wfo--',''), l:r.left, r:r.right, t:r.top, b:r.bottom }; }).filter(Boolean);
    const hit=[];
    for(let i=0;i<box.length;i++)for(let j=i+1;j<box.length;j++){
      const a=box[i],b=box[j];
      const ox=Math.min(a.r,b.r)-Math.max(a.l,b.l), oy=Math.min(a.b,b.b)-Math.max(a.t,b.t);
      if(ox>2&&oy>2) hit.push(a.n+'x'+b.n+':'+Math.round(ox)+'/'+Math.round(oy));}
    const esc=box.filter(x=>x.t<cv.top-2||x.b>cv.bottom+2||x.l<cv.left-2||x.r>cv.right+2).map(x=>x.n);
    const gl=Math.min(...box.map(b=>b.l)), gr=Math.max(...box.map(b=>b.r));
    const gt=Math.min(...box.map(b=>b.t)), gb=Math.max(...box.map(b=>b.b));
    return label+' ['+box.map(b=>b.n+' '+pc(b.l-cv.left,cv.width)+','+pc(b.t-cv.top,cv.height)+'→'+pc(b.r-cv.left,cv.width)+','+pc(b.b-cv.top,cv.height)).join(' | ')
      +'] grpX '+pc(gl-cv.left,cv.width)+'-'+pc(cv.right-gr,cv.width)
      +' grpY '+pc(gt-cv.top,cv.height)+'-'+pc(cv.bottom-gb,cv.height)
      +' ov['+(hit.join(' ')||'ok')+'] out['+(esc.join(' ')||'ok')+']';
  };

  const out = [];
  const ask = document.querySelector('.wfo--ask');
  const post = document.querySelector('.wfo--post');
  /* Beat 1 and beat 3 each run a timer that writes classes. Driving
     `data-step` by hand does not stop them — the page's own scroll handler
     is what starts and stops them — so park the pin on the last step first.
     Without this the runner's loop takes `is-in` back off the Slack card
     between the write and the measurement, and the landing reads 0px tall. */
  const ladder = document.getElementById('ladder');
  window.scrollTo(0, ladder.offsetTop + ladder.offsetHeight - innerHeight);
  await wait(900);
  cv = document.querySelector('.wfsc__cv').getBoundingClientRect();
  for (const step of ['1','2','3','4']) {
    sc.dataset.step = step; await wait(900);
    out.push(frame('s'+step));
    if (step === '1') {
      /* the landing, held: the loop only shows it for 2.4s at a time */
      post.classList.add('is-in'); ask.classList.add('is-away'); await wait(1500);
      out.push(frame('s1+'));
      post.classList.remove('is-in'); ask.classList.remove('is-away'); await wait(600);
    }
  }
  return out.join('\n');
})()
