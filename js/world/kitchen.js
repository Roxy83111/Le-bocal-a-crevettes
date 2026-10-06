/*
 * La cuisine autour du bocal (tout en low poly) : sol carrelé, murs, fenêtre qui suit le jour et la nuit,
 * plan de travail avec évier et gazinière, placards, frigo, étagère, horloge qui tourne, suspension,
 * et la table (avec ses pieds) sur laquelle est posé le bocal.
 * Les matériaux de la pièce ignorent le brouillard (fog: false) pour garder leurs vraies couleurs.
 */
'use strict';

// Dimensions de la pièce (le dessus de la table est à y = 0, là où est posé le bocal).
const ROOM = { floor: -22, ceiling: 48, half: 56 };
const K = (color, o) => M(color, Object.assign({ fog: false }, o || {}));
const KE = (color, i = 1) => K(color, { emissive: color, emissiveIntensity: i });

const kitchen = new THREE.Group();
// Objets que la caméra ne doit pas traverser (voir updateCamera dans js/ui/camera.js).
const cameraBlockers = [];
scene.add(kitchen);

/* ---------- Sol carrelé (damier) ---------- */
(function floor() {
  const n = 14,
    size = ROOM.half * 2;
  const geo = new THREE.PlaneGeometry(size, size, n, n).toNonIndexed();
  const cols = [],
    a = new THREE.Color('#e9e2d0'),
    b = new THREE.Color('#5b7c8d');
  for (let q = 0; q < n * n; q++) {
    const c = (Math.floor(q / n) + (q % n)) % 2 ? a : b;
    for (let k = 0; k < 6; k++) cols.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  const m = new THREE.Mesh(geo, K('#ffffff', { vertexColors: true, roughness: 0.6 }));
  m.rotation.x = -Math.PI / 2;
  m.position.y = ROOM.floor;
  m.receiveShadow = true;
  kitchen.add(m);
})();

/* ---------- Murs et plafond ---------- */
const WALL_H = ROOM.ceiling - ROOM.floor;
const wallMat = K('#f3d9a4', { side: THREE.DoubleSide });
[
  [0, -ROOM.half, 0],
  [0, ROOM.half, Math.PI],
  [-ROOM.half, 0, Math.PI / 2],
  [ROOM.half, 0, -Math.PI / 2],
].forEach(([x, z, ry]) => {
  const w = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.half * 2, WALL_H), wallMat);
  w.position.set(x, ROOM.floor + WALL_H / 2, z);
  w.rotation.y = ry;
  kitchen.add(w);
});
part(kitchen, Box(ROOM.half * 2, 1, ROOM.half * 2), K('#fbf3e4'), [0, ROOM.ceiling + 0.5, 0]);
// Plinthes
for (const [x, z, w, d] of [
  [0, -ROOM.half + 0.3, ROOM.half * 2, 0.6],
  [0, ROOM.half - 0.3, ROOM.half * 2, 0.6],
  [-ROOM.half + 0.3, 0, 0.6, ROOM.half * 2],
  [ROOM.half - 0.3, 0, 0.6, ROOM.half * 2],
])
  part(kitchen, Box(w, 1.6, d), K('#c98b5a'), [x, ROOM.floor + 0.8, z]);

/* ---------- Crédence carrelée derrière le plan de travail ---------- */
(function backsplash() {
  const n = 24,
    rows = 5;
  const geo = new THREE.PlaneGeometry(80, 14, n, rows).toNonIndexed();
  const cols = [],
    a = new THREE.Color('#ffffff'),
    b = new THREE.Color('#bfe3e0');
  for (let q = 0; q < n * rows; q++) {
    const c = (Math.floor(q / n) + (q % n)) % 2 ? a : b;
    for (let k = 0; k < 6; k++) cols.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  const m = new THREE.Mesh(geo, K('#ffffff', { vertexColors: true, roughness: 0.3 }));
  m.position.set(4, 8, -ROOM.half + 0.1);
  kitchen.add(m);
})();

/* ---------- Plan de travail : placards, évier, gazinière ---------- */
const COUNTER = { z: -ROOM.half + 7, top: 1, depth: 14 };
// Niche du four, sous la gazinière (x = 14) : les portes de placard s'arrêtent de part et d'autre.
const OVEN = { x0: 6, x1: 22 };
(function counter() {
  const len = 80,
    x0 = 4;
  part(kitchen, Box(len, ROOM.floor * -1 + 0, COUNTER.depth - 1), K('#6f9a8d'), [
    x0,
    ROOM.floor / 2,
    COUNTER.z,
  ]);
  part(kitchen, Box(len + 1, 1.2, COUNTER.depth + 0.5), K('#e8e1d5', { roughness: 0.4 }), [
    x0,
    COUNTER.top - 0.6,
    COUNTER.z,
  ]);
  // Façade : portes de placard de part et d'autre de la niche du four (x de OVEN.x0 à OVEN.x1),
  // posées juste devant le caisson, avec un petit jour entre chaque porte.
  const front = COUNTER.z + (COUNTER.depth - 1) / 2; // face avant du caisson
  const doorMat = K('#7fae9f'),
    handleMat = K('#d9d9d9', { metalness: 0.6, roughness: 0.3 });
  const doors = (xa, xb) => {
    const n = Math.max(1, Math.round((xb - xa) / 12)),
      w = (xb - xa) / n;
    for (let i = 0; i < n; i++) {
      const x = xa + w * (i + 0.5);
      part(kitchen, Box(w - 0.6, 16.5, 0.4), doorMat, [x, ROOM.floor + 11.2, front + 0.2]);
      part(kitchen, Box(0.6, 3, 0.6), handleMat, [
        x + (i % 2 ? -1 : 1) * (w / 2 - 1.6),
        ROOM.floor + 16,
        front + 0.7,
      ]);
    }
  };
  doors(x0 - len / 2 + 0.3, OVEN.x0);
  doors(OVEN.x1, x0 + len / 2 - 0.3);
  // Plinthe en retrait sous les portes
  part(kitchen, Box(len, 2.4, 0.4), K('#3d5a52'), [x0, ROOM.floor + 1.2, front - 0.8]);
  // Four encastré : cadre inox, porte noire vitrée, poignée et boutons
  const ox = (OVEN.x0 + OVEN.x1) / 2,
    ow = OVEN.x1 - OVEN.x0;
  const inox = K('#b8c0c8', { metalness: 0.6, roughness: 0.3 });
  part(kitchen, Box(ow - 0.4, 18, 0.5), inox, [ox, ROOM.floor + 11.5, front + 0.25]);
  part(kitchen, Box(ow - 2, 11, 0.4), K('#1e2025'), [ox, ROOM.floor + 9.5, front + 0.7]);
  part(kitchen, Box(ow - 5, 6, 0.3), K('#ff9f43', { emissive: '#ff7b1c', emissiveIntensity: 0.25 }), [
    ox,
    ROOM.floor + 9.5,
    front + 0.95,
  ]);
  part(kitchen, Box(ow - 4, 0.6, 0.6), inox, [ox, ROOM.floor + 14, front + 1.2]);
  for (let k = 0; k < 4; k++)
    part(
      kitchen,
      Cyl(0.5, 0.5, 0.5, 8),
      K('#2b2d33'),
      [ox - 4.5 + k * 3, ROOM.floor + 18, front + 0.6],
      null,
      [Math.PI / 2, 0, 0],
    );
  // Évier
  part(kitchen, Box(14, 0.4, 9), K('#9aa5b1', { metalness: 0.6, roughness: 0.3 }), [
    -26,
    COUNTER.top + 0.05,
    COUNTER.z,
  ]);
  part(kitchen, Box(12, 0.5, 7), K('#3a434c'), [-26, COUNTER.top + 0.1, COUNTER.z]);
  const tap = new THREE.Group();
  part(tap, Cyl(0.5, 0.6, 6, 6), K('#cfd8dc', { metalness: 0.7, roughness: 0.25 }), [0, 3, 0]);
  part(tap, Cyl(0.4, 0.4, 4, 6), K('#cfd8dc', { metalness: 0.7, roughness: 0.25 }), [0, 6, 1.8], null, [
    Math.PI / 2,
    0,
    0,
  ]);
  tap.position.set(-26, COUNTER.top, COUNTER.z - 4.5);
  kitchen.add(tap);
  // Gazinière + casserole qui fume
  part(kitchen, Box(16, 0.6, 11), K('#2b2d33'), [14, COUNTER.top + 0.2, COUNTER.z]);
  for (const [dx, dz] of [
    [-4, -2.5],
    [4, -2.5],
    [-4, 2.5],
    [4, 2.5],
  ])
    part(
      kitchen,
      new THREE.TorusGeometry(1.6, 0.35, 4, 8),
      K('#555'),
      [14 + dx, COUNTER.top + 0.6, COUNTER.z + dz],
      null,
      [Math.PI / 2, 0, 0],
    );
  const pot = new THREE.Group();
  part(pot, Cyl(3.4, 3, 4.5, 10), K('#c0392b', { roughness: 0.4 }), [0, 2.25, 0]);
  part(pot, Cyl(3.5, 3.5, 0.4, 10), K('#a93226'), [0, 4.6, 0]);
  part(pot, Box(2.5, 0.6, 0.8), K('#222'), [4, 3.8, 0]);
  pot.position.set(10, COUNTER.top + 0.8, COUNTER.z - 2.5);
  kitchen.add(pot);
  // Planche à découper avec légumes
  part(kitchen, Box(10, 0.6, 6), K('#d4a373'), [-6, COUNTER.top + 0.3, COUNTER.z + 2]);
  for (let i = 0; i < 3; i++)
    part(kitchen, Cone(0.7, 4.5, 6), K('#f77f00'), [-8 + i * 1.6, COUNTER.top + 1.3, COUNTER.z + 2], null, [
      0,
      0,
      Math.PI / 2,
    ]);
  part(kitchen, Ico(1.6, 0), K('#d62828'), [-2.5, COUNTER.top + 2, COUNTER.z + 2]);
  part(kitchen, jitter(Ico(1.4, 0), 0.2), K('#8ac926'), [-30, COUNTER.top + 1.4, COUNTER.z + 4]);
  // Bouilloire
  const kettle = new THREE.Group();
  part(kettle, Cyl(2.2, 2.6, 4.5, 8), K('#3a86ff', { roughness: 0.3 }), [0, 2.25, 0]);
  part(kettle, Cone(2.2, 1.4, 8), K('#3a86ff'), [0, 5.2, 0]);
  part(kettle, new THREE.TorusGeometry(1.6, 0.3, 4, 8, Math.PI), K('#222'), [0, 5.5, 0]);
  part(kettle, Cone(0.5, 2.4, 5), K('#3a86ff'), [2.8, 3.4, 0], null, [0, 0, -1]);
  kettle.position.set(32, COUNTER.top, COUNTER.z - 1);
  kitchen.add(kettle);
  // Vapeur de la casserole (petites bulles blanches)
  const steam = [];
  for (let i = 0; i < 6; i++) {
    const s = mk(Ico(rnd(0.6, 1.1), 0), K('#ffffff', { transparent: true, opacity: 0.5, depthWrite: false }));
    s.castShadow = false;
    s.userData.ph = i / 6;
    kitchen.add(s);
    steam.push(s);
  }
  kitchen.userData.steam = steam;
  kitchen.userData.potPos = pot.position.clone().add(V(0, 5, 0));
})();

/* ---------- Placards hauts ---------- */
for (let i = 0; i < 5; i++) {
  const x = -28 + i * 14 + (i > 2 ? 14 : 0);
  part(kitchen, Box(13, 12, 7), K('#7fae9f'), [x, 30, -ROOM.half + 3.5]);
  part(kitchen, Box(0.6, 3, 0.6), K('#d9d9d9', { metalness: 0.6 }), [x + 4.5, 26, -ROOM.half + 7.2]);
}
// Hotte au-dessus de la gazinière
part(kitchen, Box(15, 6, 9), K('#cfd8dc', { metalness: 0.5, roughness: 0.3 }), [14, 27, -ROOM.half + 4.5]);
part(kitchen, Box(6, 16, 6), K('#cfd8dc', { metalness: 0.5, roughness: 0.3 }), [14, 38, -ROOM.half + 3]);

/* ---------- Frigo (coin gauche) ---------- */
(function fridge() {
  const f = new THREE.Group();
  part(f, Box(18, 50, 15), K('#f1f3f5', { roughness: 0.35 }), [0, 25, 0]);
  part(f, Box(18.2, 0.4, 15.2), K('#ced4da'), [0, 33, 0]);
  part(f, Box(0.8, 8, 1), K('#adb5bd', { metalness: 0.6 }), [-7, 38, 7.8]);
  part(f, Box(0.8, 12, 1), K('#adb5bd', { metalness: 0.6 }), [-7, 24, 7.8]);
  for (let i = 0; i < 5; i++)
    part(
      f,
      pick([Ico(0.9, 0), Box(1.6, 1.6, 0.4), Cyl(0.8, 0.8, 0.4, 6)]),
      K(pick(['#ff006e', '#ffbe0b', '#3a86ff', '#06d6a0', '#8338ec'])),
      [rnd(-5, 6), rnd(28, 44), 7.8],
    );
  part(f, Box(4, 5, 0.1), K('#ffffff'), [3, 40, 7.6]); // un dessin d'enfant
  part(f, Box(3, 1.5, 0.12), K('#ff7b5c'), [3, 41, 7.62]);
  f.position.set(-ROOM.half + 10, ROOM.floor, -ROOM.half + 9);
  kitchen.add(f);
})();

/* ---------- Fenêtre (mur gauche) : le ciel suit l'heure du bocal ---------- */
const windowSky = KE('#9bd4ff', 0.9);
(function windowFrame() {
  const w = new THREE.Group();
  part(w, Box(0.5, 20, 30), windowSky, [0, 0, 0]);
  const wood = K('#ffffff');
  part(w, Box(1.2, 1.2, 31), wood, [0.4, 10, 0]);
  part(w, Box(1.2, 1.2, 31), wood, [0.4, -10, 0]);
  part(w, Box(1.2, 21, 1.2), wood, [0.4, 0, 15]);
  part(w, Box(1.2, 21, 1.2), wood, [0.4, 0, -15]);
  part(w, Box(1.2, 21, 0.8), wood, [0.4, 0, 0]);
  part(w, Box(1.2, 0.8, 31), wood, [0.4, 0, 0]);
  part(w, Box(4, 1, 33), wood, [2, -10.8, 0]);
  // Rideaux
  for (const s of [-1, 1]) part(w, jitter(Box(0.6, 24, 7, 1, 4, 2), 0.4), K('#ff7b5c'), [1.5, 1, s * 19]);
  // Petit cactus sur le rebord
  part(w, Cyl(1, 0.8, 1.6, 6), K('#c4693d'), [2.5, -9.5, 8]);
  part(w, Cyl(0.6, 0.7, 3, 6), K('#52b788'), [2.5, -7.3, 8]);
  w.position.set(-ROOM.half + 0.4, 20, 18);
  kitchen.add(w);
})();
const SKY_DAY = new THREE.Color('#9bd4ff'),
  SKY_DUSK = new THREE.Color('#ff9e6d'),
  SKY_NIGHT = new THREE.Color('#14193a');

/* ---------- Étagère avec bocaux (mur droit) ---------- */
(function shelf() {
  const s = new THREE.Group();
  part(s, Box(5, 0.8, 30), K('#a47148'), [0, 0, 0]);
  part(s, Box(5, 0.8, 30), K('#a47148'), [0, 9, 0]);
  const jars = ['#f4a261', '#e76f51', '#2a9d8f', '#e9c46a', '#8ecae6', '#ffb4a2'];
  for (let i = 0; i < 6; i++) {
    const h = rnd(3.5, 6);
    part(s, Cyl(1.5, 1.5, h, 8), K('#e3f2fd', { transparent: true, opacity: 0.55 }), [
      0,
      0.4 + h / 2,
      -12 + i * 4.8,
    ]);
    part(s, Cyl(1.3, 1.3, h * 0.7, 8), K(jars[i]), [0, 0.4 + h * 0.35, -12 + i * 4.8]);
    part(s, Cyl(1.6, 1.6, 0.6, 8), K('#c0392b'), [0, 0.7 + h, -12 + i * 4.8]);
  }
  for (let i = 0; i < 4; i++)
    part(s, Box(3.5, 6, 1.2), K(pick(['#264653', '#e63946', '#ffb703', '#6a4c93'])), [
      0,
      12.5,
      -10 + i * 1.6,
    ]);
  s.position.set(ROOM.half - 3, 14, -10);
  kitchen.add(s);
})();

/* ---------- Horloge murale (elle suit l'heure du bocal) ---------- */
const clockHands = {};
(function wallClock() {
  const c = new THREE.Group();
  part(c, Cyl(5, 5, 0.8, 16), K('#ffffff'), [0, 0, 0], null, [Math.PI / 2, 0, 0]);
  part(c, new THREE.TorusGeometry(5, 0.5, 4, 16), K('#e63946'), [0, 0, 0.3]);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    part(c, Box(0.4, i % 3 ? 0.6 : 1.2, 0.2), K('#222'), [Math.sin(a) * 4, Math.cos(a) * 4, 0.5], null, [
      0,
      0,
      -a,
    ]);
  }
  const mk2 = (len, w) => {
    const p = new THREE.Group();
    p.position.z = 0.6;
    part(p, Box(w, len, 0.2), K('#222'), [0, len / 2, 0]);
    c.add(p);
    return p;
  };
  clockHands.h = mk2(2.6, 0.5);
  clockHands.m = mk2(3.8, 0.3);
  c.position.set(-ROOM.half + 0.5, 34, -18);
  c.rotation.y = Math.PI / 2;
  kitchen.add(c);
})();

/* ---------- Suspension au-dessus de la table ---------- */
(function lamp() {
  part(kitchen, Cyl(0.15, 0.15, 14, 4), K('#222'), [0, ROOM.ceiling - 7, 0]);
  part(kitchen, Cone(6, 4, 8, true), K('#2a9d8f', { side: THREE.DoubleSide }), [0, ROOM.ceiling - 15, 0]);
  part(kitchen, Ico(1.2, 1), KE('#fff3c4', 1.2), [0, ROOM.ceiling - 16.5, 0]);
  const l = new THREE.PointLight('#ffe8b0', 0.35, 70);
  l.position.set(0, ROOM.ceiling - 18, 0);
  kitchen.add(l);
})();

/* ---------- La table (avec ses pieds) et ce qui est posé dessus ---------- */
(function table() {
  const wood = K('#8a5a3b', { roughness: 0.85 }),
    dark = K('#6b4226');
  const top = mk(jitter(new THREE.BoxGeometry(40, 2, 28, 4, 1, 3), 0.08), wood, 0, -1, 0);
  top.castShadow = false;
  kitchen.add(top);
  // Ceinture sous le plateau
  part(kitchen, Box(36, 2, 1), dark, [0, -3, 12.5]);
  part(kitchen, Box(36, 2, 1), dark, [0, -3, -12.5]);
  part(kitchen, Box(1, 2, 24), dark, [17.5, -3, 0]);
  part(kitchen, Box(1, 2, 24), dark, [-17.5, -3, 0]);
  // Quatre pieds légèrement fuselés
  for (const x of [-17.5, 17.5])
    for (const z of [-12, 12])
      part(kitchen, Cyl(1.1, 0.7, -ROOM.floor - 2, 6), dark, [x, (ROOM.floor - 2) / 2, z]);
  // Deux chaises
  for (const [x, z, ry] of [
    [-6, 22, Math.PI],
    [24, -4, -Math.PI / 2],
  ]) {
    const c = new THREE.Group();
    part(c, Box(10, 1.2, 10), wood, [0, -9, 0]);
    for (const dx of [-4.3, 4.3])
      for (const dz of [-4.3, 4.3]) part(c, Box(1, 12.4, 1), dark, [dx, -15.6, dz]);
    part(c, Box(10, 12, 1), wood, [0, -2.4, -4.6]);
    // Barre du dossier légèrement plus grande que le dossier, pour ne pas se superposer à lui
    part(c, Box(10.6, 1.2, 1.5), dark, [0, 3.2, -4.6]);
    c.position.set(x, 0, z);
    c.rotation.y = ry;
    kitchen.add(c);
    cameraBlockers.push(c);
  }
  // Boîte de granulés et plante en pot (sur la table)
  const can = new THREE.Group();
  part(can, Cyl(1.2, 1.2, 2.8, 10), K('#f2c14e'), [0, 1.4, 0]);
  part(can, Cyl(1.22, 1.22, 1, 10), K('#e94f37'), [0, 1.5, 0]);
  part(can, Cyl(1.25, 1.25, 0.2, 10), K('#d9d9d9', { metalness: 0.5, roughness: 0.3 }), [0, 2.9, 0]);
  part(can, Ico(0.08), K('#8b4f2a'), [0.4, 3.05, 0.2]);
  part(can, Ico(0.08), K('#8b4f2a'), [-0.3, 3.05, -0.1]);
  can.position.set(14.5, 0, -4);
  kitchen.add(can);
  const pot = new THREE.Group();
  part(pot, Cyl(1.1, 0.8, 1.6, 8), K('#c4693d'), [0, 0.8, 0]);
  for (let i = 0; i < 7; i++) {
    const l = part(pot, Cone(0.35, 2.4, 4), K(pick(['#3f8f4a', '#58a65c', '#2f6f3a'])), [0, 2.2, 0]);
    l.rotation.set(rnd(-0.6, 0.6), rnd(0, 6), rnd(-0.6, 0.6));
    l.scale.z = 0.3;
  }
  pot.position.set(-15, 0, -5);
  kitchen.add(pot);
  // Un torchon plié
  part(kitchen, Box(6, 0.4, 4), K('#e63946'), [12, 0.2, 8], null, [0, 0.3, 0]);
  part(kitchen, Box(6, 0.42, 0.6), K('#ffffff'), [12, 0.22, 8], null, [0, 0.3, 0]);
})();

// Ombres : seuls les objets proches du bocal en projettent (pour rester léger).
kitchen.traverse(o => {
  if (o.isMesh) {
    o.castShadow = false;
    o.receiveShadow = true;
  }
});

/* ---------- Animation : ciel de la fenêtre, horloge, vapeur ---------- */
Hooks.on('frame', () => {
  const h = hourNow();
  // Ciel : nuit → aube → jour → crépuscule → nuit
  let c;
  if (h < 5 || h >= 21) c = SKY_NIGHT;
  else if (h < 7) c = SKY_NIGHT.clone().lerp(SKY_DUSK, (h - 5) / 2);
  else if (h < 9) c = SKY_DUSK.clone().lerp(SKY_DAY, (h - 7) / 2);
  else if (h < 18) c = SKY_DAY;
  else if (h < 19.5) c = SKY_DAY.clone().lerp(SKY_DUSK, (h - 18) / 1.5);
  else c = SKY_DUSK.clone().lerp(SKY_NIGHT, (h - 19.5) / 1.5);
  windowSky.color.copy(c);
  windowSky.emissive.copy(c);
  const minutes = h * 60;
  clockHands.m.rotation.z = -((minutes % 60) / 60) * Math.PI * 2;
  clockHands.h.rotation.z = -((h % 12) / 12) * Math.PI * 2;
  const pp = kitchen.userData.potPos;
  kitchen.userData.steam.forEach((s, i) => {
    const u = (simTime * 0.15 + s.userData.ph) % 1;
    s.position.set(pp.x + Math.sin(u * 6 + i) * 1.2, pp.y + u * 12, pp.z + Math.cos(u * 5 + i) * 0.8);
    s.scale.setScalar(0.6 + u * 1.4);
    s.material.opacity = 0.5 * (1 - u);
  });
});
