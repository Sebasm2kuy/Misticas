'use strict';
/* ============================================================
   MÍSTICAS — (C) 1987 — sprites.js
   Pixel-art definido como mapas de caracteres (paleta 0-F).
   '.'=transparente, '0'-'9'/'A'-'F' = índice de paleta.
   Los grandes (árbol, luna, cara) se generan por código.
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

  /* ---------------- EL NIÑO (capucha roja, piernas azul-morado) ----------------
     Canon de las capturas reales: capucha y capa rojas con contorno
     negro, cara hueso pálido con ojos negros, piernas azul-morado,
     zapatos oscuros. Chibi: cabeza ~40% del alto. */

  var BOY_HEAD_S = [
    '....8888....',
    '..08888880..',
    '..08888880..',
    '..0C0CC0C0..',
    '..0CCCCCC0..',
    '...0CCCC0...',
    '...088880...'
  ];

  S.boyS_stand = spr(12, 18, BOY_HEAD_S.concat([
    '..08888880..',
    '.0898888880.',
    '.0888888880.',
    '.08F8888880.',
    '..08888880..',
    '...04..40...',
    '...04..40...',
    '...03..30...',
    '...02..20...',
    '............',
    '............'
  ]));

  S.boyS_walkA = spr(12, 18, BOY_HEAD_S.concat([
    '..08888880..',
    '.0898888880.',
    '.0888888880.',
    '.08F8888880.',
    '..08888880..',
    '..04...40...',
    '..04...40...',
    '..03...30...',
    '.02.....20..',
    '............',
    '............'
  ]));

  S.boyS_walkB = spr(12, 18, BOY_HEAD_S.concat([
    '..08888880..',
    '.0898888880.',
    '.0888888880.',
    '.08F8888880.',
    '..08888880..',
    '....04.40...',
    '....04.40...',
    '....03.30...',
    '...02..20...',
    '............',
    '............'
  ]));

  // De espaldas (hacia el norte): la capucha cubre todo
  var BOY_HEAD_N = [
    '....8888....',
    '..08888880..',
    '..08888880..',
    '..08888880..',
    '..08888880..',
    '...088880...',
    '...088880...'
  ];
  S.boyN_stand = spr(12, 18, BOY_HEAD_N.concat([
    '..08888880..',
    '.0888888880.',
    '.0888888880.',
    '.0888888880.',
    '..08888880..',
    '...04..40...',
    '...04..40...',
    '...03..30...',
    '...02..20...',
    '............',
    '............'
  ]));
  S.boyN_walkA = spr(12, 18, BOY_HEAD_N.concat([
    '..08888880..',
    '.0888888880.',
    '.0888888880.',
    '.0888888880.',
    '..08888880..',
    '..04...40...',
    '..04...40...',
    '..03...30...',
    '.02.....20..',
    '............',
    '............'
  ]));
  S.boyN_walkB = spr(12, 18, BOY_HEAD_N.concat([
    '..08888880..',
    '.0888888880.',
    '.0888888880.',
    '.0888888880.',
    '..08888880..',
    '....04.40...',
    '....04.40...',
    '....03.30...',
    '...02..20...',
    '............',
    '............'
  ]));

  // Perfil (mirando a la izquierda; E = volteado)
  var BOY_HEAD_W = [
    '....8888....',
    '..08888880..',
    '..08888880..',
    '..0C0C8880..',
    '..0CCC8880..',
    '...088880...',
    '...088880...'
  ];
  S.boyW_stand = spr(12, 18, BOY_HEAD_W.concat([
    '..08888880..',
    '..088888880.',
    '.0888888880.',
    '.08F8888880.',
    '..08888880..',
    '...04.40....',
    '...04.40....',
    '...03.30....',
    '...02.20....',
    '............',
    '............'
  ]));
  S.boyW_walkA = spr(12, 18, BOY_HEAD_W.concat([
    '..08888880..',
    '..088888880.',
    '.0888888880.',
    '.08F8888880.',
    '..08888880..',
    '..04...40...',
    '..04...40...',
    '..03...30...',
    '.02.....20..',
    '............',
    '............'
  ]));
  S.boyW_walkB = spr(12, 18, BOY_HEAD_W.concat([
    '..08888880..',
    '..088888880.',
    '.0888888880.',
    '.08F8888880.',
    '..08888880..',
    '....0440....',
    '....0440....',
    '....0330....',
    '....0220....',
    '............',
    '............'
  ]));

  // Sentado leyendo (se dibuja el libro aparte, delante)
  S.boySit = spr(12, 13, [
    '....8888....',
    '..08888880..',
    '..0C0CC0C0..',
    '..0CCCCCC0..',
    '...088880...',
    '..08888880..',
    '.0898888880.',
    '.0888888880.',
    '.08F8888880.',
    '..04444440..',
    '..03333330..',
    '..02222220..',
    '............'
  ]);

  // Agachado tras la columna
  S.boyHide = spr(12, 12, [
    '............',
    '...088880...',
    '..08888880..',
    '..0C0CC0C0..',
    '..0CCCCCC0..',
    '.0888888880.',
    '.0898888880.',
    '.0888888880.',
    '..08888880..',
    '..04444440..',
    '..02222220..',
    '............'
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

  /* ---------------- LA NIÑA DE BLANCO (sin guantes) ---------------- */

  var GIRL_TOP = [
    '...222222...',
    '..22222222..',
    '..22222222..',
    '..2C1CC1C2..',
    '..2CCCCCC2..',
    '...CCCCCC...',
    '....CCCC....'
  ];

  S.girlS_idle = spr(12, 20, GIRL_TOP.concat([
    '...EEEEEE...',
    '..2EEEEEE2..',
    '.2EEEEEEEE2.',
    '.CEEEEEEEEC.',
    '.CEEEEEEEEC.',
    '..EEEEEEEE..',
    '..ECCCCCCE..',
    '..EEEEEEEE..',
    '.EEEEEEEEEE.',
    '.ECCCCCCCCE.',
    '.EEEEEEEEEE.',
    '..CC....CC..',
    '............'
  ]));

  // Saluda con la mano alzada (mano desnuda, sin guante)
  S.girlS_waveA = spr(12, 20, [
    '...222222...',
    '..22222222..',
    '..2C1CC1C2C.',
    '..2CCCCCC2C.',
    '...CCCCCC...',
    '....CCCC....',
    '...EEEEEE...',
    '..2EEEEEE2..',
    '.2EEEEEEEE2.',
    '.CEEEEEEEEC.',
    '.CEEEEEEEEC.',
    '..EEEEEEEE..',
    '..ECCCCCCE..',
    '..EEEEEEEE..',
    '.EEEEEEEEEE.',
    '.ECCCCCCCCE.',
    '.EEEEEEEEEE.',
    '..CC....CC..',
    '............',
    '............'
  ]);
  S.girlS_waveB = spr(12, 20, [
    '...222222.C.',
    '..2222222C..',
    '..2C1CC1C2..',
    '..2CCCCCC2..',
    '...CCCCCC...',
    '....CCCC....',
    '...EEEEEE...',
    '..2EEEEEE2..',
    '.2EEEEEEEE2.',
    '.CEEEEEEEEC.',
    '.CEEEEEEEEC.',
    '..EEEEEEEE..',
    '..ECCCCCCE..',
    '..EEEEEEEE..',
    '.EEEEEEEEEE.',
    '.ECCCCCCCCE.',
    '.EEEEEEEEEE.',
    '..CC....CC..',
    '............',
    '............'
  ]);

  S.girlS_walkA = spr(12, 20, GIRL_TOP.concat([
    '...EEEEEE...',
    '..2EEEEEE2..',
    '.2EEEEEEEE2.',
    '.CEEEEEEEEC.',
    '.CEEEEEEEEC.',
    '..EEEEEEEE..',
    '..ECCCCCCE..',
    '..EEEEEEEE..',
    '.EEEEEEEEEE.',
    'ECCCCCCCCE..',
    'EEEEEEEEEE..',
    '..CC....CC..',
    '............'
  ]));
  S.girlS_walkB = spr(12, 20, GIRL_TOP.concat([
    '...EEEEEE...',
    '..2EEEEEE2..',
    '.2EEEEEEEE2.',
    '.CEEEEEEEEC.',
    '.CEEEEEEEEC.',
    '..EEEEEEEE..',
    '..ECCCCCCE..',
    '..EEEEEEEE..',
    '.EEEEEEEEEE.',
    '.ECCCCCCCCE.',
    '..EEEEEEEEEE',
    '...CC..CC...',
    '............'
  ]));

  // Perfil izquierdo (E = volteado)
  S.girlW_idle = spr(12, 20, [
    '....2222....',
    '...222222...',
    '...222222...',
    '...2C1CC2...',
    '...2CCCC2...',
    '....CCCC....',
    '....CCCC....',
    '...EEEEE....',
    '..EEEEEE....',
    '..2EEEEE2...',
    '..CEEEEE2...',
    '..CEEEEE2...',
    '..EEEEEE2...',
    '..ECCCCE2...',
    '..EEEEEE2...',
    '.EEEEEEEE2..',
    '.ECCCCCCE2..',
    '.EEEEEEEE2..',
    '..CC..CC....',
    '............'
  ]);
  S.girlW_walkA = spr(12, 20, [
    '....2222....',
    '...222222...',
    '...222222...',
    '...2C1CC2...',
    '...2CCCC2...',
    '....CCCC....',
    '....CCCC....',
    '...EEEEE....',
    '..EEEEEE....',
    '..2EEEEE2...',
    '..CEEEEE2...',
    '..CEEEEE2...',
    '..EEEEEE2...',
    '..ECCCCE2...',
    '..EEEEEE2...',
    '.EEEEEEEE2..',
    '.ECCCCCCE2..',
    'EEEEEEEE2...',
    '.CC...CC....',
    '............'
  ]);
  S.girlW_walkB = spr(12, 20, [
    '....2222....',
    '...222222...',
    '...222222...',
    '...2C1CC2...',
    '...2CCCC2...',
    '....CCCC....',
    '....CCCC....',
    '...EEEEE....',
    '..EEEEEE....',
    '..2EEEEE2...',
    '..CEEEEE2...',
    '..CEEEEE2...',
    '..EEEEEE2...',
    '..ECCCCE2...',
    '..EEEEEE2...',
    '.EEEEEEEE2..',
    '.ECCCCCCE2..',
    '.EEEEEEEE2..',
    '..CC..CC....',
    '............'
  ]);

  /* ---------------- LA HERMANA (silueta con vela) ---------------- */

  S.nunS_a = spr(14, 24, [
    '....CCCCCC....',
    '...CCCCCCCC...',
    '...C111111C...',
    '...C111111C...',
    '...C111111C...',
    '...C111111C...',
    '...22222222...',
    '..2222222222..',
    '..2122222212..',
    '..2222222222..',
    '..2222222222..',
    '.2222222222B..',
    '.2222222222A..',
    '.2222222222A..',
    '.22222222222..',
    '.222222222222.',
    '22222222222222',
    '22222222222222',
    '22222222222222',
    '22222222222222',
    '22222222222222',
    '22222222222222',
    '..22......22..',
    '..............'
  ]);
  S.nunS_b = spr(14, 24, [
    '....CCCCCC....',
    '...CCCCCCCC...',
    '...C111111C...',
    '...C111111C...',
    '...C111111C...',
    '...C111111C...',
    '...22222222...',
    '..2222222222..',
    '..2122222212..',
    '..2222222222..',
    '..2222222222..',
    '.222222222EB..',
    '.2222222222A..',
    '.2222222222A..',
    '.22222222222..',
    '.222222222222.',
    '22222222222222',
    '.222222222222.',
    '22222222222222',
    '.222222222222.',
    '22222222222222',
    '22222222222222',
    '...22....22...',
    '..............'
  ]);
  // ¡Te ha visto! (ojos carmesí, llama en alto)
  S.nunS_alert = spr(14, 24, [
    '....CCCCCC....',
    '...CCCCCCCC...',
    '...C111111C...',
    '...C191191C...',
    '...C111111C...',
    '...C111111C...',
    '...22222222...',
    '..2222222222..',
    '..2122222212..',
    '..2222222222..',
    '..2222222222..',
    '.222222222EB..',
    '.2222222222A..',
    '.2222222222A..',
    '.22222222222..',
    '.222222222222.',
    '22222222222222',
    '22222222222222',
    '22222222222222',
    '22222222222222',
    '22222222222222',
    '22222222222222',
    '..22......22..',
    '..............'
  ]);

  S.nunW_a = spr(14, 24, [
    '....CCCCCC....',
    '...CCCCCCCC...',
    '...C111111C...',
    '...C111111C...',
    '...C111111C...',
    '...C111111C...',
    '...22222222...',
    '..2222222222..',
    '..2222222222..',
    'B.2222222222..',
    'A.2222222222..',
    'A.2222222222..',
    '.22222222222..',
    '.222222222222.',
    '2222222222222.',
    '22222222222222',
    '22222222222222',
    '22222222222222',
    '22222222222222',
    '22222222222222',
    '22222222222222',
    '22222222222222',
    '..22.....22...',
    '..............'
  ]);
  S.nunW_b = spr(14, 24, [
    '....CCCCCC....',
    '...CCCCCCCC...',
    '...C111111C...',
    '...C111111C...',
    '...C111111C...',
    '...C111111C...',
    '...22222222...',
    '..2222222222..',
    '..2222222222..',
    'EB2222222222..',
    'A.2222222222..',
    'A.2222222222..',
    '.22222222222..',
    '.222222222222.',
    '2222222222222.',
    '.2222222222222',
    '22222222222222',
    '.2222222222222',
    '22222222222222',
    '22222222222222',
    '22222222222222',
    '22222222222222',
    '...22...22....',
    '..............'
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

  /* ---------------- CEMENTERIO ---------------- */

  S.tomb1 = spr(10, 10, [
    '..DDDDDD..',
    '.DCDDDD22.',
    '.DCDDDD22.',
    '.DC111D22.',
    '.DCDDDD22.',
    '.DC111D22.',
    '.DCDDDD22.',
    '.DCDDDD22.',
    '2222222222',
    '..........'
  ]);
  S.tomb2 = spr(10, 12, [
    '...DDDD...',
    '...DCD2...',
    '...DCD2...',
    '.DDDCDDD2.',
    '...DCD2...',
    '...DCD2...',
    '...DCD2...',
    '...DCD2...',
    '...DCD2...',
    '..DDDD22..',
    '.22222222.',
    '..........'
  ]);
  S.tomb3 = spr(12, 7, [
    '..DDDDDDDD..',
    '.DDDDDDDDDD.',
    '.D11111DDD2.',
    '.DDDDDDDDD2.',
    '.D11111DDD2.',
    '222222222222',
    '............'
  ]);
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

  S.door = spr(18, 26, [
    '....DDDDDDDDDD....',
    '..DDDDDDDDDDDDDD..',
    '.DDDDDDDDDDDDDDDD.',
    '.DD333333333333DD.',
    '.DD333233323332DD.',
    '.DD333233323332DD.',
    '.DD333233323332DD.',
    '.DD333233323332DD.',
    '.DD333233323332DD.',
    '.DD333233323332DD.',
    '.DD33323B323332DD.',
    '.DD333233323332DD.',
    '.DD333233323332DD.',
    '.DD333233323332DD.',
    '.DD3332F3323332DD.',
    '.DD333233323332DD.',
    '.DD333233323332DD.',
    '.DD333233323332DD.',
    '.DD333233323332DD.',
    '.DD333233323332DD.',
    '.DD333233323332DD.',
    '.DD333233323332DD.',
    '.DD333233323332DD.',
    '.DDDDDDDDDDDDDDDD.',
    '..11111111111111..',
    '..................'
  ]);

  S.column = spr(12, 28, [
    '.DDDDDDDDDD.',
    '.DCCCCCCCD2.',
    '.DDDDDDDD22.',
    '..DCCCD222..',
    '..DCCCD222..',
    '..DCCCD222..',
    '..DCCCD222..',
    '..DCCCD222..',
    '..DCCCD222..',
    '..DCCCD222..',
    '..DCCCD222..',
    '..DCCCD222..',
    '..DCCCD222..',
    '..DCCCD222..',
    '..DCCCD222..',
    '..DCCCD222..',
    '..DCCCD222..',
    '..DCCCD222..',
    '..DCCCD222..',
    '..DCCCD222..',
    '..DCCCD222..',
    '..DCCCD222..',
    '..DCCCD222..',
    '..DCCCD222..',
    '.DDDDDDDDDD.',
    '.DCCCCCCD22.',
    '222222222222',
    '............'
  ]);

  /* ---------------- conjuntos por dirección (usados por las entidades) ---------------- */
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
     GENERACIÓN PROCEDURAL: GRAN ÁRBOL, ÁRBOL MUERTO, LUNA, CARA
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

  // Pre-render del gran árbol del inicio (se guarda en un canvas)
  function buildBigTree() {
    var c = document.createElement('canvas');
    c.width = 150; c.height = 120;
    var x = c.getContext('2d');
    var rng = seeded(19870);
    var tips = [];

    // tronco: segmentos con leve curva
    var bx = 75, by = 116;
    var segs = [
      [ -Math.PI / 2 + 0.05, 26, 9 ],
      [ -Math.PI / 2 - 0.07, 22, 7 ],
      [ -Math.PI / 2 + 0.04, 18, 5 ]
    ];
    var i, nx, ny;
    for (i = 0; i < segs.length; i++) {
      var a = segs[i][0], l = segs[i][1], w = segs[i][2];
      nx = bx + Math.cos(a) * l; ny = by + Math.sin(a) * l;
      x.strokeStyle = M.PAL[M.C.DPURP];
      x.lineWidth = w; x.lineCap = 'round';
      x.beginPath(); x.moveTo(bx, by); x.lineTo(nx, ny); x.stroke();
      bx = nx; by = ny;
    }
    // copa: 3 ramas madre
    branch(x, bx, by, -Math.PI / 2 - 0.5, 26, 5, 5, rng, tips);
    branch(x, bx, by, -Math.PI / 2 + 0.55, 24, 5, 5, rng, tips);
    branch(x, bx, by, -Math.PI / 2 - 0.05, 22, 4, 5, rng, tips);
    // raíces
    for (i = 0; i < 5; i++) {
      branch(x, 75, 116, Math.PI / 2 + (i - 2) * 0.38, 12 + rng() * 8, 4, 2, rng, null);
    }
    // hueco del tronco (la puerta de "algo")
    x.fillStyle = M.PAL[M.C.BLACK];
    x.beginPath();
    x.ellipse(75, 96, 6, 11, 0, 0, Math.PI * 2);
    x.fill();
    x.strokeStyle = M.PAL[M.C.BLOOD];
    x.lineWidth = 1;
    x.beginPath();
    x.ellipse(75, 96, 6, 11, 0, 0, Math.PI * 2);
    x.stroke();
    // puntos de luz magenta en las puntas (frutos que no deberían existir)
    tips = tips.filter(function (t) { return t.y < 70; }).slice(0, 5);
    return { canvas: c, tips: tips, ox: 75, oy: 116 };
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
    // halo de 1 px muy tenue
    x.strokeStyle = 'rgba(142,74,216,0.5)';
    x.beginPath(); x.arc(13, 13, 12.5, 0, Math.PI * 2); x.stroke();
    return c;
  }

  /* Arco de piedra del convento (canon de la captura real):
     banda purpura segmentada en dovelas sobre capitel y fuste
     rojo vivo con basamenta escalonada. */
  function buildArch() {
    var c = document.createElement('canvas');
    c.width = 24; c.height = 34;
    var x = c.getContext('2d');

    // fuste: pilar rojo vivo con contorno negro
    x.fillStyle = M.PAL[M.C.BLACK];
    x.fillRect(8, 12, 8, 20);          // margen del contorno
    x.fillStyle = M.PAL[M.C.CRIM];
    x.fillRect(9, 13, 6, 18);
    // sombra lateral del fuste (volumen retro)
    x.fillStyle = M.PAL[M.C.BLOOD];
    x.fillRect(9, 13, 2, 18);

    // capitel rojo: bloque que carga el arco
    x.fillStyle = M.PAL[M.C.BLACK];
    x.fillRect(5, 11, 14, 4);
    x.fillStyle = M.PAL[M.C.CRIM];
    x.fillRect(6, 12, 12, 2);
    x.fillStyle = M.PAL[M.C.LCRIM];
    x.fillRect(6, 12, 12, 1);

    // arco: banda purpura saturado (media luna) con dovelas
    x.strokeStyle = M.PAL[M.C.LPURP];
    x.lineWidth = 4;
    x.beginPath();
    x.arc(12, 13, 8, Math.PI, Math.PI * 2); x.stroke();
    // juntas de las dovelas (purpura profundo, radiales)
    x.strokeStyle = M.PAL[M.C.DPURP];
    x.lineWidth = 1;
    for (var a = 0; a <= 180; a += 26) {
      var rad = (90 - a) * Math.PI / 180;   // de izquierda a derecha
      var jx = 12 + Math.cos(rad) * 8;
      var jy = 13 - Math.sin(rad) * 8;
      if (a === 0 || a === 180) { continue; }
      x.beginPath();
      x.moveTo(12 + Math.cos(rad) * 5, 13 - Math.sin(rad) * 5);
      x.lineTo(12 + Math.cos(rad) * 11, 13 - Math.sin(rad) * 11);
      x.stroke();
    }
    // clave del arco (arriba): sillar purpura con brillo
    x.fillStyle = M.PAL[M.C.PURP];
    x.fillRect(9, 4, 6, 4);
    x.fillStyle = M.PAL[M.C.LPURP];
    x.fillRect(9, 4, 6, 1);

    // basamenta escalonada
    x.fillStyle = M.PAL[M.C.BLACK];
    x.fillRect(4, 31, 16, 3);
    x.fillStyle = M.PAL[M.C.CRIM];
    x.fillRect(5, 32, 14, 2);
    x.fillStyle = M.PAL[M.C.BLOOD];
    x.fillRect(5, 33, 14, 1);
    return c;
  }

  /* Escalera isométrica del convento (canon): peldaños alternos
     rosa salmon / blanco con laterales (zancas) morados. */
  function buildStairs() {
    var c = document.createElement('canvas');
    c.width = 36; c.height = 26;
    var x = c.getContext('2d');
    var i, w, px, py;
    // 4 peldaños: de abajo (el mas ancho) hacia arriba
    for (i = 0; i < 4; i++) {
      w = 34 - i * 6;            // cada peldaño mas estrecho
      px = 1 + i * 3;            // y ligeramente mas adentro
      py = 26 - (i + 1) * 6;
      // contrahuella (frontal): blanca
      x.fillStyle = M.PAL[M.C.WHITE];
      x.fillRect(px, py + 2, w, 4);
      // huella (superior): rosa salmon
      x.fillStyle = M.PAL[M.C.LMAG];
      x.fillRect(px, py, w, 2);
      // zancas moradas a los lados
      x.fillStyle = M.PAL[M.C.PURP];
      x.fillRect(px, py, 2, 6);
      x.fillRect(px + w - 2, py, 2, 6);
      // sombra del peldaño sobre el inmediatamente inferior
      x.fillStyle = M.PAL[M.C.BLACK];
      x.fillRect(px + 2, py + 6, w - 4, 1);
    }
    // base: losa purpura profundo
    x.fillStyle = M.PAL[M.C.DPURP];
    x.fillRect(0, 24, 36, 2);
    return c;
  }

  Spr.buildBigTree = buildBigTree;
  Spr.buildDeadTree = buildDeadTree;
  Spr.buildMoon = buildMoon;
  Spr.buildArch = buildArch;
  Spr.buildStairs = buildStairs;

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

  Spr.preload = function () {
    if (!this.bigTree) this.bigTree = buildBigTree();
    if (!this.moon) this.moon = buildMoon();
    if (!this.deadTrees) {
      this.deadTrees = [buildDeadTree(666, 1), buildDeadTree(1313, 1), buildDeadTree(77, 0.8)];
    }
    if (!this.archCanvas) this.archCanvas = buildArch();
    if (!this.stairsCanvas) this.stairsCanvas = buildStairs();
  };

  M.Spr = Spr;
})(window.MISTICAS);
