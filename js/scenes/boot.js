'use strict';
/* ============================================================
   MÍSTICAS — (C) 1987 — scenes/boot.js
   Arranque del "equipo de 8 bits": monitor, texto de sistema,
   PULSA PLAY EN LA CINTA y carga con bandas + ruido.
   ============================================================ */
(function (M) {

  var F = M.Font;

  var BOOT_LINES = [
    'MISTICAS 64K - MONITOR PREPARADO',
    '(C) ' + M.YEAR + ' - AUTOR DESCONOCIDO',
    'CINTA 1 DE 1 ENCONTRADA'
  ];

  M.Scenes = M.Scenes || {};

  M.Scenes.boot = function (game) {
    return {
      hud: false,
      phase: 0,     // 0 esperar entrada, 1 texto, 2 PLAY, 3 carga, 4 negro
      t: 0,
      lineT: 0,
      li: 0,
      ci: 0,
      loadT: 0,
      loadDur: 4.6,
      tapeSoundT: 0,
      glitchT: 0,

      enter: function () {
        M.Audio.stopMusic();
        M.Audio.wind(false);
      },

      update: function (dt) {
        this.t += dt;

        if (this.phase === 0) {
          if (M.Input.hitAny() || M.Input.hit('fire')) {
            M.Audio.init();
            M.Audio.resume();
            M.Audio.startHum();
            M.Audio.sfx.typeKey();
            this.phase = 1;
            this.lineT = 0; this.li = 0; this.ci = 0;
          }
        } else if (this.phase === 1) {
          this.ci += dt * 30;
          if (Math.floor(this.ci) > (this._lb || 0)) {
            this._lb = Math.floor(this.ci);
            M.Audio.sfx.typeKey();
          }
          var line = BOOT_LINES[this.li];
          if (this.ci >= line.length) {
            this.lineT += dt;
            if (this.lineT > 0.4) {
              this.lineT = 0; this.ci = 0; this._lb = 0;
              this.li++;
              if (this.li >= BOOT_LINES.length) { this.phase = 2; this.t = 0; }
            }
          }
        } else if (this.phase === 2) {
          if (this.t > 2.4) {
            this.phase = 3;
            this.t = 0;
            M.Audio.sfx.tapePilot();
            this.tapeSoundT = 1.5;
          }
        } else if (this.phase === 3) {
          this.loadT += dt;
          this.tapeSoundT -= dt;
          if (this.tapeSoundT <= 0) {
            this.tapeSoundT = 1.4;
            M.Audio.sfx.tapeData();
          }
          this.glitchT -= dt;
          if (this.glitchT <= 0) {
            this.glitchT = 0.9 + Math.random() * 0.8;
            M.FX.glitchNow(0.4, 0.1, true);
            M.Audio.sfx.staticBurst();
          }
          if (this.loadT >= this.loadDur) {
            this.phase = 4;
            this.t = 0;
            M.FX.glitchNow(1.6, 0.5);
            M.Audio.sfx.staticBurst();
          }
        } else if (this.phase === 4) {
          if (this.t > 0.35) {
            game.setScene('title');
          }
        }
      },

      draw: function (ctx) {
        var W = M.SCREEN_W, H = M.SCREEN_H;
        var cx = Math.round(W / 2);
        function y(v) { return Math.round(v * H / 200); }
        var yy = y(24);
        if (this.phase >= 1) {
          for (var i = 0; i < BOOT_LINES.length; i++) {
            if (i > this.li) break;
            var shown = (i < this.li) ? BOOT_LINES[i] : BOOT_LINES[i].substring(0, Math.floor(this.ci));
            if (shown) F.draw(ctx, shown, 22, yy + i * 12, M.C.BONE);
          }
        }
        if (this.phase === 0) {
          if (Math.sin(this.t * 4) > -0.3) {
            F.drawCentered(ctx, 'PULSA UNA TECLA O HAZ CLIC', cx, y(96), M.C.LMAG);
          }
          F.drawCentered(ctx, 'MISTICAS (C) ' + M.YEAR, cx, y(150), M.C.DARK, {});
          F.drawCentered(ctx, 'ESTE PROGRAMA CONTIENE LUZ INTERMITENTE', cx, y(164), M.C.VDARK === 1 ? M.C.BONE2 : M.C.BONE2);
        }
        if (this.phase === 2) {
          if (Math.sin(this.t * 6) > -0.2) {
            F.drawCentered(ctx, 'PULSA PLAY EN LA CINTA', cx, y(96), M.C.LORAN);
          }
        }
        if (this.phase === 3) {
          F.drawCentered(ctx, 'CARGANDO MISTICAS...', cx, y(88), M.C.BONE);
          F.drawCentered(ctx, 'NO APAGUES EL EQUIPO', cx, y(102), M.C.BONE2);
          // bloques de progreso
          var n = 18, bw = 8, total = n * (bw + 2);
          var x0 = cx - total / 2;
          var filled = Math.floor((this.loadT / this.loadDur) * n);
          for (var b = 0; b < n; b++) {
            if (b < filled) {
              ctx.fillStyle = M.PAL[(b % 2) ? M.C.LMAG : M.C.MAG];
              ctx.fillRect(x0 + b * (bw + 2), y(132), bw, 9);
            } else {
              ctx.strokeStyle = M.PAL[M.C.DARK];
              ctx.strokeRect(x0 + b * (bw + 2) + 0.5, y(132) + 0.5, bw - 1, 8);
            }
          }
          // porcentaje
          F.drawCentered(ctx, Math.floor((this.loadT / this.loadDur) * 100) + '%', cx, y(150), M.C.BONE2);
          M.FX.drawTape(ctx, this.t);
        }
      }
    };
  };
})(window.MISTICAS);
