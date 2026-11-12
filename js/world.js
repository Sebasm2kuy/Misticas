'use strict';
/* ============================================================
   MÍSTICAS — (C) 1987 — world.js
   HABITACIONES FIJAS TIPO DIORAMA (modelo del podcast):
   cada escena es UNA sala isométrica cerrada que flota en el
   vacío negro. Cámara FIJA: la sala completa siempre encuadrada,
   como un diorama.

   ILUMINACIÓN ESTILO NES (canon 1987): NADA de velo negro con
   alpha ni luces radiales recortadas. Cada tesela elige su
   bitmap de un banco de paleta según su distancia DISCRETA a
   las fuentes de luz (vela del niño, velas del suelo, farol de
   la hermana): el bloque contiguo a una llama "salta" al banco
   iluminado (violeta vivo + aristas blancas) igual que el chip
   de la NES cambiaba sus registros de color. La oscuridad no es
   transparencia: es otro banco, violeta casi negro.
   ============================================================ */
(function (M) {

  var E = M.Entities;

  function WorldScene(cfg) {
    this.cfg = cfg;
    this.map = M.Iso.buildMap(cfg.mapDef);
    this.player = new E.Player(cfg.playerStart.x, cfg.playerStart.y);
    this.control = false;
    this.cam = { x: 0, y: 0 };       // FIJA: la sala centrada
    this.triggers = [];
    this.interactables = [];
    this.decor = [];                  // dinámicos (por fotograma)
    this.candles = [];
    this.bats = [];
    this.rats = [];
    this.marks = {};
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
    this._bakeRoom();
  }

  /* ---------- horneado de la sala ----------
     La BASE (cimiento + zócalo pedestal) se pre-renderiza una
     sola vez con la paleta AMBIENTAL de la sala. Los suelos y
     muros viven como bitmaps por nivel de luz que el bucle
     compone cada fotograma (modelo nametable+banco de paleta):
     200 drawImage exactos, 60 fps de cartucho. */
  WorldScene.prototype._bakeRoom = function () {
    var self = this;
    var ambient = this.cfg.darkness > 0 ? 1 : 2;
    var res = M.Iso.renderRoomBase(this.map, ambient);
    this._room = res.canvas;
    this._frame = res.frame;

    // cámara FIJA: la sala centrada en el lienzo lógico
    this.cam.x = res.frame.x + res.frame.w / 2 + M.TILE_HW - M.SCREEN_W / 2;
    this.cam.y = res.frame.y + res.frame.h / 2 + M.TILE_HH - M.VIEW_H / 2;
    this._blitX = Math.round(M.SCREEN_W / 2 - res.frame.w / 2);
    this._blitY = Math.round(M.VIEW_H / 2 - res.frame.h / 2);

    // horizonte del cielo: apenas sobre los muros del diorama
    this._skyHorizon = this._blitY + Math.min(46, res.frame.maxHH + 14);

    // teselas → items de pintor (fn elige banco de luz al vuelo)
    var tiles = M.Iso.roomTiles(this.map);
    this._tileItems = tiles.map(function (tile) {
      return {
        d: tile.d,
        fn: function (ctx, self2) {
          var p = self2.toScreen(tile.gx, tile.gy);
          var lv = self2._tileLevel(tile.gx, tile.gy);
          var bm;
          if (tile.kind === 'floor') {
            bm = M.Iso.bakeFloor(tile.floor, lv, tile.mask, tile.variant);
            ctx.drawImage(bm, p.x - M.TILE_HW, p.y - M.TILE_HH);
            self2._dabFloor(ctx, tile, p, lv);
          } else {
            bm = M.Iso.bakeWall(tile.hh, tile.family, lv, tile.variant);
            ctx.drawImage(bm, p.x - M.TILE_HW, p.y - M.TILE_HH - tile.hh);
          }
        }
      };
    });

    // lista final de pintor: teselas primero (a igualdad de d,
    // el decor se apoya SIEMPRE sobre su propia tesela)
    this._items = this._tileItems.concat(this._decorItems || []);
  };

  /* ---------- nivel de luz por tesela ----------
     Distancia discreta a las fuentes: el margen decide el banco
     (3 = TORCIDO POR LA LUZ, 2 = normal, 1 = penumbra, 0 = casi
     negro). El parpadeo de la vela conmuta el radio en saltos
     enteros a 7 Hz — fotograma a fotograma, como el hardware. */
  WorldScene.prototype._tileLevel = function (gx, gy) {
    if (!this.cfg.darkness) return 2;
    var cx = gx + 0.5, cy = gy + 0.5;
    var flick = (Math.floor(this.t * 7) % 2 === 0) ? 0.3 : 0;
    var m = -99, i, L, d, r;

    L = this.player;
    d = M.dist(cx, cy, L.gx, L.gy);
    r = 2.7 + M.Game.state.candles * 0.5;
    if (r - d > m) m = r - d;

    for (i = 0; i < this.candles.length; i++) {
      if (this.candles[i].taken) continue;
      L = this.candles[i];
      d = M.dist(cx, cy, L.gx, L.gy);
      r = 2.3 + flick;
      if (r - d > m) m = r - d;
    }

    if (this.sister) {
      L = this.sister;
      d = M.dist(cx, cy, L.gx, L.gy);
      r = 2.6;
      if (r - d > m) m = r - d;
    }

    if (this.extraLights) {
      for (i = 0; i < this.extraLights.length; i++) {
        L = this.extraLights[i];
        d = M.dist(cx, cy, L.gx, L.gy);
        r = L.r > 8 ? L.r / 12 : L.r;   // píxeles→teselas (compat)
        if (r - d > m) m = r - d;
      }
    }

    if (m > 1.7) return 3;
    if (m > 0) return 2;
    if (m > -2.0) return 1;
    return 0;
  };

  // color de paleta ya sustituido al banco de luz del nivel
  WorldScene.prototype._pc = function (lv, ci) {
    return M.PAL[M.PALSWAP[lv][ci]];
  };

  /* Detalles de suelo por fotograma (matas, hoyos, guijarros,
     chispas): píxeles sólidos 1x1/2x1 con el color YA cambiado
     de banco — deterministas por hash de posición. */
  WorldScene.prototype._dabFloor = function (ctx, tile, p, lv) {
    var type = tile.floor;
    if (type === 'carpet') {
      if ((tile.gx * 3 + tile.gy * 5) % 7 === 0) {
        ctx.fillStyle = this._pc(lv, M.C.LMAG);
        ctx.fillRect(p.x - 2, p.y - 1, 4, 1);
      }
      return;
    }
    var hv = M.hash(tile.gx, tile.gy);
    var ox = p.x - 4, oy = p.y - 2;    // origen del área de detalle
    function dab(self, ci, w, h, hx, hy) {
      ctx.fillStyle = self._pc(lv, ci);
      ctx.fillRect(ox + Math.floor(M.hash(hx, hy) * 8),
                   oy + Math.floor(M.hash(hy, hx) * 4), w, h);
    }
    var self = this;
    if (type === 'grass') {
      if (hv > 0.40 && hv < 0.58) dab(self, M.C.DARK, 1, 2, tile.gx, tile.gy);
      if (hv > 0.58 && hv < 0.72) dab(self, M.C.DARK, 2, 1, tile.gx + 3, tile.gy + 5);
      if (hv < 0.10) dab(self, M.C.BLACK, 2, 1, tile.gy, tile.gx);
      if (hv > 0.93 && hv < 0.97) dab(self, M.C.DPURP, 1, 1, tile.gx + 1, tile.gy + 2);
    } else if (type === 'path') {
      if (hv < 0.25) dab(self, M.C.VDARK, 2, 2, tile.gx, tile.gy);
      if (hv > 0.55 && hv < 0.78) dab(self, M.C.BONE2, 1, 1, tile.gx, tile.gy);
      if (hv > 0.86) dab(self, M.C.BONE2, 1, 1, tile.gx + 5, tile.gy + 1);
    } else if (type === 'dirt') {
      if (hv > 0.45 && hv < 0.62) {
        dab(self, M.C.DARK, 2, 1, tile.gx, tile.gy);
        dab(self, M.C.BLACK, 1, 1, tile.gy, tile.gx);
      }
      if (hv < 0.09) dab(self, M.C.BLACK, 2, 1, tile.gx, tile.gy);
      if (hv > 0.80 && hv < 0.90) dab(self, M.C.BONE2, 1, 1, tile.gx, tile.gy);
    } else if (type === 'stone') {
      if (hv > 0.50 && hv < 0.66) dab(self, M.C.BLACK, 1, 1, tile.gx, tile.gy);
      if (hv > 0.86 && hv < 0.93) dab(self, M.C.BONE2, 1, 1, tile.gx, tile.gy);
    }
    // chispa lunar en la losa afortunada (arista salmón)
    if (hv > 0.95 || (type === 'checker' && hv > 0.96)) {
      ctx.fillStyle = this._pc(lv, M.C.LMAG);
      ctx.fillRect(p.x - 3, p.y - 3, 4, 1);
      ctx.fillRect(p.x - 6, p.y - 2, 3, 1);
    }
  };

  WorldScene.prototype._buildDecor = function () {
    var self = this;
    var Spr = M.Spr;
    Spr.preload();
    this._decorItems = [];

    // T: el gran árbol (2x2 sólidas)
    if (this.marks['T'] && this.marks['T'].length) {
      var a = this.marks['T'][0];
      for (var dy = 0; dy < 2; dy++) {
        for (var dx = 0; dx < 2; dx++) {
          var t = M.Iso.tileAt(self.map, a.x + dx, a.y + dy);
          if (t) t.solid = true;
        }
      }
      this._decorItems.push({
        d: a.x + a.y + 1,
        fn: function (ctx, self2, t2) {
          var p = self2.toScreen(a.x + 0.5, a.y + 0.5);
          var tr = Spr.bigTree;
          ctx.drawImage(tr.canvas, Math.round(p.x - tr.ox), Math.round(p.y - tr.oy + 6));
          // frutos magenta que parpadean
          for (var i = 0; i < tr.tips.length; i++) {
            var tp = tr.tips[i];
            if (Math.sin(t2 * (1.3 + i * 0.4) + i * 2) > 0.35) {
              ctx.fillStyle = M.PAL[M.C.MAG];
              ctx.fillRect(Math.round(p.x - tr.ox + tp.x), Math.round(p.y - tr.oy + 6 + tp.y), 1, 1);
            }
          }
        }
      });
    }

    // L: lápida con la inscripción latina
    if (this.marks['L']) {
      this.marks['L'].forEach(function (mk) {
        self._decorItems.push({ d: mk.x + mk.y, fn: function (ctx, self2) {
          var p = self2.toScreen(mk.x, mk.y);
          Spr.draw(ctx, Spr.S.tomb2, p.x - 6, p.y - 10);
        }});
        M.Iso.tileAt(self.map, mk.x, mk.y).solid = true;
      });
    }

    // t: árboles muertos
    if (this.marks['t']) {
      this.marks['t'].forEach(function (mk, i) {
        var img = Spr.deadTrees[i % Spr.deadTrees.length];
        self._decorItems.push({ d: mk.x + mk.y, fn: function (ctx, self2) {
          var p = self2.toScreen(mk.x, mk.y);
          ctx.drawImage(img, Math.round(p.x - img.width / 2), Math.round(p.y - img.height + 5));
        }});
        M.Iso.tileAt(self.map, mk.x, mk.y).solid = true;
      });
    }

    // decorados definidos por leyenda (tumbas, valla, ventana, puerta...)
    var seen = {};
    for (var gy = 0; gy < this.map.h; gy++) {
      for (var gx = 0; gx < this.map.w; gx++) {
        var tile = this.map.cells[gy][gx];
        if (!tile.deco || seen[gx + ',' + gy]) continue;
        seen[gx + ',' + gy] = true;
        this._addDeco(tile.deco, gx, gy);
      }
    }

    // orden pintor del decor (estable: a igual d, tras su tesela)
    this._decorItems.sort(function (a, b) { return a.d - b.d; });
  };

  WorldScene.prototype._addDeco = function (name, gx, gy) {
    var Spr = M.Spr, self = this;
    function push(d, fn) { self._decorItems.push({ d: d, fn: fn }); }

    switch (name) {
      // tumbas y valla: sprites que siguen el banco de luz de su tesela
      case 'tomb1':
      case 'tomb2':
      case 'tomb3':
      case 'fence': {
        var sp = { tomb1: Spr.S.tomb1, tomb2: Spr.S.tomb2, tomb3: Spr.S.tomb3, fence: Spr.S.fence }[name];
        push(gx + gy, function (ctx, self2) {
          var p = self2.toScreen(gx, gy);
          Spr.draw(ctx, sp, p.x - sp.w / 2 + 1, p.y - sp.h + 4, {
            remap: M.remapFor(self2._tileLevel(gx, gy))
          });
        });
        break;
      }
      case 'window':
        push(gx + gy, function (ctx, self2, t) {
          var p = self2.toScreen(gx, gy);
          var lit = self2.cfg.windowLit && Math.sin(t * 2.3) > -0.4;
          var rm = M.remapFor(self2._tileLevel(gx, gy));
          if (lit) {
            var rm2 = {};
            for (var k in rm) rm2[k] = rm[k];
            rm2['0'] = 'A';   // el marco se enciende a naranja vela
            rm = rm2;
          }
          Spr.draw(ctx, Spr.S.window, p.x - 8, p.y - 15, { remap: rm });
        });
        break;
      // puerta maciza montada en el muro: SIEMPRE tras su muro
      // (d+0.5) y con el banco de luz de la sala
      case 'door':
        push(gx + gy + 0.5, function (ctx, self2) {
          var p = self2.toScreen(gx, gy);
          ctx.drawImage(Spr.canvasFor('door', self2._tileLevel(gx, gy)),
            Math.round(p.x - 10), Math.round(p.y - 26));
        });
        break;
      // portón de paso entre habitaciones
      case 'gate':
        push(gx + gy + 0.5, function (ctx, self2) {
          var p = self2.toScreen(gx, gy);
          ctx.drawImage(Spr.canvasFor('gate', self2._tileLevel(gx, gy)),
            Math.round(p.x - 13), Math.round(p.y - 30));
        });
        break;
      case 'column':
        push(gx + gy, function (ctx, self2) {
          var p = self2.toScreen(gx, gy);
          Spr.draw(ctx, Spr.S.column, p.x - 6, p.y - 22, {
            remap: M.remapFor(self2._tileLevel(gx, gy))
          });
        });
        break;
      case 'arch':
        push(gx + gy, function (ctx, self2) {
          var p = self2.toScreen(gx, gy);
          ctx.drawImage(Spr.canvasFor('arch', self2._tileLevel(gx, gy)),
            Math.round(p.x - 12), Math.round(p.y - 30));
        });
        break;
      case 'stairs':
        push(gx + gy, function (ctx, self2) {
          var p = self2.toScreen(gx, gy);
          ctx.drawImage(Spr.canvasFor('stairs', self2._tileLevel(gx, gy)),
            Math.round(p.x - 18), Math.round(p.y - 24));
        });
        break;
      case 'shelf':
        push(gx + gy, function (ctx, self2) {
          var p = self2.toScreen(gx, gy);
          Spr.draw(ctx, Spr.S.shelf, p.x - 8, p.y - 18, {
            remap: M.remapFor(self2._tileLevel(gx, gy))
          });
        });
        break;
      case 'chair':
        push(gx + gy, function (ctx, self2) {
          var p = self2.toScreen(gx, gy);
          Spr.draw(ctx, Spr.S.chair, p.x - 7, p.y - 17, {
            remap: M.remapFor(self2._tileLevel(gx, gy))
          });
        });
        M.Iso.tileAt(this.map, gx, gy).solid = true;
        break;
      // cráneo y huesos: planos sobre el suelo, siguen la luz
      case 'skull':
        push(gx + gy, function (ctx, self2) {
          var p = self2.toScreen(gx, gy);
          Spr.draw(ctx, Spr.S.skull, p.x - 4, p.y - 5, {
            remap: M.remapFor(self2._tileLevel(gx, gy))
          });
        });
        break;
      case 'bones':
        push(gx + gy, function (ctx, self2) {
          var p = self2.toScreen(gx, gy);
          Spr.draw(ctx, Spr.S.bones, p.x - 6, p.y - 4, {
            remap: M.remapFor(self2._tileLevel(gx, gy))
          });
        });
        break;
      case 'sconce':
        // aplique de vela sobre el muro: llama VIOLETA-AZUL del canon
        // ("purple/blue flame tip"), cera salmón, nunca un glow radial
        push(gx + gy + 0.3, function (ctx, self2, t) {
          var p = self2.toScreen(gx, gy);
          var fl = Math.floor(t * 6) % 2 === 0;
          Spr.draw(ctx, Spr.S.sconce, p.x - 2, p.y - 17, {
            remap: M.remapFor(self2._tileLevel(gx, gy))
          });
          if (fl) {
            ctx.fillStyle = M.PAL[M.C.LPURP];
            ctx.fillRect(Math.round(p.x + 1), Math.round(p.y - 12), 1, 1);
          }
        });
        break;
    }
  };

  /* ---------- conversión a pantalla (cámara fija) ---------- */
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
          y: 14 + Math.random() * (this._skyHorizon - 14),
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
    // cámara: FIJA — nada que recalcular
  };

  /* ---------- dibujo ---------- */
  WorldScene.prototype.draw = function (ctx, game) {
    var self = this;

    // cielo nocturno detrás del diorama (solo exteriores)
    if (this.cfg.sky) {
      M.FX.drawSky(ctx, this._skyHorizon, this.t, { moonX: this.cfg.sky.moonX });
      var SprB = M.Spr.S;
      for (var b = 0; b < this.bats.length; b++) {
        var bat = this.bats[b];
        M.Spr.draw(ctx, (Math.floor(bat.f) % 2 === 0) ? SprB.bat_a : SprB.bat_b, bat.x, bat.y);
      }
    }

    // LA SALA: base horneada (cimiento + zócalo) en una copia
    var sh = M.FX.shakeOffset();
    ctx.drawImage(this._room, Math.round(this._blitX + sh.x), Math.round(this._blitY + sh.y));

    // teselas (bitmaps por banco de luz) + decor + entidades
    // vivas, todo en orden pintor
    var items = this._items.slice();

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
    for (var q = 0; q < items.length; q++) items[q].fn(ctx, this, this.t);

    // cono de visión: SIEMPRE visible, tramado estilo NES
    if (this.sister) {
      this.sister.drawCone(ctx, function (gx, gy) { return self.toScreen(gx, gy); });
      var fp = self.toScreen(self.sister.gx, self.sister.gy);
      var prof = Math.abs(self.sister.facing.x) > Math.abs(self.sister.facing.y);
      var fx = prof ? fp.x - 5 : fp.x + 4;
      var fy = fp.y - (prof ? 15 : 13);
      ctx.fillStyle = M.PAL[M.C.LORAN];
      ctx.fillRect(fx, fy, 2, 2);
      ctx.fillStyle = M.PAL[M.C.ORANG];
      ctx.fillRect(fx, fy + 2, 1, 3);
      if (Math.sin(self.t * 13) > 0.3) {
        ctx.fillStyle = M.PAL[M.C.WHITE];
        ctx.fillRect(fx, fy, 1, 1);
      }
    }

    // niebla (puntos sólidos en trama)
    if (this.cfg.fog > 0) M.FX.drawFog(ctx, this.t, this.cfg.fog, 0);

    // estática sutil
    if (this.cfg.static > 0) M.FX.drawStatic(ctx, this.cfg.static);
  };

  M.WorldScene = WorldScene;
})(window.MISTICAS);
