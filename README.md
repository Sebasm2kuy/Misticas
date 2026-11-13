# MÍSTICAS — Aventura gráfica (Godot 4)

> **Art test** del futuro juego de aventura *point-and-click* ambientado en el
> universo de *Místicas*, la ficción sonora de **Manuel Bartual** y
> **Carmen Pacheco**. Fan game no oficial y sin ánimo de lucro: todo el canon
> pertenece a sus autores.

Prototipo de motor con estética de caricatura noventera en alta resolución:
una sala jugable completa («El Despacho de la Fundadora») que ejercita todos
los sistemas del futuro juego — fondos HD/4K pintados a mano, pathfinding,
*walk-behinds*, interfaz de verbos + inventario y luces 2D.

---

## Jugar ahora (web)

**<https://sebasm2kuy.github.io/Misticas/>**

Export WebGL2 **sin hilos** (compatible con GitHub Pages, no requiere
cabeceras COOP/COEP). Validada en navegador de principio a fin.

## Estructura del repositorio

| Carpeta | Qué es |
|---|---|
| `misticas_art_test/` | **Fuente Godot 4** del art test (proyecto activo) |
| `web/` | Build web exportada — lo que se despliega en Pages |
| `version_anterior/` | El juego anterior (2026): motor 8-bit Famicom/NES escrito desde cero en JS, Fase 1 completa y jugable |

## Abrir el proyecto en Godot

1. Instalar **Godot 4.4 o superior** (renderer GL Compatibility).
2. Godot → *Importar* → seleccionar `misticas_art_test/project.godot`.
3. `F5` para ejecutar. No hay que configurar nada más.

Autotest de la lógica (CI / verificación rápida):

```bash
godot --headless --path misticas_art_test -- --smoke
# debe terminar imprimiendo SMOKE_TEST_OK
```

## Re-exportar la build web

```bash
godot --headless --path misticas_art_test --export-release "Web"
# genera misticas_art_test/build_web/  (preset sin hilos, GL Compatibility)
cp misticas_art_test/build_web/* web/   # y commit + push
```

El workflow `.github/workflows/deploy.yml` despliega la carpeta `web/`
a GitHub Pages en cada push a `main`.

## Pipeline de arte

El proceso S0–S5 (biblia de estilo, miniaturas con zonas de interacción,
perspectiva, render, PSD por capas, QA en motor) está documentado en
[`misticas_art_test/docs/PIPELINE_ARTE.md`](misticas_art_test/docs/PIPELINE_ARTE.md).

## Historial de versiones

- **v0 «Art Test» (2026-11)** — esta versión: motor Godot 4, sala completa
  con mini-puzle encadenado, humo de vela y luz de luna.
- **Versión anterior (2026)** — juego 8-bit estilo Famicom/NES (motor propio
  en JS, 256×240, chiptune): archivado íntegro en `version_anterior/`.
  Seguirá disponible en el historial de git.

## Controles (build y editor)

| Acción | Control |
|---|---|
| Usar el verbo activo sobre un hotspot | Clic izquierdo |
| Mirada rápida (sin caminar) | Clic derecho |
| Seleccionar verbo | Clic en la barra, o teclas `1-4` |
| Seleccionar objeto del inventario | Clic en el slot |
| Salir / pantalla completa | `ESC` / `F11` |
