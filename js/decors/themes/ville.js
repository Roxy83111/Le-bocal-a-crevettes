/*
 * Décor « Ville engloutie » : petits immeubles aux fenêtres allumées, lampadaires, feu tricolore
 * qui change de couleur, voiture couverte d'algues et bus scolaire couché sur le côté.
 * water/sand/bg/sky/ground = couleurs, amp = relief du sable, build() = objets du décor.
 * D.hide reçoit les cachettes (cache-cache), D.ticks les animations du décor.
 */
'use strict';
THEMES.push({
  name: 'Ville engloutie',
  water: '#2b6c7f',
  sand: '#7d8a8f',
  bg: '#0c1c26',
  sky: '#cde8f0',
  ground: '#3a4a50',
  amp: 0.5,
  build(g, D) {
    const off = rnd(0, 6.28);
    const algae = M('#4f7942');

    // Petite rue : bande d'asphalte avec pointillés
    const road = new THREE.Group();
    part(road, Box(11, 0.08, 1.8), M('#3d4246'), [0, 0, 0]);
    for (let i = 0; i < 6; i++) part(road, Box(0.8, 0.09, 0.12), M('#f1faee'), [-4.5 + i * 1.8, 0.01, 0]);
    road.position.y = 1.05;
    road.rotation.y = -off + Math.PI / 2;
    g.add(road);

    // Immeubles de hauteurs différentes, fenêtres qui s'allument et s'éteignent
    const windows = [];
    for (let i = 0; i < 4; i++) {
      const b = new THREE.Group();
      const h = rnd(3, 6.5),
        w = rnd(1.4, 2);
      part(b, jitter(Box(w, h, w), 0.05), M(pick(['#a5a58d', '#b7b7a4', '#8d99ae', '#c9ada7'])), [
        0,
        h / 2,
        0,
      ]);
      part(b, Box(w + 0.15, 0.15, w + 0.15), M('#6c757d'), [0, h, 0]);
      for (let y = 0.8; y < h - 0.4; y += 0.9)
        for (const x of [-w / 4, w / 4]) {
          const lit = Math.random() < 0.5;
          const wm = lit ? E('#ffd166', 0.8) : M('#22333b');
          windows.push(part(b, Box(0.3, 0.45, 0.05), wm, [x, y, w / 2 + 0.03]));
        }
      part(b, Ico(rnd(0.3, 0.5), 0), algae, [w / 2 - 0.1, h * 0.3, w / 2], [1, 1.6, 0.4]);
      const a = off + 1 + i * 0.7,
        r = rnd(6.2, 7);
      put(g, b, a, r, 0.9);
      face(b, h / 2);
      D.hide.push(behind(a, r));
    }
    D.ticks.push(t => {
      if (Math.random() < 0.02) {
        const wnd = pick(windows);
        if (wnd.material.emissive)
          wnd.material.emissiveIntensity = wnd.material.emissiveIntensity > 0.3 ? 0.05 : 0.8;
      }
    });

    // Lampadaires
    for (let i = 0; i < 3; i++) {
      const l = new THREE.Group();
      part(l, Cyl(0.06, 0.08, 3.4, 5), M('#2b2d42'), [0, 1.7, 0]);
      part(l, Box(0.7, 0.08, 0.08), M('#2b2d42'), [0.3, 3.35, 0]);
      part(l, Cone(0.22, 0.25, 6), M('#2b2d42'), [0.6, 3.25, 0]);
      part(l, Ico(0.1, 0), E('#fff3b0', 1.2), [0.6, 3.1, 0]);
      put(g, l, off - 0.9 - i * 0.9, 5.2, 0.9);
      l.rotation.y = rnd(0, 6);
    }

    // Feu tricolore
    const tl = new THREE.Group();
    part(tl, Cyl(0.07, 0.08, 3, 5), M('#2b2d42'), [0, 1.5, 0]);
    part(tl, Box(0.45, 1.2, 0.35), M('#1b1b22'), [0, 3.4, 0]);
    const lights = ['#e63946', '#ffb703', '#06d6a0'].map((c, k) =>
      part(tl, Cyl(0.13, 0.13, 0.08, 8), E(c, 0.1), [0, 3.75 - k * 0.36, 0.2], null, [Math.PI / 2, 0, 0]),
    );
    const ta = off - 3.6;
    put(g, tl, ta, 5.6, 0.9);
    face(tl, 3);
    D.ticks.push(t => {
      const k = Math.floor(t / 2.5) % 3;
      lights.forEach((l, i) => (l.material.emissiveIntensity = i === 2 - k ? 1.6 : 0.08));
    });

    // Voiture couverte d'algues
    const car = new THREE.Group();
    part(car, Box(1.8, 0.5, 0.9), M('#e63946'), [0, 0.45, 0]);
    part(car, Box(1, 0.45, 0.85), M('#c1121f'), [-0.1, 0.9, 0]);
    part(car, Box(0.95, 0.35, 0.87), M('#a8dadc', { transparent: true, opacity: 0.6 }), [-0.1, 0.9, 0]);
    for (const x of [-0.6, 0.6])
      for (const z of [-0.45, 0.45])
        part(car, Cyl(0.22, 0.22, 0.15, 8), M('#111'), [x, 0.22, z], null, [Math.PI / 2, 0, 0]);
    for (let k = 0; k < 4; k++)
      part(car, Ico(0.2, 0), algae, [rnd(-0.8, 0.8), 1.1, rnd(-0.3, 0.3)], [1, 0.5, 1]);
    const ca = off + 3.9;
    put(g, car, ca, 4.8, 0.95);
    car.rotation.set(0, rnd(0, 6), 0.1);
    D.hide.push(behind(ca, 4.8));

    // Bus scolaire couché sur le côté
    const bus = new THREE.Group();
    part(bus, Box(3.4, 1.3, 1.2), M('#ffb703'), [0, 0.65, 0]);
    for (let i = 0; i < 5; i++) part(bus, Box(0.45, 0.4, 0.05), M('#22333b'), [-1.3 + i * 0.6, 0.9, 0.62]);
    part(bus, Box(3.42, 0.1, 1.22), M('#1b1b22'), [0, 0.4, 0]);
    for (const x of [-1.1, 1.1])
      part(bus, Cyl(0.3, 0.3, 0.2, 8), M('#111'), [x, 0.15, 0.62], null, [Math.PI / 2, 0, 0]);
    for (let k = 0; k < 5; k++)
      part(bus, Ico(0.25, 0), algae, [rnd(-1.5, 1.5), 1.35, rnd(-0.4, 0.4)], [1, 0.5, 1]);
    const bsa = off - 2.2;
    put(g, bus, bsa, 6.6, 1.5);
    bus.rotation.set(Math.PI / 2 - 0.15, -bsa, 0);
    D.hide.push(behind(bsa, 6.6));

    // Panneau « STOP » tordu
    const sign = new THREE.Group();
    part(sign, Cyl(0.04, 0.04, 2, 4), M('#adb5bd'), [0, 1, 0]);
    part(sign, Cyl(0.35, 0.35, 0.05, 8), M('#d00000'), [0, 2.1, 0], null, [Math.PI / 2, 0, Math.PI / 8]);
    put(g, sign, off + 2.8, 4.4, 0.9);
    sign.rotation.set(0.25, rnd(0, 6), 0.15);

    for (let i = 0; i < 4; i++) {
      const s = seaweed(rnd(2, 4), M('#40916c'));
      put(g, s, rnd(0, 6.28), rnd(4, 7.4));
      D.ticks.push(t => sway(s, t));
    }
  },
});
