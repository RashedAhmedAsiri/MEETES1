/* =========================================================================
   art.js — pixel-art engine for «مغامرة برعم في وطننا»
   Every sprite, scene, map and text line is drawn on its own small canvas at
   1 art-pixel = 1 canvas pixel, then shown at one integer scale (--s) for the
   whole screen, so every pixel in the game is the same size.
   ========================================================================= */
'use strict';

/* ---------- palette: detail colours (flat) and ramps [shadow, base, light] */
const PAL = {
  k:{c:'#1b1e2b'}, K:{c:'#3a3f58'}, W:{c:'#ffffff'}, m:{c:'#8ff0c0'}, M:{c:'#4fd39a'},
  g:{r:['#0a4a2a','#0e6b3a','#1f8f4e']}, l:{r:['#3a8f45','#5cbf60','#9be07a']},
  t:{r:['#10302a','#1d4a40','#2a5e52']}, w:{r:['#c9c0aa','#f4efe2','#ffffff']},
  q:{r:['#a9bfb1','#e6f0e8','#ffffff']}, s:{r:['#c9a66b','#e8d5a3','#f7ebc8']},
  a:{r:['#9a6636','#d09a5a','#ecc88a']}, d:{r:['#4a2e1c','#7a4e2e','#a8744a']},
  y:{r:['#c98a1a','#f7c948','#fff0a0']}, o:{r:['#b0521f','#e8833a','#f7b06a']},
  r:{r:['#8f2a24','#d94a3d','#f08070']}, p:{r:['#c46b7a','#f29aa0','#ffd6d6']},
  b:{r:['#2b6ca3','#4fa4d8','#9fd8f5']}, c:{r:['#6fb0cc','#a6e0f0','#e4f8ff']},
  n:{r:['#b97a52','#e9b48a','#f8d6b6']}, h:{r:['#1e140f','#3b2a22','#5a4032']},
  v:{r:['#5f4696','#9b7fd4','#c9b6f0']}, e:{r:['#5f676c','#9aa3a8','#d0d7da']},
  x:{r:['#0f0f12','#1f1f24','#34343c']},
};
const hexRGB = h => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
const shadeRGB = (rgb, f) => rgb.map(v => Math.max(0, Math.min(255, Math.round(v*f))));
for(const k in PAL){ const p = PAL[k];
  if(p.r){ p.rgb = p.r.map(hexRGB); p.out = shadeRGB(p.rgb[0], .45); }
  else { p.flat = hexRGB(p.c); p.out = shadeRGB(p.flat, .6); } }
const INK = hexRGB('#1b1e2b');

/* ---------- sprite data (flat silhouettes; shading + outline are automatic) */
const SPR = {
mosque:[
"........................",
"...........y............",
"..........yyy.......y...",
"...........y.......www..",
".........ggggg.....www..",
".......ggggggggg...www..",
"......ggggggggggg..www..",
".....ggggggggggggg.www..",
".....ggggggggggggg.www..",
".....ggggggggggggg.www..",
"...wwwwwwwwwwwwwwwwwwww.",
"...wwwwwwwwwwwwwwwwwwww.",
"...wwwwwwwwwwwwwwwwwwww.",
"...wwbbwwwwbbwwwwbbwwww.",
"...wwbbwwwwbbwwwwbbwwww.",
"...wwbbwwwwbbwwwwbbwwww.",
"...wwwwwwwwwwwwwwwwwwww.",
"...wwwwwwwwdddwwwwwwwww.",
"...wwwwwwwdddddwwwwwwww.",
"...wwwwwwwdddddwwwwwwww.",
"...wwwwwwwdddddwwwwwwww.",
"..ssssssssssssssssssssss"],
drop:[
"...........b............",
"..........bbb...........",
"..........bbb...........",
".........bbbbb..........",
".........bbbbb..........",
"........bbbbbbb.........",
".......bbbbbbbbb........",
".......bbbbbbbbb........",
"......bbbbbbbbbbb.......",
"......bWbbbbbbbbb.......",
".....bbWbbbbbbbbbb......",
".....bWWbbbbbbbbbb......",
".....bWbbbbbbbbbbb......",
".....bbbbbbbbbbbbb......",
".....bbbbbbbbbbbbb......",
"......bbbbbbbbbbb.......",
".......bbbbbbbbb........",
"........bbbbbbb........."],
banana:[
"..................dd....",
".................ddy....",
"................yyyy....",
"...............yyyyy....",
"..............yyyyyy....",
".............yyyyyy.....",
"............yyyyyyy.....",
"...........yyyyyyy......",
".dd.......yyyyyyyy......",
".dyy.....yyyyyyyy.......",
"..yyyy.yyyyyyyyy........",
"...yyyyyyyyyyyy.........",
"....yyyyyyyyyy..........",
"......yyyyyy............"],
lion:[
".......oooooooooo.......",
".....oooooooooooooo.....",
"....oooooooooooooooo....",
"...oooooyyyyyyyyooooo...",
"..ooooyyyyyyyyyyyyoooo..",
"..oooyyyyyyyyyyyyyyooo..",
".ooooyyykyyyyyykyyyoooo.",
".oooyyykkyyyyyykkyyyooo.",
".oooyyyyyyyyyyyyyyyyooo.",
".oooyyyyyyywwyyyyyyyooo.",
".oooyyyyyywddwyyyyyyooo.",
"..ooyyyyyyykkyyyyyyyoo..",
"..oooyyyyywkkwyyyyyooo..",
"...ooyyyyyykkyyyyyyoo...",
"...oooyyyykyykyyyyooo...",
"....oooyyyyyyyyyyooo....",
".....ooooyyyyyyoooo.....",
"......oooooooooooo......",
"........oooooooo........"],
fish:[
"..........bbbbb.........",
"........bbbbbbbbb.......",
".b.....bbbbbbbbbbbb.....",
".bb...bbbbbbbbbbbbbbb...",
".bbb.bbbbbbbbbbbbbkbbb..",
".bbbbbbbbbbbbbbbbbbbbbb.",
".bbbbbbbbbbbbbbbbbbbbbbb",
".bbbbbbccccccccccbbbbbb.",
".bbb.bbcccccccccccbbbb..",
".bb...cccccccccccccb....",
".b.....cccccccccccc.....",
".........ccccccc........"],
house:[
"...........rr...........",
"..........rrrr..........",
".........rrrrrr.........",
"........rrrrrrrr........",
".......rrrrrrrrrr.......",
"......rrrrrrrrrrrr......",
".....rrrrrrrrrrrrrr.....",
"....rrrrrrrrrrrrrrrr....",
"...rrrrrrrrrrrrrrrrrr...",
".....wwwwwwwwwwwwww.....",
".....wwwwwwwwwwwwww.....",
".....wbbbwwwwwwbbbw.....",
".....wbbbwwwwwwbbbw.....",
".....wbbbwwddwwbbbw.....",
".....wwwwwwddwwwwww.....",
".....wwwwwwddwwwwww.....",
".....wwwwwwddwwwwww.....",
".....wwwwwwddwwwwww.....",
"...ssssssssssssssssss..."],
cat:[
".....o..........o.......",
".....oo........oo.......",
".....ooo......ooo.......",
".....oooooooooooo.......",
"....oooooooooooooo......",
"....ooookooookoooo......",
"....oooooooooooooo......",
"....ooooooppoooooo......",
".....ooookkoooooo.......",
"......oooooooooo........",
".....oooooooooooo.......",
"....oooowwwwwoooo...oo..",
"....ooowwwwwwwooo....o..",
"....ooowwwwwwwooo....o..",
"....oooowwwwwoooo...oo..",
"....oooooooooooooooooo..",
"....oo.oo.....oo.oo....."],
palm:[
".......l.....l..........",
".....lllll.lllll........",
"...llll..lll..llll......",
"..lll..lllllll...lll....",
".ll...llllllllll...ll...",
".l...lll.ggg.lll....l...",
"....ll...gyg...ll.......",
"...ll...yydyy...ll......",
"........yydyy...........",
"..........dd............",
"..........dd............",
"...........dd...........",
"...........dd...........",
"...........dd...........",
"..........ddd...........",
"..........ddd...........",
".........dddd...........",
".........dddd...........",
"........dddddd..........",
"......ssssssssss........"],
star:[
"...........y...........",
"..........yyy..........",
"..........yyy..........",
".........yyyyy.........",
".........yyyyy.........",
"yyyyyyyyyyyyyyyyyyyyyyy",
".yyyyyyyyyyyyyyyyyyyyy.",
"...yyyyyyyyyyyyyyyyy...",
"....yyyyyyyyyyyyyyy....",
".....yyyyyyyyyyyyy.....",
".....yyyyyyyyyyyyy.....",
"....yyyyyyyyyyyyyyy....",
"....yyyyyyy.yyyyyyy....",
"...yyyyyy.....yyyyyy...",
"...yyyy.........yyyy...",
"..yyy.............yyy.."],
bee:[
".........cccc..cccc.....",
"........cWWWWccWWWWc....",
"........cWWWWccWWWWc....",
".........cccc..cccc.....",
".......yyykkyykkyyyk....",
"......yyyykkyykkyyykkk..",
".....kyyyykkyykkyyykWk..",
".....yyyyykkyykkyyykkk..",
"......yyyykkyykkyyyk....",
".......yyykkyykkyyy....."],
camel:[
".....................aa.",
"....................aaaa",
"....................aak.",
"..........aa........aa..",
".........aaaa......aaa..",
"........aaaaaa....aaaa..",
".......aaaaaaaa..aaaaa..",
"......aaaaaaaaaaaaaaa...",
".....aaaaaaaaaaaaaaaa...",
"....aaaaaaaaaaaaaaaaa...",
"...aaaaaaaaaaaaaaaaa....",
"...a.aaaaaaaaaaaaaa.....",
".....aaaaaaaaaaaa.......",
".....aa.aa....aa.aa.....",
".....aa.aa....aa.aa.....",
".....aa.aa....aa.aa.....",
".....aa.aa....aa.aa.....",
".....dd.dd....dd.dd....."],
moon:[
".........yyyyy..........",
"......yyyyyy............",
".....yyyyy..............",
"....yyyyy...............",
"...yyyyy................",
"...yyyy.................",
"..yyyyy.................",
"..yyyyy.................",
"..yyyyy.................",
"..yyyyy.................",
"..yyyyyy................",
"...yyyyy................",
"...yyyyyy...............",
"....yyyyyyy......yy.....",
".....yyyyyyyyyyyyy......",
".......yyyyyyyyyy.......",
".........yyyyyy........."],
carrot:[
"..............l..l......",
"...............ll.l.....",
".............lllll......",
"..............llll......",
"............ooool.......",
"...........ooooo........",
"..........oooooo........",
".........oooooo.........",
"........oooooo..........",
".......oooooo...........",
"......ooooo.............",
"......oooo..............",
".....oooo...............",
"....ooo.................",
"....oo..................",
"...o...................."],
mountain:[
"...........w............",
"..........www...........",
".........wwwww..........",
"........wwddwww.........",
".......ddddddddd........",
"......ddddddddddd.......",
".....ddddddddddddd..s...",
"....ddddddddddddddd.ss..",
"...ddddddddddddddddssss.",
"..ddddddddddddddddsssss.",
".ddddddddddddddddssssss.",
"dddddddddddddddddssssss."],
rose:[
".........rrrr...........",
".......rrrrrrr..........",
"......rrrprrrrr.........",
"......rrpprrprr.........",
"......rrprrpprr.........",
"......rrrrrprrr.........",
".......rrrrrrr..........",
"........rrrrr...........",
"..........g.............",
".....ll...g.............",
"......lll.g.............",
".......llgg...ll........",
"..........g.lll.........",
"..........gll...........",
"..........g.............",
"..........g............."],
pearl:[
".......eeeeeeeeee.......",
".....eeeeeeeeeeeeee.....",
"....eeeeeeeeeeeeeeee....",
"...eeeeeeeeeeeeeeeeee...",
"....pppppppppppppppp....",
"....ppppppwwwwpppppp....",
"....pppppwwwwwwppppp....",
"....pppppwwwwwwppppp....",
"....ppppppwwwwpppppp....",
"...eeeeeeeeeeeeeeeeee...",
"....eeeeeeeeeeeeeeee....",
".....eeeeeeeeeeeeee.....",
".......eeeeeeeeee......."],
lemon:[
"...............ll.......",
"..............lll.......",
".........yyyyyl.........",
"......yyyyyyyyyyy.......",
".....yyyyyyyyyyyyy......",
"....yyyyyyyyyyyyyyy.....",
"...yyyyyyyyyyyyyyyyy....",
"...yyyyyyyyyyyyyyyyyy...",
"...yyyyyyyyyyyyyyyyyy...",
"...yyyyyyyyyyyyyyyyy....",
"....yyyyyyyyyyyyyyy.....",
".....yyyyyyyyyyyyy......",
".......yyyyyyyyy........"],
dates:[
"......ddd...ddd.........",
".....ddddd.ddddd........",
".....ddddd.ddddd..ddd...",
"......ddd...ddd..ddddd..",
"...ddd...ddd.....ddddd..",
"..ddddd.ddddd.....ddd...",
"..ddddd.ddddd...........",
"aaaaaaaaaaaaaaaaaaaaaa..",
".aaaaaaaaaaaaaaaaaaaa...",
"..aaaaaaaaaaaaaaaaaa....",
"....aaaaaaaaaaaaaa......"],
apple:[
"...........d............",
"...........d..ll........",
"...........dlll.........",
"......rrrr.d.rrrr.......",
"....rrrrrrrrrrrrrrr.....",
"...rrrrrrrrrrrrrrrrr....",
"...rrrrrrrrrrrrrrrrr....",
"..rrrrrrrrrrrrrrrrrrr...",
"..rrrrrrrrrrrrrrrrrrr...",
"..rrrrrrrrrrrrrrrrrrr...",
"..rrrrrrrrrrrrrrrrrrr...",
"...rrrrrrrrrrrrrrrrr....",
"...rrrrrrrrrrrrrrrrr....",
"....rrrrrrrrrrrrrrr.....",
".....rrrrrr..rrrrr......"],
crown:[
"..y........y........y...",
".yyy......yyy......yyy..",
"..y.......yyy.......y...",
"..yy.....yyyyy.....yy...",
"..yyy...yyyyyyy...yyy...",
"..yyyy.yyyyyyyyy.yyyy...",
"..yyyyyyyyyyyyyyyyyyy...",
"..yyyyyyyyyyyyyyyyyyy...",
"..yyyrryyyybbyyyyrryy...",
"..yyyrryyyybbyyyyrryy...",
"..yyyyyyyyyyyyyyyyyyy...",
"..yyyyyyyyyyyyyyyyyyy..."],
boat:[
"...........k............",
"...........kw...........",
"...........kww..........",
"...........kwww.........",
"...........kwwww........",
"...........kwwwww.......",
"..........wkwwwwww......",
".........wwkwwwwwww.....",
"........wwwkwwwwwwww....",
".......wwwwkwwwwwwwww...",
"...........k............",
".rrrrrrrrrrrrrrrrrrrrrr.",
"..rrrrrrrrrrrrrrrrrrrr..",
"...wwwwwwwwwwwwwwwwww...",
"....wwwwwwwwwwwwwwww...."],
shell:[
"...........pp...........",
".........pppppp.........",
".......pppwppwppp.......",
"......ppwpppwpppwpp.....",
".....pppwpppwpppwppp....",
".....ppwppppwppppwpp....",
"....pppwppppwppppwppp...",
"....ppwpppppwpppppwpp...",
"....ppppppppppppppppp...",
".....ppppppppppppppp....",
".......ppppppppppp......",
".........ppppppp........"],
bin:[
".........eeeeee.........",
"....eeeeeeeeeeeeeeee....",
"....eeeeeeeeeeeeeeee....",
".....gggggggggggggg.....",
".....gglgggglgggglg.....",
".....gglgggglgggglg.....",
".....gglgggglgggglg.....",
".....gglgggglgggglg.....",
".....gglgggglgggglg.....",
"......glgggglgggglg.....",
"......glgggglgggglg.....",
"......gggggggggggg......",
".......gggggggggg......."],
cup:[
"..............ww........",
".............ww.........",
"............ww..........",
".......wwwwwwwwwww......",
"........rrrrrrrrr.......",
"........rrwwwrrrr.......",
"........rrwwwrrrr.......",
".........rrrrrrr........",
".........rrrrrrr........",
".........rrrrrrr........",
"..........rrrrr........."],
can:[
".....eeeeeeeeeeeee......",
"....bbbbbbbbbbbbbbbe....",
"....bbyyyyybbbbbbbbe....",
"....bbyyyyybbbbbbbbe....",
"....bbbbbbbbbbbbbbbe....",
".....eeeeeeeeeeeee......"],
paper:[
"........wwwww...........",
"......wwwwwwwww.........",
".....wwwewwwwwww........",
".....wwwwwwewwwww.......",
".....wwewwwwwwwww.......",
"......wwwwwewwww........",
".......wwwwwwww........."],
bag:[
".......c......c.........",
"......c.c....c.c........",
"......cccccccccc........",
".....cccccccccccc.......",
".....ccbccccccbcc.......",
".....cccccccccccc.......",
"......cccccccccc........",
".......cccccccc........."],
bottle:[
"..........gg............",
"..........ll............",
".........llll...........",
"........llllll..........",
"........lwllll..........",
"........lwllll..........",
"........llllll..........",
"........llllll..........",
"........llllll.........."],
seedling:[
"...ll............ll.....",
"..llll..........llll....",
"..lllll........lllll....",
"...lllll......lllll.....",
"....lllll....lllll......",
".....llllggggllll.......",
".......lllggll..........",
"..........gg............",
"..........gg............",
"..........gg............",
"......dddddddddd........",
".....dddddddddddd.......",
"......dddddddddd........"],
tree:[
"...........g............",
"..........ggg...........",
".........ggggg..........",
"........ggggggg.........",
".......ggggggggg........",
".........ggggg..........",
".......ggggggggg........",
"......ggggggggggg.......",
".....ggggggggggggg......",
".......ggggggggg........",
".....ggggggggggggg......",
"....ggggggggggggggg.....",
"...ggggggggggggggggg....",
"..........dd............",
"..........dd............",
".........dddd..........."],
rock:[
".......ssssss...........",
".....ssssssssss.........",
"....sssssssssssss.......",
"...ssssssssssssssss.....",
"..ssssssssssssssssss....",
".ssssssssssssssssssss...",
".sssssssssssssssssssss..",
"ssssssssssssssssssssss.."],
wave:[
"........bbbbbb..........",
".....bbbbbbbbbbb........",
"...bbbbbbccbbbbbbb......",
"..bbbbccc...cbbbbb......",
"..bbbcc.......bbbb......",
"..bbc.........bbbb......",
".............bbbbb......",
"....b.......bbbbbb...b..",
"..bbbbb...bbbbbbbbbbbbb.",
".bbbbbbbbbbbbbbbbbbbbbbb",
"bbbbbbbbbbbbbbbbbbbbbbbb"],
tablet:[
"..eeeeeeeeeeeeeeeeeeee..",
"..eccccccccccccccccccce.",
"..eccgggcccyyycccrrrce..",
"..eccgcccccycccccrcrce..",
"..eccgggcccyyycccrrrce..",
"..ecccccccccccccccccce..",
"..eccccllllllllllcccce..",
"..ecccccccccccccccccce..",
"..eeeeeeeeeeeeeeeeeeee.."],
ball:[
".......rrrrrr.......",
".....rrrrwwrrrr.....",
"....rrrrwwwwrrrr....",
"...bbbbbbbbbbbbbb...",
"...bbbbbbbbbbbbbb...",
"....yyyyyyyyyyyy....",
".....yyyyyyyyyy.....",
".......yyyyyy......."],
blocks:[
"..rrrrrr.........",
"..rrrrrr.........",
"..rrrrrr.........",
"..bbbbbbyyyyyy...",
"..bbbbbbyyyyyy...",
"..bbbbbbyyyyyy..."],
box:[
"..aaaaaaaaaaaaaaaaaa..",
".aaaaaaaaaaaaaaaaaaaa.",
".aaaaaaaaddaaaaaaaaaa.",
".aaaaaaaaddaaaaaaaaaa.",
".aaaaaaaaaaaaaaaaaaaa.",
".aaaaaaaaaaaaaaaaaaaa.",
".aaaaaaaaaaaaaaaaaaaa.",
".aaaaaaaaaaaaaaaaaaaa."],
heart:[
".rrr...rrr.",
"rrrrr.rrrrr",
"rrWrrrrrrrr",
"rrrrrrrrrrr",
".rrrrrrrrr.",
"..rrrrrrr..",
"...rrrrr...",
"....rrr....",
".....r....."],
pilgrim:[
"....nnnn....",
"...nnnnnn...",
"...nnnnnn...",
"....nnnn....",
"...wwwwnn...",
"..wwwwwwnn..",
"..wwwwwwnn..",
"..wwwwwwww..",
"..wwwwwwww..",
"..wwwwwwww..",
"..wwwwwwww..",
"..wwwwwwww..",
"...ww..ww...",
"...nn..nn..."],
smallpearl:[
"..ww..",
".wwww.",
"wwwwww",
"wwwwww",
".wwww.",
"..ww.."],
/* people */
boy:[
"........................",
".........rrrrrr.........",
".......rrrWrWrWrr.......",
"......rKKkkkkkkkkr......",
".....rKKkkkkkkkkkkr.....",
"....rWrWrWrWrWrWrWrr....",
"...rWrWrWrWnnrWrWrWrr...",
"...rrWrWrnnnnnnWrWrWr...",
"...rWrnnnnnnnnnnnnWrr...",
"...rrnnkknnnnnnkknnWr...",
"...rWnnkknnnnnnkknnrr...",
"...rrnnnnnnnnnnnnnnWr...",
"...rWnppnnnnnnnnppnrr...",
"...rrnnnnnkkkknnnnnWr...",
"...rWrnnnnnnnnnnnnWrr...",
"..rWrWrnnnnnnnnnnWrWrr..",
"..rrWrr.wnnnnnnw.rWrWr..",
"..rWrWrwwwwwwwwwwWrWrr..",
"..rrWrwwwwwwewwwwwWrWr..",
"..rWrwwwwwwwewwwwwwWrr..",
"..rrwwwwwwwwewwwwwwwWr..",
"..www.wwwwwwwwwwww.www..",
"..www.wwwwwwwwwwww.www..",
"...nn.wwwwwwwwwwww.nn...",
"...nn.wwwwwwwwwwww.nn...",
".....wwwwwwwwwwwwww.....",
".....wwwwwwwwwwwwww.....",
".....wwwwwwwwwwwwww.....",
"......nnnn....nnnn......",
"......dddd....dddd......"],
girl:[
"..........pppp..........",
".........pp..pp.........",
".......hhhhhhhhhh.......",
".....hhhhhhhhhhhhhh.....",
"....hhhhhhhhhhhhhhhh....",
"....hhhnnnnnnnnnnhhh....",
"...hhhnnnnnnnnnnnnhhh...",
"...hhnnnnnnnnnnnnnnhh...",
"...hhnnkknnnnnnkknnhh...",
"...hhnnkknnnnnnkknnhh...",
"...hhnnnnnnnnnnnnnnhh...",
"...hhnppnnnnnnnnppnhh...",
"...hhnnnnnkkkknnnnnhh...",
"...hhhnnnnnnnnnnnnhhh...",
"...hhhhnnnnnnnnnnhhhh...",
"...hhhh..nnnnnn..hhhh...",
"....hh.vvvvvvvvvv.hh....",
"......vvvvvvvvvvvv......",
".....vvvvvvvvvvvvvv.....",
"....nvvvvvvwwvvvvvvn....",
"....nvvvvvvwwvvvvvvn....",
".....vvvvvvvvvvvvvv.....",
"....vvvvvvvvvvvvvvvv....",
"....vvvvvvvvvvvvvvvv....",
"...vvvvvvvvvvvvvvvvvv...",
"...vvvvvvvvvvvvvvvvvv...",
"...vvvvvvvvvvvvvvvvvv...",
".......nn......nn.......",
".......dd......dd......."],
farmer:[
"........yyyyyyyy........",
".......yddddddddy.......",
"..yyyyyyyyyyyyyyyyyyyy..",
".....rrnnnnnnnnnnWr.....",
".....rWnnknnnnknnrr.....",
".....rrnnknnnnknnWr.....",
".....rWnnnnnnnnnnrr.....",
".....rrnnnhhhhnnnWr.....",
".....rWrnhnnnnhnWrr.ddd.",
"....rWrWrWnnnnrWrWrr.d..",
"....rrWssssssssssrWr.d..",
"...rrWrssssesssssWrr.d..",
"...ssssssssessssssss.d..",
"...sss.ssssessssssssnn..",
"...sss.sssssssssssssnn..",
"...nn..ssssssssss....d..",
".......ssssssssss....d..",
".......ssssssssss...eee.",
".......ssssssssss...eee.",
".......ssssssssss....e..",
"........nnn..nnn........",
"........ddd..ddd........"],
fireman:[
".......rrrrrrrrrr.......",
"......rrrrryyrrrrr......",
"....rrrrrrrrrrrrrrrr....",
"........nnnnnnnn........",
".......nnnnnnnnnn.......",
".......nnkknnkknn.......",
".......nnnnnnnnnn.......",
".......nnnkkkknnn.......",
"........nnnnnnnn........",
".........nnnnnn.........",
"......rrrrrrrrrrrr......",
".....rrrrrrrrrrrrrr.....",
"....yyyyyyyyyyyyyyyy....",
"...nrrrrrrrrrrrrrrrrn...",
"...nrrrrrrrrrrrrrrrrn...",
".....yyyyyyyyyyyyyy.....",
".....KKKKKKKKKKKKKK.....",
".....KKKKKKK.KKKKKK.....",
".....KKKKKK...KKKKK.....",
".....KKKKKK...KKKKK.....",
".....KKKKKK...KKKKK.....",
".....kkkkkk...kkkkk....."],
/* station icons 16x16 */
st_makkah:[
"..yy............",
".yyyy...........",
"gggggg..........",
"gWWWWg..........",
"gWkWWg..........",
"gWkkWgxxxxxxxxx.",
"gWWWWgxxxxxxxxx.",
"ggggggyyyyyyyyy.",
".ssss.xxxxxxxxx.",
".ssss.xxxxxyyxx.",
".ssss.xxxxxyyxx.",
".ssss.xxxxxyyxx.",
".ssss.xxxxxxxxx.",
"wwwwwwwwwwwwwwww"],
st_madinah:[
".....y.......y..",
".....y.......w..",
"....ggg......w..",
"..ggggggg...www.",
".ggggggggg..www.",
".ggggggggg.wwwww",
".ggggggggg..www.",
"..wwwwwww...www.",
"wwwwwwwwwwwwwwww",
"wwawwawwawwawwaw",
"wwawwawwawwawwaw",
"wwwwwwwwwwwwwwww",
"ssssssssssssssss"],
st_riyadh:[
"...c..c.........",
"..cc..cc........",
"..ceeeec........",
"..c....c.....e..",
"..c....c.....e..",
"..cc..cc....yyy.",
"..cccccc....yyy.",
"..cccccc.....e..",
"..cccccc.....e..",
"..cccccc....eee.",
"..cccccc....eee.",
"..cccccc...eeeee",
".cccccccc..eeeee",
"ssssssssssssssss"],
st_jeddah:[
"......cWWc......",
".....cc..cc.....",
"....c..cc..c....",
"....c..cc..c....",
"...c...cc...c...",
".......cc.......",
"...c...cc...c...",
".......cc.......",
".......cc.......",
".......cc.......",
"......cccc......",
"bbbbbbbbbbbbbbbb",
"bbcbbbbbbbbbcbbb",
"bbbbbbbbbbbbbbbb"],
st_alula:[
"................",
"..ooooo.........",
".ooooooo........",
".oooooooo.ooo...",
".oooooooooooooo.",
".ooooooooooooooo",
".ooooooooooooooo",
".oo...oooooooooo",
".o.....ooooooooo",
".o.....ooooooooo",
".o.....ooooooooo",
".oo....ooooooooo",
"ooo...oooooooooo",
"ssssssssssssssss"],
st_abha:[
"ee..............",
"..ee............",
"....ee..........",
"......ee........",
"........ee......",
"........e.ee....",
"......rrrrr.ee..",
"..l...rWWWr...ee",
".lll..rWWWr.....",
"lllll.rrrrr..g..",
"llllll......ggg.",
"lllllll...ggggg.",
"llllllll.ggggggg",
"gggggggggggggggg"],
st_east:[
".......e........",
".......e........",
"......wwww......",
"...bbbbbbbbbb...",
"...wwwwwwwwww...",
".....wwwwww.....",
"......wwww......",
".......ww.......",
".......ww.......",
".......ww.......",
".......ww.......",
"....ssssssss....",
"bbbbbbbbbbbbbbbb",
"bbcbbbbbbbbbcbbb"],
st_qassim:[
".....ll..ll.....",
"...llll..llll...",
".llll.gggg.llll.",
"lll..llggll..lll",
"l...ll.dd.ll...l",
"...ll.odddo.ll..",
"..l...oddoo...l.",
"......ooddo.....",
".......dd.......",
"........dd......",
"........dd......",
"........dd......",
".......dddd.....",
"ssssssssssssssss"],
/* UI icons 12x12 */
i_speaker:[
"......w.....",
".....ww..w..",
"....www...w.",
"wwwwwww.w..w",
"wwwwwww..w.w",
"wwwwwww..w.w",
"wwwwwww.w..w",
"....www...w.",
".....ww..w..",
"......w....."],
i_mute:[
"......w.....",
".....ww.....",
"....www.r..r",
"wwwwwww..rr.",
"wwwwwww..rr.",
"wwwwwww.r..r",
"wwwwwww.....",
"....www.....",
".....ww.....",
"......w....."],
i_music:[
"....wwwwwwww",
"....wwwwwwww",
"....w......w",
"....w......w",
"....w......w",
"....w......w",
".www....www.",
"wwww...wwww.",
"www....www.."],
i_musicoff:[
"....wwwwwwww",
"....wwwwwwww",
"....w......w",
"....w....r.w",
"....w...r..w",
"....w..r...w",
".www..r.www.",
"wwww.r.wwww.",
"www.r..www.."],
i_map:[
"sss.sss.sss.",
"slsssssslss.",
"sllsssssslls",
"slllsslsslls",
"sslllllsssls",
"sssllllsssss",
"ssssllssrsss",
"sssssssrrrss",
"ssssssssrsss",
"sss.sss.sss."],
i_book:[
"gggggggggg..",
"ggggggggggw.",
"gggyyyygggw.",
"ggyggggyggw.",
"ggyggggyggw.",
"ggyggggyggw.",
"gggyyyygggw.",
"ggggggggggw.",
"ggggggggggw.",
"gggggggggg.."],
i_medal:[
"gg......gg..",
".gg....gg...",
"..gg..gg....",
"...gggg.....",
"...yyyy.....",
"..yyyyyy....",
".yyyWyyyy...",
".yyyyyyyy...",
".yyyyyyyy...",
"..yyyyyy....",
"...yyyy....."],
i_flag:[
"e...........",
"eggggggg....",
"egggggggg...",
"eggwwwwggg..",
"eggggggggg..",
"egggggggg...",
"eggggggg....",
"e...........",
"e...........",
"e...........",
"ee.........."],
i_star:[
".....y.....",
"....yyy....",
"yyyyyyyyyyy",
".yyyyyyyyy.",
"..yyyyyyy..",
"..yyyyyyy..",
".yyyy.yyyy.",
".yy.....yy."],
i_lock:[
"...eeee...",
"..ee..ee..",
"..e....e..",
"..e....e..",
"yyyyyyyyyy",
"yyyyyyyyyy",
"yyyykkyyyy",
"yyyykkyyyy",
"yyyyyyyyyy",
"yyyyyyyyyy"],
i_check:[
"..........ll",
".........lll",
"........lll.",
"ll.....lll..",
"lll...lll...",
".lll.lll....",
"..lllll.....",
"...lll......"],
i_back:[
"......w.....",
"......ww....",
"......www...",
"wwwwwwwwww..",
"wwwwwwwwwww.",
"wwwwwwwwww..",
"......www...",
"......ww....",
"......w....."],
i_home:[
".....rr.....",
"....rrrr....",
"...rrrrrr...",
"..rrrrrrrr..",
".rrrrrrrrrr.",
"..wwwwwwww..",
"..wwwddwww..",
"..wwwddwww..",
"..wwwddwww.."],
mini:[
"....ll.ll...",
"...lll.lll..",
".....gg.....",
"..qqqqqqqq..",
".qttttttttq.",
".qtmmttmmtq.",
".qttttttttq.",
".qtttmmtttq.",
"..qqqqqqqq..",
"...qqggqq...",
"..qqqqqqqq..",
"...ee..ee...",
"...gg..gg..."],
date1:[
"..dd..",
".dddd.",
"dddddd",
"dddddd",
".dddd.",
"..dd.."],
i_play:[
"ww......",
"wwww....",
"wwwwww..",
"wwwwwwww",
"wwwwww..",
"wwww....",
"ww......"],
};

/* ---------- sprite renderer: flat grid → shaded + outlined canvas */
function gridFrom(rows){ const h = rows.length, w = Math.max(...rows.map(r=>r.length)); return {w, h, get:(x,y)=> (x<0||y<0||x>=w||y>=h) ? '.' : (rows[y][x] || '.')}; }
function renderGrid(g, {shade=true, outline=true, flip=false}={}){
  const M = outline ? 1 : 0, W = g.w + 2*M, H = g.h + 2*M;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d'); const img = ctx.createImageData(W, H); const D = img.data;
  const at = (x,y) => { const ch = g.get(flip ? g.w-1-x : x, y); return ch; };
  const put = (x,y,rgb) => { const i = ((y+M)*W + (x+M))*4; D[i]=rgb[0]; D[i+1]=rgb[1]; D[i+2]=rgb[2]; D[i+3]=255; };
  const isRamp = ch => PAL[ch] && PAL[ch].r;
  for(let y=0;y<g.h;y++) for(let x=0;x<g.w;x++){
    const ch = at(x,y); if(ch==='.' || !PAL[ch]) continue; const p = PAL[ch];
    if(!p.r){ put(x,y,p.flat); continue; }
    let tone = 1;
    if(shade){
      const diff = (xx,yy) => { const n = at(xx,yy); return n==='.' || (isRamp(n) && n!==ch); };
      if(diff(x,y+1) || diff(x+1,y)) tone = 0;
      else if(at(x,y-1)==='.' || at(x-1,y)==='.') tone = 2;
    }
    put(x,y,p.rgb[tone]);
  }
  if(outline){
    for(let y=-1;y<=g.h;y++) for(let x=-1;x<=g.w;x++){
      if(at(x,y)!=='.' && x>=0 && y>=0 && x<g.w && y<g.h) continue;
      const ns = [[x,y+1],[x,y-1],[x+1,y],[x-1,y]].map(([a,b])=>at(a,b)).filter(ch=>ch!=='.' && PAL[ch]);
      if(!ns.length) continue;
      const i = ((y+M)*W + (x+M))*4; const o = PAL[ns[0]].out;
      D[i]=o[0]; D[i+1]=o[1]; D[i+2]=o[2]; D[i+3]=255;
    }
  }
  ctx.putImageData(img, 0, 0); return c;
}

/* ---------- procedural Barem (32x40 grid, same pipeline) */
function baremGrid(state='happy'){
  const W = 35, H = 42; const G = Array.from({length:H}, () => Array(W).fill('.'));
  const R = (x,y,w,h,ch) => { for(let j=y;j<y+h;j++) for(let i=x;i<x+w;i++) if(j>=0&&j<H&&i>=0&&i<W) G[j][i] = ch; };
  const P = (x,y,ch) => { if(y>=0&&y<H&&x>=0&&x<W) G[y][x] = ch; };
  const RR = (x,y,w,h,ch,cut=2) => { R(x,y,w,h,ch); for(let k=0;k<cut;k++){ for(let m=0;m<cut-k;m++){ P(x+m,y+k,'.'); P(x+w-1-m,y+k,'.'); P(x+m,y+h-1-k,'.'); P(x+w-1-m,y+h-1-k,'.'); } } };
  const ox = 1, oy = 1; // grid is padded so raised arms fit
  // sprout
  R(ox+15,oy+3,2,6,'g');
  RR(ox+8,oy+2,7,4,'l',1); R(ox+10,oy+6,5,1,'l');
  RR(ox+17,oy+0,8,5,'l',1); R(ox+17,oy+5,4,1,'l');
  // legs + feet
  R(ox+10,oy+35,4,3,'e'); R(ox+18,oy+35,4,3,'e'); R(ox+9,oy+38,6,2,'g'); R(ox+17,oy+38,6,2,'g');
  // arms
  const armDown = x => RR(x,oy+26,3,8,'q',1);
  const cheer = state==='cheer' || state==='celebrate';
  const upL = cheer, upR = cheer || state==='wave';
  if(!upL) armDown(ox+5);
  if(state==='help') R(ox+24,oy+27,6,3,'q'); else if(!upR) armDown(ox+24);
  // body
  RR(ox+8,oy+25,16,11,'q',2);
  // head + ears
  R(ox+3,oy+13,2,6,'g'); R(ox+27,oy+13,2,6,'g');
  RR(ox+5,oy+8,22,17,'q',3);
  if(upL){ RR(ox-1,oy+13,3,10,'q',1); R(ox+1,oy+22,7,3,'q'); }
  if(upR){ RR(ox+30,oy+13,3,10,'q',1); R(ox+24,oy+22,7,3,'q'); }
  RR(ox+8,oy+11,16,11,'t',2);
  // face
  const eyes = {
    happy:()=>{ P(ox+11,oy+15,'m'); P(ox+12,oy+14,'m'); P(ox+13,oy+15,'m'); P(ox+18,oy+15,'m'); P(ox+19,oy+14,'m'); P(ox+20,oy+15,'m'); },
    round:()=>{ R(ox+11,oy+14,2,3,'m'); R(ox+19,oy+14,2,3,'m'); },
    wide:()=>{ R(ox+10,oy+13,3,3,'m'); R(ox+19,oy+13,3,3,'m'); P(ox+11,oy+14,'t'); P(ox+20,oy+14,'t'); },
  };
  const mouth = {
    smile:()=>{ P(ox+14,oy+18,'m'); R(ox+15,oy+19,2,1,'m'); P(ox+17,oy+18,'m'); },
    open:()=>{ R(ox+14,oy+18,4,1,'m'); R(ox+15,oy+19,2,1,'m'); },
    o:()=>{ R(ox+15,oy+18,2,2,'m'); },
    soft:()=>{ R(ox+14,oy+19,4,1,'m'); },
  };
  if(state==='surprised'){ eyes.wide(); mouth.o(); }
  else if(state==='help'){ eyes.round(); mouth.soft(); }
  else { eyes.happy(); (cheer ? mouth.open : mouth.smile)(); }
  P(ox+9,oy+19,'p'); P(ox+22,oy+19,'p');
  // chest
  if(state==='medal'){ R(ox+13,oy+25,2,4,'g'); R(ox+17,oy+25,2,4,'g'); RR(ox+12,oy+28,8,7,'y',2); R(ox+15,oy+30,2,3,'g'); }
  else if(state==='help'){ R(ox+13,oy+28,2,1,'r'); R(ox+17,oy+28,2,1,'r'); R(ox+12,oy+29,8,2,'r'); R(ox+13,oy+31,6,1,'r'); R(ox+14,oy+32,4,1,'r'); R(ox+15,oy+33,2,1,'r'); P(ox+13,oy+29,'W'); }
  else { RR(ox+13,oy+28,6,5,'g',1); P(ox+15,oy+29,'m'); P(ox+16,oy+30,'m'); P(ox+15,oy+31,'m'); P(ox+14,oy+30,'m'); }
  if(state==='map'){ R(ox+21,oy+28,10,8,'s'); R(ox+23,oy+30,4,3,'l'); R(ox+27,oy+31,2,2,'l'); P(ox+25,oy+34,'r'); }
  if(state==='celebrate'){ P(0,2,'y'); P(1,3,'y'); P(0,4,'y'); P(W-2,6,'r'); P(W-1,7,'r'); P(2,24,'b'); P(W-2,22,'y'); P(W-3,1,'l'); P(W-2,2,'l'); }
  return gridFrom(G.map(r=>r.join('')));
}

/* ---------- cache + html helpers */
const ART = new Map();
function cacheCanvas(key, make){ if(!ART.has(key)){ const c = make(); ART.set(key, {url:c.toDataURL(), w:c.width, h:c.height}); } return ART.get(key); }
function sprite(name, opt={}){ return cacheCanvas('s:'+name+(opt.flip?':f':''), () => renderGrid(gridFrom(SPR[name]), opt)); }
function barem(state='happy'){ return cacheCanvas('b:'+state, () => renderGrid(baremGrid(state))); }
function imgTag(a, cls='', alt=''){ return `<img class="px ${cls}" src="${a.url}" style="--w:${a.w};--h:${a.h}" alt="${alt}" draggable="false">`; }
function S_(name, cls='', alt=''){ return imgTag(sprite(name), cls, alt); }
function B_(state='happy', cls=''){ return imgTag(barem(state), 'barem '+cls, 'برعم'); }

/* ---------- pixel text: supersampled coverage → crisp pixels on the grid */
const FONT = '"Baloo Bhaijaan 2", Tahoma, sans-serif';
function textCanvas(text, {size=14, color='#1b1e2b', outline=null, shadow=null, maxW=0, align='center', gap=2, cov=.3}={}){
  const SS = 4; const m = document.createElement('canvas').getContext('2d'); m.font = `800 ${size*SS}px ${FONT}`; m.direction = 'rtl';
  const lines = [];
  const paras = String(text).split('\n');
  for(const para of paras){
    if(!maxW){ lines.push(para); continue; }
    let cur = '';
    for(const w of para.split(' ')){ const t = cur ? cur+' '+w : w; if(m.measureText(t).width/SS > maxW - 2 && cur){ lines.push(cur); cur = w; } else cur = t; }
    lines.push(cur);
  }
  const lw = lines.map(l => Math.ceil(m.measureText(l).width/SS));
  const pad = 2, lineH = Math.ceil(size*1.25) + gap;
  const W = Math.max(1, ...lw) + pad*2, H = lines.length*lineH + pad*2 + Math.ceil(size*.35);
  const big = document.createElement('canvas'); big.width = W*SS; big.height = H*SS; const b = big.getContext('2d');
  b.font = m.font; b.direction = 'rtl'; b.textBaseline = 'alphabetic'; b.fillStyle = '#000';
  lines.forEach((l,i) => { const x = align==='right' ? W-pad : align==='left' ? pad+lw[i] : (W+lw[i])/2; b.textAlign = 'right'; b.fillText(l, x*SS, (pad + i*lineH + size*1.02)*SS); });
  const src = b.getImageData(0,0,big.width,big.height).data;
  const on = new Uint8Array(W*H);
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){ let s = 0; for(let j=0;j<SS;j++) for(let i=0;i<SS;i++) s += src[((y*SS+j)*big.width + x*SS+i)*4+3]; if(s/(SS*SS*255) > cov) on[y*W+x] = 1; }
  const ex = (outline?2:0) + (shadow?1:0); const OW = W + (outline?2:0), OH = H + ex;
  const c = document.createElement('canvas'); c.width = OW; c.height = OH; const ctx = c.getContext('2d'); const img = ctx.createImageData(OW, OH); const D = img.data;
  const off = outline ? 1 : 0;
  const set = (x,y,rgb) => { if(x<0||y<0||x>=OW||y>=OH) return; const i=(y*OW+x)*4; D[i]=rgb[0]; D[i+1]=rgb[1]; D[i+2]=rgb[2]; D[i+3]=255; };
  const has = (x,y) => x>=0&&y>=0&&x<W&&y<H&&on[y*W+x];
  if(shadow){ const sc = hexRGB(shadow); for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(has(x,y)) set(x+off, y+off+1+(outline?1:0), sc); }
  if(outline){ const oc = hexRGB(outline); for(let y=-1;y<=H;y++) for(let x=-1;x<=W;x++) if(!has(x,y) && (has(x+1,y)||has(x-1,y)||has(x,y+1)||has(x,y-1))) set(x+off,y+off,oc); }
  const fc = hexRGB(color); for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(has(x,y)) set(x+off,y+off,fc);
  ctx.putImageData(img,0,0); return c;
}
function T(text, opt={}, cls=''){
  const key = 't:'+JSON.stringify([text, opt]);
  const a = cacheCanvas(key, () => textCanvas(text, opt));
  return `<img class="px txt ${cls}" src="${a.url}" style="--w:${a.w};--h:${a.h}" alt="${String(text).replace(/"/g,'&quot;')}" draggable="false">`;
}

/* ---------- raster helpers for scenes / map */
const BAYER = [[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
function rng(seed){ let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
function Raster(W, H){
  const c = document.createElement('canvas'); c.width = W; c.height = H; const ctx = c.getContext('2d'); const img = ctx.createImageData(W, H); const D = img.data;
  const R = {W, H, c,
    set(x,y,col){ x|=0; y|=0; if(x<0||y<0||x>=W||y>=H) return; const rgb = typeof col==='string' ? hexRGB(col) : col; const i=(y*W+x)*4; D[i]=rgb[0]; D[i+1]=rgb[1]; D[i+2]=rgb[2]; D[i+3]=255; },
    get(x,y){ const i=(y*W+x)*4; return [D[i],D[i+1],D[i+2],D[i+3]]; },
    rect(x,y,w,h,col){ const rgb = typeof col==='string'?hexRGB(col):col; for(let j=y;j<y+h;j++) for(let i=x;i<x+w;i++) R.set(i,j,rgb); },
    bands(y0, y1, cols){ const n = cols.length-1; const rgbs = cols.map(hexRGB);
      for(let y=y0;y<y1;y++){ const t = (y-y0)/Math.max(1,(y1-y0-1))*n; const k = Math.min(n-1, Math.floor(t)); const f = t-k;
        for(let x=0;x<W;x++) R.set(x,y, f*16 > BAYER[y&3][x&3]+.5 ? rgbs[k+1] : rgbs[k]); } },
    disc(cx,cy,r,col){ const rgb = hexRGB(col); for(let y=-r;y<=r;y++) for(let x=-r;x<=r;x++) if(x*x+y*y <= r*r+r*.8) R.set(cx+x,cy+y,rgb); },
    ellipse(cx,cy,rx,ry,col){ const rgb = hexRGB(col); for(let y=-ry;y<=ry;y++) for(let x=-rx;x<=rx;x++) if((x*x)/(rx*rx)+(y*y)/(ry*ry) <= 1.02) R.set(cx+x,cy+y,rgb); },
    ridge(base, amp, col, seed, rough=.5, topCol=null){ const r = rng(seed); const hs = []; let h = r(); let v = 0;
      for(let x=0;x<W;x++){ v += (r()-.5)*rough; v *= .92; h = Math.max(0, Math.min(1, h + v*.18)); hs.push(h); }
      for(let x=0;x<W;x++){ const top = Math.round(base - hs[x]*amp); for(let y=top;y<H;y++) R.set(x,y, (y===top && topCol) ? topCol : col); }
      return hs; },
    stamp(name, x, y, opt={}){ const a = renderGrid(gridFrom(SPR[name]), opt); R.canvas(a, x, y); },
    canvas(cv, x, y){ const s = cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;
      for(let j=0;j<cv.height;j++) for(let i=0;i<cv.width;i++){ const k=(j*cv.width+i)*4; if(s[k+3]>127) R.set(x+i,y+j,[s[k],s[k+1],s[k+2]]); } },
    done(){ ctx.putImageData(img,0,0); return c; } };
  return R;
}

/* ---------- station scenes (drawn at the size the layout asks for)
   Modern city scenes live in js/scenes/*.js and register themselves in SCENES;
   each gets the raster plus the shared helpers below. */
const SCENES = {};
function sceneCanvas(id, W, H){
  const R = Raster(W, H); const r = rng(id.length*977 + W*13 + H);
  const horizon = Math.round(H*.62);
  const sun = (x,y,rad,col='#f7d774') => { R.disc(x,y,rad,col); R.disc(x-1,y-1,Math.max(1,rad-3),'#fff0b0'); };
  const clouds = n => { for(let i=0;i<n;i++){ const cx = Math.round(r()*W), cy = Math.round(4+r()*H*.25), w = 8+Math.round(r()*10);
    R.ellipse(cx,cy,w,3,'#ffffff'); R.ellipse(cx+Math.round(w*.35),cy-2,Math.round(w*.5),3,'#ffffff'); R.rect(cx-w,cy+2,w*2,1,'#e4eef2'); } };
  const birds = n => { for(let i=0;i<n;i++){ const x = Math.round(r()*W), y = Math.round(6+r()*H*.3); R.set(x,y,'#5f676c'); R.set(x+1,y+1,'#5f676c'); R.set(x+2,y,'#5f676c'); R.set(x+3,y+1,'#5f676c'); R.set(x+4,y,'#5f676c'); } };
  if(SCENES[id]){ SCENES[id]({R, W, H, r, horizon, sun, clouds, birds}); return R.done(); }
  if(id==='beach'){
    const sea = Math.round(H*.24), shore = Math.round(H*.42);
    R.bands(0, sea, ['#8fd0ee','#d6f0f6']); sun(Math.round(W*.86), Math.round(H*.1), 5);
    R.bands(sea, shore, ['#5fb0d8','#3c90c0']); for(let y=sea+2;y<shore;y+=3) for(let x=(y*5)%9;x<W;x+=11) R.set(x,y,'#9fd8f5');
    R.stamp('boat', Math.round(W*.2), sea-8, {});
    for(let x=0;x<W;x++){ const wy = shore + Math.round(Math.sin(x*.35)*1.5); R.set(x,wy,'#ffffff'); R.set(x,wy+1,'#e4f8ff'); for(let y=wy+2;y<H;y++) R.set(x,y,'#f2dfb0'); }
    for(let y=shore+5;y<H;y+=4) for(let x=(y*7)%13;x<W;x+=13) R.set(x,y,'#e0c890');
  }
  return R.done();
}
function sceneTag(id, W, H){ const a = cacheCanvas(`sc:${id}:${W}x${H}`, () => sceneCanvas(id, W, H)); return imgTag(a, 'scene-img'); }

/* ---------- map of the Kingdom: rasterised outline, 8 regions, terrain */
const KSA = [[34.95,29.35],[36.07,29.2],[36.5,29.5],[37.5,30.0],[38.0,30.5],[37.0,31.5],[39.2,32.15],[40.4,31.9],[42.1,31.1],[44.7,29.2],[46.5,29.1],[47.4,29.0],[48.4,28.5],[48.8,27.6],[49.3,27.1],[50.1,26.2],[50.2,25.6],[50.8,24.75],[51.4,24.6],[52.0,23.0],[55.2,22.7],[55.7,22.0],[55.0,20.0],[52.0,19.0],[49.1,18.6],[48.2,18.2],[47.5,17.1],[46.4,17.2],[45.2,17.4],[44.2,17.4],[43.3,17.5],[43.1,16.7],[42.8,16.4],[42.6,16.8],[41.8,17.9],[40.9,19.5],[39.6,20.9],[39.1,21.7],[38.9,22.5],[38.3,23.7],[37.5,24.3],[37.2,24.9],[36.6,25.8],[36.2,26.6],[35.6,27.4],[35.1,28.1],[34.6,28.1]];
const MAP_LON = [33.6, 56.4], MAP_LAT = [15.6, 32.8];
function mapProj(W, H){ const sx = W/(MAP_LON[1]-MAP_LON[0]), sy = H/(MAP_LAT[1]-MAP_LAT[0]); const s = Math.min(sx, sy);
  const ox = (W - (MAP_LON[1]-MAP_LON[0])*s)/2, oy = (H - (MAP_LAT[1]-MAP_LAT[0])*s)/2;
  return ([lon,lat]) => [ox + (lon-MAP_LON[0])*s, oy + (MAP_LAT[1]-lat)*s]; }
function mapCanvas(W, H, stations, earned, highlight=null){
  const proj = mapProj(W, H);
  const mask = document.createElement('canvas'); mask.width = W; mask.height = H; const m = mask.getContext('2d');
  const pts = KSA.map(proj); const n = pts.length; const mid = (a,b) => [(a[0]+b[0])/2,(a[1]+b[1])/2];
  m.beginPath(); let st = mid(pts[n-1], pts[0]); m.moveTo(st[0], st[1]);
  for(let i=0;i<n;i++){ const e = mid(pts[i], pts[(i+1)%n]); m.quadraticCurveTo(pts[i][0], pts[i][1], e[0], e[1]); }
  m.fillStyle = '#000'; m.fill(); const md = m.getImageData(0,0,W,H).data;
  const land = new Uint8Array(W*H); for(let i=0;i<W*H;i++) land[i] = md[i*4+3] > 127 ? 1 : 0;
  const L = (x,y) => x>=0&&y>=0&&x<W&&y<H&&land[y*W+x];
  const poly = ptsLL => { const q = ptsLL.map(proj); m.clearRect(0,0,W,H); m.beginPath(); q.forEach((p,i)=> i ? m.lineTo(p[0],p[1]) : m.moveTo(p[0],p[1])); m.closePath(); m.fill(); const d = m.getImageData(0,0,W,H).data; const out = new Uint8Array(W*H); for(let i=0;i<W*H;i++) out[i] = d[i*4+3]>127; return out; };
  const redSea = poly([...KSA.slice(32), KSA[0], [34.9,29.55],[34.4,28.2],[33.8,27.4],[34.3,26.0],[35.2,24.2],[35.8,23.2],[36.9,22.0],[37.3,20.8],[37.4,19.2],[38.2,18.0],[38.9,16.8],[39.3,15.5],[43.0,15.5],[42.9,16.0]]);
  const gulf = poly([...KSA.slice(12,18),[50.9,25.5],[51.2,26.2],[51.6,25.9],[51.6,25.2],[51.6,24.5],[52.6,24.2],[53.6,24.1],[54.6,24.6],[55.5,25.5],[56.1,26.2],[56.6,26.3],[56.6,27.3],[56.0,27.1],[54.5,26.6],[53.0,26.9],[51.5,27.8],[50.8,28.9],[50.1,30.0],[48.9,30.0],[48.4,29.9],[47.9,29.5],[48.1,29.2]]);
  const isSea = (x,y) => x>=0&&y>=0&&x<W&&y<H && !land[y*W+x] && (redSea[y*W+x] || gulf[y*W+x]);
  const sp = stations.map(s => proj(s.pos));
  const reg = new Int8Array(W*H).fill(-1);
  for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(land[y*W+x]){ let b=-1, bd=1e9; sp.forEach((p,i)=>{ const d=(p[0]-x)**2+(p[1]-y)**2; if(d<bd){bd=d;b=i;} }); reg[y*W+x] = b; }
  const R = Raster(W, H); const r = rng(W*31+H);
  const sea = ['#3f8fc4','#4fa4d8','#62b4e2'];
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    if(L(x,y)) continue;
    if(!isSea(x,y)){ const nb = BAYER[y&3][x&3]; R.set(x,y, nb<2 ? '#cdc4ac' : '#d9d1ba'); if(((x+y)%3===0) && (L(x+1,y)||L(x-1,y)||L(x,y+1)||L(x,y-1))) R.set(x,y,'#a89f86'); continue; }
    let d = 99; for(let k=1;k<6;k++){ if(L(x+k,y)||L(x-k,y)||L(x,y+k)||L(x,y-k)){ d = k; break; } }
    let col = sea[1]; if(d<=2) col = sea[2]; else if(d>=6 && ((x+y)&1)===0 && (BAYER[y&3][x&3] < 6)) col = sea[0];
    if(((x*7 + y*13) % 37 === 0) && d>3){ R.set(x,y,'#9fd8f5'); R.set(x+1,y,'#9fd8f5'); continue; }
    R.set(x,y,col);
  }
  const west = x => x < W*.42;
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    if(!L(x,y)) continue; const id = reg[y*W+x]; const got = earned.has(stations[id].id); const hl = highlight===stations[id].id;
    const noise = BAYER[y&3][x&3];
    let base = got ? (noise<8 ? '#5cbf60' : '#6fcc70') : (noise<3 ? '#dcc58e' : '#e8d5a3');
    if(!got && x > W*.55 && y > H*.55 && ((x + Math.round(Math.sin(y*.5)*3)) % 7 === 0)) base = '#d9be82';
    if(hl && !got && noise<6) base = '#f7e3a0';
    R.set(x,y,base);
    const idR = x+1<W ? reg[y*W+x+1] : id, idD = y+1<H ? reg[(y+1)*W+x] : id;
    if(((idR!==id && idR>=0) || (idD!==id && idD>=0)) && ((x+y)&1)===0) R.set(x,y, got ? '#3a8f45' : '#c9a66b');
  }
  // mountains along the west (Hejaz + Asir)
  for(let i=0;i<22;i++){ const lat = 17.5 + i*.62, lon = 39.0 + (lat<21 ? (21-lat)*.9 + 1.4 : (lat<26 ? .6 - (lat-21)*.28 : -.8 - (lat-26)*.3));
    const [px,py] = proj([lon + (r()-.5)*.6, lat]); const x = Math.round(px), y = Math.round(py);
    if(!L(x,y) || !L(x-2,y+2) || !L(x+2,y+2)) continue; const got = earned.has(stations[reg[y*W+x]].id);
    const c1 = got ? '#2f7a3a' : '#a8744a', c2 = got ? '#3a8f45' : '#c08a58';
    R.set(x,y-1,c2); R.rect(x-1,y,3,1,c2); R.rect(x-2,y+1,5,1,c1); R.set(x,y-1,'#f4efe2'); }
  // coast outline
  for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(L(x,y) && (isSea(x+1,y)||isSea(x-1,y)||isSea(x,y+1)||isSea(x,y-1))) R.set(x,y,'#0e6b3a');
  for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(L(x,y) && !isSea(x+1,y) && !L(x+1,y) && x+1<W && ((x+y)&1)) R.set(x,y,'#8a7a5a');
  return {canvas:R.done(), proj};
}

/* ---------- generated badges, stamps and the big medal */
function badgeCanvas(icon, earned){
  const R = Raster(34, 40);
  const ribbon = earned ? ['#0e6b3a','#1f8f4e'] : ['#9aa3a8','#b8c0c4'];
  for(let y=0;y<10;y++){ R.rect(9+Math.floor(y*.3),y,5,1,ribbon[y%3?0:1]); R.rect(20-Math.floor(y*.3),y,5,1,ribbon[y%3?0:1]); }
  const ring = earned ? ['#c98a1a','#f7c948','#fff0a0'] : ['#6b7378','#9aa3a8','#d0d7da'];
  const cx = 17, cy = 23;
  for(let y=-16;y<=16;y++) for(let x=-16;x<=16;x++){ const d = Math.sqrt(x*x+y*y);
    if(d<=16){ let c = d>13.5 ? ring[1] : '#fdf6e3'; if(d>13.5 && (x+y)<-6) c = ring[2]; if(d>13.5 && (x+y)>8) c = ring[0]; if(d>15.3) c = '#1b1e2b'; if(!earned && d<=13.5) c = '#e6e2d6'; R.set(cx+x,cy+y,c); } }
  const ic = renderGrid(gridFrom(SPR[icon]), {});
  const tmp = Raster(ic.width, ic.height); tmp.canvas(ic,0,0);
  if(!earned){ const cv = tmp.done(); const cx2 = cv.getContext('2d'); const d = cx2.getImageData(0,0,cv.width,cv.height); for(let i=0;i<d.data.length;i+=4){ const g = (d.data[i]*.3+d.data[i+1]*.59+d.data[i+2]*.11)*.55+90; d.data[i]=d.data[i+1]=d.data[i+2]=g; } cx2.putImageData(d,0,0); R.canvas(cv, cx-Math.floor(cv.width/2), cy-Math.floor(cv.height/2)); }
  else R.canvas(ic, cx-Math.floor(ic.width/2), cy-Math.floor(ic.height/2));
  return R.done();
}
function stampCanvas(icon, earned){
  const R = Raster(44, 44); const col = earned ? '#0e6b3a' : '#cbbf9c';
  for(let y=-21;y<=21;y++) for(let x=-21;x<=21;x++){ const d = Math.sqrt(x*x+y*y); const a = Math.atan2(y,x);
    if(d>19.2 && d<=21 && (earned || Math.floor((a+Math.PI)*8)%2===0)) R.set(22+x,22+y,col);
    if(earned && d>15.8 && d<=16.8) R.set(22+x,22+y,col); }
  if(earned){ const ic = renderGrid(gridFrom(SPR[icon]), {}); R.canvas(ic, 22-Math.floor(ic.width/2), 22-Math.floor(ic.height/2)); }
  return R.done();
}
function medalCanvas(){
  const R = Raster(58, 70);
  for(let y=0;y<18;y++){ R.rect(14+Math.floor(y*.45),y,8,1,y%4?'#0e6b3a':'#1f8f4e'); R.rect(36-Math.floor(y*.45),y,8,1,y%4?'#0e6b3a':'#1f8f4e'); R.set(18+Math.floor(y*.45),y,'#f4efe2'); R.set(39-Math.floor(y*.45),y,'#f4efe2'); }
  const cx = 29, cy = 44;
  for(let y=-25;y<=25;y++) for(let x=-25;x<=25;x++){ const d = Math.sqrt(x*x+y*y); if(d>25) continue;
    let c = '#f7c948'; if(d>21){ c = ((Math.round(Math.atan2(y,x)*8)&1) ? '#f7c948' : '#e0a82e'); } if(d>24) c = '#1b1e2b';
    if(d<=21 && (x+y) < -14) c = '#fff0a0'; if(d<=21 && d>19) c = '#c98a1a'; R.set(cx+x,cy+y,c); }
  const sp = renderGrid(gridFrom(SPR.seedling), {}); R.canvas(sp, cx-Math.floor(sp.width/2), cy-Math.floor(sp.height/2)+1);
  return R.done();
}
function genTag(key, make, cls=''){ return imgTag(cacheCanvas(key, make), cls); }

/* ---------- textures used as CSS backgrounds (same integer scale) */
function textureURL(kind){
  return cacheCanvas('tx:'+kind, () => {
    if(kind==='sand'){ const R = Raster(32,32); const r = rng(7); for(let y=0;y<32;y++) for(let x=0;x<32;x++){ const v = r(); R.set(x,y, v<.06 ? '#e6d6ad' : v<.09 ? '#fbf1d6' : '#f3e7c6'); } return R.done(); }
    if(kind==='paper'){ const R = Raster(16,16); const r = rng(3); for(let y=0;y<16;y++) for(let x=0;x<16;x++){ const v = r(); R.set(x,y, v<.05 ? '#efe6cf' : '#fbf6ea'); } return R.done(); }
    if(kind==='sadu'){ const R = Raster(16,8); const rows = [
      "kkkkkkkkkkkkkkkk","wrrrrrrwwrrrrrrw","wwrrrrwwwwrrrrww","ywwrrwwyywwrrwwy","yywwwwyyyywwwwyy","ywwrrwwyywwrrwwy","wwrrrrwwwwrrrrww","kkkkkkkkkkkkkkkk"];
      const col = {k:'#1b1e2b', r:'#b03a2e', w:'#f4efe2', y:'#0e6b3a'}; rows.forEach((row,y)=>[...row].forEach((ch,x)=>R.set(x,y,col[ch]))); return R.done(); }
    if(kind==='dash'){ const R = Raster(8,8); for(let y=0;y<8;y++) for(let x=0;x<8;x++) R.set(x,y, (x+y)%8===0 ? '#e9efe6' : '#f4f7f1'); return R.done(); }
  });
}
