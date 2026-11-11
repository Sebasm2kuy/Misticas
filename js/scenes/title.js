'use strict';
/* ============================================================
   MÍSTICAS — (C) 1987 — scenes/title.js
   La portada: cielo en bandas, luna, el árbol, la silueta del
   convento con su ventana encendida y un logo que parpadea.
   A veces, solo a veces, ella mira de vuelta.
   ============================================================ */
(function (M) {

  var F = M.Font;

  M.Scenes = M.Scenes || {};

  M.Scenes.title = function (game) {
    return {
      hud: false,
      t: 0,
      faceT: 0,
      faceTimer: 7 + Math.random() * 5,
      flick: 0,

      enter: function () {
        M.Audio.playSong('title');
        M.Audio.wind(true);
        M.Spr.preload();
      },

      update: function (dt) {
        this.t += dt;
        // parpadeo puntual del logo
        this.flick -= dt;
        if (this.flick < -3 && Math.random() < 0.008) this.flick = 0.09;
        // el destello de la cara
        if (this.faceT > 0) {
          this.faceT -= dt;
          if (this.faceT <= 0) M.FX.glitchNow(0.8, 0.16);
        } else {
          this.faceTimer -= dt;
          if (this.faceTimer <= 0) {
            this.faceTimer = 9 + Math.random() * 8;
            this.faceT = 0.1;
            M.Audio.sfx.staticBurst();
          }
        }
        if (this.t > 0.6 && (M.Input.hitAny() || M.Input.hit('fire'))) {
          M.Audio.init();
          M.Audio.sfx.chime();
          M.FX.glitchNow(1.2, 0.3);
          M.FX.fadeTo(1, 3, null);
          game.resetState();
          game.setScene('tree');
        }
      },

      draw: function (ctx) {
        var t = this.t;
        var W = M.SCREEN_W, H = M.SCREEN_H;
        var cx = Math.round(W / 2);
        function y(v) { return Math.round(v * H / 200); }
        // cielo y suelo en bandas
        M.FX.drawSky(ctx, y(118), t, { moonX: W - 68 });
        // suelo en bandas
        ctx.fillStyle = M.PAL[M.C.VDARK];
        ctx.fillRect(0, y(118), W, y(40));
        ctx.fillStyle = M.PAL[M.C.BLACK];
        ctx.fillRect(0, y(158), W, H - y(158));
        var x;
        for (x = 0; x < W; x += 2) {
          ctx.fillStyle = M.PAL[M.C.DARK];
          ctx.fillRect(x + ((x / 2) & 1), y(116), 1, 2);
          ctx.fillStyle = M.PAL[M.C.VDARK];
          ctx.fillRect(x + 1 - ((x / 2) & 1), y(156), 1, 2);
        }
        // matas de hierba oscura
        for (var g = 0; g < 26; g++) {
          var gx = (g * 53) % Math.max(40, W - 6), gy = y(122) + ((g * 31) % Math.max(20, y(68)));
          ctx.fillStyle = M.PAL[(g % 3) ? M.C.VDARK : M.C.DARK];
          ctx.fillRect(gx, gy, 3, 2);
        }

        // el gran árbol a la izquierda (en vertical entra parcialmente
        // en cuadro: composición de primer plano)
        var tr = M.Spr.bigTree;
        var treeX = M.isNarrow() ? -26 : 14;
        ctx.drawImage(tr.canvas, treeX, y(118) - 112);
        for (var i = 0; i < tr.tips.length; i++) {
          var tp = tr.tips[i];
          if (Math.sin(t * (1.3 + i * 0.4) + i * 2) > 0.35) {
            ctx.fillStyle = M.PAL[M.C.MAG];
            ctx.fillRect(treeX + tp.x, y(118) - 112 + tp.y, 1, 1);
          }
        }

        // silueta del convento, anclada a la derecha (comprimida en
        // horizontal si el lienzo es estrecho, misma técnica 8 bits)
        var convSx = M.isNarrow() ? 0.62 : 1;
        var kx = W - 5 - Math.round(110 * convSx); // origen visible del edificio
        ctx.save();
        ctx.translate(kx, 0);
        ctx.scale(convSx, 1);
        ctx.fillStyle = M.PAL[M.C.DARK];
        ctx.fillRect(0, y(62), 110, y(56));         // cuerpo
        ctx.fillRect(26, y(34), 40, y(30));      // torre
        ctx.fillStyle = M.PAL[M.C.DPURP];
        ctx.beginPath();                              // tejado
        ctx.moveTo(20, y(36)); ctx.lineTo(46, y(20)); ctx.lineTo(72, y(36));
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = M.PAL[M.C.BONE2];              // cruz
        ctx.fillRect(45, y(10), 2, y(9));
        ctx.fillRect(42, y(13), 8, 2);
        // ventana encendida (fuego de vela)
        ctx.fillStyle = M.PAL[M.C.ORANG];
        ctx.fillRect(40, y(44), 7, y(10));
        ctx.fillStyle = M.PAL[M.C.LORAN];
        if (Math.sin(t * 9) > 0) ctx.fillRect(42, y(46), 3, y(6));
        ctx.fillStyle = M.PAL[M.C.BLACK];
        ctx.fillRect(43, y(44), 1, y(10));
        // ventanucos apagados
        ctx.fillStyle = M.PAL[M.C.BLACK];
        ctx.fillRect(10, y(78), 6, y(9));
        ctx.fillRect(26, y(78), 6, y(9));
        ctx.fillRect(56, y(78), 6, y(9));
        ctx.fillRect(84, y(70), 6, y(9));
        ctx.fillRect(84, y(88), 6, y(9));
        ctx.fillStyle = M.PAL[M.C.VDARK];
        ctx.fillRect(0, y(116), 110, 3);
        ctx.restore();

        // niebla baja
        M.FX.drawFog(ctx, t, 0.7, 0);

        // el destello: ella mira de vuelta
        if (this.faceT > 0) {
          M.Spr.drawFace(ctx, cx, y(92));
        }

        // LOGO (la escala se rebaja sola si el lienzo es estrecho)
        var logoColor = this.flick > 0 ? M.C.LCRIM : M.C.LMAG;
        F.drawCenteredFit(ctx, 'MISTICAS', cx, y(40), logoColor, {
          scale: 3, shadow: M.C.CRIM, shadowDx: 2, shadowDy: 2, spacing: 3
        });
        F.drawCenteredFit(ctx, 'UN JUEGO MALDITO DE ' + M.YEAR, cx, y(70), M.C.BONE2, { spacing: 1 });

        if (Math.sin(this.t * 3.4) > -0.25) {
          F.drawCenteredFit(ctx, 'PULSA UNA TECLA PARA COMENZAR', cx, y(142), M.C.BONE);
        }
        F.drawCenteredFit(ctx, '(C) ' + M.YEAR + ' - TODOS LOS RITOS RESERVADOS', cx, y(190), M.C.BONE2);
      }
    };
  };
})(window.MISTICAS);
