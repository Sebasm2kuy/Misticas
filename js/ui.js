'use strict';
/* ============================================================
   MÍSTICAS — (C) 1987 — ui.js
   HUD inferior: 5 corazones, barra NEXUS CUM NUMINE y
   contadores. Cajas de texto con máquina de escribir,
   inscripciones latinas temblorosas y cartelas de escena.
   ============================================================ */
(function (M) {

  var F = null; // M.Font

  var UI = {

    dialog: null,   // {who, lines, li, ci, done, latin}
    card: null,     // {title, sub, t, hold}
    hint: null,     // {text, t, dur}

    init: function () { F = M.Font; },

    /* ---------- caja de texto ---------- */
    // El ancho de línea se calcula con la resolución real: en móvil
    // vertical (lienzo estrecho) el texto se parte en más líneas.
    say: function (who, text, opts) {
      opts = opts || {};
      var wrapN = Math.max(14, Math.floor((M.SCREEN_W - 24) / 6));
      var lines = this._wrap(text, wrapN);
      this.hint = null;   // el diálogo manda: nada comparte su caja
      this.dialog = {
        who: who || null,
        lines: lines,
        li: 0, ci: 0,
        done: false,
        latin: !!opts.latin,
        blipT: 0,
        _lastB: 0
      };
    },

    dialogActive: function () { return !!this.dialog; },

    _wrap: function (text, max) {
      var words = text.split(' ');
      var lines = [], cur = '';
      for (var i = 0; i < words.length; i++) {
        if ((cur + ' ' + words[i]).trim().length > max) {
          lines.push(cur.trim());
          cur = words[i];
        } else cur += ' ' + words[i];
      }
      if (cur.trim()) lines.push(cur.trim());
      return lines.length ? lines : [''];
    },

    // avanza texto; devuelve true cuando la caja se cierra
    updateDialog: function (dt) {
      var d = this.dialog;
      if (!d) return false;
      if (!d.done) {
        d.ci += dt * 34; // caracteres por segundo
        d.blipT -= dt;
        if (d.blipT <= 0 && Math.floor(d.ci) > d._lastB) {
          M.Audio.sfx.blip();
          d.blipT = 0.06;
          d._lastB = Math.floor(d.ci);
        }
        var line = d.lines[d.li];
        if (d.ci >= line.length) {
          if (d.li < d.lines.length - 1) { d.li++; d.ci = 0; d._lastB = 0; }
          else { d.done = true; }
        }
        // salto rápido
        if (M.Input.hit('fire')) {
          if (!d.done) { d.li = d.lines.length - 1; d.ci = 999; d.done = true; }
          else { this.dialog = null; return true; }
        }
      } else if (M.Input.hit('fire')) {
        this.dialog = null;
        return true;
      }
      return false;
    },

    drawDialog: function (ctx, t) {
      var d = this.dialog;
      if (!d) return;
      var W = M.SCREEN_W;
      // ventana de 3 líneas: la caja crece con el que habla y se
      // desplaza cuando el texto partido ocupa más líneas
      var shown = Math.min(3, d.lines.length);
      var bh = 12 + (d.who ? 10 : 0) + shown * 10 + 6;
      var bx = 4, by = M.VIEW_H - bh, bw = W - 8;
      // caja empotrada a ras del suelo del HUD: sólida, sin hueco
      ctx.fillStyle = M.PAL[M.C.BLACK];
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = M.PAL[M.C.VDARK];
      ctx.fillRect(bx + 2, by + 2, bw - 4, bh - 4);
      ctx.strokeStyle = M.PAL[d.latin ? M.C.CRIM : M.C.PURP];
      ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
      ctx.fillStyle = M.PAL[M.C.BLACK];
      ctx.fillRect(bx + 2, by + 2, bw - 4, 1);

      var ty = by + 6;
      if (d.who) {
        F.draw(ctx, d.who, bx + 8, ty, d.latin ? M.C.CRIM : M.C.LMAG, { scale: 1 });
        ty += 10;
      }
      var color = d.latin ? M.C.CRIM : M.C.BONE;
      var jitter = d.latin ? 1 : 0;
      var from = Math.max(0, Math.min(d.li - (shown - 1), d.lines.length - shown));
      for (var i = from; i <= d.li; i++) {
        var txt = (i < d.li) ? d.lines[i] : d.lines[i].substring(0, Math.floor(d.ci));
        if (txt) {
          F.draw(ctx, txt, bx + 8, ty + (i - from) * 10, color, { jitter: jitter });
        }
      }
      if (d.done && Math.sin(t * 7) > -0.2) {
        F.draw(ctx, '▼', bx + bw - 14, by + bh - 10, M.C.MAG);
      }
    },

    /* ---------- cartela de escena ---------- */
    showCard: function (scene, title, sub, hold) {
      this.card = { scene: scene, title: title, sub: sub, t: 0, hold: hold || 2.3 };
    },

    updateCard: function (dt) {
      var c = this.card;
      if (!c) return false;
      c.t += dt;
      if (c.t >= c.hold) { this.card = null; return true; }
      return false;
    },

    drawCard: function (ctx) {
      var c = this.card;
      if (!c) return;
      var W = M.SCREEN_W;
      ctx.fillStyle = M.PAL[M.C.BLACK];
      ctx.fillRect(0, 0, W, M.SCREEN_H);
      // el título rebaja escala o se parte en líneas si el lienzo es estrecho
      var ty = F.drawCenteredFit(ctx, c.title, W / 2, 76, M.C.BONE, { scale: 2, shadow: M.C.DPURP, shadowDx: 2, shadowDy: 2, spacing: 2 });
      if (c.sub) {
        F.drawCenteredFit(ctx, c.sub, W / 2, Math.max(102, ty + 12), M.C.CRIM, { scale: 1, spacing: 2 });
      }
      F.drawCenteredFit(ctx, '· ' + c.scene + ' ·', W / 2, 118, M.C.BONE2, { scale: 1 });
    },

    /* ---------- pista de controles ----------
       CERO textos flotando en el mundo: toda pista o susurro se
       muestra dentro de la MISMA caja inferior del diálogo, una
       línea limpia cada vez. Si un diálogo está activo, la pista
       espera su turno (el reloj se congela). El mismo texto que
       se refresca (pistas de proximity) NO reinicia su reloj. */
    showHint: function (text, dur) {
      if (this.hint && this.hint.text === text) {
        this.hint.dur = this.hint.t + (dur || 4.5);
        return;
      }
      this.hint = { text: text, t: 0, dur: dur || 4.5 };
    },

    updateHint: function (dt) {
      if (!this.hint) return;
      if (this.dialog) return;      // el diálogo manda: la pista espera
      this.hint.t += dt;
      if (this.hint.t > this.hint.dur) this.hint = null;
    },

    drawHint: function (ctx, t) {
      var h = this.hint;
      if (!h || this.dialog) return;   // nada comparte pantalla con la caja
      var W = M.SCREEN_W;
      var wrapN = Math.max(14, Math.floor((W - 24) / 6));
      var lines = this._wrap(h.text, wrapN);
      if (lines.length > 2) lines = lines.slice(0, 2);
      var bh = 12 + lines.length * 10 + 4;
      var bx = 4, by = M.VIEW_H - bh, bw = W - 8;
      // MISMA caja empotrada que el diálogo: sin hueco, opaca
      ctx.fillStyle = M.PAL[M.C.BLACK];
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = M.PAL[M.C.VDARK];
      ctx.fillRect(bx + 2, by + 2, bw - 4, bh - 4);
      ctx.strokeStyle = M.PAL[M.C.DPURP];
      ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
      ctx.fillStyle = M.PAL[M.C.BLACK];
      ctx.fillRect(bx + 2, by + 2, bw - 4, 1);
      var a = h.t < 0.25 ? h.t / 0.25 : (h.t > h.dur - 0.5 ? Math.max(0, (h.dur - h.t) / 0.5) : 1);
      ctx.globalAlpha = a;
      for (var i = 0; i < lines.length; i++) {
        F.draw(ctx, lines[i], bx + 8, by + 8 + i * 10, M.C.BONE2);
      }
      ctx.globalAlpha = 1;
    },

    /* ---------- HUD inferior (canon exacto de las capturas reales) ----------
       Izquierda: 5 corazones (rojo vivo, contorno sangre, medios),
       alineados en vertical con los slots de la derecha.
       Centro: marco NEXUS CUM NUMINE de doble borde (morado exterior,
       línea carmesí interior, muescas salmón) con tipografía gótica
       GRUESA en rojo (doble trazo + sombra, como la inscripción del
       canon) y barra de progreso salmón debajo del texto.
       Derecha: 3 slots con borde morado y el número debajo.
       Todo cabe SIEMPRE dentro del lienzo fijo 320x240. */
    drawHUD: function (ctx, game, t) {
      var W = M.SCREEN_W;
      var y0 = M.SCREEN_H - M.HUD_H;
      // banda negra pura del canon ("bottom strip, black background")
      ctx.fillStyle = M.PAL[M.C.BLACK];
      ctx.fillRect(0, y0, W, M.HUD_H);

      var Spr = M.Spr, i;

      // -- corazones de vida (5, con medios): pegados a la costura
      //    con la caja de texto para leer UN solo bloque inferior --
      var hx = 8, hy = y0 + 9;
      for (i = 0; i < 5; i++) {
        var full = game.hearts >= i + 1;
        var half = !full && game.hearts >= i + 0.5;
        Spr.draw(ctx, Spr.S.heartEmpty, hx + i * 11, hy);
        if (full) {
          Spr.draw(ctx, Spr.S.heartFull, hx + i * 11, hy);
        } else if (half) {
          // mitad izquierda llena sobre el contorno vacío
          ctx.save();
          ctx.beginPath();
          ctx.rect(hx + i * 11, hy, 5, Spr.S.heartFull.h);
          ctx.clip();
          Spr.draw(ctx, Spr.S.heartFull, hx + i * 11, hy);
          ctx.restore();
        }
      }

      // -- 3 slots de objetos (anclados a la derecha, número debajo) --
      var sY = y0 + 4, sS = 18;
      var s1 = W - 66, s2 = W - 44, s3 = W - 22;
      this._slotFrame(ctx, s1, sY, sS);
      this._slotFrame(ctx, s2, sY, sS);
      this._slotFrame(ctx, s3, sY, sS);
      // slot 1: vela (parpadeo)
      var cf = (Math.floor(t * 5) % 2 === 0) ? Spr.S.candle_a : Spr.S.candle_b;
      Spr.draw(ctx, cf, s1 + 6, sY + 4);
      F.draw(ctx, '' + game.candles, s1 + 8, sY + sS + 3, M.C.LMAG);
      // slot 2: libro
      Spr.draw(ctx, Spr.S.bookA, s2 + 3, sY + 7);
      F.draw(ctx, '' + game.book, s2 + 6, sY + sS + 3, M.C.LMAG);
      // slot 3: vacío (0)
      F.draw(ctx, '0', s3 + 7, sY + sS + 3, M.C.BONE2);

      // -- marco central NEXUS CUM NUMINE: borde SALMÓN del canon
      //    ("banner with salmon border frame and dark fill") +
      //    filete carmesí interior y muescas blancas
      var bw = 160, bx = Math.round(W / 2 - bw / 2), by = y0 + 2, bh = 32;
      ctx.fillStyle = M.PAL[M.C.VDARK];
      ctx.fillRect(bx + 1, by + 1, bw - 2, bh - 2);
      ctx.strokeStyle = M.PAL[M.C.LMAG];
      ctx.lineWidth = 2;
      ctx.strokeRect(bx + 1, by + 1, bw - 2, bh - 2);
      ctx.strokeStyle = M.PAL[M.C.CRIM];
      ctx.lineWidth = 1;
      ctx.strokeRect(bx + 3.5, by + 3.5, bw - 7, bh - 7);
      // muescas de esquina blancas
      ctx.fillStyle = M.PAL[M.C.WHITE];
      ctx.fillRect(bx - 1, by + 1, 2, 2); ctx.fillRect(bx + bw - 1, by + 1, 2, 2);
      ctx.fillRect(bx - 1, by + bh - 3, 2, 2); ctx.fillRect(bx + bw - 1, by + bh - 3, 2, 2);

      // tipografía gótica gruesa: rojo claro con doble trazo y sombra
      var hot = game.nexusFlag > 0;
      this._gothicCentered(ctx, 'NEXUS CUM NUMINE', bx + bw / 2, by + 8, hot ? M.C.LCRIM : M.C.CRIM);

      // barra de progreso del canon: relleno salmón con borde ROSA
      //    ("progress bar with pink border and light-pink fill")
      var barW = bw - 24, barX = bx + 12, barY = by + 23;
      ctx.fillStyle = M.PAL[M.C.BLACK];
      ctx.fillRect(barX, barY, barW, 5);
      var fillW = Math.round(barW * Math.min(1, game.nexus / 100));
      ctx.fillStyle = M.PAL[M.C.LMAG];
      ctx.fillRect(barX, barY, fillW, 5);
      if (game.nexus > 0 && game.nexus < 100) {
        ctx.fillStyle = M.PAL[M.C.WHITE];
        ctx.fillRect(barX + fillW - 1, barY, 1, 5);
      }
      ctx.strokeStyle = M.PAL[M.C.LMAG];
      ctx.lineWidth = 1;
      ctx.strokeRect(barX - 0.5, barY - 0.5, barW + 1, 6);
      // marcas sutiles cada 20%
      for (i = 1; i < 5; i++) {
        ctx.fillStyle = M.PAL[M.C.PURP];
        ctx.fillRect(barX + Math.round(barW * i / 5), barY + 4, 1, 1);
      }

      // silencio (esquina del HUD)
      if (M.Audio.muted) {
        F.draw(ctx, 'M', 4, y0 + 27, M.C.BONE2);
        ctx.fillStyle = M.PAL[M.C.CRIM];
        ctx.fillRect(4, y0 + 34, 7, 1);
      }
    },

    // marco de slot del canon: borde violeta #6D28D9
    //    ("three square item slots with thin purple outlines")
    _slotFrame: function (ctx, x, y, s) {
      ctx.strokeStyle = M.PAL[M.C.DPURP];
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, s, s);
      ctx.fillStyle = M.PAL[M.C.PURP];
      ctx.fillRect(x, y, 3, 1);
      ctx.fillRect(x, y, 1, 3);
      ctx.fillRect(x + s - 3, y + s - 1, 3, 1);
      ctx.fillRect(x + s - 1, y + s - 3, 1, 3);
    },

    /* Tipografía gótica gruesa del canon (estilo D validado):
       contorno ORTOGONAL en sangre (engorda sin cerrar los canales
       diagonales de la M) + sombra negra diagonal de profundidad +
       cuerpo principal en rojo. Como la inscripción "NEXUS CUM
       NUMINE" de la captura real: pesada, gótica y LEGIBLE. */
    _gothic: function (ctx, text, x, y, color, opts) {
      opts = opts || {};
      F.draw(ctx, text, x + 1, y + 2, M.C.BLACK, opts);
      F.draw(ctx, text, x, y + 1, M.C.BLOOD, opts);
      F.draw(ctx, text, x, y - 1, M.C.BLOOD, opts);
      F.draw(ctx, text, x - 1, y, M.C.BLOOD, opts);
      F.draw(ctx, text, x + 1, y, M.C.BLOOD, opts);
      F.draw(ctx, text, x, y, color, opts);
    },

    _gothicCentered: function (ctx, text, cx, y, color) {
      var o = { spacing: 1, align: 'center' };
      F.draw(ctx, text, cx + 1, y + 2, M.C.BLACK, o);
      F.draw(ctx, text, cx, y + 1, M.C.BLOOD, o);
      F.draw(ctx, text, cx, y - 1, M.C.BLOOD, o);
      F.draw(ctx, text, cx - 1, y, M.C.BLOOD, o);
      F.draw(ctx, text, cx + 1, y, M.C.BLOOD, o);
      F.draw(ctx, text, cx, y, color, o);
    },

    /* Lema latino diagonal (canon de la cámara isométrica): dos líneas
       rojas inclinadas y temblorosas en la esquina superior izquierda
       del mundo. Se muestra al llegar al interior del convento,
       nunca en el cementerio ni en el cielo. */
    drawMotto: function (ctx) {
      ctx.globalAlpha = 0.8;
      this._diagonal(ctx, 'VT COR SANCTAE ATTINGAS,', 12, 14);
      this._diagonal(ctx, 'EIVS OCULIS SPECTA', 30, 42);
      ctx.globalAlpha = 1;
    },

    _diagonal: function (ctx, text, x, y) {
      for (var i = 0; i < text.length; i++) {
        var ch = text.charAt(i);
        if (ch !== ' ') {
          F.draw(ctx, ch, Math.round(x), Math.round(y), M.C.CRIM, { jitter: 1 });
        }
        x += 6; y += 1;
      }
    }
  };

  M.UI = UI;
})(window.MISTICAS);
