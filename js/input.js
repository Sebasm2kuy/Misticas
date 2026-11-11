'use strict';
/* ============================================================
   MÍSTICAS — (C) 1987 — input.js
   Teclado (flechas / WASD / espacio / P / M) y controles
   táctiles. "pressed" marca pulsación de este fotograma.
   ============================================================ */
(function (M) {

  var Input = {
    keys: {},        // estado mantenido
    pressed: {},     // pulsada en este fotograma
    anyPressed: false,
    enabled: true,

    _MAP: {
      'ArrowUp': 'up', 'KeyW': 'up',
      'ArrowDown': 'down', 'KeyS': 'down',
      'ArrowLeft': 'left', 'KeyA': 'left',
      'ArrowRight': 'right', 'KeyD': 'right',
      'Space': 'fire', 'Enter': 'fire', 'KeyE': 'fire',
      'KeyP': 'pause', 'Escape': 'pause',
      'KeyM': 'mute'
    },

    init: function () {
      var self = this;
      var KEY = this._MAP;

      // Detección inmediata de dispositivo táctil: los botones
      // aparecen sin esperar al primer toque (sin bloqueos).
      if (('ontouchstart' in window) || (navigator.maxTouchPoints > 0)) {
        document.body.classList.add('touch');
      }

      window.addEventListener('keydown', function (e) {
        var k = KEY[e.code];
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].indexOf(e.code) >= 0) e.preventDefault();
        if (e.repeat) return;
        self.anyPressed = true;
        if (!k) return;
        self.keys[k] = true;
        self.pressed[k] = true;
      });

      window.addEventListener('keyup', function (e) {
        var k = KEY[e.code];
        if (k) self.keys[k] = false;
      });

      window.addEventListener('blur', function () {
        self.keys = {};
      });

      // Detección de pantalla táctil
      window.addEventListener('touchstart', function () {
        document.body.classList.add('touch');
      }, { passive: true });

      // Botones táctiles (PAUSA, AUDIO, FUEGO)
      var btns = document.querySelectorAll('.tbtn');
      for (var i = 0; i < btns.length; i++) {
        (function (btn) {
          var k = btn.getAttribute('data-k');
          function on(ev) {
            ev.preventDefault();
            self.keys[k] = true;
            self.pressed[k] = true;
            self.anyPressed = true;
            btn.classList.add('held');
          }
          function off(ev) {
            ev.preventDefault();
            self.keys[k] = false;
            btn.classList.remove('held');
          }
          btn.addEventListener('pointerdown', on);
          btn.addEventListener('pointerup', off);
          btn.addEventListener('pointercancel', off);
          btn.addEventListener('pointerleave', off);
        })(btns[i]);
      }

      this.initJoystick();
    },

    down: function (k) { return !!this.keys[k]; },

    // ¿se pulsó k en este fotograma? (se consume)
    hit: function (k) {
      if (this.pressed[k]) { this.pressed[k] = false; return true; }
      return false;
    },

    hitAny: function () {
      if (this.anyPressed) {
        this.anyPressed = false;
        this.pressed = {};
        return true;
      }
      return false;
    },

    /* Eje de movimiento: vector en REJILLA isométrica (x, y) listo
       para Iso.move, con magnitud analógica 0..1, más la intención
       en ESPACIO DE PANTALLA (sx, sy) para orientar el sprite. El
       joystick táctil tiene prioridad; si no, el teclado. */
    axis: function () {
      var j = this._joy;
      if (j && j.active) {
        return { x: j.x, y: j.y, sx: j.sx, sy: j.sy, active: true };
      }
      var x = 0, y = 0, sx = 0, sy = 0;
      if (this.down('up'))    { x -= 1; y -= 1; sx += 0; sy -= 1; }
      if (this.down('down'))  { x += 1; y += 1; sx += 0; sy += 1; }
      if (this.down('left'))  { x -= 1; y += 1; sx -= 1; sy += 0; }
      if (this.down('right')) { x += 1; y -= 1; sx += 1; sy += 0; }
      var len = Math.sqrt(x * x + y * y);
      var slen = Math.sqrt(sx * sx + sy * sy);
      if (len > 0) { x /= len; y /= len; }
      if (slen > 0) { sx /= slen; sy /= slen; }
      return { x: x, y: y, sx: sx, sy: sy, active: len > 0 };
    },

    /* ---------- JOYSTICK TÁCTIL FLOTANTE ----------
       Sustituye a la cruceta: bola translúcida que se arrastra.
       El vector del dedo en PANTALLA se convierte a la REJILLA
       isométrica (HW=8, HH=4): arrastrar hacia arriba mueve al
       niño hacia arriba en pantalla, con velocidad analógica
       proporcional a la inclinación. Si el stick llega al tope
       se emite UNA pulsación direccional (como una flecha), lo
       que mantiene interacciones como la ventana del convento. */
    _joy: null,
    _joyKeyed: false,

    initJoystick: function () {
      var self = this;
      var base = document.getElementById('joy');
      var knob = document.getElementById('joy-knob');
      if (!base || !knob) return;
      this._joy = { active: false, x: 0, y: 0, sx: 0, sy: 0 };

      var pid = null;

      function setKnob(dx, dy) {
        knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      }

      function reset() {
        pid = null;
        self._joyKeyed = false;
        base.classList.remove('live');
        setKnob(0, 0);
        self._joy.active = false;
        self._joy.x = self._joy.y = self._joy.sx = self._joy.sy = 0;
      }

      function update(ev) {
        var rect = base.getBoundingClientRect();
        if (rect.width < 10) return;
        var half = rect.width / 2;
        var kr = Math.max(12, 22 * (rect.width / 104));   // radio del pomo
        var R = half - kr - 2;                            // recorrido útil
        var DEAD = Math.max(6, R * 0.3);
        var lx = ev.clientX - (rect.left + half);
        var ly = ev.clientY - (rect.top + half);
        var len = Math.sqrt(lx * lx + ly * ly);
        if (len > R) { lx = lx / len * R; ly = ly / len * R; len = R; }
        setKnob(Math.round(lx), Math.round(ly));
        if (len < DEAD) { self._joy.active = false; return; }
        var mag = Math.min(1, (len - DEAD) / Math.max(1, R - DEAD));
        // pantalla → rejilla isométrica (HW=8, HH=4):
        // gx = y/8 + x/16, gy = y/8 - x/16
        var gx = ly / 8 + lx / 16;
        var gy = ly / 8 - lx / 16;
        var glen = Math.sqrt(gx * gx + gy * gy) || 1;
        self._joy.active = true;
        self._joy.x = gx / glen * mag;
        self._joy.y = gy / glen * mag;
        self._joy.sx = lx / (len || 1);
        self._joy.sy = ly / (len || 1);
        // giro completo del stick = UNA pulsación direccional
        if (mag > 0.9 && !self._joyKeyed) {
          self._joyKeyed = true;
          var k = (Math.abs(lx) >= Math.abs(ly))
            ? (lx > 0 ? 'right' : 'left')
            : (ly > 0 ? 'down' : 'up');
          self.pressed[k] = true;
          self.anyPressed = true;
        }
      }

      base.addEventListener('pointerdown', function (ev) {
        ev.preventDefault();
        if (pid !== null) return;
        pid = ev.pointerId;
        self._joyKeyed = false;
        base.classList.add('live');
        if (base.setPointerCapture) {
          try { base.setPointerCapture(pid); } catch (e) {}
        }
        update(ev);
      });
      base.addEventListener('pointermove', function (ev) {
        if (pid === null || ev.pointerId !== pid) return;
        update(ev);
      });
      function end(ev) {
        if (pid === null || ev.pointerId !== pid) return;
        reset();
      }
      base.addEventListener('pointerup', end);
      base.addEventListener('pointercancel', end);
    },

    // Llamar al final del fotograma
    endFrame: function () {
      this.pressed = {};
      this.anyPressed = false;
    }
  };

  M.Input = Input;
})(window.MISTICAS);
