'use strict';
/* ============================================================
   MÍSTICAS — (C) 1987 — scenes/convent.js
   ESCENA 4 - LOS PASILLOS (SILENTIUM)
   HABITACIÓN FIJA: nave interior del convento, cerrada al N y al
   O por muros de ladrillo con apliques; abierta al frente (el
   zócalo-pedestal del diorama). Columnata a los lados de la
   alfombra, arcos de medio punto ante la puerta del norte.
   El sigilo: la hermana patrulla con su vela. El niño se
   esconde tras las columnas, recoge tres velas y abre la
   puerta del norte. Ella lo espera al otro lado.
   ============================================================ */
(function (M) {

  M.Scenes = M.Scenes || {};

  M.Scenes.convent = function (game, opts) {
    opts = opts || {};
    var skipIntro = !!opts.skipIntro;

    var world = new M.WorldScene({
      darkness: 0.62,
      static: 0.03,
      mapDef: {
        // 13x16 — nave: muro alto N (puerta 'd' en gx=8, apliques)
        // y O; frente abierto al zócalo. Alfombra central hasta la
        // escalera de entrada; columnata y arcos flanqueándola.
        rows: [
          '###s####d##s#',
          '#.......c....',
          '#.......c....',
          '#.e...a.c.a..',
          '#.......c....',
          's...C...c..C.',
          '#.......c....',
          '#.......c....',
          '#.b.....c....',
          '#...C...c..C.',
          's.......c....',
          '#.......c....',
          '#...C...c..C.',
          '#.e.....c....',
          '#.......S....',
          '.............'
        ],
        legend: {
          '#': { floor: null, solid: true, block: 'wall', hh: 20 },
          's': { floor: null, solid: true, block: 'wall', hh: 20, deco: 'sconce' },
          'd': { floor: null, solid: true, block: 'wall', hh: 20, deco: 'door' },
          '.': { floor: 'stone' },
          'c': { floor: 'carpet' },
          'C': { floor: 'stone', solid: true, deco: 'column' },
          'a': { floor: 'stone', deco: 'arch' },
          'S': { floor: 'stone', deco: 'stairs' },
          'e': { floor: 'stone', solid: true, deco: 'shelf' },
          'k': { floor: 'stone', deco: 'skull' },
          'b': { floor: 'stone', deco: 'bones' }
        }
      },
      playerStart: { x: 8, y: 14 },
      candles: [[3, 7], [11, 11], [5, 2]],
      sister: {
        x: 10, y: 13,
        route: [
          { x: 10, y: 13, wait: 0.5, face: { x: 0, y: 1 } },
          {
            x: 3, y: 13, wait: 1.7,
            sweeps: [{ x: -1, y: 0, t: 0.8 }, { x: 0, y: 1, t: 0.7 }, { x: 1, y: 0, t: 0.5 }]
          },
          { x: 10, y: 13, wait: 0.4, face: { x: 1, y: 0 } },
          {
            x: 8.5, y: 4, wait: 2.4,
            sweeps: [{ x: 0, y: -1, t: 0.9 }, { x: -1, y: 0, t: 0.8 }, { x: 1, y: 0, t: 0.7 }]
          }
        ]
      }
    });

    // ratas de ambiente por la nave
    world.rats.push({ a: 2, b: 10, gy: 14, t: 0, px: 2 });

    var scene = {
      world: world,
      card: { scene: 'ESCENA 4', title: 'LOS PASILLOS', sub: 'SILENTIUM', hold: 2.4 },
      phase: skipIntro ? 'stealth' : 'intro',
      hideTriggered: false,
      doorOpened: false,
      caughtOnce: false,

      enter: function () {
        var g = this.world;
        game.nexusCheckpoint = game.state.nexus;

        if (skipIntro) {
          g.sister.gx = 8.5; g.sister.gy = 4;
          g.sister.state = 'patrol';
          g.sister.wp = 0;
          g.sister.active = true;
          g.control = true;
          M.Audio.playSong('convent');
          M.UI.showHint('SIN SER VISTA: ALCANZA LA PUERTA DEL NORTE', 5);
          this._setupInteractions();
          return;
        }

        g.control = false;
        g.sister.state = 'script';
        g.sister.active = false;
        M.Audio.playSong('convent');
        this._setupInteractions();

        game.startCine([
          { t: 'wait', s: 1.0 },
          { t: 'say', who: null, text: 'OLOR A CERA Y A SIGLOS DETENIDOS.' },
          { t: 'wait', s: 0.6 },
          { t: 'sfx', name: 'heartbeat' },
          { t: 'say', who: null, text: 'SE ACERCAN PASOS. UNA LUZ TEMBLOROSA.' },
          {
            t: 'fn', f: function () {
              // el niño corre a esconderse tras la columnata del oeste
              g.player.pose = 'stand';
            }
          },
          { t: 'move', ent: g.player, x: 4, y: 11.4, speed: 3.2 },
          {
            t: 'fn', f: function () {
              g.player.pose = 'hide';
              M.Audio.sfx.heartbeat();
            }
          },
          { t: 'say', who: null, text: 'TE ESCONDES TRAS LA COLUMNA. CONTEN LA RESPIRACION.' },
          { t: 'nexus', n: 10 },
          {
            t: 'fn', f: function () {
              // la hermana entra y pasa de largo entre las columnas
              g.sister.scriptQueue = [
                { type: 'move', x: 3, y: 13, speed: 1.8 },
                { type: 'face', x: -1, y: 0 },
                { type: 'wait', t: 1.4 },
                { type: 'face', x: 0, y: -1 },
                { type: 'wait', t: 0.5 },
                { type: 'move', x: 10, y: 13, speed: 3.2 },
                { type: 'move', x: 8.5, y: 4, speed: 2.6 }
              ];
              g.sister.scriptDone = function () {
                scene._sisterDone = true;
              };
              scene._sisterDone = false;
            }
          },
          {
            t: 'until', f: function () { return scene._sisterDone; }
          },
          { t: 'say', who: null, text: 'UNA HERMANA CON UNA VELA PASA DE LARGO. NO TE HA VISTO.' },
          {
            t: 'fn', f: function () {
              g.player.pose = 'stand';
              M.Audio.sfx.heartbeat();
            }
          },
          { t: 'say', who: null, text: 'USA LAS COLUMNAS. SI TE VE, PIERDES UN CORAZON.' },
          {
            t: 'fn', f: function () {
              g.sister.state = 'patrol';
              g.sister.wp = 0;      // sube a guardar la puerta del norte
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

        // la puerta del norte (al fondo de la alfombra)
        g.interactables.push({
          x: 8, y: 1.6, r: 1.5, once: false,
          hint: 'FUEGO: LA PUERTA DEL NORTE',
          fn: function () {
            if (scene.doorOpened) return;
            if (game.state.candles < 3) {
              M.Audio.sfx.creak();
              M.UI.say('PUERTA', 'LA PUERTA PIDE UNA OFRENDA: TRES VELAS. (' + game.state.candles + '/3)');
              return;
            }
            scene.doorOpened = true;
            scene.phase = 'ending';
            game.addNexus(10);
            M.Audio.stopMusic();
            M.Audio.sfx.doorOpen();
            M.FX.glitchNow(0.8, 0.3);
            g.extraLights = [{ gx: 8, gy: 1.8, r: 34 }];
            game.startCine([
              { t: 'fn', f: function () { g.control = false; g.sister.active = false; } },
              { t: 'wait', s: 1.2 },
              { t: 'say', who: null, text: 'LAS TRES VELAS ABREN LA PUERTA. ALGO RESPIRA AL OTRO LADO.' },
              {
                t: 'fn', f: function () {
                  // ella aparece tras la puerta
                  g.girl = new M.Entities.Girl(8, 1.2, [], {});
                  g.girl.state = 'script';
                  g.girl.alpha = 0;
                  g.girl._vanishing = false;
                  g.girl._fadeIn = true;
                  M.Audio.sfx.chime();
                }
              },
              { t: 'wait', s: 1.4 },
              { t: 'say', who: null, text: 'ELLA TE TIENDE LA MANO. SIN GUANTES.' },
              { t: 'move', ent: g.player, x: 8, y: 2.4, speed: 1.4 },
              { t: 'music', name: 'ending' },
              { t: 'fade', to: 1, speed: 1.1 },
              { t: 'wait', s: 1.6 },
              { t: 'fn', f: function () { game.setScene('ending'); } }
            ]);
          }
        });

        // que te vean (canon: cada captura resta 1 corazón y medio)
        g.sister.onSeen = function () {
          if (game.state.grace > 0 || scene.phase !== 'stealth') return;
          game.damage(1.5);
          if (game.state.hearts <= 0) return; // game over lo gestiona damage()
          g.sister.state = 'alert';
          g.sister.alertT = 1.3;
          M.FX.flashNow(M.C.LCRIM, 0.5, 0.3);
          M.FX.glitchNow(1.3, 0.45);
          M.FX.shakeNow(3, 0.4);
          // el niño vuelve a la escalera y la hermana sube a guardar la puerta
          g.player.gx = 8; g.player.gy = 14;
          g.sister.gx = 8.5; g.sister.gy = 4;
          g.sister.wp = 0;
          game.state.grace = 3.2;
          if (!scene.caughtOnce) {
            scene.caughtOnce = true;
            M.UI.say(null, '¡TE HA VISTO! VUELVE A EMPEZAR EL PASILLO.');
          }
        };
      },

      update: function (dt) {
        var g = this.world;
        g.update(dt, game);

        // fundido de entrada de la niña tras la puerta
        if (g.girl && g.girl._fadeIn && g.girl.alpha < 1) {
          g.girl.alpha = Math.min(1, g.girl.alpha + dt * 0.8);
        }
      },

      draw: function (ctx) {
        this.world.draw(ctx, game);
      }
    };

    return scene;
  };
})(window.MISTICAS);
