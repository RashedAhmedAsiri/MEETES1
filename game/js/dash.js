/* =========================================================================
   dash.js — adult screens: the teacher dashboard (its own login, class
   overview, child file, individual / group / skills reports, settings) and
   the parent page behind an adult question. Same pixel grid as the game,
   shown at a denser whole-number zoom so tables fit (see dense() in game.js).
   Everything is read from this device's storage; nothing is sent anywhere.
   ========================================================================= */
'use strict';

/* ---------------------------------------------------------------- extra icons */
Object.assign(SPR, {
i_retry:[
"......o.....",
"...ooooo....",
"..ooooooo...",
".ooo..oo....",
".oo...o...o.",
".oo......oo.",
".oo......oo.",
".oo......oo.",
".ooo....ooo.",
"..oooooooo..",
"...oooooo..."],
i_dot:[
".eeee.",
"eeeeee",
"eeeeee",
"eeeeee",
"eeeeee",
".eeee."],
i_kids:[
".hhh...hhh..",
"hnnnh.hnnnhh",
"hnnnh.hnnnhh",
".nnn...nnn..",
"..n.....n...",
".ggg...ppp..",
"ggggg.ppppp.",
"ggggg.ppppp.",
"ggggg.ppppp."],
i_chart:[
"........yyy",
"........yyy",
"....bbb.yyy",
"....bbb.yyy",
"ggg.bbb.yyy",
"ggg.bbb.yyy",
"ggg.bbb.yyy",
"kkkkkkkkkkk"],
i_gear:[
"....eee....",
".ee.eee.ee.",
".eeeeeeeee.",
"..eee.eee..",
"eeee...eeee",
"eee.....eee",
"eeee...eeee",
"..eee.eee..",
".eeeeeeeee.",
".ee.eee.ee.",
"....eee...."],
i_door:[
"dddddddd",
"daaaaaad",
"daaaaaad",
"daaaaaad",
"daaaaaad",
"daaaayad",
"daaaaaad",
"daaaaaad",
"daaaaaad",
"dddddddd"],
i_idea:[
"..yyyyy..",
".yyyyyyy.",
"yyWWyyyyy",
"yyWyyyyyy",
"yyyyyyyyy",
".yyyyyyy.",
"..yyyyy..",
"...eee...",
"...eee...",
"....e...."],
});

/* ---------------------------------------------------------------- text + words */
/* text never grows wider than the page; long lines wrap on the pixel grid */
const D = {
  h:(t,c='#0e6b3a',maxW=0) => T(t,{size:16, color:c, shadow:'#d9c89c', maxW:Math.min(maxW || 9999, pageW() - 24)}),
  t:(t,c='#1b1e2b',maxW=0) => T(t,{size:12, color:c, maxW:Math.min(maxW || 9999, pageW() - 24)}),
  s:(t,c='#6b6450',maxW=0) => T(t,{size:11, color:c, maxW:Math.min(maxW || 9999, pageW() - 24)}),
  big:(t,c='#0e6b3a') => T(t,{size:24, color:c, shadow:'#d9c89c'}),
  w:(t) => T(t,{size:12, color:'#ffffff', shadow:'#0a4a2a'}),
};
const DAY = 864e5;
/* Arabic counted nouns: 1, 2, 3–10, 11+ */
function counted(n, one, two, few, many){ if(n === 1) return one; if(n === 2) return two; return `${num(n)} ${n <= 10 ? few : many}`; }
const kidsN = n => n === 0 ? 'لا أحد' : counted(n, 'طفل واحد', 'طفلان', 'أطفال', 'طفلًا');
const needVerb = n => n === 1 ? 'يحتاج' : n === 2 ? 'يحتاجان' : 'يحتاجون';
const pct = x => num(Math.round(x*100)) + (ST.settings.digits === 'arab' ? '٪' : '%');
const secs = ms => counted(Math.max(1, Math.round(ms/1000)), 'ثانية', 'ثانيتان', 'ثوانٍ', 'ثانية');
function ago(t){
  if(!t) return 'لم يلعب بعد';
  const m = Math.floor((Date.now()-t)/6e4); if(m < 1) return 'الآن';
  if(m < 60) return 'منذ ' + counted(m, 'دقيقة', 'دقيقتين', 'دقائق', 'دقيقة');
  const h = Math.floor(m/60); if(h < 24) return 'منذ ' + counted(h, 'ساعة', 'ساعتين', 'ساعات', 'ساعة');
  const d = Math.floor(h/24); if(d === 1) return 'أمس'; return 'منذ ' + counted(d, 'يوم', 'يومين', 'أيام', 'يومًا');
}
const icon = st => S_(st === 'star' ? 'i_star' : st === 'retry' ? 'i_retry' : 'i_dot', '', st === 'star' ? 'متقن' : st === 'retry' ? 'يحتاج تدريبًا' : 'لم يبدأ');
const legend = () => `<div class="legend"><span>${icon('star')}${D.s('متقن')}</span><span>${icon('retry')}${D.s('يحتاج تدريبًا')}</span><span>${icon('none')}${D.s('لم يبدأ بعد')}</span></div>`;
const she = (a, m, f) => a.p.avatar === 'girl' ? f : m;
const harf = L => 'حرف\u00a0' + L;   // no line break between «حرف» and its letter

/* ---------------------------------------------------------------- sample class
   Eleven sample children so the dashboard can be judged before a class plays.
   They are simulated through the same log format the game writes, so every
   report below reads real and sample children with one code path. */
const SAMPLE_DEFS = [
  // name, avatar, symbol, stations done, activities into the next one, first-try chance, weak spots
  ['أحمد','boy','camel',4,1,.8,['م']],
  ['سارة','girl','rose',6,1,.9,[]],
  ['فيصل','boy','boat',2,1,.6,['م','count']],
  ['نورة','girl','star',8,0,.95,[]],
  ['عبدالله','boy','palm',3,0,.72,['م']],
  ['ريم','girl','moon',5,2,.85,['ع']],
  ['خالد','boy','crown',1,1,.55,['م']],
  ['لمى','girl','fish',5,0,.75,['م','visual']],
  ['يوسف','boy','star',7,1,.9,['أ']],
  ['جود','girl','palm',2,0,.65,['م']],
  ['تركي','boy','fish',3,2,.8,['ج','order']],
];
function simKid([name, avatar, symbol, nDone, extra, ab, weak], i){
  const R = rng(4242 + i*977), now = Date.now();
  const p = {id:'s'+i, name, avatar, symbol, sample:true, stars:0, st:{}, missions:{}, skills:{}, log:[], medal:null};
  const plan = [];
  STATIONS.forEach((s,si) => s.acts.forEach((a,ai) => { if(si < nDone || (si === nDone && ai < extra)) plan.push([s,si,ai,a]); }));
  const endAgo = [.03, .15, .4, 1.2, 2.6][i % 5]*DAY + R()*2*36e5, span = (1.5 + plan.length*.45)*DAY;
  const start = now - endAgo - span, gap = span/Math.max(1, plan.length);
  let t = start;
  const add = o => { t += (12 + R()*35)*1000; p.log.push({level:1, ms:Math.round((6 + R()*28)*1000*(o.errors ? 1.6 : 1)), ...o, t}); };
  const e01 = () => R() < ab ? 0 : 1;
  const RANGES = {1:[1,3], 2:[2,5], 3:[4,8]};
  plan.forEach(([s,si,ai,a], k) => {
    t = Math.max(t, start + k*gap); const sid = s.id;
    if(a.type === 'letter'){ const L = a.letter;
      if(weak.includes(L)){
        add({station:sid, act:'letter', skill:'find', item:L, errors:2, firstTry:false});
        const h = R() < .5 ? 1 : 0, m = R() < .4 ? 1 : 0, f = R() < .5 ? 1 : 0;
        add({station:sid, act:'letter', skill:'hear', item:L, level:2, errors:h, firstTry:!h});
        add({station:sid, act:'letter', skill:'match', item:L, level:3, errors:m, firstTry:!m});
        add({station:sid, act:'letter', skill:'trace', item:L, level:4, errors:0, firstTry:true});
        add({station:sid, act:'letter', skill:'find', item:L, errors:f, firstTry:true});
        add({station:sid, act:'letter', skill:'run', item:L, errors:2+h+m+f, firstTry:false, support:true, ms:undefined});
        p.skills['l_'+L] = {runs:1, clean:0, lastSupport:true};
      } else { const e = e01();
        add({station:sid, act:'letter', skill:'find', item:L, errors:e, firstTry:true});
        add({station:sid, act:'letter', skill:'run', item:L, errors:e, firstTry:true, support:false, ms:undefined});
        p.skills['l_'+L] = {runs:1, clean:1, lastSupport:false}; }
    } else if(a.type === 'count'){ const sk = p.skills.count ||= {d:1}, w = weak.includes('count');
      for(let r=0;r<3;r++){ const [lo,hi] = RANGES[sk.d]; const n = lo + Math.floor(R()*(hi-lo+1));
        const e = w ? (R() < .65 ? 1 + (R() < .5 ? 1 : 0) : 0) : e01();
        add({station:sid, act:'count', skill:'count', item:n, level:sk.d, errors:e, firstTry:!e});
        if(!e && sk.d < 3) sk.d++; else if(e >= 2 && sk.d > 1) sk.d--; }
    } else if(a.type === 'beach') add({station:sid, act:'beach', skill:'environment', item:5, errors:0, firstTry:true});
    else if(a.type === 'order'){ const e = weak.includes('order') ? 2 : e01(); const sk = p.skills.order ||= {clean:0};
      add({station:sid, act:'order', skill:'order', item:4, errors:e, firstTry:!e}); sk.clean = e <= 1 ? sk.clean+1 : 0; }
    else if(a.type === 'path'){ const e = weak.includes('order') ? 1 + (R() < .5 ? 1 : 0) : e01(); add({station:sid, act:'path', skill:'order', item:5, errors:e, firstTry:!e}); }
    else if(a.type === 'pairs'){ const Ls = a.pairs.map(x=>x[0]).join(''); const e = ([...Ls].some(L=>weak.includes(L)) && R() < .5) ? 1 + (R() < .5 ? 1 : 0) : e01();
      add({station:sid, act:'pairs', skill:'match', item:Ls, errors:e, firstTry:!e}); }
    else if(a.type === 'numqty'){ const e = weak.includes('count') ? 1 : e01(); add({station:sid, act:'pairs', skill:'quantity', item:'235', errors:e, firstTry:!e}); }
    else if(a.type === 'size'){ const w = weak.includes('visual');
      for(const q of ['bigger','smaller','taller','shorter']){ const e = w ? (R() < .6 ? 1 + (R() < .4 ? 1 : 0) : 0) : (R() < ab ? 0 : (R() < .5 ? 1 : 0)); add({station:sid, act:'size', skill:'visual', item:q, errors:e, firstTry:!e}); } }
    else if(a.type === 'shapes'){ const w = weak.includes('visual');
      for(const q of ['circle','square','triangle','circle','triangle','square']){ const e = w ? (R() < .5 ? 1 : 0) : (R() < ab ? 0 : (R() < .4 ? 1 : 0)); add({station:sid, act:'sort', skill:'visual', item:q, errors:e, firstTry:!e}); } }
    else if(a.type === 'classify'){ for(const q of ['plant','sea','mountain','sea','plant','mountain']){ const e = R() < ab ? 0 : (R() < .5 ? 1 : 0); add({station:sid, act:'sort', skill:'classify', item:q, errors:e, firstTry:!e}); } }
    else if(a.type === 'write') add({station:sid, act:'write', skill:'trace', item:a.letter, level:1, errors:0, firstTry:true});
    else if(a.type === 'hunt'){ const L = a.letter; const e = weak.includes(L) ? 2 + (R() < .5 ? 1 : 0) : e01();
      add({station:sid, act:'hunt', skill:'find', item:L, errors:e, firstTry:e <= 1}); p.skills['l_'+L] = {runs:1, clean:e <= 1 ? 1 : 0, lastSupport:e >= 2}; }
    const rec = p.st[sid] ||= {acts:{}, done:null}; rec.acts[ai] = true; p.stars++;
    if(Object.keys(rec.acts).length === s.acts.length){ rec.done = t;
      const m = si % 2 === 1 && MISSIONS[(si-1)/2];
      if(m){ const e = e01(); add({station:'missions', act:'mission', skill:'behavior', item:m.id, errors:e, firstTry:!e}); p.missions[m.id] = t; p.stars++; } }
  });
  if(nDone === 8) p.medal = t;
  p.created = start; p.at = t; return p;
}
let SAMPLE = null;
const samples = () => SAMPLE ||= SAMPLE_DEFS.map(simKid);
const deviceKids = () => Object.values(ST.profiles).sort((a,b) => (b.at||b.created) - (a.at||a.created));
const classKids = () => [...deviceKids(), ...(ST.settings.sampleClass === false ? [] : samples())];
const kidById = id => ST.profiles[id] || samples().find(k => k.id === id);

/* ---------------------------------------------------------------- analysis (same for every child) */
const LET_ORDER = ['م','ن','ب','ج','ع','أ','ل','ت'];   // the order the journey meets them
const SKILL_DEFS = [
  {id:'find',     name:'تمييز الحرف',             test:e => e.skill === 'find'},
  {id:'hear',     name:'سماع صوت الحرف',          test:e => e.skill === 'hear'},
  {id:'match',    name:'مطابقة الحرف بالصورة',     test:e => e.skill === 'match'},
  {id:'trace',    name:'تتبع الحرف',               test:e => e.skill === 'trace'},
  {id:'count',    name:'العد',                     test:e => e.skill === 'count'},
  {id:'order',    name:'ترتيب الأرقام',            test:e => e.skill === 'order'},
  {id:'quantity', name:'الرقم والكمية',            test:e => e.skill === 'quantity'},
  {id:'visual',   name:'التمييز البصري',           test:e => e.skill === 'visual'},
  {id:'classify', name:'التصنيف',                  test:e => e.skill === 'classify'},
  {id:'behavior', name:'السلوك الإيجابي',          test:e => e.skill === 'behavior'},
  {id:'environment', name:'المحافظة على البيئة',   test:e => e.skill === 'environment'},
];
/* one slip is not a pattern: a single attempt needs support only after 2+ errors;
   with more attempts, the latest clean one or half clean overall counts as mastered */
function judge(ev){
  if(!ev.length) return 'none';
  const last = ev[ev.length-1]; if(last.firstTry) return 'star';
  if(ev.length === 1) return last.errors >= 2 ? 'retry' : 'star';
  return ev.filter(e => e.firstTry).length/ev.length >= .5 ? 'star' : 'retry';
}
function analyze(p){
  const log = p.log || [];
  const tries = log.filter(e => e.skill !== 'run');
  const first = tries.filter(e => e.firstTry).length, times = tries.filter(e => e.ms).map(e => e.ms);
  const done = STATIONS.reduce((n,s) => n + (p.st[s.id] ? Object.values(p.st[s.id].acts).filter(Boolean).length : 0), 0) + Object.keys(p.missions||{}).length;
  const letters = {}, numbers = {}, skills = {};
  for(const L of LET_ORDER){   // a letter's own activities decide; picture pairing only counts for letters with none
    const own = log.filter(e => (e.act === 'letter' && e.skill === 'run' && e.item === L) || (e.act === 'hunt' && e.item === L));
    letters[L] = judge(own.length ? own : log.filter(e => e.act === 'pairs' && e.skill === 'match' && String(e.item).includes(L)));
  }
  for(let n=1;n<=8;n++){
    const own = log.filter(e => e.skill === 'count' && +e.item === n);
    numbers[n] = judge(own.length ? own : log.filter(e => (e.skill === 'quantity' && String(e.item).includes(String(n))) || ((e.act === 'order' || e.act === 'path') && n <= +e.item)));
  }
  for(const d of SKILL_DEFS){ const ev = log.filter(d.test).slice(-6);
    skills[d.id] = {st:judge(ev), ok:ev.filter(e => e.firstTry).length, n:ev.length}; }
  const needs = [...LET_ORDER.filter(L => letters[L] === 'retry').map(L => ({key:'l:'+L, name:harf(L)})),
    ...[1,2,3,4,5,6,7,8].filter(n => numbers[n] === 'retry').map(n => ({key:'n:'+n, name:'الرقم '+num(n)})),
    ...SKILL_DEFS.filter(d => skills[d.id].st === 'retry').map(d => ({key:'s:'+d.id, name:d.name}))];
  return {p, done, pct:Math.min(1, done/TOTAL_ACTS), stations:STATIONS.filter(s => p.st[s.id] && p.st[s.id].done).length, stars:p.stars,
    tries:tries.length, firstRate:tries.length ? first/tries.length : 0, avgMs:times.length ? times.reduce((a,b)=>a+b,0)/times.length : 0,
    letters, numbers, skills, needs, last:log.length ? log[log.length-1].t : null, countLevel:(p.skills.count||{}).d || 1};
}
/* every letter / number / skill with the children at each level */
function groupTable(list){
  const rows = [];
  const push = (key, group, name, stOf) => { const r = {key, group, name, star:[], retry:[], none:[]}; list.forEach(a => r[stOf(a)].push(a)); rows.push(r); };
  LET_ORDER.forEach(L => push('l:'+L, 'letters', harf(L), a => a.letters[L]));
  [1,2,3,4,5,6,7,8].forEach(n => push('n:'+n, 'numbers', 'الرقم '+num(n), a => a.numbers[n]));
  SKILL_DEFS.forEach(d => push('s:'+d.id, 'skills', d.name, a => a.skills[d.id].st));
  return rows;
}
function needSentence(r){ const n = r.retry.length;
  return `${kidsN(n)} ${needVerb(n)} إلى تدريب إضافي على ${r.group === 'letters' ? r.name.replace('حرف\u00a0','حرف\u00a0«')+'»' : r.name}`; }

function actLabel(e){
  const L = e.item;
  switch(e.act){
    case 'letter': return ({find:`${harf(L)}: البحث بالصور`, hear:`${harf(L)}: سماع الصوت`, match:`${harf(L)}: مطابقة بالصورة`, trace:`${harf(L)}: التتبع`, run:`${harf(L)}`})[e.skill] || `${harf(L)}`;
    case 'write': return `${harf(L)}: الكتابة بالإصبع`;
    case 'count': return `العد: ${num(e.item)}`;
    case 'beach': return 'تنظيف الشاطئ';
    case 'order': return 'ترتيب الأرقام';
    case 'path': return `الطريق إلى الرقم ${num(5)}`;
    case 'pairs': return e.skill === 'quantity' ? 'الرقم والكمية' : 'مطابقة الحرف بالصورة';
    case 'size': return 'كبير وصغير، طويل وقصير';
    case 'sort': return e.skill === 'classify' ? 'نبات، جبل، بحر' : 'تصنيف الأشكال';
    case 'hunt': return `البحث عن ${harf(L)}`;
    case 'mission': { const m = MISSIONS.find(x => x.id === e.item); return 'مهمة وطنية: ' + (m ? m.title : ''); }
  }
  return e.act;
}
const placeOf = e => e.station === 'missions' ? 'مهمات وطنية' : (stationById(e.station) || {short:''}).short;
const resultOf = e => e.errors ? `بعد ${counted(e.errors+1, 'محاولة', 'محاولتين', 'محاولات', 'محاولة')}` : 'من أول محاولة';

/* ---------------------------------------------------------------- layout helpers */
const TEACH_KEY = 'burum.teacher'; let teachMem = false;
const isTeacher = () => { try{ return sessionStorage.getItem(TEACH_KEY) === '1' || teachMem; }catch(e){ return teachMem; } };
function setTeacher(on){ teachMem = on; try{ on ? sessionStorage.setItem(TEACH_KEY, '1') : sessionStorage.removeItem(TEACH_KEY); }catch(e){} }
function quiet(){ Music.stop(); stopVoice(); const fx = $('#fx'); if(fx) fx.innerHTML = ''; }
function leaveAdult(){ dense(false); splash(); }
/* usable width inside a panel, in art pixels */
const pageW = () => AP.w - 2*Math.max(6, Math.ceil(16/SC));
const panW = (half) => (half && !NARROW ? Math.floor((pageW() - 4)/2) : pageW()) - 12;

const TABS = [['home','الرئيسية','i_home'], ['kids','الأطفال','i_kids'], ['reports','التقارير','i_chart'], ['settings','الإعدادات','i_gear']];
function shell(tab, body){
  return `<section class="screen dash">
    <header class="dtop">
      <div class="row brand">${S_('mini')}<div class="col" style="align-items:flex-start;gap:0">${D.h('لوحة المعلمة')}${D.s('مغامرة برعم في وطننا')}</div></div>
      <nav class="tabs" aria-label="أقسام اللوحة">${TABS.map(([k,l,ic]) => `<button class="pbtn tab ${tab===k?'gold':''}" data-tab="${k}" aria-label="${l}" ${tab===k?'aria-current="page"':''}>${S_(ic)}${D.t(l)}</button>`).join('')}
        <button class="pbtn tab sand" id="dOut" aria-label="خروج">${S_('i_door')}${D.t('خروج')}</button></nav>
    </header><div class="sadu"></div>${body}</section>`;
}
function wireShell(){
  $$('[data-tab]').forEach(b => b.onclick = () => { sfx.tap(); ({home:dashHome, kids:dashKids, reports:() => dashReports(), settings:dashSettings})[b.dataset.tab](); });
  $('#dOut').onclick = () => { sfx.tap(); setTeacher(false); leaveAdult(); };
  $$('[data-kid]').forEach(b => b.onclick = () => { sfx.tap(); dashReports('one', b.dataset.kid); });
}
const sec = (title, ic, inner, cls='') => `<div class="pan sec ${cls}"><div class="sec-h">${ic ? S_(ic) : ''}${D.h(title)}</div>${inner}</div>`;
const meter = (x, cls='sm') => `<div class="meter ${cls}"><i style="width:${Math.round(x*100)}%"></i></div>`;
const tag = t => `<span class="dtag">${D.s(t,'#1b1e2b')}</span>`;
const who = a => `${S_(face(a.p.avatar))}${D.t(a.p.name)}${a.p.sample ? '' : tag('هذا الجهاز')}`;

/* ---------------------------------------------------------------- teacher: login */
function teacher(){ quiet(); dense(true); isTeacher() ? dashHome() : teacherLogin(); }
function teacherLogin(msg=''){
  dense(true);
  const w = Math.min(200, pageW() - 12);
  show(`<section class="screen dash login">
    <div class="pan col loginbox">
      <div class="row center">${B_('happy')}<div class="col" style="align-items:flex-start;gap:var(--u)">${D.h('لوحة المعلمة')}${D.s('حساب منفصل للمعلمة', '#6b6450', w-50)}</div></div>
      <label class="fld">${D.t('اسم المستخدم')}<input class="name-in" id="tu" dir="ltr" autocomplete="username" autocapitalize="off" spellcheck="false"></label>
      <label class="fld">${D.t('رمز الدخول')}<input class="name-in" id="tp" dir="ltr" type="password" inputmode="numeric" autocomplete="current-password"></label>
      <div id="lerr" role="alert">${msg ? D.t(msg, '#b03a2e', w) : ''}</div>
      <div class="row center">${btn({id:'lgo', cls:'green', label:'دخول'})}${btn({id:'lback', cls:'sand', label:'رجوع إلى اللعبة'})}</div>
      <div class="hint">${D.s('للعرض أمام اللجنة: اسم المستخدم teacher والرمز 1234. يمكن تغيير الرمز من الإعدادات.', '#6b6450', w)}</div>
    </div></section>`, {fn:teacherLogin, safe:true, dense:true});
  const go = () => {
    const u = $('#tu').value.trim().toLowerCase(), pw = $('#tp').value.trim();
    if(u === 'teacher' && pw === String(ST.settings.tpin || '1234')){ sfx.ok(); setTeacher(true); dashHome(); }
    else { sfx.soft(); $('#lerr').innerHTML = D.t('اسم المستخدم أو الرمز غير صحيح.', '#b03a2e', w); $('#tp').value = ''; }
  };
  $('#lgo').onclick = go; $$('.loginbox input').forEach(i => i.onkeydown = e => { if(e.key === 'Enter') go(); });
  $('#lback').onclick = () => { sfx.tap(); leaveAdult(); };
}
const guard = fn => (...a) => { if(!isTeacher()) return teacherLogin(); dense(true); return fn(...a); };

/* ---------------------------------------------------------------- teacher: home */
const dashHome = guard(function(){
  const list = classKids().map(analyze), n = list.length;
  const avg = n ? list.reduce((s,a) => s + a.pct, 0)/n : 0;
  const needKids = list.filter(a => a.needs.length).length;
  const today = list.filter(a => a.last && Date.now() - a.last < DAY).length;
  const top = groupTable(list).filter(r => r.retry.length).sort((a,b) => b.retry.length - a.retry.length).slice(0,6);
  const recent = list.flatMap(a => a.p.log.filter(e => e.skill !== 'run').map(e => ({a,e}))).sort((x,y) => y.e.t - x.e.t).slice(0,7);
  const hw = panW(true) - 40, tw = NARROW ? Math.floor((pageW() - 4)/2) - 12 : Math.floor((pageW() - 12)/4) - 12;
  const stat = (label, value, sub) => `<div class="pan stat">${D.s(label, '#6b6450', tw)}${D.big(value)}${sub ? D.s(sub, '#6b6450', tw) : ''}</div>`;
  show(shell('home', `
    <div class="tiles">
      ${stat('عدد الأطفال', num(n), ST.settings.sampleClass === false ? '' : `منهم ${counted(samples().length, 'نموذج', 'نموذجان', 'نماذج', 'نموذجًا')} للعرض`)}
      ${stat('نسبة الإنجاز', pct(avg), 'متوسط الفصل')}
      ${stat('لعبوا اليوم', num(today), `من ${num(n)}`)}
      ${stat('يحتاجون دعمًا', num(needKids), 'في مهارة واحدة على الأقل')}
    </div>
    <div class="dgrid">
      ${sec('المهارات التي تحتاج دعمًا', 'i_retry', top.length ? top.map(r => `<button class="lrow" data-need="${r.key}">${D.t(r.name)}<span class="grow"></span>${D.t(kidsN(r.retry.length), '#b0521f')}</button>`).join('')
        + D.s('اضغط على مهارة لرؤية أسماء الأطفال في تقرير المهارات.', '#6b6450', hw+40) : D.t('لا توجد مهارات تحتاج دعمًا الآن.', '#0e6b3a', hw))}
      ${sec('آخر الأنشطة', 'i_flag', recent.length ? recent.map(({a,e}) => `<button class="lrow" data-kid="${a.p.id}">${S_(face(a.p.avatar))}<span class="col grow">${D.t(a.p.name + '، ' + actLabel(e), '#1b1e2b', hw)}${D.s(placeOf(e) + '، ' + resultOf(e) + '، ' + ago(e.t), '#6b6450', hw)}</span>${icon(e.firstTry ? 'star' : 'retry')}</button>`).join('')
        : D.t('لم يلعب أحد بعد.', '#6b6450'))}
    </div>`), {fn:dashHome, safe:true, dense:true});
  wireShell();
  $$('[data-need]').forEach(b => b.onclick = () => { sfx.tap(); dashReports('skills', null, b.dataset.need); });
});

/* ---------------------------------------------------------------- teacher: children */
const dashKids = guard(function(){
  const list = classKids().map(analyze);
  const cw = NARROW ? pageW() - 16 : 118;
  show(shell('kids', `
    <div class="row">${D.h('أطفال الفصل')}${D.s(`${kidsN(list.length)}، اضغط على الطفل لفتح ملفه`)}</div>
    <div class="kgrid">${list.map(a => `<button class="pbtn kcard" data-kid="${a.p.id}" aria-label="${esc(a.p.name)}">
      <span class="krow">${who(a)}<span class="grow"></span>${S_(a.p.symbol)}</span>
      <span class="krow">${meter(a.pct)}${D.s(pct(a.pct))}<span class="grow"></span>${S_('i_star')}${D.s(num(a.stars))}</span>
      <span class="krow">${a.needs.length ? S_('i_retry') + D.s('بحاجة إلى دعم: ' + a.needs.slice(0,2).map(x => x.name).join('، ') + (a.needs.length > 2 ? '…' : ''), '#b0521f', cw-14)
        : S_('i_check') + D.s(a.tries ? 'لا يحتاج دعمًا الآن' : 'لم يبدأ اللعب بعد', '#0e6b3a')}</span>
      <span class="krow">${D.s('آخر لعب: ' + ago(a.last))}</span></button>`).join('')}</div>`), {fn:dashKids, safe:true, dense:true});
  wireShell();
});

/* ---------------------------------------------------------------- child file (the individual report) */
function kidFile(a){
  const p = a.p, full = pageW() - 12, hw = panW(true);
  const sw = NARROW ? Math.floor((full - 2)/2) - 10 : Math.floor((full - 10)/6) - 10;
  const statC = (label, value) => `<div class="kstat">${D.s(label, '#6b6450', sw)}${D.t(value, '#0e6b3a', sw)}</div>`;
  const cells = (items) => `<div class="cells">${items.map(([label, st]) => `<div class="lcell ${st}">${T(label,{size:16, color:'#0e6b3a'})}${icon(st)}</div>`).join('')}</div>`;
  const recs = [];
  a.needs.filter(x => x.key.startsWith('l:')).forEach(x => { const L = x.key.slice(2); const sk = p.skills['l_'+L];
    recs.push(`${she(a,'يحتاج','تحتاج')} ${p.name} إلى تدريب إضافي على ${harf(L)}. اقتراح صفي: بطاقات صور تبدأ بحرف\u00a0${L} مثل ${(HOME_IDEAS[L]||[]).slice(0,2).join(' و')}.`);
    if(sk && sk.lastSupport) recs.push(`تبدأ اللعبة الجولة القادمة ل${harf(L)} بسماع صوت الحرف أولًا، ثم البحث بالصور.`); });
  const nw = a.needs.filter(x => x.key.startsWith('n:')); if(nw.length) recs.push(`تدريب على العد بأشياء حقيقية: ${nw.map(x => x.name).join('، ')}.`);
  a.needs.filter(x => x.key.startsWith('s:')).forEach(x => recs.push(`مهارة «${x.name}» تحتاج متابعة في أنشطة الفصل.`));
  const R = {1:[1,3], 2:[2,5], 3:[4,8]}[a.countLevel];
  recs.push(`مستوى العد الحالي ${num(a.countLevel)} من ${num(3)}: تعرض اللعبة من ${num(R[0])} إلى ${num(R[1])}.`);
  const hardL = LET_ORDER.filter(L => (p.skills['l_'+L]||{}).clean >= 1);
  if(hardL.length) recs.push(`حروف انتقلت إلى المستوى الأصعب (صور أكثر): ${hardL.join('، ')}.`);
  if(!a.needs.length && a.tries) recs.unshift(`أداء ${p.name} ثابت، ${she(a,'ويمكنه','ويمكنها')} الانتقال إلى المحطة التالية.`);
  const recent = p.log.filter(e => e.skill !== 'run').slice(-8).reverse();
  return `
    <div class="pan kidhead">
      <div class="krow">${S_(p.avatar)}<div class="col" style="align-items:flex-start;gap:var(--u)"><span class="krow">${D.h(p.name, '#1b1e2b')}${S_(p.symbol)}${p.sample ? tag('نموذج للعرض') : tag('هذا الجهاز')}</span>
        ${D.s(a.tries ? 'آخر لعب: ' + ago(a.last) : 'لم يبدأ اللعب بعد')}${p.medal ? `<span class="krow">${S_('i_medal')}${D.s('حصل على وسام برعم الوطن', '#0e6b3a')}</span>` : ''}</div></div>
      <div class="sgrid">${statC('الإنجاز', pct(a.pct))}${statC('النجوم', num(a.stars))}${statC('المحطات', `${num(a.stations)} من ${num(8)}`)}
        ${statC('المحاولات', num(a.tries))}${statC('من أول محاولة', pct(a.firstRate))}${statC('متوسط زمن النشاط', a.avgMs ? secs(a.avgMs) : '—')}</div>
    </div>
    <div class="dgrid">
      ${sec('الحروف', '', cells(LET_ORDER.map(L => [L, a.letters[L]])) + legend())}
      ${sec('الأرقام', '', cells([1,2,3,4,5,6,7,8].map(n => [num(n), a.numbers[n]])) + legend())}
      ${sec('المهارات', '', SKILL_DEFS.map(d => { const s = a.skills[d.id];
        return `<div class="lrow static">${icon(s.st)}${D.t(d.name)}<span class="grow"></span>${D.s(s.n ? `${num(s.ok)} من ${num(s.n)} من أول محاولة` : 'لم يبدأ')}</div>`; }).join(''))}
      ${sec('المحطات', '', `<div class="stgrid">${STATIONS.map(s => { const r = p.st[s.id], d = r ? Object.values(r.acts).filter(Boolean).length : 0;
        return `<div class="stcell ${r && r.done ? 'star' : d ? 'retry' : ''}">${S_(s.icon)}${D.s(s.short, '#1b1e2b')}${D.s(`${num(d)} من ${num(s.acts.length)}`)}</div>`; }).join('')}</div>`
        + `<div class="krow">${S_('i_flag')}${D.s(`المهمات الوطنية: ${num(Object.keys(p.missions||{}).length)} من ${num(MISSIONS.length)}`)}</div>`)}
      ${sec('توصيات للمعلمة', 'i_idea', recs.map(t => `<div class="lrow static">${D.t(t, '#1b1e2b', hw - 16)}</div>`).join(''))}
      ${sec('آخر الأنشطة', '', recent.length ? recent.map(e => `<div class="lrow static">${icon(e.firstTry ? 'star' : 'retry')}<span class="col grow">${D.t(actLabel(e), '#1b1e2b', hw - 30)}${D.s(`${placeOf(e)}، ${resultOf(e)}، ${ago(e.t)}`, '#6b6450', hw - 30)}</span></div>`).join('') : D.t('لا توجد أنشطة بعد.', '#6b6450'))}
    </div>`;
}

/* ---------------------------------------------------------------- teacher: reports */
const dashReports = guard(function(sub='one', kidId=null, focus=null){
  const list = classKids().map(analyze);
  const subs = [['one','تقرير فردي'], ['group','تقرير المجموعة'], ['skills','تقرير المهارات']];
  let body = '';
  if(sub === 'one'){
    const a = list.find(x => x.p.id === kidId) || list.find(x => x.needs.length) || list[0];
    body = !a ? D.t('لا يوجد أطفال بعد.') : `<div class="pick-row" role="group" aria-label="اختر الطفل">${list.map(x => `<button class="pbtn pill ${x === a ? 'on' : ''}" data-one="${x.p.id}">${D.s(x.p.name, '#1b1e2b')}</button>`).join('')}</div>${kidFile(a)}`;
  } else if(sub === 'group'){
    const n = list.length || 1, avg = k => list.reduce((s,a) => s + k(a), 0)/n;
    const lets = a => LET_ORDER.filter(L => a.letters[L] === 'star').length, nums = a => [1,2,3,4,5,6,7,8].filter(k => a.numbers[k] === 'star').length;
    const sorted = [...list].sort((x,y) => y.pct - x.pct);
    body = `<div class="pan sec"><div class="sec-h">${S_('i_chart')}${D.h('مقارنة تقدم أطفال الفصل')}</div>
      <div class="tblwrap"><table class="tbl"><thead><tr>${['الطفل','الإنجاز','النجوم','حروف متقنة','أرقام متقنة','أول محاولة','بحاجة إلى دعم'].map(h => `<th scope="col">${D.w(h)}</th>`).join('')}</tr></thead>
      <tbody>${sorted.map(a => `<tr data-kid="${a.p.id}" tabindex="0"><td><span class="krow">${S_(face(a.p.avatar))}${D.t(a.p.name)}</span></td>
        <td><span class="krow">${meter(a.pct)}${D.s(pct(a.pct))}</span></td><td>${D.t(num(a.stars))}</td>
        <td>${D.t(`${num(lets(a))}/${num(8)}`)}</td><td>${D.t(`${num(nums(a))}/${num(8)}`)}</td><td>${D.t(pct(a.firstRate))}</td>
        <td>${a.needs.length ? D.s(a.needs[0].name + (a.needs.length > 1 ? ` و${counted(a.needs.length-1, 'مهارة أخرى', 'مهارتان', 'مهارات', 'مهارة')}` : ''), '#b0521f') : D.s('—')}</td></tr>`).join('')}</tbody>
      <tfoot><tr><td>${D.t('متوسط الفصل')}</td><td><span class="krow">${meter(avg(a => a.pct))}${D.s(pct(avg(a => a.pct)))}</span></td><td>${D.t(num(Math.round(avg(a => a.stars))))}</td>
        <td>${D.t(num(Math.round(avg(lets)*10)/10))}</td><td>${D.t(num(Math.round(avg(nums)*10)/10))}</td><td>${D.t(pct(avg(a => a.firstRate)))}</td><td></td></tr></tfoot></table></div>
      ${D.s('اضغط على اسم الطفل لفتح تقريره الفردي.')}</div>`;
  } else {
    const rows = groupTable(list), fw = pageW() - 110;
    const top = [...rows].sort((a,b) => b.retry.length - a.retry.length)[0];
    const bar = r => { const n = list.length || 1, ok = Math.round(r.star.length/n*70), nd = Math.round(r.retry.length/n*70);
      return `<span class="bar" aria-hidden="true"><i class="ok" style="width:calc(var(--u)*${ok})"></i><i class="need" style="width:calc(var(--u)*${nd})"></i></span>`; };
    const group = (g, title) => sec(title, '', rows.filter(r => r.group === g).sort((a,b) => b.retry.length - a.retry.length).map(r => `
      <div class="lrow static skrow ${focus === r.key ? 'focus' : ''}" id="r-${r.key.replace(':','-')}">
        <span class="krow">${D.t(r.name)}<span class="grow"></span>${bar(r)}${D.s(`${num(r.star.length)} متقن، ${num(r.retry.length)} يحتاج، ${num(r.none.length)} لم يبدأ`)}</span>
        ${r.retry.length ? D.s(needSentence(r) + ': ' + r.retry.map(a => a.p.name).join('، ') + '.', '#b0521f', fw + 90) : ''}</div>`).join(''));
    body = `${top && top.retry.length ? `<div class="pan callout">${S_('i_idea')}${D.t(needSentence(top) + '. يمكن تخطيط نشاط صفي لهذه المجموعة.', '#1b1e2b', pageW() - 40)}</div>` : ''}
      <div class="legend">${`<span><i class="sw ok"></i>${D.s('متقن')}</span><span><i class="sw need"></i>${D.s('يحتاج تدريبًا')}</span><span><i class="sw"></i>${D.s('لم يبدأ بعد')}</span>`}</div>
      ${group('letters', 'الحروف')}${group('numbers', 'الأرقام')}${group('skills', 'المهارات')}`;
  }
  show(shell('reports', `<div class="subtabs">${subs.map(([k,l]) => `<button class="pbtn pill ${k===sub?'on':''}" data-sub="${k}">${D.t(l)}</button>`).join('')}</div>${body}`),
    {fn:dashReports, args:[sub, kidId, focus], safe:true, dense:true});
  wireShell();
  $$('[data-sub]').forEach(b => b.onclick = () => { sfx.tap(); dashReports(b.dataset.sub); });
  $$('[data-one]').forEach(b => b.onclick = () => { sfx.tap(); dashReports('one', b.dataset.one); });
  $$('tr[data-kid]').forEach(r => r.onkeydown = e => { if(e.key === 'Enter') r.click(); });
  if(focus){ const el = document.getElementById('r-' + focus.replace(':','-')); if(el) later(() => el.scrollIntoView({block:'center'}), 50); }
});

/* ---------------------------------------------------------------- teacher: settings */
const dashSettings = guard(function(){
  const s = ST.settings, devN = deviceKids().length, w = pageW() - 20;
  const two = (id, a, b, onA) => `<div class="pick-row"><button class="pbtn pill ${onA?'on':''}" data-set="${id}" data-v="1">${D.t(a)}</button><button class="pbtn pill ${!onA?'on':''}" data-set="${id}" data-v="0">${D.t(b)}</button></div>`;
  const item = (title, text, ctrl) => `<div class="pan sec"><div class="set-row"><div class="col" style="align-items:flex-start;gap:var(--u)">${D.t(title)}${text ? D.s(text, '#6b6450', Math.min(w, 300)) : ''}</div>${ctrl}</div></div>`;
  show(shell('settings', `
    ${item('شكل الأرقام', 'في اللعبة والتقارير.', two('digits', '١٢٣', '123', s.digits === 'arab'))}
    ${item('وضع العرض للجنة التحكيم', 'يفتح جميع المحطات دون ترتيب، لتجربة أي نشاط مباشرة.', two('openAll', 'مفعّل', 'متوقف', !!s.openAll))}
    ${item('الفصل النموذجي', `يعرض ${counted(samples().length, 'طفلًا', 'طفلين', 'أطفال', 'طفلًا')} نموذجيين في اللوحة حتى يلعب أطفال الفصل.`, two('sampleClass', 'ظاهر', 'مخفي', s.sampleClass !== false))}
    ${item('رمز دخول المعلمة', 'أربعة أرقام أو أكثر. يحفظ على هذا الجهاز فقط.', `<div class="row"><input class="name-in pin-in" id="newPin" dir="ltr" type="password" inputmode="numeric" maxlength="8" aria-label="الرمز الجديد">${btn({id:'savePin', cls:'green', label:'حفظ'})}</div>`)}
    ${item('بيانات هذا الجهاز', devN ? `على هذا الجهاز ${kidsN(devN)}: ${deviceKids().map(p => p.name).join('، ')}.` : 'لا توجد بيانات أطفال على هذا الجهاز.', devN ? btn({id:'wipe', cls:'sand', label:'حذف بيانات الأطفال'}) : '')}
    <div class="pan sec"><div class="sec-h">${S_('i_lock')}${D.h('حماية بيانات الأطفال')}</div>
      ${['لا تطلب اللعبة إلا اسمًا أول أو رمزًا لكل طفل، ولا تجمع أي بيانات شخصية أخرى.',
         'تحفظ النتائج على هذا الجهاز فقط، ولا ترسل إلى أي مكان.',
         'لوحة المعلمة محمية برمز، وصفحة ولي الأمر خلف سؤال للكبار.',
         'عند اعتماد اللعبة في أكثر من فصل تحتاج المزامنة إلى خادم بحسابات للمعلمات (ضمن لوحة الإدارة المستقبلية).'].map(t => `<div class="lrow static">${S_('i_check')}${D.s(t, '#1b1e2b', w - 20)}</div>`).join('')}</div>
    <div id="setMsg" role="status"></div>`), {fn:dashSettings, safe:true, dense:true});
  wireShell();
  $$('[data-set]').forEach(b => b.onclick = () => { sfx.tap(); const k = b.dataset.set, on = b.dataset.v === '1';
    if(k === 'digits') s.digits = on ? 'arab' : 'latn'; else s[k] = on; save(); dashSettings(); });
  $('#savePin').onclick = () => { const v = $('#newPin').value.trim();
    if(!/^\d{4,8}$/.test(v)){ sfx.soft(); $('#setMsg').innerHTML = `<div class="pan">${D.t('الرمز يجب أن يكون من ٤ إلى ٨ أرقام.', '#b03a2e')}</div>`; return; }
    s.tpin = v; save(); sfx.ok(); $('#newPin').value = ''; $('#setMsg').innerHTML = `<div class="pan">${D.t('حُفظ الرمز الجديد.', '#0e6b3a')}</div>`; };
  if(devN) $('#wipe').onclick = () => { sfx.tap();
    modal(`${S_('i_lock')}${D.h('حذف بيانات الأطفال؟', '#b03a2e')}${D.t(`سيُحذف تقدم ${kidsN(devN)} من هذا الجهاز نهائيًا، ولا يمكن استرجاعه.`, '#1b1e2b', 200)}
      <div class="row center">${btn({id:'wYes', cls:'gold', label:'نعم، احذف'})}${btn({id:'wNo', cls:'green', label:'إلغاء'})}</div>`);
    $('#wNo').onclick = () => { sfx.tap(); closeModal(); };
    $('#wYes').onclick = () => { ST.profiles = {}; ST.activeId = null; save(); closeModal(); dashSettings(); $('#setMsg').innerHTML = `<div class="pan">${D.t('حُذفت بيانات الأطفال من هذا الجهاز.', '#0e6b3a')}</div>`; };
  };
});

/* ---------------------------------------------------------------- parent: adult question */
function parentGate(tries=0){
  quiet(); dense(true);
  const a = 6 + Math.floor(Math.random()*4), b = 3 + Math.floor(Math.random()*6); let typed = '';
  show(`<section class="screen dash login">
    <div class="pan col loginbox">
      <div class="row center">${B_('help')}<div class="col" style="align-items:flex-start;gap:var(--u)">${D.h('صفحة ولي الأمر')}${D.s('للكبار فقط')}</div></div>
      ${D.t('للدخول، ما ناتج:')}<div dir="ltr">${D.big(`${num(a)} × ${num(b)} = ?`, '#1b1e2b')}</div>
      <div class="pan display" id="disp" aria-live="polite"></div>
      ${tries ? D.s('الإجابة غير صحيحة. هذا سؤال جديد.', '#b03a2e') : ''}
      <div class="keypad">${[7,8,9,4,5,6,1,2,3].map(d => `<button class="pbtn" data-d="${d}" aria-label="${d}">${T(num(d),{size:16, color:'#1b1e2b'})}</button>`).join('')}
        <button class="pbtn sand" id="kDel" aria-label="امسح">${S_('i_back')}</button><button class="pbtn" data-d="0" aria-label="0">${T(num(0),{size:16, color:'#1b1e2b'})}</button><button class="pbtn green" id="kOk" aria-label="تأكيد">${S_('i_check')}</button></div>
      ${btn({id:'pBack', cls:'sand', label:'رجوع إلى اللعبة'})}
    </div></section>`, {fn:parentGate, safe:true, dense:true});
  const draw = () => { $('#disp').innerHTML = typed ? D.big(num(typed), '#1b1e2b') : D.s('اكتب الإجابة'); }; draw();
  $$('[data-d]').forEach(k => k.onclick = () => { sfx.tap(); if(typed.length < 3){ typed += k.dataset.d; draw(); } });
  $('#kDel').onclick = () => { sfx.tap(); typed = typed.slice(0,-1); draw(); };
  $('#kOk').onclick = () => { if(+typed === a*b){ sfx.ok(); parentView(); } else { sfx.soft(); parentGate(tries+1); } };
  $('#pBack').onclick = () => { sfx.tap(); leaveAdult(); };
}

/* ---------------------------------------------------------------- parent: child page */
function homeIdea(a){
  const L = LET_ORDER.find(x => a.letters[x] === 'retry') || LET_ORDER.find(x => a.letters[x] === 'none') || LET_ORDER[Math.floor(Math.random()*LET_ORDER.length)];
  const n = [3,4,5,6,7,8].find(k => a.numbers[k] === 'retry');
  return {L, lines:[`تدرب اليوم على ${harf(L)}.`, `ابحثوا معًا في المنزل عن ${num(3)} أشياء تبدأ بحرف\u00a0${L}.`, `مثل: ${(HOME_IDEAS[L]||[]).join('، ')}.`,
    ...(n ? [`وعدّوا معًا حبات التمر من ${num(1)} إلى ${num(n)}.`] : [])]};
}
function parentView(id=null){
  dense(true);
  const dev = deviceKids(); const sample = !dev.length;
  const pool = sample ? [samples()[0]] : dev;
  const p = pool.find(k => k.id === id) || pool[0]; const a = analyze(p);
  const w = panW(true) - 12, earned = earnedSet(p);
  const gotL = LET_ORDER.filter(L => a.letters[L] === 'star'), gotN = [1,2,3,4,5,6,7,8].filter(n => a.numbers[n] === 'star'), gotS = SKILL_DEFS.filter(d => a.skills[d.id].st === 'star');
  const practice = a.needs;
  const idea = homeIdea(a);
  const vision = Object.entries(VISION).filter(([k]) => MISSIONS.filter(m => m.badge === k).every(m => p.missions[m.id]));
  show(`<section class="screen dash">
    <header class="dtop"><div class="row brand">${S_('mini')}<div class="col" style="align-items:flex-start;gap:0">${D.h('صفحة ولي الأمر')}${D.s('مغامرة برعم في وطننا')}</div></div>
      <nav class="tabs">${btn({id:'pOut', cls:'sand', label:'رجوع إلى اللعبة', icon:'i_door'})}</nav></header><div class="sadu"></div>
    ${sample ? `<div class="pan callout">${S_('i_idea')}${D.t('لم يلعب أحد على هذا الجهاز بعد، فهذا مثال للعرض. بعد أن يلعب طفلكم تظهر نتائجه هنا.', '#1b1e2b', pageW() - 40)}</div>` : ''}
    ${pool.length > 1 ? `<div class="pick-row">${pool.map(k => `<button class="pbtn pill ${k === p ? 'on' : ''}" data-pk="${k.id}">${D.s(k.name, '#1b1e2b')}</button>`).join('')}</div>` : ''}
    <div class="pan kidhead"><div class="krow">${S_(p.avatar)}<div class="col" style="align-items:flex-start;gap:var(--u)"><span class="krow">${D.h(p.name, '#1b1e2b')}${S_(p.symbol)}</span>
      <span class="krow wrap">${S_('i_star')}${D.s(`${num(a.stars)} نجمة`)}${S_('i_map')}${D.s(`${num(a.stations)} من ${num(8)} محطات`)}${p.medal ? S_('i_medal') + D.s('وسام برعم الوطن', '#0e6b3a') : ''}</span>
      ${D.s(a.tries ? 'آخر لعب: ' + ago(a.last) : 'لم يبدأ اللعب بعد')}</div></div></div>
    <div class="dgrid">
      ${sec('نشاط منزلي مقترح', 'i_idea', `<div class="idea">${B_('happy')}<div class="col" style="align-items:flex-start">${idea.lines.map((t,i) => i ? D.t(t, '#1b1e2b', w - 45) : D.h(t, '#0e6b3a', w - 45)).join('')}</div></div>`, 'ideabox')}
      ${sec('المهارات المكتسبة', 'i_star', (gotL.length || gotN.length || gotS.length) ? `
        ${gotL.length ? `<div class="krow wrap">${D.s('الحروف:')}${gotL.map(L => `<span class="chip">${T(L,{size:14, color:'#0e6b3a'})}</span>`).join('')}</div>` : ''}
        ${gotN.length ? `<div class="krow wrap">${D.s('الأرقام:')}${gotN.map(n => `<span class="chip">${T(num(n),{size:14, color:'#0e6b3a'})}</span>`).join('')}</div>` : ''}
        ${gotS.map(d => `<div class="lrow static">${icon('star')}${D.t(d.name)}</div>`).join('')}` : D.t('لم تكتمل مهارات بعد. كل نشاط يضيف مهارة جديدة.', '#6b6450', w))}
      ${sec('ما أنجزه في الرحلة', 'i_book', `<div class="stamps">${STATIONS.map(s => { const got = earned.has(s.id);
          return `<div class="stamp">${genTag('stamp:'+s.icon+':'+(got?1:0), () => stampCanvas(s.icon, got))}${D.s(s.short, got ? '#0e6b3a' : '#a89f86')}</div>`; }).join('')}</div>
        ${D.t(`أنجز ${num(a.done)} من ${num(TOTAL_ACTS)} نشاطًا، منها ${num(Object.keys(p.missions||{}).length)} مهمات وطنية.`, '#1b1e2b', w)}
        ${vision.length ? `<div class="krow wrap">${vision.map(([k,v]) => `<span class="krow">${genTag('vb:'+k+':true', () => badgeCanvas(v.icon, true))}${D.s(v.name, '#0e6b3a')}</span>`).join('')}</div>` : ''}`)}
      ${sec('يتدرب عليه الآن', 'i_retry', practice.length ? practice.map(x => `<div class="lrow static">${icon('retry')}${D.t(x.name)}</div>`).join('') + D.s('يعيد برعم التدريب على هذه المهارات بالصوت والصورة حتى يتقنها.', '#6b6450', w)
        : D.t('لا شيء الآن. أحسنتم!', '#0e6b3a'))}
    </div>
    ${D.s('هذه البيانات محفوظة على هذا الجهاز فقط.', '#6b6450')}
  </section>`, {fn:parentView, args:[id], safe:true, dense:true});
  $('#pOut').onclick = () => { sfx.tap(); leaveAdult(); };
  $$('[data-pk]').forEach(b => b.onclick = () => { sfx.tap(); parentView(b.dataset.pk); });
}
