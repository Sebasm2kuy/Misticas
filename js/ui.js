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
    say: function (who, text, opts) {
      opts = opts || {};
      var lines = this._wrap(text, 48);
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
      var bx = 4, by = M.VIEW_H - 42, bw = W - 8, bh = 38;
      ctx.globalAlpha = 0.94;
      ctx.fillStyle = M.PAL[M.C.VDARK];
      ctx.fillRect(bx, by, bw, bh);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = M.PAL[d.latin ? M.C.CRIM : M.C.PURP];
      ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
      ctx.fillStyle = M.PAL[M.C.BLACK];
      ctx.fillRect(bx + 2, by + 2, bw - 4, 1);

      var ty = by + 6;
      if (d.who) {
        F.draw(ctx, d.who, bx + 8, ty, d.latin ? M.C.LCRIM : M.C.LMAG, { scale: 1 });
        ty += 10;
      }
      var color = d.latin ? M.C.LCRIM : M.C.BONE;
      var jitter = d.latin ? 1 : 0;
      for (var i = 0; i <= d.li; i++) {
        var shown = (i < d.li) ? d.lines[i] : d.lines[i].substring(0, Math.floor(d.ci));
        if (shown) {
          F.draw(ctx, shown, bx + 8, ty + i * 10, color, { jitter: jitter });
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
      F.drawCentered(ctx, c.title, W / 2, 76, M.C.BONE, { scale: 2, shadow: M.C.DPURP, shadowDx: 2, shadowDy: 2, spacing: 2 });
      if (c.sub) {
        F.drawCentered(ctx, c.sub, W / 2, 102, M.C.CRIM, { scale: 1, spacing: 2 });
      }
      F.drawCentered(ctx, '· ' + c.scene + ' ·', W / 2, 118, M.C.BONE2, { scale: 1 });
    },

    /* ---------- pista de controles ---------- */
    showHint: function (text, dur) {
      this.hint = { text: text, t: 0, dur: dur || 4.5 };
    },

    updateHint: function (dt) {
      if (!this.hint) return;
      this.hint.t += dt;
      if (this.hint.t > this.hint.dur) this.hint = null;
    },

    drawHint: function (ctx, t) {
      var h = this.hint;
      if (!h) return;
      var W = M.SCREEN_W;
      var a = h.t < 0.3 ? h.t / 0.3 : (h.t > h.dur - 0.6 ? (h.dur - h.t) / 0.6 : 1);
      ctx.globalAlpha = a * (0.75 + Math.sin(t * 4) * 0.15);
      F.drawCentered(ctx, h.text, W / 2, M.VIEW_H - 50, M.C.BONE2);
      ctx.globalAlpha = 1;
    },

    /* ---------- HUD inferior (canon de las capturas reales) ----------
       Izquierda: 5 corazones (rojo vivo, contorno sangre, medios).
       Centro: marco NEXUS CUM NUMINE con doble borde (morado
       exterior, línea carmesí interior) y barra de progreso salmón.
       Derecha: 3 slots con borde morado y el número debajo. */
    drawHUD: function (ctx, game, t) {
      var W = M.SCREEN_W;
      var y0 = M.SCREEN_H - M.HUD_H;
      ctx.fillStyle = M.PAL[M.C.BLACK];
      ctx.fillRect(0, y0, W, M.HUD_H);
      ctx.fillStyle = M.PAL[M.C.PURP];
      ctx.fillRect(0, y0, W, 1);
      ctx.fillStyle = M.PAL[M.C.VDARK];
      ctx.fillRect(0, y0 + 1, W, 1);

      var Spr = M.Spr, i;

      // -- corazones de vida (5, con medios) --
      var hx = 8, hy = y0 + 14;
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

      // -- marco central NEXUS CUM NUMINE (doble borde, centrado) --
      var bw = 152, bx = Math.round(W / 2 - bw / 2), by = y0 + 3, bh = 30;
      ctx.strokeStyle = M.PAL[M.C.PURP];
      ctx.lineWidth = 2;
      ctx.strokeRect(bx + 1, by + 1, bw - 2, bh - 2);
      ctx.strokeStyle = M.PAL[M.C.CRIM];
      ctx.lineWidth = 1;
      ctx.strokeRect(bx + 3.5, by + 3.5, bw - 7, bh - 7);
      // muescas de esquina (salmón)
      ctx.fillStyle = M.PAL[M.C.LMAG];
      ctx.fillRect(bx - 1, by + 1, 2, 2); ctx.fillRect(bx + bw - 1, by + 1, 2, 2);
      ctx.fillRect(bx - 1, by + bh - 3, 2, 2); ctx.fillRect(bx + bw - 1, by + bh - 3, 2, 2);

      var labelColor = game.nexusFlag > 0 ? M.C.LMAG : M.C.CRIM;
      F.drawCentered(ctx, 'NEXUS CUM NUMINE', bx + bw / 2, by + 6, labelColor, { spacing: 1 });

      // barra de progreso continua (relleno salmón, borde morado)
      var barW = bw - 22, barX = bx + 11, barY = by + 19;
      ctx.fillStyle = M.PAL[M.C.BLACK];
      ctx.fillRect(barX, barY, barW, 5);
      var fillW = Math.round(barW * Math.min(1, game.nexus / 100));
      ctx.fillStyle = M.PAL[M.C.LMAG];
      ctx.fillRect(barX, barY, fillW, 5);
      if (game.nexus > 0 && game.nexus < 100) {
        ctx.fillStyle = M.PAL[M.C.BONE2];
        ctx.fillRect(barX + fillW - 1, barY, 1, 5);
      }
      ctx.strokeStyle = M.PAL[M.C.PURP];
      ctx.lineWidth = 1;
      ctx.strokeRect(barX - 0.5, barY - 0.5, barW + 1, 6);
      // marcas sutiles cada 20%
      for (i = 1; i < 5; i++) {
        ctx.fillStyle = M.PAL[M.C.DPURP];
        ctx.fillRect(barX + Math.round(barW * i / 5), barY + 4, 1, 1);
      }
      F.draw(ctx, Math.min(100, Math.round(game.nexus)) + '%', barX + barW + 3, barY, M.C.BONE2);

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

      // silencio (esquina del HUD)
      if (M.Audio.muted) {
        F.draw(ctx, 'M', 4, y0 + 27, M.C.BONE2);
        ctx.fillStyle = M.PAL[M.C.CRIM];
        ctx.fillRect(4, y0 + 34, 7, 1);
      }
    },

    // marco de slot morado con esquina recortada
    _slotFrame: function (ctx, x, y, s) {
      ctx.strokeStyle = M.PAL[M.C.PURP];
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, s, s);
      ctx.fillStyle = M.PAL[M.C.DPURP];
      ctx.fillRect(x, y, 3, 1);
      ctx.fillRect(x, y, 1, 3);
      ctx.fillRect(x + s - 3, y + s - 1, 3, 1);
      ctx.fillRect(x + s - 1, y + s - 3, 1, 3);
    }
  };

  M.UI = UI;
})(window.MISTICAS);
