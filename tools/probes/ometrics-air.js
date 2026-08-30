/* #outputs · the figures strip must have the same air above it as below it.

   Three things this had to get right before it said anything true, each of
   which had it reporting the strip as balanced when it was 10px out:

   1. **Measure the ink, not the line box.** A line box is taller than the
      letters and the letters are not centred in it, so equal `gap` and
      `padding` still come out unequal. Canvas
      `actualBoundingBoxAscent/Descent` gives the real ink.

   2. **Get the baseline from the DOM, not from arithmetic.** The strip is a
      baseline-aligned flex row, so a child's box height is not its
      line-height and reconstructing the baseline from half-leading lands
      several pixels out — enough to invert the answer. A zero-size
      `inline-block` sits with its bottom margin edge ON the baseline.

   3. **Wait for the strip to LAND.** `.ostage.is-live .ometrics li` holds a
      `translateY(6px)` until the run finishes, and 6px is most of the error
      being measured. Poll the transform — and poll it on the scene that is
      on *after* the tab swap, not the one captured before it, or the poll
      returns immediately against the outgoing scene.

   Every tab, because the strip's words change with the tab: an ascender or a
   descender moves the ink by up to 3px and no single value can equalise all
   seven at once. Within ~2px is the floor.

       agent-browser set viewport 1440 900
       agent-browser eval "$(cat tools/probes/ometrics-air.js)"                */
(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const r2 = v => Math.round(v * 10) / 10;
  const tabs = [...document.querySelectorAll('.tab')];
  /* the rail is laid down three times for the marquee; only the middle copy
     is live, and clicking a ghost changes nothing */
  const live = tabs.slice(tabs.length / 3, (tabs.length / 3) * 2);
  const out = [];

  for (const t of live) {
    t.click();
    await wait(700);                                   // let the scene swap
    const scene = document.querySelector('.scene.is-on');
    const frame = scene.querySelector('.ostage__frame');
    frame.scrollIntoView({ block: 'center', behavior: 'instant' });
    const strip = scene.querySelector('.ometrics');
    const li = strip.querySelector('li');
    for (let i = 0; i < 40 && getComputedStyle(li).transform !== 'none'; i++) await wait(100);
    await wait(400);

    const row = scene.querySelector('.ostage__row');
    const fr = frame.getBoundingClientRect();
    const rr = row.getBoundingClientRect();

    const probe = document.createElement('span');
    probe.style.cssText = 'display:inline-block;width:0;height:0;';
    li.appendChild(probe);
    const base = probe.getBoundingClientRect().bottom;
    probe.remove();

    const ctx = document.createElement('canvas').getContext('2d');
    let top = Infinity, bot = -Infinity, cap = Infinity;
    strip.querySelectorAll('*').forEach(el => {
      const txt = [...el.childNodes]
        .filter(n => n.nodeType === 3 && n.textContent.trim())
        .map(n => n.textContent).join('');
      if (!txt) return;
      const cs = getComputedStyle(el);
      ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const tm = ctx.measureText(txt);
      top = Math.min(top, base - tm.actualBoundingBoxAscent);
      bot = Math.max(bot, base + tm.actualBoundingBoxDescent);
      cap = Math.min(cap, base - ctx.measureText('H').actualBoundingBoxAscent);
    });

    const over = top - rr.bottom, under = fr.bottom - bot;
    out.push((scene.dataset.scene || '?').padEnd(12) +
      ' ink ' + String(r2(over)).padStart(5) + ' /' + String(r2(under)).padStart(5) +
      '   cap/baseline ' + String(r2(cap - rr.bottom)).padStart(5) + ' /' + String(r2(fr.bottom - base)).padStart(5) +
      (Math.abs(over - under) > 3 ? '   !UNEVEN' : ''));
  }
  return out.join('\n');
})()
