## Místicas — Art Test (Godot 4)
## Capa walk-behind: sprite cuya "línea de suelo" (baseline) decide, vía y-sort,
## si el personaje pasa por delante (pies debajo de la línea) o queda oculto
## detrás (pies por encima). técnica clásica de las aventuras gráficas.
extends Sprite2D
class_name WalkBehind

var baseline := 0.0  ## y del suelo del objeto (pies del objeto)


func setup(tex: Texture2D, pos_x: float, p_baseline: float) -> void:
	texture = tex
	baseline = p_baseline
	scale = Vector2(0.5, 0.5)  ## arte a 2x (4K) sobre lienzo 1080
	position = Vector2(pos_x, baseline)
	## ancla el PIE del dibujo en el origen del nodo:
	offset = Vector2(0.0, -tex.get_height() * 0.5)
	## con y_sort_enabled en el padre, el orden lo da position.y (= baseline).
	z_index = 0


func is_behind(point: Vector2) -> bool:
	## ¿un personaje con los pies en `point` quedaría oculto por este objeto?
	return point.y < baseline
