# MÍSTICAS (1987) — El juego maldito

> *«Ut cor sanctae attingas, eius oculis specta.»*

**MÍSTICAS** es una versión jugable, retro e interactiva de *Místicas*, la
ficción sonora de **Manuel Bartual** y **Carmen Pacheco**. El juego simula un
título de culto lanzado en 1987 para ordenadores de 8 bits (Amstrad/Spectrum),
envuelto en una leyenda urbana y en terror psicológico.

**Fan game no oficial y sin ánimo de lucro.** Todo el canon pertenece a sus
autores originales.

---

## Fase 1: EL INICIO

La primera noche, completa y jugable de principio a fin:

1. **ESCENA 1 — EL ÁRBOL** *(Initium)*: un niño lee bajo el árbol. Aparece la
   niña misteriosa vestida de blanco —sin guantes— y le hace una señal.
   El jugador toma el control y la sigue.
2. **ESCENA 2 — EL CAMPO SANTO** *(Transitus)*: niebla, lápidas, relámpagos y
   una inscripción en latín. Entre las tumbas hay nombres que no deberían
   estar (buscad la de *D.D. 1987*).
3. **ESCENA 3 — EL CONVENTO** *(Aditus Occultus)*: la puerta no cede. La
   ventana, sí. Ella ya ha entrado.
4. **ESCENA 4 — LOS PASILLOS** *(Silentium)*: el niño se esconde
   automáticamente tras una columna al vislumbrar el peligro. Después,
   sigilo: una hermana con una vela patrilla los pasillos. Recoge las tres
   velas, muévete de columna en columna sin ser visto y abre la puerta del
   norte. **CONTINUARÁ...**

## Controles

| Tecla | Acción |
|---|---|
| Flechas / WASD | Moverse |
| Espacio / Enter / E | Hablar, examinar, colarse por la ventana |
| P / Esc | Pausa (o botón táctil II) |
| M | Silencio (o botón táctil ♪) |

**Móviles y pantallas táctiles:** cruceta en pantalla, botón de
acción, y dos botones de sistema siempre visibles arriba a la
derecha: **II (pausa)** y **♪ (audio)**, anclados a los bordes con
márgenes seguros (notch). Tocar la pantalla en pausa reanuda;
ningún punto del juego requiere teclado físico.

## Pantalla

El juego vive en un lienzo lógico FIJO de **256×240 px** (la norma NTSC
del cartucho), escalado con **factor entero** siempre que es posible
(nitidez 1:1) y letterbox negro alrededor: nunca se estira, nunca se
recorta, el HUD queda siempre dentro del marco. En móvil los
controles táctiles viven en el negro del letterbox, nunca sobre el
tubo ni sobre el HUD, respetando los márgenes seguros (notch).

## HUD (fiel al canon)

Barra inferior fija de 24 px con filete magenta: 5 corazones carmesí a
la izquierda, contador de **VELAS** (velones que se encienden al
recogerlos) y el marcador **NEXUS** que parpadea en blanco al subir.
La caja de diálogo de narrativa es el clásico panel negro con doble
borde de los RPG de 1987, con máquina de escribir y flecha ▼.

## El motor (réplica Famicom auténtica)

Construido **desde cero** en HTML5 Canvas, sin dependencias. Reglas
innegociables del cartucho:

- **Cero degradados, cero luces suaves, cero transparencias.** Todo se
  dibuja con `fillRect` de píxeles sólidos; la pureza se verifica
  automáticamente (cada píxel del canvas pertenece a la paleta y tiene
  alpha 255).
- **Paleta 2C02 estricta de 16 colores**: negro absoluto, violetas y
  púrpuras sólidos para muros, magenta brillante y carmesí para
  puertas, velas y la capucha del niño.
- **Dioramas cerrados**: recintos estáticos amurallados de ladrillo
  con **arcos góticos equiláteros** (dovelas violetas, clave magenta),
  suelos de losas con juntas — jamás damero.
- **Luz por registros de paleta**, como la PPU: las velas "iluminan"
  sustituyendo el banco de color de las teselas contiguas (púrpura →
  violeta → violeta vivo), nunca con alpha.
- **Sprites de matriz de píxeles** con contorno negro macizo, sin
  sombra difusa bajo los pies.
- **Fundidos por sustitución de paleta** (5 bancos) y glitch de bandas
  desplazadas: nada de velos translúcidos.
- **Audio chiptune** 100% sintetizado (onda cuadrada, ruido de
  casete, campanas, latidos) con planificador que no se corta.

Abre `index.html` en cualquier navegador moderno. No hay dependencias,
no hay compilación, no hay CDN.

## Desplegar en GitHub Pages

El despliegue es **automático**: cada push a la rama `main` lanza el
workflow `.github/workflows/deploy.yml`, que publica el juego en:

**https://sebasm2kuy.github.io/Misticas/**

(Alternativa manual, sin Actions: **Settings → Pages → Source: Deploy
from a branch → main / (root)**.)

El archivo `.nojekyll` (incluido) evita que GitHub Pages ignore algo.

## Estructura del código

```
├── index.html          Entrada y orden de carga del cartucho
├── css/style.css       Carcasa plana (letterbox + joystick translúcido)
└── js/
    ├── config.js       Paleta 2C02, bancos de luz/fundido, constantes
    ├── audio.js        Chip de sonido: chiptune, casete, truenos
    ├── font.js         Fuente pixel 5×7 grabada en CHR (con Ñ)
    ├── input.js        Cruceta + joystick táctil flotante + FUEGO
    ├── screen.js       Televisor: 256×240, factor entero, letterbox
    ├── tiles.js        CHR-ROM: teselas 8×8 horneadas ×3 luces ×5 fundidos
    ├── sprites.js      Matrices de píxeles + arcos góticos procedurales
    ├── room.js         Dioramas: muros, ogivas, lajas, mapa de luz
    ├── entities.js     Niño, ella, la hermana (visión), ratas, murciélagos
    ├── ui.js           HUD, caja de diálogo, pistas, cartelas, PAUSA
    ├── scenes.js       Las 8 pantallas (boot, title, 4 escenas, finales)
    └── main.js         Bucle 60 FPS, cinemáticas, daño, NEXUS, glitch
```

## Hoja de ruta (siguientes fases)

- **Fase 2 — LAS MONJAS**: más patrullas, zoneas de oración, el coro.
- **Fase 3 — LA PIEDRA**: la piedra que no debería existir.
- **Fase 4 — EL ESPEJO**: lo que devuelve el espejo no siempre eres tú.
- **Fase 5 — ???**: el easter egg de David Durán (la lápida ya está).

---

*(C) 1987 — Todos los ritos reservados.*
