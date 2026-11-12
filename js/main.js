'use strict';
/* ============================================================
   MÍSTICAS — (C) 1987 — js/main.js
   El corazón del cartucho: bucle a 60 FPS, gestor de escenas,
   cinemáticas, daño, NEXUS, PAUSA y los efectos de "cinta
   maldita".

   NADA de alpha en todo el motor:
   - Los fundidos son SUSTITUCIÓN DE PALETA por pasos (la PPU
     apagando colores), aplicada a la tabla activa M.PAL y a los
     bancos horneados de teselas y sprites.
   - El "glitch" son bandas del propio fotograma desplazadas en
     horizontal + píxeles de estática sueltos.
   ============================================================ */
(function (M) {

  var F = M.Font;

  /* ============ EFECTOS DE CINTA MALDITA ============ */
  var FX = {
    fade: 1, fadeTarget: 0, fadeSpeed: 1.2,
    glitchT: 0, glitchI: 1,
    lightningT: 0,

    fadeTo: function (v, speed) {
      this.fadeTarget = v;
      this.fadeSpeed = speed || 1.2;
    },

    glitchNow: function (intensity, dur) {
      this.glitchI = intensity || 1;
      this.glitchT = dur || 0.2;
    },

    lightning: function () {
      this.lightningT = 0.18;
      M.Audio.sfx.thunder();
    },

    isLightning: function () { return this.lightningT > 0; },

    bank: function () {
      return Math.max(0, Math.min(M.FADESWAP.length - 1,
        Math.round(this.fade * (M.FADESWAP.length - 1))));
    },

    update: function (dt) {
      // fundido por pasos hacia el objetivo
      if (this.fade < this.fadeTarget) {
        this.fade = Math.min(this.fadeTarget, this.fade + this.fadeSpeed * dt);
      } else if (this.fade > this.fadeTarget) {
        this.fade = Math.max(this.fadeTarget, this.fade - this.fadeSpeed * dt);
      }
      if (this.glitchT > 0) this.glitchT -= dt;
      if (this.lightningT > 0) this.lightningT -= dt;
    },

    /* post-proceso sobre el fotograma terminado */
    drawOver: function (ctx, canvas) {
      var W = M.SCREEN_W, H = M.SCREEN_H;
      if (this.glitchT > 0) {
        var strips = Math.round(4 + this.glitchI * 6);
        for (var i = 0; i < strips; i++) {
          var y = Math.floor(Math.random() * H);
          var h = 1 + Math.floor(Math.random() * 5);
          var dx = Math.round((Math.random() * 2 - 1) * 7 * this.glitchI);
          ctx.drawImage(canvas, 0, y, W, h, dx, y, W, h);
        }
        var n = Math.round(30 * this.glitchI);
        for (var p = 0; p < n; p++) {
          ctx.fillStyle = M.PAL[Math.random() > 0.7 ? M.C.MAGENTA : M.C.GRAY];
          ctx.fillRect(Math.floor(Math.random() * W), Math.floor(Math.random() * H), 2, 1);
        }
      }
    }
  };
  M.FX = FX;

  /* ============ EL JUEGO ============ */
  var Game = {
    state: M.newGameState(),
    scene: null,
    sceneName: '',
    cine: { active: false, steps: null, idx: 0 },
    nexusCheckpoint: 0,
    paused: false,
    time: 0,
    canvas: null,
    ctx: null,

    init: function () {
      this.canvas = document.getElementById('game');
      this.ctx = this.canvas.getContext('2d');

      // hornea la CHR-ROM completa
      M.Tiles.init();
      M.Spr.init();

      M.Input.init();
      M.Screen.init(this.canvas);

      var self = this;
      // cualquier toque desbloquea el audio y avanza pantallas sin HUD
      document.body.addEventListener('pointerdown', function (ev) {
        M.Audio.init();
        M.Audio.resume();
        if (self.paused) {
          M.Input.anyPressed = true;
          M.Input.pressed.pause = true;
          return;
        }
        if (ev.target && ev.target.classList && ev.target.classList.contains('tbtn')) return;
        if (ev.target && ev.target.closest && ev.target.closest('#joy')) return;
        if (!self.scene || self.scene.hud === false) {
          M.Input.anyPressed = true;
          M.Input.pressed.fire = true;
        }
      });
      document.addEventListener('visibilitychange', function () {
        if (document.hidden && self.scene && self.scene.hud !== false) self.paused = true;
      });

      this.setScene('boot');

      var last = performance.now();
      function loop(now) {
        var dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        self.time += dt;
        try {
          self.update(dt);
          self.draw();
        } catch (e) {
          if (!self._errLogged) { console.error('MISTICAS:', e); self._errLogged = true; }
        }
        M.Input.endFrame();
        requestAnimationFrame(loop);
      }
      requestAnimationFrame(loop);
    },

    resetState: function () { this.state = M.newGameState(); },

    addNexus: function (n) {
      this.state.nexus = M.clamp(this.state.nexus + n, 0, 100);
      this.state.nexusFlag = 1.4;
    },

    damage: function (n) {
      this.state.hearts = Math.max(0, this.state.hearts - n);
      this.state.deaths++;
      this.state.grace = 2.6;
      if (this.state.hearts <= 0) this.setScene('gameover');
    },

    setScene: function (name, opts) {
      this.sceneName = name;
      this.cine.active = false;
      this.paused = false;
      M.UI.dialog = null;
      M.UI.hint = null;
      var sc = M.Scenes[name](this, opts || {});
      this.scene = sc;
      this.pendingEnter = true;
      M.FX.fade = 1;
      M.FX.fadeTarget = 0;
      if (sc.card) {
        M.UI.showCard(sc.card.scene, sc.card.title, sc.card.sub, sc.card.hold);
      } else {
        this._enterScene();
      }
    },

    _enterScene: function () {
      this.pendingEnter = false;
      if (this.scene.enter) this.scene.enter();
      M.FX.fadeTo(0, 1.4);
    },

    startCine: function (steps) {
      this.cine = { active: true, steps: steps, idx: 0 };
    },

    updateCine: function (dt) {
      var c = this.cine;
      if (!c.active) return;
      var guard = 0;
      while (guard++ < 60) {
        var s = c.steps[c.idx];
        if (!s) { c.active = false; return; }
        switch (s.t) {
          case 'wait':
            s.s -= dt;
            if (s.s > 0) return;
            c.idx++;
            break;
          case 'fn':
            s.f();
            c.idx++;
            break;
          case 'say':
            if (!s._started) {
              M.UI.say(s.who, s.text, { latin: s.latin });
              s._started = true;
              return;
            }
            if (M.UI.dialog) return;
            c.idx++;
            break;
          case 'until':
            if (s.f()) c.idx++;
            else return;
            break;
          case 'move': {
            var e = s.ent, sp = s.speed || 2;
            var dx = s.x - e.gx, dy = s.y - e.gy;
            var d = Math.sqrt(dx * dx + dy * dy);
            if (d < 0.08) {
              if (e.pose !== undefined) e.pose = 'stand';
              c.idx++;
              break;
            }
            var stp = Math.min(sp * dt, d);
            e.gx += (dx / d) * stp;
            e.gy += (dy / d) * stp;
            if (e.pose !== undefined) {
              e.pose = 'walk';
              e.animT += dt * 7;
              e.dir = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
            }
            return;
          }
          case 'music':
            M.Audio.playSong(s.name);
            c.idx++;
            break;
          case 'sfx':
            if (M.Audio.sfx[s.name]) M.Audio.sfx[s.name]();
            c.idx++;
            break;
          case 'fade':
            M.FX.fadeTo(s.to, s.speed || 1.2);
            c.idx++;
            break;
          case 'nexus':
            this.addNexus(s.n);
            c.idx++;
            break;
          default:
            c.idx++;
        }
      }
    },

    update: function (dt) {
      M.Audio.update();
      M.FX.update(dt);
      M.UI.updateHint(dt);
      if (this.state.nexusFlag > 0) this.state.nexusFlag -= dt;
      if (this.state.grace > 0) this.state.grace -= dt;

      // cartela de escena: el mundo espera a que se retire
      if (M.UI.card) {
        if (M.UI.updateCard(dt)) {
          M.UI.card = null;
          this._enterScene();
        }
        return;
      }

      if (this.scene && this.scene.hud !== false && M.Input.hit('pause')) {
        this.paused = !this.paused;
      }
      if (this.paused) return;
      if (M.Input.hit('mute')) M.Audio.toggleMute();

      M.UI.updateDialog(dt);
      if (this.scene && this.scene.update) this.scene.update(dt, this);
      this.updateCine(dt);
    },

    draw: function () {
      var ctx = this.ctx;
      var W = M.SCREEN_W, H = M.SCREEN_H;

      // banco de fundido -> paleta activa (afecta a TODO lo que
      // se pinta con M.PAL: texto, HUD, dibujos procedurales)
      var bank = M.FX.bank();
      M.applyPaletteSwap(M.FADESWAP[bank]);
      if (this.scene && this.scene.world) this.scene.world.fade = bank;

      ctx.fillStyle = M.PAL[M.C.BLACK];
      ctx.fillRect(0, 0, W, H);

      if (this.scene && !M.UI.card) {
        if (this.scene.draw) this.scene.draw(ctx, this);
        M.UI.drawHint(ctx);
        if (this.scene.hud !== false) {
          M.UI.drawHUD(ctx, this.state, this.time);
        }
      }

      M.UI.drawDialog(ctx);
      M.FX.drawOver(ctx, this.canvas);

      if (M.UI.card) M.UI.drawCard(ctx);

      if (this.paused) {
        // PAUSA de cartucho: panel negro SÓLIDO con marcos
        var cy = Math.round(M.SCREEN_H / 2);
        var pw = 220, ph = 72;
        var px = Math.round(W / 2 - pw / 2), py = cy - 40;
        ctx.fillStyle = M.PAL[M.C.BLACK];
        ctx.fillRect(px, py, pw, ph);
        ctx.fillStyle = M.PAL[M.C.MAGENTA];
        ctx.fillRect(px, py, pw, 1); ctx.fillRect(px, py + ph - 1, pw, 1);
        ctx.fillRect(px, py, 1, ph); ctx.fillRect(px + pw - 1, py, 1, ph);
        ctx.fillStyle = M.PAL[M.C.DPURPLE];
        ctx.fillRect(px + 2, py + 2, pw - 4, 1); ctx.fillRect(px + 2, py + ph - 3, pw - 4, 1);
        ctx.fillRect(px + 2, py + 2, 1, ph - 4); ctx.fillRect(px + pw - 3, py + 2, 1, ph - 4);
        F.drawCenteredFit(ctx, 'PAUSA', W / 2, cy - 18, M.C.MAGENTA, {
          scale: 2, shadow: M.C.DPURPLE, shadowDx: 2, shadowDy: 2
        });
        var touchMode = document.body.classList.contains('touch');
        F.drawCenteredFit(ctx, touchMode ? 'TOCA II O LA PANTALLA PARA SEGUIR' : 'P: CONTINUAR - M: SILENCIO',
          W / 2, cy + 8, M.C.GRAY);
      }

      // restaura la paleta maestra (los horneos ya tienen sus bancos)
      M.applyPaletteSwap(M.PALSWAP[1]);
    }
  };

  M.Game = Game;

  window.addEventListener('load', function () {
    Game.init();
  });
})(window.MISTICAS);
