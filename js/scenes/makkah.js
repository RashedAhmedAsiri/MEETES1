/* scenes/makkah.js — modern Makkah: Masjid al-Haram today.
   The Kaaba (black kiswa, gold band, gold door, Hijr Ismail, Maqam Ibrahim) on the
   white marble mataf with a ring of white-clad pilgrims in tawaf, the Ottoman portico
   with its small domes, the white arcades and tall minarets of the Haram, and behind
   them the Abraj Al Bait (the slender Makkah Royal Clock Tower, its clock two thirds of
   the way up and the crown and golden crescent above it, rising well above its stone
   hotel towers), more stone hotels and the city on the granite hills. Everything is drawn per pixel on the scene raster (one pixel grid). */
(() => {
'use strict';
const HEX = {
  // gold
  g0:'#9a6414', g1:'#c98a1a', g2:'#e3a92e', g3:'#f7c948', g4:'#fff0a0',
  // green
  n0:'#0a4a2a', n1:'#0e6b3a', n2:'#1f8f4e',
  // Abraj stone
  s0:'#b3a58a', s1:'#cfc3aa', s2:'#e6ddca', s3:'#f6f0e2',
  // glass
  q0:'#4a6878', q1:'#647f8e', q2:'#8aa3ae',
  // other hotels (cooler stone)
  o0:'#b2a994', o1:'#cdc4b0', o2:'#e3dccb', o3:'#f2ede1', oq:'#7d8e94', oq2:'#9aa8ab',
  // Haram marble
  w0:'#bcb29b', w1:'#d8cfbd', w2:'#ede7da', w3:'#f8f5ee', W:'#ffffff',
  // arcade shade
  a0:'#8f8672', a1:'#a99f89', a2:'#c3b9a3',
  // portico domes
  d0:'#9aa3a8', d1:'#c3cace', d2:'#e4e9ec',
  // hills
  h1:'#9d8b75', h2:'#b8a68c', h3:'#ccbca2',
  // houses on the hills
  c0:'#c0b092', c1:'#dbcfb6', c2:'#e9e0cc', c3:'#9a8a6e',
  // mataf floor
  f0:'#d9d2c3', f1:'#e6e0d4',
  // kaaba
  k0:'#0e0e11', k1:'#17171b', k2:'#232329', k3:'#34343c', kr:'#4b4f5c', kb:'#d0d7da',
  // pilgrims
  pw:'#ffffff', ps:'#d6d0c4', p1:'#a8744a', p2:'#7a4e2e', p3:'#c98f62',
  ink:'#1b1e2b',
};
const C = {}; for(const k in HEX) C[k] = hexRGB(HEX[k]);

SCENES.makkah = k => {
  const {R, W, H} = k, r = k.r, c = C;
  const set = (x,y,col) => R.set(x,y,col);
  const rect = (x,y,w,h,col) => { for(let j=0;j<h;j++) for(let i=0;i<w;i++) R.set(x+i,y+j,col); };
  const big = H >= 125;

  /* ---------- layout (all relative to W, H) */
  const yFloor = Math.round(H*.655);           // mataf floor starts here
  const sh = big ? 6 : 5, dh = big ? 4 : 3;      // arcade storey height, portico dome height
  const yArc = yFloor - (2 + sh + dh + sh);      // top of the Haram arcade
  const tx = Math.round(W*.42);                  // clock tower axis
  const cr = Math.max(3, Math.round(H/36));      // clock face radius: the 43 m clock is small against the 601 m tower
  const hb = cr + 1;                             // clock box half width (the shaft is as wide as the clock)
  const sw = Math.max(2, Math.round(cr*.6));     // side (shadow) face width
  const cy = Math.round(H*.25);                  // clock centre, about two thirds of the way up

  /* ---------- sky */
  R.bands(0, yFloor, ['#4fa4d8','#6db7e3','#95cdec','#c5e6f3']);

  /* ---------- hills: far hazy range, nearer range with houses */
  const noise = []; { let v = 0, h = 0; for(let x=0;x<W;x++){ v += (r()-.5)*.9; v *= .8; h = Math.max(-1.5, Math.min(1.5, h + v*.5)); noise.push(h); } }
  const hill = (base, amp, f, ph, body, edge, lit) => {
    const top = [];
    for(let x=0;x<W;x++) top.push(Math.round(base - amp*(.55 + .3*Math.sin(x*f+ph) + .15*Math.sin(x*f*2.3+ph*1.7)) + noise[x]));
    for(let x=0;x<W;x++){ const t = top[x], up = x>0 && top[x-1] > t;
      for(let y=t;y<yFloor;y++) set(x,y, y===t ? edge : (up && y===t+1) ? lit : body); }
    return top;
  };
  hill(Math.round(H*.43), H*.12, .038, 2.2, c.h2, c.h3, c.h3);
  const near = hill(Math.round(H*.49), H*.08, .06, .4, c.h1, c.h2, c.h2);
  // the city: rows of low buildings stepping up the near hills
  const city = (off, lift, minH) => {
    let x = off;
    while(x < W){
      const w = 4 + Math.floor(r()*4), bh = minH + Math.floor(r()*3);
      let base = 0; for(let i=0;i<w;i++) base = Math.max(base, near[Math.min(W-1, x+i)]);
      base += lift; const top = base - bh;
      for(let y=top; y<=base && y<yArc; y++) for(let i=0;i<w;i++){
        const j = y-top; let col = i===0 || j===0 ? c.c2 : i===w-1 ? c.c0 : c.c1;
        if(j===2 && i>0 && i<w-1 && (i&1)) col = c.c3;
        set(x+i, y, col); }
      x += w + (r() < .35 ? 1 : 0);
    }
  };
  city(0, 2, 3);
  city(2, 7, 3);

  /* ---------- tower helpers (front face lit from the upper left, side face in shadow) */
  const S = {lit:c.s3, base:c.s2, dark:c.s1, side:c.s0, g1:c.q2, g2:c.q1, gs:c.q0};
  const O = {lit:c.o3, base:c.o2, dark:c.o1, side:c.o0, g1:c.oq2, g2:c.oq, gs:c.q1};
  const block = (cx, hw, top, bot, sideW, P) => {
    for(let y=top;y<=bot;y++){ const j = y-top;
      for(let x=cx-hw;x<=cx+hw;x++){ const i = x-(cx-hw); let col = P.base;
        if(i===0 || j===0) col = P.lit; else if(x===cx+hw) col = P.dark;
        else if(i%3 !== 0 && (j%4 === 1 || j%4 === 2)) col = j%4===1 ? P.g1 : P.g2;   // window rows between stone bands
        set(x,y,col); }
      for(let x=cx+hw+1;x<=cx+hw+sideW;x++) set(x,y, (j%4===1 && x<cx+hw+sideW) ? P.gs : P.side);
    }
  };
  const crownTop = (cx, hw, top, sideW, P) => {          // ornamental crown of the Abraj hotel towers
    const w2 = Math.max(1, hw-2);
    for(let y=top-3;y<top;y++){ for(let x=cx-w2;x<=cx+w2;x++) set(x,y, x===cx-w2 ? P.lit : x===cx+w2 ? P.dark : P.base); for(let x=cx+w2+1;x<cx+w2+sideW;x++) set(x,y,P.side); }
    for(let y=top-2;y<top;y++) for(let x=cx-w2+2;x<=cx+w2-2;x+=2) set(x,y,c.n1);
    let y = top-4;
    for(let w=w2-1; w>=0; w--, y--) for(let x=cx-w;x<=cx+w;x++) set(x,y, x<cx ? P.lit : x===cx ? P.base : P.dark);
    set(cx, y, c.g3); set(cx, y-1, c.g3);
  };

  /* ---------- other modern hotels (Jabal Omar on the right, more on the left) */
  const hotel = (fx, hw, fy) => block(Math.round(W*fx), hw, Math.round(H*fy), yArc+2, 2, O);
  hotel(.04, 4, .38); hotel(.13, 3, .42);
  hotel(.76, 4, .39); hotel(.86, 3, .36); hotel(.95, 4, .41);

  /* ---------- Abraj Al Bait: flanking hotel towers of the complex */
  const fh = cr + 2;
  const flank = (cx, top) => { block(cx, fh, top, yArc+2, sw, S); crownTop(cx, fh, top, sw, S); };
  flank(tx - hb - 3*fh - 5, Math.round(H*.42));
  flank(tx + hb + sw + 3*fh + 4, Math.round(H*.42));
  flank(tx - hb - fh - 2, Math.round(H*.37));
  flank(tx + hb + sw + fh + 1, Math.round(H*.37));

  /* ---------- the Makkah Royal Clock Tower */
  {
    const xL = tx-hb, xR = tx+hb, boxT = cy-cr-2, boxB = cy+cr+2;
    // stepped shaft below the clock (widest at the bottom)
    const y1 = boxB + 1 + Math.round((yArc - boxB)*.5), y2 = y1 + Math.round((yArc - boxB)*.3);
    block(tx, hb+2, y2, yArc+2, sw, S);
    block(tx, hb+1, y1, y2-1, sw, S);
    block(tx, hb, boxB+1, y1-1, sw, S);
    // clock box
    rect(xL, boxT, 2*hb+1, boxB-boxT+1, c.s2);
    for(let y=boxT;y<=boxB;y++){ set(xL,y,c.s3); set(xR,y,c.s1); }
    for(let x=xL;x<=xR;x++){ set(x,boxT,c.s3); set(x,boxB,c.s1); }
    rect(xR+1, boxT, sw, boxB-boxT+1, c.s0);
    // green frame + gold ring + white face
    rect(tx-cr, cy-cr, 2*cr+1, 2*cr+1, c.n1);
    for(let i=-cr;i<=cr;i++){ set(tx+i, cy-cr, c.n2); set(tx-cr, cy+i, c.n2); }
    const o2 = cr*cr + cr*.8, i2 = (cr-1)*(cr-1) + (cr-1)*.8;
    for(let dy=-cr;dy<=cr;dy++) for(let dx=-cr;dx<=cr;dx++){ const d = dx*dx+dy*dy; if(d > o2) continue;
      set(tx+dx, cy+dy, d <= i2 ? c.W : dx+dy < 0 ? c.g3 : dx+dy > 0 ? c.g1 : c.g2); }
    set(tx+cr-1, cy, c.n1); set(tx, cy+cr-1, c.n1); set(tx-cr+1, cy, c.n1);
    for(let i=0;i<=cr-2;i++) set(tx, cy-i, c.ink);
    for(let i=1;i<=cr-3;i++) set(tx+i, cy, c.ink);
    // the side clock, seen edge-on
    { const xc = xR + 1 + ((sw-1)>>1);
      for(let dy=-cr-1;dy<=cr+1;dy++) for(let x=xR+1;x<=xR+sw-1;x++) set(x, cy+dy, c.n0);
      for(let dy=-cr+1;dy<=cr-1;dy++) set(xc, cy+dy, c.w0);
      set(xc, cy-cr, c.g1); set(xc, cy+cr, c.g1); }
    // corner pinnacles
    const ph = big ? 4 : 3;
    for(const [x,col,tip] of [[xL,c.s3,c.g3],[xR,c.s2,c.g3],[xR+sw,c.s0,c.g1]]){ for(let y=boxT-ph;y<boxT;y++) set(x,y,col); set(x, boxT-ph-1, tip); }
    // two stone tiers with tall green arch windows above the clock (the lunar gallery)
    const tier = (hw, top, bot, sideW, slitTop) => {
      for(let y=top;y<=bot;y++){ for(let x=tx-hw;x<=tx+hw;x++) set(x,y, x===tx-hw || y===top ? c.s3 : x===tx+hw ? c.s1 : c.s2);
        for(let x=tx+hw+1;x<tx+hw+sideW;x++) set(x,y,c.s0); }
      for(let dx=-(hw-2); dx<=hw-2; dx+=2) for(let y=slitTop;y<bot;y++) set(tx+dx,y,c.n1);
    };
    const hwA = Math.max(2, hb - 1), aT = boxT - Math.max(3, Math.round(cr*1.5));
    tier(hwA, aT, boxT-1, sw, aT+2);
    const hwB = Math.max(1, hb - 2), bT = aT - Math.max(2, cr);
    tier(hwB, bT, aT-1, sw-1, bT+1);
    for(let dx=-hwB;dx<=hwB;dx++) set(tx+dx, bT, dx<0 ? c.g3 : dx===0 ? c.g2 : c.g1);
    // slender golden cone
    const ySp = Math.round(bT*.45), yTb = bT - 1, nt = yTb - ySp + 1;
    for(let i=0;i<nt;i++){ const hw = Math.round(Math.max(1, hwB - 1)*(1 - i/(nt-1))), y = yTb - i;
      for(let dx=-hw;dx<=hw;dx++) set(tx+dx, y, dx<0 ? c.g3 : dx===0 ? (hw ? c.g2 : c.g3) : c.g1); }
    // spire, ball and the crescent (horns up)
    const y0 = Math.max(1, Math.round(H*.01));
    const cres = cr >= 5
      ? ['#.....#', '#.....#', '##...##', '.#####.']
      : ['#...#', '#...#', '.###.'];
    cres.forEach((row, j) => { const hw = row.length>>1; for(let i=0;i<row.length;i++) if(row[i]==='#') set(tx-hw+i, y0+j, i<hw ? c.g3 : i===hw ? c.g2 : c.g1); });
    const ys = y0 + cres.length;
    for(let y=ys;y<ySp;y++) set(tx,y, c.g3);
    const yb = ys + Math.round((ySp-ys)*.45); set(tx-1,yb,c.g3); set(tx+1,yb,c.g1); set(tx,yb,c.g4);
  }

  /* ---------- minarets of the Haram (tall, galleries, golden crescent finials) */
  const minaret = (cx, top, bot) => {
    let y = top;
    const row = (w, cols) => { for(let dx=-(w>>1); dx<=(w>>1); dx++) set(cx+dx, y, cols(dx, w>>1)); y++; };
    const shade = (dx, h) => dx===-h ? c.W : dx===h ? c.w0 : c.w2;
    set(cx-1,y,c.g3); set(cx+1,y,c.g1); y++;
    set(cx,y,c.g2); y++; set(cx,y,c.g1); y++;
    row(1, () => c.w3); row(3, shade); row(3, shade);
    const L = bot - y;
    const gallery = () => { row(5, shade); row(3, () => c.a1); };
    gallery();
    for(let i=0;i<Math.round(L*.16);i++) row(3, shade);
    gallery();
    for(let i=0;i<Math.round(L*.28);i++) row(3, (dx,h) => (dx===0 && i%4===2) ? c.a1 : shade(dx,h));
    gallery();
    let i = 0; while(y <= bot){ row(5, (dx,h) => (dx===0 && i%5===2) ? c.a1 : shade(dx,h)); i++; }
  };
  const mTop = Math.round(H*.21), mTop2 = Math.round(H*.27);
  const gap = hb + sw + fh*2 + 6;
  minaret(tx - gap, mTop, yArc);
  minaret(tx + gap, mTop, yArc);
  minaret(Math.round(W*.07), mTop2, yArc);
  minaret(Math.round(W*.71), mTop2, yArc);
  minaret(Math.round(W*.91), mTop2+2, yArc);

  /* ---------- the Haram: white arcade storey, the Ottoman portico with its small domes */
  {
    const arches = (y0, h, ap, aw, pier, pierLit, deep, deeper, phase) => {
      for(let x=0;x<W;x++){ const i = ((x - phase) % ap + ap) % ap;
        for(let j=0;j<h;j++){ let col = i===aw ? pierLit : pier;
          if(i < aw && Math.abs(i - (aw-1)/2) <= j + .5) col = i===0 ? deeper : deep;
          set(x, y0+j, col); } }
    };
    const mid = Math.round(W/2);
    // parapet
    for(let x=0;x<W;x++){ set(x, yArc, c.W); set(x, yArc+1, c.w1); }
    for(let x=((mid%3)+3)%3; x<W; x+=3){ set(x, yArc-1, c.W); set(x+1, yArc-1, c.w2); }
    // modern storey
    const ap1 = big ? 7 : 6, aw1 = big ? 5 : 4;
    arches(yArc+2, sh + dh - 1, ap1, aw1, c.w2, c.w3, c.a1, c.a0, mid - (aw1>>1));   // continues behind the domes
    // portico domes on a stone band
    const yd = yArc + 2 + sh, dp = big ? 8 : 6, dw = dp - 1, dph = mid - (dw>>1);
    for(let x=0;x<W;x++){ set(x, yd+dh-1, c.w1); }
    for(let x0 = ((dph % dp) - dp); x0 < W; x0 += dp){
      for(let j=0;j<dh;j++){ const yy = yd + j, inset = j===0 ? (big?2:1) : (j===1 && big) ? 1 : 0;
        for(let i=inset;i<dw-inset;i++) set(x0+i, yy, j===dh-1 ? c.d0 : i===inset ? c.d2 : i>=dw-inset-1 ? c.d0 : c.d1); }
      set(x0 + (dw>>1), yd-1, c.g3);
    }
    // portico arches under a stone band
    for(let x=0;x<W;x++) set(x, yd+dh, c.w2);
    arches(yd+dh+1, sh-1, dp, dw-1, c.w1, c.w2, c.a0, c.a0, dph+1);
  }

  /* ---------- mataf floor */
  R.bands(yFloor, H, ['#e0dacd','#ebe6dc','#f5f2ec']);
  for(let x=0;x<W;x++) set(x, yFloor, c.f0);
  for(let k2=0, y=yFloor+3; y<H; k2++, y+=3+Math.round(k2*1.5)) for(let x=0;x<W;x++) set(x, y, c.f1);

  /* ---------- the Kaaba */
  const kh = Math.round(H*.2), kw = Math.round(kh*.9), ks = 2*Math.round(kh*.16);
  const kx = Math.round(W/2 - (kw+ks)/2), kb = Math.round(H*.875), kt = kb - kh + 1;
  const dy = d => (d+1) >> 1;                       // rise of the side face (2:1)
  const ext = Math.round(kw*.55);                   // Hijr Ismail reach
  const bottomAt = x => x >= kx && x < kx+kw ? kb+1 : (x >= kx+kw && x < kx+kw+ks) ? kb - dy(x-kx-kw) + 1 : -1;
  const mq = {x: kx - Math.round(ks*.5), y: kb + Math.round(ks*.5)};

  // tawaf: staggered rings of pilgrims around the Kaaba and the Hijr
  const rcx = kx + Math.round((kw + ks + ext*.6)/2), rcy = kb - (ks>>2);
  const figs = [], nr = big ? 5 : 4, dr = big ? 9 : 8, rx0 = (kw + ks + ext*.6)/2 + 5;
  for(let i=0;i<nr;i++){
    const rx = rx0 + dr*i, ry = rx*.3, n = Math.round(Math.PI*2*Math.sqrt((rx*rx+ry*ry)/2)/3.2), a0 = i*.5;
    for(let j=0;j<n;j++){ const a = a0 + j/n*6.283;
      const x = Math.round(rcx + Math.cos(a)*rx), y = Math.round(rcy + Math.sin(a)*ry);
      if(y >= H || y < yFloor+4) continue;
      if(x >= mq.x-3 && x <= mq.x+2 && y >= mq.y-5 && y <= mq.y+2) continue;
      figs.push({x, y, t:r()}); }
  }
  figs.sort((a,b) => a.y-b.y || a.x-b.x);
  const fig = f => { const {x,y,t,h} = f, grey = t > .93;
    const b1 = grey ? c.d1 : c.pw, b2 = grey ? c.d0 : c.ps, head = h < .45 ? c.p3 : h < .8 ? c.p1 : c.p2;
    set(x, y+1, c.f0); set(x+1, y+1, c.f0);
    set(x, y, b1); set(x+1, y, b2); set(x, y-1, b1); set(x+1, y-1, b2); set(x, y-2, head); };
  const behind = f => f.y < Math.max(bottomAt(f.x), bottomAt(f.x+1));
  // keep the Kaaba silhouette clean: no figure pokes out right beside its walls from behind
  const inK = (px, py) => {
    if(py > kb+1) return false;
    if(px >= kx && px < kx+kw && py >= kt) return true;
    const d = px - kx - kw; if(d >= 0 && d < ks && py >= kt - dy(d) && py <= kb - dy(d) + 1) return true;
    const j = kt - py; return j >= 1 && j <= ks>>1 && px >= kx+2*j-1 && px <= kx+kw+2*j-2;
  };
  const notch = f => { const {x,y} = f;
    for(const [px,py] of [[x,y-2],[x,y-1],[x+1,y-1],[x,y],[x+1,y],[x,y+1],[x+1,y+1]])
      if(!inK(px,py) && (inK(px-1,py) || inK(px+1,py) || inK(px,py-1))) return true;
    return false; };
  figs.forEach(f => f.h = r());
  figs.filter(f => behind(f) && !notch(f)).forEach(fig);

  // floor shadow to the right of the Kaaba (light from the upper left)
  const sl = Math.round(kw*.25);
  for(let y=kb-(ks>>1)+1; y<=kb+1; y++){ const xs = kx + kw + Math.min(ks, 2*(kb+1-y)); for(let x=xs; x<xs+sl; x++) set(x,y,c.f0); }
  for(let x=kx; x<kx+kw+2; x++) set(x, kb+2, c.f0);
  // front face
  rect(kx, kt, kw, kh, c.k2);
  for(let y=kt;y<=kb;y++) set(kx, y, c.k3);
  for(let x=kx;x<kx+kw;x++) set(x, kt, c.k3);
  // side face
  for(let d=0; d<ks; d++){ const x = kx+kw+d; for(let y=kt-dy(d); y<=kb-dy(d); y++) set(x,y,c.k1); }
  // roof
  for(let j=1;j<=ks>>1;j++) for(let x=kx+2*j-1; x<=kx+kw+2*j-2; x++) set(x, kt-j, c.kr);
  // marble base (shadharwan)
  for(let x=kx;x<kx+kw;x++) set(x, kb+1, c.kb);
  for(let d=0; d<ks; d++) set(kx+kw+d, kb-dy(d)+1, c.w0);
  // gold band (hizam): gold borders with a calligraphy-like rhythm between, no letters
  const bt = Math.round(kt + kh*.22), pat = [1,1,0,1,0,1,1,1,0,1,1,0];
  for(let x=kx;x<kx+kw;x++){ const i = x-kx; set(x, bt, c.g3); set(x, bt+1, pat[i%pat.length] ? c.g2 : c.k1); set(x, bt+2, c.g1); }
  for(let d=0; d<ks; d++){ const x = kx+kw+d, y = bt - dy(d); set(x, y, c.g1); set(x, y+1, pat[(d+kw)%pat.length] ? c.g0 : c.k0); set(x, y+2, c.g0); }
  // gold door (with its curtain) on the front face, left of centre
  const dw = Math.max(4, Math.round(kw*.2)), dxl = kx + Math.round(kw*.2), dtop = bt + 4, dbot = kb - Math.round(kh*.18);
  for(let y=dtop;y<=dbot;y++) for(let x=dxl;x<dxl+dw;x++){ const i = x-dxl;
    set(x,y, i===0 ? c.g3 : i===dw-1 ? c.g1 : (y===dtop ? c.g4 : (i===(dw>>1) && dw>4) ? c.g1 : c.g2)); }
  for(let x=dxl;x<dxl+dw;x++) set(x, dbot, c.g1);
  // small gold lamp medallions under the band (large sizes only)
  if(kh >= 26) for(const f of [.58, .82]){ const x = kx + Math.round(kw*f); set(x, bt+4, c.g3); set(x, bt+5, c.g2); set(x, bt+6, c.g1); }

  // Hijr Ismail: low white semicircular wall off the side face
  { const pts = new Map();
    for(let s=0; s<=80; s++){ const t = .06 + .88*s/80, d = t*(ks-1), e = ext*Math.sqrt(Math.max(0, 1-(2*t-1)*(2*t-1)));
      const x = Math.round(kx+kw+d+e), y = Math.round(kb - d/2 + e*.22); pts.set(x+','+y, [x, y, t < .5]); }
    const list = [...pts.values()].sort((a,b) => a[1]-b[1]);
    for(const [x,y,front] of list){ set(x, y-1, c.W); if(front) set(x, y, c.a2); } }

  // Maqam Ibrahim: small golden cage in front of the door
  const maqam = () => { const {x,y} = mq;
    set(x, y-5, c.g3); set(x-1,y-4,c.g3); set(x,y-4,c.g2); set(x+1,y-4,c.g1);
    set(x-1,y-3,c.g2); set(x,y-3,c.q2); set(x+1,y-3,c.g1); set(x-1,y-2,c.g2); set(x,y-2,c.q1); set(x+1,y-2,c.g1);
    set(x-1,y-1,c.w1); set(x,y-1,c.w1); set(x+1,y-1,c.w0); };

  // pilgrims in front, with the maqam in depth order
  let mDone = false;
  for(const f of figs){ if(behind(f)) continue;
    if(!mDone && f.y > mq.y){ maqam(); mDone = true; }
    fig(f); }
  if(!mDone) maqam();
};
})();
