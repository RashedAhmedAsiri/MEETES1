/* =========================================================================
   game.js — screens, activities, adaptive learning, rewards, sound.
   ========================================================================= */
'use strict';

/* ---------------------------------------------------------------- helpers */
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const rnd = (a,b) => a + Math.floor(Math.random()*(b-a+1));
const pick = a => a[Math.floor(Math.random()*a.length)];
const shuffle = a => { a=[...a]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const AR = '٠١٢٣٤٥٦٧٨٩';
const num = n => ST.settings.digits === 'arab' ? String(n).replace(/\d/g, d => AR[d]) : String(n);
const stationById = id => STATIONS.find(s => s.id === id);

/* ---------------------------------------------------------------- state (this device only) */
const KEY = 'burum.v2';
function blank(){ return {profiles:{}, activeId:null, settings:{sound:true, music:true, digits:'arab', openAll:false}}; }
function load(){ try{ const s = JSON.parse(localStorage.getItem(KEY)); if(s && s.profiles){ s.settings = Object.assign(blank().settings, s.settings||{}); return s; } }catch(e){} return blank(); }
let ST = load();
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(ST)); }catch(e){} }
const P = () => ST.profiles[ST.activeId];
function newProfile(name, symbol, avatar){
  const id = 'c' + Date.now().toString(36);
  ST.profiles[id] = {id, name, symbol, avatar, created:Date.now(), stars:0, st:{}, missions:{}, skills:{}, log:[], medal:null, at:null};
  ST.activeId = id; save(); return ST.profiles[id];
}
const stRec = id => (P().st[id] ||= {acts:{}, done:null});
function logAttempt(rec){ const p = P(); if(!p) return; rec.t = Date.now(); p.log.push(rec); if(p.log.length > 800) p.log.shift(); save(); }
const earnedSet = p => new Set(STATIONS.filter(s => p.st[s.id] && p.st[s.id].done).map(s => s.id));

/* ---------------------------------------------------------------- pixel scale */
let SC = 0, AP = {w:0,h:0}, NARROW = false, CUR = null, DENSE = false;
function fit(){
  /* adult screens (dashboards) use a denser whole-number zoom of the same grid so tables fit */
  const s = DENSE ? Math.max(2, Math.min(5, Math.floor(Math.min(innerWidth/420, innerHeight/300))))
                  : Math.max(2, Math.min(6, Math.floor(Math.min(innerWidth/330, innerHeight/250))));
  const nar = Math.floor(innerWidth/s) < 330;
  const changed = s !== SC || nar !== NARROW;
  SC = s; NARROW = nar; AP = {w:Math.floor(innerWidth/s), h:Math.floor(innerHeight/s)};
  document.documentElement.style.setProperty('--s', s); document.body.classList.toggle('narrow', nar);
  return changed;
}
function dense(on){ if(DENSE !== on){ DENSE = on; fit(); } }
let resizeT = 0;
addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(() => { if(fit() && CUR && CUR.safe) CUR.fn(...(CUR.args||[])); }, 150); });

/* ---------------------------------------------------------------- pixel text presets */
const TX = {
  body:(t,maxW) => T(t,{size:13, maxW}),
  small:(t,c='#6b6450') => T(t,{size:11, color:c}),
  label:(t,c='#1b1e2b') => T(t,{size:13, color:c}),
  btn:t => T(t,{size:14}),
  btnW:t => T(t,{size:14, color:'#ffffff', shadow:'#0a4a2a'}),
  title:(t,c='#0e6b3a') => T(t,{size:18, color:c, shadow:'#e6d9b8', maxW:AP.w - 24}),
  letter:(t,c='#ffffff') => T(t,{size:30, color:c, shadow:c==='#ffffff'?'#0a4a2a':'#d9c89c'}),
  digit:(t,c='#ffffff') => T(t,{size:24, color:c, shadow:c==='#ffffff'?'#0a4a2a':'#c98a1a'}),
};
function btn({id='', cls='', icon='', label='', aria='', attrs=''}){
  const lab = label ? ((/green|blue/.test(cls)) ? TX.btnW(label) : TX.btn(label)) : '';
  return `<button class="pbtn ${cls}" ${id?`id="${id}"`:''} ${attrs} aria-label="${esc(aria||label)}">${icon?S_(icon):''}${lab}</button>`;
}
const stage = $('#stage');
let token = 0;
const later = (fn, ms) => { const t = token; setTimeout(() => { if(t === token) fn(); }, ms); };
function show(html, cur=null){ token++; closeModal(); if(DENSE && !(cur && cur.dense)) dense(false); stage.innerHTML = html; CUR = cur; const sc = stage.firstElementChild; if(sc) sc.scrollTop = 0; }

/* ---------------------------------------------------------------- voice
   One queue for everything Barem says. A line plays its recorded clip (VOICE_CLIPS in
   js/voice-files.js, keyed by voiceKey) when there is one; with no clip, a missing file or
   refused playback, the browser speaks it. Microsoft Edge offers the same neural Saudi
   voices that tools/voice records with, so those come first. */
let arVoice = null, arNatural = false;
function pickVoice(){ try{
  const vs = speechSynthesis.getVoices(), sa = v => /^ar[-_]SA/i.test(v.lang), nat = vs.filter(v => sa(v) && /Online \(Natural\)/i.test(v.name));
  arVoice = nat.find(v => /Zariyah/i.test(v.name)) || nat.find(v => /Hamed/i.test(v.name)) || nat[0] || vs.find(sa) || vs.find(v => /^ar/i.test(v.lang)) || null;
  arNatural = nat.includes(arVoice); }catch(e){} }
if('speechSynthesis' in window){ pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
function line(id, vars={}){ let t = VOICE[id] ?? id; if(Array.isArray(t)) t = pick(t); return t.replace(/\{(\w+)\}/g, (_,k) => vars[k] ?? ''); }
const CLIPS = typeof VOICE_CLIPS === 'object' ? VOICE_CLIPS : {}, CLIP_COUNT = Object.keys(CLIPS).length;
const VQ = {list:[], cur:null, el:null};   /* waiting lines, the line playing now, the one shared <audio> */
function stopVoice(){
  VQ.list.length = 0; if(VQ.cur) clearTimeout(VQ.cur.timer); VQ.cur = null;
  if(VQ.el) try{ VQ.el.pause(); }catch(e){}
  try{ if('speechSynthesis' in window) speechSynthesis.cancel(); }catch(e){}
}
function speakRaw(text, queue=false){
  if(!ST.settings.sound) return;
  const t = voiceKey(text); if(!t) return;
  if(!queue) stopVoice();
  VQ.list.push(t); if(!VQ.cur) nextVoice();
}
function nextVoice(){
  const t = VQ.list.shift(); if(t === undefined) return;
  const me = VQ.cur = {timer:0}, live = () => VQ.cur === me;
  const done = () => { if(!live()) return; clearTimeout(me.timer); VQ.cur = null; nextVoice(); };
  const synth = () => { if(!live() || me.synth) return; me.synth = true; clearTimeout(me.timer); if(VQ.el) try{ VQ.el.pause(); }catch(e){} synthSay(t, me, live, done); };
  const src = CLIPS[t];
  if(!src){ if(CLIP_COUNT) console.debug('no voice clip, using the browser voice:', t); return synth(); }
  try{
    const a = VQ.el ||= new Audio(); a.pause();
    a.onended = () => !me.synth && done(); a.onerror = synth;
    a.onplaying = () => { if(!live() || me.synth) return; clearTimeout(me.timer); me.timer = setTimeout(done, ((isFinite(a.duration) ? a.duration : 8) + 1.5) * 1000); };
    a.src = src; me.timer = setTimeout(synth, 5000);      /* a clip that never starts is spoken instead */
    const p = a.play(); if(p && p.catch) p.catch(synth);  /* refused or missing: speak it */
  }catch(e){ synth(); }
}
function synthSay(t, me, live, done){
  if(!('speechSynthesis' in window)) return done();
  try{
    const u = me.u = new SpeechSynthesisUtterance(t);   /* keep a reference: collected utterances lose their events */
    u.lang = 'ar-SA'; if(arVoice) u.voice = arVoice;
    u.rate = arNatural ? .9 : .85; u.pitch = arNatural ? 1 : 1.15;
    u.onend = u.onerror = done; speechSynthesis.speak(u);
    const idle = () => { if(!live()) return; if(speechSynthesis.speaking || speechSynthesis.pending) me.timer = setTimeout(idle, 250); else done(); };
    me.timer = setTimeout(idle, 600);                    /* some browsers never fire onend */
  }catch(e){ done(); }
}
/* iOS plays audio from timers only on an element that first played during a tap */
addEventListener('click', () => { if(VQ.el || !Object.keys(CLIPS).length) return;
  try{ VQ.el = new Audio('data:audio/wav;base64,UklGRnQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVAAAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA=='); VQ.el.play().catch(()=>{}); }catch(e){} }, {capture:true, once:true});
function bubble(w, text=''){ return `<div class="bubble-wrap"><div class="bubble" id="bubble" data-w="${w}" data-t="${esc(text)}">${text?TX.body(text,w):''}</div><div class="tail"></div></div>`; }
function setBubble(text){ const b = $('#bubble'); if(!b) return; b.dataset.t = text; b.innerHTML = TX.body(text, +b.dataset.w || 120); }
function say(id, vars={}, opts={}){
  const text = line(id, vars); const b = $('#bubble');
  if(b) setBubble(opts.append && b.dataset.t ? b.dataset.t + ' ' + text : text);
  let spoken = text;
  if(opts.alt && !CLIPS[voiceKey(text)]){ const alt = line(opts.alt, vars); if(CLIPS[voiceKey(alt)]) spoken = alt; }
  speakRaw(spoken, !!opts.queue); return text;
}
function mood(state){ const w = $('#bw'); if(w) w.innerHTML = B_(state); }

/* ---------------------------------------------------------------- chiptune sound + music */
let AC = null;
function audio(){ try{ AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if(AC.state === 'suspended') AC.resume(); }catch(e){ AC = null; } return AC; }
function tone(freqs, dur=.1, type='square', gap=.08, vol=.05){
  if(!ST.settings.sound) return; const a = audio(); if(!a) return; const t0 = a.currentTime + .01;
  freqs.forEach((f,i) => { const o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.value = f; const s = t0 + i*gap;
    g.gain.setValueAtTime(vol, s); g.gain.setValueAtTime(vol, s+dur*.6); g.gain.linearRampToValueAtTime(0, s+dur); o.connect(g).connect(a.destination); o.start(s); o.stop(s+dur+.02); });
}
const sfx = { tap:()=>tone([660],.05,'square',0,.035), ok:()=>tone([784,988,1319],.08,'square',.07,.045), soft:()=>tone([330,262],.13,'triangle',.12,.09),
  win:()=>tone([523,659,784,1047,784,1047,1319],.09,'square',.08,.045), pop:()=>tone([880,1760],.04,'square',.03,.035), step:()=>tone([392,523],.04,'square',.09,.03) };
/* Background music: the Saudi national anthem «عاش المليك» (music Abdul Rahman al-Khateeb, 1947; words «سارعي للمجد والعلياء»
   Ibrahim Khafaji, 1984), one sung pass, then two bars' rest, then it loops. F major, 4/4, quarter note = 92 bpm.
   Each event is [note, beats]: a quarter note is 1 beat, and null is a rest.
   Source: pianoletternotes.blogspot.com/2021/11/national-anthem-of-saudi-arabia.html, which gives the melody on a 16th-note grid
   and the left-hand chords. Pitches cross-checked with kalimbatabs.net/kalimba-tabs-tutorials/national-anthem-of-saudi-arabia/,
   which differs only in bar 6's last note (Bb4 there). Key F from the U.S. Navy Band version and Chordify; 4/4 and one ~29 s pass
   from 8notes.com/scores/37235.asp. */
const Music = { timer:null, t0:0, i:0, ev:null, len:0, bpm:92, live:new Set(),
  mel:[
    ['F4',.75],['F4',.25],['F4',2.5],['C4',.5],                                          // 1  سا-رِ-عي لِل
    ['F4',.75],['G4',.25],['A4',.5],['Bb4',.5],['C5',2],                                 // 2  مجدِ والعلياء
    ['C5',.75],['D5',.25],['C5',.5],['Bb4',.5],['A4',.5],['G4',.5],['F4',.5],['E4',.5],  // 3  مجّدي لخالقِ السـ
    ['F4',1],['F4',.75],['F4',.25],['F4',2],                                             // 4  ـماء + fanfare echo
    ['C5',.75],['C5',.25],['C5',.5],['D5',.5],['C5',.75],['Bb4',.25],['A4',.5],['F4',.5], // 5  وارفعِ الخفّاق أخضر
    ['C5',.75],['C5',.25],['C5',.5],['F5',.5],['E5',.5],['D5',.5],['C5',.5],['C5',.5],   // 6  يحمل النور المسطّر
    ['Bb4',.75],['Bb4',.25],['Bb4',.5],['D5',.5],['C5',.75],['Bb4',.25],['A4',.5],['F4',.5], // 7  ردّدي الله أكبر
    ['C5',1],['D5',.75],['E5',.25],['F5',2],                                             // 8  يا موطني
    ['F4',.75],['F4',.25],['F4',2.5],['C4',.5],                                          // 9  موطني عِشْ
    ['F4',.75],['G4',.25],['A4',.5],['Bb4',.5],['C5',.75],['C5',.25],['C5',1],           // 10 ـتَ فخرَ المسلمين
    ['C5',.75],['D5',.25],['C5',.5],['Bb4',.5],['C5',1],['C5',.75],['C5',.25],           // 11 عاش المليك للعلَ
    ['F5',1],['C5',.75],['C5',.25],['F5',2],                                             // 12 ـمِ والوطن
    [null,8],
  ],
  bass:[ /* triangle, the root of the source's chord on beats 1 and 3 */
    ['F3',2],['F3',2], ['F3',2],['C3',2], ['Bb2',2],['C3',2], ['F3',2],['F3',2], ['F3',2],['F3',2], ['F3',2],['C3',2],
    ['Bb2',2],['F3',2], ['C3',2],['F3',2], ['F3',2],['F3',2], ['F3',2],['C3',2], ['Bb2',2],['C3',2], ['F3',4],
    [null,8],
  ],
  hz(n){ const m = /^([A-G])(#|b)?(\d)$/.exec(n); return 440 * Math.pow(2, ({C:-9,D:-7,E:-5,F:-4,G:-2,A:0,B:2}[m[1]] + (m[2]==='#') - (m[2]==='b') + (m[3]-4)*12) / 12); },
  build(){ const ev = []; let len = 0;
    [[this.mel,'square',.014,.92],[this.bass,'triangle',.04,.8]].forEach(([part,type,vol,legato]) => { let b = 0;
      part.forEach(([n,beats]) => { if(n) ev.push([b, this.hz(n), beats*legato, type, vol]); b += beats; }); len = Math.max(len, b); });
    this.len = len; return ev.sort((x,y) => x[0]-y[0]); },
  start(){ if(this.timer || !ST.settings.music) return; const a = audio(); if(!a) return; this.ev = this.ev || this.build(); this.t0 = a.currentTime + .15; this.i = 0; this.timer = setInterval(() => this.tick(), 60); },
  stop(){ clearInterval(this.timer); this.timer = null; const a = AC; if(!a) return;
    this.live.forEach(({o,g}) => { try{ const n = a.currentTime; g.gain.cancelScheduledValues(n); g.gain.setValueAtTime(g.gain.value, n);
      g.gain.linearRampToValueAtTime(0, n+.04); o.stop(n+.05); }catch(e){} });   /* fade out notes already scheduled or ringing */
    this.live.clear(); },
  tick(){ const a = AC; if(!a) return; const spb = 60/this.bpm, now = a.currentTime;
    if(now > this.t0 + this.len*spb + 1){ this.t0 = now + .15; this.i = 0; }            /* back from a long pause: start the anthem again */
    for(;;){ if(this.i >= this.ev.length){ this.i = 0; this.t0 += this.len*spb; }
      const e = this.ev[this.i], t = this.t0 + e[0]*spb; if(t > now + .3) break;
      if(t > now - .05) this.note(e[1], t, e[2]*spb, e[3], e[4]); this.i++; } },    /* notes already late are skipped, not bunched */
  note(f,t,d,type,v){ const a = AC, o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(v,t+.012); g.gain.linearRampToValueAtTime(v*.6,t+d*.85); g.gain.linearRampToValueAtTime(0,t+d);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t+d+.02);
    const n = {o,g}; this.live.add(n); o.onended = () => this.live.delete(n); },
};

/* ---------------------------------------------------------------- fx + modal */
function confetti(n=50){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const fx = $('#fx'); const cols = ['#0e6b3a','#f7c948','#5cbf60','#4fa4d8','#d94a3d','#ffffff'];
  for(let i=0;i<n;i++){ const c = document.createElement('i'); c.className = 'conf'; c.style.left = (Math.random()*100)+'%'; c.style.background = pick(cols);
    c.style.setProperty('--dx', ((Math.random()-.5)*120)+'px'); c.style.animationDelay = (Math.random()*.7)+'s'; fx.appendChild(c); setTimeout(()=>c.remove(), 3400); }
}
function popStar(el){
  const fx = $('#fx'); const r = el ? el.getBoundingClientRect() : {left:innerWidth/2, top:innerHeight/2, width:0, height:0};
  const d = document.createElement('div'); d.className = 'pop'; d.innerHTML = S_('star'); d.style.left = (r.left + r.width/2 - 12*SC)+'px'; d.style.top = (r.top + r.height/2 - 10*SC)+'px';
  fx.appendChild(d); setTimeout(()=>d.remove(), 1100);
}
function modal(html){ const m = $('#modal'); m.innerHTML = `<div class="pan" role="dialog" aria-modal="true">${html}</div>`; m.hidden = false; return m; }
function closeModal(){ const m = $('#modal'); if(m){ m.hidden = true; m.innerHTML = ''; } }

/* ---------------------------------------------------------------- navigation + HUD */
const NAV = {
  home:()=>splash(), map:()=>mapScreen(), missions:()=>missionsHub(), badges:()=>badgesScreen(), passport:()=>passportScreen(),
  sound:()=>{ ST.settings.sound = !ST.settings.sound; save(); if(!ST.settings.sound) stopVoice(); $$('[data-nav="sound"]').forEach(b => b.innerHTML = S_(ST.settings.sound?'i_speaker':'i_mute')); },
  music:()=>{ ST.settings.music = !ST.settings.music; save(); ST.settings.music ? Music.start() : Music.stop(); $$('[data-nav="music"]').forEach(b => b.innerHTML = S_(ST.settings.music?'i_music':'i_musicoff')); },
};
document.addEventListener('click', e => { const n = e.target.closest('[data-nav]'); if(n){ sfx.tap(); NAV[n.dataset.nav](); } });
function face(av){ return av === 'girl' ? 'girlface' : 'boyface'; }
function hud(active=''){
  const p = P();
  const b = (k, icon, label) => `<button class="pbtn ibtn ${active===k?'gold':''}" data-nav="${k}" aria-label="${label}" title="${label}">${S_(icon)}</button>`;
  return `<div class="hud">
    <button class="pbtn me" data-nav="home" aria-label="الشاشة الأولى">${S_(face(p.avatar))}${TX.label(p.name)}</button>
    <div class="pan stars" id="starbox">${S_('i_star')}${TX.label(num(p.stars))}</div>
    <div class="acts">${b('map','i_map','الخريطة')}${b('missions','i_flag','مهمات وطنية')}${b('badges','i_medal','شاراتي')}${b('passport','i_book','جوازي')}${b('sound', ST.settings.sound?'i_speaker':'i_mute','الصوت')}${b('music', ST.settings.music?'i_music':'i_musicoff','الموسيقى')}</div>
  </div><div class="sadu"></div>`;
}
function refreshStars(){ const b = $('#starbox'); if(b) b.innerHTML = S_('i_star') + TX.label(num(P().stars)); }

/* ================================================================ SCREENS */

/* ---- 1. splash */
function splash(){
  const p = P(); const profiles = Object.values(ST.profiles);
  const bgH = AP.h, bgW = AP.w;
  const logoSize = NARROW ? 26 : 32;
  const adult = (id, label) => `<button class="pbtn sand" id="${id}" aria-label="${label}">${TX.small(label, '#1b1e2b')}</button>`;
  const land = !(AP.h > AP.w*1.15);               // same test as the title scene's own layout
  // the two credit lines sit under Barem on short wide screens; on the narrowest of those a smaller size keeps them on screen
  const creditSize = AP.w < 190 ? 10 : land && AP.h < 230 && AP.w < 380 ? 9 : 11;   // 360 px phones: the two lines at 11 are 4 px wider than the screen
  show(`<section class="screen splash ${land ? 'land' : ''} ${land && AP.h < 230 ? 'short' : ''}">
    <div class="bg">${sceneTag('splash', bgW, bgH)}</div>
    <div class="corner">${adult('toParent', 'ولي الأمر')}${adult('toTeacher', 'المعلمة')}</div>
    <div class="fore">
      <div class="logo">${T('مغامرة برعم',{size:logoSize, color:'#f7c948', outline:'#1b1e2b', shadow:'#0a4a2a'})}
        <div class="logo2">${T('في وطننا',{size:Math.round(logoSize*.7), color:'#ffffff', outline:'#1b1e2b', shadow:'#0a4a2a'})}</div></div>
      <div class="pan tagp">${T('نتعلم وطننا… ونبني مستقبلنا',{size:13, color:'#0e6b3a', maxW:AP.w - 30})}</div>
      <div class="who">${bubble(NARROW?110:120, VOICE.welcome)}<div id="bw">${B_('wave')}</div></div>
      <div class="row center btns">${btn({id:'go', cls:'green big', label:'ابدأ المغامرة', icon:'i_play'})}${p ? btn({id:'cont', cls:'big', label:'متابعة '+p.name}) : ''}</div>
      <div class="credit">${T(CREDIT, {size:creditSize, color:'#4a2e1c'})}</div>
    </div>
  </section>`, {fn:splash, safe:true});
  placeFlag(land);
  $('#go').onclick = () => { sfx.tap(); Music.start(); say('welcome'); profiles.length ? whoPlays() : charSelect(true); };
  if(p) $('#cont').onclick = () => { sfx.tap(); Music.start(); enterMap(); };
  $('#toTeacher').onclick = () => { sfx.tap(); teacher(); };
  $('#toParent').onclick = () => { sfx.tap(); parentGate(); };
}
/* the flag goes in the biggest open patch of the title screen: nothing of the title, the
   mascot, the buttons or the corner buttons may cover the cloth, and it stays off Kingdom
   Centre, Al Faisaliah, the sun and the camel (the scene records where they are). Higher and
   more central patches win ties, so on wide screens it flies in the sky above the title. */
function placeFlag(land){
  const bg = $('.splash .bg'); if(!bg) return;
  const W = AP.w, H = AP.h, ox = (innerWidth - W*SC)/2, oy = innerHeight - H*SC, hy = land ? Math.round(H*.62) : Math.round(H*.2);
  const rects = [];
  for(const el of $$('.splash .logo .px, .splash .tagp, .splash .bubble, .splash #bw, .splash .btns .pbtn, .splash .credit .px, .splash .corner')){
    const r = el.getBoundingClientRect(); if(!r.width) continue;
    rects.push([(r.left-ox)/SC - 3, (r.top-oy)/SC - 3, (r.right-ox)/SC + 3, (r.bottom-oy)/SC + 3]); }
  const scene = (window.SPLASH_BOXES || {})[W+'x'+H] || [];
  const find = soft => {                     // soft: also keep clear of the sun, the camel and the palms
  const rs = rects.concat(scene.filter(b => soft || !b[4]).map(b => [b[0]-2, b[1]-2, b[2]+2, b[3]+2]));
  // occupancy on a 2-pixel grid, then a summed-area table to test any box at once
  const G = 2, cols = Math.ceil(W/G), rows = Math.ceil(H/G), sat = new Int32Array((cols+1)*(rows+1));
  const busy = (c, r) => { const x0 = c*G, y0 = r*G, x1 = x0 + G, y1 = y0 + G;
    if(x0 < 3 || x1 > W - 3 || y0 < 2 || y1 > H - 2) return 1;
    for(const q of rs) if(x1 > q[0] && x0 < q[2] && y1 > q[1] && y0 < q[3]) return 1;
    return 0; };
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) sat[(r+1)*(cols+1)+c+1] = busy(c,r) + sat[r*(cols+1)+c+1] + sat[(r+1)*(cols+1)+c] - sat[r*(cols+1)+c];
  const free = (c, r, w, h) => c + w <= cols && r + h <= rows && !(sat[(r+h)*(cols+1)+c+w] - sat[r*(cols+1)+c+w] - sat[(r+h)*(cols+1)+c] + sat[r*(cols+1)+c]);
  let best = null;
  for(let fh = Math.min(80, H*.3); fh >= 28 && !best; fh -= 2){
    const fw = Math.round(fh*1.5), amp = Math.max(1, Math.round(fh*.035)), top = 3 + amp;
    const bw = Math.ceil((fw + 2)/G), bh = Math.ceil((fh + 2*amp + 4)/G);       // pole, finial, wave
    for(let r=0; r+bh<=rows; r++) for(let c=0; c+bw<=cols; c++){
      const y = r*G; if(y + top + fh + amp > hy - 2 && y + top < hy + 6) continue;   // all in the sky, or all over the sand
      if(!free(c, r, bw, bh)) continue;
      const score = y + Math.abs(c*G + (fw + 2)/2 - W/2)*.25;
      if(!best || score < best.score) best = {score, fh, fw, x:c*G, y};
    }
  }
  return best;
  };
  const best = find(true) || find(false);
  const k = Math.max(1, Math.round(SC*(window.devicePixelRatio || 1)));
  if(NARROW && (!best || best.fh < 40)){
    // a short phone screen has no open patch big enough: the flag takes the greeting bubble's place
    // beside Barem (who still says the greeting)
    $('.splash').classList.add('compact');
    const el = document.createElement('img');
    el.className = 'px flaginline'; el.alt = 'علم المملكة العربية السعودية'; el.draggable = false;
    const put = fh => { const fw = Math.round(fh*1.5), top = 3 + Math.max(1, Math.round(fh*.035)), artH = top + fh + top + 12;
      const img = cacheCanvas(`flag:${fw}x${fh}:${k}:${artH}`, () => flagCanvas(fw, fh, artH, k).canvas);
      el.src = img.url; el.style.cssText = `--w:${fw + 2};--h:${img.h / k}`; };
    let fh = Math.round(Math.min(90, W - 84)/1.5); put(fh);
    $('.splash .who').insertBefore(el, $('#bw'));
    const over = Math.ceil(2 - ($('.splash .fore').getBoundingClientRect().top - oy)/SC);   // still too tall: shrink the flag to fit
    if(over > 0 && fh - over >= 30) put(fh - over);
    return;
  }
  if(!best) return;
  const {fh, fw} = best, top = 3 + Math.max(1, Math.round(fh*.035));
  const poleBottom = best.y + top + fh < hy ? hy : H;                                  // down to the city, or into the dunes
  const artH = poleBottom - best.y;
  const img = cacheCanvas(`flag:${fw}x${fh}:${k}:${artH}`, () => flagCanvas(fw, fh, artH, k).canvas);
  const el = document.createElement('img');
  el.className = 'px flagimg'; el.alt = 'علم المملكة العربية السعودية'; el.draggable = false; el.src = img.url;
  el.style.cssText = `--w:${fw + 2};--h:${img.h / k};left:${ox + best.x*SC}px;top:${oy + best.y*SC}px`;
  bg.appendChild(el);
}
function enterMap(){ const p = P(); mapScreen(); say('hello', {name:p.name}, {alt:'helloHero'}); say('whereToday', {}, {queue:true}); }

/* ---- 2a. who is playing (shared classroom tablet) */
function whoPlays(){
  const list = Object.values(ST.profiles).sort((a,b)=>(b.at||b.created)-(a.at||a.created)).slice(0,8);
  show(`<section class="screen" style="align-items:center;justify-content:center">
    ${TX.title('من يلعب الآن؟')}
    <div class="row center">${list.map(p=>`<button class="pbtn card" data-p="${p.id}">${S_(p.avatar)}${TX.label(p.name)}</button>`).join('')}</div>
    <div class="row center">${btn({id:'newKid', cls:'green', label:'لاعب جديد'})}${btn({id:'back', label:'رجوع'})}</div>
  </section>`, {fn:whoPlays, safe:true});
  $$('[data-p]').forEach(b => b.onclick = () => { sfx.tap(); ST.activeId = b.dataset.p; save(); enterMap(); });
  $('#newKid').onclick = () => { sfx.tap(); charSelect(); };
  $('#back').onclick = () => splash();
}

/* ---- 2. character + name */
function charSelect(queueVoice){
  let avatar = null, symbol = null;
  show(`<section class="screen" style="align-items:center">
    <div class="row center"><div id="bw">${B_('happy')}</div>${bubble(NARROW?120:150, VOICE.chooseFriend)}</div>
    ${TX.title('اختر صديقك للمغامرة')}
    <div class="chars"><button class="pbtn charbtn" data-av="boy" aria-label="طفل">${S_('boy')}</button><button class="pbtn charbtn" data-av="girl" aria-label="طفلة">${S_('girl')}</button></div>
    <div class="col" id="nb" hidden>
      ${TX.title('ما اسمك؟')}
      <div class="syms">${SYMBOLS.map(([s,n])=>`<button class="pbtn sym" data-sym="${s}" aria-label="${n}">${S_(s)}</button>`).join('')}</div>
      <input class="name-in" id="nameIn" maxlength="12" placeholder="اسم أول أو اسم مستعار" autocomplete="off" aria-label="اسم أول أو اسم مستعار">
      ${T('لا نطلب أي بيانات شخصية. يكفي اسم أول أو رمز.',{size:11, color:'#6b6450', maxW:AP.w - 24})}
      <div class="row center">${btn({id:'goMap', cls:'green big', label:'هيا نبدأ الرحلة', icon:'i_map', attrs:'disabled'})}${btn({id:'back', label:'رجوع'})}</div>
    </div>
  </section>`);
  say('chooseFriend', {}, {queue:!!queueVoice});
  const check = () => { $('#goMap').disabled = !(avatar && (symbol || $('#nameIn').value.trim())); };
  $$('.charbtn').forEach(b => b.onclick = () => { sfx.tap(); avatar = b.dataset.av; $$('.charbtn').forEach(x => x.classList.toggle('on', x===b));
    if($('#nb').hidden){ $('#nb').hidden = false; say('askName'); later(()=>$('#nb').scrollIntoView({behavior:'smooth', block:'center'}), 60); } check(); });
  $$('.sym').forEach(b => b.onclick = () => { sfx.tap(); symbol = b.dataset.sym; $$('.sym').forEach(x => x.classList.toggle('on', x===b)); check(); });
  $('#nameIn').oninput = check;
  $('#back').onclick = () => splash();
  $('#goMap').onclick = () => {
    const typed = $('#nameIn').value.trim().replace(/\s+/g,' ').slice(0,12);
    const sym = symbol || 'star'; const name = typed || SYMBOLS.find(s=>s[0]===sym)[1];
    newProfile(name, sym, avatar); sfx.win(); enterMap();
  };
}

/* ---- 3. map */
function isOpen(id){
  if(ST.settings.openAll) return true;
  const i = STATIONS.findIndex(s => s.id === id); if(i === 0) return true;
  const p = P(); const prev = STATIONS[i-1].id; return !!(p && p.st[prev] && p.st[prev].done);
}
const LABEL_SIDE = {jeddah:'l', madinah:'r', alula:'t', east:'t', qassim:'t'};
function mapScreen(){
  const p = P(); if(!p) return splash();
  p.at = Date.now(); save();
  const sideW = NARROW ? 0 : 104;
  const availW = AP.w - 14 - (NARROW ? 0 : sideW + 5), availH = AP.h - 64;
  let mw = Math.min(260, availW), mh = Math.round(mw*.8);
  if(!NARROW && mh > availH){ mh = Math.max(150, availH); mw = Math.round(mh/.8); }
  const earned = earnedSet(p);
  const key = `map:${mw}x${mh}:${[...earned].sort().join(',')}`;
  let proj;
  const art = cacheCanvas(key, () => { const m = mapCanvas(mw, mh, STATIONS, earned); proj = m.proj; return m.canvas; });
  proj = proj || mapProj(mw, mh);
  const showLabels = mw >= 240;
  const pins = STATIONS.map((s,i) => {
    const [x,y] = proj(s.pos).map(Math.round); const done = earned.has(s.id), open = isOpen(s.id);
    const cls = done ? 'done' : open ? 'open' : 'locked';
    const side = LABEL_SIDE[s.id] || 'b';
    const lbl = showLabels ? `<span class="lbl" style="position:absolute;${side==='b'?'top:calc(var(--u)*21);':side==='t'?'bottom:calc(var(--u)*21);':'top:calc(var(--u)*3);'}${side==='l'?'right:calc(var(--u)*21);':side==='r'?'left:calc(var(--u)*21);':'left:50%;transform:translateX(-50%);'}white-space:nowrap">${TX.small(s.short, done?'#0e6b3a':'#1b1e2b')}</span>` : '';
    const mark = done ? `<span class="flag">${S_('i_check')}</span>` : (!open ? `<span class="flag">${S_('i_lock')}</span>` : '');
    return `<button class="pin ${cls}" data-st="${s.id}" style="left:calc(var(--u)*${x-10});top:calc(var(--u)*${y-9})" aria-label="${s.name}"><span class="dot">${S_(s.icon)}</span>${mark}${lbl}</button>`;
  }).join('');
  const at = stationById(p.lastStation || 'makkah'); const [wx,wy] = proj(at.pos).map(Math.round);
  const pieces = earned.size;
  show(`<section class="screen">
    ${hud('map')}
    <div class="mapwrap">
      <div class="mapbox" style="width:calc(var(--u)*${mw});height:calc(var(--u)*${mh})">${imgTag(art)}${pins}
        <div class="walker" id="walker" style="left:calc(var(--u)*${wx+4});top:calc(var(--u)*${wy-18})">${S_('mini')}</div></div>
      <div class="side">
        ${bubble(NARROW ? Math.min(150, AP.w-70) : 96, VOICE.whereToday)}
        <div id="bw">${B_('map')}</div>
        <div class="pan col" style="width:100%">${TX.label('قطع خريطة المملكة')}${TX.label(`${num(pieces)} من ${num(8)}`,'#0e6b3a')}<div class="meter"><i style="width:${pieces/8*100}%"></i></div></div>
        ${p.medal ? btn({id:'medalBtn', cls:'gold', label:'وسام برعم الوطن', icon:'i_medal'}) : ''}
      </div>
    </div>
  </section>`, {fn:mapScreen, safe:true});
  $$('.pin').forEach(b => b.onclick = () => onPin(b.dataset.st, proj));
  if(p.medal) $('#medalBtn').onclick = () => medalScreen();
}
function onPin(id, proj){
  const s = stationById(id); sfx.tap();
  if(!isOpen(id)){
    const prev = STATIONS[STATIONS.findIndex(x=>x.id===id)-1];
    say('locked', {prev:prev.name}); mood('help');
    modal(`${B_('help')}${TX.title(s.name)}${TX.body(`تفتح هذه المحطة بعد إكمال محطة ${prev.name}.`, 180)}${btn({id:'mok', cls:'green', label:'حسنًا'})}`);
    $('#mok').onclick = closeModal; return;
  }
  const [x,y] = proj(s.pos).map(Math.round); const w = $('#walker');
  if(w){ w.style.left = `calc(var(--u)*${x+4})`; w.style.top = `calc(var(--u)*${y-18})`; }
  P().lastStation = id; save(); say('walk', {name:s.name}); sfx.step(); later(sfx.step, 250); later(sfx.step, 500);
  later(() => stationHub(id), 800);
}

/* ---- 4. station hub */
function stationHub(id){
  const s = stationById(id); const rec = stRec(id);
  const nextIdx = s.acts.findIndex((_,i) => !rec.acts[i]);
  const sideW = 150, sw = NARROW ? Math.min(AP.w - 14, 240) : Math.min(AP.w - 14 - sideW - 5, 250), sh = Math.round(sw*.6);
  const compact = sw < 215;                       // too narrow for the name and a labelled map button side by side
  show(`<section class="screen">
    ${hud()}
    <div class="hub">
      <div class="scenecol" style="width:calc(var(--u)*${sw + 2})">
        <div class="scenehead"><div class="title">${TX.title(s.name)}</div>
          <div class="back">${compact ? btn({cls:'sand ibtn', icon:'i_map', aria:'الخريطة', attrs:'data-nav="map" title="الخريطة"'})
                                     : btn({cls:'sand', label:'الخريطة', icon:'i_map', attrs:'data-nav="map"'})}</div></div>
        <div class="sceneframe" style="width:calc(var(--u)*${sw});height:calc(var(--u)*${sh})">${sceneTag(id, sw, sh)}</div></div>
      <div class="acts-list ${s.acts.length >= 4 ? 'many' : ''}">
        <div class="guide-row"><div id="bw">${B_('happy')}</div>${bubble(NARROW ? Math.min(150, AP.w - 70) : sideW - 50)}</div>
        ${s.acts.map((a,i) => { const inf = ACT_INFO[a.type]; const ic = inf.iconFor ? inf.iconFor(a) : inf.icon;
          return `<button class="pbtn act-tile ${i===nextIdx?'next':''}" data-i="${i}">${S_(ic)}<span class="meta">${TX.label(inf.title(a))}</span><span class="st" style="opacity:${rec.acts[i]?1:.25}">${S_('i_star')}</span></button>`; }).join('')}
      </div>
    </div>
  </section>`, {fn:stationHub, args:[id], safe:true});
  say('intro_'+id);
  $$('.act-tile').forEach(b => b.onclick = () => { sfx.tap(); startAct(id, +b.dataset.i); });
  if(s.acts.every((_,i)=>rec.acts[i]) && !rec.done){ rec.done = Date.now(); save(); later(()=>award(id), 500); }
}
function startAct(stId, i){
  const a = stationById(stId).acts[i];
  ({letter:letterAct, write:writeAct, count:countAct, beach:beachAct, order:orderAct, path:pathAct, pairs:pairsAct, size:sizeAct, shapes:shapesAct, hunt:huntAct, classify:classifyAct, numqty:numQtyAct})[a.type](stId, i, a);
}
function completeAct(stId, i, fromEl){
  const p = P(); const rec = stRec(stId); rec.acts[i] = true; p.stars++; save();
  popStar(fromEl); sfx.win(); refreshStars();
  later(() => stationHub(stId), 1900);
}
function award(id){
  const s = stationById(id); const p = P();
  const all = STATIONS.every(x => p.st[x.id] && p.st[x.id].done);
  confetti(); sfx.win();
  modal(`${B_('celebrate')}${TX.title('أحسنت يا بطل!')}${TX.body('أكملت محطة '+s.name, 200)}
    <div class="gains">
      <div class="gain">${genTag('badge:'+s.icon+':1', ()=>badgeCanvas(s.icon, true))}${TX.small('شارة '+s.short)}</div>
      <div class="gain">${genTag('stamp:'+s.icon+':1', ()=>stampCanvas(s.icon, true))}${TX.small('ختم في الجواز')}</div>
      <div class="gain">${S_('i_map')}${TX.small('قطعة من الخريطة')}</div></div>
    ${all && !p.medal ? btn({id:'aok', cls:'gold big', label:'استلم وسامك', icon:'i_medal'}) : btn({id:'aok', cls:'green big', label:'إلى الخريطة', icon:'i_map'})}`);
  say('stationDone', {name:s.name});
  if(all) say('mapDone', {}, {queue:true});
  $('#aok').onclick = () => { if(all && !p.medal) medalScreen(); else mapScreen(); };
}

/* ---- activity frame */
function frame(stId, title, dots){
  const bw = NARROW ? Math.min(160, AP.w - 70) : 94;
  show(`<section class="screen">
    <div class="actbar"><button class="pbtn ibtn" id="backBtn" aria-label="رجوع">${S_('i_back')}</button>${TX.title(title)}<div class="dots" id="dots"></div><button class="pbtn ibtn" id="replay" aria-label="أعد الاستماع">${S_('i_speaker')}</button></div>
    <div class="actbody"><div class="guidecol">${bubble(bw)}<div id="bw">${B_('happy')}</div></div><div class="play pan" id="play"></div></div>
  </section>`);
  $('#backBtn').onclick = () => { sfx.tap(); stId === 'missions' ? missionsHub() : stationHub(stId); };
  setDots(0, dots);
}
function setDots(done, total){ const d = $('#dots'); if(d) d.innerHTML = Array.from({length:total}, (_,i)=>`<i class="${i<done?'on':''}"></i>`).join(''); }
function onReplay(fn){ const r = $('#replay'); if(r) r.onclick = () => { sfx.tap(); fn(); }; }
const play = () => $('#play');
function nudge(el){ el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); sfx.soft(); }
function card(word, i, extra=''){ return `<button class="pbtn card" data-i="${i}" ${extra} aria-label="صورة">${S_(WORDS[word])}<span class="w"></span></button>`; }
function reveal(el, word){ const w = el.querySelector('.w'); if(w) w.innerHTML = T(word,{size:13, color:'#0e6b3a'}); }
function letterTile(L, cls='', attrs=''){ return `<button class="pbtn tile ${cls}" ${attrs} aria-label="حرف ${L}">${TX.letter(L, '#0e6b3a')}</button>`; }

/* ---- letter activity (adaptive: find → hear → match → trace → find) */
function letterAct(stId, idx, a){
  const L = a.letter, cfg = LETTERS[L], p = P();
  const sk = p.skills['l_'+L] ||= {runs:0, clean:0, lastSupport:false};
  const hard = sk.clean >= 1;
  let steps = sk.lastSupport ? ['hear','find'] : ['find'];
  let doneSteps = 0, totalErr = 0, usedSupport = false;
  frame(stId, `حرف ${L}`, steps.length);
  const next = () => { setDots(doneSteps, doneSteps + steps.length); if(!steps.length) return finish(); const s = steps.shift(); ({find, hear, match, trace})[s](); };
  const stepDone = (delay=1500) => { doneSteps++; setDots(doneSteps, doneSteps + steps.length); later(next, delay); };

  function find(){
    const goods = shuffle(cfg.good).slice(0, hard ? 3 : 2), bads = shuffle(cfg.bad).slice(0, hard ? 3 : 2);
    const cards = shuffle([...goods.map(w=>({w,ok:1})), ...bads.map(w=>({w,ok:0}))]);
    play().innerHTML = `<div class="row center"><button class="pbtn ltile" id="lsnd" aria-label="استمع إلى الحرف">${TX.letter(L)}</button>${TX.label('اضغط على الصور التي تبدأ بحرف '+L,'#6b6450')}</div>
      <div class="cards" style="--cols:${NARROW?2:(cards.length===6?3:4)}">${cards.map((c,i)=>card(c.w,i)).join('')}</div>`;
    const intro = () => { mood('happy'); say('letterListen', {s:cfg.sound}); say('letterFind', {l:L}, {queue:true, append:true}); };
    intro(); onReplay(intro); $('#lsnd').onclick = () => speakRaw(cfg.sound);
    let found = 0, err = 0; const t0 = Date.now();
    $$('.card').forEach(b => b.onclick = () => {
      const c = cards[+b.dataset.i]; if(b.classList.contains('ok')) return;
      if(c.ok){ b.classList.add('ok'); b.classList.remove('glow'); reveal(b, c.w); sfx.ok(); speakRaw(c.w); found++;
        if(found === goods.length){ mood('cheer'); say('right', {}, {queue:true});
          logAttempt({station:stId, act:'letter', skill:'find', item:L, level:hard?2:1, errors:err, firstTry:err<=1, ms:Date.now()-t0}); stepDone(1800); }
      } else {
        nudge(b); err++; totalErr++;
        if(err >= 2 && !usedSupport){ usedSupport = true; mood('help'); say('wrong2');
          logAttempt({station:stId, act:'letter', skill:'find', item:L, level:hard?2:1, errors:err, firstTry:false, ms:Date.now()-t0});
          steps = ['hear','match','trace','find', ...steps.filter(s=>s!=='find')]; later(next, 2400); }
        else if(err >= 2){ mood('help'); say('wrong2'); $$('.card').forEach((x,i)=>{ if(cards[i].ok && !x.classList.contains('ok')) x.classList.add('glow'); }); }
        else { mood('help'); say('wrong1'); }
      }
    });
  }
  function hear(){
    const tiles = shuffle(cfg.tiles);
    play().innerHTML = `<button class="pbtn gold big" id="snd" aria-label="استمع">${S_('i_speaker')}${TX.btn('استمع')}</button>
      <div class="row center">${tiles.map(t=>letterTile(t,'',`data-t="${t}"`)).join('')}</div>`;
    const intro = () => { mood('happy'); say('letterHear', {s:cfg.sound}); };
    intro(); onReplay(intro); $('#snd').onclick = () => speakRaw(cfg.sound);
    let err = 0; const t0 = Date.now();
    $$('.tile').forEach(b => b.onclick = () => {
      if(b.dataset.t === L){ b.classList.add('ok'); sfx.ok(); mood('cheer'); say('right');
        logAttempt({station:stId, act:'letter', skill:'hear', item:L, level:2, errors:err, firstTry:err===0, ms:Date.now()-t0}); stepDone(); }
      else { nudge(b); err++; totalErr++; mood('help'); say('wrong1'); speakRaw(cfg.sound, true);
        if(err >= 2) $$('.tile').forEach(x => x.dataset.t===L && x.classList.add('glow')); }
    });
  }
  function match(){
    const g = pick(cfg.good), bs = shuffle(cfg.bad).slice(0,2);
    const opts = shuffle([{w:g,ok:1}, ...bs.map(w=>({w,ok:0}))]);
    play().innerHTML = `<div class="row center"><div class="pbtn ltile" aria-hidden="true">${TX.letter(L)}</div>${S_('i_back')}<div class="cards" style="--cols:3">${opts.map((c,i)=>card(c.w,i)).join('')}</div></div>`;
    const intro = () => { mood('happy'); say('letterMatch', {l:L}); };
    intro(); onReplay(intro);
    let err = 0; const t0 = Date.now();
    $$('.card').forEach(b => b.onclick = () => { const c = opts[+b.dataset.i];
      if(c.ok){ b.classList.add('ok'); reveal(b, c.w); sfx.ok(); speakRaw(c.w); mood('cheer'); say('right', {}, {queue:true});
        logAttempt({station:stId, act:'letter', skill:'match', item:L, level:3, errors:err, firstTry:err===0, ms:Date.now()-t0}); stepDone(1800); }
      else { nudge(b); err++; totalErr++; mood('help'); say(err>=2?'wrong2':'wrong1'); if(err >= 2) $$('.card').forEach((x,i)=>opts[i].ok && x.classList.add('glow')); }
    });
  }
  function trace(){
    const t0 = Date.now();
    const board = traceBoard(L, () => { sfx.ok(); mood('cheer'); say('traceDone');
      logAttempt({station:stId, act:'letter', skill:'trace', item:L, level:4, errors:0, firstTry:true, ms:Date.now()-t0}); stepDone(1700); },
      () => { mood('help'); say('traceMore'); });
    play().innerHTML = `${TX.label('مرّر إصبعك فوق الحرف','#6b6450')}${board.html}${btn({id:'clr', label:'امسح وحاول'})}`;
    const b = board.mount(); $('#clr').onclick = () => { sfx.tap(); b.clear(); };
    const intro = () => { mood('happy'); say('letterTrace', {l:L}); };
    intro(); onReplay(intro);
  }
  function finish(){
    const clean = !usedSupport && totalErr <= 1;
    sk.runs++; sk.lastSupport = usedSupport; sk.clean = clean ? sk.clean+1 : 0; save();
    logAttempt({station:stId, act:'letter', skill:'run', item:L, level:hard?2:1, errors:totalErr, firstTry:clean, support:usedSupport});
    mood('celebrate'); say('actDone'); completeAct(stId, idx, play());
  }
  next();
}

/* ---- finger-writing board: the letter drawn faint on a white board; ink that covers enough of
   it counts as written. Used by the letter activity's trace step and by the write activity. */
function traceBoard(text, onDone, onMore){
  const glyph = textCanvas(text, {size:62, color:'#000000'}), gd = glyph.getContext('2d').getImageData(0,0,glyph.width,glyph.height).data;
  let x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1;                      // the ink's own box, so the letter sits centred
  for(let y=0;y<glyph.height;y++) for(let x=0;x<glyph.width;x++) if(gd[(y*glyph.width+x)*4+3] > 0){ x0 = Math.min(x0,x); x1 = Math.max(x1,x); y0 = Math.min(y0,y); y1 = Math.max(y1,y); }
  if(x1 < 0){ x0 = y0 = 0; x1 = glyph.width - 1; y1 = glyph.height - 1; }
  const NW = Math.max(84, x1 - x0 + 25), NH = Math.max(84, y1 - y0 + 21);
  return {
    html:`<div class="tracewrap"><canvas id="tc" width="${NW}" height="${NH}" style="width:calc(var(--u)*${NW});height:calc(var(--u)*${NH})" aria-label="لوح الكتابة"></canvas></div>`,
    mount(){
      const cv = $('#tc'), ctx = cv.getContext('2d');
      const gx = Math.floor((NW - (x1 - x0 + 1))/2) - x0, gy = Math.floor((NH - (y1 - y0 + 1))/2) - y0;
      const target = new Uint8Array(NW*NH), ink = new Uint8Array(NW*NH), pts = [];
      for(let y=0;y<glyph.height;y++) for(let x=0;x<glyph.width;x++) if(gd[(y*glyph.width+x)*4+3] > 0){ const X = x+gx, Y = y+gy; if(X>=0&&Y>=0&&X<NW&&Y<NH){ target[Y*NW+X] = 1; pts.push(Y*NW+X); } }
      const paint = () => { ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,NW,NH);
        for(let i=0;i<NW*NH;i++){ const x = i%NW, y = (i/NW)|0;
          if(ink[i]){ ctx.fillStyle = target[i] ? '#0e6b3a' : '#5cbf60'; ctx.fillRect(x,y,1,1); continue; }
          if(target[i]){ const edge = !target[i-1] || !target[i+1] || !target[i-NW] || !target[i+NW]; ctx.fillStyle = edge ? (((x+y)&1) ? '#5cbf60' : '#e3f4e2') : '#e3f4e2'; ctx.fillRect(x,y,1,1); } } };
      paint();
      let drawing = false, last = null, lifts = 0, finished = false, nudged = false;
      const pos = e => { const r = cv.getBoundingClientRect(); return [Math.floor((e.clientX-r.left)/r.width*NW), Math.floor((e.clientY-r.top)/r.height*NH)]; };
      const dab = (x,y) => { for(let j=-3;j<=3;j++) for(let i=-3;i<=3;i++) if(i*i+j*j<=10){ const X=x+i, Y=y+j; if(X>=0&&Y>=0&&X<NW&&Y<NH) ink[Y*NW+X] = 1; } };
      const lineTo = (a,b) => { const n = Math.max(Math.abs(b[0]-a[0]), Math.abs(b[1]-a[1]), 1); for(let k=0;k<=n;k++) dab(Math.round(a[0]+(b[0]-a[0])*k/n), Math.round(a[1]+(b[1]-a[1])*k/n)); };
      cv.onpointerdown = e => { if(finished) return; drawing = true; last = pos(e); cv.setPointerCapture(e.pointerId); dab(...last); paint(); };
      cv.onpointermove = e => { if(!drawing) return; const q = pos(e); lineTo(last, q); last = q; paint(); };
      cv.onpointerup = cv.onpointercancel = () => { if(!drawing) return; drawing = false; lifts++;
        const hit = pts.filter(i=>ink[i]).length; const cov = pts.length ? hit/pts.length : 1;
        if(cov >= .6 || (lifts >= 5 && cov >= .35)){ finished = true; onDone(); }
        else if(lifts >= 2 && !nudged && onMore){ nudged = true; onMore(); } };
      return {clear(){ ink.fill(0); lifts = 0; paint(); }};
    }
  };
}

/* ---- write the letter with a finger: first on its own, then as it starts a word (its
   initial form, so «مـ» for موز; letters that never join on the left keep one form) */
function writeAct(stId, idx, a){
  const L = a.letter, [word, spr] = WRITE_WORDS[L] || [];
  const joins = !'اأإآدذرزوؤة'.includes(L);
  const rounds = [{g:L}, ...(word ? [{g:joins ? L + '\u0640' : L, word, spr}] : [])];
  frame(stId, ACT_INFO.write.title(a), rounds.length);
  let r = 0; const t0 = Date.now();
  const round = () => {
    setDots(r, rounds.length); const rd = rounds[r];
    const board = traceBoard(rd.g, () => { sfx.ok(); mood('cheer'); say('traceDone');
        logAttempt({station:stId, act:'write', skill:'trace', item:L, level:r+1, errors:0, firstTry:true, ms:Date.now()-t0});
        r++; setDots(r, rounds.length);
        if(r < rounds.length) later(round, 1700); else later(() => { mood('celebrate'); say('actDone'); completeAct(stId, idx, play()); }, 1500); },
      () => { mood('help'); say('traceMore'); });
    play().innerHTML = `${TX.label(rd.word ? `حرف ${L} في أول كلمة ${rd.word}` : 'مرّر إصبعك فوق الحرف','#6b6450')}
      <div class="row center">${rd.word ? `<div class="pbtn card wordcard" aria-hidden="true">${S_(rd.spr)}${T(rd.word,{size:13, color:'#0e6b3a'})}</div>` : ''}${board.html}</div>
      ${btn({id:'clr', label:'امسح وحاول'})}`;
    const b = board.mount(); $('#clr').onclick = () => { sfx.tap(); b.clear(); };
    const intro = () => { mood('happy'); rd.word ? say('writeWord', {l:L, w:rd.word}) : say('letterTrace', {l:L}); };
    intro(); onReplay(intro);
  };
  round();
}

/* ---- counting (adaptive difficulty 1–3) */
function countAct(stId, idx, a){
  const p = P(); const sk = p.skills.count ||= {d:1};
  const RANGES = {1:[1,3], 2:[2,5], 3:[4,8]}; const ROUNDS = 3; let round = 0, last = 0;
  const q0 = {pilgrim:'count', boat:'countBoats', pearl:'countPearls'}[a.item];
  frame(stId, ACT_INFO.count.title(a), ROUNDS);
  function q(){
    setDots(round, ROUNDS); round++;
    const [lo,hi] = RANGES[sk.d]; let n = rnd(lo,hi); if(n === last) n = n < hi ? n+1 : Math.max(lo, n-1); last = n;
    const pool = shuffle([n-2,n-1,n+1,n+2].filter(x=>x>=1 && x<=9)); const opts = shuffle([n, pool[0], pool[1]]);
    play().innerHTML = `<div class="pan field ${a.item==='boat'?'sea':''}">${Array.from({length:n},(_,i)=>`<span class="it">${S_(a.item)}<span class="n"></span></span>`).join('')}</div>
      <div class="row center">${opts.map(o=>`<button class="pbtn numbtn" data-n="${o}" aria-label="${o}">${TX.digit(num(o))}</button>`).join('')}</div>`;
    const intro = () => { mood('happy'); say(q0); }; intro(); onReplay(intro);
    let err = 0, solved = false; const t0 = Date.now();
    $$('.numbtn').forEach(b => b.onclick = () => { if(solved) return;
      if(+b.dataset.n === n){ solved = true; b.classList.add('ok'); sfx.ok(); mood('cheer'); say('right');
        logAttempt({station:stId, act:'count', skill:'count', item:n, level:sk.d, errors:err, firstTry:err===0, ms:Date.now()-t0});
        if(err===0 && sk.d<3) sk.d++; else if(err>=2 && sk.d>1) sk.d--; save(); setDots(round, ROUNDS);
        if(round < ROUNDS) later(q, 1600); else later(() => { mood('celebrate'); say('actDone'); completeAct(stId, idx, play()); }, 1200);
      } else { nudge(b); err++; mood('help'); if(err === 1) say('wrong1'); else if(err === 2){ say('countTogether'); together(n); } }
    });
  }
  function together(n){ const its = $$('.it');
    its.forEach((it,i) => later(() => { it.classList.add('lit'); it.querySelector('.n').innerHTML = T(num(i+1),{size:12, color:'#0e6b3a'}); speakRaw(NUM_WORDS[i+1], true); sfx.pop();
      if(i === n-1) $$('.numbtn').forEach(b => +b.dataset.n===n && b.classList.add('glow')); }, 1400 + i*850)); }
  q();
}

/* ---- beach clean-up */
function beachAct(stId, idx){
  frame(stId, 'نظّف الشاطئ', 1);
  const pw = NARROW ? AP.w - 30 : Math.min(250, AP.w - 150), W = Math.max(160, pw), H = Math.round(W*.56);
  const junk = ['cup','can','paper','bag','bottle'];
  const spots = shuffle([[.18,.5],[.4,.55],[.62,.5],[.3,.72],[.52,.76],[.74,.7],[.86,.52]]).slice(0, junk.length);
  play().innerHTML = `<div class="beachbox" id="beach" style="width:calc(var(--u)*${W});height:calc(var(--u)*${H})">${sceneTag('beach', W, H)}
    <div class="counter" id="bc">${TX.label(`${num(0)} / ${num(junk.length)}`)}</div>
    ${junk.map((j,i)=>`<button class="junk" data-j="${i}" style="left:calc(var(--u)*${Math.round(spots[i][0]*W)-12});top:calc(var(--u)*${Math.round(spots[i][1]*H)-6})" aria-label="قطعة مهملات">${S_(j)}</button>`).join('')}
    <div class="bin-at" id="bin" style="left:calc(var(--u)*4);top:calc(var(--u)*${H-19})">${S_('bin')}</div></div>`;
  const intro = () => { mood('happy'); say('beach'); }; intro(); onReplay(intro);
  let n = 0; const t0 = Date.now();
  $$('.junk').forEach(b => b.onclick = () => {
    if(b.dataset.gone) return; b.dataset.gone = 1; n++;
    const br = $('#bin').getBoundingClientRect(), r = b.getBoundingClientRect();
    b.style.transform = `translate(${Math.round(br.left+br.width/2-(r.left+r.width/2))}px, ${Math.round(br.top+br.height/3-(r.top+r.height/2))}px)`; b.style.opacity = '0';
    sfx.pop(); speakRaw(NUM_WORDS[n]); $('#bc').innerHTML = TX.label(`${num(n)} / ${num(junk.length)}`);
    if(n === junk.length){ setDots(1,1); mood('celebrate'); later(()=>say('beachDone'), 700);
      logAttempt({station:stId, act:'beach', skill:'environment', item:junk.length, level:1, errors:0, firstTry:true, ms:Date.now()-t0});
      later(()=>completeAct(stId, idx, $('#bin')), 1500); }
  });
}

/* ---- order numbers (1–3–2–4, then 5 numbers once mastered) */
function orderAct(stId, idx){
  const p = P(); const sk = p.skills.order ||= {clean:0};
  const N = sk.clean >= 1 ? 5 : 4; const seq = N === 4 ? [1,3,2,4] : shuffle([1,2,3,4,5]);
  frame(stId, 'رتب الأرقام', 1);
  play().innerHTML = `${TX.label('ضع الأرقام في مكانها بالترتيب','#6b6450')}<div class="slots">${Array.from({length:N},(_,i)=>`<div class="slot" data-s="${i+1}"></div>`).join('')}</div>
    <div class="row center">${seq.map(v=>`<button class="pbtn numbtn" data-n="${v}" aria-label="${v}">${TX.digit(num(v))}</button>`).join('')}</div>`;
  const intro = () => { mood('happy'); say('order'); }; intro(); onReplay(intro);
  let expect = 1, err = 0; const t0 = Date.now();
  $$('.numbtn').forEach(b => b.onclick = () => {
    const v = +b.dataset.n;
    if(v === expect){ const s = $(`.slot[data-s="${v}"]`); s.innerHTML = TX.digit(num(v), '#0e6b3a'); s.classList.add('full'); b.classList.add('gone'); b.classList.remove('glow'); sfx.ok(); speakRaw(NUM_WORDS[v]); expect++;
      if(expect > N){ mood('celebrate'); say('orderDone'); setDots(1,1); sk.clean = err<=1 ? sk.clean+1 : 0; save();
        logAttempt({station:stId, act:'order', skill:'order', item:N, level:N===4?1:2, errors:err, firstTry:err===0, ms:Date.now()-t0});
        later(()=>completeAct(stId, idx, $('.slots')), 1300); }
    } else { nudge(b); err++; mood('help');
      if(err % 2 === 0){ say('wrong2'); say('whereNum', {n:NUM_WORDS[expect]}, {queue:true, append:true}); $$('.numbtn').forEach(x=>+x.dataset.n===expect && x.classList.add('glow')); } else say('wrong1'); }
  });
}

/* ---- path to 5 */
function pathAct(stId, idx){
  const TARGET = 5, COLS = 4, ROWS = 3; let path;
  for(let tries=0; tries<300 && !path; tries++){
    const start = rnd(0, COLS*ROWS-1); const pth = [start];
    while(pth.length < TARGET){ const c = pth[pth.length-1], x = c%COLS, y = Math.floor(c/COLS);
      const nb = shuffle([[x+1,y],[x-1,y],[x,y+1],[x,y-1]].filter(([a,b])=>a>=0&&a<COLS&&b>=0&&b<ROWS).map(([a,b])=>b*COLS+a).filter(k=>!pth.includes(k)));
      if(!nb.length) break; pth.push(nb[0]); }
    if(pth.length === TARGET) path = pth;
  }
  const cells = Array(COLS*ROWS).fill(0); path.forEach((c,i)=>cells[c] = i+1);
  const extras = shuffle([6,7,8,9,6,7,8,9]); cells.forEach((v,i)=>{ if(!v) cells[i] = extras.pop(); });
  frame(stId, 'الطريق إلى الرقم ٥', 1);
  play().innerHTML = `<div class="board" id="board">${cells.map((v,i)=>`<button class="pbtn cell" data-c="${i}" aria-label="${v}">${TX.digit(num(v), v===TARGET?'#c98a1a':'#1b1e2b')}</button>`).join('')}
    <div class="token" id="tok">${S_('mini')}</div></div>`;
  const intro = () => { mood('happy'); say('path'); }; intro(); onReplay(intro);
  const tok = $('#tok');
  const place = el => { if(!el){ tok.style.left = `calc(100% - var(--u)*16)`; tok.style.top = '0px'; return; }
    tok.style.left = (el.offsetLeft + el.offsetWidth/2 - 7*SC)+'px'; tok.style.top = (el.offsetTop - 15*SC)+'px'; };
  place(null);
  let expect = 1, err = 0; const t0 = Date.now();
  $$('.cell').forEach(b => b.onclick = () => {
    const i = +b.dataset.c;
    if(path[expect-1] === i){ b.classList.add('ok'); b.classList.remove('glow'); place(b); sfx.step(); speakRaw(NUM_WORDS[expect]); expect++;
      if(expect > TARGET){ mood('celebrate'); say('pathDone'); setDots(1,1);
        logAttempt({station:stId, act:'path', skill:'order', item:TARGET, level:1, errors:err, firstTry:err===0, ms:Date.now()-t0});
        later(()=>completeAct(stId, idx, b), 1500); }
    } else if(!b.classList.contains('ok')){ nudge(b); err++; mood('help');
      if(err % 2 === 0){ say('wrong2'); say('whereNum', {n:NUM_WORDS[expect]}, {queue:true, append:true}); $(`.cell[data-c="${path[expect-1]}"]`).classList.add('glow'); } else say('wrong1'); }
  });
}

/* ---- pairing (letter ↔ picture) used in Madinah and the Eastern Province */
function pairGame(stId, idx, {title, left, right, voice, okLine, logSkill}){
  frame(stId, title, 1);
  const Ls = shuffle(left.map((x,i)=>({...x, k:i}))), Rs = shuffle(right.map((x,i)=>({...x, k:i})));
  play().innerHTML = `${TX.label('اضغط على واحد من كل جهة','#6b6450')}<div class="pairs"><div class="colp">${Ls.map(x=>`<div data-side="L" data-k="${x.k}">${x.html}</div>`).join('')}</div>
    <div class="colp">${Rs.map(x=>`<div data-side="R" data-k="${x.k}">${x.html}</div>`).join('')}</div></div>`;
  const intro = () => { mood('happy'); say(voice); }; intro(); onReplay(intro);
  let sel = null, matched = 0, err = 0; const t0 = Date.now();
  $$('[data-side] > button').forEach(b => b.onclick = () => {
    const box = b.parentElement; const side = box.dataset.side, k = +box.dataset.k;
    if(b.dataset.done) return;
    if(!sel || sel.side === side){ $$('.pick').forEach(x=>x.classList.remove('pick')); sel = {side, k, b}; b.classList.add('pick'); sfx.tap(); return; }
    if(sel.k === k){ [sel.b, b].forEach(x => { x.classList.remove('pick','glow'); x.classList.add('m'+(matched%3)); x.dataset.done = 1; });
      sfx.ok(); speakRaw(okLine(left[k], right[k])); matched++; sel = null;
      if(matched === left.length){ mood('celebrate'); say('right', {}, {queue:true}); setDots(1,1);
        logAttempt({station:stId, act:'pairs', skill:logSkill, item:left.map(x=>x.id).join(''), level:1, errors:err, firstTry:err===0, ms:Date.now()-t0});
        later(()=>completeAct(stId, idx, play()), 1600); }
    } else { nudge(b); err++; mood('help'); say(err>=2?'wrong2':'wrong1'); sel.b.classList.remove('pick');
      if(err >= 2){ const other = $(`[data-side="${side==='L'?'R':'L'}"][data-k="${sel.k}"] > button`); if(other) other.classList.add('glow'); sel.b.classList.add('pick'); return; }
      sel = null; }
  });
}
function pairsAct(stId, idx, a){
  pairGame(stId, idx, {title:ACT_INFO.pairs.title(a), voice:'pairs', logSkill:'match',
    left:a.pairs.map(([l])=>({id:l, html:letterTile(l)})), right:a.pairs.map(([,w])=>({id:w, html:`<button class="pbtn card" aria-label="${w}">${S_(WORDS[w])}${T(w,{size:12,color:'#0e6b3a'})}</button>`})),
    okLine:(l,r)=>`${l.id}… ${r.id}`});
}
function numQtyAct(stId, idx){
  const ns = shuffle([2,3,5]);
  const group = n => `<button class="pbtn card" aria-label="${n}"><span class="row center" style="max-width:calc(var(--u)*30);gap:var(--u)">${Array.from({length:n},()=>S_('date1')).join('')}</span></button>`;
  pairGame(stId, idx, {title:'الرقم والكمية', voice:'numQty', logSkill:'quantity',
    left:ns.map(n=>({id:n, html:`<button class="pbtn numbtn" aria-label="${n}">${TX.digit(num(n))}</button>`})), right:ns.map(n=>({id:n, html:group(n)})),
    okLine:(l)=>line('numQtyOk',{q:DATE_COUNT[l.id]})});
}

/* ---- AlUla: big/small, tall/short */
function rockRows(w,h){ const rows = []; for(let y=0;y<h;y++){ let r = ''; for(let x=0;x<w;x++){ const nx = (x-(w-1)/2)/(w/2), ny = (y-(h-1))/h; r += (nx*nx+ny*ny <= 1) ? 'o' : '.'; } rows.push(r); } return rows; }
function palmRows(t){ const pr = SPR.palm; const rows = pr.slice(0,9); for(let i=0;i<t;i++) rows.push(pr[9 + (i%4)]); return rows.concat(pr.slice(15)); }
function dyn(key, rows){ if(!SPR[key]) SPR[key] = rows; return S_(key); }
function sizeAct(stId, idx){
  const rounds = shuffle(['bigger','smaller','taller','shorter']); let r = 0, errTotal = 0;
  frame(stId, 'كبير وصغير', rounds.length);
  function q(){
    setDots(r, rounds.length); const kind = rounds[r]; r++;
    const rocky = kind==='bigger' || kind==='smaller';
    const items = rocky ? [[10,6],[18,10],[28,16]].map(([w,h],i)=>({i, html:dyn(`rock${w}`, rockRows(w,h))})) : [1,9,20].map((t,i)=>({i, html:dyn(`palm${t}`, palmRows(t))}));
    const want = (kind==='bigger' || kind==='taller') ? 2 : 0;
    const order = shuffle(items);
    play().innerHTML = `<div class="row center" style="align-items:flex-end">${order.map(o=>`<button class="pbtn card" data-i="${o.i}" style="justify-content:flex-end">${o.html}</button>`).join('')}</div>`;
    const intro = () => { mood('happy'); say(kind); }; intro(); onReplay(intro);
    let err = 0, solved = false; const t0 = Date.now();
    $$('.card').forEach(b => b.onclick = () => { if(solved) return;
      if(+b.dataset.i === want){ solved = true; b.classList.add('ok'); sfx.ok(); mood('cheer'); say('right');
        logAttempt({station:stId, act:'size', skill:'visual', item:kind, level:1, errors:err, firstTry:err===0, ms:Date.now()-t0});
        if(r < rounds.length) later(q, 1400); else { setDots(r, rounds.length); later(()=>{ mood('celebrate'); say('actDone'); completeAct(stId, idx, play()); }, 1100); } }
      else { nudge(b); err++; errTotal++; mood('help'); say(err>=2?'wrong2':'wrong1'); if(err>=2) $$('.card').forEach(x=>+x.dataset.i===want && x.classList.add('glow')); }
    });
  }
  q();
}

/* ---- AlUla: shapes · Abha: classify (one item at a time into three homes) */
function shapeRows(kind, s, c){ const rows = []; for(let y=0;y<s;y++){ let r = ''; for(let x=0;x<s;x++){ let on;
  if(kind==='circle'){ const dx = x-(s-1)/2, dy = y-(s-1)/2; on = dx*dx+dy*dy <= (s/2)*(s/2)+.5; }
  else if(kind==='square') on = true; else { const half = (y+1)/s*(s/2); on = Math.abs(x-(s-1)/2) <= half; }
  r += on ? c : '.'; } rows.push(r); } return rows; }
function sortGame(stId, idx, {title, voice, bins, items, logSkill, itemVoice}){
  frame(stId, title, items.length); let k = 0; const t0 = Date.now(); let errTotal = 0;
  play().innerHTML = `<div class="pan stagepan" id="stageItem"></div><div class="bins">${bins.map(b=>`<button class="pbtn binbtn" data-b="${b.id}" aria-label="${b.name}">${b.icon}${TX.label(b.name)}</button>`).join('')}</div>`;
  const intro = () => { mood('happy'); say(voice); }; intro(); onReplay(intro);
  let err = 0, busy = false;
  const showItem = () => { setDots(k, items.length); const it = items[k]; $('#stageItem').innerHTML = it.html; err = 0; busy = false; $$('.binbtn').forEach(b=>b.classList.remove('glow')); if(k>0 && itemVoice) speakRaw(itemVoice(it)); };
  $$('.binbtn').forEach(b => b.onclick = () => { if(busy) return; const it = items[k];
    if(b.dataset.b === it.bin){ busy = true; sfx.ok(); mood('cheer'); say('right');
      logAttempt({station:stId, act:'sort', skill:logSkill, item:it.bin, level:1, errors:err, firstTry:err===0, ms:Date.now()-t0});
      k++; if(k < items.length) later(showItem, 1000); else { setDots(k, items.length); later(()=>{ mood('celebrate'); say('actDone'); completeAct(stId, idx, play()); }, 1000); } }
    else { nudge(b); err++; errTotal++; mood('help'); say(err>=2?'wrong2':'wrong1'); if(err>=2) $(`.binbtn[data-b="${it.bin}"]`).classList.add('glow'); }
  });
  showItem();
}
function shapesAct(stId, idx){
  const kinds = ['circle','square','triangle'], cols = ['r','b','y','l','v','o'];
  const items = shuffle([...kinds, ...shuffle(kinds)]).map((kind,i)=>{ const s = pick([12,16,20]), c = pick(cols); return {bin:kind, html:dyn(`sh_${kind}_${s}_${c}`, shapeRows(kind, s, c))}; });
  sortGame(stId, idx, {title:'تصنيف الأشكال', voice:'shapes', logSkill:'visual',
    bins:kinds.map(k=>({id:k, name:VOICE['shape_'+k], icon:dyn(`sh_${k}_10_e`, shapeRows(k,10,'e'))})), items, itemVoice:it=>VOICE['shape_'+it.bin]});
}
function classifyAct(stId, idx){
  const pool = CLASSIFY_POOL;
  const items = shuffle([...Object.entries(pool).map(([bin,arr])=>{ const [s,w] = pick(arr); return {bin,s,w}; }),
    ...shuffle(Object.entries(pool).flatMap(([bin,arr])=>arr.map(([s,w])=>({bin,s,w})))).slice(0,3)]).slice(0,6)
    .map(o=>({bin:o.bin, w:o.w, html:`<div class="col">${S_(o.s)}${TX.label(o.w,'#0e6b3a')}</div>`}));
  sortGame(stId, idx, {title:'نبات، جبل، بحر', voice:'classify', logSkill:'classify',
    bins:[{id:'plant', name:'نبات', icon:S_('seedling')},{id:'mountain', name:'جبل', icon:S_('mountain')},{id:'sea', name:'بحر', icon:S_('wave')}], items, itemVoice:it=>it.w});
}

/* ---- letter hunt (AlUla ع, Abha أ) */
function huntAct(stId, idx, a){
  const L = a.letter; const tiles = shuffle([L,L,L,L, ...shuffle(a.others).concat(shuffle(a.others)).slice(0,8)]);
  frame(stId, `أين حرف ${L}؟`, 1);
  play().innerHTML = `<div class="row center"><button class="pbtn ltile" id="lsnd" aria-label="استمع إلى الحرف">${TX.letter(L)}</button>${TX.label(`${num(4)} حروف مخبأة في الصخور`,'#6b6450')}</div>
    <div class="cards" style="--cols:${NARROW?4:6}">${tiles.map((t,i)=>letterTile(t,'',`data-i="${i}" data-t="${t}"`)).join('')}</div>`;
  const snd = L + 'َ';
  const intro = () => { mood('happy'); say('hunt', {l:L}); }; intro(); onReplay(intro); $('#lsnd').onclick = () => speakRaw(snd);
  let found = 0, err = 0; const t0 = Date.now();
  $$('.tile').forEach(b => b.onclick = () => { if(b.classList.contains('ok')) return;
    if(b.dataset.t === L){ b.classList.add('ok'); b.classList.remove('glow'); sfx.ok(); found++; if(found < 4) speakRaw(NUM_WORDS[found]);
      if(found === 4){ mood('celebrate'); say('right'); setDots(1,1);
        logAttempt({station:stId, act:'hunt', skill:'find', item:L, level:1, errors:err, firstTry:err<=1, ms:Date.now()-t0});
        const sk = P().skills['l_'+L] ||= {runs:0, clean:0, lastSupport:false}; sk.runs++; sk.lastSupport = err>=2; sk.clean = err<=1 ? sk.clean+1 : 0; save();
        later(()=>completeAct(stId, idx, play()), 1500); } }
    else { nudge(b); err++; mood('help'); if(err>=2){ say('wrong2'); speakRaw(snd, true); $$('.tile').forEach(x=>x.dataset.t===L && !x.classList.contains('ok') && x.classList.add('glow')); } else say('wrong1'); }
  });
}

/* ---- national missions */
function visionGot(key){ const p = P(); return MISSIONS.filter(m=>m.badge===key).every(m=>p.missions[m.id]); }
function missionsHub(){
  const p = P();
  show(`<section class="screen">${hud('missions')}
    <div class="row"><div id="bw">${B_('happy')}</div>${bubble(NARROW?120:200)}</div>
    <div class="mgrid">${MISSIONS.map((m,i)=>`<button class="pbtn mcard ${p.missions[m.id]?'done':''}" data-m="${i}" aria-label="${m.title}">${S_(m.icon)}${TX.label(m.title)}${p.missions[m.id]?`<span class="mstar">${S_('i_star')}</span>`:''}</button>`).join('')}</div>
    ${TX.label('شارات رؤية السعودية ٢٠٣٠','#0e6b3a')}
    <div class="vgrid">${Object.entries(VISION).map(([k,v])=>`<div class="pan vb ${visionGot(k)?'got':''}"><span class="medal">${genTag('vb:'+k+':'+visionGot(k), ()=>badgeCanvas(v.icon, visionGot(k)))}</span><div class="col" style="align-items:flex-start">${TX.label(v.name)}${T(v.desc,{size:11, color:'#6b6450', maxW:NARROW ? AP.w - 90 : Math.floor((AP.w - 30)/3) - 50})}</div></div>`).join('')}</div>
  </section>`, {fn:missionsHub, safe:true});
  say('missions');
  $$('.mcard').forEach(b => b.onclick = () => { sfx.tap(); missionPlay(+b.dataset.m); });
}
function missionPlay(i){
  const m = MISSIONS[i]; const p = P();
  const opts = shuffle([{...m.right, ok:1}, {...m.wrong, ok:0}]);
  frame('missions', m.title, 1);
  const art = o => o.art.map((x,j) => S_(x, (o.low && j>0) ? 'low' : '')).join('');
  const playW = NARROW ? AP.w - 30 : Math.min(AP.w - 136, 260), cw = NARROW ? playW - 14 : Math.floor((playW - 5)/2) - 14;
  play().innerHTML = `${T(m.q,{size:15, color:'#0e6b3a', maxW:Math.min(220, playW - 10)})}<div class="choices">${opts.map((o,k)=>`<button class="pbtn choice" data-k="${k}"><div class="art">${art(o)}</div>${T(o.cap,{size:13, color:'#1b1e2b', maxW:cw})}</button>`).join('')}</div>`;
  const intro = () => { mood('happy'); setBubble(m.q); speakRaw(m.q); speakRaw(opts[0].cap+'؟', true); speakRaw(VOICE.or, true); speakRaw(opts[1].cap+'؟', true); };
  intro(); onReplay(intro);
  let err = 0, solved = false; const t0 = Date.now();
  $$('.choice').forEach(b => b.onclick = () => { if(solved) return; const o = opts[+b.dataset.k];
    if(o.ok){ solved = true; b.classList.add('ok'); sfx.win(); mood('celebrate'); setBubble(m.why); speakRaw(m.why); setDots(1,1);
      const had = visionGot(m.badge); const first = !p.missions[m.id]; p.missions[m.id] = Date.now(); if(first) p.stars++; save(); popStar(b); refreshStars();
      logAttempt({station:'missions', act:'mission', skill:'behavior', item:m.id, level:1, errors:err, firstTry:err===0, ms:Date.now()-t0});
      later(() => { if(!had && visionGot(m.badge)){ const v = VISION[m.badge]; confetti();
          modal(`${B_('celebrate')}${genTag('vb:'+m.badge+':true', ()=>badgeCanvas(v.icon, true))}${TX.title('شارة '+v.name)}${TX.small(v.desc)}${btn({id:'vok', cls:'green big', label:'رائع!'})}`);
          say('badgeGot', {name:v.name}); $('#vok').onclick = () => missionsHub(); }
        else missionsHub(); }, 2800);
    } else { nudge(b); err++; mood('help'); say(err>=2?'wrong2':'wrong1'); if(err>=2) $$('.choice').forEach((x,k)=>opts[k].ok && x.classList.add('glow')); }
  });
}

/* ---- badges */
function badgesScreen(){
  const p = P(); const earned = earnedSet(p);
  const mw = NARROW ? Math.min(AP.w-30, 180) : 170, mh = Math.round(mw*.8);
  const mk = `mapb:${mw}:${[...earned].sort().join(',')}`;
  const mapArt = cacheCanvas(mk, () => mapCanvas(mw, mh, STATIONS, earned).canvas);
  show(`<section class="screen">${hud('badges')}
    <div class="row"><div id="bw">${B_('medal')}</div>${bubble(NARROW?120:180)}</div>
    <div class="pan col">${TX.title('شارات المناطق')}
      <div class="bgrid">${STATIONS.map(s=>`<div class="col">${genTag('badge:'+s.icon+':'+(earned.has(s.id)?1:0), ()=>badgeCanvas(s.icon, earned.has(s.id)))}${TX.small(s.short, earned.has(s.id)?'#0e6b3a':'#6b6450')}</div>`).join('')}</div></div>
    <div class="two">
      <div class="pan col">${TX.title('خريطة المملكة')}${TX.small(`${num(earned.size)} من ${num(8)} قطع`)}<div class="mapbox">${imgTag(mapArt)}</div></div>
      <div class="pan col">${TX.title('شارات رؤية ٢٠٣٠')}
        ${Object.entries(VISION).map(([k,v])=>`<div class="vb ${visionGot(k)?'got':''}"><span class="medal">${genTag('vb:'+k+':'+visionGot(k), ()=>badgeCanvas(v.icon, visionGot(k)))}</span>${TX.label(v.name)}</div>`).join('')}
        <div class="vb ${p.medal?'got':''}"><span class="medal">${S_('i_medal')}</span>${TX.label(p.medal?'وسام برعم الوطن':'أكمل المحطات الثماني')}</div>
        ${p.medal ? btn({id:'seeMedal', cls:'gold', label:'اعرض الوسام'}) : ''}</div>
    </div></section>`, {fn:badgesScreen, safe:true});
  say('badges');
  if(p.medal) $('#seeMedal').onclick = () => medalScreen();
}

/* ---- passport */
function passportScreen(){
  const p = P(); const earned = earnedSet(p);
  const d = t => { const x = new Date(t); return num(x.getDate()) + '/' + num(x.getMonth()+1); };
  show(`<section class="screen">${hud('passport')}
    <div class="passport">
      <div class="pp-cover">${B_('happy')}${T('جواز سفر برعم',{size:18, color:'#f7e3a0', shadow:'#0a4a2a'})}
        <div class="pan row" style="padding:calc(var(--u)*2) calc(var(--u)*4)">${S_(face(p.avatar))}${TX.label(p.name)}</div>
        ${T('مستكشف وطننا',{size:11, color:'#f7e3a0'})}<span class="row" style="gap:var(--u)">${S_('i_star')}${T(num(p.stars),{size:13, color:'#f7e3a0'})}</span></div>
      <div class="pp-page">${TX.title('أختام الرحلة')}
        <div class="stamps">${STATIONS.map(s=>{ const got = earned.has(s.id);
          return `<div class="stamp">${genTag('stamp:'+s.icon+':'+(got?1:0), ()=>stampCanvas(s.icon, got))}${TX.small(s.short, got?'#0e6b3a':'#a89f86')}${got?TX.small(d(p.st[s.id].done)):''}</div>`; }).join('')}</div></div>
    </div><div id="bubble" hidden data-w="100"></div></section>`, {fn:passportScreen, safe:true});
  say('passport');
}

/* ---- medal */
function medalScreen(){
  const p = P(); if(!p.medal){ p.medal = Date.now(); save(); }
  show(`<section class="screen medal-screen">
    ${T('أحسنت يا بطل!',{size:NARROW?24:30, color:'#f7c948', outline:'#1b1e2b', shadow:'#0a4a2a'})}
    ${T('أنت الآن برعم من براعم وطن طموح',{size:NARROW?13:16, color:'#0e6b3a', maxW:AP.w-30})}
    <div class="row center" style="align-items:flex-end">${B_('medal')}${genTag('medal', medalCanvas)}${S_(p.avatar)}</div>
    <div class="pan row center">${S_('i_medal')}${TX.label('وسام برعم الوطن')}${TX.label(p.name,'#0e6b3a')}${S_('i_star')}${TX.label(num(p.stars))}</div>
    <div class="row center">${btn({cls:'green big', label:'الخريطة', icon:'i_map', attrs:'data-nav="map"'})}${btn({cls:'big', label:'جوازي', icon:'i_book', attrs:'data-nav="passport"'})}</div>
    ${TX.small(CREDIT, '#4a2e1c')}
    <div id="bubble" hidden data-w="100"></div>
  </section>`, {fn:medalScreen, safe:true});
  confetti(90); sfx.win(); say('medal');
}

/* ---------------------------------------------------------------- boot */
function boot(){
  SPR.boyface = SPR.boy.slice(1,17); SPR.girlface = SPR.girl.slice(0,16);
  const root = document.documentElement.style;
  root.setProperty('--tx-sand', `url(${textureURL('sand').url})`); root.setProperty('--tx-paper', `url(${textureURL('paper').url})`);
  root.setProperty('--tx-sadu', `url(${textureURL('sadu').url})`); root.setProperty('--tx-dash', `url(${textureURL('dash').url})`);
  fit();
  const h = location.hash.replace('#','');
  if(h === 'teacher') teacher(); else if(h === 'parent') parentGate(); else splash();
}
const fontsReady = document.fonts && document.fonts.load ? Promise.race([Promise.all([document.fonts.load('800 14px "Baloo Bhaijaan 2"', 'بطل'), document.fonts.load('800 14px "Baloo Bhaijaan 2"', 'Ab1'), document.fonts.load('700 20px Amiri', SHAHADA), FLAG_SA.decode ? FLAG_SA.decode().catch(()=>{}) : null]), new Promise(r=>setTimeout(r,2500))]) : Promise.resolve();
fontsReady.then(boot, boot);
