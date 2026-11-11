'use strict';
/* ============================================================
   MÍSTICAS — (C) 1987 — scenes/cemetery.js
   ESCENA 2 - EL CAMPO SANTO (TRANSITUS)
   Niebla, lápidas, relámpagos y una inscripción en latín.
   Entre las tumbas hay nombres que no deberían estar.
   ============================================================ */
(function (M) {

  M.Scenes = M.Scenes || {};

  M.Scenes.cemetery = function (game) {
    var world = new M.WorldScene({
      sky: { horizon: 70, moonX: 60 },
      fog: 1.0,
      static: 0.05,
      bats: true,
      mapDef: {
        rows: [
          'FFFFFFFFFFFFFFFFFFFFFFFFFFFF',
          'F..........................F',
          'F........t.................F',
          'F.................3........F',
          'F....................2..ppp.',
          'F.....................2....F',
          'F..t................b.....1F',
          'F..................1......2F',
          'F.....................3....F',
          'F.................1........F',
          'F...........ppppppppppppp..F',
          'F.............L......2.....F',
          'F...............2..........F',
          'F.........1................F',
          'F...................t......F',
          'F....1........3............F',
          'F.......2.........b........F',
          '.pppppppppppp..............F',
          'F...3......................F',
          'F......................k...F',
          'F.......................1..F',
          'FFFFFFFFFFFFFFFFFFFFFFFFFFFF'
        ],
        legend: {
          '.': { floor: 'dirt' },
          'p': { floor: 'path' },
          'F': { floor: 'dirt', solid: true, deco: 'fence' },
          '1': { floor: 'dirt', solid: true, deco: 'tomb1' },
          '2': { floor: 'dirt', solid: true, deco: 'tomb2' },
          '3': { floor: 'dirt', solid: true, deco: 'tomb3' },
          'k': { floor: 'dirt', deco: 'skull' },
          'b': { floor: 'dirt', deco: 'bones' }
        }
      },
      playerStart: { x: 1.5, y: 17 },
      girl: {
        x: 3, y: 17,
        waypoints: [
          { x: 8, y: 17 }, { x: 12, y: 17 }, { x: 12, y: 10 },
          { x: 18, y: 10 }, { x: 24, y: 10 }, { x: 24, y: 4 }, { x: 25.5, y: 4 }
        ]
      }
    });

    var scene = {
      world: world,
      card: { scene: 'ESCENA 2', title: 'EL CAMPO SANTO', sub: 'TRANSITUS', hold: 2.4 },
      lightningT: 5 + Math.random() * 5,
      scareT: 0,
      girlHome: null,
      exitReady: false,
      latinDone: false,
      introDone: false,

      enter: function () {
        var self = this;
        var g = this.world;
        g.control = false;
        M.Audio.playSong('cemetery');
        M.Audio.wind(true);

        // inscripciones y lápidas con texto
        g.interactables.push({
          x: 14, y: 11, r: 1.7, hint: null, once: true,
          fn: function () {
            if (self.latinDone) return;
            self.latinDone = true;
            game.addNexus(10);
            M.UI.say('INSCRIPCION', 'UT COR SANCTAE ATTINGAS EIUS OCULIS SPECTA', { latin: true });
          }
        });
        this._tombHints();
      },

      _tombHints: function () {
        var hints = [
          [5, 15, 'DORMIDA. NO MUERTA.'],
          [18, 9, 'AQUI YACE QUIEN MIRO DEMASIADO.'],
          [22, 5, 'NO ERA SU HORA.'],
          [26, 7, 'D.D. 1987'],
          [8, 16, 'REZA POR ELLA.']
        ];
        for (var i = 0; i < hints.length; i++) {
          (function (h) {
            world.triggers.push({
              x: h[0], y: h[1], r: 1.6, once: true,
              fn: function () { M.UI.showHint(h[2], 3.2); M.Audio.sfx.blip(); }
            });
          })(hints[i]);
        }
      },

      update: function (dt) {
        var g = this.world;
        g.update(dt, game);

        if (!this.introDone && !M.UI.dialogActive() && !game.cine.active) {
          // arranque breve la primera vez
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

        // relámpagos
        this.lightningT -= dt;
        if (this.lightningT <= 0) {
          this.lightningT = 6 + Math.random() * 7;
          M.FX.lightning();
          // en el destello, ella aparece un paso más cerca
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

        // salida al noreste
        if (g.control && g.player.gx > 24.4 && g.player.gy < 5.6 && !this.exitReady) {
          this.exitReady = true;
          game.addNexus(10);
          M.FX.glitchNow(1, 0.35);
          game.setScene('conventext');
        }
      },

      draw: function (ctx) {
        this.world.draw(ctx, game);
      }
    };

    return scene;
  };
})(window.MISTICAS);
