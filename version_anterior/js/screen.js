'use strict';
/* ============================================================
   MÍSTICAS — (C) 1987 — js/screen.js
   El televisor: el juego vive SIEMPRE en un lienzo lógico fijo
   de 256x240 (norma NTSC). Se escala fit-contain con factor
   ENTERO cuando es posible (nitidez 1:1) y barras negras donde
   haga falta. Los controles táctiles se colocan tras cada
   redimensionado en el negro del letterbox: jamás sobre el tubo
   ni sobre el HUD.
   ============================================================ */
(function (M) {

  var Screen = {
    canvas: null,
    tube: { left: 0, top: 0, w: 256, h: 240 },

    init: function (canvas) {
      this.canvas = canvas;
      var self = this;
      window.addEventListener('resize', function () { self.resize(); });
      window.addEventListener('orientationchange', function () {
        setTimeout(function () { self.resize(); }, 80);
      });
      this.resize();
    },

    isTouch: function () {
      return document.body.classList.contains('touch') ||
        (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    },

    resize: function () {
      var BW = M.SCREEN_W, BH = M.SCREEN_H;
      var vw = Math.max(200, window.innerWidth);
      var vh = Math.max(180, window.innerHeight);
      var touch = this.isTouch();

      var s0 = Math.min(vw / BW, vh / BH);

      var needT = 0, needB = 0;
      if (touch) {
        needT = M.TOUCH_TOP;
        var sideBand = (vw - BW * s0) / 2;
        needB = (sideBand < 110) ? M.TOUCH_BOTTOM_TALL : 0;
        s0 = Math.min(vw / BW, (vh - needT - needB) / BH);
      }

      var s = s0;
      if (s >= 2) s = Math.floor(s);   // factor entero = píxel perfecto
      if (s < 0.5) s = 0.5;

      var cw = Math.round(BW * s);
      var ch = Math.round(BH * s);

      var top;
      if (touch) {
        var freeV = Math.max(0, vh - needT - needB - ch);
        top = Math.round(needT + freeV * 0.42);
      } else {
        top = Math.round((vh - ch) / 2);
      }
      if (top < 0) top = 0;
      if (top + ch > vh) top = Math.max(0, vh - ch);
      var left = Math.round((vw - cw) / 2);

      var c = this.canvas;
      c.style.position = 'absolute';
      c.style.left = left + 'px';
      c.style.top = top + 'px';
      c.style.width = cw + 'px';
      c.style.height = ch + 'px';
      c.width = BW;
      c.height = BH;

      this.tube = { left: left, top: top, w: cw, h: ch };

      this._layoutTouch(touch, vw, vh);
    },

    // márgenes seguros (móviles con muesca)
    _safeAreas: function () {
      var cs = getComputedStyle(document.documentElement);
      function px(name) {
        var v = parseFloat(cs.getPropertyValue(name));
        return isNaN(v) ? 0 : v;
      }
      return { top: px('--sat'), right: px('--sar'), bottom: px('--sab'), left: px('--sal') };
    },

    _layoutTouch: function (touch, vw, vh) {
      var pause = document.getElementById('t-pause');
      var audio = document.getElementById('t-audio');
      var joy = document.getElementById('joy');
      var fire = document.getElementById('t-fire');
      if (!touch || !pause) return;

      var sa = this._safeAreas();
      function pos(el, o) {
        if (!el) return;
        el.style.left = (o.left !== undefined) ? o.left + 'px' : '';
        el.style.right = (o.right !== undefined) ? o.right + 'px' : '';
        el.style.top = (o.top !== undefined) ? o.top + 'px' : '';
        el.style.bottom = (o.bottom !== undefined) ? o.bottom + 'px' : '';
      }

      // sistema: banda superior
      pos(pause, { top: Math.max(6, sa.top), right: Math.max(10, sa.right) });
      pos(audio, { top: Math.max(6, sa.top), right: Math.max(10, sa.right) + 56 });

      var tube = this.tube;
      var sideL = tube.left;
      var sideR = vw - (tube.left + tube.w);
      var tubeBottom = tube.top + tube.h;
      var below = vh - tubeBottom;

      // joystick flotante: banda lateral si cabe; si no, zona inferior
      var jw = 104, jh = 104;
      var jLift = Math.max(14, Math.min(78, vh - tubeBottom - jh - 24));
      if (joy) {
        if (sideL >= jw + 14) {
          pos(joy, { left: Math.round((sideL - jw) / 2), bottom: Math.max(16, sa.bottom + 8) });
        } else {
          pos(joy, { left: Math.max(12, sa.left + 6), bottom: jLift });
        }
      }

      // FUEGO: simétrico, a la altura del arco del joystick
      var fw = 64, fh = 64;
      var fLift = Math.max(16, Math.min(jLift + (jh - fh) / 2, vh - tubeBottom - fh - 24));
      if (fire) {
        if (sideR >= fw + 16) {
          pos(fire, { right: Math.round((sideR - fw) / 2), bottom: Math.max(18, sa.bottom + 10) });
        } else {
          pos(fire, { right: Math.max(14, sa.right + 6), bottom: fLift });
        }
      }
    }
  };

  M.Screen = Screen;
})(window.MISTICAS);
