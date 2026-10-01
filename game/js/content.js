/* =========================================================================
   content.js — everything the game says and teaches.
   VOICE holds every spoken line. Recorded clips are looked up by the spoken
   text itself (voiceKey below) in VOICE_CLIPS, which tools/voice/make_voice.py
   writes to js/voice-files.js; a line without a clip uses the browser voice.
   ========================================================================= */
'use strict';

const VOICE = {
  welcome:      'مرحبًا يا بطل! هل أنت مستعد لاكتشاف وطننا؟',
  chooseFriend: 'اختر صديقك للمغامرة',
  askName:      'ما اسمك؟ اختر رمزًا، أو اكتب اسمك.',
  hello:        'أهلًا يا {name}! هيا بنا.',
  helloHero:    'أهلًا يا بطل! هيا بنا.',
  whereToday:   'أين سنذهب اليوم؟',
  locked:       'هذه المحطة تفتح بعد {prev}.',
  walk:         'هيا إلى {name}!',
  intro_makkah: 'مكة المكرمة، منبع الرسالة.',
  intro_madinah:'المدينة المنورة، دار الهجرة.',
  intro_riyadh: 'الرياض، عاصمة القرار.',
  intro_jeddah: 'جدة، عروس البحر الأحمر.',
  intro_alula:  'العلا، المتحف المفتوح.',
  intro_abha:   'أبها البهية.',
  intro_east:   'الشرقية، عاصمة الطاقة.',
  intro_qassim: 'القصيم، سلة غذاء المملكة.',
  letterListen: 'استمع… {s}',
  letterFind:   'اضغط على الصور التي تبدأ بحرف {l}.',
  letterHear:   'استمع جيدًا… {s}. أين هذا الحرف؟',
  letterMatch:  'هذا حرف {l}. أي صورة تبدأ به؟',
  letterTrace:  'هيا نكتب حرف {l} بإصبعك.',
  traceDone:    'رائع! كتبت الحرف!',
  traceMore:    'أكمل الحرف كله بإصبعك.',
  writeWord:    'وهذا حرف {l} في أول كلمة {w}. اكتبه بإصبعك.',
  hunt:         'أين حرف {l}؟ اضغط على كل حرف {l}.',
  pairs:        'طابق كل حرف مع صورته. اضغط على الحرف، ثم على الصورة.',
  pairOk:       '{l}… {w}!',
  count:        'هيا نعد! كم نرى؟',
  countBoats:   'كم قاربًا؟',
  countPearls:  'كم لؤلؤة؟',
  countTogether:'تعال نعد معًا.',
  whereNum:     'أين الرقم {n}؟',
  beach:        'ساعد برعم في تنظيف الشاطئ! اضغط على كل قطعة لنضعها في السلة.',
  beachDone:    'شاطئنا نظيف وجميل! أحسنت!',
  order:        'رتب الأرقام. اضغط على الرقم واحد أولًا.',
  orderDone:    'أحسنت! رتبت الأرقام!',
  path:         'ساعد برعم في الوصول إلى الرقم خمسة. اضغط على الأرقام بالترتيب.',
  pathDone:     'وصل برعم إلى الرقم خمسة! شكرًا لك!',
  bigger:       'اضغط على الصخرة الكبيرة.',
  smaller:      'اضغط على الصخرة الصغيرة.',
  taller:       'اضغط على النخلة الطويلة.',
  shorter:      'اضغط على النخلة القصيرة.',
  shapes:       'ضع كل شكل في بيته. أين يذهب هذا الشكل؟',
  shape_circle: 'دائرة',
  shape_square: 'مربع',
  shape_triangle:'مثلث',
  classify:     'أين يعيش هذا؟ في النبات، أم الجبل، أم البحر؟',
  numQty:       'طابق الرقم مع عدد التمرات. اضغط على الرقم، ثم على التمرات.',
  numQtyOk:     '{q}!',
  right:        ['رائع! أحسنت!', 'أحسنت يا بطل!', 'ممتاز!', 'رائع جدًا!'],
  wrong1:       'قريب جدًا! هيا نحاول مرة أخرى.',
  wrong2:       'تعال نكتشفها معًا.',
  actDone:      'أحسنت! حصلت على نجمة!',
  stationDone:  'أحسنت! حصلت على شارة {name}، وختم في جوازك، وقطعة من خريطة المملكة!',
  missions:     'مهمات وطنية! هيا نختار التصرف الصحيح.',
  or:           'أم',
  badgeGot:     'حصلت على شارة {name}!',
  badges:       'هذه شاراتك يا بطل!',
  passport:     'هذا جواز سفر برعم. كل محطة تعطيك ختمًا.',
  mapDone:      'اكتملت خريطة المملكة!',
  medal:        'أحسنت يا بطل! أنت الآن برعم من براعم وطن طموح!',
};
/* the one normalization of spoken text: game.js and tools/voice both key clips by it */
const voiceKey = text => String(text).replace(/[«»"'“”‘’]/g, '').replace(/\s+/g, ' ').trim();
const NUM_WORDS = ['صفر','واحد','اثنان','ثلاثة','أربعة','خمسة','ستة','سبعة','ثمانية','تسعة','عشرة'];
/* how many dates, with correct Arabic number agreement (تمرة is feminine) */
const DATE_COUNT = ['','تمرة واحدة','تمرتان','ثلاث تمرات','أربع تمرات','خمس تمرات','ست تمرات','سبع تمرات','ثماني تمرات','تسع تمرات','عشر تمرات'];

/* words shown as pictures: [word, sprite] */
const WORDS = {
  مسجد:'mosque', ماء:'drop', موز:'banana', أسد:'lion', سمكة:'fish', بيت:'house', قطة:'cat',
  نخلة:'palm', نجمة:'star', نحلة:'bee', جمل:'camel', قمر:'moon', جزرة:'carrot', جبل:'mountain', وردة:'rose',
  لؤلؤة:'pearl', ليمون:'lemon', تمر:'dates', تفاحة:'apple', تاج:'crown', قارب:'boat', صدفة:'shell',
};
const LETTERS = {
  'م': {sound:'مَ', good:['مسجد','ماء','موز'], bad:['أسد','سمكة','بيت','قطة'], tiles:['م','ن','س']},
  'ن': {sound:'نَ', good:['نخلة','نجمة','نحلة'], bad:['جمل','سمكة','قمر','بيت'], tiles:['ن','ب','ت']},
  'ج': {sound:'جَ', good:['جمل','جزرة','جبل'], bad:['نخلة','سمكة','قمر','وردة'], tiles:['ج','ب','ل']},
  'ت': {sound:'تَ', good:['تمر','تفاحة','تاج'], bad:['موز','سمكة','قطة','جمل'], tiles:['ت','ن','م']},
  'ل': {sound:'لَ', good:['لؤلؤة','ليمون'], bad:['سمكة','قمر','بيت'], tiles:['ل','ا','ك']},
};

/* the write activity's second round: a word that starts with the letter, and its picture */
const WRITE_WORDS = {'م':['موز','banana'], 'ن':['نخلة','palm'], 'ج':['جمل','camel'], 'ع':['علم','i_flag'],
  'أ':['أسد','lion'], 'ل':['ليمون','lemon'], 'ت':['تمر','dates']};

/* stations in the order the map reveals them */
const STATIONS = [
  {id:'makkah', name:'مكة المكرمة', short:'مكة', icon:'st_makkah', pos:[40.3,21.3], theme:'الكعبة المشرفة والجبال',
   acts:[{type:'letter', letter:'م'}, {type:'write', letter:'م'}, {type:'count', item:'pilgrim'}]},
  {id:'madinah', name:'المدينة المنورة', short:'المدينة', icon:'st_madinah', pos:[39.6,24.9], theme:'النخيل والتمور',
   acts:[{type:'letter', letter:'ن'}, {type:'write', letter:'ن'}, {type:'pairs', pairs:[['ن','نخلة'],['م','مسجد'],['ب','بيت']]}]},
  {id:'riyadh', name:'الرياض', short:'الرياض', icon:'st_riyadh', pos:[46.7,24.6], theme:'العاصمة والتقنية والمستقبل',
   acts:[{type:'order'}, {type:'path'}]},
  {id:'jeddah', name:'جدة', short:'جدة', icon:'st_jeddah', pos:[38.9,22.9], theme:'البحر والسفن',
   acts:[{type:'letter', letter:'ج'}, {type:'write', letter:'ج'}, {type:'count', item:'boat'}, {type:'beach'}]},
  {id:'alula', name:'العلا', short:'العلا', icon:'st_alula', pos:[37.9,26.9], theme:'الجبال والصخور والتراث',
   acts:[{type:'size'}, {type:'shapes'}, {type:'hunt', letter:'ع', others:['غ','ف','ق','ح','ه','م']}, {type:'write', letter:'ع'}]},
  {id:'abha', name:'أبها', short:'أبها', icon:'st_abha', pos:[42.9,18.8], theme:'الطبيعة والجبال والنبات',
   acts:[{type:'classify'}, {type:'hunt', letter:'أ', others:['ل','ب','ت','د','ر','ك']}, {type:'write', letter:'أ'}]},
  {id:'east', name:'المنطقة الشرقية', short:'الشرقية', icon:'st_east', pos:[49.2,26.2], theme:'البحر واللؤلؤ والطاقة',
   acts:[{type:'pairs', pairs:[['ل','لؤلؤة'],['ن','نجمة'],['ت','تمر']]}, {type:'write', letter:'ل'}, {type:'count', item:'pearl'}]},
  {id:'qassim', name:'القصيم', short:'القصيم', icon:'st_qassim', pos:[43.8,26.6], theme:'الزراعة والتمور والنخيل',
   acts:[{type:'letter', letter:'ت'}, {type:'write', letter:'ت'}, {type:'numqty'}]},
];
const TOTAL_ACTS = STATIONS.reduce((n,s)=>n+s.acts.length,0) + 4;

const ACT_INFO = {
  letter: {icon:'star',     title:a=>`حرف ${a.letter}`,  sub:'استمع وابحث عن الصور'},
  write:  {icon:'pencil',   title:a=>`اكتب حرف ${a.letter}`, sub:'بإصبعك'},
  count:  {icon:'pilgrim',  title:a=>({pilgrim:'هيا نعد', boat:'كم قاربًا؟', pearl:'كم لؤلؤة؟'})[a.item], sub:'عد واختر الرقم'},
  beach:  {icon:'bin',      title:()=>'نظّف الشاطئ',      sub:'نشاط تفاعلي'},
  order:  {icon:'blocks',   title:()=>'رتب الأرقام',       sub:'من الصغير إلى الكبير'},
  path:   {icon:'mini',     title:()=>'الطريق إلى ٥',      sub:'ساعد برعم في الوصول'},
  pairs:  {icon:'palm',     title:a=>`طابق ${a.pairs[0][0]} مع ${a.pairs[0][1]}`, sub:'طابق الحرف مع الصورة'},
  size:   {icon:'rock',     title:()=>'كبير وصغير',        sub:'كبير، صغير، طويل، قصير'},
  shapes: {icon:'box',      title:()=>'تصنيف الأشكال',      sub:'دائرة، مربع، مثلث'},
  hunt:   {icon:'mountain', title:a=>`أين حرف ${a.letter}؟`, sub:'ابحث عن الحرف'},
  classify:{icon:'seedling',title:()=>'نبات، جبل، بحر',     sub:'أين يعيش؟'},
  numqty: {icon:'dates',    title:()=>'الرقم والكمية',      sub:'٥ مع خمس تمرات'},
};
ACT_INFO.letter.iconFor = a => ({'م':'mosque','ن':'palm','ج':'camel','ت':'dates'})[a.letter] || 'star';
ACT_INFO.count.iconFor = a => ({pilgrim:'pilgrim', boat:'boat', pearl:'pearl'})[a.item];

/* Abha's sorting game: pictures that live with plants, on the mountain or in the sea [sprite, word] */
const CLASSIFY_POOL = {plant:[['seedling','نبتة'],['tree','شجرة'],['rose','وردة']], mountain:[['mountain','جبل'],['rock','صخرة']],
  sea:[['fish','سمكة'],['shell','صدفة'],['boat','قارب'],['wave','موجة']]};

const SYMBOLS = [['star','نجمة'],['camel','جمل'],['palm','نخلة'],['moon','هلال'],['boat','قارب'],['rose','وردة'],['crown','تاج'],['fish','سمكة']];

const VISION = {
  vibrant:  {name:'مجتمع حيوي', icon:'heart', desc:'التعاون، الصحة، البيئة'},
  economy:  {name:'اقتصاد مزدهر', icon:'dates', desc:'المهن، الزراعة، الصناعة، التجارة'},
  ambitious:{name:'وطن طموح', icon:'tablet', desc:'التقنية، الابتكار، المستقبل'},
};
const MISSIONS = [
  {id:'m1', badge:'vibrant', icon:'bin', title:'وطن جميل', q:'كيف نحافظ على وطننا جميلًا؟',
   right:{art:['boy','paper','bin'], cap:'يضع الورقة في السلة'}, wrong:{art:['boy','paper'], cap:'يرمي الورقة على الأرض', low:1},
   why:'نعم! نضع المهملات في السلة، فيبقى وطننا جميلًا.'},
  {id:'m2', badge:'vibrant', icon:'box', title:'نتعاون معًا', q:'كيف نكون مجتمعًا حيويًا؟',
   right:{art:['girl','boy','box'], cap:'يتعاونان في ترتيب الألعاب'}, wrong:{art:['boy','ball','blocks'], cap:'يترك الألعاب مبعثرة', low:1},
   why:'أحسنت! عندما نتعاون نصبح مجتمعًا حيويًا.'},
  {id:'m3', badge:'economy', icon:'palm', title:'المهن', q:'من يعمل في المزرعة ويزرع النخل؟',
   right:{art:['farmer','palm'], cap:'المزارع'}, wrong:{art:['fireman'], cap:'رجل الإطفاء'},
   why:'صحيح! المزارع يزرع النخل ويجني التمر لنا.'},
  {id:'m4', badge:'ambitious', icon:'tablet', title:'التقنية', q:'كيف تساعدنا التقنية على التعلم؟',
   right:{art:['girl','tablet'], cap:'نتعلم الحروف بالجهاز'}, wrong:{art:['boy','tablet','moon'], cap:'نسهر على الجهاز ولا ننام'},
   why:'رائع! نستخدم التقنية لنتعلم ونبتكر.'},
];

/* home activities suggested to parents per letter */
const HOME_IDEAS = {
  'م':['موز','ملعقة','مفتاح'], 'ن':['نافذة','نظارة','نعناع'], 'ج':['جوال','جزرة','جورب'], 'ت':['تفاحة','تمر','تلفاز'],
  'ل':['ليمون','لعبة','لبن'], 'ب':['باب','بيضة','برتقالة'], 'أ':['أرنب','أزرار','إبريق'], 'ع':['عصير','علبة','عنب'],
};
