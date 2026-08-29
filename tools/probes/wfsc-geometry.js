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
     Read the clip too, and report what is actually on screen.

     Both helpers count bracket depth. `/inset\(([^)]*)\)/` stops at the first
     `)`, which for `inset(-10px -10px calc(100% + 10px))` is the one inside
     the calc — so the clip parsed as three tokens and a stray `+`, the closed
     card measured as open, and `s1+` reported the frame it had just left.
     Same parser as `audit.js` §11, same reason. */
  const arg = s => {
    const i = s.indexOf('(');
    if (i < 0) return '';
    for (let j = i, d = 0; j < s.length; j++) {
      if (s[j] === '(') d++;
      else if (s[j] === ')' && --d === 0) return s.slice(i + 1, j);
    }
    return '';
  };
  const words = s => {
    const out = []; let d = 0, cur = '';
    for (const ch of s) {
      if (ch === '(') d++;
      if (ch === ')') d--;
      if (/\s/.test(ch) && !d) { if (cur) out.push(cur); cur = ''; }
      else cur += ch;
    }
    if (cur) out.push(cur);
    return out;
  };
  const len = (tok, base) => {
    let total = 0, sign = 1;
    for (const t of words(/^calc\(/i.test(tok) ? arg(tok) : tok)) {
      if (t === '+') { sign = 1; continue; }
      if (t === '-') { sign = -1; continue; }
      total += sign * (t.endsWith('%') ? parseFloat(t) / 100 * base : parseFloat(t) || 0);
      sign = 1;
    }
    return total;
  };
  const visible = el => {
    const cs = getComputedStyle(el);
    if (parseFloat(cs.opacity) < 0.05 || cs.visibility === 'hidden') return null;
    const r = el.getBoundingClientRect();
    if (!/^inset\(/.test(cs.clipPath)) return r;
    const p = words(arg(cs.clipPath));
    const cut = p.indexOf('round');
    const v = (cut < 0 ? p : p.slice(0, cut)).slice(0, 4);
    const s = [v[0], v[1] ?? v[0], v[2] ?? v[0], v[3] ?? v[1] ?? v[0]];
    const t = len(s[0], r.height), rr = len(s[1], r.width),
          b = len(s[2], r.height), l = len(s[3], r.width);
    /* the clip may bleed OUTSIDE the box to clear a shadow; the object is
       still only as big as its own border box, so clamp at zero */
    const box = { left:r.left + Math.max(0, l), right:r.right - Math.max(0, rr),
                  top:r.top + Math.max(0, t), bottom:r.bottom - Math.max(0, b) };
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
