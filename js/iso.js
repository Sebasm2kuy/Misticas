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
          // alfombra del canon del video: felpa CARMESÍ con borde
          // negro a ambos lados (la alfombra roja de la sala);
          // brillo salmón ocasional como reflejo de las velas
          this._diamond(ctx, sx, sy, M.C.CRIM);
          // filete negro NW+SE (borde de la alfombra)
          ctx.strokeStyle = M.PAL[M.C.BLACK];
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(sx + HW, sy + 0.5);
          ctx.lineTo(sx + 0.5, sy + HH);
          ctx.moveTo(sx + TW - 0.5, sy + HH);
          ctx.lineTo(sx + HW, sy + TH - 0.5);
          ctx.stroke();
          this._joint(ctx, sx, sy);
          if ((gx * 3 + gy * 5) % 7 === 0) {
            ctx.fillStyle = M.PAL[M.C.LMAG];
            ctx.fillRect(sx + 6, sy + 3, 4, 1);
          }
          break;
        case 'checker':
          // SUELO DAMERO del canon: rombos alternos #6D28D9 /
          // #1E0B26 con junta negra fina (la sala del video)
          this._diamond(ctx, sx, sy, ((gx + gy) % 2 === 0) ? M.C.DPURP : M.C.VDARK);
          this._joint(ctx, sx, sy);
          if (hv > 0.96) this._litEdge(ctx, sx, sy);
          break;
        default:
          this._diamond(ctx, sx, sy, M.C.VDARK);
          this._joint(ctx, sx, sy);
      }
    },

    /* Bloque isométrico (muro) de altura hh px.
       RÉPLICA EXACTA del metraje: dos familias de ladrillo.
       - 'red' (nave del convento, la sala del video): cara SO en
         marrón ladrillo #8E1B12, cara SE en carmín #D93025, sillar
         encendido salmón y tapa carmín con filete salmón completo
         (el "roof lip" del canon). Mortero negro 1-2px.
       - 'violet' (criptas y exteriores, familia del pasillo del
         video): cara SO casi negra, cara SE violeta, tapa púrpura
         profundo. Todo en aparejo corrido con junta negra. */
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

    drawWall: function (ctx, sx, sy, hh, family) {
      var fam = this.WALL_FAM[family] || this.WALL_FAM.violet;
      var self = this;

      function face(poly, ox, oy, tone) {
        // cara: masa sólida de ladrillo (clip al paralelogramo)
        ctx.save();
        ctx.beginPath();
        for (var i = 0; i < poly.length; i++) {
          if (i === 0) ctx.moveTo(poly[i][0] + sx, poly[i][1] + sy);
          else ctx.lineTo(poly[i][0] + sx, poly[i][1] + sy);
        }
        ctx.closePath();
        ctx.clip();
        ctx.fillStyle = M.PAL[tone.mass];
        ctx.fillRect(sx - 2, sy - hh - 6, TW + 4, hh + TH + 8);

        // sillares en aparejo corrido: junta negra de mortero sobre
        // la masa, cuerpos intercambiados y aristas encendidas
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
              // sillar sombra/luz: el ladrillo contrario
              ctx.fillStyle = M.PAL[tone.swap];
              ctx.fillRect(x0, y1, x1 - x0, y0 - y1);
            } else if (hsh > 0.93) {
              // sillar encendido: cuerpo vivo y arista salmón
              ctx.fillStyle = M.PAL[tone.hot];
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

      // cara izquierda (SO): sombra — cara derecha (SE): luz;
      // el contraste entre ambas da el volumen Famicom del canon
      face([[0, HH], [HW, TH], [HW, TH - hh], [0, HH - hh]], 0, HH, fam.so);
      face([[HW, TH], [TW, HH], [TW, HH - hh], [HW, TH - hh]], HW, TH, fam.se);

      // tapa plana (canon: "roof lip")
      ctx.fillStyle = M.PAL[fam.cap];
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
      // filete del borde superior: en la familia roja, TODO el
      // contorno de la tapa se enciende en salmón (roof lip del
      // canon); en violeta solo la arista superior
      ctx.strokeStyle = M.PAL[M.C.LMAG];
      ctx.beginPath();
      ctx.moveTo(sx + HW + 1, sy - hh + 1);
      ctx.lineTo(sx + 1, sy + HH - hh + 1);
      if (fam.capEdgeAll) {
        ctx.lineTo(sx + 1, sy + HH - hh + 1);
      }
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
      // canon del video: la junta junto al muro es NEGRA (grout),
      // nunca una banda de color que compita con la piedra
      ctx.strokeStyle = M.PAL[M.C.BLACK];
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
    },

    /* ============================================================
       HABITACIONES FIJAS TIPO DIORAMA
       Cada escena es UNA sala cerrada que flota en el vacío negro.
       La sala entera (cimiento, suelo, zócalo-pedestal y muros) se
       pre-renderiza UNA sola vez a un canvas offscreen: el bucle de
       juego solo lo copia y dibuja encima las entidades vivas.
       Cero recálculo de teselas por fotograma = cero lag.
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

    // cara del zócalo: pedestal macizo bajo el borde de la sala
    _plinth: function (g, a, b) {
      var D = 7;
      // masa violeta oscura
      g.fillStyle = M.PAL[M.C.DARK];
      g.beginPath();
      g.moveTo(a.x, a.y); g.lineTo(b.x, b.y);
      g.lineTo(b.x, b.y + D); g.lineTo(a.x, a.y + D);
      g.closePath(); g.fill();
      // sombra inferior profunda (2 px negros)
      g.fillStyle = M.PAL[M.C.BLACK];
      g.beginPath();
      g.moveTo(a.x, a.y + D - 2); g.lineTo(b.x, b.y + D - 2);
      g.lineTo(b.x, b.y + D); g.lineTo(a.x, a.y + D);
      g.closePath(); g.fill();
      // contorno negro de la silueta
      g.strokeStyle = M.PAL[M.C.BLACK];
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(a.x + 0.5, a.y); g.lineTo(b.x + 0.5, b.y);
      g.lineTo(b.x + 0.5, b.y + D); g.lineTo(a.x + 0.5, a.y + D);
      g.closePath(); g.stroke();
      // arista superior iluminada (canon salmón)
      g.strokeStyle = M.PAL[M.C.LMAG];
      g.beginPath();
      g.moveTo(a.x, a.y + 0.5); g.lineTo(b.x, b.y + 0.5);
      g.stroke();
    },

    /* Pre-renderiza la sala estática completa. Devuelve
       { canvas, frame } — el canvas ya lleva cimiento + suelo +
       bordillos + zócalo + muros. Las capas de deco se hornean vía
       callbacks para intercalarlas con los muros por profundidad:
       opts.flat(g, toS)  → decos planos (cráneos, huesos) bajo muros
       opts.walls(items)  → añade {d, fn} de puertas/portones a la
                            lista de muros (orden pintor conjunto) */
    renderRoom: function (map, opts) {
      opts = opts || {};
      var f = this.roomFrame(map);
      var c = document.createElement('canvas');
      c.width = Math.ceil(f.w);
      c.height = Math.ceil(f.h);
      var g = c.getContext('2d');
      g.translate(-f.x, -f.y);
      g.imageSmoothingEnabled = false;
      var self = this;
      function toS(gx, gy) {
        var s = self.worldToScreen(gx, gy);
        return { x: s.x + HW, y: s.y + HH };
      }

      // 1) cimiento: rombo macizo de la huella completa (los muros
      //    se asientan sobre él: jamás quedan rendijas al vacío)
      g.fillStyle = M.PAL[M.C.VDARK];
      g.beginPath();
      g.moveTo(f.N.x, f.N.y);
      g.lineTo(f.E.x, f.E.y);
      g.lineTo(f.S.x, f.S.y);
      g.lineTo(f.W.x, f.W.y);
      g.closePath(); g.fill();

      // 2) zócalo frontal: el pedestal del diorama
      this._plinth(g, f.E, f.S);
      this._plinth(g, f.S, f.W);

      // 3) suelo completo de la sala (UNA sola vez, nunca por frame)
      var gx, gy, t, s;
      for (gy = 0; gy < map.h; gy++) {
        for (gx = 0; gx < map.w; gx++) {
          t = map.cells[gy][gx];
          if (t && t.floor) {
            s = this.worldToScreen(gx, gy);
            this.drawFloorTile(g, t.floor, s.x, s.y, gx, gy);
          }
        }
      }

      // 4) bordillos del área caminable (junto a muros y bordes)
      for (gy = 0; gy < map.h; gy++) {
        for (gx = 0; gx < map.w; gx++) {
          t = map.cells[gy][gx];
          if (t && t.floor) {
            s = this.worldToScreen(gx, gy);
            var mask = this.edgeMask(map, gx, gy);
            if (mask) this.drawFloorEdge(g, s.x, s.y, mask);
          }
        }
      }

      // 5) decos planos (cráneos, huesos) sobre el suelo, bajo muros
      if (opts.flat) opts.flat(g, toS);

      // 6) muros en orden pintor; los decos de muro (puertas,
      //    portones) van SIEMPRE en una segunda pasada encima:
      //    están MONTADOS sobre las caras frontales de los muros y
      //    ningún sillar vecino debe taparlos. La familia de
      //    ladrillo la fija cada sala ('red' | 'violet')
      var fam = (map.def && map.def.family) || 'violet';
      var items = [];
      for (gy = 0; gy < map.h; gy++) {
        for (gx = 0; gx < map.w; gx++) {
          t = map.cells[gy][gx];
          if (t && t.block === 'wall') {
            (function (gx2, gy2, hh) {
              items.push({ d: gx2 + gy2, fn: function () {
                var s2 = self.worldToScreen(gx2, gy2);
                self.drawWall(g, s2.x, s2.y, hh, fam);
              }});
            })(gx, gy, t.hh || 13);
          }
        }
      }
      items.sort(function (a, b) { return a.d - b.d; });
      for (var i = 0; i < items.length; i++) items[i].fn();

      // 6b) segunda pasada: puertas y portones sobre los muros
      if (opts.walls) opts.walls(g, toS);

      return { canvas: c, frame: f };
    }
  };

  M.Iso = Iso;
})(window.MISTICAS);
