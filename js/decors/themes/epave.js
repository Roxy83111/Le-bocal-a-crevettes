/*
 * Décor « Épave du Capitaine Pince ».
 * water/sand/bg/sky/ground = couleurs, amp = relief du sable, build() = objets du décor.
 * D.hide reçoit les cachettes (cache-cache), D.ticks les animations du décor.
 */
'use strict';
THEMES.push({
  name: 'Épave du Capitaine Pince',
  water: '#2f7d8f',
  sand: '#c7b184',
  bg: '#0c2733',
  sky: '#b5e3ee',
  ground: '#5a4a30',
  amp: 1.1,
  build(g, D) {
    const off = rnd(0, 6.28),
      wood = M('#6b4226'),
      dark = M('#4a2c17');
    const ship = new THREE.Group();
    part(ship, jitter(new THREE.BoxGeometry(4.2, 1.4, 1.7, 3, 1, 1), 0.08), wood, [0, 0.5, 0]);
    part(ship, Cone(0.95, 1.4, 4), wood, [2.75, 0.5, 0], null, [Math.PI / 4, 0, -Math.PI / 2]);
    part(ship, Box(4, 0.12, 1.5), dark, [0, 1.22, 0]);
    part(ship, Cyl(0.1, 0.13, 3.6, 5), dark, [-0.3, 2.9, 0], null, [0, 0, 0.35]);
    const sail = part(
      ship,
      jitter(new THREE.PlaneGeometry(1.5, 1.8, 3, 3), 0.12),
      M('#e8dcc0', { side: THREE.DoubleSide }),
      [0.15, 3.1, 0.15],
      null,
      [0, 0, 0.35],
    );
    for (let i = 0; i < 3; i++)
      part(ship, Cyl(0.14, 0.14, 0.1, 6), M('#222'), [-1.2 + i * 1.1, 0.6, 0.86], null, [Math.PI / 2, 0, 0]);
    put(g, ship, off, 5.4, 0.75);
    ship.rotation.set(0.08, -off + Math.PI / 2, 0.12);
    D.hide.push(behind(off, 5.4), V(Math.cos(off) * 5.4, 2, Math.sin(off) * 5.4));
    D.ticks.push(t => (sail.rotation.y = Math.sin(t * 0.8) * 0.15));
    const chest = new THREE.Group();
    part(chest, Box(1, 0.6, 0.65), M('#8a5a2b'), [0, 0.3, 0]);
    part(chest, Box(1.04, 0.08, 0.68), M('#f2c14e', { metalness: 0.6 }), [0, 0.45, 0]);
    const lid = new THREE.Group();
    lid.position.set(0, 0.6, -0.32);
    lid.rotation.x = -1.1;
    part(lid, Box(1, 0.18, 0.65), M('#8a5a2b'), [0, 0.09, 0.32]);
    chest.add(lid);
    for (let i = 0; i < 9; i++)
      part(
        chest,
        Cyl(0.09, 0.09, 0.03, 6),
        E('#ffd23f', 0.5, { metalness: 0.7 }),
        [rnd(-0.35, 0.35), 0.62 + rnd(0, 0.08), rnd(-0.2, 0.2)],
        null,
        [rnd(-0.5, 0.5), 0, rnd(-0.5, 0.5)],
      );
    part(chest, Ico(0.1), E('#e63946', 0.6), [0.2, 0.7, 0]);
    part(chest, Ico(0.09), E('#06d6a0', 0.6), [-0.2, 0.7, 0.1]);
    const ca = off + 2.3;
    put(g, chest, ca, 5.6, 1);
    face(chest);
    D.hide.push(behind(ca, 5.6));
    D.ticks.push((t, dt) => {
      if (Math.random() < dt * 0.5) emit(V(Math.cos(ca) * 5.6, 1.9, Math.sin(ca) * 5.6), '✨', { life: 1.2 });
    });
    for (let i = 0; i < 3; i++) {
      const b = new THREE.Group();
      part(b, Cyl(0.42, 0.42, 0.95, 8), wood, [0, 0.47, 0]);
      part(b, Cyl(0.44, 0.44, 0.08, 8), dark, [0, 0.2, 0]);
      part(b, Cyl(0.44, 0.44, 0.08, 8), dark, [0, 0.75, 0]);
      const a = off + 3.4 + i * 0.35;
      put(g, b, a, 6.6 - i * 0.4, 0.9);
      if (i === 2) {
        b.rotation.z = Math.PI / 2;
        b.position.y = 1.3;
      }
    }
    D.hide.push(behind(off + 3.6, 6.4));
    const anc = new THREE.Group(),
      iron = M('#4f5b62', { metalness: 0.5, roughness: 0.5 });
    part(anc, Box(0.16, 1.8, 0.16), iron, [0, 0.9, 0]);
    part(anc, Box(1, 0.14, 0.14), iron, [0, 1.5, 0]);
    part(anc, new THREE.TorusGeometry(0.6, 0.09, 4, 8, Math.PI), iron, [0, 0.55, 0], null, [0, 0, Math.PI]);
    part(anc, new THREE.TorusGeometry(0.18, 0.05, 4, 6), iron, [0, 1.9, 0]);
    put(g, anc, off + 4.7, 6, 0.9);
    anc.rotation.set(0, rnd(0, 3), 0.5);
    for (let i = 0; i < 4; i++) put(g, rock(rnd(0.4, 0.8), '#6e6a60'), rnd(0, 6.28), rnd(4, 7.4), 1);
    for (let i = 0; i < 4; i++) {
      const s = seaweed(rnd(2, 3.8), M('#2d6a4f'));
      put(g, s, off + 1 + i * 1.4, rnd(5, 7.4));
      D.ticks.push(t => sway(s, t));
    }
  },
});
