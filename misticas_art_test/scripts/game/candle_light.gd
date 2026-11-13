## Místicas — Art Test (Godot 4)
## Iluminación de la sala: luna fría por la ventana (siempre), vela cálida del
## candelabro (se enciende al resolver el puzle) con parpadeo, llamas visibles
## y humo de vela en partículas. Todo con luces 2D (gl_compatibility).
extends Node2D

var moon: PointLight2D = null
var ambient: PointLight2D = null
var candle: PointLight2D = null
var flames: Array[Sprite2D] = []
var smoke: CPUParticles2D = null
var lit := false
var _t := 0.0


func _ready() -> void:
        var radial: Texture2D = load("res://assets/lights/radial_512.png")
        var flame_tex: Texture2D = load("res://assets/props/llama_vela.png")

        # relleno tenue para que nada quede en negro absoluto (excepto las luces:
        # solo afectan al mundo, la UI queda en su propia capa de visibilidad).
        ambient = PointLight2D.new()
        ambient.texture = radial
        ambient.position = Vector2(960, 540)
        ambient.scale = Vector2(7.0, 7.0)
        ambient.energy = 0.16
        ambient.color = Color(0.72, 0.72, 0.85)
        add_child(ambient)

        # luna llena por la ventana: fría, lateral, constante.
        moon = PointLight2D.new()
        moon.texture = radial
        moon.position = Vector2(670, 420)
        moon.scale = Vector2(3.0, 3.0)
        moon.energy = 0.55
        moon.color = Color(0.78, 0.82, 1.0)
        add_child(moon)

        # vela del candelabro: apagada hasta que el puzle la enciende.
        candle = PointLight2D.new()
        candle.texture = radial
        candle.position = Vector2(1270, 760)
        candle.scale = Vector2(1.9, 1.9)
        candle.energy = 0.0
        candle.color = Color(1.0, 0.72, 0.38)
        add_child(candle)

        # tres llamas sobre las mechas del candelabro (invisible hasta encender).
        for wick in [Vector2(1215, 690), Vector2(1270, 665), Vector2(1325, 690)]:
                var f := Sprite2D.new()
                f.texture = flame_tex
                f.scale = Vector2(0.5, 0.5)
                f.position = wick - Vector2(0, flame_tex.get_height() * 0.25)
                f.visible = false
                f.z_index = 40
                add_child(f)
                flames.append(f)

        # humo de vela: partículas discretas que suben en espiral desde la vela.
        smoke = CPUParticles2D.new()
        smoke.position = Vector2(1270, 640)
        smoke.texture = load("res://assets/props/llama_vela.png")
        smoke.emitting = false
        smoke.amount = 14
        smoke.lifetime = 2.6
        smoke.preprocess = 0.0
        smoke.local_coords = false
        smoke.direction = Vector2(0, -1)
        smoke.spread = 12
        smoke.gravity = Vector2(6, -14)
        _config_smoke()
        add_child(smoke)


func _config_smoke() -> void:
        smoke.emitting = false
        smoke.amount = 14
        smoke.lifetime = 2.6
        smoke.initial_velocity_min = 26.0
        smoke.initial_velocity_max = 34.0
        smoke.angular_velocity_min = -40.0
        smoke.angular_velocity_max = 40.0
        smoke.scale_amount_min = 0.12
        smoke.scale_amount_max = 0.22
        smoke.color = Color(0.82, 0.82, 0.9, 0.5)


func light_candles() -> void:
        lit = true
        candle.energy = 1.25
        for f in flames:
                f.visible = true
        smoke.emitting = true
        GameState.set_flag("candelabro_lit")


func _process(delta: float) -> void:
        if not lit:
                return
        _t += delta
        # parpadeo orgánico: dos senos inconmensurables.
        candle.energy = 1.22 + 0.16 * sin(_t * 13.0) + 0.08 * sin(_t * 29.0 + 1.7)
        var s := 0.5 + 0.04 * sin(_t * 17.0)
        for f in flames:
                f.scale = Vector2(s, s + 0.03 * sin(_t * 21.0))
