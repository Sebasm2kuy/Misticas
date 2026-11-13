## Místicas — Art Test (Godot 4)
## Personaje jugable (Vera): pathfinding con NavigationAgent2D,
## animación de caminado por fotogramas (2x) y facing por dirección.
extends Node2D

signal arrived

var speed := 340.0
var smoke_fast := false  ## el smoke test multiplica la velocidad

var walking := false
var _anim_t := 0.0
var _frame := 0
var _dir := 1.0

var agent: NavigationAgent2D = null
var sprite: Sprite2D = null
var idle_frames: Array[Texture2D] = []
var walk_frames: Array[Texture2D] = []


func _ready() -> void:
	for i in range(2):
		idle_frames.append(load("res://assets/characters/vera/vera_idle_%d.png" % (i + 1)))
	for i in range(4):
		walk_frames.append(load("res://assets/characters/vera/vera_walk_%d.png" % (i + 1)))

	sprite = Sprite2D.new()
	sprite.name = "Sprite"
	sprite.texture = idle_frames[0]
	sprite.scale = Vector2(0.5, 0.5)  ## arte a 2x
	## ancla los PIES del dibujo en el origen (para y-sort correcto):
	sprite.offset = Vector2(0.0, -sprite.texture.get_height() * 0.5)
	add_child(sprite)

	agent = NavigationAgent2D.new()
	agent.name = "Agent"
	agent.path_desired_distance = 16.0
	agent.target_desired_distance = 20.0
	add_child(agent)


func walk_to(target: Vector2) -> void:
	agent.target_position = target
	walking = true
	_anim_t = 0.0


func _physics_process(delta: float) -> void:
	if not walking:
		return
	if agent.is_navigation_finished():
		walking = false
		_frame = 0
		sprite.texture = idle_frames[0]
		arrived.emit()
		return
	var next := agent.get_next_path_position()
	var d := next - global_position
	if d.length() < 0.5:
		return
	if absf(d.x) > 3.0:
		_dir = 1.0 if d.x > 0.0 else -1.0
	sprite.flip_h = _dir < 0.0
	## paso con tope: jamás sobrepasa el waypoint (evita oscilación)
	var step := speed * delta * (4.0 if smoke_fast else 1.0)
	global_position += d.normalized() * minf(step, d.length())
	# animación de caminado: ~6 fps sobre 4 fotogramas
	_anim_t += delta
	if _anim_t >= 0.16:
		_anim_t = 0.0
		_frame = (_frame + 1) % walk_frames.size()
		sprite.texture = walk_frames[_frame]


func distance_to(p: Vector2) -> float:
	return global_position.distance_to(p)
