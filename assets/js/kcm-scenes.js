/* Alpha Academy Cambodia — Khmer Conversational Mastery: scene pictures
   ---------------------------------------------------------------------------
   Every situation gets an illustrated scene, drawn here as inline SVG — no
   image files to download, sharp on any screen, light enough for a phone.

   A scene is three layers in a 640 x 360 box:
     1  a SETTING   (café, street, market, clinic, temple ...)  — bg()
     2  a PROP      the object the conversation is about        — prop()
     3  two PEOPLE  "You" on the left, the other speaker right  — person()

   The table SPEC below picks the three for each of the 100 situations:
     n: "setting prop outfit sex [age]"
   outfit:  shirt | apron | coat | uniform | suit | cap | helmet | chef | hat
   sex:     f | m      age: (blank) adult | e elder | c child

   KCMScene.svg(n, opts) returns the markup. The two people carry the classes
   .kp-you / .kp-them so kcm.js can make whoever is speaking "talk".      */
(function (global) {
  'use strict';

  var SPEC = {
    1:'cafe coffee apron f',      2:'lane sun shirt f e',        3:'home flowers shirt f',
    4:'park nametag shirt m',     5:'street bag shirt f',        6:'street question shirt m',
    7:'market question apron f',  8:'street globe cap m',        9:'lane sunrain shirt m e',
    10:'cafe clock shirt m',      11:'street tuktuk cap m',      12:'street money cap m',
    13:'street map cap m',        14:'street phone helmet m',    15:'shop motorbike shirt m',
    16:'station ticket uniform f',17:'bus bus shirt f',          18:'river boat hat m',
    19:'airport passport uniform m', 20:'street signpost shirt f',
    21:'restaurant menu apron m', 22:'restaurant bowl apron f',  23:'cafe icedcoffee apron f',
    24:'restaurant chili apron m',25:'stall skewer apron f',     26:'restaurant receipt apron f',
    27:'restaurant star chef m',  28:'restaurant leaf apron f',  29:'home foodbag helmet m',
    30:'home bowl shirt f e',
    31:'market fruit apron f',    32:'market money hat f e',     33:'market tag apron m',
    34:'market shirt shirt f',    35:'shop basket uniform m',    36:'pharmacy pill coat f',
    37:'bank money suit m',       38:'bank card suit f',         39:'shop phone uniform m',
    40:'shop receipt uniform f',
    41:'hotel key suit f',        42:'hotel bulb suit m',        43:'hotel suitcase suit f',
    44:'home house suit m',       45:'home drop shirt f e',      46:'home wifi shirt m e',
    47:'home wrench cap m',       48:'home broom apron f',       49:'lane moon uniform m',
    50:'shop laundry apron f',
    51:'clinic thermo coat f',    52:'clinic stetho coat m',     53:'clinic tooth coat f',
    54:'pharmacy pill coat m',    55:'street siren shirt m',     56:'police bag uniform m',
    57:'street motorbike helmet m', 58:'spa lotus uniform f',    59:'gym dumbbell shirt m',
    60:'park heart shirt f',
    61:'office briefcase suit f', 62:'office card suit m',       63:'office chart suit f',
    64:'office phone suit m',     65:'office calendar suit f',   66:'cafe rice shirt m',
    67:'office clipboard uniform f', 68:'office contract suit m', 69:'classroom book shirt f',
    70:'lane briefcase shirt f e',
    71:'park calendar shirt m',   72:'cafe drinks shirt f',      73:'office envelope suit f',
    74:'home heart shirt f',      75:'home frame shirt m',       76:'home tea shirt m e',
    77:'home gift shirt f',       78:'park flower shirt m',      79:'market nosign apron m',
    80:'cafe phone shirt f',
    81:'temple ticket uniform f', 82:'temple map cap m',         83:'temple lotus shirt m e',
    84:'street lantern shirt f',  85:'beach crab hat f',         86:'field rice hat m e',
    87:'market camera apron f e', 88:'night mic shirt m',        89:'park ball shirt m',
    90:'home book shirt m e',
    91:'post parcel uniform f',   92:'police passport uniform f',93:'salon scissors apron m',
    94:'lane kite shirt f c',     95:'clinic paw coat f',        96:'street cone shirt m',
    97:'cafe speech shirt f',     98:'home speech shirt m',      99:'home box shirt f',
    100:'airport plane shirt f'
  };

  var INK = '#2b3a53';
  var SKIN = ['#c98c62', '#b07650', '#d9a27a', '#a8683f', '#c4865c'];
  var TOPS = ['#e2574c', '#f5a524', '#7a5cd6', '#1e9e6a', '#e0629a', '#3a7bd5', '#d97a2b', '#2a9d8f'];

  /* ---------------------------------------------------------- helpers */
  function r(x, y, w, h, f, rx, extra) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + f + '"' +
      (rx ? ' rx="' + rx + '"' : '') + (extra || '') + '/>';
  }
  function c(x, y, rad, f, extra) { return '<circle cx="' + x + '" cy="' + y + '" r="' + rad + '" fill="' + f + '"' + (extra || '') + '/>'; }
  function p(d, f, extra) { return '<path d="' + d + '" fill="' + (f || 'none') + '"' + (extra || '') + '/>'; }
  function st(w, col) { return ' stroke="' + (col || INK) + '" stroke-width="' + (w || 3) + '" stroke-linecap="round" stroke-linejoin="round"'; }
  function e(x, y, rx, ry, f, extra) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="' + f + '"' + (extra || '') + '/>'; }

  /* ========================================================== SETTINGS */
  function wallRoom(wall, floor, extra) {
    return r(0, 0, 640, 360, wall) + r(0, 268, 640, 92, floor) + r(0, 266, 640, 4, 'rgba(0,0,0,.08)') + (extra || '');
  }
  function windowPane(x, y, w, h, sky) {
    return r(x - 6, y - 6, w + 12, h + 12, '#ffffff', 8) + r(x, y, w, h, sky || '#bfe3ff', 4) +
      r(x + w / 2 - 2, y, 4, h, '#ffffff') + r(x, y + h / 2 - 2, w, 4, '#ffffff');
  }
  function counter(col, top) {
    return r(30, 286, 580, 74, col, 0) + r(22, 278, 596, 14, top || '#ffffff', 6);
  }
  function shelf(x, y, w, cols) {
    var s = r(x, y, w, 8, '#c9a27a', 3);
    for (var i = 0; i < 5; i++) s += r(x + 10 + i * (w - 20) / 5, y - 30, (w - 20) / 5 - 10, 30, cols[i % cols.length], 4);
    return s;
  }
  function sky(top, bot) {
    return '<defs><linearGradient id="SKYID" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + top +
      '"/><stop offset="1" stop-color="' + bot + '"/></linearGradient></defs>' + r(0, 0, 640, 360, 'url(#SKYID)');
  }
  function palm(x, y, s) {
    s = s || 1;
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
      p('M0 0 C4 -40 2 -80 8 -120', 'none', st(10, '#8b5e3c')) +
      p('M8 -120 C-20 -130 -40 -118 -52 -100 C-30 -112 -12 -112 8 -120Z', '#3fa34d') +
      p('M8 -120 C30 -138 56 -132 66 -112 C44 -122 26 -120 8 -120Z', '#3fa34d') +
      p('M8 -120 C-6 -150 -30 -156 -44 -150 C-22 -146 -6 -136 8 -120Z', '#4fb85c') +
      p('M8 -120 C20 -152 44 -160 58 -152 C36 -148 22 -138 8 -120Z', '#4fb85c') + '</g>';
  }
  function buildings(cols) {
    var s = '', x = 0, hs = [150, 110, 170, 130, 160, 120, 145];
    for (var i = 0; i < 7; i++) {
      var w = 96, h = hs[i];
      s += r(x, 250 - h, w - 6, h + 20, cols[i % cols.length], 6);
      for (var j = 0; j < 3; j++) s += r(x + 14 + j * 24, 270 - h, 14, 18, 'rgba(255,255,255,.55)', 3);
      s += r(x + 14, 300 - h, 62, 6, 'rgba(0,0,0,.08)');
      x += w;
    }
    return s;
  }
  function awning(y, a, b) {
    var s = '';
    for (var i = 0; i < 16; i++) s += r(i * 40, y, 40, 34, i % 2 ? a : b);
    for (i = 0; i < 16; i++) s += p('M' + (i * 40) + ' ' + (y + 34) + ' q20 18 40 0z', i % 2 ? a : b);
    return s;
  }
  function lantern(x, y, col) {
    return p('M' + x + ' 0 V' + (y - 14), 'none', st(2, '#7a5a3a')) + e(x, y, 14, 17, col || '#e2574c') + r(x - 7, y - 19, 14, 5, '#f5c542', 2) + r(x - 7, y + 14, 14, 5, '#f5c542', 2);
  }

  var BG = {
    cafe: function () {
      return wallRoom('#f6e3c8', '#c99a6b', windowPane(60, 50, 150, 110) + windowPane(430, 50, 150, 110) +
        p('M320 0 V40', 'none', st(2)) + p('M296 40 h48 l-8 18 h-32z', '#2a9d8f') + c(320, 62, 6, '#ffe69a') +
        r(250, 120, 140, 70, '#3b2f2a', 8) + r(262, 132, 116, 8, '#f6e3c8', 2) + r(262, 148, 80, 6, '#f5a524', 2) + r(262, 162, 96, 6, '#f6e3c8', 2) +
        counter('#8d5b3a', '#f2d2a9'));
    },
    lane: function () {
      return sky('#9fd4ff', '#e6f5ff') + buildings(['#f2b5a0', '#f7d58b', '#a9d8c4', '#f2c6de']) +
        r(0, 270, 640, 90, '#d9d2c3') + r(0, 268, 640, 6, '#b9b09c') + palm(600, 280, 0.9) + palm(36, 290, 0.75) +
        r(250, 170, 140, 100, '#ffffff', 6) + r(270, 196, 40, 74, '#c97b4a', 4) + windowPane(330, 196, 44, 40, '#bfe3ff');
    },
    street: function () {
      return sky('#8fcbff', '#e4f4ff') + c(560, 60, 30, '#ffd45c') + buildings(['#f7c59f', '#b8d8f2', '#f2e2a0', '#c9b6e4', '#a8dcc6']) +
        r(0, 262, 640, 98, '#8c8f99') + r(0, 258, 640, 8, '#c8c8c8') +
        r(40, 312, 60, 6, '#ffffff', 3) + r(200, 312, 60, 6, '#ffffff', 3) + r(360, 312, 60, 6, '#ffffff', 3) + r(520, 312, 60, 6, '#ffffff', 3) +
        palm(320, 262, 0.7);
    },
    home: function () {
      return wallRoom('#fbefd9', '#d8a676', windowPane(250, 54, 140, 100, '#bfe9c9') +
        r(70, 70, 70, 54, '#ffffff', 4) + r(76, 76, 58, 42, '#f7c59f', 2) + c(105, 94, 9, '#e2574c') +
        r(500, 60, 70, 90, '#e9c46a', 4) + r(506, 66, 58, 78, '#fff7e0', 2) +
        p('M590 268 v-46', 'none', st(4, '#6b4f2a')) + c(590, 214, 22, '#3fa34d') + c(574, 226, 14, '#4fb85c') + r(578, 240, 24, 30, '#c97b4a', 4) +
        r(0, 300, 640, 60, '#c48b5a'));
    },
    park: function () {
      return sky('#a8dcff', '#eaf7ff') + c(90, 70, 28, '#ffd45c') +
        e(160, 270, 220, 60, '#8fd17c') + e(500, 280, 240, 70, '#7cc46a') + r(0, 280, 640, 80, '#79c267') +
        c(520, 170, 56, '#3fa34d') + c(480, 196, 40, '#4fb85c') + r(512, 200, 16, 82, '#8b5e3c', 4) +
        c(120, 180, 44, '#4fb85c') + r(112, 200, 14, 80, '#8b5e3c', 4) +
        r(260, 300, 120, 8, '#b9875a', 3) + r(266, 308, 6, 22, '#8b5e3c') + r(368, 308, 6, 22, '#8b5e3c');
    },
    market: function () {
      return wallRoom('#ffe7c2', '#c9a27a', awning(0, '#e2574c', '#ffffff') +
        r(30, 270, 580, 18, '#8b5e3c', 4) + r(30, 288, 580, 72, '#a97447') +
        c(70, 262, 14, '#f5a524') + c(96, 262, 14, '#f5a524') + c(83, 248, 14, '#f5a524') +
        c(540, 262, 14, '#7ac74f') + c(566, 262, 14, '#7ac74f') + c(553, 248, 14, '#7ac74f') +
        r(130, 70, 8, 120, '#8b5e3c') + r(502, 70, 8, 120, '#8b5e3c') + lantern(200, 80, '#f5a524') + lantern(440, 80, '#f5a524'));
    },
    stall: function () {
      return sky('#2c2f6b', '#7a4f9a') + c(80, 60, 3, '#fff') + c(180, 40, 2, '#fff') + c(460, 50, 3, '#fff') + c(580, 30, 2, '#fff') +
        buildings(['#3a3f7a', '#4a3f80', '#35406e']) + r(0, 262, 640, 98, '#4b4b5e') +
        lantern(120, 90, '#ffb347') + lantern(240, 70, '#ff6b6b') + lantern(400, 70, '#ffb347') + lantern(520, 90, '#ff6b6b') +
        r(30, 282, 580, 14, '#c97b4a', 4) + r(40, 296, 560, 64, '#8b5e3c');
    },
    restaurant: function () {
      return wallRoom('#fde4d0', '#b98058', r(0, 0, 640, 30, '#c0392b') +
        lantern(110, 70, '#e2574c') + lantern(530, 70, '#e2574c') + windowPane(250, 50, 140, 90, '#ffe3a8') +
        r(170, 180, 300, 8, '#8b5e3c', 3) +
        e(320, 300, 200, 26, '#ffffff') + r(120, 300, 400, 60, '#ffffff') + r(120, 330, 400, 6, '#e2574c'));
    },
    shop: function () {
      return wallRoom('#e8f1fb', '#b8c4d4', shelf(40, 90, 200, ['#f5a524', '#e2574c', '#3a7bd5', '#1e9e6a']) +
        shelf(40, 170, 200, ['#e0629a', '#7a5cd6', '#f5a524']) + shelf(400, 90, 200, ['#1e9e6a', '#3a7bd5', '#e2574c']) +
        shelf(400, 170, 200, ['#f5a524', '#e0629a', '#2a9d8f']) + counter('#3a7bd5', '#ffffff'));
    },
    pharmacy: function () {
      return wallRoom('#e6f7ef', '#b9d8c8', shelf(40, 100, 200, ['#ffffff', '#cdeedd', '#ffffff']) +
        shelf(40, 180, 200, ['#cdeedd', '#ffffff']) + shelf(400, 100, 200, ['#ffffff', '#cdeedd']) + shelf(400, 180, 200, ['#cdeedd', '#ffffff']) +
        r(296, 40, 48, 48, '#1e9e6a', 10) + r(314, 48, 12, 32, '#fff', 2) + r(304, 58, 32, 12, '#fff', 2) + counter('#1e9e6a', '#ffffff'));
    },
    bank: function () {
      return wallRoom('#eef0f6', '#c3c8d6', r(200, 40, 240, 50, '#1f3a6b', 8) + c(240, 65, 14, '#f5c542') + r(266, 58, 150, 14, '#ffffff', 4) +
        r(40, 90, 120, 170, '#c3c8d6', 8) + r(52, 104, 96, 50, '#3a7bd5', 4) + r(70, 170, 60, 10, '#1f3a6b', 3) +
        counter('#1f3a6b', '#e9edf5'));
    },
    post: function () {
      return wallRoom('#fff4d6', '#d6b98a', r(220, 34, 200, 46, '#e2574c', 8) + p('M248 46 h40 v24 h-40z M248 46 l20 14 l20 -14', 'none', st(3, '#fff')) +
        r(300, 52, 100, 12, '#ffffff', 4) + r(40, 120, 70, 50, '#c97b4a', 4) + r(60, 90, 80, 34, '#d9a066', 4) + r(530, 110, 70, 60, '#c97b4a', 4) +
        counter('#e2574c', '#fff4d6'));
    },
    salon: function () {
      return wallRoom('#f3e8ff', '#c9b6e4', r(240, 40, 160, 160, '#ffffff', 80) + r(254, 54, 132, 132, '#d6ecff', 66) +
        r(60, 60, 12, 140, '#e2574c', 6) + r(60, 80, 12, 14, '#ffffff') + r(60, 120, 12, 14, '#ffffff') + r(60, 160, 12, 14, '#ffffff') +
        counter('#7a5cd6', '#ffffff'));
    },
    hotel: function () {
      return wallRoom('#f5ecdf', '#b98a5e', r(230, 40, 180, 40, '#8b5e3c', 8) + r(250, 54, 140, 12, '#f5c542', 4) +
        r(60, 90, 120, 130, '#8b5e3c', 6) + (function () { var s = ''; for (var i = 0; i < 3; i++) for (var j = 0; j < 4; j++) s += r(70 + j * 28, 100 + i * 40, 20, 30, '#c9a27a', 3) + c(80 + j * 28, 112 + i * 40, 3, '#f5c542'); return s; })() +
        p('M560 268 v-50', 'none', st(4, '#6b4f2a')) + c(560, 206, 26, '#3fa34d') + counter('#8b5e3c', '#f2d2a9'));
    },
    clinic: function () {
      return wallRoom('#e8f6f6', '#bfd9d9', r(290, 36, 60, 60, '#e2574c', 12) + r(312, 46, 16, 40, '#fff', 3) + r(300, 58, 40, 16, '#fff', 3) +
        r(40, 80, 140, 100, '#ffffff', 8) + p('M56 140 l20 0 l10 -24 l14 44 l12 -30 l8 10 l40 0', 'none', st(3, '#1e9e6a')) +
        r(470, 200, 150, 30, '#ffffff', 6) + r(470, 230, 10, 40, '#9aa7b8') + r(610, 230, 10, 40, '#9aa7b8') + counter('#2a9d8f', '#ffffff'));
    },
    spa: function () {
      return wallRoom('#f6eadf', '#c9a98a', c(320, 110, 70, '#f2d6c2') + p('M320 70 c18 20 18 50 0 70 c-18 -20 -18 -50 0 -70z', '#e0629a') +
        p('M320 140 c-30 -6 -48 -26 -50 -50 c26 4 44 22 50 50z', '#f08cb6') + p('M320 140 c30 -6 48 -26 50 -50 c-26 4 -44 22 -50 50z', '#f08cb6') +
        e(90, 250, 30, 8, '#a8d8c0') + c(90, 236, 12, '#d6c3a8') + c(560, 230, 30, '#3fa34d') + counter('#c9a98a', '#f6eadf'));
    },
    gym: function () {
      return wallRoom('#e5ecf5', '#5b6b85', r(0, 40, 640, 16, '#f5a524') + r(60, 100, 160, 110, '#ffffff', 6) + windowPane(440, 80, 140, 110, '#cfe7ff') +
        r(80, 120, 120, 10, '#e2574c', 4) + r(80, 144, 90, 10, '#3a7bd5', 4) + r(80, 168, 110, 10, '#1e9e6a', 4) +
        r(0, 300, 640, 60, '#46546c'));
    },
    office: function () {
      return wallRoom('#eaf0f8', '#9aa9c0', windowPane(60, 50, 160, 120, '#cfe7ff') + windowPane(420, 50, 160, 120, '#cfe7ff') +
        r(270, 60, 100, 70, '#ffffff', 6) + r(284, 100, 14, 22, '#3a7bd5') + r(306, 86, 14, 36, '#1e9e6a') + r(328, 76, 14, 46, '#f5a524') +
        p('M600 268 v-40', 'none', st(4, '#6b4f2a')) + c(600, 222, 22, '#3fa34d') + counter('#5b6b85', '#d6dde9'));
    },
    police: function () {
      return wallRoom('#e6ebf3', '#9aa7b8', r(230, 36, 180, 48, '#1f3a6b', 8) + p('M320 44 l14 8 v14 c0 8 -6 12 -14 16 c-8 -4 -14 -8 -14 -16 v-14z', '#f5c542') +
        r(60, 100, 110, 140, '#c3cddd', 6) + r(470, 100, 110, 140, '#c3cddd', 6) + r(80, 120, 70, 8, '#ffffff', 3) + r(80, 140, 50, 8, '#ffffff', 3) +
        counter('#1f3a6b', '#e6ebf3'));
    },
    classroom: function () {
      return wallRoom('#fbf3df', '#c9a27a', r(150, 40, 340, 150, '#2f5d50', 8) + r(144, 34, 352, 162, 'none', 10, st(8, '#8b5e3c')) +
        '<text x="320" y="110" text-anchor="middle" font-family="Kantumruy Pro, Noto Sans Khmer, sans-serif" font-size="44" fill="#ffffff">ក ខ គ</text>' +
        r(190, 140, 260, 4, 'rgba(255,255,255,.6)', 2) + counter('#c97b4a', '#f2d2a9'));
    },
    station: function () {
      return wallRoom('#fdf0d5', '#c9b08a', r(180, 40, 280, 70, '#1f3a6b', 8) + r(200, 56, 110, 12, '#f5c542', 3) + r(200, 80, 160, 12, '#ffffff', 3) + r(380, 56, 60, 36, '#2a9d8f', 4) +
        r(30, 140, 150, 90, '#f5a524', 18) + r(44, 156, 40, 32, '#bfe3ff', 4) + r(92, 156, 40, 32, '#bfe3ff', 4) + c(60, 232, 12, '#2b3a53') + c(150, 232, 12, '#2b3a53') +
        counter('#1f3a6b', '#fdf0d5'));
    },
    bus: function () {
      return wallRoom('#e8eef6', '#7d8aa0', windowPane(30, 60, 160, 110, '#9fd4ff') + windowPane(240, 60, 160, 110, '#9fd4ff') + windowPane(450, 60, 160, 110, '#9fd4ff') +
        palm(130, 170, 0.5) + palm(520, 170, 0.5) + r(0, 200, 640, 10, '#c3cddd') +
        r(120, 240, 90, 120, '#3a7bd5', 14) + r(430, 240, 90, 120, '#3a7bd5', 14));
    },
    river: function () {
      return sky('#8fcbff', '#dff1ff') + c(540, 70, 28, '#ffd45c') + e(140, 210, 200, 40, '#7cc46a') + e(520, 214, 180, 34, '#6fb85e') +
        r(0, 216, 640, 144, '#3a8fd5') + p('M40 260 q20 -10 40 0 t40 0 M300 300 q20 -10 40 0 t40 0 M480 250 q20 -10 40 0 t40 0', 'none', st(3, '#9fd4ff')) +
        palm(60, 220, 0.55) + palm(600, 222, 0.6);
    },
    airport: function () {
      return wallRoom('#eef3f9', '#b8c4d4', windowPane(30, 40, 580, 150, '#a8dcff') +
        p('M380 100 l120 -12 c10 -1 14 8 4 12 l-120 14z', '#ffffff', st(2, '#9aa7b8')) + p('M440 94 l-20 -26 l14 0 l34 24z', '#ffffff', st(2, '#9aa7b8')) +
        r(250, 206, 140, 30, '#1f3a6b', 6) + r(266, 216, 60, 10, '#f5c542', 3) + counter('#5b6b85', '#eef3f9'));
    },
    temple: function () {
      return sky('#ffd9a0', '#fff1d6') + c(500, 90, 34, '#ffbf5c') +
        p('M200 260 V150 l20 -30 l10 -40 l10 40 l20 30 V260z', '#c9a06a') + p('M300 260 V130 l12 -30 l8 -60 l8 60 l12 30 V260z', '#d9b07a') +
        p('M380 260 V150 l20 -30 l10 -40 l10 40 l20 30 V260z', '#c9a06a') +
        r(150, 250, 340, 20, '#b98a5e') + r(0, 268, 640, 92, '#d9c08f') + palm(70, 270, 0.8) + palm(590, 270, 0.75);
    },
    beach: function () {
      return sky('#7cc8ff', '#d6f0ff') + c(110, 70, 30, '#ffd45c') + r(0, 180, 640, 70, '#2f9ed8') +
        p('M0 200 q40 -10 80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0', 'none', st(3, '#bfe8ff')) +
        r(0, 244, 640, 116, '#f4dca4') + p('M520 250 V150', 'none', st(5, '#8b5e3c')) + p('M440 160 q80 -70 160 0z', '#e2574c') +
        p('M480 160 q40 -70 80 0z', '#ffffff') + palm(60, 250, 0.8);
    },
    field: function () {
      return sky('#9fd8ff', '#eef9ff') + c(530, 70, 30, '#ffd45c') + e(320, 220, 420, 40, '#9ed36a') +
        r(0, 220, 640, 140, '#8ccc5a') + p('M0 250 H640 M0 285 H640 M0 325 H640', 'none', st(4, '#6fb24a')) +
        palm(90, 230, 0.9) + palm(560, 228, 0.8) + palm(470, 226, 0.6) +
        p('M230 222 l40 -40 l40 40z', '#b98a5e') + r(240, 222, 60, 30, '#d9b07a');
    },
    night: function () {
      return wallRoom('#2c1f4a', '#3b2a5e', c(100, 60, 30, 'rgba(224,98,154,.5)') + c(540, 70, 34, 'rgba(58,123,213,.5)') + c(320, 40, 24, 'rgba(245,165,36,.5)') +
        r(200, 60, 240, 140, '#120c24', 8) + r(210, 70, 220, 120, '#5b3fa8', 4) +
        '<text x="320" y="140" text-anchor="middle" font-family="sans-serif" font-size="28" fill="#ffd45c">♪ ♫ ♪</text>' +
        counter('#5b3fa8', '#7a5cd6'));
    }
  };

  /* ============================================================== PROPS
     Each prop is drawn about (0,0) in an 84 x 84 box, then placed centre. */
  var PROP = {
    coffee: function () { return r(-26, -18, 44, 44, '#ffffff', 8, st()) + p('M18 -6 c18 0 18 22 0 22', 'none', st()) + r(-24, -16, 40, 10, '#6b3e26') + p('M-14 -30 c-4 -6 4 -10 0 -16 M0 -30 c-4 -6 4 -10 0 -16', 'none', st(3, '#9aa7b8')); },
    icedcoffee: function () { return p('M-20 -34 h40 l-6 66 h-28z', '#f3e3c3', st()) + r(-17, -6, 34, 34, '#8b5a32') + p('M4 -34 l10 -18', 'none', st(4, '#e2574c')) + r(-12, -20, 10, 10, '#dff3ff', 2) + r(2, -14, 10, 10, '#dff3ff', 2); },
    sun: function () { return c(0, 0, 22, '#ffd45c', st()) + p('M0 -40 v8 M0 32 v8 M-40 0 h8 M32 0 h8 M-28 -28 l6 6 M22 22 l6 6 M-28 28 l6 -6 M22 -22 l6 -6', 'none', st()); },
    sunrain: function () { return c(-12, -12, 18, '#ffd45c', st()) + e(10, 4, 28, 16, '#ffffff', st()) + p('M-4 28 l-4 10 M10 28 l-4 10 M24 28 l-4 10', 'none', st(3, '#3a7bd5')); },
    flowers: function () { return p('M-16 -10 l4 44 h24 l4 -44z', '#3a7bd5', st()) + c(-14, -24, 10, '#e0629a', st(2)) + c(6, -32, 10, '#f5a524', st(2)) + c(20, -18, 10, '#e2574c', st(2)) + p('M-10 -14 v6 M4 -22 v14 M16 -10 v4', 'none', st(3, '#1e9e6a')); },
    nametag: function () { return r(-36, -24, 72, 50, '#ffffff', 8, st()) + r(-36, -24, 72, 16, '#e2574c', 8) + r(-24, 4, 48, 6, '#9aa7b8', 3) + r(-24, 14, 30, 5, '#c3cddd', 3); },
    bag: function () { return r(-28, -12, 56, 46, '#f5a524', 10, st()) + p('M-14 -12 c0 -22 28 -22 28 0', 'none', st(4)); },
    question: function () { return c(0, 0, 32, '#3a7bd5', st()) + '<text x="0" y="14" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="42" fill="#fff">?</text>'; },
    globe: function () { return c(0, 0, 30, '#7cc8ff', st()) + p('M-12 -22 c8 6 2 14 10 16 c8 2 4 12 -4 14 M10 6 c6 2 10 10 4 16', '#7ac74f', st(2)) + p('M0 30 v10 M-16 40 h32', 'none', st()); },
    clock: function () { return c(0, 0, 32, '#ffffff', st()) + p('M0 0 V-18 M0 0 l12 8', 'none', st(4)) + c(0, 0, 3, INK); },
    tuktuk: function () { return r(-40, -26, 66, 44, '#f5a524', 10, st()) + r(-34, -40, 54, 16, '#1e9e6a', 6, st()) + r(-30, -18, 22, 18, '#dff3ff', 3) + r(26, -6, 18, 24, '#e2574c', 4, st()) + c(-24, 22, 10, '#2b3a53') + c(14, 22, 10, '#2b3a53') + c(40, 22, 8, '#2b3a53'); },
    money: function () { return r(-36, -18, 66, 36, '#7ac74f', 6, st()) + c(-3, 0, 10, '#c8eab0', st(2)) + r(-28, -26, 66, 36, '#9ed36a', 6, st()) + c(5, -8, 10, '#d9f2c6', st(2)) + '<text x="5" y="-3" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="14" fill="#2b3a53">$</text>'; },
    map: function () { return p('M-36 -24 l24 -8 l24 8 l24 -8 v52 l-24 8 l-24 -8 l-24 8z', '#fff7e0', st()) + p('M-12 -32 v52 M12 -24 v52', 'none', st(2)) + p('M-26 10 c10 -14 20 4 34 -12', 'none', st(3, '#e2574c')) + c(18, -14, 6, '#e2574c'); },
    phone: function () { return r(-20, -36, 40, 72, '#2b3a53', 9) + r(-15, -28, 30, 52, '#7cc8ff', 3) + c(0, 30, 3, '#fff') + p('M-8 -12 h16 M-8 -2 h10', 'none', st(3, '#fff')); },
    motorbike: function () { return c(-26, 16, 14, '#ffffff', st(5)) + c(28, 16, 14, '#ffffff', st(5)) + p('M-26 16 l18 -24 h22 l14 24 M-10 -8 h-12 M24 -8 l8 -16 h8', 'none', st(4)) + r(-10, -16, 30, 12, '#e2574c', 5, st()); },
    ticket: function () { return p('M-36 -20 h72 v12 a8 8 0 0 0 0 16 v12 h-72 v-12 a8 8 0 0 0 0 -16z', '#f5c542', st()) + p('M-14 -20 v40', 'none', st(2) + ' stroke-dasharray="4 4"') + r(-4, -6, 30, 5, '#2b3a53', 2) + r(-4, 4, 20, 5, '#2b3a53', 2); },
    bus: function () { return r(-40, -30, 80, 52, '#e2574c', 10, st()) + r(-32, -22, 28, 18, '#dff3ff', 3) + r(4, -22, 28, 18, '#dff3ff', 3) + c(-22, 24, 9, INK) + c(22, 24, 9, INK); },
    boat: function () { return p('M-44 4 h88 l-14 22 h-60z', '#c97b4a', st()) + p('M-4 4 V-40 l30 34z', '#ffffff', st()) + p('M-48 34 q12 -8 24 0 t24 0 t24 0 t24 0', 'none', st(3, '#3a8fd5')); },
    passport: function () { return r(-26, -36, 52, 72, '#1f3a6b', 6, st()) + c(0, -6, 12, 'none', st(3, '#f5c542')) + p('M-12 -6 h24 M0 -18 v24', 'none', st(2, '#f5c542')) + r(-14, 16, 28, 5, '#f5c542', 2); },
    signpost: function () { return p('M0 40 V-36', 'none', st(5)) + p('M0 -30 h32 l10 9 l-10 9 h-32z', '#3a7bd5', st()) + p('M0 -6 h-32 l-10 9 l10 9 h32z', '#f5a524', st()); },
    menu: function () { return r(-28, -36, 56, 72, '#c0392b', 6, st()) + r(-20, -28, 40, 56, '#fff7e0', 3) + r(-14, -18, 28, 4, '#c0392b', 2) + r(-14, -6, 22, 4, '#9aa7b8', 2) + r(-14, 4, 26, 4, '#9aa7b8', 2) + r(-14, 14, 18, 4, '#9aa7b8', 2); },
    bowl: function () { return p('M-38 -4 h76 c0 26 -18 38 -38 38 s-38 -12 -38 -38z', '#ffffff', st()) + e(0, -4, 38, 8, '#f2d6a0', st(2)) + c(-12, -8, 6, '#1e9e6a') + c(8, -10, 6, '#e2574c') + p('M14 -16 l26 -26 M22 -14 l24 -24', 'none', st(3, '#8b5e3c')); },
    chili: function () { return p('M-30 20 c10 -30 40 -46 62 -40 c-4 30 -36 52 -62 40z', '#e2574c', st()) + p('M32 -20 c4 -8 10 -12 16 -12', 'none', st(4, '#1e9e6a')); },
    skewer: function () { return p('M-40 34 L40 -34', 'none', st(3, '#8b5e3c')) + c(-16, 14, 11, '#c97b4a', st(2)) + c(0, 0, 11, '#e2574c', st(2)) + c(16, -14, 11, '#c97b4a', st(2)); },
    receipt: function () { return p('M-24 -36 h48 v72 l-8 -6 l-8 6 l-8 -6 l-8 6 l-8 -6 l-8 6z', '#ffffff', st()) + r(-14, -24, 28, 4, '#9aa7b8', 2) + r(-14, -12, 20, 4, '#9aa7b8', 2) + r(-14, 0, 24, 4, '#9aa7b8', 2) + r(-14, 14, 28, 6, INK, 2); },
    star: function () { return p('M0 -36 l10 22 l24 3 l-18 16 l5 24 l-21 -12 l-21 12 l5 -24 l-18 -16 l24 -3z', '#ffd45c', st()); },
    leaf: function () { return p('M-30 30 c0 -44 26 -64 62 -64 c0 40 -22 64 -62 64z', '#7ac74f', st()) + p('M-30 30 l46 -48', 'none', st(3)); },
    foodbag: function () { return p('M-30 -18 h60 l-6 54 h-48z', '#f5a524', st()) + p('M-14 -18 c0 -20 28 -20 28 0', 'none', st(4)) + c(0, 10, 10, '#ffffff', st(2)); },
    fruit: function () { return c(-16, 10, 18, '#f5a524', st()) + c(16, 10, 18, '#e2574c', st()) + c(0, -16, 16, '#7ac74f', st()) + p('M0 -32 v-6', 'none', st(3)); },
    tag: function () { return p('M-30 -20 h44 l22 20 l-22 20 h-44z', '#f5c542', st()) + c(12, 0, 5, '#fff', st(2)) + '<text x="-8" y="6" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="16" fill="#2b3a53">$</text>'; },
    shirt: function () { return p('M-14 -34 l-26 12 l8 18 l10 -4 v42 h44 v-42 l10 4 l8 -18 l-26 -12 c-4 10 -24 10 -28 0z', '#e0629a', st()); },
    basket: function () { return p('M-38 -10 h76 l-8 44 h-60z', '#3a7bd5', st()) + p('M-22 -10 l10 -24 M22 -10 l-10 -24', 'none', st(4)) + p('M-26 6 h52 M-24 20 h48', 'none', st(2, '#ffffff')); },
    pill: function () { return '<g transform="rotate(-35)">' + r(-34, -14, 68, 28, '#ffffff', 14, st()) + r(-34, -14, 34, 28, '#e2574c', 14) + r(-20, -14, 20, 28, '#e2574c') + r(-34, -14, 68, 28, 'none', 14, st()) + '</g>'; },
    card: function () { return r(-38, -24, 76, 48, '#3a7bd5', 8, st()) + r(-38, -12, 76, 10, INK) + r(-28, 8, 18, 12, '#f5c542', 3) + r(0, 12, 26, 5, '#ffffff', 2); },
    key: function () { return c(-18, 0, 16, '#f5c542', st()) + c(-18, 0, 5, '#fff', st(2)) + p('M-2 0 h40 M28 0 v12 M38 0 v8', 'none', st(5)); },
    bulb: function () { return p('M-20 -6 a20 20 0 1 1 40 0 c0 12 -10 16 -10 26 h-20 c0 -10 -10 -14 -10 -26z', '#ffe69a', st()) + r(-10, 22, 20, 12, '#9aa7b8', 3, st(2)) + p('M-30 -36 l-8 -8 M30 -36 l8 -8 M0 -44 v-8', 'none', st(3, '#f5a524')); },
    suitcase: function () { return r(-30, -22, 60, 56, '#e2574c', 8, st()) + p('M-12 -22 v-10 h24 v10', 'none', st(4)) + p('M-14 -22 v56 M14 -22 v56', 'none', st(3, '#ffffff')); },
    house: function () { return p('M-34 -4 L0 -36 L34 -4', '#e2574c', st()) + r(-26, -6, 52, 42, '#fff7e0', 3, st()) + r(-8, 12, 16, 24, '#c97b4a', 2) + r(10, 2, 10, 10, '#7cc8ff', 2); },
    drop: function () { return p('M0 -38 c16 22 26 36 26 50 a26 26 0 0 1 -52 0 c0 -14 10 -28 26 -50z', '#5aaef0', st()) + p('M-10 14 a10 10 0 0 0 8 10', 'none', st(3, '#ffffff')); },
    wifi: function () { return p('M-34 -8 a48 48 0 0 1 68 0 M-22 6 a30 30 0 0 1 44 0 M-10 18 a14 14 0 0 1 20 0', 'none', st(6, '#3a7bd5')) + c(0, 30, 5, '#3a7bd5'); },
    wrench: function () { return '<g transform="rotate(-40)">' + r(-6, -10, 12, 52, '#9aa7b8', 5, st()) + p('M-18 -24 a18 18 0 1 0 36 0 l-8 -12 v12 h-20 v-12z', '#c3cddd', st()) + '</g>'; },
    broom: function () { return p('M24 -40 L-4 14', 'none', st(5, '#8b5e3c')) + p('M-20 4 l24 12 l-14 26 l-30 -14z', '#f5c542', st()); },
    moon: function () { return p('M10 -32 a32 32 0 1 0 22 50 a26 26 0 1 1 -22 -50z', '#ffe69a', st()) + c(-28, -28, 3, '#ffd45c') + c(30, -30, 2, '#ffd45c'); },
    laundry: function () { return p('M-36 -10 h72 l-8 44 h-56z', '#c3cddd', st()) + p('M-28 -10 c4 -16 18 -18 24 -6 c6 -16 22 -14 26 6', '#7cc8ff', st(2)) + p('M-6 -14 c6 -12 20 -10 22 4', '#e0629a', st(2)); },
    thermo: function () { return r(-8, -38, 16, 58, '#ffffff', 8, st()) + c(0, 26, 12, '#e2574c', st()) + r(-3, -10, 6, 32, '#e2574c', 3); },
    stetho: function () { return p('M-20 -34 v20 a20 20 0 0 0 40 0 v-20 M0 6 v12 a14 14 0 0 0 28 0 v-6', 'none', st(5)) + c(28, 8, 9, '#c3cddd', st()); },
    tooth: function () { return p('M-24 -26 c8 -10 18 -6 24 -2 c6 -4 16 -8 24 2 c8 12 2 26 -4 34 c-2 12 -4 24 -10 24 c-6 0 -6 -18 -10 -18 s-4 18 -10 18 c-6 0 -8 -12 -10 -24 c-6 -8 -12 -22 -4 -34z', '#ffffff', st()) + c(18, -24, 4, '#7cc8ff'); },
    siren: function () { return p('M-26 22 v-16 a26 26 0 0 1 52 0 v16z', '#e2574c', st()) + r(-34, 22, 68, 12, '#9aa7b8', 4, st()) + p('M-40 -24 l-8 -8 M40 -24 l8 -8 M0 -36 v-10', 'none', st(4, '#f5a524')); },
    lotus: function () { return p('M0 -34 c16 18 16 42 0 54 c-16 -12 -16 -36 0 -54z', '#e0629a', st(2)) + p('M0 20 c-26 0 -40 -18 -40 -34 c20 0 34 12 40 34z', '#f08cb6', st(2)) + p('M0 20 c26 0 40 -18 40 -34 c-20 0 -34 12 -40 34z', '#f08cb6', st(2)) + e(0, 28, 34, 6, '#7ac74f'); },
    dumbbell: function () { return r(-26, -4, 52, 8, '#9aa7b8', 3, st(2)) + r(-42, -20, 16, 40, INK, 4) + r(26, -20, 16, 40, INK, 4) + r(-48, -12, 8, 24, INK, 3) + r(40, -12, 8, 24, INK, 3); },
    heart: function () { return p('M0 30 c-30 -20 -40 -34 -40 -48 c0 -14 12 -22 22 -22 c8 0 14 6 18 12 c4 -6 10 -12 18 -12 c10 0 22 8 22 22 c0 14 -10 28 -40 48z', '#e0629a', st()); },
    briefcase: function () { return r(-38, -18, 76, 52, '#8b5e3c', 8, st()) + p('M-14 -18 v-10 h28 v10', 'none', st(4)) + r(-38, 2, 76, 4, INK) + r(-6, -2, 12, 12, '#f5c542', 2, st(2)); },
    chart: function () { return r(-38, -34, 76, 68, '#ffffff', 6, st()) + r(-26, 4, 12, 20, '#3a7bd5') + r(-8, -10, 12, 34, '#1e9e6a') + r(10, -22, 12, 46, '#f5a524'); },
    calendar: function () { return r(-34, -28, 68, 62, '#ffffff', 8, st()) + r(-34, -28, 68, 18, '#e2574c', 8) + r(-34, -18, 68, 8, '#e2574c') + p('M-18 -36 v14 M18 -36 v14', 'none', st(4)) + '<text x="0" y="26" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="26" fill="#2b3a53">7</text>'; },
    rice: function () { return p('M-38 -2 h76 c0 24 -18 36 -38 36 s-38 -12 -38 -36z', '#3a7bd5', st()) + p('M-36 -2 c4 -20 20 -28 36 -28 s32 8 36 28z', '#ffffff', st(2)); },
    clipboard: function () { return r(-28, -34, 56, 72, '#c97b4a', 6, st()) + r(-22, -24, 44, 56, '#ffffff', 3) + r(-12, -40, 24, 12, '#9aa7b8', 3, st(2)) + p('M-14 -10 l4 4 l8 -8 M-14 8 l4 4 l8 -8', 'none', st(3, '#1e9e6a')) + r(4, -10, 12, 4, '#9aa7b8') + r(4, 8, 12, 4, '#9aa7b8'); },
    contract: function () { return r(-28, -36, 56, 72, '#ffffff', 4, st()) + r(-18, -24, 36, 4, '#9aa7b8') + r(-18, -14, 30, 4, '#9aa7b8') + r(-18, -4, 34, 4, '#9aa7b8') + p('M-16 20 c6 -8 10 6 16 -2 s8 4 12 0', 'none', st(3, '#3a7bd5')) + p('M20 4 l18 -30 l6 4 l-18 30 l-8 2z', '#f5a524', st(2)); },
    book: function () { return p('M0 -24 c-12 -8 -28 -10 -40 -6 v56 c12 -4 28 -2 40 6 c12 -8 28 -10 40 -6 v-56 c-12 -4 -28 -2 -40 6z', '#ffffff', st()) + p('M0 -24 v56', 'none', st(3)) + p('M-30 -14 h20 M-30 -4 h20 M10 -14 h20 M10 -4 h20', 'none', st(2, '#9aa7b8')); },
    drinks: function () { return p('M-34 -26 h28 l-4 56 h-20z', '#f5a524', st()) + p('M6 -26 h28 l-4 56 h-20z', '#e0629a', st()) + p('M-22 -26 l6 -14 M18 -26 l6 -14', 'none', st(3)); },
    envelope: function () { return r(-38, -24, 76, 50, '#ffffff', 4, st()) + p('M-38 -24 l38 28 l38 -28', 'none', st()) + c(0, 6, 8, '#e2574c'); },
    frame: function () { return r(-36, -30, 72, 60, '#c97b4a', 6, st()) + r(-28, -22, 56, 44, '#dff3ff', 2) + c(-12, -2, 8, '#f5a524') + c(12, -2, 8, '#e0629a') + p('M-22 22 c0 -12 20 -12 20 0 M2 22 c0 -12 20 -12 20 0', '#3a7bd5'); },
    tea: function () { return p('M-34 -14 h56 c0 30 -12 46 -28 46 s-28 -16 -28 -46z', '#ffffff', st()) + p('M22 -6 c16 0 16 20 0 20', 'none', st()) + p('M-34 -14 c10 -10 46 -10 56 0', '#c97b4a', st(2)) + p('M-14 -26 c-4 -6 4 -10 0 -16 M2 -26 c-4 -6 4 -10 0 -16', 'none', st(3, '#9aa7b8')); },
    gift: function () { return r(-32, -14, 64, 48, '#e2574c', 4, st()) + r(-36, -24, 72, 14, '#f08070', 4, st()) + r(-5, -24, 10, 58, '#f5c542') + p('M0 -24 c-20 -20 -30 0 0 0 c20 -20 30 0 0 0', '#f5c542', st(2)); },
    flower: function () { return p('M0 40 V0', 'none', st(4, '#1e9e6a')) + p('M0 22 c10 -10 20 -8 22 -4 c-6 8 -14 8 -22 4z', '#7ac74f') + c(0, -12, 10, '#ffd45c', st(2)) + c(-16, -12, 9, '#e0629a', st(2)) + c(16, -12, 9, '#e0629a', st(2)) + c(0, -28, 9, '#e0629a', st(2)) + c(0, 4, 9, '#e0629a', st(2)) + c(0, -12, 9, '#ffd45c', st(2)); },
    nosign: function () { return c(0, 0, 32, '#ffffff', st(6, '#e2574c')) + p('M-22 -22 L22 22', 'none', st(6, '#e2574c')); },
    camera: function () { return r(-38, -20, 76, 50, INK, 8) + r(-16, -30, 26, 12, INK, 3) + c(0, 5, 16, '#7cc8ff', st(4, '#ffffff')) + c(26, -10, 4, '#f5c542'); },
    lantern: function () { return p('M0 -44 v8', 'none', st(3)) + e(0, 0, 28, 34, '#e2574c', st()) + r(-14, -40, 28, 8, '#f5c542', 3, st(2)) + r(-14, 32, 28, 8, '#f5c542', 3, st(2)) + p('M-14 -30 c-8 20 -8 40 0 60 M14 -30 c8 20 8 40 0 60', 'none', st(2)); },
    crab: function () { return e(0, 6, 28, 18, '#e2574c', st()) + p('M-28 0 c-14 -6 -14 -24 -4 -28 c2 8 6 10 10 8 M28 0 c14 -6 14 -24 4 -28 c-2 8 -6 10 -10 8', '#e2574c', st()) + p('M-20 22 l-10 12 M-8 24 l-4 12 M8 24 l4 12 M20 22 l10 12', 'none', st()) + c(-8, -6, 3, INK) + c(8, -6, 3, INK); },
    mic: function () { return r(-12, -38, 24, 40, '#9aa7b8', 12, st()) + p('M-22 -8 a22 22 0 0 0 44 0 M0 14 v22 M-14 36 h28', 'none', st(4)); },
    ball: function () { return c(0, 0, 32, '#ffffff', st()) + p('M0 -12 l11 8 l-4 13 h-14 l-4 -13z', INK) + p('M0 -12 V-32 M11 -4 l19 -6 M7 9 l12 16 M-7 9 l-12 16 M-11 -4 l-19 -6', 'none', st(2)); },
    parcel: function () { return p('M-34 -14 l34 -16 l34 16 v40 l-34 16 l-34 -16z', '#d9a066', st()) + p('M-34 -14 l34 16 l34 -16 M0 2 v40', 'none', st()) + p('M-17 -22 l34 16 v12', 'none', st(3, '#8b5e3c')); },
    scissors: function () { return c(-18, 22, 11, 'none', st(5, '#e2574c')) + c(18, 22, 11, 'none', st(5, '#e2574c')) + p('M-10 14 L18 -36 M10 14 L-18 -36', 'none', st(5, '#9aa7b8')); },
    kite: function () { return p('M0 -40 l26 30 l-26 34 l-26 -34z', '#e0629a', st()) + p('M0 -40 v64 M-26 -10 h52', 'none', st(2)) + p('M0 24 c6 8 -6 12 0 20', 'none', st(2)) + p('M-4 32 l8 0', 'none', st(3, '#f5a524')); },
    paw: function () { return e(0, 14, 20, 16, '#c97b4a', st()) + c(-22, -8, 8, '#c97b4a', st(2)) + c(-8, -22, 8, '#c97b4a', st(2)) + c(8, -22, 8, '#c97b4a', st(2)) + c(22, -8, 8, '#c97b4a', st(2)); },
    cone: function () { return p('M-10 -36 h20 l16 64 h-52z', '#f5a524', st()) + r(-12, -14, 24, 8, '#ffffff') + r(-16, 6, 32, 8, '#ffffff') + r(-34, 28, 68, 10, '#f5a524', 3, st()); },
    speech: function () { return r(-40, -34, 50, 34, '#ffffff', 10, st()) + p('M-28 0 l-6 12 l14 -12', '#ffffff', st()) + r(-6, -6, 46, 32, '#7cc8ff', 10, st()) + p('M28 26 l6 12 l-14 -12', '#7cc8ff', st()); },
    box: function () { return r(-34, -24, 68, 58, '#d9a066', 4, st()) + p('M-34 -24 l-8 -14 h38 l4 14 M34 -24 l8 -14 h-38', '#e8bb85', st()) + r(-14, 0, 28, 8, '#8b5e3c', 2); },
    plane: function () { return p('M-40 6 l64 -6 c14 -2 20 4 18 8 c-2 4 -8 6 -18 6 l-64 2z', '#ffffff', st()) + p('M-6 4 l-18 -30 h10 l30 28 M-6 14 l-14 22 h10 l24 -22', '#7cc8ff', st()) + p('M-36 8 l-6 -16 h8 l10 14', '#7cc8ff', st(2)); }
  };

  /* ============================================================= PEOPLE */
  function hash(n) { return (n * 2654435761) >>> 0; }

  function person(x, o) {
    var s = o.skin, top = o.top, out = o.outfit, sc = o.age === 'c' ? 0.78 : 1;
    var hair = o.age === 'e' ? '#b9bec8' : (o.hair || '#2b2420');
    var y0 = o.age === 'c' ? 70 : 0;
    var g = '<g class="' + o.cls + '"><g class="kp-body" transform="translate(' + x + ' ' + (y0) + ') scale(' + sc + ')" style="transform-origin:0 360px">';

    // long hair behind the head
    if (o.sex === 'f' && out !== 'helmet' && o.age !== 'e') g += p('M-44 140 c-6 50 0 90 8 104 h72 c8 -14 14 -54 8 -104z', hair);

    // body
    var bodyCol = out === 'coat' ? '#ffffff' : out === 'suit' ? (o.sex === 'f' ? '#2f4f7a' : '#2b3a53') : top;
    g += p('M-62 360 v-110 c0 -38 26 -58 62 -58 s62 20 62 58 v110z', bodyCol, st(3));
    if (out === 'coat') g += p('M-12 194 l12 34 l12 -34', top) + p('M-12 194 l12 70 l12 -70', 'none', st(2)) + r(26, 262, 22, 20, 'none', 3, st(2)) + p('M-30 210 c0 30 10 40 18 40', 'none', st(3, '#5b6b85'));
    else if (out === 'suit') g += p('M-14 194 l14 40 l14 -40z', '#ffffff') + (o.sex === 'm' ? p('M0 206 l-6 8 l6 34 l6 -34z', '#e2574c') : '') + p('M-14 194 l14 46 l-24 -6 M14 194 l-14 46 l24 -6', 'none', st(2, '#1b2638'));
    else if (out === 'uniform') g += p('M-14 196 l14 16 l14 -16', 'none', st(3)) + r(18, 230, 26, 18, 'none', 3, st(2)) + p('M-38 226 l10 -6 l10 6 v10 c0 6 -10 10 -10 10 s-10 -4 -10 -10z', '#f5c542', st(2)) + r(-62, 216, 14, 6, '#f5c542', 2) + r(48, 216, 14, 6, '#f5c542', 2);
    else if (out === 'apron') g += p('M-14 196 l14 16 l14 -16', 'none', st(3)) + r(-36, 236, 72, 124, '#ffffff', 10, st(2)) + p('M-30 236 l-14 -36 M30 236 l14 -36', 'none', st(3, '#ffffff')) + r(-14, 270, 28, 18, 'none', 3, st(2, '#c3cddd'));
    if (out === 'shirt' || out === 'cap' || out === 'helmet' || out === 'hat' || out === 'chef') g += p('M-16 194 l16 20 l16 -20', 'none', st(3));
    if (o.backpack) g += p('M-40 206 c-6 40 -6 100 -4 154 M40 206 c6 40 6 100 4 154', 'none', st(8, '#f5a524'));

    // neck + head
    g += r(-12, 176, 24, 22, s) + c(0, 140, 42, s, st(3));
    // ears
    g += c(-42, 144, 8, s, st(2)) + c(42, 144, 8, s, st(2));

    // hair / hats
    if (out === 'helmet') g += p('M-48 136 c0 -40 22 -60 48 -60 s48 20 48 60 h-12 c0 -10 -6 -14 -12 -14 h-48 c-6 0 -12 4 -12 14z', '#e2574c', st(3)) + r(-26, 96, 52, 8, '#ffffff', 4);
    else if (out === 'cap') g += p('M-42 128 c0 -34 18 -50 42 -50 s42 16 42 50z', top === '#3a7bd5' ? '#1e9e6a' : '#3a7bd5', st(3)) + p('M10 128 h50 c4 0 4 8 -2 8 h-48z', top === '#3a7bd5' ? '#1e9e6a' : '#3a7bd5', st(3));
    else if (out === 'hat') g += p('M-70 126 L0 70 L70 126z', '#e9c46a', st(3)) + p('M-40 104 L40 104', 'none', st(2, '#c9a24a'));
    else if (out === 'chef') g += r(-34, 70, 68, 48, '#ffffff', 16, st(3)) + c(-22, 74, 18, '#ffffff', st(3)) + c(22, 74, 18, '#ffffff', st(3)) + c(0, 66, 20, '#ffffff', st(3)) + r(-34, 100, 68, 18, '#ffffff', 2);
    else if (o.sex === 'f') {
      g += p('M-44 140 c-4 -44 18 -66 44 -66 s50 22 44 66 c-10 -18 -28 -30 -52 -32 c-10 10 -24 20 -36 32z', hair, st(2, '#00000022'));
      if (o.age === 'e') g += c(0, 92, 18, hair, st(2, '#00000022'));
    } else {
      g += p('M-44 138 c-6 -40 16 -64 44 -64 s50 22 44 62 c-6 -10 -10 -18 -14 -22 c-18 6 -44 6 -62 0 c-6 6 -10 14 -12 24z', hair);
    }
    if (o.you) g += p('M-30 104 c10 -6 24 -6 34 2 c6 -8 18 -10 28 -4', 'none', st(4, hair));

    // face
    g += c(-15, 146, 5, INK) + c(15, 146, 5, INK) + c(-13, 144, 1.6, '#ffffff') + c(17, 144, 1.6, '#ffffff');
    g += e(-26, 162, 7, 4, 'rgba(226,87,76,.28)') + e(26, 162, 7, 4, 'rgba(226,87,76,.28)');
    g += p('M-12 164 c6 8 18 8 24 0', 'none', st(3) + ' class="km-closed"');
    g += p('M-11 162 h22 c0 12 -22 12 -22 0z', '#b0413a', st(2) + ' class="km-open"');
    if (o.age === 'e') g += p('M-28 128 c4 -3 8 -3 12 0 M16 128 c4 -3 8 -3 12 0', 'none', st(2, '#8695ac'));

    // arms
    g += p('M-58 250 c-6 40 -4 70 4 100', 'none', st(16, bodyCol)) + p('M58 250 c6 40 4 70 -4 100', 'none', st(16, bodyCol));
    g += '</g></g>';
    return g;
  }

  /* =============================================================== API */
  var uid = 0;
  function svg(n, opts) {
    opts = opts || {};
    var sp = (SPEC[n] || 'street question shirt m').split(' ');
    var setting = sp[0], prop = sp[1], outfit = sp[2], sex = sp[3], age = sp[4] || '';
    var h = hash(n);
    var bg = (BG[setting] || BG.street)().replace(/SKYID/g, 'kcs' + (++uid));
    var them = person(470, {
      cls: 'kp-them', skin: SKIN[h % SKIN.length], top: TOPS[(h >>> 3) % TOPS.length],
      outfit: outfit, sex: sex, age: age, hair: (h >>> 5) % 3 === 0 ? '#3b2a20' : '#1d1a18'
    });
    var you = person(170, { cls: 'kp-you', you: true, skin: '#f3d3b8', top: '#2a9d8f', outfit: 'shirt', sex: 'm', hair: '#8a5a33', backpack: true });
    var pr = PROP[prop] ? PROP[prop]() : '';
    var propG = '<g class="kp-prop" transform="translate(320 250)">' + c(0, 0, 50, 'rgba(255,255,255,.9)', st(3, 'rgba(43,58,83,.15)')) + '<g transform="scale(.9)">' + pr + '</g></g>';
    return '<svg class="kcm-svg" viewBox="0 0 640 360" role="img" aria-label="' + (opts.label || '').replace(/"/g, '&quot;') +
      '" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">' + bg + you + them + propG + '</svg>';
  }

  global.KCMScene = { svg: svg, spec: SPEC };
})(window);
