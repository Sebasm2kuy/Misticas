## Místicas — Art Test (Godot 4)
## UI: barra de verbos (MIRAR/COGER/USAR/HABLAR), inventario de 8 huecos con
## selección, línea de feedback, cursor por verbo/objeto, ayuda, marca de agua
## y pantalla de fin. La UI vive en su capa de visibilidad propia: las luces 2D
## del mundo no la tocan.
extends CanvasLayer

const SLOT_COUNT := 8
const COLOR_PANEL := Color(0.10, 0.08, 0.15, 0.92)
const COLOR_TEXT := Color(0.72, 0.74, 0.87)
const COLOR_ACTIVE := Color(0.56, 0.69, 1.0)
const COLOR_INACTIVE := Color(0.73, 0.74, 0.85)
const COLOR_HELP := Color(0.58, 0.60, 0.75)

var root: Control = null
var verb_buttons: Array[Button] = []
var slot_panels: Array[Panel] = []
var slot_icons: Array[TextureRect] = []
var feedback_label: Label = null
var cursor: Sprite2D = null
var end_overlay: Control = null
var _clear_timer: Timer = null
var end_visible := false


func _ready() -> void:
        root = Control.new()
        root.name = "Root"
        root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
        root.mouse_filter = Control.MOUSE_FILTER_IGNORE
        add_child(root)
        _no_light(root)

        _build_bar()
        _build_feedback()
        _build_help()
        _build_watermark()
        _build_cursor()
        _build_end()

        _clear_timer = Timer.new()
        _clear_timer.wait_time = 4.0
        _clear_timer.one_shot = true
        _clear_timer.timeout.connect(func():
                if feedback_label:
                        feedback_label.text = "")
        add_child(_clear_timer)

        GameState.verb_changed.connect(func(_i): refresh_verbs(); refresh_cursor())
        GameState.item_selected.connect(func(_id): refresh_slots(); refresh_cursor())
        GameState.inventory_changed.connect(func(): refresh_slots())
        GameState.feedback.connect(_on_feedback)

        refresh_verbs()
        refresh_slots()
        refresh_cursor()
        Input.mouse_mode = Input.MOUSE_MODE_HIDDEN


func _no_light(node: Node) -> void:
        ## la UI no recibe las luces 2D de la sala.
        if node is CanvasItem:
                (node as CanvasItem).visibility_layer = 2
        for c in node.get_children():
                _no_light(c)


func _build_bar() -> void:
        var bar := PanelContainer.new()
        bar.name = "Barra"
        bar.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_WIDE)
        bar.offset_top = -96
        var sb := StyleBoxFlat.new()
        sb.bg_color = COLOR_PANEL
        sb.border_width_top = 2
        sb.border_color = Color(0.30, 0.27, 0.48)
        bar.add_theme_stylebox_override("panel", sb)
        root.add_child(bar)
        _no_light(bar)

        var row := HBoxContainer.new()
        row.add_theme_constant_override("separation", 14)
        row.alignment = BoxContainer.ALIGNMENT_CENTER
        bar.add_child(row)

        var sep0 := VSeparator.new()
        row.add_child(sep0)

        for i in GameState.VERBS.size():
                var b := Button.new()
                b.text = GameState.VERBS[i]
                b.flat = true
                b.add_theme_font_size_override("font_size", 26)
                b.add_theme_color_override("font_color", COLOR_INACTIVE)
                b.add_theme_color_override("font_hover_color", COLOR_ACTIVE)
                b.pressed.connect(func(): GameState.set_verb(i))
                row.add_child(b)
                verb_buttons.append(b)
                _no_light(b)

        var sep := VSeparator.new()
        row.add_child(sep)

        for i in SLOT_COUNT:
                var p := Panel.new()
                p.custom_minimum_size = Vector2(72, 72)
                var psb := StyleBoxFlat.new()
                psb.bg_color = Color(0.06, 0.05, 0.10, 0.95)
                psb.set_border_width_all(2)
                psb.border_color = Color(0.30, 0.27, 0.48)
                psb.set_corner_radius_all(8)
                p.add_theme_stylebox_override("panel", psb)
                var ic := TextureRect.new()
                ic.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
                ic.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
                ic.mouse_filter = Control.MOUSE_FILTER_IGNORE
                p.add_child(ic)
                p.gui_input.connect(_slot_input.bind(i))
                row.add_child(p)
                slot_panels.append(p)
                slot_icons.append(ic)
                _no_light(p)


func _slot_input(event: InputEvent, idx: int) -> void:
        if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
                if idx < GameState.inventory.size():
                        var id: String = GameState.inventory[idx]
                        if GameState.selected_item == id:
                                GameState.select_item("")
                        else:
                                GameState.select_item(id)


func _build_feedback() -> void:
        feedback_label = Label.new()
        feedback_label.name = "Feedback"
        feedback_label.set_anchors_and_offsets_preset(Control.PRESET_CENTER_BOTTOM)
        feedback_label.offset_top = -130
        feedback_label.offset_bottom = -100
        feedback_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
        feedback_label.add_theme_font_size_override("font_size", 25)
        feedback_label.add_theme_color_override("font_color", Color(0.88, 0.89, 0.98))
        root.add_child(feedback_label)
        _no_light(feedback_label)


func _build_help() -> void:
        var help := Label.new()
        help.text = "Clic izq.: verbo activo · Clic der.: mirar · 1-4: verbos · ESC: salir · F11: pantalla completa"
        help.set_anchors_and_offsets_preset(Control.PRESET_TOP_LEFT)
        help.offset_left = 14
        help.offset_top = 8
        help.add_theme_font_size_override("font_size", 17)
        help.add_theme_color_override("font_color", COLOR_HELP)
        root.add_child(help)
        _no_light(help)


func _build_watermark() -> void:
        var wm := Label.new()
        wm.text = "MÍSTICAS · ART TEST"
        wm.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_RIGHT)
        wm.offset_right = -40
        wm.offset_bottom = -6
        wm.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
        wm.add_theme_font_size_override("font_size", 20)
        wm.add_theme_color_override("font_color", Color(0.66, 0.68, 0.84, 0.85))
        root.add_child(wm)
        _no_light(wm)


func _build_cursor() -> void:
        cursor = Sprite2D.new()
        cursor.name = "Cursor"
        cursor.z_index = 100
        cursor.centered = false
        cursor.offset = Vector2(-14, -10)
        cursor.scale = Vector2(0.5, 0.5)  ## cursores dibujados a 2x (128) -> 64 en pantalla
        root.add_child(cursor)
        _no_light(cursor)


func _build_end() -> void:
        end_overlay = Control.new()
        end_overlay.name = "Fin"
        end_overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
        end_overlay.mouse_filter = Control.MOUSE_FILTER_STOP
        var dim := ColorRect.new()
        dim.color = Color(0.03, 0.02, 0.06, 0.88)
        dim.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
        end_overlay.add_child(dim)
        var box := VBoxContainer.new()
        box.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
        box.alignment = BoxContainer.ALIGNMENT_CENTER
        box.add_theme_constant_override("separation", 18)
        end_overlay.add_child(box)
        var t1 := Label.new()
        t1.text = "ART TEST COMPLETO"
        t1.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
        t1.add_theme_font_size_override("font_size", 44)
        t1.add_theme_color_override("font_color", Color(0.88, 0.89, 0.98))
        box.add_child(t1)
        var t2 := Label.new()
        t2.text = "El despacho de la Fundadora ha quedado abierto."
        t2.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
        t2.add_theme_font_size_override("font_size", 24)
        t2.add_theme_color_override("font_color", COLOR_TEXT)
        box.add_child(t2)
        var t3 := Label.new()
        t3.text = "Gracias por jugar · MÍSTICAS (fan game no oficial)"
        t3.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
        t3.add_theme_font_size_override("font_size", 19)
        t3.add_theme_color_override("font_color", COLOR_HELP)
        box.add_child(t3)
        end_overlay.visible = false
        root.add_child(end_overlay)
        _no_light(end_overlay)


func _on_feedback(text: String) -> void:
        feedback_label.text = text
        if text.is_empty():
                _clear_timer.stop()
        else:
                _clear_timer.start()


func refresh_verbs() -> void:
        for i in verb_buttons.size():
                verb_buttons[i].add_theme_color_override(
                        "font_color", COLOR_ACTIVE if i == GameState.active_verb else COLOR_INACTIVE)


func refresh_slots() -> void:
        for i in SLOT_COUNT:
                var has := i < GameState.inventory.size()
                var id := GameState.inventory[i] if has else ""
                if has:
                        slot_icons[i].texture = load(GameState.item_icon_path(id))
                else:
                        slot_icons[i].texture = null
                var psb := (slot_panels[i].get_theme_stylebox("panel") as StyleBoxFlat)
                if has and GameState.selected_item == id:
                        psb.border_color = COLOR_ACTIVE
                        psb.border_width_left = 3
                        psb.border_width_right = 3
                        psb.border_width_top = 3
                        psb.border_width_bottom = 3
                else:
                        psb.border_color = Color(0.30, 0.27, 0.48)
                        psb.set_border_width_all(2)
                slot_panels[i].add_theme_stylebox_override("panel", psb)


func refresh_cursor() -> void:
        if GameState.selected_item != "":
                cursor.texture = load(GameState.item_icon_path(GameState.selected_item))
                return
        match GameState.active_verb:
                0: cursor.texture = load("res://assets/cursors/cursor_mirar.png")
                1: cursor.texture = load("res://assets/cursors/cursor_coger.png")
                2: cursor.texture = load("res://assets/cursors/cursor_usar.png")
                3: cursor.texture = load("res://assets/cursors/cursor_hablar.png")


func _process(_delta: float) -> void:
        if cursor:
                cursor.position = get_viewport().get_mouse_position()


func _input(event: InputEvent) -> void:
        if event is InputEventKey and event.pressed and not event.echo:
                match event.keycode:
                        KEY_1: GameState.set_verb(0)
                        KEY_2: GameState.set_verb(1)
                        KEY_3: GameState.set_verb(2)
                        KEY_4: GameState.set_verb(3)
                        KEY_ESCAPE: get_tree().quit()
                        KEY_F11:
                                if DisplayServer.window_get_mode() == DisplayServer.WINDOW_MODE_FULLSCREEN:
                                        DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)
                                else:
                                        DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_FULLSCREEN)


func show_end() -> void:
        end_overlay.visible = true
        end_visible = true
