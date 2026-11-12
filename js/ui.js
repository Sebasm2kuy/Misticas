'use strict';
/* ============================================================
   MÍSTICAS — (C) 1987 — js/ui.js
   La máscara del cartucho: HUD inferior FIJO (corazones, velas,
   NEXUS), caja de texto de narrativa con borde de 2 px (como
   los RPG de 1987), pistas breves, cartelas de escena y PAUSA.
   Todo son rectángulos sólidos y filetes de píxel: aquí tampoco
   hay ni un degradado ni una sombra difusa.
   ============================================================ */
(function (M) {

  var F = M.Font;

  var UI = {
    dialog: null,     // {who, text, shown, done, latin}
    hint: null,       // {text, t}
    card: null,       // {scene, title, sub, t, hold}

    /* ---------- caja de texto ---------- */
    say: function (who, text, opts) {
      opts = opts || {};
      // parte en líneas de 38 caracteres
      var words = String(text).split(' ');
      var lines = [], cur = '';
      for (var i = 0; i < words.length; i++) {
        if ((cur + ' ' + words[i]).trim().length > 38) {
          lines.push(cur.trim()); cur = words[i];
        } else cur += ' ' + words[i];
      }
      if (cur.trim()) lines.push(cur.trim());
      this.dialog = {
        who: who || null, lines: lines, shown: 0,
        total: String(text).length, latin: !!opts.latin
      };
    },

    dialogActive: function () { return !!this.dialog; },

    updateDialog: function (dt) {
      var d = this.dialog;
      if (!d) return;
      if (d.shown < d.total) {
        var before = Math.floor(d.shown);
        d.shown = Math.min(d.total, d.shown + dt * 34);
        if (Math.floor(d.shown) > before && Math.floor(d.shown) % 3 === 0) {
          M.Audio.sfx.blip();
        }
        return;
      }
      // texto completo: espera FUEGO para cerrar
      if (M.Input.hit('fire') || M.Input.hitAny()) {
        this.dialog = null;
      }
    },

    drawDialog: function (ctx) {
      var d = this.dialog;
      if (!d) return;
      var W = M.SCREEN_W;
      var boxY = M.VIEW_H - 58;
      var boxH = 58;

      // panel negro sólido con marco blanco de 2 px y filete violeta
      ctx.fillStyle = M.PAL[M.C.BLACK];
      ctx.fillRect(4, boxY, W - 8, boxH);
      ctx.fillStyle = M.PAL[M.C.WHITE];
      ctx.fillRect(4, boxY, W - 8, 2);
      ctx.fillRect(4, boxY + boxH - 2, W - 8, 2);
      ctx.fillRect(4, boxY, 2, boxH);
      ctx.fillRect(W - 6, boxY, 2, boxH);
      ctx.fillStyle = M.PAL[M.C.DPURPLE];
      ctx.fillRect(7, boxY + 3, W - 14, 1);
      ctx.fillRect(7, boxY + boxH - 4, W - 14, 1);

      // hablante
      var ty = boxY + 7;
      if (d.who) {
        F.draw(ctx, d.who, 12, ty, M.C.MAGENTA);
        ty += 11;
      }
      // texto con máquina de escribir
      var budget = Math.floor(d.shown);
      var ink = d.latin ? M.C.PURPLE : M.C.BONE;
      for (var i = 0; i < d.lines.length && budget > 0; i++) {
        var line = d.lines[i].substring(0, budget);
        budget -= d.lines[i].length;
        F.draw(ctx, line, 12, ty, ink);
        ty += 10;
      }
      // flecha de avance (parpadeo duro)
      if (d.shown >= d.total && Math.floor(M.Game.time * 3) % 2 === 0) {
        F.draw(ctx, '▼', W - 16, boxY + boxH - 11, M.C.MAGENTA);
      }
    },

    /* ---------- pistas ---------- */
    showHint: function (text, dur) {
      this.hint = { text: text, t: dur || 3 };
    },

    updateHint: function (dt) {
      if (this.hint) {
        this.hint.t -= dt;
        if (this.hint.t <= 0) this.hint = null;
      }
    },

    drawHint: function (ctx) {
      var h = this.hint;
      if (!h) return;
      var w = Math.min(M.SCREEN_W - 12, F.measure(h.text) + 16);
      var x = Math.round(M.SCREEN_W / 2 - w / 2);
      var y = M.VIEW_H - 74;
      ctx.fillStyle = M.PAL[M.C.BLACK];
      ctx.fillRect(x, y, w, 15);
      ctx.fillStyle = M.PAL[M.C.MAGENTA];
      ctx.fillRect(x, y, w, 1); ctx.fillRect(x, y + 14, w, 1);
      ctx.fillRect(x, y, 1, 15); ctx.fillRect(x + w - 1, y, 1, 15);
      F.drawCentered(ctx, h.text, M.SCREEN_W / 2, y + 4, M.C.BONE);
    },

    /* ---------- cartelas de escena ---------- */
    showCard: function (scene, title, sub, hold) {
      this.card = { scene: scene, title: title, sub: sub, t: 0, hold: hold || 2.4 };
    },

    updateCard: function (dt) {
      if (!this.card) return true;
      this.card.t += dt;
      return this.card.t >= this.card.hold;
    },

    drawCard: function (ctx) {
      var c = this.card;
      if (!c) return;
      var W = M.SCREEN_W, H = M.SCREEN_H;
      ctx.fillStyle = M.PAL[M.C.BLACK];
      ctx.fillRect(0, 0, W, H);
      // marco doble: magenta fuera, violeta dentro
      var m = 14;
      ctx.fillStyle = M.PAL[M.C.MAGENTA];
      ctx.fillRect(m, m, W - m * 2, 2); ctx.fillRect(m, H - m - 2, W - m * 2, 2);
      ctx.fillRect(m, m, 2, H - m * 2); ctx.fillRect(W - m - 2, m, 2, H - m * 2);
      ctx.fillStyle = M.PAL[M.C.DPURPLE];
      ctx.fillRect(m + 4, m + 4, W - (m + 4) * 2, 1); ctx.fillRect(m + 4, H - m - 5, W - (m + 4) * 2, 1);
      ctx.fillRect(m + 4, m + 4, 1, H - (m + 4) * 2); ctx.fillRect(W - m - 5, m + 4, 1, H - (m + 4) * 2);

      F.drawCenteredFit(ctx, c.scene, W / 2, 86, M.C.GRAY, { spacing: 2 });
      F.drawCenteredFit(ctx, c.title, W / 2, 104, M.C.BONE, {
        scale: 2, spacing: 3, shadow: M.C.DPURPLE, shadowDx: 2, shadowDy: 2
      });
      F.drawCenteredFit(ctx, c.sub, W / 2, 130, M.C.MAGENTA, { spacing: 3 });
    },

    /* ---------- HUD inferior fijo ---------- */
    drawHUD: function (ctx, state, time) {
      var y0 = M.VIEW_H;
      var W = M.SCREEN_W;
      ctx.fillStyle = M.PAL[M.C.BLACK];
      ctx.fillRect(0, y0, W, M.HUD_H);
      // filete superior: magenta + violeta
      ctx.fillStyle = M.PAL[M.C.MAGENTA];
      ctx.fillRect(0, y0, W, 1);
      ctx.fillStyle = M.PAL[M.C.DVIOLET];
      ctx.fillRect(0, y0 + 1, W, 1);

      // corazones (5)
      for (var i = 0; i < 5; i++) {
        var name = i < state.hearts ? 'HEART' : 'HEART_EMPTY';
        M.Spr.draw(ctx, name, 5 + i * 9, y0 + 6);
      }

      // velas: iconos de llama
      var vx = 62;
      F.draw(ctx, 'VELAS', vx, y0 + 5, M.C.GRAY);
      for (var c = 0; c < state.candlesMax; c++) {
        var cx = vx + 34 + c * 9;
        if (c < state.candles) {
          // velón encendido
          ctx.fillStyle = M.PAL[M.C.WHITE];
          ctx.fillRect(cx, y0 + 9, 3, 6);
          M.Spr.drawFlame(ctx, cx - 1, y0 + 3, time, 0);
        } else {
          ctx.fillStyle = M.PAL[M.C.DGRAY];
          ctx.fillRect(cx, y0 + 9, 3, 6);
          ctx.fillStyle = M.PAL[M.C.BLACK];
          ctx.fillRect(cx, y0 + 10, 3, 4);
          ctx.fillStyle = M.PAL[M.C.DGRAY];
          ctx.fillRect(cx + 1, y0 + 8, 1, 2);
        }
      }

      // NEXUS CUM NUMINE
      var nx = Math.round(state.nexus) + '%';
      var flash = state.nexusFlag > 0 && Math.floor(time * 8) % 2 === 0;
      F.draw(ctx, 'NEXUS', 178, y0 + 5, M.C.GRAY);
      F.draw(ctx, nx, 212, y0 + 5, flash ? M.C.WHITE : M.C.MAGENTA);
    }
  };

  M.UI = UI;
})(window.MISTICAS);
