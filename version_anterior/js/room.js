'use strict';
/* ============================================================
   MÍSTICAS — (C) 1987 — js/room.js
   LOS DIORAMAS: habitaciones CERRADAS y estáticas.

   Cada sala es un recinto amurallado de ladrillo con arcos
   góticos apuntados (sillares violetas + clave magenta), suelo
   de lajas de piedra oscura (NUNCA damero), alfombra carmesí y
   pedestal de primer plano. El fondo se PRE-HORNEA a un lienzo
   por banco de fundido; cada fotograma solo se dibujan:
     1) el fondo,
     2) las teselas cuyo nivel de luz difiere del ambiente
        (sustitución de registro de paleta: la vela "enciende"
        los bloques contiguos convirtiéndolos en violeta vivo /
        magenta / blanco — SIN alpha),
     3) los sprites ordenados por profundidad.
   ============================================================ */
(function (M) {

  var TILE = 8;

  function Room(def) {
    this.def = def;
    this.id = def.id;
    this.ambient = (def.ambient === undefined) ? 1 : def.ambient;
    this.wallH = def.wallH || 8;
    this.floorType = def.floor || 'slab';

    // rejilla de nombres de tesela + máscara de vanos tallados
    this.grid = [];
    this.solidGrid = [];
    this.voidMask = [];
    var x, y;
    for (y = 0; y < M.ROOM_H; y++) {
      this.grid.push(new Array(M.ROOM_W));
      this.solidGrid.push(new Array(M.ROOM_W));
      this.voidMask.push(new Array(M.ROOM_W));
      for (x = 0; x < M.ROOM_W; x++) this.voidMask[y][x] = false;
    }

    this._buildGrid();
    this._markSolids(def);

    // props (objetos con sprite, ordenados por profundidad)
    this.props = (def.props || []).slice();
    this.wallProps = [];     // apliques: van tras el muro
    this.floorProps = [];    // lápidas, columnas...: orden por Y
    for (var i = 0; i < this.props.length; i++) {
      var p = this.props[i];
      if (p.kind === 'SCONCE') this.wallProps.push(p);
      else this.floorProps.push(p);
    }

    // vanos góticos: arco de sillares + portón/ventana (sprites
    // procedurales horneados con la geometría equilátera)
    this.gateProps = [];
    var geos = this._geoms || [];
    for (var gi = 0; gi < geos.length; gi++) {
      var gg = geos[gi].gate, GG = geos[gi].geom;
      if (gg.kind === 'window') {
        this.gateProps.push({ kind: 'GOARCHW', G: GG });
        this.gateProps.push({ kind: 'WINDOWSPR', G: GG });
      } else {
        this.gateProps.push({ kind: 'GOARCH', G: GG });
        if (gg.kind === 'gate') this.gateProps.push({ kind: 'IRONGATE', G: GG });
      }
    }

    // luces estáticas (apliques, ventanas encendidas)
    this.staticLights = (def.lights || []).slice();

    // hornea el fondo en los 5 bancos de fundido
    this.bgBanks = [];
    for (var f = 0; f < M.FADESWAP.length; f++) {
      this.bgBanks.push(this._bake(f));
    }
  }

  /* ---------- construcción de la rejilla ---------- */

  Room.prototype._buildGrid = function () {
    var def = this.def;
    var wallH = this.wallH;
    var x, y;

    // muro trasero: metatiles de ladrillo con variación por hash
    for (y = 0; y < wallH; y++) {
      for (x = 0; x < M.ROOM_W; x++) {
        var mx = x >> 1, my = y >> 1;
        var r = M.hash(mx, my + (def.seed || 0));
        var fam = (y < 2) ? 'D' : (r < 0.14 ? 'D' : (r < 0.34 ? 'B' : 'A'));
        var q = ((y & 1) << 1) | (x & 1); // 0 TL, 1 TR, 2 BL, 3 BR
        this.grid[y][x] = 'BRK_' + fam + '_' + ['TL', 'TR', 'BL', 'BR'][q];
      }
    }

    // columnas laterales del recinto (mismo ladrillo hasta el suelo)
    for (y = wallH; y < M.ROOM_H - 1; y++) {
      for (x = 0; x < 2; x++) {
        var q2 = ((y & 1) << 1) | (x & 1);
        this.grid[y][x] = 'BRK_A_' + ['TL', 'TR', 'BL', 'BR'][q2];
        var xr = M.ROOM_W - 1 - x;
        this.grid[y][xr] = 'BRK_A_' + ['TL', 'TR', 'BL', 'BR'][q2];
      }
    }

    // zócalo: última fila del muro y pie de las columnas
    for (x = 0; x < M.ROOM_W; x++) {
      this.grid[wallH - 1][x] = 'BASE';
    }
    for (x = 0; x < 2; x++) {
      this.grid[M.ROOM_H - 2][x] = 'BASE';
      this.grid[M.ROOM_H - 2][M.ROOM_W - 1 - x] = 'BASE';
    }

    // suelo interior (lajas / hierba / tierra) — lajas IGUALES
    // repetidas: juntas finas púrpura sobre negro, jamás damero
    for (y = wallH; y < M.ROOM_H - 1; y++) {
      for (x = 2; x < M.ROOM_W - 2; x++) {
        this.grid[y][x] = this._floorTile(x, y);
      }
    }

    // caminos de losas
    var paths = def.paths || [];
    for (var p = 0; p < paths.length; p++) {
      var z = paths[p];
      for (y = z.y0; y <= z.y1 && y < M.ROOM_H - 1; y++) {
        for (x = z.x0; x <= z.x1 && x < M.ROOM_W; x++) {
          var q3 = ((y & 1) << 1) | (x & 1);
          this.grid[y][x] = 'PA_' + ['TL', 'T', 'L', 'M'][q3];
        }
      }
    }

    // alfombra carmesí
    var c = def.carpet;
    if (c) {
      for (y = c.y0; y <= c.y1 && y < M.ROOM_H - 1; y++) {
        for (x = c.x0; x <= c.x1 && x < M.ROOM_W; x++) {
          var q4 = ((y & 1) << 1) | (x & 1);
          this.grid[y][x] = 'CA_' + ['TL', 'T', 'L', 'M'][q4];
        }
      }
    }

    // pedestal de primer plano (borde inferior del diorama)
    for (x = 0; x < M.ROOM_W; x++) {
      this.grid[M.ROOM_H - 1][x] = 'LEDGE';
    }

    // aberturas: portones, puertas y ventanas góticas
    var gates = def.gates || [];
    for (var g = 0; g < gates.length; g++) {
      this._carveGate(gates[g]);
    }
  };

  Room.prototype._floorTile = function (x, y) {
    var r = M.hash(x * 7 + 3, y * 13 + 1);
    if (this.floorType === 'grass') {
      return r < 0.55 ? 'GR_A' : (r < 0.8 ? 'GR_B' : 'GR_C');
    }
    if (this.floorType === 'dirt') {
      return r < 0.6 ? 'DI_A' : 'DI_B';
    }
    // lajas de piedra
    var q = ((y & 1) << 1) | (x & 1);
    var name = ['FL_TL', 'FL_T', 'FL_L', 'FL_M'][q];
    if (q === 3 && r < 0.3) name = 'FL_M2';
    return name;
  };

  /* ---------- geometría de los vanos góticos ----------
     Ogiva EQUILÁTERA: dos arcos de circunferencia de radio
     R = 2*halfOpen que se cruzan en el ápice. El vano de un
     portón de 5 teselas mide 32 px de luz. */
  Room.prototype._gateGeom = function (g) {
    var halfOpen = (g.w || 5) * TILE / 2 - 4;
    var R = 2 * halfOpen;
    var springY = (this.wallH - 1) * TILE;
    var rise = Math.round(Math.sqrt(R * R - (R - halfOpen) * (R - halfOpen)));
    var cx = g.tx * TILE + TILE / 2;
    return {
      cx: cx, halfOpen: halfOpen, R: R, springY: springY, rise: rise,
      archY: function (d) {
        if (d >= halfOpen) return springY;
        var dx = (R - halfOpen) + d;
        return Math.round(springY - Math.sqrt(Math.max(0, R * R - dx * dx)));
      }
    };
  };

  /* Registra la geometría del vano y marca su máscara: las
     teselas TOTALMENTE interiores pasan a VOID (negro puro) y
     las PARCIALMENTE talladas se enmascaran para que la capa
     de luz jamás repinte ladrillo sobre la ogiva */
  Room.prototype._carveGate = function (g) {
    var G = this._gateGeom(g);
    this._geoms = this._geoms || [];
    this._geoms.push({ gate: g, geom: G });

    var self = this;
    function inVoid(px, py) {
      var d = Math.abs(px - G.cx);
      if (d >= G.halfOpen - 0.5) return false;
      if (py > G.springY) return false;
      return py >= G.archY(d);
    }

    for (var ty = 0; ty < this.wallH - 1; ty++) {
      for (var tx = 0; tx < M.ROOM_W; tx++) {
        var x0 = tx * TILE, y0 = ty * TILE;
        var pts = [
          [x0, y0], [x0 + 8, y0], [x0, y0 + 8], [x0 + 8, y0 + 8],
          [x0 + 4, y0 + 4], [x0, y0 + 4], [x0 + 8, y0 + 4],
          [x0 + 4, y0], [x0 + 4, y0 + 8]
        ];
        var inside = 0;
        for (var i = 0; i < pts.length; i++) {
          if (inVoid(pts[i][0] + 0.01, pts[i][1] + 0.01)) inside++;
        }
        if (inside === pts.length) {
          this.grid[ty][tx] = 'VOID';
          this.voidMask[ty][tx] = true;
        } else if (inside > 0) {
          this.voidMask[ty][tx] = true;
        }
      }
    }
  };

  /* ---------- colisiones ---------- */

  Room.prototype._markSolids = function (def) {
    var wallH = this.wallH;
    for (var y = 0; y < M.ROOM_H; y++) {
      for (var x = 0; x < M.ROOM_W; x++) {
        this.solidGrid[y][x] = (x < 2 || x >= M.ROOM_W - 2 ||
          y < wallH || y >= M.ROOM_H - 1);
      }
    }
    var props = def.props || [];
    for (var i = 0; i < props.length; i++) {
      var p = props[i];
      if (!p.solid) continue;
      var size = p.size || 1;
      for (var dy = 0; dy < size; dy++) {
        for (var dx = 0; dx < size; dx++) {
          var tx = p.tx + dx, ty = p.ty + dy;
          if (ty >= 0 && ty < M.ROOM_H && tx >= 0 && tx < M.ROOM_W) {
            this.solidGrid[ty][tx] = true;
          }
        }
      }
    }
  };

  Room.prototype.solid = function (tx, ty) {
    if (tx < 0 || ty < 0 || tx >= M.ROOM_W || ty >= M.ROOM_H) return true;
    return !!this.solidGrid[ty][tx];
  };

  Room.prototype.solidAtPx = function (px, py) {
    return this.solid(Math.floor(px / TILE), Math.floor(py / TILE));
  };

  // caja (centro en teselas, semiancho/alto) contra la rejilla
  Room.prototype.collidesBox = function (cx, cy, hw, hh) {
    return this.solidAtPx((cx - hw) * TILE, (cy - hh) * TILE) ||
      this.solidAtPx((cx + hw) * TILE, (cy - hh) * TILE) ||
      this.solidAtPx((cx - hw) * TILE, (cy + hh) * TILE) ||
      this.solidAtPx((cx + hw) * TILE, (cy + hh) * TILE);
  };

  /* ---------- horneado del fondo ---------- */

  Room.prototype._bake = function (fade) {
    var cv = document.createElement('canvas');
    cv.width = M.SCREEN_W; cv.height = M.VIEW_H;
    var ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    var sw = M.FADESWAP[fade];
    var PAL = function (ci) { return M.PAL_MASTER[sw[ci]]; };

    // 1) teselas del recinto
    for (var y = 0; y < M.ROOM_H; y++) {
      for (var x = 0; x < M.ROOM_W; x++) {
        M.Tiles.draw(ctx, this.grid[y][x], x * TILE, y * TILE, this.ambient, fade);
      }
    }

    // 2) talla los vanos a nivel de PÍXEL siguiendo la ogiva:
    // negro del vano; en los pasos abiertos, cielo + estrellas
    // + luna (todo horneado con el banco de fundido)
    var gates = this.def.gates || [];
    for (var g = 0; g < gates.length; g++) {
      var gt = gates[g];
      var G = this._gateGeom(gt);
      var px;
      for (px = Math.round(G.cx - G.halfOpen) + 1; px < G.cx + G.halfOpen; px++) {
        var d = Math.abs(px + 0.5 - G.cx);
        var ay = G.archY(d);
        ctx.fillStyle = PAL(M.C.BLACK);
        ctx.fillRect(px, ay, 1, G.springY - ay);
      }
      if (gt.kind === 'arch') {
        // estrellas deterministas dentro del vano
        for (var s = 0; s < 12; s++) {
          var h = M.hash(gt.tx * 31 + s, s * 17 + (gt.w || 5));
          var sx = Math.round(G.cx - G.halfOpen + 2 + h * (G.halfOpen * 2 - 4));
          var sy = G.springY - G.rise + 3 + Math.floor(M.hash(s, gt.tx) * (G.rise - 6));
          var dd = Math.abs(sx - G.cx);
          if (sy > G.archY(dd) + 2 && h > 0.2) {
            ctx.fillStyle = PAL(h > 0.85 ? M.C.WHITE : M.C.GRAY);
            ctx.fillRect(sx, sy, 1, 1);
          }
        }
        // la luna asomando por el paso
        if (gt.moon) {
          M.Spr.drawMoon(ctx, G.cx, G.springY - Math.round(G.rise * 0.45), 8, PAL);
        }
      }
    }

    // 3) filete interior de las columnas laterales
    ctx.fillStyle = PAL(M.C.PURPLE);
    ctx.fillRect(2 * TILE - 1, this.wallH * TILE - 6, 1, (M.ROOM_H - 2 - this.wallH) * TILE + 4);
    ctx.fillRect(M.SCREEN_W - 2 * TILE, this.wallH * TILE - 6, 1, (M.ROOM_H - 2 - this.wallH) * TILE + 4);

    return cv;
  };

  /* ============================================================
     MAPA DE LUZ: nivel por tesela (0 sombra / 1 normal / 2 luz)
     Cada luz "enciende" los bloques contiguos sustituyendo su
     banco de paleta. Parpadeo cuantizado por pasos, nunca alpha.
     ============================================================ */

  Room.prototype.computeLights = function (time, dynLights, lightning) {
    var lv = this._lightBuf && this._lightBuf.length === M.ROOM_H
      ? this._lightBuf : (this._lightBuf = []);
    var amb = this.ambient;
    var x, y, i;

    for (y = 0; y < M.ROOM_H; y++) {
      if (!lv[y]) lv.push(new Array(M.ROOM_W));
      for (x = 0; x < M.ROOM_W; x++) lv[y][x] = amb;
    }

    var all = this.staticLights.concat(dynLights || []);
    for (i = 0; i < all.length; i++) {
      var L = all[i];
      // parpadeo cuantizado: el radio salta a pasos discretos
      var fl = [1, 0.92, 1.07, 1][Math.floor(time * 7 + i * 1.7) % 4];
      var r = (L.r || 26) * fl;
      var R = Math.ceil(r / TILE) + 1;
      var tx0 = Math.max(0, Math.floor(L.px / TILE) - R);
      var tx1 = Math.min(M.ROOM_W - 1, Math.floor(L.px / TILE) + R);
      var ty0 = Math.max(0, Math.floor(L.py / TILE) - R);
      var ty1 = Math.min(M.ROOM_H - 1, Math.floor(L.py / TILE) + R);
      for (y = ty0; y <= ty1; y++) {
        for (x = tx0; x <= tx1; x++) {
          var cx = x * TILE + 4, cy = y * TILE + 4;
          var d = Math.sqrt((cx - L.px) * (cx - L.px) + (cy - L.py) * (cy - L.py));
          // pozos de luz a BLOQUES: núcleo grande y contundente
          if (d < r * 0.55) lv[y][x] = 2;
          else if (d < r) lv[y][x] = Math.max(lv[y][x], 1);
        }
      }
    }

    // relámpago: TODA la pantalla salta al banco de luz
    if (lightning) {
      for (y = 0; y < M.ROOM_H; y++) {
        for (x = 0; x < M.ROOM_W; x++) lv[y][x] = 2;
      }
    }
    return lv;
  };

  /* ---------- render del diorama ---------- */
  /* world aporta: time, fade, dynLights, lightning; los
     drawables (objetos + criaturas) llegan ya construidos */

  Room.prototype.draw = function (ctx, world, drawables) {
    var fade = world.fade;
    var amb = this.ambient;

    // 1) fondo pre-horneado (la luna y las estrellas de los
    //    pasos abiertos ya viven dentro del fondo)
    ctx.drawImage(this.bgBanks[fade], 0, 0);

    // 2) teselas con nivel de luz distinto del ambiente
    //    (las talladas por una ogiva se saltan: ya están horneadas)
    var lv = this.computeLights(world.time, world.dynLights, world.lightning);
    for (var y = 0; y < M.ROOM_H; y++) {
      for (var x = 0; x < M.ROOM_W; x++) {
        if (this.voidMask[y][x]) continue;
        var l = lv[y][x];
        if (l === amb) continue;
        M.Tiles.draw(ctx, this.grid[y][x], x * TILE, y * TILE, l, fade);
      }
    }

    // 3) vanos góticos: arco de sillares, portón de hierro y
    //    ventana encendida (todos tras la capa de luz)
    for (var gp = 0; gp < this.gateProps.length; gp++) {
      var P = this.gateProps[gp];
      var G = P.G;
      if (P.kind === 'GOARCH') {
        M.Spr.draw(ctx, 'GOARCH', G.cx - 19, G.springY - 34, { fade: fade });
      } else if (P.kind === 'GOARCHW') {
        M.Spr.draw(ctx, 'GOARCHW', G.cx - 11, G.springY - 20, { fade: fade });
      } else if (P.kind === 'IRONGATE') {
        M.Spr.draw(ctx, 'IRONGATE', G.cx - 15, G.springY - 31, { fade: fade });
      } else if (P.kind === 'WINDOWSPR') {
        var wfr = (Math.floor(world.time * 5) % 2) ? 'WINDOW_LIT_1' : 'WINDOW_LIT_0';
        M.Spr.draw(ctx, wfr, G.cx - 6, G.springY - 16, { fade: fade });
      }
    }

    // 4) apliques de muro con su llama
    for (var i = 0; i < this.wallProps.length; i++) {
      var wp = this.wallProps[i];
      if (wp.kind === 'SCONCE') {
        M.Spr.draw(ctx, 'SCONCE', wp.tx * TILE, wp.ty * TILE - 12, { fade: fade });
        M.Spr.drawFlame(ctx, wp.tx * TILE + 2, wp.ty * TILE - 18, world.time, fade);
      }
    }

    // 4) objetos y criaturas ordenados por profundidad (pie)
    var dr = (drawables || []).slice();
    dr.sort(function (a, b) { return a.baseY - b.baseY; });
    for (var d = 0; d < dr.length; d++) dr[d].draw(ctx, fade);
  };

  M.Room = Room;
})(window.MISTICAS);
