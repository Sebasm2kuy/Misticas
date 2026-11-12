'use strict';
/* ============================================================
   MÍSTICAS — (C) 1987 — iso.js
   Motor isométrico: mapa de teselas 16x8, conversión de
   coordenadas, orden pintor, colisiones y cámara.

   RASTERIZADOR DE TESELAS 100% PÍXEL DURO (canon Famicom/NES):
   cada suelo y cada muro se construye PÍXEL A PÍXEL (fillRect
   1x1 sobre columnas/scanlines enteras) en un bitmap offscreen,
   igual que los tiles de la cartucho real. Cero trazos con
   antialiasing, cero curvas suaves: solo bloques de color plano
   con junta negra de mortero y aristas de escalera 2:1.
   ============================================================ */
(function (M) {

  var TW = M.TILE_W, TH = M.TILE_H, HW = M.TILE_HW, HH = M.TILE_HH;

  var Iso = {

    worldToScreen: function (gx, gy) {
      return { x: (gx - gy) * HW, y: (gx + gy) * HH };
    },

    screenToWorld: function (sx, sy) {
      return {
        x: (sy / HH + sx / HW) / 2,
        y: (sy / HH - sx / HW) / 2
      };
    },

    /* Crea un mapa desde filas de caracteres.
       def: { rows: [..], legend: { 'g': {floor:'grass'}, 'W': {block:'wall', solid:true, floor:null}, ... } }
       Marcadores de entidades: B (niño), G (niña), N (hermana),
       o (vela), T (árbol grande), L (lápida latina), t (árbol muerto),
       x (marca genérica). Se extraen y la tesela queda vacía. */
    buildMap: function (def) {
      var rows = def.rows;
      var h = rows.length, w = rows[0].length;
      var cells = [];
      var marks = [];
      for (var y = 0; y < h; y++) {
        var line = [];
        for (var x = 0; x < w; x++) {
          var ch = rows[y].charAt(x);
          if ('BGNTLtx'.indexOf(ch) >= 0) {
            marks.push({ ch: ch, x: x, y: y });
            line.push(def.legend['.'] ? this._clone(def.legend['.']) : { floor: 'grass' });
          } else {
            var spec = def.legend[ch] || def.legend['.'] || { floor: 'grass' };
            line.push(this._clone(spec));
          }
        }
        cells.push(line);
      }
      return {
        w: w, h: h, cells: cells, marks: marks, def: def,
        bounds: this._bounds(w, h)
      };
    },

    _clone: function (o) {
      var r = {};
      for (var k in o) r[k] = o[k];
      return r;
    },

    _bounds: function (w, h) {
      return {
        minX: -(h - 1) * HW,
        maxX: (w - 1) * HW + TW,
        minY: -36,
        maxY: (w + h - 2) * HH + TH + 4
      };
    },

    tileAt: function (map, gx, gy) {
      if (gx < 0 || gy < 0 || gx >= map.w || gy >= map.h) return null;
      return map.cells[gy][gx];
    },

    isSolid: function (map, gx, gy) {
      var t = this.tileAt(map, Math.floor(gx), Math.floor(gy));
      return !t || !!t.solid;
    },

    /* Movimiento con colisión por ejes (radio r en unidades de tesela) */
    move: function (map, ent, dx, dy) {
      var r = ent.r || 0.32;
      var nx = ent.gx + dx;
      if (!this._hits(map, nx, ent.gy, r)) ent.gx = nx;
      var ny = ent.gy + dy;
      if (!this._hits(map, ent.gx, ny, r)) ent.gy = ny;
    },

    _hits: function (map, gx, gy, r) {
      return this.isSolid(map, gx - r, gy - r) || this.isSolid(map, gx + r, gy - r) ||
             this.isSolid(map, gx - r, gy + r) || this.isSolid(map, gx + r, gy + r);
    },

    /* ============================================================
       RASTERIZACIÓN DE TESELAS (píxel duro, estilo tile-NES)
       El rombo 16x8 se llena por SCANLINES de escalera 2:1 que
       teselan SIN huecos NI solapes (verificado: cada píxel del
       plano pertenece a exactamente una tesela). Nada de paths
       con antialiasing: solo columnas y filas de fillRect.
       ============================================================ */

    // scanlines del rombo: [xIzq, ancho] por fila y=0..7
    DIAMOND: [[7, 2], [5, 6], [3, 10], [1, 14], [1, 14], [3, 10], [5, 6], [7, 2]],

    // borde del rombo por dirección (píxel extremo de cada fila):
    // NW=filas 0-3 izq | NE=filas 0-3 der | SE=filas 4-7 der | SW=filas 4-7 izq
    _edgePx: function (mask) {
      var px = [];
      var D = this.DIAMOND;
      var r, xL, xR;
      for (r = 0; r < 8; r++) {
        xL = D[r][0]; xR = xL + D[r][1] - 1;
        if ((mask & 1) && r < 4) px.push([xL, r]);          // NW
        if ((mask & 2) && r < 4) px.push([xR, r]);          // NE
        if ((mask & 4) && r >= 4) px.push([xR, r]);         // SE
        if ((mask & 8) && r >= 4) px.push([xL, r]);         // SW
      }
      return px;
    },

    /* Familias de ladrillo del canon (índices de paleta):
       - 'red'   (nave del convento): cara SO marrón ladrillo,
         cara SE carmín, tapa carmín con filete salmón completo.
       - 'violet' (criptas y exteriores): SO casi negro, SE
         violeta, tapa púrpura profundo. */
    WALL_FAM: {
      red: {
        so: { mass: 15, swap: 0, hot: 8 },   // sombra: marrón, swap negro, brillo carmín
        se: { mass: 8, swap: 15, hot: 9 },   // luz: carmín, swap marrón, brillo alerta
        cap: 8, capEdgeAll: true
      },
      violet: {
        so: { mass: 1, swap: 2, hot: 4 },
        se: { mass: 2, swap: 4, hot: 4 },
        cap: 4, capEdgeAll: false
      }
    },

    _floorCache: {},
    _wallCache: {},

    /* Hornea el bitmap 16x8 de un suelo. type + variante posicional
       (masa clara/oscura, damero par/impar) + nivel de luz (tabla
       de sustitución de paleta) + máscara de bordillo (junta negra
       junto a muros). TODO píxel duro. */
    bakeFloor: function (type, level, mask, variant) {
      var key = type + '|' + level + '|' + (mask || 0) + '|' + (variant || 0);
      if (this._floorCache[key]) return this._floorCache[key];
      var pal = this._pal(level);
      var c = document.createElement('canvas');
      c.width = TW; c.height = TH;
      var x = c.getContext('2d');
      var D = this.DIAMOND;
      var r, i, xL, w;

      // masa principal del rombo (color plano según tipo/variante)
      var mass = M.C.VDARK;
      if (type === 'grass' || type === 'dirt' || type === 'stone') {
        mass = variant ? M.C.DARK : M.C.VDARK;
      } else if (type === 'path') {
        mass = M.C.DARK;
      } else if (type === 'carpet') {
        mass = M.C.CRIM;
      } else if (type === 'checker') {
        mass = variant ? M.C.VDARK : M.C.DPURP;
      }
      for (r = 0; r < 8; r++) {
        xL = D[r][0]; w = D[r][1];
        x.fillStyle = pal[mass];
        x.fillRect(xL, r, w, 1);
      }

      // juntas estructurales (mortero negro en escalera 2:1):
      // SE+SW en camino/piedra/damero; la alfombra añade el filete
      // NW de su borde (el filo carmesí del canon)
      if (type === 'path' || type === 'stone' || type === 'checker' || type === 'carpet') {
        this._pxJoint(x, pal);
      }
      if (type === 'carpet') {
        x.fillStyle = pal[M.C.BLACK];
        for (r = 0; r < 4; r++) x.fillRect(D[r][0], r, 1, 1);   // filete NW
      }

      // bordillo negro junto a muros/límites (grout del canon)
      if (mask) {
        var edge = this._edgePx(mask);
        x.fillStyle = pal[M.C.BLACK];
        for (i = 0; i < edge.length; i++) x.fillRect(edge[i][0], edge[i][1], 1, 1);
      }

      this._floorCache[key] = c;
      return c;
    },

    // junta de mortero SE+SW del rombo en píxel duro (escalera 2:1)
    _pxJoint: function (x, pal) {
      x.fillStyle = pal[M.C.BLACK];
      var r;
      // arista SE: filas 3..7, píxel derecho de cada fila (14,12,10,8)
      for (r = 3; r < 8; r++) {
        var D = this.DIAMOND[r];
        x.fillRect(D[0] + D[1] - 1, r, 1, 1);
      }
      // arista SW: filas 4..7, píxel izquierdo (1,3,5,7)
      for (r = 4; r < 8; r++) {
        x.fillRect(this.DIAMOND[r][0], r, 1, 1);
      }
    },

    // paleta sustituida por nivel de luz (los "registros" de la PPU)
    _pal: function (level) {
      var sw = M.PALSWAP[level === undefined ? 2 : level];
      var p = [];
      for (var i = 0; i < 16; i++) p[i] = M.PAL[sw[i]];
      return p;
    },

    /* Hornea el bitmap de un muro isométrico de altura hh px:
       dos caras de sillares en aparejo corrido + tapa con filete.
       Cada píxel se decide por columna (escalera 2:1 coherente
       con el rombo del suelo): masa plana, mortero negro 1px,
       sillares encendidos y contorno negro de silueta. */
    bakeWall: function (hh, family, level, variant) {
      hh = hh || 13;
      variant = variant || 0;
      var key = family + '|' + hh + '|' + level + '|' + variant;
      if (this._wallCache[key]) return this._wallCache[key];
      var fam = this.WALL_FAM[family] || this.WALL_FAM.violet;
      var pal = this._pal(level);
      var c = document.createElement('canvas');
      c.width = TW; c.height = hh + TH;
      var x = c.getContext('2d');
      // origen local: y=0 es el vértice superior de la tapa;
      // la base del muro (fila 7 del rombo) cae en y = hh+7
      var BH = 5, BW = 10;

      // columnas de las caras: SO x1..7, SE x8..14 (con yBase en
      // píxel exclusivo), coherentes con las scanlines del suelo
      var soBot = [0, 5, 5, 6, 6, 7, 7, 8];   // índice = x (0..7)
      var seBot = [0, 0, 0, 0, 0, 0, 0, 0, 8, 7, 7, 6, 6, 5, 5, 0]; // índice = x (8..14)

      var col, y, yTop, yBot, d, band, wy, off, wx, hsh, tone, isSo;
      for (col = 1; col <= 14; col++) {
        isSo = col <= 7;
        yBot = (isSo ? soBot[col] : seBot[col]) + hh;
        yTop = yBot - hh;
        for (y = yTop; y < yBot; y++) {
          d = yBot - 1 - y;               // profundidad desde la base
          // contorno de silueta: base y laterales en negro puro
          if (d === 0 || col === 1 || col === 14) {
            x.fillStyle = pal[M.C.BLACK];
            x.fillRect(col, y, 1, 1);
            continue;
          }
          band = Math.floor(d / BH);
          wy = d % BH;
          off = (band % 2) * (BW / 2);
          wx = (col + off) % BW;
          tone = isSo ? fam.so : fam.se;
          if (wy === BH - 1 || wx === 0) {
            // junta de mortero negra alrededor del sillar
            x.fillStyle = pal[M.C.BLACK];
          } else {
            hsh = M.hash(col * 31 + band * 7 + variant * 131 + (isSo ? 0 : 57),
                         band * 17 + col + variant * 3);
            if (hsh < 0.13) {
              x.fillStyle = pal[tone.swap];       // sillar contrario
            } else if (hsh > 0.93) {
              // sillar encendido: cuerpo vivo + arista salmón arriba
              x.fillStyle = (wy === 0) ? pal[M.C.LMAG] : pal[tone.hot];
            } else {
              x.fillStyle = pal[tone.mass];
            }
          }
          x.fillRect(col, y, 1, 1);
        }
      }

      // tapa (diamante plano en lo alto) con filete del canon
      var D = this.DIAMOND;
      var r, xL, w, xR;
      for (r = 0; r < 8; r++) {
        xL = D[r][0]; w = D[r][1]; xR = xL + w - 1;
        for (var cx = xL; cx <= xR; cx++) {
          if (cx === xL || cx === xR) {
            x.fillStyle = pal[M.C.BLACK];        // contorno de la tapa
          } else if (cx === xL + 1 || cx === xR - 1) {
            x.fillStyle = pal[M.C.LMAG];         // filete salmón (roof lip)
          } else {
            x.fillStyle = pal[fam.cap];
          }
          x.fillRect(cx, r, 1, 1);
        }
      }

      this._wallCache[key] = c;
      return c;
    },

    /* Tesela vecina (null = fuera del mapa: también cierra el borde) */
    edgeMask: function (map, gx, gy) {
      var m = 0;
      var tN = this.tileAt(map, gx, gy - 1);
      var tE = this.tileAt(map, gx + 1, gy);
      var tS = this.tileAt(map, gx, gy + 1);
      var tW = this.tileAt(map, gx - 1, gy);
      if (!tN || tN.solid) m |= 1;
      if (!tE || tE.solid) m |= 2;
      if (!tS || tS.solid) m |= 4;
      if (!tW || tW.solid) m |= 8;
      return m;
    },

    /* Recorre las teselas visibles: cb(sx, sy, gx, gy, tile) */
    forEachVisible: function (map, cam, vw, vh, cb) {
      var x0 = cam.x - TW, x1 = cam.x + vw + TW;
      var y0 = cam.y - 60, y1 = cam.y + vh + TH + 30;
      var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      var rad = Math.ceil((x1 - x0) / HW / 2) + 3;
      var cc = this.screenToWorld(cx, cy);
      var gx0 = Math.max(0, Math.floor(cc.x - rad)), gx1 = Math.min(map.w - 1, Math.ceil(cc.x + rad));
      var gy0 = Math.max(0, Math.floor(cc.y - rad)), gy1 = Math.min(map.h - 1, Math.ceil(cc.y + rad));
      for (var gy = gy0; gy <= gy1; gy++) {
        for (var gx = gx0; gx <= gx1; gx++) {
          var s = this.worldToScreen(gx, gy);
          var sx = s.x - cam.x;
          var sy = s.y - cam.y;
          if (sx > -TW && sx < vw + TW && sy > -70 && sy < vh + TH + 40) {
            cb(sx, sy, gx, gy, map.cells[gy][gx]);
          }
        }
      }
    },

    /* Cámara con límites del mapa */
    clampCam: function (map, cam, vw, vh) {
      var b = map.bounds;
      var mw = b.maxX - b.minX, mh = b.maxY - b.minY;
      if (mw <= vw) cam.x = b.minX + (mw - vw) / 2;
      else cam.x = M.clamp(cam.x, b.minX, b.maxX - vw);
      if (mh <= vh) cam.y = b.minY + (mh - vh) / 2;
      else cam.y = M.clamp(cam.y, b.minY, b.maxY - vh);
    },

    /* ============================================================
       HABITACIONES FIJAS TIPO DIORAMA
       Cada escena es UNA sala cerrada que flota en el vacío negro.
       Se pre-renderiza UNA sola vez la BASE (cimiento + zócalo
       pedestal) con la paleta ambiental de la sala; los suelos y
       muros son TILES horneados por nivel de luz que el bucle
       compone cada fotograma — el mismo modelo nametable+paleta
       de la NES, a 60 fps estables.
       ============================================================ */

    // Marco completo de la sala en coords de pantalla-mundo:
    // rombo de la huella + altura de muros arriba + zócalo abajo.
    roomFrame: function (map) {
      var maxHH = 8, x, y, t;
      for (y = 0; y < map.h; y++) {
        for (x = 0; x < map.w; x++) {
          t = map.cells[y][x];
          if (t && t.block === 'wall' && (t.hh || 13) > maxHH) maxHH = t.hh;
        }
      }
      var N = { x: 0, y: 0 };
      var E = { x: (map.w - 1) * HW + TW, y: (map.w - 1) * HH + HH };
      var S = { x: (map.w - map.h) * HW + HW, y: (map.w + map.h - 2) * HH + TH };
      var W = { x: -(map.h - 1) * HW, y: (map.h - 1) * HH + HH };
      var pad = 2;
      return {
        N: N, E: E, S: S, W: W, D: 7, maxHH: maxHH,
        x: W.x - pad,
        y: N.y - maxHH - pad,
        w: (E.x - W.x) + pad * 2,
        h: (S.y + 7 + pad) - (N.y - maxHH - pad)
      };
    },

    // cara del zócalo: pedestal macizo bajo el borde de la sala,
    // rasterizado por columnas (masa violeta, sombra inferior de
    // 2 px negros, contorno negro y arista superior salmón)
    _plinthPx: function (g, pal, a, b) {
      var D = 7;
      var x0 = Math.round(Math.min(a.x, b.x));
      var x1 = Math.round(Math.max(a.x, b.x));
      var dx = b.x - a.x;
      var col, yt, y;
      for (col = x0; col < x1; col++) {
        yt = Math.round(a.y + (b.y - a.y) * ((col - a.x) / (dx || 1)));
        for (y = 0; y < D; y++) {
          if (col === x0 || col === x1 - 1 || y === 0 || y >= D - 2) {
            g.fillStyle = (y === 0) ? pal[M.C.LMAG] : pal[M.C.BLACK];
          } else {
            g.fillStyle = pal[M.C.DARK];
          }
          g.fillRect(col, yt + y, 1, 1);
        }
      }
    },

    /* Base pre-renderizada de la sala: cimiento (rombo macizo de
       la huella) + zócalo frontal. ambient = nivel de paleta con
       que se hornea (2 normal; 1 penumbra en salas oscuras). */
    renderRoomBase: function (map, ambient) {
      var pal = this._pal(ambient === undefined ? 2 : ambient);
      var f = this.roomFrame(map);
      var c = document.createElement('canvas');
      c.width = Math.ceil(f.w);
      c.height = Math.ceil(f.h);
      var g = c.getContext('2d');
      g.translate(-Math.round(f.x), -Math.round(f.y));

      // 1) cimiento: rombo macizo por scanlines (colores planos)
      var yMin = Math.floor(Math.min(f.N.y, f.W.y, f.E.y));
      var yMax = Math.ceil(f.S.y);
      var y, t, xL, xR;
      g.fillStyle = pal[M.C.VDARK];
      for (y = yMin; y < yMax; y++) {
        xL = null;
        if (y <= f.W.y) {
          t = (y - f.N.y) / ((f.W.y - f.N.y) || 1);
          xL = f.N.x + (f.W.x - f.N.x) * t;
        } else {
          t = (y - f.W.y) / ((f.S.y - f.W.y) || 1);
          xL = f.W.x + (f.S.x - f.W.x) * t;
        }
        if (y <= f.E.y) {
          t = (y - f.N.y) / ((f.E.y - f.N.y) || 1);
          xR = f.N.x + (f.E.x - f.N.x) * t;
        } else {
          t = (y - f.E.y) / ((f.S.y - f.E.y) || 1);
          xR = f.E.x + (f.S.x - f.E.x) * t;
        }
        var xa = Math.round(xL), xb = Math.round(xR);
        if (xb > xa) g.fillRect(xa, y, xb - xa, 1);
      }

      // 2) zócalo frontal: el pedestal del diorama
      this._plinthPx(g, pal, f.E, f.S);
      this._plinthPx(g, pal, f.S, f.W);

      return { canvas: c, frame: f };
    },

    /* Lista ordenada (orden pintor) de las teselas de la sala:
       {d, gx, gy, kind:'floor'|'wall', ...}. Los suelos llevan
       type/variant/mask; los muros hh/family/variant y su deco
       montada (door/gate/sconce) si la leyenda lo indica. */
    roomTiles: function (map) {
      var fam = (map.def && map.def.family) || 'violet';
      var items = [];
      var gy, gx, t;
      for (gy = 0; gy < map.h; gy++) {
        for (gx = 0; gx < map.w; gx++) {
          t = map.cells[gy][gx];
          if (!t) continue;
          var hv = M.hash(gx, gy);
          if (t.floor) {
            var variant = 0;
            if (t.floor === 'checker') variant = (gx + gy) % 2;
            else if (t.floor === 'grass' || t.floor === 'dirt' || t.floor === 'stone') variant = hv < 0.22 ? 1 : 0;
            items.push({
              d: gx + gy, gx: gx, gy: gy, kind: 'floor',
              floor: t.floor, variant: variant,
              mask: this.edgeMask(map, gx, gy),
              deco: t.deco || null
            });
          } else if (t.block === 'wall') {
            items.push({
              d: gx + gy, gx: gx, gy: gy, kind: 'wall',
              hh: t.hh || 13, family: fam,
              variant: Math.floor(hv * 3), deco: t.deco || null
            });
          }
        }
      }
      items.sort(function (a, b) { return a.d - b.d; });
      return items;
    }
  };

  M.Iso = Iso;
})(window.MISTICAS);
