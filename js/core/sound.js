/*
 * Son généré dans le navigateur (Web Audio) : petites voix, « pop » et musiques des activités.
 */
'use strict';
const Sound = {
  ctx: null,
  on: false,
  master: null,
  noiseBuf: null,
  music: null,
  lastChirp: 0,
  STY: {
    rock: { bpm: 116, root: 110, scale: [0, 3, 5, 7, 10], prog: [0, 8, 5, 7], drums: 1 },
    conga: { bpm: 128, root: 130.8, scale: [0, 2, 4, 7, 9], prog: [0, 5, 7, 5], drums: 1 },
    mystic: { bpm: 64, root: 98, scale: [0, 2, 3, 7, 8], prog: [0, 0, 8, 7], drums: 0 },
    chic: { bpm: 120, root: 116.5, scale: [0, 2, 4, 7, 9, 11], prog: [0, 9, 5, 7], drums: 1 },
  },
  init() {
    if (this.ctx) return true;
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return false;
    this.ctx = new C();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.ctx.destination);
    const len = this.ctx.sampleRate,
      b = this.ctx.createBuffer(1, len, len),
      d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.noiseBuf = b;
    return true;
  },
  toggle() {
    if (!this.init()) return false;
    this.on = !this.on;
    this.ctx.resume();
    this.master.gain.setTargetAtTime(this.on ? 0.5 : 0, this.ctx.currentTime, 0.08);
    return this.on;
  },
  env(g, w, vol, dur, att = 0.005) {
    g.gain.setValueAtTime(0.0001, w);
    g.gain.linearRampToValueAtTime(vol, w + att);
    g.gain.exponentialRampToValueAtTime(0.0001, w + dur);
  },
  tone(f, w, dur, type, vol) {
    const c = this.ctx,
      o = c.createOscillator(),
      g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, w);
    this.env(g, w, vol, dur);
    o.connect(g);
    g.connect(this.master);
    o.start(w);
    o.stop(w + dur + 0.05);
    return o;
  },
  noise(w, dur, vol, type, freq) {
    const c = this.ctx,
      s = c.createBufferSource(),
      f = c.createBiquadFilter(),
      g = c.createGain();
    s.buffer = this.noiseBuf;
    f.type = type;
    f.frequency.value = freq;
    this.env(g, w, vol, dur, 0.002);
    s.connect(f);
    f.connect(g);
    g.connect(this.master);
    s.start(w, Math.random() * 0.5);
    s.stop(w + dur + 0.05);
  },
  kick(w) {
    const c = this.ctx,
      o = c.createOscillator(),
      g = c.createGain();
    o.frequency.setValueAtTime(150, w);
    o.frequency.exponentialRampToValueAtTime(42, w + 0.14);
    this.env(g, w, 0.7, 0.3, 0.003);
    o.connect(g);
    g.connect(this.master);
    o.start(w);
    o.stop(w + 0.35);
  },
  chirp(base) {
    if (!this.on) return;
    const now = this.ctx.currentTime;
    if (now - this.lastChirp < 0.15) return;
    this.lastChirp = now;
    const n = rint(2, 4);
    for (let i = 0; i < n; i++) {
      const t = now + i * 0.07,
        o = this.tone(base * rnd(0.85, 1.25), t, 0.06, 'sine', 0.05);
      o.frequency.exponentialRampToValueAtTime(base * 1.5, t + 0.05);
    }
  },
  pop() {
    if (!this.on) return;
    const now = this.ctx.currentTime,
      o = this.tone(300, now, 0.18, 'sine', 0.3);
    o.frequency.exponentialRampToValueAtTime(1400, now + 0.1);
    this.noise(now, 0.08, 0.25, 'highpass', 2000);
  },
  bpm(s) {
    return this.STY[s].bpm;
  },
  startMusic(style, kinds) {
    this.music = { style, kinds: kinds || [], step: 0, next: 0, deg: 4 };
  },
  stopMusic() {
    this.music = null;
  },
  schedule() {
    const m = this.music;
    if (!m || !this.on) return;
    const now = this.ctx.currentTime;
    if (m.next < now) m.next = now + 0.05;
    const S = this.STY[m.style],
      spb = 60 / S.bpm / 2;
    while (m.next < now + 0.2) {
      this.step(m, S, m.step, m.next, spb);
      m.step++;
      m.next += spb;
    }
  },
  step(m, S, i, w, spb) {
    const bar = Math.floor(i / 8),
      s = i % 8,
      root = S.root * Math.pow(2, S.prog[bar % 4] / 12),
      has = x => m.kinds.includes(x);
    if (S.drums) {
      if (s === 0 || s === 4 || (s === 7 && Math.random() < 0.3)) this.kick(w);
      if (s === 2 || s === 6) this.noise(w, 0.16, 0.32, 'bandpass', 1800);
      this.noise(w, 0.04, s % 2 ? 0.07 : 0.11, 'highpass', 7000);
      if (has('maracas') && s % 2) this.noise(w, 0.07, 0.12, 'highpass', 5000);
    }
    if (has('triangle') && s === 0 && bar % 2 === 0) this.tone(2637, w, 1.2, 'sine', 0.05);
    if (m.style === 'mystic') {
      if (s === 0) this.tone(root / 2, w, spb * 8.5, 'sine', 0.22);
    } else if (s % 2 === 0) this.tone((root / 2) * (s === 4 ? 1.5 : 1), w, spb * 1.8, 'triangle', 0.26);
    if (Math.random() < (m.style === 'mystic' ? 0.35 : 0.7)) {
      m.deg = clamp(m.deg + rint(-2, 2), 0, S.scale.length * 2 - 1);
      const oct = Math.floor(m.deg / S.scale.length),
        sd = S.scale[m.deg % S.scale.length];
      const f = root * 2 * Math.pow(2, (sd + oct * 12) / 12);
      const type =
        m.style === 'mystic'
          ? 'sine'
          : has('trompette')
            ? 'sawtooth'
            : has('clavier')
              ? 'square'
              : 'triangle';
      const vol = type === 'sawtooth' ? 0.05 : type === 'square' ? 0.045 : 0.12;
      this.tone(f, w, m.style === 'mystic' ? spb * 4 : spb * 0.9, type, vol);
    }
    if (has('guitare') && s % 4 === 0)
      [0, 7, 12].forEach((st, j) =>
        this.tone(root * Math.pow(2, st / 12), w + j * 0.015, spb * 2, 'sawtooth', 0.03),
      );
  },
};
setInterval(() => {
  try {
    Sound.schedule();
  } catch (e) {}
}, 50);
