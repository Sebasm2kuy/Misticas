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
       ESTÁNDAR FAMICOM/NES: masa sólida de piedra + junta negra
       de mortero + luz escasa. Nada de rejillas geométricas: el
       suelo se lee como ADOQUÍN compacto porque cada losa es un
       trozo de masa violeta oscura separado por sombra (negro),
       no una línea brillante sobre vacío. La luz (salmón) solo
       salta en contadas losas. Exterior = pradera/ tierra con
       matas y hoyos; interior = losas pavimentadas con junta;
       camino = tierra más clara, pisada. Sin degradados. */

    // junta de mortero: aristas SE + SW del diamante en negro
    // (la sombra de la losa sobre la siguiente: adoquín macizo)
    _joint: function (ctx, sx, sy) {
      ctx.strokeStyle = M.PAL[M.C.BLACK];
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sx + TW - 0.5, sy + HH);
      ctx.lineTo(sx + HW, sy + TH - 0.5);
      ctx.lineTo(sx + 0.5, sy + HH);
      ctx.stroke();
    },

    // dab: detalle de 1-2 px (mata, hoyo, guijarro) determinista
    _dab: function (ctx, sx, sy, gx, gy, color, w, h) {
      ctx.fillStyle = M.PAL[color];
      ctx.fillRect(sx + 4 + Math.floor(M.hash(gx, gy) * 8),
                   sy + 2 + Math.floor(M.hash(gy, gx) * 4), w || 1, h || 1);
    },

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
          // pradera nocturna: masa violeta compacta, aclarada a
          // trechos por la luna; matas, hoyos y alguna chispa
          this._diamond(ctx, sx, sy, (hv < 0.22) ? M.C.DARK : M.C.VDARK);
          if (hv > 0.40 && hv < 0.58) this._dab(ctx, sx, sy, gx, gy, M.C.DARK, 1, 2);
          if (hv > 0.58 && hv < 0.72) this._dab(ctx, sx, sy, gx + 3, gy + 5, M.C.DARK, 2, 1);
          if (hv < 0.10) this._dab(ctx, sx, sy, gy, gx, M.C.BLACK, 2, 1);
          if (hv > 0.93 && hv < 0.97) this._dab(ctx, sx, sy, gx + 1, gy + 2, M.C.DPURP, 1, 1);
          if (hv > 0.97) this._litEdge(ctx, sx, sy);
          break;
        case 'path':
          // sendero pisado: tierra más clara que la hierba, junta
          // de adoquín hundido y guijarros de hueso
          this._diamond(ctx, sx, sy, M.C.DARK);
          this._joint(ctx, sx, sy);
          if (hv < 0.25) this._dab(ctx, sx, sy, gx, gy, M.C.VDARK, 2, 2);
          if (hv > 0.55 && hv < 0.78) this._dab(ctx, sx, sy, gx, gy, M.C.BONE2, 1, 1);
          if (hv > 0.86) this._dab(ctx, sx, sy, gx + 5, gy + 1, M.C.BONE2, 1, 1);
          if (hv > 0.95) this._litEdge(ctx, sx, sy);
          break;
        case 'dirt':
          // campo santo: tierra violácea con tumulillos y huesos
          this._diamond(ctx, sx, sy, (hv < 0.16) ? M.C.DARK : M.C.VDARK);
          if (hv > 0.45 && hv < 0.62) {
            this._dab(ctx, sx, sy, gx, gy, M.C.DARK, 2, 1);
            this._dab(ctx, sx, sy, gy, gx, M.C.BLACK, 1, 1);
          }
          if (hv < 0.09) this._dab(ctx, sx, sy, gx, gy, M.C.BLACK, 2, 1);
          if (hv > 0.80 && hv < 0.90) this._dab(ctx, sx, sy, gx, gy, M.C.BONE2, 1, 1);
          if (hv > 0.96) this._litEdge(ctx, sx, sy);
          break;
        case 'stone':
          // claustro del convento: losas de piedra maciza con junta
          // negra de mortero, alguna losa más clara, grietas y astillas
          this._diamond(ctx, sx, sy, (hv < 0.16) ? M.C.DARK : M.C.VDARK);
          this._joint(ctx, sx, sy);
          if (hv > 0.50 && hv < 0.66) this._dab(ctx, sx, sy, gx, gy, M.C.BLACK, 1, 1);
          if (hv > 0.86 && hv < 0.93) this._dab(ctx, sx, sy, gx, gy, M.C.BONE2, 1, 1);
          if (hv > 0.95) this._litEdge(ctx, sx, sy);
          break;
        case 'carpet':
          // alfombra del abad: masa púrpura con cenefa discreta
          this._diamond(ctx, sx, sy, M.C.DPURP);
          this._joint(ctx, sx, sy);
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
          this._diamond(ctx, sx, sy, M.C.VDARK);
          this._joint(ctx, sx, sy);
      }
    },

    /* Bloque isométrico (muro) de altura hh px.
       ESTÁNDAR FAMICOM/NES: cara SO en violeta profundo y cara SE
       media luz más clara (el volumen nace del contraste), sillares
       en aparejo corrido dibujados como MASA de piedra con JUNTA
       NEGRA de mortero. Algunos sillares aclaran (deterministas) y
       muy pocos se encienden con arista salmón. Tapa morada sólida
       con arista iluminada y silueta negra gruesa. Cero líneas
       finas flotantes: todo es masa, sombra y luz. */
    drawWall: function (ctx, sx, sy, hh) {

      function face(poly, ox, oy, mass) {
        // cara: masa sólida de piedra (clip al paralelogramo)
        ctx.save();
        ctx.beginPath();
        for (var i = 0; i < poly.length; i++) {
          if (i === 0) ctx.moveTo(poly[i][0] + sx, poly[i][1] + sy);
          else ctx.lineTo(poly[i][0] + sx, poly[i][1] + sy);
        }
        ctx.closePath();
        ctx.clip();
        ctx.fillStyle = M.PAL[mass];
        ctx.fillRect(sx - 2, sy - hh - 6, TW + 4, hh + TH + 8);

        // sillares en aparejo corrido: junta negra sobre la masa,
        // cuerpos aclarados y aristas encendidas (deterministas)
        var top = sy + oy, bot = sy + oy - hh;
        var BH = 5;                  // alto de la hilada
        var BW = 10;                 // ancho del sillar
        var row = 0, y0, x0, x1, jx;
        for (y0 = top - 1; y0 > bot; y0 -= BH, row++) {
          var off = (row % 2) ? 0 : BW / 2;
          for (jx = ox - BW + off; jx < ox + TW + BW; jx += BW) {
            x0 = Math.max(sx + jx + 1, sx - 2);
            x1 = Math.min(sx + jx + BW - 1, sx + TW + 2);
            if (x1 <= x0) continue;
            var y1 = Math.max(y0 - BH + 1, bot - 2);
            var hsh = M.hash(Math.floor(sx + jx), Math.floor(y0) + row * 31);
            if (hsh < 0.13) {
              // sillar aclarado: la piedra recibe algo más de luna
              ctx.fillStyle = M.PAL[(mass === M.C.DARK) ? M.C.PURP : M.C.DARK];
              ctx.fillRect(x0, y1, x1 - x0, y0 - y1);
            } else if (hsh > 0.93) {
              // sillar encendido: cuerpo vivo y arista salmón
              ctx.fillStyle = M.PAL[M.C.PURP];
              ctx.fillRect(x0, y1, x1 - x0, y0 - y1);
              ctx.fillStyle = M.PAL[M.C.LMAG];
              ctx.fillRect(x0, y1, Math.min(4, x1 - x0), 1);
            }
            // junta negra de mortero alrededor del sillar
            ctx.strokeStyle = M.PAL[M.C.BLACK];
            ctx.lineWidth = 1;
            ctx.strokeRect(x0 - 0.5, y1 - 0.5, x1 - x0 + 1, y0 - y1 + 1);
          }
        }
        ctx.restore();
      }

      // cara izquierda (SO): violeta profundo — cara derecha (SE):
      // media luz; el contraste entre ambas da el volumen Famicom
      face([[0, HH], [HW, TH], [HW, TH - hh], [0, HH - hh]], 0, HH, M.C.VDARK);
      face([[HW, TH], [TW, HH], [TW, HH - hh], [HW, TH - hh]], HW, TH, M.C.DARK);

      // tapa violeta plana
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
      // arista SUPERIOR iluminada en salmón (canon: borde magenta)
      ctx.strokeStyle = M.PAL[M.C.LMAG];
      ctx.beginPath();
      ctx.moveTo(sx + HW + 1, sy - hh + 1);
      ctx.lineTo(sx + 1, sy + HH - hh + 1);
      ctx.lineTo(sx + HW, sy + TH - hh + 1);
      ctx.lineTo(sx + TW - 1, sy + HH - hh + 1);
      ctx.lineTo(sx + HW + 1, sy - hh + 1);
      ctx.stroke();
    },

    /* Aristas del diamante de una tesela (borde del área caminable).
       mask: bit 1 = NW, 2 = NE, 4 = SE, 8 = SW. Canon: bordillo en
       magenta OSCURO solo donde la losa delimita con muro o límite
       del mapa (nunca una banda brillante que compita con la piedra). */
    drawFloorEdge: function (ctx, sx, sy, mask) {
      if (!mask) return;
      ctx.strokeStyle = M.PAL[M.C.DPURP];
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
