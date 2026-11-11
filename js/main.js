'use strict';
/* ============================================================
   MÍSTICAS — (C) 1987 — main.js
   El corazón: bucle, gestor de escenas, cinemáticas, daño,
   NEXUS, pausa y las pantallas finales (CONTINUARA / FIN).
   ============================================================ */
(function (M) {

  var F = M.Font;

  M.Scenes = M.Scenes || {};

  /* ============ CONTINUARA... + estadisticas ============ */
  M.Scenes.ending = function (game) {
    return {
      hud: false,
      t: 0,

      enter: function () {
        M.FX.fade = 1;
        M.FX.fadeTo(0, 0.9);
        M.Audio.wind(false);
      },

      update: function (dt) {
        this.t += dt;
        if (this.t > 1.2 && (M.Input.hitAny() || M.Input.hit('fire'))) {
          game.setScene('title');
        }
      },

      draw: function (ctx) {
        var W = M.SCREEN_W, H = M.SCREEN_H;
        // posiciones proporcionales a la resolución real del lienzo
        function y(v) { return Math.round(v * H / 200); }
        if (this.t < 3.2) {
          ctx.globalAlpha = 0.72 + Math.sin(this.t * 5) * 0.28;
          F.drawCenteredFit(ctx, 'CONTINUARA...', W / 2, y(74), M.C.BONE, {
            scale: 2, spacing: 4, shadow: M.C.DPURP, shadowDx: 2, shadowDy: 2, jitter: 1
          });
          ctx.globalAlpha = 1;
          F.drawCenteredFit(ctx, 'MISTICAS - ' + M.VERSION, W / 2, y(108), M.C.BONE2);
        } else {
          var st = game.state;
          var secs = Math.max(0, Math.floor((performance.now() - st.startTime) / 1000));
          var mm = ('0' + Math.floor(secs / 60)).slice(-2);
          var ss = ('0' + (secs % 60)).slice(-2);

          F.drawCenteredFit(ctx, 'PRIMERA NOCHE SUPERADA', W / 2, y(34), M.C.LMAG, { spacing: 1 });
          F.drawCentered(ctx, '·', W / 2, y(48), M.C.DPURP);
          F.drawCenteredFit(ctx, 'CORAZONES: ' + st.hearts + '/5', W / 2, y(62), M.C.BONE);
          F.drawCenteredFit(ctx, 'VELAS: ' + st.candles + '/3', W / 2, y(76), M.C.LORAN);
          F.drawCenteredFit(ctx, 'TIEMPO: ' + mm + ':' + ss, W / 2, y(90), M.C.BONE);
          F.drawCenteredFit(ctx, 'NEXUS CUM NUMINE: ' + Math.round(st.nexus) + '%', W / 2, y(104), M.C.MAG);
          F.drawCentered(ctx, '·', W / 2, y(118), M.C.DPURP);
          if (Math.sin(this.t * 3.2) > -0.2) {
            F.drawCenteredFit(ctx, 'PULSA UNA TECLA', W / 2, y(138), M.C.BONE2);
          }
          F.drawCenteredFit(ctx, 'ELLA TE ESPERA EN LA SIGUIENTE NOCHE', W / 2, y(168), M.C.CRIM);
        }
      }
    };
  };

  /* ============ GAME OVER ============ */
  M.Scenes.gameover = function (game) {
    return {
      hud: false,
      t: 0,
      faceT: 0,
      faceTimer: 2.6,

      enter: function () {
        M.Audio.stopMusic();
        M.FX.glitchNow(1.4, 0.5);
        M.Audio.sfx.alarm();
      },

      update: function (dt) {
        this.t += dt;
        if (this.faceT > 0) this.faceT -= dt;
        this.faceTimer -= dt;
        if (this.faceTimer <= 0) {
          this.faceTimer = 3 + Math.random() * 3;
          this.faceT = 0.09;
          M.Audio.sfx.staticBurst();
        }
        if (this.t > 1.2 && (M.Input.hitAny() || M.Input.hit('fire'))) {
          game.state.hearts = 5;
          game.state.candles = 0;
          game.state.nexus = game.nexusCheckpoint;
          game.setScene('convent', { skipIntro: true });
        }
      },

      draw: function (ctx) {
        var W = M.SCREEN_W, H = M.SCREEN_H;
        function y(v) { return Math.round(v * H / 200); }
        M.FX.drawStatic(ctx, 0.5);
        if (this.faceT > 0) {
          M.Spr.drawFace(ctx, W / 2, y(88));
        } else {
          F.drawCenteredFit(ctx, 'TE HAN VISTO', W / 2, y(58), M.C.LCRIM, {
            scale: 2, shadow: M.C.BLOOD, shadowDx: 2, shadowDy: 2, jitter: 1
          });
          F.drawCenteredFit(ctx, 'EL CONVENTO TE RECLAMA', W / 2, y(92), M.C.CRIM);
          F.drawCenteredFit(ctx, 'CORAZONES: 0/5', W / 2, y(116), M.C.BONE2);
        }
        if (Math.sin(this.t * 3) > -0.2) {
          F.drawCenteredFit(ctx, 'PULSA UNA TECLA PARA VOLVER A INTENTARLO', W / 2, y(142), M.C.BONE);
        }
      }
    };
  };

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
    _raf: 0,

    init: function () {
      this.canvas = document.getElementById('game');
      this.ctx = this.canvas.getContext('2d');
      this.ctx.imageSmoothingEnabled = false;

      M.Input.init();
      M.UI.init();
      M.FX.init();
      M.Entities.init();
      M.Spr.preload();

      var self = this;
      window.addEventListener('resize', function () { self._resize(); });
      window.addEventListener('orientationchange', function () {
        setTimeout(function () { self._resize(); }, 60);
      });
      this.canvas.addEventListener('mousedown', function () {
        M.Audio.init();
        M.Audio.resume();
        if (self.paused) {
          // tocando la pantalla en pausa se reanuda
          M.Input.anyPressed = true;
          M.Input.pressed.pause = true;
          return;
        }
        M.Input.anyPressed = true;
        M.Input.pressed.fire = true;
      });
      // reanudar también con pointerdown sobre el monitor (móvil)
      var crt = document.getElementById('crt');
      if (crt) {
        crt.addEventListener('pointerdown', function () {
          M.Audio.init();
          M.Audio.resume();
          if (self.paused) {
            M.Input.anyPressed = true;
            M.Input.pressed.pause = true;
          }
        });
      }
      // en móvil, cualquier toque sobre la página avanza las pantallas
      // sin HUD (arranque, portada, finales) — nadie se queda bloqueado
      document.body.addEventListener('pointerdown', function (ev) {
        M.Audio.init();
        M.Audio.resume();
        if (self.paused) {
          M.Input.anyPressed = true;
          M.Input.pressed.pause = true;
          return;
        }
        // los botones táctiles gestionan sus propias teclas
        if (ev.target && ev.target.classList && ev.target.classList.contains('tbtn')) return;
        if (!self.scene || self.scene.hud === false) {
          M.Input.anyPressed = true;
          M.Input.pressed.fire = true;
        }
      });
      document.addEventListener('visibilitychange', function () {
        if (document.hidden && self.scene && self.scene.hud !== false) self.paused = true;
      });

      this._resize();
      window.focus();
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
          // el juego maldito no debe morir por un fotograma corrupto
          if (!self._errLogged) { console.error('MISTICAS:', e); self._errLogged = true; }
        }
        M.Input.endFrame();
        requestAnimationFrame(loop);
      }
      requestAnimationFrame(loop);
    },

    /* Pantalla completa real, sin cajita:
       - Escritorio: factor de pixel ENTERO (nitidez 1:1) y la
         resolución interna del lienzo se EXTIEDE para cubrir el
         100% del monitor (la cámara simplemente muestra más mundo).
       - Móvil horizontal: escala fraccional que aprovecha todo el
         ancho/alto útil sin recortes ni distorsión.
       - Móvil VERTICAL: el alto interno es el alto máximo del mundo
         (320) y el ancho interno se estrecha: la cámara sigue al
         jugador y el tubo queda a sangre completa (100% x 100%)
         con píxel gordo auténtico. Solo en ventanas ultra estrechas
         quedan bandas mínimas. */
    _resize: function () {
      var BASE_W = 320, BASE_H = 200;
      var MAX_W = 512, MAX_H = 320;   // límites del motor (tamaño de mapas)
      var vw = Math.max(240, window.innerWidth);
      var vh = Math.max(160, window.innerHeight);

      var s, cw, ch;

      if (vh > vw * 1.15) {
        // ---- retrato: llenar el 100% del alto con el mundo completo ----
        s = vh / MAX_H;
        cw = Math.ceil(vw / s);
        if (cw < M.MIN_VIEW_W) {
          // ventana ultra estrecha: mantener el suelo legible y
          // bajar el factor para no recortar el ancho
          cw = M.MIN_VIEW_W;
          s = vw / cw;
        }
        ch = MAX_H;
        if (cw > MAX_W) cw = MAX_W;
      } else {
        // ---- escritorio / landscape ----
        // factor de píxel: entero y grande en escritorio; en pantallas
        // pequeñas (móvil) fraccional para llenar toda la pantalla
        s = Math.min(vw / BASE_W, vh / BASE_H);
        if (s >= 2) s = Math.floor(s);
        if (s < 0.75) s = 0.75;

        // resolución interna que cubre toda la ventana con ese factor
        var wantW = Math.ceil(vw / s);
        var wantH = Math.ceil(vh / s);
        cw = Math.min(wantW, MAX_W);
        ch = Math.min(wantH, MAX_H);
      }

      // CSS al 100% salvo cuando el límite interno recorta
      var cssW = Math.min(vw, Math.round(cw * s));
      var cssH = Math.min(vh, Math.round(ch * s));

      this.canvas.width = cw;
      this.canvas.height = ch;
      this.canvas.style.width = cssW + 'px';
      this.canvas.style.height = cssH + 'px';
      this.ctx.imageSmoothingEnabled = false;

      // el motor entero dibuja con estas dimensiones en vivo
      M.SCREEN_W = cw;
      M.SCREEN_H = ch;
      M.VIEW_H = ch - M.HUD_H;

      this._syncAudioBtn();
    },

    // refleja el estado de silencio en el botón táctil de audio
    _syncAudioBtn: function () {
      var b = document.getElementById('t-audio');
      if (b) b.classList.toggle('muted', !!M.Audio.muted);
    },

    resetState: function () {
      this.state = M.newGameState();
    },

    addNexus: function (n) {
      this.state.nexus = M.clamp(this.state.nexus + n, 0, 100);
      this.state.nexusFlag = 1.4;
    },

    damage: function (n) {
      this.state.hearts = Math.max(0, this.state.hearts - n);
      this.state.deaths++;
      this.state.grace = 2.6;
      if (this.state.hearts <= 0) {
        this.setScene('gameover');
      }
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
      M.FX.letterbox = 0;
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
            if (d < 0.08) { c.idx++; break; }
            var stp = Math.min(sp * dt, d);
            e.gx += (dx / d) * stp;
            e.gy += (dy / d) * stp;
            if (e.pose !== undefined) {
              e.pose = 'walk';
              e.animT += dt * 7;
              e.dir = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'E' : 'W') : (dy > 0 ? 'S' : 'N');
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
            M.FX.fadeTo(s.to, s.speed || 1.2, null);
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

      // cartela de escena: el mundo espera
      if (M.UI.card) {
        if (M.UI.updateCard(dt)) this._enterScene();
        return;
      }

      if (this.scene && this.scene.hud !== false && M.Input.hit('pause')) {
        this.paused = !this.paused;
      }
      if (this.paused) return;
      if (M.Input.hit('mute')) { M.Audio.toggleMute(); this._syncAudioBtn(); }

      M.UI.updateDialog(dt);
      if (this.scene && this.scene.update) this.scene.update(dt, this);
      this.updateCine(dt);
    },

    draw: function () {
      var ctx = this.ctx;
      var W = M.SCREEN_W, H = M.SCREEN_H;
      ctx.fillStyle = M.PAL[M.C.BLACK];
      ctx.fillRect(0, 0, W, H);

      if (this.scene && !M.UI.card) {
        if (this.scene.draw) this.scene.draw(ctx, this);
        M.UI.drawHint(ctx, this.time);
        if (this.scene.hud !== false) {
          M.UI.drawHUD(ctx, this.state, this.time);
        }
      }

      M.UI.drawDialog(ctx, this.time);
      M.FX.drawOver(ctx, this.canvas);

      if (M.UI.card) M.UI.drawCard(ctx);

      if (this.paused) {
        ctx.globalAlpha = 0.75;
        ctx.fillStyle = M.PAL[M.C.BLACK];
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
        var cy = Math.round(M.VIEW_H / 2);
        F.drawCenteredFit(ctx, 'PAUSA', W / 2, cy - 12, M.C.LMAG, { scale: 2, shadow: M.C.PURP, shadowDx: 2, shadowDy: 2 });
        var touchMode = document.body.classList.contains('touch');
        F.drawCenteredFit(ctx, touchMode ? 'TOCA II O LA PANTALLA PARA SEGUIR' : 'P: CONTINUAR - M: SILENCIO', W / 2, cy + 14, M.C.BONE2);
        F.drawCenteredFit(ctx, touchMode ? 'EL BOTON ♪ SILENCIA EL AUDIO' : '', W / 2, cy + 28, M.C.CRIM);
      }
    }
  };

  M.Game = Game;

  window.addEventListener('load', function () {
    Game.init();
  });
})(window.MISTICAS);
