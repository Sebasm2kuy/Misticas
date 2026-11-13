## Místicas — Art Test (Godot 4)
## Autotest headless: recorre el puzle completo de principio a fin usando los
## mismos caminos de código que el jugador (request_action -> arrived -> resolver),
## y verifica flags, inventario, pathfinding, walk-behinds y cambios visuales.
## Máquina de estados dirigida por frames (sin corrutinas): main.gd llama tick().
## Debe terminar imprimiendo SMOKE_TEST_OK.
class_name SmokeTest
extends RefCounted

var failures: Array[String] = []
var _room: RoomBase = null
var _player: Variant = null
var _lights: Variant = null
var _state := 0
var _t := 0.0
var _guard := 0
const GUARD_MAX := 900  # ~15 s de frames en el paso que sea


func run(main: Variant) -> bool:
        _room = main.room
        if _room == null or _room.get("player") == null:
                _fail("la sala no se construyó (¿script de sala con errores?)")
                return false
        _player = _room.player
        _lights = _room.lights
        _player.smoke_fast = true
        GameState.set_verb(1)  # COGER
        print("=== SMOKE TEST: Art Test de Místicas ===")
        print("S1  coger antorcha (pathfinding hasta el prop)")
        _room.request_action(_room.hotspots["antorcha"])
        _state = 1
        _guard = 0
        _t = 0.0
        return true


func tick(delta: float) -> bool:
        ## devuelve false cuando el test terminó (main.gd deja de llamarlo).
        _guard += 1
        _t += delta
        if _guard > GUARD_MAX:
                _fail("timeout del smoke test en el paso %d" % _state)
                return false
        match _state:
                1:  # S1: caminar completado -> comprobaciones
                        if not _player.walking:
                                _check(_player.global_position.distance_to(Vector2(1745, 955)) < 45.0,
                                        "S1: jugador no llegó al walk_to (%s)" % _player.global_position)
                                _check(GameState.has_item("antorcha"), "S1: antorcha no está en el inventario")
                                _check(not _room.props["antorcha"].visible, "S1: el prop antorcha sigue visible")
                                print("S2  encender antorcha con luz de luna")
                                GameState.select_item("antorcha")
                                _room.request_action(_room.hotspots["ventana"])
                                _state = 2
                                _guard = 0
                2:  # S2
                        if not _player.walking:
                                _check(GameState.has_flag("antorcha_lit"), "S2: flag antorcha_lit no puesto")
                                _check(GameState.item_icon_path("antorcha").ends_with("item_antorcha_lit.png"),
                                        "S2: el icono de la antorcha no cambió a encendida")
                                print("S3  encender candelabro")
                                _room.request_action(_room.hotspots["candelabro"])
                                _state = 3
                                _guard = 0
                3:  # S3
                        if not _player.walking:
                                _check(GameState.has_flag("candelabro_lit"), "S3: flag candelabro_lit no puesto")
                                _check(_lights.lit, "S3: las luces no se encendieron")
                                _check(_lights.candle.energy > 0.9, "S3: la PointLight2D de la vela no emite")
                                _check(_lights.flames.size() == 3 and _lights.flames[0].visible,
                                        "S3: llamas no visibles")
                                _check(_lights.smoke.emitting, "S3: el humo de vela no emite")
                                print("S4  mirar y descolgar la llave del cuadro")
                                GameState.select_item("")
                                GameState.set_verb(1)
                                _room.request_action(_room.hotspots["cuadro"])
                                _state = 4
                                _guard = 0
                4:  # S4
                        if not _player.walking:
                                _check(GameState.has_item("llave"), "S4: llave no está en el inventario")
                                _check(GameState.has_flag("llave_tomada"), "S4: flag llave_tomada no puesto")
                                _check(not _room.get("glint").visible, "S4: el brillo del cuadro sigue visible")
                                print("S5  abrir la puerta con la llave")
                                GameState.select_item("llave")
                                _room.request_action(_room.hotspots["puerta"])
                                _state = 5
                                _guard = 0
                5:  # S5
                        if not _player.walking:
                                _check(GameState.has_flag("door_open"), "S5: flag door_open no puesto")
                                print("S6  caminar tras el escritorio (pasillo) y verificar oclusión")
                                _player.walk_to(Vector2(1250, 795))
                                _state = 6
                                _guard = 0
                6:  # S6a: tras el escritorio
                        if not _player.walking:
                                _check(_player.global_position.distance_to(Vector2(1250, 795)) < 45.0,
                                        "S6: jugador no llegó al pasillo (%s)" % _player.global_position)
                                _check(_room.walk_behinds["escritorio"].is_behind(_player.global_position),
                                        "S6: el jugador tras el escritorio no queda oculto (y-sort)")
                                _check(_room.walk_behinds["columna"].is_behind(_player.global_position),
                                        "S6: el jugador tras la columna no queda oculto (y-sort)")
                                _player.walk_to(Vector2(1350, 1027))
                                _state = 7
                                _guard = 0
                7:  # S6b: delante del escritorio
                        if not _player.walking:
                                _check(not _room.walk_behinds["escritorio"].is_behind(_player.global_position),
                                        "S6: delante del escritorio debería verse (y-sort)")
                                print("S7  esperando pantalla de fin...")
                                _state = 8
                                _guard = 0
                                _t = 0.0
                8:  # S7: esperar el overlay de fin (sondeo con tope)
                        var main: Variant = Engine.get_main_loop().root.get_node("Main")
                        var ui: Variant = main.get_node_or_null("UI_Game")
                        if ui != null and ui.get("end_visible"):
                                _finish()
                                return false
                        if _t >= 6.0:
                                _check(false, "S7: pantalla de fin no visible")
                                _finish()
                                return false
        return true


func _finish() -> void:
        if not failures.is_empty():
                for f in failures:
                        print("FALLO: " + f)
                print("=== SMOKE_TEST_FAIL ===")
                var tree := Engine.get_main_loop() as SceneTree
                tree.quit(1)
                return
        print("=== SMOKE_TEST_OK ===")
        var tree := Engine.get_main_loop() as SceneTree
        tree.quit(0)


func _check(cond: bool, msg: String) -> void:
        if cond:
                return
        failures.append(msg)


func _fail(msg: String) -> void:
        print("FALLO: " + msg)
        print("=== SMOKE_TEST_FAIL ===")
        var tree := Engine.get_main_loop() as SceneTree
        tree.quit(1)
