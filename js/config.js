'use strict';
/* ============================================================
   MÍSTICAS — (C) 1987 — config.js
   Espacio de nombres global, paleta ultra reducida de 16
   colores y constantes del motor. Todo el juego dibuja
   exclusivamente con estos índices.
   ============================================================ */
window.MISTICAS = window.MISTICAS || {};

(function (M) {

  // Resolución base (estilo Amstrad/Spectrum). El juego arranca con
  // esta resolución y main.js la EXTIENDE en vivo (_resize) para
  // ocupar el 100% de la pantalla: en escritorio con factor de píxel
  // entero (nitidez 1:1) y en móvil con escala continua. Todo el
  // motor dibuja leyendo M.SCREEN_W / M.SCREEN_H en tiempo real.
  M.SCREEN_W = 320;
  M.SCREEN_H = 200;
  M.HUD_H = 36;                    // barra inferior retro (marco NEXUS de 30 px)
  M.VIEW_H = M.SCREEN_H - M.HUD_H; // alto de mundo visible (se recalcula)

  // Móvil en vertical: el mundo llena el alto máximo y la cámara se
  // estrecha. Suelo de ancho interno para que el HUD compacto y los
  // textos sigan siendo legibles (24 caracteres por línea).
  M.MIN_VIEW_W = 144;

  // ¿La resolución interna es estrecha? (HUD compacto, textos partidos)
  M.isNarrow = function () { return M.SCREEN_W < 240; };

  // Rejilla isométrica
  M.TILE_W = 16;
  M.TILE_H = 8;
  M.TILE_HW = 8; // mitad de ancho
  M.TILE_HH = 4; // mitad de alto

  /* Paleta de 16 colores según las capturas reales del canon:
     negro absoluto, morados estructurales (#7A1FD0 / #8A2BE2),
     rosa salmón (#FFA8A0) para aristas y marcos, rojo vivo
     (#E8281E) para la capucha y los corazones, naranjas de vela
     y hueso. Sin degradados: relleno plano + contorno. */
  M.PAL = [
    '#000000', // 0  NEGRO absoluto (fondo)
    '#170B26', // 1  violeta casi negro (suelos base)
    '#2E1248', // 2  violeta oscuro (manchas, sombra)
    '#5A15A0', // 3  púrpura profundo (contornos gruesos)
    '#7A1FD0', // 4  morado estructural (líneas de losas)
    '#8A2BE2', // 5  púrpura saturado (arcos, fantasmas)
    '#A06BF0', // 6  violeta luminoso (iluminación)
    '#FFA8A0', // 7  ROSA SALMÓN (aristas iluminadas, marcos HUD)
    '#E8281E', // 8  ROJO VIVO (capucha, corazones, latín)
    '#FF4A2A', // 9  rojo-naranja (alertas, fantasma)
    '#FF7A1E', // A  naranja (llama de vela)
    '#FFC44D', // B  naranja claro (llama interior)
    '#E8E0D0', // C  hueso (cráneos, texto principal)
    '#A890B8', // D  gris violáceo (texto secundario, piedra)
    '#FFF3EA', // E  blanco cálido mínimo (brillo)
    '#C01818', // F  rojo sangre (contornos de corazón)
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
