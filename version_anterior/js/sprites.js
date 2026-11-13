'use strict';
/* ============================================================
   MÍSTICAS — (C) 1987 — js/sprites.js
   Los sprites: matrices de píxeles de un solo plano, contornos
   negros macizos, cero antialiasing, cero transparencia parcial.
   Se hornean a canvas por banco de fundido (5) igual que las
   teselas. Los personajes NUNCA proyectan sombra difusa: en
   1987 los sprites flotaban sobre el suelo y punto.

   Mapa de caracteres -> índice de paleta:
     . = transparente   K = 0 negro      V = 1 violeta oscuro
     v = 2 violeta      P = 3 púrpura    p = 4 púrpura vivo
     M = 5 magenta      C = 6 carmesí    c = 7 carmesí oscuro
     R = 8 rojo         O = 9 naranja    Y = 10 amarillo
     W = 11 blanco      G = 12 gris      g = 13 gris oscuro
     S = 14 hueso/piel  L = 15 lila
   ============================================================ */
(function (M) {

  var CH = {
    '.': -1, 'K': 0, 'V': 1, 'v': 2, 'P': 3, 'p': 4, 'M': 5,
    'C': 6, 'c': 7, 'R': 8, 'O': 9, 'Y': 10, 'W': 11,
    'G': 12, 'g': 13, 'S': 14, 'L': 15
  };

  /* ================= EL NIÑO (capucha roja) 16x20 ================= */

  var HOOD_DOWN_0 = [
    '......KKKK......',
    '.....KCCCCK.....',
    '....KCCCCCCK....',
    '...KCCCCCCCCK...',
    '...KCCSSSSCCK...',
    '...KCSKSSKSCK...',
    '...KCSSSSSSCK...',
    '....KCSSSCK.....',
    '...KCCCCCCCCK...',
    '..KCCCCCCCCCCK..',
    '..KCCcCCCCcCCK..',
    '..KSCcCCCCcCSK..',
    '...KCCCCCCCCK...',
    '...KcCCCCCCcK...',
    '...KKKKKKKKKK...',
    '....KcC..CcK....',
    '....KcC..CcK....',
    '....KKK..KKK....',
    '...KKKK..KKKK...',
    '................'
  ];

  var HOOD_DOWN_1 = [
    '......KKKK......',
    '.....KCCCCK.....',
    '....KCCCCCCK....',
    '...KCCCCCCCCK...',
    '...KCCSSSSCCK...',
    '...KCSKSSKSCK...',
    '...KCSSSSSSCK...',
    '....KCSSSCK.....',
    '...KCCCCCCCCK...',
    '..KCCCCCCCCCCK..',
    '..KCCcCCCCcCCK..',
    '..KSCcCCCCcCSK..',
    '...KCCCCCCCCK...',
    '...KcCCCCCCcK...',
    '...KKKKKKKKKK...',
    '....KcC..CcK....',
    '....KKK..CcK....',
    '..........KKK...',
    '.........KKKK...',
    '................'
  ];

  var HOOD_UP_0 = [
    '......KKKK......',
    '.....KCCCCK.....',
    '....KCCCCCCK....',
    '...KCCCCCCCCK...',
    '...KCCCCCCCCK...',
    '...KCcCCCCcCK...',
    '...KCCcCCcCCK...',
    '....KCCCCCCCK...',
    '...KCCCCCCCCK...',
    '..KCCCCCCCCCCK..',
    '..KCCcCCCCcCCK..',
    '..KCCcCCCCcCCK..',
    '...KCCCCCCCCK...',
    '...KcCCCCCCcK...',
    '...KKKKKKKKKK...',
    '....KcC..CcK....',
    '....KcC..CcK....',
    '....KKK..KKK....',
    '...KKKK..KKKK...',
    '................'
  ];

  var HOOD_UP_1 = [
    '......KKKK......',
    '.....KCCCCK.....',
    '....KCCCCCCK....',
    '...KCCCCCCCCK...',
    '...KCCCCCCCCK...',
    '...KCcCCCCcCK...',
    '...KCCcCCcCCK...',
    '....KCCCCCCCK...',
    '...KCCCCCCCCK...',
    '..KCCCCCCCCCCK..',
    '..KCCcCCCCcCCK..',
    '..KCCcCCCCcCCK..',
    '...KCCCCCCCCK...',
    '...KcCCCCCCcK...',
    '...KKKKKKKKKK...',
    '....KcC..CcK....',
    '....KKK..CcK....',
    '..........KKK...',
    '.........KKKK...',
    '................'
  ];

  var HOOD_SIDE_0 = [   // mirando a la derecha
    '......KKKK......',
    '.....KCCCCK.....',
    '....KCCCCCCK....',
    '...KCCCCCCCCK...',
    '...KCCCSSSSK....',
    '....KCCSKSSK....',
    '....KCCSSSSK....',
    '....KCCCSCK.....',
    '...KCCCCCCCCK...',
    '..KCCCCCCCCCK...',
    '..KCCCcCCCCSK...',
    '..KCCCcCCCCCK...',
    '...KCCCCCCK.....',
    '...KcCCCCcK.....',
    '....KKKKKKK.....',
    '......KcCK......',
    '......KcCK......',
    '......KKKK......',
    '.....KKKKK......',
    '................'
  ];

  var HOOD_SIDE_1 = [
    '......KKKK......',
    '.....KCCCCK.....',
    '....KCCCCCCK....',
    '...KCCCCCCCCK...',
    '...KCCCSSSSK....',
    '....KCCSKSSK....',
    '....KCCSSSSK....',
    '....KCCCSCK.....',
    '...KCCCCCCCCK...',
    '..KCCCCCCCCCK...',
    '..KCCCcCCCCSK...',
    '..KCCCcCCCCCK...',
    '...KCCCCCCK.....',
    '...KcCCCCcK.....',
    '....KKKKKKK.....',
    '.....KcCK.......',
    '.....KcCK.......',
    '....KKKKK.......',
    '...KKKKK........',
    '................'
  ];

  /* sentado leyendo (escena del árbol) */
  var HOOD_SIT = [
    '......KKKK......',
    '.....KCCCCK.....',
    '....KCCCCCCK....',
    '....KCCSSSCK....',
    '....KCSKKSSK....',
    '....KCSSSSCK....',
    '...KCCCCCCCCK...',
    '..KCCCWWWWWCK...',
    '..KCCCWWWWWCK...',
    '...KCCCCCCCCK...',
    '...KKKKKKKKKK...',
    '................'
  ];

  /* agachado tras columna */
  var HOOD_HIDE = [
    '......KKKK......',
    '.....KCCCCK.....',
    '....KCCCCCCK....',
    '....KCCSSSCK....',
    '....KCSKSKCK....',
    '....KCSSSSCK....',
    '...KCCCCCCCCK...',
    '..KCCCCCCCCCCK..',
    '..KcCCCCCCCCcK..',
    '..KKKKKKKKKKKK..',
    '..KKK......KKK..',
    '................'
  ];

  /* ================= ELLA (vestida de blanco) 12x16 ================= */

  var GIRL_DOWN = [
    '...KKKKKK...',
    '..KKKKKKKK..',
    '.KKKKKKKKKK.',
    '.KKSSSSSSKK.',
    '.KKSKSSKSKK.',
    '.KKSSSSSSKK.',
    '..KSSSSSSK..',
    '...KWWWWK...',
    '..KWWLLWWK..',
    '..KWWLLWWK..',
    '.KSWWLLWWSK.',
    '.KWWWLLWWWK.',
    '.KWWWLLWWWK.',
    '..KWWWWWWK..',
    '..KWWWWWWK..',
    '..KKK..KKK..'
  ];

  var GIRL_UP = [
    '...KKKKKK...',
    '..KKKKKKKK..',
    '.KKKKKKKKKK.',
    '.KKKVKKVKKK.',
    '.KKKKKKKKKK.',
    '..KKKKKKKK..',
    '..KWWWWWWK..',
    '...KWWWWK...',
    '..KWWLLWWK..',
    '..KWWLLWWK..',
    '.KWWWWWWWK..',
    '.KWWWLLWWWK.',
    '.KWWWLLWWWK.',
    '..KWWWWWWK..',
    '..KWWWWWWK..',
    '..KKK..KKK..'
  ];

  var GIRL_SIDE = [   // hacia la derecha
    '...KKKKKK...',
    '..KKKKKKKK..',
    '.KKKKKKKKKK.',
    '.KKSSSSSKKK.',
    '.KKSSKSSKKK.',
    '.KKSSSSSKKK.',
    '..KSSSSKK...',
    '...KWWWWK...',
    '..KWWLLWWK..',
    '..KWWLLWWK..',
    '..KWWLLWWSK.',
    '..KWWLLWWWK.',
    '..KWWLLWWWK.',
    '..KWWWWWWK..',
    '..KWWWWWWK..',
    '..KKK..KKK..'
  ];

  var GIRL_WAVE = [   // de frente, brazo en alto: "VEN"
    '...KKKKKK...',
    '..KKKKKKKK..',
    '.KKKKKKKKKK.',
    '.KKSSSSSSKK.',
    '.KKSKSSKSKK.',
    '.KKSSSSSSKKS',
    '..KSSSSSSKSS',
    '...KWWWWKKSS',
    '..KWWLLWWKS.',
    '..KWWLLWWK..',
    '.KSWWLLWWSK.',
    '.KWWWLLWWWK.',
    '.KWWWLLWWWK.',
    '..KWWWWWWK..',
    '..KWWWWWWK..',
    '..KKK..KKK..'
  ];

  /* ================= LA HERMANA (vela en mano) 14x20 ================= */

  var SIS_DOWN_0 = [
    '....KKKKKK....',
    '...KKKKKKKK...',
    '..KWWWWWWWWK..',
    '..KWSSSSSSWK..',
    '..KWSKSSKSWK..',
    '..KWSSSSSSWK..',
    '..KWWWWWWWWK..',
    '...KKKKKKKK...',
    '..KKKKKKKKKK..',
    '.KKVKKKKKVKKK.',
    '.KKKKKKKKKKKK.',
    '.KKKKKKKKKKKK.',
    '.KKKKKKKKKKKKS',
    '.KKVKKKKKKVKK.',
    '.KKKKKKKKKKKK.',
    '.KKKKKKKKKKKK.',
    '..KKKKKKKKKK..',
    '..KKKKKKKKKK..',
    '..KKKKKKKKKK..',
    '...KKKKKKKK...'
  ];

  var SIS_DOWN_1 = [
    '....KKKKKK....',
    '...KKKKKKKK...',
    '..KWWWWWWWWK..',
    '..KWSSSSSSWK..',
    '..KWSKSSKSWK..',
    '..KWSSSSSSWK..',
    '..KWWWWWWWWK..',
    '...KKKKKKKK...',
    '..KKKKKKKKKK..',
    '.KKVKKKKKVKKK.',
    '.KKKKKKKKKKKK.',
    '.KKKKKKKKKKKK.',
    '.KKKKKKKKKKKKS',
    '.KKVKKKKKKVKK.',
    '.KKKKKKKKKKKK.',
    '.KKKKKKKKKKKK.',
    '.KKKKKKKKKKKK.',
    '..KKKKKKKKKK..',
    '...KKKKKKKK...',
    '....KKKKKK....'
  ];

  var SIS_UP_0 = [
    '....KKKKKK....',
    '...KKKKKKKK...',
    '..KWWWWWWWWK..',
    '..KWWWWWWWWK..',
    '..KWWgWWgWWK..',
    '..KWWWWWWWWK..',
    '..KWWWWWWWWK..',
    '...KKKKKKKK...',
    '..KKKKKKKKKK..',
    '.KKVKKKKKVKKK.',
    '.KKKKKKKKKKKK.',
    '.KKKKKKKKKKKK.',
    '.KKKKKKKKKKKK.',
    '.KKVKKKKKKVKK.',
    '.KKKKKKKKKKKK.',
    '.KKKKKKKKKKKK.',
    '..KKKKKKKKKK..',
    '..KKKKKKKKKK..',
    '..KKKKKKKKKK..',
    '...KKKKKKKK...'
  ];

  var SIS_UP_1 = SIS_UP_0.slice(0, 16).concat([
    '.KKKKKKKKKKKK.',
    '..KKKKKKKKKK..',
    '...KKKKKKKK...',
    '....KKKKKK....'
  ]);

  var SIS_SIDE_0 = [   // hacia la derecha
    '....KKKKKK....',
    '...KKKKKKKK...',
    '..KWWWWWWKKK..',
    '..KWSSSSSKKK..',
    '..KWSKSSKKKK..',
    '..KWSSSSKKKK..',
    '..KWWWWWKKKK..',
    '...KKKKKKKKK..',
    '..KKKKKKKKKKK.',
    '.KKVKKKKKKKKK.',
    '.KKKKKKKKKKKK.',
    '.KKKKKKKKKKKKS',
    '.KKKKKKKKKKKKK',
    '.KKVKKKKKKKKK.',
    '.KKKKKKKKKKKK.',
    '.KKKKKKKKKKKK.',
    '..KKKKKKKKKK..',
    '..KKKKKKKKKK..',
    '..KKKKKKKKKK..',
    '...KKKKKKKK...'
  ];

  var SIS_SIDE_1 = SIS_SIDE_0.slice(0, 16).concat([
    '.KKKKKKKKKKKK.',
    '..KKKKKKKKKK..',
    '...KKKKKKKK...',
    '....KKKKKK....'
  ]);

  /* ================= LLAMAS (3 fotogramas 5x6) ================= */

  var FLAME_A = ['..Y..', '.YYY.', '.YOY.', '.OOO.', '..O..', '..R..'];
  var FLAME_B = ['..Y..', '.YYO.', '.YOY.', '.OOO.', '..O..', '.R...'];
  var FLAME_C = ['..Y..', '.YYY.', '.OYY.', '.OOO.', '..O..', '..R..'];

  /* ================= VELAS Y APLIQUES ================= */

  var CANDLE = [   // vela de suelo (recogible) 6x8
    '.KWWK.',
    '.KWWK.',
    '.KWWK.',
    '.KWWK.',
    '.KgWK.',
    '.KgWK.',
    '..KK..',
    '......'
  ];

  var SCONCE = [   // aplique de muro 8x9
    '........',
    '.KWWWK..',
    '.KWWWK..',
    '.KWWWK..',
    '.KgWWK..',
    '..KVK...',
    '.KVpVK..',
    '..KVK...',
    '..KKK...'
  ];

  /* ================= LAPIDAS Y RESTOS ================= */

  var TOMB_CROSS = [   // 12x14
    '....KKKK....',
    '....KGGK....',
    '....KGGK....',
    '.KKKKGGKKKK.',
    '.KGGGGGGGGK.',
    '.KKKKGGKKKK.',
    '..KKKGGKKK..',
    '....KGGK....',
    '....KGGK....',
    '....KGGK....',
    '..KKGGGGKK..',
    '.KGGGGGGGGK.',
    '.KggGGGGggK.',
    '.KKKKKKKKKK.'
  ];

  var TOMB_ROUND = [   // 12x12
    '...KKKKKK...',
    '..KGGGGGGK..',
    '.KGGGGGGGGK.',
    '.KGggggggGK.',
    '.KGggggggGK.',
    '.KGGGGGGGGK.',
    '.KGggggggGK.',
    '.KGGGGGGGGK.',
    '.KggGGGGggK.',
    '.KKKKKKKKKK.',
    '..KKKKKKKK..',
    '..KKKKKKKK..'
  ];

  var TOMB_BROKEN = [   // 12x9
    '.KKKKKKKKK..',
    '.KGGGGGGGK..',
    '.KGggggGGK..',
    '.KKKGGGGKK..',
    '...KGGK.....',
    '..KGGGGK....',
    '.KggGGggK...',
    '.KKKKKKKK...',
    '............'
  ];

  var SKULL = [   // 7x6
    '.KKKKK.',
    'KWWWWWK',
    'KWKWKWK',
    'KWWKWWK',
    '.KWWWK.',
    '.K.K.K.'
  ];

  var BONES = [   // 10x5
    '.KWKKW....',
    'KWWKKWWK..',
    '.KKWKKWK..',
    '....KWWK..',
    '.....KK...'
  ];

  /* ================= ARBOL MUERTO 22x28 ================= */

  var DEADTREE = [
    '.....K......K.........',
    '.....K.....KK.........',
    '......K....KK.........',
    '......K...K.K.........',
    '.......K..K.K....K....',
    '.......KK.K.K....K....',
    '........KKK.K...KK....',
    '.........KKKK...K.K...',
    '....K.....KKK..K..K...',
    '....KK....KKKKKK..K...',
    '.....KK...KKKKKK.KK...',
    '......KKKKKKKKKKKK....',
    '.........KKKKKK.......',
    '........KKVKKK........',
    '........KKVKKK........',
    '........KKVKKKK.......',
    '........KKVKKKK.......',
    '........KKVKKKK.......',
    '.......KKKVKKKK.......',
    '.......KKKVVKKK.......',
    '......KKKKVVKKKK......',
    '......KKKKVKKKKK......',
    '.....KKKKKVKKKKKK.....',
    '.....KKKKKVKKKKKK.....',
    '....KKKKKKVVKKKKKK....',
    '....KKKKKKVKKKKKKK....',
    '...KKKKKKKKKKKKKKKK...',
    '...KKKKKKKKKKKKKKKK...'
  ];

  /* ================= VENTANA GOTICA (2 estados) 12x14 ================= */

  var WINDOW_LIT_0 = [
    '.....KK.....',
    '....KGGK....',
    '...KGGGGK...',
    '..KGKYYKGK..',
    '.KGKYYYYKGK.',
    '.KGKYOOYKGK.',
    '.KGKYOOYKGK.',
    '.KGKYYYYKGK.',
    '.KGKKYYKKGK.',
    '.KGKKKKKKGK.',
    '.KGGKKKKGGK.',
    '.KGGGGGGGGK.',
    '..KKKKKKKK..',
    '..KKKKKKKK..'
  ];

  var WINDOW_LIT_1 = [
    '.....KK.....',
    '....KGGK....',
    '...KGGGGK...',
    '..KGKYYKGK..',
    '.KGKYYOYKGK.',
    '.KGKOYYOKGK.',
    '.KGKYOOYKGK.',
    '.KGKYYYYKGK.',
    '.KGKKYYKKGK.',
    '.KGKKKKKKGK.',
    '.KGGKKKKGGK.',
    '.KGGGGGGGGK.',
    '..KKKKKKKK..',
    '..KKKKKKKK..'
  ];

  /* ================= MOBILIARIO ================= */

  var COLUMN = [   // 12x26
    '.MMMMMMMMMM.',
    '.KKKKKKKKKK.',
    '.KvVKVVKVVK.',
    '.KvVKVVKVVK.',
    '.KvVKVVKVVK.',
    '.KvVKVVKVVK.',
    '.KvVKVVKVVK.',
    '.KvVKVVKVVK.',
    '.KvVKVVKVVK.',
    '.KvVKVVKVVK.',
    '.KvVKVVKVVK.',
    '.KvVKVVKVVK.',
    '.KvVKVVKVVK.',
    '.KvVKVVKVVK.',
    '.KvVKVVKVVK.',
    '.KvVKVVKVVK.',
    '.KvVKVVKVVK.',
    '.KvVKVVKVVK.',
    '.KvVKVVKVVK.',
    '.KvVKVVKVVK.',
    '.KvVKVVKVVK.',
    '.KVVVVVVVVK.',
    '.KKKKKKKKKK.',
    '.MMMMMMMMMM.',
    '.KKKKKKKKKK.',
    '............'
  ];

  var SHELF = [   // 16x18
    '.KKKKKKKKKKKKKK.',
    '.KPPPPPPPPPPPPK.',
    '.KWKGWKGKWKGWKK.',
    '.KWKGWKGKWKGWKK.',
    '.KKKKKKKKKKKKKK.',
    '.KPPPPPPPPPPPPK.',
    '.KGKWKGSKGKWKGK.',
    '.KGKWKGSKGKWKGK.',
    '.KKKKKKKKKKKKKK.',
    '.KPPPPPPPPPPPPK.',
    '.KWKGKGGKWKGKKK.',
    '.KWKGKGGKWKGKKK.',
    '.KKKKKKKKKKKKKK.',
    '.KPPPPPPPPPPPPK.',
    '.KPPPPPPPPPPPPK.',
    '.KKKKKKKKKKKKKK.',
    '.KK..........KK.',
    '.KK..........KK.'
  ];

  var CHAIR = [   // 10x13
    '.KKKKKKK..',
    '.KVVVVVK..',
    '.KVKVKVK..',
    '.KVVVVVK..',
    '.KKKKKKK..',
    '.KVVVVVKK.',
    '.KKKKKKKKK',
    '..KVK.KVK.',
    '..KVK.KVK.',
    '..KVK.KVK.',
    '..KKK.KKK.',
    '..........',
    '..........'
  ];

  var STAIRS = [   // 18x10 (subida a la ventana)
    '..............KKKK',
    '..............KGGK',
    '...........KKKKGGK',
    '...........KGGGGGK',
    '........KKKKGGGGGK',
    '........KGGGGGGGGK',
    '.....KKKKGGGGGGGGK',
    '.....KGGGGGGGGGGGK',
    '..KKKKGGGGGGGGGGGK',
    '..KKKKKKKKKKKKKKKK'
  ];

  /* ================= BICHOS ================= */

  var RAT_0 = [
    '..KKK...',
    '.KKKKK..',
    'KKgKgKK.',
    '.KKKKKKK',
    '..K..K..'
  ];
  var RAT_1 = [
    '..KKK...',
    '.KKKKK..',
    'KKgKgKK.',
    '.KKKKKKK',
    '..K..K..'
  ];
  var BAT_0 = [
    'KK......KK',
    'KKK....KKK',
    '.KKKVVKKK.',
    '..KKVVKK..',
    '...KVVK...',
    '....VV....',
    '....KK....'
  ];
  var BAT_1 = [
    '..........',
    '...KVVK...',
    '..KKVVKK..',
    '.KKVVVVKK.',
    'KKKVVVVKKK',
    'KK..VV..KK',
    '....KK....'
  ];

  /* ================= HUD ================= */

  var HEART = [
    '.KK.KK.',
    'KCCKCCK',
    'KCMKCCK',
    '.KCCCK.',
    '..KCK..',
    '...K...'
  ];
  var HEART_EMPTY = [
    '.KK.KK.',
    'KPPKPPK',
    'KPPKPPK',
    '.KPPPK.',
    '..KPK..',
    '...K...'
  ];
  var EXCLAM = [
    'MMM',
    'MMM',
    'MMM',
    'MMM',
    'MMM',
    '...',
    'MMM',
    'MMM'
  ];

  /* ============================================================
     HORNO DE SPRITES
     ============================================================ */

  var DEFS = {
    HOOD_DOWN_0: HOOD_DOWN_0, HOOD_DOWN_1: HOOD_DOWN_1,
    HOOD_UP_0: HOOD_UP_0, HOOD_UP_1: HOOD_UP_1,
    HOOD_SIDE_0: HOOD_SIDE_0, HOOD_SIDE_1: HOOD_SIDE_1,
    HOOD_SIT: HOOD_SIT, HOOD_HIDE: HOOD_HIDE,
    GIRL_DOWN: GIRL_DOWN, GIRL_UP: GIRL_UP,
    GIRL_SIDE: GIRL_SIDE, GIRL_WAVE: GIRL_WAVE,
    SIS_DOWN_0: SIS_DOWN_0, SIS_DOWN_1: SIS_DOWN_1,
    SIS_UP_0: SIS_UP_0, SIS_UP_1: SIS_UP_1,
    SIS_SIDE_0: SIS_SIDE_0, SIS_SIDE_1: SIS_SIDE_1,
    FLAME_A: FLAME_A, FLAME_B: FLAME_B, FLAME_C: FLAME_C,
    CANDLE: CANDLE, SCONCE: SCONCE,
    TOMB_CROSS: TOMB_CROSS, TOMB_ROUND: TOMB_ROUND, TOMB_BROKEN: TOMB_BROKEN,
    SKULL: SKULL, BONES: BONES,
    DEADTREE: DEADTREE,
    WINDOW_LIT_0: WINDOW_LIT_0, WINDOW_LIT_1: WINDOW_LIT_1,
    COLUMN: COLUMN, SHELF: SHELF, CHAIR: CHAIR, STAIRS: STAIRS,
    RAT_0: RAT_0, RAT_1: RAT_1, BAT_0: BAT_0, BAT_1: BAT_1,
    HEART: HEART, HEART_EMPTY: HEART_EMPTY, EXCLAM: EXCLAM
  };

  var Spr = {
    frames: null,   // frames[nombre][fade] y frames[nombre+'#F'][fade]

    init: function () {
      this.frames = {};
      for (var name in DEFS) {
        var rows = DEFS[name];
        var w = rows[0].length, h = rows.length;
        for (var r = 0; r < rows.length; r++) {
          if (rows[r].length !== w) {
            throw new Error('SPRITE ' + name + ' fila ' + r + ' tiene ' +
              rows[r].length + ' px, se esperaban ' + w + ' >> ' + rows[r]);
          }
        }
        this.frames[name] = [];
        this.frames[name + '#F'] = [];   // volteado
        for (var f = 0; f < M.FADESWAP.length; f++) {
          this.frames[name][f] = this._bake(rows, w, h, f, false);
          this.frames[name + '#F'][f] = this._bake(rows, w, h, f, true);
        }
      }
      // hornear los arcos góticos procedurales (ogiva equilátera)
      this.bakeArchSprite('GOARCH', { halfOpen: 16, ring: 7 });
      this.bakeArchSprite('GOARCHW', { halfOpen: 8, ring: 5 });
      this.bakeIronGate();
      this.bakeDoorG();
    },

    /* ============================================================
       ARCO GÓTICO PROCEDURAL — ogiva equilátera: dos arcos de
       circunferencia de radio 2*halfOpen que se cruzan en el
       ápice. Las DOVELAS cabalgan SOBRE la curva (dentro del
       vano), clave MAGENTA en el ápice, salmeros y machones
       flanqueando el arranque.
       ============================================================ */
    bakeArchSprite: function (name, opts) {
      var halfOpen = opts.halfOpen, ring = opts.ring;
      var R = 2 * halfOpen;                    // equilátera
      var rise = Math.round(Math.sqrt(R * R - (R - halfOpen) * (R - halfOpen)));
      var W = (halfOpen + 3) * 2;              // vano + flamencos
      var H = rise + 12;                       // arco + machones
      var springY = H - 6;

      // curva del arco a distancia d del eje: la mitad izquierda
      // sigue el círculo derecho (centrado a R-halfOpen del eje)
      function archY(d) {
        if (d >= halfOpen) return springY;
        var dx = (R - halfOpen) + d;
        return Math.round(springY - Math.sqrt(Math.max(0, R * R - dx * dx)));
      }

      this.frames[name] = [];
      for (var f = 0; f < M.FADESWAP.length; f++) {
        var sw = M.FADESWAP[f];
        var cv = document.createElement('canvas');
        cv.width = W; cv.height = H;
        var ctx = cv.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        var cx = W / 2;
        var px, y, d, yc;

        for (px = 0; px < W; px++) {
          d = Math.abs(px + 0.5 - cx);
          if (d > halfOpen + 2.5) continue;     // fuera del arco
          yc = archY(Math.min(d, halfOpen));
          for (y = 0; y < H; y++) {
            var ci = -1;
            if (d >= halfOpen - 1.5) {
              // flamencos: salmeros junto al vano y machones
              if (y >= yc - 2 && y < springY) {
                ci = (y === yc - 2) ? 0 : 2;
              } else if (y >= springY) {
                ci = (y === springY || (y - springY) % 8 === 0) ? 0 : 2;
              }
            } else {
              if (y >= yc && y < springY) continue;   // vano: transparente
              if (y >= yc - ring && y < yc) {
                // dovela sobre la curva
                if (y === yc - 1) ci = 0;                       // intradós
                else if (d < 3.5) ci = 5;                       // CLAVE magenta
                else if (d < 5) ci = 0;                         // junta de clave
                else if (Math.floor(d / 5) !== Math.floor((d - 1) / 5)) ci = 0; // junta radial
                else if (y === yc - ring + 1) ci = 12;          // canto gris
                else ci = 2;                                   // sillar violeta
              }
            }
            if (ci < 0) continue;
            ctx.fillStyle = M.PAL_MASTER[sw[ci]];
            ctx.fillRect(px, y, 1, 1);
          }
        }
        this.frames[name].push(cv);
      }
    },

    /* PUERTA CARMESÍ: doble hoja que llena la ogiva exacta */
    bakeDoorG: function () {
      var halfOpen = 15, R = 2 * 16;
      var rise = Math.round(Math.sqrt(R * R - (R - 16) * (R - 16)));
      var W = 30, H = rise;

      function archY(d) {
        if (d >= 16) return H;
        var dx = (R - 16) + d;
        return Math.round(H - Math.sqrt(Math.max(0, R * R - dx * dx)));
      }

      this.frames.DOORG = [];
      for (var f = 0; f < M.FADESWAP.length; f++) {
        var sw = M.FADESWAP[f];
        var cv = document.createElement('canvas');
        cv.width = W; cv.height = H;
        var ctx = cv.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        var cx = W / 2;
        var px, y;
        for (px = 0; px < W; px++) {
          var d = Math.abs(px + 0.5 - cx);
          var yc = archY(d);
          for (y = yc; y < H; y++) {
            var ci;
            if (Math.abs(px + 0.5 - cx) < 1) ci = 0;            // juntura central
            else if (y === yc) ci = 0;                          // borde superior
            else if (y % 9 === 0) ci = 7;                       // tabelas horizontales
            else if (Math.abs(px + 0.5 - cx) > 12) ci = 7;      // canto sombreado
            else ci = 6;                                        // hoja carmesí
            // herrajes
            if ((Math.abs(Math.abs(px + 0.5 - cx) - 5) < 1) && (y === Math.round(H * 0.62) || y === Math.round(H * 0.62) + 1)) ci = 5;
            ctx.fillStyle = M.PAL_MASTER[sw[ci]];
            ctx.fillRect(px, y, 1, 1);
          }
        }
        this.frames.DOORG.push(cv);
      }
    },

    /* PORTÓN DE HIERRO: reja que llena el vano de la ogiva */
    bakeIronGate: function () {
      var halfOpen = 15, R = 2 * 16;
      var rise = Math.round(Math.sqrt(R * R - (R - 16) * (R - 16)));
      var W = 30, H = rise + 6;
      var springY = H - 3;

      function archY(d) {
        if (d >= 16) return springY;
        var dx = (R - 16) + d;
        return Math.round(springY - Math.sqrt(Math.max(0, R * R - dx * dx)));
      }

      this.frames.IRONGATE = [];
      for (var f = 0; f < M.FADESWAP.length; f++) {
        var sw = M.FADESWAP[f];
        var cv = document.createElement('canvas');
        cv.width = W; cv.height = H;
        var ctx = cv.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        var cx = W / 2;
        var px, y;
        // fondo negro del vano
        ctx.fillStyle = M.PAL_MASTER[sw[0]];
        ctx.fillRect(0, 0, W, H);
        for (px = 0; px < W; px++) {
          var d = Math.abs(px + 0.5 - cx);
          var yc = archY(d);
          // verjas verticales cada 5 px
          if (px % 5 === 2) {
            for (y = yc + 1; y < H; y++) {
              var ci = (y < yc + 4) ? 5 : 1;   // punta magenta, barra violeta
              ctx.fillStyle = M.PAL_MASTER[sw[ci]];
              ctx.fillRect(px, y, 2, 1);
            }
          }
        }
        // travesaños negros
        ctx.fillStyle = M.PAL_MASTER[sw[0]];
        ctx.fillRect(2, Math.round(H * 0.42), W - 4, 2);
        ctx.fillRect(2, Math.round(H * 0.78), W - 4, 2);
        this.frames.IRONGATE.push(cv);
      }
    },

    _bake: function (rows, w, h, fade, flip) {
      var cv = document.createElement('canvas');
      cv.width = w; cv.height = h;
      var ctx = cv.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      var sw = M.FADESWAP[fade];
      for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
          var ci = CH[rows[y].charAt(flip ? (w - 1 - x) : x)];
          if (ci < 0) continue;
          ctx.fillStyle = M.PAL_MASTER[sw[ci]];
          ctx.fillRect(x, y, 1, 1);
        }
      }
      return cv;
    },

    get: function (name, fade, flip) {
      var key = flip ? (name + '#F') : name;
      var fr = this.frames[key];
      if (!fr) throw new Error('sprite inexistente: ' + name);
      return fr[Math.max(0, Math.min(fr.length - 1, fade | 0))];
    },

    draw: function (ctx, name, x, y, opts) {
      opts = opts || {};
      ctx.drawImage(this.get(name, opts.fade || 0, !!opts.flip),
        Math.round(x), Math.round(y));
    },

    w: function (name) { return this.frames[name][0].width; },
    h: function (name) { return this.frames[name][0].height; },

    /* ---- llama animada (elige fotograma por tiempo) ---- */
    drawFlame: function (ctx, x, y, t, fade) {
      var i = Math.floor(t * 9) % 3;
      this.draw(ctx, 'FLAME_' + 'ABC'.charAt(i), x, y, { fade: fade });
    },

    /* ============================================================
       DIBUJOS PROCEDURALES DE UN SOLO PLANO (fillRect, sin AA):
       círculos por líneas de barrido — la técnica 1987.
       ============================================================ */

    // círculo plano: relleno + contorno de 1 px (paleta opcional)
    _disc: function (ctx, cx, cy, r, fillIdx, outlineIdx, pal) {
      pal = pal || function (ci) { return M.PAL[ci]; };
      for (var dy = -r; dy <= r; dy++) {
        var w = Math.floor(Math.sqrt(r * r - dy * dy));
        if (w < 0) continue;
        ctx.fillStyle = pal(fillIdx);
        ctx.fillRect(Math.round(cx - w), Math.round(cy + dy), w * 2 + 1, 1);
      }
      if (outlineIdx === undefined) return;
      ctx.fillStyle = pal(outlineIdx);
      for (dy = -r; dy <= r; dy++) {
        var w2 = Math.floor(Math.sqrt(r * r - dy * dy));
        if (w2 < 0) continue;
        ctx.fillRect(Math.round(cx - w2), Math.round(cy + dy), 1, 1);
        ctx.fillRect(Math.round(cx + w2), Math.round(cy + dy), 1, 1);
      }
      ctx.fillRect(Math.round(cx - r), Math.round(cy), r * 2 + 1, 1);
      ctx.fillRect(Math.round(cx - r), Math.round(cy), 1, 1);
    },

    // la luna: disco gris con cráteres y contorno negro
    // (coordenadas SIEMPRE enteras: cero antialiasing; pal opcional
    //  para hornearla en un fondo con banco de fundido concreto)
    drawMoon: function (ctx, cx, cy, r, pal) {
      pal = pal || function (ci) { return M.PAL[ci]; };
      cx = Math.round(cx); cy = Math.round(cy); r = Math.round(r);
      this._disc(ctx, cx, cy, r, M.C.GRAY, M.C.BLACK, pal);
      ctx.fillStyle = pal(M.C.DGRAY);
      ctx.fillRect(cx - (r >> 1), cy - Math.round(r / 3), 3, 2);
      ctx.fillRect(cx + 2, cy + 1, 4, 3);
      ctx.fillRect(cx - 3, cy + (r >> 1), 3, 2);
      ctx.fillRect(cx + (r >> 1), cy - (r >> 1) + 1, 2, 2);
    },

    // estrella de 1 px (parpadea por fase)
    drawStar: function (ctx, x, y, big, on) {
      if (!on) return;
      ctx.fillStyle = M.PAL[big ? M.C.WHITE : M.C.GRAY];
      ctx.fillRect(x, y, 1, 1);
      if (big) {
        ctx.fillRect(x - 1, y, 1, 1); ctx.fillRect(x + 1, y, 1, 1);
        ctx.fillRect(x, y - 1, 1, 1); ctx.fillRect(x, y + 1, 1, 1);
      }
    },

    /* el GRAN ARBOL (huerta y portada): corona de DISCOS
       superpuestos con contorno negro y tronco VIOLETA macizo
       (visible sobre el cielo negro) con raices y frutos magenta */
    drawBigTree: function (ctx, x, y, t) {
      var C = M.C;
      var K = M.PAL[C.BLACK], V = M.PAL[C.DVIOLET], P = M.PAL[C.DPURPLE];
      // tronco: masa violeta con contorno negro, veta purpura
      ctx.fillStyle = V;
      ctx.fillRect(x + 17, y + 34, 14, 78);          // fuste
      ctx.fillRect(x + 13, y + 104, 22, 8);          // ensanche
      ctx.fillRect(x + 8, y + 110, 8, 7);            // raiz izq
      ctx.fillRect(x + 32, y + 110, 8, 7);           // raiz der
      ctx.fillStyle = P;
      ctx.fillRect(x + 22, y + 38, 3, 66);           // veta oscura
      ctx.fillRect(x + 27, y + 84, 2, 20);
      // contorno negro del tronco y raices
      ctx.fillStyle = K;
      ctx.fillRect(x + 16, y + 34, 1, 78); ctx.fillRect(x + 31, y + 34, 1, 78);
      ctx.fillRect(x + 16, y + 104, 17, 1); ctx.fillRect(x + 12, y + 104, 1, 8);
      ctx.fillRect(x + 34, y + 104, 1, 8);
      ctx.fillRect(x + 7, y + 110, 1, 7); ctx.fillRect(x + 8, y + 117, 8, 1);
      ctx.fillRect(x + 31, y + 110, 1, 7); ctx.fillRect(x + 32, y + 117, 8, 1);
      // ramas violetas gruesas hacia la corona
      ctx.fillStyle = V;
      ctx.fillRect(x + 15, y + 30, 14, 10);
      ctx.fillRect(x + 5, y + 22, 14, 10);
      ctx.fillRect(x + 27, y + 20, 14, 10);
      ctx.fillStyle = K;
      ctx.fillRect(x + 14, y + 30, 1, 10); ctx.fillRect(x + 29, y + 30, 1, 10);
      ctx.fillRect(x + 4, y + 22, 1, 10); ctx.fillRect(x + 19, y + 22, 1, 10);
      ctx.fillRect(x + 26, y + 20, 1, 10); ctx.fillRect(x + 41, y + 20, 1, 10);
      // corona: halo negro EXPANDIDO bajo las masas de color:
      // el contorno abraza la union (festones) sin lineas internas
      this._disc(ctx, x + 14, y + 16, 13, C.BLACK);
      this._disc(ctx, x + 36, y + 18, 12, C.BLACK);
      this._disc(ctx, x + 24, y + 9, 12, C.BLACK);
      this._disc(ctx, x + 9, y + 27, 10, C.BLACK);
      this._disc(ctx, x + 39, y + 29, 10, C.BLACK);
      this._disc(ctx, x + 24, y + 23, 14, C.BLACK);
      this._disc(ctx, x + 14, y + 16, 12, C.DPURPLE);
      this._disc(ctx, x + 36, y + 18, 11, C.DPURPLE);
      this._disc(ctx, x + 24, y + 9, 11, C.DVIOLET);
      this._disc(ctx, x + 9, y + 27, 9, C.DVIOLET);
      this._disc(ctx, x + 39, y + 29, 9, C.DVIOLET);
      this._disc(ctx, x + 24, y + 23, 13, C.DPURPLE);
      // frutos magenta: aparecen y desaparecen (parpadeo 1987)
      var fruits = [[8, 8], [24, 4], [40, 12], [4, 24], [34, 22], [14, 28], [42, 30], [22, 34]];
      for (var i = 0; i < fruits.length; i++) {
        if (Math.sin(t * (1.1 + i * 0.35) + i * 2) > -0.2) {
          ctx.fillStyle = M.PAL[C.MAGENTA];
          ctx.fillRect(x + fruits[i][0], y + fruits[i][1], 2, 2);
        }
      }
    },

    /* silueta del convento para la portada: torre con tejado
       apuntado, CRUZ blanca, campanario, puerta ojival y la
       ventana encendida */
    drawConventSil: function (ctx, x, y) {
      var C = M.C;
      ctx.fillStyle = M.PAL[C.DPURPLE];
      ctx.fillRect(x, y + 40, 96, 48);        // cuerpo
      ctx.fillRect(x + 28, y + 12, 36, 30);   // torre
      // tejado triangular por líneas
      for (var i = 0; i < 14; i++) {
        var hw = Math.round((i / 13) * 16);
        ctx.fillRect(x + 46 - hw, y + 12 - 14 + i, hw * 2 + 1, 1);
      }
      // cruz blanca GRANDE sobre la torre
      ctx.fillStyle = M.PAL[C.WHITE];
      ctx.fillRect(x + 45, y - 12, 2, 16);
      ctx.fillRect(x + 40, y - 7, 12, 2);
      // campanario: vano negro apuntado
      ctx.fillStyle = M.PAL[C.BLACK];
      ctx.fillRect(x + 42, y + 20, 8, 10);
      ctx.fillRect(x + 44, y + 17, 4, 3);
      // puerta del convento: vano apuntado
      ctx.fillRect(x + 42, y + 76, 12, 12);
      ctx.fillRect(x + 45, y + 72, 6, 5);
      // ventanucos apagados
      ctx.fillRect(x + 10, y + 52, 6, 8);
      ctx.fillRect(x + 24, y + 52, 6, 8);
      ctx.fillRect(x + 66, y + 52, 6, 8);
      ctx.fillRect(x + 80, y + 46, 6, 8);
      ctx.fillRect(x + 80, y + 62, 6, 8);
      // ventana encendida (la llama late)
      ctx.fillStyle = M.PAL[C.ORANGE];
      ctx.fillRect(x + 31, y + 26, 6, 8);
      ctx.fillStyle = M.PAL[C.YELLOW];
      ctx.fillRect(x + 33, y + 28, 2, 4);
    },

    /* LA CARA: ella mira de vuelta (destello de 3 fotogramas) */
    drawFace: function (ctx, cx, cy) {
      var C = M.C;
      this._disc(ctx, cx, cy, 11, C.BONE, C.BLACK);
      // cuencas vacías
      ctx.fillStyle = M.PAL[C.BLACK];
      ctx.fillRect(cx - 7, cy - 4, 5, 6);
      ctx.fillRect(cx + 2, cy - 4, 5, 6);
      // brillo magenta dentro de las cuencas
      ctx.fillStyle = M.PAL[C.MAGENTA];
      ctx.fillRect(cx - 6, cy - 2, 2, 2);
      ctx.fillRect(cx + 3, cy - 2, 2, 2);
      // boca: sonrisa demasiado larga
      ctx.fillStyle = M.PAL[C.BLACK];
      ctx.fillRect(cx - 6, cy + 5, 12, 2);
      ctx.fillRect(cx - 7, cy + 4, 2, 1);
      ctx.fillRect(cx + 5, cy + 4, 2, 1);
      // mechones
      ctx.fillStyle = M.PAL[C.BLACK];
      ctx.fillRect(cx - 8, cy - 12, 3, 8);
      ctx.fillRect(cx + 5, cy - 12, 3, 8);
      ctx.fillRect(cx - 2, cy - 13, 4, 6);
    },

    /* carretes de la cinta (pantalla de arranque) */
    drawTape: function (ctx, cx, cy, t) {
      var C = M.C;
      this._disc(ctx, cx - 20, cy, 10, C.DPURPLE, C.BLACK);
      this._disc(ctx, cx + 20, cy, 10, C.DPURPLE, C.BLACK);
      this._disc(ctx, cx - 20, cy, 3, C.BLACK);
      this._disc(ctx, cx + 20, cy, 3, C.BLACK);
      // radios giratorias
      var a = t * 5;
      ctx.fillStyle = M.PAL[C.MAGENTA];
      for (var i = 0; i < 3; i++) {
        var ang = a + i * 2.094;
        ctx.fillRect(Math.round(cx - 20 + Math.cos(ang) * 6), Math.round(cy + Math.sin(ang) * 6), 2, 2);
        ctx.fillRect(Math.round(cx + 20 + Math.cos(ang * 1.4) * 6), Math.round(cy + Math.sin(ang * 1.4) * 6), 2, 2);
      }
      // cinta entre carretes
      ctx.fillStyle = M.PAL[C.DGRAY];
      ctx.fillRect(cx - 12, cy - 6, 24, 1);
      ctx.fillRect(cx - 12, cy + 5, 24, 1);
    }
  };

  M.Spr = Spr;
})(window.MISTICAS);
