'use strict';
/* ============================================================
   MÍSTICAS — (C) 1987 — audio.js
   Motor de audio "beeper": onda cuadrada, ruido de cinta,
   zumbido de monitor, campanas, truenos, latidos y música
   chiptune procedural. Cero archivos: todo es síntesis.
   ============================================================ */
(function (M) {

  // frecuencia a partir de nota MIDI
  function mf(n) { return 440 * Math.pow(2, (n - 69) / 12); }

  var Audio = {
    ctx: null,
    master: null,
    muted: false,
    unlocked: false,
    music: { name: null, step: 0, next: 0, tempo: 0.30 },
    windNodes: null,
    humNode: null,

    init: function () {
      if (this.unlocked) return;
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.42;
      this.master.connect(this.ctx.destination);
      this.unlocked = true;
    },

    resume: function () {
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },

    toggleMute: function () {
      this.muted = !this.muted;
      if (this.master) this.master.gain.value = this.muted ? 0 : 0.42;
      return this.muted;
    },

    /* --- ladrillos de síntesis --- */

    beep: function (freq, dur, opts) {
      if (!this.ctx || this.muted) return;
      opts = opts || {};
      var t = this.ctx.currentTime + (opts.when || 0);
      var o = this.ctx.createOscillator();
      var g = this.ctx.createGain();
      o.type = opts.type || 'square';
      o.frequency.setValueAtTime(freq, t);
      if (opts.slide) o.frequency.linearRampToValueAtTime(Math.max(20, freq + opts.slide), t + dur);
      var v = opts.vol || 0.12;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(v, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(this.master);
      o.start(t); o.stop(t + dur + 0.02);
    },

    noise: function (dur, opts) {
      if (!this.ctx || this.muted) return;
      opts = opts || {};
      var t = this.ctx.currentTime + (opts.when || 0);
      var len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
      var buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      var src = this.ctx.createBufferSource();
      src.buffer = buf;
      var f = this.ctx.createBiquadFilter();
      f.type = opts.filter || 'lowpass';
      f.frequency.setValueAtTime(opts.freq || 900, t);
      if (opts.freqTo) f.frequency.linearRampToValueAtTime(opts.freqTo, t + dur);
      var g = this.ctx.createGain();
      var v = opts.vol || 0.1;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(v, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(f); f.connect(g); g.connect(this.master);
      src.start(t); src.stop(t + dur + 0.02);
    },

    /* --- zumbido continuo del monitor CRT --- */
    startHum: function () {
      if (!this.ctx || this.humNode) return;
      var o = this.ctx.createOscillator();
      var g = this.ctx.createGain();
      o.type = 'sine'; o.frequency.value = 58;
      g.gain.value = 0.012;
      o.connect(g); g.connect(this.master);
      o.start();
      this.humNode = { o: o, g: g };
    },

    /* --- viento (para escenas exteriores) --- */
    wind: function (on) {
      if (!this.ctx) return;
      if (on && !this.windNodes && !this.muted) {
        var len = this.ctx.sampleRate * 2;
        var buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        var d = buf.getChannelData(0);
        for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        var src = this.ctx.createBufferSource();
        src.buffer = buf; src.loop = true;
        var f = this.ctx.createBiquadFilter();
        f.type = 'bandpass'; f.frequency.value = 320; f.Q.value = 0.6;
        var g = this.ctx.createGain(); g.gain.value = 0.035;
        var lfo = this.ctx.createOscillator();
        var lg = this.ctx.createGain();
        lfo.type = 'sine'; lfo.frequency.value = 0.13;
        lg.gain.value = 0.02;
        lfo.connect(lg); lg.connect(g.gain);
        src.connect(f); f.connect(g); g.connect(this.master);
        src.start(); lfo.start();
        this.windNodes = { src: src, lfo: lfo, g: g };
      } else if (!on && this.windNodes) {
        try { this.windNodes.src.stop(); this.windNodes.lfo.stop(); } catch (e) {}
        this.windNodes = null;
      }
    },

    /* --- efectos con nombre --- */
    sfx: {
      blip: function () { A.beep(1180, 0.04, { vol: 0.05 }); },
      typeKey: function () { A.beep(820 + Math.random() * 200, 0.03, { vol: 0.05 }); },
      step: function () { A.beep(160 + Math.random() * 40, 0.045, { vol: 0.035 }); },
      page: function () { A.noise(0.14, { freq: 2600, vol: 0.05, filter: 'highpass' }); },
      chime: function () {
        A.beep(mf(84), 0.09, { vol: 0.09 });
        A.beep(mf(88), 0.09, { vol: 0.08, when: 0.09 });
        A.beep(mf(91), 0.16, { vol: 0.07, when: 0.18 });
      },
      pickup: function () {
        A.beep(mf(81), 0.06, { vol: 0.09 });
        A.beep(mf(85), 0.06, { vol: 0.09, when: 0.06 });
        A.beep(mf(88), 0.06, { vol: 0.09, when: 0.12 });
        A.beep(mf(93), 0.14, { vol: 0.08, when: 0.18 });
      },
      bell: function (far) {
        var v = far ? 0.05 : 0.11;
        A.beep(mf(66), 1.4, { vol: v, type: 'triangle' });
        A.beep(mf(69), 1.1, { vol: v * 0.7, type: 'triangle', when: 0.02 });
        A.beep(mf(78), 0.7, { vol: v * 0.4, type: 'triangle', when: 0.01 });
      },
      thunder: function () {
        A.noise(1.5, { freq: 420, freqTo: 60, vol: 0.16 });
        A.noise(0.4, { freq: 150, vol: 0.12, when: 0.25 });
      },
      heartbeat: function () {
        A.beep(52, 0.12, { vol: 0.2, type: 'sine' });
        A.beep(46, 0.14, { vol: 0.16, type: 'sine', when: 0.22 });
      },
      alarm: function () {
        for (var i = 0; i < 6; i++) A.beep(mf(93 - i * 2), 0.07, { vol: 0.13, when: i * 0.07 });
        A.noise(0.5, { freq: 3000, vol: 0.06, filter: 'highpass' });
      },
      glitch: function () {
        A.noise(0.22, { freq: 4000, vol: 0.09, filter: 'highpass' });
        A.beep(300, 0.06, { vol: 0.07 });
        A.beep(1900, 0.05, { vol: 0.06, when: 0.05 });
      },
      creak: function () {
        A.beep(300, 0.5, { vol: 0.07, type: 'sawtooth', slide: -140 });
        A.noise(0.4, { freq: 500, vol: 0.04, when: 0.1 });
      },
      doorOpen: function () {
        A.beep(140, 0.9, { vol: 0.08, type: 'sawtooth', slide: 60 });
        A.noise(0.7, { freq: 800, freqTo: 300, vol: 0.05, when: 0.2 });
      },
      whoosh: function () { A.noise(0.5, { freq: 500, freqTo: 2400, vol: 0.05 }); },
      // Escrito "PULSA PLAY EN LA CINTA": chirlido de carga de casete
      tapePilot: function () {
        if (!A.ctx || A.muted) return;
        for (var i = 0; i < 26; i++) {
          A.beep(1500 + (i % 2) * 700, 0.05, { vol: 0.045, when: i * 0.055 });
        }
      },
      tapeData: function () {
        if (!A.ctx || A.muted) return;
        for (var i = 0; i < 40; i++) {
          var f = 900 + Math.random() * 1700;
          A.beep(f, 0.04, { vol: 0.05, when: i * 0.045 });
          if (i % 7 === 0) A.noise(0.05, { freq: 2500, vol: 0.05, filter: 'highpass', when: i * 0.045 });
        }
      },
      staticBurst: function () { A.noise(0.3, { freq: 3000, vol: 0.09, filter: 'highpass' }); }
    },

    /* --- música: pequeñas melodías en la menor, canal beeper --- */
    SONGS: {
      /* Cada canción: { tempo (s/paso), mel: [[nota|null, pasos]...],
         bass: [[nota|null, pasos]...] } nota = MIDI */
      title: {
        tempo: 0.34,
        mel: [
          [69, 2], [72, 1], [71, 1], [69, 2], [76, 2], [74, 1], [72, 1],
          [71, 4], [68, 1], [69, 1], [71, 2], [72, 1], [71, 1],
          [69, 4], [null, 2], [64, 1], [68, 1], [69, 6], [null, 2]
        ],
        bass: [
          [45, 8], [45, 8], [40, 8], [45, 6], [null, 2],
          [45, 8], [45, 8], [40, 8], [45, 8]
        ]
      },
      tree: {
        tempo: 0.42,
        mel: [
          [64, 2], [67, 1], [69, 2], [71, 1], [69, 2], [67, 1],
          [64, 3], [null, 2], [62, 1], [64, 2], [67, 2],
          [69, 4], [null, 4]
        ],
        bass: [[40, 8], [40, 8], [45, 8], [40, 8]]
      },
      cemetery: {
        tempo: 0.5,
        mel: [
          [62, 3], [63, 1], [62, 2], [null, 2],
          [58, 3], [62, 1], [58, 2], [null, 2],
          [57, 4], [null, 4]
        ],
        bass: [[38, 8], [37, 8], [38, 8], [33, 8]]
      },
      convent: {
        tempo: 0.46,
        mel: [
          [57, 2], [60, 1], [64, 2], [63, 1], [60, 2],
          [57, 3], [null, 2], [56, 1], [57, 1], [60, 2], [63, 2],
          [64, 4], [null, 2]
        ],
        bass: [[33, 8], [33, 8], [32, 8], [33, 8]]
      },
      ending: {
        tempo: 0.4,
        mel: [
          [69, 2], [71, 1], [72, 2], [76, 2],
          [74, 2], [72, 1], [71, 1], [69, 4], [null, 2]
        ],
        bass: [[45, 8], [40, 8], [45, 8], [45, 8]]
      }
    },

    playSong: function (name) {
      this.music.name = name;
      this.music.step = 0;
      this.music.bassStep = 0;
      if (this.ctx) this.music.next = this.ctx.currentTime + 0.1;
    },

    stopMusic: function () { this.music.name = null; },

    // Planificador con antelación (llamar cada fotograma)
    update: function () {
      if (!this.ctx || !this.music.name || this.muted) return;
      var song = this.SONGS[this.music.name];
      if (!song) return;
      var now = this.ctx.currentTime;

      while (this.music.next < now + 0.35) {
        // melodía
        var acc = 0, i, ev = null;
        for (i = 0; i < song.mel.length; i++) {
          if (this.music.step >= acc && this.music.step < acc + song.mel[i][1]) { ev = song.mel[i]; break; }
          acc += song.mel[i][1];
        }
        if (!ev) { this.music.step = 0; continue; } // bucle
        if (ev[0] !== null) {
          var when = this.music.next - now;
          this.beep(mf(ev[0]), song.tempo * ev[1] * 0.92, { vol: 0.055, when: Math.max(0, when) });
          // "eco" de beeper: repetición tenue
          this.beep(mf(ev[0]), song.tempo * ev[1] * 0.5, { vol: 0.018, when: Math.max(0, when) + song.tempo * ev[1] });
        }
        this.music.next += song.tempo * ev[1];
        this.music.step += ev[1];
        // longitud total del bucle
        var total = 0;
        for (i = 0; i < song.mel.length; i++) total += song.mel[i][1];
        if (this.music.step >= total) this.music.step = 0;
      }
    }
  };

  var A = Audio;
  M.Audio = Audio;
})(window.MISTICAS);
