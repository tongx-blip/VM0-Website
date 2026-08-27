/* #control · the frame follows the window and the picture is centred in it.
   Asserts, in every beat: the picture's air is equal top/bottom and
   left/right, the index bar is inside the frame, and nothing is clipped.

       agent-browser set viewport 1440 900
       agent-browser open http://localhost:8899/index.html
       agent-browser eval "$(cat tools/probes/ctrl-frame.js)"                */
(async ()=>{
  const w = ms => new Promise(r=>setTimeout(r,ms));
  const grid = document.querySelector('.ctrl');
  const frame = document.getElementById('ctrlframe');
  const win = document.querySelector('.ctrl__win');
  const idx = frame.querySelector('.ctrl__index');
  grid.scrollIntoView({block:'start'}); await w(800);
  const out = [];
  for (let b=1;b<=5;b++){
    frame.dataset.beat=String(b); await w(650);
    const fr = frame.getBoundingClientRect();
    /* getBoundingClientRect on a scaled element IS the visual box — which is
       the whole point of measuring it rather than its children. */
    const wb = win.getBoundingClientRect();
    const ir = idx.getBoundingClientRect();
    out.push('b'+b
      +' top '+Math.round(wb.top-fr.top)+' bot '+Math.round(fr.bottom-wb.bottom)
      +' L '+Math.round(wb.left-fr.left)+' R '+Math.round(fr.right-wb.right)
      +' idxIn '+(ir.top>=fr.top-1 && ir.bottom<=fr.bottom+1)
      +(wb.top<fr.top-1||wb.bottom>fr.bottom+1||wb.left<fr.left-1||wb.right>fr.right+1?' CLIPPED':''));
  }
  const fr = frame.getBoundingClientRect();
  return innerWidth+'x'+innerHeight+' frame '+Math.round(fr.width)+'x'+Math.round(fr.height)
    +' fit '+getComputedStyle(grid).getPropertyValue('--ctrl-fit').trim()
    +'\n  '+out.join('\n  ');
})()
