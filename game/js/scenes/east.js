/* scenes/east.js — the modern Eastern Province: sea, pearls and energy.
   The Khobar Water Tower with its wide flared top on its little island off the
   corniche, the King Fahd Causeway running across the Gulf to the horizon, the
   Ithra building (King Abdulaziz Center for World Culture: rounded steel
   "pebbles" wrapped in shining bands) on the shore with the towers of Khobar
   behind it, a dhow under sail, an offshore platform far out at sea, and an
   open pearl oyster and a shell on the beach. Everything is drawn per pixel on
   the scene raster (one pixel grid), lit from the upper left. */
(() => {
'use strict';
const RGB = {};
const C = h => RGB[h] || (RGB[h] = hexRGB(h));

const SKY = ['#4fa4d8', '#6cb8e4', '#95cdec', '#c4e6f2', '#e2f3f6'];
const SEA = ['#2a86a8', '#2f95b4', '#3ba8c0', '#48b8c8'];
const FAR = {g:['#7ba3bd', '#93b8cd', '#b8d5e2'], w:['#c8d5db', '#e2e9ec', '#f5f8f9'], s:['#cdbfa6', '#e0d5c0', '#efe8d9'], gw:'#6f97b0', ww:'#a9c3cf', sw:'#b8a88a'};
const CONC = {hi:'#ffffff', base:'#eef1f1', mid:'#d9dfe1', sh:'#bcc6cb', dk:'#98a5ac'};
const GLASS = {hi:'#9fd8f5', base:'#4fa4d8', dk:'#2b6ca3'};
const SAND = {base:'#efdcae', lt:'#f7ebc8', dk:'#e0c890', wet:'#d8bf8a', line:'#c9a66b'};
const LAND = {base:'#e8d5a3', dk:'#c9a66b', lawn:'#5cbf60', lawnD:'#3a8f45', lawnL:'#9be07a', plaza:'#f1ead9', pave:'#e6ddca'};

SCENES.east = k => {
  const {R, W, H} = k, r = k.r;
  const s = Math.min(W/224, H/134);
  const S = v => Math.max(1, Math.round(v*s));
  const P = (x, y, h) => R.set(x, y, C(h));
  const rect = (x, y, w, h, col) => { const c = C(col); x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    for(let j=y; j<y+h; j++) for(let i=x; i<x+w; i++) R.set(i, j, c); };
  const hline = (x0, x1, y, col) => rect(x0, y, x1-x0+1, 1, col);
  const vline = (x, y0, y1, col) => rect(x, y0, 1, y1-y0+1, col);
  // small hand-drawn sprites: rows of chars mapped to colours; a ramp [dark, base, light] is shaded
  // light on the top/left edge and dark on the bottom/right edge; `out` draws a 1px outline around it
  const grid = (rows, map, x0, y0, out) => {
    const h = rows.length, w = rows[0].length, at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? '.' : rows[y][x];
    if(out) for(let y=-1; y<=h; y++) for(let x=-1; x<=w; x++){ if(at(x, y) !== '.') continue;
      if(at(x+1, y) !== '.' || at(x-1, y) !== '.' || at(x, y+1) !== '.' || at(x, y-1) !== '.') P(x0+x, y0+y, out); }
    for(let y=0; y<h; y++) for(let x=0; x<w; x++){ const ch = at(x, y); if(ch === '.') continue; let col = map[ch];
      if(Array.isArray(col)) col = (at(x, y+1) === '.' || at(x+1, y) === '.') ? col[0] : (at(x, y-1) === '.' || at(x-1, y) === '.') ? col[2] : col[1];
      P(x0+x, y0+y, col); } };

  const hz = Math.round(H*.56);      // sea horizon
  const shore = Math.round(H*.8);    // top of the beach in front
  const lerp = (a, b, t) => a + (b - a)*t;

  /* ---------- sky, sun, clouds, gulls */
  R.bands(0, hz, SKY);
  const sunX = Math.round(W*.36), sunY = Math.max(33, Math.round(H*.26)), sr = S(7);
  R.disc(sunX, sunY, sr+2, '#bfe3f2'); R.disc(sunX, sunY, sr, '#f7c948'); R.disc(sunX-1, sunY-1, sr-2, '#fff0a0');
  const cloud = (cx, cy, w) => {
    const bumps = [[-.32, 0, .34, 2.2], [0, -.1, .3, 3.6], [.3, 0, .28, 2.6], [.02, .12, .55, 1.6]];
    const inside = (x, y) => { if(y > cy+1) return false; for(const [ox, oy, rx, ry] of bumps){ const ex = (x-(cx+ox*w))/(rx*w), ey = (y-(cy+oy*w*.1))/(ry*s+.01); if(ex*ex+ey*ey <= 1) return true; } return false; };
    for(let y=cy-Math.round(6*s)-2; y<=cy+1; y++) for(let x=Math.round(cx-w); x<=Math.round(cx+w); x++){
      if(!inside(x, y)) continue; P(x, y, !inside(x, y+1) ? '#d7e8ef' : (!inside(x, y-1) || !inside(x-1, y)) ? '#ffffff' : '#f3f8f9'); }
  };
  cloud(Math.round(W*.8), Math.max(35, Math.round(H*.3)), S(12));
  const gull = (x, y) => { P(x, y, '#ffffff'); P(x+1, y-1, '#ffffff'); P(x+2, y, '#e4eef2'); P(x+3, y-1, '#ffffff'); P(x+4, y, '#ffffff'); P(x+2, y+1, '#9aa3a8'); };
  gull(Math.round(W*.66), Math.max(40, Math.round(H*.36))); gull(Math.round(W*.71), Math.max(44, Math.round(H*.4)));

  /* ---------- the sea */
  R.bands(hz, shore, SEA); hline(0, W-1, hz, '#22739a');
  { let y = hz + 2, i = 0;
    while(y < shore - 1){ const len = 1 + Math.min(4, i>>1), gap = S(11) + i*2, col = i < 2 ? '#79c6d8' : i < 5 ? '#9fdde6' : '#c9eef2';
      for(let x = (i*5) % gap; x < W; x += gap + Math.round(r()*4)) hline(x, x+len-1, y, col);
      y += 2 + (i>>1); i++; } }

  /* ---------- offshore platform far out at sea (energy) */
  {
    const px = Math.round(W*.91), y = hz, pw = S(10);
    for(const lx of [px+1, px+pw-2]) vline(lx, y-S(3), y, '#8a949a');
    hline(px, px+pw, y-S(3)-1, '#a9b2b7'); hline(px, px+pw, y-S(3), '#8a949a');
    rect(px+S(2), y-S(3)-S(3), S(4), S(3), '#c6cdd1'); hline(px+S(2), px+S(2)+S(4)-1, y-S(3)-S(3), '#dfe5e8');
    const dx = px + pw - S(3), dt = y - S(3) - S(9);
    for(let yy=dt; yy<y-S(3)-1; yy++){ const hw = Math.floor((yy-dt)/3); P(dx-hw, yy, '#8a949a'); P(dx+hw, yy, '#8a949a'); }
    P(dx, dt-1, '#d94a3d');
    hline(px+S(2), px+S(2)+S(4)-1, y-S(3)-2, '#e8833a');
  }

  /* ---------- the King Fahd Causeway, running from the near shore across the Gulf to the horizon */
  {
    const fx = Math.round(W*.64), fy = hz + 1, nx = W + S(6), ny = hz + S(21);
    // far island with the two causeway towers
    rect(fx-S(5), fy-1, S(8), 2, '#d9c79a'); hline(fx-S(5), fx+S(3)-1, fy-1, '#e8d5a3');
    for(const tx of [fx-S(5), fx]){ const th = S(12), pod = fy - th + S(3);
      vline(tx, fy-th, fy-2, '#eef1f1'); vline(tx+1, fy-th, fy-2, '#a9b2b7');
      hline(tx-1, tx+2, pod-1, '#f4f7f8'); hline(tx-2, tx+3, pod, '#dfe5e8'); P(tx-2, pod, '#f4f7f8'); P(tx+3, pod, '#a9b2b7');
      hline(tx-1, tx+2, pod+1, '#8a949a'); P(tx, fy-th-1, '#c6cdd1'); P(tx, fy-th-2, '#8a949a'); }
    // deck and piers, thicker and further apart toward the viewer
    const X = t => lerp(fx+S(3), nx, t), Y = t => lerp(fy, ny, t);
    const steps = Math.ceil((nx - fx)*1.2);
    for(let i=0; i<=steps; i++){ const t = i/steps, x = Math.round(X(t)), y = Math.round(Y(t)), th = 1 + Math.round(t*S(2.4));
      P(x, y-1, t > .15 ? '#ffffff' : '#e6edf0');
      for(let j=0; j<th; j++) P(x, y+j, j === th-1 ? '#9fb0b8' : '#dfe6e9');
      P(x, y+th, '#22739a'); }
    let t = .03, d = .025;
    while(t < 1){ const x = Math.round(X(t)), y = Math.round(Y(t)), th = 1 + Math.round(t*S(2.4)), ph = Math.round(t*S(5));
      for(let j=1; j<=ph; j++){ P(x, y+th-1+j, '#dfe6e9'); if(t > .45) P(x+1, y+th-1+j, '#aab4ba'); }
      if(ph > 0) P(x, y+th+ph, '#9fdde6');
      // lamp posts along the railing
      if(t > .2){ vline(x, y-1-Math.round(t*S(4)), y-2, '#8a949a'); P(x, y-2-Math.round(t*S(4)), '#fff0a0'); }
      t += d; d *= 1.22; }
  }

  /* ---------- the Khobar Water Tower on its island: slender shaft, wide flared top, glass deck, mast */
  const tX = Math.round(W*.55);
  {
    const iy = hz + S(11), cupTop = Math.max(30, Math.round(H*.24)), cupH = S(14), cupHW = S(12), shHW = S(2.5);
    const cb = cupTop + cupH;
    // island: sandy rim, lawn, a couple of small palms, a white edge on the water
    for(let y=-S(3); y<=S(2); y++){ const hw = Math.round(S(15)*Math.sqrt(Math.max(0, 1 - (y/(y < 0 ? S(3)+.5 : S(2)+.5))**2)));
      hline(tX-hw, tX+hw, iy+y, y >= S(2)-0 ? '#98a5ac' : y >= 1 ? LAND.dk : y >= -1 ? LAND.base : LAND.lawn); }
    hline(tX-S(12), tX+S(12), iy-S(3), LAND.lawnL);
    hline(tX-S(15)-1, tX+S(15)+1, iy+S(2)+1, '#c9eef2');
    // shaft (a little wider at the foot)
    for(let y=cb; y<iy-1; y++){ const t = (y-cb)/(iy-1-cb), hw = Math.round(shHW + (t > .82 ? 1 : 0));
      for(let x=-hw; x<=hw; x++) P(tX+x, y, x === -hw ? CONC.hi : x === hw ? CONC.dk : x > hw*.3 ? CONC.sh : CONC.base);
      if((y - cb) % 6 === 5) P(tX, y, CONC.mid); }
    rect(tX-shHW-1, iy-S(4), 2*shHW+3, S(2), CONC.base); hline(tX-shHW-1, tX+shHW+1, iy-S(4), CONC.hi); P(tX+shHW+1, iy-S(3), CONC.dk);
    // flared top: an upturned bell opening to the sky, ribbed like the petals of a flower
    for(let y=cb; y>=cupTop; y--){ const t = (cb - y)/cupH, hw = Math.round(shHW + (cupHW - shHW)*Math.pow(t, .75));
      for(let x=-hw; x<=hw; x++){ const u = x/Math.max(1, hw);
        let col = u < -.6 ? CONC.hi : u < .15 ? CONC.base : u < .62 ? CONC.mid : CONC.sh;
        if(x === hw) col = CONC.dk;
        if(y === cb) col = CONC.sh;
        // three petal seams that meet at the stem
        if(hw > 3 && t > .2 && (x === Math.round(-hw*.45) || x === Math.round(hw*.45))) col = x < 0 ? CONC.mid : CONC.sh;
        P(tX+x, y, col); } }
    // glass observation deck and restaurant ring around the rim
    const gy = cupTop - S(3), gw = cupHW - 1;
    for(let y=gy; y<cupTop; y++) for(let x=-gw; x<=gw; x++){ const u = x/gw;
      let col = u < -.5 ? GLASS.hi : u < .45 ? GLASS.base : GLASS.dk; if((x + gw) % 3 === 0) col = u < 0 ? '#6fb0cc' : '#1f5f8a'; P(tX+x, y, col); }
    hline(tX-cupHW-1, tX+cupHW+1, cupTop, CONC.hi); P(tX+cupHW+1, cupTop, CONC.sh); hline(tX-cupHW, tX+cupHW, cupTop+1, CONC.mid);
    // roof lip, small cap and mast with a red light
    hline(tX-gw-1, tX+gw+1, gy-1, CONC.hi); P(tX+gw+1, gy-1, CONC.sh);
    const capHW = S(4);
    for(let y=0; y<S(3); y++){ const hw = capHW - y; hline(tX-hw, tX+hw, gy-2-y, y === S(3)-1 ? CONC.hi : CONC.base); P(tX+hw, gy-2-y, CONC.sh); P(tX-hw, gy-2-y, CONC.hi); }
    const mTop = gy - 2 - S(3) - S(9);
    vline(tX, mTop, gy-2-S(3), '#8a949a'); P(tX, mTop-1, '#d94a3d');
    // small palms on the island
    for(const px of [tX - S(10), tX + S(8)]){ vline(px, iy-S(3)-S(4), iy-S(3), '#a8744a');
      P(px-1, iy-S(3)-S(4)-1, '#1f8f4e'); P(px+1, iy-S(3)-S(4)-1, '#1f8f4e'); P(px-2, iy-S(3)-S(4), '#0e6b3a'); P(px+2, iy-S(3)-S(4), '#0e6b3a'); P(px, iy-S(3)-S(4)-1, '#5cbf60'); P(px-1, iy-S(3)-S(4)-2, '#5cbf60'); P(px+1, iy-S(3)-S(4)-2, '#1f8f4e'); }
  }

  /* ---------- the headland on the left, with the towers of Khobar and Ithra */
  const coast = y => Math.round(lerp(W*.44, W*.02, Math.pow(Math.max(0, (y - hz)/(shore - hz)), .7)));
  // city towers along the horizon behind Ithra
  const tower = (fx, w, h, type, top) => {
    const x0 = Math.round(W*fx), ww = S(w), hh = S(h), y0 = hz - hh, pal = FAR[type];
    for(let y=y0; y<hz; y++) for(let i=0; i<ww; i++){
      let col = i === 0 ? pal[2] : i >= ww-Math.max(1, Math.round(ww*.3)) ? pal[0] : pal[1];
      const row = y - y0;
      if(row > 1 && i > 0 && i < ww-1){
        if(type === 'g' && row % 3 === 2) col = FAR.gw;
        else if(type !== 'g' && row % 3 === 2 && (i & 1)) col = type === 'w' ? FAR.ww : FAR.sw; }
      if(y === y0) col = pal[2];
      P(x0+i, y, col); }
    if(top === 'spire') vline(x0 + (ww>>1), y0 - S(5), y0 - 1, pal[0]);
    if(top === 'step'){ const sw = Math.max(2, ww-S(3)); rect(x0+1, y0-S(3), sw, S(3), pal[1]); vline(x0+1, y0-S(3), y0-1, pal[2]); hline(x0+1, x0+sw, y0-S(3), pal[2]); }
  };
  [[.0, 7, 12, 'w'], [.035, 6, 18, 'g', 'spire'], [.07, 8, 10, 's'], [.3, 6, 14, 'g', 'step'], [.33, 7, 9, 'w'], [.37, 5, 12, 's']].forEach(b => tower(...b));
  // the land itself: a green park along the corniche, a paved walk, a sandy edge and surf
  for(let y=hz; y<shore; y++){ const xc = coast(y), t = (y - hz)/(shore - hz), walk = Math.max(1, Math.round(t*S(5))), sand = Math.max(1, Math.round(t*S(3)));
    for(let x=0; x<=xc; x++){ let col = LAND.lawn;
      if(x > xc - sand) col = x === xc ? LAND.dk : LAND.base;
      else if(x > xc - sand - walk) col = LAND.pave;
      else if(x === xc - sand - walk) col = LAND.lawnD;
      else if(y === hz) col = LAND.lawnL;
      P(x, y, col); }
    P(xc+1, y, '#ffffff'); P(xc+2, y, '#c9eef2'); }
  for(let y=hz+2; y<shore; y+=3){ const xc = coast(y); for(let x=(y*3)%7; x<xc-S(6); x+=7) P(x, y, LAND.lawnD); }

  /* ---------- Ithra: rounded steel pebbles leaning together, wrapped in horizontal bands */
  {
    const ix = Math.round(W*.18), gb = hz + S(9);
    const L = [-.62, -.52, .58];
    // polished steel: the upper faces mirror the sky, the lower faces the warm ground
    const tone = (I, v) => I > .78 ? '#ffffff' : I > .55 ? (v < 0 ? '#e3eef4' : '#e6e7e4') : I > .3 ? (v < 0 ? '#bfd0da' : '#c9c8c0') : I > .05 ? (v < .2 ? '#98a8b2' : '#a8a498') : I > -.25 ? '#7d8990' : '#646e75';
    const band = (I, v) => I > .55 ? (v < 0 ? '#b3c6d2' : '#c0bdb2') : I > .3 ? (v < 0 ? '#93a6b2' : '#a19d92') : I > .05 ? '#7d8990' : '#5a646a';
    const pebble = (cx, h, rx, lean, pw) => {
      // a rounded stone standing on the ground line, leaning by `lean` px at the top
      const cy = gb - h*.5, ry = h*.5, mask = new Set(), px = [];
      for(let y=Math.round(gb-h)-1; y<=gb; y++){ const v = (y - cy)/ry, o = lean*(gb - y)/h;
        for(let x=Math.round(cx-rx-Math.abs(lean))-1; x<=Math.round(cx+rx+Math.abs(lean))+1; x++){ const u = (x - cx - o)/rx;
          if(Math.pow(Math.abs(u), pw) + Math.pow(Math.abs(v), pw) > 1) continue;
          mask.add(x+','+y); px.push([x, y, u, v]); } }
      for(const [x, y, u, v] of px){
        const out = !mask.has((x+1)+','+y) || !mask.has((x-1)+','+y) || !mask.has(x+','+(y-1)) || (!mask.has(x+','+(y+1)) && y < gb);
        if(out){ P(x, y, '#4b5358'); continue; }
        const nz = Math.sqrt(Math.max(0, 1 - u*u*.85 - v*v*.85)), I = L[0]*u + L[1]*v + L[2]*nz;
        P(x, y, ((gb - y) % 3 === 2) ? band(I, v) : tone(I, v)); }
    };
    pebble(ix - S(1), S(47), S(6.5), S(2), 2.6);        // the tall Knowledge Tower
    pebble(ix + S(11), S(28), S(8.5), -S(3), 2.2);      // pebble leaning in on the right
    pebble(ix - S(12), S(22), S(11), S(3), 2.0);        // wide pebble on the left
    pebble(ix + S(3), S(11), S(7.5), 0, 2.4);           // low pebble in front
    // plaza and a line of young trees in front
    const pe = Math.min(ix + S(24), coast(gb + 2) - S(4));
    hline(ix - S(26), pe, gb + 1, LAND.plaza); hline(ix - S(26), pe, gb + 2, LAND.pave);
    for(let x=ix - S(24); x < pe - 1; x += S(6)){ P(x, gb, LAND.lawnD); P(x+1, gb, LAND.lawn); P(x, gb-1, LAND.lawn); P(x+1, gb-1, LAND.lawnL); P(x+1, gb+1, LAND.lawnD); }
  }

  /* ---------- a dhow under sail */
  {
    const bx = Math.round(W*.33), wl = hz + S(26), L = S(24);
    const buf = new Map(), put = (x, y, col) => buf.set(x+','+y, [x, y, col]);
    // hull: pointed bow on the left, high stern on the right
    for(let x=0; x<L; x++){ const t = x/L;
      const top = wl - 3 - (t < .15 ? Math.round((.15 - t)*14) : 0) - (t > .8 ? Math.round((t - .8)*14) : 0);
      const bot = wl - (t < .2 ? Math.round((.2 - t)*12) : 0) - (t > .9 ? 1 : 0);
      for(let y=top; y<=bot; y++) put(bx+x, y, y === top ? '#ecc88a' : y === top+1 ? '#d09a5a' : y >= bot ? '#7a4e2e' : '#a8744a'); }
    for(let x=Math.round(L*.25); x<L-2; x+=3) put(bx+x, wl-2, '#7a4e2e');
    // mast raked forward and a big lateen sail
    const mx = bx + Math.round(L*.45), mt = wl - 3 - S(18);
    for(let y=mt; y<wl-3; y++) put(mx, y, '#4a2e1c');
    const sTop = [mx - S(9), mt + 1], sBot = [mx + S(9), wl - 5];
    for(let y=sTop[1]; y<=sBot[1]; y++){ const t = (y - sTop[1])/(sBot[1] - sTop[1]);
      const xl = Math.round(lerp(sTop[0], mx - 1, Math.min(1, t*1.25))), xr = Math.round(lerp(sTop[0] + 2, sBot[0], Math.pow(t, .8)));
      for(let x=Math.min(xl, xr); x<=xr; x++) if(x !== mx) put(x, y, x === xr ? '#c9c0aa' : x < xl + 2 && t < .5 ? '#ffffff' : '#f4efe2'); }
    for(let i=0; i<=S(18); i++){ const t = i/S(18); put(Math.round(lerp(sTop[0]-1, sBot[0]+1, t)), Math.round(lerp(sTop[1]-1, sBot[1]+1, t)), '#7a4e2e'); }
    put(mx, mt-1, '#d94a3d'); put(mx+1, mt-1, '#d94a3d');
    const OUT = C('#3a2a22');
    for(const [x, y] of buf.values()) for(const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ if(!buf.has((x+dx)+','+(y+dy))) R.set(x+dx, y+dy, OUT); }
    for(const [x, y, col] of buf.values()) P(x, y, col);
    hline(bx+1, bx+L-2, wl+1, '#22739a'); hline(bx-S(3), bx-1, wl, '#ffffff'); hline(bx+L, bx+L+S(6), wl+1, '#c9eef2');
  }

  /* ---------- the beach: surf line, sand ripples, an open pearl oyster and a shell */
  for(let x=0; x<W; x++){ const wy = shore + Math.round(Math.sin(x*.21)*1.2);
    P(x, wy-1, '#c9eef2'); P(x, wy, '#ffffff'); P(x, wy+1, SAND.wet); for(let y=wy+2; y<H; y++) P(x, y, SAND.base); }
  for(let y=shore+5, i=0; y<H; y+=3+(i>>1), i++) for(let x=(i*7)%13; x<W; x+=13+i){ hline(x, x+2+(i>>1), y, SAND.dk); }
  // an open clam with a big pearl: lilac shells hinged at the back, pearly inside
  {
    const CLAM = [
      '......rRrRrRrRr......',
      '....rRrRnnnnnRrRr....',
      '...rRnnwwnnnnnnNRr...',
      '..rRnwwnnnnnnnnnNRr..',
      '.rRnwnnnnnnnnnnnnNRr.',
      '.Rrnnnnnnnnnnnnnnnrr.',
      'rRnnnnnnnnnnnnnnnnNRr',
      'RrnnnnnnnnnnnnnnnnNrR',
      'rxxxxxxxxxxxxxxxxxxxr',
      'Rxxxxxxxxxxxxxxxxxxxr',
      'lllllllllllllllllllll',
      'rlrrlrrlrrlrrlrrlrrlr',
      '.RrRRrRRrRRrRRrRRrRR.',
      '..RRRRRRRRRRRRRRRRR..'];
    const map = {r:'#9b7fd4', R:'#6f5aa6', l:'#c9b6f0', n:'#eccbe3', N:'#d4acd2', w:'#fbe6f2', x:'#4f3f78'};
    const ox = Math.round(W*.2) - 10, oy = H - 15 - S(3);
    hline(ox+2, ox+23, oy+14, SAND.line); hline(ox+5, ox+22, oy+15, SAND.dk);
    grid(CLAM, map, ox, oy, '#3b2d5c');
    // the pearl, sitting in the dark of the open shell
    const pr = 3.6, pcx = ox + 10, pcy = oy + 7;
    for(let y=-4; y<=4; y++) for(let x=-4; x<=4; x++){ const d = x*x + y*y; if(d > pr*pr) continue;
      const l = -x*.7 - y*.7, e = d > (pr-1.1)*(pr-1.1);
      P(pcx+x, pcy+y, e && l < -.5 ? '#a99bc2' : l > 1.2 ? '#ffffff' : l > -1.4 ? '#f6f3f8' : '#dcd4e6'); }
    P(pcx-1, pcy-2, '#ffffff'); P(pcx-2, pcy-1, '#ffffff');
  }
  // a starfish
  {
    const STAR = [
      '......o......',
      '.....ooo.....',
      '.....ooo.....',
      'oooooooooooo.',
      '.oooooyoooo..',
      '..oooyoyoo...',
      '...ooooooo...',
      '...ooo.ooo...',
      '..ooo...ooo..',
      '..oo.....oo..',
      '.o.........o.'];
    grid(STAR, {o:['#c8621f', '#e8833a', '#f7b06a'], y:'#f7c948'}, Math.round(W*.52), H - 12 - S(3), '#8f3a14');
  }
  // a pink scallop shell
  {
    const SCALLOP = [
      '...ppppppp...',
      '.ppPpPpPpPpp.',
      'pPpPpPpPpPpPp',
      'pPpPpPpPpPpPp',
      '.pPpPpPpPpPp.',
      '..pPpPpPpPp..',
      '...pPpPpPp...',
      '....pPpPp....',
      '..ppppppppp..',
      '..ppppppppp..'];
    const sx = Math.round(W*.78), sy = H - 11 - S(3);
    hline(sx+1, sx+14, sy+10, SAND.line);
    grid(SCALLOP, {p:['#d97a88', '#f29aa0', '#ffd6d6'], P:'#e07f8e'}, sx, sy, '#9a4452');
  }
};
})();
