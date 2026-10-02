/* scenes/makkah.js — Masjid al-Haram today, seen from high on the north side of the mosque,
   looking south across the mataf.
   Near to far: the white marble mataf packed with pilgrims in ihram circling the Kaaba
   (black kiswa, gold hizam band, the gold door curtain near the Black Stone corner, the
   low white Hijr Ismail wall, the small gold-and-glass Maqam Ibrahim); the court's own
   walls in perspective: the Ottoman portico with its row of small grey domes (on three
   sides, not along the Mas'a on the left) and, behind it, the multi-storey mataf building
   with tiers of pointed arches and a crenellated parapet, wrapping round the far side and
   coming toward us on both sides; the King Abdulaziz Gate with its minarets; and behind,
   the Abraj Al-Bait: the Makkah Royal Clock Tower flanked by the six hotel towers of the
   complex, the Jabal Omar towers, hotels and the rocky, built-up hills of Makkah.
   The mosque is ray-cast pixel by pixel against one model (eye 55 m up, 165 m north of the
   Kaaba); the far towers are drawn on a compressed scale so the whole clock tower fits.
   Lit by the morning sun from the east (left), about 45 degrees up: the west-facing wall is
   in shade, the east-facing one bright, and the east wing and the Kaaba cast their shadows
   onto the crowd. Distant things hazier, no outlines. */
(() => {
'use strict';
const HEX = {
  // far mountains (hazy) and nearer rocky hills
  m0:'#a7a2a1', m1:'#b5b1ae', m2:'#c6c2bd',
  h0:'#9d938c', h1:'#ada399', h3:'#cbc3b6',
  // city fabric on the hills (hazy cream / white / sand) and its windows
  b0:'#cbc3b4', b1:'#dbd4c6', b2:'#e8e4da', b3:'#bab1a2', bw:'#aaacab', bg:'#a8babe',
  // Abraj stone (lit, base, mid, side shade, deep) and tinted glass
  s4:'#f2eadb', s3:'#e4dac6', s2:'#d4c8b0', s1:'#bdaf97', s0:'#a39680',
  q3:'#c6d8d6', q2:'#a9c1c1', q1:'#8fa9ab', q0:'#768f91',
  // gold (dark -> highlight)
  g0:'#8a5a12', g1:'#b98318', g2:'#dca52c', g3:'#f5c84a', g4:'#fff0a6',
  // clock green
  n0:'#0b4d2f', n1:'#12704a', n2:'#1f9463',
  // Haram marble (highlight -> shade) and arch shadows
  W:'#ffffff', w4:'#f8f6f0', w3:'#eee9de', w2:'#e0d8c8', w1:'#cfc5b2', w0:'#b7ac97',
  a3:'#c8bfae', a2:'#aca290', a1:'#91877a', a0:'#786f63', aD:'#625a50',
  // Ottoman domes (lead-grey plaster) and the portico roof
  d4:'#fbfbf9', d3:'#ebebe7', d2:'#d6d6d1', d1:'#bdbcb6', d0:'#a3a29c', dr:'#cdc3ae',
  // mataf floor and the roofs of the mosque
  f3:'#f7f7f3', f2:'#ebeae4', o1:'#e8e3d7', o2:'#dcd5c7',
  // Kaaba
  k0:'#0f0f12', k1:'#19191d', k2:'#25252b', k3:'#33333b', kr:'#6e6e6c', kR:'#8c8c89', kb:'#d9d6cd',
  sv:'#c7ccd1',
  // pilgrims: ihram whites, heads and dark clothes seen from afar, a few colours
  pW:'#ffffff', pA:'#f3f1eb', pS:'#e2ded5', pG:'#ccc7bd',
  hd1:'#a3a09d', hd2:'#7b7876', ab:'#55535a', cA:'#bba886', cB:'#91a2ae', cC:'#ab9092',
  sk0:'#d9a77c', sk1:'#bd8660', sk2:'#9c6a47', sk3:'#6f4f39', hr:'#4a3f38',
  // minaret stone
  mW:'#ffffff', mL:'#f3f2ee', mM:'#e1dfd9', mS:'#c9c6bf', mD:'#97948d',
};
const C = {}; for(const k in HEX) C[k] = hexRGB(HEX[k]);
const BAY = [[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
const dith = (x, y, t) => t*16 > BAY[y&3][x&3] + .5;
const fr = v => v - Math.floor(v);
const shade = col => [col[0]*.86|0, col[1]*.875|0, col[2]*.9|0];

SCENES.makkah = k => {
  const {R, W, H} = k, r = k.r, c = C;
  const u = H/134, S = v => Math.round(v*u), S1 = v => Math.max(1, Math.round(v*u));
  const set = R.set;
  const ri = (a, b) => a + Math.floor(r()*(b-a+1));
  const seed = 1 + Math.floor(r()*65521);
  const hsh = (a, b) => { let h = Math.imul(a + seed, 374761393) ^ Math.imul(b + 7, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0)/4294967296; };

  /* ---------- one camera for the mosque: eye 55 m above the mataf, 165 m north of the Kaaba */
  const EYE = 55, D = 165, f = 165*u;
  const yh = S(60), cx = Math.round(W*.5);
  const gy = z => yh + f*EYE/z, gx = (X, z) => cx + f*X/z;
  // the Kaaba's footprint (m): near (north) corner, Black Stone corner, back corner, Hijr corner
  const KP = [[0, D], [-10.8, D + 3], [-7, D + 10], [3.8, D + 7]];
  const kcX = -3.5, kcZ = D + 5;
  // the court: straight east and west sides, rounded far side; walls are offsets outward from it
  const cX = kcX, cZ = kcZ + 2, A0 = 64, B0 = 58, P = 3;
  const PORT = 8.5, RING = 33, OUTR = 24;          // portico roof, mataf building, outer roof heights (m)
  const yRing = Math.round(yh + f*(EYE - RING)/(cZ + B0 + 10));   // far roofline of the mataf building
  const yLow = yRing + S(12);                      // background is painted down to here

  /* ---------- sky */
  R.bands(0, yLow, ['#4c9ad2','#66abdd','#8bc0e5','#b0d3e8','#cfe3e9']);
  // a few of the Haram's grey pigeons
  for(const [fx, fy, up] of [[.18, .2, 0], [.22, .24, 1], [.76, .14, 1], [.81, .2, 0]]){
    const x = Math.round(W*fx), y = Math.round(H*fy), col = c.hd1;
    set(x, y + (up ? 0 : 1), col); set(x+1, y + 1, col); set(x+2, y + 1, c.hd2); set(x+3, y + 1, col); set(x+4, y + (up ? 0 : 1), col);
  }

  /* ---------- rocky hills of Makkah: jagged granite ridges (hazy), the nearer ones built over */
  const profile = (base, hmin, hmax, n) => {
    const top = new Array(W).fill(base);
    for(let i=0; i<n; i++){
      const px = (i + .2 + r()*.6)/n*W, e = Math.min(1, Math.abs(px - W*.47)/(W*.5));
      const hgt = (hmin + r()*(hmax - hmin))*(.55 + .7*e), sl = .22 + r()*.3, sr = .22 + r()*.3, cap = hgt*(.72 + r()*.2);
      for(let x=0; x<W; x++){ const d = x - px, h = Math.min(cap, hgt - (d < 0 ? -d*sl : d*sr)); if(h > 0) top[x] = Math.min(top[x], base - h); }
    }
    let wob = 0;
    for(let x=0; x<W; x++){ wob = Math.max(-1.5, Math.min(1.5, wob + (r() - .5)*1.2)); top[x] = Math.round(top[x] + wob); }
    return top;
  };
  const rock = (top, lit, mid, sh) => {
    for(let x=0; x<W; x++){
      const rise = x > 0 ? top[x-1] - top[x] : 0;
      for(let y=top[x]; y<=yLow; y++){ const j = y - top[x];
        let col = rise > 0 ? (j < 2 + rise ? lit : mid) : rise < 0 ? (j < 2 ? sh : mid) : (j === 0 ? lit : mid);
        if(j > 1 && (x*13 + (y >> 1)*7) % 17 === 0) col = sh;
        set(x, y, col); }
    }
  };
  const far = profile(yRing - S(2), S(5), S(14), 8);
  rock(far, c.m2, c.m1, c.m0);
  const near = profile(yRing + S(3), S(3), S(9), 9);
  rock(near, c.h3, c.h1, c.h0);
  // the city: low cream and white blocks stacked up the slopes, rows of small windows
  const houses = (lift, hmin, hmax) => {
    let x = -ri(0, 3);
    while(x < W){
      const w = ri(3, 6), bh = ri(hmin, hmax);
      let base = 0; for(let i=0; i<w; i++) base = Math.max(base, near[Math.min(W-1, Math.max(0, x+i))]);
      const top = base + lift - bh, pal = [[c.b1, c.b0], [c.b2, c.b1], [c.b1, c.b3]][ri(0, 2)];
      for(let y=top; y<=yLow; y++) for(let i=0; i<w; i++){
        const j = y - top;
        let col = j === 0 ? c.b2 : i === w-1 ? pal[1] : pal[0];
        if(j > 0 && (j & 1) === 0 && i > 0 && i < w-1 && ((i + x) & 1) === 0) col = (x + j) % 3 ? c.bw : c.bg;
        set(x+i, y, col); }
      x += w + (r() < .3 ? 1 : 0);
    }
  };
  houses(S1(2), 2, 3);
  houses(S(6), 2, 4);

  /* ---------- hotels round the Haram: plain stone and plaster slabs, window bays, hazy with distance */
  const SKY = hexRGB('#c9dfe8');
  const mix = (a, b, t) => [Math.round(a[0] + (b[0] - a[0])*t), Math.round(a[1] + (b[1] - a[1])*t), Math.round(a[2] + (b[2] - a[2])*t)];
  const slab = (x0, w, top, sideRight, tone, kind, haze) => {
    const T = [[c.s4, c.s3, c.s2, c.q1], [c.b2, c.b1, c.b3, c.bw], [c.w4, c.w3, c.w1, c.bg], [c.s3, c.s2, c.s1, c.q0]][tone].map(v => mix(v, SKY, haze));
    const sw = S1(2), x1 = x0 + w - 1;
    for(let y=top; y<=yLow; y++){ const j = y - top;
      for(let x=x0; x<=x1; x++){ const i = x - x0;
        let win;
        if(kind === 0) win = i % 3 !== 0 && (j & 1) === 1;            // pairs of windows between piers
        else if(kind === 1) win = j % 3 === 1 && i % 4 !== 0;         // ribbon windows
        else win = i % 3 === 1 && j % 5 !== 4;                        // glazed strips
        if(j < 2 || i === 0 || x === x1) win = false;
        set(x, y, win ? (dith(x, y, .35) ? T[3] : T[2]) : i === 0 ? T[0] : x === x1 ? T[2] : T[1]); }
      for(let i=1; i<=sw; i++){ const x = sideRight ? x1 + i : x0 - i;
        set(x, y, sideRight ? ((j & 1) && j > 1 && i < sw ? T[3] : T[2]) : T[1]); }
    }
    for(let x=x0; x<=x1; x++) set(x, top, T[0]);
    // roof: a set-back plant room, or a stepped stone crown
    const m = x0 + 1 + ((x0*7 + w) % Math.max(1, w - 4));
    if(kind === 2){ for(let x=x0 + 1; x<x1; x++) set(x, top - 1, x === x0 + 1 ? T[0] : T[1]); for(let x=x0 + 2; x<x1 - 1; x++) set(x, top - 2, x === x0 + 2 ? T[0] : T[2]); }
    else { set(m, top - 1, T[0]); set(m + 1, top - 1, T[1]); set(m + 2, top - 1, T[2]); }
  };
  // left (east): hotels below Jabal Abu Qubais
  for(const [fx, w, t, tone, kind, hz] of [[-.01, 10, 9, 1, 0, .25], [.06, 7, 12, 2, 1, .1], [.115, 9, 7, 3, 0, .3], [.19, 6, 10, 1, 2, .2], [.235, 8, 6, 2, 1, .35]])
    slab(Math.round(W*fx), S1(w), yRing - S(t), true, tone, kind, hz);
  // right (west): the Jabal Omar towers
  for(const [fx, w, t, tone, kind, hz] of [[.70, 6, 9, 1, 1, .3], [.745, 7, 13, 0, 2, .15], [.805, 8, 16, 0, 0, .1], [.865, 7, 11, 2, 1, .25], [.91, 8, 15, 3, 2, .12], [.97, 7, 12, 1, 0, .2]])
    slab(Math.round(W*fx), S1(w), yRing - S(t), false, tone, kind, hz);

  /* ---------- Abraj Al-Bait, compressed so the whole clock tower fits (heights keep their ratios) */
  const yTop = S1(2), yBase = yRing;                       // the complex's 35 m level sits on our roofline
  const sc = (yBase - yTop)/566;
  const yA = m => Math.round(yBase - (m - 35)*sc);
  const hs = sc*1.15;                                      // horizontal px per metre (slightly widened)
  const tx = cx - S(6);
  // podium (shopping mall and hotel base) across the complex
  { const p0 = tx - Math.round(262*hs), p1 = tx + Math.round(264*hs), top = yA(112);
    for(let y=top; y<=yLow; y++) for(let x=p0; x<=p1; x++){ const j = y - top;
      set(x, y, j === 0 ? c.s4 : (j % 3 === 2 && (x & 1)) ? c.q1 : c.s2); } }
  // the six hotel towers: stone grid with tinted glass, a crown gallery, a pointed roof and a spire
  const tower = (fx, hwm, hgt, sideRight, kind) => {
    const cxT = tx + Math.round(fx*hs), hw = Math.max(3, Math.round(hwm*hs)), yT = yA(hgt);
    const x0 = cxT - hw, x1 = cxT + hw, sw = S1(2);
    const sp = S1(2), gal = u >= .95 ? 3 : 2;
    const pw0 = Math.max(1, Math.min(2, hw - 3)), yb = yT + sp + (pw0*2 + 1) + 1 + gal + 1;
    for(let y=yb; y<=yLow; y++){ const j = y - yb, t = Math.max(0, 1 - j/Math.max(1, (yLow - yb)*.8));
      for(let x=x0; x<=x1; x++){ const i = x - x0;
        const win = kind === 'strip' ? (i % 3 !== 0 && j % 6 !== 5) : ((i & 1) === 1 && (j & 1) === 1 && j % 10 !== 9);
        set(x, y, i === 0 ? c.s4 : x === x1 ? c.s2 : win ? (dith(x, y, t*.85) ? c.q2 : c.q1) : c.s3); }
      for(let i=1; i<=sw; i++){ const x = sideRight ? x1 + i : x0 - i, wi = (j & 1) === 1 && i < sw;
        set(x, y, sideRight ? (wi ? c.q0 : c.s1) : (wi ? c.q1 : c.s3)); }
    }
    let y = yb - 1;
    for(let x=x0 - (sideRight ? 0 : sw); x<=x1 + (sideRight ? sw : 0); x++) set(x, y, x > x1 ? c.s2 : c.s4);   // cornice
    for(let j=0; j<gal; j++){ y--;                                                  // crown gallery: arched openings
      for(let x=x0 + 1; x<=x1 - 1; x++){ const i = x - x0;
        let col = i === 1 ? c.s4 : x === x1 - 1 ? c.s2 : c.s3;
        if(j < gal - 1 && i > 1 && x < x1 - 1 && (i & 1) === 0) col = c.q0;
        set(x, y, col); }
      if(sideRight) set(x1, y, c.s1); else set(x0, y, c.s3); }
    y--; for(let x=x0 + 1; x<=x1 - 1; x++) set(x, y, x === x1 - 1 ? c.s2 : c.s4);  // top of the crown
    // corner pinnacles
    for(const [x, col] of [[x0 + 1, c.s4], [x1 - 1, c.s2]]){ set(x, y - 1, col); if(kind !== 'strip') set(x, y - 2, col); }
    // the pointed roof (narrow, steep) and its spire
    const pw = Math.max(1, Math.min(2, hw - 3));
    for(let w=pw, n=0; w>=0; n++){ y--; for(let x=cxT - w; x<=cxT + w; x++) set(x, y, x < cxT ? c.s4 : x === cxT ? c.s3 : c.s2); if(n % 2 === 1 || w === 0) w--; }
    for(let i=0; i<sp; i++){ y--; set(cxT, y, i === sp - 1 ? c.g2 : c.s3); }
  };
  tower(-232, 28, 232, true, 'punch');    // Safa
  tower(234, 28, 232, false, 'punch');    // Marwah
  tower(-168, 31, 246, true, 'strip');    // Maqam
  tower(170, 31, 246, false, 'strip');    // Qibla
  tower(-100, 36, 276, true, 'punch');    // Hajar
  tower(102, 36, 279, false, 'punch');    // Zamzam

  /* ---------- the Makkah Royal Clock Tower */
  {
    const big = u >= .95;
    const hb = u >= 1.08 ? 6 : big ? 5 : 4, side = S1(2);
    const yBoxT = yA(462), yBoxB = yA(372);
    const st1 = yA(290), st2 = yA(200);
    // hotel shaft: steps out toward the podium; stone grid with a glazed bay up the middle
    const shaft = (hw, ya, yb) => {
      for(let y=ya; y<=yb; y++){ const j = y - ya, t = Math.max(0, 1 - (y - yTop)/(yBase - yTop));
        for(let x=tx - hw; x<=tx + hw; x++){ const i = x - tx + hw;
          const win = (i & 1) === 1 && (j & 1) === 1;
          set(x, y, i === 0 ? c.s4 : x === tx + hw ? c.s2 : win ? (dith(x, y, t) ? c.q2 : c.q1) : c.s3); }
        for(let x=tx + hw + 1; x<=tx + hw + side; x++) set(x, y, (j & 1) && x < tx + hw + side ? c.q0 : c.s1);
        set(tx - 1, y, c.q1); set(tx, y, (y & 1) ? c.q2 : c.q3); set(tx + 1, y, c.q0);
      }
    };
    shaft(hb + 2, st2, yLow);
    shaft(hb + 1, st1, st2 - 1);
    shaft(hb, yBoxB + 1, st1 - 1);
    for(const [y, hw] of [[st1, hb + 1], [st2, hb + 2]]) for(let x=tx - hw; x<=tx + hw + side; x++) set(x, y, x > tx + hw ? c.s2 : c.s4);
    // clock box: stone frame, green field, white face ringed in gold
    for(let y=yBoxT; y<=yBoxB; y++){
      for(let x=tx-hb; x<=tx+hb; x++) set(x, y, x === tx-hb ? c.s4 : x === tx+hb ? c.s2 : c.s3);
      for(let x=tx+hb+1; x<=tx+hb+side; x++) set(x, y, c.s1);
    }
    const cr = u >= 1.08 ? 4 : big ? 3 : 2, ccy = yBoxB - cr - 2;
    for(let y=yBoxT + 2; y<=ccy + cr + 1; y++) for(let x=tx - cr - 1; x<=tx + cr + 1; x++) set(x, y, c.n1);
    for(let x=tx - cr - 1; x<=tx + cr + 1; x++) set(x, yBoxT + 2, c.n2);
    // the band above the clock: abstract gold strokes on green (no letters)
    if(ccy - cr - 2 >= yBoxT + 3){ const y = Math.round((yBoxT + 3 + ccy - cr - 2)/2); for(let x=tx - cr; x<=tx + cr; x++) set(x, y, (x - tx + cr) % 3 === 2 ? c.n1 : c.g2); }
    const o2 = cr*cr + cr*.8, i2 = big ? (cr-1)*(cr-1) + (cr-1)*.8 : 2.1;
    for(let dy=-cr; dy<=cr; dy++) for(let dx=-cr; dx<=cr; dx++){ const d = dx*dx + dy*dy; if(d > o2) continue;
      set(tx+dx, ccy+dy, d <= i2 ? c.W : (dx + dy < 0 ? c.g3 : c.g1)); }
    if(big){ for(let i=1; i<=cr-1; i++) set(tx, ccy-i, c.k3); set(tx+1, ccy, c.k3); set(tx, ccy, c.k2); }
    else { set(tx, ccy, c.k3); set(tx, ccy-1, c.k3); }   // the hands, even when tiny
    // the side clock, edge-on in shadow
    for(let y=ccy - cr - 1; y<=ccy + cr + 1; y++) for(let x=tx+hb+1; x<=tx+hb+side; x++) set(x, y, c.n0);
    // corner pinnacles with gold tips
    const pinH = S1(4);
    for(const [x, col] of [[tx-hb, c.s4], [tx+hb, c.s2], [tx+hb+side, c.s1]]){
      for(let y=yBoxT-pinH; y<yBoxT; y++) set(x, y, col); set(x, yBoxT-pinH-1, c.g3); }
    // crown: a white stage with tall arched windows, then the faceted crown tapering in gold
    const yCone = yA(540), nC = yBoxT - yCone, hw0 = hb - 1, nWhite = Math.round(nC*.4);
    for(let i=0; i<nC; i++){
      const y = yBoxT - 1 - i, t = i/nC, hw = Math.max(0, Math.round(hw0*Math.pow(1 - t, .8)));
      const white = i < nWhite;
      for(let dx=-hw; dx<=hw; dx++){
        let col;
        if(white){
          col = dx === -hw ? c.W : dx === hw ? c.w1 : c.w4;
          if(i < nWhite - 1 && Math.abs(dx) < hw && ((dx + hw) & 1)) col = i === nWhite - 2 ? c.g2 : c.q1;
        } else col = dx === -hw ? c.g4 : (dx === hw && hw > 0) ? c.g1 : (hw > 1 && ((dx + hw) & 1)) ? c.g2 : c.g3;
        set(tx+dx, y, col);
      }
      if(white) set(tx+hw+1, y, c.w0);
      if(i === nWhite) for(let dx=-hw; dx<=hw; dx++) set(tx+dx, y, dx < 0 ? c.g4 : c.g3);
    }
    // spire with a bulb and the crescent (horns up)
    const cres = big ? ['#...#', '#...#', '.###.'] : ['#.#', '.#.'];
    cres.forEach((row, j) => { const hw = row.length >> 1; for(let i=0; i<row.length; i++) if(row[i] === '#') set(tx-hw+i, yTop+j, i < hw ? c.g3 : i === hw ? c.g2 : c.g1); });
    for(let y=yTop + cres.length; y<yCone; y++) set(tx, y, c.g2);
    { const y = Math.round((yTop + cres.length + yCone)/2); set(tx-1, y, c.g3); set(tx, y, c.g4); set(tx+1, y, c.g1); }
  }

  /* ---------- minarets of the Haram: square base, shafts with balconies, lantern, crescent */
  const minaret = (mx, top, bot) => {
    let y = top;
    const row = (hw, fn) => { for(let dx=-hw; dx<=hw; dx++) set(mx+dx, y, fn(dx, hw)); y++; };
    const tone = (dx, hw) => dx === -hw ? c.mW : dx === hw ? c.mS : c.mL;
    set(mx-1, y, c.g3); set(mx+1, y, c.g1); y++;                       // crescent
    set(mx, y, c.g2); y++;
    row(0, () => c.mL); row(1, tone);                                   // pointed cap
    row(1, dx => dx === 0 ? c.mD : dx < 0 ? c.mW : c.mS);              // open lantern
    if(u >= .95) row(1, dx => dx === 0 ? c.mD : dx < 0 ? c.mW : c.mS);
    row(2, (dx, hw) => dx === -hw ? c.W : dx === hw ? c.mM : c.mW);    // top balcony
    row(1, () => c.mD);
    const L = bot - y;
    const ring = () => { row(1, () => c.W); row(1, dx => dx < 0 ? c.mM : c.mD); };
    for(let i=0; i<Math.round(L*.3); i++) row(1, tone);
    ring();
    for(let i=0; i<Math.round(L*.3); i++) row(1, tone);
    ring();
    while(y <= bot) row(1, tone);
  };
  /* ---------- King Abdulaziz Gate: its top rises behind the far roofline, under the clock tower */
  {
    const g0 = tx - S(15), g1 = tx + S(15), gt = yRing - S(4), ct = gt - S1(2), cw = S(5);
    for(let y=gt; y<=yLow; y++) for(let x=g0; x<=g1; x++){
      const j = y - gt, i = x - g0;
      let col = i === 0 ? c.W : x === g1 ? c.w1 : c.w3;
      if(j === 0) col = c.W; else if(j === 1) col = c.w1;
      else if(j >= 2 && j <= 3 && i > 1 && x < g1 - 1 && (i - 2) % 3 === 1) col = j === 2 ? c.a3 : c.a2;
      set(x, y, col);
    }
    for(let x=g0; x<=g1; x += 2) set(x, gt - 1, c.w4);
    for(let y=ct; y<gt; y++) for(let x=tx - cw; x<=tx + cw; x++) set(x, y, x === tx - cw || y === ct ? c.W : x === tx + cw ? c.w1 : c.w3);
    for(let y=ct + 2; y<=yLow; y++){ const d = y - ct - 2; for(let x=tx - Math.min(2, d); x<=tx + Math.min(2, d); x++) set(x, y, x === tx - Math.min(2, d) ? c.a1 : c.a2); }
    set(tx, ct - 1, c.w4);
  }
  const mRise = Math.round((yBase - yA(277))*.7);         // minarets: a little over half the flanking towers
  minaret(tx - S(17), yRing - mRise, yLow);
  minaret(tx + S(17), yRing - mRise, yLow);
  minaret(Math.round(W*.13), yRing - mRise + S(2), yLow);
  minaret(Math.round(W*.86), yRing - mRise + S(1), yLow);
  minaret(Math.round(W*.94), yRing - mRise + S(3), yLow);

  /* ---------- the mosque round the mataf: every pixel is a ray against the court model.
     Offsets outward from the court's edge: portico face 0, dome rows 2.5 and 6, back of the
     portico 8.5, face of the mataf building 10, its back 34, the outer edge of the roof 120. */
  const OFF = [0, 2.5, 6, 8.5, 10, 34, 120], NO = OFF.length, LUTN = 40;
  const arcT = [], qLen = [];
  for(const o of OFF){ const A = A0 + o, B = B0 + o, t = new Float32Array(LUTN + 1); let px = A, pz = 0;
    for(let i=1; i<=LUTN; i++){ const th = i/LUTN*Math.PI/2, X = A*Math.pow(Math.cos(th), 2/P), Zr = B*Math.pow(Math.sin(th), 2/P);
      t[i] = t[i-1] + Math.hypot(X - px, Zr - pz); px = X; pz = Zr; }
    arcT.push(t); qLen.push(t[LUTN]); }
  const ZX = new Float32Array(NO*W), SX = new Float32Array(NO*W), TX = new Int8Array(NO*W), NX = new Float32Array(NO*W), NZ = new Float32Array(NO*W);
  const LX = -.92, LZ = -.38;                            // toward the morning sun (east = left, a little north)
  for(let x=0; x<W; x++){ const dxz = (x + .5 - cx)/f;
    for(let j=0; j<NO; j++){ const A = A0 + OFF[j], B = B0 + OFF[j];
      let Z, s, nx, nz;
      const Zs = dxz !== 0 ? (dxz < 0 ? cX - A : cX + A)/dxz : Infinity;
      if(Zs > 0 && Zs <= cZ){ Z = Zs; s = (qLen[j] + cZ - Z)*(dxz < 0 ? -1 : 1); nx = dxz < 0 ? 1 : -1; nz = 0; }
      else {
        let lo = cZ, hi = cZ + B;
        for(let i=0; i<22; i++){ const m = (lo + hi)/2, xr = Math.abs(dxz*m - cX)/A, zr = (m - cZ)/B; if(xr*xr*xr + zr*zr*zr < 1) lo = m; else hi = m; }
        Z = (lo + hi)/2;
        const Xr = dxz*Z - cX, xr = Math.min(1, Math.abs(Xr)/A), zr = Math.min(1, Math.max(0, (Z - cZ)/B));
        const th = Math.atan2(Math.pow(zr, P/2), Math.pow(xr, P/2)), fi = th/(Math.PI/2)*LUTN, i0 = Math.min(LUTN - 1, Math.floor(fi));
        s = (qLen[j] - (arcT[j][i0] + (arcT[j][i0+1] - arcT[j][i0])*(fi - i0)))*(Xr < 0 ? -1 : 1);
        const gX = Math.sign(Xr)*xr*xr/A, gZ = zr*zr/B, gl = Math.hypot(gX, gZ) || 1; nx = -gX/gl; nz = -gZ/gl;
      }
      const lit = nx*LX + nz*LZ;
      ZX[j*W + x] = Z; SX[j*W + x] = s; NX[j*W + x] = nx; NZ[j*W + x] = nz; TX[j*W + x] = lit > .6 ? 3 : lit > .15 ? 2 : lit > -.45 ? 1 : 0;
    } }

  // facade palettes by light: 0 shade (faces west), 1 dim, 2 faces us, 3 lit (faces east)
  const FP = [
    {L:c.w2, M:c.w1, O:c.a0, Dp:c.aD, K:c.w3, Pp:c.a3},
    {L:c.w3, M:c.w2, O:c.a1, Dp:c.a0, K:c.w4, Pp:c.a3},
    {L:c.w4, M:c.w3, O:c.a1, Dp:c.a0, K:c.W, Pp:c.w2},
    {L:c.W, M:c.w4, O:c.a2, Dp:c.a1, K:c.W, Pp:c.w3},
  ];
  // the east wing's shadow (sun ~45 degrees up): a point at height h within (33 - h) m of that wall
  const XL = cX - A0 - 10;
  let shd = false;
  const pset = (x, y, col) => set(x, y, shd ? shade(col) : col);
  const inWing = (X, h) => X - XL < (RING - h)*.92;
  // the Ottoman portico: pointed arches on slim columns (5 m bays)
  const portFace = (x, y, h, s, tn) => {
    const p = FP[tn], fb = fr(s/5 + .5), d = Math.abs(fb - .5);
    let col;
    if(h >= 7.4) col = p.K;
    else if(h >= 6.3) col = p.M;
    else {
      const hw = h < 4.5 ? .36 : .36*(1 - (h - 4.5)/1.8);
      if(d < hw){ col = fb < .44 ? p.Dp : p.O;
        if(h < 1.9){ const v = r(); if(v < .4) col = p.Pp; else if(v < .5) col = c.hd2; } }
      else col = fb < .5 ? p.L : p.M;
    }
    pset(x, y, col);
  };
  // its small domes, one per bay, lit from the left
  const domeD = s => (fr(s/5 + .5) - .5)*5;
  const domeH = s => { const dd = domeD(s); return Math.abs(dd) > 2.3 ? 0 : 3.1*Math.sqrt(1 - (dd/2.3)*(dd/2.3)); };
  // shaded by the sun on a round surface: along the wall, toward the court, and up
  const SUN = [-.92*.7, -.38*.7, .71];
  const dome = (x, y, hd, s, nx, nz) => { const a = Math.max(-1, Math.min(1, domeD(s)/2.3)), v = Math.max(0, Math.min(1, hd/3.1));
    const fw = Math.sqrt(Math.max(0, 1 - a*a - v*v*.6));
    const n0 = -nz*a + nx*fw, n1 = nx*a + nz*fw, n2 = v + .15, nl = Math.hypot(n0, n1, n2);
    const b = (n0*SUN[0] + n1*SUN[1] + n2*SUN[2])/nl;
    pset(x, y, b > .78 ? c.d4 : b > .58 ? c.d3 : b > .38 ? c.d2 : b > .18 ? c.d1 : c.d0); };
  // the mataf building: three tiers of pointed arches (7 m bays) behind railings with worshippers
  const ringFace = (x, y, h, s, tn) => {
    const p = FP[tn], fb = fr(s/7 + .5), d = Math.abs(fb - .5);
    let col;
    if(h >= 31) col = h >= 32.3 ? c.W : h >= 31.6 ? p.L : p.M;
    else {
      const L = Math.min(2, Math.floor(h/11)), hl = h - L*11;
      if(hl < .9) col = p.K;
      else {
        const hw = hl < 6.6 ? .33 : .33*(1 - (hl - 6.6)/2.4);
        if(d < hw){
          col = (hl > 5.6 || fb < .4) ? p.Dp : p.O;
          if(hl < 2.2){ const v = r(); if(v < .45) col = p.Pp; else if(v < .58) col = c.hd2; else if(v < .62) col = c.hd1; }
        } else col = fb < .5 ? p.L : p.M;
      }
    }
    pset(x, y, col);
  };

  // the Kaaba's morning shadow on the crowd (toward the west and a little south)
  const inQuad = (X, Z) => { let pos = 0, neg = 0;
    for(let i=0; i<4; i++){ const a = KP[i], b = KP[(i+1)&3], cr = (b[0] - a[0])*(Z - a[1]) - (b[1] - a[1])*(X - a[0]); if(cr > 0) pos++; else if(cr < 0) neg++; }
    return pos === 0 || neg === 0; };
  const inShadow = (X, Z) => { if(X < -12 || X > 15 || Z < D - 1 || Z > D + 15) return false;
    for(let t=0; t<=8; t+=.6) if(inQuad(X - t*.92, Z - t*.38)) return true; return false; };

  // the mataf floor and the crowd in tawaf: dense round the Kaaba, thinning outward; one pixel is
  // about a square metre, so heads and dark clothes are mid-tone specks among the white ihram,
  // gathered in short streaks along the circling rings
  const isFloor = new Uint8Array(W*H);
  const CLS = [[c.pW, c.pW, c.pW, c.pA], [c.pA, c.pA, c.pS, c.pW], [c.pS, c.pS, c.pG, c.pA]];
  const floorPx = (x, y, Z) => {
    const X = (x + .5 - cx)*Z/f, dX = X - kcX, dZ = Z - kcZ, rho = Math.hypot(dX, dZ);
    const dens = rho < 12 ? 1 : rho < 30 ? .98 : rho < 62 ? .98 - (rho - 30)*.008 : .72;
    // streaks of people walking together along the rings (2.6 m wide, 5.5 m long)
    const ring = Math.floor(rho/2.6), st = hsh(ring, Math.floor(Math.atan2(dZ, dX)*rho/5.5 + hsh(ring, 1)*7));
    const grey = (rho < 14 ? .35 : rho < 30 ? .22 : .16) + .1*Math.cos(rho*.75);
    let col;
    if(r() > dens) col = dith(x, y, .5) ? c.f3 : c.f2;
    else { const v = r(), hp = rho < 14 ? .12 : rho < 30 ? .08 : .05;
      if(v < hp) col = r() < .7 ? c.hd1 : c.hd2;
      else if(v < hp + .012) col = c.ab;
      else if(v < hp + .02) col = [c.cA, c.cB, c.cC][Math.floor(r()*3)];
      else col = CLS[st < grey ? 2 : st < grey + .38 ? 1 : 0][Math.floor(r()*4)]; }
    // shade: the Kaaba's, and the east wing's (sun about 45 degrees up, so as long as the wall is high)
    if(inShadow(X, Z) || inWing(X, 0)) col = shade(col);
    isFloor[y*W + x] = 1;
    set(x, y, col);
  };

  for(let y=yh + 1; y<H; y++){
    const q = (y + .5 - yh)/f, Zg = EYE/q, Zr = (EYE - RING)/q, Zo = (EYE - OUTR)/q;
    for(let x=0; x<W; x++){
      const dxz = (x + .5 - cx)/f;
      const s0 = SX[x], sEnd = -(qLen[0] - 30), port = s0 > sEnd;   // no portico along the Mas'a (left side)
      if(Zg <= (port ? ZX[x] : ZX[4*W + x])){ floorPx(x, y, Zg); continue; }
      if(port){
        const h0 = EYE - q*ZX[x];
        shd = TX[x] > 0 && inWing(dxz*ZX[x], h0);
        if(h0 <= PORT){ if(s0 < sEnd + 1.6) set(x, y, h0 >= 7.4 ? c.w4 : c.w2); else portFace(x, y, h0, s0, TX[x]); continue; }
        let hit = false;
        if(s0 >= sEnd + 1.6) for(const j of [1, 2]){ const hj = EYE - q*ZX[j*W + x] - PORT, sj = SX[j*W + x];
          if(hj <= domeH(sj)){ dome(x, y, hj, sj, NX[j*W + x], NZ[j*W + x]); hit = true; break; } }
        if(hit) continue;
        if(EYE - q*ZX[3*W + x] <= PORT){ pset(x, y, c.dr); continue; }
      }
      const h4 = EYE - q*ZX[4*W + x], s4 = SX[4*W + x];
      shd = TX[4*W + x] > 0 && inWing(dxz*ZX[4*W + x], h4);
      if(h4 <= RING && !(h4 > 32.3 && fr(s4/2.6) > .55)){ ringFace(x, y, h4, s4, TX[4*W + x]); continue; }
      if(Zr <= ZX[5*W + x]){ const v = r(); set(x, y, v < .03 ? c.hd1 : v < .1 ? c.pG : v < .3 ? c.pS : c.pA); continue; }
      if(Zo <= ZX[6*W + x]){ const v = r(); set(x, y, v < .04 ? c.pS : v < .07 ? c.o2 : c.o1); continue; }
    }
  }
  // nearest pilgrims: a few little figures stand out, a head over white ihram
  const yNear = Math.round(gy(136));
  for(let y=yNear; y<H + 1; y++) for(let x=0; x<W; x++){
    if(r() > .07 || !isFloor[Math.min(H-1, y)*W + x]) continue;
    const hd = r();
    set(x, y, c.pW); set(x, y - 1, hd < .35 ? c.ab : hd < .9 ? c.hd2 : c.sk2);
  }

  /* ---------- the Kaaba (north corner toward us; NE face with the door on the left, NW face right) */
  const KH = Math.max(10, Math.round(13*u));
  const LW = Math.max(8, Math.round(10.8*u)), RW = Math.max(3, Math.round(3.8*u));
  const kb = Math.round(gy(D));
  const riseL = 1, riseR = Math.max(2, Math.round(2.3*u));
  const baseAt = x => x <= cx ? kb - Math.round((cx - x)/LW*riseL) : kb - Math.round((x - cx)/RW*riseR);
  const topAt = x => baseAt(x) - KH;
  const kx0 = cx - LW, kx1 = cx + RW;
  for(let x=kx0; x<=kx1; x++){
    const b = baseAt(x), t = topAt(x), left = x < cx;
    for(let y=t; y<=b; y++){
      let col = left ? c.k2 : c.k0;
      if(left && x === kx0) col = c.k3;
      if(!left && x === cx) col = c.k1;
      set(x, y, col);
    }
    set(x, b + 1, left ? c.kb : c.w1);
  }
  // roof seen from above: marble grey inside the kiswa's dark rim
  for(let x=kx0; x<=kx1; x++){
    const t = topAt(x), dL = x - kx0, dR = kx1 - x;
    const tb = x <= kx0 + RW ? topAt(kx0) - Math.round(dL/RW*riseR) : topAt(kx1) - Math.round(dR/LW*riseL);
    for(let y=tb; y<t; y++) set(x, y, y === tb ? c.kR : c.kr);
    set(x, t, c.k3);
  }
  // the gold hizam band about a third of the way down
  const bandOff = Math.round(KH*.3), band2 = KH >= 12;
  for(let x=kx0; x<=kx1; x++){
    const y = topAt(x) + bandOff, left = x < cx;
    set(x, y, left ? c.g3 : c.g1);
    if(band2) set(x, y+1, left ? ((x - kx0) % 3 ? c.g2 : c.g0) : ((x - cx) % 3 ? c.g0 : c.k1));
  }
  // the gold door curtain on the north-east face, close to the Black Stone (left) corner
  { const dw = Math.max(2, Math.round(2.6*u)), dl = kx0 + Math.max(1, Math.round(1.6*u));
    for(let x=dl; x<dl+dw; x++){
      const tb = topAt(x) + bandOff + (band2 ? 3 : 2), bb = baseAt(x) - Math.max(2, Math.round(2.2*u));
      for(let y=tb; y<=bb; y++){ const i = x - dl;
        set(x, y, i === 0 ? c.g3 : i === dw-1 ? c.g1 : ((y - tb) % 3 === 1 ? c.g1 : c.g2)); }
    } }
  // the Black Stone's silver frame on the corner
  set(kx0, baseAt(kx0) - Math.max(2, Math.round(1.6*u)), c.sv);
  // pilgrims pressed against the walls hide the marble base and the lowest row
  for(let x=kx0; x<=kx1; x++) for(const dy of [0, 1]){
    const y = baseAt(x) + 1 - dy, yy = Math.min(H-1, y + 2);
    if(!isFloor[yy*W + x]) continue;
    const col = R.get(x, yy);
    if(dy === 0 || (col[0] < 200 && r() < .7)) set(x, y, col);
  }

  /* ---------- Hijr Ismail: a low white semicircular wall off the north-west face */
  { const ext = 8.5;
    for(let s=0; s<=64; s++){ const a = Math.PI*s/64;
      const along = (1 - Math.cos(a))/2*9.6, out = Math.sin(a)*ext;
      const X = along*.924 + out*.924 - .3, Z = D + along*.383 - out*.383 + .3;
      const x = Math.round(gx(X, Z)), y = Math.round(gy(Z));
      set(x, y - 1, c.W); if(a > .25 && a < 2.9) set(x, y, c.w1); }
  }
  /* ---------- Maqam Ibrahim: small gold-and-glass enclosure in front of the door face */
  { const x = Math.round(gx(-13.2, D - 6.3)), y = Math.round(gy(D - 6.3));
    set(x, y-4, c.g3);
    set(x-1, y-3, c.q3); set(x, y-3, c.W); set(x+1, y-3, c.q2);
    set(x-1, y-2, c.g3); set(x, y-2, c.q2); set(x+1, y-2, c.g1);
    set(x-1, y-1, c.g2); set(x, y-1, c.g2); set(x+1, y-1, c.g1);
    set(x-1, y, c.w2); set(x, y, c.w2); set(x+1, y, c.w1); }
};
})();
