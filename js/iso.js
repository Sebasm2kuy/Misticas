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

    /* ---------- dibujo de teselas ---------- */

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

    drawFloorTile: function (ctx, type, sx, sy, gx, gy) {
      var hv = M.hash(gx, gy);
      switch (type) {
        case 'grass':
          this._diamond(ctx, sx, sy, M.C.VDARK);
          if (hv > 0.62) { ctx.fillStyle = M.PAL[M.C.DARK]; ctx.fillRect(sx + 4 + ((gx * 3) % 8), sy + 3, 1, 1); }
          if (hv < 0.18) { ctx.fillStyle = M.PAL[M.C.BONE2]; ctx.fillRect(sx + 10 - ((gy * 5) % 6), sy + 5, 1, 1); }
          break;
        case 'path':
          this._diamond(ctx, sx, sy, M.C.DARK);
          if (hv > 0.55) { ctx.fillStyle = M.PAL[M.C.DPURP]; ctx.fillRect(sx + 5 + ((gy * 7) % 6), sy + 4, 1, 1); }
          if (hv < 0.2) { ctx.fillStyle = M.PAL[M.C.BONE2]; ctx.fillRect(sx + 9, sy + 2, 1, 1); }
          break;
        case 'dirt':
          this._diamond(ctx, sx, sy, M.C.DARK);
          if (hv > 0.5) { ctx.fillStyle = M.PAL[M.C.VDARK]; ctx.fillRect(sx + 3 + ((gx * 5) % 9), sy + 4, 2, 1); }
          if (hv < 0.12) { ctx.fillStyle = M.PAL[M.C.DPURP]; ctx.fillRect(sx + 8, sy + 2, 1, 1); }
          break;
        case 'stone':
          this._diamond(ctx, sx, sy, ((gx + gy) & 1) ? M.C.VDARK : M.C.DARK);
          // juntas
          ctx.strokeStyle = M.PAL[M.C.BLACK];
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(sx + HW, sy + 0.5); ctx.lineTo(sx + TW - 0.5, sy + HH);
          ctx.lineTo(sx + HW, sy + TH - 0.5); ctx.lineTo(sx + 0.5, sy + HH);
          ctx.closePath(); ctx.stroke();
          if (hv > 0.87) { ctx.fillStyle = M.PAL[M.C.DPURP]; ctx.fillRect(sx + 7, sy + 3, 1, 1); }
          break;
        case 'carpet':
          this._diamond(ctx, sx, sy, M.C.CRIM);
          if ((gx * 3 + gy * 5) % 7 === 0) {
            ctx.fillStyle = M.PAL[M.C.LCRIM];
            ctx.fillRect(sx + 7, sy + 3, 2, 1);
          }
          if ((gx + gy) % 4 === 0) {
            ctx.strokeStyle = M.PAL[M.C.BLOOD];
            ctx.beginPath();
            ctx.moveTo(sx + 6, sy + 4); ctx.lineTo(sx + 10, sy + 4);
            ctx.stroke();
          }
          break;
        default:
          this._diamond(ctx, sx, sy, M.C.VDARK);
      }
    },

    /* Bloque isométrico (muro) de altura h px */
    drawWall: function (ctx, sx, sy, hh) {
      // cara izquierda (SO)
      ctx.fillStyle = M.PAL[M.C.DPURP];
      ctx.beginPath();
      ctx.moveTo(sx, sy + HH);
      ctx.lineTo(sx + HW, sy + TH);
      ctx.lineTo(sx + HW, sy + TH - hh);
      ctx.lineTo(sx, sy + HH - hh);
      ctx.closePath(); ctx.fill();
      // cara derecha (SE)
      ctx.fillStyle = M.PAL[M.C.DARK];
      ctx.beginPath();
      ctx.moveTo(sx + HW, sy + TH);
      ctx.lineTo(sx + TW, sy + HH);
      ctx.lineTo(sx + TW, sy + HH - hh);
      ctx.lineTo(sx + HW, sy + TH - hh);
      ctx.closePath(); ctx.fill();
      // tapa
      ctx.fillStyle = M.PAL[M.C.PURP];
      ctx.beginPath();
      ctx.moveTo(sx + HW, sy - hh);
      ctx.lineTo(sx + TW, sy + HH - hh);
      ctx.lineTo(sx + HW, sy + TH - hh);
      ctx.lineTo(sx, sy + HH - hh);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = M.PAL[M.C.LPURP];
      ctx.beginPath();
      ctx.moveTo(sx + HW, sy - hh);
      ctx.lineTo(sx, sy + HH - hh);
      ctx.lineTo(sx + HW, sy + TH - hh);
      ctx.lineTo(sx + TW, sy + HH - hh);
      ctx.closePath(); ctx.stroke();
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
