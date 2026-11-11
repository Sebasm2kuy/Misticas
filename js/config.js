'use strict';
/* ============================================================
   MÍSTICAS — (C) 1987 — config.js
   Espacio de nombres global, paleta ultra reducida de 16
   colores y constantes del motor. Todo el juego dibuja
   exclusivamente con estos índices.
   ============================================================ */
window.MISTICAS = window.MISTICAS || {};

(function (M) {

  // Resolución interna (estilo Amstrad/Spectrum, escalado entero)
  M.SCREEN_W = 320;
  M.SCREEN_H = 200;
  M.HUD_H = 26;                    // barra inferior retro
  M.VIEW_H = M.SCREEN_H - M.HUD_H; // 174 px de mundo visible

  // Rejilla isométrica
  M.TILE_W = 16;
  M.TILE_H = 8;
  M.TILE_HW = 8; // mitad de ancho
  M.TILE_HH = 4; // mitad de alto

  /* Paleta de 16 colores: negros violáceos, púrpuras, magentas,
     carmesí, naranjas de vela y hueso. Fondo negro absoluto. */
  M.PAL = [
    '#000000', // 0  NEGRO absoluto
    '#150A20', // 1  violeta casi negro
    '#271045', // 2  violeta oscuro
    '#3E1568', // 3  púrpura profundo
    '#5D1F9E', // 4  púrpura
    '#8E4AD8', // 5  púrpura claro
    '#C42FA6', // 6  magenta
    '#F462D2', // 7  magenta claro
    '#B0123C', // 8  carmesí
    '#FF2E5E', // 9  carmesí brillante
    '#FF7A1E', // A  naranja (vela)
    '#FFC44D', // B  naranja claro (llama)
    '#E8DCE8', // C  hueso
    '#A898B0', // D  gris violáceo
    '#FFFFFF', // E  blanco (mínimo)
    '#5A0A20', // F  sangre oscura
  ];

  // Alias semánticos
  M.C = {
    BLACK: 0, VDARK: 1, DARK: 2, DPURP: 3, PURP: 4, LPURP: 5,
    MAG: 6, LMAG: 7, CRIM: 8, LCRIM: 9, ORANG: 10, LORAN: 11,
    BONE: 12, BONE2: 13, WHITE: 14, BLOOD: 15
  };

  // Versión y marca
  M.VERSION = 'FASE 1 - EL INICIO';
  M.YEAR = '1987';

  // Estado global de la partida (lo reinicia la pantalla de título)
  M.Game = M.Game || {};

  M.newGameState = function () {
    return {
      hearts: 5,          // barra de vida: 5 corazones
      candles: 0,         // contador de velas
      candlesMax: 3,
      book: 1,            // el niño lleva su libro
      nexus: 0,           // progreso NEXUS CUM NUMINE (0-100)
      nexusFlag: 0,       // para el parpadeo al aumentar
      startTime: 0,
      time: 0,
      deaths: 0,
      hidden: false,      // el niño está oculto tras una columna
      seen: false,        // una hermana lo ha visto
      grace: 0            // invulnerabilidad breve tras ser visto
    };
  };

  // Determinista: hash rápido para detalles por tesela
  M.hash = function (x, y) {
    var h = (x * 374761393 + y * 668265263) | 0;
    h = (h ^ (h >> 13)) * 1274126177 | 0;
    return ((h ^ (h >> 16)) >>> 0) / 4294967295;
  };

  M.clamp = function (v, a, b) { return v < a ? a : (v > b ? b : v); };
  M.lerp = function (a, b, t) { return a + (b - a) * t; };
  M.dist = function (ax, ay, bx, by) {
    var dx = ax - bx, dy = ay - by;
    return Math.sqrt(dx * dx + dy * dy);
  };

})(window.MISTICAS);
