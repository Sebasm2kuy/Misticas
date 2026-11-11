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
| Flechas / WASD | Moverse (isométrico) |
| Espacio / Enter / E | Hablar, examinar, colarse por la ventana |
| P / Esc | Pausa |
| M | Silencio |

En pantallas táctiles aparecen controles en pantalla.

## Cómo jugar

Abre `index.html` en cualquier navegador moderno. No hay dependencias,
no hay compilación, no hay CDN: todo (gráficos, fuente pixel, música de
*beeper*, ruido de casete, efectos CRT) se genera por código.

## Desplegar en GitHub Pages

El despliegue es **automático**: cada push a la rama `main` lanza el
workflow `.github/workflows/deploy.yml`, que publica el juego en:

**https://sebasm2kuy.github.io/Misticas/**

(Alternativa manual, sin Actions: **Settings → Pages → Source: Deploy
from a branch → main / (root)**.)

El archivo `.nojekyll` (incluido) evita que GitHub Pages ignore algo.

## Estructura del código

```
├── index.html          Entrada y orden de carga
├── css/style.css       Monitor CRT (scanlines, viñeta, parpadeo)
└── js/
    ├── config.js       Paleta de 16 colores y constantes
    ├── font.js         Fuente pixel 5×7 embebida (con Ñ)
    ├── input.js        Teclado + táctil
    ├── audio.js        Beeper: chiptune, casete, truenos, latidos
    ├── sprites.js      Pixel-art por mapas de caracteres + árbol/luna
    ├── iso.js          Motor isométrico (teselas 16×8, orden pintor)
    ├── fx.js           Glitch, fundidos, relámpagos, niebla, cielo
    ├── ui.js           HUD (5 corazones, NEXUS CUM NUMINE, contadores)
    ├── entities.js     Niño, niña guía, hermana (visión y sigilo)
    ├── world.js        Base de escenas de mundo
    └── scenes/
        ├── boot.js     Arranque + carga de cinta
        ├── title.js    Portada
        ├── tree.js     Escena 1: el árbol
        ├── cemetery.js Escena 2: el campo santo
        ├── conventext.js Escena 3: la fachada
        └── convent.js  Escena 4: los pasillos (sigilo)
```

## Hoja de ruta (siguientes fases)

- **Fase 2 — LAS MONJAS**: más patrullas, zoneas de oración, el coro.
- **Fase 3 — LA PIEDRA**: la piedra que no debería existir.
- **Fase 4 — EL ESPEJO**: lo que devuelve el espejo no siempre eres tú.
- **Fase 5 — ???**: el easter egg de David Durán (la lápida ya está).

---

*(C) 1987 — Todos los ritos reservados.*
