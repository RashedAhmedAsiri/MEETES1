/* scenes/alula.js — modern AlUla: mountains, rocks and heritage.
   Maraya, the huge mirrored concert hall standing in the desert valley (its
   mirror walls show the sky, the sandstone cliffs and the sand, inside a thin
   dark frame), Elephant Rock with its trunk and open arch, the sandstone
   cliffs, a strip of oasis palms, and colourful hot-air balloons from the
   AlUla balloon festival. Everything is drawn per pixel on the scene raster. */
(() => {
'use strict';
const RGB = {};
const C = h => RGB[h] || (RGB[h] = hexRGB(h));

/* colours */
const SKY   = ['#5b9fdc', '#86bfe8', '#b8dcef', '#f2e4c8', '#f8d3a0'];
const SAND  = ['#f3d29e', '#ecc086', '#e2ad70'];
const RIP   = {hi:'#f9e2b8', sh:'#d89c62'};
const FARM  = {hi:'#efc4a4', base:'#dca488', sh:'#c98f7a'};
const CLIFF = {hi:'#f4b67e', lt:'#e39862', base:'#c97a4e', sh:'#a9603e', dk:'#87472f'};
const ROCK  = {hi:'#eca56c', lt:'#d4844e', base:'#b7663c', sh:'#94502f', dk:'#6e3824'};
const OASIS = {dk:'#2f6a45', base:'#4b8f55', lt:'#7fbb68', trunk:'#8a6040'};
const SHRUB = {dk:'#5d7a3a', base:'#7f9c48', lt:'#a8c060'};
const FRAME = '#5a3a2c';
/* the mirror: every reflected colour has [normal, glint, side-wall] variants */
const MIR = {
  skyA:['#8cc3ea', '#c6e4f5', '#6aa6d4'],
  skyB:['#dfe4dc', '#f6f6ee', '#b9c6c8'],
  cl:  ['#eaa574', '#f7c49a', '#c98658'],
  cb:  ['#d48a5c', '#e9aa7e', '#b06e48'],
  cs:  ['#b87050', '#d08c68', '#94583e'],
  sand:['#eecb98', '#fbe4c0', '#d2ab78'],
  sand2:['#f6ddb8', '#fdf0da', '#dcbb8c'],
  rip: ['#e2b680', '#f2d0a2', '#c29866'],
  palm:['#3f7a50', '#6d9e70', '#2c5c40'],
};
/* balloons: gore colour ramps [shadow, base, light] */
const BAL = {
  red:['#8f2a24', '#d94a3d', '#f08070'], yel:['#c98a1a', '#f7c948', '#fff0a0'],
  blu:['#2b6ca3', '#4fa4d8', '#9fd8f5'], wht:['#c9c0aa', '#f4efe2', '#ffffff'],
  grn:['#3a8f45', '#5cbf60', '#9be07a'], org:['#b0521f', '#e8833a', '#f7b06a'],
  pur:['#5f4696', '#9b7fd4', '#c9b6f0'],
};

SCENES.alula = k => {
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
  const inPoly = (u, v, poly) => { let c = false;
    for(let i=0, j=poly.length-1; i<poly.length; j=i++){ const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if((yi > v) !== (yj > v) && u < (xj-xi)*(v-yi)/(yj-yi) + xi) c = !c; }
    return c; };

  const HZ = Math.round(H*.63);

  /* sandstone outcrops: rounded towers with steep sides, built from a list of
     [centre x, half width, top y, sharpness]; returns the top of each column */
  const towers = (list, groundY) => {
    const top = new Int32Array(W).fill(1e6), own = new Int16Array(W).fill(-1), du = new Float32Array(W);
    list.forEach(([cx, hw, ty, pw], i) => {
      for(let x=Math.max(0, Math.floor(cx-hw)); x<=Math.min(W-1, Math.ceil(cx+hw)); x++){
        const d = (x+.5-cx)/hw; if(Math.abs(d) >= 1) continue;
        const y = Math.round(ty + (groundY-ty)*Math.pow(Math.abs(d), pw));
        if(y < top[x]){ top[x] = y; own[x] = i; du[x] = d; } } });
    return {top, own, du};
  };

  /* remove 1-pixel spurs from a mask (pixels with fewer than two filled 4-neighbours), twice */
  const prune = (m, w, h) => { for(let pass=0; pass<2; pass++){ const rm = [];
    for(let y=0; y<h; y++) for(let x=0; x<w; x++){ if(!m[y*w+x]) continue;
      const n = (x>0 && m[y*w+x-1]) + (x<w-1 && m[y*w+x+1]) + (y>0 && m[(y-1)*w+x]) + (y<h-1 && m[(y+1)*w+x]); if(n < 2) rm.push(y*w+x); }
    for(const i of rm) m[i] = 0; } };
  /* rounded clumps (boulders, shrubs): union of ellipses [cx, cy, rx, ry], lit from the upper left */
  const blob = (parts, pal, shadow) => {       // union of ellipses [cx, cy, rx, ry], lit from the upper left
    const raw = (x, y) => parts.some(([cx, cy, rx, ry]) => ((x-cx)/rx)**2 + ((y-cy)/ry)**2 <= 1);
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for(const [cx, cy, rx, ry] of parts){ x0 = Math.min(x0, cx-rx); x1 = Math.max(x1, cx+rx); y0 = Math.min(y0, cy-ry); y1 = Math.max(y1, cy+ry); }
    x0 = Math.floor(x0)-1; x1 = Math.ceil(x1)+1; y0 = Math.floor(y0)-1; y1 = Math.ceil(y1)+1;
    const bw = x1-x0+1, m = new Uint8Array(bw*(y1-y0+1));
    for(let y=y0; y<=y1; y++) for(let x=x0; x<=x1; x++) m[(y-y0)*bw + x-x0] = raw(x, y) ? 1 : 0;
    const inside = (x, y) => x >= x0 && x <= x1 && y >= y0 && y <= y1 && m[(y-y0)*bw + x-x0] === 1;
    prune(m, bw, y1-y0+1);
    if(shadow) for(let x=x0+2; x<=x1+2; x++){ let b = -1; for(let y=y1; y>=y0; y--) if(inside(x-2, y)){ b = y; break; } if(b >= 0){ P(x, b+1, RIP.sh); } }
    for(let y=y0; y<=y1; y++) for(let x=x0; x<=x1; x++){ if(!inside(x, y)) continue;
      let col = pal.base;
      if(!inside(x-1, y-1) || !inside(x, y-2)) col = pal.lt;
      if(!inside(x, y-1)) col = pal.hi;
      if(!inside(x+1, y+1) || !inside(x+2, y)) col = pal.sh;
      if(!inside(x, y+1)) col = pal.dk;
      P(x, y, col); }
  };

  /* ---------- sky */
  R.bands(0, HZ, SKY);

  /* ---------- sand */
  R.bands(HZ, H, SAND);

  /* ---------- far hazy mesas along the whole horizon */
  {
    const far = [[.02,.07,12,5],[.12,.06,8,4],[.22,.08,14,6],[.33,.05,9,4],[.43,.07,11,5],[.53,.05,7,4],[.63,.06,10,5],[.74,.07,13,6],[.86,.06,9,4],[.97,.07,12,5]]
      .map(([f, w, h, pw]) => [f*W, w*W, HZ-S(h), pw]);
    const {top, du, own} = towers(far, HZ);
    for(let x=0; x<W; x++){ if(own[x] < 0) continue;
      for(let y=top[x]; y<HZ; y++) P(x, y, y===top[x] && du[x] < .4 ? FARM.hi : du[x] > .5 ? FARM.sh : FARM.base); }
  }

  /* ---------- near sandstone cliffs on the right, behind Maraya */
  {
    const near = [[.45,.05,.52,6],[.54,.06,.44,8],[.635,.055,.385,9],[.73,.06,.415,8],[.83,.07,.36,10],[.94,.07,.40,8],[1.04,.06,.45,7]]
      .map(([f, w, t, pw]) => [f*W, w*W, Math.round(t*H), pw]);
    const {top, own, du} = towers(near, HZ);
    for(let x=0; x<W; x++){ const o = own[x]; if(o < 0) continue; const t = top[x], d = du[x];
      const face = d < -.5 ? 'lt' : d > .42 ? 'sh' : 'base';
      const hgt = HZ - t, g = (x*7 + o*3) % 5 === 0, gLen = 2 + ((x*13 + o*7) % 9)/9*hgt*.7, gTop = t + 2 + (x*5 % 3);
      for(let y=t; y<HZ; y++){
        let col = CLIFF[face];
        if(g && y >= gTop && y < gTop + gLen && face !== 'sh') col = face === 'lt' ? CLIFF.base : CLIFF.sh;
        if(y === t) col = face === 'sh' ? CLIFF.base : CLIFF.hi;
        else if(y === t+1 && face === 'lt') col = CLIFF.hi;
        P(x, y, col); }
      if(x > 0 && own[x-1] >= 0 && own[x-1] !== o){ const yy = Math.max(t, top[x-1]); for(let y=yy; y<yy + (HZ-yy)*.55; y++) P(du[x] > 0 ? x-1 : x, y, CLIFF.dk); }
    }
  }

  /* ---------- oasis palms along the horizon */
  const palm = (x, y, sz) => {
    const h = sz + 2; vline(x, y-h+2, y, OASIS.trunk);
    const cy = y - h + 1;
    hline(x-2, x+2, cy, OASIS.base); P(x-1, cy-1, OASIS.lt); P(x, cy-1, OASIS.base); P(x+1, cy-1, OASIS.base);
    P(x-3, cy+1, OASIS.base); P(x+3, cy+1, OASIS.dk); P(x-2, cy, OASIS.lt);
    if(sz > 4){ P(x-4, cy+2, OASIS.base); P(x+4, cy+2, OASIS.dk); P(x+2, cy-1, OASIS.dk); }
  };
  {
    for(let x=Math.round(W*.28); x<W; x++) { const b = 1 + ((x*5) % 7 < 3 ? 1 : 0); for(let y=HZ-b; y<HZ+1; y++) P(x, y, OASIS.dk); }
    for(let i=0, x=Math.round(W*.29); x<W-2; i++, x += S(5) + (i*7 % 4)) palm(x, HZ, S(4) + (i*5 % 3));
  }

  /* ---------- sand ripples: soft humped strokes, longer and further apart towards the front */
  {
    let y = HZ + 4, gap = 4, row = 0;
    while(y < H-2){
      const t = (y-HZ)/(H-HZ), len = 3 + Math.round(t*9), step = len + 12 + Math.round(t*22);
      for(let i=0, x = ((row*37) % step) - step; x < W; i++, x += step + ((row*5 + i*3) % 5)){
        const L = len - ((row + i) % 3);
        for(let j=0; j<L; j++){ const hump = L > 5 && j > L*.25 && j < L*.75 ? 1 : 0; P(x+j, y-hump, RIP.hi); P(x+j+1, y-hump+1, RIP.sh); }
      }
      row++; gap += 2; y += gap;
    }
  }

  /* ---------- Qasr al-Farid (Hegra): a lone rock with a Nabataean tomb facade carved into it */
  {
    const cx = Math.round(W*.46), gy = HZ + S(3);
    blob([[cx, gy-S(12), S(9.5), S(12)], [cx+S(3), gy-S(5), S(10), S(6)], [cx-S(3), gy-S(4), S(8.5), S(5)]], CLIFF, true);
    const F = [
      "..s.....s..",
      ".sss...sss.",
      "sssssssssss",
      "ccccccccccc",
      "fffffffffff",
      "fpfffffffpf",
      "fpfffffffpf",
      "fpffftfffpf",
      "fpfftttffpf",
      "fpffdddffpf",
      "fpffdddffpf",
      "fpffdddffpf",
      "fpffdddffpf",
      "fpfffffffpf"];
    const FC = {s:'#eeb884', f:'#eeb884', p:'#f8cfa0', c:'#a9603e', t:'#c97a4e', d:'#5a2e1e'};
    const fx = cx - 6, fy = gy - F.length - 1;
    F.forEach((row, j) => [...row].forEach((ch, i) => { if(FC[ch]) P(fx+i, fy+j, FC[ch]); }));
    hline(fx, fx+10, fy+F.length, CLIFF.sh);
  }

  /* ---------- Elephant Rock (Jabal AlFil): trunk down to the sand on the left, open arch, long back */
  {
    const RW = Math.round(W*.34), RH = Math.round(H*.38), x0 = Math.round(W*.05), by = Math.round(H*.83);
    const body = [[-.01,0],[.015,.1],[.035,.24],[.05,.4],[.04,.52],[.02,.62],[.005,.7],[.01,.78],[.04,.86],[.09,.93],[.15,.975],[.21,.995],[.27,1],[.33,.985],[.38,.95],[.42,.905],[.46,.885],[.52,.89],[.6,.9],[.68,.89],[.76,.86],[.83,.8],[.89,.71],[.935,.59],[.965,.45],[.985,.3],[.995,.15],[1,0]];
    const arch = [[.1,-.1],[.105,.15],[.115,.32],[.13,.46],[.155,.56],[.19,.61],[.23,.62],[.27,.59],[.3,.52],[.325,.4],[.345,.25],[.36,.1],[.37,-.1]];
    const isRock = (x, y) => { const u = (x+.5-x0)/RW, v = (by-(y+.5))/RH; return v > 0 && inPoly(u, v, body) && !inPoly(u, v, arch); };
    // shadow on the sand, falling to the lower right (none under the arch, where the sun shines through)
    { const sx1 = x0 + RW + S(9);
      for(let x=x0+1; x<sx1; x++){ const t = (x-x0)/(sx1-x0), d = Math.round(S(3.4)*Math.sin(Math.PI*Math.min(1, t*1.25)) + .4);
        if(x > x0+RW*.11 && x < x0+RW*.36) continue;
        for(let y=by; y<by+d; y++) P(x, y, RIP.sh); } }
    const X0 = x0-1, X1 = x0+RW+1, Y0 = by-RH-1;
    const MW = X1-X0+1, MH = by-Y0, mm = new Uint8Array(MW*(MH+1));
    for(let y=Y0; y<=by; y++) for(let x=X0; x<=X1; x++) mm[(y-Y0)*MW + x-X0] = y === by ? (isRock(x, by-1) ? 1 : 0) : isRock(x, y) ? 1 : 0;
    prune(mm, MW, MH+1);
    const M = (x, y) => y >= Y0 && y < by && x >= X0 && x <= X1 && mm[(y-Y0)*MW + x-X0] === 1;
    const lEdge = y => { for(let x=X0; x<=X1; x++) if(M(x, y)) return x; return 1e6; };
    const rEdge = y => { for(let x=X1; x>=X0; x--) if(M(x, y)) return x; return -1e6; };
    const cracks = [[.44,.88,.42],[.64,.86,.24],[.82,.76,.4]];
    const colTop = [];
    for(let x=X0; x<=X1; x++){ let t = 1e6; for(let y=Y0; y<by; y++) if(M(x, y)){ t = y; break; } colTop.push(t); }
    for(let y=Y0; y<by; y++){ const L = lEdge(y), Rr = rEdge(y);
      for(let x=X0; x<=X1; x++){ if(!M(x, y)) continue; const u = (x+.5-x0)/RW, v = (by-(y+.5))/RH, td = y - colTop[x-X0];
        let col = ROCK.base;
        if(td <= S(2) && u < .8) col = ROCK.lt;                                        // sunny top cap
        const litW = Math.max(2, Math.round(RW*(v > .5 ? .07 + (v-.5)*.3 : .05)));
        if(x - L < litW) col = ROCK.lt;                                                // lit forehead
        if(Rr - x < Math.round(RW*(.06 + .1*(1-v)))) col = ROCK.sh;                     // shaded rump
        if(u < .14 && v < .62){ col = x - L < Math.max(2, Math.round(RW*.04)) ? ROCK.lt : ROCK.base; if(!M(x+1, y)) col = ROCK.sh; }   // trunk
        if(!M(x-1, y) && u > .2 && u < .42 && v < .62) col = ROCK.lt;                    // lit wall inside the arch
        if(!M(x, y+1) && y < by-1) col = ROCK.dk;                                       // dark arch ceiling
        if(!M(x, y+2) && y < by-2 && M(x, y+1)) col = ROCK.sh;
        for(const [cu, v0, v1] of cracks){ const cx = Math.round(x0 + cu*RW + Math.round(Math.sin(v*9)*.8));
          if(v < v0-.03 && v > v1){ if(x === cx) col = ROCK.dk; else if(x === cx+1 && col === ROCK.base) col = ROCK.lt; } }
        if(!M(x, y-1)) col = u < .75 ? ROCK.hi : ROCK.lt;                               // rim
        if(y >= by-1) col = ROCK.sh;
        P(x, y, col); } }
  }

  /* ---------- Maraya: the mirrored box */
  {
    const mx0 = Math.round(W*.545), mx1 = Math.round(W*.855), mx2 = Math.round(W*.925);
    const mty = Math.round(H*.5), mby = Math.round(H*.775);
    const vpd = W*.28;
    const sTop = x => mty + Math.round((HZ-mty)*(x-mx1)/vpd), sBot = x => mby - Math.round((mby-HZ)*(x-mx1)/vpd);
    // reflected cliffs across the valley (lower than the real ones so a band of sky shows)
    const FW = mx2 - mx0, rH = HZ - mty - S(4);
    const refl = [[.04,.1,.7,5],[.17,.09,.95,8],[.3,.08,.6,6],[.45,.1,.85,8],[.6,.08,1,9],[.74,.09,.7,6],[.88,.08,.9,8],[1.0,.07,.65,6]]
      .map(([f, w, hh, pw]) => [mx0 + f*FW, w*FW, HZ - Math.round(hh*rH), pw]);
    const {top, du} = towers(refl, HZ);
    const role = (x, y) => {
      const pb = 1 + ((x*5) % 7 < 3 ? 1 : 0) + ((x*3) % 11 === 0 ? 2 : 0);
      if(y >= HZ-pb && y <= HZ) return 'palm';
      if(y >= HZ){ const dy = y - HZ, rr = dy === 4 ? 0 : dy === 9 ? 1 : dy === 15 ? 2 : -1; if(rr >= 0 && ((x + rr*7) % (12 + rr*4)) < 3 + rr*2) return 'rip'; const q = dy/Math.max(1, mby - HZ); return q*16 > BAYER[y&3][x&3] + .5 ? 'sand2' : 'sand'; }
      if(y >= top[x]){ const d = du[x]; return y === top[x] ? 'cl' : d < -.45 ? 'cl' : d > .45 ? 'cs' : 'cb'; }
      const t = (y - mty)/Math.max(1, HZ - mty - rH*.5);
      return t*16 > BAYER[y&3][x&3] + .5 ? 'skyB' : 'skyA';
    };
    const g1 = mx0 + mty + Math.round((mx1-mx0)*.28), g2 = mx0 + mty + Math.round((mx1-mx0)*.72);
    const glint = (x, y) => { const q = x + y; return (q >= g1 && q < g1 + S(3)) || q === g1 + S(3) + 2 || (q >= g2 && q < g2 + S(2)); };
    // front face
    for(let y=mty; y<=mby; y++) for(let x=mx0; x<=mx1; x++) P(x, y, MIR[role(x, y)][glint(x, y) ? 1 : 0]);
    // side face, receding to the right
    for(let x=mx1+1; x<=mx2; x++) for(let y=sTop(x); y<=sBot(x); y++) P(x, y, MIR[role(x, y)][2]);
    // thin dark frame
    hline(mx0, mx1, mty, FRAME); hline(mx0, mx1, mby, FRAME); vline(mx0, mty, mby, FRAME); vline(mx1, mty, mby, FRAME);
    line(mx1, mty, mx2, sTop(mx2), FRAME); line(mx1, mby, mx2, sBot(mx2), FRAME); vline(mx2, sTop(mx2), sBot(mx2), FRAME);
    // contact shadow
    hline(mx0+1, mx1, mby+1, RIP.sh);
    for(let x=mx1+1; x<=mx2; x++) P(x, sBot(x)+1, RIP.sh);
  }

  /* ---------- hot-air balloons */
  const balloon = (cx, cy, r, cols, gores) => {
    cx = Math.round(cx); cy = Math.round(cy);
    const neck = Math.max(1, Math.round(r*.32)), bot = Math.round(r*1.3);
    const hwAt = dy => { if(dy <= r*.3) return Math.sqrt(Math.max(0, r*r - dy*dy)); const t = (dy - r*.3)/(bot - r*.3); return (1-t)*Math.sqrt(r*r*.91) + t*neck; };
    const inside = (dx, dy) => dy >= -r && dy <= bot && Math.abs(dx) <= hwAt(dy) - .25;
    for(let dy=-r; dy<=bot; dy++) for(let dx=-r-1; dx<=r+1; dx++){ if(!inside(dx, dy)) continue;
      const hw = hwAt(dy) + .3, u = Math.max(-.999, Math.min(.999, dx/hw)), a = Math.asin(u);
      const gi = Math.min(gores-1, Math.floor((a + Math.PI/2)/(Math.PI/gores)));
      const ramp = cols[gi % cols.length];
      let li = u < -.42 ? 2 : u > .45 ? 0 : 1;
      if(dy < -r*.72 && li === 1) li = 2;
      if(!inside(dx+1, dy) || !inside(dx, dy+1)) li = 0;
      P(cx+dx, cy+dy, ramp[li]); }
    // ropes and basket
    const bw = Math.max(2, Math.round(r*.5)), bh = Math.max(2, Math.round(r*.36)), ropeY = cy + bot + 1, bty = ropeY + Math.max(1, Math.round(r*.3));
    for(let y=ropeY; y<bty; y++){ P(cx-neck, y, '#5a4032'); P(cx+neck, y, '#5a4032'); }
    rect(cx-Math.floor(bw/2), bty, bw, bh, '#7a4e2e'); hline(cx-Math.floor(bw/2), cx-Math.floor(bw/2)+bw-1, bty, '#a8744a');
  };
  const r1 = S(9), r2 = S(6.5), r3 = S(4.5);
  balloon(W*.475, Math.max(27 + r1, H*.28), r1, [BAL.red, BAL.yel], 7);
  balloon(W*.27, Math.max(27 + r2, H*.25), r2, [BAL.blu, BAL.wht], 6);
  balloon(W*.7, Math.max(28 + r3, H*.3), r3, [BAL.grn, BAL.org], 5);

  /* ---------- foreground: desert shrubs */
  {
    const b = S(1);
    blob([[W*.9, H-S(6), S(5), S(3.2)], [W*.9+S(5), H-S(5), S(4), S(2.6)], [W*.9-S(4), H-S(5), S(3), S(2.2)]], {hi:SHRUB.lt, lt:SHRUB.lt, base:SHRUB.base, sh:SHRUB.dk, dk:'#4a5f30'}, true);
    blob([[W*.3, H-S(9), Math.max(3.5, S(3.5)), Math.max(2.4, S(2.2))], [W*.3+Math.max(3, S(3)), H-S(9)+b, Math.max(2.8, S(2.6)), Math.max(2, S(1.8))]], {hi:SHRUB.lt, lt:SHRUB.lt, base:SHRUB.base, sh:SHRUB.dk, dk:'#4a5f30'}, true);
  }
};
})();
