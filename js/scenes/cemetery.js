'use strict';
/* ============================================================
   MÍSTICAS — (C) 1987 — scenes/cemetery.js
   ESCENA 2 - EL CAMPO SANTO (TRANSITUS)
   HABITACIÓN FIJA: cementerio cerrado por muros de piedra, con
   el portón de entrada al suroeste y el de salida (al convento)
   al noreste. Niebla, lápidas, relámpagos y una inscripción en
   latín. Entre las tumbas hay nombres que no deberían estar.
   ============================================================ */
(function (M) {

  M.Scenes = M.Scenes || {};

  M.Scenes.cemetery = function (game) {
    var world = new M.WorldScene({
      sky: { moonX: 60 },
      fog: 1.0,
      static: 0.05,
      bats: true,
      mapDef: {
        // 15x12 — recinto amurallado: muro alto N y O, muro bajo
        // E y S; portones de paso en (3,11) entrada y (10,0) salida.
        rows: [
          '##########g####',
          '#.........p...l',
          '#..t.....kp...l',
          '#....1....p...l',
          '#.........p.2.l',
          '#..b...L..p...l',
          '#.........p...l',
          '#..pppppppp...l',
          '#.....1......2l',
          '#...p...1.....l',
          '#...p.....t...l',
          'lllglllllllllll'
        ],
        legend: {
          '.': { floor: 'dirt' },
          'p': { floor: 'path' },
          '#': { floor: null, solid: true, block: 'wall', hh: 14 },
          'l': { floor: null, solid: true, block: 'wall', hh: 7 },
          'g': { floor: 'path', deco: 'gate' },
          '1': { floor: 'dirt', solid: true, deco: 'tomb1' },
          '2': { floor: 'dirt', solid: true, deco: 'tomb2' },
          '3': { floor: 'dirt', solid: true, deco: 'tomb3' },
          'k': { floor: 'dirt', deco: 'skull' },
          'b': { floor: 'dirt', deco: 'bones' }
        }
      },
      playerStart: { x: 3, y: 9.5 },
      girl: {
        x: 3, y: 8.5,
        waypoints: [
          { x: 3, y: 7 }, { x: 8, y: 7 }, { x: 10, y: 7 },
          { x: 10, y: 2 }, { x: 10, y: 1.4 }
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

        // inscripción en latín sobre la lápida marcada
        g.interactables.push({
          x: 7, y: 5, r: 1.7, hint: null, once: true,
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
          [5, 3, 'DORMIDA. NO MUERTA.'],
          [12, 4, 'AQUI YACE QUIEN MIRO DEMASIADO.'],
          [6, 8, 'NO ERA SU HORA.'],
          [7, 9, 'D.D. 1987'],
          [13, 8, 'REZA POR ELLA.']
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

        // salida por el portón del noreste
        if (g.control && !this.exitReady &&
            M.dist(g.player.gx, g.player.gy, 10, 1.3) < 1.2) {
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
