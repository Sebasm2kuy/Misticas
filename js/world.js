'use strict';
/* ============================================================
   MÍSTICAS — (C) 1987 — world.js
   Base para escenas de mundo: mapa + cámara + entidades +
   decorados con orden pintor + oscuridad interior con luces +
   niebla, murciélagos y ratas de ambiente.
   ============================================================ */
(function (M) {

  var E = M.Entities;

  function WorldScene(cfg) {
    this.cfg = cfg;
    this.map = M.Iso.buildMap(cfg.mapDef);
    this.player = new E.Player(cfg.playerStart.x, cfg.playerStart.y);
    this.control = false;
    this.cam = { x: 0, y: 0 };
    this.camOverride = null; // {gx, gy} durante cinemáticas
    this.triggers = [];
    this.interactables = [];
    this.decor = [];
    this.candles = [];
    this.bats = [];
    this.rats = [];
    this.marks = {};
    this._darkCanvas = null;
    this.t = 0;
    this.batTimer = 2 + Math.random() * 3;

    // entidades desde marcas del mapa
    var i, mk;
    for (i = 0; i < this.map.marks.length; i++) {
      mk = this.map.marks[i];
      (this.marks[mk.ch] = this.marks[mk.ch] || []).push(mk);
    }

    // velas
    if (cfg.candles) {
      for (i = 0; i < cfg.candles.length; i++) {
        this.candles.push(new E.Candle(cfg.candles[i][0], cfg.candles[i][1]));
      }
    }

    // la niña guía
    if (cfg.girl) {
      this.girl = new E.Girl(cfg.girl.x, cfg.girl.y, cfg.girl.waypoints || [], cfg.girl);
    } else this.girl = null;

    // la hermana
    if (cfg.sister) {
      this.sister = new E.Sister(cfg.sister.x, cfg.sister.y, cfg.sister.route || [], cfg.sister);
    } else this.sister = null;

    this._buildDecor();
    this._initCam();
  }

  WorldScene.prototype._initCam = function () {
    var p = M.Iso.worldToScreen(this.player.gx, this.player.gy);
    this.cam.x = p.x + M.TILE_HW - M.SCREEN_W / 2;
    this.cam.y = p.y + 6 - M.VIEW_H / 2;
    M.Iso.clampCam(this.map, this.cam, M.SCREEN_W, M.VIEW_H);
  };

  WorldScene.prototype._buildDecor = function () {
    var self = this;
    var Spr = M.Spr;
    Spr.preload();

    // T: el gran árbol (2x2 sólidas)
    if (this.marks['T'] && this.marks['T'].length) {
      var a = this.marks['T'][0];
      for (var dy = 0; dy < 2; dy++) {
        for (var dx = 0; dx < 2; dx++) {
          var t = M.Iso.tileAt(self.map, a.x + dx, a.y + dy);
          if (t) t.solid = true;
        }
      }
      this.decor.push({
        gx: a.x + 0.5, gy: a.y + 0.5,
        draw: function (ctx, sx, sy) {
          var tr = Spr.bigTree;
          ctx.drawImage(tr.canvas, Math.round(sx - tr.ox), Math.round(sy - tr.oy + 6));
          // frutos magenta que parpadean
          for (var i = 0; i < tr.tips.length; i++) {
            var tp = tr.tips[i];
            if (Math.sin(self.t * (1.3 + i * 0.4) + i * 2) > 0.35) {
              ctx.fillStyle = M.PAL[M.C.MAG];
              ctx.fillRect(Math.round(sx - tr.ox + tp.x), Math.round(sy - tr.oy + 6 + tp.y), 1, 1);
            }
          }
        }
      });
    }

    // L: lápida con la inscripción latina
    if (this.marks['L']) {
      this.marks['L'].forEach(function (mk) {
        self.decor.push({ gx: mk.x, gy: mk.y, draw: function (ctx, sx, sy) {
          Spr.draw(ctx, Spr.S.tomb2, sx - 6, sy - 10);
        }});
        M.Iso.tileAt(self.map, mk.x, mk.y).solid = true;
      });
    }

    // t: árboles muertos
    if (this.marks['t']) {
      this.marks['t'].forEach(function (mk, i) {
        var img = Spr.deadTrees[i % Spr.deadTrees.length];
        self.decor.push({ gx: mk.x, gy: mk.y, draw: function (ctx, sx, sy) {
          ctx.drawImage(img, Math.round(sx - img.width / 2), Math.round(sy - img.height + 5));
        }});
        M.Iso.tileAt(self.map, mk.x, mk.y).solid = true;
      });
    }

    // decorados definidos por leyenda (tumbas, valla, ventana, puerta, columna)
    var seen = {};
    for (var gy = 0; gy < this.map.h; gy++) {
      for (var gx = 0; gx < this.map.w; gx++) {
        var tile = this.map.cells[gy][gx];
        if (!tile.deco || seen[gx + ',' + gy]) continue;
        seen[gx + ',' + gy] = true;
        this._addDeco(tile.deco, gx, gy);
      }
    }
  };

  WorldScene.prototype._addDeco = function (name, gx, gy) {
    var Spr = M.Spr, self = this;
    function tomb(sp, dy) {
      return function (ctx, sx, sy) {
        Spr.draw(ctx, sp, sx - sp.w / 2 + 1, sy - sp.h + 4 + (dy || 0));
      };
    }
    switch (name) {
      case 'tomb1': this.decor.push({ gx: gx, gy: gy, draw: tomb(Spr.S.tomb1) }); break;
      case 'tomb2': this.decor.push({ gx: gx, gy: gy, draw: tomb(Spr.S.tomb2) }); break;
      case 'tomb3': this.decor.push({ gx: gx, gy: gy, draw: tomb(Spr.S.tomb3) }); break;
      case 'fence': this.decor.push({ gx: gx, gy: gy, draw: tomb(Spr.S.fence) }); break;
      case 'window':
        this.decor.push({ gx: gx, gy: gy, draw: function (ctx, sx, sy, t) {
          var lit = self.cfg.windowLit && Math.sin(t * 2.3) > -0.4;
          Spr.draw(ctx, Spr.S.window, sx - 8, sy - 15, lit ? { remap: { '0': 'A' } } : null);
        }});
        break;
      case 'door':
        this.decor.push({ gx: gx, gy: gy, draw: function (ctx, sx, sy) {
          Spr.preload();
          ctx.drawImage(Spr.doorCanvas, Math.round(sx - 10), Math.round(sy - 26));
        }});
        break;
      case 'column':
        this.decor.push({ gx: gx, gy: gy, draw: function (ctx, sx, sy) {
          Spr.draw(ctx, Spr.S.column, sx - 6, sy - 22);
        }});
        break;
      case 'arch':
        this.decor.push({ gx: gx, gy: gy, draw: function (ctx, sx, sy) {
          Spr.preload();
          ctx.drawImage(Spr.archCanvas, Math.round(sx - 12), Math.round(sy - 30));
        }});
        break;
      case 'stairs':
        this.decor.push({ gx: gx, gy: gy, draw: function (ctx, sx, sy) {
          Spr.preload();
          ctx.drawImage(Spr.stairsCanvas, Math.round(sx - 18), Math.round(sy - 24));
        }});
        break;
      case 'shelf':
        // estantería negra con cajones salmón (canon de la cripta)
        this.decor.push({ gx: gx, gy: gy, draw: function (ctx, sx, sy) {
          Spr.draw(ctx, Spr.S.shelf, sx - 8, sy - 18);
        }});
        break;
      case 'skull':
        // cráneo salmón en el suelo
        this.decor.push({ gx: gx, gy: gy, draw: function (ctx, sx, sy) {
          Spr.draw(ctx, Spr.S.skull, sx - 4, sy - 5);
        }});
        break;
      case 'bones':
        // huesos cruzados en el suelo
        this.decor.push({ gx: gx, gy: gy, draw: function (ctx, sx, sy) {
          Spr.draw(ctx, Spr.S.bones, sx - 6, sy - 4);
        }});
        break;
      case 'sconce':
        // aplique de vela sobre el muro (se dibuja tras su muro:
        // el orden pintor estable lo garantiza)
        this.decor.push({ gx: gx, gy: gy, draw: function (ctx, sx, sy, t) {
          var fl = Math.floor(t * 6) % 2 === 0;
          Spr.draw(ctx, Spr.S.sconce, sx - 2, sy - 17);
          if (fl) { ctx.fillStyle = M.PAL[M.C.LORAN]; ctx.fillRect(Math.round(sx + 1), Math.round(sy - 12), 1, 1); }
        }});
        break;
    }
  };

  /* ---------- conversión a pantalla ---------- */
  WorldScene.prototype.toScreen = function (gx, gy) {
    var s = M.Iso.worldToScreen(gx, gy);
    var sh = M.FX.shakeOffset();
    return {
      x: Math.round(s.x + M.TILE_HW - this.cam.x + sh.x),
      y: Math.round(s.y + M.TILE_HH - this.cam.y + sh.y)
    };
  };

  /* ---------- actualización ---------- */
  WorldScene.prototype.update = function (dt, game) {
    this.t += dt;

    // jugador
    this.player.update(dt, this.map, this.control && !M.UI.dialogActive());

    // niña
    if (this.girl) {
      this.girl.update(dt, this.player);
      this.girl.updateVanish(dt);
    }

    // hermana
    if (this.sister) this.sister.update(dt, this.player, this.map);

    // velas: recogida
    for (var i = 0; i < this.candles.length; i++) {
      var c = this.candles[i];
      if (!c.taken && this.control && M.dist(c.gx, c.gy, this.player.gx, this.player.gy) < 0.8) {
        c.taken = true;
        game.state.candles++;
        game.addNexus(5);
        M.Audio.sfx.pickup();
        if (this.onCandle) this.onCandle(game.state.candles);
      }
    }

    // disparadores
    for (var k = 0; k < this.triggers.length; k++) {
      var tr = this.triggers[k];
      if (tr.done && tr.once !== false) continue;
      if (M.dist(tr.x, tr.y, this.player.gx, this.player.gy) < (tr.r || 0.8)) {
        tr.done = true;
        tr.fn();
      }
    }

    // interactuables (pista + acción)
    var near = null;
    for (var j = 0; j < this.interactables.length; j++) {
      var it = this.interactables[j];
      if (it.done && it.once) continue;
      if (M.dist(it.x, it.y, this.player.gx, this.player.gy) < (it.r || 1.1)) { near = it; break; }
    }
    if (near && this.control && !M.UI.dialogActive()) {
      // pista de proximidad: se refresca mientras se está cerca
      // (showHint no reinicia el reloj si el texto no cambia)
      if (near.hint) M.UI.showHint(near.hint, 0.8);
      if (M.Input.hit('fire') || (near.key && M.Input.hit(near.key))) {
        if (near.once) near.done = true;
        near.fn();
      }
    }

    // murciélagos (exteriores)
    if (this.cfg.bats) {
      this.batTimer -= dt;
      if (this.batTimer <= 0) {
        this.batTimer = 4 + Math.random() * 6;
        var dirR = Math.random() > 0.5;
        this.bats.push({
          x: dirR ? -10 : M.SCREEN_W + 10,
          y: 20 + Math.random() * 45,
          vx: (dirR ? 1 : -1) * (26 + Math.random() * 22),
          f: 0
        });
      }
      for (var b = this.bats.length - 1; b >= 0; b--) {
        var bat = this.bats[b];
        bat.x += bat.vx * dt;
        bat.f += dt * 9;
        bat.y += Math.sin(bat.f) * 0.12;
        if (bat.x < -16 || bat.x > M.SCREEN_W + 16) this.bats.splice(b, 1);
      }
    }

    // ratas (interior)
    for (var r = 0; r < this.rats.length; r++) {
      var rat = this.rats[r];
      rat.t += dt * 3;
      var rx = rat.a + (rat.b - rat.a) * (0.5 + 0.5 * Math.sin(rat.t));
      rat.px = rx;
    }

    // cámara
    var target = this.camOverride || this.player;
    var tp = M.Iso.worldToScreen(target.gx, target.gy);
    var tcx = tp.x + M.TILE_HW - M.SCREEN_W / 2;
    var tcy = tp.y + 4 - M.VIEW_H / 2;
    this.cam.x = M.lerp(this.cam.x, tcx, Math.min(1, dt * 3.2));
    this.cam.y = M.lerp(this.cam.y, tcy, Math.min(1, dt * 3.2));
    M.Iso.clampCam(this.map, this.cam, M.SCREEN_W, M.VIEW_H);
  };

  /* ---------- dibujo ---------- */
  WorldScene.prototype.draw = function (ctx, game) {
    var self = this;
    var Iso = M.Iso;

    // cielo
    if (this.cfg.sky) {
      M.FX.drawSky(ctx, this.cfg.sky.horizon, this.t, { moonX: this.cfg.sky.moonX });
      // murciélagos
      var SprB = M.Spr.S;
      for (var b = 0; b < this.bats.length; b++) {
        var bat = this.bats[b];
        M.Spr.draw(ctx, (Math.floor(bat.f) % 2 === 0) ? SprB.bat_a : SprB.bat_b, bat.x, bat.y);
      }
    }

    // suelo
    Iso.forEachVisible(this.map, this.cam, M.SCREEN_W, M.VIEW_H, function (sx, sy, gx, gy, tile) {
      if (tile && tile.floor) Iso.drawFloorTile(ctx, tile.floor, sx, sy, gx, gy);
    });

    // borde perimetral del area caminable (canon: banda morada solida
    // junto a los muros y en el limite del mapa, como el suelo de la
    // camara de arcos de la captura real)
    Iso.forEachVisible(this.map, this.cam, M.SCREEN_W, M.VIEW_H, function (sx, sy, gx, gy, tile) {
      if (tile && tile.floor) {
        var mask = Iso.edgeMask(self.map, gx, gy);
        if (mask) Iso.drawFloorEdge(ctx, sx, sy, mask);
      }
    });

    // cono de visión de la hermana (sobre la oscuridad, bajo el HUD)
    var self2 = this;

    // dibujables ordenados por profundidad
    var items = [];

    Iso.forEachVisible(this.map, this.cam, M.SCREEN_W, M.VIEW_H, function (sx, sy, gx, gy, tile) {
      if (tile && tile.block === 'wall') {
        (function (sx2, sy2, tile2) {
          items.push({ d: gx + gy, fn: function () { Iso.drawWall(ctx, sx2, sy2, (tile2 && tile2.hh) || 13); } });
        })(sx, sy, tile);
      }
    });

    for (var i = 0; i < this.decor.length; i++) {
      var dc = this.decor[i];
      (function (dec) {
        var p = self.toScreen(dec.gx, dec.gy);
        if (p.x < -60 || p.x > M.SCREEN_W + 60 || p.y < -90 || p.y > M.VIEW_H + 50) return;
        items.push({ d: dec.gx + dec.gy, fn: function () { dec.draw(ctx, p.x, p.y, self.t); } });
      })(dc);
    }

    for (var c = 0; c < this.candles.length; c++) {
      (function (cd) {
        if (cd.taken) return;
        items.push({
          d: cd.gx + cd.gy,
          fn: function () {
            var p = self.toScreen(cd.gx, cd.gy);
            cd.draw(ctx, p.x, p.y);
          }
        });
      })(this.candles[c]);
    }

    if (this.girl && this.girl.state !== 'gone' && this.girl.state !== 'hidden') {
      (function (g) {
        items.push({
          d: g.gx + g.gy,
          fn: function () {
            var p = self.toScreen(g.gx, g.gy);
            g.draw(ctx, p.x, p.y, self.t);
          }
        });
      })(this.girl);
    }

    if (this.sister) {
      (function (s) {
        items.push({
          d: s.gx + s.gy,
          fn: function () {
            var p = self.toScreen(s.gx, s.gy);
            s.draw(ctx, p.x, p.y);
          }
        });
      })(this.sister);
    }

    (function (pl) {
      items.push({
        d: pl.gx + pl.gy,
        fn: function () {
          var p = self.toScreen(pl.gx, pl.gy);
          pl.draw(ctx, p.x, p.y);
        }
      });
    })(this.player);

    // el libro del niño cuando está sentado leyendo
    if (this.player.pose === 'sit' && this.cfg.book !== false && M.Game.state.book > 0) {
      (function (pl) {
        items.push({
          d: pl.gx + pl.gy + 0.3,
          fn: function () {
            var p = self.toScreen(pl.gx, pl.gy);
            var bk = (Math.floor(self.t * 1.4) % 2 === 0) ? M.Spr.S.bookA : M.Spr.S.bookB;
            M.Spr.draw(ctx, bk, p.x + 1, p.y - 2);
          }
        });
      })(this.player);
    }

    // ratas
    for (var rt = 0; rt < this.rats.length; rt++) {
      (function (rat) {
        items.push({
          d: rat.px + rat.gy,
          fn: function () {
            var p = self.toScreen(rat.px, rat.gy);
            var sp = (Math.floor(self.t * 10) % 2 === 0) ? M.Spr.S.rat_a : M.Spr.S.rat_b;
            M.Spr.draw(ctx, sp, p.x - 4, p.y - 3, { flip: rat.b < rat.a });
          }
        });
      })(this.rats[rt]);
    }

    items.sort(function (a, b) { return a.d - b.d; });
    for (var q = 0; q < items.length; q++) items[q].fn();

    // oscuridad interior con luces recortadas
    if (this.cfg.darkness > 0) this._drawDarkness(ctx);

    // cono de visión: SIEMPRE visible sobre la oscuridad
    if (this.sister) {
      this.sister.drawCone(ctx, function (gx, gy) { return self2.toScreen(gx, gy); });
      // la llama de su vela brilla sobre la oscuridad
      var fp = self2.toScreen(self2.sister.gx, self2.sister.gy);
      var prof = Math.abs(self2.sister.facing.x) > Math.abs(self2.sister.facing.y);
      var fx = prof ? fp.x - 5 : fp.x + 4;
      var fy = fp.y - (prof ? 15 : 13);
      ctx.fillStyle = M.PAL[M.C.LORAN];
      ctx.fillRect(fx, fy, 2, 2);
      ctx.fillStyle = M.PAL[M.C.ORANG];
      ctx.fillRect(fx, fy + 2, 1, 3);
      if (Math.sin(self2.t * 13) > 0.3) {
        ctx.fillStyle = M.PAL[M.C.WHITE];
        ctx.fillRect(fx, fy, 1, 1);
      }
    }

    // niebla
    if (this.cfg.fog > 0) M.FX.drawFog(ctx, this.t, this.cfg.fog, this.cam.x);

    // estática sutil
    if (this.cfg.static > 0) M.FX.drawStatic(ctx, this.cfg.static);
  };

  WorldScene.prototype._drawDarkness = function (ctx) {
    // el lienzo de oscuridad sigue el tamaño real de la pantalla
    if (!this._darkCanvas ||
        this._darkCanvas.width !== M.SCREEN_W ||
        this._darkCanvas.height !== M.VIEW_H) {
      this._darkCanvas = document.createElement('canvas');
      this._darkCanvas.width = M.SCREEN_W;
      this._darkCanvas.height = M.VIEW_H;
    }
    var dc = this._darkCanvas.getContext('2d');
    dc.globalCompositeOperation = 'source-over';
    dc.clearRect(0, 0, M.SCREEN_W, M.VIEW_H);
    dc.fillStyle = 'rgba(0,0,0,' + this.cfg.darkness + ')';
    dc.fillRect(0, 0, M.SCREEN_W, M.VIEW_H);

    // luces: jugador, velas, hermana, extras de la escena
    var lights = [];
    var pS = this.toScreen(this.player.gx, this.player.gy);
    lights.push({ x: pS.x, y: pS.y - 8, r: this.player.lightR + M.Game.state.candles * 7 });
    for (var i = 0; i < this.candles.length; i++) {
      if (this.candles[i].taken) continue;
      var cS = this.toScreen(this.candles[i].gx, this.candles[i].gy);
      lights.push({ x: cS.x, y: cS.y - 8, r: 17 + Math.sin(this.t * 6 + i) * 2 });
    }
    if (this.sister) {
      var sS = this.toScreen(this.sister.gx, this.sister.gy);
      lights.push({ x: sS.x + 4, y: sS.y - 16, r: this.sister.lightR });
    }
    if (this.extraLights) {
      for (var k = 0; k < this.extraLights.length; k++) {
        var L = this.extraLights[k];
        var lS = this.toScreen(L.gx, L.gy);
        lights.push({ x: lS.x, y: lS.y - 8, r: L.r });
      }
    }

    dc.globalCompositeOperation = 'destination-out';
    for (var j = 0; j < lights.length; j++) {
      var g = dc.createRadialGradient(lights[j].x, lights[j].y, 1, lights[j].x, lights[j].y, lights[j].r);
      g.addColorStop(0, 'rgba(0,0,0,0.95)');
      g.addColorStop(0.6, 'rgba(0,0,0,0.55)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      dc.fillStyle = g;
      dc.beginPath();
      dc.arc(lights[j].x, lights[j].y, lights[j].r, 0, Math.PI * 2);
      dc.fill();
    }
    dc.globalCompositeOperation = 'source-over';
    ctx.drawImage(this._darkCanvas, 0, 0);
  };

  M.WorldScene = WorldScene;
})(window.MISTICAS);
