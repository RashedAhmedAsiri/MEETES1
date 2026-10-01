/* scenes/riyadh.js — modern Riyadh, the capital, at golden hour, with its real towers
   (drawn by js/scenes/landmarks.js to their real proportions): Kingdom Centre in the middle
   (broad silver-blue tower, the rounded opening in its top third and the sky bridge),
   Al Faisaliah on the left (slim pyramid on white corner columns, golden globe and spire),
   the KAFD towers with the PIF Tower's crystal crown on the right, Olaya's stone-and-glass
   towers, the low sand-coloured city, the elevated Riyadh Metro with a train, and a
   palm-lined highway with small cars.
   Everything is drawn per pixel on the scene raster (one pixel grid). */
(() => {
'use strict';
const HEX = {
  // sky (golden hour) and sun
  sk0:'#4f8fd8', sk1:'#79acdf', sk2:'#a9cbe4', sk3:'#e9dcc0', sk4:'#f6c890',
  su1:'#ffd766', su2:'#fff2c0', halo:'#fbe3ae',
  // far hazy city on the horizon
  hz0:'#c3aab4', hz1:'#d6bfbf',
  // the towers' own palettes live with their drawings below (js/scenes/landmarks.js)
  bd:'#4a4f6e',
  // metro viaduct and train
  v0:'#857e72', v1:'#a8a194', v2:'#c9c2b3', v3:'#e8e2d4',
  t0:'#9aa3a8', t1:'#d0d7da', t2:'#f6f6f2', tb:'#2b6ca3', tw:'#2c3a55', tw2:'#6f9fd0',
  // ground, palms, road
  gr0:'#caa878', gr1:'#dcc08e',
  p0:'#1f6f3a', p1:'#3a9a4a', p2:'#6cc05a', p3:'#a8e07a', pt0:'#6b4428', pt1:'#9a6a40', pd:'#e8833a',
  rd1:'#6c717e', ln:'#f4efe2',
  cb0:'#a39a86', cb1:'#d8cfbb', sw0:'#d9c49a', sw1:'#e8d6ad', sw2:'#f2e4c2',
  tire:'#23242c',
  // car colours [dark, base, light]
  cr0:'#8f2a24', cr1:'#d94a3d', cr2:'#f08070',
  cy0:'#c98a1a', cy1:'#f7c948', cy2:'#fff0a0',
  cw0:'#aeb4bc', cw1:'#eef0f2', cw2:'#ffffff',
  cg0:'#0e6b3a', cg1:'#1f8f4e', cg2:'#5cbf60',
  cu0:'#2b6ca3', cu1:'#4fa4d8', cu2:'#9fd8f5',
  cgl2:'#8fb8d8', hl:'#fff6c8',
};
const C = {}; for(const k in HEX) C[k] = hexRGB(HEX[k]);

/* roadside date palm (no outline, lit from the upper left) */
const PALM = [
"...ll...ll....",
".llppl.lppll..",
"lp...pdpp..pl.",
"p...pddddp...p",
"...p.dood.p...",
".....dtTd.....",
"......tT......",
"......tT......",
"......tT......",
".......tT.....",
".......tT.....",
".......tT.....",
"......ttTT...."];
const PALM_S = [
"..ll..ll...",
".lppllppl..",
"lp..ddd.pl.",
"p..pdod.p..",
"....tT.....",
"....tT.....",
".....tT....",
".....tT....",
"....ttTT..."];
const PCOL = {l:'p3', p:'p1', d:'p0', o:'pd', t:'pt1', T:'pt0'};

SCENES.riyadh = k => {
  const {R, W, H} = k, r = k.r, c = C;
  const set = (x,y,col) => R.set(x,y,col);
  const rect = (x,y,w,h,col) => { for(let j=0;j<h;j++) for(let i=0;i<w;i++) R.set(x+i,y+j,col); };
  const hline = (x0,x1,y,col) => { for(let x=x0;x<=x1;x++) R.set(x,y,col); };
  const grid = (G, x, yb) => { for(let j=0;j<G.length;j++) for(let i=0;i<G[j].length;i++){ const ch = G[j][i]; if(ch !== '.') set(x+i, yb-G.length+1+j, c[PCOL[ch]]); } };

  /* ---------- layout (all relative to W, H) */
  const G = Math.round(H*.68);                    // foot of the towers
  const dTop = G + 1, dH = Math.max(4, Math.round(H*.034)), dBot = dTop + dH - 1;  // metro deck
  const rTop = Math.round(H*.79), rBot = Math.round(H*.955);                        // highway

  /* ---------- sky + low sun on the left */
  R.bands(0, G+2, [HEX.sk0, HEX.sk1, HEX.sk2, HEX.sk3, HEX.sk4]);
  const sr = Math.max(4, Math.round(H*.045));
  const sx = Math.round(W*.09) + 2, sy = Math.round(H*.46);
  R.disc(sx, sy, sr+2, HEX.halo);
  R.disc(sx, sy, sr, HEX.su1);
  R.disc(sx-1, sy-1, Math.max(2, sr-2), HEX.su2);

  /* ---------- far hazy city along the horizon */
  { let x = 0; while(x < W){ const w = 3 + Math.floor(r()*6), h = 2 + Math.floor(r()*Math.max(3, H*.05));
      rect(x, G-h, w, h+3, c.hz1); x += w; }
    x = 2; while(x < W){ const w = 2 + Math.floor(r()*5), h = 1 + Math.floor(r()*Math.max(2, H*.03));
      rect(x, G-h, w, h+3, c.hz0); x += w + 1 + Math.floor(r()*4); } }

  const L = LANDMARKS;
  const kTop = Math.max(3, Math.round(H*.05)), kh = G - kTop;
  const tw = v => Math.max(3, Math.round(v*kh));  // tower widths scale with the Kingdom Centre

  /* ---------- KAFD on the right, a few kilometres away and hazy: the PIF Tower's crystal crown */
  const KAFD = {rim:'#e9ebf2', lit:'#bfc7da', mid:'#aab3ca', sh:'#929cb7', dk:'#838da9', mull:'#b2bad0'};
  L.tower(R, W*.735, G, tw(.05), kh*.26, KAFD, 'slant');
  L.tower(R, W*.905, G, tw(.06), kh*.3, KAFD, 'step');
  L.tower(R, W*.865, G, tw(.05), kh*.4, KAFD, 'flat');
  L.tower(R, W*.79, G, tw(.075), kh*.56, KAFD, 'pif');
  L.tower(R, W*.765, G, tw(.05), kh*.33, KAFD, 'mast');
  L.tower(R, W*.95, G, tw(.05), kh*.22, KAFD, 'flat');

  /* ---------- Olaya: stone-and-glass office towers between the landmarks */
  const OL = {rim:'#f7ecd8', lit:'#dccfb6', mid:'#cbbda2', sh:'#aa9b81', dk:'#998b72', mull:'#8fa3b5'};
  L.tower(R, W*.04, G, tw(.06), kh*.2, OL, 'flat');
  L.tower(R, W*.37, G, tw(.055), kh*.24, OL, 'slant');
  L.tower(R, W*.42, G, tw(.05), kh*.16, OL, 'flat');
  L.tower(R, W*.625, G, tw(.06), kh*.28, OL, 'step');
  L.tower(R, W*.675, G, tw(.05), kh*.18, OL, 'flat');

  /* ---------- Al Faisaliah (267 m) and Kingdom Centre (302 m) */
  const kx = Math.round(W*.52), fx = Math.round(W*.25);
  L.faisaliah(R, fx, G, Math.round(kh*.86), {colL:'#f6ecd8', colR:'#b6a88f', glassL:'#7fa9bd', glassR:'#5a849c', floor:'#6c96ab',
    ledge:'#9fb9c6', gold0:'#9a6414', gold1:'#c98a1a', gold2:'#f7c948', gold3:'#fff0a0', spire:'#e9dfcc'});
  L.kingdom(R, kx, G, kh, {rim:'#fbe6c4', lit:'#d0d7e0', mid:'#abb6c6', sh:'#8793a8', dk:'#69768c', deep:'#4b566a',
    bridge:'#eef1f5', bridgeS:'#8e99b1', pod:'#d8ccb3', podL:'#efe6d2', podS:'#b6a98f', podG:'#6f7f9a'});

  const bird = (x, y) => { set(x, y, c.bd); set(x+1, y+1, c.bd); set(x+2, y, c.bd); set(x+3, y+1, c.bd); set(x+4, y, c.bd); };
  bird(Math.round(W*.36), Math.round(H*.17)); bird(Math.round(W*.4), Math.round(H*.14));

  /* ---------- the low city in front: sand-coloured Najdi-style blocks */
  L.lowrise(R, 0, W, G, Math.max(2, Math.round(H*.02)), Math.max(4, Math.round(H*.055)),
    {lit:'#f2e4c6', base:'#dfcca6', side:'#c4ad86', win:'#a08a6a', top:'#f2e4c6'}, r);

  /* ---------- metro viaduct, piers and a train */
  const pierStep = Math.max(24, Math.round(W*.16)), pier0 = Math.round(pierStep*.45);
  for(let y=dBot+1; y<rTop; y++) hline(0, W-1, y, y === dBot+1 ? c.gr0 : c.gr1);   // ground under the deck
  for(let px = pier0; px < W+2; px += pierStep){
    for(let y=dBot+1; y<rTop; y++){ set(px-1, y, c.v2); set(px, y, c.v1); set(px+1, y, c.v0); }
    hline(px-3, px+3, dBot+1, c.v1); hline(px-2, px+2, dBot+2, c.v1);
  }
  for(let x=0;x<W;x++){
    set(x, dTop, c.v3);
    for(let y=dTop+1; y<dBot; y++) set(x, y, c.v2);
    set(x, dBot, c.v0);
  }
  // train: three white cars with a blue stripe, heading left
  const tH = Math.max(5, Math.round(H*.05)), tTop = dTop - tH;
  const carL = Math.max(16, Math.round(W*.09));
  const tx0 = Math.round(kx + W*.06);
  for(let n=0;n<3;n++){
    const x0 = tx0 + n*(carL+1);
    for(let i=0;i<carL;i++){
      const nose = n === 0 ? Math.max(0, 3 - i) : 0;     // sloped front on the leading car
      for(let j=0;j<tH;j++){
        if(j < nose) continue;
        let col = c.t2;
        if(j === 0) col = c.t1;
        else if(j === tH-1) col = c.t0;
        else if(j === tH-2) col = c.tb;
        else if(j === 1 || (tH > 5 && j === 2)) col = (i%4 === 3) ? c.t2 : (i%4 === 0 ? c.tw2 : c.tw);
        if(n === 0 && i === nose && j < tH-2) col = c.tw;
        set(x0+i, tTop+j, col);
      }
    }
  }

  /* ---------- hedge and palms along the far side of the highway */
  for(let x=0;x<W;x++){ set(x, rTop-2, (x%5===1) ? c.p2 : c.p1); set(x, rTop-1, (x%3===0) ? c.p0 : c.p1); }
  const big = H >= 125;
  const palmsAt = [.05, .14, .36, .45, .6, .69, .86, .95];
  palmsAt.forEach((f, i) => grid(big && i%2 === 0 ? PALM : PALM_S, Math.round(W*f) - 6, rTop - 2));

  /* ---------- highway: two lanes each way, concrete median */
  hline(0, W-1, rTop, c.cb1);
  for(let y=rTop+1; y<rBot; y++) hline(0, W-1, y, c.rd1);
  hline(0, W-1, rBot, c.cb1);
  const mid = Math.round((rTop + rBot)/2);
  hline(0, W-1, mid-1, c.cb1); hline(0, W-1, mid, c.cb0);
  const lq1 = Math.round((rTop + mid)/2), lq2 = Math.round((mid + rBot)/2);
  for(let x=0;x<W;x+=8){ hline(x, x+3, lq1, c.ln); hline(x+4, x+7, lq2, c.ln); }

  const CAR = ["..LLL...", ".LccLc..", "LBBBBBBh", "DkDDDkDD"];
  const car = (x, yb, dir, k) => {
    const d = c['c'+k+'0'], b = c['c'+k+'1'], l = c['c'+k+'2'];
    for(let j=0;j<CAR.length;j++) for(let i=0;i<8;i++){
      const ch = CAR[j][dir > 0 ? i : 7-i]; if(ch === '.') continue;
      const col = ch === 'L' ? l : ch === 'B' ? b : ch === 'D' ? d : ch === 'c' ? c.cgl2 : ch === 'h' ? c.hl : c.tire;
      set(x+i, yb-3+j, col); }
  };
  const lanes = [[lq1-1, -1], [mid-2, -1], [lq2-1, 1], [rBot-1, 1]];
  const kinds = ['r','y','w','u','g','w','r','y','u','w'];
  let ki = 0;
  lanes.forEach(([yb, dir], li) => {
    for(let x = Math.round(W*(.06 + li*.19)) % Math.round(W*.3); x < W - 4; x += Math.round(W*.3 + r()*W*.14)){
      car(x, yb, dir, kinds[ki++ % kinds.length]); }
  });

  /* ---------- near sidewalk */
  for(let y=rBot+1; y<H; y++) for(let x=0;x<W;x++) set(x, y, (y === rBot+1) ? c.cb0 : (y === rBot+2) ? c.sw2 : ((x + (y%2)*4) % 8 === 0 ? c.sw0 : c.sw1));
};
})();
