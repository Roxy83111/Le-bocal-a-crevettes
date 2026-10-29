/*
 * Sons enregistrés libres de droits (CC0 / domaine public, voir sons/CREDITS.txt) : voix, « pop », miaou et musiques.
 * Éléments <audio> plutôt que Web Audio : ils marchent aussi quand index.html est ouvert en file://.
 */
'use strict';
const Sound = {
  on: false,
  music: null,
  lastChirp: -Infinity,
  clips: {},
  // Tempo mesuré des boucles (seul le concert s'en sert pour faire sautiller le groupe). Rock : demi-tempo du morceau à 152.
  BPM: { rock: 76, conga: 103, mystic: 60, chic: 76, valse: 81, spooky: 81 },
  toggle() {
    this.on = !this.on;
    if (this.music) this.on ? this.music.play().catch(() => {}) : this.music.pause();
    return this.on;
  },
  // rate change aussi la hauteur (preservesPitch coupé), comme une bande accélérée.
  play(name, rate = 1, vol = 0.5) {
    if (!this.on) return;
    const base = (this.clips[name] ||= new Audio(`sons/${name}.ogg`)),
      a = base.cloneNode();
    a.preservesPitch = a.mozPreservesPitch = a.webkitPreservesPitch = false;
    a.playbackRate = rate;
    a.volume = vol;
    a.play().catch(() => {});
  },
  chirp(base) {
    if (!this.on) return;
    const now = performance.now();
    if (now - this.lastChirp < 150) return;
    this.lastChirp = now;
    const n = rint(2, 4);
    // Une syllabe toutes les 70 ms, chacune un peu plus aiguë ou plus grave autour de la voix de la crevette.
    for (let i = 0; i < n; i++) setTimeout(() => this.play('voix', (base / 700) * rnd(0.85, 1.25), 0.35), i * 70);
  },
  pop() {
    this.play('pop', rnd(0.9, 1.1), 0.6);
  },
  meow() {
    this.play('miaou', rnd(0.92, 1.08), 0.5);
  },
  bpm(s) {
    return this.BPM[s];
  },
  startMusic(style) {
    this.stopMusic();
    const a = (this.music = new Audio(`sons/${style}.ogg`));
    a.loop = true;
    a.volume = 0.35;
    if (this.on) a.play().catch(() => {});
  },
  stopMusic() {
    if (this.music) this.music.pause();
    this.music = null;
  },
};
