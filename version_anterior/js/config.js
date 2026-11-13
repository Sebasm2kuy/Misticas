'use strict';
/* ============================================================
   MÍSTICAS — (C) 1987 — js/config.js
   EL CARTUCHO: constantes del motor.

   Resolución NATIVA Famicom/NES: 256x240 píxeles, teselas de 8x8.
   Paleta estricta de 16 colores tomada del chip 2C02 real.
   La "iluminación" NO usa alpha: cada tesela se hornea en 3
   bancos (SOMBRA / NORMAL / LUZ) sustituyendo índices de paleta,
   exactamente como la PPU cambiaba sus registros de color.
   ============================================================ */
window.MISTICAS = window.MISTICAS || {};
(function (M) {

  /* ---- Pantalla: norma NTSC del cartucho ---- */
  M.SCREEN_W = 256;
  M.SCREEN_H = 240;
  M.HUD_H = 24;                     // 3 teselas de HUD inferior fijo
  M.VIEW_H = M.SCREEN_H - M.HUD_H;  // 216 px de mundo visible

  M.TILE = 8;
  M.ROOM_W = M.SCREEN_W / M.TILE;   // 32 columnas
  M.ROOM_H = M.VIEW_H / M.TILE;     // 27 filas

  // Reservas para controles táctiles (px de banda)
  M.TOUCH_TOP = 48;
  M.TOUCH_BOTTOM_TALL = 128;

  M.VERSION = 'FASE 1 - EL INICIO';
  M.YEAR = '1987';

  /* ============================================================
     PALETA 2C02 — 16 colores, todos auténticos de la NES.
     Ningún píxel del juego puede salir de esta tabla.
     ============================================================ */
  M.PAL_MASTER = [
    '#000000', // 0  NEGRO absoluto (fondo, mortero, contornos)
    '#4428BC', // 1  VIOLETA oscuro — ladrillo base, cortezas
    '#6844FC', // 2  VIOLETA — ladrillo claro, piedra de arco
    '#940084', // 3  PÚRPURA oscuro — ladrillo alterno, junta de suelo
    '#D800CC', // 4  PÚRPURA vivo — filetes, marcos, adornos
    '#F878F8', // 5  MAGENTA brillante — acentos hipervibrantes, LUZ
    '#E40058', // 6  CARMESÍ — capucha, puertas, corazones, alfombra
    '#A80020', // 7  CARMESÍ oscuro — sombras del carmesí
    '#F83800', // 8  ROJO — llama exterior, alertas
    '#FCA044', // 9  NARANJA — llama media, brasa
    '#F8B800', // 10 AMARILLO — núcleo de llama
    '#FCFCFC', // 11 BLANCO puro — texto, cera, vestido
    '#BCBCBC', // 12 GRIS claro — piedra clara, texto secundario
    '#7C7C7C', // 13 GRIS oscuro — piedra, sombra de piedra
    '#FCE0A8', // 14 HUESO — piel, cráneos, liras
    '#F8B8F8'  // 15 LILA — brillo del vestido blanco
  ];

  // Tabla ACTIVA (el motor la sustituye en sitio para fundidos)
  M.PAL = M.PAL_MASTER.slice();

  M.C = {
    BLACK: 0, DVIOLET: 1, VIOLET: 2, DPURPLE: 3, PURPLE: 4,
    MAGENTA: 5, CRIMSON: 6, BLOOD: 7, RED: 8, ORANGE: 9,
    YELLOW: 10, WHITE: 11, GRAY: 12, DGRAY: 13, BONE: 14, LILAC: 15
  };

  /* ============================================================
     BANCOS DE PALETA POR NIVEL DE LUZ (registros de la PPU)
     level 0 = SOMBRA: cada color cae un escalón
     level 1 = NORMAL: paleta tal cual
     level 2 = LUZ:    las masas saltan a violeta vivo / magenta
                       y las aristas a blanco — el "cambio de
                       registro" de la vela sobre la tesela contigua
     ============================================================ */
  M.PALSWAP = [
    /* 0 SOMBRA */ [0, 3, 1, 3, 3, 4, 7, 7, 7, 6, 9, 12, 13, 13, 12, 12],
    /* 1 NORMAL */ [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    /* 2 LUZ    */ [0, 2, 5, 4, 5, 11, 5, 6, 9, 10, 11, 11, 11, 12, 11, 11]
  ];

  // Fundido de escena SIN alpha: la paleta entera colapsa por
  // pasos (como apagar el televisor poco a poco). 5 bancos.
  M.FADESWAP = [
    M.PALSWAP[1],                                        // 0.0 abierto
    M.PALSWAP[0],                                        // 0.3
    [0, 3, 3, 3, 3, 3, 7, 7, 7, 7, 3, 3, 3, 3, 3, 3],    // 0.6
    [0, 3, 3, 3, 3, 3, 3, 7, 7, 3, 3, 3, 3, 3, 3, 3],    // 0.85
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]     // 1.0 negro
  ];

  // Aplica un banco sobre la tabla activa (en sitio)
  M.applyPaletteSwap = function (swap) {
    for (var i = 0; i < 16; i++) M.PAL[i] = M.PAL_MASTER[swap[i]];
  };

  /* ---- Estado global de la partida ---- */
  M.newGameState = function () {
    return {
      hearts: 5,          // corazones (vida)
      candles: 0,         // velas recogidas
      candlesMax: 3,
      nexus: 0,           // progreso NEXUS CUM NUMINE (0-100)
      nexusFlag: 0,
      startTime: 0,
      deaths: 0,
      grace: 0,           // invulnerabilidad breve tras ser visto
      hidden: false
    };
  };

  /* ---- Utilidades ---- */
  M.clamp = function (v, a, b) { return v < a ? a : (v > b ? b : v); };
  M.lerp = function (a, b, t) { return a + (b - a) * t; };
  M.dist = function (ax, ay, bx, by) {
    var dx = ax - bx, dy = ay - by;
    return Math.sqrt(dx * dx + dy * dy);
  };
  // Hash determinista [0,1) para variaciones por tesela
  M.hash = function (x, y) {
    var h = (x * 374761393 + y * 668265263) | 0;
    h = (h ^ (h >> 13)) * 1274126177 | 0;
    return ((h ^ (h >> 16)) >>> 0) / 4294967295;
  };

})(window.MISTICAS);
