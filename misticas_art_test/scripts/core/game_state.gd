## Místicas — Art Test (Godot 4)
## Estado global del juego: verbo activo, inventario, selección de objeto
## y flags de progreso. Autoload único (GameState) compartido por sala, UI y tests.
extends Node

signal verb_changed(verb_index: int)
signal item_selected(item_id: String)
signal inventory_changed
signal feedback(text: String)

const VERBS: Array[String] = ["MIRAR", "COGER", "USAR", "HABLAR"]
const ITEM_NAMES: Dictionary = {
	"antorcha": "antorcha de la Fundadora",
	"llave": "llave antigua",
}

var active_verb := 0
var selected_item := ""
var inventory: Array[String] = []
var flags := {}


func set_verb(i: int) -> void:
	active_verb = clampi(i, 0, VERBS.size() - 1)
	verb_changed.emit(active_verb)


func select_item(id: String) -> void:
	## "" significa deseleccionar.
	selected_item = id
	item_selected.emit(id)


func add_item(id: String) -> bool:
	if id in inventory:
		return false
	inventory.append(id)
	inventory_changed.emit()
	return true


func remove_item(id: String) -> bool:
	if id not in inventory:
		return false
	inventory.erase(id)
	if selected_item == id:
		select_item("")
	inventory_changed.emit()
	return true


func has_item(id: String) -> bool:
	return id in inventory


func set_flag(name: String) -> void:
	flags[name] = true


func has_flag(name: String) -> bool:
	return flags.get(name, false)


func item_name(id: String) -> String:
	return ITEM_NAMES.get(id, id)


func item_icon_path(id: String) -> String:
	if id == "antorcha" and has_flag("antorcha_lit"):
		return "res://assets/icons/item_antorcha_lit.png"
	return "res://assets/icons/item_%s.png" % id


func send_feedback(text: String) -> void:
	feedback.emit(text)
