'use strict';
/* ============================================================
   MÍSTICAS — (C) 1987 — scenes/tree.js
   ESCENA 1 - EL ARBOL (INITIUM)
   HABITACIÓN FIJA: huerta amurallada con el gran árbol en el
   centro y un portón gótico al noreste. El niño lee bajo el
   árbol. Ella aparece, sin guantes, y le hace una señal.
   ============================================================ */
(function (M) {

  var F = M.Font;

  M.Scenes = M.Scenes || {};

  M.Scenes.tree = function (game) {
    var world = new M.WorldScene({
      sky: { moonX: 250 },
      fog: 0.25,
      bats: true,
      windowLit: false,
      mapDef: {
        // 15x13 — sala cerrada: muro alto al N (con portón de paso
        // en gx=8) y al O; muro bajo al E y al S (zócalo-pedestal).
        rows: [
          '########g######',
          '#.......p.....l',
          '#.......p.....l',
          '#.......p...t.l',
          '#.......p.....l',
          '#..TT...p.....l',
          '#..TT...p.....l',
          '#....ppp.G....l',
          '#....Bp.......l',
          '#.............l',
          '#.............l',
          '#.............l',
          'lllllllllllllll'
        ],
        legend: {
          '.': { floor: 'grass' },
          'p': { floor: 'path' },
          '#': { floor: null, solid: true, block: 'wall', hh: 14 },
          'l': { floor: null, solid: true, block: 'wall', hh: 7 },
          'g': { floor: 'path', deco: 'gate' }
        }
      },
      playerStart: { x: 5.5, y: 8.5 },
      girl: {
        x: 10, y: 7, startState: 'hidden',
        waypoints: [{ x: 8, y: 7 }, { x: 8, y: 1.6 }],
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
              g.girl.scriptTarget = { x: 9, y: 7.6 };
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

        // salida por el portón del noreste (solo si ella ya llegó)
        if (g.control && !this.exitReady &&
            M.dist(g.player.gx, g.player.gy, 8, 1.3) < 1.25) {
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
