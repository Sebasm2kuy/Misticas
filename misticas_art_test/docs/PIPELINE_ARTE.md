# Pipeline de arte — Místicas (Godot 4)

Proceso S0–S5 para producir los fondos y personajes del juego con el estándar
visual de los remasters HD de aventuras noventeras: fondos pintados a mano en
alta resolución, sin líneas de contorno en escenarios, personajes con contorno
limpio y sombreado cel, una identidad de color por sala.

---

## Regla técnica global (no negociable)

| Parámetro | Valor | Motivo |
|---|---|---|
| Lienzo del juego | 1920x1080 | objetivo de composición |
| Resolución de los fondos | **3840x2160 (2x)** | nitidez extra y zooms sin pérdida |
| Escala en motor | 0.5 | el fondo 4K cae al pixel del lienzo |
| Import de texturas | PNG sin pérdida, filtro **LINEAR**, **mipmaps ON** | arte pintado, no pixel art |
| Stretch | `canvas_items` + `aspect keep` | letterbox protegido en cualquier pantalla |
| Renderer | `gl_compatibility` | 2D de primera clase; luces 2D en todas las plataformas |

Calibración: el día 1, validar la cadena de color con una tabla de grises
(¡ojo al doble gamma!). El fondo debe verse igual en Krita, en el editor de
Godot y en el navegador exportado.

## S0 — Biblia de estilo (una vez por juego)

- **Model sheets** de personajes: turnaround (frente/¾/perfil), tabla de
  expresiones, proporciones en cabezas (canon cartoon: 5–6 cabezas).
- **Set de pinceles fijo** (máximo 5): base, textura, veladura, línea,
  corrección. Nada fuera del set entra al archivo.
- **Receta de render** por material: 2–3 valores por forma (sombra/pleno/
  luz), bordes duros, luz horneada en el fondo — no dinámica.
- **Color script global**: 20–40 tonos por sala, identidad de color única
  por habitación (el despacho es lila/ciruela; la capilla será otra cosa).
- Los personajes SÍ llevan contorno limpio y cel shading; las escenas NO
  llevan línea: los bordes nacen de la yuxtaposición de valores.

## S1 — Miniaturas con mapa de interacción (antes de dibujar en grande)

1. 6–10 miniaturas de composición por sala (monocromo, 15 min cada una).
2. Sobre la elegida se decide TODO el gameplay espacial:
   - **Zona caminable** (teselas del suelo / polígono A*).
   - **Hotspots** y su área clicable.
   - **Walk-behinds**: qué capas tendrán línea de suelo propia.
3. Se valida en un gris boceto superpuesto en el motor. Si el mapa de
   interacción no funciona aquí, el fondo bonito no lo arreglará.

## S2 — Perspectiva (la cámara del pintor)

- Horizonte y puntos de fuga fijados en una capa guía.
- Marca de altura del personaje (silueta gris) en 3 profundidades:
  cerca del muro, medio, primer plano. El fondo se pinta PARA esa escala.
- La línea de suelo de cada walk-behind se dibuja en esta fase.

## S3 — Pintura

1. Bloqueo de perspectiva (capa guía congelada).
2. Linearte suave del fondo (sin contorno final).
3. Flat de color con la paleta de la sala (S0).
4. Render con la receta: 2–3 valores por forma, luz principal horneada.
5. Veladuras de atmósfera: enfriar la lejanía, calentar la luz de vela.

## S4 — PSD por capas + especificación de exportación

Estructura fija de capas (misma en todas las salas):

```
00_guias/            (no se exporta)
01_fondo/            fondo completo → backgrounds/<sala>_4k.png
02_walkbehinds/      una capa por objeto → walkbehinds/wb_<obj>_4k.png
03_props/            objetos móviles → props/<obj>.png
04_luces_ref/        (referencia del pintor; no se exporta)
```

- Export PNG sin pérdida a 2x, misma escala en todo.
- Script de exportación (File > Scripts) para que ninguna capa se olvide.

## S5 — QA en motor (checklist por sala)

- [ ] Legibilidad a 1080p desde distancia de sofá.
- [ ] Affordance de cada hotspot: se entiende qué es sin etiqueta.
- [ ] Proporción del personaje contra el fondo en 3 profundidades.
- [ ] Rango de valores: la sala se lee en escala de grises.
- [ ] Los walk-behinds ocultan correctamente (probar el pasillo trasero).
- [ ] La UI no recibe las luces del mundo (capa de visibilidad propia).
- [ ] Prueba de la build web en el navegador (no solo en el editor).

---

*El arte final lo pinta una persona; este pipeline garantiza que lo que
llegue al motor funcione la primera vez.*
