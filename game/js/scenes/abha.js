/* scenes/abha.js — modern Abha: nature, mountains and plants.
   The green Asir mountains with juniper forests and terraces, clouds resting
   on the peaks and fog in the valley, the Abha cable car (stations, a lattice
   pylon, cables and bright cabins crossing the valley), and the modern white
   city on the slopes with a few colourful Asiri bands.
   Everything is drawn per pixel on the scene raster (one pixel grid). */
(() => {
'use strict';
const RGB = {};
const C = h => RGB[h] || (RGB[h] = hexRGB(h));

/* colours */
const SKY  = ['#4f9ed8', '#76b8e4', '#a6d3ee', '#d4ecf2'];
const FAR  = {hi:'#c4e0da', lt:'#a9cdc6', sh:'#8db6b3'};
const MID  = {hi:'#9fcf98', lt:'#78b67c', sh:'#5b9a6c', dot:'#4a8a60'};
const NEAR = {hi:'#8fd07a', lt:'#5cb35a', sh:'#3f9249', dk:'#2c7440', ter:'#7cc46a'};
const HILL = {hi:'#9be07a', lt:'#6cc063', sh:'#4ea155', dk:'#3a8a48'};
const FORE = {hi:'#b4ea88', lt:'#7fcf6a', sh:'#5cb35a', dk:'#3f9249'};
const TREE = {sun:['#4a9e50', '#2f8545', '#236b3a'], shade:['#2f7f44', '#236b3a', '#1a5530']};
const JUN  = {hi:'#4f9f58', lt:'#2f8048', base:'#1f6a3c', dk:'#154a30', trunk:'#6a4a32'};
const FOG  = {hi:'#ffffff', base:'#eef6f6', sh:'#d6e6ea'};
const WALL = {hi:'#ffffff', base:'#f4efe2', side:'#d9d1c0', dk:'#bdb3a0', win:'#46709a', winL:'#8fc0e0'};
const BAND = ['#d94a3d', '#f7c948', '#3a9a55', '#4fa4d8'];
const STEEL = {hi:'#d0d7da', base:'#9aa3a8', dk:'#5f676c'};
const CABLE = '#3a3f58';
const CAB = [
  {rim:'#8f2a24', body:'#d94a3d', lit:'#f08070'},
  {rim:'#c98a1a', body:'#f7c948', lit:'#fff0a0'},
  {rim:'#2b6ca3', body:'#4fa4d8', lit:'#9fd8f5'},
];
const FLOW = ['#ffffff', '#f29aa0', '#9b7fd4'];

SCENES.abha = k => {
  const {R, W, H} = k;
  const s = Math.min(W/224, H/134);
  const S = v => Math.max(1, Math.round(v*s));
  const P = (x, y, h) => R.set(x, y, C(h));
  const rect = (x, y, w, h, col) => { const c = C(col); x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    for(let j=y; j<y+h; j++) for(let i=x; i<x+w; i++) R.set(i, j, c); };
  const hline = (x0, x1, y, col) => rect(x0, y, x1-x0+1, 1, col);
  const vline = (x, y0, y1, col) => rect(x, y0, 1, y1-y0+1, col);
  const line = (x0, y0, x1, y1, col) => { x0=Math.round(x0); y0=Math.round(y0); x1=Math.round(x1); y1=Math.round(y1);
    const c = C(col), dx = Math.abs(x1-x0), dy = -Math.abs(y1-y0), sx = x0<x1?1:-1, sy = y0<y1?1:-1; let e = dx+dy;
    for(;;){ R.set(x0, y0, c); if(x0===x1 && y0===y1) break; const e2 = 2*e; if(e2>=dy){ e+=dy; x0+=sx; } if(e2<=dx){ e+=dx; y0+=sy; } } };

  /* a ridge profile through control points [x frac, y frac] (cosine eased) with gentle waves */
  const profile = (pts, amp, seed) => { const top = new Int32Array(W);
    for(let x=0; x<W; x++){ const fx = (x+.5)/W; let i = 0; while(i < pts.length-2 && fx > pts[i+1][0]) i++;
      const [x0, y0] = pts[i], [x1, y1] = pts[i+1]; const t = Math.max(0, Math.min(1, (fx-x0)/(x1-x0))), e = (1-Math.cos(t*Math.PI))/2;
      const n = Math.sin(x*.19/s + seed)*.6 + Math.sin(x*.43/s + seed*2.3)*.4;
      top[x] = Math.round((y0 + (y1-y0)*e)*H + n*amp); }
    return top; };
  /* faceted mountain: each peak has a ridge line running down to the right; lit to its left, shade to its right */
  const mountain = (top, peaks, pal, yEnd, xa=0, xb=W, drift=.5) => {
    const pk = peaks.map(f => { let bx = Math.round(f*W), by = 1e9; for(let x=Math.round(f*W)-S(6); x<=Math.round(f*W)+S(6); x++) if(x>=xa && x<xb && top[x] < by){ by = top[x]; bx = x; } return bx; });
    const bounds = [xa];
    for(let i=0; i<pk.length-1; i++){ let vx = pk[i], vy = -1; for(let x=pk[i]; x<=pk[i+1]; x++) if(top[x] > vy){ vy = top[x]; vx = x; } bounds.push(vx); }
    bounds.push(xb);
    for(let i=0; i<pk.length; i++){ const px = pk[i], py = top[px];
      for(let x=Math.max(0, bounds[i]); x<Math.min(W, bounds[i+1]); x++){
        for(let y=Math.max(0, top[x]); y<yEnd; y++){
          const rx = px + Math.round((y-py)*drift + Math.sin((y-py)*.35 + i*2)*1.1);
          const lit = x < rx;
          P(x, y, y === top[x] ? (lit ? pal.hi : pal.lt) : lit ? pal.lt : pal.sh); } } }
    return pk;
  };
  /* juniper tree: a rounded, slightly ragged cone lit from the left */
  const juniper = (cx, gy, h) => {
    cx = Math.round(cx); gy = Math.round(gy); h = Math.max(3, Math.round(h));
    const w = Math.max(1, Math.round(h*.36)), top = gy - h;
    if(h >= 6) vline(cx, gy-1, gy, JUN.trunk);
    const ch = h - (h >= 6 ? 1 : 0);
    for(let j=0; j<ch; j++){ const t = (j+1)/ch; let hw = Math.round(w*Math.sqrt(t) - (t > .88 ? .6 : 0)); if(h >= 7 && (j % 3 === 1)) hw += 1;
      for(let dx=-hw; dx<=hw; dx++){ let col = JUN.base;
        if(dx < -hw*.3) col = JUN.lt; if(dx === -hw && j > 0) col = h >= 7 ? JUN.hi : JUN.lt; if(dx > hw*.35) col = JUN.dk; if(j === ch-1 && dx > -hw) col = JUN.dk;
        P(cx+dx, top+j, col); } }
    P(cx, top-1, JUN.lt);
  };
  /* flat-bottomed cloud or fog bank: union of bumps, white on top, cool shade at the base */
  const cloud = (cx, cy, w, hgt) => {
    const bumps = [[-.62, .5, .38, .55], [-.3, .15, .38, .9], [.05, 0, .4, 1], [.4, .25, .36, .8], [.72, .55, .3, .5]];
    const raw = (x, y) => { if(y > cy) return false; for(const [ox, oy, rx, ry] of bumps){ const ex = (x-(cx+ox*w))/(rx*w), ey = (y-(cy - hgt + oy*hgt))/(ry*hgt+.01); if(ex*ex+ey*ey <= 1) return true; } return false; };
    const x0 = Math.round(cx-w*1.2), y0 = Math.round(cy-hgt*2.2), bw = Math.round(w*2.4)+1, bh = cy-y0+2, m = new Uint8Array(bw*bh);
    for(let y=0; y<bh; y++) for(let x=0; x<bw; x++) m[y*bw+x] = raw(x0+x, y0+y) ? 1 : 0;
    for(let pass=0; pass<2; pass++){ const rm = [];      // drop 1-pixel spurs
      for(let y=0; y<bh; y++) for(let x=0; x<bw; x++){ if(!m[y*bw+x]) continue; const n = (x>0 && m[y*bw+x-1]) + (x<bw-1 && m[y*bw+x+1]) + (y>0 && m[(y-1)*bw+x]) + (y<bh-1 && m[(y+1)*bw+x]); if(n < 2) rm.push(y*bw+x); }
      for(const i of rm) m[i] = 0; }
    const inside = (x, y) => x >= x0 && y >= y0 && x < x0+bw && y < y0+bh && m[(y-y0)*bw + x-x0] === 1;
    for(let y=y0; y<y0+bh; y++) for(let x=x0; x<x0+bw; x++){ if(!inside(x, y)) continue;
      P(x, y, !inside(x, y+1) || y === cy ? FOG.sh : (!inside(x, y-1) || !inside(x-1, y)) ? FOG.hi : FOG.base); }
  };

  /* ---------- sky */
  R.bands(0, Math.round(H*.62), SKY);

  /* ---------- far blue-green range with clouds resting on it */
  const farTop = profile([[0,.37],[.1,.31],[.2,.36],[.31,.28],[.43,.34],[.55,.29],[.67,.35],[.79,.29],[.9,.34],[1,.31]], S(1.2), 1);
  mountain(farTop, [.1,.31,.55,.79,.97], FAR, Math.round(H*.62), 0, W, .7);
  cloud(Math.round(W*.31), Math.round(H*.32), S(12), S(3));
  cloud(Math.round(W*.52), Math.round(H*.35), S(22), S(4));
  cloud(Math.round(W*.86), Math.round(H*.36), S(15), S(3.4));

  /* ---------- middle green range dotted with juniper forest */
  const midTop = profile([[0,.5],[.18,.44],[.34,.5],[.5,.43],[.63,.48],[.76,.42],[.9,.46],[1,.44]], S(1), 4);
  mountain(midTop, [.18,.5,.76], MID, Math.round(H*.8), 0, W, .8);
  for(let j=0, y=Math.round(H*.46); y<H*.74; j++, y += S(4)) for(let x=(j*5) % 11; x<W; x += S(8) + ((x*7 + j) % 4)){
    if(y > midTop[x] + 3 && ((x*3 + j*7) % 5) !== 0){ P(x, y-1, MID.lt); P(x-1, y, MID.dot); P(x, y, MID.dot); P(x+1, y, MID.dot); } }


  /* ---------- the big mountain on the left (top station), with juniper forest and terraces */
  const nearTop = profile([[0,.43],[.07,.385],[.15,.36],[.23,.41],[.31,.5],[.39,.6],[.47,.71],[.55,.83],[.6,.95]], S(.8), 7);
  const nearX = Math.round(W*.6);
  const nPk = mountain(nearTop, [.07,.15], NEAR, H, 0, nearX, .9);
  const ridgeAt = y => nPk[1] + Math.round((y - nearTop[nPk[1]])*.9);
  // forest: small rounded tree tops, staggered along the slope (denser in the shade), terraces lower down
  const hash = n => { n = Math.imul(n ^ (n >>> 16), 0x45d9f3b); n = Math.imul(n ^ (n >>> 16), 0x45d9f3b); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
  const terrTop = Math.round(H*.62);
  const tuft = (x, y, lit) => { const T = lit ? TREE.sun : TREE.shade;
    P(x, y-2, T[0]); P(x+1, y-2, T[1]); P(x-1, y-1, T[0]); P(x, y-1, T[1]); P(x+1, y-1, T[1]); P(x+2, y-1, T[2]); P(x, y, T[2]); P(x+1, y, T[2]); };
  for(let j=0; j<60; j++){ const d = S(5) + j*S(3.5); for(let i=0, x=(j*5) % 9; x<nearX; i++, x += S(6) + Math.floor(hash(i*31 + j*7)*S(5))){
    const y = nearTop[x] + d; if(y > H*.84 || x > W*.57) continue; const lit = x < ridgeAt(y) - 1;
    if(lit && y > terrTop) continue; if(hash(i*13 + j*101) < (lit ? .35 : .15)) continue;
    tuft(x, y, lit); } }
  for(let y=terrTop + S(2); y<H*.84; y += S(3)) for(let x=0; x<nearX; x++){ if(y <= nearTop[x] + S(6) || x > ridgeAt(y) - 3) continue;
    const seg = (x + (y>>1)*7) % 17; if(seg < 12){ P(x, y, NEAR.ter); P(x, y+1, NEAR.sh); } }

  /* ---------- the city hill on the right */
  const hillTop = profile([[.36,.86],[.47,.7],[.58,.58],[.7,.51],[.82,.48],[.92,.47],[1,.49]], S(.6), 9);
  const hillX = Math.round(W*.4);
  for(let x=hillX; x<W; x++) for(let y=hillTop[x]; y<H; y++) P(x, y, y === hillTop[x] ? HILL.hi : y < hillTop[x] + S(2) ? HILL.lt : HILL.lt);
  for(let j=0; j<30; j++){ const d = S(20) + j*S(4); for(let i=0, x=hillX + (j*7) % 11; x<W; i++, x += S(9) + Math.floor(hash(i*17 + j*43)*S(8))){
    const y = hillTop[Math.min(W-1, x)] + d; if(y > H*.9 || hash(i*29 + j*71) < .3) continue; tuft(x, y, true); } }

  /* ---------- modern Abha: white buildings in rows stepping up the slope */
  const building = (x, w, h, gy, band, tint) => {
    x = Math.round(x); w = Math.round(w); h = Math.round(h); gy = Math.round(gy);
    const top = gy - h, side = Math.max(2, Math.round(w*.25)), fw = w - side;
    rect(x, top, fw, h, WALL.base); rect(x+fw, top, side, h, WALL.side); vline(x, top, gy, WALL.hi);
    hline(x, x+fw-1, top, WALL.hi); hline(x+fw, x+w-1, top, WALL.base);
    for(let i=x+1; i<x+w-1; i+=2) P(i, top-1, i < x+fw ? WALL.hi : WALL.side);        // small crenellations
    let wy = top + 3;
    if(band){ for(let i=x+1; i<x+fw; i++){ const c = BAND[Math.floor((i-x-1)/2) % 4]; P(i, top+3, c); if((i-x) % 2 === 0) P(i, top+2, c); } wy = top + 6; }
    const wc = tint || WALL.win;
    for(let y=wy; y<gy-1; y+=S(4)) { for(let i=x+2; i+1<x+fw-1; i+=3){ P(i, y, WALL.winL); P(i+1, y, wc); P(i, y+1, wc); P(i+1, y+1, wc); } vline(x+fw+1, y, y+1, WALL.dk); }
  };
  const rows = [
    {off:S(1),  w:[7,10],  h:[6,11],  x0:.66, gap:1},
    {off:S(8),  w:[8,12],  h:[8,15],  x0:.6,  gap:1},
    {off:S(15), w:[9,13],  h:[8,13],  x0:.63, gap:2},
  ];
  const tints = [null, null, '#3a9a55', null, '#d94a3d', null];
  rows.forEach((r, ri) => { let x = Math.round(r.x0*W) + ri*3, i = 0;
    while(x < W){ const w = S(r.w[0] + hash(ri*97 + i)*(r.w[1]-r.w[0])), h = S(r.h[0] + hash(ri*131 + i*7)*(r.h[1]-r.h[0]));
      const gy = hillTop[Math.min(W-1, x + (w>>1))] + r.off;
      building(x, w, h, gy, (i + ri) % 3 === 1, tints[(i*2 + ri) % tints.length]);
      if(ri === 1 && i === 2){ // a minaret rising among the houses
        const mx = x + w + S(2), mt = gy - S(24);
        rect(mx-1, mt, 3, gy-mt, WALL.base); vline(mx-1, mt, gy, WALL.hi); vline(mx+1, mt, gy, WALL.side);
        hline(mx-2, mx+2, mt+S(7), WALL.hi); hline(mx-2, mx+2, mt+S(7)+1, WALL.side);
        rect(mx-1, mt-2, 3, 2, '#1f8f4e'); P(mx, mt-3, '#1f8f4e'); P(mx, mt-4, '#d6a739'); P(mx, mt-5, '#d6a739');
        x += S(5); }
      x += w + r.gap; i++; } });

  /* ---------- cable car: stations, pylon, cables and cabins */
  {
    const station = (x, gy, flip) => {           // modern station: white box, glass band, dark mouth where the cables enter
      const w = S(18), h = S(10), x0 = x - (w>>1), top = gy - h;
      rect(x0, top, w, h, WALL.base); vline(x0, top, gy, WALL.hi); hline(x0, x0+w-1, top, WALL.hi);
      rect(x0-1, top-2, w+2, 2, STEEL.dk); hline(x0-1, x0+w, top-2, STEEL.base);
      hline(x0+1, x0+w-2, top+3, WALL.winL); hline(x0+1, x0+w-2, top+4, WALL.win); hline(x0+1, x0+w-2, top+5, WALL.win);
      const mx = flip ? x0 : x0 + w - S(4); rect(mx, top+1, S(4), h-1, '#2a3440'); hline(mx, mx+S(4)-1, top+1, '#44505c');
      rect(x0, gy, w, 1, WALL.dk);
      return [flip ? x0 + 1 : x0 + w - 2, top + 3];
    };
    const tx = nPk[1], ty = nearTop[tx] + S(2);
    const lx = Math.round(W*.585), ly = hillTop[lx] + S(3);
    const [ax, ay] = station(tx, ty, false);
    const [bx, by] = station(lx, ly, true);
    const sag = S(7), cp = [(ax+bx)/2, (ay+by)/2 + sag];
    const at = t => [(1-t)*(1-t)*ax + 2*(1-t)*t*cp[0] + t*t*bx, (1-t)*(1-t)*ay + 2*(1-t)*t*cp[1] + t*t*by];
    // lattice pylon on the slope between the first two cabins
    { const [px, py] = at(.36), gx = Math.round(px), gy = nearTop[Math.min(W-1, gx)] + S(2), top = Math.round(py) + 3;
      if(gy > top + 4){ const hgt = gy - top;
        for(let y=top; y<=gy; y++){ const hw = 1 + Math.round((y-top)/hgt*S(3)); P(gx-hw, y, STEEL.dk); P(gx+hw, y, STEEL.dk);
          const ph = (y-top) % 4; if(ph === 0) for(let i=-hw+1; i<hw; i++) P(gx+i, y, STEEL.base); else if(hw > 1){ const o = ph === 2 ? 0 : ph === 1 ? -1 : 1; P(gx+o, y, STEEL.base); } }
        hline(gx-S(4), gx+S(4), top-1, STEEL.dk); P(gx-S(4), top-2, STEEL.base); P(gx+S(4), top-2, STEEL.base); vline(gx, top-2, top-1, STEEL.dk); } }
    // two cables
    const N = Math.ceil(Math.hypot(bx-ax, by-ay))*3;
    for(let i=0; i<=N; i++){ const [x, y] = at(i/N); P(Math.round(x), Math.round(y), CABLE); P(Math.round(x), Math.round(y)+2, STEEL.dk); }
    // cabins (a fixed pixel sprite, coloured per cabin)
    const CABG = [
      "....k....",
      "...kkk...",
      "....k....",
      "....k....",
      ".ooooooo.",
      "oLBBBBBDo",
      "oWwwwwwwo",
      "owwwwwwwo",
      "oLBBBBBDo",
      "oLBBBBBDo",
      ".ooooooo."];
    [[.17, 0], [.55, 1], [.83, 2]].forEach(([t, ci]) => { const [x, y] = at(t), cx = Math.round(x) - 4, cy = Math.round(y), c = CAB[ci];
      const col = {k:CABLE, o:c.rim, B:c.body, L:c.lit, D:c.rim, w:'#a6e0f0', W:'#ffffff'};
      CABG.forEach((row, j) => [...row].forEach((ch, i) => { if(col[ch]) P(cx+i, cy+j, col[ch]); })); });
  }

  /* ---------- fog drifting out of the valley in front of the far slopes */
  cloud(Math.round(W*.46), Math.round(H*.77), S(24), Math.max(3, S(3)));

  /* ---------- foreground meadow with big junipers and wild flowers */
  const foreTop = profile([[0,.84],[.15,.8],[.32,.84],[.5,.9],[.7,.87],[.86,.82],[1,.84]], S(.6), 3);
  for(let x=0; x<W; x++) for(let y=foreTop[x]; y<H; y++){ const d = y - foreTop[x];
    P(x, y, d === 0 ? FORE.hi : d < S(3) ? FORE.lt : FORE.sh); }
  for(let j=0, y=Math.round(H*.9); y<H; j++, y += S(4)) for(let x=(j*7) % 16; x<W; x += 16){ const xx = x + (j % 2)*8; if(y > foreTop[xx] + S(3)){ P(xx, y, FORE.dk); P(xx+2, y, FORE.dk); P(xx+1, y-1, FORE.dk); } }
  const flower = (x, y, c) => { P(x, y-1, c); P(x-1, y, c); P(x+1, y, c); P(x, y+1, c); P(x, y, '#f7c948'); P(x, y+2, FORE.dk); };
  [[.22, 0], [.3, 2], [.43, 1], [.58, 2], [.67, 0], [.75, 1]].forEach(([f, ci], i) => { const x = Math.round(W*f), y = foreTop[x] + S(4) + (i % 2)*S(3); if(y < H-2) flower(x, y, FLOW[ci]); });
  juniper(W*.05, H+S(2), S(22)); juniper(W*.13, H+S(1), S(14));
  juniper(W*.93, H+S(2), S(20)); juniper(W*.84, H, S(12));
};
})();
