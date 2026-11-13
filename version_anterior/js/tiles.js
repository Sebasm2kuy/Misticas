'use strict';
/* ============================================================
   MÍSTICAS — (C) 1987 — js/tiles.js
   La CHR-ROM: teselas de 8x8 horneadas al arrancar.

   Cada tesela se define como una función de píxeles (índices de
   paleta 0-15) y se HORNEA en:
     - 3 bancos de LUZ  (SOMBRA / NORMAL / LUZ)      -> PALSWAP
     - 5 bancos de FUNDIDO (transiciones de escena)  -> FADESWAP
   sustituyendo índices, como los bancos de paleta de la PPU.
   Nunca se mezcla un color con otro: solo registers swap.
   ============================================================ */
(function (M) {

  var T = 8;

  /* ---------- definiciones de teselas ----------
     p(x, y, índiceDePaleta) pinta un píxel.               */

  function brickMetatile(tone, hi) {
    // tones: 1=DVIOLET base, 3=DPURPLE base (banda oscura)
    // metatile 2x2: hiladas de 8 px, mortero negro de 1 px,
    // llagas verticales alternas (escalerado clásico NES)
    return {
      TL: function (p) {
        p.rect(0, 0, 8, 8, tone);
        p.vline(0, 0, 7, 0);                  // llaga izquierda
        p.hline(0, 7, 8, 0);                  // mortero inferior
        if (hi) { p.px(1, 1, 4); p.px(2, 1, 4); }
      },
      TR: function (p) {
        p.rect(0, 0, 8, 8, tone);
        p.hline(0, 7, 8, 0);
        if (hi) { p.px(1, 1, 4); p.px(2, 1, 4); }
      },
      BL: function (p) {
        p.rect(0, 0, 8, 8, tone);
        p.vline(7, 0, 7, 0);                  // llaga central inferior
        p.hline(0, 7, 8, 0);                  // mortero inferior
      },
      BR: function (p) {
        p.rect(0, 0, 8, 8, tone);
        p.hline(0, 7, 8, 0);
      }
    };
  }

  var DEFS = {};

  // ladrillo violeta, tres familias + banda oscura superior
  var fams = { A: [1, true], B: [3, true], D: [3, false] };
  Object.keys(fams).forEach(function (f) {
    var mt = brickMetatile(fams[f][0], fams[f][1]);
    DEFS['BRK_' + f + '_TL'] = mt.TL;
    DEFS['BRK_' + f + '_TR'] = mt.TR;
    DEFS['BRK_' + f + '_BL'] = mt.BL;
    DEFS['BRK_' + f + '_BR'] = mt.BR;
  });

  // suelo del convento: LOSAS MACIZAS de violeta con juntas
  // negras (16x16, metatile 2x2). La luz de las velas cambia el
  // registro: sombra=púrpura oscuro, normal=violeta, luz=violeta
  // vivo — pozos de luz de bloques inequívocos, jamás damero.
  DEFS.FL_TL = function (p) {
    p.rect(0, 0, 8, 8, 1);
    p.hline(0, 0, 8, 0); p.vline(0, 0, 8, 0);
    p.px(2, 2, 3);
  };
  DEFS.FL_T = function (p) {
    p.rect(0, 0, 8, 8, 1);
    p.hline(0, 0, 8, 0);
  };
  DEFS.FL_L = function (p) {
    p.rect(0, 0, 8, 8, 1);
    p.vline(0, 0, 8, 0);
    p.px(5, 4, 3);
  };
  DEFS.FL_M = function (p) {
    p.rect(0, 0, 8, 8, 1);
    p.px(6, 6, 3);
  };
  DEFS.FL_M2 = function (p) {
    p.rect(0, 0, 8, 8, 1);
    p.px(3, 5, 3); p.px(6, 2, 3);
  };

  // hierba de noche: negro + matas violetas
  DEFS.GR_A = function (p) {
    p.rect(0, 0, 8, 8, 0);
    p.px(1, 5, 1); p.px(2, 5, 1); p.px(1, 4, 1);
    p.px(6, 2, 3); p.px(7, 2, 3);
  };
  DEFS.GR_B = function (p) {
    p.rect(0, 0, 8, 8, 0);
    p.px(4, 6, 1); p.px(5, 6, 1); p.px(4, 5, 3);
    p.px(0, 1, 3);
  };
  DEFS.GR_C = function (p) { p.rect(0, 0, 8, 8, 0); };

  // tierra del camposanto: negro + motas púrpura
  DEFS.DI_A = function (p) {
    p.rect(0, 0, 8, 8, 0);
    p.px(2, 3, 3); p.px(6, 6, 3); p.px(5, 1, 1);
  };
  DEFS.DI_B = function (p) {
    p.rect(0, 0, 8, 8, 0);
    p.px(1, 6, 3); p.px(7, 2, 3);
  };

  // camino: tierra pisada SIN rejilla — gravilla suelta y
  // marcas horizontales espaciadas (nada de cuadrícula)
  DEFS.PA_TL = function (p) {
    p.rect(0, 0, 8, 8, 0);
    p.px(4, 4, 13); p.px(2, 2, 1);
  };
  DEFS.PA_T = function (p) { p.rect(0, 0, 8, 8, 0); p.px(3, 5, 13); p.px(6, 2, 1); };
  DEFS.PA_L = function (p) { p.rect(0, 0, 8, 8, 0); p.px(5, 3, 13); };
  DEFS.PA_M = function (p) { p.rect(0, 0, 8, 8, 0); p.px(2, 3, 13); p.px(6, 6, 1); };

  // zócalo (remate inferior del muro): filete MAGENTA + violeta
  DEFS.BASE = function (p) {
    p.rect(0, 0, 8, 8, 1);
    p.hline(0, 0, 8, 5);   // arista magenta
    p.hline(0, 7, 8, 0);   // sombra negra al pie
    p.px(2, 3, 2); p.px(5, 5, 2);
  };

  // pedestal de primer plano (borde inferior del diorama)
  DEFS.LEDGE = function (p) {
    p.rect(0, 0, 8, 8, 0);
    p.hline(0, 0, 8, 3);
    p.px(3, 1, 3); p.px(6, 1, 3);
  };

  // sillar de arco gótico: violeta con luz de canto
  DEFS.ST = function (p) {
    p.rect(0, 0, 8, 8, 2);
    p.hline(0, 0, 8, 12); p.vline(0, 0, 8, 12);  // canto iluminado
    p.hline(0, 7, 8, 0); p.vline(7, 0, 8, 0);    // junta negra
    p.px(2, 3, 1);
  };
  // clave del arco: bloque MAGENTA
  DEFS.KEY = function (p) {
    p.rect(0, 0, 8, 8, 5);
    p.hline(0, 0, 8, 11); p.vline(0, 0, 8, 11);
    p.hline(0, 7, 8, 0); p.vline(7, 0, 8, 0);
  };

  // madera vieja (estanterías, bancos)
  DEFS.WD = function (p) {
    p.rect(0, 0, 8, 8, 3);
    p.hline(0, 3, 8, 0); p.hline(0, 7, 8, 0);
    p.px(1, 1, 1); p.px(6, 5, 1);
  };

  // alfombra carmesí del convento (metatile 2x2, sin damero):
  // campo carmesí, junta negra, rombos carmesí oscuro
  DEFS.CA_TL = function (p) {
    p.rect(0, 0, 8, 8, 6);
    p.hline(0, 0, 8, 0); p.vline(0, 0, 8, 0);
    p.px(3, 3, 7); p.px(4, 3, 7); p.px(3, 4, 7); p.px(4, 4, 7);
    p.px(2, 2, 4);
  };
  DEFS.CA_T = function (p) {
    p.rect(0, 0, 8, 8, 6);
    p.hline(0, 0, 8, 0);
    p.px(6, 3, 7); p.px(7, 3, 7); p.px(6, 4, 7); p.px(7, 4, 7);
  };
  DEFS.CA_L = function (p) {
    p.rect(0, 0, 8, 8, 6);
    p.vline(0, 0, 8, 0);
    p.px(3, 6, 7); p.px(4, 6, 7); p.px(3, 7, 7); p.px(4, 7, 7);
  };
  DEFS.CA_M = function (p) {
    p.rect(0, 0, 8, 8, 6);
    p.px(6, 6, 7); p.px(7, 6, 7); p.px(6, 7, 7); p.px(7, 7, 7);
  };

  // vacío absoluto
  DEFS.VOID = function (p) { p.rect(0, 0, 8, 8, 0); };

  /* ---------- el horno: hornea todo el banco ---------- */

  var Tiles = {
    FADES: 5,
    LIGHTS: 3,
    bank: null,   // bank[fade][light][nombre] = canvas

    init: function () {
      this.bank = [];
      for (var f = 0; f < this.FADES; f++) {
        var lightBank = [];
        for (var l = 0; l < this.LIGHTS; l++) {
          var tiles = {};
          for (var name in DEFS) {
            tiles[name] = this._bake(DEFS[name], f, l);
          }
          lightBank.push(tiles);
        }
        this.bank.push(lightBank);
      }
    },

    _bake: function (def, fade, light) {
      var cv = document.createElement('canvas');
      cv.width = T; cv.height = T;
      var ctx = cv.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      var lightSwap = M.PALSWAP[light];
      var fadeSwap = M.FADESWAP[fade];
      var p = {
        px: function (x, y, ci) {
          ctx.fillStyle = M.PAL_MASTER[fadeSwap[lightSwap[ci]]];
          ctx.fillRect(x, y, 1, 1);
        },
        rect: function (x, y, w, h, ci) {
          ctx.fillStyle = M.PAL_MASTER[fadeSwap[lightSwap[ci]]];
          ctx.fillRect(x, y, w, h);
        },
        hline: function (x, y, w, ci) { this.rect(x, y, w, 1, ci); },
        vline: function (x, y, h, ci) { this.rect(x, y, 1, h, ci); }
      };
      def(p);
      return cv;
    },

    get: function (name, light, fade) {
      var f = this.bank[Math.max(0, Math.min(this.FADES - 1, fade | 0))];
      var l = f[Math.max(0, Math.min(this.LIGHTS - 1, light | 0))];
      return l[name] || l.VOID;
    },

    draw: function (ctx, name, x, y, light, fade) {
      ctx.drawImage(this.get(name, light, fade), Math.round(x), Math.round(y));
    }
  };

  M.Tiles = Tiles;
})(window.MISTICAS);
