'use strict';
/* ============================================================
   MÍSTICAS — (C) 1987 — fx.js
   Efectos: fundidos, glitch de "cinta corrupta", sacudidas,
   destellos de relámpago, ruido estático, bandas de carga de
   casete, cielo con lunas y estrellas, niebla y barras de cine.
   ============================================================ */
(function (M) {

  // estrellas deterministas (posiciones fraccionales: se adaptan a
  // cualquier anchura de lienzo en pantalla completa)
  var STARS = [];
  (function () {
    var s = 1987;
    function rnd() { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }
    for (var i = 0; i < 48; i++) {
      STARS.push({ fx: rnd(), y: Math.floor(rnd() * 90), b: rnd() });
    }
  })();

  /* NIEBLA 8 BIT: nada de elipses rgba translúcidas — bandas de
     PUNTOS SÓLIDOS en trama (tablero/escalonada) que derivan a
     distintas velocidades. La falsa niebla de la NES era esto:
     píxeles de paleta alternados, jamás alpha. Se pre-renderiza
     una vez por patrón y se pega con drawImage. */
  function buildFogTile(w, h, color, dense) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    var x = c.getContext('2d');
    x.fillStyle = M.PAL[color];
    var rows = Math.floor(h / 2);
    for (var r = 0; r < rows; r++) {
      var y = r * 2;
      // densidad escalonada: más puntos abajo (la niebla asienta)
      var step = (r > rows * 0.55) ? (dense ? 2 : 3) : (dense ? 3 : 4);
      for (var px = 0; px < w; px += step) {
        x.fillRect(px + ((r + px) & 1), y, 1, 1);
      }
    }
    return c;
  }

  var FX = {
    fade: 1, fadeTarget: 0, fadeSpeed: 1.4, fadeCb: null,
    glitchT: 0, glitchPow: 0,
    shakeT: 0, shakePow: 0,
    flashT: 0, flashA: 0, flashColor: M.C.WHITE,
    staticAmt: 0,
    tape: false, tapeT: 0,
    letterbox: 0, letterboxTarget: 0,
    fogA: null, fogB: null,
    _thunderQueue: -1,

    init: function () {
      if (!this.fogA) {
        this.fogA = buildFogTile(84, 22, M.C.VDARK, true);
        this.fogB = buildFogTile(120, 28, M.C.DARK, false);
      }
      if (!this._dithers) this._buildDithers();
    },

    // Tramas de fundido (25/50/75%): el fade de la NES era por
    // PASOS de paleta con trama — aquí negro sólido tramado
    _buildDithers: function () {
      function dither(n) {   // n = 1,2,3 de 4 píxeles encendidos
        var c = document.createElement('canvas');
        c.width = 2; c.height = 2;
        var g = c.getContext('2d');
        g.fillStyle = '#000000';
        if (n === 1) g.fillRect(0, 0, 1, 1);                    // 25%
        else if (n === 2) { g.fillRect(0, 0, 1, 1); g.fillRect(1, 1, 1, 1); } // 50%
        else { g.fillRect(0, 0, 1, 1); g.fillRect(1, 0, 1, 1); g.fillRect(0, 1, 1, 1); } // 75%
        return c;
      }
      this._dithers = [dither(1), dither(2), dither(3)];
      this._ditherPat = [null, null, null];   // patrones perezosos
    },

    fadeTo: function (target, speed, cb) {
      this.fadeTarget = target;
      this.fadeSpeed = speed || 1.4;
      this.fadeCb = cb || null;
    },

    glitchNow: function (power, dur, silent) {
      this.glitchT = dur || 0.22;
      this.glitchPow = power || 1;
      if (!silent) M.Audio.sfx.glitch();
    },

    shakeNow: function (power, dur) {
      this.shakeT = dur || 0.4;
      this.shakePow = power || 3;
    },

    flashNow: function (color, alpha, dur) {
      this.flashColor = color;
      this.flashA = alpha;      // (compat: los escalones no usan alpha)
      this.flashT = dur || 0.18;
      this._flashDur = this.flashT;
    },

    lightning: function () {
      this.flashNow(M.C.WHITE, 0.5, 0.14);
      this._thunderQueue = 0.45 + Math.random() * 0.4;
    },

    update: function (dt) {
      // fundido
      if (this.fade !== this.fadeTarget) {
        var dir = this.fadeTarget > this.fade ? 1 : -1;
        this.fade += dir * this.fadeSpeed * dt;
        if ((dir > 0 && this.fade >= this.fadeTarget) || (dir < 0 && this.fade <= this.fadeTarget)) {
          this.fade = this.fadeTarget;
          if (this.fadeCb) { var cb = this.fadeCb; this.fadeCb = null; cb(); }
        }
      }
      if (this.glitchT > 0) this.glitchT -= dt;
      if (this.shakeT > 0) this.shakeT -= dt;
      if (this.flashT > 0) this.flashT -= dt;
      if (this.tapeT > 0) this.tapeT -= dt;
      if (this._thunderQueue > 0) {
        this._thunderQueue -= dt;
        if (this._thunderQueue <= 0) { M.Audio.sfx.thunder(); this._thunderQueue = -1; }
      }
      // barras de cine
      var lbSpeed = 2.4;
      if (this.letterbox < this.letterboxTarget) this.letterbox = Math.min(this.letterboxTarget, this.letterbox + lbSpeed * dt);
      else if (this.letterbox > this.letterboxTarget) this.letterbox = Math.max(this.letterboxTarget, this.letterbox - lbSpeed * dt);
    },

    /* Desplazamiento de cámara por sacudida */
    shakeOffset: function () {
      if (this.shakeT <= 0) return { x: 0, y: 0 };
      var p = this.shakePow * (this.shakeT > 0 ? 1 : 0);
      return {
        x: (Math.random() * 2 - 1) * p,
        y: (Math.random() * 2 - 1) * p * 0.6
      };
    },

    /* ---------- cielo nocturno con bandas (solo exteriores) ---------- */
    drawSky: function (ctx, horizon, t, opts) {
      opts = opts || {};
      var W = M.SCREEN_W;
      var x, y, i;
      ctx.fillStyle = M.PAL[M.C.BLACK];
      ctx.fillRect(0, 0, W, horizon);
      // bandas con transición tramada (técnica 8 bits)
      this._band(ctx, 1, 26, 12, 0);
      this._band(ctx, M.C.VDARK, 38, 14, M.C.BLACK);
      this._band(ctx, M.C.DARK, 52, 16, M.C.VDARK);
      this._band(ctx, M.C.DPURP, horizon - 14, 14, M.C.DARK);
      ctx.fillStyle = M.PAL[M.C.DARK];
      ctx.fillRect(0, 38, W, 14);
      ctx.fillStyle = M.PAL[M.C.VDARK];
      ctx.fillRect(0, 26, W, 12);
      ctx.fillStyle = M.PAL[M.C.DPURP];
      ctx.fillRect(0, horizon - 14, W, 14);
      // tramas intermedias
      for (x = 0; x < W; x += 2) {
        ctx.fillStyle = M.PAL[M.C.VDARK];
        ctx.fillRect(x + ((x / 2) & 1), 36, 1, 2);
        ctx.fillStyle = M.PAL[M.C.DARK];
        ctx.fillRect(x + ((x / 2) & 1), 50, 1, 2);
        ctx.fillStyle = M.PAL[M.C.DPURP];
        ctx.fillRect(x + 1 - ((x / 2) & 1), horizon - 16, 1, 2);
      }
      // estrellas
      for (i = 0; i < STARS.length; i++) {
        var st = STARS[i];
        if (st.y > horizon - 16) continue;
        var tw = Math.sin(t * (0.6 + st.b) + i * 2.7) > 0.2;
        if (!tw) continue;
        ctx.fillStyle = M.PAL[st.b > 0.75 ? M.C.WHITE : M.C.BONE];
        ctx.fillRect(Math.floor(st.fx * W), st.y, 1, 1);
      }
      // luna
      if (opts.moon !== false) {
        M.Spr.preload();
        var mx = opts.moonX === undefined ? 250 : opts.moonX;
        ctx.drawImage(M.Spr.moon, mx, 16);
      }
    },

    _band: function () { /* (reservado) */ },

    /* ---------- niebla en dos capas de puntos sólidos ---------- */
    drawFog: function (ctx, t, density, camX) {
      if (density <= 0) return;
      var y1 = M.VIEW_H - 56, y2 = M.VIEW_H - 32;
      var W = M.SCREEN_W;
      // capas DISCRETAS según densidad (cero mezcla alpha)
      var layers = density >= 0.8 ? 3 : (density >= 0.4 ? 2 : 1);
      var i, x1, x2;
      var draws = [
        { img: this.fogB, y: y1, sp: 3.2, ph: 40 },
        { img: this.fogA, y: y2, sp: 6.0, ph: 0 },
        { img: this.fogB, y: y2 - 12, sp: 9.0, ph: 70 }
      ];
      for (i = 0; i < layers; i++) {
        var d = draws[i];
        var tw = d.img.width;
        var off = Math.floor((t * d.sp + camX * 0.3 + d.ph) % tw);
        for (x1 = -off - tw; x1 < W + tw; x1 += tw) {
          ctx.drawImage(d.img, Math.round(x1), d.y);
        }
      }
      // franja tramada a ras del suelo: la niebla que "muerde"
      if (layers >= 2) {
        ctx.fillStyle = M.PAL[M.C.VDARK];
        var yb = M.VIEW_H - 8;
        for (x2 = 0; x2 < W; x2 += 2) {
          ctx.fillRect(x2 + (Math.floor(t * 5) & 1), yb, 1, 1);
          ctx.fillRect(x2 + 1 - (Math.floor(t * 5) & 1), yb + 2, 1, 1);
        }
      }
    },

    /* ---------- ruido estático (puntos sólidos de paleta) ---------- */
    drawStatic: function (ctx, amount) {
      if (amount <= 0) return;
      var W = M.SCREEN_W;
      var n = Math.floor(amount * Math.max(240, (W * M.VIEW_H) / 260));
      for (var i = 0; i < n; i++) {
        var c = Math.random();
        ctx.fillStyle = M.PAL[c > 0.7 ? M.C.LMAG : (c > 0.4 ? M.C.PURP : M.C.BONE2)];
        ctx.fillRect(Math.floor(Math.random() * W), Math.floor(Math.random() * M.VIEW_H), 1 + (c > 0.92 ? 2 : 0), 1);
      }
    },

    /* ---------- bandas de carga de casete (bordes) ---------- */
    drawTape: function (ctx, t) {
      var W = M.SCREEN_W, H = M.SCREEN_H;
      var cols = [M.C.MAG, M.C.LMAG, M.C.CRIM, M.C.LPURP, M.C.LCRIM, M.C.PURP];
      var bw = 16, bt = 12;
      var i, y, c1, c2;
      for (y = 0; y < H; y += 3) {
        c1 = cols[Math.floor(M.hash(y, Math.floor(t * 30)) * cols.length)];
        if (y < bt || y > H - bt) {
          ctx.fillStyle = M.PAL[c1];
          ctx.fillRect(0, y, W, 3);
        } else {
          if (y > bt && y < H - bt && (y < bt + 3 || y > H - bt - 6)) { /* esquina */ }
          ctx.fillStyle = M.PAL[c1];
          ctx.fillRect(0, y, bw, 3);
          ctx.fillRect(W - bw, y, bw, 3);
        }
      }
      // franjas superiores/inferiores completas también (estilo ZX)
      for (var x = 0; x < W; x += 3) {
        c2 = cols[Math.floor(M.hash(x + 7, Math.floor(t * 30)) * cols.length)];
        ctx.fillStyle = M.PAL[c2];
        ctx.fillRect(x, 0, 3, bt);
        ctx.fillRect(x, H - bt, 3, bt);
      }
    },

    /* ---------- capa final: glitch, flash, cine, fundido ---------- */
    drawOver: function (ctx, canvas) {
      var W = M.SCREEN_W, H = M.SCREEN_H;
      var i;
      // barras de cine
      if (this.letterbox > 0.01) {
        var bh = Math.round(this.letterbox * 14);
        ctx.fillStyle = M.PAL[M.C.BLACK];
        ctx.fillRect(0, 0, W, bh);
        ctx.fillRect(0, H - M.HUD_H - bh, W, bh);
      }
      // glitch de cinta corrupta
      if (this.glitchT > 0) {
        var p = this.glitchPow;
        var bands = 3 + Math.floor(p * 4);
        for (i = 0; i < bands; i++) {
          var gy = Math.floor(Math.random() * H);
          var gh = 2 + Math.floor(Math.random() * 7);
          var dx = Math.floor((Math.random() * 2 - 1) * (3 + p * 12));
          if (gy + gh > H) gh = H - gy;
          if (gh > 0) ctx.drawImage(canvas, 0, gy, W, gh, dx, gy, W, gh);
        }
        var blocks = Math.floor(p * 5);
        for (i = 0; i < blocks; i++) {
          ctx.fillStyle = M.PAL[[M.C.BLACK, M.C.MAG, M.C.LCRIM, M.C.VDARK][Math.floor(Math.random() * 4)]];
          ctx.fillRect(Math.floor(Math.random() * W), Math.floor(Math.random() * H),
            4 + Math.floor(Math.random() * 26), 2 + Math.floor(Math.random() * 4));
        }
        // línea de barrido rota
        ctx.fillStyle = M.PAL[M.C.LMAG];
        ctx.fillRect(0, Math.floor(Math.random() * H), W, 1);
      }
      // destello (relámpago) EN ESCALONES SÓLIDOS: blanco puro
      // un par de fotogramas, tono apagado el resto — sin alpha
      if (this.flashT > 0) {
        var elapsed = (this._flashDur || 0.18) - this.flashT;
        if (elapsed < 0.07) {
          ctx.fillStyle = M.PAL[this.flashColor];
        } else if (elapsed < 0.12) {
          ctx.fillStyle = M.PAL[this.flashColor === M.C.WHITE ? M.C.BONE : M.C.CRIM];
        } else {
          ctx.fillStyle = null;
        }
        if (ctx.fillStyle) ctx.fillRect(0, 0, W, H);
      }
      // fundido a negro POR TRAMAS (el fade de paleta de 8 bits:
      // 25% → 50% → 75% → negro sólido, sin mezcla alpha)
      if (this.fade > 0.001) {
        if (this.fade >= 0.875) {
          ctx.fillStyle = M.PAL[M.C.BLACK];
          ctx.fillRect(0, 0, W, H);
        } else {
          var step = this.fade >= 0.625 ? 2 : (this.fade >= 0.375 ? 1 : 0);
          if (!this._ditherPat[step]) {
            this._ditherPat[step] = ctx.createPattern(this._dithers[step], 'repeat');
          }
          ctx.fillStyle = this._ditherPat[step];
          ctx.fillRect(0, 0, W, H);
        }
      }
    }
  };

  M.FX = FX;
})(window.MISTICAS);
