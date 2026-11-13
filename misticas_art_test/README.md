# Místicas — Art Test (Godot 4)

Prototipo de motor de aventura gráfica point-and-click con estética de
caricatura noventera en alta resolución. Una sola sala jugable, "El Despacho
de la Fundadora", con un mini-puzle encadenado completo que ejercita todos
los sistemas del futuro juego.

> Nota: es un sucesor espiritual con IP propia. Nada aquí proviene de
> Day of the Tentacle; el estándar visual de referencia es el del remaster
> HD (fondos pintados a mano, colores vibrantes, personajes contorneados).

---

## Requisitos y ejecución

1. Godot 4.3 o superior (validado con **Godot 4.4**, renderer GL Compatibility).
2. Abrir Godot -> "Importar" -> seleccionar `project.godot` de esta carpeta.
3. F5 (ejecutar proyecto). No hay que configurar nada más.

Autotest sin gráficos (CI / verificación rápida):

```bash
godot --headless --path . -- --smoke
```

Ejecuta el puzle entero de principio a fin y comprueba flags, inventario,
pathfinding y cambios visuales. Debe terminar imprimiendo `SMOKE_TEST_OK`.

## Controles

| Acción | Control |
|---|---|
| Usar el verbo activo sobre un hotspot | Clic izquierdo |
| Mirada rápida (sin caminar) | Clic derecho |
| Seleccionar verbo | Clic en la barra, o teclas `1-4` |
| Seleccionar / deseleccionar objeto | Clic en el slot del inventario |
| Salir / pantalla completa | `ESC` / `F11` |

## Checklist de pruebas (qué demostrar con esta sala)

- [x] **Render HD**: fondo 3840x2160 (2x) sobre lienzo 1920x1080, filtro LINEAR, letterbox protegido.
- [x] **Pathfinding**: A* sobre teselas del suelo; rodea el escritorio por el pasillo trasero (probar: puerta -> trastierras -> delante del escritorio).
- [x] **Walk-behinds**: camina tras la columna y tras el escritorio: el personaje queda oculto por capas con línea de suelo (y-sort).
- [x] **Luces 2D**: luna fría constante + vela cálida parpadeante con humo de partículas; la UI no recibe luz (capa de visibilidad propia).
- [x] **Verbos + inventario**: los 4 verbos, 8 slots, selección de objeto con icono que cambia de estado (antorcha apagada/encendida).
- [x] **Puzle encadenado**: antorcha -> luz de luna -> candelabro -> cuadro -> llave -> puerta (fin de partida).
- [x] **Legibilidad a 1080p** desde distancia de sofá: feedback, verbos y hotspot affordance.

## Estructura

```
misticas_art_test/
├── project.godot          # 1920x1080, canvas_items+keep, gl_compatibility
├── export_presets.cfg     # Web sin hilos (GitHub Pages friendly)
├── assets/
│   ├── backgrounds/       # bg 4K (2x) a escala 0.5
│   ├── walkbehinds/       # capas con alpha, línea de suelo propia
│   ├── characters/vera/   # 6 fotogramas (idle x2, walk x4) a 2x
│   ├── cursors/           # un cursor por verbo + objeto
│   ├── icons/             # iconos de inventario (con variante encendida)
│   ├── lights/            # gradiente radial para PointLight2D
│   └── props/             # antorcha, llama, brillo
├── scenes/                # Main, Room_Test, Player, UI_Game
├── scripts/
│   ├── core/              # game_state (autoload), room_base, hotspot,
│   │                      # walk_behind, main, smoke_test
│   ├── game/              # player, room_test (puzle), candle_light
│   └── ui/                # ui_game
└── docs/PIPELINE_ARTE.md  # proceso S0-S5 del arte del juego
```

## Pipeline de arte

El proceso completo (biblia de estilo, miniaturas con zonas de interacción,
perspectiva, render, PSD por capas, QA en motor) está documentado en
[`docs/PIPELINE_ARTE.md`](docs/PIPELINE_ARTE.md).

## Exportar a web

```bash
godot --headless --path . --export-release "Web"
# genera build_web/ (WebGL2 sin hilos: funciona en GitHub Pages sin COOP/COEP)
```

---

*Fan game no oficial y sin ánimo de lucro. Místicas es obra de Manuel Bartual
y Carmen Pacheco; todo el canon pertenece a sus autores. Hecho con Godot 4.*
