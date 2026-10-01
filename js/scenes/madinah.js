/* scenes/madinah.js — modern Madinah: Al-Masjid an-Nabawi today.
   The Green Dome on its drum, the cream mosque facade with arcades, tall
   minarets with balconies and golden crescents, the giant white canopy
   umbrellas open over the marble plaza, date palms and hotel towers.
   Everything is drawn per pixel on the scene raster (one pixel grid). */
(() => {
'use strict';
const RGB = {};
const C = h => RGB[h] || (RGB[h] = hexRGB(h));

/* colours (kept few; most come from PAL ramps used elsewhere in the game) */
const SKY = ['#7fc0e0', '#9fd0ea', '#c4e4f2', '#e6f3f2'];
const WALL = {hi:'#ffffff', lit:'#fbf8f1', base:'#f4efe2', mid:'#e6dcc6', sh:'#d3c6aa', dk:'#b3a58a'};
const ARCH = {base:'#b8a78a', dk:'#8c7a62', door:'#c9a66b'};
const GREEN = ['#0a4a2a', '#0e6b3a', '#1f8f4e', '#3aa865', '#7fd08a'];
const GOLD = {base:'#d6a739', hi:'#f7c948', dk:'#a87a1e'};
const GREY = {hi:'#e4e9ec', base:'#c3cace', sh:'#9aa3a8'};
const HOTEL = [
  {lit:'#e9e2d4', front:'#ddd3c1', side:'#c6b9a1', win:'#b3c4cc', winS:'#a0adb2', roof:'#f1ece2'},
  {lit:'#e3e4e0', front:'#d4d7d4', side:'#bcc1c0', win:'#a9bfcc', winS:'#98a8b2', roof:'#eceeec'},
];
const MARBLE = {base:'#f4efe6', line:'#e4dccd', sh:'#dcd3c2', edge:'#cfc5b0'};
const CANOPY = {rim:'#ffffff', top:'#eceeea', mid:'#dcdfdb', low:'#c8cdca', rib:'#b0b6b4', edge:'#98a0a0'};
const PALM = {trunk:'#a8744a', trunkD:'#7a4e2e', ring:'#4a2e1c', f0:'#0e6b3a', f1:'#1f8f4e', f2:'#5cbf60', date:'#e8833a', dateD:'#b0521f'};

SCENES.madinah = k => {
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

  const hz = Math.round(H*.63);            // where the mosque meets the marble plaza

  /* ---------- sky */
  R.bands(0, hz, SKY);
  const cloud = (cx, cy, w) => {           // flat-bottomed puffy cloud, lit from the upper left
    const bumps = [[-.32, 0, .34, 2.2], [0, -.1, .3, 3.6], [.3, 0, .28, 2.6], [.02, .12, .55, 1.6]];
    const inside = (x, y) => { if(y > cy+1) return false; for(const [ox, oy, rx, ry] of bumps){ const ex = (x-(cx+ox*w))/(rx*w), ey = (y-(cy+oy*w*.1))/(ry*s+ .01); if(ex*ex+ey*ey <= 1) return true; } return false; };
    for(let y=cy-Math.round(6*s)-2; y<=cy+1; y++) for(let x=Math.round(cx-w); x<=Math.round(cx+w); x++){
      if(!inside(x, y)) continue;
      const col = !inside(x, y+1) ? '#d7e8ef' : (!inside(x, y-1) || !inside(x-1, y)) ? '#ffffff' : '#f3f8f9';
      P(x, y, col); }
  };
  cloud(Math.round(W*.30), Math.round(H*.30), Math.round(12*s));
  cloud(Math.round(W*.84), Math.round(H*.36), Math.round(10*s));

  /* ---------- hotel towers behind the mosque */
  const tower = (x, w, h, t) => {
    x = Math.round(x); w = Math.round(w); h = Math.round(h); const top = hz - h, side = Math.max(2, Math.round(w*.3)), fw = w - side;
    rect(x, top, fw, h, t.front); rect(x+fw, top, side, h, t.side); vline(x, top, hz, t.lit);
    for(let y=top+3; y<hz-1; y+=3){ hline(x+1, x+fw-2, y, t.win); hline(x+fw+1, x+w-2, y, t.winS); }
    rect(x+1, top-2, w-2, 2, t.front); hline(x+1, x+fw-1, top-2, t.roof); rect(x+fw, top-2, side-1, 2, t.side);
    hline(x, x+fw-1, top, t.roof);
  };
  tower(W*.00, S(14), H*.34, HOTEL[0]); tower(W*.055, S(12), H*.46, HOTEL[1]); tower(W*.215, S(11), H*.27, HOTEL[1]);
  tower(W*.715, S(12), H*.34, HOTEL[1]); tower(W*.875, S(14), H*.50, HOTEL[0]); tower(W*.945, S(13), H*.33, HOTEL[1]);

  /* ---------- palms: ringed trunk, thick drooping fronds lit from the upper left, date bunches */
  const frond = (cx, cy, ex, ey, qx, qy, thick, lit) => {
    const n = Math.ceil(Math.hypot(ex-cx, ey-cy)*1.5) + 2;
    const pts = []; for(let i=0; i<=n; i++){ const t = i/n, u = 1-t; pts.push([Math.round(u*u*cx + 2*u*t*qx + t*t*ex), Math.round(u*u*cy + 2*u*t*qy + t*t*ey), t]); }
    for(const [x, y, t] of pts){ const w = Math.max(1, Math.round(thick*(1 - t*.75))); for(let j=0; j<w; j++) for(let i=0; i<(Math.abs(ey-cy) > Math.abs(ex-cx) ? w : 1); i++) P(x+i, y+j, PALM.f1); }
    for(const [x, y, t] of pts){ const w = Math.max(1, Math.round(thick*(1 - t*.75)));
      if(t > .15 && ((x+y) & 1)) { P(x, y+w, PALM.f0); if(t > .4 && (x % 3 === 0)) P(x, y+w+1, PALM.f0); } }
    if(lit) for(const [x, y, t] of pts) if(t > .06 && t < .7) P(x, y, PALM.f2);
  };
  const palm = (x, base, h, lean=1) => {
    x = Math.round(x); base = Math.round(base); const top = base - h, tw = h > 40 ? 3 : 2;
    let cx = x, cy = top;
    for(let y=base; y>=top; y--){ const t = (base-y)/h; const bx = x + Math.round(lean*t*t*h*.12);
      for(let i=0; i<tw; i++) P(bx+i, y, i === 0 ? PALM.trunk : i === tw-1 ? PALM.trunkD : PALM.trunk);
      if((base-y) % 3 === 0){ P(bx+tw-1, y, PALM.ring); if(tw > 2) P(bx+1, y, PALM.trunkD); }
      if(y === top){ cx = bx + (tw>>1); } }
    const L = Math.max(9, Math.round(h*.36)), th = h > 40 ? 3 : 2;
    const F = (fx, fy, qx, qy, t2, lit) => frond(cx, cy, cx+Math.round(fx*L), cy+Math.round(fy*L), cx+Math.round(qx*L), cy+Math.round(qy*L), t2, lit);
    F(-1.0, .62, -.5, -.3, th, false); F(1.0, .62, .5, -.3, th, false);
    // date bunches under the crown
    for(const d of [-2, 2]){ const bx = cx + d - (d > 0 ? 0 : 1), by = cy + 2;
      rect(bx, by, 2, 2, PALM.date); P(bx+1, by+1, PALM.dateD); P(bx, by+2, PALM.dateD); if(h > 40){ P(bx+1, by+2, PALM.date); P(bx, by+3, PALM.dateD); } }
    F(-.95, .12, -.45, -.5, th, true); F(.95, .12, .45, -.5, th, true);
    F(-.5, -.42, -.18, -.62, th-1, true); F(.55, -.38, .22, -.62, th-1, true);
    rect(cx-1, cy-1, 3, 2, PALM.f1); P(cx-1, cy-1, PALM.f2);
  };

  /* ---------- minaret */
  const crescent = (cx, y, big) => { if(big){ P(cx-2, y-1, GOLD.hi); P(cx+2, y-1, GOLD.base); P(cx-2, y, GOLD.hi); P(cx+2, y, GOLD.dk); hline(cx-1, cx+1, y+1, GOLD.base); P(cx-1, y+1, GOLD.hi); }
    else { P(cx-1, y, GOLD.hi); P(cx+1, y, GOLD.base); hline(cx-1, cx+1, y+1, GOLD.base); P(cx-1, y+1, GOLD.hi); } };
  const minaret = (cx, top, base, w) => {
    cx = Math.round(cx); top = Math.round(top); base = Math.round(base); const len = base - top, hw = (w-1)>>1;
    const shaft = (y0, y1, h2) => { for(let y=y0; y<=y1; y++){ hline(cx-h2, cx+h2, y, WALL.base); P(cx-h2, y, WALL.hi); P(cx+h2, y, WALL.sh); if(h2 > 1) P(cx+h2-1, y, WALL.mid); } };
    const balcony = (y, h2) => { hline(cx-h2, cx+h2, y-1, WALL.hi); hline(cx-h2, cx+h2, y, WALL.base); P(cx+h2, y, WALL.mid); P(cx+h2, y-1, WALL.base);
      hline(cx-h2+1, cx+h2-1, y+1, WALL.sh); for(let x=cx-h2+1; x<cx+h2; x+=2) P(x, y+1, WALL.dk); };
    const b1 = base - Math.round(len*.42), b2 = base - Math.round(len*.66), b3 = top + Math.round(len*.24);
    const pav = Math.max(3, Math.round(len*.07)), capH = Math.max(4, Math.round(len*.09)), b4 = b3 - pav - 1, capTop = b4 - capH;
    const h3 = Math.max(1, hw-1);
    shaft(b1, base, hw); for(let y=b1+4; y<base-4; y+=Math.max(6, Math.round(len*.1))){ P(cx, y, WALL.dk); P(cx, y+1, WALL.dk); }
    shaft(b2, b1, hw); P(cx, b2+Math.round((b1-b2)/2), WALL.dk);
    shaft(b3, b2, h3);
    balcony(b1, hw+1); balcony(b2, hw+1); balcony(b3, hw);
    // pavilion with a dark opening, then the pointed cap
    shaft(b4+1, b3-2, h3); vline(cx, b4+2, b3-3, ARCH.dk); hline(cx-hw, cx+hw, b4, WALL.hi); hline(cx-h3, cx+h3, b4+1, WALL.sh);
    for(let y=capTop; y<b4; y++){ const t = (y-capTop)/Math.max(1, b4-capTop); const cw = Math.round(h3*Math.min(1, t*1.5));
      hline(cx-cw, cx+cw, y, WALL.base); if(cw > 0){ P(cx-cw, y, WALL.hi); P(cx+cw, y, WALL.sh); } }
    vline(cx, top+2, capTop-1, GOLD.base); if(capTop-top > 5) P(cx+1, capTop-2, GOLD.dk);
    crescent(cx, top, false);
  };

  /* ---------- mosque */
  const fx0 = Math.round(W*.09), fx1 = Math.round(W*.91), fTop = hz - S(22), mid = fTop + S(9);
  const gateX = Math.round(W*.53);
  // roof: small grey sliding domes behind the parapet
  for(const f of [.17, .27, .77, .85]){ const dx = Math.round(W*f), dr = S(3);
    for(let y=-dr; y<=0; y++) for(let x=-dr; x<=dr; x++) if(x*x+y*y <= dr*dr+dr*.6){ const col = (x+y < -dr*.8) ? GREY.hi : x > dr*.4 ? GREY.sh : GREY.base; P(dx+x, fTop-1+y, col); } }
  // Green Dome (drum + dome + finial) behind the gate
  const dr = S(12), drumH = S(7), drumTop = fTop - drumH, domeH = Math.round(dr*1.15);
  rect(gateX-dr-1, drumTop, 2*dr+3, drumH+2, GREEN[2]); vline(gateX-dr-1, drumTop, fTop+1, GREEN[3]); rect(gateX+dr, drumTop, 2, drumH+2, GREEN[1]);
  hline(gateX-dr-2, gateX+dr+2, drumTop, GREEN[3]); hline(gateX-dr-2, gateX+dr+2, drumTop+1, GREEN[1]);
  for(let x=gateX-dr+2; x<=gateX+dr-1; x+=3){ vline(x, drumTop+3, drumTop+3+Math.max(1, drumH-5), GREEN[0]); }
  for(let y=0; y<domeH; y++){ const v = (y+.5)/domeH; const hw = dr*Math.pow(Math.max(0, 1 - Math.pow(v, 2.2)), .5) * (1 - .22*v*v);
    const yy = drumTop - 1 - y;
    for(let x=Math.round(-hw); x<=Math.round(hw); x++){ const nx = x/(dr+.5), ny = v; const nz = Math.sqrt(Math.max(0, 1 - nx*nx - ny*ny*.8));
      const I = -.62*nx + .55*ny + .56*nz; const col = I > .95 ? GREEN[4] : I > .62 ? GREEN[3] : I > .18 ? GREEN[2] : GREEN[1];
      P(gateX+x, yy, col); } }
  // finial: a rounded gold bulb sitting on the dome, a short rod, then the crescent (horns up)
  const dTop = drumTop - domeH, rodH = S(4);
  hline(gateX-1, gateX+1, dTop, GOLD.base); P(gateX-1, dTop, GOLD.hi); P(gateX+1, dTop, GOLD.dk);
  P(gateX, dTop-1, GOLD.hi); vline(gateX, dTop-1-rodH, dTop-2, GOLD.base);
  crescent(gateX, dTop-rodH-3, S(12) >= 11);

  // far minarets at the mosque corners (behind the facade line)
  minaret(W*.165, Math.max(H*.22, 29), fTop+2, 5); minaret(W*.825, Math.max(H*.2, 29), fTop+2, 5);

  // facade body
  rect(fx0, fTop, fx1-fx0, hz-fTop, WALL.base);
  hline(fx0, fx1-1, fTop, WALL.hi); for(let x=fx0; x<fx1; x+=3){ P(x, fTop-1, WALL.base); P(x+1, fTop-1, WALL.base); }
  hline(fx0, fx1-1, fTop+1, WALL.mid);
  hline(fx0, fx1-1, mid, WALL.hi); hline(fx0, fx1-1, mid+1, WALL.mid);
  hline(fx0, fx1-1, hz-1, WALL.sh); vline(fx1-1, fTop, hz-1, WALL.mid);
  const arch = (x, y, w, h, door) => { const hw = (w-1)>>1;
    for(let j=0; j<h; j++){ const half = j===0 ? 0 : j===1 ? hw-1 : hw; for(let i=-half; i<=half; i++){
      const col = (j < 2 || i === -hw) ? ARCH.dk : (door && j > h*.45) ? ARCH.door : ARCH.base; P(x+i, y+j, col); } } };
  const sp = Math.max(6, S(8));
  for(let x=fx0+Math.round(sp/2); x<fx1-3; x+=sp){ arch(x, fTop+S(3), 3, Math.max(4, S(5)), false); arch(x, mid+S(3), 5, Math.max(6, hz-mid-S(4)), true); }
  // main gate portal
  const pw = S(17), pTop = fTop - S(4);
  rect(gateX-pw, pTop, 2*pw+1, hz-pTop, WALL.lit); vline(gateX-pw, pTop, hz-1, WALL.hi); vline(gateX+pw, pTop, hz-1, WALL.sh);
  hline(gateX-pw, gateX+pw, pTop, WALL.hi); for(let x=gateX-pw; x<=gateX+pw; x+=3){ P(x, pTop-1, WALL.lit); P(x+1, pTop-1, WALL.lit); }
  hline(gateX-pw+1, gateX+pw-1, pTop+2, GOLD.base);
  arch(gateX, pTop+S(5), Math.max(7, S(9)|1), hz-pTop-S(5), true);
  arch(gateX-Math.round(pw*.62), pTop+S(8), 5, hz-pTop-S(8), true); arch(gateX+Math.round(pw*.62), pTop+S(8), 5, hz-pTop-S(8), true);
  // main minarets flanking the gate: the left one always rises in the clear sky gap
  minaret(W*.41, Math.round(H*.04), hz, 7); minaret(W*.655, Math.round(H*.07), hz, 7);

  /* ---------- marble plaza */
  rect(0, hz, W, H-hz, MARBLE.base);
  for(let y=hz+2, g=2; y<H; g+=1.2, y+=Math.round(g)) hline(0, W-1, y, MARBLE.line);
  const vx = gateX, vy = hz - Math.round(H*.25);
  for(let i=-14; i<=14; i++){ const bx = vx + i*Math.round(26*s); line(vx + (bx-vx)*(hz-vy)/(H-vy), hz, bx, H, MARBLE.line); }
  hline(0, W-1, hz, MARBLE.edge);

  /* ---------- umbrellas: the giant canopies, open, seen from below: ribs and gores fan out from the column */
  const umbrella = (cx, base, hw, poleH) => {
    cx = Math.round(cx); base = Math.round(base); hw = Math.round(hw); poleH = Math.round(poleH);
    const yc = base - poleH, rise = Math.round(hw*.6), n = hw >= 20 ? 8 : hw >= 12 ? 6 : 4;
    // soft shadow on the marble, a little to the right (light from the upper left)
    const sy = Math.max(1, Math.round(hw*.14)), sx = cx + Math.round(hw*.18);
    for(let y=-sy; y<=sy; y++){ const cut = Math.round(Math.abs(y)*1.4); hline(sx-hw+cut, sx+hw-cut, base+y, MARBLE.sh); }
    // column: stone cladding, gold capital and ring, small plinth
    const pw = hw >= 22 ? 3 : hw >= 12 ? 2 : 1;
    for(let y=yc; y<=base; y++){ P(cx, y, WALL.hi); if(pw > 1) P(cx+1, y, pw > 2 ? WALL.base : WALL.sh); if(pw > 2) P(cx+2, y, WALL.sh); }
    hline(cx-1, cx+pw, base, WALL.dk); hline(cx-1, cx+pw, base-1, WALL.sh);
    if(pw > 1) hline(cx, cx+pw-1, yc+Math.round(poleH*.45), GOLD.base);
    const m = cx + (pw-1)/2, top = yc - rise;
    // membrane: gores alternate light/shade between the ribs; rim dips a pixel between rib tips
    for(let X=Math.round(m-hw); X<=Math.round(m+hw); X++){ const u = (X-m)/hw, t = Math.min(1, Math.abs(u));
      const yb = Math.round(yc - rise*Math.pow(t, .7)); const g = Math.min(n-1, Math.floor((u+1)/2*n)); const gf = (u+1)/2*n - g;
      const yt = top + (Math.abs(gf-.5) < .2 && hw >= 10 ? 1 : 0);
      for(let y=yt; y<=yb; y++){ const f = (y-yt)/Math.max(1, yb-yt);
        let col = (g & 1) ? (f < .5 ? CANOPY.mid : CANOPY.low) : (f < .6 ? CANOPY.top : CANOPY.mid);
        if(y === yt) col = CANOPY.rim; if(y === yb && t > .15) col = CANOPY.edge; P(X, y, col); } }
    for(let i=1; i<n; i++){ const ex = Math.round(m - hw + 2*hw*i/n); line(Math.round(m), yc-1, ex, top+1, CANOPY.rib); }
    hline(cx, cx+pw-1, yc, GOLD.hi); hline(cx-1, cx+pw, yc+1, GOLD.base); hline(cx, cx+pw-1, yc+2, GOLD.dk);
  };
  umbrella(W*.155, hz+S(4), S(10), S(17)); umbrella(W*.875, hz+S(4), S(10), S(17));
  umbrella(W*.285, hz+S(11), S(15), S(26)); umbrella(W*.765, hz+S(10), S(14), S(25));

  /* ---------- visitors walking to the gate (tiny, no faces) and pigeons over the plaza */
  const FIG = {                           // tiny visitors seen from behind/front, no faces
    man:['.r.', 'wwS', 'wwS', 'wwS', 'w.S'], woman:['.k.', 'kkk', 'kkk', 'kkk', 'kkk'], kid:['.h.', 'bbB', 'bbB', 'n.n'],
    man1:['r', 'w', 'w', 'S'], woman1:['k', 'k', 'k', 'k'],
    // a family walking to the gate, seen from behind
    father:['.rwr.', 'rwrwr', 'wrwrS', 'wwwwS', 'wwwwS', 'wwwwS', 'wwwwS', 'wwwwS', 'ww.wS'],
    mother:['.kk.', 'kkkK', 'kkkK', 'kkkK', 'kkkK', 'kkkK', 'kkkK', 'kk.K'],
    child:['.hh.', 'bbbB', 'bbbB', 'bbbB', '.d.d'] };
  const FCOL = {r:'#d94a3d', w:'#ffffff', S:'#d3c6aa', k:'#2a2a33', K:'#1b1e2b', h:'#3b2a22', b:'#4fa4d8', B:'#2b6ca3', n:'#e9b48a', d:'#5f676c'};
  const person = (x, y, kind) => { const g = FIG[kind]; x = Math.round(x); y = Math.round(y) - g.length;
    g.forEach((row, j) => { for(let i=0; i<row.length; i++) if(row[i] !== '.') P(x+i, y+j, FCOL[row[i]]); });
    hline(x, x+g[0].length, y+g.length, MARBLE.sh); };
  const crowd = [[.45,.70,'man1'],[.475,.715,'woman1'],[.60,.705,'man1'],[.37,.73,'man1'],[.655,.735,'woman1'],[.565,.72,'man1'],[.27,.715,'man1'],[.295,.72,'woman1'],[.78,.71,'man1'],
    [.60,.84,'man'],[.625,.845,'woman'],[.70,.87,'man'],[.48,.80,'man']];
  const fam = Math.round(W*.36), famY = Math.round(H*.975);
  crowd.push([(fam)/W, famY/H, 'father'], [(fam+S(8))/W, (famY-1)/H, 'mother'], [(fam+S(8)+6)/W, famY/H, 'child']);
  for(const [fx, fy, kind] of crowd) person(W*fx, H*fy, kind);
  for(const [fx, fy] of [[.33,.18],[.37,.23],[.72,.46]]){ const x = Math.round(W*fx), y = Math.round(H*fy);
    P(x, y, '#5f676c'); P(x+1, y+1, '#5f676c'); P(x+2, y, '#5f676c'); P(x+3, y-1, '#5f676c'); P(x-1, y-1, '#5f676c'); }

  // big foreground umbrellas framing the view
  umbrella(W*.06, H+S(2), S(30), H*.52);
  // date palms in the right foreground
  palm(W*.985, H+S(4), Math.round(H*.4), -1); palm(W*.93, H+S(1), Math.round(H*.5), -1);
};
})();
