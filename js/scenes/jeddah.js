/* scenes/jeddah.js — modern Jeddah on the Red Sea: the sea and ships.
   King Fahd's Fountain throwing its tall white jet out of the sea, the modern
   skyline across the bay (corniche towers and the triangular National Commercial
   Bank tower; the Jeddah Tower is still being built, so it is not shown),
   the white Al-Rahma "floating" mosque with its turquoise dome standing on
   pillars over the water, a white motor yacht, and the Corniche promenade in
   front with palms and lamp posts. Everything is drawn per pixel on the scene
   raster (one pixel grid), lit from the upper left. */
(() => {
'use strict';
const RGB = {};
const C = h => RGB[h] || (RGB[h] = hexRGB(h));
const BAY = [[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];

const SKY = ['#4fa4d8', '#6cb8e4', '#95cdec', '#c4e6f2', '#e2f3f6'];
const SEA = ['#2f80b6', '#3c90c0', '#4aa2d2', '#55b3d8'];
const FAR = {
  g:['#7ba3bd', '#93b8cd', '#b8d5e2'],      // glass towers: shade, base, lit
  w:['#c8d5db', '#e2e9ec', '#f5f8f9'],      // white hotels
  s:['#cdbfa6', '#e0d5c0', '#efe8d9'],      // sand-stone towers
  gw:'#6f97b0', ww:'#a9c3cf', sw:'#b8a88a', // window rows
};
const JT = {edge:'#f7fbfc', lit:'#d8e7ef', mid:'#b7cfdc', sh:'#93b1c4', dk:'#7596ab', band:'#c6d9e3', bandS:'#86a5b9'};
const WHITE = {hi:'#ffffff', base:'#f1f4f5', mid:'#dfe6e9', sh:'#c3ced4', dk:'#9fb0b8'};
const TURQ = ['#17727a', '#2a9c9c', '#46c2b8', '#8fe3d6', '#d4f7ef'];
const PALM = {trunk:'#a8744a', trunkD:'#7a4e2e', ring:'#4a2e1c', f0:'#0e6b3a', f1:'#1f8f4e', f2:'#5cbf60'};
const PAVE = {base:'#f2e9d8', joint:'#e0d3b8', terra:'#d6955c', terraL:'#e6b07a', terraD:'#b8743e', curbHi:'#ffffff', curb:'#e6ddca', curbS:'#c9bda3', shadow:'#dccfb2'};

SCENES.jeddah = k => {
  const {R, W, H} = k, r = k.r;
  const s = Math.min(W/224, H/134);
  const S = v => Math.max(1, Math.round(v*s));
  const P = (x, y, h) => R.set(x, y, C(h));
  const rect = (x, y, w, h, col) => { const c = C(col); x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    for(let j=y; j<y+h; j++) for(let i=x; i<x+w; i++) R.set(i, j, c); };
  const hline = (x0, x1, y, col) => rect(x0, y, x1-x0+1, 1, col);
  const vline = (x, y0, y1, col) => rect(x, y0, 1, y1-y0+1, col);

  const hz = Math.round(H*.56);      // sea horizon
  const wall = Math.round(H*.8);     // edge of the Corniche promenade

  /* ---------- sky, sun, clouds, gulls */
  R.bands(0, hz, SKY);
  const sunX = Math.round(W*.07), sunY = Math.max(34, Math.round(H*.28)), sr = S(7);
  R.disc(sunX, sunY, sr+2, '#bfe3f2'); R.disc(sunX, sunY, sr, '#f7c948'); R.disc(sunX-1, sunY-1, sr-2, '#fff0a0');
  const cloud = (cx, cy, w) => {
    const bumps = [[-.32, 0, .34, 2.2], [0, -.1, .3, 3.6], [.3, 0, .28, 2.6], [.02, .12, .55, 1.6]];
    const inside = (x, y) => { if(y > cy+1) return false; for(const [ox, oy, rx, ry] of bumps){ const ex = (x-(cx+ox*w))/(rx*w), ey = (y-(cy+oy*w*.1))/(ry*s+.01); if(ex*ex+ey*ey <= 1) return true; } return false; };
    for(let y=cy-Math.round(6*s)-2; y<=cy+1; y++) for(let x=Math.round(cx-w); x<=Math.round(cx+w); x++){
      if(!inside(x, y)) continue; P(x, y, !inside(x, y+1) ? '#d7e8ef' : (!inside(x, y-1) || !inside(x-1, y)) ? '#ffffff' : '#f3f8f9'); }
  };
  cloud(Math.round(W*.62), Math.max(31, Math.round(H*.25)), S(12));
  cloud(Math.round(W*.9), Math.max(36, Math.round(H*.31)), S(9));
  const gull = (x, y) => { P(x, y, '#ffffff'); P(x+1, y-1, '#ffffff'); P(x+2, y, '#e4eef2'); P(x+3, y-1, '#ffffff'); P(x+4, y, '#ffffff'); P(x+2, y+1, '#9aa3a8'); };
  gull(Math.round(W*.3), Math.max(30, Math.round(H*.27))); gull(Math.round(W*.35), Math.max(34, Math.round(H*.31)));

  /* ---------- skyline across the bay (hazy, so the landmarks in front stay clear) */
  const tower = (fx, w, h, type, top) => {
    const x0 = Math.round(W*fx), ww = S(w), hh = S(h), y0 = hz - hh, pal = FAR[type];
    for(let y=y0; y<hz; y++) for(let i=0; i<ww; i++){
      let col = i === 0 ? pal[2] : i >= ww-Math.max(1, Math.round(ww*.3)) ? pal[0] : pal[1];
      const row = y - y0;
      if(row > 1 && i > 0 && i < ww-1){
        if(type === 'g' && row % 3 === 2) col = FAR.gw;
        else if(type !== 'g' && row % 3 === 2 && (i & 1)) col = type === 'w' ? FAR.ww : FAR.sw;
      }
      if(y === y0) col = pal[2];
      P(x0+i, y, col); }
    if(top === 'spire') vline(x0 + (ww>>1), y0 - S(6), y0 - 1, pal[0]);
    if(top === 'step'){ const sw = Math.max(2, ww-S(3)); rect(x0+1, y0-S(3), sw, S(3), pal[1]); vline(x0+1, y0-S(3), y0-1, pal[2]); hline(x0+1, x0+sw, y0-S(3), pal[2]); }
    if(top === 'crown'){ hline(x0-1, x0+ww, y0, pal[2]); rect(x0+1, y0-S(2), ww-2, S(2), pal[1]); P(x0 + (ww>>1), y0-S(2)-1, pal[0]); }
    if(top === 'round'){ const rr = ww>>1; for(let y=0; y<=rr; y++){ const hw = Math.round(Math.sqrt(Math.max(0, rr*rr - y*y))); hline(x0+rr-hw, x0+rr+hw-((ww&1)?0:1), y0-y, y === rr ? pal[2] : pal[1]); } }
  };
  [[.27, 5, 8, 's'], [.3, 6, 12, 'w'], [.335, 5, 17, 'g', 'spire'], [.365, 7, 11, 's'], [.395, 6, 20, 'w', 'crown'],
   [.415, 6, 16, 'w'], [.505, 7, 21, 'g', 'step'], [.52, 6, 15, 'w'], [.55, 8, 28, 'w', 'crown'], [.59, 6, 18, 'g', 'round'], [.62, 9, 11, 's'],
   [.655, 6, 22, 'g', 'spire'], [.69, 7, 14, 'w'], [.725, 8, 13, 'g'], [.765, 6, 10, 'g'], [.8, 9, 12, 'g'],
   [.845, 6, 11, 'g'], [.875, 8, 13, 'g', 'crown'], [.915, 7, 17, 'w', 'round'], [.95, 6, 12, 'g'], [.975, 8, 15, 's']
  ].forEach(b => tower(...b));
  hline(Math.round(W*.26), W-1, hz-1, '#c8d5db');

  /* ---------- the National Commercial Bank tower (1983), Jeddah's best-known modern landmark:
     a windowless triangular tower of pale travertine with huge open courts cut into its faces
     (one high on the left, one low on the right, a third on the receding face) */
  {
    const NCB = {lit:'#f1ebdf', base:'#e2d9c7', side:'#c8bfac', sideD:'#b9b09d', court:'#76838f', courtL:'#909ca7', courtF:'#acb5bc', soffit:'#67727e', foot:'#c3b9a5'};   // hazy across the bay
    const w = S(13), h = S(37), x0 = Math.round(W*.435), top = hz - h, side = Math.max(2, Math.round(w*.38)), fw = w - side;
    for(let y=top; y<hz; y++) for(let i=0; i<w; i++){
      const front = i < fw;
      P(x0+i, y, y === top ? (front ? NCB.lit : NCB.base) : i === 0 ? NCB.lit : front ? NCB.base : (i === fw ? NCB.sideD : NCB.side)); }
    // the open courts: dark interior, a lit floor slab at the foot of each, a shaded soffit on top
    const court = (cx0, cy0, cw, ch) => { cx0 = Math.round(cx0); cy0 = Math.round(cy0); cw = Math.round(cw); ch = Math.round(ch);
      for(let y=cy0; y<cy0+ch; y++) for(let x=cx0; x<cx0+cw; x++){
        const j = y - cy0; P(x, y, j === 0 ? NCB.soffit : j === ch-1 ? NCB.courtF : (x === cx0 ? NCB.courtL : NCB.court)); } };
    court(x0 + 1, top + h*.1, fw*.62, h*.24);
    court(x0 + fw*.38, top + h*.52, fw*.62 - 1, h*.22);
    court(x0 + fw + 1, top + h*.33, side - 1, h*.26);
    for(let i=0; i<w; i++) P(x0+i, hz-1, NCB.foot);
  }

  /* ---------- the sea */
  R.bands(hz, wall, SEA); hline(0, W-1, hz, '#2b6ca3');
  { let y = hz + 2, i = 0;
    while(y < wall - 1){ const len = 1 + Math.min(4, i>>1), gap = S(11) + i*2, col = i < 2 ? '#7cc0e6' : i < 5 ? '#9fd8f5' : '#c9ecf8';
      for(let x = (i*7) % gap; x < W; x += gap + Math.round(r()*4)) hline(x, x+len-1, y, col);
      y += 2 + (i>>1); i++; } }

  /* ---------- a container ship on the horizon, heading for the port */
  {
    const x0 = Math.round(W*.035), L = S(26), y = hz;
    const box = ['#d94a3d', '#f7c948', '#4fa4d8', '#5cbf60', '#e8833a', '#4fa4d8', '#d94a3d', '#f7c948'];
    for(let x=0; x<L; x++){ const bow = x > L-4 ? x-(L-4) : 0; hline(x0+x, x0+x, y-2+Math.floor(bow/2), '#3a4a66'); if(y-1+Math.floor(bow/2) <= y) vline(x0+x, y-1+Math.floor(bow/2), y, x < L-1 ? '#2b3a52' : '#3a4a66'); }
    hline(x0+1, x0+L-3, y, '#8f2a24');
    for(let i=0, x=x0+S(5); x < x0+L-S(4); i++, x += 3){ const hgt = (i % 3 === 1) ? 3 : 2, col = box[i % box.length];
      for(let j=1; j<=hgt; j++){ P(x, y-2-j, col); P(x+1, y-2-j, col); P(x+2, y-2-j, '#5a6478'); } }
    rect(x0+1, y-7, 3, 5, WHITE.base); vline(x0+1, y-7, y-3, WHITE.hi); hline(x0+1, x0+3, y-5, '#3a4a66'); P(x0+2, y-8, '#d94a3d'); P(x0+3, y-8, WHITE.sh);
  }

  /* ---------- King Fahd's Fountain: a tall white jet out of the sea; at the top the water
     bursts into a plume that falls back in arcs, blown mostly to the right */
  {
    const fx = Math.round(W*.2), fb = hz + S(7), jt = Math.max(28, Math.round(H*.18));
    const drop = fb - jt;
    // falling arcs: [sideways reach, fall, rise], negative reach = upwind side
    const arcs = [[-S(6), drop*.42, S(2)], [-S(3), drop*.62, S(1.5)], [S(4), drop*.74, S(2)], [S(8), drop*.66, S(3)], [S(12), drop*.54, S(3.5)], [S(15.5), drop*.4, S(3.5)]];
    for(const [ax, fall, rise] of arcs){
      const n = Math.max(24, Math.round((Math.abs(ax) + fall)*2.5)), side = ax > 0 ? 1 : -1;
      let px = null, py = null;
      for(let i=0; i<=n; i++){ const t = i/n;
        const x = Math.round(fx + ax*Math.sqrt(t)), y = Math.round(jt + S(1) - rise*4*t*(1-t) + fall*t*t);
        if(x === px && y === py) continue; px = x; py = y;
        if(t > .8){ if((x + y) & 1) continue; P(x, y, t > .9 ? '#c9ecf8' : '#e4f8ff'); continue; }
        P(x, y, '#ffffff');
        if(t < .6){ P(x + side, y, t < .35 ? '#ffffff' : '#eef9fd'); P(x + (side > 0 ? 1 : 0), y+1, '#d4eef8'); } } }
    // head of the plume
    const hr = S(3.5);
    for(let y=-hr; y<=hr; y++) for(let x=-hr-1; x<=hr+1; x++){ const e = ((x-.5)/(hr+1.5))**2 + (y/(hr+.5))**2; if(e > 1) continue;
      P(fx+x, jt+y, (x > hr*.4 && y > 0) ? '#d4eef8' : '#ffffff'); }
    // the jet: a bright column, lit on the left, a little wider at the foot
    for(let y=jt+hr; y<=fb; y++){ const t = (y-jt)/(fb-jt);
      P(fx-1, y, '#ffffff'); P(fx, y, '#ffffff'); P(fx+1, y, '#d4eef8'); if(t > .8){ P(fx-2, y, '#e4f8ff'); P(fx+2, y, '#c4e4f2'); } }
    const sw = S(4);
    for(let x=-sw-1; x<=sw+1; x++){ const a = Math.abs(x);
      if(a <= sw-2) P(fx+x, fb-1, '#ffffff');
      P(fx+x, fb, a <= sw ? '#ffffff' : '#c9ecf8'); P(fx+x, fb+1, a <= sw ? (x > 0 ? '#9fd8f5' : '#c9ecf8') : '#7cc0e6'); }
    hline(fx-sw-S(4), fx-sw-2, fb+2, '#9fd8f5'); hline(fx+sw+2, fx+sw+S(4), fb+2, '#9fd8f5');
  }

  /* ---------- Al-Rahma mosque on its pillars over the water: white hall, turquoise dome, white minaret */
  {
    const mx = Math.round(W*.79), wl = hz + S(12), bw = S(30), bh = S(10), x0 = mx - (bw>>1), x1 = x0 + bw - 1;
    const pil = S(3), slab = wl - pil - 1, top = slab - bh;
    // pillars and the shade under the hall, with a broken reflection below
    rect(x0+1, wl-pil, bw-2, pil, '#1f5f8a');
    for(let x=x0+2; x<x1; x+=S(4)){ vline(x, wl-pil, wl-1, '#e6edf0'); P(x+1, wl-pil, '#9fb0b8'); }
    hline(x0+1, x1-1, wl, '#6fb6dc');
    for(let x=x0+3; x<x1-2; x+=4){ P(x, wl+2, '#c9ecf8'); P(x+1, wl+2, '#9fd8f5'); }
    hline(x0-1, x1+1, slab, WHITE.hi); P(x1+1, slab, WHITE.sh);
    // hall
    for(let y=top; y<slab; y++) for(let x=x0; x<=x1; x++){
      const col = y === top ? WHITE.hi : x === x0 ? WHITE.hi : x >= x1-S(2) ? WHITE.sh : WHITE.base;
      P(x, y, col); }
    for(let x=x0; x<=x1; x+=2) P(x, top-1, x >= x1-S(2) ? WHITE.sh : WHITE.hi);          // crenellated parapet
    // pointed-arch windows
    const wy = top + S(3), wh = Math.max(3, slab - wy - S(2));
    for(let x=x0+S(3); x+2<x1-S(2); x+=S(5)){
      P(x+1, wy, '#3a7fa8'); rect(x, wy+1, 3, wh-1, '#2b6ca3'); vline(x, wy+1, wy+wh-1, '#3a7fa8'); P(x+1, wy+1, '#4f95bd'); }
    // small corner domes
    for(const cx of [x0+S(3), x1-S(3)]){ const rr = S(2.5);
      for(let y=-rr; y<=0; y++) for(let x=-rr; x<=rr; x++) if(x*x + y*y <= rr*rr + rr*.5) P(cx+x, top-2+y, x+y < -rr*.6 ? TURQ[3] : x > rr*.3 ? TURQ[1] : TURQ[2]);
      P(cx, top-2-rr-1, '#f7c948'); }
    // drum and the big turquoise dome, slightly pointed
    const dr = S(8.5), dh = Math.round(dr*1.05), dcx = mx, drum = S(4), dbase = top - 1;
    for(let y=dbase-drum+1; y<=dbase; y++) for(let x=-dr+2; x<=dr-2; x++) P(dcx+x, y, x === -dr+2 ? WHITE.hi : x >= dr-3 ? WHITE.sh : WHITE.base);
    hline(dcx-dr+1, dcx+dr-1, dbase-drum+1, WHITE.hi);
    for(let x=dcx-dr+4; x<dcx+dr-3; x+=3){ P(x, dbase-1, '#2b6ca3'); P(x, dbase-2, '#3a7fa8'); }
    const dy0 = dbase - drum;
    for(let y=-dh; y<=0; y++){ const v = -y/dh, hw = dr*Math.sqrt(Math.max(0, 1 - v*v))*(1 - .12*v*v*v);
      for(let x=-Math.round(hw); x<=Math.round(hw); x++){ const nx = x/dr, l = -nx*.65 + v*.5 + .1;
        P(dcx+x, dy0+y, l > .72 ? TURQ[4] : l > .42 ? TURQ[3] : l > .02 ? TURQ[2] : l > -.35 ? TURQ[1] : TURQ[0]); } }
    hline(dcx-dr, dcx+dr, dy0, TURQ[1]); P(dcx-dr, dy0, TURQ[2]); P(dcx+dr, dy0, TURQ[0]);
    vline(dcx, dy0-dh-S(3), dy0-dh-1, '#c98a1a'); P(dcx, dy0-dh-S(3)-1, '#f7c948'); P(dcx-1, dy0-dh-S(2), '#f7c948');
    // slim white minaret at the right end, with a balcony and a turquoise cap
    const mw = 3, mnx = x1 - S(2) - 1, mTop = dy0 - dh - S(6);
    for(let y=mTop; y<top; y++){ P(mnx, y, WHITE.hi); P(mnx+1, y, WHITE.base); P(mnx+2, y, WHITE.sh); }
    for(const b of [mTop + Math.round((top-mTop)*.28), mTop + Math.round((top-mTop)*.62)]){ hline(mnx-1, mnx+mw, b, WHITE.hi); P(mnx+mw, b, WHITE.sh); hline(mnx-1, mnx+mw, b+1, WHITE.dk); }
    hline(mnx, mnx+2, mTop-1, TURQ[2]); P(mnx, mTop-1, TURQ[3]); P(mnx+2, mTop-1, TURQ[1]); P(mnx+1, mTop-2, TURQ[2]); P(mnx+1, mTop-3, TURQ[3]); P(mnx+1, mTop-4, '#f7c948');
  }

  /* ---------- a white motor yacht heading left, with its wake */
  {
    const L = S(34), wl = hz + S(17), bx = Math.round(W*.49);
    const buf = new Map(), put = (x, y, col) => buf.set(x+','+y, [x, y, col]);
    // hull: raked bow on the left, straight transom on the right
    for(let x=0; x<L; x++){ const t = x/L;
      const deck = wl - 5 - (t < .18 ? 1 : 0), bot = t < .22 ? Math.round(wl - 5 + (t/.22)*5) : wl;
      for(let y=deck; y<=bot; y++){ let col = y === deck ? '#ffffff' : y === deck+2 && t > .08 ? '#2b4c7a' : y >= bot-1 && t > .2 ? '#c3ced4' : '#f1f4f5';
        if(x === L-1) col = '#c3ced4'; put(bx+x, y, col); } }
    // main deck cabin with a dark window band
    const c0 = Math.round(L*.3), c1 = Math.round(L*.88);
    for(let y=wl-8; y<=wl-6; y++){ const xs = c0 + (wl-6-y); for(let x=xs; x<=c1; x++) put(bx+x, y, y === wl-8 ? '#ffffff' : (y === wl-7 && x > xs && x < c1-1) ? '#1f3448' : x === c1 ? '#c3ced4' : '#f1f4f5'); }
    put(bx+c0+2, wl-7, '#4fa4d8');
    // flybridge with its windscreen and a radar arch
    const f0 = Math.round(L*.46), f1 = Math.round(L*.78);
    for(let y=wl-10; y<=wl-9; y++){ const xs = f0 + (wl-9-y); for(let x=xs; x<=f1; x++) put(bx+x, y, y === wl-10 ? '#ffffff' : x < xs+3 ? '#1f3448' : x === f1 ? '#c3ced4' : '#f1f4f5'); }
    const ax = bx + Math.round(L*.66); put(ax, wl-11, '#e6edf0'); put(ax+1, wl-12, '#ffffff'); put(ax+2, wl-12, '#e6edf0'); put(ax+3, wl-11, '#c3ced4'); put(ax+1, wl-13, '#9aa3a8');
    const OUT = C('#2a3b52');
    for(const [x, y] of buf.values()) for(const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ if(!buf.has((x+dx)+','+(y+dy))) R.set(x+dx, y+dy, OUT); }
    for(const [x, y, col] of buf.values()) P(x, y, col);
    // wake behind the stern and a bow wave
    hline(bx+L, bx+L+S(8), wl, '#ffffff'); hline(bx+L+2, bx+L+S(14), wl+1, '#e4f8ff'); hline(bx+L+S(9), bx+L+S(20), wl+2, '#9fd8f5');
    P(bx-1, wl, '#ffffff'); P(bx-2, wl+1, '#e4f8ff'); hline(bx+2, bx+L-2, wl+1, '#2a6f9c');
  }

  /* ---------- the Corniche promenade: curb, paving with a terracotta band */
  hline(0, W-1, wall, PAVE.curbHi); hline(0, W-1, wall+1, PAVE.curb); hline(0, W-1, wall+2, PAVE.curbS);
  rect(0, wall+3, W, H-wall-3, PAVE.base);
  { const rows = []; let y = wall+3, g = 3; while(y < H){ rows.push(y); y += g; g += 1; }
    rows.forEach((y, i) => { hline(0, W-1, y, PAVE.joint); const step = S(8) + i*3, off = (i & 1) ? step>>1 : 0; const y2 = rows[i+1] || H;
      for(let x=off; x<W; x+=step) vline(x, y+1, y2-1, PAVE.joint); });
    const tb = rows[2] || wall+8, te = (rows[3] || tb+4) - 1;
    for(let y=tb; y<=te; y++) for(let x=0; x<W; x++) P(x, y, y === tb ? PAVE.terraD : ((x + y*2) % 8 < 4) ? PAVE.terra : PAVE.terraL);
    hline(0, W-1, te+1, PAVE.terraD); }

  /* ---------- palms and lamp posts on the promenade */
  const frond = (cx, cy, ex, ey, qx, qy, thick, lit) => {
    const n = Math.ceil(Math.hypot(ex-cx, ey-cy)*1.5) + 2, steep = Math.abs(ey-cy) > Math.abs(ex-cx); const pts = [];
    for(let i=0; i<=n; i++){ const t = i/n, u = 1-t; pts.push([Math.round(u*u*cx + 2*u*t*qx + t*t*ex), Math.round(u*u*cy + 2*u*t*qy + t*t*ey), t]); }
    const wOf = t => Math.max(1, Math.round(thick*(1 - t*.75)));
    for(const [x, y, t] of pts){ const w = wOf(t); for(let j=0; j<w; j++) P(steep ? x+j : x, steep ? y : y+j, PALM.f1); }
    for(const [x, y, t] of pts){ const w = wOf(t); if(!steep && t > .15 && ((x+y) & 1)) P(x, y+w, PALM.f0); if(steep && t > .2) P(x+w, y, PALM.f0); }
    if(lit) for(const [x, y, t] of pts) if(t > .06 && t < .7) P(x, y, PALM.f2);
  };
  const palm = (x, base, h, lean) => {
    x = Math.round(x); base = Math.round(base);
    hline(x+1, x+S(10), base+1, PAVE.shadow); hline(x+2, x+S(7), base+2, PAVE.shadow);
    rect(x-2, base-1, 7, 3, '#c9bda3'); hline(x-2, x+4, base-1, '#e6ddca');
    let cx = x, cy = base - h;
    for(let y=base-1; y>=base-h; y--){ const d = base-y, ox = Math.round(lean*(d/h)*(d/h)*S(6));
      P(x+ox, y, PALM.trunk); P(x+ox+1, y, PALM.trunk); P(x+ox+2, y, PALM.trunkD);
      if(d % 2 === 0) P(x+ox+2, y, PALM.ring); if(d % 4 === 1) P(x+ox, y, '#c08a58');
      cx = x + ox + 1; cy = y; }
    const L = Math.round(h*.52), th = h > 36 ? 4 : 3;
    const F = (fx, fy, qx, qy, t2, lit) => frond(cx, cy, cx+Math.round(fx*L), cy+Math.round(fy*L), cx+Math.round(qx*L), cy+Math.round(qy*L), t2, lit);
    F(-.62, 1.0, -.42, .1, th-1, false); F(.66, 1.0, .44, .1, th-1, false);
    F(-1.0, .72, -.5, -.2, th, false); F(1.0, .72, .5, -.2, th, false);
    F(-.95, .2, -.45, -.45, th, true); F(.95, .2, .45, -.45, th, true);
    F(-.55, -.42, -.22, -.62, th-1, true); F(.6, -.38, .28, -.6, th-1, true);
    F(-.08, -.6, -.05, -.4, th-1, true);
    rect(cx-1, cy-1, 3, 3, PALM.f1); P(cx-1, cy-1, PALM.f2); P(cx+1, cy+1, PALM.f0);
  };
  const lamp = (x, base, h) => {
    x = Math.round(x); base = Math.round(base);
    hline(x+1, x+S(6), base+1, PAVE.shadow);
    rect(x-1, base-1, 3, 2, '#3a3f58'); vline(x, base-h, base-1, '#3a3f58'); vline(x-1, base-h+2, base-3, '#5f6a80');
    // two lanterns on a cross-arm
    hline(x-S(3), x+S(3), base-h, '#3a3f58');
    for(const lx of [x-S(3), x+S(3)]){ P(lx, base-h+1, '#fff0a0'); P(lx, base-h+2, '#f7c948'); P(lx-1, base-h+1, '#3a3f58'); P(lx+1, base-h+1, '#3a3f58'); }
    P(x, base-h-1, '#3a3f58');
  };
  // a family out for a walk on the Corniche (tiny figures, no faces)
  const person = (rows, map, x, y) => { hline(x+1, x+rows[0].length, y+rows.length, PAVE.shadow);
    rows.forEach((row, j) => { for(let i=0; i<row.length; i++) if(row[i] !== '.') P(x+i, y+j, map[row[i]]); }); };
  { const fy = wall + S(12), fx = Math.round(W*.45);
    const map = {w:'#ffffff', W:'#dfe6e9', r:'#d94a3d', s:'#c98f62', k:'#1f1f24', K:'#3a3a44', h:'#3b2a22', y:'#f7c948', Y:'#c98a1a', b:'#4fa4d8', B:'#2b6ca3', q:'#8a6a52'};
    person(['.k.', 'rwr', 'rsr', 'wwW', 'wwW', 'wwW', 'wwW', 'wwW', 'q.q'], map, fx, fy - 9);
    person(['.h.', 'hsh', 'yyY', 'yyY', 'bbB', 'b.B'], map, fx + 4, fy - 6);
    person(['.k.', 'Kkk', 'Ksk', 'Kkk', 'Kkk', 'Kkk', 'Kkk', 'Kkk'], map, fx + 8, fy - 8);
    P(fx + 3, fy - 5, '#c98f62'); P(fx + 7, fy - 4, '#c98f62'); }
  lamp(W*.34, H - S(6), S(26));
  lamp(W*.67, H - S(6), S(26));
  palm(W*.035, H - S(4), S(42), 1);
  palm(W*.93, H - S(3), S(38), -1);
};
})();
