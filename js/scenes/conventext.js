'use strict';
/* ============================================================
   MÍSTICAS — (C) 1987 — scenes/conventext.js
   ESCENA 3 - EL CONVENTO (ADITUS OCCULTUS)
   La fachada. La puerta no cede. La ventana, si. Ella ya entro.
   ============================================================ */
(function (M) {

  M.Scenes = M.Scenes || {};

  M.Scenes.conventext = function (game) {
    var world = new M.WorldScene({
      sky: { horizon: 64, moonX: 30 },
      fog: 0.5,
      static: 0.02,
      windowLit: true,
      mapDef: {
        rows: [
          'FFFFFFFFFFFFFFFFFFFFFFFF',
          'F......................F',
          'F......................F',
          'F.......WWWWWWWWWWWWWWWF',
          'F...3...WWWWWWWWWWWWWWWF',
          'F.......WWWWWWWWWWWWWWWF',
          'F.......WWWWWWWWWWWWWWWF',
          'F.......WWWWWWWWWWWWWWWF',
          'F.......WWWWWWWWWWWWWWWF',
          'F.......WWWWWWWWWWWWWWWF',
          'F...2......w.....d.....F',
          'F..........p.....S.....F',
          'FppppppppppppppppppppppF',
          'F....................t.F',
          'F.....1.............3..F',
          'F......................F',
          'F......................F',
          'FFFFFFFFFFFFFFFFFFFFFFFF'
        ],
        legend: {
          '.': { floor: 'grass' },
          'p': { floor: 'path' },
          'F': { floor: 'grass', solid: true, deco: 'fence' },
          'W': { floor: null, solid: true, block: 'wall', hh: 16 },
          'w': { floor: 'grass', solid: true, deco: 'window' },
          'd': { floor: 'grass', solid: true, deco: 'door' },
          'S': { floor: 'path', deco: 'stairs' },
          '1': { floor: 'grass', solid: true, deco: 'tomb1' },
          '2': { floor: 'grass', solid: true, deco: 'tomb2' },
          '3': { floor: 'grass', solid: true, deco: 'tomb3' }
        }
      },
      playerStart: { x: 1.5, y: 12 },
      girl: {
        x: 2.5, y: 12, startState: 'hidden',
        waypoints: [{ x: 8, y: 12 }, { x: 10.4, y: 12 }, { x: 11, y: 11.6 }]
      }
    });

    var scene = {
      world: world,
      card: { scene: 'ESCENA 3', title: 'EL CONVENTO', sub: 'ADITUS OCCULTUS', hold: 2.4 },
      windowDone: false,

      enter: function () {
        var g = this.world;
        g.control = false;
        M.Audio.playSong('convent');
        M.Audio.wind(false);

        // la puerta: cerrada
        g.interactables.push({
          x: 17, y: 11.5, r: 1.5, once: false,
          hint: 'FUEGO: EXAMINAR LA PUERTA',
          fn: function () {
            M.Audio.sfx.creak();
            M.UI.say('PUERTA', 'CERRADA CON CERRADURA DE HIERRO. HUELE A CERA Y A ALGO MAS ANTIGUO.');
          }
        });

        // la ventana: la entrada
        g.interactables.push({
          x: 11, y: 11.5, r: 1.5, once: true,
          hint: 'FUEGO O ARRIBA: COLARTE POR LA VENTANA',
          fn: function () {
            if (scene.windowDone) return;
            scene.windowDone = true;
            game.startCine([
              { t: 'fn', f: function () { g.control = false; } },
              { t: 'move', ent: g.player, x: 11.2, y: 11.8, speed: 2.2 },
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
          {
            t: 'fn', f: function () {
              g.girl.vanish(1.4);
            }
          },
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

      draw: function (ctx) {
        this.world.draw(ctx, game);
      }
    };

    return scene;
  };
})(window.MISTICAS);
