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
      // sin HUD (arranque, portada, finales) — nadie se queda bloqueado.
      // El joystick y los botones gestionan sus propias teclas.
      document.body.addEventListener('pointerdown', function (ev) {
        M.Audio.init();
        M.Audio.resume();
        if (self.paused) {
          M.Input.anyPressed = true;
          M.Input.pressed.pause = true;
          return;
        }
        // los botones táctiles y el joystick gestionan sus propias teclas
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

    /* Viewport con letterbox 4:3 (canon de las capturas reales):
       el juego vive en un lienzo lógico FIJO de 320x240 — como el
       monitor de 1987 — y se escala a la ventana con fit-contain:
       factor entero en escritorio (nitidez 1:1), barras negras donde
       haga falta. NUNCA se estira ni se recorta: el HUD completo y
       todos los textos quedan SIEMPRE dentro del marco visible.
       En táctil, el tubo se pega a la banda superior (cero espacios
       muertos por encima) y el joystick flotante + FUEGO caen en el
       negro lateral o bajo el tubo, según dé sitio: NUNCA sobre el
       HUD ni la vista. */
    _resize: function () {
      var BW = 320, BH = 240;   // lienzo lógico fijo (4:3 exacto)
      var vw = Math.max(200, window.innerWidth);
      var vh = Math.max(150, window.innerHeight);
      var touch = document.body.classList.contains('touch') ||
        (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);

      // factor que quepa entero (fit-contain, sin estirar)
      var s0 = Math.min(vw / BW, vh / BH);

      var needT = 0, needB = 0;
      if (touch) {
        needT = M.TOUCH_TOP;   // 48: PAUSA + AUDIO
        // si las bandas laterales del letterbox dan para el joystick
        // (124 px), los controles viven en el negro lateral y el tubo
        // ocupa toda la altura restante; si no, se reserva una zona
        // inferior compacta para el stick y FUEGO
        var sideBand = (vw - BW * s0) / 2;
        needB = (sideBand < 124) ? M.TOUCH_BOTTOM_TALL : 0;
        s0 = Math.min(vw / BW, (vh - needT - needB) / BH);
      }

      var s = s0;
      // nitidez 1:1 en pantallas grandes (factor entero)
      if (s >= 2) s = Math.floor(s);
      if (s < 0.4) s = 0.4;

      var cw = Math.round(BW * s);
      var ch = Math.round(BH * s);

      // posición vertical: el bloque TUBO+HUD se pega arriba (sin
      // espacios muertos extraños) y el sobrante baja, donde viven
      // los controles; en escritorio sigue centrado
      var top;
      if (touch) {
        var freeV = Math.max(0, vh - needT - needB - ch);
        top = Math.round(needT + freeV * 0.12);
      } else {
        top = Math.round((vh - ch) / 2);
      }
      if (top < 0) top = 0;
      if (top + ch > vh) top = Math.max(0, vh - ch);
      var left = Math.round((vw - cw) / 2);

      this.canvas.style.position = 'absolute';
      this.canvas.style.left = left + 'px';
      this.canvas.style.top = top + 'px';
      this.canvas.style.width = cw + 'px';
      this.canvas.style.height = ch + 'px';

      // el lienzo lógico NUNCA cambia: 320x240, cero recortes
      this.canvas.width = BW;
      this.canvas.height = BH;
      this.ctx.imageSmoothingEnabled = false;

      M.SCREEN_W = BW;
      M.SCREEN_H = BH;
      M.VIEW_H = BH - M.HUD_H;

      // rect del tubo para colocar los controles sin pisarlo
      this._tube = { left: left, top: top, w: cw, h: ch };

      this._layoutTouch(touch);
      this._syncAudioBtn();
    },

    /* Coloca el joystick flotante y FUEGO SIEMPRE fuera del tubo:
       prefiere las bandas negras laterales del letterbox; si son
       estrechas, la zona inferior reservada. PAUSA y AUDIO siguen
       arriba. Como _resize mide el tubo real, jamás pisan el HUD. */
    _layoutTouch: function (touch) {
      if (!touch) return;   // sin táctil no hay nada que recolocar
      var vw = window.innerWidth;
      var vh = window.innerHeight;
      var sa = this._safeAreas();

      function pos(id, o) {
        var el = document.getElementById(id);
        if (!el) return;
        el.style.left = (o.left !== undefined) ? o.left + 'px' : '';
        el.style.right = (o.right !== undefined) ? o.right + 'px' : '';
        el.style.top = (o.top !== undefined) ? o.top + 'px' : '';
        el.style.bottom = (o.bottom !== undefined) ? o.bottom + 'px' : '';
      }

      // botones de sistema: banda superior
      pos('t-pause', { top: Math.max(6, sa.top), right: Math.max(10, sa.right) });
      pos('t-audio', { top: Math.max(6, sa.top), right: Math.max(10, sa.right) + 54 });

      // geometría del tubo tras el escalado
      var tube = this._tube || { left: 0, top: 0, w: vw, h: vh * 0.7 };
      var sideL = tube.left;
      var sideR = vw - (tube.left + tube.w);
      var tubeBottom = tube.top + tube.h;
      var below = vh - tubeBottom;      // negro disponible bajo el tubo

      // joystick flotante: banda lateral negra si cabe (104 px);
      // si no, bajo el tubo. Con espacio de sobra se PEGA al tubo
      // (bloque cerrado pantalla+controles, como una consola portátil);
      // si el sobrante es justo, al borde inferior (altura del pulgar)
      var joy = document.getElementById('joy');
      var jb = joy ? joy.getBoundingClientRect() : { width: 104, height: 104 };
      var jw = jb.width, jh = jb.height;
      var hug = below >= 150;
      if (joy) {
        if (sideL >= jw + 14) {
          pos('joy', { left: Math.round((sideL - jw) / 2), bottom: Math.max(16, sa.bottom + 8) });
        } else {
          var jbot = hug
            ? Math.max(6, vh - tubeBottom - jh - 8)
            : Math.max(10, sa.bottom + 4);
          pos('joy', { left: Math.max(12, sa.left + 6), bottom: jbot });
        }
      }

      // FUEGO: simétrico al joystick
      var fire = document.getElementById('t-fire');
      var fb = fire ? fire.getBoundingClientRect() : { width: 64, height: 64 };
      var fw = fb.width, fh = fb.height;
      if (fire) {
        if (sideR >= fw + 16) {
          pos('t-fire', { right: Math.round((sideR - fw) / 2), bottom: Math.max(18, sa.bottom + 10) });
        } else {
          var fbot = hug
            ? Math.max(6, vh - tubeBottom - fh - 12)
            : Math.max(14, sa.bottom + 6);
          pos('t-fire', { right: Math.max(14, sa.right + 6), bottom: fbot });
        }
      }
    },

    // márgenes seguros (móviles con muesca) en px
    _safeAreas: function () {
      var cs = getComputedStyle(document.documentElement);
      function px(name) {
        var v = parseFloat(cs.getPropertyValue(name));
        return isNaN(v) ? 0 : v;
      }
      return { top: px('--sat'), right: px('--sar'), bottom: px('--sab'), left: px('--sal') };
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
        // lema latino diagonal: solo dentro del convento (canon)
        if (this.scene.motto) M.UI.drawMotto(ctx);
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
