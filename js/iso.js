'use strict';
/* ============================================================
   MÍSTICAS — (C) 1987 — iso.js
   Motor isométrico: mapa de teselas 16x8, conversión de
   coordenadas, orden pintor, colisiones y cámara.
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

    /* ---------- dibujo de teselas ----------
       Canon de las capturas reales (interior del convento): suelo
       NEGRO con puntitos morados dispersos, SIN rejilla por losa.
       El perímetro caminable se cierra con una banda morada sólida
       (drawFloorEdge, la llama world.js). Sin degradados. */

    _diamond: function (ctx, sx, sy, color) {
      ctx.fillStyle = M.PAL[color];
      ctx.beginPath();
      ctx.moveTo(sx + HW, sy);
      ctx.lineTo(sx + TW, sy + HH);
      ctx.lineTo(sx + HW, sy + TH);
      ctx.lineTo(sx, sy + HH);
      ctx.closePath();
      ctx.fill();
    },

    _diamondOutline: function (ctx, sx, sy, color) {
      ctx.strokeStyle = M.PAL[color];
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sx + HW, sy + 0.5);
      ctx.lineTo(sx + TW - 0.5, sy + HH);
      ctx.lineTo(sx + HW, sy + TH - 0.5);
      ctx.lineTo(sx + 0.5, sy + HH);
      ctx.closePath();
      ctx.stroke();
    },

    // arista superior-izquierda iluminada (rosa salmón)
    _litEdge: function (ctx, sx, sy) {
      ctx.fillStyle = M.PAL[M.C.LMAG];
      ctx.fillRect(sx + HW - 3, sy + 1, 4, 1);
      ctx.fillRect(sx + 2, sy + 2, 3, 1);
    },

    // puntito de textura violeta disperso (determinista)
    _speck: function (ctx, sx, sy, gx, gy, color) {
      ctx.fillStyle = M.PAL[color];
      ctx.fillRect(sx + 4 + Math.floor(M.hash(gx, gy) * 8), sy + 2 + Math.floor((M.hash(gy, gx) * 4) % 4), 1, 1);
    },

    drawFloorTile: function (ctx, type, sx, sy, gx, gy) {
      var hv = M.hash(gx, gy);
      switch (type) {
        case 'grass':
          this._diamond(ctx, sx, sy, M.C.VDARK);
          this._diamondOutline(ctx, sx, sy, M.C.DPURP);
          if (hv > 0.62) this._speck(ctx, sx, sy, gx, gy, M.C.DARK);
          if (hv < 0.14) { ctx.fillStyle = M.PAL[M.C.BONE2]; ctx.fillRect(sx + 10 - ((gy * 5) % 6), sy + 5, 1, 1); }
          if (hv > 0.93) this._litEdge(ctx, sx, sy);
          break;
        case 'path':
          this._diamond(ctx, sx, sy, M.C.BLACK);
          this._diamondOutline(ctx, sx, sy, M.C.PURP);
          if (hv > 0.55) this._speck(ctx, sx, sy, gx, gy, M.C.DPURP);
          if (hv < 0.2) { ctx.fillStyle = M.PAL[M.C.BONE2]; ctx.fillRect(sx + 9, sy + 2, 1, 1); }
          if (hv > 0.86) this._litEdge(ctx, sx, sy);
          break;
        case 'dirt':
          this._diamond(ctx, sx, sy, M.C.BLACK);
          this._diamondOutline(ctx, sx, sy, M.C.DPURP);
          if (hv > 0.5) { ctx.fillStyle = M.PAL[M.C.DARK]; ctx.fillRect(sx + 3 + ((gx * 5) % 9), sy + 4, 2, 1); }
          if (hv < 0.12) this._speck(ctx, sx, sy, gx, gy, M.C.PURP);
          break;
        case 'stone':
          // interior del convento (canon): losa negra con puntitos
          // morados dispersos — NINGUNA rejilla por losa
          this._diamond(ctx, sx, sy, M.C.BLACK);
          if (hv > 0.30) this._speck(ctx, sx, sy, gx, gy, M.C.DPURP);
          if (hv > 0.72) this._speck(ctx, sx, sy, gx + 3, gy + 5, M.C.PURP);
          if (hv < 0.08) { ctx.fillStyle = M.PAL[M.C.BONE2]; ctx.fillRect(sx + 8, sy + 4, 1, 1); }
          if (hv > 0.93) this._litEdge(ctx, sx, sy);
          break;
        case 'carpet':
          // alfombra morada del canon
          this._diamond(ctx, sx, sy, M.C.DPURP);
          this._diamondOutline(ctx, sx, sy, M.C.LPURP);
          if ((gx * 3 + gy * 5) % 7 === 0) {
            ctx.fillStyle = M.PAL[M.C.LMAG];
            ctx.fillRect(sx + 7, sy + 3, 2, 1);
          }
          if ((gx + gy) % 4 === 0) {
            ctx.fillStyle = M.PAL[M.C.LPURP];
            ctx.fillRect(sx + 6, sy + 4, 4, 1);
          }
          break;
        default:
          this._diamond(ctx, sx, sy, M.C.BLACK);
          this._diamondOutline(ctx, sx, sy, M.C.DPURP);
      }
    },

    /* Bloque isométrico (muro) de altura hh px.
       Canon de la captura real "repisa con puerta y escalera":
       sillares de contorno morado con caras rellenas de NEGRO,
       juntas (mortero) moradas en hiladas corridas y algún
       sillar encendido en rosa salmón. Tapa morada plana con
       arista violeta y silueta negra gruesa. */
    drawWall: function (ctx, sx, sy, hh) {
      var self = this;

      function face(poly, ox, oy) {
        // cara: negro + juntas moradas (clip al paralelogramo)
        ctx.save();
        ctx.beginPath();
        for (var i = 0; i < poly.length; i++) {
          if (i === 0) ctx.moveTo(poly[i][0] + sx, poly[i][1] + sy);
          else ctx.lineTo(poly[i][0] + sx, poly[i][1] + sy);
        }
        ctx.closePath();
        ctx.fillStyle = M.PAL[M.C.BLACK];
        ctx.fill();
        ctx.clip();
        // hiladas horizontales de mortero morado
        ctx.strokeStyle = M.PAL[M.C.PURP];
        ctx.lineWidth = 1;
        var y, x;
        var top = sy + oy, bot = sy + oy - hh;
        for (y = top - 4; y > bot; y -= 5) {
          ctx.beginPath(); ctx.moveTo(sx - 2, y + 0.5); ctx.lineTo(sx + TW + 2, y + 0.5); ctx.stroke();
        }
        // juntas verticales: aparejo corrido (desfasadas por hilada)
        var row = 0;
        for (y = top - 4; y > bot; y -= 5, row++) {
          for (x = ox + ((row % 2) ? 4 : 9); x < ox + TW; x += 10) {
            ctx.beginPath(); ctx.moveTo(sx + x + 0.5, y - 4); ctx.lineTo(sx + x + 0.5, y + 1); ctx.stroke();
          }
        }
        // sillares encendidos (rosa salmón, deterministas)
        var seed = (Math.floor(sx) * 7 + Math.floor(sy) * 13 + Math.floor(hh)) % 97;
        if (seed % 3 === 0) { ctx.fillStyle = M.PAL[M.C.LMAG]; ctx.fillRect(sx + ox + 3, top - 9, 5, 3); }
        if (seed % 4 === 1) { ctx.fillStyle = M.PAL[M.C.LMAG]; ctx.fillRect(sx + ox + 13, top - 15, 5, 3); }
        if (seed % 5 === 2) { ctx.fillStyle = M.PAL[M.C.DPURP]; ctx.fillRect(sx + ox + 7, top - 21, 5, 3); }
        ctx.restore();
      }

      // cara izquierda (SO)
      face([[0, HH], [HW, TH], [HW, TH - hh], [0, HH - hh]], 0, HH);
      // cara derecha (SE)
      face([[HW, TH], [TW, HH], [TW, HH - hh], [HW, TH - hh]], HW, TH);

      // tapa morada plana
      ctx.fillStyle = M.PAL[M.C.PURP];
      ctx.beginPath();
      ctx.moveTo(sx + HW, sy - hh);
      ctx.lineTo(sx + TW, sy + HH - hh);
      ctx.lineTo(sx + HW, sy + TH - hh);
      ctx.lineTo(sx, sy + HH - hh);
      ctx.closePath(); ctx.fill();
      // contorno negro grueso de la silueta (canon)
      ctx.strokeStyle = M.PAL[M.C.BLACK];
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sx, sy + HH);
      ctx.lineTo(sx, sy + HH - hh);
      ctx.lineTo(sx + HW, sy - hh);
      ctx.lineTo(sx + TW, sy + HH - hh);
      ctx.lineTo(sx + TW, sy + HH);
      ctx.lineTo(sx + HW, sy + TH);
      ctx.closePath(); ctx.stroke();
      // arista iluminada violeta sobre la tapa
      ctx.strokeStyle = M.PAL[M.C.LPURP];
      ctx.beginPath();
      ctx.moveTo(sx + HW, sy - hh);
      ctx.lineTo(sx, sy + HH - hh);
      ctx.lineTo(sx + HW, sy + TH - hh);
      ctx.lineTo(sx + TW, sy + HH - hh);
      ctx.closePath(); ctx.stroke();
    },

    /* Aristas del diamante de una tesela (borde del área caminable).
       mask: bit 1 = NW, 2 = NE, 4 = SE, 8 = SW. Canon: banda morada
       sólida junto a los muros y en el límite del mapa. */
    drawFloorEdge: function (ctx, sx, sy, mask) {
      if (!mask) return;
      ctx.strokeStyle = M.PAL[M.C.PURP];
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (mask & 1) { ctx.moveTo(sx + HW, sy + 0.5); ctx.lineTo(sx + 0.5, sy + HH); }
      if (mask & 2) { ctx.moveTo(sx + HW, sy + 0.5); ctx.lineTo(sx + TW - 0.5, sy + HH); }
      if (mask & 4) { ctx.moveTo(sx + TW - 0.5, sy + HH); ctx.lineTo(sx + HW, sy + TH - 0.5); }
      if (mask & 8) { ctx.moveTo(sx + 0.5, sy + HH); ctx.lineTo(sx + HW, sy + TH - 0.5); }
      ctx.stroke();
    },

    // tesela vecina (null = fuera del mapa: también cierra el borde)
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
      // radio en unidades de rejilla suficiente para cubrir la vista
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
    }
  };

  M.Iso = Iso;
})(window.MISTICAS);
