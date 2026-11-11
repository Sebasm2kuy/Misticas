'use strict';
/* ============================================================
   MÍSTICAS — (C) 1987 — entities.js
   El Niño (jugador), la Niña de blanco (guía) y la Hermana
   (enemiga con cono de visión y vela). Movimiento, animación,
   sigilo y línea de visión por rejilla.
   ============================================================ */
(function (M) {

  var Spr = null;

  /* ============ EL NIÑO ============ */
  function Player(gx, gy) {
    this.gx = gx; this.gy = gy;
    this.r = 0.30;
    this.speed = 2.7;      // teselas por segundo
    this.dir = 'S';        // S, N, W, E
    this.pose = 'stand';   // stand | walk | sit | hide
    this.animT = 0;
    this.moving = false;
    this.stepT = 0;
    this.alpha = 1;
    this.lightR = 34;
  }

  Player.prototype.update = function (dt, map, allowMove) {
    this.moving = false;
    // en cinemática la pose la controla el guion
    if (!allowMove) return;
    if (this.pose === 'sit' || this.pose === 'hide') return;
    var ax = M.Input.axis();
    if (ax.active) {
      M.Iso.move(map, this, ax.x * this.speed * dt, ax.y * this.speed * dt);
      this.moving = true;
      this.pose = 'walk';
      // orientación según la intención en PANTALLA (arriba = de
      // espaldas N, izquierda = perfil W): el movimiento isométrico
      // se siente exactamente como se ve
      if (Math.abs(ax.sx) >= Math.abs(ax.sy)) this.dir = ax.sx > 0 ? 'E' : 'W';
      else this.dir = ax.sy > 0 ? 'S' : 'N';
      this.animT += dt * 7;
      this.stepT -= dt;
      if (this.stepT <= 0) { M.Audio.sfx.step(); this.stepT = 0.26; }
    } else {
      this.pose = 'stand';
      this.animT = 0;
    }
  };

  Player.prototype.sprite = function () {
    var S = Spr.S;
    if (this.pose === 'sit') return S.boySit;
    if (this.pose === 'hide') return S.boyHide;
    var set = this.dir === 'N' ? S.boyN : (this.dir === 'W' || this.dir === 'E') ? S.boyW : S.boyS;
    if (this.pose === 'walk') return (Math.floor(this.animT) % 2 === 0) ? set.walkA : set.walkB;
    return set.stand;
  };

  Player.prototype.draw = function (ctx, sx, sy) {
    var sp = this.sprite();
    Spr.shadow(ctx, sx, sy + 1, 5, 0.45 * this.alpha);
    Spr.draw(ctx, sp, sx - sp.w / 2, sy + 2 - sp.h, { flip: this.dir === 'E', alpha: this.alpha });
  };

  /* ============ LA NIÑA DE BLANCO ============ */
  function Girl(gx, gy, waypoints, opts) {
    this.gx = gx; this.gy = gy;
    this.waypoints = waypoints || [];
    this.wp = 0;
    this.speed = 2.0;
    this.state = (opts && opts.startState) || 'wait'; // hidden | wait | go | gone | script
    this.facing = 'S';
    this.animT = 0;
    this.alpha = 1;
    this.waveT = 0;
    this.onDone = (opts && opts.onDone) || null;
    this.followFar = (opts && opts.followFar) || 6.0;
    this.followNear = (opts && opts.followNear) || 3.2;
    this.ledFar = false;   // avisó "no te demores"
    this.scriptTarget = null;
    this.scriptSpeed = 2.4;
  }

  Girl.prototype.update = function (dt, player) {
    if (this.state === 'gone' || this.state === 'hidden') return;
    this.animT += dt;

    if (this.state === 'script') {
      if (this.scriptTarget) {
        var st = this._moveTo(this.scriptTarget.x, this.scriptTarget.y, this.scriptSpeed * dt);
        if (st) this.scriptTarget = null;
      }
      return;
    }

    var d = M.dist(this.gx, this.gy, player.gx, player.gy);

    if (this.state === 'go') {
      if (d > this.followFar) { this.state = 'wait'; this.waveT = 0; return; }
      if (this.wp < this.waypoints.length) {
        var wpt = this.waypoints[this.wp];
        if (this._moveTo(wpt.x, wpt.y, this.speed * dt)) {
          this.wp++;
          if (this.wp >= this.waypoints.length && this.onDone) this.onDone();
        }
      }
    } else if (this.state === 'wait') {
      this.waveT += dt;
      // gira hacia el niño
      var dx = player.gx - this.gx, dy = player.gy - this.gy;
      this.facing = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'E' : 'W') : (dy > 0 ? 'S' : 'N');
      if (d < this.followNear) {
        this.state = 'go';
        this.ledFar = false;
      }
    }
  };

  Girl.prototype._moveTo = function (tx, ty, step) {
    var dx = tx - this.gx, dy = ty - this.gy;
    var d = Math.sqrt(dx * dx + dy * dy);
    if (d < 0.06) return true;
    var vx = dx / d, vy = dy / d;
    this.gx += vx * Math.min(step, d);
    this.gy += vy * Math.min(step, d);
    this.facing = Math.abs(vx) >= Math.abs(vy) ? (vx > 0 ? 'E' : 'W') : (vy > 0 ? 'S' : 'N');
    this.movingAnim = true;
    return d <= step;
  };

  Girl.prototype.vanish = function (speed) {
    var self = this;
    this._vanishSpeed = speed || 0.8;
    this._vanishing = true;
  };

  Girl.prototype.updateVanish = function (dt) {
    if (this._vanishing && this.alpha > 0) {
      this.alpha -= this._vanishSpeed * dt;
      if (this.alpha <= 0) { this.alpha = 0; this.state = 'gone'; }
    }
  };

  Girl.prototype.draw = function (ctx, sx, sy, t) {
    if (this.alpha <= 0) return;
    var S = Spr.S;
    var sp;
    var prof = (this.facing === 'W' || this.facing === 'E');
    if (this.state === 'wait' && this.waveT > 0.8 && this.waveT < 2.0) {
      sp = (Math.floor(this.waveT * 4) % 2 === 0) ? S.girlS_waveA : S.girlS_waveB;
    } else if (this.state === 'go' || (this.state === 'script' && this.movingAnim)) {
      var set = prof ? S.girlW : S.girlS;
      sp = (Math.floor(this.animT * 6) % 2 === 0) ? set.walkA : set.walkB;
    } else {
      sp = prof ? S.girlW_idle : S.girlS_idle;
    }
    this.movingAnim = false;
    Spr.shadow(ctx, sx, sy + 1, 5, 0.3 * this.alpha);
    Spr.draw(ctx, sp, sx - sp.w / 2, sy + 2 - sp.h, { flip: this.facing === 'E', alpha: this.alpha });
  };

  /* ============ LA HERMANA ============ */
  function Sister(gx, gy, route, opts) {
    this.gx = gx; this.gy = gy;
    this.route = route || [];
    this.wp = 0;
    this.speed = 1.15;
    this.state = 'script';  // script | patrol | wait | alert
    this.facing = { x: 0, y: 1 };
    this.animT = 0;
    this.waitT = 0;
    this.sweeps = null;
    this.alertT = 0;
    this.active = false;    // visión activa
    this.scriptQueue = null;
    this.scriptDone = null;
    this.lightR = 40;
    this.coneR = 3.6;
    this.coneHalf = 0.95;   // rad
  }

  Sister.prototype.update = function (dt, player, map) {
    this.animT += dt;
    var dpx = player.gx - this.gx, dpy = player.gy - this.gy;
    var d = Math.sqrt(dpx * dpx + dpy * dpy);

    if (this.state === 'alert') {
      this.alertT -= dt;
      if (this.alertT <= 0) this.state = 'patrol';
      return;
    }

    if (this.state === 'script') {
      if (this.scriptQueue && this.scriptQueue.length) {
        var cmd = this.scriptQueue[0];
        if (cmd.type === 'move') {
          if (this._moveTo(cmd.x, cmd.y, (cmd.speed || 1.1) * dt)) this.scriptQueue.shift();
        } else if (cmd.type === 'wait') {
          cmd.t -= dt;
          if (cmd.t <= 0) this.scriptQueue.shift();
        } else if (cmd.type === 'face') {
          this.facing = { x: cmd.x, y: cmd.y };
          this.scriptQueue.shift();
        }
      } else if (this.scriptDone) {
        var f = this.scriptDone; this.scriptDone = null; f();
      }
      if (this.active) this._visionCheck(player, map, d, dpx, dpy);
      return;
    }

    // patrulla
    if (this.state === 'patrol' && this.route.length) {
      var wpt = this.route[this.wp];
      if (this._moveTo(wpt.x, wpt.y, this.speed * dt)) {
        // llegó: esperar y mirar
        this.state = 'wait';
        this.waitT = wpt.wait || 1.2;
        if (wpt.face) this.facing = { x: wpt.face.x, y: wpt.face.y };
        this.sweeps = wpt.sweeps || null;
        this.sweepI = 0;
        this.sweepT = 0;
      }
    } else if (this.state === 'wait') {
      this.waitT -= dt;
      if (this.sweeps && this.sweepI < this.sweeps.length) {
        this.sweepT -= dt;
        if (this.sweepT <= 0) {
          var sw = this.sweeps[this.sweepI];
          this.facing = { x: sw.x, y: sw.y };
          this.sweepT = sw.t;
          this.sweepI++;
        }
      }
      if (this.waitT <= 0) {
        this.wp = (this.wp + 1) % this.route.length;
        this.state = 'patrol';
      }
    }

    if (this.active) this._visionCheck(player, map, d, dpx, dpy);
  };

  Sister.prototype._moveTo = function (tx, ty, step) {
    var dx = tx - this.gx, dy = ty - this.gy;
    var d = Math.sqrt(dx * dx + dy * dy);
    if (d < 0.05) return true;
    var vx = dx / d, vy = dy / d;
    this.gx += vx * Math.min(step, d);
    this.gy += vy * Math.min(step, d);
    if (d > 0.15) this.facing = { x: vx, y: vy };
    return d <= step;
  };

  // comprobación de visión (sigilo)
  Sister.prototype._visionCheck = function (player, map, d, dpx, dpy) {
    if (M.Game.state.grace > 0) return;
    if (d > this.coneR + 0.4) return;
    var seen = false;
    if (d < 1.2) {
      seen = this._los(map, player);
    } else {
      // ángulo respecto a su mirada
      var fdot = (this.facing.x * dpx + this.facing.y * dpy) / (d || 1);
      if (fdot > Math.cos(this.coneHalf)) {
        seen = this._los(map, player);
      }
    }
    if (seen && this.onSeen) this.onSeen();
  };

  // raycast por rejilla: las columnas y muros bloquean la vista
  Sister.prototype._los = function (map, player) {
    var steps = Math.ceil(M.dist(this.gx, this.gy, player.gx, player.gy) / 0.2);
    for (var i = 1; i < steps; i++) {
      var t = i / steps;
      var x = this.gx + (player.gx - this.gx) * t;
      var y = this.gy + (player.gy - this.gy) * t;
      var tile = M.Iso.tileAt(map, Math.floor(x), Math.floor(y));
      if (!tile || tile.solid) return false;
    }
    return true;
  };

  Sister.prototype.sprite = function () {
    var S = Spr.S;
    var prof = Math.abs(this.facing.x) > Math.abs(this.facing.y);
    if (this.state === 'alert') return S.nunS_alert;
    var set = prof ? { a: S.nunW_a, b: S.nunW_b } : { a: S.nunS_a, b: S.nunS_b };
    return (Math.floor(this.animT * 4) % 2 === 0) ? set.a : set.b;
  };

  Sister.prototype.draw = function (ctx, sx, sy) {
    var sp = this.sprite();
    Spr.shadow(ctx, sx, sy + 1, 6, 0.5);
    Spr.draw(ctx, sp, sx - sp.w / 2, sy + 2 - sp.h, { flip: this.facing.x > 0.3 && Math.abs(this.facing.x) > Math.abs(this.facing.y) });
  };

  // cono de visión proyectado a la pantalla isométrica
  Sister.prototype.drawCone = function (ctx, toScreen) {
    if (!this.active) return;
    var alert = this.state === 'alert';
    var baseA = Math.atan2(this.facing.y, this.facing.x);
    var pts = [];
    var o = toScreen(this.gx, this.gy);
    pts.push({ x: o.x, y: o.y - 10 });
    var steps = 9;
    for (var i = 0; i <= steps; i++) {
      var a = baseA - this.coneHalf + (this.coneHalf * 2 * i / steps);
      var px = this.gx + Math.cos(a) * this.coneR;
      var py = this.gy + Math.sin(a) * this.coneR;
      var s = toScreen(px, py);
      pts.push({ x: s.x, y: s.y - 6 });
    }
    ctx.globalAlpha = alert ? 0.34 : (0.2 + Math.random() * 0.05);
    ctx.fillStyle = M.PAL[alert ? M.C.LCRIM : M.C.CRIM];
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (var j = 1; j < pts.length; j++) ctx.lineTo(pts[j].x, pts[j].y);
    ctx.closePath();
    ctx.fill();
    // borde del cono
    ctx.globalAlpha = alert ? 0.6 : 0.5;
    ctx.strokeStyle = M.PAL[alert ? M.C.LCRIM : M.C.CRIM];
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    ctx.lineTo(pts[1].x, pts[1].y);
    ctx.moveTo(pts[0].x, pts[0].y);
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    ctx.stroke();
    ctx.globalAlpha = 1;
  };

  /* ============ objetos menores ============ */
  function Candle(gx, gy) {
    this.gx = gx; this.gy = gy;
    this.taken = false;
    this.t = Math.random() * 10;
  }
  Candle.prototype.draw = function (ctx, sx, sy) {
    if (this.taken) return;
    this.t += 0.016;
    var sp = (Math.floor(this.t * 6) % 2 === 0) ? Spr.S.candle_a : Spr.S.candle_b;
    Spr.draw(ctx, sp, sx - 3, sy - 8);
  };

  M.Entities = {
    Player: Player,
    Girl: Girl,
    Sister: Sister,
    Candle: Candle,
    init: function () { Spr = M.Spr; }
  };
})(window.MISTICAS);
