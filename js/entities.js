'use strict';
/* ============================================================
   MÍSTICAS — (C) 1987 — js/entities.js
   Los habitantes del cartucho. Todos son sprites de matriz
   con contorno negro macizo, sin sombra difusa bajo los pies.
   El movimiento es de rejilla libre con colisión por teselas,
   perfectamente alineada a los muros del diorama.
   ============================================================ */
(function (M) {

  var SPEED = 3.4;   // teselas/seg del niño

  /* ================= EL NIÑO ================= */

  function Player(x, y) {
    this.gx = x; this.gy = y;
    this.dir = 'down';
    this.pose = 'stand';   // stand | walk | sit | hide
    this.animT = 0;
    this.stepT = 0;
    this.moving = false;
  }

  Player.prototype.update = function (dt, world) {
    if (this.pose === 'sit') return;

    var ax = world.axis;
    this.moving = false;

    if (this.pose !== 'hide' && (ax.x !== 0 || ax.y !== 0)) {
      var nx = this.gx + ax.x * SPEED * dt;
      var ny = this.gy + ax.y * SPEED * dt;
      var moved = false;
      if (!world.room.collidesBox(nx, this.gy, 0.3, 0.22)) { this.gx = nx; moved = true; }
      if (!world.room.collidesBox(this.gx, ny, 0.3, 0.22)) { this.gy = ny; moved = true; }
      // dirección dominante: gira aunque empuje contra un muro
      if (Math.abs(ax.x) > Math.abs(ax.y)) this.dir = ax.x > 0 ? 'right' : 'left';
      else this.dir = ax.y > 0 ? 'down' : 'up';
      // solo "camina" (pose y pasos) si de verdad se desplazó:
      // bloqueado en ambas direcciones = gira pero queda de pie
      if (moved) {
        this.moving = true;
        this.pose = 'walk';
        this.animT += dt;
        this.stepT -= dt;
        if (this.stepT <= 0) { this.stepT = 0.26; M.Audio.sfx.step(); }
      } else {
        this.moving = false;
        this.pose = 'stand';
      }
    } else if (this.pose !== 'hide') {
      this.pose = 'stand';
    }

    // ¿está a cubierto tras una columna?
    this.hidden = false;
    var hides = world.hides;
    for (var i = 0; i < hides.length; i++) {
      if (M.dist(this.gx, this.gy, hides[i].x, hides[i].y) < 1.0) {
        this.hidden = true;
        break;
      }
    }
    if (this.hidden && !this.moving) this.pose = 'hide';
  };

  Player.prototype.drawable = function (fade, time) {
    var self = this;
    var px = this.gx * 8, py = this.gy * 8;
    return {
      baseY: py,
      draw: function (ctx, f) {
        var name;
        if (self.pose === 'sit') name = 'HOOD_SIT';
        else if (self.pose === 'hide') name = 'HOOD_HIDE';
        else if (self.pose === 'walk') {
          var fr = Math.floor(self.animT * 6) % 2;
          name = self.dir === 'down' ? 'HOOD_DOWN_' + fr
            : self.dir === 'up' ? 'HOOD_UP_' + fr
              : 'HOOD_SIDE_' + fr;
        } else {
          name = self.dir === 'down' ? 'HOOD_DOWN_0'
            : self.dir === 'up' ? 'HOOD_UP_0'
              : 'HOOD_SIDE_0';
        }
        var flip = self.dir === 'left';
        var h = M.Spr.h(name);
        // si está oculto, la columna lo tapa (se dibuja y la
        // columna delante lo cubre por orden de profundidad)
        M.Spr.draw(ctx, name, px - 8, py - h, { fade: f, flip: flip });
      }
    };
  };

  /* ================= ELLA ================= */

  function Girl(x, y, waypoints, opts) {
    opts = opts || {};
    this.gx = x; this.gy = y;
    this.waypoints = waypoints || [];
    this.wp = 0;
    this.state = opts.startState || 'go';   // hidden | script | wait | go | gone
    this.dir = 'up';
    this.animT = 0;
    this.waveT = 0;
    this.scriptTarget = null;
    this.vanishT = 0;
    this._vanishing = false;
  }

  Girl.prototype.update = function (dt) {
    if (this.state === 'gone' || this.state === 'hidden') return;
    this.animT += dt;
    if (this.waveT > 0) this.waveT -= dt;

    if (this._vanishing) {
      this.vanishT -= dt;
      if (this.vanishT <= 0) { this._vanishing = false; this.state = 'gone'; }
      return;
    }

    if (this.state === 'go') {
      var wp = this.waypoints[this.wp];
      if (!wp) return;
      var dx = wp.x - this.gx, dy = wp.y - this.gy;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < 0.1) {
        if (this.wp < this.waypoints.length - 1) this.wp++;
        return;
      }
      var sp = 1.7 * dt;
      this.gx += (dx / d) * Math.min(sp, d);
      this.gy += (dy / d) * Math.min(sp, d);
      this.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    } else if (this.state === 'script' && this.scriptTarget) {
      var t = this.scriptTarget;
      var dx2 = t.x - this.gx, dy2 = t.y - this.gy;
      var d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
      if (d2 > 0.08) {
        var sp2 = 1.7 * dt;
        this.gx += (dx2 / d2) * Math.min(sp2, d2);
        this.gy += (dy2 / d2) * Math.min(sp2, d2);
        this.dir = Math.abs(dx2) > Math.abs(dy2) ? (dx2 > 0 ? 'right' : 'left') : (dy2 > 0 ? 'down' : 'up');
      }
    }
  };

  Girl.prototype.vanish = function (t) {
    this._vanishing = true;
    this.vanishT = t || 1.2;
  };

  Girl.prototype.drawable = function (fade, time) {
    var self = this;
    var px = this.gx * 8, py = this.gy * 8;
    return {
      baseY: py - 1,
      draw: function (ctx, f) {
        if (self.state === 'gone' || self.state === 'hidden') return;
        // desvanecida 8-bit: parpadeo de fotogramas (sin alpha)
        if (self._vanishing && Math.floor(self.vanishT * 14) % 2 === 0) return;
        var name;
        if (self.waveT > 0) name = 'GIRL_WAVE';
        else name = self.dir === 'down' ? 'GIRL_DOWN'
          : self.dir === 'up' ? 'GIRL_UP' : 'GIRL_SIDE';
        var flip = self.dir === 'left';
        M.Spr.draw(ctx, name, px - 6, py - 16, { fade: f, flip: flip });
      }
    };
  };

  /* ================= LA HERMANA ================= */

  function Sister(def) {
    this.gx = def.x; this.gy = def.y;
    this.route = def.route || [];
    this.wp = 0;
    this.phase = 'move';    // move | wait | sweep
    this.waitT = 0;
    this.sweeps = [];
    this.sweepT = 0;
    this.face = { x: 0, y: 1 };
    this.state = 'patrol';  // script | patrol | alert
    this.active = false;
    this.alertT = 0;
    this.animT = 0;
    this.scriptQueue = null;
    this.scriptDone = null;
    this.onSeen = null;
    this.dir = 'down';
  }

  Sister.prototype._dirFromVec = function (x, y) {
    if (Math.abs(x) > Math.abs(y)) return x > 0 ? 'right' : 'left';
    return y > 0 ? 'down' : 'up';
  };

  Sister.prototype.update = function (dt, world) {
    this.animT += dt;

    if (this.state === 'alert') {
      this.alertT -= dt;
      if (this.alertT <= 0) this.state = 'patrol';
      return;
    }

    if (this.state === 'script' && this.scriptQueue) {
      var st = this.scriptQueue[0];
      if (!st) {
        this.scriptQueue = null;
        if (this.scriptDone) this.scriptDone();
        return;
      }
      if (st.type === 'move') {
        var dx = st.x - this.gx, dy = st.y - this.gy;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < 0.08) { this.scriptQueue.shift(); return; }
        var sp = (st.speed || 2) * dt;
        this.gx += (dx / d) * Math.min(sp, d);
        this.gy += (dy / d) * Math.min(sp, d);
        this.dir = this._dirFromVec(dx, dy);
        this.face = { x: dx / d, y: dy / d };
      } else if (st.type === 'face') {
        this.face = { x: st.x, y: st.y };
        this.dir = this._dirFromVec(st.x, st.y);
        this.scriptQueue.shift();
      } else if (st.type === 'wait') {
        st.t -= dt;
        if (st.t <= 0) this.scriptQueue.shift();
      }
      return;
    }

    if (!this.active || this.state !== 'patrol') return;

    // patrulla por ruta
    var wp = this.route[this.wp];
    if (!wp) return;

    if (this.phase === 'move') {
      var dx2 = wp.x - this.gx, dy2 = wp.y - this.gy;
      var d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
      if (d2 < 0.1) {
        this.phase = 'wait';
        this.waitT = wp.wait || 0;
        this.sweeps = (wp.sweeps || []).slice();
        if (wp.face) { this.face = wp.face; this.dir = this._dirFromVec(wp.face.x, wp.face.y); }
        return;
      }
      var sp2 = 1.9 * dt;
      this.gx += (dx2 / d2) * Math.min(sp2, d2);
      this.gy += (dy2 / d2) * Math.min(sp2, d2);
      this.dir = this._dirFromVec(dx2, dy2);
      this.face = { x: dx2 / d2, y: dy2 / d2 };
    } else if (this.phase === 'wait') {
      this.waitT -= dt;
      if (this.waitT <= 0) {
        if (this.sweeps.length) {
          this.phase = 'sweep';
          this.sweepT = this.sweeps[0].t;
          this.face = { x: this.sweeps[0].x, y: this.sweeps[0].y };
          this.dir = this._dirFromVec(this.face.x, this.face.y);
        } else {
          this.phase = 'move';
          this.wp = (this.wp + 1) % this.route.length;
        }
      }
    } else if (this.phase === 'sweep') {
      this.sweepT -= dt;
      if (this.sweepT <= 0) {
        this.sweeps.shift();
        this.phase = 'wait';
        this.waitT = 0.001;
      }
    }

    // visión: cono en la dirección de la mirada
    if (world && world.player && world.player.pose !== 'hide' && !world.player.hidden) {
      var pdx = world.player.gx - this.gx, pdy = world.player.gy - this.gy;
      var pd = Math.sqrt(pdx * pdx + pdy * pdy);
      if (pd < 4.8) {
        var dot = (pdx * this.face.x + pdy * this.face.y) / (pd || 1);
        if (dot > 0.55 && this.onSeen) this.onSeen();
      }
    }
  };

  Sister.prototype.drawable = function (fade, time) {
    var self = this;
    var px = this.gx * 8, py = this.gy * 8;
    return {
      baseY: py,
      draw: function (ctx, f) {
        if (!self.active && self.state === 'script' && !self.scriptQueue) return;
        var fr = Math.floor(self.animT * 5) % 2;
        var name = self.dir === 'down' ? 'SIS_DOWN_' + fr
          : self.dir === 'up' ? 'SIS_UP_' + fr
            : 'SIS_SIDE_' + fr;
        var flip = self.dir === 'left';
        M.Spr.draw(ctx, name, px - 7, py - 20, { fade: f, flip: flip });
        // su vela: luz viva en la mano
        M.Spr.drawFlame(ctx, px + 4, py - 20, time, f);
        // alerta: exclamación magenta
        if (self.state === 'alert') {
          M.Spr.draw(ctx, 'EXCLAM', px - 2, py - 34, { fade: f });
        }
      }
    };
  };

  /* ================= BICHOS ================= */

  function Rat(a, b, gy) {
    this.a = a; this.b = b; this.gy = gy;
    this.gx = a; this.dir = 1;
    this.t = 0;
  }
  Rat.prototype.update = function (dt) {
    this.t += dt;
    this.gx += this.dir * 2.2 * dt;
    if (this.gx > this.b) { this.gx = this.b; this.dir = -1; }
    if (this.gx < this.a) { this.gx = this.a; this.dir = 1; }
  };
  Rat.prototype.drawable = function (fade, time) {
    var self = this;
    var px = this.gx * 8, py = this.gy * 8;
    return {
      baseY: py - 4,
      draw: function (ctx, f) {
        var fr = Math.floor(self.t * 8) % 2;
        M.Spr.draw(ctx, 'RAT_' + fr, px - 4, py - 5, { fade: f, flip: self.dir < 0 });
      }
    };
  };

  function Bat(x0, y0, ampx, ampy, phase) {
    this.x0 = x0; this.y0 = y0;
    this.ampx = ampx || 20; this.ampy = ampy || 8;
    this.phase = phase || 0;
    this.t = phase;
  }
  Bat.prototype.update = function (dt) { this.t += dt; };
  Bat.prototype.drawable = function (fade, time) {
    var self = this;
    return {
      baseY: -100,   // siempre sobre el mundo (detrás de nadie)
      draw: function (ctx, f) {
        var x = self.x0 * 8 + Math.sin(self.t * 0.9) * self.ampx;
        var y = self.y0 * 8 + Math.sin(self.t * 2.3) * self.ampy;
        var fr = Math.floor(self.t * 7) % 2;
        M.Spr.draw(ctx, 'BAT_' + fr, x - 5, y, { fade: f });
      }
    };
  };

  /* ============================================================
     EL MUNDO DE ESCENA: une sala + entidades + reglas
     ============================================================ */

  function WorldScene(def) {
    this.room = new M.Room(def.room);
    this.player = new Player(def.playerStart.x, def.playerStart.y);
    this.axis = { x: 0, y: 0 };
    this.control = false;
    this.time = 0;
    this.fade = 0;
    this.lightning = false;
    this.dynLights = [];
    this.extraLights = [];

    this.girl = def.girl ? new Girl(def.girl.x, def.girl.y, def.girl.waypoints, def.girl) : null;
    this.sister = def.sister ? new Sister(def.sister) : null;
    this.rats = [];
    this.bats = [];
    this.candles = (def.candles || []).map(function (c) {
      return { tx: c[0], ty: c[1], taken: false };
    });

    // zonas de cobertura tras columnas
    this.hides = (def.hides || []).map(function (h) {
      return { x: h[0], y: h[1] };
    });

    this.triggers = [];
    this.interactables = [];
    this.doorOpen = false;
    this.doorProp = null;

    // blindaje del cartucho: si el punto de aparición cayera
    // dentro de un sólido (árbol, muro, lápida...), se recoloca
    // en espiral a la casilla libre más cercana. Ninguna escena
    // puede volver a nacer atrapada.
    this._unstick();
  }

  // caja del jugador (semiancho/alto en teselas), igual que Player
  WorldScene.prototype._unstick = function () {
    var HW = 0.3, HH = 0.22;
    var P = this.player;
    if (!this.room.collidesBox(P.gx, P.gy, HW, HH)) return;
    var bx = Math.floor(P.gx), by = Math.floor(P.gy);
    for (var r = 1; r <= 10; r++) {
      for (var dy = -r; dy <= r; dy++) {
        for (var dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; // solo el anillo r
          var nx = bx + dx + 0.5, ny = by + dy + 0.5;
          if (!this.room.collidesBox(nx, ny, HW, HH)) {
            P.gx = nx; P.gy = ny;
            return;
          }
        }
      }
    }
  };

  WorldScene.prototype.update = function (dt, game) {
    this.time += dt;
    this.lightning = M.FX.isLightning();
    this.axis = this.control ? M.Input.axis() : { x: 0, y: 0 };
    this.player.update(dt, this);

    if (this.girl) this.girl.update(dt);
    if (this.sister) this.sister.update(dt, this);
    for (var i = 0; i < this.rats.length; i++) this.rats[i].update(dt);
    for (var j = 0; j < this.bats.length; j++) this.bats[j].update(dt);

    // disparadores por proximidad
    if (this.control) {
      for (var t = 0; t < this.triggers.length; t++) {
        var tr = this.triggers[t];
        if (tr.done) continue;
        if (M.dist(this.player.gx, this.player.gy, tr.x, tr.y) < (tr.r || 1.4)) {
          if (tr.once) tr.done = true;
          tr.fn();
        }
      }
      // interactuables: FUEGO (o tecla alternativa)
      for (var k = 0; k < this.interactables.length; k++) {
        var it = this.interactables[k];
        if (it.done) continue;
        var near = M.dist(this.player.gx, this.player.gy, it.x, it.y) < (it.r || 1.4);
        var key = it.key || 'fire';
        if (near && it.hint && !M.UI.hint && !M.UI.dialog) M.UI.showHint(it.hint, 0.4);
        if (near && M.Input.hit(key)) {
          if (it.once) it.done = true;
          it.fn();
        }
      }
    }

    // luces dinámicas: velas sueltas + vela de la hermana + ella
    this.dynLights.length = 0;
    for (var c = 0; c < this.candles.length; c++) {
      var cd = this.candles[c];
      if (!cd.taken) {
        this.dynLights.push({ px: cd.tx * 8 + 4, py: cd.ty * 8 + 2, r: 26 });
      }
    }
    if (this.sister && this.sister.active) {
      this.dynLights.push({ px: this.sister.gx * 8 + 5, py: this.sister.gy * 8 - 16, r: 28 });
    }
    if (this.girl && this.girl.state !== 'gone' && this.girl.state !== 'hidden') {
      this.dynLights.push({ px: this.girl.gx * 8, py: this.girl.gy * 8 - 8, r: 15 });
    }
    for (var e = 0; e < this.extraLights.length; e++) {
      this.dynLights.push(this.extraLights[e]);
    }
  };

  WorldScene.prototype.draw = function (ctx) {
    var self = this;
    var drawables = [];

    // objetos de suelo del diorama (lápidas, columnas, mesas...)
    var fps = this.room.floorProps;
    for (var i = 0; i < fps.length; i++) {
      drawables.push(this._propDrawable(fps[i]));
    }

    // velas recogibles
    for (var c = 0; c < this.candles.length; c++) {
      var cd = this.candles[c];
      if (cd.taken) continue;
      (function (candle) {
        drawables.push({
          baseY: candle.ty * 8 + 8,
          draw: function (ctx, f) {
            M.Spr.draw(ctx, 'CANDLE', candle.tx * 8 + 1, candle.ty * 8 - 1, { fade: f });
            M.Spr.drawFlame(ctx, candle.tx * 8 + 1, candle.ty * 8 - 7, self.time, f);
          }
        });
      })(cd);
    }

    // la puerta carmesí (si sigue cerrada): doble hoja que llena
    // la ogiva, anclada al arranque del muro
    if (this.doorProp && !this.doorOpen) {
      (function (dp) {
        drawables.push({
          baseY: dp.bottomY - 20,
          draw: function (ctx, f) {
            M.Spr.draw(ctx, 'DOORG', dp.cx - 15, dp.bottomY - M.Spr.h('DOORG'), { fade: f });
          }
        });
      })(this.doorProp);
    }

    // criaturas
    drawables.push(this.player.drawable(this.fade, this.time));
    if (this.girl) drawables.push(this.girl.drawable(this.fade, this.time));
    if (this.sister) drawables.push(this.sister.drawable(this.fade, this.time));
    for (var r = 0; r < this.rats.length; r++) drawables.push(this.rats[r].drawable(this.fade, this.time));
    for (var b = 0; b < this.bats.length; b++) drawables.push(this.bats[b].drawable(this.fade, this.time));

    this.room.draw(ctx, this, drawables);
  };

  WorldScene.prototype._propDrawable = function (p) {
    var size = p.size || 1;
    var baseY = (p.ty + size) * 8;
    return {
      baseY: p.baseY !== undefined ? p.baseY : baseY - 24,
      draw: function (ctx, f) {
        if (p.kind === 'DEADTREE') {
          M.Spr.draw(ctx, 'DEADTREE', p.tx * 8 + (size * 8 - 22) / 2, baseY - 28, { fade: f });
        } else if (p.kind === 'BIGTREE') {
          M.Spr.drawBigTree(ctx, p.tx * 8, baseY - 124, 0);
        } else if (p.kind === 'STAIRS') {
          M.Spr.draw(ctx, 'STAIRS', p.tx * 8, baseY - 10, { fade: f });
        } else if (p.kind === 'COLUMN') {
          M.Spr.draw(ctx, 'COLUMN', p.tx * 8 + (size * 8 - 12) / 2, baseY - 25, { fade: f });
        } else {
          var name = p.kind; // sprite directo
          var w = M.Spr.w(name);
          M.Spr.draw(ctx, name, p.tx * 8 + (size * 8 - w) / 2, baseY - M.Spr.h(name), { fade: f });
        }
      }
    };
  };

  // caja de colisión (en teselas) contra la rejilla sólida
  WorldScene.prototype.collides = function (gx, gy) {
    return this.room.solid(Math.floor(gx), Math.floor(gy));
  };

  M.Player = Player;
  M.Girl = Girl;
  M.Sister = Sister;
  M.Rat = Rat;
  M.Bat = Bat;
  M.WorldScene = WorldScene;

})(window.MISTICAS);
