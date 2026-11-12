'use strict';
/* ============================================================
   MÍSTICAS — (C) 1987 — js/input.js
   Los mandos: cruceta (teclado) + joystick táctil flotante y
   botón FUEGO (DOM, plano y translúcido — lo ÚNICO translúcido
   de todo el cartucho, por orden expresa) + PAUSA y AUDIO.
   API: isDown(k), hit(k) (edge), hitAny(), axis() -> {x,y}.
   ============================================================ */
(function (M) {

  var KEYMAP = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    KeyW: 'up', KeyS: 'down', KeyA: 'left', KeyD: 'right',
    KeyZ: 'fire', Space: 'fire', Enter: 'fire',
    KeyP: 'pause', Escape: 'pause', KeyM: 'mute'
  };

  var Input = {
    _down: {},          // teclas mantenidas
    pressed: {},        // flancos de este fotograma
    anyPressed: false,
    joy: { active: false, x: 0, y: 0, id: null },

    init: function () {
      var self = this;

      // --- teclado ---
      window.addEventListener('keydown', function (e) {
        var k = KEYMAP[e.code];
        if (k === 'fire' || k === 'up' || k === 'down' || k === 'left' || k === 'right') e.preventDefault();
        if (e.repeat) return;
        self.anyPressed = true;
        if (!k) return;
        if (!self._down[k]) self.pressed[k] = true;
        self._down[k] = true;
      });
      window.addEventListener('keyup', function (e) {
        var k = KEYMAP[e.code];
        if (k) self._down[k] = false;
      });
      window.addEventListener('blur', function () {
        self._down = {};
        self.joy.active = false;
        self._knob(0, 0);
      });

      // --- joystick táctil flotante ---
      var joy = document.getElementById('joy');
      if (joy) {
        var R = 40; // carrera útil del pomo
        joy.addEventListener('pointerdown', function (e) {
          e.preventDefault();
          joy.classList.add('live');
          try { joy.setPointerCapture(e.pointerId); } catch (err) {}
          self.joy.active = true;
          self.joy.id = e.pointerId;
          self._move(e, joy, R);
        });
        joy.addEventListener('pointermove', function (e) {
          if (!self.joy.active || e.pointerId !== self.joy.id) return;
          e.preventDefault();
          self._move(e, joy, R);
        });
        var end = function (e) {
          if (e.pointerId !== self.joy.id) return;
          self.joy.active = false;
          self.joy.x = 0; self.joy.y = 0;
          self._knob(0, 0);
          joy.classList.remove('live');
        };
        joy.addEventListener('pointerup', end);
        joy.addEventListener('pointercancel', end);
      }

      // --- botones (FUEGO / PAUSA / AUDIO) ---
      this._bindBtn('t-fire', 'fire');
      this._bindBtn('t-pause', 'pause');
      this._bindBtn('t-audio', 'mute');

      // modo táctil: clase global
      var armTouch = function () {
        if (!document.body.classList.contains('touch')) {
          document.body.classList.add('touch');
        }
      };
      window.addEventListener('touchstart', armTouch, { passive: true });
      if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
        armTouch();
      }
    },

    _bindBtn: function (id, key) {
      var el = document.getElementById(id);
      if (!el) return;
      var self = this;
      el.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        e.stopPropagation();
        el.classList.add('held');
        try { el.setPointerCapture(e.pointerId); } catch (err) {}
        self.anyPressed = true;
        if (!self._down[key]) self.pressed[key] = true;
        self._down[key] = true;
      });
      var up = function (e) {
        if (e) e.stopPropagation();
        el.classList.remove('held');
        self._down[key] = false;
      };
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
    },

    _move: function (e, joy, R) {
      var r = joy.getBoundingClientRect();
      var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      var dx = e.clientX - cx, dy = e.clientY - cy;
      var d = Math.sqrt(dx * dx + dy * dy) || 1;
      var m = Math.min(d, R);
      var nx = dx / d, ny = dy / d;
      this.joy.x = nx * (m / R);
      this.joy.y = ny * (m / R);
      this._knob(Math.round(nx * m), Math.round(ny * m));
    },

    _knob: function (x, y) {
      var k = document.getElementById('joy-knob');
      if (k) k.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    },

    /* --- consultas --- */
    isDown: function (k) { return !!this._down[k]; },
    hit: function (k) { return !!this.pressed[k]; },
    hitAny: function () { return this.anyPressed; },

    // eje de movimiento: teclado manda; si no, joystick
    axis: function () {
      var x = 0, y = 0;
      if (this._down.left) x -= 1;
      if (this._down.right) x += 1;
      if (this._down.up) y -= 1;
      if (this._down.down) y += 1;
      if (x === 0 && y === 0 && this.joy.active) {
        var jx = this.joy.x, jy = this.joy.y;
        var m = Math.sqrt(jx * jx + jy * jy);
        if (m > 0.25) { x = jx; y = jy; }
      }
      var m2 = Math.sqrt(x * x + y * y);
      if (m2 > 1) { x /= m2; y /= m2; }
      return { x: x, y: y };
    },

    endFrame: function () {
      this.pressed = {};
      this.anyPressed = false;
    }
  };

  M.Input = Input;
})(window.MISTICAS);
