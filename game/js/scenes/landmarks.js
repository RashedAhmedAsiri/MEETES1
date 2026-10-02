/* scenes/landmarks.js — Riyadh's real towers, drawn to their real proportions, shared by the
   title screen and the Riyadh station so both show the same buildings.
   - Kingdom Centre (302 m): a broad tower with straight sides, as wide at the top; the top third
     is the big U-shaped opening, widest under the sky bridge, between two horns that thin as
     they rise; a low mall podium at its foot. Silver-blue glass.
   - Al Faisaliah (267 m): a slender pyramid on four white concrete corner columns; glass
     between them up to about half height, then an open frame that holds the golden glass
     globe (the front columns pass in front of its sides) and closes into the spire.
   - KAFD towers: the PIF Tower with its faceted crystal crown and plainer glass neighbours.
   - Low Najdi-style city: sand-coloured flat-roofed blocks with crenellated parapets.
   Every function draws on a scene raster (R.set) with a palette of hex colours, lit from the left. */
'use strict';
const LANDMARKS = (() => {
const RGB = {};
const C = h => RGB[h] || (RGB[h] = hexRGB(h));

/* ---------- Kingdom Centre geometry for a tower h rows tall (to the top of the sky bridge):
   hb half the base width, ho(u) outer half width and hi(u) half width of the opening at
   u = height / h (hi < 0 below the opening) */
function kingdomGeom(h){
  const hb = Math.max(6, Math.round(h*.145));
  const u0 = .64;                                                  // foot of the opening
  const ho = () => hb;                                             // outer half width: straight sides, as wide at the top as at the foot
  const A = Math.max(1, hb - Math.max(2, hb*.2));                  // half the opening's width under the bridge
  const hi = u => u <= u0 ? -1 : A*Math.sqrt(1 - Math.pow(1 - (u - u0)/(1 - u0), 2.2));   // a U: round foot, nearly straight sides
  return {hb, u0, ho, hi};
}

/* ---------- Kingdom Centre. cx: axis, gy: ground row, h: height to the top of the sky bridge.
   P: {rim, lit, mid, sh, dk, deep, bridge, bridgeS, pod, podL, podS, podG} */
function kingdom(R, cx, gy, h, P){
  const set = (x, y, col) => R.set(x, y, C(col));
  const {hb, u0, ho, hi} = kingdomGeom(h);
  const top = gy - h, brH = h >= 70 ? 2 : 1;
  const tones = [P.lit, P.mid, P.sh, P.dk];
  const sky = (y, dx) => { const u = (gy - y)/h, v = hi(u); return y >= top + brH && v >= 0 && Math.abs(dx) <= Math.round(v - .25); };
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
        if(sky(y - 1, dx) && !sky(y, dx)) col = P.rim;             // the round foot of the opening catches the light
      }
      set(cx + dx, y, col);
    }
  }
  // mall podium
  const ph = Math.max(2, Math.round(h*.05)), pw = Math.round(hb*1.9);
  for(let y=gy-ph+1; y<=gy; y++) for(let dx=-pw; dx<=pw; dx++){
    if(Math.abs(dx) <= Math.round(ho(0)) ) continue;
    const j = y - (gy - ph + 1);
    set(cx + dx, y, j === 0 ? P.podL : (j === 1 && ph > 2) ? P.podG : dx > 0 ? P.podS : P.pod);
  }
  return {hb, top};
}

/* ---------- Al Faisaliah geometry for a tower h rows tall (to the spire tip): the corner columns
   meet at row ja; the glass ends at jb; the globe (radius gr) is centred jg rows up. HW(j) is
   the half width at row j: a gentle taper up the office floors that closes in faster round the
   globe, wide enough there that the globe stays inside the frame. */
function faisaliahGeom(h){
  const fb = Math.max(3, h*.105), ja = Math.round(h*.87), jb = Math.round(h*.55);
  const jg = Math.round(h*.73), gr = Math.max(2, Math.round(h*.04));
  const qg = jg/ja, n = 5, T = Math.min(.9, (gr + .5)/fb);
  const a = Math.max(0, Math.min(1, (1 - Math.pow(qg, n) - T)/(qg - Math.pow(qg, n))));
  const HW = j => { const q = Math.min(1, j/ja); return fb*(1 - a*q - (1 - a)*Math.pow(q, n)); };
  return {fb, ja, jb, jg, gr, HW};
}

/* ---------- Al Faisaliah. cx: axis, gy: ground row, h: height to the spire tip.
   P: {colL, colR, glassL, glassR, floor, ledge, gold0, gold1, gold2, gold3, spire} */
function faisaliah(R, cx, gy, h, P){
  const set = (x, y, col) => R.set(x, y, C(col));
  const {ja, jb, jg, gr, HW: HWf} = faisaliahGeom(h);
  // the golden globe first; the front corner columns pass in front of its sides
  { const gyc = gy - jg;
    for(let dy=-gr; dy<=gr; dy++) for(let dx=-gr; dx<=gr; dx++){
      const d = dx*dx + dy*dy; if(d > gr*gr + gr*.6) continue;
      const edge = d > (gr - 1)*(gr - 1) + (gr - 1)*.6;             // the rim stays darker than the white columns
      const l = 1 - Math.hypot(dx + gr*.35, dy + gr*.35)/(gr*1.6);  // a highlight up on the left, the sun's side
      set(cx + dx, gyc + dy, l > .7 && !edge ? P.gold3 : l > .4 && !edge ? P.gold2 : l > .1 ? P.gold1 : P.gold0); }
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
