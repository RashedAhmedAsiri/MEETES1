/* scenes/splash.js — title background: the real Riyadh skyline at golden hour.
   Vantage point: from the south-east of Olaya (the Al Malaz side), a little above the roofs,
   looking north-west toward the low sun with a long lens. From here the real order is
   Al Faisaliah (south, left) – Kingdom Centre (north, right) – the KAFD towers further north
   (just right of Kingdom Centre, about twice as far away, in the dust haze). Horizontal distances
   are compressed so both landmarks stand in the side strips left free by the title content;
   heights keep their true ratio (302 m : 267 m).
   - Al Faisaliah: square tower seen slightly corner-on; aluminium corner columns tapering almost
     straight up, bronze-gold glazing with fine sunshade lines, three observation-deck bands (the
     K-braced sky lobbies), the open frame above the 30 office floors with the back column showing
     through, the golden glass sphere at ~200 m held between the columns, the lantern, the finial
   - Kingdom Centre: silver butt-jointed glass on the curved almond plan (tone bands across the
     width, bluer higher up where it reflects the sky), the parabolic opening and the sky bridge
   - the PIF Tower (faceted crown, vertical fins) and plain glass/stone KAFD towers in the haze
   - Olaya office towers: chunky 15–30 floor blocks of beige precast, blue-green glass or white
     with fins, each with its floor rhythm; a hazier back row behind them
   - low sand-and-white city (flat roofs, parapets, water tanks, villas with walls, a few mosques
     and trees), a four-lane highway with a median and lamp posts, and a park with date palms,
     lamps, families walking and picnicking.
   No outlines on architecture: distance is shown with the dusty golden haze. Light comes from
   the low sun on the left (it sets behind Al Faisaliah), so shadows on the lawn run to the right.
   In portrait the skyline sits just above the stacked title content.
   Everything is drawn per pixel on the scene raster (one pixel grid), randomness only from k.r. */
(() => {
'use strict';
const RGB = {};
const C = h => RGB[h] || (RGB[h] = hexRGB(h));
const BAY = [[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
const dz = (x, y, f) => f*16 > BAY[y&3][x&3] + .5;          // ordered-dither test
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

/* ---------- palette */
const HZ = '#e7cfaa';                                         // dusty golden haze on the horizon
const HZC = {};
const hz = (h, t) => { const q = Math.round(clamp(t, 0, 1)*6)/6, key = h + q; let v = HZC[key];
  if(!v){ const a = C(h), b = C(HZ); v = HZC[key] = a.map((c, i) => Math.round(c + (b[i] - c)*q)); } return v; };
const SKY = ['#3a69ae','#4675b6','#5482bf','#6590c6','#799fcc','#8fadd0','#a7bbd2','#c0c6cf','#d6ccc1','#e5d0b1','#efd4a4','#f6daa6','#fbe5b8','#fdefcf'];
// Kingdom Centre glass, west (sunlit) end to east end
const KG = ['#fff0d0','#e6e7e6','#cbd5dd','#afbfcd','#97aabf','#8398b0','#728aa4','#647c98','#586f8b'];
// Al Faisaliah
// Al Faisaliah: aluminium corner columns, bronze-gold glazing behind silver sunshades, deck bands
const FA = {rim:'#fff3d6', colL:'#ecdcbc', colM:'#cdbfa5', colR:'#9f9687',
  gL:'#d2a86b', finL:'#e4c48f', gL2:'#a9844f', gR:'#8b7864', finR:'#9a8975', gR2:'#6f5e4d',
  bandL:'#f6e8cb', bandR:'#bdb19d', deckL:'#987750', deckR:'#665645', back:'#b9ab93',
  lanL:'#e2c792', lanR:'#9a8670', spL:'#f7f3ea', spR:'#a8a299'};
const GLOBE = ['#fff5c8','#ffe17c','#f7c544','#e2a62d','#c08521','#966418'];
// city materials: lit (west faces), face (fronts in soft shade), dark, windows, roof edge
const MATS = [
  {lit:'#f6dcaa', face:'#dcc297', dark:'#b09372', win:'#8d7761', roof:'#efd8ac'},   // sand
  {lit:'#f9ebcd', face:'#e3d4b8', dark:'#b5a288', win:'#908171', roof:'#f3e6cc'},   // cream
  {lit:'#fdf6e8', face:'#e9e2d5', dark:'#bab1a3', win:'#8d8579', roof:'#f7f1e6'},   // white
  {lit:'#efdcc0', face:'#d4c6ae', dark:'#a59783', win:'#887b6b', roof:'#e3d6c0'},   // grey-beige
  {lit:'#f3d0a8', face:'#d9b38c', dark:'#ab8661', win:'#87694f', roof:'#e8c8a2'},   // tan
];
const GLASS = {lit:'#f3dcb2', face:'#a2b6ba', dark:'#7d9398', win:'#879ea4', roof:'#d9dee0'};
const TREE = ['#a9bb6c','#7f9b55','#5d7c43','#46633a'];
const PALM = {hi:'#a6c463', lit:'#79a64c', mid:'#5a8a41', dk:'#3f6b35', dd:'#2e5230', dry:'#b6a35d',
  t0:'#b48d5e', t1:'#8f6c47', t2:'#6b4f35', d0:'#f0b443', d1:'#d9822c', d2:'#a85c22'};
const CARS = [['#f7f5f0','#d3cfc7'],['#f7f5f0','#d3cfc7'],['#d2d6db','#a4a9b1'],['#e6d6b7','#bba98b'],['#40434a','#2c2e34'],
  ['#c9473c','#97312a'],['#f7f5f0','#d3cfc7'],['#4f72a6','#3a5683'],['#d2d6db','#a4a9b1']];

const SPLASH_BOXES = window.SPLASH_BOXES = window.SPLASH_BOXES || {};   // per scene size: boxes the title-screen flag keeps clear of

SCENES.splash = k => {
  const {R, W, H} = k, r = k.r;
  const set = (x, y, c) => R.set(x, y, c);
  const ri = (a, b) => a + Math.floor(r()*(b - a + 1));

  /* ---------- layout */
  const portrait = H > W*1.15, narrow = !portrait && W < 330;
  let S, hy;                                                   // S: Kingdom Centre height in px; hy: horizon
  if(portrait){                                                // skyline sits just above the stacked title content
    const top = (H - (W < 330 ? 251 : 188))/2;
    hy = Math.round(Math.max(H*.17, top + 9)); S = Math.round((hy - 6)/.95); }
  else { S = Math.round(H*.585); hy = Math.round(H*.055 + .95*S); }
  const yb = hy + Math.round(S*.05);                           // where the Olaya towers stand (hidden by the city)
  const side = portrait ? 0 : narrow ? (W - 183)/2 : (W - 305)/2;
  const hF = Math.round(S*267/302);
  const kw = Math.round(S*.118), fw = Math.round(hF*.112);    // half widths at the base
  let Kx, Fx;
  if(portrait){ Kx = Math.round(W - kw - Math.max(5, W*.055)); Fx = Math.round(Math.max(106 + fw*.5, Kx - kw - fw - W*.13)); }
  else { Kx = Math.round(W - Math.max(kw + 4, side*.6)); Fx = Math.round(Math.max(fw + 3, side*.72)); }
  const yRoad = portrait ? Math.round(H*.8) : Math.round(hy + S*.31);
  const sRoad = portrait ? 2.2 : S/302*4.6;                    // px per metre at the highway
  const hcam = (yRoad - hy)/sRoad;                             // camera height (m) that gives this perspective
  const sAt = y => Math.max(.1, (y - hy)/hcam);
  const hcamC = hcam*(portrait ? 1.4 : 2.3), sCity = y => Math.max(.08, (y - hy)/hcamC);   // the city is seen from a little higher

  /* ---------- sky: blue overhead, warm dusty gold toward the low sun */
  const sr = Math.max(5, Math.round(S*.07));
  const sx = portrait ? Math.round(W*.25) : Math.round(Fx - fw - sr*.2);
  const sy = hy - Math.round(sr*(portrait ? .5 : 1.05));
  // what the title-screen flag must not cover: [x0, y0, x1, y1, soft?] (soft: only if it can)
  const boxes = SPLASH_BOXES[W+'x'+H] = [];
  boxes.push([Kx - kw - 2, yb - S - 2, Kx + kw + 2, hy], [Fx - fw - 2, yb - hF - 2, Fx + fw + 2, hy]);
  boxes.push([sx - sr - 2, sy - sr - 2, sx + sr + 2, Math.min(hy, sy + sr), 1]);
  {
    const SK = SKY.map(C), n = SK.length - 1.001, gl = Math.max(28, S*.5), yH = hy + 2;
    // soft high cloud streaks lit from below: they push the ramp toward its warm, light end
    const CL = portrait ? [[W*.66, H*.035, W*.26, 2.2, 3.2], [W*.3, H*.085, W*.2, 1.6, 2.4]]
                        : [[W*.6, H*.06, W*.2, 2.6, 3.6], [W*.4, H*.13, W*.13, 1.8, 2.6], [W*.83, H*.17, W*.1, 1.6, 2.2]];
    for(let y = 0; y <= yb + 4; y++){
      const fy = Math.min(1, y/yH), base = Math.pow(fy, 1.4)*10.2, low = Math.pow(fy, 5)*1.4;
      for(let x = 0; x < W; x++){
        const dx = (x - sx)/gl, dy = (y - sy)/(gl*.55);
        let v = base + Math.exp(-(dx*dx + dy*dy))*2.6 + low*Math.exp(-Math.abs(x - sx)/(W*.55));
        for(const [cx, cy, cl, ct, ca] of CL){ const u = (x - cx)/cl; if(u < -1.2 || u > 1.2) continue;
          const w = (y - cy - u*cl*.04 + Math.sin(x*.21 + cy)*.6)/ct; v += ca*Math.exp(-u*u*2.2 - w*w)*(1 - .25*Math.sin(x*.5 + y)); }
        v = clamp(v, 0, n); const i = v|0;
        set(x, y, dz(x, y, v - i) ? SK[i+1] : SK[i]);
      }
    }
  }

  /* ---------- sun, low in the dust over the horizon */
  {
    const core = C('#fff7df'), mid = C('#ffeab0'), rim = C('#ffd88a'), halo = C('#fdeec9');
    for(let y = sy - sr - 4; y <= sy + sr + 4; y++) for(let x = sx - sr - 4; x <= sx + sr + 4; x++){
      const d = Math.hypot(x - sx, y - sy);
      if(d <= sr + .3){ const lowp = (y - sy)/sr; set(x, y, d < sr*.62 && lowp < .3 ? core : (d < sr - 1 && lowp < .55) ? mid : rim); }
      else if(d < sr + 4 && dz(x, y, (sr + 4 - d)/4*.8)) set(x, y, halo);
    }
  }

  // the ground between the rows: dusty roofs and streets fading into the haze
  for(let y = hy + 1; y < yRoad; y++){ const q = (y - hy)/(yRoad - hy), t = clamp((1 - q)*1.1, 0, .92);
    const a = hz('#d9c4a2', t), b = hz('#c7b190', t);
    for(let x = 0; x < W; x++) set(x, y, dz(x, y, .3) ? b : a); }

  /* ---------- towers */
  const P = (o, t) => { const q = {}; for(const kk in o) q[kk] = hz(o[kk], t); return q; };
  /* generic Riyadh office tower: front face with its floor and window rhythm, a sun-lit 1-px west edge,
     the side face in shade. Materials seen in Olaya: beige precast with punched windows, blue-green
     reflective glass with mullions, or white with deep vertical fins. Crowns are plain: a parapet,
     a set-back plant room, a mast, a set-back top or chamfered glass corners. */
  const TW = {
    stone: {lit:'#f7dfb4', face:'#dccaa9', win:'#b9a587', pier:'#e3d2b3', sh:'#b9a689', shw:'#a69378', top:'#f3e5c9'},
    glass: {lit:'#f2dcb4', face:'#a9b9c2', win:'#95a8b4', pier:'#bccad1', sh:'#8696a4', shw:'#7a8b99', top:'#e4e3dd'},
    white: {lit:'#fff4dc', face:'#ebe3d4', win:'#c8bdab', pier:'#f3ede2', sh:'#c4b9a7', shw:'#b3a895', top:'#faf5ec'},
  };
  const tower = (x0, w, h, kind, t, crown) => {
    x0 = Math.round(x0); w = Math.max(3, Math.round(w)); h = Math.round(h);
    const p = P(TW[kind], t), top = yb - h;
    const setb = crown === 'step' && w >= 7 ? Math.max(2, Math.round(h*.09)) : 0, ins = setb ? Math.max(1, Math.round(w*.15)) : 0;
    for(let i = 0; i < w; i++){
      for(let y = top; y <= yb; y++){
        const j = yb - y, upper = y < top + setb;
        if(upper && (i < ins || i >= w - ins)) continue;
        const l = upper ? ins : 0, rr = upper ? w - ins : w, sw = Math.max(1, Math.round((rr - l)*.28)), side = i >= rr - sw, k = i - l;
        if(crown === 'cham' && y - top < Math.max(0, Math.round(w*.22) - Math.min(i, w - 1 - i))) continue;
        let c;
        if(y === top || (setb && y === top + setb && !upper)) c = side ? p.sh : p.top;
        else if(i === l) c = p.lit;
        else if(side) c = (kind !== 'white' && j % 2 === 1) ? p.shw : p.sh;
        else if(kind === 'stone') c = (j % 2 === 1 && k % 2 === 1 && i < rr - sw - 1) ? p.win : p.face;
        else if(kind === 'glass') c = j % 2 === 0 ? p.win : (k % 3 === 0 ? p.pier : p.face);
        else c = (k % 2 === 0 && i < rr - sw - 1 && j % 4 !== 0) ? p.win : p.face;
        set(x0 + i, y, c);
      }
    }
    if(crown === 'mast'){ const mx = x0 + Math.round(w*.4), mh = Math.max(3, Math.round(h*.1)); for(let y = top - mh; y < top; y++) set(mx, y, p.pier); }
    if(crown === 'box'){ const bw = Math.max(2, Math.round(w*.45)), bx = x0 + Math.round(w*.2), bh = Math.max(1, Math.round(h*.04));
      for(let y = top - bh; y < top; y++) for(let i = 0; i < bw; i++) set(bx + i, y, i === 0 ? p.lit : i >= bw - Math.max(1, Math.round(bw*.3)) ? p.sh : p.top); }
  };

  /* Public Investment Fund Tower (KAFD): faceted crystal-like tower; the crown is cut by sloping
     facets that rise to a point on its right side */
  const pif = (cx, w, h, t) => {
    const p = P({lit:'#f4e6cc', f1:'#cbd7de', f2:'#a8b9c6', f3:'#8fa3b4', edge:'#eef2f3', fin:'#dde5ea'}, t);
    const hw = w/2, top = yb - h, ch = Math.round(h*.2);
    for(let y = top; y <= yb; y++){
      const j = yb - y, v = j/h;
      const half = hw*(1 - .1*v);
      const xl = Math.round(cx - half), xr = Math.round(cx + half), xm = Math.round(cx - half*.1);
      for(let x = xl; x <= xr; x++){
        const u = (x - xl)/Math.max(1, xr - xl);
        const peakY = top + Math.round((u < .78 ? (.78 - u)*1.25 : (u - .78)*2.5)*ch);
        if(y < peakY) continue;
        let c = x === xl ? p.lit : x < xm ? p.f1 : (u > .84 ? p.f3 : p.f2);
        if(y <= peakY + 1) c = u < .78 ? p.edge : p.f2;
        else if(y < top + ch && x === xm) c = p.edge;
        else if(x !== xl && x !== xm && y > top + ch && (x - xl) % 3 === 0) c = x < xm ? p.fin : p.f3;   // vertical fins
        set(x, y, c);
      }
    }
  };

  /* Al Faisaliah (Foster + Partners): a square tower whose four aluminium-clad corner columns taper
     almost straight up and then bend in to a point above the golden sphere. Seen slightly corner-on:
     the west face (left, in the low sun) and the south face (right, in shade). The office floors carry
     horizontal sunshades (fine floor lines); the observation decks every ~8 floors show as bands with
     the giant K-braces. Above the 30 office floors the frame is open (the back column shows through),
     the glass sphere sits snugly between the columns at ~200 m, then the lantern and the steel finial. */
  const faisaliah = (cx, h, hb) => {
    const vB = .56, vG = .75, vA = .865, rg = Math.max(2, Math.round(h*.045));
    const prof = v => v >= vA ? 0 : hb*(1 - .62*v)*Math.sqrt(1 - Math.pow(v/vA, 8));
    const c = {}; for(const kk in FA) c[kk] = hz(FA[kk], .08);
    const yBody = yb - Math.round(h*vB), yApex = yb - Math.round(h*vA), gy = yb - Math.round(h*vG);
    const big = h >= 104, cw = hb >= 11 ? 2 : 1, bh = big ? 4 : 3;
    const nB = Math.round(h*vB), decks = [.26, .52, .78].map(f => Math.round(nB*f));   // tops of the deck bands, from the base
    const deckAt = j => { for(const d of decks) if(j <= d && j > d - bh) return d - j; return -1; };   // 0 = top beam row
    for(let y = yb; y >= yApex; y--){
      const j = yb - y, v = j/h, hw = prof(v);
      const xl = Math.round(cx - hw), xr = Math.round(cx + hw), xc = Math.round(cx + hw*.2), xk = Math.round(cx - hw*.2);
      if(y >= yBody){
        const dk = deckAt(j), top = y === yBody;
        const lA = xl + cw, lB = xc - 1, rA = xc + cw, rB = xr - cw;   // glazed spans of the two faces
        for(let x = xl; x <= xr; x++){
          let col;
          if(x === xl) col = c.rim;
          else if(x < xl + cw) col = c.colL;
          else if(x > xr - cw) col = c.colR;
          else if(x === xc) col = c.rim;
          else if(x === xc + 1 && cw > 1) col = c.colM;
          else if(top || dk === 0) col = x < xc ? c.bandL : c.bandR;                 // deck floor beam
          else if(dk === bh - 1) col = x < xc ? c.gL2 : c.gR2;                        // deck soffit
          else if(dk > 0){                                                            // the open double-height deck with its K-brace
            const L = x < xc, mul = ((x - (L ? lA : rA)) % 3) === 1;                 // deck glazing with its big mullions
            col = L ? (mul ? c.gL2 : c.deckL) : (mul ? c.gR2 : c.deckR);
          }
          else if(x < xc) col = j % 2 ? c.gL : c.finL;                               // sunshade lines on the office floors
          else col = j % 2 ? c.gR : c.finR;
          set(x, y, col);
        }
      } else {                                                       // the open frame and the lantern
        const lantern = y < gy - rg && hw >= 1;
        if(lantern) for(let x = xl + 1; x < xr; x++) set(x, y, x < xc ? c.lanL : c.lanR);
        if(!lantern && xk > xl + cw && xk < xc - 1) set(xk, y, c.back);              // the back column, seen through the frame
        set(xl, y, c.rim); if(cw > 1 && xl + 1 < xc) set(xl + 1, y, c.colL);
        set(xr, y, c.colR); if(cw > 1 && xr - 1 > xc + 1) set(xr - 1, y, c.colR);
        if(xc > xl && xc < xr){ set(xc, y, c.rim); if(cw > 1 && xc + 1 < xr) set(xc + 1, y, c.colM); }
        const ring = j === Math.round(h*vG) - rg - 1;
        if(ring && !lantern) for(let x = xl + 1; x < xr; x++) if(x !== xc) set(x, y, x < xc ? c.bandL : c.bandR);
      }
    }
    // the golden glass sphere, lit from the left, with faint panel rings
    const G = GLOBE.map(C);
    for(let y = -rg; y <= rg; y++) for(let x = -rg; x <= rg; x++){
      const d2 = x*x + y*y; if(d2 > rg*rg + rg*.8) continue;
      const l = (-x*.7 - y*.45)/rg + .12 - Math.sqrt(d2)/rg*.22;
      let i = l > .62 ? 0 : l > .3 ? 1 : l > -.05 ? 2 : l > -.38 ? 3 : l > -.62 ? 4 : 5;
      if(rg >= 5 && (y + rg) % 3 === 1 && i > 0 && i < 5) i = Math.min(5, i + 1);
      set(cx + x, gy + y, G[i]);
    }
    // the columns pass just outside the sphere: redraw their thin edges over its rim
    for(let y = gy - rg; y <= gy + rg; y++){ const hw = prof((yb - y)/h); const xl = Math.round(cx - hw), xr = Math.round(cx + hw);
      if(xl < cx - rg + 1) set(xl, y, c.rim); if(xr > cx + rg - 1) set(xr, y, c.colR); }
    // stainless-steel finial
    const yTip = yb - h;
    for(let y = yTip; y < yApex; y++){ set(cx, y, c.spL); if(big && y > yApex - (yApex - yTip)*.45) set(cx + 1, y, c.spR); }
    set(cx, yTip, C('#ffffff'));
  };

  /* Kingdom Centre: broad south face of the almond-plan tower, straight sides (it does not narrow
     towards the top), parabolic opening and sky bridge */
  const kingdom = (cx, h, hw0) => {
    const top = yb - h, v0 = .645;
    const hwAt = () => hw0;                                        // straight sides: as wide at the top as at the foot
    const hwTop = hwAt(1), th = Math.max(2, Math.round(hwTop*.3)), hiTop = hwTop - th + .3;
    const brH = h >= 110 ? 2 : 1, yBr = top + Math.max(1, Math.round(h*.022));
    const hiAt = v => v <= v0 ? -1 : hiTop*Math.pow((v - v0)/(1 - v0), .42);
    const hole = (x, y) => { const hi = hiAt((yb - y)/h); return hi > 0 && Math.abs(x - cx) < hi - .2; };
    const K = KG.map(kk => hz(kk, .08)), n = K.length - 1;
    for(let y = top; y <= yb; y++){
      const j = yb - y, v = j/h, HO = hwAt(v) + .25;
      const xl = Math.round(cx - HO), xr = Math.round(cx + HO);
      const bridge = y >= yBr && y < yBr + brH;
      for(let x = xl; x <= xr; x++){
        const inH = hole(x, y);
        if(inH && !bridge) continue;
        let col;
        if(inH){ col = brH === 2 ? (y === yBr ? C('#eef1f2') : C('#56677b')) : C('#9fb0c0'); set(x, y, col); continue; }
        if(x === xl) col = K[0];
        else if(hole(x - 1, y) && !bridge) col = K[2];            // right inner edge
        else if(hole(x + 1, y) && !bridge) col = K[n];            // left horn's inner face, in shade
        else if(hole(x, y - 1) && y - 1 >= yBr + brH) col = K[1]; // sill at the bottom of the opening
        else if(y === top) col = x < cx ? K[1] : K[4];
        else {
          const t = (x - (cx - HO))/(2*HO);
          // curved silver glass: tone bands across the width; higher up it reflects bluer sky, lower down the warm haze
          const f = clamp(1.1 + t*6.6 - 1.3*Math.exp(-(((t - .2)/.09)**2)) + (v - .35)*1.6, 1, n), fi = Math.floor(f);
          const fr = f - fi; col = K[fi < n && (fr > .68 || (fr > .32 && ((x + y) & 1))) ? fi + 1 : fi];   // narrow 50% checker between bands
        }
        set(x, y, col);
      }
    }
  };

  /* ---------- far skyline: KAFD in the haze to the right of Kingdom Centre (PIF Tower the tallest).
     It stands about twice as far away as Kingdom Centre, so its 385 m read a little over half as tall. */
  {
    const kr = Kx + kw, room = W - kr;
    if(room > S*.06){
      const t = .58, px = kr + clamp(room*.45, S*.05, S*.12);
      for(const [o, w, h, kind, cr] of [[-.12,.05,.27,'glass','flat'],[-.065,.055,.37,'glass','box'],[.075,.05,.43,'glass','flat'],
                                         [.135,.06,.31,'white','box'],[.195,.055,.38,'glass','step'],[.255,.065,.25,'stone','flat']])
        tower(px + S*o - S*w/2, S*w, S*h, kind, t, cr);
      pif(px, S*.08, S*.56, .26);
    }
  }
  /* ---------- Olaya towers along King Fahd Road and Olaya Street between the two landmarks: chunky
     office blocks of 15-30 floors, denser near each landmark, a hazier back row behind them */
  {
    const KINDS = ['stone','stone','glass','white','stone','glass'], CROWNS = ['flat','box','flat','mast','step','box','flat','cham'];
    const put = (x, w, h, t) => { const kind = KINDS[ri(0, 5)]; let cr = CROWNS[ri(0, 7)]; if(cr === 'cham' && (kind !== 'glass' || h < w*2.2)) cr = 'box';
      tower(x - w/2, w, h, kind, t, cr); };
    for(let x = -S*.04; x < W + S*.05; x += S*(.09 + r()*.14)) if(r() < .6) put(x, S*(.05 + r()*.05), S*(.04 + r()*.09), .68);
    const a = Fx + fw + 2, b = Kx - kw - 2, span = b - a;
    if(span > S*.2){
      let x = a + S*.03;
      while(x < b - S*.03){
        const f = (x - a)/span, near = Math.max(Math.exp(-f*5), Math.exp(-(1 - f)*5)), mid = Math.exp(-(((f - .5)/.15)**2));
        const dense = Math.max(near, mid*.6);
        if(r() < .2 + dense*.7){
          const w = S*(.06 + r()*.065), h = S*(.07 + r()*.1 + dense*r()*.17);
          put(x, w, h, .42 + r()*.14); x += w*(.7 + r()*.8);
        } else x += S*(.06 + r()*.08);
      }
    }
    if(Fx - fw > S*.12) for(let x = Fx - fw - S*.05; x > -S*.05; x -= S*(.1 + r()*.1)) if(r() < .7) put(x, S*(.06 + r()*.05), S*(.06 + r()*.1), .5);
    put(Kx - kw - S*.07, S*.1, S*.26, .4);
    put(Fx + fw + S*.06, S*.09, S*.19, .38);
  }
  faisaliah(Fx, hF, fw);
  kingdom(Kx, S, kw);
  // the feet of all the towers vanish into the dusty far city
  for(let y = hy + 1; y <= yb + 1; y++){ const q = (y - hy)/(yRoad - hy), t = clamp((1 - q)*1.1, 0, .92);
    const a = hz('#d9c4a2', t), b = hz('#c7b190', t);
    for(let x = 0; x < W; x++) set(x, y, dz(x, y, .3) ? b : a); }

  /* ---------- the low city: rows of flat-roofed houses and apartment blocks, nearer rows larger */
  const tree = (x, by, s, t) => {
    const rad = Math.max(1, Math.round(2.4*s)), cy = by - rad - Math.round(s*1.2);
    const c = TREE.map(h => hz(h, t));
    for(let y = -rad; y <= rad; y++) for(let i = -rad - 1; i <= rad + 1; i++){
      const e = (i*i)/((rad + 1)*(rad + 1)) + (y*y)/(rad*rad); if(e > 1.05) continue;
      const l = -i*.5 - y*.7 + (BAY[(cy + y)&3][(x + i)&3] - 7.5)*.12;
      set(x + i, cy + y, c[l > rad*.6 ? 0 : l > -rad*.1 ? 1 : l > -rad*.7 ? 2 : 3]);
    }
    for(let y = cy + rad; y <= by; y++) set(x, y, hz('#8a6d50', t));
  };
  const minaret = (x, by, s, t) => {
    const hgt = Math.round(26*s), w = Math.max(1, Math.round(1.9*s));
    const lit = hz('#fbf3e2', t), sh = hz('#d5c8b1', t), dk = hz('#b5a790', t), cap = hz('#e9e6dc', t);
    const yB = by - Math.round(hgt*.74);
    for(let y = by - hgt; y <= by; y++) for(let i = 0; i < w; i++) set(x + i, y, i === w - 1 && w > 1 ? sh : lit);
    if(w > 1 || s > .5) for(let i = -1; i <= w; i++){ set(x + i, yB, lit); if(s > 1) set(x + i, yB + 1, dk); }
    const ch = Math.max(1, Math.round(3*s));
    for(let j = 1; j <= ch; j++){ const hw = (w/2)*(1 - j/(ch + 1)); for(let i = 0; i < w; i++){ const dx = i - (w - 1)/2; if(Math.abs(dx) <= hw + .3) set(x + i, by - hgt - j, dx < 0 ? cap : dk); } }
    if(w === 1) set(x, by - hgt - ch, cap);
  };
  const building = (bx, by, w, hgt, m, s, t, o) => {
    const c = {}; for(const kk in m) c[kk] = hz(m[kk], t);
    const sw = w >= 6 ? Math.max(1, Math.round(w*.12)) : (w >= 3 ? 1 : 0);
    const top = by - hgt + 1;
    for(let y = top; y <= by; y++) for(let x = bx; x < bx + w; x++){
      let col = x < bx + sw ? c.lit : (y === top ? c.roof : c.face);
      if(y === top + 1 && x >= bx + sw && hgt > 3 && s >= .6) col = c.dark;      // shadow under the parapet
      set(x, y, col); }
    if(o.cren && s >= .9) for(let x = bx + sw; x < bx + w - 1; x += 2) set(x, top - 1, c.roof);
    // windows: rows of small dark openings, a few reflecting the bright sky
    const fh = 3.3*s;
    if(fh >= 2.5){
      const ws = Math.max(2, Math.round((o.glass ? 2 : 3.4)*s)), ww = Math.max(1, Math.round((o.glass ? 1.5 : 1.1)*s)), wh = Math.max(1, Math.round(fh*(o.glass ? .55 : .34)));
      for(let f = 0; ; f++){
        const wy = top + 2 + Math.round(fh*.3 + f*fh); if(wy + wh > by - (o.wall ? Math.round(2.4*s) : 1)) break;
        for(let x = bx + sw + Math.max(1, Math.round(s)); x + ww <= bx + w - 1; x += ws){
          const glint = ((x*7 + wy*13 + bx) % 19) === 0;
          for(let yy = wy; yy < wy + wh; yy++) for(let xx = x; xx < x + ww; xx++) set(xx, yy, glint ? hz('#f6e6c8', t) : c.win);
        }
      }
    } else if(fh >= 1.3 && w >= 4){
      const st = Math.max(2, Math.round(fh));
      for(let y = top + 2; y < by; y += st) for(let x = bx + sw + 1; x < bx + w - 1; x += 2) set(x, y, c.win);
    }
    if(o.wall){                                                    // villa boundary wall in front, with a gate
      const wh2 = Math.max(1, Math.round(2.6*s)), wc = hz(o.wall, t), wl = hz('#f8ead0', t);
      for(let y = by - wh2 + 1; y <= by; y++) for(let x = bx - 1; x <= bx + w; x++) set(x, y, y === by - wh2 + 1 ? wl : wc);
      if(s >= 1){ const gx = bx + Math.round(w*.6), gw = Math.max(1, Math.round(1.6*s)); for(let y = by - wh2 + 2; y <= by; y++) for(let x = gx; x < gx + gw; x++) set(x, y, hz('#6f5b49', t)); }
    }
    // water tanks on the roof
    if(s >= .4 && o.tank){
      const tw = Math.max(1, Math.round(2.2*s)), th2 = Math.max(1, Math.round(1.6*s)), tx = bx + sw + Math.round((w - sw - tw)*o.tank);
      for(let y = top - th2; y < top; y++) for(let x = tx; x < tx + tw; x++) set(x, y, x === tx + tw - 1 && tw > 1 ? hz('#cfcac0', t) : hz('#fbfaf6', t));
    }
  };
  const sN = sCity(yRoad - 1), rowsY = [];
  for(let y = hy + 1; y < yRoad - 1; y += Math.max(portrait ? 2 : 1, Math.round(sCity(y)*(portrait ? 6 : 5)))) rowsY.push(y);
  for(let li = 0; li < rowsY.length; li++){
    const ly = rowsY[li], s = sCity(ly), t = clamp(.95*(1 - Math.exp(-(sN/s - 1)*.35)), 0, portrait ? .8 : .92);
    let x = -ri(0, Math.round(16*s)) - 1;
    while(x < W + 2){
      const u = r();
      let wM, hM, m = MATS[ri(0, MATS.length - 1)], o = {};
      if(u < .4){ wM = 13 + r()*7; hM = 7 + r()*2.5; o.wall = r() < .5 ? '#eadbbf' : '#e0cfb0'; o.cren = r() < .4; }
      else if(u < .78){ wM = 15 + r()*16; hM = 10 + r()*7; o.cren = r() < .15; }
      else if(u < .86){ wM = 18 + r()*12; hM = 20 + r()*16; if(r() < .18){ m = GLASS; o.glass = true; } }
      else if(u < .935){ wM = 22 + r()*20; hM = 4.5 + r()*1.5; }
      else if(u < .955 && li % 4 === 1){ wM = 24; hM = 8; m = MATS[2]; o.mosque = true; }
      else { wM = 10 + r()*10; hM = 0; }
      if(r() < .55) o.tank = .15 + r()*.6;
      const w = Math.max(2, Math.round(wM*s)), hgt = Math.round(hM*s);
      if(hgt > 0){
        building(x, ly, w, Math.max(1, hgt), m, s, t, o);
        if(o.mosque){ minaret(x + w - Math.max(1, Math.round(2.6*s)), ly, s, t);
          const dr = Math.max(1, Math.round(3.6*s)), dcx = x + Math.round(w*.42), dcy = ly - hgt;
          for(let yy = -dr; yy <= 0; yy++) for(let xx = -dr; xx <= dr; xx++) if(xx*xx + yy*yy <= dr*dr + dr*.5) set(dcx + xx, dcy + yy, hz(xx < -dr*.3 ? '#fdf8ee' : xx < dr*.4 ? '#e9e3d6' : '#c9c1b2', t)); }
      } else { for(let tt = 0; tt < 2; tt++) tree(x + Math.round(w*(.25 + tt*.5)), ly, s*(.8 + r()*.4), t); }
      if(hgt > 0 && r() < .3) tree(x + w + Math.round(r()*2*s), ly, s*(.7 + r()*.5), t);
      x += w + Math.round((r() < .18 ? 9 + r()*10 : 1.5 + r()*4)*s);
    }
  }

  /* ---------- the highway (King Fahd Road style): two carriageways of two lanes each, a concrete median
     barrier carrying tall twin-arm lamp posts */
  const lane = Math.max(3, Math.round(sRoad*1.35)), roadH = lane*4 + 6;
  const yA = yRoad + 2, yM = yA + 2*lane, yC = yM + 2;            // far carriageway, median, near carriageway
  const asphalt = (y0, y1) => { const a1 = C('#7b7672'), a2 = C('#86807a'), mark = C('#e9e2d4');
    for(let y = y0; y < y1; y++) for(let x = 0; x < W; x++) set(x, y, y === y0 + lane && (x % 12) < 5 ? mark : dz(x, y, .12) ? a2 : a1); };
  {
    const curb = C('#ddd4c2'), curb2 = C('#ada392'), bar = C('#ebe4d6'), bar2 = C('#b8af9f');
    for(let x = 0; x < W; x++){ set(x, yRoad, curb); set(x, yRoad + 1, curb2); set(x, yM, bar); set(x, yM + 1, bar2); set(x, yC + 2*lane, curb); set(x, yC + 2*lane + 1, curb2); }
    asphalt(yA, yM); asphalt(yC, yC + 2*lane);
  }
  // cars, side view
  const car = (x0, yB, L, pal, dir, suv) => {
    const body = C(pal[0]), bodyS = C(pal[1]), glass = C('#4b5867'), glassH = C('#a9b8c4'), tyre = C('#26262a'), sh = C('#5a5552');
    const hgt = Math.max(3, Math.round(L*(suv ? .4 : .33))), bh = Math.ceil(hgt*.55);
    const c0 = Math.round(L*(suv ? .18 : .26)), c1 = Math.round(L*(suv ? .9 : .78));
    for(let i = 0; i < L; i++){
      const x = dir > 0 ? x0 + i : x0 + L - 1 - i;              // i measured from the rear
      set(x, yB + 1, sh);
      for(let y = yB - bh + 1; y <= yB; y++) set(x, y, y === yB - bh + 1 ? body : bodyS);
      if(i >= c0 && i < c1){
        const roof = yB - hgt + 1;
        const slopeR = suv ? 0 : Math.max(0, c0 + 2 - i), slopeF = suv ? Math.max(0, i - (c1 - 2)) : Math.max(0, i - (c1 - 3));
        for(let y = roof + slopeR + slopeF; y < yB - bh + 1; y++) set(x, y, y === roof + slopeR + slopeF ? body : (i === c0 || i === c1 - 1 ? body : glass));
        if(i === c0 + 1 && L >= 10) set(x, yB - bh, glassH);
      }
    }
    const w1 = Math.round(L*.2), w2 = Math.round(L*.78), tw = L >= 12 ? 2 : 1;
    for(const wi of [w1, w2]) for(let k2 = 0; k2 < tw; k2++){ const x = dir > 0 ? x0 + wi + k2 : x0 + L - 1 - wi - k2; set(x, yB, tyre); if(L >= 12) set(x, yB + 1, tyre); }
    set(dir > 0 ? x0 + L - 1 : x0, yB - bh + 1, C('#fff2c4'));
    set(dir > 0 ? x0 : x0 + L - 1, yB - bh + 1, C('#d8402e'));
  };
  {
    const L = Math.max(7, Math.round(4.6*sRoad));
    const traffic = (yB, dir, seed) => { let x = -Math.round(r()*L*3);
      while(x < W){ const suv = r() < .35, l = suv ? L + 1 : L;
        car(x, yB, l, CARS[(ri(0, 99) + seed) % CARS.length], dir, suv);
        x += l + Math.round(L*(.6 + r()*3.2)); } };
    traffic(yA + lane - 1, -1, 3); traffic(yA + 2*lane - 1, -1, 5);
    // lamp posts on the median: a slim steel mast with two short arms over the carriageways
    const pole = C('#a49e95'), poleL = C('#d6d0c4'), head = C('#e4e0d6'), hl = Math.round(10.5*sRoad);
    for(let px = Math.round(W*.03 + r()*W*.05); px < W; px += Math.round(W*(portrait ? .4 : .2))){
      for(let y = yM - hl; y <= yM; y++) set(px, y, y < yM - hl + 2 ? poleL : pole);
      set(px - 1, yM - hl, head); set(px + 1, yM - hl, head); set(px - 2, yM - hl + 1, head); set(px + 2, yM - hl + 1, pole); }
    traffic(yC + lane - 1, 1, 7); traffic(yC + 2*lane - 1, 1, 9);
  }

  /* ---------- date palms: trunk with leaf-base pattern, arching feathered fronds, dates */
  const FRONDS = [   // angle (deg, 0 = right), length, droop; drawn back (drooping) to front (rising)
    [-58,.55,1.7],[238,.55,1.7],[-36,.8,1.35],[216,.8,1.35],[-14,.95,1.05],[194,.95,1.05],[8,1.02,.8],[172,1.02,.8],
    [30,1,.55],[150,1,.55],[52,.95,.38],[128,.95,.38],[70,.85,.24],[110,.85,.24],[84,.78,.14],[96,.74,.12]];
  const palm = (x0, yB, h, cr, t = 0, flip = false) => {
    const p = {}; for(const kk in PALM) p[kk] = hz(PALM[kk], t);
    const tw = Math.max(1, Math.round(cr*.14));
    const lean = Math.round(h*.06)*(flip ? -1 : 1);
    for(let j = 0; j <= h; j++){ const y = yB - j, x = x0 + Math.round(lean*Math.pow(j/h, 2));
      const w = tw + (j > h - Math.max(2, h*.08) ? 1 : 0);
      for(let i = 0; i < w; i++){                                   // criss-cross leaf-base scars, lit from the left
        const ph = (j + (i & 1)*2) % 4, edge = i === 0 ? -1 : i === w - 1 ? 1 : 0;
        set(x + i, y, w < 3 ? (i === 0 ? (ph === 0 ? p.t1 : p.t0) : (ph === 0 ? p.t2 : p.t1))
                            : edge < 0 ? (ph === 0 ? p.t1 : p.t0) : edge > 0 ? p.t2 : (ph === 0 ? p.t2 : ph === 2 ? p.t0 : p.t1)); } }
    const cx = x0 + lean + Math.floor(tw/2), cy = yB - h;
    for(const [a0, lf, droop] of FRONDS){
      const a = (flip ? 180 - a0 : a0)*Math.PI/180, dx = Math.cos(a), dy = -Math.sin(a), L = cr*lf;
      const dir = dx > .05 ? 1 : dx < -.05 ? -1 : 0, shade = dir > 0;
      const up = dy < -.5, cSp = shade ? p.mid : (up ? p.hi : p.lit), cLf = shade ? p.dk : p.mid, cTip = shade ? p.dd : p.dk;
      let px = -999, py = -999;
      for(let tt = 0; tt <= 1.0001; tt += .45/L){
        const x = Math.round(cx + dx*L*tt), y = Math.round(cy + dy*L*tt + droop*L*tt*tt*.55);
        if(x === px && y === py) continue; px = x; py = y;
        if(tt > .1){
          const ll = Math.max(1, Math.round((1 - tt*.7)*cr*.26));
          for(let q = 1; q <= ll; q++){
            set(x + dir*Math.floor(q*.55), y + q, q === ll ? cTip : cLf);
            if(q <= ll*.7) set(x - dir*Math.floor(q*.35) - (dir === 0 ? Math.floor(q*.5) : 0), y + q, q >= ll*.7 - 1 ? cTip : cLf);
          }
        }
        set(x, y, cSp);
      }
    }
    set(cx, cy, p.dk); set(cx - 1, cy, p.mid); set(cx + 1, cy, p.dk);
    if(cr >= 7){ const n = cr >= 14 ? 2 : 1;
      for(const sd of [-1, 1]) for(let j = 0; j < 2 + n; j++) for(let i = 0; i < 1 + n; i++){
        const col = (i + j) % 3 === 0 ? 'd0' : (sd > 0 || j > n) ? 'd2' : 'd1'; set(cx + sd*(1 + i + (j > 1 ? 1 : 0)), cy + 1 + j, p[col]); } }
    else { set(cx - 1, cy + 1, p.d1); set(cx + 1, cy + 1, p.d2); }
  };

  /* ---------- park in the foreground: lawn, path, people, big date palms */
  const yP = yRoad + roadH;
  {
    const LG = ['#c2cc72','#b0c466','#9eba5c','#8daf53','#7fa44c'].map(C), hd = C('#5d8a3e'), hl = C('#b0cd6c');
    const pv = C('#ecdab4'), pv2 = C('#d9c39b'), pe = C('#c2a882');
    const yW = yP + Math.max(4, Math.round((H - yP)*.42)), wp = Math.max(3, Math.round((H - yP)*.12));
    for(let y = yP; y < H; y++) for(let x = 0; x < W; x++){
      let c;
      if(y < yP + 2) c = y === yP ? hl : hd;                                       // hedge along the road
      else if(y >= yW && y < yW + wp) c = (y === yW || y === yW + wp - 1) ? pe : (((x + (y - yW)*3) % 7) === 0 ? pv2 : pv);
      else {                                                                        // lawn: lighter and warmer toward the low sun and the far side
        const q = (y - yP - 2)/Math.max(1, H - yP - 2), f = clamp(q*3.2 + .5 - .9*Math.exp(-x/(W*.4)), 0, LG.length - 1.001), fi = f|0;
        c = LG[dz(x, y, f - fi) ? fi + 1 : fi]; }
      set(x, y, c);
    }
    // grass tufts: little dark blades with a lit tip, scattered irregularly
    for(let y = yP + 3; y < H; y++){ const step = Math.max(5, Math.round(14 - (y - yP)*.15));
      for(let x = (y*7) % step; x < W; x += step){ const hsh = (x*73 + y*151 + ((x*y) >> 3)) % 11; if(hsh > 2) continue;
        if(y >= yW - 1 && y <= yW + wp) continue;
        const cc = R.get(x, y); if(cc[1] < 120) continue;
        set(x, y, [cc[0]*.82|0, cc[1]*.86|0, cc[2]*.8|0]); if(hsh === 0) set(x + 1, y - 1, [Math.min(255, cc[0] + 18), Math.min(255, cc[1] + 14), cc[2]]); } }
    // hedge bumps
    for(let x = 0; x < W; x += 3){ set(x, yP - 1, hd); if((x/3|0) % 3 === 0) set(x + 1, yP - 1, hl); }
    // bougainvillea bushes along the path
    const sP = sAt(yW);
    const bush = (bx, by, rad) => { for(let y = -rad; y <= 0; y++) for(let x = -rad - 2; x <= rad + 2; x++){
      const e = (x*x)/((rad + 2)*(rad + 2)) + (y*y)/(rad*rad); if(e > 1) continue;
      const fl = ((x*5 + y*7 + bx*3) % 6) === 0 && e < .8, l = -x*.4 - y*.8;
      set(bx + x, by + y, fl ? C(l > 0 ? '#f27dab' : '#cf4580') : C(l > rad*.5 ? '#86b356' : l > -rad*.3 ? '#5f9142' : '#466f36')); } };
    for(const f of [.1, .37, .58, .84]) bush(Math.round(W*f), yW - 1, Math.max(2, Math.round(1.1*sP)));
    // people walking on the path (no faces)
    const big = sP >= 3.4;
    const MAN = big ? ['.rr.','rssr','.ww.','wwwW','wwwW','wwwW','wwwW','.wW.'] : ['.r.','rsr','wwW','wwW','wwW','.w.'];
    const WOMAN = big ? ['.kk.','kssk','.kk.','kkkK','kkkK','kkkK','kkkK','kkkKK'] : ['.k.','ksk','kkK','kkK','kkK','kkKK'];
    const KID = big ? ['.hh.','.ss.','gggg','gggg','.bb.','.b.b'] : ['.h.','ggg','ggg','b.b'];
    const PC = {r:'#c8433a', s:'#c99a74', w:'#f7f5ef', W:'#d1ccc2', k:'#3a3740', K:'#24222a', h:'#3b2b22', g:'#1f8f4e', b:'#4c5a78'};
    const person = (G, x, y) => { for(let j = 0; j < G.length; j++) for(let i = 0; i < G[j].length; i++){ const ch = G[j][i]; if(ch !== '.') set(x + i, y - G.length + 1 + j, C(PC[ch])); }
      const sc = C('#b9a37e'); for(let i = 1; i <= G.length; i++) if(R.get(x + G[0].length - 1 + i, y + 1)[1] > 150) set(x + G[0].length - 1 + i, y + (i > G.length/2 ? 1 : 0), sc); };
    const yF = yW + Math.round(wp*.6);
    const groups = portrait ? [[.3, [MAN, WOMAN, KID]], [.62, [MAN]]] : [[.14, [MAN, WOMAN, KID]], [.45, [MAN]], [.66, [WOMAN, KID]], [.8, [MAN, MAN]]];
    for(const [f, g] of groups){ let x = Math.round(W*f); for(const G of g){ person(G, x, yF); x += G[0].length + 1; } }
    // families picnicking on rugs on the lawn
    const rugY = yW + wp + Math.max(3, Math.round((H - yW - wp)*.35));
    const rug = (x, y, w2) => { const rc = C('#b93a33'), rb = C('#e7c15a'), rd = C('#8e2a27');
      for(let j = 0; j < 3; j++) for(let i = 0; i < w2; i++) set(x + i, y + j, j === 1 && i > 0 && i < w2 - 1 ? (i % 3 ? rc : rb) : (j === 2 ? rd : rc)); };
    const sit = (G, x, y) => person(G, x, y);
    const SM = big ? ['.rr.','rssr','wwwW','wwwW','.wW.'] : ['.r.','wwW','wwW'], SW = big ? ['.kk.','kssk','kkkK','kkkKK'] : ['.k.','kkK','kkK'];
    const SK2 = big ? ['.hh.','.ss.','gggg'] : ['.h.','gg'];
    for(const f of portrait ? [.55] : [.05, .58]){
      const x = Math.round(W*f), rw = big ? 16 : 10;
      rug(x, rugY - 1, rw); sit(SM, x + 1, rugY); sit(SW, x + Math.round(rw*.45), rugY); sit(SK2, x + rw - (big ? 5 : 3), rugY + 1);
    }
    // long golden-hour shadows: the sun is low in front of us on the left, so shadows run toward us, to the right
    const shadePx = (x, y) => { if(x < 0 || y < yP || x >= W || y >= H) return; const c = R.get(x, y); set(x, y, [c[0]*.78|0, c[1]*.83|0, Math.min(255, c[2]*.86 + 8)|0]); };
    const shadow = (x0, yB, h, cr) => { const L = Math.round(h*1.5);
      for(let i = 1; i <= L; i++){ const y = yB + Math.round(i*.2); shadePx(x0 + i, y); if(h > 30) shadePx(x0 + i, y + 1); }
      const ex = x0 + L + Math.round(cr*.4), ey = yB + Math.round(L*.2), rx = Math.round(cr*.75), ry = Math.max(1, Math.round(cr*.16));
      for(let y = -ry; y <= ry; y++) for(let x = -rx; x <= rx; x++) if((x*x)/(rx*rx) + (y*y)/(ry*ry) <= 1 && ((x + y) % 5 !== 0)) shadePx(ex + x, ey + y); };
    // park lamps along the path
    const lamp = (x, yB, hgt) => { for(let y = yB - hgt; y <= yB; y++) set(x, y, C('#4a4139'));
      set(x - 1, yB - hgt, C('#4a4139')); set(x + 1, yB - hgt, C('#4a4139'));
      set(x, yB - hgt - 1, C('#fff1c2')); set(x, yB - hgt - 2, C('#f2d58c')); if(hgt > 10){ set(x - 1, yB - hgt - 1, C('#f6e1a4')); set(x + 1, yB - hgt - 1, C('#d9b770')); }
      for(let i = 1; i < hgt*.8; i++) shadePx(x + i, yB + Math.round(i*.2)); };
    for(const f of portrait ? [.4, .78] : [.2, .41, .62, .92]) lamp(Math.round(W*f), yW - 1, Math.round(3.6*sP));
    // date palms: a few along the path, two big ones framing the corners
    const PP = [[.27, 1.1], [.5, .9], [.73, 1.15]].map(([f, hs]) => [Math.round(W*f), Math.round(8*sP*hs), Math.round(3.8*sP*hs), f > .5]);
    const sB = sAt(H);
    const bh = Math.round(Math.min(9*sB, H - hy - (portrait ? 30 : 6))), bc = Math.round(Math.min(5*sB, W*.15));
    const C1 = [Math.round(portrait ? W*.06 : Math.max(6, side*.32)), H + 2, bh, bc], C2 = [Math.round(portrait ? W*.92 : W - Math.max(8, side*.34)), H + 3, Math.round(bh*.92), Math.round(bc*.95)];
    for(const [x, h2, c2] of PP) shadow(x, yW + 1, h2, c2);
    shadow(C1[0], C1[1] - 4, C1[2]*.5, C1[3]); 
    for(const [x, h2, c2, fl] of PP) palm(x, yW + 1, h2, c2, 0, fl);
    palm(C1[0], C1[1], C1[2], C1[3], 0, false);
    for(const [x, yB, h2, c2] of [C1, C2]) boxes.push([x - c2 - 2, yB - h2 - c2 - 2, x + c2 + 2, H, 1]);
    palm(C2[0], C2[1], C2[2], C2[3], 0, true);
  }
};
})();
