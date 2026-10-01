/* scenes/splash.js — title background: the Riyadh skyline at golden hour across the desert.
   The sun sets on the left beside Al Faisaliah (golden globe and spire); Kingdom Centre with its
   rounded opening and sky bridge stands on the right with the KAFD and Olaya towers, all drawn
   to their real proportions by js/scenes/landmarks.js; the low sand-coloured city lines the
   horizon; warm dunes, date palms and a camel fill the foreground. The title, mascot and
   buttons cover the middle of the screen, so the landmarks sit in the side strips and reach up
   into the top band; in portrait the horizon moves up so the skyline shows above the logo.
   Everything is drawn per pixel on the scene raster (one pixel grid). */
(() => {
'use strict';
const HEX = {
  // sky
  s0:'#3f6cb4', s1:'#6b93d0', s2:'#a9b7dc', s3:'#e7bfb8', s4:'#f5cf9e', s5:'#fae3b4',
  su0:'#f7b54a', su1:'#ffd766', su2:'#fff2c0', gl:'#fde9bc',
  // clouds
  cl0:'#c7a3c3', cl1:'#e8c0c8', cl2:'#ffe0b8',
  // far city haze
  hz0:'#c99a9e', hz1:'#dcb2a8',
  // dunes
  d0:'#b8703e', d1:'#d08a4c', d2:'#e3a45e', d3:'#efbd76', d4:'#f8d898', d5:'#fbe6b4',
  // palms, camel
  p0:'#1f6f3a', p1:'#3a9a4a', p2:'#6cc05a', p3:'#a8e07a', pt0:'#6b4428', pt1:'#9a6a40', pd:'#e8833a',
  c0:'#8a5a34', c1:'#b8834e', c2:'#dcae74', c3:'#f2d09a', ck:'#3b2a22', cr:'#d94a3d', cy:'#f7c948', cg:'#1f8f4e',
  bird:'#4a3f5e',
};
const C = {}; for(const k in HEX) C[k] = hexRGB(HEX[k]);

/* date palm, lit from the upper left (l light, p leaf, d dark leaf, o dates, t/T trunk) */
const PALM = [
"......ll....ll.......",
"....llppl..lppll.....",
"..llpp..pllp...ppl...",
".lpp....dppd.....pl..",
"lp.....ddpdpd.....pl.",
"p.....pd.oo.dp.....p.",
"p....pd..oT..dp......",
".....p...tT...d......",
".........tT..........",
".........tT..........",
"..........tT.........",
"..........tT.........",
"..........tT.........",
"..........tT.........",
"..........tT.........",
".........tTT.........",
".........tTT.........",
"........ttTTT........"];
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

/* dromedary facing left, with a woven saddle blanket (L light, M mid, D shade, k dark) */
const CAMEL = [
"...LL.......................",
"..LMMM......................",
".LMMMMM.............LL......",
"LMkMMMM...........LLMMM.....",
"MMMMMMM..........LMMMMMM....",
".DDMMMM.........LMrrrrMMD...",
"....MMM........LMryryryMMD..",
"....MMMM......LMMrrrrrrMMMD.",
".....MMMM....LMMMgggggMMMMD.",
"......MMMMLLLMMMMMMMMMMMMMMDD",
"......MMMMMMMMMMMMMMMMMMMMMD.D",
".......MMMMMMMMMMMMMMMMMMMD..D",
"........DMMMMMMMMMMMMMMMMD...D",
"..........MM.MD......MM.MD....",
"..........MM.MD......MM.MD....",
"..........MM..D......MM..D....",
"..........M...D......M...D....",
"..........M...D......M...D....",
"..........M...D......M...D....",
".........kk..kk.....kk..kk...."];
const CAMEL_L = [
"......L.................................",
"....LLlL................................",
"..LLllMMM...............................",
".LllMMkMM..........LLLL.................",
"LlMMMMMMMD.......LLrrrrLL...............",
"MMMMMMMMMD......LrryyyyyrrL.............",
"DDDMMMMMMD.....LrrrrrrrrrrrM............",
"....DMMMMD....LryryryryryryrM...........",
".....MMMMMD..LlrrrrrrrrrrrrrMM..........",
".....lMMMMMLLlMggggggggggggggMD.........",
".....lMMMMMMMMMMMMMMMMMMMMMMMMMD........",
"......lMMMMMMMMMMMMMMMMMMMMMMMMMDD......",
"......lMMMMMMMMMMMMMMMMMMMMMMMMMMDD.....",
".......MMMMMMMMMMMMMMMMMMMMMMMMMMD.D....",
".......DMMMMMMMMMMMMMMMMMMMMMMMMMD.D....",
"........DMMMMMMMMMMMMMMMMMMMMMMMD..k....",
".........DMMMDDDDDDDDDDDDMMMMDD.........",
"..........MMM.MD.........MMM.MD.........",
"..........MM..MD.........MM..MD.........",
"..........MM..MD.........MM..MD.........",
"..........MM..MD.........MM..MD.........",
"..........MMM.MDD........MMM.MDD........",
"..........MM..MD.........MM..MD.........",
"..........MM..MD.........MM..MD.........",
"..........MM..MD.........MM..MD.........",
".........kkk.kkk........kkk.kkk........."];
const CCOL = {L:'c3', l:'c2', M:'c1', D:'c0', k:'ck', r:'cr', y:'cy', g:'cg'};

SCENES.splash = k => {
  const {R, W, H} = k, r = k.r, c = C;
  const set = (x,y,col) => R.set(x,y,col);
  const hline = (x0,x1,y,col) => { for(let x=x0;x<=x1;x++) R.set(x,y,col); };
  const sprite = (G, map, x, yb, flip=false) => { const w = Math.max(...G.map(s => s.length));
    for(let j=0;j<G.length;j++) for(let i=0;i<G[j].length;i++){ const ch = G[j][i]; if(ch === '.' || !map[ch]) continue;
      set(flip ? x + w - 1 - i : x+i, yb-G.length+1+j, c[map[ch]]); } };

  /* ---------- layout */
  const portrait = H > W*1.15;
  const hy = portrait ? Math.round(H*.2) : Math.round(H*.62);          // horizon
  const u = Math.min(W, H*1.45)/393;                                   // size unit (1 at 393x273)

  /* ---------- sky */
  R.bands(0, hy+12, [HEX.s0, HEX.s1, HEX.s2, HEX.s3, HEX.s4, HEX.s5]);

  /* ---------- sun on the horizon (left), soft dithered glow */
  const sr = Math.max(6, Math.round(portrait ? W*.07 : 19*u));
  // left strip left free by the centred title content (landscape): the Faisaliah and the sun live there
  const strip = W >= 330 ? (W - 308)/2 : (W - 183)/2;
  const fxL = Math.round(Math.max(9, Math.min(strip*.6, 44)));
  const sx = portrait ? Math.round(W*.16) : Math.max(sr + 2, fxL - Math.round(sr*.85));   // beside Al Faisaliah, not hidden behind it
  const sy = hy - Math.round(sr*.35);
  const glowR = sr + Math.max(5, Math.round(sr*.6));
  const gl = C.gl;
  for(let y=sy-glowR; y<=sy+glowR && y < hy+2; y++) for(let x=sx-glowR; x<=sx+glowR; x++){
    const d = Math.hypot(x-sx, y-sy); if(d > glowR || d <= sr) continue;
    const f = 1 - (d - sr)/(glowR - sr); if(f*16 > BAYER[y&3][x&3] + 3) set(x, y, gl); }
  R.disc(sx, sy, sr, HEX.su1);
  R.disc(sx - Math.round(sr*.2), sy - Math.round(sr*.2), Math.max(2, Math.round(sr*.62)), HEX.su2);

  /* ---------- thin golden-hour cloud streaks and a few birds in the top band */
  const streak = (cx, cy, len) => { cx = Math.round(cx); cy = Math.round(cy); len = Math.round(len);
    for(let i=-len; i<=len; i++){ const t = Math.abs(i)/len; const th = t < .35 ? 2 : t < .8 ? 1 : 0;
      set(cx+i, cy+1, c.cl2); if(th >= 1) set(cx+i, cy, c.cl1); if(th >= 2) set(cx+i+2, cy-1, c.cl0); } };
  const topBand = portrait ? hy : Math.round(H*.19);
  streak(W*.5, topBand*.3, 26*u); streak(W*.66, topBand*.55, 18*u); streak(W*.36, topBand*.72, 14*u);
  if(portrait) streak(W*.3, hy*.55, 12*u);
  const bird = (x, y) => { x = Math.round(x); y = Math.round(y); set(x, y, c.bird); set(x+1, y+1, c.bird); set(x+2, y, c.bird); set(x+3, y+1, c.bird); set(x+4, y, c.bird); };
  bird(W*.44, topBand*.52); bird(W*.47, topBand*.42); bird(W*.505, topBand*.6);

  /* ---------- far hazy city on the horizon (right half) */
  { let x = Math.round(W*.45); while(x < W){ const w = 3 + Math.floor(r()*6), h = 2 + Math.floor(r()*Math.max(3, 9*u));
      for(let y=hy-h; y<=hy+1; y++) hline(x, x+w-1, y, (x/5|0)%3 ? c.hz1 : c.hz0); x += w; } }

  /* ---------- the Riyadh skyline at sunset, drawn to the real buildings' proportions
     (js/scenes/landmarks.js): Al Faisaliah in front of the sun, Kingdom Centre, the KAFD and
     Olaya towers, and the low sand-coloured city along the horizon */
  const L = LANDMARKS;
  const GLASS = {rim:'#ffdcaa', lit:'#c9cdd9', mid:'#a5abbf', sh:'#8189a3', dk:'#676e89', mull:'#b4b9ca'};
  const FARG  = {rim:'#f6dcc0', lit:'#cdbfc6', mid:'#bcaebb', sh:'#a597ab', dk:'#988aa0', mull:'#c3b5c0'};
  const KC = {rim:'#ffdcaa', lit:'#cdd2dc', mid:'#a8afc2', sh:'#848ca5', dk:'#69708b', deep:'#4f556e',
    bridge:'#fff0d8', bridgeS:'#8a90a8', pod:'#d6b996', podL:'#f0d6b0', podS:'#b39676', podG:'#6c6f8c'};
  const FS = {colL:'#fff0d6', colR:'#bba184', glassL:'#8fa8bd', glassR:'#687f9a', floor:'#7a92aa',
    ledge:'#a8b9c8', gold0:'#9a6414', gold1:'#c98a1a', gold2:'#f7c948', gold3:'#fff0a0', spire:'#f4e3c6'};
  const CITY = {lit:'#f2d6ae', base:'#dcb991', side:'#bf9a78', win:'#a5826a', top:'#f2d6ae'};

  if(portrait){
    const kx = Math.round(W*.6), kTop = Math.max(6, Math.round(hy*.12)), kh = hy - kTop;
    L.tower(R, W*.3, hy, Math.max(4, kh*.06), kh*.3, FARG, 'slant');
    L.tower(R, W*.37, hy, Math.max(5, kh*.075), kh*.5, GLASS, 'pif');
    L.tower(R, W*.44, hy, Math.max(4, kh*.06), kh*.26, GLASS, 'flat');
    L.tower(R, W*.94, hy, Math.max(4, kh*.06), kh*.24, FARG, 'step');
    L.kingdom(R, kx, hy, kh, KC);
    L.faisaliah(R, Math.round(W*.83), hy, Math.round(kh*.86), FS);
  } else {
    const kTop = Math.max(8, Math.round(H*.05)), kh = hy - kTop;
    const kx = Math.round(W - Math.max(26, Math.min(W*.1, 48))), hb = Math.round(kh*.145);
    L.tower(R, W*.58, hy, 11*u, H*.16, FARG, 'flat');
    L.tower(R, W*.63, hy, 12*u, H*.24, FARG, 'slant');
    L.tower(R, kx - hb - 44*u, hy, 13*u, H*.3, GLASS, 'step');
    L.tower(R, kx - hb - 26*u, hy, 15*u, H*.42, GLASS, 'pif');
    L.tower(R, kx - hb - 10*u, hy, 10*u, H*.22, GLASS, 'flat');
    L.kingdom(R, kx, hy, kh, KC);
    const fh = Math.round(Math.min(kh*.86, (hy - 36)/.76));
    L.faisaliah(R, fxL, hy, fh, FS);
  }

  /* ---------- dunes: gentle windward slopes lit from the left, steeper slip faces in shade.
     Each layer is an asymmetric wave; the lit / shade bands follow the local slope, so
     their edges taper to nothing at crests and troughs (no vertical seams). */
  const dune = (base, amp, lam, ph, P) => {
    const top = new Int16Array(W), f = x => { const t = x/(W*lam)*Math.PI*2 + ph;
      return base - amp*((Math.sin(t) - .3*Math.sin(2*t) + .22*Math.sin(t*.43 + ph*2)) + 1.3)*.5; };
    for(let x=0;x<W;x++){
      const yv = f(x), t = Math.round(yv), m = (f(x + .5) - f(x - .5));   // m > 0: surface falls to the right
      top[x] = t;
      const shade = m > .04 ? Math.min(P.dmax, Math.round(m*P.k)) : 0;
      const lit = m < -.04 ? Math.min(3, 1 + Math.round(-m*P.k*.25)) : 0;
      for(let y=t; y<H; y++){ const j = y - t; let col = P.mid;
        if(j < shade) col = P.shade; else if(j < lit) col = P.lit;
        if(j === 0 && shade === 0) col = P.crest;
        set(x, y, col); }
    }
    return i => top[Math.max(0, Math.min(W-1, i))];
  };
  const DF = {crest:c.d5, lit:c.d5, mid:c.d4, shade:c.d3, dmax:4, k:14};
  const DM = {crest:c.d5, lit:c.d4, mid:c.d3, shade:c.d2, dmax:9, k:22};
  const DN = {crest:c.d4, lit:c.d3, mid:c.d2, shade:c.d1, dmax:14, k:26};

  /* ---------- date palms: trunk with leaf-base rings, arching fronds with hanging leaflets */
  const palm = (x0, yb, h, L, flip=false) => {
    const lean = Math.round(h*.12)*(flip ? -1 : 1);
    const tw = h > 30 ? 3 : 2;
    for(let j=0;j<=h;j++){ const y = yb - j, x = x0 + Math.round(lean*Math.pow(j/h, 1.6));
      const w = j < h*.2 ? tw + (h > 30 ? 1 : 0) : tw;
      for(let i=0;i<w;i++) set(x+i, y, i === 0 ? (j%3 === 0 ? c.pt0 : c.pt1) : (i === w-1 ? c.pt0 : ((j%3 === 1) ? c.pt0 : c.pt1))); }
    const cx = x0 + lean + Math.floor(tw/2), cy = yb - h;
    const fronds = [-172,-150,-128,-100,-72,-44,-18,8, 188-360+360];
    const angs = [192, 165, 140, 112, 70, 40, 15, -8];
    for(const a0 of angs){ const a = (flip ? 180 - a0 : a0)*Math.PI/180;
      const dx = Math.cos(a), dy = -Math.sin(a), len = L*(Math.abs(Math.sin(a)) > .9 ? .6 : 1);
      let px = -99, py = -99;
      for(let t=0; t<=1.0001; t+=.5/len){
        const x = Math.round(cx + dx*t*len), y = Math.round(cy + dy*t*len + t*t*len*.55);
        if(x === px && y === py) continue; px = x; py = y;
        set(x, y, t < .5 ? c.p2 : c.p1);
        if(t > .15 && t < .95 && Math.abs(dx) > .3){ set(x, y+1, c.p1); if(t > .3 && t < .8 && L > 10 && ((x + y) & 1)) set(x, y+2, c.p0); }
        if(t < .6 && dy < 0) set(x, y-1, c.p3);
      }
    }
    set(cx, cy, c.p0); set(cx-1, cy, c.p0); set(cx+1, cy, c.p0);
    set(cx-1, cy+1, c.pd); set(cx, cy+2, c.pd); set(cx+1, cy+1, c.pd); if(L > 10){ set(cx-2, cy+2, c.pd); set(cx+1, cy+2, c.pd); }
  };

  for(let y=hy+1; y<hy+12; y++) hline(0, W-1, y, c.d5);       // far plain under the city
  if(portrait) L.lowrise(R, Math.round(W*.22), W, hy + 2, 1, Math.max(3, Math.round(4*u)), CITY, r);
  else { L.lowrise(R, Math.round(W*.42), W, hy + 2, 1, Math.max(3, Math.round(5*u)), CITY, r);
         L.lowrise(R, 0, Math.round(fxL + 30*u), hy + 2, 1, Math.max(2, Math.round(3*u)), CITY, r); }
  if(portrait){
    dune(hy + 3 + Math.round(4*u), 4*u, .5, 1.2, DF);
    dune(Math.round(H*.42), 26*u, .8, 2.4, DM);
    dune(Math.round(H*.64), 30*u, .95, .3, DM);
    const fg = dune(Math.round(H*.9), 30*u, 1.1, 4.1, DN);
    palm(Math.round(W*.1), fg(Math.round(W*.1)) + 2, Math.round(H*.1), Math.round(W*.09));
    palm(Math.round(W*.22), fg(Math.round(W*.22)) + 2, Math.round(H*.065), Math.round(W*.06), true);
    const cx = Math.round(W*.5); sprite(CAMEL_L, CCOL, cx, fg(cx+20) + 1);
    palm(sx + sr + 3, hy + 2, Math.round(hy*.14), 5);
  } else {
    dune(hy + 3 + Math.round(4*u), 5*u, .42, 1.2, DF);
    palm(sx + sr + 4, hy + 3, Math.round(12*u), Math.round(6*u)); palm(sx + sr + 14, hy + 4, Math.round(8*u), Math.round(5*u), true);
    dune(Math.round(hy + (H-hy)*.42), 22*u, .62, 2.2, DM);
    const fg = dune(Math.round(hy + (H-hy)*.8), 24*u, .85, 4.4, DN);
    const px = Math.max(8, Math.round(W*.035));
    palm(px, fg(px) + 3, Math.round(56*u), Math.round(24*u));
    palm(px + Math.round(26*u), fg(px + Math.round(26*u)) + 3, Math.round(30*u), Math.round(15*u), true);
    const cx = Math.round(W*.2), CM = u > .82 ? CAMEL_L : CAMEL;
    sprite(CM, CCOL, cx, fg(cx + (CM[0].length>>1)) + 1);
    const px2 = Math.round(W*.94);
    palm(px2, fg(px2) + 3, Math.round(40*u), Math.round(20*u), true);
  }
};
})();
