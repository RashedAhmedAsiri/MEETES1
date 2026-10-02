/* scenes/riyadh.js — modern Riyadh on a clear afternoon, painted from a real viewpoint:
   south-west of the Olaya district (about 7 km SSW of Kingdom Centre), looking north-north-east
   across the city, with the horizontal spacing squeezed like a long-lens skyline photograph.
   The sun is behind the viewer on the left (west-south-west): west faces are bright, the faces
   toward us are in soft light, east faces are in shade.
   - left, far away in the dusty haze: the KAFD cluster, the PIF Tower tallest with its
     crystalline facade and slanted shard crown
   - centre: Kingdom Centre's broad south face, the parabolic opening in its top third, the sky
     bridge just under the two pointed tips
   - right, a little closer: Al Faisaliah, a slender square pyramid seen almost face-on (lit
     west face, narrow shaded south face), silver louvres, the four K-braced deck levels, the
     golden globe held near the top, the lantern and the steel spire
   - in front: the flat sand-and-white city, a Najdi-style minaret, the elevated metro over the
     median of a wide road, cars, date palms and a few people on the pavement.
   No outlines on architecture; distance is shown with lighter, bluer, lower-contrast tones.
   Everything is drawn per pixel on the scene raster (one pixel grid). */
(() => {
'use strict';
const RGB = {};
const C = h => RGB[h] || (RGB[h] = hexRGB(h));
const BAY = [[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
const dz = (x, y, f) => f*16 > BAY[y&3][x&3] + .5;          // ordered-dither test

/* ---------- palette */
const SKY_KEYS = ['#3f7ccf', '#5891d8', '#78a9e0', '#9cc1e6', '#bfd5e8', '#d9e1e2', '#e7e2d3'];
const hex2 = v => Math.round(v).toString(16).padStart(2, '0');
const SKY = []; SKY_KEYS.forEach((h, i) => { SKY.push(h); const n = SKY_KEYS[i+1]; if(!n) return;
  const a = hexRGB(h), b = hexRGB(n); SKY.push('#' + a.map((v, k) => hex2((v + b[k])/2)).join('')); });
const HAZE = ['#d8d9d3', '#cfd3d2', '#c6ccd0'];
const DUST = '#e1ded4';
// Kingdom Centre: silver-blue reflective glass, west end (lit) to east end (shade)
const KG = ['#f4f7f9', '#d9e2eb', '#bccbdb', '#a3b6cb', '#8aa1bb', '#738ba8', '#5f7795'];
// towers by distance: Lt/L2 lit west face (two floor tones), G/D glass face (two floor tones),
// S/S2 stone face, Wn stone windows, T roof edge, P plant room
const TIER = {
  a:{Lt:'#d6dee5', L2:'#d0d8e0', G:'#b9c6d3', D:'#b2c0ce', Ls:'#dedfdb', S:'#d4d3cd', S2:'#cecdc7', Wn:'#c4c7c8', T:'#e3e7e9', P:'#c9cfd4'},
  b:{Lt:'#dbe3ea', L2:'#d2dbe3', G:'#a7b9cb', D:'#9eb1c4', Ls:'#e6e3dc', S:'#dcd5c6', S2:'#d4ccbc', Wn:'#c0bcb3', T:'#eaedee', P:'#c4ccd3'},
  c:{Lt:'#e4eaef', L2:'#d9e1e8', G:'#96acc2', D:'#8ba2b9', Ls:'#efeae0', S:'#e3d8c2', S2:'#d9cdb4', Wn:'#bfb6a4', T:'#f2f2ef', P:'#c8ced3'},
};
// Al Faisaliah: silver-anodised aluminium frame, louvred faces, recessed K-brace decks, gold globe
const FA = {fr:'#fbf9f4', fr2:'#e4e1d9', fr3:'#b4b1a9',
  w1:'#dcd8cf', w2:'#cdc8bd', s1:'#aeada8', s2:'#a2a19c',
  dkW:'#8d877b', dkS:'#73716c', brW:'#b3ad9f', brS:'#8a8984', slab:'#f2efe8'};
const GOLD = ['#8a5a1c', '#b97f27', '#dea640', '#f3cd68', '#fff0bd'];
// low-rise city, far → near: wall colours, lit roof edge, shade side, windows
const CITY = [
  {walls:['#dad7cd', '#d5cfc1', '#dfdcd3'], top:'#e9e7e0', sh:'#cbc8c0', win:null},
  {walls:['#ddd3bf', '#d8cbb0', '#e3ded3', '#d6cfc3'], top:'#efebe2', sh:'#c9bfac', win:'#c4baa8'},
  {walls:['#e2d3b3', '#d9c6a2', '#ebe5d8', '#d3cbbd', '#d8bf98', '#e6dabf'], top:'#f6f1e6', sh:'#c4b394', win:'#aca192'},
];
const GROUND = ['#d6cbb3', '#cfc3a9'];
const TREE = ['#4f6f3f', '#668a4c', '#86a764'];
const PALM = {L:'#8fb267', M:'#5f8a45', D:'#3f6634', T:'#927b5a', t:'#76624a', o:'#d38d3c'};
const METRO = {top:'#f1ece0', face:'#dbd3c1', under:'#a69e8c', pl:'#e9e2d3', pm:'#cdc4b0', ps:'#aaa190',
  roof:'#cdd2d6', body:'#f7f7f3', bodyS:'#d9dcdc', win:'#2f3742', winL:'#62758a', band:'#ec7d2a', nose:'#262b33'};
const ROAD = {far:'#7a7b7f', near:'#6b6d72', lane:'#ece9df', laneF:'#c9c8c2', curb:'#e6e0d2', curbS:'#a9a293',
  cb:'#4a4b4e', cy:'#d8c27a', hedge:'#5d7f45', hedgeL:'#7fa25a', walk:'#e0d4bd', walk2:'#d8cbb1', joint:'#c9bb9f'};
const CARS = [  // [light/roof, body, shade]
  ['#ffffff', '#eeeeea', '#bfc2c3'], ['#ffffff', '#eeeeea', '#bfc2c3'], ['#ffffff', '#eeeeea', '#bfc2c3'],
  ['#e3e7ea', '#b9c0c6', '#8c949c'], ['#e3e7ea', '#b9c0c6', '#8c949c'],
  ['#efe5cf', '#d3c39f', '#a8976f'], ['#6b7079', '#3b3f47', '#25282d'],
  ['#f08a78', '#c9473b', '#8c2c25'], ['#8fb4dc', '#4f7fb3', '#34597f'],
];
const GLASS = ['#3e4b58', '#8ba3b9'];
// tiny pedestrians (no faces): r/w red-and-white shemagh, s skin, W/V white thobe, k/K black abaya,
// h/b/n a child
const FOLK = {r:'#c8463b', w:'#f4f2ec', s:'#c89a6c', W:'#f7f6f1', V:'#d3d1c8', k:'#2b2b31', K:'#4a4a52',
  h:'#3b2a22', b:'#4f8fc8', B:'#3c6f9e', n:'#5a5f6b', S:'#8a8178'};
const MAN   = [".w.", "rsr", "WWV", "WWV", "WWV"];
const WOMAN = [".k.", "kkk", "kkK", "kkK", "kkK"];
const CHILD = [".h.", "bbB", ".n."];

/* date palms: L light frond, M frond, D dark frond, T trunk lit, t trunk shade, o dates */
const PALM_L = [
"........L........",
".....L..LM..L....",
"...LLMLLMDLMMLL..",
".LLMMDMMDDMDDMMLL",
"LMMDDMDDDDDDMDDMM",
"MDD..MDDDDDDM..DD",
"D...MD.DooD.DM..D",
"...MD..oTTo..DM..",
"..MD....Tt....D..",
"..D.....tT.....D.",
"........Tt.......",
"........tT.......",
"........Tt.......",
"........tT.......",
"........Tt.......",
"........tT.......",
"........Tt.......",
"........tT.......",
"........Tt.......",
"........tT.......",
".......TTtt......"];
const PALM_M = [
"....L.L....",
"..LLMLMLL..",
".LMMDMDMML.",
"LMD.DDD.DML",
"M..DDoDD..M",
"..D..T..D..",
".D...Tt..D.",
".....Tt....",
".....tT....",
".....Tt....",
".....Tt....",
".....tT....",
"....TTtt..."];
const PALM_S = [
"..L.L..",
".LMLML.",
"LMDDDML",
"M.DTD.M",
"...T...",
"...t...",
"...T...",
"...t..."];

const mixRGB = (a, b, t) => [0, 1, 2].map(i => Math.round(a[i] + (b[i] - a[i])*t));

SCENES.riyadh = k => {
  const {R, W, H} = k, r = k.r;
  const S = H/134;
  const sc = n => Math.max(1, Math.round(n*S));
  const set = (x, y, h) => R.set(x, y, C(h));
  const rect = (x, y, w, h, c) => { for(let j=0;j<h;j++) for(let i=0;i<w;i++) set(x+i, y+j, c); };
  const hl = (x0, x1, y, c) => { for(let x=x0;x<=x1;x++) set(x, y, c); };
  // one intermediate tone on long sloping edges (hand anti-aliasing): half-way to what is behind
  const soft = (x, y, h, t = .5) => { if(x < 0 || y < 0 || x >= W || y >= H) return;
    R.set(x, y, mixRGB(R.get(x, y), C(h), t)); };
  const sprite = (G, cols, x, yb, flip) => { const h = G.length, w = G[0].length;
    for(let j=0;j<h;j++) for(let i=0;i<w;i++){ const ch = G[j][flip ? w-1-i : i]; if(ch !== '.' && ch !== ' ') set(x+i, yb-h+1+j, cols[ch]); } };

  /* ---------- layout */
  const hz   = Math.round(H*.69);                 // horizon: foot of the far city
  const kx   = Math.round(W*.52);                 // Kingdom Centre axis (between pixels kx-1 and kx)
  const kTop = Math.max(5, Math.round(H*.055));
  const kBase = hz + sc(4);
  const kh   = kBase - kTop;
  const fx   = Math.round(W*.80);                 // Al Faisaliah axis (pixel column)
  const yD   = Math.round(H*.785);                // metro deck top
  const yW   = yD + 3;                            // far pavement
  const yR0  = yW + 2;                            // far curb
  const yM   = yR0 + Math.max(6, sc(8));          // median
  const yR1  = H - Math.max(5, sc(6));            // near curb

  /* ---------- sky: deep blue overhead fading to the pale dusty horizon */
  R.bands(0, hz + 2, SKY);

  /* ---------- two thin high wisps of cirrus: a whiter core that thins out at the ends */
  const tint = (x, y, t) => { if(x < 0 || y < 0 || x >= W || y >= H) return;
    R.set(x, y, mixRGB(R.get(x, y), [255, 255, 255], t)); };
  const wisp = (cx, cy, len, tilt) => {
    for(let i=-len; i<=len; i++){ const x = cx + i, y = cy + Math.round(i*tilt), e = 1 - Math.abs(i)/len;
      if(e > .22 || (e > .08 && (i & 1))) tint(x, y, e > .5 ? .32 : .18);
      if(e > .55) tint(x + Math.round(len*.15), y + 1, .14); } };
  wisp(Math.round(W*.15), Math.round(H*.12), Math.round(W*.11), -.05);
  wisp(Math.round(W*.25), Math.round(H*.18), Math.round(W*.06), -.05);
  wisp(Math.round(W*.94), Math.round(H*.10), Math.round(W*.05), -.04);

  /* ---------- the city's far edge on the horizon */
  { let x = 0; while(x < W){ const w = 2 + Math.floor(r()*6), h = Math.floor(r()*3) + (r() < .12 ? 2 + Math.floor(r()*3) : 0);
      rect(x, hz - h, w, h + 3, HAZE[h > 2 ? 2 : (x>>2)%2]); x += w; } }

  /* ---------- generic office tower: lit west face on the left, the face toward us on the right.
     kind: 'glass' (curtain wall, floor lines every second row) or 'stone' (beige stone with
     vertical strip windows). roof: 'plant' (set-back plant room), 'slope' (KAFD-style crown
     cut on a slant, high on the right), or none. */
  const tower = (x0, w, top, P, kind, roof) => {
    const bot = kBase + 2, sw = Math.max(1, Math.round(w*.28));
    const cut = roof === 'slope' ? Math.max(2, Math.round(w*.45)) : 0;
    for(let x=x0; x<x0+w; x++){ const i = x - x0, side = i < sw;
      const t0 = top + (cut ? Math.round(cut*(1 - i/(w - 1))) : 0);
      for(let y=t0; y<=bot; y++){ const j = y - top; let c;
        if(y === t0) c = P.T;
        else if(kind === 'glass') c = side ? (j%2 ? P.Lt : P.L2) : (j%2 ? P.G : P.D);
        else c = side ? (j%2 ? P.Ls : P.S2) : (j%2 === 1 && (i - sw)%4 !== 3 && i < w - 1) ? P.Wn : (i === w - 1 ? P.S2 : P.S);   // stone piers, ribbon windows
        set(x, y, c); } }
    if(roof === 'plant'){ const pw = Math.max(2, Math.round(w*.5)), px = x0 + Math.round((w - pw)/2) + 1;
      rect(px, top - 2, pw, 2, P.P); hl(px, px + pw - 1, top - 2, P.T); }
  };

  /* ---------- KAFD (far left, about 12 km away in the haze). PIF Tower: slim prism with a
     crystalline lattice of angled panels, its crown cut by slanted facets up to a point near
     the east corner */
  const A = TIER.a;
  const pif = (x0, w, top) => {
    const bot = kBase + 2, cH = Math.max(5, Math.round((bot - top)*.13));
    const pk = Math.round((w - 1)*.74);                        // the crown's high point
    for(let i=0;i<w;i++){
      const drop = i <= pk ? Math.round(cH*Math.pow(1 - i/pk, 1.25)) : Math.round(cH*.8*(i - pk)/(w - 1 - pk));
      const t = top + drop;
      for(let y=t; y<=bot; y++){ const j = y - top; let c;
        if(j <= cH + 1){                                        // crown facets: lit west, shaded east
          if(y === t) c = i <= pk ? '#eef1f3' : A.G;
          else c = i > pk ? A.D : (i < w*.3 ? A.Lt : (i + j)%3 === 0 ? A.L2 : A.Lt);
        }
        else if(i === 0) c = A.Lt;
        else { const a = (i + (j>>1))%5, b = (i - (j>>1) + 50)%5;   // angled-panel lattice
          c = (a === 0 || b === 0) ? A.D : (i >= w - 2 ? A.D : A.G);
          if((a === 0 || b === 0) && i < w*.3) c = A.L2; }
        set(x0 + i, y, c); } }
  };
  const kafd = [ // [x frac, width, height frac of kh, kind, roof]
    [.035, 7, .22, 'stone', 'plant'], [.075, 6, .34, 'glass', 'slope'], [.105, 7, .47, 'glass', 'slope'],
    [.140, 6, .29, 'stone', 'plant'], [.225, 7, .40, 'glass', null], [.255, 6, .31, 'glass', 'slope'],
    [.288, 7, .21, 'stone', 'plant']];
  kafd.forEach(([f, w, h, kind, roof]) => tower(Math.round(W*f), sc(w), kBase - Math.round(kh*h), A, kind, roof));
  pif(Math.round(W*.165), sc(10), kBase - Math.round(kh*.73));
  // a lower layer in front of the cluster
  [[.12, 8, .15], [.20, 9, .19], [.05, 9, .11]].forEach(([f, w, h]) => tower(Math.round(W*f), sc(w), kBase - Math.round(kh*h), A, 'stone', 'plant'));

  /* ---------- King Fahd Road towers behind and left of Kingdom Centre (8–9 km) */
  const B = TIER.b;
  tower(kx - sc(43), sc(8), kBase - Math.round(kh*.40), B, 'glass', 'plant');
  tower(kx - sc(31), sc(9), kBase - Math.round(kh*.27), B, 'stone', 'plant');
  tower(kx + sc(17), sc(8), kBase - Math.round(kh*.33), B, 'glass', 'plant');

  // dusty air near the ground: everything far fades into the horizon haze toward its foot
  // (stepped per row, no checker pattern)
  const dust = (depth, amt, col) => { const y0 = hz + 2 - depth, c = C(col);
    for(let y=Math.max(0, y0); y<=hz + 2; y++){ const t = Math.round((y - y0)/depth*6)/6*amt;
      for(let x=0;x<W;x++) R.set(x, y, mixRGB(R.get(x, y), c, t)); } };
  dust(sc(18), .6, DUST);

  /* ---------- Kingdom Centre: broad south face with straight sides (as wide at the top); in the top
     third an inverted parabolic opening splits it into two horns; the sky bridge spans the
     opening at the very top, level with them, so the top is one straight line */
  {
    const hb = kh*.132;                                    // half-width at the foot
    const u0 = .645, uB = 1;
    const outer = () => hb;                                // straight sides: as wide at the top as at the foot
    const vt = outer(1) - .45;                             // opening half-width at the very top
    const inner = u => u <= u0 ? -1 : vt*Math.pow((u - u0)/(1 - u0), .45);
    const yB = Math.round(kBase - kh*uB), bh = H >= 118 ? 2 : 1;
    // podium (mall and hall wings) at the foot of the tower
    const pw = Math.round(hb*2.3), pt = kBase - sc(5);
    for(let x=kx-pw; x<kx+pw; x++) for(let y=pt; y<=kBase+2; y++){
      const j = y - pt; set(x, y, j === 0 ? '#eef0ef' : j < 3 ? '#a9bacb' : '#dcd6ca'); }
    for(let y=kTop; y<=kBase; y++){
      const u = (kBase - y)/kh, O = outer(u), I = inner(u), n = Math.ceil(O);
      const bridge = y >= yB && y < yB + bh;
      // glass coverage of each half-row, measured from the axis (between columns kx-1 and kx)
      const cov = d => Math.max(0, Math.min(d + 1, O) - Math.max(d, I < 0 || bridge ? 0 : I));
      let best = 0, bestD = n - 1, last = 0;
      for(let d=0; d<n; d++){ const c = cov(d); if(c > best){ best = c; bestD = d; } if(c > .3) last = d; }
      const edge = d => d === last || (d === last - 1 && cov(last) < .7);   // outermost solid column
      for(let d=0; d<n; d++){
        let c = cov(d);
        if(best < .7 && d === bestD) c = 1;                // a horn never vanishes near its tip
        if(c <= .3) continue;
        for(const side of [-1, 1]){
          const x = side < 0 ? kx - 1 - d : kx + d;
          let v;
          if(bridge && I >= 0 && d + .5 < I) v = (y === yB) ? 1 : 4;   // the sky bridge: lit top, glazed side
          else {
            const t = (x + .5 - (kx - O))/(2*O);
            v = t < .14 ? 1 : t < .38 ? 2 : t < .62 ? 3 : t < .84 ? 4 : 5;    // curved glass, west → east
            if(edge(d)) v = side < 0 ? 0 : (I >= 0 ? 5 : 6);  // west end catches the sun, east end in shade
            if(I >= 0 && side > 0 && d < I + 1 && !bridge) v = 1;   // the right horn's inner face, lit
          }
          if(c >= .7) set(x, y, KG[v]); else soft(x, y, KG[v], .5);
        }
      }
    }
  }

  /* ---------- nearer towers around Al Faisaliah (6–7 km) */
  const Cc = TIER.c;
  tower(kx + sc(30), sc(8), kBase - Math.round(kh*.25), Cc, 'stone', 'plant');
  tower(kx + sc(40), sc(9), kBase - Math.round(kh*.17), Cc, 'glass', null);
  tower(fx + sc(17), sc(9), kBase - Math.round(kh*.22), Cc, 'stone', 'plant');
  tower(fx + sc(29), sc(8), kBase - Math.round(kh*.15), Cc, 'glass', 'plant');
  tower(kx - sc(58), sc(9), kBase - Math.round(kh*.18), Cc, 'stone', 'plant');

  /* ---------- Al Faisaliah: slender square pyramid seen almost face-on — the lit west face on the
     left, the narrow shaded south face on the right of the near corner column; silver louvres
     every floor, four recessed K-brace deck levels, the golden globe held where the corner
     columns meet, the lantern above it and the stainless-steel spire */
  {
    const fBase = hz + sc(6), fTip = kTop + Math.round(kh*.10), fh = fBase - fTip;
    const fb = fh*.11, uA = .79;
    const gR = Math.max(3, Math.round(fh*.047)), gy = Math.round(fBase - fh*.745);
    const dh = H >= 112 ? 2 : 1;
    const decks = [.15, .295, .435, .565].map(u => Math.round(fBase - fh*u));
    const deckAt = y => { for(const d of decks) if(y >= d && y < d + dh) return y - d; return -1; };
    for(let y=gy; y<=fBase + 2; y++){
      const u = (fBase - y)/fh, hw = Math.max(.6, fb*(1 - u/uA)), n = Math.max(1, Math.floor(hw));
      const xl = fx - n, xr = fx + n, xc = xl + Math.max(1, Math.round((xr - xl)*.7));
      const dk = deckAt(y);
      for(let x=xl; x<=xr; x++){
        const west = x < xc; let c;
        if(x === xc) c = FA.fr;                            // the near (south-west) corner column
        else if(x === xl) c = FA.fr2;
        else if(x === xr) c = FA.fr3;
        else if(dk >= 0) c = dk === 0 ? (west ? FA.dkW : FA.dkS) : (west ? FA.brW : FA.brS);   // recessed K-brace deck
        else if(west) c = y%2 ? FA.w1 : FA.w2;
        else c = y%2 ? FA.s1 : FA.s2;
        set(x, y, c); }
      // soften the long sloping edges where the true edge falls between pixels
      const fr = hw - n;
      if(fr > .3 && n > 1){ soft(xl - 1, y, FA.fr2, .5); soft(xr + 1, y, FA.fr3, .5); }
    }
    // the globe: golden glass lit from the upper left, a crisp round silhouette
    for(let y=-gR; y<=gR; y++) for(let x=-gR; x<=gR; x++){
      const d = Math.sqrt(x*x + y*y); if(d > gR + .35) continue;
      const l = (-x*.5 - y*.85)/gR + (1 - d/gR)*.35;      // light from the upper left, rounded body
      let c = l > .55 ? GOLD[3] : l > -.05 ? GOLD[2] : l > -.55 ? GOLD[1] : GOLD[0];
      if(d > gR - .6 && l < -.25) c = GOLD[0];              // shaded rim, lower right
      set(fx + x, gy + y, c); }
    { const hx = fx - Math.round(gR*.4), hy = gy - Math.round(gR*.45);
      set(hx, hy, GOLD[4]); if(gR >= 4){ set(hx + 1, hy, GOLD[4]); set(hx, hy + 1, GOLD[3]); } }
    // lantern (a short glazed taper) and the stainless-steel spire
    const lt = gy - gR - 1, lh = Math.max(3, Math.round(fh*.055));
    for(let j=0;j<lh;j++){ const y = lt - j;
      if(j < Math.ceil(lh/2)){ set(fx - 1, y, FA.fr); set(fx, y, FA.fr2); set(fx + 1, y, FA.fr3); }
      else { set(fx, y, FA.fr); set(fx + 1, y, FA.fr3); } }
    for(let y=fTip; y<=lt - lh; y++) set(fx, y, y === fTip ? FA.fr3 : FA.fr2);
  }

  dust(sc(6), .35, DUST);

  /* ---------- low-rise city: rows of flat-roofed sand and white buildings, far to near */
  for(let y=hz+1; y<yW; y++) hl(0, W-1, y, GROUND[y%2]);
  const building = (x0, w, h, yb, T, wallI) => {
    const wall = T.walls[wallI % T.walls.length], top = yb - h + 1;
    for(let x=x0; x<x0+w; x++) for(let y=top; y<=yb; y++){
      const i = x - x0, j = y - top; let c = wall;
      if(j === 0) c = T.top;
      else if(i === w - 1 && w >= 4) c = T.sh;
      else if(T.win && h >= 4 && j >= 2 && j < h - 1 && (j - 2)%3 === 0 && i%3 === 1 && i < w - 2) c = T.win;
      set(x, y, c); }
    if(w >= 5 && r() < .35){ const tx = x0 + 1 + Math.floor(r()*(w - 3)); set(tx, top - 1, '#f4f4f0'); }   // water tank
    if(w >= 7 && r() < .3){ const sx = x0 + 1 + Math.floor(r()*(w - 4)); rect(sx, top - 2, 3, 2, wall); hl(sx, sx + 2, top - 2, T.top); set(sx + 2, top - 1, T.sh); }
  };
  const row = (yb, hMin, hMax, wMin, wMax, T, gapP) => {
    let x = -Math.floor(r()*wMax);
    while(x < W){ const w = wMin + Math.floor(r()*(wMax - wMin + 1)), h = hMin + Math.floor(r()*(hMax - hMin + 1));
      building(x, w, h, yb, T, Math.floor(r()*17));
      x += w + (r() < gapP ? 1 + Math.floor(r()*3) : 0); }
  };
  const tree = (x, yb, n) => { // round shade tree (ficus / neem), n = 1 small, 2 medium
    const w = n > 1 ? 5 : 3, h = n > 1 ? 3 : 2;
    for(let j=0;j<h;j++) for(let i=0;i<w;i++){ if((j === 0 || j === h-1) && (i === 0 || i === w-1)) continue;
      set(x + i, yb - h - (n > 1 ? 1 : 0) + j, (i + j < 2) ? TREE[2] : (i > w - 3 || j === h-1) ? TREE[0] : TREE[1]); }
    if(n > 1) set(x + 2, yb - 1, PALM.t); };
  const rA = hz + sc(2), rB = hz + sc(5), rC = hz + sc(9), rD = yD + 1;
  row(rA, 1, 2, 3, 8, CITY[0], .15);
  row(rB, 2, 3, 3, 9, CITY[0], .25);
  for(let i=0;i<6;i++) tree(Math.floor(r()*W), rB, 1);
  row(rC, 2, sc(5), 4, 10, CITY[1], .3);
  // a few mid-rise apartment and office blocks among the houses
  [[.07, 10, 11], [.385, 9, 13], [.665, 11, 10], [.93, 8, 12]].forEach(([f, w, h]) => building(Math.round(W*f), sc(w), sc(h), rC + sc(2), CITY[1], Math.round(f*20)));
  for(let i=0;i<8;i++) tree(Math.floor(r()*(W - 5)), rC + 1, 2);
  row(rD, 3, sc(7), 5, 12, CITY[2], .35);
  // a neighbourhood mosque with a Najdi-style square minaret: tapering shaft lit on the west,
  // a balcony, a slimmer upper stage and a gilded finial
  { const mx = Math.round(W*.335), yb = rD, mh = sc(18);
    rect(mx, yb - 4, 12, 5, '#ece6d9'); hl(mx, mx + 11, yb - 4, '#f8f5ee'); for(let y=yb - 3; y<=yb; y++) set(mx + 11, y, '#cfc6b6');
    for(let i=2;i<10;i+=2) set(mx + i, yb - 2, '#b5ab9c');
    const sx = mx - 2, by = yb - Math.round(mh*.7);
    for(let y=by + 2; y<=yb; y++){ const wide = y > by + 2 + (yb - by)*.45;
      if(wide) set(sx - 1, y, '#fbf9f3');
      set(sx, y, wide ? '#f3eee3' : '#fbf9f3'); set(sx + 1, y, '#e6dfd0'); set(sx + 2, y, '#c9c0b0'); }
    hl(sx - 1, sx + 3, by, '#fbf9f3'); hl(sx - 1, sx + 3, by + 1, '#b3aa9a');
    for(let y=yb - mh + 2; y<by; y++){ set(sx, y, '#fbf9f3'); set(sx + 1, y, '#d2c9b9'); }
    set(sx, yb - mh + 1, '#e9e2d4'); set(sx + 1, yb - mh + 1, '#c9c0b0');
    set(sx, yb - mh, '#c9a24a'); }
  for(let i=0;i<7;i++) tree(Math.floor(r()*(W - 5)), rD + 1, 2);
  [.27, .61, .74, .97].forEach(f => sprite(PALM_S, PALM, Math.round(W*f) - 3, rD + 1));

  /* ---------- far pavement */
  for(let y=yW; y<yR0; y++) hl(0, W-1, y, y === yW ? ROAD.walk2 : ROAD.walk);

  /* ---------- road: two lanes each way; the far lanes slightly lighter */
  hl(0, W-1, yR0, ROAD.curb);
  for(let y=yR0+1; y<yM; y++) hl(0, W-1, y, ROAD.far);
  const lf = Math.round((yR0 + yM)/2);
  for(let x=0;x<W;x+=7) hl(x, x + 2, lf, ROAD.laneF);
  // cars seen from the side and a little above, drawn facing right: R roof, G/g glass, B body,
  // S lower body, r tail light, h head light, w wheel
  const CAR_BIG = [["...RRR...", ".BGGgGGB.", "rBBBBBBBh", "SwwSSSwwS"],
                   [".RRRRRR..", ".GGgGGGB.", "rBBBBBBBh", "SwwSSSwwS"]];
  const CAR_SMALL = [["..RRR..", "rGgGBBh", ".w...w."], [".RRRR..", "rGGgBBh", ".w...w."]];
  const car = (x, yb, dir, n, big) => {
    const P = CARS[n % CARS.length], G = (big ? CAR_BIG : CAR_SMALL)[n%3 === 1 ? 1 : 0], L = G[0].length;
    for(let j=0;j<G.length;j++) for(let i=0;i<L;i++){
      const ch = G[j][dir > 0 ? i : L - 1 - i]; if(ch === '.') continue;
      const c = ch === 'R' ? P[0] : ch === 'B' ? P[1] : ch === 'S' ? P[2] : ch === 'G' ? GLASS[0] : ch === 'g' ? GLASS[1]
              : ch === 'h' ? '#fff3c4' : ch === 'r' ? '#c8463b' : '#1f2126';
      set(x + i, yb - G.length + 1 + j, c); }
  };
  { const gap = (a, b) => Math.round(Math.max(a*W, a*230) + r()*W*b);
    let n = 0; if(yM - yR0 - 1 >= 7) for(let x = Math.round(W*.05); x < W - 6; x += gap(.13, .1)) car(x, lf - 1, -1, n++, false);
    for(let x = Math.round(W*.11); x < W - 6; x += gap(.15, .12)) car(x, yM - 1, -1, (n++)*2, false); }

  /* ---------- metro: piers on the median, deck, train (white, orange line stripe) */
  const pierStep = Math.max(30, Math.round(W*.2)), pier0 = Math.round(pierStep*.45);
  for(let px = pier0; px < W + 3; px += pierStep){
    for(let y=yD+3; y<yM; y++){ set(px - 1, y, METRO.pl); set(px, y, METRO.pm); set(px + 1, y, METRO.ps); }
    hl(px - 3, px + 3, yD + 3, METRO.under); hl(px - 2, px + 2, yD + 4, METRO.pm);
  }
  hl(0, W-1, yD, METRO.top); hl(0, W-1, yD + 1, METRO.face); hl(0, W-1, yD + 2, METRO.under);
  { const tH = Math.max(4, sc(5)), carL = sc(25), x0 = Math.round(W*.03);
    for(let n=0;n<3;n++){ const cx = x0 + n*(carL + 1);
      for(let i=0;i<carL;i++) for(let j=0;j<tH;j++){
        if(n === 0 && j === 0 && i < 2) continue;                // rounded nose
        let c = METRO.body;
        if(j === 0) c = METRO.roof;
        else if(j === 1) c = (i%5 === 4) ? METRO.body : ((i%5 === 0) ? METRO.winL : METRO.win);
        else if(j === tH - 1) c = METRO.band;
        else if(j === tH - 2 && tH > 4) c = METRO.bodyS;
        if(n === 0 && i < 2 && j > 0 && j < tH - 1) c = METRO.nose;
        set(cx + i, yD - tH + j, c); } } }

  /* ---------- median: low hedge over a black-and-yellow painted curb */
  for(let x=0;x<W;x++){ set(x, yM, x%3 === 0 ? ROAD.hedgeL : ROAD.hedge); set(x, yM + 1, (x>>2)%2 ? ROAD.cy : ROAD.cb); }

  /* ---------- near lanes */
  for(let y=yM+2; y<yR1; y++) hl(0, W-1, y, ROAD.near);
  const ln = Math.round((yM + 2 + yR1)/2);
  for(let x=3;x<W;x+=9) hl(x, x + 3, ln, ROAD.lane);
  { const gap = (a, b) => Math.round(Math.max(a*W, a*230) + r()*W*b);
    let n = 1; if(yR1 - yM - 2 >= 8) for(let x = Math.round(W*.02); x < W - 8; x += gap(.16, .12)) car(x, ln - 1, 1, (n++)*4 + 1, true);
    for(let x = Math.round(W*.12); x < W - 8; x += gap(.17, .12)) car(x, yR1 - 1, 1, (n++)*5, true); }

  /* ---------- near curb and pavement, people, two date palms */
  hl(0, W-1, yR1, ROAD.curb);
  for(let y=yR1+1; y<H; y++) for(let x=0;x<W;x++)
    set(x, y, y === yR1 + 1 ? ROAD.curbS : ((x + (y%2)*3)%6 === 0 ? ROAD.joint : (y%2 ? ROAD.walk : ROAD.walk2)));
  const room = H - 2 - (yR1 + 1);                                 // pavement rows above the feet line
  const folk = (G, x) => { let g = G; while(g.length > room + 1) g = g.filter((_, i) => i !== 3);
    sprite(g, FOLK, x, H - 2); };
  folk(MAN, Math.round(W*.29)); folk(WOMAN, Math.round(W*.29) + 4);
  folk(MAN, Math.round(W*.57));
  folk(WOMAN, Math.round(W*.68)); folk(CHILD, Math.round(W*.68) + 4);
  const NP = H >= 120 ? PALM_L : PALM_M, npw = NP[0].length;
  sprite(NP, PALM, Math.round(W*.03), H - 1, false);
  sprite(NP, PALM, W - Math.round(W*.03) - npw, H - 1, true);
};
})();
