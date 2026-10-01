/* tools/voice/lines.js — prints, as JSON, every line the game can speak, normalised with the
   game's own voiceKey, so make_voice.py can record one clip per line. It reads the game's
   content.js; keep it in step with the say()/speakRaw() calls in game.js. */
'use strict';
const vm = require('vm'), fs = require('fs'), path = require('path');
const game = path.join(__dirname, '..', '..', 'game');
const ctx = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(game, 'js', 'content.js'), 'utf8'), ctx);
const lines = vm.runInContext(`(() => {
  const S = new Set(), add = t => S.add(voiceKey(t));
  const fill = (id, vars = {}) => VOICE[id].replace(/\\{(\\w+)\\}/g, (_, k) => vars[k] ?? '');
  for(const t of Object.values(VOICE)){ if(Array.isArray(t)) t.forEach(add); else if(!/\\{/.test(t)) add(t); }
  SYMBOLS.forEach(([, n]) => add(fill('hello', {name:n})));                 // a child who picked a symbol is called by it
  STATIONS.forEach((s, i) => { add(fill('walk', {name:s.name})); add(fill('stationDone', {name:s.name}));
    if(i) add(fill('locked', {prev:STATIONS[i-1].name})); });
  for(const [L, c] of Object.entries(LETTERS)){
    add(fill('letterListen', {s:c.sound})); add(fill('letterFind', {l:L})); add(fill('letterHear', {s:c.sound}));
    add(fill('letterMatch', {l:L})); add(c.sound); c.good.forEach(add); }
  for(const s of STATIONS) for(const a of s.acts){
    if(a.type === 'letter' || a.type === 'write') add(fill('letterTrace', {l:a.letter}));
    if(a.type === 'write' && WRITE_WORDS[a.letter]) add(fill('writeWord', {l:a.letter, w:WRITE_WORDS[a.letter][0]}));
    if(a.type === 'hunt'){ add(fill('hunt', {l:a.letter})); add(a.letter + '\\u064e'); }
    if(a.type === 'pairs') a.pairs.forEach(([l, w]) => add(l + '… ' + w)); }
  [2, 3, 5].forEach(n => add(fill('numQtyOk', {q:DATE_COUNT[n]})));
  NUM_WORDS.slice(1).forEach(add);
  [1, 2, 3, 4, 5].forEach(n => add(fill('whereNum', {n:NUM_WORDS[n]})));
  Object.values(CLASSIFY_POOL).flat().forEach(([, w]) => add(w));
  MISSIONS.forEach(m => { add(m.q); add(m.right.cap + '؟'); add(m.wrong.cap + '؟'); add(m.why); });
  Object.values(VISION).forEach(v => add(fill('badgeGot', {name:v.name})));
  return [...S].filter(Boolean);
})()`, ctx);
process.stdout.write(JSON.stringify(lines, null, 1));
