## Místicas — Art Test (Godot 4)
## Base de sala: monta navegación (A* sobre teselas del suelo), capa y-sort
## (personaje + walk-behinds + props), registro de hotspots y API de acción.
## Flujo de acción SIN corrutinas: click -> caminar -> señal "arrived" -> resolver.
extends Node2D
class_name RoomBase

const NO_WALK := Vector2(-99999, -99999)

var player: Variant = null
var ysort: Node2D = null
var hotspots := {}  ## nombre -> Hotspot
var walk_behinds := {}  ## nombre -> WalkBehind
var props := {}  ## nombre -> Sprite2d
var _nav_tiles: Array[PackedVector2Array] = []
var _pending: Hotspot = null
var _pending_quick := false


func _ready() -> void:
	ysort = Node2D.new()
	ysort.name = "YSort"
	ysort.y_sort_enabled = true
	add_child(ysort)


func add_walkable(poly: Array) -> void:
	## Tesela convexa del suelo; se hornea junta en un NavigationPolygon.
	_nav_tiles.append(PackedVector2Array(poly))


func _bake_navigation() -> void:
	if _nav_tiles.is_empty():
		return
	var np := NavigationPolygon.new()
	var all_points: Array[Vector2] = []
	var polys: Array[PackedInt32Array] = []
	for tile in _nav_tiles:
		var idx := PackedInt32Array()
		for p in tile:
			all_points.append(p)
			idx.append(all_points.size() - 1)
		polys.append(idx)
	np.set_vertices(PackedVector2Array(all_points))
	for pl in polys:
		np.add_polygon(pl)
	var region := NavigationRegion2D.new()
	region.name = "NavRegion"
	region.navigation_polygon = np
	add_child(region)


func add_bg(tex_path: String, z := -100) -> Sprite2D:
	var bg := Sprite2D.new()
	bg.name = "Fondo"
	bg.texture = load(tex_path)
	bg.scale = Vector2(0.5, 0.5)  ## fondo 4K (2x) sobre lienzo 1080
	bg.centered = false
	bg.z_index = z
	add_child(bg)
	return bg


func add_walk_behind(name: String, tex_path: String, pos_x: float, baseline: float) -> WalkBehind:
	var wb := WalkBehind.new()
	wb.setup(load(tex_path), pos_x, baseline)
	wb.name = "WB_%s" % name
	ysort.add_child(wb)
	walk_behinds[name] = wb
	return wb


func add_prop(name: String, tex_path: String, pos: Vector2,
		anchor: Vector2) -> Sprite2D:
	## `anchor` = punto del PNG (px, origen arriba-izq) que apoya en el suelo.
	var tex: Texture2D = load(tex_path)
	var sp := Sprite2D.new()
	sp.name = "Prop_%s" % name
	sp.texture = tex
	sp.scale = Vector2(0.5, 0.5)
	sp.position = pos  ## y-sort: los pies del prop
	sp.offset = Vector2(tex.get_width(), tex.get_height()) * 0.5 - anchor
	ysort.add_child(sp)
	props[name] = sp
	return sp


func add_hotspot(name: String, polygon: Array, walk_to: Vector2,
		acciones := {}, look_text := "", walk_only := false) -> Hotspot:
	var hs := Hotspot.new()
	hs.setup(self, name, PackedVector2Array(polygon), walk_to, acciones, look_text, walk_only)
	hs.name = "HS_%s" % name
	add_child(hs)
	hotspots[name] = hs
	return hs


func add_player(player_scene: PackedScene, start: Vector2) -> Variant:
	player = player_scene.instantiate()
	player.name = "Player"
	player.global_position = start
	ysort.add_child(player)
	return player


func click_walk(point: Vector2) -> void:
	## clic libre sobre el suelo: caminar sin acción (cancela la pendiente).
	_pending = null
	if player:
		player.walk_to(point)


func request_action(hotspot: Hotspot, quick := false) -> void:
	## Camina hasta walk_to y, al llegar (señal), resuelve la acción.
	## Síncrono: no usa corrutinas.
	if player == null:
		return
	if quick or hotspot.walk_to == NO_WALK:
		resolve_action(hotspot, quick)
		return
	_pending = hotspot
	_pending_quick = quick
	if not player.arrived.is_connected(_on_player_arrived):
		player.arrived.connect(_on_player_arrived)
	player.walk_to(hotspot.walk_to)


func _on_player_arrived() -> void:
	var hs := _pending
	var q := _pending_quick
	_pending = null
	if player and player.arrived.is_connected(_on_player_arrived):
		player.arrived.disconnect(_on_player_arrived)
	if hs:
		resolve_action(hs, q)


func resolve_action(hotspot: Hotspot, quick := false) -> void:
	## Ejecuta el verbo/objeto sobre el hotspot (parte síncrona).
	var verb: int = GameState.active_verb
	var item: String = GameState.selected_item
	if quick:
		return
	if item != "":
		if hotspot.acciones.has("item"):
			hotspot.acciones["item"].call(item)
		else:
			GameState.send_feedback("No es el momento. Ni el lugar.")
	elif hotspot.acciones.has(verb):
		hotspot.acciones[verb].call()
	elif verb == 0 and hotspot.look_text != "":
		GameState.send_feedback(hotspot.look_text)
	else:
		GameState.send_feedback("No tengo nada que hacer aquí con %s." % hotspot.nombre.to_lower())


func build_room() -> void:
	## la sala concreta (room_test.gd) llama esto al final de su _ready:
	## hornea navegación con las teselas registradas.
	_bake_navigation()
