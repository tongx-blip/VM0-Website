/* The four-beat workflow scene: every object inside the canvas, every state.
   Asserts the subject is centred, nothing escapes, and flags every overlap so
   the intended ones can be checked against the unintended ones.

       agent-browser eval "$(cat tools/probes/wfsc-geometry.js)"              */
(async ()=>{
  const wait = ms => new Promise(r=>setTimeout(r,ms));
  const cv = document.querySelector('.wfsc__cv').getBoundingClientRect();
  const sc = document.getElementById('wfScene');
  const sel = ['.wfo--ask','.wfo--run','.wfo--team','.wfo--perm','.wfo--list'];
  const pc = (v,t) => Math.round(v/t*100);
  const out = [];
  for (const step of ['1','2','3','4']) {
    sc.dataset.step = step; await wait(900);
    const box = sel.map(n=>{const el=document.querySelector(n);
      if(parseFloat(getComputedStyle(el).opacity)<0.05) return null;
      const r=el.getBoundingClientRect();
      return {n:n.replace('.wfo--',''),l:r.left,r:r.right,t:r.top,b:r.bottom};}).filter(Boolean);
    const hit=[];
    for(let i=0;i<box.length;i++)for(let j=i+1;j<box.length;j++){
      const a=box[i],b=box[j];
      const ox=Math.min(a.r,b.r)-Math.max(a.l,b.l), oy=Math.min(a.b,b.b)-Math.max(a.t,b.t);
      if(ox>2&&oy>2) hit.push(a.n+'x'+b.n+':'+Math.round(ox)+'/'+Math.round(oy));}
    const esc=box.filter(x=>x.t<cv.top-2||x.b>cv.bottom+2||x.l<cv.left-2||x.r>cv.right+2).map(x=>x.n);
    const gl=Math.min(...box.map(b=>b.l)), gr=Math.max(...box.map(b=>b.r));
    const gt=Math.min(...box.map(b=>b.t)), gb=Math.max(...box.map(b=>b.b));
    out.push('s'+step+' ['+box.map(b=>b.n+' '+pc(b.l-cv.left,cv.width)+','+pc(b.t-cv.top,cv.height)+'→'+pc(b.r-cv.left,cv.width)+','+pc(b.b-cv.top,cv.height)).join(' | ')
      +'] grpX '+pc(gl-cv.left,cv.width)+'-'+pc(cv.right-gr,cv.width)
      +' grpY '+pc(gt-cv.top,cv.height)+'-'+pc(cv.bottom-gb,cv.height)
      +' ov['+(hit.join(' ')||'ok')+'] out['+(esc.join(' ')||'ok')+']');
  }
  return out.join('\n');
})()
