'use strict';
/* ============================================================
   MÍSTICAS — (C) 1987 — scenes/tree.js
   ESCENA 1 - EL ARBOL (INITIUM)
   El niño lee bajo el árbol. Ella aparece, sin guantes, y
   le hace una señal. El jugador toma el control y la sigue.
   ============================================================ */
(function (M) {

  var F = M.Font;

  M.Scenes = M.Scenes || {};

  M.Scenes.tree = function (game) {
    var world = new M.WorldScene({
      sky: { horizon: 92, moonX: 250 },
      fog: 0.25,
      bats: true,
      windowLit: false,
      mapDef: {
        rows: [
          'FFFFFFFFFFFFFFFFFFFFFFFF..',
          'F.........................',
          'F.........................',
          'F.........................',
          'F.........................',
          'F.........................',
          'F.........................',
          'F.......G.................',
          'F.....T...................',
          'F.........................',
          'F........Bpppppppppppppppp',
          'F.........................',
          'F.........................',
          'F.........................',
          'F.........................',
          'F.........................',
          'FFFFFFFFFFFFFFFFFFFFFFFF..',
          '..........................'
        ],
        legend: {
          '.': { floor: 'grass' },
          'p': { floor: 'path' },
          'F': { floor: 'grass', solid: true, deco: 'fence' }
        }
      },
      playerStart: { x: 9, y: 10 },
      girl: {
        x: 8, y: 7, startState: 'hidden',
        waypoints: [{ x: 11, y: 7 }, { x: 11, y: 10 }, { x: 23, y: 10 }],
        onDone: null
      }
    });

    var scene = {
      world: world,
      card: { scene: 'ESCENA 1', title: 'EL ARBOL', sub: 'INITIUM', hold: 2.4 },
      exitReady: false,
      ledHint: false,
      bellT: 2.0,

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
              g.girl.scriptTarget = { x: 11, y: 9.6 };
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
                : 'FLECHAS O WASD: MUEVETE — NO LA PIERDAS DE VISTA', 6.5);
            }
          }
        ]);
      },

      update: function (dt) {
        var g = this.world;
        g.update(dt, game);

        // campana lejana, de vez en cuando
        this.bellT -= dt;
        if (this.bellT <= 0) { this.bellT = 16 + Math.random() * 14; M.Audio.sfx.bell(true); }

        // ella espera si el niño se retrasa
        if (g.girl && g.girl.state === 'wait' && !this.ledHint) {
          var d = M.dist(g.girl.gx, g.girl.gy, g.player.gx, g.player.gy);
          if (d > 5) {
            this.ledHint = true;
            M.UI.showHint('ELLA TE ESPERA. NO TE DEMORES.', 3.5);
          }
        }

        // salida al este (solo si ella ya llegó)
        if (g.control && g.player.gx > 22.6 && !this.exitReady) {
          if (g.girl.wp >= g.girl.waypoints.length - 1) {
            this.exitReady = true;
            game.addNexus(10);
            M.FX.fadeTo(1, 2.2, null);
            M.Audio.sfx.glitch();
            game.setScene('cemetery');
          } else if (!M.UI.hint && !M.UI.dialog) {
            M.UI.showHint('ESPERA A ELLA. NO CONOCES EL CAMINO.', 3);
          }
        }
      },

      draw: function (ctx) {
        this.world.draw(ctx, game);
      }
    };

    return scene;
  };
})(window.MISTICAS);
