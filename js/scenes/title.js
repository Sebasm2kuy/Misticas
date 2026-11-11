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
        // cielo y suelo en bandas
        M.FX.drawSky(ctx, 118, t, { moonX: 252 });
        ctx.fillStyle = M.PAL[M.C.VDARK];
        ctx.fillRect(0, 118, 320, 40);
        ctx.fillStyle = M.PAL[M.C.BLACK];
        ctx.fillRect(0, 158, 320, 42);
        var x;
        for (x = 0; x < 320; x += 2) {
          ctx.fillStyle = M.PAL[M.C.DARK];
          ctx.fillRect(x + ((x / 2) & 1), 116, 1, 2);
          ctx.fillStyle = M.PAL[M.C.VDARK];
          ctx.fillRect(x + 1 - ((x / 2) & 1), 156, 1, 2);
        }
        // matas de hierba oscura
        for (var g = 0; g < 26; g++) {
          var gx = (g * 53) % 314, gy = 122 + ((g * 31) % 68);
          ctx.fillStyle = M.PAL[(g % 3) ? M.C.VDARK : M.C.DARK];
          ctx.fillRect(gx, gy, 3, 2);
        }

        // el gran árbol a la izquierda
        var tr = M.Spr.bigTree;
        ctx.drawImage(tr.canvas, 14, 118 - 112);
        for (var i = 0; i < tr.tips.length; i++) {
          var tp = tr.tips[i];
          if (Math.sin(t * (1.3 + i * 0.4) + i * 2) > 0.35) {
            ctx.fillStyle = M.PAL[M.C.MAG];
            ctx.fillRect(14 + tp.x, 118 - 112 + tp.y, 1, 1);
          }
        }

        // silueta del convento a la derecha
        ctx.fillStyle = M.PAL[M.C.DARK];
        ctx.fillRect(206, 62, 110, 56);          // cuerpo
        ctx.fillRect(232, 34, 40, 30);           // torre
        ctx.fillStyle = M.PAL[M.C.DPURP];
        ctx.beginPath();                          // tejado
        ctx.moveTo(226, 36); ctx.lineTo(252, 20); ctx.lineTo(278, 36);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = M.PAL[M.C.BONE2];         // cruz
        ctx.fillRect(251, 10, 2, 9);
        ctx.fillRect(248, 13, 8, 2);
        // ventana encendida (fuego de vela)
        ctx.fillStyle = M.PAL[M.C.ORANG];
        ctx.fillRect(246, 44, 7, 10);
        ctx.fillStyle = M.PAL[M.C.LORAN];
        if (Math.sin(t * 9) > 0) ctx.fillRect(248, 46, 3, 6);
        ctx.fillStyle = M.PAL[M.C.BLACK];
        ctx.fillRect(249, 44, 1, 10);
        // ventanucos apagados
        ctx.fillStyle = M.PAL[M.C.BLACK];
        ctx.fillRect(216, 78, 6, 9);
        ctx.fillRect(232, 78, 6, 9);
        ctx.fillRect(262, 78, 6, 9);
        ctx.fillRect(290, 70, 6, 9);
        ctx.fillRect(290, 88, 6, 9);
        ctx.fillStyle = M.PAL[M.C.VDARK];
        ctx.fillRect(206, 116, 110, 3);

        // niebla baja
        M.FX.drawFog(ctx, t, 0.7, 0);

        // el destello: ella mira de vuelta
        if (this.faceT > 0) {
          M.Spr.drawFace(ctx, 160, 92);
        }

        // LOGO
        var logoColor = this.flick > 0 ? M.C.LCRIM : M.C.LMAG;
        F.drawCentered(ctx, 'MISTICAS', 160, 40, logoColor, {
          scale: 3, shadow: M.C.CRIM, shadowDx: 2, shadowDy: 2, spacing: 3
        });
        F.drawCentered(ctx, 'UN JUEGO MALDITO DE ' + M.YEAR, 160, 70, M.C.BONE2, { spacing: 1 });

        if (Math.sin(this.t * 3.4) > -0.25) {
          F.drawCentered(ctx, 'PULSA UNA TECLA PARA COMENZAR', 160, 142, M.C.BONE);
        }
        F.drawCentered(ctx, '(C) ' + M.YEAR + ' - TODOS LOS RITOS RESERVADOS', 160, 190, M.C.BONE2);
      }
    };
  };
})(window.MISTICAS);
