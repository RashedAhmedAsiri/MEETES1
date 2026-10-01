/* scenes/qassim.js — modern Qassim (Buraidah): farming, dates and palms.
   The Buraidah water tower rising over the city on the horizon, green
   centre-pivot fields with their long sprinkler arms, a modern greenhouse,
   neat rows of date palms, and a red tractor hauling crates of dates.
   Everything is drawn per pixel on the scene raster (one pixel grid). */
(() => {
'use strict';
const RGB = {};
const C = h => RGB[h] || (RGB[h] = hexRGB(h));

const SKY = ['#5fb0e0', '#82c3ea', '#aad8f0', '#d8eff2'];
const GROUND = ['#e9d8a6', '#e2c88e', '#d8b77a'];
const CONC = {hi:'#ffffff', base:'#eee9de', mid:'#dcd4c3', sh:'#bfb39a', dk:'#8f836c'};
const GLASS = {hi:'#9fd8f5', base:'#4fa4d8', dk:'#2b6ca3'};
const FIELD = {
  green:{base:'#5cbf60', wet:'#3a8f45', track:'#4aa853', rimHi:'#9be07a', rimSh:'#2f7a3a'},
  lime:{base:'#9fcf5a', wet:'#7fb04a', track:'#8fbf52', rimHi:'#c8e888', rimSh:'#6f9f3a'},
  wheat:{base:'#ecc85a', wet:'#d6a739', track:'#e0b84a', rimHi:'#fff0a0', rimSh:'#c98a1a'},
};
const PALM = {trunk:'#a8744a', trunkD:'#7a4e2e', ring:'#4a2e1c', f0:'#0e6b3a', f1:'#1f8f4e', f2:'#5cbf60', date:'#f7c948', dateD:'#c98a1a'};
const FAR = {palm:'#5f9a6a', palmHi:'#7cb483', city:'#c9d3d6', citySh:'#aebcc2', cityWin:'#9fb4c0'};
const METAL = {hi:'#e6eef2', base:'#b8c0c4', dk:'#7f878c'};

SCENES.qassim = k => {
  const {R, W, H} = k;
  const s = Math.min(W/224, H/134);
  const S = v => Math.max(1, Math.round(v*s));
  const P = (x, y, h) => R.set(x, y, C(h));
  const rect = (x, y, w, h, col) => { const c = C(col); x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    for(let j=y; j<y+h; j++) for(let i=x; i<x+w; i++) R.set(i, j, c); };
  const hline = (x0, x1, y, col) => rect(x0, y, x1-x0+1, 1, col);
  const vline = (x, y0, y1, col) => rect(x, y0, 1, y1-y0+1, col);
  const line = (x0, y0, x1, y1, col, every=1) => { x0=Math.round(x0); y0=Math.round(y0); x1=Math.round(x1); y1=Math.round(y1);
    const c = C(col), dx = Math.abs(x1-x0), dy = -Math.abs(y1-y0), sx = x0<x1?1:-1, sy = y0<y1?1:-1; let e = dx+dy, n = 0;
    for(;;){ if(n++ % every === 0) R.set(x0, y0, c); if(x0===x1 && y0===y1) break; const e2 = 2*e; if(e2>=dy){ e+=dy; x0+=sx; } if(e2<=dx){ e+=dx; y0+=sy; } } };

  const hz = Math.round(H*.5);

  /* ---------- sky, sun, clouds */
  R.bands(0, hz, SKY);
  const sunX = Math.round(W*.06), sunY = Math.max(Math.round(H*.3), 34), sr = S(8);
  R.disc(sunX, sunY, sr+2, '#bfe3f2'); R.disc(sunX, sunY, sr, '#f7c948'); R.disc(sunX-1, sunY-1, sr-2, '#fff0a0');
  const cloud = (cx, cy, w) => {
    const bumps = [[-.32, 0, .34, 2.2], [0, -.1, .3, 3.6], [.3, 0, .28, 2.6], [.02, .12, .55, 1.6]];
    const inside = (x, y) => { if(y > cy+1) return false; for(const [ox, oy, rx, ry] of bumps){ const ex = (x-(cx+ox*w))/(rx*w), ey = (y-(cy+oy*w*.1))/(ry*s+.01); if(ex*ex+ey*ey <= 1) return true; } return false; };
    for(let y=cy-Math.round(6*s)-2; y<=cy+1; y++) for(let x=Math.round(cx-w); x<=Math.round(cx+w); x++){
      if(!inside(x, y)) continue; P(x, y, !inside(x, y+1) ? '#d7e8ef' : (!inside(x, y-1) || !inside(x-1, y)) ? '#ffffff' : '#f3f8f9'); }
  };
  cloud(Math.round(W*.27), Math.max(Math.round(H*.18), 30), S(11)); cloud(Math.round(W*.7), Math.max(Math.round(H*.3), 34), S(13));

  /* ---------- ground */
  R.bands(hz, H, GROUND);

  /* ---------- far horizon: a belt of palm groves and the city of Buraidah */
  const towerX = Math.round(W*.41);
  for(let x=0; x<W; x++){ const cityZone = Math.abs(x - towerX) < W*.13; if(cityZone) continue;
    const b = 2 + ((x*7) % 11 < 4 ? 1 : 0) + ((x % 6) < 3 ? 1 : 0); for(let y=hz-b; y<hz+1; y++) P(x, y, FAR.palm); if((x % 6) === 1) P(x, hz-b, FAR.palmHi); }
  const city = [[-.12, 5, 4], [-.09, 7, 6], [-.055, 4, 5], [.03, 8, 5], [.065, 5, 7], [.1, 6, 4]];
  for(const [f, h, w] of city){ const x = Math.round(towerX + f*W), hh = S(h), ww = S(w);
    rect(x, hz-hh, ww, hh+1, FAR.city); vline(x+ww-1, hz-hh, hz, FAR.citySh); for(let y=hz-hh+2; y<hz-1; y+=2) hline(x+1, x+ww-3, y, FAR.cityWin); }

  /* ---------- Buraidah water tower: slender shaft, large rounded tank with a window band, mast */
  {
    const tRx = S(14), tRy = S(10), tY = Math.max(Math.round(H*.25), Math.min(27 + tRy, Math.round(H*.34))), sw = S(3);
    for(let y=tY; y<=hz; y++){ const t = (y-tY)/(hz-tY); const hw = Math.round(sw*(.85 + t*.45));
      hline(towerX-hw, towerX+hw, y, CONC.base); P(towerX-hw, y, CONC.hi); P(towerX+hw, y, CONC.sh); if(hw > 1) P(towerX+hw-1, y, CONC.mid);
      if(hw > 2 && (y - tY) % 4 === 0) P(towerX, y, CONC.mid); }
    hline(towerX-sw-2, towerX+sw+2, hz, CONC.sh);
    // tank: a big rounded bowl on a short cone, lit from the upper left
    const top = tY - tRy, coneH = S(7), L = [-.5, .62, .6];
    for(let y=top; y<=tY; y++){ const v = (tY-y)/tRy, hw = tRx*Math.sqrt(Math.max(0, 1-v*v)), a = Math.round(hw);
      for(let x=-a; x<=a; x++){ const nx = x/(tRx+.5), nz = Math.sqrt(Math.max(0, 1-nx*nx-v*v)); const I = L[0]*nx + L[1]*v + L[2]*nz;
        P(towerX+x, y, I > .8 ? CONC.hi : I > .5 ? CONC.base : I > .2 ? CONC.mid : CONC.sh); } }
    for(let y=tY+1; y<=tY+coneH; y++){ const v = (y-tY)/coneH, hw = Math.round(tRx*(1-v) + (sw+1)*v);
      for(let x=-hw; x<=hw; x++) P(towerX+x, y, x < -hw*.45 ? CONC.mid : x < hw*.35 ? CONC.sh : CONC.dk); }
    // window band round the widest part
    const wb = tY - 2;
    for(let x=-tRx+1; x<=tRx-1; x++){ const X = towerX + x; P(X, wb, x < -tRx*.35 ? GLASS.hi : x < tRx*.4 ? GLASS.base : GLASS.dk); P(X, wb+1, x < tRx*.4 ? GLASS.base : GLASS.dk); if((x & 1) === 0) P(X, wb+1, GLASS.dk); }
    hline(towerX-tRx+1, towerX+tRx-1, wb-1, CONC.hi); hline(towerX-tRx, towerX+tRx, tY, CONC.base); P(towerX-tRx, tY, CONC.hi); P(towerX+tRx, tY, CONC.sh);
    // crown and mast with a red light
    rect(towerX-1, top-S(3), 3, S(3), CONC.base); P(towerX-1, top-S(3), CONC.hi); P(towerX+1, top-1, CONC.sh);
    vline(towerX, top-S(3)-S(8), top-S(3)-1, METAL.dk); P(towerX, top-S(3)-S(8)-1, '#d94a3d');
  }

  /* ---------- centre-pivot fields (circles seen in perspective) with their sprinkler arms */
  const field = (cx, cy, rx, ry, pal, armAng) => {
    cx = Math.round(cx); cy = Math.round(cy); rx = Math.round(rx); ry = Math.max(2, Math.round(ry));
    const X = rx + .5, Y = ry + .5, inE = (x, y) => (x/X)**2 + (y/Y)**2 <= 1;
    for(let y=-ry; y<=ry; y++) for(let x=-rx; x<=rx; x++){ if(!inE(x, y)) continue; const d = Math.sqrt((x/X)**2 + (y/Y)**2);
      let col = pal.base;
      if(armAng !== null){ const a = Math.atan2(y/Y, x/X); let da = armAng - a; while(da < 0) da += Math.PI*2; while(da >= Math.PI*2) da -= Math.PI*2; if(da < 1.1 && d > .1) col = pal.wet; }
      if(ry >= 6 && (Math.abs(d - .38) < .55/ry || Math.abs(d - .7) < .55/ry)) col = pal.track;
      if(!inE(x, y+1)) col = pal.rimSh; else if(!inE(x, y-1)) col = pal.rimHi;
      P(cx+x, cy+y, col); }
    if(armAng === null || ry < 4) return;
    // the arm: a long truss raised on wheeled A-frames, from the centre tower to the rim, spraying water
    const ex = cx + Math.round(rx*Math.cos(armAng)*.97), ey = cy + Math.round(ry*Math.sin(armAng)*.97), lift = Math.max(3, Math.round(ry*.38));
    line(cx+2, cy+1, ex+2, ey+1, pal.rimSh);                                  // shadow on the crop
    const len = Math.hypot(ex-cx, ey-cy), n = Math.max(3, Math.round(len/S(11)));
    for(let i=4; i<len-1; i+=2){ const t = i/len, x = Math.round(cx + (ex-cx)*t), y = Math.round(cy + (ey-cy)*t) - lift + 2;   // sprinkler curtain
      for(let j=0; j<lift-1; j++) if(((j + (i>>1)) & 1) === 0) P(x, y+j, j === 0 ? '#e4f8ff' : '#a6e0f0'); }
    for(let i=1; i<=n; i++){ const t = i/n, x = Math.round(cx + (ex-cx)*t), y = Math.round(cy + (ey-cy)*t);
      for(let j=1; j<lift; j++){ const o = Math.ceil(j/2); P(x-o, y-lift+j, METAL.dk); P(x+o, y-lift+j, METAL.dk); }
      const o = Math.ceil((lift-1)/2); P(x-o, y, '#1f1f24'); P(x+o, y, '#1f1f24'); }
    line(cx, cy-lift, ex, ey-lift, METAL.hi); line(cx, cy-lift+1, ex, ey-lift+1, METAL.base);
    for(let i=0; i<len; i+=2){ const t = i/len; P(Math.round(cx + (ex-cx)*t), Math.round(cy + (ey-cy)*t) - lift + 1, METAL.dk); }
    rect(cx-1, cy-lift-2, 3, lift+3, METAL.base); P(cx-1, cy-lift-2, METAL.hi); vline(cx-1, cy-lift-1, cy, METAL.hi); vline(cx+1, cy-lift-1, cy, METAL.dk);
    P(ex, ey-lift-1, METAL.base); P(ex+1, ey-lift, METAL.dk);
  };
  field(W*.12, hz+S(4), S(24), S(2.5), FIELD.wheat, null);
  field(W*.66, hz+S(3), S(20), S(2.2), FIELD.lime, null);
  field(W*.9, hz+S(5), S(18), S(2.6), FIELD.green, null);
  field(W*.25, hz+S(20), S(52), S(12), FIELD.green, 2.35);

  /* ---------- date palms in neat rows */
  const frond = (cx, cy, ex, ey, qx, qy, thick, lit) => {
    const n = Math.ceil(Math.hypot(ex-cx, ey-cy)*1.5) + 2, steep = Math.abs(ey-cy) > Math.abs(ex-cx); const pts = [];
    for(let i=0; i<=n; i++){ const t = i/n, u = 1-t; pts.push([Math.round(u*u*cx + 2*u*t*qx + t*t*ex), Math.round(u*u*cy + 2*u*t*qy + t*t*ey), t]); }
    const wOf = t => Math.max(1, Math.round(thick*(1 - t*.75)));
    for(const [x, y, t] of pts){ const w = wOf(t); for(let j=0; j<w; j++) P(steep ? x+j : x, steep ? y : y+j, PALM.f1); }
    for(const [x, y, t] of pts){ const w = wOf(t); if(!steep && t > .15 && ((x+y) & 1)) P(x, y+w, PALM.f0); if(steep && t > .2) P(x+w, y, PALM.f0); }
    if(lit) for(const [x, y, t] of pts) if(t > .06 && t < .7) P(x, y, PALM.f2);
  };
  // hand-drawn crowns for small and medium palms (L light, G mid, D dark, y/o dates); '+' marks where the trunk meets the crown
  const CROWN = {
    s:['..LL...LL..',
       '.LGGL.LGGL.',
       'LGDGGLGGDGL',
       'G.DGy+yGD.G',
       'D..D.o.D..D'],
    m:['......LL.LL......',
       '...LLLGGLGGLLL...',
       '.LLGGGGDLDGGGGLL.',
       'LGGDD.LGGGL..DDGL',
       'GGD..LGDy+yDGL.DG',
       'GD..LGD.yoy.DGL.D',
       'G...GD..oyo..DG..',
       'D...D....o....D..']};
  const CC = {L:'#5cbf60', G:'#1f8f4e', D:'#0e6b3a', y:'#f7c948', o:'#c98a1a', '+':'#1f8f4e'};
  const palm = (x, base, h) => {
    x = Math.round(x); base = Math.round(base); const top = base - h, big = h >= 30, g = big ? null : h >= 15 ? CROWN.m : CROWN.s, tw = h >= 15 ? 3 : 2;
    // short shadow on the sand, to the lower right
    const sw2 = big ? 8 : h >= 15 ? 5 : 3; hline(x+1, x+1+sw2, base+1, '#d2b273'); hline(x+2, x+sw2, base+2, '#d9bd80');
    for(let y=base; y>=top; y--){ const d = base-y;
      for(let i=0; i<tw; i++) P(x+i, y, i === tw-1 ? PALM.trunkD : PALM.trunk);
      if(d % 2 === 0) P(x+tw-1, y, PALM.ring); if(tw > 2 && d % 4 === 1) P(x, y, '#c08a58'); }
    const cx = x + (tw>>1), cy = top;
    if(g){ let ax = 0, ay = 0; g.forEach((row, j) => { const i = row.indexOf('+'); if(i >= 0){ ax = i; ay = j; } });
      g.forEach((row, j) => { for(let i=0; i<row.length; i++){ const ch = row[i]; if(ch !== '.') P(cx - ax + i, cy - ay + j + 1, CC[ch]); } });
      return; }
    const L = Math.round(h*.55), th = 3;
    const F = (fx, fy, qx, qy, t2, lit) => frond(cx, cy, cx+Math.round(fx*L), cy+Math.round(fy*L), cx+Math.round(qx*L), cy+Math.round(qy*L), t2, lit);
    F(-1.0, .7, -.5, -.25, th, false); F(1.0, .7, .5, -.25, th, false);
    for(const d of [-2, 1]){ const bx = cx + d, by = cy + 2; P(bx, by, PALM.date); P(bx+1, by, PALM.date); P(bx, by+1, PALM.dateD); P(bx+1, by+1, PALM.date); P(bx, by+2, PALM.dateD); P(bx+1, by+2, PALM.dateD); }
    F(-.95, .18, -.45, -.45, th, true); F(.95, .18, .45, -.45, th, true);
    F(-.6, -.4, -.25, -.6, th-1, true); F(.62, -.36, .28, -.6, th-1, true);
    rect(cx-1, cy-1, 3, 2, PALM.f1); P(cx-1, cy-1, PALM.f2);
  };
  const grove = (y, h, x0, x1, gap) => { for(let x=x0; x<=x1; x+=gap) palm(x, y, h); };

  /* ---------- modern greenhouse: arched bays of clear film, crops inside */
  const greenhouse = (x0, yb, w, h, bays) => {
    x0 = Math.round(x0); yb = Math.round(yb); w = Math.round(w); h = Math.round(h);
    const bw = Math.floor(w / bays), ah = Math.max(2, Math.round(bw*.35));
    rect(x0, yb-h, bays*bw+1, h, '#dff1f5');
    for(let y=yb-h+2; y<yb-1; y+=2) for(let x=x0+2; x<x0+bays*bw-1; x+=1) if((x + (y>>1)) % 3 === 0) P(x, y, '#8fbf52');
    for(let b=0; b<bays; b++){ const bx = x0 + b*bw;
      for(let x=0; x<=bw; x++){ const t = (x/bw)*2-1; const top = Math.round(yb - h - ah*Math.sqrt(Math.max(0, 1-t*t)));
        for(let y=top; y<yb-h; y++) P(bx+x, y, y === top ? '#ffffff' : x < bw*.45 ? '#eef8fa' : '#cfe6ec'); }
      vline(bx, yb-h, yb-1, '#a9c4cc'); }
    vline(x0+bays*bw, yb-h, yb-1, '#a9c4cc'); hline(x0, x0+bays*bw, yb-h, '#b9d3da'); hline(x0, x0+bays*bw, yb-1, '#9ab7c0');
    for(let x=x0+Math.round(bw/2); x<x0+bays*bw; x+=bw) vline(x, yb-h+1, yb-2, '#c4dde4');
    rect(x0+Math.round(bw*.3), yb-Math.round(h*.6), Math.max(2, Math.round(bw*.4)), Math.round(h*.6), '#9ab7c0');
  };

  // back to front
  grove(hz+S(8), S(11), Math.round(W*.72), W+4, S(10));
  greenhouse(W*.5, hz+S(22), S(48), S(9), 4);
  grove(hz+S(15), S(16), Math.round(W*.76)+S(4), W+6, S(14));
  grove(hz+S(27), S(24), Math.round(W*.8), W+8, S(19));

  /* ---------- farm road and the tractor hauling dates */
  const roadY = Math.round(H*.8), roadH = S(7);
  rect(0, roadY, W, roadH, '#eedfb4'); hline(0, W-1, roadY, '#f7ebc8'); hline(0, W-1, roadY+roadH-1, '#c9a66b');
  for(let x=0; x<W; x+=5){ P(x, roadY+2, '#dcc893'); P(x+2, roadY+roadH-3, '#dcc893'); }

  // foreground: rows of round leafy crops, bigger toward the viewer
  { const y0 = roadY + roadH; rect(0, y0, W, H-y0, '#b98a55'); hline(0, W-1, y0, '#c9a66b');
    let y = y0 + 2, i = 0;
    while(y < H + 4){ const r = Math.round(2 + i*1.5), gap = 2*r + 2, off = (i & 1) ? Math.round(gap/2) : 0;
      hline(0, W-1, y + r, '#9a6636');
      for(let cx0 = -gap + off; cx0 < W + gap; cx0 += gap){ const rr = r - (k.r() < .3 ? 1 : 0), cx = cx0 + (k.r() < .5 ? 0 : 1);
        for(let dy=-rr; dy<=rr; dy++) for(let dx=-rr; dx<=rr; dx++){ if(dx*dx + dy*dy > rr*rr + rr*.5) continue;
          const l = -dx - dy*1.2; P(cx+dx, y+dy, l > rr*1.4 ? '#9be07a' : l > -rr*.9 ? '#5cbf60' : '#3a8f45'); } }
      y += r + 1 + Math.round(r*.6); i++; } }

  // tractor (faces left) with a trailer of date crates, built in a small buffer then outlined
  const buf = new Map(), put = (x, y, col) => buf.set(x+','+y, [x, y, col]);
  const disc = (cx, cy, r, f) => { for(let y=-r; y<=r; y++) for(let x=-r; x<=r; x++) if(x*x+y*y <= r*r + r*.6) put(cx+x, cy+y, f(x, y)); };
  const tx = Math.round(W*.36), ty = roadY + S(4);                     // ground point under the rear wheel
  const tyre = (x, y) => (x+y < -3 ? '#5f676c' : x*x+y*y > 16 && (x+y) % 3 === 0 ? '#34343c' : '#1f1f24');
  // trailer
  const trX = tx + 12;
  for(let x=trX; x<trX+22; x++){ put(x, ty-7, '#a8744a'); put(x, ty-6, '#7a4e2e'); put(x, ty-5, '#4a2e1c'); }
  for(let x=tx+6; x<trX; x++) put(x, ty-5, '#5f676c');
  for(let c=0; c<4; c++) for(let row=0; row<(c === 0 || c === 3 ? 1 : 2); row++){ const cx0 = trX + 1 + c*5, cy0 = ty-8 - row*5;
    for(let y=0; y<4; y++) for(let x=0; x<5; x++) put(cx0+x, cy0-y, x === 4 ? '#9a6636' : y === 3 ? '#ecc88a' : '#d09a5a');
    for(let x=0; x<5; x++) put(cx0+x, cy0-4, (x & 1) ? '#c98a1a' : '#7a4e2e'); put(cx0+1, cy0-5, '#f7c948'); put(cx0+3, cy0-5, '#c98a1a'); put(cx0+2, cy0-5, '#7a4e2e'); }
  disc(trX+15, ty-3, 3, (x, y) => x*x+y*y <= 1 ? (x+y < 0 ? '#f7c948' : '#c98a1a') : tyre(x, y));
  // tractor body
  for(let y=ty-11; y<=ty-6; y++) for(let x=tx-10; x<=tx+2; x++){ const col = y === ty-11 ? '#f08070' : y >= ty-7 ? '#8f2a24' : '#d94a3d'; put(x, y, col); }
  for(let y=ty-10; y<=ty-7; y++) put(tx-11, y, y % 2 ? '#34343c' : '#9aa3a8');                   // grille
  put(tx-11, ty-11, '#f7c948');                                                                    // headlight
  for(let y=ty-15; y<=ty-12; y++) put(tx-6, y, '#5f676c'); put(tx-6, ty-16, '#34343c');            // exhaust
  // cab over the rear wheel
  for(let y=ty-21; y<=ty-11; y++) for(let x=tx-1; x<=tx+8; x++){ let col = '#d94a3d';
    if(y <= ty-20) col = y === ty-21 ? '#ffffff' : '#e4e9ec';
    else if(x > tx && x < tx+7 && y > ty-19 && y < ty-12) col = (x - tx) + (y - (ty-19)) < 4 ? '#e4f8ff' : x > tx+4 ? '#4fa4d8' : '#9fd8f5';
    else if(x === tx+8) col = '#8f2a24'; else if(x === tx-1) col = '#f08070';
    put(x, y, col); }
  put(tx-2, ty-21, '#ffffff'); put(tx+9, ty-21, '#e4e9ec');
  // fender and wheels
  for(let x=tx-3; x<=tx+10; x++){ put(x, ty-11, '#f08070'); put(x, ty-10, '#d94a3d'); }
  disc(tx+3, ty-5, 5, (x, y) => x*x+y*y <= 4 ? (x+y < 0 ? '#f7c948' : x*x+y*y === 0 ? '#c98a1a' : '#e0b030') : tyre(x, y));
  disc(tx-8, ty-3, 3, (x, y) => x*x+y*y <= 1 ? (x+y < 0 ? '#f7c948' : '#c98a1a') : tyre(x, y));
  // shadow on the road, then outline and flush
  for(let x=tx-11; x<=trX+22; x++) P(x+1, ty+1, '#c9a66b');
  const OUT = C('#3a2420');
  for(const [x, y] of buf.values()) for(const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ if(!buf.has((x+dx)+','+(y+dy))) R.set(x+dx, y+dy, OUT); }
  for(const [x, y, col] of buf.values()) P(x, y, col);
};
})();
