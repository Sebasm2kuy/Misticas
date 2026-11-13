## Místicas — Art Test (Godot 4)
## Arranque: instancia la sala y la UI. Con el argumento de usuario "--smoke"
## ejecuta el autotest completo del puzle (máquina de estados dirigida por
## frames, sin corrutinas) y termina con SMOKE_TEST_OK.
extends Node2D

var room: Node2D = null
var ui: CanvasLayer = null
var _smoke: Variant = null


func _ready() -> void:
	room = load("res://scenes/rooms/Room_Test.tscn").instantiate()
	add_child(room)
	ui = load("res://scenes/ui/UI_Game.tscn").instantiate()
	add_child(ui)
	if "--smoke" in OS.get_cmdline_user_args():
		## margen para que el NavigationServer sincronice el mapa.
		await get_tree().create_timer(0.6).timeout
		var sm := SmokeTest.new()
		if sm.run(self):
			_smoke = sm


func _process(delta: float) -> void:
	if _smoke != null:
		if not _smoke.tick(delta):
			_smoke = null
