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

      // Botones táctiles
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

    // Eje de movimiento (-1..1 en "espacio de pantalla")
    axis: function () {
      var x = 0, y = 0;
      if (this.down('up')) { x -= 1; y -= 1; }
      if (this.down('down')) { x += 1; y += 1; }
      if (this.down('left')) { x -= 1; y += 1; }
      if (this.down('right')) { x += 1; y -= 1; }
      var len = Math.sqrt(x * x + y * y);
      if (len > 0) { x /= len; y /= len; }
      return { x: x, y: y, active: len > 0 };
    },

    // Llamar al final del fotograma
    endFrame: function () {
      this.pressed = {};
      this.anyPressed = false;
    }
  };

  M.Input = Input;
})(window.MISTICAS);
