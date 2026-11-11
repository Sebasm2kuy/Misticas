'use strict';
/* ============================================================
   MÍSTICAS — (C) 1987 — scenes/conventext.js
   ESCENA 3 - EL CONVENTO (ADITUS OCCULTUS)
   HABITACIÓN FIJA: patio cerrado frente a la fachada maciza del
   convento (muro doble de ladrillo con ventana y puerta). La
   puerta no cede. La ventana, si. Ella ya entro.
   ============================================================ */
(function (M) {

  M.Scenes = M.Scenes || {};

  M.Scenes.conventext = function (game) {
    var world = new M.WorldScene({
      sky: { moonX: 30 },
      fog: 0.5,
      static: 0.02,
      windowLit: true,
      mapDef: {
        // 17x11 — la fachada (muro alto) domina el fondo N; al O
        // muro alto, al E y al S muro bajo. Escalera bajo la
        // ventana, que es la entrada real.
        rows: [
          '#################',
          '######w###d######',
          '#.....S.........l',
          '#.....p.........l',
          '#....1p.........l',
          '#.....p....t....l',
          '#.....p......2..l',
          '#.....p.........l',
          '#.ppppp.........l',
          '#......b........l',
          'lllllllllllllllll'
        ],
        legend: {
          '.': { floor: 'grass' },
          'p': { floor: 'path' },
          '#': { floor: null, solid: true, block: 'wall', hh: 22 },
          'l': { floor: null, solid: true, block: 'wall', hh: 7 },
          'w': { floor: null, solid: true, block: 'wall', hh: 22, deco: 'window' },
          'd': { floor: null, solid: true, block: 'wall', hh: 22, deco: 'door' },
          'S': { floor: 'path', deco: 'stairs' },
          '1': { floor: 'grass', solid: true, deco: 'tomb1' },
          '2': { floor: 'grass', solid: true, deco: 'tomb2' }
          // 't' (árbol muerto) llega como MARCA de entidad, no leyenda
        }
      },
      playerStart: { x: 2.5, y: 8.5 },
      girl: {
        x: 3, y: 8, startState: 'hidden',
        waypoints: [{ x: 4, y: 8 }, { x: 6, y: 5 }, { x: 6, y: 2.4 }]
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
          x: 10, y: 2.4, r: 1.5, once: false,
          hint: 'FUEGO: EXAMINAR LA PUERTA',
          fn: function () {
            M.Audio.sfx.creak();
            M.UI.say('PUERTA', 'CERRADA CON CERRADURA DE HIERRO. HUELE A CERA Y A ALGO MAS ANTIGUO.');
          }
        });

        // la ventana: la entrada (FUEGO, o ARRIBA —la flecha o el
        // joystick a tope— para colarse de un tirón)
        g.interactables.push({
          x: 6, y: 2.4, r: 1.5, once: true, key: 'up',
          hint: 'FUEGO O ARRIBA: COLARTE POR LA VENTANA',
          fn: function () {
            if (scene.windowDone) return;
            scene.windowDone = true;
            game.startCine([
              { t: 'fn', f: function () { g.control = false; } },
              { t: 'move', ent: g.player, x: 6, y: 2.6, speed: 2.2 },
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
