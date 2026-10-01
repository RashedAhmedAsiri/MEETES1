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
pencil:[
"..............pp..",
".............pppp.",
"............eeppp.",
"...........oyeep..",
"..........oyyye...",
".........oyyyy....",
"........oyyyy.....",
".......oyyyy......",
"......oyyyy.......",
".....oyyyy........",
"....oyyyy.........",
"...nnyyy..........",
"...nnny...........",
"..knn.............",
"..k..............."],
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
/* ---------- the flag of Saudi Arabia on its pole, waving gently. fw x fh is the cloth (2:3) in art
   pixels; the pole runs from the gold finial down to poleBottom. The cloth is drawn at the screen's
   own resolution (k device pixels per art pixel) so the Shahada, set in Amiri, stays sharp and
   correct at any size; the wave moves whole art-pixel columns, so its edges match the pixel art.
   As on the flag: green field, the Shahada in white, and under it a white sword whose hilt is on
   the fly side and whose point faces the hoist. */
const SHAHADA = 'لا إله إلا الله محمد رسول الله';
/* The flag itself (Shahada in thuluth and the sword) is the vector drawing from country-flag-icons
   (https://gitlab.com/catamphetamine/country-flag-icons), (c) 2020 @catamphetamine, MIT License,
   recoloured to the official green #006C35. */
const FLAG_SA = new Image();
FLAG_SA.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 513 342"><path d="M0 0h513v342H0z" fill="#fff"/><g fill="#006c35"><path d="M0 0v342h513V0zm218 76q1 2-2 5-3 2-1 4 3 4 0 6-2 1-5-1-6-6 0-14 6-4 8 0m-102 2 1 6q0 4-2 4-5 1-5-6l2-4zm39 1 1 2q-1 4-5 4-5 0-6-4c0-4 7-6 10-2m47 2q3 4 2 9c-1 2-22 19-24 19q-3 0-4-4l6-6 6-5v-3c-5-10 7-18 14-10m35-3q3 1 0 7-2 8-6 6c-3-1-3 14 0 19q2 4 7-1c2-3 2-5 2-15 0-12 0-13 2-13q5-2 5 13 1 11 3 13 3 6 6 3 3-2-1-12-3-12 1-16h9q2-2 9 1l6 2 1-2q4-4 6-1l3 17c3 16 3 16 7 24l15 30q1 6-4 5l-8-14-6-12 1 20c1 21 1 23-4 23q-4 2-4-15l-1-27-1-16-9-13c-8-12-8-13-11-13q-6-1-2 6l2 7q0 4 3 2 6-2 6 3-1 4-8 5l-5 2-5 2q-6 0-10-3-2-3-5 1-5 5-12 2-5-1-7-10l-1-3-1 3q-3 7-9 8-7 0-9-11-3-10 2-10 4-1 5 7l2 6q1 0 4-7 6-17 13-12h1c-1-1 2-10 4-11zm-97 10 2 16 1 9h4q5 2 6-1c2-1 2-2-1-11l-3-12 3-1 11 5V82q4-2 6 1l3 23 1 20h2q5 0 5 5 1 6 3 0 3-9 8-2 1 3 2 0 3-7 4-6c5 0 6 7 1 13q-3 3-7 3l-6 1q-5 4-10 0l-2-2v5c0 21-16 42-33 42q-21-1-23-21 0-5 2-6 4-1 6 6 1 12 12 13 14 2 24-15 6-11 1-5-12 18-28 11-7-5-9-17-2-6 1-7 5-3 6 6 1 12 10 12 7 0 13-8 5-8-1-7-11-1-8-12 8-11 17-5l3 2-1-12-4-22q-3 1 0 7c2 6 2 6 0 10l-5 5q-3 3-7 1h-5l-1 16c-1 19-1 20-4 21-4 1-4-2-4-19l1-15-3 1q-3 1-6-2c-2-2-2-2-3-14l-1-12q-2-1-2 10l-1 13q-3 6-8 4c-3-2-4-4-7-15q-4-15 2-14 4-1 5 8l1 5 1-6q0-13 9-12l6 2c2 3 2 4 2 14l1 11 2-1 1-8-2-16q-3-12 2-11 3-1 5 7m163-3q4 10 1 13-4 3-7-7-3-11 2-10zm12-3 3 7q2 6 1 8v16l2 27c2 22 2 21 6 21h3l-1-5-2-23-3-33c-2-16-1-19 3-19 3 0 8 14 6 16v24c5 47 5 48 0 47q-3-2-1 4l2 6q2 1 5-9 7-18 10-16 3 0 7 5 4 7 7 7 4-1 1-33l-1-21-10-12-9-15q0-5 8-1 5 2 6 6l2 6q3 4 1-4 0-10 3-10c4 0 9 10 7 13l-1 8q1 8 4 12l3 3-2-15c-2-16-2-19 1-20q3 0 5 4l4 5h2q6-4 8 9 0 8-4 8-3 0-4-6 1-8-3-5c-1 2-1 3 1 19l2 17 5 7c6 10 12 21 11 22q-2 3-5 2l-5-8-5-8 1 8c0 11 0 11-3 11q-5 3-5-7l-1-16c0-8-1-10-4-15l-4-5v19c1 21 0 25-5 28q-6 5-13-3l-4-5-4 9q-6 14-11 15-9-1-11-16-1-8-5-1c-3 5-12 13-19 17q-8 4-8-2-1-2 6-6c9-5 17-14 17-18l-5-78q2-4 5-1m89 5 4 6q1 1-2 3l-2 2 4 24q4 25 4 35c0 10 0 11-3 17q-7 13-19 14-8 0-7-2-2-4 7-6 15-2 14-23a708 708 0 0 0-8-75c3-2 3-1 8 5m-211 19 1 4q0 3 2 2 5 0 5 4c0 4-9 6-13 2-4-5 0-17 5-12m108 1h2l4-1q4 2 0 7-7 6-11-1v-5q3-2 5 0m55 2q3 4-1 6-2 0-1 5t-1 6q-1 2-10-6-8-7-6-9 3-4 7 0l2 2 2-3q5-3 8-1m-131 13c3 2 6 14 6 17q-1 6 6 1l10-4q5-1 7-4 4-9 10-12 10 0 11 9 0 7-16 13l-2 1 13 1c16 0 16 0 13 9q-2 7-4 7l-10 2q-19 3-17 9 1 2 4 3 6 3 3 7l-7 1q-13-2-21-10l-3-3-2 3q-7 10-19 13-10 2-15-10l-5 2q-18 10-19 8l-2-3c0-2 1-2 15-11l9-6q1-3 5-4c3 1 10-5 12-9q3-6-1-15l-2-8q1-5 6-6c3 0 8 5 8 7q-1 4-4 3v1l1 10c1 9-1 13-10 21l-7 6 2 3q5 9 15-2 10-8 10-23 0-10-6-24v-4q3-4 6 1m17 2q2 3 4 0 11-3 5 5c-4 5-12 5-15-1v-4zm118 5 1 2q1 2-7 8c-8 6-9 7-11 5q-5-4 6-10c8-6 8-6 11-5m-229 3q3 2-10 10-12 8-13 3-5-3 9-10 13-8 14-3m229 10c3 2 4 9 3 11q-3 3-6 1c-2-2-3-11-1-13q1-2 4 1m-172 7q3 3 2 7 1 5-3 5-3 1-3-3l-2-4q-3-3-1-6 4-2 7 1m-79 9 1 8q0 9 3 6 4-1 4 3-1 7-7 7-7-1-7-14-1-9 2-10zm168 12q0 4 3 2t4 3q-2 6-8 8l-4-2q-3-3-4-2-4 0-5-4l5-6q7-6 7-4 3 1 2 5m102 3q4 4 1 9-7 7-7-4t6-5m-42 73c0 2 1 2 12 2q24-1 22 11 0 7-6 10c-4 1-31 2-34 0q-2-1-2-6v-4h-82l-74-1c-16 0-28-10-28-10h92c91 0 92-1 92-2q-1-3 4-5c5-2 4 4 4 5"/><path d="m195 86 1 1 1-1-1-1q-2 0-1 1m84 5q-2 2 1 5l3 3-1-4-1-5zm-125 45q-3 3-1 4 5-1 6-4zm110-7q-4 5 0 3 6-4 2-4zm-31 30q0 6 4 8l5 4q3 2 2-3 0-3 4-7 4-3 2-4l-13-3h-5zm104 101q-1 3 13 2c11 0 13 0 14-2l-13-1z"/></g></svg>`);
function flagCanvas(fw, fh, poleBottom, k){
  const amp = Math.max(1, Math.round(fh*.035)), y0 = 3 + amp, artW = fw + 2, artH = Math.max(y0 + fh + amp + 1, poleBottom);
  // the flat cloth: the real flag drawing when it has loaded (and the browser lets it be read back)
  const F = document.createElement('canvas'); F.width = fw*k; F.height = fh*k; const f = F.getContext('2d');
  let drawn = false;
  if(FLAG_SA.complete && FLAG_SA.naturalWidth){ try{ f.drawImage(FLAG_SA, 0, 0, F.width, F.height); f.getImageData(0, 0, 1, 1); drawn = true; }catch(e){ f.clearRect(0, 0, F.width, F.height); } }
  if(!drawn){
  f.fillStyle = '#006c35'; f.fillRect(0, 0, F.width, F.height);
  f.fillStyle = '#ffffff'; f.direction = 'rtl'; f.textAlign = 'center'; f.textBaseline = 'alphabetic';
  f.font = `700 100px Amiri, "Baloo Bhaijaan 2", serif`;
  const m = f.measureText(SHAHADA), scale = (F.width*.8)/m.width;
  const px = 100*scale; f.font = `700 ${px}px Amiri, "Baloo Bhaijaan 2", serif`;
  const mm = f.measureText(SHAHADA), asc = mm.actualBoundingBoxAscent || px*.9, desc = mm.actualBoundingBoxDescent || px*.3;
  // the flag's thuluth script is tall: the line is drawn taller than the font's own proportions
  const tall = Math.min(1.7, (F.height*.36)/(asc + desc)), textMid = F.height*.38;
  f.save(); f.translate(F.width/2, textMid); f.scale(1, tall); f.fillText(SHAHADA, 0, (asc - desc)/2); f.restore();
  // the sword: point towards the hoist (left), hilt on the fly side (right)
  { const W = F.width, H = F.height, yb = H*.74, t = Math.max(k, H*.045);
    const tip = W*.17, guard = W*.71, grip = W*.8;
    f.beginPath(); f.moveTo(tip, yb + t*.5); f.lineTo(tip + t*3, yb - t*.5); f.lineTo(guard, yb - t*.5); f.lineTo(guard, yb + t*.5); f.closePath(); f.fill();
    f.fillRect(guard, yb - t*1.6, Math.max(k*.8, W*.012), t*3.2);                         // guard
    f.fillRect(guard + W*.012, yb - t*.6, grip - guard - W*.012, t*1.2);                 // grip
    f.beginPath(); f.moveTo(grip, yb - t*.6); f.lineTo(grip + t*1.6, yb + t*1.6); f.lineTo(grip + t*.4, yb + t*1.9); f.lineTo(grip - t*.2, yb + t*.6); f.closePath(); f.fill();   // pommel curling down
  }
  }
  // the waving cloth: each art column shifted up or down, and lit or shaded by its slope
  const C = document.createElement('canvas'); C.width = artW*k; C.height = artH*k; const c = C.getContext('2d');
  const lam = fw*.85, ph = .6, dy = i => Math.round(amp*Math.sin(2*Math.PI*i/lam - ph)*Math.min(1, i/(fw*.2)));
  for(let i=0;i<fw;i++) c.drawImage(F, i*k, 0, k, F.height, (2+i)*k, (y0 + dy(i))*k, k, F.height);
  c.globalCompositeOperation = 'source-atop';
  for(let i=0;i<fw;i++){ const s = Math.cos(2*Math.PI*i/lam - ph)*Math.min(1, i/(fw*.2));
    c.fillStyle = s > 0 ? `rgba(255,255,255,${(s*.1).toFixed(3)})` : `rgba(0,0,0,${(-s*.16).toFixed(3)})`; c.fillRect((2+i)*k, 0, k, C.height); }
  c.globalCompositeOperation = 'source-over';
  // pole and gold finial
  c.fillStyle = '#f2f2ee'; c.fillRect(0, 2*k, k, (artH-2)*k); c.fillStyle = '#9aa3a8'; c.fillRect(k, 2*k, k, (artH-2)*k);
  c.fillStyle = '#c98a1a'; c.fillRect(0, 0, 2*k, 2*k); c.fillStyle = '#f7c948'; c.fillRect(0, 0, k, k);
  return {canvas:C, artW, artH, top:y0};
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
