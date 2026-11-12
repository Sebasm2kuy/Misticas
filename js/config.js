'use strict';
/* ============================================================
   MÍSTICAS — (C) 1987 — config.js
   Espacio de nombres global, paleta ultra reducida de 16
   colores y constantes del motor. Todo el juego dibuja
   exclusivamente con estos índices.
   ============================================================ */
window.MISTICAS = window.MISTICAS || {};

(function (M) {

  // Resolución lógica INTERNA FIJA (4:3, monitor de 1987): 320x240.
  // Todo el juego (mundo + HUD + textos) se dibuja SIEMPRE dentro de
  // este lienzo virtual: el HUD jamás queda fuera del marco. main.js
  // solo la ESCALA al tamaño de la ventana con letterbox (fit-contain,
  // barras negras) y coloca los controles táctiles fuera del tubo.
  M.SCREEN_W = 320;
  M.SCREEN_H = 240;
  M.HUD_H = 36;                    // barra inferior retro (marco NEXUS de 32 px)
  M.VIEW_H = M.SCREEN_H - M.HUD_H; // alto de mundo visible: 204 px

  // Reserva de banda superior/inferior para los controles táctiles
  // cuando las barras del letterbox no dan espacio de sobra.
  M.TOUCH_TOP = 48;
  M.TOUCH_BOTTOM_TALL = 124; // zona inferior: joystick (104) + FUEGO + aire
  M.TOUCH_BOTTOM_WIDE = 56;   // (legacy: banda lateral holgada)

  // ¿La resolución interna es estrecha? (legacy: ahora es fija y ancha)
  M.isNarrow = function () { return M.SCREEN_W < 240; };

  // Rejilla isométrica
  M.TILE_W = 16;
  M.TILE_H = 8;
  M.TILE_HW = 8; // mitad de ancho
  M.TILE_HH = 4; // mitad de alto

  /* Paleta de 16 colores RÉPLICA EXACTA del metraje del podcast
     (medida sobre los fotogramas a resolución completa):
     - Suelo del convento: damero de rombos #6D28D9 sobre #1E0B26
       con junta negra (como en la sala amueblada del video).
     - Muros: ladrillo carmín (#8E1B12 sombra / #D93025 cara) con
       mortero negro; familia violeta (#5B21B6) para criptas.
     - Aristas y marcos: rosa salmón #E8A0A0 (pilastros, sillas,
       capitel, velas, filetes del HUD).
     - Acentos hipervibrantes: carmesí #D93025 (puertas, arcos,
       corazones, capucha, inscripción NEXUS). */
  M.PAL = [
    '#000000', // 0  NEGRO absoluto (fondo, mortero, contornos)
    '#1E0B26', // 1  VDARK: damero oscuro del suelo, piedra de noche
    '#2A1038', // 2  DARK: masa violeta (suelos, pelo de la niña)
    '#6D28D9', // 3  DPURP: damero CLARO violeta + pantalón azul-violeta
    '#5B21B6', // 4  PURP: púrpura profundo de marcos (arcos, slots)
    '#8B5CF6', // 5  LPURP: violeta luminoso (damero encendido, llama del aplique)
    '#A06BF0', // 6  MAG: violeta vivo (frutos, murciélagos, marcador)
    '#E8A0A0', // 7  LMAG: SALMÓN (aristas, sillas, cara del niño, cera)
    '#D93025', // 8  CRIM: CARMESÍ (ladrillo claro, capucha, corazones, latín)
    '#FF4A2A', // 9  LCRIM: rojo alerta (destellos, NEXUS al subir)
    '#FF7A1E', // A  naranja (llama de vela)
    '#FFC44D', // B  naranja claro (llama interior)
    '#E8E0D0', // C  hueso (cráneos, texto principal)
    '#A890B8', // D  gris violáceo (texto secundario, piedra)
    '#FFF3EA', // E  blanco cálido mínimo (brillo, vestido)
    '#8E1B12', // F  BLOOD: marrón ladrillo (sombra de capucha, botas,
    //               contorno de corazones, junta del gótico)
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

  /* ============================================================
     REGISTROS DE PALETA POR NIVEL DE LUZ (estilo PPU de la NES)
     El chip gráfico de 1987 no sabía mezclar colores: una vela
     "iluminaba" cambiando DIRECTAMENTE el registro de color de
     los tiles contiguos. Aquí cada nivel de luz es una tabla de
     sustitución índice→índice sobre la paleta de 16 colores:
       nivel 3 = TORCIDO POR LA LUZ (bloque junto a la llama:
                 las masas saltan a violeta vivo y las aristas a
                 blanco puro — el "cambio de registro" del canon)
       nivel 2 = NORMAL (paleta tal cual)
       nivel 1 = PENUMBRA (cada color cae dos rangos)
       nivel 0 = OSCURIDAD (siluetas: todo colapsa a violeta
                 casi negro y negro mortero)
     NUNCA alpha, NUNCA degradados: solo colores planos que se
     sustituyen de golpe, tesela a tesela.
     ============================================================ */
  M.PALSWAP = [
    /* 0 OSCURIDAD */ [0, 1, 1, 1, 1, 2, 2, 4, 2, 15, 10, 11, 13, 1, 13, 1],
    /* 1 PENUMBRA  */ [0, 1, 1, 2, 2, 3, 4, 6, 15, 8, 10, 11, 13, 4, 12, 2],
    /* 2 NORMAL    */ [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    /* 3 LIT       */ [0, 3, 5, 6, 5, 7, 7, 14, 9, 9, 10, 11, 14, 7, 14, 8]
  ];

  // Aplica una tabla de sustitución SOLO durante fn: respalda
  // M.PAL, la intercambia en sitio, ejecuta y restaura. Así los
  // constructores de canvas (puertas, arcos…) se "hornear" por
  // nivel de luz exactamente como la NES horneaba sus tiles con
  // cada banco de paleta.
  M.withPalette = function (swap, fn) {
    var backup = M.PAL.slice();
    for (var i = 0; i < 16; i++) M.PAL[i] = backup[swap[i]];
    try { return fn(); }
    finally { for (var j = 0; j < 16; j++) M.PAL[j] = backup[j]; }
  };

  // Remapa hexadecimal (carácter→carácter) para Spr.draw: convierte
  // la tabla de nivel en el diccionario que usan los sprites.
  M.remapFor = function (level) {
    var sw = M.PALSWAP[level];
    var rm = {};
    for (var i = 0; i < 16; i++) rm[i.toString(16).toUpperCase()] = sw[i].toString(16).toUpperCase();
    return rm;
  };

  M.clamp = function (v, a, b) { return v < a ? a : (v > b ? b : v); };
  M.lerp = function (a, b, t) { return a + (b - a) * t; };
  M.dist = function (ax, ay, bx, by) {
    var dx = ax - bx, dy = ay - by;
    return Math.sqrt(dx * dx + dy * dy);
  };

})(window.MISTICAS);
