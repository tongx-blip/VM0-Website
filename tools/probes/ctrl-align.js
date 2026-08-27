/* #control · every statement is centred on the frame when it is current.
   Scrolls each step's CONTENT centre (not its box centre — the first step
   has asymmetric padding) to the middle of the viewport, converging rather
   than jumping, then compares the two centres.                            */
(async ()=>{
  const wait = ms => new Promise(r=>setTimeout(r,ms));
  const grid = document.querySelector('.ctrl');
  const frame = document.getElementById('ctrlframe');
  const steps = [...document.querySelectorAll('.ctrl__step')];
  const cs = getComputedStyle(grid);
  const out = ['vp '+innerWidth+'x'+innerHeight+' fit '+cs.getPropertyValue('--ctrl-fit').trim()
    +' h '+cs.getPropertyValue('--ctrl-h').trim()+' top '+cs.getPropertyValue('--ctrl-top').trim()];
  const centre = s => { const k=[...s.children].filter(e=>e.getBoundingClientRect().height>0);
    return (Math.min(...k.map(e=>e.getBoundingClientRect().top))
          + Math.max(...k.map(e=>e.getBoundingClientRect().bottom)))/2; };
  for (let i=0;i<steps.length;i++){
    const s = steps[i];
    for (let pass=0; pass<3; pass++){
      const d = centre(s) - innerHeight/2;
      if (Math.abs(d) < 1) break;
      scrollBy(0, d); await wait(500);
    }
    await wait(400);
    const fr = frame.getBoundingClientRect();
    out.push('step'+(i+1)+' active='+frame.dataset.beat
      +' frameC '+Math.round(fr.top+fr.height/2)
      +' textC '+Math.round(centre(s))
      +' Δ '+Math.round(centre(s) - (fr.top+fr.height/2))
      +' frame '+Math.round(fr.top)+'..'+Math.round(fr.bottom)
      +(fr.top< -1||fr.bottom>innerHeight+1?' !OFFSCREEN':''));
  }
  return out.join('\n');
})()
