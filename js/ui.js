'use strict';
/* ============================================================
   MÍSTICAS — (C) 1987 — ui.js
   HUD inferior: 5 corazones, barra NEXUS CUM NUMINE y
   contadores. Cajas de texto con máquina de escribir,
   inscripciones latinas temblorosas y cartelas de escena.
   ============================================================ */
(function (M) {

  var W = M.SCREEN_W;
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
      var a = h.t < 0.3 ? h.t / 0.3 : (h.t > h.dur - 0.6 ? (h.dur - h.t) / 0.6 : 1);
      ctx.globalAlpha = a * (0.75 + Math.sin(t * 4) * 0.15);
      F.drawCentered(ctx, h.text, W / 2, M.VIEW_H - 50, M.C.BONE2);
      ctx.globalAlpha = 1;
    },

    /* ---------- HUD inferior ---------- */
    drawHUD: function (ctx, game, t) {
      var y0 = M.SCREEN_H - M.HUD_H;
      ctx.fillStyle = M.PAL[M.C.VDARK];
      ctx.fillRect(0, y0, W, M.HUD_H);
      ctx.fillStyle = M.PAL[M.C.PURP];
      ctx.fillRect(0, y0, W, 1);
      ctx.fillStyle = M.PAL[M.C.BLACK];
      ctx.fillRect(0, y0 + 1, W, 1);

      var Spr = M.Spr, i;

      // corazones de vida (5)
      for (i = 0; i < 5; i++) {
        var sp = i < game.hearts ? Spr.S.heartFull : Spr.S.heartEmpty;
        Spr.draw(ctx, sp, 6 + i * 10, y0 + 5);
      }

      // barra NEXUS CUM NUMINE
      var labelColor = game.nexusFlag > 0 ? M.C.LCRIM : M.C.MAG;
      F.drawCentered(ctx, 'NEXUS CUM NUMINE', 165, y0 + 4, labelColor);
      var segs = 20, segW = 5, barX = 116, barY = y0 + 15;
      for (i = 0; i < segs; i++) {
        var filled = game.nexus >= ((i + 1) * 5) - 0.01;
        var partial = !filled && game.nexus > i * 5;
        ctx.fillStyle = M.PAL[filled ? ((i % 2) ? M.C.LMAG : M.C.MAG) : M.C.DARK];
        ctx.fillRect(barX + i * segW, barY, 4, 6);
        if (partial) {
          ctx.fillStyle = M.PAL[M.C.PURP];
          ctx.fillRect(barX + i * segW, barY + 3, 4, 3);
        }
      }
      ctx.strokeStyle = M.PAL[M.C.DPURP];
      ctx.strokeRect(barX - 1.5, barY - 1.5, segs * segW + 2, 9);
      F.draw(ctx, Math.min(100, Math.round(game.nexus)) + '%', barX + segs * segW + 5, barY, M.C.BONE2);

      // contadores de objetos: velas y libro
      var cf = (Math.floor(t * 5) % 2 === 0) ? Spr.S.candle_a : Spr.S.candle_b;
      Spr.draw(ctx, cf, 238, y0 + 6);
      F.draw(ctx, game.candles + '/' + game.candlesMax, 247, y0 + 12, M.C.LORAN);
      Spr.draw(ctx, Spr.S.bookA, 276, y0 + 12);
      F.draw(ctx, '' + game.book, 288, y0 + 12, M.C.BONE2);

      // silencio
      if (M.Audio.muted) {
        F.draw(ctx, 'M', 305, y0 + 4, M.C.BONE2);
        ctx.fillStyle = M.PAL[M.C.CRIM];
        ctx.fillRect(304, y0 + 7, 7, 1);
      }
    }
  };

  M.UI = UI;
})(window.MISTICAS);
