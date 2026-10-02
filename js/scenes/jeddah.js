/* scenes/jeddah.js — today's Jeddah Corniche on the Red Sea, painted from a real kind of viewpoint:
   the raised Corniche promenade (eye about 10 m above the water), looking north out over the sea,
   with the coast and the North Corniche towers running away to the right.
   - left, out in the sea: King Fahd's Fountain, a very tall thin white jet; at its head the water
     breaks into a plume that the north wind leans to the left, and falls back as a soft veil of spray
     onto a mound of white water at its foot
   - right, just off the shore: the white Al-Rahma "floating" mosque on its piles: a turquoise main
     dome on a windowed drum, the ring of small white domes, pointed arched windows, one slim white
     minaret, and a low walkway back to the Corniche
   - behind, along the coast and fading into the sea haze: the real North Corniche skyline (the
     golden-glass Sumou twin towers on their sweeping podium, the white Burj Assila with its sail
     screens and open crown, the blue-glass Raffles tower with its wavy balconies, the Headquarters
     Business Park tower with its helipad), mid-rise hotels and flats, the low white city with its
     minarets, and the line of trees along the far Corniche
   - on the sea: a ship far out, a white motor yacht, a speedboat; in front, the Corniche's rocks,
     the paved promenade with lamp posts and benches, families out for a walk, a lawn and date palms.
   Sizes follow one camera: things on the water sit just below the horizon, far things are lighter,
   bluer and lower in contrast. Lit from the upper left. No outlines on architecture.
   Everything is drawn per pixel on the scene raster (one pixel grid). */
(() => {
'use strict';
const RGB = {};
const C = h => RGB[h] || (RGB[h] = hexRGB(h));
const BAY = [[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
const dz = (x, y, f) => f*16 > BAY[y&3][x&3] + .5;          // ordered-dither test
const hex2 = v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0');
const mixH = (a, b, t) => { const A = hexRGB(a), B = hexRGB(b); return '#' + A.map((v, i) => hex2(v + (B[i]-v)*t)).join(''); };

/* ---------- palette */
const SKY = ['#3a83cc', '#4a91d3', '#5f9fd9', '#7ab0df', '#97c2e4', '#b4d4e8', '#cde1e9', '#dee9e7'];
const HAZE = '#d6e4e7';
const SEA = ['#79a9c6', '#5b98c0', '#4189bb', '#3080b8', '#2b86bc', '#2d93c1', '#34a2c4', '#3db0c6'];
// materials, unhazed: L lit edge, F face (top), F2 face (bottom: glass reflects the pale horizon),
// D floor line / window / recess, X reflection streak, S side face (shade), S2 side windows, T roof edge / slab
const MATS = {
  B:{L:'#d6ecf3', F:'#4a83ad', F2:'#8dbcd6', D:'#5a8fb5', X:'#b5d6e7', S:'#3c6a8a', S2:'#355f7d', T:'#eef4f5'},   // blue glass
  G:{L:'#fff0c8', F:'#a9834a', F2:'#dcbf86', D:'#b9965c', X:'#f1ddaa', S:'#86683d', S2:'#775b34', T:'#f3e6c7'},   // golden glass
  A:{L:'#f4f8f9', F:'#89a4b9', F2:'#c3d4df', D:'#9cb3c5', X:'#dbe7ee', S:'#6d869c', S2:'#627a90', T:'#eef3f4'},   // silver glass
  W:{L:'#ffffff', F:'#eceee9', F2:'#e4e8e6', D:'#8fa3ad', X:'#ffffff', S:'#bfc8cb', S2:'#98a4a9', T:'#fbfbf7'},   // white render / fins
  D:{L:'#fbf0da', F:'#e3d2ad', F2:'#d9c7a1', D:'#a28d6b', X:'#f6ead0', S:'#bfa983', S2:'#9d896a', T:'#f6ecd6'},   // sand-coloured stone
};
const HZ = {};
const HP = (m, f) => { f = Math.round(f*20)/20; const key = m+f;
  if(!HZ[key]){ const o = {}; for(const c in MATS[m]) o[c] = mixH(MATS[m][c], HAZE, f);
    o.M = mixH(o.F, o.F2, .5); o.K = mixH(o.F, o.S, .45); o.LL = mixH(o.L, o.F2, .35);
    o.GT = [o.K, o.F, o.M, o.F2];                   // glass tones, top (deep sky reflected) to bottom (pale horizon)
    HZ[key] = o; }
  return HZ[key]; };
const WH = {hi:'#ffffff', base:'#f2f3ee', mid:'#e3e8e7', sh:'#c6d0d4', dk:'#9fb0b9'};   // the mosque's white
const WIN = {arch:'#8aa6b8', glass:'#5d88a3', rev:'#45708c', lite:'#7ea6bd'};          // its arched windows in shade
const TURQ = ['#1f6f7a', '#2a8b94', '#3aa8ab', '#5ec5c0', '#9ce1d8', '#d0f4ee'];
const GLD = ['#a8741c', '#e0ad3c', '#f7d97a'];
const PALM = {sp:'#8cc05e', hi:'#7fb455', mid:'#5a9645', lo:'#3f7d3a', dk:'#2e6634', bk:'#2a5c33', bk2:'#3a7438'};

SCENES.jeddah = k => {
  const {R, W, H} = k, r = k.r;
  const s = Math.min(W/224, H/134);
  const S = v => Math.max(1, Math.round(v*s));
  const P = (x, y, h) => R.set(x, y, C(h));
  const rect = (x, y, w, h, col) => { const c = C(col); for(let j=y; j<y+h; j++) for(let i=x; i<x+w; i++) R.set(i, j, c); };
  const hline = (x0, x1, y, col) => { const c = C(col); for(let x=x0; x<=x1; x++) R.set(x, y, c); };
  const vline = (x, y0, y1, col) => { const c = C(col); for(let y=y0; y<=y1; y++) R.set(x, y, c); };
  const sprite = (rows, map, x, y) => rows.forEach((row, j) => { for(let i=0; i<row.length; i++) if(row[i] !== '.') P(x+i, y+j, map[row[i]]); });
  // gradient with solid bands and short dithered transitions (the way a pixel artist shades a sky)
  const grad = (y0, y1, cols0, soft, steps) => {
    const cols = []; for(let i=0; i<steps; i++){ const t = i/(steps-1)*(cols0.length-1), a = Math.min(cols0.length-2, Math.floor(t)); cols.push(mixH(cols0[a], cols0[a+1], t - a)); }
    const n = cols.length - 1, rgb = cols.map(C);
    for(let y=y0; y<y1; y++){ const t = (y - y0)/Math.max(1, y1 - y0 - 1)*n, kk = Math.min(n-1, Math.floor(t));
      const f = Math.max(0, Math.min(1, (t - kk - .5)/soft + .5));
      for(let x=0; x<W; x++) R.set(x, y, dz(x, y, f) ? rgb[kk+1] : rgb[kk]); } };

  const hz = Math.round(H*.55);          // sea horizon
  const wall = Math.round(H*.775);       // coping of the promenade's sea wall
  const xs = Math.round(W*.405);         // where the far coast starts (it comes toward us on the right)
  const yShore = x => hz + Math.round(Math.pow(Math.max(0, (x - xs)/(W - xs)), 1.6)*S(6));

  /* ---------- sky: deep blue overhead to a pale sea haze; two gulls far off */
  grad(0, hz+1, SKY, .5, 14);
  for(const [gx, gy] of [[.43, .2], [.475, .25]]){ const x = Math.round(W*gx), y = Math.round(H*gy);
    P(x, y, '#f4f8fa'); P(x+1, y-1, '#f4f8fa'); P(x+2, y, '#a9bccb'); P(x+3, y-1, '#f4f8fa'); P(x+4, y, '#f4f8fa'); }

  /* ---------- the sea: hazy far, deep blue, turquoise over the shallows by the wall */
  grad(hz+1, wall, SEA, .55, 10);
  { let y = hz + 2;
    while(y < wall - 2){ const near = (y - hz)/(wall - hz);
      const hi = near < .2 ? '#8dbbd6' : near < .5 ? '#a3d2e7' : '#c4ecf5', lo = near < .5 ? '#3a7fa6' : '#2a84b3';
      let x = Math.floor(r()*S(9));
      while(x < W){ const len = 1 + Math.floor(r()*(1 + near*S(5)));
        hline(x, x+len-1, y, hi); if(near > .4 && len > 1) hline(x+1, x+len-1, y+1, lo);
        if(near > .6 && len > 3 && r() < .25) P(x + 1, y, '#ffffff');
        x += len + S(5) + Math.floor(r()*(S(9) + near*S(14))*(.55 + 1.1*x/W)); }
      y += 1 + Math.floor(r()*1.6 + near*3.4); } }

  /* ---------- the far shore: North Corniche towers, mid-rise blocks, the low city, the waterfront */
  // tower: x (fraction of W), front width, side width, height (px at 224 wide), material, haze, top, facade
  const tower = (fx, w, sw, h, m, f, top = 'flat', pat = 'glass') => {
    const p = HP(m, f);
    const x0 = Math.round(W*fx); w = S(w); sw = Math.max(1, Math.round(sw*s)); h = S(h);
    const base = yShore(x0) - 1, y0 = base - h + 1, tw = w + sw, xr = Math.max(1, Math.round(w*.4));
    const sl = Math.max(2, S(3.5)), lh = top === 'lattice' ? Math.max(3, S(4)) : 0;
    // glass: solid tone bands down the face, short dithers between them, floor lines one tone darker
    const gl = (x, y, row) => { const u = Math.min(2, Math.max(0, row/(h - 1)*2.2)), a = Math.floor(u);
      let idx = 1 + Math.min(2, a + (dz(x, y, Math.max(0, Math.min(1, (u - a - .5)/.35 + .5))) ? 1 : 0));
      if(row % 2 === 1 && row > 1) idx--; return idx; };
    for(let i=0; i<tw; i++){
      let t0 = y0;
      if(top === 'slopeL') t0 = y0 + Math.round((1 - i/(tw-1))*sl);
      if(top === 'slopeR') t0 = y0 + Math.round((i/(tw-1))*sl);
      if(top === 'round' && (i === 0 || i === tw-1)) t0 = y0 + 1;
      for(let y=t0; y<=base; y++){ const row = y - y0, x = x0 + i, front = i < w; let col;
        if(row < lh){                                   // an open crown: a frame with the sky showing through
          if(!(i === 0 || i === w-1 || i === tw-1 || row === 0 || row === 2)) continue;
          col = front ? (row === 0 ? p.T : i === 0 ? p.L : p.F) : p.S;
        } else if(front){
          if(pat === 'glass') col = i === 0 ? p.LL : p.GT[Math.min(3, gl(x, y, row) + (i === xr ? 1 : 0))];
          else if(pat === 'band') col = i === 0 ? p.L : row % 2 === 0 ? p.T : (i % 3 === 2 ? p.F : p.D);
          else if(pat === 'grid') col = i === 0 ? p.L : (row % 2 === 1 && i % 2 === 1 && i < w-1 && row > 1) ? p.D : p.F;
          else if(pat === 'wave'){ const bulge = i >= 1 && i <= w - 2 && (Math.floor(row/3) % 2) ? 1 : 0;   // undulating balcony slabs
            col = i === 0 ? p.LL : (row + bulge) % 3 === 0 && row > 0 ? p.T : p.GT[Math.max(1, gl(x, y, row) | 0)]; }
          else if(pat === 'fins'){ const up = 1 - row/h;              // sail screens: closed low down, opening up higher
            col = i === 0 ? p.L : ((i + row) % 2 === 0 && dz(i*3 + row, row, up*up*.8)) ? p.D : (row % 2 ? p.F2 : p.F); }
          if(y === t0 && row >= lh) col = p.T;
        } else {
          col = (pat === 'grid' ? (row % 2 === 1 && (i - w) % 2 === 1 && row > 1) : (row % 2 === 1 && row > 1)) ? p.S2 : p.S;
          if(pat === 'band' && row % 2 === 0) col = p.S;
        }
        P(x, y, col); } }
    if(top === 'heli'){                                  // the helipad disc on its short neck
      hline(x0 + 1, x0 + tw - 2, y0 - 1, p.S); hline(x0 - 1, x0 + tw, y0 - 2, p.T); P(x0 + tw, y0 - 2, p.S); }
    if(top === 'fins'){ const fh = S(2.5);               // architectural crown: the corners run up as thin fins
      vline(x0, y0 - fh, y0 - 1, p.L); vline(x0 + w - 1, y0 - fh + 1, y0 - 1, p.F); vline(x0 + tw - 1, y0 - fh + 1, y0 - 1, p.S); }
    if(top === 'box'){ hline(x0 + 1, x0 + Math.max(1, w - 2), y0 - 1, p.F); P(x0 + Math.max(2, w - 1), y0 - 1, p.S); }
    return {x0, y0, w: tw, base};
  };
  // far: the North Corniche towers (left = further away, hazier)
  tower(.418, 3, 1, 6, 'W', .62, 'flat', 'band');
  tower(.433, 3, 1, 9, 'D', .6, 'box', 'grid');
  tower(.452, 4, 1, 12, 'B', .55, 'flat', 'glass');                         // Raffles hotel wing
  tower(.472, 5, 1, 29, 'B', .4, 'fins', 'wave');                           // Raffles residences, wavy balconies
  tower(.503, 4, 1, 27, 'A', .42, 'heli', 'glass');                         // Headquarters Business Park
  tower(.527, 4, 1, 11, 'W', .5, 'box', 'band');
  // the Sumou twin towers on their sweeping podium
  { const a = tower(.548, 6, 2, 37, 'G', .38, 'slopeR', 'glass'), b = tower(.588, 5, 2, 34, 'G', .38, 'slopeL', 'glass');
    const p = HP('G', .4), ph0 = S(6), ph1 = S(4), xa = a.x0 + a.w, xb = b.x0 - 1;
    for(let x=xa; x<=xb; x++){ const t = (x - xa)/Math.max(1, xb - xa), top = a.base - Math.round(ph0 + (ph1 - ph0)*t*t) + 1;
      for(let y=top; y<=a.base; y++) P(x, y, y === top ? p.T : y === top + 1 ? p.L : (y - top) % 2 === 0 ? p.D : p.F2); } }
  tower(.622, 5, 2, 31, 'W', .4, 'lattice', 'fins');                       // Burj Assila
  tower(.655, 4, 1, 22, 'A', .4, 'flat', 'glass');
  tower(.672, 5, 2, 18, 'D', .38, 'box', 'band');
  // nearer: hotels and flats along the Corniche, mid-rise, sand and white with balconies, some glass;
  // only low blocks right behind the mosque, so its dome stands clear against the sky
  tower(.707, 5, 2, 9, 'W', .36, 'flat', 'band');
  tower(.735, 6, 2, 8, 'B', .34, 'flat', 'glass');
  tower(.765, 5, 2, 10, 'D', .34, 'box', 'grid');
  tower(.80, 6, 2, 17, 'W', .32, 'flat', 'band');
  tower(.838, 5, 2, 20, 'A', .32, 'box', 'glass');
  tower(.872, 7, 2, 12, 'D', .3, 'box', 'band');
  tower(.91, 5, 2, 16, 'W', .3, 'flat', 'grid');
  tower(.95, 7, 2, 13, 'D', .28, 'box', 'band');
  tower(.985, 6, 2, 17, 'B', .28, 'flat', 'glass');
  // the low city along the coast: white and sand blocks with window rows, roof boxes and a few minarets
  for(let pass=0; pass<2; pass++){ let x = xs - S(3) + pass*S(2);
    while(x < W){ const t = Math.max(0, (x - xs)/(W - xs));
      const bw = Math.max(2, Math.round((3 + r()*5)*s*(.65 + t*.7))), bh = Math.max(1, Math.round(((pass ? 2 : 3.5) + r()*3)*s*(.6 + t*.8)));
      const m = r() < .6 ? 'W' : 'D', p = HP(m, .56 - t*.24 - pass*.04), b = yShore(x) - 2 + pass, y0 = b - bh + 1;
      for(let y=y0; y<=b; y++) for(let i=0; i<bw; i++){ const row = y - y0;
        P(x+i, y, y === y0 ? p.T : i === bw-1 && bw > 3 ? p.S : i === 0 ? p.L : (row % 2 === 1 && i % 2 === 0 && bh > 2) ? p.D : p.F); }
      if(r() < .35) P(x + 1 + Math.floor(r()*(bw-1)), y0-1, p.S);
      x += bw + (r() < .2 ? S(1) : 0); } }
  for(const fx of [.448, .69, .925]){ const x = Math.round(W*fx), t = (x - xs)/(W - xs), b = yShore(x) - 3, mh = S(5 + t*4);
    const hi = mixH('#ffffff', HAZE, .45 - t*.2), sh = mixH('#c3ccd0', HAZE, .45 - t*.2);
    vline(x, b - mh, b, hi); vline(x+1, b - mh + 2, b, sh); P(x-1, b - mh + 2, hi); P(x+1, b - mh + 1, sh); P(x, b - mh - 1, sh); }
  // waterfront strip along the far Corniche: the trees and palms, the pale sea wall
  for(let x=xs - S(4); x<W; x++){ const y = yShore(x), t = Math.max(0, (x - xs)/(W - xs));
    P(x, y, mixH('#efeadb', HAZE, .5 - t*.25)); P(x, y-1, mixH('#4f8a52', HAZE, .6 - t*.3));
    if(t > .5) P(x, y+1, mixH('#c9c3b2', HAZE, .5)); }
  { let x = xs + S(1);
    while(x < W){ const t = (x - xs)/(W - xs), y = yShore(x) - 2, ph = 1 + Math.round(t*S(3)), dk = mixH('#2f6b40', HAZE, .55 - t*.3), tr = mixH('#8b7a62', HAZE, .5 - t*.25);
      if(r() < .35){ hline(x-1, x+1, y, dk); P(x, y-1, dk); }                       // a round shade tree
      else { vline(x, y - ph + 1, y, tr); P(x, y - ph, dk); P(x-1, y - ph + (t > .5 ? 1 : 0), dk); P(x+1, y - ph + (t > .5 ? 1 : 0), dk); }
      x += S(3) + Math.floor(r()*S(5)); } }

  // small boats moored off the far shore, by the marina near the mosque
  for(const fx of [.565, .585, .885]){ const x = Math.round(W*fx), y = yShore(x) + 1;
    hline(x, x + S(4), y, '#f4f7f8'); P(x + S(4), y, '#c9d4da'); hline(x + 1, x + S(2), y - 1, '#e3eaee'); P(x + 1, y + 1, '#8fc0da'); }

  /* ---------- a ship far out on the horizon */
  { const x0 = Math.round(W*.315), y = hz, hull = mixH('#4f6272', HAZE, .55), sup = mixH('#ffffff', HAZE, .4), box = [mixH('#b86a58', HAZE, .6), mixH('#5b84a8', HAZE, .6), mixH('#c9ad6a', HAZE, .6)];
    const L = S(12);
    hline(x0, x0 + L - 1, y, hull); hline(x0+1, x0 + L - 2, y+1, mixH('#3c5060', HAZE, .5));
    for(let x=x0+2; x<x0+L-S(3); x++) P(x, y-1, box[Math.floor((x - x0)/2) % 3]);
    vline(x0 + L - S(2), y - 3, y - 1, sup); P(x0 + L - S(2) - 1, y - 2, sup); P(x0 + L - S(2) - 1, y - 1, sup); }

  /* ---------- King Fahd's Fountain: drawn as see-through spray over the sky, in a few soft steps */
  {
    const fx = Math.round(W*.27), fb = hz + S(2), jt = hz - S(64);
    const bx0 = Math.max(0, fx - S(46)), bx1 = Math.min(W-1, fx + S(10)), by0 = Math.max(0, jt - S(8)), by1 = fb;
    const bw = bx1 - bx0 + 1, bh = by1 - by0 + 1;
    const D = new Float32Array(bw*bh);
    const dep = (x, y, v) => { x = Math.round(x) - bx0; y = Math.round(y) - by0; if(x < 0 || y < 0 || x >= bw || y >= bh) return; D[y*bw + x] += v; };
    // spray leaves the head of the jet, slows in the air, is carried left by the wind and falls
    const N = Math.round(1700*s), wind = -.17;
    for(let i=0; i<N; i++){
      const burst = r() < .12;                     // a few clots thrown higher: a ragged crown, not a ball
      let x = (r() - .5)*(burst ? 3 : 1.4), y = r()*5 - 1.5;
      let vx = .12 - r()*.5, vy = burst ? -.4 - r()*.55 : -r()*.5*Math.max(0, 1 - Math.abs(x + .2)/1.1);
      const big = r(), vt = .28 + big*big*.95, w = .4 + big;
      for(let n=0; n<360; n++){
        vx += (wind - vx)*.028; vy = Math.min(vt, vy + .024);
        x += vx; y += vy;
        const py = jt + y*s; if(py >= fb) break;
        dep(fx + x*s, py, w); } }
    // soften into clouds of spray (two box blurs), then scale by the dense head of the plume
    const blur = A => { const O = new Float32Array(A.length);
      for(let y=0; y<bh; y++) for(let x=0; x<bw; x++){ let t = 0, c = 0;
        for(let j=-1; j<=1; j++) for(let i=-1; i<=1; i++){ const xx = x+i, yy = y+j; if(xx < 0 || yy < 0 || xx >= bw || yy >= bh) continue; t += A[yy*bw + xx]; c++; }
        O[y*bw + x] = t/c; } return O; };
    const A = blur(blur(D));
    const vals = []; for(let i=0; i<A.length; i++) if(A[i] > 0) vals.push(A[i]); vals.sort((a, b) => a - b);
    const ref = vals.length ? vals[Math.floor(vals.length*.97)] : 1;
    // falling water hangs in long streaks: vary the veil column by column below the head
    { const st = []; let v = 1; for(let x=0; x<bw; x++){ v = .55*v + .45*(.6 + r()*.8); st.push(v); }
      for(let y=0; y<bh; y++){ const yy = y + by0, f = Math.max(0, Math.min(1, (yy - jt - S(9))/S(10)));
        if(f > 0) for(let x=0; x<bw; x++) A[y*bw + x] *= 1 + (st[x] - 1)*f; } }
    // the mist cloud where the water falls back at the foot of the jet
    const mrx = S(9), mry = S(5);
    for(let y=fb - mry; y<=fb; y++) for(let x=fx - mrx - S(4); x<=fx + mrx - S(3); x++){
      const ex = (x - (fx - S(2)))/mrx, ey = (fb - y)/mry, e = 1 - ex*ex - ey*ey;
      if(e > 0){ const i = (y - by0)*bw + (x - bx0); if(i >= 0 && i < A.length) A[i] += e*1.1*ref; } }
    // paint: blend the sky toward white in 4 steps; dither only between neighbouring steps
    const LV = [0, .22, .45, .7, .93], WHT = C('#ffffff'), SHD = C('#dde8ee');
    for(let y=by0; y<=by1; y++) for(let x=bx0; x<=bx1; x++){ const v = Math.min(1, A[(y - by0)*bw + (x - bx0)]/ref); if(v < .04) continue;
      const q = Math.pow(v, .8)*4, lo = Math.min(3, Math.floor(q)), a = dz(x, y, q - lo) ? LV[lo + 1] : LV[lo]; if(!a) continue;
      const bg = R.get(x, y), tg = x > fx ? SHD : WHT;
      R.set(x, y, [bg[0] + (tg[0] - bg[0])*a, bg[1] + (tg[1] - bg[1])*a, bg[2] + (tg[2] - bg[2])*a].map(Math.round)); }
    // the jet itself: a straight white column, lit on the left, a touch of shade on the right
    for(let y=jt + S(3); y<=fb; y++){ P(fx-1, y, '#ffffff'); P(fx, y, (y - jt) < S(10) ? '#f4f8f9' : '#e2ecf1'); }
    // its head: where the jet tops out the water piles into a frothy crown, leaning downwind
    for(const [ox, oy, rr] of [[-.5, 2.2, 1.7], [-2.6, 3.4, 2], [-4.6, 5.6, 1.6], [-1.4, 5.2, 1.4]]){
      const cx = fx + ox*s, cy = jt + oy*s, rad = rr*s;
      for(let y=Math.floor(cy - rad); y<=Math.ceil(cy + rad); y++) for(let x=Math.floor(cx - rad); x<=Math.ceil(cx + rad); x++){
        const dx = x - cx, dy = y - cy; if(dx*dx + dy*dy > rad*rad + .3) continue;
        P(x, y, dx + dy*.6 > rad*.45 ? '#e3edf2' : '#ffffff'); } }
    // white water at the foot, the grey service platform barely showing
    for(let x=-S(6); x<=S(4); x++){ const a = Math.abs(x + .5)/S(5.5);
      P(fx+x, fb, a < .75 ? '#ffffff' : '#d7ebf3'); if(a < 1) P(fx+x, fb+1, a < .3 ? '#9fb1ba' : '#a8d2e4'); }
    // where the veil of spray comes down, a pale patch on the water
    for(let x=fx - S(26); x<fx - S(5); x++){ const t = (x - (fx - S(26)))/S(21); if(dz(x, fb, Math.sin(Math.PI*t)*.5)) P(x, fb, '#a9d3e6'); }
    // its reflection, broken by the ripples
    for(let y=fb+2; y<fb+S(8); y++) if((y & 1) === 0) hline(fx-1 + ((y>>1) & 1), fx + ((y>>1) & 1), y, '#8fc3dd');
  }

  /* ---------- boats: a white motor yacht heading left and a speedboat with its wake */
  { const yx = Math.round(W*.47), yy = hz + S(4);
    const rows = s < .9 ? ['....wW....', '..WwkkkW..', 'WWWWWWWWWW', '.gggggggg.'] : ['......wW......', '....WwkkkW....', '..WwkkkkkkwwW.', 'WWWWWWWWWWWWWW', '.ggggggggggggg'];
    const map = {W:'#ffffff', w:'#e3eaee', k:'#3c5468', g:'#b9c7cf'};
    sprite(rows, map, yx, yy - rows.length + 1);
    const L = rows[0].length; hline(yx + L, yx + L + S(4), yy, '#cfe8f2'); hline(yx + L + S(2), yx + L + S(8), yy + 1, '#9fcfe5'); P(yx - 1, yy, '#e4f4fa'); }
  { const bx = Math.round(W*.405), by = hz + S(13);
    const rows = s < .9 ? ['..k...', 'WWWWW.', '.ggg..'] : ['...kk...', 'WWWWWWW.', '.ggggg..'];
    sprite(rows, {W:'#ffffff', k:'#2f3e4e', g:'#c5d2d8'}, bx, by - rows.length + 1);
    const L = rows[0].length;
    for(let i=0; i<S(16); i++){ const sp = Math.floor(i/4); P(bx + L - 1 + i, by - sp, i < S(5) ? '#ffffff' : '#d6eff7'); if(i > 3) P(bx + L - 1 + i, by + 1 + Math.floor(sp*.5), '#a9daec'); } }

  /* ---------- Al-Rahma mosque on its piles just off the shore */
  {
    const mx = Math.round(W*.745), ywl = hz + S(10);
    const pitch = 5, n = Math.max(4, Math.round(S(37)/pitch)), bw = n*pitch + 2;      // the facade is laid out on its windows
    const x0 = mx - (bw >> 1), x1 = x0 + bw - 1, sd = S(3);                         // sd: the side wall, in shade, receding right
    const pil = S(2), deck = ywl - pil - 1, hallH = S(10), top = deck - hallH;
    // reflection in the water: a few broken pale streaks
    for(let y=ywl+1; y<=ywl+S(4); y++){ let x = x0 + Math.floor(r()*3);
      while(x < x1 + sd){ const len = 2 + Math.floor(r()*4); if(y < ywl + S(4) || r() < .5) hline(x, Math.min(x1 + sd, x + len - 1), y, y === ywl+1 ? '#b3d9e9' : '#93c6dd'); x += len + 1 + Math.floor(r()*3); } }
    // walkway back to the Corniche (a low white wall on piles, receding to the right)
    { const wx0 = x1 + sd + 1, wx1 = Math.round(W*.93), y0 = deck + 1, y1 = yShore(wx1) + 1;
      for(let x=wx0; x<=wx1; x++){ const t = (x - wx0)/(wx1 - wx0), y = Math.round(y0 + (y1 - y0)*t);
        P(x, y, '#f4f6f2'); P(x, y+1, '#b8c6cc'); if(x % S(4) === 0 && t < .8) P(x, y+2, '#c7d4d9'); } }
    // piles in the shade under the hall
    for(let y=ywl-pil; y<ywl; y++) for(let x=x0+1; x<x1+sd; x++) P(x, y, '#2e6a8a');
    for(let x=x0+2; x<x1+sd; x+=S(4)){ vline(x, ywl-pil, ywl-1, x > x1 ? '#7fa1b4' : '#a9c3cf'); }
    hline(x0+1, x1+sd-1, ywl, '#5aa3c6');
    // deck slab
    hline(x0-1, x1+sd, deck, WH.hi); hline(x1+1, x1+sd, deck, WH.sh);
    // the hall: white walls, a cornice, pointed arched windows; its right side in shade
    for(let y=top; y<deck; y++){ for(let x=x0; x<=x1; x++) P(x, y, x === x0 ? WH.hi : WH.base); for(let x=x1+1; x<=x1+sd; x++) P(x, y, WH.sh); }
    hline(x0, x1, top, WH.hi); hline(x0, x1, top + 1, WH.mid); hline(x1+1, x1+sd, top + 1, WH.dk);
    hline(x0, x1, deck - 1, WH.mid); hline(x1+1, x1+sd, deck - 1, WH.dk);
    { const ay = top + S(3), ab = deck - 2;
      for(let i=0; i<n; i++){ const ax = x0 + 2 + i*pitch;
        P(ax+1, ay, WIN.arch);
        for(let y=ay+1; y<=ab; y++){ P(ax, y, y === ay+1 ? WIN.arch : WIN.rev); P(ax+1, y, y === ay+1 ? WIN.lite : WIN.glass); P(ax+2, y, y === ay+1 ? WIN.arch : WIN.glass); } }
      for(let x=x1+2; x<x1+sd; x+=2) vline(x, ay+1, ab, WH.dk); }
    // parapet, and the ring of small white domes sitting over the piers between the windows
    hline(x0, x1, top-1, WH.hi); hline(x1+1, x1+sd, top-1, WH.sh);
    for(let i=0; i<=n; i++){ const dx = x0 + i*pitch;
      P(dx, top-2, WH.hi); P(dx+1, top-2, WH.mid); P(dx+2, top-2, WH.dk); P(dx+1, top-3, WH.hi); P(dx+2, top-3, WH.sh); }
    for(let x=x1+2; x<x1+sd; x+=2){ P(x, top-2, WH.sh); P(x+1, top-2, WH.dk); }
    // drum with little windows, under the turquoise main dome
    const dr = S(7.6), dcx = mx, drumH = S(3), dTop = top - 1 - drumH;
    for(let y=dTop; y<top-1; y++) for(let x=dcx-dr+1; x<=dcx+dr-1; x++){
      const i = x - (dcx-dr+1), dw = dr*2 - 1; P(x, y, i === 0 ? WH.hi : i >= dw-2 ? WH.sh : (y > dTop && i % 2 === 0 && i > 1 && i < dw-2) ? WIN.glass : WH.base); }
    hline(dcx-dr, dcx+dr, dTop, WH.hi); P(dcx+dr, dTop, WH.sh);
    const dh = Math.round(dr*1.1), dBase = dTop - 1;
    for(let row=0; row<=dh; row++){ const v = row/dh, hw = dr*Math.sqrt(Math.max(0, 1 - v*v))*(1 - .14*v*v*v);
      const m = Math.round(hw);
      for(let x=-m; x<=m; x++){ const nx = m ? x/(m + .5) : 0, l = -nx*.7 + v*.55 + .05;
        P(dcx+x, dBase-row, l > .8 ? TURQ[5] : l > .5 ? TURQ[4] : l > .2 ? TURQ[3] : l > -.15 ? TURQ[2] : l > -.45 ? TURQ[1] : TURQ[0]); } }
    vline(dcx, dBase-dh-S(2), dBase-dh-1, GLD[1]); P(dcx, dBase-dh-S(2)-1, GLD[2]);
    // the slim white minaret at the seaward corner: shaft, balcony, upper shaft, pointed cap, finial
    const mnx = x0 + 1, mTop = ywl - S(50), bal = mTop + Math.round((top - mTop)*.3);
    for(let y=mTop; y<deck-1; y++){ if(y === bal || y === bal+1) continue; P(mnx-1, y, WH.hi); P(mnx, y, y < top ? WH.base : WH.mid); P(mnx+1, y, WH.sh); }
    hline(mnx-1, mnx+1, Math.round(bal + (top - bal)*.55), WH.mid);
    hline(mnx-2, mnx+2, bal, WH.hi); P(mnx+2, bal, WH.sh); hline(mnx-2, mnx+2, bal+1, WH.dk); P(mnx-2, bal+1, WH.sh);
    hline(mnx-1, mnx+1, mTop, WH.hi);
    P(mnx-1, mTop-1, WH.hi); P(mnx, mTop-1, WH.base); P(mnx+1, mTop-1, WH.sh);
    P(mnx, mTop-2, WH.mid); P(mnx, mTop-3, WH.sh); P(mnx, mTop-4, GLD[1]); P(mnx, mTop-5, GLD[2]);
  }

  /* ---------- the Corniche: the rocks at the water's edge, the coping, paving in perspective, a lawn */
  { // the boulders of the breakwater: irregular, each with a sunlit facet and a shaded one, foam between
    let x = -2;
    while(x < W){ const bwid = S(3) + Math.floor(r()*S(5)), bh = S(2) + Math.floor(r()*S(2.6)), pk = Math.floor(bwid*(.2 + r()*.45));
      for(let i=0; i<bwid; i++){ const d = Math.abs(i - pk)/Math.max(1, bwid*.65), hc = Math.max(1, Math.round(bh*(1 - d*d*.75))), yT = wall - hc;
        for(let y=yT; y<wall; y++){ let col;
          if(i < pk) col = y === yT ? '#e9e2d3' : '#c9c0ac';
          else if(i === pk) col = y === yT ? '#ddd5c4' : '#bab19d';
          else col = y === yT ? '#bdb4a0' : '#9b927e';
          if(i === bwid-1 && i > pk) col = '#7d7564';
          if(y === wall-1 && y > yT) col = i > pk ? '#7d7564' : '#a39a85';
          P(x+i, y, col); } }
      if(r() < .55){ P(x + bwid, wall - 1, '#e8f7f8'); if(r() < .5) P(x + bwid, wall - 2, '#c9eef3'); }
      x += bwid - (r() < .35 ? 1 : 0) + (r() < .25 ? 1 : 0); } }
  hline(0, W-1, wall, '#fbfaf4'); hline(0, W-1, wall+1, '#e6dfcf'); hline(0, W-1, wall+2, '#c8bea8');
  const lawnTop = H - S(8), vx = W*.5;
  { const rows = []; let y = wall + 3, g = S(2.2); while(y < lawnTop){ rows.push(y); y += Math.round(g); g += .9*s; }
    for(let y=wall+3; y<lawnTop; y++){ const ri = rows.filter(v => v <= y).length - 1, isJ = rows.includes(y);
      const band = ri === 2, tile = band ? '#d6c3ae' : '#ece5d6', tile2 = band ? '#cfbba5' : '#e7dfcf', jnt = band ? '#bda892' : '#dad1bf';
      const sp = S(11)*(y - hz)/(wall - hz);
      for(let x=0; x<W; x++){ const cell = Math.floor((x - vx)/sp); P(x, y, isJ ? jnt : ((cell + ri) & 1) ? tile2 : tile); }
      if(!isJ) for(let j=-30; j<=30; j++){ const x = Math.round(vx + j*sp); if(x >= 0 && x < W) P(x, y, jnt); } } }
  // lawn with a kerb
  hline(0, W-1, lawnTop, '#d8d1c1'); hline(0, W-1, lawnTop+1, '#b8b09c');
  for(let y=lawnTop+2; y<H; y++) for(let x=0; x<W; x++){ const n = r();
    P(x, y, n < .08 ? '#8cc461' : n < .16 ? '#4f8a3c' : dz(x, y, .35) ? '#62a04a' : '#6fae52'); }

  /* ---------- lamp posts along the wall */
  const lamp = (x, h) => { x = Math.round(x); const b = wall + S(4);
    hline(x+1, x+S(5), b+1, '#d3c9b5');
    rect(x-1, b-1, 3, 2, '#55606c'); vline(x, b-h, b-2, '#6b7682'); vline(x-1, b-h+S(3), b-S(3), '#8d98a3');
    hline(x-S(3), x+S(3), b-h, '#55606c'); P(x, b-h-1, '#55606c');
    for(const lx of [x-S(3), x+S(3)]){ P(lx, b-h+1, '#55606c'); P(lx, b-h+2, '#f6e7b0'); } };
  lamp(W*.36, S(19)); lamp(W*.625, S(19));
  // benches facing the sea (seen from behind), a couple sitting on one
  const bench = (x, y, sitters) => { x = Math.round(x); const bwid = S(8);
    hline(x+1, x+bwid+1, y+2, '#d6ccb8');
    hline(x, x+bwid-1, y-1, '#7a5a3a'); hline(x, x+bwid-1, y, '#a27a4e'); P(x, y+1, '#55606c'); P(x+bwid-1, y+1, '#55606c');
    if(sitters){ const hy = y - 3;
      P(x+1, hy, '#ffffff'); hline(x, x+2, hy+1, '#ffffff'); hline(x, x+2, hy+2, '#e6eaea');
      P(x+5, hy, '#22232a'); hline(x+4, x+6, hy+1, '#22232a'); hline(x+4, x+6, hy+2, '#2c2d36'); } };
  bench(W*.25, wall + S(7), true); bench(W*.83, wall + S(7), false);

  /* ---------- people out for a walk (tiny, no faces) */
  const person = (rows, x, y) => { const map = {W:'#ffffff', w:'#f1f3f1', v:'#cfd6d8', s:'#c08e66', k:'#22232a', K:'#3d3f4c', h:'#3b2a22', r:'#e0574a', R:'#b8443a', b:'#3f86c4', y:'#f2c14e'};
    const hh = rows.length; hline(x+1, x + rows[0].length + 1, y + hh, '#d6ccb8');
    sprite(rows, map, x, y); };
  { const big = s >= .9, py = wall + S(13);
    const man = big ? ['.W.', 'WsW', 'www', 'wwv', 'wwv', 'wwv', 'wwv', 'k.k'] : ['.W.', 'www', 'wwv', 'wwv', 'wwv', 'k.k'];
    const wom = big ? ['.k.', 'kkk', 'kKk', 'kkK', 'kkK', 'kkK', 'kkK'] : ['.k.', 'kkK', 'kkK', 'kkK', 'kkK'];
    const kid = big ? ['.h.', 'rrR', 'rrR', 'bbb', 'b.b'] : ['.h.', 'rR', 'bb'];
    const fx = Math.round(W*.47);
    person(man, fx, py - man.length); person(wom, fx + 4, py - wom.length); person(kid, fx + 8, py - kid.length);
    const kid2 = big ? ['.h.', 'yyy', 'yyy', 'bbb', 'b.b'] : ['.h.', 'yy', 'bb'];
    const py2 = wall + S(18);
    person(man, Math.round(W*.75), py2 - man.length); person(kid2, Math.round(W*.75) + 4, py2 - kid2.length);
    person(wom, Math.round(W*.565), wall + S(10) - wom.length); person(kid, Math.round(W*.565) + 4, wall + S(10) - kid.length); }

  /* ---------- date palms on the lawn, framing the view */
  const palm = (bx, h, lean, seed) => {
    bx = Math.round(bx); const base = H - 1, tw = Math.max(3, S(3.4));
    for(let i=0; i<S(14); i++) P(bx + 2 + i, base - (i >> 3), '#4a8139');          // shadow on the lawn
    let cx = bx, cy = base - h, pox = 0;
    for(let y=base; y>=base-h; y--){ const d = (base - y)/h, ox = Math.round(lean*d*d*S(6));
      // where the leaning trunk steps over by a pixel, the step row spans both columns so the trunk bends, not breaks
      const a = Math.min(ox, pox), b = Math.max(ox, pox) + tw - 1;
      for(let x=bx + a; x<=bx + b; x++){ const i = x === bx + a ? 0 : x === bx + b ? tw-1 : 1;
        let col = i === 0 ? '#b08a60' : i === tw-1 ? '#5f4530' : '#8b6a48';
        if(((y*2 + (x - bx - ox) + seed) % 5) === 0) col = i === 0 ? '#93714d' : i === tw-1 ? '#4d3826' : '#6b4f36';   // leaf-base scars
        P(x, y, col); }
      pox = ox; cx = bx + ox + (tw >> 1); cy = y; }
    // a few old fronds hanging dry under the crown
    for(const [dx, len] of [[-2, S(6)], [1, S(7)], [3, S(5)]]) for(let j=1; j<=len; j++) P(cx + dx + Math.round(j*dx*.25), cy + j, j > len - 2 ? '#7a5c34' : '#9a7a48');
    // fronds: [angle from straight up (deg), length factor, front?]
    const L = h*.42;
    const FR = [[-150, .7, 0], [150, .7, 0], [-120, .85, 0], [125, .85, 0], [180, .5, 0],
                [-95, 1, 1], [95, 1, 1], [-62, 1, 1], [62, .95, 1], [-28, .85, 1], [25, .85, 1], [-3, .7, 1]];
    for(const [deg, lf, front] of FR){ const a = (deg + seed*7)*Math.PI/180, len = L*lf;
      const dx = Math.sin(a), dy = -Math.cos(a), g = .5;          // spine: out along the angle, bending down under its weight
      const nn = Math.ceil(len*1.5); let px0 = cx, py0 = cy;
      for(let i=1; i<=nn; i++){ const t = i/nn;
        const x = cx + dx*len*t, y = cy + dy*len*t + g*len*t*t;
        let tx = x - px0, ty = y - py0; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl; px0 = x; py0 = y;
        // leaflets: long ones hanging below the spine, short ones above, alternating for a feathery edge
        const lmax = S(3.4)*Math.sin(Math.PI*Math.min(1, .1 + t*.95));
        const side = tx >= 0 ? 1 : -1;                                // which normal points down
        let nx = -ty*side, ny = tx*side; if(ny < 0){ nx = -nx; ny = -ny; }
        const lo = Math.round(lmax*(i % 2 ? 1 : .55)), up = Math.round(lmax*(i % 2 ? .25 : .55));
        if(t > .1){
          for(let j=1; j<=lo; j++){ const lx = Math.round(x + (nx*.7 + tx*.6)*j), ly = Math.round(y + (ny*.7 + ty*.6 + .35)*j);
            P(lx, ly, !front ? PALM.bk : j === lo ? PALM.dk : PALM.lo); }
          for(let j=1; j<=up; j++){ const lx = Math.round(x + (-nx*.6 + tx*.7)*j), ly = Math.round(y + (-ny*.6 + ty*.7)*j);
            P(lx, ly, !front ? PALM.bk2 : dx < .3 ? PALM.hi : PALM.mid); } }
        P(Math.round(x), Math.round(y), !front ? PALM.bk2 : dx < .2 ? PALM.sp : PALM.hi); } }
    rect(cx-1, cy-1, 3, 2, PALM.lo); P(cx-1, cy-1, PALM.mid);
  };
  // bougainvillea bushes at the palms' feet
  const bush = (x, w) => { x = Math.round(x); const hh = Math.max(3, Math.round(w*.6)), by = H;
    for(let y=-hh; y<=0; y++) for(let i=-w; i<=w; i++){ const e = (i*i)/(w*w) + (y*y)/(hh*hh); if(e > 1) continue;
      const lit = (i + y*1.4) < -w*.2, n = r();
      let col = lit ? '#5e9a45' : '#3f7d3a'; if(e > .8 && !lit) col = '#2e6634';
      if(y < -1 && n < (lit ? .55 : .35)) col = n < .18 ? '#f48cc0' : lit ? '#e2559b' : '#b8357a';
      P(x+i, by+y, col); } };
  bush(W*.15, S(8)); bush(W*.85, S(7));
  palm(W*.06, S(66), -.6, 0);
  palm(W*.945, S(60), .6, 1);
};
})();
