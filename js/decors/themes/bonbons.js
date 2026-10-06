/*
 * Décor « Pays des bonbons ».
 * water/sand/bg/sky/ground = couleurs, amp = relief du sable, build() = objets du décor.
 * D.hide reçoit les cachettes (cache-cache), D.ticks les animations du décor.
 */
'use strict';
THEMES.push({
  name: 'Pays des bonbons',
  water: '#8fd8ea',
  sand: '#f6bfd1',
  bg: '#3a2445',
  sky: '#ffe3f1',
  ground: '#b56c8a',
  amp: 0.9,
  build(g, D) {
    const off = rnd(0, 6.28),
      pal = ['#ff006e', '#ffbe0b', '#3a86ff', '#8338ec', '#06d6a0', '#fb5607'];
    for (let i = 0; i < 4; i++) {
      const l = new THREE.Group(),
        h = rnd(2.6, 4.2),
        c1 = pick(pal);
      part(l, Cyl(0.07, 0.07, h, 5), M('#ffffff'), [0, h / 2, 0]);
      part(l, Cyl(0.8, 0.8, 0.2, 10), M(c1), [0, h + 0.6, 0], null, [Math.PI / 2, 0, 0]);
      part(l, new THREE.TorusGeometry(0.45, 0.1, 4, 10), M('#ffffff'), [0, h + 0.6, 0.08]);
      part(l, new THREE.TorusGeometry(0.2, 0.08, 4, 8), M(pick(pal)), [0, h + 0.6, 0.1]);
      const a = off + i * 1.6;
      put(g, l, a, 6.6, 0.9);
      face(l, h);
      D.hide.push(behind(a, 6.6));
      D.ticks.push(t => (l.rotation.z = Math.sin(t * 0.6 + i) * 0.04));
    }
    for (let i = 0; i < 3; i++) {
      const c = new THREE.Group();
      for (let k = 0; k < 6; k++)
        part(c, Cyl(0.13, 0.13, 0.35, 6), M(k % 2 ? '#ffffff' : '#e63946'), [0, 0.18 + k * 0.35, 0]);
      part(c, new THREE.TorusGeometry(0.35, 0.13, 6, 8, Math.PI), M('#e63946'), [-0.35, 2.1, 0]);
      put(g, c, off + 0.8 + i * 1.6, rnd(5.5, 7.2), 0.9);
      c.rotation.y = rnd(0, 6);
    }
    for (let i = 0; i < 7; i++) {
      const col = pick(pal);
      const gd = mk(Cone(0.45, 0.65, 6), M(col, { emissive: col, emissiveIntensity: 0.15, roughness: 0.4 }));
      put(g, gd, rnd(0, 6.28), rnd(3.6, 7.4), 1.25);
    }
    const cup = new THREE.Group();
    part(cup, Cyl(0.9, 0.7, 1, 10), M('#f4a261'), [0, 0.5, 0]);
    part(cup, jitter(Ico(1, 0), 0.1), M('#ff8fab'), [0, 1.4, 0], [1, 0.75, 1]);
    part(cup, Ico(0.22), M('#d00000'), [0, 2.1, 0]);
    for (let i = 0; i < 10; i++)
      part(cup, Box(0.06, 0.16, 0.06), M(pick(pal)), [rnd(-0.6, 0.6), 1.75, rnd(-0.6, 0.6)], null, [
        rnd(0, 3),
        rnd(0, 3),
        0,
      ]);
    const ca = off + 0.8 * 3.3;
    put(g, cup, ca, 5.8, 0.9);
    D.hide.push(behind(ca, 5.8));
    const dn = new THREE.Group();
    part(dn, new THREE.TorusGeometry(0.7, 0.32, 6, 10), M('#c68b59'), null, null, [Math.PI / 2, 0, 0]);
    part(
      dn,
      new THREE.TorusGeometry(0.7, 0.25, 4, 10),
      M('#ff70a6'),
      [0, 0.14, 0],
      [1, 1, 0.6],
      [Math.PI / 2, 0, 0],
    );
    put(g, dn, off + 4.1, 4.8, 1.3);
    for (let i = 0; i < 6; i++) {
      const cl = new THREE.Group();
      for (let k = 0; k < 4; k++)
        part(cl, Ico(rnd(0.35, 0.6), 0), M('#fff0f6', { roughness: 1 }), [
          rnd(-0.6, 0.6),
          rnd(-0.2, 0.2),
          rnd(-0.4, 0.4),
        ]);
      cl.position.set(rnd(-5, 5), rnd(8.5, 10.3), rnd(-5, 5));
      clampInside(cl.position, 2);
      g.add(cl);
      const ph = rnd(0, 6);
      D.ticks.push(t => (cl.position.y += Math.sin(t + ph) * 0.002));
    }
  },
});
