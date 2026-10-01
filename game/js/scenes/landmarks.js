/* scenes/landmarks.js — Riyadh's real towers, drawn to their real proportions, shared by the
   title screen and the Riyadh station so both show the same buildings.
   - Kingdom Centre (302 m): a broad tower whose sides curve in towards the top; the top third
     is the big rounded "bottle-opener" opening, two thin horns joined at the top by the sky
     bridge; a low mall podium at its foot. Silver-blue glass.
   - Al Faisaliah (267 m): a slender pyramid on four white concrete corner columns; glass
     between them up to about half height, then an open frame that hugs the golden glass
     globe and closes into the spire.
   - KAFD towers: the PIF Tower with its faceted crystal crown and plainer glass neighbours.
   - Low Najdi-style city: sand-coloured flat-roofed blocks with crenellated parapets.
   Every function draws on a scene raster (R.set) with a palette of hex colours, lit from the left. */
'use strict';
const LANDMARKS = (() => {
const RGB = {};
const C = h => RGB[h] || (RGB[h] = hexRGB(h));

/* ---------- Kingdom Centre. cx: axis, gy: ground row, h: height to the top of the sky bridge.
   P: {rim, lit, mid, sh, dk, deep, bridge, bridgeS, pod, podL, podS, podG} */
function kingdom(R, cx, gy, h, P){
  const set = (x, y, col) => R.set(x, y, C(col));
  const hb = Math.max(6, Math.round(h*.145));                      // half the base width
  const u0 = .64;                                                  // foot of the opening
  const ho = u => hb*(1 - .55*Math.pow(u, 2.2));                   // outer half width
  const th = u => Math.max(2, hb*(.27 - .07*(u - u0)/(1 - u0)));   // horn thickness
  const hi = u => u <= u0 ? -1 : (ho(u) - th(u))*Math.sqrt(Math.min(1, (u - u0)/.07));   // rounded U bottom
  const top = gy - h, brH = h >= 70 ? 2 : 1;
  const tones = [P.lit, P.mid, P.sh, P.dk];
  for(let y=top; y<=gy; y++){
    const u = (gy - y)/h, HO = Math.round(ho(u)), hiv = hi(u), HI = hiv < 0 ? -1 : Math.round(hiv - .25);
    const bridge = y < top + brH;
    for(let dx=-HO; dx<=HO; dx++){
      const ad = Math.abs(dx);
      if(!bridge && HI >= 0 && ad <= HI) continue;                 // sky through the opening
      let col;
      if(bridge) col = y === top ? P.bridge : P.bridgeS;
      else {
        const t = (dx + HO)/(2*HO);                                // across the curved face, lit from the left
        let k = t < .3 ? 0 : t < .58 ? 1 : t < .86 ? 2 : 3;
        if((gy - y) % 3 === 0 && k < 3) k++;                       // floor lines
        col = tones[k];
        if(dx === -HO) col = P.rim;
        if(HI >= 0 && dx === HI + 1 && dx < HO) col = P.rim;       // right horn's inner face catches the sun
        if(HI >= 0 && dx === -HI - 1 && dx > -HO) col = P.deep;    // left horn's inner face in shade
        if(dx === HO) col = P.deep;
      }
      set(cx + dx, y, col);
    }
  }
  // the sill at the bottom of the opening catches the light
  { const yb = gy - Math.round(h*u0) - 1, w = Math.round(hi(u0 + .07)*.6);
    for(let dx=-w; dx<=w; dx++) set(cx + dx, yb, P.rim); }
  // mall podium
  const ph = Math.max(2, Math.round(h*.05)), pw = Math.round(hb*1.9);
  for(let y=gy-ph+1; y<=gy; y++) for(let dx=-pw; dx<=pw; dx++){
    if(Math.abs(dx) <= Math.round(ho(0)) ) continue;
    const j = y - (gy - ph + 1);
    set(cx + dx, y, j === 0 ? P.podL : (j === 1 && ph > 2) ? P.podG : dx > 0 ? P.podS : P.pod);
  }
  return {hb, top};
}

/* ---------- Al Faisaliah. cx: axis, gy: ground row, h: height to the spire tip.
   P: {colL, colR, glassL, glassR, floor, ledge, gold0, gold1, gold2, gold3, spire} */
function faisaliah(R, cx, gy, h, P){
  const set = (x, y, col) => R.set(x, y, C(col));
  const fb = Math.max(3, h*.105), ja = Math.round(h*.86), jb = Math.round(h*.55);
  const jg = Math.round(h*.715), gr = Math.max(2, Math.round(h*.045));
  const HWf = j => { const q = j/ja; return fb*(1 - .45*q - .55*Math.pow(q, 4)); };   // straight taper that closes in round the globe
  // the golden globe first; the corner columns pass in front of its sides
  { const gyc = gy - jg;
    for(let dy=-gr; dy<=gr; dy++) for(let dx=-gr; dx<=gr; dx++){
      const d = dx*dx + dy*dy; if(d > gr*gr + gr*.6) continue;
      const l = (-dx - dy)/(gr*1.4);                                // lit from the upper left
      set(cx + dx, gyc + dy, l > .45 ? P.gold3 : l > -.1 ? P.gold2 : l > -.6 ? P.gold1 : P.gold0); }
    for(let dx=-gr+1; dx<=gr-1; dx++) set(cx + dx, gyc + gr + 1, P.colR);   // the globe's platform
  }
  for(let j=0; j<ja; j++){
    const y = gy - j, HW = Math.round(HWf(j)), cw = Math.max(h >= 50 && HW >= 3 ? 2 : 1, Math.round(HWf(j)*.26));
    for(let dx=-HW; dx<=HW; dx++){
      let col = null;
      if(dx < -HW + cw) col = P.colL;
      else if(dx > HW - cw) col = P.colR;
      else if(j <= jb){ col = dx <= 0 ? P.glassL : P.glassR; if(j % 3 === 0) col = P.floor; }
      if(col) set(cx + dx, y, col);
    }
    if(j === jb) for(let dx=-HW+cw; dx<=HW-cw; dx++) set(cx + dx, y, P.ledge);
  }
  // apex lantern and spire
  for(let j=ja; j<=h; j++) set(cx, gy - j, j > h - 2 ? P.colR : P.spire);
  set(cx - 1, gy - ja, P.colL); set(cx + 1, gy - ja, P.colR);
}

/* ---------- a glass office tower. x0: left edge, w: width, h: height, crown:
   'flat' | 'slant' | 'pif' | 'step' | 'mast'. P: {rim, lit, mid, sh, dk, mull} */
function tower(R, x0, gy, w, h, P, crown = 'flat'){
  const set = (x, y, col) => R.set(x, y, C(col));
  x0 = Math.round(x0); w = Math.max(3, Math.round(w)); h = Math.round(h);
  const top = gy - h, sw = Math.max(1, Math.round(w*.32));
  const pk = Math.round((w - 1)*.38);
  const roof = i => crown === 'slant' ? top + Math.round((w - 1 - i)*.7)
    : crown === 'pif' ? top + Math.round(i <= pk ? (pk - i)*1.6 : (i - pk)*.9)
    : crown === 'step' ? top + (i < w*.55 ? 0 : Math.max(2, Math.round(h*.06)))
    : top;
  for(let i=0; i<w; i++){
    const t = roof(i), side = i >= w - sw;
    for(let y=t; y<=gy; y++){
      const j = gy - y;
      let col = side ? (j % 3 === 0 ? P.dk : P.sh) : (j % 3 === 0 ? P.mid : P.lit);
      if(!side && i > 0 && i % 3 === 0 && j % 3 !== 0) col = P.mull;          // vertical mullions
      if(i === 0) col = P.rim;
      if(y === t) col = side ? P.mid : P.rim;
      set(x0 + i, y, col);
    }
  }
  if(crown === 'pif'){                                   // the crystal crown: a crease down the facets
    for(let k=0; k<Math.round(h*.16); k++){ const x = x0 + pk + Math.round(k*.35), y = top + 2 + k; if(x < x0 + w - sw) set(x, y, P.rim); }
  }
  if(crown === 'mast') for(let y=top - Math.max(2, Math.round(h*.12)); y<top; y++) set(x0 + (w>>1), y, P.mid);
  return top;
}

/* ---------- low city: rows of sand-coloured blocks with crenellated parapets and small windows.
   P: {lit, base, side, win, top}. rnd: seeded random. */
function lowrise(R, x0, x1, gy, hMin, hMax, P, rnd){
  const set = (x, y, col) => R.set(x, y, C(col));
  let x = Math.round(x0);
  while(x < x1){
    const w = 4 + Math.floor(rnd()*6), bh = hMin + Math.floor(rnd()*(hMax - hMin + 1)), t = gy - bh;
    const sw = Math.max(1, Math.round(w*.3)), crenel = rnd() < .5;
    for(let i=0; i<w; i++) for(let y=t; y<=gy; y++){
      const j = y - t, side = i >= w - sw;
      let col = side ? P.side : P.base;
      if(i === 0 || j === 0) col = side ? P.base : P.lit;
      if(!side && j >= 2 && j % 3 === 2 && i % 2 === 1 && y < gy - 1) col = P.win;
      set(x + i, y, col);
    }
    if(crenel) for(let i=1; i<w - sw; i+=2) set(x + i, t - 1, P.top);
    x += w + (rnd() < .25 ? 1 : 0);
  }
}

return {kingdom, faisaliah, tower, lowrise};
})();
