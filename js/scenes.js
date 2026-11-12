'use strict';
/* ============================================================
   MÍSTICAS — (C) 1987 — js/scenes.js
   EL JUEGO — las 8 pantallas del cartucho, con la narrativa de
   la audioserie MISTICAS (fase 1: EL INICIO) intacta:

     boot ........ el equipo de 1987 arranca y carga la cinta
     title ....... la portada maldita (ella mira de vuelta)
     tree ........ ESCENA 1 - EL ARBOL (INITIUM)
     cemetery .... ESCENA 2 - EL CAMPO SANTO (TRANSITUS)
     conventext .. ESCENA 3 - EL CONVENTO (ADITUS OCCULTUS)
     convent ..... ESCENA 4 - LOS PASILLOS (SILENTIUM)
     ending ...... CONTINUARA... + estadisticas
     gameover .... TE HAN VISTO

   Cada escena de mundo es un DIORAMA CERRADO: muros de ladrillo
   violeta, arcos góticos, suelos de lajas y luz por registros.
   ============================================================ */
(function (M) {

  var F = M.Font;
  var C = M.C;
  M.Scenes = M.Scenes || {};

  /* ============================================================
     ARRANQUE: monitor + cinta
     ============================================================ */
  M.Scenes.boot = function (game) {
    var LINES = [
      'MISTICAS 64K - MONITOR PREPARADO',
      '(C) ' + M.YEAR + ' - AUTOR DESCONOCIDO',
      'CINTA 1 DE 1 ENCONTRADA'
    ];
    return {
      hud: false,
      phase: 0, t: 0, li: 0, ci: 0, lineT: 0,
      loadT: 0, loadDur: 4.4, tapeT: 0, glitchT: 0,

      enter: function () {
        M.Audio.stopMusic();
        M.Audio.wind(false);
      },

      update: function (dt) {
        this.t += dt;
        if (this.phase === 0) {
          if (M.Input.hitAny() || M.Input.hit('fire')) {
            M.Audio.init(); M.Audio.resume(); M.Audio.startHum();
            M.Audio.sfx.typeKey();
            this.phase = 1; this.ci = 0; this.li = 0; this.lineT = 0;
          }
        } else if (this.phase === 1) {
          this.ci += dt * 30;
          if (Math.floor(this.ci) > (this._lb || 0)) {
            this._lb = Math.floor(this.ci);
            M.Audio.sfx.typeKey();
          }
          var line = LINES[this.li];
          if (this.ci >= line.length) {
            this.lineT += dt;
            if (this.lineT > 0.4) {
              this.lineT = 0; this.ci = 0; this._lb = 0; this.li++;
              if (this.li >= LINES.length) { this.phase = 2; this.t = 0; }
            }
          }
        } else if (this.phase === 2) {
          if (this.t > 2.2) {
            this.phase = 3; this.t = 0; this.loadT = 0;
            M.Audio.sfx.tapePilot(); this.tapeT = 1.5;
          }
        } else if (this.phase === 3) {
          this.loadT += dt; this.tapeT -= dt;
          if (this.tapeT <= 0) { this.tapeT = 1.4; M.Audio.sfx.tapeData(); }
          this.glitchT -= dt;
          if (this.glitchT <= 0) {
            this.glitchT = 0.9 + Math.random() * 0.8;
            M.FX.glitchNow(0.4, 0.12);
            M.Audio.sfx.staticBurst();
          }
          if (this.loadT >= this.loadDur) {
            this.phase = 4; this.t = 0;
            M.FX.glitchNow(1.6, 0.5);
            M.Audio.sfx.staticBurst();
          }
        } else if (this.phase === 4) {
          if (this.t > 0.35) game.setScene('title');
        }
      },

      draw: function (ctx) {
        var W = M.SCREEN_W, cx = W / 2;
        if (this.phase >= 1) {
          for (var i = 0; i < LINES.length; i++) {
            if (i > this.li) break;
            var shown = (i < this.li) ? LINES[i] : LINES[i].substring(0, Math.floor(this.ci));
            if (shown) F.draw(ctx, shown, 22, 26 + i * 12, C.BONE);
          }
        }
        if (this.phase === 0) {
          if (Math.sin(this.t * 4) > -0.3) {
            F.drawCenteredFit(ctx, 'PULSA UNA TECLA O HAZ CLIC', cx, 108, C.MAGENTA);
          }
          F.drawCenteredFit(ctx, 'MISTICAS (C) ' + M.YEAR, cx, 160, C.DGRAY);
          F.drawCenteredFit(ctx, 'ESTE PROGRAMA CONTIENE LUZ INTERMITENTE', cx, 176, C.GRAY);
        }
        if (this.phase === 2 && Math.sin(this.t * 6) > -0.2) {
          F.drawCenteredFit(ctx, 'PULSA PLAY EN LA CINTA', cx, 108, C.ORANGE);
        }
        if (this.phase === 3) {
          F.drawCenteredFit(ctx, 'CARGANDO MISTICAS...', cx, 96, C.BONE);
          F.drawCenteredFit(ctx, 'NO APAGUES EL EQUIPO', cx, 110, C.GRAY);
          var n = 16, bw = 8, total = n * (bw + 2);
          var x0 = Math.round(cx - total / 2);
          var filled = Math.floor((this.loadT / this.loadDur) * n);
          for (var b = 0; b < n; b++) {
            if (b < filled) {
              ctx.fillStyle = M.PAL[(b % 2) ? C.MAGENTA : C.PURPLE];
              ctx.fillRect(x0 + b * (bw + 2), 138, bw, 9);
            } else {
              ctx.fillStyle = M.PAL[C.DGRAY];
              ctx.fillRect(x0 + b * (bw + 2), 138, bw, 1);
              ctx.fillRect(x0 + b * (bw + 2), 146, bw, 1);
              ctx.fillRect(x0 + b * (bw + 2), 138, 1, 9);
              ctx.fillRect(x0 + b * (bw + 2) + bw - 1, 138, 1, 9);
            }
          }
          F.drawCentered(ctx, Math.floor((this.loadT / this.loadDur) * 100) + '%', cx, 158, C.GRAY);
          M.Spr.drawTape(ctx, cx, 186, this.t);
        }
      }
    };
  };

  /* ============================================================
     PORTADA
     ============================================================ */
  M.Scenes.title = function (game) {
    return {
      hud: false,
      t: 0, faceT: 0, faceTimer: 7 + Math.random() * 5, flick: 0,

      enter: function () {
        M.Audio.playSong('title');
        M.Audio.wind(true);
      },

      update: function (dt) {
        this.t += dt;
        this.flick -= dt;
        if (this.flick < -3 && Math.random() < 0.008) this.flick = 0.09;
        if (this.faceT > 0) {
          this.faceT -= dt;
          if (this.faceT <= 0) M.FX.glitchNow(0.8, 0.16);
        } else {
          this.faceTimer -= dt;
          if (this.faceTimer <= 0) {
            this.faceTimer = 9 + Math.random() * 8;
            this.faceT = 0.1;
            M.Audio.sfx.staticBurst();
          }
        }
        if (this.t > 0.6 && (M.Input.hitAny() || M.Input.hit('fire'))) {
          M.Audio.init();
          M.Audio.sfx.chime();
          M.FX.glitchNow(1.2, 0.3);
          game.resetState();
          game.setScene('tree');
        }
      },

      draw: function (ctx) {
        var t = this.t;
        var W = M.SCREEN_W, cx = Math.round(W / 2);

        // cielo negro absoluto + estrellas duras
        for (var s = 0; s < 34; s++) {
          var hx = M.hash(s, 11), hy = M.hash(s, 29);
          var sx = Math.floor(hx * W), sy = Math.floor(hy * 130);
          var on = Math.sin(t * (0.6 + hx * 2) + s) > -0.3;
          M.Spr.drawStar(ctx, sx, sy, hx > 0.9, on);
        }
        // la luna (arriba a la derecha, sobre el convento)
        M.Spr.drawMoon(ctx, 230, 30, 11);

        // suelo en dos bandas planas
        ctx.fillStyle = M.PAL[C.DVIOLET];
        ctx.fillRect(0, 158, W, 38);
        ctx.fillStyle = M.PAL[C.BLACK];
        ctx.fillRect(0, 196, W, 44);
        // matas de hierba
        for (var g = 0; g < 22; g++) {
          var gx = (g * 37 + 11) % (W - 4);
          var gy = 162 + ((g * 23) % 28);
          ctx.fillStyle = M.PAL[(g % 3) ? C.DVIOLET : C.DPURPLE];
          ctx.fillRect(gx, gy, 3, 2);
        }

        // el gran árbol a la izquierda
        M.Spr.drawBigTree(ctx, 6, 36, t);
        // el convento a la derecha
        M.Spr.drawConventSil(ctx, 154, 62);

        // el destello: ella mira de vuelta
        if (this.faceT > 0) M.Spr.drawFace(ctx, cx, 96);

        // LOGO
        var logoColor = this.flick > 0 ? C.RED : C.MAGENTA;
        F.drawCenteredFit(ctx, 'MISTICAS', cx, 30, logoColor, {
          scale: 3, shadow: C.CRIMSON, shadowDx: 2, shadowDy: 2, spacing: 3
        });
        F.drawCenteredFit(ctx, 'UN JUEGO MALDITO', cx, 58, C.GRAY, { spacing: 1 });

        if (Math.sin(this.t * 3.4) > -0.25) {
          F.drawCenteredFit(ctx, 'PULSA UNA TECLA PARA COMENZAR', cx, 150, C.BONE);
        }
        F.drawCenteredFit(ctx, '(C) ' + M.YEAR + ' - TODOS LOS RITOS RESERVADOS', cx, 208, C.DGRAY);
      }
    };
  };

  /* ============================================================
     ESCENA 1 - EL ARBOL (INITIUM)
     ============================================================ */
  M.Scenes.tree = function (game) {
    var world = new M.WorldScene({
      room: {
        id: 'tree', ambient: 1, wallH: 8, floor: 'grass', seed: 3,
        gates: [
          { tx: 22, w: 5, kind: 'arch', moon: true }
        ],
        paths: [{ x0: 21, x1: 23, y0: 8, y1: 17 }],
        props: [
          { kind: 'BIGTREE', tx: 3, ty: 15, size: 4, solid: true },
          { kind: 'DEADTREE', tx: 27, ty: 16, size: 1, solid: true }
        ],
        lights: []
      },
      playerStart: { x: 6, y: 17 },
      girl: {
        x: 19, y: 13, startState: 'hidden',
        waypoints: [{ x: 17, y: 11 }, { x: 22, y: 11 }, { x: 22, y: 9 }]
      }
    });
    world.bats.push(new M.Bat(9, 4.5, 26, 5, 0));
    world.bats.push(new M.Bat(14, 3.5, 30, 7, 2.4));

    var scene = {
      world: world,
      card: { scene: 'ESCENA 1', title: 'EL ARBOL', sub: 'INITIUM', hold: 2.4 },
      exitReady: false, ledHint: false, bellT: 2.0,

      enter: function () {
        var g = this.world;
        g.player.pose = 'sit';
        g.control = false;
        M.Audio.playSong('tree');
        M.Audio.wind(true);
        game.state.startTime = performance.now();

        game.startCine([
          { t: 'wait', s: 1.4 },
          { t: 'sfx', name: 'bell' },
          { t: 'say', who: null, text: 'LAS AFUERAS DEL PUEBLO. EL SOL SE APAGA.' },
          { t: 'say', who: null, text: 'UN NIÑO LEE AJENO AL FRIO.' },
          { t: 'fn', f: function () { M.Audio.sfx.page(); } },
          { t: 'wait', s: 0.8 },
          {
            t: 'fn', f: function () {
              g.girl.state = 'script';
              g.girl.scriptTarget = { x: 17, y: 14 };
              M.Audio.sfx.chime();
            }
          },
          { t: 'wait', s: 1.6 },
          { t: 'say', who: null, text: 'ALGUIEN VESTIDA DE BLANCO LO OBSERVA.' },
          { t: 'say', who: null, text: 'NO LLEVA GUANTES.' },
          { t: 'fn', f: function () { g.girl.state = 'wait'; g.girl.waveT = 0.9; } },
          { t: 'wait', s: 1.5 },
          { t: 'say', who: null, text: 'LE HACE UNA SEÑA: VEN.' },
          { t: 'nexus', n: 10 },
          { t: 'fn', f: function () { g.player.pose = 'stand'; M.Audio.sfx.whoosh(); } },
          { t: 'wait', s: 0.7 },
          { t: 'say', who: null, text: 'ELLA SE ALEJA HACIA EL CAMPO SANTO...' },
          {
            t: 'fn', f: function () {
              g.girl.state = 'go';
              game.addNexus(5);
            }
          },
          {
            t: 'fn', f: function () {
              g.control = true;
              var touchMode = document.body.classList.contains('touch');
              M.UI.showHint(touchMode
                ? 'ARRASTRA LA BOLA PARA MOVERTE. NO LA PIERDAS DE VISTA'
                : 'FLECHAS O WASD: MUEVETE - NO LA PIERDAS DE VISTA', 6.5);
            }
          }
        ]);
      },

      update: function (dt) {
        var g = this.world;
        g.update(dt, game);

        this.bellT -= dt;
        if (this.bellT <= 0) { this.bellT = 16 + Math.random() * 14; M.Audio.sfx.bell(true); }

        if (g.girl && g.girl.state === 'wait' && !this.ledHint) {
          if (M.dist(g.girl.gx, g.girl.gy, g.player.gx, g.player.gy) > 5) {
            this.ledHint = true;
            M.UI.showHint('ELLA TE ESPERA. NO TE DEMORES.', 3.5);
          }
        }

        if (g.control && !this.exitReady &&
          M.dist(g.player.gx, g.player.gy, 22, 9) < 1.25) {
          if (g.girl.wp >= g.girl.waypoints.length - 1) {
            this.exitReady = true;
            game.addNexus(10);
            M.FX.glitchNow(1, 0.35);
            game.setScene('cemetery');
          } else if (!M.UI.hint && !M.UI.dialog) {
            M.UI.showHint('ESPERA A ELLA. NO CONOCES EL CAMINO.', 3);
          }
        }
      },

      draw: function (ctx) { this.world.draw(ctx); }
    };
    return scene;
  };

  /* ============================================================
     ESCENA 2 - EL CAMPO SANTO (TRANSITUS)
     ============================================================ */
  M.Scenes.cemetery = function (game) {
    var world = new M.WorldScene({
      room: {
        id: 'cemetery', ambient: 1, wallH: 8, floor: 'dirt', seed: 7,
        gates: [
          { tx: 5, w: 5, kind: 'gate' },
          { tx: 26, w: 5, kind: 'arch', moon: true }
        ],
        paths: [
          { x0: 4, x1: 6, y0: 8, y1: 18 },
          { x0: 5, x1: 26, y0: 18, y1: 18 },
          { x0: 25, x1: 27, y0: 8, y1: 18 }
        ],
        props: [
          { kind: 'TOMB_CROSS', tx: 9, ty: 12, size: 1, solid: true },
          { kind: 'TOMB_ROUND', tx: 14, ty: 10, size: 1, solid: true },
          { kind: 'TOMB_CROSS', tx: 20, ty: 12, size: 1, solid: true },
          { kind: 'TOMB_BROKEN', tx: 25, ty: 15, size: 1, solid: true },
          { kind: 'TOMB_ROUND', tx: 10, ty: 18, size: 1, solid: true },
          { kind: 'TOMB_CROSS', tx: 16, ty: 20, size: 1, solid: true },
          { kind: 'TOMB_ROUND', tx: 22, ty: 21, size: 1, solid: true },
          { kind: 'SKULL', tx: 13, ty: 15, size: 1 },
          { kind: 'BONES', tx: 24, ty: 13, size: 1 }
        ]
      },
      playerStart: { x: 5, y: 16 },
      girl: {
        x: 5, y: 14, startState: 'go',
        waypoints: [
          { x: 5, y: 12 }, { x: 12, y: 12 }, { x: 20, y: 12 },
          { x: 26, y: 12 }, { x: 26, y: 9.4 }
        ]
      }
    });
    world.bats.push(new M.Bat(16, 4, 40, 6, 1.1));

    var scene = {
      world: world,
      card: { scene: 'ESCENA 2', title: 'EL CAMPO SANTO', sub: 'TRANSITUS', hold: 2.4 },
      lightningT: 5 + Math.random() * 5,
      scareT: 0, girlHome: null, exitReady: false, latinDone: false, introDone: false,

      enter: function () {
        var self = this;
        var g = this.world;
        g.control = false;
        M.Audio.playSong('cemetery');
        M.Audio.wind(true);

        // la inscripción en latín
        g.interactables.push({
          x: 14, y: 11.4, r: 1.6, hint: 'FUEGO: LEER LA INSCRIPCION', once: true,
          fn: function () {
            if (self.latinDone) return;
            self.latinDone = true;
            game.addNexus(10);
            M.UI.say('INSCRIPCION', 'UT COR SANCTAE ATTINGAS EIUS OCULIS SPECTA', { latin: true });
          }
        });

        var hints = [
          [9.6, 13, 'DORMIDA. NO MUERTA.'],
          [20.6, 13, 'AQUI YACE QUIEN MIRO DEMASIADO.'],
          [10.6, 19, 'NO ERA SU HORA.'],
          [16.6, 21, 'D.D. 1987'],
          [22.6, 22, 'REZA POR ELLA.']
        ];
        for (var i = 0; i < hints.length; i++) {
          (function (h) {
            world.triggers.push({
              x: h[0], y: h[1], r: 1.5, once: true,
              fn: function () { M.UI.showHint(h[2], 3.2); M.Audio.sfx.blip(); }
            });
          })(hints[i]);
        }
      },

      update: function (dt) {
        var g = this.world;
        g.update(dt, game);

        if (!this.introDone && !M.UI.dialogActive() && !game.cine.active) {
          this.introDone = true;
          game.startCine([
            { t: 'say', who: null, text: 'EL VIENTO SUSURRA NOMBRES OLVIDADOS.' },
            {
              t: 'fn', f: function () {
                g.control = true;
                game.addNexus(5);
                M.UI.showHint('SIGUELA ENTRE LAS LAPIDAS', 4);
              }
            }
          ]);
        }

        // relámpagos: TODO el banco de paleta salta a LUZ
        this.lightningT -= dt;
        if (this.lightningT <= 0) {
          this.lightningT = 6 + Math.random() * 7;
          M.FX.lightning();
          if (g.girl && g.girl.state !== 'gone' && Math.random() < 0.5) {
            this.scareT = 0.12;
            this.girlHome = { x: g.girl.gx, y: g.girl.gy };
            var dx = g.player.gx - g.girl.gx, dy = g.player.gy - g.girl.gy;
            var d = Math.sqrt(dx * dx + dy * dy) || 1;
            g.girl.gx += (dx / d) * 1.2;
            g.girl.gy += (dy / d) * 1.2;
          }
        }
        if (this.scareT > 0) {
          this.scareT -= dt;
          if (this.scareT <= 0 && this.girlHome) {
            g.girl.gx = this.girlHome.x;
            g.girl.gy = this.girlHome.y;
            this.girlHome = null;
          }
        }

        if (g.control && !this.exitReady &&
          M.dist(g.player.gx, g.player.gy, 26, 9) < 1.2) {
          this.exitReady = true;
          game.addNexus(10);
          M.FX.glitchNow(1, 0.35);
          game.setScene('conventext');
        }
      },

      draw: function (ctx) { this.world.draw(ctx); }
    };
    return scene;
  };

  /* ============================================================
     ESCENA 3 - EL CONVENTO (ADITUS OCCULTUS)
     ============================================================ */
  M.Scenes.conventext = function (game) {
    var world = new M.WorldScene({
      room: {
        id: 'conventext', ambient: 1, wallH: 9, floor: 'grass', seed: 11,
        gates: [
          { tx: 9, w: 3, kind: 'window' },
          { tx: 16, w: 5, kind: 'door' }
        ],
        paths: [{ x0: 8, x1: 10, y0: 9, y1: 15 }],
        props: [
          { kind: 'STAIRS', tx: 8, ty: 9, size: 2 },
          { kind: 'TOMB_ROUND', tx: 22, ty: 13, size: 1, solid: true },
          { kind: 'TOMB_CROSS', tx: 7, ty: 16, size: 1, solid: true },
          { kind: 'DEADTREE', tx: 25, ty: 16, size: 1, solid: true }
        ],
        lights: [
          { px: 9 * 8 + 4, py: 7 * 8, r: 26 }   // resplandor de la ventana
        ]
      },
      playerStart: { x: 5, y: 17 },
      girl: {
        x: 7, y: 14, startState: 'hidden',
        waypoints: [{ x: 8, y: 14 }, { x: 9, y: 12 }, { x: 9, y: 11 }]
      }
    });

    var scene = {
      world: world,
      card: { scene: 'ESCENA 3', title: 'EL CONVENTO', sub: 'ADITUS OCCULTUS', hold: 2.4 },
      windowDone: false,

      enter: function () {
        var g = this.world;
        g.control = false;
        // la puerta carmesí de la fachada (cerrada), anclada al muro
        g.doorProp = { cx: 16 * 8 + 4, bottomY: (9 - 1) * 8 };
        M.Audio.playSong('convent');
        M.Audio.wind(false);

        // la puerta: cerrada
        g.interactables.push({
          x: 16, y: 10, r: 1.5, hint: 'FUEGO: EXAMINAR LA PUERTA',
          fn: function () {
            M.Audio.sfx.creak();
            M.UI.say('PUERTA', 'CERRADA CON CERRADURA DE HIERRO. HUELE A CERA Y A ALGO MAS ANTIGUO.');
          }
        });

        // la ventana: la entrada real
        g.interactables.push({
          x: 9, y: 10.5, r: 1.6, once: true,
          hint: 'FUEGO: COLARSE POR LA VENTANA',
          fn: function () {
            if (scene.windowDone) return;
            scene.windowDone = true;
            game.startCine([
              { t: 'fn', f: function () { g.control = false; } },
              { t: 'move', ent: g.player, x: 9, y: 11, speed: 2.2 },
              { t: 'sfx', name: 'whoosh' },
              { t: 'nexus', n: 10 },
              { t: 'fn', f: function () { M.FX.glitchNow(1.1, 0.4); } },
              { t: 'wait', s: 0.3 },
              { t: 'fn', f: function () { game.setScene('convent'); } }
            ]);
          }
        });

        game.startCine([
          { t: 'wait', s: 0.9 },
          { t: 'sfx', name: 'bell' },
          { t: 'say', who: null, text: 'EL CONVENTO ANTIGUO ALZA SU SOMBRA.' },
          { t: 'wait', s: 1.6 },
          { t: 'sfx', name: 'bell' },
          {
            t: 'fn', f: function () {
              g.girl.state = 'go';
              game.addNexus(5);
            }
          },
          { t: 'wait', s: 3.4 },
          { t: 'sfx', name: 'whoosh' },
          { t: 'fn', f: function () { g.girl.vanish(1.4); } },
          { t: 'wait', s: 0.9 },
          { t: 'say', who: null, text: 'ELLA SE DESLIZA POR LA VENTANA Y DESAPARECE.' },
          { t: 'say', who: null, text: 'LA PUERTA ESTA CERRADA. SOLO QUEDA LA VENTANA.' },
          {
            t: 'fn', f: function () {
              g.control = true;
              M.UI.showHint('ACERCATE A LA VENTANA Y PULSA FUEGO', 5);
            }
          }
        ]);
      },

      update: function (dt) {
        this.world.update(dt, game);
      },

      draw: function (ctx) { this.world.draw(ctx); }
    };
    return scene;
  };

  /* ============================================================
     ESCENA 4 - LOS PASILLOS (SILENTIUM)
     ============================================================ */
  M.Scenes.convent = function (game, opts) {
    opts = opts || {};
    var skipIntro = !!opts.skipIntro;

    var world = new M.WorldScene({
      room: {
        id: 'convent', ambient: 0, wallH: 8, floor: 'slab', seed: 17,
        gates: [{ tx: 16, w: 5, kind: 'door' }],
        carpet: { x0: 14, x1: 18, y0: 8, y1: 25 },
        paths: [],
        props: [
          { kind: 'COLUMN', tx: 10, ty: 12, size: 1, solid: true },
          { kind: 'COLUMN', tx: 21, ty: 12, size: 1, solid: true },
          { kind: 'COLUMN', tx: 10, ty: 17, size: 1, solid: true },
          { kind: 'COLUMN', tx: 21, ty: 17, size: 1, solid: true },
          { kind: 'CHAIR', tx: 6, ty: 20, size: 1, solid: true },
          { kind: 'CHAIR', tx: 7, ty: 20, size: 1, solid: true },
          { kind: 'CHAIR', tx: 8, ty: 20, size: 1, solid: true },
          { kind: 'CHAIR', tx: 23, ty: 20, size: 1, solid: true },
          { kind: 'CHAIR', tx: 24, ty: 20, size: 1, solid: true },
          { kind: 'CHAIR', tx: 25, ty: 20, size: 1, solid: true },
          { kind: 'SHELF', tx: 3, ty: 10, size: 1, solid: true },
          { kind: 'SHELF', tx: 3, ty: 13, size: 1, solid: true },
          { kind: 'SKULL', tx: 12, ty: 22, size: 1 },
          { kind: 'BONES', tx: 19, ty: 21, size: 1 }
        ],
        lights: [
          { px: 6 * 8 + 4, py: 5 * 8, r: 26 },
          { px: 25 * 8 + 4, py: 5 * 8, r: 26 },
          { px: 11 * 8 + 4, py: 5 * 8, r: 24 },
          { px: 20 * 8 + 4, py: 5 * 8, r: 24 }
        ]
      },
      playerStart: { x: 16, y: 24 },
      candles: [[7, 13], [24, 19], [5, 22]],
      hides: [[10, 13.7], [21, 13.7], [10, 18.7], [21, 18.7]],
      sister: {
        x: 24, y: 23,
        route: [
          { x: 24, y: 23, wait: 1.2, sweeps: [{ x: -1, y: 0, t: 0.8 }, { x: 0, y: 1, t: 0.7 }, { x: 1, y: 0, t: 0.5 }] },
          { x: 8, y: 23, wait: 1.7, sweeps: [{ x: 0, y: -1, t: 0.9 }, { x: -1, y: 0, t: 0.6 }, { x: 1, y: 0, t: 0.7 }] },
          { x: 24, y: 23, wait: 0.4 },
          { x: 16, y: 11, wait: 2.4, sweeps: [{ x: 0, y: -1, t: 0.9 }, { x: -1, y: 0, t: 0.8 }, { x: 1, y: 0, t: 0.7 }] }
        ]
      }
    });
    world.rats.push(new M.Rat(4, 12, 24));
    world.doorProp = { cx: 16 * 8 + 4, bottomY: (8 - 1) * 8 };

    var scene = {
      world: world,
      card: { scene: 'ESCENA 4', title: 'LOS PASILLOS', sub: 'SILENTIUM', hold: 2.4 },
      phase: skipIntro ? 'stealth' : 'intro',
      doorOpened: false, caughtOnce: false,

      enter: function () {
        var g = this.world;
        game.nexusCheckpoint = game.state.nexus;
        this._setupInteractions();

        if (skipIntro) {
          g.sister.gx = 16; g.sister.gy = 11;
          g.sister.wp = 3;
          g.sister.state = 'patrol';
          g.sister.active = true;
          g.control = true;
          M.Audio.playSong('convent');
          M.UI.showHint('SIN SER VISTA: ALCANZA LA PUERTA DEL NORTE', 5);
          return;
        }

        g.control = false;
        g.sister.state = 'script';
        g.sister.active = false;
        g.sister.scriptQueue = [{ type: 'move', x: 16, y: 10, speed: 1.6 }];
        M.Audio.playSong('convent');

        game.startCine([
          { t: 'wait', s: 1.0 },
          { t: 'say', who: null, text: 'OLOR A CERA Y A SIGLOS DETENIDOS.' },
          { t: 'wait', s: 0.6 },
          { t: 'sfx', name: 'heartbeat' },
          { t: 'say', who: null, text: 'SE ACERCAN PASOS. UNA LUZ TEMBLOROSA.' },
          { t: 'move', ent: g.player, x: 10, y: 13.8, speed: 3.2 },
          { t: 'fn', f: function () { g.player.pose = 'hide'; M.Audio.sfx.heartbeat(); } },
          { t: 'say', who: null, text: 'TE ESCONDES TRAS LA COLUMNA. CONTEN LA RESPIRACION.' },
          { t: 'nexus', n: 10 },
          {
            t: 'fn', f: function () {
              // la hermana baja por la alfombra y se va al fondo
              g.sister.scriptQueue = [
                { type: 'move', x: 16, y: 20, speed: 1.8 },
                { type: 'face', x: -1, y: 0 },
                { type: 'wait', t: 1.4 },
                { type: 'face', x: 0, y: -1 },
                { type: 'wait', t: 0.5 },
                { type: 'move', x: 16, y: 11, speed: 2.6 }
              ];
              g.sister.scriptDone = function () { scene._sisterDone = true; };
              scene._sisterDone = false;
            }
          },
          { t: 'until', f: function () { return scene._sisterDone; } },
          { t: 'say', who: null, text: 'UNA HERMANA CON UNA VELA PASA DE LARGO. NO TE HA VISTO.' },
          { t: 'fn', f: function () { g.player.pose = 'stand'; M.Audio.sfx.heartbeat(); } },
          { t: 'say', who: null, text: 'USA LAS COLUMNAS. SI TE VE, PIERDES UN CORAZON.' },
          {
            t: 'fn', f: function () {
              g.sister.state = 'patrol';
              g.sister.wp = 3;
              g.sister.active = true;
              g.control = true;
              scene.phase = 'stealth';
              M.UI.showHint('RECOGE LAS TRES VELAS Y ALCANZA LA PUERTA', 6);
            }
          }
        ]);
      },

      _setupInteractions: function () {
        var g = this.world;
        var scene = this;

        // recoger las velas
        g.candles.forEach(function (cd, i) {
          g.interactables.push({
            x: cd.tx + 0.5, y: cd.ty + 0.5, r: 1.3,
            hint: 'FUEGO: RECOGER LA VELA',
            fn: function () {
              if (cd.taken) return;
              cd.taken = true;
              game.state.candles++;
              game.addNexus(5);
              M.Audio.sfx.pickup();
              M.UI.showHint('VELA RECOGIDA (' + game.state.candles + '/3)', 2.4);
            }
          });
        });

        // la puerta del norte
        g.interactables.push({
          x: 16, y: 9, r: 1.6,
          hint: 'FUEGO: LA PUERTA DEL NORTE',
          fn: function () {
            if (scene.doorOpened) return;
            if (game.state.candles < 3) {
              M.Audio.sfx.creak();
              M.UI.say('PUERTA', 'LA PUERTA PIDE UNA OFRENDA: TRES VELAS. (' + game.state.candles + '/3)');
              return;
            }
            scene.doorOpened = true;
            g.doorOpen = true;
            scene.phase = 'ending';
            game.addNexus(10);
            M.Audio.stopMusic();
            M.Audio.sfx.doorOpen();
            M.FX.glitchNow(0.8, 0.3);
            g.extraLights = [{ px: 16 * 8 + 4, py: 8 * 8, r: 34 }];
            game.startCine([
              { t: 'fn', f: function () { g.control = false; g.sister.active = false; } },
              { t: 'wait', s: 1.2 },
              { t: 'say', who: null, text: 'LAS TRES VELAS ABREN LA PUERTA. ALGO RESPIRA AL OTRO LADO.' },
              {
                t: 'fn', f: function () {
                  g.girl = new M.Girl(16, 7.2, [], {});
                  g.girl.state = 'wait';
                  M.Audio.sfx.chime();
                }
              },
              { t: 'wait', s: 1.4 },
              { t: 'say', who: null, text: 'ELLA TE TIENDE LA MANO. SIN GUANTES.' },
              { t: 'move', ent: g.player, x: 16, y: 10, speed: 1.4 },
              { t: 'music', name: 'ending' },
              { t: 'fade', to: 1, speed: 1.1 },
              { t: 'wait', s: 1.6 },
              { t: 'fn', f: function () { game.setScene('ending'); } }
            ]);
          }
        });

        // que te vean
        g.sister.onSeen = function () {
          if (game.state.grace > 0 || scene.phase !== 'stealth') return;
          game.damage(1.5);
          if (game.state.hearts <= 0) return;
          g.sister.state = 'alert';
          g.sister.alertT = 1.3;
          M.Audio.sfx.alarm();
          M.FX.glitchNow(1.3, 0.45);
          g.player.gx = 16; g.player.gy = 24;
          g.sister.gx = 16; g.sister.gy = 11;
          g.sister.wp = 3;
          game.state.grace = 3.2;
          if (!scene.caughtOnce) {
            scene.caughtOnce = true;
            M.UI.say(null, '¡TE HA VISTO! VUELVE A EMPEZAR EL PASILLO.');
          }
        };
      },

      update: function (dt) {
        this.world.update(dt, game);
      },

      draw: function (ctx) { this.world.draw(ctx); }
    };
    return scene;
  };

  /* ============================================================
     CONTINUARA... + estadisticas
     ============================================================ */
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
        var W = M.SCREEN_W, cx = W / 2;
        if (this.t < 3.2) {
          if (Math.sin(this.t * 5) > -0.35) {
            F.drawCenteredFit(ctx, 'CONTINUARA...', cx, 84, C.BONE, {
              scale: 2, spacing: 4, shadow: C.DPURPLE, shadowDx: 2, shadowDy: 2
            });
          }
          F.drawCenteredFit(ctx, 'MISTICAS - ' + M.VERSION, cx, 122, C.GRAY);
        } else {
          var st = game.state;
          var secs = Math.max(0, Math.floor((performance.now() - st.startTime) / 1000));
          var mm = ('0' + Math.floor(secs / 60)).slice(-2);
          var ss = ('0' + (secs % 60)).slice(-2);

          F.drawCenteredFit(ctx, 'PRIMERA NOCHE SUPERADA', cx, 40, C.MAGENTA, { spacing: 1 });
          F.drawCentered(ctx, '·', cx, 56, C.DPURPLE);
          F.drawCenteredFit(ctx, 'CORAZONES: ' + st.hearts + '/5', cx, 70, C.BONE);
          F.drawCenteredFit(ctx, 'VELAS: ' + st.candles + '/3', cx, 84, C.ORANGE);
          F.drawCenteredFit(ctx, 'TIEMPO: ' + mm + ':' + ss, cx, 98, C.BONE);
          F.drawCenteredFit(ctx, 'NEXUS CUM NUMINE: ' + Math.round(st.nexus) + '%', cx, 112, C.PURPLE);
          F.drawCentered(ctx, '·', cx, 128, C.DPURPLE);
          if (Math.sin(this.t * 3.2) > -0.2) {
            F.drawCenteredFit(ctx, 'PULSA UNA TECLA', cx, 150, C.GRAY);
          }
          F.drawCenteredFit(ctx, 'ELLA TE ESPERA EN LA SIGUIENTE NOCHE', cx, 182, C.CRIMSON);
        }
      }
    };
  };

  /* ============================================================
     GAME OVER
     ============================================================ */
  M.Scenes.gameover = function (game) {
    return {
      hud: false,
      t: 0, faceT: 0, faceTimer: 2.6,

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
        var W = M.SCREEN_W, cx = W / 2;
        // niebla de estática: píxeles sueltos planos
        for (var i = 0; i < 90; i++) {
          var hx = Math.random(), hy = Math.random();
          ctx.fillStyle = M.PAL[hx > 0.85 ? C.MAGENTA : (hx > 0.5 ? C.DGRAY : C.BLACK)];
          ctx.fillRect(Math.floor(hx * W), Math.floor(hy * M.SCREEN_H), 2, 1);
        }
        if (this.faceT > 0) {
          M.Spr.drawFace(ctx, cx, 100);
        } else {
          F.drawCenteredFit(ctx, 'TE HAN VISTO', cx, 64, C.RED, {
            scale: 2, shadow: C.BLOOD, shadowDx: 2, shadowDy: 2
          });
          F.drawCenteredFit(ctx, 'EL CONVENTO TE RECLAMA', cx, 100, C.CRIMSON);
          F.drawCenteredFit(ctx, 'CORAZONES: 0/5', cx, 126, C.GRAY);
        }
        if (Math.sin(this.t * 3) > -0.2) {
          F.drawCenteredFit(ctx, 'PULSA UNA TECLA PARA VOLVER A INTENTARLO', cx, 158, C.BONE);
        }
      }
    };
  };

})(window.MISTICAS);
