'use strict';
/* ============================================================
   MÍSTICAS — (C) 1987 — sprites.js
   Pixel-art definido como mapas de caracteres (paleta 0-F).
   '.'=transparente, '0'-'9'/'A'-'F' = índice de paleta.
   PERSONAJES rediseñados a mano píxel a píxel según el canon de
   las capturas reales del podcast (Dinamic/UMG, Amstrad 1987):
   - EL NIÑO 16x24: capucha roja con vivo azul-violeta, cara
     salmón, chaqueta roja, pantalón azul-morado, botas sangre.
   - LA NIÑA 16x26: pelo violeta-oscuro, vestido blanco largo
     con pliegues en hueso.
   - LA HERMANA 18x28: hábito oscuro con cofia de hueso y vela.
   Los grandes (árbol, luna, arcos, escaleras, puerta) se
   generan por código en canvas pre-renderizado.
   ============================================================ */
(function (M) {

  var S = {}; // banco de sprites

  function spr(w, h, rows) {
    // aviso de anchura inconsistente (solo consola)
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].length !== w) {
        console.warn('MISTICAS: sprite con fila de ancho distinto', i, rows[i].length, w);
      }
    }
    return { w: w, h: h, rows: rows };
  }

/* ==== EL NIÑO (16x24) ====*/

  
  S.boyS_stand = spr(16, 24, [
    '.....088880.....',
    '....08888880....',
    '...0888888880...',
    '...0888888880...',
    '..088888888880..',
    '..083777777380..',
    '..037777777730..',
    '..037707707730..',
    '..037777777730..',
    '...0377777730...',
    '...0888888880...',
    '..088888888880..',
    '..089988888880..',
    '..089988888880..',
    '..088888888880..',
    '..088888888880..',
    '..038888888830..',
    '...0888888880...',
    '...0333333330...',
    '...0333..3330...',
    '...0333..3330...',
    '...0FFF..FFF0...',
    '...0FFF..FFF0...',
    '....000..000....'
  ]);

  
  S.boyS_walkA = spr(16, 24, [
    '.....088880.....',
    '....08888880....',
    '...0888888880...',
    '...0888888880...',
    '..088888888880..',
    '..083777777380..',
    '..037777777730..',
    '..037707707730..',
    '..037777777730..',
    '...0377777730...',
    '...0888888880...',
    '..088888888880..',
    '..089988888880..',
    '..089988888880..',
    '..088888888880..',
    '..088888888880..',
    '..038888888830..',
    '...0888888880...',
    '...0333333330...',
    '..0330....0330..',
    '..0330....0330..',
    '..0FFF....FFF0..',
    '..0FFF....FFF0..',
    '...000....000...'
  ]);

  
  S.boyS_walkB = spr(16, 24, [
    '.....088880.....',
    '....08888880....',
    '...0888888880...',
    '...0888888880...',
    '..088888888880..',
    '..083777777380..',
    '..037777777730..',
    '..037707707730..',
    '..037777777730..',
    '...0377777730...',
    '...0888888880...',
    '..088888888880..',
    '..089988888880..',
    '..089988888880..',
    '..088888888880..',
    '..088888888880..',
    '..038888888830..',
    '...0888888880...',
    '...0333333330...',
    '....03333330....',
    '....03333330....',
    '....0FFFFFF0....',
    '....0FFFFFF0....',
    '.....000000.....'
  ]);

  
  S.boyN_stand = spr(16, 24, [
    '.....088880.....',
    '....08888880....',
    '...0888888880...',
    '...0888888880...',
    '..088888888880..',
    '..088888888880..',
    '..089988889980..',
    '..088880888880..',
    '..088888888880..',
    '...0888888880...',
    '...0888888880...',
    '..088888888880..',
    '..089988888880..',
    '..089988888880..',
    '..088888888880..',
    '..088888888880..',
    '..038888888830..',
    '...0888888880...',
    '...0333333330...',
    '...0333..3330...',
    '...0333..3330...',
    '...0FFF..FFF0...',
    '...0FFF..FFF0...',
    '....000..000....'
  ]);

  
  S.boyN_walkA = spr(16, 24, [
    '.....088880.....',
    '....08888880....',
    '...0888888880...',
    '...0888888880...',
    '..088888888880..',
    '..088888888880..',
    '..089988889980..',
    '..088880888880..',
    '..088888888880..',
    '...0888888880...',
    '...0888888880...',
    '..088888888880..',
    '..089988888880..',
    '..089988888880..',
    '..088888888880..',
    '..088888888880..',
    '..038888888830..',
    '...0888888880...',
    '...0333333330...',
    '..0330....0330..',
    '..0330....0330..',
    '..0FFF....FFF0..',
    '..0FFF....FFF0..',
    '...000....000...'
  ]);

  
  S.boyN_walkB = spr(16, 24, [
    '.....088880.....',
    '....08888880....',
    '...0888888880...',
    '...0888888880...',
    '..088888888880..',
    '..088888888880..',
    '..089988889980..',
    '..088880888880..',
    '..088888888880..',
    '...0888888880...',
    '...0888888880...',
    '..088888888880..',
    '..089988888880..',
    '..089988888880..',
    '..088888888880..',
    '..088888888880..',
    '..038888888830..',
    '...0888888880...',
    '...0333333330...',
    '....03333330....',
    '....03333330....',
    '....0FFFFFF0....',
    '....0FFFFFF0....',
    '.....000000.....'
  ]);

  
  S.boyW_stand = spr(16, 24, [
    '.....088880.....',
    '....08888880....',
    '...0888888880...',
    '...0888888880...',
    '..088888888880..',
    '..087777388880..',
    '..077077388880..',
    '..077773388880..',
    '..077773388880..',
    '..07773388880...',
    '...0888888880...',
    '..088888888880..',
    '..089888888880..',
    '..039888888880..',
    '..038888888880..',
    '..038888888880..',
    '...0888888880...',
    '...0888888880...',
    '...0333333330...',
    '....033.0330....',
    '....033.0330....',
    '....0FF.0FF0....',
    '....0FF.0FF0....',
    '.....00.00......'
  ]);

  
  S.boyW_walkA = spr(16, 24, [
    '.....088880.....',
    '....08888880....',
    '...0888888880...',
    '...0888888880...',
    '..088888888880..',
    '..087777388880..',
    '..077077388880..',
    '..077773388880..',
    '..077773388880..',
    '..07773388880...',
    '...0888888880...',
    '..088888888880..',
    '..089888888880..',
    '..039888888880..',
    '..038888888880..',
    '..038888888880..',
    '...0888888880...',
    '...0888888880...',
    '...0333333330...',
    '...0333..0333...',
    '...0330....033..',
    '...0FFF....0FF..',
    '...0FF0....0FF..',
    '...00......00...'
  ]);

  
  S.boyW_walkB = spr(16, 24, [
    '.....088880.....',
    '....08888880....',
    '...0888888880...',
    '...0888888880...',
    '..088888888880..',
    '..087777388880..',
    '..077077388880..',
    '..077773388880..',
    '..077773388880..',
    '..07773388880...',
    '...0888888880...',
    '..088888888880..',
    '..089888888880..',
    '..039888888880..',
    '..038888888880..',
    '..038888888880..',
    '...0888888880...',
    '...0888888880...',
    '...0333333330...',
    '....0333330.....',
    '.....033330.....',
    '....0FFFFF0.....',
    '.....0FFFF0.....',
    '......0000......'
  ]);

  
  S.boySit = spr(16, 16, [
    '.....088880.....',
    '....08888880....',
    '...0888888880...',
    '...0888888880...',
    '..088888888880..',
    '..083777777380..',
    '..037777777730..',
    '..037707707730..',
    '..037777777730..',
    '...0377777730...',
    '..088888888880..',
    '..089988888880..',
    '..089988888880..',
    '.03333333333330.',
    '..0FFF3333FFF0..',
    '..0000....0000..'
  ]);

  
  S.boyHide = spr(16, 14, [
    '................',
    '.....088880.....',
    '....08888880....',
    '...0888888880...',
    '..088888888880..',
    '..083777777380..',
    '..037707707730..',
    '..037777777730..',
    '..088888888880..',
    '.08888888888880.',
    '.08998888888880.',
    '.03333333333330.',
    '..0FFF....FFF0..',
    '..0000....0000..'
  ]);

/* ==== LA NIÑA (16x26) ====*/

  
  S.girlS_idle = spr(16, 26, [
    '.....022220.....',
    '....02222220....',
    '...0222222220...',
    '...022CCCC220...',
    '...02CCCCCC20...',
    '...02C0CC0C20...',
    '...02CCCCCC20...',
    '...022CCCC220...',
    '....02222220....',
    '...0222222220...',
    '..0222EEEE2220..',
    '..022EEEEEE220..',
    '..02EEEEEEEE20..',
    '..0EEEEEEEEEE0..',
    '..0ECEEEEEECE0..',
    '..0EEEEEEEEEE0..',
    '.0EEEEEEEEEEEE0.',
    '.0EECEEEEEECEE0.',
    '.0EEEEEEEEEEEE0.',
    '.0ECEEEEEEEECE0.',
    '.0EEEEEEEEEEEE0.',
    '.0EEEEEEEEEEEE0.',
    '..0CCEEEEEECC0..',
    '.0CCCCCCCCCCCC0.',
    '...0CC0..0CC0...',
    '................'
  ]);

  
  S.girlS_walkA = spr(16, 26, [
    '.....022220.....',
    '....02222220....',
    '...0222222220...',
    '...022CCCC220...',
    '...02CCCCCC20...',
    '...02C0CC0C20...',
    '...02CCCCCC20...',
    '...022CCCC220...',
    '....02222220....',
    '...0222222220...',
    '..0222EEEE2220..',
    '..022EEEEEE220..',
    '..02EEEEEEEE20..',
    '..0EEEEEEEEEE0..',
    '..0ECEEEEEECE0..',
    '..0EEEEEEEEEE0..',
    '.0EEEEEEEEEEEE0.',
    '.0EECEEEEEECEE0.',
    '.0EEEEEEEEEEEE0.',
    '.0ECEEEEEEEECE0.',
    '.0EEEEEEEEEEEE0.',
    '.0EEEEEEEEEEEE0.',
    '.0CCEEEEEECC0...',
    '.0CCCCCCCCCCCC0.',
    '.0CC0....0CC0...',
    '................'
  ]);

  
  S.girlS_walkB = spr(16, 26, [
    '.....022220.....',
    '....02222220....',
    '...0222222220...',
    '...022CCCC220...',
    '...02CCCCCC20...',
    '...02C0CC0C20...',
    '...02CCCCCC20...',
    '...022CCCC220...',
    '....02222220....',
    '...0222222220...',
    '..0222EEEE2220..',
    '..022EEEEEE220..',
    '..02EEEEEEEE20..',
    '..0EEEEEEEEEE0..',
    '..0ECEEEEEECE0..',
    '..0EEEEEEEEEE0..',
    '.0EEEEEEEEEEEE0.',
    '.0EECEEEEEECEE0.',
    '.0EEEEEEEEEEEE0.',
    '.0ECEEEEEEEECE0.',
    '.0EEEEEEEEEEEE0.',
    '.0EEEEEEEEEEEE0.',
    '...0CCEEEEEECC0.',
    '...0CCCCCCCCCCCC',
    '...0CC0....0CC0.',
    '................'
  ]);

  
  S.girlS_waveA = spr(16, 26, [
    '.....022220.....',
    '....02222220....',
    '...0222222220...',
    '...022CCCC220C..',
    '...02CCCCCC2CC..',
    '...02C0CC0C20C..',
    '...02CCCCCC20E..',
    '...022CCCC220E..',
    '....02222220.E..',
    '...022222222E...',
    '..0222EEEE2220..',
    '..022EEEEEE220..',
    '..02EEEEEEEE20..',
    '..0EEEEEEEEEE0..',
    '..0ECEEEEEECE0..',
    '..0EEEEEEEEEE0..',
    '.0EEEEEEEEEEEE0.',
    '.0EECEEEEEECEE0.',
    '.0EEEEEEEEEEEE0.',
    '.0ECEEEEEEEECE0.',
    '.0EEEEEEEEEEEE0.',
    '.0EEEEEEEEEEEE0.',
    '..0CCEEEEEECC0..',
    '.0CCCCCCCCCCCC0.',
    '...0CC0..0CC0...',
    '................'
  ]);

  
  S.girlS_waveB = spr(16, 26, [
    '.....022220.....',
    '....02222220.C..',
    '...0222222220CC.',
    '...022CCCC220C..',
    '...02CCCCCC20E..',
    '...02C0CC0C20E..',
    '...02CCCCCC20E..',
    '...022CCCC220E..',
    '....02222220.E..',
    '...022222222E...',
    '..0222EEEE2220..',
    '..022EEEEEE220..',
    '..02EEEEEEEE20..',
    '..0EEEEEEEEEE0..',
    '..0ECEEEEEECE0..',
    '..0EEEEEEEEEE0..',
    '.0EEEEEEEEEEEE0.',
    '.0EECEEEEEECEE0.',
    '.0EEEEEEEEEEEE0.',
    '.0ECEEEEEEEECE0.',
    '.0EEEEEEEEEEEE0.',
    '.0EEEEEEEEEEEE0.',
    '..0CCEEEEEECC0..',
    '.0CCCCCCCCCCCC0.',
    '...0CC0..0CC0...',
    '................'
  ]);

  
  S.girlW_idle = spr(16, 26, [
    '.....022220.....',
    '....02222220....',
    '...0222222220...',
    '..0CCCCC222220..',
    '..0C0CC2222220..',
    '..0CCCC2222220..',
    '..0CCCC2222220..',
    '...0CCC222220...',
    '....0CC22220....',
    '....02222220....',
    '...0EEEE2220....',
    '..0EEEEEE22220..',
    '..0EEEEEE22220..',
    '..0ECEEEE2220...',
    '..0EEEEEE22220..',
    '..0EEEEEE2220...',
    '..0EEEEEEE2220..',
    '.0EEEEEEEE2220..',
    '.0EEEEEEEEE220..',
    '.0EEEEEEEEEE20..',
    '.0EEEEEEEEEE20..',
    '.0CCCCCCCCC220..',
    '...0CCCCCC220...',
    '....0CC.0CC.....',
    '................',
    '................'
  ]);

  
  S.girlW_walkA = spr(16, 26, [
    '.....022220.....',
    '....02222220....',
    '...0222222220...',
    '..0CCCCC222220..',
    '..0C0CC2222220..',
    '..0CCCC2222220..',
    '..0CCCC2222220..',
    '...0CCC222220...',
    '....0CC22220....',
    '....02222220....',
    '...0EEEE2220....',
    '..0EEEEEE22220..',
    '..0EEEEEE22220..',
    '..0ECEEEE2220...',
    '..0EEEEEE22220..',
    '..0EEEEEE2220...',
    '..0EEEEEEE2220..',
    '.0EEEEEEEE2220..',
    '.0EEEEEEEEE220..',
    '.0EEEEEEEEEE20..',
    '.0EEEEEEEEEE20..',
    '.0CCCCCCCCC220..',
    '.0CCCCCC220.....',
    '.0CC...0CC......',
    '................',
    '................'
  ]);

  
  S.girlW_walkB = spr(16, 26, [
    '.....022220.....',
    '....02222220....',
    '...0222222220...',
    '..0CCCCC222220..',
    '..0C0CC2222220..',
    '..0CCCC2222220..',
    '..0CCCC2222220..',
    '...0CCC222220...',
    '....0CC22220....',
    '....02222220....',
    '...0EEEE2220....',
    '..0EEEEEE22220..',
    '..0EEEEEE22220..',
    '..0ECEEEE2220...',
    '..0EEEEEE22220..',
    '..0EEEEEE2220...',
    '..0EEEEEEE2220..',
    '.0EEEEEEEE2220..',
    '.0EEEEEEEEE220..',
    '.0EEEEEEEEEE20..',
    '.0EEEEEEEEEE20..',
    '.0CCCCCCCCC220..',
    '....0CCCCCC220..',
    '....0CC...0CC...',
    '................',
    '................'
  ]);

/* ==== LA HERMANA (18x28) ====*/

  
  S.nunS_a = spr(18, 28, [
    '......011110......',
    '.....01111110.....',
    '....0111111110....',
    '....0111111110....',
    '...011111111110...',
    '...01CCCCCCCC10...',
    '..01CCCCCCCCCC10..',
    '..01CCC0CC0CCC10..',
    '..01CCCCCCCCCC10..',
    '..01CCCCCCCCCC10..',
    '...01CCCCCCCC10...',
    'B..011111111110...',
    'BA01111111111110..',
    'BA01211111111210..',
    'D0111111111111110.',
    'D011211111112110..',
    '.0111111111111110.',
    '..01211111111210..',
    '.0111111111111110.',
    '011211111111112110',
    '011111111111111110',
    '011111111111111110',
    '011211111111112110',
    '011111111111111110',
    '011111111111111110',
    '011111111111111110',
    '.0000000000000000.',
    '..................'
  ]);

  
  S.nunS_b = spr(18, 28, [
    '......011110......',
    '.....01111110.....',
    '....0111111110....',
    '....0111111110....',
    '...011111111110...',
    '...01CCCCCCCC10...',
    '..01CCCCCCCCCC10..',
    '..01CCC0CC0CCC10..',
    '..01CCCCCCCCCC10..',
    '..01CCCCCCCCCC10..',
    '...01CCCCCCCC10...',
    '...011111111110..B',
    '..01111111111110AB',
    '..01211111111210AB',
    '.0111111111111110D',
    '.011211111112110.D',
    '.0111111111111110.',
    '..01211111111210..',
    '.0111111111111110.',
    '011211111111112110',
    '011111111111111110',
    '011111111111111110',
    '011211111111112110',
    '011111111111111110',
    '011111111111111110',
    '011111111111111110',
    '.0000000000000000.',
    '..................'
  ]);

  
  S.nunS_alert = spr(18, 28, [
    '......011110......',
    '.....01111110.....',
    '....0111111110....',
    '....0111111110....',
    '...011111111110...',
    '...01CCCCCCCC10...',
    '..01CCCCCCCCCC10..',
    '..01CCC8CC8CCC10..',
    '..01CCCCCCCCCC10..',
    '..01CCCCCCCCCC10..',
    'B..01CCCCCCCC10...',
    'B..011111111110...',
    'BA01111111111110..',
    'BA01211111111210..',
    'D0111111111111110.',
    'D011211111112110..',
    '.0111111111111110.',
    '..01211111111210..',
    '.0111111111111110.',
    '011211111111112110',
    '011111111111111110',
    '011111111111111110',
    '011211111111112110',
    '011111111111111110',
    '011111111111111110',
    '011111111111111110',
    '.0000000000000000.',
    '..................'
  ]);

  
  S.nunW_a = spr(18, 28, [
    '......011110......',
    '.....01111110.....',
    '....0111111110....',
    '....0CCCC11110....',
    '...0CCCCC11110....',
    '...0C0CC111110....',
    '...0CCCC111110....',
    '....0CCC11110.....',
    '.....0CC11110.....',
    '.....01111110.....',
    '....0111111110....',
    'B..011111111110...',
    'BA01111111111110..',
    'BA01211111111210..',
    'D0111111111111110.',
    'D011211111112110..',
    '.0111111111111110.',
    '..01211111111210..',
    '.0111111111111110.',
    '011211111111112110',
    '011111111111111110',
    '011111111111111110',
    '011211111111112110',
    '011111111111111110',
    '011111111111111110',
    '011111111111111110',
    '.0000000000000000.',
    '..................'
  ]);

  
  S.nunW_b = spr(18, 28, [
    '......011110......',
    '.....01111110.....',
    '....0111111110....',
    '....0CCCC11110....',
    '...0CCCCC11110....',
    '...0C0CC111110....',
    '...0CCCC111110....',
    '....0CCC11110.....',
    '.....0CC11110.....',
    '.....01111110.....',
    '....0111111110....',
    '...011111111110..B',
    '..01111111111110AB',
    '..01211111111210AB',
    '.0111111111111110D',
    '.011211111112110.D',
    '.0111111111111110.',
    '..01211111111210..',
    '.0111111111111110.',
    '011211111111112110',
    '011111111111111110',
    '011111111111111110',
    '011211111111112110',
    '011111111111111110',
    '011111111111111110',
    '011111111111111110',
    '.0000000000000000.',
    '..................'
  ]);

/* ==== PROPS ====*/

  
  S.tomb1 = spr(12, 15, [
    '.....77.....',
    '.....77.....',
    '.....77.....',
    '..77777777..',
    '..7DDDDDD7..',
    '.....77.....',
    '.....7D.....',
    '.....77.....',
    '.....77.....',
    '..7DDDDDD7..',
    '.7777777777.',
    '777777777777',
    '777777777777',
    '............',
    '............'
  ]);

  
  S.tomb2 = spr(12, 14, [
    '....0770....',
    '....7DD7....',
    '..7DDDDD7...',
    '..7DDDDD7...',
    '...7D11D7...',
    '..7DDDDD7...',
    '...7D11D7...',
    '..7DDDDD7...',
    '..7DDDDD7...',
    '..7DDDDD7...',
    '..7DDDDD7...',
    '.7DDDDDDD7..',
    '777777777777',
    '.7777777777.'
  ]);

  
  S.tomb3 = spr(13, 19, [
    '.....787.....',
    '.....787.....',
    '....07870....',
    '....08880....',
    '....08880....',
    '....08880....',
    '....08F80....',
    '....08880....',
    '....08880....',
    '....08F80....',
    '....08880....',
    '....08880....',
    '...0788870...',
    '..07888870...',
    '..07777770...',
    '..07777770...',
    '..077777770..',
    '.0777777770..',
    '7777777777777'
  ]);

  
  S.shelf = spr(16, 24, [
    '7777777777777777',
    '7777777777777777',
    '7111111111111117',
    '7177777777777717',
    '7171111111111717',
    '7171111111111717',
    '717111CCCC111717',
    '717111CCCC111717',
    '7171111111111717',
    '7177777777777717',
    '7111111111111117',
    '7177777777777717',
    '7111111111111117',
    '7177777777777717',
    '7171111111111717',
    '7171111111111717',
    '717111CCCC111717',
    '717111CCCC111717',
    '7171111111111717',
    '7177777777777717',
    '7111111111111117',
    '7177777777777717',
    '7777777777777777',
    '7777777777777777'
  ]);

  
  S.skull = spr(8, 7, [
    '.07770..',
    '0777770.',
    '0777770.',
    '0700770.',
    '0777770.',
    '.07770..',
    '..0CC0..'
  ]);

  
  S.bones = spr(12, 6, [
    '77........77',
    '..77......77',
    '....7CCCCC7.',
    '.....7CCC7..',
    '..77......77',
    '77........77'
  ]);

  
  S.sconce = spr(8, 14, [
    '..050...',
    '.05550..',
    '.05750..',
    '.05550..',
    '..050...',
    '..000...',
    '...B....',
    '..BAB...',
    '..BAB...',
    '...A....',
    '...D....',
    '...D....',
    '...D....',
    '..000...'
  ]);

  /* ---------------- OBJETOS ---------------- */

  S.candle_a = spr(6, 11, [
    '...B..',
    '..BBB.',
    '..BAB.',
    '...A..',
    '..DCD.',
    '..DCD.',
    '..DCD.',
    '..DCD.',
    '..DDD.',
    '.DDDDD',
    '......'
  ]);
  S.candle_b = spr(6, 11, [
    '..BB..',
    '.BBB..',
    '.BAB..',
    '...A..',
    '..DCD.',
    '..DCD.',
    '..DCD.',
    '..DCD.',
    '..DDD.',
    '.DDDDD',
    '......'
  ]);

  S.heartFull = spr(9, 8, [
    '.FF...FF.',
    'F8E88888F',
    'F8888888F',
    'F8888888F',
    '.F88888F.',
    '..F888F..',
    '...F8F...',
    '....F....'
  ]);
  S.heartEmpty = spr(9, 8, [
    '.FF...FF.',
    'F......F.',
    'F......F.',
    'F......F.',
    '.F....F..',
    '..F..F...',
    '...F.F...',
    '....F....'
  ]);

  // El libro abierto (dos páginas de hueso, tapa carmesí)
  S.bookA = spr(10, 5, [
    '..CCCCCC..',
    '.CCCCCCCC.',
    'CC1CCCC1CC',
    '.8......8.',
    '.88888888.'
  ]);
  S.bookB = spr(10, 5, [
    '..CCCCCC..',
    '.CCCCCCCC.',
    'C1CCCCCC1C',
    '.8......8.',
    '.88888888.'
  ]);

  /* ---------------- CEMENTERIO ---------------- */

  S.fence = spr(12, 10, [
    '.1..1..1..1.',
    '.2..2..2..2.',
    '222222222222',
    '.2..2..2..2.',
    '.2..2..2..2.',
    '222222222222',
    '.2..2..2..2.',
    '.2..2..2..2.',
    '.2..2..2..2.',
    '............'
  ]);
  S.bat_a = spr(7, 3, ['6.....6', '.66666.', '..666..']);
  S.bat_b = spr(7, 3, ['.......', '6666666', '..666..']);
  S.rat_a = spr(8, 4, ['......11', '.111111.', '11111111', '.2..2...']);
  S.rat_b = spr(8, 4, ['11......', '.111111.', '11111111', '...2..2.']);

  /* ---------------- CONVENTO ---------------- */

  S.window = spr(16, 20, [
    '.....DDDDDD.....',
    '...DDDDDDDDDD...',
    '..DDDDDDDDDDDD..',
    '..DD00000000DD..',
    '.DD0000000000DD.',
    '.DD0020000200DD.',
    '.DD0020000200DD.',
    '.DD0020000200DD.',
    '.DD0020000200DD.',
    '.DD0020000200DD.',
    '.DD0020000200DD.',
    '.DD0020000200DD.',
    '.DD0020000200DD.',
    '.DD0020000200DD.',
    '.DD0000000000DD.',
    '.DDDDDDDDDDDDDD.',
    '..DDDDDDDDDDDD..',
    '.DDDDDDDDDDDDDD.',
    '..333333333333..',
    '................'
  ]);

  // Columna (canon): capitel y base SALMÓN, fuste rojo vivo con
  // sombra sangre y basamenta violeta
  S.column = spr(12, 28, [
    '.077777770..',
    '.077777770..',
    '.0DDDDDDD0..',
    '.078888870..',
    '..0788870...',
    '..0788870...',
    '..0788870...',
    '..0788870...',
    '..0788870...',
    '..0788870...',
    '..0788870...',
    '..0788870...',
    '..0788870...',
    '..0788870...',
    '..0788870...',
    '..0788870...',
    '..0788870...',
    '..0788870...',
    '..0788870...',
    '..0788870...',
    '..0788870...',
    '..0788870...',
    '..0788870...',
    '.078888870..',
    '.077777770..',
    '.0DDDDDDD0..',
    '.077777770..',
    '............'
  ]);

  /* ---------------- conjuntos por dirección ---------------- */
  S.boyS = { stand: S.boyS_stand, walkA: S.boyS_walkA, walkB: S.boyS_walkB };
  S.boyN = { stand: S.boyN_stand, walkA: S.boyN_walkA, walkB: S.boyN_walkB };
  S.boyW = { stand: S.boyW_stand, walkA: S.boyW_walkA, walkB: S.boyW_walkB };
  S.girlS = { idle: S.girlS_idle, waveA: S.girlS_waveA, waveB: S.girlS_waveB, walkA: S.girlS_walkA, walkB: S.girlS_walkB };
  S.girlW = { idle: S.girlW_idle, walkA: S.girlW_walkA, walkB: S.girlW_walkB };
  S.nunS = { a: S.nunS_a, b: S.nunS_b, alert: S.nunS_alert };
  S.nunW = { a: S.nunW_a, b: S.nunW_b };

  /* ============================================================
     DIBUJO DE SPRITES
     ============================================================ */

  var Spr = {
    S: S,

    draw: function (ctx, sp, x, y, opts) {
      opts = opts || {};
      var px = Math.round(x), py = Math.round(y);
      var flip = !!opts.flip;
      if (opts.alpha !== undefined) ctx.globalAlpha = opts.alpha;
      var rows = sp.rows, r, c, ch, col, sx;
      for (r = 0; r < rows.length; r++) {
        var line = rows[r];
        for (c = 0; c < line.length; c++) {
          ch = line.charAt(c);
          if (ch === '.') continue;
          if (opts.remap && opts.remap[ch]) ch = opts.remap[ch];
          col = parseInt(ch, 16);
          if (isNaN(col)) continue;
          ctx.fillStyle = M.PAL[col];
          sx = flip ? (sp.w - 1 - c) : c;
          ctx.fillRect(px + sx, py + r, 1, 1);
        }
      }
      if (opts.alpha !== undefined) ctx.globalAlpha = 1;
    },

    // Sombra elíptica bajo los pies
    shadow: function (ctx, x, y, w, alpha) {
      ctx.globalAlpha = alpha === undefined ? 0.4 : alpha;
      ctx.fillStyle = M.PAL[M.C.BLACK];
      ctx.beginPath();
      ctx.ellipse(Math.round(x), Math.round(y), w, Math.max(2, w / 2), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  };

  /* ============================================================
     GENERACIÓN PROCEDURAL EN CANVAS: ÁRBOL, ÁRBOL MUERTO, LUNA,
     ARCO, ESCALERA Y PUERTA (canon de las capturas reales)
     ============================================================ */

  function seeded(seed) {
    var s = seed | 0;
    return function () {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
  }

  function branch(ctx, x, y, ang, len, w, depth, rng, tips) {
    if (depth <= 0 || len < 2) {
      if (tips) tips.push({ x: x, y: y });
      return;
    }
    var steps = Math.max(2, Math.floor(len / 2));
    var px = x, py = y;
    var i, nx, ny;
    for (i = 0; i < steps; i++) {
      nx = px + Math.cos(ang) * (len / steps);
      ny = py + Math.sin(ang) * (len / steps);
      ctx.fillStyle = M.PAL[depth >= 3 ? M.C.DPURP : M.C.DARK];
      var ww = Math.max(1, Math.round(w * (1 - i / steps * 0.5)));
      ctx.fillRect(Math.round(px - ww / 2), Math.round(py - ww / 2), ww, ww);
      px = nx; py = ny;
    }
    var n = 2 + (rng() > 0.55 ? 1 : 0);
    for (i = 0; i < n; i++) {
      var spread = 0.45 + rng() * 0.5;
      var dir = (i === 0 ? -1 : 1) * (n === 3 && i === 2 ? 0.3 : 1);
      branch(ctx, px, py, ang + spread * dir * (0.8 + rng() * 0.5),
        len * (0.62 + rng() * 0.16), Math.max(1, w - 1.2), depth - 1, rng, tips);
    }
  }

  /* Gran árbol nudoso del inicio: tronco retorcido, follaje
     violeta oscuro por puntas y frutos magenta que parpadean. */
  function buildBigTree() {
    var c = document.createElement('canvas');
    c.width = 150; c.height = 130;
    var x = c.getContext('2d');
    var rng = seeded(19870);
    var tips = [];

    // copa: 4 ramas madre
    branch(x, 75, 92, -Math.PI / 2 - 0.5, 26, 5, 5, rng, tips);
    branch(x, 75, 92, -Math.PI / 2 + 0.55, 24, 5, 5, rng, tips);
    branch(x, 75, 92, -Math.PI / 2 - 0.05, 22, 4, 5, rng, tips);
    branch(x, 75, 92, -Math.PI / 2 + 0.95, 18, 3, 4, rng, tips);

    // follaje violeta oscuro en las puntas (copa sombría del canon)
    var i, t, r;
    for (i = 0; i < tips.length; i++) {
      t = tips[i];
      r = 4 + rng() * 4;
      x.fillStyle = M.PAL[M.C.DARK];
      x.beginPath(); x.arc(t.x, t.y, r, 0, Math.PI * 2); x.fill();
      x.fillStyle = M.PAL[M.C.VDARK];
      x.beginPath(); x.arc(t.x, t.y + r * 0.4, r * 0.7, 0, Math.PI * 2); x.fill();
      x.fillStyle = M.PAL[M.C.DPURP];
      x.fillRect(Math.round(t.x - r * 0.4), Math.round(t.y - r), Math.max(2, r | 0), 1);
    }

    // tronco: segmentos con leve curva
    var bx = 75, by = 126;
    var segs = [
      [ -Math.PI / 2 + 0.05, 26, 9 ],
      [ -Math.PI / 2 - 0.07, 22, 7 ],
      [ -Math.PI / 2 + 0.04, 18, 5 ]
    ];
    var nx, ny;
    for (i = 0; i < segs.length; i++) {
      var a = segs[i][0], l = segs[i][1], w = segs[i][2];
      nx = bx + Math.cos(a) * l; ny = by + Math.sin(a) * l;
      x.strokeStyle = M.PAL[M.C.DPURP];
      x.lineWidth = w; x.lineCap = 'round';
      x.beginPath(); x.moveTo(bx, by); x.lineTo(nx, ny); x.stroke();
      x.strokeStyle = M.PAL[M.C.PURP];
      x.lineWidth = 1;
      x.beginPath(); x.moveTo(bx - w * 0.3, by); x.lineTo(nx - w * 0.3, ny); x.stroke();
      bx = nx; by = ny;
    }
    // raíces nudosas
    for (i = 0; i < 5; i++) {
      branch(x, 75, 126, Math.PI / 2 + (i - 2) * 0.38, 12 + rng() * 8, 4, 2, rng, null);
    }
    // hueco del tronco (la puerta de "algo")
    x.fillStyle = M.PAL[M.C.BLACK];
    x.beginPath();
    x.ellipse(75, 106, 6, 11, 0, 0, Math.PI * 2);
    x.fill();
    x.strokeStyle = M.PAL[M.C.BLOOD];
    x.lineWidth = 1;
    x.beginPath();
    x.ellipse(75, 106, 6, 11, 0, 0, Math.PI * 2);
    x.stroke();
    // frutos magenta en las puntas altas
    var fruits = tips.filter(function (tp) { return tp.y < 70; }).slice(0, 6);
    return { canvas: c, tips: fruits, ox: 75, oy: 126 };
  }

  function buildDeadTree(seed, scale) {
    var c = document.createElement('canvas');
    c.width = Math.round(60 * scale); c.height = Math.round(70 * scale);
    var x = c.getContext('2d');
    x.scale(scale, scale);
    var rng = seeded(seed);
    var bx = 30, by = 64;
    branch(x, bx, by, -Math.PI / 2 - 0.4, 20, 4, 4, rng, null);
    branch(x, bx, by, -Math.PI / 2 + 0.5, 18, 4, 4, rng, null);
    branch(x, bx, by, -Math.PI / 2, 16, 3, 4, rng, null);
    x.fillStyle = M.PAL[M.C.DARK];
    x.fillRect(bx - 2, by - 22, 4, 22);
    return c;
  }

  function buildMoon() {
    var c = document.createElement('canvas');
    c.width = 26; c.height = 26;
    var x = c.getContext('2d');
    x.fillStyle = M.PAL[M.C.BONE];
    x.beginPath(); x.arc(13, 13, 11, 0, Math.PI * 2); x.fill();
    x.fillStyle = M.PAL[M.C.BONE2];
    x.beginPath(); x.arc(9, 9, 2, 0, Math.PI * 2); x.fill();
    x.beginPath(); x.arc(16, 15, 3, 0, Math.PI * 2); x.fill();
    x.beginPath(); x.arc(11, 18, 1.5, 0, Math.PI * 2); x.fill();
    x.strokeStyle = 'rgba(142,74,216,0.5)';
    x.beginPath(); x.arc(13, 13, 12.5, 0, Math.PI * 2); x.stroke();
    return c;
  }

  /* Arco de piedra del convento (canon de la cámara de arcos):
     banda de dovelas violetas con juntas negras sobre capitel
     salmón y fuste rojo vivo; clave salmón arriba. */
  function buildArch() {
    var c = document.createElement('canvas');
    c.width = 24; c.height = 36;
    var x = c.getContext('2d');

    // fuste: pilar rojo vivo con contorno negro
    x.fillStyle = M.PAL[M.C.BLACK];
    x.fillRect(8, 14, 8, 20);
    x.fillStyle = M.PAL[M.C.CRIM];
    x.fillRect(9, 15, 6, 18);
    x.fillStyle = M.PAL[M.C.BLOOD];
    x.fillRect(9, 15, 2, 18);

    // capitel salmón: bloque que carga el arco (canon)
    x.fillStyle = M.PAL[M.C.BLACK];
    x.fillRect(5, 12, 14, 4);
    x.fillStyle = M.PAL[M.C.LMAG];
    x.fillRect(6, 13, 12, 2);
    x.fillStyle = M.PAL[M.C.WHITE];
    x.fillRect(6, 13, 12, 1);

    // arco: banda violeta saturado (dovelas)
    x.strokeStyle = M.PAL[M.C.PURP];
    x.lineWidth = 4;
    x.beginPath();
    x.arc(12, 15, 8, Math.PI, Math.PI * 2); x.stroke();
    // juntas negras radiales: segmentan en dovelas
    x.strokeStyle = M.PAL[M.C.BLACK];
    x.lineWidth = 1;
    for (var a = 26; a < 180; a += 26) {
      var rad = (90 - a) * Math.PI / 180;
      x.beginPath();
      x.moveTo(12 + Math.cos(rad) * 5, 15 - Math.sin(rad) * 5);
      x.lineTo(12 + Math.cos(rad) * 11, 15 - Math.sin(rad) * 11);
      x.stroke();
    }
    // arista superior iluminada del arco
    x.strokeStyle = M.PAL[M.C.LPURP];
    x.lineWidth = 1;
    x.beginPath();
    x.arc(12, 15, 9.5, Math.PI * 1.1, Math.PI * 1.9); x.stroke();
    // clave del arco (arriba): sillar salmón con brillo
    x.fillStyle = M.PAL[M.C.BLACK];
    x.fillRect(9, 3, 7, 5);
    x.fillStyle = M.PAL[M.C.LMAG];
    x.fillRect(10, 4, 5, 3);
    x.fillStyle = M.PAL[M.C.WHITE];
    x.fillRect(10, 4, 5, 1);

    // basamenta escalonada (roja, canon)
    x.fillStyle = M.PAL[M.C.BLACK];
    x.fillRect(4, 33, 16, 3);
    x.fillStyle = M.PAL[M.C.CRIM];
    x.fillRect(5, 34, 14, 2);
    x.fillStyle = M.PAL[M.C.BLOOD];
    x.fillRect(5, 35, 14, 1);
    return c;
  }

  /* Escalera isométrica del convento (canon): peldaños con huella
     salmón y contrahuella negra, zancas moradas a los lados. */
  function buildStairs() {
    var c = document.createElement('canvas');
    c.width = 36; c.height = 26;
    var x = c.getContext('2d');
    var i, w, px, py;
    for (i = 0; i < 4; i++) {
      w = 34 - i * 6;
      px = 1 + i * 3;
      py = 26 - (i + 1) * 6;
      // contrahuella (frontal): negra
      x.fillStyle = M.PAL[M.C.BLACK];
      x.fillRect(px, py + 2, w, 4);
      // huella (superior): banda salmón
      x.fillStyle = M.PAL[M.C.LMAG];
      x.fillRect(px, py, w, 2);
      x.fillStyle = M.PAL[M.C.WHITE];
      x.fillRect(px, py, w, 1);
      // zancas moradas a los lados
      x.fillStyle = M.PAL[M.C.PURP];
      x.fillRect(px, py, 2, 6);
      x.fillRect(px + w - 2, py, 2, 6);
      // sombra del peldaño sobre el inmediatamente inferior
      x.fillStyle = M.PAL[M.C.BLACK];
      x.fillRect(px + 2, py + 6, w - 4, 1);
    }
    x.fillStyle = M.PAL[M.C.DPURP];
    x.fillRect(0, 24, 36, 2);
    return c;
  }

  /* Puerta del convento (canon): marco y muro circundante SALMÓN
     con juntas claras, arco de medio punto con hueco violeta
     oscuro y dintel escalonado. */
  function buildDoor() {
    var c = document.createElement('canvas');
    c.width = 20; c.height = 30;
    var x = c.getContext('2d');

    // muro circundante salmón con juntas de sillar claras
    x.fillStyle = M.PAL[M.C.LMAG];
    x.fillRect(0, 4, 20, 26);
    x.fillStyle = M.PAL[M.C.BONE];
    x.fillRect(0, 9, 20, 1);
    x.fillRect(0, 15, 20, 1);
    x.fillRect(0, 21, 20, 1);
    x.fillRect(0, 27, 20, 1);
    // dintel escalonado
    x.fillStyle = M.PAL[M.C.LMAG];
    x.fillRect(2, 2, 16, 2);
    x.fillRect(4, 0, 12, 2);
    x.fillStyle = M.PAL[M.C.BONE];
    x.fillRect(2, 3, 16, 1);
    x.fillRect(4, 1, 12, 1);

    // hueco del arco de medio punto: violeta casi negro
    x.fillStyle = M.PAL[M.C.VDARK];
    x.beginPath();
    x.moveTo(5, 28);
    x.lineTo(5, 15);
    x.arc(10, 15, 5, Math.PI, 0);
    x.lineTo(15, 28);
    x.closePath();
    x.fill();
    // contorno violeta del arco
    x.strokeStyle = M.PAL[M.C.PURP];
    x.lineWidth = 1;
    x.beginPath();
    x.moveTo(5.5, 28);
    x.lineTo(5.5, 15.5);
    x.arc(10, 15.5, 4.5, Math.PI, 0);
    x.lineTo(14.5, 28);
    x.stroke();
    // hoja de la puerta entreabierta
    x.fillStyle = M.PAL[M.C.DPURP];
    x.fillRect(8, 13, 4, 15);
    x.fillStyle = M.PAL[M.C.PURP];
    x.fillRect(8, 13, 1, 15);
    // pomo hueso
    x.fillStyle = M.PAL[M.C.BONE];
    x.fillRect(7, 20, 1, 2);
    return c;
  }

  /* Portón de paso entre habitaciones (canon del diorama):
     arco de medio punto ABIERTO — hueco negro de pasaje que se
     pierde en la nada, dovelas violetas segmentadas, clave y jambas
     salmón con contorno negro y umbral escalonado. Es LA puerta
     visible que conecta las habitaciones fijas. */
  function buildGate() {
    var c = document.createElement('canvas');
    c.width = 26; c.height = 34;
    var x = c.getContext('2d');

    // hueco del pasaje: negro absoluto con lejanía violeta
    x.fillStyle = M.PAL[M.C.BLACK];
    x.beginPath();
    x.moveTo(6, 32); x.lineTo(6, 14);
    x.arc(13, 14, 7, Math.PI, 0);
    x.lineTo(20, 32); x.closePath(); x.fill();
    x.fillStyle = M.PAL[M.C.VDARK];
    x.fillRect(9, 24, 8, 8);
    x.fillStyle = M.PAL[M.C.DPURP];
    x.fillRect(11, 27, 4, 5);

    // dovelas del arco: banda violeta saturado con juntas radiales
    x.strokeStyle = M.PAL[M.C.PURP];
    x.lineWidth = 4;
    x.beginPath(); x.arc(13, 14, 9, Math.PI, Math.PI * 2); x.stroke();
    x.strokeStyle = M.PAL[M.C.BLACK];
    x.lineWidth = 1;
    for (var a = 22; a < 180; a += 22) {
      var rad = (90 - a) * Math.PI / 180;
      x.beginPath();
      x.moveTo(13 + Math.cos(rad) * 6, 14 - Math.sin(rad) * 6);
      x.lineTo(13 + Math.cos(rad) * 12, 14 - Math.sin(rad) * 12);
      x.stroke();
    }
    // arista superior iluminada
    x.strokeStyle = M.PAL[M.C.LPURP];
    x.lineWidth = 1;
    x.beginPath(); x.arc(13, 14, 10.5, Math.PI * 1.1, Math.PI * 1.9); x.stroke();

    // jambas salmón a los lados (canon: marco vivo)
    x.fillStyle = M.PAL[M.C.BLACK];
    x.fillRect(2, 12, 4, 22); x.fillRect(20, 12, 4, 22);
    x.fillStyle = M.PAL[M.C.LMAG];
    x.fillRect(3, 13, 2, 20); x.fillRect(21, 13, 2, 20);
    x.fillStyle = M.PAL[M.C.BONE];
    x.fillRect(3, 13, 2, 1); x.fillRect(21, 13, 2, 1);

    // clave del arco: sillar salmón con brillo
    x.fillStyle = M.PAL[M.C.BLACK]; x.fillRect(10, 1, 6, 6);
    x.fillStyle = M.PAL[M.C.LMAG]; x.fillRect(11, 2, 4, 4);
    x.fillStyle = M.PAL[M.C.WHITE]; x.fillRect(11, 2, 4, 1);

    // umbral escalonado de piedra
    x.fillStyle = M.PAL[M.C.BLACK]; x.fillRect(4, 31, 18, 3);
    x.fillStyle = M.PAL[M.C.LMAG]; x.fillRect(5, 32, 16, 2);
    x.fillStyle = M.PAL[M.C.BONE]; x.fillRect(5, 32, 16, 1);
    return c;
  }

  Spr.buildBigTree = buildBigTree;
  Spr.buildDeadTree = buildDeadTree;
  Spr.buildMoon = buildMoon;
  Spr.buildArch = buildArch;
  Spr.buildStairs = buildStairs;
  Spr.buildDoor = buildDoor;
  Spr.buildGate = buildGate;

  // La cara: destello de 2 fotogramas en pantallas de título/pasillos
  Spr.drawFace = function (ctx, cx, cy) {
    var x = Math.round(cx) - 12, y = Math.round(cy) - 16;
    ctx.fillStyle = M.PAL[M.C.DARK];
    ctx.fillRect(x - 2, y - 2, 28, 36);           // melena
    ctx.fillStyle = M.PAL[M.C.BONE];
    ctx.fillRect(x + 3, y + 3, 18, 24);           // rostro
    ctx.fillStyle = M.PAL[M.C.BLACK];             // cuencas vacías
    ctx.fillRect(x + 6, y + 10, 4, 5);
    ctx.fillRect(x + 14, y + 10, 4, 5);
    ctx.fillStyle = M.PAL[M.C.LCRIM];             // pupilas
    ctx.fillRect(x + 7, y + 12, 1, 1);
    ctx.fillRect(x + 15, y + 12, 1, 1);
    ctx.fillStyle = M.PAL[M.C.BLACK];             // boca abierta
    ctx.fillRect(x + 9, y + 19, 6, 4);
    ctx.fillStyle = M.PAL[M.C.BLOOD];             // arañazos
    ctx.fillRect(x + 4, y + 6, 1, 3);
    ctx.fillRect(x + 19, y + 15, 1, 4);
    ctx.fillRect(x + 8, y + 26, 8, 1);
  };

  Spr.bigTree = null;
  Spr.moon = null;
  Spr.deadTrees = null;
  Spr.archCanvas = null;
  Spr.stairsCanvas = null;
  Spr.doorCanvas = null;
  Spr.gateCanvas = null;

  Spr.preload = function () {
    if (!this.bigTree) { this.bigTree = buildBigTree(); }
    if (!this.moon) this.moon = buildMoon();
    if (!this.deadTrees) {
      this.deadTrees = [buildDeadTree(666, 1), buildDeadTree(1313, 1), buildDeadTree(77, 0.8)];
    }
    if (!this.archCanvas) this.archCanvas = buildArch();
    if (!this.stairsCanvas) this.stairsCanvas = buildStairs();
    if (!this.doorCanvas) this.doorCanvas = buildDoor();
    if (!this.gateCanvas) this.gateCanvas = buildGate();
  };

  M.Spr = Spr;
})(window.MISTICAS);
