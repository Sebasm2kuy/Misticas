## Místicas — Art Test (Godot 4)
## Hotspot interactivo: polígono clicable, punto de aproximación (walk_to)
## y tabla de acciones por verbo (0..3) o con objeto ("item").
## Clic izquierdo: verbo activo (camina hasta walk_to y ejecuta).
## Clic derecho: mirada rápida sin caminar.
class_name Hotspot
extends Area2D

var room: Variant = null
var nombre := ""
var walk_to := Vector2(-99999, -99999)  ## punto de aproximación; INF = actuar en sitio
var acciones := {}  ## {int verbo: Callable} + {"item": Callable(String)}
var look_text := ""
var walk_only := false  ## el "suelo": solo camina, no tiene acciones


func setup(p_room: Variant, p_nombre: String, polygon: PackedVector2Array,
		p_walk_to: Vector2, p_acciones: Dictionary, p_look_text: String,
		p_walk_only := false) -> void:
	room = p_room
	nombre = p_nombre
	walk_to = p_walk_to
	acciones = p_acciones
	look_text = p_look_text
	walk_only = p_walk_only
	var col := CollisionPolygon2D.new()
	col.polygon = polygon
	add_child(col)
	mouse_entered.connect(_on_enter)
	mouse_exited.connect(_on_exit)
	input_event.connect(_on_input)


func _on_enter() -> void:
	if walk_only or room == null:
		return
	if GameState.selected_item != "":
		GameState.send_feedback("USAR %s — %s" % [nombre, GameState.item_name(GameState.selected_item)])
	else:
		GameState.send_feedback("%s %s" % [GameState.VERBS[GameState.active_verb], nombre])


func _on_exit() -> void:
	if walk_only:
		return
	GameState.send_feedback("")


func _on_input(_viewport: Node, event: InputEvent, _shape_idx: int) -> void:
	if not (event is InputEventMouseButton) or not event.pressed:
		return
	if event.button_index == MOUSE_BUTTON_LEFT:
		if walk_only:
			room.click_walk(get_global_mouse_position())
		else:
			room.request_action(self)
	elif event.button_index == MOUSE_BUTTON_RIGHT and not walk_only:
		## Mirada rápida: sin caminar, muestra la línea de MIRAR.
		if look_text != "":
			GameState.send_feedback(look_text)
		else:
			GameState.send_feedback("%s..." % nombre.to_lower())
