## Místicas — Art Test (Godot 4)
## Sala de prueba: «El Despacho de la Fundadora».
## Un mini-puzle encadenado (antorcha → luz de luna → candelabro → cuadro →
## llave → puerta) que ejercita: pathfinding, walk-behinds, verbos + inventario,
## selección de objetos y luces 2D.
##
## Coordenadas en espacio 1080 (el fondo 4K se dibuja a escala 0.5).
extends "res://scripts/core/room_base.gd"

var lights: Variant = null
var glint: Sprite2D = null


func _ready() -> void:
        super()
        add_bg("res://assets/backgrounds/bg_despacho_4k.png")

        # --- Navegación: teselas convexas del suelo. El servidor enlaza polígonos
        #     solo por aristas IDÉNTICAS (mismos vértices), así que la teselación
        #     se diseña para que cada conexión sea una arista completa compartida.
        #     Grafo: B1-B2a-B2b-C-Db-Da-A2-A1-A3 (el pasillo trasero rodea el escritorio).
        add_walkable([Vector2(1050, 775), Vector2(1650, 775), Vector2(1650, 815), Vector2(1050, 815)])  # A1 tras escritorio
        add_walkable([Vector2(1650, 775), Vector2(1760, 775), Vector2(1760, 815), Vector2(1650, 815)])  # A2 hueco
        add_walkable([Vector2(1760, 775), Vector2(1830, 775), Vector2(1830, 815), Vector2(1760, 815)])  # A3 tras columna
        add_walkable([Vector2(100, 775), Vector2(1050, 775), Vector2(1050, 815), Vector2(100, 815)])  # B1 franja sup. izq.
        add_walkable([Vector2(100, 815), Vector2(1050, 815), Vector2(1050, 1010), Vector2(60, 1010)])  # B2a piso izq. alto
        add_walkable([Vector2(60, 1010), Vector2(1050, 1010), Vector2(1050, 1040), Vector2(60, 1040)])  # B2b piso izq. bajo
        add_walkable([Vector2(1050, 1010), Vector2(1650, 1010), Vector2(1650, 1040), Vector2(1050, 1040)])  # C frente escritorio
        add_walkable([Vector2(1650, 815), Vector2(1760, 815), Vector2(1760, 1010), Vector2(1650, 1010)])  # Da tira dcha. alta
        add_walkable([Vector2(1650, 1010), Vector2(1760, 1010), Vector2(1760, 1040), Vector2(1650, 1040)])  # Db tira dcha. baja

        # --- Walk-behinds (la capa oculta al personaje cuando sus pies quedan
        #     por encima de la línea de suelo del objeto).
        add_walk_behind("columna", "res://assets/walkbehinds/wb_columna_4k.png", 1810.0, 830.0)
        add_walk_behind("escritorio", "res://assets/walkbehinds/wb_escritorio_4k.png", 1350.0, 1010.0)

        # --- Props.
        add_prop("antorcha", "res://assets/props/antorcha.png",
                Vector2(1745, 870), Vector2(170, 450))
        glint = Sprite2D.new()
        glint.name = "BrilloCuadro"
        glint.texture = load("res://assets/props/brillo_cuadro.png")
        glint.scale = Vector2(0.5, 0.5)
        glint.position = Vector2(1300, 430)
        glint.z_index = -50  # sobre el fondo, bajo el personaje
        glint.visible = false
        add_child(glint)
        props["brillo_cuadro"] = glint

        # --- Luces (luna + vela) ---
        lights = load("res://scripts/game/candle_light.gd").new()
        lights.name = "Luces"
        add_child(lights)

        # --- Jugadora (Vera) ---
        add_player(load("res://scenes/characters/Player.tscn"), Vector2(600, 950))

        # --- Suelo (clic libre = caminar) ---
        add_hotspot("suelo",
                [Vector2(80, 770), Vector2(1870, 770), Vector2(1870, 1045), Vector2(80, 1045)],
                NO_WALK, {}, "", true)

        # --- Puerta ---
        add_hotspot("puerta",
                [Vector2(120, 300), Vector2(320, 300), Vector2(320, 760), Vector2(120, 760)],
                Vector2(230, 940),
                {
                        0: _puerta_mirar, 1: _puerta_coger, 2: _puerta_usar, 3: _puerta_hablar,
                        "item": _puerta_item,
                },
                "Sólida y vieja, con cerradura de latón.")

        # --- Ventana (enciende la antorcha con luz de luna) ---
        add_hotspot("ventana",
                [Vector2(520, 220), Vector2(820, 220), Vector2(820, 620), Vector2(520, 620)],
                Vector2(670, 900),
                {
                        0: _ventana_mirar, 1: _ventana_coger, 2: _ventana_usar, 3: _ventana_hablar,
                        "item": _ventana_item,
                },
                "La luna llena entra a raudos.")

        # --- Candelabro (tres velas) ---
        add_hotspot("candelabro",
                [Vector2(1180, 690), Vector2(1360, 690), Vector2(1360, 830), Vector2(1180, 830)],
                Vector2(1350, 1027),
                {
                        0: _candelabro_mirar, 1: _candelabro_coger, 2: _candelabro_usar,
                        3: _candelabro_hablar, "item": _candelabro_item,
                },
                "Tres velas apagadas esperando fuego.")

        # --- Escritorio ---
        add_hotspot("escritorio",
                [Vector2(1050, 830), Vector2(1650, 830), Vector2(1650, 1010), Vector2(1050, 1010)],
                Vector2(1350, 1027),
                {
                        0: _escritorio_mirar, 1: _escritorio_coger, 2: _escritorio_usar,
                        3: _escritorio_hablar,
                },
                "Un escritorio grande en la penumbra.")

        # --- Cuadro de la Fundadora (esconde la llave) ---
        add_hotspot("cuadro",
                [Vector2(1150, 300), Vector2(1450, 300), Vector2(1450, 560), Vector2(1150, 560)],
                Vector2(1300, 1020),
                {
                        0: _cuadro_mirar, 1: _cuadro_coger, 2: _cuadro_coger, 3: _cuadro_hablar,
                        "item": _cuadro_item,
                },
                "Un retrato grande preside el despacho.")

        # --- Antorcha (prop clicable) ---
        add_hotspot("antorcha",
                [Vector2(1690, 690), Vector2(1760, 690), Vector2(1760, 870), Vector2(1690, 870)],
                Vector2(1745, 955),
                {
                        0: _antorcha_mirar, 1: _antorcha_coger, 2: _antorcha_usar, 3: _antorcha_hablar,
                },
                "Una antorcha apagada apoyada junto al escritorio.")

        # --- Columna ---
        add_hotspot("columna",
                [Vector2(1760, 180), Vector2(1860, 180), Vector2(1860, 830), Vector2(1760, 830)],
                Vector2(1700, 950),
                {
                        0: _columna_mirar, 1: _columna_coger, 2: _columna_usar, 3: _columna_hablar,
                },
                "Una columna lila que oculta media sala.")

        build_room()


# ---------- helpers ----------
func _fb(text: String) -> void:
        GameState.send_feedback(text)


func _take_key() -> void:
        GameState.set_flag("llave_tomada")
        GameState.add_item("llave")
        glint.visible = false
        _fb("Del bolsillo trasero del lienzo cae una llave antigua, tibia al tacto.")


func _open_door() -> void:
        GameState.set_flag("door_open")
        _fb("La llave gira con un chasquido seco, como un suspiro. El despacho queda abierto.")
        ## señal directa (sin corrutina): robusta en headless y en navegador.
        get_tree().create_timer(2.5).timeout.connect(_show_end)


func _show_end() -> void:
        var ui: Variant = get_node_or_null("/root/Main/UI_Game")
        if ui:
                ui.show_end()


# ---------- puerta ----------
func _puerta_mirar() -> void: _fb("Sólida y vieja, con cerradura de latón. Huele a cera y a encierro.")
func _puerta_coger() -> void: _fb("La puerta no se mueve. Esta puerta no se deja tocar.")
func _puerta_usar() -> void: _fb("Cerrada con llave. No creo que la fuerce.")
func _puerta_hablar() -> void: _fb("Llamo dos veces. Nadie responde. Nadie responderá.")

func _puerta_item(item: String) -> void:
        if item == "llave" and GameState.has_item("llave"):
                if not GameState.has_flag("door_open"):
                        _open_door()
                else:
                        _fb("Ya está abierta. No hay nada más que abrir.")
        elif item == "antorcha":
                _fb("Mejor no provocar un incendio en el único sitio seco del convento.")
        else:
                _fb("No es el momento. Ni el lugar.")


# ---------- ventana ----------
func _ventana_mirar() -> void:
        _fb("La luna llena entra a raudos. La noche está en calma... demasiada calma.")
func _ventana_coger() -> void: _fb("Es una ventana. Sigue siendo una ventana.")
func _ventana_usar() -> void: _fb("No se me ocurre qué hacer con una ventana. Dejarla estar.")
func _ventana_hablar() -> void: _fb("Afuera, el silencio. Adentro, también.")

func _ventana_item(item: String) -> void:
        if item != "antorcha":
                _fb("No es el momento. Ni el lugar.")
        elif GameState.has_flag("antorcha_lit"):
                _fb("La antorcha ya arde con luz de luna.")
        else:
                GameState.set_flag("antorcha_lit")
                GameState.send_feedback("El rayo de luna baña la antorcha. Una llama fría y azul se enciende sola. No quema: ilumina.")
                GameState.inventory_changed.emit()


# ---------- candelabro ----------
func _candelabro_mirar() -> void:
        if GameState.has_flag("candelabro_lit"):
                _fb("Las tres velas arden con llama tranquila. El humo sube en espiral.")
        else:
                _fb("Tres velas apagadas, tres mechas blancas. Esperan fuego.")
func _candelabro_coger() -> void: _fb("Las velas se quedan. Son del despacho, no mías.")
func _candelabro_usar() -> void: _fb("Necesitaría fuego. Y no veo ninguno por aquí.")
func _candelabro_hablar() -> void: _fb("El fuego, cuando quiere, ya habla solo.")

func _candelabro_item(item: String) -> void:
        if item != "antorcha":
                _fb("No es el momento. Ni el lugar.")
        elif not GameState.has_flag("antorcha_lit"):
                _fb("La antorcha no tiene llama. Una antorcha apagada no enciende nada.")
        elif GameState.has_flag("candelabro_lit"):
                _fb("El candelabro ya arde.")
        else:
                lights.light_candles()
                _fb("Acas el fuego frío de la luna prende las tres mechas a la vez. La sala respira.")


# ---------- escritorio ----------
func _escritorio_mirar() -> void:
        if GameState.has_flag("candelabro_lit"):
                _fb("Caoba oscura. El cajón está cerrado con llave; en el latón, grabado: «S. L. M.».")
        else:
                _fb("Demasiado oscuro. Solo distingo la silueta del escritorio.")
func _escritorio_coger() -> void: _fb("Es un escritorio. Va a seguir siéndolo.")
func _escritorio_usar() -> void:
        if GameState.has_flag("candelabro_lit"):
                _fb("El cajón está cerrado con llave. En el latón, grabado: «S. L. M.».")
        else:
                _fb("Un cajón en la oscuridad. No puedo ni encontrarlo.")
func _escritorio_hablar() -> void: _fb("La madera cruje. Quizá me escucha.")


# ---------- cuadro ----------
func _cuadro_mirar() -> void:
        if GameState.has_flag("candelabro_lit"):
                _fb("El retrato de la Fundadora te observa desde el marco. Detrás del lienzo, algo metálico brilla.")
                if not GameState.has_flag("llave_tomada"):
                        glint.visible = true
        else:
                _fb("En la penumbra no se distingue nada.")

func _cuadro_coger() -> void:
        if GameState.has_flag("candelabro_lit") and not GameState.has_flag("llave_tomada"):
                _take_key()
        elif GameState.has_flag("llave_tomada"):
                _fb("El retrato vuelve a ser solo un retrato.")
        else:
                _fb("No veo nada ahí.")

func _cuadro_hablar() -> void: _fb("La Fundadora sonríe. No es un consuelo.")

func _cuadro_item(item: String) -> void:
        if item == "antorcha" and GameState.has_flag("antorcha_lit") \
                        and not GameState.has_flag("candelabro_lit"):
                _fb("Acariciar el lienzo con una llama... mejor no.")
        else:
                _fb("No es el momento. Ni el lugar.")


# ---------- antorcha ----------
func _antorcha_mirar() -> void:
        if GameState.has_flag("antorcha_lit"):
                _fb("Una antorcha con copa de latón. Arde con llama fría y azul.")
        else:
                _fb("Una antorcha de madera oscura con copa de latón. Apagada.")
func _antorcha_coger() -> void:
        if not GameState.has_item("antorcha"):
                GameState.add_item("antorcha")
                props["antorcha"].visible = false
                hotspots["antorcha"].input_pickable = false
                _fb("Has cogido la antorcha. Pesa menos de lo que promete.")
func _antorcha_usar() -> void: _fb("Con la copa vacía no puedo usarla para nada.")
func _antorcha_hablar() -> void: _fb("Las antorchas escuchan mejor de lo que hablan.")


# ---------- columna ----------
func _columna_mirar() -> void:
        _fb("La columna oculta media sala. Cualquiera podría esconderse detrás. O cualquier cosa.")
func _columna_coger() -> void: _fb("Ni con las dos manos y la fe de tres conventos.")
func _columna_usar() -> void: _fb("Puedo pasar por detrás: es más ancha que yo.")
func _columna_hablar() -> void: _fb("La piedra no está de humor.")
